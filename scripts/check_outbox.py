"""Read-only checker for the Grokbot watch test (Part C).

    C:/Python313/python.exe workspace/lecture-audio/scripts/check_outbox.py --pull --since 20261024T0900Z
    C:/Python313/python.exe workspace/lecture-audio/scripts/check_outbox.py --ids a1b2c3 --hub <path>

Matches each reply in outbox/<id>.json to its question through inbox/*-<id>.json and the
tests in checks/grokbot_tests.json, then checks status, source, Spanish, length and the
out-of-scope wording. Never writes anything; --pull (only Claude Code or the student)
runs git pull in the hub first.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

HUB = Path("D:/Proyectos/watch/grok-watch-hub")
TESTS = Path(__file__).resolve().parent.parent / "checks" / "grokbot_tests.json"
STOPWORDS = {"el", "la", "los", "las", "de", "del", "que", "es", "y", "en", "un", "una", "por",
             "con", "para", "se", "su", "al", "como", "más", "este", "esta", "son", "hace"}
NOT_COVERED = ("no cubre", "no aparece", "no trata", "no está")


def scrub(text):
    """Never print tokens or remote URLs that contain credentials."""
    return re.sub(r"(https?://)[^/\s@]+@", r"\1[redacted]@", text)


def norm(s):
    s = s.lower().replace("´", "").replace("`", "")
    s = re.sub(r"[¿?¡!.,;:()\[\]\"“”«»]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def stamp(s):
    """'2026-10-23T11:21:30Z' and '20261024T0900Z' both sort as YYYYMMDDTHHMMSS."""
    digits = re.sub(r"\D", "", s)
    return digits[:14].ljust(14, "0")


def core(test):
    """The question without its wake words, normalised."""
    say = norm(test["say"])
    return re.sub(r"^grok principal[\s,:]*", "", say)


def matches(text, test):
    text, want = norm(text), core(test)
    return want in text or " ".join(want.split()[:5]) in text


def source_ok(speak, expected):
    speak = speak.lower()
    if "class" in expected:
        return f"clase {expected['class']}" in speak and f"capítulo {expected['chapter']}" in speak
    if "paper" in expected:
        ok = f"paper {expected['paper']}" in speak
        if "page" in expected:
            return ok and str(expected["page"]) in speak
        return ok and f"capítulo {expected['chapter']}" in speak
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pull", action="store_true")
    ap.add_argument("--ids", nargs="+")
    ap.add_argument("--since")
    ap.add_argument("--hub")
    args = ap.parse_args()
    hub = Path(args.hub) if args.hub else HUB

    if args.pull:
        pulled = subprocess.run(["git", "pull"], cwd=str(hub), capture_output=True, text=True)
        print(scrub(pulled.stdout + pulled.stderr).strip())

    tests = json.loads(TESTS.read_text(encoding="utf-8"))
    inbox = {}
    for file in sorted((hub / "inbox").glob("*.json")):
        try:
            message = json.loads(file.read_text(encoding="utf-8"))
            inbox[message.get("id", file.stem)] = message.get("text", "")
        except (ValueError, OSError) as e:
            print(f"SKIP inbox/{file.name}: {e}")
    replies = sorted((hub / "outbox").glob("*.json"))
    if args.ids:
        replies = [f for f in replies if f.stem in args.ids]
    if not replies:
        print("no replies to check")
        return

    failures = 0
    for file in replies:
        try:
            reply = json.loads(file.read_text(encoding="utf-8"))
        except ValueError as e:
            print(f"FAIL {file.stem}: unreadable reply ({e})")
            failures += 1
            continue
        if args.since and stamp(reply.get("ts", file.stem)) < stamp(args.since):
            continue
        rid = reply.get("id", file.stem)
        text = inbox.get(rid, "")
        test = next((t for t in tests if text and matches(text, t)), None)
        print(f"--- reply {rid}" + (f" ({test['id']})" if test else " (no matching question)"))
        if not test:
            print(f"FAIL {rid}: no matching question in grokbot_tests.json")
            print(f"said: {reply.get('speak', '')}")
            failures += 1
            continue
        speak = reply.get("speak", "")
        speak_lower = speak.lower()
        checks = [
            ("status is done", reply.get("status") == "done"),
            ("names the expected source", source_ok(speak, test.get("expected", {}))),
            ("is in Spanish", len({w for w in STOPWORDS if re.search(r"\b" + w + r"\b", speak_lower)}) >= 2),
            ("is 8 sentences or fewer",
             len([s for s in re.split(r"[.!?]+", speak) if s.strip()]) <= 8),
        ]
        if test.get("expect_not_covered"):
            checks.append(("says the course does not cover it", any(nc in speak_lower for nc in NOT_COVERED)))
        for name, ok in checks:
            print(("PASS " if ok else "FAIL ") + name)
            if not ok:
                failures += 1
        print(f"said: {speak}")
    print(f"{failures} failed" if failures else "ALL REPLY CHECKS PASSED")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
