/* Module 12 — Complex analysis (Stage 3). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, C = AM.checks, M = AM.m;
  const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const ct = (re, im) => { const r = fmt(re, 4), i = Math.abs(im); if (Math.abs(im) < 1e-12) return r; if (Math.abs(re) < 1e-12) return `${im < 0 ? '-' : ''}${i === 1 ? '' : fmt(i, 4)}i`; return `${r} ${im < 0 ? '-' : '+'} ${i === 1 ? '' : fmt(i, 4)}i`; };

  AM.module({
    id: 'complex', stage: 3, title: 'Complex Analysis', aka: 'Complex Variables',
    blurb: 'Allowing $i = \\sqrt{-1}$ turns out to simplify mathematics rather than complicate it. Multiplication becomes rotation, oscillations become exponentials, and integrals that defeat real methods collapse to a sum of residues. Engineers use this every day for circuits, signals and fluid flow.',
    prereq: ['multivar', 'functions'],
    lessons: [
      {
        id: 'numbers', title: "Complex numbers and Euler's formula", minutes: 30,
        summary: 'Numbers with a direction, where multiplication is rotation.',
        idea: tx`Complex numbers $z = a + bi$, with $i^2 = -1$, started as a trick for solving cubic equations. They're best understood as points (or arrows) in a plane: $a$ across, $b$ up. Adding them adds arrows. Multiplying them is where the magic is: **lengths multiply and angles add**. Multiplying by $i$ rotates by $90^\circ$.

**Euler's formula**, $e^{i\theta} = \cos\theta + i\sin\theta$, ties it together: $e^{i\theta}$ is the point at angle $\theta$ on the unit circle, so every complex number can be written $re^{i\theta}$. Oscillations, waves and rotations become exponentials, which are much easier to differentiate and multiply than sines and cosines.`,
        everyday: tx`Electrical engineers represent alternating current as a rotating arrow called a *phasor*. Resistors, capacitors and inductors each scale and rotate that arrow by a fixed complex number, their impedance. Combining components becomes complex arithmetic instead of trigonometry, which is why power grids are designed with complex numbers. (Engineers write $j$ for $\sqrt{-1}$, since $i$ already means current.)`,
        visual: { widget: 'complexmul', caption: tx`Drag $z$ and $w$ and watch the green product: its angle is the sum of their angles and its length is the product of their lengths. Switch to *Powers* and put $z$ just outside the unit circle to see the spiral of De Moivre's theorem.` },
        math: tx`**Arithmetic.** $(a + bi) + (c + di) = (a + c) + (b + d)i$ and $(a + bi)(c + di) = (ac - bd) + (ad + bc)i$.

**Conjugate and modulus.** $\bar z = a - bi$, $\ |z| = \sqrt{a^2 + b^2}$, $\ z\bar z = |z|^2$, so $\dfrac1z = \dfrac{\bar z}{|z|^2}$.

**Polar form.** $z = r(\cos\theta + i\sin\theta) = re^{i\theta}$, where $r = |z|$ and $\theta = \arg z$.

**Euler's formula.** $e^{i\theta} = \cos\theta + i\sin\theta$; in particular $e^{i\pi} + 1 = 0$.

**Multiplication and powers.** $r_1e^{i\theta_1}\cdot r_2e^{i\theta_2} = r_1r_2e^{i(\theta_1 + \theta_2)}$ and $(re^{i\theta})^n = r^ne^{in\theta}$ (De Moivre).

**Roots.** The $n$ solutions of $z^n = w$ are equally spaced around a circle of radius $|w|^{1/n}$.

**Fundamental theorem of algebra.** Every polynomial of degree $n$ has exactly $n$ complex roots, counted with multiplicity.`,
        example: {
          problem: tx`Compute $(1 + i)^8$.`,
          steps: [
            tx`Polar form: $|1 + i| = \sqrt2$ and $\arg(1 + i) = \frac\pi4$, so $1 + i = \sqrt2\,e^{i\pi/4}$.`,
            tx`De Moivre: $(1+i)^8 = (\sqrt2)^8e^{i\cdot8\pi/4} = 16e^{2\pi i}$.`,
            tx`$e^{2\pi i} = 1$, so $(1 + i)^8 = 16$.`,
            tx`Multiplying out eight brackets would take far longer. Polar form turns powers into scaling and rotation.`,
          ],
        },
        pitfalls: [
          tx`$\arg z$ is only defined up to multiples of $2\pi$, and $\arctan(b/a)$ gives the wrong quadrant when $a < 0$.`,
          tx`$\sqrt{-4}\sqrt{-9} \ne \sqrt{36}$. Rules like $\sqrt{ab} = \sqrt a\sqrt b$ fail for complex numbers.`,
          tx`$|z + w| \le |z| + |w|$, with equality only when they point the same way.`,
        ],
        usedIn: tx`Solving ODEs with complex characteristic roots (Module 07), Fourier analysis (Module 13), eigenvalues of rotation-like matrices (Module 05) and all of signal processing run on Euler's formula.`,
        practice: [
          { level: 1, gen(R) {
            const z = [R.int(-5, 5), R.nz(-5, 5)], w = [R.int(-5, 5), R.nz(-5, 5)], p = cmul(z, w);
            return {
              q: tx`Compute $(${ct(...z)})(${ct(...w)})$. Enter the real part and the imaginary part, separated by a comma.`,
              ans: { type: 'vec', answer: p, placeholder: 'real, imaginary', show: tx`$${ct(...p)}$` },
              hint: tx`Expand like $(a + bi)(c + di)$ and use $i^2 = -1$.`,
              sol: [tx`$(${z[0]})(${w[0]}) + (${z[0]})(${w[1]})i + (${z[1]})(${w[0]})i + (${z[1]})(${w[1]})i^2$.`, tx`$= ${z[0] * w[0]} - (${z[1] * w[1]}) + (${z[0] * w[1] + z[1] * w[0]})i = ${ct(...p)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const z = [R.int(-6, 6), R.int(-6, 6)], w = [R.int(-4, 4), R.nz(-4, 4)], d = w[0] * w[0] + w[1] * w[1], num = cmul(z, [w[0], -w[1]]);
            return {
              q: tx`Compute $\dfrac{${ct(...z)}}{${ct(...w)}}$. Enter the real and imaginary parts (fractions are fine).`,
              ans: { type: 'vec', answer: [num[0] / d, num[1] / d], placeholder: 'real, imaginary', show: tx`$${AM.frac(num[0], d)} ${num[1] < 0 ? '-' : '+'} ${AM.frac(Math.abs(num[1]), d)}i$` },
              hint: tx`Multiply top and bottom by the conjugate of the denominator, $${ct(w[0], -w[1])}$.`,
              sol: [tx`Denominator: $(${ct(...w)})(${ct(w[0], -w[1])}) = ${w[0]}^2 + ${w[1]}^2 = ${d}$.`, tx`Numerator: $(${ct(...z)})(${ct(w[0], -w[1])}) = ${ct(...num)}$.`, tx`Result: $${AM.frac(num[0], d)} ${num[1] < 0 ? '-' : '+'} ${AM.frac(Math.abs(num[1]), d)}i$.`],
            };
          } },
          { level: 3, gen(R) {
            const [z, rt, at] = R.pick([[[1, 1], '\\sqrt2', '\\frac\\pi4'], [[1, -1], '\\sqrt2', '-\\frac\\pi4'], [[-1, 1], '\\sqrt2', '\\frac{3\\pi}4'], [[Math.sqrt(3), 1], '2', '\\frac\\pi6'], [[1, Math.sqrt(3)], '2', '\\frac\\pi3'], [[0, 2], '2', '\\frac\\pi2']]);
            const n = R.int(3, 9); let p = [1, 0]; for (let i = 0; i < n; i++) p = cmul(p, z);
            const zt = Math.abs(z[0] - Math.sqrt(3)) < 1e-9 ? `\\sqrt3 + i` : Math.abs(z[1] - Math.sqrt(3)) < 1e-9 ? '1 + \\sqrt3 i' : ct(...z);
            return {
              q: tx`Use polar form to compute $(${zt})^{${n}}$. Enter the real and imaginary parts (decimals to 3 places, or exact forms like <code>16sqrt(3)</code>).`,
              ans: { type: 'vec', answer: p.map((v) => (Math.abs(v) < 1e-9 ? 0 : v)), placeholder: 'real, imaginary' },
              hint: tx`Write $${zt} = ${rt}\,e^{i${at}}$, then raise the modulus to the ${n}th power and multiply the angle by ${n}.`,
              sol: [tx`$${zt} = ${rt}\,e^{i${at}}$.`, tx`$(${zt})^{${n}} = (${rt})^{${n}}e^{i\cdot${n}\cdot${at}}$, with modulus $${fmt(Math.hypot(...p), 4)}$ and angle $${n}\times${at}$.`, tx`In rectangular form: $${ct(Math.abs(p[0]) < 1e-9 ? 0 : p[0], Math.abs(p[1]) < 1e-9 ? 0 : p[1])}$.`],
            };
          } },
        ],
      },
      {
        id: 'analytic', title: 'Complex functions and analyticity', minutes: 35,
        summary: 'Complex functions as maps of the plane, and the Cauchy–Riemann equations.',
        idea: tx`A complex function $f(z)$ sends points of the plane to points of the plane, so you can't draw its graph, but you can watch what it does to a grid. Functions built from $z$ alone, like $z^2$, $e^z$ and $1/z$, have a remarkable property: wherever their derivative is nonzero they preserve angles. Tiny squares map to tiny squares, just rotated and scaled. Maps like this are called **conformal**.

The reason is that a complex derivative is much more demanding than a real one: the limit must be the same from every direction in the plane. Functions that pass this test are **analytic**, and they're remarkably rigid: knowing one on a tiny region determines it everywhere. The test itself is a pair of partial differential equations, the **Cauchy–Riemann equations**.`,
        everyday: tx`A flat map of the globe has to distort something. The Mercator projection is conformal: it preserves angles, so a straight line on the map is a constant compass bearing at sea. The price is that areas near the poles are hugely inflated, which is why Greenland looks as big as Africa. Conformal maps from complex analysis are used to design wing profiles, model fluid flow around obstacles, and solve heat problems on awkward shapes.`,
        visual: { widget: 'conformal', caption: tx`The left grid is mapped by $f$ to the right. Lines bend, but wherever they crossed at right angles they still do. Try $e^z$ (lines become rays and circles) and the Joukowski map $z + 1/z$, which turns circles into wing shapes.` },
        math: tx`**Real and imaginary parts.** $f(x + iy) = u(x, y) + iv(x, y)$.

**Complex derivative.** $f'(z) = \lim_{h\to0}\dfrac{f(z + h) - f(z)}{h}$, where $h$ is complex and may approach 0 from any direction.

**Cauchy–Riemann equations.** If $f$ is differentiable at $z$, then
$$u_x = v_y, \qquad u_y = -v_x.$$
Conversely, if the partial derivatives are continuous and satisfy these equations, $f$ is analytic, with $f'(z) = u_x + iv_x$.

**Examples.** $z^n$, $e^z$, $\sin z$ and $\cos z$ are analytic everywhere; $1/z$ everywhere except 0. $\bar z$, $\operatorname{Re}z$ and $|z|$ are analytic nowhere.

**Harmonic functions.** If $f = u + iv$ is analytic, $u$ and $v$ both satisfy Laplace's equation $u_{xx} + u_{yy} = 0$. That is why complex analysis solves steady-state heat and potential-flow problems.

**Conformality.** Where $f'(z)\ne0$, $f$ locally rotates by $\arg f'(z)$ and scales by $|f'(z)|$, preserving angles.`,
        example: {
          problem: tx`Check the Cauchy–Riemann equations for $f(z) = z^2$ and find $f'(z)$.`,
          steps: [
            tx`$(x + iy)^2 = x^2 - y^2 + 2ixy$, so $u = x^2 - y^2$ and $v = 2xy$.`,
            tx`$u_x = 2x = v_y$ ✓, and $u_y = -2y = -v_x$ ✓.`,
            tx`$f'(z) = u_x + iv_x = 2x + 2iy = 2z$, just as in real calculus.`,
            tx`By contrast, $f(z) = \bar z = x - iy$ has $u_x = 1$ but $v_y = -1$, so it is not analytic anywhere.`,
          ],
        },
        pitfalls: [
          tx`Having partial derivatives in $x$ and $y$ isn't enough; they must satisfy the Cauchy–Riemann equations.`,
          tx`$|z|$, $\operatorname{Re} z$ and $\bar z$ are continuous everywhere but analytic nowhere.`,
          tx`Conformality fails where $f'(z) = 0$: $z^2$ doubles angles at the origin.`,
        ],
        usedIn: tx`Potential flow and aerodynamics, electrostatics, and steady heat flow (Laplace's equation, Module 13) are solved with analytic functions and conformal maps.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.int(-5, 5), b = R.int(-5, 5), part = R.pick(['u', 'v']);
            const expr = part === 'u' ? `x^2 - y^2 + (${a})*x - (${b})*y` : `2*x*y + (${a})*y + (${b})*x`;
            return {
              q: tx`Write $f(z) = z^2 + (${ct(a, b)})z$ as $u(x,y) + i\,v(x,y)$. Enter $${part}(x, y)$.`,
              ans: { type: 'fn', expr, vars: ['x', 'y'], domain: [-2, 2], prefix: `$${part} =$`, placeholder: 'use x and y' },
              hint: tx`Substitute $z = x + iy$: $z^2 = x^2 - y^2 + 2ixy$, and expand $(${ct(a, b)})(x + iy)$ separately.`,
              sol: [tx`$z^2 = x^2 - y^2 + 2ixy$.`, tx`$(${ct(a, b)})(x + iy) = (${a}x - ${b}y) + i(${a}y + ${b}x)$.`, tx`So $u = x^2 - y^2 + ${a}x - (${b})y$ and $v = 2xy + ${a}y + ${b}x$.`],
            };
          } },
          { level: 2, gen(R) {
            const L = [
              ['u = x^2 - y^2,\\ v = 2xy', 0, '$u_x = 2x = v_y$, $u_y = -2y = -v_x$. (It is $z^2$.)'],
              ['u = x^2 + y^2,\\ v = 2xy', 1, '$u_x = 2x = v_y$, but $u_y = 2y \\ne -v_x = -2y$.'],
              ['u = e^x\\cos y,\\ v = e^x\\sin y', 0, '$u_x = e^x\\cos y = v_y$ and $u_y = -e^x\\sin y = -v_x$. (It is $e^z$.)'],
              ['u = x,\\ v = -y', 1, '$u_x = 1$ but $v_y = -1$. (It is $\\bar z$.)'],
              ['u = x^3 - 3xy^2,\\ v = 3x^2y - y^3', 0, '$u_x = 3x^2 - 3y^2 = v_y$ and $u_y = -6xy = -v_x$. (It is $z^3$.)'],
              ['u = 2x + y,\\ v = 2y - x', 0, '$u_x = 2 = v_y$, $u_y = 1 = -v_x$. (It is $(2 - i)z$.)'],
              ['u = \\sin x\\cosh y,\\ v = \\cos x\\sinh y', 0, '$u_x = \\cos x\\cosh y = v_y$, $u_y = \\sin x\\sinh y = -v_x$. (It is $\\sin z$.)'],
              ['u = x^2 - y^2,\\ v = -2xy', 1, '$u_x = 2x$ but $v_y = -2x$. (It is $\\bar z^2$.)'],
              ['u = e^x\\cos y,\\ v = -e^x\\sin y', 1, '$u_x = e^x\\cos y$ but $v_y = -e^x\\cos y$. (It is $\\overline{e^z}$.)'],
            ];
            const [tex, k, why] = R.pick(L);
            return {
              q: tx`Is $f = u + iv$ analytic, where $${tex}$?`,
              ans: { type: 'mc', choices: ['Analytic', 'Not analytic'], answer: k },
              hint: tx`Check both Cauchy–Riemann equations: $u_x = v_y$ and $u_y = -v_x$.`,
              sol: [why, tx`So $f$ is **${k ? 'not analytic' : 'analytic'}**.`],
            };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['pow', 'exp', 'inv']), z0 = [R.int(-2, 2), R.nz(-2, 2)];
            let d, ftex, step, F;
            if (kind === 'pow') { const n = R.int(2, 4); let p = [1, 0]; for (let i = 0; i < n - 1; i++) p = cmul(p, z0); d = [n * p[0], n * p[1]]; ftex = tx`z^{${n}}`; step = tx`$f'(z) = ${n}z^{${n - 1}}$, and $z_0^{${n - 1}} = ${ct(...p)}$.`; F = (z) => { let q = [1, 0]; for (let i = 0; i < n; i++) q = cmul(q, z); return q; }; }
            else if (kind === 'exp') { const k = R.nz(-2, 2), e = Math.exp(k * z0[0]); d = [k * e * Math.cos(k * z0[1]), k * e * Math.sin(k * z0[1])]; ftex = tx`e^{${k}z}`; step = tx`$f'(z) = ${k}e^{${k}z}$, and $e^{${k}z_0} = e^{${k * z0[0]}}(\cos ${k * z0[1]} + i\sin ${k * z0[1]})$.`; F = (z) => { const r = Math.exp(k * z[0]); return [r * Math.cos(k * z[1]), r * Math.sin(k * z[1])]; }; }
            else { const m2 = z0[0] ** 2 + z0[1] ** 2, sq = cmul(z0, z0), m4 = m2 * m2; d = [-sq[0] / m4, sq[1] / m4]; ftex = tx`\frac1z`; step = tx`$f'(z) = -\frac{1}{z^2}$, and $z_0^2 = ${ct(...sq)}$.`; F = (z) => { const m = z[0] ** 2 + z[1] ** 2; return [z[0] / m, -z[1] / m]; }; }
            return {
              q: tx`Compute $f'(z_0)$ for $f(z) = ${ftex}$ at $z_0 = ${ct(...z0)}$. Enter real and imaginary parts, 4 decimals or exact.`,
              ans: { type: 'vec', answer: d, tol: 0.0006, placeholder: 'real, imaginary' },
              hint: tx`Differentiate exactly as in real calculus, then evaluate with complex arithmetic.`,
              sol: [step, tx`$f'(z_0) \approx ${ct(d[0], d[1])}$.`],
              verify() { const h = 1e-6, a = F([z0[0] + h, z0[1]]), b = F([z0[0] - h, z0[1]]), nd = [(a[0] - b[0]) / (2 * h), (a[1] - b[1]) / (2 * h)]; return Math.abs(nd[0] - d[0]) + Math.abs(nd[1] - d[1]) < 1e-4 * Math.max(1, Math.hypot(...d)) ? true : `derivative mismatch ${nd} vs ${d}`; },
            };
          } },
        ],
      },
      {
        id: 'residues', title: 'Contour integrals and residues', minutes: 40,
        summary: 'Integrating around loops, and why only the singularities matter.',
        idea: tx`In the complex plane you integrate along curves. **Cauchy's theorem** says that if $f$ is analytic everywhere inside a closed loop, its integral around the loop is zero, whatever the loop's shape. All the interesting behaviour comes from **singularities**: points such as poles where $f$ blows up.

Near a pole, a function has a Laurent expansion with a term like $\frac{c}{z - z_0}$. That coefficient $c$ is the **residue**, and it's the only part that survives integration around the pole. The **residue theorem** says a loop integral equals $2\pi i$ times the sum of the residues inside. This turns hard real integrals, like $\int_{-\infty}^\infty \frac{dx}{1 + x^2}$, into simple algebra.`,
        everyday: tx`Picture a field with a few springs, each pumping out a fixed amount of water per minute. Build a fence around part of the field and measure the total flow across it. However you route the fence, the total depends only on which springs it encloses. The contour integral is the fence measurement and the residues are the springs' strengths. Enclose no springs and you measure zero, which is Cauchy's theorem.`,
        visual: { widget: 'residue', caption: tx`Drag the centre of the pink contour and change its radius. The numerical integral jumps only when a pole crosses the contour, and it always equals $2\pi i$ times the residues inside. Enclose nothing and it's zero.` },
        math: tx`**Contour integral.** For a curve $z(t)$, $a\le t\le b$: $\ \displaystyle\oint_C f(z)\,dz = \int_a^b f(z(t))\,z'(t)\,dt$.

**Key example.** Around the circle $|z - z_0| = r$: $\displaystyle\oint\frac{dz}{z - z_0} = 2\pi i$, while $\oint(z - z_0)^n dz = 0$ for every other integer $n$.

**Cauchy's theorem.** If $f$ is analytic on and inside $C$, then $\oint_C f\,dz = 0$.

**Cauchy's integral formula.** $f(z_0) = \dfrac{1}{2\pi i}\displaystyle\oint_C\frac{f(z)}{z - z_0}dz$.

**Residues.** At a simple pole, $\operatorname{Res}_{z_0}f = \lim_{z\to z_0}(z - z_0)f(z)$. For $f = g/h$ with $h(z_0) = 0 \ne h'(z_0)$: $\ \operatorname{Res} = \dfrac{g(z_0)}{h'(z_0)}$.

**Residue theorem** (contour traversed counterclockwise):
$$\oint_C f(z)\,dz = 2\pi i\sum_{\text{poles inside } C}\operatorname{Res}f.$$`,
        example: {
          problem: tx`Use residues to compute $\displaystyle\int_{-\infty}^{\infty}\frac{dx}{1 + x^2}$.`,
          steps: [
            tx`Integrate $f(z) = \frac{1}{1 + z^2}$ around a large semicircle in the upper half-plane. As the radius grows, the arc's contribution vanishes, leaving the real integral.`,
            tx`$1 + z^2 = (z - i)(z + i)$, so the poles are at $\pm i$; only $z = i$ lies inside.`,
            tx`$\operatorname{Res}_{z=i} = \frac{1}{z + i}\Big|_{z=i} = \frac{1}{2i}$.`,
            tx`$\int_{-\infty}^\infty\frac{dx}{1 + x^2} = 2\pi i\cdot\frac{1}{2i} = \pi$, which matches $\big[\arctan x\big]_{-\infty}^{\infty} = \pi$.`,
          ],
        },
        pitfalls: [
          tx`Only poles *inside* the contour count, and the contour must run counterclockwise.`,
          tx`The simple-pole formula fails for double poles. For a pole of order $m$ use $\frac{1}{(m-1)!}\lim\frac{d^{m-1}}{dz^{m-1}}\big[(z - z_0)^mf(z)\big]$.`,
          tx`When converting a real integral, check that the extra arc's contribution really goes to zero.`,
        ],
        usedIn: tx`Inverse Laplace and Fourier transforms (Module 13) are contour integrals. The Nyquist stability criterion in control engineering counts poles with a contour integral.`,
        practice: [
          { level: 1, gen(R) {
            let a, b; do { a = R.int(-4, 4); b = R.int(-4, 4); } while (a === b);
            const c = R.nz(-6, 6), v = c / (a - b);
            return {
              q: tx`Find the residue of $f(z) = \dfrac{${c}}{(z ${AM.sgn(-a)})(z ${AM.sgn(-b)})}$ at $z = ${a}$.`.replace(/\(z \+ 0\)|\(z - 0\)/g, 'z'),
              ans: { type: 'num', answer: v, abs: 1e-9, show: tx`$${AM.frac(c, a - b)}$` },
              hint: tx`Simple pole: multiply by $(z - ${a})$ and let $z \to ${a}$.`,
              sol: [tx`$(z - ${a})f(z) = \frac{${c}}{z ${AM.sgn(-b)}}$.`, tx`At $z = ${a}$: $\frac{${c}}{${a - b}} = ${AM.frac(c, a - b)}$.`],
            };
          } },
          { level: 2, gen(R) {
            let a, b; do { a = R.int(-4, 4); b = R.int(-4, 4); } while (a === b);
            const Rr = R.pick([0.5, 1.5, 2.5, 3.5, 5]), ra = 1 / (a - b), rb = 1 / (b - a), S = (Math.abs(a) < Rr ? ra : 0) + (Math.abs(b) < Rr ? rb : 0), k = 2 * S;
            return {
              q: tx`Let $C$ be the circle $|z| = ${Rr}$, counterclockwise. The integral $\displaystyle\oint_C \frac{dz}{(z ${AM.sgn(-a)})(z ${AM.sgn(-b)})}$ equals $k\pi i$. Find $k$.`.replace(/\(z \+ 0\)|\(z - 0\)/g, 'z'),
              ans: { type: 'num', answer: k, abs: 1e-9, show: tx`$k = ${AM.frac(Math.round(k * (a - b)), a - b)}$` },
              hint: tx`Poles at $${a}$ and $${b}$. Keep only those with $|z| < ${Rr}$, add their residues, multiply by $2\pi i$.`,
              sol: [tx`Residues: $\frac{1}{${a} - (${b})} = ${AM.frac(1, a - b)}$ at $z = ${a}$ and $\frac{1}{${b} - (${a})} = ${AM.frac(1, b - a)}$ at $z = ${b}$.`, tx`Inside $|z| = ${Rr}$: ${[Math.abs(a) < Rr ? `$z = ${a}$` : '', Math.abs(b) < Rr ? `$z = ${b}$` : ''].filter(Boolean).join(' and ') || 'no poles'}.`, tx`Integral $= 2\pi i\times${fmt(S, 4)}$, so $k = ${fmt(k, 4)}$.${Math.abs(a) < Rr && Math.abs(b) < Rr ? ' (With both poles inside, the residues cancel.)' : ''}`],
            };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['one', 'two', 'quad']);
            let f, tex, val, steps;
            if (kind === 'one') { const a = R.int(1, 5); f = (x) => 1 / (x * x + a * a); tex = tx`\frac{1}{x^2 + ${a * a}}`; val = Math.PI / a; steps = [tx`Pole in the upper half-plane: $z = ${a}i$, with residue $\frac{1}{2\cdot${a}i}$.`, tx`Integral $= 2\pi i\cdot\frac{1}{${2 * a}i} = \frac{\pi}{${a}}$.`]; }
            else if (kind === 'two') { let a, b; do { a = R.int(1, 4); b = R.int(1, 4); } while (a === b); f = (x) => 1 / ((x * x + a * a) * (x * x + b * b)); tex = tx`\frac{1}{(x^2 + ${a * a})(x^2 + ${b * b})}`; val = Math.PI / (a * b * (a + b)); steps = [tx`Upper-half-plane poles: $${a}i$ and $${b}i$.`, tx`Residues: $\frac{1}{2\cdot${a}i(${b * b} - ${a * a})}$ and $\frac{1}{2\cdot${b}i(${a * a} - ${b * b})}$.`, tx`Sum times $2\pi i$ simplifies to $\frac{\pi}{ab(a+b)} = \frac{\pi}{${a * b * (a + b)}}$.`]; }
            else { const p = R.int(-3, 3), q = R.int(1, 4); f = (x) => 1 / ((x - p) ** 2 + q * q); tex = tx`\frac{1}{x^2 ${AM.sgn(-2 * p)}x + ${p * p + q * q}}`; val = Math.PI / q; steps = [tx`Complete the square: $(x ${AM.sgn(-p)})^2 + ${q * q}$, so the poles are $${p} \pm ${q}i$.`, tx`Upper pole $z = ${p} + ${q}i$ has residue $\frac{1}{2\cdot${q}i}$, giving $2\pi i\cdot\frac{1}{${2 * q}i} = \frac{\pi}{${q}}$.`]; }
            return {
              q: tx`Use residues to evaluate $\displaystyle\int_{-\infty}^{\infty} ${tex}\,dx$. Four decimals, or an exact form like <code>pi/6</code>.`.replace('x^2 + 0x', 'x^2').replace(/\+ 0x/, ''),
              ans: { type: 'num', answer: val, tol: 0.0006 },
              hint: tx`Close the contour with a large semicircle in the upper half-plane. Only poles with positive imaginary part count.`,
              sol: steps,
              verify: C.near(M.integrate((t) => f(Math.tan(t)) / Math.cos(t) ** 2, -Math.PI / 2 + 1e-9, Math.PI / 2 - 1e-9, 20000), val, 1e-6),
            };
          } },
        ],
      },
    ],
  });
})();
