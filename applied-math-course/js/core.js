/* Gradient — core: namespace, seeded RNG, math helpers, answer parser/checker, math rendering, storage. */
(function (global) {
  'use strict';
  const AM = (global.AM = global.AM || {});
  AM.tx = String.raw;
  AM.modules = [];
  AM.widgets = {};
  AM.module = (def) => { AM.modules.push(def); return def; };
  AM.widget = (name, mount) => { AM.widgets[name] = mount; };
  /* Attach an Exam-level (tier 4) generator to the lesson "module-lesson". Load after the module. */
  AM.exam = (fid, gen) => {
    for (const m of AM.modules) for (const l of m.lessons) if (`${m.id}-${l.id}` === fid) { l.practice = l.practice.filter((p) => p.level !== 4); l.practice.push({ level: 4, gen }); return; }
    throw new Error(`AM.exam: no lesson ${fid}`);
  };

  /* ---------------- Seeded random numbers (reproducible problems) ---------------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  AM.rng = function (seed) {
    const r = mulberry32(seed >>> 0);
    const R = {
      seed,
      random: r,
      int: (a, b) => a + Math.floor(r() * (b - a + 1)),
      nz(a, b) { let v; do { v = R.int(a, b); } while (v === 0); return v; },
      pick: (arr) => arr[Math.floor(r() * arr.length)],
      real(a, b, dp = 1) { const p = 10 ** dp; return Math.round((a + r() * (b - a)) * p) / p; },
      sign: () => (r() < 0.5 ? -1 : 1),
      chance: (p) => r() < p,
      shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
        return a;
      },
      distinct(n, a, b) {
        const s = new Set(); let guard = 0;
        while (s.size < n && guard++ < 1000) s.add(R.int(a, b));
        return [...s];
      },
    };
    return R;
  };

  /* ---------------- Math helpers ---------------- */
  const M = (AM.m = {});
  M.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  M.fact = (n) => { let p = 1; for (let i = 2; i <= n; i++) p *= i; return p; };
  M.binom = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
  M.round = (x, dp = 4) => Math.round(x * 10 ** dp) / 10 ** dp;
  M.erf = (x) => {
    // Abramowitz & Stegun 7.1.26 (|error| < 1.5e-7)
    const s = Math.sign(x); x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  };
  M.phi = (z) => 0.5 * (1 + M.erf(z / Math.SQRT2)); // standard normal CDF
  M.npdf = (x, mu = 0, s = 1) => Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  M.randn = (r) => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  M.integrate = (f, a, b, n = 2000) => { // composite Simpson
    if (n % 2) n++; const h = (b - a) / n; let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
    return (s * h) / 3;
  };
  M.deriv = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
  /* ODE steppers for y' = f(t, y) with y an array */
  const axpy = (y, k, h) => y.map((v, i) => v + h * k[i]);
  M.eulerStep = (f, t, y, h) => axpy(y, f(t, y), h);
  M.rk4Step = (f, t, y, h) => {
    const k1 = f(t, y), k2 = f(t + h / 2, axpy(y, k1, h / 2)), k3 = f(t + h / 2, axpy(y, k2, h / 2)), k4 = f(t + h, axpy(y, k3, h));
    return y.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  };
  /* Integrate from t0 to t1 in n steps; returns [[t, y], ...] */
  M.solve = (f, y0, t0, t1, n, step = M.rk4Step) => {
    const h = (t1 - t0) / n, out = [[t0, y0]]; let y = y0;
    for (let i = 1; i <= n; i++) { y = step(f, t0 + (i - 1) * h, y, h); out.push([t0 + i * h, y]); }
    return out;
  };

  /* Self-checks that generators attach as `verify` (run by the test suite, never shown to learners). */
  AM.checks = {
    // d/dx of fexpr equals dexpr at several points
    deriv: (fexpr, dexpr, dom = [-2, 2]) => () => {
      const f = AM.compile(fexpr), d = AM.compile(dexpr);
      for (let i = 1; i <= 6; i++) {
        const x = dom[0] + ((dom[1] - dom[0]) * i) / 7.3;
        const num = M.deriv((t) => f({ x: t }), x, 1e-5), ref = d({ x });
        if (!isFinite(ref)) continue;
        if (Math.abs(num - ref) > 1e-4 * Math.max(1, Math.abs(ref))) return `derivative mismatch at x=${x}: numeric ${num} vs ${ref}`;
      }
      return true;
    },
    // ∫_a^b f = value
    integral: (f, a, b, value) => () => {
      const num = M.integrate(f, a, b, 6000);
      return Math.abs(num - value) < 1e-6 * Math.max(1, Math.abs(value)) ? true : `integral mismatch: numeric ${num} vs ${value}`;
    },
    near: (a, b, tol = 1e-6) => () => (Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)) ? true : `mismatch ${a} vs ${b}`),
  };

  /* Number → short string ("3", "-0.25", "1.4142") */
  AM.fmt = (x, dp = 4) => {
    if (!isFinite(x)) return String(x);
    if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
    return String(+x.toFixed(dp));
  };
  /* Reduced fraction as TeX */
  AM.frac = (p, q) => {
    if (q === 0) return '\\text{undefined}';
    const g = M.gcd(p, q) || 1; p /= g; q /= g;
    if (q < 0) { p = -p; q = -q; }
    if (q === 1) return String(p);
    return (p < 0 ? '-' : '') + `\\frac{${Math.abs(p)}}{${q}}`;
  };
  /* "+ 3" / "- 3" for building expressions */
  AM.sgn = (n, first = false) => {
    if (first) return n < 0 ? `-${Math.abs(n)}` : `${n}`;
    return n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`;
  };
  /* coefficient in front of a symbol: 1→"", -1→"-", 3→"3" */
  AM.co = (n, sym = 'x') => (n === 1 ? sym : n === -1 ? `-${sym}` : `${n}${sym}`);
  /* polynomial from coefficients [a_n,...,a_0] as TeX */
  AM.poly = (coeffs, v = 'x') => {
    const n = coeffs.length - 1; let out = '';
    coeffs.forEach((c, i) => {
      if (c === 0) return;
      const p = n - i;
      const mag = Math.abs(c);
      const body = p === 0 ? `${mag}` : `${mag === 1 ? '' : mag}${v}${p === 1 ? '' : `^{${p}}`}`;
      if (!out) out = (c < 0 ? '-' : '') + body;
      else out += (c < 0 ? ' - ' : ' + ') + body;
    });
    return out || '0';
  };

  /* ---------------- Expression parser (for typed answers) ---------------- */
  const FUNCS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan, sec: (x) => 1 / Math.cos(x), csc: (x) => 1 / Math.sin(x), cot: (x) => 1 / Math.tan(x),
    asin: Math.asin, acos: Math.acos, atan: Math.atan, arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp, ln: Math.log, log: Math.log10,
  };
  const CONSTS = { pi: Math.PI, e: Math.E };
  const WORDS = Object.keys(FUNCS).concat(Object.keys(CONSTS)).sort((a, b) => b.length - a.length);

  function normalize(s) {
    return s
      .replace(/[−–—]/g, '-').replace(/[×·∙]/g, '*').replace(/÷/g, '/')
      .replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/\*\*/g, '^')
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/\s+/g, ' ').trim();
  }

  function tokenize(s, vars) {
    const toks = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === ' ') { i++; continue; }
      if (/[0-9.]/.test(c)) {
        const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i));
        let txt = m[0];
        // "2e" alone means 2·e, not scientific notation
        if (/e/i.test(txt) && !/e[+-]?\d/i.test(txt)) txt = m[1];
        toks.push({ t: 'num', v: parseFloat(txt), s: txt }); i += txt.length; continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        const run = /^[a-zA-Z]+/.exec(s.slice(i))[0];
        let j = 0;
        while (j < run.length) {
          const rest = run.slice(j).toLowerCase();
          const w = WORDS.find((w) => rest.startsWith(w));
          if (w) { toks.push(FUNCS[w] ? { t: 'fn', v: w } : { t: 'const', v: w }); j += w.length; continue; }
          const ch = run[j];
          if (vars.includes(ch)) { toks.push({ t: 'var', v: ch }); j++; continue; }
          throw new Error(`I don't recognise "${run.slice(j)}". Use ${vars.length ? vars.join(', ') + ', ' : ''}pi, e, sqrt(), ln(), sin()…`);
        }
        i += run.length; continue;
      }
      if ('+-*/^(),!'.includes(c)) { toks.push({ t: 'op', v: c }); i++; continue; }
      if (c === '[' || c === '{') { toks.push({ t: 'op', v: '(' }); i++; continue; }
      if (c === ']' || c === '}') { toks.push({ t: 'op', v: ')' }); i++; continue; }
      throw new Error(`Unexpected character "${c}".`);
    }
    return toks;
  }

  function parse(src, vars = []) {
    const toks = tokenize(normalize(String(src)), vars); let p = 0;
    const peek = () => toks[p];
    const isOp = (v) => peek() && peek().t === 'op' && peek().v === v;
    const startsPrimary = () => { const k = peek(); return k && (k.t === 'num' || k.t === 'var' || k.t === 'const' || k.t === 'fn' || (k.t === 'op' && k.v === '(')); };
    function expr() {
      let a = term();
      while (isOp('+') || isOp('-')) { const o = toks[p++].v; a = { k: o === '+' ? 'add' : 'sub', a, b: term() }; }
      return a;
    }
    function term() {
      let a = unary();
      for (;;) {
        if (isOp('*') || isOp('/')) { const o = toks[p++].v; a = { k: o === '*' ? 'mul' : 'div', a, b: unary() }; }
        else if (startsPrimary()) a = { k: 'mul', a, b: power(), imp: true };
        else break;
      }
      return a;
    }
    function unary() {
      if (isOp('-')) { p++; return { k: 'neg', a: unary() }; }
      if (isOp('+')) { p++; return unary(); }
      return power();
    }
    function power() {
      const b = postfix();
      if (isOp('^')) { p++; return { k: 'pow', a: b, b: unary() }; }
      return b;
    }
    function postfix() {
      let a = primary();
      while (isOp('!')) { p++; a = { k: 'fact', a }; }
      return a;
    }
    function primary() {
      const k = toks[p];
      if (!k) throw new Error('The expression ends too early.');
      p++;
      if (k.t === 'num') return { k: 'num', v: k.v, s: k.s };
      if (k.t === 'var') return { k: 'var', v: k.v };
      if (k.t === 'const') return { k: 'const', v: k.v };
      if (k.t === 'fn') {
        let arg;
        if (isOp('(')) { p++; arg = expr(); if (!isOp(')')) throw new Error('Missing a closing parenthesis.'); p++; }
        else arg = power();
        return { k: 'call', f: k.v, a: arg };
      }
      if (k.t === 'op' && k.v === '(') {
        const e = expr();
        if (!isOp(')')) throw new Error('Missing a closing parenthesis.');
        p++; return e;
      }
      throw new Error(`Unexpected "${k.v}".`);
    }
    if (!toks.length) throw new Error('Type an answer first.');
    const tree = expr();
    if (p < toks.length) throw new Error(`Unexpected "${toks[p].v}".`);
    return tree;
  }

  function evaluate(n, env) {
    switch (n.k) {
      case 'num': return n.v;
      case 'var': if (!(n.v in env)) throw new Error(`No value for ${n.v}.`); return env[n.v];
      case 'const': return CONSTS[n.v];
      case 'neg': return -evaluate(n.a, env);
      case 'add': return evaluate(n.a, env) + evaluate(n.b, env);
      case 'sub': return evaluate(n.a, env) - evaluate(n.b, env);
      case 'mul': return evaluate(n.a, env) * evaluate(n.b, env);
      case 'div': return evaluate(n.a, env) / evaluate(n.b, env);
      case 'pow': {
        const b = evaluate(n.a, env), e = evaluate(n.b, env);
        // real odd roots of negatives, e.g. (-8)^(1/3)
        if (b < 0 && !Number.isInteger(e)) { const q = Math.round(1 / e); if (Math.abs(1 / e - q) < 1e-9 && q % 2) return -Math.pow(-b, e); }
        return Math.pow(b, e);
      }
      case 'fact': { const v = evaluate(n.a, env); if (v < 0 || !Number.isInteger(v) || v > 170) return NaN; return M.fact(v); }
      case 'call': return FUNCS[n.f](evaluate(n.a, env));
    }
    return NaN;
  }

  const PREC = { add: 1, sub: 1, neg: 2, mul: 3, div: 4, pow: 5, fact: 6, call: 7, num: 8, var: 8, const: 8 };
  function toTex(n) {
    const wrap = (c, need) => (PREC[c.k] < need ? `\\left(${toTex(c)}\\right)` : toTex(c));
    switch (n.k) {
      case 'num': return n.s || String(n.v);
      case 'var': return n.v;
      case 'const': return n.v === 'pi' ? '\\pi' : 'e';
      case 'neg': return '-' + wrap(n.a, 3);
      case 'add': return `${toTex(n.a)} + ${toTex(n.b)}`;
      case 'sub': return `${toTex(n.a)} - ${wrap(n.b, 2)}`;
      case 'mul': {
        const L = wrap(n.a, 3), Rt = wrap(n.b, 3);
        const juxt = n.a.k === 'num' && ['var', 'const', 'call', 'pow'].includes(n.b.k) && !(n.b.k === 'pow' && n.b.a.k === 'num');
        return juxt ? `${L}${Rt}` : `${L} \\cdot ${Rt}`;
      }
      case 'div': return `\\frac{${toTex(n.a)}}{${toTex(n.b)}}`;
      case 'pow': return `{${wrap(n.a, 6)}}^{${toTex(n.b)}}`;
      case 'fact': return wrap(n.a, 7) + '!';
      case 'call': {
        const a = toTex(n.a);
        if (n.f === 'sqrt') return `\\sqrt{${a}}`;
        if (n.f === 'cbrt') return `\\sqrt[3]{${a}}`;
        if (n.f === 'abs') return `\\left|${a}\\right|`;
        if (n.f === 'exp') return `e^{${a}}`;
        const name = { asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan', arcsin: '\\arcsin', arccos: '\\arccos', arctan: '\\arctan' }[n.f] || `\\${n.f}`;
        return `${name}\\left(${a}\\right)`;
      }
    }
    return '';
  }

  AM.parse = parse;
  AM.evalExpr = (src, env = {}) => evaluate(parse(src, Object.keys(env)), env);
  AM.compile = (src, vars = ['x']) => { const t = parse(src, vars); return (env) => evaluate(t, env); };
  AM.exprTex = (src, vars = []) => toTex(parse(src, vars));

  /* Strip "f'(x) =" / "y =" prefixes people naturally type */
  const stripLhs = (s) => { const i = s.lastIndexOf('='); return i >= 0 ? s.slice(i + 1) : s; };
  const splitList = (s) => s.replace(/^[\s([{]+|[\s)\]}]+$/g, '').split(/[,;]/).map((t) => t.trim()).filter(Boolean);

  /* Default: accept answers rounded to 2 decimals or within 0.2%. `tol` sets an absolute tolerance;
     `abs`/`rel` adjust the floor and relative part (use abs: 1e-9 for small exact values). */
  function closeNum(u, a, spec) {
    if (spec.tol != null) return Math.abs(u - a) <= spec.tol;
    const rel = spec.rel ?? 0.002, floor = spec.abs ?? 0.005;
    return Math.abs(u - a) <= Math.max(floor, rel * Math.abs(a));
  }

  /* Check a typed answer against a problem's answer spec. */
  AM.checkAnswer = function (spec, raw) {
    const input = String(raw ?? '').trim();
    if (spec.type === 'mc') return { ok: input === String(spec.answer) };
    if (!input) return { ok: false, msg: 'Type an answer first.' };
    try {
      if (spec.type === 'num') {
        const u = AM.evalExpr(stripLhs(input));
        if (!isFinite(u)) return { ok: false, msg: 'That works out to an undefined number.' };
        return { ok: closeNum(u, spec.answer, spec) };
      }
      if (spec.type === 'vec') {
        let us = splitList(stripLhs(input)).map((t) => AM.evalExpr(t));
        let as = spec.answer.slice();
        if (us.length !== as.length) return { ok: false, msg: `Enter ${as.length} numbers separated by commas.` };
        if (spec.unordered) { us = us.sort((a, b) => a - b); as = as.sort((a, b) => a - b); }
        return { ok: us.every((u, i) => closeNum(u, as[i], spec)) };
      }
      if (spec.type === 'fn') {
        const vars = spec.vars || ['x'];
        const user = AM.compile(stripLhs(input), vars);
        const ref = AM.compile(spec.expr, vars);
        const [lo, hi] = spec.domain || [-3, 3];
        const base = [0.137, 0.291, 0.418, 0.553, 0.689, 0.776, 0.912];
        const pts = spec.ints ? Array.from({ length: hi - lo + 1 }, (_, i) => lo + i) : null; // integer-only variables (sequences)
        let good = 0, shift = null;
        for (let i = 0; i < (pts ? pts.length : base.length); i++) {
          const env = {};
          vars.forEach((v, j) => { env[v] = pts ? pts[i] : lo + (hi - lo) * base[(i + 2 * j) % base.length]; });
          let r = ref(env); if (!isFinite(r) || Math.abs(r) > 1e8) continue;
          const u = user(env);
          if (!isFinite(u)) return { ok: false };
          if (spec.upToConst) { if (shift === null) shift = u - r; r += shift; } // antiderivatives: any constant offset is fine
          if (Math.abs(u - r) > 1e-5 + 2e-4 * Math.abs(r)) return { ok: false };
          good++;
        }
        return good >= 3 ? { ok: true } : { ok: false, msg: 'Could not check that expression.' };
      }
    } catch (e) {
      return { ok: false, msg: e.message, parseError: true };
    }
    return { ok: false };
  };

  /* Canonical answer as typed text (used by tests to prove every generator accepts its own answer) */
  AM.answerInput = function (spec) {
    if (spec.type === 'mc') return String(spec.answer);
    if (spec.type === 'num') return String(spec.answer);
    if (spec.type === 'vec') return spec.answer.join(', ');
    if (spec.type === 'fn') return spec.expr;
    return '';
  };
  /* Answer shown with the solution */
  AM.answerTex = function (spec) {
    if (spec.show) return spec.show;
    if (spec.type === 'num') return `$${AM.fmt(spec.answer)}$`;
    if (spec.type === 'vec') return `$${spec.answer.map((v) => AM.fmt(v)).join(',\\ ')}$`;
    if (spec.type === 'fn') return `$${AM.exprTex(spec.expr, spec.vars || ['x'])}${spec.upToConst ? ' + C' : ''}$`;
    if (spec.type === 'mc') return spec.choices[spec.answer];
    return '';
  };

  /* ---------------- Rendering: $inline$, $$display$$, **bold**, *em*, lists, paragraphs ---------------- */
  const MACROS = { '\\R': '\\mathbb{R}', '\\N': '\\mathbb{N}', '\\Z': '\\mathbb{Z}', '\\Q': '\\mathbb{Q}', '\\C': '\\mathbb{C}', '\\d': '\\,\\mathrm{d}' };
  AM.strictTex = false;
  AM.tex = function (s, display = false) {
    const k = global.katex;
    if (!k) return `<code>${s.replace(/</g, '&lt;')}</code>`;
    return k.renderToString(s, { displayMode: display, throwOnError: AM.strictTex, macros: MACROS, strict: AM.strictTex ? 'error' : 'ignore' });
  };

  function splitMath(src) {
    const out = []; let buf = ''; let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (c === '\\' && src[i + 1] === '$') { buf += '&#36;'; i += 2; continue; }
      if (c === '$') {
        const disp = src[i + 1] === '$';
        const w = disp ? 2 : 1;
        const close = src.indexOf(disp ? '$$' : '$', i + w);
        if (close > i) {
          out.push({ t: 'text', v: buf }); buf = '';
          out.push({ t: disp ? 'dmath' : 'math', v: src.slice(i + w, close) });
          i = close + w; continue;
        }
      }
      buf += c; i++;
    }
    out.push({ t: 'text', v: buf });
    return out;
  }
  const inlineMd = (s) => s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*(?!\s)(.+?)(?<!\s)\*(?!\w)/g, '$1<em>$2</em>');

  AM.md = function (src, opts = {}) {
    if (src == null) return '';
    const parts = splitMath(String(src));
    const math = [];
    let text = parts.map((p) => {
      if (p.t === 'text') return p.v;
      math.push(p); return `\u0000${math.length - 1}\u0000`;
    }).join('');
    const fill = (s) => s.replace(/\u0000(\d+)\u0000/g, (_, n) => { const p = math[+n]; return AM.tex(p.v.trim(), p.t === 'dmath'); });
    if (opts.inline) return fill(inlineMd(text));
    const blocks = text.trim().split(/\n\s*\n/);
    const html = blocks.map((b) => {
      const t = b.trim();
      if (!t) return '';
      if (/^<(ul|ol|div|table|figure|h\d|p|blockquote|details)/i.test(t)) return t;
      if (/^\u0000\d+\u0000$/.test(t) && math[+t.slice(1, -1)].t === 'dmath') return t;
      // a block may mix paragraph lines and list lines ("…is\n- one\n- two")
      let out = '', para = [], list = null, ltype = null;
      const flushP = () => { if (para.length) { out += `<p>${inlineMd(para.join(' '))}</p>`; para = []; } };
      const flushL = () => { if (list) { out += `<${ltype}>${list.map((li) => `<li>${inlineMd(li)}</li>`).join('')}</${ltype}>`; list = null; } };
      t.split('\n').forEach((line) => {
        const ul = /^\s*[-•]\s+(.*)$/.exec(line), ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
        if (ul || ol) {
          flushP(); const ty = ul ? 'ul' : 'ol';
          if (list && ltype !== ty) flushL();
          if (!list) { list = []; ltype = ty; }
          list.push((ul || ol)[1]);
        } else if (list && /^\s{2,}\S/.test(line)) list[list.length - 1] += ' ' + line.trim();
        else { flushL(); para.push(line.trim()); }
      });
      flushP(); flushL();
      return out;
    }).join('');
    return fill(html);
  };
  AM.mdi = (s) => AM.md(s, { inline: true });

  /* ---------------- Storage (per-browser progress; always optional) ---------------- */
  AM.store = {
    key: 'gradient-applied-math-v1',
    load() { try { return JSON.parse(global.localStorage.getItem(this.key)) || {}; } catch (e) { return {}; } },
    save(s) { try { global.localStorage.setItem(this.key, JSON.stringify(s)); } catch (e) { /* storage unavailable: progress lasts for this visit only */ } },
  };
})(typeof window !== 'undefined' ? window : globalThis);
