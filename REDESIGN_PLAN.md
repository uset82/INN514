# REDESIGN_PLAN: the INN514 Course Companion redesign

Written by Claude Code on 2026-10-23 from the plan the student approved. WorkBuddy builds it; Claude Code reviews and publishes it.
This file is the single spec. Use its copy word for word. Prompt: `REDESIGN_KICKOFF.md`. Progress: `PROGRESS_REDESIGN_WORKBUDDY.md`.

## Context

The companion is complete in content: 8 lectures and 17 papers, 154 MP3s, version 27 at https://claude.ai/artifact/Nc3TALuXYR3W49sUshNs93 (private). The student finds it messy. Today the course view is one long page: lectures on a route line, then 17 readings on a second route. The student asked for four things:

1. Organise the site by the teachers' classes and by the papers.
2. Make it easy to get back to the main page from inside a paper (while reading or listening) and decide where to go next.
3. Add a front page that says what the INN514 site is about.
4. Make it clean, in a "Claude style".

**The student chose:**
- **Classes:** one page in Kursplan course order, with the teacher shown on every class.
- **Papers:** one page with papers grouped under the class they go with.

**Who does what:**
- WorkBuddy builds the redesign from this spec, which must be detailed enough to leave nothing to invent.
- Claude prepares the spec files, then reviews, fixes and publishes.
- The student approves gate D1.

**What does not change:**
- Every text, audio file and data file stays as it is.
- The player logic stays the same.
- Visitors' saved progress keeps working.
- No lecture, reading or MP3 changes, so only `site/index.html` is republished.

**"Claude style"** here means the look only:
- a warm ivory page, a bookish serif for headings and reading, a quiet sans for the interface, a clay accent, generous space and soft edges;
- no Claude or Anthropic name, logo or mark anywhere on the page, so the site never looks like an Anthropic product.

## Phase 0: Claude, on approval of this plan

1. Write three files in `workspace/lecture-audio/`, copied from the sections below and kept verbatim, so WorkBuddy and Claude work from one text:
   - `REDESIGN_PLAN.md`: the full spec;
   - `REDESIGN_KICKOFF.md`: WorkBuddy's prompt;
   - `PROGRESS_REDESIGN_WORKBUDDY.md`: one box per step, and gate D1.
2. Back up the three files WorkBuddy may edit to the session scratchpad: `site/template.html`, `scripts/build_site.py` and `scripts/check_page.mjs`, each as `*.before-redesign`.
3. Write a sha256 manifest of `lectures/`, `readings/`, `site/data/`, `site/audio/`, `site/reviewed.json`, `scripts/reading_lib.py`, `build_audio.py` and `check_reading.py`. Save it as `checks/redesign-manifest-before.txt`, so the review can prove the content was not touched.
4. Add the plan's rules to the memory note.

## Information architecture

These are hash routes in the same single-page app:

| Hash | View | Notes |
|---|---|---|
| `#home` | Front page | Also used for an empty hash, an unknown hash and the old `#route` (old bookmarks keep working). |
| `#classes` | Classes page | Kursplan order with the teacher shown. Sessions 7 and 8 appear as quiet rows linking to Papers. |
| `#papers` | Papers page | Grouped under each class. A paper that goes with several classes is listed under each one: 20 rows, 17 papers. |
| `#T1` … `#T8`, `#B1` | One class | The current lecture view, restyled. |
| `#P01` … `#P17` | One paper | The current reading view, restyled. |
| page links | Paper at a page | Links with `data-page` open a paper and scroll to `#page-N`, as today. |

**Vocabulary (one name everywhere in the interface):**
- **Class N:** T8 is "Class 9", from Kursplan session 9. B1 is "Bonus class".
- **Paper N:** N is the number in the PDF file name, so P14 is "Paper 14".
- The word "Reading" no longer appears in the interface.
- The text inside chapters is not changed.

**Getting back (request 2):**
- A sticky top bar is always visible, with "INN514 Companion" (to the front page), "Classes" and "Papers".
- A breadcrumb sits on every class page and paper page.
- A "Where next" block ends every class page and paper page.
- The title in the docked player is a link back to whatever is playing.

## Design system

### Colour

