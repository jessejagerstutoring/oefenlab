/*
 * Wiskunde A · Opgave 1
 *
 * Alle inhoud van deze trainer: sommen-generators, echte tentamenvragen, theorie en de
 * grafiek-gegevens. Rekenhulpjes en antwoordcontrole staan in ../gedeeld.js. Er zit hier geen opmaak of schermlogica in,
 * zodat dit bestand ook los te testen is (zie tests/opgave-1.test.mjs).
 *
 * Een nieuwe opgave of een nieuw vak krijgt een eigen bestand met hetzelfde COURSE-object onderaan.
 */

const TYPES = {
  veelterm: { h: 'Veeltermvergelijking', d: 'alleen machten van x, zoals x² of x³' },
  expo: { h: 'Exponentiële of log-vergelijking', d: 'x staat in een exponent, zoals 5ˣ, of in een log' },
  wortel: { h: 'Wortelvergelijking', d: 'x staat onder een wortelteken' },
  afgeleide: { h: 'Vraag met de afgeleide', d: 'het gaat over een helling, raaklijn, top of minimum' },
};
const WRONG = {
  veelterm: 'Kijk nog eens goed waar de x staat. Er gebeurt hier meer dan alleen x², x³ en zo.',
  expo: 'Kijk nog eens goed: er staat geen x in een exponent (het kleine getal rechtsboven) en ook niet in een log.',
  wortel: 'Kijk nog eens goed: er staat geen x onder een wortelteken.',
  afgeleide: 'De vraag gaat niet over een helling, raaklijn, top of minimum. De afgeleide heb je hier dus niet nodig.',
};
function recog(type, cue, over = {}) {
  return {
    kind: 'mc', label: 'Herkennen', keepOrder: true, write: [], explain: '', th: ['soorten'],
    q: 'Wat voor som is dit? Kijk eerst even waar de <b>x</b> staat en wat er precies gevraagd wordt.',
    hint: 'Stel jezelf drie vragen. Staat de x in een exponent? Staat hij onder een wortel? Of gaat de vraag over een helling, raaklijn of top?',
    options: Object.keys(TYPES).map(k => opt(`<b>${TYPES[k].h}</b><small>${TYPES[k].d}</small>`, k === type, k === type ? cue : (over[k] || WRONG[k]))),
  };
}
function zeroStep(P, flipped) {
  const correct = `${ptex(P)} = 0`;
  const ks = Object.keys(P).map(Number).sort((a, b) => b - a);
  const wrongs = [];
  ks.slice(1).forEach(k => { const Q = { ...P }; Q[k] = -Q[k]; wrongs.push(`${ptex(Q)} = 0`); });
  if (wrongs.length < 2) { const Q = { ...P }; Q[ks[0]] = -Q[ks[0]]; Q[ks[1]] = -Q[ks[1]] * 2; wrongs.push(`${ptex(Q)} = 0`); }
  const why = 'Let even op de tekens. Een term die naar de andere kant gaat, krijgt het tegenovergestelde teken.';
  return mc('Herleiden op nul',
    'Zet eerst alles aan de linkerkant, zodat er rechts 0 staat.' + (flipped ? ' Maak de hoogste macht daarna positief door alles keer −1 te doen.' : '') + ' Welke vergelijking krijg je?',
    [opt(M(correct), true, flipped ? 'Klopt. Na het verplaatsen heb je alles nog keer −1 gedaan, zodat de hoogste macht positief is. Dat mag altijd en rekent een stuk prettiger.' : 'Klopt. Elke term die naar links ging, is van teken gewisseld.'),
     ...wrongs.slice(0, 2).map(w => opt(M(w), false, why))],
    { hint: 'Een term die van rechts naar links gaat, wisselt van teken: + wordt − en − wordt +.', th: ['nul'], write: [correct] });
}
function discStep(a, b, c, intro = '', v = 'x') {
  const { D } = quad(a, b, c);
  const Dv = b * b - 4 * a * c;
  return num('Discriminant',
    `${intro}Gebruik de abc-formule voor \\(${poly([[a, 2], [b, 1], [c, 0]], v)} = 0\\). Bereken eerst de discriminant \\(D = b^2 - 4ac\\), met \\(a = ${tn(a)}\\), \\(b = ${tn(b)}\\) en \\(c = ${tn(c)}\\).`,
    [Dv], {
      hint: 'Pas op met mintekens. Het kwadraat van een negatief getal is positief: (−7)² = 49. En voor 4ac staat een min.',
      th: ['abc'],
      write: [`D = ${tnp(b)}^2 - 4 \\cdot ${tnp(a)} \\cdot ${tnp(c)} = ${tn(Dv)}`],
      explain: D < 0 ? 'D is negatief, dus dit deel heeft geen oplossingen.' : near(D, 0) ? 'D is precies 0, dus er is één oplossing.' : 'D is positief, dus er komen twee oplossingen uit.',
    });
}
function derivOpts(f, name = 'f') {
  const d = deriv(f);
  const cst = f[0] || 0;
  const keep = { ...d }; if (cst) keep[0] = (keep[0] || 0) + cst;
  const noLow = {}, noMul = {};
  Object.keys(f).map(Number).forEach(k => { if (k > 0) { noLow[k] = (noLow[k] || 0) + k * f[k]; noMul[k - 1] = (noMul[k - 1] || 0) + f[k]; } });
  return [
    opt(M(`${name}'(x) = ${ptex(d)}`), true, 'Mooi. Met de machtsregel wordt \\(a x^n\\) gelijk aan \\(n \\cdot a\\, x^{n-1}\\), en een los getal valt weg.'),
    cst ? opt(M(`${name}'(x) = ${ptex(keep)}`), false, 'Een los getal, zonder x, verandert niet. De afgeleide daarvan is 0, dus dat valt weg.') : null,
    opt(M(`${name}'(x) = ${ptex(noLow)}`), false, 'Je hebt wel met de exponent vermenigvuldigd, maar de exponent nog niet 1 lager gemaakt.'),
    opt(M(`${name}'(x) = ${ptex(noMul)}`), false, 'Je hebt de exponent 1 lager gemaakt, maar nog niet vermenigvuldigd met de oude exponent.'),
  ];
}
/* x (of een macht van x) buiten haakjes, splitsen, en het kwadratische deel klaarzetten */
function factorSteps(P, v = 'x') {
  const ks = Object.keys(P).map(Number).filter(k => !near(P[k], 0)).sort((a, b) => a - b);
  const lo = ks[0];
  const Q = {}; ks.forEach(k => Q[k - lo] = P[k]);
  const A = Q[2] || 0, B = Q[1] || 0, C = Q[0] || 0;
  const qd = ptex(Q, v), xl = pw(lo, v);
  const steps = [
    mc('Ontbinden', `In elke term zit een ${v}. Wat is een handige eerste stap?`, [
      opt(M(`${xl}(${qd}) = 0`), true, lo > 1 ? `Precies. De kleinste macht, \\(${xl}\\), zit in elke term. Die haal je buiten haakjes.` : `Precies. In elke term zit minstens één ${v}, dus die haal je buiten haakjes.`),
      lo > 1 ? opt(M(`${v}(${ptex(Object.fromEntries(ks.map(k => [k - 1, P[k]])), v)}) = 0`), false, `Dat mag, maar je bent nog niet klaar: tussen de haakjes staat nog een ${v}. Haal meteen \\(${xl}\\) buiten haakjes.`) : null,
      opt(`Deel beide kanten door \\(${xl}\\)`, false, `Dat is een bekende valkuil. ${v} kan ook 0 zijn, en dan raak je die oplossing kwijt.`),
      opt('Meteen de abc-formule gebruiken', false, `De abc-formule werkt alleen bij \\(a${v}^2 + b${v} + c = 0\\). Hier is de hoogste macht groter dan 2.`),
    ], { hint: `Zoek de kleinste macht van ${v} die in álle termen zit.`, th: ['buiten'], write: [`${xl}(${qd}) = 0`] }),
    mc('Splitsen', 'Er staat nu een product dat 0 is. Wat weet je dan?', [
      opt(M(`${xl} = 0 \\;\\vee\\; ${qd} = 0`), true, 'Klopt. Een product is 0 als minstens één van de factoren 0 is.'),
      opt(M(`${qd} = 0`), false, `Dan vergeet je de factor \\(${xl}\\). Ook ${v} = 0 is een oplossing.`),
      opt(M(`${v} = 0`), false, 'Het deel tussen de haakjes kan ook 0 zijn. Die oplossingen mis je dan.'),
    ], { hint: 'A · B = 0 betekent: A = 0 of B = 0.', th: ['buiten'], write: [`${xl} = 0 \\;\\vee\\; ${qd} = 0`] }),
  ];
  let roots, lines;
  if (!near(A, 0)) { roots = quad(A, B, C).roots; steps.push(discStep(A, B, C, '', v)); lines = abcXLines(A, B, C, 3, v).slice(1); }
  else { roots = [-C / B]; lines = [`${v} = ${tn(-C / B)}`]; }
  const sols = uniqSort([0, ...roots]);
  return { steps, sols, lines: [...lines, solsLine(sols, 3, v)] };
}

/* ---------- 1. veeltermvergelijkingen ---------- */
function randLayout(terms) {
  const t = terms.filter(([c]) => c !== 0);
  if (Math.random() < 0.3) return { lhs: t, rhs: [] };
  let move;
  do { move = t.map(() => Math.random() < 0.45); } while (move.every(Boolean) || !move.some(Boolean));
  return { lhs: t.filter((_, i) => !move[i]), rhs: t.filter((_, i) => move[i]).map(([c, p]) => [-c, p]) };
}
const VEEL_CUE = 'Klopt. Er staan alleen machten van x. De x staat niet in een exponent en niet onder een wortel.';

function randKwadr(lvl) {
  if (lvl === 3) {
    for (;;) { const a = ri(1, 4), b = ri(-9, 9), c = ri(-9, 9); const { D } = quad(a, b, c); if (D > 0 && !nice(Math.sqrt(D)) && c) return randLayout([[a, 2], [b, 1], [c, 0]]); }
  }
  let a1, b1, a2, b2;
  do { a1 = lvl === 1 ? 1 : pick([1, 1, 2, 3]); a2 = lvl === 1 ? 1 : pick([1, 2, 3]); b1 = ri(-6, 6); b2 = ri(-6, 6); } while (b1 === 0 || b2 === 0 || a1 * b2 === a2 * b1);
  const t = [[a1 * a2, 2], [-(a1 * b2 + a2 * b1), 1], [b1 * b2, 0]];
  return lvl === 1 ? { lhs: t, rhs: [] } : randLayout(t);
}
function buildKwadr({ lhs, rhs }) {
  let P = combine(lhs, rhs), flipped = false;
  if ((P[2] || 0) < 0) { P = scaleP(P, -1); flipped = true; }
  const a = P[2] || 0, b = P[1] || 0, c = P[0] || 0;
  const { roots } = quad(a, b, c);
  const steps = [recog('veelterm', VEEL_CUE + ' De hoogste macht is x², dus het is een kwadratische vergelijking.')];
  if (rhs.length) steps.push(zeroStep(P, flipped));
  steps.push(mc('Methode', `Hoe los je \\(${ptex(P)} = 0\\) op?`, [
    opt('Met de abc-formule (of door te ontbinden)', true, 'Goed gekozen. Er staat een x², een x en een los getal. De abc-formule werkt dan altijd.'),
    opt('Door x buiten haakjes te halen', false, 'Dat lukt alleen als élke term een x heeft. Hier staat ook een los getal.'),
    opt('Door een logaritme te nemen', false, 'Een logaritme gebruik je als de x in de exponent staat. Dat is hier niet zo.'),
  ], { hint: 'Kijk of elke term een x heeft. Zo niet, dan kun je geen x buiten haakjes halen.', th: ['abc'] }));
  steps.push(discStep(a, b, c));
  steps.push(num('Oplossingen', 'Reken nu de oplossingen uit met \\(x = \\dfrac{-b \\pm \\sqrt{D}}{2a}\\). Geef ze allemaal.', roots,
    { hint: 'Reken −b + √D en −b − √D uit en deel allebei door 2a. Een breuk mag, anders rond je af op 3 decimalen.', th: ['abc'], write: [...abcXLines(a, b, c).slice(1)] }));
  return { type: 'veelterm', name: 'Kwadratische vergelijking', pts: 4, prompt: `Los algebraïsch op: \\(${eqTex(lhs, rhs)}\\)`, steps, final: [{ label: 'x', answers: roots }] };
}

function randKubisch(lvl) {
  if (lvl === 3 && Math.random() < 0.5) {
    let A, B, C; do { A = ri(2, 6); B = ri(-9, 9); C = ri(-9, 9); } while (!C || B * B - 4 * A * C <= 0 || nice(Math.sqrt(B * B - 4 * A * C)));
    return randLayout(shuffle([[A, 3], [B, 2], [C, 1]]));
  }
  let p1, q1, p2, q2;
  do { p1 = lvl === 1 ? 1 : pick([1, 2, 3, 4]); p2 = lvl === 1 ? 1 : pick([1, 2, 3, 4]); q1 = ri(-5, 5); q2 = ri(-5, 5); } while (q1 === 0 || q2 === 0);
  const t = [[p1 * p2, 3], [-(p1 * q2 + p2 * q1), 2], [q1 * q2, 1]];
  return lvl === 1 ? { lhs: t, rhs: [] } : randLayout(Math.random() < 0.5 ? t : shuffle(t));
}
function buildKubisch({ lhs, rhs }) {
  let P = combine(lhs, rhs), flipped = false;
  if ((P[3] || 0) < 0) { P = scaleP(P, -1); flipped = true; }
  const steps = [recog('veelterm', VEEL_CUE + ' Er staat een x³, dus met de abc-formule alleen kom je er niet.')];
  if (rhs.length) steps.push(zeroStep(P, flipped));
  const F = factorSteps(P);
  steps.push(...F.steps);
  steps.push(num('Oplossingen', 'Geef nu álle oplossingen van de vergelijking. Vergeet x = 0 niet!', F.sols,
    { hint: 'De oplossingen van het kwadratische deel krijg je met x = (−b ± √D) / 2a. Daar komt x = 0 nog bij.', th: ['abc'], write: F.lines }));
  return { type: 'veelterm', name: 'Derdegraads, x buiten haakjes', pts: 4, prompt: `Los algebraïsch op: \\(${eqTex(lhs, rhs)}\\)`, steps, final: [{ label: 'x', answers: F.sols }] };
}

function randMacht(lvl) {
  const [lo, e] = pick(lvl === 1 ? [[1, 2], [2, 2], [1, 3]] : [[2, 2], [1, 2], [3, 2], [4, 4], [3, 3], [2, 3], [1, 4]]);
  let A, C;
  do { A = lvl === 1 ? 1 : ri(1, 6); C = ri(-20, 20); } while (C === 0 || near(-C / A, 1) || (e % 2 === 0 && Math.random() < 0.8 && C > 0) || (lvl === 1 && !nice(Math.pow(Math.abs(C / A), 1 / e))));
  const t = [[A, lo + e], [C, lo]];
  return randLayout(Math.random() < 0.5 ? t : t.reverse());
}
function buildMacht({ lhs, rhs }) {
  let P = combine(lhs, rhs), flipped = false;
  const ks = Object.keys(P).map(Number).sort((a, b) => b - a);
  const hi = ks[0], lo = ks[1], e = hi - lo;
  if (P[hi] < 0) { P = scaleP(P, -1); flipped = true; }
  const A = P[hi], C = P[lo];
  const r = -C / A;
  const inner = poly([[A, e], [C, 0]]);
  let extra = [];
  if (e % 2 === 0) { if (r > 0) { const s = Math.pow(r, 1 / e); extra = [-s, s]; } }
  else extra = [Math.sign(r) * Math.pow(Math.abs(r), 1 / e)];
  const sols = uniqSort([0, ...extra]);
  const rootTex = e === 2 ? `\\sqrt{${tn(Math.abs(r))}}` : `\\sqrt[${e}]{${tn(Math.abs(r))}}`;
  let solveLine;
  if (e % 2 === 0) solveLine = r > 0 ? `x^{${e}} = ${tn(r)} \\;\\Rightarrow\\; x = \\pm ${rootTex} ${asFrac(extra[1]) ? '= \\pm ' + tn(extra[1]) : '\\approx \\pm ' + dec(extra[1]).replace(',', '{,}')}` : `x^{${e}} = ${tn(r)} \\;\\Rightarrow\\; \\text{geen oplossing (een even macht is nooit negatief)}`;
  else solveLine = `x^{${e}} = ${tn(r)} \\;\\Rightarrow\\; x = ${r < 0 ? '-' : ''}${rootTex} ${eqv(extra[0])}`;
  const steps = [recog('veelterm', VEEL_CUE + ' Er staan twee machten van x en verder niets.')];
  if (rhs.length) steps.push(zeroStep(P, flipped));
  steps.push(mc('Ontbinden', 'In beide termen zit een x. Wat haal je buiten haakjes?', [
    opt(M(`${pw(lo)}(${inner}) = 0`), true, `Precies. De kleinste macht is \\(${pw(lo)}\\), en die zit in beide termen.`),
    lo > 1 ? opt(M(`x(${poly([[A, hi - 1], [C, lo - 1]])}) = 0`), false, `Dat mag wel, maar je bent nog niet klaar: tussen de haakjes staat nog een x. Haal meteen de kleinste macht \\(${pw(lo)}\\) buiten haakjes.`) : null,
    opt(`Deel beide kanten door \\(${pw(lo)}\\)`, false, 'Dan raak je de oplossing x = 0 kwijt. Delen door iets dat 0 kan zijn, mag niet zomaar.'),
    opt('De abc-formule gebruiken', false, `De abc-formule werkt alleen bij ax² + bx + c = 0. Hier staat \\(${pw(hi)}\\).`),
  ], { hint: 'Zoek de kleinste macht van x die in beide termen zit.', th: ['buiten'], write: [`${pw(lo)}(${inner}) = 0`] }));
  steps.push(mc('Splitsen', 'Er staat een product dat 0 is. Wat weet je dan?', [
    opt(M(`${pw(lo)} = 0 \\;\\vee\\; ${inner} = 0`), true, 'Klopt. Een product is 0 als minstens één van de factoren 0 is.'),
    opt(M(`${inner} = 0`), false, `Je vergeet \\(${pw(lo)} = 0\\). Daar komt x = 0 uit, en dat is ook een oplossing.`),
  ], { th: ['buiten'], write: [`${pw(lo)} = 0 \\;\\vee\\; ${inner} = 0`] }));
  steps.push(num('Macht vrijmaken', `Werk \\(${inner} = 0\\) om tot \\(x^{${e}} = \\ldots\\). Welk getal komt op de puntjes?`, [r],
    { hint: `Zet het losse getal aan de andere kant en deel daarna door ${tn(A)}.`, write: [`x^{${e}} = ${tn(r)}`] }));
  steps.push(num('Oplossingen', 'Geef nu alle oplossingen voor x, en vergeet x = 0 niet. Rond af op 3 decimalen.', sols, {
    hint: e % 2 === 0 ? `Bij een even macht en een positief getal zijn er twee oplossingen: een positieve en een negatieve ${e === 2 ? 'wortel' : e + 'e-machtswortel'}.` : `Bij een oneven macht is er precies één oplossing: de ${e}e-machtswortel. Die mag negatief zijn.`,
    th: ['wortelmacht'],
    explain: e % 2 === 0 ? 'Een even macht is nooit negatief. Bij een positief getal vind je dus twee oplossingen, eentje positief en eentje negatief.' : 'Bij een oneven macht hoort precies één oplossing, ook als het getal negatief is.',
    write: [`${pw(lo)} = 0 \\;\\Rightarrow\\; x = 0`, solveLine, solsLine(sols)],
  }));
  return { type: 'veelterm', name: 'Macht buiten haakjes', pts: 4, prompt: `Los algebraïsch op: \\(${eqTex(lhs, rhs)}\\)`, steps, final: [{ label: 'x', answers: sols }] };
}

