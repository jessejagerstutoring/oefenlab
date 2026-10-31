/*
 * Wiskunde A · Differentiëren en optimaliseren
 * Het tentamen gebruikt drie soorten modellen: winst = opbrengst − kosten (kwadratisch),
 * een breuk (aantal bezoekers, besmettingen) en een product met een e-macht. Alle drie komen
 * hier terug, in dezelfde vraagvormen: formule opstellen, maximum, wanneer meer dan, stijgen/dalen.
 */
const OPT_CTX = [
  { wie: 'Een bakker', wat: 'taarten', eenheid: 'taart' },
  { wie: 'Een fabriek', wat: 'fietsen', eenheid: 'fiets' },
  { wie: 'Een modeontwerpster', wat: 'jurken', eenheid: 'jurk' },
  { wie: 'Een kaasboer', wat: 'kazen', eenheid: 'kaas' },
];
const BREUK_CTX = [
  { wat: 'het aantal bezoekers van een website', ev: 'bezoekers', N: 'B', t: 'uur' },
  { wat: 'het percentage zieken in een land', ev: 'procent', N: 'P', t: 'week' },
  { wat: 'het aantal verkochte kaartjes per dag', ev: 'kaartjes', N: 'K', t: 'dag' },
];
const kwad = (a, b, c) => { const D = b * b - 4 * a * c; if (D < 0) return []; return uniqSort([(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)]); };

/* winstmodel W = R − K, met R = p·q − b·q² en K = c + d·q */
function randWinst(lvl) {
  const b = pick(lvl === 1 ? [0.05, 0.1] : [0.02, 0.04, 0.05, 0.1, 0.25]);
  const qs = pick([40, 60, 80, 100, 120, 150, 200]), d = pick([2, 3, 4, 5, 6]);
  // vaste kosten zo kiezen dat de maximale winst positief is en er twee break-evenpunten zijn
  const c = Math.max(10, Math.round(b * qs * qs * pick([0.3, 0.45, 0.6]) / 10) * 10);
  return { b, qs, d, p: Math.round((d + 2 * b * qs) * 100) / 100, c, k: ri(0, OPT_CTX.length - 1) };
}
const winstTex = ({ b, p, c, d }) => ({ R: `R = ${td(p)}q - ${td(b)}q^2`, K: `K = ${c} + ${d}q`, W: `W = -${td(b)}q^2 + ${td(p - d)}q - ${c}` });

