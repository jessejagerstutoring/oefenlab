/*
 * Instellingen van Oefenlab.
 *
 * Zolang supabaseUrl en supabaseAnonKey leeg zijn, werkt de site zonder accounts:
 * de voortgang blijft dan alleen in de browser van de leerling.
 *
 * Invullen: Supabase → Project Settings → API Keys. De publishable (anon) sleutel mag openbaar
 * in deze code staan; de beveiliging zit in de regels van supabase/schema.sql.
 * Gebruik hier NOOIT de "service_role" sleutel.
 */
window.OEFENLAB_CONFIG = {
  supabaseUrl: 'https://uycvaepnemwrynjzxied.supabase.co',
  supabaseAnonKey: 'sb_publishable_13TbiJNpoLo-8xGgLoiR3A_EppNz4am',
};
