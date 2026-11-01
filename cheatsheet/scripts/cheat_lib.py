"""Shared facts for the INN514 cheatsheet: papers, classes, themes, exam questions, page text."""
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent          # .../cheatsheet/scripts
CS = HERE.parent                                        # workspace/lecture-audio/cheatsheet
LA = CS.parent                                          # workspace/lecture-audio (the git repo)
REPO = LA.parents[1]                                    # D:/HVL2025/514
PREVIEWS = REPO / "workspace" / "cheatsheet_previews"   # outside the repo, never committed
sys.path.insert(0, str(LA / "scripts"))
from reading_lib import ORDER, READINGS, page_table     # noqa: E402
from check_reading import qnorm, quoted_on, quotes_in   # noqa: E402

# 3.2: the cite used for each paper (author and the year of its reading).
CITES = {
    "P01": "Fagerberg et al. 2009",
    "P02": "Fløysand et al. 2013",
    "P03": "Fløysand et al. 2022",
    "P04": "Schlaile et al. 2017",
    "P05": "Fløysand & Jakobsen 2016",
    "P06": "Spigel & Harrison 2018",
    "P07": "Stam & van de Ven 2021",
    "P08": "Autio et al. 2014",
    "P09": "Hekkert et al. 2007",
    "P10": "Steen et al. 2024",
    "P11": "Bargoni et al. 2024",
    "P12": "Demattos Guimarães et al. 2024",
    "P13": "Quero & Ventura 2019",
    "P14": "Bækkelund 2021",
    "P15": "Garud & Karnøe 2003",
    "P16": "Miörner & Trippl 2017",
    "P17": "Njøs et al. 2020",
}
# 6.1: full-author forms that a card title or a narrative mention may use.
CITE_VARIANTS = {"Fagerberg, Mowery & Verspagen 2009": "P01", "Fløysand, Jakobsen & Hidle 2013": "P02",
                 "Demattos Guimarães, Maehle & Bonet 2024": "P12", "Stam & Van de Ven 2021": "P07"}
CITE_TO_PID = {v: k for k, v in CITES.items()} | CITE_VARIANTS
SURNAME_PAPERS = {"Fagerberg": ["P01"], "Fløysand": ["P02", "P03", "P05"], "Schlaile": ["P04"],
                  "Spigel": ["P06"], "Stam": ["P07"], "Autio": ["P08"], "Hekkert": ["P09"], "Steen": ["P10"],
                  "Bargoni": ["P11"], "Demattos Guimarães": ["P12"], "Quero": ["P13"], "Bækkelund": ["P14"],
                  "Garud": ["P15"], "Miörner": ["P16"], "Njøs": ["P17"]}
MISSPELT = {"Spiegel": "Spigel", "Miorner": "Miörner", "Grarud": "Garud", "Karneø": "Karnøe",
            "Karnoe": "Karnøe", "Njos": "Njøs", "Baekkelund": "Bækkelund", "Floysand": "Fløysand",
            "Guimaraes": "Guimarães"}

# 3.1: class id -> (lecture file, slides in the deck, title, teacher).
CLASSES = {
    "1": ("T1", 41, "Innovation as systemic and sustainable transformation", "Arnt Fløysand"),
    "2": ("T2", 44, "Regional innovation systems and sustainable transformation", "Arnt Fløysand"),
    "3": ("T3", 34, "Institutional work in the regional innovation systems of Hordaland and Rogaland",
          "Arnt Fløysand"),
    "4": ("T4", 24, "Entrepreneurial ecosystems and sustainable transformation", "Nora Geirsdotter Bækkelund"),
    "5": ("T5", 22, "Agency and changing innovation systems", "Nora Geirsdotter Bækkelund"),
    "6": ("T6", 43, "Technological innovation systems", "Rune Njøs (guest lecture, H2025)"),
    "9": ("T8", 43, "Summary and exam preparation", "Arnt Fløysand"),
    "Bonus": ("B1", 50, "The art of crowdfunding", "Alice Demattos Guimarães"),
}
LECTURE_CLASS = {v[0]: k for k, v in CLASSES.items()}  # "T8" -> "9"

# 3.2: each card's class field and its themes, in table order.
CARD_CLASS = {"P01": "1", "P02": "1", "P03": "2, 3", "P04": "1, 2, 9", "P05": "2",
              "P06": "4", "P07": "4", "P08": "4", "P09": "6", "P10": "6",
              "P11": "Bonus", "P12": "Bonus", "P13": "Bonus", "P14": "5", "P15": "5",
              "P16": "5", "P17": "9"}
CARD_THEMES = {"P01": ["TH1", "TH3"], "P02": ["TH1"], "P03": ["TH2", "TH3", "TH7"], "P04": ["TH7"],
               "P05": ["TH2"], "P06": ["TH4"], "P07": ["TH4"], "P08": ["TH4"], "P14": ["TH5"],
               "P15": ["TH5"], "P16": ["TH5"], "P09": ["TH6"], "P10": ["TH6"], "P17": ["TH5", "TH6"],
               "P11": ["TH8"], "P12": ["TH8"], "P13": ["TH8"]}

