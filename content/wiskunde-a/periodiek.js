/*
 * Wiskunde A · Periodieke functies
 * Alle sommen gebruiken de vorm van het tentamen: y = a + b · sin(c(t − d)).
 * Contexten zoals ze op het tentamen voorkomen: getij, reuzenrad, temperatuur, golfslagbad.
 */
const SIN_CTX = [
  { naam: 'getij', tekst: 'De waterdiepte D in meter in een haven, t uur na middernacht', y: 'D', t: 'uur', P: [12.4, 12.5], a: [1.8, 2, 2.5], b: [0.8, 1.2, 1.5], d: [1.5, 2, 3] },
  { naam: 'reuzenrad', tekst: 'De hoogte H in meter van een cabine in een reuzenrad, t minuten na het instappen', y: 'H', t: 'minuten', P: [10, 12, 15, 20], a: [30, 40, 50], b: null, d: [2.5, 3, 5] },
  { naam: 'temperatuur', tekst: 'De temperatuur T in °C in een kas, t uur na middernacht', y: 'T', t: 'uur', P: [24], a: [18, 20, 22], b: [2, 3, 4], d: [7, 8, 9] },
  { naam: 'golfslagbad', tekst: 'De waterdiepte D in meter op een plek in een golfslagbad, t seconden na het aanzetten', y: 'D', t: 'seconden', P: [6, 8, 10], a: [2.5, 3], b: [0.5, 0.8], d: [1, 2] },
];
const twoPi = 2 * Math.PI;
function sinParams(lvl) {
  const k = ri(0, SIN_CTX.length - 1), C = SIN_CTX[k], a = pick(C.a), P = pick(C.P);
  return { k, a, b: C.b ? pick(C.b) : a - 2, P, d: pick(C.d) };
}
// c staat afgerond op 3 decimalen in de formule; de app rekent met precies dat getal,
// zodat een leerling die met de formule uit de vraag rekent ook precies goed uitkomt.
const cOf = P => Math.round(twoPi / P * 1000) / 1000;
const sinF = ({ a, b, P, d }) => t => a + b * Math.sin(cOf(P) * (t - d));
const sinTex = ({ a, b, P, d }, y) => `${y} = ${td(a)} + ${td(b)} \\sin(${td(cOf(P))}(t - ${td(d)}))`;
const sinPlot = (q, y, keys, marks, before, after, extra = []) => ({ curves: [{ f: sinF(q), tex: sinTex(q, y) }, ...extra], keys, marks, before, after });

/* ---------- a, b, c en d bepalen ---------- */
function randAbcd(lvl) { return sinParams(lvl); }
function buildAbcd(q) {
  const C = SIN_CTX[q.k], M = q.a + q.b, m = q.a - q.b, c = twoPi / q.P, tmax = q.d + q.P / 4;
  return {
    type: 'sinus', pts: 5,
    prompt: `${C.tekst}, wordt benaderd met \\(${C.y} = a + b \\sin(c(t - d))\\). De hoogste waarde is ${nl(M)}, de laagste waarde is ${nl(m)}. De periode is ${nl(q.P)} ${C.t}. De eerste keer dat ${C.y} maximaal is, is op \\(t = ${td(tmax)}\\). Bepaal a, b, c en d.`,
    steps: [
      num('a: evenwichtsstand', 'Bereken a, het midden tussen hoogste en laagste waarde.', [q.a], { dp: 2, hint: `(${nl(M)} + ${nl(m)}) / 2`, write: [`a = \\dfrac{${td(M)} + ${td(m)}}{2} = ${td(q.a)}`], th: ['sin-abcd'] }),
      num('b: amplitude', 'Bereken b, de uitslag vanaf het midden.', [q.b], { dp: 2, hint: `(${nl(M)} − ${nl(m)}) / 2`, write: [`b = \\dfrac{${td(M)} - ${td(m)}}{2} = ${td(q.b)}`] }),
      num('c: uit de periode', 'Bereken c. Rond af op 3 decimalen.', [c], { dp: 3, hint: `c = 2π / ${nl(q.P)}`, write: [`c = \\dfrac{2\\pi}{${td(q.P)}} \\approx ${dec(c, 3).replace(',', '{,}')}`] }),
      mc('d: beginpunt', 'Waar ligt het beginpunt d, waar de grafiek stijgend door de evenwichtsstand gaat?', [
        opt('Een kwart periode vóór het maximum', true, 'Klopt: van evenwicht naar top duurt een kwart periode.'),
        opt('Op het maximum', false, 'Op het maximum is de grafiek op zijn hoogst, niet in het midden.'),
        opt('Een halve periode vóór het maximum', false, 'Daar ligt juist het minimum.'),
      ], { keepOrder: true }),
      num('d', 'Bereken d.', [q.d], { dp: 2, hint: `${nl(tmax)} − ${nl(q.P)}/4`, write: [`d = ${td(tmax)} - \\dfrac{${td(q.P)}}{4} = ${td(q.d)}`] }),
    ],
    final: [{ label: 'd', answers: [q.d], dp: 2 }],
    plot: sinPlot(q, C.y, [0, q.P * 1.5], [{ x: tmax, y: M, lab: 'max' }, { x: q.d, y: q.a, lab: 'd' }], 'Zoek het midden, de uitslag en de periode in de grafiek.', 'Het beginpunt d ligt een kwart periode vóór de top.', [{ f: () => q.a, tex: `y = ${td(q.a)}` }]),
    verify: () => { const f = t => q.a + q.b * Math.sin(c * (t - q.d)); return near(f(tmax), M, 1e-9) && near(f(tmax + q.P / 2), m, 1e-9) && near(f(q.d), q.a, 1e-9); },
  };
}

