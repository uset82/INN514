# Reading companion: WorkBuddy's progress (P14, P15, P16, P09, P10, P17, P11, P12, P13)

Plan: `workspace/lecture-audio/READINGS_PLAN.md`. Prompt: `workspace/lecture-audio/READINGS_KICKOFF.md`.
Under each ticked paper, paste the full output of `check_reading.py <P>` (PASS) and `build_audio.py <P>` (all `[OK]`). Then list every `<!-- sourced: -->` line, every page picture you looked at, and every page whose kind guess was wrong. Never tick a STOP GATE box: Claude Code ticks it when the student writes the approval.

## Phase 0: scripts, site and extraction (Claude Code)
- [x] Done by Claude Code on 2026-10-20. Pages extracted for all 17 papers (`workspace/extracted/pages/`). Added `check_reading.py`, `reading_lib.py` and `extract_paper.py`; extended `build_audio.py`, `build_site.py`, `template.html` and `check_page.mjs`. The live page shows "The readings" with all 17 papers "in preparation".

## Gate R1 (pilot)
- [x] P14 Bækkelund 2021 (cover, 757–768)

  Done 2026-10-21 by WorkBuddy. `readings/P14.md`: 5 chapters, 1462 words, 13 of 13 pages covered.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py P14`:

    P14: Bækkelund 2021; 5 chapters, 1462 words (about 12 min of audio); 13 of 13 pages covered; 4 declared
      1. The paper in brief                        566 words  mean 18.9  max 40  inflated 0.0  pages the whole paper
      2. Why the paper adds a second kind of agen  283 words  mean 15.7  max 32  inflated 0.0  pages cover, 757–759
      3. Four phases of a path, and the method fo  249 words  mean 16.6  max 33  inflated 0.0  pages 760–762
      4. Three villages, three tourism paths       271 words  mean 15.1  max 28  inflated 0.0  pages 763–765
      5. Conclusions and the reference list         93 words  mean 15.5  max 25  inflated 0.0  pages 766–768
      declared: fredin (page 758, the citation "Fredin et al., 2019, p. 797" is split by a line-end hyphen in the PDF)
      declared: stable state (page 760, Figure 1 branch label "Movement to a stable state")
      declared: dynamic process (page 760, Figure 1 branch label "Path as dynamic process")
      declared: bergen (page 762, Figure 2 map label)
      warning: ch 5: groups 1 article pages (aim for 3-5)
    PASS

  The one warning is left as it stands: chapter 5 is page 766 plus the two reference pages, because the paper's conclusions are short and the plan's own example puts conclusions and the reference list in one chapter. Splitting them would give a reference-only chapter whose check question nothing in that chapter answers.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py P14`:

    == P14: Reading 14: Change agency and reproductive agency in the course of industrial path evolution (5 chapters)
      [OK] P14-01.mp3:  4.0 min, 572 words, 142 wpm, -20.4 LUFS, 1.45 MB  (synthesised (attempt 1))
      [OK] P14-02.mp3:  2.5 min, 301 words, 120 wpm, -20.4 LUFS, 0.90 MB  (synthesised (attempt 1))
      [OK] P14-03.mp3:  2.1 min, 268 words, 127 wpm, -20.4 LUFS, 0.76 MB  (synthesised (attempt 1))
      [OK] P14-04.mp3:  2.1 min, 284 words, 133 wpm, -20.4 LUFS, 0.77 MB  (synthesised (attempt 1))
      [OK] P14-05.mp3:  0.9 min, 104 words, 117 wpm, -20.6 LUFS, 0.32 MB  (synthesised (attempt 1))
      total 11.7 min; data written to site/data/P14.json

  Every `<!-- sourced: -->` line (4):
  - `<!-- sourced: Fredin | page 758, the citation "Fredin et al., 2019, p. 797" is split by a line-end hyphen in the PDF -->` — the name is on the page as "Fre-din"; the check cannot join it, so it is declared rather than dropped.
  - `<!-- sourced: stable state | page 760, Figure 1 branch label "Movement to a stable state" -->`
  - `<!-- sourced: dynamic process | page 760, Figure 1 branch label "Path as dynamic process" -->`
  - `<!-- sourced: Bergen | page 762, Figure 2 map label -->` — Bergen is on the map, not in page 762's text.

  Page pictures looked at (3, all that `pages.json` lists for this paper):
  - `workspace/extracted/pages/P14/img/page-757.png` — title page, abstract, keywords, start of the introduction; no figure. Kind article, confirmed.
  - `workspace/extracted/pages/P14/img/page-760.png` — Figure 1, "Types of agency in the course of the path process", adapted from Martin (2010, p. 21). Zoomed to read the box labels: preformation, critical juncture, path creation, path development, and the two branches "Movement to a stable state" and "Path as dynamic process".
  - `workspace/extracted/pages/P14/img/page-762.png` — Figure 2, "Case villages in Western Norway", geographical data from Kartverket. Map labels: Sogndal, Flåm, Bergen, Odda, plus an inset of Norway. The fjord names are not labelled on the map, so the summaries take them from the text.

  Pages whose kind guess was wrong: none. All 13 guesses hold — `cover` is the publisher's sheet, 757–765 are article pages, 766 is mixed (conclusions, acknowledgements, notes, then the REFERENCES heading part-way down), and 767–768 are the reference list. Pages 758, 759, 761, 763, 764, 765 and 766 have no picture in `img/`, so their kind was confirmed from their own text rather than by eye.

