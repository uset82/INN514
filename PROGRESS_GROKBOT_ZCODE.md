# Grokbot for INN514: ZCode + GLM 5.3 Flash progress

Spec: `workspace/lecture-audio/GROKBOT_PLAN.md`. Prompt: `workspace/lecture-audio/GROKBOT_KICKOFF.md`.
Do the first unchecked task only, one task per conversation. Tick a box only when the task is done, and paste its evidence under it: the commands you ran, their output (or the last lines), and the files you changed. Never tick a STOP GATE.

## Phase 0: plan files, backups and manifest (Claude Code)
- [x] Done by Claude Code on 2026-10-23. Wrote `GROKBOT_PLAN.md` (the spec), `GROKBOT_KICKOFF.md` (the prompt) and this file. Backed up `site/template.html` and `scripts/check_page.mjs` to Claude's scratchpad as `*.before-grokbot`. Wrote the checksum manifest of the content that must not change to `checks/grokbot-manifest-before.txt`.
- Already done before this plan: the knowledge pack in `uset82/grok-watch-hub` (commit `172bc14`), exported by `scripts/export_knowledge.py`.
- Still open for the student: paste the routine line into Grok Principal's routine.

## Part R: the public repo and the Canner copy
- [x] R1. `.gitignore`, repo `README.md` and `robots.txt` in `workspace/lecture-audio/` (plan Part R, R1)
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): checked first that none of the three files existed (`ls -la workspace/lecture-audio/` — no `.gitignore`, `README.md` or `robots.txt`), then created them.
  - Commands run: `ls -la /d/HVL2025/514/workspace/lecture-audio/` (layout check, no overwrites) and `head -8 build_audio.py build_site.py check_page.mjs export_knowledge.py` (docstrings, to keep the Build lines factual). No build required for this task.
  - Files created: `workspace/lecture-audio/.gitignore` (exact plan lines: `cache/`, `checks/*.png`, `__pycache__/`, `*.before-*`, `.env`, `.env.*`, `*.key`), `workspace/lecture-audio/robots.txt` (`User-agent: *` / `Disallow: /`), `workspace/lecture-audio/README.md` (five sections with the plan's wording word for word; title `# INN514 Course Companion` added).
- [x] R2. `scripts/build_static.py` (plan Part R, R2). Run it: every check passes, and the root `index.html` is written
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): command run from `D:/HVL2025/514`:
    - `C:/Python313/python.exe workspace/lecture-audio/scripts/build_static.py`
    - Output: `index.html: 531 KB, 154 audio files under site/audio/` (no FAIL; all three pre-write checks passed).
  - Spot-check of the written `workspace/lecture-audio/index.html`: starts `<!doctype html>` / `<html lang="en"><head><meta charset="utf-8">` / viewport meta / robots meta, then the fragment, ends `</script></html>`; 154 `"audio": "site/audio/` paths and 0 old `"audio": "audio/`; `noindex, nofollow` present; "unofficial study aid" absent.
  - Files: created `scripts/build_static.py`; it wrote `index.html` at the repo root (`workspace/lecture-audio/`, the repo root per R1). `site/index.html` untouched.
