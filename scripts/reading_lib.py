"""Shared helpers for the reading companion (the 17 course papers).

Used by extract_paper.py, check_reading.py, build_audio.py and build_site.py.
READINGS holds the bibliographic facts, the companion lectures each paper belongs
to and which agent writes it; page_table() gives every page of a paper with its
label (printed page number, the PDF page for P02, or "cover"); parse_reading()
reads readings/<P>.md.
"""
import json
import os
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]                  # workspace/lecture-audio
sys.path.insert(0, str(ROOT.parents[0] / "study-site" / "pipeline"))
import guards_lib as G  # noqa: E402

# READINGS_DIR may be pointed at a scratch folder for testing the scripts on a fixture.
READINGS_DIR = pathlib.Path(os.environ.get("READINGS_DIR", ROOT / "readings"))
PAGES_ROOT = G.REPO / "workspace" / "extracted" / "pages"
MARKER = re.compile(r"<!--\s*page:\s*(\d+)\s*\|\s*printed_page:\s*(\d+)\s*-->")
# A reference-list heading: capitalised, alone on its line, maybe numbered ("5 References")
# or marked with '#'. Lower-case "literature" in a two-column text is not a heading, and a
# table column called "Literature" is not followed by dated reference lines.
REF_HEAD = re.compile(r"^[ \t]*(?:#+[ \t]*|\d+\.?[ \t]+)?(References|REFERENCES|Reference list|Bibliography|"
                      r"Literature|LITERATURE|Litteratur|Referanser|Notes and references|References and notes)[ \t]*$", re.M)
YEAR_LINE = re.compile(r"\b(19|20)\d{2}[a-z]?\b")


def _dated_share(lines):
    lines = [ln for ln in lines if ln.strip()]
    return (sum(1 for ln in lines if YEAR_LINE.search(ln)) / len(lines)) if lines else 0.0, len(lines)

# id: (authors, year, title, source, companion lectures, agent). Years follow the course
# reading list where a file name differs (P06 file says 2017, P16 file says 2016).
READINGS = {
    "P01": ("Fagerberg, Mowery & Verspagen", 2009, "The evolution of Norway's national innovation system",
            "Science and Public Policy 36(6)", ["T1"], "Antigravity"),
    "P02": ("Fløysand, Jakobsen & Hidle", 2013, "The “trinity” of innovation: actors, ideas and objects in innovation practice",
            "Conference paper, 5th Nordic Geographers' Meeting, Reykjavík (paper in preparation, do not quote)", ["T1"], "Antigravity"),
    "P03": ("Fløysand et al.", 2022, "Institutional work, regional key actors, and green industrial restructuring",
            "Norsk Geografisk Tidsskrift – Norwegian Journal of Geography 76(1)", ["T2", "T3"], "Antigravity"),
    "P04": ("Schlaile et al.", 2017, "Innovation systems for transformations towards sustainability? Taking the normative dimension seriously",
            "Sustainability 9(12)", ["T1", "T2", "T8"], "Antigravity"),
    "P05": ("Fløysand & Jakobsen", 2016, "Business development in Western Norway: adaptability and regional renewal (in Norwegian)",
            "Book chapter in Region og regionalisering, Novus Forlag", ["T2"], "Antigravity"),
    "P06": ("Spigel & Harrison", 2018, "Toward a process theory of entrepreneurial ecosystems",
            "Strategic Entrepreneurship Journal 12(1)", ["T4"], "Antigravity"),
    "P07": ("Stam & van de Ven", 2021, "Entrepreneurial ecosystem elements",
            "Small Business Economics 56", ["T4"], "Antigravity"),
    "P08": ("Autio et al.", 2014, "Entrepreneurial innovation: the importance of context",
            "Research Policy 43(7)", ["T4"], "Antigravity"),
    "P09": ("Hekkert et al.", 2007, "Functions of innovation systems: a new approach for analysing technological change",
            "Technological Forecasting and Social Change 74(4)", ["T6"], "WorkBuddy"),
    "P10": ("Steen et al.", 2024, "CCS technological innovation system dynamics in Norway",
            "International Journal of Greenhouse Gas Control 136", ["T6"], "WorkBuddy"),
    "P11": ("Bargoni et al.", 2024, "Crowdfunding and innovation: a bibliometric review and future research agenda",
            "European Journal of Innovation Management 27(4)", ["B1"], "WorkBuddy"),
    "P12": ("Demattos Guimarães, Maehle & Bonet", 2024,
            "The relational forms of cultural-creative crowdfunding: a typology of practices through mapping platforms in Europe and Latin America",
            "Poetics 105", ["B1"], "WorkBuddy"),
    "P13": ("Quero & Ventura", 2019, "Value proposition as a framework for value cocreation in crowdfunding ecosystems",
            "Marketing Theory 19(1)", ["B1"], "WorkBuddy"),
    "P14": ("Bækkelund", 2021, "Change agency and reproductive agency in the course of industrial path evolution",
            "Regional Studies 55(4)", ["T5"], "WorkBuddy"),
    "P15": ("Garud & Karnøe", 2003, "Bricolage versus breakthrough: distributed and embedded agency in technology entrepreneurship",
            "Research Policy 32", ["T5"], "WorkBuddy"),
    "P16": ("Miörner & Trippl", 2017, "Paving the way for new regional industrial paths: actors and modes of change in Scania's games industry",
            "European Planning Studies 25(3)", ["T5"], "WorkBuddy"),
    "P17": ("Njøs et al.", 2020, "Expanding analyses of path creation: interconnections between territory and technology",
            "Economic Geography 96(3)", ["T8"], "WorkBuddy"),
}
# Course order of the readings (the order of the lectures they belong to).
ORDER = ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08",
         "P14", "P15", "P16", "P09", "P10", "P17", "P11", "P12", "P13"]