The tokens go on `:root`. Dark mode is set under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {…} }` and again under `:root[data-theme="dark"]`. `body` gets an explicit background.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FAF9F5` ivory | `#262624` | page |
| `--surface` | `#FFFFFF` | `#30302E` | reading sheet, doors, player |
| `--surface-2` | `#F0EEE6` | `#3A3936` | hover, current chapter, chips, meter track |
| `--ink` | `#141413` | `#F2F0E8` | text |
| `--ink-2` | `#3D3D3A` | `#D9D6CC` | lede, bylines |
| `--muted` | `#6B6A63` | `#A6A39A` | meta, numbers |
| `--line` | `#E5E2D8` | `#45443F` | hairlines, borders, route line |
| `--clay` | `#D06B4A` | `#D97757` | fills only: progress, marks, active underline |
| `--clay-ink` | `#B4532E` | `#E08A6B` | links, primary button background (light), focus ring |
| `--on-clay` | `#FFFFFF` | `#1F1E1D` | text and icon on the primary button |
| `--btn` | `#B4532E` | `#D97757` | primary and play button background |
| `--btn-hover` | `#9E4627` | `#E08A6B` | their hover |
| `--glow` | `#F6E7DF` | `#4A3529` | paragraph being read |
| `--glow-ink` | `#141413` | `#F8EDE6` | its text |

**Contrast targets** (verify at review):
- `--muted` on `--bg` is at least 5:1;
- `--clay-ink` on `--bg` is at least 4.5:1;
- `--on-clay` on `--btn` is at least 4.5:1.

`--clay` is never used for text. Claude Code measured these pairs before writing the spec:

| Pair | Light | Dark |
|---|---|---|
| `--ink` on `--bg` | 17.5 | 13.3 |
| `--muted` on `--bg` | 5.15 | 6.01 |
| `--muted` on `--surface` | 5.43 | 5.24 |
| `--muted` on `--surface-2` | 4.67 | 4.58 |
| `--clay-ink` on `--bg` | 4.73 | 5.79 |
| `--clay-ink` on `--surface` | 4.98 | 5.05 |
| `--on-clay` on `--btn` | 4.98 | 5.33 |
| `--on-clay` on `--btn-hover` | 6.25 | 6.35 |
| `--glow-ink` on `--glow` | 15.3 | 9.96 |
| `--clay` fill on `--bg` (non-text, needs 3:1) | 3.39 | 4.86 |

Light `--clay` is `#D06B4A`, not `#D97757`, because `#D97757` reached only 2.96:1 on the ivory page.

`--clay` is never used for text. There are no gradients and no shadows, except the player's top hairline.

### Type

Fonts come from Google Fonts only. Replace the current font link with:

`https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&display=swap`

- `--serif: "Source Serif 4", Georgia, "Times New Roman", serif;`
- `--sans: "Hanken Grotesk", "Segoe UI", system-ui, sans-serif;`
- **Scale tokens:** `--s-1: .8125rem; --s0: 1rem; --s1: 1.25rem; --s2: 1.5625rem; --s3: 1.9375rem; --s4: 2.4375rem`.

| Role | Face | Size / weight / line height | Extra |
|---|---|---|---|
| Front page h1 | serif | `clamp(2.25rem, 1.4rem + 3.6vw, 3.25rem)` / 500 / 1.08 | `letter-spacing: -.015em; text-wrap: balance; max-width: 16ch` |
| Page h1 (Classes, Papers, a class, a paper) | serif | `clamp(1.75rem, 1.2rem + 2.4vw, 2.4375rem)` / 500 / 1.12 | `text-wrap: balance` |
| Section h2 (front page, Where next) | serif | `--s2` / 500 / 1.2 | |
| Door title | serif | `--s3` / 500 / 1.1 | |
| Row title (class, paper) | serif | `--s1` class, `1.125rem` paper / 500 / 1.25 | `text-wrap: balance` |
| Chapter h2 in sheet | serif | `--s2` / 600 / 1.15 | number in `--clay-ink` |
| Reading prose | serif | `1.125rem` / 400 / 1.7 | `max-width: 65ch` |
| Lede | serif | `1.25rem` / 400 / 1.55 | `--ink-2`, `max-width: 34em` |
| Interface (nav, buttons, lists, byline) | sans | `--s0` or `.9375rem` / 500 | |
| Meta | sans | `--s-1` / 400 / 1.45 | `--muted`, `font-variant-numeric: tabular-nums` |
| Group heading on Papers | sans | `--s0` / 600 | |