- [x] **STOP GATE G0:** student approved (after Claude Code's scan, first commit and push to `uset82/INN514`, the student's Canner connection, and Claude's check of the Canner URL)
  - Evidence: the student wrote to Claude Code on 2026-10-23: "APPROVED GATE G0".
  - **Claude Code's G0 work (2026-10-23):**
    - **R1 and R2 reviewed:** both match the plan. In R1, Claude turned one README sentence fragment into a full sentence. In R2, `build_static.py` now fails if it finds no audio paths at all. The Canner copy passes all 35 page checks on its own (`checks/page-check-static-copy.log`).
    - **Scan of the 276 files git would add** (scratchpad `g0_scan.py`):
      - no PDFs, Office files, cache or screenshots; the largest file is 2.0 MB and the total is 167 MB;
      - no secrets or email addresses;
      - absolute paths only to tool locations and the planned hub paths.
    - **Paper 2 overlaps found and fixed:**
      - one Paper 2 check answer reproduced Latour's definition as the paper quotes it (page 9). It is reworded in `readings/P02.md`; the data was regenerated from cache, and the MP3s are byte-identical;
      - `check_reading.py` now scans check questions and answers for copied wording; tested on a scratch copy of the old text, which fails;
      - Claude's old review note in `PROGRESS_READINGS_ANTIGRAVITY.md` quoted three Paper 2 phrases and the Figure 1 labels; they are now described instead.
      - The rest are acceptable: the paper's own title and its "do not quote" notice, citations, the Figure 2 labels, and one generic 4-word phrase.
    - **Manifest:** `checks/grokbot-manifest-before.txt` was refreshed after these intended changes.
    - **Pushed:** `git init -b main`, then commit `772b254` "INN514 Course Companion: source, site and audio", pushed to public `uset82/INN514`. GitHub's tree has 276 files, the same as the local commit.
    - **Also fixed elsewhere:** the claude.ai link is republished as version 31 (it now matches the build apart from the wrapper, and the copied phrase is gone), and the knowledge pack in the private hub is refreshed as commit `1f4a6ed`.
    - **Canner check:** the student deployed `https://inn514.canner.app/` from `uset82/INN514` `main`. It serves our `index.html` (identical apart from line endings) and `robots.txt`.
      - In a browser: the front page, Classes (10 rows), Papers (20 rows), a class (7 chapters) and a paper (5 chapters, 12 page headings) all open; an MP3 plays from `site/audio/` (P14-01, no error); the robots meta is "noindex, nofollow"; there are no orb buttons; both fonts load; no console errors.
      - Canner sends MP3s as `application/octet-stream`. Chrome plays them; if iPhone Safari ever refuses, that is a Canner file-type setting.
      - Canner follows the device's light or dark setting, while claude.ai follows the Claude app's theme, so the two can look different.

## Part A and Part S: the speaking orb (claude.ai link and Canner) and the Canner Grokbot server
Updated by Claude Code on 2026-10-23: the orb now has a claude mode and a server mode, and Canner runs `server.js` (plan Part A and Part S).
- [x] A1. CSS: `.ask-btn`, `.ask`, chips, input, passcode row, status line, `.ask-text`, orb states, reduced motion (plan A.0, A.1)
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): added one CSS block, `/* ---------- ask the orb ---------- */`, at the end of the template stylesheet just before the global reduced-motion rule; no other section touched. Note: the plan was revised for Part S while this task was in progress; the orb spec (A.1) is unchanged, and the passcode row styles were added after re-reading the revised plan.
  - Command run from `D:/HVL2025/514`: `C:/Python313/python.exe workspace/lecture-audio/scripts/build_site.py`
    - First line: `index.html: 533 KB; ready lectures: T1, T2, T3, T4, T5, T6, T8, B1; ready readings: P01, P02, P03, P04, P05, P06, P07, P08, P14, P15, P16, P09, P10, P17, P11, P12, P13`
  - Checked: the built `site/index.html` contains the new rules (`ask-pass`/`ask-btn`/`orb-breathe`/`ask-text` present), and `site/template.html` contains none of the banned words.
  - Contents, per plan A.0/A.1: `.ask-btn` hidden unless `body.can-ask` (pill styled like `.listen`), the orb glow (`drop-shadow(0 0 6px color-mix(in srgb, var(--clay) 30%, transparent))` — the only glow), rim `stroke: var(--line); stroke-width: 1.5`, eyes `fill: var(--ink)`, orb sizes 20px in the button and 72px in the panel, the three exact plan states (`.orb.thinking` with `orb-breathe 2.4s`, `.orb.pulse` scale(1.06)/.12s, `.orb .eye.blink` scaleY(.1)), the `orb-breathe` keyframes (1 to 1.04), the panel `.ask` (inline, bordered, grid with the orb in column 1), the passcode row `.ask-pass` (label, short input, OK button), chips, input, Ask/Stop buttons, `.ask-text` in the prose serif, the honesty-line style, and a reduced-motion block removing all three orb states.
  - File changed: `site/template.html`.
