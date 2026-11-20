/* Gradient — app shell: routing, course map, lesson pages, practice engine, progress. */
(function () {
  'use strict';
  const AM = window.AM, el = AM.el, md = AM.md, mdi = AM.mdi;
  const $ = (s, r = document) => r.querySelector(s);

  const STAGES = [
    { n: 0, name: 'Foundations', note: 'High-school tools, tightened up to university standard.' },
    { n: 1, name: 'Year 1 core', note: 'Calculus and linear algebra, the language for everything after.' },
    { n: 2, name: 'Year 2 core', note: 'Many variables, change over time, and uncertainty.' },
    { n: 3, name: 'Upper division', note: 'Rigor, computation and the complex plane.' },
    { n: 4, name: 'Advanced applied', note: 'Waves, heat, optimization and models of the real world.' },
  ];
  const TIERS = ['Warm-up', 'Core', 'Challenge'];
  const SECTION = { idea: 'The idea', everyday: 'In plain English', visual: 'See it', math: 'The math', example: 'Worked example', pitfalls: 'Watch out for', practice: 'Practice', usedIn: 'Where you will use this' };

  /* ---------- index ---------- */
  const lessons = new Map(), order = [], mods = new Map();
  AM.modules.forEach((m, mi) => {
    m.num = mi + 1; mods.set(m.id, m);
    m.lessons.forEach((l, li) => { l.fid = `${m.id}-${l.id}`; l.mod = m; l.num = li + 1; lessons.set(l.fid, l); order.push(l); });
  });
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- progress ---------- */
  const S = AM.store.load(); S.lessons = S.lessons || {}; S.checks = S.checks || {};
  const save = () => AM.store.save(S);
  const ls = (fid) => (S.lessons[fid] = S.lessons[fid] || { tiers: [0, 0, 0] });
  const done = (fid) => { const t = S.lessons[fid] && S.lessons[fid].tiers; return !!t && t.every(Boolean); };
  const tiersDone = (fid) => (S.lessons[fid] ? S.lessons[fid].tiers.filter(Boolean).length : 0);
  const modDone = (m) => m.lessons.filter((l) => done(l.fid)).length;
  const totalDone = () => order.filter((l) => done(l.fid)).length;
  const nextUp = () => {
    if (S.last && lessons.has(S.last) && !done(S.last)) return lessons.get(S.last);
    return order.find((l) => !done(l.fid)) || order[0];
  };

  /* ---------- theme toggle ---------- */
  try { const t = localStorage.getItem('gradient-theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) { /* no storage */ }
  const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; };

  /* ---------- shell ---------- */
  const app = $('#app');
  app.innerHTML = `
    <aside class="side" id="side" aria-label="Course contents">
      <div class="side-inner">
        <a class="brand" href="#home"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">Gradient</span><span class="brand-sub">Applied Math</span></a>
        <div class="side-progress" id="side-progress"></div>
        <nav id="side-nav"></nav>
      </div>
    </aside>
    <div class="scrim" id="scrim" hidden></div>
    <div class="main">
      <header class="top">
        <div class="top-inner">
          <button class="btn btn-ghost btn-sm menu-btn" id="menu-btn" type="button" aria-controls="side" aria-expanded="false">Contents</button>
          <nav class="crumbs" id="crumbs" aria-label="Breadcrumb"></nav>
          <button class="btn btn-ghost btn-sm" id="theme-btn" type="button"></button>
        </div>
      </header>
      <main id="view" tabindex="-1"></main>
    </div>`;
  const view = $('#view'), side = $('#side'), scrim = $('#scrim'), menuBtn = $('#menu-btn'), themeBtn = $('#theme-btn');
  const syncTheme = () => { themeBtn.textContent = isDark() ? 'Light mode' : 'Dark mode'; };
  themeBtn.addEventListener('click', () => {
    const t = isDark() ? 'light' : 'dark'; document.documentElement.dataset.theme = t;
    try { localStorage.setItem('gradient-theme', t); } catch (e) { /* no storage */ }
    syncTheme();
  });
  syncTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncTheme);
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const openSide = (o) => { side.classList.toggle('open', o); scrim.hidden = !o; menuBtn.setAttribute('aria-expanded', String(o)); };
  menuBtn.addEventListener('click', () => openSide(!side.classList.contains('open')));
  scrim.addEventListener('click', () => openSide(false));

  function renderSide(route) {
    const activeMod = route.mod ? route.mod.id : null;
    $('#side-progress').innerHTML = `<div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${order.length}" aria-valuenow="${totalDone()}" aria-label="Lessons completed"><span style="width:${(100 * totalDone()) / order.length}%"></span></div><p><b>${totalDone()}</b> of ${order.length} lessons complete</p>`;
    $('#side-nav').innerHTML = STAGES.map((st) => {
      const ms = AM.modules.filter((m) => m.stage === st.n);
      if (!ms.length) return '';
      return `<div class="side-stage"><p class="side-stage-label">Stage ${st.n} · ${st.name}</p>${ms.map((m) => {
        const open = m.id === activeMod;
        return `<a class="side-mod${open ? ' active' : ''}${modDone(m) === m.lessons.length ? ' complete' : ''}" href="#${m.id}"><span class="num">${pad(m.num)}</span><span class="t">${m.title}</span><span class="frac">${modDone(m)}/${m.lessons.length}</span></a>${open ? `<ol class="side-lessons">${m.lessons.map((l) => `<li><a href="#${l.fid}" class="${route.lesson === l ? 'active' : ''}${done(l.fid) ? ' done' : ''}"><span class="dot" aria-hidden="true"></span>${l.title}</a></li>`).join('')}<li><a href="#${m.id}-checkpoint" class="${route.check ? 'active' : ''} cp">Module checkpoint</a></li></ol>` : ''}`;
      }).join('')}</div>`;
    }).join('');
  }

  function crumbs(route) {
    const c = $('#crumbs');
    if (route.home) { c.innerHTML = '<span>Course map</span>'; return; }
    const m = route.mod;
    c.innerHTML = `<a href="#home">Map</a><span aria-hidden="true">/</span><a href="#${m.id}">${pad(m.num)} ${m.title}</a>${route.lesson ? `<span aria-hidden="true">/</span><span class="cur">${route.lesson.title}</span>` : route.check ? '<span aria-hidden="true">/</span><span class="cur">Checkpoint</span>' : ''}`;
  }

  /* ---------- routing ---------- */
  function parseRoute() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (lessons.has(h)) { const l = lessons.get(h); return { lesson: l, mod: l.mod }; }
    if (mods.has(h)) return { mod: mods.get(h) };
    if (h.endsWith('-checkpoint') && mods.has(h.slice(0, -11))) return { mod: mods.get(h.slice(0, -11)), check: true };
    return { home: true };
  }
  function go() {
    const route = parseRoute();
    view.innerHTML = '';
    if (route.home) renderHome();
    else if (route.lesson) renderLesson(route.lesson);
    else if (route.check) renderCheckpoint(route.mod);
    else renderModule(route.mod);
    AM.cleanup();
    renderSide(route); crumbs(route); openSide(false);
    window.scrollTo(0, 0);
    document.title = route.lesson ? `${route.lesson.title} · Gradient` : route.mod ? `${route.mod.title} · Gradient` : 'Gradient Applied Math';
    if (route.lesson) { S.last = route.lesson.fid; ls(route.lesson.fid).seen = 1; save(); }
  }
  window.addEventListener('hashchange', go);
  const refreshProgress = () => renderSide(parseRoute());

  /* ---------- home ---------- */
  function renderHome() {
    const nx = nextUp(), started = totalDone() > 0 || !!S.last;
    const nProblems = order.reduce((s, l) => s + l.practice.length, 0);
    view.innerHTML = `
      <section class="hero">
        <div class="hero-text">
          <p class="eyebrow">Self-paced course · Applied mathematics</p>
          <h1 class="hero-title">Gradient</h1>
          <p class="lede">The math an applied math degree asks of you, from functions and proofs to differential equations and optimization. Each lesson explains the idea in plain English, lets you move it around, then ramps the practice from warm-up to challenge.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#${nx.fid}">${started ? 'Continue' : 'Start lesson 1'}</a>
            <span class="hero-next">${started ? 'Up next: ' : ''}<b>${nx.mod.title}</b> · ${nx.title}</span>
          </div>
          <dl class="hero-stats">
            <div><dt>Modules</dt><dd>${AM.modules.length}</dd></div>
            <div><dt>Lessons</dt><dd>${order.length}</dd></div>
            <div><dt>Problem generators</dt><dd>${nProblems}</dd></div>
          </dl>
        </div>
        <figure class="hero-viz">
          <div id="hero-plot"></div>
          <figcaption id="hero-cap">A square wave built from sine waves. Module 13 shows why this works.</figcaption>
        </figure>
      </section>
      <section class="method" aria-labelledby="method-h">
        <h2 id="method-h" class="section-h">How every lesson runs</h2>
        <ol class="method-steps">
          <li><b>The idea</b><span>What it means, without symbols.</span></li>
          <li><b>Plain English</b><span>An everyday situation where it shows up.</span></li>
          <li><b>See it</b><span>A visual you can drag and adjust.</span></li>
          <li><b>The math</b><span>The definitions and formulas you'll be tested on.</span></li>
          <li><b>Worked example</b><span>Step by step, revealed one step at a time.</span></li>
          <li><b>Practice</b><span>Warm-up, Core, Challenge. New numbers every time.</span></li>
        </ol>
      </section>
      <section class="map" aria-labelledby="map-h">
        <h2 id="map-h" class="section-h">Course map</h2>
        <p class="map-note">Stages run in order of difficulty. Inside a stage, modules list what they build on, so you can see the dependencies.</p>
        ${STAGES.map((st) => {
          const ms = AM.modules.filter((m) => m.stage === st.n);
          if (!ms.length) return '';
          return `<div class="stage" data-stage="${st.n}">
            <div class="stage-head"><p class="stage-num">Stage ${st.n}</p><h3>${st.name}</h3><p>${st.note}</p><div class="ramp" aria-hidden="true">${[0, 1, 2, 3, 4].map((i) => `<i class="${i <= st.n ? 'on' : ''}"></i>`).join('')}</div></div>
            <div class="mod-grid">${ms.map((m) => modCard(m)).join('')}</div>
          </div>`;
        }).join('')}
      </section>`;
    heroViz($('#hero-plot'));
  }
  function modCard(m) {
    const d = modDone(m), n = m.lessons.length;
    const pre = (m.prereq || []).map((id) => mods.get(id)).filter(Boolean);
    return `<a class="mod-card${d === n ? ' complete' : ''}" href="#${m.id}">
      <span class="mod-num">${pad(m.num)}</span>
      <span class="mod-title">${m.title}</span>
      <span class="mod-aka">Usually taught as: ${m.aka}</span>
      <span class="mod-lessons">${m.lessons.map((l) => l.title).join(' · ')}</span>
      <span class="mod-foot"><span class="meter sm"><span style="width:${(100 * d) / n}%"></span></span><span class="mod-frac">${d}/${n}</span>${pre.length ? `<span class="mod-pre">Builds on ${pre.map((p) => pad(p.num)).join(', ')}</span>` : '<span class="mod-pre">No prerequisites</span>'}</span>
    </a>`;
  }
  function heroViz(host) {
    const P = new AM.Plot(host, { xmin: -Math.PI * 1.05, xmax: Math.PI * 1.05, ymin: -1.5, ymax: 1.5, aspect: 0.62, ticks: false, label: 'Animated Fourier series approximating a square wave', xstep: Math.PI / 2, ystep: 0.5 });
    const cap = $('#hero-cap'); let N = 1, t = 0;
    const sq = (x) => (Math.sin(x) >= 0 ? 1 : -1);
    const four = (x, n) => { let s = 0; for (let k = 1; k <= n; k += 2) s += Math.sin(k * x) / k; return (4 / Math.PI) * s; };
    const draw = () => P.draw((pl) => {
      pl.fn(sq, { color: 'muted', width: 1.5, dash: [4, 4] });
      for (let k = 1; k <= Math.min(N, 5); k += 2) pl.fn((x) => (4 / Math.PI) * Math.sin(k * x) / k, { color: 3, width: 1.2, alpha: 0.5 });
      pl.fn((x) => four(x, N), { color: 1, width: 2.75 });
      pl.text(`${(N + 1) / 2} sine wave${N > 1 ? 's' : ''}`, pl.v.xmin, 1.32, { dx: 10, color: 'ink', size: 13, weight: 600 });
    });
    const a = AM.animate(host, (dt) => {
      t += dt; if (t > 0.9) { t = 0; N = N >= 29 ? 1 : N + 2; draw(); }
    });
    if (AM.reducedMotion()) { N = 9; } else a.start();
    draw();
    cap.textContent = 'A square wave built from sine waves, one at a time. Module 13 shows why this works.';
  }

  /* ---------- module page ---------- */
  function renderModule(m) {
    const st = STAGES[m.stage];
    const pre = (m.prereq || []).map((id) => mods.get(id)).filter(Boolean);
    view.innerHTML = `
      <header class="page-head">
        <p class="eyebrow">Module ${pad(m.num)} · Stage ${st.n}, ${st.name}</p>
        <h1>${m.title}</h1>
        <p class="aka">Usually taught as: <b>${m.aka}</b></p>
        <div class="lede">${md(m.blurb)}</div>
        ${pre.length ? `<p class="prereq">Builds on ${pre.map((p) => `<a href="#${p.id}">${pad(p.num)} ${p.title}</a>`).join(', ')}</p>` : ''}
      </header>
      <ol class="lesson-list">${m.lessons.map((l) => `
        <li><a href="#${l.fid}" class="lesson-row${done(l.fid) ? ' complete' : ''}">
          <span class="ln">${m.num}.${l.num}</span>
          <span class="lt"><b>${l.title}</b><span>${mdi(l.summary || '')}</span></span>
          <span class="lmeta"><span class="tiers" aria-label="${tiersDone(l.fid)} of 3 practice levels solved">${[0, 1, 2].map((i) => `<i class="${S.lessons[l.fid] && S.lessons[l.fid].tiers[i] ? 'on' : ''}"></i>`).join('')}</span><span>${l.minutes || 25} min</span></span>
        </a></li>`).join('')}
        <li><a href="#${m.id}-checkpoint" class="lesson-row cp-row"><span class="ln">✓</span><span class="lt"><b>Module checkpoint</b><span>Six mixed Core and Challenge problems from this module.${S.checks[m.id] != null ? ` Best score: ${S.checks[m.id]}/6.` : ''}</span></span><span class="lmeta"><span>15 min</span></span></a></li>
      </ol>`;
  }

  /* ---------- lesson page ---------- */
  function section(key, inner, cls = '') {
    const s = el('section', 'lsec ' + cls); s.dataset.sec = key;
    s.innerHTML = `<h2 class="lsec-h">${SECTION[key]}</h2>`;
    if (typeof inner === 'string') s.insertAdjacentHTML('beforeend', inner); else if (inner) s.appendChild(inner);
    return s;
  }
  function renderLesson(l) {
    const m = l.mod, idx = order.indexOf(l), prev = order[idx - 1], next = order[idx + 1];
    const head = el('header', 'page-head lesson-head');
    head.innerHTML = `
      <p class="eyebrow">Lesson ${m.num}.${l.num} · ${m.title}</p>
      <h1>${l.title}</h1>
      <div class="lesson-meta"><span>${l.minutes || 25} min</span><span>Stage ${m.stage}: ${STAGES[m.stage].name}</span><span class="tiers-inline" id="lesson-tiers"></span></div>`;
    view.appendChild(head);
    const updateTiers = () => {
      const t = (S.lessons[l.fid] && S.lessons[l.fid].tiers) || [0, 0, 0];
      $('#lesson-tiers').innerHTML = t.map((v, i) => `<span class="tchip${v ? ' on' : ''}">${TIERS[i]}${v ? ' ✓' : ''}</span>`).join('');
    };
    updateTiers();

    view.appendChild(section('idea', md(l.idea), 'idea'));
    view.appendChild(section('everyday', `<div class="everyday">${md(l.everyday)}</div>`));
    if (l.visual) {
      const fig = el('figure', 'viz');
      const host = el('div', 'viz-host'); fig.appendChild(host);
      if (l.visual.caption) fig.appendChild(el('figcaption', 'viz-cap', `<b>Try this.</b> ${mdi(l.visual.caption)}`));
      const s = section('visual', fig, 'visual'); view.appendChild(s);
      const mount = AM.widgets[l.visual.widget];
      try {
        if (!mount) throw new Error(`no visual named "${l.visual.widget}"`);
        mount(host, l.visual.opts || {}, { id: l.fid, ui: AM.ui.scope(l.fid) });
      } catch (e) {
        host.innerHTML = `<p class="err">This visual could not start (${e.message}). The rest of the lesson still works.</p>`;
        if (window.console) window.console.error(e);
      }
    }
    view.appendChild(section('math', `<div class="mathbox">${md(l.math)}</div>`));
    if (l.example) view.appendChild(section('example', workedExample(l)));
    if (l.pitfalls && l.pitfalls.length) view.appendChild(section('pitfalls', `<ul class="pitfalls">${l.pitfalls.map((p) => `<li>${mdi(p)}</li>`).join('')}</ul>`));

    const prac = el('div', 'practice');
    prac.appendChild(el('p', 'practice-note', 'Three levels. Each one gives fresh numbers when you ask for a new problem. Solve a level without opening its solution to mark it complete.'));
    l.practice.forEach((item, i) => practiceCard(prac, item, `${l.fid}-p${i + 1}`, (ok, revealed) => {
      if (ok && !revealed) { const st = ls(l.fid); st.tiers[i] = 1; save(); updateTiers(); refreshProgress(); }
    }));
    view.appendChild(section('practice', prac, 'practice-sec'));
    if (l.usedIn) view.appendChild(section('usedIn', `<div class="usedin">${md(l.usedIn)}</div>`));

    const nav = el('nav', 'pager'); nav.setAttribute('aria-label', 'Lesson navigation');
    nav.innerHTML = `${prev ? `<a href="#${prev.fid}" class="pg prev"><span>Previous</span><b>${prev.title}</b></a>` : '<span></span>'}
      ${next ? `<a href="#${next.fid}" class="pg next"><span>${next.mod === m ? 'Next' : 'Next module'}</span><b>${next.title}</b></a>` : `<a href="#home" class="pg next"><span>Finished</span><b>Back to the course map</b></a>`}`;
    view.appendChild(nav);
  }

  function workedExample(l) {
    const ex = l.example, box = el('div', 'example');
    box.innerHTML = `<div class="ex-problem">${md(ex.problem)}</div><ol class="ex-steps"></ol><div class="ex-actions"></div>`;
    const ol = box.querySelector('.ex-steps'), act = box.querySelector('.ex-actions');
    ex.steps.forEach((s, i) => { const li = el('li', 'ex-step', md(s)); li.hidden = i > 0; ol.appendChild(li); });
    let shown = 1;
    const nextB = el('button', 'btn btn-sm', 'Show next step'); nextB.type = 'button'; nextB.id = `${l.fid}-ex-next`;
    const allB = el('button', 'btn btn-sm btn-ghost', 'Show all steps'); allB.type = 'button'; allB.id = `${l.fid}-ex-all`;
    const sync = () => { const lis = ol.children; for (let i = 0; i < lis.length; i++) lis[i].hidden = i >= shown; if (shown >= ex.steps.length) { nextB.hidden = true; allB.hidden = true; } };
    nextB.addEventListener('click', () => { shown++; sync(); });
    allB.addEventListener('click', () => { shown = ex.steps.length; sync(); });
    act.append(nextB, allB); sync();
    return box;
  }

  /* ---------- practice engine ---------- */
  const placeholders = { num: 'e.g. 3/4, 0.75, sqrt(2), pi/3', fn: 'e.g. 3x^2 + 2x, e^(2x), sin(x)/x', vec: 'e.g. 2, -3' };
  function practiceCard(host, item, cid, onResult) {
    const lvl = item.level || 1;
    const card = el('article', `pcard lvl-${lvl}`);
    card.innerHTML = `
      <header class="pcard-h"><span class="tier" aria-label="Difficulty ${lvl} of 3"><span class="pips">${[1, 2, 3].map((i) => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('')}</span>${TIERS[lvl - 1]}</span><span class="pstatus" aria-live="polite"></span></header>
      <div class="pq"></div>
      <form class="pform" autocomplete="off"></form>
      <div class="pfeedback" aria-live="polite"></div>
      <div class="phint" hidden></div>
      <div class="psol" hidden></div>`;
    host.appendChild(card);
    const q = card.querySelector('.pq'), form = card.querySelector('.pform'), fb = card.querySelector('.pfeedback');
    const hint = card.querySelector('.phint'), sol = card.querySelector('.psol'), status = card.querySelector('.pstatus');
    let seed = (Math.random() * 2 ** 31) | 0, prob, attempts, revealed, solved;

    function load() {
      attempts = 0; revealed = false; solved = false;
      try { prob = item.gen(AM.rng(seed)); } catch (e) { q.innerHTML = `<p class="err">Problem generator error: ${e.message}</p>`; return; }
      q.innerHTML = md(prob.q);
      fb.textContent = ''; fb.className = 'pfeedback'; status.textContent = ''; card.classList.remove('is-solved');
      hint.hidden = true; hint.innerHTML = prob.hint ? `<b>Hint.</b> ${mdi(prob.hint)}` : '';
      sol.hidden = true;
      const steps = Array.isArray(prob.sol) ? prob.sol : prob.sol ? [prob.sol] : [];
      sol.innerHTML = `<p class="psol-h">Solution</p><ol>${steps.map((s) => `<li>${md(s)}</li>`).join('')}</ol><p class="psol-ans"><b>Answer:</b> ${mdi(AM.answerTex(prob.ans))}</p>`;
      buildForm();
    }
    function buildForm() {
      const a = prob.ans; const iid = `${cid}-in`;
      if (a.type === 'mc') {
        form.innerHTML = `<fieldset class="mc"><legend class="sr">Choose one answer</legend>${a.choices.map((c, i) => `<label class="mc-opt"><input type="radio" name="${cid}-mc" id="${cid}-mc${i}" value="${i}"><span>${mdi(c)}</span></label>`).join('')}</fieldset>`;
      } else {
        form.innerHTML = `<div class="pin-row">${a.prefix ? `<span class="pin-pre">${mdi(a.prefix)}</span>` : ''}<input class="pin" id="${iid}" type="text" inputmode="text" spellcheck="false" autocapitalize="off" placeholder="${a.placeholder || placeholders[a.type] || ''}" aria-label="Your answer">${a.unit ? `<span class="pin-unit">${mdi(a.unit)}</span>` : ''}</div><div class="ppreview" aria-hidden="true"></div>`;
        const inp = form.querySelector('input'), pv = form.querySelector('.ppreview');
        inp.addEventListener('input', () => {
          const v = inp.value.trim().replace(/^.*=/, '');
          if (!v) { pv.innerHTML = ''; return; }
          try {
            const vars = a.type === 'fn' ? a.vars || ['x'] : [];
            const parts = a.type === 'vec' ? v.replace(/^[\s([{]+|[\s)\]}]+$/g, '').split(/[,;]/) : [v];
            pv.innerHTML = 'Reads as ' + AM.tex(parts.map((p) => AM.exprTex(p, vars)).join(',\\ '));
          } catch (e) { pv.textContent = ''; }
        });
      }
      const row = el('div', 'pactions');
      row.innerHTML = `<button class="btn btn-primary btn-sm" type="submit" id="${cid}-check">Check</button>
        ${prob.hint ? `<button class="btn btn-sm btn-ghost" type="button" data-act="hint" id="${cid}-hint">Hint</button>` : ''}
        <button class="btn btn-sm btn-ghost" type="button" data-act="sol" id="${cid}-sol">Show solution</button>
        <button class="btn btn-sm btn-ghost" type="button" data-act="new" id="${cid}-new">New problem</button>`;
      form.appendChild(row);
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const a = prob.ans;
      const val = a.type === 'mc' ? (form.querySelector('input[type=radio]:checked') || {}).value : form.querySelector('.pin').value;
      if (val == null || val === '') { fb.className = 'pfeedback warn'; fb.textContent = a.type === 'mc' ? 'Pick an option first.' : 'Type an answer first.'; return; }
      const res = AM.checkAnswer(a, val);
      if (res.ok) {
        fb.className = 'pfeedback good';
        fb.innerHTML = revealed ? 'Correct. You opened the solution, so try a new problem to mark this level complete.' : 'Correct.';
        if (!solved) { solved = true; card.classList.add('is-solved'); status.textContent = revealed ? 'Checked' : 'Solved'; onResult && onResult(true, revealed); }
      } else {
        attempts++;
        fb.className = 'pfeedback bad';
        fb.textContent = res.parseError ? res.msg : `Not quite.${res.msg ? ' ' + res.msg : ''}${attempts >= 2 ? (prob.hint && hint.hidden ? ' Open the hint for a nudge.' : ' Open the solution to see the method, then try a new problem.') : ' Try again.'}`;
        onResult && onResult(false, revealed);
      }
    });
    form.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'hint') hint.hidden = !hint.hidden;
      if (act === 'sol') { sol.hidden = !sol.hidden; if (!sol.hidden) { revealed = true; } b.textContent = sol.hidden ? 'Show solution' : 'Hide solution'; }
      if (act === 'new') { seed = (seed * 1103515245 + 12345) & 0x7fffffff; load(); }
    });
    load();
    return card;
  }

  /* ---------- module checkpoint ---------- */
  function renderCheckpoint(m) {
    view.innerHTML = `<header class="page-head"><p class="eyebrow">Module ${pad(m.num)} checkpoint</p><h1>${m.title}: checkpoint</h1>
      <div class="lede"><p>Six problems drawn from the Core and Challenge levels of this module. A problem counts toward your score if you solve it before opening its solution.</p></div>
      <p class="score" id="cp-score" aria-live="polite"></p></header>`;
    const wrap = el('div', 'practice cp'); view.appendChild(wrap);
    const pool = []; m.lessons.forEach((l) => l.practice.forEach((p) => { if ((p.level || 1) >= 2) pool.push({ p, l }); }));
    const picks = []; const shuffled = pool.slice().sort(() => Math.random() - 0.5);
    for (let i = 0; i < 6 && shuffled.length; i++) picks.push(shuffled[i % shuffled.length]);
    let score = 0; const scored = new Set();
    const showScore = () => { $('#cp-score').innerHTML = `Score <b>${score}</b> / ${picks.length}${S.checks[m.id] != null ? ` · Best ${S.checks[m.id]} / 6` : ''}`; };
    picks.forEach(({ p, l }, i) => {
      const lab = el('p', 'cp-from', `From lesson ${m.num}.${l.num}, <a href="#${l.fid}">${l.title}</a>`); wrap.appendChild(lab);
      practiceCard(wrap, p, `${m.id}-cp${i + 1}`, (ok, revealed) => {
        if (ok && !revealed && !scored.has(i)) { scored.add(i); score++; if (score > (S.checks[m.id] || 0)) { S.checks[m.id] = score; save(); } showScore(); }
      });
    });
    const again = el('p', 'cp-again', `<a class="btn" href="#${m.id}">Back to module</a> <button class="btn btn-ghost" type="button" id="${m.id}-cp-retake">New checkpoint</button>`);
    wrap.appendChild(again);
    again.querySelector('button').addEventListener('click', () => { view.innerHTML = ''; renderCheckpoint(m); AM.cleanup(); window.scrollTo(0, 0); });
    showScore();
  }

  AM.app = { go, lessons, order, mods };
  go();
})();
