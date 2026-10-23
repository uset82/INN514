// Headless Chrome check of site/index.html (raw CDP, no dependencies).
//   node workspace/lecture-audio/scripts/check_page.mjs > workspace/lecture-audio/checks/page-check.log 2>&1
// Checks the redesigned site: the sticky top bar with Classes and Papers; the three routes
// (#home, #classes, #papers) and the front page's two doors with their meters; the class list
// in Kursplan order with a teacher on every row and sessions 7 and 8 as quiet rows; the papers
// grouped under their class (20 rows over 17 papers); a class opening its chapter sheet and
// playing; the paragraph highlight following the audio; the next chapter starting on its own;
// the route fill and the saved progress; the door and row meters after listening; breadcrumbs
// and "Where next" on a class and on a paper; the player title leading back to what is playing;
// a page link ("pp. 437") opening a paper at that page; no horizontal scroll at 390 px in light
// and dark; no script errors; and the template avoiding the banned styles (all caps, "·" joins,
// arrows in link text, and any Claude or Anthropic name). Saves light/dark phone screenshots of
// the front page, the classes, the papers, a class and a paper, and desktop shots of the lists.
// COMPANION_SITE may point at a scratch copy of site/ for testing.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';

const PORT = 9351;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\Users\\carlos\\AppData\\Local\\Temp\\cdp-lecture-audio';
const OUT = 'workspace/lecture-audio/checks';
const SITE = (process.env.COMPANION_SITE || 'D:/HVL2025/514/workspace/lecture-audio/site').replaceAll('\\', '/');
const FILE = 'file:///' + SITE + '/index.html';
const DATA = JSON.parse(readFileSync(SITE + '/index.html', 'utf8')
  .match(/const DATA = (\{.*?\});\r?\n/s)[1]);
const READY = DATA.catalog.filter((c) => c.ready).map((c) => c.id);
const FIRST = READY[0];
const SOON = DATA.catalog.find((c) => !c.ready)?.id;
const READINGS = DATA.readings || [];
const RREADY = READINGS.filter((r) => r.ready).map((r) => r.id);
const RSOON = READINGS.find((r) => !r.ready)?.id;
const NCH = DATA.lectures[FIRST].chapters.length;
const ROWS = READINGS.reduce((n, r) => n + r.lectures.length, 0);   // 20: a paper for each class it goes with
const HOME_H1 = 'Innovation systems and sustainable transformation';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(OUT, { recursive: true });
rmSync(PROFILE, { recursive: true, force: true });
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
  '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required',
  '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });

let failures = 0;
const check = (name, ok, detail = '') => { console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? '  ' + detail : ''}`); if (!ok) failures++; };

const template = readFileSync('workspace/lecture-audio/site/template.html', 'utf8');
check('template has no all-caps labels', !/uppercase/i.test(template));
check('template has no "·"-joined meta strings', !template.includes(' · '));
check('template has no "→" in link or button text', !template.includes('→'));
// The host's layout hint <meta name="claude:viewport-fit-sides"> is not branding, so it is left out of this test.
check('template names neither Claude nor Anthropic', !/claude|anthropic/i.test(template.replace(/<meta name="claude:[^>]*>/g, '')));

async function cdp() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/list`); if (r.ok) {
      const t = (await r.json()).find((x) => x.type === 'page'); if (t) return t.webSocketDebuggerUrl; } } catch {}
    await sleep(500);
  }
  throw new Error('DevTools port never opened');
}

