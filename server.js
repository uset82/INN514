/* The Canner Grokbot server: static files (S1), health and ask (S2), speak and limits (S3). */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = __dirname;
const AUDIO = /^\/site\/audio\/([A-Z0-9]+-\d{2}\.mp3)$/;
const PLAIN = { "Content-Type": "text/plain; charset=utf-8" };
const JSONH = { "Content-Type": "application/json" };

/* ---------- startup: the course data, the catalog facts and the prompt lines (S2) ---------- */
const DB = (() => {
  try {
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    const data = JSON.parse(/const DATA = (\{.*?\});\r?\n/s.exec(html)[1]);
    const lectures = {};
    for (const f of fs.readdirSync(path.join(ROOT, "site", "data"))) {
      if (f.endsWith(".json")) lectures[f.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(ROOT, "site", "data", f), "utf8"));
    }
    const tpl = fs.readFileSync(path.join(ROOT, "site", "template.html"), "utf8");
    const rules = /^const RULES = (".*");$/m.exec(tpl);
    const noQuote = /^const NO_QUOTE = (".*");$/m.exec(tpl);
    if (!rules || !noQuote) throw new Error("RULES or NO_QUOTE missing from site/template.html");
    return {
      catalog: data.catalog, readings: data.readings || [], lectures,
      rules: JSON.parse(rules[1]), noQuote: JSON.parse(noQuote[1]),
    };
  } catch (e) {
    console.error("startup failed: " + e.message);
    process.exit(1);
  }
})();

/* The same where line as chapterContext on the page. */
const entryOf = (id) => DB.catalog.find((c) => c.id === id) || DB.readings.find((r) => r.id === id);
const isReading = (id) => DB.readings.some((r) => r.id === id);
const className = (c) => (isReading(c.id) ? "Paper " + c.num : c.num === "Bonus" ? "Bonus class" : "Class " + c.num);
const pagesText = (p) => (p === "the whole paper" ? "The whole paper" : (/[–,]/.test(p) ? "Pages " : "Page ") + p);
const slideText = (sl) => {
  if (!sl.length) return "";
  const runs = []; let a = sl[0], b = sl[0];
  for (const x of sl.slice(1)) { if (x === b + 1) b = x; else { runs.push([a, b]); a = b = x; } }
  runs.push([a, b]);
  return (sl.length > 1 ? "Slides " : "Slide ") + runs.map(([x, y]) => (x === y ? x : x + "–" + y)).join(", ");
};
function contextFor(id, i) {
  const ch = DB.lectures[id].chapters[i], c = entryOf(id);
  const where = isReading(id)
    ? `${className(c)}, chapter ${ch.n}: ${ch.title}. ${c.authors} (${c.year}). ${pagesText(ch.pages)}.`
    : `${className(c)}, chapter ${ch.n}: ${ch.title}. ${c.teacher}. ${slideText(ch.slides)}.`;
  const body = ch.paragraphs.map((p, k) => (ch.labels && ch.labels[k] ? ch.labels[k] + ": " : "") + p).join("\n\n");
  return DB.rules + (id === "P02" ? DB.noQuote : "") + "\n\nChapter: " + where + "\n---\n" + body + "\n---";
}

/* ---------- the OpenRouter call (S2) ---------- */
const BASE = process.env.OPENROUTER_BASE || "https://openrouter.ai/api/v1";
const KEY = process.env.OPENROUTER_API_KEY || "";
const MODELS = (process.env.GROKBOT_ANSWER_MODELS || "google/gemma-4-31b-it:free,nvidia/nemotron-3-super-120b-a12b:free").split(",").map((s) => s.trim()).filter(Boolean);
const VOICE_EN = process.env.GROKBOT_VOICE_MODEL_EN || "deepgram/flux-tts:free";
const VOICE_ES = process.env.GROKBOT_VOICE_MODEL_ES || "fish-audio/s2.1-pro-free:free";

async function askUpstream(messages) {
  let last429 = false;
  for (const model of MODELS) {
    try {
      const r = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json",
          "HTTP-Referer": "https://inn514.canner.app", "X-Title": "INN514 Course Companion",
        },
        body: JSON.stringify({ model, messages, max_tokens: 450, temperature: 0.3 }),
        signal: AbortSignal.timeout(40000),
      });
      if (r.ok) {
        const j = await r.json();
        return { text: j.choices[0].message.content.trim() };
      }
      last429 = r.status === 429;
      if (r.status !== 429 && r.status < 500) break;   // only a 429, a 5xx or a timeout tries the next model
    } catch (e) { last429 = false; }
  }
  return { error: last429 ? 429 : 502 };
}

