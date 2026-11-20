/* Deeper lessons added inside existing modules: improper integrals, Laplace transforms,
   joint distributions, maximum likelihood, and the Fourier transform / DFT. */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, sgn = AM.sgn, C = AM.checks, M = AM.m, PI = Math.PI;
  const pm = (r) => `\\begin{pmatrix} ${r.map((x) => x.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;

  /* ======================= Calculus II: improper integrals ======================= */
  AM.addLesson('calc2', {
    id: 'improper', title: 'Improper integrals', minutes: 30,
    summary: 'Integrating over infinite intervals and through infinite spikes.',
    idea: tx`Sometimes the region you want to measure is infinitely long, as in $\int_1^\infty \frac{dx}{x^2}$, or the function shoots up to infinity, as in $\int_0^1 \frac{dx}{\sqrt x}$. These are **improper integrals**, and the trick is always the same: integrate up to a finite cut-off, then take a limit as the cut-off moves out to the problem point.

Surprisingly, an infinitely long region can have finite area. What decides it is how fast the function shrinks. $1/x^2$ dies off fast enough; $1/x$ does not. Probability densities, Laplace and Fourier transforms all depend on integrals like these converging.`,
    everyday: tx`Painter's paradox: rotate the curve $y = 1/x$ (for $x \ge 1$) around the $x$-axis to make an infinitely long horn. Its volume is finite ($\pi$ cubic units, so you could fill it with paint), but its surface area is infinite, so you could never paint the outside. The volume integral involves $1/x^2$, which converges; the area integral behaves like $1/x$, which doesn't.`,
    visual: { widget: 'improper', caption: tx`Push the endpoint further out for $p = 2$: the area creeps up to exactly 1. Now set $p = 1$ or $p = 0.8$: the area grows forever. Switch to the spike near 0 and the rule flips: there, powers *below* 1 converge.` },
    math: tx`**Infinite intervals.** $\displaystyle\int_a^\infty f(x)\,dx = \lim_{b\to\infty}\int_a^b f(x)\,dx$. It **converges** if the limit is finite.

**Unbounded integrands.** If $f$ blows up at $a$: $\displaystyle\int_a^b f(x)\,dx = \lim_{c\to a^+}\int_c^b f(x)\,dx$.

**The $p$-test.**
$$\int_1^\infty \frac{dx}{x^p}\ \text{converges} \iff p > 1 \ \left(\text{value } \tfrac{1}{p-1}\right), \qquad \int_0^1 \frac{dx}{x^p}\ \text{converges} \iff p < 1 \ \left(\text{value } \tfrac{1}{1-p}\right).$$

**Comparison test.** If $0 \le f \le g$ and $\int g$ converges, so does $\int f$; if $\int f$ diverges, so does $\int g$. **Limit comparison:** if $f/g \to L \in (0,\infty)$, they converge or diverge together.

