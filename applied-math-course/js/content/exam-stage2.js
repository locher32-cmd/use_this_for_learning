/* Exam-level (tier 4) problems for Stage 2. */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, sgn = AM.sgn, C = AM.checks, M = AM.m, E = AM.exam;
  const pm = (r) => `\\begin{pmatrix} ${r.map((x) => x.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;

  E('multivar-partials', (R) => {
    const a = R.int(1, 3), b = R.nz(-2, 2), t0 = R.pick([0.5, 1, 1.5, 2]);
    const f = (x, y) => a * x * x * y + b * y ** 3, X = (t) => t * t, Y = (t) => Math.sin(t);
    const dz = (2 * a * X(t0) * Y(t0)) * 2 * t0 + (a * X(t0) ** 2 + 3 * b * Y(t0) ** 2) * Math.cos(t0);
    return {
      q: tx`Let $z = ${a === 1 ? '' : a}x^2y ${sgn(b)}y^3$ with $x = t^2$ and $y = \sin t$. Find $\frac{dz}{dt}$ at $t = ${t0}$ using the multivariable chain rule. Four decimals.`.replace('+ 1y^3', '+ y^3').replace('- 1y^3', '- y^3'),
      ans: { type: 'num', answer: dz, tol: 0.0006 },
      hint: tx`$\frac{dz}{dt} = z_x\frac{dx}{dt} + z_y\frac{dy}{dt}$ with $z_x = ${2 * a}xy$ and $z_y = ${a}x^2 + ${3 * b}y^2$.`,
      sol: [tx`At $t = ${t0}$: $x = ${fmt(X(t0), 4)}$, $y = ${fmt(Y(t0), 5)}$, $x' = ${2 * t0}$, $y' = \cos ${t0} = ${fmt(Math.cos(t0), 5)}$.`, tx`$z_x = ${fmt(2 * a * X(t0) * Y(t0), 5)}$ and $z_y = ${fmt(a * X(t0) ** 2 + 3 * b * Y(t0) ** 2, 5)}$.`, tx`$\frac{dz}{dt} \approx ${fmt(dz, 5)}$.`],
      verify: C.near(M.deriv((t) => f(X(t), Y(t)), t0), dz, 1e-5),
    };
  });
  E('multivar-gradient', (R) => {
    const a = R.int(1, 3), b = R.int(1, 4), c = R.int(-3, 3), d = R.int(-5, 5);
    const minv = -2 * a ** 3 + d;
    return {
      q: tx`Find all critical points of $f(x,y) = x^3 - ${3 * a * a}x + ${b === 1 ? '' : b}(y ${sgn(-c)})^2 ${sgn(d)}$ and classify them. Enter the value of $f$ at the local minimum.`.replace('(y + 0)', 'y').replace('(y - 0)', 'y').replace(/ \+ 0\$/, '$'),
      ans: { type: 'num', answer: minv },
      hint: tx`$f_x = 3x^2 - ${3 * a * a}$ and $f_y = ${2 * b}(y ${sgn(-c)})$. Then use $D = f_{xx}f_{yy} - f_{xy}^2$.`,
      sol: [tx`Critical points: $x = \pm${a}$, $y = ${c}$.`, tx`$f_{xx} = 6x$, $f_{yy} = ${2 * b}$, $f_{xy} = 0$. At $(${a}, ${c})$: $D = ${12 * a * b} > 0$ and $f_{xx} > 0$, a local minimum. At $(-${a}, ${c})$: $D < 0$, a saddle.`, tx`$f(${a}, ${c}) = ${a ** 3} - ${3 * a ** 3} + ${d} = ${minv}$.`],
    };
  });
  E('multivar-double', (R) => {
    const a = R.pick([1, 1.5, 2]), kind = R.pick(['exp', 'sin', 'cos']);
    const [ftex, F, val] = { exp: ['e^{x^2}', (x) => Math.exp(x * x), (Math.exp(a * a) - 1) / 2], sin: ['\\sin(x^2)', (x) => Math.sin(x * x), (1 - Math.cos(a * a)) / 2], cos: ['\\cos(x^2)', (x) => Math.cos(x * x), Math.sin(a * a) / 2] }[kind];
    return {
      q: tx`Evaluate $\displaystyle\int_0^{${a}}\!\int_y^{${a}} ${ftex}\,dx\,dy$. (Hint: the inner integral has no elementary antiderivative.) Four decimals.`,
      ans: { type: 'num', answer: val, tol: 0.0006 },
      hint: tx`Swap the order of integration. The region is $0 \le y \le x \le ${a}$, so integrate $y$ from 0 to $x$ first.`,
      sol: [tx`Region: $0 \le y \le x \le ${a}$. Reversed: $\displaystyle\int_0^{${a}}\!\int_0^{x} ${ftex}\,dy\,dx = \int_0^{${a}} x\,${ftex}\,dx$.`, tx`Substituting $u = x^2$ makes this elementary: the result is $${fmt(val, 5)}$.`],
      verify: C.near(M.integrate((x) => x * F(x), 0, a, 4000), val, 1e-8),
    };
  });
  E('multivar-fields', (R) => {
    const a = R.nz(-3, 3), b = R.nz(-2, 2), P = [R.int(-2, 2), R.int(-2, 2)], Q = [R.int(-2, 3), R.int(-2, 3)];
    const phi = (x, y) => a * x * x * y + b * y ** 3 + x, v = phi(...Q) - phi(...P);
    return {
      q: tx`$\mathbf F = (${2 * a}xy + 1,\ ${a}x^2 ${sgn(3 * b)}y^2)$. Show it is conservative and compute $\int_C \mathbf F\cdot d\mathbf r$ along any path from $(${P.join(', ')})$ to $(${Q.join(', ')})$.`,
      ans: { type: 'num', answer: v },
      hint: tx`Check $\partial Q/\partial x = \partial P/\partial y$, then find a potential $\phi$ with $\nabla\phi = \mathbf F$ and evaluate $\phi(\text{end}) - \phi(\text{start})$.`,
      sol: [tx`$\frac{\partial}{\partial x}(${a}x^2 ${sgn(3 * b)}y^2) = ${2 * a}x = \frac{\partial}{\partial y}(${2 * a}xy + 1)$: conservative.`, tx`Potential: $\phi = ${a}x^2y ${sgn(b)}y^3 + x$.`, tx`$\phi(${Q.join(', ')}) - \phi(${P.join(', ')}) = ${phi(...Q)} - (${phi(...P)}) = ${v}$.`],
      verify: C.near(M.integrate((t) => { const x = P[0] + (Q[0] - P[0]) * t, y = P[1] + (Q[1] - P[1]) * t; return (2 * a * x * y + 1) * (Q[0] - P[0]) + (a * x * x + 3 * b * y * y) * (Q[1] - P[1]); }, 0, 1), v, 1e-8),
    };
  });
  E('ode-slope', (R) => {
    const r = R.pick([0.2, 0.3, 0.5, 0.8, 1]), K = R.int(2, 20) * 100;
    return {
      q: tx`A fish population follows $P' = ${r}P\left(1 - \frac{P}{${K}}\right) - H$, where $H$ is a constant harvest per year. What is the largest $H$ for which a positive equilibrium exists (the maximum sustainable yield)?`,
      ans: { type: 'num', answer: (r * K) / 4 },
      hint: tx`Equilibria solve $${r}P(1 - P/${K}) = H$. The left side is a downward parabola in $P$; find its maximum.`,
      sol: [tx`$g(P) = ${r}P(1 - P/${K})$ peaks at $P = ${K / 2}$, where $g = ${r}\cdot${K / 2}\cdot\frac12 = ${(r * K) / 4}$.`, tx`For $H > ${(r * K) / 4}$ there's no equilibrium and the population collapses. At $H = ${(r * K) / 4}$ the two equilibria merge: a saddle-node bifurcation.`],
    };
  });
  E('ode-first', (R) => {
    const k = R.int(1, 3), m = R.int(0, 2), y0 = R.int(-2, 4), Cc = y0 - 1 / (m + k + 1), y2 = 2 ** (m + 1) / (m + k + 1) + Cc * 2 ** -k;
    return {
      q: tx`Solve $t\,y' + ${k}y = t^{${m + 1}}$ for $t > 0$ with $y(1) = ${y0}$, and give $y(2)$ to 4 decimals.`.replace('t^{1}', 't').replace('+ 1y', '+ y'),
      ans: { type: 'num', answer: y2, tol: 0.0006 },
      hint: tx`Divide by $t$: $y' + \frac{${k}}{t}y = t^{${m}}$. The integrating factor is $t^{${k}}$.`,
      sol: [tx`$(t^{${k}}y)' = t^{${m + k}}$, so $t^{${k}}y = \frac{t^{${m + k + 1}}}{${m + k + 1}} + C$ and $y = \frac{t^{${m + 1}}}{${m + k + 1}} + Ct^{-${k}}$.`, tx`$y(1) = \frac{1}{${m + k + 1}} + C = ${y0}$ gives $C = ${fmt(Cc, 5)}$.`, tx`$y(2) = \frac{2^{${m + 1}}}{${m + k + 1}} + ${fmt(Cc, 5)}\cdot2^{-${k}} \approx ${fmt(y2, 5)}$.`],
      verify: C.near(M.solve((t, y) => [(t ** (m + 1) - k * y[0]) / t], [y0], 1, 2, 2000).pop()[1][0], y2, 1e-7),
    };
  });
  E('ode-oscillations', (R) => {
    const c = R.int(1, 4), k = R.int(Math.ceil((c * c) / 2) + 1, 20), F = R.int(1, 5), w2 = k - (c * c) / 2, w = Math.sqrt(w2), amp = F / Math.sqrt((k - w2) ** 2 + (c * c * w2));
    return {
      q: tx`For $x'' + ${c}x' + ${k}x = ${F}\cos(\omega t)$, find the driving frequency $\omega$ that maximizes the steady-state amplitude, and that maximum amplitude. Enter $\omega$, amplitude (4 decimals).`.replace('+ 1x\'', "+ x'"),
      ans: { type: 'vec', answer: [w, amp], tol: 0.0006, placeholder: 'ω, amplitude' },
      hint: tx`Amplitude $= \frac{F}{\sqrt{(k - \omega^2)^2 + c^2\omega^2}}$. Minimize the expression under the root as a function of $s = \omega^2$.`,
      sol: [tx`$g(s) = (${k} - s)^2 + ${c * c}s$ has $g'(s) = -2(${k} - s) + ${c * c} = 0$ at $s = ${k} - \frac{${c * c}}{2} = ${fmt(w2)}$.`, tx`$\omega = \sqrt{${fmt(w2)}} \approx ${fmt(w, 5)}$, slightly below the natural frequency $\sqrt{${k}} \approx ${fmt(Math.sqrt(k), 4)}$.`, tx`Amplitude $= \frac{${F}}{\sqrt{g(s)}} \approx ${fmt(amp, 5)}$.`],
    };
  });
  E('ode-systems', (R) => {
    let l1, l2; do { l1 = R.int(-3, 1); l2 = R.int(-3, 1); } while (l1 === l2);
    const v1 = [1, R.int(-2, 2)], v2 = [1, v1[1] + R.pick([1, 2, -1])], c1 = R.nz(-2, 2), c2 = R.nz(-2, 2), t = R.pick([0.5, 1]);
    const P = [[1, 1], [v1[1], v2[1]]], dP = v2[1] - v1[1], Pi = [[v2[1] / dP, -1 / dP], [-v1[1] / dP, 1 / dP]];
    const A = [[0, 0], [0, 0]]; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) A[i][j] = P[i][0] * l1 * Pi[0][j] + P[i][1] * l2 * Pi[1][j];
    const x0 = [c1 + c2, c1 * v1[1] + c2 * v2[1]], xt = c1 * Math.exp(l1 * t) + c2 * Math.exp(l2 * t);
    return {
      q: tx`Solve $\mathbf x' = ${pm(A.map((r) => r.map((v) => fmt(v, 4))))}\mathbf x$ with $\mathbf x(0) = (${x0.join(', ')})$. Give the first component $x_1(${t})$ to 4 decimals.`,
      ans: { type: 'num', answer: xt, tol: 0.0006 },
      hint: tx`Find the eigenvalues and eigenvectors (eigenvalues $${l1}$ and $${l2}$), write $\mathbf x(0)$ in the eigenvector basis, and evolve each part with $e^{\lambda t}$.`,
      sol: [tx`Eigenpairs: $\lambda = ${l1}$, $\mathbf v = (${v1.join(', ')})$; $\lambda = ${l2}$, $\mathbf v = (${v2.join(', ')})$.`, tx`$\mathbf x(0) = ${c1}\mathbf v_1 ${sgn(c2)}\mathbf v_2$, so $\mathbf x(t) = ${c1}e^{${l1}t}\mathbf v_1 ${sgn(c2)}e^{${l2}t}\mathbf v_2$.`, tx`$x_1(${t}) = ${c1}e^{${l1 * t}} ${sgn(c2)}e^{${l2 * t}} \approx ${fmt(xt, 5)}$.`],
      verify: C.near(M.solve((tt, y) => [A[0][0] * y[0] + A[0][1] * y[1], A[1][0] * y[0] + A[1][1] * y[1]], x0, 0, t, 2000).pop()[1][0], xt, 1e-7),
    };
  });
  E('prob-rules', (R) => {
    const n = R.int(10, 60), days = R.pick([365, 365, 100, 52]); let p = 1; for (let i = 0; i < n; i++) p *= (days - i) / days;
    return {
      q: tx`${n} people each pick ${days === 365 ? 'a birthday' : days === 52 ? 'a week of the year' : 'a number from 1 to 100'} uniformly at random${days === 365 ? ' (ignore leap years)' : ''}. What is the probability that at least two pick the same one? Four decimals.`,
      ans: { type: 'num', answer: 1 - p, tol: 0.0006 },
      hint: tx`Complement: all different. The $k$-th person must avoid the $k - 1$ values already taken.`,
      sol: [tx`$P(\text{all different}) = \prod_{k=0}^{${n - 1}}\frac{${days} - k}{${days}} \approx ${fmt(p, 5)}$.`, tx`$P(\text{a match}) \approx ${fmt(1 - p, 5)}$. Matches become likely surprisingly fast because the number of pairs, $\binom{${n}}{2} = ${M.binom(n, 2)}$, grows like $n^2$.`],
    };
  });
  E('prob-bayes', (R) => {
    const prev = R.pick([0.001, 0.01, 0.02, 0.05]), sens = R.pick([0.9, 0.95, 0.99]), spec = R.pick([0.9, 0.95, 0.98]);
    const odds = (prev / (1 - prev)) * (sens / (1 - spec)) ** 2, v = odds / (1 + odds);
    return {
      q: tx`A condition has prevalence ${+(prev * 100).toFixed(1)}%. A test has sensitivity ${sens * 100}% and specificity ${spec * 100}%. A patient tests positive **twice** on independent tests. What is the probability they have the condition? Four decimals.`,
      ans: { type: 'num', answer: v, tol: 0.0006 },
      hint: tx`Apply Bayes twice, using the first posterior as the second prior. Or use odds: each positive multiplies the odds by the likelihood ratio $\frac{\text{sens}}{1 - \text{spec}}$.`,
      sol: [tx`Prior odds $= \frac{${prev}}{${fmt(1 - prev, 4)}}$. Likelihood ratio per positive $= \frac{${sens}}{${fmt(1 - spec, 3)}} = ${fmt(sens / (1 - spec), 3)}$.`, tx`Posterior odds $= ${fmt(prev / (1 - prev), 5)}\times${fmt(sens / (1 - spec), 3)}^2 = ${fmt(odds, 4)}$.`, tx`Probability $= \frac{\text{odds}}{1 + \text{odds}} \approx ${fmt(v, 5)}$.`],
    };
  });
  E('prob-distributions', (R) => {
    const n = R.pick([50, 80, 100, 200, 400]), p = R.pick([0.3, 0.4, 0.5, 0.6]), mu = n * p, sd = Math.sqrt(n * p * (1 - p)), k = Math.round(mu + R.real(-1.5, 1.5, 1) * sd), v = M.phi((k + 0.5 - mu) / sd);
    return {
      q: tx`$X\sim\text{Binomial}(${n}, ${p})$. Use the normal approximation with continuity correction to estimate $P(X \le ${k})$. Three decimals.`,
      ans: { type: 'num', answer: v, tol: 0.0015 },
      hint: tx`$\mu = np$, $\sigma = \sqrt{np(1-p)}$. "$X \le ${k}$" becomes "$Y < ${k}.5$" for the normal $Y$.`,
      sol: [tx`$\mu = ${mu}$, $\sigma = \sqrt{${fmt(n * p * (1 - p))}} \approx ${fmt(sd, 4)}$.`, tx`$z = \frac{${k}.5 - ${mu}}{${fmt(sd, 4)}} \approx ${fmt((k + 0.5 - mu) / sd, 3)}$, so $P \approx \Phi(${fmt((k + 0.5 - mu) / sd, 3)}) \approx ${fmt(v, 4)}$.`],
      verify() { let s = 0; for (let j = 0; j <= k; j++) s += M.binom(n, j) * p ** j * (1 - p) ** (n - j); return Math.abs(s - v) < 0.01 ? true : `approximation far from exact (${s} vs ${v})`; },
    };
  });
  E('prob-clt', (R) => {
    const vx = R.int(1, 9), vy = R.int(1, 9), rho = R.pick([-0.5, -0.2, 0, 0.3, 0.6, 0.8]), a = R.nz(-3, 3), b = R.nz(-3, 3), cov = rho * Math.sqrt(vx * vy), v = a * a * vx + b * b * vy + 2 * a * b * cov;
    return {
      q: tx`$\operatorname{Var}(X) = ${vx}$, $\operatorname{Var}(Y) = ${vy}$ and their correlation is $${rho}$. Find $\operatorname{Var}(${a}X ${sgn(b)}Y)$. Three decimals.`.replace('+ 1Y', '+ Y').replace('- 1Y', '- Y').replace('(1X', '(X').replace('(-1X', '(-X'),
      ans: { type: 'num', answer: v, tol: 0.002 },
      hint: tx`$\operatorname{Var}(aX + bY) = a^2\operatorname{Var}X + b^2\operatorname{Var}Y + 2ab\operatorname{Cov}(X,Y)$, and $\operatorname{Cov} = \rho\,\sigma_X\sigma_Y$.`,
      sol: [tx`$\operatorname{Cov}(X,Y) = ${rho}\sqrt{${vx}}\sqrt{${vy}} \approx ${fmt(cov, 4)}$.`, tx`$${a * a}(${vx}) + ${b * b}(${vy}) + 2(${a})(${b})(${fmt(cov, 4)}) \approx ${fmt(v, 4)}$.`],
    };
  });
  E('stats-ci', (R) => {
    const n = R.pick([6, 8, 10, 12]), base = R.int(20, 60), xs = Array.from({ length: n }, () => base + R.int(-6, 6)), tstar = { 6: 2.571, 8: 2.365, 10: 2.262, 12: 2.201 }[n];
    const mean = xs.reduce((a, b) => a + b, 0) / n, s = Math.sqrt(xs.reduce((a, x) => a + (x - mean) ** 2, 0) / (n - 1)), E2 = (tstar * s) / Math.sqrt(n);
    return {
      q: tx`The data $${xs.join(',\\ ')}$ come from a normal population with unknown SD. Using $t^* = ${tstar}$ (95%, ${n - 1} degrees of freedom), find the margin of error of the 95% confidence interval for the mean. Three decimals.`,
      ans: { type: 'num', answer: E2, tol: 0.002 },
      hint: tx`Margin $= t^*\frac{s}{\sqrt n}$ with the sample SD $s$ (divide by $n - 1$).`,
      sol: [tx`$\bar x = ${fmt(mean, 4)}$, $s = ${fmt(s, 4)}$.`, tx`Margin $= ${tstar}\times\frac{${fmt(s, 4)}}{\sqrt{${n}}} \approx ${fmt(E2, 4)}$. Interval $${fmt(mean, 3)} \pm ${fmt(E2, 3)}$.`],
    };
  });
  E('stats-tests', (R) => {
    const n1 = R.pick([200, 300, 500]), n2 = R.pick([200, 300, 500]), p1 = R.pick([0.1, 0.15, 0.2, 0.3]), k1 = Math.round(n1 * p1), k2 = Math.round(n2 * (p1 + R.pick([-0.05, 0.02, 0.04, 0.06, 0.08])));
    const ph = (k1 + k2) / (n1 + n2), z = (k2 / n2 - k1 / n1) / Math.sqrt(ph * (1 - ph) * (1 / n1 + 1 / n2)), p = 2 * (1 - M.phi(Math.abs(z)));
    return {
      q: tx`An A/B test: version A converts ${k1} of ${n1} visitors, version B converts ${k2} of ${n2}. Run a two-sided two-proportion $z$-test of "no difference". Give the p-value to 3 decimals.`,
      ans: { type: 'num', answer: p, tol: 0.002 },
      hint: tx`Pool: $\hat p = \frac{k_1 + k_2}{n_1 + n_2}$. Then $z = \frac{\hat p_B - \hat p_A}{\sqrt{\hat p(1-\hat p)(1/n_1 + 1/n_2)}}$.`,
      sol: [tx`$\hat p_A = ${fmt(k1 / n1, 4)}$, $\hat p_B = ${fmt(k2 / n2, 4)}$, pooled $\hat p = ${fmt(ph, 4)}$.`, tx`$z \approx ${fmt(z, 3)}$, so $p = 2(1 - \Phi(${fmt(Math.abs(z), 3)})) \approx ${fmt(p, 4)}$.`, tx`${p <= 0.05 ? 'Significant at 5%.' : 'Not significant at 5%.'}`],
    };
  });
  E('stats-regression', (R) => {
    const n = R.int(5, 12), xs = Array.from({ length: n }, () => R.int(0, 10)), b1 = R.pick([-2, -1, 0.5, 1, 2, 3]), ys = xs.map((x) => Math.round(b1 * x + 4 + R.int(-3, 3)));
    const Sx = xs.reduce((a, b) => a + b, 0), Sy = ys.reduce((a, b) => a + b, 0), Sxx = xs.reduce((a, x) => a + x * x, 0), Sxy = xs.reduce((a, x, i) => a + x * ys[i], 0), den = n * Sxx - Sx * Sx;
    if (!den) return { q: tx`For points $(1, 2), (2, 4), (3, 7)$, find the least squares slope.`, ans: { type: 'num', answer: 2.5 }, hint: tx`Use the summary formula.`, sol: [tx`$b_1 = 2.5$.`] };
    const slope = (n * Sxy - Sx * Sy) / den;
    return {
      q: tx`For $n = ${n}$ data points, $\sum x = ${Sx}$, $\sum y = ${Sy}$, $\sum x^2 = ${Sxx}$ and $\sum xy = ${Sxy}$. Find the least squares slope. Four decimals.`,
      ans: { type: 'num', answer: slope, tol: 0.0006 },
      hint: tx`$b_1 = \dfrac{n\sum xy - \sum x\sum y}{n\sum x^2 - (\sum x)^2}$.`,
      sol: [tx`$b_1 = \frac{${n}(${Sxy}) - (${Sx})(${Sy})}{${n}(${Sxx}) - ${Sx}^2} = \frac{${n * Sxy - Sx * Sy}}{${den}} \approx ${fmt(slope, 5)}$.`, tx`Intercept: $b_0 = \bar y - b_1\bar x \approx ${fmt(Sy / n - slope * Sx / n, 4)}$.`],
    };
  });
})();
