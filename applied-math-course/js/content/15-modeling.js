/* Module 15 — Mathematical modeling and dynamical systems (Stage 4 capstone). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, C = AM.checks, M = AM.m;
  const pm = (r) => `\\begin{pmatrix} ${r.map((x) => x.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;

  AM.module({
    id: 'modeling', stage: 4, title: 'Modeling & Dynamical Systems', aka: 'Mathematical Modeling / Dynamical Systems',
    blurb: 'The capstone: turning real situations into mathematics and reading the mathematics back as predictions. Discrete maps and chaos, epidemic models, and Markov chains pull together differential equations, linear algebra and probability from the rest of the course.',
    prereq: ['ode', 'prob', 'linalg'],
    lessons: [
      {
        id: 'chaos', title: 'Discrete maps, bifurcations and chaos', minutes: 40,
        summary: 'Simple rules, repeated, can produce stability, cycles or unpredictable chaos.',
        idea: tx`Many systems update in steps: a population from one breeding season to the next, a bank balance month to month. A **discrete dynamical system** is a rule $x_{n+1} = f(x_n)$ applied over and over. The long-run behaviour can settle on a **fixed point**, cycle through a fixed set of values, or never settle at all.

The **logistic map** $x_{n+1} = rx_n(1 - x_n)$ is the famous example. For small growth rates $r$ the population settles down. Increase $r$ and it starts alternating between two values, then four, then eight (**period doubling**), and past $r \approx 3.57$ it becomes **chaotic**: completely deterministic, yet tiny differences in the starting value grow until prediction is impossible.`,
        everyday: tx`Insect populations with one generation per year follow rules like the logistic map: more insects now means more eggs, but also more competition for food. Ecologists have seen real populations settle down, oscillate in boom-and-bust cycles, and behave erratically, matching the different regimes of the map.

Chaos is also why weather can't be forecast precisely more than about two weeks ahead, even with perfect equations: unavoidable measurement errors grow exponentially.`,
        visual: { widget: 'cobweb', caption: tx`The cobweb (left) traces each iteration: up to the curve, across to the diagonal, repeat. Slowly raise $r$: the web spirals into a point, then into a box (a 2-cycle), then fills a region (chaos). Click the bifurcation diagram (right) to jump to any $r$; look for the period-3 window near 3.83.` },
        math: tx`**Fixed points** satisfy $x^* = f(x^*)$. A fixed point is **stable** if $|f'(x^*)| < 1$ and unstable if $|f'(x^*)| > 1$.

**Logistic map** $f(x) = rx(1 - x)$, $0 \le r \le 4$:
- fixed points $x^* = 0$ and $x^* = 1 - \frac1r$;
- $f'(1 - \frac1r) = 2 - r$, so the nonzero fixed point is stable for $1 < r < 3$;
- at $r = 3$ it loses stability and a stable **2-cycle** is born (a period-doubling bifurcation);
- the doublings accumulate at $r_\infty \approx 3.5699$, beyond which chaos appears, with windows of periodic behaviour.

**Periodic points.** A $k$-cycle is a fixed point of $f^k$ (apply $f$ $k$ times). It's stable if the product of $f'$ around the cycle has absolute value below 1.

**Lyapunov exponent** $\lambda = \lim\frac1n\sum\ln|f'(x_i)|$: positive means nearby orbits separate like $e^{\lambda n}$, the signature of chaos.

**Feigenbaum's constant.** The gaps between successive doublings shrink by a factor approaching $\delta \approx 4.669$, the same for a whole family of maps.`,
        example: {
          problem: tx`For the logistic map with $r = 2.5$, find the fixed points and decide whether each is stable.`,
          steps: [
            tx`Solve $x = 2.5x(1 - x)$: either $x = 0$ or $1 = 2.5(1 - x)$, giving $x = 0.6$.`,
            tx`$f'(x) = 2.5(1 - 2x)$. At $x = 0$: $f'(0) = 2.5 > 1$, unstable.`,
            tx`At $x = 0.6$: $f'(0.6) = 2.5(-0.2) = -0.5$, and $|-0.5| < 1$, so stable.`,
            tx`The negative derivative means iterates approach $0.6$ while alternating sides, which shows up as a spiral in the cobweb.`,
          ],
        },
        pitfalls: [
          tx`Stability depends on $|f'(x^*)|$, not on the sign of $f'$. A negative derivative means oscillating approach.`,
          tx`Chaos isn't randomness. The rule is exact; the unpredictability comes from sensitivity to the initial condition.`,
          tx`Simulations show the attractor only after transients die out; discard the first few hundred iterates.`,
        ],
        usedIn: tx`Population ecology, iterative numerical methods (Newton's method is a discrete map; its convergence is a fixed-point stability question), economics models, and random-number generation.`,
        practice: [
          { level: 1, gen(R) {
            const r = R.pick([1.5, 2, 2.5, 2.8, 3.2, 3.5, 1.25, 2.4]);
            return {
              q: tx`Find the nonzero fixed point of the logistic map $x_{n+1} = ${r}\,x_n(1 - x_n)$.`,
              ans: { type: 'num', answer: 1 - 1 / r, abs: 1e-9, rel: 0.002 },
              hint: tx`Solve $x = ${r}x(1 - x)$ and divide by $x \ne 0$.`,
              sol: [tx`$1 = ${r}(1 - x)$, so $x^* = 1 - \frac{1}{${r}} = ${fmt(1 - 1 / r, 5)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['log', 'lin', 'cos']);
            if (kind === 'log') {
              const r = R.pick([1.5, 2, 2.5, 2.8, 2.9, 3.2, 3.5, 3.8]), d = 2 - r;
              return { q: tx`For $x_{n+1} = ${r}x_n(1 - x_n)$, is the nonzero fixed point $x^* = 1 - 1/r$ stable?`, ans: { type: 'mc', choices: ['Stable', 'Unstable'], answer: Math.abs(d) < 1 ? 0 : 1 }, hint: tx`Compute $f'(x^*) = r(1 - 2x^*)$, which simplifies to $2 - r$.`, sol: [tx`$f'(x^*) = 2 - ${r} = ${fmt(d)}$.`, tx`$|f'(x^*)| = ${fmt(Math.abs(d))} ${Math.abs(d) < 1 ? '< 1$: **stable**.' : '> 1$: **unstable**.'}`] };
            }
            if (kind === 'lin') {
              const a = R.pick([0.5, -0.5, 1.5, -1.2, 0.9, -0.8, 2]), b = R.int(-5, 5), xs = b / (1 - a);
              return { q: tx`For $x_{n+1} = ${a}x_n ${AM.sgn(b)}$, find the fixed point and decide if it's stable. Enter the fixed point.`, ans: { type: 'num', answer: xs, abs: 1e-9, rel: 0.002 }, hint: tx`Solve $x = ${a}x ${AM.sgn(b)}$. Stability needs $|${a}| < 1$.`, sol: [tx`$x(1 - ${a}) = ${b}$, so $x^* = ${fmt(xs, 5)}$.`, tx`$f' = ${a}$: ${Math.abs(a) < 1 ? 'stable' : 'unstable'}${a < 0 ? ', with iterates alternating sides' : ''}.`] };
            }
            let x = 0.5; for (let i = 0; i < 200; i++) x = Math.cos(x);
            return { q: tx`Iterating $x_{n+1} = \cos x_n$ from any start converges to the fixed point of $\cos$ (the "Dottie number"). Find it to 4 decimals.`, ans: { type: 'num', answer: x, tol: 0.0002 }, hint: tx`Iterate on a calculator in radians, or solve $\cos x = x$ with Newton's method.`, sol: [tx`$x^* \approx ${fmt(x, 6)}$. It is stable because $|f'(x^*)| = |\sin x^*| \approx ${fmt(Math.sin(x), 3)} < 1$.`] };
          } },
          { level: 3, gen(R) {
            const r = R.pick([3.2, 3.3, 3.4, 3.1, 3.45]), disc = (r + 1) * (r - 3), p = ((r + 1) + Math.sqrt(disc)) / (2 * r), q = ((r + 1) - Math.sqrt(disc)) / (2 * r);
            return {
              q: tx`For $r = ${r}$ the logistic map has a stable 2-cycle $\{p, q\}$ with $f(p) = q$ and $f(q) = p$. Find both values (4 decimals).`,
              ans: { type: 'vec', answer: [p, q], unordered: true, tol: 0.0003, placeholder: 'p, q' },
              hint: tx`Solve $f(f(x)) = x$. Factor out the fixed points; what's left is $r^2x^2 - r(r+1)x + (r+1) = 0$.`,
              sol: [tx`$f(f(x)) - x$ contains the factor $x(rx - r + 1)$ (the fixed points). The remaining quadratic is $r^2x^2 - r(r+1)x + (r + 1) = 0$.`, tx`$x = \dfrac{(r+1) \pm\sqrt{(r+1)(r-3)}}{2r} = \dfrac{${fmt(r + 1)} \pm \sqrt{${fmt(disc, 4)}}}{${fmt(2 * r)}}$.`, tx`$p \approx ${fmt(p, 5)}$, $q \approx ${fmt(q, 5)}$. Real only for $r > 3$: the cycle is born at the first bifurcation.`],
              verify() { const f = (x) => r * x * (1 - x); return Math.abs(f(p) - q) + Math.abs(f(q) - p) < 1e-9 ? true : '2-cycle wrong'; },
            };
          } },
        ],
      },
      {
        id: 'sir', title: 'Epidemic models', minutes: 40,
        summary: 'The SIR model, the reproduction number, and herd immunity.',
        idea: tx`The **SIR model** splits a population into Susceptible, Infected and Recovered fractions. Infections happen when susceptible and infected people meet, at a rate proportional to $SI$; infected people recover at a constant rate. Three coupled ODEs follow, and although they have no simple formula solution, a lot can be read off directly.

The key number is $R_0 = \beta/\gamma$, the average number of people one infected person infects in a fully susceptible population. If $R_0 < 1$ the disease dies out; if $R_0 > 1$ it spreads, peaking exactly when the susceptible fraction falls to $1/R_0$. Vaccinating more than $1 - 1/R_0$ of the population pushes the effective reproduction number below 1. That's **herd immunity**.`,
        everyday: tx`During COVID-19, "flatten the curve" meant lowering $\beta$ (distancing, masks) so that the infection peak was lower and later, keeping hospitals under capacity. Measles has $R_0$ around 12–18, so herd immunity needs about 92–95% of people immune. That's why even small drops in vaccination rates lead to outbreaks.`,
        visual: { widget: 'sir', caption: tx`Lower $\beta$ (fewer contacts) and the red infection curve flattens and shifts later. Raise vaccination toward $1 - 1/R_0$ and the outbreak disappears altogether. Notice the infection peak always happens when the blue susceptible curve crosses the grey line at $1/R_0$.` },
        math: tx`**SIR equations** (fractions of the population):
$$S' = -\beta SI, \qquad I' = \beta SI - \gamma I, \qquad R' = \gamma I, \qquad S + I + R = 1.$$
$\beta$ is the transmission rate, $\gamma$ the recovery rate, and $1/\gamma$ the average infectious period.

**Basic reproduction number.** $R_0 = \beta/\gamma$. Since $I' = \gamma I(R_0S - 1)$, infections grow exactly when $R_0S > 1$.

**Peak.** $I$ is largest when $S = 1/R_0$.

**Herd immunity threshold.** Immunize a fraction $p_c = 1 - \frac{1}{R_0}$.

**Final size.** The fraction never infected, $S_\infty$, satisfies $\ln S_\infty = R_0(S_\infty - 1)$ (starting from nearly everyone susceptible). It must be solved numerically.

**Early growth.** While $S \approx 1$, $I$ grows like $e^{(\beta - \gamma)t}$, with doubling time $\frac{\ln 2}{\beta - \gamma}$.

**Extensions.** SEIR adds an exposed stage; SIRS lets immunity wane; network models replace random mixing with who actually meets whom.`,
        example: {
          problem: tx`A disease has $\beta = 0.4$ per day and an infectious period of 5 days. Find $R_0$, the herd immunity threshold, and the early doubling time.`,
          steps: [
            tx`$\gamma = 1/5 = 0.2$ per day, so $R_0 = 0.4/0.2 = 2$.`,
            tx`Herd immunity needs $1 - \frac12 = 50\%$ immune.`,
            tx`Early growth rate $\beta - \gamma = 0.2$ per day, so cases double every $\frac{\ln 2}{0.2} \approx 3.5$ days.`,
            tx`Without intervention the epidemic peaks when $S = 1/2$, and solving $\ln S_\infty = 2(S_\infty - 1)$ gives $S_\infty \approx 0.20$: about 80% are eventually infected, well past the 50% threshold, because of overshoot.`,
          ],
        },
        pitfalls: [
          tx`$R_0$ is a property of the disease *and* the population's behaviour. It isn't a fixed biological constant.`,
          tx`Herd immunity doesn't mean infections stop instantly; it means each new case causes fewer than one more on average.`,
          tx`More people get infected in total than the herd-immunity fraction, because infections keep happening after the peak.`,
        ],
        usedIn: tx`Public health planning, computer-virus spread, information diffusion on social networks, and as a template for coupled nonlinear ODE models in ecology and chemistry.`,
        practice: [
          { level: 1, gen(R) {
            const b = R.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.9, 1.2]), D = R.int(3, 14), R0 = b * D;
            return {
              q: tx`An infection has transmission rate $\beta = ${b}$ per day and an average infectious period of ${D} days. What is $R_0$?`,
              ans: { type: 'num', answer: R0 },
              hint: tx`$\gamma = 1/(\text{infectious period})$ and $R_0 = \beta/\gamma$.`,
              sol: [tx`$\gamma = \frac{1}{${D}}$, so $R_0 = ${b}\times${D} = ${fmt(R0)}$. ${R0 > 1 ? 'Above 1: an outbreak can take off.' : 'Below 1: it fizzles out.'}`],
            };
          } },
          { level: 2, gen(R) {
            const R0 = R.pick([1.5, 2, 2.5, 3, 4, 5, 6, 12, 15]), kind = R.pick(['herd', 'peak']), v = kind === 'herd' ? 1 - 1 / R0 : 1 / R0;
            return {
              q: kind === 'herd' ? tx`A disease has $R_0 = ${R0}$. What fraction of the population must be immune for herd immunity? Give a decimal.` : tx`In an SIR epidemic with $R_0 = ${R0}$, what fraction of the population is still susceptible at the moment infections peak?`,
              ans: { type: 'num', answer: v, abs: 1e-6, rel: 0.003 },
              hint: kind === 'herd' ? tx`Need the effective number $R_0(1 - p)$ to drop below 1.` : tx`$I' = \gamma I(R_0S - 1)$ is zero when $S = 1/R_0$.`,
              sol: kind === 'herd' ? [tx`$R_0(1 - p) < 1 \iff p > 1 - \frac{1}{${R0}} = ${fmt(v, 4)}$, i.e. ${fmt(v * 100, 2)}%.`] : [tx`The peak is where $I' = 0$, which needs $S = \frac{1}{R_0} = ${fmt(v, 4)}$.`],
            };
          } },
          { level: 3, gen(R) {
            const R0 = R.pick([1.5, 1.8, 2, 2.5, 3, 4, 5]);
            let lo = 1e-12, hi = 1 - 1e-3; const g = (x) => Math.log(x) - R0 * (x - 1); // g(lo) < 0 < g(hi): bracket excludes the trivial root s = 1
            for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (g(m) < 0) lo = m; else hi = m; }
            const s = (lo + hi) / 2;
            return {
              q: tx`For $R_0 = ${R0}$, the fraction who escape infection solves $\ln S_\infty = ${R0}(S_\infty - 1)$ with $0 < S_\infty < 1$. Find the fraction eventually infected, $1 - S_\infty$, to 3 decimals.`,
              ans: { type: 'num', answer: 1 - s, tol: 0.0015 },
              hint: tx`Use Newton's method on $g(s) = \ln s - ${R0}(s - 1)$, starting near $s = 0.3$. Avoid the trivial root $s = 1$.`,
              sol: [tx`$g'(s) = \frac1s - ${R0}$. Newton iterates converge to $S_\infty \approx ${fmt(s, 5)}$.`, tx`So about $${fmt((1 - s) * 100, 2)}\%$ are eventually infected, more than the herd-immunity threshold of $${fmt((1 - 1 / R0) * 100, 1)}\%$ because the epidemic overshoots.`],
              verify() { const sol = M.solve((t, y) => [-R0 * 0.1 * y[0] * y[1], R0 * 0.1 * y[0] * y[1] - 0.1 * y[1]], [1 - 1e-6, 1e-6], 0, 3000, 30000).pop()[1]; return Math.abs(sol[0] - s) < 2e-3 ? true : `final size mismatch ${sol[0]} vs ${s}`; },
            };
          } },
        ],
      },
      {
        id: 'markov', title: 'Markov chains', minutes: 40,
        summary: 'Random processes with no memory, and where they settle in the long run.',
        idea: tx`A **Markov chain** moves randomly between states, and the probability of the next state depends only on the current one, not on the history. Collect those probabilities in a **transition matrix** $P$, where row $i$ lists the chances of going from state $i$ to each state. If $\mathbf p$ is today's probability distribution over states, tomorrow's is $\mathbf pP$, and in $n$ steps it's $\mathbf pP^n$.

For well-behaved chains, $\mathbf pP^n$ converges to the same **stationary distribution** $\boldsymbol\pi$ no matter where you start, where $\boldsymbol\pi P = \boldsymbol\pi$. It's a left eigenvector with eigenvalue 1, so the long-run behaviour is linear algebra, and it also tells you the fraction of time the chain spends in each state.`,
        everyday: tx`Google's original PageRank modelled a web surfer clicking random links: each page is a state, and the stationary distribution, the long-run fraction of time spent on each page, is its importance ranking.

Simpler examples are everywhere: weather tomorrow given weather today, a customer switching between brands each month, a board game where your next square depends only on your current square and the dice.`,
        visual: { widget: 'markov', caption: tx`Pick today's weather and step forward. The right panel shows the forecast probabilities converging to the same dotted lines whichever starting state you choose: that's the stationary distribution. Change the transition probabilities to see where it settles instead.` },
        math: tx`**Transition matrix.** $P_{ij} = P(X_{n+1} = j \mid X_n = i)$; each row sums to 1.

**Evolution.** If $\mathbf p_n$ is the row vector of probabilities at step $n$: $\mathbf p_{n+1} = \mathbf p_nP$, so $\mathbf p_n = \mathbf p_0P^n$. The entry $(P^n)_{ij}$ is the probability of going from $i$ to $j$ in exactly $n$ steps.

**Stationary distribution.** $\boldsymbol\pi P = \boldsymbol\pi$ with $\sum\pi_i = 1$, a left eigenvector of $P$ with eigenvalue 1.

**Convergence theorem.** If the chain is **irreducible** (every state can reach every other) and **aperiodic**, then $\mathbf p_0P^n\to\boldsymbol\pi$ from any start, and the fraction of time spent in state $i$ tends to $\pi_i$. The speed is set by the second-largest eigenvalue modulus.

**Two states.** For $P = \begin{pmatrix}1-a & a\\ b & 1-b\end{pmatrix}$: $\ \boldsymbol\pi = \left(\frac{b}{a+b}, \frac{a}{a+b}\right)$.

**Absorbing chains.** If some states can't be left, the chain eventually gets stuck; absorption probabilities and expected times come from solving linear systems.`,
        example: {
          problem: tx`A customer buys brand A or B each month. A buyers stay with A with probability 0.9; B buyers switch to A with probability 0.3. Find the long-run market shares.`,
          steps: [
            tx`$P = \begin{pmatrix} 0.9 & 0.1\\ 0.3 & 0.7\end{pmatrix}$ (rows: from A, from B).`,
            tx`Solve $\boldsymbol\pi P = \boldsymbol\pi$: $\pi_A = 0.9\pi_A + 0.3\pi_B$, so $0.1\pi_A = 0.3\pi_B$ and $\pi_A = 3\pi_B$.`,
            tx`With $\pi_A + \pi_B = 1$: $\pi_A = 0.75$, $\pi_B = 0.25$.`,
            tx`The two-state formula agrees: $a = 0.1$, $b = 0.3$, so $\pi_A = \frac{0.3}{0.4} = 0.75$. Brand A ends up with three-quarters of the market regardless of today's shares.`,
          ],
        },
        pitfalls: [
          tx`Rows (not columns) of $P$ sum to 1 in the row-vector convention $\mathbf pP$. Some books use columns instead, so check which.`,
          tx`$\boldsymbol\pi P = \boldsymbol\pi$ has infinitely many solutions until you add $\sum\pi_i = 1$.`,
          tx`A periodic chain (like one that alternates between two states) has a stationary distribution but doesn't converge to it.`,
        ],
        usedIn: tx`PageRank, queueing theory, Markov chain Monte Carlo in Bayesian statistics, hidden Markov models for speech and genomics, reinforcement learning, and credit-rating migration in finance.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.pick([0.1, 0.2, 0.3, 0.4, 0.5]), b = R.pick([0.1, 0.2, 0.3, 0.4, 0.6]), s = R.int(0, 1);
            const p1 = s === 0 ? [1 - a, a] : [b, 1 - b];
            return {
              q: tx`A two-state chain has $P = ${pm([[fmt(1 - a), a], [b, fmt(1 - b)]])}$. Starting in state ${s + 1}, what is the probability of being in state 1 after one step?`,
              ans: { type: 'num', answer: p1[0] },
              hint: tx`One step from state ${s + 1} uses row ${s + 1} of $P$.`,
              sol: [tx`Row ${s + 1} is $(${fmt(p1[0])}, ${fmt(p1[1])})$, so the answer is $${fmt(p1[0])}$.`],
            };
          } },
          { level: 2, gen(R) {
            const a = R.pick([0.1, 0.2, 0.25, 0.3, 0.4]), b = R.pick([0.1, 0.2, 0.3, 0.5, 0.6]), n = R.int(2, 3), s = R.int(0, 1);
            let p = s === 0 ? [1, 0] : [0, 1]; const T = [[1 - a, a], [b, 1 - b]]; const rows = [];
            for (let k = 0; k < n; k++) { p = [p[0] * T[0][0] + p[1] * T[1][0], p[0] * T[0][1] + p[1] * T[1][1]]; rows.push(tx`$\mathbf p_${k + 1} = (${fmt(p[0], 5)}, ${fmt(p[1], 5)})$`); }
            return {
              q: tx`With $P = ${pm([[fmt(1 - a), a], [b, fmt(1 - b)]])}$ and starting in state ${s + 1}, find the probability of being in state 1 after ${n} steps. Four decimals.`,
              ans: { type: 'num', answer: p[0], tol: 0.0006 },
              hint: tx`Multiply the row vector by $P$ repeatedly: $\mathbf p_{k+1} = \mathbf p_kP$.`,
              sol: [tx`$\mathbf p_0 = (${s === 0 ? '1, 0' : '0, 1'})$.`, ...rows],
            };
          } },
          { level: 3, gen(R) {
            if (R.chance(0.5)) {
              const a = R.pick([0.1, 0.2, 0.3, 0.4, 0.05]), b = R.pick([0.1, 0.2, 0.3, 0.5, 0.15]);
              return {
                q: tx`Find the stationary distribution of $P = ${pm([[fmt(1 - a), a], [b, fmt(1 - b)]])}$. Enter $\pi_1, \pi_2$.`,
                ans: { type: 'vec', answer: [b / (a + b), a / (a + b)], tol: 0.0006, placeholder: 'π₁, π₂' },
                hint: tx`Balance: flow from 1 to 2 must equal flow from 2 to 1, so $\pi_1 a = \pi_2 b$. Then use $\pi_1 + \pi_2 = 1$.`,
                sol: [tx`$${a}\pi_1 = ${b}\pi_2$ and $\pi_1 + \pi_2 = 1$.`, tx`$\pi_1 = \frac{${b}}{${fmt(a + b)}} = ${fmt(b / (a + b), 4)}$, $\pi_2 = ${fmt(a / (a + b), 4)}$.`],
              };
            }
            const T = [[0.5, 0.3, 0.2], [0.2, 0.6, 0.2], [0.1, 0.3, 0.6]].map((r) => r.slice());
            const d = R.pick([0, 0.1, -0.1]); T[0][0] += d; T[0][2] -= d;
            let p = [1 / 3, 1 / 3, 1 / 3]; for (let k = 0; k < 2000; k++) p = [0, 1, 2].map((j) => p.reduce((s, q, i) => s + q * T[i][j], 0));
            const which = R.int(0, 2);
            return {
              q: tx`A three-state chain has $P = ${pm(T.map((r) => r.map((v) => fmt(v))))}$. In the long run, what fraction of time does it spend in state ${which + 1}? Three decimals.`,
              ans: { type: 'num', answer: p[which], tol: 0.0015 },
              hint: tx`Solve $\boldsymbol\pi P = \boldsymbol\pi$ with $\pi_1 + \pi_2 + \pi_3 = 1$: two of the balance equations plus the sum condition give a $3\times3$ linear system. (Or compute $\mathbf pP^n$ for large $n$.)`,
              sol: [tx`Solving the linear system gives $\boldsymbol\pi \approx (${p.map((v) => fmt(v, 4)).join(', ')})$.`, tx`So state ${which + 1} is occupied about $${fmt(p[which] * 100, 2)}\%$ of the time.`],
              verify() { const q = [0, 1, 2].map((j) => p.reduce((s, x, i) => s + x * T[i][j], 0)); return q.every((v, i) => Math.abs(v - p[i]) < 1e-9) ? true : 'not stationary'; },
            };
          } },
        ],
      },
    ],
  });
})();