/* ---------- maximum of minimum ---------- */
function randExtreem(lvl) {
  const vorm = pick(lvl === 1 ? ['winst', 'winst', 'breuk'] : ['winst', 'breuk', 'emacht']);
  return { vorm, w: randWinst(lvl), A: pick([60, 120, 200, 480, 600]), B: pick([4, 9, 16, 25, 36]), k: pick([0.1, 0.125, 0.2, 0.25, 0.5]), a: pick([5, 10, 20, 40]), c: ri(0, 2) };
}
function buildExtreem({ vorm, w, A, B, k, a, c }) {
  if (vorm === 'winst') {
    const ctx = OPT_CTX[w.k], T = winstTex(w), qs = (w.p - w.d) / (2 * w.b), W = q => -w.b * q * q + (w.p - w.d) * q - w.c, Wm = W(qs);
    return {
      type: 'opt', pts: 6,
      prompt: `${ctx.wie} verkoopt per dag \\(q\\) ${ctx.wat}. De opbrengst in euro is \\(${T.R}\\) en de kosten in euro zijn \\(${T.K}\\). Bereken algebraïsch de maximale winst per dag.`,
      steps: [
        mc('Formule voor de winst', 'Wat is de formule voor de winst W?', [
          opt(M(T.W), true, 'Klopt: W = R − K, met haakjes om K, zodat 4q ook van teken wisselt.'),
          opt(M(`W = -${td(w.b)}q^2 + ${td(w.p + w.d)}q - ${w.c}`), false, `Je hebt +${w.d}q gedaan. Door de haakjes om K wordt het −${w.d}q.`),
          opt(M(`W = -${td(w.b)}q^2 + ${td(w.p - w.d)}q + ${w.c}`), false, `De vaste kosten ${w.c} gaan eraf: −${w.c}.`),
        ], { th: ['opt-formule'], write: [`W = R - K = ${T.W.slice(4)}`] }),
        mc('Afgeleide', 'Wat is W′(q)?', [
          opt(M(`W'(q) = -${td(2 * w.b)}q + ${td(w.p - w.d)}`), true, 'Klopt: machtsregel op elke term, het losse getal valt weg.'),
          opt(M(`W'(q) = -${td(w.b)}q + ${td(w.p - w.d)}`), false, `Bij q² komt er een 2 voor: 2 · ${td(w.b)} = ${td(2 * w.b)}.`),
          opt(M(`W'(q) = -${td(2 * w.b)}q + ${td(w.p - w.d)} - ${w.c}`), false, 'Een los getal wordt 0 bij differentiëren.'),
        ], { th: ['opt-extreem', 'afgeleide'], write: [`W'(q) = -${td(2 * w.b)}q + ${td(w.p - w.d)}`] }),
        num('Top', 'Los W′(q) = 0 op. Bij welke q is de winst maximaal?', [qs], { hint: `${td(w.p - w.d)} = ${td(2 * w.b)}q, dus deel door ${td(2 * w.b)}.`, write: [`-${td(2 * w.b)}q + ${td(w.p - w.d)} = 0 \\;\\Rightarrow\\; q = ${td(qs)}`] }),
        num('Maximale winst', `Bereken de maximale winst in euro. Rond af op hele euro's.`, [Math.round(Wm)], { dp: 0, hint: `Vul q = ${td(qs)} in de formule voor W in (niet in W′).`, write: [`W(${td(qs)}) \\approx ${Math.round(Wm)} \\text{ euro}`] }),
      ],
      final: [{ label: 'winst', answers: [Math.round(Wm)], dp: 0 }],
      plot: { curves: [{ f: W, tex: T.W }], keys: [0, 2 * qs], marks: [{ x: qs, y: Wm, m: 0, lab: `max ≈ ${Math.round(Wm)}` }], before: 'De winst is een bergparabool. Waar ligt de top?', after: 'In de top is de helling 0: daar is de winst maximaal.' },
      verify: () => [qs - 1, qs + 1].every(x => W(x) < Wm) && Math.abs(-2 * w.b * qs + w.p - w.d) < 1e-9,
    };
  }
  if (vorm === 'breuk') {
    const ctx = BREUK_CTX[c], f = t => A * t / (t * t + B), ts = Math.sqrt(B), mx = f(ts);
    const tex = `${ctx.N}(t) = \\dfrac{${A}t}{t^2 + ${B}}`;
    return {
      type: 'opt', pts: 7,
      prompt: `Voor ${ctx.wat} geldt \\(${tex}\\), met \\(t\\) in ${ctx.t === 'uur' ? 'uren' : ctx.t === 'week' ? 'weken' : 'dagen'}. Gebruik de afgeleide om algebraïsch het maximum te berekenen. Rond af op 2 decimalen.`,
      steps: [
        mc('Regel', 'Met welke regel differentieer je deze formule?', [
          opt('De quotiëntregel', true, 'Klopt: een breuk met t in de teller en in de noemer.'),
          opt('De kettingregel', false, 'Er staat geen functie ín een andere functie, maar een breuk.'),
          opt('Teller en noemer apart differentiëren', false, 'Dat mag niet: (t/n)′ is niet t′/n′.'),
        ], { keepOrder: true, th: ['opt-afgeleide'] }),
        mc('Teller van de afgeleide', `Teller t = ${A}t, noemer n = t² + ${B}. Wat is de teller van ${ctx.N}′(t)?`, [
          opt(M(`${A}(t^2 + ${B}) - ${A}t \\cdot 2t = ${A * B} - ${A}t^2`), true, `Klopt: t′ · n − t · n′, en dat vereenvoudigt tot ${A * B} − ${A}t².`),
          opt(M(`${A}t \\cdot 2t - ${A}(t^2 + ${B})`), false, 'De volgorde is omgedraaid: eerst t′ · n, dan min t · n′.'),
          opt(M(`${A}(t^2 + ${B}) + ${A}t \\cdot 2t`), false, 'In de quotiëntregel staat een min, geen plus.'),
        ], { write: [`${ctx.N}'(t) = \\dfrac{${A * B} - ${A}t^2}{(t^2 + ${B})^2}`] }),
        num('Top', `Een breuk is 0 als de teller 0 is. Los ${A * B} − ${A}t² = 0 op (t > 0).`, [ts], { hint: `t² = ${B}.`, write: [`${A * B} - ${A}t^2 = 0 \\;\\Rightarrow\\; t = ${td(ts)}`] }),
        num('Maximum', `Bereken het maximum van ${ctx.N}. Rond af op 2 decimalen.`, [mx], { dp: 2, hint: `Vul t = ${td(ts)} in de formule in.`, write: [`${ctx.N}(${td(ts)}) \\approx ${dec(mx, 2).replace(',', '{,}')}`] }),
      ],
      final: [{ label: 'max', answers: [mx], dp: 2 }],
      plot: { curves: [{ f, tex }], keys: [0, 3 * ts], marks: [{ x: ts, y: mx, m: 0, lab: `max ≈ ${dec(mx, 2)}` }], before: 'Eerst stijgt het, daarna daalt het. Waar ligt de piek?', after: 'Op de piek is de afgeleide 0.' },
      verify: () => [0.9, 1.1].every(r => f(ts * r) < mx),
    };
  }
  const f = t => a * t * Math.exp(-k * t), ts = 1 / k, mx = f(ts);
  const tex = `P = ${a}t \\cdot e^{-${td(k)}t}`;
  return {
    type: 'opt', pts: 6,
    prompt: `De concentratie van een medicijn in het bloed is \\(${tex}\\), met \\(t\\) in uren. Bereken algebraïsch de maximale concentratie. Rond af op 4 decimalen.`,
    steps: [
      mc('Regel', 'Met welke regel differentieer je dit?', [
        opt('Productregel, met de kettingregel voor de e-macht', true, `Klopt: ${a}t keer een e-macht, en in de e-macht staat −${td(k)}t.`),
        opt('Alleen de kettingregel', false, `Er staan twee stukken met t die je vermenigvuldigt: ${a}t en de e-macht.`),
        opt('Quotiëntregel', false, 'Er staat geen breuk.'),
      ], { keepOrder: true, th: ['groei-snelheid', 'opt-afgeleide'] }),
      mc('Afgeleide', 'Wat is P′(t)?', [
        opt(M(`P'(t) = ${a}e^{-${td(k)}t}(1 - ${td(k)}t)`), true, `Klopt: ${a} · e^… + ${a}t · (−${td(k)}) · e^…, en dan ${a}e^… buiten haakjes.`),
        opt(M(`P'(t) = ${a}e^{-${td(k)}t}`), false, 'Je bent het tweede deel van de productregel vergeten.'),
        opt(M(`P'(t) = -${td(a * k)}t \\cdot e^{-${td(k)}t}`), false, 'Je bent het eerste deel van de productregel vergeten.'),
      ], { write: [`P'(t) = ${a}e^{-${td(k)}t}(1 - ${td(k)}t)`] }),
      num('Top', 'Een e-macht is nooit 0. Los 1 − kt = 0 op.', [ts], { hint: `1 − ${td(k)}t = 0`, write: [`1 - ${td(k)}t = 0 \\;\\Rightarrow\\; t = ${td(ts)}`] }),
      num('Maximum', 'Bereken de maximale concentratie. Rond af op 4 decimalen.', [mx], { dp: 4, hint: `Vul t = ${td(ts)} in P in.`, write: [`P(${td(ts)}) \\approx ${dec(mx, 4).replace(',', '{,}')}`] }),
    ],
    final: [{ label: 'max', answers: [mx], dp: 4 }],
    plot: { curves: [{ f, tex }], keys: [0, 3 * ts], marks: [{ x: ts, y: mx, m: 0 }], before: 'De concentratie stijgt snel en zakt dan langzaam weg.', after: 'In de top is de helling 0.' },
    verify: () => [0.95, 1.05].every(r => f(ts * r) < mx),
  };
}

