/* Visuals for Linear Algebra. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, n2 = (v) => AM.fmt(v, 2), n3 = (v) => AM.fmt(v, 3);
  const snap = (v, s = 0.5) => Math.round(v / s) * s;
  const mtex = (a, b, c, d) => `\\begin{pmatrix} ${n2(a)} & ${n2(b)} \\\\ ${n2(c)} & ${n2(d)} \\end{pmatrix}`;

  /* 2×2 eigen-decomposition: real eigenvalues/vectors or complex pair */
  function eig2(a, b, c, d) {
    const T = a + d, D = a * d - b * c, disc = (T * T) / 4 - D;
    if (disc < -1e-12) return { complex: true, re: T / 2, im: Math.sqrt(-disc) };
    const s = Math.sqrt(Math.max(0, disc)), ls = [T / 2 + s, T / 2 - s];
    const vec = (l) => {
      let v = Math.abs(b) > 1e-9 ? [b, l - a] : Math.abs(c) > 1e-9 ? [l - d, c] : Math.abs(a - l) < 1e-9 ? [1, 0] : [0, 1];
      const n = Math.hypot(v[0], v[1]); return [v[0] / n, v[1] / n];
    };
    return { complex: false, ls, vs: ls.map(vec) };
  }
  AM.eig2 = eig2;

  /* Matrix sliders + presets shared by several visuals */
  function matrixPanel(ui, panel, M, presets, onChange) {
    const sl = {};
    if (presets) ui.select(panel, { id: 'preset', label: 'Preset', options: presets.map((p, i) => [String(i), p[0]]), value: '0', onChange: (v) => { const p = presets[+v][1]; ['a', 'b', 'c', 'd'].forEach((k, i) => { M[k] = p[i]; sl[k].set(p[i]); }); onChange(); } });
    [['a', 'Top-left $a$'], ['b', 'Top-right $b$'], ['c', 'Bottom-left $c$'], ['d', 'Bottom-right $d$']].forEach(([k, lab]) => {
      sl[k] = ui.slider(panel, { id: 'm' + k, label: lab, min: -3, max: 3, step: 0.1, value: M[k], onInput: (v) => { M[k] = v; onChange(); } });
    });
    return sl;
  }

  /* ---- Vectors: sum, dot product, projection ---- */
  AM.widget('vectors', (host, o, { ui }) => {
    const u = [3, 1], v = [1, 2.5]; let mode = 'dot';
    const P = new Plot(host, { xmin: -4.5, xmax: 5.5, ymin: -3.5, ymax: 4.5, equal: true, xstep: 1, label: 'Two draggable vectors' });
    const panel = ui.panel(host);
    ui.seg(panel, { id: 'mode', label: 'Show', options: [['dot', 'Dot product & projection'], ['sum', 'Sum $\\mathbf u + \\mathbf v$']], value: mode, onChange: (m) => { mode = m; update(); } });
    const out = ui.readout(host);
    P.handle({ get: () => u, set: (x, y) => { u[0] = snap(x); u[1] = snap(y); update(); }, color: 1 });
    P.handle({ get: () => v, set: (x, y) => { v[0] = snap(x); v[1] = snap(y); update(); }, color: 2 });
    function update() {
      const dot = u[0] * v[0] + u[1] * v[1], nu = Math.hypot(...u), nv = Math.hypot(...v);
      const ang = nu && nv ? (Math.acos(Math.max(-1, Math.min(1, dot / (nu * nv)))) * 180) / Math.PI : 0;
      const k = nu ? dot / (nu * nu) : 0, pr = [k * u[0], k * u[1]];
      P.draw((p) => {
        if (mode === 'sum') {
          p.line(u[0], u[1], u[0] + v[0], u[1] + v[1], { color: 2, dash: [5, 4], width: 1.5 });
          p.line(v[0], v[1], u[0] + v[0], u[1] + v[1], { color: 1, dash: [5, 4], width: 1.5 });
          p.arrow(0, 0, u[0] + v[0], u[1] + v[1], { color: 3, width: 2.75 });
          p.text('u + v', u[0] + v[0], u[1] + v[1], { dx: 8, dy: -8, color: 3, weight: 700 });
        } else {
          if (nu) p.line(-u[0] * 10, -u[1] * 10, u[0] * 10, u[1] * 10, { color: 'muted', width: 1, dash: [2, 4] });
          p.line(v[0], v[1], pr[0], pr[1], { color: 'muted', width: 1.5, dash: [4, 4] });
          p.arrow(0, 0, pr[0], pr[1], { color: 3, width: 4, alpha: 0.85 });
          p.text('proj', pr[0], pr[1], { dx: 6, dy: 14, color: 3 });
        }
        p.arrow(0, 0, u[0], u[1], { color: 1, width: 2.75 }); p.arrow(0, 0, v[0], v[1], { color: 2, width: 2.75 });
        p.text('u', u[0], u[1], { dx: 10, dy: -10, color: 1, weight: 700, size: 14 }); p.text('v', v[0], v[1], { dx: 10, dy: -10, color: 2, weight: 700, size: 14 });
      });
      out.set(mode === 'sum'
        ? `$\\mathbf u = (${n2(u[0])}, ${n2(u[1])})$, $\\mathbf v = (${n2(v[0])}, ${n2(v[1])})$, $\\mathbf u + \\mathbf v = (${n2(u[0] + v[0])}, ${n2(u[1] + v[1])})$. Tip to tail: walk along $\\mathbf u$, then along $\\mathbf v$.`
        : `$\\mathbf u\\cdot\\mathbf v = ${n2(u[0])}(${n2(v[0])}) + ${n2(u[1])}(${n2(v[1])}) = ${n2(dot)}$. Angle $\\theta \\approx ${n2(ang)}^\\circ$. ${Math.abs(dot) < 1e-9 ? '**Perpendicular**: the dot product is zero and the projection vanishes.' : `Projection of $\\mathbf v$ onto $\\mathbf u$: $\\frac{${n2(dot)}}{${n2(nu * nu)}}\\mathbf u = (${n2(pr[0])}, ${n2(pr[1])})$ (green shadow).`}`);
    }
    update();
  });

  /* ---- 2×2 matrix as a transformation of the plane ---- */
  AM.widget('matrix2d', (host, o, { ui }) => {
    const M = { a: 1, b: 1, c: 0, d: 1 };
    const presets = [['Shear', [1, 1, 0, 1]], ['Identity', [1, 0, 0, 1]], ['Rotate 45°', [0.7, -0.7, 0.7, 0.7]], ['Stretch', [2, 0, 0, 0.5]], ['Reflect in y = x', [0, 1, 1, 0]], ['Flip x', [-1, 0, 0, 1]], ['Squash to a line', [1, 2, 0.5, 1]], ['Rotate & scale', [1.2, -0.8, 0.8, 1.2]]];
    const P = new Plot(host, { xmin: -4, xmax: 4, ymin: -3.2, ymax: 3.2, equal: true, grid: false, xstep: 1, label: 'Grid transformed by a matrix' });
    const panel = ui.panel(host);
    matrixPanel(ui, panel, M, presets, update);
    const out = ui.readout(host);
    const F = [[0, 0], [0, 2], [1.1, 2], [1.1, 1.75], [0.3, 1.75], [0.3, 1.2], [0.9, 1.2], [0.9, 0.95], [0.3, 0.95], [0.3, 0]]; // letter F, shows flips
    function update() {
      const { a, b, c, d } = M, T = ([x, y]) => [a * x + b * y, c * x + d * y], det = a * d - b * c;
      P.draw((p) => {
        for (let k = -8; k <= 8; k++) { p.line(k, -8, k, 8, { color: 'grid', width: 1 }); p.line(-8, k, 8, k, { color: 'grid', width: 1 }); }
        for (let k = -8; k <= 8; k++) {
          const A1 = T([k, -8]), A2 = T([k, 8]), B1 = T([-8, k]), B2 = T([8, k]);
          p.line(A1[0], A1[1], A2[0], A2[1], { color: 1, width: k === 0 ? 1.6 : 0.9, alpha: 0.45 });
          p.line(B1[0], B1[1], B2[0], B2[1], { color: 1, width: k === 0 ? 1.6 : 0.9, alpha: 0.45 });
        }
        p.poly([[0, 0], T([1, 0]), T([1, 1]), T([0, 1])], { fill: det >= 0 ? 3 : 4, fillAlpha: 0.25, stroke: det >= 0 ? 3 : 4, width: 1.5 });
        p.poly(F.map(T), { fill: 2, fillAlpha: 0.55, stroke: 2, width: 1.5 });
        p.arrow(0, 0, a, c, { color: 1, width: 3 }); p.arrow(0, 0, b, d, { color: 4, width: 3 });
        p.text('Ae₁', a, c, { dx: 8, dy: -8, color: 1, weight: 700 }); p.text('Ae₂', b, d, { dx: 8, dy: -8, color: 4, weight: 700 });
      });
      const what = Math.abs(det) < 1e-9 ? '**Singular**: the plane collapses onto a line (or a point), so there is no inverse.' : `Areas scale by $|\\det A| = ${n2(Math.abs(det))}$${det < 0 ? ', and orientation flips (the F is mirrored)' : ''}.`;
      out.set(`$A = ${mtex(a, b, c, d)}$, $\\det A = ad - bc = ${n2(det)}$. ${what} The columns of $A$ are where the basis arrows land.`);
    }
    update();
  });

  /* ---- 2×2 linear systems: two lines ---- */
  AM.widget('systems', (host, o, { ui }) => {
    const S = { a1: 2, b1: 1, c1: 4, a2: 1, b2: -1, c2: -1 };
    const P = new Plot(host, { xmin: -5, xmax: 5, ymin: -4, ymax: 6, equal: true, xstep: 1, label: 'Two lines and their intersection' });
    const panel = ui.panel(host);
    [['a1', '$a_1$', 'Line 1: $a_1x + b_1y = c_1$'], ['b1', '$b_1$'], ['c1', '$c_1$'], ['a2', '$a_2$', 'Line 2'], ['b2', '$b_2$'], ['c2', '$c_2$']].forEach(([k, lab]) => {
      ui.slider(panel, { id: k, label: lab, min: k[0] === 'c' ? -6 : -3, max: k[0] === 'c' ? 6 : 3, step: k[0] === 'c' ? 0.5 : 0.25, value: S[k], onInput: (v) => { S[k] = v; update(); } });
    });
    const out = ui.readout(host);
    function line(p, a, b, c, col) {
      if (Math.abs(b) > 1e-9) p.fn((x) => (c - a * x) / b, { color: col, width: 2.5 });
      else if (Math.abs(a) > 1e-9) p.vline(c / a, { color: col, width: 2.5, dash: [] });
    }
    function update() {
      const { a1, b1, c1, a2, b2, c2 } = S, det = a1 * b2 - a2 * b1;
      P.draw((p) => {
        line(p, a1, b1, c1, 1); line(p, a2, b2, c2, 2);
        if (Math.abs(det) > 1e-9) { const x = (c1 * b2 - c2 * b1) / det, y = (a1 * c2 - a2 * c1) / det; p.point(x, y, { color: 3, r: 6 }); }
      });
      const sys = `\\begin{cases} ${n2(a1)}x ${b1 < 0 ? '-' : '+'} ${n2(Math.abs(b1))}y = ${n2(c1)} \\\\ ${n2(a2)}x ${b2 < 0 ? '-' : '+'} ${n2(Math.abs(b2))}y = ${n2(c2)} \\end{cases}`;
      let verdict;
      if (Math.abs(det) > 1e-9) { const x = (c1 * b2 - c2 * b1) / det, y = (a1 * c2 - a2 * c1) / det; verdict = `$\\det A = ${n2(det)} \\ne 0$: **exactly one solution**, $(x, y) = (${n3(x)}, ${n3(y)})$, where the lines cross.`; }
      else {
        const prop = Math.abs(a1 * c2 - a2 * c1) < 1e-9 && Math.abs(b1 * c2 - b2 * c1) < 1e-9;
        verdict = prop ? '$\\det A = 0$ and the equations are multiples of each other: **infinitely many solutions** (the same line twice).' : '$\\det A = 0$: the lines are parallel, so there is **no solution**. The system is inconsistent.';
      }
      out.set(`$${sys}$ ${verdict}`);
    }
    update();
  });

  /* ---- Eigenvectors: watch x and Ax as x goes round the circle ---- */
  AM.widget('eigen', (host, o, { ui }) => {
    const M = { a: 2, b: 1, c: 1, d: 2 }; let th = 0.3;
    const presets = [['Symmetric (λ = 3, 1)', [2, 1, 1, 2]], ['Diagonal stretch', [2.5, 0, 0, 0.7]], ['Shear (one eigen-direction)', [1, 1, 0, 1]], ['Rotation (no real eigenvectors)', [0, -1, 1, 0]], ['Reflection (λ = ±1)', [0, 1, 1, 0]], ['Negative eigenvalue', [1, 2, 2, -2]]];
    const P = new Plot(host, { xmin: -3.6, xmax: 3.6, ymin: -3.2, ymax: 3.2, equal: true, xstep: 1, label: 'Vector x and its image Ax' });
    const panel = ui.panel(host);
    matrixPanel(ui, panel, M, presets, update);
    const anim = AM.animate(host, (dt) => { th = (th + dt * 0.6) % (2 * Math.PI); update(); });
    ui.player(panel, anim, false);
    const out = ui.readout(host);
    P.handle({ get: () => [Math.cos(th), Math.sin(th)], set: (x, y) => { th = Math.atan2(y, x); update(); }, color: 1 });
    function update() {
      const { a, b, c, d } = M, x = [Math.cos(th), Math.sin(th)], Ax = [a * x[0] + b * x[1], c * x[0] + d * x[1]], E = eig2(a, b, c, d);
      const cross = x[0] * Ax[1] - x[1] * Ax[0], aligned = Math.hypot(...Ax) > 1e-6 && Math.abs(cross) / Math.hypot(...Ax) < 0.03;
      P.draw((p) => {
        p.circle(0, 0, 1, { color: 'axis', width: 1.2 });
        p.param((t) => a * Math.cos(t) + b * Math.sin(t), (t) => c * Math.cos(t) + d * Math.sin(t), 0, 2 * Math.PI, { color: 2, width: 1.2, dash: [4, 4] });
        if (!E.complex) E.vs.forEach((v, i) => p.line(-v[0] * 9, -v[1] * 9, v[0] * 9, v[1] * 9, { color: 3, width: 1.5, alpha: 0.7, dash: i ? [6, 4] : [] }));
        p.arrow(0, 0, Ax[0], Ax[1], { color: 2, width: aligned ? 4 : 2.75 });
        p.arrow(0, 0, x[0], x[1], { color: 1, width: 2.75 });
        p.text('Ax', Ax[0], Ax[1], { dx: 8, dy: -8, color: 2, weight: 700 }); p.text('x', x[0], x[1], { dx: 8, dy: 12, color: 1, weight: 700 });
      });
      const ev = E.complex ? `complex: $\\lambda = ${n2(E.re)} \\pm ${n2(E.im)}i$, so no real direction is left unturned` : `$\\lambda_1 = ${n3(E.ls[0])}$, $\\lambda_2 = ${n3(E.ls[1])}$ (green lines are the eigen-directions)`;
      out.set(`$A = ${mtex(a, b, c, d)}$. Eigenvalues ${ev}. ${aligned ? `**Now $A\\mathbf x$ lies along $\\mathbf x$**: $\\mathbf x$ is an eigenvector and $A\\mathbf x \\approx ${n2((Ax[0] * x[0] + Ax[1] * x[1]))}\\,\\mathbf x$.` : 'Drag $\\mathbf x$ (or press Play) until $A\\mathbf x$ points along the same line.'}`);
    }
    update();
  });

  /* ---- Least squares line with draggable points (and a statistics mode) ---- */
  AM.widget('leastsq', (host, o, { ui }) => {
    const stats = o.mode === 'stats';
    let pts = stats ? [[1, 1.8], [2, 2.6], [3, 2.9], [4, 4.4], [5, 4.6], [6, 6.1], [7, 6.4], [8, 7.9]] : [[1, 2], [2, 2.6], [3, 4.2], [4, 3.9], [5, 5.6], [6, 5.9]];
    let showSq = !stats, showResid = true;
    const P = new Plot(host, { xmin: -0.5, xmax: 9.5, ymin: -0.5, ymax: 9, equal: !stats, xstep: 1, ystep: 1, label: 'Scatter plot with least squares line' });
    const panel = ui.panel(host);
    if (!stats) ui.toggle(panel, { id: 'sq', label: 'Draw the squared errors', value: showSq, onChange: (v) => { showSq = v; update(); } });
    ui.toggle(panel, { id: 'res', label: 'Show residuals', value: showResid, onChange: (v) => { showResid = v; update(); } });
    ui.button(panel, 'Add an outlier', () => { if (pts.length < 14) { pts.push([8.5, 1]); addHandle(pts.length - 1); update(); } });
    ui.button(panel, 'Reset points', () => { pts.splice(0, pts.length, ...(stats ? [[1, 1.8], [2, 2.6], [3, 2.9], [4, 4.4], [5, 4.6], [6, 6.1], [7, 6.4], [8, 7.9]] : [[1, 2], [2, 2.6], [3, 4.2], [4, 3.9], [5, 5.6], [6, 5.9]]).map((q) => q.slice())); P.handles.length = 0; pts.forEach((_, i) => addHandle(i)); update(); });
    const out = ui.readout(host);
    function addHandle(i) { P.handle({ get: () => pts[i], set: (x, y) => { pts[i] = [Math.round(x * 10) / 10, Math.round(y * 10) / 10]; update(); }, color: 1, r: 6 }); }
    pts.forEach((_, i) => addHandle(i));
    function fit() {
      const n = pts.length, mx = pts.reduce((s, q) => s + q[0], 0) / n, my = pts.reduce((s, q) => s + q[1], 0) / n;
      let sxy = 0, sxx = 0, syy = 0; pts.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; });
      const m = sxx ? sxy / sxx : 0, c = my - m * mx, sse = pts.reduce((s, [x, y]) => s + (y - (m * x + c)) ** 2, 0);
      return { m, c, sse, r: sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0, R2: syy ? 1 - sse / syy : 1, mx, my };
    }
    function update() {
      const F = fit();
      P.draw((p) => {
        pts.forEach(([x, y]) => {
          const yh = F.m * x + F.c, e = y - yh;
          if (showSq) p.rect(x - Math.abs(e), Math.min(y, yh), x, Math.max(y, yh), { fill: 4, fillAlpha: 0.12, stroke: 4, width: 0.75 });
          if (showResid) p.line(x, y, x, yh, { color: 4, width: 1.75 });
        });
        p.fn((x) => F.m * x + F.c, { color: 2, width: 2.75 });
        if (stats) p.point(F.mx, F.my, { color: 3, r: 5, hollow: true });
      });
      out.set(stats
        ? `Line $\\hat y = ${n3(F.m)}x ${F.c < 0 ? '-' : '+'} ${n3(Math.abs(F.c))}$. Correlation $r = ${n3(F.r)}$ and $R^2 = r^2 = ${n3(F.R2)}$: the line explains ${Math.round(F.R2 * 100)}% of the variation in $y$. The line always passes through $(\\bar x, \\bar y)$ (hollow green point).`
        : `Best line $y = ${n3(F.m)}x ${F.c < 0 ? '-' : '+'} ${n3(Math.abs(F.c))}$. Total squared error $\\sum e_i^2 = ${n3(F.sse)}$, the total area of the pink squares. No other line has a smaller total.`);
    }
    update();
  });

  /* ---- SVD: unit circle → ellipse ---- */
  AM.widget('svd', (host, o, { ui }) => {
    const M = { a: 3, b: 0, c: 4, d: 5 }; let rank1 = false;
    const presets = [['Example (σ = 3√5, √5)', [3, 0, 4, 5]], ['Shear', [1, 1.5, 0, 1]], ['Nearly singular', [2, 1.9, 1, 1]], ['Rotation', [0.7, -0.7, 0.7, 0.7]], ['Diagonal', [2.5, 0, 0, -1]]];
    const P = new Plot(host, { xmin: -7, xmax: 7, ymin: -7, ymax: 7, equal: true, xstep: 1, aspect: 0.75, label: 'Unit circle mapped to an ellipse' });
    const panel = ui.panel(host);
    const sl = matrixPanel(ui, panel, M, presets, update);
    Object.values(sl).forEach((s) => { s.input.min = -5; s.input.max = 5; });
    ui.toggle(panel, { id: 'r1', label: 'Show best rank-1 approximation', value: rank1, onChange: (v) => { rank1 = v; update(); } });
    const out = ui.readout(host);
    function svd() {
      const { a, b, c, d } = M, E = eig2(a * a + c * c, a * b + c * d, a * b + c * d, b * b + d * d);
      const s = E.ls.map((l) => Math.sqrt(Math.max(0, l))), V = E.vs;
      const U = V.map((v, i) => { const Av = [a * v[0] + b * v[1], c * v[0] + d * v[1]]; return s[i] > 1e-9 ? [Av[0] / s[i], Av[1] / s[i]] : [-V[0][1], V[0][0]]; });
      return { s, V, U };
    }
    function update() {
      const { a, b, c, d } = M, S = svd(), m = Math.max(2, S.s[0] * 1.25);
      P.setView(-m, m, -m, m);
      P.draw((p) => {
        p.circle(0, 0, 1, { color: 'axis', width: 1.4, fill: 'muted', fillAlpha: 0.06 });
        p.param((t) => a * Math.cos(t) + b * Math.sin(t), (t) => c * Math.cos(t) + d * Math.sin(t), 0, 2 * Math.PI, { color: 'ink', width: 2 });
        S.V.forEach((v, i) => p.arrow(0, 0, v[0], v[1], { color: i ? 2 : 1, width: 2.25 }));
        S.U.forEach((u, i) => p.arrow(0, 0, u[0] * S.s[i], u[1] * S.s[i], { color: i ? 2 : 1, width: 3.25 }));
        p.text('σ₁u₁', S.U[0][0] * S.s[0], S.U[0][1] * S.s[0], { dx: 8, dy: -8, color: 1, weight: 700 });
        if (rank1) p.line(-S.U[0][0] * S.s[0], -S.U[0][1] * S.s[0], S.U[0][0] * S.s[0], S.U[0][1] * S.s[0], { color: 3, width: 5, alpha: 0.6 });
      });
      const k = S.s[1] > 1e-9 ? n2(S.s[0] / S.s[1]) : '\\infty';
      out.set(`$A = ${mtex(a, b, c, d)}$. Singular values $\\sigma_1 = ${n3(S.s[0])}$, $\\sigma_2 = ${n3(S.s[1])}$: the half-lengths of the ellipse's axes. Thin arrows are $\\mathbf v_1, \\mathbf v_2$ on the circle; thick arrows are where they land, $\\sigma_i\\mathbf u_i$. Condition number $\\sigma_1/\\sigma_2 = ${k}$.${rank1 ? ` The rank-1 approximation squashes everything onto the green segment, with error $\\sigma_2 = ${n3(S.s[1])}$.` : ''}`);
    }
    update();
  });
})();