/* ---------- minimum, maximum en periode ---------- */
function randMinmax(lvl) { return { ...sinParams(lvl), freq: lvl >= 2 && Math.random() < 0.4 }; }
function buildMinmax(q) {
  const C = SIN_CTX[q.k], M = q.a + q.b, m = q.a - q.b, Pe = twoPi / cOf(q.P), perMin = q.k === 1 ? 60 / q.P : null;
  const steps = [
    num('Maximum', 'Wat is de maximale waarde?', [M], { dp: 2, hint: 'Een sinus is hoogstens 1: a + b · 1.', write: [`\\text{max} = ${td(q.a)} + ${td(q.b)} = ${td(M)}`], th: ['sin-minmax'] }),
    num('Minimum', 'Wat is de minimale waarde?', [m], { dp: 2, hint: 'Een sinus is minstens −1: a − b.', write: [`\\text{min} = ${td(q.a)} - ${td(q.b)} = ${td(m)}`] }),
    num('Periode', `Bereken de periode in ${C.t}. Rond af op 2 decimalen.`, [Pe], { dp: 2, hint: 'Periode = 2π / c.', write: [`\\text{periode} = \\dfrac{2\\pi}{${td(cOf(q.P))}} \\approx ${dec(Pe, 2).replace(',', '{,}')}`] }),
  ];
  return {
    type: 'sinus', pts: 4, prompt: `${C.tekst}, wordt gegeven door \\(${sinTex(q, C.y)}\\). Bereken de minimale en de maximale waarde en de periode.`,
    steps, final: [{ label: 'periode', answers: [Pe], dp: 2 }],
    plot: sinPlot(q, C.y, [0, 2 * q.P], [], 'Hoe hoog en hoe laag komt de grafiek?', `Tussen ${nl(m)} en ${nl(M)}, en na ${nl(q.P)} ${C.t} herhaalt het zich.`),
    verify: () => { const f = sinF(q); let hi = -1e9, lo = 1e9; for (let i = 0; i <= 4000; i++) { const y = f(i * q.P / 2000); hi = Math.max(hi, y); lo = Math.min(lo, y); } return near(hi, M, 1e-3) && near(lo, m, 1e-3) && near(f(1.234 + Pe), f(1.234), 1e-9) && !!(perMin === null || perMin > 0); },
  };
}

/* ---------- tijdstippen berekenen ---------- */
function randTijdstippen(lvl) { return { ...sinParams(lvl), s: pick(lvl === 1 ? [0.5, -0.5] : [0.5, -0.5, 0.25, 0.6, -0.8, 0.8]) }; }
function buildTijdstippen(q) {
  const C = SIN_CTX[q.k], c = cOf(q.P), Pe = twoPi / c, h = q.a + q.b * q.s, al = Math.asin(q.s), be = Math.PI - al;
  const base = [al, be].map(x => q.d + x / c).map(t => ((t % Pe) + Pe) % Pe);
  const times = uniqSort([...base, ...base.map(t => t + Pe), ...base.map(t => t + 2 * Pe)]).filter(t => t > 1e-9).slice(0, 3);
  return {
    type: 'sinus', pts: 4,
    prompt: `${C.tekst}, wordt gegeven door \\(${sinTex(q, C.y)}\\). Bereken algebraïsch de eerste drie tijdstippen na \\(t = 0\\) waarop \\(${C.y} = ${td(h)}\\). Rond af op 2 decimalen.`,
    steps: [
      num('Sinus vrijmaken', `Zet de sinus alleen: \\(\\sin(${td(c)}(t - ${td(q.d)})) = \\ldots\\)`, [q.s], { dp: 3, hint: `(${td(h)} − ${td(q.a)}) / ${td(q.b)}`, write: [`\\sin(${td(c)}(t - ${td(q.d)})) = ${td(q.s)}`], th: ['sin-tijdstip'] }),
      num('Eerste hoek', `Bereken \\(\\sin^{-1}(${td(q.s)})\\) in radialen. Rond af op 3 decimalen.`, [al], { dp: 3, hint: 'Zet je rekenmachine op radialen (RAD).', write: [`${td(c)}(t - ${td(q.d)}) \\approx ${dec(al, 3).replace(',', '{,}')}`] }),
      mc('Tweede hoek', 'Welke hoek heeft dezelfde sinus?', [
        opt(M(`\\pi - ${dec(al, 3).replace(',', '{,}')}`), true, 'Klopt: sin(π − x) = sin(x).'),
        opt(M(`-${dec(al, 3).replace(',', '{,}')}`), false, 'sin(−x) = −sin(x): dat geeft het tegengestelde.'),
        opt(M(`\\pi + ${dec(al, 3).replace(',', '{,}')}`), false, 'sin(π + x) = −sin(x).'),
      ], { write: [`\\text{of } ${td(c)}(t - ${td(q.d)}) \\approx ${dec(be, 3).replace(',', '{,}')}`] }),
      num('Tijdstippen', `Reken beide hoeken om naar t en tel periodes van ${dec(Pe, 2)} op. Geef de eerste drie tijdstippen na t = 0, afgerond op 2 decimalen.`, times, { dp: 2, hint: `t = ${td(q.d)} + hoek / ${dec(c, 3)}. Komt er iets negatiefs uit, tel dan een periode op.`, write: [`t \\approx ${times.map(t => dec(t, 2).replace(',', '{,}')).join(',\\ ')}`] }),
    ],
    final: [{ label: 't', answers: times, dp: 2 }],
    plot: sinPlot(q, C.y, [0, times[2]], times.map(x => ({ x, y: h })), `Waar snijdt de grafiek de lijn ${C.y} = ${nl(h)}?`, 'Twee snijpunten per periode: daarom zijn er twee hoeken.', [{ f: () => h, tex: `y = ${td(h)}` }]),
    verify: () => { const f = sinF(q); return times.length === 3 && times.every(t => near(f(t), h, 1e-6)); },
  };
}

