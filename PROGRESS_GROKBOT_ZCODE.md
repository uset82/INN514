# Grokbot for INN514: ZCode + GLM 5.3 Flash progress

Spec: `workspace/lecture-audio/GROKBOT_PLAN.md`. Prompt: `workspace/lecture-audio/GROKBOT_KICKOFF.md`.
Do the first unchecked task only, one task per conversation. Tick a box only when the task is done, and paste its evidence under it: the commands you ran, their output (or the last lines), and the files you changed. Never tick a STOP GATE.

## Phase 0: plan files, backups and manifest (Claude Code)
- [x] Done by Claude Code on 2026-10-23. Wrote `GROKBOT_PLAN.md` (the spec), `GROKBOT_KICKOFF.md` (the prompt) and this file. Backed up `site/template.html` and `scripts/check_page.mjs` to Claude's scratchpad as `*.before-grokbot`. Wrote the checksum manifest of the content that must not change to `checks/grokbot-manifest-before.txt`.
- Already done before this plan: the knowledge pack in `uset82/grok-watch-hub` (commit `172bc14`), exported by `scripts/export_knowledge.py`.
- Still open for the student: paste the routine line into Grok Principal's routine.

## Part R: the public repo and the Canner copy
- [x] R1. `.gitignore`, repo `README.md` and `robots.txt` in `workspace/lecture-audio/` (plan Part R, R1)
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): checked first that none of the three files existed (`ls -la workspace/lecture-audio/` — no `.gitignore`, `README.md` or `robots.txt`), then created them.
  - Commands run: `ls -la /d/HVL2025/514/workspace/lecture-audio/` (layout check, no overwrites) and `head -8 build_audio.py build_site.py check_page.mjs export_knowledge.py` (docstrings, to keep the Build lines factual). No build required for this task.
  - Files created: `workspace/lecture-audio/.gitignore` (exact plan lines: `cache/`, `checks/*.png`, `__pycache__/`, `*.before-*`, `.env`, `.env.*`, `*.key`), `workspace/lecture-audio/robots.txt` (`User-agent: *` / `Disallow: /`), `workspace/lecture-audio/README.md` (five sections with the plan's wording word for word; title `# INN514 Course Companion` added).
- [x] R2. `scripts/build_static.py` (plan Part R, R2). Run it: every check passes, and the root `index.html` is written
  - Evidence (ZCode + GLM 5.3 Flash, 2026-10-23): command run from `D:/HVL2025/514`:
    - `C:/Python313/python.exe workspace/lecture-audio/scripts/build_static.py`
    - Output: `index.html: 531 KB, 154 audio files under site/audio/` (no FAIL; all three pre-write checks passed).
  - Spot-check of the written `workspace/lecture-audio/index.html`: starts `<!doctype html>` / `<html lang="en"><head><meta charset="utf-8">` / viewport meta / robots meta, then the fragment, ends `</script></html>`; 154 `"audio": "site/audio/` paths and 0 old `"audio": "audio/`; `noindex, nofollow` present; "unofficial study aid" absent.
  - Files: created `scripts/build_static.py`; it wrote `index.html` at the repo root (`workspace/lecture-audio/`, the repo root per R1). `site/index.html` untouched.
- [ ] **STOP GATE G0:** student approved
  - **Claude Code's G0 work (2026-10-23):**
    - **R1 and R2 reviewed:** both match the plan. In R1, Claude turned one README sentence fragment into a full sentence. In R2, `build_static.py` now fails if it finds no audio paths at all. The Canner copy passes all 35 page checks on its own (`checks/page-check-static-copy.log`).
    - **Scan of the 276 files git would add** (scratchpad `g0_scan.py`):
      - no PDFs, Office files, cache or screenshots; the largest file is 2.0 MB and the total is 167 MB;
      - no secrets or email addresses;
      - absolute paths only to tool locations and the planned hub paths.
    - **Paper 2 overlaps found and fixed:**
      - one Paper 2 check answer reproduced Latour's definition as the paper quotes it (page 9). It is reworded in `readings/P02.md`; the data was regenerated from cache, and the MP3s are byte-identical;
      - `check_reading.py` now scans check questions and answers for copied wording; tested on a scratch copy of the old text, which fails;
      - Claude's old review note in `PROGRESS_READINGS_ANTIGRAVITY.md` quoted three Paper 2 phrases and the Figure 1 labels; they are now described instead.
      - The rest are acceptable: the paper's own title and its "do not quote" notice, citations, the Figure 2 labels, and one generic 4-word phrase.
    - **Manifest:** `checks/grokbot-manifest-before.txt` was refreshed after these intended changes.
    - **Pushed:** `git init -b main`, then commit `772b254` "INN514 Course Companion: source, site and audio", pushed to public `uset82/INN514`. GitHub's tree has 276 files, the same as the local commit.
    - **Also fixed elsewhere:** the claude.ai link is republished as version 31 (it now matches the build apart from the wrapper, and the copied phrase is gone), and the knowledge pack in the private hub is refreshed as commit `1f4a6ed`.
    - **Waiting for:** the student's Canner connection, then Claude's check of the Canner URL. (after Claude Code's scan, first commit and push to `uset82/INN514`, the student's Canner connection, and Claude's check of the Canner URL)

## Part A: the speaking orb (claude.ai link)
- [ ] A1. CSS: `.ask-btn`, `.ask`, chips, input, status line, `.ask-text`, orb states, reduced motion (plan A.0, A.1)
- [ ] A2. Orb SVG and its gradient definition, the per-chapter `.ask-btn` (hidden without `body.can-ask`), panel markup (plan A.0, A.1)
- [ ] A3. Availability (`sampleFn`), `chapterContext`, chips and typed question, the call with the answer shown as text for now (plan A.2)
- [ ] A4. Speech queue, sentence splitting, voices, language detection, Stop, pausing the player, text backup (plan A.2)
- [ ] A5. Error messages table, one panel at a time, follow-up history (6 turns), close and stop on route change (plan A.2)
- [ ] A6. `check_page.mjs`: the mock pass and every A.3 check, `phone-ask.png` and `phone-ask-dark.png`, full run ending "ALL PAGE CHECKS PASSED", then `build_static.py` (plan A.3)
- [ ] **STOP GATE G1:** student approved (after Claude Code's review, the claude.ai publish with the `sample` ability, the push for Canner, and the student's phone test)

## Part B: one-command pack sync
- [ ] B1. `scripts/sync_knowledge.py` (plan Part B)
- [ ] B2. Default run (no flags) reports "pack unchanged"
- [ ] **STOP GATE G2:** student approved

## Part C: Grokbot test kit (the watch)
- [ ] C1. `GROKBOT_TEST.md` and `checks/grokbot_tests.json`: 12 questions written from the pack files (plan Part C)
- [ ] C2. `scripts/check_outbox.py` (plan Part C)
- [ ] C3. Dry run on a scratch hub folder with 2 fake pairs: one PASS, one FAIL
- [ ] **STOP GATE G3:** student approved (after the real watch test and Claude Code's check of the answers)
