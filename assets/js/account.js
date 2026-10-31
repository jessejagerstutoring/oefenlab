/*
 * Accounts: inloggen, account maken, uitloggen, wachtwoord vergeten.
 *
 * Gebruikt Supabase als config.js is ingevuld. Zonder instellingen doet dit bestand niets
 * zichtbaars en werkt de site gewoon met voortgang in de browser.
 *
 * Een pagina zet <div id="account-slot"></div> in de bovenbalk en roept aan:
 *   Account.init({ courses: ['wiskunde-a-opgave-1'], root: '../' })
 * root is het pad terug naar de hoofdmap (voor de link naar het begeleidersoverzicht).
 */
const Account = (() => {
  const cfg = window.OEFENLAB_CONFIG || {};
  const configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js';
  let sb = null, user = null, profile = null, courses = [], root = '', ready = false;
  const listeners = new Set();
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const emit = () => listeners.forEach(fn => { try { fn(); } catch (e) {} });
  const here = () => location.origin + location.pathname;

  const adapter = {
    async load(id) {
      const { data, error } = await sb.from('progress').select('data').eq('user_id', user.id).eq('course_id', id).maybeSingle();
      if (error) throw error;
      return data ? data.data : null;
    },
    async save(id, obj) {
      const { error } = await sb.from('progress').upsert({ user_id: user.id, course_id: id, data: obj, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
  };

  function loadLib() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = SUPABASE_JS; s.onload = ok; s.onerror = fail;
      document.head.appendChild(s);
    });
  }

  async function setSession(session) {
    const next = session ? session.user : null;
    if ((next && next.id) === (user && user.id) && ready) return;
    user = next; profile = null;
    if (user) {
      const { data } = await sb.from('profiles').select('display_name, role').eq('id', user.id).maybeSingle();
      profile = data || { display_name: '', role: 'leerling' };
      try { await Voortgang.koppel(adapter, courses); } catch (e) { console.warn('Voortgang ophalen mislukt', e); }
    }
    ready = true;
    render(); emit();
  }

  async function init(opts = {}) {
    courses = opts.courses || [];
    root = opts.root || '';
    buildDialog();
    render();
    if (!configured) { ready = true; emit(); return; }
    try { await loadLib(); } catch (e) { ready = true; render(); emit(); return; }
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const { data } = await sb.auth.getSession();
    await setSession(data.session);
    sb.auth.onAuthStateChange((event, session) => {
      // Supabase raadt aan hier niet direct op andere Supabase-aanroepen te wachten
      setTimeout(() => {
        if (event === 'PASSWORD_RECOVERY') open('reset');
        setSession(session);
      }, 0);
    });
  }

  /* ---------- knop in de bovenbalk ---------- */
  function render() {
    const slot = $('account-slot');
    if (!slot) return;
    if (!configured || !ready) { slot.innerHTML = ''; return; }
    if (!user) {
      slot.innerHTML = `<button class="btn" id="acc-open">Inloggen</button>`;
      $('acc-open').onclick = () => open('login');
      return;
    }
    const name = (profile && profile.display_name) || user.email;
    slot.innerHTML = `
      <div class="acc">
        <button class="btn acc-btn" id="acc-menu-btn" aria-haspopup="true" aria-expanded="false"><span class="avatar" aria-hidden="true">${esc(name.trim().charAt(0).toUpperCase() || '?')}</span><span class="lbl">${esc(name.split(' ')[0])}</span></button>
        <div class="acc-menu" id="acc-menu" hidden>
          <div class="acc-who"><b>${esc(name)}</b><span>${esc(user.email)}</span></div>
          ${profile && profile.role === 'begeleider' ? `<a class="acc-item" href="${root}begeleider.html">Overzicht leerlingen</a>` : ''}
          <button class="acc-item" id="acc-logout">Uitloggen</button>
        </div>
      </div>`;
    const btn = $('acc-menu-btn'), menu = $('acc-menu');
    btn.onclick = e => { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden)); };
    $('acc-logout').onclick = logout;
  }
  document.addEventListener('click', e => {
    const menu = $('acc-menu');
    if (menu && !menu.hidden && !menu.contains(e.target)) { menu.hidden = true; $('acc-menu-btn').setAttribute('aria-expanded', 'false'); }
  });

  async function logout() {
    await Voortgang.ontkoppel();
    await sb.auth.signOut();
    user = null; profile = null;
    render(); emit();
  }

  /* ---------- inlogvenster ---------- */
  let mode = 'login';
  function buildDialog() {
    if ($('acc-dlg') || !configured) return;
    document.body.insertAdjacentHTML('beforeend', `
      <dialog id="acc-dlg" class="acc-dlg" aria-labelledby="acc-h">
        <div class="dlg-h"><h2 id="acc-h">Inloggen</h2><button class="btn iconbtn" id="acc-close" aria-label="Sluiten"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
        <form class="acc-form" id="acc-form" novalidate>
          <div class="seg" id="acc-tabs" role="radiogroup" aria-label="Inloggen of account maken">
            <button type="button" role="radio" data-m="login">Inloggen</button><button type="button" role="radio" data-m="signup">Account maken</button>
          </div>
          <label class="fld" id="acc-name-f"><span>Je voornaam</span><input id="acc-name" autocomplete="given-name" maxlength="60"></label>
          <label class="fld" id="acc-email-f"><span>E-mailadres</span><input id="acc-email" type="email" autocomplete="email" required></label>
          <label class="fld" id="acc-pw-f"><span id="acc-pw-l">Wachtwoord</span><input id="acc-pw" type="password" minlength="8" required></label>
          <p class="acc-msg" id="acc-msg" role="alert"></p>
          <button class="btn primary big" type="submit" id="acc-submit">Inloggen</button>
          <button class="linkbtn" type="button" id="acc-forgot">Wachtwoord vergeten?</button>
          <p class="note" id="acc-why">Met een account wordt je voortgang bewaard, ook op een andere computer of je telefoon. We bewaren alleen je voornaam, je e-mailadres en je voortgang. Je begeleider kan je voortgang zien. <a href="${root}privacy.html" target="_blank" rel="noopener">Lees meer over privacy</a>.</p>
        </form>
      </dialog>`);
    $('acc-close').onclick = () => $('acc-dlg').close();
    $('acc-dlg').addEventListener('click', e => { if (e.target === $('acc-dlg')) $('acc-dlg').close(); });
    $('acc-tabs').querySelectorAll('button').forEach(b => b.onclick = () => setMode(b.dataset.m));
    $('acc-forgot').onclick = () => setMode('forgot');
    $('acc-form').onsubmit = e => { e.preventDefault(); submit(); };
  }
  function setMode(m) {
    mode = m;
    const titles = { login: 'Inloggen', signup: 'Account maken', forgot: 'Wachtwoord vergeten', reset: 'Nieuw wachtwoord' };
    const buttons = { login: 'Inloggen', signup: 'Account maken', forgot: 'Stuur een herstellink', reset: 'Wachtwoord opslaan' };
    $('acc-h').textContent = titles[m];
    $('acc-submit').textContent = buttons[m];
    $('acc-tabs').hidden = m === 'forgot' || m === 'reset';
    $('acc-tabs').querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.m === m)));
    $('acc-name-f').hidden = m !== 'signup';
    $('acc-email-f').hidden = m === 'reset';
    $('acc-pw-f').hidden = m === 'forgot';
    $('acc-pw-l').textContent = m === 'login' ? 'Wachtwoord' : 'Wachtwoord (minstens 8 tekens)';
    $('acc-pw').autocomplete = m === 'login' ? 'current-password' : 'new-password';
    $('acc-forgot').hidden = m !== 'login';
    $('acc-why').hidden = m !== 'signup';
    msg('');
  }
  function open(m) {
    if (!$('acc-dlg')) return;
    setMode(m);
    if (!$('acc-dlg').open) $('acc-dlg').showModal();
    (m === 'signup' ? $('acc-name') : m === 'reset' ? $('acc-pw') : $('acc-email')).focus();
  }
  function msg(text, ok) { const el = $('acc-msg'); el.textContent = text; el.className = 'acc-msg' + (ok ? ' ok' : ''); }
  function nice(err) {
    const m = String((err && err.message) || err || '').toLowerCase();
    if (m.includes('invalid login')) return 'Dit e-mailadres of wachtwoord klopt niet.';
    if (m.includes('already registered') || m.includes('already been registered')) return 'Er bestaat al een account met dit e-mailadres. Log dan in.';
    if (m.includes('not confirmed')) return 'Bevestig eerst je e-mailadres met de link in je mail.';
    if (m.includes('rate limit') || m.includes('too many')) return 'Er zijn net te veel pogingen gedaan. Probeer het over een tijdje opnieuw.';
    if (m.includes('password')) return 'Kies een wachtwoord van minstens 8 tekens.';
    if (m.includes('email')) return 'Dit e-mailadres lijkt niet te kloppen.';
    return 'Er ging iets mis. Controleer je internet en probeer het opnieuw.';
  }
  async function submit() {
    const name = $('acc-name').value.trim(), email = $('acc-email').value.trim(), pw = $('acc-pw').value;
    if (mode !== 'reset' && !/^\S+@\S+\.\S+$/.test(email)) return msg('Vul een geldig e-mailadres in.');
    if ((mode === 'signup' || mode === 'reset') && pw.length < 8) return msg('Kies een wachtwoord van minstens 8 tekens.');
    if (mode === 'login' && !pw) return msg('Vul je wachtwoord in.');
    if (mode === 'signup' && !name) return msg('Vul je voornaam in.');
    const btn = $('acc-submit'); btn.disabled = true; msg('');
    try {
      if (mode === 'login') {
        const { error } = await sb.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        $('acc-dlg').close();
      } else if (mode === 'signup') {
        const { data, error } = await sb.auth.signUp({ email, password: pw, options: { data: { display_name: name }, emailRedirectTo: here() } });
        if (error) throw error;
        if (data.session) $('acc-dlg').close();
        else msg('Gelukt! We hebben je een mail gestuurd. Klik op de link in die mail om je account te bevestigen.', true);
      } else if (mode === 'forgot') {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: here() });
        if (error) throw error;
        msg('Als er een account met dit e-mailadres is, krijg je zo een mail met een link.', true);
      } else if (mode === 'reset') {
        const { error } = await sb.auth.updateUser({ password: pw });
        if (error) throw error;
        msg('Je nieuwe wachtwoord is opgeslagen.', true);
        setTimeout(() => $('acc-dlg').close(), 1200);
      }
    } catch (e) { msg(nice(e)); }
    btn.disabled = false;
  }

  return {
    init,
    onChange: fn => listeners.add(fn),
    get configured() { return configured; },
    get ready() { return ready; },
    get user() { return user; },
    get profile() { return profile; },
    get client() { return sb; },
    open,
    esc,
  };
})();
