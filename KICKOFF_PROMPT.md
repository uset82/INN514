# Kickoff prompt for Antigravity: INN514 Lecture Companion

Open `D:\HVL2025\514` in Antigravity. **Use one new conversation per lecture**, and paste the prompt below each time. **Do not use `/goal`** or any autonomous mode.

## Step 1 (once, in the conversation that is waiting at gate B)

```text
APPROVED GATE B. Note: Claude Code made small source fixes to Lectures 1-3 after your fixes, added scripts/check_sources.py, re-recorded the changed chapters and published version 5. Tick gate B, quoting this message, and stop. Do not start Lecture 4 in this conversation.
```

## Step 2 (a new conversation for each lecture: T4, then T5, T6, T8, B1)

```text
You are continuing the INN514 Lecture Companion for my master's course, in D:\HVL2025\514.

READ FIRST, in this order:
1. workspace/lecture-audio/ANTIGRAVITY_PLAN.md, all of it, including "Lessons" at the end.
2. workspace/lecture-audio/PROGRESS.md. Do ONLY the next unchecked phase (one lecture).
3. workspace/lecture-audio/lectures/T1.md, T2.md and T3.md. These are the approved models: match their voice, length, chapter format and check questions. Do not edit them.
Then show me your task list before you start.

SOURCES
- Slide text: workspace/study-site/build/clean/<deck>/slide-NNN.txt (deck ids and slide counts are in the plan's lecture table).
- Slide images: workspace/study-site/dist/assets/slides/<deck>/slide-NNN.jpg. Open the image for every slide with a chart, diagram, table or photo, and for every image-only slide listed in the plan.
- Never use workspace/study-site/build/translations/. It is broken word-swap output.
- Readings: check every claim, quote, number and page with
  C:/Python313/python.exe workspace/lecture-audio/scripts/find_in_paper.py <P-id> "<phrase>"
  Cite the PRINTED page ("on page N"), and list every cited page in that chapter's <!-- readings: --> line.
- Use these authors and years exactly, in the readings lines and the prose:
  T4: Spigel & Harrison 2018 (P06), Stam & van de Ven 2021 (P07), Autio et al. 2014 (P08)
  T5: Bækkelund 2021 (P14), Garud & Karnøe 2003 (P15), Miörner & Trippl 2017 (P16)
  T6: Hekkert et al. 2007 (P09), Steen et al. 2024 (P10)
  T8: Njøs et al. 2020 (P17)
  B1: Bargoni et al. 2024 (P11), Demattos Guimarães et al. 2024 (P12), Quero & Ventura 2019 (P13)

RULES FOR THE TEXT (from the Gate B review)
- Every name, number and date must be on the slides or on a page you cite. If a fact appears only inside a slide image (a chart, a figure caption), declare it on its own line in that chapter:
  <!-- sourced: TOKEN | slide N, what the image shows -->
  Never declare anything that is not visibly on the slide image.
- Report interview quotes as one person's statement ("an industry leader says..."). A slide's questions stay questions. Never turn a warning or a question into a result.
- Never invent co-authors, dates, history, examples or results. If you cannot find it, leave it out.
- Plain English: short sentences, explain each term when it first appears, say why things matter, say each thing once.
- Your own examples start with "Here is an example of our own, not from the lecture:" and contain no names, numbers or places.
- Exam tips may only quote the real exam questions listed in the plan.
- You write the lecture yourself. No script may generate or rewrite lecture text.

CHECKS. All must pass, in this order, and you paste the full output of each:
1. C:/Python313/python.exe workspace/lecture-audio/scripts/check_style.py <T>  ->  PASS
2. C:/Python313/python.exe workspace/lecture-audio/scripts/check_sources.py <T>  ->  PASS
3. C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py <T>  ->  every chapter [OK]
4. C:/Python313/python.exe workspace/lecture-audio/scripts/build_site.py, then
   node workspace/lecture-audio/scripts/check_page.mjs > workspace/lecture-audio/checks/page-check.log 2>&1  ->  ALL PAGE CHECKS PASSED
If a check fails, fix the lecture text, not the check.

THEN STOP
- Tick only this phase's work boxes in PROGRESS.md, with the pasted output. Never tick a STOP GATE box.
- Tell me the lecture is ready, list every <!-- sourced: --> line so I can check it on the slide, and remind me to ask Claude Code to publish.
- Wait for APPROVED GATE C-<T> or my fixes.

DO NOT: use /goal or start the next lecture; edit T1-T3, site/template.html or any script; publish anything; touch workspace/study-site/.
```

## Step 3 (a new conversation for the Bonus lecture, B1; written 2026-10-18 after gate C-T8)

