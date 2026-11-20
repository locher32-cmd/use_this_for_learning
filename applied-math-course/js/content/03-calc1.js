/* Module 03 — Calculus I: limits and derivatives (Stage 1). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, sgn = AM.sgn, poly = AM.poly, C = AM.checks;

  AM.module({
    id: 'calc1', stage: 1, title: 'Calculus I: Change', aka: 'Calculus I (Differential Calculus)',
    blurb: 'Calculus starts with one question: how fast is this changing right now? Limits make "right now" precise, derivatives answer the question, and optimization puts the answer to work.',
    prereq: ['functions'],
    lessons: [
      {
        id: 'limits', title: 'Limits', minutes: 30,
        summary: "What a function is heading toward, even where it isn't defined.",
        idea: tx`A **limit** describes where a function's outputs are heading as the input gets close to some value, regardless of what happens exactly at that value. We write $\lim_{x\to a} f(x) = L$ when $f(x)$ can be made as close to $L$ as you like by taking $x$ close enough to $a$ (but not equal to it).

Limits are the foundation of calculus. Both of its big ideas, the instantaneous rate of change and the exact area, are defined as limits of approximations that keep getting better.`,
        everyday: tx`A speed camera works out your speed from your position at two nearby moments. The closer together the moments, the better the estimate, and your speed at a single instant is the *limit* of those estimates.

Or think of a phone charging overnight: 99%, 99.9%, 99.99%… Even if the display never literally shows 100.000%, it is clearly heading there. A limit is the value a process approaches, which is usually what you care about.`,
        visual: { widget: 'limit', caption: tx`Push the closeness slider right to squeeze the two points toward $a$ from each side. When both sides home in on the same height, that height is the limit. Then try the jump, the blow-up and $\sin(1/x)$ to see three ways a limit can fail.` },
        math: tx`**Definition (informal).** $\lim_{x\to a} f(x) = L$ means $f(x)$ gets arbitrarily close to $L$ as $x$ gets close to $a$, from both sides.

**One-sided limits.** $\lim_{x\to a^-}$ approaches from the left and $\lim_{x\to a^+}$ from the right. The two-sided limit exists only if both exist and agree.

**Limit laws.** The limit of a sum, product or quotient is the sum, product or quotient of the limits (provided the denominator's limit isn't 0).

**Continuity.** $f$ is continuous at $a$ if $\lim_{x\to a} f(x) = f(a)$. Polynomials, $\sin$, $\cos$ and $e^x$ are continuous everywhere, so for them you can just substitute.

**Techniques for $\tfrac00$:** factor and cancel, multiply by a conjugate, or use the standard limits
$$\lim_{x\to0}\frac{\sin x}{x} = 1, \qquad \lim_{x\to0}\frac{e^x-1}{x} = 1, \qquad \lim_{x\to\infty}\left(1+\frac{k}{x}\right)^x = e^k.$$

**At infinity**, a rational function is dominated by its highest powers: $\displaystyle\lim_{x\to\infty}\frac{3x^2+1}{5x^2-x} = \frac35$.`,
        example: {
          problem: tx`Find $\displaystyle\lim_{x\to 3}\frac{x^2 - 9}{x - 3}$.`,
          steps: [
            tx`Substituting $x = 3$ gives $\frac{0}{0}$. That doesn't mean the limit fails to exist; it means you have to simplify first.`,
            tx`Factor: $x^2 - 9 = (x-3)(x+3)$.`,
            tx`For $x \ne 3$, $\dfrac{(x-3)(x+3)}{x-3} = x + 3$. The limit never looks at $x = 3$ itself, so cancelling is allowed.`,
            tx`$\lim_{x\to3}(x+3) = 6$.`,
          ],
        },
        pitfalls: [
          tx`$\frac{0}{0}$ is a signal to simplify, not an answer. It's called an *indeterminate form*.`,
          tx`$\lim_{x\to a} f(x)$ can exist when $f(a)$ is undefined, and can differ from $f(a)$ when it is defined.`,
          tx`Something like $\frac{5}{0}$ means the limit is $\pm\infty$ or doesn't exist. Check the sign on each side.`,
        ],
        usedIn: tx`Derivatives and integrals (the next lessons) are both limits. Real analysis (Module 10) makes the definition rigorous with $\varepsilon$ and $\delta$, and numerical methods (Module 11) study how fast approximations approach their limits.`,
        practice: [
          { level: 1, gen(R) {
            const b = R.nz(-4, 4), c = R.int(-6, 6), d = R.int(-9, 9), a = R.nz(-3, 3), v = b * a * a + c * a + d;
            return {
              q: tx`Find $\displaystyle\lim_{x\to ${a}} \left(${poly([b, c, d])}\right)$.`,
              ans: { type: 'num', answer: v },
              hint: tx`Polynomials are continuous, so the limit is just the value at $x = ${a}$.`,
              sol: [tx`Substitute: $${b}(${a})^2 ${sgn(c)}(${a}) ${sgn(d)} = ${v}$.`],
            };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['factor', 'diff2', 'diff3']);
            if (kind === 'factor') {
              const a = R.nz(-5, 5); let r; do { r = R.int(-6, 6); } while (r === a);
              return {
                q: tx`Find $\displaystyle\lim_{x\to ${a}} \frac{${poly([1, -(a + r), a * r])}}{x ${sgn(-a)}}$.`,
                ans: { type: 'num', answer: a - r },
                hint: tx`Substituting gives $\frac00$, so $x ${sgn(-a)}$ must be a factor of the numerator. Factor and cancel.`,
                sol: [tx`$${poly([1, -(a + r), a * r])} = (x ${sgn(-a)})(x ${sgn(-r)})$.`, tx`Cancel for $x \ne ${a}$: the expression is $x ${sgn(-r)}$.`, tx`Limit: $${a} ${sgn(-r)} = ${a - r}$.`],
                verify: C.near((((a + 1e-6) - a) * ((a + 1e-6) - r)) / 1e-6, a - r, 1e-4),
              };
            }
            if (kind === 'diff2') {
              const a = R.nz(-6, 6);
              return {
                q: tx`Find $\displaystyle\lim_{x\to ${a}} \frac{x^2 - ${a * a}}{x ${sgn(-a)}}$.`,
                ans: { type: 'num', answer: 2 * a },
                hint: tx`Difference of squares: $x^2 - ${a * a} = (x ${sgn(-a)})(x ${sgn(a)})$.`,
                sol: [tx`$\dfrac{(x ${sgn(-a)})(x ${sgn(a)})}{x ${sgn(-a)}} = x ${sgn(a)}$ for $x\ne${a}$.`, tx`Limit: $${a} ${sgn(a)} = ${2 * a}$.`],
              };
            }
            const a = R.nz(-3, 3);
            return {
              q: tx`Find $\displaystyle\lim_{x\to ${a}} \frac{x^3 ${sgn(-(a ** 3))}}{x ${sgn(-a)}}$.`,
              ans: { type: 'num', answer: 3 * a * a },
              hint: tx`Use $x^3 - c^3 = (x - c)(x^2 + cx + c^2)$ with $c = ${a}$.`,
              sol: [tx`$x^3 ${sgn(-(a ** 3))} = (x ${sgn(-a)})(x^2 ${sgn(a)}x + ${a * a})$.`, tx`Cancel, then substitute: $(${a})^2 + (${a})(${a}) + ${a * a} = ${3 * a * a}$.`],
            };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['inf', 'sin', 'e', 'conj']);
            if (kind === 'inf') {
              const p = R.nz(-6, 7), q = R.int(-5, 5), r = R.nz(1, 8), s = R.int(-5, 5), t = R.int(1, 9);
              return {
                q: tx`Find $\displaystyle\lim_{x\to\infty} \frac{${poly([p, q, t])}}{${poly([r, s, 1])}}$.`,
                ans: { type: 'num', answer: p / r, show: tx`$${AM.frac(p, r)}$` },
                hint: tx`Divide top and bottom by $x^2$, the highest power. Every term with $x$ left in a denominator goes to 0.`,
                sol: [tx`Divide by $x^2$: $\dfrac{${p} ${sgn(q)}/x ${sgn(t)}/x^2}{${r} ${sgn(s)}/x + 1/x^2}$.`, tx`As $x\to\infty$ this tends to $\dfrac{${p}}{${r}} = ${AM.frac(p, r)}$.`],
              };
            }
            if (kind === 'sin') {
              const k = R.nz(-6, 7), m = R.int(1, 5);
              return {
                q: tx`Find $\displaystyle\lim_{x\to 0} \frac{\sin(${k}x)}{${m === 1 ? '' : m}x}$.`,
                ans: { type: 'num', answer: k / m, show: tx`$${AM.frac(k, m)}$` },
                hint: tx`Make the denominator match the inside of the sine: multiply and divide by ${k}.`,
                sol: [tx`$\dfrac{\sin(${k}x)}{${m === 1 ? '' : m}x} = \dfrac{${k}}{${m}}\cdot\dfrac{\sin(${k}x)}{${k}x}$.`, tx`With $u = ${k}x \to 0$, $\dfrac{\sin u}{u}\to 1$, so the limit is $${AM.frac(k, m)}$.`],
                verify: C.near(Math.sin(k * 1e-5) / (m * 1e-5), k / m, 1e-6),
              };
            }
            if (kind === 'e') {
              const k = R.nz(-3, 4);
              return {
                q: tx`Find $\displaystyle\lim_{x\to\infty} \left(1 ${k < 0 ? '-' : '+'} \frac{${Math.abs(k)}}{x}\right)^{x}$. A decimal is fine.`,
                ans: { type: 'num', answer: Math.exp(k), show: tx`$e^{${k}} \approx ${fmt(Math.exp(k), 4)}$` },
                hint: tx`This is the standard limit $\left(1 + \frac{k}{x}\right)^x \to e^k$.`,
                sol: [tx`With $k = ${k}$, $\left(1 + \frac{k}{x}\right)^x \to e^{k}$.`, tx`So the limit is $e^{${k}} \approx ${fmt(Math.exp(k), 4)}$.`],
              };
            }
            const a = R.int(1, 6);
            return {
              q: tx`Find $\displaystyle\lim_{x\to 0} \frac{\sqrt{x + ${a * a}} - ${a}}{x}$.`,
              ans: { type: 'num', answer: 1 / (2 * a), show: tx`$${AM.frac(1, 2 * a)}$` },
              hint: tx`Multiply top and bottom by the conjugate $\sqrt{x + ${a * a}} + ${a}$.`,
              sol: [tx`$\dfrac{(\sqrt{x+${a * a}} - ${a})(\sqrt{x+${a * a}} + ${a})}{x(\sqrt{x+${a * a}} + ${a})} = \dfrac{x}{x(\sqrt{x+${a * a}} + ${a})}$.`, tx`Cancel $x$: $\dfrac{1}{\sqrt{x+${a * a}} + ${a}} \to \dfrac{1}{${2 * a}}$.`],
              verify: C.near((Math.sqrt(1e-7 + a * a) - a) / 1e-7, 1 / (2 * a), 1e-5),
            };
          } },
        ],
      },
      {
        id: 'derivative', title: 'The derivative', minutes: 30,
        summary: 'Slope of the tangent line, instantaneous speed, and the limit behind both.',
        idea: tx`The **derivative** $f'(a)$ measures how fast $f$ is changing at the exact moment $x = a$. Geometrically it's the slope of the tangent line, the line that just grazes the graph there.

You can't get a slope from one point, so you take a second point a small distance $h$ away, compute the slope through both (a **secant** line), and let $h$ shrink to zero. Whatever those slopes approach is the derivative. If $f$ is position, $f'$ is velocity; if $f$ is total cost, $f'$ is the cost of one more unit.`,
        everyday: tx`A trip computer shows your *average* speed: total distance divided by total time. The speedometer shows your *instantaneous* speed. Under the hood it's a secant over a tiny interval, the distance covered in the last fraction of a second divided by that fraction. The derivative is what you'd get in the limit as that fraction goes to zero.`,
        visual: { widget: 'secant', caption: tx`The orange secant passes through two points on the curve, $h$ apart. Press **Shrink h** and watch it rotate onto the dashed tangent line. Drag the pink point to move where you're measuring the slope.` },
        math: tx`**Definition.**
$$f'(a) = \lim_{h\to0}\frac{f(a+h) - f(a)}{h}$$
when the limit exists. Other notations: $\dfrac{df}{dx}$, $\dfrac{d}{dx}f(x)$, and $\dot{x}$ for a time derivative.

**Tangent line** at $x = a$: $\ y = f(a) + f'(a)(x - a)$. Near $a$ this line is also the **linear approximation** $f(x)\approx f(a) + f'(a)(x-a)$.

**Meaning of the sign.** $f'(a) > 0$: increasing. $f'(a) < 0$: decreasing. $f'(a) = 0$: momentarily flat.

**Differentiable implies continuous**, but not the other way round: $|x|$ is continuous at 0 but has a corner there, so no derivative.`,
        example: {
          problem: tx`Use the definition to find $f'(x)$ for $f(x) = x^2$, then the tangent line at $x = 3$.`,
          steps: [
            tx`$\dfrac{f(x+h) - f(x)}{h} = \dfrac{(x+h)^2 - x^2}{h} = \dfrac{x^2 + 2xh + h^2 - x^2}{h}$.`,
            tx`$= \dfrac{2xh + h^2}{h} = 2x + h$ for $h \ne 0$.`,
            tx`Let $h\to0$: $f'(x) = 2x$.`,
            tx`At $x = 3$: $f(3) = 9$ and $f'(3) = 6$, so the tangent line is $y = 9 + 6(x-3) = 6x - 9$.`,
          ],
        },
        pitfalls: [
          tx`$\frac{f(a+h) - f(a)}{h}$ at a fixed $h$ is an *average* rate. The derivative is its limit.`,
          tx`Continuous does not mean differentiable: corners ($|x|$ at 0) and vertical tangents ($\sqrt[3]{x}$ at 0) have no derivative.`,
          tx`Keep track of units. If $f$ is in metres and $x$ in seconds, $f'$ is in metres per second.`,
        ],
        usedIn: tx`Every model of change uses derivatives: velocity, growth rates in differential equations (Module 07), gradients in optimization (Module 14). Finite differences (Module 11) approximate derivatives on a computer using exactly this secant idea.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.nz(-3, 3), b = R.int(-5, 5), c = R.int(-5, 5), x1 = R.int(-3, 2), x2 = x1 + R.int(1, 4);
            const f = (x) => a * x * x + b * x + c, m = (f(x2) - f(x1)) / (x2 - x1);
            return {
              q: tx`Find the average rate of change of $f(x) = ${poly([a, b, c])}$ from $x = ${x1}$ to $x = ${x2}$.`,
              ans: { type: 'num', answer: m },
              hint: tx`Average rate of change $= \dfrac{f(x_2) - f(x_1)}{x_2 - x_1}$: the slope of the secant line.`,
              sol: [tx`$f(${x2}) = ${f(x2)}$ and $f(${x1}) = ${f(x1)}$.`, tx`$\dfrac{${f(x2)} - (${f(x1)})}{${x2} - (${x1})} = \dfrac{${f(x2) - f(x1)}}{${x2 - x1}} = ${fmt(m)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const a = R.nz(-3, 3), b = R.int(-6, 6), c = R.int(-6, 6), k = R.int(-3, 3);
            const fk = a * k * k + b * k + c, d = 2 * a * k + b, icpt = fk - d * k;
            return {
              q: tx`Find the equation of the tangent line to $f(x) = ${poly([a, b, c])}$ at $x = ${k}$. Enter the right-hand side, like <code>3x - 4</code>.`,
              ans: { type: 'fn', expr: `${d}*x + (${icpt})`, show: tx`$y = ${poly([d, icpt])}$`, prefix: '$y =$' },
              hint: tx`You need a point and a slope. The slope is $f'(${k})$, where $f'(x) = ${poly([2 * a, b])}$.`,
              sol: [tx`Point: $f(${k}) = ${fk}$.`, tx`Slope: $f'(x) = ${poly([2 * a, b])}$, so $f'(${k}) = ${d}$.`, tx`$y = ${fk} ${sgn(d)}(x ${sgn(-k)})$, which simplifies to $y = ${poly([d, icpt])}$.`],
            };
          } },
          { level: 3, gen(R) {
            if (R.chance(0.6)) {
              const s = R.int(3, 12), d = R.pick([-3, -2, -1, 1, 2, 3, 4]), N = s * s + d, est = s + d / (2 * s);
              return {
                q: tx`Use a linear approximation of $f(x) = \sqrt{x}$ at $a = ${s * s}$ to estimate $\sqrt{${N}}$. Give 4 decimals or an exact fraction.`,
                ans: { type: 'num', answer: est, tol: 0.0006, show: tx`$${s} ${d < 0 ? '-' : '+'} \frac{${Math.abs(d)}}{${2 * s}} \approx ${fmt(est, 5)}$` },
                hint: tx`$f'(x) = \dfrac{1}{2\sqrt x}$. Then $f(x) \approx f(a) + f'(a)(x - a)$.`,
                sol: [tx`$f(${s * s}) = ${s}$ and $f'(${s * s}) = \dfrac{1}{2\cdot${s}} = \dfrac{1}{${2 * s}}$.`, tx`$\sqrt{${N}} \approx ${s} + \dfrac{1}{${2 * s}}(${d}) \approx ${fmt(est, 5)}$.`, tx`The true value is $${fmt(Math.sqrt(N), 5)}$. The tangent line sits above the concave-down curve, so the estimate is slightly high.`],
              };
            }
            const s = R.int(2, 5), d = R.pick([-4, -2, -1, 1, 2, 3, 5]), N = s ** 3 + d, est = s + d / (3 * s * s);
            return {
              q: tx`Use a linear approximation of $f(x) = \sqrt[3]{x}$ at $a = ${s ** 3}$ to estimate $\sqrt[3]{${N}}$. Give 4 decimals or an exact fraction.`,
              ans: { type: 'num', answer: est, tol: 0.0006, show: tx`$${s} ${d < 0 ? '-' : '+'} \frac{${Math.abs(d)}}{${3 * s * s}} \approx ${fmt(est, 5)}$` },
              hint: tx`$f'(x) = \dfrac{1}{3}x^{-2/3}$, so $f'(${s ** 3}) = \dfrac{1}{3\cdot ${s * s}}$.`,
              sol: [tx`$f(${s ** 3}) = ${s}$ and $f'(${s ** 3}) = \dfrac{1}{${3 * s * s}}$.`, tx`$\sqrt[3]{${N}} \approx ${s} + \dfrac{${d}}{${3 * s * s}} \approx ${fmt(est, 5)}$ (true value $${fmt(Math.cbrt(N), 5)}$).`],
            };
          } },
        ],
      },
      {
        id: 'rules', title: 'Derivative rules and the chain rule', minutes: 35,
        summary: 'Power, product, quotient and chain rules, so you never need the limit again.',
        idea: tx`Computing every derivative from the limit definition would be exhausting, so we use rules proved once from it. The **power rule** handles $x^n$. The **product** and **quotient rules** handle functions multiplied or divided. The **chain rule** handles functions inside functions, which describes most real formulas.

The chain rule says rates multiply. If $y$ changes 3 times as fast as $u$, and $u$ changes 2 times as fast as $x$, then $y$ changes $3\times 2 = 6$ times as fast as $x$.`,
        everyday: tx`On a bike, the pedals turn the front gear, the chain turns the back gear, and the back gear turns the wheel. If the wheel turns 3 times per back-gear turn and the back gear turns 2 times per pedal turn, the wheel turns 6 times per pedal turn. That multiplication of rates is the chain rule.

The product rule shows up in revenue = price × quantity. When both change, revenue changes by (change in price) × quantity + price × (change in quantity).`,
        visual: { widget: 'derivgraph', caption: tx`Drag the pink point along either graph. The height of the bottom curve equals the slope of the top curve at the same $x$. Where the top graph peaks or bottoms out, the bottom graph crosses zero.` },
        math: tx`**Basic derivatives.**
$$\frac{d}{dx}x^n = nx^{n-1},\quad \frac{d}{dx}e^x = e^x,\quad \frac{d}{dx}\ln x = \frac1x,\quad \frac{d}{dx}\sin x = \cos x,\quad \frac{d}{dx}\cos x = -\sin x.$$

**Rules.**
$$(cf)' = cf', \qquad (f+g)' = f' + g'$$
$$(fg)' = f'g + fg' \ \text{(product)}, \qquad \left(\frac fg\right)' = \frac{f'g - fg'}{g^2}\ \text{(quotient)}$$
$$\big(f(g(x))\big)' = f'\big(g(x)\big)\,g'(x)\ \text{(chain)}, \qquad \frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx}.$$

**Higher derivatives.** $f''$ is the derivative of $f'$. If $f$ is position, $f''$ is acceleration. $f''>0$ means the graph is concave up, cupped like a bowl.`,
        example: {
          problem: tx`Differentiate $f(x) = x^2 e^{3x}$.`,
          steps: [
            tx`It's a product: $f = u\cdot v$ with $u = x^2$ and $v = e^{3x}$.`,
            tx`$u' = 2x$. For $v$, use the chain rule with inner function $3x$: $v' = e^{3x}\cdot 3$.`,
            tx`Product rule: $f' = u'v + uv' = 2x e^{3x} + 3x^2 e^{3x}$.`,
            tx`Factor: $f'(x) = x e^{3x}(3x + 2)$.`,
          ],
        },
        pitfalls: [
          tx`$(fg)' \ne f'g'$. The product rule has two terms.`,
          tx`Don't drop the inner derivative: $\frac{d}{dx}\sin(5x) = 5\cos(5x)$, not $\cos(5x)$.`,
          tx`$\frac{d}{dx}e^{x^2} = 2xe^{x^2}$, but $\frac{d}{dx}x^e = e\,x^{e-1}$, because there $e$ is just a constant exponent.`,
        ],
        usedIn: tx`The chain rule is the engine of backpropagation in neural networks, of substitution in integrals (Module 04) and of changes of variables in PDEs (Module 13). Multivariable calculus (Module 06) extends it to gradients.`,
        practice: [
          { level: 1, gen(R) {
            const n = R.int(3, 6), m = R.int(2, n - 1), a = R.nz(-5, 6), b = R.nz(-5, 5), c = R.int(-7, 7), d = R.int(-9, 9);
            const fexpr = `${a}*x^${n} + (${b})*x^${m} + (${c})*x + (${d})`, dexpr = `${a * n}*x^${n - 1} + (${b * m})*x^${m - 1} + (${c})`;
            const ftex = poly([a, ...Array(n - m - 1).fill(0), b, ...Array(m - 2).fill(0), c, d]);
            return {
              q: tx`Differentiate $f(x) = ${ftex}$.`,
              ans: { type: 'fn', expr: dexpr, prefix: "$f'(x) =$" },
              hint: tx`Power rule on each term: $\frac{d}{dx}ax^n = anx^{n-1}$. Constants differentiate to 0.`,
              sol: [tx`$\frac{d}{dx}\left(${a === 1 ? '' : a === -1 ? '-' : a}x^{${n}}\right) = ${a * n}x^{${n - 1}}$ and $\frac{d}{dx}\left(${b === 1 ? '' : b === -1 ? '-' : b}x^{${m}}\right) = ${b * m}x^{${m - 1}}$.`, tx`$f'(x) = ${poly([a * n, ...Array(n - m - 1).fill(0), b * m, ...Array(m - 2).fill(0), c])}$.`],
              verify: C.deriv(fexpr, dexpr),
            };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['sin', 'expsq', 'pow', 'prod', 'ln']);
            let f, d, ftex, dtex, steps, dom = [-2, 2];
            if (kind === 'sin') { const a = R.nz(-5, 5), b = R.nz(-4, 5); f = `${a}*sin(${b}x)`; d = `${a * b}*cos(${b}x)`; ftex = tx`${a === 1 ? '' : a === -1 ? '-' : a}\sin(${b}x)`; dtex = tx`${a * b}\cos(${b}x)`; steps = [tx`Chain rule with inner $u = ${b}x$, $u' = ${b}$.`, tx`$f'(x) = ${a}\cos(${b}x)\cdot ${b} = ${dtex}$.`]; }
            else if (kind === 'expsq') { const a = R.nz(-3, 3); f = `exp(${a}x^2)`; d = `${2 * a}*x*exp(${a}x^2)`; ftex = tx`e^{${a}x^2}`; dtex = tx`${2 * a}x\,e^{${a}x^2}`; steps = [tx`Chain rule: outer $e^u$, inner $u = ${a}x^2$ with $u' = ${2 * a}x$.`, tx`$f'(x) = e^{${a}x^2}\cdot ${2 * a}x$.`]; }
            else if (kind === 'pow') { const a = R.nz(-4, 4), b = R.int(-5, 5), n = R.int(3, 6); dom = [(-b - 1.5) / a, (-b + 1.5) / a].sort((p, q) => p - q); f = `(${a}x + (${b}))^${n}`; d = `${n * a}*(${a}x + (${b}))^${n - 1}`; ftex = tx`(${poly([a, b])})^{${n}}`; dtex = tx`${n * a}(${poly([a, b])})^{${n - 1}}`; steps = [tx`Chain rule: bring down the power, then multiply by the inner derivative ${a}.`, tx`$f'(x) = ${n}(${poly([a, b])})^{${n - 1}}\cdot ${a} = ${dtex}$.`]; }
            else if (kind === 'prod') {
              const n = R.int(1, 4), a = R.nz(-3, 3), xp = (k) => (k === 0 ? '' : k === 1 ? 'x' : `x^{${k}}`);
              f = `x^${n}*exp(${a}x)`; d = `${n}*x^${n - 1}*exp(${a}x) + (${a})*x^${n}*exp(${a}x)`;
              ftex = tx`${xp(n)}e^{${a}x}`;
              dtex = tx`${n === 1 ? '' : n}${xp(n - 1)}e^{${a}x} ${a < 0 ? '-' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}${xp(n)}e^{${a}x}`;
              steps = [tx`Product rule with $u = ${xp(n)}$, $v = e^{${a}x}$: $u' = ${n === 1 ? '1' : `${n}${xp(n - 1)}`}$, $v' = ${a}e^{${a}x}$.`, tx`$f'(x) = u'v + uv' = ${dtex}$.`];
            }
            else { const a = R.int(1, 5), b = R.int(1, 9); f = `ln(${a}x^2 + ${b})`; d = `${2 * a}x/(${a}x^2 + ${b})`; ftex = tx`\ln(${a === 1 ? '' : a}x^2 + ${b})`; dtex = tx`\dfrac{${2 * a}x}{${a === 1 ? '' : a}x^2 + ${b}}`; steps = [tx`$\frac{d}{dx}\ln u = \frac{u'}{u}$ with $u = ${a === 1 ? '' : a}x^2 + ${b}$, $u' = ${2 * a}x$.`, tx`$f'(x) = ${dtex}$.`]; }
            return {
              q: tx`Differentiate $f(x) = ${ftex}$.`,
              ans: { type: 'fn', expr: d, prefix: "$f'(x) =$", show: `$${dtex}$`, domain: dom },
              hint: kind === 'prod' ? tx`It's a product: $(uv)' = u'v + uv'$, and $e^{ax}$ needs the chain rule.` : tx`Identify the outer and inner functions. Differentiate the outer, keep the inside, then multiply by the inner derivative.`,
              sol: steps,
              verify: C.deriv(f, d, dom),
            };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['quot', 'sinsq', 'ratsq', 'expsin', 'sqrt']);
            let f, d, ftex, dtex, steps;
            if (kind === 'quot') {
              let a, b, c, dd; do { a = R.nz(-4, 4); b = R.int(-5, 5); c = R.nz(-3, 3); dd = R.int(-5, 5); } while (a * dd - b * c === 0);
              f = `(${a}x + (${b}))/(${c}x + (${dd}))`; d = `${a * dd - b * c}/(${c}x + (${dd}))^2`; ftex = tx`\dfrac{${poly([a, b])}}{${poly([c, dd])}}`; dtex = tx`\dfrac{${a * dd - b * c}}{(${poly([c, dd])})^2}`;
              steps = [tx`Quotient rule: $\dfrac{(${a})(${poly([c, dd])}) - (${poly([a, b])})(${c})}{(${poly([c, dd])})^2}$.`, tx`The $x$ terms cancel in the numerator: $${a}\cdot${dd} - ${b}\cdot${c} = ${a * dd - b * c}$. So $f'(x) = ${dtex}$.`];
            } else if (kind === 'sinsq') {
              const a = R.nz(-4, 4); f = `sin(${a}x)^2`; d = `${2 * a}*sin(${a}x)*cos(${a}x)`; ftex = tx`\sin^2(${a}x)`; dtex = tx`${2 * a}\sin(${a}x)\cos(${a}x)`;
              steps = [tx`Two layers of chain rule: $(\sin u)^2$ with $u = ${a}x$.`, tx`$2\sin(${a}x)\cdot\cos(${a}x)\cdot ${a} = ${dtex}$ (which also equals $${a}\sin(${2 * a}x)$).`];
            } else if (kind === 'ratsq') {
              const a = R.int(1, 9); f = `x^2/(x^2 + ${a})`; d = `${2 * a}x/(x^2 + ${a})^2`; ftex = tx`\dfrac{x^2}{x^2 + ${a}}`; dtex = tx`\dfrac{${2 * a}x}{(x^2 + ${a})^2}`;
              steps = [tx`Quotient rule: $\dfrac{2x(x^2 + ${a}) - x^2(2x)}{(x^2 + ${a})^2}$.`, tx`The $2x^3$ terms cancel, leaving $${dtex}$.`];
            } else if (kind === 'expsin') {
              const a = R.nz(-3, 3), b = R.nz(-4, 4); f = `exp(${a}x)*sin(${b}x)`; d = `exp(${a}x)*((${a})*sin(${b}x) + (${b})*cos(${b}x))`; ftex = tx`e^{${a}x}\sin(${b}x)`; dtex = tx`e^{${a}x}\left(${a}\sin(${b}x) ${sgn(b)}\cos(${b}x)\right)`;
              steps = [tx`Product rule: $(e^{${a}x})' = ${a}e^{${a}x}$ and $(\sin ${b}x)' = ${b}\cos ${b}x$.`, tx`$f'(x) = ${a}e^{${a}x}\sin(${b}x) + e^{${a}x}\cdot ${b}\cos(${b}x) = ${dtex}$.`];
            } else {
              const a = R.int(1, 16); f = `sqrt(x^2 + ${a})`; d = `x/sqrt(x^2 + ${a})`; ftex = tx`\sqrt{x^2 + ${a}}`; dtex = tx`\dfrac{x}{\sqrt{x^2 + ${a}}}`;
              steps = [tx`Write it as $(x^2 + ${a})^{1/2}$. Chain rule: $\tfrac12(x^2+${a})^{-1/2}\cdot 2x$.`, tx`Simplify: $${dtex}$.`];
            }
            return {
              q: tx`Differentiate $f(x) = ${ftex}$.`,
              ans: { type: 'fn', expr: d, prefix: "$f'(x) =$", show: `$${dtex}$` },
              hint: tx`Decide the outermost structure first (quotient? product? power of something?) and apply that rule, using the chain rule for each inner piece.`,
              sol: steps,
              verify: C.deriv(f, d),
            };
          } },
        ],
      },
      {
        id: 'optimization', title: 'Optimization', minutes: 35,
        summary: 'Where the derivative is zero, things are biggest or smallest.',
        idea: tx`At the top of a hill or the bottom of a valley the ground is momentarily flat, so the derivative is zero. That gives a recipe for finding the best value of anything you can write as a function: differentiate, set the derivative to zero, solve. The solutions are **critical points**.

The **second derivative** then says whether each one is a peak ($f'' < 0$, curving down) or a valley ($f'' > 0$, curving up). On a closed interval, also check the endpoints, because sometimes the best value sits at an edge.`,
        everyday: tx`A farmer has 100 m of fence for a rectangular pen against a barn wall, which forms one side. Too narrow and the pen is a long thin strip; too wide and it's very shallow. Somewhere in between the area peaks, and calculus finds exactly where: the sides perpendicular to the wall should be 25 m.

The same logic sets prices to maximize profit, shapes cans to use the least metal, and tunes a model's parameters to minimize its error.`,
        visual: { widget: 'boxopt', caption: tx`Cut equal squares from the corners of a sheet and fold up the sides to make an open box. Drag the cut size and watch the volume rise then fall. The green line marks where $V'(x) = 0$. Change the sheet size: the best cut is always one-sixth of the side.` },
        math: tx`**Critical points.** $c$ is critical if $f'(c) = 0$ or $f'(c)$ is undefined.

**First derivative test.** If $f'$ changes from $+$ to $-$ at $c$, it's a local max; from $-$ to $+$, a local min.

**Second derivative test.** If $f'(c) = 0$ and $f''(c) < 0$: local max. If $f''(c) > 0$: local min. If $f''(c) = 0$ the test says nothing.

**Closed interval method.** The absolute max and min of a continuous $f$ on $[a,b]$ occur at critical points or at the endpoints $a$, $b$. Evaluate $f$ at all of them and compare.

**Word-problem recipe.** Name what you're optimizing, use the constraint to write it as a function of one variable, find critical points, and check the answer makes physical sense.`,
        example: {
          problem: tx`With 100 m of fence and a barn wall as one side, what dimensions maximize the area of a rectangular pen?`,
          steps: [
            tx`Let $x$ be each side perpendicular to the wall. The side parallel to the wall is $100 - 2x$, so the area is $A(x) = x(100 - 2x) = 100x - 2x^2$ for $0 < x < 50$.`,
            tx`$A'(x) = 100 - 4x$. Setting $A'(x) = 0$ gives $x = 25$.`,
            tx`$A''(x) = -4 < 0$, so this is a maximum.`,
            tx`Dimensions: 25 m by 50 m, with area $1250\text{ m}^2$.`,
          ],
        },
        pitfalls: [
          tx`$f'(c) = 0$ doesn't guarantee a max or min: $x^3$ is flat at 0 but keeps increasing.`,
          tx`Forgetting endpoints. On $[a, b]$ the extreme value can sit at an edge where $f' \ne 0$.`,
          tx`Optimize the right quantity. Say in words what you're maximizing before writing any formula.`,
        ],
        usedIn: tx`This is the one-variable case of everything in Module 14: gradient descent, Lagrange multipliers and linear programming. Fitting a model by least squares (Module 05) means minimizing an error function.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.nz(-4, 4), h = R.int(-5, 5), b = -2 * a * h, c = R.int(-8, 8);
            return {
              q: tx`Find the $x$-coordinate of the critical point of $f(x) = ${poly([a, b, c])}$. Is it a maximum or a minimum? (Enter just the $x$-value.)`,
              ans: { type: 'num', answer: h },
              hint: tx`Solve $f'(x) = ${poly([2 * a, b])} = 0$.`,
              sol: [tx`$f'(x) = ${poly([2 * a, b])} = 0$ gives $x = ${h}$.`, tx`$f''(x) = ${2 * a} ${a > 0 ? '> 0' : '< 0'}$, so it's a ${a > 0 ? 'minimum' : 'maximum'}.`],
            };
          } },
          { level: 2, gen(R) {
            let r1, r2; do { r1 = R.int(-4, 4); r2 = R.int(-4, 4); } while (r1 === r2 || (r1 + r2) % 2 !== 0);
            const lo = Math.min(r1, r2), hi = Math.max(r1, r2), wantMax = R.chance(0.5), c = R.int(-5, 5);
            const B = (-3 * (r1 + r2)) / 2, Cc = 3 * r1 * r2;
            return {
              q: tx`Find the $x$-coordinate of the local ${wantMax ? 'maximum' : 'minimum'} of $f(x) = ${poly([1, B, Cc, c])}$.`,
              ans: { type: 'num', answer: wantMax ? lo : hi },
              hint: tx`Factor $f'(x) = 3x^2 ${sgn(2 * B)}x ${sgn(Cc)}$ (take out the 3 first), then use the second derivative $f''(x) = 6x ${sgn(2 * B)}$.`,
              sol: [tx`$f'(x) = ${poly([3, 2 * B, Cc])} = 3(x ${sgn(-r1)})(x ${sgn(-r2)})$, so the critical points are $x = ${lo}$ and $x = ${hi}$.`, tx`$f''(${lo}) = ${6 * lo + 2 * B} < 0$: local max at $x = ${lo}$. $f''(${hi}) = ${6 * hi + 2 * B} > 0$: local min at $x = ${hi}$.`],
            };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['pen', 'box', 'can']);
            if (kind === 'pen') {
              const P = R.int(4, 30) * 10;
              return {
                q: tx`A rectangular pen uses a long wall as one side and ${P} m of fence for the other three. What is the largest possible area, in m²?`,
                ans: { type: 'num', answer: (P * P) / 8 },
                hint: tx`With $x$ the sides perpendicular to the wall, the area is $A(x) = x(${P} - 2x)$.`,
                sol: [tx`$A(x) = ${P}x - 2x^2$, so $A'(x) = ${P} - 4x = 0$ at $x = ${P / 4}$.`, tx`$A''(x) = -4 < 0$: a maximum. $A = ${P / 4}\cdot ${P / 2} = ${(P * P) / 8}$ m².`],
              };
            }
            if (kind === 'box') {
              const L = R.int(3, 15) * 2, x = L / 6, V = x * (L - 2 * x) ** 2;
              return {
                q: tx`Equal squares are cut from the corners of a ${L} cm square sheet and the sides folded up into an open box. What is the maximum volume, in cm³? (2 decimals)`,
                ans: { type: 'num', answer: V, tol: 0.02 },
                hint: tx`$V(x) = x(${L} - 2x)^2$. Differentiate with the product and chain rules.`,
                sol: [tx`$V'(x) = (${L} - 2x)^2 - 4x(${L} - 2x) = (${L} - 2x)(${L} - 6x)$.`, tx`Critical points $x = ${L / 2}$ (no box) and $x = ${fmt(x, 4)}$.`, tx`$V(${fmt(x, 4)}) = ${fmt(x, 4)}\cdot(${fmt(L - 2 * x, 4)})^2 \approx ${fmt(V, 3)}$ cm³.`],
                verify: C.near(V, (2 * L ** 3) / 27, 1e-9),
              };
            }
            const Vol = R.pick([250, 330, 355, 500, 750, 1000]), r = Math.cbrt(Vol / (2 * Math.PI));
            return {
              q: tx`A closed cylindrical can must hold ${Vol} cm³. What radius (in cm) minimizes the metal used, i.e. the surface area? (2 decimals)`,
              ans: { type: 'num', answer: r, tol: 0.01 },
              hint: tx`Use $V = \pi r^2 h = ${Vol}$ to write $h$ in terms of $r$, then minimize $S = 2\pi r^2 + 2\pi r h$.`,
              sol: [tx`$h = \dfrac{${Vol}}{\pi r^2}$, so $S(r) = 2\pi r^2 + \dfrac{${2 * Vol}}{r}$.`, tx`$S'(r) = 4\pi r - \dfrac{${2 * Vol}}{r^2} = 0$ gives $r^3 = \dfrac{${Vol}}{2\pi}$.`, tx`$r = \sqrt[3]{${Vol}/(2\pi)} \approx ${fmt(r, 3)}$ cm. (At this radius the height equals the diameter.)`],
              verify: C.near(4 * Math.PI * r - (2 * Vol) / (r * r), 0, 1e-9),
            };
          } },
        ],
      },
    ],
  });
})();
