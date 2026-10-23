"""Build site/index.html from site/template.html and the lecture and reading data in site/data/.

    C:/Python313/python.exe workspace/lecture-audio/scripts/build_site.py

The catalog lists every lecture in Kursplan 2026 order; the readings catalog lists the 17
course papers in the order of the lectures they belong to (reading_lib.ORDER). A lecture or
reading is "ready" when site/data/<id>.json exists (written by build_audio.py). A reading
also needs Claude Code's review: only ids listed in site/reviewed.json reach the page, so a
paper an agent is still writing is never published by accident. Checks that every audio file
the page refers to exists, and prints the files to publish.
COMPANION_SITE may point at a scratch copy of site/ (data, audio, output) for testing.
"""
import json
import os
import pathlib
import re
import sys

from reading_lib import ORDER, paper_meta

ROOT = pathlib.Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "site" / "template.html"
SITE = pathlib.Path(os.environ.get("COMPANION_SITE", ROOT / "site"))

# (id, number shown on the route, full title, when, teacher, note). "num" is the Kursplan
# 2026 session number, so it is a real sequence; the bonus lecture is outside the Kursplan.
# "teacher" is shown on every class; "note" is a quiet extra line, empty for most.
CATALOG = [
    ("T1", "1", "Innovation as systemic and sustainable transformation", "Session 1, 21 September",
     "Arnt Fløysand", ""),
    ("T2", "2", "Regional innovation systems and sustainable transformation", "Session 2, 22 September",
     "Arnt Fløysand", ""),
    ("T3", "3", "Institutional work in the regional innovation systems of Hordaland and Rogaland", "Session 3, 25 September",
     "Arnt Fløysand", ""),
    ("T4", "4", "Entrepreneurial ecosystems and sustainable transformation", "Session 4, 28 September",
     "Nora Geirsdotter Bækkelund", ""),
    ("T5", "5", "Agency and innovation systems in change", "Session 5, 29 September",
     "Nora Geirsdotter Bækkelund", ""),
    ("T6", "6", "Technological innovation systems and sustainable transformation", "Session 6, 20 October",
     "Rune Njøs", "From the 2025 guest lecture. Kelvin Ivankovic teaches session 6 in 2026."),
    ("T8", "9", "Summary and exam preparation", "Session 9, 2 November",
     "Arnt Fløysand", ""),
    ("B1", "Bonus", "The art of crowdfunding", "Bonus class from H2025, not in Kursplan 2026",
     "Alice Demattos Guimarães", ""),
]

# Sessions 7 and 8 have no slides: they go through the papers. From Kursplan INN514 2026.
SESSIONS = [
    {"num": "7", "title": "The papers: summary and reflection", "when": "Session 7, 26 October",
     "teacher": "Kelvin Ivankovic"},
    {"num": "8", "title": "The papers: summary and reflection", "when": "Session 8, 27 October",
     "teacher": "Kelvin Ivankovic"},
]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    reviewed_file = SITE / "reviewed.json"
    reviewed = set(json.loads(reviewed_file.read_text(encoding="utf-8"))) if reviewed_file.exists() else set()
    lectures, held = {}, []
    for p in sorted((SITE / "data").glob("*.json")):
        if re.fullmatch(r"P\d\d", p.stem) and p.stem not in reviewed:
            held.append(p.stem)
            continue
        lectures[p.stem] = json.loads(p.read_text(encoding="utf-8"))
    readings = []
    for pid in ORDER:
        m = paper_meta(pid)
        readings.append({"id": pid, "num": m["num"], "title": m["title"], "cite": m["cite"], "authors": m["authors"],
                         "surname": re.split(r"[ ,&]", m["authors"])[0], "year": m["year"], "source": m["source"],
                         "lectures": m["lectures"], "ready": pid in lectures})
    catalog = [{"id": i, "num": n, "title": t, "when": w, "teacher": te, "note": no, "ready": i in lectures,
                "readings": [r["id"] for r in readings if i in r["lectures"]]} for i, n, t, w, te, no in CATALOG]
    data = {"catalog": catalog, "readings": readings, "sessions": SESSIONS, "lectures": lectures}
    missing = [c["audio"] for lec in lectures.values() for c in lec["chapters"] if not (SITE / c["audio"]).exists()]
    if missing:
        print(f"FAIL: missing audio files {missing}")
        return 1
    html = TEMPLATE.read_text(encoding="utf-8")
    html = html.replace("/*DATA*/", json.dumps(data, ensure_ascii=False).replace("</", "<\\/"))
    (SITE / "index.html").write_text(html, encoding="utf-8")
    files = sorted(c["audio"] for lec in lectures.values() for c in lec["chapters"])
    size = sum((SITE / f).stat().st_size for f in files)
    ready_l = [c["id"] for c in catalog if c["ready"]]
    ready_r = [r["id"] for r in readings if r["ready"]]
    print(f"index.html: {len(html.encode('utf-8')) / 1024:.0f} KB; ready lectures: {', '.join(ready_l) or 'none'}; "
          f"ready readings: {', '.join(ready_r) or 'none'}")
    if held:
        print(f"not yet reviewed, so left off the page: {', '.join(held)} (add an id to site/reviewed.json after review)")
    print(f"audio files to publish: {len(files)} ({size / 1e6:.1f} MB)")
    for f in files:
        print(f"  {f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
