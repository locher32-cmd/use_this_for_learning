/* Visuals for Differential Equations. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, el = AM.el, M = AM.m, n2 = (v) => AM.fmt(v, 2), n3 = (v) => AM.fmt(v, 3);

  /* trace a solution of y' = f(x, y) forwards and backwards through (x0, y0) */
  function traceSol(f, x0, y0, v, h = 0.02) {
    const g = (t, y) => [f(t, y[0])], pts = [[x0, y0]];
    for (const dir of [1, -1]) {
      let x = x0, y = [y0]; const seg = [];
      for (let i = 0; i < 3000; i++) {
        y = M.rk4Step(g, x, y, dir * h); x += dir * h;
        if (!isFinite(y[0]) || x < v.xmin - 0.5 || x > v.xmax + 0.5 || Math.abs(y[0]) > 1e3) break;
        seg.push([x, y[0]]);
      }
      if (dir === 1) pts.push(...seg); else pts.unshift(...seg.reverse());
    }
    return pts;
  }

  /* ---- Slope fields ---- */
  AM.widget('slopefield', (host, o, { ui }) => {
    const EQ = {
      cool: [(t, y) => -0.5 * (y - 2), "y' = -\\tfrac12(y - 2)", 'Every solution approaches the equilibrium $y = 2$ (Newton cooling toward a 2° room).', [[0, 5], [0, -1], [0, 3]]],
      grow: [(t, y) => 0.5 * y, "y' = \\tfrac12 y", 'Solutions are $y = Ce^{t/2}$: they run away from the unstable equilibrium $y = 0$.', [[0, 0.5], [0, -0.5], [0, 1.5]]],
      logi: [(t, y) => y * (3 - y) / 2, "y' = \\tfrac12 y(3 - y)", 'Two equilibria: $y = 0$ (unstable) and $y = 3$ (stable). Positive solutions climb in an S-curve toward 3.', [[-3, 0.1], [0, 4.5], [-1, 1]]],
      lin: [(t, y) => t - y, "y' = t - y", 'Solutions $y = t - 1 + Ce^{-t}$ all merge onto the line $y = t - 1$.', [[-3, 3], [-3, -2], [0, 0]]],
      sin: [(t, y) => Math.sin(t) - 0.6 * y, "y' = \\sin t - 0.6y", 'A forced, damped system: every solution settles into the same periodic wiggle.', [[-3, 3], [-3, -3], [0, 0]]],
      sq: [(t, y) => y * y - t, "y' = y^2 - t", 'No formula exists for these solutions, but the slope field still shows them. Some solutions blow up; others fall into a funnel.', [[-3, -1], [-3, 0.5], [-3, 1.5]]],
    };
    let key = 'cool', seeds = EQ[key][3].slice();
    const P = new Plot(host, { xmin: -4, xmax: 6, ymin: -3, ymax: 5, aspect: 0.62, xlabel: 't', ylabel: 'y', label: 'Slope field with solution curves' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'eq', label: 'Equation', options: [['cool', "y′ = −(y − 2)/2 (cooling)"], ['grow', "y′ = y/2 (growth)"], ['logi', "y′ = y(3 − y)/2 (logistic)"], ['lin', "y′ = t − y"], ['sin', "y′ = sin t − 0.6y"], ['sq', "y′ = y² − t"]], value: key, onChange: (v) => { key = v; seeds = EQ[key][3].slice(); update(); } });
    ui.button(panel, 'Clear curves', () => { seeds = []; update(); });
    const out = ui.readout(host);
    P.onClick = (x, y) => { seeds.push([x, y]); if (seeds.length > 12) seeds.shift(); update(); };
    function update() {
      const [f, tex, note] = EQ[key];
      P.draw((p) => {
        const sx = (p.v.xmax - p.v.xmin) / 26, sy = sx * (p.ppu / p.ppuY), Lpx = sx * p.ppu * 0.38;
        for (let x = p.v.xmin + sx / 2; x < p.v.xmax; x += sx) for (let y = p.v.ymin + sy / 2; y < p.v.ymax; y += sy) {
          const m = f(x, y); if (!isFinite(m)) continue;
          const dxw = Lpx / Math.hypot(p.ppu, m * p.ppuY), dyw = m * dxw; // same on-screen length for every segment
          p.line(x - dxw, y - dyw, x + dxw, y + dyw, { color: 'muted', width: 1.2, alpha: 0.75 });
        }
        seeds.forEach(([x0, y0], i) => { p.path(traceSol(f, x0, y0, p.v), { color: (i % 4) + 1, width: 2.5 }); p.point(x0, y0, { color: (i % 4) + 1, r: 4 }); });
      });
      out.set(`$${tex}$. ${note} Click anywhere on the field to start a new solution there.`);
    }
    update();
  });

  /* ---- Logistic vs exponential growth ---- */
  AM.widget('logistic', (host, o, { ui }) => {
    const s = { r: 0.6, K: 100, P0: 5 };
    const P = new Plot(host, { xmin: -0.5, xmax: 20, ymin: -5, ymax: 130, xlabel: 't', ylabel: 'P', label: 'Logistic and exponential growth' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'r', label: 'Growth rate $r$', min: 0.1, max: 1.5, step: 0.05, value: s.r, onInput: (v) => { s.r = v; update(); } });
    ui.slider(panel, { id: 'K', label: 'Carrying capacity $K$', min: 20, max: 120, step: 1, value: s.K, onInput: (v) => { s.K = v; update(); } });
    ui.slider(panel, { id: 'P0', label: 'Starting size $P_0$', min: 1, max: 125, step: 1, value: s.P0, onInput: (v) => { s.P0 = v; update(); } });
    ui.legend(host, [[1, 'Logistic $P\' = rP(1 - P/K)$'], [2, 'Exponential $P\' = rP$']]);
    const out = ui.readout(host);
    function update() {
      const { r, K, P0 } = s, A = (K - P0) / P0, L = (t) => K / (1 + A * Math.exp(-r * t)), tStar = A > 0 ? Math.log(A) / r : null;
      P.draw((p) => {
        p.hline(K, { color: 3, dash: [6, 4], width: 1.5 }); p.text('K', 0, K, { dy: -10, color: 3, weight: 700 });
        p.hline(K / 2, { color: 'muted', dash: [2, 4], width: 1 });
        p.fn((t) => P0 * Math.exp(r * t), { color: 2, width: 2, dash: [6, 4], from: 0 });
        p.fn(L, { color: 1, width: 3, from: 0 });
        if (tStar && tStar > 0 && tStar < 20) p.point(tStar, K / 2, { color: 4, r: 5 });
      });
      out.set(`$P(t) = \\dfrac{${n2(K)}}{1 + ${n2(A)}e^{-${n2(r)}t}}$. ${P0 < K ? `Growth is nearly exponential at first, then slows. It is fastest at $P = K/2$${tStar && tStar > 0 ? `, reached at $t = \\frac{\\ln A}{r} \\approx ${n2(tStar)}$ (pink point)` : ''}.` : P0 > K ? 'Starting above $K$, the population declines toward the carrying capacity.' : 'Starting exactly at $K$: an equilibrium, so nothing changes.'} The exponential model (dashed) never feels the limit.`);
    }
    update();
  });

  /* ---- Damped, driven spring ---- */
  AM.widget('spring', (host, o, { ui }) => {
    const s = { c: 0.5, k: 4, F: 0, w: 2, x0: 1.5 }; let traj = [], T = 0; const Tmax = 30;
    const row = el('div', 'viz-row'); host.appendChild(row);
    const S = new Plot(row, { xmin: -1.6, xmax: 1.6, ymin: -3.6, ymax: 3.4, equal: true, grid: false, axes: false, aspect: 1.1, label: 'Mass on a spring' });
    const X = new Plot(row, { xmin: -0.5, xmax: Tmax, ymin: -3, ymax: 3, aspect: 1.1, xlabel: 't', ylabel: 'x', label: 'Displacement over time' });
    row.style.gridTemplateColumns = 'minmax(0, 1fr) minmax(0, 2.2fr)';
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'c', label: 'Damping $c$', min: 0, max: 6, step: 0.05, value: s.c, onInput: (v) => { s.c = v; solve(); } });
    ui.slider(panel, { id: 'k', label: 'Stiffness $k$', min: 0.5, max: 9, step: 0.1, value: s.k, onInput: (v) => { s.k = v; solve(); } });
    ui.slider(panel, { id: 'F', label: 'Forcing $F_0$', min: 0, max: 2, step: 0.05, value: s.F, onInput: (v) => { s.F = v; solve(); } });
    ui.slider(panel, { id: 'w', label: 'Forcing frequency $\\omega$', min: 0.2, max: 5, step: 0.05, value: s.w, onInput: (v) => { s.w = v; solve(); } });
    const anim = AM.animate(host, (dt) => { T = (T + dt * 2.5) % Tmax; draw(); });
    ui.player(panel, anim, true);
    const out = ui.readout(host);
    function solve() {
      const f = (t, y) => [y[1], -s.c * y[1] - s.k * y[0] + s.F * Math.cos(s.w * t)];
      traj = M.solve(f, [s.x0, 0], 0, Tmax, 1500);
      const mx = Math.max(2, ...traj.map(([, y]) => Math.abs(y[0]))) * 1.1;
      X.setView(-0.5, Tmax, -mx, mx);
      draw(); describe();
    }
    function at(t) { const i = Math.min(traj.length - 1, Math.round((t / Tmax) * (traj.length - 1))); return traj[i][1][0]; }
    function draw() {
      const x = at(T), mx = X.v.ymax, yb = -(x / mx) * 2.2 - 0.2;
      S.draw((p) => {
        p.line(-1.2, 3.1, 1.2, 3.1, { color: 'ink2', width: 3 });
        const n = 14, top = 3.1, bot = yb + 0.45, pts = [[0, top]];
        for (let i = 1; i < n; i++) pts.push([(i % 2 ? 0.35 : -0.35), top - ((top - bot) * i) / n]);
        pts.push([0, bot]);
        p.path(pts, { color: 'ink2', width: 2 });
        p.rect(-0.55, yb - 0.45, 0.55, yb + 0.45, { fill: 1, fillAlpha: 0.85, stroke: 1 });
        p.line(-1.4, -0.2, -0.75, -0.2, { color: 3, width: 1.5, dash: [3, 3] });
      });
      X.draw((p) => {
        if (s.c > 0) { const a = s.c / 2; p.fn((t) => s.x0 * Math.exp(-a * t), { color: 'muted', width: 1, dash: [3, 4], from: 0 }); p.fn((t) => -s.x0 * Math.exp(-a * t), { color: 'muted', width: 1, dash: [3, 4], from: 0 }); }
        p.path(traj.map(([t, y]) => [t, y[0]]), { color: 1, width: 2.25 });
        p.vline(T, { color: 2 }); p.point(T, x, { color: 2 });
      });
    }
    function describe() {
      const w0 = Math.sqrt(s.k), z = s.c / (2 * w0), disc = s.c * s.c - 4 * s.k;
      const kind = s.c === 0 ? 'undamped: it oscillates forever' : z < 1 ? `underdamped ($\\zeta = ${n2(z)} < 1$): it oscillates while the amplitude decays like $e^{-${n2(s.c / 2)}t}$` : Math.abs(z - 1) < 0.02 ? 'critically damped ($\\zeta \\approx 1$): the fastest return without overshoot' : `overdamped ($\\zeta = ${n2(z)} > 1$): it creeps back without oscillating`;
      const res = s.F > 0 ? ` Steady forced amplitude $\\approx ${n3(s.F / Math.sqrt((s.k - s.w * s.w) ** 2 + (s.c * s.w) ** 2))}$${Math.abs(s.w - w0) < 0.25 && z < 0.3 ? ' (near resonance, because $\\omega \\approx \\omega_0$)' : ''}.` : '';
      out.set(`$x'' + ${n2(s.c)}x' + ${n2(s.k)}x = ${s.F ? `${n2(s.F)}\\cos(${n2(s.w)}t)` : '0'}$. Natural frequency $\\omega_0 = \\sqrt{k} = ${n2(w0)}$. Characteristic roots ${disc < 0 ? `$${n2(-s.c / 2)} \\pm ${n2(Math.sqrt(-disc) / 2)}i$` : `$${n2((-s.c + Math.sqrt(disc)) / 2)}$ and $${n2((-s.c - Math.sqrt(disc)) / 2)}$`}, so the spring is ${kind}.${res}`);
    }
    solve();
  });

  /* ---- Phase portraits ---- */
  AM.widget('phase', (host, o, { ui }) => {
    const SYS = {
      spiral: { lin: [-0.5, 2, -2, -0.5], name: 'Stable spiral' }, saddle: { lin: [1, 0.5, 1, -1], name: 'Saddle' }, snode: { lin: [-2, 0.5, 0.3, -1], name: 'Stable node' },
      unode: { lin: [1.5, 0.3, 0.2, 0.8], name: 'Unstable node' }, center: { lin: [0, 1.5, -1.5, 0], name: 'Centre' }, uspiral: { lin: [0.3, -1.5, 1.5, 0.3], name: 'Unstable spiral' },
      pp: { f: (x, y) => [x * (1 - 0.5 * y), y * (-0.75 + 0.25 * x)], view: [-0.3, 9, -0.3, 6], name: 'Predator–prey', seeds: [[3, 1], [5, 2], [2, 3], [3, 4.5]], tex: "\\text{rabbits } x' = x(1 - 0.5y),\\ \\text{foxes } y' = y(-0.75 + 0.25x)", note: 'Equilibrium at $(3, 2)$. Populations cycle around it forever: each loop is a boom-and-bust cycle.' },
      pend: { f: (x, y) => [y, -Math.sin(x) - 0.25 * y], view: [-7, 7, -3.2, 3.2], name: 'Damped pendulum', seeds: [[0.5, 2.5], [-6, 3], [2, 0], [-6.5, 2.3]], tex: "\\theta' = \\omega,\\ \\omega' = -\\sin\\theta - 0.25\\omega", note: 'Stable spirals at $\\theta = 0, \\pm2\\pi$ (hanging down) and saddles at $\\pm\\pi$ (balanced upright). A big push carries the pendulum over the top before it settles.' },
    };
    let key = 'spiral', M2 = { a: -0.5, b: 2, c: -2, d: -0.5 }, seeds = [];
    const P = new Plot(host, { xmin: -4, xmax: 4, ymin: -3, ymax: 3, equal: true, aspect: 0.62, xstep: 1, label: 'Phase portrait' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'sys', label: 'System', options: Object.entries(SYS).map(([k, v]) => [k, v.name]), value: key, onChange: (v) => { key = v; const S = SYS[v]; if (S.lin) { [M2.a, M2.b, M2.c, M2.d] = S.lin; ['a', 'b', 'c', 'd'].forEach((k) => sl[k].set(M2[k])); } setup(); } });
    const sl = {}; const sp = el('div', 'viz-controls'); sp.style.borderTop = '0'; sp.style.paddingTop = '0'; host.appendChild(sp);
    [['a', '$a$'], ['b', '$b$'], ['c', '$c$'], ['d', '$d$']].forEach(([k, lab]) => { sl[k] = ui.slider(sp, { id: 'm' + k, label: `Matrix entry ${lab}`, min: -3, max: 3, step: 0.1, value: M2[k], onInput: (v) => { M2[k] = v; update(); } }); });
    ui.button(panel, 'Clear trajectories', () => { seeds = []; update(); });
    const out = ui.readout(host);
    P.onClick = (x, y) => { seeds.push([x, y]); if (seeds.length > 14) seeds.shift(); update(); };
    const F = () => (SYS[key].f ? SYS[key].f : (x, y) => [M2.a * x + M2.b * y, M2.c * x + M2.d * y]);
    function setup() {
      const S = SYS[key]; sp.hidden = !S.lin;
      if (S.f) { P.setView(...S.view); seeds = S.seeds.slice(); } else { P.setView(-4, 4, -3, 3); seeds = [[3, 2], [-3, -2], [2, -2.5], [-2, 2.5], [0.5, 0.3], [-3.5, 0.5]]; }
      update();
    }
    function update() {
      const f = F(), g = (t, y) => f(y[0], y[1]);
      P.draw((p) => {
        p.field(f, { n: 19, color: 'muted', alpha: 0.6 });
        if (SYS[key].lin) { const E = AM.eig2(M2.a, M2.b, M2.c, M2.d); if (!E.complex) E.vs.forEach((v) => p.line(-v[0] * 9, -v[1] * 9, v[0] * 9, v[1] * 9, { color: 3, width: 1.5, alpha: 0.7, dash: [6, 4] })); }
        seeds.forEach(([x0, y0], i) => {
          const fw = M.solve(g, [x0, y0], 0, 25, 1500).map(([, y]) => y).filter(([x, y]) => Math.abs(x) < 50 && Math.abs(y) < 50);
          p.path(fw, { color: (i % 4) + 1, width: 2.25 });
          const k = Math.min(fw.length - 1, 25); if (k > 1) p.arrow(fw[k - 1][0], fw[k - 1][1], fw[k][0], fw[k][1], { color: (i % 4) + 1, width: 2, head: 9 });
          p.point(x0, y0, { color: (i % 4) + 1, r: 3.5 });
        });
      });
      const S = SYS[key];
      if (S.f) { out.set(`$${S.tex}$. ${S.note} Click to start more trajectories.`); return; }
      const T = M2.a + M2.d, D = M2.a * M2.d - M2.b * M2.c, E = AM.eig2(M2.a, M2.b, M2.c, M2.d);
      let kind;
      if (Math.abs(D) < 1e-9) kind = 'degenerate (a line of equilibria)';
      else if (D < 0) kind = '**saddle** (unstable)';
      else if (E.complex) kind = Math.abs(T) < 1e-9 ? '**centre**: closed orbits' : T < 0 ? '**stable spiral**' : '**unstable spiral**';
      else kind = T < 0 ? '**stable node**' : '**unstable node**';
      out.set(`$\\mathbf x' = \\begin{pmatrix} ${n2(M2.a)} & ${n2(M2.b)} \\\\ ${n2(M2.c)} & ${n2(M2.d)} \\end{pmatrix}\\mathbf x$. Trace $${n2(T)}$, determinant $${n2(D)}$, eigenvalues ${E.complex ? `$${n2(E.re)} \\pm ${n2(E.im)}i$` : `$${n3(E.ls[0])}, ${n3(E.ls[1])}$`}: a ${kind}. Click to add trajectories.`);
    }
    setup();
  });
})();
