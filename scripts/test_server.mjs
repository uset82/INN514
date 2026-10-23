import http from "node:http";
import net from "node:net";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SERVER_SCRIPT = path.join(ROOT, "server.js");
const MOCK_SCRIPT = path.join(ROOT, "scripts", "mock_openrouter.mjs");
const TEST_KEY = "test-key";
const TEST_PASS = "test-pass";
const ANSWER = "First sentence. Second sentence.";
const CHAT_PATH = "/api/v1/chat/completions";
const SPEECH_PATH = "/api/v1/audio/speech";

let failures = 0;
let ratedCalls = 0;
let childSequence = 0;
const children = new Set();
const serverResponses = [];
const responseLeaks = [];

function redact(value) {
  return String(value).split(TEST_KEY).join("[redacted key]").split(TEST_PASS).join("[redacted passcode]");
}

function check(ok, name, detail = "") {
  if (ok) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.log(`FAIL ${name}${detail ? ": " + redact(detail) : ""}`);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseJson(response) {
  try {
    return JSON.parse(response.body.toString("utf8"));
  } catch (error) {
    return null;
  }
}

function inspectResponse(response, origin) {
  if (origin === "server") serverResponses.push(response);
  const headerText = response.rawHeaders.join("\n");
  for (const [label, secret] of [["key", TEST_KEY], ["passcode", TEST_PASS]]) {
    if (response.body.includes(Buffer.from(secret))) {
      responseLeaks.push(`${origin} ${response.path} body (${label})`);
    }
    if (headerText.includes(secret)) {
      responseLeaks.push(`${origin} ${response.path} headers (${label})`);
    }
  }
}

function request(port, requestPath, { method = "GET", headers = {}, body = null, origin = "server" } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body === null ? null : Buffer.isBuffer(body) ? body : Buffer.from(body);
    const requestHeaders = { ...headers, "Connection": "close" };
    if (payload) requestHeaders["Content-Length"] = String(payload.length);
    const req = http.request({
      host: "127.0.0.1",
      port,
      path: requestPath,
      method,
      headers: requestHeaders,
      agent: false,
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const response = {
          status: res.statusCode,
          headers: res.headers,
          rawHeaders: res.rawHeaders,
          body: Buffer.concat(chunks),
          path: requestPath,
        };
        inspectResponse(response, origin);
        resolve(response);
      });
      res.on("error", reject);
    });
    req.setTimeout(8000, () => req.destroy(new Error(`request timed out: ${requestPath}`)));
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function postJson(port, requestPath, value, { passcode, origin = "server", counted = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (passcode !== undefined) headers["X-Grokbot-Passcode"] = passcode;
  if (counted) ratedCalls++;
  const response = await request(port, requestPath, {
    method: "POST",
    headers,
    body: JSON.stringify(value),
    origin,
  });
  response.json = parseJson(response);
  return response;
}

function isRunning(child) {
  return Boolean(child && child.pid && !child.__settled && child.exitCode === null && child.signalCode === null);
}

function startProcess(kind, script, args, extraEnv) {
  const label = `${kind}-${++childSequence}`;
  const child = spawn(process.execPath, [script, ...args], {
    cwd: ROOT,
    env: { ...process.env, ...extraEnv },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  child.__kind = kind;
  child.__label = label;
  child.__output = "";
  child.__settled = false;
  child.__spawnError = null;
  child.__exitPromise = new Promise((resolve) => {
    child.__resolveExit = resolve;
  });
  const settle = () => {
    if (child.__settled) return;
    child.__settled = true;
    child.__resolveExit();
  };
  child.stdout.on("data", (chunk) => { child.__output += chunk.toString("utf8"); });
  child.stderr.on("data", (chunk) => { child.__output += chunk.toString("utf8"); });
  child.once("error", (error) => {
    child.__spawnError = error;
    settle();
  });
  // Waiting for close also drains stdio before the final output secret scan.
  child.once("close", () => settle());
  children.add(child);
  return child;
}

function startMock(port, failMode, sequence) {
  return startProcess("mock", MOCK_SCRIPT, [String(port)], { MOCK_FAIL: failMode });
}

function startServer(serverPort, mockPort) {
  return startProcess("server", SERVER_SCRIPT, [], {
    PORT: String(serverPort),
    OPENROUTER_BASE: `http://127.0.0.1:${mockPort}/api/v1`,
    OPENROUTER_API_KEY: TEST_KEY,
    GROKBOT_PASSCODE: TEST_PASS,
    GROKBOT_RATE_PER_10MIN: "20",
    GROKBOT_ASKS_PER_DAY: "150",
    GROKBOT_SPEAKS_PER_DAY: "300",
    GROKBOT_ANSWER_MODELS: "google/gemma-4-31b-it:free,nvidia/nemotron-3-super-120b-a12b:free",
    GROKBOT_VOICE_MODEL_EN: "deepgram/flux-tts:free",
    GROKBOT_VOICE_MODEL_ES: "fish-audio/s2.1-pro-free:free",
    GROKBOT_VOICE_EN: "flux-alexis-en",
    GROKBOT_VOICE_ES: "",
  });
}

function waitForExit(child, timeout) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), timeout);
    child.__exitPromise.then(() => {
      clearTimeout(timer);
      resolve(true);
    });
  });
}

