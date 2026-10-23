# Kickoff prompt for Grokbot (ZCode + GLM 5.3 Flash)

Open `D:\HVL2025\514` in ZCode, choose GLM 5.3 Flash, and paste the prompt below into a **new conversation for every task**. The agent does the next unchecked task in its progress file and stops. Do not use any autonomous or "keep going" mode.

When the agent writes "STOP GATE G<n>", paste its report into Claude Code and say: "Review gate G<n> and publish."

## ZCode + GLM 5.3 Flash

```text
You are building part of "Grokbot for INN514", a study companion for my master's course, in D:\HVL2025\514\workspace\lecture-audio. You are the executor. Claude Code reviews your work and does every git, publish and deploy step.

READ FIRST, in this order:
1. workspace/lecture-audio/GROKBOT_PLAN.md: read "Context", "Who does what", the Part of your task (A, S, B or C), and "Rules for ZCode + GLM 5.3 Flash". It is the single spec.
2. workspace/lecture-audio/PROGRESS_GROKBOT_ZCODE.md. Do ONLY the first unchecked task. If the first unchecked box is a STOP GATE, stop and tell me.
Then show me your task list (3 to 6 short steps) before you start.

DO THE TASK:
- Use the plan's code shapes, names and wording exactly. Do not rename, add features, or "improve" anything the task doesn't ask for.
- If something in the plan is unclear or seems wrong, stop and ask me. Do not guess.
- When editing site/template.html, read only the section you change (search for it), and change only that section.

YOU MAY:
- Edit: site/template.html, scripts/check_page.mjs.
- Create: server.js, package.json, package-lock.json (written by hand), scripts/mock_openrouter.mjs, scripts/test_server.mjs, scripts/sync_knowledge.py, scripts/check_outbox.py, GROKBOT_TEST.md, checks/grokbot_tests.json.
- Tick boxes and paste evidence in PROGRESS_GROKBOT_ZCODE.md.
- Run, from D:/HVL2025/514:
  C:/Python313/python.exe workspace/lecture-audio/scripts/build_site.py
  C:/Python313/python.exe workspace/lecture-audio/scripts/build_static.py
  node workspace/lecture-audio/scripts/check_page.mjs > workspace/lecture-audio/checks/page-check.log 2>&1
  node workspace/lecture-audio/scripts/test_server.mjs
  C:/Python313/python.exe workspace/lecture-audio/scripts/sync_knowledge.py            (no flags, ever)
  C:/Python313/python.exe workspace/lecture-audio/scripts/check_outbox.py --hub <a scratch folder you made>
  C:/Python313/python.exe workspace/lecture-audio/scripts/export_knowledge.py <a scratch folder you made>

YOU MUST NOT:
- Run any git command in any repository (no init, add, commit, push, remote, pull). Claude Code does all git work.
- Touch D:/Proyectos/watch, except to READ files in grok-watch-hub/knowledge/, grok-watch-hub/inbox/ and grok-watch-hub/outbox/. Never use COM3 or the watch.
- Publish anything, sign in to Canner, OpenRouter or any website, or run sync_knowledge.py with --commit or --push.
- Write any real API key or passcode in any file, or call the real OpenRouter. Server tests use only scripts/mock_openrouter.mjs with OPENROUTER_API_KEY=test-key and GROKBOT_PASSCODE=test-pass.
- Run npm install or any other install. package-lock.json is written by hand, exactly as the plan shows.
- Edit lectures/, readings/, site/data/, site/audio/, cache/, site/reviewed.json, build_site.py, export_knowledge.py, or any script not listed above.
- Install anything (no npm, no pip) or load any script from the web.
- Write "Claude", "Anthropic" or "xAI" in site/template.html.
- Use all caps, " · " joins, "→" in link text, or card shadows. The orb's soft glow is the only exception.
- Invent wording. Use the plan's text word for word. If you had to write a line the plan doesn't give, list it in your report.
- Delete files. If you find a stray file, report it.

AFTER THE TASK:
- Template tasks (A1 to A6): run build_site.py and paste its first line.
- Server tasks: S1 to S3, check that `node workspace/lecture-audio/server.js` starts and answers / (stop it afterwards); S4 and later, run test_server.mjs and paste its last lines (it must end "ALL SERVER CHECKS PASSED").
- A7: run check_page.mjs, open every new screenshot it saves (phone-ask*.png and the others), fix what looks wrong, run again until the log ends "ALL PAGE CHECKS PASSED", then run build_static.py.
- Tick the task's box in PROGRESS_GROKBOT_ZCODE.md and paste the evidence under it: the commands you ran and their output (or the last lines), and the files you changed.
- Report to me in English: what you changed, the evidence, and any wording you added. Then STOP.
- If the next box is a STOP GATE, end your report with: "STOP GATE G<n>: ask Claude Code to review and publish."
```