/* snijpunten van twee grafieken: f(x) = g(x) */
function randSnij(lvl) {
  for (;;) {
    if (lvl === 1 || (lvl === 2 && Math.random() < 0.3)) {
      const r1 = ri(-5, 5), r2 = ri(-5, 5), a = lvl === 1 ? 1 : pick([1, 2, -1]);
      if (!r1 || !r2 || r1 === r2) continue;
      const m = ri(-5, 5), n = ri(-8, 8);
      const P = { 2: a, 1: -a * (r1 + r2), 0: a * r1 * r2 };
      return { f: { 2: P[2], 1: P[1] + m, 0: P[0] + n }, g: { 1: m, 0: n }, ask: 'coords' };
    }
    if (lvl === 3 && Math.random() < 0.5) {
      const r1 = ri(-4, 4), r2 = ri(-4, 4); if (r1 === r2 || !r1 || !r2) continue;
      const g = { 3: pick([1, -1, 2]), 1: ri(-3, 3), 0: ri(-9, 9) };
      const f = { 4: 1, 3: -(r1 + r2) + g[3], 2: r1 * r2, 1: g[1], 0: g[0] };
      return { f, g, ask: 'coords' };
    }
    const A = pick([1, 1, 2]), r1 = ri(-4, 6), r2 = ri(-4, 6);
    if (r1 === r2 || !r1 || !r2 || (A * (r1 + r2)) % 1) continue;
    const m = ri(-6, 6), d = ri(-9, 9);
    const f = { 3: A, 2: -A * (r1 + r2), 1: A * r1 * r2 + m, 0: d };
    if (!f[1] && !f[2]) continue;
    return { f, g: { 1: m, 0: d }, ask: Math.random() < 0.15 && lvl === 3 ? 'x' : 'coords' };
  }
}
function buildSnij({ f, g, ask, ftex, gtex, xas }) {
  const F = ftex || ptex(f), G = gtex || ptex(g);
  let P = subP(f, g), flipped = false;
  if (P[maxDeg(P)] < 0) { P = scaleP(P, -1); flipped = true; }
  const steps = [recog('veelterm', xas ? 'Klopt. Snijpunten met de x-as vind je met f(x) = 0. Er staan alleen machten van x.' : 'Klopt. Snijpunten vind je door de twee formules aan elkaar gelijk te stellen. Er staan alleen machten van x.', { afgeleide: 'Er wordt gevraagd naar snijpunten, niet naar een helling of raaklijn. De afgeleide heb je hier niet nodig.' })];
  steps.push(mc('Vergelijking opstellen', 'Welke vergelijking los je op om de snijpunten te vinden?', [
    opt(M(xas ? `${F} = 0` : `${F} = ${G}`), true, xas ? 'Klopt. Op de x-as is y = 0, dus f(x) = 0.' : 'Klopt. In een snijpunt hebben beide grafieken dezelfde y-waarde. Dus f(x) = g(x).'),
    opt(M(xas ? `f'(x) = 0` : `${F} = 0`), false, xas ? 'f′(x) = 0 geeft de toppen, niet de snijpunten met de x-as.' : 'Dat geeft de snijpunten met de x-as, niet met de andere grafiek.'),
    xas ? null : opt(M(`f'(x) = g'(x)`), false, 'Dan zoek je punten waar de grafieken even steil lopen. Dat zijn geen snijpunten.'),
  ], { th: ['snijpunt'], write: [xas ? `${F} = 0` : `${F} = ${G}`] }));
  const ks = Object.keys(P).map(Number);
  if (!xas) steps.push(zeroStep(P, flipped));
  let sols, lines;
  if (P[0]) {
    const a = P[2] || 0, b = P[1] || 0, c = P[0] || 0;
    if (!a) { sols = [-c / b]; lines = [`x = ${tn(-c / b)}`]; steps.push(num('Oplossen', 'Los deze lineaire vergelijking op. Wat is x?', sols, { write: lines })); }
    else {
      sols = quad(a, b, c).roots;
      steps.push(discStep(a, b, c));
      lines = abcXLines(a, b, c).slice(1);
      steps.push(num('Oplossingen', 'Reken de x-waarden uit met de abc-formule. Geef ze allemaal.', sols, { th: ['abc'], write: lines }));
    }
  } else {
    const Fs = factorSteps(P);
    steps.push(...Fs.steps);
    sols = Fs.sols;
    steps.push(num('Oplossingen', 'Geef nu álle x-waarden, x = 0 hoort er ook bij.', sols, { th: ['abc'], write: Fs.lines }));
  }
  const final = [{ label: 'x', answers: sols }];
  if (ask === 'coords' && !xas) {
    const ys = sols.map(x => evalP(g, x));
    steps.push(num('y-coördinaten', `Bereken nu bij elke x de y-waarde. Vul de x-waarden in de makkelijkste formule in, hier \\(${G}\\).`, ys, {
      hint: 'Beide formules geven in een snijpunt dezelfde y. Kies dus de formule die het minst rekenwerk is.', write: [`\\text{Snijpunt${sols.length > 1 ? 'en' : ''}: } ${ptsTex(sols, ys)}`],
    }));
    final.push({ label: 'y', answers: ys });
  }
  const prompt = xas
    ? `De functie \\(f\\) wordt gegeven door \\(f(x) = ${F}\\). Bereken algebraïsch de x-coördinaten van de snijpunten van de grafiek van \\(f\\) met de x-as.`
    : `Gegeven zijn \\(f(x) = ${F}\\) en \\(g(x) = ${G}\\). Bereken algebraïsch ${ask === 'coords' ? 'de coördinaten' : 'de x-coördinaten'} van de snijpunten van de grafieken van \\(f\\) en \\(g\\).`;
  return { type: 'veelterm', name: xas ? 'Snijpunten met de x-as' : 'Snijpunten van twee grafieken', pts: 5, prompt, steps, final };
}

/* ---------- 2. exponentiële en log-vergelijkingen ---------- */
const EXPO_CUE = 'Klopt. De x staat in de exponent, het kleine getal rechtsboven. Dat is een exponentiële vergelijking.';
function logMethodStep(g, R, s = 0) {
  const X = s ? `x${sgnNum(s)}` : 'x';
  return mc('Methode', `Hoe los je \\(${tn(g)}^{${X}} = ${tn(R)}\\) op?`, [
    opt(M(`${X} = {}^{${tn(g)}}\\log(${tn(R)})`), true, 'Precies. De logaritme beantwoordt de vraag: tot welke macht moet je het grondtal doen om dit getal te krijgen?'),
    opt(M(`${X} = ${tn(R)} : ${tn(g)}`), false, `Delen haalt de exponent niet weg. \\(${tn(g)}^x\\) is iets heel anders dan \\(${tn(g)} \\cdot x\\).`),
    opt(M(`${X} = \\sqrt{${tn(R)}}`), false, 'Een wortel gebruik je als x het grondtal is, zoals bij x² = …. Hier staat x in de exponent.'),
  ], { hint: 'Als gˣ = getal, dan is x = ᵍlog(getal).', th: ['log'], write: [`${X} = {}^{${tn(g)}}\\log(${tn(R)})`] });
}
function logCalcStep(g, R, dp, s = 0) {
  const x = Math.log(R) / Math.log(g) - s;
  return num('Uitrekenen', `Reken x uit en rond af op ${dp} decimalen. Je rekenmachine heeft alleen log, dus gebruik \\({}^{g}\\log(a) = \\dfrac{\\log(a)}{\\log(g)}\\).${s ? ` Vergeet daarna niet die ${tn(s)} aan de andere kant te zetten.` : ''}`, [x], {
    dp, hint: `Typ log(${plain(R)}) ÷ log(${plain(g)})${s ? `, en ${s > 0 ? 'trek daar ' + plain(s) + ' van af' : 'tel daar ' + plain(-s) + ' bij op'}` : ''}.`, th: ['log'],
    write: [`${s ? `x${sgnNum(s)}` : 'x'} = \\dfrac{\\log(${tn(R)})}{\\log(${tn(g)})}${s ? '' : ` ${eqv(x, dp)}`}`, ...(s ? [`x ${eqv(x, dp)}`] : [])],
  });
}
function randE1(lvl) {
  const b = pick([2, 3, 4, 5, 6, 7]);
  let R; do { R = ri(2, 40); } while (R === b || (Math.abs(Math.log(R) / Math.log(b) - Math.round(Math.log(R) / Math.log(b))) < 1e-9 && Math.random() < 0.8));
  if (lvl === 1) return { a: 1, b, c: 0, d: R };
  const a = pick([1, 2, 3, 4, 5]), c = pick([0, ri(-30, -1), ri(1, 30)]);
  if (lvl === 3) { const cc = c || ri(5, 30); return { a, b, c: cc, d: a * R + cc, s: pick([1, 2, -1, 3]), dp: pick([2, 3, 4]) }; }
  return { a, b, c, d: a * R + c };
}
function buildE1({ a, b, c, d, s = 0, dp = 3 }) {
  const R = (d - c) / a;
  const E = s ? `x${sgnNum(s)}` : 'x';
  const lhs = `${coefDot(a)}${b}^{${E}}${c ? sgnNum(c) : ''}`;
  const w = [];
  if (c) w.push(`${coefDot(a)}${b}^{${E}} = ${tn(d - c)}`);
  w.push(`${b}^{${E}} = ${tn(R)}`);
  const steps = [
    recog('expo', EXPO_CUE),
    num('Macht vrijmaken', `Werk toe naar \\(${b}^{${E}} = \\ldots\\). Welk getal komt er rechts te staan?`, [R], {
      hint: c ? `Zet eerst ${tn(c)} aan de andere kant${a !== 1 ? `, en deel daarna door ${a}` : ''}.` : `Deel beide kanten door ${a}.`,
      explain: 'Zet de macht eerst helemaal alleen. Pas daarna gebruik je de logaritme.', write: w,
    }),
    logMethodStep(b, R, s),
    logCalcStep(b, R, dp, s),
  ];
  const x = Math.log(R) / Math.log(b) - s;
  return { type: 'expo', name: 'Eén macht vrijmaken', pts: 4, prompt: `Los algebraïsch op: \\(${lhs} = ${d}\\)${dp !== 3 ? `. Rond af op ${dp} decimalen.` : ''}`, steps, final: [{ label: 'x', answers: [x], dp }] };
}
function randE2(lvl) {
  const b = pick([2, 3, 4, 5, 6]); const a = ri(1, lvl === 1 ? 3 : 6); const k = ri(2, lvl === 1 ? 4 : 9); let R; do { R = ri(2, 9); } while (R === b);
  return { a, b, c: k * R, d: a + k };
}
function buildE2({ a, b, c, d, dp = 3 }) {
  const k = d - a, R = c / k;
  const steps = [
    recog('expo', EXPO_CUE + ' Hij staat er zelfs twee keer, met hetzelfde grondtal.'),
    num('Termen samennemen', `Zet alle \\(${b}^x\\)-termen aan één kant. Dan krijg je \\(\\ldots \\cdot ${b}^x = ${c}\\). Welk getal staat op de puntjes?`, [k], {
      hint: `${d} · ${b}ˣ − ${a} · ${b}ˣ = (${d} − ${a}) · ${b}ˣ. Net als 10 appels − 3 appels = 7 appels.`, th: ['macht'],
      write: [`${c} = ${d} \\cdot ${b}^{x} - ${a === 1 ? '' : a + ' \\cdot '}${b}^{x}`, `${c} = ${k} \\cdot ${b}^{x}`],
    }),
    num('Macht vrijmaken', `Deel door ${k}. Hoeveel is \\(${b}^x\\)?`, [R], { hint: `Reken ${c} ÷ ${k} uit.`, write: [`${b}^{x} = ${tn(R)}`] }),
    logMethodStep(b, R),
    logCalcStep(b, R, dp),
  ];
  return { type: 'expo', name: 'Gelijke machten samennemen', pts: 4, prompt: `Los algebraïsch op: \\(${coefDot(a)}${b}^{x} + ${c} = ${d} \\cdot ${b}^{x}\\)`, steps, final: [{ label: 'x', answers: [Math.log(R) / Math.log(b)], dp }] };
}
function randE3(lvl) {
  let p, q, a, c;
  do {
    p = pick([2, 3, 4, 5, 6, 7, 8, 10, 12]); q = pick([2, 3, 4, 5, 6, 7, 9, 12]);
    a = lvl === 1 ? 1 : ri(1, 12); c = ri(1, 12);
    if (lvl === 3 && Math.random() < 0.4) c = pick([1 / 2, 1 / 3, 1 / 4]);
  } while (p === q || a === c || (Math.max(p, q) % Math.min(p, q) === 0 && Math.random() < 0.5));
  return { a, p, c, q, dp: lvl === 3 ? pick([2, 4]) : pick([3, 3, 3, 2, 4]) };
}
function buildE3({ a, p, c, q, dp = 3 }) {
  const big = p > q;
  const gn = big ? p : q, gd = big ? q : p;
  const g = gn / gd, rhs = big ? c / a : a / c;
  const gg = gcd(gn, gd);
  const divTex = big ? `${coefDot(a)}${q}^x` : `${coefDot(c)}${p}^x`;
  const x = Math.log(rhs) / Math.log(g);
  const steps = [
    recog('expo', EXPO_CUE + ' Er staan twee verschillende grondtallen, allebei met exponent x.'),
    mc('Eén macht maken', 'Hoe krijg je alles met x bij elkaar in één macht?', [
      opt(`Deel beide kanten door \\(${divTex}\\)`, true, `Slim. Dan krijg je een breuk van twee machten met dezelfde exponent: \\(\\dfrac{${gn}^x}{${gd}^x} = \\left(\\dfrac{${gn}}{${gd}}\\right)^x\\).`),
      opt(`Trek \\(${coefDot(a)}${p}^x\\) aan beide kanten af`, false, 'Dan staat er 0 = … en ben je nog niets verder. De grondtallen blijven verschillend.'),
      opt(`Vermenigvuldig de grondtallen: \\(${p * q}^x\\)`, false, 'Machten met verschillende grondtallen mag je niet zomaar samenvoegen. Dat mag alleen bij vermenigvuldigen of delen van machten met dezelfde exponent, zoals aˣ · bˣ = (ab)ˣ, en dat staat hier niet.'),
    ], { hint: 'Gebruik de regel aˣ / bˣ = (a/b)ˣ. Zorg dat de twee machten samen in één breuk komen.', th: ['macht'], write: [`\\dfrac{${gn}^x}{${gd}^x} = \\dfrac{${tn(big ? c : a)}}{${tn(big ? a : c)}}`] }),
    num('Nieuw grondtal', `Je krijgt \\(\\left(\\frac{${gn}}{${gd}}\\right)^x = \\ldots\\). Wat is het grondtal \\(\\frac{${gn}}{${gd}}\\) als vereenvoudigde breuk of getal?`, [g], {
      hint: gg > 1 ? `Deel teller en noemer allebei door ${gg}.` : 'Deze breuk kun je niet verder vereenvoudigen.',
    }),
    num('Rechterkant', 'En welk getal staat er rechts van het is-teken? Een breuk mag.', [rhs], {
      hint: `Het getal dat bij ${big ? q : p}ˣ stond, gedeeld door het getal dat bij ${big ? p : q}ˣ stond.`,
      write: [`\\left(${tn(g)}\\right)^x = ${tn(rhs)}`],
    }),
    num('Uitrekenen', `Reken \\(x = {}^{${tn(g)}}\\log(${tn(rhs)})\\) uit en rond af op ${dp} decimalen.`, [x], {
      dp, hint: `Typ log(${plain(rhs)}) ÷ log(${plain(g)}).`, th: ['log'],
      write: [`x = {}^{${tn(g)}}\\log(${tn(rhs)}) = \\dfrac{\\log(${tn(rhs)})}{\\log(${tn(g)})} ${eqv(x, dp)}`],
    }),
  ];
  return { type: 'expo', name: 'Twee grondtallen', pts: 4, prompt: `Los algebraïsch op: \\(${coefDot(a)}${p}^{x} = ${coefDot(c)}${q}^{x}\\)${dp !== 3 ? `. Rond af op ${dp} decimalen.` : ''}`, steps, final: [{ label: 'x', answers: [x], dp }] };
}
function randE4(lvl) {
  for (;;) {
    const g = pick([2, 3]);
    const ms = g === 2 ? [1, 2, 3, 4, 5] : [1, 2, 3];
    const m = pick(ms), n = pick(ms);
    if (m === n || (m === 1 && n === 1)) continue;
    const u = lvl === 1 ? 0 : pick([0, 0, 0, 1, 2]), v = lvl === 1 ? 0 : pick([0, 0, 0, 1, 2]);
    const a = pick([0, 0, 1, -1, 2, -2]), b = pick([0, 0, 1, -1, 2, -2]);
    const x = ((v + n * b) - (u + m * a)) / (m - n);
    if (near(x, 0) || Math.abs(x) > 10) continue;
    return { g, u, m, a, v, n, b, zero: lvl === 3 && Math.random() < 0.5 };
  }
}
function buildE4({ g, u, m, a, v, n, b, zero }) {
  const c1 = g ** u, p = g ** m, c2 = g ** v, q = g ** n;
  const side = (c, base, off) => `${coefDot(c)}${base}^{${poly([[1, 1], [off, 0]])}}`;
  const L = side(c1, p, a), R = side(c2, q, b);
  const eq = zero ? `${L} - ${R} = 0` : `${L} = ${R}`;
  const eL = poly([[m, 1], [u + m * a, 0]]), eR = poly([[n, 1], [v + n * b, 0]]);
  const x = ((v + n * b) - (u + m * a)) / (m - n);
  const nums = [...new Set([c1, p, c2, q].filter(z => z > 1))];
  const cand = [
    [poly([[m, 1], [u + a, 0]]), poly([[n, 1], [v + b, 0]]), `Pas op: \\((${g}^{${m}})^{x + a} = ${g}^{${m}(x + a)}\\). De hele exponent gaat keer ${m}, ook het losse getal.`],
    [poly([[m, 1], [m * a, 0]]), poly([[n, 1], [n * b, 0]]), `Je bent het getal vóór de macht vergeten. Schrijf dat ook als macht van ${g} en tel de exponenten op: \\(${g}^u \\cdot ${g}^k = ${g}^{u+k}\\).`],
    [poly([[1, 1], [u + a, 0]]), poly([[1, 1], [v + b, 0]]), `Als je ${p} schrijft als \\(${g}^{${m}}\\), wordt \\(${p}^x = (${g}^{${m}})^x = ${g}^{${m}x}\\). De exponent gaat dus keer ${m}.`],
    [poly([[n, 1], [u + n * a, 0]]), poly([[m, 1], [v + m * b, 0]]), 'De exponenten zijn verwisseld. Kijk per kant welke macht van het grondtal er staat.'],
  ].filter(([l, r]) => !(l === eL && r === eR));
  const seen = new Set(); const wr = [];
  cand.forEach(([l, r, why]) => { const k = l + '|' + r; if (!seen.has(k) && wr.length < 2) { seen.add(k); wr.push(opt(M(`${g}^{${l}} = ${g}^{${r}}`), false, why)); } });
  const rew = [];
  if (zero) rew.push(`${L} = ${R}`);
  rew.push(`${c1 > 1 ? `${g}^{${u}} \\cdot ` : ''}(${g}^{${m}})^{${poly([[1, 1], [a, 0]])}} = ${c2 > 1 ? `${g}^{${v}} \\cdot ` : ''}(${g}^{${n}})^{${poly([[1, 1], [b, 0]])}}`);
  rew.push(`${g}^{${eL}} = ${g}^{${eR}}`);
  const steps = [
    recog('expo', EXPO_CUE + ' Kijk ook naar de getallen: het zijn allemaal machten van hetzelfde grondtal.'),
    mc('Grondtal kiezen', `De getallen ${nums.join(', ')} zijn allemaal machten van hetzelfde getal. Van welk getal?`, [2, 3, 5, 10].map(k => opt(M(String(k)), k === g, k === g ? `Klopt: ${nums.map(z => `\\(${z} = ${g}^{${Math.round(Math.log(z) / Math.log(g))}}\\)`).join(', ')}.` : `${nums.find(z => Math.round(Math.log(z) / Math.log(k)) !== Math.log(z) / Math.log(k)) || nums[0]} is geen macht van ${k}.`)), {
      keepOrder: true, hint: `Probeer het eens: is ${Math.max(...nums)} gelijk aan 2 · 2 · …, of aan 3 · 3 · …?`, th: ['macht'], write: nums.map(z => `${z} = ${g}^{${Math.round(Math.log(z) / Math.log(g))}}`),
    }),
    mc('Herschrijven', `Schrijf beide kanten als één macht van ${g}. Welke klopt?`, [
      opt(M(`${g}^{${eL}} = ${g}^{${eR}}`), true, 'Helemaal goed. Je hebt twee machtsregels gebruikt: \\((g^m)^k = g^{m \\cdot k}\\) en \\(g^u \\cdot g^k = g^{u+k}\\).'),
      ...wr,
    ], { hint: 'Twee regels helpen je: (gᵐ)ᵏ = gᵐ·ᵏ, en gᵘ · gᵏ = gᵘ⁺ᵏ.', th: ['macht'], write: rew }),
    num('Exponenten gelijkstellen', `Als \\(${g}^{A} = ${g}^{B}\\), dan is \\(A = B\\). Los dus op: \\(${eL} = ${eR}\\). Wat is x?`, [x], {
      hint: 'Zet alle x-en aan één kant en de losse getallen aan de andere kant.',
      write: [`${eL} = ${eR}`, `x = ${tn(x)}`],
    }),
  ];
  return { type: 'expo', name: 'Zelfde grondtal', pts: 4, prompt: `Los algebraïsch op: \\(${eq}\\)`, steps, final: [{ label: 'x', answers: [x] }] };
}
/* a + b·log(cx) = d */
function randLg(lvl) {
  for (;;) {
    const a = lvl === 1 ? 0 : ri(-5, 9), b = lvl === 1 ? 1 : pick([1, 2, 3, 4, 5]), e = pick(lvl === 1 ? [1, 2] : [1, 2, 3]), c = pick([1, 2, 4, 5, 10, 20]);
    const x = Math.pow(10, e) / c;
    if (!nice(x)) continue;
    return { a, b, c, d: a + b * e };
  }
}
function buildLg({ a, b, c, d }) {
  const e = (d - a) / b, x = Math.pow(10, e) / c;
  const lhs = `${a ? a + ' + ' : ''}${b === 1 ? '' : b + ' \\cdot '}\\log(${c === 1 ? '' : c}x)`;
  const steps = [
    recog('expo', 'Klopt. Hier staat de x in een logaritme. Die los je op dezelfde manier op: eerst de log alleen zetten.'),
    num('Log vrijmaken', `Werk toe naar \\(\\log(${c === 1 ? '' : c}x) = \\ldots\\). Welk getal komt er rechts?`, [e], {
      hint: a ? `Zet eerst ${a} aan de andere kant en deel daarna door ${b}.` : `Deel beide kanten door ${b}.`,
      write: [...(a ? [`${b === 1 ? '' : b + ' \\cdot '}\\log(${c === 1 ? '' : c}x) = ${tn(d - a)}`] : []), `\\log(${c === 1 ? '' : c}x) = ${tn(e)}`],
    }),
    mc('Log weghalen', `Wat volgt uit \\(\\log(${c === 1 ? '' : c}x) = ${tn(e)}\\)?`, [
      opt(M(`${c === 1 ? '' : c}x = 10^{${tn(e)}}`), true, 'Precies. Gewone log is log met grondtal 10. Dus log(a) = b betekent a = 10ᵇ.'),
      opt(M(`${c === 1 ? '' : c}x = ${tn(e)}`), false, 'De log mag je niet zomaar wegstrepen. Gebruik de definitie: log(a) = b betekent a = 10ᵇ.'),
      opt(M(`${c === 1 ? '' : c}x = e^{${tn(e)}}`), false, 'e hoort bij ln. Bij de gewone log is het grondtal 10.'),
    ], { th: ['log'], write: [`${c === 1 ? '' : c}x = 10^{${tn(e)}} = ${tn(Math.pow(10, e))}`] }),
    num('Uitrekenen', 'Wat is x?', [x], { hint: `Reken 10^${plain(e)} uit en deel door ${c}.`, write: [`x = ${tn(x)}`] }),
  ];
  return { type: 'expo', name: 'Log-vergelijking', pts: 5, prompt: `De functie \\(h\\) wordt gegeven door \\(h(x) = ${lhs}\\). Bereken algebraïsch de waarde van \\(x\\) waarvoor \\(h(x) = ${d}\\).`, steps, final: [{ label: 'x', answers: [x] }] };
}

