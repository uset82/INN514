"""Check one cheatsheet file, the whole set, or the pre-push scan (plan 6.2 and 9.4).

    check_cheatsheet.py cards/P01.md          one file (relative to cheatsheet/, or absolute)
    check_cheatsheet.py --all [--partial]     every file; --partial skips the "missing file" failures
    check_cheatsheet.py --scan                the pre-push scan (section 9)

One line per file: 'PASS cards/P01.md (287 words)' or 'FAIL cards/P01.md', with indented
'- reason' lines and '~ warning' lines. The last line is 'ALL CHEATSHEET CHECKS PASSED'
(exit 0) or 'CHEATSHEET CHECKS FAILED: N problems' (exit 1). The scan prints 'SCAN CLEAN'
(exit 0) or 'SCAN FOUND N problems' (exit 1).
"""
import pathlib
import re
import sys

import hashlib

from cheat_lib import (CARD_CLASS, CARD_THEMES, CITES, CITE_TO_PID, CLASSES, CS, EXAM, G, LA, MISSPELT,
                       ORDER, READINGS, REVISION, SECTIONS, SURNAME_PAPERS, THEMES, citable,
                       class_slides, copied, numbers, page_range, pages, qnorm, quoted_on, quotes_in,
                       words)
from check_sources import names_in, numbers_in

CITE = re.compile(r"\(([A-ZÆØÅ][^()\d]*?) (\d{4}), (p|pp|PDF p)\. (\d[\d–, -]*)\)")
OWN = re.compile(r"\((p|pp|PDF p)\. (\d[\d–, -]*)\)")             # cards: the card's own paper
SLIDE = re.compile(r"\[(?:Class (\d)|(Bonus)), slides? (\d[\d–, -]*)\]")
EXAMID = re.compile(r"\b(Dec 2024|Jun 2025) Q([1-3])\b")
PRONOUN = re.compile(r"\b(he|she|him|her|his|hers|himself|herself)\b", re.I)
BRAND = re.compile(r"\b(Claude|Anthropic|ZCode|GLM)\b")
STRONG = re.compile(r"\b(prove[sd]?|proven|clearly shows?|always|never|obviously|undoubtedly|definitely)\b", re.I)

# '(p. 433, Figure 2)' is the model line of 4.2; the figure part is not part of the cite.
FIG_TAIL = re.compile(r",\s*(?:Figure|Fig\.|Table)\s+\d+")
QUOTE_CHARS = "\"“”«»"
ITEM = re.compile(r"^((?:- \[[ x]\])|[-*+]|\d+[.)])\s+(.*)$")
SEP_CELL = re.compile(r":?-{2,}:?")

NAME_RE = {s: re.compile(rf"\b{re.escape(s)}\b(?:et al\.|[^.;()\d]){{0,40}}?\(?\b(\d{{4}})\b\)?")
           for s in SURNAME_PAPERS}


def rebuilt(match_text):
    """'Garud and Karnøe (2003)' -> 'Garud & Karnøe 2003'."""
    text = re.sub(r"[()]", "", match_text).replace(" and ", " & ")
    return re.sub(r"\s+", " ", text).strip()


# ------------------------------------------------------------------ small helpers

def split_sections(text):
    """[(heading, body)] for every '## ' heading, in order."""
    parts = re.split(r"(?m)^## (.*)$", text)
    return [(parts[i].strip(), parts[i + 1]) for i in range(1, len(parts), 2)]


def sec(secs, name):
    return secs.get(name, "")


def items(body):
    """[(marker, text)]: one per list item or paragraph; wrapped lines are joined."""
    out, cur = [], None
    for line in body.splitlines():
        if not line.strip():
            if cur is not None:
                out.append(cur)
                cur = None
            continue
        m = ITEM.match(line.rstrip())
        if m:
            if cur is not None:
                out.append(cur)
            cur = [m.group(1), m.group(2)]
        elif cur is not None:
            cur[1] = (cur[1] + " " + line.strip()).strip()
        else:
            out.append(["", line.strip()])
    if cur is not None:
        out.append(cur)
    return [(m, t) for m, t in out]


def bullets(body):
    return [t for m, t in items(body) if m in ("-", "*", "+", "- [ ]", "- [x]")]


def steps(body):
    return [t for m, t in items(body) if re.fullmatch(r"\d+[.)]", m)]


def sentences(text):
    return [s for s in re.split(r"(?<=[.!?])\s+(?=[A-ZÆØÅ\"“])", text.strip()) if s.strip()]


def table_rows(body):
    rows = []
    for line in body.splitlines():
        s = line.strip()
        if s.startswith("|") and s.endswith("|") and len(s) > 2:
            rows.append([c.strip() for c in s.strip("|").split("|")])
    return rows


def data_rows(body):
    """Table rows without the separator and the header line."""
    rows = [r for r in table_rows(body) if not all(SEP_CELL.fullmatch(c or "") for c in r)]
    return rows[1:]


def refs(line, own=None):
    """[{pid, pages, kind, raw}] for every known course cite, and the own-page cites of a card."""
    out = []
    flat = FIG_TAIL.sub("", line)
    for m in CITE.finditer(flat):
        form = re.sub(r"\s+", " ", f"{m.group(1).strip()} {m.group(2)}").replace(" and ", " & ")
        out.append({"pid": CITE_TO_PID.get(form), "pages": numbers(m.group(4)),
                    "kind": m.group(3), "raw": m.group(0)})
    if own:
        for m in OWN.finditer(flat):
            out.append({"pid": own, "pages": numbers(m.group(2)), "kind": m.group(1), "raw": m.group(0)})
    return out


def has_source(line, own=None):
    if CITE.search(line) or SLIDE.search(line):
        return True
    return bool(own) and bool(OWN.search(FIG_TAIL.sub("", line)))


def has_mention(line):
    """A narrative mention such as 'Hekkert et al. (2007)' is a source in a template sentence (4.1)."""
    for rx in NAME_RE.values():
        for m in rx.finditer(line):
            if rebuilt(m.group(0)) in CITE_TO_PID:
                return True
    return False


def title_index(lines):
    """The italic title line under the '#' line, or None."""
    for i, line in enumerate(lines):
        if line.startswith("*") and not line.startswith("**") and not line.startswith("* "):
            return i
    return None


# ------------------------------------------------------------------ checks shared by all kinds

