"""Check that every name, number and date in a lecture comes from the sources.

    C:/Python313/python.exe workspace/lecture-audio/scripts/check_sources.py T4

Added after the Lecture 3 review (2026-10-16). Its errors were all of one kind:
a co-author who does not exist ("Rekers"), a date nobody gave ("Ekofisk 1969",
"in the 1970s"), and specific details with no source. This script fails when the
prose of a lecture contains:
  1. a capitalised name (person, place, organisation) that is not the first word of
     a sentence and appears nowhere in the course material (all slides, all 17
     readings, the reading list);
  2. a number (including years) that is not on this lecture's slides, in the
     readings this lecture cites, or in the past exam papers;
  3. "page N" that is not one of the pages listed in that chapter's readings line;
  4. "slide N" that is not one of that chapter's slides.
A fact that only appears inside a slide image (so it is not in the extracted text)
can be declared in the lecture with a comment, which must say where it is:
    <!-- sourced: Dicken | slide 36, figure caption in the image -->
The student or Claude can then check those few by eye.
"""
import pathlib
import re
import sys

import fitz

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parents[0] / "study-site" / "pipeline"))
import guards_lib as G  # noqa: E402

CLEAN = G.BUILD / "clean"
EXAMS = [G.REPO / "INN514-Innovasjonssystemer-og-bærekraftig-transformasjon-04.12.24.pdf",
         G.REPO / "INN514-Innovasjonssystemer-og-bæarekraftig-transformasjon-20.06.25.pdf"]
EXTRA_OK = {"lecture", "lectures", "kursplan", "session", "chapter", "chapters", "bonus", "exam",
            "december", "june", "january", "here", "slide", "slides", "page", "pages", "readings"}


def names_in(text):
    out = set()
    for sent in G.sentences(text):
        for clause in re.split(r"[:;—–(\"“«]", sent):
            toks = re.findall(r"[A-Za-zÆØÅæøåÄÖÜäöüé][\w'’-]*", clause)
            for tok in toks[1:]:
                if tok[0].isupper() and len(tok) >= 3 and not tok.isupper():
                    out.add(re.sub(r"['’]s$", "", tok))
    return out


