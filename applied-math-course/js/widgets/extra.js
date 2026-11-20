/* Visuals for the deeper lessons: improper integrals, Laplace transforms, joint distributions, MLE, DFT. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, el = AM.el, M = AM.m, n2 = (v) => AM.fmt(v, 2), n3 = (v) => AM.fmt(v, 3), n4 = (v) => AM.fmt(v, 4), PI = Math.PI;

  /* ---- Improper integrals: ∫_1^b x^-p dx as b grows ---- */
  AM.widget('improper', (host, o, { ui }) => {
    let p = 2, lb = 1, kind = 'tail';
    const P = new Plot(host, { xmin: 0, xmax: 12, ymin: -0.1, ymax: 2.2, aspect: 0.5, label: 'Area under a power function' });
    const panel = ui.panel(host);
    ui.seg(panel, { id: 'kind', label: 'Region', options: [['tail', 'Tail: $\\int_1^b x^{-p}dx$'], ['spike', 'Spike: $\\int_a^1 x^{-p}dx$']], value: kind, onChange: (v) => { kind = v; update(); } });
    ui.slider(panel, { id: 'p', label: 'Power $p$', min: 0.3, max: 3, step: 0.05, value: p, onInput: (v) => { p = v; update(); } });
    ui.slider(panel, { id: 'b', label: 'Push the limit $k$ (tail ends at $1 + 10^k$, spike starts at $10^{-k}$)', min: 0, max: 4, step: 0.01, value: lb, onInput: (v) => { lb = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const f = (x) => x ** -p, e = 10 ** lb;
      if (kind === 'tail') {
        const b = 1 + e, area = Math.abs(p - 1) < 1e-9 ? Math.log(b) : (b ** (1 - p) - 1) / (1 - p), lim = p > 1 ? 1 / (p - 1) : Infinity;
        P.setView(0, Math.min(b * 1.15, 60), -0.05, 1.3);
        P.draw((pl) => { pl.area(f, 1, Math.min(b, 60), { fill: 1, fillAlpha: 0.3, n: 400 }); pl.fn(f, { color: 1, width: 2.5, from: 0.3 }); pl.vline(Math.min(b, 60), { color: 2 }); });
        out.set(`$\\int_1^{${n2(b)}} x^{-${n2(p)}}\\,dx = ${n4(area)}$. ${p > 1 ? `As the endpoint goes to infinity the area approaches $\\frac{1}{p-1} = ${n4(lim)}$: the integral **converges**, even though the region is infinitely long.` : `It keeps growing without bound (like ${Math.abs(p - 1) < 0.03 ? '$\\ln b$' : '$b^{1-p}$'}): the integral **diverges**. The tail is too thick when $p \\le 1$.`}`);
      } else {
        const a = 10 ** -lb, area = Math.abs(p - 1) < 1e-9 ? -Math.log(a) : (1 - a ** (1 - p)) / (1 - p), lim = p < 1 ? 1 / (1 - p) : Infinity;
        P.setView(-0.05, 1.3, -0.1, 12);
        P.draw((pl) => { pl.area((x) => Math.min(f(x), 1e3), a, 1, { fill: 2, fillAlpha: 0.3, n: 600 }); pl.fn(f, { color: 2, width: 2.5, from: 0.005, to: 1.3 }); pl.vline(a, { color: 1 }); });
        out.set(`$\\int_{${AM.fmt(a, 5)}}^{1} x^{-${n2(p)}}\\,dx = ${n4(area)}$. ${p < 1 ? `As $a\\to0^+$ this approaches $\\frac{1}{1-p} = ${n4(lim)}$: **converges** even though the spike is infinitely tall.` : '**Diverges**: near 0 the spike is too sharp when $p \\ge 1$. Notice the conditions are opposite to the tail case.'}`);
      }
    }
    update();
  });

  /* ---- Laplace transform: pole positions ↔ time response ---- */
  AM.widget('laplace', (host, o, { ui }) => {
    const pole = [-0.4, 2]; let pair = true;
    const row = el('div', 'viz-row'); host.appendChild(row);
    const S = new Plot(row, { xmin: -3, xmax: 1.5, ymin: -3.5, ymax: 3.5, equal: true, aspect: 1, xstep: 1, xlabel: 'Re s', ylabel: 'Im s', label: 's-plane with draggable pole' });
    const T = new Plot(row, { xmin: 0, xmax: 12, ymin: -1.5, ymax: 1.5, aspect: 1, xlabel: 't', label: 'Impulse response in time' });
    const panel = ui.panel(host);
    ui.toggle(panel, { id: 'pair', label: 'Complex-conjugate pair (oscillating system)', value: pair, onChange: (v) => { pair = v; if (!v) pole[1] = 0; update(); } });
    const out = ui.readout(host);
    S.handle({ get: () => pole, set: (x, y) => { pole[0] = Math.max(-3, Math.min(1, x)); pole[1] = pair ? Math.max(0.05, Math.abs(y)) : 0; update(); }, color: 2 });
    function update() {
      const [a, w] = pole, h = pair ? (t) => Math.exp(a * t) * Math.sin(w * t) : (t) => Math.exp(a * t), mx = Math.max(1, ...Array.from({ length: 200 }, (_, i) => Math.abs(h((12 * i) / 200))));
      S.draw((p) => { p.rect(p.v.xmin, p.v.ymin, 0, p.v.ymax, { fill: 3, fillAlpha: 0.08, stroke: false }); p.vline(0, { color: 'ink2', dash: [], width: 1.5 }); p.text('×', a, w, { align: 'center', color: 2, size: 20, weight: 700 }); if (pair) p.text('×', a, -w, { align: 'center', color: 2, size: 20, weight: 700 }); p.text('stable', -2.9, 3.2, { color: 3 }); p.text('unstable', 0.1, 3.2, { color: 'bad' }); });
      T.setView(0, 12, -mx * 1.1, mx * 1.1);
      T.draw((p) => { if (a !== 0) { p.fn((t) => Math.exp(a * t), { color: 'muted', dash: [4, 4], width: 1 }); if (pair) p.fn((t) => -Math.exp(a * t), { color: 'muted', dash: [4, 4], width: 1 }); } p.fn(h, { color: 1, width: 2.5, n: 800 }); });
      const Ftex = pair ? `\\frac{${n2(w)}}{(s ${a < 0 ? '+' : '-'} ${n2(Math.abs(a))})^2 + ${n2(w * w)}}` : `\\frac{1}{s ${a < 0 ? '+' : '-'} ${n2(Math.abs(a))}}`;
      out.set(`$F(s) = ${Ftex}$ has ${pair ? `poles at $${n2(a)} \\pm ${n2(w)}i$` : `a pole at $${n2(a)}$`}, so $f(t) = ${pair ? `e^{${n2(a)}t}\\sin(${n2(w)}t)` : `e^{${n2(a)}t}`}$. **Real part** of the pole = growth/decay rate (${a < 0 ? 'left half-plane: decays, stable' : a > 0 ? 'right half-plane: grows, unstable' : 'on the axis: neither'}); **imaginary part** = oscillation frequency. Drag the pole.`);
    }
    update();
  });

  /* ---- Joint distribution: correlated normals ---- */
  AM.widget('joint', (host, o, { ui }) => {
    let rho = 0.6, sx = 1, sy = 1, N = 600; let Z = [];
    const P = new Plot(host, { xmin: -4, xmax: 4, ymin: -4, ymax: 4, equal: true, aspect: 0.62, xstep: 1, label: 'Scatter of correlated normal pairs' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'rho', label: 'Correlation $\\rho$', min: -0.99, max: 0.99, step: 0.01, value: rho, onInput: (v) => { rho = v; update(); } });
    ui.slider(panel, { id: 'sx', label: 'SD of $X$', min: 0.3, max: 2, step: 0.05, value: sx, onInput: (v) => { sx = v; update(); } });
    ui.slider(panel, { id: 'sy', label: 'SD of $Y$', min: 0.3, max: 2, step: 0.05, value: sy, onInput: (v) => { sy = v; update(); } });
    ui.button(panel, 'New sample', () => { seed(); update(); });
    const out = ui.readout(host);
    function seed() { Z = Array.from({ length: N }, () => [M.randn(Math.random), M.randn(Math.random)]); }
    function update() {
      const pts = Z.map(([z1, z2]) => [sx * z1, sy * (rho * z1 + Math.sqrt(1 - rho * rho) * z2)]);
      const mx = pts.reduce((a, q) => a + q[0], 0) / N, my = pts.reduce((a, q) => a + q[1], 0) / N, cxy = pts.reduce((a, q) => a + (q[0] - mx) * (q[1] - my), 0) / (N - 1), vx = pts.reduce((a, q) => a + (q[0] - mx) ** 2, 0) / (N - 1), vy = pts.reduce((a, q) => a + (q[1] - my) ** 2, 0) / (N - 1);
      const cov = rho * sx * sy, E = AM.eig2(sx * sx, cov, cov, sy * sy);
      P.draw((p) => {
        pts.forEach(([x, y]) => p.point(x, y, { color: 1, r: 2 }));
        [1, 2].forEach((k) => p.param((t) => k * (Math.sqrt(E.ls[0]) * Math.cos(t) * E.vs[0][0] + Math.sqrt(Math.max(0, E.ls[1])) * Math.sin(t) * E.vs[1][0]), (t) => k * (Math.sqrt(E.ls[0]) * Math.cos(t) * E.vs[0][1] + Math.sqrt(Math.max(0, E.ls[1])) * Math.sin(t) * E.vs[1][1]), 0, 2 * PI, { color: 2, width: 2 }));
        p.fn((x) => (rho * sy / sx) * x, { color: 3, width: 2, dash: [6, 4] });
      });
      out.set(`True covariance matrix $\\Sigma = \\begin{pmatrix} ${n2(sx * sx)} & ${n2(cov)} \\\\ ${n2(cov)} & ${n2(sy * sy)}\\end{pmatrix}$. From the sample: $\\operatorname{Cov} \\approx ${n3(cxy)}$, $r \\approx ${n3(cxy / Math.sqrt(vx * vy))}$. The orange ellipses (1 and 2 SD) point along the eigenvectors of $\\Sigma$. The green line is $E[Y\\mid X = x] = \\rho\\frac{\\sigma_Y}{\\sigma_X}x$: knowing $X$ shifts your best guess for $Y$.`);
    }
    seed(); update();
  });

  /* ---- Maximum likelihood ---- */
  AM.widget('mle', (host, o, { ui }) => {
    let n = 20, k = 14, p = 0.5, logv = true;
    const P = new Plot(host, { xmin: 0, xmax: 1, ymin: -40, ymax: 2, aspect: 0.5, xlabel: 'p', label: 'Likelihood as a function of p' });
    const panel = ui.panel(host);
    const ks = ui.slider(panel, { id: 'k', label: 'Heads observed $k$', min: 0, max: n, step: 1, value: k, fmt: String, onInput: (v) => { k = v; update(); } });
    ui.slider(panel, { id: 'n', label: 'Flips $n$', min: 2, max: 200, step: 1, value: n, fmt: String, onInput: (v) => { n = v; ks.input.max = n; if (k > n) { k = n; ks.set(k); } update(); } });
    ui.toggle(panel, { id: 'log', label: 'Show log-likelihood', value: logv, onChange: (v) => { logv = v; update(); } });
    const out = ui.readout(host);
    P.handle({ get: () => [p, curve(p)], set: (x) => { p = Math.min(0.995, Math.max(0.005, x)); update(); }, color: 4 });
    function ll(q) { return k * Math.log(Math.max(q, 1e-300)) + (n - k) * Math.log(Math.max(1 - q, 1e-300)); }
    const phat = () => k / n;
    function curve(q) { const L = ll(q) - ll(Math.min(0.9999, Math.max(1e-4, phat()))); return logv ? L : Math.exp(L); }
    function update() {
      const ph = phat(), lo = logv ? Math.max(-40, Math.min(...[0.02, 0.98].map(curve)) - 2) : -0.05;
      P.setView(0, 1, lo, logv ? 2 : 1.15);
      P.draw((pl) => { pl.fn(curve, { color: 1, width: 2.5, from: 0.001, to: 0.999, n: 600 }); pl.vline(ph, { color: 3 }); const se = Math.sqrt((ph * (1 - ph)) / n); if (se > 0) pl.rect(ph - 1.96 * se, pl.v.ymin, ph + 1.96 * se, pl.v.ymax, { fill: 3, fillAlpha: 0.08, stroke: false }); });
      out.set(`Likelihood $L(p) = p^{${k}}(1-p)^{${n - k}}$ (scaled to peak at 1${logv ? ', shown on a log scale' : ''}). At the pink point $p = ${n3(p)}$ the log-likelihood is $${n2(ll(p) - ll(Math.min(0.9999, Math.max(1e-4, ph))))}$ below the maximum. The **maximum likelihood estimate** is $\\hat p = k/n = ${n3(ph)}$ (green line). The shaded band, $\\hat p \\pm 1.96\\sqrt{\\hat p(1-\\hat p)/n}$, shrinks as $n$ grows because the curve gets sharper.`);
    }
    update();
  });

  /* ---- Discrete Fourier transform ---- */
  AM.widget('dft', (host, o, { ui }) => {
    const s = { f1: 3, a1: 1, f2: 10, a2: 0.5, noise: 0, N: 64 };
    const T = new Plot(host, { xmin: 0, xmax: 1, ymin: -2.5, ymax: 2.5, aspect: 0.32, minH: 150, xlabel: 't (s)', label: 'Sampled signal' });
    const F = new Plot(host, { xmin: -0.5, xmax: 32.5, ymin: 0, ymax: 1.3, aspect: 0.3, minH: 150, xlabel: 'frequency (Hz)', label: 'Magnitude spectrum' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'f1', label: 'Tone 1 frequency (Hz)', min: 1, max: 60, step: 1, value: s.f1, fmt: String, onInput: (v) => { s.f1 = v; update(); } });
    ui.slider(panel, { id: 'a1', label: 'Tone 1 amplitude', min: 0, max: 1.5, step: 0.05, value: s.a1, onInput: (v) => { s.a1 = v; update(); } });
    ui.slider(panel, { id: 'f2', label: 'Tone 2 frequency (Hz)', min: 1, max: 60, step: 1, value: s.f2, fmt: String, onInput: (v) => { s.f2 = v; update(); } });
    ui.slider(panel, { id: 'a2', label: 'Tone 2 amplitude', min: 0, max: 1.5, step: 0.05, value: s.a2, onInput: (v) => { s.a2 = v; update(); } });
    ui.slider(panel, { id: 'noise', label: 'Noise', min: 0, max: 1, step: 0.05, value: s.noise, onInput: (v) => { s.noise = v; update(); } });
    const out = ui.readout(host);
    const noise = Array.from({ length: 64 }, () => M.randn(Math.random));
    function update() {
      const N = s.N, sig = (t) => s.a1 * Math.sin(2 * PI * s.f1 * t) + s.a2 * Math.sin(2 * PI * s.f2 * t), x = Array.from({ length: N }, (_, n) => sig(n / N) + s.noise * noise[n]);
      const mag = Array.from({ length: N / 2 + 1 }, (_, k) => { let re = 0, im = 0; for (let n = 0; n < N; n++) { re += x[n] * Math.cos((2 * PI * k * n) / N); im -= x[n] * Math.sin((2 * PI * k * n) / N); } return ((k === 0 || k === N / 2 ? 1 : 2) * Math.hypot(re, im)) / N; });
      T.draw((p) => { p.fn(sig, { color: 'muted', width: 1, n: 2000 }); x.forEach((v, n) => { p.line(n / N, 0, n / N, v, { color: 1, width: 1, alpha: 0.5 }); p.point(n / N, v, { color: 1, r: 2.5 }); }); });
      F.setView(-0.5, N / 2 + 0.5, 0, Math.max(1.2, ...mag) * 1.1);
      F.draw((p) => mag.forEach((m, k) => p.rect(k - 0.35, 0, k + 0.35, m, { fill: 2, fillAlpha: 0.8, stroke: false })));
      const alias = (f) => { const r = f % N; return Math.min(r, N - r); };
      const warn = [s.f1, s.f2].filter((f) => f > N / 2);
      out.set(`${N} samples per second, so the DFT sees frequencies $0$ to $N/2 = ${N / 2}$ Hz (the Nyquist limit). Peaks appear at ${[[s.f1, s.a1], [s.f2, s.a2]].filter(([, a]) => a > 0).map(([f]) => `$${alias(f)}$ Hz`).join(' and ')}. ${warn.length ? `**Aliasing**: ${warn.map((f) => `${f} Hz shows up as ${alias(f)} Hz`).join(', ')}, because it oscillates faster than the samples can follow.` : 'Noise spreads over every frequency while the tones stay sharp, which is why filtering works in the frequency domain.'}`);
    }
    update();
  });
})();
