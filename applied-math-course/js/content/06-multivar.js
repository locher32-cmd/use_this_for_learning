/* Module 06 — Multivariable and vector calculus (Stage 2). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, sgn = AM.sgn, C = AM.checks, M = AM.m;
  const mono = (c, m, n) => { // c x^m y^n as TeX
    const xs = m === 0 ? '' : m === 1 ? 'x' : `x^{${m}}`, ys = n === 0 ? '' : n === 1 ? 'y' : `y^{${n}}`;
    const body = xs + ys; return body ? (c === 1 ? body : c === -1 ? '-' + body : c + body) : String(c);
  };
  const join = (terms) => terms.filter((t) => t && t !== '0').join(' + ').replace(/\+ -/g, '- ') || '0';
  const dbl = (f, x0, x1, y0f, y1f, n = 300) => M.integrate((x) => M.integrate((y) => f(x, y), y0f(x), y1f(x), n), x0, x1, n);

  AM.module({
    id: 'multivar', stage: 2, title: 'Multivariable Calculus', aka: 'Calculus III / Vector Calculus',
    blurb: 'The world has more than one variable. This module extends derivatives and integrals to surfaces, regions and flows: partial derivatives and gradients for rates of change, double integrals for totals over regions, and divergence and curl for vector fields.',
    prereq: ['calc2', 'linalg'],
    lessons: [
      {
        id: 'partials', title: 'Partial derivatives', minutes: 30,
        summary: 'Surfaces, contour maps, and the slope in each direction.',
        idea: tx`Most quantities depend on more than one thing. Temperature depends on position $(x, y)$; a company's profit depends on price and advertising spend. A function $f(x, y)$ is a surface over the plane, and the easiest way to draw it flat is a **contour map**: curves along which $f$ is constant, like the height lines on a hiking map.

To measure change, freeze all but one variable. The **partial derivative** $\partial f/\partial x$ is the ordinary derivative in $x$ with $y$ held fixed: the slope you'd feel walking due east. $\partial f/\partial y$ is the slope walking due north.`,
        everyday: tx`A hiking map's contour lines connect points of equal height. Where the lines bunch together the ground is steep; where they spread out it's flat. Standing at one spot, the slope heading east and the slope heading north are usually different numbers. Those two numbers are the partial derivatives of height.`,
        visual: { widget: 'slices', caption: tx`Drag the pink point on the contour map. The blue line cuts the surface along fixed $y$, and its slope (right, top) is $f_x$. The orange line cuts along fixed $x$, and its slope (right, bottom) is $f_y$.` },
        math: tx`**Partial derivatives.**
$$f_x = \frac{\partial f}{\partial x} = \lim_{h\to0}\frac{f(x+h, y) - f(x,y)}{h}, \qquad f_y = \frac{\partial f}{\partial y} = \lim_{h\to0}\frac{f(x, y+h) - f(x,y)}{h}.$$
To compute $f_x$, treat $y$ as a constant and differentiate as usual.

**Second partials.** $f_{xx}$, $f_{yy}$, and the mixed $f_{xy} = (f_x)_y$. **Clairaut's theorem:** if they are continuous, $f_{xy} = f_{yx}$.

**Tangent plane** at $(a, b)$, also the linear approximation:
$$z = f(a,b) + f_x(a,b)(x-a) + f_y(a,b)(y-b).$$

**Chain rule.** If $x = x(t)$ and $y = y(t)$, then $\dfrac{df}{dt} = f_x\dfrac{dx}{dt} + f_y\dfrac{dy}{dt}$.`,
        example: {
          problem: tx`For $f(x,y) = x^2y + 3xy^2$, find $f_x$, $f_y$ and $f_{xy}$, and evaluate $f_x(1, 2)$.`,
          steps: [
            tx`Treat $y$ as a constant: $f_x = 2xy + 3y^2$.`,
            tx`Treat $x$ as a constant: $f_y = x^2 + 6xy$.`,
            tx`$f_{xy} = \frac{\partial}{\partial y}(2xy + 3y^2) = 2x + 6y$. Check: $f_{yx} = \frac{\partial}{\partial x}(x^2 + 6xy) = 2x + 6y$. They agree.`,
            tx`$f_x(1,2) = 2(1)(2) + 3(4) = 16$: stepping in the $x$-direction from $(1,2)$, $f$ rises about 16 per unit.`,
          ],
        },
        pitfalls: [
          tx`When differentiating in $x$, terms involving only $y$ are constants and vanish: $\frac{\partial}{\partial x}(y^3) = 0$.`,
          tx`$\frac{\partial}{\partial x}(xy) = y$, not $1$. The $y$ stays as a coefficient.`,
          tx`Contour lines never cross, because a point can't have two heights.`,
        ],
        usedIn: tx`Partial differential equations (Module 13) are equations in partial derivatives. Gradients for optimization (Module 14) are vectors of partials. Sensitivity analysis asks how much an output moves per unit change of each input.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.nz(-4, 5), m = R.int(1, 3), n = R.int(1, 3), b = R.nz(-5, 5), c = R.nz(-5, 5), wrt = R.pick(['x', 'y']);
            const f = join([mono(a, m, n), mono(b, 2, 0), mono(c, 0, 1)]);
            const expr = wrt === 'x' ? `${a * m}*x^${m - 1}*y^${n} + ${2 * b}*x` : `${a * n}*x^${m}*y^${n - 1} + (${c})`;
            const show = wrt === 'x' ? join([mono(a * m, m - 1, n), mono(2 * b, 1, 0)]) : join([mono(a * n, m, n - 1), String(c)]);
            return {
              q: tx`Find $f_${wrt}$ for $f(x,y) = ${f}$.`,
              ans: { type: 'fn', expr, vars: ['x', 'y'], domain: [-2, 2], show: `$${show}$`, prefix: `$f_${wrt} =$`, placeholder: 'use x and y, e.g. 6x^2*y + 2' },
              hint: tx`Treat $${wrt === 'x' ? 'y' : 'x'}$ as a constant number and differentiate with respect to $${wrt}$.`,
              sol: [tx`Differentiate term by term in $${wrt}$, holding $${wrt === 'x' ? 'y' : 'x'}$ fixed.`, wrt === 'x' ? tx`$\frac{\partial}{\partial x}(${mono(a, m, n)}) = ${mono(a * m, m - 1, n)}$, $\ \frac{\partial}{\partial x}(${mono(b, 2, 0)}) = ${mono(2 * b, 1, 0)}$, and $${mono(c, 0, 1)}$ is constant in $x$.` : tx`$\frac{\partial}{\partial y}(${mono(a, m, n)}) = ${mono(a * n, m, n - 1)}$, $\ ${mono(b, 2, 0)}$ is constant in $y$, and $\frac{\partial}{\partial y}(${mono(c, 0, 1)}) = ${c}$.`, tx`$f_${wrt} = ${show}$.`],
            };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['exp', 'sin', 'log']), wrt = R.pick(['x', 'y']), a = R.int(-2, 2), b = R.int(-2, 2);
            let f, ftex, fx, fy, fxt, fyt;
            if (kind === 'exp') { const k = R.nz(-2, 2); f = (x, y) => x * x * Math.exp(k * y); ftex = tx`x^2e^{${k}y}`; fx = (x, y) => 2 * x * Math.exp(k * y); fy = (x, y) => k * x * x * Math.exp(k * y); fxt = tx`2xe^{${k}y}`; fyt = tx`${k}x^2e^{${k}y}`; }
            else if (kind === 'sin') { const p = R.nz(-3, 3), q = R.nz(-3, 3); f = (x, y) => Math.sin(p * x + q * y); ftex = tx`\sin(${p}x ${sgn(q)}y)`; fx = (x, y) => p * Math.cos(p * x + q * y); fy = (x, y) => q * Math.cos(p * x + q * y); fxt = tx`${p}\cos(${p}x ${sgn(q)}y)`; fyt = tx`${q}\cos(${p}x ${sgn(q)}y)`; }
            else { const k = R.int(1, 4); f = (x, y) => x * y * y + Math.log(x * x + k); ftex = tx`xy^2 + \ln(x^2 + ${k})`; fx = (x, y) => y * y + (2 * x) / (x * x + k); fy = (x, y) => 2 * x * y; fxt = tx`y^2 + \dfrac{2x}{x^2 + ${k}}`; fyt = tx`2xy`; }
            const v = (wrt === 'x' ? fx : fy)(a, b);
            return {
              q: tx`For $f(x,y) = ${ftex}$, find $f_${wrt}(${a}, ${b})$. Three decimals are fine.`,
              ans: { type: 'num', answer: v, tol: 0.002 },
              hint: tx`Find the partial derivative as a formula first (other variable held constant), then substitute.`,
              sol: [tx`$f_${wrt} = ${wrt === 'x' ? fxt : fyt}$${kind === 'log' ? '' : ' (chain rule on the inner expression)'}.`, tx`At $(${a}, ${b})$: $f_${wrt} \approx ${fmt(v, 4)}$.`],
              verify: C.near(v, wrt === 'x' ? M.deriv((t) => f(t, b), a) : M.deriv((t) => f(a, t), b), 1e-5),
            };
          } },
          { level: 3, gen(R) {
            const p = R.nz(-3, 3), q = R.nz(-3, 3), r = R.int(-4, 4), a = R.int(-2, 2), b = R.int(-2, 2);
            const f = (x, y) => p * x * x + q * x * y * y + r * y, fa = f(a, b), fx = 2 * p * a + q * b * b, fy = 2 * q * a * b + r;
            const dx = R.pick([-0.1, 0.1, 0.2, -0.05]), dy = R.pick([-0.1, 0.1, 0.05, -0.2]), L = fa + fx * dx + fy * dy;
            return {
              q: tx`Use the tangent-plane (linear) approximation of $f(x,y) = ${join([mono(p, 2, 0), mono(q, 1, 2), mono(r, 0, 1)])}$ at $(${a}, ${b})$ to estimate $f(${fmt(a + dx)}, ${fmt(b + dy)})$.`,
              ans: { type: 'num', answer: L, tol: 0.002 },
              hint: tx`$f(a + \Delta x, b + \Delta y) \approx f(a,b) + f_x(a,b)\Delta x + f_y(a,b)\Delta y$.`,
              sol: [tx`$f(${a}, ${b}) = ${fa}$, $\ f_x = ${mono(2 * p, 1, 0)} ${sgn(q)}y^2 = ${fx}$, $\ f_y = ${mono(2 * q, 1, 1)} ${sgn(r)} = ${fy}$ at the point.`, tx`$\Delta x = ${dx}$, $\Delta y = ${dy}$: $\ ${fa} + ${fx}(${dx}) + ${fy}(${dy}) = ${fmt(L, 4)}$.`, tx`(True value: $${fmt(f(a + dx, b + dy), 4)}$.)`],
            };
          } },
        ],
      },
      {
        id: 'gradient', title: 'The gradient and directional derivatives', minutes: 30,
        summary: 'The arrow that points uphill, and the slope in any direction.',
        idea: tx`Put the two partial derivatives together into a vector and you get the **gradient**, $\nabla f = (f_x, f_y)$. It has a clean geometric meaning: it points in the direction of steepest ascent, its length is how steep that ascent is, and it is always perpendicular to the contour line through the point.

The slope in any other direction $\mathbf u$ (a unit vector) is the **directional derivative**, $D_{\mathbf u}f = \nabla f\cdot\mathbf u$. It's largest when $\mathbf u$ points along the gradient, zero along the contour, and most negative pointing straight against the gradient.`,
        everyday: tx`Drop a ball on a hillside and it rolls along $-\nabla(\text{height})$: straight downhill, crossing the contour lines at right angles. Water runoff, heat flowing from hot to cold, and wind pushed from high to low pressure all follow negative gradients. Walk along a contour and you stay level, because the directional derivative there is zero.`,
        visual: { widget: 'gradient', caption: tx`Drag the pink point. The black gradient arrow always crosses the contour lines at right angles and is longest where the lines are tightly packed. Turn the direction slider to point $\mathbf u$ along a contour and watch $D_{\mathbf u}f$ drop to zero.` },
        math: tx`**Gradient.** $\nabla f = \left(\dfrac{\partial f}{\partial x}, \dfrac{\partial f}{\partial y}\right)$, with more components in more dimensions.

**Directional derivative** along a unit vector $\mathbf u$:
$$D_{\mathbf u}f = \nabla f\cdot\mathbf u = \|\nabla f\|\cos\theta.$$

**Consequences.** The maximum rate of increase is $\|\nabla f\|$, in the direction of $\nabla f$. The rate is zero along level curves, so $\nabla f$ is perpendicular to them.

**Critical points** of $f(x,y)$ satisfy $\nabla f = \mathbf 0$. The **second derivative test** uses $D = f_{xx}f_{yy} - f_{xy}^2$: if $D>0$ and $f_{xx}>0$ it's a local minimum; $D>0$ and $f_{xx}<0$, a local maximum; $D<0$, a saddle point.`,
        example: {
          problem: tx`Let $f(x,y) = x^2 + 3y^2$. At $(1,1)$, find the gradient, the steepest slope, and the slope in the direction of $(3, 4)$.`,
          steps: [
            tx`$\nabla f = (2x, 6y)$, so $\nabla f(1,1) = (2, 6)$.`,
            tx`The steepest slope is $\|\nabla f\| = \sqrt{4 + 36} = \sqrt{40} \approx 6.32$, heading in the direction $(2,6)$.`,
            tx`Make the direction a unit vector: $\mathbf u = (3,4)/5 = (0.6, 0.8)$.`,
            tx`$D_{\mathbf u}f = (2,6)\cdot(0.6, 0.8) = 1.2 + 4.8 = 6$.`,
          ],
        },
        pitfalls: [
          tx`The direction must be a **unit** vector before you dot it with $\nabla f$.`,
          tx`$\nabla f$ lives in the input plane (it's a direction to walk), not on the surface itself.`,
          tx`$\nabla f = \mathbf 0$ can be a max, a min or a saddle. Use the second derivative test to tell which.`,
        ],
        usedIn: tx`Gradient descent, the core algorithm of optimization and machine learning (Module 14), steps along $-\nabla f$. Lagrange multipliers (Module 14) line up two gradients. Heat flux (Module 13) is proportional to $-\nabla T$.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.nz(-3, 3), b = R.nz(-3, 3), c = R.int(-4, 4), d = R.int(-4, 4), x = R.int(-3, 3), y = R.int(-3, 3);
            const g = [2 * a * x + b * y + c, b * x + 2 * d * y];
            return {
              q: tx`Find $\nabla f(${x}, ${y})$ for $f(x,y) = ${join([mono(a, 2, 0), mono(b, 1, 1), mono(c, 1, 0), mono(d, 0, 2)])}$.`,
              ans: { type: 'vec', answer: g, placeholder: 'f_x, f_y' },
              hint: tx`$\nabla f = (f_x, f_y)$. Compute both partials as formulas, then substitute.`,
              sol: [tx`$f_x = ${join([mono(2 * a, 1, 0), mono(b, 0, 1), String(c)])}$ and $f_y = ${join([mono(b, 1, 0), mono(2 * d, 0, 1)])}$.`, tx`At $(${x}, ${y})$: $\nabla f = (${g[0]}, ${g[1]})$.`],
            };
          } },
          { level: 2, gen(R) {
            const a = R.nz(-3, 3), b = R.nz(-3, 3), c = R.nz(-3, 3), x = R.int(-2, 2), y = R.int(-2, 2);
            const [u1, u2] = R.pick([[3, 4], [4, 3], [1, 1], [1, -1], [-3, 4], [5, 12], [1, 2], [2, -1]]), L = Math.hypot(u1, u2);
            const g = [2 * a * x + b * y, b * x + 2 * c * y], D = (g[0] * u1 + g[1] * u2) / L;
            return {
              q: tx`Find the directional derivative of $f(x,y) = ${join([mono(a, 2, 0), mono(b, 1, 1), mono(c, 0, 2)])}$ at $(${x}, ${y})$ in the direction of $(${u1}, ${u2})$. Three decimals are fine.`,
              ans: { type: 'num', answer: D, tol: 0.002 },
              hint: tx`Normalize $(${u1}, ${u2})$ first: divide by its length $\sqrt{${u1 * u1 + u2 * u2}}$. Then dot with $\nabla f$.`,
              sol: [tx`$\nabla f(${x}, ${y}) = (${g[0]}, ${g[1]})$.`, tx`$\mathbf u = \frac{1}{\sqrt{${u1 * u1 + u2 * u2}}}(${u1}, ${u2})$.`, tx`$D_{\mathbf u}f = \dfrac{${g[0]}(${u1}) + ${g[1]}(${u2})}{\sqrt{${u1 * u1 + u2 * u2}}} = \dfrac{${g[0] * u1 + g[1] * u2}}{${fmt(L, 4)}} \approx ${fmt(D, 4)}$.`],
            };
          } },
          { level: 3, gen(R) {
            let a, b, c, D; do { a = R.nz(-4, 4); b = R.int(-5, 5); c = R.nz(-4, 4); D = 4 * a * c - b * b; } while (D === 0);
            const kind = D < 0 ? 2 : a > 0 ? 0 : 1, choices = ['Local minimum', 'Local maximum', 'Saddle point'];
            return {
              q: tx`$f(x,y) = ${join([mono(a, 2, 0), mono(b, 1, 1), mono(c, 0, 2)])}$ has a critical point at the origin. Classify it.`,
              ans: { type: 'mc', choices, answer: kind },
              hint: tx`Compute $f_{xx}$, $f_{yy}$, $f_{xy}$ and $D = f_{xx}f_{yy} - f_{xy}^2$.`,
              sol: [tx`$f_{xx} = ${2 * a}$, $f_{yy} = ${2 * c}$, $f_{xy} = ${b}$.`, tx`$D = (${2 * a})(${2 * c}) - (${b})^2 = ${D}$.`, D < 0 ? tx`$D < 0$: a **saddle point**. The surface curves up in one direction and down in another.` : tx`$D > 0$ and $f_{xx} ${a > 0 ? '> 0' : '< 0'}$: a **local ${a > 0 ? 'minimum' : 'maximum'}**.`],
            };
          } },
        ],
      },
      {
        id: 'double', title: 'Double integrals', minutes: 35,
        summary: 'Adding up over a region: volume, mass and averages in two dimensions.',
        idea: tx`A single integral adds up thin strips along a line. A **double integral** adds up tiny tiles over a region of the plane: split the region into small rectangles, multiply each tile's area by the value of $f$ there, and add. If $f$ is height, the result is the volume under the surface; if $f$ is density, it's total mass; if $f$ is a probability density, it's a probability.

In practice you never add tiles. **Fubini's theorem** lets you compute a double integral as two ordinary integrals, one inside the other: integrate across in $x$ with $y$ fixed, then add up those results over $y$.`,
        everyday: tx`To estimate total rainfall over a county, divide the map into grid squares, multiply each square's area by the gauge reading there, and add. That's a double Riemann sum, and smaller squares give better estimates. The exact total is the double integral of rainfall depth over the county.`,
        visual: { widget: 'dblint', caption: tx`Raise the number of tiles and watch the sum converge. Switch to the triangle and the disk: the tiles along a curved edge are why the integration limits have to follow the shape of the region.` },
        math: tx`**Definition.** $\displaystyle\iint_R f(x,y)\,dA = \lim \sum f(x_i^*, y_j^*)\,\Delta A$.

**Fubini's theorem** on a rectangle $[a,b]\times[c,d]$:
$$\iint_R f\,dA = \int_c^d\!\left(\int_a^b f(x,y)\,dx\right)dy = \int_a^b\!\left(\int_c^d f(x,y)\,dy\right)dx.$$

**General regions.** If $R = \{a\le x\le b,\ g_1(x)\le y\le g_2(x)\}$, then $\displaystyle\iint_R f\,dA = \int_a^b\int_{g_1(x)}^{g_2(x)} f\,dy\,dx$.

**Polar coordinates.** $dA = r\,dr\,d\theta$, so $\displaystyle\iint_R f\,dA = \int_\alpha^\beta\int_{r_1}^{r_2} f(r\cos\theta, r\sin\theta)\,r\,dr\,d\theta$.

**Uses.** Area $= \iint_R 1\,dA$; average value $= \frac{1}{\text{area}}\iint_R f\,dA$; mass $= \iint_R \rho\,dA$.`,
        example: {
          problem: tx`Compute $\displaystyle\iint_R xy^2\,dA$ over $R = [0,2]\times[1,3]$.`,
          steps: [
            tx`Inner integral in $x$, with $y$ held constant: $\int_0^2 xy^2\,dx = y^2\left[\frac{x^2}{2}\right]_0^2 = 2y^2$.`,
            tx`Outer integral in $y$: $\int_1^3 2y^2\,dy = \left[\frac{2y^3}{3}\right]_1^3 = 18 - \frac23 = \frac{52}{3}$.`,
            tx`So the volume under $z = xy^2$ over the rectangle is $\frac{52}{3} \approx 17.33$.`,
          ],
        },
        pitfalls: [
          tx`The inner limits may depend on the outer variable, never the other way round.`,
          tx`In polar coordinates the area element is $r\,dr\,d\theta$, not $dr\,d\theta$.`,
          tx`Swapping the order of integration on a non-rectangular region means redrawing the region and redoing all the limits.`,
        ],
        usedIn: tx`Probabilities and expectations for pairs of random variables (Modules 08 and 09) are double integrals of joint densities. Mass, centre of mass and moments of inertia, and flux integrals in vector calculus, all use them.`,
        practice: [
          { level: 1, gen(R) {
            const m = R.int(0, 3), n = R.int(0, 3), a = R.int(1, 3), b = R.int(1, 3), val = (a ** (m + 1) / (m + 1)) * (b ** (n + 1) / (n + 1));
            return {
              q: tx`Compute $\displaystyle\iint_R ${mono(1, m, n)}\,dA$ over $R = [0, ${a}]\times[0, ${b}]$.`,
              ans: { type: 'num', answer: val, show: tx`$${AM.frac(a ** (m + 1) * b ** (n + 1), (m + 1) * (n + 1))}$` },
              hint: tx`The integrand is a product of a function of $x$ and a function of $y$, so the double integral is the product of two single integrals.`,
              sol: [tx`$\int_0^{${a}} x^{${m}}dx = \frac{${a}^{${m + 1}}}{${m + 1}}$ and $\int_0^{${b}} y^{${n}}dy = \frac{${b}^{${n + 1}}}{${n + 1}}$.`, tx`Product: $${AM.frac(a ** (m + 1), m + 1)}\cdot${AM.frac(b ** (n + 1), n + 1)} = ${AM.frac(a ** (m + 1) * b ** (n + 1), (m + 1) * (n + 1))}$.`],
              verify: C.near(dbl((x, y) => x ** m * y ** n, 0, a, () => 0, () => b, 60), val, 1e-6),
            };
          } },
          { level: 2, gen(R) {
            const a = R.int(1, 4), kind = R.pick(['xy', 'sum', 'const', 'x']), k = R.int(2, 6);
            const [f, ftex, val, inner] = {
              xy: [(x, y) => x * y, 'xy', a ** 4 / 8, tx`\int_0^x xy\,dy = \frac{x^3}{2}`],
              sum: [(x, y) => x + y, 'x + y', a ** 3 / 2, tx`\int_0^x (x + y)\,dy = x^2 + \frac{x^2}{2} = \frac{3x^2}{2}`],
              const: [() => k, String(k), (k * a * a) / 2, tx`\int_0^x ${k}\,dy = ${k}x`],
              x: [(x) => x, 'x', a ** 3 / 3, tx`\int_0^x x\,dy = x^2`],
            }[kind];
            return {
              q: tx`Compute $\displaystyle\iint_T ${ftex}\,dA$ over the triangle $T = \{0 \le y \le x \le ${a}\}$.`,
              ans: { type: 'num', answer: val, abs: 1e-6 },
              hint: tx`Integrate $y$ from 0 up to $x$ first, then $x$ from 0 to ${a}.`,
              sol: [tx`Inner: $${inner}$.`, tx`Outer: integrate that from $x = 0$ to $${a}$, giving $${fmt(val, 4)}$.`],
              verify: C.near(dbl(f, 0, a, () => 0, (x) => x, 200), val, 1e-6),
            };
          } },
          { level: 3, gen(R) {
            const Rr = R.int(1, 3), kind = R.pick(['r2', 'gauss', 'r']);
            const [ftex, val, steps] = {
              r2: [tx`x^2 + y^2`, (Math.PI * Rr ** 4) / 2, [tx`In polar coordinates $x^2 + y^2 = r^2$ and $dA = r\,dr\,d\theta$.`, tx`$\int_0^{2\pi}\int_0^{${Rr}} r^2\cdot r\,dr\,d\theta = 2\pi\cdot\frac{${Rr}^4}{4} = \frac{${Rr ** 4}\pi}{2}$.`]],
              gauss: [tx`e^{-(x^2 + y^2)}`, Math.PI * (1 - Math.exp(-Rr * Rr)), [tx`$e^{-(x^2+y^2)} = e^{-r^2}$ and $dA = r\,dr\,d\theta$; the extra $r$ makes the substitution $u = r^2$ work.`, tx`$2\pi\int_0^{${Rr}} e^{-r^2}r\,dr = 2\pi\left[-\tfrac12e^{-r^2}\right]_0^{${Rr}} = \pi(1 - e^{-${Rr * Rr}})$.`]],
              r: [tx`\sqrt{x^2 + y^2}`, (2 * Math.PI * Rr ** 3) / 3, [tx`$\sqrt{x^2+y^2} = r$ and $dA = r\,dr\,d\theta$.`, tx`$\int_0^{2\pi}\int_0^{${Rr}} r\cdot r\,dr\,d\theta = 2\pi\cdot\frac{${Rr}^3}{3} = \frac{${2 * Rr ** 3}\pi}{3}$.`]],
            }[kind];
            return {
              q: tx`Compute $\displaystyle\iint_D ${ftex}\,dA$ over the disk $x^2 + y^2 \le ${Rr * Rr}$. Three decimals (or an exact form with <code>pi</code>).`,
              ans: { type: 'num', answer: val, tol: 0.002 },
              hint: tx`Switch to polar coordinates: $0 \le r \le ${Rr}$, $0 \le \theta \le 2\pi$, and remember $dA = r\,dr\,d\theta$.`,
              sol: [...steps, tx`$\approx ${fmt(val, 4)}$.`],
              verify: C.near(2 * Math.PI * M.integrate((r) => (kind === 'r2' ? r * r : kind === 'r' ? r : Math.exp(-r * r)) * r, 0, Rr), val, 1e-8),
            };
          } },
        ],
      },
      {
        id: 'fields', title: 'Vector fields, divergence and curl', minutes: 40,
        summary: 'Arrows everywhere: flows, forces, and how much they spread out or swirl.',
        idea: tx`A **vector field** attaches an arrow to every point: the wind at each place on a weather map, the velocity of water in a river, the force on a charged particle. Two numbers summarize what a field does near a point.

**Divergence** measures spreading. Positive divergence means more flows out of a tiny box than flows in, like a source; negative means a sink. **Curl** measures swirling: drop a tiny paddle wheel in the flow and the curl says how fast it spins. The big theorems of vector calculus (Green's, Stokes', the divergence theorem) say that adding up divergence or curl inside a region equals measuring the flow across its boundary.`,
        everyday: tx`Watch a bathtub drain. Near the plughole the water swirls (nonzero curl) and disappears (negative divergence, a sink). A garden sprinkler head is a source: water spreads outward with positive divergence. A calm river flowing straight has zero divergence and, away from the banks, almost no curl.`,
        visual: { widget: 'vfield', caption: tx`Particles drift with the field. Drag the pink paddle wheel around: its spin shows the curl and the readout gives the divergence. The whirlpool both spins and drains. In the shear flow the wheel spins even though every particle moves in a straight line.` },
        math: tx`**Vector field** in the plane: $\mathbf F(x,y) = \big(P(x,y),\ Q(x,y)\big)$.

**Divergence.** $\nabla\cdot\mathbf F = \dfrac{\partial P}{\partial x} + \dfrac{\partial Q}{\partial y}$ (in 3D, add $\partial R/\partial z$).

**Curl** in 2D (a scalar): $\ \operatorname{curl}\mathbf F = \dfrac{\partial Q}{\partial x} - \dfrac{\partial P}{\partial y}$. In 3D, $\nabla\times\mathbf F$ is a vector.

**Line integral** (work, or circulation, along a curve $C$): $\displaystyle\int_C \mathbf F\cdot d\mathbf r = \int_a^b \mathbf F(\mathbf r(t))\cdot\mathbf r'(t)\,dt$.

**Green's theorem.** For a region $D$ whose boundary $C$ is traversed counterclockwise,
$$\oint_C \mathbf F\cdot d\mathbf r = \iint_D\left(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\right)dA.$$

**Conservative fields.** On a region without holes, $\mathbf F = \nabla\phi$ for some potential $\phi$ exactly when the curl is zero; then $\int_C\mathbf F\cdot d\mathbf r = \phi(\text{end}) - \phi(\text{start})$, whatever the path.`,
        example: {
          problem: tx`For $\mathbf F = (-y, x)$, find the divergence, the curl, and the circulation $\oint_C\mathbf F\cdot d\mathbf r$ around the unit circle.`,
          steps: [
            tx`$P = -y$, $Q = x$. Divergence: $\frac{\partial(-y)}{\partial x} + \frac{\partial x}{\partial y} = 0$. The flow neither spreads nor collects.`,
            tx`Curl: $\frac{\partial x}{\partial x} - \frac{\partial(-y)}{\partial y} = 1 + 1 = 2$. Every paddle wheel spins counterclockwise.`,
            tx`Green's theorem: $\oint_C\mathbf F\cdot d\mathbf r = \iint_D 2\,dA = 2\cdot\pi(1)^2 = 2\pi$.`,
            tx`Directly: with $\mathbf r(t) = (\cos t, \sin t)$, $\mathbf F\cdot\mathbf r' = (-\sin t)(-\sin t) + \cos t\cos t = 1$, and $\int_0^{2\pi}1\,dt = 2\pi$. ✓`,
          ],
        },
        pitfalls: [
          tx`Divergence is a scalar field; the 3D curl is a vector field.`,
          tx`Green's theorem needs the boundary traversed counterclockwise, with the region on your left.`,
          tx`Zero curl doesn't make a field conservative if the region has a hole: $\frac{(-y,\ x)}{x^2+y^2}$ around the origin is the classic example.`,
        ],
        usedIn: tx`Fluid dynamics, electromagnetism (Maxwell's equations are statements about divergence and curl), and the derivation of the heat and wave equations (Module 13), which uses the divergence theorem.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.nz(-3, 3), b = R.nz(-3, 3), c = R.nz(-3, 3), d = R.int(-3, 3), x = R.int(-3, 3), y = R.int(-3, 3);
            const Pf = (s, t) => a * s * s + b * s * t, Qf = (s, t) => c * t * t + d * s, div = 2 * a * x + b * y + 2 * c * y;
            return {
              q: tx`Find $\nabla\cdot\mathbf F$ at $(${x}, ${y})$ for $\mathbf F = \left(${join([mono(a, 2, 0), mono(b, 1, 1)])},\ ${join([mono(c, 0, 2), mono(d, 1, 0)])}\right)$.`,
              ans: { type: 'num', answer: div },
              hint: tx`Divergence $= \frac{\partial P}{\partial x} + \frac{\partial Q}{\partial y}$, where $P$ and $Q$ are the first and second components.`,
              sol: [tx`$\frac{\partial P}{\partial x} = ${join([mono(2 * a, 1, 0), mono(b, 0, 1)])}$ and $\frac{\partial Q}{\partial y} = ${mono(2 * c, 0, 1)}$ (the $${mono(d, 1, 0)}$ term has no $y$).`, tx`At $(${x}, ${y})$: $${2 * a * x + b * y} + (${2 * c * y}) = ${div}$.`],
              verify: C.near(M.deriv((s) => Pf(s, y), x) + M.deriv((t) => Qf(x, t), y), div, 1e-6),
            };
          } },
          { level: 2, gen(R) {
            const a = R.nz(-3, 3), b = R.int(-3, 3), c = R.nz(-3, 3), d = R.int(-3, 3), x = R.int(-3, 3), y = R.int(-3, 3);
            const curl = 2 * c * x * y + d - 2 * a * y;
            return {
              q: tx`Find the curl $\dfrac{\partial Q}{\partial x} - \dfrac{\partial P}{\partial y}$ at $(${x}, ${y})$ for $\mathbf F = \left(${join([mono(a, 0, 2), mono(b, 1, 0)])},\ ${join([mono(c, 2, 1), mono(d, 1, 0)])}\right)$.`,
              ans: { type: 'num', answer: curl },
              hint: tx`$P = ${join([mono(a, 0, 2), mono(b, 1, 0)])}$ and $Q = ${join([mono(c, 2, 1), mono(d, 1, 0)])}$. Differentiate $Q$ in $x$ and $P$ in $y$.`,
              sol: [tx`$\frac{\partial Q}{\partial x} = ${join([mono(2 * c, 1, 1), String(d)])}$ and $\frac{\partial P}{\partial y} = ${mono(2 * a, 0, 1)}$.`, tx`At $(${x}, ${y})$: $${2 * c * x * y + d} - (${2 * a * y}) = ${curl}$.`],
            };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['rect', 'disk', 'cubic']);
            if (kind === 'rect') {
              const a = R.int(-3, 3), b = R.int(-3, 3), w = R.int(1, 4), h = R.int(1, 4); if (a === b) return this.gen(R);
              return {
                q: tx`Use Green's theorem to find the counterclockwise circulation of $\mathbf F = (${a}y,\ ${b}x)$ around the rectangle $[0, ${w}]\times[0, ${h}]$.`,
                ans: { type: 'num', answer: (b - a) * w * h },
                hint: tx`The curl $\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}$ is constant here, so the double integral is curl × area.`,
                sol: [tx`Curl $= ${b} - (${a}) = ${b - a}$.`, tx`Circulation $= ${b - a}\times\text{area} = ${b - a}\times${w * h} = ${(b - a) * w * h}$.`],
              };
            }
            if (kind === 'disk') {
              const a = R.int(-3, 3), b = R.int(-3, 3), Rr = R.int(1, 3); if (a === b) return this.gen(R);
              const val = (b - a) * Math.PI * Rr * Rr;
              return {
                q: tx`Find the counterclockwise circulation of $\mathbf F = (${a}y,\ ${b}x)$ around the circle $x^2 + y^2 = ${Rr * Rr}$. Three decimals or an exact form with <code>pi</code>.`,
                ans: { type: 'num', answer: val, tol: 0.002 },
                hint: tx`Green's theorem: circulation = $\iint_D (\text{curl})\,dA$, and the curl is constant.`,
                sol: [tx`Curl $= ${b} - (${a}) = ${b - a}$.`, tx`Circulation $= ${b - a}\cdot\pi(${Rr})^2 = ${(b - a) * Rr * Rr}\pi \approx ${fmt(val, 4)}$.`],
              };
            }
            const Rr = R.int(1, 2), k = R.int(1, 3), val = (3 * k * Math.PI * Rr ** 4) / 2;
            return {
              q: tx`Find the counterclockwise circulation of $\mathbf F = (-${k}y^3,\ ${k}x^3)$ around the circle $x^2 + y^2 = ${Rr * Rr}$. Three decimals.`,
              ans: { type: 'num', answer: val, tol: 0.003 },
              hint: tx`The curl is $${3 * k}x^2 + ${3 * k}y^2 = ${3 * k}r^2$. Integrate it over the disk in polar coordinates.`,
              sol: [tx`Curl $= \frac{\partial}{\partial x}(${k}x^3) - \frac{\partial}{\partial y}(-${k}y^3) = ${3 * k}(x^2 + y^2)$.`, tx`$\int_0^{2\pi}\int_0^{${Rr}} ${3 * k}r^2\cdot r\,dr\,d\theta = 2\pi\cdot\frac{${3 * k}\cdot${Rr ** 4}}{4} \approx ${fmt(val, 4)}$.`],
              verify: C.near(M.integrate((t) => { const x = Rr * Math.cos(t), y = Rr * Math.sin(t); return (-k * y ** 3) * (-Rr * Math.sin(t)) + (k * x ** 3) * (Rr * Math.cos(t)); }, 0, 2 * Math.PI), val, 1e-8),
            };
          } },
        ],
      },
    ],
  });
})();
