# INN514 Part E: worked exam answers as audio lessons (plan for Cursor + Grok)

Written by Claude Code and approved by the student on 2026-11-01. This file is the spec for Part E. The executor may only add to section 11 (Lessons).

## Context

ZCode has finished the cheatsheet plan, and all of it is live on https://inn514.canner.app/#revision. That covers 17 cards, 8 themes, the exam-day page and the 11-page PDF, plus the ten lessons R01–R10. The progress file shows every gate up to G13 ticked and `LIVE OK R01–R10`.

The student has now added two model answer documents at the repo root:
- `INN514_2024_Model_Exam_Resolution.pdf` (15 pp.) answers the 4 December 2024 exam, Questions 1–3.
- `INN514_Exam_Resolution_HVL.pdf` (14 pp.) answers the 13 June 2025 exam, Questions 1–3.

The student wants the revision material to be "even more pedagogical", with the audio on the companion site so they can listen many times. **Cursor (Agent mode) with a Grok model** will run the plan on autopilot, review its own work and push. It works the way ZCode did: there are no feedback rounds.

**What these two PDFs are:**
- Both say they are study documents, "not an official marking guide".
- Their reference lists say "Retrieved November 1, 2026", so they are new.
- Most of their claims match the course papers. A read-only check already confirmed several:
  - Sleipner and Snøhvit are in P10 p. 4;
  - "organizationally thick and diversified" and "organizationally thick and specialized" are in P03 pp. 19–20;
  - Vestland is in P03 p. 15;
  - "individual strategic leadership" is in P03 p. 22.
- Some claims go beyond the course material:
  - the Brundtland/WCED 1987 definition;
  - the "rebound effect";
  - path extension, upgrading, diversification and creation, given with no source;
  - HVL web pages.
  - None of these terms appears in any lecture, card or theme file.
- So the PDFs are used **as models of structure**, and every fact in them is first audited against the course pages.

**Outcome:** six new audio lessons, R11–R16, one worked answer per past exam question, on the site's Revision page under a "Worked exam answers" heading. They come with a claim-by-claim audit of the two PDFs, and a one-page "Answer plans" sheet added to the cheatsheet PDF.

A lesson teaches the *moves* of a strong answer:
- decode the question;
- plan;
- introduction;
- theory;
- promote and inhibit;
- the Norway case;
- discussion and conclusion;
- traps;
- build it yourself.

It does not give a script to memorise, because the exam tests answers for plagiarism.

## 1. Who does what, and the rules that still hold
- **Cursor + Grok** does every box in `PROGRESS_ANSWERS.md`, in order. It works on **autopilot**:
  - it reviews its own work at each STOP GATE (section 8), commits, pushes and goes on;
  - it never waits for the student;
  - it stops only at a HARD STOP (in the kickoff).
- **Only one agent works at a time.** Cursor and Grok are one executor here; they never run two sessions on these files at once.
- **CHEATSHEET_PLAN.md still holds, as written,** for:
  - the sources: §2 (read these, never those) and §3 (course map, exam questions);
  - the writing rules: §5.1, §5.2 and §5.3 (writing for the ear);
  - the listen format: §4.8;
  - the site rules: §7.8;
  - the git steps: §9;
  - the commands: §10.

  This file adds to those sections and overrides them only where it says so. Do not edit CHEATSHEET_PLAN.md, except to add dated notes to its §11. Read the notes already there first.
- **The model answer PDFs** stay at `D:/HVL2025/514/`, outside the git repo. Never copy them, or text dumps of them, into `workspace/lecture-audio/`. Read them only through `check_cheatsheet.py --model-text` (6.1).
- **The model answers are not evidence.** A fact is used only once a course page or slide confirms it (the audit, 4.1).

## 2. The six lessons

