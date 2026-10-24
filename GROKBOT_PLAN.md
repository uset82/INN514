# GROKBOT_PLAN: Grokbot for INN514

Written by Claude Code on 2026-10-23 from the plan the student approved, updated the same day for the Canner Grokbot server, and on 2026-10-24 for the front-page course chat (Part H). ZCode + GLM 5.3 Flash builds it; Claude Code reviews and publishes it. This file is the single spec: use its code shapes and copy word for word.

Prompt: `GROKBOT_KICKOFF.md`. Progress: `PROGRESS_GROKBOT_ZCODE.md`.

## Context: the main idea

You study INN514 with the **INN514 Course Companion**: 8 classes and 17 papers, as audio and text. When something isn't clear, you want to **ask and hear the answer**, wherever you are:
- **on your wrist**, from Grokbot (the T-Watch-S3);
- **on the site**, from a speaking orb on every chapter, on the claude.ai link and on Canner.

All three answer from the **same course text**.

```
                       INN514 companion source = git repo uset82/INN514 (PUBLIC), root workspace/lecture-audio
                       lectures/*.md, readings/*.md → site/data/*.json, site/template.html
                                 │                                       │
          build_site.py ─────────┤                                       └── export_knowledge.py (DONE) ──▶ grok-watch-hub/knowledge/inn514
          site/index.html        │ build_static.py → index.html                 (private repo) ◀── Grok Principal reads
                 │               │                                                                 ▲
                 ▼               ▼                                                                 │ inbox/outbox
   claude.ai link (version 31)   Canner: https://inn514.canner.app  (PART S: server.js)         WATCH: "Grok principal, ¿…?"
   orb in CLAUDE MODE:           orb in SERVER MODE:
   question → Claude (viewer's   question + passcode → server.js → OpenRouter free answer model
   own account, `sample`)        (Gemma 4 31B, fallback Nemotron 3 Super) → answer text
   → device voice speaks         → server.js → OpenRouter voice: Fish Audio S2.1 Pro Free (Spanish),
                                   Deepgram Flux TTS (English) → MP3 → the page plays it
```

**Why the orb works differently in the two places:**
- **On the claude.ai link,** the page's network is blocked. It can ask Claude on the viewer's own account, and only the device's own voice can speak.
- **On Canner,** a small server (`server.js`) holds your OpenRouter key in Canner's settings. The key never appears in the page or the public repo. The server answers with a free model and speaks with a free AI voice.
  - A **passcode** keeps strangers from spending your free quota.
  - Rate limits and daily caps protect it further.

**What already works:**
- The knowledge pack is in `uset82/grok-watch-hub`, with the "INN514 questions" rule.
- The watch delegates when it hears "grok principal", "mi bot", "delega" and similar words (`muse_hub.c:464`).
- The public repo `uset82/INN514` exists, and Canner serves `https://inn514.canner.app` (gate G0, approved).

**Your decisions (2026-10-23):**
- The orb is a chatbot that only answers, by speaking, in the language of the question. You ask by tapping a ready-made question or typing one.
- Text appears only as a backup when no voice works.
- The orb is a new design of your own.
- **On Canner the orb runs on its own server,** with:
  - your OpenRouter key kept in Canner's settings and marked sensitive;
  - a passcode;
  - a free answer model;
  - Fish Audio S2.1 Pro Free and Deepgram Flux TTS as voices.
- **On the claude.ai link the orb keeps using Claude** and the device voice.

**Not in scope:**
- watch firmware;
- any change to a lecture, paper, audio or data file;
- microphone input.

## Who does what

- **ZCode + GLM 5.3 Flash (executor):**
  - does one task per conversation, in order, from `PROGRESS_GROKBOT_ZCODE.md`;
  - stops at each gate;
  - never improvises: every task gives the code shape.
- **Claude Code:**
  - reviews at every gate and fixes;
  - does every git, publish and deploy step;
  - never sees your OpenRouter key or passcode.
- **You:**
  - in Canner, at G1: set the key and passcode, and switch the project to Node if Canner doesn't do it by itself;
  - test on your phone;
  - approve gates G1–G4 with "APPROVED GATE G<n>".

## Phase 0 and Part R: done

- **Phase 0:** plan files, backups (`*.before-grokbot`) and the manifest `checks/grokbot-manifest-before.txt`.
- **Part R:**
  - **R1:** `.gitignore`, `README.md`, `robots.txt`.
  - **R2:** `scripts/build_static.py`, which writes the root `index.html` with noindex and `site/audio/` paths.
  - **G0:** the scan, a Paper 2 check-answer fix, the first push (`772b254`), and the Canner check, approved.
- **After every later site change, Claude runs:**
  1. `build_site.py`, then `build_static.py`;
  2. commit and push;
  3. republish the claude.ai link.

  Canner redeploys from `main` by itself.

---

## Part A: the speaking orb (in `site/template.html`; claude mode and server mode)

### A.0 What you see

- **The button:** every chapter, on class pages and paper pages, gets a pill button next to "Listen to this chapter": a small orb icon and **"Ask about this chapter"**. It stays hidden until the page knows it can ask (`body.can-ask`), so it is absent on a local file, for a viewer without Claude on claude.ai, and on a server that answers no.
- **The panel:** tapping the button opens an inline panel under it (`section.ask`):

```
  ( orb 72px )   Ask about this chapter
                 [Enter the passcode to ask questions] [••••••] (OK)   ← server mode only, until a passcode works
                 [Explain this simply] [Give me an example]
                 [What could the exam ask?] [Key terms]
                 [ Or type your own question…            ] (Ask)
                 Thinking…  /  Speaking…  (Stop)            ← status line, aria-live="polite"
                 <honesty line for the mode>
```

- **Honesty lines** (verbatim):
  - claude mode: "Answers are written by AI from this chapter's text and read aloud by your device."
  - server mode: "Answers are written by a free AI model from this chapter's text and read aloud by an AI voice. Don't type personal details."
- **Panel rules:**
  - Only one panel is open at a time. Opening another one, or changing route, stops speech and closes the first.
  - When the orb starts speaking, it pauses the lecture player. It does not resume the player on its own.
  - The chapter's conversation keeps at most the last 6 turns while the panel is open; closing the panel clears it.
  - **Text only as a backup:** when no voice works, the answer appears as text (`p.ask-text`) with "This device has no voice, so here is the answer as text."
- **Passcode (server mode):**
  - It is asked once, then kept in this browser (`localStorage` key `inn514-grokbot-pass`, with every read and write in try/catch).
  - On a 401 reply, the page forgets it and shows "That passcode didn't work."
- **The orb's states:** idle (blinks every ~5 s while the panel is open), thinking (breathing), speaking (a pulse as each part starts), done, error (one line).
  - Under `prefers-reduced-motion` there is no animation.
