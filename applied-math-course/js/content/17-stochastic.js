/* Module 17 — Stochastic processes (Stage 5). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, C = AM.checks, M = AM.m;

  AM.module({
    id: 'stochastic', stage: 5, title: 'Stochastic Processes', aka: 'Stochastic Processes / Applied Probability',
    blurb: 'Randomness that unfolds over time: particles diffusing, customers arriving, stock prices wandering. Random walks, Poisson processes and Brownian motion are the three building blocks, and stochastic differential equations combine them with the calculus you already know.',
    prereq: ['prob', 'ode'],
    lessons: [
      {
        id: 'walks', title: 'Random walks', minutes: 35,
        summary: 'Step left or right at random: drift, diffusion and gambler\'s ruin.',
        idea: tx`A **random walk** takes a step up with probability $p$ or down with probability $1-p$, independently each time. After $n$ steps, its position is a sum of $n$ independent $\pm1$ steps, so the Central Limit Theorem says it's approximately normal, with mean $n(2p-1)$ and standard deviation $2\sqrt{np(1-p)}$.

The striking fact is the $\sqrt n$: a fair walk wanders, but its typical distance from the start grows only like the square root of time. That's **diffusion**, and it's the same law that governs heat spreading and molecules drifting. Add boundaries and you get gambler's ruin: where will the walk exit, and how long will it take?`,
        everyday: tx`A drunk person leaves a lamppost and stumbles one step left or right at random each second. After 100 seconds they're typically only about 10 steps away, not 100: wandering is slow. In a casino, even a tiny edge for the house ($p$ just below $\frac12$) gives a drift that eventually overwhelms the $\sqrt n$ wandering, so a gambler playing long enough almost surely goes broke.`,
        visual: { widget: 'randomwalk', caption: tx`Thirty walks at once. With $p = 0.5$ they fan out inside the green $\pm2\sqrt n$ band. Make $n$ larger: the band widens, but only like $\sqrt n$. Tilt $p$ to 0.55 and watch the drift take over.` },
        math: tx`**Simple random walk.** $S_n = X_1 + \cdots + X_n$ with $X_i = +1$ (probability $p$) or $-1$ (probability $q = 1-p$).

**Moments.** $E[S_n] = n(p - q)$, $\ \operatorname{Var}(S_n) = 4npq$. For large $n$, $S_n \approx N\big(n(p-q), 4npq\big)$.

**Exact distribution.** $P(S_n = k) = \dbinom{n}{\frac{n+k}{2}}p^{(n+k)/2}q^{(n-k)/2}$ when $n + k$ is even (and 0 otherwise).

**Gambler's ruin.** Starting at $i$, absorbed at 0 or $N$:
$$P(\text{reach } N) = \begin{cases}\dfrac{1 - (q/p)^i}{1 - (q/p)^N} & p \ne q\\[2mm] \dfrac{i}{N} & p = q = \tfrac12\end{cases}, \qquad E[\text{duration}] = i(N - i)\ \text{ when } p = \tfrac12.$$

**Recurrence.** A fair walk on a line (or plane) returns to the origin with probability 1; in three dimensions it doesn't. $P(S_{2n} = 0) = \binom{2n}{n}4^{-n} \approx \frac{1}{\sqrt{\pi n}}$.

**Scaling limit.** Speed up time and shrink steps like $\sqrt{\Delta t}$, and the walk becomes Brownian motion (lesson 3).`,
        example: {
          problem: tx`A fair walk starts at 3 and stops at 0 or 10. Find the probability of reaching 10 and the expected number of steps.`,
          steps: [
            tx`For a fair walk, $P(\text{reach } N) = i/N = 3/10$.`,
            tx`This follows from $h_i = \frac12h_{i+1} + \frac12h_{i-1}$: $h$ is linear in $i$, with $h_0 = 0$, $h_{10} = 1$.`,
            tx`Expected duration $D_i = i(N - i) = 3\times7 = 21$ steps.`,
            tx`That also solves a linear recurrence: $D_i = 1 + \frac12D_{i+1} + \frac12D_{i-1}$ with $D_0 = D_N = 0$.`,
          ],
        },
        pitfalls: [
          tx`After $n$ steps the position has the same parity as $n$: $P(S_5 = 2) = 0$.`,
          tx`The spread grows like $\sqrt n$, not $n$. Variances add; standard deviations don't.`,
          tx`For $p \ne \frac12$, use the $(q/p)$ formula. Using $i/N$ for a biased walk is a common error.`,
        ],
        usedIn: tx`Diffusion and the heat equation (Module 13), the binomial model of option pricing, polymer physics, Monte Carlo algorithms, and Brownian motion (later in this module).`,
        practice: [
          { level: 1, gen(R) {
            const n = R.int(10, 400), p = R.pick([0.5, 0.4, 0.45, 0.55, 0.6, 0.3]);
            return { q: tx`A random walk steps up with probability ${p} and down otherwise. After ${n} steps, find the mean and the variance of its position.`, ans: { type: 'vec', answer: [n * (2 * p - 1), 4 * n * p * (1 - p)], placeholder: 'mean, variance' }, hint: tx`One step has mean $p - q$ and variance $1 - (p-q)^2 = 4pq$. Steps are independent.`, sol: [tx`Mean $= ${n}(${p} - ${fmt(1 - p)}) = ${fmt(n * (2 * p - 1))}$.`, tx`Variance $= 4\cdot${n}\cdot${p}\cdot${fmt(1 - p)} = ${fmt(4 * n * p * (1 - p))}$.`] };
          } },
          { level: 2, gen(R) {
            const n = R.int(4, 16), k = (R.int(-Math.floor(n / 2), Math.floor(n / 2)) * 2 + (n % 2)), p = R.pick([0.5, 0.4, 0.6]), up = (n + k) / 2, v = M.binom(n, up) * p ** up * (1 - p) ** (n - up);
            return { q: tx`A walk starts at 0 and steps $+1$ with probability ${p}, $-1$ otherwise. Find $P(S_{${n}} = ${k})$. Four decimals.`, ans: { type: 'num', answer: v, tol: 0.0006 }, hint: tx`To end at ${k} after ${n} steps you need $\frac{${n} + ${k}}{2} = ${up}$ up-steps.`, sol: [tx`$\binom{${n}}{${up}}(${p})^{${up}}(${fmt(1 - p)})^{${n - up}} = ${M.binom(n, up)}\cdot${fmt(p ** up * (1 - p) ** (n - up), 7)} \approx ${fmt(v, 5)}$.`] };
          } },
          { level: 3, gen(R) {
            const N = R.int(5, 30), i = R.int(1, N - 1);
            return { q: tx`A fair random walk starts at ${i} and stops when it first hits 0 or ${N}. What is the expected number of steps?`, ans: { type: 'num', answer: i * (N - i) }, hint: tx`$D_i = 1 + \frac12(D_{i+1} + D_{i-1})$ with $D_0 = D_N = 0$ has solution $D_i = i(N - i)$.`, sol: [tx`$D_{${i}} = ${i}\times${N - i} = ${i * (N - i)}$. Starting in the middle takes longest.`], verify() { const D = new Array(N + 1).fill(0); for (let it = 0; it < 40000; it++) for (let j = 1; j < N; j++) D[j] = 1 + 0.5 * (D[j + 1] + D[j - 1]); return Math.abs(D[i] - i * (N - i)) < 1e-3 ? true : 'duration mismatch'; } };
          } },
          { level: 4, gen(R) {
            const n = R.int(2, 25), v = M.binom(2 * n, n) / 4 ** n, approx = 1 / Math.sqrt(Math.PI * n);
            return { q: tx`For a fair random walk from 0, find $P(S_{${2 * n}} = 0)$ (back at the start after ${2 * n} steps) and compare it with the approximation $\frac{1}{\sqrt{\pi n}}$. Enter the exact probability to 5 decimals.`, ans: { type: 'num', answer: v, tol: 0.00002 }, hint: tx`You need exactly ${n} up-steps among ${2 * n}: $\binom{${2 * n}}{${n}}2^{-${2 * n}}$.`, sol: [tx`$\binom{${2 * n}}{${n}}/4^{${n}} \approx ${fmt(v, 6)}$.`, tx`Stirling's approximation gives $\frac{1}{\sqrt{${n}\pi}} \approx ${fmt(approx, 6)}$. Because $\sum\frac{1}{\sqrt n}$ diverges, the walk returns to 0 infinitely often.`] };
          } },
        ],
      },
      {
        id: 'poisson', title: 'Poisson processes and queues', minutes: 35,
        summary: 'Random events in continuous time: arrivals, failures, and waiting lines.',
        idea: tx`Events that happen independently and at a steady average rate, such as customers arriving, radioactive decays or website requests, form a **Poisson process** with rate $\lambda$. Two descriptions are equivalent: the number of events in any time interval of length $t$ is Poisson with mean $\lambda t$, and the gaps between events are independent exponential random variables with mean $1/\lambda$.

The exponential gaps are **memoryless**: having waited ten minutes for a bus that arrives as a Poisson process doesn't make it more likely in the next minute. Combining arrivals with service gives **queueing theory**, which predicts waiting times from just two rates.`,
        everyday: tx`A coffee shop gets on average 30 customers an hour, and a barista serves 40 an hour. The shop is busy 75% of the time, yet queueing theory says an average customer spends 6 minutes in the shop, and a line of 3 or more forms surprisingly often. Push arrivals to 38 an hour and the average time jumps to 30 minutes: queues explode as utilization nears 100%.`,
        visual: { widget: 'poissonproc', caption: tx`Each tick is an event. Notice the clumps and long gaps, even though the rate is constant: that's what true randomness looks like. The histogram of counts per unit time matches the orange Poisson probabilities.` },
        math: tx`**Poisson process** with rate $\lambda$: counts in disjoint intervals are independent, and
$$P(N(t) = k) = e^{-\lambda t}\frac{(\lambda t)^k}{k!}.$$

**Inter-arrival times** are independent $\text{Exponential}(\lambda)$: $P(T > t) = e^{-\lambda t}$, mean $1/\lambda$. The time of the $k$-th event has mean $k/\lambda$ (a Gamma distribution).

**Memoryless.** $P(T > s + t \mid T > s) = P(T > t)$.

**Merging and splitting.** Independent processes with rates $\lambda_1, \lambda_2$ merge into one with rate $\lambda_1 + \lambda_2$, and the next event comes from the first with probability $\frac{\lambda_1}{\lambda_1 + \lambda_2}$. Keeping each event with probability $p$ gives a Poisson process with rate $p\lambda$.

**M/M/1 queue** (Poisson arrivals at rate $\lambda$, one server with exponential service at rate $\mu > \lambda$): utilization $\rho = \lambda/\mu$, average number in the system $L = \frac{\rho}{1-\rho}$, average time in the system $W = \frac{1}{\mu - \lambda}$. **Little's law:** $L = \lambda W$, for any stable queue.`,
        example: {
          problem: tx`Calls arrive at 6 per hour. What is the probability of exactly 2 calls in the next 15 minutes, and of waiting more than 20 minutes for the next call?`,
          steps: [
            tx`In 15 minutes, $\lambda t = 6\times0.25 = 1.5$.`,
            tx`$P(N = 2) = e^{-1.5}\frac{1.5^2}{2} \approx 0.251$.`,
            tx`Waiting more than 20 minutes ($\frac13$ hour): $P(T > \frac13) = e^{-6/3} = e^{-2} \approx 0.135$.`,
            tx`Memorylessness: if no call has come in the last hour, the chance of waiting another 20 minutes is still 0.135.`,
          ],
        },
        pitfalls: [
          tx`Scale the rate to the interval: rate per hour times time in hours.`,
          tx`Memorylessness is special to the exponential. Real waiting times (like bus timetables) often aren't memoryless.`,
          tx`Queue formulas need $\lambda < \mu$; otherwise the line grows without bound.`,
        ],
        usedIn: tx`Call centres, network traffic, hospital staffing, reliability engineering, and as the jump part of stochastic models in finance and biology.`,
        practice: [
          { level: 1, gen(R) {
            const lam = R.pick([2, 3, 4, 5, 6, 10, 12]), t = R.pick([0.25, 0.5, 1, 2]), k = R.int(0, Math.round(lam * t + 3)), mu = lam * t, v = Math.exp(-mu) * mu ** k / M.fact(k);
            return { q: tx`Events occur as a Poisson process at ${lam} per hour. Find the probability of exactly ${k} event${k === 1 ? '' : 's'} in ${t * 60} minutes. Four decimals.`, ans: { type: 'num', answer: v, tol: 0.0006 }, hint: tx`Mean count $\lambda t = ${lam}\times${t} = ${fmt(mu)}$.`, sol: [tx`$e^{-${fmt(mu)}}\frac{${fmt(mu)}^{${k}}}{${k}!} \approx ${fmt(v, 5)}$.`] };
          } },
          { level: 2, gen(R) {
            const lam = R.pick([0.5, 1, 2, 3, 4]), t = R.pick([0.5, 1, 2, 3]), k = R.int(2, 5), ask = R.pick(['wait', 'kth']);
            return ask === 'wait'
              ? { q: tx`Buses arrive as a Poisson process at ${lam} per 10 minutes. You've already waited 10 minutes. What's the probability you wait at least ${t * 10} more minutes? Four decimals.`, ans: { type: 'num', answer: Math.exp(-lam * t), tol: 0.0006 }, hint: tx`Memoryless: the time already spent waiting doesn't matter.`, sol: [tx`$P(T > ${t}\text{ units}) = e^{-${lam}\cdot${t}} \approx ${fmt(Math.exp(-lam * t), 5)}$.`] }
              : { q: tx`Failures occur at rate ${lam} per year. What is the expected time (in years) until the ${k}th failure?`, ans: { type: 'num', answer: k / lam, abs: 1e-9 }, hint: tx`It's the sum of ${k} independent exponential gaps, each with mean $1/\lambda$.`, sol: [tx`$${k}\times\frac{1}{${lam}} = ${fmt(k / lam, 4)}$ years.`] };
          } },
          { level: 3, gen(R) {
            const l1 = R.int(1, 8), l2 = R.int(1, 8), t = R.pick([0.25, 0.5, 1]), ask = R.pick(['first', 'none']);
            return ask === 'first'
              ? { q: tx`Emails arrive at ${l1} per hour and texts at ${l2} per hour, independently (both Poisson). What's the probability the next message is an email?`, ans: { type: 'num', answer: l1 / (l1 + l2), abs: 1e-9, show: tx`$${AM.frac(l1, l1 + l2)}$` }, hint: tx`The race between two exponentials: the faster rate wins proportionally.`, sol: [tx`$\frac{${l1}}{${l1} + ${l2}} = ${AM.frac(l1, l1 + l2)}$.`] }
              : { q: tx`Emails arrive at ${l1} per hour and texts at ${l2} per hour (independent Poisson processes). Find the probability of no messages at all in ${t * 60} minutes. Four decimals.`, ans: { type: 'num', answer: Math.exp(-(l1 + l2) * t), tol: 0.0006 }, hint: tx`Merged messages form a Poisson process with rate $${l1} + ${l2}$.`, sol: [tx`$e^{-${l1 + l2}\cdot${t}} \approx ${fmt(Math.exp(-(l1 + l2) * t), 5)}$.`] };
          } },
          { level: 4, gen(R) {
            const mu = R.int(10, 40), lam = R.int(Math.round(mu * 0.4), mu - 1), rho = lam / mu, L = rho / (1 - rho), W = 1 / (mu - lam);
            return { q: tx`A help desk receives ${lam} requests per hour (Poisson) and resolves them one at a time at ${mu} per hour (exponential). Find the average number of requests in the system and the average time each spends there, in minutes.`, ans: { type: 'vec', answer: [L, W * 60], tol: 0.002, placeholder: 'L, W in minutes' }, hint: tx`M/M/1: $\rho = \lambda/\mu$, $L = \frac{\rho}{1-\rho}$, $W = \frac{1}{\mu - \lambda}$ (hours). Check with Little's law $L = \lambda W$.`, sol: [tx`$\rho = \frac{${lam}}{${mu}} = ${fmt(rho, 4)}$, so $L = ${fmt(L, 4)}$.`, tx`$W = \frac{1}{${mu - lam}}$ hours $= ${fmt(W * 60, 4)}$ minutes. Little: $\lambda W = ${lam}\times${fmt(W, 5)} = ${fmt(lam * W, 4)} = L$. ✓`], verify: C.near(lam * W, L, 1e-12) };
          } },
        ],
      },
      {
        id: 'brownian', title: 'Brownian motion and stochastic differential equations', minutes: 45,
        summary: 'Continuous random motion, Itô\'s rule, and simulating noisy dynamics.',
        idea: tx`Shrink a random walk's steps and speed it up in just the right way ($\Delta x = \sqrt{\Delta t}$) and it converges to **Brownian motion** $W(t)$: a continuous path whose increments are independent and normal, with $W(t) - W(s) \sim N(0, t - s)$. It is continuous everywhere but so jagged that it's differentiable nowhere.

A **stochastic differential equation** adds Brownian noise to an ODE: $dX = a(X)\,dt + b(X)\,dW$. The drift $a$ pushes deterministically; the diffusion $b$ shakes. Because $dW$ is of size $\sqrt{dt}$, ordinary calculus needs one correction, **Itô's lemma**, which adds a term $\frac12b^2f''$. Simulations use **Euler–Maruyama**: Euler's method plus a normal random kick of size $b\sqrt{\Delta t}$ each step.`,
        everyday: tx`In 1827 Robert Brown watched pollen grains jiggle in water; in 1905 Einstein explained the motion as countless molecular collisions and used its $\sqrt t$ spreading to estimate the size of atoms. Today the same mathematics prices stock options: the Black–Scholes model assumes prices follow geometric Brownian motion, $dS = \mu S\,dt + \sigma S\,dW$, so percentage changes are random but prices stay positive.`,
        visual: { widget: 'brownian', caption: tx`Compare the three models. Brownian motion spreads like $\sqrt t$. Geometric Brownian motion (stock prices) spreads multiplicatively and stays positive. The mean-reverting Ornstein–Uhlenbeck process keeps getting pulled back, so its spread stops growing.` },
        math: tx`**Brownian motion.** $W(0) = 0$; independent increments; $W(t) - W(s) \sim N(0, t - s)$; continuous paths. So $W(t) \sim N(0, t)$.

**SDE.** $dX_t = a(X_t, t)\,dt + b(X_t, t)\,dW_t$.

**Itô's lemma.** For smooth $f$:
$$df(X_t) = \left(f'(X_t)\,a + \tfrac12f''(X_t)\,b^2\right)dt + f'(X_t)\,b\,dW_t.$$
The extra $\frac12f''b^2$ comes from $(dW)^2 = dt$. Example: $d(W^2) = dt + 2W\,dW$, so $E[W_t^2] = t$.

**Key models.**
- Brownian motion with drift: $dX = \mu\,dt + \sigma\,dW$, so $X_t \sim N(x_0 + \mu t, \sigma^2t)$.
- Geometric BM: $dS = \mu S\,dt + \sigma S\,dW$, solved by $S_t = S_0\exp\big((\mu - \frac{\sigma^2}{2})t + \sigma W_t\big)$; $E[S_t] = S_0e^{\mu t}$, median $S_0e^{(\mu - \sigma^2/2)t}$.
- Ornstein–Uhlenbeck: $dX = \theta(m - X)\,dt + \sigma\,dW$, with stationary distribution $N\!\left(m, \frac{\sigma^2}{2\theta}\right)$.

**Euler–Maruyama.** $X_{k+1} = X_k + a(X_k)\Delta t + b(X_k)\sqrt{\Delta t}\,Z_k$ with $Z_k \sim N(0,1)$ independent.`,
        example: {
          problem: tx`A stock follows GBM with $S_0 = 100$, $\mu = 0.08$, $\sigma = 0.2$ per year. Find its expected price and median price after one year.`,
          steps: [
            tx`Mean: $E[S_1] = 100e^{0.08} \approx 108.33$.`,
            tx`Median: $100e^{(0.08 - 0.02)} = 100e^{0.06} \approx 106.18$.`,
            tx`The median is lower because the log-normal distribution is right-skewed: a few large gains pull the mean up.`,
            tx`That gap, $\frac{\sigma^2}{2}$, is exactly Itô's correction applied to $\ln S$.`,
          ],
        },
        pitfalls: [
          tx`Brownian increments over time $\Delta t$ have standard deviation $\sqrt{\Delta t}$, not $\Delta t$.`,
          tx`Ordinary chain rule fails for SDEs; forgetting Itô's $\frac12f''b^2$ term is the classic error.`,
          tx`One simulated path is anecdote; estimate expectations from many paths and report a confidence interval (Module 09).`,
        ],
        usedIn: tx`Option pricing and risk management in finance, molecular dynamics, population genetics, filtering and control with noisy sensors, and diffusion models in generative AI.`,
        practice: [
          { level: 1, gen(R) {
            const t = R.pick([1, 2, 4, 9, 0.25]), a = R.pick([0.5, 1, 1.5, 2, 3]), v = 1 - M.phi(a / Math.sqrt(t));
            return { q: tx`For standard Brownian motion, find $P(W(${t}) > ${a})$. Four decimals.`, ans: { type: 'num', answer: v, tol: 0.0006 }, hint: tx`$W(t) \sim N(0, t)$, so standardize by $\sqrt t$.`, sol: [tx`$z = \frac{${a}}{\sqrt{${t}}} = ${fmt(a / Math.sqrt(t), 4)}$.`, tx`$1 - \Phi(${fmt(a / Math.sqrt(t), 4)}) \approx ${fmt(v, 5)}$.`] };
          } },
          { level: 2, gen(R) {
            const S0 = R.pick([50, 100, 200]), mu = R.pick([0.05, 0.08, 0.1, 0.12]), sig = R.pick([0.1, 0.2, 0.3, 0.4]), T = R.pick([1, 2, 5]);
            return { q: tx`A price follows geometric Brownian motion with $S_0 = ${S0}$, $\mu = ${mu}$, $\sigma = ${sig}$. Find the expected price and the median price at $t = ${T}$. Two decimals.`, ans: { type: 'vec', answer: [S0 * Math.exp(mu * T), S0 * Math.exp((mu - sig * sig / 2) * T)], tol: 0.01, placeholder: 'mean, median' }, hint: tx`$E[S_t] = S_0e^{\mu t}$; median $= S_0e^{(\mu - \sigma^2/2)t}$ because $\ln S_t$ is normal.`, sol: [tx`Mean $= ${S0}e^{${fmt(mu * T)}} \approx ${fmt(S0 * Math.exp(mu * T), 3)}$.`, tx`Median $= ${S0}e^{${fmt((mu - sig * sig / 2) * T, 4)}} \approx ${fmt(S0 * Math.exp((mu - sig * sig / 2) * T), 3)}$.`] };
          } },
          { level: 3, gen(R) {
            const x0 = R.pick([1, 2, 0.5, 10]), th = R.pick([0, 0.5, 1, 2]), m = R.int(0, 3), sig = R.pick([0.2, 0.5, 1]), dt = R.pick([0.01, 0.1, 0.05]), Z = R.pick([-1.2, -0.5, 0.3, 0.8, 1.5]);
            const a = th ? th * (m - x0) : 0.1 * x0, b = th ? sig : sig * x0, x1 = x0 + a * dt + b * Math.sqrt(dt) * Z;
            const eq = th ? tx`dX = ${th}(${m} - X)\,dt + ${sig}\,dW` : tx`dX = 0.1X\,dt + ${sig}X\,dW`;
            return { q: tx`Take one Euler–Maruyama step for $${eq}$ from $X_0 = ${x0}$ with $\Delta t = ${dt}$ and normal draw $Z = ${Z}$. Five decimals.`, ans: { type: 'num', answer: x1, tol: 0.00002 }, hint: tx`$X_1 = X_0 + a(X_0)\Delta t + b(X_0)\sqrt{\Delta t}\,Z$.`, sol: [tx`$a(X_0) = ${fmt(a, 5)}$, $b(X_0) = ${fmt(b, 5)}$, $\sqrt{\Delta t} = ${fmt(Math.sqrt(dt), 5)}$.`, tx`$X_1 = ${x0} + ${fmt(a * dt, 6)} + ${fmt(b * Math.sqrt(dt) * Z, 6)} = ${fmt(x1, 6)}$.`] };
          } },
          { level: 4, gen(R) {
            if (R.chance(0.5)) {
              const th = R.pick([0.5, 1, 2, 4]), sig = R.pick([0.2, 0.5, 1, 2]), v = sig * sig / (2 * th);
              return { q: tx`For the Ornstein–Uhlenbeck process $dX = ${th}(m - X)\,dt + ${sig}\,dW$, find the long-run (stationary) variance.`, ans: { type: 'num', answer: v, abs: 1e-9 }, hint: tx`Use Itô on $X^2$ (or the known formula): the stationary variance balances pull-back and noise, $\frac{\sigma^2}{2\theta}$.`, sol: [tx`$\frac{${sig}^2}{2\cdot${th}} = ${fmt(v, 5)}$. Stronger pull ($\theta$) means less spread.`] };
            }
            const x0 = R.int(-2, 3), mu = R.pick([-1, 0.5, 1, 2]), sig = R.pick([0.5, 1, 2]), t = R.pick([1, 2, 3]), v = (x0 + mu * t) ** 2 + sig * sig * t;
            return { q: tx`$X$ solves $dX = ${mu}\,dt + ${sig}\,dW$ with $X_0 = ${x0}$. Use Itô's lemma (or the distribution of $X_t$) to find $E[X_{${t}}^2]$.`, ans: { type: 'num', answer: v, abs: 1e-9 }, hint: tx`$X_t \sim N(x_0 + \mu t, \sigma^2t)$, and $E[X^2] = \operatorname{Var}X + (E[X])^2$. Itô: $d(X^2) = (2X\mu + \sigma^2)dt + 2X\sigma\,dW$.`, sol: [tx`$E[X_t] = ${x0} + ${mu}\cdot${t} = ${x0 + mu * t}$, $\operatorname{Var}X_t = ${sig * sig}\cdot${t} = ${sig * sig * t}$.`, tx`$E[X_t^2] = ${sig * sig * t} + (${x0 + mu * t})^2 = ${fmt(v)}$. The $\sigma^2t$ term is exactly the Itô correction.`] };
          } },
        ],
      },
    ],
  });
})();