/* ---------- wanneer is het meer dan … ---------- */
function randVergelijking(lvl) {
  return { vorm: pick(lvl === 1 ? ['winst'] : ['winst', 'breuk']), w: randWinst(lvl), A: pick([60, 120, 200]), B: pick([4, 9, 16, 25]), c: ri(0, 2), f: pick([0.5, 0.6, 0.75, 0.8]) };
}
function buildVergelijking({ vorm, w, A, B, c, f }) {
  if (vorm === 'winst') {
    const ctx = OPT_CTX[w.k], T = winstTex(w), r = kwad(-w.b, w.p - w.d, -w.c), W = q => -w.b * q * q + (w.p - w.d) * q - w.c;
    const lo = Math.floor(r[0] + 1e-6) + 1, hi = Math.ceil(r[1] - 1e-6) - 1;
    return {
      type: 'opt', pts: 5,
      prompt: `${ctx.wie} maakt per dag \\(q\\) ${ctx.wat}. De winst in euro is \\(${T.W}\\). Bereken algebraïsch voor welke aantallen de winst positief is.`,
      steps: [
        mc('Aanpak', 'Hoe begin je?', [
          opt('Los eerst W = 0 op', true, 'Klopt. De grenzen waar de winst 0 is, bepalen waar hij positief is.'),
          opt('Vul q = 0 in', false, 'Dan weet je alleen de winst bij 0 stuks.'),
          opt('Los W′(q) = 0 op', false, 'Dat geeft de top, niet waar de winst positief wordt.'),
        ], { keepOrder: true, th: ['opt-vergelijking', 'abc'] }),
        num('Grenzen', 'Los W = 0 op met de abc-formule. Geef beide oplossingen, afgerond op 1 decimaal.', r, { dp: 1, hint: `a = −${td(w.b)}, b = ${td(w.p - w.d)}, c = −${w.c}.`, write: [`W = 0 \\;\\Rightarrow\\; q \\approx ${dec(r[0], 1).replace(',', '{,}')} \\;\\vee\\; q \\approx ${dec(r[1], 1).replace(',', '{,}')}`] }),
        mc('Welk stuk?', 'Waar is de winst positief?', [
          opt(`Tussen ${dec(r[0], 1)} en ${dec(r[1], 1)}`, true, 'Klopt: het is een bergparabool, dus tussen de nulpunten ligt hij boven 0.'),
          opt(`Onder ${dec(r[0], 1)} en boven ${dec(r[1], 1)}`, false, 'Dat zou bij een dalparabool horen. Kijk naar het minteken voor q².'),
        ], { keepOrder: true }),
        num('Antwoord', `Wat is het kleinste hele aantal ${ctx.wat} met winst?`, [lo], { dp: 0, hint: 'Rond de linkergrens naar boven af: je wilt echt boven 0 zitten.', write: [`W > 0 \\text{ voor } ${lo} \\le q \\le ${hi}`] }),
      ],
      final: [{ label: 'q', answers: [lo], dp: 0 }],
      plot: { curves: [{ f: W, tex: T.W }, { f: () => 0, tex: 'y = 0' }], keys: r, marks: r.map(x => ({ x, y: 0, lab: `q ≈ ${dec(x, 1)}` })), before: 'Waar ligt de grafiek boven de x-as?', after: 'Tussen de twee snijpunten is de winst positief.' },
      verify: () => W(lo) > 1e-9 && W(lo - 1) <= 1e-6 && W(hi) > 1e-9 && W(hi + 1) <= 1e-6,
    };
  }
  const ctx = BREUK_CTX[c], g = t => A * t / (t * t + B), h = Math.round(g(Math.sqrt(B)) * f * 10) / 10;
  const r = kwad(h, -A, h * B), duur = r[1] - r[0], tex = `${ctx.N}(t) = \\dfrac{${A}t}{t^2 + ${B}}`;
  return {
    type: 'opt', pts: 5,
    prompt: `Voor ${ctx.wat} geldt \\(${tex}\\), met \\(t\\) in ${ctx.t === 'uur' ? 'uren' : ctx.t === 'week' ? 'weken' : 'dagen'}. Bereken algebraïsch hoe lang ${ctx.N} groter is dan ${td(h)}. Rond af op 2 decimalen.`,
    steps: [
      mc('Vergelijking', `Je lost eerst ${ctx.N}(t) = ${td(h)} op. Welke vergelijking krijg je na kruislings vermenigvuldigen?`, [
        opt(M(`${td(h)}t^2 - ${A}t + ${td(h * B)} = 0`), true, `Klopt: ${A}t = ${td(h)}(t² + ${B}), alles naar één kant.`),
        opt(M(`${A}t = ${td(h)}t^2 + ${B}`), false, `Je bent vergeten ${td(h)} ook met ${B} te vermenigvuldigen.`),
        opt(M(`${A}t - ${td(h)} = t^2 + ${B}`), false, 'Kruislings vermenigvuldigen betekent keer de noemer, niet min.'),
      ], { th: ['opt-vergelijking'], write: [`${td(h)}t^2 - ${A}t + ${td(h * B)} = 0`] }),
      num('Oplossingen', 'Los op met de abc-formule. Geef beide oplossingen, afgerond op 2 decimalen.', r, { dp: 2, write: [`t \\approx ${dec(r[0], 2).replace(',', '{,}')} \\;\\vee\\; t \\approx ${dec(r[1], 2).replace(',', '{,}')}`] }),
      num('Hoe lang', `Hoe lang is ${ctx.N} groter dan ${td(h)}? Rond af op 2 decimalen.`, [duur], { dp: 2, hint: 'Het verschil tussen de twee tijdstippen.', write: [`${dec(r[1], 2).replace(',', '{,}')} - ${dec(r[0], 2).replace(',', '{,}')} \\approx ${dec(duur, 2).replace(',', '{,}')}`] }),
    ],
    final: [{ label: 'duur', answers: [duur], dp: 2 }],
    plot: { curves: [{ f: g, tex }, { f: () => h, tex: `y = ${td(h)}` }], keys: r, marks: r.map(x => ({ x, y: h })), before: `Waar ligt de grafiek boven y = ${td(h)}?`, after: 'Tussen de twee snijpunten: dat is de gevraagde tijd.' },
    verify: () => r.every(t => near(g(t), h, 1e-6)) && g((r[0] + r[1]) / 2) > h,
  };
}