**Banned:**
- `text-transform: uppercase`, tracked labels and eyebrow labels above headings;
- " · " joins;
- "→" in link or button text;
- italic or colour accents on single words in headings;
- monospace.

### Space, shape, motion

- **Spacing:**
  - Spacing tokens: `--sp-1 .25rem`, `--sp-2 .5rem`, `--sp-3 .75rem`, `--sp-4 1rem`, `--sp-5 1.5rem`, `--sp-6 2rem`, `--sp-7 3rem`, `--sp-8 4rem`.
  - Front page sections are separated by `--sp-8` on desktop and `--sp-7` below 720px.
- **Radii, set by hierarchy:**
  - `--r-sm: 8px`: paragraph highlight, nav hover;
  - `--r-md: 12px`: list-row hover, check box, secondary button;
  - `--r-lg: 16px`: doors and the reading sheet;
  - `999px`: the primary button, the play button and chips.
- **Borders:** 1px `--line`. No shadows on cards.
- **Widths:**
  - `.wrap` is `max-width: 1080px`, with inline padding `max(16px, env(safe-area-inset-left/right))`;
  - front page text columns are `40rem`;
  - the hero is `44rem`.
- **Motion:** only responses to the user:
  - the progress fill (`height` or `width`, .4s ease);
  - the paragraph highlight background (.25s);
  - row and nav hover background (.15s).
  - No entrance animations. Everything is off under `prefers-reduced-motion: reduce`.
- **Focus:** `:focus-visible { outline: 2px solid var(--clay-ink); outline-offset: 2px; border-radius: 6px; }`.
- **Touch targets:** at least 44px high.
- **Skip link:** a "Skip to content" link is the first focusable element, visible on focus, and jumps to `#view`.

### The one bold element

The two **doors** on the front page:
- Each is a large serif word, "Classes" or "Papers", on a white panel.
- Each panel carries a 4px clay meter showing the chapters heard.

Everything else stays quiet. The vertical chapter route (line, marks and clay fill) survives only in the chapter list on class and paper pages.

## Page specs (exact copy, in sentence case)

### Global top bar (every view)

```
| INN514 Companion                              Classes   Papers |   (sticky, 3.5rem high)
```

- **Markup:** `<header class="topbar"><div class="wrap">` containing:
  - `<a class="brand" href="#home">INN514 <span>Companion</span></a>`: "INN514" at sans 600, "Companion" at 400 in `--muted`;
  - `<nav class="mainnav" aria-label="Main">` with `<a href="#classes" data-nav="classes">Classes</a>` and `<a href="#papers" data-nav="papers">Papers</a>`.
- **Position:** `position: sticky; top: 0; z-index: 6`.
- **Background:**
  - `color-mix(in srgb, var(--bg) 92%, transparent)` with `backdrop-filter: blur(8px)`;
  - `border-bottom: 1px solid var(--line)`.
- **Nav links:**
  - sans 500 `.9375rem`, padding `.5rem .75rem`, radius `--r-sm`, colour `--muted`, hover background `--surface-2`;
  - the active link has `aria-current="page"`, colour `--ink` and `box-shadow: inset 0 -2px 0 var(--clay)`.
  - "Classes" is active on `#classes` and class pages; "Papers" is active on `#papers` and paper pages; neither is active on home.
- `--header-h: 3.5rem`. Use it for `scroll-margin-top` on `.chapter` and `.pg` (`calc(var(--header-h) + 1rem)`), and for the sticky sidebar's `top`.
- `<title>` becomes "INN514 Course Companion". The media-session artist becomes "INN514 Course Companion".

### Front page `#home`

```
Innovation systems and
sustainable transformation                     (serif h1)
INN514, autumn 2026                            (sans, muted)
Every class of the course explained in plain English, and every
paper on the reading list summarised page by page. Listen on the
way, read at your desk, and check yourself after each chapter.   (lede)
An unofficial study aid, prepared with AI help ... (aid, small)

[ ▶ Continue class 1, chapter 3 ]   Norway's innovation puzzle   (only with saved progress)

┌───────────────────────────┐ ┌───────────────────────────┐
│ Classes                   │ │ Papers                    │   doors: 2 columns at 720px and up,
│ The lectures in Kursplan  │ │ All 17 papers, each with  │   stacked below
│ order, each with ...      │ │ a short account ...       │
│ 8 classes, 2 hours 47 min │ │ 17 papers, 4 hours 50 min │
│ ▬▬▬▬───────────────────── │ │ ───────────────────────── │   4px meter
│ 5 of 58 chapters heard    │ │ No chapters heard yet     │
└───────────────────────────┘ └───────────────────────────┘

What the course is about   (h2)
How to use this site       (h2, dl)
About these summaries      (small)
```

