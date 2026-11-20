/* Visuals for Module 00 (Math Basics): fraction bars and an equation balance. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, gcd = AM.m.gcd;
  const lcm = (a, b) => (a * b) / gcd(a, b);

  /* ---- Fraction bars ---- */
  AM.widget('fractionbar', (host, o, { ui }) => {
    const s = { a: 1, b: 2, c: 1, d: 3, op: '+' };
    const P = new Plot(host, { xmin: -0.05, xmax: 1.35, ymin: -0.2, ymax: 3.6, grid: false, axes: false, aspect: 0.5, label: 'Fraction bars' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'a', label: 'First fraction: top', min: 0, max: 12, step: 1, value: s.a, fmt: String, onInput: (v) => { s.a = v; update(); } });
    ui.slider(panel, { id: 'b', label: 'First fraction: bottom', min: 1, max: 12, step: 1, value: s.b, fmt: String, onInput: (v) => { s.b = v; update(); } });
    ui.slider(panel, { id: 'c', label: 'Second fraction: top', min: 0, max: 12, step: 1, value: s.c, fmt: String, onInput: (v) => { s.c = v; update(); } });
    ui.slider(panel, { id: 'd', label: 'Second fraction: bottom', min: 1, max: 12, step: 1, value: s.d, fmt: String, onInput: (v) => { s.d = v; update(); } });
    ui.seg(panel, { id: 'op', label: 'Operation', options: [['+', 'Add'], ['-', 'Subtract'], ['*', 'Multiply']], value: s.op, onChange: (v) => { s.op = v; update(); } });
    const out = ui.readout(host);
    function bar(p, y, num, den, col, label) {
      const whole = Math.max(1, Math.ceil(num / den - 1e-9));
      for (let w = 0; w < whole; w++) for (let i = 0; i < den; i++) {
        const k = w * den + i, x0 = (w + i / den) * (1 / whole) * 1.2 / 1, x1 = (w + (i + 1) / den) * (1 / whole) * 1.2;
        p.rect(x0, y, x1, y + 0.55, { fill: k < num ? col : 'bg', fillAlpha: k < num ? 0.75 : 1, stroke: 'ink2', width: 1 });
      }
      p.text(label, 1.24, y + 0.27, { color: 'ink', size: 14, weight: 700 });
    }
    function update() {
      const { a, b, c, d, op } = s, L = lcm(b, d), A = a * (L / b), Cn = c * (L / d);
      let rn, rd, steps;
      if (op === '*') { rn = a * c; rd = b * d; steps = `Multiply tops and bottoms: $\\frac{${a}}{${b}}\\times\\frac{${c}}{${d}} = \\frac{${a}\\times${c}}{${b}\\times${d}} = \\frac{${rn}}{${rd}}$`; }
      else { rn = op === '+' ? A + Cn : A - Cn; rd = L; steps = `Cut both into ${L}ths (the common denominator): $\\frac{${a}}{${b}} = \\frac{${A}}{${L}}$ and $\\frac{${c}}{${d}} = \\frac{${Cn}}{${L}}$. Then ${op === '+' ? 'add' : 'subtract'} the tops: $\\frac{${A} ${op} ${Cn}}{${L}} = \\frac{${rn}}{${L}}$`; }
      const g = gcd(Math.abs(rn), rd) || 1, simp = `${rn < 0 ? '-' : ''}\\frac{${Math.abs(rn) / g}}{${rd / g}}`;
      P.draw((p) => {
        bar(p, 2.9, a, b, 1, `${a}/${b}`);
        bar(p, 2.1, c, d, 2, `${c}/${d}`);
        if (op !== '*') { bar(p, 1.1, A, L, 1, `${A}/${L}`); bar(p, 0.4, Cn, L, 2, `${Cn}/${L}`); }
        else bar(p, 0.75, Math.max(0, rn), rd, 3, `${rn}/${rd}`);
      });
      out.set(`${steps}${g > 1 && rn ? `, which simplifies to $${simp}$` : ''}. As a decimal: $${AM.fmt(rn / rd, 4)}$, as a percentage: $${AM.fmt((100 * rn) / rd, 2)}\\%$.${op !== '*' ? ' The bottom two bars show both fractions cut into equal-size pieces, which is why you can now add or subtract the pieces directly.' : ''}`);
    }
    update();
  });

  /* ---- Balance scale for solving ax + b = c ---- */
  AM.widget('balance', (host, o, { ui }) => {
    const s = { a: 3, b: 4, x: 2, step: 0 };
    const P = new Plot(host, { xmin: -5, xmax: 5, ymin: -0.6, ymax: 4, equal: true, grid: false, axes: false, aspect: 0.5, label: 'Balance scale' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'a', label: 'Number of $x$ boxes', min: 1, max: 5, step: 1, value: s.a, fmt: String, onInput: (v) => { s.a = v; s.step = 0; update(); } });
    ui.slider(panel, { id: 'b', label: 'Extra weights on the left', min: 0, max: 8, step: 1, value: s.b, fmt: String, onInput: (v) => { s.b = v; s.step = 0; update(); } });
    ui.slider(panel, { id: 'x', label: 'Secret value of $x$', min: 1, max: 4, step: 1, value: s.x, fmt: String, onInput: (v) => { s.x = v; s.step = 0; update(); } });
    ui.button(panel, 'Next step', () => { s.step = Math.min(2, s.step + 1); update(); }, 'btn-primary');
    ui.button(panel, 'Start again', () => { s.step = 0; update(); });
    const out = ui.readout(host);
    function pile(p, cx, items, y) { // items: array of 'x' or 1
      const perRow = 4; items.forEach((it, i) => { const col = i % perRow, row = Math.floor(i / perRow), x = cx - 1.5 + col * 1.0 + 0.5 - 0.5, yy = y + row * 0.85;
        if (it === 'x') { p.rect(x - 0.38, yy, x + 0.38, yy + 0.75, { fill: 1, fillAlpha: 0.8, stroke: 1 }); p.text('x', x, yy + 0.38, { align: 'center', color: 'bg', size: 15, weight: 700, halo: false }); }
        else { p.circle(x, yy + 0.3, 0.28, { fill: 2, fillAlpha: 0.85, color: 2, width: 1 }); p.text('1', x, yy + 0.3, { align: 'center', color: 'bg', size: 12, weight: 700, halo: false }); }
      }); }
    function update() {
      const { a, b, x, step } = s, c = a * x + b;
      let left, right, eq, say;
      if (step === 0) { left = [...Array(a).fill('x'), ...Array(b).fill(1)]; right = Array(c).fill(1); eq = `${a === 1 ? '' : a}x + ${b} = ${c}`; say = `The scale balances, so both sides weigh the same: $${eq}$. Goal: get $x$ alone on one side. Press **Next step**.`; }
      else if (step === 1) { left = Array(a).fill('x'); right = Array(c - b).fill(1); eq = `${a === 1 ? '' : a}x = ${c - b}`; say = `Take ${b} weight${b === 1 ? '' : 's'} off **both** sides, so it still balances: $${eq}$. Whatever you do to one side, do to the other.`; }
      else { left = ['x']; right = Array(x).fill(1); eq = `x = ${x}`; say = `Split both sides into ${a} equal group${a === 1 ? '' : 's'} (divide by ${a}): $x = \\frac{${c - b}}{${a}} = ${x}$. Check: $${a}(${x}) + ${b} = ${c}$. ✓`; }
      const rows = Math.ceil(Math.max(left.length, right.length) / 4);
      P.setView(-5, 5, -0.6, Math.max(4, rows * 0.85 + 1));
      P.draw((p) => {
        p.poly([[0, 0.4], [-0.6, -0.5], [0.6, -0.5]], { fill: 'ink2', fillAlpha: 0.6, stroke: false });
        p.line(-4.6, 0.45, 4.6, 0.45, { color: 'ink2', width: 4 });
        pile(p, -2.6, left, 0.55); pile(p, 2.6, right, 0.55);
      });
      out.set(say);
    }
    update();
  });
})();