def paper_meta(pid):
    authors, year, title, source, lectures, agent = READINGS[pid]
    return {"pid": pid, "num": int(pid[1:]), "authors": authors, "year": year, "title": title,
            "source": source, "lectures": lectures, "agent": agent, "cite": f"{authors} {year}"}


def guess_kinds(texts):
    """One guess per page: article, cover, references or mixed (content running into the list).

    The reference list starts at the paper's last reference heading: earlier matches are
    table cells ("References 8.854", a column called "Literature"). Every later page is
    references unless it has an Appendix heading. Without any heading, a page of mostly
    dated lines starts the list (P05's transcription). Two-column layouts and word-per-line
    extraction (P08) make finer tests unreliable, so the agent confirms each guess."""
    kinds = ["cover" if re.search(r"To cite this article|Full Terms & Conditions of access", t) else "article"
             for t in texts]
    start = None
    for i, t in enumerate(texts):
        for m in REF_HEAD.finditer(t):
            start = (i, m.start() / max(len(t), 1))
    if start is None:
        for i, t in enumerate(texts):
            share, n = _dated_share(t.splitlines())
            if kinds[i] == "article" and share >= 0.6 and n >= 10:
                start = (i, 0.0)
                break
    if start is not None:
        i0, pos = start
        kinds[i0] = "references" if pos < 0.15 else "mixed"
        for i in range(i0 + 1, len(texts)):
            appendix = re.search(r"(?m)^[ \t]*(Appendix|APPENDIX)\b", texts[i])
            kinds[i] = "article" if appendix else "references"
    return kinds


def _p05_blocks(path):
    """{printed: (pdf, text)} from a P05 file with <!-- page: N | printed_page: M --> markers."""
    if not path.exists():
        return {}
    parts = MARKER.split(path.read_text(encoding="utf-8"))
    return {int(parts[i + 1]): (int(parts[i]), parts[i + 2].strip()) for i in range(1, len(parts), 3)}


# Papers that are scans: the PDF has no text layer, so the pages are read by OCR.
#   two_up        two printed pages share one PDF page, left half first
#   lang          OCR language model
#   first_printed printed number of the first page image
#   last_printed  last page of THIS chapter. P05's final scan image also carries the
#                 first page of the next chapter (p. 347, Larsen & Wolff), which is
#                 not part of the paper.
SCANS = {"P05": {"two_up": True, "lang": "no", "first_printed": 323, "last_printed": 346}}


def _ocr_half(reader, image):
    import numpy as np
    return reader.readtext(np.array(image), detail=0, paragraph=True)


