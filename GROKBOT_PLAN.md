# GROKBOT_PLAN: Grokbot for INN514

Written by Claude Code on 2026-10-23 from the plan the student approved. ZCode + GLM 5.3 Flash builds it; Claude Code reviews and publishes it. This file is the single spec: use its code shapes and copy word for word.
Prompt: `GROKBOT_KICKOFF.md`. Progress: `PROGRESS_GROKBOT_ZCODE.md`.

## Context: the main idea

You study INN514 with the **INN514 Course Companion** (version 30, the claude.ai link): 8 classes and 17 papers, as audio and text.

When something isn't clear, you want to **ask and hear the answer**, wherever you are:
- **on your wrist**, from Grokbot (the T-Watch-S3);
- **on the site**, from a speaking orb on every chapter.

Both helpers answer from the **same course text**, so they never invent material the course doesn't contain. The companion's source also goes into a **public GitHub repo** (`uset82/INN514`), and Canner serves a **static copy** of the site from it.

```
          INN514 companion source: D:/HVL2025/514/workspace/lecture-audio  ──git push──▶  github.com/uset82/INN514 (PUBLIC)
          lectures/*.md, readings/*.md → site/data/*.json                                         │ Canner deploys main
                │                                        │                                         ▼
  build_site.py │                                        │ export_knowledge.py (DONE)     <project>.app.canner.ca
                ▼                                        ▼                                  static copy, noindex,
  site/index.html  ──publish──▶ claude.ai link     grok-watch-hub/knowledge/inn514           orb hidden (no Claude there)
  build_static.py ──▶ index.html (Canner copy)        (private repo, commit 172bc14)
                                                        ▲ Grok Principal reads it
  claude.ai link: every chapter has the                 │
  speaking orb (PART A) ──▶ Claude (viewer's        WATCH: "Grok principal, ¿qué es… en la clase 4?"
  own account) ──▶ device voice speaks              → inbox → Grok Principal → outbox → the watch speaks
```

**Why the helpers differ by place:**
- **On the claude.ai link,** the page can ask Claude on the viewer's own account, so the orb works there.
- **On Canner,** the page has no Claude connection, so the orb hides itself. A Canner orb would need its own server holding an API key; you chose not to build that.
- **The site can't reach the watch,** and the watch's quick chat (Grok through OpenRouter) never sees the course. The watch's delegate mode does: it goes to Grok Principal, which reads the pack.

**What already works:**
- The knowledge pack is in `uset82/grok-watch-hub` (commit `172bc14`), with the "INN514 questions" rule in the hub's README.
- The watch already delegates when it hears "delega", "delegar", "pídele a", "dile a", "mis bots", "mi bot", "los bots", "grok principal", "grok hub", "hub de grok" or "al hub" (`muse_hub.c:464`), so no firmware change is needed.
- **Your one step, still open:** paste the routine line Claude gave you into Grok Principal's routine.

**This plan builds:**
- **R. The public repo and the Canner copy.**
- **A. The speaking orb** on the claude.ai link.
- **B. One-command sync** of the pack.
- **C. A test kit** for Grokbot on the watch.

**Your decisions (2026-10-23):**
- **The orb:**
  - a chatbot that only answers, by speaking, in the language of the question;
  - you ask by tapping a ready-made question or typing one, because the site can't use the microphone;
  - speech only, with text as a backup when the device has no voice;
  - a new orb design of your own, not xAI's Grok Bot orb.
- **The repo** `uset82/INN514` stays **public** and contains **only the companion** (`workspace/lecture-audio`).
- **Canner** hosts a **static copy**, and the orb works only on the claude.ai link.

**What a public repo means:** the summaries of all 17 papers and of the lecturers' slides become readable by anyone, and search engines can index them. These never go in:
- the PDFs, slides, `Kursplan`, `Pensum`, `teacherclassextracted/`, `easypaper/` or any other part of `D:/HVL2025/514`;
- the TTS cache.

**Not in scope:**
- watch firmware, because COM3 and the firmware belong to Antigravity's barge-in task;
- any change to a lecture, paper, audio or data file;
- a server or API key on Canner.

