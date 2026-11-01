"""Assemble the INN514 cheatsheet: the Markdown master, the print HTML and the PDF.

    C:/Python313/python.exe workspace/lecture-audio/cheatsheet/scripts/build_cheatsheet.py

Reads front/EXAM_DAY.md, themes/TH1..TH8.md, cards/*.md in course order and back/GLOSSARY.md +
back/SOURCES.md; writes INN514_CHEATSHEET.md, print/INN514_CHEATSHEET.html and
print/INN514_CHEATSHEET.pdf, and renders every page to workspace/cheatsheet_previews/.
"""
import pathlib
import re
import subprocess
import sys

import fitz
import markdown

from cheat_lib import CS, ORDER, PREVIEWS, words

TITLE = "# INN514 Cheatsheet: Innovation systems and sustainable transformation"
HOW_TO_USE = (
    "A revision sheet for INN514, Innovation systems and sustainable transformation, built from the "
    "17 course papers and the class slides. The exam allows no aids, and answers can be tested for "
    "plagiarism, so use it to learn concepts, sources and structures, then write in your own words. "
    "Every line names its source: a paper and its printed page, or a class and its slide. Lines marked "
    "\"ours\" or \"our reading\" are study aids, not findings. Norwegian terms in brackets come from the "
    "slides or the exam papers where possible; the glossary says where. Paper 2 is marked as not for "
    "quotation, so it is only paraphrased."
)

CSS = """
@page { size: A4; margin: 10mm 10mm 12mm; }
body { font: 8.5pt/1.12 Calibri, "Segoe UI", Arial, sans-serif; color: #111; background: #fff; }
main { column-count: 2; column-gap: 6mm; column-rule: 0.3pt solid #bbb; }
h1.part { column-span: all; break-before: page; font-size: 13pt; color: #7a2e0e; margin: 0 0 4pt; }
section.theme { break-inside: avoid; border-top: 0.6pt solid #7a2e0e; padding-top: 0.5pt; margin-bottom: 1.5pt; }
section.card { margin-bottom: 2pt; }
.cardhead { break-inside: avoid; }
h3 { font-size: 9.5pt; margin: 0; line-height: 1.05; } h4 { font-size: 7.9pt; color: #7a2e0e; margin: 0.5pt 0 0; line-height: 1; }
p { margin: 0 0 1pt; }
ul, ol { margin: 0 0 1pt 12pt; padding: 0; } li { margin: 0 0 0.5pt; }
.wide { column-span: all; margin: 4pt 0; }
table { border-collapse: collapse; width: 100%; font-size: 7.8pt; }
th { background: #f1ece4; } th, td { border: 0.3pt solid #bbb; padding: 1.5pt 3pt; vertical-align: top; text-align: left; }
"""


def demote(text):
    """'#' -> '###' and '##' -> '####', drop whole-line HTML comments, and put a blank line
    before a list that follows a paragraph, so steps render as a list (4.7, 4.2)."""
    out = []
    list_item = re.compile(r"^(?:\d+[.)]|[-*+]) ")
    for line in text.splitlines():
        if re.fullmatch(r"\s*<!--.*?-->\s*", line):
            continue
        line = re.sub(r"^# ", "### ", line)
        line = re.sub(r"^## ", "#### ", line)
        if list_item.match(line) and out and out[-1].strip() \
                and not list_item.match(out[-1]) and not out[-1].startswith("#"):
            out.append("")
        out.append(line)
    return "\n".join(out).strip()


def part_files():
    parts = {
        "1": ("Exam day", "front", [CS / "front" / "EXAM_DAY.md"]),
        "2": ("Themes", "theme", [CS / "themes" / f"TH{i}.md" for i in range(1, 9)]),
        "3": ("Paper cards", "card", [CS / "cards" / f"{pid}.md" for pid in ORDER]),
        "4": ("Glossary and sources", "back", [CS / "back" / "GLOSSARY.md", CS / "back" / "SOURCES.md"]),
    }
    plans = CS / "answers" / "PLANS.md"
    if plans.exists():
        parts["5"] = ("Answer plans", "back", [plans])
    return parts


