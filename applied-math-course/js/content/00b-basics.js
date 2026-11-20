/* Basics stage: modules B1–B4, the school math everything else in the course leans on.
   Lessons on fractions, equations, powers and lines come from 00-basics.js (AM.basicsLessons). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, frac = AM.frac, sgn = AM.sgn, co = AM.co, poly = AM.poly, gcd = AM.m.gcd;
  const LB = AM.basicsLessons;
  const par = (n) => (n < 0 ? `(${n})` : `${n}`); // wrap negatives in brackets
  const tm = (n, v) => `${n < 0 ? '-' : '+'} ${Math.abs(n) === 1 ? v : Math.abs(n) + v}`; // "+ 3y", "- y"
  const r2 = (x) => Math.round(x * 100) / 100;
  const DEG = Math.PI / 180;

  /* ======================= B1 Numbers and Arithmetic ======================= */
  const order = {
    id: 'order', title: 'Order of operations', minutes: 20,
    summary: 'Which part of a calculation to do first, so everyone gets the same answer.',
    idea: tx`When a calculation has several steps, everyone has to do them in the same order, or two people get two different answers. The agreed order is:

1. **Brackets** first.
2. **Powers** (like $3^2$) next.
3. **Multiply and divide**, working left to right.
4. **Add and subtract**, working left to right.

People remember it as BODMAS or PEMDAS. A fraction bar counts as brackets around its top and around its bottom.`,
    everyday: tx`You buy 3 coffees at \$4 each and a \$2 muffin. The total is $2 + 3 \times 4$. Doing the multiplication first gives $2 + 12 = 14$ dollars, which matches the receipt. Going left to right instead would give $5 \times 4 = 20$ dollars, and you'd be overcharged. The rule just writes down what makes sense: work out each "lot" first, then add the lots together.`,
    visual: { widget: 'opsteps', opts: { items: [
      { label: '2 + 3 × 4', steps: [[tx`2 + 3 \times 4`, 'Two operations. Multiplication goes before addition.'], [tx`2 + 12`, 'Worked out $3 \\times 4 = 12$.'], [tx`14`, 'Then the addition.']] },
      { label: '(2 + 3) × 4', steps: [[tx`(2 + 3) \times 4`, 'Brackets always go first.'], [tx`5 \times 4`, 'Worked out the bracket: $2 + 3 = 5$.'], [tx`20`, 'Then multiplied.']] },
      { label: '20 − 2 × 3²', steps: [[tx`20 - 2 \times 3^2`, 'A power, a multiplication and a subtraction. Powers first.'], [tx`20 - 2 \times 9`, '$3^2 = 3 \\times 3 = 9$.'], [tx`20 - 18`, 'Then the multiplication: $2 \\times 9 = 18$.'], [tx`2`, 'Finally the subtraction.']] },
      { label: '18 ÷ 3 × 2', steps: [[tx`18 \div 3 \times 2`, 'Dividing and multiplying have equal rank, so go left to right.'], [tx`6 \times 2`, '$18 \\div 3 = 6$ first, because it is on the left.'], [tx`12`, 'Then $6 \\times 2$. (Doing $3 \\times 2$ first would wrongly give 3.)']] },
      { label: '(8 + 4) / (5 − 2) + 1', steps: [[tx`\frac{8 + 4}{5 - 2} + 1`, 'The fraction bar groups the top and the bottom, like brackets.'], [tx`\frac{12}{3} + 1`, 'Worked out the top and the bottom.'], [tx`4 + 1`, 'Did the division.'], [tx`5`, 'Did the addition.']] },
    ] }, caption: tx`Pick an example and press **Next step**. Each line shows the one operation that is allowed to go next.` },
    math: tx`**The order:** Brackets → Powers → $\times$ and $\div$ (left to right) → $+$ and $-$ (left to right).

**Equal rank goes left to right.** $12 \div 4 \times 3 = 3 \times 3 = 9$, and $10 - 4 + 3 = 6 + 3 = 9$.

**Fraction bars group.** $\dfrac{6 + 4}{2} = \dfrac{10}{2} = 5$, not $6 + 2$.

**Powers bind tightly.** $-3^2 = -(3^2) = -9$, but $(-3)^2 = 9$. And $2 \times 3^2 = 2 \times 9 = 18$, not $6^2$.`,
    example: {
      problem: tx`Work out $7 + (6 - 2)^2 \div 8 \times 3$.`,
      steps: [
        tx`Brackets: $6 - 2 = 4$, giving $7 + 4^2 \div 8 \times 3$.`,
        tx`Powers: $4^2 = 16$, giving $7 + 16 \div 8 \times 3$.`,
        tx`Divide and multiply, left to right: $16 \div 8 = 2$, then $2 \times 3 = 6$.`,
        tx`Add: $7 + 6 = 13$.`,
      ],
    },
    pitfalls: [
      tx`Multiply and divide are equal partners: do whichever comes first from the left. Same for add and subtract: $10 - 3 + 2 = 9$, not 5.`,
      tx`$-3^2 = -9$. The square applies to the 3 only, unless the minus sign is inside brackets.`,
      tx`On a calculator, type brackets around the top and bottom of a fraction: <code>(8+4)/(5-2)</code>, not <code>8+4/5-2</code>.`,
    ],
    usedIn: tx`Every formula in the course. When you type an answer into Gradient, it is read using exactly these rules.`,
    practice: [
      { level: 1, gen(R) {
        const [a, b, c, d] = [R.int(2, 9), R.int(2, 9), R.int(2, 9), R.int(2, 9)], k = R.int(0, 3);
        const [q, v, s] = [
          [tx`${a} + ${b} \times ${c}`, a + b * c, [tx`Multiply first: $${b} \times ${c} = ${b * c}$.`, tx`Then add: $${a} + ${b * c} = ${a + b * c}$.`]],
          [tx`${a} \times ${b} + ${c}`, a * b + c, [tx`Multiply first: $${a} \times ${b} = ${a * b}$.`, tx`Then add: $${a * b} + ${c} = ${a * b + c}$.`]],
          [tx`${a * b + 10} - ${b} \times ${c}`, a * b + 10 - b * c, [tx`Multiply first: $${b} \times ${c} = ${b * c}$.`, tx`Then subtract: $${a * b + 10} - ${b * c} = ${a * b + 10 - b * c}$.`]],
          [tx`${a} \times ${b} + ${c} \times ${d}`, a * b + c * d, [tx`Both multiplications first: $${a * b}$ and $${c * d}$.`, tx`Then add: $${a * b + c * d}$.`]],
        ][k];
        return { q: tx`Work out $${q}$.`, ans: { type: 'num', answer: v }, hint: tx`Multiplication comes before addition and subtraction.`, sol: s };
      } },
      { level: 2, gen(R) {
        const k = R.int(0, 3), a = R.int(2, 9), b = R.int(2, 9), c = R.int(2, 6), d = R.int(1, 9);
        if (k === 0) return { q: tx`Work out $(${a} + ${b}) \times ${c}$.`, ans: { type: 'num', answer: (a + b) * c }, hint: tx`Brackets first.`, sol: [tx`Bracket: $${a} + ${b} = ${a + b}$.`, tx`Multiply: $${a + b} \times ${c} = ${(a + b) * c}$.`] };
        if (k === 1) { const s = c * R.int(2, 6), x = R.int(1, s - 1); return { q: tx`Work out $(${x} + ${s - x}) \div ${c}$.`, ans: { type: 'num', answer: s / c }, hint: tx`Brackets first.`, sol: [tx`Bracket: $${x} + ${s - x} = ${s}$.`, tx`Divide: $${s} \div ${c} = ${s / c}$.`] }; }
        if (k === 2) return { q: tx`Work out $${a} + ${b}^2$.`, ans: { type: 'num', answer: a + b * b }, hint: tx`Powers before adding.`, sol: [tx`Power: $${b}^2 = ${b * b}$.`, tx`Add: $${a} + ${b * b} = ${a + b * b}$.`] };
        return { q: tx`Work out $${a} \times (${b + c} - ${c}) + ${d}$.`, ans: { type: 'num', answer: a * b + d }, hint: tx`Bracket first, then multiply, then add.`, sol: [tx`Bracket: $${b + c} - ${c} = ${b}$.`, tx`Multiply: $${a} \times ${b} = ${a * b}$.`, tx`Add: $${a * b} + ${d} = ${a * b + d}$.`] };
      } },
      { level: 3, gen(R) {
        const k = R.int(0, 3), a = R.int(2, 7), b = R.int(1, 30), c = R.int(1, 9), d = R.int(2, 5);
        if (k === 0) return { q: tx`Work out $-${a}^2 + ${b}$.`, ans: { type: 'num', answer: -a * a + b }, hint: tx`The square applies to ${a} only; the minus sign is applied after.`, sol: [tx`$${a}^2 = ${a * a}$, so $-${a}^2 = -${a * a}$.`, tx`$-${a * a} + ${b} = ${b - a * a}$.`] };
        if (k === 1) return { q: tx`Work out $(-${a})^2 - ${b}$.`, ans: { type: 'num', answer: a * a - b }, hint: tx`The minus sign is inside the bracket, so it gets squared too.`, sol: [tx`$(-${a})^2 = (-${a})(-${a}) = ${a * a}$.`, tx`$${a * a} - ${b} = ${a * a - b}$.`] };
        if (k === 2) { const e = c + R.int(1, 6); return { q: tx`Work out $${b} - (${e} - ${c}) \times ${d}$.`, ans: { type: 'num', answer: b - (e - c) * d }, hint: tx`Bracket, then multiply, then subtract.`, sol: [tx`Bracket: $${e} - ${c} = ${e - c}$.`, tx`Multiply: $${e - c} \times ${d} = ${(e - c) * d}$.`, tx`Subtract: $${b} - ${(e - c) * d} = ${b - (e - c) * d}$.`] }; }
        const top = d * R.int(2, 8), x = R.int(1, top - 1);
        return { q: tx`Work out $\dfrac{${x} + ${top - x}}{${d}} + ${c}^2$.`, ans: { type: 'num', answer: top / d + c * c }, hint: tx`The fraction bar works like brackets: finish the top first.`, sol: [tx`Top: $${x} + ${top - x} = ${top}$, then $\frac{${top}}{${d}} = ${top / d}$.`, tx`Power: $${c}^2 = ${c * c}$.`, tx`Add: $${top / d} + ${c * c} = ${top / d + c * c}$.`] };
      } },
      { level: 4, gen(R) {
        const n1 = R.int(2, 4), p1 = R.int(3, 7), n2 = R.int(1, 4), p2 = R.pick([1.5, 2, 2.5, 3]), cp = R.int(2, 5), tot = n1 * p1 + n2 * p2 - cp;
        return { q: tx`You buy ${n1} notebooks at \$${p1} each and ${n2} pens at \$${p2} each, and use a \$${cp} coupon on the total. You pay with a \$50 note. How much change do you get? (Write it as one calculation first.)`, ans: { type: 'num', answer: 50 - tot, unit: 'dollars' }, hint: tx`Change $= 50 - (${n1} \times ${p1} + ${n2} \times ${p2} - ${cp})$. Do the bracket first, multiplications inside it before the adding.`, sol: [tx`One calculation: $50 - (${n1} \times ${p1} + ${n2} \times ${p2} - ${cp})$.`, tx`Inside the bracket: $${n1 * p1} + ${fmt(n2 * p2)} - ${cp} = ${fmt(tot)}$.`, tx`Change: $50 - ${fmt(tot)} = ${fmt(50 - tot)}$ dollars.`] };
      } },
    ],
  };

  const negatives = {
    id: 'negatives', title: 'Negative numbers', minutes: 20,
    summary: 'Numbers below zero, and the sign rules for adding, subtracting, multiplying and dividing them.',
    idea: tx`Negative numbers sit to the left of zero on the number line. They describe anything that can go below a starting point: temperatures below freezing, money you owe, depths below sea level.

Adding a positive number moves you right; adding a negative number moves you left. Subtracting is "the opposite of adding", so subtracting a negative moves you **right**. For multiplying and dividing there is one short rule: **same signs give a positive answer, different signs give a negative answer**.`,
    everyday: tx`It is $-4$°C at dawn and warms up 9 degrees: $-4 + 9 = 5$°C. Your bank balance is minus \$30 (you owe \$30) and the bank removes a \$10 fee you were wrongly charged: $-30 - (-10) = -20$. Taking away a debt leaves you better off, which is why subtracting a negative goes up.`,
    visual: { widget: 'numberline', caption: tx`Start at 3 and add $-7$: the arrow goes left. Now switch to Subtract with the same numbers: subtracting $-7$ goes right. That's the whole "two minuses make a plus" rule.` },
    math: tx`**Adding and subtracting.**
$$a + (-b) = a - b, \qquad a - (-b) = a + b.$$

**Multiplying and dividing.**
$$(+)(+) = +, \quad (-)(-) = +, \quad (+)(-) = -, \quad (-)(+) = -.$$
The same rule holds for division: $(-12) \div (-3) = 4$ and $(-12) \div 3 = -4$.

**Several negatives multiplied:** an even number of minus signs gives a positive answer, an odd number gives a negative one.`,
    example: {
      problem: tx`Work out $-3 - (-8) + (-2) \times (-4)$.`,
      steps: [
        tx`Multiplication first: $(-2) \times (-4) = 8$ (same signs, positive).`,
        tx`Subtracting a negative is adding: $-3 - (-8) = -3 + 8 = 5$.`,
        tx`Add: $5 + 8 = 13$.`,
      ],
    },
    pitfalls: [
      tx`$-5 - 3 = -8$, not $-2$: you start below zero and go further down.`,
      tx`"Two negatives make a positive" is for multiplying and dividing. $-3 + (-4)$ is $-7$, not $+7$.`,
      tx`Bracket negative numbers when you square them: $(-4)^2 = 16$, but $-4^2 = -16$.`,
    ],
    usedIn: tx`Everywhere: slopes going downhill are negative (B3), coordinates left of the axis are negative, and solving equations constantly involves moving terms with their signs.`,
    practice: [
      { level: 1, gen(R) {
        let a, b; do { a = R.int(-12, 12); b = R.nz(-12, 12); } while (a >= 0 && b > 0);
        return { q: tx`Work out $${a} + ${par(b)}$.`, ans: { type: 'num', answer: a + b }, hint: b < 0 ? tx`Adding a negative number moves left on the number line.` : tx`Start at ${a} and move ${b} to the right.`, sol: [b < 0 ? tx`$${a} + (${b}) = ${a} - ${-b} = ${a + b}$.` : tx`$${a} + ${b} = ${a + b}$.`] };
      } },
      { level: 2, gen(R) {
        const a = R.int(-12, 12), b = R.chance(0.65) ? R.int(-12, -1) : R.int(1, 12);
        return { q: tx`Work out $${a} - ${par(b)}$.`, ans: { type: 'num', answer: a - b }, hint: b < 0 ? tx`Subtracting a negative is the same as adding a positive.` : tx`Start at ${a} and move ${b} to the left.`, sol: [b < 0 ? tx`$${a} - (${b}) = ${a} + ${-b} = ${a - b}$.` : tx`$${a} - ${b} = ${a - b}$.`] };
      } },
      { level: 3, gen(R) {
        const k = R.int(0, 2), a = R.nz(-9, 9), b = R.nz(-9, 9), c = R.nz(-4, 4);
        if (k === 0) return { q: tx`Work out $${par(a)} \times ${par(b)}$.`, ans: { type: 'num', answer: a * b }, hint: tx`Same signs give a positive answer, different signs a negative one.`, sol: [tx`$${Math.abs(a)} \times ${Math.abs(b)} = ${Math.abs(a * b)}$; the signs are ${(a < 0) === (b < 0) ? 'the same, so positive' : 'different, so negative'}: $${a * b}$.`] };
        if (k === 1) return { q: tx`Work out $${par(a * b)} \div ${par(b)}$.`, ans: { type: 'num', answer: a }, hint: tx`Divide the sizes, then decide the sign: same signs positive, different negative.`, sol: [tx`$${Math.abs(a * b)} \div ${Math.abs(b)} = ${Math.abs(a)}$; signs ${(a * b < 0) === (b < 0) ? 'the same, so positive' : 'different, so negative'}: $${a}$.`] };
        const neg = [a, b, c].filter((x) => x < 0).length;
        return { q: tx`Work out $${par(a)} \times ${par(b)} \times ${par(c)}$.`, ans: { type: 'num', answer: a * b * c }, hint: tx`Count the minus signs: an even number gives a positive answer.`, sol: [tx`Sizes: $${Math.abs(a)} \times ${Math.abs(b)} \times ${Math.abs(c)} = ${Math.abs(a * b * c)}$.`, tx`${neg} minus sign${neg === 1 ? '' : 's'} (${neg % 2 ? 'odd, so negative' : 'even, so positive'}): $${a * b * c}$.`] };
      } },
      { level: 4, gen(R) {
        if (R.chance(0.5)) {
          const t0 = R.int(-12, 2), r = R.int(2, 4), h = R.int(2, 6), d = R.int(5, 15), f = t0 + r * h - d;
          return { q: tx`At 6 a.m. it is $${t0}$°C. The temperature rises ${r} degrees each hour for ${h} hours, then falls ${d} degrees overnight. What is the final temperature?`, ans: { type: 'num', answer: f, unit: '°C' }, hint: tx`Final $= ${t0} + ${r} \times ${h} - ${d}$.`, sol: [tx`Rise: $${r} \times ${h} = ${r * h}$ degrees.`, tx`$${t0} + ${r * h} = ${t0 + r * h}$, then $${t0 + r * h} - ${d} = ${f}$°C.`] };
        }
        const b0 = -R.int(20, 120), dep = R.int(30, 150), fee = R.int(5, 25), back = R.int(5, 25), f = b0 + dep - fee - -back;
        return { q: tx`Your account is at $${b0}$ dollars (overdrawn). You deposit \$${dep}, are charged a \$${fee} fee, and then the bank cancels an earlier charge of \$${back} (it subtracts $-${back}$). What is the balance now?`, ans: { type: 'num', answer: f, unit: 'dollars' }, hint: tx`Balance $= ${b0} + ${dep} - ${fee} - (-${back})$. Subtracting a negative adds.`, sol: [tx`$${b0} + ${dep} = ${b0 + dep}$.`, tx`$${b0 + dep} - ${fee} = ${b0 + dep - fee}$.`, tx`$${b0 + dep - fee} - (-${back}) = ${b0 + dep - fee} + ${back} = ${f}$ dollars.`] };
      } },
    ],
  };

  const ratios = {
    id: 'ratios', title: 'Ratios, rates and proportion', minutes: 25,
    summary: 'Comparing amounts, sharing in a ratio, and scaling recipes and prices up or down.',
    idea: tx`A **ratio** like $2:3$ says "for every 2 of the first thing there are 3 of the second". Like fractions, ratios can be simplified by dividing both parts by the same number: $10:15 = 2:3$.

Two quantities are **in proportion** if doubling one doubles the other: twice the apples cost twice as much. The easy way to scale anything is the **unit method**: first work out the amount for *one*, then multiply up to as many as you need.`,
    everyday: tx`A recipe for 4 people uses 300 g of pasta. For 6 people: one person needs $300 \div 4 = 75$ g, so 6 people need $6 \times 75 = 450$ g. A shop sells 5 kg of rice for \$12 and 2 kg for \$5. Which is better value? Per kilogram: \$2.40 versus \$2.50, so the big bag.`,
    visual: { widget: 'plot', opts: {
      view: { xmin: 0, xmax: 10, ymin: 0, ymax: 50, xstep: 1, ystep: 10, label: 'Cost against quantity' },
      params: [{ id: 'k', label: 'Price for one kilogram (dollars)', min: 0.5, max: 5, step: 0.25, value: 2.5 }, { id: 'n', label: 'Kilograms bought', min: 0, max: 10, step: 0.5, value: 4 }],
      curves: [{ f: (x, p) => p.k * x, color: 1 }],
      over: (pl, p) => { const y = p.k * p.n; pl.line(p.n, 0, p.n, y, { color: 2, dash: [4, 4], width: 1.5 }); pl.line(0, y, p.n, y, { color: 2, dash: [4, 4], width: 1.5 }); pl.point(p.n, y, { color: 2, r: 6 }); pl.point(1, p.k, { color: 3, r: 5 }); },
      readout: (p) => `${AM.fmt(p.n, 2)} kg at \\$${AM.fmt(p.k, 2)} per kg costs $${AM.fmt(p.n, 2)} \\times ${AM.fmt(p.k, 2)} = ${AM.fmt(p.n * p.k, 2)}$ dollars. The green dot is the price of **one** kilogram (the unit rate). The graph is a straight line through zero: that's what "in proportion" looks like.`,
    }, caption: tx`Double the kilograms and watch the cost double. A steeper line means a higher price per kilogram.` },
    math: tx`**Simplifying.** Divide both parts by their highest common factor: $12:18 = 2:3$ (divide by 6).

**Sharing in a ratio $a:b$.** Add the parts to get the total number of shares, $a + b$. One share is $\dfrac{\text{total}}{a + b}$. The first person gets $a$ shares, the second gets $b$.

**Unit method (direct proportion).** If $q_1$ items cost $c_1$, one item costs $c_1 / q_1$, so $q_2$ items cost $q_2 \times \dfrac{c_1}{q_1}$.

**Inverse proportion.** Sometimes one goes *down* when the other goes up: more workers finish a job faster. Then the **product** stays fixed: $\text{workers} \times \text{days} = \text{constant}$.`,
    example: {
      problem: tx`Share \$90 between Ana and Ben in the ratio $2:3$.`,
      steps: [
        tx`Total shares: $2 + 3 = 5$.`,
        tx`One share: $90 \div 5 = 18$ dollars.`,
        tx`Ana gets $2 \times 18 = 36$ dollars, Ben gets $3 \times 18 = 54$ dollars.`,
        tx`Check: $36 + 54 = 90$ ✓ and $36:54 = 2:3$ ✓.`,
      ],
    },
    pitfalls: [
      tx`Order matters: $2:3$ is not the same as $3:2$.`,
      tx`In "share in the ratio $2:3$", Ana does **not** get $\frac23$. She gets 2 of the 5 shares, which is $\frac25$.`,
      tx`Not everything is proportional. If one oven bakes a cake in 40 minutes, two ovens don't bake it in 20.`,
    ],
    usedIn: tx`Slopes and rates of change are ratios (B3, Module 03). Probability (Module 08) is a ratio of outcomes. Unit conversions and scaling models up are proportion problems.`,
    practice: [
      { level: 1, gen(R) {
        let a, b; do { a = R.int(1, 9); b = R.int(1, 9); } while (a === b || gcd(a, b) !== 1);
        const g = R.int(2, 9);
        return { q: tx`Simplify the ratio $${a * g}:${b * g}$. Enter the two numbers separated by a comma, like <code>2, 3</code>.`, ans: { type: 'vec', answer: [a, b], placeholder: 'a, b' }, hint: tx`Find the biggest number that divides both ${a * g} and ${b * g}.`, sol: [tx`Both divide by ${g}: $${a * g} \div ${g} = ${a}$ and $${b * g} \div ${g} = ${b}$.`, tx`So $${a * g}:${b * g} = ${a}:${b}$.`] };
      } },
      { level: 2, gen(R) {
        let a, b; do { a = R.int(1, 7); b = R.int(1, 7); } while (a === b || gcd(a, b) !== 1);
        const u = R.int(4, 30), T = (a + b) * u, big = Math.max(a, b);
        return { q: tx`Share \$${T} in the ratio $${a}:${b}$. How much is the **larger** share?`, ans: { type: 'num', answer: big * u, unit: 'dollars' }, hint: tx`There are $${a} + ${b} = ${a + b}$ shares in total. Find one share first.`, sol: [tx`One share: $${T} \div ${a + b} = ${u}$.`, tx`The larger share is ${big} shares: $${big} \times ${u} = ${big * u}$ dollars.`] };
      } },
      { level: 3, gen(R) {
        if (R.chance(0.5)) {
          const q1 = R.int(2, 8), p = R.int(2, 20) / 4, q2 = R.int(2, 15);
          return { q: tx`${q1} kg of apples cost \$${fmt(q1 * p, 2)}. How much do ${q2} kg cost?`, ans: { type: 'num', answer: q2 * p, unit: 'dollars' }, hint: tx`Find the price of 1 kg first.`, sol: [tx`One kg: $${fmt(q1 * p, 2)} \div ${q1} = ${fmt(p, 2)}$ dollars.`, tx`${q2} kg: $${q2} \times ${fmt(p, 2)} = ${fmt(q2 * p, 2)}$ dollars.`] };
        }
        const t1 = R.pick([2, 2.5, 3, 4, 5]), v = R.int(8, 24) * 5, t2 = R.int(1, 7);
        return { q: tx`A train travels ${fmt(v * t1)} km in ${t1} hours at a steady speed. How far does it go in ${t2} hours?`, ans: { type: 'num', answer: v * t2, unit: 'km' }, hint: tx`Find how far it goes in 1 hour (its speed).`, sol: [tx`Speed: $${fmt(v * t1)} \div ${t1} = ${v}$ km per hour.`, tx`In ${t2} hours: $${t2} \times ${v} = ${v * t2}$ km.`] };
      } },
      { level: 4, gen(R) {
        let w1, w2; do { w1 = R.int(2, 8); w2 = R.int(2, 12); } while (w1 === w2);
        const d1 = R.int(2, 12), d2 = (w1 * d1) / w2;
        return { q: tx`${w1} painters take ${d1} days to paint a building. How many days would ${w2} painters take, working at the same rate? Two decimals if needed.`, ans: { type: 'num', answer: d2, unit: 'days' }, hint: tx`This is inverse proportion: more painters, fewer days. The total work, painters × days, stays the same.`, sol: [tx`Total work: $${w1} \times ${d1} = ${w1 * d1}$ painter-days.`, tx`With ${w2} painters: $${w1 * d1} \div ${w2} = ${fmt(d2, 4)}$ days.`] };
      } },
    ],
  };

  /* ======================= B2 Algebra Basics ======================= */
  const expressions = {
    id: 'expressions', title: 'Expressions and brackets', minutes: 25,
    summary: 'Using letters for numbers: substituting, collecting like terms and expanding brackets.',
    idea: tx`In algebra a letter stands for a number you don't know yet, or one that can change. An **expression** like $3x + 2$ is a recipe: "take the number, multiply by 3, add 2".

Three skills do most of the work:
- **Substituting**: put a number in place of the letter and work it out.
- **Collecting like terms**: $3x + 2x = 5x$, just as 3 apples + 2 apples = 5 apples. But $x$ and $x^2$ are different things and can't be combined.
- **Expanding brackets**: everything inside a bracket gets multiplied by what's outside: $3(x + 4) = 3x + 12$.`,
    everyday: tx`A phone plan costs \$15 a month plus \$2 per gigabyte: the cost is $15 + 2g$ for $g$ gigabytes. Use 6 GB and you pay $15 + 2 \times 6 = 27$ dollars. If you and a friend both have the plan, your total is $2(15 + 2g) = 30 + 4g$: expanding the bracket just splits the bill into its fixed part and its per-gigabyte part.`,
    visual: { widget: 'areamodel', caption: tx`A rectangle $(x + 3)$ wide and $(x + 2)$ tall. Its area is the product of the brackets, and it's also the sum of the pieces: one $x^2$ square, five $x$ strips and six unit squares. That's why $(x + 3)(x + 2) = x^2 + 5x + 6$.` },
    math: tx`**Substitution.** If $x = 4$ then $3x + 2 = 3(4) + 2 = 14$. Use brackets when the number is negative: $x^2$ at $x = -3$ is $(-3)^2 = 9$.

**Like terms** have exactly the same letters and powers: $4x$ and $-x$ are like terms; $4x$ and $4x^2$ are not.

**Expanding one bracket.** $a(b + c) = ab + ac$. Watch signs: $-2(x - 5) = -2x + 10$.

**Expanding two brackets.** Every term in the first meets every term in the second:
$$(a + b)(c + d) = ac + ad + bc + bd.$$
A special case worth remembering: $(x + a)^2 = x^2 + 2ax + a^2$, **not** $x^2 + a^2$.`,
    example: {
      problem: tx`Expand and simplify $3(x + 4) - 2(x - 1)$.`,
      steps: [
        tx`First bracket: $3(x + 4) = 3x + 12$.`,
        tx`Second bracket, with its minus sign: $-2(x - 1) = -2x + 2$.`,
        tx`Together: $3x + 12 - 2x + 2$.`,
        tx`Collect like terms: $3x - 2x = x$ and $12 + 2 = 14$, giving $x + 14$.`,
      ],
    },
    pitfalls: [
      tx`Multiply **every** term inside the bracket: $3(x + 4) = 3x + 12$, not $3x + 4$.`,
      tx`$(x + 3)^2 \ne x^2 + 9$. Write it as $(x + 3)(x + 3)$ and expand: $x^2 + 6x + 9$.`,
      tx`$2x$ means $2 \times x$. When $x = 5$, $2x = 10$, not 25.`,
    ],
    usedIn: tx`Every later lesson manipulates expressions. Factoring (B3) is expanding in reverse, and derivatives (Module 03) are much easier once a product has been expanded.`,
    practice: [
      { level: 1, gen(R) {
        const a = R.nz(-6, 7), b = R.nz(-6, 7), x = R.int(-5, 6), y = R.int(-5, 6), v = a * x + b * y;
        return { q: tx`If $x = ${x}$ and $y = ${y}$, work out $${co(a, 'x')} ${tm(b, 'y')}$.`, ans: { type: 'num', answer: v }, hint: tx`Replace each letter with its number (in brackets if negative), then multiply before adding.`, sol: [tx`$${a}${par(x)} ${b < 0 ? '-' : '+'} ${Math.abs(b)}${par(y)} = ${a * x} ${sgn(b * y)} = ${v}$.`] };
      } },
      { level: 2, gen(R) {
        let a, c; do { a = R.nz(-6, 8); c = R.nz(-6, 8); } while (a + c === 0);
        const b = R.nz(-9, 9), d = R.nz(-9, 9);
        return { q: tx`Simplify $${co(a, 'x')} ${sgn(b)} ${tm(c, 'x')} ${sgn(d)}$.`, ans: { type: 'fn', expr: `${a + c}*x + (${b + d})`, show: tx`$${poly([a + c, b + d])}$`, placeholder: 'e.g. 5x - 2' }, hint: tx`Collect the $x$ terms together and the plain numbers together.`, sol: [tx`$x$ terms: $${a} + ${par(c)} = ${a + c}$, so $${co(a + c, 'x')}$.`, tx`Numbers: $${b} + ${par(d)} = ${b + d}$.`, tx`Answer: $${poly([a + c, b + d])}$.`] };
      } },
      { level: 3, gen(R) {
        const a = R.int(1, 3), c = R.int(1, 3), b = R.nz(-6, 6), d = R.nz(-6, 6);
        const f1 = poly([a, b]), f2 = poly([c, d]), res = poly([a * c, a * d + b * c, b * d]);
        return { q: tx`Expand and simplify $(${f1})(${f2})$.`, ans: { type: 'fn', expr: `${a * c}*x^2 + (${a * d + b * c})*x + (${b * d})`, show: tx`$${res}$`, placeholder: 'e.g. x^2 + 5x + 6' }, hint: tx`Every term of the first bracket multiplies every term of the second: four products, then collect the $x$ terms.`, sol: [tx`Four products: $${co(a, 'x')}\cdot ${co(c, 'x')} = ${a * c === 1 ? '' : a * c}x^2$, $${co(a, 'x')}\cdot ${par(d)} = ${a * d}x$, $${b}\cdot ${co(c, 'x')} = ${b * c}x$, $${b}\cdot ${par(d)} = ${b * d}$.`, tx`Collect: $${res}$.`] };
      } },
      { level: 4, gen(R) {
        const a = R.nz(-7, 7), b = R.int(1, 7);
        if (R.chance(0.5)) return { q: tx`Expand and simplify $(x ${sgn(a)})^2 - (x - ${b})(x + ${b})$.`, ans: { type: 'fn', expr: `${2 * a}*x + ${a * a + b * b}`, show: tx`$${poly([2 * a, a * a + b * b])}$` }, hint: tx`$(x ${sgn(a)})^2 = (x ${sgn(a)})(x ${sgn(a)})$. The second product has no middle term.`, sol: [tx`$(x ${sgn(a)})^2 = x^2 ${sgn(2 * a)}x + ${a * a}$.`, tx`$(x - ${b})(x + ${b}) = x^2 - ${b * b}$.`, tx`Subtract: $x^2 ${sgn(2 * a)}x + ${a * a} - x^2 + ${b * b} = ${poly([2 * a, a * a + b * b])}$.`] };
        const p = R.int(1, 6), q = R.int(1, 6);
        return { q: tx`A rectangular garden is $(x + ${p})$ m long and $(x + ${q})$ m wide. A square patio $x$ m by $x$ m is paved over. Write the area of the grass that's left, expanded and simplified.`, ans: { type: 'fn', expr: `${p + q}*x + ${p * q}`, show: tx`$${poly([p + q, p * q])}$`, prefix: 'Area =' }, hint: tx`Grass = whole garden minus patio $= (x + ${p})(x + ${q}) - x^2$.`, sol: [tx`Garden: $(x + ${p})(x + ${q}) = x^2 + ${p + q}x + ${p * q}$.`, tx`Minus the patio $x^2$: $${poly([p + q, p * q])}$ square metres.`] };
      } },
    ],
  };

  const rearrange = {
    id: 'rearrange', title: 'Rearranging formulas', minutes: 20,
    summary: 'Changing which letter a formula is "for", using the same balancing moves as solving.',
    idea: tx`A formula links several quantities, like $F = 1.8C + 32$ for temperatures. It's written to give you $F$ when you know $C$. **Rearranging** (or "changing the subject") rewrites it to give you a different letter, here $C$ when you know $F$.

You use exactly the moves from solving equations: do the same thing to both sides, undoing operations in reverse order until the letter you want is alone.`,
    everyday: tx`A weather site says it's 77°F and you think in Celsius. Rearranged, $C = \frac{F - 32}{1.8}$, so $C = \frac{77 - 32}{1.8} = 25$°C. Once you've rearranged a formula you can reuse it for every temperature, instead of solving a new equation each time.`,
    visual: { widget: 'opsteps', opts: { pickLabel: 'Choose a formula', items: [
      { label: 'v = u + at, find t', steps: [[tx`v = u + at`, 'Goal: get $t$ alone. It is multiplied by $a$, then $u$ is added.'], [tx`v - u = at`, 'Undo the "add $u$": subtract $u$ from both sides.'], [tx`\frac{v - u}{a} = t`, 'Undo the "times $a$": divide both sides by $a$. Done.']] },
      { label: 'F = 1.8C + 32, find C', steps: [[tx`F = 1.8C + 32`, 'Goal: get $C$ alone.'], [tx`F - 32 = 1.8C`, 'Subtract 32 from both sides.'], [tx`C = \frac{F - 32}{1.8}`, 'Divide both sides by 1.8, and write it the other way round.']] },
      { label: 'A = πr², find r', steps: [[tx`A = \pi r^2`, 'Goal: get $r$ alone. It is squared, then multiplied by $\\pi$.'], [tx`\frac{A}{\pi} = r^2`, 'Undo the "times $\\pi$": divide by $\\pi$.'], [tx`r = \sqrt{\frac{A}{\pi}}`, 'Undo the square with a square root.']] },
      { label: 'P = 2(l + w), find w', steps: [[tx`P = 2(l + w)`, 'Goal: get $w$ alone.'], [tx`\frac{P}{2} = l + w`, 'Divide both sides by 2.'], [tx`w = \frac{P}{2} - l`, 'Subtract $l$ from both sides.']] },
    ] }, caption: tx`Each step undoes one operation, in the reverse order to how the letter was built up.` },
    math: tx`**Inverse operations** undo each other:

| Operation | Undo it with |
|---|---|
| add $a$ | subtract $a$ |
| multiply by $a$ | divide by $a$ |
| square | square root |

**Recipe:** look at what has been done to the letter you want, in order, then undo those steps in reverse order, doing each one to both sides.

**Check** by putting numbers in: if the original gives $F = 77$ when $C = 25$, the rearranged one should give $C = 25$ when $F = 77$.`,
    example: {
      problem: tx`Make $t$ the subject of $s = \dfrac{d}{t}$ (speed = distance ÷ time).`,
      steps: [
        tx`$t$ is on the bottom of a fraction. Multiply both sides by $t$: $st = d$.`,
        tx`Now $t$ is multiplied by $s$. Divide both sides by $s$: $t = \dfrac{d}{s}$.`,
        tx`Check: 120 km at 60 km/h gives $t = \frac{120}{60} = 2$ hours. ✓`,
      ],
    },
    pitfalls: [
      tx`Do the same thing to the **whole** of each side. From $y = 3x + 6$, dividing by 3 gives $\frac{y}{3} = x + 2$, not $\frac y3 = x + 6$.`,
      tx`Undo in reverse order: in $y = 3x + 6$ the "+6" was done last, so undo it first.`,
      tx`A square root gives a positive and a negative answer; for lengths and times, keep the positive one.`,
    ],
    usedIn: tx`Physics and engineering formulas, statistics (solving $z = \frac{x - \mu}{\sigma}$ for $x$ in Module 09), and finding inverse functions in Module 01.`,
    practice: [
      { level: 1, gen(R) {
        const a = R.int(1, 12), plus = R.chance(0.5);
        return { q: tx`Make $x$ the subject of $y = x ${plus ? '+' : '-'} ${a}$. Type the right-hand side using $y$.`, ans: { type: 'fn', expr: plus ? `y - ${a}` : `y + ${a}`, vars: ['y'], prefix: '$x =$', show: tx`$x = y ${plus ? '-' : '+'} ${a}$`, placeholder: 'use y' }, hint: tx`${plus ? 'Subtract' : 'Add'} ${a} on both sides.`, sol: [tx`${plus ? 'Subtract' : 'Add'} ${a}: $x = y ${plus ? '-' : '+'} ${a}$.`] };
      } },
      { level: 2, gen(R) {
        const a = R.pick([2, 3, 4, 5, 6, -2, -3, 7]), b = R.nz(-9, 9);
        return { q: tx`Make $x$ the subject of $y = ${a}x ${sgn(b)}$. Type the right-hand side using $y$.`, ans: { type: 'fn', expr: `(y - (${b}))/(${a})`, vars: ['y'], prefix: '$x =$', show: tx`$x = \frac{y ${sgn(-b)}}{${a}}$`, placeholder: 'e.g. (y - 3)/2' }, hint: tx`First undo the ${sgn(b).replace(' ', '')}, then divide by ${a}.`, sol: [tx`${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)}: $y ${sgn(-b)} = ${a}x$.`, tx`Divide by ${a}: $x = \frac{y ${sgn(-b)}}{${a}}$.`] };
      } },
      { level: 3, gen(R) {
        const k = R.int(0, 3);
        if (k === 0) { const u = R.int(0, 20), a = R.int(2, 10), t = R.int(2, 12), v = u + a * t; return { q: tx`Rearrange $v = u + at$ to make $t$ the subject, then find $t$ when $v = ${v}$, $u = ${u}$ and $a = ${a}$.`, ans: { type: 'num', answer: t }, hint: tx`$t = \frac{v - u}{a}$.`, sol: [tx`$t = \frac{v - u}{a}$.`, tx`$t = \frac{${v} - ${u}}{${a}} = \frac{${v - u}}{${a}} = ${t}$.`] }; }
        if (k === 1) { const C = R.int(-10, 40), F = r2(1.8 * C + 32); return { q: tx`Rearrange $F = 1.8C + 32$ to make $C$ the subject, then convert $${fmt(F, 2)}$°F to Celsius.`, ans: { type: 'num', answer: C, unit: '°C' }, hint: tx`$C = \frac{F - 32}{1.8}$.`, sol: [tx`$C = \frac{F - 32}{1.8}$.`, tx`$C = \frac{${fmt(F, 2)} - 32}{1.8} = ${fmt(C, 3)}$°C.`] }; }
        if (k === 2) { const l = R.int(3, 20), w = R.int(2, 15), P = 2 * (l + w); return { q: tx`Rearrange $P = 2(l + w)$ to make $w$ the subject, then find the width of a rectangle with perimeter ${P} cm and length ${l} cm.`, ans: { type: 'num', answer: w, unit: 'cm' }, hint: tx`$w = \frac{P}{2} - l$.`, sol: [tx`$w = \frac{P}{2} - l$.`, tx`$w = \frac{${P}}{2} - ${l} = ${P / 2} - ${l} = ${w}$ cm.`] }; }
        const b = R.int(2, 16), h = R.int(2, 16), A = (b * h) / 2;
        return { q: tx`Rearrange $A = \frac12 bh$ to make $h$ the subject, then find the height of a triangle with area ${fmt(A)} and base ${b}.`, ans: { type: 'num', answer: h }, hint: tx`Multiply both sides by 2, then divide by $b$: $h = \frac{2A}{b}$.`, sol: [tx`$h = \frac{2A}{b}$.`, tx`$h = \frac{2 \times ${fmt(A)}}{${b}} = \frac{${2 * A}}{${b}} = ${h}$.`] };
      } },
      { level: 4, gen(R) {
        if (R.chance(0.5)) { const A = R.int(10, 400); const r = Math.sqrt(A / Math.PI); return { q: tx`A circle has area ${A} cm². Rearrange $A = \pi r^2$ to find its radius, to 2 decimal places.`, ans: { type: 'num', answer: r, unit: 'cm' }, hint: tx`Divide by $\pi$, then take the square root: $r = \sqrt{A / \pi}$.`, sol: [tx`$r = \sqrt{\frac{A}{\pi}}$.`, tx`$r = \sqrt{\frac{${A}}{\pi}} = \sqrt{${fmt(A / Math.PI, 4)}} \approx ${fmt(r, 4)}$ cm.`] }; }
        const m = R.int(2, 20), E = R.int(10, 500), v = Math.sqrt((2 * E) / m);
        return { q: tx`Kinetic energy is $E = \frac12 mv^2$. Make $v$ the subject, then find the speed (to 2 decimals) of a ${m} kg object with $E = ${E}$ joules.`, ans: { type: 'num', answer: v, unit: 'm/s' }, hint: tx`Multiply by 2, divide by $m$, then square root: $v = \sqrt{2E / m}$.`, sol: [tx`$2E = mv^2$, so $v^2 = \frac{2E}{m}$ and $v = \sqrt{\frac{2E}{m}}$.`, tx`$v = \sqrt{\frac{2 \times ${E}}{${m}}} = \sqrt{${fmt((2 * E) / m, 4)}} \approx ${fmt(v, 4)}$ m/s.`] };
      } },
    ],
  };

  const REL = { '<': '<', '<=': '\\le', '>': '>', '>=': '\\ge' }, FLIP = { '<': '>', '<=': '>=', '>': '<', '>=': '<=' };
  const inequalities = {
    id: 'inequalities', title: 'Inequalities', minutes: 20,
    summary: 'Solving "less than" and "greater than" statements, and the one rule that differs from equations.',
    idea: tx`An **inequality** says one side is bigger or smaller than the other: $x > 3$ means "$x$ is more than 3". Instead of a single answer, the solution is a whole **range** of numbers, which you can shade on a number line.

You solve inequalities just like equations, with one extra rule: **if you multiply or divide both sides by a negative number, flip the sign.** That's because negatives reverse order: $2 < 5$, but $-2 > -5$.`,
    everyday: tx`"You must be at least 18" is $\text{age} \ge 18$. A taxi costs \$3 plus \$2 per mile and you have \$25: you can afford $3 + 2m \le 25$, so $m \le 11$ miles. Any distance up to 11 miles works; that range is the solution.`,
    visual: { widget: 'ineqline', caption: tx`Make $a$ negative and watch the shaded side jump to the other direction: dividing by a negative flips the inequality.` },
    math: tx`**Symbols:** $<$ less than, $\le$ less than or equal to, $>$ greater than, $\ge$ greater than or equal to.

**Allowed moves** (same as equations): add or subtract anything on both sides; multiply or divide both sides by a **positive** number.

**The flip rule:** multiplying or dividing by a **negative** number reverses the sign:
$$-2x < 6 \;\Rightarrow\; x > -3.$$

**On a number line:** a filled dot means the end value is included ($\le$, $\ge$); a hollow dot means it isn't ($<$, $>$).`,
    example: {
      problem: tx`Solve $5 - 2x \ge 11$.`,
      steps: [
        tx`Subtract 5 from both sides: $-2x \ge 6$.`,
        tx`Divide both sides by $-2$. It's negative, so the sign flips: $x \le -3$.`,
        tx`Check with $x = -4$ (which should work): $5 - 2(-4) = 13 \ge 11$ ✓. And $x = 0$ (which shouldn't): $5 \ge 11$ is false ✓.`,
      ],
    },
    pitfalls: [
      tx`Forgetting to flip when dividing by a negative. Test a number from your answer to catch it.`,
      tx`$x > 3$ does not include 3. If the question says "at least", use $\ge$.`,
      tx`For "how many whole items can I afford?", round **down**, even if the decimal is .9.`,
    ],
    usedIn: tx`Limits and error bounds in analysis (Module 10), constraints in optimization and linear programming (Module 14), and confidence intervals in statistics.`,
    practice: [
      { level: 1, gen(R) {
        const b = R.nz(-9, 9), c = R.int(-10, 15), rel = R.pick(['<', '<=', '>', '>=']);
        return { q: tx`Solve $x ${sgn(b)} ${REL[rel]} ${c}$. Enter the number that completes $x ${REL[rel]} \square$.`, ans: { type: 'num', answer: c - b, prefix: tx`$x ${REL[rel]}$` }, hint: tx`${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)} on both sides, just like an equation.`, sol: [tx`${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)}: $x ${REL[rel]} ${c} ${sgn(-b)} = ${c - b}$.`] };
      } },
      { level: 2, gen(R) {
        const a = R.int(2, 6), b = R.nz(-9, 9), c = R.int(-10, 20), rel = R.pick(['<', '<=', '>', '>=']), k = (c - b) / a;
        return { q: tx`Solve $${a}x ${sgn(b)} ${REL[rel]} ${c}$. Enter the number that completes $x ${REL[rel]} \square$ (a fraction is fine).`, ans: { type: 'num', answer: k, prefix: tx`$x ${REL[rel]}$`, show: tx`$${frac(c - b, a)}$` }, hint: tx`Undo the ${sgn(b).replace(' ', '')} first, then divide by ${a} (positive, so no flip).`, sol: [tx`$${a}x ${REL[rel]} ${c - b}$.`, tx`Divide by ${a}: $x ${REL[rel]} ${frac(c - b, a)}$.`] };
      } },
      { level: 3, gen(R) {
        const a = -R.int(2, 6), k = R.int(-6, 6), b = R.int(-9, 9), c = a * k + b, rel = R.pick(['<', '<=', '>', '>=']), right = FLIP[rel];
        const opts = ['<', '<=', '>', '>='], order = R.shuffle(opts.slice());
        return { q: tx`Solve $${a}x ${sgn(b)} ${REL[rel]} ${c}$.`.replace(' + 0 ', ' ').replace(' - 0 ', ' '), ans: { type: 'mc', choices: order.map((r) => tx`$x ${REL[r]} ${k}$`), answer: order.indexOf(right) }, hint: tx`You'll divide by ${a}, a negative number. What happens to the sign?`, sol: [tx`${b ? `${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)}: ` : ''}$${a}x ${REL[rel]} ${c - b}$.`, tx`Divide by ${a} and **flip** the sign: $x ${REL[right]} ${k}$.`] };
      } },
      { level: 4, gen(R) {
        const f = R.int(10, 30), r = R.pick([2, 3, 4, 5, 6, 7]), B = f + R.int(10, 80), n = Math.floor((B - f) / r);
        return { q: tx`A phone plan costs \$${f} a month plus \$${r} per gigabyte. Your budget is \$${B} a month. What is the largest whole number of gigabytes you can use?`, ans: { type: 'num', answer: n, unit: 'GB' }, hint: tx`Write $${f} + ${r}g \le ${B}$ and solve, then round down.`, sol: [tx`$${f} + ${r}g \le ${B}$, so $${r}g \le ${B - f}$.`, tx`$g \le ${fmt((B - f) / r, 3)}$.`, tx`The largest whole number is ${n} GB.`] };
      } },
    ],
  };

  const simultaneous = {
    id: 'simultaneous', title: 'Simultaneous equations', minutes: 25,
    summary: 'Two unknowns, two equations: finding the pair of numbers that makes both true.',
    idea: tx`One equation with two unknowns, like $x + y = 10$, has endless answers ($1 + 9$, $4 + 6$, ...). Add a second equation, like $x - y = 2$, and usually only one pair works for both: $x = 6$, $y = 4$.

On a graph, each equation is a line, and the answer is the point where the lines **cross**. To find it without a graph, combine the equations to get rid of one letter (**elimination**), or replace one letter using the other equation (**substitution**).`,
    everyday: tx`Two coffees and a muffin cost \$10. One coffee and a muffin cost \$6.50. The difference between the two orders is exactly one coffee, so a coffee costs $10 - 6.50 = 3.50$ dollars, and the muffin is $6.50 - 3.50 = 3$ dollars. That subtraction is elimination.`,
    visual: { widget: 'plot', opts: {
      view: { xmin: -2, xmax: 10, ymin: -4, ymax: 8, equal: true, xstep: 1, label: 'Two lines crossing' },
      params: [{ id: 's', label: 'Line 1: $x + y =$', min: 0, max: 14, step: 1, value: 10, fmt: String }, { id: 'd', label: 'Line 2: $x - y =$', min: -6, max: 8, step: 1, value: 2, fmt: String }],
      curves: [{ f: (x, p) => p.s - x, color: 1 }, { f: (x, p) => x - p.d, color: 2 }],
      over: (pl, p) => { pl.point((p.s + p.d) / 2, (p.s - p.d) / 2, { color: 3, r: 7 }); },
      readout: (p) => `Blue: $x + y = ${p.s}$. Orange: $x - y = ${p.d}$. Adding the equations cancels $y$: $2x = ${p.s + p.d}$, so $x = ${AM.fmt((p.s + p.d) / 2, 2)}$ and $y = ${AM.fmt((p.s - p.d) / 2, 2)}$. That's the green crossing point: the only point on both lines.`,
      legend: [[1, 'equation 1'], [2, 'equation 2'], [3, 'solution']],
    }, caption: tx`Move either line. The answer to the pair of equations is always where they cross.` },
    math: tx`**Elimination.** Multiply one or both equations so a letter has matching (or opposite) numbers in front, then subtract (or add) to remove it.
$$\begin{aligned} 2x + y &= 11 \\ x - y &= 1 \end{aligned} \quad\xrightarrow{\text{add}}\quad 3x = 12.$$

**Substitution.** If one equation already says $y = \ldots$, put that expression in place of $y$ in the other equation.

**Always check** both values in **both** original equations.

**Special cases:** parallel lines never cross (no solution); the same line twice gives infinitely many.`,
    example: {
      problem: tx`Solve $3x + 2y = 16$ and $x + 2y = 8$.`,
      steps: [
        tx`Both have $2y$. Subtract the second from the first: $(3x - x) + (2y - 2y) = 16 - 8$, so $2x = 8$.`,
        tx`So $x = 4$.`,
        tx`Put $x = 4$ into $x + 2y = 8$: $4 + 2y = 8$, so $y = 2$.`,
        tx`Check in the first: $3(4) + 2(2) = 16$ ✓.`,
      ],
    },
    pitfalls: [
      tx`When subtracting equations, subtract **every** term, including the right-hand sides.`,
      tx`After finding $x$, you still need $y$. Substitute back into either equation.`,
      tx`Check in the equation you didn't use to find the second value; that catches most slips.`,
    ],
    usedIn: tx`This is the starting point of linear algebra (Module 05), where you solve many equations in many unknowns at once using matrices.`,
    practice: [
      { level: 1, gen(R) {
        const x = R.int(-4, 10), y = R.int(-4, 10);
        return { q: tx`Solve $x + y = ${x + y}$ and $x - y = ${x - y}$. Enter $x, y$.`, ans: { type: 'vec', answer: [x, y], placeholder: 'x, y' }, hint: tx`Add the two equations: the $y$'s cancel.`, sol: [tx`Add: $2x = ${2 * x}$, so $x = ${x}$.`, tx`Then $y = ${x + y} - ${par(x)} = ${y}$.`] };
      } },
      { level: 2, gen(R) {
        let a1, b1, a2, b2; do { a1 = R.int(1, 5); b1 = R.nz(-4, 5); a2 = R.int(1, 5); b2 = R.nz(-4, 5); } while (a1 * b2 - a2 * b1 === 0 || (a1 === a2 && b1 === b2));
        const x = R.int(-5, 6), y = R.int(-5, 6), c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
        return { q: tx`Solve $${co(a1, 'x')} ${tm(b1, 'y')} = ${c1}$ and $${co(a2, 'x')} ${tm(b2, 'y')} = ${c2}$. Enter $x, y$.`, ans: { type: 'vec', answer: [x, y], placeholder: 'x, y' }, hint: tx`Multiply the first equation by ${a2} and the second by ${a1}, then subtract to remove $x$.`, sol: [tx`$${a2}\times$(first) $- ${a1}\times$(second): $(${a2 * b1} - ${par(a1 * b2)})y = ${a2 * c1} - ${par(a1 * c2)}$, so $${a2 * b1 - a1 * b2}y = ${a2 * c1 - a1 * c2}$.`, tx`$y = ${y}$. Substitute: $${co(a1, 'x')} = ${c1} - ${par(b1 * y)}$, so $x = ${x}$.`] };
      } },
      { level: 3, gen(R) {
        let m, a, b; do { m = R.nz(-3, 3); a = R.nz(-4, 5); b = R.nz(-4, 5); } while (a + b * m === 0);
        const x = R.int(-4, 5), k = R.int(-6, 6), y = m * x + k, c = a * x + b * y;
        return { q: tx`Solve $y = ${poly([m, k])}$ and $${co(a, 'x')} ${tm(b, 'y')} = ${c}$. Enter $x, y$.`, ans: { type: 'vec', answer: [x, y], placeholder: 'x, y' }, hint: tx`Substitute: replace $y$ in the second equation with $${poly([m, k])}$.`, sol: [tx`$${co(a, 'x')} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}(${poly([m, k])}) = ${c}$.`, tx`$${a + b * m}x ${sgn(b * k)} = ${c}$, so $x = ${x}$.`, tx`$y = ${m}(${x}) ${sgn(k)} = ${y}$.`] };
      } },
      { level: 4, gen(R) {
        const pc = R.int(4, 9), pa = pc + R.int(2, 8), A = R.int(10, 80), C = R.int(10, 80), n = A + C, T = A * pa + C * pc;
        return { q: tx`A cinema sells adult tickets at \$${pa} and child tickets at \$${pc}. One evening it sells ${n} tickets for \$${T}. How many of each? Enter adults, children.`, ans: { type: 'vec', answer: [A, C], placeholder: 'adults, children' }, hint: tx`Let $a$ = adults and $c$ = children: $a + c = ${n}$ and $${pa}a + ${pc}c = ${T}$.`, sol: [tx`$a + c = ${n}$ and $${pa}a + ${pc}c = ${T}$.`, tx`Multiply the first by ${pc}: $${pc}a + ${pc}c = ${pc * n}$. Subtract from the second: $${pa - pc}a = ${T - pc * n}$.`, tx`$a = ${A}$, so $c = ${n} - ${A} = ${C}$.`] };
      } },
    ],
  };

  /* ======================= B3 Powers, Lines and Quadratics ======================= */
  const factoring = {
    id: 'factoring', title: 'Factoring', minutes: 25,
    summary: 'Writing an expression as a product, and using that to solve quadratic equations.',
    idea: tx`**Factoring** is expanding brackets backwards: turning $x^2 + 5x + 6$ back into $(x + 2)(x + 3)$.

Why bother? Because of one powerful fact: **if two numbers multiply to zero, at least one of them is zero.** So to solve $x^2 + 5x + 6 = 0$, factor it to $(x + 2)(x + 3) = 0$, and the answers are $x = -2$ or $x = -3$.

For $x^2 + bx + c$, look for two numbers that **multiply to $c$** and **add to $b$**.`,
    everyday: tx`Factoring numbers is familiar: $12 = 3 \times 4$, which is how you know 12 cookies split evenly into 3 bags of 4. Factoring expressions is the same idea with letters. It's also how you find where a thrown ball lands: the height formula factors into pieces, and the ball is on the ground when one piece is zero.`,
    visual: { widget: 'plot', opts: {
      view: { xmin: -7, xmax: 7, ymin: -12, ymax: 12, xstep: 1, ystep: 2, label: 'Graph of (x − p)(x − q)' },
      params: [{ id: 'p', label: 'First root $p$', min: -6, max: 6, step: 1, value: -2, fmt: String }, { id: 'q', label: 'Second root $q$', min: -6, max: 6, step: 1, value: 3, fmt: String }],
      curves: [{ f: (x, p) => (x - p.p) * (x - p.q), color: 1 }],
      over: (pl, p) => { pl.point(p.p, 0, { color: 2, r: 7 }); pl.point(p.q, 0, { color: 2, r: 7 }); },
      readout: (p) => `$y = (x ${AM.sgn(-p.p)})(x ${AM.sgn(-p.q)}) = ${AM.poly([1, -(p.p + p.q), p.p * p.q])}$. The curve hits zero at $x = ${p.p}$ and $x = ${p.q}$ (orange), because one bracket is zero there. The two roots add to $${p.p + p.q}$ and multiply to $${p.p * p.q}$: compare those with the numbers in the expanded form.`,
    }, caption: tx`Move the roots and watch the expanded form change. The middle number is minus the sum of the roots; the last number is their product.` },
    math: tx`**Common factor first.** $6x + 9 = 3(2x + 3)$. Take out the largest number (and letter) that divides every term.

**Factoring $x^2 + bx + c$.** Find $p$ and $q$ with $p + q = b$ and $pq = c$. Then
$$x^2 + bx + c = (x + p)(x + q).$$

**Difference of two squares.** $x^2 - a^2 = (x - a)(x + a)$.

**Solving by factoring.** Get zero on one side, factor, and set each bracket to zero:
$$(x + p)(x + q) = 0 \;\Rightarrow\; x = -p \text{ or } x = -q.$$`,
    example: {
      problem: tx`Solve $x^2 - x - 12 = 0$.`,
      steps: [
        tx`We need two numbers that multiply to $-12$ and add to $-1$.`,
        tx`Try pairs: $3 \times (-4) = -12$ and $3 + (-4) = -1$. ✓`,
        tx`So $x^2 - x - 12 = (x + 3)(x - 4) = 0$.`,
        tx`Either $x + 3 = 0$, so $x = -3$, or $x - 4 = 0$, so $x = 4$.`,
      ],
    },
    pitfalls: [
      tx`Signs: in $(x + 3)(x - 4) = 0$ the answers are $x = -3$ and $x = 4$, the **opposite** signs of the numbers in the brackets.`,
      tx`You need zero on one side first. $x^2 + 5x = 6$ must become $x^2 + 5x - 6 = 0$ before factoring.`,
      tx`Check by expanding your brackets back out; it takes ten seconds.`,
    ],
    usedIn: tx`Finding where graphs cross the axis (Module 01), simplifying limits (Module 03), partial fractions in integration (Module 04) and characteristic equations in differential equations (Module 07).`,
    practice: [
      { level: 1, gen(R) {
        let a, b; do { a = R.int(1, 9); b = R.nz(-9, 9); } while (gcd(a, Math.abs(b)) !== 1);
        const k = R.int(2, 9);
        return { q: tx`Factor $${k * a}x ${sgn(k * b)}$ as $k(\ldots)$. What is $k$, the largest number that divides both terms?`, ans: { type: 'num', answer: k }, hint: tx`What is the biggest number that goes into both ${k * a} and ${Math.abs(k * b)}?`, sol: [tx`Both divide by ${k}: $${k * a}x ${sgn(k * b)} = ${k}(${co(a, 'x')} ${sgn(b)})$.`] };
      } },
      { level: 2, gen(R) {
        const p = R.nz(-9, 9), q = R.nz(-9, 9);
        return { q: tx`Factor $${poly([1, p + q, p * q])}$ as $(x + p)(x + q)$. Enter $p, q$.`, ans: { type: 'vec', answer: [p, q], unordered: true, placeholder: 'p, q' }, hint: tx`Find two numbers that multiply to $${p * q}$ and add to $${p + q}$.`, sol: [tx`$${p} \times ${par(q)} = ${p * q}$ and $${p} + ${par(q)} = ${p + q}$.`, tx`So $${poly([1, p + q, p * q])} = (x ${sgn(p)})(x ${sgn(q)})$.`] };
      } },
      { level: 3, gen(R) {
        if (R.chance(0.25)) { const a = R.int(2, 9); return { q: tx`Solve $x^2 - ${a * a} = 0$. Enter both solutions.`, ans: { type: 'vec', answer: [a, -a], unordered: true, placeholder: 'x1, x2' }, hint: tx`Difference of two squares: $x^2 - ${a}^2 = (x - ${a})(x + ${a})$.`, sol: [tx`$(x - ${a})(x + ${a}) = 0$.`, tx`$x = ${a}$ or $x = -${a}$.`] }; }
        let p, q; do { p = R.nz(-8, 8); q = R.nz(-8, 8); } while (p === q);
        return { q: tx`Solve $${poly([1, p + q, p * q])} = 0$ by factoring. Enter both solutions.`, ans: { type: 'vec', answer: [-p, -q], unordered: true, placeholder: 'x1, x2' }, hint: tx`Two numbers that multiply to $${p * q}$ and add to $${p + q}$.`, sol: [tx`$(x ${sgn(p)})(x ${sgn(q)}) = 0$.`, tx`So $x = ${-p}$ or $x = ${-q}$.`] };
      } },
      { level: 4, gen(R) {
        const w = R.int(3, 15), k = R.int(1, 8), A = w * (w + k);
        return { q: tx`A rectangle is ${k} cm longer than it is wide, and its area is ${A} cm². How wide is it?`, ans: { type: 'num', answer: w, unit: 'cm' }, hint: tx`If the width is $w$, then $w(w + ${k}) = ${A}$, so $w^2 + ${k}w - ${A} = 0$. Factor it.`, sol: [tx`$w^2 + ${k}w - ${A} = 0$.`, tx`Two numbers that multiply to $-${A}$ and add to ${k}: ${w + k} and $-${w}$. So $(w + ${w + k})(w - ${w}) = 0$.`, tx`$w = ${w}$ or $w = -${w + k}$. A width can't be negative, so $w = ${w}$ cm.`] };
      } },
    ],
  };

  const quadratics = {
    id: 'quadratics', title: 'The quadratic formula', minutes: 25,
    summary: 'A formula that solves every quadratic equation, and a quick test for how many answers there are.',
    idea: tx`Plenty of quadratics don't factor into nice whole numbers, like $x^2 + 3x - 1 = 0$. The **quadratic formula** always works:
$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}.$$
The $\pm$ means "do it once with $+$ and once with $-$", which gives the two answers.

The part under the square root, $b^2 - 4ac$, is the **discriminant**. If it's positive there are two answers; zero, one answer; negative, none (you can't take the square root of a negative number). On the graph: the curve crosses the axis twice, touches it once, or misses it.`,
    everyday: tx`A ball is thrown up from 1 m off the ground at 20 m/s. Its height after $t$ seconds is about $h = -5t^2 + 20t + 1$. It lands when $h = 0$, and the formula gives $t \approx 4.05$ seconds. (The other answer is negative: a time before it was thrown, so we ignore it.)`,
    visual: { widget: 'plot', opts: {
      view: { xmin: -6, xmax: 6, ymin: -8, ymax: 8, xstep: 1, ystep: 2, label: 'Graph of a quadratic' },
      params: [{ id: 'a', label: '$a$', min: -2, max: 2, step: 0.25, value: 1 }, { id: 'b', label: '$b$', min: -6, max: 6, step: 0.5, value: 1 }, { id: 'c', label: '$c$', min: -6, max: 6, step: 0.5, value: -4 }],
      curves: [{ f: (x, p) => p.a * x * x + p.b * x + p.c, color: 1 }],
      over: (pl, p) => { const D = p.b * p.b - 4 * p.a * p.c; if (p.a && D >= 0) { [1, -1].forEach((s) => pl.point((-p.b + s * Math.sqrt(D)) / (2 * p.a), 0, { color: 2, r: 7 })); } },
      readout: (p) => { const D = p.b * p.b - 4 * p.a * p.c, f = (v) => AM.fmt(v, 3); if (!p.a) return `With $a = 0$ there's no $x^2$ term, so this is a straight line, not a quadratic.`; return `Discriminant $b^2 - 4ac = ${f(p.b * p.b)} - ${f(4 * p.a * p.c)} = ${f(D)}$. ${D > 1e-9 ? `Positive, so **two** solutions: $x = \\frac{${f(-p.b)} \\pm \\sqrt{${f(D)}}}{${f(2 * p.a)}}$, which is $${f((-p.b + Math.sqrt(D)) / (2 * p.a))}$ and $${f((-p.b - Math.sqrt(D)) / (2 * p.a))}$.` : Math.abs(D) <= 1e-9 ? `Zero, so **one** solution: the curve just touches the axis at $x = ${f(-p.b / (2 * p.a))}$.` : 'Negative, so **no** real solutions: the curve never reaches the axis.'}`; },
    }, caption: tx`Slide $c$ up until the curve lifts off the axis: at that moment the discriminant passes through zero.` },
    math: tx`For $ax^2 + bx + c = 0$ (with $a \ne 0$):
$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}.$$

**Discriminant** $D = b^2 - 4ac$:
- $D > 0$: two solutions.
- $D = 0$: one solution, $x = -\frac{b}{2a}$.
- $D < 0$: no real solutions.

**The turning point** (top or bottom of the curve) is at $x = -\dfrac{b}{2a}$, exactly halfway between the two solutions.`,
    example: {
      problem: tx`Solve $2x^2 - 3x - 4 = 0$ to 2 decimal places.`,
      steps: [
        tx`Read off $a = 2$, $b = -3$, $c = -4$.`,
        tx`Discriminant: $(-3)^2 - 4(2)(-4) = 9 + 32 = 41$. Positive, so two answers.`,
        tx`$x = \frac{3 \pm \sqrt{41}}{4}$, and $\sqrt{41} \approx 6.403$.`,
        tx`$x = \frac{3 + 6.403}{4} \approx 2.35$ or $x = \frac{3 - 6.403}{4} \approx -0.85$.`,
      ],
    },
    pitfalls: [
      tx`$-b$ means "the opposite of $b$". If $b = -3$ then $-b = 3$.`,
      tx`Square negative $b$ with brackets: $(-3)^2 = 9$, never $-9$.`,
      tx`The $2a$ divides the **whole** top, not just the square root.`,
    ],
    usedIn: tx`Projectile motion, optimization, eigenvalues of $2\times2$ matrices (Module 05) and characteristic equations of differential equations (Module 07), whose discriminant decides whether a spring oscillates.`,
    practice: [
      { level: 1, gen(R) {
        const a = R.nz(-4, 5), b = R.int(-9, 9), c = R.int(-9, 9), D = b * b - 4 * a * c;
        return { q: tx`Find the discriminant $b^2 - 4ac$ of $${poly([a, b, c])} = 0$.`, ans: { type: 'num', answer: D }, hint: tx`Here $a = ${a}$, $b = ${b}$, $c = ${c}$.`, sol: [tx`$b^2 = ${par(b)}^2 = ${b * b}$ and $4ac = 4(${a})(${c}) = ${4 * a * c}$.`, tx`$${b * b} - ${par(4 * a * c)} = ${D}$.`] };
      } },
      { level: 2, gen(R) {
        const kind = R.int(0, 2), a = R.pick([1, 1, 2, -1, 3]);
        let b, c;
        if (kind === 1) { const p = R.int(-5, 5); b = -2 * a * p; c = a * p * p; }
        else { do { b = R.int(-8, 8); c = R.int(-9, 9); } while ((b * b - 4 * a * c > 0 ? 2 : b * b - 4 * a * c === 0 ? 1 : 0) !== [0, 1, 2][kind]); }
        const D = b * b - 4 * a * c, n = D > 0 ? 2 : D === 0 ? 1 : 0;
        return { q: tx`How many real solutions does $${poly([a, b, c])} = 0$ have?`, ans: { type: 'mc', choices: ['None', 'Exactly one', 'Two'], answer: n }, hint: tx`Work out the discriminant $b^2 - 4ac$ and check its sign.`, sol: [tx`$D = ${par(b)}^2 - 4(${a})(${c}) = ${D}$.`, tx`${n === 2 ? 'Positive, so two solutions.' : n === 1 ? 'Zero, so exactly one solution.' : 'Negative, so no real solutions.'}`] };
      } },
      { level: 3, gen(R) {
        let a, b, c, D; do { a = R.pick([1, 2, 3, -1, -2]); b = R.int(-7, 7); c = R.int(-8, 8); D = b * b - 4 * a * c; } while (D <= 0 || Number.isInteger(Math.sqrt(D)));
        const x1 = (-b + Math.sqrt(D)) / (2 * a), x2 = (-b - Math.sqrt(D)) / (2 * a);
        return { q: tx`Solve $${poly([a, b, c])} = 0$ using the quadratic formula. Give both answers to 2 decimal places.`, ans: { type: 'vec', answer: [x1, x2], unordered: true, tol: 0.006, placeholder: 'x1, x2' }, hint: tx`$a = ${a}$, $b = ${b}$, $c = ${c}$. Start with the discriminant.`, sol: [tx`$D = ${par(b)}^2 - 4(${a})(${c}) = ${D}$.`, tx`$x = \frac{${-b} \pm \sqrt{${D}}}{${2 * a}}$, and $\sqrt{${D}} \approx ${fmt(Math.sqrt(D), 4)}$.`, tx`$x \approx ${fmt(r2(x1))}$ or $x \approx ${fmt(r2(x2))}$.`] };
      } },
      { level: 4, gen(R) {
        const v = R.int(5, 30), h0 = R.int(1, 40), t = (v + Math.sqrt(v * v + 20 * h0)) / 10;
        return { q: tx`A ball is thrown upward from ${h0} m above the ground at ${v} m/s. Its height after $t$ seconds is $h = -5t^2 + ${v}t + ${h0}$. When does it hit the ground? Give $t$ to 2 decimal places.`, ans: { type: 'num', answer: t, unit: 's' }, hint: tx`Set $h = 0$ and use the formula with $a = -5$, $b = ${v}$, $c = ${h0}$. Keep the positive answer.`, sol: [tx`$D = ${v}^2 - 4(-5)(${h0}) = ${v * v + 20 * h0}$.`, tx`$t = \frac{-${v} \pm \sqrt{${v * v + 20 * h0}}}{-10}$.`, tx`The positive answer is $t \approx ${fmt(r2(t))}$ seconds (the other is negative, before the throw).`] };
      } },
    ],
  };

  /* ======================= B4 Shapes, Data and Chance ======================= */
  const area = {
    id: 'area', title: 'Perimeter, area and volume', minutes: 25,
    summary: 'Measuring around shapes, inside them, and inside 3D objects.',
    idea: tx`Three different questions, three different kinds of answer:
- **Perimeter**: how far is it *around* the edge? A length, in m or cm.
- **Area**: how much flat space is *inside*? Counted in squares: m² or cm².
- **Volume**: how much space is inside a 3D object? Counted in cubes: m³ or cm³.

Most shapes reduce to a few formulas: rectangles, triangles (half a rectangle) and circles. Odd shapes can usually be split into those pieces, or found as a big shape minus a cut-out.`,
    everyday: tx`Fencing a garden is perimeter; turfing it is area; filling a raised bed with soil is volume. A $4 \text{ m} \times 3 \text{ m}$ room needs $2(4 + 3) = 14$ m of skirting board but $4 \times 3 = 12$ m² of carpet. A fish tank $50 \times 30 \times 40$ cm holds $60{,}000$ cm³ $= 60$ litres.`,
    visual: { widget: 'shapes', caption: tx`Count the grid squares inside the rectangle to see that area really is width × height. Switch to the triangle: it fills exactly half of the rectangle around it.` },
    math: tx`| Shape | Perimeter | Area |
|---|---|---|
| Rectangle $w \times h$ | $2(w + h)$ | $wh$ |
| Triangle | add the 3 sides | $\frac12 \times \text{base} \times \text{height}$ |
| Circle, radius $r$ | $2\pi r$ | $\pi r^2$ |

**Volume of a prism** (same shape all the way through): area of the end $\times$ length. A box: $l \times w \times h$. A cylinder: $\pi r^2 h$.

**Units:** $1 \text{ m} = 100 \text{ cm}$, but $1 \text{ m}^2 = 10{,}000 \text{ cm}^2$ and $1 \text{ m}^3 = 1{,}000{,}000 \text{ cm}^3$. One litre is $1000 \text{ cm}^3$.`,
    example: {
      problem: tx`An L-shaped room is a $6 \times 4$ m rectangle with a $2 \times 1$ m corner cut out. Find its area and perimeter.`,
      steps: [
        tx`Area: big rectangle minus the cut-out: $6 \times 4 - 2 \times 1 = 24 - 2 = 22$ m².`,
        tx`Perimeter: cutting a corner moves two edges inward but doesn't change their total length.`,
        tx`So it's the same as the full rectangle: $2(6 + 4) = 20$ m.`,
      ],
    },
    pitfalls: [
      tx`Triangle height is measured **straight up** from the base (at a right angle), not along a sloping side.`,
      tx`Use the radius, not the diameter, in $\pi r^2$. If you're given the diameter, halve it first.`,
      tx`Convert to the same units before multiplying: a $2 \text{ m} \times 50 \text{ cm}$ board is $2 \times 0.5 = 1$ m².`,
    ],
    usedIn: tx`Integration (Module 04) is the general method for finding areas under curves and volumes of curved solids; these formulas are the special cases it must agree with.`,
    practice: [
      { level: 1, gen(R) {
        const w = R.int(2, 20), h = R.int(2, 15), per = R.chance(0.5);
        return { q: tx`A rectangle is ${w} cm wide and ${h} cm tall. What is its ${per ? 'perimeter' : 'area'}?`, ans: { type: 'num', answer: per ? 2 * (w + h) : w * h, unit: per ? 'cm' : 'cm²' }, hint: per ? tx`Perimeter is all the way around: $2(w + h)$.` : tx`Area $= w \times h$.`, sol: [per ? tx`$2(${w} + ${h}) = 2 \times ${w + h} = ${2 * (w + h)}$ cm.` : tx`$${w} \times ${h} = ${w * h}$ cm².`] };
      } },
      { level: 2, gen(R) {
        const k = R.int(0, 2);
        if (k === 0) { const b = R.int(2, 20), h = R.int(2, 16); return { q: tx`A triangle has base ${b} m and height ${h} m. What is its area?`, ans: { type: 'num', answer: (b * h) / 2, unit: 'm²' }, hint: tx`Area $= \frac12 \times \text{base} \times \text{height}$.`, sol: [tx`$\frac12 \times ${b} \times ${h} = ${fmt((b * h) / 2)}$ m².`] }; }
        const r = R.int(1, 15), useD = R.chance(0.4), circ = k === 2;
        return { q: tx`A circle has ${useD ? `diameter ${2 * r}` : `radius ${r}`} cm. What is its ${circ ? 'circumference' : 'area'}? Two decimal places.`, ans: { type: 'num', answer: circ ? 2 * Math.PI * r : Math.PI * r * r, unit: circ ? 'cm' : 'cm²' }, hint: tx`${useD ? `Radius is half the diameter: ${r} cm. ` : ''}${circ ? 'Circumference $= 2\\pi r$.' : 'Area $= \\pi r^2$.'}`, sol: [tx`$r = ${r}$.`, circ ? tx`$2\pi \times ${r} \approx ${fmt(2 * Math.PI * r, 4)}$ cm.` : tx`$\pi \times ${r}^2 = ${r * r}\pi \approx ${fmt(Math.PI * r * r, 4)}$ cm².`] };
      } },
      { level: 3, gen(R) {
        if (R.chance(0.5)) { const w = R.int(2, 8) * 2, h = R.int(4, 20), A = w * h + (Math.PI * (w / 2) ** 2) / 2; return { q: tx`A window is a rectangle ${w} dm wide and ${h} dm tall, with a semicircle on top (its diameter is the top edge). What is the total area of glass? Two decimal places.`, ans: { type: 'num', answer: A, unit: 'dm²' }, hint: tx`Rectangle plus half a circle of radius $${w / 2}$.`, sol: [tx`Rectangle: $${w} \times ${h} = ${w * h}$.`, tx`Semicircle: $\frac12\pi(${w / 2})^2 \approx ${fmt((Math.PI * (w / 2) ** 2) / 2, 4)}$.`, tx`Total $\approx ${fmt(A, 4)}$ dm².`] }; }
        const W = R.int(8, 20), H = R.int(6, 16), m = R.int(1, 2), A = W * H - (W - 2 * m) * (H - 2 * m);
        return { q: tx`A picture frame is ${W} cm by ${H} cm on the outside and ${m} cm wide all round. What is the area of the frame itself (not the picture)?`, ans: { type: 'num', answer: A, unit: 'cm²' }, hint: tx`Outer rectangle minus the inner opening. The opening is ${2 * m} cm narrower and ${2 * m} cm shorter.`, sol: [tx`Outside: $${W} \times ${H} = ${W * H}$.`, tx`Opening: $${W - 2 * m} \times ${H - 2 * m} = ${(W - 2 * m) * (H - 2 * m)}$.`, tx`Frame: $${W * H} - ${(W - 2 * m) * (H - 2 * m)} = ${A}$ cm².`] };
      } },
      { level: 4, gen(R) {
        if (R.chance(0.5)) { const l = R.int(3, 12) * 10, w = R.int(2, 6) * 10, h = R.int(2, 6) * 10, L = (l * w * h) / 1000; return { q: tx`A fish tank is ${l} cm long, ${w} cm wide and ${h} cm tall. How many litres does it hold when full? (1 litre $= 1000$ cm³)`, ans: { type: 'num', answer: L, unit: 'litres' }, hint: tx`Volume $= l \times w \times h$ in cm³, then divide by 1000.`, sol: [tx`$${l} \times ${w} \times ${h} = ${l * w * h}$ cm³.`, tx`$${l * w * h} \div 1000 = ${fmt(L)}$ litres.`] }; }
        const r = R.int(1, 6) / 2, h = R.int(2, 12), V = Math.PI * r * r * h;
        return { q: tx`A cylindrical water tank has radius ${r} m and height ${h} m. What volume of water can it hold, in m³? Two decimal places.`, ans: { type: 'num', answer: V, unit: 'm³' }, hint: tx`Volume $= \pi r^2 h$: the area of the circular base times the height.`, sol: [tx`Base area: $\pi \times ${r}^2 \approx ${fmt(Math.PI * r * r, 4)}$ m².`, tx`Times height ${h}: $\approx ${fmt(V, 4)}$ m³.`] };
      } },
    ],
  };

  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
  const triangles = {
    id: 'triangles', title: 'Right triangles: Pythagoras and SOH CAH TOA', minutes: 30,
    summary: 'Finding missing sides and angles of right-angled triangles.',
    idea: tx`A right-angled triangle has one $90°$ corner. Its longest side, opposite that corner, is the **hypotenuse**.

**Pythagoras** links the three sides: the two short sides squared add up to the long side squared. If you know two sides, you can always find the third.

**Trigonometry** links sides to **angles**. For a chosen angle $\theta$, the side across from it is the **opposite**, the short side next to it is the **adjacent**. The ratios sine, cosine and tangent depend only on the angle, not on the triangle's size. Remember them as **SOH CAH TOA**: Sin = Opp/Hyp, Cos = Adj/Hyp, Tan = Opp/Adj.`,
    everyday: tx`A 5 m ladder leans against a wall with its foot 1.5 m out. How high does it reach? Pythagoras: $\sqrt{5^2 - 1.5^2} \approx 4.77$ m. What angle does it make with the ground? $\cos\theta = \frac{1.5}{5} = 0.3$, so $\theta \approx 72.5°$. Safety guides say about 75°, so that's a little too shallow.`,
    visual: { widget: 'righttri', caption: tx`Set the sides to 4 and 3 to get the famous 3-4-5 triangle. Then double both: the hypotenuse doubles, but the angle and all three ratios stay the same.` },
    math: tx`**Pythagoras:** $a^2 + b^2 = c^2$, where $c$ is the hypotenuse.
- Long side: $c = \sqrt{a^2 + b^2}$.
- Short side: $a = \sqrt{c^2 - b^2}$.

**SOH CAH TOA:**
$$\sin\theta = \frac{\text{opp}}{\text{hyp}}, \qquad \cos\theta = \frac{\text{adj}}{\text{hyp}}, \qquad \tan\theta = \frac{\text{opp}}{\text{adj}}.$$

**Finding a side:** pick the ratio that uses the side you know and the one you want, then rearrange. E.g. $\text{opp} = \text{hyp} \times \sin\theta$.

**Finding an angle:** use the inverse button: $\theta = \sin^{-1}\!\left(\frac{\text{opp}}{\text{hyp}}\right)$, and similarly $\cos^{-1}$, $\tan^{-1}$. Make sure your calculator is in **degrees**.`,
    example: {
      problem: tx`A ramp rises 1.2 m over a horizontal distance of 8 m. How long is the ramp, and how steep is it?`,
      steps: [
        tx`Length (hypotenuse): $\sqrt{8^2 + 1.2^2} = \sqrt{64 + 1.44} = \sqrt{65.44} \approx 8.09$ m.`,
        tx`For the angle we know opposite (1.2) and adjacent (8), so use **TOA**: $\tan\theta = \frac{1.2}{8} = 0.15$.`,
        tx`$\theta = \tan^{-1}(0.15) \approx 8.5°$.`,
      ],
    },
    pitfalls: [
      tx`Pythagoras only works for right-angled triangles, and $c$ must be the longest side.`,
      tx`Opposite and adjacent depend on **which angle** you're using. Label them after choosing the angle.`,
      tx`If $\sin 30°$ comes out as $-0.988$, your calculator is in radians. Switch it to degrees.`,
    ],
    usedIn: tx`The unit circle and trig functions (Module 01), vectors and their lengths (Module 05), and anything involving waves, rotation or angles later in the course.`,
    practice: [
      { level: 1, gen(R) {
        const [a, b, c] = R.pick(TRIPLES.slice(0, 4)), k = R.int(1, 3), sw = R.chance(0.5);
        const A = (sw ? b : a) * k, B = (sw ? a : b) * k;
        return { q: tx`A right-angled triangle has short sides ${A} cm and ${B} cm. How long is the hypotenuse?`, ans: { type: 'num', answer: c * k, unit: 'cm' }, hint: tx`$c = \sqrt{a^2 + b^2}$.`, sol: [tx`$${A}^2 + ${B}^2 = ${A * A} + ${B * B} = ${A * A + B * B}$.`, tx`$c = \sqrt{${A * A + B * B}} = ${c * k}$ cm.`] };
      } },
      { level: 2, gen(R) {
        const [a, b, c] = R.pick(TRIPLES), k = R.int(1, 2), sw = R.chance(0.5), known = (sw ? a : b) * k, want = (sw ? b : a) * k, H = c * k;
        return { q: tx`A right-angled triangle has hypotenuse ${H} m and one short side ${known} m. How long is the other short side?`, ans: { type: 'num', answer: want, unit: 'm' }, hint: tx`Subtract: $b = \sqrt{c^2 - a^2}$.`, sol: [tx`$${H}^2 - ${known}^2 = ${H * H} - ${known * known} = ${H * H - known * known}$.`, tx`$\sqrt{${H * H - known * known}} = ${want}$ m.`] };
      } },
      { level: 3, gen(R) {
        const th = R.int(15, 75), k = R.int(0, 2), L = R.int(4, 25);
        if (k === 0) { const v = L * Math.sin(th * DEG); return { q: tx`In a right triangle the hypotenuse is ${L} cm and one angle is ${th}°. How long is the side **opposite** that angle? Two decimals.`, ans: { type: 'num', answer: v, unit: 'cm' }, hint: tx`Opposite and hypotenuse: use SOH. $\text{opp} = \text{hyp} \times \sin\theta$.`, sol: [tx`$\text{opp} = ${L} \times \sin ${th}° \approx ${L} \times ${fmt(Math.sin(th * DEG), 4)} \approx ${fmt(v, 4)}$ cm.`] }; }
        if (k === 1) { const v = L * Math.cos(th * DEG); return { q: tx`In a right triangle the hypotenuse is ${L} cm and one angle is ${th}°. How long is the side **adjacent** to that angle? Two decimals.`, ans: { type: 'num', answer: v, unit: 'cm' }, hint: tx`Adjacent and hypotenuse: use CAH. $\text{adj} = \text{hyp} \times \cos\theta$.`, sol: [tx`$\text{adj} = ${L} \times \cos ${th}° \approx ${L} \times ${fmt(Math.cos(th * DEG), 4)} \approx ${fmt(v, 4)}$ cm.`] }; }
        const v = L * Math.tan(th * DEG);
        return { q: tx`You stand ${L} m from the base of a tree and look up at its top at an angle of ${th}°. How tall is the tree (from your eye level)? Two decimals.`, ans: { type: 'num', answer: v, unit: 'm' }, hint: tx`You know the adjacent side (${L} m) and want the opposite: use TOA.`, sol: [tx`$\tan ${th}° = \frac{\text{height}}{${L}}$.`, tx`Height $= ${L} \times \tan ${th}° \approx ${L} \times ${fmt(Math.tan(th * DEG), 4)} \approx ${fmt(v, 4)}$ m.`] };
      } },
      { level: 4, gen(R) {
        if (R.chance(0.5)) { const h = R.int(2, 30) / 10, d = R.int(4, 30), th = Math.atan(h / d) / DEG; return { q: tx`A ramp rises ${h} m over a horizontal distance of ${d} m. What angle does it make with the ground, in degrees (1 decimal place)?`, ans: { type: 'num', answer: th, tol: 0.06, unit: '°' }, hint: tx`Opposite ${h}, adjacent ${d}: $\theta = \tan^{-1}\left(\frac{${h}}{${d}}\right)$.`, sol: [tx`$\tan\theta = \frac{${h}}{${d}} = ${fmt(h / d, 4)}$.`, tx`$\theta = \tan^{-1}(${fmt(h / d, 4)}) \approx ${fmt(th, 3)}°$.`] }; }
        const L = R.int(3, 10), f = R.int(5, 25) / 10, ht = Math.sqrt(L * L - f * f), th = Math.acos(f / L) / DEG;
        return { q: tx`A ${L} m ladder leans against a wall with its foot ${f} m from the wall. What angle does the ladder make with the ground, in degrees (1 decimal place)?`, ans: { type: 'num', answer: th, tol: 0.06, unit: '°' }, hint: tx`You know the adjacent side (${f} m) and the hypotenuse (${L} m): use CAH.`, sol: [tx`$\cos\theta = \frac{${f}}{${L}} = ${fmt(f / L, 4)}$.`, tx`$\theta = \cos^{-1}(${fmt(f / L, 4)}) \approx ${fmt(th, 3)}°$. (It reaches $\sqrt{${L}^2 - ${f}^2} \approx ${fmt(ht, 3)}$ m up the wall.)`] };
      } },
    ],
  };

  const averages = {
    id: 'averages', title: 'Averages and spread', minutes: 20,
    summary: 'Summing up a list of numbers with mean, median, mode and range.',
    idea: tx`When you have a list of numbers, it helps to describe it with one "typical" value. There are three common ways:
- **Mean**: add them all up and share equally. $\frac{\text{total}}{\text{how many}}$.
- **Median**: put them in order and take the middle one.
- **Mode**: the value that appears most often.

And one measure of spread: the **range**, biggest minus smallest. The mean is pulled hard by unusual values (outliers); the median barely notices them.`,
    everyday: tx`Five friends earn \$30k, \$32k, \$35k, \$38k and \$40k. The mean and median are both about \$35k. Now one of them is replaced by someone earning \$1 million. The median is still \$35k, but the mean jumps to about \$227k, which describes nobody. That's why news reports quote **median** house prices and incomes.`,
    visual: { widget: 'dotplot', caption: tx`Drag the largest value from 15 up to 20, then back down to 9. The mean (orange) chases it; the median (green, dashed) stays put.` },
    math: tx`For values $x_1, x_2, \ldots, x_n$:
$$\text{mean } \bar{x} = \frac{x_1 + x_2 + \cdots + x_n}{n}.$$

**Median:** sort the list. If $n$ is odd, it's the middle value. If $n$ is even, it's the mean of the two middle values.

**Mode:** the most frequent value (there can be more than one, or none).

**Range:** largest $-$ smallest.

**Working backwards:** total $= n \times \bar{x}$. That's how you find a missing value when you know the mean.`,
    example: {
      problem: tx`Find the mean, median, mode and range of $4, 8, 6, 5, 3, 8, 1$.`,
      steps: [
        tx`Sorted: $1, 3, 4, 5, 6, 8, 8$ (seven values).`,
        tx`Mean: $\frac{1 + 3 + 4 + 5 + 6 + 8 + 8}{7} = \frac{35}{7} = 5$.`,
        tx`Median: the 4th of 7 values, which is 5. Mode: 8 (it appears twice).`,
        tx`Range: $8 - 1 = 7$.`,
      ],
    },
    pitfalls: [
      tx`Sort the list before finding the median.`,
      tx`With an even number of values the median is halfway between the middle two; it might not be in the list.`,
      tx`Count how many values there are carefully; dividing by the wrong $n$ is the most common slip.`,
    ],
    usedIn: tx`Statistics (Module 09) builds on the mean with variance, standard deviation and confidence intervals. Expected value in probability (Module 08) is a mean weighted by probabilities.`,
    practice: [
      { level: 1, gen(R) {
        const v = Array.from({ length: 5 }, () => R.int(1, 20)), s = v.reduce((a, b) => a + b, 0);
        return { q: tx`Find the mean of $${v.join(', ')}$.`, ans: { type: 'num', answer: s / 5 }, hint: tx`Add them up, then divide by how many there are.`, sol: [tx`Total: $${v.join(' + ')} = ${s}$.`, tx`Mean: $\frac{${s}}{5} = ${fmt(s / 5)}$.`] };
      } },
      { level: 2, gen(R) {
        const n = R.int(5, 8), v = Array.from({ length: n }, () => R.int(1, 30)), s = v.slice().sort((a, b) => a - b), m = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
        return { q: tx`Find the median of $${v.join(', ')}$.`, ans: { type: 'num', answer: m }, hint: tx`Sort the ${n} values first.${n % 2 ? '' : ' With an even count, average the middle two.'}`, sol: [tx`Sorted: $${s.join(', ')}$.`, n % 2 ? tx`The middle (value ${(n + 1) / 2} of ${n}) is ${m}.` : tx`Middle two: ${s[n / 2 - 1]} and ${s[n / 2]}, so the median is $\frac{${s[n / 2 - 1]} + ${s[n / 2]}}{2} = ${fmt(m)}$.`] };
      } },
      { level: 3, gen(R) {
        const n = R.int(4, 7), M = R.int(5, 20), v = Array.from({ length: n - 1 }, () => R.int(Math.max(1, M - 8), M + 8)), s = v.reduce((a, b) => a + b, 0), last = n * M - s;
        return { q: tx`The mean of ${n} numbers is ${M}. ${n - 1} of them are: $${v.join(', ')}$. What is the missing number?`, ans: { type: 'num', answer: last }, hint: tx`The total of all ${n} numbers must be $${n} \times ${M}$.`, sol: [tx`Total needed: $${n} \times ${M} = ${n * M}$.`, tx`Known total: $${s}$.`, tx`Missing number: $${n * M} - ${s} = ${last}$.`] };
      } },
      { level: 4, gen(R) {
        if (R.chance(0.5)) { const k = R.int(3, 6), A = R.int(60, 80), B = A + R.int(1, 4), s = (k + 1) * B - k * A; return { q: tx`After ${k} tests your average is ${A}%. What score do you need on the next test to raise your average to ${B}%?`, ans: { type: 'num', answer: s, unit: '%' }, hint: tx`Total so far: $${k} \times ${A}$. Total needed after ${k + 1} tests: $${k + 1} \times ${B}$.`, sol: [tx`Points so far: $${k} \times ${A} = ${k * A}$.`, tx`Needed: $${k + 1} \times ${B} = ${(k + 1) * B}$.`, tx`Next score: $${(k + 1) * B} - ${k * A} = ${s}$%.`] }; }
        const n1 = R.int(10, 30), n2 = R.int(10, 30), m1 = R.int(55, 85), m2 = R.int(55, 85), m = (n1 * m1 + n2 * m2) / (n1 + n2);
        return { q: tx`Class A has ${n1} students with mean score ${m1}. Class B has ${n2} students with mean score ${m2}. What is the mean score of all ${n1 + n2} students together? Two decimals.`, ans: { type: 'num', answer: m }, hint: tx`Don't just average ${m1} and ${m2}: the bigger class counts more. Find each class's total.`, sol: [tx`Totals: $${n1} \times ${m1} = ${n1 * m1}$ and $${n2} \times ${m2} = ${n2 * m2}$.`, tx`Combined mean: $\frac{${n1 * m1} + ${n2 * m2}}{${n1 + n2}} \approx ${fmt(m, 4)}$.`] };
      } },
    ],
  };

  const chance = {
    id: 'chance', title: 'Basic probability', minutes: 25,
    summary: 'Putting a number between 0 and 1 on how likely something is.',
    idea: tx`A **probability** is a number from 0 (impossible) to 1 (certain). A half, $0.5$, means "as likely as not".

When all outcomes are equally likely, count:
$$P(\text{event}) = \frac{\text{outcomes you want}}{\text{all possible outcomes}}.$$

Three quick rules handle most questions: the chance something does **not** happen is $1 - P$; for two separate (independent) events both happening, **multiply** their chances; and over many tries, you expect the event about $P \times (\text{number of tries})$ times.`,
    everyday: tx`A bag has 3 red and 2 blue sweets. The chance of picking red is $\frac35 = 0.6$. The forecast says 30% chance of rain, so 70% chance of none. Flip a coin twice: both heads has chance $\frac12 \times \frac12 = \frac14$. Roll a die 600 times and you'd expect about $\frac16 \times 600 = 100$ sixes.`,
    visual: { widget: 'dice', caption: tx`Roll 10 at a time and the bars jump around. Keep rolling hundreds of times and they settle onto the predicted lines. Then try "Total of two dice": 7 comes up far more than 2 or 12.` },
    math: tx`**Equally likely outcomes:** $P(A) = \dfrac{\text{favourable}}{\text{total}}$.

**Not:** $P(\text{not } A) = 1 - P(A)$.

**And (independent events):** $P(A \text{ and } B) = P(A) \times P(B)$.

**Without replacement:** if you don't put the first item back, the second probability uses the smaller, changed bag.

**Expected number:** in $n$ tries, expect about $n \times P(A)$ successes.

**Expected value of a game:** add up each prize times its probability, then subtract the cost to play.`,
    example: {
      problem: tx`A bag has 3 red and 2 blue sweets. You take two without putting the first back. What's the chance both are red?`,
      steps: [
        tx`First pick: $P(\text{red}) = \frac35$.`,
        tx`Now 2 red and 2 blue are left, so the second pick is red with chance $\frac24$.`,
        tx`Both: $\frac35 \times \frac24 = \frac{6}{20} = \frac{3}{10} = 0.3$.`,
      ],
    },
    pitfalls: [
      tx`Probabilities can't be bigger than 1. If you get 1.3, something's been double-counted.`,
      tx`"At least one" is usually easiest as $1 - P(\text{none})$.`,
      tx`Past results don't change a fair coin. After five heads, the next flip is still 50:50.`,
    ],
    usedIn: tx`Probability is a whole strand of the course: Module 08 (probability), Module 09 (statistics) and Module 17 (random processes) all start from these rules.`,
    practice: [
      { level: 1, gen(R) {
        const r = R.int(1, 9), b = R.int(1, 9), g = R.int(0, 6), col = R.pick(['red', 'blue', ...(g ? ['green'] : [])]), n = { red: r, blue: b, green: g }[col], T = r + b + g;
        return { q: tx`A bag holds ${r} red, ${b} blue${g ? ` and ${g} green` : ''} counters. One is picked at random. What is the probability it is ${col}? (A fraction is fine.)`, ans: { type: 'num', answer: n / T, show: tx`$${frac(n, T)}$` }, hint: tx`Number of ${col} counters divided by the total number of counters.`, sol: [tx`Total: $${r} + ${b}${g ? ` + ${g}` : ''} = ${T}$.`, tx`$P(\text{${col}}) = \frac{${n}}{${T}}${gcd(n, T) > 1 ? ` = ${frac(n, T)}` : ''}$.`] };
      } },
      { level: 2, gen(R) {
        if (R.chance(0.5)) { const s = R.int(2, 12), w = 6 - Math.abs(s - 7); return { q: tx`Two fair dice are rolled and the numbers added. What is the probability the total is ${s}?`, ans: { type: 'num', answer: w / 36, show: tx`$${frac(w, 36)}$` }, hint: tx`There are $6 \times 6 = 36$ equally likely pairs. Count the pairs that add to ${s}.`, sol: [tx`Pairs adding to ${s}: ${Array.from({ length: 6 }, (_, i) => i + 1).filter((a) => s - a >= 1 && s - a <= 6).map((a) => `(${a}, ${s - a})`).join(', ')}, so ${w} pair${w === 1 ? '' : 's'}.`, tx`$P = \frac{${w}}{36}${gcd(w, 36) > 1 ? ` = ${frac(w, 36)}` : ''}$.`] }; }
        const p = R.int(5, 95);
        return { q: tx`The chance of rain tomorrow is ${p}%. What is the probability it does **not** rain? Give a decimal.`, ans: { type: 'num', answer: 1 - p / 100 }, hint: tx`$P(\text{not}) = 1 - P$.`, sol: [tx`$1 - ${p / 100} = ${fmt(1 - p / 100)}$.`] };
      } },
      { level: 3, gen(R) {
        const r = R.int(2, 8), b = R.int(2, 8), T = r + b, back = R.chance(0.5), pr = back ? (r / T) ** 2 : (r / T) * ((r - 1) / (T - 1));
        return { q: tx`A bag has ${r} red and ${b} blue balls. You pick one, ${back ? '**put it back**' : "**don't put it back**"}, then pick another. What is the probability both are red? Three decimals or a fraction.`, ans: { type: 'num', answer: pr, abs: 0.0006, show: tx`$${back ? frac(r * r, T * T) : frac(r * (r - 1), T * (T - 1))}$` }, hint: back ? tx`The bag is the same for both picks, so multiply $\frac{${r}}{${T}} \times \frac{${r}}{${T}}$.` : tx`After taking a red, there are ${r - 1} red out of ${T - 1} left.`, sol: [tx`First red: $\frac{${r}}{${T}}$.`, back ? tx`Second red (same bag): $\frac{${r}}{${T}}$.` : tx`Second red: $\frac{${r - 1}}{${T - 1}}$.`, tx`Both: $${back ? tx`\frac{${r}}{${T}} \times \frac{${r}}{${T}} = ${frac(r * r, T * T)}` : tx`\frac{${r}}{${T}} \times \frac{${r - 1}}{${T - 1}} = ${frac(r * (r - 1), T * (T - 1))}`} \approx ${fmt(pr, 4)}$.`] };
      } },
      { level: 4, gen(R) {
        if (R.chance(0.5)) { const n = R.int(2, 20) * 30, faces = R.int(1, 3); return { q: tx`A fair die is rolled ${n} times. About how many times would you expect to roll ${faces === 1 ? 'a six' : faces === 2 ? 'a five or a six' : 'an even number'}?`, ans: { type: 'num', answer: (n * faces) / 6 }, hint: tx`Expected number $= n \times P$.`, sol: [tx`$P = \frac{${faces}}{6}$.`, tx`Expected: $${n} \times \frac{${faces}}{6} = ${(n * faces) / 6}$.`] }; }
        const c = R.int(1, 5), W = R.int(3, 20), ev = W / 6 - c;
        return { q: tx`A game costs \$${c} to play. You roll a fair die and win \$${W} if it shows a six (otherwise nothing). What is your expected profit per game, in dollars? Two decimals (negative means a loss).`, ans: { type: 'num', answer: ev, unit: 'dollars' }, hint: tx`Expected winnings $= ${W} \times \frac16$. Then subtract the cost to play.`, sol: [tx`Expected winnings: $${W} \times \frac16 \approx ${fmt(W / 6, 4)}$.`, tx`Minus the \$${c} cost: $${fmt(W / 6, 4)} - ${c} \approx ${fmt(ev, 4)}$ dollars per game${ev < 0 ? ', a loss on average' : ''}.`] };
      } },
    ],
  };

  /* ======================= register the four Basics modules ======================= */
  AM.module({
    id: 'basics', num: 'B1', stage: 'B', title: 'Numbers and Arithmetic', aka: 'Basics 1',
    blurb: 'Start here if math has always felt shaky. Order of operations, negative numbers, fractions and percentages, and ratios: the arithmetic that every formula in the course quietly depends on.',
    prereq: [],
    lessons: [order, negatives, LB.fractions, ratios],
  });
  AM.module({
    id: 'algebra0', num: 'B2', stage: 'B', title: 'Algebra Basics', aka: 'Basics 2',
    blurb: 'Letters standing in for numbers. Working with expressions and brackets, solving equations, rearranging formulas, inequalities, and pairs of equations solved together.',
    prereq: ['basics'],
    lessons: [expressions, LB.equations, rearrange, inequalities, simultaneous],
  });
  AM.module({
    id: 'algebra1', num: 'B3', stage: 'B', title: 'Powers, Lines and Quadratics', aka: 'Basics 3',
    blurb: 'Powers and roots, straight-line graphs, and quadratic equations solved by factoring and by formula. After this, Module 01 picks up with functions in general.',
    prereq: ['algebra0'],
    lessons: [LB.powers, LB.lines, factoring, quadratics],
  });
  AM.module({
    id: 'geomdata', num: 'B4', stage: 'B', title: 'Shapes, Data and Chance', aka: 'Basics 4',
    blurb: 'Perimeter, area and volume; right triangles with Pythagoras and SOH CAH TOA; averages; and first steps in probability.',
    prereq: ['basics'],
    lessons: [area, triangles, averages, chance],
  });
})();
