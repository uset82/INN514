"""Tests for check_cheatsheet.py: one case per row of plan 6.3.

    C:/Python313/python.exe workspace/lecture-audio/cheatsheet/scripts/test_check_cheatsheet.py

Each test calls check_text() or scan() and asserts the result the plan lists. The script
prints 'ok <name>' per test and 'ALL CHECKER TESTS PASSED (N tests)' at the end; a test
that does not behave as listed prints 'FAIL <name>: ...' and the script exits 1.
"""
import pathlib
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from cheat_lib import CS, EXAM, PREVIEWS, REVISION, model_pages, pages, qnorm  # noqa: E402
from check_cheatsheet import check_text, scan, site_manifest   # noqa: E402

# ---------------------------------------------------------------- fixtures

CARD = """# Paper 1: Fagerberg, Mowery & Verspagen (2009)
<!-- card: P01 | cite: Fagerberg et al. 2009 | pages: 431-444 | class: 1 | themes: TH1, TH3 -->
*The evolution of Norway's national innovation system*, Science and Public Policy 36(6).

## In one line
Norway grows fast with modest research spending, and the authors explain the paradox through system, history and structure.

## Key concepts
- **National innovation system** (*nasjonalt innovasjonssystem*): all learning and innovation across an economy, not only laboratories and universities. (p. 431)
- **Institutions** (*institusjoner*): citing North, the "rules of the game", costly to establish but scale-giving once adopted. (p. 433)
- **Path dependency** (*stiavhengighet*): historical processes that favour some solutions and hold others back, as the authors say citing Arthur. (p. 431)
- **Absorptive capacity** (*absorpsjonskapasitet*): citing Cohen and Levinthal, the ability to identify, absorb and use new knowledge. (p. 437)
- **Dutch disease** (*hollandsk syke*): currency appreciation after a resource discovery, which can bring de-industrialization. (p. 434)

## Model
No model in this paper.

## Findings
- Norwegian firms cooperate widely in innovation and interact closely with their customers. (p. 437)
- Oil rents account for roughly half of the income gap with Western Europe. (p. 434)
- Early in the twentieth century, Norwegian firms adapted foreign technologies through technically trained people. (p. 440)

## Norway link
- Domestic suppliers in shipbuilding, engineering and services grew with petroleum instead of Dutch disease. (p. 434)

## Exam use
- Dec 2024 Q1: take the broad definition and institutions as the rules of the game. (our reading)

## Limits
- The authors set aside the social and cultural conditions behind the system's adaptability. (p. 442)

## Hook
Broad system, slow history, low research, high income.
"""

THEME = """# Theme 6: Technological innovation systems and their functions
<!-- theme: TH6 | papers: P09, P10, P17 | classes: 6, 9 -->

## Core definitions
- **Technological innovation system** (*teknologisk innovasjonssystem*): a set of actors and rules that develop, spread and use a technology. (Hekkert et al. 2007, p. 421)
- **Function** (*funksjon*): a pattern of activity that shapes how a technology develops. (Hekkert et al. 2007, p. 421)
- **Technological trajectory** (*teknologisk bane*): the direction a technology takes as actors build on earlier choices. (Hekkert et al. 2007, p. 422)
- **Path creation** (*baneskaping*): the work of actors who open a new path rather than follow an existing one. (Njøs et al. 2020, p. 266)
- **System building** (*systembygging*): the work of creating the actors and rules a new technology needs. (Steen et al. 2024, p. 4)

## Key models and figures
**Seven functions of innovation systems** (Hekkert et al. 2007, pp. 421–425):
1. Entrepreneurial activity
2. Knowledge development
3. Knowledge diffusion through networks
4. Guidance of the search
5. Market formation
6. Resource mobilization
7. Creation of legitimacy

## Exam angles
- Jun 2025 Q3: how a TIS can be guided, and which functions the guidance targets. (our reading)
- Class 9 example: a TIS and the seven functions. [Class 9, slide 37]
- Practice: compare two technologies with the same seven functions. (ours)

## Norway examples
- **Longship and Northern Lights**: the state backed capture and storage, and the case shows functions being built over time. (Steen et al. 2024, p. 7)
- **Maritime batteries**: Norwegian firms built a new path around electrified shipping. (Njøs et al. 2020, p. 276)

## Answer template
<!-- question: Jun 2025 Q3 -->
Drafting aid (ours): learn the moves, then write your own words.
- **Intro:** I read the question as asking how actors can steer a technological innovation system towards sustainability, and I answer here in three moves: functions, guidance, example.
- **Theory:** Hekkert et al. (2007) list seven functions, and guidance of the search is the one that sets direction. Steen et al. (2024) show how such functions are built in carbon capture.
- **Example:** In Norway, Longship combined state funding and industry partners, which mobilized resources and created legitimacy, as Steen et al. (2024) describe. The same project also shows how guidance can stay narrow when one technology dominates.
- **Mini-conclusion:** A technological innovation system can be guided when actors use its functions deliberately and keep the direction open to debate.

## Links
Cards: P09, P10, P17. Themes: TH5, TH7.
"""

