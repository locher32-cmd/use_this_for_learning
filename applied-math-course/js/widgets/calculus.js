/* Visuals for Calculus I and II. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, el = AM.el, n2 = (v) => AM.fmt(v, 3), M = AM.m;

  /* ---- Limits: approach a point from both sides ---- */
  AM.widget('limit', (host, o, { ui }) => {
    const F = {
      hole: { f: (x) => (x * x - 4) / (x - 2), a: 2, L: 4, tex: '\\frac{x^2-4}{x-2}', note: 'The function is undefined at $x = 2$, but the values close in on 4 from both sides, so the limit is 4.' },
      sinc: { f: (x) => Math.sin(x) / x, a: 0, L: 1, tex: '\\frac{\\sin x}{x}', note: 'Undefined at 0, yet both sides approach 1. This limit is why the derivative of $\\sin x$ is $\\cos x$.' },
      exp: { f: (x) => (Math.exp(x) - 1) / x, a: 0, L: 1, tex: '\\frac{e^x - 1}{x}', note: 'Both sides approach 1. This limit is what makes $e$ special: the slope of $e^x$ at 0 is exactly 1.' },
      jump: { f: (x) => (x < 1 ? x + 1 : x * x - 2), a: 1, L: null, tex: '\\begin{cases} x+1 & x<1 \\\\ x^2-2 & x\\ge 1\\end{cases}', note: 'From the left the values approach 2; from the right they approach $-1$. The one-sided limits differ, so the limit does not exist.' },
      blow: { f: (x) => 1 / ((x - 1) * (x - 1)), a: 1, L: Infinity, tex: '\\frac{1}{(x-1)^2}', note: 'The values grow without bound from both sides. We write $\\lim = \\infty$: the limit does not exist as a number.' },
      wig: { f: (x) => Math.sin(1 / x), a: 0, L: null, tex: '\\sin(1/x)', note: 'The function oscillates faster and faster between $-1$ and 1 near 0 and never settles, so the limit does not exist.' },
    };
    let key = 'hole', s = 1;
    const P = new Plot(host, { xmin: -1, xmax: 5, ymin: -1, ymax: 7, label: 'Function approaching a limit' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'fn', label: 'Function', options: Object.entries(F).map(([k, v]) => [k, { hole: '(x²−4)/(x−2) near 2', sinc: 'sin(x)/x near 0', exp: '(eˣ−1)/x near 0', jump: 'piecewise jump near 1', blow: '1/(x−1)² near 1', wig: 'sin(1/x) near 0' }[k]]), value: key, onChange: (v) => { key = v; update(); } });
    ui.slider(panel, { id: 'dist', label: 'Closeness: $x = a \\pm 10^{-k}$, $k$', min: 0, max: 4, step: 0.05, value: 1, onInput: (v) => { s = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const c = F[key], a = c.a, d = 10 ** -s;
      const views = { hole: [-1, 5, -0.5, 7], sinc: [-7, 7, -0.6, 1.4], exp: [-3, 3, -0.3, 3.3], jump: [-1.5, 3.5, -2.5, 4], blow: [-1.5, 3.5, -1, 12], wig: [-0.6, 0.6, -1.5, 1.5] }[key];
      P.setView(...views);
      P.draw((p) => {
        p.fn(c.f, { color: 1, width: 2.5, n: key === 'wig' ? 4000 : undefined });
        if (isFinite(c.L)) { p.hline(c.L, { color: 3 }); p.point(a, c.L, { color: 1, hollow: true, r: 5 }); }
        p.vline(a, { color: 'muted' });
        [[a - d, 2], [a + d, 4]].forEach(([x, col]) => { const y = c.f(x); if (isFinite(y) && Math.abs(y) < 1e6) { p.line(x, Math.min(Math.max(y, p.v.ymin), p.v.ymax), p.v.xmin, Math.min(Math.max(y, p.v.ymin), p.v.ymax), { color: col, width: 1, dash: [3, 4] }); p.point(x, Math.min(Math.max(y, p.v.ymin), p.v.ymax), { color: col }); } });
      });
      const fl = c.f(a - d), fr = c.f(a + d), show = (v) => (Math.abs(v) > 1e6 ? '\\text{huge}' : AM.fmt(v, 6));
      out.set(`$f(x) = ${c.tex}$. With $x$ within $${AM.fmt(d, 5)}$ of $a = ${a}$: left $f(${AM.fmt(a - d, 5)}) \\approx ${show(fl)}$, right $f(${AM.fmt(a + d, 5)}) \\approx ${show(fr)}$. ${c.note}`);
    }
    update();
  });

  /* ---- Secant line → tangent line ---- */
  const FUNS = {
    sq: { f: (x) => x * x, d: (x) => 2 * x, tex: 'x^2', view: [-3, 3, -1, 8] },
    cub: { f: (x) => x ** 3 - 3 * x, d: (x) => 3 * x * x - 3, tex: 'x^3 - 3x', view: [-3, 3, -5, 5] },
    sin: { f: Math.sin, d: Math.cos, tex: '\\sin x', view: [-4, 4, -2, 2] },
    exp: { f: Math.exp, d: Math.exp, tex: 'e^x', view: [-3, 2.5, -1, 9] },
    ln: { f: Math.log, d: (x) => 1 / x, tex: '\\ln x', view: [-0.3, 6, -3, 2.5] },
  };
  const funOptions = [['sq', 'x²'], ['cub', 'x³ − 3x'], ['sin', 'sin x'], ['exp', 'eˣ'], ['ln', 'ln x']];
  AM.widget('secant', (host, o, { ui }) => {
    let key = 'sq', a = 1, h = 1.5;
    const P = new Plot(host, { xmin: -3, xmax: 3, ymin: -1, ymax: 8, label: 'Secant and tangent lines' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'fn', label: 'Function', options: funOptions, value: key, onChange: (v) => { key = v; a = key === 'ln' ? 2 : 1; const V = FUNS[key].view; P.setView(...V); update(); } });
    const sh = ui.slider(panel, { id: 'h', label: 'Gap $h$', min: -2, max: 2, step: 0.01, value: h, onInput: (v) => { h = Math.abs(v) < 0.005 ? 0.005 * Math.sign(v || 1) : v; update(); } });
    ui.button(panel, 'Shrink $h$', () => { const st = AM.animate(host, () => { h *= 0.94; sh.set(h); update(); if (Math.abs(h) < 0.01) return false; }); st.start(); });
    const out = ui.readout(host);
    P.handle({ get: () => [a, FUNS[key].f(a)], set: (x) => { a = key === 'ln' ? Math.max(0.2, x) : x; update(); }, color: 4 });
    function update() {
      const F = FUNS[key], fa = F.f(a), b = a + h, fb = F.f(b), m = (fb - fa) / h, d = F.d(a);
      P.draw((p) => {
        p.fn(F.f, { color: 1, width: 2.75 });
        p.fn((x) => fa + d * (x - a), { color: 'muted', width: 1.5, dash: [6, 5] });
        p.fn((x) => fa + m * (x - a), { color: 2, width: 2 });
        p.line(a, fa, b, fa, { color: 3, width: 1.5, dash: [2, 3] }); p.line(b, fa, b, fb, { color: 3, width: 1.5, dash: [2, 3] });
        p.point(b, fb, { color: 2 });
        p.text('h', (a + b) / 2, fa, { color: 3, dy: 12, align: 'center' });
      });
      out.set(`Secant slope $= \\dfrac{f(a+h) - f(a)}{h} = \\dfrac{${n2(fb)} - ${n2(fa)}}{${n2(h)}} \\approx ${n2(m)}$. Tangent slope $f'(${n2(a)}) = ${n2(d)}$ (dashed). As $h \\to 0$ the orange secant turns into the tangent.`);
    }
    P.setView(...FUNS[key].view); update();
  });

  /* ---- f and f' stacked ---- */
  AM.widget('derivgraph', (host, o, { ui }) => {
    const G = {
      cub: { f: (x) => x ** 3 / 3 - x, tex: '\\tfrac{x^3}{3} - x', d: '\\, x^2 - 1' },
      sin: { f: Math.sin, tex: '\\sin x', d: '\\cos x' },
      gauss: { f: (x) => Math.exp(-x * x / 2) * 2, tex: '2e^{-x^2/2}', d: '-2x\\,e^{-x^2/2}' },
      quart: { f: (x) => x ** 4 / 8 - x * x, tex: '\\tfrac{x^4}{8} - x^2', d: '\\tfrac{x^3}{2} - 2x' },
      xex: { f: (x) => x * Math.exp(-x / 2), tex: 'x e^{-x/2}', d: '(1 - \\tfrac{x}{2}) e^{-x/2}' },
    };
    let key = 'cub', x0 = 0.5;
    const top = new Plot(host, { xmin: -4, xmax: 4, ymin: -2.6, ymax: 2.6, aspect: 0.38, minH: 170, label: 'Graph of f', ylabel: 'f' });
    const bot = new Plot(host, { xmin: -4, xmax: 4, ymin: -2.6, ymax: 2.6, aspect: 0.38, minH: 170, label: 'Graph of the derivative', ylabel: "f′" });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'fn', label: 'Function', options: [['cub', 'x³/3 − x'], ['sin', 'sin x'], ['gauss', '2e^(−x²/2)'], ['quart', 'x⁴/8 − x²'], ['xex', 'x e^(−x/2)']], value: key, onChange: (v) => { key = v; update(); } });
    const out = ui.readout(host);
    const fp = (x) => M.deriv(G[key].f, x);
    top.handle({ get: () => [x0, G[key].f(x0)], set: (x) => { x0 = x; update(); }, color: 4 });
    bot.handle({ get: () => [x0, fp(x0)], set: (x) => { x0 = x; update(); }, color: 4 });
    function update() {
      const f = G[key].f, d = fp(x0);
      top.draw((p) => {
        // shade where increasing
        for (let x = p.v.xmin; x < p.v.xmax; x += 0.05) if (fp(x) > 0) p.rect(x, p.v.ymin, x + 0.05, p.v.ymax, { fill: 3, fillAlpha: 0.07, stroke: false });
        p.fn(f, { color: 1, width: 2.75 });
        p.fn((x) => f(x0) + d * (x - x0), { color: 2, width: 1.75, from: x0 - 1.3, to: x0 + 1.3 });
      });
      bot.draw((p) => {
        p.area(fp, p.v.xmin, p.v.xmax, { fill: 3, fillAlpha: 0.12 });
        p.fn(fp, { color: 3, width: 2.5 });
        p.vline(x0, { color: 4 });
      });
      const state = Math.abs(d) < 0.03 ? 'flat (a possible maximum or minimum)' : d > 0 ? 'increasing' : 'decreasing';
      out.set(`$f(x) = ${G[key].tex}$, $\\ f'(x) = ${G[key].d}$. At $x = ${n2(x0)}$ the tangent slope is $${n2(d)}$, so $f$ is ${state}. Green shading marks where $f' > 0$.`);
    }
    update();
  });

  /* ---- Optimization: open-top box ---- */
  AM.widget('boxopt', (host, o, { ui }) => {
    let L = 12, x = 1;
    const row = el('div', 'viz-row'); host.appendChild(row);
    const S = new Plot(row, { xmin: -1, xmax: 13, ymin: -1, ymax: 13, equal: true, grid: false, axes: false, aspect: 0.85, label: 'Sheet with corners cut out' });
    const V = new Plot(row, { xmin: -0.3, xmax: 6.3, ymin: -10, ymax: 140, aspect: 0.85, xlabel: 'x', ylabel: 'V', label: 'Volume as a function of cut size' });
    const panel = ui.panel(host);
    const sx = ui.slider(panel, { id: 'cut', label: 'Cut size $x$', min: 0.05, max: 5.95, step: 0.05, value: x, onInput: (v) => { x = Math.min(v, L / 2 - 0.05); update(); } });
    ui.slider(panel, { id: 'L', label: 'Sheet side $L$', min: 6, max: 20, step: 1, value: L, onInput: (v) => { L = v; sx.input.max = L / 2 - 0.05; x = Math.min(x, L / 2 - 0.05); sx.set(x); update(); } });
    const out = ui.readout(host);
    V.handle({ get: () => [x, x * (L - 2 * x) ** 2], set: (px) => { x = Math.max(0.05, Math.min(L / 2 - 0.05, px)); sx.set(x); update(); }, color: 2 });
    function update() {
      const vol = (t) => t * (L - 2 * t) ** 2, best = L / 6, vmax = vol(best);
      S.setView(-1, L + 1, -1, L + 1);
      S.draw((p) => {
        p.poly([[x, 0], [L - x, 0], [L - x, x], [L, x], [L, L - x], [L - x, L - x], [L - x, L], [x, L], [x, L - x], [0, L - x], [0, x], [x, x]], { fill: 1, fillAlpha: 0.15, color: 1 });
        [[0, 0], [L - x, 0], [0, L - x], [L - x, L - x]].forEach(([a, b]) => p.rect(a, b, a + x, b + x, { fill: 2, fillAlpha: 0.35, stroke: 2, width: 1 }));
        p.path([[x, x], [L - x, x], [L - x, L - x], [x, L - x]], { close: true, color: 1, width: 1, dash: [4, 4] });
        p.text(`x = ${n2(x)}`, x / 2, x / 2, { align: 'center', color: 2, size: 11 });
        p.text(`${n2(L - 2 * x)}`, L / 2, L / 2, { align: 'center', color: 1, size: 13, weight: 700 });
      });
      V.setView(-0.3, L / 2 + 0.3, -vmax * 0.07, vmax * 1.15);
      V.draw((p) => {
        p.fn(vol, { color: 1, width: 2.5, from: 0, to: L / 2 });
        p.vline(best, { color: 3 }); p.point(best, vmax, { color: 3, hollow: true });
      });
      out.set(`Fold up the flaps to get a box $${n2(L - 2 * x)} \\times ${n2(L - 2 * x)} \\times ${n2(x)}$ with volume $V(x) = x(${L} - 2x)^2 \\approx ${n2(vol(x))}$. Calculus says the best cut is where $V'(x) = 0$: $x = L/6 = ${n2(best)}$, giving $V = ${n2(vmax)}$.`);
    }
    update();
  });

  /* ---- Riemann sums ---- */
  const IF = {
    sq: { f: (x) => x * x, a: 0, b: 2, tex: 'x^2', exact: 8 / 3, view: [-0.3, 2.4, -0.5, 4.6] },
    sin: { f: Math.sin, a: 0, b: Math.PI, tex: '\\sin x', btex: '\\pi', exact: 2, view: [-0.3, 3.5, -0.3, 1.3] },
    exp: { f: (x) => Math.exp(-x * x), a: -2, b: 2, tex: 'e^{-x^2}', exact: 1.7641627815, view: [-2.4, 2.4, -0.2, 1.2] },
    wavy: { f: (x) => 1 + x * Math.sin(2 * x), a: 0, b: 4, tex: '1 + x\\sin 2x', exact: null, view: [-0.3, 4.3, -3.5, 4] },
    recip: { f: (x) => 1 / x, a: 1, b: 4, tex: '\\tfrac1x', exact: Math.log(4), view: [0.5, 4.3, -0.2, 1.2] },
  };
  AM.widget('riemann', (host, o, { ui }) => {
    let key = 'sq', n = 6, rule = 'left';
    const P = new Plot(host, { xmin: -0.3, xmax: 2.4, ymin: -0.5, ymax: 4.6, label: 'Riemann sum rectangles' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'fn', label: 'Function', options: [['sq', 'x² on [0, 2]'], ['sin', 'sin x on [0, π]'], ['exp', 'e^(−x²) on [−2, 2]'], ['wavy', '1 + x sin 2x on [0, 4]'], ['recip', '1/x on [1, 4]']], value: key, onChange: (v) => { key = v; P.setView(...IF[key].view); update(); } });
    ui.seg(panel, { id: 'rule', label: 'Height taken at', options: [['left', 'Left'], ['right', 'Right'], ['mid', 'Midpoint'], ['trap', 'Trapezoid']], value: rule, onChange: (v) => { rule = v; update(); } });
    ui.slider(panel, { id: 'n', label: 'Rectangles $n$', min: 1, max: 100, step: 1, value: n, fmt: (v) => String(v), onInput: (v) => { n = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const F = IF[key], { a, b, f } = F, dx = (b - a) / n;
      const exact = F.exact ?? M.integrate(f, a, b, 4000);
      let sum = 0;
      P.draw((p) => {
        for (let i = 0; i < n; i++) {
          const x0 = a + i * dx, x1 = x0 + dx;
          if (rule === 'trap') { const y0 = f(x0), y1 = f(x1); sum += ((y0 + y1) / 2) * dx; p.poly([[x0, 0], [x1, 0], [x1, y1], [x0, y0]], { fill: y0 + y1 >= 0 ? 1 : 4, fillAlpha: 0.22, stroke: 1, width: n > 40 ? 0.5 : 1 }); continue; }
          const xs = rule === 'left' ? x0 : rule === 'right' ? x1 : (x0 + x1) / 2, y = f(xs);
          sum += y * dx;
          p.rect(x0, 0, x1, y, { fill: y >= 0 ? 1 : 4, fillAlpha: 0.22, stroke: y >= 0 ? 1 : 4, width: n > 40 ? 0.5 : 1 });
          if (n <= 30) p.point(xs, y, { color: 2, r: 3 });
        }
        p.fn(f, { color: 'ink', width: 2.25 });
      });
      out.set(`Sum of ${n} ${rule === 'trap' ? 'trapezoids' : 'rectangles'} $\\approx ${AM.fmt(sum, 5)}$. Exact area $\\displaystyle\\int_{${AM.fmt(a)}}^{${F.btex || AM.fmt(b)}} ${F.tex}\\,dx ${F.exact ? '=' : '\\approx'} ${AM.fmt(exact, 5)}$. Error $\\approx ${AM.fmt(Math.abs(sum - exact), 5)}$. Width of each strip: $\\Delta x = ${AM.fmt(dx, 4)}$.`);
    }
    update();
  });

  /* ---- Accumulation function and FTC ---- */
  AM.widget('accumulate', (host, o, { ui }) => {
    const A = {
      cos: { f: Math.cos, tex: '\\cos t', Atex: '\\sin x', a: 0, view: [-0.5, 7, -1.6, 1.6] },
      lin: { f: (t) => t - 2, tex: 't - 2', Atex: '\\tfrac{x^2}{2} - 2x', a: 0, view: [-0.5, 6, -3, 7] },
      gauss: { f: (t) => Math.exp(-((t - 3) ** 2)), tex: 'e^{-(t-3)^2}', Atex: '\\text{(no elementary formula)}', a: 0, view: [-0.5, 6.5, -0.4, 2] },
      rate: { f: (t) => 3 * Math.sin(t) + 1, tex: '3\\sin t + 1', Atex: '3 - 3\\cos x + x', a: 0, view: [-0.5, 7, -3, 9] },
    };
    let key = 'cos', X = 2.2;
    const top = new Plot(host, { xmin: -0.5, xmax: 7, ymin: -1.6, ymax: 1.6, aspect: 0.36, minH: 170, label: 'Rate function with shaded area', ylabel: 'f(t)' });
    const bot = new Plot(host, { xmin: -0.5, xmax: 7, ymin: -1.6, ymax: 1.6, aspect: 0.36, minH: 170, label: 'Accumulated area function', ylabel: 'A(x)' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'fn', label: 'Rate $f(t)$', options: [['cos', 'cos t'], ['lin', 't − 2'], ['gauss', 'e^(−(t−3)²)'], ['rate', '3 sin t + 1']], value: key, onChange: (v) => { key = v; update(); } });
    const out = ui.readout(host);
    top.handle({ get: () => [X, 0], set: (x) => { X = Math.max(0, x); update(); }, color: 4 });
    bot.handle({ get: () => [X, M.integrate(A[key].f, 0, X, 200)], set: (x) => { X = Math.max(0, x); update(); }, color: 4 });
    function update() {
      const c = A[key], f = c.f, Acc = (x) => M.integrate(f, 0, x, 200);
      const [x0, x1, y0, y1] = c.view;
      top.setView(x0, x1, y0, y1);
      let lo = 0, hi = 0; for (let x = 0; x <= x1; x += 0.1) { const v = Acc(x); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      bot.setView(x0, x1, lo - (hi - lo) * 0.15 - 0.1, hi + (hi - lo) * 0.15 + 0.1);
      top.draw((p) => {
        p.area((t) => Math.max(0, f(t)), 0, X, { fill: 1, fillAlpha: 0.3 });
        p.area((t) => Math.min(0, f(t)), 0, X, { fill: 4, fillAlpha: 0.3 });
        p.fn(f, { color: 'ink', width: 2.25 });
        p.vline(X, { color: 4 });
      });
      const AX = Acc(X), slope = f(X);
      bot.draw((p) => {
        p.fn(Acc, { color: 3, width: 2.5, from: 0 });
        p.fn((x) => AX + slope * (x - X), { color: 2, width: 1.75, from: X - 0.9, to: X + 0.9 });
      });
      out.set(`$A(x) = \\displaystyle\\int_0^x ${c.tex}\\,dt$. At $x = ${n2(X)}$: area so far $A = ${n2(AX)}$ (blue counts positive, pink negative). The slope of $A$ there is $${n2(slope)}$, exactly the height $f(${n2(X)})$. That is the Fundamental Theorem: $A'(x) = f(x)$. Here $A(x) = ${c.Atex}$.`);
    }
    update();
  });

  /* ---- Integration by parts as areas ---- */
  AM.widget('byparts', (host, o, { ui }) => {
    const C = {
      sq: { u: (t) => t, v: (t) => t * t, ut: 'u = t', vt: 'v = t^2', t0: 0.5, t1: 2 },
      exp: { u: (t) => t, v: (t) => Math.exp(t) - 1, ut: 'u = t', vt: 'v = e^t - 1', t0: 0.3, t1: 1.6 },
      sqrt: { u: (t) => t * t, v: (t) => t, ut: 'u = t^2', vt: 'v = t', t0: 0.6, t1: 1.8 },
    };
    let key = 'sq', t0 = 0.5, t1 = 2;
    const P = new Plot(host, { xmin: -0.3, xmax: 4.5, ymin: -0.3, ymax: 4.5, equal: true, aspect: 0.7, xlabel: 'u', ylabel: 'v', label: 'Areas in integration by parts' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'curve', label: 'Curve', options: [['sq', 'u = t, v = t²'], ['exp', 'u = t, v = eᵗ − 1'], ['sqrt', 'u = t², v = t']], value: key, onChange: (v) => { key = v; t0 = C[v].t0; t1 = C[v].t1; s0.set(t0); s1.set(t1); update(); } });
    const s0 = ui.slider(panel, { id: 't0', label: 'Start $t_0$', min: 0, max: 1.5, step: 0.01, value: t0, onInput: (v) => { t0 = Math.min(v, t1 - 0.05); update(); } });
    const s1 = ui.slider(panel, { id: 't1', label: 'End $t_1$', min: 0.5, max: 2.2, step: 0.01, value: t1, onInput: (v) => { t1 = Math.max(v, t0 + 0.05); update(); } });
    ui.legend(host, [[1, '$\\int v\\,du$: under the curve'], [2, '$\\int u\\,dv$: left of the curve']]);
    const out = ui.readout(host);
    function update() {
      const c = C[key], U0 = c.u(t0), U1 = c.u(t1), V0 = c.v(t0), V1 = c.v(t1);
      const m = Math.max(U1, V1) * 1.15 + 0.3; P.setView(-0.3, m, -0.3, m);
      const pts = []; for (let i = 0; i <= 100; i++) { const t = t0 + ((t1 - t0) * i) / 100; pts.push([c.u(t), c.v(t)]); }
      const vdu = M.integrate((t) => c.v(t) * M.deriv(c.u, t), t0, t1, 400), udv = M.integrate((t) => c.u(t) * M.deriv(c.v, t), t0, t1, 400);
      P.draw((p) => {
        p.poly([...pts, [U1, 0], [U0, 0]], { fill: 1, fillAlpha: 0.3, stroke: false });
        p.poly([...pts, [0, V1], [0, V0]].reverse(), { fill: 2, fillAlpha: 0.3, stroke: false });
        p.rect(0, 0, U0, V0, { fill: 'muted', fillAlpha: 0.12, stroke: 'muted', width: 1, dash: [3, 3] });
        p.rect(0, 0, U1, V1, { fill: 'bg', fillAlpha: 0, stroke: 'ink2', width: 1.2, dash: [5, 4] });
        p.path(pts, { color: 'ink', width: 2.75 });
        p.point(U0, V0, { color: 'ink', r: 3.5 }); p.point(U1, V1, { color: 'ink', r: 3.5 });
      });
      out.set(`Curve $${c.ut},\\ ${c.vt}$. Blue $\\int v\\,du \\approx ${n2(vdu)}$, orange $\\int u\\,dv \\approx ${n2(udv)}$. Together they fill the big rectangle minus the small one: $${n2(vdu)} + ${n2(udv)} = ${n2(U1 * V1)} - ${n2(U0 * V0)} = [uv]$. Rearranged: $\\int u\\,dv = [uv] - \\int v\\,du$.`);
    }
    update();
  });

  /* ---- Taylor polynomials ---- */
  AM.widget('taylor', (host, o, { ui }) => {
    const T = {
      exp: { f: Math.exp, d: (k, a) => Math.exp(a), tex: 'e^x', view: [-4, 4, -2, 12], R: Infinity },
      sin: { f: Math.sin, d: (k, a) => [Math.sin, Math.cos, (x) => -Math.sin(x), (x) => -Math.cos(x)][k % 4](a), tex: '\\sin x', view: [-8, 8, -3, 3], R: Infinity },
      cos: { f: Math.cos, d: (k, a) => [Math.cos, (x) => -Math.sin(x), (x) => -Math.cos(x), Math.sin][k % 4](a), tex: '\\cos x', view: [-8, 8, -3, 3], R: Infinity },
      ln: { f: (x) => Math.log(1 + x), d: (k, a) => (k === 0 ? Math.log(1 + a) : ((-1) ** (k - 1) * M.fact(k - 1)) / (1 + a) ** k), tex: '\\ln(1+x)', view: [-1.5, 3, -3, 2.5], R: (a) => 1 + a },
      geo: { f: (x) => 1 / (1 - x), d: (k, a) => M.fact(k) / (1 - a) ** (k + 1), tex: '\\frac{1}{1-x}', view: [-3, 1.8, -2, 8], R: (a) => 1 - a },
    };
    let key = 'sin', N = 3, a = 0;
    const P = new Plot(host, { xmin: -8, xmax: 8, ymin: -3, ymax: 3, label: 'Function and its Taylor polynomial' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'fn', label: 'Function', options: [['sin', 'sin x'], ['cos', 'cos x'], ['exp', 'eˣ'], ['ln', 'ln(1 + x)'], ['geo', '1/(1 − x)']], value: key, onChange: (v) => { key = v; P.setView(...T[key].view); update(); } });
    ui.slider(panel, { id: 'deg', label: 'Degree $n$', min: 0, max: 20, step: 1, value: N, fmt: (v) => String(v), onInput: (v) => { N = v; update(); } });
    ui.slider(panel, { id: 'ctr', label: 'Centre $a$', min: -0.8, max: 0.8, step: 0.05, value: 0, onInput: (v) => { a = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const c = T[key], coef = []; for (let k = 0; k <= N; k++) coef.push(c.d(k, a) / M.fact(k));
      const Pn = (x) => { let s = 0, p = 1; for (let k = 0; k <= N; k++) { s += coef[k] * p; p *= x - a; } return s; };
      const R = typeof c.R === 'function' ? c.R(a) : c.R;
      P.draw((p) => {
        if (isFinite(R)) p.rect(a - R, p.v.ymin, a + R, p.v.ymax, { fill: 3, fillAlpha: 0.08, stroke: false });
        p.fn(c.f, { color: 'ink', width: 2.25 });
        p.fn(Pn, { color: 2, width: 2.5 });
        p.point(a, c.f(a), { color: 4 });
      });
      const xa = a === 0 ? 'x' : `(x ${a > 0 ? '-' : '+'} ${n2(Math.abs(a))})`;
      const terms = []; coef.forEach((cf, k) => { if (Math.abs(cf) < 1e-12 || terms.length >= 5) return; const num = AM.fmt(Math.abs(cf), 4); const pw = k === 0 ? '' : k === 1 ? xa : `${xa}^{${k}}`; terms.push(`${cf < 0 ? '-' : '+'} ${k === 0 || num !== '1' ? num : ''}${pw}`); });
      let poly = terms.join(' ').replace(/^\+ /, '');
      if (coef.filter((v) => Math.abs(v) > 1e-12).length > 5) poly += ' + \\cdots';
      const x1 = a + 1, err = Math.abs(c.f(x1) - Pn(x1));
      out.set(`$P_{${N}}(x) = ${poly || '0'}$. At $x = ${n2(x1)}$ the error is $|f - P_{${N}}| \\approx ${AM.fmt(err, 6)}$. ${isFinite(R) ? `The series only converges within distance ${n2(R)} of the centre (green band): the function blows up at the edge.` : 'This series converges for every $x$: raise $n$ and the match spreads outward forever.'}`);
    }
    update();
  });
})();
