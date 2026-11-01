# Progress: worked exam answers, Part E (Cursor + Grok)

Spec: ANSWERS_PLAN.md. Autopilot. Paste evidence under each box.

- [x] E0 cheat_lib and check_cheatsheet: model reader, audit and plans kinds, answer lessons; tests 35-48 (plan 6)

```
ALL CHECKER TESTS PASSED (48 tests)
ALL CHEATSHEET CHECKS PASSED
SCAN CLEAN
```
- [x] E1 answers/AUDIT_DEC2024.md

```
PASS answers/AUDIT_DEC2024.md (1778 words)
ALL CHEATSHEET CHECKS PASSED
```

Pages and slides opened: P01 pp. 431, 433, 434; P03 pp. 15, 19, 22; P04 pp. 1, 4, 5, 6, 7; P09 pp. 416, 421–426; P10 pp. 2, 4, 9; P14 pp. 757–760; P15 pp. 277–279; P17 pp. 271, 273, 276, 279; Class 2 slide 21 (section 1, Brundtland-rapporten 1987). Rebound searched in `lectures/*.md` and `workspace/extracted/pages`: no hit, so row 3.10 is Beyond the course. HVL web addresses: none on model pages 3–14 and none in the lectures.
- [x] E2 answers/AUDIT_JUN2025.md

```
PASS answers/AUDIT_JUN2025.md (1705 words)
ALL CHEATSHEET CHECKS PASSED
```

Pages and slides opened: P03 pp. 15, 16, 22; P01 p. 431; P04 pp. 1, 4, 5; P05 pp. 328, 330 (paraphrased, not quoted); P09 pp. 416, 421, 423, 424, 425, 426; P10 pp. 2, 4, 9; P14 p. 758; P16 p. 481; P17 pp. 268, 273, 276, 279; Class 3 slides 20–23; Class 9 slides 27, 29, 31; Class 2 slides 40–44. The four path names on model p. 5 were checked against P05 p. 328: the page has exhaustion, extension, renewal and creation. Row 2.4 is Corrected.
- [x] STOP GATE G14: review scripts and both audits page by page; commit and push

| File | Items | Confirmed on the source | Fixed (what) |
|---|---|---|---|
| answers/AUDIT_DEC2024.md | 56 rows | Cited pages re-read for the verdict. Beyond rows 1.18, 3.8, 3.10 and 3.19 searched in lectures and readings. The only life-cycle hit is P08's industry life cycle, which is not a battery claim. Rebound: no hit. | 3.7 set to Corrected. The pages say the technology is embedded. They do not say skills were recombined. |
| answers/AUDIT_JUN2025.md | 53 rows | P05 p. 328 names exhaustion, extension, renewal and creation. Class 9 slides 27, 29 and 31 re-read. | 2.4, 2.7 and 3.4 set to Corrected. |
| cheatsheet/scripts | plan 6.2 | Tests 35–48, `--all` and `--scan` passed. Exam-question runs are exempt from the copy check, noted in section 11. | None at the gate. |

```
ALL CHECKER TESTS PASSED (48 tests)
ALL CHEATSHEET CHECKS PASSED
SCAN CLEAN
```

5137617 answers: G14 scripts and both exam audits. Push: e4965f9..5137617 main -> main. Status after push: main...origin/main.
- [x] E3 R12 lesson (pilot, December 2024 Question 2): written, checked, recorded

```
PASS listen/R12.md (2249 words)
ALL CHEATSHEET CHECKS PASSED
```

```
== R12: Revision 12: Worked answer: how agency can promote or inhibit sustainable transformation (10 chapters)
  [OK] R12-01.mp3:  1.5 min, 199 words, 136 wpm, -20.5 LUFS, 0.53 MB  (cache)
  [OK] R12-02.mp3:  1.3 min, 183 words, 140 wpm, -20.6 LUFS, 0.47 MB  (cache)
  [OK] R12-03.mp3:  1.4 min, 214 words, 157 wpm, -20.8 LUFS, 0.49 MB  (cache)
  [OK] R12-04.mp3:  1.8 min, 233 words, 126 wpm, -20.7 LUFS, 0.66 MB  (synthesised (attempt 1))
  [OK] R12-05.mp3:  1.6 min, 221 words, 138 wpm, -20.5 LUFS, 0.58 MB  (cache)
  [OK] R12-06.mp3:  1.8 min, 249 words, 139 wpm, -20.5 LUFS, 0.65 MB  (cache)
  [OK] R12-07.mp3:  1.7 min, 232 words, 135 wpm, -20.6 LUFS, 0.62 MB  (synthesised (attempt 1))
  [OK] R12-08.mp3:  1.5 min, 222 words, 148 wpm, -20.5 LUFS, 0.54 MB  (cache)
  [OK] R12-09.mp3:  1.7 min, 225 words, 135 wpm, -20.4 LUFS, 0.60 MB  (cache)
  [OK] R12-10.mp3:  2.1 min, 269 words, 126 wpm, -20.5 LUFS, 0.77 MB  (cache)
  total 16.4 min; data written to site/data/R12.json
```

SITE MANIFEST OK
- [x] E4 site: two Revision groups, the answers list, check_page updates; all site checks pass

Existing checks changed, because E4 made them wrong:
- The door check expected the fixed text "10 lessons". It now expects DATA.revision.length lessons. The door says 16 lessons.
- The revision-list check counted every row as ten. It now counts the Lessons list only (10 rows). The answers list has its own check for 6 rows.

```
ALL PAGE CHECKS PASSED
index.html: 730 KB, 237 audio files under site/audio/
ALL SERVER CHECKS PASSED
SITE MANIFEST OK
```

Screenshot phone-revision-answers.png shows the answers list. Revision 12 is ready (16 minutes, 10 chapters). Revisions 11 and 13 to 16 say In preparation.
- [x] STOP GATE G15: review R12 and E4; commit, push, live check

| File | Items | Confirmed on the source | Fixed (what) |
|---|---|---|---|
| listen/R12.md | 10 chapters | Question 2 rows 2.1 to 2.16 are Confirmed or Corrected, and the spoken facts sit on those rows or on TH5, TH3, the cards and the exam-day sheet. Chapter 1 says the question. Five moves, both sides, Hordaland and Rogaland, and the traps use the corrected lines. | Two glosses cut before the push. Agency is not ranked good or bad. The regions are two petroleum regions with a shared green vision, not a shared petroleum past. |
| scripts/build_site.py, site/template.html, scripts/check_page.mjs | Section 7 of the answers plan | R11 to R16 are in REVISION with the when lines and the group. The page has Lessons and Worked exam answers, the new lede, and the six-row list. | The two groups sit in the existing section.group so the headings use the papers-page style. |

```
ALL CHEATSHEET CHECKS PASSED
ALL PAGE CHECKS PASSED
ALL SERVER CHECKS PASSED
SITE MANIFEST OK
```
- [ ] E5 R11 lesson (December 2024 Question 1)
- [ ] E6 R13 lesson (December 2024 Question 3)
- [ ] STOP GATE G16: review R11, R13; site checks; commit, push, live check
- [ ] E7 R14 lesson (June 2025 Question 1)
- [ ] E8 R15 lesson (June 2025 Question 2)
- [ ] E9 R16 lesson (June 2025 Question 3)
- [ ] STOP GATE G17: review R14-R16; site checks; commit, push, live check
- [ ] E10 answers/PLANS.md, Part 5 in build_cheatsheet.py, PDF rebuilt (13 pages or fewer)
- [ ] STOP GATE G18: final review; all checks; commit, push, live check R11-R16; final report
