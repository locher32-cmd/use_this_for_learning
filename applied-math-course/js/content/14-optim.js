/* Module 14 — Optimization (Stage 4). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, C = AM.checks, M = AM.m;
  const pm = (r) => `\\begin{pmatrix} ${r.map((x) => x.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;

  AM.module({
    id: 'optim', stage: 4, title: 'Optimization', aka: 'Optimization / Operations Research',
    blurb: 'Optimization is choosing the best option under constraints: the cheapest route, the strongest design, the model that best fits the data. You will learn the iterative workhorse (gradient descent and Newton), constrained optimization with Lagrange multipliers, and linear programming, which runs much of logistics and industry.',
    prereq: ['multivar', 'linalg'],
    lessons: [
      {
        id: 'gd', title: 'Gradient descent and Newton\'s method', minutes: 40,
        summary: 'Walking downhill in many dimensions, and how fast you get there.',
        idea: tx`To minimize a function of many variables, start somewhere and repeatedly step downhill. Since $-\nabla f$ points in the direction of steepest descent, **gradient descent** updates $\mathbf x \leftarrow \mathbf x - \eta\nabla f(\mathbf x)$, where $\eta$ is the **learning rate** or step size. Too small and it crawls; too large and it overshoots and diverges.

**Convexity** is what makes optimization reliable. A convex function is bowl-shaped everywhere, so any local minimum is the global minimum and gradient descent can't get stuck. **Newton's method** uses curvature (the Hessian matrix of second derivatives) to jump straight to the bottom of the local quadratic approximation, converging in far fewer steps when you're close.`,
        everyday: tx`Hiking down a foggy mountain, you can only see the ground at your feet. A sensible strategy: feel which way is steepest downhill, take a step, repeat. That's gradient descent. Every neural network, from spam filters to image generators, is trained this way, adjusting millions of parameters downhill on an error landscape.`,
        visual: { widget: 'gd', caption: tx`Drag the pink start point. On the stretched bowl, raise the learning rate until the path zig-zags and then diverges (past 0.25). On the banana valley, gradient descent crawls along the floor; add momentum to speed it up. With two valleys, the answer depends on where you start.` },
        math: tx`**Gradient descent.** $\mathbf x_{k+1} = \mathbf x_k - \eta\,\nabla f(\mathbf x_k)$.

**Quadratic model.** For $f(\mathbf x) = \frac12\mathbf x^TA\mathbf x - \mathbf b^T\mathbf x$ with $A$ symmetric positive definite, the minimizer solves $A\mathbf x = \mathbf b$. Gradient descent converges if $0 < \eta < 2/\lambda_{\max}(A)$, and its speed is governed by the condition number $\kappa = \lambda_{\max}/\lambda_{\min}$: long, narrow valleys are slow.

**Convexity.** $f$ is convex if $f(t\mathbf x + (1-t)\mathbf y) \le tf(\mathbf x) + (1-t)f(\mathbf y)$. A twice-differentiable $f$ is convex exactly when its Hessian $H = \left[\frac{\partial^2 f}{\partial x_i\partial x_j}\right]$ is positive semidefinite everywhere.

**Newton's method.** $\mathbf x_{k+1} = \mathbf x_k - H(\mathbf x_k)^{-1}\nabla f(\mathbf x_k)$. Quadratically convergent near a minimum; for a quadratic function it lands on the minimum in one step.

**Momentum** ($\mathbf v \leftarrow \beta\mathbf v - \eta\nabla f$, $\mathbf x \leftarrow \mathbf x + \mathbf v$) and **stochastic gradients** (using a random batch of data) are the variants used in machine learning.`,
        example: {
          problem: tx`Run two steps of gradient descent with $\eta = 0.1$ on $f(x,y) = x^2 + 4y^2$ from $(2, 1)$.`,
          steps: [
            tx`$\nabla f = (2x, 8y)$. At $(2, 1)$: $\nabla f = (4, 8)$.`,
            tx`Step 1: $(2, 1) - 0.1(4, 8) = (1.6, 0.2)$.`,
            tx`At $(1.6, 0.2)$: $\nabla f = (3.2, 1.6)$. Step 2: $(1.6, 0.2) - 0.1(3.2, 1.6) = (1.28, 0.04)$.`,
            tx`Each step multiplies $x$ by $0.8$ but $y$ by $0.2$. The steep direction converges fast and the shallow one slowly; with $\eta > 0.25$ the $y$-factor $|1 - 8\eta|$ exceeds 1 and it diverges.`,
          ],
        },
        pitfalls: [
          tx`There is no universally right learning rate; it depends on the curvature. Watch the loss and adjust.`,
          tx`For non-convex functions gradient descent finds *a* local minimum, not necessarily the best one.`,
          tx`Newton's method needs the Hessian to be positive definite; at a saddle point it can step uphill.`,
        ],
        usedIn: tx`Training machine-learning models, fitting nonlinear models to data, solving large linear systems (conjugate gradient), and every engineering design-optimization loop.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.int(1, 4), b = R.int(1, 4), x = [R.nz(-4, 4), R.nz(-4, 4)], eta = R.pick([0.05, 0.1, 0.2, 0.25]);
            const g = [2 * a * x[0], 2 * b * x[1]], nx = [x[0] - eta * g[0], x[1] - eta * g[1]];
            return {
              q: tx`Take one gradient descent step with $\eta = ${eta}$ on $f(x,y) = ${a === 1 ? '' : a}x^2 + ${b === 1 ? '' : b}y^2$ from $(${x[0]}, ${x[1]})$. Enter the new point.`,
              ans: { type: 'vec', answer: nx, placeholder: 'x, y' },
              hint: tx`$\nabla f = (${2 * a}x, ${2 * b}y)$. New point = old point $- \eta\nabla f$.`,
              sol: [tx`$\nabla f(${x[0]}, ${x[1]}) = (${g[0]}, ${g[1]})$.`, tx`$(${x[0]}, ${x[1]}) - ${eta}(${g[0]}, ${g[1]}) = (${fmt(nx[0])}, ${fmt(nx[1])})$.`],
            };
          } },
          { level: 2, gen(R) {
            const a = R.int(1, 10), b = R.int(1, 10), L = 2 * Math.max(a, b), eta = 2 / L;
            return {
              q: tx`For $f(x,y) = ${a === 1 ? '' : a}x^2 + ${b === 1 ? '' : b}y^2$, gradient descent with a fixed step $\eta$ converges from every start exactly when $\eta$ is below some threshold. Find it.`,
              ans: { type: 'num', answer: eta, abs: 1e-9, rel: 0.002 },
              hint: tx`Each coordinate is multiplied by $1 - 2a\eta$ (or $1 - 2b\eta$) per step. Both factors must have absolute value below 1.`,
              sol: [tx`$x \leftarrow (1 - ${2 * a}\eta)x$ and $y \leftarrow (1 - ${2 * b}\eta)y$.`, tx`$|1 - 2c\eta| < 1 \iff \eta < \frac1c$ for each coefficient $c$, so the steepest direction decides: $\eta < \frac{2}{${L}} = ${fmt(eta, 5)}$.`],
            };
          } },
          { level: 3, gen(R) {
            let A, d; do { const p = R.int(1, 5), q = R.int(1, 5), r = R.int(-2, 2); A = [[2 * p, r], [r, 2 * q]]; d = A[0][0] * A[1][1] - r * r; } while (d <= 0);
            const b = [R.int(-6, 6), R.int(-6, 6)], x = [(A[1][1] * b[0] - A[0][1] * b[1]) / d, (A[0][0] * b[1] - A[1][0] * b[0]) / d];
            const terms = [[A[0][0] / 2, 'x^2'], [A[0][1], 'xy'], [A[1][1] / 2, 'y^2'], [-b[0], 'x'], [-b[1], 'y']].filter(([c]) => c !== 0);
            const ftex = terms.map(([c, v], i) => `${c < 0 ? (i ? ' - ' : '-') : i ? ' + ' : ''}${Math.abs(c) === 1 ? '' : AM.fmt(Math.abs(c))}${v}`).join('');
            return {
              q: tx`Find the minimizer of $f(x,y) = ${ftex}$. (One Newton step from anywhere gets there.) Enter $x, y$.`,
              ans: { type: 'vec', answer: x, placeholder: 'x, y' },
              hint: tx`Set $\nabla f = \mathbf 0$. It's a linear system $H\mathbf x = \mathbf b$ with Hessian $H = ${pm(A)}$.`,
              sol: [tx`$\nabla f = (${A[0][0]}x ${AM.sgn(A[0][1])}y ${AM.sgn(-b[0])},\ ${A[1][0]}x ${AM.sgn(A[1][1])}y ${AM.sgn(-b[1])}) = \mathbf 0$.`, tx`$H = ${pm(A)}$ has $\det H = ${d} > 0$ and positive diagonal, so it's positive definite and $f$ is convex.`, tx`Solving gives $(x, y) = \left(${AM.frac(A[1][1] * b[0] - A[0][1] * b[1], d)},\ ${AM.frac(A[0][0] * b[1] - A[1][0] * b[0], d)}\right)$.`],
              verify() { const g = [A[0][0] * x[0] + A[0][1] * x[1] - b[0], A[1][0] * x[0] + A[1][1] * x[1] - b[1]]; return Math.abs(g[0]) + Math.abs(g[1]) < 1e-9 ? true : 'gradient not zero'; },
            };
          } },
        ],
      },
      {
        id: 'lagrange', title: 'Constrained optimization and Lagrange multipliers', minutes: 40,
        summary: 'The best point on a curve is where the contours just touch it.',
        idea: tx`Most real optimization has constraints: a fixed budget, a fixed amount of material, a law of physics. To maximize $f(x, y)$ while staying on the curve $g(x, y) = c$, picture the contour lines of $f$. Moving along the constraint, $f$ keeps changing as long as you're crossing contours. At the best point the constraint just *touches* a contour without crossing it, so the two curves are tangent and their gradients are parallel:
$$\nabla f = \lambda\nabla g.$$
The multiplier $\lambda$ has a meaning too: it's how much the optimal value would improve per unit of extra slack in the constraint, the **shadow price** of the constraint.`,
        everyday: tx`A company has \$10,000 to split between advertising and staff training, and profit depends on both. Lagrange multipliers find the best split, and the multiplier $\lambda$ answers the manager's next question: if the budget went up by \$1, how much more profit would we make? Economists call that the marginal value of money, and engineers use the same number to decide which design constraint is worth relaxing.`,
        visual: { widget: 'lagrange', caption: tx`Drag the pink point around the circle. The orange arrow is $\nabla f$, the green one $\nabla g$ (perpendicular to the circle). Find the spots where they line up: the orange contour through the point just kisses the circle there, and those are the constrained maximum and minimum.` },
        math: tx`**Problem.** Optimize $f(\mathbf x)$ subject to $g(\mathbf x) = c$.

**Lagrange condition.** At a constrained optimum (with $\nabla g \ne \mathbf 0$),
$$\nabla f = \lambda\nabla g, \qquad g(\mathbf x) = c.$$
In two variables that's three equations for $x, y, \lambda$. Equivalently, find critical points of the **Lagrangian** $\mathcal L = f - \lambda(g - c)$.

**Several constraints.** $\nabla f = \lambda_1\nabla g_1 + \cdots + \lambda_m\nabla g_m$.

**Meaning of $\lambda$.** If $f^*(c)$ is the optimal value as a function of the constraint level, then $\dfrac{df^*}{dc} = \lambda$.

**Inequality constraints** $g(\mathbf x)\le c$ lead to the **KKT conditions**: either the constraint is inactive ($\lambda = 0$) or it holds with equality ($g = c$) and $\lambda \ge 0$ for a maximum.

**Check your candidates.** Lagrange gives candidates; compare their $f$ values (and any boundary points) to find the actual max and min.`,
        example: {
          problem: tx`Maximize $f(x,y) = xy$ subject to $x + y = 10$.`,
          steps: [
            tx`$\nabla f = (y, x)$ and $\nabla g = (1, 1)$, so $y = \lambda$ and $x = \lambda$.`,
            tx`Hence $x = y$, and the constraint gives $x = y = 5$.`,
            tx`The maximum is $f = 25$ with $\lambda = 5$.`,
            tx`Check the meaning of $\lambda$: with $x + y = 11$ the best is $5.5^2 = 30.25$, an increase of about $5.25 \approx \lambda$ for one extra unit.`,
          ],
        },
        pitfalls: [
          tx`The equations $\nabla f = \lambda\nabla g$ give candidates for both maxima and minima. Evaluate $f$ at each to tell them apart.`,
          tx`Don't forget the constraint itself as an equation; without it the system is underdetermined.`,
          tx`On a bounded region (an inequality constraint), also check interior critical points where $\nabla f = \mathbf 0$.`,
        ],
        usedIn: tx`Economics (utility maximization, shadow prices), mechanics (constrained motion and equilibrium), statistics (maximum entropy, constrained estimation), and support vector machines in machine learning.`,
        practice: [
          { level: 1, gen(R) {
            const S = R.int(4, 40) * 2, a = R.int(1, 3), b = R.int(1, 3);
            const x = S / (2 * a), y = S / (2 * b), v = x * y;
            return {
              q: tx`Maximize $f(x,y) = xy$ subject to $${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${S}$. What is the maximum value?`,
              ans: { type: 'num', answer: v },
              hint: tx`$\nabla f = (y, x)$ and $\nabla g = (${a}, ${b})$. Lagrange gives $y = ${a}\lambda$ and $x = ${b}\lambda$.`,
              sol: [tx`$y = ${a}\lambda$, $x = ${b}\lambda$. Substitute: $${a}(${b}\lambda) + ${b}(${a}\lambda) = ${S}$, so $\lambda = ${fmt(S / (2 * a * b), 4)}$.`, tx`$x = ${fmt(x, 4)}$, $y = ${fmt(y, 4)}$ (each term of the constraint gets half the budget), and $f = ${fmt(v, 4)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const a = R.nz(-6, 6), b = R.nz(-6, 6), Rr = R.int(1, 5), n = Math.hypot(a, b), mx = R.chance(0.5);
            return {
              q: tx`Find the ${mx ? 'maximum' : 'minimum'} of $f(x,y) = ${a}x ${AM.sgn(b)}y$ on the circle $x^2 + y^2 = ${Rr * Rr}$. Four decimals.`,
              ans: { type: 'num', answer: (mx ? 1 : -1) * Rr * n, tol: 0.0006 },
              hint: tx`$(${a}, ${b}) = \lambda(2x, 2y)$, so $(x, y)$ points along $\pm(${a}, ${b})$. Scale it to have length $${Rr}$.`,
              sol: [tx`$(x, y) = \pm\frac{${Rr}}{\sqrt{${a * a + b * b}}}(${a}, ${b})$.`, tx`Then $f = \pm\frac{${Rr}(${a * a + b * b})}{\sqrt{${a * a + b * b}}} = \pm${Rr}\sqrt{${a * a + b * b}} \approx \pm${fmt(Rr * n, 4)}$. This is Cauchy–Schwarz in disguise.`],
            };
          } },
          { level: 3, gen(R) {
            const V = R.pick([8, 27, 64, 125, 216, 1000, 32, 500]), cost = R.pick(['box', 'opentop']);
            if (cost === 'box') { const s = Math.cbrt(V), A = 6 * s * s; return { q: tx`A closed rectangular box must have volume ${V}. Using Lagrange multipliers, find the smallest possible surface area. Two decimals.`, ans: { type: 'num', answer: A, tol: 0.01 }, hint: tx`Minimize $2(xy + yz + xz)$ subject to $xyz = ${V}$. Symmetry suggests $x = y = z$; Lagrange confirms it.`, sol: [tx`$\nabla(2xy + 2yz + 2xz) = \lambda\nabla(xyz)$ gives $2(y + z) = \lambda yz$, etc. Dividing pairs of equations forces $x = y = z$.`, tx`So each side is $\sqrt[3]{${V}} = ${fmt(s, 4)}$ and the area is $6(${fmt(s, 4)})^2 = ${fmt(A, 3)}$: a cube.`] }; }
            const z = Math.cbrt(V / 4), x = 2 * z, A = x * x + 4 * x * z;
            return {
              q: tx`An open-top box (no lid) must have volume ${V}. Find the smallest possible surface area. Two decimals.`,
              ans: { type: 'num', answer: A, tol: 0.01 },
              hint: tx`Minimize $xy + 2xz + 2yz$ subject to $xyz = ${V}$. Symmetry gives $x = y$; Lagrange then gives the height $z = x/2$.`,
              sol: [tx`Lagrange equations: $y + 2z = \lambda yz$, $x + 2z = \lambda xz$, $2x + 2y = \lambda xy$. The first two give $x = y$; then the third gives $z = x/2$.`, tx`$x \cdot x \cdot \frac x2 = ${V}$ gives $x = \sqrt[3]{${2 * V}} \approx ${fmt(x, 4)}$ and $z \approx ${fmt(z, 4)}$.`, tx`Area $= x^2 + 4xz \approx ${fmt(A, 3)}$.`],
              verify: C.near(x * x * z, V, 1e-9),
            };
          } },
        ],
      },
      {
        id: 'lp', title: 'Linear programming', minutes: 35,
        summary: 'Linear goals, linear limits, and why the answer is always at a corner.',
        idea: tx`A **linear program** maximizes or minimizes a linear objective, like profit $3x + 4y$, subject to linear inequality constraints, like limited machine hours and materials. The constraints carve out a **feasible region**: a polygon in 2D, a polyhedron in higher dimensions.

Because the objective is linear, its level sets are parallel lines. Slide the line in the improving direction until it's about to leave the region: the last point it touches is a **corner** (vertex). So you only need to check corners. The **simplex method** does exactly that in thousands of dimensions, walking from corner to better corner, and it schedules airlines, routes deliveries and blends fuels every day.`,
        everyday: tx`A bakery makes bread and cakes. Bread earns \$3 and cake \$4. Each needs oven time, labour and flour, and each resource is limited. Which mix maximizes profit? The answer is never "a bit of everything in the middle": it's always at a corner where some resources are fully used. Those fully-used resources are the bottlenecks, and their shadow prices tell the baker which one is worth expanding.`,
        visual: { widget: 'lp', caption: tx`Slide the profit line upward across the blue feasible region. The last point it touches is a green corner. Change the profit per unit: the best corner jumps from one vertex to another, but it's always a vertex.` },
        math: tx`**Standard form.** Maximize $\mathbf c^T\mathbf x$ subject to $A\mathbf x \le \mathbf b$, $\mathbf x \ge \mathbf 0$.

**Fundamental theorem.** If an optimal solution exists, one occurs at a vertex of the feasible region. A vertex in $n$ dimensions is where $n$ constraints hold with equality.

**Corner-point method (2D).** List every intersection of two constraint lines, keep the feasible ones, evaluate the objective at each, and pick the best.

**Simplex method.** Move along edges from vertex to adjacent vertex, always improving the objective, until no neighbour is better.

**Duality.** Every LP has a dual: $\min\ \mathbf b^T\mathbf y$ subject to $A^T\mathbf y \ge \mathbf c$, $\mathbf y \ge \mathbf 0$. The optimal values are equal, and the dual variables $\mathbf y$ are the shadow prices of the constraints.

**Special cases.** The region can be empty (infeasible) or the objective unbounded; ties along an edge mean many optimal solutions.`,
        example: {
          problem: tx`Maximize $3x + 4y$ subject to $x + y \le 8$, $x + 3y \le 18$, $2x + y \le 14$, $x, y \ge 0$.`,
          steps: [
            tx`Corners: $(0,0)$, $(7,0)$, $(0,6)$, and the intersections $x + y = 8$ with $2x + y = 14$ at $(6, 2)$ and $x + y = 8$ with $x + 3y = 18$ at $(3, 5)$.`,
            tx`Values: $0$, $21$, $24$, $26$, $29$.`,
            tx`The maximum is $29$ at $(3, 5)$.`,
            tx`At $(3,5)$ the constraints $x + y \le 8$ and $x + 3y \le 18$ are tight: they are the bottlenecks. $2x + y = 11 < 14$ has slack, so its shadow price is 0.`,
          ],
        },
        pitfalls: [
          tx`Check that a corner is actually feasible: two constraint lines can cross outside the region.`,
          tx`Don't forget the sign constraints $x, y \ge 0$; they create corners on the axes.`,
          tx`If the objective is parallel to an edge, every point on that edge is optimal.`,
        ],
        usedIn: tx`Scheduling, transportation and network flows, diet and blending problems, portfolio allocation, and as a subroutine inside integer programming and many approximation algorithms.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.int(1, 4), b = R.int(1, 4), c = R.int(2, 6) * a * b, p = R.int(1, 9), q = R.int(1, 9);
            const v = Math.max(p * (c / a), q * (c / b));
            return {
              q: tx`Maximize $${p}x + ${q}y$ subject to $${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y \le ${c}$ and $x, y \ge 0$.`,
              ans: { type: 'num', answer: v },
              hint: tx`The region is a triangle. Check its three corners: $(0,0)$, $(${c / a}, 0)$ and $(0, ${c / b})$.`,
              sol: [tx`Values: $0$, $${p}\cdot${c / a} = ${p * c / a}$, $${q}\cdot${c / b} = ${q * c / b}$.`, tx`Maximum: $${v}$.`],
            };
          } },
          { level: 2, gen(R) {
            let A1, A2, b1, b2, xs; do { A1 = [R.int(1, 3), R.int(1, 3)]; A2 = [R.int(1, 3), R.int(1, 3)]; const k = R.int(2, 5); xs = [R.int(1, 5), R.int(1, 5)]; b1 = A1[0] * xs[0] + A1[1] * xs[1]; b2 = A2[0] * xs[0] + A2[1] * xs[1]; } while (A1[0] * A2[1] - A1[1] * A2[0] === 0);
            const c = [R.int(1, 6), R.int(1, 6)];
            const lines = [[...A1, b1], [...A2, b2], [1, 0, 0], [0, 1, 0]], pts = [];
            for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const [a1, bb1, k1] = lines[i], [a2, bb2, k2] = lines[j], d = a1 * bb2 - a2 * bb1; if (!d) continue; const x = (k1 * bb2 - k2 * bb1) / d, y = (a1 * k2 - a2 * k1) / d; if (x > -1e-9 && y > -1e-9 && A1[0] * x + A1[1] * y <= b1 + 1e-9 && A2[0] * x + A2[1] * y <= b2 + 1e-9) pts.push([x, y]); }
            const vals = pts.map(([x, y]) => c[0] * x + c[1] * y), v = Math.max(...vals);
            return {
              q: tx`Maximize $${c[0]}x + ${c[1]}y$ subject to $${A1[0]}x + ${A1[1]}y \le ${b1}$, $\ ${A2[0]}x + ${A2[1]}y \le ${b2}$, $\ x, y \ge 0$.`.replace(/\b1x/g, 'x').replace(/\b1y/g, 'y'),
              ans: { type: 'num', answer: v },
              hint: tx`Find all corners (intersections of two boundary lines that satisfy every constraint), then evaluate the objective at each.`,
              sol: [tx`Feasible corners: $${pts.map(([x, y]) => `(${fmt(x, 3)}, ${fmt(y, 3)})`).join(',\\ ')}$.`, tx`Objective values: $${vals.map((x) => fmt(x, 3)).join(',\\ ')}$.`, tx`Maximum $= ${fmt(v, 4)}$.`],
            };
          } },
          { level: 3, gen(R) {
            const pb = R.int(2, 6), pc = R.int(3, 8), ovenB = R.int(1, 2), ovenC = R.int(2, 3), labB = R.int(1, 3), labC = R.int(1, 2), oven = R.int(8, 16) * 2, lab = R.int(8, 16) * 2;
            const lines = [[ovenB, ovenC, oven], [labB, labC, lab], [1, 0, 0], [0, 1, 0]], pts = [];
            for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const [a1, b1, k1] = lines[i], [a2, b2, k2] = lines[j], d = a1 * b2 - a2 * b1; if (!d) continue; const x = (k1 * b2 - k2 * b1) / d, y = (a1 * k2 - a2 * k1) / d; if (x > -1e-9 && y > -1e-9 && ovenB * x + ovenC * y <= oven + 1e-9 && labB * x + labC * y <= lab + 1e-9) pts.push([x, y]); }
            const vals = pts.map(([x, y]) => pb * x + pc * y), v = Math.max(...vals), best = pts[vals.indexOf(v)];
            return {
              q: tx`A bakery makes bread ($x$ batches) and cakes ($y$ batches). Bread needs ${ovenB} oven-hour${ovenB > 1 ? 's' : ''} and ${labB} labour-hour${labB > 1 ? 's' : ''} per batch; cake needs ${ovenC} oven-hours and ${labC} labour-hour${labC > 1 ? 's' : ''}. There are ${oven} oven-hours and ${lab} labour-hours. Profit is \$${pb} per bread batch and \$${pc} per cake batch. Fractional batches are allowed. What is the maximum profit?`,
              ans: { type: 'num', answer: v, unit: 'dollars' },
              hint: tx`Write the two resource constraints, find the corners of the feasible region, and evaluate the profit at each.`,
              sol: [tx`Maximize $${pb}x + ${pc}y$ subject to $${ovenB}x + ${ovenC}y \le ${oven}$ (oven), $${labB}x + ${labC}y \le ${lab}$ (labour), $x, y \ge 0$.`, tx`Corners: $${pts.map(([x, y]) => `(${fmt(x, 3)}, ${fmt(y, 3)})`).join(',\\ ')}$ with profits $${vals.map((x) => fmt(x, 3)).join(',\\ ')}$.`, tx`Best: $(${fmt(best[0], 3)}, ${fmt(best[1], 3)})$ for \$${fmt(v, 3)}.`],
            };
          } },
        ],
      },
    ],
  });
})();
