/* Visuals for Stage 0: functions, exponentials, trig, logic, sets, induction. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, el = AM.el, f = AM.fmt;
  const num = (v) => f(v, 2);
  const signed = (v) => (v < 0 ? ` - ${num(-v)}` : ` + ${num(v)}`);

  /* ---- Transformations of a parent function ---- */
  AM.widget('transform', (host, o, { ui }) => {
    const bases = {
      sq: { f: (x) => x * x, t: (u) => `\\left(${u}\\right)^2`, name: '$x^2$' },
      abs: { f: Math.abs, t: (u) => `\\left|${u}\\right|`, name: '$|x|$' },
      sqrt: { f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), t: (u) => `\\sqrt{${u}}`, name: '$\\sqrt{x}$' },
      cube: { f: (x) => x * x * x, t: (u) => `\\left(${u}\\right)^3`, name: '$x^3$' },
      sin: { f: Math.sin, t: (u) => `\\sin\\left(${u}\\right)`, name: '$\\sin x$' },
      exp: { f: (x) => 2 ** x, t: (u) => `2^{${u}}`, name: '$2^x$' },
    };
    const s = { base: 'sq', a: 1, b: 1, h: 0, k: 0 };
    const P = new Plot(host, { xmin: -6, xmax: 6, ymin: -5, ymax: 6, equal: true, label: 'Graph of a transformed parent function' });
    const panel = ui.panel(host);
    ui.seg(panel, { label: 'Parent function', options: Object.entries(bases).map(([k, b]) => [k, b.name]), value: 'sq', onChange: (v) => { s.base = v; update(); } });
    const sa = ui.slider(panel, { label: 'Vertical stretch $a$', min: -3, max: 3, step: 0.1, value: 1, onInput: (v) => { s.a = v; update(); } });
    const sb = ui.slider(panel, { label: 'Horizontal squeeze $b$', min: 0.25, max: 3, step: 0.05, value: 1, onInput: (v) => { s.b = v; update(); } });
    const sh = ui.slider(panel, { label: 'Shift right $h$', min: -4, max: 4, step: 0.1, value: 0, onInput: (v) => { s.h = v; update(); } });
    const sk = ui.slider(panel, { label: 'Shift up $k$', min: -4, max: 4, step: 0.1, value: 0, onInput: (v) => { s.k = v; update(); } });
    const out = ui.readout(host);
    const g = (x) => s.a * bases[s.base].f(s.b * (x - s.h)) + s.k;
    P.handle({
      get: () => [s.h, s.a * bases[s.base].f(0) + s.k], color: 2,
      set: (x, y) => { s.h = Math.round(x * 10) / 10; s.k = Math.round((y - s.a * bases[s.base].f(0)) * 10) / 10; sh.set(s.h); sk.set(s.k); update(); },
    });
    function update() {
      const B = bases[s.base];
      P.draw((p) => {
        p.fn(B.f, { color: 'muted', width: 1.6, dash: [5, 5] });
        p.fn(g, { color: 1, width: 2.75 });
      });
      const hx = s.h === 0 ? 'x' : `x ${s.h > 0 ? '-' : '+'} ${num(Math.abs(s.h))}`;
      const inner = s.b === 1 ? hx : s.h === 0 ? `${num(s.b)}x` : `${num(s.b)}\\left(${hx}\\right)`;
      const aPart = s.a === 1 ? '' : s.a === -1 ? '-' : num(s.a);
      const expr = `y = ${aPart}${B.t(inner)}${s.k ? signed(s.k) : ''}`;
      const words = [];
      if (s.h) words.push(`${s.h > 0 ? 'right' : 'left'} ${num(Math.abs(s.h))}`);
      if (s.k) words.push(`${s.k > 0 ? 'up' : 'down'} ${num(Math.abs(s.k))}`);
      if (Math.abs(s.a) !== 1) words.push(`${Math.abs(s.a) > 1 ? 'stretched' : 'flattened'} vertically by ${num(Math.abs(s.a))}`);
      if (s.a < 0) words.push('flipped upside down');
      if (s.b !== 1) words.push(`${s.b > 1 ? 'squeezed' : 'widened'} horizontally by ${num(s.b)}`);
      out.set(`$${expr}$ &nbsp; Dashed: the parent. Solid: ${words.length ? 'moved ' + words.join(', ') : 'unchanged'}. Drag the orange point to move the graph.`);
    }
    update();
  });

  /* ---- Exponential growth / decay with doubling time and log view ---- */
  AM.widget('expgrowth', (host, o, { ui }) => {
    const s = { P0: 2, r: 0.25, log: false };
    const P = new Plot(host, { xmin: -0.4, xmax: 10.4, ymin: -1, ymax: 30, xlabel: 't (years)', label: 'Exponential growth curve' });
    const panel = ui.panel(host);
    ui.slider(panel, { label: 'Starting amount $P_0$', min: 0.5, max: 10, step: 0.5, value: 2, onInput: (v) => { s.P0 = v; update(); } });
    ui.slider(panel, { label: 'Rate $r$ per year', min: -0.6, max: 0.6, step: 0.01, value: 0.25, onInput: (v) => { s.r = v; update(); } });
    ui.toggle(panel, { label: 'Log scale (plot $\\ln P$)', value: false, onChange: (v) => { s.log = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const Pt = (t) => s.P0 * Math.exp(s.r * t);
      const top = Math.max(Pt(10), Pt(0));
      if (s.log) P.setView(-0.4, 10.4, Math.min(Math.log(Pt(0)), Math.log(Pt(10))) - 1, Math.max(Math.log(Pt(0)), Math.log(Pt(10))) + 1);
      else P.setView(-0.4, 10.4, -top * 0.06, top * 1.12);
      P.o.ylabel = s.log ? 'ln P' : 'P';
      const T = Math.log(2) / Math.abs(s.r);
      P.draw((p) => {
        if (s.r !== 0 && T < 10) {
          for (let k = 1; k * T <= 10; k++) {
            const t = k * T, y = s.log ? Math.log(Pt(t)) : Pt(t);
            p.line(t, s.log ? p.v.ymin : 0, t, y, { color: 2, width: 1.2, dash: [3, 4] });
            p.point(t, y, { color: 2, r: 4 });
            if (k <= 4) p.text(s.r > 0 ? `×${2 ** k}` : `÷${2 ** k}`, t, y, { dx: 6, dy: -10, color: 2 });
          }
        }
        p.fn((t) => (s.log ? Math.log(Pt(t)) : Pt(t)), { color: 1, width: 2.75, from: 0 });
        p.point(0, s.log ? Math.log(s.P0) : s.P0, { color: 1 });
      });
      const kind = s.r > 0 ? 'Doubling time' : 'Half-life';
      out.set(`$P(t) = ${num(s.P0)}\\,e^{${num(s.r)}t}$. ${s.r === 0 ? 'No growth: the curve is flat.' : `${kind} $= \\dfrac{\\ln 2}{|r|} \\approx ${num(T)}$ years. Every ${num(T)} years the amount ${s.r > 0 ? 'doubles' : 'halves'}, no matter where you start.`} ${s.log ? 'On a log scale the curve becomes a straight line with slope $r$.' : ''}`);
    }
    update();
  });

  /* ---- Unit circle → sine and cosine waves ---- */
  const EXACT = {
    0: ['1', '0'], 30: ['\\tfrac{\\sqrt3}{2}', '\\tfrac12'], 45: ['\\tfrac{\\sqrt2}{2}', '\\tfrac{\\sqrt2}{2}'], 60: ['\\tfrac12', '\\tfrac{\\sqrt3}{2}'], 90: ['0', '1'],
    120: ['-\\tfrac12', '\\tfrac{\\sqrt3}{2}'], 135: ['-\\tfrac{\\sqrt2}{2}', '\\tfrac{\\sqrt2}{2}'], 150: ['-\\tfrac{\\sqrt3}{2}', '\\tfrac12'], 180: ['-1', '0'],
    210: ['-\\tfrac{\\sqrt3}{2}', '-\\tfrac12'], 225: ['-\\tfrac{\\sqrt2}{2}', '-\\tfrac{\\sqrt2}{2}'], 240: ['-\\tfrac12', '-\\tfrac{\\sqrt3}{2}'], 270: ['0', '-1'],
    300: ['\\tfrac12', '-\\tfrac{\\sqrt3}{2}'], 315: ['\\tfrac{\\sqrt2}{2}', '-\\tfrac{\\sqrt2}{2}'], 330: ['\\tfrac{\\sqrt3}{2}', '-\\tfrac12'],
  };
  const RAD = { 0: '0', 30: '\\tfrac{\\pi}{6}', 45: '\\tfrac{\\pi}{4}', 60: '\\tfrac{\\pi}{3}', 90: '\\tfrac{\\pi}{2}', 120: '\\tfrac{2\\pi}{3}', 135: '\\tfrac{3\\pi}{4}', 150: '\\tfrac{5\\pi}{6}', 180: '\\pi', 210: '\\tfrac{7\\pi}{6}', 225: '\\tfrac{5\\pi}{4}', 240: '\\tfrac{4\\pi}{3}', 270: '\\tfrac{3\\pi}{2}', 300: '\\tfrac{5\\pi}{3}', 315: '\\tfrac{7\\pi}{4}', 330: '\\tfrac{11\\pi}{6}' };
  AM.widget('unitcircle', (host, o, { ui }) => {
    let th = Math.PI / 6, snap = true;
    const row = el('div', 'viz-row'); host.appendChild(row);
    const C = new Plot(row, { xmin: -1.35, xmax: 1.35, ymin: -1.35, ymax: 1.35, equal: true, aspect: 0.9, xstep: 0.5, label: 'Unit circle with draggable angle' });
    const W = new Plot(row, { xmin: -0.3, xmax: 2 * Math.PI + 0.3, ymin: -1.35, ymax: 1.35, aspect: 0.9, xstep: Math.PI / 2, ystep: 0.5,
      xfmt: (v) => ({ 0: '0', 1: 'π/2', 2: 'π', 3: '3π/2', 4: '2π' }[Math.round(v / (Math.PI / 2))] || ''), label: 'Sine and cosine waves' });
    const panel = ui.panel(host);
    ui.toggle(panel, { label: 'Snap to special angles', value: true, onChange: (v) => { snap = v; } });
    const anim = AM.animate(host, (dt) => { th = (th + dt * 0.8) % (2 * Math.PI); update(); });
    ui.player(panel, anim, false);
    ui.legend(host, [[1, '$\\cos\\theta$ = horizontal position'], [2, '$\\sin\\theta$ = vertical position']]);
    const out = ui.readout(host);
    C.handle({ get: () => [Math.cos(th), Math.sin(th)], color: 4, set: (x, y) => {
      th = Math.atan2(y, x); if (th < 0) th += 2 * Math.PI;
      if (snap) { const deg = (th * 180) / Math.PI; const near = Object.keys(EXACT).map(Number).concat(360).find((d) => Math.abs(d - deg) < 4); if (near != null) th = ((near % 360) * Math.PI) / 180; }
      update(); } });
    W.onClick = (x) => { th = Math.max(0, Math.min(2 * Math.PI, x)); update(); };
    function update() {
      const c = Math.cos(th), s = Math.sin(th);
      C.draw((p) => {
        p.circle(0, 0, 1, { color: 'axis', width: 1.5 });
        const n = 60, arc = []; for (let i = 0; i <= n; i++) arc.push([0.22 * Math.cos((th * i) / n), 0.22 * Math.sin((th * i) / n)]);
        p.path(arc, { color: 4, width: 1.5 });
        p.line(0, 0, c, s, { color: 'ink2', width: 1.5 });
        p.line(0, 0, c, 0, { color: 1, width: 4 });
        p.line(c, 0, c, s, { color: 2, width: 4 });
        p.text('θ', 0.3 * Math.cos(th / 2), 0.3 * Math.sin(th / 2), { color: 4, size: 13 });
      });
      W.draw((p) => {
        p.fn(Math.cos, { color: 1, width: 2, from: 0, to: 2 * Math.PI, alpha: 0.9 });
        p.fn(Math.sin, { color: 2, width: 2, from: 0, to: 2 * Math.PI, alpha: 0.9 });
        p.vline(th, { color: 4 });
        p.point(th, c, { color: 1 }); p.point(th, s, { color: 2 });
      });
      const deg = Math.round((th * 180) / Math.PI) % 360;
      const ex = EXACT[deg] && Math.abs((th * 180) / Math.PI - Math.round((th * 180) / Math.PI)) < 1e-6;
      out.set(ex
        ? `$\\theta = ${deg}^\\circ = ${RAD[deg]}$ rad. $\\cos\\theta = ${EXACT[deg][0]}$, $\\sin\\theta = ${EXACT[deg][1]}$.`
        : `$\\theta \\approx ${num((th * 180) / Math.PI)}^\\circ = ${num(th)}$ rad. $\\cos\\theta \\approx ${num(c)}$, $\\sin\\theta \\approx ${num(s)}$. Check: $\\cos^2\\theta + \\sin^2\\theta = 1$.`);
    }
    update();
  });

  /* ---- Truth tables and logical equivalence ---- */
  AM.widget('truthtable', (host, o, { ui }) => {
    const ops = {
      and: ['P \\land Q', (p, q) => p && q], or: ['P \\lor Q', (p, q) => p || q], imp: ['P \\Rightarrow Q', (p, q) => !p || q],
      notpq: ['\\lnot P \\lor Q', (p, q) => !p || q], conv: ['Q \\Rightarrow P', (p, q) => !q || p], contra: ['\\lnot Q \\Rightarrow \\lnot P', (p, q) => q || !p],
      nand: ['\\lnot (P \\land Q)', (p, q) => !(p && q)], dm: ['\\lnot P \\lor \\lnot Q', (p, q) => !p || !q], dmw: ['\\lnot P \\land \\lnot Q', (p, q) => !p && !q],
      iff: ['P \\Leftrightarrow Q', (p, q) => p === q], xor: ['P \\oplus Q', (p, q) => p !== q],
    };
    const options = Object.entries(ops).map(([k, [t]]) => [k, t]);
    const s = { A: 'imp', B: 'contra' };
    const panel = ui.panel(host);
    const plain = (t) => t.replace(/\\land/g, '∧').replace(/\\lor/g, '∨').replace(/\\lnot\s?/g, '¬').replace(/\\Rightarrow/g, '⇒').replace(/\\Leftrightarrow/g, '⇔').replace(/\\oplus/g, '⊕').replace(/\\/g, '');
    const mk = (lab, key) => ui.select(panel, { id: 'stmt-' + key, label: lab, options: options.map(([k, t]) => [k, plain(t)]), value: s[key], onChange: (v) => { s[key] = v; update(); } });
    mk('Statement A', 'A'); mk('Statement B', 'B');
    const tableWrap = el('div', 'viz-scroll'); host.insertBefore(tableWrap, panel);
    const out = ui.readout(host);
    const T = (b) => `<span style="color:var(${b ? '--good' : '--bad'});font-weight:600">${b ? 'T' : 'F'}</span>`;
    function update() {
      const rows = [[1, 1], [1, 0], [0, 1], [0, 0]].map(([p, q]) => [!!p, !!q]);
      const A = ops[s.A], B = ops[s.B]; const diff = [];
      tableWrap.innerHTML = `<table class="viz-table"><thead><tr><th>${AM.tex('P')}</th><th>${AM.tex('Q')}</th><th>${AM.tex(A[0])}</th><th>${AM.tex(B[0])}</th></tr></thead><tbody>${rows.map(([p, q], i) => {
        const a = A[1](p, q), b = B[1](p, q); if (a !== b) diff.push(i + 1);
        return `<tr style="${a !== b ? 'background:var(--bad-soft)' : ''}"><td>${T(p)}</td><td>${T(q)}</td><td>${T(a)}</td><td>${T(b)}</td></tr>`;
      }).join('')}</tbody></table>`;
      out.set(diff.length === 0
        ? `**Equivalent.** $${A[0]}$ and $${B[0]}$ agree in every row, so you can swap one for the other in any proof.`
        : `**Not equivalent.** They disagree in row${diff.length > 1 ? 's' : ''} ${diff.join(', ')} (shaded). One counterexample row is enough to show two statements differ.`);
    }
    update();
  });

  /* ---- Venn diagram with concrete elements ---- */
  AM.widget('venn', (host, o, { ui }) => {
    const U = Array.from({ length: 20 }, (_, i) => i + 1);
    const inA = (n) => n % 2 === 0, inB = (n) => n % 3 === 0;
    const ops = {
      union: ['A \\cup B', (a, b) => a || b, 'in A or B (or both)'],
      inter: ['A \\cap B', (a, b) => a && b, 'in both A and B'],
      diff: ['A \\setminus B', (a, b) => a && !b, 'in A but not in B'],
      bdiff: ['B \\setminus A', (a, b) => b && !a, 'in B but not in A'],
      sym: ['A \\,\\triangle\\, B', (a, b) => a !== b, 'in exactly one of A, B'],
      comp: ['(A \\cup B)^c', (a, b) => !(a || b), 'in neither A nor B'],
      compA: ['A^c', (a) => !a, 'not in A'],
    };
    let op = 'inter';
    const P = new Plot(host, { xmin: -3.2, xmax: 3.2, ymin: -1.9, ymax: 1.9, equal: true, grid: false, axes: false, aspect: 0.55, label: 'Venn diagram of sets A and B' });
    const panel = ui.panel(host);
    ui.seg(panel, { label: 'Operation', options: Object.entries(ops).map(([k, v]) => [k, `$${v[0]}$`]), value: op, onChange: (v) => { op = v; update(); } });
    const out = ui.readout(host);
    const cA = [-0.75, 0], cB = [0.75, 0], R = 1.35;
    const isIn = (x, y, c) => (x - c[0]) ** 2 + (y - c[1]) ** 2 < R * R;
    // place each number in its region on a simple layout
    const spots = { a: [], b: [], ab: [], none: [] };
    U.forEach((n) => { const a = inA(n), b = inB(n); spots[a && b ? 'ab' : a ? 'a' : b ? 'b' : 'none'].push(n); });
    const layout = (list, x0, y0, cols, dx = 0.42, dy = 0.42) => list.map((n, i) => [n, x0 + (i % cols) * dx, y0 - Math.floor(i / cols) * dy]);
    const placed = [...layout(spots.a, -1.75, 0.65, 3), ...layout(spots.ab, -0.21, 0.4, 2), ...layout(spots.b, 0.95, 0.4, 2), ...layout(spots.none, -2.9, -1.55, 14, 0.42)];
    function update() {
      const [tex, pred, words] = ops[op];
      P.draw((p) => {
        p.heat((x, y) => (pred(isIn(x, y, cA), isIn(x, y, cB)) ? 1 : 0), { diverging: false, range: [0, 1], high: p.color(1), strength: 0.32, cell: 3 });
        p.rect(p.v.xmin + 0.05, p.v.ymin + 0.05, p.v.xmax - 0.05, p.v.ymax - 0.05, { fill: 'bg', fillAlpha: 0, stroke: 'axis', width: 1.2 });
        p.circle(cA[0], cA[1], R, { color: 1, width: 2 }); p.circle(cB[0], cB[1], R, { color: 2, width: 2 });
        p.text('A: even', cA[0] - 1.0, 1.55, { color: 1, size: 13, weight: 700 });
        p.text('B: multiples of 3', cB[0] - 0.2, 1.55, { color: 2, size: 13, weight: 700 });
        p.text('U = {1, …, 20}', p.v.xmax - 0.1, p.v.ymax - 0.18, { align: 'right', color: 'muted' });
        placed.forEach(([n, x, y]) => { const hit = pred(inA(n), inB(n)); p.text(String(n), x, y, { align: 'center', size: hit ? 14 : 12, weight: hit ? 700 : 400, color: hit ? 'ink' : 'muted' }); });
      });
      const members = U.filter((n) => pred(inA(n), inB(n)));
      out.set(`$${tex}$ means everything ${words}: $\\{${members.join(', ')}\\}$, which has ${members.length} element${members.length === 1 ? '' : 's'}.`);
    }
    update();
  });

  /* ---- Induction: staircase sums, 1 + 2 + … + n ---- */
  AM.widget('induction', (host, o, { ui }) => {
    let n = 5, copy = true;
    const P = new Plot(host, { xmin: -0.6, xmax: 13.6, ymin: -0.6, ymax: 13.6, equal: true, grid: false, axes: false, aspect: 0.62, label: 'Staircase of blocks showing the sum 1 + 2 + … + n' });
    const panel = ui.panel(host);
    const sn = ui.slider(panel, { label: '$n$', min: 1, max: 12, step: 1, value: 5, fmt: (v) => String(v), onInput: (v) => { n = v; update(); } });
    ui.toggle(panel, { label: 'Show the flipped copy', value: true, onChange: (v) => { copy = v; update(); } });
    ui.button(panel, 'Inductive step: $n \\to n+1$', () => { if (n < 12) { n++; sn.set(n); update(); } });
    const out = ui.readout(host);
    function update() {
      P.setView(-0.6, n + 1.6, -0.6, n + 1.6);
      P.draw((p) => {
        for (let col = 1; col <= n; col++) for (let r = 0; r < col; r++) {
          const last = col === n;
          p.rect(col - 1 + 0.06, r + 0.06, col - 0.06, r + 0.94, { fill: last ? 2 : 1, fillAlpha: last ? 0.75 : 0.55, stroke: false });
          if (copy) p.rect(col - 1 + 0.06, n - r + 0.06, col - 0.06, n - r + 0.94, { fill: 3, fillAlpha: 0.22, stroke: false });
        }
        if (copy) p.rect(0, 0, n, n + 1, { fill: 'bg', fillAlpha: 0, stroke: 'ink2', width: 1.2, dash: [4, 4] });
        p.text(`${n}`, n / 2, -0.32, { align: 'center', color: 'ink2' });
        if (copy) p.text(`${n + 1}`, n + 0.3, (n + 1) / 2, { color: 'ink2' });
      });
      out.set(`$1 + 2 + \\cdots + ${n} = ${(n * (n + 1)) / 2}$. ${copy ? `Two staircases make a ${n} by ${n + 1} rectangle, so one staircase is $\\frac{${n}\\cdot${n + 1}}{2} = ${(n * (n + 1)) / 2}$.` : ''} The orange column is the inductive step: going from $n-1$ to $n$ adds exactly $n$ blocks.`);
    }
    update();
  });
})();
