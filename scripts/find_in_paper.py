"""Find a phrase in a course article and print where it is.

    C:/Python313/python.exe workspace/lecture-audio/scripts/find_in_paper.py P03 "guiding rules of interaction"
    C:/Python313/python.exe workspace/lecture-audio/scripts/find_in_paper.py P05 "regional fornyelse" --all

Prints, for each match: the PDF page, the printed page (the journal's own page
number, which is what lectures cite as "page N"), and the surrounding text.
By default only the first 3 matches are shown; --all shows every match.
Works on every article P01-P17. P05 is a scanned Norwegian chapter, so it is
searched in its transcription and English translation (both carry page markers).
P02 has no printed page numbers, so cite it by PDF page and never quote it.
"""
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "study-site" / "pipeline"))
import guards_lib as G  # noqa: E402


def flat(text):
    for lig, plain in (("ﬁ", "fi"), ("ﬂ", "fl"), ("ﬀ", "ff"), ("ﬃ", "ffi"), ("ﬄ", "ffl")):
        text = text.replace(lig, plain)
    text = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", text)
    return re.sub(r"\s+", " ", text)


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8")
    if len(argv) < 2:
        print(__doc__)
        return 2
    pid, phrase = argv[0].upper(), argv[1]
    show_all = "--all" in argv
    art = G.article(pid)
    if art is None:
        print(f"{pid} is not an article in course.json (use P01-P17)")
        return 2
    pages = G.paper_pages(pid)
    pmap = G.printed_map(pid)
    if pid == "P05":
        # Two printed pages per scanned PDF page: search each printed page on its own,
        # using the <!-- page: N | printed_page: M --> markers, so the exact page is shown.
        marker = re.compile(r"<!--\s*page:\s*(\d+)\s*\|\s*printed_page:\s*(\d+)\s*-->")
        pages, pmap, keyed = {}, {}, 0
        for path in (G.P05_TRANSCRIPT, G.P05_ENGLISH):
            parts = marker.split(path.read_text(encoding="utf-8"))
            for k in range(1, len(parts), 3):
                keyed += 1
                pages[keyed] = parts[k + 2]
                pmap[keyed] = {int(parts[k + 1])}
                pages.setdefault(f"pdf{keyed}", None)
                pmap[f"pdf{keyed}"] = int(parts[k])
        pages = {k: v for k, v in pages.items() if v is not None}
    words = re.findall(r"\w+", phrase)
    pattern = re.compile(r"\W+".join(map(re.escape, words)), re.I)
    print(f"{pid}: {art['authors']} {art['year']}, {art['title']}")
    if pid == "P02":
        print("NOTE: P02 is a paper in preparation, marked 'do not quote'. Paraphrase only; cite PDF pages.")
    hits = 0
    for n, text in pages.items():
        t = flat(text)
        for m in pattern.finditer(t):
            hits += 1
            printed = ", ".join(str(p) for p in sorted(pmap.get(n, []))) if pmap else "none (cite the PDF page)"
            pdf_page = pmap.get(f"pdf{n}", n) if pid == "P05" else n
            ctx = t[max(0, m.start() - 220): m.end() + 220]
            print(f"\n[{hits}] PDF page {pdf_page}  |  printed page {printed}\n    ...{ctx}...")
            if hits >= 3 and not show_all:
                print("\n(first 3 matches shown; add --all for more)")
                return 0
    if not hits:
        print(f"Not found: {phrase!r}. Try fewer or different words. If it is not in the article, leave the claim out.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
