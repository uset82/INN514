"""Turn lecture and reading summaries into chapter audio and site data.

    C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py T1 [T2 ...]
    C:/Python313/python.exe workspace/lecture-audio/scripts/build_audio.py P01 [P14 ...]

Readings (P01-P17) come from readings/<id>.md through reading_lib.audio_lecture(): each
'### Page N' summary is one paragraph, read aloud as "Page N." followed by the summary.

Reads lectures/<id>.md (chapters as '## N. Title', with <!-- slides -->,
<!-- readings --> and <!-- check: question | answer --> comments), then for each
chapter:
  1. builds the spoken script (title + prose, comments removed);
  2. synthesises it with edge-tts (en-GB-RyanNeural, -8%), cached by sha256 of
     voice|rate|pitch|text, three attempts, files under 2 KB discarded;
  3. normalises loudness to -20 LUFS and encodes mono 48 kbit/s MP3 for phones;
  4. checks the file decodes, measures duration and loudness, and checks the
     speaking rate is plausible (105-175 words per minute).
Writes site/audio/<id>-NN.mp3 and site/data/<id>.json, and prints a report.
Voice settings, caching and checks follow workspace/audio/fagerberg2009/scripts/04_audio.py.
Note: edge-tts sends the script text to Microsoft's online speech service.
"""
import asyncio
import hashlib
import json
import os
import pathlib
import re
import subprocess
import sys

import edge_tts

ROOT = pathlib.Path(__file__).resolve().parents[1]
LECTURES = ROOT / "lectures"
# COMPANION_SITE may point at a scratch copy of site/ for testing on a fixture.
SITE = pathlib.Path(os.environ.get("COMPANION_SITE", ROOT / "site"))
CACHE = ROOT / "cache"
FFBIN = pathlib.Path(r"C:\Users\carlos\AppData\Local\Microsoft\WinGet\Packages"
                     r"\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin")
FFMPEG, FFPROBE = str(FFBIN / "ffmpeg.exe"), str(FFBIN / "ffprobe.exe")

VOICE, RATE, PITCH = "en-GB-RyanNeural", "-8%", "+0Hz"
MIN_BYTES = 2 * 1024
LOUDNESS_TARGET, LOUDNESS_RANGE = -20.0, (-22.0, -18.5)
WPM_RANGE = (105.0, 175.0)


def parse(lecture_id):
    if re.fullmatch(r"P\d\d", lecture_id):
        from reading_lib import audio_lecture
        return audio_lecture(lecture_id)
    text = (LECTURES / f"{lecture_id}.md").read_text(encoding="utf-8")
    title = re.search(r"^# (.+)$", text, re.M).group(1).strip()
    meta = re.search(r"<!--\s*lecture:(.*?)-->", text, re.S).group(1)
    info = dict(p.split(":", 1) for p in [x.strip() for x in ("lecture:" + meta).split("|")] if ":" in p)
    chapters = []
    for n, block in enumerate(re.split(r"^## ", text, flags=re.M)[1:], 1):
        head, body = block.split("\n", 1)
        slides = re.search(r"<!--\s*slides:\s*(.*?)\s*-->", body)
        readings = re.search(r"<!--\s*readings:\s*(.*?)\s*-->", body)
        checks = [{"q": q.strip(), "a": a.strip()}
                  for q, a in re.findall(r"<!--\s*check:\s*(.*?)\s*\|\s*(.*?)\s*-->", body, re.S)]
        prose = re.sub(r"<!--.*?-->", "", body, flags=re.S)
        paras = [re.sub(r"\s+", " ", p).strip() for p in re.split(r"\n\s*\n", prose)]
        paras = [p for p in paras if p]
        chapters.append({
            "n": n,
            "title": re.sub(r"^\d+\.\s*", "", head.strip()),
            "slides": [int(s) for s in re.findall(r"\d+", slides.group(1))] if slides else [],
            "readings": readings.group(1) if readings else "",
            "paragraphs": paras,
            "checks": checks,
        })
    return {"id": lecture_id, "title": title,
            "session": info.get("session", "").strip(), "lecturer": info.get("lecturer", "").strip(),
            "deck": info.get("deck", "").strip(), "chapters": chapters}