```text
You are continuing the INN514 Lecture Companion for my master's course, in D:\HVL2025\514. This conversation does Phase 8 ONLY: the Bonus lecture B1, "The art of crowdfunding".

READ FIRST, in this order:
1. workspace/lecture-audio/ANTIGRAVITY_PLAN.md, all of it, including "Lessons" at the end.
2. workspace/lecture-audio/PROGRESS.md. Gates A, B, C-T4, C-T5, C-T6 and C-T8 are approved; Phase 8 is next. Read every "Claude Code review and fixes" entry under Phases 4-7. They list the mistakes found in earlier lectures. Do not repeat any of them.
3. workspace/lecture-audio/lectures/T1.md, T2.md and T8.md. They are the models for voice, length, chapter format and check questions. Do not edit any existing lecture.
Then show me your task list before you start.

THE LECTURE
- Write workspace/lecture-audio/lectures/B1.md. Start it exactly like this:
  # Bonus lecture: The art of crowdfunding
  <!-- lecture: B1 | session: H2025 only, 10 November 2025, not in Kursplan 2026 | lecturer: Alice Demattos Guimarães | deck: INN514 Lecture CF.pdf (H2025, 50 slides) -->
- Slide text: workspace/study-site/build/clean/CF/slide-001.txt ... slide-050.txt. The deck is in English, so explain it in plain English in your own words. Do not copy long slide passages.
- Slide images: workspace/study-site/dist/assets/slides/CF/slide-NNN.jpg. Open every image-only slide (6, 18, 31, 40, 41, 49, 50) and every slide with a chart, diagram, table, platform screenshot or photo. Describe a figure by what its boxes, arrows and labels actually say. If the slide does not label a part of a figure, do not interpret it.
- Chapter 1 says in one or two sentences that in autumn 2025 this was the course's seventh lecture (Forelesning 8, slide 3), that Kursplan 2026 does not include it, and that the companion therefore offers it as a bonus.
- Slides 2-4 are seminar admin (how the seminars work and the presentation schedule). Cover them in at most one sentence, or not at all. Never name students, and never name anyone except the lecturer and the authors of cited works.
- Never cite the deck's article numbers (17, 18, 19 on slide 4, or any other). They follow the old seminar list. Name works by author and year only.
- Readings, with authors and years used exactly as given here, in the readings lines and in the prose:
  Bargoni et al. 2024 (P11, printed pp. 1109-1133)
  Demattos Guimarães et al. 2024 (P12, printed pp. 1-15). The lecturer is its first author, so you may say the lecturer co-wrote it. Refer to people by name, never by a pronoun guessed from the name.
  Quero & Ventura 2019 (P13, printed pp. 47-63)
  Check every claim, quote, number and page with
  C:/Python313/python.exe workspace/lecture-audio/scripts/find_in_paper.py P11 "<phrase>"
  Cite the PRINTED page ("on page N") and list every cited page in that chapter's <!-- readings: --> line. If you cannot find a claim in the reading, leave it out.

MISTAKES CLAUDE CODE HAD TO FIX IN LECTURES 4-9. Do not make them.
1. Quoting the cited source for the wrong thing. If a slide quotes an author, report only what the quote says. The slide's own text, lists and definitions belong to the slide and the lecturer, not to that author.
2. A definition an article borrows from someone else: say whose it is ("they adopt a definition by X").
3. A slide's question presented as a finding. If the slide asks, the lecture asks. This applies to check answers too: a check answer may only state what the chapter states.
4. Padding a slide's list with items that are not on it, or adding words such as "collective", "current policy", "official" or "regional" that the slide does not use.
5. A wrong year. If the slide's year differs from the reading list, say so gently, as T1 does for Schlaile: "The slide dates it X, but the article on your reading list is from Y."
6. "Because", "therefore" or "this shows" joining two points that the slide keeps separate.
7. A fact from outside the deck and the readings, such as an exam rule, a date or a company's history. Leave it out, or name its real source and declare it.
8. Saying the same thing twice in different chapters.
9. A non-English word left for the English voice to read aloud. Translate it.
10. Overlong text. Stay inside 2,200-2,800 words from the start.

RULES THAT STILL APPLY
- Every name, number and date must be on the slides or on a page you cite. A fact that appears only inside a slide image gets its own line in that chapter:
  <!-- sourced: TOKEN | slide N, what the image shows -->
  Never declare anything that is not visibly on the image.
- Report an interview or campaign quote as one person's statement ("one creator says...").
- Your own examples start with "Here is an example of our own, not from the lecture:" and contain no names, numbers or places.
- Exam tips may only quote the real exam questions in the plan. Crowdfunding was not on either past exam, so keep any exam link short and honest. For example, crowdfunding can be one empirical example of agency or of technology in an innovation system.
- You write the lecture yourself. No script may generate or rewrite lecture text. Never use workspace/study-site/build/translations/.

CHECKS. All must pass, in this order. Paste the full output of each.
1. C:/Python313/python.exe workspace/lecture-audio/scripts/check_style.py B1  ->  PASS
2. C:/Python313/python.exe workspace/lecture-audio/scripts/check_sources.py B1  ->  PASS
3. C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py B1  ->  every chapter [OK]
4. C:/Python313/python.exe workspace/lecture-audio/scripts/build_site.py, then
   node workspace/lecture-audio/scripts/check_page.mjs > workspace/lecture-audio/checks/page-check.log 2>&1  ->  ALL PAGE CHECKS PASSED
   (With B1 ready, the route should show 8 of 8 stops ready, and the "not ready" check is skipped automatically.)
If a check fails, fix the lecture text, not the check.

THEN STOP
- Tick only Phase 8's work box in PROGRESS.md, with the pasted output. Never tick a STOP GATE box.
- Tell me the lecture is ready. List every <!-- sourced: --> line, and every slide image you described, so I can check them.
- Remind me to ask Claude Code: "Check the Bonus lecture and publish the lecture companion."
- Wait for APPROVED GATE C-B1 or my fixes.

DO NOT: use /goal or start Phase 9; edit T1-T8, site/template.html or any script; publish anything; touch workspace/study-site/.
```

## After each lecture
Ask Claude Code: "Check Lecture <N> and publish the lecture companion." Claude reviews the lecture against the slides and readings, then updates your private page at https://claude.ai/artifact/Nc3TALuXYR3W49sUshNs93.
