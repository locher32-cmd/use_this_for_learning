/* Exam-level (tier 4) problems for Stages 0 and 1: multi-step, university exam difficulty. */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, sgn = AM.sgn, poly = AM.poly, C = AM.checks, M = AM.m, E = AM.exam, PI = Math.PI;
  const pm = (r) => `\\begin{pmatrix} ${r.map((x) => x.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;

  /* ---------- Stage 0 ---------- */
  E('functions-transform', (R) => {
    const a = R.nz(-3, 3) * -1, s = R.int(1, 4), h = R.int(-3, 3), k = -a * s * s; // y = a(x-h)^2 + k with roots h ± s
    return {
      q: tx`The graph of $y = x^2$ is stretched vertically by a factor of ${Math.abs(a)}${a < 0 ? ', reflected in the $x$-axis' : ''}, shifted ${h >= 0 ? 'right' : 'left'} by ${Math.abs(h)} and ${k >= 0 ? 'up' : 'down'} by ${Math.abs(k)}. Find both $x$-intercepts of the new graph.`,
      ans: { type: 'vec', answer: [h - s, h + s], unordered: true, placeholder: 'x₁, x₂' },
      hint: tx`Write the new function as $a(x-h)^2 + k$, set it to 0 and solve for $x$.`,
      sol: [tx`New graph: $y = ${a}(x ${sgn(-h)})^2 ${sgn(k)}$.`, tx`$${a}(x ${sgn(-h)})^2 = ${-k}$ gives $(x ${sgn(-h)})^2 = ${s * s}$.`, tx`$x = ${h} \pm ${s}$, i.e. $x = ${h - s}$ and $x = ${h + s}$.`],
    };
  });
  E('functions-explog', (R) => {
    const a = R.int(2, 9), b = R.pick([2, 3, 5]), c = R.int(2, 9), d = R.pick([1.5, 1.2, 4, 7].filter((v) => v !== b));
    const x = Math.log(c / a) / Math.log(b / d);
    return {
      q: tx`Two investments grow as $A(t) = ${a}\cdot ${b}^t$ and $B(t) = ${c}\cdot ${d}^t$. Find the time $t$ at which they are equal. Four decimals.`,
      ans: { type: 'num', answer: x, tol: 0.0006 },
      hint: tx`Set them equal, collect the exponentials on one side ($(b/d)^t = c/a$), then take logs.`,
      sol: [tx`$${a}\cdot${b}^t = ${c}\cdot${d}^t \iff \left(\frac{${b}}{${d}}\right)^t = \frac{${c}}{${a}}$.`, tx`$t = \dfrac{\ln(${c}/${a})}{\ln(${b}/${d})} = \dfrac{${fmt(Math.log(c / a), 5)}}{${fmt(Math.log(b / d), 5)}} \approx ${fmt(x, 5)}$.`],
    };
  });
  E('functions-trig', (R) => {
    const vals = [-1, -0.5, 0, 0.5, 1], useSin = R.chance(0.5); let r1, r2; do { r1 = R.pick(vals); r2 = R.pick(vals); } while (r1 === r2);
    const A = 4, B = -4 * (r1 + r2), Cc = 4 * r1 * r2, fn = useSin ? '\\sin' : '\\cos';
    const angles = (r) => { const out = []; for (let d = 0; d < 360; d += 15) { const t = (d * PI) / 180; if (Math.abs((useSin ? Math.sin(t) : Math.cos(t)) - r) < 1e-9) out.push(t); } return out; };
    const sols = [...angles(r1), ...angles(r2)].sort((p, q) => p - q);
    return {
      q: tx`Find all solutions in $[0, 2\pi)$ of $${A}${fn}^2 x ${sgn(B)}${fn} x ${sgn(Cc)} = 0$. Enter them separated by commas (forms like <code>pi/6</code> are fine).`.replace('+ 0\\', '\\').replace(/[+-] 0 =/, ' ='),
      ans: { type: 'vec', answer: sols, unordered: true, tol: 0.002, placeholder: 'e.g. pi/6, 5pi/6, pi/2' },
      hint: tx`It's a quadratic in $u = ${fn} x$. Factor it, then find every angle in one full turn for each root.`,
      sol: [tx`With $u = ${fn} x$: $${A}u^2 ${sgn(B)}u ${sgn(Cc)} = 4(u ${sgn(-r1)})(u ${sgn(-r2)}) = 0$, so $u = ${fmt(r1)}$ or $u = ${fmt(r2)}$.`, tx`All angles in $[0, 2\pi)$: $${sols.map((t) => fmt(t, 4)).join(',\\ ')}$ (radians). That's ${sols.length} solutions.`],
    };
  });
  E('proof-logic', (R) => {
    const F = R.pick([
      ['(P \\Rightarrow Q) \\land (Q \\Rightarrow R)', (p, q, r) => (!p || q) && (!q || r)],
      ['(P \\lor Q) \\Rightarrow R', (p, q, r) => !(p || q) || r],
      ['\\lnot(P \\land Q) \\lor (Q \\Leftrightarrow R)', (p, q, r) => !(p && q) || q === r],
      ['(P \\oplus Q) \\land \\lnot R', (p, q, r) => p !== q && !r],
      ['(P \\Rightarrow (Q \\Rightarrow R)) \\Rightarrow ((P \\land Q) \\Rightarrow R)', () => true],
      ['(P \\land \\lnot Q) \\lor (Q \\land \\lnot R) \\lor (R \\land \\lnot P)', (p, q, r) => (p && !q) || (q && !r) || (r && !p)],
    ]);
    let n = 0; for (let i = 0; i < 8; i++) if (F[1](!!(i & 4), !!(i & 2), !!(i & 1))) n++;
    return {
      q: tx`In the 8-row truth table for $${F[0]}$, how many rows make the statement true?`,
      ans: { type: 'num', answer: n },
      hint: tx`List all 8 combinations of $P, Q, R$. It is often quicker to count the rows where the statement is **false** and subtract from 8.`,
      sol: [tx`Checking all 8 rows, the statement is true in ${n} of them.`, n === 8 ? tx`True in every row: it is a **tautology**.` : tx`It is false exactly when ${8 - n} of the combinations occur.`],
    };
  });
  E('proof-sets', (R) => {
    const abc = R.int(1, 4), ab = abc + R.int(1, 5), ac = abc + R.int(1, 5), bc = abc + R.int(1, 5), a = ab + ac - abc + R.int(2, 12), b = ab + bc - abc + R.int(2, 12), c = ac + bc - abc + R.int(2, 12);
    const uni = a + b + c - ab - ac - bc + abc, N = uni + R.int(3, 25);
    return {
      q: tx`Of ${N} students, ${a} take algebra, ${b} biology and ${c} chemistry. ${ab} take algebra and biology, ${ac} algebra and chemistry, ${bc} biology and chemistry, and ${abc} take all three. How many take none of the three?`,
      ans: { type: 'num', answer: N - uni },
      hint: tx`$|A\cup B\cup C| = |A| + |B| + |C| - |A\cap B| - |A\cap C| - |B\cap C| + |A\cap B\cap C|$.`,
      sol: [tx`$|A\cup B\cup C| = ${a} + ${b} + ${c} - ${ab} - ${ac} - ${bc} + ${abc} = ${uni}$.`, tx`None: $${N} - ${uni} = ${N - uni}$.`],
    };
  });
  E('proof-induction', (R) => {
    let r1, r2; do { r1 = R.pick([-2, -1, 2, 3, 4]); r2 = R.pick([-1, 1, 2, 3]); } while (r1 === r2);
    const A = R.nz(-3, 3), B = R.nz(-3, 3), a = (n) => A * r1 ** n + B * r2 ** n, p = r1 + r2, q = -r1 * r2;
    const expr = `${A}*(${r1})^n + (${B})*(${r2})^n`, F = AM.compile(expr, ['n']);
    return {
      q: tx`A sequence satisfies $a_n = ${p}a_{n-1} ${sgn(q)}a_{n-2}$ with $a_0 = ${a(0)}$ and $a_1 = ${a(1)}$. Find a closed formula for $a_n$.`.replace('= 1a', '= a').replace('+ 1a', '+ a').replace('- 1a', '- a').replace('= 0a_{n-1} ', '= '),
      ans: { type: 'fn', expr, vars: ['n'], domain: [0, 8], ints: true, placeholder: 'e.g. 2*3^n - (-1)^n' },
      hint: tx`Try $a_n = r^n$: you get the characteristic equation $r^2 = ${p}r ${sgn(q)}$. With two roots, $a_n = A r_1^n + B r_2^n$; fit $A, B$ to $a_0, a_1$.`,
      sol: [tx`$r^2 ${sgn(-p)}r ${sgn(-q)} = 0$ has roots $r = ${r1}$ and $r = ${r2}$.`, tx`$a_n = A(${r1})^n + B(${r2})^n$. From $a_0 = A + B = ${a(0)}$ and $a_1 = ${r1}A ${sgn(r2)}B = ${a(1)}$: $A = ${A}$, $B = ${B}$.`, tx`$a_n = ${A}(${r1})^n ${sgn(B)}(${r2})^n$. (Strong induction proves it: if it holds for $n-1$ and $n-2$, the recurrence gives it for $n$.)`],
      verify() { for (let n = 2; n < 10; n++) if (a(n) !== p * a(n - 1) + q * a(n - 2) || Math.abs(F({ n }) - a(n)) > 1e-9) return 'recurrence mismatch'; return true; },
    };
  });

  /* ---------- Stage 1 ---------- */
  E('calc1-limits', (R) => {
    const a = R.nz(-4, 4), kind = R.pick(['exp', 'cos', 'sin', 'ln']);
    const [tex, val, f, steps] = {
      exp: [tx`\frac{e^{${a}x} - 1 - ${a}x}{x^2}`.replace('- -', '+ '), (a * a) / 2, (x) => (Math.exp(a * x) - 1 - a * x) / (x * x), tx`Taylor: $e^{${a}x} = 1 + ${a}x + \frac{${a * a}x^2}{2} + O(x^3)$, so the numerator is $\frac{${a * a}}{2}x^2 + O(x^3)$.`],
      cos: [tx`\frac{1 - \cos(${a}x)}{x^2}`, (a * a) / 2, (x) => (1 - Math.cos(a * x)) / (x * x), tx`$\cos u = 1 - \frac{u^2}{2} + O(u^4)$ with $u = ${a}x$, so the numerator is $\frac{${a * a}x^2}{2} + O(x^4)$.`],
      sin: [tx`\frac{\sin(${a}x) - ${a}x}{x^3}`.replace('- -', '+ '), -(a ** 3) / 6, (x) => (Math.sin(a * x) - a * x) / x ** 3, tx`$\sin u = u - \frac{u^3}{6} + O(u^5)$, so the numerator is $-\frac{${a ** 3}x^3}{6} + O(x^5)$.`],
      ln: [tx`\frac{\ln(1 + ${a}x) - ${a}x}{x^2}`.replace('+ -', '- ').replace('- -', '+ '), -(a * a) / 2, (x) => (Math.log(1 + a * x) - a * x) / (x * x), tx`$\ln(1 + u) = u - \frac{u^2}{2} + O(u^3)$, so the numerator is $-\frac{${a * a}x^2}{2} + O(x^3)$.`],
    }[kind];
    return {
      q: tx`Evaluate $\displaystyle\lim_{x\to0}${tex}$.`,
      ans: { type: 'num', answer: val, abs: 1e-9, rel: 0.002, show: tx`$${AM.frac(Math.round(val * 6), 6)}$` },
      hint: tx`Substituting gives $\frac00$. Expand the numerator as a Taylor series (or apply L'Hôpital's rule repeatedly).`,
      sol: [steps, tx`Dividing by the denominator and letting $x\to0$ leaves $${AM.frac(Math.round(val * 6), 6)}$.`],
      verify: C.near(f(1e-3), val, 2e-2),
    };
  });
  E('calc1-derivative', (R) => {
    if (R.chance(0.5)) {
      const L = R.pick([5, 10, 13, 17, 25]), [x, y] = { 5: [3, 4], 10: [6, 8], 13: [5, 12], 17: [8, 15], 25: [7, 24] }[L], v = R.int(1, 4) / 2, yv = (-x * v) / y;
      return {
        q: tx`A ${L} m ladder leans against a wall. Its base slides away from the wall at ${v} m/s. How fast is the top moving (in m/s, negative if falling) when the base is ${x} m from the wall?`,
        ans: { type: 'num', answer: yv, tol: 0.002, unit: 'm/s' },
        hint: tx`Differentiate $x^2 + y^2 = ${L * L}$ with respect to time: $2xx' + 2yy' = 0$.`,
        sol: [tx`At $x = ${x}$: $y = \sqrt{${L * L} - ${x * x}} = ${y}$.`, tx`$y' = -\frac{x}{y}x' = -\frac{${x}}{${y}}(${v}) \approx ${fmt(yv, 4)}$ m/s.`],
      };
    }
    const V = R.int(2, 20) * 10, r = R.int(2, 10), rr = V / (4 * PI * r * r);
    return {
      q: tx`Air is pumped into a spherical balloon at ${V} cm³/s. How fast is the radius increasing when the radius is ${r} cm? Four decimals, in cm/s.`,
      ans: { type: 'num', answer: rr, tol: 0.0002 },
      hint: tx`$V = \frac43\pi r^3$, so $\frac{dV}{dt} = 4\pi r^2\frac{dr}{dt}$.`,
      sol: [tx`$${V} = 4\pi(${r})^2\,r'$, so $r' = \frac{${V}}{${4 * r * r}\pi} \approx ${fmt(rr, 5)}$ cm/s.`],
    };
  });
  E('calc1-rules', (R) => {
    const x0 = R.nz(-3, 3), y0 = R.nz(-3, 3), a = R.int(1, 3);
    const c = x0 * x0 + a * x0 * y0 + a * a * y0 * y0, slope = -(2 * x0 + a * y0) / (a * x0 + 2 * a * a * y0);
    if (!isFinite(slope)) return { q: tx`Find $\frac{dy}{dx}$ by implicit differentiation for $x^2 + y^2 = 25$ at $(3, 4)$.`, ans: { type: 'num', answer: -0.75 }, hint: tx`$2x + 2yy' = 0$.`, sol: [tx`$y' = -x/y = -\frac34$.`] };
    return {
      q: tx`The curve $x^2 + ${a === 1 ? '' : a}xy + ${a * a === 1 ? '' : a * a}y^2 = ${c}$ passes through $(${x0}, ${y0})$. Find the slope $\frac{dy}{dx}$ there.`,
      ans: { type: 'num', answer: slope, abs: 1e-9, rel: 0.002, show: tx`$${AM.frac(-(2 * x0 + a * y0), a * x0 + 2 * a * a * y0)}$` },
      hint: tx`Differentiate every term with respect to $x$, treating $y$ as a function of $x$ (product rule on the $xy$ term), then solve for $y'$.`,
      sol: [tx`$2x + ${a}(y + xy') + ${2 * a * a}yy' = 0$, so $y' = -\dfrac{2x + ${a}y}{${a}x + ${2 * a * a}y}$.`, tx`At $(${x0}, ${y0})$: $y' = -\dfrac{${2 * x0 + a * y0}}{${a * x0 + 2 * a * a * y0}} = ${AM.frac(-(2 * x0 + a * y0), a * x0 + 2 * a * a * y0)}$.`],
    };
  });
  E('calc1-optimization', (R) => {
    const a = R.int(1, 8), d = Math.sqrt(a - 0.25);
    return {
      q: tx`Find the shortest distance from the point $(${a}, 0)$ to the curve $y = \sqrt x$. Four decimals.`,
      ans: { type: 'num', answer: d, tol: 0.0006 },
      hint: tx`Minimize the *squared* distance $D(x) = (x - ${a})^2 + (\sqrt x)^2$; it has the same minimizer and no square root.`,
      sol: [tx`$D(x) = (x - ${a})^2 + x$, so $D'(x) = 2(x - ${a}) + 1 = 0$ at $x = ${a} - \tfrac12 = ${fmt(a - 0.5)}$.`, tx`$D = \tfrac14 + ${fmt(a - 0.5)} = ${fmt(a - 0.25)}$, so the distance is $\sqrt{${fmt(a - 0.25)}} \approx ${fmt(d, 5)}$.`],
    };
  });
  E('calc2-riemann', (R) => {
    const kind = R.pick(['exp', 'sin', 'x4']), b = R.pick([1, 2]), tol = R.pick([1e-3, 1e-4, 1e-5]), rule = R.pick(['trap', 'mid']);
    const [tex, K] = { exp: [tx`e^x`, Math.exp(b)], sin: [tx`\sin x`, 1], x4: [tx`x^4`, 12 * b * b] }[kind];
    const den = rule === 'trap' ? 12 : 24; let n = 1; while ((K * b ** 3) / (den * n * n) >= tol) n++;
    return {
      q: tx`How many subintervals $n$ does the ${rule === 'trap' ? 'trapezoid' : 'midpoint'} rule need to *guarantee* an error below $${tol}$ for $\int_0^{${b}} ${tex}\,dx$? Use the standard error bound.`.replace('0.001', '10^{-3}').replace('0.0001', '10^{-4}').replace('0.00001', '10^{-5}'),
      ans: { type: 'num', answer: n, tol: 0.01 },
      hint: tx`$|E| \le \frac{K(b-a)^3}{${den}n^2}$ with $K = \max|f''|$ on the interval. Solve for the smallest whole $n$.`,
      sol: [tx`$f''$ is largest at ${kind === 'sin' ? 'its peak' : `$x = ${b}$`}: $K = ${fmt(K, 4)}$.`, tx`Need $\frac{${fmt(K, 4)}\cdot${b ** 3}}{${den}n^2} < ${tol}$, i.e. $n > ${fmt(Math.sqrt((K * b ** 3) / (den * tol)), 4)}$.`, tx`So $n = ${n}$.`],
    };
  });
  E('calc2-ftc', (R) => {
    let r1, r2; do { r1 = R.int(-4, 3); r2 = R.int(-3, 5); } while (r2 <= r1);
    const m = r1 + r2, c = -r1 * r2, A = (r2 - r1) ** 3 / 6;
    return {
      q: tx`Find the area of the region enclosed by $y = x^2$ and $y = ${poly([m, c])}$.`,
      ans: { type: 'num', answer: A, show: tx`$${AM.frac((r2 - r1) ** 3, 6)}$` },
      hint: tx`Find where the curves cross, then integrate (top minus bottom) between those points.`,
      sol: [tx`$x^2 = ${poly([m, c])}$ gives $(x ${sgn(-r1)})(x ${sgn(-r2)}) = 0$: $x = ${r1}, ${r2}$.`, tx`The line is on top: $\int_{${r1}}^{${r2}}\left(${poly([-1, m, c])}\right)dx = \frac{(${r2} - (${r1}))^3}{6} = ${AM.frac((r2 - r1) ** 3, 6)}$.`],
      verify: C.integral((x) => m * x + c - x * x, r1, r2, A),
    };
  });
  E('calc2-techniques', (R) => {
    let p, q; do { p = R.int(1, 5); q = R.int(1, 5); } while (p === q);
    const a = R.int(0, 2), b = a + R.int(1, 4), v = (1 / (q - p)) * Math.log(((b + p) * (a + q)) / ((b + q) * (a + p)));
    return {
      q: tx`Compute $\displaystyle\int_{${a}}^{${b}}\frac{dx}{(x + ${p})(x + ${q})}$ using partial fractions. Five decimals.`,
      ans: { type: 'num', answer: v, tol: 0.00002 },
      hint: tx`$\frac{1}{(x + ${p})(x + ${q})} = \frac{A}{x + ${p}} + \frac{B}{x + ${q}}$; cover-up gives $A = \frac{1}{${q - p}}$, $B = -A$.`,
      sol: [tx`$\frac{1}{(x+${p})(x+${q})} = \frac{1}{${q - p}}\left(\frac{1}{x + ${p}} - \frac{1}{x + ${q}}\right)$.`, tx`Integrate: $\frac{1}{${q - p}}\left[\ln\frac{x + ${p}}{x + ${q}}\right]_{${a}}^{${b}} = \frac{1}{${q - p}}\ln\frac{${(b + p) * (a + q)}}{${(b + q) * (a + p)}} \approx ${fmt(v, 6)}$.`],
      verify: C.integral((x) => 1 / ((x + p) * (x + q)), a, b, v),
    };
  });
  E('calc2-series', (R) => {
    const k = R.int(2, 9), p = R.int(0, 3), kind = R.pick(['pow', 'pow', 'cent', 'fact']);
    if (kind === 'fact') return { q: tx`Find the radius of convergence of $\displaystyle\sum_{n=0}^\infty \frac{(2n)!}{(n!)^2}x^n$.`, ans: { type: 'num', answer: 0.25 }, hint: tx`Ratio test: simplify $\frac{a_{n+1}}{a_n} = \frac{(2n+2)(2n+1)}{(n+1)^2}$.`, sol: [tx`$\frac{(2n+2)(2n+1)}{(n+1)^2} \to 4$, so the series converges for $|4x| < 1$.`, tx`$R = \frac14$.`] };
    const c = kind === 'cent' ? R.nz(-3, 3) : 0;
    return {
      q: tx`Find the radius of convergence of $\displaystyle\sum_{n=1}^\infty \frac{n^{${p}}${c ? `(x ${sgn(-c)})^n` : 'x^n'}}{${k}^n}$.`.replace('n^{0}', '').replace('\\frac{(x', '\\frac{(x'),
      ans: { type: 'num', answer: k },
      hint: tx`Ratio test: $\left|\frac{a_{n+1}}{a_n}\right| = \left(\frac{n+1}{n}\right)^{${p}}\frac{|x${c ? ` ${sgn(-c)}` : ''}|}{${k}}$. Polynomial factors in $n$ don't change the radius.`,
      sol: [tx`The ratio tends to $\frac{|x${c ? ` ${sgn(-c)}` : ''}|}{${k}}$, which must be below 1.`, tx`$R = ${k}$${c ? `, centred at $x = ${c}$` : ''}.`],
    };
  });
  E('linalg-vectors', (R) => {
    const n = [R.nz(-4, 4), R.nz(-4, 4), R.int(-4, 4)], d = R.int(-8, 8), P = [R.int(-4, 4), R.int(-4, 4), R.int(-4, 4)];
    const num = Math.abs(n[0] * P[0] + n[1] * P[1] + n[2] * P[2] - d), L = Math.hypot(...n), dist = num / L;
    return {
      q: tx`Find the distance from the point $(${P.join(', ')})$ to the plane $${n[0]}x ${sgn(n[1])}y ${sgn(n[2])}z = ${d}$. Four decimals.`.replace('+ 0z', '').replace(/\b1x/, 'x'),
      ans: { type: 'num', answer: dist, tol: 0.0006 },
      hint: tx`Project any vector from the plane to the point onto the unit normal $\mathbf n/\|\mathbf n\|$, with $\mathbf n = (${n.join(', ')})$.`,
      sol: [tx`Distance $= \dfrac{|${n[0]}(${P[0]}) + ${n[1]}(${P[1]}) + ${n[2]}(${P[2]}) - ${d}|}{\sqrt{${n[0] ** 2} + ${n[1] ** 2} + ${n[2] ** 2}}} = \dfrac{${num}}{${fmt(L, 4)}} \approx ${fmt(dist, 5)}$.`],
    };
  });
  E('linalg-matrices', (R) => {
    let A, B; do { A = [[R.int(-3, 3), R.int(-3, 3)], [R.int(-3, 3), R.int(-3, 3)]]; B = [[R.int(-3, 3), R.int(-3, 3)], [R.int(-3, 3), R.int(-3, 3)]]; } while (!(A[0][0] * A[1][1] - A[0][1] * A[1][0]) || !(B[0][0] * B[1][1] - B[0][1] * B[1][0]));
    const dA = A[0][0] * A[1][1] - A[0][1] * A[1][0], dB = B[0][0] * B[1][1] - B[0][1] * B[1][0], k = R.int(2, 4), v = (dA ** k * dB) / dA, sc = R.int(2, 3), w = sc * sc * dA ** (k - 1) * dB;
    return {
      q: tx`Let $A = ${pm(A)}$ and $B = ${pm(B)}$. Compute $\det\!\left(${sc}A^{${k}}B A^{-1}\right)$ without multiplying the matrices out.`,
      ans: { type: 'num', answer: w },
      hint: tx`Use $\det(XY) = \det X\det Y$, $\det(A^{-1}) = 1/\det A$, and for $2\times2$ matrices $\det(cX) = c^2\det X$.`,
      sol: [tx`$\det A = ${dA}$ and $\det B = ${dB}$.`, tx`$\det(${sc}A^{${k}}BA^{-1}) = ${sc}^2(\det A)^{${k}}\det B\,(\det A)^{-1} = ${sc * sc}\cdot(${dA})^{${k - 1}}\cdot(${dB}) = ${w}$.`],
      verify: C.near(v * sc * sc, w, 1e-9),
    };
  });
  E('linalg-systems', (R) => {
    const r1 = [1, R.int(-2, 2), R.int(-2, 2)], r2 = [R.int(-2, 2), 1, R.int(-2, 2)], a = R.int(-3, 3), b = R.int(-3, 3);
    const r3 = [a * r1[0] + b * r2[0], a * r1[1] + b * r2[1], null], target = a * r1[2] + b * r2[2], off = R.nz(-4, 4);
    const det2 = r1[0] * r2[1] - r1[1] * r2[0]; if (!det2) return { q: tx`For which $k$ is $\begin{pmatrix}1 & 2\\ 2 & k\end{pmatrix}$ singular?`, ans: { type: 'num', answer: 4 }, hint: tx`$\det = k - 4$.`, sol: [tx`$k = 4$.`] };
    const k = target, shown = (v) => `${v}`;
    return {
      q: tx`For which value of $k$ does the matrix $${pm([r1.map(shown), r2.map(shown), [r3[0], r3[1], 'k ' + (off < 0 ? '- ' + -off : '+ ' + off)]])}$ fail to be invertible?`,
      ans: { type: 'num', answer: k - off },
      hint: tx`Expand the determinant along the third row (or column). It is linear in $k$; set it to 0.`,
      sol: [tx`Row 3's first two entries are $${a}\times$ row 1 $${sgn(b)}\times$ row 2. The rows are dependent exactly when the third entry matches too: $k ${sgn(off)} = ${a}(${r1[2]}) + ${b}(${r2[2]}) = ${target}$.`, tx`So $k = ${k - off}$.`],
      verify() { const M3 = [r1, r2, [r3[0], r3[1], k]]; const d = M3[0][0] * (M3[1][1] * M3[2][2] - M3[1][2] * M3[2][1]) - M3[0][1] * (M3[1][0] * M3[2][2] - M3[1][2] * M3[2][0]) + M3[0][2] * (M3[1][0] * M3[2][1] - M3[1][1] * M3[2][0]); return Math.abs(d) < 1e-9 ? true : `det ${d}`; },
    };
  });
  E('linalg-eigen', (R) => {
    const l1 = R.pick([2, 3, -1, -2]), l2 = R.pick([1, 0.5, -1, 2].filter((x) => x !== l1)), v1 = [1, R.int(-2, 2)], v2 = [1, R.int(-2, 2)]; if (v1[1] === v2[1]) v2[1] = v1[1] + 1;
    const c1 = R.nz(-2, 2), c2 = R.nz(-2, 2), n = R.int(3, 6), x = [c1 * v1[0] + c2 * v2[0], c1 * v1[1] + c2 * v2[1]];
    const res = c1 * l1 ** n * v1[1] + c2 * l2 ** n * v2[1];
    const P = [[v1[0], v2[0]], [v1[1], v2[1]]], dP = P[0][0] * P[1][1] - P[0][1] * P[1][0], Pi = [[P[1][1] / dP, -P[0][1] / dP], [-P[1][0] / dP, P[0][0] / dP]];
    const A = [[0, 0], [0, 0]]; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) A[i][j] = P[i][0] * l1 * Pi[0][j] + P[i][1] * l2 * Pi[1][j];
    return {
      q: tx`$A = ${pm(A.map((r) => r.map((v) => AM.fmt(v, 4))))}$ has eigenvectors $(${v1.join(', ')})$ with $\lambda = ${l1}$ and $(${v2.join(', ')})$ with $\lambda = ${l2}$. For $\mathbf x = (${x.join(', ')})$, find the **second** component of $A^{${n}}\mathbf x$.`,
      ans: { type: 'num', answer: res, tol: 0.002 },
      hint: tx`Write $\mathbf x = c_1\mathbf v_1 + c_2\mathbf v_2$. Then $A^n\mathbf x = c_1\lambda_1^n\mathbf v_1 + c_2\lambda_2^n\mathbf v_2$.`,
      sol: [tx`$\mathbf x = ${c1}(${v1.join(', ')}) ${sgn(c2)}(${v2.join(', ')})$.`, tx`$A^{${n}}\mathbf x = ${c1}\cdot(${l1})^{${n}}(${v1.join(', ')}) + ${c2}\cdot(${l2})^{${n}}(${v2.join(', ')})$.`, tx`Second component: $${fmt(res, 4)}$.`],
      verify() { let y = x.slice(); for (let i = 0; i < n; i++) y = [A[0][0] * y[0] + A[0][1] * y[1], A[1][0] * y[0] + A[1][1] * y[1]]; return Math.abs(y[1] - res) < 1e-6 * Math.max(1, Math.abs(res)) ? true : `power mismatch ${y[1]} vs ${res}`; },
    };
  });
  E('linalg-leastsq', (R) => {
    const xs = [1, 2, 3, R.int(4, 5)], c0 = R.pick([0.5, 1, 2, -1]), ys = xs.map((x) => Math.round(c0 * x * x + R.int(-2, 2)));
    const c = xs.reduce((s, x, i) => s + x * x * ys[i], 0) / xs.reduce((s, x) => s + x ** 4, 0);
    return {
      q: tx`Fit the one-parameter model $y = cx^2$ by least squares to $${xs.map((x, i) => `(${x}, ${ys[i]})`).join(',\\ ')}$. Find $c$ to 4 decimals.`,
      ans: { type: 'num', answer: c, tol: 0.0002 },
      hint: tx`Minimize $\sum(y_i - cx_i^2)^2$: differentiating in $c$ gives $c = \dfrac{\sum x_i^2y_i}{\sum x_i^4}$ (the normal equation with one column).`,
      sol: [tx`$\sum x_i^2y_i = ${xs.reduce((s, x, i) => s + x * x * ys[i], 0)}$ and $\sum x_i^4 = ${xs.reduce((s, x) => s + x ** 4, 0)}$.`, tx`$c = ${fmt(c, 5)}$.`],
    };
  });
  E('linalg-svd', (R) => {
    let A, d; do { A = [[R.int(-3, 4), R.int(-3, 4)], [R.int(-3, 4), R.int(-3, 4)]]; d = A[0][0] * A[1][1] - A[0][1] * A[1][0]; } while (!d);
    const [[a, b], [c, dd]] = A, E2 = AM.eig2(a * a + c * c, a * b + c * dd, a * b + c * dd, b * b + dd * dd), s1 = Math.sqrt(E2.ls[0]), v = E2.vs[0], u = [(a * v[0] + b * v[1]) / s1, (c * v[0] + dd * v[1]) / s1], entry = s1 * u[0] * v[0];
    return {
      q: tx`Let $A = ${pm(A)}$. Find the top-left entry of its best rank-1 approximation $A_1 = \sigma_1\mathbf u_1\mathbf v_1^T$. Three decimals.`,
      ans: { type: 'num', answer: entry, tol: 0.002 },
      hint: tx`Find the top eigenvalue and unit eigenvector $\mathbf v_1$ of $A^TA$, set $\sigma_1 = \sqrt{\lambda_1}$ and $\mathbf u_1 = A\mathbf v_1/\sigma_1$. Signs cancel in $\mathbf u_1\mathbf v_1^T$.`,
      sol: [tx`$A^TA = ${pm([[a * a + c * c, a * b + c * dd], [a * b + c * dd, b * b + dd * dd]])}$ has top eigenvalue $${fmt(E2.ls[0], 4)}$, so $\sigma_1 \approx ${fmt(s1, 4)}$ and $\mathbf v_1 \approx (${fmt(v[0], 4)}, ${fmt(v[1], 4)})$.`, tx`$\mathbf u_1 = A\mathbf v_1/\sigma_1 \approx (${fmt(u[0], 4)}, ${fmt(u[1], 4)})$.`, tx`Top-left of $A_1$: $\sigma_1u_{11}v_{11} \approx ${fmt(entry, 4)}$.`],
    };
  });
})();