/* ---------- formule opstellen ---------- */
function randFormule() { return { p0: pick([20, 25, 30, 40]), s: pick([0.01, 0.02, 0.05]), c: pick([300, 500, 800]), d: pick([3, 4, 5, 6]), k: ri(0, OPT_CTX.length - 1) }; }
function buildFormule({ p0, s, c, d, k }) {
  const ctx = OPT_CTX[k], a = p0 - d;
  return {
    type: 'opt', pts: 3,
    prompt: `${ctx.wie} verkoopt \\(q\\) ${ctx.wat}. De prijs per ${ctx.eenheid} is \\(p = ${p0} - ${td(s)}q\\) euro. De kosten zijn \\(K = ${c} + ${d}q\\). Toon aan dat voor de winst geldt: \\(W = -${td(s)}q^2 + ${a}q - ${c}\\).`,
    steps: [
      mc('Opbrengst', 'Wat is de opbrengst R?', [
        opt(M(`R = q(${p0} - ${td(s)}q) = ${p0}q - ${td(s)}q^2`), true, 'Klopt: opbrengst = prijs keer aantal.'),
        opt(M(`R = ${p0} - ${td(s)}q`), false, 'Dat is de prijs van één stuk. Vermenigvuldig met het aantal q.'),
        opt(M(`R = ${p0}q - ${td(s)}q`), false, `q · ${td(s)}q = ${td(s)}q², niet ${td(s)}q.`),
      ], { th: ['opt-formule'], write: [`R = q(${p0} - ${td(s)}q) = ${p0}q - ${td(s)}q^2`] }),
      mc('Winst', 'Wat is W = R − K, uitgewerkt?', [
        opt(M(`W = ${p0}q - ${td(s)}q^2 - ${c} - ${d}q`), true, 'Klopt: het minteken geldt voor alles tussen de haakjes van K.'),
        opt(M(`W = ${p0}q - ${td(s)}q^2 - ${c} + ${d}q`), false, `Door de haakjes om K wordt +${d}q ook −${d}q.`),
      ], { write: [`W = ${p0}q - ${td(s)}q^2 - (${c} + ${d}q) = -${td(s)}q^2 + ${a}q - ${c}`] }),
      num('Samennemen', `${p0}q − ${d}q = …q. Welk getal?`, [a], { write: [] }),
    ],
    final: [{ label: 'coëfficiënt', answers: [a], dp: 0 }],
    verify: () => [3, 17, 50].every(q => near(q * (p0 - s * q) - (c + d * q), -s * q * q + a * q - c, 1e-9)),
  };
}

