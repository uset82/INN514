# Kickoff prompt for Grokbot Parts D, E and F (DeepSeek)

Open `D:\HVL2025\514` in the tool you use with DeepSeek, and paste the prompt below into a **new conversation for every task** (D1 to D7 are done; next come E1, E2, then F1 to F5). The agent does the next unchecked Part D, E or F task in its progress file and stops. Do not use any autonomous or "keep going" mode.

When the agent writes "STOP GATE G<n>", paste its report into Claude Code and say: "Review gate G<n> and publish."

## DeepSeek

```text
You are building part of "Grokbot for INN514", a study companion for my master's course, in D:\HVL2025\514\workspace\lecture-audio. You are the executor. Claude Code reviews your work and does every git, publish and deploy step.

READ FIRST, in this order:
1. workspace/lecture-audio/GROKBOT_PLAN.md: read "Context", "Who does what", the Part of your task ("Part D", "Part E" or "Part F", the whole of it), and "Rules for the executor". It is the single spec. It gives most code in full: copy it exactly.
2. workspace/lecture-audio/PROGRESS_GROKBOT_ZCODE.md, sections "Part D", "Part E" and "Part F". Do ONLY the first unchecked D, E or F task, in that order. Start Part E only once STOP GATE G8 (ZCode's Part N) is ticked, and Part F only once STOP GATE G6 is ticked; if the gate you need isn't ticked, stop and tell me. Ignore the open boxes of other parts (STOP GATE G3 stays open on purpose). If the first unchecked box of your Part is a STOP GATE, stop and tell me.
Then show me your task list (3 to 6 short steps) before you start.

DO THE TASK:
- Use the plan's code, names and wording exactly. Do not rename, add features, or "improve" anything the task doesn't ask for.
- Put new constants and functions exactly where Part D says (ABOUT_TEXT, textLang, courseOverview and the search code go right after the className line).
- If something in the plan is unclear or seems wrong, stop and ask me. Do not guess.
- When editing site/template.html, read only the section you change (search for it), and change only that section.

YOU MAY:
- Edit: site/template.html, scripts/check_page.mjs, server.js, scripts/mock_openrouter.mjs, scripts/test_server.mjs, checks/context-before.txt (D4 only).
- Tick D boxes and paste evidence in PROGRESS_GROKBOT_ZCODE.md.
- Run, from D:/HVL2025/514:
  C:/Python313/python.exe workspace/lecture-audio/scripts/build_site.py
  C:/Python313/python.exe workspace/lecture-audio/scripts/build_static.py
  node workspace/lecture-audio/scripts/check_page.mjs > workspace/lecture-audio/checks/page-check.log 2>&1
  node workspace/lecture-audio/scripts/test_server.mjs

YOU MUST NOT:
- Run any git command in any repository (no init, add, commit, push, remote, pull). Claude Code does all git work.
- Touch D:/Proyectos/watch at all.
- Publish anything, sign in to Canner, OpenRouter or any website, or run the Canner CLI (canner ...).
- Write any real API key or passcode in any file, or call the real OpenRouter. Server tests use only scripts/mock_openrouter.mjs with OPENROUTER_API_KEY=test-key and GROKBOT_PASSCODE=test-pass.
- Run npm install, pip install or any other install, or load any script from the web.
- Edit lectures/, readings/, site/data/, site/audio/, cache/, site/reviewed.json, build_site.py, build_static.py, export_knowledge.py, or any file not listed above.
- Write "Claude", "Anthropic" or "xAI" in site/template.html.
- Use all caps, " · " joins, "→" in link text, or new shadows (the orb's glow and the Grokbot bubble's shadow are the only ones).
- Invent wording. Use the plan's text word for word. If you had to write a line the plan doesn't give, list it in your report.
- Delete files. If you find a stray file, report it.

AFTER THE TASK:
- D1 to D5, F3 and F4: run build_site.py and paste its first line. Then run check_page.mjs and paste its last lines. Until the last task of the Part (D7 or F5), checks that the Part intentionally changes may fail: list each failing check and why, and do not "fix" a failure by changing the plan's behaviour.
- D6, E1, F1 and F2: run test_server.mjs and paste its last lines; it must end "ALL SERVER CHECKS PASSED".
- E2 and F5: run build_site.py, then check_page.mjs until the log ends "ALL PAGE CHECKS PASSED", then build_static.py.
- D7: run check_page.mjs until the log ends "ALL PAGE CHECKS PASSED", open every new screenshot (phone-search.png, phone-search-dark.png, phone-grokbot-hola.png), fix what looks wrong, then run build_static.py.
- Tick the task's box in PROGRESS_GROKBOT_ZCODE.md and paste the evidence under it: the commands you ran and their output (or the last lines), and the files you changed.
- Report to me in English: what you changed, the evidence, and any wording you added. Then STOP.
- After D7, end your report with: "STOP GATE G5: ask Claude Code to review and publish." After E2, end it with: "STOP GATE G6: ask Claude Code to review and publish." After F5, end it with: "STOP GATE G7: ask Claude Code to review and publish."
- Never tick a STOP GATE box yourself, even if I say "I approve everything": Claude Code ticks it after the review and my approval.
```