def check_cites(text, own, fails):
    for m in CITE.finditer(text):
        form = re.sub(r"\s+", " ", f"{m.group(1).strip()} {m.group(2)}").replace(" and ", " & ")
        pid = CITE_TO_PID.get(form)
        if not pid:
            want = []
            for surname, pids in SURNAME_PAPERS.items():
                if re.search(rf"\b{re.escape(surname)}", form):
                    want += [CITES[p] for p in pids]
            hint = " or ".join(dict.fromkeys(want)) if want else "no course paper has that author"
            fails.append(f"cite: ({form}, ...) is not a course cite; write {hint}")
            continue
        kind = m.group(3)
        if pid == "P02" and kind != "PDF p":
            fails.append("cite: Paper 2 is always cited as 'PDF p. N'")
        if pid != "P02" and kind == "PDF p":
            fails.append(f"cite: 'PDF p.' is only for Paper 2, not {CITES[pid]}")
        for n in numbers(m.group(4)):
            if not citable(pid, n):
                fails.append(f"cite: page {n} of {CITES[pid]} is not a citable page")
    if own:
        for m in OWN.finditer(FIG_TAIL.sub("", text)):
            for n in numbers(m.group(2)):
                if not citable(own, n):
                    fails.append(f"cite: page {n} of {CITES[own]} is not a citable page")
    else:
        for m in OWN.finditer(FIG_TAIL.sub("", text)):
            fails.append(f"cite: '{m.group(0)}' has no paper; write (Author Year, p. N)")


def check_names(text, fails):
    for surname, rx in NAME_RE.items():
        for m in rx.finditer(text):
            got = rebuilt(m.group(0))
            if got not in CITE_TO_PID:
                want = " or ".join(CITES[p] for p in SURNAME_PAPERS[surname])
                fails.append(f"names: '{m.group(0)}' must be '{want}'")
    for wrong, right in MISSPELT.items():
        if re.search(rf"\b{re.escape(wrong)}\b", text):
            fails.append(f"names: '{wrong}' must be spelled '{right}'")
    for _ in re.finditer(r"(?<!Demattos )\bGuimarães\b(?:et al\.|[^.;()\d]){0,40}?\(?\b\d{4}\b", text):
        fails.append("names: a bare 'Guimarães' is not a cite; write 'Demattos Guimarães et al. 2024'")


def check_slides(text, fails):
    for m in SLIDE.finditer(text):
        cid = m.group(1) or m.group(2)
        if cid not in CLASSES:
            fails.append(f"slides: there is no Class {cid}")
            continue
        deck = CLASSES[cid][1]
        reviewed = class_slides(cid)
        for n in numbers(m.group(3)):
            if n > deck:
                fails.append(f"slides: Class {cid} has {deck} slides, so slide {n} does not exist")
            elif n not in reviewed:
                fails.append(f"slides: slide {n} of Class {cid} is not in the reviewed class file")


def check_quotes(text, kind, key, t_idx, fails):
    lines = text.splitlines()
    if kind == "card" and key == "P02":
        for i, line in enumerate(lines):
            if i != t_idx and any(ch in line for ch in QUOTE_CHARS):
                fails.append(f"quotes: line {i + 1} has a quotation mark, and Paper 2 is not for quotation")
        return
    for i, line in enumerate(lines):
        found = quotes_in(line)
        has_q = any(ch in line for ch in QUOTE_CHARS)
        got = refs(line, key if kind == "card" else None)
        pids = {r["pid"] for r in got if r["pid"]}
        if "P02" in pids and has_q:
            fails.append(f"quotes: line {i + 1} cites Paper 2, which is not for quotation")
            continue
        for q in found:
            n = len(q.split())
            if n <= 2:
                continue
            if n > 20:
                fails.append(f"quotes: line {i + 1} quotes {n} words (max 20)")
            if not got:
                if SLIDE.search(line):
                    fails.append(f"quotes: line {i + 1} quotes '{q[:40]}'; a slide alone does not cite the page")
                else:
                    fails.append(f"quotes: line {i + 1} quotes '{q[:40]}' with no paper or slide on the line")
                continue
            if pids & {"P02", "P05"}:
                fails.append(f"quotes: line {i + 1} quotes Paper 2 or Paper 5, which are not for quotation")
                continue
            ok = False
            for r in got:
                if not r["pid"]:
                    continue
                for p in r["pages"]:
                    for cand in (p - 1, p, p + 1):
                        if cand in pages(r["pid"]) and quoted_on(q, pages(r["pid"])[cand][1]):
                            ok = True
            if not ok:
                fails.append(f"quotes: line {i + 1} quotation '{q[:40]}' is not on the cited page")


def check_copy(text, kind, key, t_idx, fails):
    for i, line in enumerate(text.splitlines()):
        if not line.strip():
            continue
        own = key if kind == "card" else None
        pids = [r["pid"] for r in refs(line, own) if r["pid"]]
        if kind == "card" and i != t_idx:
            pids.append(key)
        for pid in dict.fromkeys(pids):
            runs = copied(line, pid)
            if runs:
                fails.append(f"copy: line {i + 1} copies words from {CITES[pid]}: '{runs[0][:60]}'")


def check_exam_ids(text, fails):
    seen = set()
    for m in EXAMID.finditer(text):
        eid = f"{m.group(1)} Q{m.group(2)}"
        if eid not in EXAM and eid not in seen:
            seen.add(eid)
            fails.append(f"exam: '{eid}' is not one of the six past questions")


def check_people(text, fails):
    for found in sorted({m.group(0).lower() for m in PRONOUN.finditer(text)}):
        fails.append(f"people: '{found}' is a pronoun; name the author")
    for found in sorted({m.group(0) for m in BRAND.finditer(text)}):
        fails.append(f"people: '{found}' must not appear")


def check_hedges(text, warns):
    hits = {}
    for m in STRONG.finditer(text):
        hits.setdefault(m.group(0).lower(), 0)
        hits[m.group(0).lower()] += 1
    for word, n in hits.items():
        warns.append(f"hedges: strong word '{word}' ({n}x) for the reviewer")


# ------------------------------------------------------------------ the first line and the comment line

def check_title(first, want, fails):
    if first.strip() != want:
        fails.append(f"title: the first line should be '{want}'")


def check_header(text, hdr, fails):
    if hdr not in text:
        fails.append(f"header: expected the line '{hdr}'")


def check_section_list(got, want, fails):
    if got != want:
        fails.append(f"sections: expected {want}, found {got}")


# ------------------------------------------------------------------ card

