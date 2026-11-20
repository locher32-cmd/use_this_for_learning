// Content and problem-generator test suite. Run: node tests/run.mjs
// Loads the same scripts index.html loads (minus the UI shell) into a sandbox and checks that:
//  - every lesson has all of its sections and three practice levels,
//  - all math renders under strict KaTeX,
//  - every generator, over many seeds, produces a finite answer that the checker accepts,
//    rejects a clearly wrong answer, varies between seeds, and passes its own self-check if it has one.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]).filter((s) => !s.endsWith('app.js'));

const noop = () => {};
const ctx = {
  console, Math, Date, JSON, Set, Map, Float32Array, Float64Array, Uint8ClampedArray, Array, Object, Number, String, Error, isFinite, parseFloat, parseInt,
  matchMedia: () => ({ matches: false, addEventListener: noop }),
  MutationObserver: class { observe() {} },
  ResizeObserver: class { observe() {} disconnect() {} },
  getComputedStyle: () => ({ getPropertyValue: () => '#000000' }),
  requestAnimationFrame: noop, cancelAnimationFrame: noop,
  document: { documentElement: {}, compatMode: 'CSS1Compat', createElement: () => ({}) },
  localStorage: { getItem: () => null, setItem: noop },
};
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
for (const s of scripts) vm.runInContext(fs.readFileSync(path.join(root, s), 'utf8'), ctx, { filename: s });

const AM = ctx.AM;
AM.strictTex = true;
const SEEDS = Number(process.env.SEEDS || 300);
const fails = [];
const fail = (where, msg) => { fails.push(`${where}: ${msg}`); };
const render = (where, s) => { if (s == null) return; try { AM.md(String(s)); } catch (e) { fail(where, `math render error: ${e.message.split('\n')[0]}\n      in: ${String(s).slice(0, 160)}`); } };

