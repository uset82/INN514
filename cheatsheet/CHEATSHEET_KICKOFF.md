# Kickoff prompt for the INN514 cheatsheet (ZCode + GLM 5.3 Flash)

Open `D:\HVL2025\514` in ZCode and choose GLM 5.3 Flash. Paste the prompt below into a **new conversation for every task and every gate**.

```text
You are building the INN514 cheatsheet, a compact revision document for my master's course, in D:\HVL2025\514\workspace\lecture-audio\cheatsheet, and then its audio lessons for the companion site at https://inn514.canner.app/. You execute every task, review your own work at each STOP GATE, and push it to GitHub.

READ FIRST, in this order:
1. workspace/lecture-audio/cheatsheet/CHEATSHEET_PLAN.md: sections 1-5, 8-11, and section 6 or 7 for your task. It is the single spec.
2. workspace/lecture-audio/cheatsheet/PROGRESS_CHEATSHEET_ZCODE.md.

AUTOPILOT: I will not give feedback or approvals. Start at the first unchecked box and keep going through every task and every STOP GATE, in order, until the last box is ticked. At a STOP GATE, do the full review in section 8 yourself (re-read the batch's files from disk first, as if you had not written them), then commit and push as section 9 says, then go straight on. Do not wait for me and do not ask me for approval.

DO THE TASK:
- Use the plan's formats, names, limits, code shapes and wording exactly. Do not add sections or features.
- Write every sentence of the cheatsheet and of the lessons yourself. No script may write or rewrite prose.
- If something in the plan is unclear, choose the safest reading that keeps every check passing, write the decision as a dated note in section 11, and go on.
- If the conversation gets too long, tick what is done, and tell me only: "Paste the kickoff again to continue." The next conversation picks up at the first unchecked box.

YOU MAY:
- Create and edit files in workspace/lecture-audio/cheatsheet/ and workspace/cheatsheet_previews/. In CHEATSHEET_PLAN.md you may only add to section 11. Never edit CHEATSHEET_KICKOFF.md.
- In Part W only, edit exactly the files plan 7.8 names (scripts/build_audio.py, scripts/build_site.py, site/template.html, server.js, scripts/test_server.mjs, scripts/check_page.mjs), and only as it says.
- Read the sources in plan section 2.
- Run the commands in plan section 10, from D:/HVL2025/514. Git only at a STOP GATE, exactly as plan section 9 says.

YOU MUST NOT:
- Edit, move or delete anything else: not lectures/, readings/, cache/, the existing files in site/data/ and site/audio/, any other repo file, workspace/extracted/ or the PDFs.
- Run build_audio.py with anything but R ids, or run build_audio.py, build_site.py, build_static.py, check_page.mjs or test_server.mjs outside Parts V and W. Never run sync_knowledge.py, export_knowledge.py or any Canner command.
- Run any other git command (no add -A, add ., reset, checkout, stash, merge, rebase -i, branch -D, push --force), or stage a path that plan section 9 does not list for this gate.
- Install anything or use the web. The only online calls allowed are build_audio.py's voice service (Part V) and the live check in plan section 10, after a push at G10-G13.
- Quote Paper 2 or Paper 5, use workspace/study-site/build/translations/, or use sections 2-5 of any teacherclassextracted slide file.
- Delete files you did not create. Move a stray file to workspace/cheatsheet_previews/quarantine/ and report it.
- Push anything that fails check_cheatsheet.py, the scan, check_page.mjs, test_server.mjs or the site manifest check, even if I tell you to.
- Write "Claude", "Anthropic", "ZCode" or "GLM" in the cheatsheet or the lessons, or "Claude", "Anthropic" or "xAI" in site/template.html.

AFTER THE TASK:
- Run check_cheatsheet.py on every file you wrote and paste the output. (S1: run check_cheatsheet.py --all --partial. S2 and V0: run test_check_cheatsheet.py. A lesson: also paste every build_audio.py line. Part W: paste the last lines of build_site.py, check_page.mjs and test_server.mjs.)
- Tick the task's box in PROGRESS_CHEATSHEET_ZCODE.md and paste the evidence under it: commands and their last lines, the files you changed, the pages and pictures you opened.
- Then go straight on to the next box. Report to me in English only when every box is ticked, or when a hard stop below happens.
- HARD STOPS (the only times you stop and tell me): a check, the scan or the site manifest fails and you cannot fix it; build_audio.py keeps failing; git push is rejected or a rebase conflicts; or, before W1, Grokbot Part L (L2, L3) is still open. In that case, first write every lesson script R01-R10 and check each one (no recording), then stop.
```