- [x] A2. Orb SVG and its gradient definition, the per-chapter `.ask-btn` (hidden without `body.can-ask`), panel markup with the passcode row hidden (plan A.0, A.1)
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): four insertions in `site/template.html`, nothing else touched.
    - Hidden gradient SVG after `</style>`, at the top of the fragment: `<svg class="orb-defs" aria-hidden="true">` with `<radialGradient id="orbFill">` and two stops (`orb-stop-a` 0%, `orb-stop-b` 100%).
    - CSS in the ask block: `.orb-defs` (absolute, 0×0), stop colors `#FFFFFF`/`#F0EEE6` with dark variants `#F2F0E8`/`#C9C6BC` under both dark selectors (`@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) … }` and `:root[data-theme="dark"]`, mirroring the token pattern), and `.ask-pass[hidden] { display: none; }`.
    - `const ORB_SVG = …` next to `PLAY_SVG`: `viewBox="0 0 64 64"`, `class="orb"`, `aria-hidden="true"`, `<circle cx="32" cy="32" r="26" fill="url(#orbFill)">`, two `<rect class="eye" width="5" height="10" rx="2.5">` at x=23/y=26 and x=36/y=26 with `rotate(8 25.5 31)` and `rotate(-8 38.5 31)`.
    - In `renderLecture`'s chapter template, after the listen button: the `.ask-btn` (`${ORB_SVG}Ask about this chapter`, `data-i`), and the hidden `<section class="ask" data-i>` with the 72px orb, `<h3 class="ask-title">Ask about this chapter</h3>`, the `.ask-pass` row `hidden` (label "Enter the passcode to ask questions", password input with per-chapter id, OK button), the 4 chips ("Explain this simply", "Give me an example", "What could the exam ask?", "Key terms"), the `.ask-form` (placeholder "Or type your own question…", Ask button), `<p class="ask-status" aria-live="polite"></p>` and the claude-mode honesty line "Answers are written by AI from this chapter's text and read aloud by your device." (server mode swaps it in A6).
  - Command run from `D:/HVL2025/514`: `C:/Python313/python.exe workspace/lecture-audio/scripts/build_site.py`
    - First line: `index.html: 535 KB; ready lectures: T1, T2, T3, T4, T5, T6, T8, B1; ready readings: P01, P02, P03, P04, P05, P06, P07, P08, P14, P15, P16, P09, P10, P17, P11, P12, P13`
  - Checked: the built page contains `orbFill` (def + const), the button/panel markup in the render template, the passcode label, and none of the banned words; the inline script extracted from `site/index.html` passes `node --check` (a temporary `checks/js-syntax-tmp.js` was written for this check and deleted again).
  - File changed: `site/template.html`.
- [x] A3. `RULES` and `NO_QUOTE` on one line each, mode detection (`askMode`), `chapterContext`, chips and typed question, the claude-mode call with the answer shown as text for now (plan A.2)
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): one new `/* ---------- ask the orb ---------- */` section at the end of the script (between `route();` and `</script>`), plus one wiring line in `renderLecture`; nothing else touched.
    - `const RULES = "…"` and `const NO_QUOTE = "…"` verbatim from the plan, each on one line at column 0. Verified against `server.js`'s future S2 loading: `^const RULES = (".*");$` and `^const NO_QUOTE = (".*");$` both match the built page, and `JSON.parse` of the captured literals works (678 and 97 chars).
    - `const CHIPS` with the plan's four label/question pairs.
    - Mode detection IIFE verbatim from the plan: `askMode`/`sampleFn`, `window.claude?.use("sample")` → "claude", else `/api/health` (4 s timeout) → "server", then `document.body.classList.toggle("can-ask", !!askMode)`.
    - `chapterContext(id, i)` verbatim from the plan (all five helpers it calls — `entry`, `isReading`, `className`, `pagesText`, `slideText` — already exist with these names; `P02` gets `NO_QUOTE`).
    - Wiring in `renderLecture` (one line after the `.listen` wiring): `.ask-btn` click → `askToggle(id, i, panel)`. `askToggle` shows/hides the panel and, once, wires the four chips (`CHIPS[k][1]`), the Ask button and Enter on the input. `askSend` keeps the plan's call shape: `[{role:"user", content: chapterContext(id,i)}, ...history, {role:"user", content: question}]`, `sampleFn(turns, { modelTier: "default", signal: ctl.signal, onText, cache: isChip && st.first ? undefined : false })`, a new `AbortController` per question, `onText` accumulates the buffer and shows it in a created `p.ask-text` prefixed with the backup line "This device has no voice, so here is the answer as text.", status "Thinking…" while waiting. Errors stay silent until A5's table; history is kept per panel (the 6-turn cap is A5).
  - Command run from `D:/HVL2025/514`: `C:/Python313/python.exe workspace/lecture-audio/scripts/build_site.py`
    - First line: `index.html: 540 KB; ready lectures: T1, T2, T3, T4, T5, T6, T8, B1; ready readings: P01, P02, P03, P04, P05, P06, P07, P08, P14, P15, P16, P09, P10, P17, P11, P12, P13`
  - Checked: zero capitalised banned words in the template; the inline script passes `node --check` (temp `checks/js-syntax-tmp.js` written and deleted again).
  - **Flag for A7 / Claude Code:** the plan's code shape requires the internal values `askMode = "claude"` and comments "claude mode" (lowercase), but the existing `check_page.mjs` branding test is case-insensitive (`/claude|anthropic/i`) over the whole template, with a carve-out only for `<meta name="claude:…">`. As written, A7's run cannot pass with the plan's own code. A7 will need to narrow that check the same way (e.g. strip the ask block's mode strings or test visible text only) — the plan's A.3 says "every existing check stays", so this needs Claude Code's ruling. The capitalised brand names themselves are absent, per the kickoff's MUST NOT list; the plan's code-shape comment `the page's "ask Claude" function` was reworded to `the page's "ask" function` for that reason.
  - Files changed: `site/template.html`.