/* ---------- stijgen of dalen ---------- */
function randHelling(lvl) { return { A: pick([60, 120, 200]), B: pick([4, 9, 16, 25]), t0: ri(1, 8), c: ri(0, 2), poly: lvl === 1 || Math.random() < 0.3, a: pick([0.5, 1, 2]), b: pick([6, 9, 12]) }; }
function buildHelling({ A, B, t0, c, poly: isPoly, a, b }) {
  if (isPoly) {
    const f = t => -a * t ** 3 + b * t * t, d = t => -3 * a * t * t + 2 * b * t, v = d(t0);
    if (near(v, 0)) return buildHelling({ A, B, t0: t0 + 1, c, poly: true, a, b });
    const tex = `N(t) = -${td(a)}t^3 + ${b}t^2`;
    return {
      type: 'opt', pts: 4, prompt: `Het aantal gebruikers (in duizenden) is \\(${tex}\\), met \\(t\\) in maanden. Gebruik de afgeleide om te onderzoeken of het aantal op \\(t = ${t0}\\) toeneemt of afneemt.`,
      steps: [
        num('Afgeleide invullen', `N′(t) = −${td(3 * a)}t² + ${2 * b}t. Bereken N′(${t0}).`, [v], { dp: 2, th: ['opt-helling', 'afgeleide'], write: [`N'(t) = -${td(3 * a)}t^2 + ${2 * b}t`, `N'(${t0}) = ${td(v)}`] }),
        mc('Conclusie', 'Neemt het aantal toe of af?', [
          opt('Het neemt toe', v > 0, v > 0 ? 'Klopt: de afgeleide is positief.' : 'De afgeleide is negatief, dus het neemt af.'),
          opt('Het neemt af', v < 0, v < 0 ? 'Klopt: de afgeleide is negatief.' : 'De afgeleide is positief, dus het neemt toe.'),
        ], { keepOrder: true, write: [v > 0 ? "N'(" + t0 + ') > 0 \\Rightarrow \\text{neemt toe}' : "N'(" + t0 + ') < 0 \\Rightarrow \\text{neemt af}'] }),
      ],
      final: [{ label: 'N′', answers: [v], dp: 2 }],
      plot: { curves: [{ f, tex }], keys: [0, t0 + 2], marks: [{ x: t0, y: f(t0), m: v }], before: 'Loopt de grafiek daar omhoog of omlaag?', after: 'De raaklijn laat zien of het stijgt of daalt.' },
      verify: () => near((f(t0 + 1e-6) - f(t0 - 1e-6)) / 2e-6, v, 1e-4),
    };
  }
  const ctx = BREUK_CTX[c], f = t => A * t / (t * t + B), d = t => (A * B - A * t * t) / (t * t + B) ** 2, tt = near(t0 * t0, B) ? t0 + 1 : t0, v = d(tt);
  const tex = `${ctx.N}(t) = \\dfrac{${A}t}{t^2 + ${B}}`;
  return {
    type: 'opt', pts: 5, prompt: `Voor ${ctx.wat} geldt \\(${tex}\\). Gebruik de afgeleide om te onderzoeken of ${ctx.N} op \\(t = ${tt}\\) nog toeneemt.`,
    steps: [
      mc('Afgeleide', `Wat is ${ctx.N}′(t)?`, [
        opt(M(`\\dfrac{${A * B} - ${A}t^2}{(t^2 + ${B})^2}`), true, 'Klopt: quotiëntregel en de teller uitgewerkt.'),
        opt(M(`\\dfrac{${A}}{2t}`), false, 'Teller en noemer apart differentiëren mag niet.'),
        opt(M(`\\dfrac{${A}t^2 - ${A * B}}{(t^2 + ${B})^2}`), false, 'De teller heeft het verkeerde teken: eerst t′ · n.'),
      ], { th: ['opt-helling', 'opt-afgeleide'], write: [`${ctx.N}'(t) = \\dfrac{${A * B} - ${A}t^2}{(t^2 + ${B})^2}`] }),
      num('Invullen', `Bereken ${ctx.N}′(${tt}). Rond af op 3 decimalen.`, [v], { dp: 3, write: [`${ctx.N}'(${tt}) \\approx ${dec(v, 3).replace(',', '{,}')}`] }),
      mc('Conclusie', 'Neemt het nog toe?', [
        opt('Ja, het neemt toe', v > 0, v > 0 ? 'Klopt: positieve afgeleide.' : 'De afgeleide is negatief: het neemt af.'),
        opt('Nee, het neemt af', v < 0, v < 0 ? 'Klopt: negatieve afgeleide.' : 'De afgeleide is positief: het neemt nog toe.'),
      ], { keepOrder: true }),
    ],
    final: [{ label: 'afgeleide', answers: [v], dp: 3 }],
    plot: { curves: [{ f, tex }], keys: [0, Math.max(tt + 2, 2 * Math.sqrt(B))], marks: [{ x: tt, y: f(tt), m: v }], before: 'Kijk naar de helling op het gevraagde tijdstip.', after: 'De raaklijn laat zien of het stijgt of daalt.' },
    verify: () => near((f(tt + 1e-6) - f(tt - 1e-6)) / 2e-6, v, 1e-5),
  };
}

