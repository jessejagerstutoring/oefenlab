/*
 * Wiskunde A · Lineaire en exponentiële groei
 * Generators per vaardigheid. Elke som is opgebouwd zoals het tentamen het vraagt:
 * een korte context, een formule of gegevens, en een vraag die je algebraïsch oplost.
 * verify() rekent het antwoord op een andere manier na; de test gebruikt dat.
 */
const GROEI_CTX = [
  { wat: 'het aantal gebruikers van een nieuwe app', ev: 'gebruikers', N: 'G', start: 2020, bs: [8000, 12000, 15000, 20000] },
  { wat: 'het aantal inwoners van een nieuwe woonwijk', ev: 'inwoners', N: 'I', start: 2018, bs: [2400, 3000, 4500, 6000] },
  { wat: 'het aantal zeearenden in Nederland', ev: 'zeearenden', N: 'Z', start: 2010, bs: [40, 60, 80, 120] },
  { wat: 'het aantal laadpalen in een provincie', ev: 'laadpalen', N: 'L', start: 2019, bs: [500, 800, 1200, 1500] },
];
const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const groeiPlot = (f, tex, xs, marks, before, after, extra = []) => ({ curves: [{ f, tex }, ...extra], keys: xs, marks, before, after });

/* ---------- groeifactor en groeipercentage ---------- */
function randGFactor(lvl) {
  const soort = pick(lvl === 1 ? ['jaar-maand', 'toename'] : ['jaar-maand', 'week-jaar', 'toename']);
  return { soort, p: pick([12, 15, 18, 20, 25, 30, 40]), q: pick([1.5, 2, 2.5, 3]), c: ri(0, GROEI_CTX.length - 1), a: ri(0, 2), d: pick([2, 3, 5]) };
}
function buildGFactor({ soort, p, q, c, a, d }) {
  const ctx = GROEI_CTX[c];
  if (soort === 'jaar-maand') {
    const gj = 1 + p / 100, gm = Math.pow(gj, 1 / 12), pm = (gm - 1) * 100;
    return {
      type: 'groei', pts: 3, prompt: `${cap(ctx.wat)} groeit met ${p}% per jaar. Met hoeveel procent per maand groeit het? Rond af op 2 decimalen.`,
      steps: [
        num('Groeifactor per jaar', `${p}% groei per jaar. Wat is de groeifactor per jaar?`, [gj], { hint: `Groeifactor = 1 + ${p}/100.`, write: [`g_{\\text{jaar}} = ${td(gj)}`], th: ['groei-factor'] }),
        mc('Per maand', 'Hoe reken je de groeifactor per maand uit?', [
          opt(M(`g_{\\text{maand}} = ${td(gj)}^{1/12}`), true, 'Klopt. Twaalf keer de maandfactor moet de jaarfactor geven, dus je neemt de twaalfde-machtswortel.'),
          opt(M(`g_{\\text{maand}} = ${td(gj)} / 12`), false, 'Delen door 12 klopt niet: groei per maand gaat steeds keer de maandfactor, niet plus.'),
          opt(M(`g_{\\text{maand}} = 1 + ${p}/12/100`), false, `Dit is ${p}% delen door 12. Dat is net te veel, omdat de groei zich opstapelt.`),
          opt(M(`g_{\\text{maand}} = ${td(gj)}^{12}`), false, 'Dit is juist de groeifactor over twaalf jaar.'),
        ], { th: ['groei-factor'] }),
        num('Groeifactor per maand', 'Bereken de groeifactor per maand. Rond af op 4 decimalen.', [gm], { dp: 4, hint: `Typ ${dec(gj, 2)}^(1/12) in op je rekenmachine.`, write: [`g_{\\text{maand}} = ${td(gj)}^{1/12} \\approx ${dec(gm, 4).replace(',', '{,}')}`] }),
        num('Percentage', 'Hoeveel procent per maand is dat? Rond af op 2 decimalen.', [pm], { dp: 2, hint: 'Groeipercentage = (groeifactor − 1) · 100.', write: [`\\text{groei per maand} \\approx ${dec(pm, 2).replace(',', '{,}')}\\%`] }),
      ],
      final: [{ label: 'procent', answers: [pm], dp: 2 }],
      verify: () => near(Math.pow(1 + pm / 100, 12), gj, 1e-3),
    };
  }
  if (soort === 'week-jaar') {
    const gw = 1 + q / 100, gj = Math.pow(gw, 52), pj = (gj - 1) * 100;
    return {
      type: 'groei', pts: 3, prompt: `Het aantal verkochte speeltjes per week neemt elke week toe met ${nl(q, 1)}%. Met hoeveel procent neemt het toe in een jaar (52 weken)? Rond af op hele procenten.`,
      steps: [
        num('Groeifactor per week', 'Wat is de groeifactor per week?', [gw], { hint: `1 + ${nl(q, 1)}/100`, write: [`g_{\\text{week}} = ${td(gw)}`], th: ['groei-factor'] }),
        num('Groeifactor per jaar', 'Bereken de groeifactor per jaar. Rond af op 3 decimalen.', [gj], { dp: 3, hint: `Een jaar is 52 weken: ${dec(gw, 3)}^52.`, write: [`g_{\\text{jaar}} = ${td(gw)}^{52} \\approx ${dec(gj, 3).replace(',', '{,}')}`] }),
        num('Percentage', 'Met hoeveel procent per jaar is dat? Rond af op hele procenten.', [Math.round(pj)], { dp: 0, hint: '(groeifactor − 1) · 100', write: [`\\text{toename} \\approx ${Math.round(pj)}\\%`] }),
      ],
      final: [{ label: 'procent', answers: [Math.round(pj)], dp: 0 }],
      verify: () => near(Math.pow(gw, 52), 1 + pj / 100, 1e-9),
    };
  }
  const b = ctx.bs[a], g = 1 + p / 100, ratio = Math.pow(g, d), pct = (ratio - 1) * 100;
  return {
    type: 'groei', pts: 3, prompt: `Voor ${ctx.wat} geldt \\(${ctx.N} = ${b} \\cdot ${td(g)}^t\\), met \\(t\\) in jaren. Met hoeveel procent neemt ${ctx.wat} toe tussen \\(t = 1\\) en \\(t = ${1 + d}\\)? Rond af op 1 decimaal.`,
    steps: [
      mc('Aanpak', 'Hoe pak je dit het handigst aan?', [
        opt(M(`${td(g)}^{${d}}`), true, `Klopt. In ${d} jaar wordt het ${d} keer met ${td(g)} vermenigvuldigd. Het beginaantal maakt niet uit.`),
        opt(M(`${d} \\cdot ${td(g)}`), false, 'Groei stapelt zich op: je vermenigvuldigt, je telt niet op.'),
        opt(M(`${p} \\cdot ${d}\\%`), false, `${p}% per jaar is over ${d} jaar meer dan ${p * d}%, omdat de groei zich opstapelt.`),
      ], { th: ['groei-factor'] }),
      num('Groeifactor', `Bereken de groeifactor over ${d} jaar. Rond af op 4 decimalen.`, [ratio], { dp: 4, write: [`${td(g)}^{${d}} \\approx ${dec(ratio, 4).replace(',', '{,}')}`] }),
      num('Percentage', 'Hoeveel procent toename is dat? Rond af op 1 decimaal.', [pct], { dp: 1, hint: '(groeifactor − 1) · 100', write: [`\\text{toename} \\approx ${dec(pct, 1).replace(',', '{,}')}\\%`] }),
    ],
    final: [{ label: 'procent', answers: [pct], dp: 1 }],
    verify: () => near((b * Math.pow(g, 1 + d) - b * g) / (b * g) * 100, pct, 1e-9),
  };
}