| Id | Title (exactly) | When line | Question | Kind | Voices: its only sources |
|---|---|---|---|---|---|
| R11 | Worked answer: innovation system, sustainable transformation, agency and institutions | December 2024 exam, Question 1 | Dec 2024 Q1 | concept | front/EXAM_DAY.md, answers/AUDIT_DEC2024.md, themes/TH1.md, themes/TH3.md, themes/TH5.md, themes/TH7.md, cards/P01.md, cards/P03.md, cards/P04.md, cards/P09.md, cards/P14.md, cards/P15.md |
| R12 | Worked answer: how agency can promote or inhibit sustainable transformation | December 2024 exam, Question 2 | Dec 2024 Q2 | essay | front/EXAM_DAY.md, answers/AUDIT_DEC2024.md, themes/TH5.md, themes/TH3.md, cards/P14.md, cards/P15.md, cards/P16.md, cards/P17.md, cards/P03.md, cards/P04.md |
| R13 | Worked answer: how technologies can promote or inhibit sustainable transformation | December 2024 exam, Question 3 | Dec 2024 Q3 | essay | front/EXAM_DAY.md, answers/AUDIT_DEC2024.md, themes/TH6.md, themes/TH7.md, cards/P09.md, cards/P10.md, cards/P17.md, cards/P04.md, cards/P01.md |
| R14 | Worked answer: regional innovation system, institutional work and sustainability | June 2025 exam, Question 1 | Jun 2025 Q1 | concept | front/EXAM_DAY.md, answers/AUDIT_JUN2025.md, themes/TH2.md, themes/TH3.md, themes/TH7.md, cards/P03.md, cards/P05.md, cards/P04.md, cards/P01.md |
| R15 | Worked answer: how a regional innovation system can promote or inhibit industrial restructuring | June 2025 exam, Question 2 | Jun 2025 Q2 | essay | front/EXAM_DAY.md, answers/AUDIT_JUN2025.md, themes/TH2.md, themes/TH5.md, cards/P03.md, cards/P05.md, cards/P14.md, cards/P16.md, cards/P17.md, cards/P01.md |
| R16 | Worked answer: guiding technological innovation systems towards sustainable transformation | June 2025 exam, Question 3 | Jun 2025 Q3 | guided | front/EXAM_DAY.md, answers/AUDIT_JUN2025.md, themes/TH6.md, themes/TH7.md, cards/P09.md, cards/P10.md, cards/P17.md, cards/P04.md |

**Chapter titles, exactly:**
- **essay (R12, R13, R15), 10 chapters:**
  1. Read the question
  2. Your plan in one minute
  3. The introduction
  4. The theory you need
  5. How it can promote
  6. How it can inhibit
  7. The Norway example
  8. Discussion and conclusion
  9. Traps and upgrades
  10. Build it yourself
- **guided (R16):** the essay titles, but 5 is "Levers that guide it" and 6 is "What can go wrong".
- **concept R11, 8 chapters:**
  1. Read the question
  2. Innovation system
  3. Sustainable transformation
  4. Agency
  5. Institutions
  6. How the four concepts connect
  7. Traps and upgrades
  8. Build it yourself
- **concept R14, 7 chapters:**
  1. Read the question
  2. Regional innovation system
  3. Institutional work
  4. Sustainability
  5. How the three concepts connect
  6. Traps and upgrades
  7. Build it yourself

## 3. How a worked-answer lesson teaches (adds to CHEATSHEET_PLAN §5.3; all of §5.1 and §5.3 still apply)

1. **Read the question (chapter 1).**
   - Say the exam question word for word, without quotation marks.
   - Then take it apart, with signposts: the concepts to define, the command words, and how many parts the answer needs.
   - The command words mean:
     - "What do you understand by" asks for a direct definition, how the readings and classes use the term, and one example [Class 9, slides 34–35];
     - "promote or inhibit" asks for both sides;
     - "be guided to promote" asks for levers and direction;
     - "Use examples" asks for a Norwegian case with its source.
   - Say once that only Question 1 is compulsory, then one of 2 or 3, weighted equally, with no aids. Say once that answers can be tested for plagiarism, so learn the moves and use your own words.
