"""Check one lecture's text before it is recorded.

    C:/Python313/python.exe workspace/lecture-audio/scripts/check_style.py T3

Fails (prints FAIL, exits 1) when the lecture breaks the format or the style the
student approved in Lecture 1:
  - format: a '# Lecture N: ...' title and a <!-- lecture: T.. | ... (H2025, NN slides) --> line;
  - 6-8 chapters; 2,200-2,800 words in total (Lecture 1: 2,594);
  - every chapter has <!-- slides: ... --> with numbers inside the deck,
    <!-- readings: ... -->, and 1-3 <!-- check: question | answer --> lines;
  - no slide in two chapters;
  - per chapter: mean sentence <= 21 words, no sentence > 45 words,
    <= 6 inflated words per 1000 (rigorous, fundamental, foster, ...),
    no Norwegian words and no lower-case æøå words in the prose;
  - no headings, bullets or numbered lists inside a chapter's prose.
Prints which deck slides no chapter covers, so you can confirm they are admin slides.
Thresholds come from workspace/study-site/pipeline/guards_lib.py (calibrated on the
student's approved Fagerberg prose).
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT.parents[0] / "study-site" / "pipeline"))
import guards_lib as G  # noqa: E402

WORDS_TOTAL = (2200, 2800)
CHAPTERS = (6, 8)


def main(argv):
    sys.stdout.reconfigure(encoding="utf-8")
    if not argv:
        print(__doc__)
        return 2
    lid = argv[0].upper()
    path = ROOT / "lectures" / f"{lid}.md"
    if not path.exists():
        print(f"FAIL: {path} does not exist")
        return 1
    text = path.read_text(encoding="utf-8")
    fails = []

    if not re.search(r"^# Lecture .+", text, re.M) and not re.search(r"^# Bonus.+", text, re.M):
        fails.append("format: first heading must be '# Lecture N: title' (or '# Bonus: title')")
    meta = re.search(r"<!--\s*lecture:\s*(\w+)\s*\|(.*?)-->", text, re.S)
    deck_slides = None
    if not meta:
        fails.append("format: missing '<!-- lecture: ID | session: ... | lecturer: ... | deck: ... -->'")
    else:
        if meta.group(1).upper() != lid:
            fails.append(f"format: lecture id in the meta line is {meta.group(1)}, expected {lid}")
        m = re.search(r"(\d+)\s+slides", meta.group(2))
        deck_slides = int(m.group(1)) if m else None
        if deck_slides is None:
            fails.append("format: the meta line must end with '(H2025, NN slides)'")

    blocks = re.split(r"^## ", text, flags=re.M)[1:]
    if not CHAPTERS[0] <= len(blocks) <= CHAPTERS[1]:
        fails.append(f"structure: {len(blocks)} chapters (need {CHAPTERS[0]}-{CHAPTERS[1]})")

    total, seen, rows = 0, {}, []
    for i, block in enumerate(blocks, 1):
        head, _, body = block.partition("\n")
        name = f"ch {i} '{head.strip()[:40]}'"
        if not re.match(rf"{i}\.\s+\S", head.strip()):
            fails.append(f"{name}: heading must be '## {i}. Title'")
        sl = re.search(r"<!--\s*slides:\s*(.*?)\s*-->", body)
        nums = [int(x) for x in re.findall(r"\d+", sl.group(1))] if sl else []
        if not nums:
            fails.append(f"{name}: needs <!-- slides: ... --> with slide numbers")
        for s in nums:
            if deck_slides and not 1 <= s <= deck_slides:
                fails.append(f"{name}: slide {s} is outside the deck (1-{deck_slides})")
            if s in seen:
                fails.append(f"{name}: slide {s} is also in chapter {seen[s]}")
            seen[s] = i
        if not re.search(r"<!--\s*readings:\s*\S.*?-->", body):
            fails.append(f"{name}: needs <!-- readings: ... --> (write 'none new' if there are none)")
        checks = re.findall(r"<!--\s*check:\s*(.*?)\s*\|\s*(.*?)\s*-->", body, re.S)
        if not 1 <= len(checks) <= 3 or any(not q.strip() or not a.strip() for q, a in checks):
            fails.append(f"{name}: needs 1-3 '<!-- check: question | answer -->' lines with both parts")
        prose = re.sub(r"<!--.*?-->", "", body, flags=re.S).strip()
        for line in prose.splitlines():
            if re.match(r"\s*(#|[-*+]\s|\d+\.\s)", line):
                fails.append(f"{name}: heading, bullet or numbered line in the prose: '{line.strip()[:40]}'")
        words = len(prose.split())
        total += words
        r = G.readability(prose)
        no = G.norwegian_words(prose)
        lower_aeo = sorted({w for w in re.findall(r"\b[\w'-]*[æøå][\w'-]*\b", G.strip_exempt(prose))
                            if w[0].islower()})
        if r["mean"] > G.MEAN_SENTENCE_WORDS_MAX:
            fails.append(f"{name}: mean sentence {r['mean']:.1f} words (max {G.MEAN_SENTENCE_WORDS_MAX})")
        if r["max"] > G.SENTENCE_WORDS_MAX:
            fails.append(f"{name}: a sentence has {r['max']} words (max {G.SENTENCE_WORDS_MAX})")
        if r["inflated_per_1000"] > G.INFLATED_PER_1000_MAX:
            fails.append(f"{name}: {r['inflated_per_1000']:.1f} inflated words per 1000 (max {G.INFLATED_PER_1000_MAX})")
        if no:
            fails.append(f"{name}: Norwegian words in the prose {no[:6]}")
        if lower_aeo:
            fails.append(f"{name}: untranslated words with æøå {lower_aeo[:6]}")
        rows.append((i, head.strip()[:44], words, r["mean"], r["max"], r["inflated_per_1000"], len(checks), nums))

    if not WORDS_TOTAL[0] <= total <= WORDS_TOTAL[1]:
        fails.append(f"length: {total} words in total (need {WORDS_TOTAL[0]}-{WORDS_TOTAL[1]}, about 15-20 minutes)")

    print(f"{lid}: {len(blocks)} chapters, {total} words (about {total / 135:.0f} min of audio)")
    for i, title, w, mean, mx, infl, nc, nums in rows:
        print(f"  {i}. {title:44s} {w:4d} words  mean {mean:4.1f}  max {mx:2d}  inflated {infl:3.1f}  checks {nc}  slides {len(nums)}")
    if deck_slides:
        missing = [s for s in range(1, deck_slides + 1) if s not in seen]
        print(f"  slides in no chapter: {missing or 'none'} (fine only if they are admin slides)")
    if fails:
        print(f"FAIL: {len(fails)} problem(s)")
        for f in fails:
            print(f"  - {f}")
        return 1
    print("PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
