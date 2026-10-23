"""Check one reading summary before it is recorded.

    C:/Python313/python.exe workspace/lecture-audio/scripts/check_reading.py P01

Reads workspace/lecture-audio/readings/<P>.md and compares it with the paper's own
pages (native PDFs are read fresh from the PDF; P05, a scan, uses its verified page
files, which are cross-checked against OCR of the scan). Names and numbers are
matched against the paper's own language, never against a translation.
Fails (prints FAIL, exits 1) on:
  format     a '# Reading N: ...' title and a <!-- reading: P.. | ... --> line;
             chapter 1 is 'The paper in brief' (450-650 words, prose only);
             every chapter has <!-- pages: ... --> and 1-2 <!-- check: q | a --> lines;
             page chapters hold only '### Page N', '### Pages N-M' or '### Cover' blocks,
             and their <!-- pages --> line lists exactly the pages of those blocks;
  coverage   every page of the paper appears exactly once, in page order;
  length     an article page: 60-100 words (fails outside 50-115; 25-115 for a page
             with under 250 words of its own, or one that runs into the reference list);
             a page marked <!-- kind: references --> or <!-- kind: cover -->, a
             'Pages N-M' block or the 'Cover' block: 30 words or fewer, and only on
             pages the extraction guessed are references or a cover;
  style      per chapter: mean sentence <= 21 words, no sentence > 45 words,
             <= 6 inflated words per 1000, no Norwegian words, no lower-case æøå words;
  sources    every capitalised name and every number in a page block must be on that
             page or the page before or after (or declared on its own line as
             <!-- sourced: X | page N, what the figure shows -->); chapter 1's names
             and numbers must be somewhere in the paper; "page N" must be a page of
             the paper; text in quotation marks must be on that page word for word,
             20 words at most, one quotation per page; P02 may not be quoted at all.
Warnings (not failures) list page summaries outside 60-100 words and chapters that do
not group 2-6 pages, for the reviewer.

    check_reading.py P01 --partial
tests the scripts on a fixture that covers only some pages: coverage is limited to the
pages present and chapter 1's length is not checked. It never prints PASS.
"""
import re
import sys

from reading_lib import (G, label_list, page_table, paper_meta, parse_reading,
                         range_text)
from check_sources import names_in, numbers_in

BRIEF_WORDS = (450, 650)
PAGE_WORDS, PAGE_HARD = (60, 100), (50, 115)
SHORT_PAGE_WORDS = 250
LIST_PAGE_MAX = 30
QUOTE_MAX_WORDS = 20
EXTRA_OK = {"reading", "readings", "paper", "papers", "page", "pages", "cover", "lecture", "lectures",
            "chapter", "chapters", "bonus", "exam", "question", "questions", "december", "june", "here",
            "companion", "kursplan", "figure", "table", "section"}


# A page reference, including lists: "page 416", "pages 427-428", "pages 416, 424, 425 and 427", "pp. 3 to 5".
PAGE_LIST = re.compile(r"(?i)\b(?:pages?|pp?\.)\s+\d+(?:\s*(?:,\s*and|,|and|to|[–-])\s*\d+)*")