def check_card(key, text, fails, warns):
    lines = text.splitlines()
    check_title(next((x for x in lines if x.strip()), ""), 
                f"# Paper {int(key[1:])}: {READINGS[key][0]} ({READINGS[key][1]})", fails)
    check_header(text, f"<!-- card: {key} | cite: {CITES[key]} | pages: {page_range(key)} | "
                       f"class: {CARD_CLASS[key]} | themes: {', '.join(CARD_THEMES[key])} -->", fails)
    secs = {h: b for h, b in split_sections(text)}
    check_section_list([h for h, _ in split_sections(text)], SECTIONS["card"], fails)

    n = words(text)
    if n > 330:
        fails.append(f"length: {n} words (max 330)")
    elif not 260 <= n <= 300:
        warns.append(f"length: {n} words (aim for 260-300)")

    body = sec(secs, "In one line")
    line = " ".join(x.strip() for x in body.splitlines() if x.strip())
    if not line:
        fails.append("length: 'In one line' is empty")
    elif words(line) > 30:
        fails.append(f"length: 'In one line' has {words(line)} words (max 30)")

    bl = bullets(sec(secs, "Key concepts"))
    if not 4 <= len(bl) <= 5:
        fails.append(f"counts: Key concepts has {len(bl)} bullets (need 4-5)")
    for t in bl:
        if words(t) > 34:
            fails.append(f"length: Key concept of {words(t)} words (max 34): '{t[:50]}'")
        if not has_source(t, key):
            fails.append(f"sources: a Key concept needs a page: '{t[:50]}'")

    body = sec(secs, "Model")
    if "No model in this paper." not in body:
        groups = []
        for m, t in items(body):
            if m == "":
                groups.append([t, []])
            elif re.fullmatch(r"\d+[.)]", m) and groups:
                groups[-1][1].append(t)
            elif re.fullmatch(r"\d+[.)]", m):
                groups.append(["", [t]])
        if not groups:
            fails.append("counts: Model has neither 'No model in this paper.' nor a model")
        for name, sts in groups:
            if not name:
                fails.append("sources: a model needs a name line with its source")
            elif not has_source(name, key):
                fails.append(f"sources: the model line needs a page: '{name[:50]}'")
            if not 3 <= len(sts) <= 6:
                fails.append(f"counts: a model has {len(sts)} steps (need 3-6)")
            for t in sts:
                if words(t) > 14:
                    fails.append(f"length: model step of {words(t)} words (max 14): '{t[:50]}'")

    for name, lo, hi, cap in (("Findings", 2, 3, 28), ("Norway link", 1, 2, 28),
                              ("Exam use", 1, 2, 22), ("Limits", 1, 2, 28)):
        bl = bullets(sec(secs, name))
        if not lo <= len(bl) <= hi:
            fails.append(f"counts: {name} has {len(bl)} bullets (need {lo}-{hi})")
        for t in bl:
            if words(t) > cap:
                fails.append(f"length: {name} bullet of {words(t)} words (max {cap}): '{t[:50]}'")
            if name == "Exam use":
                continue                      # an exam link needs no page (4.2)
            if name == "Norway link" and t.strip() == "No Norwegian case in this paper.":
                continue
            if not has_source(t, key):
                fails.append(f"sources: a {name} bullet needs a page: '{t[:50]}'")

    for t in bullets(sec(secs, "Exam use")):
        if not (re.match(r"(Dec 2024|Jun 2025) Q[1-3]:", t) or t.startswith("Practice:")):
            fails.append(f"exam: an Exam use bullet starts with an exam id or 'Practice:': '{t[:40]}'")
        if not t.rstrip().endswith("(our reading)"):
            fails.append(f"exam: an Exam use bullet ends with '(our reading)': '{t[:40]}'")

    body = sec(secs, "Hook")
    line = " ".join(x.strip() for x in body.splitlines() if x.strip())
    if not line:
        fails.append("length: 'Hook' is empty")
    elif words(line) > 12:
        fails.append(f"length: Hook has {words(line)} words (max 12)")


# ------------------------------------------------------------------ theme

TERM = re.compile(r"\*\*[^*]+\*\* \(\*[^*]+\*\):")


