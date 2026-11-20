/* Visuals for Probability and Statistics. */
(function () {
  'use strict';
  const AM = window.AM, Plot = AM.Plot, M = AM.m, n2 = (v) => AM.fmt(v, 2), n3 = (v) => AM.fmt(v, 3), n4 = (v) => AM.fmt(v, 4);
  const rnd = Math.random;

  /* ---- Law of large numbers ---- */
  AM.widget('lln', (host, o, { ui }) => {
    const EV = {
      coin: ['A coin lands heads', 0.5, () => rnd() < 0.5],
      six: ['A die shows a six', 1 / 6, () => rnd() < 1 / 6],
      seven: ['Two dice sum to 7', 1 / 6, () => Math.floor(rnd() * 6) + Math.floor(rnd() * 6) + 2 === 7],
      mere: ['At least one six in four rolls', 1 - (5 / 6) ** 4, () => [0, 1, 2, 3].some(() => rnd() < 1 / 6)],
    };
    let key = 'coin', hits = 0, n = 0, hist = [];
    const P = new Plot(host, { xmin: 0, xmax: 50, ymin: 0, ymax: 1, aspect: 0.5, xlabel: 'trials', label: 'Running proportion of successes' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'ev', label: 'Event', options: Object.entries(EV).map(([k, v]) => [k, v[0]]), value: key, onChange: (v) => { key = v; reset(); } });
    [1, 10, 100, 1000].forEach((k) => ui.button(panel, `Run ${k}`, () => run(k)));
    ui.button(panel, 'Reset', () => reset(), 'btn-ghost');
    const out = ui.readout(host);
    function run(k) { const f = EV[key][2]; for (let i = 0; i < k; i++) { n++; if (f()) hits++; if (n <= 200 || n % Math.ceil(n / 200) === 0) hist.push([n, hits / n]); } draw(); }
    function reset() { hits = 0; n = 0; hist = []; draw(); }
    function draw() {
      const p = EV[key][1], N = Math.max(50, n * 1.05);
      P.setView(0, N, 0, 1);
      P.draw((pl) => {
        pl.poly([...Array.from({ length: 101 }, (_, i) => { const t = 1 + (i / 100) * N; return [t, Math.min(1, p + 2 * Math.sqrt((p * (1 - p)) / t))]; }), ...Array.from({ length: 101 }, (_, i) => { const t = 1 + ((100 - i) / 100) * N; return [t, Math.max(0, p - 2 * Math.sqrt((p * (1 - p)) / t))]; })], { fill: 3, fillAlpha: 0.12, stroke: false });
        pl.hline(p, { color: 3, dash: [6, 4], width: 1.75 });
        if (hist.length > 1) pl.path(hist, { color: 1, width: 2 });
      });
      out.set(n ? `${n} trials, ${hits} successes: observed proportion $${n4(hits / n)}$ vs true probability $${n4(p)}$ (dashed). Error $${n4(Math.abs(hits / n - p))}$. The green band, $p \\pm 2\\sqrt{p(1-p)/n}$, narrows like $1/\\sqrt n$.` : `True probability $${n4(p)}$. Press a Run button: early proportions jump around, then settle toward the dashed line.`);
    }
    reset();
  });

  /* ---- Bayes: 1000 people ---- */
  AM.widget('bayes', (host, o, { ui }) => {
    const s = { prev: 1, sens: 90, spec: 91 };
    const P = new Plot(host, { xmin: -0.5, xmax: 40.5, ymin: -0.5, ymax: 25.5, equal: true, grid: false, axes: false, aspect: 0.62, label: 'Grid of 1000 people coloured by test result' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'prev', label: 'Prevalence (% sick)', min: 0.2, max: 30, step: 0.1, value: s.prev, fmt: (v) => v + '%', onInput: (v) => { s.prev = v; update(); } });
    ui.slider(panel, { id: 'sens', label: 'Sensitivity (% of sick caught)', min: 50, max: 100, step: 1, value: s.sens, fmt: (v) => v + '%', onInput: (v) => { s.sens = v; update(); } });
    ui.slider(panel, { id: 'spec', label: 'Specificity (% of healthy cleared)', min: 50, max: 100, step: 0.5, value: s.spec, fmt: (v) => v + '%', onInput: (v) => { s.spec = v; update(); } });
    ui.legend(host, [[4, 'Sick, tests positive'], [2, 'Healthy, tests positive (false alarm)'], [5, 'Sick, missed by the test']]);
    const out = ui.readout(host);
    function update() {
      const sick = Math.round(10 * s.prev), TP = Math.round((sick * s.sens) / 100), FN = sick - TP, healthy = 1000 - sick, FP = Math.round((healthy * (100 - s.spec)) / 100);
      P.draw((p) => {
        for (let i = 0; i < 1000; i++) {
          const col = i % 40, row = 24 - Math.floor(i / 40), x = col + 0.5, y = row + 0.5;
          let c, hollow = false, r = 4;
          if (i < TP) c = 4; else if (i < sick) c = 5; else if (i < sick + FP) c = 2; else { c = 'axis'; r = 2.6; hollow = true; }
          p.point(x - 0.5, y - 0.5, { color: c, r: Math.min(r, p.ppu * 0.36), hollow });
        }
      });
      const ppv = TP + FP ? TP / (TP + FP) : 0;
      out.set(`Out of 1000 people: ${sick} sick, ${healthy} healthy. Positives: ${TP} true (pink) + ${FP} false alarms (orange) = ${TP + FP}. So $P(\\text{sick}\\mid +) = \\dfrac{${TP}}{${TP + FP}} \\approx ${n3(ppv)}$, about **${Math.round(ppv * 100)}%**${s.prev < 5 ? `, even though the test is ${s.sens}% sensitive. When a condition is rare, false alarms from the large healthy group swamp the true positives` : ''}. ${FN} sick people were missed (grey). Hollow dots are healthy people who correctly tested negative.`);
    }
    update();
  });

  /* ---- Distribution explorer ---- */
  AM.widget('distributions', (host, o, { ui }) => {
    const D = {
      binom: { name: 'Binomial', params: [['n', 'Trials $n$', 1, 60, 1, 20], ['p', 'Success probability $p$', 0, 1, 0.01, 0.3]], disc: true, pmf: (k, q) => M.binom(q.n, k) * q.p ** k * (1 - q.p) ** (q.n - k), range: (q) => [0, q.n], mean: (q) => q.n * q.p, vr: (q) => q.n * q.p * (1 - q.p) },
      pois: { name: 'Poisson', params: [['l', 'Rate $\\lambda$', 0.2, 25, 0.1, 4]], disc: true, pmf: (k, q) => Math.exp(-q.l + k * Math.log(q.l) - lgam(k + 1)), range: (q) => [0, Math.ceil(q.l + 5 * Math.sqrt(q.l) + 4)], mean: (q) => q.l, vr: (q) => q.l },
      norm: { name: 'Normal', params: [['mu', 'Mean $\\mu$', -5, 5, 0.1, 0], ['s', 'SD $\\sigma$', 0.3, 4, 0.05, 1]], pdf: (x, q) => M.npdf(x, q.mu, q.s), cdf: (x, q) => M.phi((x - q.mu) / q.s), range: () => [-10, 10], mean: (q) => q.mu, vr: (q) => q.s * q.s },
      expo: { name: 'Exponential', params: [['l', 'Rate $\\lambda$', 0.2, 4, 0.05, 1]], pdf: (x, q) => (x < 0 ? 0 : q.l * Math.exp(-q.l * x)), cdf: (x, q) => (x < 0 ? 0 : 1 - Math.exp(-q.l * x)), range: (q) => [-0.5, Math.max(4, 6 / q.l)], mean: (q) => 1 / q.l, vr: (q) => 1 / (q.l * q.l) },
      unif: { name: 'Uniform', params: [['a', 'Left end $a$', -5, 4, 0.1, 0], ['b', 'Right end $b$', -4, 5, 0.1, 2]], pdf: (x, q) => (x >= q.a && x <= q.b ? 1 / (q.b - q.a) : 0), cdf: (x, q) => Math.min(1, Math.max(0, (x - q.a) / (q.b - q.a))), range: () => [-6, 6], mean: (q) => (q.a + q.b) / 2, vr: (q) => (q.b - q.a) ** 2 / 12 },
    };
    function lgam(z) { let s = 0; for (let i = 2; i < z; i++) s += Math.log(i); return s; } // log((z-1)!) for integer z
    let key = 'binom', q = {}, X = 6;
    const P = new Plot(host, { xmin: -1, xmax: 21, ymin: 0, ymax: 0.3, aspect: 0.5, label: 'Probability distribution' });
    const panel = ui.panel(host);
    const sp = AM.el('div', 'viz-controls'); sp.style.borderTop = '0'; sp.style.paddingTop = '0';
    ui.select(panel, { id: 'dist', label: 'Distribution', options: Object.entries(D).map(([k, v]) => [k, v.name]), value: key, onChange: (v) => { key = v; build(); } });
    host.appendChild(sp);
    const out = ui.readout(host);
    let xs;
    function build() {
      sp.innerHTML = ''; q = {};
      D[key].params.forEach(([id, lab, lo, hi, st, v]) => { q[id] = v; ui.slider(sp, { id: key + id, label: lab, min: lo, max: hi, step: st, value: v, onInput: (val) => { q[id] = val; if (key === 'unif' && q.b <= q.a + 0.1) q.b = q.a + 0.1; update(); } }); });
      xs = ui.slider(sp, { id: key + 'x', label: 'Shade $P(X \\le x)$ up to $x$', min: -10, max: 60, step: 0.1, value: D[key].disc ? 6 : 1, onInput: (v) => { X = v; update(); } });
      X = xs.value; update();
    }
    function update() {
      const d = D[key], [lo, hi] = d.range(q), mu = d.mean(q), sd = Math.sqrt(d.vr(q));
      xs.input.min = lo; xs.input.max = hi; if (X < lo || X > hi) { X = Math.max(lo, Math.min(hi, X)); xs.set(X); }
      let top = 0, cdf = 0;
      if (d.disc) { for (let k = lo; k <= hi; k++) { const v = d.pmf(k, q); top = Math.max(top, v); if (k <= X) cdf += v; } }
      else { for (let x = lo; x <= hi; x += (hi - lo) / 400) top = Math.max(top, d.pdf(x, q)); cdf = d.cdf(X, q); }
      P.setView(lo - (d.disc ? 1 : 0), hi + (d.disc ? 1 : 0), 0, Math.min(top * 1.2 + 1e-9, 5));
      P.draw((p) => {
        if (d.disc) for (let k = lo; k <= hi; k++) { const v = d.pmf(k, q); p.rect(k - 0.38, 0, k + 0.38, v, { fill: k <= X ? 1 : 'muted', fillAlpha: k <= X ? 0.75 : 0.3, stroke: false }); }
        else { p.area((x) => d.pdf(x, q), lo, Math.min(X, hi), { fill: 1, fillAlpha: 0.3, n: 300 }); p.fn((x) => d.pdf(x, q), { color: 1, width: 2.5 }); }
        p.vline(mu, { color: 2, width: 1.5 });
        p.line(mu - sd, top * 1.08, mu + sd, top * 1.08, { color: 2, width: 2 });
        p.text('μ ± σ', mu, top * 1.08, { dy: -10, align: 'center', color: 2 });
      });
      out.set(`**${d.name}**: mean $\\mu = ${n3(mu)}$, variance $${n3(d.vr(q))}$, SD $${n3(sd)}$ (orange bar). $P(X \\le ${n2(X)}) \\approx ${n4(cdf)}$, the ${d.disc ? 'blue bars' : 'shaded area'}.`);
    }
    build();
  });

  /* ---- Central Limit Theorem ---- */
  AM.widget('clt', (host, o, { ui }) => {
    const POP = {
      expo: { name: 'Exponential (skewed)', draw: () => -Math.log(1 - rnd()), mu: 1, sd: 1, range: [0, 4], dens: (x) => (x < 0 ? 0 : Math.exp(-x)) },
      unif: { name: 'Uniform', draw: () => rnd(), mu: 0.5, sd: Math.sqrt(1 / 12), range: [0, 1], dens: (x) => (x >= 0 && x <= 1 ? 1 : 0) },
      bimod: { name: 'Two humps', draw: () => (rnd() < 0.5 ? rnd() * 0.3 : 0.7 + rnd() * 0.3), mu: 0.5, sd: Math.sqrt(0.13), range: [0, 1], dens: (x) => ((x >= 0 && x <= 0.3) || (x >= 0.7 && x <= 1) ? 1 / 0.6 : 0) },
      die: { name: 'Die roll', draw: () => 1 + Math.floor(rnd() * 6), mu: 3.5, sd: Math.sqrt(35 / 12), range: [0.5, 6.5], dens: (x) => (x >= 0.5 && x <= 6.5 ? 1 / 6 : 0) },
    };
    let key = 'expo', n = 5, means = [];
    const top = new Plot(host, { xmin: 0, xmax: 4, ymin: 0, ymax: 1.1, aspect: 0.22, minH: 110, ticks: false, label: 'Population distribution' });
    const bot = new Plot(host, { xmin: 0, xmax: 4, ymin: 0, ymax: 1, aspect: 0.42, minH: 180, label: 'Histogram of sample means' });
    const panel = ui.panel(host);
    ui.select(panel, { id: 'pop', label: 'Population', options: Object.entries(POP).map(([k, v]) => [k, v.name]), value: key, onChange: (v) => { key = v; means = []; draw(); } });
    ui.slider(panel, { id: 'n', label: 'Sample size $n$', min: 1, max: 50, step: 1, value: n, fmt: String, onInput: (v) => { n = v; means = []; draw(); } });
    ui.button(panel, 'Draw 1 sample', () => sample(1));
    ui.button(panel, 'Draw 1000 samples', () => sample(1000));
    const out = ui.readout(host);
    function sample(k) { const pp = POP[key]; for (let j = 0; j < k; j++) { let s = 0; for (let i = 0; i < n; i++) s += pp.draw(); means.push(s / n); } if (means.length > 20000) means = means.slice(-20000); draw(); }
    function draw() {
      const pp = POP[key], [lo, hi] = pp.range, bins = 48, w = (hi - lo) / bins, counts = new Array(bins).fill(0);
      means.forEach((m) => { const b = Math.floor((m - lo) / w); if (b >= 0 && b < bins) counts[b]++; });
      const se = pp.sd / Math.sqrt(n), peak = Math.max(...counts, means.length * w * M.npdf(0, 0, se), 1);
      top.setView(lo, hi, 0, (key === 'expo' ? 1 : key === 'die' ? 1 / 6 : key === 'bimod' ? 1 / 0.6 : 1) * 1.15);
      top.draw((p) => { p.area(pp.dens, lo, hi, { fill: 3, fillAlpha: 0.35, n: 400 }); p.fn(pp.dens, { color: 3, width: 2 }); p.vline(pp.mu, { color: 2, width: 1.5 }); p.text('population', lo, top.v.ymax, { dx: 6, dy: 10, color: 3 }); });
      bot.setView(lo, hi, 0, peak * 1.15);
      bot.draw((p) => {
        counts.forEach((c, i) => { if (c) p.rect(lo + i * w, 0, lo + (i + 1) * w, c, { fill: 1, fillAlpha: 0.55, stroke: 'bg', width: 0.5 }); });
        if (means.length) p.fn((x) => means.length * w * M.npdf(x, pp.mu, se), { color: 2, width: 2.25 });
        p.vline(pp.mu, { color: 2, width: 1.5 });
      });
      const mm = means.length ? means.reduce((a, b) => a + b, 0) / means.length : 0, sd = means.length > 1 ? Math.sqrt(means.reduce((a, b) => a + (b - mm) ** 2, 0) / (means.length - 1)) : 0;
      out.set(means.length ? `${means.length} sample means, each averaging $n = ${n}$ draws. Their average is $${n3(mm)}$ (true $\\mu = ${n3(pp.mu)}$) and their SD is $${n3(sd)}$ vs. the CLT prediction $\\sigma/\\sqrt n = ${n3(se)}$. The orange curve is the normal distribution the CLT predicts.` : `Population mean $\\mu = ${n3(pp.mu)}$, SD $\\sigma = ${n3(pp.sd)}$. Draw samples and watch the histogram of their means take a bell shape, even though the population (top) isn't one.`);
    }
    draw();
  });

  /* ---- Confidence intervals: coverage simulation ---- */
  AM.widget('ci', (host, o, { ui }) => {
    const mu = 50, sigma = 10; let n = 25, conf = 95, ivs = [], total = 0, hitsAll = 0;
    const Z = { 80: 1.2816, 90: 1.6449, 95: 1.96, 99: 2.5758 };
    const P = new Plot(host, { xmin: 40, xmax: 60, ymin: 0, ymax: 51, aspect: 0.62, ystep: 10, xlabel: 'estimate', label: 'Fifty confidence intervals' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'n', label: 'Sample size $n$', min: 4, max: 200, step: 1, value: n, fmt: String, onInput: (v) => { n = v; regen(); } });
    ui.seg(panel, { id: 'conf', label: 'Confidence level', options: [[80, '80%'], [90, '90%'], [95, '95%'], [99, '99%']], value: conf, onChange: (v) => { conf = v; regen(); } });
    ui.button(panel, 'Draw 50 new samples', () => regen());
    const out = ui.readout(host);
    function regen() {
      const se = sigma / Math.sqrt(n), z = Z[conf];
      ivs = Array.from({ length: 50 }, () => { const xb = mu + M.randn(rnd) * se; return [xb - z * se, xb, xb + z * se]; });
      const hits = ivs.filter(([a, , b]) => a <= mu && mu <= b).length; total += 50; hitsAll += hits;
      P.draw((p) => {
        p.vline(mu, { color: 3, width: 2, dash: [] });
        ivs.forEach(([a, m, b], i) => { const ok = a <= mu && mu <= b; p.line(a, i + 1, b, i + 1, { color: ok ? 1 : 'bad', width: ok ? 2 : 3 }); p.point(m, i + 1, { color: ok ? 1 : 'bad', r: 2.5 }); });
      });
      out.set(`True mean $\\mu = ${mu}$ (green line), $\\sigma = ${sigma}$. Each line is $\\bar x \\pm ${Z[conf]}\\cdot\\frac{${sigma}}{\\sqrt{${n}}}$, margin $${n2(Z[conf] * se)}$. **${hits} of 50** intervals catch $\\mu$; red ones miss. Since you opened this lesson: ${hitsAll} of ${total} (${n2((100 * hitsAll) / total)}%), close to the promised ${conf}%.`);
    }
    regen();
  });

  /* ---- Hypothesis test: is the coin fair? ---- */
  AM.widget('pvalue', (host, o, { ui }) => {
    let N = 100, H = 60, tail = 'two', alpha = 0.05;
    const P = new Plot(host, { xmin: -4.2, xmax: 4.2, ymin: 0, ymax: 0.45, aspect: 0.48, xlabel: 'z', label: 'Null distribution with shaded p-value' });
    const panel = ui.panel(host);
    ui.slider(panel, { id: 'N', label: 'Flips $n$', min: 10, max: 500, step: 2, value: N, fmt: String, onInput: (v) => { N = v; hs.input.max = N; if (H > N) { H = N; } hs.set(H); update(); } });
    const hs = ui.slider(panel, { id: 'H', label: 'Heads observed', min: 0, max: N, step: 1, value: H, fmt: String, onInput: (v) => { H = v; update(); } });
    ui.seg(panel, { id: 'tail', label: 'Alternative', options: [['two', 'Biased (≠)'], ['right', 'Favours heads (>)'], ['left', 'Favours tails (<)']], value: tail, onChange: (v) => { tail = v; update(); } });
    ui.seg(panel, { id: 'alpha', label: 'Significance $\\alpha$', options: [[0.1, '0.10'], [0.05, '0.05'], [0.01, '0.01']], value: alpha, onChange: (v) => { alpha = v; update(); } });
    const out = ui.readout(host);
    function update() {
      const ph = H / N, z = (ph - 0.5) / Math.sqrt(0.25 / N), zc = Math.min(4, Math.max(-4, z));
      const pv = tail === 'two' ? 2 * (1 - M.phi(Math.abs(z))) : tail === 'right' ? 1 - M.phi(z) : M.phi(z);
      const crit = tail === 'two' ? [-1, 1].map((s) => s * zinv(1 - alpha / 2)) : tail === 'right' ? [zinv(1 - alpha)] : [-zinv(1 - alpha)];
      P.draw((p) => {
        const f = (x) => M.npdf(x);
        if (tail !== 'left') p.area(f, tail === 'two' ? Math.abs(zc) : zc, 4.2, { fill: 2, fillAlpha: 0.55 });
        if (tail !== 'right') p.area(f, -4.2, tail === 'two' ? -Math.abs(zc) : zc, { fill: 2, fillAlpha: 0.55 });
        p.fn(f, { color: 1, width: 2.5 });
        crit.forEach((c) => p.vline(c, { color: 4, width: 1.5 }));
        p.vline(zc, { color: 'ink', width: 2, dash: [] });
        p.text(`z = ${n2(z)}`, zc, 0.42, { align: zc > 2.5 ? 'right' : 'left', dx: zc > 2.5 ? -6 : 6, color: 'ink', weight: 700 });
      });
      out.set(`$\\hat p = ${H}/${N} = ${n3(ph)}$. Under $H_0: p = 0.5$, $z = \\dfrac{${n3(ph)} - 0.5}{\\sqrt{0.25/${N}}} = ${n2(z)}$. p-value $= ${n4(pv)}$ (orange area). ${pv <= alpha ? `Since $p \\le ${alpha}$, **reject** $H_0$: this many heads would be unusual for a fair coin.` : `Since $p > ${alpha}$, **don't reject** $H_0$: a fair coin often does this.`} Pink lines mark the critical values.`);
    }
    function zinv(p) { let lo = -6, hi = 6; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (M.phi(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }
    update();
  });
})();