P02 = """# Paper 2: Fløysand, Jakobsen & Hidle (2013)
<!-- card: P02 | cite: Fløysand et al. 2013 | pages: 1-17 | class: 1 | themes: TH1 -->
*The “trinity” of innovation: actors, ideas and objects in innovation practice*, Conference paper.

## In one line
The paper asks how actors, ideas and objects meet in innovation practice, and answers with a relational view.

## Key concepts
- **Innovation practice** (*innovasjonspraksis*): what actors do when they bring ideas and objects together. (PDF p. 2)
- **Actor** (*aktør*): a participant whose work shapes the practice. (PDF p. 3)
- **Object** (*objekt*): the material thing that takes part in the practice. (PDF p. 4)
- **Trinity of innovation** (*innovasjonens treenighet*): the three parts the paper studies together. (PDF p. 5)

## Model
No model in this paper.

## Findings
- The three parts are studied together rather than apart. (PDF p. 6)
- The paper offers a vocabulary for practice. (PDF p. 8)

## Norway link
- Norwegian cases are described in the paper. (PDF p. 10)

## Exam use
- Dec 2024 Q1: definitions of actors and objects. (our reading)

## Limits
- The paper is in preparation, so its claims stay provisional. (PDF p. 15)

## Hook
Actors, ideas and objects, held together.
"""


# ---------------------------------------------------------------- helpers

def fails_of(kind, key, text):
    fails, _ = check_text(kind, f"{'cards' if kind == 'card' else 'themes'}/{key}.md", text)
    return fails


def expect(fails, needle, also_empty=False):
    hit = [f for f in fails if needle in f]
    assert hit, f"no failure mentions {needle!r}; got {fails}"
    if also_empty:
        assert not hit, hit


def clean(fails):
    assert not fails, f"expected no failures, got {fails}"


def words_from(pid, label, start, n):
    """n words of a paper page, as a run of prose (for the copy tests)."""
    return " ".join(qnorm(pages(pid)[label][1]).split()[start:start + n])


def temp_dir():
    return tempfile.TemporaryDirectory(dir=str(PREVIEWS))


# ---------------------------------------------------------------- the tests

TESTS = []


def test(name):
    def register(fn):
        TESTS.append((name, fn))
        return fn
    return register


@test("1 complete P01 card passes")
def t01():
    fails = fails_of("card", "P01", CARD)
    clean(fails)
    assert '"rules of the game"' in CARD and "(p. 433)" in CARD


@test("2 wrong year for Spigel & Harrison")
def t02():
    fails = fails_of("card", "P01",
                     CARD.replace("(p. 437)", "(Spigel & Harrison 2017, p. 152)", 1))
    expect(fails, "Spigel & Harrison 2018")


@test("3 misspelt Spiegel")
def t03():
    fails = fails_of("card", "P01", CARD.replace("- **Absorptive capacity**", "- **Spiegel capacity**", 1))
    expect(fails, "Spigel")


