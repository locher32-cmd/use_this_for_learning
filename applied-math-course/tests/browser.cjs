// Browser smoke test: visits every route, operates every control, and fails on any script error.
// Run: node tests/browser.cjs [screenshot-dir]
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const shots = process.argv[2];
  const url = 'file://' + path.resolve(__dirname, '..', 'index.html');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror @ ${page.url().split('#')[1] || 'home'}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`console.${m.type()} @ ${page.url().split('#')[1] || 'home'}: ${m.text()}`); });
  await page.goto(url);
  await page.waitForTimeout(400);
  const routes = await page.evaluate(() => {
    const r = ['home'];
    window.AM.modules.forEach((m) => { r.push(m.id); m.lessons.forEach((l) => r.push(`${m.id}-${l.id}`)); r.push(`${m.id}-checkpoint`); });
    return r;
  });
  for (const r of routes) {
    await page.evaluate((h) => { location.hash = h; }, r);
    await page.waitForTimeout(120);
    const bad = await page.$$eval('#view .err', (els) => els.map((e) => e.textContent));
    bad.forEach((b) => errors.push(`visible error @ ${r}: ${b}`));
    if (r.endsWith('checkpoint') || r === 'home' || !r.includes('-')) continue;
    // operate every control in the visual
    await page.evaluate(async () => {
      const v = document.querySelector('.viz');
      if (!v) return;
      const fire = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));
      for (const inp of v.querySelectorAll('input[type=range]')) {
        for (const val of [inp.min, inp.max, (Number(inp.min) + Number(inp.max)) / 2]) { inp.value = val; fire(inp, 'input'); await new Promise((r) => requestAnimationFrame(r)); }
      }
      for (const s of v.querySelectorAll('select')) for (const o of s.options) { s.value = o.value; fire(s, 'change'); await new Promise((r) => requestAnimationFrame(r)); }
      for (const c of v.querySelectorAll('input[type=checkbox]')) { c.click(); await new Promise((r) => requestAnimationFrame(r)); c.click(); }
      for (const b of v.querySelectorAll('button')) { b.click(); await new Promise((r) => requestAnimationFrame(r)); }
      for (const b of v.querySelectorAll('button')) { if (/Pause/.test(b.textContent)) b.click(); }
      // drag on each canvas from centre outwards, which also exercises handles and click handlers
      for (const cv of v.querySelectorAll('canvas')) {
        const r = cv.getBoundingClientRect(); const opts = (x, y) => ({ bubbles: true, clientX: x, clientY: y, pointerId: 1 });
        cv.dispatchEvent(new PointerEvent('pointerdown', opts(r.left + r.width / 2, r.top + r.height / 2)));
        cv.dispatchEvent(new PointerEvent('pointermove', opts(r.left + r.width * 0.7, r.top + r.height * 0.3)));
        cv.dispatchEvent(new PointerEvent('pointerup', opts(r.left + r.width * 0.7, r.top + r.height * 0.3)));
      }
    });
    await page.waitForTimeout(60);
    // practice cards: hint, wrong answer, solution, new problem
    await page.evaluate(() => {
      document.querySelectorAll('.pcard').forEach((c) => {
        const inp = c.querySelector('.pin'); if (inp) { inp.value = '1'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
        const radio = c.querySelector('input[type=radio]'); if (radio) radio.checked = true;
        c.querySelector('button[type=submit]').click();
        c.querySelectorAll('button[data-act]').forEach((b) => { if (b.dataset.act !== 'new') b.click(); });
        c.querySelector('button[data-act=new]').click();
      });
      const nx = document.querySelector('.ex-actions .btn'); if (nx) nx.click();
    });
    const bad2 = await page.$$eval('#view .err', (els) => els.map((e) => e.textContent));
    bad2.forEach((b) => errors.push(`visible error after interaction @ ${r}: ${b}`));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (overflow) errors.push(`horizontal page overflow @ ${r}`);
  }
  if (shots) {
    const snap = async (name, hash, opts = {}) => {
      await page.evaluate((h) => { location.hash = h; }, hash); await page.waitForTimeout(500);
      if (opts.scroll) { await page.evaluate((s) => document.querySelector(s) && document.querySelector(s).scrollIntoView(), opts.scroll); await page.waitForTimeout(200); }
      await page.screenshot({ path: path.join(shots, name + '.png'), fullPage: !!opts.full });
    };
    await snap('home-light', 'home');
    await snap('lesson-light', routes[2], { scroll: '.viz' });
    await page.emulateMedia({ colorScheme: 'dark' });
    await snap('home-dark', 'home');
    await snap('lesson-dark', routes[3], { scroll: '.viz' });
    await page.emulateMedia({ colorScheme: 'light' });
    const extra = (process.env.SHOTS || '').split(',').filter(Boolean);
    for (const h of extra) await snap('route-' + h, h, { scroll: '.viz' });
    await page.setViewportSize({ width: 390, height: 844 });
    await snap('mobile-home', 'home');
    await snap('mobile-lesson', routes[2], { scroll: '.pcard' });
    // mobile overflow check across all lesson routes
    for (const r of routes) {
      await page.evaluate((h) => { location.hash = h; }, r); await page.waitForTimeout(60);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (overflow) errors.push(`horizontal overflow at phone width @ ${r}`);
    }
  }
  await browser.close();
  console.log(`Visited ${routes.length} routes.`);
  if (errors.length) { console.log(errors.length + ' error(s):'); [...new Set(errors)].slice(0, 80).forEach((e) => console.log('  ✗ ' + e)); process.exit(1); }
  console.log('No browser errors.');
})();