def text_words(text):
    """Words on a page, also with words joined across a line-end hyphen ("Fre-\\ndin" -> "Fredin")."""
    return G.word_set(text) | G.word_set(re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", text))


def numbers_of(text):
    text = re.sub(r"(\d)[\s\u00a0\u202f](\d{3})\b", r"\1\2", text)
    return set(re.findall(r"\d+", text.replace(",", "")))


# A summary may spell out what the paper abbreviates: "United States" for "US" or "USA",
# "United Kingdom" for "UK".
ALIASES = {"united": {"us", "usa", "uk"}, "states": {"us", "usa"}, "kingdom": {"uk"}}


def name_ok(name, words, declared):
    low = name.lower()
    if low in G.NAME_ALLOWLIST or low in EXTRA_OK or low in declared:
        return True
    if words & ALIASES.get(low, set()):
        return True
    if G.word_set(name) <= words:
        return True
    return len(low) >= 4 and any(w.startswith(low) for w in words)


def quotes_in(prose):
    return re.findall(r"[\"\u201c\u00ab]([^\"\u201d\u00bb]{2,}?)[\"\u201d\u00bb]", prose)


def qnorm(text):
    """Normalised words without quote marks, so 'rules of the game' in the PDF matches."""
    return re.sub(r"\s+", " ", G.norm(text).replace("'", " ").replace('"', " ")).strip()


def quoted_on(q, text):
    return bool(qnorm(q)) and f" {qnorm(q)} " in f" {qnorm(text)} "


# Papers that may not be quoted at all: no quotation marks, and no run of COPY_RUN or more
# words copied from the paper (words from its own title excepted).
NO_COPY = {"P02"}
COPY_RUN = 7

# A paper's own defined technical term is not inflated wording when a summary uses it.
# P04 defines "paradigm" on page 4 and builds its whole argument on a paradigm shift.
OWN_TERMS = {"P04": ("paradigm",)}


def copied_runs(prose, grams, title_norm):
    w = qnorm(prose).split()
    runs, i = [], 0
    while i <= len(w) - COPY_RUN:
        if " ".join(w[i:i + COPY_RUN]) in grams:
            j = i + COPY_RUN
            while j < len(w) and " ".join(w[j - COPY_RUN + 1:j + 1]) in grams:
                j += 1
            run = " ".join(w[i:j])
            if f" {run} " not in f" {title_norm} ":
                runs.append(run)
            i = j
        else:
            i += 1
    return runs


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8")
    if not argv:
        print(__doc__)
        return 2
    pid = argv[0].upper()
    partial = "--partial" in argv
    meta = paper_meta(pid)
    table = page_table(pid)
    order = [r["label"] for r in table]
    by_label = {r["label"]: r for r in table}
    idx = {lab: i for i, lab in enumerate(order)}
    try:
        rd = parse_reading(pid)
    except FileNotFoundError:
        print(f"FAIL: readings/{pid}.md does not exist")
        return 1
    fails, warns = [], []
    declared = {}
    for ch in rd["chapters"]:
        declared.update(ch["sourced"])

    # ---------------------------------------------------------------- format
    if not re.search(r"^# Reading \d+: .+", rd["text"], re.M):
        fails.append("format: missing '# Reading N: title'")
    if rd["meta"].get("reading", "").upper() != pid:
        fails.append(f"format: missing '<!-- reading: {pid} | authors: ... | year: ... | ... -->'")
    for key in ("authors", "year", "lectures"):
        if not rd["meta"].get(key):
            fails.append(f"format: the reading line has no '{key}:'")
    chapters = rd["chapters"]
    if len(chapters) < 2:
        fails.append("format: need chapter 1 'The paper in brief' and at least one page chapter")
    whole_paper = "\n".join(r["text"] for r in table)
    paper_words = text_words(whole_paper) | G.word_set(meta["authors"] + " " + meta["title"])
    paper_numbers = numbers_of(whole_paper) | {str(meta["year"])}

    seen, rows, total = [], [], 0
    for ch in chapters:
        name = f"ch {ch['n']}"
        if not (1 <= len(ch["checks"]) <= 2):
            fails.append(f"{name}: needs 1-2 <!-- check: question | answer --> lines (has {len(ch['checks'])})")
        if not ch["pages_spec"]:
            fails.append(f"{name}: missing <!-- pages: ... -->")
        prose_all = " ".join(ch["intro"] + [b["prose"] for b in ch["blocks"]])
        words = len(prose_all.split())
        total += words

        # style, per chapter
        r = G.readability(prose_all)
        own = sum(len(re.findall(r"\b" + w, prose_all.lower())) for w in OWN_TERMS.get(pid, ()))
        r["inflated_per_1000"] -= 1000 * own / max(len(prose_all.split()), 1)
        if r["mean"] > G.MEAN_SENTENCE_WORDS_MAX:
            fails.append(f"{name}: mean sentence {r['mean']:.1f} words (max {G.MEAN_SENTENCE_WORDS_MAX})")
        if r["max"] > G.SENTENCE_WORDS_MAX:
            fails.append(f"{name}: a sentence has {r['max']} words (max {G.SENTENCE_WORDS_MAX})")
        if r["inflated_per_1000"] > G.INFLATED_PER_1000_MAX:
            fails.append(f"{name}: {r['inflated_per_1000']:.1f} inflated words per 1000 (max {G.INFLATED_PER_1000_MAX})")
        no = G.norwegian_words(prose_all)
        if no:
            fails.append(f"{name}: Norwegian words in the prose {no[:6]}")
        lower_aeo = sorted({w for w in re.findall(r"\b[\w'-]*[æøå][\w'-]*\b", G.strip_exempt(prose_all))
                            if w[0].islower()})
        if lower_aeo:
            fails.append(f"{name}: untranslated words with æøå {lower_aeo[:6]}")
        if pid == "P02" and quotes_in(prose_all):
            fails.append(f"{name}: P02 is marked 'do not quote', so no quotation marks at all")
        for m in PAGE_LIST.finditer(prose_all):
            for n in {int(x) for x in re.findall(r"\d+", m.group(0))}:
                if n not in idx:
                    fails.append(f"{name}: page {n} in '{m.group(0)}' is not a page of this paper")

        if ch["n"] == 1:
            if ch["title"].lower() != "the paper in brief":
                fails.append("ch 1: must be called 'The paper in brief'")
            if ch["blocks"]:
                fails.append("ch 1: no '### Page' blocks here; it is the summary of the whole paper")
            if not partial and not BRIEF_WORDS[0] <= words <= BRIEF_WORDS[1]:
                fails.append(f"ch 1: {words} words (need {BRIEF_WORDS[0]}-{BRIEF_WORDS[1]})")
            nums_ok = paper_numbers | {"2024", "2025"}         # the exam papers' dates
            for nm in sorted(names_in(prose_all)):
                if not name_ok(nm, paper_words, declared):
                    fails.append(f"ch 1: name '{nm}' does not appear in the paper")
            for num in sorted(numbers_in(PAGE_LIST.sub(' ', prose_all))):
                if num.lower() not in declared and not set(re.findall(r"\d+", num)) <= nums_ok:
                    fails.append(f"ch 1: number '{num}' does not appear in the paper")
            for q in quotes_in(prose_all):
                if pid != "P02" and not quoted_on(q, whole_paper):
                    fails.append(f"ch 1: quotation not found in the paper: \"{q[:50]}\"")
            rows.append((ch["n"], ch["title"][:40], words, "the whole paper", r))
            continue

        # page chapters
        if any(p.strip() for p in ch["intro"]):
            fails.append(f"{name}: text before the first '### Page' heading; every paragraph belongs to a page")
        ch_labels = []
        for b in ch["blocks"]:
            labs = b["labels"]
            where = f"{name}, '{b['heading']}'"
            if labs is None:
                fails.append(f"{where}: heading must be 'Page N', 'Pages N-M' or 'Cover'")
                continue
            ch_labels += labs
            missing = [lab for lab in labs if lab not in idx]
            if missing:
                fails.append(f"{where}: {missing} is not a page of this paper (pages: {range_text(order)})")
                continue
            seen += labs
            bw = len(b["prose"].split())
            guesses = {by_label[lab]["kind"] for lab in labs}
            listing = b["kind"] in ("references", "cover") or len(labs) > 1 or labs == ["cover"]
            if listing:
                if not guesses <= {"references", "cover"}:
                    fails.append(f"{where}: marked as a reference list or cover, but the extraction found article "
                                 f"text on {[lab for lab in labs if by_label[lab]['kind'] not in ('references', 'cover')]}; "
                                 f"summarise those pages one by one")
                if bw > LIST_PAGE_MAX:
                    fails.append(f"{where}: {bw} words (a reference list or cover gets one sentence, {LIST_PAGE_MAX} words at most)")
            else:
                own = len(by_label[labs[0]]["text"].split())
                lo = 25 if own < SHORT_PAGE_WORDS or guesses & {"mixed"} else PAGE_HARD[0]
                if not lo <= bw <= PAGE_HARD[1]:
                    fails.append(f"{where}: {bw} words (need {PAGE_WORDS[0]}-{PAGE_WORDS[1]}; allowed {lo}-{PAGE_HARD[1]})")
                elif not PAGE_WORDS[0] <= bw <= PAGE_WORDS[1]:
                    warns.append(f"{where}: {bw} words (target {PAGE_WORDS[0]}-{PAGE_WORDS[1]})")
            # sources: this page and its neighbours
            near = set()
            for lab in labs:
                i = idx[lab]
                near |= {order[j] for j in range(max(0, i - 1), min(len(order), i + 2))}
            window = "\n".join(by_label[lab]["text"] for lab in near)
            words_ok = text_words(window) | G.word_set(meta["authors"])
            nums_ok = numbers_of(window) | {str(meta["year"])} | {str(lab) for lab in labs if isinstance(lab, int)}
            for nm in sorted(names_in(b["prose"])):
                if not name_ok(nm, words_ok, declared):
                    fails.append(f"{where}: name '{nm}' is not on this page or the next/previous one")
            for num in sorted(numbers_in(PAGE_LIST.sub(' ', b["prose"]))):
                if num.lower() not in declared and not set(re.findall(r"\d+", num)) <= nums_ok:
                    fails.append(f"{where}: number '{num}' is not on this page or the next/previous one")
            qs = quotes_in(b["prose"])
            if len(qs) > 1:
                fails.append(f"{where}: {len(qs)} quotations (one per page at most)")
            for q in qs:
                if len(q.split()) > QUOTE_MAX_WORDS:
                    fails.append(f"{where}: quotation of {len(q.split())} words (max {QUOTE_MAX_WORDS})")
                if pid != "P02" and not quoted_on(q, window):
                    fails.append(f"{where}: quotation not found word for word on the page: \"{q[:50]}\"")
        spec = label_list(ch["pages_spec"] or "")
        if ch_labels and spec != ch_labels:
            fails.append(f"{name}: <!-- pages: {ch['pages_spec']} --> does not match its blocks ({range_text(ch_labels)})")
        article_pages = [lab for lab in ch_labels if lab in by_label and by_label[lab]["kind"] in ("article", "mixed")]
        list_pages = [lab for lab in ch_labels if lab in by_label and by_label[lab]["kind"] in ("references", "cover")]
        fewest = 1 if list_pages else 2      # a short conclusion may share a chapter with the reference list
        if article_pages and not fewest <= len(article_pages) <= 6:
            warns.append(f"{name}: groups {len(article_pages)} article pages (aim for 3-5)")
        rows.append((ch["n"], ch["title"][:40], words, range_text(ch_labels), r))

    # ---------------------------------------------------------------- copied wording
    if pid in NO_COPY:
        pw = qnorm(whole_paper).split()
        grams = {" ".join(pw[i:i + COPY_RUN]) for i in range(len(pw) - COPY_RUN + 1)}
        title_norm = qnorm(meta["title"])
        for ch in chapters:
            # Check questions and answers are shown on the page too, so they may not copy the paper either.
            parts = [("ch %d" % ch["n"], p) for p in ch["intro"]] + \
                    [("ch %d, '%s'" % (ch["n"], b["heading"]), b["prose"]) for b in ch["blocks"]] + \
                    [("ch %d, check" % ch["n"], q["q"] + " " + q["a"]) for q in ch["checks"]]
            for where, prose in parts:
                for run in copied_runs(prose, grams, title_norm):
                    fails.append(f"{where}: copied wording from the paper ({pid} may not be quoted): \"{run}\"")

    # ---------------------------------------------------------------- coverage
    dup = sorted({str(lab) for lab in seen if seen.count(lab) > 1})
    if dup:
        fails.append(f"coverage: pages summarised twice: {', '.join(dup)}")
    span = [lab for lab in order if lab in seen]
    if partial and span:
        span_order = order[idx[span[0]]: idx[span[-1]] + 1]
        missing = [lab for lab in span_order if lab not in seen]
    else:
        missing = [lab for lab in order if lab not in seen]
    if missing:
        fails.append(f"coverage: pages with no summary: {range_text(missing)}")
    if [lab for lab in seen if lab in idx] != [lab for lab in order if lab in seen]:
        fails.append("coverage: pages are not in page order")

    est = total / 125
    print(f"{pid}: {meta['cite']}; {len(chapters)} chapters, {total} words (about {est:.0f} min of audio); "
          f"{len(set(seen) & set(order))} of {len(order)} pages covered; {len(declared)} declared")
    for n, title, w, pages, r in rows:
        print(f"  {n}. {title:<40} {w:4d} words  mean {r['mean']:4.1f}  max {r['max']:2d}  "
              f"inflated {r['inflated_per_1000']:.1f}  pages {pages}")
    for tok, where in declared.items():
        print(f"  declared: {tok} ({where})")
    for w in warns:
        print(f"  warning: {w}")
    if fails:
        print(f"FAIL: {len(fails)} problem(s)")
        for f in fails:
            print(f"  - {f}")
        return 1
    if partial:
        print("PARTIAL CHECK OK (testing only: this is not a PASS)")
        return 3
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