2. **The plan in one minute (essay chapter 2).**
   - Give one thesis sentence, then the moves in order: "There are five moves. First… Those were the five moves."
   - Give one memory aid, introduced as "A memory aid of our own:". It must contain no names or numbers.
   - This chapter is the one to learn by heart. Chapter 10 asks for it again.
3. **Every move chapter:**
   - **Its job:** it opens with "The job of this part is…", tied to the lecturer's structure [Class 9, slides 39–41] or the marking criteria [Class 9, slide 43].
   - **The content:** simple first, then precise, with sources spoken as author and year.
   - **One way to say it:** at most one sentence per chapter that starts "One way to say it:", of our own, at most 30 words. It is never copied from the model answers (the modelcopy check).
   - **A contrast:** at most one per chapter, "A weaker answer would… A stronger answer…".
   - **Remember:** a "Remember:" line, then 1–2 check lines.
4. **Concept chapters (R11, R14):**
   - Use the define, source, example pattern: say the term in plain words, then the course definition with its source, then one Norway example with its source.
   - Then give the opener "One way to say it: By …, I understand …".
   - Each concept is defined as its card or theme defines it. When the model answer defines it differently, chapter "Traps and upgrades" says which to prefer, and why.
5. **The Norway example chapter (and promote and inhibit):**
   - Use the case to show both sides when the question says "promote or inhibit".
   - Use only cases the audit confirmed, for example Hordaland and Rogaland, Longship and Northern Lights, Mongstad, maritime batteries, or Flåm, Odda and Sogndal.
6. **Traps and upgrades:**
   - Give 3–5 traps, each said as "The first trap is… Instead, …".
   - They come from:
     - the audit rows marked Corrected, Beyond the course or Wrong;
     - CHEATSHEET_PLAN §5.2;
     - the dated notes in CHEATSHEET_PLAN §11.
   - The model answers are spoken of as "the model answer", never by file name or author.
   - Examples:
     - Hekkert and colleagues' seven functions differ from Steen and colleagues' eight;
     - a definition from outside the course readings should be flagged as such;
     - the rebound effect is not in the course material;
     - the RIS path types must be credited to the reading that gives them.
7. **Build it yourself (last chapter):**
   - Ask 4–6 prompts. Each one is followed by "Pause the audio and answer in your head." and then a paragraph starting "Here is the answer.".
   - The last prompt is always "Say your whole plan aloud in under one minute.", and its answer repeats chapter 2's moves. For R11 and R14, it repeats the concepts' openers instead.
8. **Never read a model answer aloud.** No more than one "One way to say it:" sentence per chapter. The lesson explains *why* each move earns marks.
9. **Links back:** chapter 4 or the concept chapters may say "Revision 6 explains this theory in full". The lesson numbers come from the site's Revision list.

## 4. Files and formats

### 4.1 `answers/AUDIT_DEC2024.md` and `answers/AUDIT_JUN2025.md` (tasks E1, E2)

```
# Audit: model answers to the December 2024 exam
<!-- audit: Dec 2024 | model: INN514_2024_Model_Exam_Resolution.pdf | pages: 3-14 -->

A study document, not an official marking guide. Each claim is paraphrased and checked against the course sources; only Confirmed and Corrected rows may be voiced.

## Question 1
| # | Claim in the model answer (paraphrased) | Model p. | Verdict | Course source | Note |
|---|---|---|---|---|---|
| 1.1 | A TIS starts from a technology and can cross regional and national borders | 3 | Confirmed | (Hekkert et al. 2007, p. N) | |
```

- **Sections:** `## Question 1`, `## Question 2`, `## Question 3`. The June file says `June 2025`, uses `pages: 2-12`, and names `INN514_Exam_Resolution_HVL.pdf`.
- **Rows:** 10–25 per question, together covering every sub-section of that answer: the definitions, the theory, promote, inhibit, each example, the discussion and the conclusion. Number them `<q>.<n>`.
- **Claim:** at most 25 words, in our own words. It has no 8-word run copied from the model PDF and no quotation marks.
- **Verdict:**
  - `Confirmed`: the course source says it.
  - `Corrected`: the course source says something close but different. The Note says what, in at most 25 words.
  - `Beyond the course`: no course page or slide says it. The source column says `none`.
  - `Wrong`: a course source contradicts it. Give the source and the Note.
