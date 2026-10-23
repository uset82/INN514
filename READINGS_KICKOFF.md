# Kickoff prompts for the reading companion

Open `D:\HVL2025\514` in each tool. Paste the agent's prompt into a **new conversation for every paper**: the agent does the next unchecked paper in its PROGRESS file and then stops. Do not use `/goal` or any autonomous mode. Both agents can run at the same time; they never write the same files.

When an agent reaches a STOP GATE (the end of a batch), paste its report into Claude Code and say: "Check batch R<n> from <Antigravity|WorkBuddy> and publish the lecture companion."

## Antigravity (P01–P08)

```text
You are writing part of the INN514 reading companion for my master's course, in D:\HVL2025\514. You are Antigravity. Your papers, in this order: P01, P02, P03, P04, P05, P06, P07, P08.

READ FIRST, in this order:
1. workspace/lecture-audio/READINGS_PLAN.md, all of it, especially sections 4-8 and "Lessons" in section 10.
2. workspace/lecture-audio/PROGRESS_READINGS_ANTIGRAVITY.md. Do ONLY the next unchecked paper. If the next box is a STOP GATE, stop and tell me.
3. The companion lecture(s) your paper belongs to, in workspace/lecture-audio/lectures/ (the table in section 3 of the plan).
Then show me your task list before you start.

DO THE PAPER (plan section 5):
- Read every page file in workspace/extracted/pages/<P>/ and its pages.json. Open the picture in img/ for every page with a figure or table, and confirm every page's kind by looking at it.
- P05 only: verify every scanned page and write CORRECTIONS.md first (plan 5.4).
- Write workspace/lecture-audio/readings/<P>.md yourself, in the exact format of plan section 4:
  - "The paper in brief" (450-650 words, plan section 6);
  - then one block of 60-100 words for every page, under the paper's own page numbers, in chapters of 3-5 pages.
- Follow every writing rule in plan section 7. Every name, number and quotation must be on that page. P02: no quotation marks at all.

LESSONS FROM CLAUDE CODE'S REVIEWS (plan section 10; read them all before writing, including WorkBuddy's):
- Claude Code reviewed and revised P01, P02, P03 and P04. Do not edit them again.
- Use the paper's own key term (P04's "paradigm"), not a near-synonym that changes the meaning. If the checker counts that term as inflated, say so in your report instead of swapping it.
- If the paper names no limitations of its own, say so. A research question, or a closing quote about uncertainty, is not a limitation, and a research question is not a finding.
- Before writing the course paragraph, search all of workspace/lecture-audio/lectures/ for the authors' names: a paper can serve several lectures.
- Before running the checker, compare every page summary with its page:
  - you covered the whole page, including the introduction's preview of the findings and every "we find", "in sum" or "thus" verdict;
  - each page summary holds that page's own content, not the page before or after;
  - definitions and typologies the paper introduces are on the page that introduces them.
- No cause, sequence or scope the page doesn't state. Attach each outcome to the driver the page gives, keep a mechanism in the page's order, and say who gives a number.
- A limitation is what the authors say limits their study; a finding is not a limitation.
- Mark exam links that are ours ("In our own reading"); credit the lecture with the lecture's links.
- No filler: never list reference-list names in a page summary.
- Record last, after the final text edit. If you change the text afterwards, run both checks again.

CHECKS (paste the full output of each into your PROGRESS file under the paper's box):
1. C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py <P>  ->  PASS (fix the text, never the check)
2. C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py <P>  ->  every chapter [OK]
   The voice service sometimes throttles ("NoAudioReceived"). The recorder now waits and retries up to seven times per chapter, so let it run; a chapter can take several minutes. If it still fails, run the same command again later. Never change the script.
   AUDIO COMES ONLY FROM build_audio.py: never make audio any other way (no direct edge-tts calls, no test files), and never create, copy, rename or delete anything in workspace/lecture-audio/cache/. If recording keeps failing, stop and report it.
Then list every <!-- sourced: --> line, every page picture you looked at, and every page whose kind guess was wrong.

THEN STOP:
- Tick only this paper's box. Never tick a STOP GATE box.
- Tell me the paper is done. If it was the last paper of a batch, say "STOP GATE R<n>-A: ask Claude Code to check batch R<n> and publish."

NEVER: run build_site.py or check_page.mjs (WorkBuddy works in the same folder); edit lectures/, scripts/, site/template.html, site/index.html or WorkBuddy's papers (P09-P17); touch workspace/study-site/ or the PDFs; use workspace/study-site/build/translations/; publish anything; use /goal.
```

## WorkBuddy (P14, P15, P16, P09, P10, P17, P11, P12, P13)

