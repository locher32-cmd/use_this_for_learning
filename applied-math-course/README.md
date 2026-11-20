# Gradient: an applied math course

A self-paced course covering the mathematics of an applied math degree, from precalculus through PDEs, optimization, stochastic processes and finite elements. Every lesson has:

1. **The idea**: what it means, in plain English
2. **An everyday example** of where it shows up
3. **An interactive visual** you can drag and adjust
4. **The math**: definitions, theorems and formulas
5. **A worked example**, revealed one step at a time
6. **Practice at four levels** (Warm-up, Core, Challenge, Exam), with new numbers every time and full worked solutions

Study tools: **daily review** (spaced repetition), an **exam builder** (mixed, timed, graded at the end), a **progress dashboard** with mastery per module and weak spots, **lesson search**, and progress **backup/restore**.

**If it feels hard:** start with Module 00, which rebuilds the basics from scratch. Every problem has **Walk me through it** (the solution one step at a time), and the **Symbol guide** explains every piece of notation in plain English.

## What's in it

19 modules, 71 lessons, 284 problem generators, 69 interactive visuals.

| Stage | Modules |
|---|---|
| 0 · Foundations | **00 Start Here: Math Basics** (fractions & percentages, equations, powers & roots, straight lines) · 01 Functions & Graphs · 02 Logic, Sets & Proof |
| 1 · Year 1 | 03 Calculus I · 04 Calculus II (incl. improper integrals, series) · 05 Linear Algebra (incl. least squares, SVD) |
| 2 · Year 2 | 06 Multivariable Calculus · 07 Differential Equations (incl. Laplace transforms) · 08 Probability (incl. joint distributions) · 09 Statistics (incl. maximum likelihood) |
| 3 · Upper division | 10 Real Analysis · 11 Numerical Methods · 12 Complex Analysis |
| 4 · Advanced applied | 13 Fourier Analysis & PDEs (incl. Fourier transform/DFT) · 14 Optimization · 15 Modeling & Dynamical Systems |
| 5 · Specialist | 16 Numerical Linear Algebra · 17 Stochastic Processes · 18 Variational Methods (function spaces, calculus of variations, finite elements) |

## Ways to run it

**Save it to your device (one file):** download [`Gradient.html`](Gradient.html) (about 2 MB) and keep it anywhere: your laptop, a USB stick, cloud storage. Double-click it to open in your browser. Everything (lessons, visuals, math fonts) is inside that one file, so it works with no internet. On the Progress page, **Save backup file** downloads your progress as a `.json` file, and **Load backup file** restores it, so you can move progress between devices. Rebuild the file after changes with `node tools/bundle.mjs`.

**From the project folder:** open `index.html` in any browser; it also works offline. Progress is saved in that browser.

**Install as an app (web):** serve it over http and install from the browser.
```bash
cd applied-math-course
node tools/serve.mjs          # then open http://localhost:8000
```
In Chrome or Edge click **Install app** (top bar) or the install icon in the address bar. On iPhone/iPad use Safari → Share → *Add to Home Screen*. It then opens in its own window and works offline.

To get a public install link for your phone, enable GitHub Pages for this repo (Settings → Pages → Source: *GitHub Actions*). The `Gradient web app` workflow publishes it on every push to `main`.

**Desktop app (Electron):** a real program for macOS, Windows and Linux.
```bash
cd applied-math-course
npm install
npm start                     # run the desktop app
npm run dist                  # build an installer for this computer → release/
```
Or let GitHub build all three: Actions → **Gradient desktop installers** → *Run workflow*. The `.dmg`, `.exe` and `.AppImage`/`.deb` appear as downloads on the run's page. (The builds are unsigned, so macOS asks you to right-click → Open the first time and Windows shows a SmartScreen prompt.)

The desktop app adds a **Study** menu (⌘/Ctrl+1–3), **File → Export/Import progress** to `.json`, and keeps a dated automatic backup of your progress every day in the app's data folder.

## Typing answers

Answers are checked by value, so any equivalent form is accepted: `3/4`, `0.75`, `sqrt(2)/2`, `pi/3`, `e^(2x)`, `2x*sin(x)`. Lists are comma-separated: `2, -3`. A live preview shows how your input was read.

## Project layout

```
index.html              the app page (loads everything below)
css/                    styles and bundled font faces
js/core.js              RNG, math helpers, answer parser and checker, markdown + KaTeX rendering
js/plot.js              canvas plotting engine and slider/controls toolkit
js/widgets/*.js         the interactive visuals, grouped by area
js/content/NN-*.js      the 19 modules (lessons and problem generators)
js/content/deeper.js    extra lessons inserted into earlier modules
js/content/exam-*.js    Exam-level problems (4th tier) for every lesson
js/app.js               routing, lesson pages, practice engine, review, exams, dashboard
js/install.js           offline/service-worker registration and install button
desktop/                Electron main process and preload bridge
tools/build.mjs         regenerates sw.js (offline file list) and dist/artifact.html
tools/serve.mjs         zero-dependency local web server
tests/                  automated tests (see below)
vendor/                 KaTeX and fonts (MIT / SIL OFL licences included)
```

### Adding a lesson

Lessons are plain data. Copy any lesson object in `js/content/`, change the text, point `visual.widget` at a widget, and write four generators `{ level, gen(R) }`. Each returns `{ q, ans, hint, sol }`. A generator can include `verify()` to prove its own answer numerically; the test suite runs it.

## Tests

```bash
node tests/run.mjs                 # every generator × 300 seeds: answers accepted, wrong answers rejected, math renders, self-checks pass
node tests/browser.cjs             # every page in a real browser, every control operated, a lesson solved end to end, an exam taken
node tests/install.cjs             # manifest, icons, offline cache, and an offline reload over http
xvfb-run -a node tests/desktop.cjs # launches the Electron app (needs npm install)
node tests/bundle.cjs              # Gradient.html offline with the network blocked, plus backup save/restore
```
Run `node tools/build.mjs` after adding or renaming files so the offline cache stays complete (`tests/install.cjs` checks this).
