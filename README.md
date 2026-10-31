# Oefenlab

Gratis oefenplatform voor CCVX-tentamens. Eerste concept: Wiskunde A, opgave 1.

## Openen

Open `index.html` in je browser. Er is geen server of installatie nodig.

## Hoe het in elkaar zit

```
website/
  index.html                     startpagina van het platform (vakken)
  wiskunde-a/opgave-1.html       de trainer voor opgave 1
  content/wiskunde-a/opgave-1.js alle inhoud: sommen, tentamenvragen, theorie, antwoordcontrole
  assets/js/trainer.js           de trainer zelf: menu, stappen, feedback, tentamens
  assets/js/progress.js          voortgang van de leerling (nu in de browser)
  assets/css/app.css             het ontwerp, gedeeld door alle pagina's
tests/opgave-1.test.mjs          controleert alle sommen
```

Het belangrijkste principe: **inhoud en app zijn gescheiden.**

- Een inhoudsbestand eindigt met een `COURSE`-object (onderwerpen, generators, tentamenvragen, theorie, antwoordcontrole). Er zit geen opmaak in.
- `trainer.js` weet niets van wiskunde en werkt met elk `COURSE`-object.
- Een nieuwe opgave of een nieuw vak is dus: een nieuw inhoudsbestand plus een pagina die het laadt, zoals `wiskunde-a/opgave-1.html`.

## Testen

```
node tests/opgave-1.test.mjs
```

De test maakt duizenden sommen op alle niveaus, plus alle echte tentamenvragen. Hij controleert:

- dat elke meerkeuzestap precies één goed antwoord heeft;
- dat de eindantwoorden de vergelijking echt oplossen;
- dat hellingen kloppen met de grafiek;
- dat de app het juiste antwoord ook goedkeurt.

Draai hem na elke wijziging aan de inhoud.

## Voortgang

Alle voortgang loopt via `Voortgang` in `progress.js`: per onderwerp, per tentamen, en waar de leerling was gebleven. Nu staat dat alleen in de browser van de leerling. Komen er later accounts, zodat jij kunt meekijken met leerlingen, dan verandert alleen dit bestand.
