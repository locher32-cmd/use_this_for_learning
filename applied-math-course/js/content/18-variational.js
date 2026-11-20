/* Module 18 — Function spaces, calculus of variations and finite elements (Stage 5). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, C = AM.checks, M = AM.m, frac = AM.frac;

  AM.module({
    id: 'variational', stage: 5, title: 'Variational Methods', aka: 'Functional Analysis / Calculus of Variations / Finite Elements',
    blurb: 'Treat whole functions as points in a space with lengths and angles, and many problems become geometry: best approximation is projection, physical laws are minimization principles, and the finite element method (how bridges, aircraft and implants are designed) is projection onto a space of simple pieces.',
    prereq: ['analysis', 'linalg', 'fourier'],
    lessons: [
      {
        id: 'spaces', title: 'Function spaces and best approximation', minutes: 40,
        summary: 'Functions as vectors: inner products, orthogonal polynomials and projection.',
        idea: tx`Functions can be added and scaled just like vectors, so they form **vector spaces**. Give the space an inner product, typically $\langle f, g\rangle = \int_a^b f(x)g(x)\,dx$, and you get lengths ($\|f\| = \sqrt{\langle f,f\rangle}$), distances and angles between functions. Two functions are **orthogonal** if their inner product is zero; sines and cosines of different frequencies are the classic example.

All your linear algebra intuition carries over. The **best approximation** of $f$ by a simpler class (polynomials of degree $\le n$, say) in this norm is the **orthogonal projection** of $f$ onto that subspace, and it's easiest to compute with an orthogonal basis such as the **Legendre polynomials**. Fourier series are exactly this: projection onto sines and cosines.`,
        everyday: tx`Your phone stores a song as a list of coefficients in an orthogonal basis (cosine waves, in MP3 and AAC). Throwing away small coefficients is projecting onto a smaller subspace, and the error you hear is the distance from the original. Orthogonality is what guarantees that dropping some coefficients never makes the remaining ones wrong.`,
        visual: { widget: 'approx', caption: tx`Raise the degree and compare the orange projection with the pink Taylor polynomial. Taylor is perfect near 0 and terrible at the ends; the projection spreads its accuracy evenly across the interval. Try $|x|$ and the step, which have no Taylor series at 0 at all.` },
        math: tx`**Inner product space.** A vector space with $\langle\cdot,\cdot\rangle$ that is linear, symmetric and positive. On functions over $[a,b]$: $\langle f,g\rangle = \int_a^b fg\,dx$ and $\|f\|_2 = \left(\int_a^b f^2\right)^{1/2}$. Completing this space gives the Hilbert space $L^2$.

**Cauchy–Schwarz.** $|\langle f,g\rangle| \le \|f\|\,\|g\|$.

**Projection theorem.** The best approximation $p^*$ of $f$ from a subspace $V$ is characterized by $f - p^* \perp V$. With an orthogonal basis $\phi_0, \dots, \phi_n$ of $V$:
$$p^* = \sum_{k=0}^n\frac{\langle f, \phi_k\rangle}{\langle\phi_k, \phi_k\rangle}\phi_k.$$

**Legendre polynomials** on $[-1,1]$: $P_0 = 1$, $P_1 = x$, $P_2 = \frac12(3x^2 - 1)$, $(k+1)P_{k+1} = (2k+1)xP_k - kP_{k-1}$, orthogonal with $\langle P_k, P_k\rangle = \frac{2}{2k+1}$.

**Normal equations in function space.** With a non-orthogonal basis $1, x, \dots, x^n$ on $[0,1]$, the Gram matrix is the Hilbert matrix $H_{ij} = \frac{1}{i+j+1}$, which is famously ill-conditioned. That's why orthogonal bases matter.`,
        example: {
          problem: tx`Find the best approximation of $f(x) = x^2$ on $[-1,1]$ by a polynomial of degree at most 1.`,
          steps: [
            tx`Project onto $P_0 = 1$ and $P_1 = x$. $\langle x^2, 1\rangle = \int_{-1}^1x^2dx = \frac23$ and $\langle 1, 1\rangle = 2$, so $c_0 = \frac13$.`,
            tx`$\langle x^2, x\rangle = \int_{-1}^1x^3dx = 0$, so $c_1 = 0$.`,
            tx`Best line: $p^*(x) = \frac13$. The error $x^2 - \frac13$ is orthogonal to both $1$ and $x$.`,
            tx`Compare the Taylor line at 0, which is $0$: its error $\|x^2\|_2 = \sqrt{2/5} \approx 0.632$ is larger than the projection's $\|x^2 - \frac13\|_2 \approx 0.398$.`,
          ],
        },
        pitfalls: [
          tx`"Best" depends on the norm. The least-squares ($L^2$) best fit differs from the best worst-case (minimax) fit.`,
          tx`The projection formula with $\langle f,\phi_k\rangle/\langle\phi_k,\phi_k\rangle$ only works for an *orthogonal* basis.`,
          tx`Fitting high-degree polynomials in the monomial basis $1, x, x^2, \dots$ is numerically unstable; use an orthogonal basis.`,
        ],
        usedIn: tx`Fourier analysis (Module 13), spectral methods for PDEs, Galerkin and finite element methods (this module), quantum mechanics, and kernel methods in machine learning.`,
        practice: [
          { level: 1, gen(R) {
            const m = R.int(0, 5), n = R.int(0, 5);
            return { q: tx`With $\langle f, g\rangle = \int_0^1 f(x)g(x)\,dx$, compute $\langle x^{${m}}, x^{${n}}\rangle$.`.replace('x^{0}', '1').replace('x^{1}', 'x'), ans: { type: 'num', answer: 1 / (m + n + 1), abs: 1e-9, show: tx`$\frac{1}{${m + n + 1}}$` }, hint: tx`$\int_0^1 x^{m+n}dx$.`, sol: [tx`$\int_0^1 x^{${m + n}}dx = \frac{1}{${m + n + 1}}$. These numbers form the Hilbert matrix.`] };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['pow', 'exp', 'sin']), n = R.int(1, 6);
            const [ftex, v, s] = { pow: [tx`x^{${n}}`, 1 / (n + 1), tx`$\int_0^1 x^{${n}}dx = \frac{1}{${n + 1}}$.`], exp: [tx`e^x`, Math.E - 1, tx`$\int_0^1e^xdx = e - 1$.`], sin: [tx`\sin(\pi x)`, 2 / Math.PI, tx`$\int_0^1\sin\pi x\,dx = \frac2\pi$.`] }[kind];
            return { q: tx`Find the best constant approximation (in $L^2[0,1]$) of $f(x) = ${ftex}$. Four decimals or exact.`, ans: { type: 'num', answer: v, tol: 0.0006 }, hint: tx`Projecting onto the constant function 1 gives $c = \frac{\langle f, 1\rangle}{\langle 1,1\rangle}$: the average value of $f$.`, sol: [s, tx`Divide by $\langle1,1\rangle = 1$: the best constant is $${fmt(v, 5)}$, the mean value of $f$.`] };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['odd', 'exp', 'sin']);
            if (kind === 'odd') { const n = R.pick([1, 3, 5, 7]), v = 3 / (n + 2); return { q: tx`Find the Legendre coefficient $c_1 = \frac32\int_{-1}^1 f(x)\,x\,dx$ of $f(x) = x^{${n}}$.`.replace('x^{1}', 'x'), ans: { type: 'num', answer: v, abs: 1e-9, show: tx`$${frac(3, n + 2)}$` }, hint: tx`$\int_{-1}^1 x^{${n + 1}}dx = \frac{2}{${n + 2}}$.`, sol: [tx`$c_1 = \frac32\cdot\frac{2}{${n + 2}} = ${frac(3, n + 2)}$.`] }; }
            const [ftex, f, v] = kind === 'exp' ? ['e^x', Math.exp, 3 / Math.E] : ['\\sin(\\pi x)', (x) => Math.sin(Math.PI * x), 3 / Math.PI];
            return { q: tx`Find the Legendre coefficient $c_1 = \frac32\int_{-1}^1 f(x)\,x\,dx$ of $f(x) = ${ftex}$. Four decimals.`, ans: { type: 'num', answer: v, tol: 0.0006 }, hint: tx`Integrate $x f(x)$ by parts.`, sol: [tx`$\frac32\int_{-1}^1 x${ftex}\,dx \approx ${fmt(v, 5)}$${kind === 'exp' ? ' $= 3/e$' : ' $= 3/\\pi$'}.`], verify: C.near(1.5 * M.integrate((x) => x * f(x), -1, 1, 4000), v, 1e-8) };
          } },
          { level: 4, gen(R) {
            const kind = R.pick(['x2', 'x3', 'exp', 'sqrt']), [ftex, f] = { x2: ['x^2', (x) => x * x], x3: ['x^3', (x) => x ** 3], exp: ['e^x', Math.exp], sqrt: ['\\sqrt x', Math.sqrt] }[kind];
            const g0 = M.integrate(f, 0, 1, 4000), g1 = M.integrate((x) => x * f(x), 0, 1, 4000), det = 1 / 12, a = (g0 / 3 - g1 / 2) / det, b = (g1 - g0 / 2) / det;
            return { q: tx`Find the least-squares line $a + bx$ approximating $f(x) = ${ftex}$ on $[0,1]$ (minimizing $\int_0^1(f - a - bx)^2dx$). Enter $a, b$ to 4 decimals.`, ans: { type: 'vec', answer: [a, b], tol: 0.0006, placeholder: 'a, b' }, hint: tx`Normal equations with the Hilbert matrix: $\begin{pmatrix}1 & \frac12\\ \frac12 & \frac13\end{pmatrix}\begin{pmatrix}a\\b\end{pmatrix} = \begin{pmatrix}\int f\\ \int xf\end{pmatrix}$.`, sol: [tx`$\int_0^1 f = ${fmt(g0, 5)}$, $\int_0^1 xf = ${fmt(g1, 5)}$.`, tx`Solving: $a \approx ${fmt(a, 5)}$, $b \approx ${fmt(b, 5)}$.`], verify() { const r0 = M.integrate((x) => f(x) - a - b * x, 0, 1, 4000), r1 = M.integrate((x) => x * (f(x) - a - b * x), 0, 1, 4000); return Math.abs(r0) + Math.abs(r1) < 1e-8 ? true : 'residual not orthogonal'; } };
          } },
        ],
      },
      {
        id: 'eulerlagrange', title: 'Calculus of variations', minutes: 45,
        summary: 'Finding the best curve, and the Euler–Lagrange equation.',
        idea: tx`Ordinary calculus finds the *number* that minimizes a function. The **calculus of variations** finds the *function* that minimizes a **functional**, a rule that assigns a number to each whole curve: the length of a path, the time to slide down a ramp, the energy of a bent beam.

The trick is to perturb a candidate $y(x)$ by a small bump $\varepsilon\eta(x)$ and demand that the functional doesn't change to first order. This leads to a differential equation that the best curve must satisfy, the **Euler–Lagrange equation**. Much of physics is written this way: light takes the path of least time, and mechanics follows the path of least action.`,
        everyday: tx`Which ramp gets a ball from A to B fastest? Not the straight line. A curve that drops steeply at first lets the ball build speed early, and wins even though it's longer. The fastest curve is a cycloid, the shape traced by a point on a rolling wheel: the "brachistochrone" problem that Johann Bernoulli posed in 1696, solved by Newton overnight.`,
        visual: { widget: 'variations', caption: tx`Bend the orange trial curve and read off its travel time. Straight is slow; bending too much is slow too. The green cycloid beats every curve you can make: it solves the Euler–Lagrange equation for this travel-time functional.` },
        math: tx`**Problem.** Minimize $J[y] = \displaystyle\int_a^b F(x, y, y')\,dx$ over smooth $y$ with fixed $y(a)$, $y(b)$.

**Euler–Lagrange equation.** A minimizer satisfies
$$\frac{\partial F}{\partial y} - \frac{d}{dx}\frac{\partial F}{\partial y'} = 0.$$
(Derivation: set $\frac{d}{d\varepsilon}J[y + \varepsilon\eta]\big|_{\varepsilon=0} = 0$ for all bumps $\eta$ vanishing at the ends, then integrate by parts.)

**Special cases.**
- $F = F(y')$ only: $y'' = 0$, so extremals are straight lines (shortest paths).
- $F$ independent of $x$ (**Beltrami identity**): $F - y'\frac{\partial F}{\partial y'} = \text{const}$.

**Examples.** $\int y'^2dx$ gives $y'' = 0$. $\ \int(y'^2 + k^2y^2)\,dx$ gives $y'' = k^2y$. The brachistochrone gives a cycloid.

**Constraints.** To minimize $J$ subject to $\int G\,dx = c$, apply Euler–Lagrange to $F - \lambda G$ (a Lagrange multiplier, as in Module 14).

**Hamilton's principle.** Motion makes the action $\int(T - V)\,dt$ stationary; Euler–Lagrange then gives Newton's law $m\ddot x = -V'(x)$.`,
        example: {
          problem: tx`Minimize $J[y] = \int_0^1(y'^2 + y^2)\,dx$ with $y(0) = 0$, $y(1) = 1$.`,
          steps: [
            tx`$F = y'^2 + y^2$: $\frac{\partial F}{\partial y} = 2y$ and $\frac{\partial F}{\partial y'} = 2y'$.`,
            tx`Euler–Lagrange: $2y - \frac{d}{dx}(2y') = 0$, i.e. $y'' = y$.`,
            tx`General solution $y = A\cosh x + B\sinh x$. $y(0) = 0$ gives $A = 0$; $y(1) = 1$ gives $B = 1/\sinh 1$.`,
            tx`$y = \frac{\sinh x}{\sinh 1}$, with minimum value $J = \coth 1 \approx 1.313$ (the straight line $y = x$ gives $\frac43 \approx 1.333$).`,
          ],
        },
        pitfalls: [
          tx`Euler–Lagrange gives a necessary condition (a stationary curve), not automatically a minimum.`,
          tx`Treat $y$ and $y'$ as independent variables when taking $\partial F/\partial y$ and $\partial F/\partial y'$, then take the total $x$-derivative.`,
          tx`Free (unspecified) endpoints need natural boundary conditions $\partial F/\partial y' = 0$ there.`,
        ],
        usedIn: tx`Classical mechanics (Lagrangian and Hamiltonian), optics, optimal control, minimal surfaces and soap films, elasticity, and the weak forms behind finite elements (next lesson).`,
        practice: [
          { level: 1, gen(R) {
            const n = R.int(1, 5), c = R.int(1, 3), v = (c * c * n * n) / (2 * n - 1);
            return { q: tx`Evaluate the functional $J[y] = \int_0^1 y'(x)^2\,dx$ for $y = ${c === 1 ? '' : c}x^{${n}}$.`.replace('x^{1}', 'x'), ans: { type: 'num', answer: v, abs: 1e-9, show: tx`$${frac(c * c * n * n, 2 * n - 1)}$` }, hint: tx`$y' = ${c * n}x^{${n - 1}}$; square it and integrate.`, sol: [tx`$\int_0^1 ${c * c * n * n}x^{${2 * n - 2}}dx = \frac{${c * c * n * n}}{${2 * n - 1}}$.`] };
          } },
          { level: 2, gen(R) {
            const a = R.int(-5, 5), b = R.int(-5, 5), L = R.pick([1, 2, 4]);
            return { q: tx`Among all smooth $y$ on $[0, ${L}]$ with $y(0) = ${a}$ and $y(${L}) = ${b}$, what is the minimum value of $\int_0^{${L}} y'^2\,dx$?`, ans: { type: 'num', answer: (b - a) ** 2 / L, abs: 1e-9 }, hint: tx`Euler–Lagrange gives $y'' = 0$: a straight line, with constant slope $\frac{${b} - (${a})}{${L}}$.`, sol: [tx`The extremal is the line with slope $${frac(b - a, L)}$.`, tx`$J = \left(${frac(b - a, L)}\right)^2\cdot${L} = ${frac((b - a) ** 2, L)}$. (By Cauchy–Schwarz, no curve can do better.)`] };
          } },
          { level: 3, gen(R) {
            const k = R.pick([1, 2, 3, 0.5]), x = R.pick([0.25, 0.5, 0.75]), v = Math.sinh(k * x) / Math.sinh(k);
            return { q: tx`The minimizer of $\int_0^1\left(y'^2 + ${k * k}y^2\right)dx$ with $y(0) = 0$, $y(1) = 1$ satisfies $y'' = ${k * k}y$. Find $y(${x})$. Five decimals.`.replace('+ 1y^2', '+ y^2'), ans: { type: 'num', answer: v, tol: 0.00002 }, hint: tx`Try $y = A\sinh(${k}x) + B\cosh(${k}x)$ and apply the boundary conditions.`, sol: [tx`$y(0) = 0 \Rightarrow B = 0$; $y(1) = 1 \Rightarrow A = 1/\sinh ${k}$.`, tx`$y(${x}) = \frac{\sinh(${fmt(k * x)})}{\sinh(${k})} \approx ${fmt(v, 6)}$.`], verify: C.near(M.solve((t, z) => [z[1], k * k * z[0]], [0, k / Math.sinh(k)], 0, x, 4000).pop()[1][0], v, 1e-8) };
          } },
          { level: 4, gen(R) {
            const A = R.pick([1, 2, 0.5, 3]), v = 12 * A * A;
            return { q: tx`Minimize $\int_0^1 y'^2\,dx$ over $y$ with $y(0) = y(1) = 0$ subject to the area constraint $\int_0^1 y\,dx = ${A}$. What is the minimum value?`, ans: { type: 'num', answer: v, abs: 1e-9 }, hint: tx`Apply Euler–Lagrange to $y'^2 - \lambda y$: $2y'' = -\lambda$, so $y$ is a parabola $cx(1 - x)$. Fit $c$ to the area.`, sol: [tx`$y = cx(1 - x)$ with $\int_0^1 cx(1-x)\,dx = \frac c6 = ${A}$, so $c = ${6 * A}$.`, tx`$\int_0^1 (c(1 - 2x))^2dx = \frac{c^2}{3} = ${fmt(v)}$.`], verify: C.near(M.integrate((x) => (6 * A * (1 - 2 * x)) ** 2, 0, 1), v, 1e-9) };
          } },
        ],
      },
      {
        id: 'fem', title: 'Weak forms and the finite element method', minutes: 45,
        summary: 'Solving differential equations by projecting onto simple piecewise functions.',
        idea: tx`The **finite element method** (FEM) is how engineers simulate stress in a bridge, airflow over a wing or heat in a processor. It starts by rewriting a differential equation in **weak form**: instead of demanding $-u'' = f$ at every point, demand that both sides agree when multiplied by any test function $v$ and integrated. Integration by parts moves one derivative onto $v$, so rougher functions are allowed.

Then approximate $u$ by a combination of simple building blocks, typically "hat" functions that are 1 at one mesh node and 0 at the others. The weak form becomes a linear system $K\mathbf U = \mathbf b$ for the nodal values: the **stiffness matrix** $K$ is sparse because each hat only touches its neighbours. Mathematically, FEM finds the best approximation in an energy norm: it's the projection idea from lesson 1 again.`,
        everyday: tx`Car crash simulations, prosthetic hip design and weather models all chop their domain into millions of small elements: triangles, tetrahedra, bricks. On each element the solution is simple (linear, say), and the elements are stitched together through shared nodes. Refining the mesh where things change quickly, such as near a crack tip, gives accuracy where it matters without wasting computation elsewhere.`,
        visual: { widget: 'fem', caption: tx`The orange piecewise-linear FEM solution is built from the faint blue hat functions. Increase the number of elements and watch it converge to the dashed exact solution; the $L^2$ error drops about 4× each time you double the elements.` },
        math: tx`**Model problem.** $-u'' = f$ on $(0,1)$ with $u(0) = u(1) = 0$.

**Weak form.** Find $u$ with $u(0) = u(1) = 0$ such that
$$\int_0^1 u'v'\,dx = \int_0^1 fv\,dx \quad\text{for all test functions } v \text{ with } v(0) = v(1) = 0.$$

**Galerkin method.** Choose basis functions $\varphi_1, \dots, \varphi_n$, set $u_h = \sum U_j\varphi_j$, and test with each $\varphi_i$: $\ K\mathbf U = \mathbf b$ with
$$K_{ij} = \int_0^1\varphi_i'\varphi_j'\,dx, \qquad b_i = \int_0^1 f\varphi_i\,dx.$$

**Linear elements.** On a uniform mesh with $N$ elements ($h = 1/N$), hat functions give $K = \frac1h\operatorname{tridiag}(-1, 2, -1)$, and $b_i \approx hf(x_i)$.

**Accuracy.** The error is $O(h)$ in slope (energy norm) and $O(h^2)$ in value ($L^2$ norm). In 1D, linear elements are exact at the nodes for this problem.

**Céa's lemma.** The FEM solution is the best approximation from the finite element space in the energy norm $\|v\|_E = \left(\int v'^2\right)^{1/2}$.`,
        example: {
          problem: tx`Solve $-u'' = 1$, $u(0) = u(1) = 0$, with 2 linear elements (one interior node at $x = \frac12$).`,
          steps: [
            tx`$h = \frac12$. The single hat $\varphi_1$ rises from 0 to 1 on $[0, \frac12]$ and falls on $[\frac12, 1]$, with slopes $\pm2$.`,
            tx`$K_{11} = \int_0^1\varphi_1'^2dx = 4\cdot1 = 4$ (that's $\frac2h$). $b_1 = \int_0^1 1\cdot\varphi_1\,dx = \frac12$ (the area under the hat).`,
            tx`$4U_1 = \frac12$, so $U_1 = \frac18$.`,
            tx`The exact solution is $u = \frac{x(1-x)}{2}$, and $u(\frac12) = \frac18$: exact at the node, as theory predicts in 1D.`,
          ],
        },
        pitfalls: [
          tx`Boundary conditions on $u$ must be built into the basis (or the system), not just hoped for.`,
          tx`$K_{ij}$ uses derivatives of the basis functions; $b_i$ uses the basis functions themselves.`,
          tx`More elements don't help if $f$ or the geometry is badly resolved; refine where the solution changes fastest.`,
        ],
        usedIn: tx`Structural mechanics, heat transfer, electromagnetics, fluid dynamics and biomechanics: essentially every engineering simulation package (ANSYS, Abaqus, COMSOL, FEniCS) is built on this method.`,
        practice: [
          { level: 1, gen(R) {
            const N = R.int(2, 20), L = R.pick([1, 2]), h = L / N;
            return { q: tx`For $-u'' = f$ on $[0, ${L}]$ with ${N} equal linear elements, what is a diagonal entry $K_{ii}$ of the stiffness matrix for an interior node?`, ans: { type: 'num', answer: 2 / h, abs: 1e-9 }, hint: tx`The hat at node $i$ has slope $\pm\frac1h$ over two elements of length $h$.`, sol: [tx`$K_{ii} = \int\varphi_i'^2 = \frac{1}{h^2}\cdot2h = \frac2h$ with $h = ${fmt(h, 4)}$: $K_{ii} = ${fmt(2 / h, 4)}$. Off-diagonal neighbours get $-\frac1h = ${fmt(-1 / h, 4)}$.`] };
          } },
          { level: 2, gen(R) {
            const N = R.int(2, 10), h = 1 / N, i = R.int(1, N - 1), kind = R.pick(['const', 'lin']), c = R.int(1, 6), xi = i * h;
            const v = kind === 'const' ? c * h : c * xi * h;
            return { q: tx`With ${N} equal elements on $[0,1]$, compute the load entry $b_{${i}} = \int_0^1 f\varphi_{${i}}\,dx$ for $f(x) = ${kind === 'const' ? c : `${c === 1 ? '' : c}x`}$, where $\varphi_{${i}}$ is the hat at $x = ${fmt(xi, 4)}$. Exact fraction or 5 decimals.`, ans: { type: 'num', answer: v, abs: 1e-9, rel: 0.0002 }, hint: tx`The hat has height 1 and base $2h$, so its area is $h$. For a linear $f$, the hat is symmetric, so $\int f\varphi_i = f(x_i)\,h$.`, sol: [tx`$b_{${i}} = ${kind === 'const' ? `${c}\\cdot h` : `f(x_{${i}})\\,h = ${fmt(c * xi, 4)}h`} = ${fmt(v, 6)}$ with $h = ${fmt(h, 5)}$.`], verify: C.near(M.integrate((x) => (kind === 'const' ? c : c * x) * Math.max(0, 1 - Math.abs(x - xi) / h), 0, 1, 20000), v, 1e-6) };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['const', 'lin', 'quad']), c = R.int(1, 6), h = 0.5, f = { const: () => c, lin: (x) => c * x, quad: (x) => c * x * x }[kind];
            const b = M.integrate((x) => f(x) * Math.max(0, 1 - Math.abs(x - 0.5) / h), 0, 1, 4000), U = b / (2 / h);
            return { q: tx`Solve $-u'' = ${{ const: c, lin: `${c === 1 ? '' : c}x`, quad: `${c === 1 ? '' : c}x^2` }[kind]}$, $u(0) = u(1) = 0$ with 2 linear elements. Find the value $U_1$ at $x = \frac12$. Five decimals.`, ans: { type: 'num', answer: U, tol: 0.00002 }, hint: tx`One unknown: $K_{11}U_1 = b_1$ with $K_{11} = \frac2h = 4$ and $b_1 = \int_0^1 f\varphi_1\,dx$.`, sol: [tx`$b_1 = ${fmt(b, 6)}$.`, tx`$U_1 = \frac{b_1}{4} = ${fmt(U, 6)}$. In 1D this equals the exact $u(\tfrac12)$ for any $f$.`] };
          } },
          { level: 4, gen(R) {
            const c = R.int(1, 8), N = 3, h = 1 / 3, b = c * h, K = [[2 / h, -1 / h], [-1 / h, 2 / h]], d = K[0][0] * K[1][1] - K[0][1] * K[1][0], U1 = (b * K[1][1] - K[0][1] * b) / d;
            return { q: tx`Solve $-u'' = ${c}$, $u(0) = u(1) = 0$ with 3 equal linear elements (interior nodes at $\frac13$ and $\frac23$). Set up the $2\times2$ system $K\mathbf U = \mathbf b$ and find $U_1$.`, ans: { type: 'num', answer: U1, abs: 1e-9, show: tx`$${frac(c, 9)}$` }, hint: tx`$K = \frac1h\begin{pmatrix}2 & -1\\-1 & 2\end{pmatrix}$ with $h = \frac13$, and $b_i = ${c}h$.`, sol: [tx`$K = \begin{pmatrix}6 & -3\\-3 & 6\end{pmatrix}$, $\mathbf b = (${frac(c, 3)}, ${frac(c, 3)})$.`, tx`By symmetry $U_1 = U_2$, so $3U_1 = \frac{${c}}{3}$ and $U_1 = ${frac(c, 9)}$.`, tx`Exact: $u(\frac13) = \frac{${c}}{2}\cdot\frac13\cdot\frac23 = ${frac(c, 9)}$. Exact at the nodes again.`], verify: C.near(U1, (c * (1 / 3) * (2 / 3)) / 2, 1e-12) };
          } },
        ],
      },
    ],
  });
})();