/* ---------- speak: the voice call (S3) ---------- */
async function speakUpstream(text, lang) {
  const esVoice = process.env.GROKBOT_VOICE_ES;    // default: leave voice out, the provider uses its own
  const tryModel = async (model, voice) => {
    const body = { model, input: text, response_format: "mp3" };
    if (voice) body.voice = voice;
    const r = await fetch(`${BASE}/audio/speech`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json",
        "HTTP-Referer": "https://inn514.canner.app", "X-Title": "INN514 Course Companion",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(40000),
    });
    if (!r.ok) return null;
    return Buffer.from(await r.arrayBuffer());
  };
  const first = lang === "es-ES"
    ? await tryModel(VOICE_ES, esVoice)
    : await tryModel(VOICE_EN, process.env.GROKBOT_VOICE_EN || "flux-alexis-en");
  if (first) return first;
  if (lang !== "es-ES") return tryModel(VOICE_ES, esVoice);   // the English model falls back to Fish once
  return null;
}

/* ---------- limits (S3): in memory, reset on restart ---------- */
const num = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : d; };
const ipCalls = new Map();             // ip -> timestamps of admitted calls
const badPasses = new Map();           // ip -> timestamps of failed passcode attempts
const dayCount = { key: "", asks: 0, speaks: 0 };
/* Canner's proxy appends the real client address to X-Forwarded-For, so the last entry is the
   trustworthy one; earlier entries are whatever the client sent. */
function clientIp(req) {
  const hops = (req.headers["x-forwarded-for"] || "").split(",").map((s) => s.trim()).filter(Boolean);
  return hops.length ? hops[hops.length - 1] : req.socket.remoteAddress;
}
/* Passcode guessing: after GROKBOT_BAD_PASS_PER_10MIN (default 10) failures in 10 minutes, an
   address gets 429 even with the right passcode, until the window passes. */