def first_heading(path):
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return path.stem


def build_markdown():
    parts = part_files()
    lines = [TITLE, "", HOW_TO_USE, "", "## Contents", ""]
    for n, (name, _, files) in parts.items():
        lines.append(f"- Part {n}: {name}")
        for f in files:
            lines.append(f"  - {first_heading(f)}")
    lines.append("")
    for n, (name, _, files) in parts.items():
        lines.append(f"## Part {n}: {name}")
        lines.append("")
        for f in files:
            lines.append(demote(f.read_text(encoding="utf-8")))
            lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def wrap_wide_tables(html):
    """A table with four or more columns spans both columns (7.5)."""
    def fix(m):
        table = m.group(0)
        head = re.search(r"<tr>.*?</tr>", table, re.S)
        cols = len(re.findall(r"<t[hd][ >]", head.group(0))) if head else 0
        long_cell = max((len(re.sub(r"<[^>]+>", "", c).split()) for c in re.findall(r"<td>(.*?)</td>", table, re.S)),
                        default=0)
        return f'<div class="wide">{table}</div>' if cols >= 4 or long_cell > 12 else table
    return re.sub(r"<table>.*?</table>", fix, html, flags=re.S)


def keep_card_head(html):
    """Keep a card's title and its first section together, so a card that flows across a
    column never starts with an orphaned heading."""
    m = re.search(r"<h4>", html)
    if not m:
        return html
    end = re.search(r"</p>|</ul>|</ol>", html[m.start():])
    if not end:
        return html
    cut = m.start() + end.end()
    return f'<div class="cardhead">{html[:cut]}</div>' + html[cut:]


def build_html(md_text):
    body_parts = []
    for n, (name, cls, files) in part_files().items():
        body_parts.append(f'<h1 class="part">Part {n}: {name}</h1>')
        for f in files:
            html = markdown.markdown(demote(f.read_text(encoding="utf-8")), extensions=["tables", "sane_lists"])
            html = wrap_wide_tables(html)
            if cls == "card":
                html = keep_card_head(html)
            body_parts.append(f'<section class="{cls}">{html}</section>')
    return (
        "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        f"<title>INN514 Cheatsheet</title>\n<style>{CSS}</style>\n</head>\n<body>\n<main>\n"
        + "\n".join(body_parts)
        + "\n</main>\n</body>\n</html>\n"
    )


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    for folder in ("print",):
        (CS / folder).mkdir(exist_ok=True)
    PREVIEWS.mkdir(parents=True, exist_ok=True)

    md_path = CS / "INN514_CHEATSHEET.md"
    md_text = build_markdown()
    md_path.write_text(md_text, encoding="utf-8")

    html = build_html(md_text)
    html_path = CS / "print" / "INN514_CHEATSHEET.html"
    html_path.write_text(html, encoding="utf-8")

    pdf_path = CS / "print" / "INN514_CHEATSHEET.pdf"
    subprocess.run([r"C:\Program Files\Google\Chrome\Application\chrome.exe", "--headless=new",
                    "--disable-gpu", "--no-pdf-header-footer",
                    f"--user-data-dir={PREVIEWS / '.chrome-profile'}",
                    f"--print-to-pdf={pdf_path}", html_path.resolve().as_uri()],
                   check=True, timeout=120)

    doc = fitz.open(pdf_path)
    pages = doc.page_count
    for i in range(pages):
        pix = doc[i].get_pixmap(dpi=110)
        pix.save(str(PREVIEWS / f"page-{i + 1:02d}.png"))
    doc.close()

    size_kb = pdf_path.stat().st_size // 1024
    print(f"BUILT INN514_CHEATSHEET.md ({words(md_text)} words), print/INN514_CHEATSHEET.html, "
          f"print/INN514_CHEATSHEET.pdf ({pages} pages, {size_kb} KB)")
    if pages > 13:
        print(f"FAIL: {pages} pages is more than the 13 allowed")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
