// Install/offline test: serves the app over HTTP, waits for the service worker, goes offline,
// reloads, and checks the course still works. Also validates the manifest, icons and desktop files.
// Run: node tests/install.cjs
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const fails = [];
const must = (cond, msg) => { if (!cond) fails.push(msg); };

(async () => {
  // static checks
  const man = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  must(man.name && man.start_url && man.display === 'standalone', 'manifest missing name/start_url/standalone display');
  man.icons.forEach((i) => must(fs.existsSync(path.join(root, i.src)), `manifest icon missing: ${i.src}`));
  must(man.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable'), 'no maskable 512 icon');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), assets = JSON.parse(sw.match(/const ASSETS = (\[[\s\S]*?\]);/)[1]);
  assets.forEach((a) => must(fs.existsSync(path.join(root, a)), `sw.js lists a missing file: ${a}`));
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map((m) => m[1]).forEach((ref) => must(assets.includes(ref), `index.html references ${ref} but sw.js does not cache it (run node tools/build.mjs)`));
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  must(fs.existsSync(path.join(root, pkg.main)), 'package.json main file missing');
  ['desktop/main.js', 'desktop/preload.js'].forEach((f) => must(fs.existsSync(path.join(root, f)), `${f} missing`));
  pkg.build.files.filter((g) => !g.includes('*')).forEach((f) => must(fs.existsSync(path.join(root, f)), `electron-builder file missing: ${f}`));

  // live offline check
  const port = 8765 + Math.floor(Math.random() * 100);
  const srv = spawn(process.execPath, [path.join(root, 'tools', 'serve.mjs'), String(port)], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 600));
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext(), page = await ctx.newPage(), errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(`http://localhost:${port}/`);
    const ok = await page.evaluate(async () => { const reg = await navigator.serviceWorker.ready; return !!reg.active; });
    must(ok, 'service worker did not activate');
    await page.waitForFunction(async () => { const keys = await caches.keys(); if (!keys.length) return false; const c = await caches.open(keys[0]); return (await c.keys()).length > 60; }, null, { timeout: 15000 }).catch(() => fails.push('offline cache did not fill'));
    await ctx.setOffline(true);
    await page.reload(); await page.waitForTimeout(500);
    const title = await page.$eval('.hero-title', (e) => e.textContent).catch(() => '');
    must(title === 'Gradient', 'app did not load offline');
    await page.evaluate(() => { location.hash = 'linalg-eigen'; }); await page.waitForTimeout(400);
    must(await page.$('.katex') !== null, 'math did not render offline');
    must(await page.$('.viz canvas') !== null, 'visual did not render offline');
    const font = await page.evaluate(() => document.fonts.check('16px "Source Serif 4"'));
    must(font, 'bundled font not available offline');
    errs.forEach((e) => fails.push('page error offline: ' + e));
  } finally { await browser.close(); srv.kill(); }

  if (fails.length) { console.log(fails.length + ' problem(s):'); fails.forEach((f) => console.log('  ✗ ' + f)); process.exit(1); }
  console.log(`Install checks passed: manifest, ${assets.length} cached files, offline reload, desktop config.`);
})();