def ocr_pages(pid, dpi=300):
    """{printed page: OCR text} for a scanned paper, cached on disk.

    The text is written to workspace/extracted/pages/<P>/ocr/pdfNN-L.txt and -R.txt,
    so a re-run reads the cache instead of re-OCRing. Needs easyocr; if it is not
    installed, returns {} and the caller falls back to the vision transcription.
    """
    import fitz
    from PIL import Image

    spec = SCANS.get(pid)
    rec = G.paper_record(pid)
    if not spec or not rec:
        return {}
    path = pathlib.Path(rec["path"])
    if not path.is_absolute():
        path = G.REPO / path
    out = PAGES_ROOT / pid / "ocr"
    out.mkdir(parents=True, exist_ok=True)

    try:
        import easyocr
    except ImportError:
        print(f"{pid}: easyocr is not installed, so the scan cannot be OCR'd")
        return {}

    reader = None
    printed = spec["first_printed"]
    result = {}
    with fitz.open(path) as doc:
        for i in range(doc.page_count):
            sides = ["L", "R"] if spec["two_up"] else ["L"]
            dests = {s: out / f"pdf{i + 1:02d}-{s}.txt" for s in sides}
            if not all(d.exists() for d in dests.values()):
                png = out / f".render-{i + 1:02d}.png"
                doc[i].get_pixmap(dpi=dpi).save(str(png))
                im = Image.open(png).convert("L")
                w, h = im.size
                crops = {"L": im.crop((0, 0, w // 2, h))} if spec["two_up"] else {"L": im}
                if spec["two_up"]:
                    crops["R"] = im.crop((w // 2, 0, w, h))
                for side in sides:
                    if dests[side].exists():
                        continue
                    if reader is None:
                        reader = easyocr.Reader([spec["lang"]], gpu=False, verbose=False)
                    dests[side].write_text("\n".join(_ocr_half(reader, crops[side])), encoding="utf-8")
                png.unlink(missing_ok=True)
            for side in sides:
                text = dests[side].read_text(encoding="utf-8").strip()
                if text and printed <= spec["last_printed"]:
                    result[printed] = text
                    printed += 1
    return result


def _strip_header(text):
    return re.sub(r"^\s*<!--.*?-->\s*", "", text, count=1, flags=re.S)


def page_table(pid, use_files=True):
    """[{label, pdf, printed, kind, text}] in page order.

    Native PDFs are always read fresh from the PDF. A scanned paper (SCANS) has no
    text layer, so its pages come from OCR of the scan; the verified page files in
    workspace/extracted/pages/<P>/ are layered on top when use_files is true, since
    those hold the agent's corrections. The vision transcription is the last resort,
    for a machine with no OCR available."""
    rows = []
    if pid in SCANS:
        spec = SCANS[pid]
        blocks = _p05_blocks(G.P05_TRANSCRIPT) if pid == "P05" else {}
        have_files = any((PAGES_ROOT / pid).glob("page-*.txt"))
        # OCR only when there are no page files at all, i.e. a fresh checkout.
        ocr = {} if have_files else ocr_pages(pid)
        for printed in sorted(set(blocks) | set(ocr)):
            if printed in blocks:
                pdf = blocks[printed][0]
            elif spec["two_up"]:
                pdf = (printed - spec["first_printed"]) // 2 + 1
            else:
                pdf = printed - spec["first_printed"] + 1
            # OCR is the source; the hand-made vision transcription is the fallback
            # for a machine with no OCR. Verified page files override both.
            text = ocr.get(printed) or (blocks[printed][1] if printed in blocks else "")
            f = PAGES_ROOT / pid / f"page-{printed}.txt"
            if use_files and f.exists():
                text = _strip_header(f.read_text(encoding="utf-8")).strip()
            rows.append({"label": printed, "pdf": pdf, "printed": printed, "text": text})
    else:
        pages = G.paper_pages(pid)
        pmap = G.printed_map(pid)
        for pdf in sorted(pages):
            text = pages[pdf].strip()
            printed = min(pmap[pdf]) if pmap else None
            rows.append({"label": printed if pmap else pdf, "pdf": pdf, "printed": printed, "text": text})
    for row, kind in zip(rows, guess_kinds([r["text"] for r in rows])):
        row["kind"] = kind
        if kind == "cover":
            row["label"], row["printed"] = "cover", None
    return rows


def english_draft(pid, label):
    """P05 only: the unverified draft English translation of one page, or ''."""
    f = PAGES_ROOT / pid / f"page-{label}.en.txt"
    return _strip_header(f.read_text(encoding="utf-8")) if f.exists() else ""


def label_list(spec):
    """'cover, 14-16, 18' -> ['cover', 14, 15, 16, 18]."""
    out = []
    for part in re.split(r"\s*,\s*", spec.strip()):
        if not part:
            continue
        if part.lower() == "cover":
            out.append("cover")
            continue
        m = re.fullmatch(r"(\d+)\s*[–-]\s*(\d+)", part)
        if m:
            out.extend(range(int(m.group(1)), int(m.group(2)) + 1))
        elif part.isdigit():
            out.append(int(part))
        else:
            out.append(part)
    return out


def range_text(labels):
    """[431, 432, 433] -> '431–433'; ['cover', 14, 15] -> 'cover, 14–15'."""
    parts, run = [], []
    for lab in labels + [None]:
        if isinstance(lab, int) and run and lab == run[-1] + 1:
            run.append(lab)
            continue
        if run:
            parts.append(str(run[0]) if len(run) == 1 else f"{run[0]}–{run[-1]}")
            run = []
        if isinstance(lab, int):
            run = [lab]
        elif lab is not None:
            parts.append(str(lab))
    return ", ".join(parts)


HEAD_RE = re.compile(r"^###\s+(.*?)\s*$", re.M)


def heading_labels(head):
    """'Page 431' -> [431]; 'Pages 442–444' -> [442, 443, 444]; 'Cover' -> ['cover']; else None."""
    h = head.strip()
    if re.fullmatch(r"(?i)cover", h):
        return ["cover"]
    m = re.fullmatch(r"(?i)page\s+(\d+)", h)
    if m:
        return [int(m.group(1))]
    m = re.fullmatch(r"(?i)pages\s+(\d+)\s*[–-]\s*(\d+)", h)
    if m:
        return list(range(int(m.group(1)), int(m.group(2)) + 1))
    return None


def parse_reading(pid):
    """Read readings/<P>.md into {title, meta, chapters:[{n, title, pages_spec, checks, sourced, intro, blocks}]}."""
    path = READINGS_DIR / f"{pid}.md"
    text = path.read_text(encoding="utf-8")
    title = re.search(r"^# (.+)$", text, re.M)
    meta_m = re.search(r"<!--\s*reading:(.*?)-->", text, re.S)
    meta = {}
    if meta_m:
        for part in ("reading:" + meta_m.group(1)).split("|"):
            if ":" in part:
                k, v = part.split(":", 1)
                meta[k.strip()] = v.strip()
    chapters = []
    for n, block in enumerate(re.split(r"^## ", text, flags=re.M)[1:], 1):
        head, _, body = block.partition("\n")
        pages = re.search(r"<!--\s*pages:\s*(.*?)\s*-->", body)
        checks = [{"q": q.strip(), "a": a.strip()}
                  for q, a in re.findall(r"<!--\s*check:\s*(.*?)\s*\|\s*(.*?)\s*-->", body, re.S)]
        sourced = {t.strip().lower(): w.strip()
                   for t, w in re.findall(r"<!--\s*sourced:\s*(.*?)\s*\|\s*(.*?)\s*-->", body)}
        pieces = HEAD_RE.split(body)
        intro = pieces[0]
        blocks = []
        for i in range(1, len(pieces), 2):
            raw = pieces[i + 1]
            kind = re.search(r"<!--\s*kind:\s*(\w+)\s*-->", raw)
            prose = re.sub(r"<!--.*?-->", "", raw, flags=re.S)
            prose = re.sub(r"\s+", " ", prose).strip()
            blocks.append({"heading": pieces[i].strip(), "labels": heading_labels(pieces[i]),
                           "kind": kind.group(1).lower() if kind else None, "prose": prose})
        intro_prose = re.sub(r"<!--.*?-->", "", intro, flags=re.S)
        paras = [re.sub(r"\s+", " ", p).strip() for p in re.split(r"\n\s*\n", intro_prose)]
        chapters.append({"n": n, "title": re.sub(r"^\d+\.\s*", "", head.strip()), "head": head.strip(),
                         "pages_spec": pages.group(1) if pages else None, "checks": checks,
                         "sourced": sourced, "intro": [p for p in paras if p], "blocks": blocks})
    return {"pid": pid, "path": path, "title": title.group(1).strip() if title else "", "meta": meta,
            "chapters": chapters, "text": text}


def audio_lecture(pid):
    """The reading in the data shape build_audio.py writes for lectures, plus page labels.

    Each page summary is one paragraph whose label ('Page 431', 'Pages 442–444', 'Cover')
    the site shows as a subheading and the voice reads first."""
    rd = parse_reading(pid)
    meta = paper_meta(pid)
    chapters = []
    for ch in rd["chapters"]:
        paras, labels, spoken = [], [], []
        for p in ch["intro"]:
            paras.append(p)
            labels.append(None)
            spoken.append(p)
        for b in ch["blocks"]:
            paras.append(b["prose"])
            labels.append(b["heading"])
            spoken.append(f"{b['heading']}. {b['prose']}")
        pages = label_list(ch["pages_spec"]) if ch["pages_spec"] and ch["pages_spec"].lower() != "all" else []
        chapters.append({"n": ch["n"], "title": ch["title"], "slides": [], "readings": "",
                         "pages": range_text(pages) if pages else "the whole paper",
                         "paragraphs": paras, "labels": labels, "spoken": spoken, "checks": ch["checks"]})
    return {"id": pid, "kind": "reading", "title": rd["title"], "session": meta["cite"],
            "lecturer": meta["authors"], "deck": meta["source"], "authors": meta["authors"],
            "year": meta["year"], "source": meta["source"], "lectures": meta["lectures"], "chapters": chapters}


def load_pages_json(pid):
    f = PAGES_ROOT / pid / "pages.json"
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else None
