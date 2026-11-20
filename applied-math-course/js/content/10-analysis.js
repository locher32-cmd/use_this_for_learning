/* Module 10 — Real analysis (Stage 3). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, C = AM.checks, M = AM.m;

  AM.module({
    id: 'analysis', stage: 3, title: 'Real Analysis', aka: 'Real Analysis / Advanced Calculus',
    blurb: 'Real analysis rebuilds calculus on rigorous foundations. Limits, continuity and convergence get precise ε–N and ε–δ definitions, and you learn to prove things with them. It is the course where many students first feel the difference between computing and proving, and it underpins numerical analysis, PDEs and probability.',
    prereq: ['proof', 'calc2'],
    lessons: [
      {
        id: 'sequences', title: 'Sequences and the ε–N definition', minutes: 40,
        summary: 'What "gets arbitrarily close" means, made precise.',
        idea: tx`Calculus says $1/n \to 0$, but what does "approaches" actually mean? Real analysis answers with a challenge-and-response game. You challenge me with a tolerance $\varepsilon > 0$, as tiny as you like. I win if I can name a point $N$ in the sequence after which *every* term stays within $\varepsilon$ of the limit $L$. If I can win against every possible $\varepsilon$, the sequence converges to $L$.

This definition turns intuition into something you can prove, and it's the template for every rigorous statement about limits, continuity, derivatives and integrals.`,
        everyday: tx`A factory promises bolts "as close to 10 mm as you need". You say: within 0.1 mm. They say: every bolt after the first 50 meets that. You say: within 0.001 mm. They say: every bolt after the first 5,000. If they can answer every tolerance you name, their process converges to 10 mm. If there is some tolerance they can never guarantee, it doesn't.`,
        visual: { widget: 'epsn', caption: tx`Shrink $\varepsilon$ and watch the orange line ($N$) move right: tighter tolerances need you to go further out. Every convergent example always has *some* $N$. Then pick the divergent sequence: the band can never trap the tail.` },
        math: tx`**Definition.** $a_n \to L$ if for every $\varepsilon > 0$ there exists $N$ such that
$$n \ge N \implies |a_n - L| < \varepsilon.$$

**Proof recipe.** Start from $|a_n - L| < \varepsilon$, work backwards to see how large $n$ must be, choose $N$ accordingly, then write the argument forwards.

**Key theorems.**
- Limits are unique, and convergent sequences are bounded.
- **Squeeze theorem:** if $b_n \le a_n \le c_n$ and $b_n, c_n \to L$, then $a_n \to L$.
- **Monotone convergence:** a bounded monotone sequence converges.
- **Cauchy criterion:** $(a_n)$ converges if and only if for every $\varepsilon>0$ there's an $N$ with $|a_m - a_n| < \varepsilon$ for all $m, n \ge N$.

**Divergence.** To show $a_n \not\to L$, exhibit one $\varepsilon$ for which no $N$ works.`,
        example: {
          problem: tx`Prove that $\dfrac{3n+1}{n} \to 3$.`,
          steps: [
            tx`Scratch work: $\left|\frac{3n+1}{n} - 3\right| = \frac1n$. We need $\frac1n < \varepsilon$, i.e. $n > \frac1\varepsilon$.`,
            tx`Proof: let $\varepsilon > 0$ and choose an integer $N > \frac1\varepsilon$.`,
            tx`For every $n \ge N$: $\left|\frac{3n+1}{n} - 3\right| = \frac1n \le \frac1N < \varepsilon$.`,
            tx`So the sequence converges to 3. For example, with $\varepsilon = 0.01$ any $N \ge 101$ works.`,
          ],
        },
        pitfalls: [
          tx`$N$ may depend on $\varepsilon$, but $\varepsilon$ is chosen first, and $N$ can't depend on $n$.`,
          tx`Showing that the first hundred terms get close proves nothing. The condition is about *all* terms beyond $N$.`,
          tx`A bounded sequence can still diverge, like $(-1)^n$.`,
        ],
        usedIn: tx`Convergence of numerical algorithms (Module 11), series and Fourier series (Module 13), and the existence proofs behind differential equations all rest on this definition.`,
        practice: [
          { level: 1, gen(R) {
            const k = R.int(-3, 5), c = R.nz(-9, 9), e = R.pick([0.1, 0.05, 0.02, 0.01, 0.001]);
            let N = 1; while (Math.abs(c) / N >= e) N++;
            return {
              q: tx`$a_n = \dfrac{${AM.co(k, 'n').replace(/^0n$/, '')}${k ? ' ' : ''}${c < 0 ? '-' : k ? '+' : ''} ${Math.abs(c)}}{n} \to ${k}$. For $\varepsilon = ${e}$, find the smallest $N$ such that $|a_n - ${k}| < \varepsilon$ for every $n \ge N$.`,
              ans: { type: 'num', answer: N, tol: 0.01 },
              hint: tx`Simplify $|a_n - ${k}|$ first. It should come out as $\frac{${Math.abs(c)}}{n}$.`,
              sol: [tx`$|a_n - ${k}| = \frac{${Math.abs(c)}}{n}$, which is decreasing in $n$.`, tx`$\frac{${Math.abs(c)}}{n} < ${e} \iff n > ${fmt(Math.abs(c) / e, 4)}$.`, tx`The smallest such integer is $N = ${N}$.`],
            };
          } },
          { level: 2, gen(R) {
            const c = R.int(1, 9), e = R.pick([0.1, 0.01, 0.001, 0.0004]), sh = R.int(0, 3);
            let N = 1; while (c / (N + sh) ** 2 >= e) N++;
            return {
              q: tx`Let $a_n = \dfrac{${c}}{(n ${sh ? `+ ${sh}` : ''})^2}$, which tends to 0. For $\varepsilon = ${e}$, find the smallest $N$ such that $|a_n| < \varepsilon$ for all $n \ge N$.`.replace('(n )', 'n'),
              ans: { type: 'num', answer: N, tol: 0.01 },
              hint: tx`Solve $\frac{${c}}{(n + ${sh})^2} < ${e}$ for $n$. Remember the inequality is strict.`,
              sol: [tx`$\frac{${c}}{(n + ${sh})^2} < ${e} \iff (n + ${sh})^2 > ${fmt(c / e, 4)} \iff n > \sqrt{${fmt(c / e, 4)}} - ${sh} \approx ${fmt(Math.sqrt(c / e) - sh, 4)}$.`, tx`The terms decrease, so the smallest valid $N$ is $${N}$.`],
            };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['rat', 'sqrt', 'e', 'root', 'squeeze']);
            if (kind === 'rat') { const a = R.nz(-5, 6), b = R.int(-5, 5), c = R.int(1, 7), d = R.int(-4, 4); return { q: tx`Find $\displaystyle\lim_{n\to\infty}\frac{${a}n^2 ${AM.sgn(b)}n}{${c}n^2 ${AM.sgn(d)}}$.`, ans: { type: 'num', answer: a / c, show: tx`$${AM.frac(a, c)}$` }, hint: tx`Divide numerator and denominator by $n^2$.`, sol: [tx`$\frac{${a} + ${b}/n}{${c} + ${d}/n^2} \to \frac{${a}}{${c}}$ since $1/n, 1/n^2 \to 0$.`] }; }
            if (kind === 'sqrt') { const k = R.nz(-6, 8); return { q: tx`Find $\displaystyle\lim_{n\to\infty}\left(\sqrt{n^2 ${AM.sgn(k)}n} - n\right)$.`, ans: { type: 'num', answer: k / 2, show: tx`$${AM.frac(k, 2)}$` }, hint: tx`Multiply and divide by the conjugate $\sqrt{n^2 ${AM.sgn(k)}n} + n$.`, sol: [tx`$\sqrt{n^2 ${AM.sgn(k)}n} - n = \dfrac{${k}n}{\sqrt{n^2 ${AM.sgn(k)}n} + n} = \dfrac{${k}}{\sqrt{1 ${AM.sgn(k)}/n} + 1}$.`, tx`As $n\to\infty$ this tends to $\frac{${k}}{2}$.`], verify: C.near(Math.sqrt(1e12 + k * 1e6) - 1e6, k / 2, 1e-4) }; }
            if (kind === 'e') { const k = R.nz(-3, 3); return { q: tx`Find $\displaystyle\lim_{n\to\infty}\left(1 ${k < 0 ? '-' : '+'} \frac{${Math.abs(k)}}{n}\right)^{n}$. A decimal is fine.`, ans: { type: 'num', answer: Math.exp(k), tol: 0.002, show: tx`$e^{${k}} \approx ${fmt(Math.exp(k), 4)}$` }, hint: tx`Take logs: $n\ln(1 + k/n) \to k$.`, sol: [tx`$\ln a_n = n\ln\!\left(1 + \frac{${k}}{n}\right) = n\left(\frac{${k}}{n} - \frac{${k * k}}{2n^2} + \cdots\right) \to ${k}$.`, tx`So $a_n \to e^{${k}}$.`] }; }
            if (kind === 'root') { const c = R.int(2, 9); return { q: tx`Find $\displaystyle\lim_{n\to\infty} (${c}n)^{1/n}$.`, ans: { type: 'num', answer: 1 }, hint: tx`Take logs: $\frac{\ln(${c}n)}{n}$.`, sol: [tx`$\ln a_n = \frac{\ln ${c} + \ln n}{n} \to 0$ because $\ln n$ grows more slowly than $n$.`, tx`So $a_n \to e^0 = 1$.`] }; }
            const c = R.int(2, 9);
            return { q: tx`Find $\displaystyle\lim_{n\to\infty} \frac{${c}\cos(n^2) + n}{n}$.`, ans: { type: 'num', answer: 1 }, hint: tx`Split the fraction, then squeeze the cosine term.`, sol: [tx`$\frac{${c}\cos(n^2)}{n} + 1$, and $-\frac{${c}}{n} \le \frac{${c}\cos(n^2)}{n} \le \frac{${c}}{n}$.`, tx`Both bounds tend to 0, so by the squeeze theorem the limit is $0 + 1 = 1$.`] };
          } },
        ],
      },
      {
        id: 'continuity', title: 'Continuity and the ε–δ definition', minutes: 40,
        summary: 'Small changes in input give small changes in output, made precise.',
        idea: tx`A function is **continuous** at $a$ when small changes to the input produce small changes in the output. The rigorous version is the same game as before. You name an output tolerance $\varepsilon$; I must find an input window $\delta$ so that every $x$ within $\delta$ of $a$ has $f(x)$ within $\varepsilon$ of $f(a)$. Continuous means I can always win.

Continuity is what lets you trust approximations: if a measurement is slightly off, a continuous model's prediction is only slightly off. Two big theorems follow from it. On a closed interval, a continuous function takes every value in between (the **intermediate value theorem**) and reaches a maximum and a minimum (the **extreme value theorem**).`,
        everyday: tx`A dimmer switch is continuous: turn it a tiny bit and the brightness changes a tiny bit. An ordinary light switch is not: however gently you push, the light jumps from off to on. If you need the room at exactly half brightness, the switch can't do it but the dimmer must pass through it. That's the intermediate value theorem.`,
        visual: { widget: 'epsdelta', caption: tx`The green band is the allowed output error $\varepsilon$; the blue band is the input window $\delta$. The curve turns red when some input in the window lands outside the band. Shrink $\varepsilon$ and find a $\delta$ that works. For the step function, no $\delta$ ever works.` },
        math: tx`**Definition.** $f$ is continuous at $a$ if for every $\varepsilon > 0$ there is a $\delta > 0$ such that
$$|x - a| < \delta \implies |f(x) - f(a)| < \varepsilon.$$

**Building continuous functions.** Sums, products, quotients (where the denominator is nonzero) and compositions of continuous functions are continuous.

**Intermediate value theorem.** If $f$ is continuous on $[a,b]$ and $y$ lies between $f(a)$ and $f(b)$, then $f(c) = y$ for some $c\in[a,b]$. In particular, a sign change guarantees a root.

**Extreme value theorem.** A continuous function on a closed, bounded interval attains a maximum and a minimum.

**Uniform continuity.** A single $\delta$ works for every $a$ at once. Continuous functions on closed bounded intervals are uniformly continuous; $1/x$ on $(0,1)$ is not.`,
        example: {
          problem: tx`Prove that $f(x) = 3x + 2$ is continuous at every point $a$.`,
          steps: [
            tx`Scratch work: $|f(x) - f(a)| = |3x + 2 - 3a - 2| = 3|x - a|$. We want this below $\varepsilon$.`,
            tx`So choose $\delta = \varepsilon/3$.`,
            tx`Proof: given $\varepsilon > 0$, let $\delta = \varepsilon/3$. If $|x - a| < \delta$ then $|f(x) - f(a)| = 3|x - a| < 3\delta = \varepsilon$.`,
            tx`For $x^2$ at $a = 1$ it takes more care: $|x^2 - 1| = |x-1|\,|x+1|$. Restricting to $|x - 1| < 1$ gives $|x+1| < 3$, so $\delta = \min(1, \varepsilon/3)$ works.`,
          ],
        },
        pitfalls: [
          tx`$\delta$ may depend on $\varepsilon$ and on $a$, but never on $x$.`,
          tx`The IVT needs continuity on the whole closed interval. $1/x$ changes sign on $[-1,1]$ but has no root.`,
          tx`A function can be continuous everywhere yet differentiable nowhere (the Weierstrass function).`,
        ],
        usedIn: tx`The bisection method (Module 11) is the IVT turned into an algorithm. The existence of optimal solutions (Module 14) uses the extreme value theorem. Well-posed models require outputs to depend continuously on inputs.`,
        practice: [
          { level: 1, gen(R) {
            const m = R.nz(-7, 7), b = R.int(-5, 5), e = R.pick([0.1, 0.03, 0.06, 0.12, 0.5]), a = R.int(-3, 3);
            return {
              q: tx`For $f(x) = ${AM.poly([m, b])}$ at $a = ${a}$ and $\varepsilon = ${e}$, what is the largest $\delta$ such that $|x - ${a}| < \delta$ guarantees $|f(x) - f(${a})| < \varepsilon$?`,
              ans: { type: 'num', answer: e / Math.abs(m), abs: 1e-9, rel: 0.002 },
              hint: tx`$|f(x) - f(a)| = ${Math.abs(m)}|x - a|$. How small must $|x - a|$ be?`,
              sol: [tx`$|f(x) - f(${a})| = |${m}|\,|x - ${a}| = ${Math.abs(m)}|x - ${a}|$.`, tx`This is below $${e}$ exactly when $|x - ${a}| < \frac{${e}}{${Math.abs(m)}}$, so $\delta = ${fmt(e / Math.abs(m), 6)}$. For a line, $\delta = \varepsilon/|\text{slope}|$ works at every point.`],
            };
          } },
          { level: 2, gen(R) {
            const p = R.int(1, 6), q = R.int(-30, 30); const f = (x) => x ** 3 + p * x + q;
            let r = 0; for (let i = 0; i < 60; i++) r -= f(r) / (3 * r * r + p);
            if (Math.abs(r - Math.round(r)) < 1e-6) return this.gen(R);
            const k = Math.floor(r);
            return {
              q: tx`$f(x) = x^3 + ${p}x ${AM.sgn(q)}$ has exactly one real root. Between which two consecutive integers is it? Enter the smaller integer.`,
              ans: { type: 'num', answer: k, tol: 0.01 },
              hint: tx`Evaluate $f$ at a few integers and look for a sign change. The IVT does the rest.`,
              sol: [tx`$f(${k}) = ${f(k)}$ and $f(${k + 1}) = ${f(k + 1)}$ have opposite signs.`, tx`$f$ is continuous, so by the IVT there is a root in $(${k}, ${k + 1})$. Since $f'(x) = 3x^2 + ${p} > 0$, $f$ is increasing and this is the only root.`],
              verify: C.near(Math.sign(f(k)) * Math.sign(f(k + 1)), -1, 1e-12),
            };
          } },
          { level: 3, gen(R) {
            const a = R.int(1, 5), e = R.pick([0.5, 0.2, 0.1, 0.05, 1]), d = Math.sqrt(a * a + e) - a;
            return {
              q: tx`For $f(x) = x^2$ at $a = ${a}$ with $\varepsilon = ${e}$, find the largest $\delta$ such that $|x - ${a}| < \delta$ implies $|x^2 - ${a * a}| < \varepsilon$. Five decimals.`,
              ans: { type: 'num', answer: d, tol: 0.00002 },
              hint: tx`The outputs within $\varepsilon$ of $${a * a}$ come from $x$ in $\left(\sqrt{${a * a} - ${e}},\ \sqrt{${a * a} + ${e}}\right)$. The allowed window around $${a}$ is limited by whichever end is closer.`,
              sol: [tx`$|x^2 - ${a * a}| < ${e}$ for $x$ near $${a}$ means $\sqrt{${fmt(a * a - e)}} < x < \sqrt{${fmt(a * a + e)}}$.`, tx`Distances from $${a}$: right side $\sqrt{${fmt(a * a + e)}} - ${a} \approx ${fmt(d, 6)}$, left side $${a} - \sqrt{${fmt(a * a - e)}} \approx ${fmt(a - Math.sqrt(a * a - e), 6)}$.`, tx`The parabola is steeper on the right, so the right side is the binding one: $\delta = ${fmt(d, 6)}$.`],
              verify: C.near(Math.min(d, a - Math.sqrt(a * a - e)), d, 1e-12),
            };
          } },
        ],
      },
      {
        id: 'uniform', title: 'Series and uniform convergence', minutes: 40,
        summary: 'When infinite sums behave, and when limits of functions can be trusted.',
        idea: tx`An infinite series $\sum a_n$ converges when its sequence of partial sums converges, so everything from the previous lessons applies. The convergence tests you met in calculus (comparison, ratio, alternating series) are all theorems proved with $\varepsilon$ and $N$.

Things get subtler with sequences of *functions*. Each $f_n(x) = x^n$ converges at every point of $[0,1]$, but the limit is discontinuous even though every $f_n$ is smooth. The trouble is that convergence happens at different speeds at different points. **Uniform convergence** demands one $N$ that works for every $x$ at once, and it is exactly what you need to swap limits with integrals and keep continuity.`,
        everyday: tx`A class is learning to type. *Pointwise* progress means every student eventually reaches 60 words per minute, though some might take years. *Uniform* progress means there's a date by which the whole class is within 5 words per minute of the target. Only the second lets the teacher schedule one test for everyone, just as only uniform convergence lets you trust the limit of a sequence of functions everywhere at once.`,
        visual: { widget: 'uniform', caption: tx`Raise $n$ and check whether the whole curve fits inside the green band around the limit. For $x^n$ there is always a stubborn region near $x = 1$; for $\sin(nx)/n$ the entire curve drops into the band together. The sliding bump converges to 0 at every point, but its height grows.` },
        math: tx`**Series.** $\sum a_n$ converges if the partial sums $S_N = \sum_{n=1}^N a_n$ converge. **Absolute convergence** ($\sum|a_n| < \infty$) implies convergence.

**Tests.** *Comparison:* $0\le a_n\le b_n$ and $\sum b_n<\infty$ imply $\sum a_n<\infty$. *Ratio:* $\lim|a_{n+1}/a_n| < 1$ implies absolute convergence. *Alternating series:* if $b_n$ decreases to 0, then $\sum(-1)^{n+1}b_n$ converges, and stopping after $N$ terms gives an error of at most $b_{N+1}$.

**Pointwise convergence.** $f_n \to f$ if $f_n(x)\to f(x)$ for each $x$ separately.

**Uniform convergence.** $f_n \to f$ uniformly if
$$\sup_x |f_n(x) - f(x)| \to 0.$$

**Why it matters.** If $f_n\to f$ uniformly on $[a,b]$ and each $f_n$ is continuous, then $f$ is continuous and $\int_a^b f_n \to \int_a^b f$. **Weierstrass M-test:** if $|f_n(x)|\le M_n$ for all $x$ and $\sum M_n < \infty$, then $\sum f_n$ converges uniformly.`,
        example: {
          problem: tx`Does $f_n(x) = \dfrac{x}{1 + nx^2}$ converge uniformly on $\R$?`,
          steps: [
            tx`Pointwise: for each fixed $x$ the denominator grows with $n$, so $f_n(x) \to 0$.`,
            tx`Find $\sup_x|f_n(x)|$: $f_n'(x) = \frac{1 - nx^2}{(1+nx^2)^2} = 0$ at $x = \frac{1}{\sqrt n}$.`,
            tx`$f_n\!\left(\frac1{\sqrt n}\right) = \frac{1/\sqrt n}{2} = \frac{1}{2\sqrt n}$.`,
            tx`$\sup|f_n - 0| = \frac{1}{2\sqrt n} \to 0$, so the convergence is uniform.`,
          ],
        },
        pitfalls: [
          tx`A pointwise limit of continuous functions can be discontinuous. Only uniform convergence guarantees continuity.`,
          tx`$\lim\int f_n$ can differ from $\int\lim f_n$ without uniform convergence, as the sliding bump shows.`,
          tx`The alternating series error bound needs the terms to decrease in size, not merely tend to zero.`,
        ],
        usedIn: tx`Fourier series (Module 13) converge uniformly only for smooth enough functions, which explains the Gibbs overshoot. Proofs that numerical methods converge, and term-by-term differentiation of power series, use these ideas.`,
        practice: [
          { level: 1, gen(R) {
            const p = R.pick([1, 2, 3]), N = R.pick([5, 9, 10, 19, 49, 99]), b = 1 / (N + 1) ** p;
            return {
              q: tx`You approximate $\displaystyle\sum_{n=1}^\infty \frac{(-1)^{n+1}}{n^{${p}}}$ by its first ${N} terms. What upper bound on the error does the alternating series test give?`.replace('n^{1}', 'n'),
              ans: { type: 'num', answer: b, abs: 1e-9, rel: 0.002, show: tx`$\frac{1}{${(N + 1) ** p}}$` },
              hint: tx`The error is at most the size of the first omitted term, $b_{N+1}$.`,
              sol: [tx`The terms $\frac{1}{n^{${p}}}$ decrease to 0, so the error is at most the first term left out.`, tx`That's $b_{${N + 1}} = \frac{1}{${N + 1}^{${p}}} = \frac{1}{${(N + 1) ** p}} \approx ${fmt(b, 7)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['rat', 'exp', 'pow']), n = R.int(2, 20);
            const [tex, sup, steps, f] = {
              rat: [tx`\frac{x}{1 + ${n}x^2} \text{ on } \R`, 1 / (2 * Math.sqrt(n)), [tx`Max where $1 - ${n}x^2 = 0$, at $x = 1/\sqrt{${n}}$.`, tx`$\sup = \frac{1}{2\sqrt{${n}}} \approx ${fmt(1 / (2 * Math.sqrt(n)), 5)}$.`], (x) => x / (1 + n * x * x)],
              exp: [tx`x\,e^{-${n}x} \text{ on } [0,\infty)`, 1 / (n * Math.E), [tx`$\frac{d}{dx}xe^{-${n}x} = e^{-${n}x}(1 - ${n}x) = 0$ at $x = \frac{1}{${n}}$.`, tx`$\sup = \frac{1}{${n}}e^{-1} \approx ${fmt(1 / (n * Math.E), 5)}$.`], (x) => x * Math.exp(-n * x)],
              pow: [tx`x^{${n}}(1 - x) \text{ on } [0,1]`, (n / (n + 1)) ** n / (n + 1), [tx`$\frac{d}{dx}\left(x^{${n}} - x^{${n + 1}}\right) = x^{${n - 1}}(${n} - ${n + 1}x) = 0$ at $x = \frac{${n}}{${n + 1}}$.`, tx`$\sup = \left(\frac{${n}}{${n + 1}}\right)^{${n}}\frac{1}{${n + 1}} \approx ${fmt((n / (n + 1)) ** n / (n + 1), 5)}$.`], (x) => x ** n * (1 - x)],
            }[kind];
            return {
              q: tx`Each of these converges to 0. Compute $\sup_x |f_n(x)|$ for $f_n(x) = ${tex}$ at $n = ${n}$. Four decimals.`,
              ans: { type: 'num', answer: sup, tol: 0.0001 },
              hint: tx`Find the maximum by setting the derivative to zero.`,
              sol: [...steps, tx`Since this tends to 0 as $n$ grows, the convergence is uniform.`],
              verify() { let m = 0; for (let i = 0; i <= 200000; i++) { const x = kind === 'pow' ? i / 200000 : (i / 200000) * 5; m = Math.max(m, Math.abs(f(x))); } return Math.abs(m - sup) < 1e-6 ? true : `sup mismatch ${m} vs ${sup}`; },
            };
          } },
          { level: 3, gen(R) {
            const L = [
              ['f_n(x) = x^n \\text{ on } [0, 1]', 1, 'Pointwise limit is 0 for $x<1$ and 1 at $x=1$: discontinuous, so not uniform.'],
              ['f_n(x) = x^n \\text{ on } [0, 0.9]', 0, '$\\sup|x^n| = 0.9^n \\to 0$: uniform.'],
              ['f_n(x) = \\frac{\\sin(nx)}{n} \\text{ on } \\R', 0, '$|f_n(x)| \\le \\frac1n$ for every $x$: uniform.'],
              ['f_n(x) = nx\\,e^{-nx^2} \\text{ on } [0, 1]', 1, 'Pointwise limit 0, but the maximum $\\sqrt{n/(2e)}$ grows: not uniform.'],
              ['f_n(x) = \\frac{x}{n} \\text{ on } \\R', 1, 'Pointwise limit 0, but $\\sup_{x\\in\\R}|x/n| = \\infty$ for every $n$: not uniform.'],
              ['f_n(x) = \\frac{x}{n} \\text{ on } [0, 10]', 0, '$\\sup = \\frac{10}{n} \\to 0$: uniform.'],
              ['f_n(x) = \\frac{nx}{1 + n^2x^2} \\text{ on } [0, 1]', 1, 'Pointwise limit 0, but $f_n(1/n) = \\frac12$ for every $n$: not uniform.'],
              ['f_n(x) = (-1)^n x \\text{ on } [0, 1]', 2, 'At any $x > 0$ the values flip between $x$ and $-x$, so there is no limit.'],
              ['f_n(x) = \\sin(nx) \\text{ on } [0, \\pi]', 2, 'At most points $\\sin(nx)$ keeps oscillating, so there is no pointwise limit.'],
            ];
            const [tex, ans, why] = R.pick(L);
            return {
              q: tx`How does $${tex}$ behave as $n\to\infty$?`,
              ans: { type: 'mc', choices: ['Converges uniformly', 'Converges pointwise but not uniformly', 'Does not converge pointwise'], answer: ans },
              hint: tx`First find the pointwise limit $f(x)$ (if there is one). Then compute $\sup_x|f_n(x) - f(x)|$ and see whether it goes to 0.`,
              sol: [why],
            };
          } },
        ],
      },
    ],
  });
})();
