/* Visuals for Real Analysis and Numerical Methods. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, el = AM.el, M = AM.m, n2 = (v) => AM.fmt(v, 2), n4 = (v) => AM.fmt(v, 4), sci = (v) => (v === 0 ? '0' : Math.abs(v) >= 1e-3 && Math.abs(v) < 1e4 ? AM.fmt(v, 5) : v.toExponential(2).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`));

  /* ---- ε–N for sequences ---- */
  AM.widget('epsn', (host, o, { ui }) => {
    const SEQ = {
      inv: [(n) => 1 / n, 0, '\\frac1n'], alt: [(n) => (-1) ** n / n, 0, '\\frac{(-1)^n}{n}'], ratio: [(n) => (n + 1) / n, 1, '\\frac{n+1}{n}'],
      sinn: [(n) => Math.sin(n) / Math.sqrt(n), 0, '\\frac{\\sin n}{\\sqrt n}'], e: [(n) => (1 + 1 / n) ** n, Math.E, '\\left(1+\\frac1n\\right)^n'], osc: [(n) => (-1) ** n + 1 / n, null, '(-1)^n + \\frac1n'],
    };
    let key = 'alt', le = -1;
    const P = new Plot(host, { xmin: 0, xmax: 61, ymin: -1, ymax: 1, aspect: 0.5, xlabel: 'n', label: 'Terms of a sequence with an epsilon band' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'seq', label: 'Sequence', options: [['alt', '(−1)ⁿ/n'], ['inv', '1/n'], ['ratio', '(n+1)/n'], ['sinn', 'sin(n)/√n'], ['e', '(1 + 1/n)ⁿ'], ['osc', '(−1)ⁿ + 1/n (diverges)']], value: key, onChange: (v) => { key = v; update(); } });
    ui.slider(panel, { id: 'eps', label: 'Tolerance $\\varepsilon$', min: -2.3, max: 0, step: 0.01, value: le, fmt: (v) => AM.fmt(10 ** v, 4), onInput: (v) => { le = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const [a, L, tex] = SEQ[key], eps = 10 ** le;
      let N = null;
      if (L !== null) { let last = 0; for (let n = 1; n <= 20000; n++) if (Math.abs(a(n) - L) >= eps) last = n; N = last + 1; }
      const vals = Array.from({ length: 60 }, (_, i) => a(i + 1)), lo = Math.min(...vals, L ?? 0) - 0.15, hi = Math.max(...vals, L ?? 0) + 0.15;
      P.setView(0, 61, lo, hi);
      P.draw((p) => {
        if (L !== null) { p.rect(0, L - eps, 61, L + eps, { fill: 3, fillAlpha: 0.18, stroke: false }); p.hline(L, { color: 3, dash: [6, 4], width: 1.5 }); if (N <= 60) p.vline(N, { color: 2, width: 1.5 }); }
        vals.forEach((v, i) => { const n = i + 1, inside = L !== null && n >= N; p.point(n, v, { color: inside ? 3 : L !== null && Math.abs(v - L) >= eps ? 2 : 1, r: 3.5 }); });
      });
      out.set(L === null ? `$a_n = ${tex}$ bounces between values near $1$ and $-1$. No single $L$ can trap the tail inside any band narrower than 1, so the sequence **diverges**.` : `$a_n = ${tex} \\to ${key === 'e' ? 'e' : L}$. With $\\varepsilon = ${AM.fmt(eps, 4)}$, every term from $N = ${N}$ on stays inside the green band${N > 60 ? ' (beyond the plotted range)' : ' (orange line)'}. Shrink $\\varepsilon$ and $N$ grows, but some $N$ always exists: that's what convergence means.`);
    }
    update();
  });

  /* ---- ε–δ continuity ---- */
  AM.widget('epsdelta', (host, o, { ui }) => {
    const F = {
      sq: [(x) => x * x, 1, '$f(x) = x^2$ at $a = 1$', [-0.5, 2.5, -0.3, 3]],
      sqrt: [(x) => Math.sqrt(Math.max(0, x)), 4, '$f(x) = \\sqrt x$ at $a = 4$', [0, 8, 0, 3.2]],
      cube: [(x) => x ** 3 - 2 * x, 1, '$f(x) = x^3 - 2x$ at $a = 1$', [-1, 3, -2.5, 4]],
      step: [(x) => (x < 1 ? 1 : 2), 1, 'a step at $a = 1$ (not continuous)', [-0.5, 2.5, 0, 3]],
    };
    let key = 'sq', eps = 0.5, del = 0.3;
    const P = new Plot(host, { xmin: -0.5, xmax: 2.5, ymin: -0.3, ymax: 3, aspect: 0.6, label: 'Epsilon band and delta band' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'fn', label: 'Function', options: [['sq', 'x² at 1'], ['sqrt', '√x at 4'], ['cube', 'x³ − 2x at 1'], ['step', 'step at 1']], value: key, onChange: (v) => { key = v; P.setView(...F[key][3]); update(); } });
    ui.slider(panel, { id: 'eps', label: 'Output tolerance $\\varepsilon$', min: 0.05, max: 1, step: 0.01, value: eps, onInput: (v) => { eps = v; update(); } });
    ui.slider(panel, { id: 'del', label: 'Input window $\\delta$', min: 0.01, max: 1, step: 0.005, value: del, onInput: (v) => { del = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const [f, a, name] = F[key], L = key === 'step' ? 2 : f(a);
      let worst = 0; for (let i = 0; i <= 400; i++) { const x = a - del + (2 * del * i) / 400; worst = Math.max(worst, Math.abs(f(x) - L)); }
      const ok = worst < eps; let best = 0; for (let d = 1; d > 1e-4; d *= 0.97) { let w = 0; for (let i = 0; i <= 200; i++) { const x = a - d + (2 * d * i) / 200; w = Math.max(w, Math.abs(f(x) - L)); } if (w < eps) { best = d; break; } }
      P.draw((p) => {
        p.rect(p.v.xmin, L - eps, p.v.xmax, L + eps, { fill: 3, fillAlpha: 0.14, stroke: false });
        p.rect(a - del, p.v.ymin, a + del, p.v.ymax, { fill: 1, fillAlpha: 0.1, stroke: false });
        p.fn(f, { color: 'muted', width: 1.5 });
        p.fn(f, { color: ok ? 3 : 'bad', width: 3.5, from: a - del, to: a + del, n: 400 });
        p.point(a, L, { color: 'ink', r: 4 });
      });
      out.set(`${name}, $f(a) = ${n2(L)}$. Within $|x - a| < ${n4(del)}$ the outputs stay within $${n4(worst)}$ of $f(a)$, which is ${ok ? `**inside** $\\varepsilon = ${n2(eps)}$: this $\\delta$ works` : `**outside** $\\varepsilon = ${n2(eps)}$: this $\\delta$ is too big`}. ${best > 0 ? `The largest $\\delta$ that works here is about $${n4(best)}$.` : 'No $\\delta$ works, however small, so $f$ is **not continuous** at $a$.'}`);
    }
    P.setView(...F[key][3]); update();
  });

  /* ---- Pointwise vs uniform convergence ---- */
  AM.widget('uniform', (host, o, { ui }) => {
    const SQ = {
      pow: [(n, x) => x ** n, (x) => (x < 1 ? 0 : 1), 'f_n(x) = x^n', 'Converges pointwise to 0 for $x < 1$ (and 1 at $x = 1$), but not uniformly: near $x = 1$ there is always a point where $f_n$ is still close to 1.', [0, 1.02, -0.1, 1.1]],
      sinc: [(n, x) => Math.sin(n * x) / n, () => 0, 'f_n(x) = \\tfrac{\\sin(nx)}{n}', 'Converges **uniformly** to 0: $|f_n(x)| \\le 1/n$ everywhere at once.', [0, 6.3, -1.05, 1.05]],
      bump: [(n, x) => n * x * Math.exp(-n * x * x), () => 0, 'f_n(x) = nx\\,e^{-nx^2}', 'Converges to 0 at every point, yet the bump grows taller as it slides toward 0. Not uniform, and $\\int_0^1 f_n \\to \\tfrac12 \\ne \\int_0^1 0$.', [0, 1.5, -0.2, 6]],
      ratio: [(n, x) => x / (1 + n * x * x), () => 0, 'f_n(x) = \\tfrac{x}{1 + nx^2}', 'Converges **uniformly** to 0: the maximum is $\\tfrac{1}{2\\sqrt n}$, which shrinks to 0.', [0, 3, -0.1, 0.6]],
    };
    let key = 'pow', n = 5, eps = 0.1;
    const P = new Plot(host, { xmin: 0, xmax: 1.02, ymin: -0.1, ymax: 1.1, aspect: 0.55, label: 'A sequence of functions and its limit' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'seq', label: 'Sequence', options: [['pow', 'xⁿ on [0, 1]'], ['sinc', 'sin(nx)/n'], ['bump', 'nx e^(−nx²)'], ['ratio', 'x/(1 + nx²)']], value: key, onChange: (v) => { key = v; P.setView(...SQ[key][4]); update(); } });
    ui.slider(panel, { id: 'n', label: '$n$', min: 1, max: 80, step: 1, value: n, fmt: String, onInput: (v) => { n = v; update(); } });
    ui.slider(panel, { id: 'eps', label: 'Band $\\varepsilon$', min: 0.02, max: 0.5, step: 0.01, value: eps, onInput: (v) => { eps = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const [fn, lim, tex, note, view] = SQ[key];
      let sup = 0; for (let i = 0; i <= 2000; i++) { const x = view[0] + ((view[1] - view[0]) * i) / 2000; if (key === 'pow' && x >= 1) continue; sup = Math.max(sup, Math.abs(fn(n, x) - lim(x))); }
      P.draw((p) => {
        p.area((x) => lim(x) + eps, view[0], key === 'pow' ? 0.999 : view[1], { base: (x) => lim(x) - eps, fill: 3, fillAlpha: 0.18, n: 400 });
        [1, 2, 3].forEach((k) => { if (n - k * Math.ceil(n / 4) > 0) p.fn((x) => fn(n - k * Math.ceil(n / 4), x), { color: 'muted', width: 1, alpha: 0.5 }); });
        p.fn((x) => fn(n, x), { color: 1, width: 2.75, n: 800 });
        p.fn(lim, { color: 3, width: 2, dash: [6, 4], to: key === 'pow' ? 0.999 : view[1] });
      });
      out.set(`$${tex}$, $n = ${n}$. Largest gap from the limit: $\\sup|f_n - f| \\approx ${n4(sup)}$ ${sup < eps ? '— the whole curve is inside the band' : '— part of the curve escapes the band'}. ${note}`);
    }
    P.setView(...SQ[key][4]); update();
  });

  /* ---- Finite differences: truncation vs rounding error ---- */
  AM.widget('fderror', (host, o, { ui }) => {
    const F = { sin: [Math.sin, Math.cos, '\\sin x'], exp: [Math.exp, Math.exp, 'e^x'], atan: [Math.atan, (x) => 1 / (1 + x * x), '\\arctan x'] };
    let key = 'sin', k = 5;
    const P = new Plot(host, { xmin: -16.5, xmax: 0.5, ymin: -17, ymax: 1, aspect: 0.55, xlabel: 'log₁₀ h', ylabel: 'log₁₀ error', xstep: 2, ystep: 2, label: 'Error of finite differences against step size' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'fn', label: 'Function', options: [['sin', 'sin x'], ['exp', 'eˣ'], ['atan', 'arctan x']], value: key, onChange: (v) => { key = v; update(); } });
    ui.slider(panel, { id: 'h', label: 'Step $h = 10^{-k}$, $k$', min: 0, max: 16, step: 0.25, value: k, onInput: (v) => { k = v; update(); } });
    ui.legend(host, [[1, 'Forward $\\frac{f(x+h) - f(x)}{h}$'], [2, 'Central $\\frac{f(x+h) - f(x-h)}{2h}$']]);
    const out = ui.readout(host);
    function update() {
      const [f, d] = F[key], x = 1, exact = d(x);
      const fwd = (h) => (f(x + h) - f(x)) / h, cen = (h) => (f(x + h) - f(x - h)) / (2 * h);
      const ptsF = [], ptsC = [];
      for (let e = 0; e <= 16; e += 0.125) { const h = 10 ** -e, ef = Math.abs(fwd(h) - exact), ec = Math.abs(cen(h) - exact); ptsF.push([-e, Math.log10(Math.max(ef, 1e-17))]); ptsC.push([-e, Math.log10(Math.max(ec, 1e-17))]); }
      const h = 10 ** -k, ef = Math.abs(fwd(h) - exact), ec = Math.abs(cen(h) - exact);
      P.draw((p) => { p.path(ptsF, { color: 1, width: 2.25 }); p.path(ptsC, { color: 2, width: 2.25 }); p.vline(-k, { color: 4 }); p.point(-k, Math.log10(Math.max(ef, 1e-17)), { color: 1 }); p.point(-k, Math.log10(Math.max(ec, 1e-17)), { color: 2 }); });
      out.set(`Estimating $\\frac{d}{dx}${F[key][2]}$ at $x = 1$ (exact $${n4(exact)}$) with $h = 10^{-${k}}$: forward error $${sci(ef)}$, central error $${sci(ec)}$. Going right to left, the error first falls (truncation error, slopes 1 and 2), then climbs again once $h$ is so small that subtracting nearly equal numbers loses digits (rounding error). The best $h$ is near $10^{-8}$ for forward and $10^{-5}$ for central differences.`);
    }
    update();
  });

  /* ---- Newton's method and bisection ---- */
  AM.widget('newton', (host, o, { ui }) => {
    const F = {
      sqrt2: [(x) => x * x - 2, (x) => 2 * x, 'x^2 - 2', [-0.5, 3.5, -3, 8], 3, [0, 2]],
      cos: [(x) => Math.cos(x) - x, (x) => -Math.sin(x) - 1, '\\cos x - x', [-1, 3, -3, 1.5], 2.5, [0, 1]],
      cubic: [(x) => x ** 3 - 2 * x - 5, (x) => 3 * x * x - 2, 'x^3 - 2x - 5', [0, 4, -10, 30], 3.5, [2, 3]],
      atan: [Math.atan, (x) => 1 / (1 + x * x), '\\arctan x', [-5, 5, -1.8, 1.8], 1.2, [-1, 3]],
      flat: [(x) => x ** 3 - x, (x) => 3 * x * x - 1, 'x^3 - x', [-2, 2, -3, 3], 0.55, [0.5, 1.5]],
    };
    let key = 'sqrt2', x0 = 3, steps = 1, method = 'newton';
    const P = new Plot(host, { xmin: -0.5, xmax: 3.5, ymin: -3, ymax: 8, aspect: 0.55, label: "Newton's method tangent steps" });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'fn', label: 'Solve $f(x) = 0$', options: [['sqrt2', 'x² − 2 = 0'], ['cos', 'cos x = x'], ['cubic', 'x³ − 2x − 5 = 0'], ['atan', 'arctan x = 0 (try x₀ = 1.5)'], ['flat', 'x³ − x = 0 (sensitive start)']], value: key, onChange: (v) => { key = v; x0 = F[key][4]; steps = 1; ss.set(1); P.setView(...F[key][3]); update(); } });
    ui.seg(panel, { id: 'm', label: 'Method', options: [['newton', 'Newton'], ['bisect', 'Bisection']], value: method, onChange: (v) => { method = v; update(); } });
    const ss = ui.slider(panel, { id: 'steps', label: 'Iterations shown', min: 0, max: 10, step: 1, value: steps, fmt: String, onInput: (v) => { steps = v; update(); } });
    const out = ui.readout(host);
    P.handle({ get: () => [x0, 0], set: (x) => { x0 = x; update(); }, color: 4, hidden: () => method !== 'newton' });
    function update() {
      const [f, df, tex, , , br] = F[key], it = [];
      P.draw((p) => {
        p.fn(f, { color: 1, width: 2.5 });
        if (method === 'newton') {
          let x = x0; it.push(x);
          for (let i = 0; i < steps; i++) {
            const y = f(x), s = df(x); if (!isFinite(s) || Math.abs(s) < 1e-12) break;
            const xn = x - y / s;
            p.line(x, 0, x, y, { color: 'muted', width: 1, dash: [3, 3] });
            p.line(x, y, xn, 0, { color: 2, width: 1.75 }); p.point(x, y, { color: 2, r: 3.5 });
            x = xn; it.push(x); if (Math.abs(x) > 1e6) break;
          }
          it.forEach((v, i) => p.point(v, 0, { color: i === it.length - 1 ? 3 : 'muted', r: i === it.length - 1 ? 5 : 3 }));
        } else {
          let [a, b] = br, k = 0; it.push((a + b) / 2);
          for (; k < steps; k++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; it.push((a + b) / 2); }
          p.rect(a, p.v.ymin, b, p.v.ymax, { fill: 3, fillAlpha: 0.15, stroke: 3, width: 1 });
          p.point((a + b) / 2, 0, { color: 3, r: 5 });
        }
      });
      const last = it[it.length - 1], res = Math.abs(f(last));
      const list = it.slice(0, 8).map((v, i) => `x_{${i}} = ${isFinite(v) ? AM.fmt(v, 10) : '\\infty'}`).join(',\\ ');
      out.set(`$f(x) = ${tex}$. ${method === 'newton' ? `$x_{n+1} = x_n - f(x_n)/f'(x_n)$. Drag the pink start point.` : `The bracket starts at $[${br[0]}, ${br[1]}]$ and halves each step.`} $${list}$. Residual $|f(x)| = ${sci(res)}$. ${method === 'newton' ? 'Near a simple root the number of correct digits roughly doubles every step (quadratic convergence).' : 'Bisection gains one binary digit per step: slow but guaranteed.'}`);
    }
    P.setView(...F[key][3]); update();
  });

  /* ---- Euler vs RK4 ---- */
  AM.widget('odesolvers', (host, o, { ui }) => {
    const EQ = {
      grow: { f: (t, y) => [y[0]], y0: [1], T: 3, exact: (t) => Math.exp(t), tex: "y' = y,\\ y(0) = 1", view: [-0.1, 3.1, 0, 22] },
      decay: { f: (t, y) => [-4 * y[0]], y0: [1], T: 3, exact: (t) => Math.exp(-4 * t), tex: "y' = -4y,\\ y(0) = 1", view: [-0.1, 3.1, -1.2, 1.2], note: 'Euler is only stable for $h < 0.5$ here: above that, its errors grow each step and the solution oscillates wildly.' },
      osc: { f: (t, y) => [y[1], -y[0]], y0: [1, 0], T: 12, exact: (t) => Math.cos(t), tex: "y'' = -y,\\ y(0) = 1,\\ y'(0) = 0", view: [-0.2, 12.2, -2.5, 2.5], note: "Euler's oscillation grows every cycle: it adds energy that the real system doesn't have." },
    };
    let key = 'grow', h = 0.3;
    const P = new Plot(host, { xmin: -0.1, xmax: 3.1, ymin: 0, ymax: 22, aspect: 0.55, xlabel: 't', label: 'Numerical solutions against the exact solution' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'eq', label: 'Equation', options: [['grow', "y′ = y"], ['decay', "y′ = −4y"], ['osc', "y″ = −y (oscillator)"]], value: key, onChange: (v) => { key = v; P.setView(...EQ[key].view); update(); } });
    ui.slider(panel, { id: 'h', label: 'Step size $h$', min: 0.02, max: 1, step: 0.01, value: h, onInput: (v) => { h = v; update(); } });
    ui.legend(host, [[3, 'Exact'], [2, 'Euler'], [1, 'RK4']]);
    const out = ui.readout(host);
    function update() {
      const E = EQ[key], n = Math.max(1, Math.round(E.T / h)), hh = E.T / n;
      const eu = M.solve(E.f, E.y0, 0, E.T, n, M.eulerStep), rk = M.solve(E.f, E.y0, 0, E.T, n, M.rk4Step);
      const clamp = (v) => Math.max(-1e3, Math.min(1e3, v));
      P.draw((p) => {
        p.fn(E.exact, { color: 3, width: 2.5, from: 0, to: E.T });
        p.path(eu.map(([t, y]) => [t, clamp(y[0])]), { color: 2, width: 1.75 }); eu.forEach(([t, y]) => p.point(t, clamp(y[0]), { color: 2, r: 2.5 }));
        p.path(rk.map(([t, y]) => [t, clamp(y[0])]), { color: 1, width: 1.75, dash: [5, 3] }); rk.forEach(([t, y]) => p.point(t, clamp(y[0]), { color: 1, r: 2.5 }));
      });
      const ex = E.exact(E.T), ee = Math.abs(eu[eu.length - 1][1][0] - ex), er = Math.abs(rk[rk.length - 1][1][0] - ex);
      out.set(`$${E.tex}$ on $[0, ${E.T}]$ with ${n} steps of $h = ${AM.fmt(hh, 3)}$. Error at $t = ${E.T}$: Euler $${sci(ee)}$, RK4 $${sci(er)}$. Halve $h$ and Euler's error roughly halves (order 1) while RK4's drops about 16-fold (order 4). ${E.note || ''}`);
    }
    P.setView(...EQ[key].view); update();
  });
})();
