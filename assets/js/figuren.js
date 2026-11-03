/*
 * Figuren zoals ze op het tentamen staan: een normale kromme met een gearceerd stuk,
 * een kansboom, een tabel en het rooster van twee dobbelstenen.
 * FIGUUR(spec) geeft html terug; wiskunde in labels mag tussen \( \) staan (MathJax zet het om).
 */
const FIGUUR = (() => {
  const r1 = n => +n.toFixed(1);
  const C = { lijn: '#2563eb', vlak: '#c7d7fb', accent: '#e08600', as: '#9aa0b4', tekst: '#4b4f63' };
  const phi = z => Math.exp(-z * z / 2);
  // op een smal scherm een kleiner tekenvlak, zodat de tekst in de figuur niet mee krimpt
  const smal = () => typeof innerWidth !== 'undefined' && innerWidth < 560;
  const sigLabel = k => (k === 0 ? 'μ' : `μ ${k > 0 ? '+' : '−'} ${Math.abs(k) === 0.5 ? '½' : Math.abs(k) === 1 ? '' : Math.abs(k) === 1.5 ? '1½' : Math.abs(k)}σ`);

  // normale kromme; van en tot in σ-eenheden (±Infinity voor een staart)
  function normaal({ van, tot, labels = [-2, -1, 0, 1, 2], waarden = null, onderschrift = '' }) {
    const W = smal() ? 340 : 520, H = smal() ? 170 : 190, L = 14, R = 14, T = 14, B = 52, z0 = -3.4, z1 = 3.4, fs = smal() && labels.length > 5 ? 11 : 13;
    const X = z => r1(L + (z - z0) / (z1 - z0) * (W - L - R)), Y = y => r1(H - B - y * (H - B - T));
    const pts = (a, b) => Array.from({ length: 121 }, (_, i) => { const z = a + (b - a) * i / 120; return `${X(z)} ${Y(phi(z))}`; });
    const a = Math.max(z0, van), b = Math.min(z1, tot);
    const vlak = `M${X(a)} ${Y(0)}L${pts(a, b).join('L')}L${X(b)} ${Y(0)}Z`;
    const ticks = labels.map(k => `<line x1="${X(k)}" x2="${X(k)}" y1="${Y(0)}" y2="${Y(0) + 6}" stroke="${C.as}" stroke-width="1.5"/>
      <text x="${X(k)}" y="${Y(0) + 22}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${C.tekst}">${sigLabel(k)}</text>
      ${waarden ? `<text x="${X(k)}" y="${Y(0) + 40}" text-anchor="middle" font-size="${fs - 1}" font-weight="600" fill="${C.as}">${waarden(k)}</text>` : ''}`).join('');
    return `<figure class="fig">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Normale kromme met een gearceerd stuk">
        <path d="${vlak}" fill="${C.vlak}"/>
        <line x1="${L}" x2="${W - R}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.as}" stroke-width="1.5"/>
        <path d="M${pts(z0, z1).join('L')}" fill="none" stroke="${C.lijn}" stroke-width="3" stroke-linejoin="round"/>
        ${isFinite(van) && van > z0 ? `<line x1="${X(van)}" x2="${X(van)}" y1="${Y(0)}" y2="${Y(phi(van))}" stroke="${C.lijn}" stroke-width="1.5" stroke-dasharray="4 4"/>` : ''}
        ${isFinite(tot) && tot < z1 ? `<line x1="${X(tot)}" x2="${X(tot)}" y1="${Y(0)}" y2="${Y(phi(tot))}" stroke="${C.lijn}" stroke-width="1.5" stroke-dasharray="4 4"/>` : ''}
        ${ticks}
      </svg>
      ${onderschrift ? `<figcaption>${onderschrift}</figcaption>` : ''}</figure>`;
  }

  // kansboom met twee niveaus; takken: [{ label, p, kids: [{ label, p, uit }] }]
  // de kansen staan bij de takken, de takken staan ver genoeg uit elkaar om ze te lezen
  function boom({ takken, onderschrift = '', markeer = [] }) {
    const leaves = takken.reduce((s, t) => s + t.kids.length, 0), rowH = 48, H = leaves * rowH + 12, W = smal() ? 360 : 540;
    const x0 = 14, x1 = smal() ? 120 : 200, x2 = smal() ? 226 : 380, y0 = H / 2, out = [];
    const lbl = (x, y, t, anchor = 'middle', kleur = C.tekst) => (t ? `<text x="${r1(x)}" y="${r1(y)}" text-anchor="${anchor}" font-size="14" font-weight="700" fill="${kleur}">${t}</text>` : '');
    const tak = (xa, ya, xb, yb, p, on, t = 0.55) => `<path d="M${xa} ${r1(ya)}L${xb} ${r1(yb)}" stroke="${on ? C.accent : C.lijn}" stroke-width="${on ? 3.5 : 2.5}"/>` + lbl(xa + (xb - xa) * t, ya + (yb - ya) * t - 8, p, 'middle', on ? C.accent : C.tekst);
    let row = 0;
    takken.forEach((t, i) => {
      const ys = t.kids.map(() => 6 + rowH / 2 + (row++) * rowH), y1 = ys.reduce((s, y) => s + y, 0) / ys.length;
      out.push(tak(x0, y0, x1, y1, t.p, markeer.some(m => m[0] === i), 0.62));
      out.push(`<circle cx="${x1}" cy="${r1(y1)}" r="5" fill="${C.lijn}"/>` + lbl(x1, y1 - 12, t.label));
      t.kids.forEach((k, j) => {
        const on = markeer.some(m => m[0] === i && m[1] === j);
        out.push(tak(x1, y1, x2, ys[j], k.p, on));
        out.push(`<circle cx="${x2}" cy="${r1(ys[j])}" r="5" fill="${on ? C.accent : C.lijn}"/>` + lbl(x2 + 12, ys[j] + 5, [k.label, k.uit].filter(Boolean).join('  →  '), 'start'));
      });
    });
    return `<figure class="fig"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kansboom"><circle cx="${x0}" cy="${r1(y0)}" r="5" fill="${C.lijn}"/>${out.join('')}</svg>${onderschrift ? `<figcaption>${onderschrift}</figcaption>` : ''}</figure>`;
  }

  // tabel; kop is de bovenste rij, de eerste kolom wordt vet als kopKolom
  function tabel({ kop, rijen, kopKolom = true, onderschrift = '', leeg = '…' }) {
    const cel = v => (v === null || v === undefined ? `<span class="leeg">${leeg}</span>` : v);
    return `<figure class="fig fig-tabel"><div class="tw"><table>
      ${kop ? `<thead><tr>${kop.map(h => `<th>${cel(h)}</th>`).join('')}</tr></thead>` : ''}
      <tbody>${rijen.map(r => `<tr>${r.map((v, i) => (i === 0 && kopKolom ? `<th>${cel(v)}</th>` : `<td>${cel(v)}</td>`)).join('')}</tr>`).join('')}</tbody>
    </table></div>${onderschrift ? `<figcaption>${onderschrift}</figcaption>` : ''}</figure>`;
  }

  // rooster van twee dobbelstenen; goed(i, j) kleurt de gunstige uitkomsten
  function rooster({ goed, onderschrift = '' }) {
    const s = 34, o = 30, W = o + 6 * s + 4, cells = [];
    for (let i = 1; i <= 6; i++) {
      cells.push(`<text x="${o + (i - 1) * s + s / 2}" y="20" text-anchor="middle" font-size="13" font-weight="800" fill="${C.tekst}">${i}</text>`);
      cells.push(`<text x="14" y="${o + (i - 1) * s + s / 2 + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="${C.tekst}">${i}</text>`);
      for (let j = 1; j <= 6; j++) {
        const g = goed(i, j);
        cells.push(`<rect x="${o + (j - 1) * s + 2}" y="${o + (i - 1) * s + 2}" width="${s - 4}" height="${s - 4}" rx="6" fill="${g ? C.accent : '#fff'}" stroke="${g ? C.accent : '#d5d9e4'}" stroke-width="1.5"/>`);
        cells.push(`<text x="${o + (j - 1) * s + s / 2}" y="${o + (i - 1) * s + s / 2 + 5}" text-anchor="middle" font-size="12" font-weight="700" fill="${g ? '#fff' : C.as}">${i + j}</text>`);
      }
    }
    return `<figure class="fig fig-rooster"><svg viewBox="0 0 ${W} ${W}" role="img" aria-label="Rooster van twee dobbelstenen">${cells.join('')}</svg>${onderschrift ? `<figcaption>${onderschrift}</figcaption>` : ''}</figure>`;
  }

  const SOORTEN = { normaal, boom, tabel, rooster };
  return spec => (spec && SOORTEN[spec.soort] ? SOORTEN[spec.soort](spec) : '');
})();