async function stopProcess(child) {
  if (!child || !isRunning(child)) {
    if (child) await child.__exitPromise;
    return;
  }
  child.kill("SIGTERM");
  if (await waitForExit(child, 2000)) return;
  if (isRunning(child)) child.kill("SIGKILL");
  if (await waitForExit(child, 2000)) return;
  if (isRunning(child)) throw new Error(`could not stop ${child.__label}`);
}

async function stopAllProcesses() {
  const results = await Promise.allSettled([...children].reverse().map((child) => stopProcess(child)));
  const errors = [];
  results.forEach((result, index) => {
    if (result.status === "rejected") errors.push(result.reason?.message || String(result.reason));
  });
  for (const child of children) {
    if (isRunning(child)) errors.push(`${child.__label} is still running`);
  }
  return errors;
}

async function getFreePort() {
  const probe = net.createServer();
  await new Promise((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", resolve);
  });
  const port = probe.address().port;
  await new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function waitReady(child, port, requestPath, origin) {
  const deadline = Date.now() + 15000;
  let lastError = "not ready";
  while (Date.now() < deadline) {
    if (child.__spawnError) throw new Error(`${child.__label} could not start: ${child.__spawnError.message}`);
    if (child.__settled) throw new Error(`${child.__label} exited before becoming ready`);
    try {
      const response = await request(port, requestPath, { origin });
      if (response.status === 200) return response;
      lastError = `status ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await delay(50);
  }
  throw new Error(`${child.__label} readiness timed out: ${lastError}`);
}

async function callsFromMock(mockPort) {
  const response = await request(mockPort, "/calls", { origin: "mock" });
  const calls = parseJson(response);
  if (response.status !== 200 || !Array.isArray(calls)) throw new Error("mock /calls did not return an array");
  return calls;
}

function lastCall(calls, requestPath) {
  return calls.filter((call) => call.path === requestPath).at(-1);
}

async function run() {
  let mockPort;
  let serverPort;
  let mock;
  let server;

  try {
    const [expectedAudio, t4, p02] = await Promise.all([
      fs.readFile(path.join(ROOT, "site", "audio", "T1-01.mp3")),
      fs.readFile(path.join(ROOT, "site", "data", "T4.json"), "utf8").then(JSON.parse),
      fs.readFile(path.join(ROOT, "site", "data", "P02.json"), "utf8").then(JSON.parse),
    ]);

    mockPort = await getFreePort();
    serverPort = await getFreePort();
    while (serverPort === mockPort) serverPort = await getFreePort();

    mock = startMock(mockPort, "");
    await waitReady(mock, mockPort, "/calls", "mock");
    server = startServer(serverPort, mockPort);
    await waitReady(server, serverPort, "/api/health", "server");

    const serverRequest = (requestPath, options) => request(serverPort, requestPath, options);
    const ask = (body, passcode = TEST_PASS) => postJson(serverPort, "/api/ask", body, {
      passcode,
      counted: passcode === TEST_PASS,
    });
    const speak = (body) => postJson(serverPort, "/api/speak", body, { passcode: TEST_PASS, counted: true });

    const home = await serverRequest("/");
    check(home.status === 200 && String(home.headers["content-type"] || "").includes("text/html"),
      "GET / returns HTML", `status ${home.status}`);
    const metaTags = home.body.toString("utf8").match(/<meta\b[^>]*>/gi) || [];
    const robotsMeta = metaTags.find((tag) => /\bname\s*=\s*["']robots["']/i.test(tag));
    check(Boolean(robotsMeta && /\bcontent\s*=\s*["'][^"']*noindex/i.test(robotsMeta)),
      "GET / includes the noindex robots meta");

    const robots = await serverRequest("/robots.txt");
    check(robots.status === 200, "GET /robots.txt returns 200", `status ${robots.status}`);

    const audio = await serverRequest("/site/audio/T1-01.mp3");
    check(audio.status === 200 && String(audio.headers["content-type"] || "").includes("audio/mpeg") &&
      audio.body.length === expectedAudio.length,
    "full MP3 has the expected type and length", `status ${audio.status}, bytes ${audio.body.length}`);
    const range = await serverRequest("/site/audio/T1-01.mp3", { headers: { Range: "bytes=0-99" } });
    check(range.status === 206 && range.body.length === 100 &&
      range.headers["content-range"] === `bytes 0-99/${expectedAudio.length}` &&
      range.body.equals(expectedAudio.subarray(0, 100)),
    "MP3 range returns exactly the first 100 bytes", `status ${range.status}, bytes ${range.body.length}`);

    for (const blocked of ["/README.md", "/scripts/build_site.py", "/site/data/T1.json", "/%2e%2e/index.html", "/site/audio/../index.html"]) {
      const response = await serverRequest(blocked);
      check(response.status === 404, `blocked path ${blocked}`, `status ${response.status}`);
    }

    const healthResponse = await serverRequest("/api/health");
    const health = parseJson(healthResponse);
    check(healthResponse.status === 200 && health?.ask === true, "health reports ask: true",
      `status ${healthResponse.status}`);

    const validAsk = { id: "T4", chapter: 2, question: "What is upward causation?", history: [] };
    const noPass = await postJson(serverPort, "/api/ask", validAsk);
    check(noPass.status === 401 && noPass.json?.error === "passcode", "ask without a passcode returns 401",
      `status ${noPass.status}`);
    const wrongPass = await ask(validAsk, "wrong-pass");
    check(wrongPass.status === 401 && wrongPass.json?.error === "passcode", "ask with a wrong passcode returns 401",
      `status ${wrongPass.status}`);

    const asked = await ask(validAsk);
    check(asked.status === 200 && asked.json?.text === ANSWER, "valid T4 ask returns the mock answer",
      `status ${asked.status}`);
    let calls = await callsFromMock(mockPort);
    let chat = lastCall(calls, CHAT_PATH);
    check(chat?.authOk === true, "ask upstream uses the test-key auth header");
    check(Boolean(chat?.messages?.[0]?.content.includes("You are a study helper")),
      "ask prompt begins with the study-helper rules");
    check(Boolean(chat?.context.includes(t4.chapters[2].title)),
      "ask prompt contains the T4 chapter title");

    const paper = await ask({ id: "P02", chapter: 0, question: "Summarise this paper.", history: [] });
    check(paper.status === 200, "valid P02 ask succeeds", `status ${paper.status}`);
    calls = await callsFromMock(mockPort);
    chat = lastCall(calls, CHAT_PATH);
    check(Boolean(chat?.context.includes("do not quote")), "P02 prompt includes the do-not-quote rule");

    const badAsks = [
      ["unknown id", { ...validAsk, id: "UNKNOWN" }],
      ["bad chapter index", { ...validAsk, chapter: 999 }],
      ["501-character question", { ...validAsk, question: "x".repeat(501) }],
      ["seven history turns", { ...validAsk, history: Array.from({ length: 7 }, () => ({ role: "user", content: "turn" })) }],
    ];
    for (const [name, body] of badAsks) {
      const response = await ask(body);
      check(response.status === 400 && response.json?.error === "bad_request", `${name} returns 400`,
        `status ${response.status}`);
    }

    const spanish = await speak({ text: "Primera frase.", lang: "es-ES" });
    check(spanish.status === 200 && String(spanish.headers["content-type"] || "").includes("audio/mpeg") &&
      spanish.body.equals(expectedAudio), "Spanish speak returns the mock MP3", `status ${spanish.status}`);
    calls = await callsFromMock(mockPort);
    let speechCall = lastCall(calls, SPEECH_PATH);
    check(speechCall?.model === "fish-audio/s2.1-pro-free:free" && speechCall?.authOk === true,
      "Spanish speak selects Fish with authenticated upstream access");

    const english = await speak({ text: "First sentence.", lang: "en-GB" });
    check(english.status === 200 && String(english.headers["content-type"] || "").includes("audio/mpeg") &&
      english.body.equals(expectedAudio), "English speak returns the mock MP3", `status ${english.status}`);
    calls = await callsFromMock(mockPort);
    speechCall = lastCall(calls, SPEECH_PATH);
    check(speechCall?.model === "deepgram/flux-tts:free" && speechCall?.voice === "flux-alexis-en" && speechCall?.authOk === true,
      "English speak selects Deepgram and flux-alexis-en");

    await stopProcess(mock);
    check(!isRunning(mock), "normal mock stops before the failure-mode restart");
    mock = startMock(mockPort, "deepgram");
    await waitReady(mock, mockPort, "/calls", "mock");

    const fallback = await speak({ text: "Fallback sentence.", lang: "en-GB" });
    check(fallback.status === 200 && String(fallback.headers["content-type"] || "").includes("audio/mpeg") &&
      fallback.body.equals(expectedAudio), "English speak succeeds through the Fish fallback", `status ${fallback.status}`);
    calls = await callsFromMock(mockPort);
    const fallbackCalls = calls.filter((call) => call.path === SPEECH_PATH);
    check(fallbackCalls.length === 2 && fallbackCalls[0]?.model === "deepgram/flux-tts:free" &&
      fallbackCalls[1]?.model === "fish-audio/s2.1-pro-free:free",
    "Deepgram failure causes exactly one Fish fallback", `upstream calls ${fallbackCalls.length}`);

    const used = ratedCalls;
    if (used > 20) throw new Error(`test itself exceeded the rate window before its rate check: ${used}`);
    const fillers = [];
    for (let index = used; index < 20; index++) fillers.push(await ask(validAsk));
    check(fillers.every((response) => response.status === 200),
      `authenticated API calls ${used + 1} through 20 stay below the limit`,
      fillers.map((response) => response.status).join(","));
    const beforeLimited = (await callsFromMock(mockPort)).filter((call) => call.path === CHAT_PATH).length;
    const limited = await ask(validAsk);
    check(ratedCalls === 21 && limited.status === 429 && limited.json?.error === "rate_limited",
      "the 21st authenticated API call returns 429", `status ${limited.status}, counted ${ratedCalls}`);
    const afterLimited = (await callsFromMock(mockPort)).filter((call) => call.path === CHAT_PATH).length;
    check(afterLimited === beforeLimited, "the rate-limited call does not reach OpenRouter");

    // Passcode guessing from another address (the last X-Forwarded-For entry is the client).
    const guess = (passcode, forwardedFor) => request(serverPort, "/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": forwardedFor, "X-Grokbot-Passcode": passcode },
      body: JSON.stringify(validAsk),
    }).then((response) => { response.json = parseJson(response); return response; });
    const wrongTries = [];
    for (let n = 0; n < 10; n++) wrongTries.push((await guess(`wrong-${n}`, "198.51.100.7")).status);
    check(wrongTries.every((status) => status === 401), "ten wrong passcodes from one address each return 401",
      wrongTries.join(","));
    const locked = await guess(TEST_PASS, "198.51.100.7");
    check(locked.status === 429 && locked.json?.error === "rate_limited",
      "after ten wrong passcodes, that address gets 429 even with the right passcode", `status ${locked.status}`);
    const spoofed = await guess(TEST_PASS, "203.0.113.9, 198.51.100.7");
    check(spoofed.status === 429, "a faked first X-Forwarded-For entry does not escape the lock", `status ${spoofed.status}`);
    const other = await guess(TEST_PASS, "192.0.2.44");
    check(other.status === 200, "another address with the right passcode still gets an answer", `status ${other.status}`);
  } catch (error) {
    check(false, "test execution", error?.stack || error?.message || String(error));
  } finally {
    const cleanupErrors = await stopAllProcesses();
    check(cleanupErrors.length === 0, "all spawned child processes stop cleanly", cleanupErrors.join("; "));
  }

  check(serverResponses.length > 0 && serverResponses.every((response) =>
    response.headers["x-content-type-options"] === "nosniff"), "every server response sets nosniff");
  check(responseLeaks.length === 0, "no response body or header leaks either test secret", responseLeaks.join("; "));
  const serverOutput = [...children].filter((child) => child.__kind === "server").map((child) => child.__output).join("\n");
  const outputLeaks = [];
  if (serverOutput.includes(TEST_KEY)) outputLeaks.push("key");
  if (serverOutput.includes(TEST_PASS)) outputLeaks.push("passcode");
  check(outputLeaks.length === 0, "no server output line leaks either test secret", outputLeaks.join(", "));

  if (failures === 0) {
    console.log("ALL SERVER CHECKS PASSED");
    process.exitCode = 0;
  } else {
    console.log(`${failures} SERVER CHECKS FAILED`);
    process.exitCode = 1;
  }
}

try {
  await run();
} catch (error) {
  const cleanupErrors = await stopAllProcesses();
  console.error(redact(error?.stack || error?.message || String(error)));
  for (const cleanupError of cleanupErrors) console.error(redact(cleanupError));
  console.log("1 SERVER CHECKS FAILED");
  process.exitCode = 1;
}