## Who does what

- **ZCode + GLM 5.3 Flash (executor):**
  - does one task per conversation, in order, from `PROGRESS_GROKBOT_ZCODE.md`;
  - stops at each gate.
  - GLM 5.3 Flash is fast but small, so every task is small and exact, with the code shape given. It must never improvise.
- **Claude Code:**
  - Phase 0 (the plan files, backups, manifest);
  - reviews at every gate and fixes;
  - does every outward step: `git init`, commit and push to GitHub, publishing on claude.ai (only Claude can declare the page's `sample` ability), and verifying the Canner URL.
- **You:**
  - connect the repo in the Canner dashboard (Claude can't sign in there);
  - approve gates G0 (repo and Canner), G1 (orb), G2 (sync) and G3 (Grokbot test) by writing "APPROVED GATE G<n>".

## Phase 0: Claude, on approval

1. Write the three files, copied from this plan:
   - `workspace/lecture-audio/GROKBOT_PLAN.md`: this plan;
   - `GROKBOT_KICKOFF.md`: the ZCode prompt;
   - `PROGRESS_GROKBOT_ZCODE.md`: tasks R1–R2, A1–A6, B1–B2 and C1–C3, plus gates G0–G3.
2. Back up `site/template.html` and `scripts/check_page.mjs` to the scratchpad as `*.before-grokbot`.
3. Write a sha256 manifest of `lectures/`, `readings/`, `site/data/`, `site/audio/`, `site/reviewed.json` and the content scripts to `checks/grokbot-manifest-before.txt`.

---

## Part R: the public repo and the Canner copy

**R1 (executor): three new files in `workspace/lecture-audio/`.**

- **`.gitignore`** (this folder is the repo root):
  ```
  cache/
  checks/*.png
  __pycache__/
  *.before-*
  .env
  .env.*
  *.key
  ```
- **`README.md`**, the repo's front page, in plain English:
  - **What this is:** an unofficial study companion for INN514, "Innovation systems and sustainable transformation". It explains every class and summarises every course paper page by page, as audio and text. It was prepared with AI help and checked against the slides and papers, and the lecturers have not reviewed it.
  - **What is not here:** the papers, the slides or any course file. The summaries are study notes. All rights in the papers stay with their authors and publishers, and in the slides with the lecturers. Paper 2 is a conference paper marked "do not quote", and it is never quoted here.
  - **Layout:** `lectures/`, `readings/`, `site/` (`template.html`, `data/`, `audio/`, `index.html`), `scripts/`, and the plan and progress files.
  - **Build:** `build_audio.py <id>`, `build_site.py`, `build_static.py`, `check_page.mjs` and `export_knowledge.py`, one line each on what it does. The checks that read the PDFs (`check_reading.py`, `check_sources.py`) need the course files, which are not in the repo.
  - **Deploy:** the claude.ai link is published by Claude Code; the Canner copy deploys the repo root on every push to `main`.
- **`robots.txt`:** `User-agent: *` / `Disallow: /`.

**R2 (executor): `scripts/build_static.py`, new.** It makes the Canner copy from the built claude.ai page without touching it.
1. Read `site/index.html`, the fragment `build_site.py` writes.
2. In its `const DATA = …` JSON, change every `"audio": "audio/` to `"audio": "site/audio/`, so the copy at the repo root finds the MP3s under `site/audio/`.
3. Write `index.html` at the repo root:
   - the start, in this order: `<!doctype html>`, `<html lang="en"><head><meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `<meta name="robots" content="noindex, nofollow">`;
   - then the fragment; the browser moves its `<title>`, `<link>` and `<style>` into the right place;
   - then `</html>`.
4. **Check before writing**, and print FAIL and stop if any check fails:
   - every audio path in the new DATA exists on disk;
   - the doctype and the robots meta are present;
   - the text "unofficial study aid" is absent (the student removed it from the front page).
5. **Print** "index.html: <KB>, <n> audio files under site/audio/".

**Gate G0 (Claude, then you):**

1. **Claude scans** every file `git add` would include. Each scan must come back clean:
   - no file over 50 MB, and no `.pdf`, `.pptx` or `.docx`;
   - no secrets (`sk-or-v1`, `sk-`, `mgst_`, `ghp_`, `github_pat_`, `api_key`, `Bearer `);
   - no quotation from Paper 2: any quoted text in a `.md` file that is attributed to Fløysand, Jakobsen & Hidle (2013) or Paper 2 gets fixed or removed first;
   - no absolute paths to the student's other private projects, beyond the names already in the docs.
2. **Claude creates the repo locally:** `git init -b main` in `workspace/lecture-audio`, then `git remote add origin https://github.com/uset82/INN514.git`.
3. **First commit:** "INN514 Course Companion: source, site and audio", ending with the co-author line.
4. **Push:** `git push -u origin main` (about 170 MB; every file is under 2.1 MB). Claude then checks on GitHub that the file count matches the local commit.
5. **You, in the Canner dashboard:** create a project from GitHub `uset82/INN514` (branch `main`) as a **static site**, with no framework, no build command, and root or output directory `/`.
   - If Canner asks for a framework, choose "static" or "HTML".
   - If it refuses ~165 MB of audio, stop and tell Claude.
6. **Claude checks** `https://<project>.app.canner.ca/`:
   - the page loads, and the front page, Classes, Papers, a class and a paper all open;
   - an MP3 plays (fetch `site/audio/T1-01.mp3`: status 200, `audio/mpeg`, same size as the local file);
   - the orb is hidden, and the page source has the robots meta.
7. **You approve G0.**

**After G0:** every later change (the orb, content fixes) ends with Claude running `build_site.py`, then `build_static.py`, then a commit and push. Canner redeploys by itself, and Claude republishes the claude.ai link.

---

## Part A: the speaking orb (in `site/template.html`; works on the claude.ai link)

### A.0 What you see

- **The button:** every chapter, on class pages and paper pages, gets a second pill button next to "Listen to this chapter": a small orb icon and **"Ask about this chapter"**. It stays hidden until the page knows it can ask. It is absent on Canner, on a local file, for a viewer without Claude, and after a decline.
- **The panel:** tapping the button opens an inline panel under it (`section.ask`), not a pop-up:

```
  ( orb 72px )   Ask about this chapter
                 [Explain this simply] [Give me an example]
                 [What could the exam ask?] [Key terms]
                 [ Or type your own question…            ] (Ask)
                 Thinking…  /  Speaking…  (Stop)            ← status line, aria-live
                 Answers are written by AI from this chapter's text and read aloud by your device.
```

- **Panel rules:**
  - Only one panel is open at a time. Opening another one, or leaving the page, stops speech and closes the first.
  - When the orb starts speaking, it pauses the lecture player, so two voices never overlap. It does not resume the player on its own.
  - Follow-up questions keep the chapter's short conversation (the last 6 turns) while the panel stays open. Closing the panel clears it.
  - **Text only as a backup:** when the device has no speech engine, or no voice for the language, the answer appears as text (`p.ask-text`) with the line "This device has no voice, so here is the answer as text."
- **The orb's states:**
  - idle: resting, with a slow blink every ~5 s while the panel is open;
  - thinking: slow breathing, scale 1 to 1.04 over 2.4 s;
  - speaking: a pulse as each sentence starts;
  - done: back to idle;
  - error: one line of text.
  - Under `prefers-reduced-motion` there is no animation; the status line carries the state.
- **No branding:** the template never contains "Claude", "Anthropic" or "xAI", and `check_page.mjs` already tests for this. The honesty line says "AI". The consent dialog the platform shows names Claude itself.

### A.1 The orb (a new design of your own; tokens only)

- **Shape:** an inline SVG, `viewBox="0 0 64 64"`, `class="orb"`, `aria-hidden="true"`.
  - **Body:** `<circle cx="32" cy="32" r="26">` filled with `radialGradient#orbFill`. Light: `#FFFFFF` at 0% to `#F0EEE6` at 100%. Dark: `#F2F0E8` to `#C9C6BC`. Define the gradient once in a hidden `<svg>` and reference it.
  - **Rim:** `stroke: var(--line); stroke-width: 1.5`.
  - **Glow** (the only glow on the site): `filter: drop-shadow(0 0 6px color-mix(in srgb, var(--clay) 30%, transparent))`.
  - **Eyes:** two `<rect class="eye" width="5" height="10" rx="2.5">` filled with `var(--ink)`, at x=23/y=26 and x=36/y=26, each tilted 8° towards the middle: `rotate(8 25.5 31)` and `rotate(-8 38.5 31)`. No mouth.
- **Sizes:** 20px inside the button, 72px in the panel.
- **CSS states:**
  - `.orb.thinking { animation: orb-breathe 2.4s ease-in-out infinite; }`
  - `.orb.pulse { transform: scale(1.06); transition: transform .12s; }` (added for 150 ms at each sentence)
  - `.orb .eye.blink { transform: scaleY(.1); }` (120 ms)
  - `@media (prefers-reduced-motion: reduce)` removes all three.

### A.2 How it asks and speaks (code shape for GLM; keep these names)

```js
/* ---------- ask the orb ---------- */
let sampleFn = null;                 // the page's "ask Claude" function, or null (always null on Canner)
(async () => {                       // never blocks the first render
  try { sampleFn = (await window.claude?.use?.("sample")) || null; } catch (e) { sampleFn = null; }
  document.body.classList.toggle("can-ask", !!sampleFn);   // CSS shows .ask-btn only under .can-ask
})();

const CHIPS = [
  ["Explain this simply", "Explain this chapter simply, as if to a first-year student."],
  ["Give me an example", "Give me one concrete example that makes this chapter's main idea clear, preferably one from the chapter."],
  ["What could the exam ask?", "What exam question could this chapter help answer, and how would a good answer start?"],
  ["Key terms", "What are the key terms in this chapter, and what does each one mean?"],
];

function chapterContext(id, i) {     // instructions + this chapter only (a few thousand characters)
  const c = entry(id), ch = DATA.lectures[id].chapters[i], reading = isReading(id);
  const where = reading ? `${className(c)}, chapter ${ch.n}: ${ch.title}. ${c.authors} (${c.year}). ${pagesText(ch.pages)}.`
                        : `${className(c)}, chapter ${ch.n}: ${ch.title}. ${c.teacher}. ${slideText(ch.slides)}.`;
  const body = ch.paragraphs.map((p, k) => (ch.labels && ch.labels[k] ? ch.labels[k] + ": " : "") + p).join("\n\n");
  return RULES + (id === "P02" ? NO_QUOTE : "") + "\n\nChapter: " + where + "\n---\n" + body + "\n---";
}
```

**`RULES`** (verbatim):

> You are a study helper for the master's course INN514, "Innovation systems and sustainable transformation". Answer the student's question about one chapter of the course companion, using only the chapter text below. Your answer will be read aloud by a speech engine, so write plain spoken sentences: no lists, no headings, no symbols, no brackets. Use 3 to 6 sentences unless the student asks for more. Answer in the language of the student's question. Say where it comes from, using the slide or page numbers in the chapter, in words ("on page 764"). If the chapter does not answer the question, say so in one sentence. Never invent authors, numbers, dates or quotations.

**`NO_QUOTE`** (Paper 2 only):

> This paper is marked "paper in preparation, do not quote": paraphrase it and never quote it.

**Asking:**
- **Turns:** `turns = [{role:"user", content: chapterContext(id,i)}, ...history, {role:"user", content: question}]`. Consecutive user turns are allowed. Keep at most the last 6 history turns, and never drop the context turn.
- **The call:** `sampleFn(turns, { modelTier: "default", signal: ctl.signal, onText, cache: isFirstChip ? undefined : false })`.
- **Speaking sentence by sentence:** `onText({delta})` appends to a buffer. Every complete sentence (split on `/(?<=[.!?])\s+/`) goes into the speech queue at once, and the rest is spoken when the promise resolves.
- **Speech:**
  - Each sentence is one `SpeechSynthesisUtterance` with `lang` set to the question's language.
  - The voice is the first in `speechSynthesis.getVoices()` whose `lang` starts with that language. Prefer names containing "Natural", "Neural", "Google" or "Microsoft".
  - `rate` is 1.
  - Wait up to 1 s for `voiceschanged` when the list is empty. If there is still no voice, use the text backup.
- **Language:**
  - A chip question is English, so `"en-GB"`.
  - A typed question is `"es-ES"` if it contains `¿ ¡ ñ á é í ó ú` or two or more of these words: qué, cómo, por, porque, el, la, los, las, es, de, del, una. Otherwise `"en-GB"`.
- **Stop:** `ctl.abort(); speechSynthesis.cancel();` A new `AbortController` for every question.

**Error messages (verbatim), by error code:**

| Code | Behaviour and message |
|---|---|
| `not_granted`, `sampling_disabled`, `not_declared`, `capability_disabled`, `capability_removed` | Remove `.can-ask` (hide every orb on the page). Status: "Asking isn't available here." |
| `rate_limited` | "Too many questions right now. Try again in a minute." |
| `session_expired` | "Sign in again, then ask." |
| `refused` | "That question couldn't be answered. Try asking it another way." |
| `prompt_too_large`, `empty_completion` | "That was too much at once. Try a shorter question." |
| `cancelled` | No message. |
| `upstream_error` and anything else | "The answer was interrupted. Ask again." Whatever was already spoken stays spoken. |

- Never retry automatically, and never call from a loop or a timer. Calls happen only when the viewer taps.

**What stays unchanged in `template.html`:**
- the player logic and the `DATA` line;
- `linkReadings` and the page-link logic;
- the localStorage key and progress shape;
- every class and selector the existing checks use.

The only addition to `renderLecture` is the button and panel markup per chapter, plus their click wiring.

### A.3 Tests (`scripts/check_page.mjs`; every existing check stays)

1. **Normal load:** a load without `window.claude` shows no `.ask-btn`. This is also what Canner shows.
2. **Mocked load:** a second load with a mock injected before the page scripts (CDP `Page.addScriptToEvaluateOnNewDocument`). The mock's `window.claude.use("sample")` returns an async function that:
   - records the last input in `window.__lastSample`;
   - calls `onText` with "First sentence. Second sentence.";
   - resolves.

   Its error behaviour is switched with `window.__sampleMode = "ok" | "not_granted" | "rate_limited"`.
3. **Checks on the mocked load:**
   - every chapter on a class page and on a paper page has a visible `.ask-btn`;
   - a tap opens one `section.ask` with 4 chips and an input;
   - a second tap elsewhere closes the first panel;
   - a chip sends turns whose first turn contains the chapter title and the RULES' first words, and whose last turn is the chip's question;
   - on `#P02` the first turn contains "do not quote";
   - headless Chrome has no voices, so `p.ask-text` shows "First sentence. Second sentence." together with the backup line;
   - in `not_granted` mode, all `.ask-btn` are hidden and the status reads "Asking isn't available here.";
   - in `rate_limited` mode, the panel stays open with the rate message;
   - at 390 px, with the panel open, there is no horizontal scroll;
   - screenshots: `phone-ask.png` and `phone-ask-dark.png`.

### A.4 Publish (Claude, at gate G1)

1. **The claude.ai link:** publish with `capabilities: {sample: {}}`. That is the first time this page declares an ability; republishing later without `capabilities` keeps it.
2. **The repo and Canner:** `build_static.py`, then commit and push. Canner redeploys, and its copy keeps the orb hidden.
3. **Your phone test, on the claude.ai link:**
   - the consent prompt appears on the first question;
   - a chip gives a spoken answer;
   - Stop works;
   - a Spanish typed question gets a Spanish answer.

---

## Part B: one-command pack sync (`scripts/sync_knowledge.py`, new)

```
C:/Python313/python.exe workspace/lecture-audio/scripts/sync_knowledge.py            # export + show what changed, no git writes
C:/Python313/python.exe workspace/lecture-audio/scripts/sync_knowledge.py --commit   # + pull --rebase, commit
C:/Python313/python.exe workspace/lecture-audio/scripts/sync_knowledge.py --push     # + push (implies --commit)
```

1. The hub path is `D:/Proyectos/watch/grok-watch-hub`, which `--hub <path>` overrides. Check that it is a git repo on `main`, and that nothing outside `knowledge/` has local changes; if something does, stop and say which files.
2. With `--commit` or `--push`: `git pull --rebase --quiet origin main` first. The repo gets constant inbox and outbox commits.
3. Export by importing `export_knowledge.main(Path(hub) / "knowledge/inn514")`. Reuse it; never copy its code.
4. Print `git status --short -- knowledge/inn514`. If nothing changed: "pack unchanged", and stop.
5. Commit only `knowledge/inn514/` with the message `knowledge: refresh the INN514 pack (YYYY-MM-DD)`.
6. Push with a plain `git push origin main`. If it is rejected, run `pull --rebase` once and push again; if that fails too, stop with the git message. Never force-push.
7. Never print tokens or remote URLs that contain credentials.

The executor runs only the default mode (no flags). Claude runs `--push` at review.

---

## Part C: Grokbot test kit (Grokbot on the watch)

- **C1. `GROKBOT_TEST.md` and `checks/grokbot_tests.json`:** 12 questions, written from the pack files only.
  - **The mix:**
    - 4 class questions;
    - 5 paper questions, one of them a page question such as "página 764";
    - 1 Paper 2 question (the answer must paraphrase it);
    - 1 Paper 4 question (it belongs to 3 classes);
    - 1 out-of-scope question.
  - **Each question has:**
    - the Spanish sentence to say, starting with "Grok principal," so the watch delegates;
    - the expected source, `{"class": "4", "chapter": 3}` or `{"paper": 14, "page": 764}`;
    - 2 or 3 short facts copied word for word from the pack;
    - for the out-of-scope question, `"expect_not_covered": true`.
- **C2. `scripts/check_outbox.py`:** read-only.
  - `--pull` runs `git pull` in the hub first (only Claude and you use it).
  - `--ids a1b2c3 …` or `--since 20261024T0900Z` picks the replies to check; `--hub <path>` points it at another folder.
  - For each reply in `outbox/<id>.json`, it matches the question through `inbox/*-<id>.json`'s `text` against `grokbot_tests.json`, then checks:
    - `status == "done"`;
    - `speak` names the expected source ("clase 4" plus "capítulo 3", or "paper 14" plus "764");
    - it is in Spanish (two or more Spanish stopwords);
    - it is 8 sentences or fewer;
    - the out-of-scope case contains "no cubre", "no aparece", "no trata" or "no está".
  - It prints PASS or FAIL per check and the spoken text, so a person can judge the facts.
- **C3. Dry run:**
  - make a scratch hub folder with 2 fake `inbox` and `outbox` pairs (one right, one wrong);
  - run `check_outbox.py --hub <scratch>`;
  - paste the output: one PASS and one FAIL.
- **The real test at G3:**
  - You say the 12 questions to the watch. Claude can instead use `D:/Proyectos/watch/hub_say.py "<text>"`, but only when COM3 is free.
  - Then Claude runs `check_outbox.py --pull --since <start>` and checks each answer's facts against the pack.

---

## Rules for ZCode + GLM 5.3 Flash (put verbatim in the kickoff)

- **Work only in** `D:/HVL2025/514/workspace/lecture-audio/`.
- **May edit:** `site/template.html` and `scripts/check_page.mjs`.
- **May create:** `.gitignore`, `README.md`, `robots.txt`, `scripts/build_static.py`, `scripts/sync_knowledge.py`, `scripts/check_outbox.py`, `GROKBOT_TEST.md` and `checks/grokbot_tests.json`.
- **May tick:** `PROGRESS_GROKBOT_ZCODE.md`.
- **May run**, from `D:/HVL2025/514`:
  - `build_site.py` and `build_static.py`;
  - `node workspace/lecture-audio/scripts/check_page.mjs > workspace/lecture-audio/checks/page-check.log 2>&1`;
  - `sync_knowledge.py` with **no flags**;
  - `check_outbox.py` with `--hub <scratch folder>`;
  - `export_knowledge.py` into a scratch folder.
- **Must not:**
  - run any git command in any repo: no `init`, `add`, `commit`, `push` or `remote` (Claude does these at G0 and after);
  - touch `D:/Proyectos/watch` at all (no COM3, no firmware), apart from reading `grok-watch-hub/knowledge/` and `inbox/` and `outbox/`;
  - publish anything, sign in to Canner, or run `sync_knowledge.py --commit` or `--push`;
  - edit `lectures/`, `readings/`, `site/data/`, `site/audio/`, `cache/`, `site/reviewed.json`, `build_site.py`, `export_knowledge.py` or any other script;
  - add dependencies (no npm, no pip) or load scripts from the web;
  - write "Claude", "Anthropic" or "xAI" in the template;
  - use all caps, " · " joins, "→" in link text, or card shadows (the orb's glow is the only exception);
  - invent wording: use this plan's copy word for word, and list any line you had to add in the report.
- **Working method:**
  - One task per conversation.
  - Read only the section you change. Never re-read the whole template again and again.
  - After every template task, run `build_site.py`.
  - After A6, run `check_page.mjs` and look at every new screenshot.
  - Tick a box only with its evidence pasted under it, then stop.
  - At a gate, write "STOP GATE G<n>: ask Claude Code to review and publish." and stop.

**Tasks (one box each), in this order:**

| Task | What it is |
|---|---|
| R1 | `.gitignore`, repo `README.md`, `robots.txt` |
| R2 | `scripts/build_static.py`, then run it: all checks PASS, root `index.html` written |
| G0 | **STOP GATE G0** (Claude scans, pushes and checks Canner; you connect Canner) |
| A1 | CSS: `.ask-btn`, `.ask`, chips, input, status, `.ask-text`, orb states, reduced motion |
| A2 | Orb SVG + gradient definition, per-chapter `.ask-btn` (hidden without `.can-ask`), panel markup |
| A3 | Availability (`sampleFn`), `chapterContext`, chips and typed question, the call, with the text shown before speech exists |
| A4 | Speech queue, sentence splitting, voices, language detection, Stop, player pause, text backup |
| A5 | Error copy table, one panel at a time, follow-up history (6 turns), close on route change |
| A6 | `check_page.mjs`: the mock pass and the A.3 checks, screenshots, full run (ALL PAGE CHECKS PASSED), then `build_static.py` |
| G1 | **STOP GATE G1** |
| B1 | `sync_knowledge.py` |
| B2 | Its default run, which must report "pack unchanged" |
| G2 | **STOP GATE G2** |
| C1 | Test questions |
| C2 | `check_outbox.py` |
| C3 | Dry run with fake files |
| G3 | **STOP GATE G3** (you do the real watch test) |

## Verification (Claude, at each gate)

- **G0:**
  - the scan is clean (no PDFs or Office files, no secrets, no Paper 2 quotations), and the push matches the local commit;
  - the Canner URL serves all five views and an MP3 (200, same size), has the robots meta, and hides the orb.
- **G1:**
  - the manifest still matches (`sha256sum -c`), and `build_site.py`, `check_page.mjs` and `build_static.py` pass;
  - read every screenshot (light and dark, phone and desktop);
  - read the code: no network calls, the prompt and the Paper 2 rule are as specified, a new controller per call, no retry loops, `speechSynthesis.cancel()` on Stop and on route change;
  - publish the claude.ai link with `capabilities: {sample: {}}`; check that the live page equals the build apart from the wrapper and that all 154 MP3s are unchanged;
  - push for Canner;
  - you test on your phone, then approve G1.
- **G2:**
  - `sync_knowledge.py` (no flags) prints "pack unchanged";
  - after the next real content change, `--push`, and a GitHub check that the hub repo is still private.
- **G3:**
  - the 12 watch questions, then `check_outbox.py --pull --since <start>`, all PASS;
  - Claude checks the spoken answers' facts against the pack;
  - you approve G3.
