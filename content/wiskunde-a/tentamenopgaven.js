/*
 * Wiskunde A · Tentamenopgaven
 * Hele opgaven zoals op het CCVX-tentamen: één verhaal met een figuur en deelvragen
 * a, b, c, … die op elkaar voortbouwen. De opbouw volgt de voorbeeldtentamens (zie
 * analyse/wiskunde-a); de verhalen en getallen zijn eigen werk en elke keer anders.
 * maakOnderdeel pakt TENTAMENOPGAVEN[onderdeel] er vanzelf bij.
 */
const binC = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
const binP = (n, k, p) => binC(n, k) * p ** k * (1 - p) ** (n - k);
const binCdf = (n, k, p) => { let s = 0; for (let i = 0; i <= k; i++) s += binP(n, i, p); return s; };
const opgPhi = z => { const x = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * x), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return 0.5 * (1 + (z >= 0 ? y : -y)); };
const sigma = k => (k === 0 ? '\\mu' : `\\mu ${k > 0 ? '+' : '-'} ${Math.abs(k) === 0.5 ? '\\tfrac12' : Math.abs(k) === 1.5 ? '1\\tfrac12' : Math.abs(k) === 1 ? '' : Math.abs(k)}\\sigma`);
const euro = (x, dp = 2) => `€ ${dec(x, dp)}`;
const plotFig = (f, tex, keys, onderschrift, extra = {}) => ({ soort: 'plot', curves: [{ f, tex }, ...(extra.lijnen || [])], keys, marks: [], domain: [0, Infinity], onderschrift, ...extra });

