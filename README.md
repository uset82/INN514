# INN514 Course Companion

## What this is

An unofficial study companion for INN514, "Innovation systems and sustainable transformation". It explains every class and summarises every course paper page by page, as audio and text. It was prepared with AI help and checked against the slides and papers, and the lecturers have not reviewed it.

## What is not here

This repository does not contain the papers, the slides or any other course file. The summaries are study notes. All rights in the papers stay with their authors and publishers, and in the slides with the lecturers. Paper 2 is a conference paper marked "do not quote", and it is never quoted here.

## Layout

`lectures/`, `readings/`, `site/` (`template.html`, `data/`, `audio/`, `index.html`), `scripts/`, and the plan and progress files.

## Build

- `build_audio.py <id>` — turns a lecture or reading summary into chapter audio in `site/audio/` and the chapter data in `site/data/`.
- `build_site.py` — builds `site/index.html` from `site/template.html` and the data in `site/data/`.
- `build_static.py` — writes the static copy for Canner as `index.html` at the repo root, from the built `site/index.html`.
- `check_page.mjs` — headless Chrome checks of the built page, with screenshots into `checks/`.
- `export_knowledge.py <out_dir>` — exports the companion as a plain-text knowledge pack for Grok Principal on the watch.

The checks that read the PDFs (`check_reading.py`, `check_sources.py`) need the course files, which are not in the repo.

## Deploy

The claude.ai link is published by Claude Code; the Canner copy deploys the repo root on every push to `main`.