**Copy, verbatim:**
- **h1:** "Innovation systems and sustainable transformation"
- **Under h1:** "INN514, autumn 2026"
- **Lede:** "Every class of the course explained in plain English, and every paper on the reading list summarised page by page. Listen on the way, read at your desk, and check yourself after each chapter."
- **Aid** (`p.aid`, kept from version 27): "An unofficial study aid, prepared with AI help and checked against the slides and papers. The lecturers have not reviewed it."
  - **Removed on 2026-10-23 at the student's request:** the student deleted this line in the page editor. Claude removed it from `renderHome()` and the `.aid` rule, and `check_page.mjs` no longer requires it.
- **Resume:** `#resumeBtn` labelled "Continue {Class 1 | Paper 14 | Bonus class}, chapter {n}", followed by `p.resume-line` with the chapter title. This keeps today's logic.
- **Door "Classes"**: `<a class="door" href="#classes" data-door="classes">`, made up of:
  - `<h2>`Classes;
  - "The lectures in Kursplan order, each with its teacher and the papers that go with it.";
  - a stats line, "{8} classes, {2 hours 47 minutes}", computed from the data;
  - `.meter` (`--p` = heard ÷ total chapters);
  - a `[data-door-info]` line: "{n} of {58} chapters heard", or "No chapters heard yet";
  - a link-styled "See the classes" in `--clay-ink`, underlined.
- **Door "Papers"**: the same pattern with:
  - "All 17 papers, each with a short account of the whole paper and a summary of every page.";
  - "{17} papers, {4 hours 50 minutes}";
  - "See the papers".
- **Door styling:**
  - the whole door is the link;
  - `background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg); padding: var(--sp-5)`;
  - hover changes `border-color` to `--clay` only, with no lift.
- **"What the course is about"** (h2), then one paragraph in reading serif:
  > INN514 asks how innovation happens in systems rather than inside single firms, and how those systems can support a sustainable transformation. The classes move from national and regional innovation systems, through institutional work, entrepreneurial ecosystems and agency, to technological innovation systems, and end with a summary before the exam. Sessions 7 and 8 go through the papers, and the course ends with a written exam. A bonus class on crowdfunding comes from the 2025 course.
- **"How to use this site"** (h2): a `<dl class="howto">`, with `dt` in sans 600 and `dd` in reading serif at `1.0625rem`. It is not numbered, because the items are not a sequence. The items are:
  - **Listen:** "Press play on any chapter. The player stays at the bottom while you move around the site, and its title takes you back to what is playing. The speed button changes the pace."
  - **Read:** "The paragraph being read is highlighted. Turn off Follow if you want to scroll on your own."
  - **Check yourself:** "Each chapter ends with a question or two. The answer stays hidden until you open it."
  - **Your progress:** "Chapters you have heard are marked, and saved in this browser only."
- **"About these summaries"** (`p.note`, small and muted, at the end):
  > Each class summary was written in English from the teacher's slides (the 2025 decks) and the papers, and its page numbers were checked against the PDFs. Each paper is summarised page by page from the paper itself, under its own page numbers. Examples of our own are marked as ours. The voice is Microsoft's neural voice Ryan. Use this alongside the papers, not instead of them.

  It replaces the old global `<p class="note">` under `<main>`; that note is removed from the other views.
- **Time format** for durations: "{h} hours {m} minutes", or "{m} minutes" under one hour. Write it as one helper, `long(s)`.

### Classes page `#classes`

```
Classes                                                  (page h1)
The lectures in Kursplan order, with the teacher and the papers for each one.
Sessions 7 and 8 have no slides: they go through the papers.

 1   Innovation as systemic and sustainable transformation          (serif row title, link)
     Arnt Fløysand. Session 1, 21 September                         (.row-teacher + when)
     20 minutes, 7 chapters. 3 papers                               ([data-info], papers count)
     ▬▬▬──────────  (3px meter, only once a chapter is heard)
 ...
 6   Technological innovation systems and sustainable transformation
     Rune Njøs. Session 6, 20 October
     From the 2025 guest lecture. Kelvin Ivankovic teaches session 6 in 2026.   (.row-note)
 7   The papers: summary and reflection                             (quiet row, muted)
     Kelvin Ivankovic. Session 7, 26 October
     No slides. Go to the papers                                    (link to #papers)
 8   The papers: summary and reflection
     Kelvin Ivankovic. Session 8, 27 October
 9   Summary and exam preparation
     Arnt Fløysand. Session 9, 2 November
 +   The art of crowdfunding
     Alice Demattos Guimarães. Bonus class from H2025, not in Kursplan 2026
```

