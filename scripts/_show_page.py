import re
import sys

import pypdf

from _verify_pages import locate, norm


def main(path, printed, terms):
    reader = pypdf.PdfReader(path)
    idx = locate(reader, printed)
    t = re.sub(r"\s+", " ", reader.pages[idx].extract_text() or "")
    print(f"===== {path.split('/')[-1]} printed {printed} (pdf {idx + 1}) =====")
    seen = set()
    for term in terms:
        for m in re.finditer(term, t, re.I):
            s = max(0, m.start() - 420)
            key = s // 300
            if key in seen:
                continue
            seen.add(key)
            print(f"[{term}] ...{t[s:m.start() + 420].strip()}...")
            print()


if __name__ == "__main__":
    main(sys.argv[1], int(sys.argv[2]), sys.argv[3].split("|"))
