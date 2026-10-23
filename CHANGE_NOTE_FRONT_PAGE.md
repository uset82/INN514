# Change note for Claude Code: the front page

From WorkBuddy, 2026-10-23 17:00. The student says: "i have change in the first UI page."
This note says what the change is, why it does not appear on the live page, and what has to
change for it to stick. Nothing was edited in response.

## What the change is

At 16:39 the claude.ai page editor saved its own serialisation of the published page over
`site/index.html` (full document wrapper, `data-page-node-id` on 91 elements, two injected
`<style id="__dm_…">` tags, and the front page baked into `<main id="view">`).

I diffed that baked-in markup against what `renderHome()` produces in a headless load, after
stripping the node ids, the `__dm_*` styles and whitespace. **Exactly one element differs:**

- the code renders:
  `<p class="aid">An unofficial study aid, prepared with AI help and checked against the slides and papers. The lecturers have not reviewed it.</p>`
- the saved page holds:
  `<p class="aid"></p>`

So the student deleted the "unofficial study aid" sentence from the front page. Everything
else on that page — h1, "INN514, autumn 2026", the lede, both doors with their stats and
meters, the three sections — is byte-identical to the build once the editor annotations are
stripped. If they meant to change something else, that edit never reached the file.

## Why it does not show on the live page

`renderHome()` assigns `view.innerHTML` on every route change, including the first load. The
saved `<main>` is thrown away and rebuilt from the template string, so the empty `<p class="aid">`
never renders: the live page still prints the sentence. Confirmed in a headless load —
`document.querySelector('.aid').textContent` returns the full sentence, with no script errors.

In other words the student's edit is currently cosmetic in a file that gets overwritten.

## What has to change to make it real

1. `site/template.html`, inside `renderHome()` (line 488): delete the `<p class="aid">…</p>` line.
   The `.aid` rule in the stylesheet (line 108) then has no user and can go too.
2. `scripts/check_page.mjs`: the front-page check requires that element —
   line 80 `aid: !!document.querySelector('p.aid')` and line 88 `f.h1 === HOME_H1 && f.aid && …`.
   Both must stop requiring it, or the check fails the moment the paragraph is gone.
3. `REDESIGN_PLAN.md` § Front page still specifies the aid copy and `p.aid`, and the plan's
   step 3 lists it. Plan, template and check must agree on whichever way the student decides.

## Warning about the next build

`build_site.py` regenerates `site/index.html` from `template.html`. The next build erases the
saved editor copy, and with it the only record of this edit. Either extract the change into the
template first, or drop it deliberately — but do not let a rebuild quietly decide it.

## Worth asking the student

The sentence is the site's disclaimer ("The lecturers have not reviewed it"), and the plan
argues for keeping it near the top. It is their call, but it is worth one question rather than
a silent removal: the paragraph can also be shortened instead of deleted, e.g. dropping only
the second sentence.

## Resolved (Claude Code, 2026-10-23)

The student asked for the change to be saved. The sentence is removed from `template.html` (`renderHome()` and the `.aid` rule), `check_page.mjs` no longer requires it, and `REDESIGN_PLAN.md` records the removal. Published as version 30.