- **Front-page greeting** (added on 2026-10-24 at the student's request; both sites): a card in the front-page hero, after the lede, with the 56px orb.
  - The heading is "Ask about any chapter".
  - The text is "Grokbot, the orb on every chapter, answers your questions out loud from that chapter's text. Open a class or a paper and tap **Ask about this chapter**."
  - Once detection has finished (`body.ask-checked`), and only if asking is unavailable, a muted line says "Asking isn't switched on in this copy of the site yet." It never flickers on the claude.ai link.
  - **Part H** turns this card into the course chat; its heading and text change there.
- **No branding:** never write "Claude", "Anthropic" or "xAI" in the template; `check_page.mjs` tests for it.

### A.1 The orb (a new design of your own; tokens only)

- **Shape:** an inline SVG, `viewBox="0 0 64 64"`, `class="orb"`, `aria-hidden="true"`.
  - **Body:** `<circle cx="32" cy="32" r="26">` filled with `radialGradient#orbFill`. Light: `#FFFFFF` at 0% to `#F0EEE6` at 100%. Dark: `#F2F0E8` to `#C9C6BC`. Define the gradient once in a hidden `<svg>`.
  - **Rim:** stroke `var(--line)`, 1.5.
  - **Glow** (the only one on the site): `filter: drop-shadow(0 0 6px color-mix(in srgb, var(--clay) 30%, transparent))`.
  - **Eyes:** two `<rect class="eye" width="5" height="10" rx="2.5">` filled with `var(--ink)`, at x=23/y=26 and x=36/y=26, with `rotate(8 25.5 31)` and `rotate(-8 38.5 31)`.
- **Sizes:** 20px in the button, 72px in the panel.
- **CSS states:** `.orb.thinking` (`orb-breathe`, 2.4 s, scale 1 to 1.04), `.orb.pulse` (scale 1.06 for 150 ms), `.orb .eye.blink` (`scaleY(.1)` for 120 ms). Reduced motion removes all three.

### A.2 How it asks and speaks (code shape; keep these names)

**The prompt text** is defined once in the template. It must sit on **one line each**, as JSON-compatible double-quoted strings, because `server.js` reads these two lines from the template (S2):

```js
const RULES = "You are a study helper for the master's course INN514, \"Innovation systems and sustainable transformation\". Answer the student's question about one chapter of the course companion, using only the chapter text below. Your answer will be read aloud by a speech engine, so write plain spoken sentences: no lists, no headings, no symbols, no brackets. Use 3 to 6 sentences unless the student asks for more. Answer in the language of the student's question. Say where it comes from, using the slide or page numbers in the chapter, in words (\"on page 764\"). If the chapter does not answer the question, say so in one sentence. Never invent authors, numbers, dates or quotations.";
const NO_QUOTE = " This paper is marked \"paper in preparation, do not quote\": paraphrase it and never quote it.";
```

**Mode detection** (never blocks the first render):

```js
/* ---------- ask the orb ---------- */
let askMode = null;              // "claude" (claude.ai link), "server" (Canner), or null (hidden)
let sampleFn = null;             // claude mode: the page's "ask Claude" function
(async () => {
  try {
    if (window.claude?.use) {
      sampleFn = (await window.claude.use("sample")) || null;
      if (sampleFn) askMode = "claude";
    } else if (location.protocol.startsWith("http")) {
      const r = await fetch("/api/health", { signal: AbortSignal.timeout(4000) });
      const h = r.ok ? await r.json() : null;
      if (h && h.ask) askMode = "server";
    }
  } catch (e) { askMode = null; }
  document.body.classList.toggle("can-ask", !!askMode);
})();
```

**`CHIPS`:** as before.
- "Explain this simply" asks "Explain this chapter simply, as if to a first-year student."
- "Give me an example" asks "Give me one concrete example that makes this chapter's main idea clear, preferably one from the chapter."
- "What could the exam ask?" asks "What exam question could this chapter help answer, and how would a good answer start?"
- "Key terms" asks "What are the key terms in this chapter, and what does each one mean?"

**`chapterContext(id, i)`** (claude mode only; the server builds the same text itself):

```js
function chapterContext(id, i) {
  const c = entry(id), ch = DATA.lectures[id].chapters[i], reading = isReading(id);
  const where = reading ? `${className(c)}, chapter ${ch.n}: ${ch.title}. ${c.authors} (${c.year}). ${pagesText(ch.pages)}.`
                        : `${className(c)}, chapter ${ch.n}: ${ch.title}. ${c.teacher}. ${slideText(ch.slides)}.`;
  const body = ch.paragraphs.map((p, k) => (ch.labels && ch.labels[k] ? ch.labels[k] + ": " : "") + p).join("\n\n");
  return RULES + (id === "P02" ? NO_QUOTE : "") + "\n\nChapter: " + where + "\n---\n" + body + "\n---";
}
```

**Asking in claude mode:**
- **Turns:** `[{role:"user", content: chapterContext(id,i)}, ...history (max 6), {role:"user", content: question}]`.
- **The call:** `sampleFn(turns, { modelTier: "default", signal: ctl.signal, onText, cache: isFirstChip ? undefined : false })`.
- **Speaking:** `onText({delta})` feeds a buffer, and every complete sentence (`/(?<=[.!?])\s+/`) goes to the **device voice queue** at once.

**Asking in server mode** (`askServer(id, i, question)`):
1. `POST /api/ask` with JSON `{id, chapter: i, question, history}` and the header `X-Grokbot-Passcode`. The reply is `{text}`. Use a new `AbortController` per question; Stop aborts it.
2. **Speaking:** split `text` into the first sentence and the rest, and fetch `POST /api/speak` `{text: part, lang}` for each, the first part before the second. Play each MP3 blob through **one** `new Audio()` element made for the orb (never the lecture player), in order.
3. **Fallbacks:** if `/api/speak` fails for a part, speak that part with the device voice. If there is no device voice either, show the whole answer as text (the backup line).

**The device voice** (claude mode, and the server-mode fallback):
- Each sentence is one `SpeechSynthesisUtterance` with `lang` set to the question's language.
- The voice is the first in `speechSynthesis.getVoices()` whose `lang` starts with that language. Prefer names containing "Natural", "Neural", "Google" or "Microsoft".
- `rate` is 1. Wait up to 1 s for `voiceschanged`.

**Language:**
- A chip question is `"en-GB"`.
- A typed question is `"es-ES"` if it contains `¿ ¡ ñ á é í ó ú` or two or more of these words: qué, cómo, por, porque, el, la, los, las, es, de, del, una. Otherwise `"en-GB"`.
- In server mode the same `lang` goes to `/api/speak`.

**Stop:** `ctl.abort(); speechSynthesis.cancel(); orbAudio.pause();`

**Error messages (verbatim):**

| Situation | Message |
|---|---|
| claude `not_granted`, `sampling_disabled`, `not_declared`, `capability_disabled`, `capability_removed` | Remove `.can-ask`. "Asking isn't available here." |
| claude `rate_limited` / server 429 | "Too many questions right now. Try again in a minute." |
| claude `session_expired` | "Sign in again, then ask." |
| server 401 | Forget the passcode, show the passcode row: "That passcode didn't work." |
| claude `refused` | "That question couldn't be answered. Try asking it another way." |
| claude `prompt_too_large`, `empty_completion` / server 400 | "That was too much at once. Try a shorter question." |
| claude `cancelled` / an abort | No message. |
| claude `upstream_error`, anything else / server 5xx or a network failure | "The answer was interrupted. Ask again." |

- Never retry automatically, and never call from a loop or a timer. Calls happen only when the viewer taps.

**What stays unchanged in `template.html`:**
- the player logic and the `DATA` line;
- `linkReadings` and the page-link logic;
- the localStorage key `inn514-companion` and its shape;
- every class and selector the existing checks use.

The only addition to `renderLecture` is the button and panel markup per chapter, plus their click wiring.

### A.3 Tests (in `scripts/check_page.mjs`; every existing check stays)

1. **Normal file load:** no `.ask-btn` visible.
2. **Claude mock pass** (`Page.addScriptToEvaluateOnNewDocument`). The mocked `window.claude.use("sample")`:
   - records `window.__lastSample`;
   - calls `onText` with "First sentence. Second sentence.";
   - resolves;
   - switches behaviour with `window.__sampleMode = "ok" | "not_granted" | "rate_limited"`.

   Check that:
   - every chapter on a class page and on a paper page has a visible `.ask-btn`;
   - a tap opens one panel with 4 chips and an input, and a second tap elsewhere closes the first;
   - a chip sends turns whose first turn contains the chapter title and the start of `RULES`;
   - `#P02`'s first turn contains "do not quote";
   - with no voices, `p.ask-text` shows the answer together with the backup line;
   - `not_granted` hides every `.ask-btn` and shows "Asking isn't available here.";
   - `rate_limited` shows the rate message;
   - at 390 px with the panel open there is no horizontal scroll;
   - screenshots `phone-ask.png` and `phone-ask-dark.png` are saved.
3. **Server mode pass:**
   - start `scripts/mock_openrouter.mjs` (S4) and `server.js` as child processes, with `OPENROUTER_BASE` set to the mock, `OPENROUTER_API_KEY=test-key`, `GROKBOT_PASSCODE=test-pass` and a free `PORT`;
   - open `http://127.0.0.1:<PORT>/#T1`.

   Check that:
   - `.ask-btn` is visible;
   - a chip first shows the passcode row; after `test-pass` the answer arrives;
   - `/api/speak` was called (the mock counts calls);
   - a wrong passcode shows "That passcode didn't work.";
   - the server mode screenshot is `phone-ask-server.png`;
   - both child processes are stopped at the end, even after a failure.
4. **Theme switch pass** (file load, desktop):
   - on `#home`, read the body's background colour;
   - click `#themeBtn`: `document.documentElement.dataset.theme` becomes the opposite of the starting theme, the body background changes, the button's `aria-label` names the other theme, and `localStorage["inn514-theme"]` equals the new value;
   - reload the same address: the attribute is still set;
   - click again: everything returns to the starting theme;
   - at 390 px, the top bar fits (the existing no-horizontal-scroll checks cover every view).

### A.4 The light/dark switch (top bar; the claude.ai link and Canner)

Added at the student's request on 2026-10-23. Without a stored choice, the page keeps following the device setting, as now.

- **Markup:** in `header.topbar`, right after `nav.mainnav`:
  ```html
  <button class="theme-btn" id="themeBtn" type="button" aria-label="Switch to dark theme" title="Switch to dark theme">
    <svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
    <svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
  </button>
  ```
- **CSS (tokens only):**
  - the button: `.theme-btn { display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border: 0; border-radius: var(--r-sm); background: none; color: var(--muted); cursor: pointer; }`, with `.theme-btn:hover { background: var(--surface-2); color: var(--ink); }`;
  - the icons: `.theme-btn svg { width: 1.25rem; height: 1.25rem; }`, `.i-moon { fill: currentColor; }`, `.i-sun { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; }`;
  - which icon shows: the moon (offering dark) when the page is light, and the sun when it is dark. Set by a class on the button, `.theme-btn.is-dark .i-moon { display: none; }` and `.theme-btn:not(.is-dark) .i-sun { display: none; }`.
  - **Phone:** if the 390 px check finds the top bar too wide, add `@media (max-width: 420px) { .brand span { display: none; } }`. That hides only the word "Companion".
- **Code** (one small section, `/* ---------- theme switch ---------- */`, placed before the first render):
  ```js
  const THEME_KEY = "inn514-theme";
  const darkQuery = matchMedia("(prefers-color-scheme: dark)");
  const effectiveTheme = () => {
    const t = document.documentElement.dataset.theme;
    return t === "light" || t === "dark" ? t : (darkQuery.matches ? "dark" : "light");
  };
  try { const saved = localStorage.getItem(THEME_KEY); if (saved === "light" || saved === "dark") document.documentElement.dataset.theme = saved; } catch (e) {}
  function showThemeButton() {
    const dark = effectiveTheme() === "dark", label = dark ? "Switch to light theme" : "Switch to dark theme";
    const b = $("themeBtn"); b.classList.toggle("is-dark", dark); b.setAttribute("aria-label", label); b.title = label;
  }
  $("themeBtn").onclick = () => {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    showThemeButton();
  };
  darkQuery.addEventListener("change", showThemeButton);
  showThemeButton();
  ```
- **The claude.ai link:** the Claude app may set the page's theme attribute itself when you change the app's theme. Whichever changed last wins, and a tap on the switch always applies.
- **Never** change the colour tokens, and never use another localStorage key.

---

## Part S: the Canner Grokbot server (`server.js` at the repo root)

**Rules for the server:**
- No dependencies: only `node:http`, `node:fs`, `node:path`, `node:crypto` and the built-in `fetch`.
- Node 18 or newer.
- It listens on `process.env.PORT || 3000`.
- It answers `/` at once, because Canner health-checks it within 30 s.

### S1. Package files and static serving

- **`package.json`:**
  ```json
  {"name": "inn514-companion", "private": true, "version": "1.0.0", "main": "server.js",
   "scripts": {"start": "node server.js"}, "engines": {"node": ">=18"}}
  ```
- **`package-lock.json`,** written by hand (no `npm install`), because Canner wants a lockfile:
  ```json
  {"name": "inn514-companion", "version": "1.0.0", "lockfileVersion": 3, "requires": true,
   "packages": {"": {"name": "inn514-companion", "version": "1.0.0", "engines": {"node": ">=18"}}}}
  ```
- **Static serving (an allowlist only;** everything else is a 404 with the text "Not found"):
  - `GET /` and `/index.html` serve the root `index.html` with `text/html; charset=utf-8` and `Cache-Control: no-cache`.
  - `GET /robots.txt` serves `text/plain; charset=utf-8`.
  - `GET /site/audio/<name>`, where `<name>` matches `^[A-Z0-9]+-\d{2}\.mp3$`, serves `audio/mpeg` with `Accept-Ranges: bytes`, `Cache-Control: public, max-age=86400` and **Range support**:
    - `Range: bytes=a-b` or `bytes=a-` gives `206` with `Content-Range: bytes a-b/size`;
    - a range out of bounds gives `416`.
  - Never serve the README, the scripts, the plans, `site/data` or anything else.
- **Every response** gets `X-Content-Type-Options: nosniff`.
- **Log one line per request:** method, path, status and milliseconds. Never log headers or bodies.

### S2. `GET /api/health` and `POST /api/ask`

- **At start:**
  - read every `site/data/*.json` into memory: classes T1–T8 and B1, papers P01–P17;
  - read `RULES` and `NO_QUOTE` from `site/template.html` with `/^const RULES = (".*");$/m` and `/^const NO_QUOTE = (".*");$/m`, then `JSON.parse` the captured literal. If either is missing, exit with an error.
  - Catalog facts for the "where" line (class number, teacher, paper number, authors, year) come from the `DATA` JSON inside the root `index.html`; parse it with `/const DATA = (\{.*?\});\r?\n/s`.
- **`GET /api/health`:** `{"ok": true, "ask": <true when both OPENROUTER_API_KEY and GROKBOT_PASSCODE are set>, "voices": {"en": "<EN model>", "es": "<ES model>"}}`. No secrets.
- **The passcode check** (for both `/api/ask` and `/api/speak`):
  - compare the header `X-Grokbot-Passcode` with `GROKBOT_PASSCODE` using `crypto.timingSafeEqual` on SHA-256 digests of both;
  - a mismatch or a missing header gives `401 {"error": "passcode"}`.
- **Body:** at most 16 KB of JSON; more gives `413`, and bad JSON gives `400`.
- **`POST /api/ask` body:** `{id, chapter, question, history}`. Each field is checked, and a failure gives `400 {"error": "bad_request"}`:
  - `id`: a loaded id;
  - `chapter`: an integer index into its chapters;
  - `question`: 1–500 characters;
  - `history`: an array of at most 6 `{role: "user"|"assistant", content: 1–1500 chars}`.
- **The context text,** the same as `chapterContext` in A.2: `RULES` (+ `NO_QUOTE` for P02), `"\n\nChapter: "`, the where line, then `"\n---\n"`, the chapter's paragraphs with their page labels, and `"\n---"`.
- **The call:** `POST ${OPENROUTER_BASE}/chat/completions`.
  - Headers: `Authorization: Bearer ${OPENROUTER_API_KEY}`, `Content-Type: application/json`, `HTTP-Referer: https://inn514.canner.app`, `X-Title: INN514 Course Companion`.
  - Body: `{model, messages: [{role:"user", content: context}, ...history, {role:"user", content: question}], max_tokens: 450, temperature: 0.3}`.
  - The models are tried in order from `GROKBOT_ANSWER_MODELS`, default `google/gemma-4-31b-it:free,nvidia/nemotron-3-super-120b-a12b:free`. The next one is tried on a 429, a 5xx or a timeout (40 s each, `AbortSignal.timeout`).
  - The reply is `{"text": choices[0].message.content.trim()}`. If every model fails: `502 {"error": "upstream"}`, or `429` if the last failure was a 429.
- **`OPENROUTER_BASE`** defaults to `https://openrouter.ai/api/v1`. Tests point it at the mock.

### S3. `POST /api/speak` and the limits

- **Body:** `{text, lang}`.
  - `text` is 1–1500 characters;
  - `lang` is `"es-ES"` or `"en-GB"` (anything else counts as `"en-GB"`).
- **The model, chosen by language:**
  - `es`: `GROKBOT_VOICE_MODEL_ES` (default `fish-audio/s2.1-pro-free:free`) with the voice `GROKBOT_VOICE_ES` (default: leave `voice` out, so the provider uses its own default).
  - `en`: `GROKBOT_VOICE_MODEL_EN` (default `deepgram/flux-tts:free`) with `GROKBOT_VOICE_EN` (default `flux-alexis-en`).
  - If the English model fails (any non-200 or a timeout), try the Spanish model once with the same text.
- **The call:** `POST ${OPENROUTER_BASE}/audio/speech` with the same auth headers and body `{model, input: text, voice?, response_format: "mp3"}`, timeout 40 s. On success, return the bytes as `audio/mpeg`; otherwise `502 {"error": "upstream"}`.
- **Limits** (in memory; reset on restart):
  - per IP (from `X-Forwarded-For`'s first entry, else the socket address): at most `GROKBOT_RATE_PER_10MIN` (default 30) API calls in any 10 minutes;
  - per day (UTC): at most `GROKBOT_ASKS_PER_DAY` (default 150) asks and `GROKBOT_SPEAKS_PER_DAY` (default 300) speaks.
  - Over a limit: `429 {"error": "rate_limited"}`.
- **Secrets:** the key and the passcode are never sent back, logged or written anywhere. Errors returned to the page say only `passcode`, `bad_request`, `rate_limited` or `upstream`.

### S4. Tests: `scripts/mock_openrouter.mjs` and `scripts/test_server.mjs`

- **`mock_openrouter.mjs`:** a `node:http` server on the port given as `argv[2]`.
  - `POST /api/v1/chat/completions` returns `{"choices":[{"message":{"content":"First sentence. Second sentence."}}]}`.
  - `POST /api/v1/audio/speech` returns the bytes of `site/audio/T1-01.mp3` as `audio/mpeg`.
  - `GET /calls` returns every request it received (path, model, voice, first 200 characters of each message, and whether the auth header equalled `Bearer test-key`).
  - Setting `MOCK_FAIL=deepgram` makes it answer 500 for that model.
- **`test_server.mjs`:** starts the mock and `server.js` (with `OPENROUTER_BASE=http://127.0.0.1:<mock>/api/v1`, `OPENROUTER_API_KEY=test-key`, `GROKBOT_PASSCODE=test-pass`, `GROKBOT_RATE_PER_10MIN=20`), prints `PASS`/`FAIL` per check, ends with `ALL SERVER CHECKS PASSED` or the number failed, and always stops both processes.
  - **Static files:**
    - `/` is 200 html with the robots meta;
    - `/robots.txt` is 200;
    - `/site/audio/T1-01.mp3` is 200 `audio/mpeg` with the right length, and `Range: bytes=0-99` gives 206 with 100 bytes;
    - `/README.md`, `/scripts/build_site.py`, `/site/data/T1.json`, `/%2e%2e/index.html` and `/site/audio/../index.html` are all 404.
  - **Health:** `/api/health` gives `ask: true`.
  - **Asking:**
    - `/api/ask` without a passcode gives 401, and with a wrong one 401;
    - with `test-pass` and `{id:"T4", chapter:2, question:"What is upward causation?", history:[]}` it gives 200 `{text}`, and the mock saw a first message containing "You are a study helper" and the chapter title, with the auth header right;
    - `P02` includes "do not quote";
    - an unknown `id`, a bad chapter index, a 501-character question and 7 history turns each give 400.
  - **Speaking:**
    - `/api/speak` with `lang:"es-ES"` gives 200 `audio/mpeg`, and the mock saw `fish-audio/s2.1-pro-free:free`;
    - with `lang:"en-GB"` the mock saw `deepgram/flux-tts:free` with `flux-alexis-en`;
    - with `MOCK_FAIL=deepgram` an English call falls back to Fish.
  - **The rate limit:** the 21st call within the window gives 429.
  - **Secrets:** no response body or header, and no line of `server.js`'s output, contains `test-key` or `test-pass`.

### S5. Turning it on in Canner (at G1; Claude and you)

1. **Claude** pushes the server. With `package.json` present, Canner should detect Node and run `npm start`. If the deploy still shows a static site, switch the project's type to Node in its settings, or create a new Node project from the same repo. **You** do this, and Claude checks the address afterwards.
2. **You,** in Canner's **Env Vars** tab:
   - add `OPENROUTER_API_KEY` (mark it **sensitive**) and `GROKBOT_PASSCODE` (mark it **sensitive**; at least 8 characters, a phrase you can share with classmates if you want);
   - optionally add `GROKBOT_VOICE_EN` (one of the 36 Flux voices, such as `flux-alexis-en`) and `GROKBOT_VOICE_ES` (a Fish Audio voice id);
   - then redeploy.
   - **Strongly recommended:** make a **new OpenRouter key just for Canner**, with a **credit limit of 0**, so it can only ever use free models.
3. **Claude** checks:
   - `/api/health` gives `ask: true`;
   - `/api/ask` without a passcode gives 401;
   - an MP3 gives `audio/mpeg` and a Range request gives 206;
   - `/README.md` gives 404.
4. **You** test on your phone: enter the passcode, tap a chip and hear the answer in a Fish or Deepgram voice, and ask a typed Spanish question to get a Spanish answer.

**Free-tier note:** OpenRouter limits free models per day per account (fewer without purchased credits). When the limit is reached, the orb says "Too many questions right now".

---

## Part B: one-command pack sync (`scripts/sync_knowledge.py`, new)

```
C:/Python313/python.exe workspace/lecture-audio/scripts/sync_knowledge.py            # export + show what changed, no git writes
C:/Python313/python.exe workspace/lecture-audio/scripts/sync_knowledge.py --commit   # + pull --rebase, commit
C:/Python313/python.exe workspace/lecture-audio/scripts/sync_knowledge.py --push     # + push (implies --commit)
```

1. The hub path is `D:/Proyectos/watch/grok-watch-hub`, which `--hub <path>` overrides. Check that it is a git repo on `main`, and that nothing outside `knowledge/` has local changes; if something does, stop and say which files.
2. With `--commit` or `--push`: `git pull --rebase --quiet origin main` first.
3. Export by importing `export_knowledge.main(Path(hub) / "knowledge/inn514")`. Never copy its code.
4. Print `git status --short -- knowledge/inn514`. If nothing changed: "pack unchanged", and stop.
5. Commit only `knowledge/inn514/` with the message `knowledge: refresh the INN514 pack (YYYY-MM-DD)`.
6. Push with a plain `git push origin main`. If it is rejected, run `pull --rebase` once and push again; if that fails too, stop with the git message. Never force-push.
7. Never print tokens or remote URLs that contain credentials.

The executor runs only the default mode (no flags).

---

## Part C: Grokbot test kit (the watch)

- **C1. `GROKBOT_TEST.md` and `checks/grokbot_tests.json`:** 12 questions written from the pack files only.
  - **The mix:** 4 class questions; 5 paper questions, one of them a page question such as "página 764"; 1 Paper 2 question (the answer must paraphrase it); 1 Paper 4 question; 1 out-of-scope question.
  - **Each question has:**
    - the Spanish sentence to say, starting with "Grok principal,";
    - the expected source, `{"class": "4", "chapter": 3}` or `{"paper": 14, "page": 764}`;
    - 2 or 3 short facts copied from the pack;
    - for the out-of-scope question, `"expect_not_covered": true`.
- **C2. `scripts/check_outbox.py`:** read-only.
  - Flags: `--pull` (Claude or you only), `--ids …` or `--since <ts>`, and `--hub <path>`.
  - It matches each reply in `outbox/<id>.json` to its question through `inbox/*-<id>.json`, then checks:
    - `status == "done"`;
    - `speak` names the expected source;
    - it is in Spanish;
    - it is 8 sentences or fewer;
    - the out-of-scope case says "no cubre", "no aparece", "no trata" or "no está".
  - It prints PASS or FAIL per check and the spoken text.
- **C3. Dry run:** a scratch hub folder with 2 fake pairs (one right, one wrong); the output must show one PASS and one FAIL.
- **The real test at G3:** you say the 12 questions to the watch, then Claude runs `check_outbox.py --pull --since <start>` and checks the answers' facts against the pack.

---

## Part H: the front-page course chat (added 2026-10-24; both sites)

The student asked for Grokbot on the front page to be a real chatbot. You ask anything about the course; Grokbot finds the right class or paper chapter, answers out loud, and says where the answer comes from. The chapter orbs stay exactly as they are.

### H.0 What you see

The greeting card (`section.greet`, A.0) becomes the chat. The card, its 56px orb (44px on phones) and its phone layout stay; only its inside changes:

```
( orb )  Ask Grokbot about the course
         Ask anything about the classes or the papers. Grokbot finds the right chapter and
         answers out loud. You can also open any chapter and tap Ask about this chapter.
         [Enter the passcode to ask questions] [••••••] (OK)     ← server mode only, until a passcode works
         [ Ask about any class or paper…                ] (Ask)
         Thinking…  /  Speaking…  (Stop)                        ← status line, aria-live="polite"
         From Class 4, chapter 3: <title>; Paper 7, chapter 3: <title>    ← links to #T4 and #P07
         <honesty line for the mode>
         Asking isn't switched on in this copy of the site yet.  ← only when asking is off (A.0)
```

- **Copy** (verbatim):
  - heading: "Ask Grokbot about the course"
  - text: "Ask anything about the classes or the papers. Grokbot finds the right chapter and answers out loud. You can also open any chapter and tap **Ask about this chapter**."
  - input placeholder and `aria-label`: "Ask about any class or paper…"
  - button: "Ask"
  - sources line: "From " + the links joined with "; ". Each link's text is `<Class 4 | Paper 7 | Bonus class>, chapter <n>: <chapter title>` and its `href` is `#<id>`.
  - honesty lines: `COURSE_DEVICE_NOTE` (claude mode) and `COURSE_SERVER_NOTE` (server mode), H.1.
- **When asking is off** (`body:not(.can-ask)`): the passcode row, the form, the status, the sources and the honesty line are all hidden. The rest of the card shows as before, including the "Asking isn't switched on…" line under `body.ask-checked:not(.can-ask)`.
- **Each question stands alone:** no history, no chips.
- **Speech and fallbacks** are the chapter panel's:
  - claude mode: the device voice, sentence by sentence;
  - server mode: `/api/speak` (Fish or Deepgram), then the device voice, then text;
  - Stop; the lecture player pauses; a route change (including tapping a source link) stops speech.
- **Text backup:** the same `p.ask-text` with "This device has no voice, so here is the answer as text."

### H.1 How it answers: pick, then answer

1. **Pick.** The model gets `PICK_RULES`, the course index, then "Question: " and the question. It replies with a JSON array of at most 2 `{"id": "T4", "chapter": 3}` objects, or `[]`.
   - `chapter` is the chapter's `n` (1-based, as shown in the index), never the array index.
   - **The index,** one line per chapter, about 154 lines, classes first (`DATA.catalog` order), then papers (`DATA.readings` order):
     - class: `T4 3: Class 4, Entrepreneurial ecosystems and sustainable transformation; chapter 3: <chapter title>`
     - paper: `P07 3: Paper 7, Stam & van de Ven (2021), Entrepreneurial ecosystem elements; chapter 3: <chapter title>`

     That is `${id} ${ch.n}: ${className(c)}, ${c.title}; chapter ${ch.n}: ${ch.title}` for a class and `${id} ${ch.n}: ${className(c)}, ${c.authors} (${c.year}), ${c.title}; chapter ${ch.n}: ${ch.title}` for a paper, joined with "\n".
   - **Cleaning the picks** (`cleanPicks`, the same rules on the page and the server): keep only objects whose `id` is a string with chapters in the data and whose `chapter` is an integer matching some chapter's `n`; drop repeats; keep the first 2.
2. **Answer.** The model gets one user message: `COURSE_RULES` (plus `NO_QUOTE` when a pick is P02), "\n\n", then each picked chapter's `chapterBlock` joined with "\n\n". A second user message holds the question.
3. **Nothing picked** (an empty array after cleaning): no second call. Speak `NOT_COVERED_ES` if `askLang(question, false)` is `"es-ES"`, else `NOT_COVERED_EN`, with no sources line.

**New one-line constants in the template**, right after `NO_QUOTE`, each on its own line and in exactly this form (`server.js` reads the first four by regex, like `RULES`):

```js
const PICK_RULES = "You choose where in the INN514 course companion a student's question is answered. Below is the list of chapters, one per line, as \"ID N: description\". Reply with only a JSON array of at most two objects like {\"id\": \"T4\", \"chapter\": 3} for the chapters most likely to answer the question, best first, or [] if none of them covers it.";
const COURSE_RULES = "You are a study helper for the master's course INN514, \"Innovation systems and sustainable transformation\". Answer the student's question using only the chapters below from the course companion. Your answer will be read aloud by a speech engine, so write plain spoken sentences: no lists, no headings, no symbols, no brackets. Use 3 to 6 sentences unless the student asks for more. Answer in the language of the student's question. Say which class or paper and which chapter the answer comes from, in words, and give the page when the chapter gives one. If the chapters do not answer the question, say so in one sentence. Never invent authors, numbers, dates or quotations.";
const NOT_COVERED_EN = "I couldn't find that in the course companion. Try asking about a class or a paper in other words.";
const NOT_COVERED_ES = "No encontré eso en el compañero del curso. Prueba a preguntarlo de otra forma.";
const COURSE_SERVER_NOTE = "Answers are written by a free AI model from the course companion's text and read aloud by an AI voice. Don't type personal details.";
const COURSE_DEVICE_NOTE = "Answers are written by AI from the course companion's text and read aloud by your device.";
```

**Claude mode** (the claude.ai link):
- The pick: `await sampleFn.json(PICK_RULES + "\n\n" + courseIndex() + "\n\nQuestion: " + question, { modelTier: "quick", signal: ctl.signal, cache: false })`, then `cleanPicks`.
- The answer: `streamClaudeAnswer(panel, turns, lang, false, null)` with the turns from step 2.

**Server mode** (Canner): `POST /api/course` with `{"question": "…"}` and the `X-Grokbot-Passcode` header.
- In this order: `guessingLocked` → 429; `passcodeOk`, else `noteBadPass` and 401; `limitsOk(req, "ask", 2)` → 429; a question that is not a string of 1–500 characters → 400.
- The pick: `askUpstream([{ role: "user", content: <the pick text, built as in claude mode> }], { max_tokens: 120, temperature: 0 })`. Read the first `[...]` in the reply (`/\[[\s\S]*?\]/`) with `JSON.parse` in try/catch (unreadable means `[]`), then `cleanPicks`.
- The answer: `askUpstream([{ role: "user", content: <COURSE_RULES + blocks> }, { role: "user", content: question }])`.
- Replies: `200 {"text": "…", "sources": [{"id": "T4", "chapter": 3}]}`; `200 {"text": NOT_COVERED_EN or NOT_COVERED_ES, "sources": []}` with no second call; an upstream failure in either step gives 429 or 502, exactly as `/api/ask`.

### H.2 Code shape (reuse; never copy a function)

**H1 is a refactor with no change in behaviour.** In `site/template.html`:

```js
// Split out of chapterContext; chapterContext's output stays byte-for-byte the same.
function chapterBlock(id, i) {
  const c = entry(id), ch = DATA.lectures[id].chapters[i], reading = isReading(id);
  const where = /* the two where lines from today's chapterContext, unchanged */;
  const body = /* today's body line, unchanged */;
  return "Chapter: " + where + "\n---\n" + body + "\n---";
}
function chapterContext(id, i) {
  return RULES + (id === "P02" ? NO_QUOTE : "") + "\n\n" + chapterBlock(id, i);
}
// The error table from today's askSend catch, moved unchanged (the codes and the six messages).
function claudeError(panel, e) { const status = panel.querySelector(".ask-status"); /* … */ }
// Today's askSend body from `const st = panel._ask;` to the end, moved unchanged, except:
// `turns`, `lang` and `cache` come in as arguments, the history update moves into `onDone`,
// and the catch's message table becomes `claudeError(panel, e)`.
function streamClaudeAnswer(panel, turns, lang, cache, onDone) { /* … */ }
function askSend(id, i, panel, question, isChip) {
  if (askMode === "server") { askSendServer(id, i, panel, question, isChip); return; }
  if (askMode !== "claude" || !sampleFn) return;
  const st = panel._ask;
  const turns = [{ role: "user", content: chapterContext(id, i) }, ...st.hist, { role: "user", content: question }];
  streamClaudeAnswer(panel, turns, askLang(question, isChip), isChip && st.first ? undefined : false, (buf) => {
    st.hist.push({ role: "user", content: question }, { role: "assistant", content: buf });
    st.hist = st.hist.slice(-6);   // the conversation keeps at most the last 6 turns
    st.first = false;
  });
}
// Today's askSendServer from `const first = text.match(` to the end of the for loop, plus its last
// line (`st.pending = null; serverClearBusy(panel);`), moved unchanged; `st` is `panel._ask`.
async function speakServerAnswer(panel, text, lang, ctl) { const st = panel._ask; /* … */ }
// askSendServer keeps its start, its history update and its outer try/catch, and calls
// `await speakServerAnswer(panel, text, lang, ctl);` where the moved code was.
// The passcode row wiring from askToggle (submitPass and its two handlers), moved unchanged,
// except that the resend is passed in.
function wirePass(panel, resend) { /* … */ }   // askToggle: wirePass(panel, (p) => askSend(p.id, p.i, panel, p.question, p.isChip));
```

One more H1 change, the only edit inside moved code: in `streamClaudeAnswer`'s `show` and in `serverShowText`, replace `panel.insertBefore(t, status)` (and `panel.insertBefore(t, panel.querySelector(".ask-status"))`) with `status.before(t)`. For a chapter panel the text lands in the same place; in the greet card the status sits inside `.greet-body`, where `insertBefore` on the section would throw.

**H2 to H5** add, in `site/template.html`:

```js
function courseIndex() { /* H.1 index lines from DATA.catalog then READINGS, joined with "\n" */ }
function cleanPicks(arr) { /* H.1 cleaning rules; returns [{ id, chapter }] */ }
function chapterIndexOf(id, n) { return DATA.lectures[id].chapters.findIndex((ch) => ch.n === n); }
function courseNote() {
  const n = document.querySelector(".greet .ask-note");
  if (n) n.textContent = askMode === "server" ? COURSE_SERVER_NOTE : COURSE_DEVICE_NOTE;
}
function showSources(panel, picks) { /* fills p.greet-src: "From " + links joined with "; "; empties it for [] */ }
function wireCourse(panel) {   // called at the end of renderHome with the greet section
  panel._ask = { hist: [], first: true, ctl: null, busy: "", pending: null };
  const input = panel.querySelector(".ask-input");
  const typed = () => { const q = input.value.trim(); if (q) { input.value = ""; askCourse(panel, q); } };
  panel.querySelector(".ask-send").onclick = typed;
  input.onkeydown = (e) => { if (e.key === "Enter") typed(); };
  wirePass(panel, (p) => askCourse(panel, p.question));
  courseNote();
}
async function askCourse(panel, question) { /* H3 claude mode, H5 server mode; below */ }
```

**`askCourse`, step by step:**
1. `if (openAsk && openAsk !== panel) closeAsk(openAsk); openAsk = panel; startBlink(panel);` so that a route change stops it, as for a chapter panel.
2. Server mode with no passcode: set `st.pending = { question }`, show the passcode row, focus it, and return (as `askSendServer` does).
3. Stop anything running (`st.ctl` abort, `speechSynthesis.cancel()`, `orbAudio.pause()`), make a new `AbortController`, set `st.ctl`, clear the sources line, and `serverSetBusy(panel, "Thinking…")`.
4. **Claude mode:** the pick with `sampleFn.json`. On an error: return if aborted, else `serverClearBusy(panel)` and `claudeError(panel, e)`. If `cleanPicks` is empty: `serverClearBusy(panel)`, then `streamClaudeAnswer` is not called, and the not-covered sentence is spoken with `voiceFor(lang)` and `speakSentence` (text backup if there is no voice). Otherwise `showSources`, then `streamClaudeAnswer(panel, turns, lang, false, null)`.
5. **Server mode:** `fetch("/api/course", …)` with `signal: ctl.signal`. Not ok: throw an error carrying `status`, and send it to `serverError(panel, e)` (401 also shows the passcode row again). On success: `showSources(panel, out.sources)`, then `await speakServerAnswer(panel, out.text, lang, ctl)`; for `sources: []` the server's not-covered text is spoken the same way.
6. After every `await`: return if `ctl.signal.aborted` or `panel._ask !== st`.

**The greet section's new markup** (H2), inside `.greet-body` after the text paragraph, using the chapter panel's classes so the helpers work unchanged:

```html
<div class="ask-pass" hidden>
  <label for="ask-pass-course">Enter the passcode to ask questions</label>
  <input id="ask-pass-course" type="password" autocomplete="off">
  <button type="button">OK</button>
</div>
<div class="ask-form">
  <input class="ask-input" type="text" placeholder="Ask about any class or paper…" aria-label="Ask about any class or paper">
  <button class="ask-send" type="button">Ask</button>
</div>
<p class="ask-status" aria-live="polite"></p>
<p class="greet-src"></p>
<p class="ask-note"></p>
<p class="greet-off">Asking isn't switched on in this copy of the site yet.</p>
```

- **CSS (H2):**
  - `.greet .ask-pass, .greet .ask-form, .greet .ask-status, .greet .greet-src, .greet .ask-note` show only under `body.can-ask`, with `margin-top: var(--sp-3)` on the form. Keep `.ask-pass[hidden]` working.
  - `.greet-src` uses `var(--s-1)` and `var(--muted)`; its links use the site's normal link style; it is hidden while empty (`:empty`).
  - On phones (≤520px), `.greet-body` is already `display: contents`, so each new row needs `grid-column: 1 / -1`.
  - `p.ask-text` inside the greet uses the panel's existing `.ask-text` style.
  - No new colours, no shadows, no all caps.
- **Mode detection:** the detection IIFE calls `courseNote()` after it sets `can-ask`, because the front page can render before detection finishes.

**In `server.js` (H4):**

```js
// Startup: read PICK_RULES, COURSE_RULES, NOT_COVERED_EN and NOT_COVERED_ES like RULES; if any is
// missing, fail with "PICK_RULES, COURSE_RULES or NOT_COVERED_* missing from site/template.html".
function blockFor(id, i) { /* split out of contextFor, as chapterBlock on the page */ }
function contextFor(id, i) { return DB.rules + (id === "P02" ? DB.noQuote : "") + "\n\n" + blockFor(id, i); }
function courseIndex() { /* H.1 index lines from DB.catalog then DB.readings */ }   // built once at startup
function cleanPicks(arr) { /* H.1 cleaning rules */ }
const langOf = (q) => /* askLang's typed-question rule, copied from the template as a one-line arrow */;
async function askUpstream(messages, opts = {}) {
  /* unchanged, except the body is
     { model, messages, max_tokens: opts.max_tokens || 450, temperature: opts.temperature ?? 0.3 } */
}
function limitsOk(req, kind, cost = 1) {
  /* unchanged, except: `recent.length + cost > limit` instead of `>=`, the daily check uses
     `+ cost >`, and an admitted call pushes `cost` timestamps and adds `cost` to the day's count */
}
```

`/api/course` sits next to `/api/ask` and reuses `readBody`, `bad()` and the reply shapes of `/api/ask`.

### H.3 Tests

**`scripts/mock_openrouter.mjs` (H4).** A chat call whose first message starts with "You choose where" is a pick:
- if that message contains "nothing-matches", it replies `[]`;
- if it contains "unknown-pick", it replies `Here you go: [{"id": "T99", "chapter": 1}, {"id": "T4", "chapter": 99}]`;
- otherwise it replies `[{"id": "T4", "chapter": 3}]`.

Every other chat call still replies "First sentence. Second sentence.".

**`scripts/test_server.mjs` (H4)**, added to the normal run. Send every `/api/course` request with the header `X-Forwarded-For: 203.0.113.50`, so it counts against its own address and the existing "21st call" count is untouched. Count the mock's chat calls before and after each request (`callsFromMock`).
- `/api/course` without a passcode returns 401.
- With the passcode, "What is an entrepreneurial ecosystem?" returns 200 with `sources` equal to `[{"id":"T4","chapter":3}]` and `text` equal to the mock answer. The mock saw exactly 2 chat calls for it; the second one's `context` contains "You are a study helper" and `t4.chapters[2].title`.
- "nothing-matches" returns 200 with `text` equal to `NOT_COVERED_EN` and `sources: []`, and the mock saw exactly 1 chat call.
- "¿Qué es nothing-matches?" returns `NOT_COVERED_ES`.
- "unknown-pick" returns `sources: []` and `NOT_COVERED_EN`.
- A 501-character question returns 400.
- The cost: give `startServer` an optional third argument of settings merged over its defaults. A separate server started with `{ GROKBOT_RATE_PER_10MIN: "3" }` answers one `/api/course` (200), refuses a second (429, since 2 + 2 > 3), and still answers one `/api/ask` (200). Stop it cleanly.
- The existing secret checks cover the new replies too.

**`scripts/check_page.mjs` (H6).** Every existing check stays.
- **Plain file:** the greet form is hidden (`.greet .ask-form` not displayed) and the off line shows.
- **Claude mock:** the mock's sample function also gets `.json = async (input, opts) => …`. It records `input` and `opts.modelTier` in `window.__lastJson`, and returns `[{id:"P02",chapter:2}]` if `input` contains "trinity", `[]` if it contains "nothing-matches", and `[{id:"T4",chapter:3}]` otherwise. On the front page:
  - typing "What is an entrepreneurial ecosystem?" and tapping Ask gives `opts.modelTier === "quick"`, a pick input that contains "T4 3:" and "P07 1:", a sources line with one link to `#T4` whose text contains "Class 4, chapter 3", and the answer in `.greet .ask-text` (the mock has no voices);
  - a question with "trinity" sends a sample whose first turn contains "do not quote";
  - "nothing-matches" shows `NOT_COVERED_EN` in `.greet .ask-text` and makes no `sample` call.
- **Server mode** (with `mock_openrouter.mjs`): remove `inn514-grokbot-pass` from `localStorage` first, then on the front page the passcode row shows first; after the passcode, the question reaches `/api/course`, the sources line links `#T4`, and `/api/speak` is called.
- **Phone, 390px:** no horizontal scroll on the front page with an answer and sources showing; screenshots `checks/phone-home-chat.png` and, in dark mode, `checks/phone-home-chat-dark.png`.
- **The H1 guard:** before changing anything, H1 saves `chapterContext("T4", 2)` and `chapterContext("P02", 1)` from the built page to `checks/context-before.txt`. A new check compares the built page's output with that file and must match exactly.

### H.4 Tasks

| Task | What it is |
|---|---|
| H1 | Refactor only (H.2): `chapterBlock`, `claudeError`, `streamClaudeAnswer`, `speakServerAnswer`, `wirePass`; the `checks/context-before.txt` guard; full `check_page.mjs` run, ALL PAGE CHECKS PASSED |
| H2 | The six constants, `courseIndex`, `cleanPicks`, `chapterIndexOf`, `courseNote`, the greet markup and CSS, and `courseNote()` in the detection IIFE |
| H3 | `showSources`, `wireCourse`, `askCourse` in claude mode, the not-covered sentence |
| H4 | `server.js`: constants, `blockFor`, `courseIndex`, `cleanPicks`, `langOf`, `askUpstream` options, `limitsOk` cost, `/api/course`; the mock's pick replies; the `test_server.mjs` checks; ALL SERVER CHECKS PASSED |
| H5 | `askCourse` in server mode (`/api/course`, passcode row, `speakServerAnswer`, errors) |
| H6 | The `check_page.mjs` front-page checks and screenshots, full run (ALL PAGE CHECKS PASSED), then `build_static.py` |
| G4 | **STOP GATE G4** |

---

## Rules for ZCode + GLM 5.3 Flash (put verbatim in the kickoff)

- **Work only in** `D:/HVL2025/514/workspace/lecture-audio/`.
- **May edit:** `site/template.html` and `scripts/check_page.mjs`; for Part H also `server.js`, `scripts/mock_openrouter.mjs` and `scripts/test_server.mjs`.
- **May create:** `server.js`, `package.json`, `package-lock.json`, `scripts/mock_openrouter.mjs`, `scripts/test_server.mjs`, `scripts/sync_knowledge.py`, `scripts/check_outbox.py`, `GROKBOT_TEST.md`, `checks/grokbot_tests.json` and `checks/context-before.txt`.
- **May tick:** `PROGRESS_GROKBOT_ZCODE.md`.
- **May run**, from `D:/HVL2025/514`:
  - `build_site.py` and `build_static.py`;
  - `node workspace/lecture-audio/scripts/check_page.mjs > workspace/lecture-audio/checks/page-check.log 2>&1`;
  - `node workspace/lecture-audio/scripts/test_server.mjs`;
  - `sync_knowledge.py` with **no flags**;
  - `check_outbox.py --hub <scratch folder>`;
  - `export_knowledge.py <scratch folder>`.
- **Must not:**
  - run any git command, publish anything, or sign in to Canner or OpenRouter; run the Canner CLI or touch `canner.json`;
  - **write any real key or passcode in any file**, or call the real OpenRouter; tests use only `mock_openrouter.mjs`, with `test-key` and `test-pass`;
  - run `npm install` or any other install; `package-lock.json` is written by hand;
  - touch `D:/Proyectos/watch`, except to read `grok-watch-hub/knowledge/`, `inbox/` and `outbox/`;
  - edit `lectures/`, `readings/`, `site/data/`, `site/audio/`, `cache/`, `site/reviewed.json`, `build_site.py`, `build_static.py`, `export_knowledge.py` or any other script;
  - load scripts from the web;
  - write "Claude", "Anthropic" or "xAI" in the template;
  - use all caps, " · " joins, "→" in link text, or card shadows (the orb's glow is the only exception);
  - invent wording: use this plan's copy word for word, and list any line you had to add in the report.
- **Working method:**
  - One task per conversation.
  - Read only the section you change.
  - After every template task, run `build_site.py`. After every server task, run `test_server.mjs` (from S4 on).
  - Tick a box only with its evidence pasted under it, then stop.
  - At a gate, write "STOP GATE G<n>: ask Claude Code to review and publish." and stop.

**Tasks (one box each), in this order:**

| Task | What it is |
|---|---|
| A1 | CSS: `.ask-btn`, `.ask`, chips, input, passcode row, status, `.ask-text`, orb states, reduced motion |
| A2 | Orb SVG + gradient definition, per-chapter `.ask-btn` (hidden without `.can-ask`), panel markup with the passcode row (hidden) |
| A3 | `RULES` and `NO_QUOTE` on one line each, mode detection, `chapterContext`, chips and typed question, the claude-mode call with the text shown |
| A4 | Device voice: speech queue, sentence splitting, voices, language detection, Stop, pausing the player, text backup |
| A5 | Error messages, one panel at a time, follow-up history (6 turns), close and stop on route change |
| S1 | `package.json`, `package-lock.json`, `server.js` static serving (allowlist, MIME types, Range, robots, health stub) |
| S2 | `server.js`: data and RULES loading, passcode, `/api/health`, `/api/ask` with model fallback |
| S3 | `server.js`: `/api/speak`, voice choice, English fallback, per-IP and daily limits |
| S4 | `scripts/mock_openrouter.mjs` + `scripts/test_server.mjs`, all checks PASS |
| A6 | Server mode in the page: passcode row and storage, `askServer`, `/api/speak` playback in order, fallbacks, the server honesty line |
| A6b | The light/dark switch in the top bar (plan A.4) |
| A7 | `check_page.mjs`: the claude mock pass, the server mode pass and the theme switch pass from A.3, screenshots, full run (ALL PAGE CHECKS PASSED), then `build_static.py` |
| G1 | **STOP GATE G1** |
| H1–H6 | Part H, the front-page course chat (table in H.4); it comes right after G1 and before B1 |
| G4 | **STOP GATE G4** |
| B1 | `sync_knowledge.py` |
| B2 | Its default run, which must report "pack unchanged" |
| G2 | **STOP GATE G2** |
| C1 | Test questions |
| C2 | `check_outbox.py` |
| C3 | Dry run with fake files |
| G3 | **STOP GATE G3** |

## Verification (Claude, at each gate)

- **G1:**
  - **Manifest and checks:** the manifest still matches; `build_site.py`, `check_page.mjs`, `test_server.mjs` and `build_static.py` all pass.
  - **Screenshots:** read every one, light and dark.
  - **Code review:**
    - `server.js` serves only the allowlist and never echoes or logs a secret; the passcode is compared in constant time; the limits work;
    - the page makes no network call in claude mode, and in server mode calls only `/api/*` on its own origin;
    - the prompt and the Paper 2 rule are as specified;
    - a new controller per call, no retry loops, and everything stops on Stop and on route change.
  - **The scan** from G0 (secrets, Paper 2), then **publish:**
    - the claude.ai link with `capabilities: {sample: {}}`;
    - a commit and push.
  - **S5:** Canner on Node, your environment variables, and Claude's checks of `/api/health`, 401, MP3 range and 404.
  - **You:** test both places on your phone, then approve G1.
- **G4:**
  - **Manifest and checks:** as at G1, plus the `context-before.txt` guard and the new `/api/course` and front-page checks.
  - **Screenshots:** `phone-home-chat.png` and `phone-home-chat-dark.png`, and the earlier ones unchanged.
  - **Code review:** H1 moved code without changing it (diff the moved bodies); `/api/course` checks the passcode, the lock and the cost of 2 before any upstream call; the page sends the pick and the answer only to `sample` (claude mode) or `/api/course` and `/api/speak` (server mode); P02 always adds `NO_QUOTE`; no history in the course chat.
  - **The scan,** then **publish:** commit and push (Canner redeploys) and republish the claude.ai link with `capabilities: {sample: {}}`.
  - **You:** on both sites, ask "What is upward causation?" and a Spanish question on the front page, then use one chapter orb; approve G4.
- **G2:** `sync_knowledge.py` (no flags) prints "pack unchanged"; at the next content change, `--push`.
- **G3:** the 12 watch questions, then `check_outbox.py --pull --since <start>`, all PASS; Claude checks the facts; you approve.