- [x] A4. Device voice: speech queue, sentence splitting, voices, language detection, Stop, pausing the player, text backup (plan A.2)
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): reworked the ask section in `site/template.html` (A3's text-only `askSend` replaced; nothing else touched).
    - `askLang(q, isChip)`: chips `"en-GB"`; a typed question is `"es-ES"` if it contains `¿ ¡ ñ á é í ó ú` or two or more of the plan's word list (word-boundary regex), else `"en-GB"`.
    - `pickVoice(lang)` / `voiceFor(lang)`: first voice whose `lang` matches, preferring names with "Natural"/"Neural"/"Google"/"Microsoft"; waits up to 1 s for `voiceschanged` when the list is empty; `rate` is 1.
    - Speech queue: `onText` appends to a buffer, splits on `/(?<=[.!?])\s+/`, complete sentences are spoken at once and the tail when the promise resolves. Each sentence is one `SpeechSynthesisUtterance` with `lang` and the picked voice; its `onstart` adds `.orb.pulse` for 150 ms.
    - Player: the first utterance start calls `audio.pause()` (the UI follows via its own `pause` listener); the orb never resumes it.
    - Text backup: shown (`p.ask-text` with the line "This device has no voice, so here is the answer as text.") only when there is no speech engine or no voice for the language; with a voice, text is not shown.
    - Stop: the status line gets a `Stop` button while busy ("Thinking…" / "Speaking…"); `stopAsk` does `ctl.abort(); speechSynthesis.cancel(); orbAudio.pause()` — `orbAudio` is declared `null` until A6 creates it, so the call is guarded.
  - Command run from `D:/HVL2025/514`: `C:/Python313/python.exe workspace/lecture-audio/scripts/build_site.py`
    - First line: `index.html: 543 KB; ready lectures: T1, T2, T3, T4, T5, T6, T8, B1; ready readings: P01, P02, P03, P04, P05, P06, P07, P08, P14, P15, P16, P09, P10, P17, P11, P12, P13`
  - Checked: the inline script passes `node --check`; the pure logic was tested from a temporary file (deleted after): chip → en-GB; "What is upward causation?" → en-GB; "¿Qué es…?" → es-ES; "el curso y la tesis" → es-ES; "el sistema" (one word) → en-GB; "First sentence. Second sentence." splits into spoken "First sentence." and tail "Second sentence."; a trailing-space buffer splits cleanly.
  - **Interpretation flagged for review:** "the first voice whose `lang` starts with that language" is implemented as the question language's primary subtag (`en-GB` → `en`, `es-ES` → `es`), because the plan's preferred names ("Natural", "Neural", "Google", "Microsoft") are mostly `en-US` voices and would never match a strict `en-GB` prefix. One line to change if Claude Code reads it strictly.
  - File changed: `site/template.html`.
- [x] A5. Error messages table, one panel at a time, follow-up history (6 turns), close and stop on route change (plan A.2)
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): extended the ask section in `site/template.html`; nothing else touched.
    - Error table in `askSend`'s catch, verbatim messages: the `not_granted`/`sampling_disabled`/`not_declared`/`capability_disabled`/`capability_removed` family removes `body.can-ask` (hiding every orb) and shows "Asking isn't available here."; `rate_limited` → "Too many questions right now. Try again in a minute."; `session_expired` → "Sign in again, then ask."; `refused` → "That question couldn't be answered. Try asking it another way."; `prompt_too_large`/`empty_completion` → "That was too much at once. Try a shorter question."; `cancelled` or an aborted signal → no message; `upstream_error` and anything else → "The answer was interrupted. Ask again." Whatever was already spoken is not cancelled. No automatic retries; the call happens only on a tap.
    - One panel at a time: module-level `openAsk`; `askToggle` closes the previously open panel (via `closeAsk`, which calls `stopAsk`, hides it and clears `panel._ask`) before opening the new one. A `document` click listener closes the open panel on a tap outside it (`.ask-btn` clicks are left to their own toggle); a `hashchange` listener closes and stops speech on a route change.
    - Follow-up history: after each exchange `st.hist = st.hist.slice(-6)` — at most the last 6 turns; the context turn is never part of it. Closing the panel (toggle, outside tap or route change) sets `panel._ask = null`, clearing the conversation.
    - Status staleness fix: the busy label moved from a closure variable onto `panel._ask.busy`, so `stopAsk` (Stop, another panel, a route change) resets it and the next question always rebuilds its "Thinking…"/Stop state.
  - Command run from `D:/HVL2025/514`: `C:/Python313/python.exe workspace/lecture-audio/scripts/build_site.py`
    - First line: `index.html: 545 KB; ready lectures: T1, T2, T3, T4, T5, T6, T8, B1; ready readings: P01, P02, P03, P04, P05, P06, P07, P08, P14, P15, P16, P09, P10, P17, P11, P12, P13`
  - Checked: the inline script passes `node --check` (temp file written and deleted); zero capitalised banned words in the template.
  - Files changed: `site/template.html`.