/* ---------- afgeleide van een breuk ---------- */
function randAfgeleide() { return { a: pick([20, 30, 40, 50]), b: pick([5, 10, 20]), c: pick([1, 2, 4, 5]) }; }
function buildAfgeleide({ a, b, c }) {
  const k = a * c - b, f = t => (a * t + b) / (t + c);
  return {
    type: 'opt', pts: 4, prompt: `Het aantal leden van een club is \\(L(t) = \\dfrac{${a}t + ${b}}{t + ${c}}\\). Toon aan dat \\(L'(t) = \\dfrac{${k}}{(t + ${c})^2}\\).`,
    steps: [
      mc('Teller en noemer', 'Wat zijn t′ en n′?', [
        opt(M(`t' = ${a},\\; n' = 1`), true, 'Klopt.'),
        opt(M(`t' = ${a}t,\\; n' = t`), false, 'Differentieer: de afgeleide van ' + a + 't is ' + a + '.'),
        opt(M(`t' = ${a + b},\\; n' = ${1 + c}`), false, 'Losse getallen worden 0.'),
      ], { th: ['opt-afgeleide'], write: [`t = ${a}t + ${b},\\; t' = ${a};\\;\\; n = t + ${c},\\; n' = 1`] }),
      mc('Quotiëntregel', 'Wat is de teller van L′(t)?', [
        opt(M(`${a}(t + ${c}) - (${a}t + ${b}) \\cdot 1`), true, "Klopt: t′ · n − t · n′."),
        opt(M(`(${a}t + ${b}) \\cdot 1 - ${a}(t + ${c})`), false, 'Omgedraaid: eerst t′ · n.'),
      ], { write: [`L'(t) = \\dfrac{${a}(t + ${c}) - (${a}t + ${b})}{(t + ${c})^2}`] }),
      num('Uitwerken', `Werk de teller uit: ${a}t + ${a * c} − ${a}t − ${b} = …`, [k], { write: [`L'(t) = \\dfrac{${k}}{(t + ${c})^2}`] }),
    ],
    final: [{ label: 'teller', answers: [k], dp: 0 }],
    verify: () => [0.5, 2, 7].every(t => near((f(t + 1e-6) - f(t - 1e-6)) / 2e-6, k / (t + c) ** 2, 1e-5)),
  };
}

