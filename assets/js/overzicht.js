/*
 * Overzicht van een vak (wiskunde-a/index.html) en de pagina Mijn voortgang (wiskunde-a/voortgang.html).
 * Leest de onderdelen en vaardigheden uit VAK, de examentellingen uit EXAMENANALYSE en de
 * voortgang uit Voortgang. Rekent zelf niets uit wat de trainer niet ook zo doet.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const courseId = o => (o.id === 'algebra' ? `${VAK.id}-opgave-1` : `${VAK.id}-${o.id}`);
  const S = Voortgang.STATUS;
  const skills = o => Object.entries(VAK.vaardigheden).filter(([, v]) => v.onderdeel === o.id).map(([id, v]) => ({ id, ...v }));
  const rec = (o, id) => Voortgang.cursus(courseId(o)).topic(id);
  const stOf = (o, id) => Voortgang.status(rec(o, id));
  const exam = id => EXAMENANALYSE.vaardigheden[id] || { deelvragen: 0, tentamens: 0, punten: 0 };
  // opgave 1 heeft geen punten per deelvraag in de analyse: reken dan met 4 punten per deelvraag (het gemiddelde)
  const gewicht = id => exam(id).punten || exam(id).deelvragen * 4;
  const dots = r => `<span class="dots" aria-hidden="true">${[0, 1, 2, 3, 4].map(i => `<i class="${r && i < r.length ? (r[i] ? 'g' : 'f') : ''}"></i>`).join('')}</span>`;
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function aanraders(n) {
    const nodig = { nieuw: 1, lastig: 1.3, bijna: 0.7, kan: 0 };
    const all = VAK.onderdelen.flatMap(o => skills(o).map(s => ({ o, s, st: stOf(o, s.id), score: gewicht(s.id) * nodig[stOf(o, s.id)] })));
    return all.filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, n);
  }

  function renderVak() {
    const el = $('vak'), totaal = VAK.onderdelen.reduce((s, o) => s + skills(o).length, 0);
    const kan = VAK.onderdelen.reduce((s, o) => s + skills(o).filter(x => stOf(o, x.id) === 'kan').length, 0);
    const geoefend = VAK.onderdelen.some(o => skills(o).some(x => rec(o, x.id).n));
    const naam = Account.profile && Account.profile.display_name ? Account.profile.display_name.split(' ')[0] : '';
    const ring = 2 * Math.PI * 40, deel = ring * kan / totaal;
    el.innerHTML = `
      <section class="hub-head">
        <div>
          <span class="eyebrow">${naam ? `Hoi ${Account.esc(naam)}` : 'Welkom'}</span>
          <h1>${VAK.titel}</h1>
          <p class="hub-sub">Kies een onderdeel om te oefenen.</p>
        </div>
        <a class="card ring-card" href="voortgang.html" style="--i:1" aria-label="Mijn voortgang: ${kan} van ${totaal} onderwerpen onder de knie">
          <svg width="80" height="80" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="40" fill="none" stroke="#e4e6ee" stroke-width="10"/><circle cx="48" cy="48" r="40" fill="none" stroke="#1f9d55" stroke-width="10" stroke-linecap="round" stroke-dasharray="${deel.toFixed(1)} ${ring.toFixed(1)}" transform="rotate(-90 48 48)"/><text x="48" y="54" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="20" fill="#1b1d2a">${kan}/${totaal}</text></svg>
          <span><b>Mijn voortgang</b><span class="sub">onderwerpen onder de knie</span></span>
        </a>
      </section>

      <section class="onderdelen">${VAK.onderdelen.map((o, i) => {
        const sk = skills(o), k = sk.filter(x => stOf(o, x.id) === 'kan').length, info = EXAMENANALYSE.onderdelen[o.id] || {};
        return `<a class="card onderdeel reveal-card${o.id === 'algebra' ? ' first' : ''}" href="${o.pagina}" style="--i:${i};--c:${o.kleur};--s:${o.zacht}">
          ${o.id === 'algebra' ? '<span class="ribbon">Start hier</span>' : ''}
          <span class="od-sym">${o.symbool}</span>
          <b>${o.titel}</b>
          <span class="meta"><span class="bar" style="--c:${o.kleur}"><i style="--w:${k / sk.length * 100}%"></i></span><span>${k}/${sk.length}</span></span>
          <span class="reveal" aria-hidden="true"><span>${o.blurb}</span><small>In ${info.tentamens || 0} van de ${EXAMENANALYSE.tentamens} tentamens${o.id !== 'algebra' && info.gemPunten ? ` · ongeveer ${Math.round(info.gemPunten)} punten` : ''}</small></span>
        </a>`;
      }).join('')}</section>

      <section>
        <div class="section-h"><h2>${geoefend ? 'Werk hier eerst aan' : 'Levert de meeste punten op'}</h2></div>
        <div class="tips">${aanraders(3).map((x, i) => `
          <div class="card tip-card" style="--i:${i};--c:${x.o.kleur};--s:${x.o.zacht}">
            <span class="eyebrow" style="color:${x.o.kleur}">${x.o.titel}</span>
            <b>${x.s.titel}</b>
            <span class="tip-act"><a class="btn primary" href="${x.o.pagina}#oefen-${x.s.id}">Oefen ${arrow}</a><a class="btn" href="${x.o.pagina}#leer-${x.s.id}">Uitleg</a><span class="st st-${x.st}">${S[x.st].teken} ${S[x.st].kort}</span></span>
          </div>`).join('')}</div>
      </section>`;
  }

  function renderVoortgang() {
    const el = $('voortgang');
    el.innerHTML = `
      <section class="section-h" style="margin:0"><div><h1 class="vg-h">Mijn voortgang</h1></div>
        <div class="legend-st">${['kan', 'bijna', 'lastig', 'nieuw'].map(k => `<span class="st st-${k}">${S[k].teken} ${S[k].label}</span>`).join('')}</div></section>
      ${VAK.onderdelen.map(o => {
        const sk = skills(o).sort((a, b) => gewicht(b.id) - gewicht(a.id)), k = sk.filter(x => stOf(o, x.id) === 'kan').length;
        return `<section class="vg-block">
          <div class="vg-head"><b><span style="color:${o.kleur}">●</span> ${o.titel}</b><span>${k} / ${sk.length}</span><a href="${o.pagina}">Naar dit onderdeel</a></div>
          <ul class="vg-list">${sk.map(s => { const r = rec(o, s.id), st = stOf(o, s.id); return `
            <li><span class="st st-${st}">${S[st].teken} ${S[st].kort}</span>${r.n ? dots(r.r) : ''}<span class="vg-name">${s.titel}</span>
              <span class="vg-act"><a href="${o.pagina}#leer-${s.id}">Uitleg</a><a href="${o.pagina}#oefen-${s.id}">Oefen</a></span></li>`; }).join('')}</ul>
        </section>`;
      }).join('')}`;
  }

  const render = () => { if ($('vak')) renderVak(); if ($('voortgang')) renderVoortgang(); };
  Voortgang.onChange(render);
  Account.onChange(render);
  render();
  Account.init({ courses: VAK.onderdelen.map(courseId), root: '../', require: true });
})();
