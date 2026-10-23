"""Extract the course papers page by page for the reading companion.

    C:/Python313/python.exe workspace/lecture-audio/scripts/extract_paper.py P01 [P02 ...]
    C:/Python313/python.exe workspace/lecture-audio/scripts/extract_paper.py all

Writes workspace/extracted/pages/<P>/:
  page-<label>.txt       one file per page. The label is the printed page number;
                         P02 has none, so its labels are PDF page numbers; a
                         publisher's cover sheet is labelled "cover";
  pages.json             label, PDF page, printed page, kind guess, words, picture;
  img/page-<label>.png   a picture of every page that contains a figure or photo.
Kinds are guesses (article, cover, references, mixed); the agent confirms them.

A scanned paper (listed in reading_lib.SCANS) has no text layer, so its pages are
read by OCR of the scan (easyocr, the paper's language) and cached under
workspace/extracted/pages/<P>/ocr/. P05 is a two-up scan: two printed pages per PDF
page, left half first. Its pictures are the existing renders in
workspace/study-site/build/papers/P05/, and an unverified draft English translation
is written next to each page as page-<label>.en.txt. P05 page files are never
overwritten once CORRECTIONS.md exists, so verified corrections survive a re-run.
The source PDFs are only read, never changed.
"""
import json
import sys

import fitz

from reading_lib import G, PAGES_ROOT, SCANS, _p05_blocks, ocr_pages, page_table, paper_meta

P05_IMAGES = G.SITE / "build" / "papers" / "P05"


def extract(pid):
    meta = paper_meta(pid)
    out = PAGES_ROOT / pid
    if pid in SCANS and (out / "CORRECTIONS.md").exists():
        print(f"{pid}: CORRECTIONS.md exists, so the corrected page files are kept as they are")
        return json.loads((out / "pages.json").read_text(encoding="utf-8"))["pages"]
    (out / "img").mkdir(parents=True, exist_ok=True)
    rows = []
    if pid in SCANS:
        # A scan has no text layer, so the pages are read by OCR. The vision
        # transcription and its draft translation are kept alongside, not used as
        # the source: they were made by hand and are unverified.
        ocr = ocr_pages(pid)
        eng = _p05_blocks(G.P05_ENGLISH) if pid == "P05" else {}
        for r in page_table(pid, use_files=False):
            if not r["text"].strip() and r["label"] in ocr:
                r["text"] = ocr[r["label"]]
            img = P05_IMAGES / f"page-{r['pdf']:02d}.png" if pid == "P05" else None
            head = (f"<!-- {pid} | {meta['cite']} | PDF page {r['pdf']} | printed page {r['label']} | "
                    f"kind guess: {r['kind']} | OCR of the scan: check anything doubtful against the picture -->\n\n")
            (out / f"page-{r['label']}.txt").write_text(head + r["text"] + "\n", encoding="utf-8")
            if r["label"] in eng:
                (out / f"page-{r['label']}.en.txt").write_text(
                    f"<!-- {pid} | printed page {r['label']} | UNVERIFIED draft English translation: "
                    f"check every claim against the Norwegian page -->\n\n{eng[r['label']][1]}\n", encoding="utf-8")
            rows.append({"label": r["label"], "pdf_page": r["pdf"], "printed_page": r["printed"], "kind": r["kind"],
                         "words": len(r["text"].split()), "text_source": "ocr",
                         "image": str(img.relative_to(G.REPO)).replace("\\", "/") if img and img.exists() else None})
    else:
        rec = G.paper_record(pid)
        images = rec.get("images_per_page") or []
        with fitz.open(G.REPO / rec["path"]) as doc:
            for r in page_table(pid, use_files=False):
                img = None
                if r["kind"] != "cover" and r["pdf"] <= len(images) and images[r["pdf"] - 1]:
                    path = out / "img" / f"page-{r['label']}.png"
                    doc[r["pdf"] - 1].get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(str(path))
                    img = str(path.relative_to(G.REPO)).replace("\\", "/")
                where = (f"printed page {r['label']}" if r["printed"] else
                         "publisher's cover sheet" if r["label"] == "cover" else "no printed page number (label = PDF page)")
                head = f"<!-- {pid} | {meta['cite']} | PDF page {r['pdf']} | {where} | kind guess: {r['kind']} -->\n\n"
                (out / f"page-{r['label']}.txt").write_text(head + r["text"] + "\n", encoding="utf-8")
                rows.append({"label": r["label"], "pdf_page": r["pdf"], "printed_page": r["printed"],
                             "kind": r["kind"], "words": len(r["text"].split()), "image": img})
    (out / "pages.json").write_text(json.dumps({"pid": pid, "cite": meta["cite"], "pages": rows},
                                               ensure_ascii=False, indent=1), encoding="utf-8")
    return rows


def main(args):
    sys.stdout.reconfigure(encoding="utf-8")
    ids = [f"P{i:02d}" for i in range(1, 18)] if [a.lower() for a in args] == ["all"] else [a.upper() for a in args]
    if not ids:
        print(__doc__)
        return 2
    for pid in ids:
        rows = extract(pid)
        kinds = {}
        for r in rows:
            kinds[r["kind"]] = kinds.get(r["kind"], 0) + 1
        nums = [r["label"] for r in rows if isinstance(r["label"], int)]
        span = f"{nums[0]}-{nums[-1]}" if nums else "none"
        print(f"{pid}: {len(rows)} pages, labels {span}{' + cover' if 'cover' in [r['label'] for r in rows] else ''}; "
              f"kinds {kinds}; pictures {sum(1 for r in rows if r['image'])}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
