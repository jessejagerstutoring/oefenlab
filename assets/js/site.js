/*
 * Openbare pagina's (start, over, veelgestelde vragen, blog, inloggen, privacy):
 * het menu op de telefoon, de taalkeuze en de knop Inloggen.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);

  // menu op de telefoon
  const toggle = $('nav-toggle'), nav = $('site-nav');
  if (toggle && nav) toggle.onclick = () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); };

  // taal: nu alleen Nederlands; Engels staat klaar als keuze
  const lb = $('lang-btn'), lm = $('lang-menu'), note = $('lang-note');
  if (lb && lm) {
    lb.onclick = e => { e.stopPropagation(); lm.hidden = !lm.hidden; lb.setAttribute('aria-expanded', String(!lm.hidden)); };
    document.addEventListener('click', e => { if (!lm.hidden && !lm.contains(e.target)) { lm.hidden = true; lb.setAttribute('aria-expanded', 'false'); } });
    lm.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => {
      lm.hidden = true;
      if (b.dataset.lang === 'en' && note) { note.hidden = false; clearTimeout(note._t); note._t = setTimeout(() => { note.hidden = true; }, 3200); }
    });
  }

  // naar de oefenomgeving: ingelogd direct, anders eerst inloggen
  const page = !!$('login-page');
  Account.onChange(() => {
    document.querySelectorAll('[data-app-link]').forEach(a => { a.href = Account.user ? 'wiskunde-a/index.html' : 'login.html'; });
  });
  Account.init({ courses: [], root: '', page });
})();
