/*
 * De trainer: menu, oefenscherm, feedback en tentamens.
 *
 * Dit bestand weet niets van wiskunde. Alle inhoud komt uit het COURSE-object van het
 * inhoudsbestand dat ervoor geladen wordt, en alle voortgang gaat via Voortgang.
 * Zo kan dezelfde trainer later andere opgaven en vakken draaien.
 */
(() => {
  'use strict';
  const C = COURSE;
  const V = Voortgang.cursus(C.id);
  const $ = id => document.getElementById(id);
  const GOAL = 5; // zoveel sommen zonder hulp en een onderwerp telt als "onder de knie"
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const topicOf = id => C.topics.find(t => t.id === id) || null;
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const LEVELS = [['1', 'Basis'], ['2', 'Tentamen'], ['3', 'Pittig']];
  const MODES = [['step', 'Stap voor stap'], ['self', 'Helemaal zelf']];
  const PRAISE = ['Helemaal goed!', 'Goed zo!', 'Precies!', 'Ja, dat klopt!', 'Netjes!', 'Sterk gedaan!'];
  const NUDGE = ['Nog niet helemaal', 'Bijna!', 'Kijk nog eens'];
  const EXAMS = [...new Set(C.bank.map(b => b.ex))].sort((a, b) => a - b);

  const st = {
    view: 'home', source: 'new', topic: 'mix', level: V.prefs.level || '2', mode: V.prefs.mode || 'step',
    exam: null, prob: null, si: 0, tries: 0, helped: new Set(), lines: [], finished: false, gaveUp: false,
    panel: null, lastKey: null, lastBank: -1, recorded: false,
  };

  /* ---------- iconen en tekeningen ---------- */
  const svg = (d, w = 2.4) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON = {
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 3.2),
    cross: svg('<path d="M18 6 6 18M6 6l12 12"/>', 3),
    back: svg('<path d="M19 12H5M12 19l-7-7 7-7"/>'),
    bulb: svg('<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>', 2.2),
    book: svg('<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>', 2.2),
    chart: svg('<path d="M3 3v18h18"/><path d="M7 15c3-8 6-8 11-9"/>', 2.2),
    eye: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>', 2.2),
    flame: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/></svg>',
    redo: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  };
  const ART = {
    mix: c => `<svg viewBox="0 0 124 72" aria-hidden="true"><circle cx="24" cy="36" r="14" fill="#2563eb"/><rect x="48" y="22" width="28" height="28" rx="7" fill="#db2777"/><path d="M90 50 L104 22 L118 50 Z" fill="#ca8a04"/><path d="M6 64 C 40 58, 80 70, 118 60" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg>`,
    veelterm: c => `<svg viewBox="0 0 124 72" aria-hidden="true"><path d="M6 62 C 30 -10, 50 82, 70 32 S 102 2, 118 22" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/><circle cx="38" cy="36" r="6" fill="#fff" stroke="${c}" stroke-width="3"/><circle cx="84" cy="21" r="6" fill="#fff" stroke="${c}" stroke-width="3"/></svg>`,
    expo: c => `<svg viewBox="0 0 124 72" aria-hidden="true"><path d="M6 66 C 54 64, 84 50, 118 4" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/><text x="14" y="30" font-family="Fredoka, sans-serif" font-size="26" font-weight="700" fill="${c}">2ˣ</text></svg>`,
    wortel: c => `<svg viewBox="0 0 124 72" aria-hidden="true"><path d="M10 40 L 22 40 L 32 62 L 48 8 L 114 8" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="64" y="48" font-family="Fredoka, sans-serif" font-size="26" font-weight="700" fill="${c}">x</text></svg>`,
    afgeleide: c => `<svg viewBox="0 0 124 72" aria-hidden="true"><path d="M6 62 C 42 62, 62 12, 118 8" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/><path d="M30 64 L 98 14" stroke="#e08600" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 6"/><circle cx="64" cy="39" r="6" fill="${c}"/></svg>`,
    formules: c => `<svg viewBox="0 0 124 72" aria-hidden="true"><text x="6" y="46" font-family="Fredoka, sans-serif" font-size="28" font-weight="700" fill="${c}">log R</text><path d="M88 37 h 24 m -9 -9 l 9 9 l -9 9" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    lijnen: c => `<svg viewBox="0 0 124 72" aria-hidden="true"><path d="M6 62 L 118 10" stroke="${c}" stroke-width="4" stroke-linecap="round"/><path d="M6 20 L 118 56" stroke="#e08600" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="7 6"/><circle cx="70" cy="33" r="6" fill="#fff" stroke="${c}" stroke-width="3"/></svg>`,
    rijen: c => `<svg viewBox="0 0 124 72" aria-hidden="true"><rect x="8" y="46" width="16" height="20" rx="4" fill="${c}"/><rect x="31" y="36" width="16" height="30" rx="4" fill="${c}"/><rect x="54" y="26" width="16" height="40" rx="4" fill="${c}"/><rect x="77" y="16" width="16" height="50" rx="4" fill="${c}"/><rect x="100" y="6" width="16" height="60" rx="4" fill="${c}" opacity=".4"/></svg>`,
  };
  const MIX = { id: 'mix', title: 'Alles door elkaar', blurb: 'Een mix, net als op het tentamen', color: '#1f9d55', soft: '#e8f8ef', art: 'mix' };

  /* ---------- formules zetten ---------- */
  function typeset(el) {
    const MJ = window.MathJax;
    if (MJ && MJ.typesetPromise && MJ.startup && MJ.startup.promise) MJ.startup.promise.then(() => MJ.typesetPromise([el])).then(() => fitWide(el)).catch(() => {});
    else setTimeout(() => typeset(el), 120);
  }
  // Formules breken niet af. Is iets te breed, dan eerst één kolom antwoorden en daarna de formules kleiner.
  function fitWide(root) {
    const over = el => el.scrollWidth > el.clientWidth + 1;
    const sel = '.prompt, .ask, .opt, .fbar-t, .mx, .panel';
    root.querySelectorAll('.opts.two').forEach(g => { if ([...g.children].some(over)) g.classList.remove('two'); });
    const els = [...root.querySelectorAll(sel)];
    if (root.matches && root.matches(sel)) els.push(root);
    els.forEach(el => {
      const mj = [...el.querySelectorAll('mjx-container')];
      mj.forEach(m => m.style.removeProperty('font-size'));
      if (!mj.length || !over(el)) return;
      const base = parseFloat(getComputedStyle(mj[0]).fontSize), parent = parseFloat(getComputedStyle(mj[0].parentElement).fontSize);
      for (let f = 0.94; f >= 0.7 && over(el); f -= 0.06) mj.forEach(m => m.style.setProperty('font-size', (base * f / parent * 100).toFixed(1) + '%', 'important'));
    });
  }
  let fitTimer;
  addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(() => fitWide(document.body), 150); });

  /* ---------- schermen ---------- */
  function setView(v, push = true) {
    st.view = v;
    $('v-home').hidden = v !== 'home'; $('v-exams').hidden = v !== 'exams'; $('v-practice').hidden = v !== 'practice';
    const prac = v === 'practice';
    $('h-home').hidden = prac; $('h-close').hidden = !prac;
    $('h-bar').hidden = !prac || st.mode !== 'step'; $('h-count').hidden = !prac || st.mode !== 'step'; $('h-mode').hidden = !prac || st.mode === 'step';
    if (!prac) hideBar();
    if (v === 'home') renderHome();
    if (v === 'exams') renderExams();
    replay($('v-' + v), 'view-in');
    window.scrollTo(0, 0);
    if (push) { try { history.pushState({ v }, '', v === 'home' ? location.pathname : '#' + (v === 'exams' ? 'tentamens' : 'oefenen')); } catch (e) {} }
  }
  addEventListener('popstate', () => setView('home', false));
  $('h-close').onclick = () => { try { if (history.state && history.state.v) return history.back(); } catch (e) {} setView('home', false); };
  function renderStreak(bump) {
    const s = V.stats.s, el = $('h-streak');
    el.hidden = !s;
    el.innerHTML = `${ICON.flame}${s} op rij`;
    el.title = `${s} ${s === 1 ? 'som' : 'sommen'} op rij zonder hulp`;
    if (bump && s) replay(el, 'bump');
  }

  /* ---------- menu ---------- */
  function seg(items, value, attr) {
    return `<div class="seg" role="radiogroup">${items.map(([v, t]) => `<button type="button" role="radio" aria-checked="${v === value}" data-${attr}="${v}">${t}</button>`).join('')}</div>`;
  }
  function topicCard(t, i) {
    const pr = t.id === 'mix' ? null : V.topic(t.id), pct = pr ? Math.min(100, pr.c / GOAL * 100) : 0;
    const meta = !pr ? `<span>Alle onderwerpen</span>`
      : pr.c >= GOAL ? `<span class="bar" style="--c:${t.color}"><i style="--w:100%"></i></span><span class="done-tag">Onder de knie</span>`
      : pr.n ? `<span class="bar" style="--c:${t.color}"><i style="--w:${pct}%"></i></span><span>${pr.c}/${GOAL}</span>`
      : `<span class="bar"><i style="--w:0%"></i></span><span>Nieuw</span>`;
    return `<button type="button" class="card topic" data-topic="${t.id}" style="--i:${i}">
      <span class="art" style="--s:${t.soft}">${ART[t.art](t.color)}</span>
      <b>${t.title}</b><span class="meta">${meta}</span></button>`;
  }
  function nextTopic() { return C.topics.find(t => V.topic(t.id).c < GOAL) || null; }
  function heroCard() {
    const r = V.resume;
    if (r) {
      const t = r.source === 'exam' ? null : topicOf(r.topic) || MIX;
      const title = r.source === 'exam' ? `Voorbeeldtentamen ${r.exam.n}` : r.source === 'bank' ? 'Echte tentamenvragen' : t.title;
      const sub = r.source === 'exam' ? `Opgave 1${C.bank.filter(b => b.ex === r.exam.n).sort((a, b) => a.pt.localeCompare(b.pt))[r.exam.idx].pt}`
        : r.key && r.mode === 'step' ? `Je was bij stap ${r.si + 1}` : 'Ga verder met een nieuwe som';
      const art = t || { soft: '#fde8f1', color: '#db2777', art: 'mix' };
      return `<div class="card resume" style="--i:1">
        <span class="eyebrow">Ga verder</span>
        <div class="resume-row"><span class="art" style="--s:${art.soft}">${ART[art.art](art.color)}</span><div><b>${title}</b><span>${sub}</span></div></div>
        <button class="btn primary big" id="b-resume">Verder oefenen ${ICON.arrow}</button></div>`;
    }
    if (!V.stats.n) return `<div class="card resume" style="--i:1">
        <span class="eyebrow">Nieuw hier? Zo werkt het</span>
        <ol class="steps3"><li><i>1</i>Kies een onderwerp</li><li><i>2</i>Los de som op in kleine stappen</li><li><i>3</i>Schrijf de uitwerking over, net als op je tentamen</li></ol>
        <button class="btn primary big" data-topic="${C.topics[0].id}">Begin met ${C.topics[0].short.toLowerCase()} ${ICON.arrow}</button></div>`;
    const t = nextTopic();
    if (!t) return `<div class="card resume" style="--i:1"><span class="eyebrow">Alles onder de knie</span><b style="font-size:18px">Klaar voor het echte werk?</b><span style="color:var(--muted);font-weight:700">Maak een heel voorbeeldtentamen, helemaal zelf.</span><button class="btn primary big" id="b-toexams">Tentamen maken ${ICON.arrow}</button></div>`;
    const pr = V.topic(t.id);
    return `<div class="card resume" style="--i:1">
      <span class="eyebrow">Aanrader voor nu</span>
      <div class="resume-row"><span class="art" style="--s:${t.soft}">${ART[t.art](t.color)}</span><div><b>${t.title}</b><span>${pr.c}/${GOAL} zonder hulp</span></div></div>
      <div class="bar" style="--c:${t.color}"><i style="--w:${pr.c / GOAL * 100}%"></i></div>
      <button class="btn primary big" data-topic="${t.id}">Oefen ${t.short.toLowerCase()} ${ICON.arrow}</button></div>`;
  }
  function renderHome() {
    const el = $('v-home');
    el.innerHTML = `
      <section class="home-hero">
        <div class="hero-t"><h1>Wat ga je vandaag oefenen?</h1><p>Kies een onderwerp. Je lost elke som op in kleine stappen en ziet meteen of je goed zit.</p></div>
        ${heroCard()}
      </section>
      <section>
        <div class="section-h"><h2>Onderwerpen</h2>
          <div class="settings"><span class="setting"><span class="lab">Werkwijze</span>${seg(MODES, st.mode, 'mode')}</span><span class="setting"><span class="lab">Niveau</span>${seg(LEVELS, st.level, 'level')}</span></div>
        </div>
        <div class="topics">${[MIX, ...C.topics].map(topicCard).join('')}</div>
      </section>
      <section class="extras">
        <button type="button" class="card dark extra" id="b-exams" style="--i:2"><span><b>Tentamen maken</b><span>Een heel voorbeeldtentamen, met je score</span></span>${ICON.arrow}</button>
        <button type="button" class="card extra" id="b-bank" style="--i:3"><span><b>Echte tentamenvragen</b><span>${C.bank.length} vragen uit oude tentamens, door elkaar</span></span>${ICON.arrow}</button>
      </section>`;
    el.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => startPractice({ source: 'new', topic: b.dataset.topic }));
    el.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { st.mode = b.dataset.mode; V.setPrefs({ mode: st.mode }); renderHome(); });
    el.querySelectorAll('[data-level]').forEach(b => b.onclick = () => { st.level = b.dataset.level; V.setPrefs({ level: st.level }); renderHome(); });
    $('b-exams').onclick = () => setView('exams');
    $('b-bank').onclick = () => startPractice({ source: 'bank', topic: 'mix' });
    if ($('b-resume')) $('b-resume').onclick = resume;
    if ($('b-toexams')) $('b-toexams').onclick = () => setView('exams');
    renderStreak();
  }
  function renderExams() {
    const el = $('v-exams');
    el.innerHTML = `
      <button class="btn ghost backlink" id="b-back">${ICON.back}Terug</button>
      <section>
        <div class="section-h"><h2>Kies een voorbeeldtentamen</h2><div class="settings"><span class="setting"><span class="lab">Werkwijze</span>${seg(MODES, st.mode, 'mode')}</span></div></div>
        <p class="note" style="margin-bottom:16px">Je maakt alle deelvragen van opgave 1 achter elkaar. Wil je het echt als een tentamen doen? Kies dan <b>Helemaal zelf</b>.</p>
        <div class="exams">${EXAMS.map((n, i) => {
          const k = C.bank.filter(b => b.ex === n).length, r = V.exam(n);
          return `<button type="button" class="card exam" data-exam="${n}" style="--i:${Math.min(i, 12)}"><b>Tentamen ${n}</b><span>${k} ${k === 1 ? 'deelvraag' : 'deelvragen'}</span>${r ? `<span class="score">Beste: ${r.best}/${r.tot}</span>` : ''}</button>`;
        }).join('')}</div>
      </section>`;
    $('b-back').onclick = () => $('h-close').onclick();
    el.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { st.mode = b.dataset.mode; V.setPrefs({ mode: st.mode }); renderExams(); });
    el.querySelectorAll('[data-exam]').forEach(b => b.onclick = () => startPractice({ source: 'exam', examN: +b.dataset.exam }));
  }

  /* ---------- oefenen starten ---------- */
  function startPractice(o) {
    st.source = o.source; st.topic = o.topic || 'mix'; st.lastKey = null; st.lastBank = -1;
    setView('practice');
    if (o.source === 'exam') startExam(o.examN); else newProblem();
  }
  function resume() {
    const r = V.resume;
    Object.assign(st, { source: r.source, topic: r.topic, level: r.level, mode: r.mode });
    setView('practice');
    if (r.exam) st.exam = { n: r.exam.n, items: examItems(r.exam.n), idx: r.exam.idx, res: r.exam.res };
    else st.exam = null;
    if (!r.key && st.exam && st.exam.res[st.exam.idx]) return nextPart(); // deze deelvraag was al af
    if (!r.key) return st.exam ? loadPart() : newProblem();
    st.prob = C.makeProblem(r.key, r.params, r.src);
    resetProblem(false);
    if (st.mode === 'step') {
      st.si = Math.min(r.si, st.prob.steps.length - 1); st.helped = new Set(r.helped);
      for (let i = 0; i < st.si; i++) (st.prob.steps[i].write || []).forEach(tex => st.lines.push({ n: i + 1, tex }));
      render();
    }
  }
  function saveResume() {
    const p = st.prob;
    V.setResume({
      source: st.source, topic: st.topic, level: st.level, mode: st.mode,
      key: st.finished ? null : p.key, params: st.finished ? null : p.params, src: p.src, si: st.si, helped: [...st.helped],
      exam: st.exam ? { n: st.exam.n, idx: st.exam.idx, res: st.exam.res } : null,
    });
  }
  function newProblem() {
    st.exam = null;
    if (st.source === 'bank') {
      const pool = C.bank.map((b, i) => [b, i]).filter(([b]) => st.topic === 'mix' || C.gens[b.g].topic === st.topic);
      let choice; do { choice = pickOne(pool); } while (pool.length > 1 && choice[1] === st.lastBank);
      st.lastBank = choice[1];
      st.prob = C.makeProblem(choice[0].g, JSON.parse(JSON.stringify(choice[0].p)), choice[0].src);
    } else {
      const keys = Object.keys(C.gens).filter(k => st.topic === 'mix' || C.gens[k].topic === st.topic);
      let key;
      do {
        const tot = keys.reduce((s, k) => s + C.gens[k].w, 0);
        let r = Math.random() * tot; key = keys.find(k => (r -= C.gens[k].w) < 0) || keys[0];
      } while (keys.length > 1 && key === st.lastKey);
      st.lastKey = key;
      st.prob = C.makeProblem(key, null, null, +st.level);
    }
    resetProblem();
  }
  function resetProblem(save = true) {
    Object.assign(st, { si: 0, tries: 0, helped: new Set(), lines: [], finished: false, gaveUp: false, panel: null, recorded: false });
    hideBar();
    render();
    replay($('v-practice'), 'view-in');
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    if (save) saveResume();
  }

  /* ---------- tentamen ---------- */
  const examItems = n => C.bank.filter(b => b.ex === n).sort((a, b) => a.pt.localeCompare(b.pt));
  function startExam(n) { st.exam = { n, items: examItems(n), idx: 0, res: [] }; loadPart(); }
  function loadPart() {
    const it = st.exam.items[st.exam.idx];
    st.prob = C.makeProblem(it.g, JSON.parse(JSON.stringify(it.p)), it.src);
    resetProblem();
  }
  function recordPart() {
    if (!st.exam || st.recorded) return;
    st.recorded = true;
    const p = st.prob, it = st.exam.items[st.exam.idx];
    const earned = st.mode === 'step' ? Math.round(p.pts * (p.steps.length - st.helped.size) / p.steps.length) : st.gaveUp ? 0 : p.pts;
    st.exam.res[st.exam.idx] = { pt: it.pt, pts: p.pts, earned };
    renderExamStrip();
  }
  function renderExamStrip() {
    const el = $('exstrip');
    if (!st.exam) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = `<span>Tentamen ${st.exam.n}</span><span class="pills">${st.exam.items.map((it, i) => {
      const r = st.exam.res[i];
      const cls = r ? (r.earned === r.pts ? 'ok' : r.earned > 0 ? 'half' : 'no') : i === st.exam.idx ? 'cur' : '';
      return `<span class="${cls}" title="Opgave 1${it.pt}">${it.pt}</span>`;
    }).join('')}</span>`;
  }
  function nextPart() {
    if (st.exam.idx === st.exam.items.length - 1) return renderExamSummary();
    st.exam.idx++; loadPart();
  }
  function partLabel() { const last = st.exam.idx === st.exam.items.length - 1; return last ? 'Bekijk je score' : `Naar opgave 1${st.exam.items[st.exam.idx + 1].pt}`; }
  function renderExamSummary() {
    const ex = st.exam, tot = ex.res.reduce((s, r) => s + r.pts, 0), got = ex.res.reduce((s, r) => s + r.earned, 0);
    const miss = C.missing[ex.n] || [];
    V.examDone(ex.n, got, tot); V.setResume(null);
    hideBar();
    $('qpill').textContent = `Tentamen ${ex.n}`; $('pq').textContent = 'Je score'; $('tools').innerHTML = ''; $('panel').hidden = true;
    $('h-bar').style.setProperty('--w', '100%');
    const w = $('work');
    w.className = 'stepcard done';
    w.innerHTML = `
      <span class="badge${got >= tot * 0.6 ? '' : ' half'}">${ICON.check}</span>
      <div class="bigscore">${got} <small>van ${tot} punten</small></div>
      <h2>${got === tot ? 'Alles goed. Dit tentamen heb je onder de knie!' : got >= tot * 0.6 ? 'Mooi resultaat. Je bent goed op weg.' : 'Goed dat je het geoefend hebt.'}</h2>
      <table class="score">${ex.res.map(r => `<tr><td>Opgave 1${r.pt}</td><td>${r.earned} / ${r.pts}</td></tr>`).join('')}<tr><td>Totaal</td><td>${got} / ${tot}</td></tr></table>
      ${miss.length ? `<p class="note">Opgave 1${miss.join(' en 1')} van dit tentamen zit${miss.length > 1 ? 'ten' : ''} nog niet in de trainer. Die kun je op papier oefenen.</p>` : ''}
      <p class="note">${st.mode === 'step' ? 'Bij stap voor stap tellen alleen de stappen die je zonder hulp deed.' : 'Bij een goed eindantwoord krijg je alle punten, net als bij een goede uitwerking.'}</p>
      <div class="row"><button class="btn primary big" id="b-nextex">Volgend tentamen ${ICON.arrow}</button><button class="btn big" id="b-again">${ICON.redo}Opnieuw</button></div>`;
    if (got === tot) w.insertAdjacentHTML('afterbegin', confetti());
    $('b-nextex').onclick = () => startExam(EXAMS[(EXAMS.indexOf(ex.n) + 1) % EXAMS.length]);
    $('b-again').onclick = () => startExam(ex.n);
    $('b-nextex').focus({ preventScroll: true });
  }

  /* ---------- oefenscherm ---------- */
  function render() {
    const p = st.prob;
    renderExamStrip(); renderMeta(); renderProgress();
    const pq = $('pq');
    pq.innerHTML = p.prompt;
    pq.classList.toggle('long', p.prompt.replace(/\\\(.*?\\\)/g, 'xxxxxxxx').length > 90);
    typeset(pq);
    renderSheet(); renderStats();
    st.mode === 'step' ? renderStep() : renderSelf();
  }
  function renderMeta() {
    const p = st.prob, t = topicOf(p.topic);
    const hideType = st.mode === 'step' && st.si === 0 && !st.finished && p.steps[0].label === 'Herkennen' && (st.topic === 'mix' || st.source !== 'new');
    const pill = $('qpill');
    pill.style.setProperty('--s', hideType ? '#eef0f5' : t.soft); pill.style.setProperty('--c', hideType ? 'var(--ink-2)' : t.color);
    const where = st.exam ? `Opgave 1${st.exam.items[st.exam.idx].pt}` : p.src || ({ 1: 'Oefensom, basis', 2: 'Oefensom, tentamenniveau', 3: 'Oefensom, pittig' })[st.level];
    pill.textContent = `${hideType ? 'Wat voor som is dit?' : t.title} · ${p.pts} punten · ${where}`;
  }
  function renderProgress() {
    const p = st.prob, n = p.steps.length;
    $('h-bar').hidden = st.mode !== 'step'; $('h-count').hidden = st.mode !== 'step'; $('h-mode').hidden = st.mode === 'step';
    $('h-bar').style.setProperty('--w', (st.finished ? 100 : st.si / n * 100) + '%');
    $('h-count').textContent = `${Math.min(st.si + 1, n)} / ${n}`;
  }
  function renderStats(bump) {
    [['st-n', 'n'], ['st-c', 'c'], ['st-s', 's']].forEach(([id, k]) => {
      const el = $(id), v = String(V.stats[k]), changed = el.textContent !== v;
      el.textContent = v;
      if (bump && changed) replay(el, 'bump');
    });
    renderStreak(bump);
  }
  function renderSheet(newFrom = Infinity) {
    const el = $('sheet'), p = st.prob;
    $('side-sub').textContent = st.mode === 'step' ? 'zo schrijf je het op' : st.finished ? 'zo had het gekund' : 'komt na het controleren';
    let html = st.lines.length
      ? `<div class="lines" id="lines">${st.lines.map((l, i) => `<div class="ln${i >= newFrom ? ' new' : ''}" style="--i:${Math.max(0, i - newFrom)}"><span class="mg">${l.n}</span><div class="mx">\\(\\displaystyle ${l.tex}\\)</div></div>`).join('')}</div>`
      : `<p class="empty">${st.mode === 'step' ? 'Elke stap die je afrondt, komt hier te staan. Zo zie je precies wat je op je tentamen opschrijft.' : 'Werk de som eerst zelf uit op papier. Daarna kun je hier je uitwerking vergelijken.'}</p>`;
    if (st.mode === 'self' && st.finished) html += `<h3 style="font-size:16px;margin-top:6px">Waarom zo?</h3><ol class="why">${p.steps.map(s => {
      const o = s.kind === 'mc' ? s.options.find(o => o.ok) : null;
      const txt = s.kind === 'mc' ? `${o.h.replace(/<small>.*<\/small>/, '')}. ${o.why}` : `${C.ansText(s.answers, s.dp)}. ${s.explain || s.hint || ''}`;
      return `<li><b>${s.label}.</b> ${txt}</li>`;
    }).join('')}</ol>`;
    el.innerHTML = html;
    const box = $('lines'); if (box && newFrom !== Infinity) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
    typeset(el);
  }
  function pushLines(i) {
    const from = st.lines.length;
    (st.prob.steps[i].write || []).forEach(tex => st.lines.push({ n: i + 1, tex }));
    renderSheet(from);
  }

  /* hulpmiddelen onder de stap: tip, theorie, grafiek, antwoord */
  function renderTools() {
    const p = st.prob, s = st.mode === 'step' && !st.finished ? p.steps[st.si] : null;
    if (p.plot === undefined) { try { p.plot = C.plotSpec(p); } catch (e) { p.plot = null; } }
    const th = s ? theoryHtml(s.th || []) : '';
    const b = [];
    if (s && s.hint && !s.done) b.push(`<button class="btn" data-panel="tip" aria-pressed="${st.panel === 'tip'}"><span class="ic-tip">${ICON.bulb}</span>Tip</button>`);
    if (th) b.push(`<button class="btn" data-panel="th" aria-pressed="${st.panel === 'th'}"><span class="ic-th">${ICON.book}</span>Hoe zat het?</button>`);
    if (p.plot) b.push(`<button class="btn" data-panel="graph" aria-pressed="${st.panel === 'graph'}"><span class="ic-gr">${ICON.chart}</span>Grafiek</button>`);
    if (s && !s.done) b.push(`<button class="btn" id="b-show"><span class="ic-eye">${ICON.eye}</span>Laat het antwoord zien</button>`);
    $('tools').innerHTML = b.join('');
    $('tools').querySelectorAll('[data-panel]').forEach(x => x.onclick = () => {
      st.panel = st.panel === x.dataset.panel ? null : x.dataset.panel;
      if (st.panel === 'tip' && s && !s.done) { st.helped.add(st.si); saveResume(); }
      renderTools(); renderPanel(true);
    });
    if ($('b-show')) $('b-show').onclick = reveal;
    renderPanel(false);
  }
  const theoryHtml = keys => [...new Set(keys)].filter(k => C.theory[k]).map(k => `<div class="th"><b>${C.theory[k][0]}</b>${C.theory[k][1]}</div>`).join('');
  function renderPanel(animate) {
    const el = $('panel'), p = st.prob, s = p.steps[st.si];
    if (st.panel === 'tip' && !(s && s.hint)) st.panel = null;
    if (!st.panel) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    if (st.panel === 'tip') { el.className = 'panel tip'; el.innerHTML = `<div class="kick">Een tip voor deze stap</div>${s.hint}`; }
    if (st.panel === 'th') { el.className = 'panel'; el.innerHTML = `<div class="kick">Hoe zat het ook alweer?</div>${theoryHtml((s && s.th) || [])}`; }
    if (st.panel === 'graph') {
      const g = p.plot;
      el.className = 'panel graph';
      el.innerHTML = `<figure>${drawPlot(g, st.finished, animate)}<div class="legend">${g.curves.map((c, i) => `<span><i class="${i ? 'd' : ''}"></i>\\(${c.tex}\\)</span>`).join('')}</div><figcaption>${st.finished ? g.after : g.before}</figcaption></figure>`;
    }
    typeset(el);
  }

  function renderStep() {
    const p = st.prob, w = $('work');
    if (st.finished) return renderDone();
    const s = p.steps[st.si];
    w.className = 'stepcard';
    w.innerHTML = `
      <div class="stephead"><span class="eyebrow">Stap ${st.si + 1} · ${s.label}</span></div>
      <p class="ask">${s.q}</p>
      <div id="act"></div>`;
    const act = $('act');
    if (s.kind === 'mc') {
      act.className = s.options.length > 2 && innerWidth >= 700 ? 'opts two' : 'opts';
      act.innerHTML = s.options.map((o, i) => `<button class="opt" data-i="${i}" style="--i:${i}"><span class="k">${'ABCDEF'[i]}</span><span class="t">${o.h}</span></button>`).join('');
      act.querySelectorAll('.opt').forEach(b => b.onclick = () => pickOpt(+b.dataset.i, b));
    } else {
      act.className = '';
      act.innerHTML = `<div class="field"><input id="inp" inputmode="text" autocomplete="off" placeholder="Typ je antwoord, bijv. 0 ; 1/3 ; -2" aria-label="Jouw antwoord"><button class="btn primary big" id="b-check">Controleer</button></div><p class="help" style="margin-top:14px">Meer antwoorden? Zet er een puntkomma tussen. Breuken mogen als 2/3, decimalen met een komma.</p>`;
      $('b-check').onclick = checkStep;
      $('inp').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); checkStep(); } });
      $('inp').addEventListener('input', () => { if ($('fbar').classList.contains('bad')) hideBar(); });
    }
    renderTools();
    typeset(w);
    if (s.kind === 'num' && matchMedia('(hover: hover)').matches) $('inp').focus({ preventScroll: true });
  }
  function pickOpt(i, btn) {
    const s = st.prob.steps[st.si], o = s.options[i];
    if (s.done || btn.disabled) return;
    if (o.ok) { btn.classList.add('right'); complete(o.why); return; }
    btn.classList.add('wrong'); btn.disabled = true; st.tries++; st.helped.add(st.si); saveResume();
    showBar('bad', pickOne(NUDGE), o.why + (st.tries >= 2 ? ' Kom je er niet uit? Kijk bij <b>Tip</b> of <b>Hoe zat het?</b>' : ''), 'Probeer opnieuw', hideBar);
  }
  function checkStep() {
    const s = st.prob.steps[st.si];
    if (s.done) return;
    const r = C.checkAns(s.answers, $('inp').value, s.dp);
    if (r.ok) return complete(`Het antwoord is ${C.ansText(s.answers, s.dp)}.`);
    const empty = r.msg === 'Vul eerst een antwoord in.';
    if (!empty) { st.tries++; st.helped.add(st.si); saveResume(); }
    replay($('inp'), 'shake');
    showBar('bad', empty ? 'Even je antwoord nog' : pickOne(NUDGE), r.msg + (st.tries >= 2 ? ' Een <b>Tip</b> kan helpen.' : ''), 'Probeer opnieuw', () => { hideBar(); $('inp').focus(); });
  }
  function reveal() {
    const s = st.prob.steps[st.si];
    if (s.done) return;
    st.helped.add(st.si);
    if (s.kind === 'mc') {
      const i = s.options.findIndex(o => o.ok);
      const b = document.querySelector(`#act .opt[data-i="${i}"]`); if (b) b.classList.add('right');
      complete(s.options[i].why);
    } else {
      $('inp').value = C.ansText(s.answers, s.dp);
      complete(`Het antwoord is ${C.ansText(s.answers, s.dp)}.`);
    }
  }
  function complete(msg) {
    const p = st.prob, s = p.steps[st.si];
    s.done = true;
    document.querySelectorAll('#act .opt, #act input, #act button').forEach(b => b.disabled = true);
    if ($('inp')) $('inp').classList.add('good');
    pushLines(st.si);
    if (st.panel === 'tip') st.panel = null;
    renderTools();
    const last = st.si === p.steps.length - 1;
    showBar('ok', st.helped.has(st.si) ? 'Zo zit het' : pickOne(PRAISE), [msg, s.explain].filter(Boolean).join(' '), last ? 'Bekijk je resultaat' : 'Volgende stap', nextStep);
  }
  function nextStep() {
    const w = $('work');
    if (w.classList.contains('leave')) return;
    hideBar();
    w.classList.add('leave');
    setTimeout(() => {
      st.si++; st.tries = 0; st.panel = st.panel === 'graph' ? 'graph' : null;
      if (st.si >= st.prob.steps.length) {
        st.finished = true;
        V.finish(st.prob.topic, !st.helped.size);
        recordPart();
      }
      saveResume();
      renderMeta(); renderProgress(); renderStats(true);
      w.classList.remove('leave');
      renderStep();
      replay(w, 'enter');
      if (!st.finished) w.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    }, 170);
  }
  function confetti() {
    const cols = ['#1f9d55', '#2563eb', '#db2777', '#e08600', '#7c3aed', '#0d9488'];
    return `<div class="confetti" aria-hidden="true">${Array.from({ length: 28 }, (_, i) => `<i style="--x:${4 + Math.random() * 92}%;--c:${cols[i % cols.length]};--d:${(Math.random() * .35).toFixed(2)}s;--r:${Math.round(Math.random() * 720 - 360)}deg"></i>`).join('')}</div>`;
  }
  function renderDone() {
    const p = st.prob, n = p.steps.length, clean = n - st.helped.size, all = clean === n, w = $('work');
    const r = st.exam && st.exam.res[st.exam.idx];
    const t = topicOf(p.topic), tp = V.topic(p.topic);
    const chips = [
      `<span class="chip ${all ? 'g' : 'a'}" style="--i:0">${clean} van ${n} stappen zelf</span>`,
      r ? `<span class="chip" style="--i:1">${r.earned} van ${r.pts} punten</span>` : '',
      !st.exam && t ? `<span class="chip" style="--i:2">${t.short}: ${Math.min(tp.c, GOAL)}/${GOAL} zonder hulp</span>` : '',
      V.stats.s >= 2 ? `<span class="chip a" style="--i:3">${V.stats.s} op rij</span>` : '',
    ].join('');
    w.className = 'stepcard done';
    w.innerHTML = `${all ? confetti() : ''}
      <span class="badge${all ? '' : ' half'}">${ICON.check}</span>
      <h2>${all ? 'Helemaal zelf gedaan!' : 'Som af!'}</h2>
      <div class="chips">${chips}</div>
      <p class="ask">${all ? 'Elke stap in één keer goed. Dit soort som snap je.' : 'Bij de stappen waar je hulp gebruikte, valt nog wat te winnen. Let daar bij de volgende som extra op.'}${p.plot ? ' Bekijk ook de grafiek: daar zie je je antwoord terug.' : ''}</p>
      <div class="row">${st.exam ? `<button class="btn primary big" id="b-part">${partLabel()} ${ICON.arrow}</button>`
        : `<button class="btn primary big" id="b-new">Volgende som ${ICON.arrow}</button>${p.src ? '' : '<button class="btn big" id="b-same">Nog eentje van deze soort</button>'}`}</div>`;
    renderTools();
    if (st.exam) { $('b-part').onclick = nextPart; $('b-part').focus({ preventScroll: true }); return; }
    $('b-new').onclick = newProblem;
    if ($('b-same')) $('b-same').onclick = () => { st.prob = C.makeProblem(st.prob.key, null, null, +st.level); resetProblem(); };
    $('b-new').focus({ preventScroll: true });
  }

  /* helemaal zelf */
  function renderSelf() {
    const p = st.prob, w = $('work');
    const labelHelp = { helling: 'de helling', min: 'de minimale waarde', som: 'de som' };
    w.className = 'stepcard';
    w.innerHTML = `
      <div class="stephead"><span class="eyebrow">Helemaal zelf</span></div>
      <p class="ask">Pak pen en papier en werk de som uit, net als op je tentamen. Vul daarna je eindantwoord in.</p>
      ${p.final.map((f, i) => `<div class="field"><label for="fin${i}">${f.label} =</label><input id="fin${i}" autocomplete="off" aria-label="${labelHelp[f.label] || f.label}" placeholder="${p.final.length > 1 || f.answers.length === 1 ? 'bijv. 2/3 of 1,683' : 'bijv. 0 ; 1/3 ; -2'}"></div>`).join('')}
      <p class="help" style="margin-top:0">Meer antwoorden? Zet er een puntkomma tussen. Breuken mogen als 2/3, decimalen met een komma.</p>
      <div class="row" style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary big" id="b-fin">Controleer</button><button class="btn big" id="b-give">Ik kom er niet uit</button></div>`;
    $('b-fin').onclick = checkFinal;
    $('b-give').onclick = () => showSolution(false);
    p.final.forEach((_, i) => $('fin' + i).addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); checkFinal(); } }));
    renderTools();
    typeset(w);
  }
  function checkFinal() {
    const p = st.prob;
    if (st.finished) return;
    const res = p.final.map((f, i) => C.checkAns(f.answers, $('fin' + i).value, f.dp || 3));
    if (res.some(r => r.msg === 'Vul eerst een antwoord in.')) return showBar('bad', 'Even je antwoord nog', 'Vul eerst alle vakjes in.', 'Oké', hideBar);
    if (res.every(r => r.ok)) {
      p.final.forEach((_, i) => $('fin' + i).classList.add('good'));
      return showSolution(true);
    }
    st.tries++;
    res.forEach((r, i) => { if (!r.ok) replay($('fin' + i), 'shake'); });
    showBar('bad', pickOne(NUDGE), res.map((r, i) => r.ok ? '' : `<b>${p.final[i].label}:</b> ${r.msg}`).filter(Boolean).join(' '), 'Probeer opnieuw', hideBar);
  }
  function showSolution(won) {
    const p = st.prob;
    st.finished = true; st.gaveUp = !won;
    V.finish(p.topic, won && !st.tries);
    st.lines = []; p.steps.forEach((s, i) => (s.write || []).forEach(tex => st.lines.push({ n: i + 1, tex })));
    recordPart(); saveResume();
    document.querySelectorAll('#work input, #work button').forEach(i => i.disabled = true);
    renderSheet(0); renderStats(true); renderMeta(); renderTools();
    const next = st.exam ? [partLabel(), nextPart] : ['Volgende som', newProblem];
    const ans = p.final.map(f => `${f.label} = ${C.ansText(f.answers, f.dp || 3)}`).join(', ');
    if (won) showBar('ok', st.tries ? 'Gelukt!' : 'Goed in één keer!', `Vergelijk je uitwerking met die bij <b>Jouw uitwerking</b>. Heb je elke stap opgeschreven?`, next[0], next[1]);
    else showBar('bad', 'Geen probleem, zo zit het', `Het antwoord is ${ans}. Lees de uitwerking rustig door. Daarna lukt de volgende vast.`, next[0], next[1]);
    if (innerWidth < 1180) $('v-practice').querySelector('.side').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- feedbackbalk onderin ---------- */
  let barAction = null;
  function showBar(kind, title, body, label, action) {
    const b = $('fbar');
    b.className = 'fbar ' + kind;
    $('fbar-ic').innerHTML = kind === 'ok' ? ICON.check : ICON.cross;
    $('fbar-title').textContent = title;
    $('fbar-body').innerHTML = body || '';
    $('fbar-btn').innerHTML = `${label}${kind === 'ok' ? ' ' + ICON.arrow : ''}`;
    barAction = action;
    void b.offsetWidth; b.classList.add('on');
    typeset($('fbar-body'));
    if (kind === 'ok') $('fbar-btn').focus({ preventScroll: true });
  }
  function hideBar() { $('fbar').classList.remove('on'); barAction = null; }
  $('fbar-btn').onclick = () => barAction && barAction();

  /* ---------- toetsenbord: A–F kiest, Enter gaat door ---------- */
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || $('plans').open || st.view !== 'practice') return;
    if (e.key === 'Enter') {
      if ($('fbar').classList.contains('on') && barAction && document.activeElement !== $('fbar-btn')) { e.preventDefault(); barAction(); return; }
      const nx = ['b-new', 'b-part', 'b-nextex'].map($).find(b => b && !b.disabled);
      if (nx && document.activeElement !== nx && !/INPUT|BUTTON/.test(document.activeElement.tagName)) { e.preventDefault(); nx.click(); }
      return;
    }
    if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const i = 'abcdef'.indexOf(e.key.toLowerCase());
    if (i >= 0 && st.mode === 'step' && !st.finished) { const b = document.querySelector(`#act .opt[data-i="${i}"]`); if (b && !b.disabled) { hideBar(); b.click(); } }
  });

  /* ---------- grafiek tekenen ---------- */
  const niceStep = r => { const m = Math.pow(10, Math.floor(Math.log10(r))); return [1, 2, 5, 10].map(k => k * m).find(v => v >= r); };
  const fmtNum = v => String(Math.round(v * 1000) / 1000).replace('.', ',').replace('-', '−');
  function drawPlot(spec, done, animate) {
    const W = 600, H = 340, ml = 40, mr = 14, mt = 18, mb = 28;
    let lo = Math.min(...spec.keys), hi = Math.max(...spec.keys);
    const pad = Math.max(2, (hi - lo) * 0.4);
    let x0 = lo - pad, x1 = hi + pad;
    if (x1 - x0 < 6) { const c = (x0 + x1) / 2; x0 = c - 3; x1 = c + 3; }
    if (spec.curves.some(c => !isFinite(c.f(x0)))) { const ok = []; for (let i = 0; i <= 200; i++) { const x = x0 + (x1 - x0) * i / 200; if (isFinite(spec.curves[0].f(x))) ok.push(x); } if (ok.length) x0 = Math.max(x0, ok[0] - (x1 - x0) * 0.08); }
    const ys = [];
    const wx0 = Math.max(x0, lo - 1.5), wx1 = Math.min(x1, hi + 1.5);
    spec.curves.forEach(c => { for (let i = 0; i <= 240; i++) { const y = c.f(wx0 + (wx1 - wx0) * i / 240); if (isFinite(y)) ys.push(y); } });
    ys.sort((a, b) => a - b);
    const mys = spec.marks.map(m => m.y).concat(spec.given ? [spec.given.y] : []).filter(isFinite);
    let y0 = Math.min(ys[Math.floor(ys.length * 0.06)] ?? 0, ...mys), y1 = Math.max(ys[Math.floor(ys.length * 0.94)] ?? 1, ...mys);
    const sp = y1 - y0 || 2;
    if (y0 > 0 && y0 < sp * 0.6) y0 = 0; if (y1 < 0 && -y1 < sp * 0.6) y1 = 0;
    if (y1 - y0 < 2) { const c = (y0 + y1) / 2; y0 = c - 1; y1 = c + 1; }
    const yp = (y1 - y0) * 0.14; y0 -= yp; y1 += yp;
    const sx = x => ml + (x - x0) / (x1 - x0) * (W - ml - mr), sy = y => mt + (y1 - y) / (y1 - y0) * (H - mt - mb);
    const g = [];
    const xs = niceStep((x1 - x0) / 7), yst = niceStep((y1 - y0) / 5);
    for (let v = Math.ceil(x0 / xs) * xs; v <= x1 + 1e-9; v += xs) g.push(`<line class="${Math.abs(v) < 1e-9 ? 'axis' : 'grid'}" x1="${sx(v)}" x2="${sx(v)}" y1="${mt}" y2="${H - mb}"/><text x="${sx(v)}" y="${H - mb + 17}" text-anchor="middle">${fmtNum(v)}</text>`);
    for (let v = Math.ceil(y0 / yst) * yst; v <= y1 + 1e-9; v += yst) g.push(`<line class="${Math.abs(v) < 1e-9 ? 'axis' : 'grid'}" x1="${ml}" x2="${W - mr}" y1="${sy(v)}" y2="${sy(v)}"/><text x="${ml - 7}" y="${sy(v) + 4}" text-anchor="end">${fmtNum(v)}</text>`);
    const path = f => {
      let d = '', pen = false, prev = null;
      for (let i = 0; i <= 500; i++) {
        const x = x0 + (x1 - x0) * i / 500, y = f(x), Y = sy(y);
        if (!isFinite(y) || Y < -H || Y > 2 * H || (prev !== null && Math.abs(Y - prev) > H * 0.9)) { pen = false; prev = isFinite(Y) ? Y : null; continue; }
        d += (pen ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + Y.toFixed(1); pen = true; prev = Y;
      }
      return d;
    };
    const curves = spec.curves.map((c, i) => `<path class="c${i ? 2 : 1} ${animate ? (i ? 'fade' : 'draw') : ''}" ${i ? '' : 'pathLength="1"'} d="${path(c.f)}"/>`).join('');
    let marks = '';
    if (spec.given && !done) marks += `<circle class="pt" cx="${sx(spec.given.x)}" cy="${sy(spec.given.y)}" r="5.5"/>`;
    if (done) spec.marks.forEach((m, i) => {
      if (m.m !== undefined) { const kx = (W - ml - mr) / (x1 - x0), ky = (H - mt - mb) / (y1 - y0), dx = 64 / Math.sqrt(kx * kx + m.m * m.m * ky * ky); marks += `<line class="tan" style="animation-delay:${.15 + i * .12}s" x1="${sx(m.x - dx)}" y1="${sy(m.y - m.m * dx)}" x2="${sx(m.x + dx)}" y2="${sy(m.y + m.m * dx)}"/>`; }
      marks += `<circle class="pt res" style="animation-delay:${i * .12}s" cx="${sx(m.x)}" cy="${sy(m.y)}" r="6"/><text class="ptlab" x="${sx(m.x)}" y="${sy(m.y) - 13}" text-anchor="middle">${m.lab || 'x = ' + fmtNum(m.x)}</text>`;
    });
    return `<svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafiek bij de som"><defs><clipPath id="clip"><rect x="${ml}" y="${mt - 8}" width="${W - ml - mr}" height="${H - mt - mb + 8}"/></clipPath></defs>${g.join('')}<g clip-path="url(#clip)">${curves}${marks}</g></svg>`;
  }

  /* ---------- stappenplannen ---------- */
  $('b-plans').onclick = () => $('plans').showModal();
  $('b-close').onclick = () => $('plans').close();
  $('plans').addEventListener('click', e => { if (e.target === $('plans')) $('plans').close(); });

  /* ---------- start ---------- */
  try { if (location.hash) history.replaceState(null, '', location.pathname); } catch (e) {}
  setView('home', false);
})();
