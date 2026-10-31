/*
 * Voortgang van de leerling.
 *
 * Alles wat we over een leerling bewaren, gaat via dit ene bestand. Nu staat het in de
 * browser (localStorage), dus per apparaat. Komen er later accounts, dan hoeft alleen dit
 * bestand te veranderen: de rest van de site gebruikt alleen Voortgang.cursus(id).
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
  let data = empty();

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const write = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };

  data = read() || empty();

  // de eerste versie van de opgave 1-trainer bewaarde zijn tellers onder losse sleutels
  if (!data.courses['wiskunde-a-opgave-1']) {
    try {
      const old = JSON.parse(localStorage.getItem('opg1-stats') || 'null');
      if (old) { data.courses['wiskunde-a-opgave-1'] = { stats: { n: old.n || 0, c: old.c || 0, s: old.s || 0 } }; write(); }
    } catch (e) {}
  }

  function cursus(id) {
    const c = data.courses[id] = Object.assign({ stats: { n: 0, c: 0, s: 0 }, topics: {}, exams: {}, prefs: {}, resume: null }, data.courses[id]);
    return {
      get stats() { return c.stats; },
      get prefs() { return c.prefs; },
      get resume() { return c.resume; },
      topic: id => c.topics[id] || { n: 0, c: 0, at: 0 },
      exam: n => c.exams[n] || null,

      /* een som is af: clean = zonder hulp */
      finish(topicId, clean) {
        c.stats.n++;
        if (clean) { c.stats.c++; c.stats.s++; } else c.stats.s = 0;
        if (topicId) {
          const t = c.topics[topicId] = c.topics[topicId] || { n: 0, c: 0, at: 0 };
          t.n++; if (clean) t.c++; t.at = Date.now();
        }
        write();
      },
      examDone(n, got, tot) {
        const prev = c.exams[n];
        c.exams[n] = { best: Math.max(got, prev ? prev.best : 0), tot, at: Date.now() };
        write();
      },
      setPrefs(p) { Object.assign(c.prefs, p); write(); },
      setResume(r) { c.resume = r; write(); },
    };
  }

  return { cursus };
})();