/* ---------- 3. wortelvergelijkingen ---------- */
function randWortel(lvl) {
  for (;;) {
    const m = lvl === 1 ? pick([1, 2]) : lvl === 3 ? pick([0.5, -1, -2, 2]) : pick([0.5, 1, 1, 2, 2, -1, -2]), c = ri(-8, 8);
    if (c === 0) continue;
    const half = lvl > 1 && Number.isInteger(m) && Math.random() < 0.2;
    const x1 = half ? ri(-6, 20) / 2 : ri(-3, 10), x2 = half ? ri(-6, 20) / 2 : ri(-3, 10);
    if (near(x1, x2)) continue;
    const a = 2 * m * c + m * m * (x1 + x2), b = c * c - m * m * x1 * x2;
    if (!Number.isInteger(a) || !Number.isInteger(b) || a === 0 || Math.abs(a) > 20 || Math.abs(b) > 40) continue;
    const valid = [x1, x2].filter(x => m * x + c >= 0);
    if (!valid.length) continue;
    if (valid.length === 2 && Math.random() < 0.45) continue;
    return { a, b, m, c, ask: lvl === 1 ? 'solve' : pick(['solve', 'coords', 'coords']) };
  }
}
function buildWortel({ a, b, m, c, ask }) {
  const inner = poly([[a, 1], [b, 0]]), lin = poly([[m, 1], [c, 0]]);
  const A2 = m * m, B2 = 2 * m * c - a, C2 = c * c - b;
  const N = intNorm([A2, B2, C2]);
  const { roots } = quad(N[0], N[1], N[2]);
  const valid = roots.filter(x => m * x + c >= -1e-9);
  const ys = valid.map(x => m * x + c);
  const Qtex = ptex({ 2: A2, 1: B2, 0: C2 }), Ntex = poly([[N[0], 2], [N[1], 1], [N[2], 0]]);
  const sq = poly([[m * m, 2], [2 * m * c, 1], [c * c, 0]]);
  const steps = [];
  if (ask === 'coords') {
    steps.push(recog('wortel', 'Klopt. Voor snijpunten stel je de twee formules aan elkaar gelijk. Dan staat er een x onder de wortel.', { afgeleide: 'Er wordt gevraagd naar snijpunten, niet naar een helling of raaklijn. De afgeleide heb je hier niet nodig.' }));
    steps.push(mc('Vergelijking opstellen', 'Welke vergelijking los je op om de snijpunten te vinden?', [
      opt(M(`\\sqrt{${inner}} = ${lin}`), true, 'Klopt. In een snijpunt hebben grafiek en lijn dezelfde y. Dus f(x) = lijn.'),
      opt(M(`\\sqrt{${inner}} = 0`), false, 'Dat geeft het snijpunt met de x-as, niet met de lijn.'),
      opt(M(`f'(x) = ${tn(m)}`), false, 'Dan zoek je de punten waar de grafiek even steil loopt als de lijn. Dat zijn geen snijpunten.'),
    ], { th: ['snijpunt'], write: [`\\sqrt{${inner}} = ${lin}`] }));
  } else steps.push(recog('wortel', 'Klopt. De x staat onder het wortelteken.'));
  steps.push(mc('Kwadrateren', 'Hoe werk je de wortel weg?', [
    opt(M(`${inner} = (${lin})^2`), true, 'Goed. Je kwadrateert beide kanten. Zet de hele rechterkant wel tussen haakjes!'),
    opt(M(`${inner} = ${poly([[m * m, 2], [c * c, 0]])}`), false, 'Hier ontbreekt het dubbele product. (a + b)² = a² + 2ab + b², en niet a² + b².'),
    opt(M(`\\sqrt{${inner}} = (${lin})^2`), false, 'Je moet beide kanten kwadrateren, ook de linkerkant. Dan verdwijnt het wortelteken.'),
  ], { hint: 'Wat je links doet, doe je ook rechts. Het kwadraat van een wortel is gewoon wat eronder staat.', th: ['kwadraat'], write: [`${inner} = (${lin})^2`] }));
  const wB = ptex({ 2: A2, 1: -2 * m * c - a, 0: C2 }), wC = ptex({ 2: A2, 1: -a, 0: C2 });
  const zl = [`${inner} = ${sq}`, `${Qtex} = 0`];
  if (Ntex !== Qtex) zl.push(`${Ntex} = 0 \\quad (\\text{alles ${N[0] / A2 > 1 ? `keer ${tn(N[0] / A2)}` : `gedeeld door ${tn(A2 / N[0])}`}})`);
  steps.push(mc('Haakjes uitwerken', 'Werk de haakjes uit en zet alles op nul. Welke vergelijking krijg je?', [
    opt(M(`${Qtex} = 0`), true, `Klopt: \\((${lin})^2 = ${sq}\\), en daarna alles naar één kant.`),
    opt(M(`${wB} = 0`), false, `Kijk nog even naar het teken van \\(${tn(a)}x\\) als je die naar de andere kant zet.`),
    opt(M(`${wC} = 0`), false, 'Hier ontbreekt de middelste term van het kwadraat. (a + b)² = a² + 2ab + b².'),
    opt(M(`${ptex({ 2: A2, 1: B2, 0: -C2 })} = 0`), false, `Kijk nog even naar het losse getal: \\(${tn(c * c)}\\) uit het kwadraat en \\(${tn(b)}\\) van links, met het goede teken.`),
  ], { hint: `\\((${lin})^2 = ${sq}\\). Zet daarna \\(${inner}\\) aan dezelfde kant.`, th: ['kwadraat', 'nul'], write: zl }));
  steps.push(num('Oplossen', `Los \\(${Ntex} = 0\\) op. Geef beide oplossingen.`, roots, {
    hint: 'Gebruik de abc-formule, of ontbind in factoren als je twee getallen ziet die passen.', th: ['abc'], write: [...abcXLines(N[0], N[1], N[2]).slice(1)],
  }));
  const checkLines = roots.map(x => {
    const s = Math.sqrt(Math.max(0, a * x + b)), t = m * x + c, ok = t >= -1e-9;
    return `x = ${tn(x)}: \\ \\sqrt{${tn(a * x + b)}} = ${tn(s)},\\ \\ ${tn(m)} \\cdot ${tnp(x)} ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${tn(t)} \\;\\Rightarrow\\; \\text{${ok ? 'voldoet' : 'voldoet niet'}}`;
  }).map(l => l.replace(/^x = (.*?)1 \\cdot /, 'x = $1'));
  const optsCheck = roots.length === 2 ? [
    ['Allebei', valid.length === 2],
    [`Alleen \\(x = ${tn(roots[0])}\\)`, valid.length === 1 && near(valid[0], roots[0])],
    [`Alleen \\(x = ${tn(roots[1])}\\)`, valid.length === 1 && near(valid[0], roots[1])],
  ] : [['Ja, die voldoet', valid.length === 1], ['Nee, die voldoet niet', valid.length === 0]];
  const reason = 'Een wortel is nooit negatief. Wordt de rechterkant negatief, dan klopt de vergelijking niet, ook al klopte de gekwadrateerde versie wel.';
  steps.push(mc('Controleren', 'Bij kwadrateren kan er een oplossing bij komen die niet klopt. Vul daarom elke oplossing in de oorspronkelijke vergelijking in. Welke klopt echt?',
    optsCheck.map(([h, ok]) => opt(h, ok, ok ? reason : 'Vul het echt even in: reken links de wortel uit en rechts de lijn. Komt er hetzelfde uit?')),
    { keepOrder: true, hint: 'Reken voor elke x links √(…) uit en rechts de lijn. Is de rechterkant negatief? Dan klopt hij niet.', th: ['kwadraat'], write: checkLines }));
  const final = [{ label: 'x', answers: valid }];
  if (ask === 'coords') {
    steps.push(num('y-coördinaten', 'Bereken de y-coördinaat van elk snijpunt dat klopt. Met de lijn is dat het makkelijkst.', ys, {
      hint: `Vul x in de lijn \\(y = ${lin}\\) in.`, write: [`\\text{Snijpunt${valid.length > 1 ? 'en' : ''}: } ${ptsTex(valid, ys)}`],
    }));
    final.push({ label: 'y', answers: ys });
  } else steps[steps.length - 1].write.push(solsLine(valid));
  const prompt = ask === 'coords'
    ? `Gegeven zijn \\(f(x) = \\sqrt{${inner}}\\) en de lijn \\(y = ${lin}\\). Bereken algebraïsch de coördinaten van de snijpunten van de grafiek van \\(f\\) en de lijn.`
    : `Los algebraïsch op: \\(\\sqrt{${inner}} = ${lin}\\)`;
  return { type: 'wortel', name: ask === 'coords' ? 'Snijpunten wortel en lijn' : 'Wortelvergelijking', pts: 5, prompt, steps, final };
}

/* ---------- 4. afgeleide ---------- */
const AFG_OVER = { veelterm: 'De functie is wel een veelterm, maar de vraag gaat over een helling, raaklijn of top. Daarvoor heb je de afgeleide nodig.', wortel: 'Er staat wel een wortel, maar de vraag gaat over de helling. Daarvoor heb je de afgeleide nodig.', expo: 'Er staat wel een e-macht, maar de vraag gaat over de helling. Daarvoor heb je de afgeleide nodig.' };

function randHor(lvl) {
  for (;;) {
    if (lvl === 1 || (lvl === 2 && Math.random() < 0.55)) {
      const A = lvl === 1 ? 1 : pick([1, 1, 2, -1, 3]), r1 = ri(-4, 5), r2 = ri(-4, 5);
      if (r1 === r2 || (A * (r1 + r2)) % 2) continue;
      return { f: { 3: A, 2: -3 * A * (r1 + r2) / 2, 1: 3 * A * r1 * r2, 0: ri(-9, 9) }, ask: lvl === 1 ? 'x' : pick(['x', 'coords']) };
    }
    const A = pick([1, 1, 2, 3]), r1 = pick([-3, -2, -1, 1, 2, 3, 0.5, -0.5]), r2 = pick([-3, -2, -1, 1, 2, 3, 0.5, -0.5]);
    const B = -4 * A * (r1 + r2) / 3, C = 2 * A * r1 * r2;
    if (near(r1, r2) || !Number.isInteger(B) || !Number.isInteger(C)) continue;
    return { f: { 4: A, 3: B, 2: C, 0: ri(-9, 9) }, ask: pick(['x', 'coords']) };
  }
}
function buildHor({ f, ask, ftex }) {
  const d = deriv(f), deg = maxDeg(f);
  const steps = [recog('afgeleide', 'Klopt. Een horizontale raaklijn heeft helling 0, en de helling vind je met de afgeleide.', AFG_OVER)];
  steps.push(mc('Vertalen', 'Welke vergelijking moet je oplossen?', [
    opt(M("f'(x) = 0"), true, 'Precies. Horizontaal betekent helling 0, en de helling in een punt is f′(x).'),
    opt(M('f(x) = 0'), false, 'Dat geeft de nulpunten: waar de grafiek de x-as snijdt. Niet waar de raaklijn horizontaal loopt.'),
    opt(M("f'(x) = 1"), false, 'Helling 1 is schuin omhoog. Horizontaal is helling 0.'),
  ], { th: ['helling'], write: ["f'(x) = 0"] }));
  if (ftex) steps.push(mc('Haakjes wegwerken', 'De functie staat als product. Wat is een handige eerste stap?', [
    opt(`Haakjes uitwerken: \\(f(x) = ${ptex(f)}\\)`, true, 'Goed. Dan kun je daarna gewoon de machtsregel gebruiken. (De productregel kan ook, maar is meer werk.)'),
    opt('Elke factor apart differentiëren en vermenigvuldigen', false, 'Dat mag niet. De afgeleide van een product is niet het product van de afgeleiden.'),
  ], { th: ['afgeleide'], write: [`f(x) = ${ptex(f)}`] }));
  steps.push(mc('Afgeleide', 'Wat is de afgeleide van f?', derivOpts(f), { hint: 'Machtsregel: \\(a x^n\\) wordt \\(n \\cdot a\\, x^{n-1}\\). Een los getal valt weg.', th: ['afgeleide'], write: [`f'(x) = ${ptex(d)}`] }));
  let sols;
  if (deg === 4) {
    const F = factorSteps(d);
    steps.push(...F.steps);
    sols = F.sols;
    steps.push(num('Oplossen', 'Geef alle x-waarden. x = 0 hoort er ook bij.', sols, { th: ['abc'], write: F.lines }));
  } else {
    const A = d[2] || 0, B = d[1] || 0, C = d[0] || 0;
    let g = [A, B, C].reduce((s, v) => gcd(s, v), 0) || 1; if (A < 0) g = -g;
    const [a2, b2, c2] = [A / g, B / g, C / g];
    sols = quad(A, B, C).roots;
    const w = [`${ptex(d)} = 0`];
    if (g !== 1) w.push(`${poly([[a2, 2], [b2, 1], [c2, 0]])} = 0 \\quad (\\text{gedeeld door } ${g})`);
    w.push(...abcXLines(a2, b2, c2).slice(1), solsLine(sols));
    steps.push(num('Oplossen', `Los \\(${ptex(d)} = 0\\) op. Geef alle x-waarden.`, sols, {
      hint: g !== 1 ? `Deel eerst alles door ${g}, dan rekent het makkelijker. Daarna de abc-formule of ontbinden.` : 'Gebruik de abc-formule of ontbind in factoren.', th: ['abc'], write: w,
    }));
  }
  const final = [{ label: 'x', answers: sols }];
  if (ask === 'coords') {
    const ys = sols.map(x => evalP(f, x));
    steps.push(num('y-coördinaten', 'Bereken nu de bijbehorende y-waarden. Vul de x-waarden in f(x) in, niet in f′(x).', ys, {
      hint: 'Een veelgemaakte fout is invullen in f′. Daar komt natuurlijk 0 uit. Je wilt de hoogte van de grafiek, dus f(x).',
      write: [...sols.map((x, i) => `f(${tn(x)}) = ${tn(ys[i])}`), `\\text{Punten: } ${sols.map((x, i) => `(${tn(x)},\\, ${tn(ys[i])})`).join(',\\ ')}`],
    }));
    final.push({ label: 'y', answers: ys });
  }
  const q = ask === 'coords' ? 'de coördinaten van de punten' : 'de x-coördinaten van de punten';
  return { type: 'afgeleide', name: 'Horizontale raaklijn', pts: 5, prompt: `De functie \\(f\\) wordt gegeven door \\(f(x) = ${ftex || ptex(f)}\\). Bereken algebraïsch ${q} op de grafiek van \\(f\\) waar de raaklijn horizontaal loopt.`, steps, final };
}

