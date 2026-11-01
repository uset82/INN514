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
- [ ] STOP GATE G1: review P01 and P09; Lessons; commit and push
  - Review table (each bullet against its cited page):

| File | Bullets | Confirmed on the source | Fixed (what) |
|---|---|---|---|
| cards/P01.md | 14 | pp. 431 (broad definition, Freeman–Lundvall–Nelson, Arthur), 433 (North, the quotation), 434 (Dutch disease, domestic suppliers), 436 ("five out of the six comparisons"), 438 (diffusion and cooperation), 439 (the three paths, named as the page names them), 440 (SIMULA and GSM, payoffs in oil and gas), 442 (what the authors cannot pursue) | the cooperation finding moved from p. 437 to p. 438, where the claim stands; "citing Wicken" removed from the model line, because p. 439 cites that work only as a numbered reference |
| cards/P09.md | 15 | pp. 415 (activities called functions), 416 (Carlsson and Stankiewicz), 423 (function 4), 426 (interactions, motors of change, Fig. 2 A–C), 427 (vicious cycle), 428 (first Dutch studies), 429 (heuristic value) | none |

- [ ] P02 card
- [ ] P03 card
- [ ] P04 card
- [ ] P05 card
- [ ] STOP GATE G2: review P02-P05; commit and push
- [ ] P06 card
- [ ] P07 card
- [ ] P08 card
- [ ] P14 card
- [ ] STOP GATE G3: review P06, P07, P08, P14; commit and push
- [ ] P15 card
- [ ] P16 card
- [ ] P10 card
- [ ] P17 card
- [ ] STOP GATE G4: review P15, P16, P10, P17; commit and push
- [ ] P11 card
- [ ] P12 card
- [ ] P13 card
- [ ] STOP GATE G5: review P11-P13; commit and push

## Part T: theme sheets
- [ ] TH6 Technological innovation systems (pilot)
- [ ] STOP GATE G6: review TH6; Lessons; commit and push
- [ ] TH1 Innovation systems and Norway's NIS
- [ ] TH2 Regional innovation systems
- [ ] TH3 Institutions and institutional work
- [ ] TH4 Entrepreneurial ecosystems
- [ ] STOP GATE G7: review TH1-TH4; commit and push
- [ ] TH5 Agency and new path development
- [ ] TH7 Sustainability and normative direction
- [ ] TH8 Crowdfunding and service ecosystems
- [ ] STOP GATE G8: review TH5, TH7, TH8; commit and push

## Part A: assembly and print
- [ ] A1 front/EXAM_DAY.md
- [ ] A2 back/GLOSSARY.md and back/SOURCES.md
- [ ] A3 scripts/build_cheatsheet.py
- [ ] A4 build, look at every page, fix, README.md, check --all passes
- [ ] STOP GATE G9: final review of front, back and PDF; commit and push everything; final report

## Part V and Part W: listening lessons and the Revision section (after G9)
- [ ] V0 check_cheatsheet.py: the listen kind, --site-manifest, --live and the wider scan; tests 25-34 pass (plan 6.4, 6.5)
- [ ] W1 site manifest written; build_audio.py reads R ids from cheatsheet/listen/; build_site.py adds DATA.revision (plan 7.8)
- [ ] R07 lesson (pilot): written, checked and recorded (plan 7.7)
- [ ] W2 site/template.html: the Revision page, door and nav link, Repeat, and the guards (plan 7.8)
- [ ] W3 server.js skips R files; the test_server.mjs check (plan 7.8)
- [ ] W4 check_page.mjs: the Revision checks and screenshots (plan 7.8)
- [ ] W5 build_site, check_page (ALL PAGE CHECKS PASSED), build_static, test_server (ALL SERVER CHECKS PASSED), manifest check
- [ ] STOP GATE G10: review R07 and every Part W change; commit and push; live check; the student listens to Revision 7
- [ ] R01 lesson (exam day)
- [ ] R02 lesson (Theme 1)
- [ ] R03 lesson (Theme 2)
- [ ] R04 lesson (Theme 3)
- [ ] STOP GATE G11: review R01-R04; build and check the site; commit and push; live check
- [ ] R05 lesson (Theme 4)
- [ ] R06 lesson (Theme 5)
- [ ] R08 lesson (Theme 7)
- [ ] R09 lesson (Theme 8)
- [ ] STOP GATE G12: review R05, R06, R08, R09; build and check the site; commit and push; live check
- [ ] R10 lesson (the 17 papers in brief)
- [ ] STOP GATE G13: review R10; build and check the site; commit and push; live check; final report

## Notes for the glossary (filled during Part T)
| English | Norsk (bokmål) | Where found |
|---|---|---|
