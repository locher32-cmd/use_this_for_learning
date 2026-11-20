/* Module 09 — Statistics (Stage 2). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, M = AM.m;
  const ZS = { 90: 1.645, 95: 1.96, 99: 2.576 };
  const fit = (xs, ys) => {
    const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
    let sxy = 0, sxx = 0, syy = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
    const b1 = sxy / sxx; return { mx, my, sxy, sxx, syy, b1, b0: my - b1 * mx, r: sxy / Math.sqrt(sxx * syy) };
  };

  AM.module({
    id: 'stats', stage: 2, title: 'Statistics', aka: 'Mathematical Statistics / Statistical Inference',
    blurb: 'Statistics turns data into conclusions you can defend. You will estimate unknown quantities with honest error bars, test whether effects are real or just noise, and fit and interpret regression models, all built on the probability from Module 08.',
    prereq: ['prob', 'linalg'],
    lessons: [
      {
        id: 'ci', title: 'Estimation and confidence intervals', minutes: 30,
        summary: 'Estimating an unknown quantity from a sample, with an honest margin of error.',
        idea: tx`You almost never measure a whole population, so you estimate from a sample. A **point estimate** such as the sample mean $\bar x$ is your best single guess. A **confidence interval** adds a margin of error: a range built so that, if you repeated the whole sampling process many times, a stated percentage of the intervals (say 95%) would contain the true value.

The margin of error shrinks with larger samples, like $1/\sqrt n$, and grows with the confidence you demand. A 99% interval must be wider than a 95% one, because it has to catch the truth more often.`,
        everyday: tx`A poll of 1000 voters finds 52% support a policy, "plus or minus 3 points". That ±3 is the margin of error of a 95% confidence interval: the support is somewhere between 49% and 55%.

The 95% doesn't mean there's a 95% chance the truth is in this particular range. It means the polling method, used over and over, captures the truth 95% of the time.`,
        visual: { widget: 'ci', caption: tx`Each horizontal line is one study's confidence interval. Draw new batches and count the red misses: about 5 in 50 at 95%. Increase $n$ and the intervals shrink but still miss at the same rate. Raise the confidence level and they widen.` },
        math: tx`**Sample statistics.** $\bar x = \frac1n\sum x_i$ and $s^2 = \frac{1}{n-1}\sum(x_i - \bar x)^2$. The **standard error** of $\bar x$ is $\sigma/\sqrt n$, estimated by $s/\sqrt n$ when $\sigma$ is unknown.

**Confidence interval for a mean** ($\sigma$ known, or $n$ large):
$$\bar x \pm z^*\frac{\sigma}{\sqrt n}, \qquad z^* = 1.645,\ 1.960,\ 2.576 \text{ for } 90\%,\ 95\%,\ 99\%.$$
With $\sigma$ unknown and $n$ small, replace $z^*$ by $t^*$ from the $t$-distribution with $n-1$ degrees of freedom.

**For a proportion:** $\ \hat p \pm z^*\sqrt{\dfrac{\hat p(1-\hat p)}{n}}$.

**Sample size** for a margin of error $E$: $\ n = \left(\dfrac{z^*\sigma}{E}\right)^2$, rounded up.`,
        example: {
          problem: tx`A sample of 36 bolts has mean length 50.2 mm, and the process SD is known to be 0.6 mm. Find a 95% confidence interval for the true mean length.`,
          steps: [
            tx`Standard error: $\frac{0.6}{\sqrt{36}} = 0.1$ mm.`,
            tx`Margin of error: $1.96 \times 0.1 = 0.196$ mm.`,
            tx`Interval: $50.2 \pm 0.196$, i.e. $(50.004,\ 50.396)$ mm.`,
            tx`If the bolts should be 50.0 mm, the whole interval sits just above that: evidence the machine runs slightly long.`,
          ],
        },
        pitfalls: [
          tx`A 95% interval does not contain 95% of the data. It's a statement about where the *mean* is.`,
          tx`Once computed, a particular interval either contains the true value or doesn't. The 95% describes the method.`,
          tx`Use $n - 1$ in the sample variance. Dividing by $n$ underestimates the spread.`,
        ],
        usedIn: tx`Every experimental result in science and engineering should come with an interval. Monte Carlo estimates (Module 11), A/B tests and quality control all report them.`,
        practice: [
          { level: 1, gen(R) {
            const xb = R.int(20, 200) + R.pick([0, 0.5, 0.2]), s = R.int(2, 25), n = R.pick([16, 25, 36, 49, 64, 81, 100]), cl = R.pick([90, 95, 99]), z = ZS[cl], E = (z * s) / Math.sqrt(n), up = R.chance(0.5);
            return {
              q: tx`A sample of ${n} has mean ${xb}, and the population SD is ${s}. Find the ${up ? 'upper' : 'lower'} end of the ${cl}% confidence interval for the mean. Two decimals.`,
              ans: { type: 'num', answer: up ? xb + E : xb - E, tol: 0.006 },
              hint: tx`Margin $= z^*\cdot\sigma/\sqrt n$ with $z^* = ${z}$ for ${cl}%.`,
              sol: [tx`Standard error $= ${s}/\sqrt{${n}} = ${fmt(s / Math.sqrt(n), 4)}$.`, tx`Margin $= ${z}\times${fmt(s / Math.sqrt(n), 4)} = ${fmt(E, 4)}$.`, tx`Interval $${xb} \pm ${fmt(E, 4)} = (${fmt(xb - E, 3)},\ ${fmt(xb + E, 3)})$.`],
            };
          } },
          { level: 2, gen(R) {
            const n = R.pick([200, 400, 500, 800, 1000, 1500, 2000]), k = R.int(Math.round(n * 0.2), Math.round(n * 0.8)), ph = k / n, cl = R.pick([90, 95, 99]), E = ZS[cl] * Math.sqrt((ph * (1 - ph)) / n);
            return {
              q: tx`In a survey, ${k} of ${n} people say yes. Find the margin of error of a ${cl}% confidence interval for the true proportion. Three decimals (as a proportion, not a percentage).`,
              ans: { type: 'num', answer: E, tol: 0.0006 },
              hint: tx`$\hat p = ${k}/${n}$ and margin $= z^*\sqrt{\hat p(1-\hat p)/n}$ with $z^* = ${ZS[cl]}$.`,
              sol: [tx`$\hat p = ${fmt(ph, 4)}$.`, tx`Margin $= ${ZS[cl]}\sqrt{\frac{${fmt(ph, 4)}(${fmt(1 - ph, 4)})}{${n}}} \approx ${fmt(E, 4)}$, about $\pm${fmt(E * 100, 1)}$ percentage points.`],
            };
          } },
          { level: 3, gen(R) {
            const s = R.int(3, 30), E = R.pick([0.5, 1, 1.5, 2, 2.5, 3]), cl = R.pick([90, 95, 99]), raw = (ZS[cl] * s / E) ** 2, n = Math.ceil(raw - 1e-9);
            return {
              q: tx`The population SD is about ${s}. How large a sample do you need for a ${cl}% confidence interval for the mean with margin of error at most ${E}?`,
              ans: { type: 'num', answer: n, tol: 0.01 },
              hint: tx`Solve $z^*\sigma/\sqrt n \le E$ for $n$, then round **up**.`,
              sol: [tx`$n \ge \left(\frac{${ZS[cl]}\times${s}}{${E}}\right)^2 = ${fmt(raw, 3)}$.`, tx`Round up: $n = ${n}$. Rounding down would leave the margin slightly too wide.`],
            };
          } },
        ],
      },
      {
        id: 'tests', title: 'Hypothesis tests and p-values', minutes: 35,
        summary: 'Is that effect real, or could chance alone explain it?',
        idea: tx`A hypothesis test asks whether data are surprising under a default assumption, the **null hypothesis** $H_0$: "the coin is fair", "the drug does nothing". You compute a **test statistic** measuring how far the data are from what $H_0$ predicts, then the **p-value**: the probability, if $H_0$ were true, of a result at least this extreme.

A small p-value means the data would be a rare coincidence under $H_0$, so you **reject** it in favour of the alternative. A large p-value means the data are consistent with $H_0$. That doesn't prove $H_0$; it just means you lack evidence against it.`,
        everyday: tx`A friend's coin lands heads 60 times in 100 flips. Is it rigged? A fair coin would give about 50 heads, give or take 5. Sixty heads is 2 standard deviations high, and a fair coin does something that extreme (in either direction) only about 4.6% of the time. At the usual 5% threshold you'd call the coin suspicious, but only just.`,
        visual: { widget: 'pvalue', caption: tx`Set the flips and heads. The orange tail area is the p-value. Keep the proportion at 60% but change the number of flips: 12 of 20 is unremarkable, while 240 of 400 is overwhelming evidence. More data makes the same effect easier to detect.` },
        math: tx`**Setup.** A null $H_0$ and an alternative $H_1$, either one-sided ($\mu > \mu_0$) or two-sided ($\mu \ne \mu_0$). Choose a significance level $\alpha$, often $0.05$.

**z-test for a mean:** $\ z = \dfrac{\bar x - \mu_0}{\sigma/\sqrt n}$. $\qquad$ **For a proportion:** $\ z = \dfrac{\hat p - p_0}{\sqrt{p_0(1-p_0)/n}}$.

**p-value.** Right-tailed: $P(Z \ge z)$. Left-tailed: $P(Z \le z)$. Two-sided: $2P(Z \ge |z|)$.

**Decision.** Reject $H_0$ if $p \le \alpha$. For a two-sided test at $\alpha = 0.05$ that's the same as $|z| > 1.96$.

**Errors.** Type I: rejecting a true $H_0$ (probability $\alpha$). Type II: failing to reject a false $H_0$. **Power** $= 1 - P(\text{Type II})$, and it grows with sample size.`,
        example: {
          problem: tx`A coin shows 60 heads in 100 flips. Test whether it's fair (two-sided, $\alpha = 0.05$).`,
          steps: [
            tx`$H_0: p = 0.5$, $H_1: p \ne 0.5$. Under $H_0$ the SD of $\hat p$ is $\sqrt{0.5\cdot0.5/100} = 0.05$.`,
            tx`$z = \frac{0.60 - 0.50}{0.05} = 2.0$.`,
            tx`Two-sided p-value: $2P(Z \ge 2) = 2(0.0228) = 0.0455$.`,
            tx`$0.0455 < 0.05$, so reject $H_0$ at the 5% level. The evidence of bias is real but modest.`,
          ],
        },
        pitfalls: [
          tx`The p-value is not the probability that $H_0$ is true. It's computed *assuming* $H_0$ is true.`,
          tx`Statistically significant doesn't mean important. With huge samples, tiny and useless effects become significant.`,
          tx`Decide on one-sided or two-sided *before* looking at the data.`,
        ],
        usedIn: tx`Clinical trials, A/B tests in tech, quality control, and checking whether a model's improvement is real or noise. The same logic underlies goodness-of-fit checks for the models you build in Module 15.`,
        practice: [
          { level: 1, gen(R) {
            const mu0 = R.int(10, 100), s = R.int(2, 20), n = R.pick([16, 25, 36, 49, 64, 100]), xb = +(mu0 + R.real(-2.5, 2.5, 2) * s / Math.sqrt(n)).toFixed(2), z = (xb - mu0) / (s / Math.sqrt(n));
            return {
              q: tx`Test $H_0: \mu = ${mu0}$ using a sample of ${n} with mean ${xb}, given $\sigma = ${s}$. Compute the $z$ statistic. Two decimals.`,
              ans: { type: 'num', answer: z, tol: 0.006 },
              hint: tx`$z = \dfrac{\bar x - \mu_0}{\sigma/\sqrt n}$.`,
              sol: [tx`$z = \dfrac{${xb} - ${mu0}}{${s}/\sqrt{${n}}} = \dfrac{${fmt(xb - mu0, 3)}}{${fmt(s / Math.sqrt(n), 4)}} \approx ${fmt(z, 3)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const z = R.real(-3, 3, 2), tail = R.pick(['two', 'right', 'left']), p = tail === 'two' ? 2 * (1 - M.phi(Math.abs(z))) : tail === 'right' ? 1 - M.phi(z) : M.phi(z);
            return {
              q: tx`A test gives $z = ${z}$. Find the p-value for a ${tail === 'two' ? 'two-sided' : tail === 'right' ? 'right-tailed ($H_1: \\mu > \\mu_0$)' : 'left-tailed ($H_1: \\mu < \\mu_0$)'} test. Three decimals.`,
              ans: { type: 'num', answer: p, tol: 0.0015 },
              hint: tail === 'two' ? tx`Two-sided: $2P(Z \ge |z|) = 2(1 - \Phi(|z|))$.` : tail === 'right' ? tx`Right tail: $P(Z \ge z) = 1 - \Phi(z)$.` : tx`Left tail: $P(Z \le z) = \Phi(z)$.`,
              sol: [tail === 'two' ? tx`$2(1 - \Phi(${Math.abs(z)})) = 2(1 - ${fmt(M.phi(Math.abs(z)), 4)}) \approx ${fmt(p, 4)}$.` : tail === 'right' ? tx`$1 - \Phi(${z}) = 1 - ${fmt(M.phi(z), 4)} \approx ${fmt(p, 4)}$.` : tx`$\Phi(${z}) \approx ${fmt(p, 4)}$.`, tx`${p <= 0.05 ? 'Below 0.05: reject $H_0$ at the 5% level.' : 'Above 0.05: not enough evidence to reject $H_0$ at the 5% level.'}`],
            };
          } },
          { level: 3, gen(R) {
            const n = R.pick([50, 100, 150, 200, 300, 400]), p0 = R.pick([0.5, 0.5, 0.25, 0.1, 0.6]), k = Math.round(n * p0 + R.real(-3, 3, 1) * Math.sqrt(n * p0 * (1 - p0)));
            const ph = k / n, z = (ph - p0) / Math.sqrt((p0 * (1 - p0)) / n), p = 2 * (1 - M.phi(Math.abs(z)));
            const [ctx, what] = p0 === 0.5 ? ['A coin is flipped', 'heads'] : p0 === 0.25 ? ['A multiple-choice guesser answers questions with 4 options', 'correct answers'] : p0 === 0.1 ? ['A supplier claims 10% of items are defective; you inspect', 'defective items'] : ['A candidate claims 60% support; you poll', 'supporters'];
            return {
              q: tx`${ctx} ${n} times and gets ${k} ${what}. Test $H_0: p = ${p0}$ against a two-sided alternative. What is the p-value? Three decimals.`,
              ans: { type: 'num', answer: p, tol: 0.002 },
              hint: tx`$z = \dfrac{\hat p - p_0}{\sqrt{p_0(1-p_0)/n}}$, then the two-sided p-value $2(1 - \Phi(|z|))$.`,
              sol: [tx`$\hat p = ${k}/${n} = ${fmt(ph, 4)}$ and the SD under $H_0$ is $\sqrt{${p0}(${fmt(1 - p0)})/${n}} = ${fmt(Math.sqrt((p0 * (1 - p0)) / n), 4)}$.`, tx`$z = ${fmt(z, 3)}$, so $p = 2(1 - \Phi(${fmt(Math.abs(z), 3)})) \approx ${fmt(p, 4)}$.`, tx`${p <= 0.05 ? 'Reject $H_0$ at the 5% level.' : 'Do not reject $H_0$ at the 5% level.'}`],
            };
          } },
        ],
      },
      {
        id: 'regression', title: 'Regression and correlation', minutes: 35,
        summary: "Fitting lines to data, measuring the fit, and what a fit can't tell you.",
        idea: tx`Regression fits a model $\hat y = b_0 + b_1x$ to paired data using the least squares line from linear algebra. Statistics adds the interpretation. The slope $b_1$ is the predicted change in $y$ for each unit increase in $x$. The **correlation** $r$, between $-1$ and $1$, measures how tightly the points cluster around a line. **$R^2 = r^2$** is the fraction of the variation in $y$ that the line explains.

Regression describes association, not causation. Ice-cream sales and drownings rise together because both rise in summer, not because one causes the other.`,
        everyday: tx`A website records ad spending and sales each week. The fitted line says each extra \$1000 of ads goes with about \$4000 more in sales, and $R^2 = 0.64$: ad spending accounts for about two-thirds of the week-to-week variation in sales. The rest comes from everything else, like seasons, competitors and luck. And without a controlled experiment you can't be sure the ads *caused* the sales.`,
        visual: { widget: 'leastsq', opts: { mode: 'stats' }, caption: tx`Drag points to see $r$ and $R^2$ respond. Line them up tightly and $r$ approaches $\pm1$. Add an outlier and watch a single point drag the slope and wreck $R^2$. The fitted line always passes through the mean point $(\bar x, \bar y)$.` },
        math: tx`**Least squares line.** $b_1 = \dfrac{\sum(x_i-\bar x)(y_i - \bar y)}{\sum(x_i - \bar x)^2} = r\dfrac{s_y}{s_x}$ and $b_0 = \bar y - b_1\bar x$. The line passes through $(\bar x, \bar y)$.

**Correlation.**
$$r = \frac{\sum(x_i-\bar x)(y_i-\bar y)}{\sqrt{\sum(x_i-\bar x)^2\,\sum(y_i-\bar y)^2}}, \qquad -1 \le r \le 1.$$

**Coefficient of determination.** $R^2 = 1 - \dfrac{SS_{\text{res}}}{SS_{\text{tot}}}$, with $SS_{\text{res}} = \sum(y_i - \hat y_i)^2$ and $SS_{\text{tot}} = \sum(y_i - \bar y)^2$. For a straight-line fit, $R^2 = r^2$.

**Residuals** $e_i = y_i - \hat y_i$ should look like random scatter. A curved pattern means a straight line is the wrong model.

**Multiple regression** $\hat y = b_0 + b_1x_1 + \cdots + b_kx_k$ solves the normal equations $X^TX\mathbf b = X^T\mathbf y$ from Module 05.`,
        example: {
          problem: tx`Given $\bar x = 4$, $\bar y = 10$, $s_x = 2$, $s_y = 5$ and $r = 0.8$, find the regression line and predict $y$ at $x = 6$.`,
          steps: [
            tx`Slope $b_1 = r\frac{s_y}{s_x} = 0.8\cdot\frac52 = 2$.`,
            tx`Intercept $b_0 = \bar y - b_1\bar x = 10 - 2(4) = 2$, so $\hat y = 2 + 2x$.`,
            tx`At $x = 6$: $\hat y = 14$.`,
            tx`$R^2 = 0.8^2 = 0.64$: the line explains 64% of the variation in $y$.`,
          ],
        },
        pitfalls: [
          tx`Correlation is not causation. A lurking variable can drive both $x$ and $y$.`,
          tx`$r$ only measures *linear* association. A perfect U-shaped relationship can have $r = 0$.`,
          tx`Don't extrapolate far beyond your data; the linear pattern may not continue.`,
        ],
        usedIn: tx`Forecasting, calibration curves, econometrics, and as the first model in machine learning. Least squares (Module 05) provides the computation; this lesson provides the interpretation.`,
        practice: [
          { level: 1, gen(R) {
            const mx = R.int(2, 20), my = R.int(10, 80), sx = R.int(1, 6), sy = R.int(2, 15), r = R.pick([-0.9, -0.7, -0.5, 0.3, 0.5, 0.6, 0.8, 0.9]), x0 = mx + R.nz(-4, 4);
            const b1 = (r * sy) / sx, b0 = my - b1 * mx, y = b0 + b1 * x0;
            return {
              q: tx`For paired data, $\bar x = ${mx}$, $\bar y = ${my}$, $s_x = ${sx}$, $s_y = ${sy}$ and $r = ${r}$. Use the regression line to predict $y$ when $x = ${x0}$. Two decimals.`,
              ans: { type: 'num', answer: y, tol: 0.006 },
              hint: tx`$b_1 = r\,s_y/s_x$. The line goes through $(\bar x, \bar y)$, so $\hat y = \bar y + b_1(x - \bar x)$.`,
              sol: [tx`$b_1 = ${r}\cdot\frac{${sy}}{${sx}} = ${fmt(b1, 4)}$.`, tx`$\hat y = ${my} + ${fmt(b1, 4)}(${x0} - ${mx}) = ${fmt(y, 3)}$.`],
            };
          } },
          { level: 2, gen(R) {
            const xs = [1, 2, 3, 4, 5], m = R.pick([-2, -1, 1, 2, 3]), ys = xs.map((x) => m * x + R.int(-3, 3) + 5), F = fit(xs, ys);
            if (!isFinite(F.r) || F.syy === 0) return this.gen(R);
            return {
              q: tx`Find the correlation $r$ for the points $${xs.map((x, i) => `(${x}, ${ys[i]})`).join(',\\ ')}$. Three decimals.`,
              ans: { type: 'num', answer: F.r, tol: 0.0015 },
              hint: tx`Compute $\sum(x-\bar x)(y-\bar y)$, $\sum(x-\bar x)^2$ and $\sum(y-\bar y)^2$, then $r = \frac{S_{xy}}{\sqrt{S_{xx}S_{yy}}}$.`,
              sol: [tx`$\bar x = ${F.mx}$, $\bar y = ${fmt(F.my, 3)}$.`, tx`$S_{xy} = ${fmt(F.sxy, 3)}$, $S_{xx} = ${fmt(F.sxx, 3)}$, $S_{yy} = ${fmt(F.syy, 3)}$.`, tx`$r = \dfrac{${fmt(F.sxy, 3)}}{\sqrt{${fmt(F.sxx, 3)}\cdot${fmt(F.syy, 3)}}} \approx ${fmt(F.r, 4)}$.`],
            };
          } },
          { level: 3, gen(R) {
            const xs = [0, 1, 2, 3, 4, 5].slice(0, R.int(4, 6)), m = R.pick([-2, -1, 1, 2]), ys = xs.map((x) => m * x + R.int(-3, 3) + 6), F = fit(xs, ys), i = R.int(0, xs.length - 1), e = ys[i] - (F.b0 + F.b1 * xs[i]);
            return {
              q: tx`Fit the least squares line to $${xs.map((x, j) => `(${x}, ${ys[j]})`).join(',\\ ')}$, then find the residual $e = y - \hat y$ at the point $(${xs[i]}, ${ys[i]})$. Three decimals.`,
              ans: { type: 'num', answer: e, tol: 0.002 },
              hint: tx`Find $b_1 = S_{xy}/S_{xx}$ and $b_0 = \bar y - b_1\bar x$. A residual is observed minus predicted.`,
              sol: [tx`$\bar x = ${fmt(F.mx, 3)}$, $\bar y = ${fmt(F.my, 3)}$, $S_{xy} = ${fmt(F.sxy, 3)}$, $S_{xx} = ${fmt(F.sxx, 3)}$.`, tx`$b_1 = ${fmt(F.b1, 4)}$, $b_0 = ${fmt(F.b0, 4)}$.`, tx`$\hat y(${xs[i]}) = ${fmt(F.b0 + F.b1 * xs[i], 4)}$, so $e = ${ys[i]} - ${fmt(F.b0 + F.b1 * xs[i], 4)} = ${fmt(e, 4)}$. Residuals always add to zero across all points.`],
              verify() { const s = xs.reduce((acc, x, j) => acc + ys[j] - (F.b0 + F.b1 * x), 0); return Math.abs(s) < 1e-9 ? true : 'residuals do not sum to 0'; },
            };
          } },
        ],
      },
    ],
  });
})();
