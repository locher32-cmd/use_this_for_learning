/* Module 02 — Logic, sets and proof (Stage 0). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx;
  const TF = (b) => (b ? '\\text{T}' : '\\text{F}');
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  /* Compound statements with step-by-step evaluation */
  const FORMS = [
    { t: 'P \\land \\lnot Q', f: (p, q) => p && !q, s: (p, q) => [`\\lnot Q = ${TF(!q)}`, `P \\land \\lnot Q = ${TF(p)} \\land ${TF(!q)} = ${TF(p && !q)}`] },
    { t: '\\lnot P \\lor Q', f: (p, q) => !p || q, s: (p, q) => [`\\lnot P = ${TF(!p)}`, `\\lnot P \\lor Q = ${TF(!p)} \\lor ${TF(q)} = ${TF(!p || q)}`] },
    { t: 'P \\Rightarrow Q', f: (p, q) => !p || q, s: (p, q) => [`P \\Rightarrow Q \\text{ is false only when } P = \\text{T},\\ Q = \\text{F}`, `\\text{Here } P = ${TF(p)},\\ Q = ${TF(q)}, \\text{ so it is } ${TF(!p || q)}`] },
    { t: '\\lnot(P \\land Q)', f: (p, q) => !(p && q), s: (p, q) => [`P \\land Q = ${TF(p && q)}`, `\\lnot(P\\land Q) = ${TF(!(p && q))}`] },
    { t: '(P \\lor Q) \\Rightarrow P', f: (p, q) => !(p || q) || p, s: (p, q) => [`P \\lor Q = ${TF(p || q)}`, `${TF(p || q)} \\Rightarrow ${TF(p)} \\text{ is } ${TF(!(p || q) || p)}`] },
    { t: 'Q \\Rightarrow \\lnot P', f: (p, q) => !q || !p, s: (p, q) => [`\\lnot P = ${TF(!p)}`, `${TF(q)} \\Rightarrow ${TF(!p)} \\text{ is } ${TF(!q || !p)}`] },
    { t: 'P \\Leftrightarrow Q', f: (p, q) => p === q, s: (p, q) => [`P \\Leftrightarrow Q \\text{ is true when } P \\text{ and } Q \\text{ match}`, `${TF(p)} \\text{ and } ${TF(q)} ${p === q ? '\\text{ match}' : '\\text{ differ}'}, \\text{ so it is } ${TF(p === q)}`] },
    { t: '\\lnot(P \\lor Q)', f: (p, q) => !(p || q), s: (p, q) => [`P \\lor Q = ${TF(p || q)}`, `\\lnot(P \\lor Q) = ${TF(!(p || q))}`] },
  ];
  const IFS = [
    ['$n$ is divisible by 6', '$n$ is even', '$n$ is not divisible by 6', '$n$ is odd'],
    ['a function is differentiable at $a$', 'it is continuous at $a$', 'a function is not differentiable at $a$', 'it is not continuous at $a$'],
    ['a square matrix is invertible', 'its determinant is nonzero', 'a square matrix is not invertible', 'its determinant is zero'],
    ['it is raining', 'the ground is wet', 'it is not raining', 'the ground is not wet'],
    ['$x > 3$', '$x^2 > 9$', '$x \\le 3$', '$x^2 \\le 9$'],
    ['a series converges', 'its terms tend to zero', 'a series diverges', 'its terms do not tend to zero'],
  ];
  const NEG = [
    { s: '\\forall x \\in \\R,\\ x^2 \\ge 0', c: '\\exists x \\in \\R,\\ x^2 < 0', d: ['\\forall x \\in \\R,\\ x^2 < 0', '\\exists x \\in \\R,\\ x^2 \\ge 0', '\\forall x \\in \\R,\\ x^2 \\le 0'] },
    { s: '\\exists x \\in \\R,\\ x^2 = 2', c: '\\forall x \\in \\R,\\ x^2 \\ne 2', d: ['\\exists x \\in \\R,\\ x^2 \\ne 2', '\\forall x \\in \\R,\\ x^2 = 2', '\\exists x \\in \\R,\\ x^2 < 2'] },
    { s: '\\forall \\varepsilon>0\\ \\exists \\delta>0\\ \\forall x:\\ |x-a|<\\delta \\Rightarrow |f(x)-f(a)|<\\varepsilon', c: '\\exists \\varepsilon>0\\ \\forall \\delta>0\\ \\exists x:\\ |x-a|<\\delta \\text{ and } |f(x)-f(a)|\\ge\\varepsilon', d: ['\\exists \\varepsilon>0\\ \\forall \\delta>0\\ \\exists x:\\ |x-a|<\\delta \\Rightarrow |f(x)-f(a)|\\ge\\varepsilon', '\\forall \\varepsilon>0\\ \\exists \\delta>0\\ \\forall x:\\ |x-a|\\ge\\delta \\text{ and } |f(x)-f(a)|\\ge\\varepsilon', '\\exists \\varepsilon>0\\ \\forall \\delta>0\\ \\forall x:\\ |x-a|\\ge\\delta \\Rightarrow |f(x)-f(a)|<\\varepsilon'] },
    { s: '\\forall n \\in \\N\\ \\exists m \\in \\N:\\ m > n', c: '\\exists n \\in \\N\\ \\forall m \\in \\N:\\ m \\le n', d: ['\\exists n \\in \\N\\ \\exists m \\in \\N:\\ m \\le n', '\\forall n \\in \\N\\ \\forall m \\in \\N:\\ m \\le n', '\\forall n \\in \\N\\ \\exists m \\in \\N:\\ m \\le n'] },
    { s: '\\exists M\\ \\forall n:\\ |a_n| \\le M', c: '\\forall M\\ \\exists n:\\ |a_n| > M', d: ['\\exists M\\ \\forall n:\\ |a_n| > M', '\\forall M\\ \\forall n:\\ |a_n| > M', '\\forall M\\ \\exists n:\\ |a_n| \\le M'] },
    { s: '\\forall \\varepsilon > 0\\ \\exists N\\ \\forall n \\ge N:\\ |a_n - L| < \\varepsilon', c: '\\exists \\varepsilon > 0\\ \\forall N\\ \\exists n \\ge N:\\ |a_n - L| \\ge \\varepsilon', d: ['\\forall \\varepsilon > 0\\ \\exists N\\ \\forall n \\ge N:\\ |a_n - L| \\ge \\varepsilon', '\\exists \\varepsilon > 0\\ \\exists N\\ \\forall n \\ge N:\\ |a_n - L| \\ge \\varepsilon', '\\exists \\varepsilon > 0\\ \\forall N\\ \\forall n \\ge N:\\ |a_n - L| < \\varepsilon'] },
  ];
  const FUNCS = [
    ['f:\\R\\to\\R,\\ f(x) = 3x - 7', 2, 'Each output $y$ comes from exactly one input, $x = (y+7)/3$, so it is one-to-one and hits everything.'],
    ['f:\\R\\to\\R,\\ f(x) = x^2', 3, '$f(-2) = f(2)$, so not injective; negative outputs are never reached, so not surjective.'],
    ['f:[0,\\infty)\\to\\R,\\ f(x) = x^2', 0, 'On $[0,\\infty)$ squaring never sends two inputs to the same output, but negative numbers in $\\R$ are never hit.'],
    ['f:\\R\\to[0,\\infty),\\ f(x) = x^2', 1, 'Every $y\\ge0$ is hit (by $\\sqrt y$), but $f(-1) = f(1)$, so it is not injective.'],
    ['f:\\R\\to\\R,\\ f(x) = e^x', 0, '$e^x$ is strictly increasing, so injective, but it is never zero or negative, so it misses part of $\\R$.'],
    ['f:\\R\\to(0,\\infty),\\ f(x) = e^x', 2, 'Strictly increasing (injective), and every positive $y$ is $e^{\\ln y}$ (surjective). Its inverse is $\\ln$.'],
    ['f:\\R\\to\\R,\\ f(x) = x^3 - x', 1, 'A cubic takes every real value, but $f(-1) = f(0) = f(1) = 0$, so it is not injective.'],
    ['f:\\Z\\to\\Z,\\ f(n) = 2n', 0, 'Different integers have different doubles, but odd integers are never hit.'],
    ['f:\\Z\\to\\Z,\\ f(n) = \\lfloor n/2 \\rfloor', 1, 'Every integer $m$ is hit by $n = 2m$, but $f(0) = f(1) = 0$.'],
    ['f:\\R\\to[-1,1],\\ f(x) = \\sin x', 1, 'Every value in $[-1,1]$ is reached, but $\\sin 0 = \\sin \\pi$.'],
    ['f:\\R\\to\\R,\\ f(x) = \\sin x', 3, '$\\sin 0 = \\sin\\pi$ (not injective), and $2$ is never reached (not surjective).'],
    ['f:\\N\\to\\N,\\ f(n) = n + 1', 0, 'Different inputs give different outputs, but the first natural number is never an output.'],
  ];

  AM.module({
    id: 'proof', stage: 0, title: 'Logic, Sets & Proof', aka: 'Discrete Mathematics / Intro to Proofs',
    blurb: 'University math is written as definitions, theorems and proofs. This module gives you the grammar: logical connectives and quantifiers, sets and functions, and the standard ways to prove things. Real analysis in Stage 3 assumes all of it.',
    prereq: ['functions'],
    lessons: [
      {
        id: 'logic', title: 'Logic and truth tables', minutes: 25,
        summary: 'And, or, not, if-then, and how to tell when two statements say the same thing.',
        idea: tx`Mathematics is written in statements that are either true or false, joined by a few connectives: **and** ($\land$), **or** ($\lor$), **not** ($\lnot$) and **if–then** ($\Rightarrow$). A truth table lists every combination of true and false inputs and shows what the whole statement does. Two statements are **equivalent** when their tables match row for row.

The connective that trips people up is $P \Rightarrow Q$. It only makes a promise about what happens when $P$ is true. When $P$ is false the promise hasn't been broken, so the statement counts as true.`,
        everyday: tx`A parent says: *if it rains, I'll drive you to school*. When did they break their word? Only if it rained and they didn't drive. If it was sunny, they kept their word whatever they did. That is exactly the truth table of $P \Rightarrow Q$.

The **contrapositive**, *if I didn't drive you, it didn't rain*, says the same thing. The **converse**, *if I drove you, it rained*, is a different claim: maybe they drove you because you were late.`,
        visual: { widget: 'truthtable', caption: tx`Start with $P \Rightarrow Q$ against its contrapositive: every row matches. Then compare it with the converse $Q \Rightarrow P$ and find the row where they disagree. Try De Morgan's law too.` },
        math: tx`**Connectives.** $P\land Q$ is true when both are true. $P\lor Q$ is true when at least one is. $\lnot P$ flips $P$. $P\Rightarrow Q$ is false only when $P$ is true and $Q$ is false.

**Equivalences you'll use constantly:**
$$P \Rightarrow Q \;\equiv\; \lnot P \lor Q \;\equiv\; \lnot Q \Rightarrow \lnot P \quad\text{(contrapositive)}$$
$$\lnot(P\land Q) \equiv \lnot P \lor \lnot Q, \qquad \lnot(P\lor Q) \equiv \lnot P \land \lnot Q \quad\text{(De Morgan)}$$

**Quantifiers.** $\forall x$ means *for all $x$*; $\exists x$ means *there exists an $x$*. Negating swaps them and negates the condition:
$$\lnot\big(\forall x,\ P(x)\big) \equiv \exists x,\ \lnot P(x).$$
To disprove a *for all* statement, one counterexample is enough.`,
        example: {
          problem: tx`Negate the statement *every continuous function on $[0,1]$ has a maximum below 10*, and decide which version is true.`,
          steps: [
            tx`Write it with quantifiers: $\forall f$ continuous on $[0,1]$, $\max f < 10$.`,
            tx`Negating flips $\forall$ to $\exists$ and negates the condition: $\exists f$ continuous on $[0,1]$ with $\max f \ge 10$.`,
            tx`In words: *some continuous function on $[0,1]$ reaches 10 or more*. The constant function $f(x) = 10$ proves the negation, so the original statement is false.`,
          ],
        },
        pitfalls: [
          tx`The negation of *all are $X$* is *at least one is not $X$*, not *none are $X$*.`,
          tx`$P \Rightarrow Q$ does not give you $Q \Rightarrow P$. Proving the converse is a separate job.`,
          tx`In mathematics *or* is inclusive: $P \lor Q$ is true when both are true.`,
        ],
        usedIn: tx`Every definition in real analysis (Module 10) is a nest of quantifiers, like *for every $\varepsilon > 0$ there exists $\delta > 0$*, and you'll negate them to prove things fail. Logic also sits behind algorithm conditions and statistical hypotheses (Module 09).`,
        practice: [
          { level: 1, gen(R) {
            const F = R.pick(FORMS), p = R.chance(0.5), q = R.chance(0.5), v = F.f(p, q);
            return {
              q: tx`If $P$ is ${p ? 'true' : 'false'} and $Q$ is ${q ? 'true' : 'false'}, is $${F.t}$ true or false?`,
              ans: { type: 'mc', choices: ['True', 'False'], answer: v ? 0 : 1 },
              hint: tx`Substitute T or F for each letter, then work from the innermost parentheses outward.`,
              sol: F.s(p, q).map((s) => `$${s}$`),
            };
          } },
          { level: 2, gen(R) {
            const [P, Q, nP, nQ] = R.pick(IFS), mode = R.pick(['equiv', 'neg', 'conv']);
            const opts = { equiv: `If ${nQ}, then ${nP}.`, conv: `If ${Q}, then ${P}.`, inv: `If ${nP}, then ${nQ}.`, neg: `${cap(P)}, and ${nQ}.` };
            const order = R.shuffle(['equiv', 'conv', 'inv', 'neg']);
            const ask = { equiv: 'logically equivalent to', neg: 'the negation of', conv: 'the converse of' }[mode];
            const why = {
              equiv: tx`The contrapositive $\lnot Q \Rightarrow \lnot P$ is always equivalent to $P \Rightarrow Q$: both fail in exactly the same situation.`,
              neg: tx`$P \Rightarrow Q$ fails only when $P$ is true and $Q$ is false, so its negation is $P \land \lnot Q$. A negated "if-then" is an "and", not another "if-then".`,
              conv: tx`The converse swaps hypothesis and conclusion: $Q \Rightarrow P$. It may or may not be true, independently of the original.`,
            }[mode];
            return {
              q: tx`Which statement is ${ask}: *If ${P}, then ${Q}.*`,
              ans: { type: 'mc', choices: order.map((k) => opts[k]), answer: order.indexOf(mode) },
              hint: tx`Name the parts: $P$ = "${P}", $Q$ = "${Q}". Contrapositive: $\lnot Q \Rightarrow \lnot P$. Converse: $Q \Rightarrow P$. Negation: $P \land \lnot Q$.`,
              sol: [tx`Let $P$ = "${P}" and $Q$ = "${Q}". The statement is $P \Rightarrow Q$.`, why],
            };
          } },
          { level: 3, gen(R) {
            const N = R.pick(NEG), choices = R.shuffle([N.c, ...N.d]);
            return {
              q: tx`Which is the negation of $$${N.s}\ ?$$`,
              ans: { type: 'mc', choices: choices.map((c) => `$${c}$`), answer: choices.indexOf(N.c) },
              hint: tx`Push the $\lnot$ from left to right: each $\forall$ becomes $\exists$, each $\exists$ becomes $\forall$, and the final condition is negated. The negation of $A \Rightarrow B$ is $A$ and not $B$.`,
              sol: [tx`Swap every quantifier: $\forall \leftrightarrow \exists$. Keep the variables and their ranges (like $\varepsilon > 0$) unchanged.`, tx`Negate the innermost condition. Strict inequalities flip to non-strict ($<$ becomes $\ge$), and an implication $A \Rightarrow B$ becomes $A \text{ and } \lnot B$.`, tx`Result: $${N.c}$.`],
            };
          } },
        ],
      },
      {
        id: 'sets', title: 'Sets and functions', minutes: 25,
        summary: 'Collections, the operations on them, and one-to-one and onto functions.',
        idea: tx`A **set** is a collection of distinct objects: $\{2, 4, 6\}$, the real numbers $\R$, the solutions of an equation. Sets are how mathematicians say *all the things that satisfy this condition*. You combine them like search filters: **union** (either), **intersection** (both), **difference** (this but not that).

Functions are rules between sets, and two properties matter a lot. A function is **one-to-one** (injective) if different inputs always give different outputs, and **onto** (surjective) if every possible output is actually reached. A function that is both has an inverse.`,
        everyday: tx`A store emails everyone who bought shoes ($A$) or socks ($B$): that's $A \cup B$. A discount for people who bought both is $A \cap B$. Recommending socks to shoe buyers who have none is $A \setminus B$.

Student ID numbers are a one-to-one function from students to numbers, since no two students share an ID. Birthdays are not: many people share one. That's why you can look a student up by ID but not by birthday.`,
        visual: { widget: 'venn', caption: tx`$A$ is the even numbers up to 20 and $B$ the multiples of 3. Step through the operations and check which numbers light up. Compare $(A\cup B)^c$ with what you'd get from $A^c \cap B^c$ (De Morgan).` },
        math: tx`**Operations.** $A\cup B = \{x : x\in A \text{ or } x\in B\}$, $\ A\cap B = \{x: x\in A \text{ and } x\in B\}$, $\ A\setminus B = \{x\in A: x\notin B\}$, $\ A^c = U\setminus A$.

**Counting (inclusion–exclusion).** $|A\cup B| = |A| + |B| - |A\cap B|$.

**De Morgan for sets.** $(A\cup B)^c = A^c\cap B^c$ and $(A\cap B)^c = A^c\cup B^c$.

**Functions.** $f: X\to Y$ is
- **injective** if $f(a) = f(b) \Rightarrow a = b$,
- **surjective** if every $y\in Y$ equals $f(x)$ for some $x \in X$,
- **bijective** if both; then $f^{-1}: Y\to X$ exists.

**Cardinality.** $|A\times B| = |A|\,|B|$, and a set with $n$ elements has $2^n$ subsets.`,
        example: {
          problem: tx`In a class of 40, 25 take calculus, 18 take statistics and 9 take both. How many take neither?`,
          steps: [
            tx`Let $C$ and $S$ be the two groups. Inclusion–exclusion: $|C\cup S| = 25 + 18 - 9 = 34$.`,
            tx`We subtract 9 because those students were counted once in $C$ and again in $S$.`,
            tx`Neither is the complement: $40 - 34 = 6$ students.`,
          ],
        },
        pitfalls: [
          tx`$|A \cup B| \ne |A| + |B|$ unless the sets don't overlap. Subtract the overlap once.`,
          tx`$\{1,2\}$ and $\{2,1,1\}$ are the same set. Order and repetition don't matter.`,
          tx`$f(x) = x^2$ is not injective on $\R$ (since $f(-2) = f(2)$) but it is on $[0,\infty)$. The domain is part of the function.`,
        ],
        usedIn: tx`Probability (Module 08) is built on sets: events are sets of outcomes and $P(A\cup B) = P(A) + P(B) - P(A\cap B)$ is inclusion–exclusion. Injective and surjective become the questions *does $Ax = b$ have at most one solution? at least one?* in linear algebra (Module 05).`,
        practice: [
          { level: 1, gen(R) {
            const [A, B, U] = R.pick([['speak French', 'speak Spanish', 'students'], ['own a cat', 'own a dog', 'households'], ['take physics', 'take chemistry', 'students'], ['use app X', 'use app Y', 'people surveyed']]);
            const N = R.int(5, 20) * 5, a = R.int(Math.floor(N / 5), Math.floor(N / 2)), b = R.int(Math.floor(N / 5), Math.floor(N / 2));
            const c = R.int(1, Math.min(a, b) - 1), uni = a + b - c, neither = R.chance(0.5);
            return {
              q: tx`Of ${N} ${U}, ${a} ${A}, ${b} ${B}, and ${c} do both. How many ${neither ? 'do neither' : 'do at least one'}?`,
              ans: { type: 'num', answer: neither ? N - uni : uni },
              hint: tx`$|A\cup B| = |A| + |B| - |A\cap B|$. ${neither ? 'Then subtract from the total.' : ''}`,
              sol: [tx`$|A\cup B| = ${a} + ${b} - ${c} = ${uni}$.`, ...(neither ? [tx`Neither: $${N} - ${uni} = ${N - uni}$.`] : [])],
            };
          } },
          { level: 2, gen(R) {
            let m, k, op, res, A, B;
            const U = Array.from({ length: 15 }, (_, i) => i + 1);
            const OPS = { cup: ['A \\cup B', (a, b) => a || b], cap: ['A \\cap B', (a, b) => a && b], minus: ['A \\setminus B', (a, b) => a && !b], sym: ['A \\,\\triangle\\, B', (a, b) => a !== b] };
            do {
              m = R.int(2, 5); k = R.int(5, 11); op = R.pick(Object.keys(OPS));
              A = U.filter((x) => x % m === 0); B = U.filter((x) => x > k);
              res = U.filter((x) => OPS[op][1](A.includes(x), B.includes(x)));
            } while (res.length < 2 || res.length > 9);
            return {
              q: tx`Let $U = \{1, 2, \dots, 15\}$, $A = \{x \in U : x \text{ is a multiple of } ${m}\}$ and $B = \{x\in U: x > ${k}\}$. List the elements of $${OPS[op][0]}$, separated by commas.`,
              ans: { type: 'vec', answer: res, unordered: true, placeholder: 'e.g. 3, 6, 9', show: tx`$\{${res.join(', ')}\}$` },
              hint: tx`Write out $A$ and $B$ in full first. ${{ cup: 'Union: in either.', cap: 'Intersection: in both.', minus: 'Difference: in $A$ but not in $B$.', sym: 'Symmetric difference: in exactly one of them.' }[op]}`,
              sol: [tx`$A = \{${A.join(', ')}\}$ and $B = \{${B.join(', ')}\}$.`, tx`$${OPS[op][0]} = \{${res.join(', ')}\}$.`],
            };
          } },
          { level: 3, gen(R) {
            const [f, k, why] = R.pick(FUNCS);
            const choices = ['Injective only', 'Surjective only', 'Bijective (both)', 'Neither'];
            return {
              q: tx`Classify the function $$${f}.$$`,
              ans: { type: 'mc', choices, answer: k },
              hint: tx`Injective: could two different inputs give the same output? Surjective: is every number in the *stated codomain* (after the arrow) reached?`,
              sol: [why, tx`So the answer is **${choices[k]}**.`],
            };
          } },
        ],
      },
      {
        id: 'induction', title: 'Proof techniques and induction', minutes: 30,
        summary: 'Direct proof, contradiction, and climbing an infinite ladder.',
        idea: tx`A proof is an argument with no gaps. Three patterns cover most of what you'll write:

- **Direct:** assume the hypothesis and push forward with definitions until you reach the conclusion.
- **Contradiction:** assume the conclusion is false and show that this leads to something impossible.
- **Induction:** for claims about every whole number $n$. Prove it for the first case (the **base case**), then prove that *if* it holds for $n$ it holds for $n+1$ (the **inductive step**).

Induction works like dominoes. Knock over the first one, make sure each one knocks over the next, and they all fall.`,
        everyday: tx`Climbing a ladder: if you can get onto the first rung, and from any rung you can reach the next, you can reach every rung. You never have to check rung 1,000,000 separately.

In a line of dominoes, the inductive step is the spacing (each domino is close enough to topple the next) and the base case is the first push. Without the push nothing falls; with one bad gap the chain stops.`,
        visual: { widget: 'induction', caption: tx`The blue staircase is $1 + 2 + \cdots + n$. Two copies make an $n \times (n+1)$ rectangle, which is where $\frac{n(n+1)}{2}$ comes from. Press the inductive step button and watch exactly $n+1$ new blocks appear.` },
        math: tx`**Principle of induction.** Let $P(n)$ be a statement for each integer $n \ge n_0$. If
1. $P(n_0)$ is true, and
2. for every $k\ge n_0$, $P(k) \Rightarrow P(k+1)$,

then $P(n)$ is true for all $n\ge n_0$.

**Classic results**, each provable by induction:
$$\sum_{i=1}^n i = \frac{n(n+1)}{2}, \qquad \sum_{i=1}^n i^2 = \frac{n(n+1)(2n+1)}{6}, \qquad \sum_{i=0}^{n-1} r^i = \frac{r^n - 1}{r - 1}\ (r\ne1).$$

**Contradiction, the classic.** $\sqrt2$ is irrational. If $\sqrt2 = p/q$ in lowest terms, then $p^2 = 2q^2$, so $p$ is even; writing $p = 2m$ gives $q^2 = 2m^2$, so $q$ is even too. That contradicts *lowest terms*.`,
        example: {
          problem: tx`Prove that $1 + 3 + 5 + \cdots + (2n-1) = n^2$ for all $n \ge 1$.`,
          steps: [
            tx`**Base case** $n = 1$: the left side is $1$ and the right side is $1^2 = 1$. True.`,
            tx`**Inductive hypothesis:** assume $1 + 3 + \cdots + (2k-1) = k^2$ for some $k \ge 1$.`,
            tx`**Inductive step:** add the next odd number, $2(k+1) - 1 = 2k+1$, to both sides: $1 + 3 + \cdots + (2k-1) + (2k+1) = k^2 + 2k + 1$.`,
            tx`$k^2 + 2k + 1 = (k+1)^2$, which is exactly the claim for $n = k+1$. By induction it holds for every $n \ge 1$.`,
          ],
        },
        pitfalls: [
          tx`Checking the first few cases is evidence, not proof. $n^2 + n + 41$ is prime for $n = 0, 1, \dots, 39$ and fails at $n = 40$.`,
          tx`The inductive step must *use* the hypothesis for $k$. If you never use it, you probably haven't proved anything.`,
          tx`Don't skip the base case. The step $P(k)\Rightarrow P(k+1)$ alone can hold for false statements such as $n = n + 1$.`,
        ],
        usedIn: tx`Induction proves error bounds for iterative algorithms (Module 11), properties of recursive sequences (Module 10), and formulas for matrix powers in Markov chains (Module 15). Contradiction is the standard way to show that something is impossible, such as a solution not existing.`,
        practice: [
          { level: 1, gen(R) {
            const n = R.int(10, 200), v = (n * (n + 1)) / 2;
            return {
              q: tx`Compute $1 + 2 + 3 + \cdots + ${n}$.`,
              ans: { type: 'num', answer: v },
              hint: tx`Use $\sum_{i=1}^n i = \dfrac{n(n+1)}{2}$.`,
              sol: [tx`$\dfrac{${n}\cdot ${n + 1}}{2} = \dfrac{${n * (n + 1)}}{2} = ${v}$.`],
            };
          } },
          { level: 2, gen(R) {
            const kind = R.pick(['range', 'squares', 'geom']);
            if (kind === 'range') {
              const a = R.int(5, 40), b = a + R.int(10, 80), v = (b * (b + 1)) / 2 - ((a - 1) * a) / 2;
              return {
                q: tx`Compute $\displaystyle\sum_{i=${a}}^{${b}} i = ${a} + ${a + 1} + \cdots + ${b}$.`,
                ans: { type: 'num', answer: v },
                hint: tx`Sum from 1 to ${b}, then subtract the sum from 1 to ${a - 1}.`,
                sol: [tx`$\sum_{i=1}^{${b}} i = \frac{${b}\cdot${b + 1}}{2} = ${(b * (b + 1)) / 2}$.`, tx`$\sum_{i=1}^{${a - 1}} i = \frac{${a - 1}\cdot${a}}{2} = ${((a - 1) * a) / 2}$.`, tx`Difference: $${(b * (b + 1)) / 2} - ${((a - 1) * a) / 2} = ${v}$.`],
              };
            }
            if (kind === 'squares') {
              const n = R.int(6, 30), v = (n * (n + 1) * (2 * n + 1)) / 6;
              return {
                q: tx`Compute $1^2 + 2^2 + \cdots + ${n}^2$.`,
                ans: { type: 'num', answer: v },
                hint: tx`Use $\sum_{i=1}^n i^2 = \dfrac{n(n+1)(2n+1)}{6}$.`,
                sol: [tx`$\dfrac{${n}\cdot${n + 1}\cdot${2 * n + 1}}{6} = ${v}$.`],
              };
            }
            const r = R.pick([2, 3, -2]), n = R.int(5, r === 3 ? 9 : 12), v = (r ** n - 1) / (r - 1);
            return {
              q: tx`Compute $\displaystyle\sum_{i=0}^{${n - 1}} (${r})^i = 1 + (${r}) + (${r})^2 + \cdots + (${r})^{${n - 1}}$.`,
              ans: { type: 'num', answer: v },
              hint: tx`Geometric sum: $\sum_{i=0}^{n-1} r^i = \dfrac{r^n - 1}{r - 1}$. Count the terms carefully: there are ${n}.`,
              sol: [tx`There are ${n} terms with ratio $r = ${r}$.`, tx`$\dfrac{(${r})^{${n}} - 1}{${r} - 1} = \dfrac{${r ** n - 1}}{${r - 1}} = ${v}$.`],
            };
          } },
          { level: 3, gen(R) {
            const kind = R.pick(['arith', 'geom', 'sq', 'cube', 'aff', 'mersenne']);
            let a1, rec, step, expr, guess;
            if (kind === 'arith') { const c = R.int(-5, 8), d = R.nz(-4, 6); a1 = c; rec = tx`a_{n+1} = a_n ${AM.sgn(d)}`; step = (a) => a + d; expr = `${c}+(n-1)*(${d})`; guess = tx`Each step adds ${d}, so $a_n = ${c} + (n-1)(${d})$.`; }
            else if (kind === 'geom') { const c = R.nz(-3, 5), r = R.pick([2, 3, -2]); a1 = c; rec = tx`a_{n+1} = ${r}\,a_n`; step = (a) => r * a; expr = `${c}*(${r})^(n-1)`; guess = tx`Each step multiplies by ${r}, so $a_n = ${c}\cdot(${r})^{n-1}$.`; }
            else if (kind === 'sq') { a1 = 1; rec = tx`a_{n+1} = a_n + 2n + 1`; step = (a, n) => a + 2 * n + 1; expr = 'n^2'; guess = tx`The terms $1, 4, 9, 16, \dots$ are perfect squares: $a_n = n^2$.`; }
            else if (kind === 'cube') { a1 = 1; rec = tx`a_{n+1} = a_n + 3n^2 + 3n + 1`; step = (a, n) => a + 3 * n * n + 3 * n + 1; expr = 'n^3'; guess = tx`The terms $1, 8, 27, 64, \dots$ are cubes: $a_n = n^3$.`; }
            else if (kind === 'mersenne') { a1 = 1; rec = tx`a_{n+1} = 2a_n + 1`; step = (a) => 2 * a + 1; expr = '2^n - 1'; guess = tx`The terms $1, 3, 7, 15, \dots$ are one less than powers of 2: $a_n = 2^n - 1$.`; }
            else { const c = R.int(2, 6); a1 = c; rec = tx`a_{n+1} = 3a_n - 2`; step = (a) => 3 * a - 2; expr = `(${c}-1)*3^(n-1)+1`; guess = tx`Subtract 1 from each term: $a_n - 1$ triples each step, starting at ${c - 1}. So $a_n = ${c - 1}\cdot 3^{n-1} + 1$.`; }
            const terms = [a1]; for (let n = 1; n < 5; n++) terms.push(step(terms[n - 1], n));
            const F = AM.compile(expr, ['n']);
            return {
              q: tx`A sequence has $a_1 = ${a1}$ and $${rec}$ for $n \ge 1$. Find a formula for $a_n$ in terms of $n$.`,
              ans: { type: 'fn', expr, vars: ['n'], domain: [1, 8], ints: true, placeholder: 'e.g. 3*2^(n-1) or n^2 + 1' },
              hint: tx`Compute $a_1$ to $a_5$, guess the pattern, then check it satisfies the recurrence. That check is the inductive step.`,
              sol: [tx`First terms: $${terms.join(',\\ ')}, \dots$`, guess, tx`To prove it, check the base case $n = 1$, then substitute the formula for $a_n$ into $${rec}$ and simplify to the formula for $a_{n+1}$.`],
              verify() { let a = a1; for (let n = 1; n <= 8; n++) { if (Math.abs(F({ n }) - a) > 1e-9) return `formula wrong at n=${n}`; a = step(a, n); } return true; },
            };
          } },
        ],
      },
    ],
  });
})();