def check_theme(key, text, fails, warns):
    lines = text.splitlines()
    check_title(next((x for x in lines if x.strip()), ""), f"# Theme {int(key[2:])}: {THEMES[key][0]}", fails)
    check_header(text, f"<!-- theme: {key} | papers: {', '.join(THEMES[key][1])} | "
                       f"classes: {', '.join(THEMES[key][2])} -->", fails)
    secs = {h: b for h, b in split_sections(text)}
    check_section_list([h for h, _ in split_sections(text)], SECTIONS["theme"], fails)

    n = words(text)
    if n > 580:
        fails.append(f"length: {n} words (max 580)")
    elif not 480 <= n <= 560:
        warns.append(f"length: {n} words (aim for about 520)")

    bl = bullets(sec(secs, "Core definitions"))
    if not 4 <= len(bl) <= 5:
        fails.append(f"counts: Core definitions has {len(bl)} bullets (need 4-5)")
    for t in bl:
        if not TERM.match(t):
            fails.append(f"terms: a definition is '**term** (*norsk*): ...': '{t[:50]}'")
        if words(t) > 34:
            fails.append(f"length: definition of {words(t)} words (max 34): '{t[:50]}'")
        if not has_source(t):
            fails.append(f"sources: a definition needs a source: '{t[:50]}'")

    body = sec(secs, "Key models and figures")
    groups = []
    for m, t in items(body):
        if m == "":
            groups.append([t, []])
        elif re.fullmatch(r"\d+[.)]", m) and groups:
            groups[-1][1].append(t)
        elif re.fullmatch(r"\d+[.)]", m):
            groups.append(["", [t]])
    if not 1 <= len(groups) <= 2:
        fails.append(f"counts: Key models and figures has {len(groups)} models (need 1-2)")
    for name, sts in groups:
        if not name or not name.endswith(":"):
            fails.append(f"counts: a model starts with a name line ending ':': '{name[:50]}'")
        elif not has_source(name):
            fails.append(f"sources: the model line needs a source: '{name[:50]}'")
        if not 3 <= len(sts) <= 7:
            fails.append(f"counts: a model has {len(sts)} steps (need 3-7)")
        for t in sts:
            if words(t) > 14:
                fails.append(f"length: model step of {words(t)} words (max 14): '{t[:50]}'")

    bl = bullets(sec(secs, "Exam angles"))
    if not 3 <= len(bl) <= 4:
        fails.append(f"counts: Exam angles has {len(bl)} bullets (need 3-4)")
    for t in bl:
        if words(t) > 28:
            fails.append(f"length: Exam angle of {words(t)} words (max 28): '{t[:50]}'")
        if re.match(r"(Dec 2024|Jun 2025) Q[1-3]:", t):
            continue
        if t.startswith("Class 9 example:"):
            if not re.search(r"\[Class 9, slide (37|38)\]", t):
                fails.append(f"exam: a Class 9 example cites [Class 9, slide 37] or 38: '{t[:50]}'")
            continue
        if t.startswith("Practice:"):
            if not t.rstrip().endswith("(ours)"):
                fails.append(f"exam: a Practice angle ends with '(ours)': '{t[:50]}'")
            continue
        fails.append(f"exam: an Exam angle starts with an exam id, 'Class 9 example:' or 'Practice:': '{t[:40]}'")

    body = sec(secs, "Norway examples")
    bl = bullets(body)
    one_line = "Only one Norwegian example is verified in the course material." in body
    if not 2 <= len(bl) <= 3:
        fails.append(f"counts: Norway examples has {len(bl)} bullets (need 2-3)")
    named = [t for t in bl if re.match(r"\*\*[^*]+\*\*:", t) and has_source(t)]
    if len(named) < (1 if one_line else 2):
        fails.append(f"norway: {len(named)} named examples with a source (need {1 if one_line else 2})")
    for t in bl:
        if words(t) > 36:
            fails.append(f"length: Norway example of {words(t)} words (max 36): '{t[:50]}'")
        if t.startswith("Illustrative example (ours):"):
            if re.search(r"\d", t):
                fails.append(f"norway: an illustrative example has no digits: '{t[:50]}'")
            continue
        if t.strip() == "Only one Norwegian example is verified in the course material.":
            continue
        if not has_source(t):
            fails.append(f"sources: a Norway example needs a source: '{t[:50]}'")

    body = sec(secs, "Answer template")
    q = re.search(r"<!--\s*question:\s*(.*?)\s*-->", body)
    if not q or q.group(1) != THEMES[key][3]:
        fails.append(f"template: expected '<!-- question: {THEMES[key][3]} -->'")
    drafting = "Drafting aid (ours): learn the moves, then write your own words."
    if drafting not in body:
        fails.append(f"template: missing the line '{drafting}'")
    want = ["Intro", "Theory", "Example", "Mini-conclusion"]
    bl = bullets(body)
    got = []
    for t in bl:
        m = re.match(r"\*\*(Intro|Theory|Example|Mini-conclusion):\*\*", t)
        got.append(m.group(1) if m else None)
    if got != want:
        fails.append(f"template: the four bullets are {want}, found {got}")
    labels = dict(zip(got, bl))
    for name in ("Theory", "Example"):
        if name in labels and not (has_source(labels[name]) or has_mention(labels[name])):
            fails.append(f"template: the {name} bullet needs a source")
    total = sum(words(t) for t in bl)
    if not 110 <= total <= 170:
        fails.append(f"template: the four bullets have {total} words (need 110-170)")
    for name, lo, hi in (("Intro", 1, 2), ("Theory", 2, 3), ("Example", 2, 2), ("Mini-conclusion", 1, 1)):
        if name in labels:
            k = len(sentences(labels[name].split(":**", 1)[1].strip()))
            if not lo <= k <= hi:
                warns.append(f"template: {name} has {k} sentences (aim {lo}-{hi})")

    body = sec(secs, "Links")
    if "Cards:" not in body or "Themes:" not in body:
        fails.append("sections: Links needs a 'Cards:' list and a 'Themes:' list")


# ------------------------------------------------------------------ front

def check_front(key, text, fails, warns):
    lines = text.splitlines()
    check_title(next((x for x in lines if x.strip()), ""), "# Exam day: what to know by heart", fails)
    check_header(text, "<!-- front: exam-day -->", fails)
    secs = {h: b for h, b in split_sections(text)}
    check_section_list([h for h, _ in split_sections(text)], SECTIONS["front"], fails)

    n = words(text)
    if n > 1100:
        fails.append(f"length: {n} words (max 1,100)")

    bl = bullets(sec(secs, "The exam"))
    if not 3 <= len(bl) <= 5:
        fails.append(f"counts: The exam has {len(bl)} bullets (need 3-5)")

    body = sec(secs, "Past exam questions")
    rows = data_rows(body)
    if len(rows) != 6:
        fails.append(f"counts: Past exam questions has {len(rows)} rows (need 6)")
    for r in rows:
        if len(r) < 2:
            fails.append(f"exam: a past-question row needs three cells: {r}")
            continue
        m = re.match(r"(Dec 2024|Jun 2025) Q([1-3])$", r[0])
        if not m:
            fails.append(f"exam: '{r[0]}' is not one of the six past questions")
            continue
        eid = f"{m.group(1)} Q{m.group(2)}"
        if qnorm(r[1]) != qnorm(EXAM[eid]):
            fails.append(f"exam: the question of {eid} is not word for word from 3.4")

    body = sec(secs, "Compare the systems")
    rows = data_rows(body)
    want = ["Focus", "Boundary", "Key actors", "What drives change", "Norway example", "Key readings"]
    if [r[0] for r in rows] != want:
        fails.append(f"counts: Compare the systems needs the rows {want}")
    for r in rows:
        for cell in r[1:]:
            if words(cell) > 12:
                fails.append(f"length: the cell of {words(cell)} words (max 12): '{cell[:40]}'")
    if not re.search(r"\[Class 9, slide 25\]", body):
        warns.append("sources: the line under the comparison table should credit [Class 9, slide 25]")

    body = sec(secs, "Must-know definitions")
    sts = steps(body)
    if len(sts) != 12:
        fails.append(f"counts: Must-know definitions has {len(sts)} (need 12)")
    for t in sts:
        if words(t) > 18:
            fails.append(f"length: definition of {words(t)} words (max 18): '{t[:50]}'")
        if not has_source(t):
            fails.append(f"sources: a must-know definition needs a source: '{t[:50]}'")

    body = sec(secs, "How to answer")
    bl = bullets(body)
    for prefix in ("Question 1", "Question 2 or 3", "What examiners look for"):
        if not any(t.startswith(prefix) for t in bl):
            warns.append(f"sections: 'How to answer' has no bullet starting '{prefix}'")
    boxes = re.findall(r"- \[[ x]\]", body)
    if len(boxes) != 6:
        warns.append(f"counts: 'What examiners look for' has {len(boxes)} '- [ ]' lines (the plan says six)")

    body = sec(secs, "Promote or inhibit")
    bl = bullets(body)
    pro = [t for t in bl if t.startswith("Promotes")]
    inh = [t for t in bl if t.startswith("Inhibits")]
    if not bl or len(pro) != len(inh) or len(pro) + len(inh) != len(bl):
        fails.append("counts: 'Promotes' and 'Inhibits' bullets come in pairs")
    total = sum(words(t) for t in bl)
    if total > 150:
        fails.append(f"length: Promote or inhibit has {total} words (max 150)")
    for t in bl:
        if not has_source(t):
            fails.append(f"sources: a Promote or inhibit bullet needs a source: '{t[:50]}'")


