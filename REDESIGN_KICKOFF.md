# Kickoff prompt for the redesign (WorkBuddy)

Open `D:\HVL2025\514` in WorkBuddy and paste the prompt below into a **new conversation**. WorkBuddy does the next unchecked step in its progress file and stops when you tell it to, or at gate D1. If a conversation gets long, start a new one with the same prompt: it carries on from the next unchecked box. Do not use `/goal` or any autonomous mode.

When WorkBuddy reaches STOP GATE D1, paste its report into Claude Code and say: "Review the redesign and publish the companion."

## WorkBuddy

```text
You are redesigning the INN514 Course Companion, a phone-first listening and reading site for my master's course, in D:\HVL2025\514. You are WorkBuddy. The content is finished and checked. Your job is only the design and the organisation of the pages.

READ FIRST, in this order:
1. workspace/lecture-audio/REDESIGN_PLAN.md, all of it. It is the single spec: colours, type, spacing, every page, the exact wording, the markup, and the checks.
2. workspace/lecture-audio/PROGRESS_REDESIGN_WORKBUDDY.md. Do the next unchecked step. If the next box is STOP GATE D1, stop and tell me.
3. The current files you will change: workspace/lecture-audio/site/template.html, workspace/lecture-audio/scripts/build_site.py, workspace/lecture-audio/scripts/check_page.mjs.
Then show me your task list before you start.

WHAT THE STUDENT ASKED FOR:
- A front page that says what the site is about.
- Classes in Kursplan order with the teacher on every class, and Papers grouped under the class they go with.
- From inside a paper or a class, an easy way back: a sticky top bar (INN514 Companion, Classes, Papers), a breadcrumb, a "Where next" block, and a player title that links back to what is playing.
- A clean "Claude style" look: warm ivory page, Source Serif 4 for headings and reading, Hanken Grotesk for the interface, a clay accent. Look only: no Claude or Anthropic name, logo or mark anywhere on the page.

YOU MAY:
- Edit only: site/template.html; scripts/build_site.py (the CATALOG teacher and note fields, B1's "when", and data["sessions"], nothing else); scripts/check_page.mjs; and your progress file.
- Run, from D:/HVL2025/514:
  C:/Python313/python.exe workspace/lecture-audio/scripts/build_site.py
  node workspace/lecture-audio/scripts/check_page.mjs > workspace/lecture-audio/checks/page-check.log 2>&1
  For this task only, these two are yours to run as well as Claude Code's.

YOU MUST NOT:
- Touch lectures/, readings/, site/data/, site/audio/, cache/, site/reviewed.json, reading_lib.py, build_audio.py, check_reading.py, check_style.py, check_sources.py, the guards, or any PDF. Claude Code compares a checksum manifest of all of these after you finish.
- Change the text of any lecture or paper, the player logic, the localStorage key "inn514-companion", or the shape of the saved progress (done, pos, rate).
- Install anything (no npm, no pip), or load any script from the web. Google Fonts is the only outside resource.
- Use all caps, " · " joins, "→" in link text, eyebrow labels, gradients, card shadows or monospace. check_page.mjs tests for some of these.
- Invent wording. Use the copy in the spec word for word. If something has no copy in the spec, write it in the same plain voice and list it in your report.
- Publish, tick gate D1, or delete any file (report strays instead).

HOW TO WORK:
- One step at a time, in the order of the progress file. After each step, run build_site.py and tick the step with one line of evidence.
- Edit template.html in sections (styles, top bar, front page, Classes, Papers, class and paper page, player, routing). Do not re-read the whole file again and again; read the section you are changing.
- Keep these exactly as they are: the line "const DATA = /*DATA*/;", paragraphStarts, play, resume, markParagraph, the audio event listeners, the player button handlers, linkReadings and the page-link logic (pendingPage). In loadChapter change only the two #nowTitle lines.
- No hard-coded counts or durations: compute them from DATA.catalog, DATA.readings, DATA.sessions and DATA.lectures.
- After step 8, run check_page.mjs and open every screenshot it saves in workspace/lecture-audio/checks/ (phone and desktop, light and dark). Fix whatever looks wrong (overlaps, cramped spacing, text running under the player or the top bar, a horizontal scroll) and run it again.

WHEN YOU FINISH (step 10), report:
- every step ticked, with its evidence;
- the full output of check_page.mjs (it must end with ALL PAGE CHECKS PASSED);
- the list of screenshots you looked at, and what you changed after looking;
- any wording you had to add that is not in the spec.
Then stop and say: "STOP GATE D1: ask Claude Code to review the redesign and publish."
```