- **Markup:** `<ol class="list classes">`, one `<li class="row ready|soon" data-id="T1">` per class (8), and two `<li class="row session" data-session="7|8">`.
- **Row grid:**
  - `grid-template-columns: 3rem minmax(0, 1fr)`; padding `.9rem .75rem`; radius `--r-md`;
  - rows separated by `border-top: 1px solid var(--line)`, except the first;
  - hover background `--surface-2`;
  - the title link is stretched (`a.row-title::after { content:""; position:absolute; inset:0 }`, with `li { position: relative }`).
- **Number:** serif 500 `--s2`, `--muted`, tabular. The bonus row shows "+".
- **Row lines:**
  - `[data-info]` reads "{20 minutes}, {7} chapters" before listening, then "{20 minutes}, {3} of {7} chapters heard";
  - after it comes ". {n} papers" or ". 1 paper";
  - a soon row says "In preparation".
- **Meter:** `.meter`, 3px high and `max-width: 12rem`, with track `--surface-2` and fill `--clay` at `width: calc(var(--p) * 100%)`. It is shown when `--p > 0`. The `--p` property is set on the `li`, as today.
- **Session rows:** number and title in `--muted`; not a stretched link; only "No slides. Go to the papers" links to `#papers`.

### Papers page `#papers`

```
Papers                                                   (page h1)
All 17 papers, under the class they go with. Each starts with the paper in brief,
then a short summary of every page. A paper that goes with more than one class is
listed under each.

Class 1. Innovation as systemic and sustainable transformation     (group h2, sans 600, link to #T1)
Arnt Fløysand                                                        (muted)
  Paper 1    The evolution of Norway's national innovation system   (serif row title, link)
             Fagerberg, Mowery & Verspagen 2009
             16 minutes, 5 chapters
  Paper 2    The "trinity" of innovation: actors, ideas and objects ...
  Paper 4    Innovation systems for transformations towards sustainability? ...
             Schlaile et al. 2017
             13 minutes, 5 chapters. Also for class 2 and class 9
Class 2. ...
```

- **Groups:** `<section class="group" data-class="T1">` in catalog order, for each class that has papers (B1 is included, "Bonus class. The art of crowdfunding"). Each holds an `<h2><a href="#T1">Class 1. {title}</a></h2>`, a teacher line, and `<ol class="list papers">`.
- **Rows:** `<li class="row ready|soon" data-id="P01">` in `ORDER` within the group. Grid `4.75rem minmax(0, 1fr)`. The left column is "Paper 14" in sans 500 `--s-1` `--muted`.
- **Lines:** cite; `[data-info]` (same format as classes); then "Also for class 2 and class 9" when the paper has other classes (names via `className`, joined with "and").
- **Group spacing:** `--sp-7` between groups.

### Class page `#T1` and paper page `#P01`

```
Classes / Class 4                                         (nav.crumbs, sans --s-1)
Class 4. Session 4, 28 September                          (.when, meta)
Entrepreneurial ecosystems and sustainable transformation (page h1)
Nora Geirsdotter Bækkelund, from the H2025 slides. 7 chapters, 22 minutes.   (.by)
Papers for this class: Paper 6 (Spigel & Harrison 2018), Paper 7 (...), Paper 8 (...)   (.by, links)
[ ▶ Listen from the start ]

┌ Chapters ───────────┐  ┌ sheet ────────────────────────────────┐
│ ● 1 Innovation ...  │  │ 1  Innovation, entrepreneurship ...   │
│ │ 2 ...         2:53│  │ Slides 1–5. Readings: Autio ... 2:53  │
└─────────────────────┘  │ ( ▶ Listen to this chapter )          │
                         │ prose ...                             │
                         └───────────────────────────────────────┘
Where next                                                (h2)
  Papers for this class: Paper 6 ..., Paper 7 ..., Paper 8 ...
  Next class: Class 5, Agency and innovation systems in change
  All classes
```

