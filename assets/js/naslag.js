/*
 * Naslag: uitleg om terug te lezen. Links de inhoud per onderdeel, rechts het artikel.
 * De volledige artikelen staan in content/<vak>/naslag.js; ontbreekt een onderwerp daar,
 * dan tonen we de korte uitleg uit vak.js.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const ids = Object.keys(VAK.vaardigheden);
  const ond = id => VAK.onderdelen.find(o => o.id === VAK.vaardigheden[id].onderdeel);
  const info = id => EXAMENANALYSE.vaardigheden[id];
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function typeset(el) {
    const MJ = window.MathJax;
    if (MJ && MJ.typesetPromise && MJ.startup && MJ.startup.promise) MJ.startup.promise.then(() => MJ.typesetPromise([el])).catch(() => {});
    else setTimeout(() => typeset(el), 150);
  }

  function renderNav(cur) {
    $('ns-nav').innerHTML = VAK.onderdelen.map(o => `
      <div class="ns-group"><span class="eyebrow" style="color:${o.kleur}">${o.titel}</span>
        ${ids.filter(id => VAK.vaardigheden[id].onderdeel === o.id).map(id => `<a href="#${id}" class="${id === cur ? 'on' : ''}" style="--c:${o.kleur}">${VAK.vaardigheden[id].titel}${NASLAG[id] ? '' : ' <small>kort</small>'}</a>`).join('')}
      </div>`).join('');
    $('ns-select').innerHTML = VAK.onderdelen.map(o => `<optgroup label="${o.titel}">${ids.filter(id => VAK.vaardigheden[id].onderdeel === o.id).map(id => `<option value="${id}"${id === cur ? ' selected' : ''}>${VAK.vaardigheden[id].titel}</option>`).join('')}</optgroup>`).join('');
  }

  function renderArticle(id) {
    const v = VAK.vaardigheden[id], n = NASLAG[id], o = ond(id), x = info(id);
    const voorbeelden = n ? n.voorbeelden : [{ vraag: v.voorbeeld.vraag, regels: null, tekst: v.voorbeeld.regels }];
    $('ns-article').innerHTML = `
      <header class="ns-head" style="--c:${o.kleur};--s:${o.zacht}">
        <span class="eyebrow" style="color:${o.kleur}">${o.titel}</span>
        <h1>${v.titel}</h1>
        <p class="lead">${v.hover}</p>
      </header>
      <section><h2>Het idee</h2>${n ? n.idee : `<p>${v.kort}</p><p>${v.herken}</p>`}</section>
      <section><h2>Zo pak je het aan</h2><ol class="ns-steps">${(n ? n.stappen : v.stappen).map(s => `<li>${s}</li>`).join('')}</ol></section>
      <section><h2>${voorbeelden.length > 1 ? 'Voorbeelden' : 'Voorbeeld'}</h2>
        ${voorbeelden.map((e, i) => `<div class="ns-ex"><span class="ns-ex-n">${i + 1}</span><p class="ns-q">${e.vraag}</p>
          <ol class="ns-lines">${e.regels ? e.regels.map(r => `<li>\\(\\displaystyle ${r}\\)</li>`).join('') : e.tekst.map(r => `<li>${r}</li>`).join('')}</ol></div>`).join('')}
      </section>
      <section class="ns-warn"><h2>Veelgemaakte fouten</h2><ul>${(n ? n.fouten : [v.valkuil]).map(f => `<li>${f}</li>`).join('')}</ul></section>
      <section><h2>Op het tentamen</h2><p>${n ? n.tentamen : v.herken}</p>${x ? `<p class="note">Kwam voor in ${x.tentamens} van de ${EXAMENANALYSE.tentamens} voorbeeldtentamens.</p>` : ''}</section>
      ${n ? '' : '<p class="note ns-soon">De uitgebreide uitleg van dit onderwerp volgt nog. Hierboven staat de korte versie.</p>'}
      <div class="ns-act"><a class="btn primary big" href="${o.pagina}#oefen-${id}">Oefen dit onderwerp ${arrow}</a></div>`;
    typeset($('ns-article'));
  }

  function show() {
    const id = ids.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'veelterm';
    renderNav(id); renderArticle(id);
    if (location.hash) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $('ns-select').onchange = e => { location.hash = e.target.value; };
  addEventListener('hashchange', show);
  show();
  Account.init({ courses: [], root: '../', require: true });
})();