/* ---------- kortste route met Pythagoras ---------- */
function randMeetkunde() { const [L, Z] = pick([[3, 5], [6, 10], [4, 5], [12, 13]]); return { L, Z, h: pick([4, 6, 8, 12]), D: pick([15, 20, 25, 30]) }; }
function buildMeetkunde({ L, Z, h, D }) {
  const r = L / Z, u = r * h / Math.sqrt(1 - r * r), xs = D - u, K = x => L * x + Z * Math.sqrt((D - x) ** 2 + h * h), Km = K(xs);
  return {
    type: 'opt', pts: 8,
    prompt: `Een eiland ligt ${h} km uit de kust. Een stroomkabel loopt vanaf de centrale eerst \\(x\\) km langs de kust en dan schuin door het water naar het eiland. De centrale ligt ${D} km verderop langs de kust dan het punt recht tegenover het eiland. Een km kabel over land kost ${L} ton euro, door het water ${Z} ton euro. Bereken algebraïsch de minimale kosten. Rond af op 1 decimaal.`,
    steps: [
      mc('Formule', 'Wat zijn de kosten K(x) in ton euro?', [
        opt(M(`K = ${L}x + ${Z}\\sqrt{(${D} - x)^2 + ${h * h}}`), true, `Klopt: het schuine stuk is de schuine zijde van een driehoek met zijden ${D} − x en ${h}.`),
        opt(M(`K = ${L}x + ${Z}(${D} - x + ${h})`), false, 'Het schuine stuk is korter dan de twee rechte zijden samen: gebruik Pythagoras.'),
        opt(M(`K = ${Z}x + ${L}\\sqrt{(${D} - x)^2 + ${h * h}}`), false, 'De prijzen staan omgedraaid.'),
      ], { th: ['opt-meetkunde'], write: [`K(x) = ${L}x + ${Z}\\sqrt{(${D} - x)^2 + ${h * h}}`] }),
      num('Minimum', `Los K′(x) = 0 op. Bij welke x zijn de kosten minimaal? Rond af op 2 decimalen.`, [xs], { dp: 2, hint: `K′(x) = ${L} − ${Z}(${D} − x)/√((${D} − x)² + ${h * h}). Stel gelijk aan 0 en kwadrateer.`, write: [`K'(x) = ${L} - \\dfrac{${Z}(${D} - x)}{\\sqrt{(${D} - x)^2 + ${h * h}}} = 0 \\;\\Rightarrow\\; x \\approx ${dec(xs, 2).replace(',', '{,}')}`] }),
      num('Kosten', 'Bereken de minimale kosten. Rond af op 1 decimaal.', [Km], { dp: 1, write: [`K(${dec(xs, 2).replace(',', '{,}')}) \\approx ${dec(Km, 1).replace(',', '{,}')}`] }),
    ],
    final: [{ label: 'kosten', answers: [Km], dp: 1 }],
    plot: { curves: [{ f: K, tex: 'K(x)' }], keys: [0, D], marks: [{ x: xs, y: Km, m: 0 }], before: 'Waar zijn de kosten het laagst?', after: 'In het dal is de helling 0.' },
    verify: () => [xs - 0.05, xs + 0.05].every(x => K(x) > Km),
  };
}

const COURSE = maakOnderdeel({
  onderdeel: 'opt',
  home: { titel: 'Differentiëren en optimaliseren', tekst: 'Begin met wat het vaakst gevraagd wordt.' },
  gens: {
    oExtreem: { topic: 'opt-extreem', rand: randExtreem, build: buildExtreem, w: 3 },
    oVergelijking: { topic: 'opt-vergelijking', rand: randVergelijking, build: buildVergelijking, w: 2 },
    oFormule: { topic: 'opt-formule', rand: randFormule, build: buildFormule, w: 1 },
    oHelling: { topic: 'opt-helling', rand: randHelling, build: buildHelling, w: 1 },
    oAfgeleide: { topic: 'opt-afgeleide', rand: randAfgeleide, build: buildAfgeleide, w: 1 },
    oMeetkunde: { topic: 'opt-meetkunde', rand: randMeetkunde, build: buildMeetkunde, w: 0.7 },
  },
});
