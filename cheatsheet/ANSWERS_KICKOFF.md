# Kickoff prompt for Part E, the worked exam answers (Cursor + Grok)

Open `D:\HVL2025\514` in Cursor, choose Agent mode and a Grok model, and paste the prompt below. Paste it again in a new conversation whenever the agent says "Paste the kickoff again to continue."

```text
You are adding six worked exam answers as audio lessons (R11-R16) to my INN514 companion site https://inn514.canner.app/, in D:\HVL2025\514\workspace\lecture-audio. You execute every task, review your own work at each STOP GATE, and push to GitHub.

READ FIRST: workspace/lecture-audio/cheatsheet/ANSWERS_PLAN.md (the spec), then the sections of CHEATSHEET_PLAN.md it names (2, 3, 4.8, 5, 7.8, 8, 9, 10, 11), then PROGRESS_ANSWERS.md.

AUTOPILOT: I give no feedback or approvals. Start at the first unchecked box and go through every task and STOP GATE in order until the last box is ticked. At a gate, re-read the batch from disk as if someone else wrote it, do the full review, commit and push as the plan says, run the live check, and go straight on.

DO THE TASK:
- Use the plan's formats, names, limits and wording exactly. Add no features.
- Write every sentence yourself. No script writes or rewrites prose.
- The two model answer PDFs give structure only. A fact is used only when a course page or slide confirms it. Never copy 8 words in a row from them.
- If the plan is unclear, choose the safest reading that keeps every check passing, note it with a date in ANSWERS_PLAN.md section 11, and go on.
- If the conversation gets too long, tick what is done and tell me only: "Paste the kickoff again to continue."

YOU MAY: create and edit files in workspace/lecture-audio/cheatsheet/ (only section 11 of the two plan files) and workspace/cheatsheet_previews/; in task E4 only, edit scripts/build_site.py, site/template.html and scripts/check_page.mjs as the plan says; run the commands in the plan, from D:/HVL2025/514.

YOU MUST NOT:
- Edit, move or delete anything else: lectures/, readings/, cache/, server.js, build_audio.py, the existing site/data and site/audio files, workspace/extracted/, or any PDF. Never copy the model answer PDFs or their text into the repo.
- Run build_audio.py with anything but R11-R16. Run any git command the plan does not list, stage paths outside a gate's list, or force-push.
- Install anything or use the web. The only online calls are build_audio.py's voice and the --live check.
- Quote Paper 2 or Paper 5. Write Claude, Anthropic, ZCode, GLM, Cursor or Grok in any content file.
- Push anything that fails check_cheatsheet.py, the scan, check_page.mjs, test_server.mjs or the site manifest check.

AFTER EACH TASK: paste the check output (and every build_audio.py line for a lesson) under its box, tick it, and go on. Report to me in English only when every box is ticked or at a HARD STOP.

HARD STOPS: a check fails and you cannot fix it; build_audio.py keeps failing; push is rejected or a rebase conflicts; or git status shows someone else's changes outside the gate's paths before you start E4.
```
