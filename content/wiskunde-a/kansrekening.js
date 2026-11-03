/*
 * Wiskunde A · Kansrekening en combinatoriek
 * Contexten zoals op het tentamen: dobbelstenen, spellen, trekken uit een zak,
 * een vaste kans per stuk (binomiaal) en de verwachte winst van een spel.
 */
const nCr = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
const binom = (n, p, k) => nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
const frac = (a, b) => { const g = gcd(a, b); return `${a / g}/${b / g}`; };
const fracTex = (a, b) => { const g = gcd(a, b); return b / g === 1 ? `${a / g}` : `\\tfrac{${a / g}}{${b / g}}`; };

/* ---------- kansboom en minstens één ---------- */
function randBoom(lvl) {
  return { vorm: pick(lvl === 1 ? ['minstens', 'zonder'] : ['minstens', 'zonder', 'zonder3']), p: pick([0.05, 0.1, 0.15, 0.2, 0.25]), n: ri(2, lvl === 3 ? 6 : 4), r: ri(3, 6), g: ri(4, 8), c: ri(0, 2) };
}
function buildBoom({ vorm, p, n, r, g, c }) {
  if (vorm === 'minstens') {
    const ctx = [['peer', 'peren', 'rot'], ['lamp', 'lampen', 'kapot'], ['ei', 'eieren', 'gebroken']][c];
    const geen = Math.pow(1 - p, n), ans = 1 - geen;
    return {
      type: 'kans', pts: 4, prompt: `De kans dat een ${ctx[0]} ${ctx[2]} is, is ${nl(p)}. Je koopt ${n} ${ctx[1]}. Bereken de kans dat er minstens één ${ctx[2]} is. Rond af op 4 decimalen.`,
      steps: [
        mc('Aanpak', 'Wat is de handigste aanpak?', [
          opt('1 − P(geen enkele)', true, `Klopt. "Minstens één" heeft veel routes; "geen enkele" maar één.`),
          opt(`${n} · ${nl(p)}`, false, 'Kansen van verschillende stuks mag je niet zomaar optellen: dan kom je bij veel stuks boven 1 uit.'),
          opt(`${nl(p)}^${n}`, false, `Dat is de kans dat ze allemaal ${ctx[2]} zijn.`),
        ], { keepOrder: true, th: ['kans-boom'] }),
        num('P(geen)', `Bereken de kans dat geen enkele ${ctx[0]} ${ctx[2]} is. Rond af op 4 decimalen.`, [geen], { dp: 4, hint: `(1 − ${nl(p)})^${n}`, write: [`P(\\text{geen}) = ${td(1 - p)}^{${n}} \\approx ${dec(geen, 4).replace(',', '{,}')}`] }),
        num('Antwoord', 'Bereken nu de kans op minstens één. Rond af op 4 decimalen.', [ans], { dp: 4, write: [`P(\\text{minstens één}) = 1 - ${dec(geen, 4).replace(',', '{,}')} \\approx ${dec(ans, 4).replace(',', '{,}')}`] }),
      ],
      final: [{ label: 'P', answers: [ans], dp: 4 }],
      verify: () => { let s = 0; for (let k = 1; k <= n; k++) s += binom(n, p, k); return near(s, ans, 1e-9); },
    };
  }
  const N = r + g, k = vorm === 'zonder3' ? 3 : 2;
  const fac = Array.from({ length: k }, (_, i) => [r - i, N - i]), ans = fac.reduce((s, [a, b]) => s * a / b, 1);
  return {
    type: 'kans', pts: 4, prompt: `In een zak zitten ${r} rode en ${g} groene knikkers. Je pakt zonder terugleggen ${k} knikkers. Bereken de kans dat ze allemaal rood zijn. Rond af op 4 decimalen.`,
    steps: [
      num('Eerste knikker', 'Wat is de kans dat de eerste rood is? (Breuk mag.)', [r / N], { dp: 4, write: [`P(\\text{1e rood}) = ${fracTex(r, N)}`], th: ['kans-boom'] }),
      mc('Tweede knikker', 'De eerste was rood. Wat is de kans dat de tweede ook rood is?', [
        opt(M(fracTex(r - 1, N - 1)), true, `Klopt: er zitten nog ${r - 1} rode in, van de ${N - 1}.`),
        opt(M(fracTex(r, N)), false, 'Zonder terugleggen verandert de zak: er is één rode minder.'),
        opt(M(fracTex(r - 1, N)), false, `Er zitten ook in totaal minder knikkers in: ${N - 1}.`),
      ]),
      num('Kans', 'Vermenigvuldig langs de tak. Rond af op 4 decimalen.', [ans], { dp: 4, write: [`P = ${fac.map(([a, b]) => `\\tfrac{${a}}{${b}}`).join(' \\cdot ')} \\approx ${dec(ans, 4).replace(',', '{,}')}`] }),
    ],
    final: [{ label: 'P', answers: [ans], dp: 4 }],
    verify: () => near(nCr(r, k) / nCr(N, k), ans, 1e-12),
  };
}