/* ---------- verdubbelings- en halveringstijd ---------- */
function randVerdubbel(lvl) {
  return { half: lvl === 3 ? Math.random() < 0.5 : Math.random() < 0.3, p: pick([4, 5, 6, 8, 10, 12, 15, 20, 25]), k: pick([5, 8, 10, 12, 15, 20]), maand: lvl >= 2 && Math.random() < 0.5 };
}
function buildVerdubbel({ half, p, k, maand }) {
  const g = half ? 1 - k / 100 : 1 + p / 100, doel = half ? 0.5 : 2, T = Math.log(doel) / Math.log(g);
  const what = half ? 'Een medicijn wordt in het bloed afgebroken' : 'Het aantal volgers van een account groeit';
  const per = half ? 'uur' : 'jaar';
  const vraag = half ? `De hoeveelheid medicijn neemt elk uur af met ${k}%. Na hoeveel uur is de helft over?` : `${what} met ${p}% per jaar. Na hoeveel ${maand ? 'maanden' : 'jaar'} is het aantal verdubbeld?`;
  const ans = maand && !half ? Math.round(T * 12) : T;
  const steps = [
    num('Groeifactor', `Wat is de groeifactor per ${per}?`, [g], { hint: half ? `Afname: 1 − ${k}/100.` : `1 + ${p}/100.`, write: [`g = ${td(g)}`], th: ['groei-verdubbel'] }),
    mc('Vergelijking', 'Welke vergelijking los je op?', [
      opt(M(`${td(g)}^T = ${td(doel)}`), true, `Klopt. ${half ? 'Halveren' : 'Verdubbelen'} betekent keer ${td(doel)}, en het beginaantal valt weg.`),
      opt(M(`${td(g)} \\cdot T = ${td(doel)}`), false, 'Bij exponentiële groei staat T in de exponent, niet ervoor.'),
      opt(M(`T^{${td(g)}} = ${td(doel)}`), false, 'Grondtal en exponent staan omgedraaid.'),
      opt(M(`${td(g)}^T = ${half ? 50 : 200}`), false, 'Je rekent met de groeifactor, dus keer 2 (of 0,5), niet met procenten.'),
    ], { th: ['groei-verdubbel', 'expo'] }),
    num(half ? 'Halveringstijd' : 'Verdubbelingstijd', `Bereken T met de log. Rond af op 2 decimalen.`, [T], { dp: 2, hint: `T = log(${td(doel)}) / log(${dec(g, 2)}).`, write: [`T = \\dfrac{\\log(${td(doel)})}{\\log(${td(g)})} \\approx ${dec(T, 2).replace(',', '{,}')}`] }),
  ];
  if (maand && !half) steps.push(num('In maanden', 'Hoeveel maanden is dat, afgerond op hele maanden?', [ans], { dp: 0, hint: 'Keer 12.', write: [`${dec(T, 2).replace(',', '{,}')} \\cdot 12 \\approx ${ans} \\text{ maanden}`] }));
  return {
    type: 'groei', pts: 4, prompt: vraag + (maand && !half ? ' Rond af op hele maanden.' : ' Rond af op 2 decimalen.'),
    steps, final: [{ label: maand && !half ? 'maanden' : per === 'uur' ? 'uur' : 'jaar', answers: [ans], dp: maand && !half ? 0 : 2 }],
    plot: groeiPlot(t => 100 * Math.pow(g, t), `N = 100 \\cdot ${td(g)}^t`, [0, T], [{ x: T, y: 100 * doel, lab: `T ≈ ${dec(T, 2)}` }], `Start bij 100. Waar zit de grafiek op ${100 * doel}?`, `Na ${dec(T, 2)} ${per} is het ${half ? 'gehalveerd' : 'verdubbeld'}, ongeacht het beginaantal.`, [{ f: () => 100 * doel, tex: `y = ${100 * doel}` }]),
    verify: () => near(Math.pow(g, T), doel, 1e-9),
  };
}