let nLessons = 0, nGens = 0, nRuns = 0;
const ids = new Set();
for (const m of AM.modules) {
  for (const k of ['id', 'title', 'aka', 'blurb', 'lessons']) if (!m[k]) fail(`module ${m.id}`, `missing ${k}`);
  if (ids.has(m.id)) fail(`module ${m.id}`, 'duplicate id'); ids.add(m.id);
  (m.prereq || []).forEach((p) => { if (!AM.modules.some((x) => x.id === p)) fail(`module ${m.id}`, `unknown prereq ${p}`); });
  render(`${m.id} blurb`, m.blurb);
  for (const l of m.lessons) {
    nLessons++;
    const where = `${m.id}-${l.id}`;
    if (ids.has(where)) fail(where, 'duplicate lesson id'); ids.add(where);
    for (const k of ['title', 'summary', 'idea', 'everyday', 'visual', 'math', 'example', 'practice', 'usedIn']) if (!l[k]) fail(where, `missing ${k}`);
    if (l.visual && !AM.widgets[l.visual.widget]) fail(where, `unknown visual "${l.visual.widget}"`);
    ['summary', 'idea', 'everyday', 'math', 'usedIn'].forEach((k) => render(`${where} ${k}`, l[k]));
    if (l.visual) render(`${where} caption`, l.visual.caption);
    if (l.example) { render(`${where} example`, l.example.problem); (l.example.steps || []).forEach((s, i) => render(`${where} example step ${i + 1}`, s)); if (!l.example.steps || !l.example.steps.length) fail(where, 'example has no steps'); }
    (l.pitfalls || []).forEach((p, i) => render(`${where} pitfall ${i + 1}`, p));
    const levels = (l.practice || []).map((p) => p.level).join(',');
    if (levels !== '1,2,3,4') fail(where, `practice levels should be 1,2,3,4 (got ${levels})`);
    (l.practice || []).forEach((item, pi) => {
      nGens++;
      const w = `${where} L${item.level}`;
      const qs = new Set(); let broke = 0;
      for (let seed = 1; seed <= SEEDS && broke < 3; seed++) {
        nRuns++;
        let p;
        try { p = item.gen(AM.rng(seed * 7919 + pi)); } catch (e) { fail(`${w} seed ${seed}`, `generator threw ${e.message}`); broke++; continue; }
        if (!p || !p.q || !p.ans) { fail(`${w} seed ${seed}`, 'missing q or ans'); broke++; continue; }
        qs.add(p.q);
        const before = fails.length;
        render(`${w} seed ${seed} q`, p.q); render(`${w} seed ${seed} hint`, p.hint);
        (Array.isArray(p.sol) ? p.sol : [p.sol]).forEach((s) => render(`${w} seed ${seed} sol`, s));
        try { render(`${w} seed ${seed} answer`, AM.answerTex(p.ans)); } catch (e) { fail(`${w} seed ${seed}`, `answerTex threw ${e.message}`); }
        const a = p.ans;
        if (a.type === 'num' && !isFinite(a.answer)) fail(`${w} seed ${seed}`, `non-finite answer ${a.answer}`);
        if (a.type === 'vec' && !a.answer.every((v) => isFinite(v))) fail(`${w} seed ${seed}`, `non-finite vector answer ${a.answer}`);
        if (a.type === 'mc') {
          if (!(a.answer >= 0 && a.answer < a.choices.length)) fail(`${w} seed ${seed}`, 'mc answer index out of range');
          if (new Set(a.choices).size !== a.choices.length) fail(`${w} seed ${seed}`, `duplicate mc choices: ${a.choices.join(' | ')}`);
          a.choices.forEach((c) => render(`${w} seed ${seed} choice`, c));
        }
        const res = AM.checkAnswer(a, AM.answerInput(a));
        if (!res.ok) fail(`${w} seed ${seed}`, `checker rejects its own answer "${AM.answerInput(a)}" (${res.msg || ''}) q=${p.q.slice(0, 120)}`);
        if (a.type === 'num') {
          const wrong = a.answer + Math.max(1, Math.abs(a.answer) * 0.05, (a.tol || 0) * 3);
          if (AM.checkAnswer(a, String(wrong)).ok) fail(`${w} seed ${seed}`, `checker accepts a wrong answer ${wrong} for ${a.answer}`);
        }
        if (a.type === 'fn') {
          const v0 = (a.vars || ['x'])[0];
          for (const wrongFn of [`(${a.expr})*1.01 + 0.01`, a.upToConst ? `(${a.expr}) + 0.1*${v0}` : `(${a.expr}) + 0.1`]) {
            if (AM.checkAnswer(a, wrongFn).ok) fail(`${w} seed ${seed}`, `checker accepts wrong expression ${wrongFn}`);
          }
        }
        if (typeof p.verify === 'function') { let v; try { v = p.verify(); } catch (e) { v = e.message; } if (v !== true) fail(`${w} seed ${seed}`, `self-check failed (${v}) q=${p.q.slice(0, 140)}`); }
        if (fails.length > before) broke++;
      }
      if (qs.size < Math.min(4, SEEDS)) fail(w, `only ${qs.size} distinct problems across ${SEEDS} seeds`);
    });
  }
}

const widgetsUsed = new Set(AM.modules.flatMap((m) => m.lessons.map((l) => l.visual && l.visual.widget)));
const unused = Object.keys(AM.widgets).filter((w) => !widgetsUsed.has(w) && w !== 'plot');
console.log(`Modules ${AM.modules.length} · lessons ${nLessons} · generators ${nGens} · generator runs ${nRuns} · visuals ${Object.keys(AM.widgets).length}`);
if (unused.length) console.log(`Note: visuals defined but not used by any lesson: ${unused.join(', ')}`);
if (fails.length) {
  console.log(`\n${fails.length} problem(s):`);
  fails.slice(0, 60).forEach((f) => console.log('  ✗ ' + f));
  if (fails.length > 60) console.log(`  …and ${fails.length - 60} more`);
  process.exit(1);
}
console.log('All checks passed.');