/* ---------- binomiale kans ---------- */
function randBinom(lvl) {
  return { vorm: pick(lvl === 1 ? ['precies'] : ['precies', 'precies', 'hoogstens', 'minstens']), n: ri(5, lvl === 3 ? 20 : 12), p: pick([1 / 6, 0.2, 0.25, 0.3, 0.4, 0.5, 0.7, 0.8]), c: ri(0, 2) };
}
function buildBinom({ vorm, n, p, c }) {
  const k = vorm === 'precies' ? Math.max(1, Math.min(n - 1, Math.round(n * p) + pick([-1, 0, 1]))) : 1;
  const ctx = [`Bij een spel gooi je ${n} keer met een dobbelsteen`, `${n} sporters doen een dopingtest`, `${n} huurders hebben een bungalow geboekt`][c];
  const wat = ['een zes', 'een positieve test', 'dat de huurder komt opdagen'][c];
  const pp = c === 0 ? 1 / 6 : c === 1 ? Math.min(p, 0.3) : Math.max(p, 0.7), ptxt = c === 0 ? '1/6' : nl(pp);
  const ans = vorm === 'precies' ? binom(n, pp, k) : vorm === 'hoogstens' ? binom(n, pp, 0) + binom(n, pp, 1) : 1 - binom(n, pp, 0);
  const vraag = vorm === 'precies' ? `precies ${k} keer ${wat}` : vorm === 'hoogstens' ? `hoogstens 1 keer ${wat}` : `minstens 1 keer ${wat}`;
  const steps = [
    mc('Binomiaal?', 'Welke verdeling hoort hierbij?', [
      opt(`Binomiaal met n = ${n} en p = ${ptxt}`, true, `Klopt: ${n} keer hetzelfde, steeds dezelfde kans, onafhankelijk.`),
      opt(`Binomiaal met n = ${ptxt} en p = ${n}`, false, 'n is het aantal keer, p de kans per keer.'),
      opt('Normaal verdeeld', false, 'Je telt een aantal keer succes: dat is binomiaal.'),
    ], { th: ['kans-binom'], write: [`X \\sim \\text{Bin}(n = ${n},\\; p = ${c === 0 ? '\\tfrac16' : td(pp)})`] }),
  ];
  if (vorm === 'precies') steps.push(num('Kans', `Bereken P(X = ${k}). Rond af op 4 decimalen.`, [ans], { dp: 4, hint: `(${n} boven ${k}) · p^${k} · (1 − p)^${n - k}`, write: [`P(X = ${k}) = \\binom{${n}}{${k}} \\cdot ${c === 0 ? '(\\tfrac16)' : td(pp)}^{${k}} \\cdot ${c === 0 ? '(\\tfrac56)' : td(1 - pp)}^{${n - k}} \\approx ${dec(ans, 4).replace(',', '{,}')}`] }));
  else if (vorm === 'hoogstens') steps.push(
    num('P(X = 0)', 'Bereken P(X = 0). Rond af op 4 decimalen.', [binom(n, pp, 0)], { dp: 4, write: [`P(X = 0) \\approx ${dec(binom(n, pp, 0), 4).replace(',', '{,}')}`] }),
    num('P(X ≤ 1)', 'Tel P(X = 1) erbij. Rond af op 4 decimalen.', [ans], { dp: 4, hint: 'Hoogstens 1 = 0 of 1.', write: [`P(X \\le 1) = P(X = 0) + P(X = 1) \\approx ${dec(ans, 4).replace(',', '{,}')}`] }));
  else steps.push(num('Complement', 'Gebruik 1 − P(X = 0). Rond af op 4 decimalen.', [ans], { dp: 4, write: [`P(X \\ge 1) = 1 - P(X = 0) \\approx ${dec(ans, 4).replace(',', '{,}')}`] }));
  return { type: 'kans', pts: 4, prompt: `${ctx}. De kans op ${wat} is steeds ${ptxt}. Bereken de kans op ${vraag}. Rond af op 4 decimalen.`, steps, final: [{ label: 'P', answers: [ans], dp: 4 }],
    verify: () => { const pr = Array.from({ length: n + 1 }, (_, j) => binom(n, pp, j)); return near(pr.reduce((s, x) => s + x, 0), 1, 1e-9) && near(vorm === 'precies' ? pr[k] : vorm === 'hoogstens' ? pr[0] + pr[1] : pr.slice(1).reduce((s, x) => s + x, 0), ans, 1e-12); } };
}