def script(lecture, ch):
    # Readings speak each page summary as "Page N. ..."; lectures have no "spoken" list.
    return "\n\n".join([f"Chapter {ch['n']}. {ch['title']}."] + ch.get("spoken", ch["paragraphs"]))


async def synthesise(text):
    CACHE.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha256(f"{VOICE}|{RATE}|{PITCH}|{text}".encode("utf-8")).hexdigest()
    cached = CACHE / f"{key}.mp3"
    if cached.exists() and cached.stat().st_size >= MIN_BYTES:
        return cached, "cache"
    # The online service sometimes throttles (NoAudioReceived), especially when two agents
    # record at once, so wait longer between attempts: about 5, 10, 20, 40, 60 and 60 seconds.
    for attempt in range(1, 8):
        tmp = CACHE / f"{key}.tmp.mp3"
        try:
            await edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH).save(str(tmp))
            if tmp.exists() and tmp.stat().st_size >= MIN_BYTES:
                tmp.replace(cached)
                return cached, f"synthesised (attempt {attempt})"
            tmp.unlink(missing_ok=True)
        except Exception as exc:  # network hiccups and throttling: retry
            print(f"    attempt {attempt}: {exc!r}")
        if attempt < 7:
            await asyncio.sleep(min(60, 5 * 2 ** (attempt - 1)))
    raise RuntimeError("synthesis failed after seven attempts")


def encode(src, dst):
    subprocess.run([FFMPEG, "-y", "-hide_banner", "-loglevel", "error", "-i", str(src),
                    "-af", f"loudnorm=I={LOUDNESS_TARGET}:TP=-1.5:LRA=11",
                    "-ac", "1", "-ar", "24000", "-c:a", "libmp3lame", "-b:a", "48k", str(dst)], check=True)


def decodes(path):
    r = subprocess.run([FFMPEG, "-v", "error", "-i", str(path), "-f", "null", "-"], capture_output=True, text=True)
    return r.returncode == 0 and not r.stderr.strip()


def duration(path):
    r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def loudness(path):
    r = subprocess.run([FFMPEG, "-hide_banner", "-nostats", "-i", str(path),
                        "-af", "loudnorm=I=-20:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True, check=True)
    s = r.stderr
    return float(json.loads(s[s.rfind("{"): s.rfind("}") + 1])["input_i"])


async def build(lecture_id):
    lec = parse(lecture_id)
    (SITE / "audio").mkdir(parents=True, exist_ok=True)
    (SITE / "data").mkdir(parents=True, exist_ok=True)
    ok = True
    print(f"== {lecture_id}: {lec['title']} ({len(lec['chapters'])} chapters)")
    for ch in lec["chapters"]:
        text = script(lec, ch)
        raw, how = await synthesise(text)
        out = SITE / "audio" / f"{lecture_id}-{ch['n']:02d}.mp3"
        encode(raw, out)
        words = len(text.split())
        dur = duration(out)
        lufs = loudness(out)
        wpm = words / (dur / 60)
        good = decodes(out) and WPM_RANGE[0] <= wpm <= WPM_RANGE[1] and LOUDNESS_RANGE[0] <= lufs <= LOUDNESS_RANGE[1]
        ok &= good
        ch.update({"audio": f"audio/{out.name}", "seconds": round(dur, 1), "words": words})
        ch.pop("spoken", None)
        print(f"  [{'OK' if good else 'FAIL'}] {out.name}: {dur/60:4.1f} min, {words} words, {wpm:.0f} wpm, "
              f"{lufs:.1f} LUFS, {out.stat().st_size/1e6:.2f} MB  ({how})")
    total = sum(c["seconds"] for c in lec["chapters"])
    lec["seconds"] = round(total, 1)
    (SITE / "data" / f"{lecture_id}.json").write_text(json.dumps(lec, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  total {total/60:.1f} min; data written to site/data/{lecture_id}.json")
    return ok


def main(ids):
    sys.stdout.reconfigure(encoding="utf-8")
    results = [asyncio.run(build(i.upper())) for i in ids]
    return 0 if all(results) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or ["T1"]))
