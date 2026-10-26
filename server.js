/* The Canner Grokbot server: static files (S1), health and ask (S2), speak and limits (S3). */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = __dirname;
/* Some hosts deliver settings as a .env file next to the app instead of in the environment.
   Read only our own settings from it, and never override one the environment already has. */
const DOTENV = fs.existsSync(path.join(ROOT, ".env"));
if (DOTENV) {
  for (const line of fs.readFileSync(path.join(ROOT, ".env"), "utf8").split(/\r?\n/)) {
    const m = /^\s*(?:export\s+)?((?:OPENROUTER|GROKBOT)_[A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
}
const AUDIO =/^\/site\/audio\/([A-Z0-9]+-\d{2}\.mp3)$/;
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
    const noQuoteCourse = /^const NO_QUOTE_COURSE = (".*");$/m.exec(tpl);
    const pickRules = /^const PICK_RULES = (".*");$/m.exec(tpl);
    const courseRules = /^const COURSE_RULES = (".*");$/m.exec(tpl);
    const aboutText = /^const ABOUT_TEXT = (".*");$/m.exec(tpl);
    if (!rules || !noQuote || !noQuoteCourse || !pickRules || !courseRules || !aboutText)
      throw new Error("RULES, NO_QUOTE, NO_QUOTE_COURSE, PICK_RULES, COURSE_RULES or ABOUT_TEXT missing from site/template.html");
    return {
      catalog: data.catalog, readings: data.readings || [], lectures, sessions: data.sessions || [],
      rules: JSON.parse(rules[1]), noQuote: JSON.parse(noQuote[1]), noQuoteCourse: JSON.parse(noQuoteCourse[1]),
      pickRules: JSON.parse(pickRules[1]), courseRules: JSON.parse(courseRules[1]), aboutText: JSON.parse(aboutText[1]),
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
function blockFor(id, i) {
  const ch = DB.lectures[id].chapters[i], c = entryOf(id);
  const where = isReading(id)
    ? `${className(c)}, chapter ${ch.n}: ${ch.title}. ${c.authors} (${c.year}). ${pagesText(ch.pages)}.`
    : `${className(c)}, chapter ${ch.n}: ${ch.title}. ${c.teacher}. ${slideText(ch.slides)}.`;
  const body = ch.paragraphs.map((p, k) => (ch.labels && ch.labels[k] ? ch.labels[k] + ": " : "") + p).join("\n\n");
  return "Chapter: " + where + "\n---\n" + body + "\n---";
}
function contextFor(id, i) {
  return DB.rules + (id === "P02" ? DB.noQuote : "") + DB.noQuoteCourse + "\n\n" + blockFor(id, i)
    + "\n\nOverview of the whole course:\n" + COURSE_OVERVIEW;
}
/* The course index for /api/course's pick step: H.4's lines, classes then papers, built once. */
const COURSE_INDEX = (() => {
  const lines = [];
  for (const c of DB.catalog) for (const ch of DB.lectures[c.id].chapters)
    lines.push(`${c.id} ${ch.n}: ${className(c)}, ${c.title}; chapter ${ch.n}: ${ch.title}`);
  for (const c of DB.readings) for (const ch of DB.lectures[c.id].chapters)
    lines.push(`${c.id} ${ch.n}: ${className(c)}, ${c.authors} (${c.year}), ${c.title}; chapter ${ch.n}: ${ch.title}`);
  return lines.join("\n");
})();
/* The same overview text as courseOverview on the page, built once. */
const COURSE_OVERVIEW = (() => {
  const chs = (id) => DB.lectures[id].chapters.map((ch) => ch.n + " " + ch.title).join("; ");
  const rows = DB.catalog.map((c) => [c.num === "Bonus" ? 99 : +c.num,
    `- ${className(c)} (${c.when}), taught by ${c.teacher}: ${c.title}.`
    + (c.readings && c.readings.length ? ` Its papers: ${c.readings.map((r) => className(entryOf(r))).join(", ")}.` : "")
    + (DB.lectures[c.id] ? ` Chapters: ${chs(c.id)}.` : "")]);
  const ss = DB.sessions || [];
  if (ss.length) rows.push([7, `- Sessions ${ss.map((s) => s.num).join(" and ")} (${ss.map((s) => s.when).join("; ")}), taught by ${[...new Set(ss.map((s) => s.teacher))].join(" and ")}: ${ss[0].title}.`]);
  rows.sort((a, b) => a[0] - b[0]);
  const lines = ["About the course: " + DB.aboutText, "The classes, in course order:", ...rows.map((r) => r[1]), "The papers:"];
  for (const r of DB.readings) {
    const L = DB.lectures[r.id];
    lines.push(`- ${className(r)}: ${r.authors} (${r.year}), "${r.title}", ${r.source}. For ${r.lectures.map((l) => className(entryOf(l)).toLowerCase()).join(" and ")}.`
      + (L ? ` In brief: ${L.chapters[0].paragraphs[0]} Chapters: ${chs(r.id)}.` : ""));
  }
  return lines.join("\n");
})();
function cleanPicks(arr) {
  const out = [];
  for (const p of (Array.isArray(arr) ? arr : [])) {
    if (!p || typeof p.id !== "string" || !DB.lectures[p.id]) continue;
    if (!Number.isInteger(p.chapter) || !DB.lectures[p.id].chapters.some((ch) => ch.n === p.chapter)) continue;
    if (out.some((q) => q.id === p.id && q.chapter === p.chapter)) continue;
    out.push({ id: p.id, chapter: p.chapter });
    if (out.length === 3) break;
  }
  return out;
}
function mergePicks(picks, hits) {   // the model's picks first, then the search's, at most 4
  const out = [];
  for (const p of [...picks, ...hits]) if (out.length < 4 && !out.some((q) => q.id === p.id && q.chapter === p.chapter)) out.push(p);
  return out;
}

/* ---------- the OpenRouter call (S2) ---------- */
const BASE = process.env.OPENROUTER_BASE || "https://openrouter.ai/api/v1";
const KEY = process.env.OPENROUTER_API_KEY || "";
const MODELS = (process.env.GROKBOT_ANSWER_MODELS || "openrouter/free,nvidia/nemotron-3.5-super-vl:free").split(",").map((s) => s.trim()).filter(Boolean);
const VOICE_EN = process.env.GROKBOT_VOICE_MODEL_EN || "fish-audio/s2.1-pro-free:free";
const VOICE_ES = process.env.GROKBOT_VOICE_MODEL_ES || "fish-audio/s2.1-pro-free:free";
const PICK_MODELS = (process.env.GROKBOT_PICK_MODELS || "").split(",").map((s) => s.trim()).filter(Boolean);
const FIRST_TOKEN_MS = Number(process.env.GROKBOT_FIRST_TOKEN_MS) > 0 ? Number(process.env.GROKBOT_FIRST_TOKEN_MS) : 15000;
/* Optional OpenRouter "reasoning" settings, as JSON (for example {"effort":"low"}); unset means none are sent. */
const REASONING = (() => {
  if (!process.env.GROKBOT_REASONING) return null;
  try { return JSON.parse(process.env.GROKBOT_REASONING); } catch (e) { console.error("GROKBOT_REASONING is not JSON; ignored"); return null; }
})();
const upstreamHeaders = () => ({
  "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json",
  "HTTP-Referer": "https://inn514.canner.app", "X-Title": "INN514 Course Companion",
});
function upstreamBody(model, messages, opts, stream) {
  const b = { model, messages, max_tokens: opts.max_tokens || 1000, temperature: opts.temperature ?? 0.3 };
  if (REASONING) b.reasoning = REASONING;
  if (stream) b.stream = true;
  return JSON.stringify(b);
}

async function askUpstream(messages, opts = {}) {
  let last429 = false;
  for (const model of (opts.models || MODELS)) {
    try {
      const r = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: upstreamHeaders(),
        // Room for a reasoning model's thinking as well as the 3-to-6-sentence answer.
        body: upstreamBody(model, messages, opts, false),
        signal: AbortSignal.timeout(40000),
      });
      if (r.ok) {
        const j = await r.json();
        const text = String(j?.choices?.[0]?.message?.content || "").trim();
        if (text) return { text };
        last429 = false;                                 // an empty answer tries the next model
        continue;
      }
      last429 = r.status === 429;
      if (r.status !== 429 && r.status < 500) break;   // only a 429, a 5xx or a timeout tries the next model
    } catch (e) { last429 = false; }
  }
  return { error: last429 ? 429 : 502 };
}

/* Streams an answer from OpenRouter and calls onSentence for each finished sentence as the model writes it.
   Models are tried in order: a 429, a 5xx, a network error, no answer text within FIRST_TOKEN_MS, or a reply
   with no answer text (only thinking) moves on to the next model. Once a model has started answering it
   keeps the answer; if it breaks off, what it said so far stands. */
async function askUpstreamStream(messages, onSentence, models = MODELS) {
  let last429 = false;
  for (const model of models) {
    const ctl = new AbortController();
    const total = setTimeout(() => ctl.abort(), 60000);
    const first = setTimeout(() => ctl.abort(), FIRST_TOKEN_MS);
    let text = "", pending = "", started = false;
    const finish = () => { clearTimeout(first); clearTimeout(total); if (pending.trim()) onSentence(pending.trim()); pending = ""; };
    try {
      const r = await fetch(`${BASE}/chat/completions`, {
        method: "POST", headers: upstreamHeaders(),
        body: upstreamBody(model, messages, {}, true), signal: ctl.signal,
      });
      if (!r.ok) {
        clearTimeout(first); clearTimeout(total);
        last429 = r.status === 429;
        if (r.status !== 429 && r.status < 500) break;
        continue;
      }
      const dec = new TextDecoder();
      let sse = "";
      for await (const chunk of r.body) {
        sse += dec.decode(chunk, { stream: true });
        let nl;
        while ((nl = sse.indexOf("\n")) >= 0) {
          const line = sse.slice(0, nl).trim();
          sse = sse.slice(nl + 1);
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          let delta = "";
          try { delta = JSON.parse(data)?.choices?.[0]?.delta?.content || ""; } catch (e) {}
          if (!delta) continue;
          if (!started) { started = true; clearTimeout(first); }
          text += delta; pending += delta;
          const parts = pending.split(/(?<=[.!?])\s+/);
          pending = parts.pop();
          for (const s of parts) if (s.trim()) onSentence(s.trim());
        }
      }
      finish();
      if (text.trim()) return { text: text.trim() };
      last429 = false;                   // only thinking, no answer: the next model
    } catch (e) {
      finish();
      if (started) return { text: text.trim() };   // broke off mid-answer: keep what was said
      last429 = false;
    }
  }
  return { error: last429 ? 429 : 502 };
}
/* A streamed reply: one JSON object per line ({sources}, {sentence}, {done, text} or {error}).
   The headers go out with the first line, so an error before any line can still use a normal status. */
function streamReply(req, res, start) {
  let open = false;
  return {
    send(obj) {
      if (!open) {
        open = true;
        res.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no", "X-Content-Type-Options": "nosniff" });
      }
      res.write(JSON.stringify(obj) + "\n");
    },
    get open() { return open; },
    end() { log(req, 200, Date.now() - start); res.end(); },
  };
}
function answerStream(out, done, messages) {
  const fail = (code) => {
    const error = code === 429 ? "rate_limited" : "upstream";
    if (!out.open) return done(code, JSONH, JSON.stringify({ error }));
    out.send({ error }); out.end();
  };
  askUpstreamStream(messages, (s) => out.send({ sentence: s })).then((r) => {
    if (r.error) return fail(r.error);
    out.send({ done: true, text: r.text }); out.end();
  }).catch(() => fail(502));
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
  // Deepgram needs one of its Flux voices; Fish picks its own when none is given.
  const enVoice = process.env.GROKBOT_VOICE_EN || (VOICE_EN.startsWith("deepgram/") ? "flux-alexis-en" : "");
  const first = lang === "es-ES"
    ? await tryModel(VOICE_ES, esVoice)
    : await tryModel(VOICE_EN, enVoice);
  if (first) return first;
  if (lang !== "es-ES" && VOICE_EN !== VOICE_ES) return tryModel(VOICE_ES, esVoice);   // a different English model falls back to Fish once
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
function limitsOk(req, kind, cost = 1) {
  const ip = clientIp(req);
  const now = Date.now();
  const recent = (ipCalls.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length + cost > num(process.env.GROKBOT_RATE_PER_10MIN, 30)) { ipCalls.set(ip, recent); return false; }
  const key = new Date().toISOString().slice(0, 10);        // UTC day
  if (dayCount.key !== key) { dayCount.key = key; dayCount.asks = 0; dayCount.speaks = 0; }
  if (kind === "ask" ? dayCount.asks + cost > num(process.env.GROKBOT_ASKS_PER_DAY, 150)
                     : dayCount.speaks + cost > num(process.env.GROKBOT_SPEAKS_PER_DAY, 300)) {
    ipCalls.set(ip, recent);
    return false;
  }
  for (let k = 0; k < cost; k++) recent.push(now);
  ipCalls.set(ip, recent);
  if (kind === "ask") dayCount.asks += cost; else dayCount.speaks += cost;
  return true;
}

/* ---------- request plumbing ---------- */
function log(req, status, ms) {
  console.log(`${req.method} ${req.url} ${status} ${ms}ms`);
}
/* The passcode without the spaces or quotes that a host's settings page or a copy-paste can add around it. */
const cleanPass = (s) => String(s || "").trim().replace(/^(["'])(.*)\1$/, "$2");
function passcodeOk(req) {
  const want = cleanPass(process.env.GROKBOT_PASSCODE);
  if (!want) return true;                // no passcode set: anyone may ask (the student's choice, 2026-10-24)
  const got = cleanPass(req.headers["x-grokbot-passcode"]);
  if (!got) return false;
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
      if (body.stream === true) return answerStream(streamReply(req, res, start), done, messages);
      askUpstream(messages).then((out) => {
        if (out.error) return done(out.error, JSONH, JSON.stringify({ error: out.error === 429 ? "rate_limited" : "upstream" }));
        done(200, JSONH, JSON.stringify({ text: out.text }));
      }).catch(() => done(502, JSONH, JSON.stringify({ error: "upstream" })));
    });
  }

  if (req.method === "POST" && p === "/api/course") {
    if (guessingLocked(req)) return done(429, JSONH, JSON.stringify({ error: "rate_limited" }));
    if (!passcodeOk(req)) { noteBadPass(req); return done(401, JSONH, JSON.stringify({ error: "passcode" })); }
    return readBody(req, (err, raw) => {
      if (err) return done(413, JSONH, JSON.stringify({ error: "bad_request" }));
      let body;
      try { body = JSON.parse(raw.toString("utf8")); } catch (e) { return done(400, JSONH, JSON.stringify({ error: "bad_request" })); }
      const question = body.question;
      if (typeof question !== "string" || question.length < 1 || question.length > 500) return done(400, JSONH, JSON.stringify({ error: "bad_request" }));
      if (body.hits !== undefined && (!Array.isArray(body.hits) || body.hits.length > 3)) return done(400, JSONH, JSON.stringify({ error: "bad_request" }));
      const hits = cleanPicks(body.hits || []);
      // a question the site's search already placed needs one model call; otherwise the model chooses chapters first
      if (!limitsOk(req, "ask", hits.length ? 1 : 2)) return done(429, JSONH, JSON.stringify({ error: "rate_limited" }));
      const answer = (chosen) => {
        const blocks = chosen.map((p) => "\n\n" + blockFor(p.id, DB.lectures[p.id].chapters.findIndex((ch) => ch.n === p.chapter))).join("");
        const messages = [
          { role: "user", content: DB.courseRules + DB.noQuoteCourse + "\n\n" + COURSE_OVERVIEW + blocks },
          { role: "user", content: question },
        ];
        if (body.stream === true) {
          const out = streamReply(req, res, start);
          out.send({ sources: chosen });
          return answerStream(out, done, messages);
        }
        askUpstream(messages).then((out) => {
          if (out.error) return done(out.error, JSONH, JSON.stringify({ error: out.error === 429 ? "rate_limited" : "upstream" }));
          done(200, JSONH, JSON.stringify({ text: out.text, sources: chosen }));
        }).catch(() => done(502, JSONH, JSON.stringify({ error: "upstream" })));
      };
      if (hits.length) return answer(hits);
      askUpstream([{ role: "user", content: DB.pickRules + "\n\n" + COURSE_INDEX + "\n\nQuestion: " + question }],
        { max_tokens: 600, temperature: 0, models: PICK_MODELS.length ? PICK_MODELS : MODELS }).then((pick) => {
        let picks = [];
        if (!pick.error) {
          const m = /\[[\s\S]*?\]/.exec(pick.text);
          let parsed;
          try { parsed = JSON.parse(m[0]); } catch (e) {}
          picks = cleanPicks(parsed);
        }
        answer(picks);
      }).catch(() => answer([]));
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
      ask: !!KEY,
      // Whether each setting is present (never its value). The page asks for a passcode only when one is set.
      key: !!KEY, passcode: !!cleanPass(process.env.GROKBOT_PASSCODE),
      voices: { en: VOICE_EN, es: VOICE_ES },
    }));
  }
  return notFound();
});
server.listen(process.env.PORT || 3000);