**Gamma function.** $\Gamma(s) = \displaystyle\int_0^\infty x^{s-1}e^{-x}\,dx$, with $\Gamma(n) = (n-1)!$, so $\displaystyle\int_0^\infty x^ne^{-kx}dx = \frac{n!}{k^{n+1}}$.`,
    example: {
      problem: tx`Evaluate $\displaystyle\int_0^\infty xe^{-2x}\,dx$.`,
      steps: [
        tx`Integrate to a cut-off $b$ by parts ($u = x$, $dv = e^{-2x}dx$): $\int_0^b xe^{-2x}dx = \left[-\frac{x}{2}e^{-2x} - \frac14e^{-2x}\right]_0^b$.`,
        tx`$= -\frac b2e^{-2b} - \frac14e^{-2b} + \frac14$.`,
        tx`As $b\to\infty$, $be^{-2b}\to0$ (exponentials beat powers) and $e^{-2b}\to0$, leaving $\frac14$.`,
        tx`Check with the Gamma formula: $\frac{1!}{2^2} = \frac14$. ✓`,
      ],
    },
    pitfalls: [
      tx`Don't integrate straight across a vertical asymptote: $\int_{-1}^1\frac{dx}{x^2}$ is not $-2$; it diverges.`,
      tx`$\int_{-\infty}^\infty f$ must be split into two limits taken independently. $\int_{-\infty}^\infty x\,dx$ diverges, even though the symmetric limit $\lim_{R\to\infty}\int_{-R}^Rx\,dx = 0$.`,
      tx`A function tending to 0 isn't enough for convergence: $1/x$ tends to 0 but its integral to infinity diverges.`,
    ],
    usedIn: tx`Probability densities (Module 08) must integrate to 1 over infinite ranges; expected values are improper integrals. Laplace transforms (Module 07) and Fourier transforms (Module 13) are improper integrals, and the Gamma function appears throughout statistics.`,
    practice: [
      { level: 1, gen(R) {
        const [p, pt] = R.pick([[2, '2'], [3, '3'], [4, '4'], [1.5, '3/2'], [2.5, '5/2'], [5, '5']]), c = R.int(1, 6), a = R.pick([1, 2]), v = (c * a ** (1 - p)) / (p - 1);
        return {
          q: tx`Evaluate $\displaystyle\int_{${a}}^\infty \frac{${c}}{x^{${pt}}}\,dx$.`,
          ans: { type: 'num', answer: v, abs: 1e-9, rel: 0.002 },
          hint: tx`Antiderivative $\frac{${c}x^{1-p}}{1-p}$; evaluate at $b$ and let $b\to\infty$.`,
          sol: [tx`$\int_{${a}}^b ${c}x^{-${pt}}dx = \frac{${c}}{${fmt(1 - p)}}\left(b^{${fmt(1 - p)}} - ${a}^{${fmt(1 - p)}}\right)$.`, tx`$b^{${fmt(1 - p)}}\to0$ since $p > 1$, leaving $\frac{${c}\cdot${a}^{${fmt(1 - p)}}}{${fmt(p - 1)}} = ${fmt(v, 5)}$.`],
        };
      } },
      { level: 2, gen(R) {
        const kind = R.pick(['exp', 'xexp', 'cauchy', 'spike']), k = R.int(1, 5);
        const [q, v, s] = {
          exp: [tx`\int_0^\infty e^{-${k}x}\,dx`, 1 / k, tx`$\left[-\frac{e^{-${k}x}}{${k}}\right]_0^\infty = \frac1{${k}}$.`],
          xexp: [tx`\int_0^\infty xe^{-${k}x}\,dx`, 1 / (k * k), tx`By parts (or $\Gamma$): $\frac{1!}{${k}^2} = \frac{1}{${k * k}}$.`],
          cauchy: [tx`\int_{-\infty}^\infty \frac{dx}{x^2 + ${k * k}}`, PI / k, tx`$\left[\frac1{${k}}\arctan\frac x{${k}}\right]_{-\infty}^\infty = \frac1{${k}}\left(\frac\pi2 + \frac\pi2\right) = \frac{\pi}{${k}}$.`],
          spike: [tx`\int_0^{${k * k}} \frac{dx}{\sqrt x}`, 2 * k, tx`$\lim_{c\to0^+}\left[2\sqrt x\right]_c^{${k * k}} = 2\cdot${k} = ${2 * k}$.`],
        }[kind];
        return { q: tx`Evaluate $\displaystyle${q}$. Four decimals or an exact form.`, ans: { type: 'num', answer: v, tol: 0.0006 }, hint: tx`Replace the problem endpoint by a variable, integrate, and take the limit.`, sol: [s] };
      } },
      { level: 3, gen(R) {
        const L = [
          ['\\int_1^\\infty \\frac{dx}{x^3 + 1}', 0, 'Compare with $\\frac1{x^3}$: $p = 3 > 1$.'],
          ['\\int_2^\\infty \\frac{dx}{x\\ln x}', 1, 'Substitute $u = \\ln x$: $\\int\\frac{du}{u} = \\ln u \\to \\infty$.'],
          ['\\int_1^\\infty \\frac{\\sin^2 x}{x^2}dx', 0, '$0 \\le \\frac{\\sin^2x}{x^2} \\le \\frac1{x^2}$, which converges.'],
          ['\\int_1^\\infty \\frac{x + 1}{x^2 + 3}dx', 1, 'Limit comparison with $\\frac1x$: the ratio tends to 1, and $\\int\\frac{dx}x$ diverges.'],
          ['\\int_0^1 \\frac{dx}{x^2}', 1, '$p = 2 \\ge 1$ near 0: diverges.'],
          ['\\int_0^1 \\frac{dx}{\\sqrt[3]{x}}', 0, '$p = \\frac13 < 1$ near 0: converges (to $\\frac32$).'],
          ['\\int_1^\\infty e^{-x^2}dx', 0, '$e^{-x^2} \\le e^{-x}$ for $x \\ge 1$, and $\\int_1^\\infty e^{-x}dx$ converges.'],
          ['\\int_1^\\infty \\frac{dx}{\\sqrt{x^3 + 1}}', 0, 'Behaves like $x^{-3/2}$; $p = \\frac32 > 1$.'],
          ['\\int_1^\\infty \\frac{dx}{\\sqrt{x + 1}}', 1, 'Behaves like $x^{-1/2}$; $p = \\frac12 \\le 1$.'],
        ];
        const [t, a, why] = R.pick(L);
        return { q: tx`Does $\displaystyle${t}$ converge or diverge?`, ans: { type: 'mc', choices: ['Converges', 'Diverges'], answer: a }, hint: tx`Find a simpler function that behaves the same way at the problem point, then use the $p$-test with comparison.`, sol: [why] };
      } },
      { level: 4, gen(R) {
        const n = R.int(1, 5), k = R.int(1, 4), v = M.fact(n) / k ** (n + 1);
        return {
          q: tx`Evaluate $\displaystyle\int_0^\infty x^{${n}}e^{-${k}x}\,dx$. Exact fraction or 5 decimals.`.replace('x^{1}', 'x').replace('e^{-1x}', 'e^{-x}'),
          ans: { type: 'num', answer: v, abs: 1e-9, rel: 0.0005, show: tx`$\frac{${M.fact(n)}}{${k ** (n + 1)}}$` },
          hint: tx`Substitute $u = ${k}x$ to turn it into a Gamma function, or integrate by parts ${n} times.`,
          sol: [tx`With $u = ${k}x$: $\int_0^\infty \frac{u^{${n}}}{${k}^{${n}}}e^{-u}\frac{du}{${k}} = \frac{\Gamma(${n + 1})}{${k}^{${n + 1}}}$.`, tx`$\Gamma(${n + 1}) = ${n}! = ${M.fact(n)}$, so the integral is $\frac{${M.fact(n)}}{${k ** (n + 1)}} \approx ${fmt(v, 6)}$.`],
          verify: C.near(M.integrate((x) => x ** n * Math.exp(-k * x), 0, 60 / k, 20000), v, 1e-6),
        };
      } },
    ],
  }, { after: 'techniques' });

  /* ======================= ODEs: Laplace transforms ======================= */
  AM.addLesson('ode', {
    id: 'laplace', title: 'Laplace transforms', minutes: 40,
    summary: 'Turning differential equations into algebra, and reading stability from poles.',
    idea: tx`The **Laplace transform** turns a function of time $f(t)$ into a function of a new variable $s$: $F(s) = \int_0^\infty e^{-st}f(t)\,dt$. Its superpower is that differentiation becomes multiplication by $s$. A linear ODE with initial conditions turns into an *algebra* problem: solve for $Y(s)$, then transform back.

Engineers use it constantly because the denominator of $Y(s)$, the system's **poles**, tells you the behaviour at a glance. Each pole contributes a term $e^{pt}$: poles in the left half-plane decay (stable), poles on the right grow (unstable), and imaginary parts mean oscillation.`,
    everyday: tx`A cruise control system, a thermostat, and an aircraft autopilot are designed in the "$s$-domain". An engineer writes the car's response to the throttle as a transfer function like $G(s) = \frac{K}{s^2 + 2s + K}$, and checks where its poles sit. If any pole wanders into the right half-plane as the gain $K$ increases, the car would surge back and forth uncontrollably, and that's found before a single car is built.`,
    visual: { widget: 'laplace', caption: tx`Drag the pole around the $s$-plane. Move it left and the response dies quickly; move it toward the imaginary axis and it rings for longer; cross into the right half-plane and it grows. Move it up and the oscillation gets faster.` },
    math: tx`**Definition.** $\mathcal L\{f\}(s) = F(s) = \displaystyle\int_0^\infty e^{-st}f(t)\,dt$.

**Table.** $\mathcal L\{1\} = \frac1s$, $\ \mathcal L\{t^n\} = \frac{n!}{s^{n+1}}$, $\ \mathcal L\{e^{at}\} = \frac{1}{s-a}$, $\ \mathcal L\{\sin bt\} = \frac{b}{s^2+b^2}$, $\ \mathcal L\{\cos bt\} = \frac{s}{s^2+b^2}$.

**Rules.**
$$\mathcal L\{f'\} = sF(s) - f(0), \qquad \mathcal L\{f''\} = s^2F(s) - sf(0) - f'(0),$$
$$\mathcal L\{e^{at}f(t)\} = F(s - a) \ (\text{shift}), \qquad \mathcal L\{(f*g)(t)\} = F(s)G(s) \ (\text{convolution}).$$

**Solving an IVP.** Transform both sides, solve for $Y(s)$, split into partial fractions, invert each piece from the table.

**Transfer function and stability.** For input $u$ and output $y$ with zero initial conditions, $Y(s) = G(s)U(s)$. The system is stable when every pole of $G$ has negative real part. **Final value theorem:** if $y$ settles, $\lim_{t\to\infty}y(t) = \lim_{s\to0}sY(s)$.`,
    example: {
      problem: tx`Solve $y'' + 3y' + 2y = 0$ with $y(0) = 1$, $y'(0) = 0$ using Laplace transforms.`,
      steps: [
        tx`Transform: $s^2Y - s + 3(sY - 1) + 2Y = 0$.`,
        tx`Solve: $Y(s) = \dfrac{s + 3}{s^2 + 3s + 2} = \dfrac{s + 3}{(s+1)(s+2)}$.`,
        tx`Partial fractions: $\dfrac{s+3}{(s+1)(s+2)} = \dfrac{2}{s + 1} - \dfrac{1}{s + 2}$.`,
        tx`Invert: $y(t) = 2e^{-t} - e^{-2t}$. The poles $-1$ and $-2$ are both in the left half-plane, so the motion decays.`,
      ],
    },
    pitfalls: [
      tx`Don't forget the initial-condition terms in $\mathcal L\{y'\}$ and $\mathcal L\{y''\}$.`,
      tx`The final value theorem only applies if the system actually settles (all poles of $sY(s)$ in the left half-plane).`,
      tx`$\mathcal L\{fg\} \ne F(s)G(s)$. Products in $s$ correspond to *convolutions* in time.`,
    ],
    usedIn: tx`Control engineering, circuit analysis, signal processing, and solving ODEs with discontinuous or impulsive forcing. The inverse transform is a contour integral, so complex analysis (Module 12) is how you evaluate it in general.`,
    practice: [
      { level: 1, gen(R) {
        const kind = R.pick(['exp', 'pow', 'sin', 'cos']), s0 = R.int(2, 6);
        if (kind === 'exp') { const a = R.int(-3, 1); return { q: tx`Find $\mathcal L\{e^{${a}t}\}$ evaluated at $s = ${s0}$.`, ans: { type: 'num', answer: 1 / (s0 - a), abs: 1e-9 }, hint: tx`$\mathcal L\{e^{at}\} = \frac1{s - a}$.`, sol: [tx`$\frac{1}{${s0} - (${a})} = ${AM.frac(1, s0 - a)}$.`] }; }
        if (kind === 'pow') { const n = R.int(1, 4); return { q: tx`Find $\mathcal L\{t^{${n}}\}$ evaluated at $s = ${s0}$.`, ans: { type: 'num', answer: M.fact(n) / s0 ** (n + 1), abs: 1e-9, rel: 0.001 }, hint: tx`$\mathcal L\{t^n\} = \frac{n!}{s^{n+1}}$.`, sol: [tx`$\frac{${M.fact(n)}}{${s0}^{${n + 1}}} = ${AM.frac(M.fact(n), s0 ** (n + 1))}$.`] }; }
        const b = R.int(1, 5), sin = kind === 'sin', fn = sin ? '\\sin' : '\\cos';
        return { q: tx`Find $\mathcal L\{${fn}(${b}t)\}$ evaluated at $s = ${s0}$.`, ans: { type: 'num', answer: (sin ? b : s0) / (s0 * s0 + b * b), abs: 1e-9 }, hint: sin ? tx`$\mathcal L\{\sin bt\} = \frac{b}{s^2+b^2}$.` : tx`$\mathcal L\{\cos bt\} = \frac{s}{s^2+b^2}$.`, sol: [tx`$\frac{${sin ? b : s0}}{${s0 * s0} + ${b * b}} = ${AM.frac(sin ? b : s0, s0 * s0 + b * b)}$.`] };
      } },
      { level: 2, gen(R) {
        let a, b; do { a = R.int(-4, 2); b = R.int(-4, 2); } while (a === b);
        const t = R.pick([0.5, 1, 2]), v = (Math.exp(a * t) - Math.exp(b * t)) / (a - b);
        return {
          q: tx`Find $f(t) = \mathcal L^{-1}\left\{\dfrac{1}{(s ${sgn(-a)})(s ${sgn(-b)})}\right\}$ and evaluate $f(${t})$. Four decimals.`.replace(/\(s \+ 0\)|\(s - 0\)/g, 's'),
          ans: { type: 'num', answer: v, tol: 0.0006 },
          hint: tx`Partial fractions: $\frac{1}{(s-a)(s-b)} = \frac{1}{a-b}\left(\frac1{s-a} - \frac1{s-b}\right)$.`,
          sol: [tx`$\frac{1}{${a - b}}\left(\frac{1}{s ${sgn(-a)}} - \frac{1}{s ${sgn(-b)}}\right)$, so $f(t) = \frac{e^{${a}t} - e^{${b}t}}{${a - b}}$.`, tx`$f(${t}) \approx ${fmt(v, 5)}$.`],
          // the inverse transform of 1/((s-a)(s-b)) solves f'' - (a+b)f' + ab f = 0 with f(0) = 0, f'(0) = 1
          verify: C.near(M.solve((tt, z) => [z[1], (a + b) * z[1] - a * b * z[0]], [0, 1], 0, t, 4000).pop()[1][0], v, 1e-7),
        };
      } },
      { level: 3, gen(R) {
        const a = R.int(1, 4), b = R.pick([-2, -1, 0, 1, 2].filter((x) => x !== -a)), y0 = R.int(-2, 3), t = R.pick([0.5, 1, 2]);
        const y = (Math.exp(b * t) - Math.exp(-a * t)) / (a + b) + y0 * Math.exp(-a * t);
        return {
          q: tx`Use the Laplace transform to solve $y' + ${a}y = e^{${b}t}$, $y(0) = ${y0}$. Give $y(${t})$ to 4 decimals.`.replace('e^{0t}', '1').replace('+ 1y', '+ y'),
          ans: { type: 'num', answer: y, tol: 0.0006 },
          hint: tx`$sY - ${y0} + ${a}Y = \frac1{s ${sgn(-b)}}$. Solve for $Y$ and split into partial fractions.`.replace('s + 0', 's').replace('s - 0', 's'),
          sol: [tx`$Y(s) = \frac{1}{(s ${sgn(-b)})(s + ${a})} + \frac{${y0}}{s + ${a}}$.`.replace('(s + 0)', 's').replace('(s - 0)', 's'), tx`$\frac{1}{(s ${sgn(-b)})(s + ${a})} = \frac{1}{${a + b}}\left(\frac1{s ${sgn(-b)}} - \frac1{s + ${a}}\right)$.`.replace(/s [+-] 0\b/g, 's'), tx`$y(t) = \frac{e^{${b}t} - e^{-${a}t}}{${a + b}} + ${y0}e^{-${a}t}$, so $y(${t}) \approx ${fmt(y, 5)}$.`],
          verify: C.near(M.solve((tt, z) => [Math.exp(b * tt) - a * z[0]], [y0], 0, t, 3000).pop()[1][0], y, 1e-7),
        };
      } },
      { level: 4, gen(R) {
        const K = R.int(1, 10), b = R.int(1, 6), c = R.int(1, 12), stable = true, fv = K / c;
        return {
          q: tx`A system has transfer function $G(s) = \dfrac{${K}}{s^2 + ${b}s + ${c}}$. A unit step input ($U(s) = 1/s$) is applied. Find the value the output settles to, and check it's stable. Enter the final value.`,
          ans: { type: 'num', answer: fv, abs: 1e-9, rel: 0.002 },
          hint: tx`Final value theorem: $\lim_{t\to\infty}y(t) = \lim_{s\to0} sY(s) = \lim_{s\to0} sG(s)\frac1s = G(0)$, valid when the poles have negative real part.`,
          sol: [tx`Poles: roots of $s^2 + ${b}s + ${c}$. Both coefficients are positive, so (for a quadratic) both poles have negative real part: stable.`, tx`$y(\infty) = G(0) = \frac{${K}}{${c}} = ${fmt(fv, 5)}$, the DC gain.`],
          verify: C.near(M.solve((t, y) => [y[1], K - b * y[1] - c * y[0]], [0, 0], 0, 60, 20000).pop()[1][0], fv, 1e-4),
        };
      } },
    ],
  }, { after: 'systems' });

  /* ======================= Probability: joint distributions ======================= */
  AM.addLesson('prob', {
    id: 'joint', title: 'Joint distributions and covariance', minutes: 35,
    summary: 'Two random quantities at once: dependence, covariance and correlation.',
    idea: tx`Real questions involve several random quantities together: height and weight, a stock and the market, rainfall and crop yield. Their **joint distribution** gives the probability of each *combination* of values. From it you can recover each one on its own (the **marginal** distributions) and ask whether they're related.

**Covariance** measures whether two variables tend to move together: positive if above-average values of one go with above-average values of the other. Scaled to lie between $-1$ and $1$ it becomes the **correlation**. Two variables are **independent** if knowing one tells you nothing about the other; independence implies zero covariance, but not the other way round.`,
    everyday: tx`A portfolio holds two stocks. If they rise and fall together (high positive correlation), the portfolio swings wildly. If they tend to move in opposite directions (negative correlation), losses in one cushion the other. That's the mathematics of diversification: $\operatorname{Var}(X + Y) = \operatorname{Var}X + \operatorname{Var}Y + 2\operatorname{Cov}(X, Y)$, and a negative covariance shrinks the risk.`,
    visual: { widget: 'joint', caption: tx`Slide the correlation from $-0.99$ to $0.99$ and watch the cloud of points stretch along a diagonal. At $\rho = 0$ the ellipses line up with the axes. The green line, the best prediction of $Y$ from $X$, tilts with $\rho$ and goes flat when they're uncorrelated.` },
    math: tx`**Joint distribution.** Discrete: $p(x, y) = P(X = x, Y = y)$. Continuous: $P((X,Y)\in A) = \iint_A f(x,y)\,dA$.

**Marginals.** $p_X(x) = \sum_y p(x,y)$, or $f_X(x) = \int f(x,y)\,dy$.

**Independence.** $X$ and $Y$ are independent iff $p(x,y) = p_X(x)p_Y(y)$ for all $x, y$.

**Covariance and correlation.**
$$\operatorname{Cov}(X,Y) = E[(X - \mu_X)(Y - \mu_Y)] = E[XY] - E[X]E[Y], \qquad \rho = \frac{\operatorname{Cov}(X,Y)}{\sigma_X\sigma_Y}.$$

**Sums.** $\operatorname{Var}(aX + bY) = a^2\operatorname{Var}X + b^2\operatorname{Var}Y + 2ab\operatorname{Cov}(X,Y)$.

**Covariance matrix.** For a random vector $\mathbf X$, $\Sigma_{ij} = \operatorname{Cov}(X_i, X_j)$. It's symmetric and positive semidefinite, and its eigenvectors are the principal components (PCA).`,
    example: {
      problem: tx`$X$ and $Y$ take values 0 or 1 with $p(0,0) = 0.4$, $p(0,1) = 0.1$, $p(1,0) = 0.2$, $p(1,1) = 0.3$. Find $\operatorname{Cov}(X, Y)$ and decide whether they're independent.`,
      steps: [
        tx`Marginals: $P(X = 1) = 0.2 + 0.3 = 0.5$ and $P(Y = 1) = 0.1 + 0.3 = 0.4$, so $E[X] = 0.5$ and $E[Y] = 0.4$.`,
        tx`$E[XY] = 1\cdot1\cdot p(1,1) = 0.3$.`,
        tx`$\operatorname{Cov}(X,Y) = 0.3 - 0.5\times0.4 = 0.1 > 0$: they tend to be 1 together.`,
        tx`Not independent: $p(1,1) = 0.3 \ne P(X=1)P(Y=1) = 0.2$.`,
      ],
    },
    pitfalls: [
      tx`Zero covariance doesn't imply independence: if $X$ is symmetric around 0 and $Y = X^2$, then $\operatorname{Cov}(X, Y) = 0$ but $Y$ is completely determined by $X$.`,
      tx`Marginals don't determine the joint distribution; very different dependence structures share the same marginals.`,
      tx`Correlation measures *linear* association and is unaffected by changing units, but covariance is not.`,
    ],
    usedIn: tx`Regression (Module 09), portfolio theory, PCA and the covariance matrices of multivariate statistics, Kalman filters, and Markov chains (Module 15), where successive states are dependent.`,
    practice: [
      { level: 1, gen(R) {
        const w = Array.from({ length: 4 }, () => R.int(1, 9)), T = w.reduce((a, b) => a + b, 0), ask = R.pick(['X', 'Y']);
        const v = ask === 'X' ? (w[2] + w[3]) / T : (w[1] + w[3]) / T;
        return {
          q: tx`$X, Y \in \{0, 1\}$ have joint probabilities $p(0,0) = ${AM.frac(w[0], T)}$, $p(0,1) = ${AM.frac(w[1], T)}$, $p(1,0) = ${AM.frac(w[2], T)}$, $p(1,1) = ${AM.frac(w[3], T)}$. Find $P(${ask} = 1)$.`,
          ans: { type: 'num', answer: v, abs: 1e-9, show: tx`$${AM.frac(ask === 'X' ? w[2] + w[3] : w[1] + w[3], T)}$` },
          hint: tx`Marginal: add the joint probabilities over all values of the other variable.`,
          sol: [ask === 'X' ? tx`$P(X = 1) = p(1,0) + p(1,1) = ${AM.frac(w[2] + w[3], T)}$.` : tx`$P(Y = 1) = p(0,1) + p(1,1) = ${AM.frac(w[1] + w[3], T)}$.`],
        };
      } },
      { level: 2, gen(R) {
        const w = Array.from({ length: 4 }, () => R.int(1, 9)), T = w.reduce((a, b) => a + b, 0), p = w.map((x) => x / T);
        const EX = p[2] + p[3], EY = p[1] + p[3], cov = p[3] - EX * EY;
        return {
          q: tx`$X, Y \in \{0, 1\}$ with $p(0,0) = ${AM.frac(w[0], T)}$, $p(0,1) = ${AM.frac(w[1], T)}$, $p(1,0) = ${AM.frac(w[2], T)}$, $p(1,1) = ${AM.frac(w[3], T)}$. Find $\operatorname{Cov}(X, Y)$ to 4 decimals.`,
          ans: { type: 'num', answer: cov, abs: 0.0001, rel: 0 },
          hint: tx`$\operatorname{Cov} = E[XY] - E[X]E[Y]$, and for 0/1 variables $E[XY] = p(1,1)$.`,
          sol: [tx`$E[X] = ${fmt(EX, 4)}$, $E[Y] = ${fmt(EY, 4)}$, $E[XY] = ${fmt(p[3], 4)}$.`, tx`$\operatorname{Cov} = ${fmt(p[3], 4)} - ${fmt(EX, 4)}\times${fmt(EY, 4)} \approx ${fmt(cov, 5)}$.`],
        };
      } },
      { level: 3, gen(R) {
        const indep = R.chance(0.5), a = R.pick([0.2, 0.3, 0.4, 0.5, 0.6]), b = R.pick([0.25, 0.4, 0.5, 0.75]);
        let p = [(1 - a) * (1 - b), (1 - a) * b, a * (1 - b), a * b];
        if (!indep) { const d = R.pick([-0.05, 0.05, 0.1, -0.08]); p = [p[0] + d, p[1] - d, p[2] - d, p[3] + d]; if (p.some((x) => x <= 0)) p = [0.3, 0.2, 0.1, 0.4]; }
        const ok = Math.abs(p[3] - (p[2] + p[3]) * (p[1] + p[3])) < 1e-9;
        return {
          q: tx`Are $X$ and $Y$ independent if $p(0,0) = ${fmt(p[0], 4)}$, $p(0,1) = ${fmt(p[1], 4)}$, $p(1,0) = ${fmt(p[2], 4)}$, $p(1,1) = ${fmt(p[3], 4)}$?`,
          ans: { type: 'mc', choices: ['Independent', 'Not independent'], answer: ok ? 0 : 1 },
          hint: tx`Check whether every joint probability equals the product of its marginals. For two 0/1 variables, checking $p(1,1)$ is enough.`,
          sol: [tx`$P(X = 1) = ${fmt(p[2] + p[3], 4)}$, $P(Y = 1) = ${fmt(p[1] + p[3], 4)}$, product $= ${fmt((p[2] + p[3]) * (p[1] + p[3]), 4)}$.`, tx`$p(1,1) = ${fmt(p[3], 4)}$: ${ok ? 'equal, so **independent**.' : 'different, so **not independent**.'}`],
        };
      } },
      { level: 4, gen(R) {
        const kind = R.pick(['sum', 'prod', 'lt']);
        if (kind === 'sum') { const v = 1 / 3; return { q: tx`$(X, Y)$ has joint density $f(x,y) = x + y$ on the unit square $[0,1]^2$. Find $P(X + Y \le 1)$.`, ans: { type: 'num', answer: v, abs: 1e-9, show: '$\\frac13$' }, hint: tx`Integrate $x + y$ over the triangle $0 \le y \le 1 - x$, $0 \le x \le 1$.`, sol: [tx`$\int_0^1\int_0^{1-x}(x + y)\,dy\,dx = \int_0^1 \left(x(1-x) + \frac{(1-x)^2}{2}\right)dx = \int_0^1\frac{1 - x^2}{2}dx = \frac13$.`] }; }
        const c = R.int(1, 3), d = R.int(1, 3), k = 4 / (c * c * d * d);
        if (kind === 'prod') return { q: tx`$(X, Y)$ has joint density $f(x,y) = kxy$ on $[0, ${c}]\times[0, ${d}]$. Find $k$.`, ans: { type: 'num', answer: k, abs: 1e-9, show: tx`$${AM.frac(4, c * c * d * d)}$` }, hint: tx`A density integrates to 1.`, sol: [tx`$\int_0^{${c}}\int_0^{${d}}kxy\,dy\,dx = k\cdot\frac{${c * c}}{2}\cdot\frac{${d * d}}{2} = 1$, so $k = ${AM.frac(4, c * c * d * d)}$.`, tx`The density factors as $g(x)h(y)$ on a rectangle, so $X$ and $Y$ are independent.`] };
        const l1 = R.int(1, 4), l2 = R.int(1, 4), v = l1 / (l1 + l2);
        return { q: tx`$X$ and $Y$ are independent exponentials with rates $${l1}$ and $${l2}$ (e.g. times until two machines fail). Find $P(X < Y)$, the chance machine $X$ fails first.`, ans: { type: 'num', answer: v, abs: 1e-9, show: tx`$${AM.frac(l1, l1 + l2)}$` }, hint: tx`$P(X < Y) = \int_0^\infty \lambda_1e^{-\lambda_1x}P(Y > x)\,dx$.`, sol: [tx`$\int_0^\infty ${l1}e^{-${l1}x}e^{-${l2}x}dx = \frac{${l1}}{${l1 + l2}}$.`], verify: C.near(M.integrate((x) => l1 * Math.exp(-(l1 + l2) * x), 0, 40, 8000), v, 1e-8) };
      } },
    ],
  }, { after: 'distributions' });

  /* ======================= Statistics: maximum likelihood ======================= */
  AM.addLesson('stats', {
    id: 'mle', title: 'Maximum likelihood estimation', minutes: 35,
    summary: 'Choosing the parameter that makes your data least surprising.',
    idea: tx`Given a model with an unknown parameter, like a coin with unknown heads probability $p$, which value is most believable? **Maximum likelihood** answers: the one that would have made the data you actually observed *most probable*. Write the probability of the data as a function of the parameter (the **likelihood**), and maximize it.

In practice you maximize the **log-likelihood**, because logs turn products of probabilities into sums and are much easier to differentiate. Maximum likelihood estimates are the default in statistics and machine learning: they're consistent (they converge to the truth with more data) and, for large samples, as precise as any reasonable estimator can be.`,
    everyday: tx`You flip a mystery coin 20 times and get 14 heads. Which is more plausible: $p = 0.5$ or $p = 0.7$? The chance of exactly 14 heads is about 3.7% if $p = 0.5$ but 19.2% if $p = 0.7$. Trying every $p$, the likelihood peaks at $p = 0.7$, the observed fraction. Training a neural network to minimize "cross-entropy loss" is exactly this calculation, run over millions of parameters.`,
    visual: { widget: 'mle', caption: tx`Drag the pink point along the likelihood curve: it's highest at $\hat p = k/n$. Now increase $n$ while keeping $k/n$ about the same: the curve gets narrower, so the data pin the parameter down more tightly.` },
    math: tx`**Likelihood.** For independent observations $x_1, \dots, x_n$ from a model $f(x;\theta)$: $\ L(\theta) = \prod_{i=1}^n f(x_i;\theta)$ and $\ell(\theta) = \ln L(\theta) = \sum_i \ln f(x_i;\theta)$.

**MLE.** $\hat\theta = \arg\max_\theta \ell(\theta)$, usually found by solving $\ell'(\theta) = 0$.

**Standard results.**
- Bernoulli/binomial: $\hat p = \frac kn$.
- Poisson: $\hat\lambda = \bar x$. Exponential: $\hat\lambda = 1/\bar x$.
- Normal: $\hat\mu = \bar x$ and $\hat\sigma^2 = \frac1n\sum(x_i - \bar x)^2$ (note $n$, not $n - 1$).

**Precision.** For large $n$, $\hat\theta \approx N\!\left(\theta, \frac{1}{I(\theta)}\right)$ with Fisher information $I(\theta) = -E[\ell''(\theta)]$. For a binomial, $\operatorname{SE}(\hat p) = \sqrt{\hat p(1-\hat p)/n}$.

**Likelihood ratio test.** To test $H_0: \theta = \theta_0$, use $\Lambda = 2\big(\ell(\hat\theta) - \ell(\theta_0)\big)$, which is approximately $\chi^2_1$ under $H_0$: reject at 5% if $\Lambda > 3.84$.`,
    example: {
      problem: tx`Waiting times (minutes) of $2.1, 0.7, 3.4, 1.2, 2.6$ are modelled as exponential with rate $\lambda$. Find the MLE.`,
      steps: [
        tx`$f(x;\lambda) = \lambda e^{-\lambda x}$, so $\ell(\lambda) = n\ln\lambda - \lambda\sum x_i = 5\ln\lambda - 10\lambda$.`,
        tx`$\ell'(\lambda) = \frac5\lambda - 10 = 0$ gives $\hat\lambda = 0.5$ per minute.`,
        tx`$\ell''(\lambda) = -\frac{5}{\lambda^2} < 0$, so it's a maximum.`,
        tx`In general $\hat\lambda = 1/\bar x$: the estimated rate is one over the average wait (here 2 minutes).`,
      ],
    },
    pitfalls: [
      tx`Maximize the log-likelihood, but report the parameter, not the log-likelihood value.`,
      tx`The MLE of a normal variance divides by $n$; it's slightly biased. The usual sample variance divides by $n - 1$.`,
      tx`Check the boundaries and the second derivative: with 0 heads out of 10, the MLE is $\hat p = 0$, at the edge, not at a point where $\ell' = 0$.`,
    ],
    usedIn: tx`Fitting almost every statistical model (logistic regression, GLMs), training machine-learning classifiers, estimating parameters of differential-equation models from data (Module 15), and building confidence intervals and tests.`,
    practice: [
      { level: 1, gen(R) {
        const n = R.int(10, 200), k = R.int(1, n - 1);
        return { q: tx`In ${n} independent trials there are ${k} successes. What is the maximum likelihood estimate of the success probability?`, ans: { type: 'num', answer: k / n, abs: 1e-6, rel: 0.002 }, hint: tx`$\ell(p) = k\ln p + (n-k)\ln(1-p)$. Set $\ell'(p) = 0$.`, sol: [tx`$\frac kp - \frac{n-k}{1-p} = 0 \Rightarrow \hat p = \frac kn = \frac{${k}}{${n}} \approx ${fmt(k / n, 4)}$.`] };
      } },
      { level: 2, gen(R) {
        const n = R.int(5, 8), pois = R.chance(0.5), xs = Array.from({ length: n }, () => (pois ? R.int(0, 7) : R.real(0.2, 5, 1))), mean = xs.reduce((a, b) => a + b, 0) / n;
        if (!mean) return { q: tx`Poisson counts $0, 1, 2$: find $\hat\lambda$.`, ans: { type: 'num', answer: 1 }, hint: tx`Mean.`, sol: [tx`$\hat\lambda = \bar x = 1$.`] };
        return {
          q: pois ? tx`The number of emails per hour was $${xs.join(', ')}$. Assuming a Poisson model, find the MLE of the rate $\lambda$.` : tx`Repair times (hours) of $${xs.join(', ')}$ are modelled as exponential with rate $\lambda$. Find the MLE $\hat\lambda$. Four decimals.`,
          ans: { type: 'num', answer: pois ? mean : 1 / mean, tol: 0.0006 },
          hint: pois ? tx`For Poisson, $\ell(\lambda) = \sum x_i\ln\lambda - n\lambda + \text{const}$.` : tx`For an exponential, $\ell(\lambda) = n\ln\lambda - \lambda\sum x_i$.`,
          sol: pois ? [tx`$\ell'(\lambda) = \frac{\sum x_i}{\lambda} - n = 0$, so $\hat\lambda = \bar x = ${fmt(mean, 4)}$.`] : [tx`$\ell'(\lambda) = \frac n\lambda - \sum x_i = 0$, so $\hat\lambda = \frac{1}{\bar x} = \frac{1}{${fmt(mean, 4)}} \approx ${fmt(1 / mean, 5)}$.`],
        };
      } },
      { level: 3, gen(R) {
        const n = R.int(4, 7), xs = Array.from({ length: n }, () => R.int(1, 20)), mean = xs.reduce((a, b) => a + b, 0) / n, s2 = xs.reduce((a, x) => a + (x - mean) ** 2, 0) / n;
        return { q: tx`Data $${xs.join(', ')}$ are modelled as normal. Find the maximum likelihood estimate of the variance $\sigma^2$. Three decimals.`, ans: { type: 'num', answer: s2, tol: 0.002 }, hint: tx`$\hat\sigma^2 = \frac1n\sum(x_i - \bar x)^2$: divide by $n$, not $n - 1$.`, sol: [tx`$\bar x = ${fmt(mean, 4)}$ and $\sum(x_i - \bar x)^2 = ${fmt(s2 * n, 4)}$.`, tx`$\hat\sigma^2 = \frac{${fmt(s2 * n, 4)}}{${n}} \approx ${fmt(s2, 4)}$ (the unbiased version would be $${fmt((s2 * n) / (n - 1), 4)}$).`] };
      } },
      { level: 4, gen(R) {
        const n = R.pick([20, 40, 50, 100]), k = Math.round(n * R.pick([0.3, 0.35, 0.6, 0.65, 0.7, 0.75])), p0 = 0.5, ph = k / n;
        const ll = (p) => k * Math.log(p) + (n - k) * Math.log(1 - p), lam = 2 * (ll(ph) - ll(p0));
        return {
          q: tx`A coin shows ${k} heads in ${n} flips. Compute the likelihood ratio statistic $\Lambda = 2\big(\ell(\hat p) - \ell(0.5)\big)$ for testing $H_0: p = 0.5$. Three decimals. Is it significant at 5% (critical value 3.84)?`,
          ans: { type: 'num', answer: lam, tol: 0.002 },
          hint: tx`$\ell(p) = k\ln p + (n - k)\ln(1 - p)$ with $\hat p = ${fmt(ph, 3)}$.`,
          sol: [tx`$\ell(\hat p) = ${fmt(ll(ph), 4)}$ and $\ell(0.5) = ${fmt(ll(p0), 4)}$.`, tx`$\Lambda = 2(${fmt(ll(ph) - ll(p0), 4)}) = ${fmt(lam, 4)}$, ${lam > 3.84 ? 'above 3.84: reject $H_0$.' : 'below 3.84: do not reject $H_0$.'}`],
        };
      } },
    ],
  }, { before: 'ci' });

  /* ======================= Fourier: transform and DFT ======================= */
  AM.addLesson('fourier', {
    id: 'transform', title: 'The Fourier transform and the DFT', minutes: 40,
    summary: 'Frequency content of signals that aren\'t periodic, and how computers compute it.',
    idea: tx`Fourier series handle periodic signals. The **Fourier transform** handles everything else by letting the frequency vary continuously: $\hat f(\omega) = \int_{-\infty}^\infty f(t)e^{-i\omega t}dt$ measures how much of frequency $\omega$ is in $f$. Narrow pulses in time are spread out in frequency, and vice versa (the uncertainty principle).

Computers work with samples, so in practice you use the **discrete Fourier transform (DFT)** of $N$ samples, computed in $O(N\log N)$ operations by the **fast Fourier transform (FFT)**, one of the most important algorithms ever written. Sampling has a catch: frequencies above half the sampling rate (the **Nyquist frequency**) masquerade as lower ones. That's **aliasing**.`,
    everyday: tx`Music apps show a live spectrum: that's an FFT of the last fraction of a second of audio. CDs sample at 44,100 Hz because human hearing tops out around 20,000 Hz, just under the 22,050 Hz Nyquist limit. In films, wagon wheels sometimes seem to spin backwards because the camera samples at 24 frames per second: the spokes' motion aliases to a slow negative frequency.`,
    visual: { widget: 'dft', caption: tx`Two tones are sampled 64 times per second. Their peaks sit at the right frequencies in the spectrum. Add noise: it spreads across all frequencies while the peaks stay. Now push a tone above 32 Hz and watch it alias to a lower frequency.` },
    math: tx`**Fourier transform.** $\hat f(\omega) = \displaystyle\int_{-\infty}^\infty f(t)e^{-i\omega t}\,dt$, inverse $f(t) = \frac1{2\pi}\int\hat f(\omega)e^{i\omega t}d\omega$.

**Key properties.** Derivatives become multiplication: $\widehat{f'}(\omega) = i\omega\hat f(\omega)$. Convolution becomes multiplication: $\widehat{f*g} = \hat f\hat g$. Shifting in time multiplies by a phase: $\widehat{f(t - a)} = e^{-i\omega a}\hat f$.

**Pairs.** $e^{-at^2} \mapsto \sqrt{\pi/a}\,e^{-\omega^2/(4a)}$ (a Gaussian stays Gaussian); a box of half-width $T$ maps to $\frac{2\sin(\omega T)}{\omega}$.

**DFT.** For samples $x_0, \dots, x_{N-1}$:
$$X_k = \sum_{n=0}^{N-1} x_n e^{-2\pi ikn/N}, \qquad k = 0, \dots, N-1.$$
$X_0$ is the sum (the DC term). With sampling rate $f_s$, bin $k$ corresponds to frequency $k\,f_s/N$ (resolution $\Delta f = f_s/N$).

**Sampling theorem.** A signal with no frequencies above $f_{\max}$ is captured exactly if $f_s > 2f_{\max}$. Otherwise frequency $f$ aliases to $|f - mf_s|$ for the nearest integer $m$.`,
    example: {
      problem: tx`Compute the DFT of $x = (1, 2, 0, -1)$.`,
      steps: [
        tx`With $N = 4$, $e^{-2\pi i/4} = -i$, so $X_k = \sum_n x_n(-i)^{kn}$.`,
        tx`$X_0 = 1 + 2 + 0 - 1 = 2$ and $X_2 = 1 - 2 + 0 + 1 = 0$ (alternating signs).`,
        tx`$X_1 = 1 + 2(-i) + 0(-1) + (-1)(i) = 1 - 3i$, and $X_3 = \overline{X_1} = 1 + 3i$ because $x$ is real.`,
        tx`The energy is mostly at $k = 1$: one oscillation across the 4 samples.`,
      ],
    },
    pitfalls: [
      tx`For real signals the DFT is symmetric, $X_{N-k} = \overline{X_k}$, so only bins $0$ to $N/2$ carry new information.`,
      tx`Frequency resolution $f_s/N$ is set by the *duration* of the recording, not by how fast you sample.`,
      tx`Sample fast enough *before* digitizing, or filter out high frequencies first. Aliasing can't be undone afterwards.`,
    ],
    usedIn: tx`Audio and image compression, MRI and CT reconstruction, solving PDEs with spectral methods, fast polynomial multiplication, and analysing vibrations and signals of every kind.`,
    practice: [
      { level: 1, gen(R) {
        const fs = R.pick([100, 200, 500, 1000, 8000, 44100]), f = R.int(1, Math.round(fs * 1.4)), r = f % fs, alias = Math.min(r, fs - r), askNyq = R.chance(0.4);
        if (askNyq) return { q: tx`A signal is sampled at ${fs} samples per second. What is the highest frequency (in Hz) that can be represented without aliasing?`, ans: { type: 'num', answer: fs / 2 }, hint: tx`The Nyquist frequency is half the sampling rate.`, sol: [tx`$f_s/2 = ${fs / 2}$ Hz.`] };
        return { q: tx`A ${f} Hz tone is sampled at ${fs} Hz. At what frequency (between 0 and ${fs / 2} Hz) does it appear in the sampled data?`, ans: { type: 'num', answer: alias }, hint: tx`Subtract the nearest multiple of the sampling rate and take the absolute value.`, sol: [tx`$|${f} - ${Math.round(f / fs)}\cdot${fs}| = ${alias}$ Hz${f <= fs / 2 ? ' (below Nyquist, so no aliasing)' : ' (aliased)'}.`] };
      } },
      { level: 2, gen(R) {
        const x = [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)], k = R.pick([0, 1, 2]);
        const X = [x[0] + x[1] + x[2] + x[3], [x[0] - x[2], -(x[1] - x[3])], x[0] - x[1] + x[2] - x[3]];
        const ans = k === 1 ? X[1] : [X[k], 0];
        return { q: tx`Compute the DFT coefficient $X_{${k}}$ of $x = (${x.join(', ')})$ ($N = 4$). Enter real and imaginary parts.`, ans: { type: 'vec', answer: ans, placeholder: 'real, imaginary' }, hint: tx`$X_k = \sum_n x_n e^{-2\pi ikn/4} = \sum_n x_n(-i)^{kn}$.`, sol: [k === 0 ? tx`$X_0 = \sum x_n = ${X[0]}$.` : k === 2 ? tx`$X_2 = x_0 - x_1 + x_2 - x_3 = ${X[2]}$.` : tx`$X_1 = x_0 - ix_1 - x_2 + ix_3 = (${x[0]} - (${x[2]})) - i(${x[1]} - (${x[3]})) = ${X[1][0]} ${X[1][1] < 0 ? '-' : '+'} ${Math.abs(X[1][1])}i$.`] };
      } },
      { level: 3, gen(R) {
        const fs = R.pick([1000, 2000, 8000, 48000]), N = R.pick([256, 512, 1024, 4096]), df = fs / N, bin = R.int(5, N / 2 - 5), f = bin * df, askBin = R.chance(0.5);
        return askBin
          ? { q: tx`With sampling rate ${fs} Hz and an FFT of length ${N}, which bin index $k$ holds a ${fmt(f, 4)} Hz tone?`, ans: { type: 'num', answer: bin }, hint: tx`Bin $k$ is at $k\,f_s/N$.`, sol: [tx`$k = f\cdot\frac{N}{f_s} = ${fmt(f, 4)}\cdot\frac{${N}}{${fs}} = ${bin}$.`] }
          : { q: tx`An FFT of length ${N} at a sampling rate of ${fs} Hz has what frequency resolution (spacing between bins) in Hz? Four decimals.`, ans: { type: 'num', answer: df, tol: 0.0006 }, hint: tx`$\Delta f = f_s/N$.`, sol: [tx`$${fs}/${N} = ${fmt(df, 5)}$ Hz. To halve it you need twice the recording time.`] };
      } },
      { level: 4, gen(R) {
        const kind = R.pick(['gauss', 'box']), w = R.pick([0.5, 1, 2, 3]);
        if (kind === 'gauss') { const a = R.pick([0.5, 1, 2]), v = Math.sqrt(PI / a) * Math.exp(-(w * w) / (4 * a)); return { q: tx`Compute the Fourier transform $\hat f(\omega)$ of $f(t) = e^{-${a}t^2}$ at $\omega = ${w}$. Four decimals.`, ans: { type: 'num', answer: v, tol: 0.0006 }, hint: tx`$\widehat{e^{-at^2}} = \sqrt{\pi/a}\,e^{-\omega^2/(4a)}$ (complete the square in the exponent).`, sol: [tx`$\sqrt{\pi/${a}}\,e^{-${w * w}/${4 * a}} \approx ${fmt(v, 5)}$.`], verify: C.near(M.integrate((t) => Math.exp(-a * t * t) * Math.cos(w * t), -12, 12, 20000), v, 1e-7) }; }
        const T = R.pick([0.5, 1, 2]), v = (2 * Math.sin(w * T)) / w;
        return { q: tx`$f(t) = 1$ for $|t| \le ${T}$ and 0 otherwise. Compute $\hat f(${w})$. Four decimals.`, ans: { type: 'num', answer: v, tol: 0.0006 }, hint: tx`$\int_{-T}^{T}e^{-i\omega t}dt = \frac{2\sin(\omega T)}{\omega}$ (the imaginary parts cancel).`, sol: [tx`$\hat f(${w}) = \frac{2\sin(${fmt(w * T)})}{${w}} \approx ${fmt(v, 5)}$. A wider box gives a narrower transform.`], verify: C.near(M.integrate((t) => Math.cos(w * t), -T, T, 4000), v, 1e-8) };
      } },
    ],
  }, { after: 'series' });
})();
