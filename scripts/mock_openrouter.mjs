import http from "node:http";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const port = Number(process.argv[2]);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error("usage: node mock_openrouter.mjs <port>");
  process.exit(1);
}

let audio;
try {
  audio = fs.readFileSync(fileURLToPath(new URL("../site/audio/T1-01.mp3", import.meta.url)));
} catch (error) {
  console.error("mock startup failed: " + error.message);
  process.exit(1);
}

const calls = [];

function reply(res, status, headers, body) {
  res.writeHead(status, { "Connection": "close", ...headers });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const requestPath = (req.url || "/").split("?")[0];
  if (req.method === "GET" && requestPath === "/calls") {
    reply(res, 200, { "Content-Type": "application/json" }, JSON.stringify(calls));
    return;
  }

  const chat = req.method === "POST" && requestPath === "/api/v1/chat/completions";
  const speech = req.method === "POST" && requestPath === "/api/v1/audio/speech";
  if (!chat && !speech) {
    reply(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
    return;
  }

  const chunks = [];
  let size = 0;
  let tooLarge = false;
  req.on("data", (chunk) => {
    if (tooLarge) return;
    size += chunk.length;
    if (size > 1024 * 1024) {
      tooLarge = true;
      return;
    }
    chunks.push(chunk);
  });
  req.on("end", () => {
    if (tooLarge) {
      reply(res, 413, { "Content-Type": "application/json" }, JSON.stringify({ error: "too_large" }));
      return;
    }

    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch (error) {
      reply(res, 400, { "Content-Type": "application/json" }, JSON.stringify({ error: "bad_json" }));
      return;
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const firstMessage = messages.length && typeof messages[0]?.content === "string"
      ? messages[0].content
      : "";
    calls.push({
      path: requestPath,
      model: typeof body.model === "string" ? body.model : null,
      voice: typeof body.voice === "string" ? body.voice : null,
      messages: messages.map((message) => ({
        role: typeof message?.role === "string" ? message.role : null,
        content: typeof message?.content === "string" ? message.content.slice(0, 200) : "",
      })),
      // The diagnostic prefixes above are 200 characters as specified. The test
      // also needs to verify context that follows the much longer RULES prefix.
      context: firstMessage,
      authOk: req.headers.authorization === "Bearer test-key",
      stream: body.stream === true,
      reasoning: body.reasoning ?? null,
    });

    if (process.env.MOCK_FAIL === "deepgram" && typeof body.model === "string" && body.model.includes("deepgram")) {
      reply(res, 500, { "Content-Type": "application/json" }, JSON.stringify({ error: "mock_failure" }));
      return;
    }
    if (process.env.MOCK_FAIL === "chat500" && chat) {
      reply(res, 500, { "Content-Type": "application/json" }, JSON.stringify({ error: "mock_failure" }));
      return;
    }
    // A streamed chat: three SSE events (first sentence, second sentence, done), 200 ms apart.
    if (chat && body.stream === true) {
      res.on("error", () => {});
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "close" });
      const gap = Number(process.env.MOCK_STREAM_GAP_MS) > 0 ? Number(process.env.MOCK_STREAM_GAP_MS) : 200;
      const firstEvent = 'data: {"choices":[{"delta":{"content":"First sentence. "}}]}\n\n';
      const secondEvent = 'data: {"choices":[{"delta":{"content":"Second sentence."}}]}\n\n';
      const doneEvent = "data: [DONE]\n\n";
      const finish = () => {
        if (res.destroyed || res.writableEnded) return;
        res.write(secondEvent);
        res.write(doneEvent);
        res.end();
      };
      if (body.model === process.env.MOCK_THINK_MODEL) {
        res.write('data: {"choices":[{"delta":{"reasoning":"thinking"}}]}\n\n');
        res.write(doneEvent);
        res.end();
        return;
      }
      const announce = () => {
        if (res.destroyed || res.writableEnded) return;
        res.write(firstEvent);
        setTimeout(finish, gap);
      };
      if (body.model === process.env.MOCK_SLOW_MODEL) setTimeout(announce, 3000);
      else announce();
      return;
    }
    // A course pick: the first message starts with the pick rules (D.6).
    if (chat && firstMessage.startsWith("You choose which chapters")) {
      const pick = (firstMessage.includes("hola") || firstMessage.includes("who teaches") || firstMessage.includes("nothing-matches")) ? "[]"
        : firstMessage.includes("unknown-pick") ? 'Here you go: [{"id": "T99", "chapter": 1}, {"id": "T4", "chapter": 99}]'
        : '[{"id": "T4", "chapter": 3}]';
      reply(res, 200, { "Content-Type": "application/json" }, JSON.stringify({
        choices: [{ message: { content: pick } }],
      }));
      return;
    }
    if (chat) {
      reply(res, 200, { "Content-Type": "application/json" }, JSON.stringify({
        choices: [{ message: { content: "First sentence. Second sentence." } }],
      }));
      return;
    }
    reply(res, 200, { "Content-Type": "audio/mpeg", "Content-Length": String(audio.length) }, audio);
  });
  req.on("error", () => {
    if (!res.headersSent) reply(res, 400, { "Content-Type": "application/json" }, JSON.stringify({ error: "request_error" }));
  });
});

server.on("error", (error) => {
  console.error("mock server error: " + error.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  console.log("MOCK_READY " + server.address().port);
});

let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  server.close(() => process.exit());
  server.closeAllConnections();
  setTimeout(() => process.exit(), 1000).unref();
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
