/*
 * Gedeelde bouwstenen voor alle inhoud: rekenhulpjes, het maken van stappen en het
 * controleren van antwoorden. Elk inhoudsbestand (opgave 1, groeimodellen, …) laadt dit eerst.
 */
/* ---------- rekenhulpjes ---------- */
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;
function asFrac(x) { for (let d = 1; d <= 24; d++) { const n = Math.round(x * d); if (near(n / d, x, 1e-9)) return [n, d]; } return null; }
const dec = (x, dp = 3) => { let s = x.toFixed(dp); if (/^-0\.?0*$/.test(s)) s = s.slice(1); return s.replace('.', ','); };
function tn(x, dp = 3) {
  const f = asFrac(x);
  if (!f) { let s = dec(x, dp); if (s.includes(',')) s = s.replace(/0+$/, '').replace(/,$/, ''); return s.replace(',', '{,}'); }
  const [n, d] = f;
  if (d === 1) return String(n);
  return (n < 0 ? '-' : '') + `\\tfrac{${Math.abs(n)}}{${d}}`;
}
const tnp = x => (x < 0 ? `(${tn(x)})` : tn(x));
const eqv = (x, dp = 3) => asFrac(x) ? `= ${tn(x)}` : `\\approx ${dec(x, dp).replace(',', '{,}')}`;
function plain(x, dp = 3) { const f = asFrac(x); if (!f) return dec(x, dp); return f[1] === 1 ? String(f[0]) : `${f[0]}/${f[1]}`; }
const uniqSort = arr => { const out = []; [...arr].sort((a, b) => a - b).forEach(v => { if (!out.some(o => near(o, v, 1e-7))) out.push(v); }); return out; };
const nice = x => !!asFrac(x);

function poly(terms, v = 'x') {
  const t = terms.filter(([c]) => !near(c, 0));
  if (!t.length) return '0';
  return t.map(([c, p], i) => {
    const neg = c < 0, a = Math.abs(c);
    const co = (near(a, 1) && p !== 0) ? '' : tn(a);
    const xs = p === 0 ? '' : p === 1 ? v : `${v}^{${p}}`;
    return (i === 0 ? (neg ? '-' : '') : (neg ? ' - ' : ' + ')) + co + xs;
  }).join('');
}
const mapTerms = m => Object.keys(m).map(Number).sort((a, b) => b - a).filter(p => !near(m[p], 0)).map(p => [m[p], p]);
const ptex = (m, v = 'x') => poly(mapTerms(m), v);
const deriv = m => { const d = {}; Object.keys(m).map(Number).forEach(p => { if (p > 0) d[p - 1] = (d[p - 1] || 0) + p * m[p]; }); return d; };
const evalP = (m, x) => Object.keys(m).reduce((s, p) => s + m[p] * Math.pow(x, Number(p)), 0);
const maxDeg = m => Math.max(...Object.keys(m).map(Number).filter(p => !near(m[p], 0)));
function combine(lhs, rhs) {
  const P = {};
  lhs.forEach(([c, p]) => P[p] = (P[p] || 0) + c);
  rhs.forEach(([c, p]) => P[p] = (P[p] || 0) - c);
  Object.keys(P).forEach(k => { if (near(P[k], 0)) delete P[k]; });
  return P;
}
const subP = (f, g) => { const P = { ...f }; Object.keys(g).forEach(k => P[k] = (P[k] || 0) - g[k]); Object.keys(P).forEach(k => { if (near(P[k], 0)) delete P[k]; }); return P; };
const scaleP = (P, s) => Object.fromEntries(Object.entries(P).map(([k, v]) => [k, v * s]));
const eqTex = (lhs, rhs) => `${poly(lhs)} = ${rhs.length ? poly(rhs) : '0'}`;
const pw = (n, v = 'x') => n === 1 ? v : `${v}^{${n}}`;
const coefDot = a => a === 1 ? '' : `${tn(a)} \\cdot `;
const coefX = v => near(v, 1) ? '' : near(v, -1) ? '-' : tn(v);
const sgnNum = c => (c < 0 ? ' - ' : ' + ') + tn(Math.abs(c));
function quad(a, b, c) {
  const D = b * b - 4 * a * c;
  if (D < -1e-9) return { D, roots: [] };
  if (near(D, 0, 1e-9)) return { D: 0, roots: [-b / (2 * a)] };
  const s = Math.sqrt(D);
  return { D, roots: uniqSort([(-b - s) / (2 * a), (-b + s) / (2 * a)]) };
}
function intNorm(arr) {
  let L = 1;
  arr.forEach(v => { const f = asFrac(v); if (f) L = L * f[1] / gcd(L, f[1]); });
  let r = arr.map(v => Math.round(v * L));
  const g = r.reduce((a, b) => gcd(a, b), 0) || 1;
  r = r.map(v => v / g);
  if (r[0] < 0) r = r.map(v => -v);
  return r;
}
function abcXLines(a, b, c, dp = 3, v = 'x') {
  const { D, roots } = quad(a, b, c);
  const L = [`D = ${tnp(b)}^2 - 4 \\cdot ${tnp(a)} \\cdot ${tnp(c)} = ${tn(D)}`];
  if (!roots.length) L.push(`D < 0 \\;\\Rightarrow\\; \\text{geen oplossingen}`);
  else if (roots.length === 1) L.push(`${v} = \\frac{${tn(-b)}}{${tn(2 * a)}} ${eqv(roots[0], dp)}`);
  else {
    const sD = asFrac(Math.sqrt(D)) ? tn(Math.sqrt(D)) : `\\sqrt{${tn(D)}}`;
    const r1 = (-b - Math.sqrt(D)) / (2 * a), r2 = (-b + Math.sqrt(D)) / (2 * a);
    L.push(`${v} = \\frac{${tn(-b)} - ${sD}}{${tn(2 * a)}} ${eqv(r1, dp)}`);
    L.push(`\\vee\\; ${v} = \\frac{${tn(-b)} + ${sD}}{${tn(2 * a)}} ${eqv(r2, dp)}`);
  }
  return L;
}
const solsLine = (sols, dp = 3, v = 'x') => sols.length ? sols.map(r => `${v} ${eqv(r, dp)}`).join(' \\;\\vee\\; ') : `\\text{geen oplossingen}`;
const ptsTex = (xs, ys) => xs.map((x, i) => `(${tn(x)},\\, ${tn(ys[i])})`).join(' \\text{ en } ');
const lvlOf = l => (l === 1 || l === 3 ? l : 2);