- **Breadcrumb:** `<nav class="crumbs" aria-label="Breadcrumb">`, written as `<a href="#classes">Classes</a> / <span aria-current="page">Class 4</span>`. A paper page has `<a href="#papers">Papers</a> / Paper 14`. The slash is in `--muted`.
- **Class header** (inside `header.lec-head`; keep that class):
  - `.when` reads "Class 4. {when}"; B1 reads "Bonus class. {when}";
  - `.by` reads "{teacher}, from the H2025 slides. {n} chapters, {long}." T6 adds its note as a second `.by`;
  - papers line: "Papers for this class: " plus links `<a href="#P06">Paper 6 (Spigel & Harrison 2018)</a>`, joined with ", ". Keep these links inside `.lec-head`.
- **Paper header:**
  - `.when` reads "Paper 14. For class 5." or "Paper 4. For class 1, class 2 and class 9.", each class a link;
  - `.by` reads "{authors} ({year}). {source}. {n} chapters, {long}.".
- **Button:** `#startBtn` (primary), labelled "Listen from the start" or "Continue chapter {n}". Logic unchanged.
- **Body:** `.lec-body`, at 860px and up `grid-template-columns: 17rem minmax(0, 1fr)`.
  - **Sidebar:** `nav.side` with sticky `top: calc(var(--header-h) + 1rem)` and `max-height: calc(100vh - var(--header-h) - var(--player-h) - 2rem)`. It holds a small heading "Chapters" (sans 600 `--s-1`, `--muted`) and `ol.route.chapters`, which keeps today's markup: `li.stop[data-i]`, `.fill`, `.mark`, `button.body[data-i]` with `.num`, `.title` and `.dur`.
  - **Route styling:** the line is `--line`; the fill is `--clay` at 4px; the mark is a 2px `--muted` ring on `--bg`; a done mark is filled `--clay`; the current mark is filled `--clay` with a 2px `--ink` ring; the current row has `--surface-2` background and title weight 600.
  - **Sheet:** `article.sheet` with `background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg); padding: var(--sp-6) clamp(1rem, 4.5vw, 2.75rem)`. Chapters are separated by a 1px `--line` with `--sp-6` above and below.
    - Keep `section.chapter#ch-{i}`, `h2 > .chno + span`, `p.src` (links with `data-page` unchanged) and `button.listen[data-i]`.
    - Style `.listen` as a secondary pill: 1px `--line`, transparent, `--ink` text, clay icon, hover `--surface-2`.
    - Keep `h3.pg#page-N` (sans 600 `--s-1`, `--clay-ink`), `p.prose[data-k]` (`.now` gets `--glow`) and `details.check` (1px `--line`, `--r-md`, summary in `--clay-ink`).
- **Where next:** `<section class="next" aria-labelledby="next-h">`, after `.lec-body`, `margin-top: --sp-7`, with `h2#next-h` "Where next" and a `ul` of links (sans 500, meta under each in `--muted`):
  - **Class page:**
    - "Papers for this class" (each paper title as a link);
    - "Next class: Class {n}, {title}" (the next ready class in catalog order; on the last one, "Back to the first class: Class 1, …");
    - "All classes".
  - **Paper page:**
    - "Other papers for class {n}" (the others in the same first class);
    - "Class {n}: {title}";
    - "Next paper: Paper {n}, {title}" (the next ready paper in `ORDER`);
    - "All papers".
- **Not ready:** the same breadcrumb and header, then `.soon-note`: "The summary and audio for this class are in preparation." or "The page-by-page summary and audio for this paper are in preparation."

### Player (docked, every view)

- **Unchanged:** markup ids and logic (`nowTitle`, `follow`, `rate`, `tCur`, `seek`, `tDur`, `prev`, `back`, `play`, `playIcon`, `fwd`, `next` and `audio`).
- **Changes:**
  - `#nowTitle` becomes `<a class="now-title" id="nowTitle" href="#home">`, text "Choose a class or paper to listen". `loadChapter` sets its `href` to `#{id}` and its text to "{Class 1 | Paper 14 | Bonus class}, chapter {n}: {title}".
  - Styling: `--surface` background and `border-top: 1px solid var(--line)`. The play button uses `--btn` with `--on-clay` and is 3.25rem. The seek bar is `accent-color: var(--clay-ink)`. Chips are pills with 1px `--line`, and Follow when pressed gets `--surface-2`.
  - `--player-h: 8.75rem`. The body gets the same bottom padding as today.