- **Course source:**
  - one or more CITE forms, `(Author Year, p. N)`, or SLIDE forms, `[Class N, slide S]`, exactly as CHEATSHEET_PLAN §4.1 writes them;
  - P02 is cited as `PDF p. N`; P02 and P05 are never quoted;
  - every page and slide is opened, as in CHEATSHEET_PLAN §7.1 step 3.
- **Already confirmed** by a read-only check, to be re-opened and cited:
  - Sleipner and Snøhvit (P10 p. 4);
  - organizationally thick and diversified, and thick and specialized (P03 pp. 19–20);
  - Hordaland now part of Vestland (P03 p. 15);
  - individual strategic leadership (P03 p. 22).
- **Already suspected Beyond the course:**
  - Brundtland/WCED 1987, the rebound effect and the HVL web pages (December);
  - the four path types given without a source (June). First search P05 p. 328, Class 2 and TH2, which hold the four trajectories, and mark the row Corrected if they match.
  - Confirm each of these with `find_in_paper.py` and a search of `lectures/*.md`.

### 4.2 `listen/R11.md` … `R16.md` (format as CHEATSHEET_PLAN §4.8, plus)
- **Title:** `# Revision {n}: {title}`, with n = 11–16. The lecture line, voices line, chapter lines, readings lines, check lines and "Remember:" are as in §4.8, with the voices from section 2.
- **Readings lines:**
  - They cite papers and slides only, never the exam papers or the model answers.
  - Chapter 1 cites `Class 9, slides 33–43`, or the subset it uses.
- **Lengths:**
  - each chapter: 120–320 words;
  - essay and guided lessons: 2,000–2,900 words, about 16–22 minutes;
  - concept lessons: R11 1,500–2,400 words, R14 1,300–2,100 words.

### 4.3 `answers/PLANS.md`, the "Answer plans" sheet (task E10), at most 950 words

```
# Answer plans for the six past questions
<!-- back: answer-plans -->
Drafting aid (ours): learn the moves, then write your own words. Each plan is voiced as a worked answer on the companion site (Revision 11 to 16).

## December 2024, Question 1
**Question:** <word for word from CHEATSHEET_PLAN §3.4>
- **Thesis:** <=20 words
- **Moves:** 1. … 2. … (4–6 numbered moves, <=14 words each, each with a CITE or SLIDE)
- **Example:** <=25 words with a CITE
- **Trap:** <=20 words
(six sections, in the order Dec 2024 Q1–Q3, Jun 2025 Q1–Q3)
```

- `build_cheatsheet.py` appends it as `## Part 5: Answer plans`, demoted like the other parts, inside `<section class="back">`.
- The PDF stays at 13 pages or fewer.

## 5. Writing rules added for Part E
1. **Facts only from the voices files.** The audit file is a voices file, but only its Confirmed and Corrected rows may be voiced. The gate review checks this by hand.
2. **No 8-word run from either model PDF** in any lesson, audit or plans file (the modelcopy check). The model answers give the structure; the course pages give the facts; the words are our own.
3. **Brand words:** never write "Claude", "Anthropic", "ZCode", "GLM", "Cursor" or "Grok" in any content file. "Grokbot" on the site is not affected.
4. **The traps are said fairly.** The model answers are useful, so say where one goes beyond the course. Never mock them.

## 6. Part E scripts (task E0)

### 6.1 `cheat_lib.py`
- Add the model answer files and a page reader:
  - `MODEL = {"Dec 2024": REPO / "INN514_2024_Model_Exam_Resolution.pdf", "Jun 2025": REPO / "INN514_Exam_Resolution_HVL.pdf"}`
  - `model_pages(key) -> {int page: text}`, using `fitz`, cached.
  - `model_copied(prose, n=8)`, built like `copied()`, against both PDFs, with quotation-mark spans removed first.
