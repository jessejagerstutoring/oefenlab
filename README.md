# Oefenlab

Gratis oefenplatform voor CCVX-tentamens. Eerste concept: Wiskunde A, opgave 1.

## Openen

- **Online:** https://jessejagerstutoring.github.io/oefenlab/
- **Lokaal:** open `index.html` in je browser. Er is geen server of installatie nodig.

## Hoe het in elkaar zit

Alles volgt dezelfde lijn: **examen bekijken → vragen indelen → vaardigheden begrijpen → uitleg → oefenen → controleren of het aansluit op het examen.**

```
analyse/wiskunde-a/              (in de privé-repo, niet online)
  bouw_databank.py               leest alle voorbeeldtentamens en deelt elke deelvraag in per vaardigheid
  databank.json                  alle 462 deelvragen met tekst en vaardigheid
  RAPPORT.md                     wat komt hoe vaak terug, met hoeveel punten

website/
  index.html                     startpagina van het platform
  wiskunde-a/index.html          overzicht van Wiskunde A: zes onderdelen, "werk hier eerst aan"
  wiskunde-a/voortgang.html      mijn voortgang per vaardigheid
  wiskunde-a/<onderdeel>.html    één trainer per onderdeel (opgave-1, optimaliseren, kansrekening,
                                 normaal-en-toetsen, periodiek, groeimodellen)
  begeleider.html                overzicht van alle leerlingen (alleen voor begeleiders)
  content/gedeeld.js             rekenhulpjes, stappen, antwoordcontrole
  content/wiskunde-a/vak.js      de zes onderdelen en 37 vaardigheden, met uitleg per vaardigheid
  content/wiskunde-a/examenanalyse.js   tellingen uit de databank (gegenereerd, geen vraagteksten)
  content/wiskunde-a/<onderdeel>.js     de sommen-generators per onderdeel
  assets/js/trainer.js           de trainer: menu, uitleg, stappen, feedback
  assets/js/overzicht.js         het vakoverzicht en mijn voortgang
  assets/js/progress.js          voortgang (browser, en account als je bent ingelogd)
  assets/js/account.js           inloggen, account maken, uitloggen
  supabase/schema.sql            database en beveiligingsregels voor Supabase
  tests/                         controleren alle sommen
```

- **Vaardigheden zijn de kern.** Elke som hoort bij precies één vaardigheid uit `vak.js`. Daaraan hangen de uitleg, de voortgang ("kan ik", "bijna", "lastig") en de tellingen uit de examens.
- **Inhoud en app zijn gescheiden.** Een onderdeel levert alleen generators aan via `maakOnderdeel()`. De trainer weet niets van wiskunde.
- **Nieuwe tentamens of Wiskunde B:** zet de teksten in `analyse/<vak>/teksten`, draai `bouw_databank.py`, vul `vak.js` aan en voeg generators toe.

## Testen

Vanuit de map `website`:

```
node tests/opgave-1.test.mjs
node tests/onderdelen.test.mjs
```

De tests maken samen ruim 17.000 sommen op alle niveaus, plus alle echte opgave 1-vragen. Ze controleren:

- dat elke meerkeuzestap precies één goed antwoord heeft;
- dat de eindantwoorden de vergelijking echt oplossen;
- dat hellingen kloppen met de grafiek;
- dat de app het juiste antwoord ook goedkeurt, als breuk én netjes afgerond;
- bij elke som met een eigen controle (`verify`) dat het antwoord op een andere manier narekent.

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
