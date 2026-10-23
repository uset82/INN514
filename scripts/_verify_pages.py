import re
import sys
import unicodedata

import pypdf

LIG = {"\ufb00": "ff", "\ufb01": "fi", "\ufb02": "fl", "\ufb03": "ffi", "\ufb04": "ffl", "\u00ad": ""}


def norm(t):
    for k, v in LIG.items():
        t = t.replace(k, v)
    t = unicodedata.normalize("NFKD", t)
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r"-\s+", "", t)
    return re.sub(r"\s+", " ", t).lower()


def locate(reader, printed):
    for i in range(len(reader.pages)):
        lines = [l.strip() for l in (reader.pages[i].extract_text() or "").splitlines() if l.strip()]
        if not lines:
            continue
        edge = " ".join(lines[:2] + lines[-2:])
        if re.search(r"(?<!\d)" + str(printed) + r"(?!\d)", edge):
            return i
    return None


def main(path, spec):
    reader = pypdf.PdfReader(path)
    name = path.split("/")[-1]
    for printed, terms in spec:
        idx = locate(reader, printed)
        if idx is None:
            print(f"{name}: printed {printed} NOT LOCATED")
            continue
        t = norm(reader.pages[idx].extract_text() or "")
        print(f"{name}: printed {printed} -> pdf page {idx + 1} ({len(t)} chars)")
        for term in terms:
            c = t.count(norm(term))
            print(f"    {term!r:38} {c}")
        print()


if __name__ == "__main__":
    main(sys.argv[1], eval(sys.argv[2]))
