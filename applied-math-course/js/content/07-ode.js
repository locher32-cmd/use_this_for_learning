/* Module 07 — Ordinary differential equations (Stage 2). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, sgn = AM.sgn, poly = AM.poly, C = AM.checks, M = AM.m;
  const pm = (r) => `\\begin{pmatrix} ${r.map((x) => x.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
  const CLASSES = ['Stable node', 'Unstable node', 'Saddle', 'Stable spiral', 'Unstable spiral', 'Centre'];
  const classify = (T, D) => (D < 0 ? 2 : T * T - 4 * D < 0 ? (T === 0 ? 5 : T < 0 ? 3 : 4) : T < 0 ? 0 : 1);

  AM.module({
    id: 'ode', stage: 2, title: 'Differential Equations', aka: 'Ordinary Differential Equations (ODEs)',
    blurb: 'Differential equations are how applied mathematicians write down the laws of change: how populations grow, how springs bounce, how diseases spread. You will read them as slope fields, solve the standard families exactly, and use eigenvalues to predict the long-run behaviour of coupled systems.',
    prereq: ['calc2', 'linalg'],
    lessons: [
      {
        id: 'slope', title: 'Differential equations and slope fields', minutes: 30,
        summary: 'Equations about rates of change, and pictures that show every solution at once.',
        idea: tx`A **differential equation** relates an unknown function to its own derivatives. Instead of telling you what $y$ is, it tells you how $y$ changes: "the population grows at a rate proportional to its size" is $y' = ky$. Solving it means finding the functions whose rates of change obey that rule.

You can see the answer before solving anything. At every point $(t, y)$ the equation $y' = f(t, y)$ dictates a slope, so draw a tiny segment with that slope there. The resulting **slope field** shows the shape of every solution at once, and a solution curve just follows the segments like a leaf on a stream. Choosing a starting point (an **initial condition**) picks out one curve.`,
        everyday: tx`A cup of coffee cools quickly when it's much hotter than the room and slowly as it nears room temperature. That's Newton's law of cooling, $T' = -k(T - T_{\text{room}})$: a rule about the rate, not a formula for the temperature. Every starting temperature gives a different cooling curve, but they all flatten out toward room temperature, which is exactly what the slope field shows.`,
        visual: { widget: 'slopefield', caption: tx`Click anywhere to launch a solution from that point. Notice that curves never cross, and that they gather around stable equilibria (the cooling and logistic examples). The last equation has no formula solution, yet the field still shows exactly how solutions behave.` },
        math: tx`**Ordinary differential equation (ODE):** an equation involving $y(t)$ and its derivatives. Its **order** is the highest derivative that appears.

**Initial value problem.** $y' = f(t, y)$ with $y(t_0) = y_0$. If $f$ and $\partial f/\partial y$ are continuous, there is exactly one solution near $t_0$ (existence and uniqueness). That's why solution curves never cross.

**Slope field.** At each point draw a short segment of slope $f(t, y)$. Solutions are the curves tangent to the segments everywhere.

**Equilibrium solutions** are constant solutions. For an autonomous equation $y' = f(y)$ they are the roots of $f$. An equilibrium is **stable** if nearby solutions move toward it: $f$ goes from positive to negative as $y$ increases through it.

**Checking a solution:** substitute it in. $y = Ce^{kt}$ solves $y' = ky$ because $\frac{d}{dt}Ce^{kt} = kCe^{kt}$.`,
        example: {
          problem: tx`Show that $y = 3 + Ce^{-2t}$ solves $y' = 6 - 2y$, and find the solution with $y(0) = 10$.`,
          steps: [
            tx`Differentiate: $y' = -2Ce^{-2t}$.`,
            tx`Right side: $6 - 2y = 6 - 2(3 + Ce^{-2t}) = -2Ce^{-2t}$. The two sides match, so every $C$ gives a solution.`,
            tx`$y(0) = 3 + C = 10$ gives $C = 7$, so $y = 3 + 7e^{-2t}$.`,
            tx`As $t\to\infty$, $y\to3$. The constant solution $y = 3$ (where $6 - 2y = 0$) is a stable equilibrium.`,
          ],
        },
        pitfalls: [
          tx`A differential equation has a whole family of solutions. You need an initial condition to pick one.`,
          tx`Where $f$ is smooth, solution curves of $y' = f(t, y)$ can't cross. A sketch with crossings has gone wrong.`,
          tx`$y' = ky$ describes the rate. Don't confuse the equation with its solution $y = Ce^{kt}$.`,
        ],
        usedIn: tx`Every dynamic model in applied math is a differential equation: populations, circuits, chemical kinetics, epidemics (Module 15), orbits. Numerical solvers (Module 11) follow the slope field step by step.`,
        practice: [
          { level: 1, gen(R) {
            const kind = R.pick(['lin', 'cool', 'prod']), t = R.int(-3, 3), y = R.int(-3, 4);
            const [tex, f] = kind === 'lin' ? (() => { const a = R.nz(-3, 3), b = R.nz(-3, 3); return [tx`${AM.co(a, 't')} ${sgn(b)}y`, (t1, y1) => a * t1 + b * y1]; })()
              : kind === 'cool' ? (() => { const k = R.int(1, 3), c = R.int(-2, 5); return [tx`-${k === 1 ? '' : k}(y ${sgn(-c)})`, (t1, y1) => -k * (y1 - c)]; })()
                : (() => { const a = R.nz(-2, 2); return [tx`${a === 1 ? '' : a === -1 ? '-' : a}ty + 1`, (t1, y1) => a * t1 * y1 + 1]; })();
            const m = f(t, y);
            return {
              q: tx`For $y' = ${tex}$, what is the slope of the solution curve passing through $(t, y) = (${t}, ${y})$?`,
              ans: { type: 'num', answer: m },
              hint: tx`The equation *is* the slope: substitute $t = ${t}$ and $y = ${y}$ into the right-hand side.`,
              sol: [tx`Substitute: $y' = ${m}$. That is the slope of the small segment drawn at $(${t}, ${y})$ in the slope field.`],
            };
          } },
          { level: 2, gen(R) {
            const k = R.nz(-2, 2); let r1, r2; do { r1 = R.int(-4, 5); r2 = R.int(-4, 5); } while (r1 === r2);
            return {
              q: tx`Find all equilibrium solutions of $y' = ${k === 1 ? '' : k === -1 ? '-' : k}(y ${sgn(-r1)})(y ${sgn(-r2)})$.`.replace('(y + 0)', 'y').replace('(y - 0)', 'y'),
              ans: { type: 'vec', answer: [r1, r2], unordered: true, placeholder: 'e.g. -2, 3' },
              hint: tx`Equilibria are the constant solutions: values of $y$ that make $y' = 0$.`,
              sol: [tx`Set $y' = 0$: $(y ${sgn(-r1)})(y ${sgn(-r2)}) = 0$, so $y = ${r1}$ or $y = ${r2}$.`, tx`Stability: the sign of $y'$ just above and below each root tells you. Here $y = ${k * (Math.max(r1, r2) - Math.min(r1, r2)) > 0 ? Math.min(r1, r2) : Math.max(r1, r2)}$ is stable and the other is unstable.`],
              verify() { const lo = Math.min(r1, r2), hi = Math.max(r1, r2), f = (y) => k * (y - r1) * (y - r2), st = f(lo - 0.1) > 0 && f(lo + 0.1) < 0 ? lo : hi; const claimed = k * (hi - lo) > 0 ? lo : hi; return st === claimed ? true : 'stability claim wrong'; },
            };
          } },
          { level: 3, gen(R) {
            const Tr = R.int(15, 25), T0 = R.int(70, 95), t1 = R.int(3, 10), T1 = R.int(Math.round(Tr + (T0 - Tr) * 0.45), T0 - 5), target = R.int(Tr + 3, Math.min(T1 - 3, Tr + 30));
            const k = Math.log((T0 - Tr) / (T1 - Tr)) / t1, tt = Math.log((T0 - Tr) / (target - Tr)) / k;
            return {
              q: tx`Coffee at ${T0}°C is left in a ${Tr}°C room. After ${t1} minutes it is ${T1}°C. Using Newton's law of cooling, how many minutes (from the start) until it reaches ${target}°C? Two decimals.`,
              ans: { type: 'num', answer: tt, tol: 0.02, unit: 'minutes' },
              hint: tx`The solution of $T' = -k(T - ${Tr})$ is $T = ${Tr} + ${T0 - Tr}e^{-kt}$. Use the ${t1}-minute reading to find $k$ first.`,
              sol: [tx`$T(t) = ${Tr} + ${T0 - Tr}e^{-kt}$.`, tx`$${T1} = ${Tr} + ${T0 - Tr}e^{-${t1}k}$ gives $k = \frac{1}{${t1}}\ln\frac{${T0 - Tr}}{${T1 - Tr}} \approx ${fmt(k, 5)}$ per minute.`, tx`Solve $${target} = ${Tr} + ${T0 - Tr}e^{-kt}$: $t = \frac{1}{k}\ln\frac{${T0 - Tr}}{${target - Tr}} \approx ${fmt(tt, 3)}$ minutes.`],
            };
          } },
        ],
      },
      {
        id: 'first', title: 'First-order models', minutes: 35,
        summary: 'Separable and linear equations, and the growth and mixing models built from them.',
        idea: tx`Two families of first-order equations can be solved exactly, and between them they cover most basic models.

A **separable** equation can be rearranged with all the $y$'s on one side and all the $t$'s on the other: $\frac{dy}{dt} = g(t)h(y)$ becomes $\int \frac{dy}{h(y)} = \int g(t)\,dt$. Exponential growth and the **logistic** model of limited growth are both separable.

A **linear** equation $y' + p(t)y = q(t)$ is solved with an **integrating factor** $e^{\int p\,dt}$, which turns the left side into the derivative of a product. Mixing tanks, charging capacitors and loans with regular payments all lead here.`,
        everyday: tx`A rumour spreads through a school of 1000 students. At first everyone who knows tells others, so it grows exponentially. Once most people have heard it, there are few left to tell, and the spread slows. The logistic equation $P' = rP(1 - P/K)$ captures both phases, growing exponentially at first and levelling off at the carrying capacity $K$. The spread is fastest when half the school knows.`,
        visual: { widget: 'logistic', caption: tx`Compare the logistic curve with pure exponential growth (dashed). Change $K$ and the S-curve levels off at the new ceiling. The pink point marks the steepest moment, always at $P = K/2$. Start above $K$ and the population shrinks toward it instead.` },
        math: tx`**Separable.** $\dfrac{dy}{dt} = g(t)\,h(y) \implies \displaystyle\int\frac{dy}{h(y)} = \int g(t)\,dt + C$.

**Exponential model.** $y' = ky \implies y = y_0e^{kt}$.

**Logistic model.** $P' = rP\left(1 - \dfrac PK\right)$, with solution
$$P(t) = \frac{K}{1 + Ae^{-rt}}, \qquad A = \frac{K - P_0}{P_0}.$$
Growth is fastest at $P = K/2$.

**Linear first-order.** $y' + p(t)\,y = q(t)$. Multiply by the integrating factor $\mu(t) = e^{\int p(t)\,dt}$:
$$(\mu y)' = \mu q \implies y = \frac{1}{\mu}\left(\int\mu q\,dt + C\right).$$

**Constant coefficients.** $y' + ay = b$ has solution $y = \frac ba + Ce^{-at}$, which tends to the equilibrium $b/a$ when $a > 0$.`,
        example: {
          problem: tx`A 100 L tank of pure water receives brine containing 2 g/L of salt at 5 L/min, and the well-mixed solution drains at 5 L/min. How much salt is in the tank after 10 minutes?`,
          steps: [
            tx`Let $S(t)$ be the grams of salt. Rate in $= 2 \times 5 = 10$ g/min. Rate out $= \frac{S}{100}\times 5 = \frac{S}{20}$ g/min.`,
            tx`$S' = 10 - \frac{S}{20}$, i.e. $S' + \frac{1}{20}S = 10$, with $S(0) = 0$.`,
            tx`Constant coefficients: $S = 200 + Ce^{-t/20}$, and $S(0) = 0$ gives $C = -200$.`,
            tx`$S(10) = 200(1 - e^{-0.5}) \approx 78.7$ g. In the long run $S\to200$ g, matching the incoming concentration of 2 g/L.`,
          ],
        },
        pitfalls: [
          tx`When separating, you divide by $h(y)$, which assumes $h(y) \ne 0$. The roots of $h$ are equilibrium solutions you may have dropped.`,
          tx`Add the constant $C$ immediately after integrating, then solve for $y$. Tacking it on at the end gives wrong answers.`,
          tx`The integrating factor uses the coefficient of $y$ *after* writing the equation as $y' + p(t)y = q(t)$ (leading coefficient 1).`,
        ],
        usedIn: tx`Population ecology, drug concentrations in pharmacology, RC circuits and loan amortization. The SIR epidemic model (Module 15) is a coupled version of the logistic idea.`,
        practice: [
          { level: 1, gen(R) {
            const y0 = R.int(2, 50), k = R.pick([0.05, 0.1, 0.2, 0.3, -0.1, -0.25, 0.5]), t = R.int(2, 12), v = y0 * Math.exp(k * t);
            return {
              q: tx`Solve $y' = ${k}y$ with $y(0) = ${y0}$, and give $y(${t})$ to 2 decimals.`,
              ans: { type: 'num', answer: v, tol: 0.01 },
              hint: tx`The solution of $y' = ky$ is $y = y_0e^{kt}$.`,
              sol: [tx`$y(t) = ${y0}e^{${k}t}$.`, tx`$y(${t}) = ${y0}e^{${fmt(k * t, 4)}} \approx ${fmt(v, 3)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const K = R.int(5, 20) * 100, P0 = R.int(1, 10) * 10, r = R.pick([0.2, 0.3, 0.4, 0.5, 0.8]), t = R.int(3, 15), A = (K - P0) / P0, v = K / (1 + A * Math.exp(-r * t));
            return {
              q: tx`A population follows $P' = ${r}P\left(1 - \frac{P}{${K}}\right)$ with $P(0) = ${P0}$. Find $P(${t})$ to 1 decimal.`,
              ans: { type: 'num', answer: v, tol: 0.06 },
              hint: tx`$P(t) = \dfrac{K}{1 + Ae^{-rt}}$ with $A = \dfrac{K - P_0}{P_0}$.`,
              sol: [tx`$A = \frac{${K} - ${P0}}{${P0}} = ${fmt(A, 4)}$.`, tx`$P(${t}) = \dfrac{${K}}{1 + ${fmt(A, 4)}e^{-${fmt(r * t, 3)}}} \approx ${fmt(v, 2)}$.`],
              verify: C.near(M.solve((tt, y) => [r * y[0] * (1 - y[0] / K)], [P0], 0, t, 4000).pop()[1][0], v, 1e-6),
            };
          } },
          { level: 3, gen(R) {
            const V = R.int(5, 20) * 20, cin = R.int(1, 5), q = R.int(2, 10), t = R.int(5, 40), S0 = R.pick([0, 0, R.int(1, 5) * 50]);
            const eq = cin * V, k = q / V, S = eq + (S0 - eq) * Math.exp(-k * t);
            return {
              q: tx`A ${V} L tank holds water with ${S0} g of dissolved salt. Brine with ${cin} g/L flows in at ${q} L/min and the well-mixed solution flows out at the same rate. How many grams of salt are in the tank after ${t} minutes? One decimal.`,
              ans: { type: 'num', answer: S, tol: 0.06, unit: 'g' },
              hint: tx`$S' = (\text{rate in}) - (\text{rate out}) = ${cin * q} - \frac{${q}}{${V}}S$. This has constant coefficients.`,
              sol: [tx`$S' + \frac{${q}}{${V}}S = ${cin * q}$, so the equilibrium is $S = ${cin * q}\cdot\frac{${V}}{${q}} = ${eq}$ g.`, tx`$S(t) = ${eq} + (${S0} - ${eq})e^{-${fmt(k, 5)}t}$.`, tx`$S(${t}) \approx ${fmt(S, 2)}$ g.`],
              verify: C.near(M.solve((tt, y) => [cin * q - k * y[0]], [S0], 0, t, 3000).pop()[1][0], S, 1e-6),
            };
          } },
        ],
      },
      {
        id: 'oscillations', title: 'Second-order equations and oscillations', minutes: 40,
        summary: 'Springs, circuits and the characteristic equation.',
        idea: tx`Newton's law $F = ma$ involves acceleration, a second derivative, so mechanical systems give **second-order** equations. The most important one is the damped spring $mx'' + cx' + kx = 0$: the spring pulls back with force $-kx$ and friction resists motion with $-cx'$.

For equations with constant coefficients, guess $x = e^{rt}$. Substituting turns the differential equation into an ordinary quadratic, the **characteristic equation** $mr^2 + cr + k = 0$. Its roots decide everything. Two real roots: the system creeps back without oscillating. Complex roots $\alpha \pm i\beta$: it oscillates at angular frequency $\beta$ inside an envelope $e^{\alpha t}$ that grows or decays.`,
        everyday: tx`A car's suspension is a spring plus a shock absorber (the damper). With no damping, one bump would set the car bouncing forever; with too much, the ride is stiff and slow to recover. Engineers aim near **critical damping**: the fastest return to level without bouncing.

Push a child on a swing in time with its natural rhythm and small pushes build a big swing. That's **resonance**: forcing at the natural frequency.`,
        visual: { widget: 'spring', caption: tx`Start with low damping and watch the decaying oscillation. Raise the damping until the bounce disappears (critical damping is at $c = 2\sqrt k$). Then set damping near 0.2, add forcing, and slide $\omega$ toward $\omega_0$ to see resonance build up.` },
        math: tx`**Linear, constant coefficients.** $ay'' + by' + cy = 0$. Trying $y = e^{rt}$ gives $ar^2 + br + c = 0$.
- Two real roots $r_1 \ne r_2$: $\ y = C_1e^{r_1t} + C_2e^{r_2t}$ (overdamped).
- A repeated root $r$: $\ y = (C_1 + C_2t)e^{rt}$ (critically damped).
- Complex roots $\alpha\pm i\beta$: $\ y = e^{\alpha t}(C_1\cos\beta t + C_2\sin\beta t)$ (underdamped when $\alpha < 0$).

**Spring–mass.** $mx'' + cx' + kx = 0$ has natural frequency $\omega_0 = \sqrt{k/m}$ and damping ratio $\zeta = \dfrac{c}{2\sqrt{mk}}$: underdamped if $\zeta < 1$, critical if $\zeta = 1$, overdamped if $\zeta > 1$.

**Forcing.** $mx'' + cx' + kx = F_0\cos\omega t$ settles into an oscillation of amplitude
$$\frac{F_0}{\sqrt{(k - m\omega^2)^2 + (c\omega)^2}},$$
which peaks near $\omega = \omega_0$ when the damping is small. That peak is resonance.`,
        example: {
          problem: tx`Solve $y'' + 2y' + 5y = 0$ with $y(0) = 1$, $y'(0) = 0$.`,
          steps: [
            tx`Characteristic equation $r^2 + 2r + 5 = 0$, so $r = \frac{-2\pm\sqrt{4 - 20}}{2} = -1 \pm 2i$.`,
            tx`Complex roots with $\alpha = -1$ and $\beta = 2$: $y = e^{-t}(C_1\cos 2t + C_2\sin 2t)$.`,
            tx`$y(0) = C_1 = 1$. Differentiating, $y'(0) = -C_1 + 2C_2 = 0$, so $C_2 = \frac12$.`,
            tx`$y = e^{-t}\left(\cos 2t + \tfrac12\sin 2t\right)$: oscillation at angular frequency 2 inside a decaying $e^{-t}$ envelope.`,
          ],
        },
        pitfalls: [
          tx`A second-order equation needs two initial conditions, position and velocity.`,
          tx`With a repeated root, $C_1e^{rt} + C_2e^{rt}$ is really just one constant. You need the extra factor of $t$.`,
          tx`$\beta$ is an angular frequency, so the period of oscillation is $2\pi/\beta$, not $\beta$.`,
        ],
        usedIn: tx`RLC circuits obey the same equation with $L, R, 1/C$ in place of $m, c, k$. Normal modes of vibrating structures, the time behaviour of the wave equation (Module 13), and control engineering all rely on the characteristic equation.`,
        practice: [
          { level: 1, gen(R) {
            let r1, r2; do { r1 = R.int(-6, 4); r2 = R.int(-6, 4); } while (r1 === r2);
            const b = -(r1 + r2), c = r1 * r2;
            return {
              q: tx`Find the roots of the characteristic equation of $y'' ${b ? `${sgn(b)}y'` : ''} ${c ? `${sgn(c)}y` : ''} = 0$.`,
              ans: { type: 'vec', answer: [r1, r2], unordered: true, placeholder: 'r₁, r₂' },
              hint: tx`Substitute $y = e^{rt}$ to get $r^2 ${b ? `${sgn(b)}r` : ''} ${c ? sgn(c) : ''} = 0$, then factor.`,
              sol: [tx`$${poly([1, b, c], 'r')} = (r ${sgn(-r1)})(r ${sgn(-r2)}) = 0$.`, tx`$r = ${r1}$ and $r = ${r2}$, so $y = C_1e^{${r1}t} + C_2e^{${r2}t}$.`],
            };
          } },
          { level: 2, gen(R) {
            const m = R.int(1, 4), k = R.int(1, 9) * m, kind = R.pick(['under', 'critical', 'over', 'none']);
            const crit = 2 * Math.sqrt(m * k);
            let c;
            if (kind === 'none') c = 0;
            else if (kind === 'critical') { const s = Math.round(Math.sqrt(m * k)); if (s * s !== m * k) return this.gen(R); c = 2 * s; }
            else if (kind === 'under') c = Math.max(1, Math.floor(crit * R.real(0.2, 0.8)));
            else c = Math.ceil(crit * R.real(1.2, 2.5));
            const choices = ['Undamped', 'Underdamped', 'Critically damped', 'Overdamped'], disc = c * c - 4 * m * k;
            const ans = c === 0 ? 0 : disc < 0 ? 1 : disc === 0 ? 2 : 3;
            return {
              q: tx`Classify the motion of $${m === 1 ? '' : m}x'' ${c ? `+ ${c}x'` : ''} + ${k}x = 0$.`,
              ans: { type: 'mc', choices, answer: ans },
              hint: tx`Compare $c^2$ with $4mk$: the discriminant of $mr^2 + cr + k = 0$.`,
              sol: [tx`$m = ${m}$, $c = ${c}$, $k = ${k}$. Discriminant $c^2 - 4mk = ${c * c} - ${4 * m * k} = ${disc}$.`, tx`${c === 0 ? 'No damping term: pure oscillation, **undamped**.' : disc < 0 ? 'Negative: complex roots, so it oscillates with decaying amplitude: **underdamped**.' : disc === 0 ? 'Zero: a repeated root, **critically damped**.' : 'Positive: two negative real roots, no oscillation: **overdamped**.'}`],
            };
          } },
          { level: 3, gen(R) {
            if (R.chance(0.5)) {
              let r1, r2; do { r1 = R.int(-5, -1); r2 = R.int(-5, -1); } while (r1 === r2);
              const y0 = R.int(1, 4), v0 = R.int(-4, 4), C1 = (v0 - r2 * y0) / (r1 - r2), C2 = y0 - C1, t = R.pick([0.5, 1, 2]), v = C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t);
              return {
                q: tx`Solve $y'' ${sgn(-(r1 + r2))}y' ${sgn(r1 * r2)}y = 0$ with $y(0) = ${y0}$, $y'(0) = ${v0}$, and give $y(${t})$ to 4 decimals.`,
                ans: { type: 'num', answer: v, tol: 0.0006 },
                hint: tx`Roots $r_1, r_2$ give $y = C_1e^{r_1t} + C_2e^{r_2t}$. Then $y(0) = C_1 + C_2$ and $y'(0) = r_1C_1 + r_2C_2$.`,
                sol: [tx`Characteristic roots: $r = ${r1}, ${r2}$.`, tx`$C_1 + C_2 = ${y0}$ and $${r1}C_1 ${sgn(r2)}C_2 = ${v0}$, giving $C_1 = ${AM.frac(v0 - r2 * y0, r1 - r2)}$, $C_2 = ${AM.frac(y0 * (r1 - r2) - (v0 - r2 * y0), r1 - r2)}$.`, tx`$y(${t}) = C_1e^{${r1 * t}} + C_2e^{${r2 * t}} \approx ${fmt(v, 5)}$.`],
                verify: C.near(M.solve((tt, y) => [y[1], -(-(r1 + r2)) * y[1] - r1 * r2 * y[0]], [y0, v0], 0, t, 4000).pop()[1][0], v, 1e-6),
              };
            }
            const m = R.int(1, 3), c = R.int(1, 4), k = R.int(Math.ceil((c * c) / (4 * m)) + 1, 20), beta = Math.sqrt(4 * m * k - c * c) / (2 * m), T = (2 * Math.PI) / beta;
            return {
              q: tx`$${m === 1 ? '' : m}x'' + ${c}x' + ${k}x = 0$ is underdamped. What is the period of its oscillations (time between successive peaks)? Three decimals.`,
              ans: { type: 'num', answer: T, tol: 0.002 },
              hint: tx`Find the complex roots $\alpha \pm i\beta$ of $${m === 1 ? '' : m}r^2 + ${c}r + ${k} = 0$. The period is $2\pi/\beta$.`,
              sol: [tx`$r = \dfrac{-${c} \pm \sqrt{${c * c} - ${4 * m * k}}}{${2 * m}} = ${fmt(-c / (2 * m), 4)} \pm ${fmt(beta, 4)}i$.`, tx`Period $= \dfrac{2\pi}{\beta} = \dfrac{2\pi}{${fmt(beta, 4)}} \approx ${fmt(T, 4)}$. Damping slightly lengthens the period compared with the undamped $2\pi/\sqrt{k/m} = ${fmt(2 * Math.PI / Math.sqrt(k / m), 4)}$.`],
            };
          } },
        ],
      },
      {
        id: 'systems', title: 'Systems and phase portraits', minutes: 40,
        summary: 'Two quantities that change together, and the pictures that show their fate.',
        idea: tx`Many models track several quantities that affect each other: predators and prey, a pendulum's angle and speed, the currents in two connected loops. A **system** of ODEs gives each one's rate of change in terms of all of them: $\mathbf x' = \mathbf F(\mathbf x)$.

The **phase plane** plots one variable against the other, with time running along each curve. A family of these trajectories is a **phase portrait**, and it shows the fate of every starting state: spiralling into an equilibrium, cycling forever, or flying off. For a linear system $\mathbf x' = A\mathbf x$, the eigenvalues of $A$ tell you which picture you'll get without drawing anything.`,
        everyday: tx`Foxes eat rabbits. Lots of rabbits means foxes thrive and multiply; too many foxes and the rabbits crash; then the foxes starve, rabbits recover, and the cycle repeats. Plot rabbits against foxes and you get a closed loop traced over and over. That's the Lotka–Volterra predator–prey model, and the loop in the phase plane is the population cycle.`,
        visual: { widget: 'phase', caption: tx`Step through the linear systems and match each picture to its eigenvalues in the readout. Then drag the matrix sliders to turn a spiral into a centre (trace 0) or a saddle (negative determinant). Try predator–prey and the pendulum for nonlinear examples, and click to add trajectories.` },
        math: tx`**Linear systems.** $\mathbf x' = A\mathbf x$. If $A\mathbf v = \lambda\mathbf v$ then $\mathbf x = e^{\lambda t}\mathbf v$ is a solution, and in general $\mathbf x = c_1e^{\lambda_1t}\mathbf v_1 + c_2e^{\lambda_2t}\mathbf v_2$.

**Classification by eigenvalues** ($2\times2$):
- real, both negative: **stable node**; both positive: **unstable node**;
- real with opposite signs: **saddle** (unstable);
- complex $\alpha\pm i\beta$: **spiral**, stable if $\alpha < 0$, unstable if $\alpha > 0$; a **centre** (closed orbits) if $\alpha = 0$.

**Trace–determinant shortcut.** With $T = \operatorname{tr}A$ and $D = \det A$: $D < 0$ means a saddle; $D > 0$ with $T < 0$ is stable and with $T > 0$ unstable; it spirals when $T^2 < 4D$.

**Nonlinear systems.** Find the equilibria ($\mathbf F = \mathbf 0$), then **linearize**: near each one the system behaves like $\mathbf x' = J\mathbf x$, where $J$ is the Jacobian matrix of partial derivatives.`,
        example: {
          problem: tx`Classify the equilibrium of $x' = -x + 2y$, $y' = -2x - y$.`,
          steps: [
            tx`$A = \begin{pmatrix}-1 & 2\\ -2 & -1\end{pmatrix}$, with $T = -2$ and $D = 1 + 4 = 5$.`,
            tx`$\lambda^2 + 2\lambda + 5 = 0$ gives $\lambda = -1 \pm 2i$.`,
            tx`Complex eigenvalues with negative real part: a **stable spiral**. Every trajectory winds into the origin.`,
            tx`Direction of rotation: at $(1, 0)$, $\mathbf x' = (-1, -2)$ points downward, so the spiral turns clockwise.`,
          ],
        },
        pitfalls: [
          tx`An equilibrium is where *all* the rates vanish at once, not just one of them.`,
          tx`In a saddle almost every trajectory eventually leaves, even though some approach at first.`,
          tx`Linearization can mislead when the linear system is a centre: the nonlinear terms may turn it into a slow spiral either way.`,
        ],
        usedIn: tx`Epidemic models (Module 15), chemical reaction networks, neural dynamics, control systems, and the stability analysis of numerical methods for stiff equations (Module 11).`,
        practice: [
          { level: 1, gen(R) {
            let l, txt, ans;
            if (R.chance(0.5)) { const a = R.nz(-5, 5); let b; do { b = R.nz(-5, 5); } while (b === a); l = [a, b]; txt = tx`$\lambda = ${a}$ and $\lambda = ${b}$`; ans = a < 0 && b < 0 ? 0 : a > 0 && b > 0 ? 1 : 2; }
            else { const re = R.int(-3, 3), im = R.int(1, 4); txt = tx`$\lambda = ${re} \pm ${im === 1 ? '' : im}i$`; ans = re === 0 ? 5 : re < 0 ? 3 : 4; }
            return {
              q: tx`The matrix of a linear system $\mathbf x' = A\mathbf x$ has eigenvalues ${txt}. Classify the equilibrium at the origin.`,
              ans: { type: 'mc', choices: CLASSES, answer: ans },
              hint: tx`Real eigenvalues: look at their signs. Complex eigenvalues: look at the real part.`,
              sol: [ans === 2 ? tx`Real eigenvalues of opposite sign: a **saddle**.` : ans <= 1 ? tx`Real eigenvalues, both ${ans === 0 ? 'negative' : 'positive'}: an **${CLASSES[ans].toLowerCase()}**.` : tx`Complex eigenvalues with real part ${ans === 5 ? 'zero: a **centre**' : ans === 3 ? 'negative: a **stable spiral**' : 'positive: an **unstable spiral**'}.`],
            };
          } },
          { level: 2, gen(R) {
            let A, T, D; do { A = [[R.int(-4, 4), R.int(-4, 4)], [R.int(-4, 4), R.int(-4, 4)]]; T = A[0][0] + A[1][1]; D = A[0][0] * A[1][1] - A[0][1] * A[1][0]; } while (D === 0 || T * T === 4 * D);
            const ans = classify(T, D);
            return {
              q: tx`Classify the equilibrium of $\mathbf x' = ${pm(A)}\mathbf x$.`,
              ans: { type: 'mc', choices: CLASSES, answer: ans },
              hint: tx`Compute $T = \operatorname{tr}A$ and $D = \det A$. Then: $D<0$ saddle; otherwise the sign of $T$ gives stability and $T^2 - 4D$ decides node vs spiral.`,
              sol: [tx`$T = ${T}$, $D = ${D}$, $T^2 - 4D = ${T * T - 4 * D}$.`, D < 0 ? tx`$D < 0$: a **saddle**.` : tx`$D > 0$; ${T * T - 4 * D < 0 ? 'complex eigenvalues (spiral or centre)' : 'real eigenvalues (node)'}; ${T === 0 ? '$T = 0$: a **centre**' : T < 0 ? '$T < 0$: stable' : '$T > 0$: unstable'}. So it's a **${CLASSES[ans].toLowerCase()}**.`],
            };
          } },
          { level: 3, gen(R) {
            const a = R.int(1, 4), b = R.pick([0.5, 1, 2]), c = R.int(1, 4), d = R.pick([0.25, 0.5, 1]);
            return {
              q: tx`In the predator–prey model $x' = x(${a} - ${b}y)$, $y' = y(-${c} + ${d}x)$ ($x$ = prey, $y$ = predators), find the equilibrium where both populations are positive. Enter $x, y$.`,
              ans: { type: 'vec', answer: [c / d, a / b], placeholder: 'x, y' },
              hint: tx`Set both rates to zero. Since $x, y > 0$, the brackets must vanish.`,
              sol: [tx`$x' = 0$ with $x > 0$ needs $${a} - ${b}y = 0$, so $y = ${fmt(a / b)}$.`, tx`$y' = 0$ with $y > 0$ needs $-${c} + ${d}x = 0$, so $x = ${fmt(c / d)}$.`, tx`Equilibrium $(${fmt(c / d)}, ${fmt(a / b)})$. Its Jacobian has purely imaginary eigenvalues, which is why the populations cycle around it.`],
            };
          } },
        ],
      },
    ],
  });
})();
