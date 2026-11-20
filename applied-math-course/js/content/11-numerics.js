/* Module 11 — Numerical methods (Stage 3). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, C = AM.checks, M = AM.m;

  AM.module({
    id: 'numerics', stage: 3, title: 'Numerical Methods', aka: 'Numerical Analysis / Scientific Computing',
    blurb: 'Most real problems have no formula answer, so applied mathematicians compute. This module covers how computers store numbers and where errors come from, how to solve equations by iteration, and how to step differential equations forward in time accurately and stably.',
    prereq: ['calc2', 'linalg', 'ode'],
    lessons: [
      {
        id: 'floating', title: 'Floating point and error', minutes: 30,
        summary: 'How computers store numbers, and how errors creep in and grow.',
        idea: tx`Computers store real numbers in **floating point**: a fixed number of significant digits (about 16 decimal digits in double precision) times a power of 2. Most numbers, even $0.1$, can't be stored exactly, so every operation rounds slightly. Usually that's harmless. It becomes dangerous when you subtract two nearly equal numbers (**catastrophic cancellation**) or when an algorithm amplifies small errors at every step.

Numerical analysis is about controlling two kinds of error: **truncation error**, from approximating a process (like replacing a derivative with a finite difference), and **rounding error**, from finite precision. Often, making one smaller makes the other bigger.`,
        everyday: tx`Type <code>0.1 + 0.2 == 0.3</code> into almost any programming language and you get false, because 0.1 and 0.2 are stored as binary approximations that add to 0.30000000000000004.

In 1991 a Patriot missile battery's clock drifted because 0.1 seconds was stored with a tiny error. Over 100 hours of operation it accumulated to about a third of a second, enough to miss an incoming missile by over half a kilometre.`,
        visual: { widget: 'fderror', caption: tx`Move $h$ from right to left. At first the error drops along a straight line (truncation error shrinking). Past a certain point it climbs again as rounding error takes over. Central differences reach a much lower minimum than forward differences.` },
        math: tx`**Floating point.** $x = \pm(1.d_1d_2\dots d_{52})_2\times 2^e$ in double precision. **Machine epsilon** $\epsilon_{\text{mach}} = 2^{-52}\approx 2.2\times10^{-16}$ is the gap between 1 and the next representable number. Each arithmetic operation has a relative error of about $\epsilon_{\text{mach}}$.

**Errors.** Absolute error $|\hat x - x|$; relative error $\dfrac{|\hat x - x|}{|x|}$.

**Cancellation.** Subtracting nearly equal numbers keeps the absolute error but wrecks the relative accuracy. Rewrite to avoid it: $\sqrt{x+1} - \sqrt{x} = \dfrac{1}{\sqrt{x+1} + \sqrt x}$.

**Finite differences.**
$$\frac{f(x+h) - f(x)}{h} = f'(x) + O(h), \qquad \frac{f(x+h) - f(x-h)}{2h} = f'(x) + O(h^2).$$
Rounding adds an error of order $\epsilon_{\text{mach}}/h$, so the best $h$ balances the two: about $10^{-8}$ for forward differences.

**Conditioning.** The condition number $\kappa$ measures how much a problem amplifies relative errors in its input. Expect to lose about $\log_{10}\kappa$ digits.`,
        example: {
          problem: tx`Estimate $f'(1)$ for $f(x) = e^x$ with a forward difference and $h = 0.1$, and explain the error.`,
          steps: [
            tx`$\frac{e^{1.1} - e^{1}}{0.1} = \frac{3.004166 - 2.718282}{0.1} = 2.85884$.`,
            tx`The true value is $e \approx 2.71828$, so the error is about $0.1406$.`,
            tx`Taylor: $f(x+h) = f(x) + hf'(x) + \frac{h^2}{2}f''(x) + \cdots$, so the forward difference is off by about $\frac h2 f''(1) = 0.05\times2.718 = 0.136$. That truncation error accounts for almost all of it.`,
            tx`A central difference with the same $h$ gives $2.72281$, an error of just $0.0045$, because its error term is proportional to $h^2$.`,
          ],
        },
        pitfalls: [
          tx`Never test floating-point numbers for exact equality. Compare within a tolerance.`,
          tx`A smaller step $h$ isn't always better: below about $10^{-8}$, rounding error takes over.`,
          tx`Adding many small numbers to a large one can lose them entirely. Add the small numbers first, or use compensated summation.`,
        ],
        usedIn: tx`Every numerical method in this module and in Modules 13–15 has to be analysed for both kinds of error. Ill-conditioned matrices (the condition number from Module 05) are where linear algebra meets floating point.`,
        practice: [
          { level: 1, gen(R) {
            const [name, tv, tvt] = R.pick([['\\pi', Math.PI, '\\pi'], ['\\sqrt2', Math.SQRT2, '\\sqrt2'], ['e', Math.E, 'e'], ['\\ln 2', Math.LN2, '\\ln 2']]);
            const approx = +(tv + R.pick([-1, 1]) * R.real(0.0005, 0.03, 4)).toFixed(4), rel = Math.abs(approx - tv) / tv;
            return {
              q: tx`Someone uses $${approx}$ as an approximation to $${name}$. What is the relative error? Give it as a decimal (not a percentage), to 3 significant figures.`,
              ans: { type: 'num', answer: rel, abs: 1e-7, rel: 0.005 },
              hint: tx`Relative error $= \dfrac{|\text{approx} - \text{true}|}{|\text{true}|}$.`,
              sol: [tx`$|${approx} - ${tvt}| \approx ${fmt(Math.abs(approx - tv), 6)}$.`, tx`Divide by $${tvt} \approx ${fmt(tv, 6)}$: relative error $\approx ${fmt(rel, 6)}$, i.e. about ${fmt(rel * 100, 3)}%.`],
            };
          } },
          { level: 2, gen(R) {
            const [f, ftex] = R.pick([[Math.exp, 'e^x'], [Math.sin, '\\sin x'], [(x) => x ** 3, 'x^3'], [Math.log, '\\ln x']]);
            const x = R.pick([1, 2, 0.5]), h = R.pick([0.1, 0.05, 0.2, 0.01]), central = R.chance(0.5);
            const v = central ? (f(x + h) - f(x - h)) / (2 * h) : (f(x + h) - f(x)) / h;
            return {
              q: tx`Estimate $f'(${x})$ for $f(x) = ${ftex}$ using a **${central ? 'central' : 'forward'}** difference with $h = ${h}$. Give 5 decimals.`,
              ans: { type: 'num', answer: v, tol: 0.00002 },
              hint: central ? tx`$\dfrac{f(x+h) - f(x-h)}{2h}$.` : tx`$\dfrac{f(x+h) - f(x)}{h}$.`,
              sol: central ? [tx`$\dfrac{f(${fmt(x + h)}) - f(${fmt(x - h)})}{${2 * h}} = \dfrac{${fmt(f(x + h), 7)} - ${fmt(f(x - h), 7)}}{${fmt(2 * h)}} \approx ${fmt(v, 6)}$.`] : [tx`$\dfrac{f(${fmt(x + h)}) - f(${x})}{${h}} = \dfrac{${fmt(f(x + h), 7)} - ${fmt(f(x), 7)}}{${h}} \approx ${fmt(v, 6)}$.`],
            };
          } },
          { level: 3, gen(R) {
            const x = R.int(1, 4), h = R.pick([0.1, 0.2, 0.05, 0.5]), central = R.chance(0.5), err = central ? h * h : 3 * x * h + h * h;
            return {
              q: tx`For $f(x) = x^3$ at $x = ${x}$ with $h = ${h}$, compute the exact error (estimate minus true derivative) of the **${central ? 'central' : 'forward'}** difference. Five decimals.`,
              ans: { type: 'num', answer: err, tol: 0.00002 },
              hint: tx`Expand $(x \pm h)^3$ algebraically and subtract the true derivative $3x^2 = ${3 * x * x}$.`,
              sol: central ? [tx`$\frac{(x+h)^3 - (x-h)^3}{2h} = \frac{6x^2h + 2h^3}{2h} = 3x^2 + h^2$.`, tx`Error $= h^2 = ${fmt(err, 6)}$, independent of $x$: second-order accuracy.`] : [tx`$\frac{(x+h)^3 - x^3}{h} = 3x^2 + 3xh + h^2$.`, tx`Error $= 3xh + h^2 = 3(${x})(${h}) + ${h}^2 = ${fmt(err, 6)}$. The leading term $3xh = \frac{h}{2}f''(x)$ is the first-order truncation error.`],
              verify: C.near(central ? ((x + h) ** 3 - (x - h) ** 3) / (2 * h) - 3 * x * x : ((x + h) ** 3 - x ** 3) / h - 3 * x * x, err, 1e-9),
            };
          } },
        ],
      },
      {
        id: 'roots', title: "Root finding: bisection and Newton's method", minutes: 35,
        summary: "Solving f(x) = 0 when algebra can't.",
        idea: tx`Most equations can't be solved with a formula, but they can be solved to 15 digits by iteration: start with a guess and keep improving it.

**Bisection** starts from an interval where $f$ changes sign. By the intermediate value theorem there's a root inside, so cut the interval in half, keep the half that still has a sign change, and repeat. It always works and gains one binary digit per step.

**Newton's method** is faster but less reliable. Follow the tangent line at your current guess down to where it crosses zero, and use that as your next guess. Near a root the number of correct digits roughly *doubles* each step. Far from a root, or near a flat spot, it can jump wildly or diverge.`,
        everyday: tx`Guessing a number between 1 and 100 with "higher/lower" hints: always guess the middle and you'll get it in at most 7 tries. That's bisection.

Your calculator's square root key uses Newton's method. To find $\sqrt2$, start at 1.5 and repeatedly average $x$ with $2/x$: 1.5, 1.41667, 1.414216, 1.41421356237. Four steps give 12 correct digits.`,
        visual: { widget: 'newton', caption: tx`Drag the pink starting point and step through the iterations. Each orange tangent line lands closer to the root. Try $\arctan x$ from $x_0 = 1.5$, where Newton overshoots and diverges, then switch to bisection: slower, but it never fails.` },
        math: tx`**Bisection.** Given $f(a)f(b) < 0$, let $m = \frac{a+b}{2}$ and keep whichever of $[a, m]$ or $[m, b]$ still has a sign change. Using the midpoint after $n$ halvings as the estimate, the error is at most $\dfrac{b - a}{2^{n+1}}$.

**Newton's method.**
$$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}.$$
If $f(r) = 0$, $f'(r)\ne0$ and $x_0$ is close enough, convergence is **quadratic**: $|e_{n+1}| \approx \dfrac{|f''(r)|}{2|f'(r)|}\,e_n^2$.

**Secant method.** Replace $f'(x_n)$ with $\dfrac{f(x_n) - f(x_{n-1})}{x_n - x_{n-1}}$: no derivative needed, and order about 1.618.

**Fixed-point iteration.** $x_{n+1} = g(x_n)$ converges near a fixed point $r$ when $|g'(r)| < 1$.

**Stopping.** Stop when $|x_{n+1} - x_n|$ or $|f(x_n)|$ falls below a tolerance, and always cap the number of iterations.`,
        example: {
          problem: tx`Apply Newton's method to $f(x) = x^2 - 2$ starting from $x_0 = 1$.`,
          steps: [
            tx`$x_{n+1} = x_n - \frac{x_n^2 - 2}{2x_n} = \frac12\left(x_n + \frac2{x_n}\right)$.`,
            tx`$x_1 = \frac12(1 + 2) = 1.5$, then $x_2 = \frac12\left(1.5 + \frac{2}{1.5}\right) = 1.41\overline{6}$.`,
            tx`$x_3 = 1.4142157$ and $x_4 = 1.41421356237$.`,
            tx`Errors: $0.086,\ 0.0025,\ 2.1\times10^{-6},\ 1.6\times10^{-12}$. Each is roughly the square of the one before: quadratic convergence.`,
          ],
        },
        pitfalls: [
          tx`Newton fails if $f'(x_n) = 0$, and it can cycle or diverge from a poor start. Safeguard it with bisection.`,
          tx`Bisection needs a sign change. A double root like $(x-1)^2$ never changes sign.`,
          tx`A tiny $|f(x)|$ doesn't guarantee $x$ is close to the root when $f$ is very flat there.`,
        ],
        usedIn: tx`Implicit ODE solvers (next lesson) run Newton's method at every time step. Optimization (Module 14) applies Newton's method to $\nabla f = 0$. Square roots and reciprocals in hardware are computed the same way.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.int(0, 3), w = R.pick([1, 2, 4]), tol = R.pick([0.1, 0.01, 0.001, 1e-4, 1e-6]);
            let n = 0; while (w / 2 ** (n + 1) >= tol) n++;
            return {
              q: tx`Bisection starts on $[${a}, ${a + w}]$ and estimates the root by the midpoint of the current interval. What is the fewest number of halvings that guarantees an error below $${tol}$?`.replace('0.0001', '10^{-4}').replace('0.000001', '10^{-6}'),
              ans: { type: 'num', answer: n, tol: 0.01 },
              hint: tx`After $n$ halvings the error is at most $\frac{b - a}{2^{n+1}}$. Find the smallest $n$ with $\frac{${w}}{2^{n+1}} < ${tol}$.`,
              sol: [tx`Need $2^{n+1} > \frac{${w}}{${tol}} = ${fmt(w / tol)}$, i.e. $n + 1 > \log_2 ${fmt(w / tol)} \approx ${fmt(Math.log2(w / tol), 3)}$.`, tx`Smallest integer: $n = ${n}$.`],
            };
          } },
          { level: 2, gen(R) {
            const [f, df, tex, x0] = R.pick([[(x) => x * x - 5, (x) => 2 * x, 'x^2 - 5', 2], [(x) => x ** 3 - 2 * x - 5, (x) => 3 * x * x - 2, 'x^3 - 2x - 5', 2], [(x) => Math.cos(x) - x, (x) => -Math.sin(x) - 1, '\\cos x - x', 1], [(x) => Math.exp(x) - 3, Math.exp, 'e^x - 3', 1], [(x) => x ** 3 - 10, (x) => 3 * x * x, 'x^3 - 10', 2]]);
            const steps = R.pick([1, 2]); let x = x0; const xs = [x]; for (let i = 0; i < steps; i++) { x = x - f(x) / df(x); xs.push(x); }
            return {
              q: tx`Apply ${steps === 1 ? 'one step' : 'two steps'} of Newton's method to $f(x) = ${tex}$ from $x_0 = ${x0}$. Give $x_{${steps}}$ to 6 decimals.`,
              ans: { type: 'num', answer: x, tol: 0.000002 },
              hint: tx`$x_{n+1} = x_n - f(x_n)/f'(x_n)$. Keep full precision between steps.`,
              sol: xs.slice(1).map((v, i) => tx`$x_{${i + 1}} = ${fmt(xs[i], 8)} - \frac{${fmt(f(xs[i]), 8)}}{${fmt(df(xs[i]), 8)}} = ${fmt(v, 8)}$.`),
            };
          } },
          { level: 3, gen(R) {
            const k = R.pick([2, 3]), c = R.int(2, 30);
            const expr = k === 2 ? `(x + ${c}/x)/2` : `(2x + ${c}/x^2)/3`;
            return {
              q: tx`Write Newton's iteration for solving $x^{${k}} = ${c}$ in the simplified form $x_{n+1} = g(x_n)$. Enter $g(x)$.`,
              ans: { type: 'fn', expr, domain: [0.5, 4], prefix: '$g(x) =$', placeholder: 'e.g. (x + 7/x)/2' },
              hint: tx`Use $f(x) = x^{${k}} - ${c}$ and $f'(x) = ${k}x^{${k - 1}}$ in $x - f(x)/f'(x)$, then simplify.`,
              sol: k === 2 ? [tx`$x - \frac{x^2 - ${c}}{2x} = \frac{2x^2 - x^2 + ${c}}{2x} = \frac{x^2 + ${c}}{2x} = \frac12\left(x + \frac{${c}}{x}\right)$.`, tx`This is the ancient Babylonian method: average your guess with $${c}/x$.`] : [tx`$x - \frac{x^3 - ${c}}{3x^2} = \frac{3x^3 - x^3 + ${c}}{3x^2} = \frac{2x^3 + ${c}}{3x^2} = \frac13\left(2x + \frac{${c}}{x^2}\right)$.`],
              verify() { const g = AM.compile(expr); let x = 2; for (let i = 0; i < 30; i++) x = g({ x }); return Math.abs(x ** k - c) < 1e-9 ? true : 'iteration does not converge to the root'; },
            };
          } },
        ],
      },
      {
        id: 'odesolvers', title: 'Numerical ODE solvers', minutes: 35,
        summary: 'Euler, Runge–Kutta, step size, accuracy and stability.',
        idea: tx`Most differential equations from real applications have no formula solution, so we compute them step by step. **Euler's method** is the simplest: from the current point, follow the slope for a small time step $h$, recompute the slope, and repeat. It's the slope field traced with a ruler.

Euler's error is proportional to $h$, which is slow. **Runge–Kutta** methods sample the slope several times within each step and combine the samples cleverly. The classic RK4 has error proportional to $h^4$, so halving the step makes it 16 times more accurate. Then there's **stability**: for some equations, a step that's too large makes the numerical solution explode even though the true solution decays.`,
        everyday: tx`Navigating by dead reckoning: you know your speed and heading, so every hour you mark a new position on the chart. Small errors in each hour's estimate accumulate. Checking your heading more often (smaller steps) or averaging your heading over the hour (the Runge–Kutta idea) keeps you closer to the true course. Weather forecasts, spacecraft trajectories and circuit simulators march forward in time like this, billions of steps at a time.`,
        visual: { widget: 'odesolvers', caption: tx`Increase $h$ and watch Euler (orange) drift away from the exact solution while RK4 (blue) stays on it. On $y' = -4y$, push $h$ past 0.5 and Euler becomes unstable. On the oscillator, Euler's spiral gains energy every cycle.` },
        math: tx`**Euler's method** for $y' = f(t, y)$:
$$y_{n+1} = y_n + h\,f(t_n, y_n).$$
Error per step $O(h^2)$; accumulated (global) error $O(h)$.

**Classic RK4.**
$$k_1 = f(t_n, y_n),\quad k_2 = f\!\left(t_n + \tfrac h2,\ y_n + \tfrac h2k_1\right),\quad k_3 = f\!\left(t_n + \tfrac h2,\ y_n + \tfrac h2k_2\right),\quad k_4 = f(t_n + h,\ y_n + hk_3),$$
$$y_{n+1} = y_n + \frac h6(k_1 + 2k_2 + 2k_3 + k_4),$$
with global error $O(h^4)$.

**Order.** A method of order $p$ has global error $\approx Ch^p$, so halving $h$ divides the error by $2^p$.

**Stability.** For $y' = \lambda y$ with $\lambda < 0$, Euler gives $y_{n+1} = (1 + h\lambda)y_n$, which decays only if $|1 + h\lambda| < 1$, i.e. $h < 2/|\lambda|$. **Implicit** methods like backward Euler, $y_{n+1} = y_n + hf(t_{n+1}, y_{n+1})$, are stable for every $h$ and are the tool for **stiff** problems.`,
        example: {
          problem: tx`Use Euler's method with $h = 0.5$ to estimate $y(1)$ for $y' = y$, $y(0) = 1$.`,
          steps: [
            tx`$y_1 = y_0 + h\,y_0 = 1 + 0.5(1) = 1.5$ at $t = 0.5$.`,
            tx`$y_2 = 1.5 + 0.5(1.5) = 2.25$ at $t = 1$.`,
            tx`The exact value is $e \approx 2.718$, so the error is $0.468$.`,
            tx`With $h = 0.25$, Euler gives $1.25^4 \approx 2.441$ (error $0.277$): roughly half the error, as expected for a first-order method.`,
          ],
        },
        pitfalls: [
          tx`Smaller steps cost more computation. A higher-order method is usually the better way to gain accuracy.`,
          tx`A stable-looking answer can still be inaccurate. Check it by halving $h$ and seeing whether the result changes.`,
          tx`For stiff equations explicit methods need absurdly small steps; switch to an implicit method.`,
        ],
        usedIn: tx`Every simulation of a dynamic system uses these: orbits, epidemics (Module 15), chemical reactions, circuits. Solving PDEs by the method of lines (Module 13) turns them into large ODE systems stepped this way.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.nz(-3, 3), b = R.int(-3, 3), t0 = R.int(0, 2), y0 = R.int(-3, 5), h = R.pick([0.1, 0.2, 0.5, 0.25]);
            const f = (t, y) => a * y + b * t, y1 = y0 + h * f(t0, y0);
            return {
              q: tx`Take one Euler step of size $h = ${h}$ for $y' = ${AM.co(a, 'y')} ${AM.sgn(b)}t$ from $y(${t0}) = ${y0}$. What is $y_1$?`.replace('+ 0t', '').replace('- 0t', ''),
              ans: { type: 'num', answer: y1 },
              hint: tx`$y_1 = y_0 + h\,f(t_0, y_0)$.`,
              sol: [tx`$f(${t0}, ${y0}) = ${f(t0, y0)}$.`, tx`$y_1 = ${y0} + ${h}(${f(t0, y0)}) = ${fmt(y1)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['lin', 'logi']), h = R.pick([0.1, 0.2, 0.25]), n = R.int(2, 3);
            const [f, tex, y0] = kind === 'lin' ? [(t, y) => t - y, "y' = t - y", R.int(0, 3)] : [(t, y) => y * (2 - y), "y' = y(2 - y)", 0.5];
            let t = 0, y = y0; const rows = [];
            for (let i = 0; i < n; i++) { const s = f(t, y), yn = y + h * s; rows.push(tx`$y_{${i + 1}} = ${fmt(y, 6)} + ${h}(${fmt(s, 6)}) = ${fmt(yn, 6)}$`); y = yn; t += h; }
            return {
              q: tx`Use Euler's method with $h = ${h}$ to estimate $y(${fmt(n * h)})$ for $${tex}$, $y(0) = ${y0}$. Give 5 decimals.`,
              ans: { type: 'num', answer: y, tol: 0.00002 },
              hint: tx`Take ${n} steps, updating both $t$ and $y$ each time: $y_{k+1} = y_k + h f(t_k, y_k)$.`,
              sol: rows,
            };
          } },
          { level: 3, gen(R) {
            if (R.chance(0.5)) {
              const lam = R.pick([-2, -4, -5, -10, -20, -50, -100]);
              return {
                q: tx`For the test equation $y' = ${lam}y$, what is the largest step size $h$ for which Euler's method is stable (the numerical solution decays)?`,
                ans: { type: 'num', answer: 2 / Math.abs(lam), abs: 1e-9, rel: 0.002 },
                hint: tx`Euler gives $y_{n+1} = (1 + h\lambda)y_n$. Stability needs $|1 + h\lambda| < 1$.`,
                sol: [tx`$|1 ${lam}h| < 1 \iff 0 < h < \frac{2}{${Math.abs(lam)}}$.`, tx`So $h$ must stay below $${fmt(2 / Math.abs(lam), 5)}$. Larger $|\lambda|$ (faster decay) forces smaller steps: the hallmark of stiffness.`],
              };
            }
            const h = R.pick([0.1, 0.2, 0.5, 1]), v = 1 + h + h * h / 2 + h ** 3 / 6 + h ** 4 / 24;
            return {
              q: tx`Take one RK4 step of size $h = ${h}$ for $y' = y$, $y(0) = 1$. Give $y_1$ to 6 decimals.`,
              ans: { type: 'num', answer: v, tol: 0.000002 },
              hint: tx`Compute $k_1, k_2, k_3, k_4$ with $f(t, y) = y$. For this equation the result matches the first five terms of the Taylor series of $e^h$.`,
              sol: [tx`$k_1 = 1$, $k_2 = 1 + \frac h2 = ${fmt(1 + h / 2, 6)}$, $k_3 = 1 + \frac h2k_2 = ${fmt(1 + (h / 2) * (1 + h / 2), 6)}$, $k_4 = 1 + hk_3 = ${fmt(1 + h * (1 + (h / 2) * (1 + h / 2)), 6)}$.`, tx`$y_1 = 1 + \frac{${h}}{6}(k_1 + 2k_2 + 2k_3 + k_4) = ${fmt(v, 7)}$, versus $e^{${h}} = ${fmt(Math.exp(h), 7)}$.`],
              verify: C.near(M.rk4Step((t, y) => [y[0]], 0, [1], h)[0], v, 1e-12),
            };
          } },
        ],
      },
    ],
  });
})();