## Data change: `scripts/build_site.py` (small)

- **Teacher fields:** add `teacher` and `note` to every CATALOG entry, and to the dict built for `catalog`:
  - T1, T2, T3, T8: "Arnt Fløysand";
  - T4, T5: "Nora Geirsdotter Bækkelund";
  - T6: "Rune Njøs", note "From the 2025 guest lecture. Kelvin Ivankovic teaches session 6 in 2026.";
  - B1: "Alice Demattos Guimarães".
  - Every other note is "".
- **B1's when:** change to "Bonus class from H2025, not in Kursplan 2026".
- **New data key:** add `data["sessions"] = [{"num": "7", "title": "The papers: summary and reflection", "when": "Session 7, 26 October", "teacher": "Kelvin Ivankovic"}, {… "8", "Session 8, 27 October" …}]`. These facts come from `Kursplan INN514 - 2026.pptx`.
- **Nothing else changes:** `readings`, `lectures`, the reviewed gate, the audio list and the output are as they are.

## Template change: `site/template.html`

- **Kept exactly:**
  - the `const DATA = /*DATA*/;` line;
  - the localStorage key `inn514-companion` and the shape of `store` (`done`, `pos`, `rate`);
  - `paragraphStarts`, `loadChapter` (except the two `nowTitle` lines), `play`, `resume`, `markParagraph`, the audio listeners, the player button handlers, `mediaSession` (artist text only) and `linkReadings`;
  - the page-anchor logic: `pendingPage` and the click listener.
- **Rewritten:**
  - the `<style>` block, to the design system above;
  - the header (the top bar);
  - `renderCourse`, split into `renderHome`, `renderClasses` and `renderPapers`;
  - `renderLecture`: breadcrumb, header lines, Where next;
  - `refreshProgress`, which updates `.row[data-id]` (`--p`, `[data-info]`) and `.door` meters as well as `.chapters .stop`;
  - `route()`.
- **Helpers:**
  - `className(c)` returns "Class 9", "Bonus class" or "Paper 14", and replaces `lectureName`;
  - `long(s)`;
  - `totals(ids)` returns `{secs, chapters, heard}`.
- **Routing:**
  ```js
  function route() {
    const id = location.hash.slice(1);
    if (id === "classes") renderClasses();
    else if (id === "papers") renderPapers();
    else if (entry(id)) renderLecture(id);
    else renderHome();            // "", "home", "route", anything unknown
    setNav(id);                   // aria-current on .mainnav links
    /* then the existing pendingPage scroll, else scrollTo(0, 0) */
  }
  ```
- **Data-driven:** no hard-coded counts or durations. Use `DATA.catalog`, `DATA.readings`, `DATA.sessions` and `DATA.lectures`.

## Check change: `scripts/check_page.mjs`

**Keep these checks:** all the playback checks (plays, highlight, next chapter, fill and save, speed), every ready paper opens with its chapters and page subheadings, the page link opens a paper at its page, no script errors, and the not-ready checks.

**Rewrite these, using the new selectors:**
1. The template has no `uppercase`, no " · ", no "→", and does not contain "Claude" or "Anthropic".
2. `#home`, the empty hash and `#route` all show the front page: the h1 text, `p.aid`, and `.door[href="#classes"]` and `.door[href="#papers"]`.
3. `#classes`:
   - `.list.classes .row[data-id]` count equals `DATA.catalog.length`;
   - the `.ready` count equals the ready classes;
   - there are 2 `.row.session`;
   - every class row's `.row-teacher` is non-empty.
4. `#papers`:
   - `.list.papers .row` count equals the sum of `r.lectures.length` (20);
   - there are 17 unique `data-id`;
   - the ready count matches.
5. After listening, on `#home`:
   - the classes door `--p > 0`;
   - `#resumeBtn` exists;
   - on `#classes`, the T1 row `--p > 0` and its info says "chapters heard".
6. The class `.lec-head` links to its paper and opens it, as today.
7. **The top bar stays put:** on a ready paper, `window.scrollTo(0, 3000)`, then:
   - `.topbar` top is between -1 and 1;
   - both `.mainnav` links are visible;
   - clicking `.mainnav a[href="#papers"]` shows `.list.papers`, with `aria-current` on that link.
