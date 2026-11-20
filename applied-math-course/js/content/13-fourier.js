/* Module 13 — Fourier analysis and partial differential equations (Stage 4). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, C = AM.checks, M = AM.m, PI = Math.PI;

  AM.module({
    id: 'fourier', stage: 4, title: 'Fourier Analysis & PDEs', aka: 'Partial Differential Equations / Fourier Methods',
    blurb: 'Heat spreading through a metal bar, a vibrating guitar string and a sound recording are all described by partial differential equations, and Fourier series are the key that unlocks them: break any shape into sine waves, solve for each wave separately, add the results back up.',
    prereq: ['ode', 'multivar', 'linalg'],
    lessons: [
      {
        id: 'series', title: 'Fourier series', minutes: 40,
        summary: 'Any periodic signal as a sum of sines and cosines.',
        idea: tx`A **Fourier series** writes a periodic function as a sum of sines and cosines of increasing frequency. A square wave, a sawtooth, a heartbeat signal: each is a particular recipe of pure tones. The recipe (how much of each frequency) is the function's **spectrum**.

The coefficients come from a dot product. Sines and cosines of different frequencies are perpendicular, in the sense that their product integrates to zero over a period, so you can measure "how much $\sin(kx)$ is in $f$" exactly like projecting a vector onto an axis.`,
        everyday: tx`A piano and a violin playing the same note sound different because they mix different amounts of the higher harmonics. A spectrum analyser in a music app shows the Fourier coefficients of the sound, live. MP3 and JPEG compression work by keeping the large coefficients and discarding the tiny ones your ear or eye won't miss.`,
        visual: { widget: 'fourier', caption: tx`Increase the number of harmonics and watch the sum approach the dashed wave. Around each jump in the square wave there's a stubborn 9% overshoot that never goes away: the Gibbs phenomenon. The triangle wave has no jumps, so it converges much faster.` },
        math: tx`**Fourier series** of a $2\pi$-periodic $f$:
$$f(x) \sim \frac{a_0}{2} + \sum_{k=1}^{\infty}\big(a_k\cos kx + b_k\sin kx\big),$$
$$a_k = \frac1\pi\int_{-\pi}^{\pi} f(x)\cos kx\,dx, \qquad b_k = \frac1\pi\int_{-\pi}^{\pi} f(x)\sin kx\,dx.$$

**Orthogonality.** $\int_{-\pi}^{\pi}\sin jx\sin kx\,dx = \int_{-\pi}^{\pi}\cos jx\cos kx\,dx = 0$ for $j \ne k$, and $\int_{-\pi}^\pi \sin jx\cos kx\,dx = 0$ always.

**Symmetry shortcuts.** Odd $f$: only sine terms. Even $f$: only cosine terms.

**Convergence.** For piecewise smooth $f$, the series converges to $f(x)$ where $f$ is continuous and to the average of the left and right limits at a jump. Smoother $f$ means faster-decaying coefficients.

**Complex form.** $f(x) = \sum_{k=-\infty}^{\infty}c_ke^{ikx}$ with $c_k = \frac{1}{2\pi}\int_{-\pi}^{\pi}f(x)e^{-ikx}dx$.

**Parseval.** $\frac1\pi\int_{-\pi}^{\pi}f^2\,dx = \frac{a_0^2}{2} + \sum(a_k^2 + b_k^2)$: energy is the sum of the energies of the harmonics.`,
        example: {
          problem: tx`Find the Fourier series of the square wave $f(x) = 1$ for $0 < x < \pi$ and $-1$ for $-\pi < x < 0$.`,
          steps: [
            tx`$f$ is odd, so all $a_k = 0$ and only sines appear.`,
            tx`$b_k = \frac1\pi\int_{-\pi}^{\pi}f(x)\sin kx\,dx = \frac2\pi\int_0^{\pi}\sin kx\,dx = \frac{2}{\pi k}(1 - \cos k\pi)$.`,
            tx`$1 - \cos k\pi$ is $2$ for odd $k$ and $0$ for even $k$, so $b_k = \frac{4}{\pi k}$ for odd $k$.`,
            tx`$f(x) = \frac4\pi\left(\sin x + \frac{\sin 3x}{3} + \frac{\sin 5x}{5} + \cdots\right)$. At $x = \pi/2$ this gives the famous series $\frac\pi4 = 1 - \frac13 + \frac15 - \cdots$.`,
          ],
        },
        pitfalls: [
          tx`The $a_0$ term carries a $\frac12$ in front; forgetting it doubles the average value.`,
          tx`At a jump the series converges to the midpoint, not to either side's value.`,
          tx`Adding more terms does not remove the Gibbs overshoot at a jump; it only narrows it.`,
        ],
        usedIn: tx`Solving the heat and wave equations (next lessons), signal and image processing, spectral methods in numerical PDEs, and the Fourier transform used throughout physics and data science.`,
        practice: [
          { level: 1, gen(R) {
            const A = R.int(1, 5), k = R.int(1, 6), j = R.int(1, 6), kind = R.pick(['ss', 'cc', 'sc']);
            const tex = { ss: tx`\sin ${k}x\,\sin ${j}x`, cc: tx`\cos ${k}x\,\cos ${j}x`, sc: tx`\sin ${k}x\,\cos ${j}x` }[kind];
            const v = kind === 'sc' ? 0 : k === j ? A * PI : 0;
            return {
              q: tx`Evaluate $\displaystyle\int_{-\pi}^{\pi} ${A === 1 ? '' : A}${tex}\,dx$. Exact answers like <code>pi</code> are fine.`,
              ans: { type: 'num', answer: v, tol: 0.002, show: v ? tx`$${A === 1 ? '' : A}\pi$` : '$0$' },
              hint: tx`Orthogonality: different frequencies integrate to 0 over a full period; $\int_{-\pi}^\pi\sin^2kx\,dx = \int_{-\pi}^\pi\cos^2kx\,dx = \pi$; and sine times cosine always gives 0.`,
              sol: [kind === 'sc' ? tx`$\sin\cdot\cos$ is odd times even = odd, so it integrates to 0 over $[-\pi,\pi]$.` : k === j ? tx`Same frequency: $\int_{-\pi}^{\pi}${kind === 'ss' ? '\\sin^2' : '\\cos^2'} ${k}x\,dx = \pi$, so the answer is $${A}\pi$.` : tx`Different frequencies ($${k} \ne ${j}$): orthogonal, so the integral is 0.`],
              verify: C.integral((x) => A * (kind === 'ss' ? Math.sin(k * x) * Math.sin(j * x) : kind === 'cc' ? Math.cos(k * x) * Math.cos(j * x) : Math.sin(k * x) * Math.cos(j * x)), -PI, PI, v),
            };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['x', 'sq', 'abs']), k = R.int(1, 6);
            let v, tex, steps, f, which;
            if (kind === 'x') { v = (2 * (-1) ** (k + 1)) / k; tex = 'f(x) = x'; which = 'b'; f = (x) => x * Math.sin(k * x); steps = [tx`$f$ is odd, so use $b_k = \frac2\pi\int_0^\pi x\sin kx\,dx$.`, tx`By parts: $\int_0^\pi x\sin kx\,dx = -\frac{\pi\cos k\pi}{k} = \frac{\pi(-1)^{k+1}}{k}$.`, tx`$b_{${k}} = \frac{2(-1)^{${k + 1}}}{${k}} = ${AM.frac(2 * (-1) ** (k + 1), k)}$.`]; }
            else if (kind === 'sq') { v = (4 * (-1) ** k) / (k * k); tex = 'f(x) = x^2'; which = 'a'; f = (x) => x * x * Math.cos(k * x); steps = [tx`$f$ is even, so use $a_k = \frac2\pi\int_0^\pi x^2\cos kx\,dx$.`, tx`Parts twice gives $\int_0^\pi x^2\cos kx\,dx = \frac{2\pi(-1)^k}{k^2}$.`, tx`$a_{${k}} = \frac{4(-1)^{${k}}}{${k * k}} = ${AM.frac(4 * (-1) ** k, k * k)}$.`]; }
            else { v = k % 2 ? -4 / (PI * k * k) : 0; tex = 'f(x) = |x|'; which = 'a'; f = (x) => Math.abs(x) * Math.cos(k * x); steps = [tx`$f$ is even: $a_k = \frac2\pi\int_0^\pi x\cos kx\,dx = \frac{2}{\pi k^2}\big((-1)^k - 1\big)$.`, tx`For $k = ${k}$: $${k % 2 ? `\\frac{2}{\\pi\\cdot${k * k}}(-2) = -\\frac{4}{${k * k}\\pi}` : '0'}$.`]; }
            return {
              q: tx`For $${tex}$ on $(-\pi, \pi)$, compute the Fourier coefficient $${which}_{${k}}$. Four decimals or exact.`,
              ans: { type: 'num', answer: v, tol: 0.0006 },
              hint: tx`Use symmetry first: odd functions have only $b_k$, even functions only $a_k$. Then integrate by parts.`,
              sol: steps,
              verify: C.integral((x) => f(x) / PI, -PI, PI, v),
            };
          } },
          { level: 3, gen(R) {
            const N = R.pick([1, 3, 5, 7]), x0 = R.pick([PI / 2, PI / 4, PI / 3]), xt = { [PI / 2]: '\\frac\\pi2', [PI / 4]: '\\frac\\pi4', [PI / 3]: '\\frac\\pi3' }[x0];
            let s = 0; for (let k = 1; k <= N; k += 2) s += (4 / PI) * Math.sin(k * x0) / k;
            return {
              q: tx`The square wave has series $\frac4\pi\sum_{k \text{ odd}}\frac{\sin kx}{k}$. Evaluate the partial sum using all odd $k \le ${N}$ at $x = ${xt}$. Four decimals. (The true value there is 1.)`,
              ans: { type: 'num', answer: s, tol: 0.0006 },
              hint: tx`Add $\frac4\pi\frac{\sin kx}{k}$ for $k = 1, 3, \dots, ${N}$.`,
              sol: [tx`Terms for $k = ${Array.from({ length: (N + 1) / 2 }, (_, i) => 2 * i + 1).join(', ')}$: $${Array.from({ length: (N + 1) / 2 }, (_, i) => 2 * i + 1).map((k) => fmt((4 / PI) * Math.sin(k * x0) / k, 4)).join(',\\ ')}$.`, tx`Sum $\approx ${fmt(s, 5)}$, error $${fmt(Math.abs(1 - s), 4)}$. The error shrinks slowly because the coefficients only decay like $1/k$.`],
            };
          } },
        ],
      },
      {
        id: 'heat', title: 'The heat equation', minutes: 40,
        summary: 'Diffusion, separation of variables, and why rough shapes smooth out fast.',
        idea: tx`The **heat equation** $u_t = \kappa u_{xx}$ describes how temperature $u(x, t)$ spreads along a rod. Its message is simple: a point warms up if it's colder than the average of its neighbours ($u_{xx} > 0$) and cools down if it's hotter. Bumps flatten, corners round off, and everything drifts toward equilibrium.

To solve it, **separate variables**: look for solutions $u = X(x)T(t)$. The equation splits into two ODEs, giving building blocks $e^{-\kappa n^2\pi^2t}\sin(n\pi x)$. Expand the starting temperature as a Fourier series, let each mode decay at its own rate, and add them back up. High-frequency wiggles decay fastest, which is why diffusion smooths things.`,
        everyday: tx`Put a cold spoon into hot soup: heat flows along the handle, quickly at first, then more slowly as the temperature differences shrink. The same equation describes ink spreading in water, perfume filling a room, and even the Black–Scholes model for option prices in finance, which becomes the heat equation after a change of variables.`,
        visual: { widget: 'heat', caption: tx`Press Play and watch each starting shape relax. The rough noise smooths almost instantly (high modes decay like $e^{-n^2t}$), while the broad $\sin(\pi x)$ shape just shrinks without changing form. Switch the ends to insulated: now heat can't escape and the rod levels out at its average temperature.` },
        math: tx`**Heat equation** on $0 < x < L$: $\ u_t = \kappa u_{xx}$, with an initial condition $u(x,0) = f(x)$ and boundary conditions.

**Separation of variables** with $u(0,t) = u(L,t) = 0$: trying $u = X(x)T(t)$ gives $\frac{T'}{\kappa T} = \frac{X''}{X} = -\lambda$, so
$$X_n = \sin\frac{n\pi x}{L}, \quad \lambda_n = \left(\frac{n\pi}{L}\right)^2, \quad T_n = e^{-\kappa\lambda_nt}.$$

**Solution.**
$$u(x,t) = \sum_{n=1}^\infty b_n e^{-\kappa(n\pi/L)^2t}\sin\frac{n\pi x}{L}, \qquad b_n = \frac2L\int_0^Lf(x)\sin\frac{n\pi x}{L}dx.$$

**Insulated ends** ($u_x = 0$) use cosines instead, and $u \to$ the average of $f$.

**Finite differences.** $u_i^{k+1} = u_i^k + r\,(u_{i+1}^k - 2u_i^k + u_{i-1}^k)$ with $r = \kappa\Delta t/\Delta x^2$. This explicit scheme is stable only if $r \le \tfrac12$.

**Maximum principle.** Without sources, the maximum temperature never increases.`,
        example: {
          problem: tx`A rod of length 1 with ends held at 0 starts at $u(x,0) = 3\sin\pi x + \sin 4\pi x$, with $\kappa = 1$. Find $u(x,t)$ and the size of each mode at $t = 0.05$.`,
          steps: [
            tx`The initial condition is already a Fourier sine series: $b_1 = 3$ and $b_4 = 1$.`,
            tx`Each mode decays at its own rate: $u = 3e^{-\pi^2t}\sin\pi x + e^{-16\pi^2t}\sin 4\pi x$.`,
            tx`At $t = 0.05$: $3e^{-0.493} \approx 1.83$ and $e^{-7.90} \approx 0.00037$.`,
            tx`The $n = 4$ ripple has almost vanished while the broad mode has lost only 40%. Diffusion erases fine detail first.`,
          ],
        },
        pitfalls: [
          tx`The decay rate grows like $n^2$, not $n$: mode 4 decays 16 times faster than mode 1.`,
          tx`The explicit finite-difference scheme blows up if $\kappa\Delta t > \tfrac12\Delta x^2$; halving $\Delta x$ forces you to quarter $\Delta t$.`,
          tx`Use sine series for fixed-zero ends and cosine series for insulated ends. Mixing them up gives the wrong long-term behaviour.`,
        ],
        usedIn: tx`Diffusion of chemicals and heat, the Black–Scholes equation in finance, image smoothing filters, and as the model problem for numerical PDE methods.`,
        practice: [
          { level: 1, gen(R) {
            const n = R.int(1, 6), k = R.pick([1, 0.5, 2, 0.1]), L = R.pick([1, 2, PI]), Lt = L === PI ? '\\pi' : String(L), lam = k * (n * PI / L) ** 2;
            return {
              q: tx`For $u_t = ${k}u_{xx}$ on $0 < x < ${Lt}$ with zero ends, the mode $\sin\frac{${n}\pi x}{${Lt}}$ decays like $e^{-rt}$. Find $r$. Three decimals.`.replace('\\frac{1\\pi x}', '\\frac{\\pi x}'),
              ans: { type: 'num', answer: lam, tol: 0.002 },
              hint: tx`The decay rate of mode $n$ is $\kappa\left(\frac{n\pi}{L}\right)^2$.`,
              sol: [tx`$r = ${k}\left(\frac{${n}\pi}{${Lt}}\right)^2 \approx ${fmt(lam, 4)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const b1 = R.int(1, 5), m = R.int(2, 5), bm = R.int(1, 4), t = R.pick([0.01, 0.02, 0.05, 0.1]), x = R.pick([0.25, 0.5, 0.1, 0.3]);
            const u = b1 * Math.exp(-PI * PI * t) * Math.sin(PI * x) + bm * Math.exp(-m * m * PI * PI * t) * Math.sin(m * PI * x);
            return {
              q: tx`Solve $u_t = u_{xx}$ on $0<x<1$ with $u(0,t) = u(1,t) = 0$ and $u(x,0) = ${b1}\sin\pi x + ${bm}\sin ${m}\pi x$. Find $u(${x}, ${t})$ to 4 decimals.`,
              ans: { type: 'num', answer: u, tol: 0.0006 },
              hint: tx`Each sine mode $\sin n\pi x$ is multiplied by $e^{-n^2\pi^2t}$.`,
              sol: [tx`$u = ${b1}e^{-\pi^2t}\sin\pi x + ${bm}e^{-${m * m}\pi^2t}\sin ${m}\pi x$.`, tx`At $(${x}, ${t})$: $${fmt(b1 * Math.exp(-PI * PI * t) * Math.sin(PI * x), 5)} + ${fmt(bm * Math.exp(-m * m * PI * PI * t) * Math.sin(m * PI * x), 5)} \approx ${fmt(u, 5)}$.`],
            };
          } },
          { level: 3, gen(R) {
            if (R.chance(0.5)) {
              const k = R.pick([0.5, 1, 2, 4]), dx = R.pick([0.1, 0.05, 0.02, 0.01]), dt = (0.5 * dx * dx) / k;
              return {
                q: tx`For the explicit scheme for $u_t = ${k}u_{xx}$ with $\Delta x = ${dx}$, what is the largest stable time step $\Delta t$?`,
                ans: { type: 'num', answer: dt, abs: 1e-10, rel: 0.002 },
                hint: tx`Stability needs $r = \kappa\Delta t/\Delta x^2 \le \tfrac12$.`,
                sol: [tx`$\Delta t \le \frac{\Delta x^2}{2\kappa} = \frac{${dx}^2}{${2 * k}} = ${fmt(dt, 8)}$.`],
              };
            }
            const n = R.pick([1, 3, 5]), A = R.int(1, 5), v = (A * 2 * 2) / (n * PI);
            return {
              q: tx`A rod on $0<x<1$ starts at a uniform temperature $u(x,0) = ${A}$ with both ends then held at 0. Find the sine coefficient $b_{${n}}$ of the initial condition. Four decimals.`,
              ans: { type: 'num', answer: v, tol: 0.0006 },
              hint: tx`$b_n = 2\int_0^1 ${A}\sin(n\pi x)\,dx$.`,
              sol: [tx`$b_n = 2\cdot${A}\left[-\frac{\cos n\pi x}{n\pi}\right]_0^1 = \frac{${2 * A}(1 - (-1)^n)}{n\pi}$.`, tx`For odd $n = ${n}$: $\frac{${4 * A}}{${n}\pi} \approx ${fmt(v, 5)}$. (Even $n$ give 0.)`],
              verify: C.integral((x) => 2 * A * Math.sin(n * PI * x), 0, 1, v),
            };
          } },
        ],
      },
      {
        id: 'wave', title: 'The wave equation', minutes: 40,
        summary: "Vibrating strings, standing waves and d'Alembert's travelling waves.",
        idea: tx`The **wave equation** $u_{tt} = c^2u_{xx}$ governs vibrating strings, sound in air and ripples on water. Unlike heat, it has a second time derivative, like Newton's law, so disturbances don't fade: they travel at speed $c$ and bounce off boundaries.

There are two ways to see its solutions. **D'Alembert's formula** says any solution on an infinite line is two shapes sliding in opposite directions, $F(x - ct) + G(x + ct)$. On a string with fixed ends, separation of variables gives **standing waves** $\sin(n\pi x/L)\cos(n\pi ct/L)$: the harmonics. Every motion of the string is a mix of them, and their frequencies are whole-number multiples of the lowest one, which is why string instruments sound musical.`,
        everyday: tx`Pluck a guitar string. The shape you pull it into is a triangle, which is a Fourier series of harmonics; each vibrates at its own frequency, and together they make the note's timbre. Press a fret and you shorten $L$, raising every frequency $\frac{nc}{2L}$ together. Touch the string lightly at its midpoint and you silence the odd harmonics, producing the bell-like "harmonic" an octave higher.`,
        visual: { widget: 'wave', caption: tx`*Single mode*: a standing wave with fixed nodes (pink). *Plucked*: the triangle splits into two kinks that travel, reflect inverted at the ends, and recombine. Pluck at the exact middle and compare with plucking near an end: the near-end pluck contains far more high harmonics.` },
        math: tx`**Wave equation.** $u_{tt} = c^2u_{xx}$ with initial shape $u(x,0) = f(x)$ and velocity $u_t(x,0) = g(x)$.

**D'Alembert (infinite line).**
$$u(x,t) = \frac{f(x - ct) + f(x + ct)}{2} + \frac{1}{2c}\int_{x-ct}^{x+ct}g(s)\,ds.$$

**String with fixed ends** $u(0,t) = u(L,t) = 0$:
$$u(x,t) = \sum_{n=1}^\infty\left(A_n\cos\frac{n\pi ct}{L} + B_n\sin\frac{n\pi ct}{L}\right)\sin\frac{n\pi x}{L},$$
with $A_n$ the sine coefficients of $f$ and $B_n\frac{n\pi c}{L}$ those of $g$.

**Frequencies.** Mode $n$ vibrates at $\omega_n = \frac{n\pi c}{L}$, i.e. $\frac{nc}{2L}$ cycles per second. For a string, $c = \sqrt{T/\rho}$ (tension over mass per length).

**Energy** $\frac12\int(u_t^2 + c^2u_x^2)\,dx$ is conserved: waves don't decay without damping.

**Numerics.** The leapfrog scheme $u_i^{k+1} = 2u_i^k - u_i^{k-1} + \sigma^2(u_{i+1}^k - 2u_i^k + u_{i-1}^k)$ is stable when the Courant number $\sigma = c\Delta t/\Delta x \le 1$.`,
        example: {
          problem: tx`A 0.65 m guitar string has wave speed $c = 286$ m/s. What are its lowest three frequencies?`,
          steps: [
            tx`Mode $n$ has frequency $\frac{nc}{2L}$ in hertz.`,
            tx`$n = 1$: $\frac{286}{1.3} = 220$ Hz, the note A3.`,
            tx`$n = 2$: 440 Hz (an octave up); $n = 3$: 660 Hz (an octave and a fifth).`,
            tx`Halving the vibrating length at the 12th fret doubles every frequency, which is why that fret plays the octave.`,
          ],
        },
        pitfalls: [
          tx`The wave equation needs two initial conditions (shape and velocity), just like a second-order ODE.`,
          tx`Angular frequency $\omega$ and ordinary frequency $f = \omega/2\pi$ differ by $2\pi$. Musical pitch uses $f$.`,
          tx`Waves reflect *inverted* off a fixed end but upright off a free end.`,
        ],
        usedIn: tx`Acoustics and musical instruments, seismic waves, electromagnetic waves (Maxwell's equations reduce to wave equations), structural vibration, and the CFL condition that governs time steps in every explicit simulation.`,
        practice: [
          { level: 1, gen(R) {
            const L = R.pick([0.5, 0.6, 0.65, 1, 2]), c = R.int(100, 400), n = R.int(1, 5), f = (n * c) / (2 * L);
            return {
              q: tx`A string of length ${L} m with wave speed ${c} m/s is fixed at both ends. What is the frequency (in Hz) of mode $n = ${n}$?`,
              ans: { type: 'num', answer: f, unit: 'Hz' },
              hint: tx`Frequency of mode $n$: $\dfrac{nc}{2L}$.`,
              sol: [tx`$\frac{${n}\cdot${c}}{2\cdot${L}} = ${fmt(f, 3)}$ Hz.`],
            };
          } },
          { level: 2, gen(R) {
            const a = R.pick([1, 2, 0.5]), c = R.pick([1, 2, 3]), x = R.int(-3, 3), t = R.pick([0.5, 1, 1.5]);
            const f = (s) => Math.exp(-a * s * s), u = (f(x - c * t) + f(x + c * t)) / 2;
            return {
              q: tx`On an infinite string with $c = ${c}$, the initial shape is $u(x,0) = e^{-${a === 1 ? '' : a}x^2}$ and it starts at rest. Find $u(${x}, ${t})$ with d'Alembert's formula. Four decimals.`,
              ans: { type: 'num', answer: u, tol: 0.0006 },
              hint: tx`At rest means $g = 0$, so $u = \frac12\big(f(x - ct) + f(x + ct)\big)$.`,
              sol: [tx`$x - ct = ${fmt(x - c * t)}$ and $x + ct = ${fmt(x + c * t)}$.`, tx`$u = \frac12\left(e^{-${a}(${fmt(x - c * t)})^2} + e^{-${a}(${fmt(x + c * t)})^2}\right) \approx ${fmt(u, 5)}$.`],
            };
          } },
          { level: 3, gen(R) {
            if (R.chance(0.5)) {
              const c = R.int(1, 5) * 50, dx = R.pick([0.01, 0.005, 0.02]), dt = dx / c;
              return {
                q: tx`A leapfrog simulation of $u_{tt} = c^2u_{xx}$ uses $c = ${c}$ m/s and $\Delta x = ${dx}$ m. What is the largest stable time step, in seconds?`,
                ans: { type: 'num', answer: dt, abs: 1e-12, rel: 0.002 },
                hint: tx`The CFL condition: $c\,\Delta t/\Delta x \le 1$.`,
                sol: [tx`$\Delta t \le \frac{\Delta x}{c} = \frac{${dx}}{${c}} = ${fmt(dt, 8)}$ s. Information can't travel more than one grid cell per step.`],
              };
            }
            const p = R.pick([0.5, 0.25, 0.2, 0.3]), n = R.int(1, 4), bk = (2 * Math.sin(n * PI * p)) / (n * n * PI * PI * p * (1 - p));
            return {
              q: tx`A unit-length string is plucked to height 1 at $x = ${p}$ (a triangle shape) and released. Its sine coefficients are $b_n = \dfrac{2\sin(n\pi p)}{n^2\pi^2p(1-p)}$. Compute $b_{${n}}$. Four decimals.`,
              ans: { type: 'num', answer: bk, tol: 0.0006 },
              hint: tx`Substitute $p = ${p}$ and $n = ${n}$. A pluck at a node of mode $n$ gives $b_n = 0$.`,
              sol: [tx`$b_{${n}} = \frac{2\sin(${n}\pi\cdot${p})}{${n * n}\pi^2\cdot${p}\cdot${fmt(1 - p)}} \approx ${fmt(bk, 5)}$.`, tx`${Math.abs(bk) < 1e-9 ? `$x = ${p}$ is a node of mode ${n}, so plucking there can't excite it.` : `Coefficients fall like $1/n^2$, which is why higher harmonics are quieter.`}`],
              verify: C.integral((x) => 2 * (x < p ? x / p : (1 - x) / (1 - p)) * Math.sin(n * PI * x), 0, 1, bk),
            };
          } },
        ],
      },
    ],
  });
})();