/* minimale waarde van een vierdegraads functie */
function randMin(lvl) {
  for (;;) {
    const a = lvl === 1 ? 1 : pick([1, 1, 2, 3]);
    const r1 = lvl === 1 ? ri(-4, 5) : pick([-4, -3, -2, -1, 1, 2, 3, 4, 5, 0.5, 1.5, 2.5]), r2 = lvl === 1 ? ri(-4, 5) : pick([-3, -2, -1, 1, 2, 3, 4, 0.5, 1.5]);
    if (!r1 || !r2 || (lvl < 3 && near(r1, r2))) continue;
    const b = -4 * a * (r1 + r2) / 3, c = 2 * a * r1 * r2;
    if (!Number.isInteger(b) || !Number.isInteger(c) || Math.abs(b) > 40 || Math.abs(c) > 60) continue;
    const e = ri(-20, 20);
    const f = { 4: a, 3: b, 2: c, 0: e };
    const vals = uniqSort([0, r1, r2]).map(x => evalP(f, x));
    if (uniqSort(vals).length < vals.length) continue;
    return { f };
  }
}
function buildMin({ f }) {
  const d = deriv(f);
  const F = factorSteps(d);
  const xs = F.sols, vals = xs.map(x => evalP(f, x)), mn = Math.min(...vals);
  const steps = [recog('afgeleide', 'Klopt. De minimale waarde is de laagste y-waarde van de grafiek. Die zit in een top, en toppen vind je met de afgeleide.', AFG_OVER)];
  steps.push(mc('Aanpak', 'Hoe vind je de minimale waarde van f?', [
    opt("Los f′(x) = 0 op, reken bij elke x de waarde f(x) uit en kies de kleinste", true, 'Precies. De minimale waarde is een y-waarde. Je zoekt eerst waar de toppen liggen en kijkt dan hoe hoog ze zijn.'),
    opt("Los f′(x) = 0 op; de x die je vindt is het antwoord", false, 'Bijna, maar de vraag is de minimale waarde. Dat is een y-waarde, dus f(x), geen x.'),
    opt('Los f(x) = 0 op', false, 'f(x) = 0 geeft de snijpunten met de x-as. Het laagste punt vind je met f′(x) = 0.'),
  ], { th: ['extreem'], write: ["f'(x) = 0"] }));
  steps.push(mc('Afgeleide', 'Wat is de afgeleide van f?', derivOpts(f), { hint: 'Machtsregel: \\(a x^n\\) wordt \\(n \\cdot a\\, x^{n-1}\\). Een los getal valt weg.', th: ['afgeleide'], write: [`f'(x) = ${ptex(d)}`] }));
  steps.push(...F.steps);
  steps.push(num('Toppen', 'Voor welke x is f′(x) = 0? Geef ze allemaal.', xs, { th: ['abc'], write: F.lines }));
  steps.push(num('Waarden berekenen', 'Vul elke x in f(x) in (dus niet in f′). Welke uitkomsten krijg je?', vals, {
    hint: 'Netjes invullen met haakjes, vooral bij negatieve getallen: (−2)⁴ = 16.', write: xs.map((x, i) => `f(${tn(x)}) = ${tn(vals[i])}`),
  }));
  steps.push(num('Conclusie', 'Wat is de minimale waarde van f?', [mn], {
    hint: 'De grafiek van een vierdegraads functie met een positief getal voor x⁴ gaat links en rechts omhoog. Het laagste punt is dus een van de toppen die je vond.',
    th: ['extreem'], explain: 'De grafiek gaat aan beide kanten omhoog, dus de kleinste topwaarde is echt het minimum.',
    write: [`\\text{De minimale waarde is } ${tn(mn)}`],
  }));
  return { type: 'afgeleide', name: 'Minimale waarde', pts: 6, prompt: `De functie \\(f\\) wordt gegeven door \\(f(x) = ${ptex(f)}\\). Bereken algebraïsch de minimale waarde van \\(f(x)\\).`, steps, final: [{ label: 'min', answers: [mn] }] };
}

function randPar(lvl) {
  for (;;) {
    if (lvl === 3 && Math.random() < 0.6) {
      const A = pick([1, 2]), r1 = pick([-3, -2, -1, 1, 2, 3, 0.5, 1.5, -0.5]), r2 = pick([-3, -2, -1, 1, 2, 3, 0.75, 1.5]);
      const B = -4 * A * (r1 + r2) / 3, C = 2 * A * r1 * r2, m = ri(-6, 6);
      if (!m || !Number.isInteger(B) || !Number.isInteger(C)) continue;
      return { f: { 4: A, 3: B, 2: C, 1: m, 0: ri(-9, 9) }, m, n: ri(-8, 8), lineForm: 'std' };
    }
    const p = lvl === 1 ? 1 : pick([1, 1, 2, -1]), r1 = ri(-3, 4), r2 = ri(-3, 4), m = ri(-6, 6);
    if (r1 === r2 || m === 0 || (p * (r1 + r2)) % 2) continue;
    return { f: { 3: p, 2: -3 * p * (r1 + r2) / 2, 1: 3 * p * r1 * r2 + m, 0: ri(-9, 9) }, m, n: ri(-8, 8), lineForm: lvl === 3 || Math.random() < 0.2 ? 'alt' : 'std' };
  }
}
function buildPar({ f, m, n, lineForm = 'std', dp = 3 }) {
  const d = deriv(f);
  const lineTex = lineForm === 'alt' ? `${poly([[-m, 1]])} + y = ${n}` : `y = ${poly([[m, 1], [n, 0]])}`;
  const Q = { ...d }; Q[0] = (Q[0] || 0) - m; if (near(Q[0], 0)) delete Q[0];
  const steps = [
    recog('afgeleide', 'Klopt. Evenwijdig betekent: even steil, dus dezelfde helling. En de helling van de raaklijn is de afgeleide.', AFG_OVER),
    num('Helling van de lijn', `Wat is de richtingscoëfficiënt, oftewel de helling, van lijn \\(\\ell: ${lineTex}\\)?`, [m], {
      hint: lineForm === 'alt' ? 'Schrijf de lijn eerst als y = ax + b. Het getal a is de richtingscoëfficiënt.' : 'Bij y = ax + b is a de richtingscoëfficiënt.', th: ['lijn'],
      write: lineForm === 'alt' ? [`\\ell: y = ${poly([[m, 1], [n, 0]])}, \\ \\text{rc} = ${tn(m)}`] : [`\\text{rc}_\\ell = ${tn(m)}`],
    }),
    mc('Afgeleide', 'Wat is de afgeleide van f?', derivOpts(f), { hint: 'Machtsregel: \\(a x^n\\) wordt \\(n \\cdot a\\, x^{n-1}\\).', th: ['afgeleide'], write: [`f'(x) = ${ptex(d)}`] }),
    mc('Vergelijking', 'Welke vergelijking los je op om a te vinden?', [
      opt(M(`f'(a) = ${tn(m)}`), true, 'Klopt. De raaklijn in (a, f(a)) heeft helling f′(a). Evenwijdig aan ℓ betekent dat die helling gelijk is aan de rc van ℓ.'),
      opt(M(`f(a) = ${tn(m)}`), false, 'f(a) is de hoogte van het punt, niet de helling.'),
      opt(M("f'(a) = 0"), false, 'Dan zou de raaklijn horizontaal zijn. Hier moet hij even schuin lopen als ℓ.'),
    ], { th: ['helling'], write: [`f'(a) = ${tn(m)}`, `${ptex(d, 'a')} = ${tn(m)}`] }),
  ];
  let sols;
  if (maxDeg(f) === 4) {
    const F = factorSteps(Q, 'a');
    steps.push(...F.steps);
    sols = F.sols;
    steps.push(num('Oplossen', 'Geef alle waarden van a.', sols, { th: ['abc'], write: [`${ptex(Q, 'a')} = 0`, ...F.lines] }));
  } else {
    const A = Q[2] || 0, B = Q[1] || 0, C = Q[0] || 0;
    sols = quad(A, B, C).roots;
    steps.push(num('Oplossen', `Los op: \\(${ptex(d, 'a')} = ${tn(m)}\\). Geef alle waarden van a${dp !== 3 ? `, afgerond op ${dp} decimalen` : ''}.`, sols, {
      dp, hint: 'Zet eerst alles aan één kant en gebruik dan de abc-formule.', th: ['abc'], write: [`${ptex(Q, 'a')} = 0`, ...abcXLines(A, B, C, dp, 'a').slice(1), solsLine(sols, dp, 'a')],
    }));
  }
  return {
    type: 'afgeleide', name: 'Raaklijn evenwijdig aan een lijn', pts: 5,
    prompt: `De functie \\(f\\) wordt gegeven door \\(f(x) = ${ptex(f)}\\). De lijn \\(\\ell\\) heeft vergelijking \\(${lineTex}\\). Bereken algebraïsch de waarden van \\(a\\) waarvoor de raaklijn aan de grafiek van \\(f\\) in het punt \\((a, f(a))\\) evenwijdig is aan \\(\\ell\\).${dp !== 3 ? ` Rond af op ${dp} decimalen.` : ''}`,
    steps, final: [{ label: 'a', answers: sols, dp }],
  };
}

/* wortel + kettingregel: helling in een punt */
function randHW(lvl) {
  for (;;) {
    if (lvl === 1 || Math.random() < 0.7) {
      const k = ri(1, 5), c = lvl === 1 ? 1 : pick([1, 1, 1, 2, 3]), x0 = pick([1, 2, 3, -1, -2]), s = ri(2, 7), l = s * s - k * x0 * x0;
      if (l === 0 || Math.abs(l) > 40) continue;
      return { c, k, l, x0, inner: 'quad' };
    }
    const k = ri(2, 9), c = pick([1, 1, 2]), x0 = ri(1, 6), s = ri(1, 6), l = s * s - k * x0;
    if (l === 0 || Math.abs(l) > 40) continue;
    return { c, k, l, x0, inner: 'lin' };
  }
}
function sqrtDerivStep(c, k, l, inner, nm = 'g') {
  const u = inner === 'quad' ? { 2: k, 0: l } : { 1: k, 0: l };
  const U = ptex(u), du = deriv(u);
  const ok = inner === 'quad' ? `\\dfrac{${coefX(c * k)}x}{\\sqrt{${U}}}` : `\\dfrac{${tn(c * k)}}{2\\sqrt{${U}}}`;
  const wA = `\\dfrac{${tn(c)}}{2\\sqrt{${U}}}`;
  const wB = inner === 'quad' ? `\\dfrac{${coefX(2 * c * k)}x}{\\sqrt{${U}}}` : `\\dfrac{${tn(c * k)}}{\\sqrt{${U}}}`;
  return {
    ok, U, step: mc('Afgeleide', `Wat is ${nm}′(x)?`, [
      opt(M(`${nm}'(x) = ${ok}`), true, 'Helemaal goed. \\(\\sqrt{u}\\) wordt \\(\\dfrac{1}{2\\sqrt{u}}\\), en dat doe je nog keer \\(u\'\\). Daarna vereenvoudigen.'),
      opt(M(`${nm}'(x) = ${wA}`), false, 'Je bent de afgeleide van wat onder de wortel staat vergeten. Dat is precies de kettingregel.'),
      opt(M(`${nm}'(x) = ${wB}`), false, 'De afgeleide van \\(\\sqrt{u}\\) is \\(\\dfrac{1}{2\\sqrt{u}}\\). Je bent de 2 in de noemer vergeten.'),
    ], {
      hint: `\\(\\sqrt{u} = u^{1/2}\\), dus de afgeleide is \\(\\dfrac{1}{2\\sqrt{u}} \\cdot u'\\). Hier is \\(u = ${U}\\) en \\(u' = ${ptex(du)}\\).`, th: ['ketting'],
      write: [`${nm}'(x) = ${c === 1 ? '' : c + ' \\cdot '}\\dfrac{1}{2\\sqrt{${U}}} \\cdot ${ptex(du)} = ${ok}`],
    }),
  };
}
const ruleStepKetting = () => mc('Regel kiezen', 'Welke rekenregel heb je nodig om te differentiëren?', [
  opt('De kettingregel', true, 'Goed gezien. Onder de wortel staat een hele formule, niet alleen x. Dan neem je de afgeleide van de buitenkant keer de afgeleide van de binnenkant.'),
  opt('De productregel', false, 'Er worden geen twee functies van x met elkaar vermenigvuldigd. Een los getal ervoor blijft gewoon staan.'),
  opt('Alleen de machtsregel', false, 'Die werkt voor √x, maar hier staat iets ingewikkelders onder de wortel.'),
], { hint: 'Kijk wat er onder de wortel staat: alleen x, of een hele formule?', th: ['ketting'] });
function buildHW({ c, k, l, x0, inner }) {
  const u = inner === 'quad' ? { 2: k, 0: l } : { 1: k, 0: l };
  const ux0 = evalP(u, x0), s = Math.sqrt(ux0), y0 = c * s;
  const val = inner === 'quad' ? c * k * x0 / s : c * k / (2 * s);
  const D = sqrtDerivStep(c, k, l, inner);
  const gt = `${c === 1 ? '' : c}\\sqrt{${D.U}}`;
  const subst = inner === 'quad' ? `\\dfrac{${tn(c * k)} \\cdot ${tnp(x0)}}{\\sqrt{${tn(ux0)}}}` : `\\dfrac{${tn(c * k)}}{2\\sqrt{${tn(ux0)}}}`;
  const steps = [
    recog('afgeleide', 'Klopt. Er wordt gevraagd naar de helling in een punt, en die helling is de afgeleide in dat punt.', AFG_OVER),
    ruleStepKetting(),
    D.step,
    num('Invullen', `Bereken de helling: vul \\(x = ${tn(x0)}\\) in g′(x) in.`, [val], {
      hint: `Onder de wortel komt \\(${tn(ux0)}\\) te staan, en \\(\\sqrt{${tn(ux0)}} = ${tn(s)}\\).`, th: ['helling'],
      write: [`g'(${tn(x0)}) = ${subst} ${eqv(val)}`, `\\text{De helling in } (${tn(x0)},\\, ${tn(y0)}) \\text{ is } ${tn(val)}`],
    }),
  ];
  return { type: 'afgeleide', name: 'Helling met kettingregel', pts: 4, prompt: `De functie \\(g\\) wordt gegeven door \\(g(x) = ${gt}\\). Bereken algebraïsch de helling van de grafiek van \\(g\\) in het punt \\((${tn(x0)},\\, ${tn(y0)})\\).`, steps, final: [{ label: 'helling', answers: [val] }] };
}

/* wortel + kettingregel: helling is een gegeven getal, bereken x */
function randHWC(lvl) {
  for (;;) {
    if (lvl === 3 && Math.random() < 0.3) {
      const k = ri(1, 5) * 2, c = 1, s = ri(1, 6), x = ri(1, 8), l = s * s - k * x; const m = c * k / (2 * s);
      if (!l || Math.abs(l) > 40 || !nice(m)) continue;
      return { c, k, l, m, inner: 'lin', line: 'getal' };
    }
    const c = lvl === 1 ? 1 : pick([1, 1, 1, 2, 3]), k = lvl === 3 ? pick([1, 2, 3, 4, -2, -1]) : ri(1, 5), x0 = pick([1, 2, 3, -1, -2, -3, 0.5]), s = ri(1, 7);
    const l = s * s - k * x0 * x0;
    if (!Number.isInteger(l) || !l || Math.abs(l) > 50) continue;
    const m = c * k * x0 / s;
    if (!nice(m) || !nice(m * m) || !nice(m * m * k) || !nice(m * m * l) || near(m, 0) || Math.abs(m) > 12) continue;
    const line = lvl === 1 ? 'getal' : pick(['getal', 'getal', 'par']);
    if (line === 'par' && !Number.isInteger(m)) continue;
    return { c, k, l, m, inner: 'quad', line };
  }
}
function buildHWC({ c, k, l, m, inner, line }) {
  const D = sqrtDerivStep(c, k, l, inner);
  const gt = `${c === 1 ? '' : c}\\sqrt{${D.U}}`;
  const lineTex = `y = ${poly([[m, 1]])}${line === 'par' ? '' : ''}`;
  const steps = [recog('afgeleide', `Klopt. De helling van de grafiek is de afgeleide. Die moet hier ${line === 'par' ? 'gelijk zijn aan de helling van de lijn' : 'een bepaald getal zijn'}.`, AFG_OVER)];
  steps.push(mc('Vertalen', 'Welke vergelijking moet je oplossen?', [
    opt(M(`g'(x) = ${tn(m)}`), true, line === 'par' ? `Precies. Evenwijdig betekent dezelfde helling, en de lijn heeft helling ${tn(m)}.` : 'Precies. De helling in een punt is g′(x).'),
    opt(M(`g(x) = ${tn(m)}`), false, 'g(x) is de hoogte van de grafiek, niet de helling.'),
    opt(M(`g'(${tn(m)})`), false, 'Dan reken je de helling uit bij x = ' + plain(m) + '. Maar de helling is gegeven, en x is juist wat je zoekt.'),
  ], { th: ['helling'], write: [`g'(x) = ${tn(m)}`] }));
  steps.push(ruleStepKetting(), D.step);
  let sols, cands;
  if (inner === 'quad') {
    const ck = c * k, X = m * m * l / (ck * ck - m * m * k);
    const r = Math.sqrt(X);
    cands = uniqSort([-r, r]);
    sols = cands.filter(x => Math.sign(ck * x) === Math.sign(m));
    steps.push(mc('Wortel wegwerken', `Je hebt \\(${D.ok} = ${tn(m)}\\). Wat is een goede volgende stap?`, [
      opt(M(`${coefX(ck)}x = ${tn(m)}\\sqrt{${D.U}}`), true, 'Goed. Vermenigvuldig beide kanten met de wortel, dan staat hij niet meer in de noemer.'),
      opt(M(`${coefX(ck)}x = ${tn(m)} + \\sqrt{${D.U}}`), false, 'Wegwerken uit de noemer doe je door te vermenigvuldigen, niet door op te tellen.'),
    ], { th: ['kwadraat'], write: [`${coefX(ck)}x = ${tn(m)}\\sqrt{${D.U}}`] }));
    steps.push(mc('Kwadrateren', 'Kwadrateer nu beide kanten. Wat krijg je?', [
      opt(M(`${tn(ck * ck)}x^2 = ${tn(m * m)}(${D.U})`), true, 'Klopt. Links gaat zowel het getal als de x in het kwadraat, rechts het getal én wat onder de wortel staat.'),
      opt(M(`${tn(ck)}x^2 = ${tn(m * m)}(${D.U})`), false, `Links moet ook het getal in het kwadraat: \\((${tn(ck)}x)^2 = ${tn(ck * ck)}x^2\\).`),
      opt(M(`${tn(ck * ck)}x^2 = ${tn(m)}(${D.U})`), false, `Rechts moet het getal ook in het kwadraat: \\(${tnp(m)}^2 = ${tn(m * m)}\\).`),
    ], { hint: '(a · b)² = a² · b², en het kwadraat van een wortel is wat eronder staat.', th: ['kwadraat'], write: [`${tn(ck * ck)}x^2 = ${ptex({ 2: m * m * k, 0: m * m * l })}`] }));
    steps.push(num('Oplossen', 'Zet de x²-termen bij elkaar. Hoeveel is x²?', [X], { hint: 'Breng alle x² naar links, deel door het getal ervoor.', write: [`${tn(ck * ck - m * m * k)}x^2 = ${tn(m * m * l)}`, `x^2 = ${tn(X)}`] }));
    steps.push(num('Mogelijke x', 'Welke waarden van x horen daarbij? Geef ze allebei.', cands, { hint: 'Bij x² = getal horen twee oplossingen: plus en min de wortel.', th: ['wortelmacht'], write: [`x = ${asFrac(r) ? '\\pm ' + tn(r) : `\\pm\\sqrt{${tn(X)}} \\approx \\pm ${dec(r).replace(',', '{,}')}`}`] }));
    const lbl = x => `\\(x = ${asFrac(x) ? tn(x) : (x < 0 ? '-' : '') + `\\sqrt{${tn(X)}}`}\\)`;
    steps.push(mc('Controleren', 'Door het kwadrateren kan er een oplossing bij zijn gekomen die niet klopt. Welke x voldoet echt aan g′(x) = ' + plain(m) + '?', [
      opt(`Alleen ${lbl(sols[0])}`, true, `Klopt. De wortel is altijd positief. Dus ${tn(ck)}x moet hetzelfde teken hebben als ${tn(m)}, en dat lukt alleen met deze x.`),
      opt(`Alleen ${lbl(cands.find(x => !near(x, sols[0])))}`, false, 'Vul hem eens in: je krijgt dan precies het tegengestelde teken. De wortel is nooit negatief.'),
      opt('Allebei', false, 'Kijk naar het teken. Links staat iets met x, rechts een positief getal keer een wortel. Dat werkt maar voor één van de twee.'),
    ], { keepOrder: true, hint: 'Een wortel is nooit negatief. Welk teken moet x dus hebben?', th: ['kwadraat'], write: [`\\text{Alleen } x ${eqv(sols[0])} \\text{ voldoet}`] }));
  } else {
    const W = c * k / (2 * m), x = (W * W - l) / k;
    sols = [x];
    steps.push(num('Wortel vrijmaken', `Je hebt \\(${D.ok} = ${tn(m)}\\). Hoeveel is \\(\\sqrt{${D.U}}\\)?`, [W], { hint: 'Vermenigvuldig met de wortel en deel door ' + plain(m) + '.', write: [`\\sqrt{${D.U}} = ${tn(W)}`] }));
    steps.push(num('Kwadrateren', 'Kwadrateer beide kanten en los op. Wat is x?', [x], { th: ['kwadraat'], write: [`${D.U} = ${tn(W * W)}`, `x = ${tn(x)}`] }));
  }
  const prompt = line === 'par'
    ? `De functie \\(g\\) wordt gegeven door \\(g(x) = ${gt}\\). Bereken algebraïsch de waarde(n) van \\(a\\) waarvoor de raaklijn aan de grafiek van \\(g\\) in het punt \\(A(a, g(a))\\) evenwijdig loopt aan de lijn \\(${lineTex}\\).`
    : `De functie \\(g\\) wordt gegeven door \\(g(x) = ${gt}\\). Bereken algebraïsch de waarde(n) van \\(x\\) waarvoor \\(g'(x) = ${tn(m)}\\).`;
  return { type: 'afgeleide', name: 'Wortel: helling is gegeven', pts: 6, prompt, steps, final: [{ label: line === 'par' ? 'a' : 'x', answers: sols }] };
}

