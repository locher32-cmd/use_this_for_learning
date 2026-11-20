/* Gradient — app shell: routing, course map, lesson pages, practice engine, spaced review,
   exam builder, progress dashboard, search and progress export. */
(function () {
  'use strict';
  const AM = window.AM, el = AM.el, md = AM.md, mdi = AM.mdi;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const STAGES = [
    { n: 0, name: 'Foundations', note: 'High-school tools, tightened up to university standard.' },
    { n: 1, name: 'Year 1 core', note: 'Calculus and linear algebra, the language for everything after.' },
    { n: 2, name: 'Year 2 core', note: 'Many variables, change over time, and uncertainty.' },
    { n: 3, name: 'Upper division', note: 'Rigor, computation and the complex plane.' },
    { n: 4, name: 'Advanced applied', note: 'Waves, heat, optimization and models of the real world.' },
    { n: 5, name: 'Specialist topics', note: 'Graduate-flavoured tools: numerical linear algebra, stochastic processes and variational methods.' },
  ];
  const TIERS = ['Warm-up', 'Core', 'Challenge', 'Exam'];
  const SECTION = { idea: 'The idea', everyday: 'In plain English', visual: 'See it', math: 'The math', example: 'Worked example', pitfalls: 'Watch out for', practice: 'Practice', usedIn: 'Where you will use this' };
  const DAY = 86400000, BOX_DAYS = [0, 1, 3, 7, 16, 35, 90];

  /* ---------- index ---------- */
  const lessons = new Map(), order = [], mods = new Map();
  AM.modules.forEach((m, mi) => {
    m.num = mi + 1; mods.set(m.id, m);
    m.lessons.forEach((l, li) => { l.fid = `${m.id}-${l.id}`; l.mod = m; l.num = li + 1; lessons.set(l.fid, l); order.push(l); });
  });
  // exam-level problems registered separately (js/content/exam-*.js) are attached as the 4th tier
  (AM.examProblems || []).forEach(([fid, gen]) => { const l = lessons.get(fid); if (l && !l.practice.some((p) => p.level === 4)) l.practice.push({ level: 4, gen }); });
  const pad = (n) => String(n).padStart(2, '0');
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

  /* ---------- progress state ---------- */
  const S = AM.store.load();
  ['lessons', 'checks', 'stats', 'srs', 'days'].forEach((k) => { S[k] = S[k] || {}; });
  S.exams = S.exams || [];
  Object.values(S.lessons).forEach((v) => { while (v.tiers.length < 4) v.tiers.push(0); });
  const save = () => {
    AM.store.save(S);
    // desktop app: keep a dated backup file once a day
    if (window.desktop && window.desktop.autoBackup && S.lastBackup !== today()) { S.lastBackup = today(); AM.store.save(S); window.desktop.autoBackup(JSON.stringify(S)).catch(() => {}); }
  };
  const ls = (fid) => (S.lessons[fid] = S.lessons[fid] || { tiers: [0, 0, 0, 0] });
  const done = (fid) => { const t = S.lessons[fid] && S.lessons[fid].tiers; return !!t && t[0] && t[1] && t[2]; };
  const tiersDone = (fid) => (S.lessons[fid] ? S.lessons[fid].tiers.filter(Boolean).length : 0);
  const modDone = (m) => m.lessons.filter((l) => done(l.fid)).length;
  const totalDone = () => order.filter((l) => done(l.fid)).length;
  const nextUp = () => {
    if (S.last && lessons.has(S.last) && !done(S.last)) return lessons.get(S.last);
    return order.find((l) => !done(l.fid)) || order[0];
  };
  const stat = (fid) => (S.stats[fid] = S.stats[fid] || { att: 0, ok: 0, miss: 0, shown: 0 });
  function recordAttempt(fid, ok, revealed) {
    const s = stat(fid); s.att++; if (ok && !revealed) s.ok++; else if (!ok) s.miss++; else s.shown++;
    S.days[today()] = (S.days[today()] || 0) + 1;
  }
  /* Spaced repetition (Leitner boxes): success moves a lesson up a box, a miss drops it back. */
  function srsUpdate(fid, success) {
    const r = S.srs[fid] || { box: 0, due: 0 };
    r.box = success ? Math.min(BOX_DAYS.length - 1, r.box + 1) : Math.max(1, r.box - 2);
    r.due = Date.now() + BOX_DAYS[r.box] * DAY - 3600000; // an hour early so "tomorrow" means tomorrow morning
    S.srs[fid] = r;
  }
  const dueList = () => Object.entries(S.srs).filter(([fid, r]) => lessons.has(fid) && r.due <= Date.now()).sort((a, b) => a[1].due - b[1].due).map(([fid]) => fid);
  function mastery(fid) {
    const t = (S.lessons[fid] && S.lessons[fid].tiers) || [0, 0, 0, 0], s = S.stats[fid], r = S.srs[fid];
    const tierScore = t[0] * 0.15 + t[1] * 0.25 + t[2] * 0.3 + t[3] * 0.3;
    const acc = s && s.att >= 3 ? s.ok / s.att : tierScore;
    return Math.min(1, 0.6 * tierScore + 0.25 * Math.min(1, (r ? r.box : 0) / 4) + 0.15 * acc);
  }
  const modMastery = (m) => m.lessons.reduce((a, l) => a + mastery(l.fid), 0) / m.lessons.length;
  function streak() {
    let n = 0; const d = new Date();
    if (!S.days[today()]) d.setDate(d.getDate() - 1);
    for (;;) { const k = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; if (!S.days[k]) break; n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function weakSpots(k = 6) {
    return order.filter((l) => S.stats[l.fid] && S.stats[l.fid].att >= 2)
      .map((l) => { const s = S.stats[l.fid]; return { l, acc: s.ok / s.att, s }; })
      .filter((w) => w.acc < 0.8).sort((a, b) => a.acc - b.acc).slice(0, k);
  }

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
        <nav class="side-tools" id="side-tools" aria-label="Study tools"></nav>
        <div class="side-search"><label for="side-q" class="sr">Search lessons</label><input id="side-q" type="search" placeholder="Search lessons…" autocomplete="off"><div id="side-results" class="side-results" hidden></div></div>
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

  /* search */
  const q = $('#side-q'), results = $('#side-results');
  const searchIndex = order.map((l) => ({ l, text: `${l.title} ${l.summary || ''} ${l.mod.title} ${l.mod.aka}`.toLowerCase() }));
  q.addEventListener('input', () => {
    const s = q.value.trim().toLowerCase();
    if (!s) { results.hidden = true; return; }
    const words = s.split(/\s+/), hits = searchIndex.filter((x) => words.every((w) => x.text.includes(w))).slice(0, 8);
    results.hidden = false;
    results.innerHTML = hits.length ? hits.map(({ l }) => `<a href="#${l.fid}"><b>${esc(l.title)}</b><span>${l.mod.num}.${l.num} · ${esc(l.mod.title)}</span></a>`).join('') : '<p>No lessons match.</p>';
  });
  results.addEventListener('click', (e) => { if (e.target.closest('a')) { q.value = ''; results.hidden = true; } });

  function renderSide(route) {
    const activeMod = route.mod ? route.mod.id : null, due = dueList().length;
    $('#side-progress').innerHTML = `<div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${order.length}" aria-valuenow="${totalDone()}" aria-label="Lessons completed"><span style="width:${(100 * totalDone()) / order.length}%"></span></div><p><b>${totalDone()}</b> of ${order.length} lessons complete</p>`;
    $('#side-tools').innerHTML = `
      <a href="#review" class="tool${route.page === 'review' ? ' active' : ''}">Daily review<span class="badge${due ? ' on' : ''}">${due}</span></a>
      <a href="#exam" class="tool${route.page === 'exam' ? ' active' : ''}">Exam builder</a>
      <a href="#progress" class="tool${route.page === 'progress' ? ' active' : ''}">Progress & weak spots</a>`;
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
    if (route.page) { c.innerHTML = `<a href="#home">Map</a><span aria-hidden="true">/</span><span class="cur">${{ review: 'Daily review', exam: 'Exam builder', progress: 'Progress' }[route.page]}</span>`; return; }
    const m = route.mod;
    c.innerHTML = `<a href="#home">Map</a><span aria-hidden="true">/</span><a href="#${m.id}">${pad(m.num)} ${m.title}</a>${route.lesson ? `<span aria-hidden="true">/</span><span class="cur">${route.lesson.title}</span>` : route.check ? '<span aria-hidden="true">/</span><span class="cur">Checkpoint</span>' : ''}`;
  }

  /* ---------- routing ---------- */
  function parseRoute() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (['review', 'exam', 'progress'].includes(h)) return { page: h };
    if (lessons.has(h)) { const l = lessons.get(h); return { lesson: l, mod: l.mod }; }
    if (mods.has(h)) return { mod: mods.get(h) };
    if (h.endsWith('-checkpoint') && mods.has(h.slice(0, -11))) return { mod: mods.get(h.slice(0, -11)), check: true };
    return { home: true };
  }
  let timer = null;
  function go() {
    const route = parseRoute();
    if (timer) { clearInterval(timer); timer = null; }
    view.innerHTML = '';
    if (route.home) renderHome();
    else if (route.page === 'review') renderReview();
    else if (route.page === 'exam') renderExamBuilder();
    else if (route.page === 'progress') renderProgress();
    else if (route.lesson) renderLesson(route.lesson);
    else if (route.check) renderCheckpoint(route.mod);
    else renderModule(route.mod);
    AM.cleanup();
    renderSide(route); crumbs(route); openSide(false);
    window.scrollTo(0, 0);
    document.title = route.lesson ? `${route.lesson.title} · Gradient` : route.mod ? `${route.mod.title} · Gradient` : route.page ? `${{ review: 'Review', exam: 'Exam', progress: 'Progress' }[route.page]} · Gradient` : 'Gradient Applied Math';
    if (route.lesson) { S.last = route.lesson.fid; ls(route.lesson.fid).seen = 1; save(); }
  }
  window.addEventListener('hashchange', go);
  const refreshProgress = () => renderSide(parseRoute());

  /* ---------- home ---------- */
  function renderHome() {
    const nx = nextUp(), started = totalDone() > 0 || !!S.last, due = dueList().length, weak = weakSpots(3);
    const nProblems = order.reduce((s, l) => s + l.practice.length, 0);
    view.innerHTML = `
      <section class="hero">
        <div class="hero-text">
          <p class="eyebrow">Self-paced course · Applied mathematics</p>
          <h1 class="hero-title">Gradient</h1>
          <p class="lede">The math an applied math degree asks of you, from functions and proofs to PDEs, optimization and stochastic processes. Each lesson explains the idea in plain English, lets you move it around, then ramps the practice from warm-up to exam level.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#${nx.fid}">${started ? 'Continue' : 'Start lesson 1'}</a>
            <span class="hero-next">${started ? 'Up next: ' : ''}<b>${nx.mod.title}</b> · ${nx.title}</span>
          </div>
          <dl class="hero-stats">
            <div><dt>Modules</dt><dd>${AM.modules.length}</dd></div>
            <div><dt>Lessons</dt><dd>${order.length}</dd></div>
            <div><dt>Problem types</dt><dd>${nProblems}</dd></div>
          </dl>
        </div>
        <figure class="hero-viz">
          <div id="hero-plot"></div>
          <figcaption id="hero-cap">A square wave built from sine waves, one at a time. Module 13 shows why this works.</figcaption>
        </figure>
      </section>
      ${started ? `<section class="today" aria-labelledby="today-h"><h2 id="today-h" class="section-h">Today</h2><div class="today-grid">
        <a class="today-card${due ? ' hot' : ''}" href="#review"><span class="k">${due}</span><span class="t">lesson${due === 1 ? '' : 's'} due for review</span><span class="s">${due ? 'Spaced review keeps old topics fresh. About 2 minutes each.' : 'Nothing due. Solve more lessons to schedule reviews.'}</span></a>
        <a class="today-card" href="#progress"><span class="k">${streak()}</span><span class="t">day streak</span><span class="s">${Math.round(100 * order.reduce((a, l) => a + mastery(l.fid), 0) / order.length)}% average mastery across the course.</span></a>
        <a class="today-card" href="${weak.length ? '#' + weak[0].l.fid : '#exam'}"><span class="k">${weak.length || '✓'}</span><span class="t">${weak.length ? 'weak spot' + (weak.length > 1 ? 's' : '') : 'no weak spots yet'}</span><span class="s">${weak.length ? `Weakest: ${esc(weak[0].l.title)} (${Math.round(weak[0].acc * 100)}% correct).` : 'Try a mixed exam to find them.'}</span></a>
      </div></section>` : ''}
      <section class="method" aria-labelledby="method-h">
        <h2 id="method-h" class="section-h">How every lesson runs</h2>
        <ol class="method-steps">
          <li><b>The idea</b><span>What it means, without symbols.</span></li>
          <li><b>Plain English</b><span>An everyday situation where it shows up.</span></li>
          <li><b>See it</b><span>A visual you can drag and adjust.</span></li>
          <li><b>The math</b><span>The definitions and formulas you'll be tested on.</span></li>
          <li><b>Worked example</b><span>Step by step, revealed one step at a time.</span></li>
          <li><b>Practice</b><span>Warm-up, Core, Challenge, Exam. New numbers every time.</span></li>
        </ol>
      </section>
      <section class="map" aria-labelledby="map-h">
        <h2 id="map-h" class="section-h">Course map</h2>
        <p class="map-note">Stages run in order of difficulty. Modules list what they build on, and the bar on each card is your mastery.</p>
        ${STAGES.map((st) => {
          const ms = AM.modules.filter((m) => m.stage === st.n);
          if (!ms.length) return '';
          return `<div class="stage" data-stage="${st.n}">
            <div class="stage-head"><p class="stage-num">Stage ${st.n}</p><h3>${st.name}</h3><p>${st.note}</p><div class="ramp" aria-hidden="true">${[0, 1, 2, 3, 4, 5].map((i) => `<i class="${i <= st.n ? 'on' : ''}"></i>`).join('')}</div></div>
            <div class="mod-grid">${ms.map((m) => modCard(m)).join('')}</div>
          </div>`;
        }).join('')}
      </section>`;
    heroViz($('#hero-plot'));
  }
  function modCard(m) {
    const d = modDone(m), n = m.lessons.length, mm = modMastery(m);
    const pre = (m.prereq || []).map((id) => mods.get(id)).filter(Boolean);
    return `<a class="mod-card${d === n ? ' complete' : ''}" href="#${m.id}">
      <span class="mod-num">${pad(m.num)}</span>
      <span class="mod-title">${m.title}</span>
      <span class="mod-aka">Usually taught as: ${m.aka}</span>
      <span class="mod-lessons">${m.lessons.map((l) => l.title).join(' · ')}</span>
      <span class="mod-foot"><span class="meter sm" title="Mastery ${Math.round(mm * 100)}%"><span style="width:${mm * 100}%"></span></span><span class="mod-frac">${d}/${n}</span>${pre.length ? `<span class="mod-pre">Builds on ${pre.map((p) => pad(p.num)).join(', ')}</span>` : '<span class="mod-pre">No prerequisites</span>'}</span>
    </a>`;
  }
  function heroViz(host) {
    const PI = Math.PI;
    const P = new AM.Plot(host, { xmin: -PI * 1.05, xmax: PI * 1.05, ymin: -1.5, ymax: 1.5, aspect: 0.62, ticks: false, label: 'Animated Fourier series approximating a square wave', xstep: PI / 2, ystep: 0.5 });
    let N = 1, t = 0;
    const sq = (x) => (Math.sin(x) >= 0 ? 1 : -1);
    const four = (x, n) => { let s = 0; for (let k = 1; k <= n; k += 2) s += Math.sin(k * x) / k; return (4 / PI) * s; };
    const draw = () => P.draw((pl) => {
      pl.fn(sq, { color: 'muted', width: 1.5, dash: [4, 4] });
      for (let k = 1; k <= Math.min(N, 5); k += 2) pl.fn((x) => (4 / PI) * Math.sin(k * x) / k, { color: 3, width: 1.2, alpha: 0.5 });
      pl.fn((x) => four(x, N), { color: 1, width: 2.75 });
      pl.text(`${(N + 1) / 2} sine wave${N > 1 ? 's' : ''}`, pl.v.xmin, 1.32, { dx: 10, color: 'ink', size: 13, weight: 600 });
    });
    const a = AM.animate(host, (dt) => { t += dt; if (t > 0.9) { t = 0; N = N >= 29 ? 1 : N + 2; draw(); } });
    if (AM.reducedMotion()) N = 9; else a.start();
    draw();
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
        <p class="prereq">Mastery: <b>${Math.round(modMastery(m) * 100)}%</b></p>
      </header>
      <ol class="lesson-list">${m.lessons.map((l) => `
        <li><a href="#${l.fid}" class="lesson-row${done(l.fid) ? ' complete' : ''}">
          <span class="ln">${m.num}.${l.num}</span>
          <span class="lt"><b>${l.title}</b><span>${mdi(l.summary || '')}</span></span>
          <span class="lmeta"><span class="tiers" aria-label="${tiersDone(l.fid)} of ${l.practice.length} practice levels solved">${l.practice.map((p, i) => `<i class="${S.lessons[l.fid] && S.lessons[l.fid].tiers[i] ? 'on' : ''}${i === 3 ? ' x' : ''}"></i>`).join('')}</span><span>${l.minutes || 25} min</span></span>
        </a></li>`).join('')}
        <li><a href="#${m.id}-checkpoint" class="lesson-row cp-row"><span class="ln">✓</span><span class="lt"><b>Module checkpoint</b><span>Six mixed Core, Challenge and Exam problems from this module.${S.checks[m.id] != null ? ` Best score: ${S.checks[m.id]}/6.` : ''}</span></span><span class="lmeta"><span>15 min</span></span></a></li>
      </ol>`;
  }

  /* ---------- lesson page ---------- */
  function section(key, inner, cls = '') {
    const s = el('section', 'lsec ' + cls); s.dataset.sec = key;
    s.innerHTML = `<h2 class="lsec-h">${SECTION[key]}</h2>`;
    if (typeof inner === 'string') s.insertAdjacentHTML('beforeend', inner); else if (inner) s.appendChild(inner);
    return s;
  }
  function mountVisual(host, l) {
    const mount = AM.widgets[l.visual.widget];
    try {
      if (!mount) throw new Error(`no visual named "${l.visual.widget}"`);
      mount(host, l.visual.opts || {}, { id: l.fid, ui: AM.ui.scope(l.fid) });
    } catch (e) {
      host.innerHTML = `<p class="err">This visual could not start (${esc(e.message)}). The rest of the lesson still works.</p>`;
      if (window.console) window.console.error(e);
    }
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
      const t = (S.lessons[l.fid] && S.lessons[l.fid].tiers) || [0, 0, 0, 0];
      $('#lesson-tiers').innerHTML = l.practice.map((p, i) => `<span class="tchip${t[i] ? ' on' : ''}${i === 3 ? ' x' : ''}">${TIERS[i]}${t[i] ? ' ✓' : ''}</span>`).join('');
    };
    updateTiers();

    view.appendChild(section('idea', md(l.idea), 'idea'));
    view.appendChild(section('everyday', `<div class="everyday">${md(l.everyday)}</div>`));
    if (l.visual) {
      const fig = el('figure', 'viz'), host = el('div', 'viz-host'); fig.appendChild(host);
      if (l.visual.caption) fig.appendChild(el('figcaption', 'viz-cap', `<b>Try this.</b> ${mdi(l.visual.caption)}`));
      view.appendChild(section('visual', fig, 'visual'));
      mountVisual(host, l);
    }
    view.appendChild(section('math', `<div class="mathbox">${md(l.math)}</div>`));
    if (l.example) view.appendChild(section('example', workedExample(l)));
    if (l.pitfalls && l.pitfalls.length) view.appendChild(section('pitfalls', `<ul class="pitfalls">${l.pitfalls.map((p) => `<li>${mdi(p)}</li>`).join('')}</ul>`));

    const prac = el('div', 'practice');
    prac.appendChild(el('p', 'practice-note', `${l.practice.length} levels, each with fresh numbers whenever you ask for a new problem. Solve Warm-up, Core and Challenge without opening their solutions to complete the lesson${l.practice.length > 3 ? '; the Exam level is university exam difficulty and counts toward mastery' : ''}. Solved lessons come back in your daily review.`));
    l.practice.forEach((item, i) => practiceCard(prac, item, `${l.fid}-p${i + 1}`, (ok, revealed) => {
      recordAttempt(l.fid, ok, revealed);
      if (ok && !revealed) {
        const st = ls(l.fid), first = !st.tiers[i]; st.tiers[i] = 1;
        if (first && !S.srs[l.fid]) srsUpdate(l.fid, true);
        updateTiers(); refreshProgress();
      }
      save();
    }));
    view.appendChild(section('practice', prac, 'practice-sec'));
    if (l.usedIn) view.appendChild(section('usedIn', `<div class="usedin">${md(l.usedIn)}</div>`));

    const nav = el('nav', 'pager'); nav.setAttribute('aria-label', 'Lesson navigation');
    nav.innerHTML = `${prev ? `<a href="#${prev.fid}" class="pg prev"><span>Previous</span><b>${prev.title}</b></a>` : '<span></span>'}
      ${next ? `<a href="#${next.fid}" class="pg next"><span>${next.mod === m ? 'Next' : 'Next module'}</span><b>${next.title}</b></a>` : '<a href="#home" class="pg next"><span>Finished</span><b>Back to the course map</b></a>'}`;
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
  /* opts.exam: no Check/Hint/Solution until card.grade() is called by the exam page. */
  function practiceCard(host, item, cid, onResult, opts = {}) {
    const lvl = item.level || 1;
    const card = el('article', `pcard lvl-${lvl}`);
    card.innerHTML = `
      <header class="pcard-h"><span class="tier" aria-label="Difficulty ${lvl} of 4"><span class="pips">${[1, 2, 3, 4].map((i) => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('')}</span>${TIERS[lvl - 1]}</span><span class="pstatus" aria-live="polite"></span></header>
      ${opts.label ? `<p class="cp-from">${opts.label}</p>` : ''}
      <div class="pq"></div>
      <form class="pform" autocomplete="off"></form>
      <div class="pfeedback" aria-live="polite"></div>
      <div class="phint" hidden></div>
      <div class="psol" hidden></div>`;
    host.appendChild(card);
    const qEl = card.querySelector('.pq'), form = card.querySelector('.pform'), fb = card.querySelector('.pfeedback');
    const hint = card.querySelector('.phint'), sol = card.querySelector('.psol'), status = card.querySelector('.pstatus');
    let seed = opts.seed ?? (Math.random() * 2 ** 31) | 0, prob, attempts, revealed, solved;

    function load() {
      attempts = 0; revealed = false; solved = false;
      try { prob = item.gen(AM.rng(seed)); } catch (e) { qEl.innerHTML = `<p class="err">Problem generator error: ${esc(e.message)}</p>`; return; }
      card._prob = prob; // used by the automated browser test to answer correctly
      qEl.innerHTML = md(prob.q);
      fb.textContent = ''; fb.className = 'pfeedback'; status.textContent = ''; card.classList.remove('is-solved', 'is-wrong');
      hint.hidden = true; hint.innerHTML = prob.hint ? `<b>Hint.</b> ${mdi(prob.hint)}` : '';
      sol.hidden = true;
      const steps = Array.isArray(prob.sol) ? prob.sol : prob.sol ? [prob.sol] : [];
      sol.innerHTML = `<p class="psol-h">Solution</p><ol>${steps.map((s) => `<li>${md(s)}</li>`).join('')}</ol><p class="psol-ans"><b>Answer:</b> ${mdi(AM.answerTex(prob.ans))}</p>`;
      buildForm();
    }
    function buildForm() {
      const a = prob.ans, iid = `${cid}-in`;
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
      if (opts.exam) return;
      const row = el('div', 'pactions');
      row.innerHTML = `<button class="btn btn-primary btn-sm" type="submit" id="${cid}-check">Check</button>
        ${prob.hint ? `<button class="btn btn-sm btn-ghost" type="button" data-act="hint" id="${cid}-hint">Hint</button>` : ''}
        <button class="btn btn-sm btn-ghost" type="button" data-act="sol" id="${cid}-sol">Show solution</button>
        ${opts.noNew ? '' : `<button class="btn btn-sm btn-ghost" type="button" data-act="new" id="${cid}-new">New problem</button>`}`;
      form.appendChild(row);
    }
    const value = () => (prob.ans.type === 'mc' ? (form.querySelector('input[type=radio]:checked') || {}).value : (form.querySelector('.pin') || {}).value);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (opts.exam) return;
      const a = prob.ans, val = value();
      if (val == null || val === '') { fb.className = 'pfeedback warn'; fb.textContent = a.type === 'mc' ? 'Pick an option first.' : 'Type an answer first.'; return; }
      const res = AM.checkAnswer(a, val);
      if (res.ok) {
        fb.className = 'pfeedback good';
        fb.innerHTML = revealed ? 'Correct. You opened the solution, so try a new problem to mark this level complete.' : 'Correct.';
        if (!solved) { solved = true; card.classList.add('is-solved'); status.textContent = revealed ? 'Checked' : 'Solved'; onResult && onResult(true, revealed); }
      } else if (res.parseError) {
        fb.className = 'pfeedback warn'; fb.textContent = res.msg;
      } else {
        attempts++;
        fb.className = 'pfeedback bad';
        fb.textContent = `Not quite.${res.msg ? ' ' + res.msg : ''}${attempts >= 2 ? (prob.hint && hint.hidden ? ' Open the hint for a nudge.' : ' Open the solution to see the method, then try a new problem.') : ' Try again.'}`;
        if (attempts === 1) onResult && onResult(false, revealed);
      }
    });
    form.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'hint') hint.hidden = !hint.hidden;
      if (act === 'sol') { sol.hidden = !sol.hidden; if (!sol.hidden) revealed = true; b.textContent = sol.hidden ? 'Show solution' : 'Hide solution'; }
      if (act === 'new') { seed = (seed * 1103515245 + 12345) & 0x7fffffff; load(); }
    });
    load();
    /* exam grading: lock the card, mark it, show the solution */
    card.grade = () => {
      const val = value(), res = val == null || val === '' ? { ok: false, msg: 'No answer.' } : AM.checkAnswer(prob.ans, val);
      form.querySelectorAll('input').forEach((i) => { i.disabled = true; });
      card.classList.add(res.ok ? 'is-solved' : 'is-wrong');
      status.textContent = res.ok ? 'Correct' : 'Incorrect'; status.classList.toggle('bad', !res.ok);
      fb.className = 'pfeedback ' + (res.ok ? 'good' : 'bad'); fb.textContent = res.ok ? 'Correct.' : `Incorrect.${res.msg ? ' ' + res.msg : ''} The worked solution is below.`;
      if (!res.ok) sol.hidden = false;
      return res.ok;
    };
    return card;
  }

  /* ---------- module checkpoint ---------- */
  function renderCheckpoint(m) {
    view.innerHTML = `<header class="page-head"><p class="eyebrow">Module ${pad(m.num)} checkpoint</p><h1>${m.title}: checkpoint</h1>
      <div class="lede"><p>Six problems drawn from the Core, Challenge and Exam levels of this module. A problem counts toward your score if you solve it before opening its solution.</p></div>
      <p class="score" id="cp-score" aria-live="polite"></p></header>`;
    const wrap = el('div', 'practice cp'); view.appendChild(wrap);
    const pool = []; m.lessons.forEach((l) => l.practice.forEach((p) => { if ((p.level || 1) >= 2) pool.push({ p, l }); }));
    const shuffled = pool.slice().sort(() => Math.random() - 0.5), picks = [];
    for (let i = 0; i < 6 && shuffled.length; i++) picks.push(shuffled[i % shuffled.length]);
    let score = 0; const scored = new Set();
    const showScore = () => { $('#cp-score').innerHTML = `Score <b>${score}</b> / ${picks.length}${S.checks[m.id] != null ? ` · Best ${S.checks[m.id]} / 6` : ''}`; };
    picks.forEach(({ p, l }, i) => {
      practiceCard(wrap, p, `${m.id}-cp${i + 1}`, (ok, revealed) => {
        recordAttempt(l.fid, ok, revealed);
        if (ok && !revealed && !scored.has(i)) { scored.add(i); score++; if (score > (S.checks[m.id] || 0)) S.checks[m.id] = score; showScore(); }
        save();
      }, { label: `From lesson ${m.num}.${l.num}, <a href="#${l.fid}">${l.title}</a>`, noNew: true });
    });
    const again = el('p', 'cp-again', `<a class="btn" href="#${m.id}">Back to module</a> <button class="btn btn-ghost" type="button" id="${m.id}-cp-retake">New checkpoint</button>`);
    wrap.appendChild(again);
    again.querySelector('button').addEventListener('click', () => { view.innerHTML = ''; renderCheckpoint(m); AM.cleanup(); window.scrollTo(0, 0); });
    showScore();
  }

  /* ---------- daily review (spaced repetition) ---------- */
  function renderReview() {
    const due = dueList().slice(0, 10), scheduled = Object.keys(S.srs).length;
    view.innerHTML = `<header class="page-head"><p class="eyebrow">Spaced repetition</p><h1>Daily review</h1>
      <div class="lede"><p>Each lesson you've solved comes back after 1, 3, 7, 16, 35 and then 90 days. Solve its review problem without the solution and the next gap gets longer; miss it and the lesson comes back sooner. A few minutes a day keeps every topic ready for exams.</p></div>
      <p class="score" id="rv-score">${due.length ? `${due.length} lesson${due.length > 1 ? 's' : ''} due today` : ''}</p></header>`;
    if (!due.length) {
      const upcoming = Object.entries(S.srs).filter(([fid]) => lessons.has(fid)).sort((a, b) => a[1].due - b[1].due)[0];
      view.insertAdjacentHTML('beforeend', `<div class="empty"><h2>Nothing due right now</h2><p>${scheduled ? `You have ${scheduled} lesson${scheduled > 1 ? 's' : ''} in rotation. Next review: <b>${lessons.get(upcoming[0]).title}</b> on ${new Date(upcoming[1].due).toLocaleDateString()}.` : 'Complete practice problems in any lesson and they will appear here on a schedule.'}</p><p><a class="btn btn-primary" href="#${nextUp().fid}">Continue the course</a> <a class="btn" href="#exam">Take a mixed exam</a></p></div>`);
      return;
    }
    const wrap = el('div', 'practice'); view.appendChild(wrap);
    let done2 = 0;
    due.forEach((fid, i) => {
      const l = lessons.get(fid), box = S.srs[fid].box, lvl = Math.min(l.practice.length, box >= 3 ? 4 : box >= 2 ? 3 : 2);
      const item = l.practice.find((p) => p.level === lvl) || l.practice[l.practice.length - 1];
      const card = practiceCard(wrap, item, `rv-${fid}`, (ok, revealed) => {
        recordAttempt(fid, ok, revealed);
        if (card.dataset.done) { save(); return; }
        card.dataset.done = '1'; done2++;
        srsUpdate(fid, ok && !revealed);
        const r = S.srs[fid];
        card.querySelector('.pstatus').textContent = ok && !revealed ? `Next review in ${BOX_DAYS[r.box]} day${BOX_DAYS[r.box] > 1 ? 's' : ''}` : 'Back tomorrow';
        $('#rv-score').textContent = `${done2} of ${due.length} reviewed`;
        save(); refreshProgress();
      }, { label: `Review: lesson ${l.mod.num}.${l.num}, <a href="#${fid}">${l.title}</a> · box ${box}`, noNew: true });
    });
  }

  /* ---------- exam builder ---------- */
  function renderExamBuilder() {
    view.innerHTML = `<header class="page-head"><p class="eyebrow">Mixed practice under exam conditions</p><h1>Exam builder</h1>
      <div class="lede"><p>Pick a scope and a length. You answer everything first, with no hints and no checking, then submit to see your score, a per-module breakdown and worked solutions for anything you missed. Missed topics are pushed back into your daily review.</p></div></header>
      <form class="exam-form" id="exam-form">
        <div class="ctl ctl-select"><label for="ex-scope"><span class="ctl-label">Scope</span></label><select id="ex-scope">
          <option value="all">Whole course</option>
          <option value="done">Lessons I've started</option>
          ${STAGES.filter((st) => AM.modules.some((m) => m.stage === st.n)).map((st) => `<option value="stage-${st.n}">Stage ${st.n}: ${st.name}</option>`).join('')}
          ${AM.modules.map((m) => `<option value="mod-${m.id}">${pad(m.num)} ${esc(m.title)}</option>`).join('')}
        </select></div>
        <div class="ctl ctl-select"><label for="ex-len"><span class="ctl-label">Questions</span></label><select id="ex-len"><option>6</option><option selected>10</option><option>15</option><option>20</option><option>30</option></select></div>
        <div class="ctl ctl-select"><label for="ex-diff"><span class="ctl-label">Difficulty</span></label><select id="ex-diff"><option value="2,3">Core and Challenge</option><option value="3,4" selected>Challenge and Exam</option><option value="4">Exam level only</option><option value="1,2,3,4">Everything</option></select></div>
        <div class="ctl ctl-select"><label for="ex-time"><span class="ctl-label">Time limit</span></label><select id="ex-time"><option value="0">None</option><option value="20">20 minutes</option><option value="45">45 minutes</option><option value="90">90 minutes</option></select></div>
        <button class="btn btn-primary" type="submit" id="ex-start">Start exam</button>
      </form>
      ${S.exams.length ? `<h2 class="section-h" style="margin-top:2rem">Recent exams</h2>${examHistory(6)}` : ''}`;
    $('#exam-form').addEventListener('submit', (e) => {
      e.preventDefault();
      runExam({ scope: $('#ex-scope').value, n: +$('#ex-len').value, levels: $('#ex-diff').value.split(',').map(Number), minutes: +$('#ex-time').value, scopeLabel: $('#ex-scope').selectedOptions[0].textContent });
    });
  }
  function examHistory(k) {
    return `<div class="viz-scroll"><table class="viz-table hist"><thead><tr><th>Date</th><th>Scope</th><th>Score</th></tr></thead><tbody>${S.exams.slice(-k).reverse().map((x) => `<tr><td>${new Date(x.date).toLocaleDateString()}</td><td style="text-align:left">${esc(x.scope)}</td><td>${x.score}/${x.n} (${Math.round((100 * x.score) / x.n)}%)</td></tr>`).join('')}</tbody></table></div>`;
  }
  function runExam(cfg) {
    let pool = order;
    if (cfg.scope === 'done') pool = order.filter((l) => S.lessons[l.fid] && S.lessons[l.fid].tiers.some(Boolean));
    else if (cfg.scope.startsWith('stage-')) pool = order.filter((l) => l.mod.stage === +cfg.scope.slice(6));
    else if (cfg.scope.startsWith('mod-')) pool = order.filter((l) => l.mod.id === cfg.scope.slice(4));
    if (!pool.length) pool = order;
    const items = []; pool.forEach((l) => l.practice.forEach((p) => { if (cfg.levels.includes(p.level)) items.push({ l, p }); }));
    const shuffled = items.sort(() => Math.random() - 0.5), picks = [], usedL = new Map();
    for (const it of shuffled) { if (picks.length >= cfg.n) break; const c = usedL.get(it.l) || 0; if (c < Math.ceil(cfg.n / pool.length)) { picks.push(it); usedL.set(it.l, c + 1); } }
    for (let i = 0; picks.length < cfg.n && shuffled.length; i++) picks.push(shuffled[i % shuffled.length]);
    picks.sort((a, b) => order.indexOf(a.l) - order.indexOf(b.l));
    view.innerHTML = `<header class="page-head"><p class="eyebrow">Exam · ${esc(cfg.scopeLabel)}</p><h1>${cfg.n} questions</h1>
      <div class="lede"><p>Answer every question, then press <b>Submit exam</b> at the bottom. Nothing is marked until you submit.</p></div>
      <p class="score exam-bar" id="exam-bar"><span id="exam-timer"></span></p></header>`;
    const wrap = el('div', 'practice'); view.appendChild(wrap);
    const cards = picks.map(({ l, p }, i) => ({ l, card: practiceCard(wrap, p, `exam-${i + 1}`, null, { exam: true, label: `Question ${i + 1} · ${l.mod.num}.${l.num} ${l.title}` }) }));
    const foot = el('div', 'cp-again'); foot.innerHTML = '<button class="btn btn-primary" type="button" id="exam-submit">Submit exam</button> <a class="btn btn-ghost" href="#exam">Abandon</a>'; wrap.appendChild(foot);
    let finished = false;
    const finish = () => {
      if (finished) return; finished = true; if (timer) { clearInterval(timer); timer = null; }
      const byMod = {}; let score = 0;
      cards.forEach(({ l, card }) => {
        const ok = card.grade(); recordAttempt(l.fid, ok, false); if (ok) score++;
        const b = (byMod[l.mod.id] = byMod[l.mod.id] || [0, 0]); b[1]++; if (ok) b[0]++;
        if (!ok && S.srs[l.fid]) srsUpdate(l.fid, false); else if (!ok) { S.srs[l.fid] = { box: 1, due: Date.now() + DAY - 3600000 }; }
      });
      S.exams.push({ date: Date.now(), scope: cfg.scopeLabel, n: cards.length, score, byMod }); save(); refreshProgress();
      foot.innerHTML = `<a class="btn btn-primary" href="#exam">New exam</a> <a class="btn" href="#progress">See progress</a>`;
      const summary = el('section', 'exam-summary');
      summary.innerHTML = `<h2 class="section-h">Result: ${score} / ${cards.length} (${Math.round((100 * score) / cards.length)}%)</h2>
        <div class="viz-scroll"><table class="viz-table"><thead><tr><th style="text-align:left">Module</th><th>Correct</th></tr></thead><tbody>${Object.entries(byMod).map(([id, [a, b]]) => `<tr><td style="text-align:left"><a href="#${id}">${pad(mods.get(id).num)} ${esc(mods.get(id).title)}</a></td><td>${a}/${b}</td></tr>`).join('')}</tbody></table></div>
        <p class="practice-note">Incorrect questions now show their worked solutions, and those lessons were added to your daily review.</p>`;
      view.insertBefore(summary, wrap);
      window.scrollTo(0, 0);
    };
    $('#exam-submit').addEventListener('click', finish);
    if (cfg.minutes) {
      const end = Date.now() + cfg.minutes * 60000, t = $('#exam-timer');
      const tick = () => { const s = Math.max(0, Math.round((end - Date.now()) / 1000)); t.innerHTML = `Time left <b>${Math.floor(s / 60)}:${pad(s % 60)}</b>`; if (!s) finish(); };
      tick(); timer = setInterval(tick, 1000);
    }
  }

  /* ---------- progress dashboard ---------- */
  function renderProgress() {
    const avg = order.reduce((a, l) => a + mastery(l.fid), 0) / order.length, exSolved = order.filter((l) => S.lessons[l.fid] && S.lessons[l.fid].tiers[3]).length;
    const att = Object.values(S.stats).reduce((a, s) => a + s.att, 0), ok = Object.values(S.stats).reduce((a, s) => a + s.ok, 0), weak = weakSpots(8);
    view.innerHTML = `<header class="page-head"><p class="eyebrow">Your progress</p><h1>Progress & weak spots</h1>
      <div class="lede"><p>Mastery combines the levels you've solved, how far each lesson has advanced in spaced review, and your accuracy. It's stored in this browser (or this app) only; use the export box below to back it up or move it to another device.</p></div></header>
      <div class="kpis">
        <div><span class="k">${totalDone()}<small>/${order.length}</small></span><span class="t">lessons complete</span></div>
        <div><span class="k">${exSolved}</span><span class="t">Exam levels solved</span></div>
        <div><span class="k">${Math.round(avg * 100)}%</span><span class="t">average mastery</span></div>
        <div><span class="k">${att ? Math.round((100 * ok) / att) : 0}%</span><span class="t">first-try accuracy (${att} attempts)</span></div>
        <div><span class="k">${dueList().length}</span><span class="t">reviews due</span></div>
        <div><span class="k">${streak()}</span><span class="t">day streak</span></div>
      </div>
      <section class="lsec" style="max-width:none"><h2 class="lsec-h">Mastery by module</h2><div class="mastery">${STAGES.map((st) => {
        const ms = AM.modules.filter((m) => m.stage === st.n); if (!ms.length) return '';
        return `<p class="side-stage-label">Stage ${st.n} · ${st.name}</p>${ms.map((m) => { const v = modMastery(m); return `<a class="mrow" href="#${m.id}"><span class="mname">${pad(m.num)} ${esc(m.title)}</span><span class="mbar"><span style="width:${(v * 100).toFixed(1)}%" class="${v >= 0.75 ? 'hi' : v >= 0.35 ? 'mid' : 'lo'}"></span></span><span class="mval">${Math.round(v * 100)}%</span></a>`; }).join('')}`;
      }).join('')}</div></section>
      <section class="lsec"><h2 class="lsec-h">Weak spots</h2>${weak.length ? `<ol class="weak">${weak.map((w) => `<li><a href="#${w.l.fid}"><b>${esc(w.l.title)}</b><span>${w.l.mod.num}.${w.l.num} · ${Math.round(w.acc * 100)}% correct over ${w.s.att} attempts</span></a></li>`).join('')}</ol><p><a class="btn" href="#exam">Build an exam to retest these</a></p>` : '<p>No weak spots yet. Lessons where you get under 80% of problems right first time will show up here.</p>'}</section>
      ${S.exams.length ? `<section class="lsec"><h2 class="lsec-h">Exam history</h2>${examHistory(15)}</section>` : ''}
      <section class="lsec"><h2 class="lsec-h">Back up or move your progress</h2>
        <p class="practice-note">Copy this text somewhere safe, or paste a previous backup and press Load.${window.desktop ? ' In the desktop app you can also use File → Export progress.' : ''}</p>
        <label for="pg-data" class="sr">Progress data</label><textarea id="pg-data" class="pin datafield" rows="4" spellcheck="false">${esc(JSON.stringify(S))}</textarea>
        <p class="cp-again"><button class="btn btn-sm" type="button" id="pg-copy">Copy</button><button class="btn btn-sm" type="button" id="pg-load">Load pasted backup</button>${window.desktop ? '<button class="btn btn-sm" type="button" id="pg-save">Save to file…</button><button class="btn btn-sm" type="button" id="pg-open">Open file…</button>' : ''}<button class="btn btn-sm btn-ghost" type="button" id="pg-reset">Reset all progress</button></p>
        <p class="pfeedback" id="pg-msg" aria-live="polite"></p>
      </section>`;
    const msg = $('#pg-msg'), ta = $('#pg-data');
    $('#pg-copy').addEventListener('click', () => { const p = navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject(); p.then(() => { msg.className = 'pfeedback good'; msg.textContent = 'Copied.'; }, () => { ta.select(); msg.className = 'pfeedback warn'; msg.textContent = 'Selected: press Ctrl+C or ⌘C to copy.'; }); });
    const loadJSON = (txt) => { try { const d = JSON.parse(txt); if (!d || typeof d !== 'object' || !d.lessons) throw new Error('missing lesson data'); Object.keys(S).forEach((k) => delete S[k]); Object.assign(S, d); AM.store.save(S); location.hash = '#progress'; go(); $('#pg-msg').className = 'pfeedback good'; $('#pg-msg').textContent = 'Progress loaded.'; } catch (e) { msg.className = 'pfeedback bad'; msg.textContent = `That isn't a valid backup (${e.message}).`; } };
    $('#pg-load').addEventListener('click', () => loadJSON(ta.value));
    let armed = false;
    $('#pg-reset').addEventListener('click', (e) => { if (!armed) { armed = true; e.target.textContent = 'Press again to erase everything'; return; } Object.keys(S).forEach((k) => delete S[k]); ['lessons', 'checks', 'stats', 'srs', 'days'].forEach((k) => { S[k] = {}; }); S.exams = []; save(); go(); });
    if (window.desktop) {
      $('#pg-save').addEventListener('click', async () => { const ok2 = await window.desktop.saveProgress(JSON.stringify(S, null, 1)); msg.className = 'pfeedback ' + (ok2 ? 'good' : 'warn'); msg.textContent = ok2 ? 'Saved.' : 'Save cancelled.'; });
      $('#pg-open').addEventListener('click', async () => { const txt = await window.desktop.openProgress(); if (txt) loadJSON(txt); });
    }
  }
  if (window.desktop && window.desktop.onMenu) window.desktop.onMenu((cmd) => { if (cmd === 'progress') location.hash = '#progress'; if (cmd === 'review') location.hash = '#review'; if (cmd === 'exam') location.hash = '#exam'; });

  AM.app = { go, lessons, order, mods, state: S, mastery };
  go();
})();