# ------------------------------------------------------------------ glossary and sources

def check_glossary(key, text, fails, warns):
    check_title(next((x for x in text.splitlines() if x.strip()), ""),
                "# Glossary: English and Norwegian terms", fails)
    secs = {h: b for h, b in split_sections(text)}
    check_section_list([h for h, _ in split_sections(text)], SECTIONS["glossary"], fails)
    n = words(text)
    if n > 450:
        fails.append(f"length: {n} words (max 450)")
    rows = data_rows(sec(secs, "Terms"))
    if not 30 <= len(rows) <= 40:
        fails.append(f"counts: the glossary has {len(rows)} rows (need 30-40)")
    for r in rows:
        if len(r) != 3:
            fails.append(f"counts: a glossary row needs three cells: {r}")
            continue
        third = r[2]
        if third in ("standard term", "exam paper, 4 December 2024", "exam paper, 13 June 2025"):
            continue
        m = SLIDE.fullmatch(third)
        if not m:
            fails.append(f"terms: the third cell is a class and slide, an exam paper or 'standard term': '{third}'")
            continue
        cid = m.group(1) or m.group(2)
        if cid not in CLASSES or numbers(m.group(3))[0] not in class_slides(cid):
            fails.append(f"slides: '{third}' is not a reviewed slide")


def check_sources_file(key, text, fails, warns):
    check_title(next((x for x in text.splitlines() if x.strip()), ""), "# Sources", fails)
    secs = {h: b for h, b in split_sections(text)}
    check_section_list([h for h, _ in split_sections(text)], SECTIONS["sources"], fails)
    n = words(text)
    if n > 550:
        fails.append(f"length: {n} words (max 550)")

    bl = bullets(sec(secs, "Readings"))
    if len(bl) != 17:
        fails.append(f"counts: Readings has {len(bl)} bullets (need 17)")
    for i, pid in enumerate(ORDER):
        want = f"{READINGS[pid][0]} ({READINGS[pid][1]})"
        if i >= len(bl):
            break
        if not bl[i].startswith(want):
            fails.append(f"counts: Readings bullet {i + 1} should start '{want}'")

    bl = bullets(sec(secs, "Classes"))
    if len(bl) != 8:
        fails.append(f"counts: Classes has {len(bl)} bullets (need 8)")
    ids = []
    for t in bl:
        m = re.match(r"(?:Class\s+)?(\d+|Bonus)\b", t)
        ids.append(m.group(1) if m else None)
    if sorted(x for x in ids if x) != sorted(["1", "2", "3", "4", "5", "6", "9", "Bonus"]):
        fails.append(f"counts: Classes should list 1, 2, 3, 4, 5, 6, 9 and Bonus, found {ids}")

    if len(bullets(sec(secs, "Exam papers"))) != 2:
        fails.append("counts: Exam papers needs the 4 December 2024 and 13 June 2025 papers")


# ------------------------------------------------------------------ entry points

KIND_OF = {"cards": "card", "themes": "theme", "front": "front", "back": "back"}


def identify(name):
    """(kind, key) from a path such as cards/P01.md."""
    p = pathlib.PurePosixPath(str(name).replace("\\", "/"))
    stem, parent = p.stem, p.parent.name.lower()
    if parent == "cards" or re.fullmatch(r"P\d\d", stem):
        return "card", stem.upper()
    if parent == "themes" or re.fullmatch(r"TH\d", stem):
        return "theme", stem.upper()
    if stem.upper() == "EXAM_DAY":
        return "front", "front"
    if stem.upper() == "GLOSSARY":
        return "glossary", "glossary"
    if stem.upper() == "SOURCES":
        return "sources", "sources"
    if parent == "listen" or re.fullmatch(r"R\d\d", stem):
        return "listen", stem.upper()
    return None, None


def check_text(kind, name, text, root=None, partial=False):
    """(fails, warns) for one file. root and partial are used by the Part V listen checks."""
    fails, warns = [], []
    _, key = identify(name)
    if kind == "card":
        if key not in CITES:
            return [f"card: '{key}' is not a course paper"], warns
        check_card(key, text, fails, warns)
    elif kind == "theme":
        if key not in THEMES:
            return [f"theme: '{key}' is not a course theme"], warns
        check_theme(key, text, fails, warns)
    elif kind == "front":
        check_front(key, text, fails, warns)
    elif kind == "glossary":
        check_glossary(key, text, fails, warns)
    elif kind == "sources":
        check_sources_file(key, text, fails, warns)
    elif kind == "listen":
        if key not in REVISION:
            return [f"listen: '{key}' is not a revision lesson"], warns
        check_listen(key, text, fails, warns, root or CS, partial)
        return fails, warns
    else:
        return [f"kind: no checks for '{kind}'"], warns

    own = key if kind == "card" else None
    check_cites(text, own, fails)
    check_names(text, fails)
    check_slides(text, fails)
    check_quotes(text, kind, key, title_index(text.splitlines()), fails)
    if kind in ("card", "theme", "front"):
        check_copy(text, kind, key, title_index(text.splitlines()), fails)
    check_exam_ids(text, fails)
    check_people(text, fails)
    check_hedges(text, warns)
    return fails, warns


def all_names():
    names = [f"cards/{pid}.md" for pid in ORDER]
    names += [f"themes/TH{i}.md" for i in range(1, 9)]
    names += ["front/EXAM_DAY.md", "back/GLOSSARY.md", "back/SOURCES.md"]
    return names