- Add six entries to `REVISION`, in the existing shape, plus `"kind"` and `"question"`:
  - `ESSAY_CHAPTERS`, `GUIDED_CHAPTERS`, `R11_CHAPTERS`, `R14_CHAPTERS` from section 2;
  - every existing entry gets `"kind": "revision"`.
- Add "Cursor" and "Grok" to the BRAND regex in `check_cheatsheet.py`: `\b(Claude|Anthropic|ZCode|GLM|Cursor|Grok)\b`.

### 6.2 `check_cheatsheet.py`
- **New CLI:** `--model-text "Dec 2024" 7` prints that page of the model answer (for reading, never for copying).
- **New kind `audit`,** for `answers/AUDIT_*.md`:
  - header and sections as in 4.1;
  - 10–25 rows per question, with ids in order;
  - the verdict is one of the four;
  - Confirmed, Corrected and Wrong rows have at least one CITE or SLIDE, each checked as the `cite` and `slides` checks do;
  - Beyond the course rows have `none`;
  - claim and note are at most 25 words each;
  - no quotation marks;
  - `model_copied` is empty;
  - the model page is inside the header's range.
- **New kind `plans`,** for `answers/PLANS.md`:
  - the title, the comment line and the drafting line;
  - six sections, in order;
  - each question equals `EXAM[id]` by `qnorm`;
  - 4–6 moves, each with a source;
  - Example has a CITE;
  - the word limits of 4.3;
  - `model_copied` is empty;
  - the `people` check applies.
- **`check_listen`,** for `kind` answer lessons (essay, guided, concept):
  - chapter titles and counts from REVISION;
  - lengths from 4.2;
  - the last chapter needs 4–6 pauses and as many "Here is the answer." paragraphs, and its last prompt is exactly "Say your whole plan aloud in under one minute.";
  - at most one "One way to say it:" per chapter;
  - chapter 1 contains `EXAM[question]` with the quotation marks removed (compared by `qnorm`);
  - `model_copied(prose)` is empty;
  - "A memory aid of our own:" sentences contain no digit.
  - Every existing rule for R01–R10 is unchanged.
- **`--all`** also checks `answers/*.md` and `listen/R11–R16.md` that exist. `complete()` requires both audits from G14 on, R11–R16 from G17 on, and PLANS from G18 on. Partial mode skips the files that don't exist yet.
- **`assembled`** now expects Part 5, "Answer plans", after Part 4.

### 6.3 Tests, added to `test_check_cheatsheet.py` (35–48)

| # | Case | Result |
|---|---|---|
| 35 | A two-chapter R12 with partial=True whose facts are in fake voices files | pass |
| 36 | R12 chapter 1 without the exam question | fail |
| 37 | Two "One way to say it:" in one chapter | fail |
| 38 | An 8-word run taken from `model_pages("Dec 2024")[7]` at runtime | fail |
| 39 | Build it yourself with 3 pauses | fail |
| 40 | Build it yourself whose last prompt is not the whole-plan prompt | fail |
| 41 | "Grok" in a lesson | fail |
| 42 | "A memory aid of our own: 7 steps" | fail |
| 43 | An audit row with verdict "Maybe" | fail |
| 44 | A Confirmed audit row with source `none` | fail |
| 45 | An audit row citing `(Fagerberg et al. 2009, p. 999)` | fail |
| 46 | An audit with 9 rows under Question 2 | fail |
| 47 | A PLANS section whose question differs from EXAM | fail |
| 48 | A correct one-section PLANS file, partial | pass |

Every test from 1 to 34 still passes.

## 7. How to do each task

**E0 scripts:** do 6.1–6.3. Then run `test_check_cheatsheet.py` (`ALL CHECKER TESTS PASSED (48 tests)`), `--all` and `--scan`.

