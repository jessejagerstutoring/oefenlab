/*
 * Toegang tot de oefenomgeving: zonder inlogsessie direct naar de inlogpagina, nog voordat
 * de pagina zichtbaar wordt. account.js controleert daarna of de sessie echt geldig is.
 * Staat config.js leeg (lokaal zonder accounts), dan is alles gewoon open.
 */
(() => {
  const cfg = window.OEFENLAB_CONFIG || {};
  if (!cfg.supabaseUrl) return;
  let ok = false;
  try { for (let i = 0; i < localStorage.length; i++) if (/^sb-.*-auth-token$/.test(localStorage.key(i))) ok = true; } catch (e) { ok = true; }
  if (!ok) {
    const root = (document.currentScript && document.currentScript.dataset.root) || '';
    location.replace(`${root}login.html?next=${encodeURIComponent(location.pathname + location.hash)}`);
  }
})();
