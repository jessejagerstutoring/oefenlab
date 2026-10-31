// Controleert de oefeningen van alle onderdelen behalve opgave 1 (die heeft een eigen test).
// Draaien (in de map website): node tests/onderdelen.test.mjs
//
// Per generator en niveau worden veel sommen gemaakt. Elke som moet netjes in elkaar zitten
// (precies één goed antwoord per meerkeuzestap, geen NaN, een geldig eindantwoord) en het
// eindantwoord moet kloppen volgens verify(): die rekent het antwoord op een andere manier na.
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';

const dir = new URL('../content/', import.meta.url);
const read = p => readFileSync(new URL(p, dir), 'utf8');
const SKIP = new Set(['vak.js', 'examenanalyse.js', 'opgave-1.js', 'naslag.js']);
const files = readdirSync(new URL('wiskunde-a/', dir)).filter(f => f.endsWith('.js') && !SKIP.has(f));
const SAMPLES = 150;
let total = 0, failed = 0;

for (const f of files) {
  const ctx = vm.createContext({ console, Math });
  vm.runInContext([read('gedeeld.js'), read('wiskunde-a/vak.js'), read('wiskunde-a/examenanalyse.js'), read('wiskunde-a/' + f), ';this.COURSE = COURSE; this.VAK = VAK; this.EXAMENANALYSE = EXAMENANALYSE;'].join('\n'), ctx);
  const C = ctx.COURSE, fails = [];
  let count = 0;
  for (const [key, G] of Object.entries(C.gens)) {
    if (!ctx.VAK.vaardigheden[G.topic]) fails.push(`${key}: vaardigheid "${G.topic}" staat niet in vak.js`);
    if (!ctx.EXAMENANALYSE.vaardigheden[G.topic]) fails.push(`${key}: vaardigheid "${G.topic}" komt niet voor in de examenanalyse`);
    for (const lvl of [1, 2, 3]) for (let i = 0; i < SAMPLES; i++) {
      let p;
      try { p = C.makeProblem(key, null, null, lvl); } catch (e) { fails.push(`${key} niveau ${lvl}: crasht (${e.message})`); break; }
      count++;
      const bad = m => fails.push(`${key} niveau ${lvl}: ${m}\n      ${String(p.prompt).replace(/\s+/g, ' ').slice(0, 150)}`);
      if (!p.prompt || !p.steps || !p.steps.length) { bad('geen vraag of stappen'); continue; }
      if (/NaN|undefined|Infinity/.test(p.prompt + JSON.stringify(p.steps.map(s => [s.q, s.write, s.options && s.options.map(o => o.h + o.why), s.hint])))) bad('toont NaN of undefined');
      p.steps.forEach((s, j) => {
        if (s.kind === 'mc') {
          const ok = s.options.filter(o => o.ok).length;
          if (ok !== 1) bad(`stap ${j + 1} (${s.label}) heeft ${ok} goede opties`);
          if (s.options.length < 2) bad(`stap ${j + 1} heeft minder dan 2 opties`);
        } else if (s.kind === 'num') {
          if (!s.answers.length || s.answers.some(v => !Number.isFinite(v))) bad(`stap ${j + 1} (${s.label}) heeft geen geldig antwoord`);
          const typed = C.ansText(s.answers, s.dp);
          if (!C.checkAns(s.answers, typed, s.dp).ok) bad(`stap ${j + 1}: eigen antwoord "${typed}" wordt afgekeurd`);
        } else bad(`stap ${j + 1}: onbekend soort ${s.kind}`);
      });
      if (!p.final || p.final.some(fl => fl.answers.some(v => !Number.isFinite(v)))) bad('ongeldig eindantwoord');
      if (typeof p.verify !== 'function') bad('geen verify()');
      else { let r; try { r = p.verify(); } catch (e) { r = false; } if (!r) bad('verify() keurt het antwoord af'); }
      if (p.plot) { try { p.plot.curves.forEach(c => c.f(p.plot.keys[0])); } catch (e) { bad('grafiek crasht'); } }
    }
  }
  total += count;
  if (fails.length) {
    failed += fails.length;
    const uniq = [...new Map(fails.map(x => [x.split('\n')[0].replace(/niveau \d/, ''), x])).values()];
    console.log(`✗ ${f}: ${fails.length} problemen in ${count} sommen`);
    uniq.slice(0, 12).forEach(x => console.log('    ' + x));
  } else console.log(`✓ ${f}: ${count} sommen, ${Object.keys(C.gens).length} soorten, alles klopt`);
}
if (failed) process.exit(1);
console.log(`\nIn totaal ${total} sommen gecontroleerd.`);