def complete(root, problems, partial=False):
    """--all: every file exists (not with --partial), and each card's themes match the themes."""
    root = pathlib.Path(root)
    if not partial:
        for name in all_names():
            if not (root / name).exists():
                problems.append((name, ["complete: the file does not exist"], []))
    for pid in ORDER:
        if not any(pid in THEMES[t][1] for t in THEMES):
            problems.append(("themes", [f"complete: {pid} is in no theme"], []))
    for pid in CARD_THEMES:
        f = root / "cards" / f"{pid}.md"
        if not f.exists():
            continue
        text = f.read_text(encoding="utf-8")
        m = re.search(r"<!--\s*card:.*?\|\s*themes:\s*(.*?)\s*-->", text)
        got = [x.strip() for x in m.group(1).split(",")] if m else []
        want = [t for t in THEMES if pid in THEMES[t][1]]
        if got != want:
            problems.append((f"cards/{pid}.md", [f"complete: the header themes are {got}, but {want} list it"], []))


def assembled(root, problems):
    f = pathlib.Path(root) / "INN514_CHEATSHEET.md"
    if not f.exists():
        return
    text = f.read_text(encoding="utf-8")
    parts = ["## Part 1: Exam day", "## Part 2: Themes", "## Part 3: Paper cards",
             "## Part 4: Glossary and sources"]
    pos, fails, warns = [], [], []
    for title in parts:
        if text.count(title) != 1:
            fails.append(f"assembled: '{title}' appears {text.count(title)} times (need once)")
        pos.append(text.find(title))
    if pos != sorted(pos):
        fails.append("assembled: the four parts are not in order")
    n = words(text)
    if n > 12000:
        fails.append(f"assembled: {n} words (max 12,000)")
    elif n > 11000:
        warns.append(f"assembled: {n} words (over the 11,000 aim)")
    if fails or warns:
        problems.append(("INN514_CHEATSHEET.md", fails, warns))


# ------------------------------------------------------------------ listening lessons (plan 6.4)

READINGS_LINE = re.compile(r"(?m)^\s*<!--\s*readings:\s*(.*?)\s*-->\s*$")
CHECK_LINE = re.compile(r"(?m)^\s*<!--\s*check:\s*(.*?)\s*\|\s*(.*?)\s*-->\s*$")
PAPER_PART = re.compile(r"^([A-ZÆØÅ][^,;]*? \d{4})(?:, (p|pp|PDF p)\. (\d[\d–, ]*))?$")
SLIDE_PART = re.compile(r"^(?:Class (\d)|(Bonus)), slides? (\d[\d–, ]*)$")
BAD_CHARS = ["*", "[", "]", "\"", "“", "”", "«", "»", "&", "→", "/", "e.g.", "i.e."]
SPOKEN_EXTRA = {"chapter", "remember", "pause", "here", "question", "answer", "revision", "theme",
                "class", "paper", "papers", "norway", "norwegian", "western", "english"}


def chapters_of(text):
    parts = re.split(r"(?m)^## (.*)$", text)
    return [(parts[i].strip(), parts[i + 1]) for i in range(1, len(parts), 2)]


def prose_of(body):
    return "\n".join(line for line in body.splitlines()
                     if not re.fullmatch(r"\s*<!--.*?-->\s*", line)).strip()


def reading_parts(spec, fails, where):
    out = []
    for part in [p.strip() for p in spec.split(";") if p.strip()]:
        m = SLIDE_PART.fullmatch(part)
        if m:
            cid = m.group(1) or m.group(2)
            if cid not in CLASSES or not numbers(m.group(3)) or numbers(m.group(3))[0] not in class_slides(cid):
                fails.append(f"readings: {where}: '{part}' is not a reviewed slide")
            continue
        m = PAPER_PART.fullmatch(part)
        if not m:
            fails.append(f"readings: {where}: '{part}' is neither a paper nor a slide")
            continue
        form = m.group(1).replace(" and ", " & ")
        pid = CITE_TO_PID.get(form)
        if not pid:
            fails.append(f"readings: {where}: '{m.group(1)}' is not a course paper")
            continue
        if m.group(3):
            if pid == "P02" and m.group(2) != "PDF p":
                fails.append(f"readings: {where}: Paper 2 is cited as 'PDF p. N'")
            if pid != "P02" and m.group(2) == "PDF p":
                fails.append(f"readings: {where}: 'PDF p.' is only for Paper 2")
            for n in numbers(m.group(3)):
                if not citable(pid, n):
                    fails.append(f"readings: {where}: page {n} of {CITES[pid]} is not a citable page")
        out.append(pid)
    return out


