"""Make the Canner copy from the built claude.ai page, without touching it.

    C:/Python313/python.exe workspace/lecture-audio/scripts/build_static.py

Reads site/index.html (the fragment build_site.py writes), points every audio path at
site/audio/ and writes index.html at the repo root, wrapped in a minimal document with a
noindex meta. Checked before writing: every audio path in the new DATA exists on disk,
the doctype and the robots meta are present, and the text "unofficial study aid" is absent.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
START = (
    "<!doctype html>\r\n"
    '<html lang="en"><head><meta charset="utf-8">\r\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\r\n'
    '<meta name="robots" content="noindex, nofollow">\r\n'
)


def fail(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


def main():
    with open(ROOT / "site/index.html", encoding="utf-8", newline="") as f:
        fragment = f.read()
    page = START + fragment.replace('"audio": "audio/', '"audio": "site/audio/') + "</html>"

    audio = re.findall(r'"audio": "site/audio/([^"]+)"', page)
    if not audio:  # the replace above found nothing: the data's spacing changed
        fail('no "audio": "site/audio/..." paths in the data')
    missing = [p for p in audio if not (ROOT / "site/audio" / p).exists()]
    if missing:
        fail(f"{len(missing)} audio paths do not exist, first: site/audio/{missing[0]}")
    if not page.startswith("<!doctype html>") or '<meta name="robots" content="noindex, nofollow">' not in page:
        fail("doctype or robots meta missing")
    if "unofficial study aid" in page:
        fail('the text "unofficial study aid" is present')

    with open(ROOT / "index.html", "w", encoding="utf-8", newline="") as f:
        f.write(page)
    print(f"index.html: {(ROOT / 'index.html').stat().st_size // 1024} KB, {len(audio)} audio files under site/audio/")


if __name__ == "__main__":
    main()
