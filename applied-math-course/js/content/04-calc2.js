/* Module 04 — Calculus II: integrals and series (Stage 1). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, sgn = AM.sgn, poly = AM.poly, C = AM.checks, M = AM.m;

  AM.module({
    id: 'calc2', stage: 1, title: 'Calculus II: Accumulation', aka: 'Calculus II (Integral Calculus and Series)',
    blurb: 'The second half of calculus runs the first half backwards. Integrals add up rates to get totals; the Fundamental Theorem links them to derivatives; series build complicated functions out of simple polynomial pieces.',
    prereq: ['calc1'],
    lessons: [
      {
        id: 'riemann', title: 'Area and Riemann sums', minutes: 30,
        summary: 'Adding up thin rectangles, and what happens as they get thinner.',
        idea: tx`How do you find the area under a curve? Slice it into thin vertical strips, treat each strip as a rectangle, and add up the rectangles. That's a **Riemann sum**. With a few wide rectangles the estimate is rough; with many thin ones it's excellent. The **definite integral** $\int_a^b f(x)\,dx$ is the exact value these sums approach as the strips get infinitely thin.

Area is only the picture. An integral adds up anything that accumulates: distance from speed, total rainfall from rainfall rate, total cost from cost per unit.`,
        everyday: tx`Your speedometer reads 50, 62, 70 and 55 km/h at the start of four 15-minute stretches. To estimate distance, treat each speed as constant for its quarter hour: $50(0.25) + 62(0.25) + 70(0.25) + 55(0.25) = 59.25$ km. That's a left Riemann sum. Read the speed more often and the estimate improves. The exact distance is the integral of speed over time.`,
        visual: { widget: 'riemann', caption: tx`Increase $n$ and watch the error shrink. Compare Left, Right and Midpoint at the same $n$: the midpoint rule is usually far more accurate. Try $\sin x$ with only 2 midpoint rectangles.` },
        math: tx`**Riemann sums.** Split $[a,b]$ into $n$ strips of width $\Delta x = \dfrac{b-a}{n}$, with points $x_i = a + i\,\Delta x$. Then
$$L_n = \sum_{i=0}^{n-1} f(x_i)\,\Delta x, \qquad R_n = \sum_{i=1}^{n} f(x_i)\,\Delta x, \qquad M_n = \sum_{i=0}^{n-1} f\!\left(\tfrac{x_i + x_{i+1}}{2}\right)\Delta x.$$

**Definite integral.** $\displaystyle\int_a^b f(x)\,dx = \lim_{n\to\infty}\sum_{i=1}^n f(x_i)\,\Delta x$.

**Signed area.** Regions below the $x$-axis count as negative.

**Properties.** $\int_a^b (f+g) = \int_a^b f + \int_a^b g$, $\ \int_a^b cf = c\int_a^b f$, $\ \int_a^c f = \int_a^b f + \int_b^c f$, $\ \int_b^a f = -\int_a^b f$.`,
        example: {
          problem: tx`Estimate $\int_0^2 x^2\,dx$ with a right Riemann sum and $n = 4$, and compare with the exact value $8/3$.`,
          steps: [
            tx`$\Delta x = \frac{2-0}{4} = 0.5$. The right endpoints are $0.5, 1, 1.5, 2$.`,
            tx`Heights: $0.25,\ 1,\ 2.25,\ 4$, which add to $7.5$.`,
            tx`$R_4 = 7.5 \times 0.5 = 3.75$.`,
            tx`The exact area is $8/3 \approx 2.667$. $R_4$ overestimates because $x^2$ is increasing, so each right endpoint is the tallest point of its strip.`,
          ],
        },
        pitfalls: [
          tx`$n$ rectangles use $n$ heights, not $n+1$. Left sums skip the last point; right sums skip the first.`,
          tx`The integral is *signed* area: $\int_0^{2\pi}\sin x\,dx = 0$ even though the curve encloses area.`,
          tx`$dx$ is not decoration. It says which variable is being summed, and it becomes $\Delta x$ in the sum.`,
        ],
        usedIn: tx`Numerical integration (Module 11) is Riemann sums done carefully. Probabilities for continuous random variables (Module 08) are integrals of densities. Double and triple integrals (Module 06) use the same slicing in more dimensions.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.int(-1, 1), w = R.pick([1, 2]), n = R.int(2, 5), b = a + w * n, left = R.chance(0.5);
            const p = R.int(1, 3), c = R.int(-2, 4), f = (x) => p * x * x + c;
            const xs = Array.from({ length: n }, (_, i) => a + (left ? i : i + 1) * w), hs = xs.map(f), sum = hs.reduce((s, v) => s + v, 0) * w;
            return {
              q: tx`Estimate $\displaystyle\int_{${a}}^{${b}} (${poly([p, 0, c])})\,dx$ using a **${left ? 'left' : 'right'}** Riemann sum with $n = ${n}$.`,
              ans: { type: 'num', answer: sum },
              hint: tx`$\Delta x = \frac{${b} - (${a})}{${n}} = ${w}$. Use the ${left ? 'left' : 'right'} endpoint of each strip.`,
              sol: [tx`$\Delta x = ${w}$; ${left ? 'left' : 'right'} endpoints $${xs.join(', ')}$.`, tx`Heights: $${hs.join(', ')}$, which add to $${hs.reduce((s, v) => s + v, 0)}$.`, tx`Sum $= ${hs.reduce((s, v) => s + v, 0)} \times ${w} = ${sum}$.`],
            };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['x3', 'recip', 'sq']), n = R.pick([2, 4]), w = R.pick([2, 4]);
            const [f, ftex, a] = kind === 'x3' ? [(x) => x ** 3, 'x^3', R.int(0, 1)] : kind === 'recip' ? [(x) => 1 / x, '\\frac{1}{x}', R.int(1, 3)] : [(x) => x * x + 1, 'x^2 + 1', R.int(-1, 2)];
            const b = a + w;
            const dx = (b - a) / n, mids = Array.from({ length: n }, (_, i) => a + (i + 0.5) * dx), sum = mids.reduce((s, x) => s + f(x), 0) * dx, exact = M.integrate(f, a, b);
            return {
              q: tx`Estimate $\displaystyle\int_{${a}}^{${b}} ${ftex}\,dx$ with the **midpoint rule** and $n = ${n}$. Give 3 decimals.`,
              ans: { type: 'num', answer: sum, tol: 0.002 },
              hint: tx`$\Delta x = ${dx}$. The midpoints are halfway between consecutive grid points: start at $${mids[0]}$.`,
              sol: [tx`Midpoints: $${mids.join(', ')}$.`, tx`$M_4 = ${dx}\left(${mids.map((x) => fmt(f(x), 4)).join(' + ')}\right) \approx ${fmt(sum, 4)}$.`, tx`The exact value is $${fmt(exact, 4)}$, so the midpoint rule is off by only $${fmt(Math.abs(sum - exact), 4)}$.`],
            };
          } },
          { level: 3, gen(R) {
            const k = R.int(1, 3), a = R.int(0, 2), w = R.int(1, 3), b = a + w, val = (b ** (k + 1) - a ** (k + 1)) / (k + 1);
            const inner = a === 0 ? tx`\frac{${w}i}{n}` : tx`${a} + \frac{${w}i}{n}`;
            return {
              q: tx`Evaluate $$\lim_{n\to\infty}\sum_{i=1}^{n}\left(${inner}\right)^{${k}}\frac{${w}}{n}$$ by recognizing it as a definite integral.`,
              ans: { type: 'num', answer: val, show: tx`$${AM.frac(b ** (k + 1) - a ** (k + 1), k + 1)}$` },
              hint: tx`Match it to $\sum f(x_i)\Delta x$: here $\Delta x = \frac{${w}}{n}$ and $x_i = ${a} + i\,\Delta x$, so the interval starts at ${a} and has width ${w}.`,
              sol: [tx`$\Delta x = \frac{${w}}{n}$ and $x_i = ${inner}$ run from $${a}$ to $${b}$, with $f(x) = x^{${k}}$.`, tx`So the limit is $\displaystyle\int_{${a}}^{${b}} x^{${k}}\,dx = \left[\frac{x^{${k + 1}}}{${k + 1}}\right]_{${a}}^{${b}} = \frac{${b ** (k + 1)} - ${a ** (k + 1)}}{${k + 1}} = ${AM.frac(b ** (k + 1) - a ** (k + 1), k + 1)}$.`],
              verify: C.integral((x) => x ** k, a, b, val),
            };
          } },
        ],
      },
      {
        id: 'ftc', title: 'The Fundamental Theorem of Calculus', minutes: 30,
        summary: 'Why integrals and derivatives undo each other.',
        idea: tx`Integrals add up accumulation; derivatives measure rates. The **Fundamental Theorem of Calculus** says they are inverse operations. If $A(x)$ is the area under $f$ from a fixed start up to $x$, then the rate at which that area grows is the height of the curve at $x$: $A'(x) = f(x)$.

That gives a shortcut to exact areas. Instead of adding infinitely many rectangles, find any function $F$ whose derivative is $f$ (an **antiderivative**). The total from $a$ to $b$ is just $F(b) - F(a)$.`,
        everyday: tx`A water meter shows total litres used; a flow gauge shows litres per minute. If you read the meter at 9:00 and 9:30, the water used in between is the difference of the readings, with no need to know the flow at every moment. That's $\int_a^b f = F(b) - F(a)$: the meter reading $F$ is an antiderivative of the flow rate $f$.

And the speed at which the meter's number is climbing right now *is* the current flow. That's $A'(x) = f(x)$.`,
        visual: { widget: 'accumulate', caption: tx`Drag the pink handle to sweep out area under the top curve. The bottom graph records the running total. Notice the orange tangent on the bottom graph: its slope always equals the height of the top curve at the same point.` },
        math: tx`**FTC, part 1.** If $f$ is continuous and $A(x) = \displaystyle\int_a^x f(t)\,dt$, then $A'(x) = f(x)$.

**FTC, part 2.** If $F' = f$ on $[a,b]$, then
$$\int_a^b f(x)\,dx = F(b) - F(a) = \Big[F(x)\Big]_a^b.$$

**Antiderivatives** (add $+C$ for an indefinite integral):
$$\int x^n dx = \frac{x^{n+1}}{n+1}\ (n\ne-1),\quad \int\frac{dx}{x} = \ln|x|,\quad \int e^{kx}dx = \frac{e^{kx}}{k},\quad \int\sin x\,dx = -\cos x,\quad \int\cos x\,dx = \sin x.$$

**With the chain rule:** $\dfrac{d}{dx}\displaystyle\int_a^{g(x)} f(t)\,dt = f\big(g(x)\big)\,g'(x)$.`,
        example: {
          problem: tx`Compute $\displaystyle\int_1^3 (3x^2 - 2x)\,dx$.`,
          steps: [
            tx`Find an antiderivative: $F(x) = x^3 - x^2$. Check: $F'(x) = 3x^2 - 2x$.`,
            tx`$F(3) = 27 - 9 = 18$ and $F(1) = 1 - 1 = 0$.`,
            tx`$\int_1^3 (3x^2 - 2x)\,dx = 18 - 0 = 18$.`,
          ],
        },
        pitfalls: [
          tx`Indefinite integrals need $+C$; definite integrals don't, because the $C$ cancels in $F(b) - F(a)$.`,
          tx`$\int \frac{1}{x^2}dx = -\frac1x + C$, not $\ln(x^2)$. The power rule works for every power except $-1$.`,
          tx`It's $F(b) - F(a)$: top limit minus bottom limit.`,
        ],
        usedIn: tx`Solving differential equations (Module 07) is integration. Expected values in probability (Module 08) are integrals. The divergence theorem and Stokes' theorem (Module 06) are higher-dimensional Fundamental Theorems: total change inside equals what crosses the boundary.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.int(-3, 3), b = R.int(-4, 4), c = R.int(-5, 5), p = R.int(-2, 1), q = p + R.int(1, 3);
            const F = (x) => (a * x ** 3) / 3 + (b * x * x) / 2 + c * x, val = F(q) - F(p);
            return {
              q: tx`Compute $\displaystyle\int_{${p}}^{${q}} (${poly([a, b, c])})\,dx$.`,
              ans: { type: 'num', answer: val, abs: 1e-6, show: tx`$${AM.frac(Math.round(val * 6), 6)}$` },
              hint: tx`Antiderivative term by term: $\int x^n\,dx = \frac{x^{n+1}}{n+1}$.`,
              sol: [tx`$F(x) = \frac{${a}}{3}x^3 + \frac{${b}}{2}x^2 ${sgn(c)}x$.`, tx`$F(${q}) = ${fmt(F(q), 4)}$ and $F(${p}) = ${fmt(F(p), 4)}$.`, tx`Difference: $${fmt(val, 4)}$.`],
              verify: C.integral((x) => a * x * x + b * x + c, p, q, val),
            };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['exp', 'sin', 'recip', 'cos']);
            if (kind === 'exp') {
              const k = R.pick([1, 2, 3, -1, -2]), L = R.pick([1, 2]), val = (Math.exp(k * L) - 1) / k;
              return {
                q: tx`Compute $\displaystyle\int_0^{${L}} e^{${k}x}\,dx$. Give 3 decimals.`,
                ans: { type: 'num', answer: val, tol: 0.002 },
                hint: tx`$\int e^{kx}dx = \frac{e^{kx}}{k}$.`,
                sol: [tx`$\left[\frac{e^{${k}x}}{${k}}\right]_0^{${L}} = \frac{e^{${k * L}} - 1}{${k}} \approx ${fmt(val, 4)}$.`],
                verify: C.integral((x) => Math.exp(k * x), 0, L, val),
              };
            }
            if (kind === 'sin') {
              const A = R.int(1, 6), b = R.pick([1, 2, 3]), val = (2 * A) / b;
              return {
                q: tx`Compute $\displaystyle\int_0^{\pi/${b === 1 ? '1' : b}} ${A === 1 ? '' : A}\sin(${b === 1 ? '' : b}x)\,dx$.`.replace('\\pi/1', '\\pi'),
                ans: { type: 'num', answer: val, show: tx`$${AM.frac(2 * A, b)}$` },
                hint: tx`$\int\sin(bx)\,dx = -\frac{\cos(bx)}{b}$.`,
                sol: [tx`$\left[-\frac{${A}}{${b}}\cos(${b}x)\right]_0^{\pi/${b}} = -\frac{${A}}{${b}}(\cos\pi - \cos 0) = -\frac{${A}}{${b}}(-2)$.`, tx`$= ${AM.frac(2 * A, b)}$.`],
                verify: C.integral((x) => A * Math.sin(b * x), 0, Math.PI / b, val),
              };
            }
            if (kind === 'cos') {
              const A = R.int(1, 6), val = A;
              return {
                q: tx`Compute $\displaystyle\int_0^{\pi/2} ${A === 1 ? '' : A}\cos x\,dx$.`,
                ans: { type: 'num', answer: val },
                hint: tx`$\int\cos x\,dx = \sin x$.`,
                sol: [tx`$\left[${A}\sin x\right]_0^{\pi/2} = ${A}(1 - 0) = ${A}$.`],
                verify: C.integral((x) => A * Math.cos(x), 0, Math.PI / 2, val),
              };
            }
            const k = R.int(1, 4), A = R.int(1, 5);
            return {
              q: tx`Compute $\displaystyle\int_1^{e^{${k}}} \frac{${A}}{x}\,dx$.`,
              ans: { type: 'num', answer: A * k },
              hint: tx`$\int\frac{1}{x}dx = \ln|x|$, and $\ln(e^{${k}}) = ${k}$.`,
              sol: [tx`$\left[${A}\ln x\right]_1^{e^{${k}}} = ${A}(${k} - 0) = ${A * k}$.`],
              verify: C.integral((x) => A / x, 1, Math.exp(k), A * k),
            };
          } },
          { level: 3, gen(R) {
            const fk = R.pick(['poly', 'sin', 'exp']), gk = R.pick(['sq', 'cube', 'lin']), m = R.int(2, 4), c = R.int(1, 5);
            const g = { sq: ['x^2', 'x^2', '2x', '2*x'], cube: ['x^3', 'x^3', '3x^2', '3*x^2'], lin: [`${m}x`, `${m}*x`, `${m}`, `${m}`] }[gk];
            const f = { poly: [tx`t^2 + ${c}`, (u) => `(${u})^2 + ${c}`, (t) => t * t + c], sin: [tx`\sin t`, (u) => `sin(${u})`, Math.sin], exp: [tx`e^{-t}`, (u) => `exp(-(${u}))`, (t) => Math.exp(-t)] }[fk];
            const expr = `(${f[1](g[1])})*(${g[3]})`;
            const outerTex = { poly: tx`\left((${g[0]})^2 + ${c}\right)`, sin: tx`\sin(${g[0]})`, exp: tx`e^{-${g[0]}}` }[fk];
            const gfun = { sq: (x) => x * x, cube: (x) => x ** 3, lin: (x) => m * x }[gk];
            const D = AM.compile(expr);
            return {
              q: tx`Find $\dfrac{d}{dx}\displaystyle\int_0^{${g[0]}} ${f[0]}\,dt$.`,
              ans: { type: 'fn', expr, show: tx`$${outerTex}\cdot ${g[2]}$`, prefix: "$\\frac{d}{dx}(\\dots) =$" },
              hint: tx`FTC part 1 plus the chain rule: plug the upper limit into the integrand, then multiply by the derivative of the upper limit.`,
              sol: [tx`With $G(u) = \int_0^u ${f[0]}\,dt$, FTC gives $G'(u) = ${f[0].replace(/t/g, 'u')}$.`, tx`The upper limit is $u = ${g[0]}$, so by the chain rule the derivative is $G'(${g[0]})\cdot\frac{d}{dx}(${g[0]}) = ${outerTex}\cdot ${g[2]}$.`],
              verify() {
                for (const x of [0.6, 1.1, 1.4]) {
                  const A = (s) => M.integrate(f[2], 0, gfun(s), 2000), num = (A(x + 1e-4) - A(x - 1e-4)) / 2e-4;
                  if (Math.abs(num - D({ x })) > 1e-3 * Math.max(1, Math.abs(num))) return `mismatch at ${x}: ${num} vs ${D({ x })}`;
                }
                return true;
              },
            };
          } },
        ],
      },
      {
        id: 'techniques', title: 'Substitution and integration by parts', minutes: 40,
        summary: 'Undoing the chain rule and the product rule.',
        idea: tx`Differentiation has rules that always work; integration doesn't, so you learn to recognize patterns. The two you'll use most each undo a differentiation rule.

**Substitution** undoes the chain rule. When a function appears next to its inside's derivative, as in $2x\cos(x^2)$, rename the inside $u = x^2$ and the integral collapses to $\int\cos u\,du$.

**Integration by parts** undoes the product rule. It trades $\int u\,dv$ for $uv - \int v\,du$, which is worthwhile when the new integral is easier, typically because differentiating $u$ simplifies it (like $x$ becoming $1$).`,
        everyday: tx`Substitution is switching units mid-calculation. A recipe gives everything per cup but you think in grams: convert, do the arithmetic in grams, convert back. The $du = g'(x)\,dx$ part is the conversion factor between the two units.

Integration by parts is a trade. You give up an integral you can't do for one you can, paying with a boundary term $uv$.`,
        visual: { widget: 'byparts', caption: tx`A curve in the $(u, v)$ plane splits the dashed rectangle into two regions. Blue is $\int v\,du$ and orange is $\int u\,dv$. However you change the curve or its endpoints, the two always add up to $u_1v_1 - u_0v_0$. That identity *is* integration by parts.` },
        math: tx`**Substitution.** If $u = g(x)$ then $du = g'(x)\,dx$, and
$$\int f\big(g(x)\big)g'(x)\,dx = \int f(u)\,du, \qquad \int_a^b f\big(g(x)\big)g'(x)\,dx = \int_{g(a)}^{g(b)} f(u)\,du.$$

**Integration by parts.**
$$\int u\,dv = uv - \int v\,du, \qquad \int_a^b u\,dv = \Big[uv\Big]_a^b - \int_a^b v\,du.$$
Choose $u$ to be the factor that gets simpler when differentiated. A common priority order is **LIATE**: logs, inverse trig, algebraic (powers of $x$), trig, exponentials.

**Other tools you'll meet:** partial fractions for rational functions, like $\frac{1}{x(x+1)} = \frac1x - \frac1{x+1}$; trig identities; and, when nothing works, numerical integration (Module 11).`,
        example: {
          problem: tx`Compute $\displaystyle\int_0^1 x e^{x}\,dx$.`,
          steps: [
            tx`It's a product, so try parts. LIATE says $u = x$ (algebraic) and $dv = e^x\,dx$.`,
            tx`Then $du = dx$ and $v = e^x$.`,
            tx`$\displaystyle\int_0^1 xe^x\,dx = \Big[xe^x\Big]_0^1 - \int_0^1 e^x\,dx = e - (e - 1)$.`,
            tx`$= 1$. Choosing $u = e^x$ instead would have produced $\int \frac{x^2}{2}e^x\,dx$, which is harder than what you started with.`,
          ],
        },
        pitfalls: [
          tx`In a definite substitution, change the limits too, or substitute back before evaluating. Mixing $x$-limits with a $u$-integral is a classic error.`,
          tx`All of $dx$ must be accounted for. $\int \cos(x^2)\,dx$ has no $2x$ to pair with $du$, and in fact has no elementary antiderivative.`,
          tx`Sign errors in parts: it's $uv$ **minus** $\int v\,du$.`,
        ],
        usedIn: tx`Laplace transforms and Fourier coefficients (Modules 07 and 13) are computed by parts, often twice. Substitution is every change of variables, including polar coordinates in double integrals (Module 06).`,
        practice: [
          { level: 1, gen(R) {
            const kind = R.pick(['exp', 'cos', 'pow', 'log']);
            let q, expr, steps, fexpr;
            if (kind === 'exp') { const a = R.nz(-3, 3); q = tx`${2 * a}x\,e^{${a}x^2}`; expr = `exp(${a}x^2)`; fexpr = `${2 * a}*x*exp(${a}x^2)`; steps = [tx`Let $u = ${a}x^2$, so $du = ${2 * a}x\,dx$.`, tx`$\int e^u\,du = e^u + C = e^{${a}x^2} + C$.`]; }
            else if (kind === 'cos') { const m = R.int(2, 3), xm = m === 2 ? 'x' : 'x^{2}'; q = tx`${m}${xm}\cos(x^{${m}})`; expr = `sin(x^${m})`; fexpr = `${m}*x^${m - 1}*cos(x^${m})`; steps = [tx`Let $u = x^{${m}}$, so $du = ${m}${xm}\,dx$.`, tx`$\int\cos u\,du = \sin u + C = \sin(x^{${m}}) + C$.`]; }
            else if (kind === 'pow') { const k = R.int(2, 4), c = R.int(1, 3), pw = k === 2 ? '' : `^{${k - 1}}`; q = tx`${2 * k}x\,(x^2 + ${c})${pw}`; expr = `(x^2 + ${c})^${k}`; fexpr = `${2 * k}*x*(x^2 + ${c})^${k - 1}`; steps = [tx`Let $u = x^2 + ${c}$, so $du = 2x\,dx$ and the integrand becomes $${k}u${pw}\,du$.`, tx`$\int ${k}u${pw}\,du = u^{${k}} + C = (x^2 + ${c})^{${k}} + C$.`]; }
            else { const b = R.nz(-4, 4), c = Math.floor((b * b) / 4) + R.int(1, 5); q = tx`\frac{2x ${sgn(b)}}{${poly([1, b, c])}}`; expr = `ln(x^2 + (${b})*x + ${c})`; fexpr = `(2x + (${b}))/(x^2 + (${b})*x + ${c})`; steps = [tx`The numerator is the derivative of the denominator. Let $u = ${poly([1, b, c])}$, so $du = (2x ${sgn(b)})\,dx$.`, tx`$\int\frac{du}{u} = \ln|u| + C = \ln(${poly([1, b, c])}) + C$ (this quadratic is always positive).`]; }
            return {
              q: tx`Find $\displaystyle\int ${q}\,dx$. Leave out the $+C$.`,
              ans: { type: 'fn', expr, upToConst: true, domain: [-1, 1] },
              hint: tx`Look for an inner function whose derivative also appears in the integrand. Call the inner function $u$.`,
              sol: steps,
              verify: C.deriv(expr, fexpr, [-1, 1]),
            };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['xexp', 'xsin', 'xcos', 'ln', 'xln']);
            if (kind === 'xexp') {
              const k = R.pick([1, 2, -1]), L = R.pick([1, 2]), F = (x) => Math.exp(k * x) * (x / k - 1 / (k * k)), val = F(L) - F(0);
              return {
                q: tx`Compute $\displaystyle\int_0^{${L}} x\,e^{${k}x}\,dx$. Give 3 decimals.`,
                ans: { type: 'num', answer: val, tol: 0.002 },
                hint: tx`Parts with $u = x$, $dv = e^{${k}x}dx$, so $v = \frac{e^{${k}x}}{${k}}$.`,
                sol: [tx`$\int x e^{${k}x}dx = \frac{x e^{${k}x}}{${k}} - \int\frac{e^{${k}x}}{${k}}dx = e^{${k}x}\left(\frac{x}{${k}} - \frac{1}{${k * k}}\right)$.`, tx`Evaluate from 0 to ${L}: $\approx ${fmt(F(L), 4)} - (${fmt(F(0), 4)}) = ${fmt(val, 4)}$.`],
                verify: C.integral((x) => x * Math.exp(k * x), 0, L, val),
              };
            }
            if (kind === 'xsin') {
              const k = R.pick([1, 2, 3]), val = Math.PI / (k * k);
              return {
                q: tx`Compute $\displaystyle\int_0^{\pi${k === 1 ? '' : '/' + k}} x\sin(${k === 1 ? '' : k}x)\,dx$. Exact answers like <code>pi/4</code> are fine.`,
                ans: { type: 'num', answer: val, show: tx`$\frac{\pi}{${k * k}}$`.replace('\\frac{\\pi}{1}', '\\pi') },
                hint: tx`$u = x$, $dv = \sin(${k}x)\,dx$, so $v = -\frac{\cos(${k}x)}{${k}}$.`,
                sol: [tx`$\int x\sin(${k}x)dx = -\frac{x\cos(${k}x)}{${k}} + \frac{\sin(${k}x)}{${k * k}}$.`, tx`At $\pi/${k}$: $-\frac{(\pi/${k})(-1)}{${k}} + 0 = \frac{\pi}{${k * k}}$. At 0 the expression is 0.`],
                verify: C.integral((x) => x * Math.sin(k * x), 0, Math.PI / k, val),
              };
            }
            if (kind === 'xcos') {
              const val = Math.PI / 2 - 1;
              return {
                q: tx`Compute $\displaystyle\int_0^{\pi/2} x\cos x\,dx$.`,
                ans: { type: 'num', answer: val, show: tx`$\frac{\pi}{2} - 1$` },
                hint: tx`$u = x$, $dv = \cos x\,dx$, $v = \sin x$.`,
                sol: [tx`$\int x\cos x\,dx = x\sin x - \int\sin x\,dx = x\sin x + \cos x$.`, tx`$\left[x\sin x + \cos x\right]_0^{\pi/2} = \frac{\pi}{2} - 1$.`],
                verify: C.integral((x) => x * Math.cos(x), 0, Math.PI / 2, val),
              };
            }
            if (kind === 'ln') {
              const b = R.int(2, 6), val = b * Math.log(b) - b + 1;
              return {
                q: tx`Compute $\displaystyle\int_1^{${b}} \ln x\,dx$. Give 3 decimals.`,
                ans: { type: 'num', answer: val, tol: 0.002 },
                hint: tx`Write it as $\int 1\cdot\ln x\,dx$ with $u = \ln x$ and $dv = dx$.`,
                sol: [tx`$\int\ln x\,dx = x\ln x - \int x\cdot\frac1x dx = x\ln x - x$.`, tx`$\left[x\ln x - x\right]_1^{${b}} = ${b}\ln ${b} - ${b} + 1 \approx ${fmt(val, 4)}$.`],
                verify: C.integral(Math.log, 1, b, val),
              };
            }
            const b = R.int(2, 5), val = (b * b * Math.log(b)) / 2 - (b * b) / 4 + 0.25;
            return {
              q: tx`Compute $\displaystyle\int_1^{${b}} x\ln x\,dx$. Give 3 decimals.`,
              ans: { type: 'num', answer: val, tol: 0.002 },
              hint: tx`LIATE: logs first, so $u = \ln x$ and $dv = x\,dx$.`,
              sol: [tx`$\int x\ln x\,dx = \frac{x^2}{2}\ln x - \int\frac{x^2}{2}\cdot\frac1x dx = \frac{x^2}{2}\ln x - \frac{x^2}{4}$.`, tx`From 1 to ${b}: $\frac{${b * b}}{2}\ln ${b} - \frac{${b * b}}{4} + \frac14 \approx ${fmt(val, 4)}$.`],
              verify: C.integral((x) => x * Math.log(x), 1, b, val),
            };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['x2exp', 'expsin', 'subdef', 'sqrt']);
            if (kind === 'x2exp') {
              const L = R.pick([1, 2]), val = Math.exp(L) * (L * L - 2 * L + 2) - 2;
              return {
                q: tx`Compute $\displaystyle\int_0^{${L}} x^2 e^{x}\,dx$. Give 3 decimals.`,
                ans: { type: 'num', answer: val, tol: 0.002 },
                hint: tx`Parts twice. Each time take $u$ to be the power of $x$.`,
                sol: [tx`First: $\int x^2e^x dx = x^2e^x - 2\int xe^xdx$.`, tx`Second: $\int xe^xdx = xe^x - e^x$. So $\int x^2e^xdx = e^x(x^2 - 2x + 2)$.`, tx`$\left[e^x(x^2-2x+2)\right]_0^{${L}} = ${fmt(Math.exp(L) * (L * L - 2 * L + 2), 4)} - 2 \approx ${fmt(val, 4)}$.`],
                verify: C.integral((x) => x * x * Math.exp(x), 0, L, val),
              };
            }
            if (kind === 'expsin') {
              const val = (Math.exp(Math.PI) + 1) / 2;
              return {
                q: tx`Compute $\displaystyle\int_0^{\pi} e^{x}\sin x\,dx$. Give 3 decimals.`,
                ans: { type: 'num', answer: val, tol: 0.003 },
                hint: tx`Parts twice brings back the original integral. Call it $I$ and solve the resulting equation for $I$.`,
                sol: [tx`$I = \int e^x\sin x\,dx = -e^x\cos x + \int e^x\cos x\,dx$.`, tx`$\int e^x\cos x\,dx = e^x\sin x - I$. So $I = e^x(\sin x - \cos x) - I$, giving $I = \tfrac12 e^x(\sin x - \cos x)$.`, tx`$\left[\tfrac12 e^x(\sin x - \cos x)\right]_0^\pi = \tfrac12 e^\pi(1) - \tfrac12(-1) = \frac{e^\pi + 1}{2} \approx ${fmt(val, 4)}$.`],
                verify: C.integral((x) => Math.exp(x) * Math.sin(x), 0, Math.PI, val),
              };
            }
            if (kind === 'subdef') {
              const a = R.int(1, 5), val = Math.log(a * a + 1) / 2;
              return {
                q: tx`Compute $\displaystyle\int_0^{${a}} \frac{x}{x^2 + 1}\,dx$. Give 3 decimals.`,
                ans: { type: 'num', answer: val, tol: 0.002, show: tx`$\tfrac12\ln ${a * a + 1} \approx ${fmt(val, 4)}$` },
                hint: tx`Let $u = x^2 + 1$. Change the limits: $x = 0 \to u = 1$, $x = ${a} \to u = ${a * a + 1}$.`,
                sol: [tx`$u = x^2 + 1$, $du = 2x\,dx$, so $x\,dx = \tfrac12 du$.`, tx`$\displaystyle\int_1^{${a * a + 1}} \frac{1}{2u}du = \tfrac12\ln ${a * a + 1} \approx ${fmt(val, 4)}$.`],
                verify: C.integral((x) => x / (x * x + 1), 0, a, val),
              };
            }
            const b = R.int(1, 4), c = R.int(1, 9), val = ((b * b + c) ** 1.5 - c ** 1.5) / 3;
            return {
              q: tx`Compute $\displaystyle\int_0^{${b}} x\sqrt{x^2 + ${c}}\,dx$. Give 3 decimals.`,
              ans: { type: 'num', answer: val, tol: 0.003 },
              hint: tx`Let $u = x^2 + ${c}$; then $x\,dx = \tfrac12du$ and the limits become $${c}$ and $${b * b + c}$.`,
              sol: [tx`$\displaystyle\int_{${c}}^{${b * b + c}}\tfrac12 u^{1/2}du = \left[\tfrac13u^{3/2}\right]_{${c}}^{${b * b + c}}$.`, tx`$= \tfrac13\left(${b * b + c}^{3/2} - ${c}^{3/2}\right) \approx ${fmt(val, 4)}$.`],
              verify: C.integral((x) => x * Math.sqrt(x * x + c), 0, b, val),
            };
          } },
        ],
      },
      {
        id: 'series', title: 'Series and Taylor polynomials', minutes: 40,
        summary: 'Infinite sums, when they make sense, and approximating functions by polynomials.',
        idea: tx`Can you add infinitely many numbers and get a finite answer? Sometimes. $\frac12 + \frac14 + \frac18 + \cdots$ creeps up to exactly 1. A **series** converges when its running totals (partial sums) settle on a limit.

The most useful series in applied math are **Taylor series**. They rebuild a function from its derivatives at one point: match the value, then the slope, then the curvature, and so on. Stop after a few terms and you have a polynomial that approximates the function near that point. That's how calculators compute $\sin$ and $e^x$, and why physicists can say "for small angles, $\sin\theta\approx\theta$".`,
        everyday: tx`Predicting where a car will be in 2 seconds: start with where it is now (order 0). Better: add velocity × time (order 1). Better still: add $\tfrac12$ × acceleration × time² (order 2). Each extra term uses a higher derivative and improves the prediction for short times. That's a Taylor polynomial for position.`,
        visual: { widget: 'taylor', caption: tx`Raise the degree and watch the orange polynomial hug the curve over a wider and wider stretch. For $\ln(1+x)$ and $\frac{1}{1-x}$ it never escapes the green band, however high the degree: those series have a finite radius of convergence.` },
        math: tx`**Geometric series.** $\displaystyle\sum_{n=0}^\infty ar^n = \frac{a}{1-r}$ for $|r|<1$; it diverges for $|r|\ge1$.

**Divergence test.** If $a_n \not\to 0$, then $\sum a_n$ diverges. The converse fails: $\sum \frac1n$ diverges even though $\frac1n\to0$.

**p-series.** $\sum \frac{1}{n^p}$ converges exactly when $p > 1$. **Ratio test:** if $\left|\frac{a_{n+1}}{a_n}\right| \to L < 1$, the series converges; if $L > 1$ it diverges.

**Taylor series** of $f$ about $a$:
$$f(x) = \sum_{k=0}^\infty \frac{f^{(k)}(a)}{k!}(x-a)^k = f(a) + f'(a)(x-a) + \frac{f''(a)}{2!}(x-a)^2 + \cdots$$

**Must-know series about 0:**
$$e^x = \sum_{k\ge0} \frac{x^k}{k!},\quad \sin x = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots,\quad \cos x = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots,\quad \frac{1}{1-x} = \sum_{k\ge0} x^k\ (|x|<1).$$`,
        example: {
          problem: tx`Find the degree-2 Taylor polynomial of $f(x) = \sqrt{x}$ about $a = 4$ and use it to estimate $\sqrt{4.2}$.`,
          steps: [
            tx`$f(4) = 2$. $f'(x) = \frac12 x^{-1/2}$, so $f'(4) = \frac14$. $f''(x) = -\frac14 x^{-3/2}$, so $f''(4) = -\frac{1}{32}$.`,
            tx`$P_2(x) = 2 + \frac14(x-4) - \frac{1}{64}(x-4)^2$. The last coefficient is $\frac{f''(4)}{2!} = -\frac{1}{64}$.`,
            tx`At $x = 4.2$: $P_2 = 2 + 0.05 - \frac{0.04}{64} = 2.049375$.`,
            tx`The true value is $\sqrt{4.2} = 2.04939\ldots$: five correct digits from three terms.`,
          ],
        },
        pitfalls: [
          tx`Divide by $k!$. The coefficient of $(x-a)^k$ is $f^{(k)}(a)/k!$, not $f^{(k)}(a)$.`,
          tx`A Taylor series may only converge near its centre: the series for $\frac{1}{1-x}$ fails for $|x| \ge 1$.`,
          tx`Terms shrinking to zero does not guarantee convergence. The harmonic series $\sum\frac1n$ is the standard counterexample.`,
        ],
        usedIn: tx`Taylor expansions justify almost every approximation in applied math: linearizing differential equations near equilibria (Module 07), deriving error formulas for numerical methods (Module 11), and normal approximations in statistics. Fourier series (Module 13) apply the same idea with waves instead of powers.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.nz(-6, 9), q = R.int(2, 6), p = R.nz(-(q - 1), q - 1), start = R.pick([0, 1]);
            const r = p / q, val = (a * r ** start) / (1 - r);
            return {
              q: tx`Find $\displaystyle\sum_{n=${start}}^{\infty} ${a}\left(${AM.frac(p, q)}\right)^n$.`,
              ans: { type: 'num', answer: val, abs: 1e-6, show: tx`$${AM.frac(a * p ** start * q, q ** start * (q - p))}$` },
              hint: tx`Geometric series: first term over $(1 - r)$. The first term is the $n = ${start}$ term.`,
              sol: [tx`Ratio $r = ${AM.frac(p, q)}$, and $|r| < 1$ so it converges.`, tx`First term: $${a}\left(${AM.frac(p, q)}\right)^{${start}} = ${AM.frac(a * p ** start, q ** start)}$.`, tx`Sum $= \dfrac{${AM.frac(a * p ** start, q ** start)}}{1 - (${AM.frac(p, q)})} = ${AM.frac(a * p ** start * q, q ** start * (q - p))}$.`],
            };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['exp', 'sin', 'cos', 'geo', 'ln']), b = R.nz(-3, 3);
            let k, val, ftex, steps;
            if (kind === 'exp') { k = R.int(2, 5); val = b ** k / M.fact(k); ftex = tx`e^{${b}x}`; steps = [tx`$e^u = \sum \frac{u^k}{k!}$ with $u = ${b}x$.`, tx`The $x^{${k}}$ term is $\frac{(${b}x)^{${k}}}{${k}!}$, so the coefficient is $\frac{${b ** k}}{${M.fact(k)}}$.`]; }
            else if (kind === 'sin') { k = R.pick([3, 5]); val = ((-1) ** ((k - 1) / 2) * b ** k) / M.fact(k); ftex = tx`\sin(${b}x)`; steps = [tx`$\sin u = u - \frac{u^3}{3!} + \frac{u^5}{5!} - \cdots$ with $u = ${b}x$.`, tx`The $x^{${k}}$ coefficient is $${k === 3 ? '-' : ''}\frac{${b}^{${k}}}{${k}!} = ${AM.frac((-1) ** ((k - 1) / 2) * b ** k, M.fact(k))}$.`]; }
            else if (kind === 'cos') { k = R.pick([2, 4]); val = ((-1) ** (k / 2) * b ** k) / M.fact(k); ftex = tx`\cos(${b}x)`; steps = [tx`$\cos u = 1 - \frac{u^2}{2!} + \frac{u^4}{4!} - \cdots$ with $u = ${b}x$.`, tx`The $x^{${k}}$ coefficient is $${k === 2 ? '-' : ''}\frac{(${b})^{${k}}}{${k}!} = ${AM.frac((-1) ** (k / 2) * b ** k, M.fact(k))}$.`]; }
            else if (kind === 'geo') { k = R.int(2, 5); val = b ** k; ftex = tx`\frac{1}{1 ${b < 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x}`; steps = [tx`$\frac{1}{1-u} = \sum u^k$ with $u = ${b}x$.`, tx`The $x^{${k}}$ coefficient is $(${b})^{${k}} = ${b ** k}$.`]; }
            else { k = R.int(2, 5); val = (-1) ** (k + 1) / k; ftex = tx`\ln(1+x)`; steps = [tx`$\ln(1+x) = x - \frac{x^2}{2} + \frac{x^3}{3} - \cdots = \sum_{k\ge1}\frac{(-1)^{k+1}}{k}x^k$.`, tx`So the $x^{${k}}$ coefficient is $${AM.frac((-1) ** (k + 1), k)}$.`]; }
            return {
              q: tx`Find the coefficient of $x^{${k}}$ in the Maclaurin series (Taylor series about 0) of $${ftex}$.`,
              ans: { type: 'num', answer: val, abs: 1e-9, rel: 0.002 },
              hint: tx`Start from a known series and substitute, rather than differentiating ${k} times.`,
              sol: steps,
            };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['exp', 'sin', 'sqrt']);
            if (kind === 'exp') {
              const n = R.int(2, 4), x0 = R.pick([0.5, 0.2, -0.3, 1, -0.5]); let s = 0; for (let k = 0; k <= n; k++) s += x0 ** k / M.fact(k);
              return {
                q: tx`Use the degree-${n} Maclaurin polynomial of $e^x$ to approximate $e^{${x0}}$. Give 4 decimals.`,
                ans: { type: 'num', answer: s, tol: 0.0006 },
                hint: tx`$P_${n}(x) = \sum_{k=0}^{${n}}\frac{x^k}{k!}$.`,
                sol: [tx`$P_{${n}}(${x0}) = ${Array.from({ length: n + 1 }, (_, k) => (k === 0 ? '1' : `\\frac{(${x0})^{${k}}}{${k}!}`)).join(' + ')}$.`, tx`$\approx ${fmt(s, 5)}$. (True value: $e^{${x0}} \approx ${fmt(Math.exp(x0), 5)}$.)`],
              };
            }
            if (kind === 'sin') {
              const n = R.pick([3, 5]), x0 = R.pick([0.5, 1, 0.8, 1.2]); const s = x0 - x0 ** 3 / 6 + (n === 5 ? x0 ** 5 / 120 : 0);
              return {
                q: tx`Use the degree-${n} Maclaurin polynomial of $\sin x$ to approximate $\sin(${x0})$. Give 4 decimals.`,
                ans: { type: 'num', answer: s, tol: 0.0006 },
                hint: tx`$\sin x \approx x - \frac{x^3}{6}${n === 5 ? ' + \\frac{x^5}{120}' : ''}$.`,
                sol: [tx`$${x0} - \frac{(${x0})^3}{6}${n === 5 ? tx` + \frac{(${x0})^5}{120}` : ''} \approx ${fmt(s, 5)}$.`, tx`True value: $\sin(${x0}) \approx ${fmt(Math.sin(x0), 5)}$. The error is smaller than the first omitted term, a property of alternating series.`],
              };
            }
            const sq = R.int(2, 8), a = sq * sq, d = R.pick([-0.6, -0.3, 0.2, 0.4, 0.5, 1]), x = a + d;
            const est = sq + d / (2 * sq) - (d * d) / (8 * sq ** 3);
            return {
              q: tx`Use the degree-2 Taylor polynomial of $\sqrt{x}$ about $a = ${a}$ to estimate $\sqrt{${fmt(x, 3)}}$. Give 5 decimals.`,
              ans: { type: 'num', answer: est, tol: 0.00002 },
              hint: tx`$f'(x) = \tfrac12x^{-1/2}$ and $f''(x) = -\tfrac14x^{-3/2}$. Don't forget to divide $f''(a)$ by $2!$.`,
              sol: [tx`$f(${a}) = ${sq}$, $f'(${a}) = \frac{1}{${2 * sq}}$, $\frac{f''(${a})}{2} = -\frac{1}{8\cdot${sq ** 3}} = -\frac{1}{${8 * sq ** 3}}$.`, tx`$P_2 = ${sq} + \frac{${d}}{${2 * sq}} - \frac{(${d})^2}{${8 * sq ** 3}} \approx ${fmt(est, 6)}$.`, tx`True value: $${fmt(Math.sqrt(x), 6)}$.`],
              verify: C.near(est, Math.sqrt(x), 1e-3),
            };
          } },
        ],
      },
    ],
  });
})();