function guessingLocked(req) {
  const ip = clientIp(req), now = Date.now();
  const recent = (badPasses.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  badPasses.set(ip, recent);
  return recent.length >= num(process.env.GROKBOT_BAD_PASS_PER_10MIN, 10);
}
function noteBadPass(req) {
  const ip = clientIp(req);
  badPasses.set(ip, [...(badPasses.get(ip) || []), Date.now()]);
}
function limitsOk(req, kind) {
  const ip = clientIp(req);
  const now = Date.now();
  const recent = (ipCalls.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= num(process.env.GROKBOT_RATE_PER_10MIN, 30)) { ipCalls.set(ip, recent); return false; }
  const key = new Date().toISOString().slice(0, 10);        // UTC day
  if (dayCount.key !== key) { dayCount.key = key; dayCount.asks = 0; dayCount.speaks = 0; }
  if (kind === "ask" ? dayCount.asks >= num(process.env.GROKBOT_ASKS_PER_DAY, 150)
                     : dayCount.speaks >= num(process.env.GROKBOT_SPEAKS_PER_DAY, 300)) {
    ipCalls.set(ip, recent);
    return false;
  }
  recent.push(now);
  ipCalls.set(ip, recent);
  if (kind === "ask") dayCount.asks++; else dayCount.speaks++;
  return true;
}

/* ---------- request plumbing ---------- */
function log(req, status, ms) {
  console.log(`${req.method} ${req.url} ${status} ${ms}ms`);
}
function passcodeOk(req) {
  const want = process.env.GROKBOT_PASSCODE;
  const got = req.headers["x-grokbot-passcode"];
  if (!want || !got) return false;
  const a = crypto.createHash("sha256").update(String(got)).digest();
  const b = crypto.createHash("sha256").update(String(want)).digest();
  return crypto.timingSafeEqual(a, b);
}
function readBody(req, cb) {           // cb("big") or cb(null, buffer)
  const chunks = [];
  let size = 0, over = false;
  req.on("data", (c) => {
    if (over) return;
    size += c.length;
    if (size > 16 * 1024) { over = true; cb("big"); return; }
    chunks.push(c);
  });
  req.on("end", () => { if (!over) cb(null, Buffer.concat(chunks)); });
  req.on("error", () => { if (!over) { over = true; cb("big"); } });
}

const server = http.createServer((req, res) => {
  const start = Date.now();
  const p = req.url.split("?")[0];
  const done = (status, headers, body) => {
    log(req, status, Date.now() - start);
    res.writeHead(status, Object.assign({ "X-Content-Type-Options": "nosniff" }, headers));
    res.end(body);
  };
  const notFound = () => done(404, PLAIN, "Not found");

  if (req.method === "POST" && p === "/api/ask") {
    if (guessingLocked(req)) return done(429, JSONH, JSON.stringify({ error: "rate_limited" }));
    if (!passcodeOk(req)) { noteBadPass(req); return done(401, JSONH, JSON.stringify({ error: "passcode" })); }
    if (!limitsOk(req, "ask")) return done(429, JSONH, JSON.stringify({ error: "rate_limited" }));
    return readBody(req, (err, raw) => {
      if (err) return done(413, JSONH, JSON.stringify({ error: "bad_request" }));
      let body;
      try { body = JSON.parse(raw.toString("utf8")); } catch (e) { return done(400, JSONH, JSON.stringify({ error: "bad_request" })); }
      const bad = () => done(400, JSONH, JSON.stringify({ error: "bad_request" }));
      const id = body.id, chapter = body.chapter, question = body.question, history = body.history;
      if (typeof id !== "string" || !DB.lectures[id]) return bad();
      const L = DB.lectures[id];
      if (!Number.isInteger(chapter) || chapter < 0 || chapter >= L.chapters.length) return bad();
      if (typeof question !== "string" || question.length < 1 || question.length > 500) return bad();
      if (!Array.isArray(history) || history.length > 6) return bad();
      for (const h of history) {
        if (!h || typeof h !== "object" || Array.isArray(h) || (h.role !== "user" && h.role !== "assistant")) return bad();
        if (typeof h.content !== "string" || h.content.length < 1 || h.content.length > 1500) return bad();
      }
      const messages = [
        { role: "user", content: contextFor(id, chapter) },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: question },
      ];
      askUpstream(messages).then((out) => {
        if (out.error) return done(out.error, JSONH, JSON.stringify({ error: out.error === 429 ? "rate_limited" : "upstream" }));
        done(200, JSONH, JSON.stringify({ text: out.text }));
      }).catch(() => done(502, JSONH, JSON.stringify({ error: "upstream" })));
    });
  }

  if (req.method === "POST" && p === "/api/speak") {
    if (guessingLocked(req)) return done(429, JSONH, JSON.stringify({ error: "rate_limited" }));
    if (!passcodeOk(req)) { noteBadPass(req); return done(401, JSONH, JSON.stringify({ error: "passcode" })); }
    if (!limitsOk(req, "speak")) return done(429, JSONH, JSON.stringify({ error: "rate_limited" }));
    return readBody(req, (err, raw) => {
      if (err) return done(413, JSONH, JSON.stringify({ error: "bad_request" }));
      let body;
      try { body = JSON.parse(raw.toString("utf8")); } catch (e) { return done(400, JSONH, JSON.stringify({ error: "bad_request" })); }
      const text = body.text;
      if (typeof text !== "string" || text.length < 1 || text.length > 1500) return done(400, JSONH, JSON.stringify({ error: "bad_request" }));
      const lang = body.lang === "es-ES" ? "es-ES" : "en-GB";   // anything else counts as en-GB
      speakUpstream(text, lang).then((buf) => {
        if (!buf) return done(502, JSONH, JSON.stringify({ error: "upstream" }));
        done(200, { "Content-Type": "audio/mpeg" }, buf);
      }).catch(() => done(502, JSONH, JSON.stringify({ error: "upstream" })));
    });
  }

  if (req.method !== "GET") return notFound();
  if (p === "/" || p === "/index.html") {
    try {
      return done(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" },
        fs.readFileSync(path.join(ROOT, "index.html")));
    } catch (e) { return notFound(); }
  }
  if (p === "/robots.txt") {
    try {
      return done(200, { "Content-Type": "text/plain; charset=utf-8" }, fs.readFileSync(path.join(ROOT, "robots.txt")));
    } catch (e) { return notFound(); }
  }
  const audio = p.match(AUDIO);
  if (audio) {
    let buf;
    try { buf = fs.readFileSync(path.join(ROOT, "site", "audio", audio[1])); }
    catch (e) { return notFound(); }
    const size = buf.length;
    const base = { "Content-Type": "audio/mpeg", "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=86400" };
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
    if (m && m[1] !== "") {                       // bytes=a-b or bytes=a-
      const a = Number(m[1]);
      if (a >= size) return done(416, {}, "");
      const b = m[2] === "" || Number(m[2]) > size - 1 ? size - 1 : Number(m[2]);
      if (b < a) return done(416, {}, "");
      return done(206, Object.assign({}, base, {
        "Content-Range": `bytes ${a}-${b}/${size}`, "Content-Length": String(b - a + 1),
      }), buf.subarray(a, b + 1));
    }
    return done(200, Object.assign({}, base, { "Content-Length": String(size) }), buf);
  }
  if (p === "/api/health") {
    return done(200, JSONH, JSON.stringify({
      ok: true,
      ask: !!(KEY && process.env.GROKBOT_PASSCODE),
      // Whether each setting is present (never its value), so a missing one can be spotted from outside.
      key: !!KEY, passcode: !!process.env.GROKBOT_PASSCODE,
      // The NAMES (never the values) of settings that look like ours, to catch a typo or a stray space.
      seen: Object.keys(process.env).filter((k) => /openrouter|grokbot/i.test(k)).map((k) => JSON.stringify(k)).sort(),
      voices: { en: VOICE_EN, es: VOICE_ES },
    }));
  }
  return notFound();
});
server.listen(process.env.PORT || 3000);