/* ---------- tijdstip berekenen met log ---------- */
function randTijdstip(lvl) {
  const c = ri(0, GROEI_CTX.length - 1), p = pick(lvl === 1 ? [10, 20, 25] : [4, 6, 8, 9, 12, 15]);
  const r = pick(lvl === 1 ? [2, 3, 4] : [1.5, 1.8, 2.4, 2.5, 3.2]);
  return { c, a: ri(0, 3), p, r };
}
function buildTijdstip({ c, a, p, r }) {
  const ctx = GROEI_CTX[c], b = ctx.bs[a], g = 1 + p / 100, doel = Math.round(b * r), ratio = doel / b, t = Math.log(ratio) / Math.log(g);
  const jaar = ctx.start + Math.floor(t), m = Math.floor((t - Math.floor(t)) * 12);
  const label = k => { const mm = ((m + k) % 12 + 12) % 12, jj = jaar + Math.floor((m + k) / 12); return `${MAANDEN[mm]} ${jj}`; };
  return {
    type: 'groei', pts: 5,
    prompt: `Voor ${ctx.wat} geldt de formule \\(${ctx.N} = ${b} \\cdot ${td(g)}^t\\), met \\(t\\) in jaren en \\(t = 0\\) op 1 januari ${ctx.start}. Bereken algebraïsch in welk jaar en welke maand er ${doel} ${ctx.ev} zijn.`,
    steps: [
      num('Macht vrijmaken', `Stel \\(${b} \\cdot ${td(g)}^t = ${doel}\\). Wat staat er rechts als je de macht alleen zet: \\(${td(g)}^t = \\ldots\\)?`, [ratio], { dp: 3, hint: `Deel ${doel} door ${b}.`, write: [`${b} \\cdot ${td(g)}^t = ${doel}`, `${td(g)}^t = ${td(ratio)}`], th: ['groei-tijdstip'] }),
      num('t berekenen', 'Bereken t met de log. Rond af op 2 decimalen.', [t], { dp: 2, hint: `t = log(${dec(ratio, 3)}) / log(${dec(g, 2)}).`, write: [`t = \\dfrac{\\log(${td(ratio)})}{\\log(${td(g)})} \\approx ${dec(t, 2).replace(',', '{,}')}`], th: ['expo'] }),
      mc('Jaar en maand', `t ≈ ${dec(t, 2)} jaar na 1 januari ${ctx.start}. In welke maand is dat?`, [
        opt(label(0), true, `Klopt. ${Math.floor(t)} hele jaren en ${dec((t - Math.floor(t)) * 12, 1)} maanden: dat valt in ${label(0)}.`),
        opt(label(1), false, 'Eén maand te ver. Na bijvoorbeeld 7,4 maanden ben je in de achtste maand bezig, niet in de negende.'),
        opt(label(-1), false, 'Eén maand te vroeg. Tel de maanden vanaf januari: na 0,x maand zit je nog in januari.'),
        opt(`${MAANDEN[Math.min(11, Math.round((t - Math.floor(t)) * 10))]} ${jaar}`, false, 'Je hebt de decimalen als maandnummer gelezen. 0,5 jaar is 6 maanden, niet mei.'),
      ], { keepOrder: false, write: [`\\text{in } ${label(0).replace(' ', '\\ ')}`] }),
    ],
    final: [{ label: 't', answers: [t], dp: 2 }],
    plot: groeiPlot(x => b * Math.pow(g, x), `${ctx.N} = ${b} \\cdot ${td(g)}^t`, [0, t], [{ x: t, y: doel, lab: `t ≈ ${dec(t, 2)}` }], `Waar komt de grafiek op ${doel}?`, 'Daar snijden de grafiek en de lijn: dat is je tijdstip.', [{ f: () => doel, tex: `y = ${doel}` }]),
    verify: () => near(b * Math.pow(g, t), doel, 1e-6),
  };
}