- [x] S1. `package.json`, hand-written `package-lock.json`, `server.js` static serving: allowlist, MIME types, Range, robots, health stub (plan S1)
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): three files created at the repo root, nothing else touched.
    - `package.json` and `package-lock.json` exactly as the plan dictates (lockfile written by hand, no `npm install`); both parse as JSON (`inn514-companion`, `main: server.js`, `engines: node >=18`, `lockfileVersion: 3`).
    - `server.js` (only `node:http`, `node:fs`, `node:path`; listens on `process.env.PORT || 3000`): GET-only allowlist — `/` and `/index.html` serve the root `index.html` as `text/html; charset=utf-8` with `Cache-Control: no-cache`; `/robots.txt` as `text/plain; charset=utf-8`; `/site/audio/<name>` where `<name>` matches `^[A-Z0-9]+-\d{2}\.mp3$` as `audio/mpeg` with `Accept-Ranges: bytes` and `Cache-Control: public, max-age=86400`, with `Range: bytes=a-b`/`bytes=a-` → `206` + `Content-Range: bytes a-b/size` and an out-of-bounds start → `416`; `/api/health` stub `{"ok": true, "ask": false}`. Everything else — including `/README.md`, `/scripts/…`, `/site/data/…` and any traversal shape — is `404` with the text "Not found". Every response carries `X-Content-Type-Options: nosniff`, and each request logs one line (method, path, status, milliseconds; no headers or bodies).
  - Checks (the plan runs `test_server.mjs` only from S4, so no server run yet): `node --check server.js` passes; both JSON files parse.
  - Choices made (plan is silent): paths are matched on the raw, undecoded URL (so `%2e%2e` and `..` never reach a file path); an unparseable or suffix (`bytes=-N`) Range is ignored and the whole file is served (RFC allows ignoring Range); a `416` has no body; a non-GET request is a 404; a matching audio name that is missing on disk is a 404.
  - Files changed: `package.json`, `package-lock.json`, `server.js`.
- [x] S2. `server.js`: data and RULES loading, passcode check, `/api/health`, `/api/ask` with model fallback (plan S2)
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): `server.js` extended (the S1 static serving unchanged); nothing else touched.
    - **Startup:** loads every `site/data/*.json` (25 files: T1–T6, T8, B1, P01–P17), the catalog facts from the root `index.html` with `/const DATA = (\{.*?\});\r?\n/s`, and `RULES`/`NO_QUOTE` from `site/template.html` with the plan's two regexes, `JSON.parse`d; a missing prompt line exits with an error (wrapped startup with `console.error` + `process.exit(1)`).
    - **`contextFor(id, i)`** reproduces the page's `chapterContext` from the server-side data: same where line (`className`, `pagesText`, `slideText` reimplemented exactly, including the en dash in slide ranges and "The whole paper"), same labels prefixing and `P02` rule.
    - **Passcode:** `X-Grokbot-Passcode` vs `GROKBOT_PASSCODE` via `crypto.timingSafeEqual` on SHA-256 digests; mismatch or missing → `401 {"error": "passcode"}`.
    - **Body:** over 16 KB → `413 {"error": "bad_request"}`; unparsable JSON → `400 {"error": "bad_request"}`.
    - **`/api/ask` field checks** (each failure `400 {"error": "bad_request"}`): `id` a loaded id; `chapter` an integer index into its chapters; `question` 1–500 chars; `history` an array of at most 6 `{role: "user"|"assistant", content: 1–1500}`.
    - **`/api/health`:** `{"ok": true, "ask": <both env vars set>, "voices": {"en": GROKBOT_VOICE_MODEL_EN default "deepgram/flux-tts:free", "es": GROKBOT_VOICE_MODEL_ES default "fish-audio/s2.1-pro-free:free"}}` — no secrets.
    - **The call:** `POST ${OPENROUTER_BASE}/chat/completions` (base defaults to `https://openrouter.ai/api/v1`) with the plan's four headers, `{model, messages: [context, ...history, question], max_tokens: 450, temperature: 0.3}`, 40 s `AbortSignal.timeout` each; models from `GROKBOT_ANSWER_MODELS` (default `google/gemma-4-31b-it:free,nvidia/nemotron-3-super-120b-a12b:free`), the next tried on a 429, a 5xx or a timeout; reply `{"text": choices[0].message.content.trim()}`; every model failing → `502 {"error": "upstream"}`, or `429 {"error": "rate_limited"}` when the last failure was a 429. The key is never logged or returned.
  - Checks (the plan runs `test_server.mjs` only from S4, so no server run yet): `node --check server.js` passes; a temporary mirror of the startup block and `contextFor` (deleted after) loaded 25 lectures and produced: T4/2 → "Class 4, chapter 3: Two models of the ecosystem. Nora Geirsdotter Bækkelund. Slides 11–13."; P14/0 → "Paper 14, chapter 1: The paper in brief. Bækkelund (2021). The whole paper."; "do not quote" present for P02 only. The plan's RULES/NO_QUOTE/DATA regexes verified in Node against the real files (JS `$` matches before `\r`, so the CRLF template is fine).
  - Choices made (plan is silent): a non-429, non-5xx upstream status stops the fallback immediately and returns 502; a 413 carries `{"error": "bad_request"}` (the error vocabulary allows only passcode/bad_request/rate_limited/upstream); all four ask fields are required; extra fields in history items are ignored and stripped before the upstream call.
  - Files changed: `server.js`.
