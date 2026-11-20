/* Exam-level (tier 4) problems for Stages 3 and 4. */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, sgn = AM.sgn, C = AM.checks, M = AM.m, E = AM.exam, PI = Math.PI;

  E('analysis-sequences', (R) => {
    const c = R.int(1, 12), L = (1 + Math.sqrt(1 + 4 * c)) / 2, a1 = R.int(0, 3);
    return {
      q: tx`Define $a_1 = ${a1}$ and $a_{n+1} = \sqrt{${c} + a_n}$. Assuming the sequence converges (it's monotone and bounded), find its limit. Five decimals.`,
      ans: { type: 'num', answer: L, tol: 0.00002 },
      hint: tx`If $a_n\to L$, then also $a_{n+1}\to L$, so $L = \sqrt{${c} + L}$. Keep the positive root.`,
      sol: [tx`$L^2 = ${c} + L$, i.e. $L^2 - L - ${c} = 0$.`, tx`$L = \frac{1 + \sqrt{1 + ${4 * c}}}{2} \approx ${fmt(L, 6)}$ (the negative root is impossible since every term is $\ge 0$).`, tx`Monotone convergence: if $a_n < L$ then $a_{n+1} = \sqrt{${c} + a_n} > a_n$ and $< L$, so the sequence increases and is bounded by $L$.`],
      verify() { let a = a1; for (let i = 0; i < 200; i++) a = Math.sqrt(c + a); return Math.abs(a - L) < 1e-10 ? true : 'limit mismatch'; },
    };
  });
  E('analysis-continuity', (R) => {
    const a = R.pick([0.5, 1, 2, 3]), e = R.pick([0.1, 0.01, 0.05, 0.2]), d = e * a * a;
    return {
      q: tx`On $[${a}, \infty)$, find the largest $\delta$ that works **uniformly** for $f(x) = \frac1x$ with $\varepsilon = ${e}$, using the bound $\left|\frac1x - \frac1y\right| = \frac{|x - y|}{xy} \le \frac{|x-y|}{${a}^2}$.`,
      ans: { type: 'num', answer: d, abs: 1e-9, rel: 0.002 },
      hint: tx`You need $\frac{|x - y|}{${a * a}} < \varepsilon$ whenever $|x - y| < \delta$.`,
      sol: [tx`Since $x, y \ge ${a}$, $xy \ge ${a * a}$, so $|1/x - 1/y| \le |x - y|/${a * a}$.`, tx`Take $\delta = ${a * a}\varepsilon = ${fmt(d, 6)}$, the same for every point: uniform continuity on $[${a}, \infty)$. On $(0, \infty)$ no single $\delta$ works.`],
    };
  });
  E('analysis-uniform', (R) => {
    const p = R.pick([2, 3, 4]), e = R.pick([0.01, 0.001, 0.0001]);
    let N = 1; while (N ** (1 - p) / (p - 1) >= e) N++;
    return {
      q: tx`By the Weierstrass M-test, $\sum_{n=1}^\infty \frac{\sin(nx)}{n^{${p}}}$ converges uniformly. Using the integral bound $\sum_{n>N}\frac1{n^{${p}}} \le \int_N^\infty \frac{dt}{t^{${p}}}$, find the smallest $N$ that guarantees $\left|\text{tail after } N \text{ terms}\right| < ${e}$ for every $x$.`,
      ans: { type: 'num', answer: N, tol: 0.01 },
      hint: tx`$\int_N^\infty t^{-${p}}\,dt = \frac{N^{${1 - p}}}{${p - 1}}$. Solve $\frac{1}{${p - 1}N^{${p - 1}}} < ${e}$.`,
      sol: [tx`Need $${p - 1}N^{${p - 1}} > ${fmt(1 / e)}$, i.e. $N > ${fmt((1 / ((p - 1) * e)) ** (1 / (p - 1)), 4)}$.`, tx`So $N = ${N}$, and because the bound doesn't depend on $x$ the convergence is uniform.`],
    };
  });
  E('numerics-floating', (R) => {
    const k = R.int(8, 15), x = 10 ** k, v = 1 / (Math.sqrt(x + 1) + Math.sqrt(x));
    return {
      q: tx`Computed naively in double precision, $\sqrt{x + 1} - \sqrt{x}$ at $x = 10^{${k}}$ loses most of its digits. Rewrite it stably and give its value to 4 significant figures (use scientific notation like <code>1.581e-5</code>).`,
      ans: { type: 'num', answer: v, abs: 1e-14, rel: 0.0005 },
      hint: tx`Multiply and divide by the conjugate $\sqrt{x+1} + \sqrt x$.`,
      sol: [tx`$\sqrt{x+1} - \sqrt x = \dfrac{1}{\sqrt{x+1} + \sqrt x}$.`, tx`At $x = 10^{${k}}$ that's $\approx \frac{1}{2\cdot10^{${k / 2}}} \approx ${v.toExponential(4)}$.`, tx`The naive subtraction in double precision gives $${(Math.sqrt(x + 1) - Math.sqrt(x)).toExponential(4)}$: ${Math.abs(Math.sqrt(x + 1) - Math.sqrt(x) - v) / v > 0.01 ? 'badly wrong' : 'only a few correct digits'}.`],
    };
  });
  E('numerics-roots', (R) => {
    const c = R.pick([2, 3, 5, 7, 10, 17, 50]), x0 = R.pick([1, 4, 10, 20]), r = Math.sqrt(c);
    let x = x0, n = 0; while (Math.abs(x - r) >= 1e-10 && n < 100) { x = (x + c / x) / 2; n++; }
    return {
      q: tx`Newton's method for $\sqrt{${c}}$ ($x_{n+1} = \frac12(x_n + ${c}/x_n)$) starts at $x_0 = ${x0}$. How many iterations until $|x_n - \sqrt{${c}}| < 10^{-10}$?`,
      ans: { type: 'num', answer: n, tol: 0.01 },
      hint: tx`Iterate and track the error. Far from the root, the error roughly halves each step; once close, the number of correct digits doubles.`,
      sol: [tx`Iterates: ${(() => { let y = x0; const out = []; for (let i = 0; i < n; i++) { y = (y + c / y) / 2; out.push(`$${fmt(y, 12)}$`); } return out.join(', '); })()}.`, tx`The error first drops below $10^{-10}$ after ${n} iterations.`],
    };
  });
  E('numerics-odesolvers', (R) => {
    const k = R.pick([1, -1, 2, 0.5, -0.5, 1.5]), n = R.pick([2, 4, 5, 8]), h = 1 / n, yh = (1 + k * h) ** n, yh2 = (1 + (k * h) / 2) ** (2 * n), rich = 2 * yh2 - yh, ex = Math.exp(k);
    return {
      q: tx`For $y' = ${k}y$, $y(0) = 1$, Euler's method gives $y(1) \approx ${fmt(yh, 6)}$ with $h = ${fmt(h)}$ and $\approx ${fmt(yh2, 6)}$ with $h = ${fmt(h / 2)}$. Use Richardson extrapolation (Euler is first order) to get an improved estimate. Five decimals.`.replace("y' = 1y", "y' = y"),
      ans: { type: 'num', answer: rich, tol: 0.00002 },
      hint: tx`For a first-order method, error $\approx Ch$, so $y \approx 2y_{h/2} - y_h$ cancels the leading error term.`,
      sol: [tx`$2(${fmt(yh2, 6)}) - ${fmt(yh, 6)} = ${fmt(rich, 6)}$.`, tx`The exact value is $e^{${k}} = ${fmt(ex, 6)}$. The error is $${fmt(Math.abs(yh2 - ex), 4)}$ before and $${fmt(Math.abs(rich - ex), 4)}$ after extrapolating.`],
    };
  });
  E('complex-numbers', (R) => {
    const p = R.int(1, 5), q = R.nz(-5, 5), a = p * p - q * q, b = 2 * p * q;
    return {
      q: tx`Find the square root of $${AM.fmt(a)} ${b < 0 ? '-' : '+'} ${Math.abs(b)}i$ that has positive real part. Enter real and imaginary parts.`,
      ans: { type: 'vec', answer: [p, q], placeholder: 'real, imaginary' },
      hint: tx`Write $(x + iy)^2 = x^2 - y^2 + 2ixy$ and match: $x^2 - y^2 = ${a}$, $2xy = ${b}$. Also $x^2 + y^2 = |z| = ${Math.hypot(a, b)}$.`,
      sol: [tx`$x^2 - y^2 = ${a}$ and $x^2 + y^2 = ${Math.hypot(a, b)}$ give $x^2 = ${p * p}$, $y^2 = ${q * q}$.`, tx`$2xy = ${b}$ fixes the signs: with $x > 0$, $x = ${p}$ and $y = ${q}$. Check: $(${p} ${q < 0 ? '-' : '+'} ${Math.abs(q)}i)^2 = ${a} ${b < 0 ? '-' : '+'} ${Math.abs(b)}i$.`],
    };
  });
  E('complex-analytic', (R) => {
    const a = R.int(-3, 3), x0 = R.int(-2, 2), y0 = R.nz(-2, 2), v = 3 * x0 * x0 * y0 - y0 ** 3 + a * y0;
    return {
      q: tx`$u(x,y) = x^3 - 3xy^2 ${sgn(a)}x$ is harmonic. Find its harmonic conjugate $v$ with $v(0,0) = 0$ (so $u + iv$ is analytic), and evaluate $v(${x0}, ${y0})$.`.replace(/ [+-] 0x/, ''),
      ans: { type: 'num', answer: v },
      hint: tx`Cauchy–Riemann: $v_y = u_x = 3x^2 - 3y^2 ${sgn(a)}$. Integrate in $y$, then fix the function of $x$ using $v_x = -u_y = 6xy$.`,
      sol: [tx`$v = 3x^2y - y^3 ${sgn(a)}y + g(x)$, and $v_x = 6xy + g'(x) = 6xy$ forces $g$ constant, so $g = 0$.`, tx`$v(${x0}, ${y0}) = ${v}$. (This is $f(z) = z^3 ${sgn(a)}z$.)`],
    };
  });
  E('complex-residues', (R) => {
    const a = R.int(2, 6), b = R.int(1, a - 1), v = (2 * PI) / Math.sqrt(a * a - b * b);
    return {
      q: tx`Evaluate $\displaystyle\int_0^{2\pi}\frac{d\theta}{${a} + ${b === 1 ? '' : b}\cos\theta}$ using residues. Four decimals.`,
      ans: { type: 'num', answer: v, tol: 0.0006 },
      hint: tx`Substitute $z = e^{i\theta}$: $\cos\theta = \frac{z + z^{-1}}{2}$, $d\theta = \frac{dz}{iz}$. The integral becomes a contour integral around $|z| = 1$; find the pole inside.`,
      sol: [tx`The integrand becomes $\frac{2}{i}\cdot\frac{1}{${b}z^2 + ${2 * a}z + ${b}}$. Its poles are the roots of $${b}z^2 + ${2 * a}z + ${b}$; only $z_+ = \frac{-${a} + \sqrt{${a * a - b * b}}}{${b}}$ lies inside $|z| = 1$.`, tx`Residue theorem gives $\frac{2\pi}{\sqrt{${a}^2 - ${b}^2}} = \frac{2\pi}{\sqrt{${a * a - b * b}}} \approx ${fmt(v, 5)}$.`],
      verify: C.integral((t) => 1 / (a + b * Math.cos(t)), 0, 2 * PI, v),
    };
  });
  E('fourier-series', (R) => {
    const N = R.pick([1, 3, 5, 7, 9]); let s = 0; for (let k = 1; k <= N; k += 2) s += 1 / (k * k); const frac = (8 / (PI * PI)) * s;
    return {
      q: tx`By Parseval's theorem, what fraction of the square wave's energy ($\frac1\pi\int_{-\pi}^{\pi}f^2\,dx = 2$) is captured by its harmonics with $k \le ${N}$? Four decimals.`,
      ans: { type: 'num', answer: frac, tol: 0.0006 },
      hint: tx`The coefficients are $b_k = \frac{4}{\pi k}$ for odd $k$. Each harmonic contributes $b_k^2$ to the energy sum.`,
      sol: [tx`Captured energy $= \sum_{k\text{ odd}\le${N}}\frac{16}{\pi^2k^2}$; divide by the total, 2.`, tx`Fraction $= \frac{8}{\pi^2}\sum_{k\text{ odd}\le${N}}\frac1{k^2} \approx ${fmt(frac, 5)}$. As $N\to\infty$ this tends to 1, which proves $\sum_{k\text{ odd}}\frac1{k^2} = \frac{\pi^2}{8}$.`],
    };
  });
  E('fourier-heat', (R) => {
    const L = R.pick([0.5, 1, 2]), k = R.pick([1e-4, 1.1e-4, 9.7e-5, 2.3e-5]), mat = { 0.0001: 'steel-like', 0.00011: 'aluminium-like', 0.000097: 'copper-like', 0.000023: 'stone-like' }[k] || '', f = R.pick([0.5, 0.1, 0.01]);
    const t = (Math.log(1 / f) * L * L) / (k * PI * PI);
    return {
      q: tx`A ${L} m rod with diffusivity $\kappa = ${k.toExponential(1).replace('e', '\\times10^{').replace(/$/, '}')}$ m²/s has its ends held at 0°C. Starting from $u(x,0) = \sin(\pi x/${L})$, how many seconds until the temperature has decayed to ${f * 100}% of its initial size? Round to the nearest second.`,
      ans: { type: 'num', answer: t, tol: 1 },
      hint: tx`This single mode decays as $e^{-\kappa(\pi/L)^2t}$. Set that equal to ${f} and solve for $t$.`,
      sol: [tx`$e^{-\kappa\pi^2t/L^2} = ${f}$ gives $t = \frac{L^2\ln(1/${f})}{\kappa\pi^2}$.`, tx`$t \approx ${fmt(t, 1)}$ s, about ${fmt(t / 60, 1)} minutes. Doubling the length quadruples the time.`],
    };
  });
  E('fourier-wave', (R) => {
    const L = R.pick([0.65, 0.33, 1, 0.5]), f = R.pick([110, 196, 220, 330, 440]), rho = R.pick([0.0005, 0.001, 0.002, 0.004]), T = rho * (2 * L * f) ** 2;
    return {
      q: tx`A string of length ${L} m and linear density ${rho} kg/m must have fundamental frequency ${f} Hz. What tension (in newtons) is needed? One decimal.`,
      ans: { type: 'num', answer: T, tol: 0.06, unit: 'N' },
      hint: tx`$f_1 = \frac{c}{2L}$ with $c = \sqrt{T/\rho}$. Solve for $T$.`,
      sol: [tx`$c = 2Lf_1 = 2(${L})(${f}) = ${fmt(2 * L * f, 3)}$ m/s.`, tx`$T = \rho c^2 = ${rho}\times${fmt(2 * L * f, 3)}^2 \approx ${fmt(T, 2)}$ N.`],
    };
  });
  E('optim-gd', (R) => {
    const a = R.int(1, 10), b = R.int(1, 10); if (a === b) return { q: tx`For $f = x^2 + y^2$ with the optimal fixed step, what is the error contraction factor per step?`, ans: { type: 'num', answer: 0 }, hint: tx`$\kappa = 1$.`, sol: [tx`$(\kappa - 1)/(\kappa + 1) = 0$: one step reaches the minimum.`] };
    const lmin = 2 * Math.min(a, b), lmax = 2 * Math.max(a, b), eta = 2 / (lmin + lmax), rate = (lmax - lmin) / (lmax + lmin);
    return {
      q: tx`Gradient descent on $f(x,y) = ${a === 1 ? '' : a}x^2 + ${b === 1 ? '' : b}y^2$ uses the best fixed step $\eta^* = \frac{2}{\lambda_{\min} + \lambda_{\max}}$ (eigenvalues of the Hessian). Find $\eta^*$ and the worst-case factor by which the error shrinks each step. Enter both.`,
      ans: { type: 'vec', answer: [eta, rate], abs: 1e-6, rel: 0.002, placeholder: 'η*, factor' },
      hint: tx`Hessian eigenvalues: $${2 * a}$ and $${2 * b}$. With $\eta^*$, each coordinate's factor $|1 - \eta\lambda|$ equals $\frac{\kappa - 1}{\kappa + 1}$, where $\kappa = \lambda_{\max}/\lambda_{\min}$.`,
      sol: [tx`$\eta^* = \frac{2}{${lmin} + ${lmax}} = ${fmt(eta, 5)}$.`, tx`$\kappa = ${fmt(lmax / lmin, 4)}$, factor $= \frac{\kappa - 1}{\kappa + 1} = ${fmt(rate, 5)}$. Badly conditioned problems ($\kappa$ large) converge slowly.`],
    };
  });
  E('optim-lagrange', (R) => {
    const a = R.int(1, 4), b = R.int(1, 4), c = R.int(1, 4), S = R.int(2, 6) * 3, v = S ** 3 / (27 * a * b * c);
    return {
      q: tx`Maximize $f = xyz$ subject to $${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y + ${c === 1 ? '' : c}z = ${S}$ with $x, y, z > 0$. What is the maximum? Three decimals.`,
      ans: { type: 'num', answer: v, tol: 0.002 },
      hint: tx`$\nabla(xyz) = \lambda(${a}, ${b}, ${c})$ gives $yz = ${a}\lambda$, $xz = ${b}\lambda$, $xy = ${c}\lambda$. Multiplying each by the missing variable shows $${a}x = ${b}y = ${c}z$.`,
      sol: [tx`Equal shares of the budget: $${a}x = ${b}y = ${c}z = \frac{${S}}{3} = ${S / 3}$.`, tx`$x = ${fmt(S / (3 * a), 4)}$, $y = ${fmt(S / (3 * b), 4)}$, $z = ${fmt(S / (3 * c), 4)}$, so $f = \frac{${S}^3}{27\cdot${a * b * c}} \approx ${fmt(v, 4)}$.`],
    };
  });
  E('optim-lp', (R) => {
    const solve = (b1, b2, A1, A2, c) => { const lines = [[...A1, b1], [...A2, b2], [1, 0, 0], [0, 1, 0]]; let best = -Infinity; for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const [a1, bb1, k1] = lines[i], [a2, bb2, k2] = lines[j], d = a1 * bb2 - a2 * bb1; if (!d) continue; const x = (k1 * bb2 - k2 * bb1) / d, y = (a1 * k2 - a2 * k1) / d; if (x > -1e-9 && y > -1e-9 && A1[0] * x + A1[1] * y <= b1 + 1e-9 && A2[0] * x + A2[1] * y <= b2 + 1e-9) best = Math.max(best, c[0] * x + c[1] * y); } return best; };
    const A1 = [R.int(1, 3), R.int(1, 3)], A2 = [R.int(1, 3), R.int(1, 3)], c = [R.int(1, 6), R.int(1, 6)], b1 = R.int(6, 16), b2 = R.int(6, 16);
    const z0 = solve(b1, b2, A1, A2, c), z1 = solve(b1 + 1, b2, A1, A2, c), sp = z1 - z0;
    return {
      q: tx`For the LP: maximize $${c[0]}x + ${c[1]}y$ subject to $${A1[0]}x + ${A1[1]}y \le ${b1}$, $${A2[0]}x + ${A2[1]}y \le ${b2}$, $x, y\ge0$, find the **shadow price** of the first constraint: how much the optimum rises if its right-hand side increases from ${b1} to ${b1 + 1}. Three decimals.`.replace(/\b1x/g, 'x').replace(/\b1y/g, 'y'),
      ans: { type: 'num', answer: sp, tol: 0.002 },
      hint: tx`Solve the LP twice (corner method), once with ${b1} and once with ${b1 + 1}, and subtract. If the constraint isn't tight at the optimum, its shadow price is 0.`,
      sol: [tx`Optimum with RHS ${b1}: $${fmt(z0, 4)}$. With ${b1 + 1}: $${fmt(z1, 4)}$.`, tx`Shadow price $\approx ${fmt(sp, 4)}$: the value of one more unit of that resource. It equals the dual variable of the constraint.`],
    };
  });
  E('modeling-chaos', (R) => {
    const r = R.pick([3.1, 3.2, 3.3, 3.4, 3.45, 3.5]), m = -r * r + 2 * r + 4;
    return {
      q: tx`For the logistic map at $r = ${r}$, the 2-cycle $\{p, q\}$ has stability multiplier $f'(p)f'(q)$. Compute it and say whether the cycle is stable. Enter the multiplier.`,
      ans: { type: 'num', answer: m, tol: 0.002 },
      hint: tx`$f'(x) = r(1 - 2x)$. Using $p + q = \frac{r+1}{r}$ and $pq = \frac{r+1}{r^2}$, the product simplifies to $-r^2 + 2r + 4$.`,
      sol: [tx`$f'(p)f'(q) = r^2(1 - 2p)(1 - 2q) = r^2\left(1 - 2(p+q) + 4pq\right) = -r^2 + 2r + 4$.`, tx`At $r = ${r}$: $${fmt(m, 4)}$. ${Math.abs(m) < 1 ? 'Magnitude below 1, so the 2-cycle is **stable**.' : 'Magnitude at least 1, so the 2-cycle is **unstable**: it has doubled into a 4-cycle.'} It reaches $-1$ at $r = 1 + \sqrt6 \approx 3.449$.`],
      verify() { const disc = (r + 1) * (r - 3), p = ((r + 1) + Math.sqrt(disc)) / (2 * r), q = ((r + 1) - Math.sqrt(disc)) / (2 * r); return Math.abs(r * (1 - 2 * p) * r * (1 - 2 * q) - m) < 1e-9 ? true : 'multiplier mismatch'; },
    };
  });
  E('modeling-sir', (R) => {
    const b = R.pick([0.3, 0.4, 0.5, 0.6]), D = R.pick([4, 5, 7, 10]), g = 1 / D, v = R.pick([0, 0.2, 0.3, 0.4]), rate = b * (1 - v) - g;
    if (rate <= 0) return { q: tx`If $\beta = 0.2$ and $\gamma = 0.25$, does an outbreak grow?`, ans: { type: 'mc', choices: ['Yes', 'No'], answer: 1 }, hint: tx`Compare $\beta$ with $\gamma$.`, sol: [tx`$R_0 = 0.8 < 1$: it shrinks.`] };
    const td = Math.log(2) / rate;
    return {
      q: tx`A disease has $\beta = ${b}$ per day and lasts ${D} days on average. ${v ? `${v * 100}% of people are vaccinated. ` : ''}Early in the outbreak, what is the doubling time of the number of infected people, in days? Two decimals.`,
      ans: { type: 'num', answer: td, tol: 0.01 },
      hint: tx`While almost everyone unvaccinated is susceptible, $I' \approx (\beta S_0 - \gamma)I$ with $S_0 = ${fmt(1 - v)}$.`,
      sol: [tx`Growth rate $= \beta S_0 - \gamma = ${b}(${fmt(1 - v)}) - ${fmt(g, 4)} = ${fmt(rate, 4)}$ per day.`, tx`Doubling time $= \frac{\ln 2}{${fmt(rate, 4)}} \approx ${fmt(td, 3)}$ days.`],
    };
  });
  E('modeling-markov', (R) => {
    const p = R.pick([0.4, 0.45, 0.55, 0.6]), N = R.int(5, 12), i = R.int(1, N - 1), r = (1 - p) / p, v = (1 - r ** i) / (1 - r ** N);
    return {
      q: tx`Gambler's ruin: you start with \$${i} and bet \$1 at a time, winning each bet with probability ${p}. You stop at \$0 or \$${N}. What's the probability you reach \$${N}? Four decimals.`,
      ans: { type: 'num', answer: v, tol: 0.0006 },
      hint: tx`Let $h_i$ be the success probability from \$$i$. Then $h_i = p\,h_{i+1} + (1-p)h_{i-1}$ with $h_0 = 0$, $h_N = 1$. The solution is $h_i = \frac{1 - r^i}{1 - r^N}$ with $r = \frac{1-p}{p}$.`,
      sol: [tx`$r = \frac{${fmt(1 - p)}}{${p}} = ${fmt(r, 5)}$.`, tx`$h_{${i}} = \frac{1 - ${fmt(r, 5)}^{${i}}}{1 - ${fmt(r, 5)}^{${N}}} \approx ${fmt(v, 5)}$.`, tx`${p < 0.5 ? 'With slightly unfavourable odds, the chance of winning falls fast as the target rises: the house edge compounds.' : 'Favourable odds compound in your favour.'}`],
      verify() { const h = new Array(N + 1).fill(0); h[N] = 1; for (let it = 0; it < 20000; it++) for (let k = 1; k < N; k++) h[k] = p * h[k + 1] + (1 - p) * h[k - 1]; return Math.abs(h[i] - v) < 1e-6 ? true : `ruin mismatch ${h[i]}`; },
    };
  });
})();