@test("4 page 999 is not a page")
def t04():
    fails = fails_of("card", "P01", CARD.replace("(p. 431)", "(Fagerberg et al. 2009, p. 999)", 1))
    expect(fails, "not a citable page")


@test("5 page 444 is the reference list")
def t05():
    fails = fails_of("card", "P01", CARD.replace("(p. 431)", "(Fagerberg et al. 2009, p. 444)", 1))
    expect(fails, "not a citable page")


@test("6 the quotation is not on the cited page")
def t6():
    fails = fails_of("card", "P01", CARD.replace("once adopted. (p. 433)", "once adopted. (p. 437)", 1))
    expect(fails, "not on the cited page")


@test("7 a 21-word quotation")
def t7():
    quote = ("one two three four five six seven eight nine ten eleven twelve thirteen fourteen "
             "fifteen sixteen seventeen eighteen nineteen twenty one")
    fails = fails_of("card", "P01",
                     CARD.replace("Broad system, slow history, low research, high income.",
                                  f'"{quote}" (p. 440)'))
    expect(fails, "max 20")


@test("8 13 words copied from page 431")
def t08():
    run = words_from("P01", 431, 60, 13)
    fails = fails_of("card", "P01", CARD.replace("## Hook", f"- {run} (p. 431)\n\n## Hook", 1))
    expect(fails, "copies words")


@test("9 a P02 card with a quotation mark")
def t09():
    fails = fails_of("card", "P02",
                     P02.replace("and answers with a relational view.", 'and answers "relationally".', 1))
    expect(fails, "not for quotation")


@test("10 7 words copied from Paper 2, PDF page 2")
def t10():
    run = words_from("P02", 2, 40, 7)
    fails = fails_of("card", "P02", P02.replace("## Hook", f"- {run} (PDF p. 2)\n\n## Hook", 1))
    expect(fails, "copies words")


@test("11 Class 7 does not exist")
def t11():
    fails = fails_of("card", "P01", CARD.replace("(p. 440)", "(p. 440) [Class 7, slide 1]", 1))
    expect(fails, "no Class 7")


@test("12 Class 4 has 24 slides")
def t12():
    fails = fails_of("card", "P01", CARD.replace("(p. 440)", "(p. 440) [Class 4, slide 30]", 1))
    expect(fails, "24 slides")


@test("13 Class 9, slide 25 passes")
def t13():
    clean(fails_of("card", "P01", CARD.replace("(p. 440)", "(p. 440) [Class 9, slide 25]", 1)))


@test("14 a pronoun in a bullet")
def t14():
    fails = fails_of("card", "P01",
                     CARD.replace("- Norwegian firms cooperate", "- She finds that Norwegian firms cooperate", 1))
    expect(fails, "pronoun")


@test("15 Dec 2025 Q1 is not a past question")
def t15():
    fails = fails_of("card", "P01", CARD.replace("Dec 2024 Q1:", "Dec 2025 Q1:", 1))
    expect(fails, "exam id")


@test("16 a 40-word concept bullet")
def t16():
    long = ("all learning and innovation activity across an economy, not only laboratories and "
            "universities, and also the many firms that learn by doing, by using, and by interacting "
            "with customers, suppliers and public agencies over long periods of time")
    fails = fails_of("card", "P01", CARD.replace(
        "all learning and innovation across an economy, not only laboratories and universities.", long, 1))
    expect(fails, "max 34")


@test("17 a 345-word card")
def t17():
    filler = ("broad system and slow history and low research and high income " * 8
              + "broad system and slow history and low research")
    fails = fails_of("card", "P01", CARD.replace(
        "Broad system, slow history, low research, high income.", filler))
    expect(fails, "max 330")


@test("18 a theme with one sourced Norway example")
def t18():
    fails = fails_of("theme", "TH6", THEME.replace(
        "- **Maritime batteries**: Norwegian firms built a new path around electrified shipping. "
        "(Njøs et al. 2020, p. 276)\n", ""))
    expect(fails, "named examples with a source")