/* ---------- kansverdeling en verwachte winst ---------- */
function randVerwacht(lvl) { return { inzet: pick([1, 2, 3, 5]), A: pick([10, 15, 20, 25]), B: pick([2, 3, 4, 5]), org: lvl >= 2 && Math.random() < 0.5 }; }
function buildVerwacht({ inzet, A, B, org }) {
  // twee dobbelstenen: dubbel zes geeft A, een ander dubbel geeft B, de rest niets
  const pA = 1 / 36, pB = 5 / 36, p0 = 30 / 36, E = (A - inzet) * pA + (B - inzet) * pB - inzet * p0, ans = org ? -E : E;
  return {
    type: 'kans', pts: 5,
    prompt: `Bij een spel op een clubavond betaal je € ${inzet} en gooi je met twee dobbelstenen. Gooi je dubbel zes, dan krijg je € ${A}. Gooi je een ander dubbel, dan krijg je € ${B}. Anders krijg je niets. Bereken de verwachte winst per spel voor ${org ? 'de club' : 'de speler'}. Rond af op 2 decimalen.`,
    steps: [
      num('Dubbel zes', 'Wat is de kans op dubbel zes? (Breuk mag.)', [pA], { dp: 4, write: [`P(\\text{dubbel zes}) = \\tfrac{1}{36}`], th: ['kans-verwachting', 'kans-dobbel'] }),
      num('Ander dubbel', 'Wat is de kans op een ander dubbel?', [pB], { dp: 4, hint: 'Er zijn 6 dubbels; dubbel zes telt hier niet mee.', write: [`P(\\text{ander dubbel}) = \\tfrac{5}{36}`] }),
      mc('Winst', 'Wat is de winst van de speler bij dubbel zes?', [
        opt(`€ ${A - inzet}`, true, `Klopt: je krijgt ${A}, maar je had ${inzet} betaald.`),
        opt(`€ ${A}`, false, 'Je moet de inzet er nog vanaf halen.'),
        opt(`€ ${A + inzet}`, false, 'De inzet ben je kwijt: die gaat eraf, niet erbij.'),
      ], { write: [`W \\in \\{${A - inzet},\\; ${B - inzet},\\; -${inzet}\\}`] }),
      num('Verwachting', `Bereken de verwachte winst per spel voor ${org ? 'de club (het omgekeerde van de speler)' : 'de speler'}. Rond af op 2 decimalen.`, [ans], { dp: 2, hint: 'E(W) = som van winst · kans.', write: [`E(W_{\\text{speler}}) = ${A - inzet} \\cdot \\tfrac{1}{36} + ${B - inzet} \\cdot \\tfrac{5}{36} - ${inzet} \\cdot \\tfrac{30}{36} \\approx ${dec(E, 2).replace(',', '{,}')}`, ...(org ? [`E(W_{\\text{club}}) \\approx ${dec(-E, 2).replace(',', '{,}')}`] : [])] }),
    ],
    final: [{ label: 'E', answers: [ans], dp: 2 }],
    verify: () => { let s = 0; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) s += (i === j ? (i === 6 ? A : B) : 0) - inzet; return near(org ? -s / 36 : s / 36, ans, 1e-12); },
  };
}

/* ---------- dobbelstenen ---------- */
function randDobbel(lvl) { return { vorm: pick(lvl === 1 ? ['som'] : ['som', 'minstens', 'gelijk']), s: ri(4, 11), m: ri(8, 11), d: pick([3, 4]) }; }
function buildDobbel({ vorm, s, m, d }) {
  let gunst = 0, tot = 36, vraag, uitleg;
  if (vorm === 'som') { for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === s) gunst++; vraag = `de som van de ogen precies ${s} is`; uitleg = `Tel de paren met som ${s}, en tel 2+5 en 5+2 als twee.`; }
  else if (vorm === 'minstens') { for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j >= m) gunst++; vraag = `de som van de ogen minstens ${m} is`; uitleg = `Tel alle paren met som ${m} of meer.`; }
  else { tot = Math.pow(6, d); gunst = 6; vraag = `alle ${d} dobbelstenen hetzelfde aantal ogen hebben`; uitleg = `Er zijn 6 mogelijkheden: allemaal 1, allemaal 2, …`; }
  const n = vorm === 'gelijk' ? d : 2, ans = gunst / tot;
  return {
    type: 'kans', pts: 3, prompt: `Je gooit met ${n} gewone dobbelstenen. Bereken de kans dat ${vraag}.`,
    steps: [
      num('Totaal', `Hoeveel uitkomsten zijn er in totaal met ${n} dobbelstenen?`, [tot], { hint: `6 keer 6${n > 2 ? ' keer 6…' : ''}`, write: [`\\text{totaal} = 6^{${n}} = ${tot}`], th: ['kans-dobbel'] }),
      num('Gunstig', 'Hoeveel daarvan zijn gunstig?', [gunst], { hint: uitleg, write: [`\\text{gunstig} = ${gunst}`], fig: n === 2 ? { soort: 'rooster', goed: () => false, onderschrift: 'Alle 36 uitkomsten, met in elk vakje de som van de ogen. Tel de vakjes die passen.' } : null }),
      num('Kans', 'Wat is de kans? (Breuk mag, of 4 decimalen.)', [ans], { dp: 4, write: [`P = \\dfrac{${gunst}}{${tot}} ${eqd(ans, 4)}`] }),
    ],
    final: [{ label: 'P', answers: [ans], dp: 4 }],
    verify: () => { let g = 0, t = 0; const rec = (k, arr) => { if (k === n) { t++; const sm = arr.reduce((a, b) => a + b, 0); if (vorm === 'som' ? sm === s : vorm === 'minstens' ? sm >= m : arr.every(x => x === arr[0])) g++; return; } for (let i = 1; i <= 6; i++) rec(k + 1, [...arr, i]); }; rec(0, []); return near(g / t, ans, 1e-12); },
  };
}