const TENTAMENOPGAVEN = {
  /* ================= normale verdeling en toetsen ================= */
  normaal: {
    gewicht: {
      titel: 'Gewicht in de verpakking', soort: 'Normale verdeling',
      rand: () => {
        const c = ri(0, 2), C = [
          { wat: 'appels', een: 'appel', mu: [180, 200], sd: [10, 12], doos: 'kistje', dmu: 300, dsd: 12, wie: 'Een fruitteler' },
          { wat: 'eieren', een: 'ei', mu: [60, 64], sd: [4, 5], doos: 'doos', dmu: 40, dsd: 3, wie: 'Een kippenboer' },
          { wat: 'tomaten', een: 'tomaat', mu: [90, 100], sd: [6, 8], doos: 'bakje', dmu: 20, dsd: 2, wie: 'Een kweker' },
        ][c];
        return { c, mu: pick(C.mu), sd: pick(C.sd), g: ri(0, 3), N: pick([2000, 2500, 4000, 5000]), n: pick([4, 9, 16]), k: pick([0, 1, 2]), m: pick([6, 8, 10]), j: ri(1, 3) };
      },
      build({ c, mu, sd, g, N, n, k, m, j }) {
        const C = [
          { wat: 'appels', een: 'appel', doos: 'kistje', dmu: 300, dsd: 12, wie: 'Een fruitteler' },
          { wat: 'eieren', een: 'ei', doos: 'doos', dmu: 40, dsd: 3, wie: 'Een kippenboer' },
          { wat: 'tomaten', een: 'tomaat', doos: 'bakje', dmu: 20, dsd: 2, wie: 'Een kweker' },
        ][c];
        // gegeven figuur (zoals op het tentamen) en de staart die je ermee kunt berekenen
        const G = [
          { van: 0.5, tot: 1, p: 0.150, a: 0.5, b: Infinity, ans: 0.31, hoe: '0{,}150 + 0{,}16' },
          { van: 0, tot: 0.5, p: 0.192, a: 0.5, b: Infinity, ans: 0.308, hoe: '0{,}5 - 0{,}192' },
          { van: 1.5, tot: 2, p: 0.044, a: 1.5, b: Infinity, ans: 0.069, hoe: '0{,}044 + 0{,}025' },
          { van: -1.5, tot: -1, p: 0.092, a: -Infinity, b: -1.5, ans: 0.068, hoe: '0{,}16 - 0{,}092' },
        ][g];
        const grens = isFinite(G.a) ? mu + G.a * sd : mu + G.b * sd, k2 = isFinite(G.a) ? G.a : G.b;
        const meer = isFinite(G.a), bereik = `${meer ? 'meer' : 'minder'} dan ${nl(grens)} gram`;
        const ES = n * mu, sS = Math.sqrt(n) * sd, ET = ES + C.dmu, sT = Math.hypot(sS, C.dsd);
        const drempel = ES + k * sS, pc = [0.5, 0.16, 0.025][k];
        const pd = binP(m, j, G.ans);
        const waarden = z => nl(mu + z * sd);
        return {
          intro: `<p>${C.wie} verkoopt ${C.wat}. Het gewicht van een ${C.een} is normaal verdeeld met een gemiddelde van ${mu} gram en een standaardafwijking van ${sd} gram.</p>`,
          figuur: { soort: 'normaal', van: G.van, tot: G.tot, waarden, onderschrift: `De oppervlakte van het gearceerde vlakdeel is \\(P(${sigma(G.van)} < X < ${sigma(G.tot)}) = ${td(G.p)}\\).` },
          delen: [
            {
              pt: 'a', topic: 'nv-figuur', pts: 4,
              prompt: `${C.wie} heeft ${N} ${C.wat}. Gebruik de figuur om het verwachte aantal ${C.wat} te berekenen met een gewicht van ${bereik}.`,
              steps: [
                mc('Grens', `Hoe schrijf je ${nl(grens)} gram met μ en σ?`, [
                  opt(M(`${td(grens)} = ${sigma(k2)}`), true, `Klopt: ${td(grens)} − ${mu} = ${td(k2 * sd)} = ${td(Math.abs(k2))} keer σ.`),
                  opt(M(`${td(grens)} = ${sigma(-k2)}`), false, 'Kijk of de grens boven of onder het gemiddelde ligt.'),
                  opt(M(`${td(grens)} = ${sigma(k2 > 0 ? k2 + 0.5 : k2 - 0.5)}`), false, `Reken het verschil met μ uit en deel door σ = ${sd}.`),
                ], { th: ['nv-figuur'], write: [`${td(grens)} = ${sigma(k2)}`] }),
                num('Kans', 'Combineer het gearceerde stuk met de vuistregels. Hoe groot is de kans? Rond af op 3 decimalen.', [G.ans], {
                  dp: 3, hint: 'Tussen μ en μ + σ ligt 0,34 en boven μ + σ ligt 0,16 (vuistregels). Gebruik ook de symmetrie.',
                  fig: { soort: 'normaal', van: meer ? G.a : -Infinity, tot: meer ? Infinity : G.b, waarden, onderschrift: 'Gevraagd: het gekleurde stuk.' },
                  write: [`P = ${G.hoe} = ${td(G.ans)}`],
                }),
                num('Aantal', `Hoeveel van de ${N} ${C.wat} zijn dat naar verwachting?`, [N * G.ans], { dp: 0, write: [`${td(G.ans)} \\cdot ${N} ${eqd(N * G.ans, 0)}`] }),
              ],
              final: [{ label: 'aantal', answers: [N * G.ans], dp: 0 }],
              verify: () => Math.abs((meer ? 1 - opgPhi(G.a) : opgPhi(G.b)) - G.ans) < 0.006 && Math.abs(opgPhi(G.tot) - opgPhi(G.van) - G.p) < 0.001,
            },
            {
              pt: 'b', topic: 'nv-som', pts: 4,
              info: `<p>De ${C.wat} worden per ${n} verpakt in een ${C.doos}. Het gewicht van een leeg ${C.doos} is normaal verdeeld met een gemiddelde van ${C.dmu} gram en een standaardafwijking van ${C.dsd} gram.</p>`,
              prompt: `Bereken het gemiddelde en de standaardafwijking van het totale gewicht van een gevuld ${C.doos}.`,
              steps: [
                num('Som', `Wat is het gemiddelde totale gewicht van de ${n} ${C.wat} samen?`, [ES], { dp: 0, th: ['nv-som'], write: [`E(S) = ${n} \\cdot ${mu} = ${ES}`] }),
                mc('√n-wet', `Hoe groot is de standaardafwijking van het gewicht van de ${n} ${C.wat} samen?`, [
                  opt(M(`\\sigma(S) = \\sqrt{${n}} \\cdot ${sd} = ${td(sS)}`), true, 'Klopt: de √n-wet voor een som.'),
                  opt(M(`\\sigma(S) = ${n} \\cdot ${sd} = ${n * sd}`), false, 'De spreiding groeit niet met n, maar met √n.'),
                  opt(M(`\\sigma(S) = ${sd} / \\sqrt{${n}} = ${td(sd / Math.sqrt(n), 2)}`), false, 'Delen door √n hoort bij het gemiddelde, niet bij de som.'),
                ], { write: [`\\sigma(S) = \\sqrt{${n}} \\cdot ${sd} = ${td(sS)}`] }),
                num('Gemiddelde', `En het gemiddelde gewicht van een gevuld ${C.doos}?`, [ET], { dp: 0, write: [`E(T) = ${ES} + ${C.dmu} = ${ET}`] }),
                num('Spreiding', `Bereken de standaardafwijking van een gevuld ${C.doos}. Rond af op 2 decimalen.`, [sT], {
                  dp: 2, hint: 'Op de formulelijst: σ(X + Y) = √(σ²(X) + σ²(Y)). Je telt de kwadraten op, niet de standaardafwijkingen.',
                  write: [`\\sigma(T) = \\sqrt{${td(sS)}^2 + ${C.dsd}^2} ${eqd(sT, 2)}`],
                }),
              ],
              final: [{ label: 'gemiddelde', answers: [ET], dp: 0 }, { label: 'σ', answers: [sT], dp: 2 }],
              verify: () => near(sT * sT, n * sd * sd + C.dsd * C.dsd, 1e-6),
            },
            {
              pt: 'c', topic: 'nv-vuistregels', pts: 3,
              prompt: `Bereken met de vuistregels de kans dat de ${n} ${C.wat} in een ${C.doos} samen meer dan ${nl(drempel)} gram wegen.`,
              steps: [
                mc('Grens', `Hoe ligt ${nl(drempel)} ten opzichte van E(S) = ${ES} en σ(S) = ${td(sS)}?`, [
                  opt(M(`${td(drempel)} = ${k === 0 ? 'E(S)' : `E(S) + ${k === 1 ? '' : k}\\sigma(S)`}`), true, 'Klopt.'),
                  opt(M(`${td(drempel)} = E(S) + ${k + 1}\\sigma(S)`), false, `Reken ${td(drempel)} − ${ES} uit en deel door ${td(sS)}.`),
                  k ? opt(M(`${td(drempel)} = E(S) - ${k === 1 ? '' : k}\\sigma(S)`), false, `${td(drempel)} is meer dan ${ES}, dus de grens ligt rechts.`) : null,
                ], { th: ['nv-vuistregels', 'nv-som'], write: [`${td(drempel)} = ${k === 0 ? 'E(S)' : `E(S) + ${k === 1 ? '' : k}\\sigma(S)`}`] }),
                num('Kans', 'Hoe groot is de kans volgens de vuistregels?', [pc], {
                  dp: 3, hint: 'Rechts van μ ligt 0,5, rechts van μ + σ ligt 0,16 en rechts van μ + 2σ ligt 0,025.',
                  fig: { soort: 'normaal', van: k, tot: Infinity, labels: [-2, -1, 0, 1, 2], waarden: z => nl(ES + z * sS), onderschrift: `De verdeling van het totale gewicht S van ${n} ${C.wat}.` },
                  write: [`P(S > ${td(drempel)}) = ${td(pc)}`],
                }),
              ],
              final: [{ label: 'P', answers: [pc], dp: 3 }],
              verify: () => Math.abs(1 - opgPhi(k) - pc) < 0.01,
            },
            {
              pt: 'd', topic: 'nv-binom', pts: 5,
              prompt: `Iemand kiest willekeurig ${m} ${C.wat} uit de grote voorraad. Bereken de kans dat precies ${j} daarvan een gewicht van ${bereik} hebben. Rond af op 4 decimalen.`,
              steps: [
                mc('Kans per stuk', `Wat is de kans dat één ${C.een} een gewicht van ${bereik} heeft?`, [
                  opt(M(`p = ${td(G.ans)}`), true, 'Klopt: die kans heb je bij vraag a al berekend.'),
                  opt(M(`p = ${td(1 - G.ans)}`), false, 'Dat is de kans op het andere stuk van de klok.'),
                  opt(M(`p = ${td(G.p)}`), false, 'Dat is alleen het gearceerde stuk uit de figuur.'),
                ], { th: ['nv-binom'], write: [`p = ${td(G.ans)}`] }),
                mc('Binomiaal', 'Welke berekening hoort erbij?', [
                  opt(M(`\\binom{${m}}{${j}} \\cdot ${td(G.ans)}^{${j}} \\cdot ${td(1 - G.ans)}^{${m - j}}`), true, 'Klopt: binomiaal, want elke ' + C.een + ' is een losse herhaling.'),
                  opt(M(`${td(G.ans)}^{${j}} \\cdot ${td(1 - G.ans)}^{${m - j}}`), false, `Je vergeet het aantal volgordes \\(\\binom{${m}}{${j}}\\).`),
                  opt(M(`\\binom{${m}}{${j}} \\cdot ${td(G.ans)}^{${j}}`), false, `De andere ${m - j} moeten juist níet in dat stuk vallen.`),
                ], {}),
                num('Kans', 'Reken uit. Rond af op 4 decimalen.', [pd], { dp: 4, write: [`P(X = ${j}) = \\binom{${m}}{${j}} \\cdot ${td(G.ans)}^{${j}} \\cdot ${td(1 - G.ans)}^{${m - j}} ${eqd(pd, 4)}`] }),
              ],
              final: [{ label: 'P', answers: [pd], dp: 4 }],
              verify: () => { let s = 0; for (let i = 0; i <= m; i++) s += binP(m, i, G.ans); return near(s, 1, 1e-9) && pd > 0 && pd < 1; },
            },
          ],
        };
      },
    },

    eerlijk: {
      titel: 'Eerlijk of niet?', soort: 'Binomiaal toetsen',
      rand: () => {
        const c = ri(0, 2), n = pick([20, 25, 30, 40, 50]);
        const C = [{ p0: 0.5, kant: '<' }, { p0: 1 / 6, kant: '>' }, { p0: 0.8, kant: '<' }][c];
        // een uitkomst die net wel of net niet significant is
        const ks = [];
        for (let k = 0; k <= n; k++) { const ov = C.kant === '<' ? binCdf(n, k, C.p0) : 1 - binCdf(n, k - 1, C.p0); if (ov > 0.008 && ov < 0.2) ks.push(k); }
        return { c, n, k: pick(ks), m: pick([5, 6, 8]), j: pick([2, 3]) };
      },
      build({ c, n, k, m, j }) {
        const C = [
          { p0: 0.5, kant: '<', wie: 'Diederik', intro: 'Diederik is scheidsrechter. Hij heeft geen munt bij zich en tost met een bierviltje: de bedrukte kant boven (B) of niet (N).', twijfel: 'Diederik denkt dat de bedrukte kant minder vaak boven komt dan de andere kant.', gelijk: 'de bedrukte kant komt minder vaak boven', poging: 'keer gooien', succes: 'de bedrukte kant boven', p: 'p = P(\\text{bedrukte kant boven})' },
          { p0: 1 / 6, kant: '>', wie: 'Fatima', intro: 'Fatima speelt een bordspel met een oude dobbelsteen. Bij elke worp noteert ze of het een zes is (Z) of niet (N).', twijfel: 'Fatima denkt dat deze dobbelsteen vaker zes geeft dan een eerlijke dobbelsteen.', gelijk: 'de dobbelsteen geeft vaker zes', poging: 'keer gooien', succes: 'een zes', p: 'p = P(\\text{zes})' },
          { p0: 0.8, kant: '<', wie: 'Een consumentenprogramma', intro: 'Een webwinkel beweert dat 80% van de klanten tevreden is. Een consumentenprogramma vraagt klanten of ze tevreden zijn (T) of niet (N).', twijfel: 'Het programma denkt dat minder dan 80% van de klanten tevreden is.', gelijk: 'minder dan 80% van de klanten is tevreden', poging: 'klanten ondervragen', succes: 'een tevreden klant', p: 'p = P(\\text{tevreden})' },
        ][c];
        const p0 = C.p0, p0t = c === 1 ? '\\tfrac16' : td(p0), letter = ['B', 'Z', 'T'][c];
        const series = binC(m, j), pk = binP(n, k, p0);
        const ov = C.kant === '<' ? binCdf(n, k, p0) : 1 - binCdf(n, k - 1, p0), ovTxt = C.kant === '<' ? `P(X \\leq ${k})` : `P(X \\geq ${k})`;
        const verwerp = ov < 0.05;
        return {
          intro: `<p>${C.intro}</p>`,
          figuur: null,
          delen: [
            {
              pt: 'a', topic: 'kans-tellen', pts: 3,
              prompt: `Een serie van ${m} uitkomsten ziet er bijvoorbeeld zo uit: ${letter}N${letter}NN${'N'.repeat(Math.max(0, m - 5))}. Hoeveel verschillende series van ${m} zijn er met precies ${j} keer ${letter}?`,
              steps: [
                mc('Tellen', `Je kiest de ${j} plekken waar ${letter} staat. Welke berekening past?`, [
                  opt(M(`\\binom{${m}}{${j}}`), true, `Klopt: je kiest ${j} plekken uit ${m}, de volgorde van die plekken telt niet.`),
                  opt(M(`2^{${m}}`), false, 'Dat zijn álle series, ook die met een ander aantal.'),
                  opt(M(`${m} \\cdot ${j}`), false, 'Dat telt niet hoe je de plekken kunt kiezen.'),
                ], { th: ['kans-tellen'], write: [`\\binom{${m}}{${j}}`] }),
                num('Aantal', 'Hoeveel series zijn dat?', [series], { dp: 0, write: [`\\binom{${m}}{${j}} = ${series}`] }),
              ],
              final: [{ label: 'aantal', answers: [series], dp: 0 }],
              verify: () => { let t = 0; for (let x = 0; x < 2 ** m; x++) if (x.toString(2).split('1').length - 1 === j) t++; return t === series; },
            },
            {
              pt: 'b', topic: 'toets-hyp', pts: 2,
              info: `<p>${C.twijfel} Om dat te onderzoeken gaat ${C.wie === 'Een consumentenprogramma' ? 'het programma' : C.wie} ${n} ${C.poging}. X is het aantal keer ${C.succes}.</p>`,
              prompt: 'Formuleer de nulhypothese en de alternatieve hypothese voor deze toetsingsprocedure.',
              steps: [
                mc('H₀', 'Wat is de nulhypothese?', [
                  opt(M(`H_0: p = ${p0t}`), true, 'Klopt: H₀ gaat uit van de normale situatie, met een is-teken.'),
                  opt(M(`H_0: p ${C.kant} ${p0t}`), false, 'Dat is het vermoeden: dat hoort bij H₁.'),
                  opt(M(`H_0: \\mu = ${p0t}`), false, 'Het gaat om een kans, dus p, niet om een gemiddelde μ.'),
                ], { th: ['toets-hyp'], write: [`${C.p}`, `H_0: p = ${p0t}`] }),
                mc('H₁', 'Wat is de alternatieve hypothese?', [
                  opt(M(`H_1: p < ${p0t}`), C.kant === '<', C.kant === '<' ? 'Klopt: "minder vaak" geeft <.' : 'Lees nog eens wat er vermoed wordt.'),
                  opt(M(`H_1: p > ${p0t}`), C.kant === '>', C.kant === '>' ? 'Klopt: "vaker" geeft >.' : 'Lees nog eens wat er vermoed wordt.'),
                  opt(M(`H_1: p \\neq ${p0t}`), false, 'Er wordt maar één kant op getwijfeld.'),
                ], { keepOrder: true, write: [`H_1: p ${C.kant} ${p0t}`] }),
              ],
              final: [{ label: 'p onder H₀', answers: [p0], dp: 3 }],
              verify: () => true,
            },
            {
              pt: 'c', topic: 'kans-binom', pts: 4,
              info: `<p>Bij ${k} van de ${n} keer is de uitkomst ${C.succes}.</p>`,
              prompt: `Bereken de kans op precies ${k} keer ${C.succes}, als de nulhypothese waar is. Rond af op 4 decimalen.`,
              steps: [
                mc('Formule', 'Welke berekening past?', [
                  opt(M(`\\binom{${n}}{${k}} \\cdot ${p0t}^{${k}} \\cdot (1 - ${p0t})^{${n - k}}`), true, 'Klopt: X is binomiaal verdeeld met n = ' + n + ' en p = ' + nl(p0, 3) + '.'),
                  opt(M(`${p0t}^{${k}} \\cdot (1 - ${p0t})^{${n - k}}`), false, 'Je mist het aantal volgordes.'),
                  opt(M(`\\binom{${n}}{${k}} \\cdot ${p0t}^{${n - k}} \\cdot (1 - ${p0t})^{${k}}`), false, 'De exponenten zijn omgedraaid.'),
                ], { th: ['kans-binom'], write: [`P(X = ${k}) = \\binom{${n}}{${k}} \\cdot ${p0t}^{${k}} \\cdot (1 - ${p0t})^{${n - k}}`] }),
                num('Kans', 'Reken uit. Rond af op 4 decimalen.', [pk], { dp: 4, write: [`P(X = ${k}) ${eqd(pk, 4)}`] }),
              ],
              final: [{ label: 'P', answers: [pk], dp: 4 }],
              verify: () => near(binCdf(n, n, p0), 1, 1e-9),
            },
            {
              pt: 'd', topic: 'toets-conclusie', pts: 4,
              prompt: `Kun je met de kans uit vraag c een conclusie trekken? Zo nee: welke kans heb je nodig? Wat is de conclusie bij een significantieniveau van 5%?`,
              steps: [
                mc('Welke kans', 'Is de kans op precies ' + k + ' genoeg om te beslissen?', [
                  opt(`Nee, ik heb de overschrijdingskans \\(${ovTxt}\\) nodig`, true, `Klopt: je kijkt naar de kans op deze uitkomst of nog ${C.kant === '<' ? 'minder' : 'meer'}.`),
                  opt('Ja, als die kans kleiner is dan 0,05 verwerp je H₀', false, 'Een kans op precies één uitkomst is bijna altijd klein. Je hebt de kans op deze uitkomst of nog extremer nodig.'),
                  opt(`Nee, ik heb \\(P(X = ${n - k})\\) nodig`, false, 'Dat is niet de kant van H₁.'),
                ], { th: ['toets-conclusie'], write: [`\\text{overschrijdingskans: } ${ovTxt}`] }),
                mc('Vergelijken', `Met de rekenmachine vind je \\(${ovTxt} ${eqd(ov, 4)}\\). Wat volgt daaruit?`, [
                  opt(`\\(${td(ov, 4)} ${verwerp ? '<' : '>'} 0{,}05\\)`, true, verwerp ? 'Klopt: kleiner dan α.' : 'Klopt: groter dan α.'),
                  opt(`\\(${td(ov, 4)} ${verwerp ? '>' : '<'} 0{,}05\\)`, false, 'Vergelijk de getallen nog eens.'),
                ], { keepOrder: true, write: [`${ovTxt} ${eqd(ov, 4)} ${verwerp ? '<' : '>'} 0{,}05`] }),
                mc('Conclusie', 'Wat is de conclusie?', [
                  opt(`H₀ wordt verworpen: ${C.gelijk}`, verwerp, verwerp ? 'Klopt.' : 'De overschrijdingskans is niet klein genoeg.'),
                  opt('H₀ wordt niet verworpen: er is onvoldoende reden om aan de normale situatie te twijfelen', !verwerp, !verwerp ? 'Klopt: het kan nog goed toeval zijn.' : 'De overschrijdingskans is kleiner dan 0,05.'),
                ], { keepOrder: true, write: [verwerp ? '\\text{H}_0 \\text{ verwerpen}' : '\\text{H}_0 \\text{ niet verwerpen}'] }),
              ],
              final: [{ label: 'overschrijdingskans', answers: [ov], dp: 4 }],
              verify: () => (C.kant === '<' ? binCdf(n, k, p0) : 1 - binCdf(n, k - 1, p0)) === ov,
            },
          ],
        };
      },
    },

    gemiddelde: {
      titel: 'Klopt het etiket?', soort: 'Toetsen met de normale verdeling',
      rand: () => {
        const c = ri(0, 2), n = pick([16, 25, 36, 49, 64]);
        return { c, n, a: pick([0.05, 0.01]), r: pick([0.6, 0.9, 1.2, 1.4]) };
      },
      build({ c, n, a, r }) {
        const C = [
          { ding: 'pakken hagelslag', label: 'De fabrikant van een merk hagelslag zegt dat een pak gemiddeld 400 gram bevat.', mu: 400, sd: 6, eenheid: 'gram', kant: '<', twijfel: 'Een consumentenorganisatie denkt dat er gemiddeld minder in zit.' },
          { ding: 'flesjes frisdrank', label: 'Een vulmachine moet flesjes vullen met gemiddeld 330 ml.', mu: 330, sd: 4, eenheid: 'ml', kant: '≠', twijfel: 'De kwaliteitscontroleur wil weten of de machine nog goed is afgesteld: niet te veel en niet te weinig.' },
          { ding: 'batterijen', label: 'Een fabrikant zegt dat zijn batterijen gemiddeld 120 uur meegaan.', mu: 120, sd: 10, eenheid: 'uur', kant: '>', twijfel: 'Na een verbetering denkt de fabrikant dat ze nu langer meegaan.' },
        ][c];
        const sT = C.sd / Math.sqrt(n), zt = C.kant === '≠' ? (a === 0.05 ? 1.96 : 2.58) : (a === 0.05 ? 1.645 : 2.33);
        const gl = C.mu - zt * sT, gr = C.mu + zt * sT;
        const dir = C.kant === '<' ? -1 : 1, xbar = +(C.mu + dir * r * zt * sT).toFixed(1);
        const inGebied = C.kant === '<' ? xbar <= gl : C.kant === '>' ? xbar >= gr : (xbar <= gl || xbar >= gr);
        const teken = { '<': '<', '>': '>', '≠': '\\neq' }[C.kant];
        const grensTxt = C.kant === '<' ? `g = ${C.mu} - ${td(zt)} \\cdot ${td(sT, 3)} ${eqd(gl, 2)}` : C.kant === '>' ? `g = ${C.mu} + ${td(zt)} \\cdot ${td(sT, 3)} ${eqd(gr, 2)}` : `g_l = ${C.mu} - ${td(zt)} \\cdot ${td(sT, 3)} ${eqd(gl, 2)},\\; g_r ${eqd(gr, 2)}`;
        return {
          intro: `<p>${C.label} De hoeveelheid is normaal verdeeld met een standaardafwijking van ${C.sd} ${C.eenheid}. ${C.twijfel}</p><p>Er wordt een steekproef van ${n} ${C.ding} genomen. De toetsingsgrootheid T is het gemiddelde van de steekproef. Het significantieniveau is ${nl(a * 100)}%.</p>`,
          figuur: null,
          delen: [
            {
              pt: 'a', topic: 'toets-hyp', pts: 2, prompt: 'Formuleer de nulhypothese en de alternatieve hypothese.',
              steps: [
                mc('H₀', 'Wat is de nulhypothese?', [
                  opt(M(`H_0: \\mu = ${C.mu}`), true, 'Klopt: wat beweerd wordt, met een is-teken.'),
                  opt(M(`H_0: \\mu ${teken} ${C.mu}`), false, 'Dat is het vermoeden: dat hoort bij H₁.'),
                  opt(M(`H_0: p = ${C.mu}`), false, 'Het gaat om een gemiddelde, dus μ.'),
                ], { th: ['toets-hyp'], write: [`H_0: \\mu = ${C.mu}`] }),
                mc('H₁', 'Wat is de alternatieve hypothese?', [
                  opt(M(`H_1: \\mu < ${C.mu}`), C.kant === '<', 'Lees goed welke kant op getwijfeld wordt.'),
                  opt(M(`H_1: \\mu > ${C.mu}`), C.kant === '>', 'Lees goed welke kant op getwijfeld wordt.'),
                  opt(M(`H_1: \\mu \\neq ${C.mu}`), C.kant === '≠', 'Lees goed welke kant op getwijfeld wordt.'),
                ], { keepOrder: true, write: [`H_1: \\mu ${teken} ${C.mu}`] }),
              ],
              final: [{ label: 'μ', answers: [C.mu], dp: 0 }], verify: () => true,
            },
            {
              pt: 'b', topic: 'toets-param', pts: 3, prompt: 'Bereken de parameters \\(\\mu_T\\) en \\(\\sigma_T\\) van de toetsingsgrootheid.',
              steps: [
                num('μ_T', 'Wat is \\(\\mu_T\\) als H₀ waar is?', [C.mu], { dp: 1, th: ['toets-param'], write: [`\\mu_T = ${C.mu}`] }),
                num('σ_T', `Bereken \\(\\sigma_T\\) met de √n-wet. Rond af op 3 decimalen.`, [sT], { dp: 3, hint: 'Voor een gemiddelde deel je σ door √n.', write: [`\\sigma_T = \\dfrac{${C.sd}}{\\sqrt{${n}}} ${eqd(sT, 3)}`] }),
              ],
              final: [{ label: 'μ_T', answers: [C.mu], dp: 1 }, { label: 'σ_T', answers: [sT], dp: 3 }],
              verify: () => near(sT * Math.sqrt(n), C.sd, 1e-9),
            },
            {
              pt: 'c', topic: 'toets-conclusie', pts: 3,
              prompt: `Bereken met de formulelijst de grens${C.kant === '≠' ? 'en' : ''} van het verwerpingsgebied. Rond af op 2 decimalen.`,
              steps: [
                mc('Formulelijst', 'Welke regel van de formulelijst hoort hierbij?', [
                  opt(M(C.kant === '<' ? `g = \\mu_T - ${td(zt)}\\sigma_T` : C.kant === '>' ? `g = \\mu_T + ${td(zt)}\\sigma_T` : `g_{l,r} = \\mu_T \\mp ${td(zt)}\\sigma_T`), true, `Klopt: ${C.kant === '≠' ? 'tweezijdig' : C.kant === '<' ? 'linkszijdig' : 'rechtszijdig'} met α = ${td(a)}.`),
                  opt(M(C.kant === '≠' ? `g = \\mu_T + ${td(a === 0.05 ? 1.645 : 2.33)}\\sigma_T` : `g_{l,r} = \\mu_T \\mp ${td(a === 0.05 ? 1.96 : 2.58)}\\sigma_T`), false, 'Kijk of de toets links-, rechts- of tweezijdig is.'),
                  opt(M(`g = \\mu_T ${C.kant === '>' ? '-' : '+'} ${td(zt)}\\sigma_T`), false, 'De grens ligt aan de kant van H₁.'),
                ], { th: ['toets-conclusie'], write: [grensTxt] }),
                num('Grens', `Reken de grens${C.kant === '≠' ? 'en' : ''} uit.`, C.kant === '<' ? [gl] : C.kant === '>' ? [gr] : [gl, gr], { dp: 2, write: [] }),
              ],
              final: [{ label: 'g', answers: C.kant === '<' ? [gl] : C.kant === '>' ? [gr] : [gl, gr], dp: 2 }],
              verify: () => Math.abs(opgPhi((gr - C.mu) / sT) - (C.kant === '≠' ? 1 - a / 2 : 1 - a)) < 0.002,
            },
            {
              pt: 'd', topic: 'toets-conclusie', pts: 3,
              info: `<p>In de steekproef is het gemiddelde ${nl(xbar, 1)} ${C.eenheid}.</p>`,
              prompt: 'Wat is de conclusie van deze toetsingsprocedure? Motiveer je antwoord.',
              steps: [
                mc('Verwerpingsgebied', `Ligt ${nl(xbar, 1)} in het verwerpingsgebied?`, [
                  opt('Ja', inGebied, inGebied ? 'Klopt.' : 'Vergelijk met de grens uit vraag c.'),
                  opt('Nee', !inGebied, !inGebied ? 'Klopt.' : 'Vergelijk met de grens uit vraag c.'),
                ], {
                  keepOrder: true, th: ['toets-conclusie'],
                  fig: { soort: 'normaal', van: C.kant === '<' ? -Infinity : zt, tot: C.kant === '<' ? -zt : Infinity, labels: [-2, -1, 0, 1, 2], waarden: z => nl(C.mu + z * sT, 2), onderschrift: `De verdeling van T als H₀ waar is. Gekleurd: het verwerpingsgebied${C.kant === '≠' ? ' aan de rechterkant (links ligt net zo’n stuk)' : ''}.` },
                  write: [`${td(xbar, 1)} ${inGebied ? '' : '\\text{ niet }'}\\text{in het verwerpingsgebied}`],
                }),
                mc('Conclusie', 'Wat is de conclusie?', [
                  opt('H₀ verwerpen: de bewering klopt waarschijnlijk niet', inGebied, inGebied ? 'Klopt.' : 'De uitkomst ligt niet in het verwerpingsgebied.'),
                  opt('H₀ niet verwerpen: er is geen reden om aan de bewering te twijfelen', !inGebied, !inGebied ? 'Klopt.' : 'De uitkomst ligt wel in het verwerpingsgebied.'),
                ], { keepOrder: true, write: [inGebied ? '\\text{H}_0 \\text{ verwerpen}' : '\\text{H}_0 \\text{ niet verwerpen}'] }),
              ],
              final: [{ label: 'gemiddelde', answers: [xbar], dp: 1 }],
              verify: () => (r > 1) === inGebied,
            },
          ],
        };
      },
    },
  },

  /* ================= kansrekening ================= */
  kans: {
    spel: {
      titel: 'Een spel op de braderie', soort: 'Kansverdeling en verwachting',
      rand: () => {
        let H, L, B; do { H = pick([10, 12, 15, 20]); L = pick([2, 3, 4, 5]); B = pick([1, 2, 3]); } while (new Set([H, L, B]).size < 3);
        return { a: ri(0, 2), q: pick([2, 3]), H, L, B, n: pick([10, 12, 15]) };
      },
      build({ a, q, H, L, B, n }) {
        const A = [
          { naam: 'dubbel gooit (twee keer hetzelfde aantal ogen)', kort: 'dubbel', goed: (i, j) => i === j },
          { naam: 'samen 10 of meer ogen gooit', kort: 'som ≥ 10', goed: (i, j) => i + j >= 10 },
          { naam: 'samen 4 of minder ogen gooit', kort: 'som ≤ 4', goed: (i, j) => i + j <= 4 },
        ][a];
        const tweede = q === 2 ? { wat: 'gooi je daarna een munt', hoog: 'kop', laag: 'munt' } : { wat: 'gooi je daarna nog één dobbelsteen', hoog: '5 of 6', laag: '1 t/m 4' };
        const pA = 6 / 36, p7 = 6 / 36, pH = pA / q, pL = pA * (q - 1) / q, p0 = 1 - pA - p7;
        const EU = H * pH + L * pL + B * p7;
        const pminst = 1 - (1 - pH) ** n - n * pH * (1 - pH) ** (n - 1);
        const fr = (num, den) => { const g = gcd(num, den); return `\\tfrac{${num / g}}{${den / g}}`; };
        const tH = fr(1, 6 * q), tL = fr(q - 1, 6 * q);
        return {
          intro: `<p>Op een braderie kun je een spel spelen. Je gooit met twee dobbelstenen. Als je ${A.naam}, ${tweede.wat}: bij ${tweede.hoog} krijg je € ${H}, anders € ${L}. Gooi je met de twee dobbelstenen samen 7 ogen, dan krijg je € ${B}. In alle andere gevallen krijg je niets.</p>`,
          figuur: { soort: 'boom', takken: [{ label: A.kort, p: '1/6', kids: [{ label: tweede.hoog, p: q === 2 ? '1/2' : '1/3', uit: `€ ${H}` }, { label: tweede.laag, p: q === 2 ? '1/2' : '2/3', uit: `€ ${L}` }] }, { label: 'som 7', p: '1/6', kids: [{ label: '', p: '', uit: `€ ${B}` }] }, { label: 'anders', p: '2/3', kids: [{ label: '', p: '', uit: '€ 0' }] }], onderschrift: 'De kansboom van het spel. U is de uitbetaling.' },
          delen: [
            {
              pt: 'a', topic: 'kans-boom', pts: 3,
              prompt: `Toon aan dat de kans dat je € ${H} krijgt gelijk is aan \\(${tH}\\).`,
              steps: [
                num('Rooster', `Hoeveel van de 36 uitkomsten met twee dobbelstenen zijn ${A.kort}?`, [6], { dp: 0, th: ['kans-dobbel'], fig: { soort: 'rooster', goed: A.goed, onderschrift: `De gekleurde vakjes: ${A.kort}.` }, write: [`P(\\text{${A.kort}}) = \\tfrac{6}{36} = \\tfrac16`] }),
                mc('Pad', `Hoe bereken je de kans op € ${H}?`, [
                  opt(M(`\\tfrac16 \\cdot ${q === 2 ? '\\tfrac12' : '\\tfrac13'}`), true, 'Klopt: langs één pad van de boom vermenigvuldig je.'),
                  opt(M(`\\tfrac16 + ${q === 2 ? '\\tfrac12' : '\\tfrac13'}`), false, 'Na elkaar is vermenigvuldigen, niet optellen.'),
                  opt(M(`${q === 2 ? '\\tfrac12' : '\\tfrac13'}`), false, `Eerst moet je ook ${A.kort} gooien.`),
                ], { th: ['kans-boom'], write: [`P(U = ${H}) = \\tfrac16 \\cdot ${q === 2 ? '\\tfrac12' : '\\tfrac13'} = ${tH}`] }),
              ],
              final: [{ label: 'P', answers: [pH], dp: 4 }],
              verify: () => { let t = 0; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (A.goed(i, j)) t++; return t === 6 && near(pH * 6 * q, 1, 1e-12); },
            },
            {
              pt: 'b', topic: 'kans-verwachting', pts: 5,
              prompt: 'Maak de kansverdeling van de uitbetaling U en bereken de verwachte uitbetaling per spel. Rond af op 2 decimalen.',
              steps: [
                num(`P(U = ${L})`, `Hoe groot is de kans dat je € ${L} krijgt? (Een breuk mag.)`, [pL], { dp: 4, th: ['kans-verwachting'], write: [`P(U = ${L}) = \\tfrac16 \\cdot ${q === 2 ? '\\tfrac12' : '\\tfrac23'} = ${tL}`] }),
                num(`P(U = ${B})`, `Hoe groot is de kans dat je € ${B} krijgt?`, [p7], { dp: 4, hint: 'Tel in het rooster hoeveel uitkomsten samen 7 zijn.', fig: { soort: 'rooster', goed: (i, j) => i + j === 7, onderschrift: 'De gekleurde vakjes: samen 7.' }, write: [`P(U = ${B}) = \\tfrac{6}{36} = \\tfrac16`] }),
                num('P(U = 0)', 'En de kans dat je niets krijgt?', [p0], { dp: 4, hint: 'Alle kansen samen zijn 1.', write: [`P(U = 0) = 1 - ${tH} - ${tL} - \\tfrac16 = \\tfrac23`] }),
                num('E(U)', 'Bereken de verwachte uitbetaling. Rond af op 2 decimalen.', [EU], {
                  dp: 2, hint: 'Vermenigvuldig elke uitbetaling met zijn kans en tel op.',
                  fig: { soort: 'tabel', kop: ['u', '0', String(B), String(L), String(H)], rijen: [['P(U = u)', '\\(\\tfrac23\\)', '\\(\\tfrac16\\)', `\\(${tL}\\)`, `\\(${tH}\\)`]] },
                  write: [`E(U) = 0 \\cdot \\tfrac23 + ${B} \\cdot \\tfrac16 + ${L} \\cdot ${tL} + ${H} \\cdot ${tH} ${eqd(EU, 2)}`],
                }),
              ],
              final: [{ label: 'E(U)', answers: [EU], dp: 2 }],
              verify: () => near(pH + pL + p7 + p0, 1, 1e-12),
            },
            {
              pt: 'c', topic: 'kans-verwachting', pts: 2,
              prompt: 'De organisatie vraagt een inzet per spel. Hoe groot moet die inzet minstens zijn, zodat de organisatie naar verwachting winst maakt? Rond af op hele centen.',
              steps: [
                mc('Redenering', 'Wanneer maakt de organisatie naar verwachting winst?', [
                  opt('Als de inzet groter is dan de verwachte uitbetaling E(U)', true, 'Klopt: per spel krijgt de organisatie de inzet en betaalt ze gemiddeld E(U) uit.'),
                  opt('Als de inzet groter is dan het hoogste bedrag', false, 'Dat is veel te voorzichtig: het gaat om het gemiddelde.'),
                  opt('Als de inzet groter is dan de kans op winst', false, 'Een kans is geen bedrag in euro’s.'),
                ], { th: ['kans-verwachting'] }),
                num('Inzet', 'Hoe groot moet de inzet dus minstens zijn, in euro’s?', [Math.floor(EU * 100 + 1e-9) / 100 + 0.01], { dp: 2, hint: `E(U) ≈ ${nl(EU, 4)}. De inzet moet daar net boven liggen.`, write: [`\\text{inzet} > ${td(EU, 4)}, \\text{ dus minstens } € ${td(Math.floor(EU * 100 + 1e-9) / 100 + 0.01, 2)}`] }),
              ],
              final: [{ label: 'inzet', answers: [Math.floor(EU * 100 + 1e-9) / 100 + 0.01], dp: 2 }],
              verify: () => Math.floor(EU * 100 + 1e-9) / 100 + 0.01 > EU,
            },
            {
              pt: 'd', topic: 'kans-binom', pts: 4,
              prompt: `Iemand speelt het spel ${n} keer. Bereken de kans dat hij minstens twee keer € ${H} krijgt. Rond af op 4 decimalen.`,
              steps: [
                mc('Aanpak', 'Hoe pak je "minstens twee keer" aan?', [
                  opt(M('1 - P(X = 0) - P(X = 1)'), true, 'Klopt: via de complementregel.'),
                  opt(M('P(X = 2)'), false, 'Minstens twee is ook drie, vier, …'),
                  opt(M('1 - P(X = 2)'), false, 'Dan tel je juist alles behalve precies twee.'),
                ], { th: ['kans-binom', 'kans-boom'], write: [`P(X \\geq 2) = 1 - P(X = 0) - P(X = 1)`] }),
                num('P(X = 0)', `Bereken P(X = 0) met \\(p = ${tH}\\). Rond af op 4 decimalen.`, [(1 - pH) ** n], { dp: 4, write: [`P(X = 0) = (1 - ${tH})^{${n}} ${eqd((1 - pH) ** n, 4)}`] }),
                num('P(X = 1)', 'Bereken P(X = 1). Rond af op 4 decimalen.', [n * pH * (1 - pH) ** (n - 1)], { dp: 4, write: [`P(X = 1) = ${n} \\cdot ${tH} \\cdot (1 - ${tH})^{${n - 1}} ${eqd(n * pH * (1 - pH) ** (n - 1), 4)}`] }),
                num('Antwoord', 'Bereken de kans op minstens twee keer. Rond af op 4 decimalen.', [pminst], { dp: 4, write: [`P(X \\geq 2) ${eqd(pminst, 4)}`] }),
              ],
              final: [{ label: 'P', answers: [pminst], dp: 4 }],
              verify: () => Math.abs(1 - binCdf(n, 1, pH) - pminst) < 1e-12,
            },
          ],
        };
      },
    },

    test: {
      titel: 'Een positieve test', soort: 'Kruistabel en voorwaardelijke kans',
      rand: () => {
        // alleen combinaties waarbij elk vakje van de kruistabel een heel aantal mensen is
        const heel = x => Math.abs(x - Math.round(x)) < 1e-9;
        let r; do { r = { c: ri(0, 1), N: pick([5000, 10000, 20000]), g: pick([0.01, 0.02, 0.04]), s: pick([0.9, 0.95, 0.98]), f: pick([0.02, 0.03, 0.05]) }; } while (!heel(r.N * r.g * r.s) || !heel(r.N * (1 - r.g) * r.f));
        return r;
      },
      build({ c, N, g, s, f }) {
        const C = [
          { wie: 'sporters', een: 'sporter', ja: 'Doping gebruikt', nee: 'Geen doping', test: 'dopingtest', vraag: 'Hoeveel sporters gebruiken doping?', mv: 'doping gebruiken', ev: 'doping gebruikt heeft', mvVerl: 'doping gebruikt hebben' },
          { wie: 'reizigers', een: 'reiziger', ja: 'Besmet', nee: 'Niet besmet', test: 'sneltest', vraag: 'Hoeveel reizigers zijn besmet?', mv: 'besmet zijn', ev: 'besmet is', mvVerl: 'besmet zijn' },
        ][c];
        const D = N * g, TP = D * s, FN = D - TP, FP = (N - D) * f, TN = N - D - FP, POS = TP + FP;
        const ppv = TP / POS, minst = 1 - ppv ** 3;
        const r = x => nl(x, 0);
        return {
          intro: `<p>Van ${N} ${C.wie} is bekend dat ${nl(g * 100)}% ${C.mv}. Ze doen allemaal een ${C.test}. Bij ${nl(s * 100)}% van de ${C.wie} die ${C.mv} geeft de test een positieve uitslag. Bij ${nl(f * 100)}% van de andere ${C.wie} geeft de test ten onrechte ook een positieve uitslag.</p>`,
          figuur: { soort: 'tabel', kop: ['', 'Positief', 'Negatief', 'Totaal'], rijen: [[C.ja, null, null, null], [C.nee, null, null, null], ['Totaal', null, null, r(N)]], onderschrift: 'De kruistabel, nog in te vullen.' },
          delen: [
            {
              pt: 'a', topic: 'kans-boom', pts: 4,
              prompt: 'Vul de kruistabel in.',
              steps: [
                num(C.ja, C.vraag, [D], { dp: 0, th: ['kans-boom'], write: [`${td(g)} \\cdot ${N} = ${r(D)}`] }),
                num('Terecht positief', `Hoeveel daarvan testen positief?`, [TP], { dp: 0, write: [`${td(s)} \\cdot ${r(D)} = ${r(TP)}`] }),
                num('Ten onrechte positief', `Hoeveel van de andere ${r(N - D)} ${C.wie} testen positief?`, [FP], { dp: 0, write: [`${td(f)} \\cdot ${r(N - D)} = ${r(FP)}`] }),
                num('Totaal positief', 'Hoeveel positieve uitslagen zijn er in totaal?', [POS], {
                  dp: 0,
                  fig: { soort: 'tabel', kop: ['', 'Positief', 'Negatief', 'Totaal'], rijen: [[C.ja, r(TP), r(FN), r(D)], [C.nee, r(FP), r(TN), r(N - D)], ['Totaal', null, r(FN + TN), r(N)]], onderschrift: 'Bijna klaar: alleen het totaal aan positieve uitslagen ontbreekt.' },
                  write: [`${r(TP)} + ${r(FP)} = ${r(POS)}`],
                }),
              ],
              final: [{ label: 'positief totaal', answers: [POS], dp: 0 }],
              verify: () => near(TP + FN + FP + TN, N, 1e-9) && [D, TP, FP].every(x => near(x, Math.round(x), 1e-9)),
            },
            {
              pt: 'b', topic: 'kans-boom', pts: 2,
              prompt: `Een ${C.een} test positief. Bereken de kans dat deze ${C.een} echt ${C.ev}. Rond af op 3 decimalen.`,
              steps: [
                mc('Welke getallen', 'Welke deling past?', [
                  opt(M(`\\dfrac{${r(TP)}}{${r(POS)}}`), true, 'Klopt: je kijkt alleen naar de kolom met positieve uitslagen.'),
                  opt(M(`\\dfrac{${r(TP)}}{${r(D)}}`), false, `Dat is de kans op een positieve test als iemand ${C.ev}: precies andersom.`),
                  opt(M(`\\dfrac{${r(TP)}}{${N}}`), false, 'Je weet al dat de test positief is, dus je deelt door het aantal positieven.'),
                ], { th: ['kans-boom'], write: [`P = \\dfrac{${r(TP)}}{${r(POS)}}`] }),
                num('Kans', 'Reken uit. Rond af op 3 decimalen.', [ppv], { dp: 3, write: [`P ${eqd(ppv, 3)}`] }),
              ],
              final: [{ label: 'P', answers: [ppv], dp: 3 }],
              verify: () => near(ppv, (g * s) / (g * s + (1 - g) * f), 1e-9),
            },
            {
              pt: 'c', topic: 'kans-boom', pts: 3,
              prompt: `Drie ${C.wie} testen positief. Bereken de kans dat minstens één van hen toch niet ${C.ev}. Rond af op 3 decimalen.`,
              steps: [
                mc('Complement', 'Wat is het complement van "minstens één niet"?', [
                  opt(`Alle drie ${C.mvVerl}`, true, 'Klopt: minstens één niet = 1 − alle drie wel.'),
                  opt('Geen van de drie', false, 'Let op: het gaat om "niet", dus het complement is "alle drie wel".'),
                  opt('Precies één', false, 'Minstens één is ook twee of drie.'),
                ], { th: ['kans-boom'], write: [`P = 1 - P(\\text{alle drie})`] }),
                num('Alle drie', 'Bereken de kans dat het bij alle drie klopt. Rond af op 3 decimalen.', [ppv ** 3], { dp: 3, hint: 'Gebruik de kans uit vraag b drie keer.', write: [`P(\\text{alle drie}) = ${td(ppv, 4)}^3 ${eqd(ppv ** 3, 3)}`] }),
                num('Antwoord', 'Bereken de gevraagde kans. Rond af op 3 decimalen.', [minst], { dp: 3, write: [`P = 1 - ${td(ppv ** 3, 4)} ${eqd(minst, 3)}`] }),
              ],
              final: [{ label: 'P', answers: [minst], dp: 3 }],
              verify: () => near(minst + ppv ** 3, 1, 1e-12),
            },
          ],
        };
      },
    },
  },

  /* ================= differentiëren en optimaliseren ================= */
  opt: {
    bakkerij: {
      titel: 'Taarten bakken', soort: 'Winst en rendement',
      rand: () => {
        let a, b, d, c; do { a = pick([20, 24, 30]); d = pick([4, 6, 8]); b = pick([0.02, 0.025, 0.05]); c = pick([500, 800, 1000, 1500, 2000]); } while ((a - d) ** 2 / (4 * b) < 1.6 * c);
        return { a, b, c, d };
      },
      build({ a, b, c, d }) {
        const A = a - d, W = q => -b * q * q + A * q - c, qs = A / (2 * b);
        const disc = A * A - 4 * b * c, r1 = (A - Math.sqrt(disc)) / (2 * b), r2 = (A + Math.sqrt(disc)) / (2 * b);
        const qmin = Math.floor(r1 + 1e-9) + 1, qmax = Math.ceil(r2 - 1e-9) - 1;
        const rend = q => W(q) / (c + d * q), qr = (-b * c + Math.sqrt(b * b * c * c + a * b * c * d)) / (b * d);
        const qrHeel = rend(Math.floor(qr)) >= rend(Math.ceil(qr)) ? Math.floor(qr) : Math.ceil(qr);
        const Wtex = `W = -${td(b)}q^2 + ${A}q - ${c}`;
        return {
          intro: `<p>Een bakkerij bakt per dag q taarten. Alle taarten worden verkocht als de prijs per taart \\(p = ${a} - ${td(b)}q\\) euro is. De kosten per dag zijn \\(K = ${c} + ${d}q\\) euro.</p>`,
          figuur: plotFig(W, `W(q)`, [0, Math.round(2 * qs)], 'De winst W per dag (in euro’s) uitgezet tegen het aantal taarten q.'),
          delen: [
            {
              pt: 'a', topic: 'opt-formule', pts: 2,
              prompt: `Toon aan dat voor de winst per dag geldt: \\(${Wtex}\\).`,
              steps: [
                mc('Opbrengst', 'Wat is de opbrengst R?', [
                  opt(M(`R = p \\cdot q = ${a}q - ${td(b)}q^2`), true, 'Klopt: prijs keer aantal.'),
                  opt(M(`R = ${a} - ${td(b)}q`), false, 'Dat is de prijs van één taart, nog niet keer q.'),
                  opt(M(`R = ${a}q - ${td(b)}q`), false, `q · ${td(b)}q = ${td(b)}q², niet ${td(b)}q.`),
                ], { th: ['opt-formule'], write: [`R = (${a} - ${td(b)}q) \\cdot q = ${a}q - ${td(b)}q^2`] }),
                mc('Winst', 'Wat is dan de winst?', [
                  opt(M(`W = ${a}q - ${td(b)}q^2 - (${c} + ${d}q) = -${td(b)}q^2 + ${A}q - ${c}`), true, 'Klopt: winst is opbrengst min kosten, met haakjes om de kosten.'),
                  opt(M(`W = ${a}q - ${td(b)}q^2 - ${c} + ${d}q = -${td(b)}q^2 + ${a + d}q - ${c}`), false, 'Zet haakjes om de kosten: ook de ' + d + 'q gaat eraf.'),
                ], { write: [`W = R - K = -${td(b)}q^2 + ${A}q - ${c}`] }),
              ],
              final: [{ label: 'coëfficiënt van q', answers: [A], dp: 0 }], verify: () => near(W(10), (a - b * 10) * 10 - (c + d * 10), 1e-9),
            },
            {
              pt: 'b', topic: 'opt-extreem', pts: 3,
              prompt: 'Bereken met behulp van de afgeleide bij welk aantal taarten de winst maximaal is.',
              steps: [
                mc('Afgeleide', 'Wat is W′(q)?', [
                  opt(M(`W'(q) = -${td(2 * b)}q + ${A}`), true, 'Klopt.'),
                  opt(M(`W'(q) = -${td(b)}q + ${A}`), false, `Bij q² komt er een 2 voor: 2 · ${td(b)} = ${td(2 * b)}.`),
                  opt(M(`W'(q) = -${td(2 * b)}q + ${A} - ${c}`), false, 'Een los getal valt weg bij differentiëren.'),
                ], { th: ['opt-extreem'], write: [`W'(q) = -${td(2 * b)}q + ${A}`] }),
                num('q', 'Los W′(q) = 0 op. Bij hoeveel taarten is de winst maximaal?', [qs], { dp: 0, write: [`-${td(2 * b)}q + ${A} = 0 \\Rightarrow q = ${td(qs)}`] }),
              ],
              final: [{ label: 'q', answers: [qs], dp: 0 }], verify: () => W(qs) > W(qs - 1) && W(qs) > W(qs + 1),
            },
            {
              pt: 'c', topic: 'opt-vergelijking', pts: 5,
              prompt: 'Bereken algebraïsch bij welke aantallen taarten de bakkerij winst maakt.',
              steps: [
                mc('Vergelijking', 'Welke vergelijking los je eerst op?', [
                  opt(M(`-${td(b)}q^2 + ${A}q - ${c} = 0`), true, 'Klopt: eerst de grenzen, waar de winst precies 0 is.'),
                  opt(M(`-${td(2 * b)}q + ${A} = 0`), false, 'Dat geeft de top, niet de grenzen.'),
                ], { th: ['opt-vergelijking'], write: [`-${td(b)}q^2 + ${A}q - ${c} = 0`] }),
                num('Nulpunten', 'Los op met de abc-formule. Rond af op 1 decimaal.', [r1, r2], { dp: 1, hint: `a = −${nl(b, 3)}, b = ${A}, c = −${c}.`, write: [`q \\approx ${td(r1, 1)} \\;\\vee\\; q \\approx ${td(r2, 1)}`] }),
                num('Gehele aantallen', 'Tussen de nulpunten is de winst positief. Wat is het kleinste en het grootste aantal taarten met winst?', [qmin, qmax], {
                  dp: 0, fig: plotFig(W, 'W(q)', [r1, r2], 'Waar ligt de grafiek boven de horizontale as?', { lijnen: [{ f: () => 0, tex: 'W = 0' }] }),
                  write: [`\\text{winst bij } ${qmin} \\leq q \\leq ${qmax}`],
                }),
              ],
              final: [{ label: 'kleinste q', answers: [qmin], dp: 0 }, { label: 'grootste q', answers: [qmax], dp: 0 }],
              verify: () => W(qmin) > 0 && W(qmax) > 0 && W(qmin - 1) <= 0 && W(qmax + 1) <= 0,
            },
            {
              pt: 'd', topic: 'opt-extreem', pts: 6,
              info: '<p>Het rendement R van de bakkerij is de winst gedeeld door de kosten: \\(R = \\dfrac{W}{K}\\).</p>',
              prompt: 'Bereken algebraïsch bij welk aantal taarten het rendement maximaal is.',
              steps: [
                mc('Regel', 'Met welke regel differentieer je R?', [
                  opt('Quotiëntregel', true, 'Klopt: R is een breuk met q boven en onder.'),
                  opt('Productregel', false, 'Er staat een deling, geen vermenigvuldiging.'),
                  opt('Alleen de machtsregel', false, 'Er staat q in de noemer, dus dat gaat niet.'),
                ], { th: ['opt-afgeleide'], write: [`R(q) = \\dfrac{-${td(b)}q^2 + ${A}q - ${c}}{${c} + ${d}q}`] }),
                mc('Teller nul', 'R′(q) = 0 als de teller van R′ nul is. Welke vergelijking krijg je na uitwerken?', [
                  opt(M(`-${td(b * d)}q^2 - ${td(2 * b * c)}q + ${td(a * c)} = 0`), true, 'Klopt: (−2bq + A)(c + dq) − d·W, netjes uitgewerkt.'),
                  opt(M(`-${td(2 * b)}q + ${A} = 0`), false, 'Dat is de afgeleide van W alleen. Bij een breuk gebruik je de quotiëntregel.'),
                  opt(M(`-${td(b * d)}q^2 + ${td(2 * b * c)}q - ${td(a * c)} = 0`), false, 'Controleer de tekens bij het uitwerken van de haakjes.'),
                ], { write: [`(-${td(2 * b)}q + ${A})(${c} + ${d}q) - ${d}(-${td(b)}q^2 + ${A}q - ${c}) = 0`, `-${td(b * d)}q^2 - ${td(2 * b * c)}q + ${td(a * c)} = 0`] }),
                num('q', 'Los op. Neem de positieve oplossing en rond af op 1 decimaal.', [qr], { dp: 1, write: [`q \\approx ${td(qr, 1)}`] }),
                num('Heel aantal', 'Een aantal taarten is een geheel getal. Bij welk aantal is het rendement het grootst? Vergelijk de twee gehele getallen eromheen.', [qrHeel], { dp: 0, write: [`R(${Math.floor(qr)}) ${eqd(rend(Math.floor(qr)), 4)},\\; R(${Math.ceil(qr)}) ${eqd(rend(Math.ceil(qr)), 4)}`] }),
              ],
              final: [{ label: 'q', answers: [qrHeel], dp: 0 }],
              verify: () => { const h = 1e-4; return Math.abs((rend(qr + h) - rend(qr - h)) / (2 * h)) < 1e-6 && rend(qrHeel) >= rend(qrHeel - 1) && rend(qrHeel) >= rend(qrHeel + 1); },
            },
          ],
        };
      },
    },

    medicijn: {
      titel: 'Een medicijn', soort: 'Afgeleide in een context',
      rand: () => ({ b: pick([4, 9, 16, 25]), a: pick([20, 30, 40, 60]), f: pick([0.5, 0.6, 0.8]), dT: pick([1, 2, 3]) }),
      build({ b, a, f, dT }) {
        const sb = Math.sqrt(b), Cf = t => a * t / (t * t + b), Cmax = a / (2 * sb), g = +(Cmax * f).toFixed(1);
        const D = a * a - 4 * g * g * b, t1 = (a - Math.sqrt(D)) / (2 * g), t2 = (a + Math.sqrt(D)) / (2 * g), duur = (t2 - t1) * 60;
        const T = sb + dT, dC = a * (b - T * T) / (T * T + b) ** 2;
        return {
          intro: `<p>Na het innemen van een tablet is de concentratie C van een medicijn in het bloed (in mg per liter) te benaderen met \\(C = \\dfrac{${a}t}{t^2 + ${b}}\\). Hierin is t de tijd in uren na het innemen.</p>`,
          figuur: plotFig(Cf, 'C(t)', [0, 4 * sb], 'De concentratie C uitgezet tegen de tijd t.'),
          delen: [
            {
              pt: 'a', topic: 'opt-vergelijking', pts: 5,
              info: `<p>Het medicijn werkt zolang de concentratie meer dan ${nl(g, 1)} mg per liter is.</p>`,
              prompt: 'Bereken algebraïsch hoe lang het medicijn werkt. Geef je antwoord in hele minuten.',
              steps: [
                mc('Vergelijking', `Welke vergelijking krijg je uit C = ${nl(g, 1)}?`, [
                  opt(M(`${td(g)}t^2 - ${a}t + ${td(g * b)} = 0`), true, `Klopt: kruislings vermenigvuldigen en alles naar één kant.`),
                  opt(M(`${td(g)}t^2 - ${a}t + ${b} = 0`), false, `Ook de ${b} wordt met ${nl(g, 1)} vermenigvuldigd.`),
                  opt(M(`${a}t = ${td(g)}t^2`), false, `Je vergeet de ${b} in de noemer.`),
                ], { th: ['opt-vergelijking'], write: [`${a}t = ${td(g)}(t^2 + ${b})`, `${td(g)}t^2 - ${a}t + ${td(g * b)} = 0`] }),
                num('Tijden', 'Los op met de abc-formule. Rond af op 3 decimalen.', [t1, t2], { dp: 3, fig: plotFig(Cf, 'C(t)', [0, t2 + 1], `Tussen de twee snijpunten ligt de grafiek boven C = ${nl(g, 1)}.`, { lijnen: [{ f: () => g, tex: `C = ${td(g)}` }] }), write: [`t \\approx ${td(t1, 3)} \\;\\vee\\; t \\approx ${td(t2, 3)}`] }),
                num('Minuten', 'Hoe lang werkt het medicijn, in hele minuten?', [duur], { dp: 0, write: [`(${td(t2, 3)} - ${td(t1, 3)}) \\cdot 60 ${eqd(duur, 0)} \\text{ minuten}`] }),
              ],
              final: [{ label: 'minuten', answers: [duur], dp: 0 }],
              verify: () => Math.abs(Cf(t1) - g) < 1e-9 && Math.abs(Cf(t2) - g) < 1e-9 && Cf((t1 + t2) / 2) > g,
            },
            {
              pt: 'b', topic: 'opt-extreem', pts: 5,
              prompt: 'Bereken algebraïsch de maximale concentratie. Rond af op 2 decimalen.',
              steps: [
                mc('Afgeleide', 'Wat is C′(t)? Gebruik de quotiëntregel.', [
                  opt(M(`C'(t) = \\dfrac{${a}(t^2 + ${b}) - ${a}t \\cdot 2t}{(t^2 + ${b})^2} = \\dfrac{${a * b} - ${a}t^2}{(t^2 + ${b})^2}`), true, 'Klopt.'),
                  opt(M(`C'(t) = \\dfrac{${a}}{2t}`), false, 'Je mag teller en noemer niet los differentiëren.'),
                  opt(M(`C'(t) = \\dfrac{${a}t \\cdot 2t - ${a}(t^2 + ${b})}{(t^2 + ${b})^2}`), false, 'In de quotiëntregel komt eerst (afgeleide teller) · noemer.'),
                ], { th: ['opt-extreem', 'opt-afgeleide'], write: [`C'(t) = \\dfrac{${a * b} - ${a}t^2}{(t^2 + ${b})^2}`] }),
                num('t', 'C′(t) = 0 als de teller 0 is. Op welk tijdstip (t > 0)?', [sb], { dp: 2, write: [`${a * b} - ${a}t^2 = 0 \\Rightarrow t^2 = ${b} \\Rightarrow t = ${sb}`] }),
                num('Maximum', 'Bereken de maximale concentratie. Rond af op 2 decimalen.', [Cmax], { dp: 2, write: [`C(${sb}) = \\dfrac{${a} \\cdot ${sb}}{${b} + ${b}} ${eqd(Cmax, 2)}`] }),
              ],
              final: [{ label: 'C', answers: [Cmax], dp: 2 }],
              verify: () => Cf(sb) > Cf(sb - 0.01) && Cf(sb) > Cf(sb + 0.01),
            },
            {
              pt: 'c', topic: 'opt-helling', pts: 4,
              prompt: `Toon met behulp van de afgeleide aan dat de concentratie op t = ${T} afneemt.`,
              steps: [
                num('C′(' + T + ')', `Bereken C′(${T}). Rond af op 3 decimalen.`, [dC], { dp: 3, th: ['opt-helling'], write: [`C'(${T}) = \\dfrac{${a * b} - ${a} \\cdot ${T}^2}{(${T}^2 + ${b})^2} ${eqd(dC, 3)}`] }),
                mc('Conclusie', 'Wat betekent dat?', [
                  opt('C′ is negatief, dus de concentratie neemt af', true, 'Klopt: een negatieve helling betekent dalen.'),
                  opt('C′ is negatief, dus de concentratie is negatief', false, 'De afgeleide zegt iets over stijgen of dalen, niet over de waarde zelf.'),
                  opt('C′ is negatief, dus de concentratie neemt toe', false, 'Een negatieve helling betekent dalen.'),
                ], { write: [`C'(${T}) < 0, \\text{ dus } C \\text{ neemt af}`] }),
              ],
              final: [{ label: "C'", answers: [dC], dp: 3 }],
              verify: () => dC < 0 && Math.abs((Cf(T + 1e-5) - Cf(T - 1e-5)) / 2e-5 - dC) < 1e-6,
            },
          ],
        };
      },
    },
  },

  /* ================= periodieke functies ================= */
  sinus: {
    getij: {
      titel: 'Eb en vloed', soort: 'Periodieke functies',
      rand: () => ({ A: pick([10, 25, 40]), B: pick([120, 150, 175, 200]), c: pick([0.5, 0.506]) }),
      build({ A, B, c }) {
        const H = t => A + B * Math.sin(c * t), P = 2 * Math.PI / c, H1 = H(1), H2 = H(2), pct = (H2 - H1) / H1 * 100;
        const s1 = Math.PI / c - 1, s2 = 1 + P;
        return {
          intro: `<p>De waterhoogte in een zeearm verandert door eb en vloed. Een week lang is de waterhoogte te benaderen met \\(H = ${A} + ${B}\\sin(${td(c)}t)\\). Hierin is H de waterhoogte in centimeters boven het gemiddelde zeeniveau en t de tijd in uren, met t = 0 om middernacht. Het getal ${td(c).replace('{,}', ',')}t is in radialen.</p>`,
          figuur: plotFig(H, 'H(t)', [0, 2 * P], 'De waterhoogte H uitgezet tegen de tijd t.'),
          delen: [
            {
              pt: 'a', topic: 'sin-minmax', pts: 2, prompt: 'Bereken de minimale en de maximale waterhoogte.',
              steps: [
                mc('Uitslag', 'Tussen welke waarden ligt sin(…)?', [opt('Tussen −1 en 1', true, 'Klopt.'), opt('Tussen 0 en 1', false, 'Een sinus wordt ook negatief.')], { th: ['sin-minmax'] }),
                num('Min en max', 'Wat zijn de minimale en de maximale waterhoogte?', [A - B, A + B], { dp: 0, write: [`H_{min} = ${A} - ${B} = ${A - B},\\; H_{max} = ${A} + ${B} = ${A + B}`] }),
              ],
              final: [{ label: 'min', answers: [A - B], dp: 0 }, { label: 'max', answers: [A + B], dp: 0 }], verify: () => true,
            },
            {
              pt: 'b', topic: 'sin-minmax', pts: 2, prompt: 'Bereken de periode. Rond af op 2 decimalen.',
              steps: [
                mc('Formule', 'Hoe bereken je de periode uit het getal voor t?', [
                  opt(M(`P = \\dfrac{2\\pi}{${td(c)}}`), true, 'Klopt.'),
                  opt(M(`P = 2\\pi \\cdot ${td(c)}`), false, 'Je deelt 2π door c.'),
                  opt(M(`P = \\dfrac{${td(c)}}{2\\pi}`), false, 'Andersom: 2π gedeeld door c.'),
                ], { th: ['sin-minmax'] }),
                num('P', 'Reken uit. Rond af op 2 decimalen.', [P], { dp: 2, write: [`P = \\dfrac{2\\pi}{${td(c)}} ${eqd(P, 2)} \\text{ uur}`] }),
              ],
              final: [{ label: 'P', answers: [P], dp: 2 }], verify: () => near(H(0.3), H(0.3 + P), 1e-9),
            },
            {
              pt: 'c', topic: 'groei-factor', pts: 4, prompt: 'Bereken algebraïsch met hoeveel procent de waterhoogte toeneemt tussen t = 1 en t = 2. Rond af op 1 decimaal.',
              steps: [
                num('H(1) en H(2)', 'Bereken H(1) en H(2). Rond af op 2 decimalen.', [H1, H2], { dp: 2, th: ['groei-factor'], write: [`H(1) = ${A} + ${B}\\sin(${td(c)}) ${eqd(H1, 2)}`, `H(2) = ${A} + ${B}\\sin(${td(2 * c)}) ${eqd(H2, 2)}`] }),
                mc('Procent', 'Hoe bereken je de procentuele toename?', [
                  opt(M('\\dfrac{H(2) - H(1)}{H(1)} \\cdot 100\\%'), true, 'Klopt: het verschil gedeeld door de oude waarde.'),
                  opt(M('\\dfrac{H(2) - H(1)}{H(2)} \\cdot 100\\%'), false, 'Je deelt door de oude waarde, H(1).'),
                  opt(M('(H(2) - H(1))\\%'), false, 'Dat is het verschil in centimeters, geen percentage.'),
                ], {}),
                num('Toename', 'Reken uit. Rond af op 1 decimaal.', [pct], { dp: 1, write: [`\\dfrac{${td(H2, 2)} - ${td(H1, 2)}}{${td(H1, 2)}} \\cdot 100\\% ${eqd(pct, 1)}\\%`] }),
              ],
              final: [{ label: 'procent', answers: [pct], dp: 1 }], verify: () => H1 > 0 && H2 > H1,
            },
            {
              pt: 'd', topic: 'sin-tijdstip', pts: 4, prompt: 'Bereken algebraïsch de eerste twee tijdstippen na t = 1 waarop de waterhoogte gelijk is aan die op t = 1. Rond af op 2 decimalen.',
              steps: [
                mc('Symmetrie', `Voor welke andere hoek geldt \\(\\sin(x) = \\sin(${td(c)})\\)?`, [
                  opt(M(`x = \\pi - ${td(c)}`), true, 'Klopt: de sinus is symmetrisch rond π/2.'),
                  opt(M(`x = -${td(c)}`), false, 'sin(−x) = −sin(x), dat is juist het tegengestelde.'),
                  opt(M(`x = ${td(c)} + \\pi`), false, 'Na een halve periode is de sinus juist tegengesteld.'),
                ], { th: ['sin-tijdstip'], fig: plotFig(H, 'H(t)', [0, s2 + 1], `Waar heeft de grafiek dezelfde hoogte als op t = 1?`, { lijnen: [{ f: () => H1, tex: `H = ${td(H1, 2)}` }] }), write: [`${td(c)}t = \\pi - ${td(c)} \\;\\vee\\; ${td(c)}t = ${td(c)} + 2\\pi`] }),
                num('Eerste', 'Wat is het eerste tijdstip na t = 1? Rond af op 2 decimalen.', [s1], { dp: 2, write: [`t = \\dfrac{\\pi - ${td(c)}}{${td(c)}} ${eqd(s1, 2)}`] }),
                num('Tweede', 'En het tweede? (Tip: tel een periode op bij t = 1.)', [s2], { dp: 2, write: [`t = 1 + ${td(P, 2)} ${eqd(s2, 2)}`] }),
              ],
              final: [{ label: 't', answers: [s1, s2], dp: 2 }], verify: () => near(H(s1), H1, 1e-9) && near(H(s2), H1, 1e-9) && s1 > 1 && s1 < s2,
            },
          ],
        };
      },
    },

    rad: {
      titel: 'Het reuzenrad', soort: 'Een sinusoïde opstellen',
      rand: () => ({ D: pick([40, 50, 60, 100]), h0: pick([2, 3, 5]), T: pick([8, 10, 12, 20]), laag: Math.random() < 0.5, s: pick([0.5, -0.5, 0.8]) }),
      build({ D, h0, T, laag, s }) {
        const a = h0 + D / 2, b = D / 2, c = 2 * Math.PI / T, d = laag ? T / 4 : 0, h = t => a + b * Math.sin(c * (t - d));
        const Hs = a + b * s, u1 = Math.asin(s), sols = [];
        for (let k = -1; k <= 3; k++) [u1, Math.PI - u1].forEach(u => { const t = d + (u + 2 * Math.PI * k) / c; if (t > 1e-9) sols.push(t); });
        const two = uniqSort(sols).slice(0, 2), tops = [0, 1, 2].map(k => d + T / 4 + k * T).filter(t => t > 1e-9);
        const tops3 = tops.length === 3 ? tops : [...tops, tops[tops.length - 1] + T];
        return {
          intro: `<p>Een reuzenrad heeft een diameter van ${D} meter. Het laagste punt van het rad ligt ${h0} meter boven de grond. Het rad draait met constante snelheid en gaat in ${T} minuten één keer rond. Op t = 0 is een cabine ${laag ? 'in het laagste punt' : 'op dezelfde hoogte als de as en gaat ze omhoog'}. De hoogte van de cabine is te beschrijven met \\(h = a + b\\sin(c(t - d))\\), met t in minuten en h in meters.</p>`,
          figuur: null,
          delen: [
            {
              pt: 'a', topic: 'sin-abcd', pts: 5, prompt: 'Bereken a, b, c en d. Rond c af op 3 decimalen.',
              steps: [
                num('a', 'a is de evenwichtsstand: de hoogte van de as. Hoe groot is a?', [a], { dp: 1, th: ['sin-abcd'], write: [`a = ${h0} + \\tfrac12 \\cdot ${D} = ${td(a)}`] }),
                num('b', 'b is de amplitude: de straal van het rad. Hoe groot is b?', [b], { dp: 1, write: [`b = ${td(b)}`] }),
                num('c', 'Bereken c uit de periode. Rond af op 3 decimalen.', [c], { dp: 3, write: [`c = \\dfrac{2\\pi}{${T}} ${eqd(c, 3)}`] }),
                num('d', 'd is een tijdstip waarop de cabine op de evenwichtsstand is en omhoog gaat. Kies de kleinste d ≥ 0.', [d], {
                  dp: 2, hint: laag ? 'Vanaf het laagste punt duurt het een kwart periode tot de cabine op hoogte a is.' : 'Op t = 0 is de cabine al op hoogte a en gaat omhoog.',
                  fig: plotFig(h, 'h(t)', [0, 1.5 * T], 'De hoogte van de cabine. Waar gaat de grafiek omhoog door de evenwichtsstand?', { lijnen: [{ f: () => a, tex: `h = ${nl(a)}` }] }),
                  write: [`d = ${td(d)}`],
                }),
              ],
              final: [{ label: 'a', answers: [a], dp: 1 }, { label: 'b', answers: [b], dp: 1 }, { label: 'c', answers: [c], dp: 3 }, { label: 'd', answers: [d], dp: 2 }],
              verify: () => near(h(laag ? 0 : T / 2), laag ? h0 : a, 1e-9) && near(h(d + T / 4), h0 + D, 1e-9),
            },
            {
              pt: 'b', topic: 'sin-tijdstip', pts: 4, prompt: `Bereken algebraïsch de eerste twee tijdstippen waarop de cabine op ${nl(Hs, 2)} meter hoogte is. Rond af op 2 decimalen.`,
              steps: [
                num('sin', `Schrijf als \\(\\sin(${td(c, 3)}(t - ${td(d)})) = \\ldots\\). Wat staat er rechts?`, [s], { dp: 2, th: ['sin-tijdstip'], write: [`${td(a)} + ${td(b)}\\sin(${td(c, 3)}(t - ${td(d)})) = ${td(Hs, 2)}`, `\\sin(${td(c, 3)}(t - ${td(d)})) = ${td(s)}`] }),
                mc('Hoeken', 'Welke twee hoeken horen bij één periode?', [
                  opt(M(`${td(u1, 3)} \\;\\text{en}\\; \\pi - ${td(u1, 3)}`), true, 'Klopt: sin(x) = sin(π − x).'),
                  opt(M(`${td(u1, 3)} \\;\\text{en}\\; -${td(u1, 3)}`), false, 'Dat geldt voor de cosinus, niet voor de sinus.'),
                ], { write: [`${td(c, 3)}(t - ${td(d)}) = ${td(u1, 3)} + k \\cdot 2\\pi \\;\\vee\\; ${td(c, 3)}(t - ${td(d)}) = \\pi - ${td(u1, 3)} + k \\cdot 2\\pi`] }),
                num('Tijdstippen', 'Wat zijn de eerste twee tijdstippen na t = 0?', two, { dp: 2, hint: 'Kom je op een negatieve t uit? Tel er dan een periode bij op.', write: [`t \\approx ${td(two[0], 2)} \\;\\vee\\; t \\approx ${td(two[1], 2)}`] }),
              ],
              final: [{ label: 't', answers: two, dp: 2 }], verify: () => two.every(t => near(h(t), Hs, 1e-7)) && two[0] > 0,
            },
            {
              pt: 'c', topic: 'sin-top', pts: 3, prompt: 'Bereken de eerste drie tijdstippen na t = 0 waarop de cabine in het hoogste punt is.',
              steps: [
                mc('Top', 'Hoe lang na d is de cabine in het hoogste punt?', [
                  opt('Een kwart periode', true, 'Klopt: vanaf de evenwichtsstand omhoog duurt het een kwart periode tot de top.'),
                  opt('Een halve periode', false, 'Na een halve periode is de cabine weer op de evenwichtsstand.'),
                  opt('Een hele periode', false, 'Dan is ze terug op het beginpunt.'),
                ], { th: ['sin-top'], write: [`t_{top} = ${td(d)} + \\tfrac14 \\cdot ${T} = ${td(d + T / 4)}`] }),
                num('Tijdstippen', 'Wat zijn de eerste drie tijdstippen?', tops3, { dp: 2, hint: 'Tel er steeds een periode bij op.', write: [tops3.map(t => `t = ${td(t)}`).join(',\\; ')] }),
              ],
              final: [{ label: 't', answers: tops3, dp: 2 }], verify: () => tops3.every(t => near(h(t), h0 + D, 1e-9)),
            },
          ],
        };
      },
    },
  },

  /* ================= lineaire en exponentiële groei ================= */
  groei: {
    kolonie: {
      titel: 'Een bacteriekolonie', soort: 'Exponentiële groei met e',
      rand: () => pick([{ W0: 576, f: 1.25 }, { W0: 400, f: 1.2 }, { W0: 500, f: 1.5 }, { W0: 640, f: 1.25 }, { W0: 300, f: 1.4 }].map(x => ({ ...x, G: pick([2000, 2500, 3000]), Q: pick([100, 150, 200]) }))),
      build({ W0, f, G, Q }) {
        const W1 = W0 * f, b = Math.log(f), Td = Math.log(2) / b * 60, tG = Math.log(G / W0) / b;
        const W2 = t => (W0 - Q * t) * Math.exp(b * t), dW2 = Math.exp(b) * (-Q + (W0 - Q) * b);
        return {
          intro: `<p>Een bioloog onderzoekt de groei van een kolonie bacteriën. Op t = 0 weegt de kolonie ${W0} milligram, één uur later (t = 1) ${nl(W1)} milligram. Hij beschrijft de groei met een formule van de vorm \\(W = a \\cdot e^{bt}\\), met W in milligram en t in uren.</p>`,
          figuur: null,
          delen: [
            {
              pt: 'a', topic: 'groei-model', pts: 4, prompt: 'Bereken algebraïsch de waarden van a en b. Rond b af op 4 decimalen.',
              steps: [
                num('a', 'Vul t = 0 in. Hoe groot is a?', [W0], { dp: 0, th: ['groei-model'], write: [`W(0) = a \\cdot e^0 = a = ${W0}`] }),
                mc('b', `Welke vergelijking geeft b?`, [
                  opt(M(`${W0} \\cdot e^{b} = ${td(W1)} \\Rightarrow b = \\ln(${td(f)})`), true, 'Klopt: deel door ' + W0 + ' en neem de ln.'),
                  opt(M(`b = \\dfrac{${td(W1)}}{${W0}} = ${td(f)}`), false, `Dat is de groeifactor e^b, nog niet b zelf.`),
                  opt(M(`b = ${td(f)} - 1 = ${td(f - 1)}`), false, `Dat is het groeipercentage als getal, niet de exponent bij e.`),
                ], { write: [`e^{b} = \\dfrac{${td(W1)}}{${W0}} = ${td(f)}`] }),
                num('b', 'Reken b uit. Rond af op 4 decimalen.', [b], { dp: 4, write: [`b = \\ln(${td(f)}) ${eqd(b, 4)}`] }),
              ],
              final: [{ label: 'a', answers: [W0], dp: 0 }, { label: 'b', answers: [b], dp: 4 }], verify: () => near(W0 * Math.exp(b), W1, 1e-9),
            },
            {
              pt: 'b', topic: 'groei-verdubbel', pts: 4, prompt: 'Bereken algebraïsch de tijd waarin het gewicht van de kolonie verdubbelt. Geef je antwoord in hele minuten.',
              steps: [
                mc('Vergelijking', 'Welke vergelijking los je op?', [
                  opt(M(`e^{${td(b, 4)}t} = 2`), true, 'Klopt: het beginaantal valt weg.'),
                  opt(M(`${W0} \\cdot e^{${td(b, 4)}t} = 2`), false, 'Het gewicht moet 2 · ' + W0 + ' worden, niet 2.'),
                  opt(M(`${td(b, 4)}t = 2`), false, 'De t staat in de exponent: je hebt de ln nodig.'),
                ], { th: ['groei-verdubbel'], write: [`e^{${td(b, 4)}t} = 2 \\Rightarrow t = \\dfrac{\\ln 2}{${td(b, 4)}}`] }),
                num('Minuten', 'Reken uit en zet om in hele minuten.', [Td], { dp: 0, write: [`t ${eqd(Td / 60, 4)} \\text{ uur} ${eqd(Td, 0)} \\text{ minuten}`] }),
              ],
              final: [{ label: 'minuten', answers: [Td], dp: 0 }], verify: () => near(Math.exp(b * Td / 60), 2, 1e-9),
            },
            {
              pt: 'c', topic: 'groei-tijdstip', pts: 4, prompt: `Bereken algebraïsch na hoeveel uur de kolonie volgens deze formule ${G} milligram weegt. Rond af op 2 decimalen.`,
              steps: [
                mc('Macht vrij', 'Maak eerst de e-macht vrij. Wat krijg je?', [
                  opt(M(`e^{${td(b, 4)}t} = \\dfrac{${G}}{${W0}}`), true, 'Klopt.'),
                  opt(M(`e^{${td(b, 4)}t} = ${G} - ${W0}`), false, `Je deelt door ${W0}, je trekt het niet af.`),
                ], { th: ['groei-tijdstip'], write: [`e^{${td(b, 4)}t} = \\dfrac{${G}}{${W0}}`] }),
                num('t', 'Neem de ln aan beide kanten en los op. Rond af op 2 decimalen.', [tG], { dp: 2, fig: plotFig(t => W0 * Math.exp(b * t), 'W(t)', [0, tG + 1], 'Waar snijdt de grafiek de horizontale lijn?', { lijnen: [{ f: () => G, tex: `W = ${G}` }] }), write: [`t = \\dfrac{\\ln(${td(G / W0, 4)})}{${td(b, 4)}} ${eqd(tG, 2)}`] }),
              ],
              final: [{ label: 't', answers: [tG], dp: 2 }], verify: () => near(W0 * Math.exp(b * tG), G, 1e-6),
            },
            {
              pt: 'd', topic: 'groei-snelheid', pts: 5,
              info: `<p>Later blijkt de groei af te remmen. De bioloog gebruikt dan de formule \\(W = (${W0} - ${Q}t) \\cdot e^{${td(b, 4)}t}\\).</p>`,
              prompt: 'Bereken algebraïsch de groeisnelheid \\(\\dfrac{dW}{dt}\\) op t = 1. Geef je antwoord in milligram per uur nauwkeurig.',
              steps: [
                mc('Regel', 'Met welke regel differentieer je W?', [
                  opt('Productregel, met de kettingregel voor de e-macht', true, 'Klopt: W is (…) · e^(…).'),
                  opt('Alleen de kettingregel', false, 'Er staan twee factoren met t: dat vraagt de productregel.'),
                  opt('Quotiëntregel', false, 'Er staat geen breuk.'),
                ], { th: ['groei-snelheid', 'opt-afgeleide'] }),
                mc('Afgeleide', 'Wat is dW/dt?', [
                  opt(M(`-${Q}e^{${td(b, 4)}t} + (${W0} - ${Q}t) \\cdot ${td(b, 4)}e^{${td(b, 4)}t}`), true, 'Klopt: f′ · g + f · g′.'),
                  opt(M(`-${Q} \\cdot ${td(b, 4)}e^{${td(b, 4)}t}`), false, 'Bij een product differentieer je niet elke factor los en vermenigvuldig je niet de afgeleiden.'),
                  opt(M(`-${Q}e^{${td(b, 4)}t} + (${W0} - ${Q}t)e^{${td(b, 4)}t}`), false, 'Vergeet de factor ' + nl(b, 4) + ' uit de kettingregel niet.'),
                ], { write: [`\\dfrac{dW}{dt} = -${Q}e^{${td(b, 4)}t} + (${W0} - ${Q}t) \\cdot ${td(b, 4)}e^{${td(b, 4)}t}`] }),
                num('Snelheid', 'Vul t = 1 in. Rond af op hele milligram per uur.', [dW2], { dp: 0, write: [`\\dfrac{dW}{dt}(1) ${eqd(dW2, 0)} \\text{ mg per uur}`] }),
              ],
              final: [{ label: 'dW/dt', answers: [dW2], dp: 0 }], verify: () => Math.abs((W2(1 + 1e-6) - W2(1 - 1e-6)) / 2e-6 - dW2) < 1e-3,
            },
          ],
        };
      },
    },

    app: {
      titel: 'Een nieuwe app', soort: 'Groei, rijen en grenswaarde',
      rand: () => ({ N0: pick([4000, 5000, 8000]), g: pick([1.08, 1.1, 1.12]), I1: pick([500, 800, 1000]), r: pick([3, 4, 5]), G: pick([200000, 400000, 500000]), K: pick([49, 99, 199]), h: pick([0.7, 0.8]), frac: pick([0.9, 0.99]) }),
      build({ N0, g, I1, r, G, K, h, frac }) {
        const N12 = Math.round(N0 * g ** 12 / 10) * 10, gg = (N12 / N0) ** (1 / 12), pct = (gg - 1) * 100, Td = Math.log(2) / Math.log(gg);
        const rr = 1 + r / 100, S = I1 * (rr ** 24 - 1) / (rr - 1), doel = frac * G, td2 = Math.log((G / doel - 1) / K) / Math.log(h);
        return {
          intro: `<p>Een nieuwe app wordt gelanceerd op t = 0, met t in maanden. Een maand na de lancering zijn er ${N0} gebruikers, een jaar later ${N12}. Het aantal gebruikers groeide in dat jaar exponentieel.</p>`,
          figuur: null,
          delen: [
            {
              pt: 'a', topic: 'groei-factor', pts: 4, prompt: 'Bereken het groeipercentage per maand. Rond af op 1 decimaal.',
              steps: [
                mc('Groeifactor', 'Hoe vind je de groeifactor per maand?', [
                  opt(M(`g = \\left(\\dfrac{${N12}}{${N0}}\\right)^{1/12}`), true, 'Klopt: twaalf maanden groei, dus de twaalfdemachtswortel.'),
                  opt(M(`g = \\dfrac{${N12}}{${N0}} : 12`), false, 'Delen door 12 hoort bij lineaire groei.'),
                  opt(M(`g = \\left(\\dfrac{${N12}}{${N0}}\\right)^{12}`), false, 'Je zoekt de factor voor één maand: de macht 1/12.'),
                ], { th: ['groei-factor'], write: [`g = \\left(\\dfrac{${N12}}{${N0}}\\right)^{1/12} ${eqd(gg, 4)}`] }),
                num('Procent', 'Hoeveel procent groei per maand is dat? Rond af op 1 decimaal.', [pct], { dp: 1, write: [`${td(gg, 4)} - 1 = ${td(gg - 1, 4)} \\Rightarrow ${td(pct, 1)}\\%`] }),
              ],
              final: [{ label: 'procent', answers: [pct], dp: 1 }], verify: () => near(N0 * gg ** 12, N12, 1e-6),
            },
            {
              pt: 'b', topic: 'groei-verdubbel', pts: 3, prompt: 'Bereken met de groeifactor uit vraag a de verdubbelingstijd in maanden. Rond af op 1 decimaal.',
              steps: [
                mc('Vergelijking', 'Welke vergelijking los je op?', [opt(M(`${td(gg, 4)}^t = 2`), true, 'Klopt.'), opt(M(`${td(gg, 4)} \\cdot t = 2`), false, 'Bij exponentiële groei staat t in de exponent.')], { th: ['groei-verdubbel'] }),
                num('T', 'Reken uit met de log. Rond af op 1 decimaal.', [Td], { dp: 1, write: [`t = \\dfrac{\\log 2}{\\log ${td(gg, 4)}} ${eqd(Td, 1)} \\text{ maanden}`] }),
              ],
              final: [{ label: 'maanden', answers: [Td], dp: 1 }], verify: () => near(gg ** Td, 2, 1e-9),
            },
            {
              pt: 'c', topic: 'groei-rij', pts: 5,
              info: `<p>De app verdient in de eerste maand € ${I1} aan advertenties. Daarna nemen de inkomsten elke maand met ${r}% toe.</p>`,
              prompt: 'Bereken, zonder de inkomsten van elke maand apart uit te rekenen, de totale inkomsten in de eerste twee jaar. Rond af op hele euro’s.',
              steps: [
                mc('Soort rij', 'Wat voor rij vormen de maandinkomsten?', [opt(`Meetkundig, met reden ${nl(rr, 2)}`, true, 'Klopt: elke maand keer dezelfde factor.'), opt(`Rekenkundig, met verschil ${r}`, false, 'Er komt elke maand een percentage bij, geen vast bedrag.')], { th: ['groei-rij'] }),
                mc('Formule', 'Welke somformule gebruik je? (formulelijst: Som = (u_{l+1} − u_e)/(r − 1))', [
                  opt(M(`\\text{Som} = \\dfrac{${I1} \\cdot ${td(rr)}^{24} - ${I1}}{${td(rr)} - 1}`), true, 'Klopt: 24 termen, dus u₂₅ = ' + I1 + ' · ' + nl(rr, 2) + '²⁴.'),
                  opt(M(`\\text{Som} = \\dfrac{${I1} \\cdot ${td(rr)}^{23} - ${I1}}{${td(rr)} - 1}`), false, 'Je hebt de term ná de laatste nodig: u₂₅, dus macht 24.'),
                  opt(M(`\\text{Som} = 24 \\cdot ${I1} \\cdot ${td(rr)}^{24}`), false, 'Zo groeit niet elke maand mee.'),
                ], { write: [`\\text{Som} = \\dfrac{${I1} \\cdot ${td(rr)}^{24} - ${I1}}{${td(rr)} - 1}`] }),
                num('Som', 'Reken uit. Rond af op hele euro’s.', [S], { dp: 0, write: [`\\text{Som} ${eqd(S, 0)} \\text{ euro}`] }),
              ],
              final: [{ label: 'som', answers: [S], dp: 0 }], verify: () => { let t = 0; for (let i = 0; i < 24; i++) t += I1 * rr ** i; return near(t, S, 1e-6); },
            },
            {
              pt: 'd', topic: 'groei-grens', pts: 2,
              info: `<p>Na het eerste jaar gebruikt de maker een ander model: \\(N = \\dfrac{${G}}{1 + ${K} \\cdot ${td(h)}^t}\\).</p>`,
              prompt: 'Bereken de grenswaarde van het aantal gebruikers volgens dit model.',
              steps: [
                mc('Op den duur', `Wat gebeurt er met \\(${td(h)}^t\\) als t heel groot wordt?`, [opt('Het nadert 0', true, `Klopt: ${nl(h, 1)} is kleiner dan 1.`), opt('Het wordt heel groot', false, `${nl(h, 1)} is kleiner dan 1, dus het wordt steeds kleiner.`), opt('Het nadert 1', false, 'Een macht van een getal kleiner dan 1 gaat naar 0.')], { th: ['groei-grens'] }),
                num('Grenswaarde', 'Wat is dan de grenswaarde van N?', [G], { dp: 0, fig: plotFig(t => G / (1 + K * h ** t), 'N(t)', [0, Math.log(1 / (K * 100)) / Math.log(h)], 'De grafiek nadert een horizontale lijn.', { lijnen: [{ f: () => G, tex: `N = ${G}` }] }), write: [`N \\to \\dfrac{${G}}{1 + 0} = ${G}`] }),
              ],
              final: [{ label: 'grenswaarde', answers: [G], dp: 0 }], verify: () => Math.abs(G / (1 + K * h ** 200) - G) < 1e-6,
            },
            {
              pt: 'e', topic: 'groei-tijdstip', pts: 4,
              prompt: `Bereken algebraïsch na hoeveel maanden er volgens dit model ${nl(doel, 0)} gebruikers zijn. Rond af op 1 decimaal.`,
              steps: [
                mc('Vrijmaken', 'Wat krijg je als je de macht vrijmaakt?', [
                  opt(M(`${td(h)}^t = \\dfrac{${G} / ${td(doel, 0)} - 1}{${K}}`), true, 'Klopt: eerst de noemer, dan −1, dan delen door ' + K + '.'),
                  opt(M(`${td(h)}^t = \\dfrac{${td(doel, 0)}}{${G} \\cdot ${K}}`), false, 'Werk stap voor stap: noemer naar de andere kant, dan pas delen.'),
                ], { th: ['groei-tijdstip'], write: [`1 + ${K} \\cdot ${td(h)}^t = \\dfrac{${G}}{${td(doel, 0)}}`, `${td(h)}^t = ${td((G / doel - 1) / K, 6)}`] }),
                num('t', 'Neem de log en los op. Rond af op 1 decimaal.', [td2], { dp: 1, write: [`t = \\dfrac{\\log(${td((G / doel - 1) / K, 6)})}{\\log(${td(h)})} ${eqd(td2, 1)}`] }),
              ],
              final: [{ label: 't', answers: [td2], dp: 1 }], verify: () => near(G / (1 + K * h ** td2), doel, 1e-6),
            },
          ],
        };
      },
    },
  },
};