- [x] S3. `server.js`: `/api/speak`, voice choice by language, English fallback to Fish, per-IP and daily limits (plan S3)
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): `server.js` extended (S1/S2 behaviour unchanged); nothing else touched.
    - **`POST /api/speak`:** passcode → limits → body (over 16 KB `413`, bad JSON `400`, `text` not a 1–1500-char string `400`, all `{"error": "bad_request"}`); `lang` "es-ES" or anything else counts as "en-GB". Success returns the bytes as `audio/mpeg`; failure `502 {"error": "upstream"}`.
    - **`speakUpstream(text, lang)`:** `POST ${OPENROUTER_BASE}/audio/speech` with the same auth headers and `{model, input: text, voice?, response_format: "mp3"}`, 40 s timeout. `es` → `GROKBOT_VOICE_MODEL_ES` (default `fish-audio/s2.1-pro-free:free`) with `GROKBOT_VOICE_ES` (unset by default, so `voice` is left out); `en` → `GROKBOT_VOICE_MODEL_EN` (default `deepgram/flux-tts:free`) with `GROKBOT_VOICE_EN` (default `flux-alexis-en`). Any non-200 or timeout on the English model → the Spanish model tried once with the same text; a failing Spanish attempt → `502`.
    - **Limits (in memory, reset on restart):** per IP (`X-Forwarded-For`'s first entry, else the socket address) at most `GROKBOT_RATE_PER_10MIN` (default 30) admitted API calls in any 10-minute sliding window; per UTC day at most `GROKBOT_ASKS_PER_DAY` (default 150) asks and `GROKBOT_SPEAKS_PER_DAY` (default 300) speaks; over a limit → `429 {"error": "rate_limited"}`. Both API routes check limits after the passcode.
  - Checks (the plan runs `test_server.mjs` only from S4, so no server run yet): `node --check server.js` passes; temporary mirrors of the limits and speak code (deleted after) verified with a stubbed fetch: 20 admitted under a cap of 20, the 21st from the same IP refused and another IP still admitted; the X-Forwarded-For first entry is the key; a daily speak cap of 3 blocks the 4th speak while asks stay independent; an English call goes to `deepgram/flux-tts:free` with `voice: "flux-alexis-en"` and `response_format: "mp3"`; a Spanish call goes to `fish-audio/s2.1-pro-free:free` with no `voice` key (and with `GROKBOT_VOICE_ES` set, that voice is sent); a failing English model produces a second call to Fish whose bytes are returned; a failing Spanish model is tried exactly once and gives `502`.
  - Choices made (plan is silent): only calls that pass the passcode and limit checks are counted (a 401 never burns quota); a non-numeric or non-positive env value falls back to the default; the audio response carries no extra cache headers.
  - Files changed: `server.js`.
- [x] S4. `scripts/mock_openrouter.mjs` and `scripts/test_server.mjs`; the run ends "ALL SERVER CHECKS PASSED" (plan S4)
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): both files were authored by Claude Code (reviewed by me against plan S4: mock with `/api/v1/chat/completions`, `/api/v1/audio/speech`, `/calls` with 200-char message previews plus the full first message for the context checks, `MOCK_FAIL=deepgram`; test with two phases — normal mock, then mock restart with the failure mode —, rate-window accounting that counts its own authenticated calls, and secret scans over server responses, headers and output). My part: refreshing the root copy and running the suite.
  - Command run from `D:/HVL2025/514`:
    - `C:/Python313/python.exe workspace/lecture-audio/scripts/build_static.py` (first, so the server reads a current root `index.html` at startup) → `index.html: 556 KB, 154 audio files under site/audio/`
    - `node workspace/lecture-audio/scripts/test_server.mjs`
  - Output: 37 lines PASS, 0 FAIL, ending:
    - `PASS the rate-limited call does not reach OpenRouter`
    - `PASS all spawned child processes stop cleanly`
    - `PASS every server response sets nosniff`
    - `PASS no response body or header leaks either test secret`
    - `PASS no server output line leaks either test secret`
    - `ALL SERVER CHECKS PASSED`
  - Covered, per plan S4: static allowlist (`/` html with robots meta, robots.txt, full MP3 and `bytes=0-99` → 206 with exactly the first 100 bytes, five blocked paths 404), health `ask: true`, 401 without/with a wrong passcode, T4 ask 200 with the rules opening + chapter title + right auth header, P02 "do not quote", four 400 validations, Spanish speak → Fish, English speak → Deepgram with `flux-alexis-en`, the Deepgram failure falling back to exactly one Fish call, the 21st authenticated call → 429 with no upstream hit, nosniff everywhere, and no secret in any response, header or server output line.
  - Files: `scripts/mock_openrouter.mjs`, `scripts/test_server.mjs` (both by Claude Code); the run refreshed the root `index.html` (via `build_static.py`).
