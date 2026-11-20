/* Module 05 — Linear algebra (Stage 1). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, C = AM.checks, frac = AM.frac;
  const pm = (rows) => `\\begin{pmatrix} ${rows.map((r) => r.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
  const col = (v) => pm(v.map((x) => [x]));
  const vt = (v) => `(${v.join(', ')})`;
  const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
  const det2 = ([[a, b], [c, d]]) => a * d - b * c;
  const det3 = (A) => A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
  const randMat = (R, n, lo, hi) => Array.from({ length: n }, () => Array.from({ length: n }, () => R.int(lo, hi)));

  /* Exact Gaussian elimination with fractions, returning TeX steps */
  const Q = { // rationals as [num, den]
    n: (p, q = 1) => { if (q < 0) { p = -p; q = -q; } const g = AM.m.gcd(p, q) || 1; return [p / g, q / g]; },
    sub: (a, b) => Q.n(a[0] * b[1] - b[0] * a[1], a[1] * b[1]), mul: (a, b) => Q.n(a[0] * b[0], a[1] * b[1]), div: (a, b) => Q.n(a[0] * b[1], a[1] * b[0]),
    tex: (a) => frac(a[0], a[1]), zero: (a) => a[0] === 0,
  };
  function elimination(A, b) {
    const n = A.length, M = A.map((r, i) => [...r.map((x) => Q.n(x)), Q.n(b[i])]), steps = [];
    const aug = () => `\\left[\\begin{array}{${'c'.repeat(n)}|c} ${M.map((r) => r.map(Q.tex).join(' & ')).join(' \\\\ ')} \\end{array}\\right]`;
    steps.push(`Augmented matrix: $${aug()}$.`);
    for (let k = 0; k < n; k++) {
      let p = k; while (p < n && Q.zero(M[p][k])) p++;
      if (p === n) continue;
      if (p !== k) { [M[p], M[k]] = [M[k], M[p]]; steps.push(`Swap $R_${k + 1}$ and $R_${p + 1}$: $${aug()}$.`); }
      const ops = [];
      for (let i = k + 1; i < n; i++) {
        if (Q.zero(M[i][k])) continue;
        const f = Q.div(M[i][k], M[k][k]);
        for (let j = k; j <= n; j++) M[i][j] = Q.sub(M[i][j], Q.mul(f, M[k][j]));
        ops.push(`R_${i + 1} \\leftarrow R_${i + 1} ${f[0] < 0 ? '+' : '-'} ${Q.tex([Math.abs(f[0]), f[1]]) === '1' ? '' : Q.tex([Math.abs(f[0]), f[1]])}R_${k + 1}`);
      }
      if (ops.length) steps.push(`$${ops.join(',\\ ')}$: $${aug()}$.`);
    }
    return steps;
  }

  AM.module({
    id: 'linalg', stage: 1, title: 'Linear Algebra', aka: 'Linear Algebra (often "Applied Linear Algebra" or "Matrix Methods")',
    blurb: 'Linear algebra is the workhorse of applied math: almost every large computation, from simulating a bridge to training a model, is eventually a matrix problem. You will learn to see matrices as transformations, solve systems, find the special directions called eigenvectors, and approximate when exact answers don\'t exist.',
    prereq: ['functions'],
    lessons: [
      {
        id: 'vectors', title: 'Vectors and the dot product', minutes: 25,
        summary: 'Arrows with length and direction, and the one number that measures how aligned two are.',
        idea: tx`A **vector** is a list of numbers, like $(3, 4)$, that you can picture as an arrow: 3 across, 4 up. Vectors describe anything with size and direction, like a velocity or a force, and more generally any list of measurements: a customer's purchases, the pixels of an image, the state of a system.

You add vectors tip to tail and scale them by stretching. The **dot product** multiplies matching entries and adds the results. That single number measures alignment: large and positive when the arrows point the same way, zero when they're perpendicular, negative when they oppose each other.`,
        everyday: tx`You push a heavy cart with force $\mathbf{F}$, but it can only roll along the track direction $\mathbf{d}$. Only the part of your push along the track does useful work, and that work is $\mathbf{F}\cdot\mathbf{d}$. Push straight down on the cart and the dot product is zero: lots of effort, no motion.

Recommendation engines use the same number. Describe your tastes and a film's features as vectors, and a large dot product means a good match.`,
        visual: { widget: 'vectors', caption: tx`Drag the tips of $\mathbf u$ and $\mathbf v$. Make them perpendicular and watch the dot product hit zero. Make them point in opposite directions and it turns negative. Switch to *Sum* to see the parallelogram rule.` },
        math: tx`**Operations** in $\R^n$: $\mathbf u + \mathbf v = (u_1+v_1, \dots, u_n+v_n)$ and $c\mathbf u = (cu_1, \dots, cu_n)$.

**Length (norm).** $\|\mathbf u\| = \sqrt{u_1^2 + \cdots + u_n^2}$. A **unit vector** has length 1: $\hat{\mathbf u} = \mathbf u/\|\mathbf u\|$.

**Dot product.**
$$\mathbf u\cdot\mathbf v = u_1v_1 + \cdots + u_nv_n = \|\mathbf u\|\,\|\mathbf v\|\cos\theta,$$
so $\mathbf u\perp\mathbf v \iff \mathbf u\cdot\mathbf v = 0$.

**Projection** of $\mathbf v$ onto $\mathbf u$ (the shadow of $\mathbf v$ along $\mathbf u$):
$$\operatorname{proj}_{\mathbf u}\mathbf v = \frac{\mathbf u\cdot\mathbf v}{\mathbf u\cdot\mathbf u}\,\mathbf u.$$

**Cauchy–Schwarz inequality.** $|\mathbf u\cdot\mathbf v| \le \|\mathbf u\|\,\|\mathbf v\|$.`,
        example: {
          problem: tx`Find the angle between $\mathbf u = (1, 2, 2)$ and $\mathbf v = (3, 0, 4)$, and the projection of $\mathbf v$ onto $\mathbf u$.`,
          steps: [
            tx`$\mathbf u\cdot\mathbf v = 1(3) + 2(0) + 2(4) = 11$.`,
            tx`$\|\mathbf u\| = \sqrt{1+4+4} = 3$ and $\|\mathbf v\| = \sqrt{9+0+16} = 5$.`,
            tx`$\cos\theta = \frac{11}{3\cdot5} = \frac{11}{15}$, so $\theta = \arccos(0.733) \approx 42.8^\circ$.`,
            tx`$\operatorname{proj}_{\mathbf u}\mathbf v = \frac{11}{9}(1,2,2) = \left(\frac{11}{9}, \frac{22}{9}, \frac{22}{9}\right)$.`,
          ],
        },
        pitfalls: [
          tx`The dot product of two vectors is a number, not a vector.`,
          tx`$\|\mathbf u + \mathbf v\| \ne \|\mathbf u\| + \|\mathbf v\|$ in general. The triangle inequality only gives $\le$.`,
          tx`Projection divides by $\mathbf u\cdot\mathbf u = \|\mathbf u\|^2$, not by $\|\mathbf u\|$.`,
        ],
        usedIn: tx`Least squares and regression (later in this module, and Module 09) are projections. Fourier coefficients (Module 13) are dot products of a signal with sine waves. Gradients and directional derivatives (Module 06) are dot products.`,
        practice: [
          { level: 1, gen(R) {
            const u = [R.int(-5, 5), R.int(-5, 5), R.int(-5, 5)], v = [R.int(-5, 5), R.int(-5, 5), R.int(-5, 5)], d = dot(u, v);
            return {
              q: tx`Compute $\mathbf u\cdot\mathbf v$ for $\mathbf u = ${vt(u)}$ and $\mathbf v = ${vt(v)}$.`,
              ans: { type: 'num', answer: d },
              hint: tx`Multiply matching entries and add.`,
              sol: [tx`$${u.map((x, i) => `(${x})(${v[i]})`).join(' + ')} = ${u.map((x, i) => x * v[i]).join(' + ').replace(/\+ -/g, '- ')} = ${d}$.`],
            };
          } },
          { level: 2, gen(R) {
            const n = R.pick([2, 3]); let u, v;
            do { u = Array.from({ length: n }, () => R.int(-4, 5)); v = Array.from({ length: n }, () => R.int(-4, 5)); } while (!dot(u, u) || !dot(v, v));
            const d = dot(u, v), nu = Math.sqrt(dot(u, u)), nv = Math.sqrt(dot(v, v)), th = (Math.acos(Math.max(-1, Math.min(1, d / (nu * nv)))) * 180) / Math.PI;
            return {
              q: tx`Find the angle, in degrees, between $\mathbf u = ${vt(u)}$ and $\mathbf v = ${vt(v)}$. One decimal place is enough.`,
              ans: { type: 'num', answer: th, tol: 0.1, unit: 'degrees' },
              hint: tx`$\cos\theta = \dfrac{\mathbf u\cdot\mathbf v}{\|\mathbf u\|\,\|\mathbf v\|}$.`,
              sol: [tx`$\mathbf u\cdot\mathbf v = ${d}$, $\|\mathbf u\| = \sqrt{${dot(u, u)}}$, $\|\mathbf v\| = \sqrt{${dot(v, v)}}$.`, tx`$\cos\theta = \dfrac{${d}}{\sqrt{${dot(u, u)}}\sqrt{${dot(v, v)}}} \approx ${fmt(d / (nu * nv), 4)}$.`, tx`$\theta \approx ${fmt(th, 2)}^\circ$.`],
            };
          } },
          { level: 3, gen(R) {
            const n = R.pick([2, 3]); let u, v;
            do { u = Array.from({ length: n }, () => R.int(-4, 4)); v = Array.from({ length: n }, () => R.int(-5, 5)); } while (!dot(u, u) || !dot(u, v));
            const k = dot(u, v) / dot(u, u), p = u.map((x) => k * x);
            return {
              q: tx`Find the projection of $\mathbf v = ${vt(v)}$ onto $\mathbf u = ${vt(u)}$. Enter its ${n} components separated by commas (fractions are fine).`,
              ans: { type: 'vec', answer: p, show: tx`$${frac(dot(u, v), dot(u, u))}${vt(u)} = \left(${u.map((x) => frac(dot(u, v) * x, dot(u, u))).join(',\\ ')}\right)$`, placeholder: 'e.g. 3/5, 6/5' },
              hint: tx`$\operatorname{proj}_{\mathbf u}\mathbf v = \dfrac{\mathbf u\cdot\mathbf v}{\mathbf u\cdot\mathbf u}\mathbf u$. Compute the scalar first.`,
              sol: [tx`$\mathbf u\cdot\mathbf v = ${dot(u, v)}$ and $\mathbf u\cdot\mathbf u = ${dot(u, u)}$.`, tx`Scalar: $${frac(dot(u, v), dot(u, u))}$. Projection: $${frac(dot(u, v), dot(u, u))}${vt(u)} = \left(${u.map((x) => frac(dot(u, v) * x, dot(u, u))).join(',\\ ')}\right)$.`],
            };
          } },
        ],
      },
      {
        id: 'matrices', title: 'Matrices as transformations', minutes: 35,
        summary: 'A matrix is a machine that moves every point of space at once.',
        idea: tx`A matrix is more than a table of numbers. Multiplying by a $2\times2$ matrix $A$ moves every point of the plane: rotating, stretching, shearing or flipping it, while keeping straight lines straight and the origin fixed. Maps like this are called **linear transformations**.

The trick to reading a matrix: its columns are where the basis arrows land. The first column is where $(1,0)$ goes and the second is where $(0,1)$ goes. Everything else follows, because every vector is a combination of those two. The **determinant** tells you how much areas get scaled, and its sign tells you whether the plane was flipped.`,
        everyday: tx`Rotating, resizing and skewing a photo are all matrix multiplications applied to every pixel's coordinates. Doing one edit after another means multiplying the matrices, which is why the order of edits matters: rotate-then-stretch isn't the same as stretch-then-rotate.

In 3D graphics, every frame of a video game pushes millions of points through matrices to turn the world into what the camera sees.`,
        visual: { widget: 'matrix2d', caption: tx`Pick a preset or drag the sliders. The blue arrow is the first column of $A$, the pink arrow the second. Watch the green unit square: its area is $|\det A|$. Make the determinant negative and the orange F appears mirrored.` },
        math: tx`**Matrix–vector product.** $A\mathbf x$ is a combination of the columns of $A$:
$$\begin{pmatrix} a & b\\ c & d\end{pmatrix}\begin{pmatrix} x\\ y\end{pmatrix} = x\begin{pmatrix} a\\ c\end{pmatrix} + y\begin{pmatrix} b\\ d\end{pmatrix}.$$

**Matrix product.** $(AB)_{ij}$ = row $i$ of $A$ dotted with column $j$ of $B$. $AB$ means *apply $B$ first, then $A$*. In general $AB \ne BA$.

**Determinant** ($2\times2$). $\det\begin{pmatrix} a & b\\ c & d\end{pmatrix} = ad - bc$, the signed area scale factor. $\det(AB) = \det A\,\det B$.

**Inverse.** $A^{-1}$ exists exactly when $\det A \ne 0$:
$$\begin{pmatrix} a & b\\ c & d\end{pmatrix}^{-1} = \frac{1}{ad-bc}\begin{pmatrix} d & -b\\ -c & a\end{pmatrix}.$$

**Rotation by $\theta$:** $\ \begin{pmatrix}\cos\theta & -\sin\theta\\ \sin\theta & \cos\theta\end{pmatrix}$.`,
        example: {
          problem: tx`Let $A = \begin{pmatrix} 2 & 1\\ 1 & 3\end{pmatrix}$. Find $A\begin{pmatrix}1\\-1\end{pmatrix}$, $\det A$ and $A^{-1}$.`,
          steps: [
            tx`$A\begin{pmatrix}1\\-1\end{pmatrix} = 1\begin{pmatrix}2\\1\end{pmatrix} - 1\begin{pmatrix}1\\3\end{pmatrix} = \begin{pmatrix}1\\-2\end{pmatrix}$.`,
            tx`$\det A = 2\cdot3 - 1\cdot1 = 5$. So $A$ scales every area by 5 and doesn't flip orientation.`,
            tx`$A^{-1} = \frac15\begin{pmatrix}3 & -1\\ -1 & 2\end{pmatrix}$.`,
            tx`Check: $AA^{-1} = \frac15\begin{pmatrix}6-1 & -2+2\\ 3-3 & -1+6\end{pmatrix} = I$.`,
          ],
        },
        pitfalls: [
          tx`Matrix multiplication isn't commutative. $AB$ and $BA$ usually differ, and one of them may not even be defined.`,
          tx`$(AB)^{-1} = B^{-1}A^{-1}$: the order reverses, like taking off shoes and socks.`,
          tx`$\det(A + B) \ne \det A + \det B$.`,
        ],
        usedIn: tx`Every linear model, from circuit networks to finite-difference simulations (Modules 11 and 13), boils down to matrices. Rotations, changes of coordinates, Markov chains (Module 15) and neural-network layers are all matrix multiplications.`,
        practice: [
          { level: 1, gen(R) {
            const A = randMat(R, 2, -6, 6), d = det2(A);
            return {
              q: tx`Compute $\det ${pm(A)}$.`,
              ans: { type: 'num', answer: d },
              hint: tx`$\det\begin{pmatrix} a & b\\ c & d\end{pmatrix} = ad - bc$.`,
              sol: [tx`$(${A[0][0]})(${A[1][1]}) - (${A[0][1]})(${A[1][0]}) = ${A[0][0] * A[1][1]} - (${A[0][1] * A[1][0]}) = ${d}$.`],
            };
          } },
          { level: 2, gen(R) {
            const A = randMat(R, 2, -4, 4), B = randMat(R, 2, -4, 4);
            const P = [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
            return {
              q: tx`Compute $AB$ for $A = ${pm(A)}$ and $B = ${pm(B)}$. Enter the four entries row by row, separated by commas.`,
              ans: { type: 'vec', answer: P.flat(), show: tx`$${pm(P)}$`, placeholder: 'top-left, top-right, bottom-left, bottom-right' },
              hint: tx`Entry $(i,j)$ is row $i$ of $A$ dotted with column $j$ of $B$.`,
              sol: [tx`Top-left: $(${A[0][0]})(${B[0][0]}) + (${A[0][1]})(${B[1][0]}) = ${P[0][0]}$. Top-right: $(${A[0][0]})(${B[0][1]}) + (${A[0][1]})(${B[1][1]}) = ${P[0][1]}$.`, tx`Bottom-left: $(${A[1][0]})(${B[0][0]}) + (${A[1][1]})(${B[1][0]}) = ${P[1][0]}$. Bottom-right: $(${A[1][0]})(${B[0][1]}) + (${A[1][1]})(${B[1][1]}) = ${P[1][1]}$.`, tx`$AB = ${pm(P)}$.`],
            };
          } },
          { level: 3, gen(R) {
            if (R.chance(0.5)) {
              let A, d; do { A = randMat(R, 2, -5, 5); d = det2(A); } while (d === 0 || Math.abs(d) > 6);
              const [[a, b], [c, dd]] = A, inv = [dd / d, -b / d, -c / d, a / d];
              return {
                q: tx`Find $A^{-1}$ for $A = ${pm(A)}$. Enter the four entries row by row (fractions are fine).`,
                ans: { type: 'vec', answer: inv, show: tx`$${pm([[frac(dd, d), frac(-b, d)], [frac(-c, d), frac(a, d)]])}$` },
                hint: tx`Swap the diagonal entries, negate the off-diagonal ones, divide by $\det A$.`,
                sol: [tx`$\det A = ${d}$.`, tx`$A^{-1} = \frac{1}{${d}}${pm([[dd, -b], [-c, a]])} = ${pm([[frac(dd, d), frac(-b, d)], [frac(-c, d), frac(a, d)]])}$.`],
              };
            }
            const A = randMat(R, 3, -3, 3), d = det3(A), m = (i, j) => { const r = [0, 1, 2].filter((x) => x !== i), c = [0, 1, 2].filter((x) => x !== j); return A[r[0]][c[0]] * A[r[1]][c[1]] - A[r[0]][c[1]] * A[r[1]][c[0]]; };
            return {
              q: tx`Compute $\det ${pm(A)}$.`,
              ans: { type: 'num', answer: d },
              hint: tx`Expand along the first row: $a_{11}M_{11} - a_{12}M_{12} + a_{13}M_{13}$, where $M_{1j}$ is the $2\times2$ determinant left after deleting row 1 and column $j$.`,
              sol: [tx`Minors: $M_{11} = ${m(0, 0)}$, $M_{12} = ${m(0, 1)}$, $M_{13} = ${m(0, 2)}$.`, tx`$\det = (${A[0][0]})(${m(0, 0)}) - (${A[0][1]})(${m(0, 1)}) + (${A[0][2]})(${m(0, 2)}) = ${d}$.`],
            };
          } },
        ],
      },
      {
        id: 'systems', title: 'Linear systems and Gaussian elimination', minutes: 35,
        summary: "Solving many equations at once, and when there's no solution or infinitely many.",
        idea: tx`A system of linear equations asks for numbers that satisfy several conditions at once. With two unknowns, each equation is a line and a solution is a point on every line. Two lines usually cross once (one solution), but they can be parallel (no solution) or the same line (infinitely many).

**Gaussian elimination** solves systems of any size. Use one equation to eliminate a variable from the others, repeat until the system is triangular, then back-substitute. Computers solve systems with millions of unknowns this way.`,
        everyday: tx`A café order of 2 coffees and 1 muffin cost \$11; another of 1 coffee and 3 muffins cost \$13. Two unknown prices, two equations: $2c + m = 11$ and $c + 3m = 13$. Double the second and subtract the first: $5m = 15$, so $m = 3$ and $c = 4$.

Balancing chemical equations, finding currents in a circuit and working out traffic flow through a road network are the same problem with more unknowns.`,
        visual: { widget: 'systems', caption: tx`Each slider row edits one equation. Find coefficients that make the lines parallel: the determinant becomes 0 and the solution disappears. Then adjust $c_2$ until the lines coincide.` },
        math: tx`**Matrix form.** A system is $A\mathbf x = \mathbf b$; write the **augmented matrix** $[A\,|\,\mathbf b]$.

**Row operations** (they never change the solution set): swap two rows; multiply a row by a nonzero number; add a multiple of one row to another.

**Gaussian elimination.** Use row operations to reach **row echelon form** (zeros below each pivot), then back-substitute from the bottom up.

**How many solutions?** Exactly one of:
- **one**, when every column of $A$ has a pivot (for square $A$: $\det A \ne 0$);
- **none**, when some row reduces to $0 = c$ with $c \ne 0$;
- **infinitely many**, when there are free variables and no contradiction.

**Cramer's rule** ($2\times2$): $x = \dfrac{\det A_x}{\det A}$ and $y = \dfrac{\det A_y}{\det A}$, where $A_x$ is $A$ with its first column replaced by $\mathbf b$.`,
        example: {
          problem: tx`Solve $x + 2y + z = 4$, $\ 2x + 5y + 3z = 11$, $\ x + 3y + 4z = 11$.`,
          steps: [
            tx`Augmented matrix: $\left[\begin{array}{ccc|c}1&2&1&4\\2&5&3&11\\1&3&4&11\end{array}\right]$.`,
            tx`$R_2 \leftarrow R_2 - 2R_1$ and $R_3 \leftarrow R_3 - R_1$: $\left[\begin{array}{ccc|c}1&2&1&4\\0&1&1&3\\0&1&3&7\end{array}\right]$.`,
            tx`$R_3 \leftarrow R_3 - R_2$: $\left[\begin{array}{ccc|c}1&2&1&4\\0&1&1&3\\0&0&2&4\end{array}\right]$.`,
            tx`Back-substitute: $z = 2$, then $y = 3 - z = 1$, then $x = 4 - 2y - z = 0$. The solution is $(0, 1, 2)$.`,
          ],
        },
        pitfalls: [
          tx`Apply each row operation to the whole augmented row, right-hand side included.`,
          tx`Two equations in three unknowns can never have exactly one solution: there are either none or infinitely many.`,
          tx`In practice, don't compute $A^{-1}$ to solve $A\mathbf x = \mathbf b$. Elimination is faster and more accurate.`,
        ],
        usedIn: tx`Almost every numerical method ends in a linear system: finite differences for PDEs (Module 13), Newton's method in several variables (Module 11), and the normal equations of least squares and regression (this module and Module 09).`,
        practice: [
          { level: 1, gen(R) {
            let A; do { A = randMat(R, 2, -5, 5); } while (det2(A) === 0);
            const x = [R.int(-5, 5), R.int(-5, 5)], b = A.map((r) => dot(r, x)), d = det2(A);
            const eq = (r, c) => `${AM.co(r[0], 'x')} ${r[1] < 0 ? '-' : '+'} ${AM.co(Math.abs(r[1]), 'y')} = ${c}`.replace(/^0x \+ /, '').replace(/^0x - /, '-');
            return {
              q: tx`Solve $\begin{cases} ${A.map((r, i) => (r[0] === 0 ? `${AM.co(r[1], 'y')} = ${b[i]}` : r[1] === 0 ? `${AM.co(r[0], 'x')} = ${b[i]}` : eq(r, b[i]))).join(' \\\\ ')} \end{cases}$. Enter $x, y$.`,
              ans: { type: 'vec', answer: x, placeholder: 'x, y' },
              hint: tx`Eliminate one variable: multiply the equations so one variable has matching coefficients, then subtract. Or use Cramer's rule with $\det A = ${d}$.`,
              sol: [tx`$\det A = ${d}$. Cramer: $x = \dfrac{${b[0]}\cdot${A[1][1]} - ${A[0][1]}\cdot${b[1]}}{${d}} = ${x[0]}$.`, tx`$y = \dfrac{${A[0][0]}\cdot${b[1]} - ${b[0]}\cdot${A[1][0]}}{${d}} = ${x[1]}$.`, tx`Check in both equations: $${A[0][0]}(${x[0]}) + ${A[0][1]}(${x[1]}) = ${b[0]}$ and $${A[1][0]}(${x[0]}) + ${A[1][1]}(${x[1]}) = ${b[1]}$.`],
            };
          } },
          { level: 2, gen(R) {
            let A, d; do { A = randMat(R, 3, -3, 3); d = det3(A); } while (d === 0 || A[0][0] === 0 || Math.abs(d) > 30);
            const x = [R.int(-4, 4), R.int(-4, 4), R.int(-4, 4)], b = A.map((r) => dot(r, x));
            const eq = (r, c) => { let s = ''; ['x', 'y', 'z'].forEach((v, i) => { if (!r[i]) return; s += s ? (r[i] < 0 ? ' - ' : ' + ') + AM.co(Math.abs(r[i]), v) : AM.co(r[i], v); }); return `${s || '0'} &= ${c}`; };
            return {
              q: tx`Solve the system $$\begin{aligned} ${A.map((r, i) => eq(r, b[i])).join(' \\\\ ')} \end{aligned}$$ Enter $x, y, z$.`,
              ans: { type: 'vec', answer: x, placeholder: 'x, y, z' },
              hint: tx`Use row 1 to clear $x$ from rows 2 and 3, then use the new row 2 to clear $y$ from row 3. Back-substitute from $z$ upwards.`,
              sol: [...elimination(A, b), tx`Back-substitute to get $(x, y, z) = (${x.join(', ')})$. Check: every original equation holds.`],
            };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['one', 'none', 'many']);
            let r1, r2, r3, b1, b2, b3;
            do { r1 = [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)]; r2 = [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)]; } while (det2([[r1[0], r1[1]], [r2[0], r2[1]]]) === 0);
            b1 = R.int(-6, 6); b2 = R.int(-6, 6);
            const p = R.nz(-2, 2), q = R.nz(-2, 2);
            if (kind === 'one') { do { r3 = [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)]; } while (det3([r1, r2, r3]) === 0); b3 = R.int(-6, 6); }
            else { r3 = r1.map((v, i) => p * v + q * r2[i]); b3 = p * b1 + q * b2 + (kind === 'none' ? R.nz(-3, 3) : 0); }
            const eq = (r, c) => { let s = ''; ['x', 'y', 'z'].forEach((v, i) => { if (!r[i]) return; s += s ? (r[i] < 0 ? ' - ' : ' + ') + AM.co(Math.abs(r[i]), v) : AM.co(r[i], v); }); return `${s || '0'} &= ${c}`; };
            const choices = ['Exactly one solution', 'No solution', 'Infinitely many solutions'];
            const sol = kind === 'one'
              ? [tx`$\det A = ${det3([r1, r2, r3])} \ne 0$, so elimination produces a pivot in every column.`, tx`A square system with nonzero determinant has exactly one solution.`]
              : [tx`Row 3 of the coefficient matrix is $${p}\times$ row 1 $${q < 0 ? '-' : '+'} ${Math.abs(q)}\times$ row 2, so $\det A = 0$ and elimination turns row 3 into zeros on the left.`, tx`On the right that combination gives $${p}(${b1}) ${q < 0 ? '-' : '+'} ${Math.abs(q)}(${b2}) = ${p * b1 + q * b2}$, while row 3 has $${b3}$.`, kind === 'none' ? tx`So the last row reads $0 = ${b3 - p * b1 - q * b2}$: a contradiction. **No solution.**` : tx`So the last row reads $0 = 0$: one variable is free. **Infinitely many solutions.**`];
            return {
              q: tx`How many solutions does this system have? $$\begin{aligned} ${[[r1, b1], [r2, b2], [r3, b3]].map(([r, c]) => eq(r, c)).join(' \\\\ ')} \end{aligned}$$`,
              ans: { type: 'mc', choices, answer: { one: 0, none: 1, many: 2 }[kind] },
              hint: tx`Compute $\det A$ first. If it's zero, look for a combination of rows 1 and 2 that reproduces row 3 on the left side, then compare right-hand sides.`,
              sol,
            };
          } },
        ],
      },
      {
        id: 'eigen', title: 'Eigenvalues and eigenvectors', minutes: 40,
        summary: 'The special directions a matrix stretches but never turns.',
        idea: tx`Most vectors get knocked off their direction when you multiply them by a matrix. A few special ones don't: $A$ only stretches or shrinks them along their own line. Those are **eigenvectors**, and the stretch factor is the **eigenvalue** $\lambda$: $A\mathbf v = \lambda\mathbf v$.

Eigenvectors are the natural axes of a transformation. In those coordinates a complicated matrix becomes simple stretching, which is why eigenvalues decide the long-run behaviour of anything applied over and over: populations, Markov chains, vibrations, PageRank.`,
        everyday: tx`Spin a globe. Every point on the surface moves except those on the axis through the poles, which stay on the same line. That axis is an eigenvector of the rotation, with eigenvalue 1.

Or stretch a sheet of rubber sideways. Horizontal arrows just get longer (eigenvalue = the stretch factor) and vertical arrows don't change (eigenvalue 1), but diagonal arrows tilt. Only horizontal and vertical are eigen-directions.`,
        visual: { widget: 'eigen', caption: tx`Drag $\mathbf x$ around the unit circle (or press Play). Usually $A\mathbf x$ points somewhere else; when it lines up with $\mathbf x$, you've found an eigenvector. Try the rotation preset, which has none, and the shear, which has only one.` },
        math: tx`**Definition.** $\mathbf v \ne \mathbf 0$ is an eigenvector of $A$ with eigenvalue $\lambda$ if $A\mathbf v = \lambda\mathbf v$.

**Finding them.** $A\mathbf v = \lambda\mathbf v \iff (A - \lambda I)\mathbf v = \mathbf 0$, which has a nonzero solution exactly when
$$\det(A - \lambda I) = 0 \quad\text{(the characteristic equation).}$$
For a $2\times2$ matrix this is $\lambda^2 - (\operatorname{tr}A)\lambda + \det A = 0$, where $\operatorname{tr}A = a + d$.

**Useful facts.** The eigenvalues add up to $\operatorname{tr}A$ and multiply to $\det A$. A triangular matrix has its diagonal entries as eigenvalues. Symmetric matrices have real eigenvalues and perpendicular eigenvectors.

**Diagonalization.** If $A$ has $n$ independent eigenvectors (the columns of $P$), then $A = PDP^{-1}$ with $D$ diagonal, and $A^k = PD^kP^{-1}$.`,
        example: {
          problem: tx`Find the eigenvalues and eigenvectors of $A = \begin{pmatrix} 4 & 1\\ 2 & 3\end{pmatrix}$.`,
          steps: [
            tx`$\operatorname{tr}A = 7$ and $\det A = 12 - 2 = 10$, so $\lambda^2 - 7\lambda + 10 = 0$.`,
            tx`Factor: $(\lambda - 5)(\lambda - 2) = 0$, so $\lambda = 5$ or $\lambda = 2$.`,
            tx`$\lambda = 5$: $A - 5I = \begin{pmatrix} -1 & 1\\ 2 & -2\end{pmatrix}$ gives $-v_1 + v_2 = 0$, so $\mathbf v = (1, 1)$.`,
            tx`$\lambda = 2$: $A - 2I = \begin{pmatrix} 2 & 1\\ 2 & 1\end{pmatrix}$ gives $2v_1 + v_2 = 0$, so $\mathbf v = (1, -2)$. Check: $A(1,-2) = (2, -4) = 2(1,-2)$.`,
          ],
        },
        pitfalls: [
          tx`Eigenvectors are only defined up to scale: $(1,1)$ and $(3,3)$ are the same eigen-direction.`,
          tx`The zero vector never counts as an eigenvector, but $\lambda = 0$ is a perfectly good eigenvalue. It means $A$ is singular.`,
          tx`A real matrix can have complex eigenvalues. A rotation has no real eigenvector at all.`,
        ],
        usedIn: tx`Stability of equilibria in differential equations (Module 07) is decided by eigenvalues. Vibration modes of the wave equation (Module 13), long-run Markov chain behaviour (Module 15), PCA and the SVD (next lessons) all rest on eigenvectors.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.int(-5, 6), d = R.int(-5, 6), b = R.int(-6, 6), upper = R.chance(0.5), A = upper ? [[a, b], [0, d]] : [[a, 0], [b, d]];
            return {
              q: tx`Find the eigenvalues of $${pm(A)}$. Enter both, separated by a comma.`,
              ans: { type: 'vec', answer: [a, d], unordered: true, placeholder: 'λ₁, λ₂' },
              hint: tx`For a triangular matrix, $\det(A - \lambda I)$ is the product of the diagonal entries of $A - \lambda I$.`,
              sol: [tx`$\det(A - \lambda I) = (${a} - \lambda)(${d} - \lambda)$ because the matrix is triangular.`, tx`So $\lambda = ${a}$ and $\lambda = ${d}$: the diagonal entries.`],
            };
          } },
          { level: 2, gen(R) {
            let l1, l2, a, d, P, b, c;
            for (;;) {
              l1 = R.int(-4, 6); l2 = R.int(-4, 6); if (l1 === l2) continue;
              a = R.int(-3, 5); d = l1 + l2 - a; P = a * d - l1 * l2; if (P === 0) continue;
              const divs = []; for (let k = 1; k <= Math.abs(P); k++) if (P % k === 0 && k <= 8 && Math.abs(P / k) <= 8) divs.push(k);
              if (!divs.length) continue;
              b = R.pick(divs) * R.sign(); c = P / b; break;
            }
            const A = [[a, b], [c, d]], T = a + d, D = a * d - b * c;
            return {
              q: tx`Find the eigenvalues of $A = ${pm(A)}$.`,
              ans: { type: 'vec', answer: [l1, l2], unordered: true, placeholder: 'λ₁, λ₂' },
              hint: tx`Solve $\lambda^2 - (\operatorname{tr}A)\lambda + \det A = 0$. Here $\operatorname{tr}A = ${T}$.`,
              sol: [tx`$\operatorname{tr}A = ${T}$, $\det A = ${D}$.`, tx`$\lambda^2 ${T < 0 ? '+' : '-'} ${Math.abs(T)}\lambda ${D < 0 ? '-' : '+'} ${Math.abs(D)} = (\lambda ${l1 < 0 ? '+' : '-'} ${Math.abs(l1)})(\lambda ${l2 < 0 ? '+' : '-'} ${Math.abs(l2)}) = 0$.`, tx`$\lambda = ${l1}$ and $\lambda = ${l2}$. Check: they sum to the trace and multiply to the determinant.`],
              verify: C.near((l1 + l2) * 1000 + l1 * l2, T * 1000 + D, 1e-12),
            };
          } },
          { level: 3, gen(R) {
            let l1, l2, a, d, P, b, c;
            for (;;) {
              l1 = R.int(-4, 6); l2 = R.int(-4, 6); if (l1 === l2) continue;
              a = R.int(-3, 5); d = l1 + l2 - a; P = a * d - l1 * l2; if (P === 0) continue;
              const divs = []; for (let k = 1; k <= Math.abs(P); k++) if (P % k === 0 && k <= 6 && Math.abs(P / k) <= 8) divs.push(k);
              if (!divs.length) continue;
              b = R.pick(divs) * R.sign(); c = P / b; break;
            }
            const A = [[a, b], [c, d]], y = (l1 - a) / b;
            return {
              q: tx`$A = ${pm(A)}$ has eigenvalue $\lambda = ${l1}$. Find an eigenvector for it, scaled so its first entry is 1.`,
              ans: { type: 'vec', answer: [1, y], show: tx`$\left(1,\ ${frac(l1 - a, b)}\right)$`, placeholder: '1, ?' },
              hint: tx`Solve $(A - ${l1}I)\mathbf v = \mathbf 0$. With $v_1 = 1$, the first row gives one equation for $v_2$.`,
              sol: [tx`$A - ${l1}I = ${pm([[a - l1, b], [c, d - l1]])}$.`, tx`First row: $${a - l1}(1) ${b < 0 ? '-' : '+'} ${Math.abs(b)}v_2 = 0$, so $v_2 = ${frac(l1 - a, b)}$.`, tx`Check with the second row: $${c}(1) + ${d - l1}\left(${frac(l1 - a, b)}\right) = 0$. ✓`],
              verify: C.near(c + (d - l1) * y, 0, 1e-9),
            };
          } },
        ],
      },
      {
        id: 'leastsq', title: 'Least squares and projection', minutes: 35,
        summary: "The best answer when there's no exact answer.",
        idea: tx`Real data never fit a model exactly. Ten measurements and a straight-line model give ten equations in two unknowns, and no line passes through every point. **Least squares** picks the line that makes the total squared error as small as possible.

Geometrically, you want the vector $A\hat{\mathbf x}$ in the column space of $A$ that is closest to the data $\mathbf b$. The closest point is the perpendicular projection, so the error $\mathbf b - A\hat{\mathbf x}$ is perpendicular to every column of $A$. Writing that condition down gives the **normal equations** $A^TA\hat{\mathbf x} = A^T\mathbf b$.`,
        everyday: tx`Five friends estimate your height: 172, 175, 171, 174 and 173 cm. No single number matches all of them, so pick the one with the smallest total squared disagreement. That number is the average, 173 cm. Fitting a line through scattered points is the same idea with two unknowns (slope and intercept) instead of one.

Squaring makes big misses count more than small ones, and it's what turns the problem into a clean linear system.`,
        visual: { widget: 'leastsq', caption: tx`Drag any point. The orange line refits instantly to minimize the total area of the pink squares, which is literally the sum of squared errors. Add an outlier and watch how hard one bad point pulls on the line.` },
        math: tx`**Problem.** For an overdetermined system $A\mathbf x = \mathbf b$ (more equations than unknowns), minimize $\|A\mathbf x - \mathbf b\|^2$.

**Normal equations.** The minimizer $\hat{\mathbf x}$ satisfies
$$A^TA\,\hat{\mathbf x} = A^T\mathbf b.$$

**Fitting a line** $y = mx + c$ to points $(x_i, y_i)$: each row of $A$ is $(x_i, 1)$ and $\mathbf b$ holds the $y_i$. The solution is
$$m = \frac{\sum (x_i - \bar x)(y_i - \bar y)}{\sum (x_i - \bar x)^2}, \qquad c = \bar y - m\bar x.$$

**Projection.** The fitted values are $A\hat{\mathbf x} = P\mathbf b$ with $P = A(A^TA)^{-1}A^T$, and the residual $\mathbf b - P\mathbf b$ is orthogonal to every column of $A$.`,
        example: {
          problem: tx`Fit $y = mx + c$ to the points $(0, 1)$, $(1, 3)$, $(2, 4)$, $(3, 4)$.`,
          steps: [
            tx`$\bar x = 1.5$ and $\bar y = 3$.`,
            tx`$\sum(x_i - \bar x)(y_i - \bar y) = (-1.5)(-2) + (-0.5)(0) + (0.5)(1) + (1.5)(1) = 5$.`,
            tx`$\sum(x_i - \bar x)^2 = 2.25 + 0.25 + 0.25 + 2.25 = 5$, so $m = 5/5 = 1$.`,
            tx`$c = \bar y - m\bar x = 3 - 1.5 = 1.5$. Best line: $y = x + 1.5$.`,
          ],
        },
        pitfalls: [
          tx`Least squares minimizes *vertical* errors (in $y$), not perpendicular distances to the line.`,
          tx`One outlier can drag the line a long way, because its error gets squared.`,
          tx`When $A^TA$ is ill-conditioned, don't invert it. QR factorization is the stable method (Module 11).`,
        ],
        usedIn: tx`Regression (Module 09) is least squares with statistics on top. Curve fitting, sensor calibration, GPS positioning and the training loss of many machine-learning models are least squares problems.`,
        practice: [
          { level: 1, gen(R) {
            const n = R.int(4, 6), base = R.int(10, 90), ys = Array.from({ length: n }, () => base + R.int(-5, 5)), mean = ys.reduce((s, v) => s + v, 0) / n;
            return {
              q: tx`Find the value $c$ that minimizes $\sum_i (y_i - c)^2$ for the measurements $${ys.join(',\\ ')}$.`,
              ans: { type: 'num', answer: mean },
              hint: tx`Differentiate $\sum (y_i - c)^2$ with respect to $c$ and set it to zero.`,
              sol: [tx`$\frac{d}{dc}\sum(y_i - c)^2 = -2\sum(y_i - c) = 0$ gives $c = \frac{1}{n}\sum y_i$: the mean.`, tx`$c = \dfrac{${ys.join(' + ')}}{${n}} = ${fmt(mean, 4)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const n = R.int(4, 5), m0 = R.pick([-2, -1, 1, 2, 3]), c0 = R.int(-2, 4), xs = Array.from({ length: n }, (_, i) => i + 1), ys = xs.map((x) => m0 * x + c0 + R.int(-2, 2));
            const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
            const sxy = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0), sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0), m = sxy / sxx;
            return {
              q: tx`Find the slope $m$ of the least squares line $y = mx + c$ through the points $${xs.map((x, i) => `(${x}, ${ys[i]})`).join(',\\ ')}$.`,
              ans: { type: 'num', answer: m, tol: 0.005 },
              hint: tx`$m = \dfrac{\sum (x_i - \bar x)(y_i - \bar y)}{\sum (x_i - \bar x)^2}$. Start by finding $\bar x$ and $\bar y$.`,
              sol: [tx`$\bar x = ${fmt(mx, 4)}$, $\bar y = ${fmt(my, 4)}$.`, tx`$\sum(x_i - \bar x)(y_i - \bar y) = ${fmt(sxy, 4)}$ and $\sum(x_i - \bar x)^2 = ${fmt(sxx, 4)}$.`, tx`$m = ${fmt(sxy, 4)}/${fmt(sxx, 4)} = ${fmt(m, 4)}$. (The intercept would be $c = \bar y - m\bar x = ${fmt(my - m * mx, 4)}$.)`],
            };
          } },
          { level: 3, gen(R) {
            let A, AtA, d;
            do { A = [[R.int(-2, 3), R.int(-2, 3)], [R.int(-2, 3), R.int(-2, 3)], [R.int(-2, 3), R.int(-2, 3)]]; AtA = [[0, 0], [0, 0]]; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) AtA[i][j] = A.reduce((s, r) => s + r[i] * r[j], 0); d = det2(AtA); } while (d === 0);
            const b = [R.int(-4, 5), R.int(-4, 5), R.int(-4, 5)], Atb = [0, 1].map((j) => A.reduce((s, r, i) => s + r[j] * b[i], 0));
            const xh = [(AtA[1][1] * Atb[0] - AtA[0][1] * Atb[1]) / d, (AtA[0][0] * Atb[1] - AtA[1][0] * Atb[0]) / d];
            return {
              q: tx`Find the least squares solution $\hat{\mathbf x}$ of $${pm(A)}\mathbf x = ${col(b)}$. Enter both components.`,
              ans: { type: 'vec', answer: xh, show: tx`$\left(${frac(AtA[1][1] * Atb[0] - AtA[0][1] * Atb[1], d)},\ ${frac(AtA[0][0] * Atb[1] - AtA[1][0] * Atb[0], d)}\right)$` },
              hint: tx`Form $A^TA$ (a $2\times2$ matrix) and $A^T\mathbf b$, then solve $A^TA\hat{\mathbf x} = A^T\mathbf b$.`,
              sol: [tx`$A^TA = ${pm(AtA)}$ and $A^T\mathbf b = ${col(Atb)}$.`, tx`$\det(A^TA) = ${d}$, so $\hat{\mathbf x} = \frac{1}{${d}}${pm([[AtA[1][1], -AtA[0][1]], [-AtA[1][0], AtA[0][0]]])}${col(Atb)}$.`, tx`$\hat{\mathbf x} = \left(${frac(AtA[1][1] * Atb[0] - AtA[0][1] * Atb[1], d)},\ ${frac(AtA[0][0] * Atb[1] - AtA[1][0] * Atb[0], d)}\right)$.`],
              verify() { const r = b.map((bi, i) => bi - (A[i][0] * xh[0] + A[i][1] * xh[1])); const o = [0, 1].map((j) => A.reduce((s, row, i) => s + row[j] * r[i], 0)); return Math.abs(o[0]) + Math.abs(o[1]) < 1e-9 ? true : 'residual not orthogonal'; },
            };
          } },
        ],
      },
      {
        id: 'svd', title: 'The singular value decomposition', minutes: 35,
        summary: 'Every matrix is a rotation, a stretch and another rotation.',
        idea: tx`Eigenvectors only behave nicely for some square matrices. The **singular value decomposition** works for every matrix, square or not. Any linear map can be carried out in three steps: rotate (or reflect), stretch along perpendicular axes, rotate again. In symbols, $A = U\Sigma V^T$.

The stretch factors are the **singular values** $\sigma_1 \ge \sigma_2 \ge \cdots \ge 0$, and they rank the directions by importance. Keep only the largest few and you get the best possible low-rank approximation of the matrix. That's how images get compressed, how recommendation systems fill in missing ratings, and how PCA finds the main patterns in data.`,
        everyday: tx`A photo stored as a grid of pixel brightnesses is a big matrix. Its SVD splits it into layers ordered by importance: the first layer captures the broad light and dark regions, the next few add the major shapes, and hundreds of later layers add fine grain. Keep the first 50 layers and you still have a recognizable photo at a fraction of the storage.`,
        visual: { widget: 'svd', caption: tx`$A$ turns the unit circle into an ellipse. The singular values are the ellipse's half-axes. Try *Nearly singular*: the ellipse flattens, $\sigma_2$ shrinks toward 0 and the condition number shoots up. Turn on the rank-1 approximation to see what survives if you keep only $\sigma_1$.` },
        math: tx`**SVD.** Any $m\times n$ matrix factors as
$$A = U\Sigma V^T,$$
with $U$ ($m\times m$) and $V$ ($n\times n$) orthogonal, and $\Sigma$ diagonal with entries $\sigma_1\ge\sigma_2\ge\cdots\ge0$.

**How to compute.** The $\sigma_i^2$ are the eigenvalues of $A^TA$; the columns of $V$ are its eigenvectors; and $\mathbf u_i = A\mathbf v_i/\sigma_i$.

**Geometry.** $A$ maps the unit circle (or sphere) onto an ellipse (ellipsoid) with semi-axes $\sigma_i\mathbf u_i$.

**Facts.** $\operatorname{rank}A$ is the number of nonzero $\sigma_i$. $\ \|A\|_2 = \sigma_1$. The condition number is $\kappa = \sigma_1/\sigma_n$.

**Eckart–Young theorem.** The best rank-$k$ approximation of $A$ is $A_k = \sum_{i=1}^k \sigma_i\mathbf u_i\mathbf v_i^T$, with error $\|A - A_k\|_2 = \sigma_{k+1}$.`,
        example: {
          problem: tx`Find the singular values of $A = \begin{pmatrix} 3 & 0\\ 4 & 5\end{pmatrix}$.`,
          steps: [
            tx`$A^TA = \begin{pmatrix} 3 & 4\\ 0 & 5\end{pmatrix}\begin{pmatrix} 3 & 0\\ 4 & 5\end{pmatrix} = \begin{pmatrix} 25 & 20\\ 20 & 25\end{pmatrix}$.`,
            tx`Its trace is 50 and its determinant $625 - 400 = 225$, so $\lambda^2 - 50\lambda + 225 = 0$, giving $\lambda = 45$ and $5$.`,
            tx`$\sigma_1 = \sqrt{45} = 3\sqrt5 \approx 6.71$ and $\sigma_2 = \sqrt5 \approx 2.24$.`,
            tx`Check: $\sigma_1\sigma_2 = 15 = |\det A|$. The condition number is $\sigma_1/\sigma_2 = 3$.`,
          ],
        },
        pitfalls: [
          tx`Singular values are square roots of the eigenvalues of $A^TA$, not the eigenvalues of $A$ (unless $A$ is symmetric with nonnegative eigenvalues).`,
          tx`Singular values are never negative. Signs and reflections live in $U$ and $V$.`,
          tx`A large condition number means solving $A\mathbf x = \mathbf b$ amplifies errors in $\mathbf b$ (Module 11).`,
        ],
        usedIn: tx`PCA and dimension reduction in data analysis, the pseudo-inverse for least squares, image and signal compression, and diagnosing ill-conditioned problems in numerical analysis (Module 11).`,
        practice: [
          { level: 1, gen(R) {
            const a = R.nz(-7, 7), d = R.nz(-7, 7);
            return {
              q: tx`Find the singular values of $${pm([[a, 0], [0, d]])}$.`,
              ans: { type: 'vec', answer: [Math.abs(a), Math.abs(d)], unordered: true, placeholder: 'σ₁, σ₂' },
              hint: tx`$A^TA = ${pm([[a * a, 0], [0, d * d]])}$. Take square roots of its eigenvalues.`,
              sol: [tx`$A^TA = ${pm([[a * a, 0], [0, d * d]])}$ has eigenvalues $${a * a}$ and $${d * d}$.`, tx`So $\sigma = ${Math.abs(a)}$ and $${Math.abs(d)}$. Negative entries only flip a direction; the stretch factors are their absolute values.`],
            };
          } },
          { level: 2, gen(R) {
            const a = R.int(1, 5), c = R.int(-4, 4), d = R.nz(-5, 5), b = R.pick([0, 0, R.int(-3, 3)]);
            const AtA = [[a * a + c * c, a * b + c * d], [a * b + c * d, b * b + d * d]], T = AtA[0][0] + AtA[1][1], D = det2(AtA), disc = Math.sqrt(T * T / 4 - D);
            const s = [Math.sqrt(T / 2 + disc), Math.sqrt(Math.max(0, T / 2 - disc))];
            return {
              q: tx`Find the singular values of $A = ${pm([[a, b], [c, d]])}$. Decimals to 2 places are fine.`,
              ans: { type: 'vec', answer: s, unordered: true, placeholder: 'σ₁, σ₂' },
              hint: tx`Compute $A^TA$, find its two eigenvalues with the trace and determinant, then take square roots.`,
              sol: [tx`$A^TA = ${pm(AtA)}$: trace $${T}$, determinant $${D}$.`, tx`$\lambda = \frac{${T}}{2} \pm \sqrt{\frac{${T * T}}{4} - ${D}} \approx ${fmt(T / 2 + disc, 4)},\ ${fmt(T / 2 - disc, 4)}$.`, tx`$\sigma_1 \approx ${fmt(s[0], 4)}$, $\sigma_2 \approx ${fmt(s[1], 4)}$. Check: $\sigma_1\sigma_2 = |\det A| = ${Math.abs(a * d - b * c)}$.`],
              verify: C.near(s[0] * s[1], Math.abs(a * d - b * c), 1e-9),
            };
          } },
          { level: 3, gen(R) {
            let A, dA; do { A = randMat(R, 2, -4, 4); dA = det2(A); } while (dA === 0);
            const [[a, b], [c, d]] = A, T = a * a + b * b + c * c + d * d, D = dA * dA, disc = Math.sqrt(T * T / 4 - D);
            const s1 = Math.sqrt(T / 2 + disc), s2 = Math.sqrt(T / 2 - disc), askK = R.chance(0.5);
            return {
              q: askK ? tx`Find the condition number $\kappa = \sigma_1/\sigma_2$ of $${pm(A)}$. Two decimals.` : tx`What is the 2-norm error $\|A - A_1\|_2$ of the best rank-1 approximation of $A = ${pm(A)}$? Two decimals.`,
              ans: { type: 'num', answer: askK ? s1 / s2 : s2, tol: 0.01 },
              hint: askK ? tx`Find both singular values from $A^TA$. A shortcut: $\sigma_1^2 + \sigma_2^2 = \sum a_{ij}^2$ and $\sigma_1\sigma_2 = |\det A|$.` : tx`By Eckart–Young, the error equals the singular value you threw away: $\sigma_2$.`,
              sol: [tx`$\sigma_1^2 + \sigma_2^2 = ${T}$ (sum of squared entries) and $\sigma_1\sigma_2 = |\det A| = ${Math.abs(dA)}$.`, tx`So $\sigma^2 = \frac{${T}}{2} \pm \sqrt{\frac{${T * T}}{4} - ${D}}$, giving $\sigma_1 \approx ${fmt(s1, 4)}$ and $\sigma_2 \approx ${fmt(s2, 4)}$.`, askK ? tx`$\kappa = ${fmt(s1, 4)}/${fmt(s2, 4)} \approx ${fmt(s1 / s2, 3)}$.` : tx`$\|A - A_1\|_2 = \sigma_2 \approx ${fmt(s2, 3)}$.`],
            };
          } },
        ],
      },
    ],
  });
})();