/* ---------- tijdstip van een top ---------- */
function randTop(lvl) { return { ...sinParams(lvl), neg: lvl === 3 && Math.random() < 0.4 }; }
function buildTop(q) {
  const C = SIN_CTX[q.k], b = q.neg ? -Math.abs(q.b) : q.b, qq = { ...q, b }, Pe = twoPi / cOf(q.P), t1 = q.d + (b > 0 ? Pe / 4 : 3 * Pe / 4);
  return {
    type: 'sinus', pts: 4,
    prompt: `${C.tekst}, wordt gegeven door \\(${sinTex(qq, C.y)}\\). Bereken algebraïsch het eerste tijdstip na \\(t = 0\\) waarop ${C.y} maximaal is. Rond af op 2 decimalen.`,
    steps: [
      num('Periode', 'Bereken de periode. Rond af op 2 decimalen.', [Pe], { dp: 2, hint: '2π / c', write: [`\\text{periode} \\approx ${dec(Pe, 2).replace(',', '{,}')}`], th: ['sin-top'] }),
      mc('Waar ligt het maximum?', `Waar ligt het eerste maximum na het beginpunt d = ${nl(q.d)}?`, [
        opt(M('d + \\tfrac{1}{4} \\cdot \\text{periode}'), b > 0, b > 0 ? 'Klopt: b is positief, dus de grafiek gaat stijgend door d en bereikt na een kwart periode de top.' : 'b is negatief: dan gaat de grafiek dalend door d en ligt daar juist het minimum.'),
        opt(M('d + \\tfrac{3}{4} \\cdot \\text{periode}'), b < 0, b < 0 ? 'Klopt: met een negatieve b staat de grafiek op zijn kop.' : 'Bij een positieve b ligt hier het minimum.'),
        opt(M('d'), false, 'Op d is de grafiek in het midden, niet op de top.'),
      ], { keepOrder: true }),
      num('Tijdstip', 'Bereken het tijdstip van het eerste maximum. Rond af op 2 decimalen.', [t1], { dp: 2, write: [`t = ${td(q.d)} + ${b > 0 ? '\\tfrac14' : '\\tfrac34'} \\cdot ${dec(Pe, 2).replace(',', '{,}')} \\approx ${dec(t1, 2).replace(',', '{,}')}`] }),
    ],
    final: [{ label: 't', answers: [t1], dp: 2 }],
    plot: sinPlot(qq, C.y, [0, t1 + q.P / 2], [{ x: t1, y: q.a + Math.abs(b), m: 0, lab: 'top' }], 'Waar ligt de eerste top?', 'In de top loopt de grafiek even horizontaal.'),
    verify: () => { const f = sinF(qq); return near(f(t1), q.a + Math.abs(b), 1e-9) && t1 > 0 && t1 <= Pe + q.d; },
  };
}

const COURSE = maakOnderdeel({
  onderdeel: 'sinus',
  home: { titel: 'Periodieke functies', tekst: 'Begin met wat het vaakst gevraagd wordt.' },
  gens: {
    sAbcd: { topic: 'sin-abcd', rand: randAbcd, build: buildAbcd, w: 3 },
    sTijdstip: { topic: 'sin-tijdstip', rand: randTijdstippen, build: buildTijdstippen, w: 2 },
    sMinmax: { topic: 'sin-minmax', rand: randMinmax, build: buildMinmax, w: 1 },
    sTop: { topic: 'sin-top', rand: randTop, build: buildTop, w: 1 },
  },
});
