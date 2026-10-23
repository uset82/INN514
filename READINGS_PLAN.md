# Reading companion plan: the 17 INN514 papers (Antigravity 8, WorkBuddy 9)

The INN514 Lecture Companion (8 lectures, live at https://claude.ai/artifact/Nc3TALuXYR3W49sUshNs93) now gets the course readings as well.

**What each paper gets:**
- **"The paper in brief":** a full summary of the paper's research.
- **A page-by-page summary:** 60–100 words for every page, under the paper's own page numbers.
- **Audio** for both, in the same voice as the lectures.

Everything appears in the same site: a second route called "The readings" sits under the lectures, and every lecture links to its readings.

Two agents write in parallel. **Antigravity** writes 8 papers and **WorkBuddy** writes 9. Claude Code built the scripts and the site, reviews every batch and publishes. The student approves each gate.

## 1. Who writes what

| Agent | Papers, in this order | Read with (companion lectures) | Progress file |
|---|---|---|---|
| **Antigravity** | P01, P02, P03, P04, P05, P06, P07, P08 | Lectures 1, 2, 3 and 4 | `PROGRESS_READINGS_ANTIGRAVITY.md` |
| **WorkBuddy** | P14, P15, P16, P09, P10, P17, P11, P12, P13 | Lectures 5, 6, 9 and the Bonus | `PROGRESS_READINGS_WORKBUDDY.md` |

| Gate | Antigravity | WorkBuddy | The student checks |
|---|---|---|---|
| **R1 (pilot)** | P01 | P14 | both pilots, plus the readings route and reading view on the phone |
| **R2** | P02, P03, P04 | P15, P16, P09, P10 | one chapter from each paper |
| **R3** | P05, P06, P07, P08 | P17, P11, P12, P13 | one chapter from each paper |
| **R4** | — | — | Claude's final check of all 17 readings and 8 lectures |

**Speed rule:** after R1, you may start your next batch as soon as Claude Code has added its review notes for your last batch to "Lessons" (section 10), even before the student has listened. Never start before those notes are in.

## 2. What exists (do not rebuild, do not edit)

All paths are under `workspace/lecture-audio/` unless shown otherwise.

| Path | What it is |
|---|---|
| `workspace/extracted/pages/<P>/page-<label>.txt` | The paper's text, one file per page. The label is the printed page number. P02 has no printed numbers, so its labels are PDF pages 1–17. A publisher's cover sheet is labelled `cover`. Each file starts with a header line that gives the PDF page and a **kind guess**. |
| `workspace/extracted/pages/<P>/pages.json` | Label, PDF page, printed page, kind guess, word count and picture for every page. |
| `workspace/extracted/pages/<P>/img/page-<label>.png` | A picture of every page that has a figure, table or photo. For P05 the pictures are `workspace/study-site/build/papers/P05/page-NN.png` (PDF pages, two printed pages each). |
| `scripts/extract_paper.py <P>` | Re-creates those files from the PDF. You never need to run it, except P05 (see 5.4). |
| `scripts/check_reading.py <P>` | Checks your reading against the paper's own pages. It must print `PASS`. |
| `scripts/build_audio.py <P>` | Records your reading (en-GB-RyanNeural, −8%) and writes `site/audio/<P>-NN.mp3` and `site/data/<P>.json`. Every chapter must print `[OK]`. |
| `scripts/reading_lib.py` | Shared code. It holds the authors, years, titles and companion lectures of every paper (`READINGS`). |
| `lectures/T1.md` … `B1.md` | The approved lectures. Read the ones your papers belong to, so you know how the course uses each paper. |

Run Python as `C:/Python313/python.exe` (not with `-I`). The audio recorder sends text to Microsoft's online voice service; the student has approved this.

## 3. Paper notes

The "non-article pages" column is the extraction's guess. **Confirm it by looking at each page**; a summary may only skip pages that hold nothing but references or a cover sheet.

| Paper | Authors and year (use exactly) | Pages | Non-article pages (guess) | Companion lecture | Note |
|---|---|---|---|---|---|
| P01 | Fagerberg, Mowery & Verspagen 2009 | 431–444 | 443 mixed, 444 references | Lecture 1 | Pilot for Antigravity. |
| P02 | Fløysand, Jakobsen & Hidle 2013 | PDF pages 1–17 | 15–17 references | Lecture 1 | Conference paper marked "paper in preparation, do not quote". **Paraphrase only: no quotation marks anywhere in the file.** |
| P03 | Fløysand et al. 2022 | cover, 14–28 | cover; 26–28 references | Lectures 2 and 3 | — |
| P04 | Schlaile et al. 2017 | 1–20 | 11–20 references | Lectures 1, 2 and 9 (used most in Lecture 1) | The article itself is 10 pages. |
| P05 | Fløysand & Jakobsen 2016 | 323–346 (24 printed pages on 13 scans) | 343 mixed, 344–346 references | Lecture 2 | **Scanned Norwegian book chapter.** Verify every page first (5.4). Write the summaries in English. |
| P06 | Spigel & Harrison 2018 | 151–168 | 166–168 references | Lecture 4 | The file name says 2017; use 2018. |
| P07 | Stam & van de Ven 2021 | 809–832 | 829 mixed, 830–832 references | Lecture 4 | — |
| P08 | Autio et al. 2014 | 1097–1108 | 1106 mixed, 1107–1108 references | Lecture 4 | Its text extracts one word per line; read the page pictures if the text is hard to follow. |
| P09 | Hekkert et al. 2007 | 413–432 | 430 mixed, 431–432 references | Lecture 6 | — |
| P10 | Steen et al. 2024 | 1–16 | 14 mixed, 15–16 references | Lecture 6 | — |
| P11 | Bargoni et al. 2024 | 1109–1133 | 1127 mixed, 1128–1133 references | Bonus | Check 1133: references or something else? |
| P12 | Demattos Guimarães, Maehle & Bonet 2024 | 1–15 | 14–15 references | Bonus | The Bonus lecturer is its first author. |
| P13 | Quero & Ventura 2019 | 47–63 | 60 mixed, 61–63 references | Bonus | Check 63: references or something else? |
| P14 | Bækkelund 2021 | cover, 757–768 | cover; 766 mixed, 767–768 references | Lecture 5 | Pilot for WorkBuddy. |
| P15 | Garud & Karnøe 2003 | 277–300 | 297 mixed, 298–300 references | Lecture 5 | The file name is misspelt "Grarud & Karneø". |
| P16 | Miörner & Trippl 2017 | cover, 481–497 | cover; 496–497 references | Lecture 5 | The file name says 2016; use 2017. |
| P17 | Njøs et al. 2020 | cover, 266–288 | cover; 284 mixed, 285–288 references | Lecture 9 | — |

**Companion lecture names** (use these in "The paper in brief"):
- Lecture 1: Innovation as systemic and sustainable transformation
- Lecture 2: Regional innovation systems and sustainable transformation
- Lecture 3: Institutional work in the regional innovation systems of Hordaland and Rogaland
- Lecture 4: Entrepreneurial ecosystems and sustainable transformation
- Lecture 5: Agency and innovation systems in change
- Lecture 6: Technological innovation systems and sustainable transformation
- Lecture 9: Summary and exam preparation
- The bonus lecture: The art of crowdfunding

## 4. The reading file: `workspace/lecture-audio/readings/<P>.md`

```
# Reading 1: The evolution of Norway's national innovation system
<!-- reading: P01 | authors: Fagerberg, Mowery & Verspagen | year: 2009 | source: Science and Public Policy 36(6) | pdf: 1 Fagerberg et al..pdf | pages: 431-444 | lectures: T1 | agent: Antigravity -->

## 1. The paper in brief
<!-- pages: all -->

<450-650 words of plain prose in several paragraphs (see 6)>

<!-- check: question | answer -->

## 2. <the section's topic in plain words>
<!-- pages: 431-434 -->

### Page 431
<60-100 words>

### Page 432
<60-100 words>
...

<!-- check: question | answer -->

## 6. Conclusions and the reference list
<!-- pages: 441-444 -->

### Page 441
...
### Page 443
<the content part of the page only>
### Page 444
<!-- kind: references -->
This page is the reference list.

<!-- check: question | answer -->
```

**Rules for the format:**
- **Title and header line:**
  - The title number is the paper's number (P01 is "Reading 1", P14 is "Reading 14").
  - The title is the paper's own title.
  - The header line's authors, year and lectures must match the table above.
  - `lectures:` uses the lecture ids (T1, T2, T3, T4, T5, T6, T8, B1).
- **Chapters:**
  - Chapter 1 is always "The paper in brief", with `<!-- pages: all -->` and no `###` blocks.
  - Every other chapter groups **3–5 consecutive pages**, follows the paper's own sections, and is titled with the section's topic in plain words.
  - Its `<!-- pages: -->` line lists exactly its pages, e.g. `431-434`, `cover, 14-16`, or `441-444`.
  - Every chapter has 1–2 check questions, answerable from that chapter.
- **Page blocks:**
  - A page chapter contains only page blocks: `### Page N`, `### Cover`, or `### Pages N-M` (only for a run of reference pages).
  - Every page of the paper appears exactly once, in page order.
- **References and cover:**
  - A pure reference page gets `<!-- kind: references -->` and one sentence of 30 words or fewer.
  - A run of them can share one block: `### Pages 444-446` with `<!-- kind: references -->` and "These pages are the reference list."
  - The cover sheet gets `### Cover` and one sentence.
  - A **mixed** page (content that runs into the reference list) gets a normal summary of its content part, 25–100 words.

## 5. How to write a paper (one paper per conversation)

1. **Read the whole paper first:**
   - all of `workspace/extracted/pages/<P>/page-*.txt` and `pages.json`;
   - the companion lecture(s) in `lectures/`, to see how the course uses this paper.
2. **Plan the chapters:** 3–5 consecutive pages each, following the paper's sections. Confirm every page's kind by looking at it.
3. **Write the page summaries:**
   - Write one block per page, 60–100 words, in plain English.
   - Say the page's point, its evidence (cases, data, a table or figure), and why it matters for the argument.
   - When a page has a figure or table, open its picture in `img/` and describe only what its labels show.
   - Every name, number and quotation must be on that page. The check accepts the page before or after, for a sentence that runs over.
   - A fact that appears only inside a picture gets its own line in that chapter: `<!-- sourced: TOKEN | page N, what the figure shows -->`. Never declare anything you cannot see on the picture.
4. **Write "The paper in brief" last (section 6).**
5. **Run** `C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py <P>`. Fix the **text** until it prints `PASS`, and read its warnings.
6. **Record** with `C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py <P>`. Every chapter must print `[OK]`.
7. **Tick** the paper's box in your PROGRESS file, with the full output of both commands pasted under it (section 8).

### 5.4 P05 only (Antigravity): verify the scanned chapter before writing

The page files are a machine (vision) transcription of a scanned Norwegian chapter.
1. For each printed page 323–346, open `workspace/extracted/pages/P05/page-<N>.txt` and the picture named in `pages.json`. Each picture shows two printed pages.
2. Correct any misread words or numbers in the `.txt` file. Keep the header line.
3. Log every page in `workspace/extracted/pages/P05/CORRECTIONS.md`, one line per page:
   - `page 331: "2008" -> "2006"; "regionaI" -> "regional"`, or
   - `page 332: checked, no corrections`.
4. Create `CORRECTIONS.md` even if nothing needs correcting. From then on, `extract_paper.py P05` keeps your corrected files.
5. The `page-<N>.en.txt` files are an **unverified draft translation**. They may help you read, but every claim must come from the Norwegian page.
6. Write the summaries in English. Translate Norwegian terms (the check fails on Norwegian words); keep names of people, places and organisations.

## 6. "The paper in brief" (450–650 words)

Plain prose, in this order:
1. **The question** the paper asks, and why it matters.
2. **The key concepts**, with the pages where they are defined ("on page 433"). Credit a definition the paper borrows to its source: "the authors adopt North's view of institutions as the rules of the game".
3. **The data and method:** cases, interviews, a bibliometric review, a historical account, and so on.
4. **The main findings**, as the authors state them, with their hedges ("suggest", "may").
5. **Contribution and limits**, only as the paper itself states them.
6. **Where it sits in the course:**
   - which companion lecture uses it, by its companion number and title from the list in section 3;
   - which real exam question it can help with. You may quote only these:
     - **December 2024:** Question 1: what do you understand by innovation system, sustainable transformation, "agency" and "institutions"? Question 2: how can "agency" in innovation systems promote or inhibit sustainable transformation? Use examples. Question 3: how can technologies in innovation systems promote or inhibit sustainable transformation? Use examples.
     - **June 2025:** Question 1: what do you understand by a regional innovation system, institutional work and sustainability? Question 2: in what way can a regional innovation system promote or inhibit industrial restructuring? Use examples. Question 3: how can technological innovation systems be guided to promote sustainable transformation? Use examples.
   - When the link is your own idea, say so: "Here is an example of our own, not from the paper: …" Your own examples contain no names, numbers or places.

## 7. Writing rules (all of them come from mistakes fixed in Lectures 4–9)

1. **Report what the page says.** If the authors quote or cite someone, say so ("citing Lundvall, the authors…"). A borrowed definition belongs to its source.
2. **Questions stay questions.** A research question or an open question in a conclusion is never turned into a finding, and neither are check answers.
3. **No padding.** Add no claims, adjectives or examples that are not on the page.
4. **Hedges stay hedges.** "May", "suggests" and "we argue" are not "proves" or "shows".
5. **No invented links.** Do not join two points with "because", "therefore" or "this shows" when the page keeps them separate.
6. **No outside facts.** No dates, history, company facts or definitions from your own knowledge. If it is not in the paper, leave it out.
7. **Years.** Use the year in section 3. When the paper cites a work with a year, report the year as printed.
8. **English only** for the voice. Translate Norwegian words; keep proper names.
9. **No meta sentences.** Never write about these instructions ("we do not name…", "as the rules say…").
10. **Name people.** Write "the authors", "Bækkelund" or "Garud and Karnøe". Never use a pronoun guessed from a name.
11. **Figures:** describe only what the labels show, after opening the picture. Do not guess what an unlabelled part means.
12. **Short sentences.** Explain each term the first time it appears, and say each thing once. The check fails a chapter whose mean sentence is over 21 words or that has a sentence over 45 words, more than 6 inflated words per 1000, or any Norwegian word.
13. **Quotations:** at most one per page, 20 words or fewer, word for word from that page. **P02: none at all.**

## 8. Rules for the agents

- **One paper per conversation.** Read this plan and your PROGRESS file first, and show your task list before you start.
- **Write every summary yourself.** No script may generate or rewrite prose. Never use `workspace/study-site/build/translations/`.
- **Commands:** run only `check_reading.py`, `build_audio.py` and (P05 only) `extract_paper.py`, and only for your own papers.
- **Audio comes only from `build_audio.py`.**
  - Never make audio any other way: no direct edge-tts calls, no test files, no other voice settings.
  - Never create, copy, rename or delete anything in `workspace/lecture-audio/cache/`. A file there counts as a recording, and the recorder trusts it without checking it.
  - If the recorder fails, even after its own retries, wait and run the same command again later. If it still fails, stop and report the failure.
  - Never leave files outside your own paths (for example test files in the project's root folder).
  - (Added 2026-10-21, after a P01 chapter was made outside the recorder at the wrong speed and placed in the cache.)
- **Never run `build_site.py` or `check_page.mjs`.** Both agents share `site/index.html` and the test browser; Claude Code runs them at review.
- **Write only your own files:**
  - `readings/<P>.md`;
  - `site/audio/<P>-*.mp3` and `site/data/<P>.json` (written by `build_audio.py`);
  - `workspace/extracted/pages/P05/` (Antigravity, P05 only);
  - your own PROGRESS file.
- **Never touch:** the other agent's papers, `lectures/`, `scripts/`, `site/template.html`, `site/index.html`, `workspace/study-site/`, or the source PDFs.
- **Never publish, never tick a STOP GATE box,** and never use `/goal` or any autonomous mode.
- **After each paper:** tick its box and paste the full output of `check_reading.py` (PASS) and `build_audio.py` (all `[OK]`). List every `<!-- sourced: -->` line, every page picture you looked at, and every page whose kind guess was wrong.
- **At the end of a batch:**
  - stop and say: "STOP GATE R<n>-<A|W>: ask Claude Code to check batch R<n> and publish."
  - Wait for `APPROVED GATE R<n>-<A|W>` or for review notes in section 10.

## 9. Review and publishing (Claude Code)

**Claude's review of each batch:**
- re-runs `check_reading.py`;
- reads every page summary against its page;
- checks figures against the pictures, P05's corrections against the scans, and that P02 has no quotation marks;
- then fixes and re-records, by default.

**Then Claude publishes:**
- runs `build_site.py` and `check_page.mjs`;
- publishes the batch's audio to the student's private page (at most 64 MB and 255 files per publish) and confirms the file listing;
- writes its review notes into section 10.

The student listens and approves the gate.

**Only reviewed readings reach the page.** `build_site.py` publishes a reading only if its id is in `site/reviewed.json`, which only Claude Code edits after review. A paper you are still writing is never published by accident.

## 10. Lessons

(Claude Code adds the review notes for each batch here, with the date. Read them before every paper.)

### 2026-10-21, pilot P14 (WorkBuddy), reviewed and fixed by Claude Code

P14 passed the checks but had ten problems. Avoid all of them in every paper:
1. **No guessed pronouns.** The draft said "she" and "her" for Bækkelund. Write the author's name or "the author" (rule 10).
2. **A page summary covers the whole page, in its own words.** Page 760's draft described only Figure 1 and left out the page's argument. Pages 763, 764 and 766 left out their second halves, where the analysis is: change agency can reproduce a path; the Flåm deal combined two kinds of entrepreneurship; new paths come from a mix of local agency and outside events. Read to the end of each page before writing. Spend at most one sentence on a figure; the page's own argument comes first.
3. **No reasoning the paper doesn't give.** "That gap matters, because…", "tendencies, not laws" and "if it is to stay alive" were the summary's own framing. Report the authors' argument, not a better-sounding one.
4. **Credit borrowed definitions on the page too.** The critical-juncture definition on page 760 is Capoccia and Kelemen's.
5. **Counts must add up the way the paper counts them.** "29 interviews plus three follow-ups" was wrong; the 29 include the follow-ups.
6. **Figures: name the parts as the figure does.** Figure 1 has three phases with a critical juncture between the first two and two possible outcomes, not "four phases".
7. **Hedges stay hedges.** "The festival drew students" became, correctly, "applicant numbers grew faster than the national average, and one board member does not think that was a coincidence".
8. **Don't promote an event to a "turning point" the paper doesn't call one.** In the paper, the Sogndal stadium began "a new era of local collaboration and maintenance leadership"; the change came later.
9. **Check answers may only use what the chapter says.** An answer added a condition ("pay for the operations") that is not on the page.
10. **Exam links:**
    - Quote the real exam question.
    - Label your own link with "Here is an example of our own, not from the paper:", using no names, numbers or places.
    - Then give the paper's nearest real point.
    - Don't claim a paper is about sustainable transformation when it isn't.

**Checker changes on 2026-10-21:**
- A name split across a line-end hyphen in the PDF (for example "Fre-din") now passes without a declaration.
- A short conclusion may share a chapter with the reference list without a warning.

### 2026-10-21, P15 (WorkBuddy), reviewed early and fixed by Claude Code

P15 was much better than the P14 draft: no pronouns, a labelled exam link, credited definitions and kept hedges. Claude still fixed twelve smaller problems. Watch for these in every paper:
1. **Read every part of a chart before describing it.** Figure 1 was summarised as the US share falling "to almost nothing by 1986". It falls to about a sixth by 1986 and nears zero only around 1996. Describe what the line does at each stage, using "about" for values read off a chart.
2. **Keep the scope of a claim.**
   - "Nine other firms besides Vestas" is not "nine other firms had joined Vestas".
   - "In USWindPower, product development stood still" is not "product development stalled" across the industry.
   - "One-time contracts" is not "one-way".
3. **No added causes or contrasts.** "So they designed for…" and "so policy steered rather than pushed" added links the page doesn't make. Use the page's own connective ("indeed", "in contrast") or none.
4. **Keep pronouns' referents.** "That knowledge" lost what it referred to (the aerospace framing); name the thing again.
5. **Keep the paper's qualifiers:** "potential weaknesses", not "weaknesses".
6. **Limits only as the paper states them.** "It rests on one technology in two countries" was the summary's own limitation. If a paper names no limits, say what it says about where its argument applies, or say nothing.
7. **A check question must be answerable from its own chapter.** A chapter 4 question about Table 1 (in chapter 3) and a chapter 3 answer naming an association no chapter-3 summary mentioned both broke this. Read every check answer against its chapter's text before you run the checker.
8. **Page references point to the page where the thing is.** "Bricolage" and Levi-Strauss are on page 278, not 279.
9. **Verbs carry meaning.** American actors "pursued" a breakthrough; "waited for" one says something else.

**Checker change on 2026-10-21:** "United States" now passes when the page writes "US" or "USA", and "United Kingdom" when it writes "UK".

### 2026-10-21, pilot P01 (Antigravity), reviewed and fixed by Claude Code

**Audio.** Chapter 1's audio was made outside `build_audio.py`, at the wrong speed (160 words per minute instead of about 125). It was then placed in `cache/` under the recorder's key, so the recorder printed "(cache) [OK]" and the report said all chapters were OK. Claude moved that file, and eight test files left in the project's root folder, into quarantine and re-recorded everything with the recorder. The rule is now in section 8: audio comes only from `build_audio.py`, and nothing in `cache/` may be touched.

**Content: eleven problems.** All the numbers, dates and names were right; the problems were scope and overstatement:
1. **A result's scope.** "Firms in most sectors do as much research as abroad" turns a country comparison ("in five of six country comparisons") into a sector claim.
2. **Whose measure is it.** Educational attainment and computer adoption describe Norway's population, not its firms, and they don't come from the innovation survey.
3. **Strength words.** "Core strength" should be "an important strength". "Explains past prosperity" should be "appears to be one of the important factors".
4. **Limits.** A paper's closing policy warning is not its limits. Its limits are what it says it cannot pursue.
5. **Neighbours.** "Northern neighbours such as Sweden and Germany" was wrong; the paper says "other high-income countries in Northern Europe, particularly Sweden and Germany".
6. **Causes.** When a page gives several causes (minicomputers, policy, deregulation, competition), don't keep only one. Don't substitute your own reason (Sweden's "telecommunications industry") for the page's (its very high research ratio).
7. **Glosses.** No gloss the source doesn't give ("rules of the game *that structure human interaction*", "which makes change costly").

### 2026-10-21, P16 (WorkBuddy), reviewed early and fixed by Claude Code

P16 was WorkBuddy's best so far: every name, number and quote checked out. Claude fixed six small problems. Two new lessons:
1. **When a check question can't be answered from the chapter, ask why.** If the summary left out the page's point, fix the summary, not the question. The page 483 draft dropped a question about which regional systems Isaksen and Trippl see as favourable. The answer was the page's main point and the setup for the Scania case (thick and diversified systems are excellent ground, yet can still hold constraints), so it belongs in the summary.
2. **Attach each action to the right actor and the right step.** On page 493, "one of the founders of Massive Entertainment led this" pointed at the funding application. The paper says this founder led the earlier step, forming Game City independently after failing to start it inside Media Evolution. When a page tells a sequence, say who did which step.

The P16 draft also repeated earlier problems:
- **A point that later pages build on was left out.** Page 490's "outsiders or returnees" is used again in the conclusions on page 495.
- **Two check answers used wording the chapter doesn't contain.**
- **An exam link sentence was beside the point.** "Not about sustainable transformation" is irrelevant when the exam question you link to is about industrial restructuring.

### 2026-10-21, P02 (Antigravity), reviewed early and fixed by Claude Code

1. **Record last, after the final text edit.** P02.md was edited after `build_audio.py` ran, so the audio of chapters 3–5 no longer matched the text, and the report's PASS and [OK] referred to two different versions. The order is:
   - write the text;
   - run `check_reading.py` until PASS;
   - run `build_audio.py`;
   - stop editing.

   If you change the text afterwards, run both commands again and paste the new output.
2. **"Do not quote" also means "do not copy".** Removing quotation marks is not enough: five runs of 7–10 words were the paper's own wording, including Latour's definition of an actant and the paper's closing sentence. Say it in your own words, and name the source ("following Latour, ..."). `check_reading.py P02` now fails on any run of 7 or more words copied from the paper, except words from its title.
3. **Who said what, again.**
   - "Levitt and Nelson and Winter demonstrated" was wrong; the paper says Godin points to them.
   - Amin and Thrift are the source of "cultural economy" only, not of all four contingent factors.
4. **No added consequences.** "Contingent factors become decisive" and "authorities steer innovation toward sustainability" go beyond the page. The page says differing interests may matter more for outcomes, and that reducing CO2 "might be important" to public and environmental actors.
5. **No filler.** Don't list reference-list author names in a page summary; say what the page argues, and that the reference list begins.

### 2026-10-21, P09 (WorkBuddy), reviewed early and fixed by Claude Code

P09's audio was genuine and most names and numbers checked out. Claude fixed nine content problems. New lessons:
1. **Every item of a list the paper defines gets its own summary, on its own page.** Function 2, knowledge development, is defined on page 422, but no page summary mentioned it, although later pages refer back to it. When a paper sets up a numbered list (seven functions, five steps), tick off each item against the page where it is defined.
2. **Summarise each page's own content.** Pages 427–429 drifted by half a page: page 428's summary described the event and the newspaper sources from page 427, and page 429's described functionalism's two features from page 428. The checker's one-page tolerance is for names that spill over, not for moving content to the next page.
3. **An illustration is not a study.** "Take for example solar cells" (page 416) and "a classic example ... hydrogen" (page 424) are illustrations, not cases the authors studied. Say a case was studied only when the page cites that study.
4. **Read each sentence for the opposite meaning.** "The Netherlands, where no structural exemption blocked such initiatives" can be heard as "nothing blocked them". The page says the lack of an exemption blocked them.
5. **Check the lecture before saying how it uses the paper.** Lecture 6 introduces the seven functions, but its carbon capture case is assessed with a longer list from another paper (with materialisation), so "the lecture uses them to assess the case" was wrong.
6. **Fix a misspelt name from the paper's own author list or references, and declare it.** The text says "Kuhlman", but Stefan Kuhlmann is one of the paper's five authors (page 413, reference 1). Write Kuhlmann and add a `<!-- sourced: -->` line.

The P09 draft also repeated earlier problems:
- **An added cause.** "Because seven functions allow many interactions but few starting points" the authors find three motors. The page says the three come from their empirical work.
- **One example's finding was attached to another.** The page 422 biofuels example is about firms that lobbied together while competing for R&D money; the point about incumbents being more active than start-ups is a separate finding.
- **A page reference pointed to the wrong page** (page 426 for a claim made on page 425).

### 2026-10-21, P10 (WorkBuddy), batch R2-W check by Claude Code

P10's audio was genuine and every number checked out. Claude fixed eleven content problems. New lessons:
1. **"Not least because" must give the page's reasons.** The brief said momentum was positive because of legitimacy gains and Longship's value chain. Page 10 gives large-scale project launches and a growing number of actors. When the paper says why, use its reasons; if you add a related finding from another page, give it its own sentence and page.
2. **Say what each data source did.** Of the two workshops, only the September 2022 one validated the findings; the December 2021 one supplied notes and observations. Don't merge two sources into one role.
3. **"The earlier study" is not "the last study".** Van Alphen and colleagues did the earlier TIS study of Norwegian CCS; Normann (2017) also studied it, on page 3. Superlatives (last, only, first) need the page's support.
4. **Report a quotation's claim, not a neighbouring one.** The White Paper says Norway can play an important role in developing CCS, not that CCS is "an important part of the climate solution".
5. **An evaluation word covers what the paper evaluates.** "Positive externalities are mixed" was wrong: the page says they are present, and only learning across projects is mixed. Don't let one weak part stand for the whole function.
6. **Match the strength of the informants' view.** "Slightly concerned" is not "expect a gap"; "a key driver" is not "driven by".
7. **Don't give the paper the lecture's advice.** "The paper answers: aim policy at the weak functions" is the lecture's line. Say what the paper itself says (page 3: detailed policy recommendations; page 10: a broader policy mix), and credit the rest to the lecture.

The P10 draft also repeated earlier problems:
- **An added cause** on page 1 ("Because value chains need many actors ..., the authors approach this as socio-technical change").
- **Half-pages left out:** institutions on page 4; the strengthened direction of search and experimentation on page 10, which also left chapter 4's check answer incomplete.
- **Who did what:** the amine solutions were developed and tested *at* TCM, not *by* it.
- **A count was wrong:** page 14 has three quotes, not two.

### 2026-10-22, P17 (WorkBuddy), reviewed early and fixed by Claude Code

P17's audio was genuine, and its two `sourced` lines were right: the Figure 1 map does label Bergen and Stavanger. Claude fixed ten content problems. New lessons:
1. **Keep the page's own verdicts.** Sentences that start "we find", "we believe", "in sum", "thus" or "it can be argued" carry the page's main point, and three of them were missing:
   - page 276: TCM sparked surprisingly little commercial activity, which the authors explain by national processes and the technology;
   - page 277: the national strategy resembles a breakthrough strategy;
   - page 283: the regional level can be less influential than EEG expects.

   Check every such sentence against your summary before you run the checker.
2. **Keep the expectation the design tests.** Page 274 says that, on EEG's terms, two technologies in the same region should be similarly influenced. The two cases answer exactly that, so it belongs in the summary.
3. **State the paper's own research questions.** The paper asks how EEG explains new industries and how TIS can inform it. Don't rephrase them into a different question ("how green industries emerge").
4. **Reported is not claimed, and future is not past.** "It is anticipated that seventy ferry lines…" is not "the authors expect". Facilities that "will capture and store" are not "storing" yet. Counts that include ships "under construction" must say so.

The P17 draft also repeated earlier problems: an exam link credited to the paper instead of marked as our own reading; an overstatement ("explain" for "are important for explaining"); and a page reference stretched to cover a point made on another page.

### 2026-10-22, P03 (Antigravity), reviewed early and fixed by Claude Code

P03's audio was genuine and its names and numbers checked out. Claude fixed twelve content problems. New lessons:
1. **Attach an outcome to the driver the page gives.** The brief said cluster accreditation "enabled" forty to fifty oil and gas suppliers to cross over into fish farming. Page 23 gives the market (oil prices fell, salmon prices rose) and a crossover programme. The number comes from one intermediary, and the firms supply fish farming *in addition to* oil and gas. Say who gives a number, and keep its scope.
2. **Report a mechanism in the page's order and scope.** Rogaland's cycle on page 24 runs: oil prices recover after a recession, low costs bring high margins, and the petroleum sector bounces back. "High profits locked the region…, causing the economy to bounce back whenever prices recovered" reverses the order and widens the scope.
3. **A limitation is what the authors say limits their study.** "A thick, diversified system is not a sufficient precondition" is a finding. The authors' caveats were missing: the two regions differ in industrial history (page 25), and more dialogue with interviewees might have improved validity (page 19). Look for "it is important to keep in mind", "might have increased", "a risk of missing".
4. **Don't chain separate histories into one cause.** Bergen's Hanseatic trade did not "foster" its hydropower metallurgy and fjord tourism; page 19 gives each its own origin.
5. **Define the title's concepts where the paper does.** Green industrial restructuring is defined on page 17, and Lecture 9 cites that page, yet the page summary left it out. Typologies that later pages use (interactive networking, dirigiste) belong on the page that introduces them.

The P03 draft also repeated earlier problems:
- the introduction's preview of the findings (page 15) and the analytic point of page 21 (change agency, then reproductive agency) were left out;
- reference-list names were used as filler on page 26;
- an exam link was not marked as our own reading.

### 2026-10-22, P11 (WorkBuddy), reviewed early and fixed by Claude Code

P11's audio was genuine, and its four `sourced` numbers were right: the Table 1 picture shows 8,854. WorkBuddy did well to report the paper's own inconsistency (keyword thresholds of 7 on page 1118 and 3 on page 1119) instead of hiding it. The one-chapter-at-a-time order also stopped the earlier loop. Claude fixed nine content problems. New lessons:
1. **A table page needs every block of the table.** Page 1124 holds Table 3's cluster A *and* cluster B blocks, but the draft gave cluster B four words ("Cluster B follows on openness"). Page 1126 had the same gap in its text half. "X follows" is not a summary: say what X contains, briefly.
2. **Credit claims a review paper reports to the authors it cites.** A review is mostly other people's findings. "The paper calls crowdfunding an embodiment of open innovation" is Stanko and Henard's view. "The most popular relational technique" is Akbari's, and the platform link to 2010 is Shneor and Vik's. Use "following X" or "citing X".
3. **If a check question names an author, the chapter must name them too.** Chapter 3 asked about Stanko and Henard's findings, but the chapter never mentioned them.
4. **Check the lecture's own exam paragraph before writing ours.** The Bonus lecture already suggests crowdfunding communities as a form of agency for December 2024's Question 2. Credit the lecture with that link, then give an example that is really our own. Read the sentence back too: "An answer… asked how agency…" was garbled.
5. **Keep the paper's hedges in implications.** "We posit that links with social media could be helpful" is not "links with social media improve project performance".

The P11 draft also repeated earlier problems:
- a key finding left out (Chan and Parhankangas: backers join campaigns they see as familiar and feasible, on page 1115);
- a page reference pointing to the wrong page (the "holistic view" is on page 1127, not 1121);
- a term from another reading ("cultural-creative crowdfunding" is P12's term) used for P11's map.

### 2026-10-22, P12 (WorkBuddy), reviewed early and fixed by Claude Code

P12's audio was genuine and recorded after the last text edit, and its `sourced` line for the broken accent in "Négrier" was right. WorkBuddy did well to flag that Table 1 and page 10 disagree; they actually swap the pre-2009 and post-2015 counts (10 and 8 against 8 and 10). Claude fixed ten content problems, plus one of its own in P11. New lessons:
1. **In a findings section, the findings come first.** Page 8 gave six lines to the database and one to the expert panels, and left out what the panels concluded. Page 10 kept the counts but dropped the authors' argument (subscription as alternative income). When a page reports both numbers and an argument, the argument is the point; the numbers support it.
2. **State the paper's main assumption, and say when the paper confirms it.** "Our main assumption is…" (page 3) and "confirms our main assumption" (page 12) are the paper's spine, and both were missing. So was the reason the typology is a diagram: strict clustering "proved rather ineffective".
3. **Describe the main figure.** Figure 3 is the paper's main output, but page 11 gave it four words. Open the picture, name its parts, and list every branch (one, "white-label co-financing", was missing everywhere).
4. **Our own examples stay ours.** The Bonus lecture page offers crowdfunding communities as agency "as an example of our own, not from the lecture". A reading must not turn that into "the lecture offers". Claude made the same slip in its P11 fix, and has corrected it.
5. **Check every check question against the other chapters.** Chapter 3 repeated chapter 1's question word for word. Each chapter needs its own question.

The P12 draft also repeated earlier problems:
- a superlative ("the first platform" for "one of the first");
- an overstated gap ("nothing defines" for "a gap in understanding and defining");
- a limitation the brief cites but the page summary leaves out (page 6);
- a hedge dropped ("could indicate" on page 12).

### 2026-10-22, P04 (Antigravity), batch R2-A check by Claude Code

P04's audio was genuine and recorded after the last text edit. Claude fixed ten content problems and one error in its own plan: P04 is used most in Lecture 1 (pages 1, 3, 6, 7), and also in Lectures 2 and 9, but the plan and catalog listed only Lecture 2. New lessons:
1. **Use the paper's key term, even if the checker counts it as inflated.** P04's argument is a *paradigm* shift, and page 4 defines a paradigm. The draft wrote "shared worldview" instead, which changed the meaning. "Paradigm" is on the inflated-word list, so `check_reading.py` now exempts a paper's own defined term (OWN_TERMS; only P04's "paradigm" so far). If you meet another such term, say so in your report; don't swap in a different concept.
2. **No limitations the paper doesn't state.** The brief listed "limits" that were in fact a research question ("including all stakeholders guarantees neither consensus…") and a closing quote about uncertainty. If the paper names no limitations of its own, say exactly that.
3. **A research question is not a finding.** "Responsibility must be shared" is the paper's research question 5. "Legitimacy requires participatory governance" goes beyond page 6, which says bottom-up participation cannot guarantee the right solutions either.
4. **The first page includes the abstract.** Page 1's summary skipped the abstract (aim, the call for a paradigm shift, the research agenda) and borrowed its last sentence from page 2.
5. **Check every lecture that uses the paper.** Search all of `lectures/` for the authors' names before writing the course paragraph. The plan's own list can be wrong, as it was here.

The P04 draft also repeated earlier problems:
- a "to sum up" verdict left out (page 7);
- a list cut short (page 9 dropped two of its seven research questions);
- a hedge dropped ("in principle" on page 10);
- a definition garbled (Niosi's, page 2);
- exam links not marked as our own reading.

### 2026-10-22, P13 (WorkBuddy), batch R3-W check by Claude Code

P13 was WorkBuddy's best paper so far. The audio was genuine, and the `Lánzanos` declaration was right. Both content flags were correct: page 60 says eight actors but names seven, and "680.037" is printed that way. The account of the Bonus lecture's slide 38 matched the lecture, including the example marked as ours. Claude fixed seven problems. New lessons:
1. **If you say "three propositions follow", state them.** The brief said the results "confirm their three propositions", and page 48 said "three propositions follow", but neither said what they were. Whenever a summary refers to a list (propositions, research questions, hypotheses), name its items on the page that sets them out.
2. **Don't say a paper ignores a topic until you have searched it.** "This paper does not discuss sustainable transformation" was too strong: page 48 says the model "supports sustainability and continuous change", and page 60 calls for research on sustainable ecosystems. Before writing "the paper does not…", search the page files for the word.
3. **Check whose term it is, sentence by sentence.** On page 58, Edvardsson is cited for institutionalisation, but "a conflictual form of value cocreation" is Laamanen and Skalen's.
4. **Clean up after a failed recording.** A failed six-chapter run left `site/audio/P13-06.mp3` behind. If you change the chapter split, tell Claude which audio files no longer belong to the reading; Claude moves them out, because you must not delete files. Also avoid chapters under about 60 words: a very short clip reads below the 105 wpm floor because of the fixed silence at each end.

The P13 draft also repeated earlier problems:
- a page's own finding left out (page 56: which forms of cocreation are most common at the micro level);
- the authors' claimed contribution left out (page 59);
- the paper's structuring device (the five-step planning framework) left out of the brief.

### 2026-10-23, P05 (Antigravity) and P06–P08 (WorkBuddy), batch R3-A check by Claude Code

All four passed the checker, and all 24 recordings were genuine. WorkBuddy's pre-review of 23 October checked names and numbers well. It was not independent, though, because WorkBuddy wrote P06–P08, and it did not check coverage, hedges or attribution. Claude found and fixed about 25 problems there. Lessons for any later paper:
1. **A self-review checks the facts, not the reading.** Names and numbers can all be right while a page summary misses half the page, drops "if they succeed", or presents a practitioner's view as the paper's. Review coverage, hedges and attribution separately from facts.
2. **Table-only pages get a description, not commentary.** P07's correlation-table pages said "fragile", "the point they want" and "awkward for any claim…". Describe what the table shows. Repeat the authors' own reading of it (for example, high autocorrelation as path dependence) and nothing else.
3. **Every brief names its lecture and an exam question.** P07's and P08's briefs had neither. The plan (section 6) requires the companion lecture by number and a real exam question, marked as our own reading when the link is ours.
4. **Check a scanned paper's facts against a second source.** P05's page 333 said Blue Maritime and Seafood got cluster status in 2006. The page and the independent OCR both say the maritime and subsea clusters became NCEs in 2006 and GCEs in 2014 and 2015.
5. **A limitation of the field is not a limitation of the study.** P05's brief called the field's missing method "an explicit limitation"; the chapter's own caveat (the Ulstein conversation was not designed for this question) was left out.
6. **Keep the hedges on initiatives and on evidence.** Examples: "if they succeed, they will be path creation" (P05); "indications of tendencies, not direct tests of causal mechanisms" (P07); "some evaluations found distortions" (P08).

The drafts also repeated earlier problems:
- pages that slid onto their neighbours (P06 pages 155 and 160–161);
- verdicts and predictions left out (P05 page 343, P06 page 164, P07 page 827);
- half-pages missing (P08 page 1101);
- reference-list filler with an evaluative claim (P07, P08).