/* ---------- lineair of exponentieel, model opstellen ---------- */
function randModel(lvl) {
  return { soort: pick(lvl === 1 ? ['tabel'] : ['tabel', 'twee']), lin: Math.random() < 0.35, b: pick([5, 8, 10, 12, 20]), g: pick([1.25, 1.5, 2, 0.8]), k: pick([2, 3, 4]), v: pick([3, 4, 6]) };
}
function buildModel({ soort, lin, b, g, k, v }) {
  if (soort === 'tabel') {
    const vals = [0, 1, 2, 3].map(i => lin ? b * 10 + v * 10 * i : Math.round(b * 10 * Math.pow(g, i) * 100) / 100);
    const dif = vals.slice(1).map((x, i) => x - vals[i]), quo = vals.slice(1).map((x, i) => x / vals[i]);
    return {
      type: 'groei', pts: 3, prompt: `Een onderzoeker meet elk jaar een aantal: \\(${vals.map(x => td(x, 2)).join('\\;\\;')}\\) (in de jaren 0, 1, 2 en 3). Past hier een lineair of een exponentieel model bij?`,
      steps: [
        num('Verschillen', 'Wat is het verschil tussen jaar 0 en jaar 1?', [dif[0]], { dp: 2, write: [`\\text{verschillen: } ${dif.map(x => td(x, 2)).join(',\\ ')}`], th: ['groei-model'] }),
        num('Quotiënten', 'Wat is het quotiënt (jaar 1 gedeeld door jaar 0)? Rond af op 2 decimalen.', [quo[0]], { dp: 2, write: [`\\text{quotiënten: } ${quo.map(x => dec(x, 2).replace(',', '{,}')).join(',\\ ')}`] }),
        mc('Model', 'Welk model past?', [
          opt('Lineair', lin, lin ? 'Klopt: er komt elk jaar hetzelfde bij.' : 'De verschillen zijn niet gelijk, dus het is niet lineair.'),
          opt('Exponentieel', !lin, !lin ? `Klopt: elk jaar keer ${td(g)}, de quotiënten zijn gelijk.` : 'De quotiënten zijn niet gelijk, dus niet exponentieel.'),
        ], { keepOrder: true }),
      ],
      final: [{ label: lin ? 'toename per jaar' : 'groeifactor', answers: [lin ? v * 10 : g], dp: 2 }],
      verify: () => lin ? dif.every(x => near(x, dif[0], 1e-9)) : quo.every(x => near(x, g, 0.01)),
    };
  }
  const end = b * v, gg = Math.pow(v, 1 / k);
  return {
    type: 'groei', pts: 4, prompt: `Op \\(t = 0\\) is ${b}% van een meer bedekt met algen. Op \\(t = ${k}\\) (in weken) is dat ${end}%. Neem aan dat het percentage exponentieel groeit: \\(P = ${b} \\cdot g^t\\). Bereken \\(g\\). Rond af op 3 decimalen.`,
    steps: [
      num('Quotiënt', `In ${k} weken wordt het keer hoeveel groter?`, [v], { hint: `${end} / ${b}`, write: [`g^{${k}} = \\dfrac{${end}}{${b}} = ${v}`], th: ['groei-model'] }),
      mc('Groeifactor per week', `\\(g^{${k}} = ${v}\\). Hoe vind je g?`, [
        opt(M(`g = ${v}^{1/${k}}`), true, `Klopt. De ${k}e-machtswortel van ${v}.`),
        opt(M(`g = ${v} / ${k}`), false, 'Delen werkt bij lineaire groei, niet bij exponentiële.'),
        opt(M(`g = ${v}`), false, `${v} is de factor over ${k} weken, niet per week.`),
      ]),
      num('g', 'Bereken g. Rond af op 3 decimalen.', [gg], { dp: 3, write: [`g = ${v}^{1/${k}} \\approx ${dec(gg, 3).replace(',', '{,}')}`] }),
    ],
    final: [{ label: 'g', answers: [gg], dp: 3 }],
    verify: () => near(b * Math.pow(gg, k), end, 1e-6),
  };
}