```text
You are writing part of the INN514 reading companion for my master's course, in D:\HVL2025\514. You are WorkBuddy. Your papers, in this order: P14, P15, P16, P09, P10, P17, P11, P12, P13.

READ FIRST, in this order:
1. workspace/lecture-audio/READINGS_PLAN.md, all of it, especially sections 4-8 and "Lessons" in section 10.
2. workspace/lecture-audio/PROGRESS_READINGS_WORKBUDDY.md. Do ONLY the next unchecked paper. If the next box is a STOP GATE, stop and tell me.
3. The companion lecture(s) your paper belongs to, in workspace/lecture-audio/lectures/ (the table in section 3 of the plan).
Then show me your task list before you start.

DO THE PAPER (plan section 5):
- Read every page file in workspace/extracted/pages/<P>/ and its pages.json. Open the picture in img/ for every page with a figure or table, and confirm every page's kind by looking at it.
- Write workspace/lecture-audio/readings/<P>.md yourself, in the exact format of plan section 4:
  - "The paper in brief" (450-650 words, plan section 6);
  - then one block of 60-100 words for every page, under the paper's own page numbers, in chapters of 3-5 pages.
- Follow every writing rule in plan section 7. Every name, number and quotation must be on that page.

LESSONS FROM CLAUDE CODE'S REVIEWS (plan section 10; read them all before writing):
- Claude Code reviewed and revised all nine of your papers (P14, P15, P16, P09, P10, P17, P11, P12, P13). Do not edit them again.
- Before running the checker, compare every page summary with its page and check three things:
  - you covered the whole page, not only its figure or its first half;
  - every chart value matches what the chart shows at that point;
  - the scope of each claim matches the page (one firm is not the whole industry).
- No cause, contrast, limitation or framing the page doesn't state. Keep the paper's qualifiers ("potential", "may", "suggests").
- Every check answer must be answerable from its own chapter's text. If it isn't because the summary missed the page's point, fix the summary, not the question.
- When a page tells a sequence of events, attach each step to the actor who did it.
- Keep points that later pages build on (for example a claim the conclusions return to).
- When the paper defines a numbered list (seven functions, five steps), check that every item is summarised on the page where it is defined.
- Summarise each page's own content. The one-page tolerance is for names that spill over, not for moving content to the next page.
- An illustration ("take for example") is not a study. Say a case was studied only when the page cites that study.
- Before saying how a lecture uses the paper, check the lecture. Never give the paper the lecture's advice.
- When the paper gives reasons ("not least because ..."), use its reasons. Superlatives (last, only, first) need the page's support.
- An evaluation covers what the paper evaluates: don't let one weak part stand for a whole function, and match the strength of the informants' view ("slightly concerned" is not "expect a gap").
- Keep the page's own verdicts: every "we find", "we believe", "in sum", "thus" or "it can be argued" sentence must be reflected in that page's summary. Keep the expectation the research design tests.
- State the paper's own research questions, not a rephrased question. A reported forecast ("it is anticipated") is not the authors' claim, and "will" is not "is".
- Attach each outcome to the driver the page gives, and say who gives a number (an intermediary, an informant).
- A table page needs every block of the table, not only the first. "Cluster B follows" is not a summary.
- In a review paper, credit each reported claim to the authors it cites ("following X"). If a check question names an author, the chapter must name them too.
- Read the lecture's own exam paragraph first: credit its links to the lecture, keep the paper's hedges ("could", "posit"), and don't borrow another reading's terms. If the lecture page marks an example "of our own", it is ours, not the lecturer's.
- In a findings section, the argument comes first and the counts support it. State the paper's main assumption, and say where the paper confirms it.
- Describe the main figure: open the picture, name its parts and list every branch. Each chapter needs its own check question, never a copy of another chapter's.
- When a summary refers to a list (propositions, research questions), name its items. Before writing "the paper does not discuss X", search the page files for X.
- If you change the chapter split after recording, list the audio files that no longer belong to the reading for Claude to move out. Avoid chapters under about 60 words.

CHECKS (paste the full output of each into your PROGRESS file under the paper's box):
1. C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py <P>  ->  PASS (fix the text, never the check)
2. C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py <P>  ->  every chapter [OK]
   The voice service sometimes throttles ("NoAudioReceived"). The recorder now waits and retries up to seven times per chapter, so let it run; a chapter can take several minutes. If it still fails, run the same command again later. Never change the script.
   AUDIO COMES ONLY FROM build_audio.py: never make audio any other way (no direct edge-tts calls, no test files), and never create, copy, rename or delete anything in workspace/lecture-audio/cache/. If recording keeps failing, stop and report it.
Then list every <!-- sourced: --> line, every page picture you looked at, and every page whose kind guess was wrong.

THEN STOP:
- Tick only this paper's box. Never tick a STOP GATE box.
- Tell me the paper is done. If it was the last paper of a batch, say "STOP GATE R<n>-W: ask Claude Code to check batch R<n> and publish."

NEVER: run build_site.py or check_page.mjs (Antigravity works in the same folder); edit lectures/, scripts/, site/template.html, site/index.html, site/reviewed.json or Antigravity's papers (P01-P08); touch workspace/study-site/ or the PDFs; use workspace/study-site/build/translations/; publish anything; use /goal.
```

## First test for WorkBuddy (optional, 1 minute)

Before the first paper, you can ask WorkBuddy to run this and paste the output. It should print the start of the help text and change nothing.

```text
Run: C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py
```