try {
  const ws = new WebSocket(await cdp());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const errors = [];
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || ''));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(JSON.stringify(m.params.args.map((a) => a.value ?? a.description)));
  };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
  const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}/${name}`, Buffer.from(r.result.data, 'base64')); console.log(`  screenshot ${OUT}/${name}`); };
  const go = async (hash) => { await ev(`location.hash = '${hash}'`); await sleep(600); };

  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: FILE }); await sleep(2500);

  // ---- the front page, from an empty hash, #route and #home
  // The student removed the "unofficial study aid" line from the front page on 2026-10-23.
  const front = `(() => ({h1: document.querySelector('h1')?.textContent,
    classes: !!document.querySelector('.door[href="#classes"]'), papers: !!document.querySelector('.door[href="#papers"]'),
    stats: ['.door[href="#classes"]', '.door[href="#papers"]'].map((d) => document.querySelector(d + ' .stats:not([data-door-info])')?.textContent)}))()`;
  const empty = await ev(front);
  await go('route');
  const old = await ev(front);
  await go('home');
  const home = await ev(front);
  const frontOk = (f) => f.h1 === HOME_H1 && f.classes && f.papers;
  check('an empty hash, #route and #home all show the front page',
    frontOk(empty) && frontOk(old) && frontOk(home), JSON.stringify({ empty: empty.h1, route: old.h1, home: home.h1 }));
  check('the doors count the classes and the papers from the data',
    /^\d+ classes, \d+ hours? \d+ minutes$|^\d+ classes, \d+ minutes$/.test(home.stats[0])
    && /^\d+ papers, \d+ hours? \d+ minutes$|^\d+ papers, \d+ minutes$/.test(home.stats[1]), JSON.stringify(home.stats));
  await shot('desktop-home.png');

  // ---- the classes list
  await go('classes');
  const cls = await ev(`({rows: document.querySelectorAll('.list.classes .row[data-id]').length,
    ready: document.querySelectorAll('.list.classes .row[data-id].ready').length,
    sessions: document.querySelectorAll('.list.classes .row.session').length,
    teachers: [...document.querySelectorAll('.list.classes .row[data-id] .row-teacher')].filter((p) => p.textContent.trim()).length,
    h1: document.querySelector('h1')?.textContent})`);
  check('#classes lists every class in order and marks the ready ones',
    cls.rows === DATA.catalog.length && cls.ready === READY.length && cls.h1 === 'Classes', JSON.stringify(cls));
  check('#classes has sessions 7 and 8 as quiet rows', cls.sessions === 2, `sessions ${cls.sessions}`);
  check('every class row names its teacher', cls.teachers === DATA.catalog.length, `${cls.teachers} of ${DATA.catalog.length}`);
  await shot('desktop-classes.png');

  // ---- the papers list
  await go('papers');
  const pap = await ev(`({rows: document.querySelectorAll('.list.papers .row').length,
    ids: new Set([...document.querySelectorAll('.list.papers .row[data-id]')].map((li) => li.dataset.id)).size,
    ready: document.querySelectorAll('.list.papers .row.ready').length,
    groups: document.querySelectorAll('.group').length, h1: document.querySelector('h1')?.textContent})`);
  check('#papers groups every paper under its class',
    pap.rows === ROWS && pap.ids === READINGS.length && pap.h1 === 'Papers', JSON.stringify(pap));
  check('#papers marks the ready papers', pap.ready === ROWS && pap.groups > 0, JSON.stringify(pap));
  await shot('desktop-papers.png');

  // ---- a class plays, highlights, moves on, fills its route and saves
  await go(FIRST);
  const lec = await ev(`({stops: document.querySelectorAll('.chapters .stop').length, sections: document.querySelectorAll('section.chapter').length,
    h1: document.querySelector('h1')?.textContent})`);
  check(`#${FIRST} opens the class with all its chapters`, lec.stops === NCH && lec.sections === NCH, JSON.stringify(lec));

  await ev(`document.querySelector('.listen[data-i="1"]').click()`); await sleep(3500);
  const p1 = await ev(`(() => { const a = document.getElementById('audio'); return {src: a.src.split('/').pop(), paused: a.paused, t: a.currentTime, d: a.duration}; })()`);
  check('a chapter plays from its button', p1.src === `${FIRST}-02.mp3` && !p1.paused && p1.t > 1 && p1.d > 60, JSON.stringify(p1));

  await ev(`(() => { const a = document.getElementById('audio'); a.currentTime = a.duration * 0.6; })()`); await sleep(1500);
  const hl = await ev(`(() => { const n = document.querySelectorAll('p.prose.now'); return {count: n.length, inChapter: n[0]?.closest('section').id}; })()`);
  check('paragraph highlight follows the audio', hl.count === 1 && hl.inChapter === 'ch-1', JSON.stringify(hl));

  await ev(`(() => { const a = document.getElementById('audio'); a.currentTime = a.duration - 0.4; })()`); await sleep(3000);
  const p2 = await ev(`(() => { const a = document.getElementById('audio'); const li = document.querySelector('.chapters .stop[data-i="1"]');
    const fill = li.querySelector('.fill').getBoundingClientRect().height;
    let saved = null; try { saved = JSON.parse(localStorage.getItem('inn514-companion')).done; } catch (e) {}
    return {src: a.src.split('/').pop(), paused: a.paused, done: li.classList.contains('done'), fill, saved,
      now: document.querySelector('.chapters .stop.now')?.dataset.i}; })()`);
  check('next chapter starts on its own', p2.src === `${FIRST}-03.mp3` && !p2.paused && p2.now === '2', JSON.stringify({src: p2.src, now: p2.now}));
  check('finished chapter fills the route and is saved', p2.done && p2.fill > 10 && JSON.stringify(p2.saved).includes('1'), JSON.stringify({done: p2.done, fill: p2.fill, saved: p2.saved}));

  const speed = await ev(`(() => { document.getElementById('rate').click(); return document.getElementById('audio').playbackRate; })()`);
  check('speed button changes playback rate', speed === 1.15, `rate ${speed}`);
  await ev(`document.getElementById('audio').pause()`);

  // ---- what has been heard shows on the front page and in the class list
  await go('home');
  const back = await ev(`(() => { const d = document.querySelector('.door[href="#classes"]');
    return {p: d.style.getPropertyValue('--p'), info: d.querySelector('[data-door-info]').textContent,
      resume: !!document.getElementById('resumeBtn'), label: document.getElementById('resumeBtn')?.textContent.trim()}; })()`);
  check('the classes door shows progress and a continue button',
    parseFloat(back.p) > 0 && /chapters heard/.test(back.info) && back.resume, JSON.stringify(back));
  await go('classes');
  const row = await ev(`(() => { const li = document.querySelector('.list.classes .row[data-id="${FIRST}"]');
    return {p: li.style.getPropertyValue('--p'), info: li.querySelector('[data-info]').textContent, meter: li.classList.contains('heard')}; })()`);
  check('the class row shows the same progress', parseFloat(row.p) > 0 && /chapters heard/.test(row.info) && row.meter, JSON.stringify(row));

  // ---- a class links to its papers, and the paper opens
  const withReadings = DATA.catalog.find((c) => c.ready && c.readings.some((r) => RREADY.includes(r)))
    || DATA.catalog.find((c) => c.ready && c.readings.length);
  const target = withReadings.readings.find((r) => RREADY.includes(r)) || withReadings.readings[0];
  await go(withReadings.id);
  const hasLink = await ev(`!!document.querySelector('.lec-head a[href="#${target}"]')`);
  await ev(`document.querySelector('.lec-head a[href="#${target}"]')?.click()`); await sleep(700);
  const opened = await ev(`({hash: location.hash, h1: document.querySelector('h1')?.textContent})`);
  check(`#${withReadings.id} links to its paper ${target}`,
    hasLink && opened.hash === '#' + target && opened.h1 === READINGS.find((r) => r.id === target).title, JSON.stringify(opened));

  // ---- breadcrumbs and Where next on both views
  const paperCrumbs = await ev(`({crumbs: !!document.querySelector('.crumbs a[href="#papers"]'), next: !!document.querySelector('section.next'),
    h2: document.querySelector('section.next h2')?.textContent})`);
  check('a paper has a breadcrumb back to Papers and a Where next block',
    paperCrumbs.crumbs && paperCrumbs.next && paperCrumbs.h2 === 'Where next', JSON.stringify(paperCrumbs));
  await go(FIRST);
  const classCrumbs = await ev(`({crumbs: !!document.querySelector('.crumbs a[href="#classes"]'), next: !!document.querySelector('section.next')})`);
  check('a class has a breadcrumb back to Classes and a Where next block', classCrumbs.crumbs && classCrumbs.next, JSON.stringify(classCrumbs));

  // ---- the top bar stays put while a paper is scrolled
  await go(RREADY[0]);
  await ev(`window.scrollTo(0, 3000)`); await sleep(500);
  const bar = await ev(`(() => { const t = document.querySelector('.topbar').getBoundingClientRect();
    const links = [...document.querySelectorAll('.mainnav a')].map((a) => { const r = a.getBoundingClientRect();
      return {href: a.getAttribute('href'), w: Math.round(r.width), top: Math.round(r.top), bottom: Math.round(r.bottom)}; });
    return {top: Math.round(t.top), vh: window.innerHeight, y: Math.round(window.scrollY), links}; })()`);
  check('the top bar stays at the top of a scrolled paper',
    bar.top >= -1 && bar.top <= 1 && bar.y > 500, JSON.stringify({top: bar.top, y: bar.y}));
  check('both top bar links stay visible',
    bar.links.length === 2 && bar.links.every((l) => l.w > 0 && l.top >= 0 && l.bottom <= bar.vh), JSON.stringify(bar.links));

  // ---- the player title leads back to what is playing
  const nowLink = await ev(`({href: document.getElementById('nowTitle').getAttribute('href'),
    text: document.getElementById('nowTitle').textContent, tag: document.getElementById('nowTitle').tagName})`);
  await ev(`document.querySelector('.mainnav a[href="#papers"]').click()`); await sleep(700);
  const nav = await ev(`({papers: !!document.querySelector('.list.papers'),
    current: document.querySelector('.mainnav a[href="#papers"]').getAttribute('aria-current')})`);
  check('the Papers link in the top bar opens the papers page',
    nav.papers && nav.current === 'page', JSON.stringify(nav));
  check('the player title names what is playing and links to it',
    nowLink.tag === 'A' && nowLink.href === '#' + FIRST && nowLink.text.startsWith('Class '), JSON.stringify(nowLink));
  await ev(`document.getElementById('nowTitle').click()`); await sleep(800);
  const nowOpen = await ev(`({hash: location.hash, h1: document.querySelector('h1')?.textContent})`);
  check('the player title opens what is playing', nowOpen.hash === '#' + FIRST, JSON.stringify(nowOpen));

  // ---- every ready paper opens with its chapters and page subheadings
  const bad = [];
  for (const RF of RREADY) {
    const RL = DATA.lectures[RF];
    const labels = RL.chapters.flatMap((c) => (c.labels || []).filter(Boolean)).length;
    await go(RF);
    const rv = await ev(`({stops: document.querySelectorAll('.chapters .stop').length, sections: document.querySelectorAll('section.chapter').length,
      pages: document.querySelectorAll('h3.pg').length})`);
    if (!(rv.stops === RL.chapters.length && rv.sections === RL.chapters.length && rv.pages === labels && labels > 0)) bad.push({RF, ...rv, labels});
  }
  check(`all ${RREADY.length} ready papers open with their chapters and page subheadings`, bad.length === 0, JSON.stringify(bad));

  // ---- a page link opens a paper at that page
  let pageCase = null;
  for (const c of DATA.catalog.filter((c) => c.ready)) {
    await go(c.id);
    pageCase = await ev(`(() => { for (const a of document.querySelectorAll('.src a[data-page]')) {
        const rid = a.getAttribute('href').slice(1);
        if (${JSON.stringify(RREADY)}.includes(rid)) return {lecture: '${c.id}', rid, page: a.dataset.page}; }
      return null; })()`);
    if (pageCase) break;
  }
  if (pageCase) {
    await ev(`document.querySelector('.src a[data-page="${pageCase.page}"][href="#${pageCase.rid}"]').click()`); await sleep(900);
    const at = await ev(`(() => { const el = document.getElementById('page-${pageCase.page}');
      return {hash: location.hash, found: !!el, top: el ? Math.round(el.getBoundingClientRect().top) : null}; })()`);
    check(`a page link in ${pageCase.lecture} opens ${pageCase.rid} at page ${pageCase.page}`,
      at.hash === '#' + pageCase.rid && (!at.found || (at.top >= -5 && at.top < 400)), JSON.stringify(at));
  } else {
    console.log('  (no class links to a page of a ready paper yet: page-link check skipped)');
  }

  if (SOON) {
    await go(SOON);
    const soon = await ev(`!!document.querySelector('.soon-note')`);
    check(`#${SOON} (not ready) shows that it is in preparation`, soon);
  } else {
    console.log('  (every class is ready: the class not-ready check is skipped)');
  }
  if (RSOON) {
    await go(RSOON);
    const title = READINGS.find((r) => r.id === RSOON).title;
    const soon = await ev(`!!document.querySelector('.soon-note') && document.querySelector('h1')?.textContent === ${JSON.stringify(title)}`);
    check(`#${RSOON} (not ready) shows that it is in preparation`, soon);
  } else {
    console.log('  (every paper is ready: the paper not-ready check is skipped)');
  }

  // ---- phone: no horizontal scroll, light and dark, on all five views
  // claude.ai adds the viewport meta when it publishes; add the same one here.
  await ev(`document.head.insertAdjacentHTML('afterbegin', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">')`);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const views = [['home', 'home'], ['classes', 'classes'], ['papers', 'papers'], [FIRST, 'lecture'], ...(RREADY.length ? [[RREADY[0], 'reading']] : [])];
  for (const [hash, name] of views) {
    await go(hash); await sleep(500);
    const w = await ev(`({scroll: document.documentElement.scrollWidth, inner: window.innerWidth})`);
    check(`no horizontal scroll at phone width (${name})`, w.inner === 390 && w.scroll <= w.inner, JSON.stringify(w));
    await shot(`phone-${name}.png`);
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
    await sleep(500); await shot(`phone-${name}-dark.png`);
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  }

  check('no script errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  ws.close();
} catch (e) {
  console.log('[FAIL] harness error: ' + e.message); failures++;
} finally {
  chrome.kill();
  console.log(failures ? `${failures} check(s) failed` : 'ALL PAGE CHECKS PASSED');
  process.exitCode = failures ? 1 : 0;
}
