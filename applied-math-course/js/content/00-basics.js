/* Module 00 — Math Basics: a gentle on-ramp before the course proper. */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, frac = AM.frac, sgn = AM.sgn, gcd = AM.m.gcd;
  const lcm = (a, b) => (a * b) / gcd(a, b);

  AM.module({
    id: 'basics', num: 0, stage: 0, title: 'Start Here: Math Basics', aka: 'Pre-university refresher',
    blurb: 'Before the course proper, this module rebuilds the four skills everything else leans on: working with fractions and percentages, solving an equation, using powers and roots, and reading a straight-line graph. Nothing is assumed. If a later lesson ever feels like it skipped a step, the step is probably here.',
    prereq: [],
    lessons: [
      {
        id: 'fractions', title: 'Fractions, decimals and percentages', minutes: 25,
        summary: 'Parts of a whole, and the three ways of writing the same amount.',
        idea: tx`A **fraction** like $\frac34$ means "cut something into 4 equal pieces and take 3 of them". The bottom number (the **denominator**) says how big the pieces are; the top (the **numerator**) says how many you have.

The same amount can be written three ways: $\frac34 = 0.75 = 75\%$. A **percentage** is just a fraction out of 100. To add or subtract fractions, the pieces must be the same size first, so you rewrite both with a **common denominator**. Multiplying is easier: multiply the tops and multiply the bottoms.`,
        everyday: tx`A pizza is cut into 8 slices and you eat 3: you ate $\frac38$ of the pizza. Your friend's pizza was cut into 4 slices and they ate 1, which is $\frac14 = \frac28$. Together you ate $\frac38 + \frac28 = \frac58$ of a pizza.

A shop has "30% off" a \$50 jacket: 30% is $\frac{30}{100}$, so the discount is $\frac{30}{100}\times50 = 15$ dollars and you pay \$35.`,
        visual: { widget: 'fractionbar', caption: tx`Set the first fraction to $\frac12$ and the second to $\frac13$. The lower bars show both cut into sixths, so they can be added: $\frac36 + \frac26 = \frac56$. Then switch to Multiply.` },
        math: tx`**Equivalent fractions.** Multiplying top and bottom by the same number doesn't change the value: $\frac12 = \frac24 = \frac{50}{100}$. Dividing both by a common factor **simplifies**: $\frac{6}{8} = \frac34$.

**Adding and subtracting.** Rewrite with a common denominator, then add the tops:
$$\frac ab + \frac cd = \frac{ad + bc}{bd}.$$

**Multiplying.** $\dfrac ab\times\dfrac cd = \dfrac{ac}{bd}$. **Dividing.** Flip the second and multiply: $\dfrac ab\div\dfrac cd = \dfrac ab\times\dfrac dc$.

**Percentages.** $p\% = \frac{p}{100}$. So $p\%$ of $X$ is $\frac{p}{100}X$. An increase of $p\%$ multiplies by $1 + \frac{p}{100}$; a decrease multiplies by $1 - \frac{p}{100}$.`,
        example: {
          problem: tx`Work out $\frac23 + \frac14$.`,
          steps: [
            tx`The pieces are different sizes (thirds and quarters), so find a size both fit into: 12ths, since $3\times4 = 12$.`,
            tx`$\frac23 = \frac{8}{12}$ (multiply top and bottom by 4) and $\frac14 = \frac{3}{12}$ (multiply by 3).`,
            tx`Now add the tops: $\frac{8}{12} + \frac{3}{12} = \frac{11}{12}$.`,
            tx`As a decimal that's about $0.917$, or $91.7\%$.`,
          ],
        },
        pitfalls: [
          tx`Don't add the bottoms: $\frac12 + \frac13$ is not $\frac25$. Make the pieces the same size first.`,
          tx`A 10% rise followed by a 10% fall does not get you back where you started: $1.1\times0.9 = 0.99$.`,
          tx`$\frac{a + b}{c}$ splits as $\frac ac + \frac bc$, but $\frac{c}{a+b}$ does **not** split into $\frac ca + \frac cb$.`,
        ],
        usedIn: tx`Everywhere. Probabilities are fractions (Module 08), slopes are fractions (rise over run), and almost every formula in the course has a fraction in it.`,
        practice: [
          { level: 1, gen(R) {
            const d = R.int(3, 12), a = R.int(1, d - 1), b = R.int(1, d - 1);
            return { q: tx`Work out $\frac{${a}}{${d}} + \frac{${b}}{${d}}$. You can type a fraction like <code>5/7</code>.`, ans: { type: 'num', answer: (a + b) / d, abs: 1e-9, show: tx`$${frac(a + b, d)}$` }, hint: tx`The pieces are already the same size (${d}ths), so just add the tops.`, sol: [tx`Same bottom, so add the tops: $\frac{${a} + ${b}}{${d}} = \frac{${a + b}}{${d}}$.`, tx`${gcd(a + b, d) > 1 ? `Simplify: $${frac(a + b, d)}$.` : 'This is already as simple as it gets.'}`] };
          } },
          { level: 2, gen(R) {
            let b, d; do { b = R.int(2, 9); d = R.int(2, 9); } while (b === d);
            const a = R.int(1, b - 1), c = R.int(1, d - 1), sub = R.chance(0.4), L = lcm(b, d), A = a * (L / b), Cc = c * (L / d), rn = sub ? A - Cc : A + Cc;
            return { q: tx`Work out $\frac{${a}}{${b}} ${sub ? '-' : '+'} \frac{${c}}{${d}}$.`, ans: { type: 'num', answer: rn / L, abs: 1e-9, show: tx`$${frac(rn, L)}$` }, hint: tx`Rewrite both fractions as ${L}ths first.`, sol: [tx`Common denominator ${L}: $\frac{${a}}{${b}} = \frac{${A}}{${L}}$ and $\frac{${c}}{${d}} = \frac{${Cc}}{${L}}$.`, tx`$\frac{${A} ${sub ? '-' : '+'} ${Cc}}{${L}} = \frac{${rn}}{${L}} = ${frac(rn, L)}$.`] };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['of', 'off', 'up']), p = R.pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]), X = R.pick([20, 40, 60, 80, 120, 150, 200, 250, 360, 480]);
            if (kind === 'of') return { q: tx`What is ${p}% of ${X}?`, ans: { type: 'num', answer: (p * X) / 100 }, hint: tx`$${p}\% = \frac{${p}}{100}$. Multiply that by ${X}.`, sol: [tx`$\frac{${p}}{100}\times${X} = ${fmt((p * X) / 100)}$.`] };
            if (kind === 'off') return { q: tx`A \$${X} coat is reduced by ${p}%. What is the new price, in dollars?`, ans: { type: 'num', answer: X * (1 - p / 100) }, hint: tx`A ${p}% decrease leaves ${100 - p}% of the price.`, sol: [tx`Discount: $\frac{${p}}{100}\times${X} = ${fmt((p * X) / 100)}$.`, tx`New price: $${X} - ${fmt((p * X) / 100)} = ${fmt(X * (1 - p / 100))}$ (that's ${100 - p}% of ${X}).`] };
            return { q: tx`A town of ${X * 100} people grows by ${p}%. What is the new population?`, ans: { type: 'num', answer: X * 100 * (1 + p / 100) }, hint: tx`Growing by ${p}% means multiplying by $1 + \frac{${p}}{100} = ${1 + p / 100}$.`, sol: [tx`$${X * 100}\times${1 + p / 100} = ${fmt(X * 100 * (1 + p / 100))}$.`] };
          } },
          { level: 4, gen(R) {
            const up = R.pick([10, 20, 25, 50]), down = R.pick([10, 20, 25, 50]), X = R.pick([100, 200, 80, 400]), v = X * (1 + up / 100) * (1 - down / 100);
            return { q: tx`A \$${X} share price rises ${up}% on Monday, then falls ${down}% on Tuesday. What is it worth now, and is that more or less than \$${X}? Enter the price.`, ans: { type: 'num', answer: v }, hint: tx`Each change multiplies the *current* price: first by $${1 + up / 100}$, then by $${1 - down / 100}$.`, sol: [tx`After Monday: $${X}\times${1 + up / 100} = ${fmt(X * (1 + up / 100))}$.`, tx`After Tuesday: $${fmt(X * (1 + up / 100))}\times${1 - down / 100} = ${fmt(v)}$.`, tx`${v < X ? `Less than $${X}$: the fall was taken from a bigger number than the rise.` : v > X ? `More than $${X}$.` : `Exactly back to $${X}$.`}`] };
          } },
        ],
      },
      {
        id: 'equations', title: 'Solving equations', minutes: 25,
        summary: 'Finding the unknown by keeping both sides balanced.',
        idea: tx`An **equation** says two things are equal, like $3x + 4 = 10$. The letter $x$ is an unknown number, and **solving** means finding which number makes the statement true.

Think of a balance scale. Whatever you do to one side, do exactly the same to the other, and it stays balanced. Use that to peel layers away from $x$, undoing each operation in reverse order: first undo the adding or subtracting, then undo the multiplying or dividing, until $x$ stands alone.`,
        everyday: tx`A taxi charges \$4 to start plus \$3 per mile, and your ride cost \$19. How far did you go? Write the cost as an equation: $3m + 4 = 19$. Take away the \$4 starting fee from both sides: $3m = 15$. Split into the per-mile cost: $m = 5$ miles. Spreadsheets, budgets and recipes are full of little equations like this.`,
        visual: { widget: 'balance', caption: tx`The blue boxes each weigh $x$; orange balls weigh 1. Press **Next step** to remove the same weight from both sides, then split both sides into equal groups. The scale stays level the whole time, which is why the answer is right.` },
        math: tx`**The golden rule.** You may add, subtract, multiply or divide **both sides** by the same thing (except dividing by zero), and the equation stays true.

**Undo in reverse order.** For $ax + b = c$:
$$ax + b = c \;\Rightarrow\; ax = c - b \;\Rightarrow\; x = \frac{c - b}{a}.$$

**Brackets.** Expand first: $a(x + b) = ax + ab$.

**Unknowns on both sides.** Collect the $x$ terms on one side and the plain numbers on the other.

**Check your answer** by putting it back into the original equation.`,
        example: {
          problem: tx`Solve $5x - 7 = 2x + 8$.`,
          steps: [
            tx`Get the $x$ terms together: subtract $2x$ from both sides to get $3x - 7 = 8$.`,
            tx`Undo the $-7$: add 7 to both sides to get $3x = 15$.`,
            tx`Undo the "times 3": divide both sides by 3 to get $x = 5$.`,
            tx`Check: left side $5(5) - 7 = 18$, right side $2(5) + 8 = 18$. ✓`,
          ],
        },
        pitfalls: [
          tx`Do the same thing to the **whole** of each side: in $2x + 6 = 10$, dividing by 2 gives $x + 3 = 5$, not $x + 6 = 5$.`,
          tx`When you move a term to the other side its sign flips, because you're really subtracting it from both sides.`,
          tx`Multiply out brackets carefully: $-2(x - 3) = -2x + 6$, not $-2x - 6$.`,
        ],
        usedIn: tx`Every lesson. Finding where a derivative is zero (Module 03), solving systems of equations (Module 05) and rearranging formulas in statistics all come down to keeping equations balanced.`,
        practice: [
          { level: 1, gen(R) {
            const x = R.int(-9, 12), b = R.nz(-9, 9), c = x + b;
            return { q: tx`Solve $x ${sgn(b)} = ${c}$.`, ans: { type: 'num', answer: x, prefix: '$x =$' }, hint: tx`${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)} on both sides.`, sol: [tx`${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)}: $x = ${c} ${sgn(-b)} = ${x}$.`] };
          } },
          { level: 2, gen(R) {
            const a = R.nz(-6, 9), x = R.int(-6, 8), b = R.int(-10, 10), c = a * x + b;
            return { q: tx`Solve $${AM.co(a, 'x')} ${sgn(b)} = ${c}$.`.replace(' + 0 ', ' ').replace(' - 0 ', ' '), ans: { type: 'num', answer: x, prefix: '$x =$' }, hint: tx`First undo the ${b >= 0 ? `+${b}` : b}, then divide by ${a}.`, sol: [tx`${b >= 0 ? 'Subtract' : 'Add'} ${Math.abs(b)} on both sides: $${AM.co(a, 'x')} = ${c - b}$.`, tx`Divide by ${a}: $x = \frac{${c - b}}{${a}} = ${x}$.`, tx`Check: $${a}(${x}) ${sgn(b)} = ${c}$. ✓`] };
          } },
          { level: 3, gen(R) {
            let a, c; do { a = R.nz(-5, 6); c = R.int(-5, 6); } while (a === c);
            const x = R.int(-6, 6), b = R.int(-5, 5), d = a * (x + b) - c * x;
            return { q: tx`Solve $${a}(x ${sgn(b)}) = ${AM.co(c, 'x').replace(/^0x$/, '0')} ${sgn(d)}$.`.replace('(x + 0)', 'x').replace('(x - 0)', 'x').replace('= 0 + ', '= ').replace('= 0 - ', '= -'), ans: { type: 'num', answer: x, prefix: '$x =$' }, hint: tx`Expand the brackets, then collect the $x$ terms on one side.`, sol: [tx`Expand: $${a}x ${sgn(a * b)} = ${c}x ${sgn(d)}$.`, tx`Subtract $${c}x$ from both sides: $${a - c}x ${sgn(a * b)} = ${d}$.`, tx`${a * b >= 0 ? 'Subtract' : 'Add'} ${Math.abs(a * b)}: $${a - c}x = ${d - a * b}$, so $x = ${x}$.`] };
          } },
          { level: 4, gen(R) {
            const kind = R.pick(['taxi', 'phone', 'ages']);
            if (kind === 'taxi') { const f = R.int(2, 6), r = R.int(2, 4), m = R.int(3, 15), C = f + r * m; return { q: tx`A taxi charges \$${f} to start plus \$${r} per mile. A ride cost \$${C}. How many miles was it?`, ans: { type: 'num', answer: m, unit: 'miles' }, hint: tx`Write $${r}m + ${f} = ${C}$ and solve for $m$.`, sol: [tx`$${r}m + ${f} = ${C}$.`, tx`$${r}m = ${C - f}$, so $m = ${m}$ miles.`] }; }
            if (kind === 'phone') { const a = R.int(10, 20), pa = R.int(2, 5), b = a + R.int(5, 15), pb = R.int(0, pa - 1), x = (b - a) / (pa - pb); return { q: tx`Phone plan A costs \$${a} a month plus \$${pa} per GB. Plan B costs \$${b} a month plus \$${pb} per GB. At how many GB do they cost the same? Two decimals if needed.`, ans: { type: 'num', answer: x, unit: 'GB' }, hint: tx`Set the two costs equal: $${a} + ${pa}g = ${b} + ${pb}g$.`, sol: [tx`$${a} + ${pa}g = ${b} + ${pb}g$.`, tx`$${pa - pb}g = ${b - a}$, so $g = ${fmt(x, 4)}$ GB. Below that, plan A is cheaper; above it, plan B.`] }; }
            const k = R.int(2, 4), s = R.int(4, 12), y = R.int(3, 10), p = k * s;
            return { q: tx`A parent is ${k} times as old as their child. In ${y} years, the parent will be ${p + y} years old. How old is the child now?`, ans: { type: 'num', answer: s }, hint: tx`If the child is $c$ now, the parent is $${k}c$ now and $${k}c + ${y}$ in ${y} years.`, sol: [tx`$${k}c + ${y} = ${p + y}$.`, tx`$${k}c = ${p}$, so $c = ${s}$.`] };
          } },
        ],
      },
      {
        id: 'powers', title: 'Powers and roots', minutes: 25,
        summary: 'Repeated multiplication, its shortcuts, and undoing it.',
        idea: tx`A **power** is shorthand for multiplying a number by itself: $2^5 = 2\times2\times2\times2\times2 = 32$. The small raised number (the **exponent**) counts how many times. Powers grow astonishingly fast, which is why they describe things like compound interest and viral spread.

A **root** undoes a power: $\sqrt{25} = 5$ because $5^2 = 25$, and $\sqrt[3]{8} = 2$ because $2^3 = 8$. A handful of rules let you combine powers without multiplying everything out, and they also explain what negative and fractional exponents mean.`,
        everyday: tx`Fold a sheet of paper in half and it's 2 layers thick; fold again, 4; again, 8. After $n$ folds it's $2^n$ layers. After 42 folds (if you could) the stack would reach the Moon: $2^{42}$ is over four trillion.

Scientists write huge and tiny numbers with powers of 10: the Earth is about $6\times10^{24}$ kg; a bacterium is about $2\times10^{-6}$ m long.`,
        visual: { widget: 'plot', opts: {
          view: { xmin: -3, xmax: 5, ymin: -1, ymax: 20, xstep: 1, label: 'Graph of a power function' },
          params: [{ id: 'b', label: 'Base $b$', min: 0.5, max: 4, step: 0.1, value: 2 }, { id: 'n', label: 'Exponent $n$ to highlight', min: -2, max: 4, step: 1, value: 3, fmt: (v) => String(v) }],
          curves: [{ f: (x, p) => p.b ** x, color: 1 }],
          over: (pl, p) => { pl.point(p.n, p.b ** p.n, { color: 2, r: 6 }); pl.line(p.n, 0, p.n, p.b ** p.n, { color: 2, dash: [4, 4], width: 1.5 }); },
          readout: (p) => `$${AM.fmt(p.b, 2)}^{${p.n}} = ${AM.fmt(p.b ** p.n, 4)}$. ${p.n > 0 ? `That's ${p.n} copies of ${AM.fmt(p.b, 2)} multiplied together.` : p.n === 0 ? 'Anything (except 0) to the power 0 is 1.' : `A negative exponent means "one over": $${AM.fmt(p.b, 2)}^{${p.n}} = \\frac{1}{${AM.fmt(p.b, 2)}^{${-p.n}}}$.`} Each step right multiplies the height by ${AM.fmt(p.b, 2)}.`,
        }, caption: tx`Slide the exponent: each step to the right multiplies by the base. Go below zero to see that negative exponents give fractions, and that $b^0 = 1$ for every base.` },
        math: tx`**Definition.** $b^n = \underbrace{b\times b\times\cdots\times b}_{n\text{ times}}$.

**Rules.**
$$b^m\times b^n = b^{m+n}, \qquad \frac{b^m}{b^n} = b^{m-n}, \qquad (b^m)^n = b^{mn}, \qquad (ab)^n = a^nb^n.$$

**Zero and negative exponents.** $b^0 = 1$ and $b^{-n} = \dfrac{1}{b^n}$. So $2^{-3} = \frac18$.

**Roots and fractional exponents.** $\sqrt[n]{b} = b^{1/n}$ and $b^{m/n} = \left(\sqrt[n]{b}\right)^m$. So $8^{2/3} = (\sqrt[3]{8})^2 = 4$.

**Scientific notation.** Write numbers as $a\times10^k$ with $1 \le a < 10$. Multiply by multiplying the $a$'s and adding the exponents.`,
        example: {
          problem: tx`Simplify $\dfrac{2^5\times2^3}{2^4}$ and then evaluate $16^{3/4}$.`,
          steps: [
            tx`Top: $2^5\times2^3 = 2^{5+3} = 2^8$ (same base, so add exponents).`,
            tx`Divide: $\frac{2^8}{2^4} = 2^{8-4} = 2^4 = 16$.`,
            tx`$16^{3/4}$: take the 4th root first, $\sqrt[4]{16} = 2$ (since $2^4 = 16$).`,
            tx`Then cube it: $2^3 = 8$. So $16^{3/4} = 8$.`,
          ],
        },
        pitfalls: [
          tx`$2^3\times2^4 = 2^7$, not $2^{12}$ and not $4^7$. Add exponents when multiplying the same base.`,
          tx`$-3^2 = -9$ but $(-3)^2 = 9$: the power applies only to what's directly under it.`,
          tx`$\sqrt{a + b} \ne \sqrt a + \sqrt b$: $\sqrt{9 + 16} = 5$, not $7$.`,
        ],
        usedIn: tx`Exponential growth and logarithms (Module 01), polynomials and derivatives (Module 03), and error sizes like $10^{-8}$ in numerical methods (Module 11).`,
        practice: [
          { level: 1, gen(R) {
            const b = R.pick([2, 3, 5, 10, -2]), n = R.int(0, b === 10 ? 6 : 5), v = b ** n;
            return { q: tx`Work out $${b < 0 ? `(${b})` : b}^{${n}}$.`, ans: { type: 'num', answer: v }, hint: n === 0 ? tx`Anything (except 0) to the power 0 is 1.` : tx`Multiply ${n} copies of ${b} together.`, sol: [n === 0 ? tx`$${b}^0 = 1$.` : tx`$${Array(n).fill(b < 0 ? `(${b})` : b).join('\\times')} = ${v}$.`] };
          } },
          { level: 2, gen(R) {
            const b = R.pick(['x', '2', 'a']), m = R.int(2, 9), n = R.int(2, 9), k = R.int(1, 6), kind = R.pick(['mul', 'div', 'pow']);
            const [q, e, s] = { mul: [tx`${b}^{${m}}\times ${b}^{${n}}`, m + n, tx`Same base, multiplying: add the exponents, $${m} + ${n} = ${m + n}$.`], div: [tx`\frac{${b}^{${m + k}}}{${b}^{${k}}}`, m, tx`Same base, dividing: subtract the exponents, $${m + k} - ${k} = ${m}$.`], pow: [tx`\left(${b}^{${m}}\right)^{${n}}`, m * n, tx`Power of a power: multiply the exponents, $${m}\times${n} = ${m * n}$.`] }[kind];
            return { q: tx`Write $${q}$ as a single power of $${b}$. Enter just the exponent.`, ans: { type: 'num', answer: e, prefix: tx`$${b}^{\square}$, $\square =$` }, hint: tx`Multiplying: add exponents. Dividing: subtract. Power of a power: multiply.`, sol: [s, tx`So it's $${b}^{${e}}$.`] };
          } },
          { level: 3, gen(R) {
            const [base, root, pw] = R.pick([[8, 3, 2], [16, 4, 3], [27, 3, 2], [4, 2, 3], [25, 2, 3], [32, 5, 2], [9, 2, 3], [64, 3, 2], [16, 2, -1], [8, 3, -2], [100, 2, 3]]);
            const v = Math.round(Math.pow(base, 1 / root)) ** pw;
            return { q: tx`Evaluate $${base}^{${pw}/${root}}$. You can type a fraction.`.replace(`^{${pw}/${root}}`, `^{${pw < 0 ? '-' : ''}${Math.abs(pw)}/${root}}`), ans: { type: 'num', answer: v, abs: 1e-9, show: tx`$${frac(pw < 0 ? 1 : v, pw < 0 ? Math.round(Math.pow(base, 1 / root)) ** -pw : 1)}$` }, hint: tx`The bottom of the fraction is a root, the top is a power: take the ${root === 2 ? 'square' : root === 3 ? 'cube' : `${root}th`} root first.${pw < 0 ? ' A negative exponent means one over the result.' : ''}`, sol: [tx`$\sqrt[${root}]{${base}} = ${Math.round(Math.pow(base, 1 / root))}$.`, tx`Raise to the power ${pw}: $${Math.round(Math.pow(base, 1 / root))}^{${pw}} = ${pw < 0 ? frac(1, Math.round(Math.pow(base, 1 / root)) ** -pw) : v}$.`] };
          } },
          { level: 4, gen(R) {
            const a = R.int(11, 99) / 10, k = R.int(2, 9), c = R.int(11, 99) / 10, j = R.int(-6, 3), prod = a * c, e = k + j + (prod >= 10 ? 1 : 0), mant = prod >= 10 ? prod / 10 : prod;
            return { q: tx`Calculate $(${a}\times10^{${k}})\times(${c}\times10^{${j}})$ and give the result in scientific notation. Enter the number in front (to 3 decimals) and the power of 10.`, ans: { type: 'vec', answer: [mant, e], tol: 0.0006, placeholder: 'number, power' }, hint: tx`Multiply the front numbers, add the powers of 10, then adjust so the front number is between 1 and 10.`, sol: [tx`Front numbers: $${a}\times${c} = ${fmt(prod, 4)}$. Powers: $10^{${k} + (${j})} = 10^{${k + j}}$.`, prod >= 10 ? tx`$${fmt(prod, 4)}$ is 10 or more, so write it as $${fmt(mant, 4)}\times10^1$: result $${fmt(mant, 4)}\times10^{${e}}$.` : tx`Result: $${fmt(mant, 4)}\times10^{${e}}$.`] };
          } },
        ],
      },
      {
        id: 'lines', title: 'Straight lines and slope', minutes: 25,
        summary: 'Reading and writing the simplest graphs: steepness and starting point.',
        idea: tx`The graph of $y = mx + c$ is a straight line, and its two numbers tell you everything. The **slope** $m$ is how steep it is: how much $y$ goes up for every 1 step to the right ("rise over run"). The **intercept** $c$ is where it crosses the vertical axis, the value of $y$ when $x = 0$.

Positive slope goes uphill, negative slope goes downhill, zero slope is flat. Two points are enough to pin down a line, and where two lines cross is the point that satisfies both of their equations at once.`,
        everyday: tx`A gym charges a \$30 joining fee plus \$20 a month. Your total cost after $x$ months is $y = 20x + 30$: the slope (\$20 per month) is the rate you pay, the intercept (\$30) is what you pay before any months pass. Another gym charges no fee but \$25 a month: $y = 25x$. The lines cross at $x = 6$, so after 6 months the first gym becomes the better deal.`,
        visual: { widget: 'plot', opts: {
          view: { xmin: -6, xmax: 6, ymin: -6, ymax: 6, equal: true, xstep: 1, label: 'A straight line with adjustable slope and intercept' },
          params: [{ id: 'm', label: 'Slope $m$', min: -3, max: 3, step: 0.25, value: 0.5 }, { id: 'c', label: 'Intercept $c$', min: -4, max: 4, step: 0.5, value: 1 }],
          curves: [{ f: (x, p) => p.m * x + p.c, color: 1 }],
          over: (pl, p) => { pl.point(0, p.c, { color: 2, r: 6 }); pl.line(1, p.m + p.c, 2, p.m + p.c, { color: 3, width: 2.5 }); pl.line(2, p.m + p.c, 2, 2 * p.m + p.c, { color: 4, width: 2.5 }); pl.text('run 1', 1.5, p.m + p.c, { align: 'center', dy: 14, color: 3 }); pl.text(`rise ${AM.fmt(p.m, 2)}`, 2, 1.5 * p.m + p.c, { dx: 8, color: 4 }); },
          readout: (p) => `$y = ${AM.fmt(p.m, 2)}x ${p.c < 0 ? '-' : '+'} ${AM.fmt(Math.abs(p.c), 2)}$. The line crosses the $y$-axis at $${AM.fmt(p.c, 2)}$ (orange point). Every step of 1 to the right (green) changes $y$ by $${AM.fmt(p.m, 2)}$ (pink): ${p.m > 0 ? 'uphill' : p.m < 0 ? 'downhill' : 'flat'}.`,
        }, caption: tx`Change the slope and watch the pink "rise" for each green "run" of 1. Change the intercept and the whole line slides up and down without changing its steepness.` },
        math: tx`**Slope–intercept form.** $y = mx + c$: slope $m$, $y$-intercept $c$.

**Slope from two points** $(x_1, y_1)$ and $(x_2, y_2)$:
$$m = \frac{y_2 - y_1}{x_2 - x_1} = \frac{\text{rise}}{\text{run}}.$$

**Line through a point with slope $m$.** $y - y_1 = m(x - x_1)$.

**Parallel and perpendicular.** Parallel lines have equal slopes. Perpendicular lines have slopes that multiply to $-1$.

**Where two lines meet.** Set the two expressions for $y$ equal and solve for $x$, then substitute back to find $y$.`,
        example: {
          problem: tx`Find the line through $(1, 3)$ and $(4, 9)$, and where it crosses the line $y = -x + 7$.`,
          steps: [
            tx`Slope: $m = \frac{9 - 3}{4 - 1} = \frac{6}{3} = 2$.`,
            tx`Use the point $(1, 3)$: $y - 3 = 2(x - 1)$, so $y = 2x + 1$.`,
            tx`Crossing point: $2x + 1 = -x + 7$, so $3x = 6$ and $x = 2$.`,
            tx`Then $y = 2(2) + 1 = 5$. They cross at $(2, 5)$. Check in the other line: $-2 + 7 = 5$. ✓`,
          ],
        },
        pitfalls: [
          tx`Subtract in the same order on top and bottom: $\frac{y_2 - y_1}{x_2 - x_1}$, not $\frac{y_2 - y_1}{x_1 - x_2}$.`,
          tx`A vertical line ($x = 3$) has no slope (you'd divide by zero); a horizontal line has slope 0.`,
          tx`The intercept is where $x = 0$, not where $y = 0$.`,
        ],
        usedIn: tx`The derivative (Module 03) is the slope of a curve at a point, found by zooming in until it looks like a line. Linear regression (Module 09) fits the best straight line to data, and linear algebra (Module 05) is the study of many lines and planes at once.`,
        practice: [
          { level: 1, gen(R) {
            let x1, x2; do { x1 = R.int(-5, 5); x2 = R.int(-5, 5); } while (x1 === x2);
            const y1 = R.int(-6, 6), y2 = R.int(-6, 6);
            return { q: tx`Find the slope of the line through $(${x1}, ${y1})$ and $(${x2}, ${y2})$.`, ans: { type: 'num', answer: (y2 - y1) / (x2 - x1), abs: 1e-9, show: tx`$${frac(y2 - y1, x2 - x1)}$` }, hint: tx`Slope $= \frac{\text{change in } y}{\text{change in } x}$.`, sol: [tx`$m = \frac{${y2} - (${y1})}{${x2} - (${x1})} = \frac{${y2 - y1}}{${x2 - x1}} = ${frac(y2 - y1, x2 - x1)}$.`] };
          } },
          { level: 2, gen(R) {
            const m = R.nz(-4, 4), c = R.int(-6, 6), x1 = R.int(-4, 2), x2 = x1 + R.int(1, 4), y1 = m * x1 + c, y2 = m * x2 + c;
            return { q: tx`Find the equation of the line through $(${x1}, ${y1})$ and $(${x2}, ${y2})$. Type the right-hand side, like <code>2x + 1</code>.`, ans: { type: 'fn', expr: `${m}*x + (${c})`, prefix: '$y =$', show: tx`$y = ${AM.poly([m, c])}$` }, hint: tx`Find the slope first, then use one point to find the intercept.`, sol: [tx`Slope $m = \frac{${y2} - (${y1})}{${x2} - (${x1})} = ${m}$.`, tx`Intercept: $${y1} = ${m}(${x1}) + c$, so $c = ${c}$.`, tx`$y = ${AM.poly([m, c])}$.`] };
          } },
          { level: 3, gen(R) {
            let m1, m2; do { m1 = R.nz(-3, 3); m2 = R.nz(-3, 3); } while (m1 === m2);
            const x = R.int(-4, 4), y = R.int(-5, 5), c1 = y - m1 * x, c2 = y - m2 * x;
            return { q: tx`Where do the lines $y = ${AM.poly([m1, c1])}$ and $y = ${AM.poly([m2, c2])}$ cross? Enter $x, y$.`, ans: { type: 'vec', answer: [x, y], placeholder: 'x, y' }, hint: tx`Both lines have the same $y$ at the crossing point, so set the right-hand sides equal.`, sol: [tx`$${AM.poly([m1, c1])} = ${AM.poly([m2, c2])}$.`, tx`$${m1 - m2}x = ${c2 - c1}$, so $x = ${x}$.`, tx`$y = ${m1}(${x}) ${sgn(c1)} = ${y}$. Crossing point $(${x}, ${y})$.`] };
          } },
          { level: 4, gen(R) {
            const f1 = R.int(2, 8) * 10, r1 = R.int(10, 20), r2 = r1 + R.int(2, 10), n = f1 / (r2 - r1);
            return { q: tx`Gym A charges a \$${f1} joining fee plus \$${r1} a month. Gym B has no fee but charges \$${r2} a month. After how many months do they cost the same? Two decimals if needed.`, ans: { type: 'num', answer: n, unit: 'months' }, hint: tx`Costs: A is $${r1}x + ${f1}$, B is $${r2}x$. Set them equal.`, sol: [tx`$${r1}x + ${f1} = ${r2}x$.`, tx`$${f1} = ${r2 - r1}x$, so $x = ${fmt(n, 4)}$ months.`, tx`Before that, gym B is cheaper; after it, gym A wins. On a graph, that's where the two lines cross.`] };
          } },
        ],
      },
    ],
  });
})();
