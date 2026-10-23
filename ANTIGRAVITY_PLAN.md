# INN514 Lecture Companion: plan for Antigravity

Approved by the student on 2026-10-16. Start each session with `KICKOFF_PROMPT.md`, and track progress in `PROGRESS.md`.

## Context

The student wants English summaries of each lecture that they can listen to and read on their phone. Claude Code built the pilot. The page is published privately at https://claude.ai/artifact/Nc3TALuXYR3W49sUshNs93, and Lecture 1 has 7 chapters, about 20 minutes of audio, read-along text and check-yourself questions. The student approved Lecture 1's style. Claude also wrote Lecture 2's text, which is not yet recorded. Antigravity now continues: it records Lecture 2, applies the "Fairway route" redesign, and writes and records Lectures 3, 4, 5, 6, 9 and the Bonus. The student reviews after Lecture 3 and after each later lecture. Claude Code does the publishing, so the link stays private.

### What exists (do not rebuild)

| Path (under `workspace/lecture-audio/`) | What it is |
|---|---|
| `lectures/T1.md` | Lecture 1, approved by the student. **The model to copy.** Do not edit it. |
| `lectures/T2.md` | Lecture 2, written by Claude, not yet recorded. Do not rewrite it. |
| `scripts/build_audio.py <T>` | Records each chapter with edge-tts (en-GB-RyanNeural, −8%), sets loudness to −20 LUFS, encodes 48 kbit/s mono, and checks decode, loudness and speaking rate. It writes `site/audio/<T>-NN.mp3` and `site/data/<T>.json`. **Do not change the voice settings.** |
| `scripts/build_site.py` | Embeds all lecture data into `site/template.html` and writes `site/index.html`. The `CATALOG` list holds the lectures in Kursplan order. |
| `scripts/check_page.mjs` | Headless Chrome check with raw CDP. Redirect its output to `checks/page-check.log`. |
| `scripts/find_in_paper.py`, `scripts/check_style.py`, `scripts/check_sources.py` | Helpers for verifying page numbers, checking style, and (since 2026-10-16) checking that every name, number, date, slide and page in a lecture comes from the sources. |
| `site/template.html` | The page, already in the **Fairway route design**, which Claude Code built and published on 2026-10-16 (version 3 of the private page). **Do not redesign it.** Change it only for a bug, and run `check_page.mjs` after any change. |

Run Python as `C:/Python313/python.exe` (not with `-I`). edge-tts sends the chapter text to Microsoft's online voice service; the student has approved this.

### Rules for every session
- **One phase per conversation.** Read this plan and `PROGRESS.md` first, then do the next unchecked phase.
- **Never use `/goal`** or any continuous mode. **Never tick a STOP box**: the student approves in chat with `APPROVED <gate>`.
- **Evidence is command output.** Under every ticked box, paste the command and the last lines it printed.
- **You write every lecture yourself, chapter by chapter.** No script may generate translations or prose.
  - Never use `workspace/study-site/build/translations/`. It is broken word-swap output.
- **Do not publish.** When a lecture is approved, tell the student to ask Claude Code to publish (see "Publishing").
- **Do not touch `workspace/study-site/`.** Its repair is paused.

### How to write a lecture (the method used for T1 and T2)
1. **Read every slide's text** in `workspace/study-site/build/clean/<deck>/slide-NNN.txt`. This is the raw Norwegian/English extraction, and it is reliable.
2. **Look at the slide image** for every slide with a chart, diagram or photo, and always for image-only slides: `workspace/study-site/dist/assets/slides/<deck>/slide-NNN.jpg`. Describe charts with the slide's own figures, and say "about" for values read off a chart.
3. **Verify every claim about a reading.** Run:
   ```
   C:/Python313/python.exe workspace/lecture-audio/scripts/find_in_paper.py P03 "guiding rules of interaction"
   ```
   It prints the PDF page and the printed page. In the text, say "on page N" with the **printed** page. If you cannot find a claim, leave it out.
