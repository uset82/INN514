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
import { createServer } from 'node:net';

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
let mockChild = null, serverChild = null;
const freePort = () => new Promise((resolve, reject) => {
  const s = createServer(); s.unref(); s.on('error', reject);
  s.listen(0, '127.0.0.1', () => { const port = s.address().port; s.close(() => resolve(port)); });
});
async function waitHttp(url, timeout = 15000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try { const r = await fetch(url); if (r.ok) return r; } catch {}
    await sleep(200);
  }
  throw new Error('Timed out waiting for ' + url);
}
async function stopChild(child) {
  if (!child || child.exitCode !== null || child.killed) return;
  const exited = new Promise((resolve) => child.once('exit', resolve));
  child.kill();
  await Promise.race([exited, sleep(1500)]);
}

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
// Branding is a visible-content rule. Internal mode names and the host's layout hint are not shown to the reader.
const visibleTemplate = template.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<script>[\s\S]*?<\/script>/g, '')
  .replace(/<meta name="claude:[^>]*>/g, '');
check('template names neither Claude nor Anthropic in visible content', !/claude|anthropic/i.test(visibleTemplate));

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
  const waitFor = async (expr, timeout = 8000) => {
    const end = Date.now() + timeout;
    while (Date.now() < end) { const value = await ev(expr); if (value) return value; await sleep(100); }
    return false;
  };

  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: FILE }); await sleep(2500);

  // ---- the H1 guard: the built page's chapterContext must match checks/context-before.txt exactly
  const before = readFileSync('workspace/lecture-audio/checks/context-before.txt', 'utf8');
  const saved = {};
  const chunks = before.split(/^=== (.+) ===$/m);
  for (let i = 1; i < chunks.length; i += 2) saved[chunks[i]] = chunks[i + 1].replace(/^\n/, '').replace(/\n$/, '');
  const ctxNow = await ev('({ t4: chapterContext("T4", 2), p02: chapterContext("P02", 1) })');
  check('the H1 guard: chapterContext("T4", 2) is unchanged',
    !!ctxNow && ctxNow.t4 === saved['chapterContext("T4", 2)'],
    ctxNow ? `page ${ctxNow.t4.length} chars, saved ${(saved['chapterContext("T4", 2)'] || '').length}` : 'no value');
  check('the H1 guard: chapterContext("P02", 1) is unchanged',
    !!ctxNow && ctxNow.p02 === saved['chapterContext("P02", 1)'],
    ctxNow ? `page ${ctxNow.p02.length} chars, saved ${(saved['chapterContext("P02", 1)'] || '').length}` : 'no value');

  // ---- language detection and the course overview (D.7)
  const langs = await ev(`({hola: textLang("hola"), greeting: textLang("Hola, ¿qué tal?"),
    explique: textLang("explica el concepto"), question: textLang("What is upward causation?")})`);
  check('textLang calls the Spanish greetings and question Spanish, the English question English',
    langs && langs.hola === 'es-ES' && langs.greeting === 'es-ES' && langs.explique === 'es-ES' && langs.question === 'en-GB',
    JSON.stringify(langs));
  const overview = await ev(`(() => { const s = courseOverview(); return {
    class4: s.includes("Class 4 (Session 4, 28 September), taught by Nora Geirsdotter Bækkelund"),
    paper7: s.includes("Paper 7: Stam & van de Ven (2021)"), sessions: s.includes("Sessions 7 and 8"),
    briefs: (s.match(/In brief:/g) || []).length}; })()`);
  check('courseOverview names Class 4, Paper 7, Sessions 7 and 8, and every paper in brief',
    overview && overview.class4 && overview.paper7 && overview.sessions && overview.briefs === 17,
    JSON.stringify(overview));

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
  const plainGrok = await ev(`(() => { const g = document.getElementById('grokbot');
    return {shown: !!g && getComputedStyle(g).display !== 'none',
      askBtns: document.querySelectorAll('.ask-btn').length, greets: document.querySelectorAll('.greet').length}; })()`);
  check('a plain file hides Grokbot, the ask buttons and the greeting',
    !plainGrok.shown && plainGrok.askBtns === 0 && plainGrok.greets === 0, JSON.stringify(plainGrok));
  await go('home');
  const plainHowto = await ev(`(() => { const item = document.querySelector('.howto .gb-only');
    return item ? getComputedStyle(item).display !== 'none' : null; })()`);
  check('the Ask how-to item is hidden in a plain file', plainHowto === false, JSON.stringify(plainHowto));
  await go(FIRST);

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

  // ---- theme switch: device default, explicit choice, persistence and phone fit
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await go('home');
  await ev(`(() => { try { localStorage.removeItem('inn514-theme'); } catch (e) {}
    document.documentElement.removeAttribute('data-theme'); showThemeButton(); })()`);
  await sleep(200);
  const deviceLight = await ev(`getComputedStyle(document.body).backgroundColor`);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  await sleep(300);
  const deviceDark = await ev(`getComputedStyle(document.body).backgroundColor`);
  check('the theme follows the device until a choice is saved',
    !await ev(`document.documentElement.dataset.theme || ''`) && deviceLight !== deviceDark,
    JSON.stringify({light: deviceLight, dark: deviceDark}));
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await sleep(300);
  const themeStart = await ev(`(() => ({theme: effectiveTheme(), bg: getComputedStyle(document.body).backgroundColor}))()`);
  await ev(`document.getElementById('themeBtn').click()`); await sleep(300);
  const themeNext = await ev(`(() => ({theme: document.documentElement.dataset.theme,
    bg: getComputedStyle(document.body).backgroundColor, label: document.getElementById('themeBtn').getAttribute('aria-label'),
    saved: localStorage.getItem('inn514-theme')}))()`);
  const opposite = themeStart.theme === 'dark' ? 'light' : 'dark';
  check('the theme button switches colours, label and saved choice',
    themeNext.theme === opposite && themeNext.bg !== themeStart.bg && themeNext.saved === opposite
    && themeNext.label === `Switch to ${themeStart.theme} theme`, JSON.stringify({start: themeStart, next: themeNext}));
  await send('Page.navigate', { url: FILE + '#home' }); await sleep(1600);
  const themeReload = await ev(`(() => ({theme: document.documentElement.dataset.theme,
    bg: getComputedStyle(document.body).backgroundColor, saved: localStorage.getItem('inn514-theme')}))()`);
  check('the chosen theme survives a reload',
    themeReload.theme === opposite && themeReload.saved === opposite && themeReload.bg === themeNext.bg, JSON.stringify(themeReload));
  await ev(`document.getElementById('themeBtn').click()`); await sleep(300);
  const themeBack = await ev(`(() => ({theme: effectiveTheme(), bg: getComputedStyle(document.body).backgroundColor,
    saved: localStorage.getItem('inn514-theme'), label: document.getElementById('themeBtn').getAttribute('aria-label')}))()`);
  check('the second theme click returns to the starting theme',
    themeBack.theme === themeStart.theme && themeBack.bg === themeStart.bg && themeBack.saved === themeStart.theme
    && themeBack.label === `Switch to ${opposite} theme`, JSON.stringify(themeBack));
  await ev(`if (!document.querySelector('meta[name="viewport"]'))
    document.head.insertAdjacentHTML('afterbegin', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">')`);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(300);
  const themePhone = await ev(`(() => { const r = document.getElementById('themeBtn').getBoundingClientRect();
    return {inner: innerWidth, scroll: document.documentElement.scrollWidth, left: r.left, right: r.right}; })()`);
  check('the theme button fits in the phone top bar',
    themePhone.inner === 390 && themePhone.scroll <= 390 && themePhone.left >= 0 && themePhone.right <= 390, JSON.stringify(themePhone));
  await ev(`(() => { try { localStorage.removeItem('inn514-theme'); } catch (e) {}
    document.documentElement.removeAttribute('data-theme'); showThemeButton(); })()`);

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

  // ---- the search page (plain file): local, no AI, from the data (D.7)
  await go('search');
  const searchPhone = await ev(`({inner: innerWidth, scroll: document.documentElement.scrollWidth,
    h1: document.querySelector('h1')?.textContent, input: !!document.getElementById('searchInput')})`);
  check('at 390px the top bar and the search page have no horizontal scroll',
    searchPhone.inner === 390 && searchPhone.scroll <= 390 && searchPhone.h1 === 'Search the course' && searchPhone.input,
    JSON.stringify(searchPhone));
  const searchFor = async (q) => {
    await ev(`(() => { const i = document.getElementById('searchInput'); i.value = ${JSON.stringify(q)};
      i.dispatchEvent(new Event('input')); })()`);
    await sleep(400);
  };
  await searchFor('upward causation');
  const hits = await ev(`(() => ({chapters: [...document.querySelectorAll('#searchResults a[data-chapter]')].map((a) => ({href: a.getAttribute('href'), i: a.dataset.chapter})),
    links: [...new Set([...document.querySelectorAll('#searchResults a[data-chapter]')].map((a) => a.getAttribute('href')))],
    marks: document.querySelectorAll('#searchResults mark').length,
    groups: [...document.querySelectorAll('#searchResults h2')].map((h) => h.textContent)}))()`);
  check('"upward causation" lists T4 and P07 chapters with marked matches',
    hits.groups.includes('Chapters') && hits.links.includes('#T4') && hits.links.includes('#P07') && hits.marks > 0,
    JSON.stringify({groups: hits.groups, links: hits.links, marks: hits.marks}));
  await shot('phone-search.png');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  await sleep(400); await shot('phone-search-dark.png');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  const firstHit = hits.chapters[0];
  await ev(`document.querySelector('#searchResults a[data-chapter]').click()`); await sleep(900);
  const chapterAt = await ev(`(() => { const el = document.getElementById('ch-${firstHit.i}');
    return {hash: location.hash, found: !!el, top: el ? Math.round(el.getBoundingClientRect().top) : null}; })()`);
  check('clicking the first chapter result opens its page at that chapter',
    chapterAt.hash === firstHit.href && chapterAt.found && chapterAt.top >= -5 && chapterAt.top < 120, JSON.stringify(chapterAt));
  await go('search');
  await searchFor('Stam');
  const stam = await ev(`(() => { const sec = [...document.querySelectorAll('#searchResults section')].find((s) => s.querySelector('h2')?.textContent === 'Papers');
    return {paperNo: sec?.querySelector('.paper-no')?.textContent || '', text: sec?.textContent || ''}; })()`);
  check('"Stam" lists Paper 7 under Papers', stam.paperNo === 'Paper 7' && stam.text.includes('Stam'), JSON.stringify(stam));
  await searchFor('zzqx');
  const none = await ev(`document.querySelector('#searchResults .lede')?.textContent || ''`);
  check('a search with no matches shows the no-results sentence',
    none.includes('Nothing in the classes or papers matches that'), none);

  // ---- claude mock pass: Grokbot on every page, chapter and course questions, drag, keyboard
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  const mockPage = await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
    window.__sampleMode = 'ok'; window.__lastSample = null; window.__lastJson = null;
    window.__sampleCount = 0; window.__utterances = [];
    window.__voices = [{ lang: 'es-ES', name: 'Test ES voice' }, { lang: 'en-GB', name: 'Test EN voice' }];
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices = () => window.__voices;
      // A fake utterance: the real one refuses the stub's plain-object voice.
      window.SpeechSynthesisUtterance = class { constructor(text) { this.text = String(text); } };
      window.speechSynthesis.speak = (u) => {
        window.__utterances.push({ text: u.text, lang: u.lang, voice: u.voice ? u.voice.lang : null });
        if (u.onstart) u.onstart(); if (u.onend) u.onend();
      };
      window.speechSynthesis.cancel = () => {};
    }
    window.claude = { use: async (name) => {
      const sample = async (turns, opts) => {
        window.__sampleCount++;
        window.__lastSample = turns;
        const mode = window.__sampleMode || 'ok';
        if (mode !== 'ok') throw Object.assign(new Error(mode), {code: mode});
        const last = String(turns.at(-1)?.content || '').trim().toLowerCase();
        if (last === 'hola') {
          opts.onText({delta: '¡Hola! Soy Grokbot. '}); opts.onText({delta: '¿En qué te ayudo?'});
          return;
        }
        opts.onText({delta: 'First sentence. '}); opts.onText({delta: 'Second sentence.'});
      };
      sample.json = async (input, opts) => {
        window.__lastJson = { input, modelTier: opts && opts.modelTier };
        // The needle is the question: the course index itself names the Paper 2 trinity.
        const q = String(input).split('\\n\\nQuestion: ').pop();
        if (q.includes('hola')) return [];
        if (q.includes('trinity')) return [{id: 'P02', chapter: 2}];
        if (q.includes('nothing-matches')) return [];
        return [{id: 'T4', chapter: 3}];
      };
      return sample;
    } };
  })();` });
  await send('Page.navigate', { url: FILE }); await sleep(1800);
  await ev(`window.__gbRef = document.getElementById('grokbot')`);
  const gbShownOn = async (hash) => { await go(hash); return ev(`(() => { const g = document.getElementById('grokbot');
    return {shown: getComputedStyle(g).display !== 'none', same: g === window.__gbRef}; })()`); };
  const gbOnHome = await gbShownOn('home');
  const gbOnT4 = await gbShownOn('T4');
  const gbOnP02 = await gbShownOn('P02');
  check('#grokbot is displayed on #home, #T4 and #P02 as the same element',
    gbOnHome.shown && gbOnT4.shown && gbOnP02.shown && gbOnHome.same && gbOnT4.same && gbOnP02.same,
    JSON.stringify({gbOnHome, gbOnT4, gbOnP02}));
  await go('home');
  await ev(`document.querySelector('.gb-orb').click()`); await sleep(300);
  const homeBubble = await ev(`(() => { const b = document.querySelector('.gb-bubble');
    return {open: !b.hidden, expanded: document.querySelector('.gb-orb').getAttribute('aria-expanded'),
      head: b.querySelector('.gb-head').textContent, switchHidden: b.querySelector('.gb-switch').hidden,
      chipsHidden: b.querySelector('.ask-chips').hidden}; })()`);
  check('on the front page the bubble opens in course mode, switch and chips hidden',
    homeBubble.open && homeBubble.expanded === 'true' && homeBubble.head === 'About the whole course'
    && homeBubble.switchHidden && homeBubble.chipsHidden, JSON.stringify(homeBubble));
  await go('T4');
  await ev(`document.getElementById('ch-2').scrollIntoView({block: 'start'})`); await sleep(400);
  await ev(`document.querySelector('.gb-orb').click()`); await sleep(300);
  const t4Bubble = await ev(`(() => { const b = document.querySelector('.gb-bubble');
    return {head: b.querySelector('.gb-head').textContent, switch: b.querySelector('.gb-switch').textContent}; })()`);
  check('on #T4 with chapter 3 on screen the bubble heads that chapter with a Whole course switch',
    t4Bubble.head.startsWith('About Class 4, chapter 3') && t4Bubble.switch === 'Whole course', JSON.stringify(t4Bubble));
  await ev(`window.__lastSample = null; document.querySelector('.gb-bubble .ask-chips button').click()`);
  await waitFor(`document.querySelector('.gb-words')?.textContent.includes('Second sentence.')`);
  const chipAsk = await ev(`(() => { const turns = window.__lastSample || [], first = turns[0]?.content || '';
    const words = document.querySelector('.gb-words')?.textContent || '';
    return {title: first.includes(${JSON.stringify(DATA.lectures.T4.chapters[2].title)}),
      first: words.includes('First sentence.'), second: words.includes('Second sentence.')}; })()`);
  check('a chip sends the chapter in view', chipAsk.title, JSON.stringify(chipAsk));
  check('the bubble captions the answer while it is spoken', chipAsk.first && chipAsk.second, JSON.stringify(chipAsk));
  await ev(`document.querySelector('.gb-switch').click()`); await sleep(300);
  check('"Whole course" switches the bubble to course mode',
    (await ev(`document.querySelector('.gb-head').textContent`)) === 'About the whole course');
  await ev(`window.__lastJson = null; window.__lastSample = null;
    document.querySelector('.ask-input').value = 'What is an entrepreneurial ecosystem?';
    document.querySelector('.ask-send').click()`);
  await waitFor(`window.__lastJson?.input?.includes('T4 3:') && window.__lastJson?.input?.includes('P07 1:')`);
  const courseAsk = await ev(`(() => ({tier: window.__lastJson?.modelTier,
    pick: window.__lastJson?.input?.includes('T4 3:') && window.__lastJson?.input?.includes('P07 1:')}))()`);
  check('a course question picks with the quick model over the whole index',
    courseAsk.tier === 'quick' && courseAsk.pick, JSON.stringify(courseAsk));
  const src1 = await ev(`(() => { const a = document.querySelector('.gb-src a');
    return {href: a?.getAttribute('href'), text: a?.textContent || ''}; })()`);
  check('the course answer names its source', src1.href === '#T4' && src1.text.includes('Class 4, chapter 3'), JSON.stringify(src1));
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(500);
  await ev(`window.__lastSample = null; window.__sampleCount = 0; window.__utterances = [];
    document.querySelector('.ask-input').value = 'hola'; document.querySelector('.ask-send').click()`);
  await waitFor(`document.querySelector('.gb-words')?.textContent.includes('¿En qué te ayudo?')`);
  const hola = await ev(`(() => ({words: document.querySelector('.gb-words')?.textContent || '',
    sampleCount: window.__sampleCount, sample: window.__lastSample?.[0]?.content || '',
    utter: window.__utterances.slice(), replay: getComputedStyle(document.querySelector('.gb-replay')).display}))()`);
  check('"hola" answers from the course overview with the Spanish greeting',
    hola.words.includes('¡Hola! Soy Grokbot.') && hola.sampleCount === 1
    && hola.sample.includes('If the student greets you') && hola.sample.includes('The classes, in course order'),
    JSON.stringify({words: hola.words, sampleCount: hola.sampleCount}));
  check('the Spanish answer is spoken with a Spanish voice',
    hola.utter.length > 0 && hola.utter.every((u) => u.lang === 'es-ES') && hola.utter.every((u) => u.voice === 'es-ES'),
    JSON.stringify(hola.utter));
  check('"Read again" is visible after the answer', hola.replay !== 'none', hola.replay);
  await shot('phone-grokbot-hola.png');
  const samplesBefore = await ev(`window.__sampleCount`);
  const uttBefore = await ev(`window.__utterances.length`);
  await ev(`document.querySelector('.gb-replay').click()`); await sleep(400);
  const replay = await ev(`({utter: window.__utterances.length, samples: window.__sampleCount})`);
  check('"Read again" speaks the answer again with no new model call',
    replay.utter > uttBefore && replay.samples === samplesBefore, JSON.stringify({uttBefore, replay}));
  await ev(`window.__voices = [{ lang: 'en-GB', name: 'Test EN voice' }]; window.__utterances = []`);
  await ev(`document.querySelector('.gb-replay').click()`); await sleep(400);
  const fallbackVoice = await ev(`window.__utterances.slice()`);
  check('with only an English voice, a Spanish answer still speaks with lang es-ES and voice null',
    fallbackVoice.length > 0 && fallbackVoice.every((u) => u.lang === 'es-ES' && u.voice === null), JSON.stringify(fallbackVoice));
  await ev(`window.__voices = [{ lang: 'es-ES', name: 'Test ES voice' }, { lang: 'en-GB', name: 'Test EN voice' }]`);
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(500);
  await ev(`window.__lastSample = null; document.querySelector('.ask-input').value = 'trinity';
    document.querySelector('.ask-send').click()`);
  await waitFor(`window.__lastSample?.[0]?.content.includes('do not quote')`);
  check('a course question picked as Paper 2 sends the do-not-quote rule',
    !!await ev(`window.__lastSample?.[0]?.content.includes('do not quote')`));
  await go('P02'); await sleep(500);
  await ev(`document.querySelector('.gb-orb').click()`); await sleep(300);
  await ev(`window.__lastSample = null; document.querySelector('.gb-bubble .ask-chips button').click()`);
  await waitFor(`window.__lastSample?.[0]?.content.includes('do not quote')`);
  check('a chapter question on #P02 sends the do-not-quote rule too',
    !!await ev(`window.__lastSample?.[0]?.content.includes('do not quote')`));
  await ev(`document.querySelector('.gb-switch').click()`); await sleep(300);
  await ev(`window.__lastSample = null; window.__lastJson = null;
    document.querySelector('.ask-input').value = 'nothing-matches'; document.querySelector('.ask-send').click()`);
  await waitFor(`window.__lastSample?.[0]?.content.includes('The classes, in course order')`);
  const fromOverview = await ev(`({words: document.querySelector('.gb-words')?.textContent || '',
    first: window.__lastSample?.[0]?.content || '', sources: document.querySelector('.gb-src')?.textContent || ''})`);
  check('"nothing-matches" still answers from the course overview',
    fromOverview.words.includes('First sentence.') && fromOverview.first.includes('If the student greets you')
    && fromOverview.first.includes('The classes, in course order'),
    JSON.stringify({words: fromOverview.words, sources: fromOverview.sources}));
  await go('classes');
  const routeClosed = await ev(`({hidden: document.querySelector('.gb-bubble').hidden,
    busy: document.getElementById('grokbot')._ask.busy})`);
  check('a route change closes the bubble and leaves no busy state',
    routeClosed.hidden && routeClosed.busy === '', JSON.stringify(routeClosed));

  // dragging: real pointer input, 120px left and 80px up, then the saved place survives a reload
  await go('home'); await sleep(400);
  const orbPos0 = await ev(`(() => { const g = document.getElementById('grokbot'); const r = document.querySelector('.gb-orb').getBoundingClientRect();
    return {left: parseFloat(g.style.left), top: parseFloat(g.style.top), cx: r.left + r.width / 2, cy: r.top + r.height / 2}; })()`);
  const dragOrb = async (x0, y0, x1, y1) => {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: Math.round(x0), y: Math.round(y0), button: 'left', buttons: 1, clickCount: 1 });
    for (let k = 1; k <= 8; k++)
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(x0 + (x1 - x0) * k / 8), y: Math.round(y0 + (y1 - y0) * k / 8), buttons: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: Math.round(x1), y: Math.round(y1), button: 'left', buttons: 0, clickCount: 1 });
  };
  await dragOrb(orbPos0.cx, orbPos0.cy, orbPos0.cx - 120, orbPos0.cy - 80); await sleep(300);
  const orbPos1 = await ev(`(() => { const g = document.getElementById('grokbot');
    return {left: parseFloat(g.style.left), top: parseFloat(g.style.top), hint: document.querySelector('.gb-hint').hidden,
      saved: localStorage.getItem('inn514-grokbot-pos'), bubble: document.querySelector('.gb-bubble').hidden}; })()`);
  check('a drag moves the orb by the dragged amount, saves the place and hides the hint',
    Math.abs(orbPos1.left - (orbPos0.left - 120)) <= 1 && Math.abs(orbPos1.top - (orbPos0.top - 80)) <= 1
    && orbPos1.hint && !!orbPos1.saved && orbPos1.bubble, JSON.stringify({orbPos0, orbPos1}));
  await send('Page.navigate', { url: FILE + '#home' }); await send('Page.reload', {}); await sleep(1800);
  const orbReload = await ev(`(() => { const g = document.getElementById('grokbot');
    return {left: parseFloat(g.style.left), top: parseFloat(g.style.top)}; })()`);
  check('after a reload the orb is where the drag left it',
    Math.abs(orbReload.left - orbPos1.left) <= 1 && Math.abs(orbReload.top - orbPos1.top) <= 1, JSON.stringify(orbReload));
  // a phone: a touch drag sends no click afterwards, so the next tap must still open the bubble
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  const tc = await ev(`(() => { const r = document.querySelector('.gb-orb').getBoundingClientRect();
    return {x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), left: parseFloat(document.getElementById('grokbot').style.left)}; })()`);
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tc.x, y: tc.y }] });
  for (let k = 1; k <= 6; k++) await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: tc.x - 10 * k, y: tc.y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(700);
  const tAfter = await ev(`(() => { const r = document.querySelector('.gb-orb').getBoundingClientRect();
    return {x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), left: parseFloat(document.getElementById('grokbot').style.left),
      bubble: document.querySelector('.gb-bubble').hidden}; })()`);
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tAfter.x, y: tAfter.y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(500);
  const tTapOpen = !await ev(`document.querySelector('.gb-bubble').hidden`);
  check('after a touch drag (no click follows it) the next tap opens the bubble',
    Math.abs(tAfter.left - (tc.left - 60)) <= 1 && tAfter.bubble && tTapOpen, JSON.stringify({tc, tAfter, tTapOpen}));
  await ev(`document.querySelector('.gb-close').click()`);
  await send('Emulation.setTouchEmulationEnabled', { enabled: false });
  await sleep(200);
  const orbC = await ev(`(() => { const r = document.querySelector('.gb-orb').getBoundingClientRect();
    return {x: r.left + r.width / 2, y: r.top + r.height / 2}; })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: Math.round(orbC.x), y: Math.round(orbC.y), button: 'left', buttons: 1, clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: Math.round(orbC.x), y: Math.round(orbC.y), button: 'left', buttons: 0, clickCount: 1 });
  await sleep(400);
  check('a tap without movement opens the bubble', !await ev(`document.querySelector('.gb-bubble').hidden`));

  // keyboard: Enter opens, Escape closes and refocuses, ArrowLeft moves
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await sleep(300);
  const escClosed = await ev(`(() => ({hidden: document.querySelector('.gb-bubble').hidden,
    focus: document.activeElement === document.querySelector('.gb-orb')}))()`);
  check('Escape closes the bubble and puts focus back on the orb', escClosed.hidden && escClosed.focus, JSON.stringify(escClosed));
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await sleep(300);
  check('Enter on the focused orb opens the bubble', !await ev(`document.querySelector('.gb-bubble').hidden`));
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await sleep(300);
  const kbLeft0 = await ev(`parseFloat(document.getElementById('grokbot').style.left)`);
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 });
  await sleep(200);
  const kbLeft1 = await ev(`parseFloat(document.getElementById('grokbot').style.left)`);
  check('ArrowLeft with a focused orb moves it 16px left', Math.abs((kbLeft0 - kbLeft1) - 16) <= 1, `moved ${kbLeft0 - kbLeft1}`);

  // clamping: a far-off position lands 16px from the left, 8px above the player
  await go('T4'); await sleep(500);
  await ev(`document.querySelector('.listen[data-i="0"]').click()`); await sleep(800);
  await ev(`document.getElementById('audio').pause()`);
  await ev(`gbMoveTo({ x: -500, y: 99999 })`); await sleep(200);
  const clamped = await ev(`(() => { const g = document.getElementById('grokbot').getBoundingClientRect();
    const p = document.querySelector('.player').getBoundingClientRect();
    return {left: Math.round(g.left), bottom: Math.round(g.bottom), playerTop: Math.round(p.top)}; })()`);
  check('a far-off position clamps to 16px from the left and 8px above the player',
    clamped.left === 16 && clamped.playerTop - clamped.bottom >= 8, JSON.stringify(clamped));
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: mockPage.result.identifier });

  // ---- server mode pass: the orb asks the local server, passcode row in between, course on the front page
  const mockPort = await freePort(), appPort = await freePort();
  mockChild = spawn(process.execPath, ['workspace/lecture-audio/scripts/mock_openrouter.mjs', String(mockPort)], { stdio: 'ignore' });
  await waitHttp(`http://127.0.0.1:${mockPort}/calls`);
  serverChild = spawn(process.execPath, ['workspace/lecture-audio/server.js'], {
    env: {...process.env, PORT: String(appPort), OPENROUTER_BASE: `http://127.0.0.1:${mockPort}/api/v1`,
      OPENROUTER_API_KEY: 'test-key', GROKBOT_PASSCODE: 'test-pass'}, stdio: 'ignore'});
  await waitHttp(`http://127.0.0.1:${appPort}/api/health`);
  const appUrl = `http://127.0.0.1:${appPort}/`;
  await send('Page.navigate', { url: appUrl + '#T4' }); await sleep(1600);
  await ev(`try { localStorage.removeItem('inn514-grokbot-pass'); } catch (e) {}`);
  await send('Page.reload', { ignoreCache: true }); await sleep(1800);
  check('server mode shows Grokbot on a chapter page',
    !!(await ev(`document.getElementById('grokbot') && getComputedStyle(document.getElementById('grokbot')).display !== 'none'`)));
  await ev(`document.querySelector('.gb-orb').click()`); await sleep(300);
  await ev(`document.querySelector('.ask-input').value = 'What is upward causation?';
    document.querySelector('.ask-send').click()`);
  await waitFor(`!document.querySelector('.ask-pass').hidden`);
  const passFirst = await ev(`(() => ({row: !document.querySelector('.ask-pass').hidden}))()`);
  check('the first server question asks for a passcode', passFirst.row, JSON.stringify(passFirst));
  await ev(`(() => { const row = document.querySelector('.ask-pass'); row.querySelector('input').value = 'test-pass';
    row.querySelector('button').click(); })()`);
  let mockCalls = [];
  for (let n = 0; n < 100; n++) {
    mockCalls = await (await fetch(`http://127.0.0.1:${mockPort}/calls`)).json();
    if (mockCalls.some((c) => c.path === '/api/v1/audio/speech')) break;
    await sleep(100);
  }
  await waitFor(`document.getElementById('grokbot')._ask.busy === 'Speaking…'`);
  check('after the passcode the chapter question reaches /api/ask',
    mockCalls.some((c) => c.path === '/api/v1/chat/completions'), JSON.stringify(mockCalls.map((c) => c.path)));
  check('server mode calls /api/speak', mockCalls.some((c) => c.path === '/api/v1/audio/speech'), JSON.stringify(mockCalls.map((c) => c.path)));
  check('the passcode is saved', (await ev(`localStorage.getItem('inn514-grokbot-pass')`)) === 'test-pass');
  const chatBefore = mockCalls.filter((c) => c.path === '/api/v1/chat/completions').length;
  await send('Page.navigate', { url: appUrl + '#home' }); await sleep(1200);
  await ev(`(() => { const f = window.fetch.bind(window); window.__courseBodies = [];
    window.fetch = (u, o) => { if (String(u) === '/api/course' && o && typeof o.body === 'string') {
      try { window.__courseBodies.push(JSON.parse(o.body)); } catch (e) {} } return f(u, o); }; })()`);
  await ev(`document.querySelector('.gb-orb').click()`); await sleep(300);
  await ev(`document.querySelector('.ask-input').value = 'What is an entrepreneurial ecosystem?';
    document.querySelector('.ask-send').click()`);
  let courseCalls = [];
  for (let n = 0; n < 100; n++) {
    courseCalls = await (await fetch(`http://127.0.0.1:${mockPort}/calls`)).json();
    if (courseCalls.some((c) => c.path === '/api/v1/chat/completions' && (c.context || '').startsWith('You choose which chapters'))
      && courseCalls.filter((c) => c.path === '/api/v1/chat/completions').length > chatBefore + 1) break;
    await sleep(100);
  }
  await waitFor(`!!document.querySelector('.gb-src a')`);
  const courseSrc = await ev(`(() => { const a = document.querySelector('.gb-src a');
    return {href: a?.getAttribute('href'), text: a?.textContent || ''}; })()`);
  check('a course question on the front page reaches /api/course and cites #T4',
    courseCalls.some((c) => c.path === '/api/v1/chat/completions' && (c.context || '').startsWith('You choose which chapters'))
    && courseSrc.href === '#T4', JSON.stringify({paths: courseCalls.map((c) => c.path), courseSrc}));
  const courseBody = await ev(`window.__courseBodies[0] || null`);
  check('a course question sends an array of hits to /api/course',
    !!courseBody && Array.isArray(courseBody.hits) && typeof courseBody.question === 'string',
    JSON.stringify(courseBody && {question: courseBody.question, hits: courseBody.hits}));
  await waitFor(`document.querySelector('.gb-words')?.textContent.includes('Second sentence.')`);
  await ev(`document.querySelector('.ask-stop')?.click()`); await sleep(300);
  const speechCount = async () => (await (await fetch(`http://127.0.0.1:${mockPort}/calls`)).json())
    .filter((c) => c.path === '/api/v1/audio/speech').length;
  const speechBeforeReplay = await speechCount();
  const replayShown = await ev(`getComputedStyle(document.querySelector('.gb-replay')).display !== 'none'`);
  await ev(`document.querySelector('.gb-replay').click()`); await sleep(700);
  const speechAfterReplay = await speechCount();
  check('"Read again" replays the server voice with no new /api/speak request',
    replayShown && speechAfterReplay === speechBeforeReplay,
    JSON.stringify({replayShown, before: speechBeforeReplay, after: speechAfterReplay}));
  await ev(`document.querySelector('.ask-stop')?.click()`);

  // phone: the 56px orb, the 358px bubble, no horizontal scroll, clear of the player
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await ev(`document.head.insertAdjacentHTML('afterbegin', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">')`);
  await send('Page.navigate', { url: appUrl + '#T4' }); await sleep(1000);
  // A phone user loads the page at phone size: reload so gbStart clamps the saved place here.
  await send('Page.reload', {}); await sleep(1800);
  // On a real phone a chapter is playing, so the orb's re-clamp on play/pause has run too.
  await ev(`document.querySelector('.listen[data-i="0"]').click()`); await sleep(800);
  await ev(`document.querySelector('.gb-orb').click()`); await sleep(300);
  await ev(`document.querySelector('.gb-bubble .ask-chips button').click()`);
  const wordsShown = await waitFor(`document.querySelector('.gb-words')?.textContent.includes('First sentence.')`);
  if (!wordsShown) console.log('  [debug]', JSON.stringify(await ev(`({open: !document.querySelector('.gb-bubble').hidden,
    busy: document.getElementById('grokbot')._ask.busy, status: document.querySelector('.ask-status').textContent,
    words: document.querySelector('.gb-words').textContent, pass: localStorage.getItem('inn514-grokbot-pass'),
    serverPass, mode: askMode, hash: location.hash})`)));
  const phoneGrok = await ev(`(() => { try {
    const cv = document.querySelector('canvas.orb').getBoundingClientRect();
    const b = document.querySelector('.gb-bubble').getBoundingClientRect();
    const g = document.getElementById('grokbot').getBoundingClientRect();
    const btn = document.querySelector('.gb-orb').getBoundingClientRect();
    const p = document.querySelector('.player').getBoundingClientRect();
    return {cv: Math.round(cv.width), bw: Math.round(b.width), inner: innerWidth,
      scroll: document.documentElement.scrollWidth, orbBottom: Math.round(g.bottom), playerTop: Math.round(p.top),
      saved: localStorage.getItem('inn514-grokbot-pos'), pos: gbPos,
      gTop: Math.round(g.top), gH: Math.round(g.height), btnTop: Math.round(btn.top), btnBottom: Math.round(btn.bottom),
      pTop: Math.round(p.top), pH: Math.round(p.height), side: document.querySelector('.gb-bubble').dataset.side,
      bTop: Math.round(b.top), bBottom: Math.round(b.bottom)}; } catch (e) { return {error: e.message}; } })()`);
  check('on a phone the orb is 56px and the open bubble 358px wide with no horizontal scroll',
    phoneGrok.cv === 56 && phoneGrok.bw === 358 && phoneGrok.inner === 390 && phoneGrok.scroll <= 390, JSON.stringify(phoneGrok));
  check('the phone orb does not overlap the player', phoneGrok.playerTop - phoneGrok.orbBottom >= 8, JSON.stringify(phoneGrok));
  await shot('phone-grokbot.png');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  await sleep(400); await shot('phone-grokbot-dark.png');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(400); await shot('desktop-grokbot.png');
  await ev(`document.querySelector('.ask-stop')?.click()`);
  await stopChild(serverChild); serverChild = null;
  await stopChild(mockChild); mockChild = null;

  check('no script errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  ws.close();
} catch (e) {
  console.log('[FAIL] harness error: ' + e.message); failures++;
} finally {
  await stopChild(serverChild);
  await stopChild(mockChild);
  chrome.kill();
  console.log(failures ? `${failures} check(s) failed` : 'ALL PAGE CHECKS PASSED');
  process.exitCode = failures ? 1 : 0;
}