8. **Breadcrumbs:** on a paper page, `.crumbs a[href="#papers"]` exists; on a class page, `.crumbs a[href="#classes"]` exists.
9. **The player link:** after T1 plays and the view goes to `#papers`, `#nowTitle` `href` is `#T1`, and clicking it opens `#T1`.
10. **Where next:** `section.next` exists on a class page and on a paper page.
11. **Phone at 390px:** no horizontal scroll on home, classes, papers, a class and a paper, with light and dark screenshots for each (`phone-home*.png`, `phone-classes*.png`, `phone-papers*.png`, `phone-lecture*.png`, `phone-reading*.png`), plus `desktop-home.png`, `desktop-classes.png` and `desktop-papers.png`.

Update the header comment of `check_page.mjs` to describe the new design.

## Rules for WorkBuddy (for this task only)

- **May edit only:** `site/template.html`, `scripts/build_site.py` (the CATALOG fields and `data["sessions"]`), `scripts/check_page.mjs`, and `PROGRESS_REDESIGN_WORKBUDDY.md`.
- **May run:** `build_site.py` and `check_page.mjs`, from `D:/HVL2025/514`. For this task only, these are no longer Claude's alone. No other agent is working, so nothing collides.
- **Must not touch:**
  - `lectures/`, `readings/`, `site/data/`, `site/audio/`, `cache/` and `site/reviewed.json`;
  - `reading_lib.py`, `build_audio.py`, `check_reading.py`, `check_style.py`, `check_sources.py` and guards;
  - any PDF.
- **No new dependencies:** no npm or pip installs, and no scripts from anywhere. Google Fonts is the only external resource.
- **Never publish,** never tick gate D1, and never delete files (report strays instead).
- **Wording and branding:**
  - Use the copy in this spec word for word. If something is missing, write it in the same plain voice and list it in the report.
  - No Claude or Anthropic name, logo or mark on the page.
- **Working method:**
  - Work one step at a time.
  - Edit the template in sections (styles, header, home, classes, papers, class and paper page, player, route).
  - Never re-read the whole file repeatedly.
  - After each step, run `build_site.py`.
  - After the last step, run `check_page.mjs` and look at every screenshot (phone and desktop, light and dark). Fix what looks wrong.
- **Report:** check off each step with its evidence, then paste:
  - the full `check_page.mjs` output;
  - the list of screenshots looked at;
  - any copy it had to add.
- **Stop:** "STOP GATE D1: ask Claude Code to review the redesign and publish."

**WorkBuddy's steps (one box each in `PROGRESS_REDESIGN_WORKBUDDY.md`):**
1. CATALOG teacher, note and sessions in `build_site.py`; build.
2. Tokens, fonts, base, top bar and skip link.
3. Route and front page.
4. Classes page.
5. Papers page.
6. Class and paper page: breadcrumb, header lines, sidebar offsets, sheet styles, Where next.
7. Player link and restyle.
8. `check_page.mjs` rewritten checks.
9. Full run, screenshot review and fixes.
10. Report and stop at D1.

## Claude's review, publish and verification

1. **Content untouched:** recompute the manifest. It must match `checks/redesign-manifest-before.txt` file for file.
2. **Tests:** run `build_site.py` and `check_page.mjs` (all PASS), the R4 check script on the current listing (`PROBLEMS: none`), and `verify_guards.py` (11 files OK).
3. **Visual and copy review:**
   - read every screenshot, and the live preview at 390px and at desktop width, in light and dark;
   - compare the copy word for word with this spec;
   - spot-check contrast for `--muted`, `--clay-ink` and the button pair;
   - confirm keyboard focus is visible on the nav, doors, rows, chapter buttons and the player;
   - confirm the top bar stays visible while scrolling a paper, and that the player title returns to what is playing;
   - confirm old progress (`inn514-companion`) still shows as heard.
4. **Fix and log:** fix any defects (Claude may edit those three files), then add a review entry to `PROGRESS_REDESIGN_WORKBUDDY.md` and `PROGRESS.md`.
5. **Publish:** `site/index.html` to the same URL with no `files` map (no audio changed; the gallery title becomes "INN514 Course Companion"). Then list the published files: all 154 MP3 sizes must be unchanged, and the published `index.html` must equal the local build apart from the wrapper.
6. **Gate:** the student looks at it on the phone and writes "APPROVED GATE D1", and Claude ticks it.