- [x] A6. Server mode in the page: passcode row and storage, `askServer`, `/api/speak` playback in order, fallbacks, server honesty line (plan A.2)
  - Evidence (DeepSeek Harness assisting ZCode, 2026-10-23): `site/template.html` now keeps the passcode in `localStorage` as `inn514-grokbot-pass` with every read/write/remove in try/catch; the first question holds its pending request while the passcode row is shown; a 401 forgets the passcode and a later OK tap retries manually. `askServer(id, i, question)` posts the chapter, question and six-turn history with a new AbortController. The orb uses one separate Audio element for sequential `/api/speak` parts, falls back per part to the device voice, then shows the whole answer as text when neither voice works. Stop, route closing, the server honesty line and the six-turn cap are preserved. Only `test-pass` was used by the tests.
  - Command run from `D:/HVL2025/514`: `C:/Python313/python.exe workspace/lecture-audio/scripts/build_site.py`
    - First line: `index.html: 554 KB; ready lectures: T1, T2, T3, T4, T5, T6, T8, B1; ready readings: P01, P02, P03, P04, P05, P06, P07, P08, P14, P15, P16, P09, P10, P17, P11, P12, P13`
  - A7's real page-server/mock-upstream pass verified the initial passcode row, wrong-passcode message, successful manual retry, answer call, `/api/speak`, saved passcode, AI-voice honesty line, playback-or-text behaviour and phone layout.
  - File changed: `site/template.html`; generated `site/index.html` and the root `index.html` were refreshed with the planned build scripts.
- [x] A6b. Light/dark switch in the top bar: `#themeBtn` with moon and sun icons, saved as `inn514-theme`, following the device until chosen (plan A.4)
  - Evidence (DeepSeek Harness assisting ZCode, 2026-10-23): added the plan's `#themeBtn` immediately after `nav.mainnav`, the moon/sun SVGs, token-only styles and the `/* ---------- theme switch ---------- */` section before the first render. With no saved choice the page follows `prefers-color-scheme`; a choice sets `data-theme` and `localStorage["inn514-theme"]`; reload and device-change behaviour use the plan's names and labels.
  - A7 verified light → dark → reload → light, the body colour, icon state label, saved value, device-following without a choice, and the button bounds at 390 px: `inner: 390`, `scroll: 390`, button `left: 330`, `right: 374`. No phone-only brand-hiding rule was needed.
  - File changed: `site/template.html`; `build_site.py` passed with the first line recorded under A6.
