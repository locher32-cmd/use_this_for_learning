/* Module 01 — Functions, exponentials and trigonometry (Stage 0). */
(function () {
  'use strict';
  const AM = window.AM, tx = AM.tx, fmt = AM.fmt, sgn = AM.sgn;

  const piFrac = (deg) => { // degrees → "\frac{2\pi}{3}" style TeX
    if (deg === 0) return '0';
    const g = AM.m.gcd(deg, 180), p = deg / g, q = 180 / g;
    const top = p === 1 ? '\\pi' : `${p}\\pi`;
    return q === 1 ? top : `\\frac{${top}}{${q}}`;
  };
  const EX = { // exact [cos, sin]
    0: ['1', '0'], 30: ['\\frac{\\sqrt3}{2}', '\\frac12'], 45: ['\\frac{\\sqrt2}{2}', '\\frac{\\sqrt2}{2}'], 60: ['\\frac12', '\\frac{\\sqrt3}{2}'], 90: ['0', '1'],
    120: ['-\\frac12', '\\frac{\\sqrt3}{2}'], 135: ['-\\frac{\\sqrt2}{2}', '\\frac{\\sqrt2}{2}'], 150: ['-\\frac{\\sqrt3}{2}', '\\frac12'], 180: ['-1', '0'],
    210: ['-\\frac{\\sqrt3}{2}', '-\\frac12'], 225: ['-\\frac{\\sqrt2}{2}', '-\\frac{\\sqrt2}{2}'], 240: ['-\\frac12', '-\\frac{\\sqrt3}{2}'], 270: ['0', '-1'],
    300: ['\\frac12', '-\\frac{\\sqrt3}{2}'], 315: ['\\frac{\\sqrt2}{2}', '-\\frac{\\sqrt2}{2}'], 330: ['\\frac{\\sqrt3}{2}', '-\\frac12'],
  };

  AM.module({
    id: 'functions', stage: 0, title: 'Functions & Graphs', aka: 'Precalculus',
    blurb: 'The objects every later module manipulates: functions, their graphs, exponential growth and the periodic functions behind waves. If any of this feels rusty, fix it here first. Calculus moves much faster when these are automatic.',
    prereq: ['algebra1'],
    lessons: [
      {
        id: 'transform', title: 'Functions and their graphs', minutes: 25,
        summary: 'Inputs, outputs, and how to slide and stretch a graph.',
        idea: tx`A **function** is a rule that takes an input and returns exactly one output. Think of a machine: put in $x$, get out $f(x)$. The **graph** is a picture of every input–output pair at once, with inputs along the horizontal axis and outputs up the vertical one.

Most functions you meet are a familiar *parent* function that has been moved or stretched. Once you can read those moves off a formula, you can sketch almost anything in seconds, and you can tune a model until it fits your data.`,
        everyday: tx`A taxi charges a \$3 pickup fee plus \$2 per mile, so the fare is a function of distance: $F(m) = 3 + 2m$. One distance gives one fare, never two.

During a surge the company adds \$5 to every ride. That's $F(m) + 5$: the same graph moved **up** 5. If the meter starts running one mile late, the fare at $m$ miles is what it used to be at $m-1$ miles. That's $F(m-1)$: the same graph moved **right** 1.`,
        visual: { widget: 'transform', caption: tx`Pick a parent function, then move one slider at a time and watch which way the graph goes. Notice that a positive $h$ moves it right. Drag the orange point to move the graph directly.` },
        math: tx`**Definition.** A function $f : A \to B$ assigns to each $x$ in the **domain** $A$ exactly one value $f(x)$ in $B$. The **range** is the set of outputs actually produced.

**Transformations** of $y = f(x)$:
$$y = a\,f\big(b(x - h)\big) + k$$

- $h$ shifts the graph **right** by $h$ (left if $h<0$).
- $k$ shifts it **up** by $k$.
- $a$ stretches it vertically by $|a|$; if $a<0$ it also flips over the $x$-axis.
- $b$ squeezes it horizontally by a factor $b$ (it widens when $0<b<1$).

**Composition** $(f\circ g)(x) = f(g(x))$: do $g$ first, then $f$. The **inverse** $f^{-1}$ undoes $f$, so $f^{-1}(f(x)) = x$. To find it, solve $y = f(x)$ for $x$.`,
        example: {
          problem: tx`Describe $y = -2(x-3)^2 + 5$ compared with $y = x^2$, then find $y$ when $x = 4$.`,
          steps: [
            tx`Match it to the template $a\,f(x-h)+k$ with $f(x) = x^2$: here $a=-2$, $h=3$, $k=5$.`,
            tx`$h = 3$ moves the vertex right to $x = 3$ and $k = 5$ moves it up to $y = 5$. The vertex is $(3, 5)$.`,
            tx`$a = -2$ makes the parabola twice as steep, and because $a < 0$ it opens **downward**, so $(3,5)$ is the highest point.`,
            tx`At $x = 4$: $y = -2(4-3)^2 + 5 = -2(1) + 5 = 3$.`,
          ],
        },
        pitfalls: [
          tx`$f(x-3)$ moves the graph **right** by 3, not left. Ask which input now produces the old output at $0$: it's $x = 3$.`,
          tx`$f(x)^2$ and $f(x^2)$ are different. The first squares the output; the second squares the input.`,
          tx`$f^{-1}(x)$ is the inverse function, not $\dfrac{1}{f(x)}$.`,
        ],
        usedIn: tx`Fitting models to data (Module 09), shifting time origins in differential equations (Module 07), and rescaling variables everywhere in numerical work.`,
        practice: [
          { level: 1, gen(R) {
            const a = R.nz(-3, 3), b = R.int(-5, 5), c = R.int(-6, 6), k = R.int(-3, 3);
            const v = a * k * k + b * k + c;
            return {
              q: tx`Let $f(x) = ${AM.poly([a, b, c])}$. Find $f(${k})$.`,
              ans: { type: 'num', answer: v },
              hint: tx`Replace every $x$ with $(${k})$ and keep the parentheses so the signs stay right.`,
              sol: [tx`$f(${k}) = ${a}(${k})^2 ${sgn(b)}\cdot(${k}) ${sgn(c)}$`, tx`$= ${a * k * k} ${sgn(b * k)} ${sgn(c)} = ${v}$`],
            };
          } },
          { level: 2, gen(R) {
            const a = R.nz(-4, 4), b = R.nz(-6, 6), c = R.nz(-5, 5), k = R.nz(-3, 3);
            const f = (x) => a * x + b, g = (x) => x * x + c, fg = R.chance(0.5);
            const F = tx`f(x) = ${AM.poly([a, b])}`, G = tx`g(x) = ${AM.poly([1, 0, c])}`;
            if (fg) {
              const inner = g(k), v = f(inner);
              return {
                q: tx`Let $${F}$ and $${G}$. Find $(f\circ g)(${k})$.`,
                ans: { type: 'num', answer: v },
                hint: tx`$(f\circ g)(${k}) = f\big(g(${k})\big)$. Work from the inside out.`,
                sol: [tx`Inside first: $g(${k}) = (${k})^2 ${sgn(c)} = ${inner}$.`, tx`Then $f(${inner}) = ${a}(${inner}) ${sgn(b)} = ${v}$.`],
              };
            }
            const inner = f(k), v = g(inner);
            return {
              q: tx`Let $${F}$ and $${G}$. Find $(g\circ f)(${k})$.`,
              ans: { type: 'num', answer: v },
              hint: tx`$(g\circ f)(${k}) = g\big(f(${k})\big)$. Work from the inside out.`,
              sol: [tx`Inside first: $f(${k}) = ${a}(${k}) ${sgn(b)} = ${inner}$.`, tx`Then $g(${inner}) = (${inner})^2 ${sgn(c)} = ${v}$.`],
            };
          } },
          { level: 3, gen(R) {
            const a = R.nz(-6, 6), h = R.nz(-4, 4), k = R.nz(-4, 4);
            return {
              q: tx`Find the inverse function $f^{-1}(x)$ for $f(x) = \dfrac{${a}}{x ${sgn(-h)}} ${sgn(k)}$.`,
              ans: { type: 'fn', expr: `${a}/(x-(${k}))+(${h})`, domain: [k + 0.4, k + 5], show: tx`$f^{-1}(x) = \dfrac{${a}}{x ${sgn(-k)}} ${sgn(h)}$`, placeholder: 'e.g. 3/(x-1) + 2' },
              hint: tx`Write $y = f(x)$, move the constant over, then flip both sides of the equation.`,
              sol: [
                tx`Write $y = \dfrac{${a}}{x ${sgn(-h)}} ${sgn(k)}$ and solve for $x$.`,
                tx`Subtract: $y ${sgn(-k)} = \dfrac{${a}}{x ${sgn(-h)}}$.`,
                tx`Flip both sides and multiply by ${a}: $x ${sgn(-h)} = \dfrac{${a}}{y ${sgn(-k)}}$.`,
                tx`So $x = \dfrac{${a}}{y ${sgn(-k)}} ${sgn(h)}$. Rename $y$ as $x$: $f^{-1}(x) = \dfrac{${a}}{x ${sgn(-k)}} ${sgn(h)}$.`,
                tx`Notice the shifts swap roles: the horizontal shift of $f$ becomes the vertical shift of $f^{-1}$, because the inverse reflects the graph across $y = x$.`,
              ],
            };
          } },
        ],
      },
      {
        id: 'explog', title: 'Exponentials and logarithms', minutes: 25,
        summary: 'Repeated multiplication, and the question "what power?"',
        idea: tx`Adding the same amount each step gives a straight line. **Multiplying** by the same factor each step gives an **exponential**, $P(t) = P_0\,b^t$. Savings with interest, bacteria and viral posts grow this way; caffeine in your blood and radioactive atoms shrink this way.

A **logarithm** runs the question backwards. $\log_b(y)$ asks *what power of $b$ gives $y$?* Since $2^5 = 32$, $\log_2 32 = 5$. Logs turn multiplication into addition, which is why they tame huge ranges (decibels, pH, earthquake magnitudes) and why they let you solve for time in growth problems.`,
        everyday: tx`You put \$1000 in an account paying 5% a year. Each year the balance is multiplied by $1.05$, so after $t$ years it is $1000(1.05)^t$.

When does it double? Solve $1.05^t = 2$. Taking logs gives $t = \ln 2 / \ln 1.05 \approx 14.2$ years. The "rule of 72" ($72 / 5 \approx 14.4$) is a mental shortcut for the same log calculation.`,
        visual: { widget: 'expgrowth', caption: tx`Change the rate and watch the doubling markers. They are evenly spaced in time: that is what makes growth exponential. Then switch on the log scale and the curve straightens into a line.` },
        math: tx`**Exponent rules.** $b^{x}b^{y} = b^{x+y}$, $\ (b^x)^y = b^{xy}$, $\ b^{-x} = 1/b^x$, $\ b^0 = 1$.

**Logarithm.** For $b>0$, $b\ne1$ and $y>0$: $\ \log_b y = x \iff b^x = y$.

**Log rules.** $\log_b(xy) = \log_b x + \log_b y$, $\ \log_b(x/y) = \log_b x - \log_b y$, $\ \log_b(x^p) = p\log_b x$, $\ \log_b x = \dfrac{\ln x}{\ln b}$.

**The natural base** $e \approx 2.71828$, with $\ln = \log_e$. Continuous growth at rate $r$:
$$P(t) = P_0\,e^{rt}, \qquad \text{doubling time } T_2 = \frac{\ln 2}{r}.$$`,
        example: {
          problem: tx`A culture starts with 500 bacteria and triples every 4 hours. When does it reach 20,000?`,
          steps: [
            tx`Tripling every 4 hours means $N(t) = 500\cdot 3^{t/4}$ with $t$ in hours. Check: at $t = 4$ you get $500 \cdot 3$.`,
            tx`Set $500\cdot 3^{t/4} = 20000$, so $3^{t/4} = 40$.`,
            tx`Take $\ln$ of both sides: $\dfrac{t}{4}\ln 3 = \ln 40$.`,
            tx`$t = \dfrac{4\ln 40}{\ln 3} \approx \dfrac{4(3.689)}{1.0986} \approx 13.4$ hours.`,
          ],
        },
        pitfalls: [
          tx`$\log(a + b)$ is **not** $\log a + \log b$. The rule is for products: $\log(ab) = \log a + \log b$.`,
          tx`$\ln$ only accepts positive inputs. If you reach $\ln(-3)$, an earlier step went wrong.`,
          tx`Growth of 5% means multiplying by $1.05$, not by $0.05$.`,
        ],
        usedIn: tx`Solving differential equations (Module 07), where $e^{rt}$ is the basic building block; log-likelihoods in statistics (Module 09); and measuring error and convergence speed in numerical methods (Module 11).`,
        practice: [
          { level: 1, gen(R) {
            const b = R.pick([2, 3, 5, 10]);
            const maxN = { 2: 7, 3: 5, 5: 4, 10: 4 }[b];
            const n = R.int(-3, maxN);
            const val = n >= 0 ? String(b ** n) : `\\frac{1}{${b ** -n}}`;
            return {
              q: tx`Evaluate $\log_{${b}}\!\left(${val}\right)$.`,
              ans: { type: 'num', answer: n },
              hint: tx`Ask yourself: ${b} to what power equals $${val}$?`,
              sol: [tx`$${b}^{${n}} = ${val}$${n < 0 ? tx` (a negative power means a reciprocal)` : ''}.`, tx`So $\log_{${b}}\!\left(${val}\right) = ${n}$.`],
            };
          } },
          { level: 2, gen(R) {
            const a = R.int(2, 9), k = R.pick([0.2, 0.5, 1, 2, 3, -0.5, -1]), c = R.int(1, 60);
            const x = Math.log(c / a) / k;
            return {
              q: tx`Solve $${a}e^{${k}x} = ${c}$ for $x$. A decimal to 2 places is fine.`,
              ans: { type: 'num', answer: x, tol: 0.01 },
              hint: tx`Divide by ${a} first, then take the natural log of both sides.`,
              sol: [tx`Divide by ${a}: $e^{${k}x} = \dfrac{${c}}{${a}}$.`, tx`Take $\ln$: $${k}x = \ln\!\left(\dfrac{${c}}{${a}}\right) \approx ${fmt(Math.log(c / a), 4)}$.`, tx`So $x \approx ${fmt(x, 4)}$.`],
            };
          } },
          { level: 3, gen(R) {
            const H = R.pick([3, 4, 5, 6, 8]), D = R.pick([200, 400, 500, 800]);
            const rem = 5 * R.int(1, Math.floor(D / 15));
            const t = (H * Math.log(D / rem)) / Math.log(2);
            return {
              q: tx`A medicine has a half-life of ${H} hours. A patient takes a ${D} mg dose. How many hours until only ${rem} mg remain? Answer to 2 decimals.`,
              ans: { type: 'num', answer: t, tol: 0.02, unit: 'hours' },
              hint: tx`Halving every ${H} hours means $A(t) = ${D}\left(\tfrac12\right)^{t/${H}}$. Set that equal to ${rem} and take logs.`,
              sol: [
                tx`Model: $A(t) = ${D}\left(\tfrac12\right)^{t/${H}}$.`,
                tx`Set $A(t) = ${rem}$: $\left(\tfrac12\right)^{t/${H}} = \dfrac{${rem}}{${D}}$.`,
                tx`Take $\ln$: $\dfrac{t}{${H}}\ln\tfrac12 = \ln\dfrac{${rem}}{${D}}$, so $t = ${H}\cdot\dfrac{\ln(${D}/${rem})}{\ln 2}$.`,
                tx`$t \approx ${H} \cdot \dfrac{${fmt(Math.log(D / rem), 4)}}{0.6931} \approx ${fmt(t, 3)}$ hours.`,
              ],
            };
          } },
        ],
      },
      {
        id: 'trig', title: 'Trigonometry and the unit circle', minutes: 30,
        summary: 'Angles as points on a circle, and where waves come from.',
        idea: tx`Walk around a circle of radius 1 centred at the origin. After turning through an angle $\theta$, your position is $(\cos\theta, \sin\theta)$. That's the whole definition: **cosine is how far across, sine is how far up.**

Keep walking and those two numbers rise and fall forever, repeating every full turn. Plot them against the angle and you get the smooth waves behind sound, alternating current, tides and anything else that cycles. Applied mathematicians measure angles in **radians** (the distance walked along the circle) because it makes the calculus come out clean.`,
        everyday: tx`A Ferris wheel 36 m across has its axle 20 m above the ground and turns once every 6 minutes. If you board at the bottom, your height is $h(t) = 20 - 18\cos\!\left(\tfrac{2\pi t}{6}\right)$.

The **amplitude** (18 m) is the radius, the **midline** (20 m) is the axle height, and the **period** (6 min) is one full turn. Every periodic model you'll build later has these same three dials.`,
        visual: { widget: 'unitcircle', caption: tx`Drag the pink point around the circle. Blue (cosine) is its shadow on the horizontal axis and orange (sine) its height. The right panel unrolls both into waves. Press Play to watch one full turn.` },
        math: tx`**Radians.** A full turn is $2\pi$ radians $= 360^\circ$, so $\theta_{\text{rad}} = \theta_{\deg}\cdot\dfrac{\pi}{180}$. Arc length on a circle of radius $r$ is $s = r\theta$.

**Definitions.** On the unit circle, $\cos\theta = x$ and $\sin\theta = y$; $\ \tan\theta = \dfrac{\sin\theta}{\cos\theta}$.

**Key identity.** $\sin^2\theta + \cos^2\theta = 1$, which is Pythagoras on the unit circle.

**Special values.** $\sin\frac{\pi}{6} = \frac12$, $\ \sin\frac{\pi}{4} = \frac{\sqrt2}{2}$, $\ \sin\frac{\pi}{3} = \frac{\sqrt3}{2}$. Cosine runs the same list backwards.

**Sinusoids.** $y = A\sin\big(B(x - C)\big) + D$ has amplitude $|A|$, period $\dfrac{2\pi}{B}$, phase shift $C$ and midline $y = D$.`,
        example: {
          problem: tx`For the Ferris wheel $h(t) = 20 - 18\cos\!\left(\frac{\pi t}{3}\right)$ (metres, $t$ in minutes), how high are you after 1 minute?`,
          steps: [
            tx`Check the model: the period is $\dfrac{2\pi}{\pi/3} = 6$ minutes, and at $t = 0$, $h = 20 - 18 = 2$ m, the bottom of the wheel.`,
            tx`At $t = 1$ the angle is $\frac{\pi}{3}$ radians, which is $60^\circ$.`,
            tx`$\cos\frac{\pi}{3} = \frac12$, so $h(1) = 20 - 18\cdot\frac12 = 11$ m.`,
            tx`Sanity check: one minute is a sixth of a turn, so you should be a bit under halfway up. 11 m out of a 38 m top fits.`,
          ],
        },
        pitfalls: [
          tx`Calculators can be in degree mode. $\sin(30)$ with 30 in radians is about $-0.99$, not $0.5$.`,
          tx`$\sin^2\theta$ means $(\sin\theta)^2$, but $\sin^{-1}\theta$ means $\arcsin\theta$, not $1/\sin\theta$.`,
          tx`The period of $\sin(Bx)$ is $2\pi/B$, not $2\pi B$. Larger $B$ means faster wiggles.`,
        ],
        usedIn: tx`Fourier series and signals (Module 13), oscillating springs and circuits (Module 07), rotation matrices (Module 05) and Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$ (Module 12).`,
        practice: [
          { level: 1, gen(R) {
            const deg = R.pick([30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360]);
            return {
              q: tx`Convert $${deg}^\circ$ to radians. You can type answers like <code>pi/3</code> or <code>2pi/3</code>.`,
              ans: { type: 'num', answer: (deg * Math.PI) / 180, show: tx`$${piFrac(deg)}$` },
              hint: tx`Multiply by $\dfrac{\pi}{180}$, then simplify the fraction.`,
              sol: [tx`$${deg}^\circ \times \dfrac{\pi}{180} = \dfrac{${deg}\pi}{180}$`, tx`$= ${piFrac(deg)}$`],
            };
          } },
          { level: 2, gen(R) {
            const deg = R.pick([30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]);
            const useSin = R.chance(0.5), rad = (deg * Math.PI) / 180;
            const v = useSin ? Math.sin(rad) : Math.cos(rad), ex = EX[deg][useSin ? 1 : 0];
            const name = useSin ? '\\sin' : '\\cos';
            return {
              q: tx`Find the exact value of $${name}\!\left(${piFrac(deg)}\right)$. Type something like <code>sqrt(3)/2</code> or <code>-1/2</code>.`,
              ans: { type: 'num', answer: v, tol: 0.002, show: tx`$${ex}$` },
              hint: tx`$${piFrac(deg)}$ is $${deg}^\circ$. Find that point on the unit circle: cosine is its $x$-coordinate and sine is its $y$-coordinate.`,
              sol: [
                tx`$${piFrac(deg)} = ${deg}^\circ$. Its reference angle (distance to the nearest horizontal axis) is $${[0, 180, 360].includes(deg) ? 0 : deg % 90 === 0 ? 90 : Math.min(deg % 180, 180 - (deg % 180))}^\circ$.`,
                tx`The unit-circle point is $\left(${EX[deg][0]},\ ${EX[deg][1]}\right)$, with signs set by the quadrant.`,
                tx`So $${name}\!\left(${piFrac(deg)}\right) = ${ex}$.`,
              ],
            };
          } },
          { level: 3, gen(R) {
            const D = R.pick([30, 40, 50, 60]), r = D / 2, c = r + R.int(1, 4), T = R.pick([4, 5, 6, 8, 10]);
            const t = R.int(1, 2 * T - 1) / 2;
            const ang = (2 * Math.PI * t) / T, h = c - r * Math.cos(ang);
            return {
              q: tx`A Ferris wheel has diameter ${D} m, its axle is ${c} m above the ground, and it turns once every ${T} minutes. You board at the lowest point. How high are you after ${t} minutes? Answer to 2 decimals.`,
              ans: { type: 'num', answer: h, tol: 0.02, unit: 'm' },
              hint: tx`Use $h(t) = (\text{axle}) - (\text{radius})\cos\!\left(\dfrac{2\pi t}{T}\right)$. The minus sign starts you at the bottom.`,
              sol: [
                tx`Radius $= ${r}$ m, so $h(t) = ${c} - ${r}\cos\!\left(\dfrac{2\pi t}{${T}}\right)$. At $t=0$ this gives $${c - r}$ m, the bottom.`,
                tx`At $t = ${t}$ the angle is $\dfrac{2\pi(${t})}{${T}} \approx ${fmt(ang, 4)}$ rad, and $\cos(${fmt(ang, 4)}) \approx ${fmt(Math.cos(ang), 4)}$.`,
                tx`$h \approx ${c} - ${r}(${fmt(Math.cos(ang), 4)}) \approx ${fmt(h, 3)}$ m.`,
              ],
            };
          } },
        ],
      },
    ],
  });
})();