/* productregel met e-macht: helling of raaklijn */
function randHE(lvl) {
  const n = lvl === 1 ? 1 : pick([1, 1, 2]);
  const ask = lvl === 3 && Math.random() < 0.5 ? 'raaklijn' : 'helling';
  if (n === 1) { const k = pick([-3, -2, -1, 1, 2, 3]), x0 = pick([-2, -1, 1, 2, 0]); return { n, k, c: lvl === 1 ? -k * x0 : pick([-k * x0, -k * x0, 0]), x0, ask }; }
  const k = pick([-1, 1, -2]); return { n, k, c: pick([0, -k]), x0: 1, ask };
}
function buildHE({ n, k, c, x0, ask = 'helling' }) {
  const E = poly([[k, 1], [c, 0]]);
  const f1 = n === 1 ? 'x' : 'x^{2}';
  const coef = n * Math.pow(x0, n - 1) + k * Math.pow(x0, n), E0 = k * x0 + c, val = coef * Math.exp(E0);
  const y0 = Math.pow(x0, n) * Math.exp(E0), b = y0 - val * x0;
  const okD = `(${poly([[n, n - 1], [k, n]])})\\, e^{${E}}`;
  const steps = [
    recog('afgeleide', ask === 'raaklijn' ? 'Klopt. Voor de vergelijking van een raaklijn heb je de helling nodig, en die vind je met de afgeleide.' : 'Klopt. Er wordt gevraagd naar de helling in een punt. Daarvoor heb je de afgeleide nodig.', AFG_OVER),
    mc('Regel kiezen', 'Welke rekenregel heb je als eerste nodig?', [
      opt('De productregel', true, `Goed gezien. Hier worden twee functies van x vermenigvuldigd: \\(${f1}\\) en \\(e^{${E}}\\). Productregel: \\((f \\cdot g)' = f' \\cdot g + f \\cdot g'\\).`),
      opt('Alleen de kettingregel', false, 'De kettingregel heb je straks ook nodig, voor de e-macht. Maar eerst de productregel, want er staat een product.'),
      opt('De quotiëntregel', false, 'Er staat geen breuk, dus de quotiëntregel heb je hier niet nodig.'),
    ], { hint: 'Staat er iets keer iets, waarbij in allebei een x zit?', th: ['product'] }),
    mc('Afgeleide', "Wat is h′(x)?", [
      opt(M(`h'(x) = ${okD}`), true, `Helemaal goed: \\(${poly([[n, n - 1]])} \\cdot e^{${E}} + ${f1} \\cdot ${tnp(k)}e^{${E}}\\), en daarna \\(e^{${E}}\\) buiten haakjes.`),
      opt(M(`h'(x) = ${poly([[n * k, n - 1]])}\\, e^{${E}}`), false, 'Je hebt de twee afgeleiden met elkaar vermenigvuldigd. De productregel is f′·g + f·g′, niet f′·g′.'),
      k !== 1 ? opt(M(`h'(x) = (${poly([[n, n - 1], [1, n]])})\\, e^{${E}}`), false, `Je bent de kettingregel vergeten. De afgeleide van \\(e^{${E}}\\) is \\(${tn(k)}e^{${E}}\\).`) : null,
      opt(M(`h'(x) = ${n === 1 ? '' : poly([[n, n - 1]]) + '\\,'}e^{${E}}`), false, 'Je hebt alleen het eerste deel gedifferentieerd. Bij de productregel komt er nog een tweede term bij.'),
    ], {
      hint: `Productregel: \\((f g)' = f' g + f g'\\). Met \\(f = ${f1}\\), \\(f' = ${poly([[n, n - 1]])}\\), \\(g = e^{${E}}\\) en \\(g' = ${tn(k)}e^{${E}}\\) (kettingregel).`, th: ['product', 'emacht'],
      write: [`h'(x) = ${poly([[n, n - 1]])} \\cdot e^{${E}} + ${f1} \\cdot ${tnp(k)}e^{${E}}`, `h'(x) = ${okD}`],
    }),
    num('Invullen', `Bereken de helling in \\(x = ${tn(x0)}\\). Rond af op 3 decimalen als er geen mooi getal uitkomt.`, [val], {
      hint: `Vul ${plain(x0)} in. Denk eraan: \\(e^{${tn(E0)}}\\)${E0 === 0 ? ' = 1' : ' is gewoon een getal'}.`, th: ['emacht'],
      write: [`h'(${tn(x0)}) = (${tn(coef)}) \\cdot e^{${tn(E0)}} ${eqv(val)}`],
    }),
  ];
  const final = [{ label: ask === 'raaklijn' ? 'a' : 'helling', answers: [val] }];
  if (ask === 'raaklijn') {
    steps.push(num('Punt', `Bereken ook de y-waarde: hoeveel is \\(h(${tn(x0)})\\)?`, [y0], { hint: 'Vul x in h(x) in, niet in h′(x).', write: [`h(${tn(x0)}) ${eqv(y0)}`] }));
    steps.push(num('Raaklijn', `De raaklijn is \\(y = ax + b\\) met \\(a = ${tn(val)}\\). Hij gaat door \\((${tn(x0)}, ${tn(y0)})\\). Wat is b?`, [b], {
      hint: 'Vul het punt in: y = a · x + b, en los b op.', th: ['lijn'],
      write: [`${tn(y0)} = ${tn(val)} \\cdot ${tnp(x0)} + b \\;\\Rightarrow\\; b ${eqv(b)}`, `y = ${poly([[val, 1], [b, 0]])}`],
    }));
    final.push({ label: 'b', answers: [b] });
  }
  const q = ask === 'raaklijn' ? `een vergelijking van de raaklijn aan de grafiek van \\(h\\) in het punt met \\(x = ${tn(x0)}\\). Schrijf hem als \\(y = ax + b\\)` : `de helling van de grafiek van \\(h\\) in het punt met \\(x = ${tn(x0)}\\)`;
  return { type: 'afgeleide', name: ask === 'raaklijn' ? 'Raaklijn met productregel' : 'Helling met productregel', pts: ask === 'raaklijn' ? 5 : 4, prompt: `De functie \\(h\\) wordt gegeven door \\(h(x) = ${f1} \\cdot e^{${E}}\\). Bereken algebraïsch ${q}.`, steps, final };
}

/* quotiëntregel: L = (ax+b)/(cx+d), Q = (Ax²+p)/(qx+d) */
function quotParts(P) {
  if (P.form === 'L') {
    const { a, b, c, d } = P;
    return { t: poly([[a, 1], [b, 0]]), n: poly([[c, 1], [d, 0]]), dt: tn(a), dn: tn(c), N: { 0: a * d - b * c }, nf: x => c * x + d, tf: x => a * x + b, dtf: () => a, dnf: () => c,
      wrongN: { 0: a * d + b * c } };
  }
  const { A, p, q, d } = P;
  return { t: poly([[A, 2], [p, 0]]), n: poly([[q, 1], [d, 0]]), dt: poly([[2 * A, 1]]), dn: tn(q), N: { 2: A * q, 1: 2 * A * d, 0: -q * p }, nf: x => q * x + d, tf: x => A * x * x + p,
    wrongN: { 2: 3 * A * q, 1: 2 * A * d, 0: q * p } };
}
function randQuot(lvl) {
  const ask = lvl === 1 ? 'punt' : lvl === 2 ? pick(['punt', 'hor', 'hell']) : pick(['hor', 'hell', 'hell']);
  for (let i = 0; i < 4000; i++) {
    const form = ask === 'hor' ? 'Q' : ask === 'hell' ? (lvl === 3 && Math.random() < 0.6 ? 'Q' : 'L') : pick(['L', 'Q']);
    const P = form === 'L'
      ? { form, a: ri(1, 4), b: ri(-6, 6), c: lvl === 1 ? 1 : ri(1, 3), d: ri(-6, 10) }
      : { form, A: pick([1, 1, 2, 3, -1]), p: ri(-12, 12), q: pick([1, 1, 2]), d: ri(-4, 4) };
    const Z = quotParts(P);
    if (form === 'L' && (P.a * P.d - P.b * P.c === 0 || !P.b)) continue;
    if (form === 'Q' && (!P.p || P.A * P.d * P.d + P.p * P.q * P.q === 0)) continue;
    if (ask === 'punt') {
      const x0 = ri(-3, 4); if (near(Z.nf(x0), 0)) continue;
      const v = evalP(Z.N, x0) / Math.pow(Z.nf(x0), 2); if (!nice(v)) continue;
      return { ...P, ask, x0 };
    }
    if (ask === 'hor') {
      const r = quad(Z.N[2], Z.N[1], Z.N[0]).roots;
      if (r.length !== 2 || !r.every(x => nice(x) && !near(Z.nf(x), 0) && nice(Z.tf(x) / Z.nf(x)))) continue;
      return { ...P, ask };
    }
    const m = form === 'L' ? pick([1, 2, 3, 5, 0.5, 1 / 6, -1, -2]) : pick([1, -1, 2, 3, -2]);
    if (form === 'L') { const R = (P.a * P.d - P.b * P.c) / m; if (R <= 0 || !nice(Math.sqrt(R))) continue; }
    else { const Qd = { 2: Z.N[2] - m * P.q * P.q, 1: Z.N[1] - 2 * m * P.q * P.d, 0: Z.N[0] - m * P.d * P.d }; if (near(Qd[2], 0)) continue; const r = quad(Qd[2], Qd[1], Qd[0]).roots; if (r.length !== 2 || !r.every(x => nice(x) && !near(Z.nf(x), 0))) continue; }
    return { ...P, ask, m, line: Math.random() < 0.5 && Number.isInteger(m) ? 'par' : 'getal', n: ri(-5, 5) };
  }
  return { form: 'L', a: 1, b: 2, c: 2, d: 10, ask: 'hell', m: 1 / 6, line: 'getal' };
}
function buildQuot(P) {
  const Z = quotParts(P), { ask } = P;
  const g = `\\dfrac{${Z.t}}{${Z.n}}`;
  const Ntex = ptex(Z.N), den = `(${Z.n})^2`;
  const gp = `\\dfrac{${Ntex}}{${den}}`;
  const steps = [recog('afgeleide', ask === 'hor' ? 'Klopt. Horizontale raaklijn betekent helling 0. Daarvoor heb je de afgeleide nodig.' : 'Klopt. Het gaat over de helling van de grafiek, en die vind je met de afgeleide.', AFG_OVER)];
  steps.push(mc('Regel kiezen', 'g is een breuk met x in de teller én in de noemer. Welke rekenregel gebruik je?', [
    opt('De quotiëntregel', true, 'Goed gezien. Bij een deling van twee functies van x gebruik je de quotiëntregel.'),
    opt('Teller en noemer allebei apart differentiëren', false, 'Dat is een hele bekende valkuil. (t/n)′ is niet t′/n′.'),
    opt('Alleen de machtsregel', false, 'De machtsregel werkt voor losse machten van x. Hier staat een breuk met x boven én onder.'),
  ], { hint: 'Quotiënt betekent deling.', th: ['quot'] }));
  steps.push(mc('Afgeleide opstellen', `Met \\(t = ${Z.t}\\) en \\(n = ${Z.n}\\): wat is g′(x)?`, [
    opt(M(`g'(x) = \\dfrac{${Z.dt} \\cdot (${Z.n}) - (${Z.t}) \\cdot ${Z.dn}}{${den}}`), true, 'Helemaal goed. Eerst t′·n, dan min t·n′, en alles gedeeld door n².'),
    opt(M(`g'(x) = \\dfrac{(${Z.t}) \\cdot ${Z.dn} - ${Z.dt} \\cdot (${Z.n})}{${den}}`), false, 'De volgorde is net andersom. Het is t′·n − t·n′. Andersom krijg je precies het tegengestelde teken.'),
    opt(M(`g'(x) = \\dfrac{${Z.dt} \\cdot (${Z.n}) - (${Z.t}) \\cdot ${Z.dn}}{${Z.n}}`), false, 'De noemer moet in het kwadraat: n².'),
    opt(M(`g'(x) = \\dfrac{${Z.dt}}{${Z.dn}}`), false, 'Teller en noemer apart differentiëren mag niet. Gebruik de quotiëntregel.'),
  ], { hint: `Ezelsbruggetje: "n keer t-accent min t keer n-accent, gedeeld door n kwadraat". Hier is \\(t' = ${Z.dt}\\) en \\(n' = ${Z.dn}\\).`, th: ['quot'],
    write: [`g'(x) = \\dfrac{${Z.dt} \\cdot (${Z.n}) - (${Z.t}) \\cdot ${Z.dn}}{${den}}`] }));
  steps.push(mc('Teller vereenvoudigen', 'Werk de teller uit en vereenvoudig. Wat krijg je?', [
    opt(M(`g'(x) = ${gp}`), true, 'Mooi. Let vooral op het minteken voor het tweede deel: dat geldt voor alles tussen de haakjes.'),
    opt(M(`g'(x) = \\dfrac{${ptex(Z.wrongN)}}{${den}}`), false, 'Kijk nog eens naar het minteken. Het minteken voor (t)·n′ geldt voor de hele haak, dus elk teken daarin klapt om.'),
  ], { hint: 'Haakjes wegwerken, en daarna gelijksoortige termen samennemen. De noemer laat je gewoon staan.', th: ['quot'], write: [`g'(x) = ${gp}`] }));
  let final, prompt;
  if (ask === 'punt') {
    const v = evalP(Z.N, P.x0) / Math.pow(Z.nf(P.x0), 2), y0 = Z.tf(P.x0) / Z.nf(P.x0);
    steps.push(num('Invullen', `Vul \\(x = ${tn(P.x0)}\\) in g′(x) in. Hoe groot is de helling?`, [v], { th: ['helling'], hint: 'Reken teller en noemer apart uit, en vergeet het kwadraat in de noemer niet.', write: [`g'(${tn(P.x0)}) = \\dfrac{${tn(evalP(Z.N, P.x0))}}{${tn(Math.pow(Z.nf(P.x0), 2))}} ${eqv(v)}`] }));
    final = [{ label: 'helling', answers: [v] }];
    prompt = `De functie \\(g\\) wordt gegeven door \\(g(x) = ${g}\\). Bereken algebraïsch de helling van de grafiek van \\(g\\) in het punt \\((${tn(P.x0)},\\, ${tn(y0)})\\).`;
  } else if (ask === 'hor') {
    const xs = quad(Z.N[2], Z.N[1], Z.N[0]).roots, ys = xs.map(x => Z.tf(x) / Z.nf(x));
    steps.push(mc('Breuk is nul', `Wanneer is \\(${gp} = 0\\)?`, [
      opt('Als de teller 0 is', true, 'Precies. Een breuk is 0 als de teller 0 is (en de noemer niet).'),
      opt('Als de noemer 0 is', false, 'Delen door 0 kan niet. Dan bestaat de breuk niet eens.'),
      opt('Als teller en noemer gelijk zijn', false, 'Dan is de breuk 1, niet 0.'),
    ], { th: ['quot'], write: [`${Ntex} = 0`] }));
    steps.push(num('Oplossen', `Los \\(${Ntex} = 0\\) op. Geef beide x-waarden.`, xs, { th: ['abc'], write: abcXLines(Z.N[2], Z.N[1], Z.N[0]).slice(1) }));
    steps.push(num('y-coördinaten', 'Bereken de y-waarden: vul de x-waarden in g(x) in, niet in g′(x).', ys, { write: [`\\text{Punten: } ${ptsTex(xs, ys)}`] }));
    final = [{ label: 'x', answers: xs }, { label: 'y', answers: ys }];
    prompt = `De functie \\(g\\) wordt gegeven door \\(g(x) = ${g}\\). Bereken algebraïsch de coördinaten van de punten op de grafiek van \\(g\\) waarin de raaklijn horizontaal loopt.`;
  } else {
    const m = P.m;
    steps.push(mc('Vergelijking', 'Welke vergelijking los je op?', [
      opt(M(`${gp} = ${tn(m)}`), true, P.line === 'par' ? `Klopt. Evenwijdig betekent dezelfde helling, en de lijn heeft helling ${tn(m)}.` : 'Klopt. De helling is g′(x).'),
      opt(M(`${gp} = 0`), false, 'Gelijk aan 0 hoort bij een horizontale raaklijn. Hier moet de helling ' + plain(m) + ' zijn.'),
      opt(M(`${g} = ${tn(m)}`), false, 'g(x) is de hoogte van de grafiek. Je zoekt de helling, dus g′(x).'),
    ], { th: ['helling'], write: [`${gp} = ${tn(m)}`] }));
    let xs, w;
    if (P.form === 'L') {
      const R = Z.N[0] / m, s = Math.sqrt(R);
      xs = uniqSort([(s - P.d) / P.c, (-s - P.d) / P.c]);
      w = [`${den} = ${tn(R)}`, `${Z.n} = ${tn(s)} \\;\\vee\\; ${Z.n} = ${tn(-s)}`, solsLine(xs)];
      steps.push(num('Kruislings', `Vermenigvuldig met de noemer. Hoeveel is \\(${den}\\)?`, [R], { hint: `Teller gedeeld door ${plain(m)}.`, write: [w[0]] }));
      steps.push(num('Oplossen', `Als \\(${den} = ${tn(R)}\\), dan is \\(${Z.n} = \\pm ${tn(s)}\\). Welke x-waarden horen daarbij?`, xs, { hint: 'Vergeet de negatieve wortel niet: (−a)² = a² ook.', th: ['wortelmacht'], write: w.slice(1) }));
    } else {
      const Qd = { 2: Z.N[2] - m * P.q * P.q, 1: Z.N[1] - 2 * m * P.q * P.d, 0: Z.N[0] - m * P.d * P.d };
      xs = quad(Qd[2], Qd[1], Qd[0]).roots;
      steps.push(num('Oplossen', `Vermenigvuldig met de noemer, werk de haakjes uit en zet alles op 0. Welke x-waarden vind je?`, xs, {
        hint: `\\(${Ntex} = ${tn(m)}(${Z.n})^2\\). Werk \\((${Z.n})^2\\) uit en gebruik daarna de abc-formule.`, th: ['kwadraat', 'abc'],
        write: [`${Ntex} = ${tn(m)}(${Z.n})^2`, `${ptex(Qd)} = 0`, ...abcXLines(Qd[2], Qd[1], Qd[0]).slice(1)],
      }));
    }
    final = [{ label: 'x', answers: xs }];
    prompt = P.line === 'par'
      ? `De functie \\(g\\) wordt gegeven door \\(g(x) = ${g}\\). Bereken algebraïsch de waarde(n) van \\(x\\) waarvoor de raaklijn aan de grafiek van \\(g\\) in het punt \\((x, g(x))\\) evenwijdig loopt aan de lijn \\(y = ${poly([[m, 1], [P.n || 0, 0]])}\\).`
      : `De functie \\(g\\) wordt gegeven door \\(g(x) = ${g}\\). Bereken algebraïsch de x-coördinaten van de punten waar de helling van de grafiek van \\(g\\) gelijk is aan \\(${tn(m)}\\).`;
  }
  return { type: 'afgeleide', name: ask === 'punt' ? 'Quotiëntregel: helling in een punt' : ask === 'hor' ? 'Quotiëntregel: horizontale raaklijn' : 'Quotiëntregel: helling is gegeven', pts: ask === 'punt' ? 4 : 6, prompt, steps, final };
}