def numbers_in(text):
    text = re.sub(r"(?i)\b(slides?|pages?|pp?\.)\s+\d+(\s*(?:[–-]|and|to)\s*\d+)?", " ", text)
    return {n.replace(",", "") for n in re.findall(r"(?<![\w.])\d[\d,]*(?:\.\d+)?", text)}


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8")
    if not argv:
        print(__doc__)
        return 2
    lid = argv[0].upper()
    text = (ROOT / "lectures" / f"{lid}.md").read_text(encoding="utf-8")
    meta = re.search(r"<!--\s*lecture:.*?deck:\s*(.+?)\s*\(", text)
    deck_file = meta.group(1).strip() if meta else ""
    deck = next((d["id"] for d in G.manifest()["decks"] if d["filename"] == deck_file), None)
    if not deck:
        print(f"FAIL: deck '{deck_file}' in the meta line is not a known deck file")
        return 1
    slides_text = "\n".join(p.read_text(encoding="utf-8") for p in sorted((CLEAN / deck).glob("slide-*.txt")))

    # Numbers must be on the slides or on the specific pages the readings lines cite.
    # (A paper's reference list contains almost every year, so whole papers are too loose:
    # an earlier version let "Ekofisk 1969" and "the 1970s" through.)
    cited_pages = {}
    for seg in re.split(r";", " ; ".join(re.findall(r"<!--\s*readings:\s*(.*?)\s*-->", text))):
        m = re.search(r"([A-ZÆØÅ][\w’'-]+).*?\b((?:19|20)\d{2})\b", seg)
        if not m:
            continue
        for a in G.course()["articles"]:
            first_author = re.split(r"[,&]| et al", a["authors"])[0].strip().split()
            years = {str(a["year"])} | set(re.findall(r"\b(?:19|20)\d{2}\b", a["bibliographic_entry"]))
            if m.group(1) in first_author and m.group(2) in years:
                pages = {int(x) for x in re.findall(r"\b\d{1,4}\b", seg[m.end():])}
                pmap = G.printed_map(a["pid"])
                pdf = {n for n, ps in pmap.items() if ps & pages} if pmap else pages
                cited_pages.setdefault(a["pid"], set()).update(pdf)
    cited = sorted(cited_pages)
    cited_text = "\n".join(G.paper_pages(p).get(n, "") for p, ns in cited_pages.items() for n in ns)
    exam_text = ""
    for e in EXAMS:
        with fitz.open(e) as d:
            exam_text += "\n".join(pg.get_text() for pg in d)

    declared = {}
    for tok, where in re.findall(r"<!--\s*sourced:\s*(.*?)\s*\|\s*(.*?)\s*-->", text):
        declared[tok.strip().lower()] = where.strip()

    corpus = G.corpus_words()
    # Slides write "60 000"; join digit groups split by a space so "60,000" in the prose matches.
    source_numbers = re.sub(r"(\d)[\s  ](\d{3})\b", r"\1\2", slides_text + cited_text + exam_text)
    numbers_ok = set(re.findall(r"\d+", source_numbers.replace(",", "")))
    numbers_ok |= {"2024", "2025"}          # the exam papers are dated 4.12.24 and 13.06.2025

    fails, n_names, n_nums = [], 0, 0
    for i, block in enumerate(re.split(r"^## ", text, flags=re.M)[1:], 1):
        head, _, body = block.partition("\n")
        sl = re.search(r"<!--\s*slides:\s*(.*?)\s*-->", body)
        ch_slides = {int(x) for x in re.findall(r"\d+", sl.group(1))} if sl else set()
        rd = re.search(r"<!--\s*readings:\s*(.*?)\s*-->", body)
        ch_pages = {int(x) for x in re.findall(r"\b\d{1,4}\b", rd.group(1))} if rd else set()
        prose = re.sub(r"<!--.*?-->", "", body, flags=re.S)
        where = f"ch {i}"

        for name in sorted(names_in(prose)):
            n_names += 1
            low = name.lower()
            if low in G.NAME_ALLOWLIST or low in EXTRA_OK or low in declared:
                continue
            if G.word_set(name) <= corpus:
                continue
            if len(low) >= 4 and any(w.startswith(low) for w in corpus):
                continue          # e.g. "Trott" inside "Trottboka"
            fails.append(f"{where}: name '{name}' appears nowhere in the course slides or readings")
        for num in sorted(numbers_in(prose)):
            n_nums += 1
            if num.lower() in declared or set(re.findall(r"\d+", num)) <= numbers_ok:
                continue
            fails.append(f"{where}: number '{num}' is not on this lecture's slides, in its cited readings or in the exams")
        for m in re.finditer(r"(?i)\bslides?\s+(\d+)(?:\s*(?:[–-]|and|to)\s*(\d+))?", prose):
            lo, hi = int(m.group(1)), int(m.group(2) or m.group(1))
            if not set(range(lo, hi + 1)) <= ch_slides:
                fails.append(f"{where}: '{m.group(0)}' is not one of this chapter's slides {sorted(ch_slides)}")
        for m in re.finditer(r"(?i)\b(?:on |at )?pages?\s+(\d+)", prose):
            if int(m.group(1)) not in ch_pages:
                fails.append(f"{where}: '{m.group(0).strip()}' is not in this chapter's readings line")

    cited_desc = ", ".join(f"{p} (PDF pp. {','.join(map(str, sorted(cited_pages[p])))})" for p in cited)
    print(f"{lid}: deck {deck}; cited readings {cited_desc or 'none'}; "
          f"{n_names} names and {n_nums} numbers checked; {len(declared)} declared from slide images")
    for tok, where in declared.items():
        print(f"  declared: {tok} ({where})")
    if fails:
        print(f"FAIL: {len(fails)} problem(s)")
        for f in fails:
            print(f"  - {f}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