**E1, E2 audits:**
1. Read the model answer one page at a time with `--model-text`.
2. For each claim, find the course page with `find_in_paper.py`, `readings/<P>.md` and the cards. Open the page file, or the class chapter for a slide.
3. Write the row.
4. Run `check_cheatsheet.py answers/AUDIT_….md` until it passes.
5. In the progress box, list every page and slide you opened.

**E3, E5–E9 lessons:**
1. Read §11 of both plans. Read the lesson's voices in full once, and the audit rows for its question.
2. Plan the chapters (sections 2 and 3). For each chapter, note the voices lines it uses and copy their cites into its readings line.
3. Write for the ear, one chapter at a time.
4. Run `check_cheatsheet.py listen/R1n.md` until it passes.
5. Record with `build_audio.py R1n`. Every chapter must print `[OK]`.
6. Run `--site-manifest check`.

**E4, the site:** this follows the rules of CHEATSHEET_PLAN §7.8. It edits only these three files.
- **`scripts/build_site.py`:**
  - Add R11–R16 to `REVISION`, with the when lines of section 2.
  - Each tuple gains a 5th value, the group: `"lesson"` for R01–R10 and `"answer"` for R11–R16.
  - `revision` gains `"group": g`.
- **`site/template.html`:**
  - `renderRevision()` shows two groups, each an `<h2>` and its own `<ol class="list classes">`:
    - "Lessons" lists the group `lesson` rows;
    - "Worked exam answers" lists the group `answer` rows, with the lede line "Six past exam questions, answered move by move. Learn the moves, then write your own words."
  - The page lede becomes "The course cheatsheet as audio lessons: the exam day, the eight themes, the papers in brief and six worked exam answers. Turn on Repeat to hear a lesson again and again."
  - Nothing else changes, and none of the CHEATSHEET_PLAN §7.8 item 11 bans may be broken.
- **`scripts/check_page.mjs`:**
  - The door check expects `${REVISION.length} lessons`, not the fixed "10 lessons".
  - Add checks:
    - `#revision` has both headings;
    - the answers list has 6 rows;
    - a ready answer row links to its lesson;
    - `#R12` renders with the Revision crumb and its 10 chapters, and its first Listen plays `audio/R12-01.mp3`;
    - with Auto on and Repeat off, R12's end goes to the next ready lesson.
  - Add the screenshot `phone-revision-answers.png`.
  - Change an existing check only where E4 makes it wrong, and list every such change.
- **Then run** `build_site.py`, `check_page.mjs` (ALL PAGE CHECKS PASSED), `build_static.py`, `test_server.mjs` (ALL SERVER CHECKS PASSED) and `--site-manifest check`.
- **Screenshots:** open `phone-revision-answers.png`. If the model cannot view images, say so and rely on the checks.
- `server.js` and `build_audio.py` need no change: their `R\d\d` patterns already cover R11–R16.

**E10 plans sheet and PDF:**
1. Write `answers/PLANS.md` (4.3) from the six lessons' chapter 2 and the audits.
2. Add Part 5 to `build_cheatsheet.py`.
3. Run `build_cheatsheet.py`; the PDF must be at most 13 pages. Look at the new pages.
4. Run `--all`.

## 8. STOP GATES (as CHEATSHEET_PLAN §8 for G10–G13, plus)

- **G14, the scripts and audits:**
  - compare every rule of 6.2 with the code, row by row;
  - re-open every cited page for the audit rows, and confirm each verdict;
  - search both lectures and readings for each Beyond the course row, to be sure no course source exists.
- **G15–G17, the lessons:**
  - check every fact against a voices line;
  - confirm that every audit-sourced fact comes from a Confirmed or Corrected row;
  - check the lesson for the ear;
  - check the recording report (`[OK]`, 105–175 wpm);
  - run the five site checks, then push, then run `--live` with the batch's ids.
- **G15 only:** compare the E4 changes with section 7, line by line.
- **G18:** review PLANS against the six lessons and the audits. Look at every new PDF page. Run the final `--all`, `--scan`, the site checks and `--live R11 R12 R13 R14 R15 R16`.

