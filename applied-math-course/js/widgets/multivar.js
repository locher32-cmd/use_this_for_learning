/* Visuals for Multivariable and Vector Calculus. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, el = AM.el, n2 = (v) => AM.fmt(v, 2), n3 = (v) => AM.fmt(v, 3);
  const SURF = {
    bowl: { f: (x, y) => (x * x + y * y) / 2, tex: '\\tfrac12(x^2 + y^2)', fx: (x) => x, fy: (x, y) => y },
    saddle: { f: (x, y) => (x * x - y * y) / 2, tex: '\\tfrac12(x^2 - y^2)', fx: (x) => x, fy: (x, y) => -y },
    hills: { f: (x, y) => 2 * Math.exp(-((x - 1) ** 2 + (y - 0.5) ** 2)) - 1.5 * Math.exp(-((x + 1.2) ** 2 + (y + 1) ** 2) / 1.5), tex: '2e^{-(x-1)^2-(y-\\frac12)^2} - 1.5e^{-((x+1.2)^2+(y+1)^2)/1.5}' },
    wave: { f: (x, y) => Math.sin(x) * Math.cos(y), tex: '\\sin x\\cos y', fx: (x, y) => Math.cos(x) * Math.cos(y), fy: (x, y) => -Math.sin(x) * Math.sin(y) },
    tilt: { f: (x, y) => x * y / 2, tex: '\\tfrac12 xy', fx: (x, y) => y / 2, fy: (x) => x / 2 },
  };
  const opts = [['hills', 'Two hills'], ['bowl', 'Bowl'], ['saddle', 'Saddle'], ['wave', 'sin x cos y'], ['tilt', 'xy / 2']];
  const grad = (S, x, y) => [S.fx ? S.fx(x, y) : AM.m.deriv((t) => S.f(t, y), x), S.fy ? S.fy(x, y) : AM.m.deriv((t) => S.f(x, t), y)];
  const levels = (lo, hi, n = 14) => Array.from({ length: n }, (_, i) => lo + ((hi - lo) * (i + 0.5)) / n);

  /* ---- Partial derivatives as slices ---- */
  AM.widget('slices', (host, o, { ui }) => {
    let key = 'hills'; const pt = [0.4, -0.3];
    const row = el('div', 'viz-row'); host.appendChild(row);
    const H = new Plot(row, { xmin: -3, xmax: 3, ymin: -3, ymax: 3, equal: true, aspect: 0.95, xstep: 1, grid: false, label: 'Contour map of f(x, y)' });
    const right = el('div', 'viz-host'); row.appendChild(right);
    const SX = new Plot(right, { xmin: -3, xmax: 3, ymin: -2.5, ymax: 2.5, aspect: 0.47, minH: 150, xlabel: 'x', label: 'Slice with y fixed' });
    const SY = new Plot(right, { xmin: -3, xmax: 3, ymin: -2.5, ymax: 2.5, aspect: 0.47, minH: 150, xlabel: 'y', label: 'Slice with x fixed' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'surf', label: 'Surface $f(x,y)$', options: opts, value: key, onChange: (v) => { key = v; update(); } });
    const out = ui.readout(host);
    H.handle({ get: () => pt, set: (x, y) => { pt[0] = x; pt[1] = y; update(); }, color: 4 });
    function update() {
      const S = SURF[key], [x0, y0] = pt, f0 = S.f(x0, y0), [gx, gy] = grad(S, x0, y0);
      let lo = Infinity, hi = -Infinity; for (let x = -3; x <= 3; x += 0.2) for (let y = -3; y <= 3; y += 0.2) { const v = S.f(x, y); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      H.draw((p) => {
        p.heat(S.f, { cell: 4, strength: 0.6 });
        p.contours(S.f, levels(lo, hi));
        p.line(-3, y0, 3, y0, { color: 1, width: 2 }); p.line(x0, -3, x0, 3, { color: 2, width: 2 });
      });
      [SX, SY].forEach((P) => P.setView(-3, 3, lo - 0.3, hi + 0.3));
      SX.draw((p) => { p.fn((x) => S.f(x, y0), { color: 1, width: 2.5 }); p.fn((x) => f0 + gx * (x - x0), { color: 'ink', width: 1.5, from: x0 - 1, to: x0 + 1 }); p.point(x0, f0, { color: 4 }); p.text(`y = ${n2(y0)}`, -2.9, hi, { color: 1 }); });
      SY.draw((p) => { p.fn((y) => S.f(x0, y), { color: 2, width: 2.5 }); p.fn((y) => f0 + gy * (y - y0), { color: 'ink', width: 1.5, from: y0 - 1, to: y0 + 1 }); p.point(y0, f0, { color: 4 }); p.text(`x = ${n2(x0)}`, -2.9, hi, { color: 2 }); });
      out.set(`$f(x,y) = ${S.tex}$. At $(${n2(x0)}, ${n2(y0)})$: $f = ${n3(f0)}$, $\\ f_x = ${n3(gx)}$ (slope of the blue slice), $\\ f_y = ${n3(gy)}$ (slope of the orange slice). Blue cuts the surface along $y$ = constant; orange along $x$ = constant.`);
    }
    update();
  });

  /* ---- Gradient and directional derivative ---- */
  AM.widget('gradient', (host, o, { ui }) => {
    let key = 'hills', ang = 30, field = false; const pt = [0, 0.4];
    const P = new Plot(host, { xmin: -3, xmax: 3, ymin: -3, ymax: 3, equal: true, aspect: 0.7, xstep: 1, grid: false, label: 'Contour map with gradient arrow' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'surf', label: 'Surface', options: opts, value: key, onChange: (v) => { key = v; update(); } });
    ui.slider(panel, { id: 'dir', label: 'Direction $\\mathbf u$ (degrees)', min: 0, max: 360, step: 1, value: ang, fmt: (v) => v + '°', onInput: (v) => { ang = v; update(); } });
    ui.toggle(panel, { id: 'field', label: 'Show the gradient field', value: field, onChange: (v) => { field = v; update(); } });
    const out = ui.readout(host);
    P.handle({ get: () => pt, set: (x, y) => { pt[0] = x; pt[1] = y; update(); }, color: 4 });
    function update() {
      const S = SURF[key], [x0, y0] = pt, [gx, gy] = grad(S, x0, y0), g = Math.hypot(gx, gy), r = (ang * Math.PI) / 180, u = [Math.cos(r), Math.sin(r)], D = gx * u[0] + gy * u[1];
      let lo = Infinity, hi = -Infinity; for (let x = -3; x <= 3; x += 0.2) for (let y = -3; y <= 3; y += 0.2) { const v = S.f(x, y); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      const sc = 1.2 / Math.max(g, 0.4);
      P.draw((p) => {
        p.heat(S.f, { cell: 4, strength: 0.55 });
        p.contours(S.f, levels(lo, hi, 16));
        if (field) p.field((x, y) => grad(S, x, y), { n: 15, color: 'ink2', fade: true });
        p.arrow(x0, y0, x0 + u[0] * 1.2, y0 + u[1] * 1.2, { color: 2, width: 2.5 });
        p.arrow(x0, y0, x0 + gx * sc, y0 + gy * sc, { color: 'ink', width: 3.25 });
        p.text('∇f', x0 + gx * sc, y0 + gy * sc, { dx: 6, dy: -8, color: 'ink', weight: 700, size: 13 });
        p.text('u', x0 + u[0] * 1.2, y0 + u[1] * 1.2, { dx: 6, dy: -8, color: 2, weight: 700, size: 13 });
      });
      out.set(`$\\nabla f = (${n3(gx)}, ${n3(gy)})$, steepest slope $\\|\\nabla f\\| = ${n3(g)}$. In direction $\\mathbf u = (${n2(u[0])}, ${n2(u[1])})$ the slope is $D_{\\mathbf u}f = \\nabla f\\cdot\\mathbf u = ${n3(D)}$${g > 1e-6 ? ` (the gradient times $\\cos$ of the ${Math.round((Math.acos(Math.max(-1, Math.min(1, D / g))) * 180) / Math.PI)}° angle between them)` : ''}. The black arrow always crosses the contours at right angles.`);
    }
    update();
  });

  /* ---- Double integral as a sum of tiles ---- */
  AM.widget('dblint', (host, o, { ui }) => {
    const FN = { xy: [(x, y) => x * y, 'xy'], sq: [(x, y) => x * x + y * y, 'x^2 + y^2'], gauss: [(x, y) => 4 * Math.exp(-((x - 1) ** 2) - (y - 1) ** 2), '4e^{-(x-1)^2-(y-1)^2}'], one: [() => 1, '1'] };
    const REG = { rect: [(x, y) => true, '[0,2]\\times[0,2]'], tri: [(x, y) => y <= x, '0 \\le y \\le x \\le 2'], disk: [(x, y) => (x - 1) ** 2 + (y - 1) ** 2 <= 1, '(x-1)^2 + (y-1)^2 \\le 1'] };
    let fk = 'xy', rk = 'rect', n = 6;
    const P = new Plot(host, { xmin: -0.3, xmax: 2.3, ymin: -0.3, ymax: 2.3, equal: true, aspect: 0.62, xstep: 0.5, grid: false, label: 'Region divided into tiles' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'f', label: 'Integrand', options: [['xy', 'xy'], ['sq', 'x² + y²'], ['gauss', 'Gaussian bump'], ['one', '1 (area)']], value: fk, onChange: (v) => { fk = v; update(); } });
    ui.select(panel, { id: 'reg', label: 'Region', options: [['rect', 'Square [0, 2]²'], ['tri', 'Triangle y ≤ x'], ['disk', 'Disk']], value: rk, onChange: (v) => { rk = v; update(); } });
    ui.slider(panel, { id: 'n', label: 'Tiles per side', min: 2, max: 60, step: 1, value: n, fmt: (v) => String(v), onInput: (v) => { n = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const [f, ftex] = FN[fk], [inR, rtex] = REG[rk], h = 2 / n;
      let sum = 0, mx = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = (i + 0.5) * h, y = (j + 0.5) * h; if (inR(x, y)) mx = Math.max(mx, f(x, y)); }
      let exact = 0; const m = 400, hh = 2 / m; for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) { const x = (i + 0.5) * hh, y = (j + 0.5) * hh; if (inR(x, y)) exact += f(x, y) * hh * hh; }
      P.draw((p) => {
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const x = (i + 0.5) * h, y = (j + 0.5) * h; if (!inR(x, y)) continue;
          const v = f(x, y); sum += v * h * h;
          p.rect(i * h, j * h, (i + 1) * h, (j + 1) * h, { fill: 1, fillAlpha: 0.08 + 0.7 * (mx ? v / mx : 0), stroke: n <= 24 ? 'bg' : false, width: 1 });
        }
        if (rk === 'tri') p.path([[0, 0], [2, 2], [2, 0]], { close: true, color: 2, width: 2 });
        else if (rk === 'disk') p.circle(1, 1, 1, { color: 2, width: 2 });
        else p.path([[0, 0], [2, 0], [2, 2], [0, 2]], { close: true, color: 2, width: 2 });
      });
      out.set(`$\\displaystyle\\iint_R ${ftex}\\,dA$ over $R: ${rtex}$. Sum over ${n}×${n} tiles (darker = larger $f$, each tile has area $${n3(h * h)}$): $\\approx ${n3(sum)}$. Fine-grid value $\\approx ${n3(exact)}$. ${rk !== 'rect' ? 'Tiles are counted when their centre lies in the region, which is why curved edges converge more slowly.' : ''}`);
    }
    update();
  });

  /* ---- Vector fields with flowing particles ---- */
  AM.widget('vfield', (host, o, { ui }) => {
    const FIELDS = {
      rot: [(x, y) => [-y, x], '(-y,\\ x)', () => 0, () => 2],
      source: [(x, y) => [x, y], '(x,\\ y)', () => 2, () => 0],
      sink: [(x, y) => [-x * 0.6, -y * 0.6], '(-0.6x,\\ -0.6y)', () => -1.2, () => 0],
      shear: [(x, y) => [y, 0], '(y,\\ 0)', () => 0, () => -1],
      saddle: [(x, y) => [x, -y], '(x,\\ -y)', () => 0, () => 0],
      drain: [(x, y) => [-y - 0.35 * x, x - 0.35 * y], '(-y - 0.35x,\\ x - 0.35y)', () => -0.7, () => 2],
      wavy: [(x, y) => [Math.sin(y), Math.sin(x)], '(\\sin y,\\ \\sin x)', () => 0, (x, y) => Math.cos(x) - Math.cos(y)],
    };
    let key = 'drain'; const probe = [1.2, 0.8]; let parts = [];
    const P = new Plot(host, { xmin: -3, xmax: 3, ymin: -3, ymax: 3, equal: true, aspect: 0.62, xstep: 1, label: 'Vector field with moving particles' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'fld', label: 'Field $\\mathbf F$', options: [['drain', 'Draining whirlpool'], ['rot', 'Rotation'], ['source', 'Source'], ['sink', 'Sink'], ['shear', 'Shear flow'], ['saddle', 'Saddle'], ['wavy', 'Wavy']], value: key, onChange: (v) => { key = v; seed(); update(); } });
    const out = ui.readout(host);
    const r = Math.random;
    function seed() { const { xmin, xmax, ymin, ymax } = P.v; parts = Array.from({ length: 260 }, () => ({ x: xmin + r() * (xmax - xmin), y: ymin + r() * (ymax - ymin), age: r() * 120, tr: [] })); }
    P.handle({ get: () => probe, set: (x, y) => { probe[0] = x; probe[1] = y; update(); }, color: 4 });
    const anim = AM.animate(host, (dt) => {
      const F = FIELDS[key][0], { xmin, xmax, ymin, ymax } = P.v;
      parts.forEach((q) => {
        const [u, v] = F(q.x, q.y); q.x += u * dt * 0.6; q.y += v * dt * 0.6; q.age += 1; q.tr.push([q.x, q.y]); if (q.tr.length > 14) q.tr.shift();
        if (q.age > 140 || q.x < xmin || q.x > xmax || q.y < ymin || q.y > ymax || Math.hypot(u, v) < 0.02) { q.x = xmin + r() * (xmax - xmin); q.y = ymin + r() * (ymax - ymin); q.age = 0; q.tr = []; }
      });
      draw();
    });
    ui.player(panel, anim, true);
    function draw() {
      const [F] = FIELDS[key];
      P.draw((p) => {
        p.field(F, { n: 15, color: 'muted', alpha: 0.6 });
        parts.forEach((q) => { if (q.tr.length > 1) p.path(q.tr, { color: 1, width: 1.6, alpha: 0.75 }); });
        const [x0, y0] = probe, R0 = 0.35, curl = FIELDS[key][3](x0, y0);
        p.circle(x0, y0, R0, { color: 4, width: 1.5 });
        const spin = (performance.now() / 1000) * curl * 0.8;
        for (let k = 0; k < 4; k++) { const a = spin + (k * Math.PI) / 2; p.line(x0, y0, x0 + R0 * Math.cos(a), y0 + R0 * Math.sin(a), { color: 4, width: 1.5 }); }
      });
    }
    function update() {
      const [F, ftex, div, curl] = FIELDS[key], [x0, y0] = probe, [u, v] = F(x0, y0);
      draw();
      const d = div(x0, y0), c = curl(x0, y0);
      out.set(`$\\mathbf F = ${ftex}$. At the pink paddle wheel $(${n2(x0)}, ${n2(y0)})$: $\\mathbf F = (${n2(u)}, ${n2(v)})$, divergence $${n2(d)}$ (${Math.abs(d) < 1e-9 ? 'nothing created or destroyed' : d > 0 ? 'fluid spreads out, a source' : 'fluid collects, a sink'}), curl $${n2(c)}$ (${Math.abs(c) < 1e-9 ? 'the wheel does not spin' : c > 0 ? 'the wheel spins counterclockwise' : 'the wheel spins clockwise'}).`);
    }
    seed(); update();
  });
})();