4. **Write `lectures/<T>.md`** in the same format as T1:
   ```
   # Lecture N: <title>
   <!-- lecture: <T> | session: Kursplan 2026, session N (date) | lecturer: … | deck: <file> (H2025, NN slides) -->

   ## 1. <chapter title>
   <!-- slides: 1, 2, 3 -->
   <!-- readings: Author Year, pp. X, Y  (or: none new) -->
   <paragraphs of plain prose>

   <!-- check: question | answer -->
   ```
5. **Writing rules** (as in T1, which follows `easypaper/docs/PROMPT_TEMPLATE.md` §5):
   - **Size:** 6–8 chapters, about 2,200–2,800 words in total. Each chapter covers a run of slides in order, and every content slide belongs to one chapter.
   - **Plain English:** short sentences, explain each term the first time it appears, say *why*, and say each thing once.
   - **Attribution:** say who claims what ("the lecture says", "the authors argue on page 25"). Point out slide errors gently, as T1 does for Schlaile, which the slides date 2019 when the article is from 2017.
   - **Your own examples** are signposted: "Here is an example of our own, not from the lecture: …". They must contain no names, numbers or places that are absent from the course material.
   - **Paper 2** (Fløysand, Jakobsen & Hidle 2013) is marked "do not quote", so paraphrase it only.
   - **Exam tips** may quote only the real exam questions:
     - **Dec 2024:** Q1 asks what you understand by innovation system, sustainable transformation, "agency" and "institutions". Q2 asks how agency in innovation systems can promote or inhibit sustainable transformation. Q3 asks how technologies in innovation systems can promote or inhibit sustainable transformation.
     - **June 2025:** Q1 asks what you understand by a regional innovation system, institutional work and sustainability. Q2 asks in what way a regional innovation system can promote or inhibit industrial restructuring. Q3 asks how technological innovation systems can be guided to promote sustainable transformation.
   - **Class exercises** become an invitation to the listener. **Admin slides** (schedules, seminars) get one sentence or are skipped.
   - **Check questions:** 1–2 per chapter, answerable from that chapter.
6. **Check the style:** `check_style.py <T>` must print PASS. The thresholds are a mean sentence of 21 words or fewer, no sentence over 45 words, no more than 6 inflated words per 1000, no Norwegian words, and the structure above. T1 scores 11–16 words per sentence on average.
6b. **Check the sources:** `check_sources.py <T>` must print PASS. It fails on any name that appears nowhere in the course material, on any number or date that is not on this lecture's slides or on a page cited in a readings line, and on "page N" or "slide N" that doesn't match the chapter's readings or slides lines. A fact visible only inside a slide image is declared on its own line: `<!-- sourced: TOKEN | slide N, what the image shows -->`. Never declare anything else, and fix the text rather than the check.
7. **Record:** `build_audio.py <T>`. Every chapter must print `[OK]`.
8. **Build and check:** run `build_site.py`, then `node scripts/check_page.mjs > checks/page-check.log 2>&1`, and confirm `ALL PAGE CHECKS PASSED`.

### Lecture notes (all slides were checked on 2026-10-16)

| Lecture | Deck (`build/clean/…`) | Slides | Image-only | Readings, with the article's printed pages | Notes |
|---|---|---|---|---|---|
| **T2** | L2 | 44 | 28 | P03 14–28; P04 1–20; P05 323–346 | Text done. Only record it. |
| **T3** Institutional work in Hordaland and Rogaland (session 3, 25 Sep) | L5 | 34 | 2 | P03 14–28 | Go deeper than T2 chapter 8, which already gives the main result. Cover the forms of institutional work, institutional logics, regional key actors, legitimation versus delegitimation, and how the study was done. Lawrence & Suddaby appear on slides 15 and 31. |
| **T4** Entrepreneurial ecosystems (session 4, 28 Sep) | L3 (Nynorsk) | 24 | 4, 5, 15, 20 | P06 151–168; P07 809–832; P08 1097–1108 | Lecturer: Nora Geirsdotter Bækkelund. |
| **T5** Agency and changing innovation systems (session 5, 29 Sep) | L6 (Nynorsk) | 22 | none | P14 757–768; P15 277–300; P16 481–497 | Cases: wind power in Denmark versus the USA, the Flåm case, the Scania games industry. |
| **T6** Technological innovation systems (session 6, 20 Oct) | L4 (Nynorsk) | 43 | 4, 17, 25, 27, 29, 37, 42, 43 | P09 413–432; P10 1–16 | A guest lecture by Rune Njøs in H2025; Kursplan 2026 names Kelvin Ivankovic, so say so. It covers the 7 TIS functions, the Norwegian CCS case and the digital wallet case. |
| **T8** Summary and exam preparation (session 9, 2 Nov) | L8 | 43 | none (every slide has images) | P17 266–288 | Slide 43 is the real marking guide (spelled "Sensorveilending"). Make one chapter on how answers are marked, from slide 43 only, plus the exam format: school exam, no aids, Q1 plus Q2 or Q3, weighted equally. |
| **B1** Bonus: crowdfunding (H2025 only) | CF (English) | 50 | 6, 18, 31, 40, 41, 49, 50 | P11 1109–1133; P12 1–15; P13 47–63 | Lecturer: Alice Demattos Guimarães. Slides 2–4 are seminar admin. Say it is not in Kursplan 2026. |

