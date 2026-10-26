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
   own account, `sample`)        (openrouter/free, fallback Nemotron 3.5 Super VL) → answer text
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
  - **Replaced on 2026-10-24:** Part H swaps the per-chapter panels and this card for Grokbot, the floating avatar. A.0 to A.3 describe what G1 shipped.
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

**Changed 2026-10-24, at the student's request: the passcode is optional.**
- When `GROKBOT_PASSCODE` is unset or empty, anyone may ask. `/api/health` then reports `ask: true, passcode: false`, and the page shows no passcode box.
- Canner has no passcode set; the free models and the per-IP and daily limits still apply.
- Setting `GROKBOT_PASSCODE` again (runtime scope) brings the passcode back without a code change.

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
  - Body: `{model, messages: [{role:"user", content: context}, ...history, {role:"user", content: question}], max_tokens: 1000, temperature: 0.3}`. (1000 since 2026-10-24: room for a reasoning model's thinking. An empty answer tries the next model.)
  - The models are tried in order from `GROKBOT_ANSWER_MODELS`, default `nvidia/nemotron-3.5-super-vl:free,openrouter/free` since 2026-10-26, after timing on Canner (Nemotron 3.5 Super VL gave the first sentence in 3–5 s every time; `openrouter/free` varied from 3 to 26 s; Gemma 4, Xing 4.0 and Nemotron 3 Super were busy or unavailable; low reasoning effort made little difference, so `GROKBOT_REASONING` stays unset). Before that: `openrouter/free` first (2026-10-24), and earlier Gemma 4 31B, then Nemotron 3 Super. The next one is tried on a 429, a 5xx or a timeout (40 s each, `AbortSignal.timeout`).
  - The reply is `{"text": choices[0].message.content.trim()}`. If every model fails: `502 {"error": "upstream"}`, or `429` if the last failure was a 429.
- **`OPENROUTER_BASE`** defaults to `https://openrouter.ai/api/v1`. Tests point it at the mock.

### S3. `POST /api/speak` and the limits

- **Body:** `{text, lang}`.
  - `text` is 1–1500 characters;
  - `lang` is `"es-ES"` or `"en-GB"` (anything else counts as `"en-GB"`).
- **The model, chosen by language:**
  - `es`: `GROKBOT_VOICE_MODEL_ES` (default `fish-audio/s2.1-pro-free:free`) with the voice `GROKBOT_VOICE_ES` (default: leave `voice` out, so the provider uses its own default).
  - `en`: `GROKBOT_VOICE_MODEL_EN`, default `fish-audio/s2.1-pro-free:free` since 2026-10-24 (the student's choice). Before that it was `deepgram/flux-tts:free`, which needs `GROKBOT_VOICE_EN` (default `flux-alexis-en`, sent only to a `deepgram/` model). When the English model is not Fish, a failure falls back to Fish once.
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

## Part H: Grokbot, the floating avatar (rewritten 2026-10-24; both sites, every page)

The student found the per-chapter panels and the front-page card "horrible". They asked for **just the Grok avatar**: one character floating over the site, like the old Windows XP paperclip assistant, that you can drag anywhere and ask a question.

- **Removed:** every per-chapter "Ask about this chapter" button and panel, and the front-page greeting card, with their markup, CSS and checks.
- **Kept:** every speech, passcode, error and server path that works today, and `/api/ask`.
- **Added:** course-wide answers (pick the chapters, then answer) and `/api/course`.

**The student's decisions (2026-10-24):**
- **On a class or paper page,** Grokbot answers from that chapter first: the one playing, or else the one on screen. A "Whole course" switch searches everything. On every other route it searches the whole course.
- **The bubble shows the words as they are spoken,** with the source underneath.

**The look:**
- Grokbot keeps **the site's own orb**: the light gradient body, rim, glow and two tilted rounded eyes, the same geometry as the old `ORB_SVG`.
- Only the **motion** comes from the watch avatar (`D:/Proyectos/watch/grok-watch/docs/mockup.html`, function `draw`). The watch's own orb design is not used, because the site is public.

### H.0 What you see

```
                     ┌────────────────────────────────────────────────────┐
                     │ About Class 4, chapter 3: <title>   (Whole course) (×)
                     │ Hi, I'm Grokbot. Ask me about this chapter and I'll answer out loud.
                     │ You can drag me anywhere on the page.          ← until the first drag
                     │ [Enter the passcode to ask questions] [••••] (OK)   ← server mode only
                     │ [Explain this simply] [Give me an example] …   ← chapter mode only
                     │ [ Ask about this chapter…                ] (Ask)
                     │ <the answer's words, part by part as it is spoken>
                     │ From Paper 7, chapter 3: <title>               ← course mode, links
                     │ Thinking…  /  Speaking…  (Stop)
                     │ <honesty line>
                     └──────────────────────────────────────▽─────────────┘
                                                        ( •  • )  ← the orb, 72px (56px on phones)
```

**The orb:**
- `#grokbot` sits in the page body right after the player, outside `#view`, so it never re-renders on a route change.
- It shows only under `body.can-ask`. Where asking is off (a plain file, say), there is no Grokbot and no "off" message.
- **First position:** bottom right, 16px from the right edge, just above the player when the player shows (8px gap), or 16px from the bottom when it doesn't.
- **Dragging** works with mouse and touch (`touch-action: none` on the orb).
  - A pointer that moves more than 6px is a drag; anything less is a tap.
  - The orb stays inside the viewport: 16px from the left and right edges, 8px below the top bar, and 8px above the player.
  - It saves its place as `inn514-grokbot-pos` in `localStorage`, with try/catch on every read and write. It is clamped again on resize and whenever the player starts or stops playing.
- **A tap** opens or closes the bubble and makes Grokbot hop happily for 1 second.
- **Keyboard:** the orb is `<button aria-label="Ask Grokbot" aria-expanded="false|true">`.
  - Enter or Space toggles the bubble (the button's own click).
  - While the orb has focus, the arrow keys move it 16px, or 64px with Shift, and save the place.
  - Escape closes the bubble and puts focus back on the orb.

**The bubble:**
- `section.gb-bubble`, `role="dialog"`, `aria-label="Grokbot"`. It is a speech bubble in the site's tokens, with a tail pointing at the orb.
- **Placement:** above the orb when there is room, else below. It is aligned to the orb's side of the screen and kept 16px inside the viewport.
- **Size:** `min(22rem, 100vw - 32px)` wide, full width minus 16px each side on phones (≤520px), and at most `min(70vh, 32rem)` tall, with its inside scrolling.
- **Closing:** it stays open when you tap elsewhere. It closes with its × button, Escape, a tap on the orb, or a route change. A route change also stops speech; the orb stays.

**Context:**
- **Chapter mode:** on a class or paper route, unless the bubble has been switched to "Whole course".
  - The chapter is the one playing, if the player has this lecture loaded and is not paused.
  - Otherwise it is the last `section.chapter` whose top is above 40% of the viewport height, or chapter 0 if none is.
  - It is worked out when the bubble opens and again before every question.
- **Course mode:** every other route, or after "Whole course".
- **The switch:** "Whole course" switches the open bubble to course mode, and "This chapter" switches back. The switch shows only on class and paper routes, and a route change resets it to chapter mode.
- **Memory:** a chapter conversation keeps its last 6 turns, as today. It is cleared when the chapter or mode changes and when the bubble closes. Course questions stand alone.

**Words:**
- Each spoken part is added to `.gb-words` when it starts playing. In claude mode a part is a sentence. In server mode it is the first sentence, then the rest.
- The words clear at each new question.
- With no voice at all, the whole answer appears, after the line "This device has no voice, so the answer is only written."

**Front page:**
- The greeting card goes.
- "How to use this site" gets one more item, shown only under `body.can-ask` (`class="gb-only"`): **Ask**, "Tap Grokbot, the round face in the corner, and ask a question. It answers out loud and in writing, and says where the answer comes from. Drag it anywhere it's in the way."

**Copy** (verbatim):

| Where | Chapter mode | Course mode |
|---|---|---|
| `.gb-head` | `className(c) + ", chapter " + ch.n + ": " + ch.title`, with "About " in front | "About the whole course" |
| `.gb-switch` | "Whole course" | "This chapter" (only on class and paper routes; hidden elsewhere) |
| `.gb-hello` (shown while `.gb-words` is empty) | "Hi, I'm Grokbot. Ask me about this chapter and I'll answer out loud." | "Hi, I'm Grokbot. Ask me anything about the classes or the papers. I'll answer out loud and say where it comes from." |
| `.ask-input` placeholder and `aria-label` | "Ask about this chapter…" | "Ask about any class or paper…" |
| `.ask-note` | `SERVER_ASK_NOTE` or `DEVICE_ASK_NOTE` | `COURSE_SERVER_NOTE` or `COURSE_DEVICE_NOTE` |

- **`.gb-hint`,** shown until the first drag or keyboard move (`inn514-grokbot-moved` in `localStorage`): "You can drag me anywhere on the page."
- **`.gb-close`:** the text "×" and `aria-label="Close"`.
- **The sources line, `.gb-src`:** "From " + links joined with "; ". Each link's text is `<Class 4 | Paper 7 | Bonus class>, chapter <n>: <chapter title>`, and its `href` is `#<id>`.

**Markup** (static, in the body right after the player; the chip labels are today's):

```html
<div id="grokbot">
  <button class="gb-orb" type="button" aria-label="Ask Grokbot" aria-expanded="false"><canvas class="orb" aria-hidden="true"></canvas></button>
  <section class="gb-bubble" role="dialog" aria-label="Grokbot" tabindex="-1" hidden>
    <div class="gb-inner">
      <div class="gb-top">
        <p class="gb-head"></p>
        <button class="gb-switch" type="button"></button>
        <button class="gb-close" type="button" aria-label="Close">×</button>
      </div>
      <p class="gb-hello"></p>
      <p class="gb-hint">You can drag me anywhere on the page.</p>
      <div class="ask-pass" hidden>
        <label for="gb-pass">Enter the passcode to ask questions</label>
        <input id="gb-pass" type="password" autocomplete="off">
        <button type="button">OK</button>
      </div>
      <div class="ask-chips">
        <button type="button">Explain this simply</button>
        <button type="button">Give me an example</button>
        <button type="button">What could the exam ask?</button>
        <button type="button">Key terms</button>
      </div>
      <div class="ask-form">
        <input class="ask-input" type="text">
        <button class="ask-send" type="button">Ask</button>
      </div>
      <p class="gb-words"></p>
      <p class="gb-src"></p>
      <p class="ask-status" aria-live="polite"></p>
      <p class="ask-note"></p>
    </div>
  </section>
</div>
```

**CSS** (tokens only; no new colours, no all caps):
- **The orb:**
  - `#grokbot { position: fixed; z-index: 8; display: none; }` and `body.can-ask #grokbot { display: block; }`. `left` and `top` come from JS. No `transform` on `#grokbot`: the bubble inside it is `position: fixed`.
  - `.gb-orb`: no border, no background, no padding, `touch-action: none`, `cursor: grab` (`grabbing` while dragging), and a visible focus ring (`outline: 2px solid var(--clay-ink); outline-offset: 2px; border-radius: 50%`).
  - `canvas.orb` keeps today's `.orb` glow (`filter: drop-shadow(...)`).
- **The bubble:**
  - `.gb-bubble { position: fixed; z-index: 9; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg); box-shadow: 0 6px 24px color-mix(in srgb, var(--ink) 14%, transparent); }`. This shadow and the orb's glow are the site's only two shadows.
  - `.gb-inner { max-height: min(70vh, 32rem); overflow-y: auto; padding: var(--sp-4); display: grid; gap: var(--sp-3); }`
  - **The tail** is `.gb-bubble::after`: a 14px square in `var(--surface)` with a `var(--line)` border on two sides, rotated 45°, at `left: calc(var(--tail) - 7px)`. It sits `bottom: -8px` when `[data-side="above"]` and `top: -8px` (turned the other way) when `[data-side="below"]`.
- **Inside the bubble:**
  - `.gb-top` is a flex row: the head grows (`var(--sans)`, `var(--s-1)`, weight 600). `.gb-switch` is a small pill like `.chip`. `.gb-close` is a 2rem round icon button.
  - `.gb-hello` uses `var(--serif)` and `var(--ink-2)`. `.gb-hint` and `.ask-note` use `var(--s-1)` and `var(--muted)`.
  - `.gb-words` uses `var(--serif)` at 1.0625rem, `line-height: 1.6`, `white-space: pre-line`, `max-height: 12rem` and `overflow-y: auto`. It is hidden while empty (`:empty`), and so is `.gb-src`.
  - Keep today's `.ask-pass`, `.ask-chips`, `.ask-form` and `.ask-status` styles.
- **Phones (`max-width: 520px`):** the orb is 56px (`gbSize()`), and the bubble width comes from `gbPlace`.
- **Reduced motion:** no CSS animation on the orb at all; the canvas handles it (H.1).

**Remove:**
- the per-chapter `.ask-btn` and `section.ask` from `renderLecture`, and their wiring line;
- the `.greet` section from `renderHome`;
- their CSS: `.ask-btn`, `.ask` (panel layout), `.greet*`, `.orb .eye`, `.orb-defs`, `.orb-stop-*`, `.orb.thinking`, `.orb.pulse`, `@keyframes orb-breathe` and its reduced-motion lines;
- the hidden `<svg class="orb-defs">`, `ORB_SVG`, `startBlink`, `blinkTimer`, `askToggle` and `closeAsk`.

`stopAsk` and `serverSetBusy` may keep toggling the `thinking` and `pulse` classes: with the CSS gone, they do nothing.

### H.1 The avatar: drawing and motion (canvas)

Port this exactly (the motion maths is the watch mockup's; the body and eyes are the site's):

```js
/* Grokbot's face: the site's orb, moved by the watch avatar's formulas. */
const GB_EYES = [{ x: -0.25, y: -0.04, tilt: 8 }, { x: 0.25, y: -0.04, tilt: -8 }];   // the old ORB_SVG eyes, in units of R
const GB_EYE_W = 0.19, GB_EYE_H = 0.385;
function gbHash(k) { let h = (k * 2654435761) >>> 0; h ^= h >>> 13; return (h % 1000) / 1000; }
function gbSmooth(e0, e1, x) { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
function gbBlink(t, period) {
  const k = Math.floor(t / period), at = k * period + 1 + gbHash(k + 7) * (period - 2), d = t - at;
  return d >= 0 && d < 0.12 ? 0.1 : 1;
}
function gbLevel(t) { return Math.min(1, Math.abs(Math.sin(t * 7.1) * Math.sin(t * 2.3)) * 0.9 + 0.1); }
let gbCol = null;                 // the face's colours for the current theme
function gbColors() {
  const cs = getComputedStyle(document.documentElement), dark = effectiveTheme() === "dark";
  gbCol = { a: dark ? "#F2F0E8" : "#FFFFFF", b: dark ? "#C9C6BC" : "#F0EEE6",
            rim: cs.getPropertyValue("--line").trim(), accent: cs.getPropertyValue("--clay").trim() };
}
function gbDraw(ctx, size, mode, t) {
  let scale = 1, ox = 0, oy = 0, gx = 0, gy = 0, eyeH = 1;
  const rings = [], dots = [], level = gbLevel(t);
  if (mode === "idle" || mode === "happy") {
    scale = 1 + 0.015 * Math.sin(2 * Math.PI * t / 4); eyeH *= gbBlink(t, 5);
    const ph = t % 9, g = gbSmooth(0, 0.25, ph) * (1 - gbSmooth(1.2, 1.45, ph)); gx = -0.10 * g; gy = 0.06 * g;
  }
  if (mode === "happy") { oy = -0.08 * Math.abs(Math.sin(2 * Math.PI * 2 * t)); eyeH *= 0.45; }
  if (mode === "thinking") {
    gx = -0.05 + 0.06 * Math.sin(2 * Math.PI * t / 2.5); gy = -0.10; eyeH *= gbBlink(t, 2.5);
    for (let k = 0; k < 3; k++) {
      const ang = 2 * Math.PI * t / 1.6 + k * 2 * Math.PI / 3;
      dots.push({ x: 1.22 * Math.cos(ang), y: 1.22 * Math.sin(ang), r: 0.065 });
    }
  }
  if (mode === "speaking") { scale = 1 + 0.06 * level; gx = -0.12; gy = 0.04; eyeH *= 0.70 + 0.30 * (1 - level); rings.push({ r: 1.10, hw: 0.02, a: 0.30 * level }); }
  if (mode === "error") { const mt = t % 2.5; ox = 0.07 * Math.sin(2 * Math.PI * 5 * mt) * Math.exp(-2 * mt); gy = 0.08; eyeH *= 0.25; }
  const R = 0.34 * size, Rs = R * scale, cx = size / 2 + ox * R, cy = size / 2 + oy * R;
  ctx.clearRect(0, 0, size, size);
  for (const r of rings) {
    ctx.globalAlpha = Math.max(0, r.a); ctx.strokeStyle = gbCol.accent; ctx.lineWidth = 2 * r.hw * R;
    ctx.beginPath(); ctx.arc(cx, cy, r.r * R, 0, 2 * Math.PI); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = gbCol.accent;
  for (const d of dots) { ctx.beginPath(); ctx.arc(cx + d.x * R, cy + d.y * R, d.r * R, 0, 2 * Math.PI); ctx.fill(); }
  const body = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rs);
  body.addColorStop(0, gbCol.a); body.addColorStop(1, gbCol.b);
  ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, Rs, 0, 2 * Math.PI); ctx.fill();
  ctx.strokeStyle = gbCol.rim; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = "#1F1E1D";        // the body is light in both themes, so the eyes stay dark in both
  for (const e of GB_EYES) {
    const w = GB_EYE_W * Rs, h = Math.max(0.5, GB_EYE_H * eyeH * Rs);
    ctx.save(); ctx.translate(cx + (e.x + gx) * Rs, cy + (e.y + gy) * Rs); ctx.rotate(e.tilt * Math.PI / 180);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, w / 2); else ctx.rect(-w / 2, -h / 2, w, h);   // older browsers: square eyes
    ctx.fill(); ctx.restore();
  }
}
```

**The loop:**

```js
let gbRaf = 0, gbHappyUntil = 0, gbErrorUntil = 0;
const gbReduce = matchMedia("(prefers-reduced-motion: reduce)");
function gbMode(now) {
  const busy = gb._ask && gb._ask.busy;
  if (now < gbHappyUntil) return "happy";
  if (now < gbErrorUntil) return "error";
  if (busy === "Thinking…") return "thinking";
  if (busy === "Speaking…") return "speaking";
  return "idle";
}
function gbFrame(now) {
  gbRaf = 0;
  const cv = gb.querySelector("canvas.orb"), s = gbSize(), dpr = window.devicePixelRatio || 1;
  if (cv.width !== Math.round(s * dpr)) { cv.width = cv.height = Math.round(s * dpr); cv.style.width = cv.style.height = s + "px"; }
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (gbReduce.matches) { gbDraw(ctx, s, "idle", 0); return; }      // one still frame: open eyes, no motion
  gbDraw(ctx, s, gbMode(now), now / 1000 + 2);
  if (!document.hidden && document.body.classList.contains("can-ask")) gbRaf = requestAnimationFrame(gbFrame);
}
function gbKick() { if (!gbRaf) gbRaf = requestAnimationFrame(gbFrame); }
```

- **Call `gbKick()` from:**
  - the detection IIFE, after it sets `can-ask`;
  - `visibilitychange`, when the page becomes visible;
  - `gbReduce`'s `change`;
  - a theme change, after `gbColors()`. A theme change is a `MutationObserver` on `document.documentElement`'s `data-theme`, plus `darkQuery`'s `change`.
  - Under reduced motion, these redraws are the only drawing.
- **Set the error and happy times:**
  - `claudeError` and `serverError` set `gbErrorUntil = performance.now() + 2500` (one line each);
  - a tap on the orb sets `gbHappyUntil = performance.now() + 1000`.

### H.2 Moving it and opening the bubble

```js
const GB_POS_KEY = "inn514-grokbot-pos", GB_MOVED_KEY = "inn514-grokbot-moved";
const gb = $("grokbot");          // the panel the ask helpers use: it holds the .orb and every .ask-* element
let gbPos = null;                 // the orb's top-left corner, in CSS px
let gbCtx = null;                 // the context the bubble shows: { mode: "chapter", id, i } or { mode: "course" }
let gbCourse = false;             // "Whole course" chosen on this route
gb._ask = { hist: [], first: true, ctl: null, busy: "", pending: null };
function gbSize() { return matchMedia("(max-width: 520px)").matches ? 56 : 72; }
function gbBounds() {
  const top = document.querySelector(".topbar").getBoundingClientRect().bottom + 8;
  const p = document.querySelector(".player").getBoundingClientRect();
  const bottom = (p.height > 0 ? Math.min(innerHeight, p.top) : innerHeight) - 8;
  return { top, bottom };
}
function gbClamp(pos) {
  const s = gbSize(), b = gbBounds();
  return { x: Math.min(Math.max(16, pos.x), innerWidth - s - 16), y: Math.min(Math.max(b.top, pos.y), b.bottom - s) };
}
function gbMoveTo(pos) {
  gbPos = gbClamp(pos);
  gb.style.left = gbPos.x + "px"; gb.style.top = gbPos.y + "px";
  if (!gb.querySelector(".gb-bubble").hidden) gbPlace();
}
function gbSave() {
  try { localStorage.setItem(GB_POS_KEY, JSON.stringify(gbPos)); localStorage.setItem(GB_MOVED_KEY, "1"); } catch (e) {}
  gb.querySelector(".gb-hint").hidden = true;
}
function gbStart() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(GB_POS_KEY) || "null"); } catch (e) {}
  const s = gbSize();
  gbMoveTo(saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) ? saved : { x: innerWidth - s - 16, y: gbBounds().bottom - s });
  try { gb.querySelector(".gb-hint").hidden = localStorage.getItem(GB_MOVED_KEY) === "1"; } catch (e) {}
}
```

- **Wiring** (once, at the end of the script):
  - `gbStart()` and `gbColors()`;
  - `addEventListener("resize", () => gbMoveTo(gbPos))`;
  - `audio.addEventListener("play"…)` and `("pause"…)` also call `gbMoveTo(gbPos)`, because the player's height can change.
- **Drag:** on the orb button.

```js
const gbOrb = gb.querySelector(".gb-orb");
let gbDragged = false;
gbOrb.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  const sx = e.clientX, sy = e.clientY, start = { ...gbPos };
  let dragging = false;
  gbOrb.setPointerCapture(e.pointerId);
  const move = (ev) => {
    const dx = ev.clientX - sx, dy = ev.clientY - sy;
    if (!dragging && Math.hypot(dx, dy) > 6) { dragging = true; gbOrb.classList.add("dragging"); }
    if (dragging) gbMoveTo({ x: start.x + dx, y: start.y + dy });
  };
  const end = () => {
    gbOrb.removeEventListener("pointermove", move); gbOrb.removeEventListener("pointerup", end); gbOrb.removeEventListener("pointercancel", end);
    gbOrb.classList.remove("dragging");
    if (dragging) { gbSave(); gbDragged = true; }       // the click that follows a drag is not a tap
  };
  gbOrb.addEventListener("pointermove", move); gbOrb.addEventListener("pointerup", end); gbOrb.addEventListener("pointercancel", end);
});
gbOrb.addEventListener("click", () => {
  if (gbDragged) { gbDragged = false; return; }
  gbHappyUntil = performance.now() + 1000; gbKick();
  if (gb.querySelector(".gb-bubble").hidden) gbOpen(); else gbClose();
});
gbOrb.addEventListener("keydown", (e) => {
  const step = e.shiftKey ? 64 : 16;
  const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
  if (!d) return;
  e.preventDefault(); gbMoveTo({ x: gbPos.x + d[0], y: gbPos.y + d[1] }); gbSave();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !gb.querySelector(".gb-bubble").hidden) { gbClose(); gbOrb.focus(); }
});
```

- **Placing the bubble:**

```js
function gbPlace() {
  const b = gb.querySelector(".gb-bubble"), s = gbSize(), gap = 12;
  const w = innerWidth <= 520 ? innerWidth - 32 : Math.min(352, innerWidth - 32);   // 352px = 22rem
  b.style.width = w + "px";
  const h = b.offsetHeight, above = gbPos.y - gap - h >= 16;
  const top = above ? gbPos.y - gap - h : Math.min(gbPos.y + s + gap, innerHeight - h - 16);
  const mid = gbPos.x + s / 2;
  const left = Math.min(Math.max(16, mid > innerWidth / 2 ? gbPos.x + s - w : gbPos.x), innerWidth - w - 16);
  b.style.left = left + "px"; b.style.top = Math.max(16, top) + "px";
  b.dataset.side = above ? "above" : "below";
  b.style.setProperty("--tail", Math.min(Math.max(20, mid - left), w - 20) + "px");
}
```

- **Opening and closing:**

```js
function gbOpen() {
  const b = gb.querySelector(".gb-bubble");
  b.hidden = false; gbOrb.setAttribute("aria-expanded", "true");
  openAsk = gb;                   // askServer reads the open panel
  gbRender(gbContext());
  gbPlace();
  // A mouse goes straight to typing; on a touch screen the keyboard waits until the student taps the input.
  gb.querySelector(matchMedia("(pointer: fine)").matches ? ".ask-input" : ".gb-bubble").focus({ preventScroll: true });
}
function gbClose() {
  stopAsk(gb);
  gb.querySelector(".gb-bubble").hidden = true; gbOrb.setAttribute("aria-expanded", "false");
  gb._ask = { hist: [], first: true, ctl: null, busy: "", pending: null };   // work still running sees a new state and stops
  gbCtx = null; gbCourse = false;
  if (openAsk === gb) openAsk = null;
}
window.addEventListener("hashchange", () => { gbClose(); });     // replaces today's closeAsk(openAsk) line
```

`gbClose` on a route change also resets "Whole course".

### H.3 Context, rendering and asking

```js
function gbChapterInView(id) {
  if (pl === DATA.lectures[id] && !audio.paused) return plIdx;
  let i = 0;
  document.querySelectorAll("#view section.chapter").forEach((s, k) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) i = k; });
  return i;
}
function gbContext() {
  if (viewId && DATA.lectures[viewId] && !gbCourse) return { mode: "chapter", id: viewId, i: gbChapterInView(viewId) };
  return { mode: "course" };
}
const gbSame = (a, b) => !!a && !!b && a.mode === b.mode && a.id === b.id && a.i === b.i;
function gbRender(ctx) {
  if (!gbSame(ctx, gbCtx)) {        // a new chapter or mode starts a new conversation
    stopAsk(gb);
    gb._ask = { hist: [], first: true, ctl: null, busy: "", pending: null };
    gb.querySelector(".gb-words").textContent = ""; gb.querySelector(".gb-src").textContent = "";
  }
  gbCtx = ctx;
  const chapter = ctx.mode === "chapter", onLecture = !!(viewId && DATA.lectures[viewId]);
  const head = gb.querySelector(".gb-head"), sw = gb.querySelector(".gb-switch"), input = gb.querySelector(".ask-input");
  if (chapter) {
    const c = entry(ctx.id), ch = DATA.lectures[ctx.id].chapters[ctx.i];
    head.textContent = "About " + className(c) + ", chapter " + ch.n + ": " + ch.title;
  } else head.textContent = "About the whole course";
  sw.hidden = !onLecture; sw.textContent = chapter ? "Whole course" : "This chapter";
  gb.querySelector(".gb-hello").textContent = chapter
    ? "Hi, I'm Grokbot. Ask me about this chapter and I'll answer out loud."
    : "Hi, I'm Grokbot. Ask me anything about the classes or the papers. I'll answer out loud and say where it comes from.";
  gb.querySelector(".gb-hello").hidden = !!gb.querySelector(".gb-words").textContent;
  input.placeholder = chapter ? "Ask about this chapter…" : "Ask about any class or paper…";
  input.setAttribute("aria-label", input.placeholder);
  gb.querySelector(".ask-chips").hidden = !chapter;
  gb.querySelector(".ask-note").textContent = askMode === "server"
    ? (chapter ? SERVER_ASK_NOTE : COURSE_SERVER_NOTE) : (chapter ? DEVICE_ASK_NOTE : COURSE_DEVICE_NOTE);
  if (!gb.querySelector(".gb-bubble").hidden) gbPlace();
}
function caption(panel, text) {         // the words appear part by part as they are spoken
  const w = panel.querySelector(".gb-words");
  w.textContent += (w.textContent ? " " : "") + text.trim();
  w.scrollTop = w.scrollHeight;
  panel.querySelector(".gb-hello").hidden = true;
}
function gbAsk(question, isChip) {
  const ctx = gbContext();
  gbRender(ctx);
  gb.querySelector(".gb-words").textContent = ""; gb.querySelector(".gb-src").textContent = "";
  if (ctx.mode === "chapter") askSend(ctx.id, ctx.i, gb, question, isChip);
  else askCourse(gb, question);
}
```

- **Wiring** (once):
  - the chips: `gb.querySelectorAll(".ask-chips button").forEach((b, k) => (b.onclick = () => gbAsk(CHIPS[k][1], true)))`;
  - the typed question: Ask, or Enter in `.ask-input`, calls `gbAsk(q, false)` and clears the input;
  - `.gb-switch`: `gbCourse = !gbCourse; gbRender(gbContext());`;
  - `.gb-close`: `gbClose(); gbOrb.focus();`;
  - `wirePass(gb, (p) => (p.course ? askCourse(gb, p.question) : askSend(p.id, p.i, gb, p.question, p.isChip)))`.
- **Captions,** the only edits inside code moved in H1:
  - in `streamClaudeAnswer`'s `drain`, both `speakSentence` calls pass `() => { onstart(); caption(panel, s); }`, where `s` is the sentence being queued;
  - in `speakServerAnswer`, call `caption(panel, part)` just before `await playOrbBlob(...)`;
  - in `serverDevicePart`, the `onStart` also calls `caption(panel, text)`.
  - The two no-voice paths (`show` in `streamClaudeAnswer` and `serverShowText`) set `.gb-words` to "This device has no voice, so the answer is only written.\n" + the answer. They no longer create `.ask-text`.
- **`askCourse`** follows the earlier steps, except the first step goes (the bubble is already the open panel), and the server-mode pending question is `st.pending = { question, course: true }`.

### H.4 Course mode: pick, then answer

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
- The pick: `askUpstream([{ role: "user", content: <the pick text, built as in claude mode> }], { max_tokens: 600, temperature: 0 })`. Read the first `[...]` in the reply (`/\[[\s\S]*?\]/`) with `JSON.parse` in try/catch (unreadable means `[]`), then `cleanPicks`.
- The answer: `askUpstream([{ role: "user", content: <COURSE_RULES + blocks> }, { role: "user", content: question }])`.
- Replies: `200 {"text": "…", "sources": [{"id": "T4", "chapter": 3}]}`; `200 {"text": NOT_COVERED_EN or NOT_COVERED_ES, "sources": []}` with no second call; an upstream failure in either step gives 429 or 502, exactly as `/api/ask`.

### H.5 Code shape (reuse; never copy a function)

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

One more H1 change, the only edit inside moved code: in `streamClaudeAnswer`'s `show` and in `serverShowText`, replace `panel.insertBefore(t, status)` (and `panel.insertBefore(t, panel.querySelector(".ask-status"))`) with `status.before(t)`. The text lands in the same place, and the code no longer depends on the status being a direct child of the panel. (H5 later replaces both no-voice paths with `.gb-words`.)

**Course-mode helpers** (in `site/template.html`):

```js
function courseIndex() { /* H.4 index lines from DATA.catalog then READINGS, joined with "\n" */ }
function cleanPicks(arr) { /* H.4 cleaning rules; returns [{ id, chapter }] */ }
function chapterIndexOf(id, n) { return DATA.lectures[id].chapters.findIndex((ch) => ch.n === n); }
function showSources(panel, picks) { /* fills .gb-src: "From " + links joined with "; "; empties it for [] */ }
async function askCourse(panel, question) { /* the steps below */ }
```

**`askCourse`, step by step:**
1. **Server mode with no passcode:** set `st.pending = { question, course: true }`, show the passcode row, focus it, and return, as `askSendServer` does.
2. **Start fresh:**
   - stop anything running: abort `st.ctl`, call `speechSynthesis.cancel()` and `orbAudio.pause()`;
   - make a new `AbortController` and set it as `st.ctl`;
   - call `serverSetBusy(panel, "Thinking…")`.
3. **Claude mode:**
   - Pick with `sampleFn.json`. On an error, return if aborted, else call `serverClearBusy(panel)` and `claudeError(panel, e)`.
   - **If `cleanPicks` is empty:** call `serverClearBusy(panel)` and don't call `streamClaudeAnswer`. Speak the not-covered sentence with `voiceFor(lang)` and `speakSentence`, whose `onStart` calls `caption`. With no voice, write it into `.gb-words` after the no-voice line.
   - **Otherwise:** call `showSources`, then `streamClaudeAnswer(panel, turns, lang, false, null)`.
4. **Server mode:**
   - `fetch("/api/course", …)` with `signal: ctl.signal`.
   - If the reply isn't ok, throw an error carrying `status` and send it to `serverError(panel, e)`. A 401 shows the passcode row again.
   - On success: `showSources(panel, out.sources)`, then `await speakServerAnswer(panel, out.text, lang, ctl)`. For `sources: []`, the server's not-covered text is spoken the same way.
5. **After every `await`:** return if `ctl.signal.aborted` or `panel._ask !== st`.

**In `server.js` (H7):**

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
     { model, messages, max_tokens: opts.max_tokens || 1000, temperature: opts.temperature ?? 0.3 } */
}
function limitsOk(req, kind, cost = 1) {
  /* unchanged, except: `recent.length + cost > limit` instead of `>=`, the daily check uses
     `+ cost >`, and an admitted call pushes `cost` timestamps and adds `cost` to the day's count */
}
```

`/api/course` sits next to `/api/ask` and reuses `readBody`, `bad()` and the reply shapes of `/api/ask`.

### H.6 Tests

**`scripts/mock_openrouter.mjs` (H7).** A chat call whose first message starts with "You choose where" is a pick:
- if that message contains "nothing-matches", it replies `[]`;
- if it contains "unknown-pick", it replies `Here you go: [{"id": "T99", "chapter": 1}, {"id": "T4", "chapter": 99}]`;
- otherwise it replies `[{"id": "T4", "chapter": 3}]`.

Every other chat call still replies "First sentence. Second sentence.".

**`scripts/test_server.mjs` (H7)**, added to the normal run. Send every `/api/course` request with the header `X-Forwarded-For: 203.0.113.50`, so it counts against its own address and the existing "21st call" count is untouched. Count the mock's chat calls before and after each request (`callsFromMock`).
- `/api/course` without a passcode returns 401.
- With the passcode, "What is an entrepreneurial ecosystem?" returns 200 with `sources` equal to `[{"id":"T4","chapter":3}]` and `text` equal to the mock answer. The mock saw exactly 2 chat calls for it; the second one's `context` contains "You are a study helper" and `t4.chapters[2].title`.
- "nothing-matches" returns 200 with `text` equal to `NOT_COVERED_EN` and `sources: []`, and the mock saw exactly 1 chat call.
- "¿Qué es nothing-matches?" returns `NOT_COVERED_ES`.
- "unknown-pick" returns `sources: []` and `NOT_COVERED_EN`.
- A 501-character question returns 400.
- The cost: give `startServer` an optional third argument of settings merged over its defaults. A separate server started with `{ GROKBOT_RATE_PER_10MIN: "3" }` answers one `/api/course` (200), refuses a second (429, since 2 + 2 > 3), and still answers one `/api/ask` (200). Stop it cleanly.
- The existing secret checks cover the new replies too.

**`scripts/check_page.mjs` (H9).**
- **What goes and what stays:**
  - The checks of the per-chapter panels and the greeting card go: the `.ask-btn` and `.ask` panel checks, the panel screenshots and the greet checks.
  - Every other check stays: the routes, the player, the theme switch, the branding and the no-network rules.
  - Old screenshots that are no longer made are left in place for Claude to tidy.
- **The H1 guard:** before changing anything, H1 saves `chapterContext("T4", 2)` and `chapterContext("P02", 1)` from the built page to `checks/context-before.txt`. A check compares the built page's output with that file and must match exactly.
- **Plain file:**
  - `#grokbot` is not displayed;
  - there is no `.ask-btn` and no `.greet` anywhere;
  - the "Ask" how-to item is hidden.
- **Claude mock.** The mock's sample function also gets `.json = async (input, opts) => …`. It records `input` and `opts.modelTier` in `window.__lastJson` and returns:
  - `[{id:"P02",chapter:2}]` if `input` contains "trinity";
  - `[]` if it contains "nothing-matches";
  - `[{id:"T4",chapter:3}]` otherwise.

  A speech stub gives `speechSynthesis.getVoices()` one `en-GB` voice, and its `speak(u)` calls `u.onstart()` then `u.onend()` at once.
  - **Always there:** `#grokbot` is displayed on `#home`, `#T4` and `#P02`, and it is the same element after each route change (keep a reference and compare).
  - **Home:** a click on `.gb-orb` opens `.gb-bubble` with `aria-expanded="true"` and the header "About the whole course". The switch is hidden and the chips are hidden.
  - **A chapter:**
    - On `#T4`, scroll `#ch-2` to the top and open the bubble. The header starts "About Class 4, chapter 3" and the switch says "Whole course".
    - A chip sends a sample whose first turn contains T4 chapter 3's title.
    - `.gb-words` then holds the mock answer's sentences.
  - **Whole course:**
    - After "Whole course", the header is "About the whole course".
    - Typing "What is an entrepreneurial ecosystem?" and Ask gives `__lastJson.modelTier === "quick"`, and a pick input containing "T4 3:" and "P07 1:".
    - The sources link `#T4`, and their text contains "Class 4, chapter 3".
  - **Paper 2:** a course question with "trinity" sends a sample whose first turn contains "do not quote". On `#P02`, a chapter question's first turn contains "do not quote" too.
  - **Not covered:** "nothing-matches" puts `NOT_COVERED_EN` in `.gb-words` and makes no `sample` call.
  - **Route change:** going to `#classes` closes the bubble (`hidden`) and leaves `gb._ask.busy` empty.
- **Dragging** (on `#home`, with the bubble closed). Dispatch `pointerdown`, then `pointermove` 120px left and 80px up, then `pointerup` on `.gb-orb`.
  - The orb's `left` and `top` moved by that amount, within 1px.
  - The bubble stayed closed.
  - `inn514-grokbot-pos` was saved, and `.gb-hint` is hidden.
  - After a reload, the orb is in the same place.
  - A `pointerdown`/`pointerup` with no move, then a click, opens the bubble.
- **Keyboard:**
  - Focus `.gb-orb`. Enter opens the bubble.
  - Escape closes it, and `document.activeElement` is the orb.
  - ArrowLeft moves the orb 16px left.
- **Clamping:** after `gbMoveTo({ x: -500, y: 99999 })`, the orb is 16px from the left. Its bottom is at least 8px above the player's top once the player shows; start a chapter first.
- **Server mode** (with `mock_openrouter.mjs`; remove `inn514-grokbot-pass` from `localStorage` first):
  - the first question shows the passcode row;
  - after the passcode, a question on `#T4` reaches `/api/ask`, one on `#home` reaches `/api/course`, and `/api/speak` is called;
  - the sources link `#T4`.
- **Phone, 390px:**
  - the canvas is 56px;
  - the open bubble is 358px wide (390 − 32), with no horizontal scroll;
  - the orb doesn't overlap the player.

  Screenshots, with the bubble open on `#T4` after an answer: `checks/phone-grokbot.png`, the same in dark mode `checks/phone-grokbot-dark.png`, and at 1280px `checks/desktop-grokbot.png`.

### H.7 Tasks

| Task | What it is |
|---|---|
| H1 | Refactor only (H.5): `chapterBlock`, `claudeError`, `streamClaudeAnswer`, `speakServerAnswer`, `wirePass`, `status.before(t)`; the `checks/context-before.txt` guard; full `check_page.mjs` run, ALL PAGE CHECKS PASSED |
| H2 | The shell (H.0): the `#grokbot` markup and CSS, and the "Ask" how-to item. Remove the per-chapter ask buttons and panels, the greet card and everything in H.0's remove list. Add the six constants from H.4 |
| H3 | The face (H.1): `gbDraw`, `gbColors`, `gbMode`, `gbFrame`, `gbKick`, the theme and visibility hooks, reduced motion, and the error and happy times |
| H4 | Moving and the bubble (H.2): `gbSize`, `gbBounds`, `gbClamp`, `gbMoveTo`, `gbSave`, `gbStart`, drag, keyboard, `gbPlace`, `gbOpen`, `gbClose`, Escape, the hashchange line |
| H5 | Context and chapter questions (H.3): `gbChapterInView`, `gbContext`, `gbRender`, `caption`, `gbAsk`, the wiring, the caption edits and the no-voice text |
| H6 | Course mode in claude mode (H.4, H.5): `courseIndex`, `cleanPicks`, `chapterIndexOf`, `showSources`, `askCourse` |
| H7 | `server.js` (H.5): constants, `blockFor`, `courseIndex`, `cleanPicks`, `langOf`, `askUpstream` options, `limitsOk` cost, `/api/course`; the mock's pick replies; the `test_server.mjs` checks; ALL SERVER CHECKS PASSED |
| H8 | Course mode in server mode: `/api/course`, the passcode row (`pending.course`), `speakServerAnswer`, errors |
| H9 | `check_page.mjs` (H.6), screenshots, full run (ALL PAGE CHECKS PASSED), then `build_static.py` |
| G4 | **STOP GATE G4** (it also closes G1) |

---

## Part D: a friendlier, course-wise, always-speaking Grokbot and a search page (added 2026-10-24; DeepSeek builds it)

The student tested Grokbot on the claude.ai link and found five problems.

1. "Hola" got the fixed sentence "I couldn't find that in the course companion". The pick found no chapter for a greeting, and the language check called "hola" English.
2. It didn't know the course. General questions (teachers, dates, which papers go with which class) had no source.
3. It didn't reliably speak. No voice for the detected language meant silence, and an answer couldn't be heard again.
4. There was no way to search the course by topic, author or paper.
5. It must know the whole course, especially the papers and the classes.

**The student's decisions (2026-10-24):** DeepSeek builds Part D, and Claude reviews at gate **G5**. Every answer is spoken (a Spanish voice for Spanish), with a "Read again" button. A search page (no AI) shares its search engine with Grokbot.

**What stays:** the floating Grokbot, no passcode on Canner, the free models and the limits, and every lecture, paper, audio and data file. The content manifest must not change.

**Where things go in `site/template.html`:**
- `ABOUT_TEXT`, `textLang`, `courseOverview` and the search functions go **right after the `className` line**, near the top of the script. `renderHome` runs before the ask constants are defined, so a `const` placed later would throw.
- The rule texts stay where `RULES` is.
- `server.js` reads every `const X = "…";` line by regex wherever it is.

### D.1 Language, the about text and the course overview (task D1)

```js
/* The front page's "What the course is about" paragraph; Grokbot's overview and server.js use it too. */
const ABOUT_TEXT = "INN514 asks how innovation happens in systems rather than inside single firms, and how those systems can support a sustainable transformation. The classes move from national and regional innovation systems, through institutional work, entrepreneurial ecosystems and agency, to technological innovation systems, and end with a summary before the exam. Sessions 7 and 8 go through the papers, and the course ends with a written exam. A bonus class on crowdfunding comes from the 2025 course.";
/* Spanish or English, from the words themselves (\b fails next to accented letters, so words are split on letters). */
const ES_WORDS = new Set("hola gracias buenos buenas qué que cómo como cuál cual quién quien dónde donde cuándo cuando por porque para sobre explica explícame dime el la los las es de del una un y".split(" "));
function textLang(s) {
  const t = String(s || "");
  if (/[¿¡ñáéíóú]/i.test(t)) return "es-ES";
  const words = t.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
  const hits = words.filter((w) => ES_WORDS.has(w)).length;
  return hits >= (words.length <= 3 ? 1 : 2) ? "es-ES" : "en-GB";
}
/* Everything Grokbot always knows: the course, every class with its teacher, date, papers and chapters,
   and every paper with its reference, its class, its summary and its chapters. */
function courseOverview() {
  const chs = (id) => DATA.lectures[id].chapters.map((ch) => ch.n + " " + ch.title).join("; ");
  const rows = DATA.catalog.map((c) => [c.num === "Bonus" ? 99 : +c.num,
    `- ${className(c)} (${c.when}), taught by ${c.teacher}: ${c.title}.`
    + (c.readings && c.readings.length ? ` Its papers: ${c.readings.map((r) => className(entry(r))).join(", ")}.` : "")
    + (DATA.lectures[c.id] ? ` Chapters: ${chs(c.id)}.` : "")]);
  const ss = DATA.sessions || [];
  if (ss.length) rows.push([7, `- Sessions ${ss.map((s) => s.num).join(" and ")} (${ss.map((s) => s.when).join("; ")}), taught by ${[...new Set(ss.map((s) => s.teacher))].join(" and ")}: ${ss[0].title}.`]);
  rows.sort((a, b) => a[0] - b[0]);
  const lines = ["About the course: " + ABOUT_TEXT, "The classes, in course order:", ...rows.map((r) => r[1]), "The papers:"];
  for (const r of READINGS) {
    const L = DATA.lectures[r.id];
    lines.push(`- ${className(r)}: ${r.authors} (${r.year}), "${r.title}", ${r.source}. For ${r.lectures.map((l) => className(entry(l)).toLowerCase()).join(" and ")}.`
      + (L ? ` In brief: ${L.chapters[0].paragraphs[0]} Chapters: ${chs(r.id)}.` : ""));
  }
  return lines.join("\n");
}
```

- `renderHome` uses `${esc(ABOUT_TEXT)}` in place of the paragraph's text; the page must look the same.
- `askLang(q, isChip)` becomes `return isChip ? "en-GB" : textLang(q);`.
- `server.js` replaces `langOf` with the same `textLang` (copied, one function).

### D.2 The search engine (task D2)

```js
/* Local course search: no AI, so it works offline and on both sites. Grokbot uses it too. */
const SEARCH_STOP = new Set(("a an and are as at be by can do does for from has have how in into is it its of on or that the their this to was what when where which who why with "
  + "al como con de del el en es la las lo los para por que se sobre su un una y").split(" "));
// lower case, no accents, and ø/æ spelled o/ae, so "floysand" and "baekkelund" find the Norwegian names
const searchNorm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/ø/g, "o").replace(/æ/g, "ae");
function searchTerms(q) {
  return [...new Set(searchNorm(q).split(/[^\p{L}\p{N}]+/u).filter((w) => (w.length > 1 || /\d/.test(w)) && !SEARCH_STOP.has(w)))];
}
let SEARCH_INDEX = null;
function searchIndex() {               // one document per chapter; the title counts three times
  if (SEARCH_INDEX) return SEARCH_INDEX;
  const docs = [], df = new Map();
  for (const id of Object.keys(DATA.lectures)) DATA.lectures[id].chapters.forEach((ch, i) => {
    const toks = searchNorm([ch.title, ch.title, ch.title, ...(ch.labels || []), ...ch.paragraphs].join(" ")).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const tf = new Map();
    for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1);
    for (const t of tf.keys()) df.set(t, (df.get(t) || 0) + 1);
    docs.push({ id, i, tf, len: toks.length });
  });
  const avg = docs.reduce((s, d) => s + d.len, 0) / docs.length;
  return (SEARCH_INDEX = { docs, df, avg, vocab: [...df.keys()] });
}
function searchSnippet(ch, forms) {    // about 30 words around the first match in the best paragraph, escaped, matches marked
  const hit = (w) => forms.includes(searchNorm(w).replace(/[^\p{L}\p{N}]/gu, ""));
  let best = ch.paragraphs[0] || "", bestN = -1;
  for (const p of ch.paragraphs) { const n = p.split(/\s+/).filter(hit).length; if (n > bestN) { best = p; bestN = n; } }
  const words = best.split(/\s+/), from = Math.max(0, words.findIndex(hit) - 12), part = words.slice(from, from + 30);
  return (from ? "… " : "") + part.map((w) => (hit(w) ? "<mark>" + esc(w) + "</mark>" : esc(w))).join(" ") + (from + 30 < words.length ? " …" : "");
}
function searchCourse(q) {
  const terms = searchTerms(q), ix = searchIndex(), N = ix.docs.length;
  if (!terms.length) return { terms, classes: [], papers: [], chapters: [] };
  // a word of 4 or more letters also matches the longer words that start with it ("ecosystem" -> "ecosystems")
  const forms = terms.map((t) => (t.length >= 4 ? ix.vocab.filter((v) => v.startsWith(t)) : (ix.df.has(t) ? [t] : [])));
  const chapters = [];
  for (const d of ix.docs) {
    let score = 0;
    for (const group of forms) for (const v of group) {
      const f = d.tf.get(v);
      if (!f) continue;
      const n = ix.df.get(v), idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += idf * (f * 2.2) / (f + 1.2 * (0.25 + 0.75 * d.len / ix.avg));      // BM25, k1 1.2, b 0.75
    }
    if (score > 0) chapters.push({ id: d.id, i: d.i, score });
  }
  chapters.sort((a, b) => b.score - a.score);
  const top = chapters.slice(0, 20), all = forms.flat();
  for (const c of top) c.snippet = searchSnippet(DATA.lectures[c.id].chapters[c.i], all);
  // every query word must start a word of the entry; a number only counts in its "Class 4" / "Paper 7" name or its date
  const words = (f) => searchNorm(f).split(/[^\p{L}\p{N}]+/u);
  const has = (text, nums) => terms.every((t) => (/^\d+$/.test(t) ? nums : text).some((f) => words(f).some((w) => w.startsWith(t))));
  return {
    terms,
    classes: DATA.catalog.filter((c) => has([c.title, c.teacher, c.when, className(c)], [className(c), c.when])),
    papers: READINGS.filter((r) => has([r.title, r.authors, r.source, r.cite, className(r)], [className(r), String(r.year)])),
    chapters: top,
  };
}
```

### D.3 The search page (task D3)

- **The top bar.** Add `<a class="theme-btn search-btn" href="#search" aria-label="Search the course" title="Search the course">` before the theme button. It holds a magnifier SVG: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/></svg>`, styled `fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round`. The link uses `.theme-btn`'s size and hover rules.
- **The route.** `route()` gets `else if (id === "search") renderSearch();`. `setNav` marks neither Classes nor Papers.
- **Deep links.** `let pendingChapter = null;` sits next to `pendingPage`. The view's click listener also does `const c = e.target.closest("a[data-chapter]"); if (c) pendingChapter = +c.dataset.chapter;`. In `route()`, the scroll target becomes:

  ```js
  (pendingPage && document.getElementById("page-" + pendingPage)) || (pendingChapter !== null && document.getElementById("ch-" + pendingChapter))
  ```

  and both pendings are reset afterwards.
- **The page.**

```js
function chapterHit(h) {
  const e = entry(h.id), ch = DATA.lectures[h.id].chapters[h.i];
  return `
          <li class="row ready">
            <span class="paper-no">${esc(className(e))}</span>
            <div>
              <a class="row-title" href="#${h.id}" data-chapter="${h.i}">Chapter ${ch.n}: ${esc(ch.title)}</a>
              <p class="row-note">${h.snippet}</p>
            </div>
          </li>`;
}
function showSearch(q) {
  const box = $("searchResults");
  if (!q) { box.innerHTML = `<p class="lede">Type a topic, a term, an author or a paper, for example upward causation, Stam or crowdfunding.</p>`; return; }
  const r = searchCourse(q);
  if (!r.classes.length && !r.papers.length && !r.chapters.length) {
    box.innerHTML = `<p class="lede">Nothing in the classes or papers matches that. Try a shorter word, or ask Grokbot.</p>`; return;
  }
  box.innerHTML = (r.classes.length ? `<section class="group"><h2>Classes</h2><ul class="list">${r.classes.map(classRow).join("")}</ul></section>` : "")
    + (r.papers.length ? `<section class="group"><h2>Papers</h2><ul class="list papers">${r.papers.map(paperRow).join("")}</ul></section>` : "")
    + (r.chapters.length ? `<section class="group"><h2>Chapters</h2><ul class="list papers">${r.chapters.map(chapterHit).join("")}</ul></section>` : "");
  refreshProgress();
}
function renderSearch() {
  viewId = null;
  let q = "";
  try { q = sessionStorage.getItem("inn514-search") || ""; } catch (e) {}
  view.innerHTML = `
    <header class="page-head">
      <h1>Search the course</h1>
      <input class="search-input" id="searchInput" type="search" aria-label="Search the course" placeholder="Search classes, papers and chapters…" autocomplete="off" value="${esc(q)}">
    </header>
    <div id="searchResults"></div>`;
  const input = $("searchInput");
  let timer = 0;
  const run = () => { const v = input.value.trim(); try { sessionStorage.setItem("inn514-search", v); } catch (e) {} showSearch(v); };
  input.oninput = () => { clearTimeout(timer); timer = setTimeout(run, 150); };
  run();
  if (matchMedia("(pointer: fine)").matches) input.focus({ preventScroll: true });
}
```

- **CSS (tokens only):**
  - `.search-btn svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; width: 1.25rem; height: 1.25rem; }`
  - `.search-input { width: 100%; max-width: 36rem; height: 2.75rem; padding: 0 1rem; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--ink); font: inherit; font-size: 1rem; }`
  - `mark { background: var(--glow); color: var(--glow-ink); border-radius: 3px; padding: 0 .1em; }`
- **Phones (390px):** the top bar must not scroll sideways. If it would, use `.mainnav a { padding: 0 var(--sp-2); }` under 400px.

### D.4 The rules, the overview in every answer, and course retrieval (task D4)

Replace the four texts verbatim, each on one line. `NO_QUOTE` stays as it is.

```js
const RULES = "You are Grokbot, the friendly study companion of the master's course INN514, \"Innovation systems and sustainable transformation\". Below is the chapter the student is reading, then an overview of the whole course. Your answer will be read aloud by a speech engine, so write plain spoken sentences: no lists, no headings, no symbols, no brackets. Always answer in the language of the student's message. If the student greets you, thanks you or chats, reply warmly in one or two sentences and offer to explain the chapter. Otherwise answer in 3 to 6 sentences unless the student asks for more, from the chapter first and the overview second, and say where it comes from, using the slide or page numbers in words (\"on page 764\"). If neither covers the question, say so kindly in one sentence and suggest the Whole course button. Never invent authors, numbers, dates or quotations.";
const NO_QUOTE_COURSE = " Paper 2 (Fløysand, Jakobsen & Hidle 2013) is marked \"paper in preparation, do not quote\": paraphrase it and never quote it.";
const PICK_RULES = "You choose which chapters of the INN514 course companion help answer a student's message. The message may be in any language; the chapters are in English. Below is the list of chapters, one per line, as \"ID N: description\". Reply with only a JSON array of at most three objects like {\"id\": \"T4\", \"chapter\": 3}, best first, or [] if the message is a greeting or small talk, a general question about the course (teachers, dates, which papers go with which class), or not covered by any chapter.";
const COURSE_RULES = "You are Grokbot, the friendly study companion of the master's course INN514, \"Innovation systems and sustainable transformation\". Below is an overview of the whole course and, when they match the question, chapters from the course companion. Your answer will be read aloud by a speech engine, so write plain spoken sentences: no lists, no headings, no symbols, no brackets. Always answer in the language of the student's message. If the student greets you, thanks you or chats, reply warmly in one or two sentences and offer help with the classes or the papers. Otherwise answer in 3 to 6 sentences unless the student asks for more, using only the overview and the chapters, and say which class or paper and which chapter the answer comes from, in words, with the page when the chapter gives one. If the course does not cover the question, say so kindly in one sentence and name a related topic it does cover. Never invent authors, numbers, dates or quotations.";
```

- **Remove** `NOT_COVERED_EN` and `NOT_COVERED_ES` and the not-covered branch of `askCourse`.
- **The contexts:**

```js
function chapterContext(id, i) {     // the chapter, then everything Grokbot always knows
  return RULES + (id === "P02" ? NO_QUOTE : "") + NO_QUOTE_COURSE + "\n\n" + chapterBlock(id, i) + "\n\nOverview of the whole course:\n" + courseOverview();
}
function courseContext(picks) {      // the overview, then the chosen chapters
  return COURSE_RULES + NO_QUOTE_COURSE + "\n\n" + courseOverview()
    + (picks.length ? "\n\n" + picks.map((p) => chapterBlock(p.id, chapterIndexOf(p.id, p.chapter))).join("\n\n") : "");
}
function searchHits(q) {             // up to 3 chapters the local search is sure about
  return searchCourse(q).chapters.filter((c) => c.score >= 1.5).slice(0, 3)
    .map((c) => ({ id: c.id, chapter: DATA.lectures[c.id].chapters[c.i].n }));
}
function mergePicks(picks, hits) {   // the model's picks first, then the search's, at most 4
  const out = [];
  for (const p of [...picks, ...hits]) if (out.length < 4 && !out.some((q) => q.id === p.id && q.chapter === p.chapter)) out.push(p);
  return out;
}
```

- `cleanPicks(arr)` keeps at most **3** (it was 2).
- **`askCourse`, claude mode:**
  1. `const hits = searchHits(question);`
  2. The pick uses `sampleFn.json` as now. **On any error other than an abort**, `picks = []` and it carries on; it does not stop with `claudeError`.
  3. `const chosen = mergePicks(picks, hits);`, then `showSources(panel, chosen)`.
  4. `streamClaudeAnswer(panel, [{ role: "user", content: courseContext(chosen) }, { role: "user", content: question }], lang, false, null)`. It always answers, even with no chapters.
- **`askCourse`, server mode:** the body becomes `JSON.stringify({ question, hits: searchHits(question) })`.
- **The H1 guard.** `chapterContext` changes on purpose, so after this task **rewrite `checks/context-before.txt`** from the built page's `chapterContext("T4", 2)` and `chapterContext("P02", 1)`. Say so in the evidence.

### D.5 Always speaking, and "Read again" (task D5)

- **`voiceFor(lang)`:** a matching voice when there is one. When the device has voices but none matches, it returns `"default"`. It returns `null` only when there are no voices at all after waiting.

```js
function voiceFor(lang) {
  if (!("speechSynthesis" in window)) return Promise.resolve(null);
  const choose = () => pickVoice(lang) || (speechSynthesis.getVoices().length ? "default" : null);
  if (speechSynthesis.getVoices().length) return Promise.resolve(choose());
  return new Promise((res) => {
    const t = setTimeout(() => res(choose()), 1000);
    speechSynthesis.addEventListener("voiceschanged", () => { clearTimeout(t); res(choose()); }, { once: true });
  });
}
```

- **`speakSentence`:** `u.voice = voice === "default" ? null : voice;`. `u.lang` stays set, so the browser chooses a voice for the language.
- **The voice follows the answer's language.** In `streamClaudeAnswer`, remove the `voiceFor(lang).then(...)` call that starts with "Thinking…" and add:

```js
  let choosing = false;
  const chooseVoice = (sample) => {        // judged from the answer's first sentence, so a Spanish answer gets a Spanish voice
    if (choosing) return;
    choosing = true;
    lang = textLang(sample);
    voiceFor(lang).then((v) => { if (panel._ask !== st || st.ctl !== ctl) return; voice = v; drain(); });
  };
```

  - In `onText`, after `queued.push(...parts);`, add `if (queued.length) chooseVoice(queued[0]);`.
  - In the success `.then`, add `chooseVoice(buf);` before `drain();`.
  - `drain` already waits while `voice === undefined`.
- **In `speakServerAnswer`:** the first lines become `lang = textLang(text); st.lastBlobs = [];`, and `st.lastBlobs.push(blob);` follows `const blob = await mine;`.
- **"Read again."** Add `<button class="gb-replay" type="button">Read again</button>` right after `<p class="gb-words"></p>` in the bubble.
  - **CSS:** `.gb-replay` copies `.gb-switch`'s look, with `justify-self: start; display: none;` and `#grokbot:has(.ask-status:empty) .gb-words:not(:empty) + .gb-replay { display: inline-flex; align-items: center; }`. So it shows only when there are words and nothing is busy or wrong.
  - **Wiring:** `gb.querySelector(".gb-replay").onclick = gbReplay;`

```js
function speakAll(panel, text, lang) {   // reads the words again with the device voice; no captions
  const st = panel._ask;
  stopAsk(panel);
  const ctl = new AbortController();
  st.ctl = ctl;
  const parts = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
  voiceFor(lang).then((voice) => {
    if (!voice || ctl.signal.aborted || panel._ask !== st) return;
    let left = parts.length;
    serverSetBusy(panel, "Speaking…");
    for (const s of parts) speakSentence(panel, s, voice, lang, () => audio.pause(),
      () => { if (!--left && !ctl.signal.aborted && panel._ask === st) serverClearBusy(panel); });
  });
}
async function replayBlobs(panel, blobs) {   // server mode: the AI voice's MP3s again, no new /api/speak call
  const st = panel._ask;
  stopAsk(panel);
  const ctl = new AbortController();
  st.ctl = ctl;
  serverSetBusy(panel, "Speaking…");
  for (const b of blobs) {
    if (ctl.signal.aborted || panel._ask !== st) return;
    try { await playOrbBlob(panel, b, ctl); } catch (e) { break; }
  }
  if (!ctl.signal.aborted && panel._ask === st) serverClearBusy(panel);
}
function gbReplay() {
  const st = gb._ask, text = gb.querySelector(".gb-words").textContent.replace(/^This device has no voice[^\n]*\n/, "").trim();
  if (!text) return;
  if (askMode === "server" && st.lastBlobs && st.lastBlobs.length) replayBlobs(gb, st.lastBlobs);
  else speakAll(gb, text, textLang(text));
}
```

### D.6 The server (task D6)

- **Startup:**
  - Read `RULES`, `NO_QUOTE`, `NO_QUOTE_COURSE`, `PICK_RULES`, `COURSE_RULES` and `ABOUT_TEXT` from the template, failing at start if any is missing.
  - `NOT_COVERED_*` and `langOf` go.
  - `DB` also keeps `sessions: data.sessions || []`.
- **`COURSE_OVERVIEW`** is built once with D.1's `courseOverview` code, using `DB.catalog`, `DB.readings`, `DB.lectures`, `DB.sessions` and `entryOf`. It must give the same text as the page.
- **The contexts:**
  - `contextFor(id, i)` mirrors `chapterContext`: `DB.rules + (P02 ? DB.noQuote : "") + DB.noQuoteCourse + "\n\n" + blockFor(id, i) + "\n\nOverview of the whole course:\n" + COURSE_OVERVIEW`.
  - `cleanPicks` keeps at most 3, and `mergePicks` is as on the page.
- **`/api/course`:**
  - after the question check, if `body.hits !== undefined` and it is not an array of at most 3 items, reply 400;
  - `const hits = cleanPicks(body.hits || [])`;
  - the pick prompt is `DB.pickRules + "\n\n" + COURSE_INDEX + "\n\nQuestion: " + question` with `{ max_tokens: 600, temperature: 0 }`. **A pick upstream error means `picks = []`**, and it carries on;
  - `const chosen = mergePicks(picks, hits)`;
  - always answer with `[{ role: "user", content: DB.courseRules + DB.noQuoteCourse + "\n\n" + COURSE_OVERVIEW + blocks }, { role: "user", content: question }]`, where `blocks` is `"\n\n" + …` or `""`;
  - reply `200 {text, sources: chosen}`, or 429 or 502 as before. It still costs 2.
- **`scripts/mock_openrouter.mjs`:**
  - a pick is a chat whose first message starts with **"You choose which chapters"**, the new `PICK_RULES` (it was "You choose where");
  - it replies `[]` when that message contains "hola", "who teaches" or "nothing-matches", and keeps the "unknown-pick" and default replies.
- **`scripts/test_server.mjs`.** Replace the not-covered checks with:
  - **"hola" on `/api/course`:** 200, `sources: []`, `text` = the mock answer, and exactly 2 chat calls. The second's `context` contains "If the student greets you", "The classes, in course order", "Paper 7: Stam & van de Ven (2021)" and "do not quote".
  - **Hits:** `hits: [{"id":"P07","chapter":2}]` with "nothing-matches" gives `sources: [{"id":"P07","chapter":2}]` and a second call containing P07 chapter 2's title. `hits: [{"id":"T99","chapter":1}]` gives `sources: []`. Four hits give 400; `hits: "x"` gives 400.
  - **`/api/ask`:** the context contains "Overview of the whole course:" and "taught by Nora Geirsdotter Bækkelund".
  - **Everything else** still passes, including the open-mode, cost and secret checks.

### D.7 Page checks and screenshots (task D7)

**`scripts/check_page.mjs`:**
- **What changes:**
  - Update every "You choose where" to "You choose which chapters".
  - Replace the "nothing-matches gives NOT_COVERED" check with "nothing-matches still answers from the overview (a sample call whose first turn contains 'The classes, in course order')".
- **`textLang`:**
  - `textLang("hola")` is `"es-ES"`;
  - `textLang("Hola, ¿qué tal?")` is `"es-ES"`;
  - `textLang("explica el concepto")` is `"es-ES"`;
  - `textLang("What is upward causation?")` is `"en-GB"`.
- **`courseOverview()`:**
  - contains "Class 4 (Session 4, 28 September), taught by Nora Geirsdotter Bækkelund";
  - contains "Paper 7: Stam & van de Ven (2021)";
  - contains "Sessions 7 and 8";
  - has exactly 17 "In brief:".
- **Search (plain file is fine):**
  - On `#search`, typing "upward causation" lists Chapters including a `#T4` link and a `#P07` link, and at least one `<mark>`.
  - "Stam" lists Paper 7 under Papers.
  - Clicking the first chapter result opens its class or paper, and its `#ch-<i>` is within 120px of the top.
  - "zzqx" shows the no-results sentence.
  - At 390px the top bar and the search page have no horizontal scroll.
- **Claude mock.** The speech stub gives two voices (`es-ES` and `en-GB`) and records each utterance's `lang` and `voice`. The mock's `sample` answers "¡Hola! Soy Grokbot. ¿En qué te ayudo?" when the last turn is "hola". On `#home`:
  - "hola" makes a pick that returns `[]`, then a `sample` whose first turn contains "If the student greets you" and "The classes, in course order";
  - the utterances' lang is `es-ES`;
  - the words show the answer;
  - "Read again" (visible after the answer) speaks again, adding utterances, with no new `sample` call.
- **The fallback voice.** With a stub that has only an `en-GB` voice, a Spanish answer still speaks, with voice `null` and lang `es-ES`.
- **Server mode:** a course question sends a body with `hits` (an array) to `/api/course`, and "Read again" replays with no new `/api/speak` request.
- **Screenshots:** `checks/phone-search.png` (390px, "upward causation" results), `checks/phone-search-dark.png`, and `checks/phone-grokbot-hola.png` (the "hola" answer in the bubble).
- **Then** do a full run (ALL PAGE CHECKS PASSED) and run `build_static.py`.

### D.8 Tasks

| Task | What it is |
|---|---|
| D1 | `ABOUT_TEXT` (and `renderHome` using it), `ES_WORDS`, `textLang`, `askLang` using it, `courseOverview()` |
| D2 | `SEARCH_STOP`, `searchNorm`, `searchTerms`, `searchIndex`, `searchSnippet`, `searchCourse` |
| D3 | The search button, the `#search` route, `pendingChapter`, `chapterHit`, `showSearch`, `renderSearch`, the CSS |
| D4 | The new rule texts and `NO_QUOTE_COURSE`; `chapterContext`, `courseContext`, `searchHits`, `mergePicks`, `cleanPicks` at 3; `askCourse` with hits, pick errors carrying on, and no not-covered branch; rewrite `checks/context-before.txt` |
| D5 | `voiceFor` with `"default"`, `speakSentence`'s voice line, `chooseVoice` in `streamClaudeAnswer`, `st.lastBlobs` and `textLang` in `speakServerAnswer`, `speakAll`, `replayBlobs`, `gbReplay`, the "Read again" button and CSS |
| D6 | `server.js` (D.6), `mock_openrouter.mjs`, `test_server.mjs`; ALL SERVER CHECKS PASSED |
| D7 | `check_page.mjs` (D.7), screenshots, full run, ALL PAGE CHECKS PASSED, `build_static.py` |
| G5 | **STOP GATE G5** |

---

## Part E: tidy-up after Part D (added 2026-10-24; DeepSeek builds it)

Two small clean-ups the student asked DeepSeek to do. Nothing a visitor sees changes, and the content manifest must not change.

### E1. The health report shows only what it needs (`server.js`, `scripts/test_server.mjs`)

The `/api/health` reply becomes exactly this, in this order (the `.env` reading at startup stays as it is):

```js
  if (p === "/api/health") {
    return done(200, JSONH, JSON.stringify({
      ok: true,
      ask: !!KEY,
      // Whether each setting is present (never its value). The page asks for a passcode only when one is set.
      key: !!KEY, passcode: !!cleanPass(process.env.GROKBOT_PASSCODE),
      voices: { en: VOICE_EN, es: VOICE_ES },
    }));
  }
```

- `seen` and `runtime` go. They listed setting names and Canner's deployment details while the missing key was being found.
- In `scripts/test_server.mjs`, replace the check "health lists the setting names it sees (names only)" with:

  ```js
  check(health && !("seen" in health) && !("runtime" in health) && JSON.stringify(Object.keys(health)) === JSON.stringify(["ok", "ask", "key", "passcode", "voices"]),
    "health shows only ok, ask, key, passcode and voices", JSON.stringify(Object.keys(health || {})));
  ```

  Every other check stays.

### E2. Unused text and styles leave the page (`site/template.html`)

The student removed the honesty line under the bubble (commit `d6d26ee`), and Part H replaced `.ask-text` with `.gb-words`. Remove these, and nothing else:
- the four constants `SERVER_ASK_NOTE`, `DEVICE_ASK_NOTE`, `COURSE_SERVER_NOTE` and `COURSE_DEVICE_NOTE`;
- the CSS rules `.ask-text { … }` and `.ask-note { … }`.

Before removing each one, search the whole template, `scripts/check_page.mjs` and `server.js` for its name. If anything still uses it, stop and report instead of removing it.

### E3. Tasks

| Task | What it is |
|---|---|
| E1 | The health reply and its server check; ALL SERVER CHECKS PASSED |
| E2 | The four constants and two CSS rules; `build_site.py`, a full `check_page.mjs` run (ALL PAGE CHECKS PASSED), then `build_static.py` |
| G6 | **STOP GATE G6** |

---

## Part F: a faster voice reply (added 2026-10-24; DeepSeek builds it)

**Why.** Measured on Canner on 2026-10-24, before anything is heard:

| Question | Time |
|---|---|
| A chapter question | 11.1 s |
| An English course question | 14.5 s |
| A Spanish course question | 38.8 s |

On top of that, the first spoken part takes 3.9 s (English) or 5.2 s (Spanish) for Fish to produce. Three causes:
1. The server waits for the whole answer before the voice starts.
2. A course question makes two model calls. The first (choosing chapters) often chose worse than the site's own search: for "upward causation" it picked three Class 5 and Class 3 chapters.
3. `openrouter/free` sends each question to a random free model, sometimes a slow one.

**The student's decisions (2026-10-24):** stream the speech, skip the pick when the search finds chapters, and use faster model settings. Claude asks the student before changing Canner's model setting to time models (gate G7).

**Unchanged:** the chips, the bubble, search, the overview, Paper 2's rules, the limits' numbers, the non-streamed replies (still used by the tests), and every lecture, paper, audio and data file. The manifest must not change.

### F.1 The server streams answers (task F1, `server.js`)

**Settings and helpers.** Put them right after `VOICE_ES`. Do not use `num()` here, because it is defined further down.

```js
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
```

**`askUpstream`** keeps its behaviour, with three changes: it loops over `opts.models || MODELS`, sends `headers: upstreamHeaders()`, and sends `body: upstreamBody(model, messages, opts, false)`.

**The streaming call**, below `askUpstream`. It was run against a fake streaming OpenRouter in six cases:
- a normal answer (first sentence after 0.18 s);
- a model slow to start (it moves on after `FIRST_TOKEN_MS`);
- a model that only thinks (it moves on);
- a 500 (it moves on);
- 429 from both models (`{error: 429}`);
- a model that breaks off (what it said stands).

```js
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
```

**`/api/ask`.** Right after `messages` is built, add `if (body.stream === true) return answerStream(streamReply(req, res, start), done, messages);`. The non-streamed path below it is unchanged.

**`/api/course`** is restructured like this. The guessing lock and the passcode stay first, unchanged.

```js
    return readBody(req, (err, raw) => {
      /* unchanged: 413, JSON parse 400, question 1-500 400, hits check 400 */
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
```

The old `limitsOk(req, "ask", 2)` line before `readBody` goes.

### F.2 Tests for the server (task F2, `scripts/mock_openrouter.mjs`, `scripts/test_server.mjs`)

**The mock:**
- When a chat request has `stream: true`, it answers `text/event-stream` with three events:
  1. `data: {"choices":[{"delta":{"content":"First sentence. "}}]}`
  2. after `MOCK_STREAM_GAP_MS` (default 200), `data: {"choices":[{"delta":{"content":"Second sentence."}}]}`
  3. `data: [DONE]`

  Each event ends with a blank line.
- If `body.model === process.env.MOCK_SLOW_MODEL`, the first event waits 3000 ms.
- If `body.model === process.env.MOCK_THINK_MODEL`, it sends only `data: {"choices":[{"delta":{"reasoning":"thinking"}}]}` and `[DONE]`.
- Each recorded call also keeps `stream: !!body.stream` and `reasoning: body.reasoning ?? null`.
- Non-streamed calls, picks and speech are unchanged.

**The test harness.** `startMock(port, failMode, sequence, settings = {})` merges `settings` into the mock's environment.

**New checks in `test_server.mjs`.** Use the `X-Forwarded-For` address `203.0.113.60`, and fresh servers where noted.
- **Stream, chapter:** `/api/ask` with `stream: true` answers `application/x-ndjson`. Its lines are `{"sentence":"First sentence."}`, `{"sentence":"Second sentence."}` and `{"done":true,"text":"First sentence. Second sentence."}`. The first line arrives at least 120 ms before the second.
- **Stream, course with hits:** `/api/course` with `stream: true` and `hits: [{"id":"T4","chapter":3}]` starts with `{"sources":[{"id":"T4","chapter":3}]}` and then the sentences. The mock saw exactly **1** chat call, with no pick.
- **Course without hits:** "nothing-matches" with no hits makes 2 chat calls, a pick and then the answer.
- **The cost:** on a fresh server with `{ GROKBOT_RATE_PER_10MIN: "2" }`, two course questions with hits get 200 and 200, and a third gets 429. The existing cost-of-2 check, a course question without hits, still passes.
- **Slow start:** on a fresh server with `{ GROKBOT_FIRST_TOKEN_MS: "500" }` and a fresh mock with `{ MOCK_SLOW_MODEL: <first model> }`, a streamed ask is answered by the second model. The mock's last chat call has the second model's name.
- **Thinking only:** a fresh mock with `{ MOCK_THINK_MODEL: <first model> }` gives the same result.
- **Reasoning setting:** on a fresh server with `{ GROKBOT_REASONING: '{"effort":"low"}' }`, the mock's chat call has `reasoning` `{"effort":"low"}`. On the normal server, `reasoning` is `null`.
- **No model answers:** with every model failing (`MOCK_FAIL` that makes chat calls 500, added to the mock as `MOCK_FAIL=chat500`), a streamed `/api/ask` gets HTTP 502 JSON, not NDJSON.
- **Everything else** still passes, including the secret checks over the new replies.

### F.3 The page speaks while the answer arrives (task F3, `site/template.html`)

Add these three functions after `serverDevicePart`. The first two were run against simulated audio:
- 5 sentences make 2–4 voice calls, played in order;
- a failed part falls back to the device voice;
- with no voice at all, the whole answer shows as it grows;
- Stop halts everything.

```js
/* Speaks an answer while it is still arriving (server mode). The first sentence is sent to the voice
   at once; after that, whatever has gathered goes as one part each time the previous part's audio has
   arrived, so a 5-sentence answer usually takes 2 or 3 /api/speak calls. Parts always play in order.
   If a part's audio fails, the device voice says it; with no voice at all, the answer is shown. */
function serverSpeaker(panel, ctl) {
  const st = panel._ask;
  st.lastBlobs = [];
  const parts = [];                     // { text, blob: Promise<Blob> } in speaking order
  let waiting = "", inFlight = 0, ended = false, lang = null, wake = null, all = "", textOnly = false;
  const poke = () => { if (wake) { const w = wake; wake = null; w(); } };
  const flush = () => {
    if (textOnly || !waiting.trim()) return;
    const text = waiting.trim();
    waiting = "";
    if (!lang) lang = textLang(text);
    inFlight++;
    const blob = fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Grokbot-Passcode": serverPass },
      body: JSON.stringify({ text, lang }),
      signal: ctl.signal,
    }).then((r) => { if (!r.ok) { const e = new Error("Speak failed"); e.status = r.status; throw e; } return r.blob(); });
    blob.catch(() => {}).finally(() => { inFlight--; if (waiting.trim()) flush(); else poke(); });
    parts.push({ text, blob });
    poke();
  };
  const run = (async () => {
    for (let k = 0; ; k++) {
      while (k >= parts.length) {
        if (ended && !waiting.trim() && inFlight === 0 && k >= parts.length) return;
        await new Promise((res) => { wake = res; });
        if (ctl.signal.aborted || panel._ask !== st) return;
      }
      const { text, blob } = parts[k];
      if (ctl.signal.aborted || panel._ask !== st) return;
      try {
        const b = await blob;
        st.lastBlobs.push(b);
        if (ctl.signal.aborted || panel._ask !== st) return;
        serverSetBusy(panel, "Speaking…");
        caption(panel, text);
        await playOrbBlob(panel, b, ctl);
      } catch (e) {
        if (ctl.signal.aborted || panel._ask !== st) return;
        const voice = await voiceFor(lang || textLang(text));
        if (ctl.signal.aborted || panel._ask !== st) return;
        if (!voice) {                   // no voice at all: show the whole answer, now and as the rest arrives
          textOnly = true;
          serverShowText(panel, all);
          while (!ended) await new Promise((res) => { wake = res; });
          return;
        }
        serverSetBusy(panel, "Speaking…");
        await serverDevicePart(panel, text, voice, lang || textLang(text), ctl);
      }
    }
  })();
  return {
    add(sentence) {                     // a finished sentence from the stream
      all += (all ? " " : "") + sentence;
      if (textOnly) { serverShowText(panel, all); return; }
      waiting += (waiting ? " " : "") + sentence;
      if (parts.length === 0 || inFlight === 0) flush();
    },
    end() {                             // the stream is over; resolves when everything has been spoken
      ended = true;
      if (inFlight === 0) flush();
      poke();
      return run.then(() => { if (!ctl.signal.aborted && panel._ask === st) { st.pending = null; serverClearBusy(panel); } });
    },
  };
}
/* Reads a streamed answer: one JSON object per line ({sources}, {sentence}, {done, text} or {error}). */
async function readAnswerStream(r, onLine) {
  const reader = r.body.getReader(), dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) onLine(JSON.parse(line));
    }
  }
  if (buf.trim()) onLine(JSON.parse(buf.trim()));
}
/* Server mode: asks /api/ask or /api/course with stream: true and speaks each sentence as it arrives.
   onDone(text) gets the whole answer as soon as the stream ends (the chapter conversation keeps it). */
async function streamServerAnswer(panel, ctl, url, body, onDone) {
  const st = panel._ask;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Grokbot-Passcode": serverPass },
    body: JSON.stringify(Object.assign({}, body, { stream: true })),
    signal: ctl.signal,
  });
  if (!r.ok) { const e = new Error("Ask failed"); e.status = r.status; throw e; }
  const sp = serverSpeaker(panel, ctl);
  let failed = null, any = false;
  await readAnswerStream(r, (m) => {
    if (ctl.signal.aborted || panel._ask !== st) return;
    if (m.sources) showSources(panel, m.sources);
    if (m.sentence) { any = true; sp.add(m.sentence); }
    if (m.done && onDone) onDone(m.text || "");
    if (m.error) failed = m.error;
  });
  await sp.end();
  if (failed && !any && !ctl.signal.aborted && panel._ask === st) {
    const e = new Error("Ask failed"); e.status = failed === "rate_limited" ? 429 : 502; throw e;
  }
}
```

- **`askSendServer`'s `try` block becomes:**

  ```js
  await streamServerAnswer(panel, ctl, "/api/ask", { id, chapter: i, question, history: st.hist }, (text) => {
    if (panel._ask !== st) return;
    st.hist.push({ role: "user", content: question }, { role: "assistant", content: text });
    st.hist = st.hist.slice(-6);
    st.first = false;
  });
  ```

  Its `const lang = askLang(...)` line goes.
- **`askCourse`'s server branch** (after `if (askMode !== "server")`) becomes one line: `await streamServerAnswer(panel, ctl, "/api/course", { question, hits: searchHits(question) }, null);`
- **Remove** `askServer` and `speakServerAnswer`, because nothing calls them any more. `gbReplay` keeps using `st.lastBlobs`, which `serverSpeaker` fills.

### F.4 Fewer and shorter model calls (task F4, `site/template.html`)

- **`askCourse`, claude mode:** pick only when the search found nothing:

  ```js
  const hits = searchHits(question);
  let picks = [];
  if (!hits.length) {        // the search found nothing (often a question in Spanish): the model chooses chapters
    try {
      picks = cleanPicks(await sampleFn.json(PICK_RULES + "\n\n" + courseIndex() + "\n\nQuestion: " + question, { modelTier: "quick", signal: ctl.signal, cache: false }));
    } catch (e) {
      if (ctl.signal.aborted || panel._ask !== st) return;
    }
  }
  if (ctl.signal.aborted || panel._ask !== st) return;
  const chosen = mergePicks(picks, hits);
  ```

  The rest is unchanged.
- **Shorter answers.** In both `RULES` and `COURSE_RULES`, replace `Otherwise answer in 3 to 6 sentences unless the student asks for more` with `Otherwise answer in 2 to 4 short sentences unless the student asks for more`. Nothing else in them changes.
- **The H1 guard.** Then rewrite `checks/context-before.txt` from the built page, as in D4, and say so in the evidence.

### F.5 Page checks (task F5, `scripts/check_page.mjs`)

- **Claude mock:**
  - **"What is upward causation?"** on the front page makes **no** `sample.json` call (`window.__lastJson` stays `null`). Its `sample` first turn contains "Two models of the ecosystem", T4 chapter 3's title.
  - **"¿Qué es la causalidad ascendente?"** makes a `sample.json` call with `modelTier: "quick"` whose input contains "T4 3:" and "P07 1:". This replaces the old "What is an entrepreneurial ecosystem?" pick check.
  - **The first turn** of a course `sample` contains "2 to 4 short sentences".
- **Server mode** (the mock streams):
  - the chapter question's request body has `stream: true`;
  - the first `/api/speak` body's `text` is "First sentence.";
  - `.gb-words` ends as "First sentence. Second sentence.";
  - at most 2 `/api/speak` calls for that answer;
  - a course question on `#home` sends `stream: true` and `hits`, and its sources link `#T4`;
  - "Read again" makes no new `/api/speak` call.
- Update any other check that relied on the non-streamed server path.
- **Then** a full run, ALL PAGE CHECKS PASSED, and `build_static.py`.

### F.6 Gate G7 (Claude)

- **Review:** the usual checks, plus a local streamed answer timed with the mock.
- **Before and after on Canner:** time from asking to the first `sentence` line, for the same three questions as above, and on the phone to the first word heard.
- **Proxy buffering.** If Canner's proxy holds the stream back (the first line arrives with the last), Claude reports it. The answer still works, only without the speed-up.
- **Models,** only after the student says yes in chat:
  - Claude briefly sets `GROKBOT_ANSWER_MODELS` on Canner (runtime scope) to one candidate at a time, redeploys, and times the first sentence for an English and a Spanish question. The candidates are `nvidia/nemotron-3.5-lightning:free`, `google/gemma-4-26b-a4b-it:free`, `thinkingmachines/inkling-small:free`, `google/gemma-4-31b-it:free` and the current two. A second round also tries `GROKBOT_REASONING={"effort":"low"}`.
  - Then Claude writes the fastest good pair as the default in `server.js`, removes the temporary Canner setting, pushes and reports the numbers.

### F.7 Tasks

| Task | What it is |
|---|---|
| F1 | `server.js`: settings and helpers, `askUpstream` using them, `askUpstreamStream`, `streamReply`, `answerStream`, `/api/ask` streaming, the `/api/course` restructure |
| F2 | `mock_openrouter.mjs` streaming and the switches; `startMock` settings; the new `test_server.mjs` checks; ALL SERVER CHECKS PASSED |
| F3 | `serverSpeaker`, `readAnswerStream`, `streamServerAnswer`; `askSendServer` and `askCourse` using them; `askServer` and `speakServerAnswer` removed |
| F4 | Skip the pick in claude mode when the search finds chapters; "2 to 4 short sentences" in both rules; rewrite `checks/context-before.txt` |
| F5 | `check_page.mjs` (F.5), full run, ALL PAGE CHECKS PASSED, `build_static.py` |
| G7 | **STOP GATE G7** |

---

## Part N: autoplay from class to class and paper to paper, and previous/next on every page (added 2026-10-26; ZCode + GLM 5.3 Flash builds it)

The student listened to the whole course on 2026-10-26 and found two problems:
1. **Playback stopped at the end of every class or paper.** The player went from chapter to chapter, but stopped after a class's or paper's last chapter.
2. **A paper page had no way to the previous or next paper.** It had only a "Next paper" line at the bottom, which followed the papers page's grouping (P08 led to P14), and there was no "previous".

**The student's decisions (2026-10-26):**
- **The class chain** runs Class 1, 2, 3, 4, 5, 6, 9, then the **bonus class**, and stops.
- **The paper chain** runs **1 → 17** by number and stops. The two chains are separate.
- **An "Auto" button in the player,** on by default and remembered, turns the chain on and off.
- **ZCode builds Part N first,** and DeepSeek's Parts E and F wait for gate **G8**, because both agents edit `site/template.html`.

**Unchanged:** Grokbot, search, the server, and every lecture, paper, audio and data file. The manifest must not change. Only `site/template.html` and `scripts/check_page.mjs` are edited.

**Checked by Claude before handing over:** on the real `DATA`, `SERIES` and `neighbour` give T1 → T8 → B1 and P01 → P17, with Paper 8 followed by Paper 9, and `pager("P07")` gives the Paper 6 and Paper 8 buttons with their labels.

### N.1 The listening order and the autoplay (task N1)

Put this after `READINGS`, `entry` and `className` are defined, near the player code is fine:

```js
/* The listening order: classes in course order (the bonus class last), papers by their number. */
const SERIES = {
  classes: DATA.catalog.filter((c) => DATA.lectures[c.id]).map((c) => c.id),
  papers: READINGS.filter((r) => DATA.lectures[r.id]).slice().sort((a, b) => a.num - b.num).map((r) => r.id),
};
const seriesOf = (id) => (isReading(id) ? SERIES.papers : SERIES.classes);
const neighbour = (id, step) => { const s = seriesOf(id), k = s.indexOf(id); return k < 0 ? null : s[k + step] || null; };
let autoplay = store.autoplay !== false;   // the Auto button: go on to the next class or paper
/* Goes on to another class or paper at chapter i. The audio goes on; the page follows when it was showing
   the one that was playing and Follow is on. */
function goOn(id, i) {
  const follows = !!pl && viewId === pl.id && follow;
  play(id, i, false);
  if (follows) { pendingChapter = i; location.hash = id; }
}
```

- `SERIES.classes` is `T1 T2 T3 T4 T5 T6 T8 B1`, and `SERIES.papers` is `P01`–`P17`.
- **The `ended` handler** becomes:

  ```js
  audio.addEventListener("ended", () => {
    if (!pl) return;
    markDone(pl.id, plIdx);
    if (plIdx < pl.chapters.length - 1) return play(pl.id, plIdx + 1, false);
    const nxt = autoplay ? neighbour(pl.id, 1) : null;
    if (nxt) return goOn(nxt, 0);
    $("playIcon").innerHTML = PLAY; markParagraph(-1);
  });
  ```

- **The player's ⏮ and ⏭ buttons**, and therefore the phone's lock-screen buttons, also cross from one class or paper to the next. These are your own taps, so they work even with Auto off:

  ```js
  $("prev").onclick = () => {
    if (!pl) return;
    if (audio.currentTime > 5) audio.currentTime = 0;
    else if (plIdx > 0) play(pl.id, plIdx - 1, true);
    else { const p = neighbour(pl.id, -1); if (p) goOn(p, DATA.lectures[p].chapters.length - 1); }
  };
  $("next").onclick = () => {
    if (!pl) return;
    if (plIdx < pl.chapters.length - 1) play(pl.id, plIdx + 1, true);
    else { const n = neighbour(pl.id, 1); if (n) goOn(n, 0); }
  };
  ```

- **The Auto button.** In the player's first row, between Follow and the speed chip, add:

  ```html
  <button class="chip auto" id="auto" aria-pressed="true" title="Go on to the next class or paper when this one ends">Auto</button>
  ```

  - Its CSS is `.chip.auto[aria-pressed="true"] { background: var(--surface-2); }`, like Follow.
  - The wiring:

    ```js
    $("auto").setAttribute("aria-pressed", String(autoplay));
    $("auto").onclick = () => { autoplay = !autoplay; $("auto").setAttribute("aria-pressed", String(autoplay)); store.autoplay = autoplay; save(); };
    ```

### N.2 Previous and next on every class and paper page (task N2)

```js
const CHEV_L = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
const CHEV_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
/* The previous and next class (or paper) as two small buttons beside the breadcrumb. */
function pager(id) {
  const kind = isReading(id) ? "paper" : "class";
  const btn = (to, dir) => {
    const e = entry(to), label = (dir < 0 ? "Previous " : "Next ") + kind + ": " + className(e) + ", " + e.title;
    return `<a class="pager-btn" href="#${to}" aria-label="${esc(label)}" title="${esc(label)}">${dir < 0 ? CHEV_L : ""}${esc(className(e))}${dir > 0 ? CHEV_R : ""}</a>`;
  };
  const p = neighbour(id, -1), n = neighbour(id, 1);
  if (!p && !n) return "";
  return `<nav class="pager" aria-label="Previous and next ${kind}">${p ? btn(p, -1) : "<span></span>"}${n ? btn(n, 1) : "<span></span>"}</nav>`;
}
```

- **In `renderLecture`,** both the "in preparation" branch and the full page wrap the breadcrumb and the pager in one row: `<div class="lec-top">${crumbs}${pager(id)}</div>` in place of `${crumbs}`.
- **CSS (tokens only):**
  - `.lec-top { display: flex; justify-content: space-between; align-items: center; gap: var(--sp-2); flex-wrap: wrap; }`
  - `.pager { display: flex; gap: var(--sp-2); padding-top: var(--sp-4); }`
  - `.pager-btn { display: inline-flex; align-items: center; gap: var(--sp-1); min-height: 2.75rem; padding: 0 .9rem; border: 1px solid var(--line); border-radius: 999px; color: var(--ink); font-size: var(--s-1); font-weight: 500; text-decoration: none; transition: background-color .15s; }`
  - `.pager-btn:hover { background: var(--surface-2); }`
  - `.pager-btn svg { width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }`
- **"Where next" at the bottom** (`whereNext`) uses the same order.
  - **For a paper:** "Next paper:" now comes from `neighbour(c.id, 1)` (number order). A new "Previous paper:" line, with the same markup, comes from `neighbour(c.id, -1)`. On Paper 17 the next line becomes "Back to the first paper:" linking Paper 1, as the classes already do.
  - **For a class:** "Next class:" comes from `neighbour`, and a new "Previous class:" line is added. "Back to the first class:" stays for the bonus class.

### N.3 Checks and screenshots (task N3, `scripts/check_page.mjs`)

Every existing check stays. New checks, with the same "seek to `duration - 0.4`, wait 3 s" method as "next chapter starts on its own":
- **The order:** `SERIES.classes` is `["T1","T2","T3","T4","T5","T6","T8","B1"]`, and `SERIES.papers` is `P01`…`P17` in number order.
- **Class to class:**
  - On `#T1`, with Follow and Auto on, play T1's last chapter and let it end. `T2-01.mp3` is playing, `location.hash` is `#T2`, and the page's `h1` is T2's title.
  - Do the same on `#P08`'s last chapter. `P09-01.mp3` plays: number order, not the list's P14.
- **Where you are:** on `#papers`, let T1's last chapter end. The audio goes on to T2, and the hash stays `#papers`.
- **Auto off:**
  - Click `#auto`. `aria-pressed` is `false`, and the saved store has `autoplay: false`.
  - Let P01's last chapter end: the audio stops on P01.
  - ⏭ on that last chapter still opens P02 chapter 1.
  - ⏮ at the start of T2 chapter 1 opens T1's last chapter.
  - Switch Auto back on.
- **The ends:** with Auto on, the end of P17's last chapter stops, and so does the end of B1's.
- **The pager:**
  - **`#P07`:** the top pager links `#P06` and `#P08`, with `aria-label`s beginning "Previous paper: Paper 6," and "Next paper: Paper 8,". "Where next" has "Previous paper:" and "Next paper:".
  - **`#P01`:** no previous; the next is `#P02`.
  - **`#P17`:** the previous is `#P16`, with no next button; "Where next" has "Back to the first paper:".
  - **`#P08`:** the next is `#P09`.
  - **`#T8`:** the next is `#B1`.
  - **`#B1`:** the previous is `#T8`, with no next.
- **Phone, 390px:** on `#P07`, and in the player with the Auto chip, there is no horizontal scroll. The breadcrumb and pager sit on one row, or wrap without overlapping.
- **Screenshots:** `checks/phone-paper-pager.png` (the top of `#P07` at 390px) and `checks/phone-player-auto.png` (the player with Auto).
- **Then** a full run, ALL PAGE CHECKS PASSED, and `build_static.py`.

### N.4 Tasks for ZCode

| Task | What it is |
|---|---|
| N1 | `SERIES`, `seriesOf`, `neighbour`, `autoplay`, `goOn`; the `ended` handler; ⏮ ⏭ across classes and papers; the Auto button, its CSS and wiring |
| N2 | `CHEV_L`, `CHEV_R`, `pager`; the `.lec-top` row in both branches of `renderLecture`; the CSS; "Where next" in number order with previous lines |
| N3 | The `check_page.mjs` checks and screenshots, full run, `build_static.py` |
| G8 | **STOP GATE G8** |

---

## Rules for the executor: ZCode + GLM 5.3 Flash (Parts A, S, H, B, C and N), or DeepSeek (Parts D, E and F) (put verbatim in the kickoff)

- **Work only in** `D:/HVL2025/514/workspace/lecture-audio/`.
- **May edit:** `site/template.html` and `scripts/check_page.mjs`; for Parts H and D also `server.js`, `scripts/mock_openrouter.mjs`, `scripts/test_server.mjs` and `checks/context-before.txt`.
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
  - use all caps, " · " joins, "→" in link text, or card shadows (the orb's glow and the Grokbot bubble's shadow, Part H, are the only exceptions);
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
| H1–H9 | Part H, Grokbot the floating avatar (table in H.7); it comes right after G1 and before B1 |
| G4 | **STOP GATE G4** (it also closes G1) |
| D1–D7 | Part D (DeepSeek), the friendlier Grokbot and the search page (table in D.8) |
| G5 | **STOP GATE G5** |
| N1–N3 | Part N (ZCode), autoplay and previous/next (table in N.4); it comes before Part E |
| G8 | **STOP GATE G8** |
| E1–E2 | Part E (DeepSeek), the tidy-up (table in E.3) |
| G6 | **STOP GATE G6** |
| F1–F5 | Part F (DeepSeek), the faster voice reply (table in F.7) |
| G7 | **STOP GATE G7** |
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
- **G4** (it also closes G1):
  - **Manifest and checks:** as at G1, plus the `context-before.txt` guard, the new `/api/course` checks and the Grokbot checks.
  - **Screenshots:** read `phone-grokbot.png`, `phone-grokbot-dark.png` and `desktop-grokbot.png`. Move the old panel and greeting screenshots to the scratchpad quarantine.
  - **Code review:**
    - H1 moved code without changing it (diff the moved bodies);
    - the drag maths and the clamping, including the player and the top bar;
    - one `requestAnimationFrame` at a time, which stops when the page is hidden and under reduced motion;
    - `gbClose` gives work still running a new state, so it stops;
    - `/api/course` checks the passcode, the lock and the cost of 2 before any upstream call;
    - the page talks only to `sample` (claude mode) or `/api/ask`, `/api/course` and `/api/speak` (server mode);
    - P02 always adds `NO_QUOTE`.
  - **Claude's own look:** in the browser pane at 390px and 1280px, in light and dark: drag, tap, both modes, a long answer scrolling in the bubble, and the bubble above and below the orb.
  - **The scan,** then **publish:** commit and push (Canner redeploys) and republish the claude.ai link with `capabilities: {sample: {}}`.
  - **You,** on both sites:
    - drag Grokbot around;
    - ask a question on a chapter;
    - ask "What is upward causation?" on the front page;
    - ask a Spanish question;
    - then approve G4.
- **G5:**
  - **Checks:** the manifest is unchanged; `test_server.mjs` and `check_page.mjs` pass in full; `context-before.txt` was rewritten on purpose (D4).
  - **Screenshots:** read `phone-search*.png` and `phone-grokbot-hola.png`.
  - **Code review:**
    - `ABOUT_TEXT` and the search code sit before the first `route()`;
    - the search escapes everything it shows;
    - every Paper 2 path carries a do-not-quote rule;
    - "Read again" never calls `/api/speak` twice;
    - the page talks only to `sample` or to `/api/*`.
  - **Claude's own look** in the browser pane: "hola", "¿quién enseña la clase 4?", "What is upward causation?", the search page at 390px and 1280px, and "Read again".
  - **Publish:** the scan, a push (Canner redeploys) and a republish of the claude.ai link.
  - **You** test both sites on your phone, then approve G5.
- **G8:**
  - **Checks:** the manifest is unchanged, and both suites pass in full.
  - **Screenshots:** read `phone-paper-pager.png` and `phone-player-auto.png`.
  - **Review:** `goOn` changes the hash only when the page showed the ending lecture; the Auto state is saved; ⏮ ⏭ cross lectures.
  - **Claude's own look** in the browser pane: a class end moves on, Auto off stops, and the pager works at 390px.
  - **Publish:** the scan, a push and a republish.
  - **You** listen across a class end and a paper end on your phone, then approve G8.
- **G6:**
  - **Checks:** the manifest is unchanged, and both suites pass in full.
  - **Review:** `/api/health` on a local run shows only `ok`, `ask`, `key`, `passcode` and `voices`; the removed names appear nowhere.
  - **Publish:** the scan, a push, a check that Canner's health has the new shape, and a republish of the claude.ai link.
- **G7:**
  - **Checks:** the manifest is unchanged, and both suites pass in full; `context-before.txt` was rewritten on purpose (F4).
  - **Review:**
    - the stream code matches F.1 and F.3;
    - no `/api/speak` storm (at most 2–3 per answer);
    - Stop and route changes end the stream and the voice.
  - **Timing:** before and after on Canner (F.6); models only after the student's yes.
  - **Publish:** the scan, a push and a republish.
- **G2:** `sync_knowledge.py` (no flags) prints "pack unchanged"; at the next content change, `--push`.
- **G3:** the 12 watch questions, then `check_outbox.py --pull --since <start>`, all PASS; Claude checks the facts; you approve.
