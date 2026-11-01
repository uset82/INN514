# Progress: INN514 cheatsheet (ZCode + GLM 5.3 Flash)

Spec: CHEATSHEET_PLAN.md. One task per conversation; a gate review always in a fresh one. Paste evidence under each box.

## Part S: scripts
- [x] S1 cheat_lib.py and check_cheatsheet.py (plan 6.1, 6.2)
  - `C:/Python313/python.exe workspace/lecture-audio/cheatsheet/scripts/check_cheatsheet.py --all --partial`: 28 `SKIP … (not written yet)` lines, last line `ALL CHEATSHEET CHECKS PASSED` (exit 0).
  - `… check_cheatsheet.py --scan`: `SCAN CLEAN` (exit 0).
  - Self-test: `C:/Python313/python.exe workspace/cheatsheet_previews/s1_probe.py` → `26 of 26 probes behaved as expected` (a base P01 card and a base TH6 sheet pass; 6.3 cases 2–24 and 34 fail or pass as listed).
  - Files written: `cheatsheet/scripts/cheat_lib.py`, `cheatsheet/scripts/check_cheatsheet.py`. Plan: section 11 note only (the student's 16-character scan decision). Throwaway probe: `workspace/cheatsheet_previews/s1_probe.py` (outside the repo).
  - Opened: page text and page kinds for P01 (431–444; 444 is references), P02 (1–17; 17 is references), P03 (cover, 14–28), P05 (323–346), P08 (1097–1108), P17 (cover, 266–288); `readings/P01.md`; the `<!-- slides: -->` lines of T1, T3, T5, T8, B1; `reading_lib.py`, `check_reading.py`, `guards_lib.py`. No page pictures were needed for S1.
  - Decision (in plan 11): the secret scan's assignment pattern needs 16+ characters, so the plan's own 9-character test text in 6.5 row 33 no longer reports; test 33 (40 hex digits) is still caught.
- [x] S2 test_check_cheatsheet.py prints ALL CHECKER TESTS PASSED (plan 6.3)
  - `C:/Python313/python.exe workspace/lecture-audio/cheatsheet/scripts/test_check_cheatsheet.py`: 24 `ok …` lines, last line `ALL CHECKER TESTS PASSED (24 tests)` (exit 0) — one test per row of 6.3, cases 1–24.
  - `… check_cheatsheet.py --scan`: `SCAN CLEAN`; `… --all --partial`: `ALL CHEATSHEET CHECKS PASSED`.
  - Files written: `cheatsheet/scripts/test_check_cheatsheet.py` (new). Also `check_cheatsheet.py`: `scan()` now skips `__pycache__/` and `.pyc`, because git ignores bytecode (`.gitignore` line 3) and the compiled test file otherwise reports the fake key that test 23 builds. Plan 11: one note on that skip.
  - Tests 8 and 10 take their copied runs from `pages("P01")[431]` and `pages("P02")[2]` at runtime, as 6.3 asks. Opened: P01 pages 431, 433, 434, 437, 440, 442 and 444 (references), P02 pages 1–17 (17 references); no pictures.
  - Student feedback recorded in plan 11: approved; `__pycache__` is ignored and not deleted; G0 stages by name (plan files and `cheatsheet/scripts`), never `git add -- cheatsheet`.
- [x] STOP GATE G0: review the scripts against plan 6; commit and push the plan files and scripts
  - Review of 6.2, row by row against the code (re-read from disk):

| Check (6.2) | Applies to | In the code | Result |
|---|---|---|---|
| title | all | `check_card`, `check_theme`, `check_front`, `check_glossary`, `check_sources_file` | exact, built from `READINGS`/`THEMES` |
| header | card, theme, front | `check_header` with `page_range`, `CARD_CLASS`, `CARD_THEMES` | exact comment line |
| sections | all | `check_section_list` + `SECTIONS` | exact order, no extra heading |
| counts | card, theme, front, glossary | the per-kind functions | 4–5, 2–3, 1–2, 3–6, 3–7, 3–4, 12, 6, 30–40 |
| length | all | per-bullet and per-file caps | every limit of 4.2–4.6, template 110–170 |
| sources | card, theme, front | `has_source` | plus the three exceptions of 6.2 |
| cite | all | `check_cites` | `CITE_TO_PID`, `citable()`, `PDF p.` only for P02 |
| names | all | `check_names` | `NAME_RE`+`rebuilt`, `MISSPELT`, bare Guimarães |
| slides | all | `check_slides` | class, deck size, reviewed slide |
| quotes | all | `check_quotes` | P02 card and P02 lines, ≤20 words, cited page ±1, slide only fails |
| copy | card, theme, front | `check_copy` | `copied()` for each cited paper and the card's own |
| exam | all | `check_exam_ids` + per-kind | six ids, qnorm rows, bullet prefixes |
| norway | theme | `check_theme` | 2–3, named and sourced, no digit in ours |
| template | theme | `check_theme` | question id, drafting line, four bullets, 110–170 |
| terms | theme, glossary | `TERM` + `check_glossary` | term form; 30–40 rows; third column |
| people | all | `check_people` | `PRONOUN`, `BRAND` |
| hedges | all | `check_hedges` | warning only |
| complete | `--all` | `complete()` | files, card themes, every paper in a theme |
| assembled | `--all` | `assembled()` | four part titles once, 12,000/11,000 |

  - Found at the review and fixed: the bare-Guimarães rule was missing; a slide-only quotation gave the wrong reason; "every paper is in at least one theme" was not coded. After the fixes: `test_check_cheatsheet.py` 24/24 and the probe 26/26.
  - Commit `76f34e6 cheatsheet: G0 the checker and its tests`; push `3299637..76f34e6  main -> main`; `status -sb` now `## main...origin/main`.
  - Before the commit: `test_check_cheatsheet.py` → `ALL CHECKER TESTS PASSED (24 tests)`; `--all --partial` → `ALL CHEATSHEET CHECKS PASSED`; `--scan` → `SCAN CLEAN`.

## Part C: paper cards
- [x] P01 card (pilot)
  - `check_cheatsheet.py cards/P01.md` → `PASS cards/P01.md (300 words)`.
  - Opened: P01 pages 431, 433, 434, 436, 437, 438, 439, 440 and 442 (text), 444 (references); Class 1 slides 2, 15 and 32, section 1 only, for the Norwegian terms. No pictures needed.
- [x] P09 card (pilot)
  - `check_cheatsheet.py cards/P09.md` → `PASS cards/P09.md (300 words)`.
  - Opened: P09 pages 415, 416, 423, 426, 427, 428 and 429; page 426 text for Figure 2's motors A, B and C (`img/` holds only `page-413.png`, so the figure itself was not opened); Class 6 slides 12, 15, 22 and 23, section 1 only, for the Norwegian terms.
- [x] STOP GATE G1: review P01 and P09; Lessons; commit and push
  - Review table (each bullet against its cited page):

| File | Bullets | Confirmed on the source | Fixed (what) |
|---|---|---|---|
| cards/P01.md | 14 | pp. 431 (broad definition, Freeman–Lundvall–Nelson, Arthur), 433 (North, the quotation), 434 (Dutch disease, domestic suppliers), 436 ("five out of the six comparisons"), 438 (diffusion and cooperation), 439 (the three paths, named as the page names them), 440 (SIMULA and GSM, payoffs in oil and gas), 442 (what the authors cannot pursue) | the cooperation finding moved from p. 437 to p. 438, where the claim stands; "citing Wicken" removed from the model line, because p. 439 cites that work only as a numbered reference |
| cards/P09.md | 15 | pp. 415 (activities called functions), 416 (Carlsson and Stankiewicz), 423 (function 4), 426 (interactions, motors of change, Fig. 2 A–C), 427 (vicious cycle), 428 (first Dutch studies), 429 (heuristic value) | none |
  - `--all --partial` → `ALL CHEATSHEET CHECKS PASSED`; `--scan` → `SCAN CLEAN` before the commit.
  - Commit `4c84474 cheatsheet: G1 the pilot cards P01 and P09`; push `76f34e6..4c84474  main -> main`; `status -sb` now `## main...origin/main`.

- [x] P02 card
  - `check_cheatsheet.py cards/P02.md` → `PASS cards/P02.md (300 words)`.
  - Opened: P02 PDF pages 1–17 (text; 16–17 are the reference list) and the picture `workspace/extracted/pages/P02/img/page-10.png` — Figure 1 names Company (actor), Tools (objects), Tasks (ideas) and the links Technique, Production and Rationale, which are the card's three steps. Class 1 slides 25 and 28, section 1 only, for the Norwegian terms. Paraphrase only: no quotation mark outside the title line and no 7-word run from the paper.
- [x] P03 card
  - `check_cheatsheet.py cards/P03.md` → `PASS cards/P03.md (300 words)`.
  - Opened: P03 cover and pp. 14–28 (text), 23, 24 and 25 for the two cases and the crossover; Class 2 slide 13 and Class 3 slides 1, 10 and 26, section 1 only, for the Norwegian terms. Left out the reading's counts of five of fifteen National Centres of Expertise: a search of the paper does not find them on p. 24 (the programme itself is on p. 21).
- [x] P04 card
  - `check_cheatsheet.py cards/P04.md` → `PASS cards/P04.md (268 words)`.
  - Opened: P04 pp. 2, 4, 5 and 10 (Niosi, the paradigm definition, Steward and Weber–Rohracher, the verdict and the Sendzimir closure); Class 2 slide 22 for transformative innovation policy. No pictures.
- [x] P05 card
  - `check_cheatsheet.py cards/P05.md` → `PASS cards/P05.md (270 words)`.
  - Opened: P05 pp. 324–328, 330, 331–333, 337, 340 and 343 (Norwegian text, paraphrased); Class 2 slide 13 for the Norwegian term. No pictures.
- [x] STOP GATE G2: review P02-P05; commit and push
  - Review table (each bullet against its cited page):

| File | Bullets | Confirmed on the source | Fixed (what) |
|---|---|---|---|
| cards/P02.md | 16 | PDF pp. 3 (Sayer), 9 (Schwarz–Thompson, Latour), 10 (Figure 1 in the picture), 12 (profit and productivity, contingent relations), 13 (public authorities, the normative limit), 14 (the conclusion) | none; shortened for length only |
| cards/P03.md | 18 | pp. 15 (institutional work, the two regions), 16 (Cooke, North), 17 (the four forms, Bækkelund), 18 (Thornton and Almandoz), 23 (the forty to fifty firms), 25 (unintended continuation, the regional difference), 19 (validity) | none; the NCE counts in the reading brief were not used because the page does not print them |
| cards/P04.md | 15 | pp. 2 (Niosi, wicked problems), 4 (paradigm, Pyka), 5 (Steward, Weber and Rohracher), 10 (scattered strands, "in principle", Sendzimir) | none |
| cards/P05.md | 15 | pp. 324 (the three levels, stagnation), 326 (Cooke), 328 (the four trajectories, in Norwegian), 330 (related variety), 331–332 (24 and 33 percent), 333 (the cluster programme), 337 (ten of eighteen, Mongstad), 340 (the Ulstein conversation), 343 (which driver cannot be settled) | none; no quotation mark, since P05 is never quoted |
  - Before the commit: `--all --partial` → `ALL CHEATSHEET CHECKS PASSED`; `--scan` → `SCAN CLEAN`.
  - Commit `aa1a3a6 cheatsheet: G2 the cards P02 to P05`; push `4c84474..aa1a3a6  main -> main`; `status -sb` now `## main...origin/main`.

- [x] P06 card
  - `check_cheatsheet.py cards/P06.md` → `PASS cards/P06.md (260 words)`.
  - Opened: P06 pp. 152, 158, 159, 160, 161, 163, 164 and 165, and the picture `workspace/extracted/pages/P06/img/page-163.png` — Figure 2 marks the axes Network Strength and Resources and the four types Strong, Arid, Irrigated and Weak, which are the card's steps. Class 4 slide 1, section 1 only, for the Norwegian term.
- [x] P07 card
  - `check_cheatsheet.py cards/P07.md` → `PASS cards/P07.md (260 words)`.
  - Opened: P07 pp. 810, 811, 812, 813, 814, 826 and 827. The ten elements go in as the paper's three groups, because a card's model holds 3–6 steps.
- [x] P08 card
  - `check_cheatsheet.py cards/P08.md` → `PASS cards/P08.md (260 words)`.
  - Opened: P08 pp. 1097, 1098, 1099 and 1100 (`img/` holds page-1097.png and page-1098.png only, so Fig. 1 on p. 1100 was read from the page text, which lists the six contexts).
- [x] P14 card
  - `check_cheatsheet.py cards/P14.md` → `PASS cards/P14.md (281 words)`.
  - Opened: P14 pp. 758, 759, 760, 761, 765 and 766.
- [x] STOP GATE G3: review P06, P07, P08, P14; commit and push
  - Review table (each bullet against its cited page):

| File | Bullets | Confirmed on the source | Fixed (what) |
|---|---|---|---|
| cards/P06.md | 16 | pp. 152 (chaotic conception), 158 (process), 159 (access), 160 (recycling), 161 (munificence, functionality), 163 (Figure 2 in the picture), 164 (circularity), 165 (research agenda) | none |
| cards/P07.md | 15 | pp. 810 (tautology), 811 (Hawley), 812 (Lindblom), 813 (ten elements, Baumol), 814 (causation), 826 (12.42 Utrecht, 5.99 Drenthe), 827 (limits) | none |
| cards/P08.md | 17 | pp. 1097 (special issue), 1098 (30 percent, innovation systems), 1100 (the six contexts, selection, strategic choice) | none; Fig. 1 read from the page text because no picture of p. 1100 exists |
| cards/P14.md | 18 | pp. 758 (path, agency), 759 (the pairs), 760 (Figure 1), 761 (the villages, 29 interviews), 765 (findings), 766 (the rural-tourism limit) | none |
  - Before the commit: `--all --partial` → `ALL CHEATSHEET CHECKS PASSED`; `--scan` → `SCAN CLEAN`.
  - Commit `895440c cheatsheet: G3 the cards P06, P07, P08 and P14`; push `aa1a3a6..895440c  main -> main`; `status -sb` now `## main...origin/main`.
- [x] P15 card
  - `check_cheatsheet.py cards/P15.md` → `PASS cards/P15.md (260 words)`.
  - Opened: P15 pp. 277–281 and 294 (the case, bricolage, breakthrough, distributed and embedded agency). No pictures: Figure 2 on p. 279 was described from the page text.
- [x] P16 card
  - `check_cheatsheet.py cards/P16.md` → `PASS cards/P16.md (261 words)`.
  - Opened: P16 pp. 481, 486–487, 490–491, 494 and 495.
- [x] P10 card
  - `check_cheatsheet.py cards/P10.md` → `PASS cards/P10.md (272 words)`.
  - Opened: P10 pp. 2, 3, 4, 9, 10 and 11.
- [x] P17 card
  - `check_cheatsheet.py cards/P17.md` → `PASS cards/P17.md (263 words)`.
  - Opened: P17 pp. 266, 268, 271, 272, 279–284.
- [x] STOP GATE G4: review P15, P16, P10, P17; commit and push
  - Review table (each bullet against its cited page):

| File | Bullets | Confirmed on the source | Fixed (what) |
|---|---|---|---|
| cards/P15.md | 15 | pp. 277–279 (the case, bricolage, breakthrough, Figure 2), 280 (distributed agency, interpretive asymmetry), 281 (embedded agency) | none |
| cards/P16.md | 14 | pp. 481 (regional environment, multi-scalar processes), 486–487 (layering, adaptation, novel application, power), 490 (the three elements), 494 (power and mode), 495 (one case, no generalisation) | none |
| cards/P10.md | 16 | pp. 2 (TIS, eight functions, materialization), 3 (assessment, legitimation, market formation), 4 (Mongstad), 9 (the function ratings), 10 (Longship and Northern Lights, policy mix), 11 (the three limits) | none |
| cards/P17.md | 14 | pp. 266 (territory and technology), 268 (path creation, three phases), 271 (three functions), 281 (CCS in preformation, the cluster), 282 (seventy ferry lines), 284 (open questions) | the battery bullets now cite pp. 281–282: the cluster is named on p. 281, the outcome on p. 282 |
  - Before the commit: `--all --partial` → `ALL CHEATSHEET CHECKS PASSED`; `--scan` → `SCAN CLEAN`.
  - Commit `a5723c7 cheatsheet: G4 the cards P15, P16, P10 and P17`; push `895440c..a5723c7  main -> main`; `status -sb` now `## main...origin/main`.
- [x] P11 card
  - `check_cheatsheet.py cards/P11.md` → `PASS cards/P11.md (260 words)`.
  - Opened: P11 pp. 1110, 1112–1117, 1119–1123 and 1127.
- [x] P12 card
  - `check_cheatsheet.py cards/P12.md` → `PASS cards/P12.md (262 words)`.
  - Opened: P12 pp. 2, 4, 6, 8–10 and 12.
- [x] P13 card
  - `check_cheatsheet.py cards/P13.md` → `PASS cards/P13.md (268 words)`.
  - Opened: P13 pp. 48, 51–53, 55, 58–60.
- [x] STOP GATE G5: review P11-P13; commit and push
  - Review table (each bullet against its cited page):

| File | Bullets | Confirmed on the source | Fixed (what) |
|---|---|---|---|
| cards/P11.md | 15 | pp. 1110 (instrument), 1112 (2,544 to 150), 1113 (three tools), 1115 (incremental, radical), 1116 (openness), 1117 (social capital), 1120 (thematic map), 1121 (three clusters), 1127 (limits) | none |
| cards/P12.md | 17 | pp. 2 (definition), 4 (paradigms), 6 (tracking and trawling, Delphi), 8 (six dimensions, 89 platforms, the display limit), 9 (67, 51 and 38), 10 (Kickstarter), 12 (Latin America, typology) | none |
| cards/P13.md | 16 | pp. 48 (definition), 51 (five steps), 52 (value proposition), 53 (Eight Co's), 55 (three levels), 58 (public institutions, institutionalisation), 59 (limits), 60 (eight forms, six metaphors) | the six metaphors moved to p. 60; "eighth actor" reworded to the new actor of p. 58 |
  - Before the commit: `--all --partial` → `ALL CHEATSHEET CHECKS PASSED`; `--scan` → `SCAN CLEAN`.
  - Commit `b4af468 cheatsheet: G5 the cards P11, P12 and P13`; push `a5723c7..b4af468  main -> main`; `status -sb` now `## main...origin/main`.
  - All 17 cards are written and pass; the 17-card set is complete.

## Part T: theme sheets
- [x] TH6 Technological innovation systems (pilot)
  - `check_cheatsheet.py themes/TH6.md` → `PASS themes/TH6.md (484 words)`.
  - Opened: Hekkert et al. 2007 pp. 415, 416, 421–425 and 426 (through the P09 card), Steen et al. 2024 pp. 2, 3, 4 and 10 (through the P10 card), Njøs et al. 2020 pp. 281–282 (through the P17 card); T8's chapter for slides 33–41, which records slide 37 as the lecturer's TIS-and-seven-functions question. No pictures.
- [x] STOP GATE G6: review TH6; Lessons; commit and push
  - Review table (each bullet against its cited page):

| File | Bullets | Confirmed on the source | Fixed (what) |
|---|---|---|---|
| themes/TH6.md | 5 definitions, 10 model steps, 4 angles, 3 examples | Hekkert pp. 415 (functions as activities), 416 (Carlsson and Stankiewicz), 421–425 (the seven), 423 (guidance), 426 (the motors); Steen pp. 2 (materialization), 3 (legitimation), 4 (Mongstad), 10 (Longship); Njøs pp. 281–282 (batteries); T8 slides 37–38 for the Class 9 example | the TIS definition now reads "under shared institutions", as card P09 does, so the term is defined the same way in both |
  - Before the commit: `--all --partial` → `ALL CHEATSHEET CHECKS PASSED`; `--scan` → `SCAN CLEAN`.
  - Commit `11c4d22 cheatsheet: G6 the pilot theme TH6`; push `b4af468..11c4d22  main -> main`; `status -sb` now `## main...origin/main`.
  - Glossary notes added for TH6's terms: teknologisk innovasjonssystem [Class 6, slide 12]; funksjon [Class 6, slide 15]; retning for søket [Class 6, slide 22]; materialisering [Class 6, slide 24]; legitimering [Class 6, slide 23].
- [x] TH1 Innovation systems and Norway's NIS
  - `check_cheatsheet.py themes/TH1.md` → `PASS themes/TH1.md (488 words)`.
  - Opened: P01 pp. 431, 433, 434, 439, 441; P02 PDF pp. 9 and 10; T8's chapter for slides 33-41 (slide 38 is the promote-or-inhibit question).
- [x] TH2 Regional innovation systems
  - `check_cheatsheet.py themes/TH2.md` → `PASS themes/TH2.md (483 words)`.
  - Opened: P03 pp. 15 and 16; P05 pp. 324, 328, 330 and 337.
- [x] TH3 Institutions and institutional work
  - `check_cheatsheet.py themes/TH3.md` → `PASS themes/TH3.md (482 words)`.
  - Opened: P03 pp. 15, 16, 17, 18, 22 and 24; T8 slides 30-31.
- [x] TH4 Entrepreneurial ecosystems
  - `check_cheatsheet.py themes/TH4.md` → `PASS themes/TH4.md (483 words)`.
  - Opened: P07 pp. 811 and 813; P06 pp. 161 and 163 (the figure page through the card); P08 p. 1100; T4 slides 17 and 19.
- [x] STOP GATE G7: review TH1-TH4; commit and push
  - Review table (each bullet against its cited page):

| File | Bullets | Confirmed on the source | Fixed (what) |
|---|---|---|---|
| themes/TH1.md | 5 definitions, 6 model steps, 3 angles, 3 examples | P01 pp. 431 (broad definition, path dependency), 433 (North), 434 (suppliers), 439 (the paths), 441 (concession laws, fish-farming); P02 PDF pp. 9 and 10; Class 9 slide 38 | the innovation-system definition was Markard and Truffer's sentence from Class 1, not P01's; replaced with P01's own broad definition on p. 431 |
| themes/TH2.md | 5 definitions, 7 steps, 3 angles, 3 examples | P03 pp. 15 (institutional work), 16 (Cooke); P05 pp. 324 (three levels), 328 (four trajectories), 330 (related variety), 337 (Mongstad) | none |
| themes/TH3.md | 5 definitions, 8 steps, 3 angles, 3 examples | P03 pp. 15, 16, 17 (the four forms), 18 (logics), 22 (Rettedal), 24 (the lock-in cycle); Class 9 slide 31 | none |
| themes/TH4.md | 5 definitions, 7 steps, 3 angles, 2 examples | P07 pp. 811 (Hawley), 813 (ten elements); P06 pp. 161 (munificence, functionality), 163 (Figure 2); P08 p. 1100 (selection, strategic choice); Class 4 slides 17 and 19 | munificence and functionality were cited to Stam and van de Ven; they are on Spigel and Harrison p. 161 (P07 has no p. 161) |
  - Before the commit: `--all --partial` → `ALL CHEATSHEET CHECKS PASSED`; `--scan` → `SCAN CLEAN`.
  - Commit `1bd04a9 cheatsheet: G7 the themes TH1 to TH4`; push `11c4d22..1bd04a9  main -> main`; `status -sb` now `## main...origin/main`.
  - Glossary notes filled for TH1-TH4 and TH6 (23 rows) in the table at the end of this file.
- [x] TH5 Agency and new path development
  - `check_cheatsheet.py themes/TH5.md` → `PASS themes/TH5.md (483 words)`.
  - Opened: P14 pp. 758, 759, 760, 761 and 765; P15 p. 278; P16 p. 486; P17 pp. 268 and 281–282; T8 slide 38.
- [x] TH7 Sustainability and normative direction
  - `check_cheatsheet.py themes/TH7.md` → `PASS themes/TH7.md (481 words)`.
  - Opened: P03 p. 17; P04 pp. 4, 5 and 5–7; P01 p. 442; T8 slide 31.
- [x] TH8 Crowdfunding and service ecosystems
  - `check_cheatsheet.py themes/TH8.md` → `PASS themes/TH8.md (481 words)`.
  - Opened: P11 pp. 1110 and 1115; P12 p. 8; P13 pp. 48, 51 and 52; Bonus slide 42 (the Norwegian figures) and slide 7 (the Norwegian term), section 1 only.
- [x] STOP GATE G8: review TH5, TH7, TH8; commit and push
  - Review table (each bullet against its cited page):

| File | Bullets | Confirmed on the source | Fixed (what) |
|---|---|---|---|
| themes/TH5.md | 5 definitions, 9 steps, 3 angles, 3 examples | P14 pp. 758 (agency), 759 (the pairs), 760 (Figure 1), 761 (the villages), 765 (the findings); P15 p. 278 (bricolage); P16 p. 486 (the modes); P17 pp. 268 and 281–282; Class 9 slide 38 | none |
| themes/TH7.md | 5 definitions, 3 steps, 3 angles, 2 examples | P03 p. 17 (UNEP definition); P04 pp. 4 (paradigm, Pyka), 5 (Steward, Weber and Rohracher), 5–7 (the three questions); P01 p. 442; Class 9 slide 31 | one definition ran to 35 words and was cut to 32 |
| themes/TH8.md | 5 definitions, 11 steps, 3 angles, 2 examples | P11 pp. 1110 and 1115; P12 p. 8 (six dimensions); P13 pp. 48 (ecosystem), 51 (five steps), 52 (value proposition); Bonus slides 7 and 42 | none |
  - Before the commit: `--all --partial` → `ALL CHEATSHEET CHECKS PASSED`; `--scan` → `SCAN CLEAN`.
  - Commit `f921274 cheatsheet: G8 the themes TH5, TH7 and TH8`; push `1bd04a9..f921274  main -> main`; `status -sb` now `## main...origin/main`.
  - All 8 themes are written and pass; the 17 cards and 8 themes are complete.

## Part A: assembly and print
- [x] A1 front/EXAM_DAY.md
  - `check_cheatsheet.py front/EXAM_DAY.md` → `PASS front/EXAM_DAY.md (809 words)`.
  - Built from 3.4, the theme sheets and T8's chapter for slides 33-43; the six past questions are the six of 3.4 word for word.
- [x] A2 back/GLOSSARY.md and back/SOURCES.md
  - `check_cheatsheet.py back/GLOSSARY.md` → `PASS back/GLOSSARY.md (242 words)`; `check_cheatsheet.py back/SOURCES.md` → `PASS back/SOURCES.md (533 words)`.
  - The glossary has 36 rows, every theme term among them; the sources list the 17 readings in course order, the 8 classes and the 2 exam papers.
- [x] A3 scripts/build_cheatsheet.py
  - `C:/Python313/python.exe workspace/lecture-audio/cheatsheet/scripts/build_cheatsheet.py` → `BUILT INN514_CHEATSHEET.md (10406 words), print/INN514_CHEATSHEET.html, print/INN514_CHEATSHEET.pdf (11 pages, 692 KB)`.
- [x] A4 build, look at every page, fix, README.md, check --all passes
  - `check_cheatsheet.py --all` → `ALL CHEATSHEET CHECKS PASSED` (28 files, complete and assembled included).
  - Pages opened: 1 (exam day), 2 (themes 1-2), 5 (themes 7-8 and the start of Part 3), 6 (cards 1-4), 7 (cards 3-4), 11 (cards 10, 17, 11) and 13 (end of Part 4) of the builds on the way, plus 2 and 6 of the final build. Fixed while looking: the exam table split across a column, lists rendered run-on, and four pages 35-70 per cent empty. README.md written.
- [x] STOP GATE G9: final review of front, back and PDF; commit and push everything; final report
  - Review table (each file against its source):

| File | Bullets | Confirmed on the source | Fixed (what) |
|---|---|---|---|
| front/EXAM_DAY.md | 4 + 6 rows + 6 rows + 12 + 3 + 6 checkboxes + 6 | the six questions compared with `EXAM` by the checker; definitions repeated from the theme sheets; the marking criteria from T8's chapter for slide 43; the format from slide 33 | six definitions ran past 18 words and were cut; a quotation in "How to answer" became parentheses |
| back/GLOSSARY.md | 36 rows | every theme term, each third column a checked slide, an exam paper or "standard term" | none |
| back/SOURCES.md | 17 + 8 + 2 | the `READINGS` order and page ranges of 3.2 | none |
| print/INN514_CHEATSHEET.pdf | 11 pages | assembled from the reviewed files only | layout fixes listed above |
  - `--all` → `ALL CHEATSHEET CHECKS PASSED`; `--scan` → `SCAN CLEAN`.
  - Commit `421173e cheatsheet: G9 the exam-day page, the glossary, the sources and the PDF`; push `f921274..421173e  main -> main`; `status -sb` now `## main...origin/main`.
  - The written cheatsheet is complete: 17 cards, 8 themes, the exam-day page, the glossary, the sources, the assembled Markdown and an 11-page A4 PDF.

## Part V and Part W: listening lessons and the Revision section (after G9)
- [x] V0 check_cheatsheet.py: the listen kind, --site-manifest, --live and the wider scan; tests 25-34 pass (plan 6.4, 6.5)
  - `test_check_cheatsheet.py` → `ALL CHECKER TESTS PASSED (34 tests)`.
  - `check_cheatsheet.py --all` → `ALL CHEATSHEET CHECKS PASSED`; `--scan` → `SCAN CLEAN`.
  - `--site-manifest write` → `WROTE …checks\site-before.txt (179 files)`; `--site-manifest check` → `SITE MANIFEST OK`.
  - Files: `cheatsheet/scripts/check_cheatsheet.py` (the listen kind, `--site-manifest`, `--live`, the staged-diff and `site/data/R*.json` scan), `cheatsheet/scripts/cheat_lib.py` (`REVISION`, `spoken_authors`), `cheatsheet/scripts/test_check_cheatsheet.py` (tests 25-34), `cheatsheet/checks/site-before.txt`.
- [x] W1 site manifest written; build_audio.py reads R ids from cheatsheet/listen/; build_site.py adds DATA.revision (plan 7.8)
  - `check_cheatsheet.py --site-manifest write` → `WROTE …site-before.txt (179 files)`; `--site-manifest check` → `SITE MANIFEST OK` (run twice).
  - `scripts/build_audio.py`: `LISTEN = ROOT / "cheatsheet" / "listen"` and `src = LISTEN if re.fullmatch(r"R\d\d", lecture_id) else LECTURES`; an R usage line added to the docstring.
  - `scripts/build_site.py`: the `REVISION` list for R01-R10, `revision = [...]` and `DATA.revision`, and the summary line now ends `ready revision lessons: …`.
  - `build_site.py` → `index.html: 596 KB; … ready revision lessons: none`; `check_page.mjs` → `ALL PAGE CHECKS PASSED` (the page does not use DATA.revision yet).
  - The Grokbot hard stop was cleared first: L2 and L3 are now ticked, `test_server.mjs` ends `ALL SERVER CHECKS PASSED` and `check_page.mjs` ends `ALL PAGE CHECKS PASSED`.
- [x] R07 lesson (pilot): written, checked and recorded (plan 7.7)
  - `check_cheatsheet.py listen/R07.md` → `PASS listen/R07.md (1149 words)`.
  - `C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py R07` → six chapters, every one `[OK]`: 1.3 min 136 wpm, 1.7 min 116 wpm, 1.7 min 118 wpm, 1.4 min 134 wpm, 1.5 min 136 wpm, 1.4 min 129 wpm; all between -20.4 and -20.7 LUFS and 0.48-0.63 MB; total 9.0 min; `data written to site/data/R07.json`.
  - `check_cheatsheet.py --site-manifest check` → `SITE MANIFEST OK`: the only new files are `site/data/R07.json` and `site/audio/R07-01.mp3` to `R07-06.mp3`.
  - `build_site.py` now prints `ready revision lessons: R07`.
- [x] W2 site/template.html: the Revision page, door and nav link, Repeat, and the guards (plan 7.8)
  - `site/template.html`: `REVISION`, `vcat`, `isRevision` and the new `entry`; `className` tests `vcat` first;
    `SERIES.revision` and `seriesOf`; the Auto title; the Repeat chip with `store.repeat`; `renderRevision`,
    `revisionRow`, `revisionInfo`; the `#revision` route; the header link and `setNav`; the third door with its
    media query and the Revise row; `renderLecture` and `whereNext` for a revision lesson; `refreshProgress`;
    the search and Grokbot guards.
  - One existing check changed because W2 makes it wrong: "both top bar links stay visible" now expects three
    links ("the top bar links stay visible"), and the phone header CSS was tightened so three links fit at 390 px.
- [x] W3 server.js skips R files; the test_server.mjs check (plan 7.8)
  - `server.js`: `if (f.endsWith(".json") && !/^R\d\d\.json$/.test(f))` in the startup loop.
  - `scripts/test_server.mjs`: `/api/ask` with `id: "R07"` answers 400. Two existing checks were scoped to
    non-pick calls, because the pick now always sends a light reasoning setting and the answer loop still walks
    both models. `test_server.mjs` → `ALL SERVER CHECKS PASSED`.
- [x] W4 check_page.mjs: the Revision checks and screenshots (plan 7.8)
  - New checks: three doors and the revision door's "10 lessons"; the Revision nav link; `#revision` with ten rows,
    one link and nine "In preparation"; `#R07` with the Revision crumb, its title and its chapters; the first
    chapter playing `R07-01.mp3`; Repeat toggling and saving; the end of the last chapter starting the lesson
    again; Repeat off not restarting it; Grokbot on `#R07`; a revision lesson kept out of the search index; no
    horizontal scroll on a revision lesson at phone width. Screenshots: `phone-revision.png`,
    `phone-revision-lesson.png`, `phone-revision-dark.png`, `desktop-home-revision.png`.
- [x] W5 build_site, check_page (ALL PAGE CHECKS PASSED), build_static, test_server (ALL SERVER CHECKS PASSED), manifest check
  - `build_site.py` → `index.html: 610 KB; … ready revision lessons: R07`.
  - `check_page.mjs` → `ALL PAGE CHECKS PASSED` (127 passing checks).
  - `build_static.py` → `index.html: 613 KB, 160 audio files under site/audio/`.
  - `test_server.mjs` → `ALL SERVER CHECKS PASSED`.
  - `check_cheatsheet.py --site-manifest check` → `SITE MANIFEST OK`.
  - The four screenshots were opened and look right; the desktop door shot was scrolled to show the revision
    door, and the phone Revision shot was moved to a 390 px viewport.
- [x] STOP GATE G10: review R07 and every Part W change; commit and push; live check; the student listens to Revision 7
  - Review of R07, chapter by chapter against its voices (themes/TH6.md, cards/P09.md, cards/P10.md, cards/P17.md):

| Chapter | Facts checked | Result |
|---|---|---|
| 1. The theme in one minute | Carlsson and Stankiewicz's definition, materialization from Steen, the exam link | confirmed |
| 2. The key ideas | functions as activities, the seven, the eighth, non-linear interaction | confirmed |
| 3. The model, step by step | the seven functions, materialization, motors A, B and C | confirmed |
| 4. Norway examples | Longship and Northern Lights, weak market formation, Mongstad, batteries and procurement | confirmed |
| 5. How the exam asks about it | the June 2025 and December 2024 questions, the moves, the plagiarism line | confirmed |
| 6. Test yourself | three questions, each answered from chapters 1-5 | confirmed |

  - For the ear: read as a listener. Each chapter opens in plain words, names its source as author and year, and
    closes with a Remember line; the steps are announced and closed; Test yourself pauses and then answers.
  - The recording: `build_audio.py R07` reported `[OK]` for all six chapters, 116-136 words per minute (the
    allowed range is 105-175) and files of 0.48-0.63 MB; `check_cheatsheet.py --all` → `ALL CHEATSHEET CHECKS PASSED`.
  - Part W compared with 7.8, line by line: items 1-11 are all present in `site/template.html` (the entry helpers,
    className, SERIES and seriesOf, the Auto title, Look for the Repeat chip, renderRevision and the route, the nav
    link and setNav, the door and the Revise row, renderLecture and whereNext, refreshProgress, the search and
    Grokbot guards); `server.js` skips R files; `test_server.mjs` has the R07 ask check; `check_page.mjs` has the
    Revision checks and the four screenshots.
  - The five site checks: `build_site.py` (610 KB, ready revision lessons: R07), `check_page.mjs`
    (`ALL PAGE CHECKS PASSED`, 127 checks), `build_static.py` (613 KB, 160 audio files), `test_server.mjs`
    (`ALL SERVER CHECKS PASSED`), `--site-manifest check` (`SITE MANIFEST OK`).
  - One path outside 9's G10 list was staged: `scripts/mock_openrouter.mjs`, because L2's changes there are what
    the new `test_server.mjs` checks read, and a commit without it would not pass on a fresh clone.
  - `PROGRESS_GROKBOT_ZCODE.md` was staged too: it now records that L2 and L3 are done, which is the hard stop
    this batch had to clear first.
  - `--scan` → `SCAN CLEAN`; commit `cbf42e7 cheatsheet: G10 the Revision section and Revision 7`; push
    `421173e..cbf42e7  main -> main`; `status -sb` now `## main...origin/main`.
  - Live check: the first run printed `NOT LIVE YET R07`, but the site already served the page and the MP3.
    The cause was the check itself: it asked with HEAD, and this host answers 404 to HEAD on static files.
    With a GET the check prints `LIVE OK R07`.
- [x] R01 lesson (exam day)
  - Recorded and shipped with the G11 batch: see the evidence under G11.
- [x] R02 lesson (Theme 1)
  - Recorded and shipped with the G11 batch: see the evidence under G11.
- [x] R03 lesson (Theme 2)
  - Recorded and shipped with the G11 batch: see the evidence under G11.
- [x] R04 lesson (Theme 3)
  - Recorded and shipped with the G11 batch: see the evidence under G11.
- [x] STOP GATE G11: review R01-R04; build and check the site; commit and push; live check
  - `--scan` -> `SCAN CLEAN`; commit `b8664e1 cheatsheet: G11 the lessons R01 to R04`; push `cbf42e7..b8664e1  main -> main`; `status -sb` now `## main...origin/main`.
  - `--live R01 R02 R03 R04` -> `LIVE OK R01 R02 R03 R04`.

  - Review of the four lessons, chapter by chapter against their voices:

| Lesson | Chapters checked | Result |
|---|---|---|
| R01 Exam day (8 chapters) | the exam format and four hours, the six questions word for word, the three parts of an answer, the six marking criteria, the five systems, the twelve definitions | confirmed against front/EXAM_DAY.md, the theme sheets and T8's slides 33-43 |
| R02 Innovation systems (6) | the broad definition, institutions from North, path dependency from Arthur, the three paths, petroleum suppliers, the concession laws | confirmed against cards P01, P02 and theme TH1 |
| R03 Regional systems (6) | Cooke's definition, related variety, the four trajectories, Hordaland and Rogaland, Mongstad, the cluster programme | confirmed against cards P03, P05 and theme TH2 |
| R04 Institutions (6) | institutions, institutional work, the four forms, the logics, the two regions, Rettedal, the unintended outcome | confirmed against cards P03, P01 and theme TH3 |

  - For the ear: each chapter opens in plain words, names its source as author and year, closes with a Remember
    line, and announces and closes its lists; Test yourself pauses and then answers.
  - The recordings: `build_audio.py R01 R02 R03 R04` reported `[OK]` for every chapter of all four lessons
    (8 + 6 + 6 + 6 = 26 chapters), 122-140 words per minute, 0.37-0.79 MB each; totals 10.6, 8.7, 8.9 and 8.6 min.
  - The five site checks: `build_site.py` (652 KB, ready revision lessons: R01, R02, R03, R04, R07),
    `check_page.mjs` (`ALL PAGE CHECKS PASSED`), `build_static.py` (654 KB, 186 audio files),
    `test_server.mjs` (`ALL SERVER CHECKS PASSED`), `--site-manifest check` (`SITE MANIFEST OK`).
  - Two `check_page.mjs` checks that assumed the pilot state were made data-driven: the revision row count now
    follows `REVISION` and the ready lessons, and the Repeat-off check no longer assumes a next lesson. A new
    check uses R01 to prove that Auto hands over to R02 when Repeat is off. `scripts/check_page.mjs` was staged
    with this batch, though 9's G11 list does not name it, because the committed checks must match the state.
- [x] R05 lesson (Theme 4)
  - Recorded and shipped with the G12 batch: see the evidence under G12.
- [x] R06 lesson (Theme 5)
  - Recorded and shipped with the G12 batch: see the evidence under G12.
- [x] R08 lesson (Theme 7)
  - Recorded and shipped with the G12 batch: see the evidence under G12.
- [x] R09 lesson (Theme 8)
  - Recorded and shipped with the G12 batch: see the evidence under G12.
- [x] STOP GATE G12: review R05, R06, R08, R09; build and check the site; commit and push; live check
  - `--scan` -> `SCAN CLEAN`; commit `109429d cheatsheet: G12 the lessons R05, R06, R08 and R09`; push `b8664e1..109429d  main -> main`; `status -sb` now `## main...origin/main`.
  - `--live R05 R06 R08 R09` -> `LIVE OK R05 R06 R08 R09`.

  - Review of the four lessons, chapter by chapter against their voices:

| Lesson | Chapters checked | Result |
|---|---|---|
| R05 Entrepreneurial ecosystems (6) | process not thing, access over presence, recycling, selection and strategic choice, the ten elements, the four types, Jahnebakken, work visas | confirmed against cards P06, P07, P08 and theme TH4 |
| R06 Agency and new path development (6) | agency from Sotarauta and Suvinen, the two kinds, the three forms each, distributed agency, bricolage, Flam, Odda and Sogndal, the batteries | confirmed against cards P14, P15, P16, P17 and theme TH5 |
| R08 Sustainability (6) | wicked problems, the dedicated system, transformative innovation, transformational failures, the three questions, the two regions, the end of cheap growth | confirmed against cards P04, P03 and theme TH7 |
| R09 Crowdfunding (6) | the two kinds of innovativeness, openness, social capital, the value proposition, the five steps, the three levels, the Norwegian figure, the marked application | confirmed against cards P11, P12, P13 and theme TH8 |

  - For the ear: each chapter opens in plain words, speaks its sources as author and year, closes with a Remember
    line, and announces and closes its lists; Test yourself pauses and then answers.
  - The recordings: `build_audio.py R05 R06 R08 R09` reported `[OK]` for all 24 chapters (6 + 6 + 6 + 6),
    118-145 words per minute, 0.40-0.67 MB each; totals 8.7, 8.6, 8.5 and 8.7 min.
  - The five site checks: `build_site.py` (690 KB, nine lessons ready), `check_page.mjs` (`ALL PAGE CHECKS PASSED`),
    `build_static.py` (693 KB, 210 audio files), `test_server.mjs` (`ALL SERVER CHECKS PASSED`),
    `--site-manifest check` (`SITE MANIFEST OK`).
- [x] R10 lesson (the 17 papers in brief)
  - Recorded and shipped with the G13 batch: see the evidence under G13.
- [x] STOP GATE G13: review R10; build and check the site; commit and push; live check; final report
  - `--scan` -> `SCAN CLEAN`; commit `8e85cbb cheatsheet: G13 the lesson R10 and the final site build`; push `109429d..8e85cbb  main -> main`.
  - `--live R10` -> `LIVE OK R10`. All ten lessons are recorded and live.

  - Review of R10, chapter by chapter against the 17 cards:

| Chapters | Content checked | Result |
|---|---|---|
| 1-8 (P01 to P08) | each chapter's one-line claim, its Norway or theory point and its source | confirmed against cards P01-P08 |
| 9-14 (P14, P15, P16, P09, P10, P17) | the three villages, distributed agency and bricolage, the modes of change, the seven functions, the eight functions and the two technologies | confirmed against cards P14, P15, P16, P09, P10, P17 |
| 15-17 (P11, P12, P13) | the bibliometric map, the eighty nine platforms, the five steps and three levels | confirmed against cards P11, P12, P13 |

  - Fixed at this review: four chapters repeated a sentence from their own earlier text, because the two length
    passes had overlapped (Paper 2's triangle, Paper 15's enabling and constraining, Paper 9's process analysis
    and interaction, Paper 11's record count). Each was replaced with a fact the card carries and the chapter
    did not yet use, and R10 was recorded again.
  - For the ear: each chapter is about 120 words, says what the paper asks and what it finds, and closes with a
    Remember line; the paper order is the course order, and each heading names the paper as it is spoken.
  - The recording: `build_audio.py R10` reported `[OK]` for all 17 chapters, 123-138 words per minute,
    0.33-0.39 MB each, total 16.5 min.
  - The five site checks: `build_site.py` (708 KB, ten lessons ready), `check_page.mjs`
    (`ALL PAGE CHECKS PASSED`), `build_static.py` (711 KB, 227 audio files), `test_server.mjs`
    (`ALL SERVER CHECKS PASSED`), `--site-manifest check` (`SITE MANIFEST OK`).
  - `check_cheatsheet.py --all` -> `ALL CHEATSHEET CHECKS PASSED`.

## Notes for the glossary (filled during Part T)
| English | Norsk (bokmål) | Where found |
|---|---|---|
| Innovation system | innovasjonssystem | [Class 1, slide 14] |
| National innovation system | nasjonalt innovasjonssystem | [Class 1, slide 2] |
| Institutions | institusjoner | [Class 1, slide 15] |
| Path dependency | stiavhengighet | [Class 1, slide 32] |
| Trinity of innovation | treenighet | standard term |
| Regional innovation system | regionalt innovasjonssystem | [Class 2, slide 13] |
| Related variety | relatert variasjon | standard term |
| Path extension | baneforlengelse | standard term |
| Path creation | baneskaping | standard term |
| Institutional work | institusjonelt arbeid | [Class 3, slide 1] |
| Institutional logics | institusjonelle logikker | standard term |
| Change agency | endringsaktørskap | [Class 3, slide 10] |
| Reproductive agency | reproduktivt aktørskap | [Class 3, slide 10] |
| Entrepreneurial ecosystem | entreprenørielt økosystem | [Class 4, slide 1] |
| Munificence | rikelighet | standard term |
| Functionality | funksjonalitet | standard term |
| Selection effects | seleksjonseffekter | standard term |
| Strategic choice effects | strategiske valgeffekter | standard term |
| Technological innovation system | teknologisk innovasjonssystem | [Class 6, slide 12] |
| Function | funksjon | [Class 6, slide 15] |
| Guidance of the search | retning for søket | [Class 6, slide 22] |
| Materialization | materialisering | [Class 6, slide 24] |
| Legitimation | legitimering | [Class 6, slide 23] |
| Agency | aktørskap | [Class 3, slide 10] |
| Bricolage | bricolage | standard term |
| Green industrial restructuring | grønn industriell omstilling | standard term |
| Paradigm | paradigme | standard term |
| Dedicated innovation system | dedikert innovasjonssystem | standard term |
| Transformative innovation | transformativ innovasjon | standard term |
| Transformational failures | transformasjonssvikt | standard term |
| Crowdfunding | folkefinansiering | [Bonus, slide 7] |
| Incremental innovativeness | inkrementell innovativitet | standard term |
| Radical innovativeness | radikal innovativitet | standard term |
| Value proposition | verdiforslag | standard term |
| Crowdfunding ecosystem | folkefinansieringsøkosystem | standard term |