/* ---------- systematisch tellen ---------- */
function randTellen(lvl) { return { vorm: pick(lvl === 1 ? ['volgorde', 'groep'] : ['volgorde', 'groep', 'serie']), n: ri(5, 10), k: ri(2, 4) }; }
function buildTellen({ vorm, n, k }) {
  let ans, prompt, telt, regel;
  if (vorm === 'volgorde') { ans = fact(k + 2); prompt = `Op hoeveel verschillende manieren kun je ${k + 2} verschillende boeken naast elkaar op een plank zetten?`; telt = true; regel = `${k + 2}! = ${Array.from({ length: k + 2 }, (_, i) => k + 2 - i).join(' \\cdot ')} = ${ans}`; }
  else if (vorm === 'groep') { ans = nCr(n, k); prompt = `Uit een klas van ${n} leerlingen kies je een groepje van ${k}. Hoeveel verschillende groepjes zijn er mogelijk?`; telt = false; regel = `\\binom{${n}}{${k}} = ${ans}`; }
  else { ans = nCr(n, k); prompt = `Je gooit ${n} keer met een munt. Op hoeveel manieren kun je precies ${k} keer kop gooien?`; telt = false; regel = `\\binom{${n}}{${k}} = ${ans}`; }
  return {
    type: 'kans', pts: 3, prompt,
    steps: [
      mc('Volgorde', vorm === 'serie' ? 'Je kiest welke worpen kop zijn. Telt de volgorde van het kiezen?' : 'Telt de volgorde?', [
        opt('Ja, de volgorde telt', telt, telt ? 'Klopt: een andere volgorde is een andere opstelling.' : vorm === 'serie' ? 'Je kiest een groepje van plekken: welke worpen kop zijn. De volgorde van kiezen telt niet.' : 'Een groepje is hetzelfde groepje, in welke volgorde je ook kiest.'),
        opt('Nee, de volgorde telt niet', !telt, !telt ? 'Klopt: dan gebruik je combinaties, nCr.' : 'Een andere volgorde van de boeken is een andere opstelling.'),
      ], { keepOrder: true, th: ['kans-tellen'] }),
      num('Aantal', 'Bereken het aantal.', [ans], { hint: telt ? 'Vermenigvuldig het aantal keuzes per plek.' : 'Gebruik nCr op je rekenmachine.', write: [regel] }),
    ],
    final: [{ label: 'aantal', answers: [ans], dp: 0 }],
    verify: () => (telt ? ans === [...Array(k + 2).keys()].reduce((s, i) => s * (i + 1), 1) : ans === nCr(n - 1, k - 1) + nCr(n - 1, k)),
  };
}

const COURSE = maakOnderdeel({
  onderdeel: 'kans',
  home: { titel: 'Kansrekening en combinatoriek', tekst: 'Begin met wat het vaakst gevraagd wordt.' },
  gens: {
    kBoom: { topic: 'kans-boom', rand: randBoom, build: buildBoom, w: 2.5 },
    kVerwacht: { topic: 'kans-verwachting', rand: randVerwacht, build: buildVerwacht, w: 2 },
    kBinom: { topic: 'kans-binom', rand: randBinom, build: buildBinom, w: 2 },
    kDobbel: { topic: 'kans-dobbel', rand: randDobbel, build: buildDobbel, w: 1 },
    kTellen: { topic: 'kans-tellen', rand: randTellen, build: buildTellen, w: 0.8 },
  },
});