/* ---------- op den duur: grenswaarde ---------- */
function randGrens(lvl) {
  return { vorm: pick(lvl === 1 ? ['min', 'expo'] : ['min', 'log', 'logist']), A: pick([40, 50, 80, 120, 250, 500]), c: pick([4, 9, 19, 24]), g: pick([0.6, 0.7, 0.8, 0.85, 0.9]) };
}
function buildGrens({ vorm, A, c, g }) {
  const f = vorm === 'logist' ? (t => A * 1000 / (1 + c * Math.pow(g, t))) : vorm === 'min' ? (t => A - (A - c) * Math.pow(g, t)) : (t => A * (1 - Math.pow(g, t)));
  const tex = vorm === 'logist' ? `N = \\dfrac{${A * 1000}}{1 + ${c} \\cdot ${td(g)}^t}` : vorm === 'min' ? `T = ${A} - ${A - c} \\cdot ${td(g)}^t` : `W = ${A}(1 - ${td(g)}^t)`;
  const grens = vorm === 'logist' ? A * 1000 : A, begin = f(0);
  return {
    type: 'groei', pts: 3, prompt: `Een grootheid wordt beschreven met \\(${tex}\\), met \\(t\\) in maanden. Hoe groot wordt deze op den duur?`,
    steps: [
      num('Begin', 'Wat is de waarde op t = 0?', [begin], { dp: 2, hint: 'Vul t = 0 in: elke macht met exponent 0 is 1.', write: [`\\text{op } t = 0: ${td(begin, 2)}`], th: ['groei-grens'] }),
      mc('Wat doet de macht?', `Wat gebeurt er met \\(${td(g)}^t\\) als t heel groot wordt?`, [
        opt('Het gaat naar 0', true, `Klopt. ${td(g)} is kleiner dan 1, dus elke keer keer ${td(g)} wordt het kleiner.`),
        opt('Het gaat naar 1', false, `${td(g)}^0 = 1, maar daarna wordt het steeds kleiner.`),
        opt('Het wordt heel groot', false, `Dat geldt bij een grondtal groter dan 1. Hier is het ${td(g)}.`),
      ], { keepOrder: true }),
      num('Grenswaarde', 'Vul dat in. Waar gaat de grootheid naartoe?', [grens], { dp: 2, hint: 'Vervang de macht door 0.', write: [`\\text{op den duur: } ${td(grens)}`] }),
    ],
    final: [{ label: 'grens', answers: [grens], dp: 2 }],
    plot: groeiPlot(f, tex, [0, 30], [], 'De grafiek nadert een horizontale lijn.', `Die lijn ligt op ${nl(grens)}: de grenswaarde.`, [{ f: () => grens, tex: `y = ${grens}` }]),
    verify: () => near(f(400), grens, 1e-6),
  };
}