/* ---------- stappen ---------- */
const M = s => `\\(${s}\\)`;
const opt = (h, ok, why) => ({ h, ok, why });
function mc(label, q, options, extra = {}) {
  const seen = new Set(), clean = [];
  options.filter(Boolean).forEach(o => { if (!seen.has(o.h)) { seen.add(o.h); clean.push(o); } });
  return { kind: 'mc', label, q, options: extra.keepOrder ? clean : shuffle(clean), write: [], th: [], ...extra };
}
const num = (label, q, answers, extra = {}) => ({ kind: 'num', label, q, answers, dp: 3, write: [], th: [], ...extra });

/* ---------- invoer controleren ---------- */
function parseNums(t) {
  t = t.replace(/[−–]/g, '-').replace(/∨/g, ';').toLowerCase();
  t = t.replace(/[a-z]+'?\s*(\([^)]*\))?\s*=/g, ' ').replace(/\b(en|of)\b/g, ';');
  const toks = t.split(/[;\s]+/).map(s => s.replace(/[.,]+$/, '')).filter(Boolean);
  const out = [];
  for (const tok of toks) {
    const pm = tok.startsWith('±'), s = pm ? tok.slice(1) : tok;
    let v;
    if (s.includes('/')) { const [a, b] = s.split('/').map(z => Number(z.replace(',', '.'))); v = a / b; }
    else v = Number(s.replace(',', '.'));
    if (!isFinite(v)) return null;
    out.push(v); if (pm) out.push(-v);
  }
  return out;
}
function checkAns(expected, txt, dp = 3) {
  const t = txt.trim().toLowerCase();
  const exps = uniqSort(expected);
  if (!t) return { ok: false, msg: 'Vul eerst een antwoord in.' };
  if (!exps.length) return /geen|∅/.test(t) ? { ok: true } : { ok: false, msg: 'Kijk nog eens goed: deze vergelijking heeft geen oplossing. Typ dan "geen".' };
  if (/geen/.test(t)) return { ok: false, msg: 'Toch wel! Er zijn oplossingen. Probeer het nog eens.' };
  const vals = parseNums(t);
  if (!vals || !vals.length) return { ok: false, msg: 'Ik kan dit niet goed lezen. Typ alleen getallen met een puntkomma ertussen, bijvoorbeeld 0 ; 1/3 ; -2 of 1,683.' };
  const u = uniqSort(vals);
  if (u.length !== exps.length) return { ok: false, msg: `Je gaf ${u.length} ${u.length === 1 ? 'getal' : 'getallen'}, maar er ${exps.length === 1 ? 'hoort er maar 1 te zijn' : `horen er ${exps.length} te zijn`}. ${u.length < exps.length ? 'Mis je er nog een?' : 'Klopt er eentje niet?'}` };
  // goed: de exacte breuk, of netjes afgerond op het gevraagde aantal decimalen
  const tol = v => Math.max(asFrac(v) ? 0.0006 : 0, 0.5 * Math.pow(10, -dp) + 1e-9);
  const used = new Set();
  for (const e of exps) {
    const i = u.findIndex((v, j) => !used.has(j) && Math.abs(v - e) <= tol(e));
    if (i < 0) return { ok: false, msg: exps.length > 1 ? 'Het aantal klopt al, maar een van de getallen nog niet. Reken die nog eens na.' : 'Dit getal klopt nog niet. Reken het nog eens rustig na.' };
    used.add(i);
  }
  return { ok: true };
}
const ansText = (arr, dp = 3) => arr.length ? uniqSort(arr).map(v => plain(v, dp).replace(/^(-?\d+)\/(\d+)$/, '$1/$2')).join(' ; ') : 'geen';

const fmt = v => String(Math.round(v * 1000) / 1000).replace('.', ',').replace('-', '−');

/* ---------- een onderdeel bouwen uit de vaardighedenlijst (vak.js) ----------
 * Elk onderdeel (optimaliseren, groeimodellen, …) levert alleen generators aan.
 * Onderwerpen, kleuren en de uitleg bij "Hoe zat het?" komen uit VAK, zodat alles
 * op één plek staat en de uitleg overal hetzelfde is.
 */
function vakTheorie() {
  const T = {};
  Object.entries(VAK.vaardigheden).forEach(([id, v]) => {
    T[id] = [v.titel, `<p>${v.kort}</p><ol>${v.stappen.map(s => `<li>${s}</li>`).join('')}</ol><p><b>Let op:</b> ${v.valkuil}</p>`];
  });
  return T;
}
// Een getal als 37{,}5 is LaTeX en hoort binnen \( \). In gewone tekst (vraag, hint, uitleg) wordt het 37,5.
const TEKSTVELDEN = new Set(['prompt', 'q', 'hint', 'why', 'before', 'after']);
function zonderTexKomma(o, k) {
  if (typeof o === 'string') return TEKSTVELDEN.has(k) ? o.replace(/(\\\([\s\S]*?\\\))|\{,\}/g, (m, wiskunde) => wiskunde || ',') : o;
  if (Array.isArray(o)) return o.map(x => zonderTexKomma(x, k));
  if (Object.prototype.toString.call(o) === '[object Object]') { for (const key of Object.keys(o)) o[key] = zonderTexKomma(o[key], key); }
  return o;
}
function maakOnderdeel({ onderdeel, gens, home }) {
  const o = VAK.onderdelen.find(x => x.id === onderdeel);
  const topics = Object.entries(VAK.vaardigheden).filter(([id, v]) => v.onderdeel === onderdeel && Object.values(gens).some(g => g.topic === id))
    .map(([id, v]) => ({ id, title: v.titel, short: v.titel, blurb: v.kort, color: o.kleur, soft: o.zacht, sym: o.symbool }));
  return {
    id: `${VAK.id}-${onderdeel}`,
    vak: VAK.id,
    onderdeel,
    subject: VAK.titel,
    title: o.titel,
    color: o.kleur,
    home: home || null,
    topics,
    typeNames: {},
    gens,
    bank: [],
    missing: {},
    theory: vakTheorie(),
    makeProblem(key, params, src, lvl) {
      const G = gens[key];
      const prm = params || G.rand(lvlOf(lvl));
      const p = G.build(JSON.parse(JSON.stringify(prm)));
      p.params = prm; p.key = key; p.src = src || null; p.topic = G.topic;
      // contextopgaven: tijd, aantallen en hoeveelheden zijn niet negatief, dus de grafiek begint bij 0
      if (p.plot && !p.plot.domain) p.plot.domain = [0, Infinity];
      ['prompt', 'steps', 'plot'].forEach(k => { if (p[k]) p[k] = zonderTexKomma(p[k], k); });
      return p;
    },
    checkAns,
    ansText: ansDec,
    plotSpec: () => null,
  };
}
/* getallen netjes in een zin: 1234,5 en 1,25 */
const nl = (x, dp = 2) => { let s = dec(x, dp); if (s.includes(',')) s = s.replace(/0+$/, '').replace(/,$/, ''); return s; };
const mathAns = (x, dp) => `\\(${dec(x, dp).replace(',', '{,}')}\\)`;
/* decimale getallen in formules, zoals het tentamen ze schrijft (geen breuken als 5/4) */
function td(x, dp = 3) { let s = dec(x, dp); if (s.includes(',')) s = s.replace(/0+$/, '').replace(/,$/, ''); return s.replace(',', '{,}'); }
const eqd = (x, dp = 3) => (Math.abs(x - Number(dec(x, dp).replace(',', '.'))) < 1e-9 ? '= ' : '\\approx ') + td(x, dp);
const ansDec = (arr, dp = 3) => arr.length ? uniqSort(arr).map(v => nl(v, dp)).join(' ; ') : 'geen';
