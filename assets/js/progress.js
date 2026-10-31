/*
 * Voortgang van de leerling.
 *
 * Alles wat we over een leerling bewaren, gaat via dit ene bestand. Het staat altijd in de
 * browser (localStorage). Is de leerling ingelogd, dan koppelt account.js er een account aan:
 * dan komt de voortgang uit het account en gaat elke wijziging daar ook naartoe.
 *
 * Opslag, per cursus:
 *   stats    { n: gemaakt, c: zonder hulp, s: op rij }
 *   topics   { [onderwerp]: { n: gemaakt, c: zonder hulp, at: laatst geoefend (ms) } }
 *   exams    { [nummer]: { best, tot, at } }
 *   prefs    { level, mode }
 *   resume   waar de leerling was gebleven (of null)
 */
const Voortgang = (() => {
  const KEY = 'oefenlab:v1';
  const empty = () => ({ v: 1, courses: {} });
  const listeners = new Set();
  let data = empty();
  let remote = null;          // { load(id), save(id, obj) } zolang er iemand is ingelogd
  const dirty = new Set();
  let timer = null;

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const write = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };
  const emit = () => listeners.forEach(fn => { try { fn(); } catch (e) {} });

  data = read() || empty();

  // de eerste versie van de opgave 1-trainer bewaarde zijn tellers onder losse sleutels
  if (!data.courses['wiskunde-a-opgave-1']) {
    try {
      const old = JSON.parse(localStorage.getItem('opg1-stats') || 'null');
      if (old) { data.courses['wiskunde-a-opgave-1'] = { stats: { n: old.n || 0, c: old.c || 0, s: old.s || 0 } }; write(); }
    } catch (e) {}
  }

  const blank = () => ({ stats: { n: 0, c: 0, s: 0 }, topics: {}, exams: {}, prefs: {}, resume: null });
  const course = id => (data.courses[id] = Object.assign(blank(), data.courses[id]));
  const hasProgress = c => !!(c && c.stats && c.stats.n);

  function changed(id) {
    write();
    if (!remote) return;
    dirty.add(id);
    clearTimeout(timer);
    timer = setTimeout(flush, 800);
  }
  async function flush() {
    clearTimeout(timer);
    if (!remote) return;
    for (const id of [...dirty]) {
      dirty.delete(id);
      try { await remote.save(id, data.courses[id]); } catch (e) { dirty.add(id); }
    }
  }
  addEventListener('pagehide', flush);
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

  function cursus(id) {
    return {
      get stats() { return course(id).stats; },
      get prefs() { return course(id).prefs; },
      get resume() { return course(id).resume; },
      topic: t => course(id).topics[t] || { n: 0, c: 0, at: 0 },
      exam: n => course(id).exams[n] || null,

      /* een som is af: clean = zonder hulp */
      finish(topicId, clean) {
        const c = course(id);
        c.stats.n++;
        if (clean) { c.stats.c++; c.stats.s++; } else c.stats.s = 0;
        if (topicId) {
          const t = c.topics[topicId] = c.topics[topicId] || { n: 0, c: 0, at: 0 };
          t.n++; if (clean) t.c++; t.at = Date.now();
          t.r = [...(t.r || []), clean ? 1 : 0].slice(-5); // de laatste vijf pogingen
        }
        changed(id);
      },
      examDone(n, got, tot) {
        const c = course(id), prev = c.exams[n];
        c.exams[n] = { best: Math.max(got, prev ? prev.best : 0), tot, at: Date.now() };
        changed(id);
      },
      setPrefs(p) { Object.assign(course(id).prefs, p); changed(id); },
      setResume(r) { course(id).resume = r; changed(id); },
    };
  }

  /* Inloggen: de voortgang uit het account wordt leidend. Heeft het account nog niets,
     dan nemen we mee wat de leerling op dit apparaat al had geoefend. */
  async function koppel(adapter, ids) {
    remote = adapter;
    for (const id of ids) {
      const theirs = await adapter.load(id);
      if (hasProgress(theirs) || (theirs && !hasProgress(data.courses[id]))) data.courses[id] = Object.assign(blank(), theirs);
      else if (hasProgress(data.courses[id])) { dirty.add(id); }
    }
    write(); emit();
    await flush();
  }
  /* Uitloggen: alles van dit apparaat wissen, zodat de volgende leerling op deze computer
     niet verder gaat met de voortgang van de vorige. */
  async function ontkoppel() {
    await flush();
    remote = null; dirty.clear();
    data = empty(); write(); emit();
  }

  /* Hoe goed gaat een vaardigheid nu? Gebaseerd op de laatste vijf pogingen, zodat oude fouten
     niet blijven hangen. Oudere voortgang zonder die lijst valt terug op de totalen. */
  const STATUS = {
    nieuw: { label: 'Nog niet geoefend', kort: 'Nieuw', teken: '○' },
    lastig: { label: 'Lastig', kort: 'Lastig', teken: '!' },
    bijna: { label: 'Bijna', kort: 'Bijna', teken: '◐' },
    kan: { label: 'Kan ik', kort: 'Kan ik', teken: '✓' },
  };
  function status(t) {
    if (!t || !t.n) return 'nieuw';
    const r = t.r && t.r.length ? t.r : [...Array(Math.min(5, t.n - t.c)).fill(0), ...Array(Math.min(5, t.c)).fill(1)].slice(-5);
    const goed = r.reduce((s, x) => s + x, 0);
    if (r.length >= 3 && goed >= r.length - 1 && goed >= 3) return 'kan';
    if (goed >= Math.ceil(r.length / 2)) return 'bijna';
    return 'lastig';
  }

  return { cursus, koppel, ontkoppel, flush, onChange: fn => listeners.add(fn), status, STATUS };
})();
