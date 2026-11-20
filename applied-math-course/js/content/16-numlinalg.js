/* Module 16 — Numerical linear algebra (Stage 5). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, C = AM.checks, frac = AM.frac;
  const pm = (r) => `\\begin{pmatrix} ${r.map((x) => x.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
  const det2 = (a, b, c, d) => a * d - b * c;
  const det3 = (A) => A[0][0] * det2(A[1][1], A[1][2], A[2][1], A[2][2]) - A[0][1] * det2(A[1][0], A[1][2], A[2][0], A[2][2]) + A[0][2] * det2(A[1][0], A[1][1], A[2][0], A[2][1]);
  const vt = (v) => `(${v.join(', ')})`;
  const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);

  AM.module({
    id: 'numlinalg', stage: 5, title: 'Numerical Linear Algebra', aka: 'Numerical Linear Algebra / Matrix Computations',
    blurb: 'Large simulations, data analysis and machine learning all come down to solving linear systems and finding eigenvalues for matrices with millions of entries. This module covers how computers actually do that: factorizations, orthogonalization, iterative methods, and the conditioning that limits any method\'s accuracy.',
    prereq: ['linalg', 'numerics'],
    lessons: [
      {
        id: 'lu', title: 'LU factorization and conditioning', minutes: 40,
        summary: 'Gaussian elimination as a matrix factorization, and how sensitive a problem really is.',
        idea: tx`Gaussian elimination secretly factors a matrix: $A = LU$, with $L$ lower triangular (the multipliers you used) and $U$ upper triangular (the result of elimination). The factorization costs about $\frac23n^3$ operations once, after which each new right-hand side $\mathbf b$ costs only $n^2$: solve $L\mathbf y = \mathbf b$ forward, then $U\mathbf x = \mathbf y$ backward. In practice rows are swapped for stability (**partial pivoting**), giving $PA = LU$.

But no algorithm can beat the problem itself. The **condition number** $\kappa(A)$ measures how much relative errors in $\mathbf b$ can be amplified in $\mathbf x$. If $\kappa = 10^8$ and your data have 16 significant digits, expect only about 8 correct digits in the answer.`,
    everyday: tx`Finding where two nearly parallel roads cross: a tiny error in surveying one road's position moves the crossing point a long way along the roads. The roads are an ill-conditioned linear system. A GPS receiver faces exactly this when the satellites it can see are bunched in one part of the sky: small timing errors produce big position errors.`,
        visual: { widget: 'conditioning', caption: tx`Shrink the angle between the lines and watch a tiny shift in the orange line (the data error) throw the solution far along the lines. The readout compares the error amplification with the condition number $\kappa$.` },
        math: tx`**LU factorization.** Gaussian elimination without row swaps gives $A = LU$, where $L$ has 1s on its diagonal and the elimination multipliers $\ell_{ij} = a_{ij}^{(j)}/a_{jj}^{(j)}$ below it, and $U$ is the final upper-triangular matrix.

**Solving.** $A\mathbf x = \mathbf b \iff L\mathbf y = \mathbf b$ (forward substitution), then $U\mathbf x = \mathbf y$ (back substitution). Cost: $\frac23n^3$ to factor, $2n^2$ per solve.

**Determinant.** $\det A = \det U = u_{11}u_{22}\cdots u_{nn}$ (times $\pm1$ if rows were swapped). In particular $u_{kk} = \dfrac{\det A_k}{\det A_{k-1}}$, ratios of leading principal minors.

**Partial pivoting.** Swap in the row with the largest pivot to keep multipliers $|\ell_{ij}| \le 1$: $PA = LU$.

**Condition number.** $\kappa(A) = \|A\|\,\|A^{-1}\|$; in the 2-norm, $\kappa_2 = \sigma_{\max}/\sigma_{\min}$ (for symmetric $A$, $|\lambda|_{\max}/|\lambda|_{\min}$). Then
$$\frac{\|\delta\mathbf x\|}{\|\mathbf x\|} \le \kappa(A)\frac{\|\delta\mathbf b\|}{\|\mathbf b\|}.$$
Rule of thumb: you lose about $\log_{10}\kappa$ digits.`,
        example: {
          problem: tx`Factor $A = \begin{pmatrix} 2 & 1 & 1\\ 4 & 3 & 3\\ 8 & 7 & 9\end{pmatrix}$ as $LU$.`,
          steps: [
            tx`Eliminate column 1 with multipliers $\ell_{21} = 2$, $\ell_{31} = 4$: rows become $(0, 1, 1)$ and $(0, 3, 5)$.`,
            tx`Eliminate column 2 with $\ell_{32} = 3$: the last row becomes $(0, 0, 2)$.`,
            tx`$L = \begin{pmatrix}1&0&0\\2&1&0\\4&3&1\end{pmatrix}$, $\ U = \begin{pmatrix}2&1&1\\0&1&1\\0&0&2\end{pmatrix}$.`,
            tx`Check: $\det A = 2\cdot1\cdot2 = 4$, the product of the pivots.`,
          ],
        },
        pitfalls: [
          tx`Without pivoting, a zero or tiny pivot wrecks LU even when $A$ is perfectly well-conditioned. Always pivot in practice.`,
          tx`A small determinant does *not* mean ill-conditioned: $10^{-3}I$ has determinant $10^{-3n}$ but $\kappa = 1$.`,
          tx`Never form $A^{-1}$ to solve a system; LU solves are cheaper and more accurate.`,
        ],
        usedIn: tx`Every direct solver in scientific computing (finite elements, circuit simulation, Newton's method for nonlinear systems) uses LU or its symmetric cousin, the Cholesky factorization $A = LL^T$.`,
        practice: [
          { level: 1, gen(R) {
            let a, b, c, d; do { a = R.nz(-4, 4); b = R.int(-4, 4); c = R.int(-6, 6); d = R.int(-5, 5); } while (c % a !== 0);
            const l = c / a, u22 = d - l * b;
            return { q: tx`Find the LU factorization of $${pm([[a, b], [c, d]])}$ (no pivoting). Enter $\ell_{21}$ and $u_{22}$.`, ans: { type: 'vec', answer: [l, u22], placeholder: 'ℓ₂₁, u₂₂' }, hint: tx`The multiplier is $\ell_{21} = a_{21}/a_{11}$; subtract $\ell_{21}\times$ row 1 from row 2.`, sol: [tx`$\ell_{21} = \frac{${c}}{${a}} = ${l}$.`, tx`Row 2 becomes $(${c}, ${d}) - ${l}(${a}, ${b}) = (0, ${u22})$, so $L = ${pm([[1, 0], [l, 1]])}$, $U = ${pm([[a, b], [0, u22]])}$.`] };
          } },
          { level: 2, gen(R) {
            let a, b, c, l1, l2; do { a = R.int(1, 9); c = R.int(1, 9); b = R.int(-4, 4); const T = a + c, D = a * c - b * b, s = Math.sqrt(T * T / 4 - D); l1 = T / 2 + s; l2 = T / 2 - s; } while (Math.abs(l2) < 0.05);
            const k = Math.abs(l1) / Math.abs(l2) >= 1 ? Math.max(Math.abs(l1), Math.abs(l2)) / Math.min(Math.abs(l1), Math.abs(l2)) : 1;
            return { q: tx`Find the 2-norm condition number of the symmetric matrix $${pm([[a, b], [b, c]])}$. Three decimals.`, ans: { type: 'num', answer: k, tol: 0.002 }, hint: tx`For a symmetric matrix, $\kappa_2 = \frac{|\lambda|_{\max}}{|\lambda|_{\min}}$.`, sol: [tx`Eigenvalues: $${fmt(l1, 4)}$ and $${fmt(l2, 4)}$.`, tx`$\kappa_2 = ${fmt(k, 4)}$, so expect to lose about $${fmt(Math.log10(k), 2)}$ digits.`] };
          } },
          { level: 3, gen(R) {
            const ke = R.int(2, 12), k = 10 ** ke, eb = R.pick([1e-16, 1e-12, 1e-8, 1e-6]), bound = Math.min(1, k * eb), digits = Math.max(0, -Math.log10(bound));
            return { q: tx`A system has $\kappa(A) = 10^{${ke}}$ and the data $\mathbf b$ have relative error $${eb.toExponential(0).replace('e', '\\times10^{').replace(/$/, '}').replace('1\\times', '')}$. What is the worst-case relative error in $\mathbf x$, and roughly how many correct significant digits does that leave? Enter both.`, ans: { type: 'vec', answer: [bound, Math.floor(digits + 1e-9)], abs: 1e-20, rel: 0.01, placeholder: 'relative error, digits' }, hint: tx`$\frac{\|\delta\mathbf x\|}{\|\mathbf x\|} \le \kappa\frac{\|\delta\mathbf b\|}{\|\mathbf b\|}$. Digits $\approx -\log_{10}(\text{relative error})$.`, sol: [tx`Bound: $10^{${ke}}\times${eb.toExponential(0)} = ${bound.toExponential(1)}$.`, tx`That leaves about ${Math.floor(digits + 1e-9)} correct significant digits.`] };
          } },
          { level: 4, gen(R) {
            let A, d2, d3; do { A = [[R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)], [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)], [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)]]; d2 = det2(A[0][0], A[0][1], A[1][0], A[1][1]); d3 = det3(A); } while (!A[0][0] || !d2 || !d3);
            return { q: tx`In the LU factorization (no pivoting) of $A = ${pm(A)}$, find the last pivot $u_{33}$.`, ans: { type: 'num', answer: d3 / d2, abs: 1e-9, show: tx`$${frac(d3, d2)}$` }, hint: tx`Pivots are ratios of leading principal minors: $u_{33} = \frac{\det A}{\det A_2}$, where $A_2$ is the top-left $2\times2$ block.`, sol: [tx`$\det A_2 = ${d2}$ and $\det A = ${d3}$.`, tx`$u_{33} = \frac{${d3}}{${d2}} = ${frac(d3, d2)}$. (Equivalently, carry out the elimination; $u_{11}u_{22}u_{33} = \det A$.)`], verify() { const a = A.map((r) => r.slice()); for (let k = 0; k < 2; k++) for (let i = k + 1; i < 3; i++) { const l = a[i][k] / a[k][k]; for (let j = k; j < 3; j++) a[i][j] -= l * a[k][j]; } return Math.abs(a[2][2] - d3 / d2) < 1e-9 ? true : `pivot ${a[2][2]}`; } };
          } },
        ],
      },
      {
        id: 'qr', title: 'Orthogonality, Gram–Schmidt and QR', minutes: 40,
        summary: 'Building perpendicular bases, and the stable way to do least squares.',
        idea: tx`Perpendicular (orthonormal) vectors are the easiest basis to work with: coordinates are just dot products and nothing gets amplified, because an orthogonal matrix $Q$ has $Q^TQ = I$ and condition number 1. **Gram–Schmidt** turns any independent set of vectors into an orthonormal one: take each vector, subtract its components along the previous ones, and normalize what's left.

Recording the coefficients gives the **QR factorization** $A = QR$. It's the numerically stable way to solve least squares problems: instead of forming $A^TA$ (which squares the condition number), solve the triangular system $R\hat{\mathbf x} = Q^T\mathbf b$.`,
        everyday: tx`An orchestra recording mixes many instruments into one signal. Expressing the signal in a basis of perpendicular components means each coefficient can be measured independently, with no crosstalk. That's why orthogonal bases (Fourier modes, orthogonal polynomials, principal components) are everywhere in signal processing and statistics.`,
        visual: { widget: 'gramschmidt', caption: tx`Drag $\mathbf a_1$ and $\mathbf a_2$. The grey segment is the shadow of $\mathbf a_2$ on $\mathbf q_1$; removing it leaves the pink perpendicular piece, which becomes $\mathbf q_2$ once normalized. Push the vectors nearly parallel and watch $r_{22}$ collapse.` },
        math: tx`**Orthonormal.** $\mathbf q_i\cdot\mathbf q_j = 0$ for $i\ne j$ and $\|\mathbf q_i\| = 1$. A square $Q$ with orthonormal columns satisfies $Q^TQ = I$, so $Q^{-1} = Q^T$ and $\|Q\mathbf x\| = \|\mathbf x\|$.

**Gram–Schmidt.** For independent $\mathbf a_1, \dots, \mathbf a_n$:
$$\mathbf w_k = \mathbf a_k - \sum_{j<k}(\mathbf q_j\cdot\mathbf a_k)\,\mathbf q_j, \qquad \mathbf q_k = \frac{\mathbf w_k}{\|\mathbf w_k\|}.$$

**QR.** $A = QR$ with $r_{jk} = \mathbf q_j\cdot\mathbf a_k$ for $j < k$ and $r_{kk} = \|\mathbf w_k\|$; $R$ is upper triangular.

**Least squares by QR.** Minimizing $\|A\mathbf x - \mathbf b\|$ reduces to $R\hat{\mathbf x} = Q^T\mathbf b$. This avoids $\kappa(A^TA) = \kappa(A)^2$.

**In practice** use *modified* Gram–Schmidt or Householder reflections, which keep orthogonality to machine precision.`,
        example: {
          problem: tx`Apply Gram–Schmidt to $\mathbf a_1 = (3, 4)$, $\mathbf a_2 = (1, 2)$.`,
          steps: [
            tx`$r_{11} = \|\mathbf a_1\| = 5$, so $\mathbf q_1 = (0.6, 0.8)$.`,
            tx`$r_{12} = \mathbf q_1\cdot\mathbf a_2 = 0.6 + 1.6 = 2.2$.`,
            tx`$\mathbf w_2 = (1, 2) - 2.2(0.6, 0.8) = (-0.32, 0.24)$, with length $r_{22} = 0.4$, so $\mathbf q_2 = (-0.8, 0.6)$.`,
            tx`$A = QR$ with $Q = \begin{pmatrix}0.6 & -0.8\\0.8 & 0.6\end{pmatrix}$, $R = \begin{pmatrix}5 & 2.2\\0 & 0.4\end{pmatrix}$.`,
          ],
        },
        pitfalls: [
          tx`Project onto the *normalized* $\mathbf q_j$, not the original $\mathbf a_j$ (or divide by $\mathbf a_j\cdot\mathbf a_j$ if you use $\mathbf a_j$).`,
          tx`Classical Gram–Schmidt loses orthogonality when columns are nearly dependent; modified Gram–Schmidt or Householder is safer.`,
          tx`$Q^TQ = I$ always, but $QQ^T = I$ only when $Q$ is square.`,
        ],
        usedIn: tx`Least squares and regression software, the QR algorithm that computes all eigenvalues of a matrix, Krylov methods (GMRES, Lanczos), and orthogonal polynomials in approximation theory (Module 18).`,
        practice: [
          { level: 1, gen(R) {
            const v = R.pick([[3, 4], [5, 12], [8, 15], [1, 2, 2], [2, 3, 6], [1, 4, 8]]).map((x) => x * R.sign()), n = Math.hypot(...v);
            return { q: tx`Normalize $\mathbf v = ${vt(v)}$ to a unit vector.`, ans: { type: 'vec', answer: v.map((x) => x / n), placeholder: 'components' }, hint: tx`Divide by $\|\mathbf v\| = \sqrt{${v.map((x) => x * x).join(' + ')}}$.`, sol: [tx`$\|\mathbf v\| = ${n}$, so $\hat{\mathbf v} = \left(${v.map((x) => frac(x, n)).join(',\\ ')}\right)$.`] };
          } },
          { level: 2, gen(R) {
            const n = R.pick([2, 3]); let a1, a2; do { a1 = Array.from({ length: n }, () => R.int(-3, 3)); a2 = Array.from({ length: n }, () => R.int(-3, 3)); } while (!dot(a1, a1) || Math.abs(dot(a1, a2) ** 2 - dot(a1, a1) * dot(a2, a2)) < 1e-9);
            const k = dot(a1, a2) / dot(a1, a1), w = a2.map((x, i) => x - k * a1[i]);
            return { q: tx`Gram–Schmidt step: with $\mathbf a_1 = ${vt(a1)}$ and $\mathbf a_2 = ${vt(a2)}$, find $\mathbf w_2 = \mathbf a_2 - \operatorname{proj}_{\mathbf a_1}\mathbf a_2$ (before normalizing).`, ans: { type: 'vec', answer: w }, hint: tx`$\operatorname{proj}_{\mathbf a_1}\mathbf a_2 = \frac{\mathbf a_1\cdot\mathbf a_2}{\mathbf a_1\cdot\mathbf a_1}\mathbf a_1 = ${frac(dot(a1, a2), dot(a1, a1))}\,\mathbf a_1$.`, sol: [tx`$\mathbf w_2 = ${vt(a2)} - ${frac(dot(a1, a2), dot(a1, a1))}${vt(a1)} = \left(${w.map((x, i) => frac(a2[i] * dot(a1, a1) - dot(a1, a2) * a1[i], dot(a1, a1))).join(',\\ ')}\right)$.`, tx`Check: $\mathbf w_2\cdot\mathbf a_1 = 0$.`], verify: C.near(dot(w, a1), 0, 1e-9) };
          } },
          { level: 3, gen(R) {
            let a1, a2; do { a1 = [R.int(-3, 4), R.int(-3, 4), R.int(-2, 2)]; a2 = [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)]; } while (!dot(a1, a1) || dot(a1, a1) * dot(a2, a2) - dot(a1, a2) ** 2 < 1e-6);
            const r11 = Math.sqrt(dot(a1, a1)), r12 = dot(a1, a2) / r11, r22 = Math.sqrt(dot(a2, a2) - r12 * r12);
            return { q: tx`$A$ has columns $\mathbf a_1 = ${vt(a1)}$ and $\mathbf a_2 = ${vt(a2)}$. Find the entries $r_{11}, r_{12}, r_{22}$ of $R$ in $A = QR$. Four decimals.`, ans: { type: 'vec', answer: [r11, r12, r22], tol: 0.0006, placeholder: 'r₁₁, r₁₂, r₂₂' }, hint: tx`$r_{11} = \|\mathbf a_1\|$, $r_{12} = \mathbf q_1\cdot\mathbf a_2$, and by Pythagoras $r_{22} = \sqrt{\|\mathbf a_2\|^2 - r_{12}^2}$.`, sol: [tx`$r_{11} = \sqrt{${dot(a1, a1)}} \approx ${fmt(r11, 5)}$.`, tx`$r_{12} = \frac{\mathbf a_1\cdot\mathbf a_2}{r_{11}} = \frac{${dot(a1, a2)}}{${fmt(r11, 5)}} \approx ${fmt(r12, 5)}$.`, tx`$r_{22} = \sqrt{${dot(a2, a2)} - ${fmt(r12 * r12, 5)}} \approx ${fmt(r22, 5)}$.`] };
          } },
          { level: 4, gen(R) {
            const q1 = [0.6, 0.8, 0], q2 = [0, 0, 1], r = [R.int(1, 5), R.int(-3, 3), R.int(1, 4)], b = [R.int(-5, 5), R.int(-5, 5), R.int(-5, 5)];
            const A = [0, 1, 2].map((i) => [r[0] * q1[i], r[1] * q1[i] + r[2] * q2[i]]), c = [dot(q1, b), dot(q2, b)], x2 = c[1] / r[2], x1 = (c[0] - r[1] * x2) / r[0];
            return { q: tx`$A = QR$ with $Q = \begin{pmatrix}0.6 & 0\\0.8 & 0\\0 & 1\end{pmatrix}$ and $R = ${pm([[r[0], r[1]], [0, r[2]]])}$. Find the least squares solution of $A\mathbf x = ${vt(b)}^T$ by solving $R\hat{\mathbf x} = Q^T\mathbf b$. Four decimals.`, ans: { type: 'vec', answer: [x1, x2], tol: 0.0006 }, hint: tx`Compute $Q^T\mathbf b$ (two dot products), then back-substitute: the second equation first.`, sol: [tx`$Q^T\mathbf b = (${fmt(c[0], 4)}, ${fmt(c[1], 4)})$.`, tx`$${r[2]}\hat x_2 = ${fmt(c[1], 4)}$ gives $\hat x_2 = ${fmt(x2, 5)}$; then $${r[0]}\hat x_1 + ${r[1]}\hat x_2 = ${fmt(c[0], 4)}$ gives $\hat x_1 = ${fmt(x1, 5)}$.`], verify() { const res = A.map((row, i) => b[i] - row[0] * x1 - row[1] * x2); const o = [0, 1].map((j) => A.reduce((s, row, i) => s + row[j] * res[i], 0)); return Math.abs(o[0]) + Math.abs(o[1]) < 1e-9 ? true : 'not least squares'; } };
          } },
        ],
      },
      {
        id: 'iterative', title: 'Iterative methods and the power method', minutes: 40,
        summary: 'Solving huge systems and finding eigenvalues by repeated improvement.',
        idea: tx`For matrices with millions of rows (most of whose entries are zero), even LU is too expensive. **Iterative methods** start with a guess and improve it using only matrix–vector products, which are cheap for sparse matrices. **Jacobi** and **Gauss–Seidel** solve each equation for its own diagonal unknown in turn; **conjugate gradient** is the method of choice for symmetric positive definite systems.

The **power method** finds the largest eigenvalue: multiply a vector by $A$ over and over, normalizing each time. Components along the dominant eigenvector grow fastest and take over. How fast depends on the ratio $|\lambda_2/\lambda_1|$: a big gap converges quickly. Google's PageRank is computed this way on a matrix with billions of rows.`,
        everyday: tx`Shuffle a deck of cards with riffle shuffles. Each shuffle is multiplication by a huge Markov matrix, and repeated shuffles converge to the uniform distribution, which is the dominant eigenvector. How many shuffles you need (about seven for 52 cards) is governed by the second eigenvalue: that's the power method's convergence rate in disguise.`,
        visual: { widget: 'power', caption: tx`Drag the starting vector anywhere on the circle and increase the iterations: it swings onto the dominant eigenvector (green). Move $d$ to change the eigenvalue gap: when the two eigenvalues are close, convergence is painfully slow.` },
        math: tx`**Splitting.** Write $A = D + L + U$ (diagonal, strictly lower, strictly upper parts).

**Jacobi.** $\mathbf x^{(k+1)} = D^{-1}\big(\mathbf b - (L + U)\mathbf x^{(k)}\big)$, i.e. $x_i^{(k+1)} = \dfrac{b_i - \sum_{j\ne i}a_{ij}x_j^{(k)}}{a_{ii}}$.

**Gauss–Seidel.** The same, but use each new $x_j$ as soon as it's computed.

**Convergence.** An iteration $\mathbf x^{(k+1)} = G\mathbf x^{(k)} + \mathbf c$ converges for every start iff the spectral radius $\rho(G) < 1$; the error shrinks by about $\rho(G)$ per step. Strict diagonal dominance guarantees convergence of Jacobi and Gauss–Seidel.

**Power method.** $\mathbf x^{(k+1)} = \dfrac{A\mathbf x^{(k)}}{\|A\mathbf x^{(k)}\|}$ converges to the dominant eigenvector (if $|\lambda_1| > |\lambda_2|$), with error $\propto|\lambda_2/\lambda_1|^k$. The **Rayleigh quotient** $\dfrac{\mathbf x^TA\mathbf x}{\mathbf x^T\mathbf x}$ estimates $\lambda_1$.

**Inverse iteration** (power method on $(A - \sigma I)^{-1}$) finds the eigenvalue nearest $\sigma$.`,
        example: {
          problem: tx`Do two Jacobi iterations for $4x + y = 9$, $x + 3y = 7$ from $(0, 0)$.`,
          steps: [
            tx`Update rules: $x \leftarrow \frac{9 - y}{4}$, $y \leftarrow \frac{7 - x}{3}$, both using the *old* values.`,
            tx`Step 1: $x = 2.25$, $y = 2.333$.`,
            tx`Step 2: $x = \frac{9 - 2.333}{4} = 1.667$, $y = \frac{7 - 2.25}{3} = 1.583$.`,
            tx`The exact solution is $(\frac{20}{11}, \frac{19}{11}) \approx (1.818, 1.727)$; Jacobi's spectral radius here is $\sqrt{\frac{1}{12}} \approx 0.29$, so each step cuts the error by about 3.5×.`,
          ],
        },
        pitfalls: [
          tx`Jacobi can diverge for matrices that aren't diagonally dominant, even when the system has a unique solution.`,
          tx`The power method fails if $|\lambda_1| = |\lambda_2|$ (e.g. $\lambda = \pm2$), and needs a start vector with some component along the dominant eigenvector.`,
          tx`Stopping when successive iterates are close doesn't guarantee the error is small if convergence is slow. Check the residual $\|\mathbf b - A\mathbf x\|$ too.`,
        ],
        usedIn: tx`Large-scale PDE solvers (Module 13 and 18), PageRank and network centrality, PCA on huge datasets, and Markov chain steady states (Module 15).`,
        practice: [
          { level: 1, gen(R) {
            const a = R.int(3, 8), d = R.int(3, 8), b = R.int(-2, 2), c = R.int(-2, 2), x0 = [R.int(-2, 2), R.int(-2, 2)], r = [R.int(-10, 10), R.int(-10, 10)];
            const x1 = [(r[0] - b * x0[1]) / a, (r[1] - c * x0[0]) / d];
            return { q: tx`Do one Jacobi iteration for $${pm([[a, b], [c, d]])}\mathbf x = ${vt(r)}^T$ starting from $\mathbf x^{(0)} = ${vt(x0)}$.`, ans: { type: 'vec', answer: x1 }, hint: tx`$x_1^{new} = \frac{${r[0]} - (${b})x_2^{old}}{${a}}$ and $x_2^{new} = \frac{${r[1]} - (${c})x_1^{old}}{${d}}$.`, sol: [tx`$x_1 = \frac{${r[0]} - (${b})(${x0[1]})}{${a}} = ${frac(r[0] - b * x0[1], a)}$, $\ x_2 = \frac{${r[1]} - (${c})(${x0[0]})}{${d}} = ${frac(r[1] - c * x0[0], d)}$.`] };
          } },
          { level: 2, gen(R) {
            const A = [[R.int(1, 5), R.int(-2, 2)], [0, R.int(1, 5)]]; A[1][0] = A[0][1]; const x = [R.nz(-3, 3), R.nz(-3, 3)], Ax = [A[0][0] * x[0] + A[0][1] * x[1], A[1][0] * x[0] + A[1][1] * x[1]], rq = dot(x, Ax) / dot(x, x);
            return { q: tx`Compute the Rayleigh quotient $\frac{\mathbf x^TA\mathbf x}{\mathbf x^T\mathbf x}$ for $A = ${pm(A)}$ and $\mathbf x = ${vt(x)}$. Four decimals.`, ans: { type: 'num', answer: rq, tol: 0.0006 }, hint: tx`Compute $A\mathbf x$ first, then two dot products.`, sol: [tx`$A\mathbf x = ${vt(Ax)}$, $\mathbf x^TA\mathbf x = ${dot(x, Ax)}$, $\mathbf x^T\mathbf x = ${dot(x, x)}$.`, tx`Quotient $= ${fmt(rq, 5)}$. It always lies between the smallest and largest eigenvalue.`] };
          } },
          { level: 3, gen(R) {
            const l1 = R.int(3, 10), l2 = R.int(1, l1 - 1) * R.sign(), k = R.int(3, 10), ratio = Math.abs(l2 / l1), n = Math.ceil(k / -Math.log10(ratio) - 1e-9);
            return { q: tx`A matrix has eigenvalues $${l1}$ and $${l2}$ (and the rest smaller). About how many power-method iterations reduce the error by a factor of $10^{${k}}$?`, ans: { type: 'num', answer: n, tol: 0.01 }, hint: tx`The error shrinks by $|\lambda_2/\lambda_1|$ per step. Solve $|\lambda_2/\lambda_1|^n \le 10^{-${k}}$.`, sol: [tx`Ratio $= \frac{${Math.abs(l2)}}{${l1}} = ${fmt(ratio, 4)}$.`, tx`$n \ge \frac{${k}}{-\log_{10}(${fmt(ratio, 4)})} = ${fmt(k / -Math.log10(ratio), 3)}$, so $n = ${n}$.`] };
          } },
          { level: 4, gen(R) {
            const a = R.int(2, 9), d = R.int(2, 9), b = R.nz(-6, 6), c = R.nz(-6, 6), rho = Math.sqrt(Math.abs(b * c) / (a * d)), complex = b * c < 0;
            return { q: tx`For $A = ${pm([[a, b], [c, d]])}$, find the spectral radius of the Jacobi iteration matrix $G = -D^{-1}(L + U)$. Does Jacobi converge? Enter $\rho(G)$ to 4 decimals.`, ans: { type: 'num', answer: rho, tol: 0.0006 }, hint: tx`$G = \begin{pmatrix}0 & -b/a\\ -c/d & 0\end{pmatrix}$ has eigenvalues $\pm\sqrt{\frac{bc}{ad}}$.`, sol: [tx`$G = ${pm([[0, frac(-b, a)], [frac(-c, d), 0]])}$, with $\lambda^2 = \frac{${b * c}}{${a * d}}$.`, tx`$\rho(G) = \sqrt{${fmt(Math.abs(b * c) / (a * d), 4)}} \approx ${fmt(rho, 5)}$${complex ? ' (the eigenvalues are imaginary)' : ''}: ${rho < 1 ? 'below 1, so Jacobi converges.' : 'at least 1, so Jacobi does **not** converge.'}`] };
          } },
        ],
      },
    ],
  });
})();
