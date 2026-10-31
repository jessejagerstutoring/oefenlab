/*
 * Wiskunde A · Normale verdeling en toetsen
 * Op het tentamen werk je zonder grafische rekenmachine. Daarom komen kansen uit de
 * vuistregels (68% en 95%) of uit een gegeven figuur, en grenzen uit de formulelijst.
 */
const NV_CTX = [
  { wat: 'appels', een: 'appel', grootheid: 'gewicht', Lid: 'Het gewicht', gem: 'het gemiddelde gewicht', tot: 'het totale gewicht', eenheid: 'g', mu: [150, 160, 180], sd: [6, 8, 10] },
  { wat: 'blikjes energiedrank', een: 'blikje', grootheid: 'inhoud', Lid: 'De inhoud', gem: 'de gemiddelde inhoud', tot: 'de totale inhoud', eenheid: 'ml', mu: [250, 330], sd: [2, 3, 4] },
  { wat: 'zakken chips', een: 'zak', grootheid: 'gewicht', Lid: 'Het gewicht', gem: 'het gemiddelde gewicht', tot: 'het totale gewicht', eenheid: 'g', mu: [150, 200, 225], sd: [4, 5, 6] },
  { wat: 'potten pindakaas', een: 'pot', grootheid: 'inhoud', Lid: 'De inhoud', gem: 'de gemiddelde inhoud', tot: 'de totale inhoud', eenheid: 'g', mu: [350, 450], sd: [5, 8, 10] },
];
const VUIST = [2.5, 13.5, 34, 34, 13.5, 2.5]; // stukjes tussen −∞, −2σ, −σ, μ, +σ, +2σ, ∞
const vuist = (a, b) => VUIST.slice(a + 3, b + 3).reduce((s, x) => s + x, 0); // a, b in −3 … 3 (±3 = oneindig)
const dens = (mu, sd) => x => Math.exp(-((x - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI)) * 100;
const nvPlot = (mu, sd, from, to, before, after) => ({ curves: [{ f: dens(mu, sd), tex: `\\mu = ${mu},\\; \\sigma = ${td(sd)}` }], keys: [mu - 3 * sd, mu + 3 * sd], marks: [], shade: { from, to }, before, after });
const sigTxt = k => (k === 0 ? '\\mu' : `\\mu ${k > 0 ? '+' : '-'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}\\sigma`);
const nvCtx = () => { const k = ri(0, NV_CTX.length - 1), C = NV_CTX[k]; return { k, mu: pick(C.mu), sd: pick(C.sd) }; };

/* ---------- vuistregels ---------- */
function randVuist(lvl) {
  let a, b; do { a = ri(-3, 2); b = ri(a + 1, 3); } while ((a === -3 && b === 3) || (lvl === 1 && (a === -3 || b === 3)));
  return { ...nvCtx(), a, b, N: lvl >= 2 && Math.random() < 0.4 ? pick([200, 500, 1000, 2000]) : 0 };
}
function buildVuist({ k, mu, sd, a, b, N }) {
  const C = NV_CTX[k], pct = vuist(a, b), lo = mu + a * sd, hi = mu + b * sd;
  const bereik = a === -3 ? `minder dan ${hi} ${C.eenheid}` : b === 3 ? `meer dan ${lo} ${C.eenheid}` : `tussen ${lo} ${C.eenheid} en ${hi} ${C.eenheid}`;
  const ans = N ? N * pct / 100 : pct;
  return {
    type: 'normaal', pts: 4,
    prompt: `${C.Lid} van ${C.wat} is normaal verdeeld met \\(\\mu = ${mu}\\) ${C.eenheid} en \\(\\sigma = ${sd}\\) ${C.eenheid}. ${N ? `Een winkel heeft ${N} ${C.wat}. Hoeveel daarvan hebben volgens de vuistregels een ${C.grootheid} ${bereik}?` : `Hoeveel procent van de ${C.wat} heeft volgens de vuistregels een ${C.grootheid} ${bereik}?`}`,
    steps: [
      mc('Grenzen', 'Hoe schrijf je de grenzen met μ en σ?', [
        opt(M([a > -3 ? `${lo} = ${sigTxt(a)}` : '', b < 3 ? `${hi} = ${sigTxt(b)}` : ''].filter(Boolean).join(',\\; ')), true, 'Klopt: tel hoeveel keer σ je van μ af zit.'),
        opt(M([a > -3 ? `${lo} = ${sigTxt(a === 0 ? 1 : -a)}` : '', b < 3 ? `${hi} = ${sigTxt(b === 0 ? -1 : -b)}` : ''].filter(Boolean).join(',\\; ')), false, 'Kijk of de grens boven of onder μ ligt.'),
      ], { th: ['nv-vuistregels'], write: [[a > -3 ? `${lo} = ${sigTxt(a)}` : '', b < 3 ? `${hi} = ${sigTxt(b)}` : ''].filter(Boolean).join(',\\; ')] }),
      num('Percentage', 'Tel de stukjes van de vuistregels op. Hoeveel procent is dat?', [pct], { dp: 1, hint: 'De stukjes zijn 2,5 · 13,5 · 34 · 34 · 13,5 · 2,5.', write: [`${VUIST.slice(a + 3, b + 3).map(x => td(x)).join(' + ')} = ${td(pct)}\\%`] }),
      ...(N ? [num('Aantal', `Hoeveel ${C.wat} van de ${N} is dat?`, [ans], { dp: 1, write: [`${td(pct / 100)} \\cdot ${N} = ${td(ans)}`] })] : []),
    ],
    final: [{ label: N ? 'aantal' : 'procent', answers: [ans], dp: 1 }],
    plot: nvPlot(mu, sd, a === -3 ? mu - 4 * sd : lo, b === 3 ? mu + 4 * sd : hi, 'Welk stuk onder de klok hoort bij de vraag?', `Het gekleurde stuk is ${nl(pct, 1)}% van alles.`),
    verify: () => near(VUIST.reduce((s, x) => s + x, 0), 100, 1e-9) && (b - a === 2 && a === -1 ? near(pct, 68, 1e-9) : true) && (a === -2 && b === 2 ? near(pct, 95, 1e-9) : true),
  };
}

/* ---------- kans met een gegeven oppervlakte ---------- */
const GEGEVEN = [
  { van: -1.5, tot: -1, p: 0.092, vragen: [[1, 1.5, 0.092, 'symmetrie'], [-3, -1.5, 0.068, '0,16 − 0,092'], [-1.5, 0, 0.432, '0,092 + 0,34'], [-1.5, 1, 0.772, '0,092 + 0,68']] },
  { van: 0, tot: 0.5, p: 0.192, vragen: [[-0.5, 0.5, 0.384, '2 · 0,192'], [0.5, 1, 0.148, '0,34 − 0,192'], [0.5, 3, 0.308, '0,5 − 0,192'], [-0.5, 0, 0.192, 'symmetrie']] },
];
function randFiguur() { return { ...nvCtx(), g: ri(0, 1), v: ri(0, 3) }; }
function buildFiguur({ k, mu, sd, g, v }) {
  const C = NV_CTX[k], G = GEGEVEN[g], [a, b, ans, hoe] = G.vragen[v];
  const x = s => (s === 3 ? null : s === -3 ? null : mu + s * sd), lo = x(a), hi = x(b);
  const bereik = a === -3 ? `minder dan ${nl(hi)} ${C.eenheid}` : b === 3 ? `meer dan ${nl(lo)} ${C.eenheid}` : `tussen ${nl(lo)} ${C.eenheid} en ${nl(hi)} ${C.eenheid}`;
  const sg = s => (s === 0 ? '\\mu' : `\\mu ${s > 0 ? '+' : '-'} ${Math.abs(s) === 1 ? '' : td(Math.abs(s))}\\sigma`);
  return {
    type: 'normaal', pts: 4,
    prompt: `${C.Lid} van ${C.wat} is normaal verdeeld met \\(\\mu = ${mu}\\) en \\(\\sigma = ${sd}\\). In een figuur is gegeven: \\(P(${sg(G.van)} < X < ${sg(G.tot)}) = ${td(G.p)}\\). Bereken met de figuur en de vuistregels de kans dat een ${C.een} een ${C.grootheid} ${bereik} heeft.`,
    steps: [
      mc('Grenzen', 'Hoe schrijf je de grenzen met μ en σ?', [
        opt(M([lo !== null ? `${nl(lo)} = ${sg(a)}` : '', hi !== null ? `${nl(hi)} = ${sg(b)}` : ''].filter(Boolean).join(',\\; ')), true, 'Klopt.'),
        opt(M([lo !== null ? `${nl(lo)} = ${sg(-a || 1)}` : '', hi !== null ? `${nl(hi)} = ${sg(-b || -1)}` : ''].filter(Boolean).join(',\\; ')), false, 'Ligt de grens boven of onder μ?'),
      ], { th: ['nv-figuur', 'nv-vuistregels'] }),
      num('Kans', 'Combineer het gegeven stuk met de vuistregels en symmetrie. Rond af op 3 decimalen.', [ans], { dp: 3, hint: `Denk aan: tussen μ en μ + σ ligt 0,34, boven μ + σ ligt 0,16.`, write: [`P = ${hoe.replace(/,/g, '{,}')} = ${td(ans)}`] }),
    ],
    final: [{ label: 'P', answers: [ans], dp: 3 }],
    plot: nvPlot(mu, sd, lo === null ? mu - 4 * sd : lo, hi === null ? mu + 4 * sd : hi, 'Welk stuk wordt gevraagd?', `Dat stuk is ${nl(ans, 3)}.`),
    verify: () => { const Phi = z => 0.5 * (1 + erf(z / Math.SQRT2)); const exact = (b === 3 ? 1 : Phi(b)) - (a === -3 ? 0 : Phi(a)); return Math.abs(exact - ans) < 0.006; },
  };
}
function erf(x) { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }

/* ---------- totaal en gemiddelde: de √n-wet ---------- */
function randSom(lvl) { return { ...nvCtx(), vorm: pick(lvl === 1 ? ['som'] : ['som', 'doos', 'gem']), n: pick([4, 9, 16, 25, 36]), md: pick([30, 40, 50]), sdd: pick([2, 3, 4]) }; }
function buildSom({ k, mu, sd, vorm, n, md, sdd }) {
  const C = NV_CTX[k], ES = n * mu, sS = Math.sqrt(n) * sd;
  if (vorm === 'gem') {
    const s = sd / Math.sqrt(n);
    return {
      type: 'normaal', pts: 3, prompt: `${C.Lid} van ${C.wat} is normaal verdeeld met \\(\\mu = ${mu}\\) en \\(\\sigma = ${sd}\\). Iemand neemt ${n} ${C.wat} en berekent ${C.gem}. Bereken het gemiddelde en de standaardafwijking van dat steekproefgemiddelde.`,
      steps: [
        num('Gemiddelde', 'Wat is E(X̄)?', [mu], { hint: 'Het gemiddelde van n stuks heeft hetzelfde gemiddelde.', write: [`E(\\bar X) = ${mu}`], th: ['nv-som'] }),
        num('Standaardafwijking', 'Wat is σ(X̄)? Rond af op 2 decimalen.', [s], { dp: 2, hint: `σ / √${n}`, write: [`\\sigma(\\bar X) = \\dfrac{${sd}}{\\sqrt{${n}}} ${eqd(s, 2)}`] }),
      ],
      final: [{ label: 'σ', answers: [s], dp: 2 }], verify: () => near(s * Math.sqrt(n), sd, 1e-9),
    };
  }
  const steps = [
    num('Gemiddelde totaal', `Wat is gemiddeld ${C.tot} van ${n} ${C.wat}?`, [ES], { hint: `${n} · ${mu}`, write: [`E(S) = ${n} \\cdot ${mu} = ${ES}`], th: ['nv-som'] }),
    mc('Standaardafwijking', 'Hoe bereken je σ(S)?', [
      opt(M(`\\sqrt{${n}} \\cdot ${sd}`), true, 'Klopt: de √n-wet uit de formulelijst.'),
      opt(M(`${n} \\cdot ${sd}`), false, 'Afwijkingen heffen elkaar deels op. Daarom √n, niet n.'),
      opt(M(`${sd} / \\sqrt{${n}}`), false, 'Dat is de standaardafwijking van het gemiddelde, niet van het totaal.'),
    ]),
    num('σ(S)', 'Bereken σ(S). Rond af op 2 decimalen.', [sS], { dp: 2, write: [`\\sigma(S) = \\sqrt{${n}} \\cdot ${sd} ${eqd(sS, 2)}`] }),
  ];
  if (vorm === 'doos') {
    const ET = ES + md, sT = Math.sqrt(sS * sS + sdd * sdd);
    steps.push(num('Met verpakking', `De lege verpakking weegt gemiddeld ${md} met σ = ${sdd}. Wat is de standaardafwijking van het totaal met verpakking? Rond af op 2 decimalen.`, [sT], { dp: 2, hint: '√(σ₁² + σ₂²)', write: [`E = ${ES} + ${md} = ${ET}`, `\\sigma = \\sqrt{${td(sS, 2)}^2 + ${sdd}^2} \\approx ${dec(sT, 2).replace(',', '{,}')}`] }));
    return { type: 'normaal', pts: 5, prompt: `${C.Lid} van ${C.wat} is normaal verdeeld met \\(\\mu = ${mu}\\) en \\(\\sigma = ${sd}\\). Een verpakking bevat ${n} ${C.wat}. Bereken het gemiddelde en de standaardafwijking van ${C.tot}, eerst zonder en dan met verpakking.`, steps, final: [{ label: 'σ', answers: [sT], dp: 2 }], verify: () => near(sT * sT, n * sd * sd + sdd * sdd, 1e-9) };
  }
  return { type: 'normaal', pts: 4, prompt: `${C.Lid} van ${C.wat} is normaal verdeeld met \\(\\mu = ${mu}\\) en \\(\\sigma = ${sd}\\). Een verpakking bevat ${n} ${C.wat}. Bereken het gemiddelde en de standaardafwijking van ${C.tot}.`, steps, final: [{ label: 'σ', answers: [sS], dp: 2 }], verify: () => near(sS * sS, n * sd * sd, 1e-9) };
}

/* ---------- normaal en binomiaal ---------- */
function randNBinom() { return { ...nvCtx(), r: pick(['onder', 'boven', 'ver']), n: ri(4, 10) }; }
function buildNBinom({ k, mu, sd, r, n }) {
  const C = NV_CTX[k], p = r === 'onder' ? 0.5 : r === 'boven' ? 0.16 : 0.025, grens = r === 'onder' ? mu : r === 'boven' ? mu + sd : mu - 2 * sd;
  const wat = r === 'onder' ? `minder dan ${grens} ${C.eenheid}` : r === 'boven' ? `meer dan ${grens} ${C.eenheid}` : `minder dan ${grens} ${C.eenheid}`;
  const kk = Math.max(1, Math.min(n - 1, Math.round(n * p))), ans = nCr(n, kk) * p ** kk * (1 - p) ** (n - kk);
  return {
    type: 'normaal', pts: 5, prompt: `${C.Lid} van ${C.wat} is normaal verdeeld met \\(\\mu = ${mu}\\) en \\(\\sigma = ${sd}\\). Je koopt ${n} ${C.wat}. Bereken met de vuistregels de kans dat precies ${kk} daarvan ${wat} hebben. Rond af op 4 decimalen.`,
    steps: [
      num('Kans per stuk', `Wat is de kans dat één ${C.een} ${wat} heeft?`, [p], { dp: 3, hint: r === 'onder' ? 'Precies de helft ligt onder μ.' : r === 'boven' ? 'Boven μ + σ ligt 16%.' : 'Onder μ − 2σ ligt 2,5%.', write: [`p = ${td(p)}`], th: ['nv-binom', 'nv-vuistregels'] }),
      num('Binomiaal', `Bereken P(X = ${kk}) met n = ${n} en p = ${nl(p, 3)}. Rond af op 4 decimalen.`, [ans], { dp: 4, hint: 'Binomiale formule uit de formulelijst.', write: [`P(X = ${kk}) = \\binom{${n}}{${kk}} \\cdot ${td(p)}^{${kk}} \\cdot ${td(1 - p)}^{${n - kk}} \\approx ${dec(ans, 4).replace(',', '{,}')}`], th: ['kans-binom'] }),
    ],
    final: [{ label: 'P', answers: [ans], dp: 4 }], verify: () => ans > 0 && ans < 1 && near(binomSom(n, p), 1, 1e-9),
  };
}
const binomSom = (n, p) => { let s = 0; for (let j = 0; j <= n; j++) s += nCr(n, j) * p ** j * (1 - p) ** (n - j); return s; };
const nCr = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };

/* ---------- twee verdelingen vergelijken ---------- */
function randVergelijk() {
  const g = pick([175, 180, 185]); let A, B;
  do { A = { mu: g - ri(5, 15), sd: pick([4, 5, 6, 7, 8]) }; B = { mu: g - ri(5, 15), sd: pick([4, 5, 6, 7, 8]) }; } while (Math.abs((g - A.mu) / A.sd - (g - B.mu) / B.sd) < 0.2);
  return { g, A, B };
}
function buildVergelijk({ g, A, B }) {
  const zA = (g - A.mu) / A.sd, zB = (g - B.mu) / B.sd, Bmeer = zB > zA;
  return {
    type: 'normaal', pts: 4, prompt: `De lengte van mannen in land A is normaal verdeeld met \\(\\mu = ${A.mu}\\) cm en \\(\\sigma = ${A.sd}\\) cm, in land B met \\(\\mu = ${B.mu}\\) cm en \\(\\sigma = ${B.sd}\\) cm. In welk land is het percentage mannen korter dan ${g} cm het hoogst? Licht toe.`,
    steps: [
      num('Land A', `Hoeveel σ ligt ${g} boven het gemiddelde in land A? Rond af op 2 decimalen.`, [zA], { dp: 2, hint: `(${g} − ${A.mu}) / ${A.sd}`, write: [`A: \\dfrac{${g} - ${A.mu}}{${A.sd}} \\approx ${dec(zA, 2).replace(',', '{,}')}\\sigma`], th: ['nv-vergelijk'] }),
      num('Land B', `En in land B? Rond af op 2 decimalen.`, [zB], { dp: 2, write: [`B: \\dfrac{${g} - ${B.mu}}{${B.sd}} \\approx ${dec(zB, 2).replace(',', '{,}')}\\sigma`] }),
      mc('Conclusie', 'Waar is het percentage onder de grens het hoogst?', [
        opt('Land A', !Bmeer, !Bmeer ? 'Klopt: in A ligt de grens meer σ boven het gemiddelde, dus valt er meer onder.' : 'In B ligt de grens meer σ boven het gemiddelde.'),
        opt('Land B', Bmeer, Bmeer ? 'Klopt: in B ligt de grens meer σ boven het gemiddelde, dus valt er meer onder.' : 'In A ligt de grens meer σ boven het gemiddelde.'),
      ], { keepOrder: true }),
    ],
    final: [{ label: 'z', answers: [Bmeer ? zB : zA], dp: 2 }],
    verify: () => (zB > zA) === Bmeer,
  };
}