/* ---------- 5. rechte lijnen ---------- */
function randLijn(lvl) {
  for (;;) {
    const p = ri(-4, 5), q = pick(lvl === 1 ? [1, -1] : [-4, -3, -2, 2, 3, 4, 1, -1]), r = ri(-9, 9), a = ri(-4, 5), b = ri(-9, 9);
    if (!p || !b) continue;
    const rc = -p / q; if (near(rc, a)) continue;
    const x = b / (rc - a); if (!nice(x)) continue;
    return { p, q, r, a, b };
  }
}
function buildLijn({ p, q, r, a, b }) {
  const rc = -p / q, x = b / (rc - a), y = rc * x;
  const kTex = `${poly([[p, 1]])} ${q < 0 ? '-' : '+'} ${Math.abs(q) === 1 ? '' : Math.abs(q)}y = ${r}`, lTex = `y = ${poly([[a, 1], [b, 0]])}`;
  const steps = [
    num('Helling van k', `Lijn m loopt evenwijdig aan k, dus je hebt eerst de richtingscoëfficiënt van k nodig. Wat is die?`, [rc], {
      hint: `Schrijf k als y = …: zet de x-term aan de andere kant en deel door ${q}.`, th: ['lijn'],
      write: [`k: ${q === 1 ? '' : q === -1 ? '-' : q}y = ${poly([[-p, 1], [r, 0]])} \\;\\Rightarrow\\; y = ${poly([[rc, 1], [r / q, 0]])}`, `\\text{rc}_k = ${tn(rc)}`],
    }),
    mc('Lijn m', 'm is evenwijdig aan k en gaat door de oorsprong. Wat is de vergelijking van m?', [
      opt(M(`y = ${poly([[rc, 1]])}`), true, 'Klopt. Evenwijdig betekent dezelfde rc, en door de oorsprong betekent dat b = 0.'),
      opt(M(`y = ${poly([[rc, 1], [r / q, 0]])}`), false, 'Dat is lijn k zelf. Lijn m gaat door de oorsprong, dus daar hoort geen los getal bij.'),
      opt(M(`y = ${poly([[-1 / rc, 1]])}`), false, 'Die staat loodrecht op k. Evenwijdig betekent juist dezelfde rc.'),
    ], { th: ['lijn'], write: [`m: y = ${poly([[rc, 1]])}`] }),
    mc('Gelijkstellen', 'Hoe vind je het snijpunt van l en m?', [
      opt(M(`${poly([[a, 1], [b, 0]])} = ${poly([[rc, 1]])}`), true, 'Precies. In het snijpunt hebben beide lijnen dezelfde y.'),
      opt(M(`${tn(a)} = ${tn(rc)}`), false, 'Dan vergelijk je alleen de hellingen. Je zoekt het punt waar de lijnen elkaar raken, dus stel de formules gelijk.'),
    ], { th: ['snijpunt'], write: [`${poly([[a, 1], [b, 0]])} = ${poly([[rc, 1]])}`] }),
    num('x berekenen', 'Los de vergelijking op. Wat is x?', [x], { hint: 'Zet de x-en aan één kant en de getallen aan de andere kant.', write: [`${tn(a - rc)}x = ${tn(-b)} \\;\\Rightarrow\\; x = ${tn(x)}`] }),
    num('y berekenen', 'En de y-coördinaat?', [y], { hint: 'Vul x in een van de twee lijnen in. Lijn m is het makkelijkst.', write: [`y = ${tn(rc)} \\cdot ${tnp(x)} = ${tn(y)}`, `\\text{Snijpunt: } (${tn(x)},\\, ${tn(y)})`] }),
  ];
  return { type: 'lijnen', name: 'Snijpunt van twee lijnen', pts: 5, prompt: `Gegeven zijn lijn \\(k\\) met vergelijking \\(${kTex}\\) en lijn \\(\\ell\\) met vergelijking \\(${lTex}\\). Lijn \\(m\\) is evenwijdig aan lijn \\(k\\) en gaat door de oorsprong \\(O(0,0)\\). Bereken algebraïsch de coördinaten van het snijpunt van lijn \\(\\ell\\) en lijn \\(m\\).`, steps, final: [{ label: 'x', answers: [x] }, { label: 'y', answers: [y] }] };
}

/* ---------- 6. formules omwerken met log ---------- */
const VARS = [['R', 'Q'], ['P', 'L'], ['N', 't'], ['W', 'A']];
function randLogf(lvl) {
  const T = lvl === 1 ? 'T1' : lvl === 2 ? pick(['T1', 'T2', 'T1', 'T2', 'T4']) : pick(['T2', 'T3', 'T4']);
  const vars = pick(VARS);
  if (T === 'T1') return { T, p: pick([2, 3, 0.5, 1.5, 4]), q: lvl === 1 ? pick([1, 2, 3]) : pick([1, 2, 3, -1, -2, 0.5]), vars };
  if (T === 'T2') return { T, p: pick([0.2, 0.5, 0.1, 2, 0.25]), q: pick([1, 2, -1, -3, 0.5]), vars };
  if (T === 'T3') return { T, q: ri(1, 6), r: pick([2, 3, 4, 5]), s: pick([1, 2, 3]), vars: pick([['D', 'P'], ['N', 't'], ['K', 'q']]) };
  return { T, p: pick([2, 4, 0.5, 0.25]), q: pick([1, 2, 3, 4, -1]), vars };
}
function buildLogf({ T, p, q, r, s, vars }) {
  const [Y, X] = vars;
  const lg = v => `\\log(${v})`;
  let prompt, steps, final;
  const intro = mc('Aanpak', 'Je wilt de log kwijt, zodat er een formule zonder log overblijft. Wat is de handigste aanpak?', [
    opt('Schrijf alles als één log, en haal daarna de log weg', true, 'Precies. Als log(A) = log(B), dan is A = B. Zo raak je de log kwijt.'),
    opt('Deel beide kanten door log', false, '"log" is geen getal maar een bewerking. Daar kun je niet door delen.'),
    opt('Streep de log aan beide kanten weg', false, 'Dat mag alleen als er aan beide kanten precies één log staat, en niets anders.'),
  ], { th: ['logregels'] });
  if (T === 'T1' || T === 'T4') {
    let P1 = p, Q1 = q, pre = [];
    if (T === 'T4') { P1 = 1 / p; Q1 = -q / p; }
    const c = Math.pow(10, Q1), d = P1;
    const L = T === 'T4' ? X : Y, Rv = T === 'T4' ? Y : X;
    if (T === 'T4') pre = [num(`${lg(L)} vrijmaken`.replace(/\\log\((.)\)/, 'log $1'), `Maak eerst \\(${lg(L)}\\) vrij. Je krijgt \\(${lg(L)} = \\ldots \\cdot ${lg(Rv)} + \\ldots\\). Welk getal staat er vóór \\(${lg(Rv)}\\)?`, [P1], {
      hint: `Zet ${tn(q)} aan de andere kant en deel alles door ${tn(p)}.`, write: [`${lg(L)} = ${tn(P1)}${lg(Rv)} ${Q1 < 0 ? '-' : '+'} ${tn(Math.abs(Q1))}`],
    })];
    steps = [...pre, intro,
      mc('Getal als log', `Hoe schrijf je het losse getal \\(${tn(Q1)}\\) als log?`, [
        opt(M(`${tn(Q1)} = \\log(10^{${tn(Q1)}})`), true, 'Klopt. log(10ᵃ) = a, dus elk getal kun je zo als log schrijven.'),
        opt(M(`${tn(Q1)} = \\log(${tn(Q1)})`), false, `Reken maar na: log(${plain(Q1)}) is niet gelijk aan ${plain(Q1)}.`),
        opt(M(`${tn(Q1)} = 10^{${tn(Q1)}}`), false, 'Dan schrijf je hem niet als log, en is het ook niet meer hetzelfde getal.'),
      ], { th: ['logregels'], write: [`${lg(L)} = ${tn(P1)}${lg(Rv)} + \\log(10^{${tn(Q1)}})`] }),
      mc('Logregels', 'Gebruik de rekenregels voor log. Wat wordt de rechterkant?', [
        opt(M(`\\log(10^{${tn(Q1)}} \\cdot ${Rv}^{${tn(P1)}})`), true, `Mooi. \\(${tn(P1)}\\log(${Rv}) = \\log(${Rv}^{${tn(P1)}})\\) en log A + log B = log(A · B).`),
        opt(M(`\\log(10^{${tn(Q1)}} + ${Rv}^{${tn(P1)}})`), false, 'Pas op: log A + log B = log(A · B), niet log(A + B).'),
        opt(M(`\\log(${tn(P1)} \\cdot ${Rv} \\cdot 10^{${tn(Q1)}})`), false, `Het getal vóór de log wordt een exponent: \\(${tn(P1)}\\log(${Rv}) = \\log(${Rv}^{${tn(P1)}})\\).`),
      ], { th: ['logregels'], write: [`${lg(L)} = \\log(10^{${tn(Q1)}} \\cdot ${Rv}^{${tn(P1)}})`, `${L} = 10^{${tn(Q1)}} \\cdot ${Rv}^{${tn(P1)}}`] }),
      num('Eerste getal', `Je hebt nu \\(${L} = 10^{${tn(Q1)}} \\cdot ${Rv}^{${tn(P1)}}\\). Hoeveel is het getal ervoor, \\(10^{${tn(Q1)}}\\)? Rond af op 3 decimalen als dat nodig is.`, [c], { write: [`${L} \\approx ${tn(c)} \\cdot ${Rv}^{${tn(P1)}}`] }),
      num('Exponent', 'En wat is de exponent?', [d], { explain: 'Dit is de exponent die je bij de logregels vond.' }),
    ];
    const [cl, dl] = T === 'T4' ? ['a', 'b'] : ['c', 'd'];
    final = [{ label: cl, answers: [c] }, { label: dl, answers: [d] }];
    prompt = T === 'T4'
      ? `Het verband tussen \\(${Y}\\) en \\(${X}\\) wordt gegeven door \\(${lg(Y)} = ${tn(q)} + ${tn(p)} \\cdot ${lg(X)}\\). Dit kan ook geschreven worden als \\(${X} = a \\cdot ${Y}^{b}\\). Bereken algebraïsch de waarden van \\(a\\) en \\(b\\).`
      : `Het verband tussen \\(${Y}\\) en \\(${X}\\) wordt gegeven door \\(${lg(Y)} = ${tn(p)}${lg(X)} ${q < 0 ? '-' : '+'} ${tn(Math.abs(q))}\\). Deze formule kan worden herleid tot de vorm \\(${Y} = c \\cdot ${X}^{d}\\). Bereken algebraïsch \\(c\\) en \\(d\\).`;
  } else if (T === 'T2') {
    const c = Math.pow(10, q), d = Math.pow(10, p);
    steps = [
      mc('Log weghalen', `Wat volgt uit \\(${lg(Y)} = ${tn(p)}${X} ${q < 0 ? '-' : '+'} ${tn(Math.abs(q))}\\)?`, [
        opt(M(`${Y} = 10^{${tn(p)}${X} ${q < 0 ? '-' : '+'} ${tn(Math.abs(q))}}`), true, 'Klopt. log(A) = B betekent A = 10ᴮ.'),
        opt(M(`${Y} = ${tn(p)}${X} ${q < 0 ? '-' : '+'} ${tn(Math.abs(q))}`), false, 'De log mag je niet zomaar weglaten. Gebruik: log(A) = B betekent A = 10ᴮ.'),
      ], { th: ['logregels'], write: [`${Y} = 10^{${tn(p)}${X} ${q < 0 ? '-' : '+'} ${tn(Math.abs(q))}}`] }),
      mc('Machtsregels', 'Splits de macht met de rekenregels. Wat krijg je?', [
        opt(M(`${Y} = 10^{${tn(q)}} \\cdot (10^{${tn(p)}})^{${X}}`), true, `Mooi. \\(10^{a+b} = 10^a \\cdot 10^b\\) en \\(10^{${tn(p)}${X}} = (10^{${tn(p)}})^{${X}}\\).`),
        opt(M(`${Y} = 10^{${tn(q)}} + (10^{${tn(p)}})^{${X}}`), false, 'Bij het optellen van exponenten vermenigvuldig je de machten: 10ᵃ⁺ᵇ = 10ᵃ · 10ᵇ.'),
      ], { th: ['macht'], write: [`${Y} = 10^{${tn(q)}} \\cdot (10^{${tn(p)}})^{${X}}`] }),
      num('c berekenen', `Hoeveel is \\(c = 10^{${tn(q)}}\\)? Rond af op 3 decimalen als dat nodig is.`, [c], {}),
      num('d berekenen', `En \\(d = 10^{${tn(p)}}\\)? Rond af op 3 decimalen.`, [d], { write: [`${Y} \\approx ${tn(c)} \\cdot ${tn(d)}^{${X}}`] }),
    ];
    final = [{ label: 'c', answers: [c] }, { label: 'd', answers: [d] }];
    prompt = `Het verband tussen \\(${Y}\\) en \\(${X}\\) wordt gegeven door \\(${lg(Y)} = ${tn(p)}${X} ${q < 0 ? '-' : '+'} ${tn(Math.abs(q))}\\). Deze formule kan worden herleid tot de vorm \\(${Y} = c \\cdot d^{${X}}\\). Bereken algebraïsch \\(c\\) en \\(d\\).`;
  } else {
    const a = s - Math.log(r), b = q;
    steps = [
      num('e-macht vrijmaken', `Zet de e-macht alleen: \\(e^{${X} - ${s}} = \\dfrac{${Y} - \\ldots}{${r}}\\). Welk getal staat op de puntjes?`, [q], { hint: `Zet ${q} aan de andere kant en deel door ${r}.`, write: [`e^{${X} - ${s}} = \\dfrac{${Y} - ${q}}{${r}}`] }),
      mc('ln nemen', 'Hoe krijg je de exponent naar beneden?', [
        opt(M(`${X} - ${s} = \\ln\\left(\\dfrac{${Y} - ${q}}{${r}}\\right)`), true, 'Klopt. ln is de log met grondtal e: als eᴬ = B, dan A = ln(B).'),
        opt(M(`${X} - ${s} = \\log\\left(\\dfrac{${Y} - ${q}}{${r}}\\right)`), false, 'Bij e hoort ln. De gewone log heeft grondtal 10.'),
      ], { th: ['logregels'], write: [`${X} - ${s} = \\ln\\left(\\dfrac{${Y} - ${q}}{${r}}\\right)`] }),
      mc('Logregel', 'Splits de ln van de breuk. Wat krijg je?', [
        opt(M(`${X} = ${s} - \\ln(${r}) + \\ln(${Y} - ${q})`), true, 'Mooi. ln(A / B) = ln(A) − ln(B), en daarna de ' + s + ' naar de andere kant.'),
        opt(M(`${X} = ${s} + \\dfrac{\\ln(${Y} - ${q})}{\\ln(${r})}`), false, 'ln(A / B) is niet ln(A) / ln(B). Het is ln(A) − ln(B).'),
      ], { th: ['logregels'], write: [`${X} = ${s} - \\ln(${r}) + \\ln(${Y} - ${q})`] }),
      num('a berekenen', `Hoeveel is \\(a = ${s} - \\ln(${r})\\)? Rond af op 3 decimalen.`, [a], { write: [`a = ${s} - \\ln(${r}) \\approx ${dec(a).replace(',', '{,}')}`] }),
      num('b aflezen', 'En wat is b?', [b], { write: [`b = ${b}`] }),
    ];
    final = [{ label: 'a', answers: [a] }, { label: 'b', answers: [b] }];
    prompt = `Het verband tussen \\(${Y}\\) en \\(${X}\\) wordt gegeven door \\(${Y} = ${q} + ${r}e^{${X} - ${s}}\\). Deze formule kan worden omgewerkt tot de vorm \\(${X} = a + \\ln(${Y} - b)\\). Bereken algebraïsch \\(a\\) en \\(b\\).`;
  }
  return { type: 'formules', name: 'Formule omwerken met log', pts: 4, prompt, steps, final };
}

