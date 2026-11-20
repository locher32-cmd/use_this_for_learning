/* Visuals for the Basics stage (modules B1–B4): step-by-step working, number line, area model,
   inequality line, shapes, right triangle, dot plot of data, and a dice simulator. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, fmt = (v, d = 3) => AM.fmt(v, d);

  /* ---- Step-by-step working: opts.items = [{ label, steps: [[tex, note], ...] }] ---- */
  AM.widget('opsteps', (host, o, { ui }) => {
    const items = o.items || [], s = { i: 0, k: 0 };
    const panel = ui.panel(host);
    ui.select(panel, { id: 'pick', label: o.pickLabel || 'Choose an example', options: items.map((it, i) => [String(i), it.label]), value: '0', onChange: (v) => { s.i = +v; s.k = 0; update(); } });
    ui.button(panel, 'Next step', () => { s.k = Math.min(items[s.i].steps.length - 1, s.k + 1); update(); }, 'btn-primary');
    ui.button(panel, 'Show all', () => { s.k = items[s.i].steps.length - 1; update(); });
    ui.button(panel, 'Start again', () => { s.k = 0; update(); });
    const box = AM.el('div', 'opsteps'); host.insertBefore(box, panel);
    const out = ui.readout(host);
    function update() {
      const st = items[s.i].steps;
      box.innerHTML = st.slice(0, s.k + 1).map(([t, note], j) => `<div class="opstep${j === s.k ? ' cur' : ''}"><span class="opstep-n">${j === 0 ? 'Start' : 'Step ' + j}</span><span class="opstep-m">${AM.tex(t, false)}</span><span class="opstep-note">${AM.mdi(note || '')}</span></div>`).join('');
      out.set(s.k < st.length - 1 ? `Step ${s.k} of ${st.length - 1}. Press **Next step** to see what happens next.` : `Done in ${st.length - 1} step${st.length === 2 ? '' : 's'}. Pick another example, or try the practice problems below.`);
    }
    update();
  });

  /* ---- Number line: adding and subtracting signed numbers ---- */
  AM.widget('numberline', (host, o, { ui }) => {
    const s = { a: 3, b: -7, op: '+' };
    const P = new Plot(host, { xmin: -21, xmax: 21, ymin: -1.6, ymax: 2.6, grid: false, axes: false, aspect: 0.28, minH: 150, label: 'Number line' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'a', label: 'Start at $a$', min: -10, max: 10, step: 1, value: s.a, fmt: String, onInput: (v) => { s.a = v; update(); } });
    ui.seg(panel, { id: 'op', label: 'Operation', options: [['+', 'Add'], ['-', 'Subtract']], value: s.op, onChange: (v) => { s.op = v; update(); } });
    ui.slider(panel, { id: 'b', label: 'Number $b$', min: -10, max: 10, step: 1, value: s.b, fmt: String, onInput: (v) => { s.b = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const { a, b, op } = s, move = op === '+' ? b : -b, r = a + move;
      P.draw((p) => {
        p.line(-20.5, 0, 20.5, 0, { color: 'ink2', width: 2 });
        for (let x = -20; x <= 20; x++) {
          const big = x % 5 === 0; p.line(x, big ? -0.35 : -0.18, x, big ? 0.35 : 0.18, { color: 'ink2', width: big ? 1.5 : 1 });
          if (big) p.text(String(x), x, -0.85, { align: 'center', color: x === 0 ? 'ink' : 'muted', size: 12, weight: x === 0 ? 700 : 500 });
        }
        p.point(a, 0, { color: 1, r: 6 });
        p.text('start', a, 0.75, { align: 'center', color: 1, size: 12 });
        if (move) p.arrow(a, 1.6, r, 1.6, { color: move > 0 ? 3 : 2, width: 3 });
        p.point(r, 0, { color: move > 0 ? 3 : 2, r: 6 });
        p.text(String(r), r, -1.35, { align: 'center', color: 'ink', size: 14, weight: 700 });
      });
      const sb = b < 0 ? `(${b})` : `${b}`;
      let why;
      if (op === '+') why = b > 0 ? `Adding a positive number moves right ${b}.` : b < 0 ? `Adding a negative number moves **left** ${-b}: adding $${sb}$ is the same as subtracting ${-b}.` : 'Adding zero does nothing.';
      else why = b > 0 ? `Subtracting a positive number moves left ${b}.` : b < 0 ? `Subtracting a negative number moves **right** ${-b}: taking away a debt leaves you better off, so $- ${sb}$ is the same as $+ ${-b}$.` : 'Subtracting zero does nothing.';
      out.set(`$${a} ${op} ${sb} = ${r}$. ${why}`);
    }
    update();
  });

  /* ---- Area model for expanding (ax + b)(cx + d) ---- */
  AM.widget('areamodel', (host, o, { ui }) => {
    const s = { a: 1, b: 3, c: 1, d: 2 }, X = 2.5;
    const P = new Plot(host, { xmin: -1, xmax: 14, ymin: -1, ymax: 12, equal: true, grid: false, axes: false, aspect: 0.62, label: 'Area model' });
    const panel = ui.panel(host);
    [['a', 'Number of $x$ across', 1, 3], ['b', 'Ones across', 0, 5], ['c', 'Number of $x$ down', 1, 3], ['d', 'Ones down', 0, 5]].forEach(([id, label, min, max]) =>
      ui.slider(panel, { id, label, min, max, step: 1, value: s[id], fmt: String, onInput: (v) => { s[id] = v; update(); } }));
    const out = ui.readout(host);
    function update() {
      const { a, b, c, d } = s, W = a * X + b, H = c * X + d;
      P.setView(-1.6, Math.max(W + 1, 9), -0.8, Math.max(H + 1.4, 7));
      const cols = [...Array(a).fill(X), ...Array(b).fill(1)], rows = [...Array(c).fill(X), ...Array(d).fill(1)];
      P.draw((p) => {
        let y = H;
        rows.forEach((rh, ri) => {
          let x = 0;
          cols.forEach((cw, ci) => {
            const kind = (cw === X ? 1 : 0) + (rh === X ? 1 : 0);
            p.rect(x, y - rh, x + cw, y, { fill: kind === 2 ? 1 : kind === 1 ? 2 : 3, fillAlpha: 0.55, stroke: 'bg', width: 1.5 });
            if (cw > 0.9 && rh > 0.9) p.text(kind === 2 ? 'x²' : kind === 1 ? 'x' : '1', x + cw / 2, y - rh / 2, { align: 'center', color: 'ink', size: kind === 0 ? 11 : 14, weight: 700 });
            x += cw;
          });
          y -= rh;
        });
        let x = 0; cols.forEach((cw) => { p.text(cw === X ? 'x' : '1', x + cw / 2, H + 0.5, { align: 'center', color: 'ink2', size: 13 }); x += cw; });
        y = H; rows.forEach((rh) => { p.text(rh === X ? 'x' : '1', -0.6, y - rh / 2, { align: 'center', color: 'ink2', size: 13 }); y -= rh; });
      });
      const f1 = AM.poly([a, b]), f2 = AM.poly([c, d]);
      out.set(`$(${f1})(${f2}) = ${AM.poly([a * c, a * d + b * c, b * d])}$. Count the pieces: ${a * c} blue $x^2$ square${a * c === 1 ? '' : 's'}, ${a * d + b * c} orange $x$ strip${a * d + b * c === 1 ? '' : 's'}, and ${b * d} green unit square${b * d === 1 ? '' : 's'}. Every piece of the first bracket meets every piece of the second.`);
    }
    update();
  });

  /* ---- Inequality on a number line: solve ax + b (<,≤,>,≥) c ---- */
  AM.widget('ineqline', (host, o, { ui }) => {
    const s = { a: 2, b: 1, c: 7, rel: '<' };
    const P = new Plot(host, { xmin: -11, xmax: 11, ymin: -1.4, ymax: 1.4, grid: false, axes: false, aspect: 0.22, minH: 130, label: 'Inequality number line' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'a', label: '$a$ (number of $x$)', min: -4, max: 4, step: 1, value: s.a, fmt: String, onInput: (v) => { s.a = v === 0 ? 1 : v; update(); } });
    ui.slider(panel, { id: 'b', label: '$b$', min: -8, max: 8, step: 1, value: s.b, fmt: String, onInput: (v) => { s.b = v; update(); } });
    ui.seg(panel, { id: 'rel', label: 'Sign', options: [['<', '$<$'], ['<=', '$\\le$'], ['>', '$>$'], ['>=', '$\\ge$']], value: s.rel, onChange: (v) => { s.rel = v; update(); } });
    ui.slider(panel, { id: 'c', label: '$c$', min: -10, max: 10, step: 1, value: s.c, fmt: String, onInput: (v) => { s.c = v; update(); } });
    const out = ui.readout(host);
    const T = { '<': '<', '<=': '\\le', '>': '>', '>=': '\\ge' }, FLIP = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' };
    function update() {
      const { a, b, c, rel } = s, edge = (c - b) / a, r2 = a < 0 ? FLIP[rel] : rel, right = r2[0] === '>', closed = r2.length === 2;
      P.draw((p) => {
        p.line(-10.6, 0, 10.6, 0, { color: 'ink2', width: 2 });
        for (let x = -10; x <= 10; x++) { p.line(x, -0.15, x, 0.15, { color: 'ink2', width: 1 }); if (x % 2 === 0) p.text(String(x), x, -0.7, { align: 'center', color: 'muted', size: 11 }); }
        const e = Math.max(-10.5, Math.min(10.5, edge));
        p.line(e, 0, right ? 10.6 : -10.6, 0, { color: 1, width: 7 });
        p.point(e, 0, { color: 1, r: 7, hollow: !closed });
        p.text(`x ${r2.replace('<=', '≤').replace('>=', '≥')} ${AM.fmt(edge, 3)}`, e, 0.8, { align: 'center', color: 1, size: 13, weight: 700 });
      });
      const lhs = `${AM.co(a, 'x')} ${AM.sgn(b)}`.replace(' + 0', '').replace(' - 0', '');
      out.set(`$${lhs} ${T[rel]} ${c}$. ${b ? `${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)} on both sides: $${AM.co(a, 'x')} ${T[rel]} ${c - b}$. ` : ''}Divide by ${a}: $x ${T[r2]} ${AM.fmt(edge, 3)}$.${a < 0 ? ' **The sign flipped** because you divided by a negative number.' : ''} ${closed ? 'The filled dot means the edge value is included.' : 'The hollow dot means the edge value is not included.'}`);
    }
    update();
  });

  /* ---- Shapes: perimeter and area ---- */
  AM.widget('shapes', (host, o, { ui }) => {
    const s = { shape: 'rect', w: 6, h: 4 };
    const P = new Plot(host, { xmin: -1, xmax: 11, ymin: -1, ymax: 9, equal: true, xstep: 1, ystep: 1, aspect: 0.62, label: 'Shapes on a grid' });
    const panel = ui.panel(host);
    ui.seg(panel, { id: 'shape', label: 'Shape', options: [['rect', 'Rectangle'], ['tri', 'Triangle'], ['circle', 'Circle']], value: s.shape, onChange: (v) => { s.shape = v; update(); } });
    const sw = ui.slider(panel, { id: 'w', label: 'Width (or radius)', min: 1, max: 9, step: 1, value: s.w, fmt: String, onInput: (v) => { s.w = v; update(); } });
    ui.slider(panel, { id: 'h', label: 'Height', min: 1, max: 8, step: 1, value: s.h, fmt: String, onInput: (v) => { s.h = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const { shape, w, h } = s;
      if (shape === 'circle') { const r = Math.min(w, 4.5); P.setView(-r - 1, r + 1.5, -r - 1, r + 1); }
      else P.setView(-1, Math.max(10, w + 1), -1, Math.max(8, h + 1));
      P.draw((p) => {
        if (shape === 'rect') { p.rect(0, 0, w, h, { fill: 1, fillAlpha: 0.3, color: 1, width: 2.5 }); p.text(`${w}`, w / 2, -0.45, { align: 'center', color: 'ink', size: 13, weight: 700 }); p.text(`${h}`, w + 0.4, h / 2, { color: 'ink', size: 13, weight: 700 }); }
        else if (shape === 'tri') { p.poly([[0, 0], [w, 0], [w * 0.35, h]], { fill: 2, fillAlpha: 0.3, color: 2, width: 2.5 }); p.line(w * 0.35, 0, w * 0.35, h, { color: 'muted', dash: [5, 4], width: 1.5 }); p.text(`base ${w}`, w / 2, -0.45, { align: 'center', color: 'ink', size: 13, weight: 700 }); p.text(`height ${h}`, w * 0.35 + 0.2, h / 2, { color: 'ink', size: 12, weight: 700 }); }
        else { const r = Math.min(w, 4.5); p.circle(0, 0, r, { fill: 3, fillAlpha: 0.3, color: 3, width: 2.5 }); p.line(0, 0, r, 0, { color: 'ink', width: 2 }); p.point(0, 0, { color: 'ink', r: 3 }); p.text(`r = ${r}`, r / 2, 0.4, { align: 'center', color: 'ink', size: 13, weight: 700 }); }
      });
      if (shape === 'rect') out.set(`**Area** = width × height $= ${w}\\times${h} = ${w * h}$ squares (count them on the grid). **Perimeter** = distance around $= 2(${w} + ${h}) = ${2 * (w + h)}$.`);
      else if (shape === 'tri') { const L = Math.hypot(w * 0.35, h), R = Math.hypot(w * 0.65, h); out.set(`**Area** $= \\frac12\\times\\text{base}\\times\\text{height} = \\frac12\\times${w}\\times${h} = ${fmt(w * h / 2)}$: exactly half the rectangle around it. **Perimeter** = the three sides added: $${w} + ${fmt(L, 2)} + ${fmt(R, 2)} \\approx ${fmt(w + L + R, 2)}$. The height is measured straight up, not along a sloping side.`); }
      else { const r = Math.min(w, 4.5); out.set(`**Area** $= \\pi r^2 = \\pi\\times${r}^2 \\approx ${fmt(Math.PI * r * r, 2)}$. **Circumference** (perimeter) $= 2\\pi r \\approx ${fmt(2 * Math.PI * r, 2)}$. Doubling the radius makes the area four times bigger.`); }
      sw.el.querySelector('.ctl-label').textContent = shape === 'circle' ? 'Radius' : shape === 'tri' ? 'Base' : 'Width';
    }
    update();
  });

  /* ---- Right triangle: Pythagoras and SOH CAH TOA ---- */
  AM.widget('righttri', (host, o, { ui }) => {
    const s = { a: 4, b: 3 };
    const P = new Plot(host, { xmin: -1, xmax: 10, ymin: -1, ymax: 8, equal: true, grid: false, axes: false, aspect: 0.6, label: 'Right triangle' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'a', label: 'Adjacent side (across)', min: 1, max: 9, step: 0.5, value: s.a, onInput: (v) => { s.a = v; update(); } });
    ui.slider(panel, { id: 'b', label: 'Opposite side (up)', min: 1, max: 7, step: 0.5, value: s.b, onInput: (v) => { s.b = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const { a, b } = s, c = Math.hypot(a, b), th = Math.atan2(b, a);
      P.setView(-1.2, Math.max(a + 2.5, 8), -1.2, Math.max(b + 1, 5));
      P.draw((p) => {
        p.poly([[0, 0], [a, 0], [a, b]], { fill: 1, fillAlpha: 0.14, stroke: false });
        p.line(0, 0, a, 0, { color: 3, width: 3.5 }); p.line(a, 0, a, b, { color: 2, width: 3.5 }); p.line(0, 0, a, b, { color: 1, width: 3.5 });
        const q = 0.45; p.poly([[a - q, 0], [a - q, q], [a, q], [a, 0]], { fill: 'bg', fillAlpha: 0, color: 'ink2', width: 1.25 });
        const arc = []; for (let i = 0; i <= 20; i++) { const t = (th * i) / 20; arc.push([1.1 * Math.cos(t), 1.1 * Math.sin(t)]); } p.path(arc, { color: 'ink', width: 1.5 });
        p.text('θ', 1.5 * Math.cos(th / 2), 1.5 * Math.sin(th / 2), { align: 'center', color: 'ink', size: 14, weight: 700 });
        p.text(`adjacent ${fmt(a, 2)}`, a / 2, -0.5, { align: 'center', color: 3, size: 12, weight: 700 });
        p.text(`opposite ${fmt(b, 2)}`, a + 0.25, b / 2, { color: 2, size: 12, weight: 700 });
        p.text(`hypotenuse ${fmt(c, 3)}`, a / 2 - 0.3, b / 2 + 0.3, { align: 'right', color: 1, size: 12, weight: 700 });
      });
      out.set(`**Pythagoras:** $${fmt(a, 2)}^2 + ${fmt(b, 2)}^2 = ${fmt(a * a + b * b, 3)}$, so the hypotenuse is $\\sqrt{${fmt(a * a + b * b, 3)}} \\approx ${fmt(c, 3)}$. **Angle** $\\theta \\approx ${fmt((th * 180) / Math.PI, 1)}^\\circ$: $\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}} \\approx ${fmt(b / c, 3)}$, $\\cos\\theta = \\frac{\\text{adj}}{\\text{hyp}} \\approx ${fmt(a / c, 3)}$, $\\tan\\theta = \\frac{\\text{opp}}{\\text{adj}} \\approx ${fmt(b / a, 3)}$.`);
    }
    update();
  });

  /* ---- Dot plot of six values with mean and median ---- */
  AM.widget('dotplot', (host, o, { ui }) => {
    const s = { v: [3, 5, 5, 6, 8, 15] };
    const P = new Plot(host, { xmin: -1, xmax: 21, ymin: -1.2, ymax: 4.6, grid: false, axes: false, aspect: 0.32, minH: 170, label: 'Dot plot' });
    const panel = ui.panel(host);
    s.v.forEach((val, i) => ui.slider(panel, { id: 'v' + i, label: `Value ${i + 1}`, min: 0, max: 20, step: 1, value: val, fmt: String, onInput: (x) => { s.v[i] = x; update(); } }));
    const out = ui.readout(host);
    ui.legend(host, [[1, 'data'], [2, 'mean (balance point)'], [3, 'median (middle value)']]);
    function update() {
      const v = s.v.slice(), sorted = v.slice().sort((x, y) => x - y), n = v.length, mean = v.reduce((x, y) => x + y, 0) / n, med = (sorted[2] + sorted[3]) / 2;
      const counts = {}; v.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });
      const top = Math.max(...Object.values(counts)), modes = Object.keys(counts).filter((k) => counts[k] === top).map(Number);
      P.draw((p) => {
        p.line(-0.5, 0, 20.5, 0, { color: 'ink2', width: 2 });
        for (let x = 0; x <= 20; x++) { p.line(x, -0.12, x, 0.12, { color: 'ink2', width: 1 }); if (x % 5 === 0) p.text(String(x), x, -0.6, { align: 'center', color: 'muted', size: 11 }); }
        const seen = {}; v.forEach((x) => { seen[x] = (seen[x] || 0) + 1; p.point(x, 0.1 + seen[x] * 0.7, { color: 1, r: 8 }); });
        p.line(mean, -0.2, mean, 4.2, { color: 2, width: 2.5 }); p.line(med, -0.2, med, 4.2, { color: 3, width: 2.5, dash: [6, 4] });
      });
      out.set(`Sorted: ${sorted.join(', ')}. **Mean** $= \\frac{${v.join(' + ')}}{${n}} = ${fmt(mean, 3)}$. **Median** = middle of the sorted list $= \\frac{${sorted[2]} + ${sorted[3]}}{2} = ${fmt(med, 2)}$. **Mode** = most common: ${top > 1 ? modes.join(' and ') : 'none (every value appears once)'}. **Range** $= ${sorted[n - 1]} - ${sorted[0]} = ${sorted[n - 1] - sorted[0]}$. Drag one value far to the right: the mean follows it, the median barely moves.`);
    }
    update();
  });

  /* ---- Dice: experimental frequencies approaching the theoretical probabilities ---- */
  AM.widget('dice', (host, o, { ui }) => {
    const s = { mode: 'one', rolls: [] };
    const P = new Plot(host, { xmin: 0, xmax: 13, ymin: -0.04, ymax: 0.4, grid: true, xstep: 1, ystep: 0.1, aspect: 0.45, label: 'Dice frequencies' });
    const panel = ui.panel(host);
    ui.seg(panel, { id: 'mode', label: 'Experiment', options: [['one', 'One die'], ['two', 'Total of two dice']], value: s.mode, onChange: (v) => { s.mode = v; s.rolls = []; update(); } });
    const roll = (k) => { for (let i = 0; i < k; i++) { const d = () => 1 + Math.floor(Math.random() * 6); s.rolls.push(s.mode === 'one' ? d() : d() + d()); } update(); };
    ui.button(panel, 'Roll 1', () => roll(1)); ui.button(panel, 'Roll 10', () => roll(10)); ui.button(panel, 'Roll 100', () => roll(100), 'btn-primary'); ui.button(panel, 'Reset', () => { s.rolls = []; update(); });
    const out = ui.readout(host);
    ui.legend(host, [[1, 'what you rolled (fraction of rolls)'], [2, 'what probability predicts']]);
    function update() {
      const one = s.mode === 'one', lo = one ? 1 : 2, hi = one ? 6 : 12, n = s.rolls.length;
      const theo = (k) => (one ? 1 / 6 : (6 - Math.abs(k - 7)) / 36);
      P.setView(lo - 1, hi + 1, -0.03, one ? 0.42 : 0.3);
      P.draw((p) => {
        for (let k = lo; k <= hi; k++) {
          const f = n ? s.rolls.filter((x) => x === k).length / n : 0;
          p.rect(k - 0.35, 0, k + 0.35, f, { fill: 1, fillAlpha: 0.6, stroke: false });
          p.line(k - 0.45, theo(k), k + 0.45, theo(k), { color: 2, width: 3 });
        }
      });
      const k7 = one ? 6 : 7, f7 = n ? s.rolls.filter((x) => x === k7).length / n : 0;
      out.set(n ? `${n} roll${n === 1 ? '' : 's'} so far. ${one ? 'Each face' : 'A total of 7'} should come up ${one ? '$\\frac16 \\approx 0.167$' : '$\\frac{6}{36} \\approx 0.167$'} of the time; you got ${k7}s in $${fmt(f7, 3)}$ of rolls. With a few rolls the bars jump around; with hundreds they settle onto the predicted lines.${one ? '' : ' Totals near 7 are common because more pairs add up to them (1+6, 2+5, 3+4, ...).'}` : 'Press **Roll 100** to start. The orange lines show what probability predicts.');
    }
    update();
  });
})();
