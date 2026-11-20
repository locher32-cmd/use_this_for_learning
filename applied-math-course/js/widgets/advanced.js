/* Visuals for Stage 4: Fourier & PDEs, Optimization, Modeling & Dynamical Systems. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, el = AM.el, M = AM.m, n2 = (v) => AM.fmt(v, 2), n3 = (v) => AM.fmt(v, 3), n4 = (v) => AM.fmt(v, 4);
  const PI = Math.PI;

  /* ---- Fourier series ---- */
  AM.widget('fourier', (host, o, { ui }) => {
    const W = {
      square: { f: (x) => (Math.sin(x) >= 0 ? 1 : -1), b: (k) => (k % 2 ? 4 / (PI * k) : 0), a: () => 0, tex: '\\frac4\\pi\\left(\\sin x + \\frac{\\sin 3x}{3} + \\frac{\\sin 5x}{5} + \\cdots\\right)' },
      saw: { f: (x) => { const y = ((x + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI; return y; }, b: (k) => (2 * (-1) ** (k + 1)) / k, a: () => 0, tex: '2\\left(\\sin x - \\frac{\\sin 2x}{2} + \\frac{\\sin 3x}{3} - \\cdots\\right)' },
      tri: { f: (x) => { const y = ((x + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI; return Math.abs(y); }, b: () => 0, a: (k) => (k === 0 ? PI : k % 2 ? -4 / (PI * k * k) : 0), tex: '\\frac\\pi2 - \\frac4\\pi\\left(\\cos x + \\frac{\\cos 3x}{9} + \\frac{\\cos 5x}{25} + \\cdots\\right)' },
    };
    let key = 'square', N = 5;
    const P = new Plot(host, { xmin: -2 * PI, xmax: 2 * PI, ymin: -1.6, ymax: 1.6, aspect: 0.42, xstep: PI / 2, xfmt: (v) => { const k = Math.round(v / (PI / 2)); return { '-4': '−2π', '-2': '−π', 0: '0', 2: 'π', 4: '2π' }[k] || ''; }, label: 'Fourier partial sum' });
    const S = new Plot(host, { xmin: 0, xmax: 21, ymin: 0, ymax: 1.4, aspect: 0.2, minH: 120, xstep: 1, label: 'Amplitude spectrum', xlabel: 'k' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'w', label: 'Wave', options: [['square', 'Square wave'], ['saw', 'Sawtooth'], ['tri', 'Triangle']], value: key, onChange: (v) => { key = v; update(); } });
    ui.slider(panel, { id: 'N', label: 'Harmonics $N$', min: 1, max: 60, step: 1, value: N, fmt: String, onInput: (v) => { N = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const w = W[key], sum = (x) => { let s = w.a(0) / 2; for (let k = 1; k <= N; k++) s += w.a(k) * Math.cos(k * x) + w.b(k) * Math.sin(k * x); return s; };
      const lo = key === 'tri' ? -0.4 : key === 'saw' ? -3.8 : -1.6, hi = key === 'tri' ? 3.6 : key === 'saw' ? 3.8 : 1.6;
      P.setView(-2 * PI, 2 * PI, lo, hi);
      P.draw((p) => { p.fn(w.f, { color: 'muted', width: 1.5, dash: [4, 4] }); p.fn(sum, { color: 1, width: 2.5, n: 1600 }); });
      const amps = Array.from({ length: 20 }, (_, i) => Math.hypot(w.a(i + 1), w.b(i + 1))), mx = Math.max(...amps, 0.01);
      S.setView(0, 21, 0, mx * 1.2);
      S.draw((p) => amps.forEach((a, i) => p.rect(i + 0.65, 0, i + 1.35, a, { fill: i + 1 <= N ? 2 : 'muted', fillAlpha: i + 1 <= N ? 0.8 : 0.25, stroke: false })));
      let err = 0; for (let i = 0; i < 400; i++) { const x = -PI + (2 * PI * (i + 0.5)) / 400; err += (w.f(x) - sum(x)) ** 2; } err = Math.sqrt(err / 400);
      out.set(`$${w.tex}$. Using ${N} harmonic${N > 1 ? 's' : ''}, the RMS error is $${n4(err)}$. ${key === 'tri' ? 'The triangle wave is continuous, so its coefficients fall like $1/k^2$ and the sum converges fast and uniformly.' : 'At each jump the partial sums overshoot by about 9% however large $N$ gets: the **Gibbs phenomenon**. The spectrum (bottom) falls off only like $1/k$.'}`);
    }
    update();
  });

  /* ---- Heat equation by finite differences ---- */
  AM.widget('heat', (host, o, { ui }) => {
    const NX = 80, L = 1; let u = [], t = 0, kappa = 1, bc = 'dirichlet', init = 'spike';
    const P = new Plot(host, { xmin: 0, xmax: 1, ymin: -0.1, ymax: 1.15, aspect: 0.45, xlabel: 'x', ylabel: 'u', label: 'Temperature along a rod' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'init', label: 'Starting temperature', options: [['spike', 'Hot spot in the middle'], ['step', 'Left half hot'], ['sine', 'Pure mode sin(πx)'], ['mix', 'Two modes mixed'], ['rand', 'Rough noise']], value: init, onChange: (v) => { init = v; reset(); } });
    ui.seg(panel, { id: 'bc', label: 'Ends', options: [['dirichlet', 'Held at 0°'], ['neumann', 'Insulated']], value: bc, onChange: (v) => { bc = v; reset(); } });
    ui.slider(panel, { id: 'k', label: 'Diffusivity $\\kappa$', min: 0.2, max: 3, step: 0.1, value: kappa, onInput: (v) => { kappa = v; } });
    const anim = AM.animate(host, (dt) => { step(dt * 0.02); draw(); });
    ui.player(panel, anim, true);
    ui.button(panel, 'Restart', () => reset(), 'btn-ghost');
    const out = ui.readout(host);
    const xs = Array.from({ length: NX + 1 }, (_, i) => (i * L) / NX);
    let u0 = [];
    function reset() {
      t = 0;
      u = xs.map((x) => ({ spike: Math.exp(-((x - 0.5) ** 2) / 0.002), step: x < 0.5 ? 1 : 0, sine: Math.sin(PI * x), mix: 0.6 * Math.sin(PI * x) + 0.4 * Math.sin(5 * PI * x), rand: Math.max(0, Math.min(1, 0.5 + 0.35 * Math.sin(37 * x) * Math.cos(91 * x) + 0.15 * Math.sin(173 * x))) }[init]));
      if (bc === 'dirichlet') { u[0] = 0; u[NX] = 0; }
      u0 = u.slice(); draw();
    }
    function step(T) {
      const dx = L / NX, dtMax = (0.45 * dx * dx) / kappa, n = Math.max(1, Math.ceil(T / dtMax)), dt = T / n, r = (kappa * dt) / (dx * dx);
      for (let s = 0; s < n; s++) {
        const v = u.slice();
        for (let i = 1; i < NX; i++) v[i] = u[i] + r * (u[i + 1] - 2 * u[i] + u[i - 1]);
        if (bc === 'dirichlet') { v[0] = 0; v[NX] = 0; } else { v[0] = v[1]; v[NX] = v[NX - 1]; }
        u = v;
      }
      t += T;
    }
    function draw() {
      const mean = u.reduce((a, b) => a + b, 0) / u.length, mx = Math.max(...u);
      P.draw((p) => {
        p.path(xs.map((x, i) => [x, u0[i]]), { color: 'muted', width: 1.25, dash: [4, 4] });
        p.area((x) => u[Math.round(x * NX)], 0, 1, { fill: 2, fillAlpha: 0.25, n: NX });
        p.path(xs.map((x, i) => [x, u[i]]), { color: 2, width: 2.75 });
      });
      out.set(`$u_t = \\kappa u_{xx}$ at $t = ${n3(t)}$. Peak temperature $${n3(mx)}$, average $${n3(mean)}$. ${bc === 'dirichlet' ? 'With the ends held at 0°, heat leaks out and everything decays to 0. Each mode $\\sin(n\\pi x)$ fades like $e^{-\\kappa n^2\\pi^2t}$, so the wiggly parts vanish first.' : 'With insulated ends no heat escapes, so the average stays fixed and the rod evens out to it.'} Dashed: the starting profile.`);
    }
    reset();
  });

  /* ---- Wave equation: standing modes and a plucked string ---- */
  AM.widget('wave', (host, o, { ui }) => {
    let mode = 'pluck', n = 2, t = 0, c = 1, pos = 0.3;
    const NM = 40, P = new Plot(host, { xmin: 0, xmax: 1, ymin: -1.2, ymax: 1.2, aspect: 0.42, xlabel: 'x', label: 'Vibrating string' });
    const panel = ui.panel(host);
    ui.seg(panel, { id: 'mode', label: 'Start shape', options: [['pluck', 'Plucked'], ['mode', 'Single mode']], value: mode, onChange: (v) => { mode = v; t = 0; } });
    ui.slider(panel, { id: 'n', label: 'Mode number $n$', min: 1, max: 8, step: 1, value: n, fmt: String, onInput: (v) => { n = v; t = 0; } });
    ui.slider(panel, { id: 'pos', label: 'Pluck position', min: 0.05, max: 0.95, step: 0.01, value: pos, onInput: (v) => { pos = v; t = 0; } });
    const anim = AM.animate(host, (dt) => { t += dt * 0.35 * c; draw(); });
    ui.player(panel, anim, true);
    const out = ui.readout(host);
    const bk = (k) => (2 * Math.sin(k * PI * pos)) / (k * k * PI * PI * pos * (1 - pos)); // plucked string coefficients (height 1)
    function draw() {
      const y = mode === 'mode' ? (x) => Math.sin(n * PI * x) * Math.cos(n * PI * t) : (x) => { let s = 0; for (let k = 1; k <= NM; k++) s += bk(k) * Math.sin(k * PI * x) * Math.cos(k * PI * t); return s; };
      P.draw((p) => {
        if (mode === 'mode') { p.fn((x) => Math.sin(n * PI * x), { color: 'muted', width: 1, dash: [3, 4] }); p.fn((x) => -Math.sin(n * PI * x), { color: 'muted', width: 1, dash: [3, 4] }); for (let j = 1; j < n; j++) p.point(j / n, 0, { color: 4, r: 4 }); }
        p.fn(y, { color: 1, width: 3, n: 500 });
        p.point(0, 0, { color: 'ink', r: 4 }); p.point(1, 0, { color: 'ink', r: 4 });
      });
      out.set(mode === 'mode'
        ? `$u(x,t) = \\sin(${n}\\pi x)\\cos(${n}\\pi ct)$: a standing wave with ${n - 1} still points (nodes, pink) that vibrates at frequency $${n}$ times the fundamental. These are the harmonics of a guitar string.`
        : `A string plucked at $x = ${n2(pos)}$ is a sum of standing modes, $u = \\sum b_k\\sin(k\\pi x)\\cos(k\\pi ct)$, with $b_k = \\frac{2\\sin(k\\pi p)}{k^2\\pi^2p(1-p)}$. The kink splits into two pulses that travel in opposite directions and reflect, inverted, off the ends. Plucking at the middle kills every even harmonic.`);
    }
    draw();
  });

  /* ---- Gradient descent on a 2D landscape ---- */
  const LAND = {
    bowl: { f: (x, y) => x * x + 4 * y * y, g: (x, y) => [2 * x, 8 * y], tex: 'x^2 + 4y^2', view: [-3, 3, -2, 2], start: [-2.6, 1.5], min: [0, 0] },
    rosen: { f: (x, y) => (1 - x) ** 2 + 10 * (y - x * x) ** 2, g: (x, y) => [-2 * (1 - x) - 40 * x * (y - x * x), 20 * (y - x * x)], tex: '(1-x)^2 + 10(y - x^2)^2', view: [-2, 2, -1, 3], start: [-1.5, 2.5], min: [1, 1] },
    two: { f: (x, y) => (x * x - 1) ** 2 + 2 * y * y + 0.3 * x, g: (x, y) => [4 * x * (x * x - 1) + 0.3, 4 * y], tex: '(x^2-1)^2 + 2y^2 + 0.3x', view: [-2, 2, -1.5, 1.5], start: [0.2, 1.2], min: null },
  };
  AM.widget('gd', (host, o, { ui }) => {
    let key = 'bowl', lr = 0.1, steps = 30, mom = 0; const start = LAND.bowl.start.slice();
    const P = new Plot(host, { xmin: -3, xmax: 3, ymin: -2, ymax: 2, equal: true, aspect: 0.6, xstep: 1, grid: false, label: 'Gradient descent path on a contour map' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'f', label: 'Landscape', options: [['bowl', 'Stretched bowl'], ['rosen', 'Banana valley (Rosenbrock)'], ['two', 'Two valleys']], value: key, onChange: (v) => { key = v; start.splice(0, 2, ...LAND[v].start); P.setView(...LAND[v].view); update(); } });
    ui.slider(panel, { id: 'lr', label: 'Learning rate $\\eta$', min: 0.005, max: 0.3, step: 0.005, value: lr, onInput: (v) => { lr = v; update(); } });
    ui.slider(panel, { id: 'st', label: 'Steps', min: 1, max: 300, step: 1, value: steps, fmt: String, onInput: (v) => { steps = v; update(); } });
    ui.slider(panel, { id: 'mom', label: 'Momentum $\\beta$', min: 0, max: 0.95, step: 0.05, value: mom, onInput: (v) => { mom = v; update(); } });
    const out = ui.readout(host);
    P.handle({ get: () => start, set: (x, y) => { start[0] = x; start[1] = y; update(); }, color: 4 });
    function update() {
      const L = LAND[key]; let p = start.slice(), v = [0, 0]; const path = [p.slice()]; let diverged = false;
      for (let i = 0; i < steps; i++) { const g = L.g(p[0], p[1]); v = [mom * v[0] - lr * g[0], mom * v[1] - lr * g[1]]; p = [p[0] + v[0], p[1] + v[1]]; if (!isFinite(p[0]) || Math.abs(p[0]) > 1e3) { diverged = true; break; } path.push(p.slice()); }
      let lo = Infinity, hi = -Infinity; for (let x = L.view[0]; x <= L.view[1]; x += 0.1) for (let y = L.view[2]; y <= L.view[3]; y += 0.1) { const z = L.f(x, y); lo = Math.min(lo, z); hi = Math.max(hi, z); }
      P.draw((pl) => {
        pl.heat((x, y) => Math.log(L.f(x, y) - lo + 0.05), { diverging: false, high: pl.color(1), strength: 0.5, cell: 5 });
        pl.contours((x, y) => Math.log(L.f(x, y) - lo + 0.05), Array.from({ length: 14 }, (_, i) => Math.log(0.05) + i * 0.6));
        pl.path(path.map(([x, y]) => [Math.max(-50, Math.min(50, x)), Math.max(-50, Math.min(50, y))]), { color: 2, width: 2 });
        path.forEach(([x, y], i) => { if (i % Math.max(1, Math.floor(path.length / 40)) === 0) pl.point(x, y, { color: 2, r: 2.5 }); });
        if (L.min) pl.text('★', L.min[0], L.min[1], { align: 'center', color: 3, size: 16 });
      });
      const end = path[path.length - 1];
      out.set(`$f(x,y) = ${L.tex}$. Update: $\\mathbf x_{k+1} = \\mathbf x_k - \\eta\\nabla f(\\mathbf x_k)$${mom ? ' plus momentum' : ''}. ${diverged ? '**Diverged**: the step overshoots further every time. Lower the learning rate.' : `After ${path.length - 1} steps: $(${n3(end[0])}, ${n3(end[1])})$ with $f = ${n4(L.f(end[0], end[1]))}$.`} ${key === 'bowl' ? 'The bowl is 4× steeper in $y$: too large a rate makes $y$ zig-zag, too small and $x$ crawls. Above $\\eta = 0.25$ it blows up.' : key === 'rosen' ? 'In the curved valley plain gradient descent creeps; momentum helps it roll along the valley floor.' : 'Which valley you end in depends on where you start: drag the pink point across $x = 0$.'}`);
    }
    P.setView(...LAND[key].view); update();
  });

  /* ---- Lagrange multipliers ---- */
  AM.widget('lagrange', (host, o, { ui }) => {
    const OBJ = {
      lin: { f: (x, y) => x + 2 * y, g: () => [1, 2], tex: 'x + 2y' },
      prod: { f: (x, y) => x * y, g: (x, y) => [y, x], tex: 'xy' },
      quad: { f: (x, y) => x * x + 3 * y * y - x * y, g: (x, y) => [2 * x - y, 6 * y - x], tex: 'x^2 - xy + 3y^2' },
    };
    let key = 'lin', th = 0.3;
    const P = new Plot(host, { xmin: -2.2, xmax: 2.2, ymin: -1.6, ymax: 1.6, equal: true, aspect: 0.62, xstep: 1, grid: false, label: 'Objective contours and a circular constraint' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'f', label: 'Objective $f$', options: [['lin', 'x + 2y'], ['prod', 'xy'], ['quad', 'x² − xy + 3y²']], value: key, onChange: (v) => { key = v; update(); } });
    const out = ui.readout(host);
    P.handle({ get: () => [Math.cos(th), Math.sin(th)], set: (x, y) => { th = Math.atan2(y, x); update(); }, color: 4 });
    function update() {
      const F = OBJ[key], x = Math.cos(th), y = Math.sin(th), gf = F.g(x, y), gg = [2 * x, 2 * y], cross = gf[0] * gg[1] - gf[1] * gg[0], lam = (gf[0] * gg[0] + gf[1] * gg[1]) / (gg[0] ** 2 + gg[1] ** 2);
      let best = [0, -Infinity], worst = [0, Infinity]; for (let i = 0; i < 3600; i++) { const t = (2 * PI * i) / 3600, v = F.f(Math.cos(t), Math.sin(t)); if (v > best[1]) best = [t, v]; if (v < worst[1]) worst = [t, v]; }
      const aligned = Math.abs(cross) / (Math.hypot(...gf) * Math.hypot(...gg) + 1e-12) < 0.03;
      P.draw((p) => {
        p.heat(F.f, { cell: 5, strength: 0.4 });
        p.contours(F.f, Array.from({ length: 21 }, (_, i) => -4 + i * 0.4));
        p.contours(F.f, [F.f(x, y)], { color: 2, width: 2.5, alpha: 1 });
        p.circle(0, 0, 1, { color: 'ink', width: 2.5 });
        p.arrow(x, y, x + gf[0] * 0.35, y + gf[1] * 0.35, { color: 2, width: 2.5 });
        p.arrow(x, y, x + gg[0] * 0.35, y + gg[1] * 0.35, { color: 3, width: 2.5 });
        p.text('★', Math.cos(best[0]), Math.sin(best[0]), { align: 'center', color: 3, size: 15 });
      });
      out.set(`Maximize/minimize $f = ${F.tex}$ on the circle $x^2 + y^2 = 1$. At the pink point $f = ${n3(F.f(x, y))}$; orange is $\\nabla f$, green is $\\nabla g$. ${aligned ? `**The gradients are parallel**: $\\nabla f = \\lambda\\nabla g$ with $\\lambda \\approx ${n3(lam)}$. The orange contour just touches the circle, so this is a constrained extreme point.` : 'Not parallel: sliding along the circle in the direction where $\\nabla f$ leans still changes $f$.'} Max on the circle $\\approx ${n3(best[1])}$ (★), min $\\approx ${n3(worst[1])}$.`);
    }
    update();
  });

  /* ---- Linear programming ---- */
  AM.widget('lp', (host, o, { ui }) => {
    // maximize c1 x + c2 y subject to: x + y ≤ 8, x + 3y ≤ 18, 2x + y ≤ 14, x,y ≥ 0
    const cons = [[1, 1, 8, 'x + y \\le 8'], [1, 3, 18, 'x + 3y \\le 18'], [2, 1, 14, '2x + y \\le 14']];
    let c1 = 3, c2 = 4, level = 0.5;
    const P = new Plot(host, { xmin: -0.5, xmax: 10, ymin: -0.5, ymax: 8, equal: true, aspect: 0.62, xstep: 1, label: 'Feasible region and objective line' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'c1', label: 'Profit per unit of $x$', min: 0, max: 10, step: 0.5, value: c1, onInput: (v) => { c1 = v; update(); } });
    ui.slider(panel, { id: 'c2', label: 'Profit per unit of $y$', min: 0, max: 10, step: 0.5, value: c2, onInput: (v) => { c2 = v; update(); } });
    ui.slider(panel, { id: 'lv', label: 'Slide the profit line', min: 0, max: 1.3, step: 0.01, value: level, fmt: (v) => Math.round(v * 100) + '%', onInput: (v) => { level = v; update(); } });
    const out = ui.readout(host);
    const verts = (() => { const lines = [...cons.map(([a, b, c]) => [a, b, c]), [1, 0, 0], [0, 1, 0]], pts = []; for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) { const [a1, b1, k1] = lines[i], [a2, b2, k2] = lines[j], d = a1 * b2 - a2 * b1; if (Math.abs(d) < 1e-12) continue; const x = (k1 * b2 - k2 * b1) / d, y = (a1 * k2 - a2 * k1) / d; if (x >= -1e-9 && y >= -1e-9 && cons.every(([a, b, c]) => a * x + b * y <= c + 1e-9)) pts.push([x, y]); } const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length; return pts.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx)); })();
    function update() {
      const vals = verts.map(([x, y]) => c1 * x + c2 * y), mx = Math.max(...vals), bi = vals.indexOf(mx), Z = mx * level;
      P.draw((p) => {
        p.poly(verts, { fill: 1, fillAlpha: 0.2, stroke: 1, width: 1.5 });
        cons.forEach(([a, b, c]) => p.fn((x) => (c - a * x) / b, { color: 'muted', width: 1, dash: [4, 4] }));
        if (c2 > 0) p.fn((x) => (Z - c1 * x) / c2, { color: 2, width: 2.5 }); else if (c1 > 0) p.vline(Z / c1, { color: 2, width: 2.5, dash: [] });
        verts.forEach(([x, y], i) => p.point(x, y, { color: i === bi ? 3 : 'ink2', r: i === bi ? 6 : 4 }));
        p.text(`(${n2(verts[bi][0])}, ${n2(verts[bi][1])})`, verts[bi][0], verts[bi][1], { dx: 8, dy: -10, color: 3, weight: 700 });
      });
      out.set(`Maximize $P = ${n2(c1)}x + ${n2(c2)}y$ subject to $${cons.map((c) => c[3]).join(',\\ ')}$, $x, y \\ge 0$. The orange line is $P = ${n2(Z)}$. Slide it up: the last point of the blue region it touches is optimal, and that is always a **corner**. Best corner: $(${n2(verts[bi][0])}, ${n2(verts[bi][1])})$ with $P = ${n2(mx)}$. Corner values: ${verts.map(([x, y], i) => `$${n2(vals[i])}$`).join(', ')}.`);
    }
    update();
  });

  /* ---- Cobweb diagram and bifurcation for the logistic map ---- */
  AM.widget('cobweb', (host, o, { ui }) => {
    let r = 2.8, x0 = 0.2, n = 40;
    const row = el('div', 'viz-row'); host.appendChild(row);
    const C = new Plot(row, { xmin: 0, xmax: 1, ymin: 0, ymax: 1, equal: true, aspect: 0.95, xstep: 0.25, label: 'Cobweb diagram', xlabel: 'xₙ', ylabel: 'xₙ₊₁' });
    const B = new Plot(row, { xmin: 2.5, xmax: 4, ymin: 0, ymax: 1, aspect: 0.95, xstep: 0.5, ystep: 0.25, label: 'Bifurcation diagram', xlabel: 'r' });
    const panel = ui.panel(host);
    const rs = ui.slider(panel, { id: 'r', label: 'Growth parameter $r$', min: 2.5, max: 4, step: 0.001, value: r, fmt: (v) => AM.fmt(v, 3), onInput: (v) => { r = v; update(); } });
    ui.slider(panel, { id: 'x0', label: 'Start $x_0$', min: 0.01, max: 0.99, step: 0.01, value: x0, onInput: (v) => { x0 = v; update(); } });
    ui.slider(panel, { id: 'n', label: 'Iterations', min: 5, max: 200, step: 1, value: n, fmt: String, onInput: (v) => { n = v; update(); } });
    const out = ui.readout(host);
    B.onClick = (x) => { r = Math.max(2.5, Math.min(4, x)); rs.set(r); update(); };
    let bif = null;
    function bifurcation(p) { if (!bif) { bif = []; for (let i = 0; i <= 600; i++) { const rr = 2.5 + (1.5 * i) / 600; let x = 0.5; for (let k = 0; k < 300; k++) x = rr * x * (1 - x); for (let k = 0; k < 80; k++) { x = rr * x * (1 - x); bif.push([rr, x]); } } } bif.forEach(([a, b]) => p.point(a, b, { color: 1, r: 0.7 })); }
    function update() {
      const f = (x) => r * x * (1 - x), orbit = [x0]; let x = x0; for (let i = 0; i < n; i++) { x = f(x); orbit.push(x); }
      C.draw((p) => {
        p.line(0, 0, 1, 1, { color: 'muted', width: 1.25 }); p.fn(f, { color: 1, width: 2.5, from: 0, to: 1 });
        const web = [[x0, 0]]; for (let i = 0; i < n; i++) { web.push([orbit[i], orbit[i + 1]]); web.push([orbit[i + 1], orbit[i + 1]]); }
        p.path(web, { color: 2, width: 1.25, alpha: 0.85 }); p.point(x0, 0, { color: 4 });
      });
      B.draw((p) => { bifurcation(p); p.vline(r, { color: 2, width: 1.5, dash: [] }); });
      const tail = orbit.slice(-16).map((v) => Math.round(v * 1e4) / 1e4), uniq = [...new Set(tail)].length;
      const desc = r < 3 ? `the orbit settles on the fixed point $x^* = 1 - 1/r = ${n4(1 - 1 / r)}$` : uniq <= 8 ? `the orbit settles into a cycle of period ${uniq}` : 'the orbit never settles: **chaos**. Nearby starting points separate exponentially fast';
      out.set(`$x_{n+1} = r\\,x_n(1 - x_n)$ with $r = ${AM.fmt(r, 3)}$: ${desc}. The bifurcation diagram (right, click to choose $r$) shows the long-run values for every $r$: one value, then 2, 4, 8, … (period doubling at $r = 3, 3.449, 3.544, \\dots$) and chaos beyond $r \\approx 3.57$, with windows of order such as period 3 near $r = 3.83$.`);
    }
    update();
  });

  /* ---- SIR epidemic ---- */
  AM.widget('sir', (host, o, { ui }) => {
    const s = { beta: 0.3, gamma: 0.1, i0: 0.001, vacc: 0 };
    const P = new Plot(host, { xmin: 0, xmax: 160, ymin: 0, ymax: 1.02, aspect: 0.5, xlabel: 'days', ystep: 0.25, label: 'SIR epidemic curves' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'b', label: 'Transmission rate $\\beta$ per day', min: 0.05, max: 1, step: 0.01, value: s.beta, onInput: (v) => { s.beta = v; update(); } });
    ui.slider(panel, { id: 'g', label: 'Recovery rate $\\gamma$ per day', min: 0.03, max: 0.5, step: 0.01, value: s.gamma, onInput: (v) => { s.gamma = v; update(); } });
    ui.slider(panel, { id: 'v', label: 'Vaccinated at start', min: 0, max: 0.95, step: 0.01, value: s.vacc, fmt: (v) => Math.round(v * 100) + '%', onInput: (v) => { s.vacc = v; update(); } });
    ui.legend(host, [[1, 'Susceptible $S$'], [4, 'Infected $I$'], [3, 'Recovered $R$']]);
    const out = ui.readout(host);
    function update() {
      const f = (t, y) => [-s.beta * y[0] * y[1], s.beta * y[0] * y[1] - s.gamma * y[1], s.gamma * y[1]];
      const sol = M.solve(f, [1 - s.i0 - s.vacc, s.i0, s.vacc], 0, 160, 1600);
      const R0 = s.beta / s.gamma, peak = sol.reduce((b, [t, y]) => (y[1] > b[1] ? [t, y[1]] : b), [0, 0]), fin = sol[sol.length - 1][1];
      P.draw((p) => {
        p.path(sol.map(([t, y]) => [t, y[0]]), { color: 1, width: 2.5 }); p.path(sol.map(([t, y]) => [t, y[1]]), { color: 4, width: 3 }); p.path(sol.map(([t, y]) => [t, y[2]]), { color: 3, width: 2.5 });
        if (R0 > 1) p.hline(1 / R0, { color: 'muted' });
        p.point(peak[0], peak[1], { color: 4 });
      });
      const effR = R0 * (1 - s.vacc - s.i0);
      out.set(`$R_0 = \\beta/\\gamma = ${n2(R0)}$; with ${Math.round(s.vacc * 100)}% vaccinated, the effective number is $${n2(effR)}$. ${effR > 1 ? `The outbreak peaks on day ${Math.round(peak[0])} with ${n2(peak[1] * 100)}% infected at once, and ${n2((fin[2] - s.vacc) * 100)}% are eventually infected. Infections peak exactly when $S$ drops to $1/R_0$ (grey line).` : '**No outbreak**: each case infects fewer than one other, so the infection dies out. Herd immunity needs a vaccinated fraction of at least $1 - 1/R_0$' + (R0 > 1 ? ` $= ${n2((1 - 1 / R0) * 100)}\\%$` : '') + '.'}`);
    }
    update();
  });

  /* ---- Markov chain: weather ---- */
  AM.widget('markov', (host, o, { ui }) => {
    const names = ['Sunny', 'Cloudy', 'Rainy'];
    let T = [[0.7, 0.2, 0.1], [0.3, 0.4, 0.3], [0.2, 0.4, 0.4]], start = 0, steps = 6;
    const row = el('div', 'viz-row'); host.appendChild(row);
    const G = new Plot(row, { xmin: -1.6, xmax: 1.6, ymin: -1.4, ymax: 1.5, equal: true, grid: false, axes: false, aspect: 0.8, label: 'State diagram' });
    const D = new Plot(row, { xmin: -0.5, xmax: 20.5, ymin: 0, ymax: 1, aspect: 0.8, xlabel: 'day', ystep: 0.25, label: 'Probability of each state over time' });
    const panel = ui.panel(host);
    ui.seg(panel, { id: 'st', label: 'Today is', options: names.map((n, i) => [i, n]), value: start, onChange: (v) => { start = +v; update(); } });
    ui.slider(panel, { id: 'ss', label: 'Sunny → Sunny', min: 0.05, max: 0.95, step: 0.05, value: T[0][0], onInput: (v) => { const rest = 1 - v, tot = T[0][1] + T[0][2]; T[0] = [v, (rest * T[0][1]) / tot, (rest * T[0][2]) / tot]; update(); } });
    ui.slider(panel, { id: 'rr', label: 'Rainy → Rainy', min: 0.05, max: 0.95, step: 0.05, value: T[2][2], onInput: (v) => { const rest = 1 - v, tot = T[2][0] + T[2][1]; T[2] = [(rest * T[2][0]) / tot, (rest * T[2][1]) / tot, v]; update(); } });
    ui.slider(panel, { id: 'k', label: 'Days ahead', min: 0, max: 20, step: 1, value: steps, fmt: String, onInput: (v) => { steps = v; update(); } });
    const out = ui.readout(host);
    const pos = [[0, 1.05], [-1.15, -0.8], [1.15, -0.8]];
    function update() {
      const hist = []; let p = [0, 0, 0]; p[start] = 1; hist.push(p);
      for (let k = 0; k < 20; k++) { p = [0, 1, 2].map((j) => p.reduce((s, pi, i) => s + pi * T[i][j], 0)); hist.push(p); }
      let pi = [1 / 3, 1 / 3, 1 / 3]; for (let k = 0; k < 500; k++) pi = [0, 1, 2].map((j) => pi.reduce((s, q, i) => s + q * T[i][j], 0));
      G.draw((g) => {
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
          if (i === j) { g.circle(pos[i][0] + (i === 0 ? 0 : i === 1 ? -0.3 : 0.3), pos[i][1] + (i === 0 ? 0.3 : -0.25), 0.18, { color: 'ink2', width: 1 + 4 * T[i][j] }); continue; }
          const [x1, y1] = pos[i], [x2, y2] = pos[j], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L * 0.08, ny = dx / L * 0.08;
          g.arrow(x1 + dx * 0.2 + nx, y1 + dy * 0.2 + ny, x2 - dx * 0.2 + nx, y2 - dy * 0.2 + ny, { color: 'ink2', width: 0.8 + 5 * T[i][j], alpha: 0.75, head: 8 });
          g.text(n2(T[i][j]), (x1 + x2) / 2 + nx * 3, (y1 + y2) / 2 + ny * 3, { align: 'center', color: 'ink2', size: 11 });
        }
        pos.forEach(([x, y], i) => { g.circle(x, y, 0.3, { color: i + 1, width: 2.5, fill: i + 1, fillAlpha: 0.15 + 0.6 * hist[steps][i] }); g.text(names[i], x, y, { align: 'center', color: 'ink', weight: 700, size: 12 }); });
      });
      D.draw((g) => { [0, 1, 2].forEach((i) => { g.path(hist.map((q, k) => [k, q[i]]), { color: i + 1, width: 2.5 }); g.hline(pi[i], { color: i + 1, alpha: 0.5 }); }); g.vline(steps, { color: 'muted' }); });
      out.set(`Starting ${names[start].toLowerCase()}, in ${steps} day${steps === 1 ? '' : 's'}: $P = (${hist[steps].map(n3).join(', ')})$ for (sunny, cloudy, rainy). This is $\\mathbf p_0 P^{${steps}}$. Whatever today's weather, the forecast converges to the **stationary distribution** $\\boldsymbol\\pi = (${pi.map(n3).join(', ')})$, solving $\\boldsymbol\\pi P = \\boldsymbol\\pi$ (dotted lines).`);
    }
    update();
  });
})();