### Phases

**Phase 0: Bootstrap (no gate)**
- Read this plan, `lectures/T1.md`, the scripts, and `easypaper/docs/PROMPT_TEMPLATE.md` §5.
- Run `check_style.py T1` and `check_style.py T2`. Both should PASS; paste the output.

**Phase 1: Record Lecture 2 (no gate)**
- Run `build_audio.py T2`, then `build_site.py`, then `check_page.mjs`. Paste the output.
- Tell the student that Lecture 2 can be published.

**Phase 2: Fairway redesign: DONE by Claude Code (2026-10-16).**
- `site/template.html` now follows the design spec below. `check_page.mjs` already has the extra checks and passed 14 of 14.
- The design is published to the student's private page. Do not rebuild it; only check that `check_page.mjs` still passes after you add a lecture.
- **STOP GATE A:** the student looks at the published page on their phone and approves the design (or asks Claude Code for changes).

**Phase 3: Lecture 3**, using the full method.
- **STOP GATE B:** the student listens to two chapters and reads one, then approves or sends fixes. Write any fix that changes the method into "Lessons" at the end of this file before continuing.

**Phases 4–8:** Lectures 4, 5, 6, 9 (T8) and the Bonus (B1), one per session, in that order.
- **STOP GATE C-<T>** after each one: the student listens to one chapter and approves.

**Phase 9: Final check**
- `check_style.py` passes for every lecture, and `check_page.mjs` passes.
- The total size of `site/audio` is reported.
- Tell the student it's ready to publish.

### Design spec: "Fairway route"

- **Subject:** the INN514 lecture companion.
- **Audience:** one HVL master's student, listening on a phone while walking or commuting and reading at a desk. English is not their first language.
- **Primary job:** listen to a lecture chapter by chapter, follow the text, and check understanding, in Kursplan order.

**Concept.** The course is a sailing route along the Western Norway coast, the region the course studies.
- Each lecture is a stop on one route line, and each chapter is a smaller stop inside a lecture. The line fills in as you finish chapters.
- **This line is the single bold element.** Everything else stays quiet.
- No ship drawings, no nautical puns in the text, no decoration.

**Design review.** I checked this design against the generic defaults and changed four things from today's page:
- Atkinson Hyperlegible, a safe UI typeface, becomes Familjen Grotesk.
- The all-caps eyebrows and "·"-joined meta lines are removed.
- The accent is limited to the route.
- The fjord-teal-only palette gains buoy yellow, taken from Norwegian coastal navigation marks, so it is specific to the place rather than a generic "calm app" teal.

**Color tokens** (light is the default; the dark values sit under the standard 3-block theme pattern):

| Token | Light | Dark | Use |
|---|---|---|---|
| `--mist` | #EEF3F1 | #0B1D22 | page background |
| `--chart` | #FFFFFF | #12292F | reading surface |
| `--sea` | #0E2A30 | #E7EFEE | ink and headings |
| `--muted` | #55676B | #93A7AA | secondary text |
| `--teal` | #1E6B6F | #6CC0BD | links, the unfilled route |
| `--buoy` | #F2C230 | #F2C230 | the filled route, current stop, play button (with `--sea`-dark text on it) |

