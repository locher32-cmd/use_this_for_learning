// Tests Gradient.html (the save-to-device single file): opens it from disk with ALL network
// access blocked, checks lessons/math/fonts/visuals work, solves a problem, then saves a progress
// backup file and restores it into a fresh browser. Run: node tools/bundle.mjs && node tests/bundle.cjs
const path = require('path');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright');

(async () => {
  const file = path.resolve(__dirname, '..', 'Gradient.html'), fails = [], must = (c, m) => { if (!c) fails.push(m); };
  const browser = await chromium.launch(), external = [];
  const open = async () => {
    const ctx = await browser.newContext({ acceptDownloads: true }), page = await ctx.newPage(), errs = [];
    await ctx.route(/^(https?|wss?):/, (r) => { external.push(r.request().url()); r.abort(); });
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto('file://' + file); await page.waitForSelector('.hero-title');
    return { ctx, page, errs };
  };
  const A = await open();
  for (const h of ['calc1-limits', 'linalg-eigen', 'variational-fem', 'stochastic-brownian']) {
    await A.page.evaluate((x) => { location.hash = x; }, h); await A.page.waitForTimeout(250);
    must(await A.page.$('.katex') && await A.page.$('.viz canvas'), `${h}: math or visual missing`);
  }
  must(await A.page.evaluate(() => document.fonts.check('16px KaTeX_Main') && document.fonts.check('16px "Source Serif 4"')), 'bundled fonts not available');
  await A.page.evaluate(() => { location.hash = 'calc1-limits'; }); await A.page.waitForTimeout(200);
  await A.page.evaluate(() => { const c = document.querySelector('.pcard'); c.querySelector('.pin').value = window.AM.answerInput(c._prob.ans); c.querySelector('button[type=submit]').click(); });
  await A.page.evaluate(() => { location.hash = 'progress'; }); await A.page.waitForTimeout(200);
  const [dl] = await Promise.all([A.page.waitForEvent('download'), A.page.click('#pg-dl')]);
  const saved = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'grad-')), dl.suggestedFilename());
  await dl.saveAs(saved);
  const data = JSON.parse(fs.readFileSync(saved, 'utf8'));
  must(/^gradient-progress-\d{4}-\d\d-\d\d\.json$/.test(dl.suggestedFilename()), `odd backup name ${dl.suggestedFilename()}`);
  must(data.lessons && data.lessons['calc1-limits'] && data.lessons['calc1-limits'].tiers[0] === 1, 'backup file missing the solved problem');
  // restore into a brand-new browser profile
  const B = await open();
  await B.page.evaluate(() => { location.hash = 'progress'; }); await B.page.waitForTimeout(200);
  await B.page.setInputFiles('#pg-file', saved); await B.page.waitForTimeout(400);
  must(await B.page.evaluate(() => window.AM.app.state.lessons['calc1-limits'] && window.AM.app.state.lessons['calc1-limits'].tiers[0] === 1), 'restoring the backup file did not bring progress back');
  [...A.errs, ...B.errs].forEach((e) => fails.push('page error: ' + e));
  must(!external.length, `bundle tried to reach the network: ${external.slice(0, 3).join(', ')}`);
  await browser.close();
  const mb = (fs.statSync(file).size / 1048576).toFixed(2);
  if (fails.length) { console.log(fails.length + ' problem(s):'); fails.forEach((f) => console.log('  ✗ ' + f)); process.exit(1); }
  console.log(`Gradient.html (${mb} MB) works fully offline; backup file saved and restored.`);
})();
