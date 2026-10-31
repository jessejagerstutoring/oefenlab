// Controleert alle sommen van Wiskunde A · Opgave 1.
// Draaien (in de map website): node tests/opgave-1.test.mjs
//
// Per generator en niveau maken we een flink aantal willekeurige sommen, plus alle echte
// tentamenvragen. Elke som moet netjes in elkaar zitten (precies één goed antwoord per
// meerkeuzestap, geen NaN) én wiskundig kloppen: de eindantwoorden lossen de vergelijking
// echt op, en bij hellingsvragen klopt de helling met de grafiek.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const file = new URL('../content/wiskunde-a/opgave-1.js', import.meta.url);
const ctx = vm.createContext({ console });
vm.runInContext(readFileSync(new URL("../content/gedeeld.js", import.meta.url), "utf8") + "\n" + readFileSync(file, "utf8") + ";this.COURSE = COURSE;", ctx);
const C = ctx.COURSE;

const SAMPLES = 60;
const EQUATION = new Set(['kwadr', 'kubisch', 'macht', 'snij', 'e1', 'e2', 'e3', 'e4', 'lg', 'wortel', 'lijn']);
const fails = [];
let count = 0;

const close = (a, b, rel = 1e-6) => Math.abs(a - b) <= rel * (1 + Math.abs(a) + Math.abs(b));
const slope = (f, x) => { const h = 1e-5 * (1 + Math.abs(x)); return (f(x + h) - f(x - h)) / (2 * h); };

function check(p, label) {
  count++;
  const bad = msg => fails.push(`${label}: ${msg}\n    ${p.prompt.replace(/\s+/g, ' ').slice(0, 140)}`);
  if (!p.prompt || !p.steps?.length) return bad('geen vraag of geen stappen');
  if (!(p.pts > 0)) bad('geen punten');
  if (!TOPIC_IDS.has(p.topic)) bad(`onbekend onderwerp "${p.topic}"`);

  p.steps.forEach((s, i) => {
    const at = `stap ${i + 1} (${s.label})`;
    if (!s.q) bad(`${at} heeft geen vraag`);
    if (s.kind === 'mc') {
      const ok = s.options.filter(o => o.ok).length;
      if (s.options.length < 2) bad(`${at} heeft minder dan 2 opties`);
      if (ok !== 1) bad(`${at} heeft ${ok} goede opties`);
      if (new Set(s.options.map(o => o.h)).size !== s.options.length) bad(`${at} heeft dubbele opties`);
      s.options.forEach(o => { if (!o.why) bad(`${at}: optie zonder uitleg`); });
    } else if (s.kind === 'num') {
      if (!Array.isArray(s.answers) || s.answers.some(v => !Number.isFinite(v))) bad(`${at} heeft een ongeldig antwoord`);
    } else bad(`${at} heeft onbekend soort "${s.kind}"`);
    if (/NaN|undefined|Infinity/.test(s.q + JSON.stringify(s.write || []))) bad(`${at} toont NaN/undefined`);
  });
  if (/NaN|undefined|Infinity/.test(p.prompt)) bad('vraag toont NaN/undefined');

  if (!p.final?.length) return bad('geen eindantwoord');
  p.final.forEach(f => { if (f.answers.some(v => !Number.isFinite(v))) bad(`eindantwoord ${f.label} ongeldig`); });

  // het eindantwoord moet in de app ook als goed worden gerekend
  p.final.forEach(f => {
    const typed = f.answers.length ? C.ansText(f.answers, f.dp || 3) : 'geen';
    if (!C.checkAns(f.answers, typed, f.dp || 3).ok) bad(`eindantwoord "${typed}" wordt zelf afgekeurd`);
  });

  let spec;
  try { spec = C.plotSpec(p); } catch (e) { return bad(`grafiek faalt: ${e.message}`); }
  if (!spec) return;
  if (EQUATION.has(p.key)) {
    const [L, R] = spec.curves.map(c => c.f);
    p.final[0].answers.forEach(x => {
      if (!close(L(x), R(x), 1e-6)) bad(`x = ${x} lost de vergelijking niet op (${L(x)} ≠ ${R(x)})`);
    });
  } else {
    const f = spec.curves[0].f;
    spec.marks.filter(m => m.m !== undefined).forEach(m => {
      const d = slope(f, m.x);
      if (!close(d, m.m, 1e-4)) bad(`helling in x = ${m.x} is ${d}, verwacht ${m.m}`);
    });
  }
}

const TOPIC_IDS = new Set(C.topics.map(t => t.id));
for (const key of Object.keys(C.gens)) {
  if (!TOPIC_IDS.has(C.gens[key].topic)) fails.push(`generator ${key}: onderwerp "${C.gens[key].topic}" staat niet in TOPICS`);
  for (const lvl of [1, 2, 3]) for (let i = 0; i < SAMPLES; i++) {
    let p;
    try { p = C.makeProblem(key, null, null, lvl); } catch (e) { fails.push(`${key} niveau ${lvl}: crasht (${e.message})`); continue; }
    check(p, `${key} niveau ${lvl}`);
  }
}
C.bank.forEach(b => {
  let p;
  try { p = C.makeProblem(b.g, JSON.parse(JSON.stringify(b.p)), b.src); } catch (e) { fails.push(`${b.src}: crasht (${e.message})`); return; }
  check(p, b.src);
});

const uniq = [...new Set(fails.map(f => f.split('\n')[0]))];
if (fails.length) {
  console.log(`✗ ${fails.length} problemen in ${count} sommen. Eerste voorbeelden:\n`);
  const shown = new Set();
  for (const f of fails) { const k = f.split(':')[0] + f.split(':')[1]; if (shown.has(k)) continue; shown.add(k); console.log('  ' + f); if (shown.size >= 25) break; }
  console.log(`\n(${uniq.length} verschillende meldingen)`);
  process.exit(1);
} else console.log(`✓ ${count} sommen gecontroleerd, alles klopt.`);