- [x] Claude Code review and fixes (2026-10-21, at the student's request)
  - Claude read every page of P14 against `workspace/extracted/pages/P14/`, both figures (pages 760 and 762) and Lecture 5, then fixed ten problems:
    - guessed pronouns for Bækkelund;
    - reasoning and framing the paper doesn't give;
    - "plus three follow-ups" (the 29 interviews include them);
    - an unlabelled exam link;
    - "four phases" (Figure 1 has three, plus a critical juncture);
    - Sogndal's stadium as a "turning point", and the festival "drew students" (now hedged as in the paper);
    - a check answer with a condition not on the page;
    - page 760 described only the figure;
    - pages 763, 764 and 766 left out their analysis.
  - The ten lessons are in READINGS_PLAN.md section 10.
  - Checker: hyphen-split names now pass, so the "Fredin" declaration was dropped. A conclusion may share a chapter with the reference list without a warning. `site/reviewed.json` now keeps unreviewed readings off the page.
  - `check_reading.py P14`: PASS (1,613 words, 13 of 13 pages, 1 declared: Bergen). `build_audio.py P14`: 5 of 5 `[OK]`, 13.0 min. `check_page.mjs`: `ALL PAGE CHECKS PASSED`, including Lecture 5's link to P14 page 757.
  - WorkBuddy's version was kept in Claude's scratchpad as `P14.workbuddy.md`.
  - Published as version 12 of https://claude.ai/artifact/Nc3TALuXYR3W49sUshNs93 (64 files, including P14-01 to P14-05).
- [x] **STOP GATE R1-W:** student approved
  - Evidence: the student wrote to Claude Code on 2026-10-21: "APPROVED GATE R1-W"

## Gate R2
- [x] P15 Garud & Karnøe 2003 (277–300)

  Done 2026-10-21 by WorkBuddy. `readings/P15.md`: 6 chapters, 2537 words, 24 of 24 pages covered.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py P15`:

    P15: Garud & Karnøe 2003; 6 chapters, 2537 words (about 20 min of audio); 24 of 24 pages covered; 4 declared
      1. The paper in brief                        568 words  mean 19.6  max 32  inflated 0.0  pages the whole paper
      2. Why agency is distributed, and why it is  477 words  mean 17.0  max 31  inflated 0.0  pages 277–281
      3. Two wind turbine paths begin              393 words  mean 15.1  max 31  inflated 0.0  pages 282–285
      4. Design, users and the test station: wher  460 words  mean 16.4  max 26  inflated 0.0  pages 286–290
      5. The test centre, the regulators, and the  475 words  mean 17.6  max 31  inflated 0.0  pages 291–295
      6. What the comparison shows, and the refer  164 words  mean 14.9  max 24  inflated 0.0  pages 296–300
      declared: bonus (page 286, Figure 3 legend and note, the Danish firm)
      declared: uswindpower (page 286, Figure 3 legend and note, the US firm)
      declared: 1975 (page 287, Figure 4 label "Steady Wind Model 1975")
      declared: 1985 (page 287, Figure 4 label "Turbulent Wind Model 1985")
    PASS

  No warnings: every page block is inside 60–100 words and no chapter carries a size warning.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py P15`:

    == P15: Reading 15: Bricolage versus breakthrough: distributed and embedded agency in technology entrepreneurship (6 chapters)
      [OK] P15-01.mp3:  4.1 min, 574 words, 140 wpm, -20.4 LUFS, 1.48 MB  (cache)
      [OK] P15-02.mp3:  3.9 min, 498 words, 129 wpm, -20.6 LUFS, 1.39 MB  (cache)
      [OK] P15-03.mp3:  3.4 min, 408 words, 121 wpm, -20.4 LUFS, 1.22 MB  (synthesised (attempt 1))
      [OK] P15-04.mp3:  3.8 min, 482 words, 127 wpm, -20.4 LUFS, 1.37 MB  (cache)
      [OK] P15-05.mp3:  3.9 min, 497 words, 128 wpm, -20.3 LUFS, 1.40 MB  (cache)
      [OK] P15-06.mp3:  1.4 min, 180 words, 126 wpm, -20.4 LUFS, 0.52 MB  (cache)
      total 20.4 min; data written to site/data/P15.json

  The `(cache)` markers are chapters whose text did not change between runs; each chapter was synthesised at least once, and P15-03 was re-rendered after the last text edit.

  Every `<!-- sourced: -->` line (4):
  - `<!-- sourced: Bonus | page 286, Figure 3 legend and note, the Danish firm -->`
  - `<!-- sourced: USWindpower | page 286, Figure 3 legend and note, the US firm -->`
  - `<!-- sourced: 1975 | page 287, Figure 4 label "Steady Wind Model 1975" -->`
  - `<!-- sourced: 1985 | page 287, Figure 4 label "Turbulent Wind Model 1985" -->`

  All four are figure labels rather than body text: Figure 3's two firm names sit in its legend and note, and Figure 4's two years sit in its two model labels. Nothing else needed declaring.

  Page pictures looked at (6, all that `pages.json` lists for this paper):
  - `workspace/extracted/pages/P15/img/page-277.png` — title page, abstract, keywords and the start of the introduction; no figure. Kind article, confirmed.
  - `workspace/extracted/pages/P15/img/page-278.png` — Figure 1, "Global market shares for Danish and US firms, 1982–2000". Two lines only: "Shares DK Firms" (solid) and "Shares US Firms" (dashed). The US line starts at the top in 1982 and falls to almost nothing by 1986; the Danish line climbs and stays near 45–50% to 2000. A table of annual world market MW runs under the axis.
  - `workspace/extracted/pages/P15/img/page-279.png` — Figure 2, "Distributed agents involved in the emergence of a technological path". A grey "Technological Artifact" circle in the middle, with "Regulation", "Evaluation", "Design & Production" and "Use" around it, joined by two-way arrows. The note reads "The arrows represent embedding processes."
  - `workspace/extracted/pages/P15/img/page-286.png` — Figure 3, "Design scale-up steps for two major firms". Two staircase lines, Bonus and USWindpower; Bonus climbs in many small steps, USWindpower in far fewer, much larger ones.
  - `workspace/extracted/pages/P15/img/page-287.png` — Figure 4, "Changes in the representation of the wind flows by actors in the US". Two panels labelled "Steady Wind Model 1975" and "Turbulent Wind Model 1985".
  - `workspace/extracted/pages/P15/img/page-291.png` — Figure 5, "An illustration of a 'linear model' directing involvement of US test center". The chain runs R&D needs → basic science and advanced components research → technology base → industry → cost-effective systems. The note credits the "DOE Five Year Research Plan on wind power, 1985-90".

  Pages whose kind guess was wrong: none. All 24 guesses hold — 277–296 are article pages, 297 is mixed (acknowledgements, then the REFERENCES heading part-way down), and 298–300 are the reference list. Pages 280–285, 288–290 and 292–296 have no picture in `img/`, so their kind was confirmed from their own text rather than by eye.

  Notes on this paper:
  - The paper has no cover sheet, so chapter 1 is `<!-- pages: all -->` and chapter 2 starts on 277.
  - Chapters follow the paper's own numbering: 3 Distributed agency (282–285), 4 design, users and evaluation (286–290), 4.4 regulators to 5 (291–295), 6 Conclusion (296), then the acknowledgements and references.
  - Applying the P14 lessons: the page blocks name the figure parts as the figures do (Figure 1's two lines, Figure 2's four circles, Figure 5's chain); Rosenberg's definition of technology is credited on page 285 and Levi-Strauss on 278 and 279; page 282 gives "nine other firms besides Vestas" rather than a derived "ten"; the December 2024 exam question is quoted as Lecture 5 gives it, with no "with examples" added, and our own example is labelled as ours.
  - Two of the three figure claims in chapter 1 point at the pages the figures actually sit on: Figure 2 on page 279, Table 1 on page 284.

  Claude Code review and fixes (2026-10-21, early review at the student's request, before the end of batch R2):
  - Claude read all 24 pages against `workspace/extracted/pages/P15/` and looked at Figures 1, 3, 4 and 5. Much better than the P14 draft; twelve smaller problems fixed:
    1. Figure 1: the US share falls to a small part by 1986, not "almost nothing" (that comes only around 1996).
    2. "nine other firms had joined Vestas" became "nine other Danish firms besides Vestas".
    3. "one-way" became "one-time, short-term contracts".
    4. The 1983–1987 standstill was at USWindPower only.
    5. Page 286: the added "So…" link was removed, and the aerospace framing is named again.
    6. Chapter 1: a limitation the paper doesn't state was replaced by what the paper says about where bricolage helps.
    7. Page 296: "potential weaknesses" restored.
    8. The exam link: "pursued", not "waited for", a breakthrough.
    9. Page 293: the added "steered rather than pushed" was removed.
    10. Chapter 3's check answer now matches a chapter-3 summary that names the American Wind Energy Association.
    11. Chapter 4's check question no longer asks about Table 1, which is in chapter 3.
    12. "Bricolage" is cited on pages 278 and 279, and the 30% subsidy is "for buyers".
  - Lessons added to READINGS_PLAN.md section 10.
  - Checker: "United States" now passes when the paper writes "US". Recorder: longer waits between attempts, after the voice service throttled.
  - `check_reading.py P15`: PASS, no warnings. `build_audio.py P15`: 6 of 6 `[OK]`, 20.6 min. The voice service threw `NoAudioReceived` up to five times per chapter before it worked, which is why the recorder now waits longer. `check_page.mjs`: `ALL PAGE CHECKS PASSED`.
  - WorkBuddy's version was kept in Claude's scratchpad as `P15.workbuddy.md`.
  - Published as version 13 of https://claude.ai/artifact/Nc3TALuXYR3W49sUshNs93 (P15-01 to P15-06 added). Gate R2-W stays at the end of the batch.

- [x] P16 Miörner & Trippl 2017 (cover, 481–497)

  Done 2026-10-21 by WorkBuddy. `readings/P16.md`: 6 chapters, 2133 words, 18 of 18 pages covered.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py P16`:

    P16: Miörner & Trippl 2017; 6 chapters, 2133 words (about 17 min of audio); 18 of 18 pages covered; 0 declared
      1. The paper in brief                        647 words  mean 19.6  max 33  inflated 0.0  pages the whole paper
      2. Why a constraining region can be turned   408 words  mean 17.0  max 27  inflated 0.0  pages cover, 481–484
      3. Key actors, three forms of power and thr  281 words  mean 16.5  max 33  inflated 3.6  pages 485–487
      4. Scania's games industry, and what held i  299 words  mean 18.7  max 39  inflated 0.0  pages 488–490
      5. Three new elements: the conference, the   299 words  mean 17.6  max 31  inflated 0.0  pages 491–493
      6. Conclusions and the reference list        199 words  mean 16.6  max 41  inflated 0.0  pages 494–497
    PASS

  No warnings: every page block is inside 60–100 words and no chapter carries a size warning. Chapter 3's 3.6 inflated words per 1000 is one use of "paradigms" on page 485, which is Simmie's own term for a barrier, so it stays.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py P16`:

    == P16: Reading 16: Paving the way for new regional industrial paths: actors and modes of change in Scania's games industry (6 chapters)
      [OK] P16-01.mp3:  4.9 min, 653 words, 134 wpm, -20.5 LUFS, 1.75 MB  (synthesised (attempt 1))
      [OK] P16-02.mp3:  3.2 min, 430 words, 134 wpm, -20.5 LUFS, 1.16 MB  (synthesised (attempt 1))
      [OK] P16-03.mp3:  2.4 min, 300 words, 124 wpm, -20.5 LUFS, 0.87 MB  (synthesised (attempt 1))
      [OK] P16-04.mp3:  2.4 min, 315 words, 131 wpm, -20.5 LUFS, 0.86 MB  (synthesised (attempt 1))
      [OK] P16-05.mp3:  2.4 min, 317 words, 134 wpm, -20.5 LUFS, 0.85 MB  (synthesised (attempt 1))
      [OK] P16-06.mp3:  1.6 min, 212 words, 136 wpm, -20.4 LUFS, 0.56 MB  (synthesised (attempt 1))
      total 16.8 min; data written to site/data/P16.json

  Every `<!-- sourced: -->` line: none. No figure or table label needed declaring. The paper has one table, Table 1 on page 487, and the extraction put all three rows and their examples into `page-487.txt`, so every term used in the page-487 block is body text that the check can see.

  Page pictures looked at: none, because there are none. `workspace/extracted/pages/P16/img/` is empty and every page in `pages.json` has `"image": null`. Table 1 on page 487 was read from that page's text file, which reproduces the table in full: high degree of power and layering, medium and adaptation, low and novel application, each with its examples.

  Pages whose kind guess was wrong: none. All 18 guesses hold — `cover` is the publisher's sheet, 481–495 are article pages, and 496–497 are the reference list. There is no mixed page: the references start at the top of 496 under a References heading, and 495 ends with the disclosure statement and the funding note.

  Notes on this paper:
  - Chapters follow the paper's own sections: ch2 `cover, 481-484` (introduction and the factors that constrain); ch3 `485-487` (actors of change, three forms of power, the typology and Table 1); ch4 `488-490` (Scania, the method, the constraints); ch5 `491-493` (the Nordic Game Conference, the Game Assembly, Game City); ch6 `494-497` (conclusions and references).
  - The brief links the paper to Lecture 5, Agency and innovation systems in change, and to the June 2025 exam, Question 2 (regional innovation systems and industrial restructuring). The paper is not about sustainable transformation, so the brief says so and gives its nearest point instead of forcing the link.
  - Check questions: every answer is in its own chapter's summaries. One was changed for that reason during the work — a chapter-2 question first asked which regional innovation systems Isaksen and Trippl call favourable, which chapter 2's blocks do not say, so it now asks what Neffke and colleagues meant by saying new paths do not start from scratch.
  - Applying the P15 lessons before running the check: pages 491 and 493 were rewritten to cover their second halves (the later novel-application funding on 491; the public-opinion work on 493), Mahoney and Thelen's lineage for the typology is credited on 486, "some interviewees" keeps the scope of the page-490 claim, Table 1's three rows are given as the table gives them, and the brief avoids claiming anything about the paper's use of the word sustainability — its one use, on page 495, is about how durable the outcomes of each mode are.

  Claude Code review and fixes (2026-10-21, early review at the student's request, before the end of batch R2):
  - Claude read all 18 pages against `workspace/extracted/pages/P16/` and checked Lecture 5's use of page 491. WorkBuddy's best paper so far: every name, number, date and the "by no means" quote check out, and the "his" on page 491 is the paper's own. Six small problems fixed:
    1. Page 493: the Massive Entertainment founder led the forming of Game City, not the funding application.
    2. Page 483 now gives its main point: thick and diversified regional innovation systems are seen as excellent ground for new industries, yet may still hold constraints.
    3. Page 490 now includes the "outsiders or returnees" that the conclusions build on.
    4. Chapter 3's check answer uses only the chapter's wording.
    5. Page 489 names the paper's three constraints, so chapter 4's check answer matches its text.
    6. The brief's stray "not about sustainable transformation" sentence was removed (June 2025 Question 2 is about industrial restructuring).
  - The new lessons are in READINGS_PLAN.md section 10: fix the summary, not the question; attach each step to the right actor.
  - `check_reading.py P16`: PASS, no warnings (2,101 words, 18 of 18 pages). `build_audio.py P16`: 6 of 6 `[OK]`, 16.6 min (chapters 3 and 6 unchanged, from cache). `check_page.mjs`: `ALL PAGE CHECKS PASSED`, 3 readings ready.
  - WorkBuddy's version was kept in Claude's scratchpad as `P16.workbuddy.md`.
  - Published as version 14 of https://claude.ai/artifact/Nc3TALuXYR3W49sUshNs93 (P16-01 to P16-06 added). Gate R2-W stays at the end of the batch.

  Second WorkBuddy pass (2026-10-21, after that review and publish). Six page summaries still stopped before the end of their page, so each was completed:
  - page 481: the environment also holds support arrangements built up over time, not only industrial structures;
  - page 484: networking support that goes missing, and competing paths taking the policy attention;
  - page 485: the other two barriers (the economic selection environment, technological regimes), Simmie and colleagues' 2014 wind energy application, and Battilana and colleagues on change agents;
  - page 491: the entrepreneur had little institutional power at the regional level, which is why funding came through a novel application;
  - page 494: the changes relied on bringing other actors in, and change is often a collective endeavour;
  - page 495: the three questions left for future research.

  The text is now 2,095 words (was 2,133: the brief was untouched but the page blocks were tightened to stay inside 60–100 words). It was checked and recorded again, so the file, the audio and `site/data/P16.json` match each other but no longer match published version 14; Claude Code needs to republish at the gate.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py P16` (final text):

    P16: Miörner & Trippl 2017; 6 chapters, 2095 words (about 17 min of audio); 18 of 18 pages covered; 0 declared
      1. The paper in brief                        625 words  mean 19.5  max 33  inflated 0.0  pages the whole paper
      2. Why a constraining region can be turned   402 words  mean 17.5  max 27  inflated 0.0  pages cover, 481–484
      3. Key actors, three forms of power and thr  284 words  mean 15.8  max 27  inflated 3.5  pages 485–487
      4. Scania's games industry, and what held i  295 words  mean 19.7  max 39  inflated 0.0  pages 488–490
      5. Three new elements: the conference, the   297 words  mean 18.6  max 36  inflated 0.0  pages 491–493
      6. Conclusions and the reference list        192 words  mean 14.8  max 28  inflated 0.0  pages 494–497
    PASS

  No warnings; the 3.5 inflated words in chapter 3 are Simmie's own "paradigms".

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py P16` (final text):

    == P16: Reading 16: Paving the way for new regional industrial paths: actors and modes of change in Scania's games industry (6 chapters)
      [OK] P16-01.mp3:  4.7 min, 631 words, 134 wpm, -20.6 LUFS, 1.70 MB  (cache)
      [OK] P16-02.mp3:  3.2 min, 424 words, 131 wpm, -20.5 LUFS, 1.16 MB  (synthesised (attempt 1))
      [OK] P16-03.mp3:  2.5 min, 303 words, 121 wpm, -20.5 LUFS, 0.90 MB  (synthesised (attempt 1))
      [OK] P16-04.mp3:  2.4 min, 311 words, 131 wpm, -20.5 LUFS, 0.86 MB  (cache)
      [OK] P16-05.mp3:  2.3 min, 315 words, 136 wpm, -20.5 LUFS, 0.83 MB  (synthesised (attempt 1))
      [OK] P16-06.mp3:  1.6 min, 205 words, 130 wpm, -20.5 LUFS, 0.57 MB  (synthesised (attempt 1))
      total 16.7 min; data written to site/data/P16.json

  The two `(cache)` chapters are the brief and pages 488–490, whose text did not change in this pass.

  Sourced lines: none, still. Page pictures looked at: none exist (no `img/` folder, `"image": null` on every page); Table 1 on page 487 is printed as text in the page file, so its three rows were read from there. Pages whose kind guess was wrong: none, as in the note above.

- [x] P09 Hekkert et al. 2007 (413–432)

  Done 2026-10-21 by WorkBuddy. `readings/P09.md`: 6 chapters, 2122 words, 20 of 20 pages covered.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py P09`:

    P09: Hekkert et al. 2007; 6 chapters, 2122 words (about 17 min of audio); 20 of 20 pages covered; 0 declared
      1. The paper in brief                        502 words  mean 20.1  max 38  inflated 2.0  pages the whole paper
      2. Why a structural view of innovation syst  362 words  mean 19.1  max 37  inflated 0.0  pages 413–416
      3. From mapping structure to mapping functi  345 words  mean 17.2  max 30  inflated 0.0  pages 417–420
      4. Seven functions for analysing an innovat  466 words  mean 20.3  max 36  inflated 2.1  pages 421–425
      5. Motors of change, process analysis and t  352 words  mean 19.6  max 29  inflated 0.0  pages 426–429
      6. Conclusions and the reference list         95 words  mean 15.8  max 28  inflated 0.0  pages 430–432
    PASS

  No warnings: every page block is inside 60–100 words and no chapter carries a size warning. The 2.0 and 2.1 inflated words per 1000 are "mobilization" in chapters 1 and 4 — the paper's own name for the sixth function, not decoration — so they stay.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py P09`:

    == P09: Reading 9: Functions of innovation systems: a new approach for analysing technological change (6 chapters)
      [OK] P09-01.mp3:  3.9 min, 508 words, 131 wpm, -20.5 LUFS, 1.39 MB  (synthesised (attempt 1))
      [OK] P09-02.mp3:  2.9 min, 382 words, 133 wpm, -20.5 LUFS, 1.03 MB  (synthesised (attempt 1))
      [OK] P09-03.mp3:  2.9 min, 361 words, 125 wpm, -20.4 LUFS, 1.04 MB  (synthesised (attempt 1))
      [OK] P09-04.mp3:  3.8 min, 485 words, 129 wpm, -20.5 LUFS, 1.35 MB  (synthesised (attempt 1))
      [OK] P09-05.mp3:  2.8 min, 371 words, 132 wpm, -20.5 LUFS, 1.02 MB  (synthesised (attempt 1))
      [OK] P09-06.mp3:  0.8 min, 106 words, 126 wpm, -20.5 LUFS, 0.30 MB  (synthesised (attempt 1))
      total 17.0 min; data written to site/data/P09.json

  Every chapter was synthesised on its first attempt; the voice service did not throttle this time. The build was run again after the last text edit, so the audio and `site/data/P09.json` match the checked text.

  Every `<!-- sourced: -->` line: none. Nothing needed declaring. The only two figures are Figure 1 on page 417 and Figure 2 on page 426, and both are in the page files as text: `page-417.txt` carries the caption "Fig. 1. Boundary relations between National, Sectoral, and Technology Specific Innovation Systems." plus the boxes NSI 1–4, SSI 1–3 and TSIS 1, and `page-426.txt` carries "Fig. 2. Three typical motors of change." plus the motor A, B and C references. So every term used in those page blocks is body text the check can see.

  Page pictures looked at (1, the only one that exists for this paper):
  - `workspace/extracted/pages/P09/img/page-413.png` — the title page, with title, author affiliations, abstract and keywords, then the start of the introduction. No figure. Kind article, confirmed.

  Pages whose kind guess was wrong: none. All 20 guesses hold — 413–429 are article pages, 430 is mixed (the conclusions, then the acknowledgements, then the REFERENCES heading part-way down), and 431–432 are the reference list. There is no cover sheet for this paper, so chapter 1 is `<!-- pages: all -->` and chapter 2 starts on 413. Note that Figures 1 and 2 have no extracted pictures: `pages.json` gives `"image": null` for pages 417 and 426, so both are described from the label text in their page files and from what the surrounding text says about them, not from an image.

  Notes on this paper:
  - Chapters follow the paper's own sections: ch2 `413-416` (abstract, introduction, the innovation system approach, the technology specific system); ch3 `417-420` (Figure 1, why dynamics matter, earlier lists of functions, the three reasons for a functions approach); ch4 `421-425` (Smits and Kuhlman's instruments, then the seven functions one by one); ch5 `426-429` (motors of change, vicious cycles, process analysis, functionalism); ch6 `430-432` (conclusions, acknowledgements, references).
  - The brief links the paper to Lecture 6, Technological innovation systems, which uses the seven functions to assess the Norwegian carbon capture case, and to the December 2024 exam, Question 3. The lecture's answer is attributed to the lecture and the paper's own advice (page 430) follows it; the closing example is labelled as ours, not the paper's.
  - Three checker traps in this paper. (1) The paper writes "Smits and Kuhlman", with one n, on pages 420 and 421, so the summaries use the page spelling; "Kuhlmann" was flagged as a name not on the page. (2) Writing `(pages 416, 424, 425, 427)` failed: the number check strips `pages N` one-to-one only, so 424, 425 and 427 leaked through as numbers not on page 414. The parenthetical was dropped, since the process-analysis sentence already cites `pages 427-428`. (3) Chapter 1's mean sentence length came in at 21.3 against a 21.0 limit and the exam sentence was split.
  - Applying the earlier lessons before running the check: page 415's lock-in argument is kept because page 429 returns to it; page 422's biofuels illustration is included rather than left as a bare mention; the brief says "several of them are cases the authors or their colleagues studied earlier" rather than "most", so the claim does not outrun the paper's footnotes; and both chapter-2 check answers use only wording that pages 414 and 416 carry.

  Claude Code review and fixes (2026-10-21, early review at the student's request, before the end of batch R2):
  - **Audio:** genuine. Every chapter was in the recorder's cache, the data file matched the text, and speeds were normal (125–133 wpm).
  - **Checker:** the page-list trap above is fixed. `check_reading.py` now accepts lists such as "pages 416, 424, 425 and 427" and checks each page number in them. All readings still pass.
  - **Nine content fixes:**
    1. Page 422 never mentioned function 2, knowledge development, which is defined there. Added: learning by searching and by doing, mapped through R&D projects, patents and R&D investment.
    2. Page 422's biofuels example is now what the page says: Dutch firms lobbied together for a tax exemption while competing for R&D money. Suurs and Hekkert's finding is kept as a separate point: incumbents that diversify are more active in fulfilling system functions than start-ups.
    3. Pages 427–429 had drifted by half a page. Each page now summarises its own content:
       - 427: the event, Van de Ven's Minnesota studies, and newspaper and journal sources;
       - 428: allocation, the first Dutch results, rating, storyline, and the two features of functionalism;
       - 429: the rejection of those features, Parsons and Merton, and the start of the conclusions.
    4. The brief no longer says solar cells and hydrogen were "cases the authors or their colleagues studied earlier". They are illustrations. It now says the functions draw on empirical studies at Utrecht (page 421) and that the first Dutch studies found the functions fit the data (page 428).
    5. Motors of change (brief and page 426) now come from the authors' empirical work, as the page says, not "because" there are few starting points.
    6. Page 424:
       - "Where no structural exemption blocked such initiatives" read the wrong way round. It now says the lack of an exemption blocked them.
       - Protected space is now niche markets, with tax regimes and quotas as a separate temporary advantage.
    7. "Kuhlman" is now Kuhlmann, one of the paper's own authors (page 413, reference 1), declared with a `<!-- sourced: -->` line.
    8. The Lecture 6 sentence: the lecture introduces the seven functions, but its carbon capture case uses a longer list (with materialisation), so the two are not identical.
    9. Two smaller fixes in the brief and page 427:
       - The brief's claim that "fulfilling one function quite likely affects the others" now cites pages 425–426 rather than page 426.
       - Page 427's "rather than a correlation" is gone.
  - The lessons are in READINGS_PLAN.md section 10, and four new bullets are in WorkBuddy's prompt.
  - `check_reading.py P09`: PASS (2,233 words, 20 of 20 pages, 1 declared, no warnings).
  - WorkBuddy's version was kept in Claude's scratchpad as `P09.workbuddy.md`.
  - Re-recorded by Claude with `build_audio.py P09`. Chapters 1, 3, 4 and 5 were synthesised on attempt 1, and chapters 2 and 6 came from the cache because they had not changed. All six are `[OK]`: 126–133 wpm, −20.4 to −20.5 LUFS, 18.1 min. The data file matches the text.
  - `site/reviewed.json` now lists P09. `build_site.py` and `check_page.mjs` passed (ALL PAGE CHECKS PASSED). Published as version 17 of the companion; the file listing shows `audio/P09-01.mp3` to `P09-06.mp3`.

- [x] P10 Steen et al. 2024 (1–16)

  Done 2026-10-21 by WorkBuddy. `readings/P10.md`: 6 chapters, 1790 words, 16 of 16 pages covered.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py P10`:

    P10: Steen et al. 2024; 6 chapters, 1790 words (about 14 min of audio); 16 of 16 pages covered; 0 declared
      1. The paper in brief                        589 words  mean 20.3  max 37  inflated 3.4  pages the whole paper
      2. The question, the framework and the Norw  354 words  mean 17.7  max 35  inflated 0.0  pages 1–4
      3. Knowledge, experimentation, markets and   269 words  mean 19.2  max 33  inflated 0.0  pages 5–7
      4. Resources, legitimacy and the verdict on  262 words  mean 17.5  max 41  inflated 3.8  pages 8–10
      5. Conclusions, limitations and the appendi  237 words  mean 16.9  max 30  inflated 4.2  pages 11–13
      6. The interview guide and the reference li   79 words  mean 19.8  max 38  inflated 0.0  pages 14–16
    PASS

  No warnings: every page block is inside 60–100 words and no chapter carries a size warning. The inflated counts are "mobilization", the paper's own name for one of its functions, in chapters 1, 4 and 5.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py P10`:

    == P10: Reading 10: CCS technological innovation system dynamics in Norway (6 chapters)
      [OK] P10-01.mp3:  4.5 min, 595 words, 132 wpm, -20.6 LUFS, 1.63 MB  (synthesised (attempt 1))
      [OK] P10-02.mp3:  3.0 min, 372 words, 126 wpm, -20.5 LUFS, 1.07 MB  (synthesised (attempt 1))
      [OK] P10-03.mp3:  2.2 min, 285 words, 127 wpm, -20.4 LUFS, 0.81 MB  (synthesised (attempt 1))
      [OK] P10-04.mp3:  2.3 min, 278 words, 122 wpm, -20.6 LUFS, 0.82 MB  (synthesised (attempt 1))
      [OK] P10-05.mp3:  1.9 min, 250 words, 128 wpm, -20.6 LUFS, 0.70 MB  (synthesised (attempt 1))
      [OK] P10-06.mp3:  0.8 min,  92 words, 119 wpm, -20.7 LUFS, 0.28 MB  (synthesised (attempt 1))
      total 14.7 min; data written to site/data/P10.json

  Every chapter was synthesised on its first attempt; the voice service did not throttle. The build ran after the last text edit, so the audio and `site/data/P10.json` match the checked text.

  Every `<!-- sourced: -->` line: none. Nothing needed declaring. Fig. 1's timeline labels and Table 2's publication counts sit in `page-5.txt` as well as in the picture, and Table 3, Appendix 1, Appendix 4 and Appendix 5 are printed as text in their page files, so every term used in the summaries is text the check can see.

  Page pictures looked at (2, the only ones that exist for this paper):
  - `workspace/extracted/pages/P10/img/page-1.png` — the title page: journal banner, title, the ten authors and their affiliations, keywords, abstract, and the first columns of the introduction. No figure. Kind article, confirmed.
  - `workspace/extracted/pages/P10/img/page-5.png` — Fig. 1, "Timeline of key events - CCS in Norway", read box by box: 1991 CO2 tax, 1996 Sleipner, 2006 Mongstad announced, 2013 Mongstad abandoned, 2019 first storage licence, 2008 Snøhvit, 2005 Gassnova, 2008–2011 FME BIGCCS, 2014–2024 FME NCCS, 2020 Longship launched, 2005 CLIMIT, 2012 TCM, 2018–19 feasibility studies, 2016 Paris agreement, 2021 broad variety of projects, and the dashed note on 1977–2020 operational projects. Table 2 read row by row: SINTEF 247, NTNU 213, Bergen 86, Oslo 85, Stavanger 56, Equinor 49, NMBU 48, TNO 29, and the rest down to 20.

  Pages whose kind guess was wrong: none. All 16 guesses hold — 1–13 are article pages, 14 is mixed (the tail of the Appendix 4 quotes, Appendix 5, then the References heading part-way down), and 15–16 are the reference list. There is no cover sheet, so chapter 1 is `<!-- pages: all -->` and chapter 2 starts on page 1. Note that Fig. 2 and Fig. 3 (page 6), Fig. 4 (page 8) and Fig. I and Fig. II (page 12) have no extracted pictures — `pages.json` gives `"image": null` for those pages — so they are described from their captions and from the numbers the text states, never from a value read off a chart.

  Notes on this paper:
  - Chapters follow the paper's sections: ch2 `1-4` (abstract and introduction, the TIS framework, method and setting, then the structural components); ch3 `5-7` (knowledge development and diffusion, entrepreneurial experimentation, market formation, direction of search); ch4 `8-10` (resources, legitimacy, externalities, materialization, Table 3, the discussion and the start of the conclusions); ch5 `11-13` (conclusions, limitations, CRediT and funding, Appendices 1–4); ch6 `14-16` (end of Appendix 4, Appendix 5, references).
  - The paper's own codes are inconsistent once: page 9 calls resource mobilization F4, while Table 1 and section 4.2.5 make it F5. The summaries avoid the codes except where the paper is consistent, so nothing repeats the slip.
  - The brief links the paper to Lecture 6, Technological innovation systems and sustainable transformation, where it is the academic CCS case that follows Hekkert's functions, and to the June 2025 exam, Question 3 on guiding technological innovation systems. The lecture's exam tip gives both December 2024 Question 3 and June 2025 Question 3; the brief quotes the June one, which matches what the paper does with weak functions.
  - Applying the earlier lessons before running the check: page 2, 3, 7, 8 and 10 were each rewritten to reach the end of the page, so the sectoral context on 3, the market and search sections on 7, the legitimacy opening on 8 and the context discussion on 10 are all covered; page 9 now names the three weak functions so chapter 4's check answer can be answered from the chapter; page 13 credits the "peaks and troughs" quote to a cluster rather than to the technology supplier who says "hype"; and page 7 says market formation is "growing from a low base" rather than calling it weak, which is the later Table 3 verdict, not the page's claim.
  - Three checker failures were fixed in the text, never the check: chapter 1's mean sentence was 21.5 and chapter 3's 21.9, both against a 21.0 limit, and chapter 6 carried 12.8 inflated words per 1000 because a 79-word chapter held one use of "mobilization". Chapter 4 then reached 7.6 for the same reason, so page 8 now says "Resources come in two halves" and keeps the paper's term for the Table 3 sentence on page 9.

  Claude Code review and fixes (2026-10-21, batch R2-W check):
  - **Audio:** genuine. Each chapter's cache entry was written seconds before its MP3, the data file matched the text, and speeds were normal (119–132 wpm).
  - **Eleven content fixes:**
    1. Brief: momentum is positive "not least" because of large-scale project launches and more actors (page 10). The legitimacy gain from moving into industry is now its own sentence (page 9).
    2. Brief and page 3: only the September 2022 workshop validated findings; the December 2021 one, with the CaptureX advisory board, supplied notes.
    3. Brief: "the paper answers… aim policy at them" was the lecture's advice. It now credits the lecture and gives the paper's own points (page 3, policy recommendations; page 10, a broader policy mix).
    4. Page 2:
       - "The last study of Norwegian CCS" is now "the earlier TIS study" (Normann 2017 also studied Norwegian CCS), in the summary and the chapter 2 check answer.
       - The White Paper now says what it says: Norway can play an important role in developing CCS.
       - Longship is added, and the question no longer "ends the introduction".
    5. Page 1: the added "because" is gone, and the research gap is in (little social science research; most studies stay in one sector).
    6. Page 4: the institutions half is in (no strong opposition, the ETS seen as insufficient, the cross-border transfer bottleneck), plus "a key driver" rather than "driven by", and why Mongstad was cancelled.
    7. Page 7: the solutions were developed and tested *at* TCM. Early supplier choice kept costs down, and two suppliers reflected the state's wish for variety.
    8. Page 8: "slightly concerned", not "expect a gap"; "two halves" is gone.
    9. Page 9: positive externalities are present (specialised suppliers in every segment); only learning across projects is limited.
    10. Page 10:
        - The comparison now includes the strengthened direction of search and experimentation, in the summary and the chapter 4 check answer.
        - "Power supply rather than CO2" is now "lack of power supply halting some projects".
        - The conclusions' point that support beyond Longship is not yet enough for investment decisions is added.
    11. Smaller ones:
        - Page 14 has three quotes, not two.
        - The brief no longer adds "no other route to deep cuts", and it lists public acceptance among the challenges.
        - The brief's contribution paragraph now separates the empirical aims from the contribution to the literature.
  - The lessons are in READINGS_PLAN.md section 10, and three new bullets are in WorkBuddy's prompt.
  - `check_reading.py P10`: PASS (1,886 words, 16 of 16 pages, no warnings). One failure along the way was Claude's own: "resource mobilization" on page 10 pushed chapter 4 to 7.4 inflated words per 1000, so page 10 now says "resources".
  - WorkBuddy's version was kept in Claude's scratchpad as `P10.workbuddy.md`.
  - Re-recorded by Claude with `build_audio.py P10`. Chapters 1–4 and 6 were synthesised on attempt 1, and chapter 5, unchanged, came from the cache. All six are `[OK]`: 118–131 wpm, −20.4 to −20.7 LUFS, 15.4 min. The data file matches the text.
  - `site/reviewed.json` now lists P10. `build_site.py` and `check_page.mjs` passed (ALL PAGE CHECKS PASSED). Published as version 18 of the companion; the file listing shows `audio/P10-01.mp3` to `P10-06.mp3` at the local sizes.
  - **Batch R2-W (P15, P16, P09, P10) is checked and published.** The gate waits for the student's "APPROVED GATE R2-W" after listening.

- [x] **STOP GATE R2-W:** student approved
  - Evidence: the student wrote to Claude Code on 2026-10-23: "I approved all", in reply to the list of open gates R2-W, R2-A, R3-W, R3-A and R4.
  - P16's chapters 2, 3, 5 and 6 on the live site were still the version-14 recordings; they were republished in version 26 (see the R4 check below).

## Gate R3
- [x] P17 Njøs et al. 2020 (cover, 266–288)

  Done 2026-10-21 by WorkBuddy. `readings/P17.md`: 6 chapters, 2235 words, 24 of 24 pages covered.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py P17`:

    P17: Njøs et al. 2020; 6 chapters, 2235 words (about 18 min of audio); 24 of 24 pages covered; 2 declared
      1. The paper in brief                        616 words  mean 19.2  max 34  inflated 0.0  pages the whole paper
      2. The argument, the EEG gap and the defini  289 words  mean 20.6  max 42  inflated 0.0  pages cover, 266–268
      3. Regional capabilities, agency and policy  331 words  mean 19.5  max 38  inflated 3.0  pages 269–272
      4. The method, the region and the two techn  341 words  mean 18.9  max 38  inflated 0.0  pages 273–276
      5. The CCS case and the battery case         324 words  mean 18.0  max 31  inflated 0.0  pages 277–280
      6. The comparison, the discussion and the r  334 words  mean 20.9  max 42  inflated 0.0  pages 281–288
      declared: bergen (page 275, Figure 1 map label, one of the two largest cities in southwestern Norway)
      declared: stavanger (page 275, Figure 1 map label, the other largest city in the region)
    PASS

  No warnings: every page block is inside 60–100 words and no chapter carries a size warning. Chapter 3's 3.0 inflated words per 1000 is one use of "resource mobilization", the paper's own name for a function.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py P17`:

    == P17: Reading 17: Expanding analyses of path creation: interconnections between territory and technology (6 chapters)
      [OK] P17-01.mp3:  4.9 min, 622 words, 126 wpm, -20.5 LUFS, 1.78 MB  (synthesised (attempt 1))
      [OK] P17-02.mp3:  2.6 min, 309 words, 117 wpm, -20.4 LUFS, 0.95 MB  (synthesised (attempt 1))
      [OK] P17-03.mp3:  2.9 min, 350 words, 121 wpm, -20.5 LUFS, 1.04 MB  (synthesised (attempt 1))
      [OK] P17-04.mp3:  2.9 min, 359 words, 123 wpm, -20.5 LUFS, 1.05 MB  (synthesised (attempt 1))
      [OK] P17-05.mp3:  2.8 min, 341 words, 121 wpm, -20.5 LUFS, 1.02 MB  (synthesised (attempt 1))
      [OK] P17-06.mp3:  2.8 min, 354 words, 126 wpm, -20.4 LUFS, 1.01 MB  (synthesised (attempt 1))
      total 19.0 min; data written to site/data/P17.json

  Every chapter was synthesised on its first attempt; the voice service did not throttle. The build ran after the last text edit, so the audio and `site/data/P17.json` match the checked text.

  Every `<!-- sourced: -->` line (2):
  - `<!-- sourced: Bergen | page 275, Figure 1 map label, one of the two largest cities in southwestern Norway -->` — the map labels the city; page 275's text names only Oslo, so the caption alone does not carry it.
  - `<!-- sourced: Stavanger | page 275, Figure 1 map label, the other largest city in the region -->` — same reason.

  Page pictures looked at (2, the only ones that exist for this paper):
  - `workspace/extracted/pages/P17/img/page-266.png` — the title page: journal banner, title, the four authors with the Mohn Centre affiliation and Bergen addresses, keywords (path creation, EEG, TIS, carbon capture and storage, maritime battery technology), the abstract, and the licence note. No figure. Kind article, confirmed.
  - `workspace/extracted/pages/P17/img/page-275.png` — Figure 1, "Norway. Studied region in grey, showing the two largest cities in southwestern Norway and the capital Oslo", source Wikipedia/CC BY-SA 2.5, modified by Emil Tomson Lindfors. Read the labels: the grey band covers the southwest coast, with Bergen and Stavanger marked inside it and Oslo marked in the southeast. The page's text above the figure gives the CCS numbers (14 percent, 2,500 facilities by 2040, eighteen operating, five under construction, twenty in development, forty million tons).

  Pages whose kind guess was wrong: none. All 24 guesses hold — `cover` is the publisher's sheet, 266–283 are article pages, 284 is mixed (the end of the discussion, then the References heading part-way down), and 285–288 are the reference list. Fig. 1 is on page 275 and is the only figure; Table 1 (page 272) and Table 2 (page 281) are printed as text in their page files, so both were read from there as well as by eye.

  Notes on this paper:
  - Chapters follow the paper's sections: ch2 `cover, 266-268` (abstract, introduction, the EEG gap, the definition of path creation and Martin's phases); ch3 `269-272` (the four EEG topics, the TIS functions and Table 1); ch4 `273-276` (the interconnected dimensions, method, the region, Fig. 1 and the two technologies); ch5 `277-280` (the CCS case, then the battery case); ch6 `281-288` (Table 2, the discussion, future research and the reference list).
  - The brief links the paper to Lecture 9, Summary and exam preparation, which uses pages 266 and 268 for the point that neither territory nor technology alone explains path creation, and to the June 2025 exam, Question 2 on regional innovation systems and industrial restructuring. The lecture's own exam tip stresses the words "promote or inhibit", which the two cases supply.
  - Checker fixes, all in the text: chapter 1's mean sentence was 24.6 and needed six sentences split; "Summary" in the lecture's title failed as a name not in the paper, so the brief calls it "the course's summary and exam-preparation session"; "Asian" failed because page 276 writes "Asia"; and page 284's block was 57 words, so the paper's own "early attempt" sentence was added.
  - Applying the earlier lessons before running the check: the brief does not say the two cases were chosen "so the framework could be tested", only that they sit in one region in different phases (page 273); page 271 names all seven functions in the paper's own words rather than truncating one; and the Map's two city labels are declared rather than dropped.

  Claude Code review and fixes (2026-10-22, early review at the student's request, before the end of batch R3):
  - **Audio:** genuine. Each chapter's cache entry was written seconds before its MP3, the data file matched the text, and speeds were normal (117–126 wpm). The two `sourced` lines are right: Claude opened `img/page-275.png`, and the map labels Bergen and Stavanger.
  - **Ten content fixes:**
    1. Brief: the exam link is now marked as our own reading. Lecture 9 takes page 266's point and page 268's definition; the brief had said both pages carry the point.
    2. Brief: the paper's own two research questions (page 267), not "how new green industries emerge".
    3. Page 274 and brief: the expectation the cases test. On EEG's terms, two technologies in one region should be similarly influenced.
    4. Page 276:
       - TCM sparked surprisingly little commercial activity, which the authors explain by national processes and the technology;
       - the "three hundred" battery ships include those under construction.
    5. Page 277: the national strategy resembles a breakthrough strategy; TCM gives guidance, but the search lacks momentum; the Paris Agreement renewed interest.
    6. Page 278: informants see strong legitimation for CCS in Norway, and companies are waiting for the decision.
    7. Page 279:
       - "explain" is now "are important for explaining";
       - the battery path's regional capabilities and bottom-up anchoring are added.
    8. Page 283: the main conclusion is added. The regional level can be less influential than EEG expects, and for CCS technology-specific explanations appear crucial.
    9. Brief: the seventy ferry lines "were expected"; the authors did not forecast them themselves.
    10. Smaller fixes:
        - Page 275: the facilities "will capture and store".
        - Page 272: EEG has left demand largely unconsidered, quoting Martin and colleagues.
  - The lessons are in READINGS_PLAN.md section 10, and three new bullets are in WorkBuddy's prompt.
  - `check_reading.py P17`: PASS, no warnings. Two sentence-length failures from Claude's own rewrites (pages 278 and 283) were split.
  - WorkBuddy's version was kept in Claude's scratchpad as `P17.workbuddy.md`.
  - Re-recorded by Claude with `build_audio.py P17`. Chapters 1 and 3–6 were synthesised on attempt 1, and chapter 2, unchanged, came from the cache. All six are `[OK]`: 117–125 wpm, −20.3 to −20.5 LUFS, 19.7 min. The data file matches the text.
  - `site/reviewed.json` now lists P17. `build_site.py` and `check_page.mjs` passed (ALL PAGE CHECKS PASSED). Published as version 19 of the companion; the file listing shows `audio/P17-01.mp3` to `P17-06.mp3` at the local sizes. Gate R3-W stays at the end of the batch.

- [x] P11 Bargoni et al. 2024 (1109–1133)

  Done 2026-10-22 by WorkBuddy. `readings/P11.md`: 7 chapters, 2404 words, 25 of 25 pages covered.

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py P11`:

    P11: Bargoni et al. 2024; 7 chapters, 2404 words (about 19 min of audio); 25 of 25 pages covered; 4 declared
      1. The paper in brief                        603 words  mean 12.8  max 24  inflated 5.0  pages the whole paper
      2. The question, the three research questio  364 words  mean 16.5  max 30  inflated 2.7  pages 1109–1112
      3. The three tools, the publication trends   387 words  mean 16.8  max 26  inflated 0.0  pages 1113–1116
      4. Social capital, platform innovation, the  364 words  mean 17.3  max 35  inflated 0.0  pages 1117–1120
      5. The discussion and what the clusters mea  288 words  mean 16.9  max 26  inflated 0.0  pages 1121–1123
      6. Twenty-five questions for future researc  285 words  mean 12.4  max 24  inflated 0.0  pages 1124–1126
      7. The limitations and the reference list    113 words  mean 16.1  max 33  inflated 0.0  pages 1127–1133
      declared: 933 (page 1112, Figure 1 box, articles left after the two subject areas)
      declared: 888 (page 1112, Figure 1 box, articles left after the peer-review criterion)
      declared: 410 (page 1112, Figure 1 box, articles left after titles and abstracts)
      declared: 8854 (page 1114, Table 1 row "References", printed there as 8,854)
    PASS

  No warnings: every page block is inside 60–100 words and no chapter carries a size warning. The inflated words are the paper's own vocabulary: "foster" and "paradigm" in the brief (5.0 per 1000) and "foster" once on page 1110 (2.7).

  Full output of `C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py P11`:

    == P11: Reading 11: Crowdfunding and innovation: a bibliometric review and future research agenda (7 chapters)
      [OK] P11-01.mp3:  5.0 min, 609 words, 122 wpm, -20.5 LUFS, 1.79 MB  (synthesised (attempt 1))
      [OK] P11-02.mp3:  3.3 min, 383 words, 114 wpm, -20.5 LUFS, 1.21 MB  (synthesised (attempt 1))
      [OK] P11-03.mp3:  3.5 min, 408 words, 117 wpm, -20.5 LUFS, 1.26 MB  (synthesised (attempt 1))
      [OK] P11-04.mp3:  3.1 min, 385 words, 125 wpm, -20.5 LUFS, 1.11 MB  (synthesised (attempt 1))
      [OK] P11-05.mp3:  2.5 min, 305 words, 121 wpm, -20.4 LUFS, 0.91 MB  (synthesised (attempt 1))
      [OK] P11-06.mp3:  2.5 min, 298 words, 119 wpm, -20.4 LUFS, 0.90 MB  (synthesised (attempt 1))
      [OK] P11-07.mp3:  1.1 min, 127 words, 117 wpm, -20.6 LUFS, 0.39 MB  (synthesised (attempt 1))
      total 21.0 min; data written to site/data/P11.json

  Every chapter was synthesised on its first attempt; the voice service did not throttle. The build ran after the last text edit, so the audio and `site/data/P11.json` match the checked text.

  Every `<!-- sourced: -->` line (4):
  - `<!-- sourced: 933 | page 1112, Figure 1 box, articles left after the two subject areas -->` — the figure's third box; the page text writes it as "n 5 933", which the checker's number reader joins into "5933", so the value is declared from the picture.
  - `<!-- sourced: 888 | page 1112, Figure 1 box, articles left after the peer-review criterion -->` — same reason.
  - `<!-- sourced: 410 | page 1112, Figure 1 box, articles left after titles and abstracts -->` — same reason.
  - `<!-- sourced: 8854 | page 1114, Table 1 row "References", printed there as 8,854 -->` — Table 1 is an image, so the value appears nowhere in the page text.

  Page pictures looked at (5, the only ones that exist for this paper):
  - `workspace/extracted/pages/P11/img/page-1112.png` — Figure 1, "Methodological approach – PRISMA flow diagram": six boxes down the left (2,544 retrieved; 2,487; 933; 888; 410; 150 in the quantitative synthesis), each with its inclusion criterion in a box to the right (English language; subject areas Business, Management and Accounting and Economics, Econometrics and Finance; peer reviewed articles; title-abstract; total number of studies included).
  - `workspace/extracted/pages/P11/img/page-1114.png` — Table 1, "Main info dataset", eleven rows: timespan 2010:2022, sources 115, documents 150, average citations per document 31, average citations per year per doc 5, references 8,854, keywords plus (ID) 188, author's keywords (DE) 464, authors 379, author appearances 414, single-authored documents 22. Figure 2, "Publication trends": two lines over 2010–2022, total studies in orange and TC/TS in black, with 0–40 on the left axis and 0–550 on the right.
  - `workspace/extracted/pages/P11/img/page-1115.png` — Figure 3, "Articles cocitation network of cited references": a VOSviewer map on black, with the red cluster A, the green cluster B and the blue cluster C, and Mollick and Nanda (2016) at the centre. Author-year labels only.
  - `workspace/extracted/pages/P11/img/page-1119.png` — Figure 4, "Keywords co-occurrence network", a VOSviewer map with "crowdfunding" and "innovation" as the largest nodes; and Table 2, seven clusters with 12, 11, 10, 9, 9, 8 and 7 items and their topics.
  - `workspace/extracted/pages/P11/img/page-1120.png` — Figure 5, "Conceptual thematic map": density on the vertical axis, centrality on the horizontal, quadrant labels niche, motor, emerging and basic. Bubbles read: venture financing in the niche quadrant, start-ups and reward-based crowdfunding in the motor quadrant, alternative finance, signalling, equity crowdfunding, fintech and crowdfunding along the centre and right, finance alone in the emerging quadrant.

  Pages whose kind guess was wrong: one. Page 1133 is not a reference list but the "About the authors" notes on the four authors plus the reprint and permissions lines. It is summarised in one sentence under a references-kind block, which the checker accepts; pages 1128–1132 are the reference list, and 1127 is mixed as guessed (the end of cluster C, then the limitations section, then the References heading and the first two entries).

  Notes on this paper:
  - Chapters follow the paper's sections: ch2 `1109-1112` (abstract, introduction, RQ1–RQ3, method, Fig. 1); ch3 `1113-1116` (the three analytical tools, §3.1 publication trends with Table 1 and Fig. 2, §3.2 co-citation with Fig. 3, clusters A and B); ch4 `1117-1120` (social capital, cluster C, §3.3 keywords with Fig. 4 and Table 2, §3.4 thematic map with Fig. 5); ch5 `1121-1123` (§4 discussion, 4.1 theoretical, 4.2 managerial, §5 opens); ch6 `1124-1126` (Table 3); ch7 `1127-1133` (the mixed page, the reference list, the author notes).
  - The brief links the paper to the bonus lecture, The art of crowdfunding, which uses the page 1120 thematic map on slide 35 to explain motor, basic, emerging and niche themes. The lecture records that crowdfunding was not on the December 2024 or June 2025 exam, and the exam example in the brief is the lecture's own, marked as ours, not the paper's.
  - Checker fixes, all in the text: chapter 1's mean sentence was 26.0 with one sentence of 55 words, so the brief was rewritten in shorter sentences (now 12.8 and 24); 933, 888 and 410 and Table 1's 8,854 were declared from the pictures; chapter 6's mean was 23.6, so three page blocks were split into shorter sentences; chapter 7 carried "holistic" once in 113 words (8.8 per 1000), now "overall".
  - Caught in the compare step before the check: Table 3 starts on page 1124 and ends on 1125, so it runs over two pages, not three. Page 1118 gives a threshold of seven keyword occurrences for Figure 4 while page 1119 says only keywords appearing at least three times were included; each block reports its own page's threshold and does not reconcile them.
  - Lessons applied: every managerial claim on page 1123 is attached to the cluster that makes it; the brief keeps the paper's hedge that work indexed elsewhere "may be missing"; the paper's spelling "Molllick" on page 1115 is not copied, since page 1116 prints Mollick; and no cause or contrast was added that the page does not state.

  Claude Code review and fixes (2026-10-22, early review at the student's request, before the end of batch R3):
  - **Audio:** genuine. Each chapter's cache entry was written seconds before its MP3, and the data file matched the text. The four `sourced` numbers are right: Claude opened `img/page-1114.png`, and Table 1 prints 8,854. The keyword-threshold note (7 on page 1118, 3 on page 1119) was a good catch.
  - **Nine content fixes:**
    1. Page 1124 now covers Table 3's cluster B block as well as cluster A; the draft gave it four words.
    2. Page 1126 now covers its cluster B half: crowdfunding as a setting for open innovation, the knowledge flow among initiators, pledgers, donors and platforms, and the open questions. The opening of cluster C is added too.
    3. Brief, exam paragraph:
       - the garbled sentence is rewritten;
       - the crowdfunding-as-agency link is credited to the Bonus lecture, followed by an example that is really ours (page 1125: firms may use crowdfunding to reduce uncertainty about demand);
       - "in cultural-creative crowdfunding", which is P12's term, is removed.
    4. Brief and page 1116: "an embodiment of open innovation" is credited to Stanko and Henard, and page 1116 now names them, so chapter 3's check question can be answered.
    5. Page 1115: Chan and Parhankangas's finding is added. Backers join campaigns they see as familiar and feasible.
    6. Brief: "a holistic view and a research agenda" cites page 1127; "the first study" stays on page 1121.
    7. Page 1123:
       - the authors only "posit" that social media links "could" help;
       - the page-end point on why innovation is hard to finance is added.
    8. Page 1127 says that the reference list begins there.
    9. Attributions:
       - page 1113: "most popular relational technique" is credited to Akbari and colleagues;
       - page 1114: the platform link is credited to Shneor and Vik;
       - page 1117 and the brief: the social capital definition says "an individual or social unit".
  - The lessons are in READINGS_PLAN.md section 10, and three new bullets are in WorkBuddy's prompt.
  - `check_reading.py P11`: PASS, no warnings. Five pages were 1–2 words over 100 after Claude's rewrites and were trimmed.
  - WorkBuddy's version was kept in Claude's scratchpad as `P11.workbuddy.md`.
  - Re-recorded by Claude with `build_audio.py P11`. Chapters 1 and 3–7 were synthesised on attempt 1, and chapter 2, unchanged, came from the cache. All seven are `[OK]`: 112–125 wpm, −20.4 to −20.6 LUFS, 21.5 min. The data file matches the text.
  - `site/reviewed.json` now lists P11. `build_site.py` and `check_page.mjs` passed (ALL PAGE CHECKS PASSED). Published as version 20 of the companion; the file listing shows `audio/P11-01.mp3` to `P11-07.mp3` at the local sizes. Gate R3-W stays at the end of the batch.

- [x] P12 Demattos Guimarães, Maehle & Bonet 2024 (1–15)
  - Chapters: 5, following the paper's own sections. Ch1 "The paper in brief" (`pages: all`, 605 words, two checks); ch2 `1-4` (abstract, introduction, the gap, the CCCF definition, the platforms, the four cultural policy paradigms); ch3 `5-8` (the three-point CCCF puzzle, the two Delphi panels, Figure 2's research design, the 89-platform database and its six coding dimensions); ch4 `9-12` (Table 1's full counts, the institutional structures, the scope findings, Figure 3); ch5 `13-15` (the discussion, the conclusions, the reference list). Pages 14 and 15 are `kind: references`.
  - `check_reading.py P12`:
    ```
    P12: Demattos Guimarães, Maehle & Bonet 2024; 5 chapters, 1909 words (about 15 min of audio); 15 of 15 pages covered; 1 declared
      1. The paper in brief                        605 words  mean 15.5  max 30  inflated 3.3  pages the whole paper
      2. The gap, the CCCF concept, the platforms  396 words  mean 19.8  max 41  inflated 2.5  pages 1–4
      3. The puzzle, the two Delphi panels and th  390 words  mean 18.6  max 37  inflated 0.0  pages 5–8
      4. What the mapping found: the table, the p  394 words  mean 17.1  max 30  inflated 0.0  pages 9–12
      5. The discussion, the conclusions and the   124 words  mean 20.7  max 37  inflated 0.0  pages 13–15
      declared: négrier (page 4, the paper prints the name as N´egrier, with a broken accent in the PDF)
    PASS
    ```
  - `build_audio.py P12`:
    ```
    == P12: Reading 12: The relational forms of cultural-creative crowdfunding: a typology of practices through mapping platforms in Europe and Latin America (5 chapters)
      [OK] P12-01.mp3:  4.7 min, 611 words, 129 wpm, -20.4 LUFS, 1.71 MB  (synthesised (attempt 1))
      [OK] P12-02.mp3:  3.2 min, 417 words, 130 wpm, -20.3 LUFS, 1.16 MB  (synthesised (attempt 1))
      [OK] P12-03.mp3:  3.2 min, 410 words, 129 wpm, -20.4 LUFS, 1.14 MB  (synthesised (attempt 1))
      [OK] P12-04.mp3:  3.5 min, 415 words, 119 wpm, -20.4 LUFS, 1.25 MB  (synthesised (attempt 1))
      [OK] P12-05.mp3:  1.1 min, 140 words, 127 wpm, -20.4 LUFS, 0.40 MB  (synthesised (attempt 1))
      total 15.7 min; data written to site/data/P12.json
    ```
  - Sourced lines (1, the only declared value):
    - `<!-- sourced: Négrier | page 4, the paper prints the name as N´egrier, with a broken accent in the PDF -->` — the PDF's own text layer breaks the accent into an acute over a space, so the name reader would not match "Négrier"; the value is declared from the page and the spelling in the block is the correct one.

  Page pictures looked at (4, the only ones that exist for this paper):
  - `workspace/extracted/pages/P12/img/page-1.png` — title page: the ScienceDirect banner, "Poetics 105 (2024) 101886", the three authors with their addresses (Western Norway University of Applied Sciences, Inndalsveien 28, Bergen; Universitat de Barcelona), the keywords (cultural-creative crowdfunding, cultural and creative industries, typology, Delphi method, platforms) and the abstract.
  - `workspace/extracted/pages/P12/img/page-5.png` — Figure 1, "Cultural policy paradigms and the place of crowdfunding", source Bonet and Négrier (2018), adapted by the authors: four overlapping circles, Cultural Democratization (yellow), Cultural Democracy (red), Creative Economy (purple) and "Excellence" (green), with the intersections labelled excellence for all, critic and engaged community, prosumer and star system, and CCCF at the centre where all four meet.
  - `workspace/extracted/pages/P12/img/page-7.png` — Figure 2, "Research Design": a loop with the CCCF puzzle (observation and hypothesis) at the top, the Delphi method on the left, tracking and trawling on the right, a platform database in the middle, and the typology of CCCF practices (theoretical contribution) at the bottom, with arrows labelled shared participation, initiative, insights, analysis and data collection process.
  - `workspace/extracted/pages/P12/img/page-11.png` — Figure 3, "Expanding the CCCF concept – mapping the possibilities of practices": CCCF in the overlap of alternative finance and the culture sector; point 2, the platform (n=89), split into for-profit (n=35), a partnership spectrum (n=29) and non-profit (n=20); point 3, possibilities of practices, branching into Crowd Store (n=6), Producer agent / CrowdPublisher (n=6), Alternative income / Subscription (n=13), Art Market Investment (n=10), "white label" / co-financing (n=3) and Collective mobilization and Cultural heritage specialized (n=4).

  Pages whose kind guess was wrong: none. `pages.json` guessed article for 1–13 and references for 14–15, and that holds — page 13 ends the discussion and the conclusions, page 14 opens the reference list, and page 15 carries the rest of it. No page needed a mixed block.

  Notes on this paper:
  - Chapters follow the paper's sections rather than equal page counts, so ch5 is short (three pages, two of them references) and ch2–ch4 are four pages each.
  - Every block of Table 1 is summarised, not just the headline: period (2010–2023), business model, institutional structure, focus and scope, plus the pure-model breakdown. The paper is inconsistent between Table 1's period counts (10 pre-2009, 67 in 2010–2019, 8 in 2020–2023) and the prose on page 10, which says "eight were launched pre-2009"; each block reports its own page's figures and the two are not silently reconciled.
  - Borrowed claims are credited where the paper credits them: "Following Bonet and Négrier" for the four paradigms, "Following Hoffmann and colleagues" for the coding, "Citing Lacan and Desmet", "Cicchiello and colleagues found" and "Siciliano warns". The chameleon-tool image on page 3 is credited to Dalla Chiesa.
  - The paper's hedges are kept: social media "might help performance", platforms "can be" a route to alternative income.
  - Checker fixes: ch3 had a 46-word sentence on page 7 and was split; ch4 wrote "Publisher" where the page prints "CrowdPublisher" and "British" where the paper writes "UK", both corrected to the page's own words; page 4 sat at 101 words and was trimmed to 100.
  - Caught in the compare step, before the check: page 7's second half was thin, so the 200 websites visited in August–November 2023 and the 50-plus excluded were added; page 12 was at 101 words and one sentence was shortened.
  - Three wording edits after the first PASS (the Dalla Chiesa credit, "The page ends" instead of "It ends" on page 13, and "some from the UK" in ch4's check answer), then the check was re-run before recording — still PASS with no warnings.
  - The brief links the paper to the Bonus lecture, The art of crowdfunding, which uses P12 on slide 45 for the 89 platforms and the two ways of sorting them; the lecture's own agency example is credited to the lecture and a separate example is marked as ours.

  Claude Code review and fixes (2026-10-22, early review at the student's request, before the end of batch R3):
  - **Audio:** genuine. Each chapter's cache entry was written seconds before its MP3, after the last text edit, and the data file matched the text. The `Négrier` line is right. The Table 1 and page 10 counts actually swap: the table gives 10 pre-2009 and 8 post-2015, the text 8 and 10.
  - **Ten content fixes:**
    1. Pages 8 and 10 now give the panels' findings, and the brief cites pages 8 and 10 instead of 10 alone:
       - the cultural economists' narrow, external-tool view, whose utility reasoning "to some extent validates" the puzzle;
       - the finance experts' "great potential, not fully explored".
    2. Page 10:
       - the authors' argument that subscription, usually counted as donation, gives creators alternative income;
       - ArtistShare as the blueprint, which the Bonus lecture cites on that page;
       - a note that the text reverses Table 1's counts.
    3. Page 12 and brief:
       - "confirms our main assumption";
       - strict clustering proved ineffective, so the typology is a diagram;
       - the hedge "could indicate" on the Latin American reading.
    4. Page 3 and brief: the main assumption itself (CCCF as a set of diverse practices).
    5. Brief: the crowdfunding-as-agency example is ours, given on our Bonus lecture page "as an example of our own, not from the lecture". It is not the lecturer's. The paper's own agency point (page 13) is added.
    6. Page 1:
       - ArtistShare was "one of the first" platforms;
       - Demattos Guimarães, the first author and Bonus lecturer, is named at HVL with Maehle (declared, since the PDF prints "Guimar˜aes").
    7. Page 6: the panels were used to validate the puzzle, and the field-choice limitation is added; the brief already cited it there.
    8. Brief and page 2: "a gap in understanding and defining", not "nothing defines".
    9. Page 11 now describes Figure 3, the main output: the platforms in three structures and every practice branch. White-label co-financing is now also in the brief.
    10. Smaller fixes:
        - page 13: "cultural policy can benefit from taking agency";
        - brief: the excluded US platforms;
        - chapter 3's first check question, a copy of chapter 1's, is replaced by one on the two panels.
  - Claude's own slip corrected at the same time: P11's brief (Claude's fix earlier today) also called that agency example "the lecture's own". It now says it is ours.
  - The lessons are in READINGS_PLAN.md section 10, and three new bullets are in WorkBuddy's prompt.
  - `check_reading.py P12`: PASS (1,936 words, 15 of 15 pages, 2 declared, no warnings), after the brief was trimmed back to 646 words.
  - WorkBuddy's version was kept in Claude's scratchpad as `P12.workbuddy.md`.
  - Re-recorded by Claude with `build_audio.py P12`: all five chapters `[OK]` (115–130 wpm, −20.3 to −20.5 LUFS, 16.2 min); chapter 4 needed a second attempt after a `NoAudioReceived`. P11's chapter 1 was re-recorded for the corrected sentence, and chapters 2–7 came from the cache. Both data files match their text.
  - `site/reviewed.json` now lists P12. `build_site.py` and `check_page.mjs` passed (ALL PAGE CHECKS PASSED). Published as version 21 of the companion; the file listing shows `audio/P12-01.mp3` to `P12-05.mp3` and the new `audio/P11-01.mp3` at the local sizes. Gate R3-W stays at the end of the batch, after P13.

- [x] P13 Quero & Ventura 2019 (47–63)
  - Chapters: 5, following the paper's own sections. Ch1 "The paper in brief" (`pages: all`, 579 words, two checks); ch2 `47-50` (abstract and aim, introduction and gap, the three propositions, the four platform types, the market figures, the seven actors); ch3 `51-54` (Frow and Payne's five steps and Table 1, Figure 1, the Eight Co's, the method and Figure 2); ch4 `55-59` (the added actor and Table 2, the micro and meso levels with Figures 3 and 4, the macro level, the discussion's three conditions and the implications); ch5 `60-63` (the conclusion, then the reference list).
  - `check_reading.py P13`:
    ```
    P13: Quero & Ventura 2019; 5 chapters, 1927 words (about 15 min of audio); 17 of 17 pages covered; 1 declared
      1. The paper in brief                        579 words  mean 18.1  max 40  inflated 0.0  pages the whole paper
      2. The aim, the three propositions and the   377 words  mean 17.1  max 44  inflated 0.0  pages 47–50
      3. The planning framework, the Eight Co's a  365 words  mean 14.0  max 28  inflated 5.5  pages 51–54
      4. The results, the three levels and the di  486 words  mean 18.7  max 34  inflated 0.0  pages 55–59
      5. The conclusion and the reference list     120 words  mean 15.0  max 30  inflated 0.0  pages 60–63
      declared: lánzanos (page 47 and later pages, the paper prints the name as La´nzanos, with the accent broken in the PDF text layer)
    PASS
    ```
  - `build_audio.py P13`:
    ```
    == P13: Reading 13: Value proposition as a framework for value cocreation in crowdfunding ecosystems (5 chapters)
      [OK] P13-01.mp3:  4.1 min, 585 words, 144 wpm, -20.5 LUFS, 1.47 MB  (cache)
      [OK] P13-02.mp3:  3.1 min, 397 words, 130 wpm, -20.5 LUFS, 1.10 MB  (cache)
      [OK] P13-03.mp3:  3.2 min, 386 words, 120 wpm, -20.4 LUFS, 1.16 MB  (cache)
      [OK] P13-04.mp3:  3.7 min, 506 words, 137 wpm, -20.4 LUFS, 1.33 MB  (synthesised (attempt 1))
      [OK] P13-05.mp3:  1.0 min, 132 words, 138 wpm, -20.5 LUFS, 0.34 MB  (synthesised (attempt 1))
      total 15.0 min; data written to site/data/P13.json
    ```
  - **The first recording run failed on its last chapter, and the fix was structural.** With the earlier six-chapter split, the reference list was its own chapter of 22 words. The recorder measured it at 103 wpm, below its 105 floor, because a 17-second clip carries the same fixed opening and closing silence as a four-minute one. `[FAIL] P13-06.mp3: 0.3 min, 29 words, 103 wpm, -20.2 LUFS, 0.10 MB (synthesised (attempt 1))`. The audio itself was fine; the rate was an artefact of the length. Re-running the same text would have reused the cache and failed identically, and a references block may hold only 30 words, so the text could not grow. The two last chapters were therefore rebalanced to 55–59 and 60–63, which also puts page 58 (the macro level) with the discussion it belongs to. That removed the tiny chapter: five chapters, 120 words in the last one, all `[OK]`. Chapters 1–3 came from the cache because their text did not change.
  - Sourced lines (1, the only declared token):
    - `<!-- sourced: Lánzanos | page 47 and later pages, the paper prints the name as La´nzanos, with a broken accent in the PDF text layer -->` — the accent is split in the PDF's text layer, so the name reader cannot match the correct spelling "Lánzanos"; the value is declared and the block uses the correct spelling.

  Page pictures looked at (3, the only ones that exist for this paper):
  - `workspace/extracted/pages/P13/img/page-47.png` — the title page: "Value proposition as a framework for value cocreation in crowdfunding ecosystems", Marketing Theory 2019, Vol. 19(1) 47–63, both authors at the University of Malaga, the abstract, the keywords (crowdfunding, network, service ecosystems, service-dominant logic, value propositions, value cocreation) and the corresponding author's address.
  - `workspace/extracted/pages/P13/img/page-52.png` — Figure 1, "Value proposition planning framework in crowdfunding ecosystems", source adapted from Frow and Payne (2011: 233): a cycle of five circles with clockwise arrows, identify actors at the top, then determine core values, facilitate dialogue and knowledge sharing, identify value co-creation opportunities, and co-create value propositions (the last drawn in green).
  - `workspace/extracted/pages/P13/img/page-54.png` — Figure 2, "Study design": two ovals on the left, platforms (Verkami, Lánzanos) and a netnographic study of 5 crowdfunding communities, joined by a plus sign and an arrow into one large circle, qualitative case-study research, with interviews of 2 per platform director by telephone or skype plus e-mail exchange, semi-structured.

  Pages whose kind guess was wrong: none. `pages.json` guessed article for 47–59, mixed for 60 and references for 61–63, and all three hold. The plan asked whether page 63 is a reference list or something else: it is the last four entries, followed by the two authors' biographies, so it stays a references-kind page and the chapter's block says what follows the entries.

  Notes on this paper:
  - Page 60 says the conclusion names "eight kinds of actor" and then lists seven, leaving out the crowdfunding associations. The block reports the page's own sentence and adds that the list names seven; it does not correct the paper.
  - Page 50 prints "680.037 euros" for Heroquest 25, with a full stop as the thousands separator, and page 57 is written that way here, because the number reader strips commas and would not match "680,037".
  - The lecture is credited with its own observation: the Bonus lecture sets slide 38 against the paper and notes that the slide says co-financing where the paper says co-investment, and adds co-production but not co-authoring. The lecture's exam note marks the crowdfunding example as one of ours, not the lecturer's, so the brief says that and adds what this paper can and cannot supply to it.
  - Checker fixes: ch1's mean was 23.1 with a 45-word sentence, ch2's 21.3 with a 46-word sentence on page 49 and ch3's 22.3, so long sentences were split across the brief and chapters 2 and 3; pages 49, 56 and 58 were 1–2 words over 100 and were trimmed, and page 60 was trimmed to 99.
  - Caught in the compare step, before the first check: "has replaced" was the wrong tense for a definition the page states in the present; the Forbes figure of 2012 describes the world market of 2014, not 2012; page 52 compares two lists, not three; and page 53's model is not the one the paper is named for, so that phrase was replaced.
  - Each chapter has its own check question; ch4's first question asks about the micro and meso levels rather than repeating ch1's question about the added actor.

  Claude Code review and fixes (2026-10-22, batch R3-W check):
  - **Audio:** genuine. Chapters 1–3 came from cache entries made during the first run, chapters 4 and 5 were synthesised after the last text edit, and the data file matched the text. The `Lánzanos` line and both content flags (eight actors but seven named; "680.037") are right.
  - **Stray file:** the failed six-chapter run had left `site/audio/P13-06.mp3`, which belongs to no chapter. Claude moved it, not deleted it, to its scratchpad folder `quarantine-workbuddy-P13/`.
  - **Seven content fixes:**
    1. Brief and page 48: the three propositions are stated (crowdfunding is a service ecosystem; the Eight Co's model; the value proposition approach as a tool at each level).
    2. Brief: "does not discuss sustainable transformation" was too strong. Sustainability is mentioned in passing on page 48 ("supports sustainability and continuous change") and page 60 (research on sustainable ecosystems). Both are now in the brief, and page 60 too.
    3. Page 58: institutionalisation follows Edvardsson and colleagues; the "conflictual form of value cocreation" is Laamanen and Skalen's.
    4. Page 56:
       - the most common forms of cocreation at the micro level (co-evaluation, co-testing, co-investing, co-consumption);
       - El Cosmonauta as the first crowdfunded film in Spain.
    5. Page 59 and brief:
       - the authors' claimed "significant contribution to the theories of ecosystems";
       - the approach can apply to other ecosystems.
    6. Brief:
       - the five-step planning framework from Frow and Payne;
       - institutionalisation at the macro level.
    7. Brief and page 53: Verkami takes only arts and design projects, while Lánzanos takes all kinds.
  - The lessons are in READINGS_PLAN.md section 10, and two new bullets are in WorkBuddy's prompt.
  - `check_reading.py P13`: PASS, no warnings, after the brief was trimmed to 641 words and two long sentences were split.
  - WorkBuddy's version was kept in Claude's scratchpad as `P13.workbuddy.md`.
  - Re-recorded by Claude with `build_audio.py P13`: all five chapters `[OK]`, synthesised on attempt 1 (120–137 wpm, −20.4 to −20.5 LUFS, 15.9 min). The data file matches the text.
  - `site/reviewed.json` now lists P13. `build_site.py` and `check_page.mjs` passed (ALL PAGE CHECKS PASSED). Published as version 23 of the companion; the file listing shows `audio/P13-01.mp3` to `P13-05.mp3` at the local sizes, and no P13-06.
  - **Batch R3-W (P17, P11, P12, P13) is checked and published.** The gate waits for the student's "APPROVED GATE R3-W" after listening. All nine of WorkBuddy's papers are done.

  Batch R3-W audit by WorkBuddy (2026-10-22 20:30, read-only: nothing edited, nothing re-recorded):
  - `check_reading.py` re-run on all nine papers of the batch, after Claude's review edits: **PASS with no warnings for every one**. The counts below are the spoken prose, not the file's raw word count.
    | paper | chapters | words | pages | declared |
    |---|---|---|---|---|
    | P14 | 5 | 1,613 | 13 of 13 | 1 |
    | P15 | 6 | 2,542 | 24 of 24 | 4 |
    | P16 | 6 | 2,095 | 18 of 18 | 0 |
    | P09 | 6 | 2,233 | 20 of 20 | 1 |
    | P10 | 6 | 1,886 | 16 of 16 | 0 |
    | P17 | 6 | 2,315 | 24 of 24 | 2 |
    | P11 | 7 | 2,448 | 25 of 25 | 4 |
    | P12 | 5 | 1,936 | 15 of 15 | 2 |
    | P13 | 5 | 2,002 | 17 of 17 | 1 |
    | **total** | **52** | **19,070** | **172 pages** | **15** |
  - Audio and data integrity: every `site/data/<P>.json` references exactly the MP3s that exist on disk, chapter counts match, and there are **no orphaned or missing files** in `site/audio/` for these nine papers. The stray `P13-06.mp3` from the failed six-chapter run is gone.
  - Nothing in `site/reviewed.json`, `readings/`, `site/audio/` or the plan was changed by this audit.

  **Lecture citations that disagree with these readings — do not "fix" the reading.** WorkBuddy audited every reading in the course against the lecture that cites it, on 2026-10-22, page by page against the PDFs. Three findings touch this batch. In each case the **reading is right and the lecture is wrong**, so a reviewer comparing the two will meet a mismatch that must be corrected on the slide, not in `readings/`:

  - **T5, slide 13, Miörner & Trippl "page 491".** The slide credits an entrepreneur with "Schumpeterian entrepreneurship and institutional entrepreneurship, and partly place-based leadership". That paper never uses either phrase — **zero hits for both across all eighteen pages**, not just page 491. What page 491 describes is a private contractor in Malmö who administered the Nordic Game Programme. The three-part continuum is **Bækkelund's** construction, so the slide has lent one paper's framework to another paper's case. P16 does not attribute that framework to Miörner & Trippl, and should not be made to.
  - **T5, slide 13, Bækkelund "page 759".** Page 759 is the right page for the framework and the wrong page for the case: it *defines* the continuum ("Schumpeterian entrepreneurship, institutional entrepreneurship and change leadership on the change agency side, and replicative entrepreneurship, institutional work and maintenance leadership on the replicative agency side") with no mention of a mayor. The Flåm mayor is on **764**, which is what P14's chapter 4 already cites. Correct the slide to 764; leave P14 alone.
  - **T6, section 5, Steen "pp. 7, 9".** The human-resources half really is on 7 and the word "bottleneck" is on 9 (Table 3's resource-mobilization row), but the financing sentence ("'green financing' is plentiful… a credible business model is needed to unlock access to financial markets") and the **NOK 25.1 billion** Longship figure are on **8**, which the citation omits. Suggested: pp. 7–9. P10's blocks for 7, 8 and 9 are correct as written.

  The rest of T5 and T6 checks out exactly: T5 section 3's citation of Garud & Karnøe p. 282 is word for word (the certification law and the increased contact with the DWTS), T6 section 2's path-dependence quote is exact on p. 2, T6 section 3's seven Hekkert function pages (421–425) are all right, and T6 section 4's two page-7 claims both hold.

  Resolved on 2026-10-23: Claude checked these three findings against the papers, found them real, and with the student's approval corrected `lectures/T5.md` and `T6.md`; the readings were not changed. The evidence is in `PROGRESS.md`, under "After completion".

  Unrelated to this batch but worth knowing: the checker no longer widens a paper's word set with a translation. That path existed **only for P05**, so P09–P17 are unaffected; all seventeen readings pass with it removed.

- [x] **STOP GATE R3-W:** student approved
  - Evidence: the student wrote to Claude Code on 2026-10-23: "I approved all", in reply to the list of open gates R2-W, R2-A, R3-W, R3-A and R4.

## Gate R4: final check (Claude Code)
Claude's R4 check, 2026-10-23 (log: `checks/r4-final-2026-10-23.log`):
- All 17 readings pass `check_reading.py`; all 8 lectures pass `check_style.py` and `check_sources.py`.
- Every `site/data/<id>.json` matches its markdown (25 of 25). Every MP3 has a cache entry for its current text and a duration within 1 s of its data. No stray or missing audio: 154 MP3s, 457.0 min (7.62 h), 164.6 MB.
- Guards: `GUARDS OK: 11 files match GUARDS.sha256`. The published `index.html` (version 25) differs from the local build only by the 3 wrapper lines.
- **One failure: four P16 files on the live site are out of date.** WorkBuddy's second P16 pass on 2026-10-21 completed six page summaries and re-recorded `P16-02`, `-03`, `-05` and `-06` after version 14. Those files were never republished, so the live site shows the new text but plays the old recordings. Claude checked the six changed summaries against pages 481, 484, 485, 491, 494 and 495, and all hold. Page 491's "a novel application with Media Evolution" blurs two things: the paper's mode of change, and the funding applications written with Media Evolution (the City of Malmö and Region Skåne gave the money).
- The student wrote "I approved all" on 2026-10-23. Both R4 boxes stay open until the four P16 files are published and this check passes.
- **Resolved the same day (version 26).** At the student's request Claude changed page 491 to "Later funding from the City of Malmö and Region Skåne therefore came through a novel application of existing structures". The scratchpad holds the earlier version as `P16.before-491-2026-10-23.md` and the fix script as `fix_p16_491.py`. `check_reading.py P16`: PASS, no warnings. `build_audio.py P16`: 6 of 6 `[OK]`, 16.7 min, with P16-05 re-synthesised at 136 wpm. Two earlier attempts at P16-05 came back truncated while the speech service was throttling (0.04 and 0.01 MB, marked `[FAIL]`); Claude moved those cache entries to the scratchpad folder `quarantine-claude-P16` before recording again. `check_page.mjs`: 18 checks, `ALL PAGE CHECKS PASSED`. Version 26 is published with `P16-02`, `-03`, `-05` and `-06`.
- **Rerun against version 26** (log: `checks/r4-final-v26-2026-10-23.log`):
  - All 17 readings and all 8 lectures pass.
  - Every data file matches its markdown, every MP3 has a cache entry for its current text, and every duration matches its data.
  - All 154 MP3s equal their sizes in the version-26 file listing. There are no stray, missing or unpublished files: 457.0 min (7.62 h) and 164.6 MB in total.
  - Guards OK (11 files). The published `index.html` differs from the local build only by the 3 wrapper lines.
  - `PROBLEMS: none`.

- [x] All 17 readings and 8 lectures pass; published files match
  - Evidence: Claude's rerun above, `PROBLEMS: none`, on version 26 (2026-10-23).
- [x] **STOP GATE R4:** student approved
  - Evidence: the student wrote to Claude Code on 2026-10-23: "I approved all", and then, after the P16 failure was reported: "Tighten the page 491 wording, re-record that chapter, publish the four P16 chapters, rerun the R4 check, and tick R4 if it passes." It passed.