@test("19 an illustrative example with a year")
def t19():
    fails = fails_of("theme", "TH6", THEME.replace(
        "- **Maritime batteries**: Norwegian firms built a new path around electrified shipping. "
        "(Njøs et al. 2020, p. 276)",
        "- Illustrative example (ours): a firm from 2019 found no buyers.", 1))
    expect(fails, "no digits")


@test("20 a definition without the Norwegian term")
def t20():
    fails = fails_of("theme", "TH6", THEME.replace("**Function** (*funksjon*):", "**Function**:", 1))
    expect(fails, "**term**")


@test("21 an answer template without Mini-conclusion")
def t21():
    fails = fails_of("theme", "TH6", THEME.replace("- **Mini-conclusion:**", "- **Conclusion:**", 1))
    expect(fails, "four bullets")


@test("22 a brand name in a card")
def t22():
    fails = fails_of("card", "P01", CARD.replace("## Hook", "Claude wrote this line.\n\n## Hook", 1))
    expect(fails, "must not appear")


@test("23 a secret in a temp file")
def t23():
    with temp_dir() as tmp:
        (pathlib.Path(tmp) / "note.md").write_text(
            "OPENROUTER_" + "API_KEY=" + "sk-" + "or-v1-" + "a" * 40, encoding="utf-8")
        problems = scan(tmp)
    assert problems, "the scan found no problem"


@test("24 a stray pptx in a temp folder")
def t24():
    with temp_dir() as tmp:
        (pathlib.Path(tmp) / "x.pptx").write_bytes(b"x")
        problems = scan(tmp)
    assert problems, "the scan found no problem"


# ---------------------------------------------------------------- the listening checks (plan 6.5)

LESSON = """# Revision 7: Technological innovation systems and their functions
<!-- lecture: R07 | session: Revision | lecturer: none | deck: none -->
<!-- voices: themes/TH6.md, cards/P09.md, cards/P10.md, cards/P17.md -->

## 1. The theme in one minute
<!-- readings: Hekkert et al. 2007 -->

A technological innovation system is the set of actors and rules around one technology. Hekkert and colleagues list seven functions. In Norway, Steen and colleagues studied carbon capture in 2024.

Remember: one technology, seven functions, one system.

<!-- check: What is a technological innovation system? | The actors and rules around one technology. -->

## 2. The key ideas
<!-- readings: Steen et al. 2024, p. 4 -->

The functions show where a system is strong or weak. Steen and colleagues found that materialization stayed weak.

Remember: the weak function is the place to act.

<!-- check: Which function stayed weak? | Materialization. -->
"""

FAKE_VOICES = {
    "themes/TH6.md": "A technological innovation system is the actors and rules around one technology. Materialization is one function.",
    "cards/P09.md": "Hekkert and colleagues list seven functions in their own words.",
    "cards/P10.md": "Steen and colleagues studied carbon capture in Norway in 2024.",
    "cards/P17.md": "Njos wrote about path creation in a region.",
}


def fake_root():
    return tempfile.TemporaryDirectory(dir=str(PREVIEWS))


def make_voices(root):
    root = pathlib.Path(root)
    for rel, text in FAKE_VOICES.items():
        f = root / rel
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(text, encoding="utf-8")


def listen(text, root):
    fails, _ = check_text("listen", "listen/R07.md", text, root=root, partial=True)
    return fails


@test("25 a two-chapter R07 lesson passes")
def t25():
    with fake_root() as tmp:
        make_voices(tmp)
        clean(listen(LESSON, tmp))


@test("26 a number no voices file has")
def t26():
    with fake_root() as tmp:
        make_voices(tmp)
        expect(listen(LESSON.replace("in 2024", "in 1999"), tmp), "not in the voices files")


@test("27 page 421 spoken in the prose")
def t27():
    with fake_root() as tmp:
        make_voices(tmp)
        expect(listen(LESSON.replace("The functions show", "See page 421. The functions show"), tmp),
               "speaks a page reference")


