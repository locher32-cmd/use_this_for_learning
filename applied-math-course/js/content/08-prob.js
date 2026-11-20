/* Module 08 — Probability (Stage 2). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, C = AM.checks, M = AM.m;
  const pct = (v) => `${+(v * 100).toFixed(1)}\\%`;

  AM.module({
    id: 'prob', stage: 2, title: 'Probability', aka: 'Probability Theory',
    blurb: 'Probability is the mathematics of uncertainty. This module builds it up from counting, through conditional probability and Bayes\' theorem, to the standard distributions and the Central Limit Theorem, which explains why bell curves appear everywhere.',
    prereq: ['proof', 'calc2'],
    lessons: [
      {
        id: 'rules', title: 'Probability and counting', minutes: 30,
        summary: 'Outcomes, events, counting, and why long-run frequencies settle down.',
        idea: tx`Probability puts a number between 0 and 1 on how likely something is. When all outcomes are equally likely, it's counting: favourable outcomes divided by possible outcomes. So the core skill is counting well, using **permutations** when order matters and **combinations** when it doesn't.

What makes probability useful is the **law of large numbers**: repeat an experiment many times and the fraction of times an event happens settles toward its probability. That's why casinos always win in the long run, and why simulating something thousands of times can estimate probabilities too messy to calculate.`,
        everyday: tx`A pizza place offers 8 toppings and you pick 3. Order doesn't matter (pepperoni–mushroom–olive is the same pizza as olive–mushroom–pepperoni), so there are $\binom{8}{3} = 56$ possible pizzas. If the chef picks 3 at random, your favourite combination has a 1 in 56 chance.

Flip a coin 10 times and you might easily get 7 heads. Flip it 10,000 times and you'll be very close to 50% heads. Individual results are unpredictable; long-run averages are not.`,
        visual: { widget: 'lln', caption: tx`Run trials in batches. Early on the proportion swings wildly; after a few thousand it hugs the true probability. The green band shows how fast that happens: its width shrinks like $1/\sqrt n$, so 100 times more trials gives only 10 times more accuracy.` },
        math: tx`**Axioms.** $0 \le P(A) \le 1$, $P(\text{all outcomes}) = 1$, and for events that can't happen together $P(A\cup B) = P(A) + P(B)$.

**Rules.** $P(A^c) = 1 - P(A)$ and $P(A\cup B) = P(A) + P(B) - P(A\cap B)$. Independent events satisfy $P(A\cap B) = P(A)P(B)$.

**Counting.**
- Ordered arrangements of $k$ items from $n$: $\ {}_nP_k = \dfrac{n!}{(n-k)!}$.
- Unordered selections: $\ \dbinom nk = \dfrac{n!}{k!\,(n-k)!}$.
- Multiplication principle: $m$ choices followed by $n$ choices give $mn$ outcomes.

**Law of large numbers.** If $\hat p_n$ is the fraction of $n$ independent trials in which $A$ happens, then $\hat p_n \to P(A)$ as $n\to\infty$, with typical error about $\sqrt{p(1-p)/n}$.`,
        example: {
          problem: tx`What is the probability of at least one six in four rolls of a die?`,
          steps: [
            tx`"At least one" is easiest through the complement: $P(\text{at least one six}) = 1 - P(\text{no sixes})$.`,
            tx`Each roll avoids a six with probability $\frac56$, and the rolls are independent.`,
            tx`$P(\text{no sixes}) = \left(\frac56\right)^4 = \frac{625}{1296} \approx 0.482$.`,
            tx`$P(\text{at least one six}) \approx 1 - 0.482 = 0.518$: slightly better than even, the basis of a famous 17th-century gambling bet.`,
          ],
        },
        pitfalls: [
          tx`Adding probabilities only works for events that can't happen together. Otherwise subtract the overlap.`,
          tx`Disjoint is not the same as independent. Two disjoint events with positive probability are never independent: if one happens, the other can't.`,
          tx`The law of large numbers doesn't mean the next result "balances out" earlier ones. Coins have no memory (the gambler's fallacy).`,
        ],
        usedIn: tx`Statistics (Module 09) is built on probability. Monte Carlo simulation, randomized algorithms and Markov chains (Module 15) all rely on the law of large numbers.`,
        practice: [
          { level: 1, gen(R) {
            const n = R.int(5, 15), k = R.int(2, Math.min(5, n - 1)), ordered = R.chance(0.5);
            const [thing, group] = R.pick([['people', 'a committee'], ['books', 'a shelf display'], ['runners', 'the podium'], ['songs', 'a playlist']]);
            const v = ordered ? M.fact(n) / M.fact(n - k) : M.binom(n, k);
            return {
              q: ordered ? tx`In how many ways can ${k} of ${n} ${thing} be arranged **in order** (first, second, …)?` : tx`In how many ways can ${k} of ${n} ${thing} be chosen for ${group} if **order doesn't matter**?`,
              ans: { type: 'num', answer: v },
              hint: ordered ? tx`Ordered: $n(n-1)\cdots(n-k+1) = \frac{n!}{(n-k)!}$.` : tx`Unordered: $\binom nk = \frac{n!}{k!(n-k)!}$.`,
              sol: ordered ? [tx`$${Array.from({ length: k }, (_, i) => n - i).join('\\times')} = ${v}$.`] : [tx`$\binom{${n}}{${k}} = \frac{${n}!}{${k}!\,${n - k}!} = ${v}$.`, tx`Equivalently, the ${M.fact(n) / M.fact(n - k)} ordered arrangements divided by the $${k}! = ${M.fact(k)}$ orders of each group.`],
            };
          } },
          { level: 2, gen(R) {
            const [what, p, ptex] = R.pick([['rolling a six on a die', 1 / 6, '\\frac16'], ['a coin landing heads', 0.5, '\\frac12'], ['a component failing (probability 0.05)', 0.05, '0.05'], ['a free throw going in (probability 0.7)', 0.7, '0.7'], ['drawing a heart from a full deck (with replacement)', 0.25, '\\frac14']]);
            const n = R.int(2, 10), v = 1 - (1 - p) ** n;
            return {
              q: tx`Independent trials: what is the probability of **at least one** success in ${n} tries, where success means ${what}? Three decimals.`,
              ans: { type: 'num', answer: v, tol: 0.0015 },
              hint: tx`Use the complement: $1 - P(\text{no successes})$.`,
              sol: [tx`$P(\text{no successes}) = (1 - ${ptex})^{${n}} \approx ${fmt((1 - p) ** n, 4)}$.`, tx`$P(\text{at least one}) = 1 - ${fmt((1 - p) ** n, 4)} \approx ${fmt(v, 4)}$.`],
            };
          } },
          { level: 3, gen(R) {
            const red = R.int(3, 9), blue = R.int(3, 9), k = R.int(2, Math.min(5, red + blue - 1)), j = R.int(Math.max(0, k - blue), Math.min(k, red));
            const v = (M.binom(red, j) * M.binom(blue, k - j)) / M.binom(red + blue, k);
            return {
              q: tx`A bag has ${red} red and ${blue} blue marbles. You draw ${k} without replacement. What is the probability that exactly ${j} are red? Four decimals.`,
              ans: { type: 'num', answer: v, tol: 0.0006 },
              hint: tx`Count favourable selections: choose the ${j} red from ${red} and the ${k - j} blue from ${blue}. Divide by all ways to choose ${k} from ${red + blue}.`,
              sol: [tx`Favourable: $\binom{${red}}{${j}}\binom{${blue}}{${k - j}} = ${M.binom(red, j)}\cdot${M.binom(blue, k - j)} = ${M.binom(red, j) * M.binom(blue, k - j)}$.`, tx`Total: $\binom{${red + blue}}{${k}} = ${M.binom(red + blue, k)}$.`, tx`$P = \frac{${M.binom(red, j) * M.binom(blue, k - j)}}{${M.binom(red + blue, k)}} \approx ${fmt(v, 5)}$. (This is the hypergeometric distribution.)`],
            };
          } },
        ],
      },
      {
        id: 'bayes', title: "Conditional probability and Bayes' theorem", minutes: 35,
        summary: 'Updating beliefs with evidence, and why most positive tests can be false alarms.',
        idea: tx`**Conditional probability** $P(A\mid B)$ is the probability of $A$ once you know $B$ happened. You shrink your world to the cases where $B$ is true and ask how often $A$ happens there.

**Bayes' theorem** flips a conditional around. Medical tests are described by $P(\text{positive}\mid\text{sick})$, but a patient wants $P(\text{sick}\mid\text{positive})$, and the two can be wildly different. The missing ingredient is the **base rate**: how common the condition is in the first place. When a condition is rare, even an accurate test produces more false positives than true ones.`,
        everyday: tx`A disease affects 1 in 100 people. A test catches 90% of cases and wrongly flags 9% of healthy people. You test positive: what's the chance you're sick?

Picture 1000 people. 10 are sick, and 9 of them test positive. 990 are healthy, and about 89 of them test positive too. So of 98 positives, only 9 are sick: about 9%. Most people guess 90%. That's the base-rate fallacy.`,
        visual: { widget: 'bayes', caption: tx`Each dot is a person. Start with prevalence 1% and notice how the orange false alarms outnumber the pink true positives. Then raise the prevalence, or the specificity, and watch $P(\text{sick}\mid +)$ climb.` },
        math: tx`**Conditional probability.** $P(A\mid B) = \dfrac{P(A\cap B)}{P(B)}$, so $P(A\cap B) = P(A\mid B)\,P(B)$.

**Law of total probability.** If $B_1,\dots,B_n$ split the possibilities into non-overlapping cases,
$$P(A) = \sum_i P(A\mid B_i)\,P(B_i).$$

**Bayes' theorem.**
$$P(B\mid A) = \frac{P(A\mid B)\,P(B)}{P(A)} = \frac{P(A\mid B)P(B)}{P(A\mid B)P(B) + P(A\mid B^c)P(B^c)}.$$

**Test vocabulary.** Sensitivity $= P(+\mid\text{sick})$; specificity $= P(-\mid\text{healthy})$; prevalence $= P(\text{sick})$; positive predictive value $= P(\text{sick}\mid +)$.

**Independence** means $P(A\mid B) = P(A)$: learning $B$ tells you nothing about $A$.`,
        example: {
          problem: tx`With prevalence 1%, sensitivity 90% and specificity 91%, compute $P(\text{sick}\mid +)$ exactly.`,
          steps: [
            tx`True positives: $P(+\mid\text{sick})P(\text{sick}) = 0.90 \times 0.01 = 0.009$.`,
            tx`False positives: $P(+\mid\text{healthy})P(\text{healthy}) = 0.09 \times 0.99 = 0.0891$.`,
            tx`Total: $P(+) = 0.009 + 0.0891 = 0.0981$.`,
            tx`$P(\text{sick}\mid +) = \frac{0.009}{0.0981} \approx 0.092$. A positive result raises the risk from 1% to about 9%: big news, but far from certain.`,
          ],
        },
        pitfalls: [
          tx`$P(A\mid B) \ne P(B\mid A)$. Confusing them is called the prosecutor's fallacy.`,
          tx`Don't ignore the base rate. Always ask how common the condition was before the evidence.`,
          tx`Conditioning changes the denominator: divide by $P(B)$, not by 1.`,
        ],
        usedIn: tx`Bayesian statistics, spam filters, medical decision-making, naive Bayes classifiers in machine learning, and filtering algorithms for hidden Markov models (Module 15).`,
        practice: [
          { level: 1, gen(R) {
            const a = R.int(10, 60), b = R.int(10, 60), c = R.int(10, 60), d = R.int(10, 60);
            const [A, An, B, Bn] = R.pick([['own a car', "don't own a car", 'live in the city', "don't live in the city"], ['passed', 'failed', 'attended the review', 'skipped the review'], ['clicked the ad', "didn't click the ad", 'were on mobile', 'were on desktop'], ['smoke', "don't smoke", 'have a cough', "don't have a cough"]]);
            const ask = R.pick(['AgB', 'BgA']);
            const v = ask === 'AgB' ? a / (a + c) : a / (a + b);
            return {
              q: tx`A survey of ${a + b + c + d} people: ${a} ${A} and ${B}; ${b} ${A} and ${Bn}; ${c} ${An} and ${B}; ${d} ${An} and ${Bn}. Find the probability that a person ${ask === 'AgB' ? `${A}, given that they ${B}` : `${B.replace(/^were /, 'was ')}, given that they ${A}`}. Three decimals.`,
              ans: { type: 'num', answer: v, tol: 0.0015 },
              hint: tx`Restrict to the people who satisfy the condition, then find the fraction of them with the other property.`,
              sol: ask === 'AgB' ? [tx`People who ${B}: $${a} + ${c} = ${a + c}$.`, tx`Of those, ${a} also ${A}: $P = \frac{${a}}{${a + c}} \approx ${fmt(v, 4)}$.`] : [tx`People who ${A}: $${a} + ${b} = ${a + b}$.`, tx`Of those, ${a} also ${B}: $P = \frac{${a}}{${a + b}} \approx ${fmt(v, 4)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const prev = R.pick([0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2]), sens = R.pick([0.8, 0.85, 0.9, 0.95, 0.99]), spec = R.pick([0.85, 0.9, 0.95, 0.97, 0.99]);
            const tp = sens * prev, fp = (1 - spec) * (1 - prev), v = tp / (tp + fp);
            return {
              q: tx`A condition has prevalence ${pct(prev)}. A test has sensitivity ${pct(sens)} and specificity ${pct(spec)}. If someone tests positive, what is the probability they have the condition? Three decimals.`.replace(/\\%/g, '%'),
              ans: { type: 'num', answer: v, tol: 0.0015 },
              hint: tx`$P(\text{sick}\mid +) = \dfrac{\text{sens}\times\text{prev}}{\text{sens}\times\text{prev} + (1-\text{spec})(1-\text{prev})}$.`,
              sol: [tx`True positives: $${sens} \times ${prev} = ${fmt(tp, 6)}$.`, tx`False positives: $${fmt(1 - spec, 4)} \times ${fmt(1 - prev, 4)} = ${fmt(fp, 6)}$.`, tx`$P(\text{sick}\mid +) = \frac{${fmt(tp, 6)}}{${fmt(tp + fp, 6)}} \approx ${fmt(v, 4)}$.`],
            };
          } },
          { level: 3, gen(R) {
            let sh; do { sh = [R.int(1, 7), R.int(1, 7), R.int(1, 7)]; } while (sh[0] + sh[1] + sh[2] > 10 || sh[0] + sh[1] + sh[2] < 4);
            const tot = sh[0] + sh[1] + sh[2], share = sh.map((v) => v / tot), def = [R.pick([0.01, 0.02, 0.03]), R.pick([0.02, 0.04, 0.05]), R.pick([0.01, 0.03, 0.06])], who = R.int(0, 2), names = ['A', 'B', 'C'];
            const pd = share.reduce((s, v, i) => s + v * def[i], 0), v = (share[who] * def[who]) / pd;
            return {
              q: tx`Three factories make ${share.map((v, i) => `${+(v * 100).toFixed(1)}% (${names[i]})`).join(', ')} of a product, with defect rates ${def.map((d, i) => `${d * 100}% (${names[i]})`).join(', ')}. A randomly chosen item is defective. What is the probability it came from factory ${names[who]}? Three decimals.`,
              ans: { type: 'num', answer: v, tol: 0.0015 },
              hint: tx`First find $P(\text{defective})$ with the law of total probability, then apply Bayes' theorem.`,
              sol: [tx`$P(D) = ${share.map((s, i) => `${fmt(s, 4)}(${def[i]})`).join(' + ')} = ${fmt(pd, 5)}$.`, tx`$P(${names[who]}\mid D) = \dfrac{${fmt(share[who], 4)}\times${def[who]}}{${fmt(pd, 5)}} \approx ${fmt(v, 4)}$.`],
            };
          } },
        ],
      },
      {
        id: 'distributions', title: 'Random variables and distributions', minutes: 35,
        summary: 'Binomial, Poisson, normal and exponential: the shapes randomness usually takes.',
        idea: tx`A **random variable** is a number decided by chance: the number of heads in 10 flips, the time until the next bus, tomorrow's high temperature. Its **distribution** says how likely each value is. A discrete variable has a probability mass function, a list of probabilities that add to 1. A continuous variable has a density curve, and probabilities are areas under it.

A handful of distributions come up again and again because they arise from simple mechanisms. Count successes in independent tries: **binomial**. Count rare events in a fixed window of time: **Poisson**. Wait for the next random event: **exponential**. Add up many small independent effects: **normal**, the bell curve.`,
        everyday: tx`A call centre gets 4 calls a minute on average, arriving independently. The number of calls in a given minute follows a Poisson distribution, which tells the manager that 8 or more calls in a minute will happen about 5% of the time, and so how many staff are needed. The gaps between calls follow an exponential distribution, which is why calls seem to bunch up even though nothing coordinates them.`,
        visual: { widget: 'distributions', caption: tx`Pick a distribution and move its parameters. Watch the orange $\mu \pm \sigma$ bar track the centre and spread. Push the binomial's $n$ up with $p$ near 0.5 and it starts to look normal. Use the last slider to shade $P(X \le x)$.` },
        math: tx`**Discrete:** $P(X = k) = p(k)$ with $\sum_k p(k) = 1$. **Continuous:** $P(a \le X \le b) = \int_a^b f(x)\,dx$ with $\int f = 1$. The CDF is $F(x) = P(X \le x)$.

- **Binomial**$(n,p)$: $P(X = k) = \binom nk p^k(1-p)^{n-k}$. Mean $np$, variance $np(1-p)$.
- **Poisson**$(\lambda)$: $P(X = k) = \dfrac{e^{-\lambda}\lambda^k}{k!}$. Mean and variance both $\lambda$.
- **Uniform**$(a,b)$: $f(x) = \frac{1}{b-a}$ on $[a,b]$. Mean $\frac{a+b}{2}$, variance $\frac{(b-a)^2}{12}$.
- **Exponential**$(\lambda)$: $f(x) = \lambda e^{-\lambda x}$ for $x\ge0$, so $P(X > t) = e^{-\lambda t}$. Mean $\frac1\lambda$, variance $\frac{1}{\lambda^2}$.
- **Normal**$(\mu,\sigma^2)$: $f(x) = \dfrac{1}{\sigma\sqrt{2\pi}}e^{-(x-\mu)^2/(2\sigma^2)}$. Standardize with $Z = \frac{X-\mu}{\sigma}$ and use $\Phi(z) = P(Z \le z)$.

**68–95–99.7 rule.** A normal variable lands within 1, 2 and 3 standard deviations of its mean with probability about 0.68, 0.95 and 0.997.`,
        example: {
          problem: tx`Heights are normal with mean 170 cm and standard deviation 8 cm. What fraction of people are taller than 186 cm?`,
          steps: [
            tx`Standardize: $z = \frac{186 - 170}{8} = 2$. A height of 186 cm is 2 standard deviations above average.`,
            tx`$P(Z > 2) = 1 - \Phi(2) \approx 1 - 0.9772 = 0.0228$.`,
            tx`About 2.3% of people. This matches the 95% rule: 5% lie beyond 2 SDs, split between the two tails.`,
          ],
        },
        pitfalls: [
          tx`For a continuous variable $P(X = a) = 0$; only intervals have positive probability. A density value can be bigger than 1.`,
          tx`$\Phi(z)$ gives $P(Z \le z)$. For $P(Z > z)$, subtract from 1.`,
          tx`The binomial needs a fixed number of independent trials with the same success probability. Drawing cards without replacement isn't binomial.`,
        ],
        usedIn: tx`Statistical inference (Module 09), queueing and reliability models, Monte Carlo methods, and stochastic differential equations all start from these distributions.`,
        practice: [
          { level: 1, gen(R) {
            const n = R.int(4, 15), p = R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75]), k = R.int(0, n), v = M.binom(n, k) * p ** k * (1 - p) ** (n - k);
            if (v < 0.001) return this.gen(R);
            return {
              q: tx`$X \sim \text{Binomial}(n = ${n}, p = ${p})$. Find $P(X = ${k})$. Four decimals.`,
              ans: { type: 'num', answer: v, tol: 0.0006 },
              hint: tx`$P(X = k) = \binom nk p^k(1-p)^{n-k}$.`,
              sol: [tx`$\binom{${n}}{${k}}(${p})^{${k}}(${fmt(1 - p)})^{${n - k}} = ${M.binom(n, k)}\cdot${fmt(p ** k, 6)}\cdot${fmt((1 - p) ** (n - k), 6)} \approx ${fmt(v, 5)}$.`],
            };
          } },
          { level: 2, gen(R) {
            if (R.chance(0.55)) {
              const l = R.pick([1, 2, 2.5, 3, 4, 5, 6]), k = R.int(0, Math.min(8, Math.round(l + 3))), cum = R.chance(0.5);
              const pk = (j) => (Math.exp(-l) * l ** j) / M.fact(j), v = cum ? Array.from({ length: k + 1 }, (_, j) => pk(j)).reduce((a, b) => a + b, 0) : pk(k);
              return {
                q: tx`Calls arrive at an average rate of ${l} per minute (Poisson). Find the probability of ${cum ? `at most ${k}` : `exactly ${k}`} call${k === 1 ? '' : 's'} in a given minute. Four decimals.`,
                ans: { type: 'num', answer: v, tol: 0.0006 },
                hint: tx`$P(X = k) = e^{-\lambda}\lambda^k/k!$ with $\lambda = ${l}$.${cum ? ` Add these up for $k = 0, \\dots, ${k}$.` : ''}`,
                sol: cum ? [tx`$\sum_{j=0}^{${k}} e^{-${l}}\frac{${l}^j}{j!} = ${Array.from({ length: k + 1 }, (_, j) => fmt(pk(j), 4)).join(' + ')}$.`, tx`$\approx ${fmt(v, 5)}$.`] : [tx`$e^{-${l}}\cdot\frac{${l}^{${k}}}{${k}!} \approx ${fmt(v, 5)}$.`],
              };
            }
            const mean = R.pick([2, 4, 5, 8, 10, 20]), t = R.int(1, 3 * mean), v = Math.exp(-t / mean);
            return {
              q: tx`The time until a component fails is exponential with mean ${mean} years. What is the probability it lasts longer than ${t} years? Four decimals.`,
              ans: { type: 'num', answer: v, tol: 0.0006 },
              hint: tx`Mean $1/\lambda = ${mean}$, so $\lambda = \frac{1}{${mean}}$. Then $P(X > t) = e^{-\lambda t}$.`,
              sol: [tx`$\lambda = \frac{1}{${mean}}$, so $P(X > ${t}) = e^{-${t}/${mean}} \approx ${fmt(v, 5)}$.`],
            };
          } },
          { level: 3, gen(R) {
            const mu = R.int(5, 20) * 10, s = R.int(2, 15), a = mu + R.int(-25, 5) / 10 * s, b = a + R.int(5, 30) / 10 * s;
            const za = (a - mu) / s, zb = (b - mu) / s, v = M.phi(zb) - M.phi(za);
            return {
              q: tx`$X$ is normal with mean ${mu} and standard deviation ${s}. Find $P(${fmt(a)} < X < ${fmt(b)})$. Three decimals.`,
              ans: { type: 'num', answer: v, tol: 0.0015 },
              hint: tx`Standardize both ends with $z = (x - \mu)/\sigma$, then compute $\Phi(z_b) - \Phi(z_a)$.`,
              sol: [tx`$z_a = \frac{${fmt(a)} - ${mu}}{${s}} = ${fmt(za, 3)}$ and $z_b = \frac{${fmt(b)} - ${mu}}{${s}} = ${fmt(zb, 3)}$.`, tx`$\Phi(${fmt(zb, 3)}) - \Phi(${fmt(za, 3)}) \approx ${fmt(M.phi(zb), 4)} - ${fmt(M.phi(za), 4)} = ${fmt(v, 4)}$.`],
              verify: C.near(M.integrate((x) => M.npdf(x, mu, s), a, b, 4000), v, 1e-6),
            };
          } },
        ],
      },
      {
        id: 'clt', title: 'Expectation, variance and the Central Limit Theorem', minutes: 40,
        summary: 'Averages, spread, and why the bell curve is everywhere.',
        idea: tx`The **expected value** $E[X]$ is the long-run average of a random variable, each value weighted by its probability. The **variance** measures spread as the average squared distance from the mean, and its square root, the **standard deviation**, is in the same units as $X$.

The **Central Limit Theorem** is why the normal distribution is everywhere. Take almost any distribution, however lopsided, and average $n$ independent draws. As $n$ grows, the distribution of that average becomes a bell curve centred on the true mean, with spread shrinking like $\sigma/\sqrt n$. Measurement errors, test scores and poll results are averages of many small effects, so they come out normal.`,
        everyday: tx`One die roll is flat: every face is equally likely. Average two dice and 3.5 becomes more likely than 1 or 6. Average 30 dice and the result is almost always between 3 and 4, in a near-perfect bell shape.

Polls work the same way. One person's opinion is a coin flip, but the average of 1000 people is predictable to within about 3%.`,
        visual: { widget: 'clt', caption: tx`Choose the skewed exponential population and set $n = 1$: the histogram of means just copies the population. Now raise $n$ to 5, 15, 40 and draw 1000 samples each time. The histogram turns into a bell curve and narrows exactly as $\sigma/\sqrt n$ predicts.` },
        math: tx`**Expectation.** $E[X] = \sum_x x\,p(x)$ or $\int x f(x)\,dx$. It is always linear: $E[aX + bY] = aE[X] + bE[Y]$.

**Variance.** $\operatorname{Var}(X) = E[(X - \mu)^2] = E[X^2] - (E[X])^2$ and $\operatorname{Var}(aX + b) = a^2\operatorname{Var}(X)$. For independent $X, Y$: $\operatorname{Var}(X + Y) = \operatorname{Var}X + \operatorname{Var}Y$.

**Sample mean.** For $n$ independent draws with mean $\mu$ and SD $\sigma$:
$$E[\bar X] = \mu, \qquad \operatorname{SD}(\bar X) = \frac{\sigma}{\sqrt n}.$$

**Central Limit Theorem.** For large $n$,
$$\frac{\bar X - \mu}{\sigma/\sqrt n} \approx N(0, 1),$$
whatever the original distribution, as long as its variance is finite. A common rule of thumb is $n \ge 30$.`,
        example: {
          problem: tx`A fair die is rolled 100 times. Approximate the probability that the average roll is above 3.7.`,
          steps: [
            tx`One roll: $\mu = 3.5$ and $E[X^2] = \frac{1+4+9+16+25+36}{6} = \frac{91}{6}$, so $\sigma^2 = \frac{91}{6} - 3.5^2 = \frac{35}{12}$ and $\sigma \approx 1.708$.`,
            tx`The average of 100 rolls has SD $\frac{1.708}{\sqrt{100}} = 0.1708$.`,
            tx`CLT: $z = \frac{3.7 - 3.5}{0.1708} \approx 1.17$.`,
            tx`$P(\bar X > 3.7) \approx 1 - \Phi(1.17) \approx 0.121$.`,
          ],
        },
        pitfalls: [
          tx`Variances add for independent variables; standard deviations don't.`,
          tx`The CLT is about the *average* (or sum) of many variables. A single draw doesn't become normal.`,
          tx`$\sigma/\sqrt n$ shrinks slowly: halving the error takes four times as much data.`,
        ],
        usedIn: tx`Confidence intervals and hypothesis tests (Module 09) are direct applications of the CLT. So are error bars on Monte Carlo simulations, quality-control charts, and portfolio risk in finance.`,
        practice: [
          { level: 1, gen(R) {
            const xs = R.distinct(4, -3, 10).sort((a, b) => a - b), w = [R.int(1, 5), R.int(1, 5), R.int(1, 5), R.int(1, 5)], tot = w.reduce((a, b) => a + b, 0);
            const ps = w.map((v) => v / tot), e = xs.reduce((s, x, i) => s + x * ps[i], 0);
            return {
              q: tx`$X$ takes the values $${xs.join(', ')}$ with probabilities $${w.map((v) => AM.frac(v, tot)).join(', ')}$. Find $E[X]$.`,
              ans: { type: 'num', answer: e, show: tx`$${AM.frac(xs.reduce((s, x, i) => s + x * w[i], 0), tot)}$` },
              hint: tx`$E[X] = \sum x\,p(x)$: multiply each value by its probability and add.`,
              sol: [tx`$E[X] = ${xs.map((x, i) => `(${x})${AM.frac(w[i], tot)}`).join(' + ')} = ${AM.frac(xs.reduce((s, x, i) => s + x * w[i], 0), tot)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const xs = R.distinct(3, 0, 8).sort((a, b) => a - b), w = [R.int(1, 4), R.int(1, 4), R.int(1, 4)], tot = w.reduce((a, b) => a + b, 0), ps = w.map((v) => v / tot);
            const e = xs.reduce((s, x, i) => s + x * ps[i], 0), e2 = xs.reduce((s, x, i) => s + x * x * ps[i], 0), vr = e2 - e * e, a = R.nz(-3, 4), b = R.int(-5, 5), askY = R.chance(0.5);
            return {
              q: askY ? tx`$X$ takes the values $${xs.join(', ')}$ with probabilities $${w.map((v) => AM.frac(v, tot)).join(', ')}$. Find $\operatorname{Var}(${a}X ${AM.sgn(b)})$. Three decimals.` : tx`$X$ takes the values $${xs.join(', ')}$ with probabilities $${w.map((v) => AM.frac(v, tot)).join(', ')}$. Find $\operatorname{Var}(X)$. Three decimals.`,
              ans: { type: 'num', answer: askY ? a * a * vr : vr, tol: 0.0015 },
              hint: tx`$\operatorname{Var}(X) = E[X^2] - (E[X])^2$.${askY ? ' Then $\\operatorname{Var}(aX + b) = a^2\\operatorname{Var}(X)$: adding a constant shifts without spreading.' : ''}`,
              sol: [tx`$E[X] = ${fmt(e, 4)}$ and $E[X^2] = ${xs.map((x, i) => `${x * x}\\cdot${AM.frac(w[i], tot)}`).join(' + ')} = ${fmt(e2, 4)}$.`, tx`$\operatorname{Var}(X) = ${fmt(e2, 4)} - ${fmt(e, 4)}^2 = ${fmt(vr, 4)}$.`, ...(askY ? [tx`$\operatorname{Var}(${a}X ${AM.sgn(b)}) = ${a * a}\cdot${fmt(vr, 4)} = ${fmt(a * a * vr, 4)}$.`] : [])],
            };
          } },
          { level: 3, gen(R) {
            const [ctx, mu, s, unit] = R.pick([['Bags of flour have weights with mean 1000 g and SD 15 g', 1000, 15, 'g'], ['Waiting times have mean 8 minutes and SD 8 minutes (they are exponential, not normal)', 8, 8, 'min'], ['Light bulbs last a mean of 1200 hours with SD 200 hours', 1200, 200, 'h'], ['A die roll has mean 3.5 and SD 1.708', 3.5, 1.708, '']]);
            const n = R.pick([25, 36, 49, 64, 100]), se = s / Math.sqrt(n), c = +(mu + R.pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2]) * se * R.real(0.8, 1.2, 2)).toFixed(2), above = R.chance(0.5);
            const z = (c - mu) / se, v = above ? 1 - M.phi(z) : M.phi(z);
            return {
              q: tx`${ctx}. For a random sample of ${n}, approximate the probability that the sample mean is ${above ? 'above' : 'below'} ${c}${unit ? ' ' + unit : ''}. Three decimals.`,
              ans: { type: 'num', answer: v, tol: 0.002 },
              hint: tx`By the CLT, $\bar X \approx N\!\left(\mu, \left(\sigma/\sqrt n\right)^2\right)$. Standardize with the standard error $\sigma/\sqrt n$.`,
              sol: [tx`Standard error: $\frac{${s}}{\sqrt{${n}}} = ${fmt(se, 4)}$.`, tx`$z = \frac{${c} - ${mu}}{${fmt(se, 4)}} \approx ${fmt(z, 3)}$.`, tx`$P = ${above ? `1 - \\Phi(${fmt(z, 3)})` : `\\Phi(${fmt(z, 3)})`} \approx ${fmt(v, 4)}$.`],
            };
          } },
        ],
      },
    ],
  });
})();