def check_listen(key, text, fails, warns, root=CS, partial=False):
    rev = REVISION[key]
    lines = text.splitlines()
    first = next((x for x in lines if x.strip()), "")
    if first.strip() != f"# Revision {rev['num']}: {rev['title']}":
        fails.append(f"header: the first line should be '# Revision {rev['num']}: {rev['title']}'")
    lecture = f"<!-- lecture: {key} | session: Revision | lecturer: none | deck: none -->"
    if lecture not in text:
        fails.append(f"header: missing '{lecture}'")
    voices = f"<!-- voices: {', '.join(rev['voices'])} -->"
    if voices not in text:
        fails.append(f"header: missing '{voices}'")
    root = pathlib.Path(root)
    for v in rev["voices"]:
        if not (root / v).exists():
            fails.append(f"header: the voices file '{v}' does not exist")

    chs = chapters_of(text)
    want = rev["chapters"]
    if not partial and len(chs) != len(want):
        fails.append(f"chapters: {len(chs)} chapters (need {len(want)})")
    for i, (head, _) in enumerate(chs):
        if i >= len(want):
            break
        if key == "R10":
            ok = head == f"{i + 1}. {want[i]}" or head == want[i]
        else:
            ok = head == f"{i + 1}. {want[i]}"
        if not ok:
            fails.append(f"chapters: chapter {i + 1} should be '## {i + 1}. {want[i]}', found '## {head}'")

    voices_text = "\n".join((root / v).read_text(encoding="utf-8") for v in rev["voices"] if (root / v).exists())
    v_words = G.word_set(voices_text) | G.word_set(" ".join(rev["voices"]))
    v_numbers = set(re.findall(r"\d+", re.sub(r"(\d)[\s\u00a0\u202f](\d{3})\b", r"\1\2", voices_text)))
    total = 0
    for i, (head, body) in enumerate(chs, 1):
        where = f"chapter {i}"
        prose = prose_of(body)
        n = words(prose)
        total += n
        lo, hi = (110, 200) if key == "R10" else (100, 340)
        if not partial and not lo <= n <= hi:
            fails.append(f"length: {where} has {n} words (need {lo}-{hi})")
        readings = READINGS_LINE.findall(body)
        if len(readings) != 1:
            fails.append(f"readings: {where} has {len(readings)} readings lines (need one)")
            pids = []
        else:
            pids = reading_parts(readings[0], fails, where)
        checks = CHECK_LINE.findall(body)
        if not 1 <= len(checks) <= 2:
            fails.append(f"checks: {where} has {len(checks)} check lines (need 1-2)")
        paras = [p for p in re.split(r"\n\s*\n", prose) if p.strip()]
        if not paras or not paras[-1].strip().startswith("Remember:"):
            fails.append(f"remember: {where} does not end with a paragraph starting 'Remember:'")
        for line in prose.splitlines():
            if re.match(r"^\s*(#|[-*+] |\d+[.)] )", line):
                fails.append(f"prose: {where} has a line that starts like a heading or a bullet: '{line[:40]}'")
        for ch in BAD_CHARS:
            if ch in prose:
                fails.append(f"prose: {where} contains '{ch}'")
        for bad in (r"\bpage \d", r"\bpages?\b", r"\bpp\."):
            if re.search(bad, prose, re.I):
                fails.append(f"prose: {where} speaks a page reference")
        r = G.readability(prose)
        if r["mean"] > G.MEAN_SENTENCE_WORDS_MAX:
            fails.append(f"style: {where} mean sentence {r['mean']:.1f} words (max {G.MEAN_SENTENCE_WORDS_MAX})")
        if r["max"] > G.SENTENCE_WORDS_MAX:
            fails.append(f"style: {where} a sentence has {r['max']} words (max {G.SENTENCE_WORDS_MAX})")
        if r["inflated_per_1000"] > G.INFLATED_PER_1000_MAX:
            fails.append(f"style: {where} {r['inflated_per_1000']:.1f} inflated words per 1000")
        no = G.norwegian_words(prose)
        if no:
            fails.append(f"style: {where} has Norwegian words {no[:6]}")
        lower = sorted({w for w in re.findall(r"\b[\w'-]*[æøå][\w'-]*\b", G.strip_exempt(prose)) if w[0].islower()})
        if lower:
            fails.append(f"style: {where} has untranslated words {lower[:6]}")
        for num in sorted(numbers_in(prose)):
            if not set(re.findall(r"\d+", num)) <= v_numbers:
                fails.append(f"facts: {where}: the number '{num}' is not in the voices files")
        for name in sorted(names_in(prose)):
            low = name.lower()
            if low in G.NAME_ALLOWLIST or low in SPOKEN_EXTRA or G.word_set(name) <= v_words:
                continue
            if len(low) >= 4 and any(w.startswith(low) for w in v_words):
                continue
            fails.append(f"facts: {where}: the name '{name}' is not in the voices files")
        for pid in dict.fromkeys(pids):
            for run in copied(prose, pid):
                fails.append(f"copy: {where} copies words from {CITES[pid]}: '{run[:50]}'")
        for surname, rx in NAME_RE.items():
            years = {str(READINGS[p][1]) for p in SURNAME_PAPERS[surname]}
            for m in rx.finditer(prose):
                if m.group(1) not in years:
                    fails.append(f"spoken: {where}: '{m.group(0)}' has the wrong year")
        for wrong, right in MISSPELT.items():
            if re.search(rf"\b{re.escape(wrong)}\b", prose):
                fails.append(f"spoken: {where}: '{wrong}' must be spelled '{right}'")
        for sent in re.split(r"(?<=[.!?])\s+", prose):
            if "example of our own" in sent and re.search(r"\d", sent):
                fails.append(f"people: {where}: an example of our own has a digit")
        if key != "R10" and i == len(want):
            pauses = prose.count("Pause the audio and answer in your head.")
            answers = len(re.findall(r"(?m)^Here is the answer\.", prose))
            if not 3 <= pauses <= 4:
                fails.append(f"recall: {where} has {pauses} pauses (need 3-4)")
            if answers != pauses:
                fails.append(f"recall: {where} has {answers} answers for {pauses} pauses")
    lo, hi = {"R01": (1300, 1900), "R10": (2000, 3400)}.get(key, (1100, 1600))
    if not partial and not lo <= total <= hi:
        fails.append(f"length: {total} words in the lesson (need {lo}-{hi})")
    check_people(text, fails)


# ------------------------------------------------------------------ the pre-push scan

# Written from parts so this file does not match its own patterns (plan 9.4). The value is
# 16+ characters, by the student's decision of 2026-11-01 (see plan section 11): the 8-character
# rule matched the plan's own test text in 6.5 row 33, and a real key is 40+ characters.
SECRETS = [
    ("an API key", "sk" + r"-or-v1-[0-9a-f]{16,}"),
    ("an API key", "sk" + r"-[A-Za-z0-9]{32,}"),
    ("a private key", "-" * 5 + r"BEGIN [A-Z ]*PRIVATE KEY"),
    ("a key in an assignment", r"(?:OPENROUTER_AP" + r"I_KEY|GROKBOT_PASSCODE)\s*=\s*['\"]?"
                              r"(?!test-key|test-pass)[^\s'\"]{16,}"),
]
SKIP_TEXT = {".png", ".jpg", ".jpeg", ".gif", ".ico", ".woff", ".woff2", ".mp3", ".ttf", ".eot"}


def scan(root=CS, diff=None):
    """Problems found by the pre-push scan (plan 9.4): secrets, course files, big files, Paper 2."""
    problems = []
    root = pathlib.Path(root)
    if diff:
        for line in diff:
            for label, pattern in SECRETS:
                if re.search(pattern, line):
                    problems.append(f"the staged diff: looks like {label}")
    if not root.exists():
        return problems
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(root).as_posix()
        parts = pathlib.PurePosixPath(rel).parts
        if "__pycache__" in parts or path.suffix == ".pyc":
            continue        # git ignores bytecode (.gitignore line 3), so it is never pushed
        size = path.stat().st_size
        if size > 5 * 1024 * 1024:
            problems.append(f"{rel}: {size // 1024} KB is over the 5 MB limit")
        suffix = path.suffix.lower()
        if suffix in (".pptx", ".docx", ".doc", ".xlsx"):
            problems.append(f"{rel}: a course file (.docx, .pptx, .doc, .xlsx) is never committed")
        if suffix == ".pdf" and rel != "print/INN514_CHEATSHEET.pdf":
            problems.append(f"{rel}: only print/INN514_CHEATSHEET.pdf may be committed")
        if suffix in SKIP_TEXT:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for label, pattern in SECRETS:
            if re.search(pattern, text):
                problems.append(f"{rel}: looks like {label}")
        parts = pathlib.PurePosixPath(rel).parts
        if suffix in (".md", ".html") and "scripts" not in parts:
            runs = copied(text, "P02")
            if runs:
                problems.append(f"{rel}: 7 words copied from Paper 2: '{runs[0][:60]}'")
    for f in sorted((LA / "site" / "data").glob("R*.json")):
        runs = copied(f.read_text(encoding="utf-8", errors="ignore"), "P02")
        if runs:
            problems.append(f"site/data/{f.name}: 7 words copied from Paper 2: '{runs[0][:60]}'")
    return problems