@test("28 a bullet line in the prose")
def t28():
    with fake_root() as tmp:
        make_voices(tmp)
        expect(listen(LESSON.replace("The functions show", "- Seven functions\n\nThe functions show"), tmp),
               "starts like a heading or a bullet")


@test("29 a chapter with no Remember paragraph")
def t29():
    with fake_root() as tmp:
        make_voices(tmp)
        expect(listen(LESSON.replace("Remember: the weak function is the place to act.", ""), tmp),
               "Remember:")


@test("30 a 50-word sentence")
def t30():
    long_sentence = ("the system is strong when the functions work together and the actors keep the rules "
                     "in place and the technology spreads through the network over time and the market forms "
                     "and the resources move and the search is guided and the work is seen as legitimate by "
                     "the people in the place where it happens")
    with fake_root() as tmp:
        make_voices(tmp)
        expect(listen(LESSON.replace("The functions show", long_sentence + ". The functions show"), tmp),
               "a sentence has")


@test("31 a readings line with the wrong year")
def t31():
    with fake_root() as tmp:
        make_voices(tmp)
        expect(listen(LESSON.replace("<!-- readings: Steen et al. 2024, p. 4 -->",
                                     "<!-- readings: Spigel & Harrison 2017, p. 152 -->"), tmp),
               "is not a course paper")


@test("32 the site manifest catches a changed file")
def t32():
    import contextlib
    import io
    with fake_root() as tmp:
        site = pathlib.Path(tmp) / "site"
        (site / "data").mkdir(parents=True)
        (site / "audio").mkdir()
        f = site / "data" / "T1.json"
        f.write_text("{}", encoding="utf-8")
        (site / "audio" / "T1-01.mp3").write_bytes(b"x")
        book = pathlib.Path(tmp) / "site-before.txt"
        with contextlib.redirect_stdout(io.StringIO()):
            site_manifest("write", root=site, book_path=book)
        f.write_text('{"changed": 1}', encoding="utf-8")
        problems = site_manifest("check", root=site, book_path=book)
    assert problems, "the manifest did not notice the change"


@test("33 a secret in the staged diff")
def t33():
    diff = ["OPENROUTER_" + "API_KEY=" + "sk-" + "or-v1-" + "a" * 40]
    assert scan(CS, diff=diff), "the scan missed the key"


@test("34 a test key in the staged diff is no problem")
def t34():
    assert not scan(CS, diff=["OPENROUTER_API_KEY: 'test-key'"]), "the scan flagged a test key"


# ---------------------------------------------------------------- worked answers (plan 6.3, tests 35-48)

Q2 = EXAM["Dec 2024 Q2"].replace('"', "")


def r12_voices(root):
    root = pathlib.Path(root)
    for rel in REVISION["R12"]["voices"]:
        f = root / rel
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text("agency can promote or inhibit sustainable transformation. Use examples.", encoding="utf-8")


def r12_chapter(n, title, prose):
    return f"""## {n}. {title}
<!-- readings: Class 9, slide 39 -->

{prose}

Remember: learn the move and use your own words.

<!-- check: What does this part do? | It teaches the move. -->
"""


def r12_text(n_chapters=2, chapter1=None, extra=""):
    rev = REVISION["R12"]
    head = (f"# Revision {rev['num']}: {rev['title']}\n"
            "<!-- lecture: R12 | session: Revision | lecturer: none | deck: none -->\n"
            f"<!-- voices: {', '.join(rev['voices'])} -->\n\n")
    titles = rev["chapters"]
    bodies = []
    for i, title in enumerate(titles[:n_chapters], 1):
        if i == 1:
            prose = chapter1 if chapter1 is not None else (
                f"{Q2} The command asks for both sides.")
        elif i == n_chapters and n_chapters == len(titles):
            prose = extra or (
                "Name the thesis.\n"
                "Pause the audio and answer in your head.\n\n"
                "Here is the answer. Agency can help or hold back.\n\n"
                "Name one way agency helps.\n"
                "Pause the audio and answer in your head.\n\n"
                "Here is the answer. Actors can open a new path.\n\n"
                "Name one way agency holds back.\n"
                "Pause the audio and answer in your head.\n\n"
                "Here is the answer. Actors can defend the old path.\n\n"
                "Say your whole plan aloud in under one minute.\n"
                "Pause the audio and answer in your head.\n\n"
                "Here is the answer. Thesis, both sides, then the case.")
        else:
            prose = "This part sets up the next move of the answer."
        bodies.append(r12_chapter(i, title, prose))
    return head + "\n".join(bodies)


