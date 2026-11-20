/* Gradient — canvas plotting engine + interactive controls shared by every visual. */
(function () {
  'use strict';
  const AM = window.AM;
  const live = new Set();
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  let palette = null;
  AM.colors = function () {
    palette = {
      bg: cssVar('--panel'), paper: cssVar('--paper'), ink: cssVar('--ink'), ink2: cssVar('--ink-2'), muted: cssVar('--muted'),
      grid: cssVar('--grid'), axis: cssVar('--axis'), good: cssVar('--good'), bad: cssVar('--bad'), hi: cssVar('--hi'),
      c: [1, 2, 3, 4, 5].map((i) => cssVar('--c' + i)),
      mono: cssVar('--font-mono') || 'monospace',
    };
    return palette;
  };
  const pal = () => palette || AM.colors();
  function themeChanged() { AM.colors(); live.forEach((p) => p.render()); }
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themeChanged);
  new MutationObserver(themeChanged).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  AM.reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Colour helpers: "#rrggbb" ↔ rgb, mixing for heatmaps */
  function rgb(c) {
    c = c.trim();
    if (c.startsWith('#')) {
      if (c.length === 4) c = '#' + [...c.slice(1)].map((h) => h + h).join('');
      const n = parseInt(c.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    const m = c.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [128, 128, 128];
  }
  AM.rgb = rgb;
  AM.mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  AM.alpha = (c, a) => { const A = rgb(c); return `rgba(${A.join(',')},${a})`; };

  function niceStep(span, target) {
    const raw = span / Math.max(2, target); const p = 10 ** Math.floor(Math.log10(raw)); const m = raw / p;
    return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
  }
  AM.niceStep = niceStep;
  const tick = (v, step) => { const dp = Math.max(0, -Math.floor(Math.log10(step) + 1e-9)); return (+v.toFixed(dp)).toString().replace('-', '−'); };

  class Plot {
    constructor(parent, o = {}) {
      this.o = Object.assign({ xmin: -5, xmax: 5, ymin: -3, ymax: 3, aspect: 0.6, equal: false, maxH: 460, minH: 210, grid: true, axes: true }, o);
      this.el = document.createElement('div'); this.el.className = 'plot';
      this.cv = document.createElement('canvas');
      this.cv.setAttribute('role', 'img');
      this.cv.setAttribute('aria-label', o.label || 'Interactive graph');
      this.el.appendChild(this.cv); parent.appendChild(this.el);
      this.ctx = this.cv.getContext('2d');
      this.handles = []; this.drawFn = null; this.w = 0; this.h = 0; this.dpr = 1;
      this.v0 = { xmin: this.o.xmin, xmax: this.o.xmax, ymin: this.o.ymin, ymax: this.o.ymax };
      this._bindPointer();
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this.el);
      live.add(this);
      this.resize();
    }
    draw(fn) { this.drawFn = fn; this.redraw(); return this; }
    setView(xmin, xmax, ymin, ymax) { this.v0 = { xmin, xmax, ymin, ymax }; this._fit(); this.redraw(); }
    _fit() {
      let { xmin, xmax, ymin, ymax } = this.v0;
      if (this.o.equal && this.w && this.h) {
        const s = Math.min(this.w / (xmax - xmin), this.h / (ymax - ymin));
        const cx = (xmin + xmax) / 2, cy = (ymin + ymax) / 2, hw = this.w / s / 2, hh = this.h / s / 2;
        xmin = cx - hw; xmax = cx + hw; ymin = cy - hh; ymax = cy + hh;
      }
      this.v = { xmin, xmax, ymin, ymax };
    }
    resize() {
      const w = Math.max(200, Math.round(this.el.clientWidth));
      const maxH = Math.min(this.o.maxH, Math.max(this.o.minH, window.innerHeight * 0.66));
      const h = Math.round(Math.max(this.o.minH, Math.min(maxH, w * this.o.aspect)));
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      if (w === this.w && h === this.h && dpr === this.dpr) return;
      this.w = w; this.h = h; this.dpr = dpr;
      this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr);
      this.cv.style.height = h + 'px';
      this._fit(); this.render();
    }
    /* world ↔ pixel */
    X(x) { return ((x - this.v.xmin) / (this.v.xmax - this.v.xmin)) * this.w; }
    Y(y) { return this.h - ((y - this.v.ymin) / (this.v.ymax - this.v.ymin)) * this.h; }
    wx(px) { return this.v.xmin + (px / this.w) * (this.v.xmax - this.v.xmin); }
    wy(py) { return this.v.ymin + ((this.h - py) / this.h) * (this.v.ymax - this.v.ymin); }
    get ppu() { return this.w / (this.v.xmax - this.v.xmin); }
    get ppuY() { return this.h / (this.v.ymax - this.v.ymin); }
    color(c) {
      const P = pal();
      if (c == null) return P.c[0];
      if (typeof c === 'number') return P.c[(c - 1) % 5];
      if (typeof c === 'string' && P[c] && typeof P[c] === 'string') return P[c];
      return c;
    }
    redraw() { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = 0; this.render(); }); }
    render() {
      if (!this.w) return;
      const c = this.ctx, P = pal();
      c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      c.clearRect(0, 0, this.w, this.h);
      c.fillStyle = P.bg; c.fillRect(0, 0, this.w, this.h);
      if (this.o.grid) this.grid();
      if (this.o.axes) this.axes();
      if (this.drawFn) { c.save(); try { this.drawFn(this, P); } finally { c.restore(); } }
      this.handles.forEach((h) => this._drawHandle(h));
    }
    /* ---------- background ---------- */
    grid() {
      const c = this.ctx, P = pal(), { xmin, xmax, ymin, ymax } = this.v;
      const sx = this.o.xstep || niceStep(xmax - xmin, this.w / 64);
      const sy = this.o.ystep || (this.o.equal ? sx : niceStep(ymax - ymin, this.h / 52));
      c.strokeStyle = P.grid; c.lineWidth = 1; c.beginPath();
      for (let x = Math.ceil(xmin / sx) * sx; x <= xmax; x += sx) { const px = Math.round(this.X(x)) + 0.5; c.moveTo(px, 0); c.lineTo(px, this.h); }
      for (let y = Math.ceil(ymin / sy) * sy; y <= ymax; y += sy) { const py = Math.round(this.Y(y)) + 0.5; c.moveTo(0, py); c.lineTo(this.w, py); }
      c.stroke();
      this._steps = [sx, sy];
    }
    axes() {
      const c = this.ctx, P = pal(), { xmin, xmax, ymin, ymax } = this.v;
      const [sx, sy] = this._steps || [niceStep(xmax - xmin, 8), niceStep(ymax - ymin, 6)];
      const ay = Math.min(this.h - 1, Math.max(0, this.Y(0))), ax = Math.min(this.w - 1, Math.max(0, this.X(0)));
      c.strokeStyle = P.axis; c.lineWidth = 1.25; c.beginPath();
      c.moveTo(0, Math.round(ay) + 0.5); c.lineTo(this.w, Math.round(ay) + 0.5);
      c.moveTo(Math.round(ax) + 0.5, 0); c.lineTo(Math.round(ax) + 0.5, this.h); c.stroke();
      if (this.o.ticks === false) return;
      c.fillStyle = P.muted; c.font = `11px ${P.mono}`;
      const xf = this.o.xfmt || ((v) => tick(v, sx)), yf = this.o.yfmt || ((v) => tick(v, sy));
      const xs = this.o.xticks || [];
      if (!this.o.xticks) for (let x = Math.ceil(xmin / sx) * sx; x <= xmax - sx * 0.3; x += sx) xs.push(x);
      c.textAlign = 'center'; c.textBaseline = 'top';
      const ty = ay > this.h - 18 ? ay - 15 : ay + 4;
      const xlabW = this.o.xlabel ? c.measureText(this.o.xlabel).width + 22 : 12; // keep tick labels clear of the axis title
      xs.forEach((x) => { if (Math.abs(x) < sx * 1e-6) return; const px = this.X(x); if (px < 12 || px > this.w - xlabW) return; c.fillText(xf(x), px, ty); });
      c.textAlign = ax < 30 ? 'left' : 'right'; c.textBaseline = 'middle';
      const tx = ax < 30 ? ax + 5 : ax - 5;
      for (let y = Math.ceil(ymin / sy) * sy; y <= ymax; y += sy) { if (Math.abs(y) < sy * 1e-6) continue; const py = this.Y(y); if (py < 10 || py > this.h - 10) continue; c.fillText(yf(y), tx, py); }
      if (this.o.xlabel) { c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillStyle = P.ink2; c.fillText(this.o.xlabel, this.w - 6, ay - 4); }
      if (this.o.ylabel) { c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = P.ink2; c.fillText(this.o.ylabel, ax + 6, 6); }
    }
    /* ---------- marks (all in world coordinates) ---------- */
    _stroke(o = {}) {
      const c = this.ctx;
      c.strokeStyle = this.color(o.color ?? 1); c.lineWidth = o.width ?? 2.25;
      c.setLineDash(o.dash || []); c.lineJoin = 'round'; c.lineCap = 'round';
      c.globalAlpha = o.alpha ?? 1; c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
    }
    fn(f, o = {}) {
      const c = this.ctx, { xmin, xmax } = this.v;
      const a = Math.max(o.from ?? xmin, xmin), b = Math.min(o.to ?? xmax, xmax);
      const n = o.n || Math.max(240, Math.round(this.w * 1.2));
      c.beginPath(); let pen = false, prev = 0;
      for (let i = 0; i <= n; i++) {
        const x = a + ((b - a) * i) / n, y = f(x);
        if (!isFinite(y)) { pen = false; continue; }
        const py = this.Y(y);
        if (pen && Math.abs(py - prev) > this.h * 2) pen = false;
        const cy = Math.max(-this.h * 3, Math.min(this.h * 4, py));
        if (!pen) { c.moveTo(this.X(x), cy); pen = true; } else c.lineTo(this.X(x), cy);
        prev = py;
      }
      this._stroke(o);
    }
    param(fx, fy, t0, t1, o = {}) {
      const c = this.ctx, n = o.n || 400; c.beginPath();
      for (let i = 0; i <= n; i++) { const t = t0 + ((t1 - t0) * i) / n; const x = this.X(fx(t)), y = this.Y(fy(t)); i ? c.lineTo(x, y) : c.moveTo(x, y); }
      this._stroke(o);
    }
    path(pts, o = {}) {
      if (pts.length < 2) return; const c = this.ctx; c.beginPath();
      pts.forEach(([x, y], i) => (i ? c.lineTo(this.X(x), this.Y(y)) : c.moveTo(this.X(x), this.Y(y))));
      if (o.close) c.closePath();
      this._stroke(o);
    }
    poly(pts, o = {}) {
      if (pts.length < 2) return; const c = this.ctx; c.beginPath();
      pts.forEach(([x, y], i) => (i ? c.lineTo(this.X(x), this.Y(y)) : c.moveTo(this.X(x), this.Y(y))));
      c.closePath();
      c.fillStyle = this.color(o.fill ?? o.color ?? 1); c.globalAlpha = o.fillAlpha ?? 0.18; c.fill(); c.globalAlpha = 1;
      if (o.stroke !== false && (o.stroke || o.color)) this._stroke({ ...o, color: o.stroke || o.color, width: o.width ?? 1.5 });
    }
    area(f, a, b, o = {}) {
      const n = o.n || 200, g = o.base || (() => 0), pts = [];
      for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; pts.push([x, f(x)]); }
      for (let i = n; i >= 0; i--) { const x = a + ((b - a) * i) / n; pts.push([x, g(x)]); }
      this.poly(pts, { stroke: false, ...o });
    }
    line(x1, y1, x2, y2, o = {}) { const c = this.ctx; c.beginPath(); c.moveTo(this.X(x1), this.Y(y1)); c.lineTo(this.X(x2), this.Y(y2)); this._stroke({ width: 1.75, ...o }); }
    hline(y, o = {}) { this.line(this.v.xmin, y, this.v.xmax, y, { width: 1.25, dash: [5, 5], color: 'muted', ...o }); }
    vline(x, o = {}) { this.line(x, this.v.ymin, x, this.v.ymax, { width: 1.25, dash: [5, 5], color: 'muted', ...o }); }
    arrow(x1, y1, x2, y2, o = {}) {
      const c = this.ctx, X1 = this.X(x1), Y1 = this.Y(y1), X2 = this.X(x2), Y2 = this.Y(y2);
      const L = Math.hypot(X2 - X1, Y2 - Y1); if (L < 0.5) return;
      const hs = Math.min(o.head ?? 10, L * 0.45), ang = Math.atan2(Y2 - Y1, X2 - X1);
      c.beginPath(); c.moveTo(X1, Y1); c.lineTo(X2 - Math.cos(ang) * hs * 0.6, Y2 - Math.sin(ang) * hs * 0.6);
      this._stroke({ width: 2.25, ...o });
      c.beginPath(); c.moveTo(X2, Y2);
      c.lineTo(X2 - hs * Math.cos(ang - 0.42), Y2 - hs * Math.sin(ang - 0.42));
      c.lineTo(X2 - hs * Math.cos(ang + 0.42), Y2 - hs * Math.sin(ang + 0.42)); c.closePath();
      c.fillStyle = this.color(o.color ?? 1); c.globalAlpha = o.alpha ?? 1; c.fill(); c.globalAlpha = 1;
    }
    point(x, y, o = {}) {
      const c = this.ctx; c.beginPath(); c.arc(this.X(x), this.Y(y), o.r ?? 4.5, 0, Math.PI * 2);
      c.fillStyle = o.hollow ? pal().bg : this.color(o.color ?? 1); c.fill();
      c.lineWidth = o.hollow ? 2 : 1.5; c.strokeStyle = o.hollow ? this.color(o.color ?? 1) : pal().bg; c.stroke();
    }
    rect(x0, y0, x1, y1, o = {}) { this.poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], o); }
    circle(cx, cy, r, o = {}) {
      const c = this.ctx; c.beginPath();
      c.ellipse(this.X(cx), this.Y(cy), Math.abs(r * this.ppu), Math.abs(r * this.ppuY), 0, 0, Math.PI * 2);
      if (o.fill) { c.fillStyle = this.color(o.fill); c.globalAlpha = o.fillAlpha ?? 0.15; c.fill(); c.globalAlpha = 1; }
      if (o.stroke !== false) this._stroke({ width: 1.75, ...o });
    }
    text(s, x, y, o = {}) {
      const c = this.ctx, P = pal();
      c.font = `${o.weight || 500} ${o.size || 12}px ${o.font || P.mono}`;
      c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle';
      const px = this.X(x) + (o.dx || 0), py = this.Y(y) + (o.dy || 0);
      if (o.halo !== false) { c.lineWidth = 4; c.strokeStyle = P.bg; c.lineJoin = 'round'; c.strokeText(s, px, py); }
      c.fillStyle = this.color(o.color ?? 'ink2'); c.fillText(s, px, py);
    }
    /* ---------- fields & surfaces ---------- */
    heat(f, o = {}) {
      const P = pal(), cell = o.cell || 4, W = Math.ceil(this.w / cell), H = Math.ceil(this.h / cell);
      const vals = new Float32Array(W * H); let lo = Infinity, hi = -Infinity;
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
        const v = f(this.wx((i + 0.5) * cell), this.wy((j + 0.5) * cell)); vals[j * W + i] = v;
        if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      }
      if (o.range) [lo, hi] = o.range;
      const m = o.center ?? 0, span = o.diverging === false ? (hi - lo || 1) : Math.max(Math.abs(hi - m), Math.abs(lo - m)) || 1;
      const Cn = rgb(o.low || P.c[0]), Cp = rgb(o.high || P.c[1]), B = rgb(P.bg), str = o.strength ?? 0.75;
      const img = this.ctx.createImageData(W, H);
      for (let k = 0; k < W * H; k++) {
        const v = vals[k]; let col = B, t = 0;
        if (isFinite(v)) {
          if (o.diverging === false) { t = ((v - lo) / span) * str; col = Cp; }
          else { t = Math.min(1, Math.abs(v - m) / span) * str; col = v >= m ? Cp : Cn; }
        }
        img.data[k * 4] = B[0] + (col[0] - B[0]) * t; img.data[k * 4 + 1] = B[1] + (col[1] - B[1]) * t;
        img.data[k * 4 + 2] = B[2] + (col[2] - B[2]) * t; img.data[k * 4 + 3] = 255;
      }
      const off = document.createElement('canvas'); off.width = W; off.height = H; off.getContext('2d').putImageData(img, 0, 0);
      this.ctx.imageSmoothingEnabled = true; this.ctx.drawImage(off, 0, 0, W * cell, H * cell);
      return { lo, hi };
    }
    contours(f, levels, o = {}) {
      const c = this.ctx, cell = o.cell || 6, W = Math.ceil(this.w / cell) + 1, H = Math.ceil(this.h / cell) + 1;
      const g = new Float64Array(W * H);
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) g[j * W + i] = f(this.wx(i * cell), this.wy(j * cell));
      c.beginPath();
      const lerp = (a, b, va, vb, L) => a + ((L - va) / (vb - va)) * (b - a);
      levels.forEach((L) => {
        for (let j = 0; j < H - 1; j++) for (let i = 0; i < W - 1; i++) {
          const a = g[j * W + i], b = g[j * W + i + 1], d = g[(j + 1) * W + i], e = g[(j + 1) * W + i + 1];
          const x0 = i * cell, y0 = j * cell, x1 = x0 + cell, y1 = y0 + cell, pts = [];
          if ((a < L) !== (b < L)) pts.push([lerp(x0, x1, a, b, L), y0]);
          if ((b < L) !== (e < L)) pts.push([x1, lerp(y0, y1, b, e, L)]);
          if ((d < L) !== (e < L)) pts.push([lerp(x0, x1, d, e, L), y1]);
          if ((a < L) !== (d < L)) pts.push([x0, lerp(y0, y1, a, d, L)]);
          if (pts.length >= 2) { c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0], pts[1][1]); }
          if (pts.length === 4) { c.moveTo(pts[2][0], pts[2][1]); c.lineTo(pts[3][0], pts[3][1]); }
        }
      });
      this._stroke({ width: 1.1, color: 'ink2', alpha: 0.55, ...o });
    }
    field(F, o = {}) {
      const { xmin, xmax, ymin, ymax } = this.v, n = o.n || 17;
      const step = (xmax - xmin) / n, L = step * 0.42;
      let maxM = 0; const arrows = [];
      for (let x = xmin + step / 2; x < xmax; x += step) for (let y = ymin + step / 2; y < ymax; y += step) {
        const [u, v] = F(x, y), m = Math.hypot(u, v); if (!isFinite(m)) continue; arrows.push([x, y, u, v, m]); maxM = Math.max(maxM, m);
      }
      arrows.forEach(([x, y, u, v, m]) => {
        if (m < 1e-9) return;
        const s = o.scaled ? (L * 2 * m) / maxM : L * 2;
        this.arrow(x - (u / m) * s * 0.5, y - (v / m) * s * 0.5, x + (u / m) * s * 0.5, y + (v / m) * s * 0.5,
          { color: o.color ?? 'muted', width: 1.3, head: 5.5, alpha: o.fade ? 0.35 + 0.65 * (m / maxM) : (o.alpha ?? 0.8) });
      });
    }
    /* ---------- draggable handles ---------- */
    handle(h) { this.handles.push(h); this.cv.style.touchAction = 'none'; this.cv.classList.add('has-handles'); this.redraw(); return h; }
    _drawHandle(h) {
      if (h.hidden && h.hidden()) return;
      const [x, y] = h.get(), c = this.ctx, P = pal(), X = this.X(x), Y = this.Y(y), r = h.r || 7;
      c.beginPath(); c.arc(X, Y, r + 5, 0, Math.PI * 2); c.fillStyle = AM.alpha(this.color(h.color ?? 2), 0.18); c.fill();
      c.beginPath(); c.arc(X, Y, r, 0, Math.PI * 2); c.fillStyle = this.color(h.color ?? 2); c.fill();
      c.lineWidth = 2; c.strokeStyle = P.bg; c.stroke();
    }
    _bindPointer() {
      const cv = this.cv; let drag = null;
      const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const near = (px, py) => {
        let best = null, bd = 24;
        this.handles.forEach((h) => { if (h.hidden && h.hidden()) return; const [x, y] = h.get(); const d = Math.hypot(this.X(x) - px, this.Y(y) - py); if (d < bd) { bd = d; best = h; } });
        return best;
      };
      cv.addEventListener('pointerdown', (e) => {
        const [px, py] = pos(e); const h = near(px, py);
        if (h) { drag = h; cv.setPointerCapture(e.pointerId); e.preventDefault(); cv.style.cursor = 'grabbing'; }
        else if (this.onClick) { this.onClick(this.wx(px), this.wy(py), e); }
      });
      cv.addEventListener('pointermove', (e) => {
        const [px, py] = pos(e);
        if (drag) {
          let x = this.wx(px), y = this.wy(py);
          x = Math.max(this.v.xmin, Math.min(this.v.xmax, x)); y = Math.max(this.v.ymin, Math.min(this.v.ymax, y));
          drag.set(x, y); this.redraw(); if (this.onChange) this.onChange(); return;
        }
        if (this.handles.length) cv.style.cursor = near(px, py) ? 'grab' : (this.onClick ? 'crosshair' : 'default');
        if (this.onHover) this.onHover(this.wx(px), this.wy(py));
      });
      const end = () => { if (drag) { drag = null; cv.style.cursor = 'grab'; if (this.onDragEnd) this.onDragEnd(); } };
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
      cv.addEventListener('pointerleave', () => { if (this.onHover) this.onHover(null, null); });
    }
    destroy() { this.ro.disconnect(); live.delete(this); if (this._raf) cancelAnimationFrame(this._raf); }
  }
  AM.Plot = Plot;
  /* Destroy plots whose DOM has been removed (called on every route change). */
  AM.cleanup = () => { live.forEach((p) => { if (!p.el.isConnected) p.destroy(); }); };

  /* Animation loop that stops itself when its element leaves the page or the tab is hidden. */
  AM.animate = function (el, step) {
    let raf = 0, last = 0, running = false;
    const tick = (t) => {
      if (!el.isConnected) { running = false; return; }
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
      if (!document.hidden && step(dt) === false) { running = false; return; }
      raf = requestAnimationFrame(tick);
    };
    return {
      start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(tick); },
      stop() { running = false; cancelAnimationFrame(raf); },
      get running() { return running; },
    };
  };

  /* ---------------- Controls ---------------- */
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  AM.el = el;
  AM.ui = {
    /* A scope gives every control a stable, predictable id (lesson id + counter). */
    scope(prefix) {
      let n = 0; const id = (s) => `${prefix}-${s || ++n}`;
      const ui = {
        panel(parent, cls = '') { const p = el('div', 'viz-controls ' + cls); parent.appendChild(p); return p; },
        slider(parent, o) {
          const sid = id(o.id); const fmt = o.fmt || ((v) => AM.fmt(v, 3).replace('-', '−'));
          const w = el('div', 'ctl ctl-range');
          w.innerHTML = `<label for="${sid}"><span class="ctl-label">${AM.mdi(o.label)}</span><output class="ctl-val" for="${sid}"></output></label>
            <input type="range" id="${sid}" min="${o.min}" max="${o.max}" step="${o.step ?? 0.01}" value="${o.value}">`;
          const inp = w.querySelector('input'), out = w.querySelector('output');
          const show = () => { out.textContent = fmt(+inp.value); };
          inp.addEventListener('input', () => { show(); o.onInput && o.onInput(+inp.value); });
          show(); parent.appendChild(w);
          return { el: w, input: inp, get value() { return +inp.value; }, set(v) { inp.value = v; show(); } };
        },
        select(parent, o) {
          const sid = id(o.id); const w = el('div', 'ctl ctl-select');
          w.innerHTML = `<label for="${sid}"><span class="ctl-label">${AM.mdi(o.label)}</span></label><select id="${sid}">${o.options.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select>`;
          const s = w.querySelector('select'); if (o.value != null) s.value = o.value;
          s.addEventListener('change', () => o.onChange && o.onChange(s.value)); parent.appendChild(w);
          return { el: w, get value() { return s.value; }, set(v) { s.value = v; } };
        },
        seg(parent, o) { // segmented buttons
          const w = el('div', 'ctl ctl-seg'); w.setAttribute('role', 'group');
          if (o.label) w.appendChild(el('span', 'ctl-label', AM.mdi(o.label)));
          const row = el('div', 'seg'); w.appendChild(row); let cur = o.value;
          const btns = o.options.map(([v, t]) => {
            const b = el('button', 'seg-btn', AM.mdi(t)); b.type = 'button'; b.id = id(o.id ? `${o.id}-${v}` : null);
            b.setAttribute('aria-pressed', String(v === cur));
            b.addEventListener('click', () => { cur = v; btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); o.onChange && o.onChange(v); });
            row.appendChild(b); return b;
          });
          parent.appendChild(w);
          return { el: w, get value() { return cur; }, set(v) { cur = v; btns.forEach((x, i) => x.setAttribute('aria-pressed', String(o.options[i][0] === v))); } };
        },
        button(parent, label, onClick, cls = '') {
          const b = el('button', 'btn btn-sm ' + cls, AM.mdi(label)); b.type = 'button'; b.id = id();
          b.addEventListener('click', onClick); parent.appendChild(b); return b;
        },
        toggle(parent, o) {
          const sid = id(o.id); const w = el('div', 'ctl ctl-check');
          w.innerHTML = `<input type="checkbox" id="${sid}" ${o.value ? 'checked' : ''}><label for="${sid}">${AM.mdi(o.label)}</label>`;
          const c = w.querySelector('input'); c.addEventListener('change', () => o.onChange && o.onChange(c.checked));
          parent.appendChild(w); return { el: w, get value() { return c.checked; }, set(v) { c.checked = v; } };
        },
        readout(parent, cls = '') {
          const r = el('div', 'readout ' + cls); r.setAttribute('aria-live', 'polite'); parent.appendChild(r);
          let lastHtml = '';
          return { el: r, set(src) { if (src === lastHtml) return; lastHtml = src; r.innerHTML = AM.md(src); } };
        },
        legend(parent, items) {
          const L = el('div', 'legend');
          L.innerHTML = items.map(([c, t]) => `<span><i style="background:var(--c${c})"></i>${AM.mdi(t)}</span>`).join('');
          parent.appendChild(L); return L;
        },
        /* play/pause button for animated visuals (starts paused for reduced-motion users) */
        player(parent, anim, autoplay = true) {
          const b = el('button', 'btn btn-sm btn-ghost'); b.type = 'button'; b.id = id('play');
          const sync = () => { b.textContent = anim.running ? 'Pause' : 'Play'; };
          b.addEventListener('click', () => { anim.running ? anim.stop() : anim.start(); sync(); });
          parent.appendChild(b);
          if (autoplay && !AM.reducedMotion()) anim.start();
          sync(); return { el: b, sync };
        },
      };
      return ui;
    },
  };

  /* Generic "functions with sliders" visual used by several lessons. */
  AM.widget('plot', (host, o, ctx) => {
    const ui = ctx.ui; const v = o.view || {};
    const P = new Plot(host, { ...v, label: o.label });
    const panel = ui.panel(host);
    const p = {};
    (o.params || []).forEach((s) => { p[s.id] = s.value; ui.slider(panel, { ...s, onInput: (x) => { p[s.id] = x; update(); } }); });
    if (o.legend) ui.legend(host, o.legend);
    const out = o.readout ? ui.readout(host) : null;
    function update() {
      P.draw((pl) => {
        if (o.under) o.under(pl, p);
        (o.curves || []).forEach((cv) => pl.fn((x) => cv.f(x, p), { color: cv.color ?? 1, dash: cv.dash, width: cv.width }));
        if (o.over) o.over(pl, p);
      });
      if (out) out.set(o.readout(p));
    }
    update();
  });
})();