# ------------------------------------------------------------------ the site manifest and the live check

SITE_DATA = ("data", "audio")


def site_manifest(mode, root=None, book_path=None):
    """Write or check checks/site-before.txt: every site/data and site/audio file except the R ones."""
    site = pathlib.Path(root) if root else (LA / "site")
    book = pathlib.Path(book_path) if book_path else (CS / "checks" / "site-before.txt")
    files = [f for d in SITE_DATA for f in sorted((site / d).glob("*")) if f.is_file()]
    if mode == "write":
        book.parent.mkdir(exist_ok=True)
        rows = []
        for f in files:
            rel = f.relative_to(site).as_posix()
            if re.fullmatch(r"R\d\d\.json", f.name) or re.fullmatch(r"R\d\d-\d\d\.mp3", f.name):
                continue
            rows.append(f"{hashlib.sha256(f.read_bytes()).hexdigest()}  {rel}")
        book.write_text("\n".join(rows) + "\n", encoding="utf-8")
        print(f"WROTE {book} ({len(rows)} files)")
        return []
    if not book.exists():
        return ["checks/site-before.txt is missing; run --site-manifest write first"]
    problems, listed = [], set()
    for line in book.read_text(encoding="utf-8").splitlines():
        digest, _, rel = line.partition("  ")
        listed.add(rel)
        f = site / rel
        if not f.exists():
            problems.append(f"{rel}: vanished")
        elif hashlib.sha256(f.read_bytes()).hexdigest() != digest:
            problems.append(f"{rel}: changed")
    for f in files:
        rel = f.relative_to(site).as_posix()
        if rel in listed:
            continue
        if re.fullmatch(r"R\d\d\.json", f.name) or re.fullmatch(r"R\d\d-\d\d\.mp3", f.name):
            continue
        problems.append(f"{rel}: a new file that is not an R file")
    return problems


def live_check(ids):
    """After a push: the lessons play on the companion site (plan 6.4)."""
    import time
    import urllib.request
    base = "https://inn514.canner.app/"
    for attempt in range(10):
        ok = True
        try:
            page = urllib.request.urlopen(base, timeout=30).read().decode("utf-8", "ignore")
        except Exception:
            ok = False
            page = ""
        for lid in ids:
            if not ok:
                break
            if f"site/audio/{lid}-01.mp3" not in page:
                ok = False
                break
            try:
                req = urllib.request.Request(f"{base}site/audio/{lid}-01.mp3", method="HEAD")
                ok = urllib.request.urlopen(req, timeout=30).status == 200
            except Exception:
                ok = False
        if ok:
            print(f"LIVE OK {' '.join(ids)}")
            return 0
        if attempt < 9:
            time.sleep(60)
    print(f"NOT LIVE YET {' '.join(ids)}")
    return 1


# ------------------------------------------------------------------ command line

def show(name, text, fails, warns):
    if fails:
        print(f"FAIL {name}")
        for f in fails:
            print(f"  - {f}")
    else:
        print(f"PASS {name} ({words(text)} words)")
    for w in warns:
        print(f"  ~ warning: {w}")
    return len(fails)


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8")
    if not argv:
        print(__doc__)
        return 2
    if "--site-manifest" in argv:
        mode = argv[argv.index("--site-manifest") + 1]
        problems = site_manifest(mode)
        for p in problems:
            print(f"- {p}")
        if problems:
            print(f"SITE MANIFEST FOUND {len(problems)} problems")
            return 1
        print("SITE MANIFEST OK")
        return 0
    if "--live" in argv:
        ids = [a for a in argv[argv.index("--live") + 1:] if re.fullmatch(r"R\d\d", a)]
        if not ids:
            print("--live needs R ids")
            return 2
        return live_check(ids)
    if "--scan" in argv:
        problems = scan(CS)
        for p in problems:
            print(f"- {p}")
        if problems:
            print(f"SCAN FOUND {len(problems)} problems")
            return 1
        print("SCAN CLEAN")
        return 0

    if "--all" in argv:
        partial = "--partial" in argv
        total = 0
        names = all_names() + [f"listen/{f.stem}.md" for f in sorted((CS / "listen").glob("R*.md"))]
        for name in names:
            path = CS / name
            if not path.exists():
                if partial:
                    print(f"SKIP {name} (not written yet)")
                else:
                    print(f"FAIL {name}")
                    print("  - complete: the file does not exist")
                    total += 1
                continue
            text = path.read_text(encoding="utf-8")
            kind, _ = identify(name)
            fails, warns = check_text(kind, name, text)
            total += show(name, text, fails, warns)
        extra = []
        complete(CS, extra, partial)
        assembled(CS, extra)
        for name, fails, warns in extra:
            total += show(name, "", fails, warns)
        print("ALL CHEATSHEET CHECKS PASSED" if total == 0 else f"CHEATSHEET CHECKS FAILED: {total} problems")
        return 0 if total == 0 else 1

    path = pathlib.Path(argv[0])
    if not path.is_absolute():
        path = CS / path
    if not path.exists():
        print(f"FAIL {argv[0]}")
        print("  - the file does not exist")
        print("CHEATSHEET CHECKS FAILED: 1 problems")
        return 1
    text = path.read_text(encoding="utf-8")
    try:
        shown = path.resolve().relative_to(CS.resolve()).as_posix()
    except ValueError:
        shown = str(path)
    kind, _ = identify(shown)
    if kind is None:
        print(f"FAIL {shown}")
        print("  - kind: not a cheatsheet file (cards/, themes/, front/, back/)")
        print("CHEATSHEET CHECKS FAILED: 1 problems")
        return 1
    fails, warns = check_text(kind, shown, text)
    total = show(shown, text, fails, warns)
    print("ALL CHEATSHEET CHECKS PASSED" if total == 0 else f"CHEATSHEET CHECKS FAILED: {total} problems")
    return 0 if total == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