def r12_fails(text, root):
    fails, _ = check_text("listen", "listen/R12.md", text, root=root, partial=True)
    return fails


def audit_rows(q, n, **over):
    lines = []
    for i in range(1, n + 1):
        verdict = over.get("verdict", "Confirmed") if i == 1 else "Confirmed"
        source = over.get("source", "(Fagerberg et al. 2009, p. 431)") if i == 1 else "(Fagerberg et al. 2009, p. 431)"
        claim = "Actors learn across the economy."
        lines.append(f"| {q}.{i} | {claim} | 3 | {verdict} | {source} | Kept to the course page. |")
    return "\n".join(lines)


def audit_text(q2=10, **over):
    def section(q, n):
        return f"## Question {q}\n{AUDIT_HEAD}\n|---|---|---|---|---|---|\n{audit_rows(q, n, **(over if q == 1 else {}))}\n"
    return f"""# Audit: model answers to the December 2024 exam
<!-- audit: Dec 2024 | model: INN514_2024_Model_Exam_Resolution.pdf | pages: 3-14 -->

{AUDIT_INTRO}

{section(1, 10)}
{section(2, q2)}
{section(3, 10)}
"""


AUDIT_HEAD = "| # | Claim in the model answer (paraphrased) | Model p. | Verdict | Course source | Note |"
AUDIT_INTRO = ("A study document, not an official marking guide. Each claim is paraphrased and "
               "checked against the course sources; only Confirmed and Corrected rows may be voiced.")


def one_plan(question=None):
    q = EXAM["Dec 2024 Q1"] if question is None else question
    return f"""# Answer plans for the six past questions
<!-- back: answer-plans -->
Drafting aid (ours): learn the moves, then write your own words. Each plan is voiced as a worked answer on the companion site (Revision 11 to 16).

## December 2024, Question 1
**Question:** {q}
- **Thesis:** Four course definitions, each with a source.
- **Moves:** 1. Name the system (Fagerberg et al. 2009, p. 431) 2. Name the change (Schlaile et al. 2017, p. 4) 3. Name agency (Bækkelund 2021, p. 761) 4. Name the rules (Fagerberg et al. 2009, p. 433)
- **Example:** Domestic suppliers grew with petroleum (Fagerberg et al. 2009, p. 434).
- **Trap:** Prefer the course page when a model differs.
"""


@test("35 a two-chapter R12 with partial passes")
def t35():
    with fake_root() as tmp:
        r12_voices(tmp)
        clean(r12_fails(r12_text(2), tmp))


@test("36 R12 chapter 1 without the exam question")
def t36():
    with fake_root() as tmp:
        r12_voices(tmp)
        text = r12_text(2, chapter1="The command asks for both sides only.")
        expect(r12_fails(text, tmp), "does not contain the exam question")


@test("37 two One way to say it lines in one chapter")
def t37():
    with fake_root() as tmp:
        r12_voices(tmp)
        text = r12_text(2, extra="")
        text = text.replace(
            "This part sets up the next move of the answer.",
            "One way to say it: By agency, I understand directed work.\n\n"
            "One way to say it: By agency, I understand a choice.",
            1)
        expect(r12_fails(text, tmp), "One way to say it")


@test("38 an eight-word run from the December model page 7")
def t38():
    run = " ".join(qnorm(model_pages("Dec 2024")[7]).split()[:8])
    with fake_root() as tmp:
        r12_voices(tmp)
        text = r12_text(2, chapter1=f"{Q2} {run}.")
        expect(r12_fails(text, tmp), "modelcopy")


