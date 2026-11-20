/* Visuals for Stage 5: numerical linear algebra, stochastic processes, variational methods. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, el = AM.el, M = AM.m, n2 = (v) => AM.fmt(v, 2), n3 = (v) => AM.fmt(v, 3), n4 = (v) => AM.fmt(v, 4), PI = Math.PI;
  const sci = (v) => (Math.abs(v) >= 1e-3 && Math.abs(v) < 1e5 ? AM.fmt(v, 4) : v.toExponential(2).replace(/e([+-]\d+)/, (m, e) => `\\times10^{${+e}}`));

  /* ---- Conditioning: nearly parallel lines ---- */
  AM.widget('conditioning', (host, o, { ui }) => {
    let tilt = 0.15, pert = 0.1;
    const P = new Plot(host, { xmin: -1, xmax: 5, ymin: -1, ymax: 5, equal: true, aspect: 0.62, xstep: 1, label: 'Two nearly parallel lines' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'tilt', label: 'Angle between the lines', min: 0.01, max: 1.2, step: 0.005, value: tilt, onInput: (v) => { tilt = v; update(); } });
    ui.slider(panel, { id: 'pert', label: 'Error in the data $\\delta b$', min: 0, max: 0.3, step: 0.005, value: pert, onInput: (v) => { pert = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const A = [[1, 1], [1, 1 + tilt]], b = [4, 4 + 2 * tilt], solve = (bb) => { const d = A[0][0] * A[1][1] - A[0][1] * A[1][0]; return [(bb[0] * A[1][1] - A[0][1] * bb[1]) / d, (A[0][0] * bb[1] - bb[0] * A[1][0]) / d]; };
      const x = solve(b), xp = solve([b[0], b[1] + pert]), E = AM.eig2(2, 2 + tilt, 2 + tilt, 1 + (1 + tilt) ** 2), kappa = Math.sqrt(E.ls[0] / E.ls[1]);
      P.draw((p) => {
        p.fn((t) => (b[0] - t) / 1, { color: 1, width: 2.5 });
        p.fn((t) => (b[1] - t) / (1 + tilt), { color: 2, width: 2.5 });
        p.fn((t) => (b[1] + pert - t) / (1 + tilt), { color: 2, width: 1.5, dash: [5, 4] });
        p.point(x[0], x[1], { color: 3, r: 6 }); p.point(xp[0], xp[1], { color: 'bad', r: 6 });
        p.line(x[0], x[1], xp[0], xp[1], { color: 'bad', width: 1.5, dash: [3, 3] });
      });
      const rel = Math.hypot(xp[0] - x[0], xp[1] - x[1]) / Math.hypot(...x), relb = pert / Math.hypot(...b);
      out.set(`$A = \\begin{pmatrix} 1 & 1 \\\\ 1 & ${n3(1 + tilt)}\\end{pmatrix}$, condition number $\\kappa(A) \\approx ${n2(kappa)}$. A ${n2(relb * 100)}% change in $\\mathbf b$ moved the solution from the green point to the red one: a ${n2(rel * 100)}% change, amplified $${n2(rel / Math.max(relb, 1e-12))}\\times$ (never more than $\\kappa$). Flatten the angle and the crossing point becomes hypersensitive: the problem is **ill-conditioned**, whatever algorithm you use.`);
    }
    update();
  });

  /* ---- Gram–Schmidt in 2D ---- */
  AM.widget('gramschmidt', (host, o, { ui }) => {
    const v1 = [3, 1], v2 = [1.5, 2.5];
    const P = new Plot(host, { xmin: -3, xmax: 4.5, ymin: -1.5, ymax: 3.5, equal: true, aspect: 0.62, xstep: 1, label: 'Gram–Schmidt orthogonalization' });
    const out = ui.readout(host);
    const snap = (v) => Math.round(v * 4) / 4;
    P.handle({ get: () => v1, set: (x, y) => { v1[0] = snap(x); v1[1] = snap(y); update(); }, color: 1 });
    P.handle({ get: () => v2, set: (x, y) => { v2[0] = snap(x); v2[1] = snap(y); update(); }, color: 2 });
    function update() {
      const r11 = Math.hypot(...v1); if (r11 < 1e-9) return;
      const q1 = [v1[0] / r11, v1[1] / r11], r12 = q1[0] * v2[0] + q1[1] * v2[1], w = [v2[0] - r12 * q1[0], v2[1] - r12 * q1[1]], r22 = Math.hypot(...w), q2 = r22 > 1e-9 ? [w[0] / r22, w[1] / r22] : [0, 0];
      P.draw((p) => {
        p.line(0, 0, r12 * q1[0], r12 * q1[1], { color: 'muted', width: 3, alpha: 0.6 });
        p.line(v2[0], v2[1], r12 * q1[0], r12 * q1[1], { color: 'muted', width: 1.5, dash: [4, 4] });
        p.arrow(0, 0, w[0], w[1], { color: 4, width: 2, dash: [5, 4] });
        p.arrow(0, 0, v1[0], v1[1], { color: 1, width: 2.5 }); p.arrow(0, 0, v2[0], v2[1], { color: 2, width: 2.5 });
        p.arrow(0, 0, q1[0], q1[1], { color: 3, width: 4 }); p.arrow(0, 0, q2[0], q2[1], { color: 3, width: 4 });
        p.text('q₁', q1[0], q1[1], { dx: 6, dy: 14, color: 3, weight: 700 }); p.text('q₂', q2[0], q2[1], { dx: -16, dy: -8, color: 3, weight: 700 });
        p.text('a₁', v1[0], v1[1], { dx: 8, dy: -8, color: 1, weight: 700 }); p.text('a₂', v2[0], v2[1], { dx: 8, dy: -8, color: 2, weight: 700 });
      });
      out.set(`$\\mathbf q_1 = \\mathbf a_1/\\|\\mathbf a_1\\|$. Subtract from $\\mathbf a_2$ its shadow on $\\mathbf q_1$ (grey): what's left (pink, dashed) is perpendicular to $\\mathbf q_1$; normalize it to get $\\mathbf q_2$. The bookkeeping gives $A = QR$ with $R = \\begin{pmatrix} ${n3(r11)} & ${n3(r12)} \\\\ 0 & ${n3(r22)}\\end{pmatrix}$. ${r22 < 0.3 ? '**Nearly dependent columns**: $r_{22}$ is tiny, which is where classical Gram–Schmidt loses accuracy.' : 'Drag $\\mathbf a_2$ toward the line of $\\mathbf a_1$ to make the columns nearly dependent.'}`);
    }
    update();
  });

  /* ---- Power iteration ---- */
  AM.widget('power', (host, o, { ui }) => {
    const Mx = { a: 2, b: 1, c: 1, d: 3 }; let k = 3; const x0 = [1, -0.3];
    const P = new Plot(host, { xmin: -1.6, xmax: 1.6, ymin: -1.3, ymax: 1.3, equal: true, aspect: 0.62, xstep: 0.5, label: 'Power iteration on the unit circle' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'k', label: 'Iterations $k$', min: 0, max: 25, step: 1, value: k, fmt: String, onInput: (v) => { k = v; update(); } });
    ui.slider(panel, { id: 'd', label: 'Bottom-right entry $d$ (changes the eigenvalue gap)', min: 1.2, max: 6, step: 0.05, value: Mx.d, onInput: (v) => { Mx.d = v; update(); } });
    const out = ui.readout(host);
    P.handle({ get: () => x0, set: (x, y) => { const r = Math.hypot(x, y) || 1; x0[0] = x / r; x0[1] = y / r; update(); }, color: 4 });
    function update() {
      const { a, b, c, d } = Mx, E = AM.eig2(a, b, c, d), it = [x0.slice()]; let x = x0.slice(), lam = 0;
      for (let i = 0; i < k; i++) { const y = [a * x[0] + b * x[1], c * x[0] + d * x[1]], n = Math.hypot(...y); lam = (x[0] * y[0] + x[1] * y[1]); x = [y[0] / n, y[1] / n]; it.push(x); }
      const v = E.vs[0], err = Math.min(Math.hypot(x[0] - v[0], x[1] - v[1]), Math.hypot(x[0] + v[0], x[1] + v[1]));
      P.draw((p) => {
        p.circle(0, 0, 1, { color: 'axis', width: 1 });
        p.line(-v[0] * 2, -v[1] * 2, v[0] * 2, v[1] * 2, { color: 3, width: 1.5, dash: [6, 4] });
        it.forEach((q, i) => p.arrow(0, 0, q[0], q[1], { color: i === it.length - 1 ? 2 : 1, width: i === it.length - 1 ? 3 : 1.25, alpha: i === it.length - 1 ? 1 : 0.25 + (0.6 * i) / it.length }));
      });
      out.set(`$A = \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${n2(d)}\\end{pmatrix}$ has eigenvalues $${n3(E.ls[0])}$ and $${n3(E.ls[1])}$. Repeatedly multiplying by $A$ and normalizing turns any start vector toward the dominant eigenvector (green). After ${k} steps the error is $${sci(err)}$${k ? ` and the Rayleigh quotient estimates $\\lambda_1 \\approx ${n4(lam)}$` : ''}. Each step shrinks the error by about $|\\lambda_2/\\lambda_1| = ${n3(Math.abs(E.ls[1] / E.ls[0]))}$: a bigger gap means faster convergence.`);
    }
    update();
  });

  /* ---- Random walks ---- */
  AM.widget('randomwalk', (host, o, { ui }) => {
    let N = 100, W = 30, p = 0.5, paths = [];
    const P = new Plot(host, { xmin: 0, xmax: 100, ymin: -30, ymax: 30, aspect: 0.5, xlabel: 'step', label: 'Random walk paths' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'N', label: 'Steps $n$', min: 10, max: 1000, step: 10, value: N, fmt: String, onInput: (v) => { N = v; regen(); } });
    ui.slider(panel, { id: 'p', label: 'Probability of a step up $p$', min: 0.3, max: 0.7, step: 0.01, value: p, onInput: (v) => { p = v; regen(); } });
    ui.button(panel, 'New walks', () => regen());
    const out = ui.readout(host);
    function regen() {
      paths = Array.from({ length: W }, () => { const s = [0]; for (let i = 0; i < N; i++) s.push(s[i] + (Math.random() < p ? 1 : -1)); return s; });
      const mu = N * (2 * p - 1), sd = Math.sqrt(4 * N * p * (1 - p)), span = Math.max(Math.abs(mu) + 3.5 * sd, 10);
      P.setView(0, N, Math.min(-span * 0.3, mu - 3.5 * sd), Math.max(span * 0.3, mu + 3.5 * sd));
      const ends = paths.map((s) => s[N]), mean = ends.reduce((a, b) => a + b, 0) / W, sdE = Math.sqrt(ends.reduce((a, b) => a + (b - mean) ** 2, 0) / (W - 1));
      P.draw((pl) => {
        pl.area((t) => t * (2 * p - 1) + 2 * Math.sqrt(4 * t * p * (1 - p)), 0, N, { base: (t) => t * (2 * p - 1) - 2 * Math.sqrt(4 * t * p * (1 - p)), fill: 3, fillAlpha: 0.12, n: 200 });
        paths.forEach((s, i) => pl.path(s.map((y, t) => [t, y]), { color: (i % 4) + 1, width: 1, alpha: 0.65 }));
        pl.fn((t) => t * (2 * p - 1), { color: 'ink', width: 1.5, dash: [5, 4], from: 0, to: N });
      });
      out.set(`${W} walks of ${N} steps (up with probability ${p}). Theory: mean position $n(2p-1) = ${n2(mu)}$, spread (SD) $2\\sqrt{np(1-p)} = ${n2(sd)}$; these walks ended with mean $${n2(mean)}$ and SD $${n2(sdE)}$. The spread grows like $\\sqrt n$, not $n$ (green band, ±2 SD), which is diffusion. With $p \\ne \\tfrac12$ the drift grows like $n$ and eventually dominates.`);
    }
    regen();
  });

  /* ---- Poisson process ---- */
  AM.widget('poissonproc', (host, o, { ui }) => {
    let lam = 3, T = 40, ev = [];
    const L = new Plot(host, { xmin: 0, xmax: 40, ymin: -0.5, ymax: 1.2, aspect: 0.14, minH: 90, grid: false, ticks: false, label: 'Event times on a timeline' });
    const H = new Plot(host, { xmin: -0.5, xmax: 15.5, ymin: 0, ymax: 0.3, aspect: 0.35, minH: 160, xlabel: 'events per unit time', label: 'Histogram of counts with Poisson probabilities' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'lam', label: 'Rate $\\lambda$ (events per unit time)', min: 0.3, max: 8, step: 0.1, value: lam, onInput: (v) => { lam = v; regen(); } });
    ui.button(panel, 'Simulate again', () => regen());
    const out = ui.readout(host);
    function regen() {
      ev = []; let t = -Math.log(1 - Math.random()) / lam; while (t < T) { ev.push(t); t += -Math.log(1 - Math.random()) / lam; }
      const counts = Array.from({ length: T }, (_, i) => ev.filter((x) => x >= i && x < i + 1).length), maxK = Math.max(15, ...counts) + 1, hist = Array.from({ length: maxK }, (_, k) => counts.filter((c) => c === k).length / T);
      const pmf = (k) => Math.exp(-lam + k * Math.log(lam) - lgf(k));
      L.draw((p) => { for (let i = 0; i <= T; i += 5) p.vline(i, { color: 'grid', dash: [], width: 1 }); p.line(0, 0, T, 0, { color: 'axis', width: 1 }); ev.forEach((x) => p.line(x, 0, x, 1, { color: 1, width: 1.5 })); });
      H.setView(-0.5, maxK - 0.5, 0, Math.max(...hist, pmf(Math.floor(lam))) * 1.2);
      H.draw((p) => { hist.forEach((h, k) => p.rect(k - 0.35, 0, k + 0.35, h, { fill: 1, fillAlpha: 0.5, stroke: false })); for (let k = 0; k < maxK; k++) p.point(k, pmf(k), { color: 2, r: 4 }); });
      const gaps = ev.slice(1).map((x, i) => x - ev[i]), mg = gaps.reduce((a, b) => a + b, 0) / Math.max(1, gaps.length);
      out.set(`${ev.length} events in ${T} time units (expected $\\lambda T = ${n2(lam * T)}$). Blue bars: how often each count per unit interval occurred; orange dots: Poisson probabilities $e^{-\\lambda}\\lambda^k/k!$. Average gap between events: $${n3(mg)}$ vs $1/\\lambda = ${n3(1 / lam)}$: gaps are exponential. Notice the clumps and long empty stretches: pure randomness looks clustered.`);
    }
    function lgf(k) { let s = 0; for (let i = 2; i <= k; i++) s += Math.log(i); return s; }
    regen();
  });

  /* ---- Brownian motion and SDEs (Euler–Maruyama) ---- */
  AM.widget('brownian', (host, o, { ui }) => {
    const s = { model: 'bm', mu: 0.1, sigma: 0.3, theta: 1.5, N: 20 }; let paths = [];
    const P = new Plot(host, { xmin: 0, xmax: 5, ymin: -2, ymax: 3, aspect: 0.5, xlabel: 't', label: 'Simulated stochastic paths' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'model', label: 'Model', options: [['bm', 'Brownian motion with drift'], ['gbm', 'Geometric BM (stock price)'], ['ou', 'Ornstein–Uhlenbeck (mean-reverting)']], value: s.model, onChange: (v) => { s.model = v; regen(); } });
    ui.slider(panel, { id: 'mu', label: 'Drift $\\mu$', min: -0.5, max: 0.5, step: 0.01, value: s.mu, onInput: (v) => { s.mu = v; regen(); } });
    ui.slider(panel, { id: 'sig', label: 'Volatility $\\sigma$', min: 0.05, max: 1, step: 0.01, value: s.sigma, onInput: (v) => { s.sigma = v; regen(); } });
    ui.button(panel, 'New paths', () => regen());
    const out = ui.readout(host);
    function regen() {
      const T = 5, n = 500, h = T / n, f = { bm: (x) => [s.mu, s.sigma], gbm: (x) => [s.mu * x, s.sigma * x], ou: (x) => [s.theta * (s.mu * 4 - x), s.sigma] }[s.model], x0 = s.model === 'gbm' ? 1 : 0;
      paths = Array.from({ length: s.N }, () => { let x = x0; const pts = [[0, x]]; for (let i = 1; i <= n; i++) { const [a, b] = f(x); x += a * h + b * Math.sqrt(h) * M.randn(Math.random); pts.push([i * h, x]); } return pts; });
      const ends = paths.map((q) => q[n][1]), lo = Math.min(...paths.flat().map((q) => q[1])), hi = Math.max(...paths.flat().map((q) => q[1]));
      P.setView(0, T, Math.min(lo, -0.2) - 0.2, hi + 0.2);
      const mean = { bm: (t) => s.mu * t, gbm: (t) => Math.exp(s.mu * t), ou: (t) => s.mu * 4 * (1 - Math.exp(-s.theta * t)) }[s.model];
      P.draw((p) => { paths.forEach((q, i) => p.path(q, { color: (i % 4) + 1, width: 1.1, alpha: 0.7 })); p.fn(mean, { color: 'ink', width: 2.25, dash: [6, 4], from: 0, to: T }); });
      const m = ends.reduce((a, b) => a + b, 0) / ends.length;
      const eq = { bm: `dX = ${n2(s.mu)}\\,dt + ${n2(s.sigma)}\\,dW`, gbm: `dS = ${n2(s.mu)}S\\,dt + ${n2(s.sigma)}S\\,dW`, ou: `dX = ${s.theta}(${n2(s.mu * 4)} - X)\\,dt + ${n2(s.sigma)}\\,dW` }[s.model];
      const note = { bm: 'Spread grows like $\\sigma\\sqrt t$ around the straight drift line.', gbm: 'Prices stay positive and spread multiplicatively; the dashed line is the mean $e^{\\mu t}$. Most paths end *below* the mean because a few huge winners pull it up.', ou: 'Every path is pulled back toward the long-run level, so the spread stops growing: the variance settles at $\\sigma^2/(2\\theta)$. Used for interest rates and velocities.' }[s.model];
      out.set(`$${eq}$, simulated with Euler–Maruyama: $X_{k+1} = X_k + a(X_k)\\Delta t + b(X_k)\\sqrt{\\Delta t}\\,Z_k$ with $Z_k \\sim N(0,1)$. Average endpoint $${n3(m)}$ vs expected $${n3(mean(5))}$. ${note}`);
    }
    regen();
  });

  /* ---- Best approximation in function space (Legendre vs Taylor) ---- */
  AM.widget('approx', (host, o, { ui }) => {
    const F = { exp: [Math.exp, 'e^x', (k) => 1 / M.fact(k)], abs: [Math.abs, '|x|', null], step: [(x) => (x >= 0 ? 1 : 0), '\\text{step}', null], runge: [(x) => 1 / (1 + 25 * x * x), '\\frac{1}{1 + 25x^2}', null], sin: [(x) => Math.sin(3 * x), '\\sin 3x', (k) => (k % 2 ? ((-1) ** ((k - 1) / 2) * 3 ** k) / M.fact(k) : 0)] };
    let key = 'abs', n = 4;
    const P = new Plot(host, { xmin: -1.05, xmax: 1.05, ymin: -0.4, ymax: 1.3, aspect: 0.5, xstep: 0.5, label: 'Function and its best polynomial approximation' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'f', label: 'Function on $[-1, 1]$', options: [['abs', '|x|'], ['exp', 'eˣ'], ['step', 'step'], ['runge', '1/(1 + 25x²)'], ['sin', 'sin 3x']], value: key, onChange: (v) => { key = v; update(); } });
    ui.slider(panel, { id: 'n', label: 'Degree $n$', min: 0, max: 20, step: 1, value: n, fmt: String, onInput: (v) => { n = v; update(); } });
    ui.legend(host, [[2, 'Best $L^2$ approximation (Legendre projection)'], [4, 'Taylor polynomial at 0 (when it exists)']]);
    const out = ui.readout(host);
    const leg = (k, x) => { if (k === 0) return 1; let p0 = 1, p1 = x; for (let j = 1; j < k; j++) { const p2 = ((2 * j + 1) * x * p1 - j * p0) / (j + 1); p0 = p1; p1 = p2; } return p1; };
    function update() {
      const [f, tex, tay] = F[key], c = Array.from({ length: n + 1 }, (_, k) => ((2 * k + 1) / 2) * M.integrate((x) => f(x) * leg(k, x), -1, 1, 2000));
      const proj = (x) => c.reduce((s, ck, k) => s + ck * leg(k, x), 0), taylor = tay ? (x) => { let s = 0; for (let k = 0; k <= n; k++) s += tay(k) * x ** k; return s; } : null;
      const L2 = Math.sqrt(M.integrate((x) => (f(x) - proj(x)) ** 2, -1, 1, 2000)), L2t = taylor ? Math.sqrt(M.integrate((x) => (f(x) - taylor(x)) ** 2, -1, 1, 2000)) : null;
      const vals = Array.from({ length: 101 }, (_, i) => f(-1 + i / 50)); P.setView(-1.05, 1.05, Math.min(...vals) - 0.35, Math.max(...vals) + 0.35);
      P.draw((p) => { p.fn(f, { color: 'ink', width: 2 }); if (taylor) p.fn(taylor, { color: 4, width: 1.75, dash: [5, 4] }); p.fn(proj, { color: 2, width: 2.5 }); });
      out.set(`$f(x) = ${tex}$. The best degree-${n} approximation in the $L^2$ sense is the **orthogonal projection** onto polynomials, computed with Legendre coefficients $c_k = \\frac{2k+1}{2}\\int_{-1}^1 f P_k\\,dx$. Its error $\\|f - p\\|_2 \\approx ${n4(L2)}$${L2t !== null ? ` vs Taylor's $${n4(L2t)}$: Taylor is excellent near 0 but the projection spreads the accuracy across the whole interval` : '. This function has no useful Taylor series at 0, but projection still works'}.`);
    }
    update();
  });

  /* ---- Calculus of variations: shortest time (brachistochrone) ---- */
  AM.widget('variations', (host, o, { ui }) => {
    let c = 0.5;
    const P = new Plot(host, { xmin: -0.1, xmax: PI + 0.1, ymin: -2.3, ymax: 0.3, equal: true, aspect: 0.5, xstep: 0.5, label: 'Candidate slides from A to B' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'c', label: 'Bend of the trial curve $c$', min: -0.5, max: 1.6, step: 0.01, value: c, onInput: (v) => { c = v; update(); } });
    const out = ui.readout(host);
    // endpoints A=(0,0), B=(π,-2); cycloid x = t - sin t, y = -(1 - cos t), t ∈ [0, π] is the exact minimizer.
    const g = 9.81, X = PI, Y = 2;
    const time = (yf, dyf) => M.integrate((x) => Math.sqrt((1 + dyf(x) ** 2) / (2 * g * Math.max(1e-9, -yf(x)))), 1e-6, X, 4000);
    const trial = (x) => -(Y / X) * x - c * Math.sin(x), dtrial = (x) => -Y / X - c * Math.cos(x);
    const tCyc = M.integrate((t) => Math.sqrt(((1 - Math.cos(t)) ** 2 + Math.sin(t) ** 2) / (2 * g * (1 - Math.cos(t)))), 1e-6, PI, 4000);
    function update() {
      const tt = time(trial, dtrial), tline = time((x) => -(Y / X) * x, () => -Y / X);
      P.draw((p) => {
        p.param((t) => t - Math.sin(t), (t) => -(1 - Math.cos(t)), 0, PI, { color: 3, width: 3 });
        p.fn((x) => -(Y / X) * x, { color: 'muted', width: 1.5, dash: [5, 4], from: 0, to: X });
        p.fn(trial, { color: 2, width: 2.5, from: 0, to: X });
        p.point(0, 0, { color: 'ink' }); p.point(X, -Y, { color: 'ink' }); p.text('A', 0, 0, { dx: -14, color: 'ink', weight: 700 }); p.text('B', X, -Y, { dx: 8, color: 'ink', weight: 700 });
      });
      out.set(`A bead slides from A to B under gravity. Travel time $T[y] = \\int_0^{\\pi}\\sqrt{\\frac{1 + y'^2}{2g|y|}}\\,dx$ is a **functional**: a number assigned to each whole curve. Straight line: $${n3(tline)}$ s. Your orange curve: $${n3(tt)}$ s. The green cycloid, which solves the Euler–Lagrange equation, takes $${n3(tCyc)}$ s, and no other curve does better. Steeper at the start means faster sooner.`);
    }
    update();
  });

  /* ---- 1D finite elements for -u'' = f ---- */
  AM.widget('fem', (host, o, { ui }) => {
    const F = { const: [() => 1, (x) => (x * (1 - x)) / 2, '1'], sin: [(x) => PI * PI * Math.sin(PI * x), (x) => Math.sin(PI * x), '\\pi^2\\sin\\pi x'], bump: [(x) => 12 * x * x, (x) => x * (1 - x ** 3), '12x^2'] };
    let key = 'sin', N = 4, showHats = true;
    const P = new Plot(host, { xmin: -0.02, xmax: 1.02, ymin: -0.1, ymax: 1.15, aspect: 0.5, xstep: 0.25, label: 'Finite element solution against the exact solution' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'f', label: 'Load $f(x)$', options: [['sin', 'π² sin πx'], ['const', '1 (uniform)'], ['bump', '12x²']], value: key, onChange: (v) => { key = v; update(); } });
    ui.slider(panel, { id: 'N', label: 'Elements $N$', min: 2, max: 40, step: 1, value: N, fmt: String, onInput: (v) => { N = v; update(); } });
    ui.toggle(panel, { id: 'hats', label: 'Show the hat basis functions', value: showHats, onChange: (v) => { showHats = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const [f, u, ftex] = F[key], h = 1 / N, n = N - 1;
      // stiffness (1/h)tridiag(-1,2,-1); load b_i = ∫ f φ_i (Simpson on each hat)
      const b = Array.from({ length: n }, (_, i) => { const xi = (i + 1) * h; return M.integrate((x) => f(x) * (1 - Math.abs(x - xi) / h), xi - h, xi + h, 40); });
      const a = new Array(n).fill(2 / h), off = -1 / h, cp = [], dp = [];
      for (let i = 0; i < n; i++) { const m = a[i] - (i ? off * cp[i - 1] : 0); cp[i] = off / m; dp[i] = (b[i] - (i ? off * dp[i - 1] : 0)) / m; }
      const U = new Array(n); for (let i = n - 1; i >= 0; i--) U[i] = dp[i] - (i < n - 1 ? cp[i] * U[i + 1] : 0);
      const nodes = [[0, 0], ...U.map((v, i) => [(i + 1) * h, v]), [1, 0]];
      const top = Math.max(...Array.from({ length: 101 }, (_, i) => u(i / 100))) * 1.25;
      P.setView(-0.02, 1.02, -0.08 * top, top);
      P.draw((p) => {
        if (showHats && N <= 20) U.forEach((v, i) => { const xi = (i + 1) * h; p.path([[xi - h, 0], [xi, v], [xi + h, 0]], { color: 1, width: 1, alpha: 0.35 }); });
        p.fn(u, { color: 3, width: 2, dash: [6, 4] });
        p.path(nodes, { color: 2, width: 2.75 });
        nodes.forEach(([x, y]) => p.point(x, y, { color: 2, r: 3.5 }));
      });
      const err = Math.max(...nodes.map(([x, y]) => Math.abs(y - u(x)))), l2 = Math.sqrt(M.integrate((x) => { const i = Math.min(N - 1, Math.floor(x / h)), t = (x - i * h) / h, uh = nodes[i][1] * (1 - t) + nodes[i + 1][1] * t; return (uh - u(x)) ** 2; }, 0, 1, 2000));
      out.set(`Solving $-u'' = ${ftex}$ on $[0,1]$ with $u(0) = u(1) = 0$. The FEM writes $u_h = \\sum U_i\\varphi_i$ with hat functions $\\varphi_i$ (blue), and the weak form $\\int u_h'\\varphi_j' = \\int f\\varphi_j$ gives a tridiagonal system. With ${N} elements: nodal error $${sci(err)}$, overall $L^2$ error $${sci(l2)}$. Doubling $N$ cuts the $L^2$ error about 4×: second-order accuracy.`);
    }
    update();
  });
})();