/* ---------- toetsen ---------- */
const TOETS_CTX = [
  { claim: m => `Een fabrikant zegt dat een zak chips gemiddeld ${m} g weegt.`, twijfel: 'Een consumentenclub denkt dat het minder is.', kant: 'links', var: 'het gemiddelde gewicht' },
  { claim: m => `Op een blikje staat dat er gemiddeld ${m} mg cafeïne in zit.`, twijfel: 'Een consumentenorganisatie denkt dat het meer is.', kant: 'rechts', var: 'de gemiddelde hoeveelheid cafeïne' },
  { claim: m => `Een machine moet flessen vullen met gemiddeld ${m} ml.`, twijfel: 'De controleur wil weten of de machine nog goed is afgesteld (te veel of te weinig).', kant: 'twee', var: 'de gemiddelde inhoud' },
];
const Z = { links: { 0.05: 1.645, 0.01: 2.33 }, rechts: { 0.05: 1.645, 0.01: 2.33 }, twee: { 0.05: 1.96, 0.01: 2.58 } };
function randHyp() { return { c: ri(0, 2), m: pick([75, 150, 250, 500]) }; }
function buildHyp({ c, m }) {
  const T = TOETS_CTX[c], teken = { links: '<', rechts: '>', twee: '\\neq' }[T.kant];
  return {
    type: 'normaal', pts: 2, prompt: `${T.claim(m)} ${T.twijfel} Formuleer de nulhypothese en de alternatieve hypothese.`,
    steps: [
      mc('H₀', 'Wat is de nulhypothese?', [
        opt(M(`H_0: \\mu = ${m}`), true, 'Klopt: H₀ is de bewering, met een is-teken.'),
        opt(M(`H_0: \\mu ${teken} ${m}`), false, 'Dat is wat de twijfelaar denkt: dat is H₁.'),
        opt(M(`H_0: p = ${m}`), false, `Het gaat om ${T.var}, dus μ, geen kans p.`),
      ], { th: ['toets-hyp'], write: [`H_0: \\mu = ${m}`] }),
      mc('H₁', 'Wat is de alternatieve hypothese?', [
        opt(M(`H_1: \\mu < ${m}`), T.kant === 'links', T.kant === 'links' ? 'Klopt: "minder" geeft <.' : 'Lees nog eens wat er vermoed wordt.'),
        opt(M(`H_1: \\mu > ${m}`), T.kant === 'rechts', T.kant === 'rechts' ? 'Klopt: "meer" geeft >.' : 'Lees nog eens wat er vermoed wordt.'),
        opt(M(`H_1: \\mu \\neq ${m}`), T.kant === 'twee', T.kant === 'twee' ? 'Klopt: te veel óf te weinig, dus ≠.' : 'Er wordt maar één kant op getwijfeld.'),
      ], { keepOrder: true, write: [`H_1: \\mu ${teken} ${m}`] }),
    ],
    final: [{ label: 'μ', answers: [m], dp: 0 }], verify: () => true,
  };
}
function randParam(lvl) { return { bin: lvl >= 2 && Math.random() < 0.35, m: pick([75, 150, 250, 500]), sd: pick([1.2, 2, 4, 5, 6]), n: pick([16, 25, 36, 49, 64, 100]), p: pick([0.2, 0.3, 0.4, 0.6]), nb: pick([50, 80, 100, 200]) }; }
function buildParam({ bin, m, sd, n, p, nb }) {
  if (bin) {
    const E = nb * p, s = Math.sqrt(nb * p * (1 - p));
    return {
      type: 'normaal', pts: 3, prompt: `Een webwinkel zegt dat ${nl(p * 100)}% van de klanten een product terugstuurt. Een onderzoeker telt bij ${nb} bestellingen hoeveel er worden teruggestuurd. Bereken de verwachtingswaarde en de standaardafwijking van dit aantal als de bewering klopt.`,
      steps: [
        num('Verwachting', 'E(X) = n · p = …', [E], { dp: 2, write: [`E(X) = ${nb} \\cdot ${td(p)} = ${td(E)}`], th: ['toets-param', 'kans-binom'] }),
        num('Standaardafwijking', 'σ(X) = √(n · p · (1 − p)). Rond af op 3 decimalen.', [s], { dp: 3, write: [`\\sigma(X) = \\sqrt{${nb} \\cdot ${td(p)} \\cdot ${td(1 - p)}} \\approx ${dec(s, 3).replace(',', '{,}')}`] }),
      ],
      final: [{ label: 'σ', answers: [s], dp: 3 }], verify: () => near(s * s, E * (1 - p), 1e-9),
    };
  }
  const sT = sd / Math.sqrt(n);
  return {
    type: 'normaal', pts: 3, prompt: `Bij een toets is \\(H_0: \\mu = ${m}\\). De metingen zijn normaal verdeeld met \\(\\sigma = ${td(sd)}\\). Er wordt een steekproef van ${n} stuks genomen. Bereken de parameters \\(\\mu_T\\) en \\(\\sigma_T\\) van de toetsingsgrootheid (het steekproefgemiddelde).`,
    steps: [
      num('μ_T', 'Wat is μ_T?', [m], { hint: 'Het gemiddelde uit H₀.', write: [`\\mu_T = ${m}`], th: ['toets-param'] }),
      num('σ_T', 'Wat is σ_T? Rond af op 3 decimalen.', [sT], { dp: 3, hint: `σ / √${n}`, write: [`\\sigma_T = \\dfrac{${td(sd)}}{\\sqrt{${n}}} ${eqd(sT, 3)}`] }),
    ],
    final: [{ label: 'σT', answers: [sT], dp: 3 }], verify: () => near(sT * Math.sqrt(n), sd, 1e-9),
  };
}
function randConclusie(lvl) {
  for (;;) {
    const c = ri(0, lvl === 1 ? 1 : 2), m = pick([75, 150, 250, 500]), sd = pick([2, 4, 5, 6, 8]), n = pick([16, 25, 36, 64]), a = lvl === 3 && Math.random() < 0.4 ? 0.01 : 0.05;
    const kant = TOETS_CTX[c].kant, sT = sd / Math.sqrt(n), z = Z[kant][a], dir = kant === 'links' ? -1 : 1;
    const x = Math.round((m + dir * pick([0.6, 1, 1.4, 2, 2.6, 3]) * sT) * 10) / 10, g = m + dir * z * sT;
    if (Math.abs(x - g) > 0.15 * sT && Math.abs(x - (m - z * sT)) > 0.15 * sT) return { c, m, sd, n, a, x };
  }
}
function buildConclusie({ c, m, sd, n, a, x }) {
  const T = TOETS_CTX[c], kant = T.kant, sT = sd / Math.sqrt(n), z = Z[kant][a];
  const gs = kant === 'twee' ? [m - z * sT, m + z * sT] : [m + (kant === 'links' ? -1 : 1) * z * sT];
  const inGebied = kant === 'links' ? x <= gs[0] : kant === 'rechts' ? x >= gs[0] : x <= gs[0] || x >= gs[1];
  return {
    type: 'normaal', pts: 6,
    prompt: `${T.claim(m)} ${T.twijfel} De metingen zijn normaal verdeeld met \\(\\sigma = ${sd}\\). In een steekproef van ${n} stuks is ${T.var} ${nl(x, 1)}. Wat is de conclusie van de toets bij \\(\\alpha = ${td(a)}\\)?`,
    steps: [
      mc('Soort toets', 'Welke kant toets je?', [
        opt('Linkszijdig', kant === 'links', kant === 'links' ? 'Klopt: H₁ zegt "minder".' : 'Kijk naar H₁.'),
        opt('Rechtszijdig', kant === 'rechts', kant === 'rechts' ? 'Klopt: H₁ zegt "meer".' : 'Kijk naar H₁.'),
        opt('Tweezijdig', kant === 'twee', kant === 'twee' ? 'Klopt: te veel of te weinig.' : 'Kijk naar H₁.'),
      ], { keepOrder: true, th: ['toets-conclusie', 'toets-hyp'], write: [`H_0: \\mu = ${m},\\; H_1: \\mu ${{ links: '<', rechts: '>', twee: '\\neq' }[kant]} ${m}`] }),
      num('σ_T', 'Bereken σ_T. Rond af op 3 decimalen.', [sT], { dp: 3, hint: `${sd} / √${n}`, write: [`\\sigma_T = \\dfrac{${sd}}{\\sqrt{${n}}} ${eqd(sT, 3)}`], th: ['toets-param'] }),
      num(kant === 'twee' ? 'Grenzen' : 'Grens', `Bereken ${kant === 'twee' ? 'beide grenzen' : 'de grens'} van het verwerpingsgebied met de formulelijst. Rond af op 2 decimalen.`, gs, { dp: 2, hint: `g = μ_T ${kant === 'links' ? '−' : kant === 'rechts' ? '+' : '±'} ${nl(z, 3)} · σ_T`, write: [kant === 'twee' ? `g_l \\approx ${dec(gs[0], 2).replace(',', '{,}')},\\; g_r \\approx ${dec(gs[1], 2).replace(',', '{,}')}` : `g = ${m} ${kant === 'links' ? '-' : '+'} ${td(z)} \\cdot ${td(sT, 3)} \\approx ${dec(gs[0], 2).replace(',', '{,}')}`] }),
      mc('Conclusie', `De steekproef gaf ${nl(x, 1)}. Wat is de conclusie?`, [
        opt('H₀ verwerpen', inGebied, inGebied ? `Klopt: ${nl(x, 1)} ligt in het verwerpingsgebied.` : `${nl(x, 1)} ligt niet in het verwerpingsgebied.`),
        opt('H₀ niet verwerpen', !inGebied, !inGebied ? `Klopt: ${nl(x, 1)} ligt niet in het verwerpingsgebied. Er is dus geen reden om de bewering te verwerpen.` : `${nl(x, 1)} ligt wel in het verwerpingsgebied.`),
      ], { keepOrder: true, write: [inGebied ? `${nl(x, 1)} \\text{ ligt in het verwerpingsgebied: } H_0 \\text{ verwerpen}` : `${nl(x, 1)} \\text{ ligt niet in het verwerpingsgebied: } H_0 \\text{ niet verwerpen}`] }),
    ],
    final: [{ label: 'g', answers: gs, dp: 2 }],
    plot: { curves: [{ f: dens(m, sT), tex: `\\mu_T = ${m},\\; \\sigma_T \\approx ${td(sT, 3)}` }], keys: [m - 3.5 * sT, m + 3.5 * sT], marks: [{ x, y: 0, lab: `${nl(x, 1)}` }], shade: kant === 'links' ? { from: m - 5 * sT, to: gs[0] } : kant === 'rechts' ? { from: gs[0], to: m + 5 * sT } : { from: gs[1], to: m + 5 * sT }, before: 'Het gekleurde stuk is het verwerpingsgebied.', after: inGebied ? 'De uitkomst ligt in het verwerpingsgebied.' : 'De uitkomst ligt erbuiten.' },
    verify: () => { const Phi = t => 0.5 * (1 + erf(t / Math.SQRT2)); const zz = (x - m) / sT, pOver = kant === 'links' ? Phi(zz) : kant === 'rechts' ? 1 - Phi(zz) : 2 * (1 - Phi(Math.abs(zz))); return (pOver < a) === inGebied; },
  };
}

const COURSE = maakOnderdeel({
  onderdeel: 'normaal',
  home: { titel: 'Normale verdeling en toetsen', tekst: 'Dit onderdeel levert gemiddeld de meeste punten op. Hypothesen opstellen en een conclusie trekken komen in vrijwel elk tentamen terug: die stappen zijn altijd hetzelfde.' },
  gens: {
    tConclusie: { topic: 'toets-conclusie', rand: randConclusie, build: buildConclusie, w: 2.5 },
    tHyp: { topic: 'toets-hyp', rand: randHyp, build: buildHyp, w: 1.5 },
    nFiguur: { topic: 'nv-figuur', rand: randFiguur, build: buildFiguur, w: 1.5 },
    nSom: { topic: 'nv-som', rand: randSom, build: buildSom, w: 1.5 },
    nBinom: { topic: 'nv-binom', rand: randNBinom, build: buildNBinom, w: 1.2 },
    nVuist: { topic: 'nv-vuistregels', rand: randVuist, build: buildVuist, w: 1.2 },
    tParam: { topic: 'toets-param', rand: randParam, build: buildParam, w: 0.8 },
    nVergelijk: { topic: 'nv-vergelijk', rand: randVergelijk, build: buildVergelijk, w: 0.6 },
  },
});