@test("39 Build it yourself with 3 pauses")
def t39():
    short = (
        "Name the thesis.\nPause the audio and answer in your head.\n\n"
        "Here is the answer. Agency can help or hold back.\n\n"
        "Name one way agency helps.\nPause the audio and answer in your head.\n\n"
        "Here is the answer. Actors can open a new path.\n\n"
        "Say your whole plan aloud in under one minute.\n"
        "Pause the audio and answer in your head.\n\n"
        "Here is the answer. Thesis, both sides, then the case.")
    with fake_root() as tmp:
        r12_voices(tmp)
        expect(r12_fails(r12_text(10, extra=short), tmp), "need 4-6")


@test("40 Build it yourself whose last prompt is not the whole plan")
def t40():
    wrong = (
        "Name the thesis.\nPause the audio and answer in your head.\n\n"
        "Here is the answer. Agency can help or hold back.\n\n"
        "Name one way agency helps.\nPause the audio and answer in your head.\n\n"
        "Here is the answer. Actors can open a new path.\n\n"
        "Name one way agency holds back.\nPause the audio and answer in your head.\n\n"
        "Here is the answer. Actors can defend the old path.\n\n"
        "Say a different closing line here.\n"
        "Pause the audio and answer in your head.\n\n"
        "Here is the answer. Thesis, both sides, then the case.")
    with fake_root() as tmp:
        r12_voices(tmp)
        expect(r12_fails(r12_text(10, extra=wrong), tmp), "last prompt")


@test("41 Grok in a lesson")
def t41():
    with fake_root() as tmp:
        r12_voices(tmp)
        expect(r12_fails(r12_text(2) + "\nGrok\n", tmp), "Grok")


@test("42 a memory aid of our own with a digit")
def t42():
    with fake_root() as tmp:
        r12_voices(tmp)
        text = r12_text(2).replace(
            "This part sets up the next move of the answer.",
            "A memory aid of our own: 7 steps.",
            1)
        expect(r12_fails(text, tmp), "memory aid")


@test("43 an audit row with verdict Maybe")
def t43():
    fails, _ = check_text("audit", "answers/AUDIT_DEC2024.md", audit_text(verdict="Maybe"))
    expect(fails, "Maybe")


@test("44 a Confirmed audit row with source none")
def t44():
    fails, _ = check_text("audit", "answers/AUDIT_DEC2024.md", audit_text(source="none"))
    expect(fails, "source is none")


@test("45 an audit row citing a page that is not citable")
def t45():
    fails, _ = check_text("audit", "answers/AUDIT_DEC2024.md",
                          audit_text(source="(Fagerberg et al. 2009, p. 999)"))
    expect(fails, "999")


@test("46 an audit with 9 rows under Question 2")
def t46():
    fails, _ = check_text("audit", "answers/AUDIT_DEC2024.md", audit_text(q2=9))
    expect(fails, "Question 2 has 9 rows")


@test("47 a plans section whose question differs from the exam")
def t47():
    fails, _ = check_text("plans", "answers/PLANS.md", one_plan("What do you understand by a boat?"),
                          partial=True)
    expect(fails, "differs from the exam paper")


@test("48 a correct one-section plans file, partial")
def t48():
    fails, _ = check_text("plans", "answers/PLANS.md", one_plan(), partial=True)
    clean(fails)


# ---------------------------------------------------------------- runner

def main():
    sys.stdout.reconfigure(encoding="utf-8")
    bad = 0
    for name, fn in TESTS:
        try:
            fn()
        except AssertionError as exc:
            bad += 1
            print(f"FAIL {name}: {exc}")
        else:
            print(f"ok {name}")
    if bad:
        print(f"CHECKER TESTS FAILED: {bad} of {len(TESTS)}")
        return 1
    print(f"ALL CHECKER TESTS PASSED ({len(TESTS)} tests)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