- [x] A7. `check_page.mjs`: the claude mock pass, the server mode pass and the theme switch pass, `phone-ask.png`, `phone-ask-dark.png`, `phone-ask-server.png`, full run ending "ALL PAGE CHECKS PASSED", then `build_static.py` (plan A.3)
  - Evidence (DeepSeek Harness assisting ZCode, 2026-10-23): kept the existing checks and added normal-file orb hiding, class/paper mock visibility, one-panel behaviour, chip context and P02, no-voice text, persistent `not_granted`/`rate_limited` errors, theme persistence and phone fit, plus a real `server.js` pass using only `mock_openrouter.mjs` with `test-key`/`test-pass`. Both children are stopped in success and failure paths. The branding check now tests visible markup rather than the required internal mode names; visible branding is still rejected.
  - Two failures found in the first run were fixed: the theme phone check now installs the same viewport meta used by the existing phone checks, and stale asynchronous voice/sample callbacks can no longer erase or overwrite a newer question's status. The second full run exited 0.
  - Commands run from `D:/HVL2025/514`:
    - `node workspace/lecture-audio/scripts/check_page.mjs > workspace/lecture-audio/checks/page-check.log 2>&1`
    - Final log: **59 PASS, 0 FAIL**, ending `ALL PAGE CHECKS PASSED`; `no script errors` also PASS.
    - `C:/Python313/python.exe workspace/lecture-audio/scripts/build_static.py` → `index.html: 556 KB, 154 audio files under site/audio/`
    - The generated inline script also passed `new Function(...)` syntax validation.
  - Screenshots generated: `checks/phone-ask.png`, `checks/phone-ask-dark.png`, `checks/phone-ask-server.png`. Opening them was attempted, but this model's image reader reports no image-input capability, so visual review is **not claimed** and remains part of G1.
  - Manifest check: 212/212 protected lecture, reading, data and audio files still match; no course content changed.
  - Files changed: `scripts/check_page.mjs`, `site/template.html`; generated `site/index.html`, root `index.html`, `checks/page-check.log`, `checks/build-site.log` and the A7 screenshots.
- [ ] **STOP GATE G1:** student approved (after Claude Code's review, the claude.ai publish with the `sample` ability, the push, Canner on Node with the student's key and passcode set, Claude's server checks, and the student's phone tests in both places)
  - **Claude Code's G1 review (2026-10-23):**
    - **Who wrote what:** ZCode's report says Claude Code applied A6 and A6b. It did not: Claude made no edits to the page between Phase 0 and this review. The report itself says a second harness ("DeepSeek Harness assisting ZCode") did the later tasks.
    - **Content:** the manifest still matches (212 files). Claude reran `build_site.py`, `test_server.mjs`, `check_page.mjs` and `build_static.py`; all pass.
    - **Code read:** `server.js` (allowlist, Range, constant-time passcode compare, no secrets logged or returned, limits); the page's two modes, the passcode store and the theme switch; the package files (exactly as specified).
    - **A4 interpretation:** matching voices on the language's primary subtag ("en" rather than strictly "en-GB") is accepted; it is the right reading of the plan.
    - **Fixed by Claude:**
      1. **Passcode guessing:** it was unlimited, because the limits only counted calls with the right passcode. Now 10 failures in 10 minutes from one address lock that address (429) until the window passes (`GROKBOT_BAD_PASS_PER_10MIN`).
      2. **The visitor's address:** it now comes from the last `X-Forwarded-For` entry, the one Canner's proxy adds, not the first, which a client can fake. Four new server checks cover both fixes (41 in total).
      3. **The orb's eyes:** they slid diagonally into each other, because the CSS `transform-origin` (for the blink) changed the SVG `rotate`. Each tilt now sits on a wrapping `<g>`.
      4. **Eye colour:** the eyes vanished in dark mode, because `var(--ink)` is light there while the orb stays light. They are now always `#1F1E1D` (Claude's own spec error).
      5. **The blink** was missing: the CSS class existed but nothing set it. Added: every 5 s while a panel is open.
      6. **Phone layout:** a 48 px orb beside the title, and the chips and question box at full width below 520 px. The Ask button now lines up with Listen.
      7. **Taps elsewhere:** any tap outside the panel closed it and cut off the answer. Removed; only another chapter's panel or a route change closes it, as the spec says.
      8. **Server mode pause:** the second part's audio is now requested as soon as the first part's arrives, so there is no gap while it is made.
      9. **The text backup** shows its "no voice" line and the answer on separate lines.
      10. **`check_page.mjs` bug:** the phone ask pass navigated to the address the tab was already on, so the old panel stayed open, the pass's tap closed it, and the pass read leftover text. It now reloads first, and two new checks require the open panel to be in view before each ask screenshot (61 checks).
    - **Screenshots read** (all, light and dark): the claude and server panels on a phone, and the theme switch in the top bar.
    - **Scan:** no secrets and no email addresses in the 130 files to be published; the Paper 2 overlaps are the same acceptable ones as at G0.

## Part B: one-command pack sync
- [ ] B1. `scripts/sync_knowledge.py` (plan Part B)
- [ ] B2. Default run (no flags) reports "pack unchanged"
- [ ] **STOP GATE G2:** student approved

## Part C: Grokbot test kit (the watch)
- [ ] C1. `GROKBOT_TEST.md` and `checks/grokbot_tests.json`: 12 questions written from the pack files (plan Part C)
- [ ] C2. `scripts/check_outbox.py` (plan Part C)
- [ ] C3. Dry run on a scratch hub folder with 2 fake pairs: one PASS, one FAIL
- [ ] **STOP GATE G3:** student approved (after the real watch test and Claude Code's check of the answers)
