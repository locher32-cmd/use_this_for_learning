// Desktop app smoke test: launches the real Electron app and checks it works.
// Run (needs `npm install` first): xvfb-run -a node tests/desktop.cjs   (plain `node tests/desktop.cjs` on a desktop)
const path = require('path');
const fs = require('fs');
const os = require('os');
const { _electron: electron } = require('playwright');

(async () => {
  const root = path.resolve(__dirname, '..'), fails = [], userData = fs.mkdtempSync(path.join(os.tmpdir(), 'gradient-ud-'));
  const app = await electron.launch({ args: [root, '--no-sandbox', `--user-data-dir=${userData}`], executablePath: require(path.join(root, 'node_modules', 'electron')), env: { ...process.env, ELECTRON_DISABLE_SECURITY_WARNINGS: '' } });
  const win = await app.firstWindow(), errs = [];
  win.on('pageerror', (e) => errs.push(e.message));
  win.on('console', (m) => { if (m.type() === 'error' || /Security Warning/.test(m.text())) errs.push(`console: ${m.text().slice(0, 160)}`); });
  await win.waitForSelector('.hero-title', { timeout: 15000 });
  if ((await win.title()) !== 'Gradient Applied Math') fails.push(`unexpected title ${await win.title()}`);
  const bridge = await win.evaluate(() => !!(window.desktop && window.desktop.saveProgress && window.desktop.autoBackup) && typeof require === 'undefined');
  if (!bridge) fails.push('preload bridge missing, or Node leaked into the page');
  for (const h of ['ode-oscillations', 'complex-residues', 'modeling-markov', 'review', 'exam', 'progress']) {
    await win.evaluate((x) => { location.hash = x; }, h); await win.waitForTimeout(300);
    const bad = await win.$$eval('#view .err', (e) => e.map((x) => x.textContent)); bad.forEach((b) => fails.push(`visible error @ ${h}: ${b}`));
  }
  await win.evaluate(() => { location.hash = 'calc1-limits'; }); await win.waitForTimeout(300);
  await win.evaluate(() => { const c = document.querySelector('.pcard'); c.querySelector('.pin').value = window.AM.answerInput(c._prob.ans); c.querySelector('button[type=submit]').click(); });
  await win.waitForTimeout(800);
  const backups = path.join(userData, 'backups');
  if (!fs.existsSync(backups) || !fs.readdirSync(backups).some((f) => f.startsWith('progress-'))) fails.push('automatic daily backup was not written');
  const menu = await app.evaluate(({ Menu }) => Menu.getApplicationMenu().items.map((i) => i.label));
  if (!menu.includes('Study')) fails.push(`Study menu missing (${menu.join(', ')})`);
  if (process.env.SHOT) await win.screenshot({ path: process.env.SHOT });
  await app.close();
  errs.forEach((e) => fails.push(e));
  if (fails.length) { console.log(fails.length + ' problem(s):'); fails.forEach((f) => console.log('  ✗ ' + f)); process.exit(1); }
  console.log('Desktop app passed: window, preload bridge, lessons, study tools, auto-backup and menus.');
})();