/* ---------- groeisnelheid ---------- */
function randSnelheid(lvl) {
  return { e: lvl === 3 ? Math.random() < 0.6 : Math.random() < 0.3, b: pick([200, 400, 500, 800, 1200]), p: pick([5, 8, 10, 12, 20]), k: pick([0.05, 0.1, 0.15, 0.2]), t0: ri(1, 6) };
}
function buildSnelheid({ e, b, p, k, t0 }) {
  const g = 1 + p / 100;
  const f = e ? (t => b * Math.exp(k * t)) : (t => b * Math.pow(g, t));
  const d = e ? (t => b * k * Math.exp(k * t)) : (t => b * Math.pow(g, t) * Math.log(g));
  const tex = e ? `N = ${b} \\cdot e^{${td(k)}t}` : `N = ${b} \\cdot ${td(g)}^t`, v = d(t0);
  return {
    type: 'groei', pts: 4, prompt: `Het aantal deeltjes wordt gegeven door \\(${tex}\\), met \\(t\\) in uren. Bereken algebraïsch de groeisnelheid op \\(t = ${t0}\\). Rond af op 1 decimaal.`,
    steps: [
      mc('Afgeleide', 'Wat is de afgeleide N′(t)?', e ? [
        opt(M(`N'(t) = ${td(b * k)} \\cdot e^{${td(k)}t}`), true, `Klopt. Kettingregel: de ${td(k)} uit de exponent komt ervoor.`),
        opt(M(`N'(t) = ${b} \\cdot e^{${td(k)}t}`), false, 'Je bent de factor uit de exponent vergeten (kettingregel).'),
        opt(M(`N'(t) = ${td(b * k)} t \\cdot e^{${td(k)}t - 1}`), false, 'De machtsregel geldt niet voor e-machten.'),
      ] : [
        opt(M(`N'(t) = ${b} \\cdot ${td(g)}^t \\cdot \\ln(${td(g)})`), true, 'Klopt. Bij g^t komt er een factor ln(g) bij.'),
        opt(M(`N'(t) = ${b} t \\cdot ${td(g)}^{t-1}`), false, 'De machtsregel geldt alleen als t het grondtal is, hier staat t in de exponent.'),
        opt(M(`N'(t) = ${b} \\cdot ${td(g)}^t`), false, 'Je bent de factor ln(g) vergeten.'),
      ], { th: ['groei-snelheid'], write: [e ? `N'(t) = ${td(b * k)} \\cdot e^{${td(k)}t}` : `N'(t) = ${b} \\cdot ${td(g)}^t \\cdot \\ln(${td(g)})`] }),
      num('Invullen', `Vul t = ${t0} in. Rond af op 1 decimaal.`, [v], { dp: 1, hint: `Reken N′(${t0}) uit met je rekenmachine.`, write: [`N'(${t0}) \\approx ${dec(v, 1).replace(',', '{,}')} \\text{ per uur}`] }),
    ],
    final: [{ label: 'snelheid', answers: [v], dp: 1 }],
    plot: { curves: [{ f, tex }], keys: [0, t0 + 2], marks: [{ x: t0, y: f(t0), m: v }], before: 'De groeisnelheid is de helling van de grafiek.', after: `De groene raaklijn heeft helling ${dec(v, 1)}.` },
    verify: () => near((f(t0 + 1e-6) - f(t0 - 1e-6)) / 2e-6, v, 1e-3 * (1 + Math.abs(v))),
  };
}