# 3.3: theme -> (title, papers, classes, the id its answer template is written for).
# The 3.3 cells for TH4, TH1, TH3 and TH8 carry a label or a clarifier after the id;
# the id itself is what the answer-template comment names, and the label is written
# in the theme's exam-angle bullet as 4.1 asks.
THEMES = {
    "TH1": ("Innovation systems and Norway's national innovation system", ["P01", "P02"], ["1", "9"],
            "Dec 2024 Q1"),
    "TH2": ("Regional innovation systems and industrial restructuring", ["P03", "P05"], ["2", "9"],
            "Jun 2025 Q2"),
    "TH3": ("Institutions and institutional work", ["P03", "P01"], ["3", "9"], "Jun 2025 Q1"),
    "TH4": ("Entrepreneurial ecosystems", ["P06", "P07", "P08"], ["4", "9"], "Practice"),
    "TH5": ("Agency and new path development", ["P14", "P15", "P16", "P17"], ["5", "9"], "Dec 2024 Q2"),
    "TH6": ("Technological innovation systems and their functions", ["P09", "P10", "P17"], ["6", "9"],
            "Jun 2025 Q3"),
    "TH7": ("Sustainability, transformation and normative direction", ["P04", "P03"], ["1", "2", "9"],
            "Dec 2024 Q3"),
    "TH8": ("Crowdfunding and service ecosystems", ["P11", "P12", "P13"], ["Bonus"], "Dec 2024 Q2"),
}

# 3.4: the six exam questions, word for word from the exam papers.
EXAM = {
    "Dec 2024 Q1": "What do you understand by innovation system? What do you understand by sustainable "
                   "transformation? What do you understand by \"agency\"? What do you understand by "
                   "\"institutions\"?",
    "Dec 2024 Q2": "How can \"agency\" in innovation systems promote or inhibit sustainable transformation? "
                   "Use examples.",
    "Dec 2024 Q3": "How can technologies in innovation systems promote or inhibit sustainable transformation? "
                   "Use examples.",
    "Jun 2025 Q1": "What do you understand by a regional innovation system? What do you understand by "
                   "institutional work? What do you understand by sustainability?",
    "Jun 2025 Q2": "In what way can a regional innovation system promote or inhibit industrial restructuring? "
                   "Use examples.",
    "Jun 2025 Q3": "How can technological innovation systems be guided to promote sustainable transformation? "
                   "Use examples.",
}
EXAM_PAPERS = {"Dec 2024": "exam paper, 4 December 2024", "Jun 2025": "exam paper, 13 June 2025"}

# 4.2-4.6: the exact section headings of each kind of file.
SECTIONS = {
    "card": ["In one line", "Key concepts", "Model", "Findings", "Norway link", "Exam use", "Limits", "Hook"],
    "theme": ["Core definitions", "Key models and figures", "Exam angles", "Norway examples",
              "Answer template", "Links"],
    "front": ["The exam", "Past exam questions", "Compare the systems", "Must-know definitions",
              "How to answer", "Promote or inhibit"],
    "glossary": ["Terms"],
    "sources": ["Readings", "Classes", "Exam papers"],
}

_PAGES = {}


def pages(pid):
    """{label: (kind, text)}; labels are printed pages (ints), PDF pages for P02, or 'cover'."""
    if pid not in _PAGES:
        _PAGES[pid] = {r["label"]: (r["kind"], r["text"]) for r in page_table(pid)}
    return _PAGES[pid]


def citable(pid, label):
    return pages(pid).get(label, (None, ""))[0] in ("article", "mixed")


def page_range(pid):
    """'431-444': the first and last printed page labels (3.2), a cover left out."""
    labels = [lab for lab in pages(pid) if isinstance(lab, int)]
    return f"{min(labels)}-{max(labels)}"


def class_slides(cid):
    """Slide numbers covered by the reviewed class file (its <!-- slides: --> lines)."""
    text = (LA / "lectures" / f"{CLASSES[cid][0]}.md").read_text(encoding="utf-8")
    nums = set()
    for spec in re.findall(r"<!--\s*slides:\s*([^>]*?)\s*-->", text):
        nums |= {int(n) for n in re.findall(r"\d+", spec)}
    return nums


def numbers(spec):
    """'433' -> [433]; '431–434' -> [431..434]; '14, 15, 19' -> [14, 15, 19]."""
    out = []
    for part in spec.replace(" ", "").split(","):
        if part:
            a, _, b = part.replace("–", "-").partition("-")
            out += list(range(int(a), int(b or a) + 1))
    return out


WORD = re.compile(r"[0-9A-Za-zÀ-ÖØ-öø-ÿ]+(?:['’-][0-9A-Za-zÀ-ÖØ-öø-ÿ]+)*")


def words(text):
    return len(WORD.findall(re.sub(r"<!--.*?-->", "", text, flags=re.S)))


_GRAMS = {}


def copied(prose, pid):
    """Runs of 12 words (7 for P02) copied from the paper, outside quotation marks; title words excepted."""
    n = 7 if pid == "P02" else 12
    if (pid, n) not in _GRAMS:
        w = qnorm("\n".join(t for _, t in pages(pid).values())).split()
        _GRAMS[(pid, n)] = {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)}
    title = f" {qnorm(READINGS[pid][2])} "
    w = qnorm(re.sub(r"[\"“«][^\"”»]*[\"”»]", " ", prose)).split()
    runs = (" ".join(w[i:i + n]) for i in range(len(w) - n + 1))
    return [r for r in runs if r in _GRAMS[(pid, n)] and f" {r} " not in title]