/* ---------- 7. rijen ---------- */
function randRij(lvl) {
  const kind = lvl === 1 ? 'rek' : lvl === 2 ? pick(['rek', 'meet']) : pick(['meet', 'machten']);
  if (kind === 'rek') { const v = pick([2, 3, 5, 7]), lo = pick([10, 20, 50, 100]), hi = pick([100, 200, 500, 1000]); return { kind, v, lo, hi, odd: v === 2 && Math.random() < 0.6 }; }
  if (kind === 'meet') for (;;) { const r = pick([2, 3, 0.5, 4, 1.5]), u1 = pick([3, 5, 10, 64, 80, 160, 1024, 10240]), i = pick([1, 2, 3]), j = i + pick([2, 3]), n = pick([6, 8, 10]); const ui = u1 * r ** (i - 1), uj = u1 * r ** (j - 1); if (nice(ui) && nice(uj) && Number.isInteger(ui) && Number.isInteger(uj)) return { kind, i, j, ui, uj, n }; }
  return { kind, g: pick([2, 3, 5]), lo: pick([10, 20, 100]), hi: pick([100000, 1000000, 10000000]) };
}
function buildRij(P) {
  let steps, final, prompt, name;
  const soort = (rek) => mc('Soort rij', 'Wat voor rij is dit?', [
    opt(rek ? 'Rekenkundig: er komt steeds hetzelfde getal bij' : 'Meetkundig: je doet steeds keer hetzelfde getal', true, rek ? 'Klopt. Het verschil tussen twee termen is steeds gelijk.' : 'Klopt. De verhouding tussen twee termen is steeds gelijk.'),
    opt(rek ? 'Meetkundig: je doet steeds keer hetzelfde getal' : 'Rekenkundig: er komt steeds hetzelfde getal bij', false, rek ? 'Kijk naar twee termen naast elkaar: het verschil is steeds hetzelfde, dus er komt steeds iets bij.' : 'Kijk naar twee termen naast elkaar: je vermenigvuldigt steeds met hetzelfde getal.'),
  ], { keepOrder: true, th: ['rij'] });
  if (P.kind === 'rek') {
    const { v, lo, hi, odd } = P;
    const first = odd ? (lo % 2 ? lo : lo + 1) : Math.ceil((lo + 1) / v) * v, last = odd ? (hi % 2 ? hi : hi - 1) : Math.floor((hi - 1) / v) * v;
    const n = (last - first) / v + 1, S = n * (first + last) / 2;
    const what = odd ? `de oneven getallen tussen ${lo} en ${hi}` : `alle veelvouden van ${v} tussen ${lo} en ${hi}`;
    name = 'Som van een rekenkundige rij';
    steps = [soort(true),
      num('Eerste en laatste', 'Wat is de eerste term van de som?', [first], { write: [`${first} + ${first + v} + \\ldots + ${last}`] }),
      num('Laatste term', 'En de laatste term?', [last], {}),
      num('Aantal termen', 'Hoeveel termen tel je op?', [n], { hint: `(laatste − eerste) gedeeld door ${v}, en dan nog +1. Die +1 vergeet je makkelijk.`, th: ['rij'], write: [`n = \\dfrac{${last} - ${first}}{${v}} + 1 = ${n}`] }),
      num('Som', 'Bereken de som.', [S], { hint: 'Som = aantal termen · (eerste + laatste) / 2.', th: ['rij'], write: [`S = \\dfrac{${n}}{2}(${first} + ${last}) = ${S}`] }),
    ];
    final = [{ label: 'som', answers: [S] }];
    prompt = `Bereken algebraïsch de som van ${what}.`;
  } else if (P.kind === 'meet') {
    const { i, j, ui, uj, n } = P;
    const r = Math.pow(uj / ui, 1 / (j - i)), u1 = ui / Math.pow(r, i - 1), S = u1 * (Math.pow(r, n) - 1) / (r - 1);
    name = 'Som van een meetkundige rij';
    steps = [soort(false),
      num('Reden', `Wat is de reden r? Bedenk dat je van \\(u_{${i}}\\) naar \\(u_{${j}}\\) ${j - i} keer met r vermenigvuldigt.`, [r], { hint: `r^${j - i} = ${uj} / ${ui}.`, th: ['rij'], write: [`r^{${j - i}} = \\dfrac{${uj}}{${ui}} = ${tn(uj / ui)} \\;\\Rightarrow\\; r = ${tn(r)}`] }),
      num('Eerste term', 'Wat is de eerste term \\(u_1\\)?', [u1], { hint: i === 1 ? 'Die staat er al.' : `Ga van u${i} terug: deel ${i - 1} keer door r.`, write: [`u_1 = ${tn(u1)}`] }),
      mc('Somformule', 'Welke formule gebruik je voor de som?', [
        opt(M(`S = u_1 \\cdot \\dfrac{r^{n} - 1}{r - 1}`), true, 'Klopt, dat is de somformule voor een meetkundige rij.'),
        opt(M(`S = \\dfrac{n}{2}(u_1 + u_n)`), false, 'Die formule hoort bij een rekenkundige rij.'),
      ], { th: ['rij'] }),
      num('Som', `Bereken de som van de eerste ${n} termen.`, [S], { write: [`S = ${tn(u1)} \\cdot \\dfrac{${tnp(r)}^{${n}} - 1}{${tn(r)} - 1} ${eqv(S)}`] }),
    ];
    final = [{ label: 'som', answers: [S] }];
    prompt = `Gegeven is een meetkundige rij met \\(u_{${i}} = ${ui}\\) en \\(u_{${j}} = ${uj}\\). Bereken algebraïsch de som van de eerste ${n} termen, dus \\(u_1 + u_2 + \\cdots + u_{${n}}\\).`;
  } else {
    const { g, lo, hi } = P;
    let a = 1; while (Math.pow(g, a) <= lo) a++;
    let b = a; while (Math.pow(g, b + 1) < hi) b++;
    const u1 = Math.pow(g, a), n = b - a + 1, S = u1 * (Math.pow(g, n) - 1) / (g - 1);
    name = 'Som van machten';
    steps = [soort(false),
      num('Eerste term', `Wat is de kleinste macht van ${g} die groter is dan ${lo}?`, [u1], { write: [`u_1 = ${g}^{${a}} = ${u1}`] }),
      num('Aantal termen', `De grootste macht onder ${hi} is \\(${g}^{${b}}\\). Hoeveel termen tel je op?`, [n], { hint: `Van exponent ${a} tot en met ${b}: ${b} − ${a} + 1.`, write: [`n = ${b} - ${a} + 1 = ${n}`] }),
      num('Som', 'Bereken de som met de somformule voor een meetkundige rij.', [S], { th: ['rij'], write: [`S = ${u1} \\cdot \\dfrac{${g}^{${n}} - 1}{${g} - 1} = ${S}`] }),
    ];
    final = [{ label: 'som', answers: [S] }];
    prompt = `Bereken algebraïsch de som van de machten van ${g} die tussen ${lo} en ${hi.toLocaleString('nl-NL')} liggen. Tip: de grootste macht van ${g} onder ${hi.toLocaleString('nl-NL')} is \\(${g}^{${b}} = ${Math.pow(g, b).toLocaleString('nl-NL').replace(/\./g, '\\,')}\\).`;
  }
  return { type: 'rijen', name, pts: 4, prompt, steps, final };
}

/* ---------- registratie ---------- */
const GENS = {
  kwadr: { topic: 'veelterm', rand: randKwadr, build: buildKwadr, w: 1 },
  kubisch: { topic: 'veelterm', rand: randKubisch, build: buildKubisch, w: 2 },
  macht: { topic: 'veelterm', rand: randMacht, build: buildMacht, w: 1 },
  snij: { topic: 'veelterm', rand: randSnij, build: buildSnij, w: 2 },
  e1: { topic: 'expo', rand: randE1, build: buildE1, w: 1.2 },
  e2: { topic: 'expo', rand: randE2, build: buildE2, w: 0.8 },
  e3: { topic: 'expo', rand: randE3, build: buildE3, w: 1.3 },
  e4: { topic: 'expo', rand: randE4, build: buildE4, w: 1 },
  lg: { topic: 'expo', rand: randLg, build: buildLg, w: 0.4 },
  wortel: { topic: 'wortel', rand: randWortel, build: buildWortel, w: 1.5 },
  hor: { topic: 'afgeleide', rand: randHor, build: buildHor, w: 0.8 },
  par: { topic: 'afgeleide', rand: randPar, build: buildPar, w: 0.8 },
  min: { topic: 'afgeleide', rand: randMin, build: buildMin, w: 1.4 },
  hw: { topic: 'afgeleide', rand: randHW, build: buildHW, w: 0.6 },
  hwc: { topic: 'afgeleide', rand: randHWC, build: buildHWC, w: 1.8 },
  quot: { topic: 'afgeleide', rand: randQuot, build: buildQuot, w: 2 },
  he: { topic: 'afgeleide', rand: randHE, build: buildHE, w: 0.6 },
  lijn: { topic: 'lijnen', rand: randLijn, build: buildLijn, w: 0.5 },
  logf: { topic: 'formules', rand: randLogf, build: buildLogf, w: 1 },
  rij: { topic: 'rijen', rand: randRij, build: buildRij, w: 0.6 },
};
/* echte tentamenvragen: ex = voorbeeldtentamen, pt = deelvraag */
const BANK = [
  { ex: 1, pt: 'a', g: 'kwadr', p: { lhs: [[3, 2], [-7, 1], [2, 0]], rhs: [] } },
  { ex: 1, pt: 'b', g: 'macht', p: { lhs: [[2, 4], [-4, 8]], rhs: [] } },
  { ex: 1, pt: 'c', g: 'e4', p: { g: 2, u: 1, m: 2, a: 0, v: 2, n: 3, b: 0, zero: true } },
  { ex: 1, pt: 'd', g: 'e1', p: { a: 2, b: 5, c: -30, d: 0 } },
  { ex: 1, pt: 'e', g: 'wortel', p: { a: 4, b: -7, m: 0.5, c: 1, ask: 'coords' } },
  { ex: 2, pt: 'a', g: 'kubisch', p: { lhs: [[9, 3], [3, 2]], rhs: [[2, 1]] } },
  { ex: 2, pt: 'b', g: 'e2', p: { a: 3, b: 5, c: 14, d: 10 } },
  { ex: 2, pt: 'c', g: 'quot', p: { form: 'Q', A: 1, p: 0, q: 1, d: 2, ask: 'punt', x0: 1 } },
  { ex: 3, pt: 'a', g: 'kubisch', p: { lhs: [[9, 3], [25, 1]], rhs: [[30, 2]] } },
  { ex: 3, pt: 'b', g: 'e3', p: { a: 5, p: 4, c: 2, q: 5 } },
  { ex: 3, pt: 'c', g: 'hw', p: { c: 1, k: 8, l: -12, x0: 2, inner: 'lin' } },
  { ex: 3, pt: 'd', g: 'wortel', p: { a: 8, b: -12, m: 2, c: -6, ask: 'coords' } },
  { ex: 4, pt: 'a', g: 'kubisch', p: { lhs: [[2, 2], [-3, 3]], rhs: [[1, 1]] } },
  { ex: 4, pt: 'b', g: 'lijn', p: { p: 2, q: -3, r: 5, a: 3, b: -2 } },
  { ex: 5, pt: 'a', g: 'kubisch', p: { lhs: [[16, 3], [9, 1]], rhs: [[24, 2]] } },
  { ex: 5, pt: 'b', g: 'lijn', p: { p: 1, q: -4, r: 2, a: 2, b: 7 } },
  { ex: 5, pt: 'c', g: 'hwc', p: { c: 1, k: 2, l: 8, m: 0.25, inner: 'lin', line: 'getal' } },
  { ex: 5, pt: 'd', g: 'wortel', p: { a: 2, b: 8, m: -2, c: 4, ask: 'coords' } },
  { ex: 6, pt: 'a', g: 'snij', p: { f: { 2: -4, 1: -2, 0: 5 }, g: { 1: 10, 0: 14 }, ask: 'coords' } },
  { ex: 6, pt: 'c', g: 'quot', p: { form: 'L', a: 1, b: 2, c: 2, d: 10, ask: 'hell', m: 1 / 6, line: 'getal' } },
  { ex: 6, pt: 'd', g: 'lg', p: { a: 3, b: 4, c: 5, d: 11 } },
  { ex: 7, pt: 'a', g: 'snij', p: { f: { 3: 1, 2: -3 }, g: { 1: 4 }, ask: 'coords' } },
  { ex: 7, pt: 'b', g: 'par', p: { f: { 3: 1, 2: -3 }, m: 4, n: 0, dp: 2 } },
  { ex: 7, pt: 'c', g: 'quot', p: { form: 'Q', A: 3, p: 12, q: 2, d: 0, ask: 'hor' } },
  { ex: 7, pt: 'd', g: 'he', p: { n: 2, k: -1, c: 0, x0: 1 } },
  { ex: 8, pt: 'a', g: 'snij', p: { f: { 3: 1, 2: 4, 1: -8, 0: 4 }, g: { 2: 4, 1: 8, 0: 4 }, gtex: '(2x + 2)^2', ask: 'coords' } },
  { ex: 8, pt: 'b', g: 'par', p: { f: { 3: 1, 2: 4, 1: -8, 0: 4 }, m: -5, n: 7 } },
  { ex: 8, pt: 'c', g: 'hwc', p: { c: 1, k: 4, l: 3, m: 1, inner: 'quad', line: 'getal' } },
  { ex: 8, pt: 'd', g: 'he', p: { n: 1, k: -2, c: 2, x0: 1 } },
  { ex: 9, pt: 'a', g: 'hor', p: { f: { 4: 1, 3: 2, 2: -2, 0: 4 }, ask: 'x' } },
  { ex: 9, pt: 'b', g: 'e3', p: { a: 3, p: 2, c: 1, q: 12, dp: 2 } },
  { ex: 9, pt: 'c', g: 'hwc', p: { c: 1, k: 3, l: -4, m: 3, inner: 'quad', line: 'getal' } },
  { ex: 10, pt: 'a', g: 'snij', p: { f: { 3: 1, 2: -3, 0: 4 }, g: { 1: -2.25, 0: 4 }, ask: 'coords' } },
  { ex: 10, pt: 'b', g: 'hwc', p: { c: 1, k: 2, l: 1, m: 4 / 3, inner: 'quad', line: 'getal' } },
  { ex: 10, pt: 'c', g: 'logf', p: { T: 'T3', q: 3, r: 2, s: 1, vars: ['D', 'P'] } },
  { ex: 11, pt: 'a', g: 'par', p: { f: { 4: 2, 3: -8, 2: 9, 1: 5, 0: -7 }, m: 5, n: 4 } },
  { ex: 11, pt: 'b', g: 'hwc', p: { c: 3, k: 4, l: -7, m: 8, inner: 'quad', line: 'getal' } },
  { ex: 11, pt: 'c', g: 'e3', p: { a: 3, p: 2, c: 1 / 3, q: 4, dp: 4 } },
  { ex: 12, pt: 'a', g: 'par', p: { f: { 4: 1, 3: 7, 2: -9, 1: 2, 0: -7 }, m: 2, n: 4 } },
  { ex: 12, pt: 'c', g: 'rij', p: { kind: 'meet', i: 2, j: 5, ui: 5120, uj: 640, n: 10 } },
  { ex: 12, pt: 'd', g: 'logf', p: { T: 'T4', p: 0.16, q: -0.2, vars: ['P', 'L'] } },
  { ex: 13, pt: 'a', g: 'min', p: { f: { 4: 48, 3: -64, 2: 24, 0: -1 } } },
  { ex: 13, pt: 'b', g: 'he', p: { n: 1, k: -2, c: 0, x0: 0, ask: 'raaklijn' } },
  { ex: 13, pt: 'c', g: 'e1', p: { a: 3, b: 4, c: 0, d: 108 } },
  { ex: 13, pt: 'd', g: 'logf', p: { T: 'T2', p: 0.2, q: -3, vars: ['R', 'Q'] } },
  { ex: 14, pt: 'a', g: 'min', p: { f: { 4: 1, 3: -4, 2: -8 } } },
  { ex: 14, pt: 'b', g: 'hwc', p: { c: 1, k: 4, l: 48, m: -1, inner: 'quad', line: 'par' } },
  { ex: 14, pt: 'c', g: 'logf', p: { T: 'T1', p: 2, q: 3, vars: ['R', 'Q'] } },
  { ex: 16, pt: 'b', g: 'quot', p: { form: 'L', a: 1, b: -2, c: 3, d: -2, ask: 'hell', m: 1, line: 'par', n: 0 } },
  { ex: 16, pt: 'c', g: 'logf', p: { T: 'T4', p: 2, q: 4, vars: ['P', 'Q'] } },
  { ex: 17, pt: 'a', g: 'snij', p: { f: { 4: 1, 2: -6, 0: 8 }, ftex: '(x^2 - 2)(x^2 - 4)', g: { 3: 1, 0: 8 }, ask: 'coords' } },
  { ex: 17, pt: 'c', g: 'hwc', p: { c: 1, k: 3, l: 24, m: -1, inner: 'quad', line: 'par' } },
  { ex: 18, pt: 'a', g: 'snij', p: { f: { 3: 1, 2: -7, 1: 15, 0: 4 }, g: { 1: 3, 0: 4 }, ask: 'coords' } },
  { ex: 18, pt: 'b', g: 'hw', p: { c: 1, k: 1, l: 5, x0: 2, inner: 'quad' } },
  { ex: 19, pt: 'a', g: 'snij', p: { f: { 4: 1, 3: 1, 2: -30 }, g: {}, xas: true, ask: 'x' } },
  { ex: 19, pt: 'c', g: 'e1', p: { a: 5, b: 4, c: 25, d: 225, s: 2, dp: 2 } },
  { ex: 20, pt: 'c', g: 'e4', p: { g: 2, u: 0, m: 5, a: 0, v: 0, n: 3, b: -1, zero: false } },
  { ex: 21, pt: 'a', g: 'min', p: { f: { 4: 3, 3: -20, 2: 36, 0: 3 } } },
  { ex: 21, pt: 'c', g: 'e4', p: { g: 3, u: 0, m: 3, a: 0, v: 0, n: 2, b: -1, zero: false } },
  { ex: 22, pt: 'a', g: 'hor', p: { f: { 3: 1, 2: 3, 1: -45, 0: 70 }, ftex: '(x - 2)(x^2 + 5x - 35)', ask: 'x' } },
  { ex: 22, pt: 'b', g: 'hwc', p: { c: 1, k: -2, l: 12, m: 2, inner: 'quad', line: 'getal' } },
  { ex: 22, pt: 'c', g: 'rij', p: { kind: 'rek', v: 2, lo: 100, hi: 1000, odd: true } },
  { ex: 23, pt: 'a', g: 'min', p: { f: { 4: 1, 3: -10, 2: 28, 0: -64 } } },
  { ex: 23, pt: 'b', g: 'quot', p: { form: 'Q', A: -1, p: 2, q: 1, d: 2, ask: 'hell', m: 1, line: 'par', n: -4 } },
  { ex: 23, pt: 'c', g: 'rij', p: { kind: 'machten', g: 3, lo: 10, hi: 10000000 } },
  { ex: 24, pt: 'c', g: 'e3', p: { a: 9, p: 4, c: 24, q: 3, dp: 4 } },
].map(b => ({ ...b, src: `Voorbeeldtentamen ${b.ex}, opgave 1${b.pt}` }));
/* deelvragen die (nog) niet in de trainer zitten */
const MISSING = { 2: ['d'], 4: ['c', 'd'], 6: ['b'], 12: ['b'], 15: ['a', 'b'], 16: ['a'], 17: ['b'], 18: ['c', 'd'], 19: ['b'], 20: ['a', 'b'], 21: ['b'], 24: ['a', 'b'] };
function makeProblem(key, params, src, lvl) {
  const G = GENS[key];
  const prm = params || G.rand(lvlOf(lvl));
  const p = G.build(JSON.parse(JSON.stringify(prm)));
  p.params = prm; p.key = key; p.src = src || null; p.topic = G.topic;
  return p;
}


