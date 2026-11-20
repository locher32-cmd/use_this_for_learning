/* Visuals for Complex Analysis. Complex numbers are [re, im] pairs. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, el = AM.el, n2 = (v) => AM.fmt(v, 2), n3 = (v) => AM.fmt(v, 3);
  const Cx = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1]], sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
    mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
    div: (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; },
    exp: (a) => { const r = Math.exp(a[0]); return [r * Math.cos(a[1]), r * Math.sin(a[1])]; },
    sin: (a) => [Math.sin(a[0]) * Math.cosh(a[1]), Math.cos(a[0]) * Math.sinh(a[1])],
    abs: (a) => Math.hypot(a[0], a[1]), arg: (a) => Math.atan2(a[1], a[0]),
  };
  AM.Cx = Cx;
  const ctex = (z) => `${n2(z[0])} ${z[1] < 0 ? '-' : '+'} ${n2(Math.abs(z[1]))}i`;
  const deg = (t) => Math.round((t * 180) / Math.PI);

  /* ---- Multiplying complex numbers: rotate and scale ---- */
  AM.widget('complexmul', (host, o, { ui }) => {
    const z = [1.2, 0.6], w = [0.4, 1.1]; let mode = 'mul';
    const P = new Plot(host, { xmin: -3.2, xmax: 3.2, ymin: -2.6, ymax: 2.6, equal: true, aspect: 0.62, xstep: 1, xlabel: 'Re', ylabel: 'Im', label: 'Complex plane with two draggable numbers' });
    const panel = ui.panel(host);
    ui.seg(panel, { id: 'mode', label: 'Show', options: [['mul', 'Product $zw$'], ['pow', 'Powers $z^n$'], ['add', 'Sum $z + w$'], ['conj', 'Conjugate $\\bar z$']], value: mode, onChange: (v) => { mode = v; update(); } });
    const out = ui.readout(host);
    const snap = (v) => Math.round(v * 10) / 10;
    P.handle({ get: () => z, set: (x, y) => { z[0] = snap(x); z[1] = snap(y); update(); }, color: 1 });
    P.handle({ get: () => w, set: (x, y) => { w[0] = snap(x); w[1] = snap(y); update(); }, color: 2, hidden: () => mode === 'pow' || mode === 'conj' });
    function arcAt(p, r, a0, a1, col) { const pts = []; for (let i = 0; i <= 40; i++) { const t = a0 + ((a1 - a0) * i) / 40; pts.push([r * Math.cos(t), r * Math.sin(t)]); } p.path(pts, { color: col, width: 1.5 }); }
    function update() {
      const zw = Cx.mul(z, w);
      P.draw((p) => {
        p.circle(0, 0, 1, { color: 'axis', width: 1, dash: [3, 4] });
        if (mode === 'mul') {
          arcAt(p, 0.35, 0, Cx.arg(z), 1); arcAt(p, 0.5, 0, Cx.arg(w), 2); arcAt(p, 0.65, 0, Cx.arg(zw), 3);
          p.arrow(0, 0, zw[0], zw[1], { color: 3, width: 3 }); p.text('zw', zw[0], zw[1], { dx: 8, dy: -8, color: 3, weight: 700, size: 13 });
        } else if (mode === 'add') {
          p.line(z[0], z[1], z[0] + w[0], z[1] + w[1], { color: 2, dash: [4, 4] }); p.line(w[0], w[1], z[0] + w[0], z[1] + w[1], { color: 1, dash: [4, 4] });
          p.arrow(0, 0, z[0] + w[0], z[1] + w[1], { color: 3, width: 3 }); p.text('z + w', z[0] + w[0], z[1] + w[1], { dx: 8, dy: -8, color: 3, weight: 700 });
        } else if (mode === 'pow') {
          let q = [1, 0]; const pts = [q];
          for (let k = 1; k <= 12; k++) { q = Cx.mul(q, z); pts.push(q); if (Cx.abs(q) > 6) break; }
          p.path(pts, { color: 3, width: 1.5, dash: [4, 3] }); pts.forEach((v, k) => { p.point(v[0], v[1], { color: 3, r: 3.5 }); if (k > 0 && k <= 5) p.text(`z${'⁰¹²³⁴⁵'[k]}`, v[0], v[1], { dx: 6, dy: -8, color: 3 }); });
        } else {
          p.arrow(0, 0, z[0], -z[1], { color: 4, width: 2.5 }); p.line(z[0], z[1], z[0], -z[1], { color: 'muted', dash: [3, 3] }); p.text('z̄', z[0], -z[1], { dx: 8, dy: 8, color: 4, weight: 700, size: 13 });
        }
        p.arrow(0, 0, z[0], z[1], { color: 1, width: 2.5 }); p.text('z', z[0], z[1], { dx: 9, dy: -9, color: 1, weight: 700, size: 13 });
        if (mode === 'mul' || mode === 'add') { p.arrow(0, 0, w[0], w[1], { color: 2, width: 2.5 }); p.text('w', w[0], w[1], { dx: 9, dy: -9, color: 2, weight: 700, size: 13 }); }
      });
      const rz = Cx.abs(z), rw = Cx.abs(w);
      if (mode === 'mul') out.set(`$z = ${ctex(z)}$ has length $${n2(rz)}$ and angle $${deg(Cx.arg(z))}^\\circ$; $w = ${ctex(w)}$ has length $${n2(rw)}$ and angle $${deg(Cx.arg(w))}^\\circ$. Their product $zw = ${ctex(zw)}$ has length $${n2(rz)} \\times ${n2(rw)} = ${n2(rz * rw)}$ and angle $${deg(Cx.arg(z))}^\\circ + ${deg(Cx.arg(w))}^\\circ = ${deg(Cx.arg(zw))}^\\circ$ (mod 360°). **Lengths multiply, angles add.**`);
      else if (mode === 'pow') out.set(`Each power multiplies by $z$ again: turn by $${deg(Cx.arg(z))}^\\circ$ and scale by $${n2(rz)}$. ${Math.abs(rz - 1) < 0.05 ? 'With $|z| = 1$ the powers walk around the unit circle.' : rz > 1 ? 'With $|z| > 1$ they spiral outward.' : 'With $|z| < 1$ they spiral in toward 0.'} This is De Moivre: $z^n = r^n e^{in\\theta}$.`);
      else if (mode === 'add') out.set(`$z + w = ${ctex(Cx.add(z, w))}$. Addition works exactly like adding vectors: tip to tail.`);
      else out.set(`$\\bar z = ${ctex([z[0], -z[1]])}$ is the reflection of $z$ in the real axis. $z\\bar z = |z|^2 = ${n2(rz * rz)}$, a real number, which is why $\\frac{1}{z} = \\frac{\\bar z}{|z|^2}$.`);
    }
    update();
  });

  /* ---- Complex functions as maps of the plane ---- */
  AM.widget('conformal', (host, o, { ui }) => {
    const F = {
      sq: [(z) => Cx.mul(z, z), 'f(z) = z^2', 'Angles from the origin double and lengths square, so the right half-plane wraps onto the whole plane.', [-0.2, 2, -1.1, 1.1], 4],
      exp: [Cx.exp, 'f(z) = e^z', 'Horizontal lines map to rays from the origin; vertical lines map to circles. Polar coordinates appear for free.', [-1.5, 1, -1.6, 1.6], 3.2],
      inv: [(z) => Cx.div([1, 0], z), 'f(z) = 1/z', 'Inversion: lines become circles through the origin and the inside of the unit circle swaps with the outside.', [0.3, 2.3, -1.2, 1.2], 3.5],
      jouk: [(z) => Cx.add(z, Cx.div([1, 0], z)), 'f(z) = z + 1/z', 'The Joukowski map. Circles near the unit circle become airfoil-like shapes; it was used to design early wing profiles.', [0.4, 2.2, -1.2, 1.2], 4],
      sin: [Cx.sin, 'f(z) = \\sin z', 'Vertical lines become hyperbolas and horizontal lines become ellipses.', [-1.6, 1.6, -1, 1], 3.2],
    };
    let key = 'sq', N = 8;
    const row = el('div', 'viz-row'); host.appendChild(row);
    const A = new Plot(row, { xmin: -0.2, xmax: 2, ymin: -1.1, ymax: 1.1, equal: true, aspect: 0.9, xstep: 0.5, label: 'Grid in the z-plane' });
    const B = new Plot(row, { xmin: -4, xmax: 4, ymin: -4, ymax: 4, equal: true, aspect: 0.9, xstep: 1, label: 'Image grid in the w-plane' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'f', label: 'Map', options: [['sq', 'z²'], ['exp', 'eᶻ'], ['inv', '1/z'], ['jouk', 'z + 1/z'], ['sin', 'sin z']], value: key, onChange: (v) => { key = v; update(); } });
    ui.slider(panel, { id: 'N', label: 'Grid lines', min: 3, max: 14, step: 1, value: N, fmt: String, onInput: (v) => { N = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const [f, tex, note, [x0, x1, y0, y1], R] = F[key];
      A.setView(x0, x1, y0, y1); B.setView(-R, R, -R, R);
      const lines = [];
      for (let i = 0; i <= N; i++) { const x = x0 + ((x1 - x0) * i) / N, pts = []; for (let j = 0; j <= 120; j++) pts.push([x, y0 + ((y1 - y0) * j) / 120]); lines.push([pts, 1]); }
      for (let i = 0; i <= N; i++) { const y = y0 + ((y1 - y0) * i) / N, pts = []; for (let j = 0; j <= 120; j++) pts.push([x0 + ((x1 - x0) * j) / 120, y]); lines.push([pts, 2]); }
      A.draw((p) => lines.forEach(([pts, c]) => p.path(pts, { color: c, width: 1.4 })));
      B.draw((p) => lines.forEach(([pts, c]) => {
        const img = pts.map((q) => f(q)); let seg = [];
        img.forEach((q) => { if (isFinite(q[0]) && isFinite(q[1]) && Math.abs(q[0]) < 50 && Math.abs(q[1]) < 50) seg.push(q); else { if (seg.length > 1) p.path(seg, { color: c, width: 1.4 }); seg = []; } });
        if (seg.length > 1) p.path(seg, { color: c, width: 1.4 });
      }));
      out.set(`$${tex}$. Left: a grid of blue vertical and orange horizontal lines in the $z$-plane. Right: where $f$ sends them. ${note} Wherever $f'(z) \\ne 0$ the image lines still cross at right angles: the map is **conformal**.`);
    }
    update();
  });

  /* ---- Contour integrals and residues ---- */
  AM.widget('residue', (host, o, { ui }) => {
    const poles = [[1, 0], [-1, 0.5], [0.3, -1.4]];
    const res = poles.map((p, k) => { let d = [1, 0]; poles.forEach((q, j) => { if (j !== k) d = Cx.mul(d, Cx.sub(p, q)); }); return Cx.div([1, 0], d); });
    const f = (z) => { let d = [1, 0]; poles.forEach((q) => { d = Cx.mul(d, Cx.sub(z, q)); }); return Cx.div([1, 0], d); };
    const c = [0.4, 0.1]; let r = 1.0;
    const P = new Plot(host, { xmin: -3, xmax: 3, ymin: -2.4, ymax: 2.4, equal: true, aspect: 0.62, xstep: 1, xlabel: 'Re', ylabel: 'Im', label: 'Contour around poles' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'r', label: 'Contour radius', min: 0.2, max: 2.6, step: 0.01, value: r, onInput: (v) => { r = v; update(); } });
    const out = ui.readout(host);
    P.handle({ get: () => c, set: (x, y) => { c[0] = x; c[1] = y; update(); }, color: 4 });
    function update() {
      const N = 4000; let I = [0, 0];
      for (let k = 0; k < N; k++) { const t = (2 * Math.PI * (k + 0.5)) / N, z = [c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)], dz = [-r * Math.sin(t) * (2 * Math.PI / N), r * Math.cos(t) * (2 * Math.PI / N)]; I = Cx.add(I, Cx.mul(f(z), dz)); }
      const inside = poles.map((p) => Math.hypot(p[0] - c[0], p[1] - c[1]) < r), S = res.reduce((s, q, k) => (inside[k] ? Cx.add(s, q) : s), [0, 0]), pred = Cx.mul([0, 2 * Math.PI], S);
      P.draw((p) => {
        p.heat((x, y) => Math.log(Cx.abs(f([x, y])) + 1e-9), { diverging: false, high: p.color(1), strength: 0.45, cell: 5 });
        p.circle(c[0], c[1], r, { color: 4, width: 2.5 });
        for (let k = 0; k < 4; k++) { const t = (k * Math.PI) / 2 + 0.3, x = c[0] + r * Math.cos(t), y = c[1] + r * Math.sin(t); p.arrow(x, y, x - 0.15 * Math.sin(t), y + 0.15 * Math.cos(t), { color: 4, width: 2, head: 9 }); }
        poles.forEach((q, k) => { p.text('×', q[0], q[1], { align: 'center', color: inside[k] ? 2 : 'ink2', size: 22, weight: 700 }); p.text(`Res ${ctex(res[k])}`, q[0], q[1], { dx: 12, dy: 14, color: inside[k] ? 2 : 'muted', size: 11 }); });
      });
      out.set(`$f(z) = \\dfrac{1}{(z - 1)(z + 1 - 0.5i)(z - 0.3 + 1.4i)}$ has three poles (×). Numerically, $\\oint_C f\\,dz \\approx ${ctex(I)}$. Residue theorem: $2\\pi i\\times(\\text{sum of residues inside}) = ${ctex(pred)}$. ${inside.filter(Boolean).length ? `${inside.filter(Boolean).length} pole${inside.filter(Boolean).length > 1 ? 's' : ''} inside, so the two agree.` : 'No poles inside, so the integral is 0 (Cauchy\'s theorem).'} Drag the centre and change the radius to enclose different poles.`);
    }
    update();
  });
})();
