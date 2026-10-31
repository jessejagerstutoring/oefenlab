# Oefenlab

Gratis oefenplatform voor CCVX-tentamens. Eerste concept: Wiskunde A, opgave 1.

## Openen

- **Online:** https://jessejagerstutoring.github.io/oefenlab/
- **Lokaal:** open `index.html` in je browser. Er is geen server of installatie nodig.

## Hoe het in elkaar zit

```
website/
  index.html                     startpagina van het platform (vakken)
  wiskunde-a/opgave-1.html       de trainer voor opgave 1
  content/wiskunde-a/opgave-1.js alle inhoud: sommen, tentamenvragen, theorie, antwoordcontrole
  assets/js/trainer.js           de trainer zelf: menu, stappen, feedback, tentamens
  begeleider.html                overzicht van alle leerlingen (alleen voor begeleiders)
  assets/js/progress.js          voortgang van de leerling (browser, en account als je bent ingelogd)
  assets/js/account.js           inloggen, account maken, uitloggen
  assets/js/config.js            instellingen: de Supabase-gegevens
  assets/css/app.css             het ontwerp, gedeeld door alle pagina's
  supabase/schema.sql            database en beveiligingsregels voor Supabase
  tests/opgave-1.test.mjs        controleert alle sommen
```

Het belangrijkste principe: **inhoud en app zijn gescheiden.**

- Een inhoudsbestand eindigt met een `COURSE`-object (onderwerpen, generators, tentamenvragen, theorie, antwoordcontrole). Er zit geen opmaak in.
- `trainer.js` weet niets van wiskunde en werkt met elk `COURSE`-object.
- Een nieuwe opgave of een nieuw vak is dus: een nieuw inhoudsbestand plus een pagina die het laadt, zoals `wiskunde-a/opgave-1.html`.

## Testen

Vanuit de map `website`:

```
node tests/opgave-1.test.mjs
```

De test maakt duizenden sommen op alle niveaus, plus alle echte tentamenvragen. Hij controleert:

- dat elke meerkeuzestap precies één goed antwoord heeft;
- dat de eindantwoorden de vergelijking echt oplossen;
- dat hellingen kloppen met de grafiek;
- dat de app het juiste antwoord ook goedkeurt.

Draai hem na elke wijziging aan de inhoud.

## Voortgang en accounts

Alle voortgang loopt via `Voortgang` in `progress.js`: per onderwerp, per tentamen, en waar de leerling was gebleven.

- **Zonder account:** de voortgang blijft in de browser van de leerling.
- **Met account:** de voortgang staat in Supabase en is op elk apparaat hetzelfde.
  - Wie voor het eerst inlogt, neemt de voortgang mee die al op dat apparaat stond.
  - Bij uitloggen wordt de browser leeggemaakt, zodat de volgende leerling op een gedeelde computer niet verdergaat met andermans voortgang.

### Accounts aanzetten (eenmalig)

1. Maak een gratis account op https://supabase.com en daarna een nieuw project. Kies een regio in Europa, bijvoorbeeld Frankfurt.
2. Ga naar **SQL Editor → New query**, plak de inhoud van `supabase/schema.sql` en klik **Run**.
3. Ga naar **Authentication → URL Configuration**:
   - zet **Site URL** op `https://jessejagerstutoring.github.io/oefenlab/`;
   - voeg datzelfde adres toe bij **Redirect URLs**, met `**` erachter.
4. Ga naar **Authentication → Sign In / Providers → Email** en kies hoe leerlingen hun account bevestigen. Zie "Let op" hieronder.
5. Ga naar **Project Settings → API**. Kopieer de **Project URL** en de **anon public**-sleutel naar `assets/js/config.js`. Gebruik nooit de `service_role`-sleutel.
6. Zet de wijziging online (zie hieronder), maak op de site je eigen account aan en maak jezelf begeleider in de SQL Editor:
   ```sql
   update public.profiles set role = 'begeleider' where email = 'jouw@email.nl';
   ```
   Na opnieuw inloggen staat **Overzicht leerlingen** in je menu.

**Let op:** de standaard e-mail van Supabase verstuurt maar een paar mails per uur. Dat is genoeg om te testen, maar niet als veel leerlingen tegelijk een account maken.

- **Zet "Confirm email" uit.** Leerlingen kunnen dan meteen inloggen. Nadeel: een verkeerd getypt e-mailadres wordt niet opgemerkt, en wachtwoord vergeten werkt dan alleen voor een juist adres.
- **Of stel eigen e-mail in.** Dat kan via **Authentication → Emails → SMTP Settings**, bijvoorbeeld met een gratis Resend- of Brevo-account.

**Privacy:** je bewaart de voornaam, het e-mailadres en de voortgang van leerlingen. Een leerling ziet alleen zijn eigen gegevens. Alleen een begeleider ziet alles. Wil een leerling zijn account laten verwijderen, dan doe je dat in Supabase via **Authentication → Users**. De voortgang verdwijnt dan automatisch mee.

## Online zetten

De website staat in een eigen openbare repo, `jessejagerstutoring/oefenlab`, en GitHub Pages zet hem automatisch online. Na een wijziging, vanuit de hoofdmap van het project:

```
git subtree push --prefix=website oefenlab main
```

Na een minuut of twee staat de nieuwe versie online.