const TYPE = { veelterm: 'Veeltermvergelijking', expo: 'Exponentieel of log', wortel: 'Wortelvergelijking', afgeleide: 'Afgeleide', lijnen: 'Rechte lijnen', formules: 'Formule omwerken', rijen: 'Rijen' };

/* ---------- "Hoe zat het ook alweer?" ---------- */
const THEORY = {
  soorten: ['De soorten sommen', '<ul><li><b>x alleen als macht</b> (x², x³): veeltermvergelijking.</li><li><b>x in de exponent</b> (5ˣ) of in een log: exponentieel.</li><li><b>x onder een wortel</b>: wortelvergelijking.</li><li><b>helling, raaklijn, top, minimum</b>: afgeleide.</li></ul>'],
  nul: ['Herleiden op nul', '<p>Een term die naar de andere kant gaat, wisselt van teken. Daarna mag je alles keer −1 doen, of alles delen door een getal dat in elke term zit.</p>'],
  buiten: ['Buiten haakjes en splitsen', '<p>Zit x in elke term? Haal de kleinste macht buiten haakjes, bijvoorbeeld \\(2x^3 - 6x = 2x(x^2 - 3)\\).</p><p>\\(A \\cdot B = 0\\) betekent \\(A = 0 \\vee B = 0\\).</p><p>Deel nooit door x: dan raak je \\(x = 0\\) kwijt.</p>'],
  abc: ['De abc-formule', '<p>Voor \\(ax^2 + bx + c = 0\\):</p><p>\\(D = b^2 - 4ac\\) en \\(x = \\dfrac{-b \\pm \\sqrt{D}}{2a}\\)</p><ul><li>D &gt; 0: twee oplossingen</li><li>D = 0: één oplossing</li><li>D &lt; 0: geen oplossingen</li></ul>'],
  wortelmacht: ['x tot een macht = getal', '<ul><li>Even macht, getal positief: \\(x = \\pm\\sqrt[n]{\\text{getal}}\\)</li><li>Even macht, getal negatief: geen oplossing</li><li>Oneven macht: precies één oplossing</li></ul><p>Bij \\(x^2 = 9\\) horen dus \\(x = 3\\) en \\(x = -3\\).</p>'],
  macht: ['Rekenregels voor machten', '<ul><li>\\(g^a \\cdot g^b = g^{a+b}\\)</li><li>\\(\\dfrac{g^a}{g^b} = g^{a-b}\\)</li><li>\\((g^a)^b = g^{a \\cdot b}\\)</li><li>\\(\\dfrac{a^x}{b^x} = \\left(\\dfrac{a}{b}\\right)^x\\)</li></ul><p>Handig om te herkennen: 4, 8, 16, 32 zijn machten van 2 en 9, 27, 81 van 3.</p>'],
  log: ['Logaritmen', '<ul><li>\\(g^x = a\\) betekent \\(x = {}^{g}\\log(a)\\)</li><li>Op de rekenmachine: \\({}^{g}\\log(a) = \\dfrac{\\log(a)}{\\log(g)}\\)</li><li>log heeft grondtal 10: \\(\\log(a) = b\\) betekent \\(a = 10^b\\)</li><li>ln heeft grondtal e: \\(\\ln(a) = b\\) betekent \\(a = e^b\\)</li></ul>'],
  logregels: ['Rekenregels voor log', '<ul><li>\\(\\log(a) + \\log(b) = \\log(a \\cdot b)\\)</li><li>\\(\\log(a) - \\log(b) = \\log\\left(\\dfrac{a}{b}\\right)\\)</li><li>\\(p \\cdot \\log(a) = \\log(a^p)\\)</li><li>Elk getal p is \\(\\log(10^p)\\)</li><li>\\(\\log(A) = \\log(B)\\) betekent \\(A = B\\)</li></ul><p>Voor ln werkt het precies zo, met e in plaats van 10.</p>'],
  kwadraat: ['Kwadrateren', '<ul><li>\\((a + b)^2 = a^2 + 2ab + b^2\\)</li><li>\\((a - b)^2 = a^2 - 2ab + b^2\\)</li><li>\\((\\sqrt{u})^2 = u\\) en \\((a \\cdot b)^2 = a^2 \\cdot b^2\\)</li></ul><p>Na kwadrateren altijd controleren: een wortel is nooit negatief.</p>'],
  snijpunt: ['Snijpunten', '<ul><li>Snijpunt van twee grafieken: los \\(f(x) = g(x)\\) op.</li><li>Snijpunt met de x-as: \\(f(x) = 0\\).</li><li>De y-waarde reken je uit met de formule die het minste werk is.</li></ul>'],
  afgeleide: ['Machtsregel', '<ul><li>\\((a x^n)\' = n \\cdot a \\cdot x^{n-1}\\)</li><li>\\((ax)\' = a\\) en een los getal wordt 0</li><li>Bij een som differentieer je elke term apart</li></ul><p>Voorbeeld: \\((3x^4 - 5x + 2)\' = 12x^3 - 5\\)</p>'],
  ketting: ['Kettingregel', '<p>Staat er een formule <i>in</i> een andere functie, dan: afgeleide van de buitenkant keer afgeleide van de binnenkant.</p><ul><li>\\(\\left(\\sqrt{u}\\right)\' = \\dfrac{1}{2\\sqrt{u}} \\cdot u\'\\)</li><li>\\(\\left(e^{u}\\right)\' = e^{u} \\cdot u\'\\)</li></ul><p>Voorbeeld: \\(\\left(\\sqrt{x^2 + 1}\\right)\' = \\dfrac{2x}{2\\sqrt{x^2 + 1}} = \\dfrac{x}{\\sqrt{x^2 + 1}}\\)</p>'],
  product: ['Productregel', '<p>\\((f \\cdot g)\' = f\' \\cdot g + f \\cdot g\'\\)</p><p>Gebruik hem als er twee stukken met x met elkaar vermenigvuldigd worden, zoals \\(x^2 \\cdot e^{x}\\).</p>'],
  quot: ['Quotiëntregel', '<p>\\(\\left(\\dfrac{t}{n}\\right)\' = \\dfrac{t\' \\cdot n - t \\cdot n\'}{n^2}\\)</p><p>Ezelsbruggetje: <i>"t-accent n min t n-accent, gedeeld door n kwadraat"</i>.</p><p>Een breuk is 0 als de teller 0 is.</p>'],
  emacht: ['e-machten', '<ul><li>\\((e^x)\' = e^x\\)</li><li>\\((e^{kx + c})\' = k \\cdot e^{kx + c}\\)</li><li>\\(e^0 = 1\\)</li></ul>'],
  helling: ['Helling en raaklijn', '<ul><li>De helling in \\(x = a\\) is \\(f\'(a)\\).</li><li>Horizontale raaklijn: \\(f\'(x) = 0\\).</li><li>Evenwijdig aan \\(y = ax + b\\): \\(f\'(x) = a\\).</li><li>Raaklijn \\(y = ax + b\\): a is de helling, b vind je door het punt in te vullen.</li></ul>'],
  extreem: ['Minimum en maximum', '<ul><li>Toppen vind je met \\(f\'(x) = 0\\).</li><li>De waarde van een top is \\(f(x)\\): invullen in f, niet in f′.</li><li>Gaat de grafiek aan beide kanten omhoog (zoals bij \\(+x^4\\)), dan is de kleinste topwaarde het minimum.</li></ul>'],
  lijn: ['Rechte lijnen', '<ul><li>\\(y = ax + b\\): a is de richtingscoëfficiënt (rc), b het snijpunt met de y-as.</li><li>\\(px + qy = r\\) schrijf je eerst om naar \\(y = \\ldots\\)</li><li>Evenwijdig: zelfde rc. Door \\(O(0,0)\\): b = 0.</li></ul>'],
  rij: ['Rijen', '<ul><li>Rekenkundig (steeds \\(+v\\)): som \\(= \\dfrac{n}{2}(u_1 + u_n)\\)</li><li>Meetkundig (steeds \\(\\times r\\)): som \\(= u_1 \\cdot \\dfrac{r^n - 1}{r - 1}\\)</li><li>Aantal termen: \\(\\dfrac{\\text{laatste} - \\text{eerste}}{v} + 1\\)</li></ul>'],
};
const theoryHtml = keys => [...new Set(keys)].filter(k => THEORY[k]).map(k => `<div class="th"><b>${THEORY[k][0]}</b>${THEORY[k][1]}</div>`).join('');

/* ---------- grafiek bij de som ---------- */
function plotSpec(p) {
  const q = p.params || {}, ans = p.final[0].answers;
  const P = terms => x => terms.reduce((s, [c, e]) => s + c * Math.pow(x, e), 0);
  const PM = m => x => evalP(m, x);
  const sides = () => { const m = p.prompt.match(/\\\((.*)\\\)/); const t = m ? m[1].split(' = ') : ['', '']; return [t[0], t.slice(1).join(' = ')]; };
  const eq = (L, R, lt, rt) => {
    if (lt === undefined) [lt, rt] = sides().map(s => `y = ${s}`);
    return {
      curves: [{ f: L, tex: lt }, { f: R, tex: rt }], keys: ans.length ? ans : [0], marks: ans.map(x => ({ x, y: L(x) })),
      before: 'Hier zie je elke kant van de vergelijking als grafiek. Waar ze elkaar snijden, liggen de oplossingen.',
      after: ans.length ? 'De groene punten zijn de snijpunten. Hun x-waarden zijn precies de oplossingen die je hebt gevonden.' : 'De grafieken snijden elkaar nergens. Daarom heeft deze vergelijking geen oplossingen.',
    };
  };
  const tangentSpec = (f, tex, xs, m, before, after, given) => ({ curves: [{ f, tex }], keys: xs, given, marks: xs.map((x, i) => ({ x, y: f(x), m: Array.isArray(m) ? m[i] : m })), before, after });
  switch (p.key) {
    case 'kwadr': case 'kubisch': case 'macht': return eq(P(q.lhs), P(q.rhs));
    case 'snij': {
      const s = eq(PM(q.f), PM(q.g), `f(x) = ${q.ftex || ptex(q.f)}`, q.xas ? 'y = 0' : `g(x) = ${q.gtex || ptex(q.g)}`);
      if (q.xas) s.before = 'De grafiek van f en de x-as. Waar de grafiek de x-as raakt of snijdt, liggen de oplossingen.';
      return s;
    }
    case 'e1': return eq(x => q.a * Math.pow(q.b, x + (q.s || 0)) + q.c, () => q.d);
    case 'e2': return eq(x => q.a * Math.pow(q.b, x) + q.c, x => q.d * Math.pow(q.b, x));
    case 'e3': return eq(x => q.a * Math.pow(q.p, x), x => q.c * Math.pow(q.q, x));
    case 'e4': {
      const L = x => Math.pow(q.g, q.u) * Math.pow(q.g, q.m * (x + q.a)), R = x => Math.pow(q.g, q.v) * Math.pow(q.g, q.n * (x + q.b));
      return q.zero ? eq(x => L(x) - R(x), () => 0) : eq(L, R);
    }
    case 'lg': { const h = x => q.a + q.b * Math.log10(q.c * x); const m = p.prompt.match(/h\(x\) = (.*?)\\\)/); return eq(h, () => q.d, `h(x) = ${m ? m[1] : ''}`, `y = ${q.d}`); }
    case 'wortel': {
      const f = x => Math.sqrt(q.a * x + q.b), g = x => q.m * x + q.c;
      const oplos = p.steps.find(s => s.label === 'Oplossen');
      const s = eq(f, g);
      if (q.ask === 'coords') { const m = p.prompt.match(/f\(x\) = (.*?)\\\)/), l = p.prompt.match(/y = (.*?)\\\)/); s.curves = [{ f, tex: m ? `f(x) = ${m[1]}` : 'f' }, { f: g, tex: l ? `y = ${l[1]}` : 'lijn' }]; }
      s.before = q.ask === 'coords' ? 'De grafiek van f en de lijn. Tel maar eens hoeveel snijpunten je ziet.' : 'Links de wortel, rechts de lijn. Waar ze elkaar snijden, ligt de oplossing.';
      if (oplos && oplos.answers.length > ans.length) s.after = `Kijk: er is maar ${ans.length === 1 ? 'één snijpunt' : 'geen snijpunt'}. De andere oplossing kwam door het kwadrateren en hoort er niet bij. Daarom controleer je altijd.`;
      return s;
    }
    case 'hor': return tangentSpec(PM(q.f), `f(x) = ${ptex(q.f)}`, ans, 0, 'Dit is de grafiek van f. Zoek de plekken waar hij even helemaal vlak loopt: de toppen en de dalen.', 'Op deze punten loopt de raaklijn horizontaal. De helling is daar 0, en dus ook f′(x).');
    case 'min': {
      const f = PM(q.f), xs = p.steps.find(s => s.label === 'Toppen').answers, mn = p.final[0].answers[0];
      const s = tangentSpec(f, `f(x) = ${ptex(q.f)}`, xs.filter(x => near(f(x), mn, 1e-6)), 0, 'Dit is de grafiek van f. Waar ligt het laagste punt?', `Het laagste punt van de grafiek ligt op hoogte ${plain(mn)}. Dat is de minimale waarde.`);
      s.keys = xs; s.marks.forEach(m => m.lab = `min = ${fmt(m.y)}`);
      return s;
    }
    case 'par': {
      const s = tangentSpec(PM(q.f), `f(x) = ${ptex(q.f)}`, ans, q.m, 'De grafiek van f en de lijn ℓ (gestippeld). Je zoekt de plekken waar de grafiek net zo schuin loopt als ℓ.', 'De groene raaklijnen lopen precies evenwijdig aan ℓ. Ze hebben dezelfde helling.');
      s.curves.push({ f: x => q.m * x + q.n, tex: `\\ell: y = ${poly([[q.m, 1], [q.n, 0]])}` });
      return s;
    }
    case 'hw': case 'hwc': {
      const f = x => q.c * Math.sqrt(q.inner === 'quad' ? q.k * x * x + q.l : q.k * x + q.l);
      const tex = `g(x) = ${(p.prompt.match(/g\(x\) = (.*?)\\\)/) || [])[1] || ''}`;
      if (p.key === 'hw') return tangentSpec(f, tex, [q.x0], ans[0], 'Het punt uit de vraag ligt op de grafiek. De helling daar vertelt hoe steil de grafiek in dat punt loopt.', 'De groene raaklijn heeft precies de helling die je hebt uitgerekend.', { x: q.x0, y: f(q.x0) });
      return tangentSpec(f, tex, ans, q.m, `Dit is de grafiek van g. Op welke plek loopt hij precies zo steil dat de helling ${plain(q.m)} is?`, 'Hier is de helling precies goed. De andere x die je vond, ligt aan de verkeerde kant: daar loopt de grafiek juist de andere kant op.');
    }
    case 'he': {
      const f = x => Math.pow(x, q.n) * Math.exp(q.k * x + q.c);
      const tex = `h(x) = ${(p.prompt.match(/h\(x\) = (.*?)\\\)/) || [])[1] || ''}`;
      return tangentSpec(f, tex, [q.x0], ans[0], 'Het punt uit de vraag ligt op de grafiek. De helling daar vertelt hoe steil de grafiek in dat punt loopt.', 'De groene raaklijn heeft precies de helling die je hebt uitgerekend.', { x: q.x0, y: f(q.x0) });
    }
    case 'quot': {
      const Z = quotParts(q), g = x => Z.tf(x) / Z.nf(x);
      const tex = `g(x) = ${(p.prompt.match(/g\(x\) = (.*?)\\\)\./) || [])[1] || ''}`;
      if (q.ask === 'punt') return tangentSpec(g, tex, [q.x0], ans[0], 'Het punt uit de vraag ligt op de grafiek. Hoe steil loopt de grafiek daar?', 'De groene raaklijn heeft precies de helling die je hebt uitgerekend.', { x: q.x0, y: g(q.x0) });
      if (q.ask === 'hor') return tangentSpec(g, tex, ans, 0, 'Dit is de grafiek van g. Waar loopt hij even helemaal vlak?', 'Op deze punten is de raaklijn horizontaal: de teller van g′(x) is daar 0.');
      return tangentSpec(g, tex, ans, q.m, `Dit is de grafiek van g. Op twee plekken is de helling precies ${plain(q.m)}.`, `In deze punten is de helling precies ${plain(q.m)}.`);
    }
    case 'lijn': {
      const rc = -q.p / q.q, x = p.final[0].answers[0];
      return { curves: [{ f: v => q.a * v + q.b, tex: `\\ell: y = ${poly([[q.a, 1], [q.b, 0]])}` }, { f: v => rc * v, tex: `m: y = ${poly([[rc, 1]])}` }], keys: [x, 0], marks: [{ x, y: rc * x }],
        before: 'Lijn ℓ en lijn m (gestippeld, door de oorsprong). Waar kruisen ze elkaar?', after: 'Hier snijden de lijnen elkaar.' };
    }
  }
  return null;
}

/* ---------- onderwerpen zoals de leerling ze ziet ---------- */
const TOPICS = [
  { id: 'veelterm', title: 'Tweede- en hogeregraads\u00ADvergelijkingen', short: 'Hogeregraadsvergelijkingen', blurb: 'Buiten haakjes halen en de abc-formule', color: '#2563eb', soft: '#e6f0ff', art: 'veelterm' },
  { id: 'expo', title: 'Exponentiële en logaritmische vergelijkingen', short: 'Exponentiële vergelijkingen', blurb: 'x in de exponent of in een log', color: '#7c3aed', soft: '#efe7ff', art: 'expo' },
  { id: 'wortel', title: 'Wortelvergelijkingen', short: 'Wortelvergelijkingen', blurb: 'Kwadrateren en daarna controleren', color: '#0d9488', soft: '#e0f7f5', art: 'wortel' },
  { id: 'afgeleide', title: 'Differentiëren', short: 'Differentiëren', blurb: 'Helling, raaklijn, top of minimum', color: '#db2777', soft: '#ffe8f1', art: 'afgeleide' },
  { id: 'formules', title: 'Formules herleiden met logaritmen', short: 'Formules herleiden', blurb: 'Van log(R) = … naar R = …', color: '#ea580c', soft: '#fff0e5', art: 'formules' },
  { id: 'lijnen', title: 'Lineaire functies', short: 'Lineaire functies', blurb: 'Richtingscoëfficiënt en snijpunten', color: '#0891b2', soft: '#e0f4f9', art: 'lijnen' },
  { id: 'rijen', title: 'Rekenkundige en meetkundige rijen', short: 'Rijen', blurb: 'Rekenkundig, meetkundig en somformules', color: '#ca8a04', soft: '#fdf6dc', art: 'rijen' },
];

/* ---------- wat de app van deze cursus gebruikt ---------- */
const COURSE = {
  id: 'wiskunde-a-opgave-1',
  subject: 'Wiskunde A',
  title: 'Opgave 1',
  topics: TOPICS,
  typeNames: TYPE,
  gens: GENS,
  bank: BANK,
  missing: MISSING,
  theory: THEORY,
  makeProblem,
  checkAns,
  ansText,
  plotSpec,
};
