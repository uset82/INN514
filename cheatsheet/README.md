# INN514 cheatsheet

- `cards/` — 17 paper cards, one per course reading, in course order.
- `themes/` — the 8 theme sheets, each with definitions, models, exam angles, Norway examples and an answer template.
- `front/` — the exam-day page: the six past questions, a comparison of the systems, twelve definitions and how to answer.
- `back/` — the glossary and the source list.
- `scripts/` — `cheat_lib.py` (shared facts), `check_cheatsheet.py` (the checks and the scan), `test_check_cheatsheet.py` (its tests), `build_cheatsheet.py` (the assembled file, the HTML and the PDF).
- `print/` — the generated A4 PDF and its HTML.

Rebuild and check:

```
C:/Python313/python.exe workspace/lecture-audio/cheatsheet/scripts/build_cheatsheet.py
C:/Python313/python.exe workspace/lecture-audio/cheatsheet/scripts/check_cheatsheet.py --all
```