**Review table:**

| File | Items | Confirmed on the source | Fixed (what) |
|---|---|---|---|

Add dated notes to CHEATSHEET_PLAN §11 at every gate.

## 9. Git (as CHEATSHEET_PLAN §9; these staging lists replace its step 2 for Part E)

| Gate | Stage |
|---|---|
| G14 | `cheatsheet/ANSWERS_PLAN.md cheatsheet/ANSWERS_KICKOFF.md cheatsheet/PROGRESS_ANSWERS.md cheatsheet/CHEATSHEET_PLAN.md cheatsheet/scripts cheatsheet/answers` |
| G15 | `cheatsheet "site/data/R*.json" "site/audio/R*.mp3" site/index.html index.html checks/page-check.log scripts/build_site.py scripts/check_page.mjs site/template.html` |
| G16, G17 | `cheatsheet "site/data/R*.json" "site/audio/R*.mp3" site/index.html index.html checks/page-check.log` |
| G18 | the G16 list |

Commit messages are `answers: G<n> <what>`. Never stage the model PDFs or anything outside these lists. Never force-push. Run `--live` after every push from G15 on.

## 10. Commands

These are CHEATSHEET_PLAN §10's commands, plus `check_cheatsheet.py --model-text "<Dec 2024|Jun 2025>" <page>`. `build_audio.py` takes R11–R16 only. The only online calls are `build_audio.py`'s voice service and `--live`.

## 11. Lessons

Cursor + Grok adds dated notes here. CHEATSHEET_PLAN §11 holds the older notes.

- 2026-11-01, E0: `model_copied` ignores an 8-word run that sits wholly inside one of the six exam questions. Both model PDFs reprint those questions, and chapter 1 plus the plans sheet must say each question word for word. A run that continues into the model's own sentences is still flagged. `assembled` requires Part 5 only once `answers/PLANS.md` exists. `complete()` requires the two audits, R11–R16 and PLANS only after G14, G17 and G18 are ticked, so `--all` still passes while those files are unwritten.
- 2026-11-01, G14: a Beyond row is searched in `lectures/*.md` and `readings/*.md` before it stays Beyond. The only life-cycle hit was P08's industry life cycle, which is not a battery assessment, so the battery rows stayed Beyond. P05 p. 328 names exhaustion, extension, renewal and creation. The model's upgrading and diversification are not those four names, so that row is Corrected, not Confirmed.
- 2026-11-01, E4: at this gate R12 is the last ready revision lesson, so Auto has no next lesson to open. The new check uses the same neighbour rule as the other lessons. It requires the handover when a later ready lesson exists, and it requires that R12 does not restart when it is last.
- 2026-11-01, G16: the E4 check named R12 as the ready answer row, because it was the only one recorded. Once R11 is recorded, the first ready answer row is R11, and that check would fail. The check now follows the plan's own words and accepts whichever answer row is ready first. `scripts/check_page.mjs` is included in the G16 commit for that reason. The stage list did not name it, and leaving the old check in the commit would make the page check fail.
- 2026-11-01, G17: R16 said Northern Light. That singular form is in the December audit, which is not one of R16's voices. TH6 and the P10 card, which are voices, print Northern Lights. Chapter 7 was changed to that form and recorded again. No other fact in R14, R15 or R16 was changed.

## 12. Done means
- `test_check_cheatsheet.py` prints `ALL CHECKER TESTS PASSED (48 tests)`.
- `--all` prints ALL CHEATSHEET CHECKS PASSED, and `--scan` prints SCAN CLEAN.
- Both audits pass, and every Beyond the course row was searched for.
- R11–R16 are recorded with every chapter `[OK]`, and `--live R11 … R16` prints LIVE OK.
- `#revision` shows "Lessons" (10) and "Worked exam answers" (6), and the front door says 16 lessons.
- The PDF has Part 5, "Answer plans", and is at most 13 pages.
- `status -sb` shows `main...origin/main` with nothing ahead. G14–G18 are ticked with their review tables and push evidence.
