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
  const askVisibility = `(() => { const bs = [...document.querySelectorAll('.ask-btn')];
    return {count: bs.length, visible: bs.filter((b) => getComputedStyle(b).display !== 'none').length}; })()`;

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
  const greetPlain = await ev(`(() => { const g = document.querySelector('.greet'); const off = g && g.querySelector('.greet-off'); return {orb: !!(g && g.querySelector('.orb')), offShown: !!off && getComputedStyle(off).display !== 'none'}; })()`);
  check('the front page greets with the orb and says asking is off where nobody can ask', greetPlain.orb && greetPlain.offShown, JSON.stringify(greetPlain));
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
  const normalAsk = await ev(askVisibility);
  check('normal file load keeps every ask button hidden', normalAsk.count === NCH && normalAsk.visible === 0, JSON.stringify(normalAsk));

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

  // ---- claude mock pass: chapter context, one panel, fallback text and errors
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  const mockPage = await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
    window.__sampleMode = 'ok'; window.__lastSample = null;
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices = () => [];
      window.speechSynthesis.speak = () => {};
      window.speechSynthesis.cancel = () => {};
    }
    window.claude = { use: async (name) => async (turns, opts) => {
      window.__lastSample = turns;
      const mode = window.__sampleMode || 'ok';
      if (mode !== 'ok') throw Object.assign(new Error(mode), {code: mode});
      opts.onText({delta: 'First sentence. '}); opts.onText({delta: 'Second sentence.'});
    } };
  })();` });
  await send('Page.navigate', { url: FILE }); await sleep(1800);
  const greetAsk = await ev(`(() => { const g = document.querySelector('.greet'); const off = g && g.querySelector('.greet-off'); return {orb: !!(g && g.querySelector('.orb')), offShown: !!off && getComputedStyle(off).display !== 'none'}; })()`);
  check('where asking works, the front-page greeting shows the orb without the off line', greetAsk.orb && !greetAsk.offShown, JSON.stringify(greetAsk));
  await go(FIRST);
  const mockClass = await ev(askVisibility);
  check('the mock makes every class chapter ask button visible',
    mockClass.count === NCH && mockClass.visible === NCH, JSON.stringify(mockClass));
  const firstPanel = await ev(`(() => { const bs = document.querySelectorAll('.ask-btn'); bs[0].click();
    const p = document.querySelectorAll('.ask')[0]; return {open: !p.hidden, chips: p.querySelectorAll('.ask-chips button').length,
      input: p.querySelectorAll('.ask-input').length}; })()`);
  check('a chapter tap opens one panel with four chips and an input',
    firstPanel.open && firstPanel.chips === 4 && firstPanel.input === 1, JSON.stringify(firstPanel));
  const secondPanel = await ev(`(() => { const bs = document.querySelectorAll('.ask-btn'); bs[1].click();
    const ps = document.querySelectorAll('.ask'); return {firstClosed: ps[0].hidden, secondOpen: !ps[1].hidden,
      openCount: [...ps].filter((p) => !p.hidden).length}; })()`);
  check('a second chapter tap closes the first ask panel',
    secondPanel.firstClosed && secondPanel.secondOpen && secondPanel.openCount === 1, JSON.stringify(secondPanel));
  await ev(`window.__sampleMode = 'ok'; window.__lastSample = null;
    document.querySelectorAll('.ask')[1].querySelector('.ask-chips button').click()`);
  await waitFor(`document.querySelectorAll('.ask')[1].querySelector('.ask-text')?.textContent.includes('Second sentence.')`);
  const chip = await ev(`(() => { const turns = window.__lastSample || [], first = turns[0]?.content || '';
    const text = document.querySelectorAll('.ask')[1].querySelector('.ask-text')?.textContent || '';
    return {title: first.includes(${JSON.stringify(DATA.lectures[FIRST].chapters[1].title)}),
      rules: first.includes('You are a study helper'), backup: text.includes('This device has no voice'),
      first: text.includes('First sentence.'), second: text.includes('Second sentence.')}; })()`);
  check('a chip sends the chapter title and prompt rules', chip.title && chip.rules, JSON.stringify(chip));
  check('with no device voice the whole answer appears as backup text',
    chip.backup && chip.first && chip.second, JSON.stringify(chip));
  await go('P02');
  const mockPaper = await ev(askVisibility);
  const p02chapters = DATA.lectures.P02.chapters.length;
  check('the mock makes every paper chapter ask button visible',
    mockPaper.count === p02chapters && mockPaper.visible === p02chapters, JSON.stringify(mockPaper));
  await ev(`window.__sampleMode = 'ok'; window.__lastSample = null; document.querySelector('.ask-btn').click();
    document.querySelector('.ask:not([hidden]) .ask-chips button').click()`);
  await waitFor(`window.__lastSample?.[0]?.content.includes('do not quote')`);
  check('Paper 2 sends the do-not-quote rule', !!await ev(`window.__lastSample?.[0]?.content.includes('do not quote')`));
  await ev(`window.__sampleMode = 'not_granted'; document.querySelector('.ask:not([hidden]) .ask-chips button').click()`);
  await waitFor(`document.querySelector('.ask:not([hidden]) .ask-status')?.textContent.includes("Asking isn't available here.")`);
  await sleep(1300);
  const denied = await ev(`(() => ({status: document.querySelector('.ask:not([hidden]) .ask-status')?.textContent || '',
    visible: [...document.querySelectorAll('.ask-btn')].filter((b) => getComputedStyle(b).display !== 'none').length}))()`);
  check('not_granted hides every orb and keeps its error visible',
    denied.visible === 0 && denied.status.includes("Asking isn't available here."), JSON.stringify(denied));
  await send('Page.navigate', { url: FILE + '#' + FIRST }); await sleep(1800);
  await ev(`document.querySelector('.ask-btn').click(); window.__sampleMode = 'rate_limited';
    document.querySelector('.ask:not([hidden]) .ask-chips button').click()`);
  await waitFor(`document.querySelector('.ask-status')?.textContent.includes('Too many questions')`);
  await sleep(1300);
  const limited = await ev(`document.querySelector('.ask-status')?.textContent || ''`);
  check('rate_limited keeps its error visible', limited.includes('Too many questions right now. Try again in a minute.'), limited);
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  // The tab is already on the first class: navigating to the same address keeps the old page (and its open panel), so reload it.
  await send('Page.navigate', { url: FILE + '#' + FIRST }); await send('Page.reload', {}); await sleep(1800);
  await ev(`document.head.insertAdjacentHTML('afterbegin', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">');
    document.querySelector('.ask-btn').click(); window.__sampleMode = 'ok';
    document.querySelector('.ask:not([hidden]) .ask-chips button').click()`);
  await waitFor(`document.querySelector('.ask-text')?.textContent.includes('Second sentence.')`);
  const mockPhone = await ev(`({inner: innerWidth, scroll: document.documentElement.scrollWidth})`);
  check('the open ask panel has no horizontal scroll at 390 px',
    mockPhone.inner === 390 && mockPhone.scroll <= 390, JSON.stringify(mockPhone));
  await ev(`document.querySelector('.ask:not([hidden])')?.scrollIntoView({ block: 'center' })`); await sleep(300);
  const inView_claude = await ev(`(() => { const p = document.querySelector('.ask:not([hidden])'); const r = p && p.getBoundingClientRect();
    return {open: !!p, top: r ? Math.round(r.top) : null, bottom: r ? Math.round(r.bottom) : null, inner: innerHeight, y: scrollY, hash: location.hash}; })()`);
  check('the open claude ask panel is in view for its screenshot', inView_claude.open && inView_claude.top >= 0 && inView_claude.top < inView_claude.inner, JSON.stringify(inView_claude));
  await shot('phone-ask.png');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  await sleep(400); await shot('phone-ask-dark.png');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: mockPage.result.identifier });

  // ---- server mode pass: real page server, fake upstream, wrong then right passcode
  const mockPort = await freePort(), appPort = await freePort();
  mockChild = spawn(process.execPath, ['workspace/lecture-audio/scripts/mock_openrouter.mjs', String(mockPort)], { stdio: 'ignore' });
  await waitHttp(`http://127.0.0.1:${mockPort}/calls`);
  serverChild = spawn(process.execPath, ['workspace/lecture-audio/server.js'], {
    env: {...process.env, PORT: String(appPort), OPENROUTER_BASE: `http://127.0.0.1:${mockPort}/api/v1`,
      OPENROUTER_API_KEY: 'test-key', GROKBOT_PASSCODE: 'test-pass'}, stdio: 'ignore'});
  await waitHttp(`http://127.0.0.1:${appPort}/api/health`);
  const appUrl = `http://127.0.0.1:${appPort}/`;
  await send('Page.navigate', { url: appUrl + '#T1' }); await sleep(1600);
  await ev(`try { localStorage.removeItem('inn514-grokbot-pass'); } catch (e) {}`);
  await send('Page.reload', { ignoreCache: true }); await sleep(1800);
  const serverButtons = await ev(askVisibility);
  check('server mode makes the class ask buttons visible',
    serverButtons.count === DATA.lectures.T1.chapters.length && serverButtons.visible === serverButtons.count, JSON.stringify(serverButtons));
  await ev(`document.querySelector('.ask-btn').click(); document.querySelector('.ask:not([hidden]) .ask-chips button').click()`);
  await waitFor(`!document.querySelector('.ask-pass')?.hidden`);
  const passFirst = await ev(`(() => { const p = document.querySelector('.ask:not([hidden])');
    return {row: !p.querySelector('.ask-pass').hidden,
      note: p.querySelector('.ask-note').textContent}; })()`);
  check('the first server question asks for a passcode', passFirst.row, JSON.stringify(passFirst));
  check('server mode shows its AI-voice honesty line',
    passFirst.note === "Answers are written by a free AI model from this chapter's text and read aloud by an AI voice. Don't type personal details.");
  await ev(`(() => { const row = document.querySelector('.ask-pass'); row.querySelector('input').value = 'wrong-pass';
    row.querySelector('button').click(); })()`);
  await waitFor(`document.querySelector('.ask-status')?.textContent.includes("That passcode didn't work.")`);
  const wrong = await ev(`(() => ({status: document.querySelector('.ask-status')?.textContent || '',
    row: !document.querySelector('.ask-pass').hidden, saved: localStorage.getItem('inn514-grokbot-pass')}))()`);
  check('a wrong server passcode shows its error and is forgotten',
    wrong.status.includes("That passcode didn't work.") && wrong.row && wrong.saved === null, JSON.stringify(wrong));
  await ev(`(() => { const row = document.querySelector('.ask-pass'); row.querySelector('input').value = 'test-pass';
    row.querySelector('button').click(); })()`);
  let mockCalls = [];
  for (let n = 0; n < 100; n++) {
    mockCalls = await (await fetch(`http://127.0.0.1:${mockPort}/calls`)).json();
    if (mockCalls.some((c) => c.path === '/api/v1/audio/speech')) break;
    await sleep(100);
  }
  await waitFor(`document.querySelector('.ask-status')?.textContent.includes('Speaking')
    || document.querySelector('.ask-text')?.textContent.includes('First sentence.')`);
  check('the right passcode retries the question and reaches the answer model',
    mockCalls.some((c) => c.path === '/api/v1/chat/completions'), JSON.stringify(mockCalls.map((c) => c.path)));
  check('server mode calls /api/speak', mockCalls.some((c) => c.path === '/api/v1/audio/speech'), JSON.stringify(mockCalls.map((c) => c.path)));
  const serverReady = await ev(`(() => ({saved: localStorage.getItem('inn514-grokbot-pass'),
    status: document.querySelector('.ask-status')?.textContent || '', text: document.querySelector('.ask-text')?.textContent || '',
    inner: innerWidth, scroll: document.documentElement.scrollWidth}))()`);
  check('the server answer speaks or falls back to text and saves the passcode',
    serverReady.saved === 'test-pass' && (serverReady.status.includes('Speaking') || serverReady.text.includes('First sentence.')),
    JSON.stringify(serverReady));
  check('the server ask panel has no horizontal scroll at 390 px', serverReady.scroll <= serverReady.inner, JSON.stringify(serverReady));
  await ev(`document.querySelector('.ask:not([hidden])')?.scrollIntoView({ block: 'center' })`); await sleep(300);
  const inView_server = await ev(`(() => { const p = document.querySelector('.ask:not([hidden])'); const r = p && p.getBoundingClientRect();
    return {open: !!p, top: r ? Math.round(r.top) : null, bottom: r ? Math.round(r.bottom) : null, inner: innerHeight, y: scrollY, hash: location.hash}; })()`);
  check('the open server ask panel is in view for its screenshot', inView_server.open && inView_server.top >= 0 && inView_server.top < inView_server.inner, JSON.stringify(inView_server));
  await shot('phone-ask-server.png');
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
