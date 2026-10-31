/*
 * Naslag Wiskunde A: uitleg om terug te lezen, per onderwerp.
 *
 * Per onderwerp (zelfde sleutel als in vak.js):
 *   idee        waarom het werkt, in gewone woorden (html, formules met \( … \))
 *   stappen     de aanpak
 *   voorbeelden [{ vraag, regels: [formuleregels], uitleg? }]
 *   fouten      veelgemaakte fouten
 *   tentamen    hoe het op het tentamen gevraagd wordt
 * Onderwerpen die hier (nog) niet staan, tonen de korte uitleg uit vak.js.
 */
const NASLAG = {
  veelterm: {
    idee: `<p>Een veeltermvergelijking heeft alleen machten van \\(x\\), zoals \\(x^3\\), \\(x^2\\) en \\(x\\). Het slimme idee: zet alles aan één kant, zodat er <b>= 0</b> staat. Dan kun je de regel gebruiken:</p>
      <p class="nb">Als \\(A \\cdot B = 0\\), dan is \\(A = 0\\) of \\(B = 0\\).</p>
      <p>Een product is alleen nul als één van de factoren nul is. Daarom wil je de vergelijking schrijven als iets <i>keer</i> iets. Zit er in elke term een \\(x\\)? Dan haal je die buiten haakjes. Wat overblijft is vaak kwadratisch, en dat los je op met de abc-formule.</p>`,
    stappen: ['Snijpunten gevraagd? Stel de twee formules aan elkaar gelijk.', 'Breng alles naar links, zodat rechts 0 staat.', 'Zit \\(x\\) in elke term? Haal de kleinste macht buiten haakjes.', 'Splits: de factor buiten haakjes = 0, of het stuk tussen haakjes = 0.', 'Los het kwadratische stuk op met de abc-formule.', 'Coördinaten gevraagd? Vul elke \\(x\\) in om \\(y\\) te vinden.'],
    voorbeelden: [
      { vraag: 'Los algebraïsch op: \\(x^3 - 5x^2 + 6x = 0\\)', regels: ['x(x^2 - 5x + 6) = 0', 'x = 0 \\;\\vee\\; x^2 - 5x + 6 = 0', 'D = 25 - 24 = 1', 'x = \\dfrac{5 \\pm 1}{2}', 'x = 0 \\;\\vee\\; x = 2 \\;\\vee\\; x = 3'] },
      { vraag: 'Bereken de snijpunten van \\(f(x) = x^2 + 1\\) en \\(g(x) = 3x - 1\\).', regels: ['x^2 + 1 = 3x - 1', 'x^2 - 3x + 2 = 0', '(x - 1)(x - 2) = 0', 'x = 1 \\;\\vee\\; x = 2', '(1,\\ 2) \\text{ en } (2,\\ 5)'] },
    ],
    fouten: ['Delen door \\(x\\). Dan raak je de oplossing \\(x = 0\\) kwijt.', 'Vergeten dat rechts 0 moet staan voordat je gaat splitsen.', 'Bij snijpunten alleen de \\(x\\) geven terwijl naar de coördinaten wordt gevraagd.'],
    tentamen: 'Meestal de eerste deelvraag van opgave 1: "Los algebraïsch op". Soms als "Bereken de coördinaten van de snijpunten". Reken altijd zonder grafische rekenmachine.',
  },
  expo: {
    idee: `<p>Bij een exponentiële vergelijking staat de \\(x\\) <b>in de exponent</b>, het kleine getal rechtsboven: \\(2^x\\), \\(5^{x+1}\\). Je kunt zo'n \\(x\\) niet gewoon "wegdelen". De logaritme is precies de omgekeerde bewerking van een macht:</p>
      <p class="nb">\\(g^x = a\\) betekent \\(x = {}^{g}\\log(a) = \\dfrac{\\log(a)}{\\log(g)}\\).</p>
      <p>Het doel is dus altijd: werk de vergelijking om tot één macht aan één kant, \\(g^x = \\text{getal}\\). Is dat getal zelf een macht van \\(g\\), zoals \\(8 = 2^3\\)? Dan kun je de exponenten gelijkstellen en heb je geen rekenmachine nodig.</p>`,
    stappen: ['Zet de macht alleen: haal getallen ervoor en erachter weg.', 'Staan er twee machten met hetzelfde grondtal? Neem ze samen (bijvoorbeeld \\(5 \\cdot 2^x - 2^x = 4 \\cdot 2^x\\)).', 'Is het getal een macht van het grondtal? Stel de exponenten gelijk.', 'Anders: \\(x = \\log(\\text{getal}) / \\log(g)\\).', 'Rond pas op het laatst af, op het aantal decimalen dat gevraagd wordt.'],
    voorbeelden: [
      { vraag: 'Los algebraïsch op: \\(3 \\cdot 2^x + 5 = 53\\)', regels: ['3 \\cdot 2^x = 48', '2^x = 16 = 2^4', 'x = 4'] },
      { vraag: 'Los algebraïsch op: \\(4 \\cdot 3^x = 7 \\cdot 3^x - 18\\). Rond af op 3 decimalen.', regels: ['18 = 7 \\cdot 3^x - 4 \\cdot 3^x', '18 = 3 \\cdot 3^x', '3^x = 6', 'x = \\dfrac{\\log 6}{\\log 3} \\approx 1{,}631'] },
    ],
    fouten: ['\\(2^x + 3^x\\) samennemen tot \\(5^x\\). Dat mag niet: alleen machten met hetzelfde grondtal neem je samen.', '\\(3 \\cdot 2^x\\) schrijven als \\(6^x\\). De 3 hoort niet bij het grondtal.', 'Te vroeg afronden, waardoor het laatste cijfer niet meer klopt.'],
    tentamen: 'Vrijwel altijd een deelvraag in opgave 1, vaak met "Rond af op … decimalen". Soms met twee verschillende grondtallen: deel dan door elkaar, zodat je \\((\\tfrac{a}{b})^x\\) krijgt.',
  },
  wortel: {
    idee: `<p>Bij een wortelvergelijking staat de \\(x\\) onder een wortel. Om die wortel weg te krijgen, <b>kwadrateer</b> je beide kanten: \\((\\sqrt{u})^2 = u\\).</p>
      <p>Maar kwadrateren heeft een addertje. Uit \\(a^2 = b^2\\) volgt niet altijd \\(a = b\\): het kan ook \\(a = -b\\) zijn. Daardoor krijg je soms een oplossing erbij die in de oorspronkelijke vergelijking niet klopt. Een wortel is namelijk nooit negatief.</p>
      <p class="nb">Daarom: na kwadrateren altijd controleren door in te vullen.</p>`,
    stappen: ['Zet de wortel alleen aan één kant.', 'Kwadrateer beide kanten. Zet haakjes om de andere kant: \\((x + 1)^2\\).', 'Werk de haakjes uit en zet alles op 0.', 'Los op, meestal met de abc-formule.', 'Vul elke oplossing in de oorspronkelijke vergelijking in. Klopt hij niet, dan valt hij af.'],
    voorbeelden: [
      { vraag: 'Los algebraïsch op: \\(\\sqrt{x + 7} = x + 1\\)', regels: ['x + 7 = (x + 1)^2', 'x + 7 = x^2 + 2x + 1', 'x^2 + x - 6 = 0', 'x = 2 \\;\\vee\\; x = -3', '\\text{controle } x = -3:\\; \\sqrt{4} = 2 \\neq -2', 'x = 2'] },
      { vraag: 'Los algebraïsch op: \\(2\\sqrt{x} = x - 3\\)', regels: ['4x = (x - 3)^2 = x^2 - 6x + 9', 'x^2 - 10x + 9 = 0', 'x = 1 \\;\\vee\\; x = 9', '\\text{controle } x = 1:\\; 2 \\neq -2', 'x = 9'] },
    ],
    fouten: ['Niet controleren, waardoor je een oplossing te veel geeft.', '\\((x + 1)^2\\) uitwerken als \\(x^2 + 1\\). Het is \\(x^2 + 2x + 1\\).', 'Kwadrateren terwijl de wortel nog niet alleen staat: \\((\\sqrt{x} + 2)^2\\) is geen \\(x + 4\\).'],
    tentamen: 'Komt minder vaak voor dan veeltermen en exponenten, maar de controle levert vaak een apart punt op. Schrijf die controle dus altijd op.',
  },
  afgeleide: {
    idee: `<p>De afgeleide \\(f'(x)\\) vertelt hoe <b>steil</b> de grafiek van \\(f\\) is op elke plek. Positief: de grafiek stijgt. Negatief: hij daalt. Nul: de grafiek loopt even plat, en dat gebeurt precies in een top of een dal.</p>
      <p>Daarom vertaal je vragen zo:</p>
      <ul><li>"helling in \\(x = a\\)" → bereken \\(f'(a)\\)</li><li>"horizontale raaklijn", "top", "minimum" → los \\(f'(x) = 0\\) op</li><li>"raaklijn evenwijdig aan \\(y = 3x + 1\\)" → los \\(f'(x) = 3\\) op</li></ul>
      <p class="nb">Machtsregel: \\((a x^n)' = n \\cdot a \\cdot x^{n-1}\\). Een los getal wordt 0.</p>
      <p>Voor breuken, producten en "iets ín iets" gebruik je de quotiënt-, product- en kettingregel. Die staan op de formulelijst.</p>`,
    stappen: ['Vertaal de vraag: helling, \\(f\'(x) = 0\\) of \\(f\'(x) = \\text{getal}\\)?', 'Kies de regel: macht, keten, product of quotiënt.', 'Bepaal \\(f\'(x)\\) en vereenvoudig.', 'Vul in of los de vergelijking op.', 'Gevraagd naar de waarde van een top of de coördinaten? Vul in \\(f\\) in, niet in \\(f\'\\).'],
    voorbeelden: [
      { vraag: '\\(f(x) = x^3 - 12x + 5\\). Bereken de \\(x\\)-coördinaten van de toppen.', regels: ["f'(x) = 3x^2 - 12", '3x^2 - 12 = 0', 'x^2 = 4', 'x = 2 \\;\\vee\\; x = -2'] },
      { vraag: '\\(g(x) = \\sqrt{x^2 + 9}\\). Bereken de helling in \\(x = 4\\).', regels: ["g'(x) = \\dfrac{1}{2\\sqrt{x^2 + 9}} \\cdot 2x = \\dfrac{x}{\\sqrt{x^2 + 9}}", "g'(4) = \\dfrac{4}{\\sqrt{25}} = \\dfrac{4}{5}"] },
    ],
    fouten: ['De waarde van een top in \\(f\'\\) invullen in plaats van in \\(f\\).', 'Bij de kettingregel de afgeleide van de binnenkant vergeten.', 'Bij een breuk teller en noemer apart differentiëren.'],
    tentamen: 'In opgave 1 meestal één of twee deelvragen: helling, horizontale raaklijn, raaklijn evenwijdig aan een lijn, of een minimum. In de contextopgaven komt de afgeleide terug bij optimaliseren.',
  },
  formules: {
    idee: `<p>Soms is een verband gegeven met logaritmen, zoals \\(\\log(N) = 2 + 3\\log(t)\\), en wordt gevraagd om het te schrijven zonder log: \\(N = \\ldots\\). Het idee: <b>maak van beide kanten één log</b>. Als \\(\\log(A) = \\log(B)\\), dan is \\(A = B\\).</p>
      <p>Daarvoor heb je drie rekenregels nodig. Ze staan op de formulelijst:</p>
      <ul><li>\\(\\log a + \\log b = \\log(ab)\\)</li><li>\\(p \\cdot \\log a = \\log(a^p)\\)</li><li>een los getal \\(q\\) is \\(\\log(10^q)\\)</li></ul>`,
    stappen: ['Zet de log die je kwijt wilt alleen aan één kant.', 'Schrijf losse getallen als log: \\(2 = \\log(100)\\).', 'Schrijf een getal vóór een log als exponent: \\(3\\log t = \\log(t^3)\\).', 'Tel logs op tot één log: \\(\\log 100 + \\log t^3 = \\log(100t^3)\\).', '\\(\\log(A) = \\log(B)\\), dus \\(A = B\\).'],
    voorbeelden: [
      { vraag: 'Schrijf \\(\\log(N) = 2 + 3\\log(t)\\) in de vorm \\(N = a \\cdot t^b\\).', regels: ['\\log N = \\log 100 + \\log t^3', '\\log N = \\log(100t^3)', 'N = 100t^3'] },
      { vraag: 'Schrijf \\(\\log(R) = 0{,}5\\log(P) - 1\\) als \\(R = \\ldots\\)', regels: ['\\log R = \\log P^{0{,}5} - \\log 10', '\\log R = \\log\\left(\\dfrac{P^{0{,}5}}{10}\\right)', 'R = 0{,}1 \\cdot P^{0{,}5}'] },
    ],
    fouten: ['\\(\\log(a + b)\\) splitsen in \\(\\log a + \\log b\\). Dat mag niet.', 'Het losse getal vergeten om te zetten: \\(2\\) is \\(\\log 100\\), niet \\(\\log 2\\).', 'Een min voor een log vergeten: \\(-\\log 10\\) wordt delen door 10.'],
    tentamen: 'Een terugkerende deelvraag van opgave 1, vaak met de vraag om het antwoord in de vorm \\(a \\cdot t^b\\) te geven.',
  },
  lijnen: {
    idee: `<p>Een rechte lijn heeft de vorm \\(y = ax + b\\). Het getal \\(a\\) is de <b>richtingscoëfficiënt</b> (rc): zoveel gaat \\(y\\) omhoog als \\(x\\) één stap verder gaat. Het getal \\(b\\) is waar de lijn de \\(y\\)-as snijdt.</p>
      <p class="nb">Evenwijdige lijnen hebben dezelfde rc.</p>
      <p>Staat een lijn er als \\(px + qy = r\\)? Schrijf hem eerst om naar \\(y = \\ldots\\), dan zie je de rc meteen.</p>`,
    stappen: ['Schrijf elke lijn als \\(y = ax + b\\).', 'Evenwijdig? Neem dezelfde \\(a\\). Door de oorsprong? Dan is \\(b = 0\\).', 'Snijpunt? Stel de twee formules gelijk en los \\(x\\) op.', 'Vul \\(x\\) in om \\(y\\) te vinden.'],
    voorbeelden: [
      { vraag: 'Lijn \\(m\\) gaat door de oorsprong en is evenwijdig aan \\(2x + 4y = 7\\). Geef de formule van \\(m\\).', regels: ['4y = -2x + 7', 'y = -\\tfrac12 x + \\tfrac74', 'm:\\; y = -\\tfrac12 x'] },
    ],
    fouten: ['Bij \\(px + qy = r\\) vergeten om ook \\(p\\) en \\(r\\) door \\(q\\) te delen.', 'Een min-teken kwijtraken bij het omschrijven.'],
    tentamen: 'Komt soms voor in opgave 1, meestal gecombineerd met een snijpunt.',
  },
  rijen: {
    idee: `<p>Een <b>rekenkundige</b> rij gaat elke keer met hetzelfde getal omhoog: 3, 7, 11, 15, … (steeds +4). Een <b>meetkundige</b> rij gaat elke keer keer hetzelfde getal: 2, 6, 18, 54, … (steeds ×3).</p>
      <p>Wil je veel termen optellen, dan gebruik je de somformule in plaats van alles los op te tellen. Beide staan op de formulelijst.</p>
      <p class="nb">Rekenkundig: \\(\\text{som} = \\tfrac12 \\cdot \\text{aantal termen} \\cdot (\\text{eerste} + \\text{laatste})\\)</p>`,
    stappen: ['Kijk of er steeds hetzelfde bij komt (rekenkundig) of steeds keer hetzelfde (meetkundig).', 'Bepaal de eerste en de laatste term.', 'Tel het aantal termen: \\((\\text{laatste} - \\text{eerste}) / v + 1\\).', 'Vul de somformule in.'],
    voorbeelden: [
      { vraag: 'Bereken de som van alle oneven getallen van 11 tot en met 99.', regels: ['\\text{rekenkundig, } v = 2', '\\text{aantal} = \\dfrac{99 - 11}{2} + 1 = 45', '\\text{som} = \\tfrac12 \\cdot 45 \\cdot (11 + 99) = 2475'] },
    ],
    fouten: ['De +1 vergeten bij het tellen van het aantal termen.', 'De somformule voor rekenkundige rijen gebruiken bij een meetkundige rij.'],
    tentamen: 'Soms de laatste deelvraag van opgave 1, en in de contextopgaven bij groeimodellen (totale inkomsten, rente).',
  },
};