**Type:**
- **Familjen Grotesk** (Google Fonts) for titles, controls and the route. Lecture titles are large, tight (line-height 1.05, tracking −0.01em) and part of the composition.
- **Literata** for the reading text: 18 px, line-height 1.7, at most 65 characters per line.
- **Scale:** 13 / 16 / 20 / 25 / 31 / 39 px. Labels are sentence case, never all caps. Use tabular numbers for times.

**Layout (phone first):**
```
ROUTE (#route, the home view)        LECTURE (#T1 … #B1)
INN514 Lecture Companion              ← All lectures
                                      Session 1, 21 September
│                                     Innovation as systemic and
●  1  Innovation as a system            sustainable transformation
┃     20 min, 60% listened            Arnt Fløysand. 20 min.
●  2  Regional innovation systems     [ Listen from the start ]
│     19 min                          │
○  3  Institutional work              ●  1 What this lecture is about  1:30
│     Coming soon                     ┃
…                                     ●  2 Innovation happens…        3:08
                                      ○  3 Norway's innovation…        3:10
                                      ── reading: chapter 1 (Literata) ──
┌ player, docked, safe-area padded ───────────────────────────┐
│ Chapter 3: Norway's innovation puzzle     [Follow] [1×]     │
│ 0:42 ━━━━●──────────────── 3:10                             │
│     ⏮    ↺15    ( ▶ buoy )    30↻    ⏭                      │
└─────────────────────────────────────────────────────────────┘
```
- On wide screens (860 px and up), the chapter route becomes a sticky left column beside the reading text.
- Everything is left-aligned. Numbering is used only because lectures and chapters really are a sequence.

**Behaviour:**
- **Navigation:** routes are plain hash tokens (`#route`, `#T1` … `#B1`). Nothing else may go in the hash.
- **Progress:** a chapter counts as done when 90% has been played. Save progress and the playback position in localStorage under `inn514-companion`, with every access wrapped in try/catch. Done chapters fill the route.
- **Kept from today's page:** the paragraph highlight with Follow, automatic next chapter, speed (1, 1.15, 1.3, 0.9), Media Session lock-screen controls, ±15/30 s, and resume.
- **Motion:** one moment only. The route segment fills over about 400 ms when a chapter ends, and there is none under `prefers-reduced-motion`.

**Rules for the page itself** (the claude.ai artifact contract):
- No `<html>`, `<head>` or `<body>` tags; keep `<title>INN514 Lecture Companion</title>` and `<meta name="claude:viewport-fit-sides" content="cover">` at the top.
- The side gutter is `max(16px, env(safe-area-inset-left/right))`, and the docked player adds `env(safe-area-inset-bottom)`.
- **Fonts and scripts:** fonts only from Google Fonts, no external scripts, data embedded by `build_site.py`, and audio as relative `audio/<T>-NN.mp3`.
- **Theming:** every color comes from tokens, `body` sets an explicit background, and keyboard focus is always visible.

**Avoid** (the design checks look for these):
- `text-transform: uppercase`
- "·"-joined meta strings
- "→" in buttons
- monospace labels
- identical shadowed cards for everything
- a cream or terracotta palette

**Extra checks in `check_page.mjs`:**
- The route shows 8 stops, with "ready" set from the data.
- `#T2` opens Lecture 2.
- After a chapter is forced to end, its route segment is filled and the progress is saved.
- No horizontal scroll at 390 px (inject the viewport meta as the current script does).
- Dark-mode screenshot.
- No script errors.
- `grep` of `template.html` finds no `uppercase` and no ` · `.

### Publishing (done by Claude Code, not Antigravity)
When a gate is approved, the student tells Claude Code:

> "Publish the lecture companion: run build_site.py and republish workspace/lecture-audio/site/index.html with the new audio files to https://claude.ai/artifact/Nc3TALuXYR3W49sUshNs93."

Claude sends only new or changed audio files, because files left out of a publish are kept. Each MP3 is about 1 MB, well under the per-file and per-publish limits.

### Lessons
(Antigravity adds method changes the student asks for at a gate, with the date.)
- 2026-10-16, Gate B: every fact, name, number and date must be in the slide text or found with find_in_paper.py. Report interview quotes as one person's statement. Keep a slide's questions as questions. Never invent co-authors.