/* ---------- rijen in een context ---------- */
function randRij(lvl) {
  return { meet: lvl === 1 ? false : Math.random() < 0.6, u1: pick([300, 400, 500, 600, 750]), v: pick([20, 25, 40, 50]), r: pick([2, 3, 4, 5]), n: pick([12, 18, 24, 36]) };
}
function buildRij({ meet, u1, v, r, n }) {
  const R = 1 + r / 100;
  const som = meet ? u1 * (Math.pow(R, n) - 1) / (R - 1) : n / 2 * (u1 + (u1 + (n - 1) * v));
  const tekst = meet ? `In de eerste maand verdient een app € ${u1}. Daarna stijgen de inkomsten elke maand met ${r}%.` : `In de eerste maand verdient een app € ${u1}. Daarna stijgen de inkomsten elke maand met € ${v}.`;
  return {
    type: 'groei', pts: 4, prompt: `${tekst} Bereken zonder elke maand apart uit te rekenen de totale inkomsten in de eerste ${n} maanden. Rond af op hele euro's.`,
    steps: [
      mc('Soort rij', 'Wat voor rij vormen de inkomsten per maand?', [
        opt('Meetkundig', meet, meet ? `Klopt: steeds keer ${td(R)}.` : 'Er komt steeds hetzelfde bedrag bij, dus niet meetkundig.'),
        opt('Rekenkundig', !meet, !meet ? `Klopt: steeds € ${v} erbij.` : 'Er komt steeds een percentage bij, dus steeds keer hetzelfde: meetkundig.'),
      ], { keepOrder: true, th: ['groei-rij'] }),
      meet
        ? num('Laatste term', `Wat zijn de inkomsten in maand ${n + 1}? Die heb je nodig in de somformule. Rond af op 2 decimalen.`, [u1 * Math.pow(R, n)], { dp: 2, hint: `u₁ · r^${n}`, write: [`u_{${n + 1}} = ${u1} \\cdot ${td(R)}^{${n}} \\approx ${dec(u1 * Math.pow(R, n), 2).replace(',', '{,}')}`] })
        : num('Laatste term', `Wat zijn de inkomsten in maand ${n}?`, [u1 + (n - 1) * v], { hint: `u₁ + (${n} − 1) · ${v}`, write: [`u_{${n}} = ${u1} + ${n - 1} \\cdot ${v} = ${u1 + (n - 1) * v}`] }),
      num('Som', 'Gebruik de somformule. Wat zijn de totale inkomsten, afgerond op hele euro\'s? (Typ zonder punt of spatie.)', [Math.round(som)], { dp: 0, hint: meet ? 'Som = (u_{l+1} − u_e) / (r − 1)' : 'Som = ½ · aantal termen · (eerste + laatste)', write: [meet ? `\\text{Som} = \\dfrac{u_{${n + 1}} - ${u1}}{${td(R)} - 1} \\approx ${Math.round(som)}` : `\\text{Som} = \\tfrac{1}{2} \\cdot ${n} \\cdot (${u1} + ${u1 + (n - 1) * v}) = ${Math.round(som)}`] }),
    ],
    final: [{ label: 'euro', answers: [Math.round(som)], dp: 0 }],
    verify: () => { let s = 0; for (let i = 0; i < n; i++) s += meet ? u1 * Math.pow(R, i) : u1 + i * v; return Math.abs(s - som) < 1e-6; },
  };
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

const COURSE = maakOnderdeel({
  onderdeel: 'groei',
  home: { titel: 'Lineaire en exponentiële groei', tekst: 'Begin met wat het vaakst gevraagd wordt.' },
  gens: {
    gTijdstip: { topic: 'groei-tijdstip', rand: randTijdstip, build: buildTijdstip, w: 3 },
    gFactor: { topic: 'groei-factor', rand: randGFactor, build: buildGFactor, w: 2 },
    gGrens: { topic: 'groei-grens', rand: randGrens, build: buildGrens, w: 1.5 },
    gVerdubbel: { topic: 'groei-verdubbel', rand: randVerdubbel, build: buildVerdubbel, w: 1 },
    gModel: { topic: 'groei-model', rand: randModel, build: buildModel, w: 1 },
    gSnelheid: { topic: 'groei-snelheid', rand: randSnelheid, build: buildSnelheid, w: 1 },
    gRij: { topic: 'groei-rij', rand: randRij, build: buildRij, w: 1 },
  },
});
