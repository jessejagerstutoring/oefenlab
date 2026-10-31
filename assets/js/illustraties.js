/*
 * Plaatjes per vaardigheid. Elk plaatje is berekend uit een echte functie, verdeling of rij,
 * zodat nulpunten, snijpunten, toppen en oppervlaktes kloppen met de wiskunde erachter.
 * ILLUSTRATIE[id](kleur) geeft een <svg> van 124 bij 72.
 */
const ILLUSTRATIE = (() => {
  const W = 124, H = 72, P = 7;
  const AC = '#e08600', AX = 'rgba(27, 29, 42, .22)';
  const r1 = n => +n.toFixed(1);

  // assenstelsel: x-bereik en y-bereik naar een vak in pixels
  function frame(xr, yr, box = [P, W - P, P, H - P]) {
    const [l, r, t, b] = box;
    const X = x => r1(l + (x - xr[0]) / (xr[1] - xr[0]) * (r - l));
    const Y = y => r1(b - (y - yr[0]) / (yr[1] - yr[0]) * (b - t));
    const pts = (fn, a, z, n = 80) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (z - a) * i / n; return [X(x), Y(fn(x))]; });
    const curve = (fn, a = xr[0], z = xr[1]) => pts(fn, a, z).map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('');
    const area = (fn, a, z, base = 0) => `M${X(a)} ${Y(base)}` + pts(fn, a, z).map(([x, y]) => `L${x} ${y}`).join('') + `L${X(z)} ${Y(base)}Z`;
    const seg = (x1, y1, x2, y2) => `M${X(x1)} ${Y(y1)}L${X(x2)} ${Y(y2)}`;
    const axes = () => (yr[0] < 0 && yr[1] > 0 ? line(seg(xr[0], 0, xr[1], 0), AX, 1.5) : '') + (xr[0] < 0 && xr[1] > 0 ? line(seg(0, yr[0], 0, yr[1]), AX, 1.5) : '');
    return { X, Y, curve, area, seg, axes };
  }
  const svg = body => `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${body}</svg>`;
  const line = (d, c, w = 3.5, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  const dashed = (d, c, w = 2.5) => line(d, c, w, ' stroke-dasharray="5 5"');
  const fill = (d, c, op) => `<path d="${d}" fill="${c}" fill-opacity="${op}"/>`;
  const dot = (x, y, c, open) => `<circle cx="${x}" cy="${y}" r="${open ? 4.5 : 5}" fill="${open ? '#fff' : c}" stroke="${c}" stroke-width="3"/>`;
  const label = (x, y, t, c, size = 12) => `<text x="${x}" y="${y}" font-family="Fredoka, sans-serif" font-weight="700" font-size="${size}" fill="${c}" text-anchor="middle">${t}</text>`;
  const bars = (vals, c, hi = -1, x0 = 10, x1 = 114, max = Math.max(...vals)) => {
    const step = (x1 - x0) / vals.length, w = Math.min(16, step * 0.72);
    return vals.map((v, i) => { const h = r1(v / max * 56); return `<rect x="${r1(x0 + i * step + (step - w) / 2)}" y="${r1(H - P - h)}" width="${r1(w)}" height="${h}" rx="3" fill="${i === hi ? AC : c}"/>`; }).join('');
  };
  const phi = z => Math.exp(-z * z / 2);
  const binom = (n, p) => { const c = k => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }; return Array.from({ length: n + 1 }, (_, k) => c(k) * p ** k * (1 - p) ** (n - k)); };

  // sinusoïde y = sin(2π(t − 0,5)/4): evenwichtsstand 0, amplitude 1, periode 4, beginpunt 0,5
  const SIN = { xr: [0, 9], yr: [-1.4, 1.4], f: t => Math.sin(2 * Math.PI * (t - 0.5) / 4) };

  const A = {
    mix: c => svg(`<circle cx="24" cy="36" r="14" fill="#2563eb"/><rect x="48" y="22" width="28" height="28" rx="7" fill="#db2777"/><path d="M90 50 L104 22 L118 50 Z" fill="#ca8a04"/><path d="M6 64 C 40 58, 80 70, 118 60" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`),

    // f(x) = ¼(x + 2)(x − 1)(x − 3): nulpunten −2, 1 en 3
    veelterm: c => { const F = frame([-2.6, 3.6], [-3.2, 2.6]), f = x => (x + 2) * (x - 1) * (x - 3) / 4;
      return svg(F.axes() + line(F.curve(f), c) + [-2, 1, 3].map(x => dot(F.X(x), F.Y(0), c, true)).join('')); },
    // 2^x = 5 geeft x = log₂ 5
    expo: c => { const F = frame([-3, 3.2], [-0.6, 9.6]), x = Math.log2(5);
      return svg(F.axes() + dashed(F.seg(-3, 5, 3.2, 5), AC) + line(F.curve(x => 2 ** x), c) + dot(F.X(x), F.Y(5), c)); },
    // √(x + 7) = x + 1: x = 2 klopt, x = −3 hoort bij −√(x + 7) en valt af
    wortel: c => { const F = frame([-7.6, 4.2], [-3.8, 5.4]);
      return svg(F.axes() + dashed(F.curve(x => -Math.sqrt(Math.max(0, x + 7)), -7, 4.2), c + '66', 2.5) + line(F.seg(-4.6, -3.6, 4.2, 5.2), AC, 3)
        + line(F.curve(x => Math.sqrt(Math.max(0, x + 7)), -7, 4.2), c) + dot(F.X(-3), F.Y(-2), AC, true) + dot(F.X(2), F.Y(3), c)); },
    // f(x) = ⅓x³ − x: raaklijn in x = −1,6 en een horizontale raaklijn in het dal x = 1
    afgeleide: c => { const F = frame([-2.15, 2.15], [-1.3, 1.3]), f = x => x ** 3 / 3 - x, a = -1.6, s = a * a - 1;
      return svg(F.axes() + line(F.curve(f), c) + dashed(F.seg(-2.1, f(a) + s * (-2.1 - a), -1.05, f(a) + s * (-1.05 - a)), AC, 3)
        + dashed(F.seg(0.55, f(1), 1.45, f(1)), AC, 3) + dot(F.X(a), F.Y(f(a)), c) + dot(F.X(1), F.Y(f(1)), c, true)); },
    // y = log x: van R = 6 naar log R ≈ 0,78 en terug
    formules: c => { const F = frame([0, 10.5], [-0.6, 1.15]), y = Math.log10(6);
      return svg(F.axes() + dashed(F.seg(6, 0, 6, y), AC) + dashed(F.seg(0, y, 6, y), AC) + line(F.curve(Math.log10, 0.26, 10.5), c) + dot(F.X(6), F.Y(y), c)); },
    // y = ½x + 1 en y = −x + 4 snijden in (2, 2); hellingsdriehoek met Δx = 1,5 en Δy = 0,75
    lijnen: c => { const F = frame([-0.5, 5], [-0.5, 5]);
      return svg(F.axes() + line(F.seg(3, 2.5, 4.5, 2.5) + F.seg(4.5, 2.5, 4.5, 3.25), c + '99', 2) + dashed(F.seg(-0.5, 4.5, 4.5, -0.5), AC, 3)
        + line(F.seg(-0.5, 0.75, 5, 3.5), c) + dot(F.X(2), F.Y(2), c, true)); },
    // meetkundige rij u(n) = 1,5ⁿ
    rijen: c => svg(bars([0, 1, 2, 3, 4].map(n => 1.5 ** n), c)),

    // opbrengst R = 10q − q², kosten K = 2q + 4: winst waar R boven K ligt (q = 4 ± √12)
    'opt-formule': c => { const F = frame([0, 10], [-2, 27]), R = q => 10 * q - q * q, K = q => 2 * q + 4, a = 4 - Math.sqrt(12), b = 4 + Math.sqrt(12);
      const band = `M${F.X(a)} ${F.Y(K(a))}` + F.curve(R, a, b).replace(/^M/, 'L') + `L${F.X(b)} ${F.Y(K(b))}Z`;
      return svg(F.axes() + fill(band, c, 0.18) + dashed(F.curve(K), AC, 3) + line(F.curve(R), c)); },
    // f(x) = 8x/(x + 1), raaklijn in x = 1 met helling f′(1) = 2
    'opt-afgeleide': c => { const F = frame([-0.3, 6.3], [-0.6, 8]), f = x => 8 * x / (x + 1);
      return svg(F.axes() + dashed(F.seg(-0.2, 4 + 2 * -1.2, 2.6, 4 + 2 * 1.6), AC, 3) + line(F.curve(f, 0, 6.3), c) + dot(F.X(1), F.Y(4), c)); },
    // f(x) = 20x/(x² + 4): maximum 5 bij x = 2
    'opt-extreem': c => { const F = frame([-0.3, 9], [-0.6, 6.2]), f = x => 20 * x / (x * x + 4);
      return svg(F.axes() + dashed(F.seg(2, 0, 2, 5), c + '88', 2) + dashed(F.seg(0.8, 5, 3.2, 5), AC, 3) + line(F.curve(f, 0, 9), c) + dot(F.X(2), F.Y(5), c)); },
    // 20x/(x² + 4) > 4 precies als 1 < x < 4
    'opt-vergelijking': c => { const F = frame([-0.3, 9], [-0.6, 6.2]), f = x => 20 * x / (x * x + 4);
      return svg(F.axes() + line(F.seg(1, 0, 4, 0), AC, 6) + dashed(F.seg(-0.3, 4, 9, 4), AC, 2.5) + line(F.curve(f, 0, 9), c + '66', 3)
        + line(F.curve(f, 1, 4), c, 4) + dot(F.X(1), F.Y(4), c, true) + dot(F.X(4), F.Y(4), c, true)); },
    // f(x) = ⅓x³ − x stijgt voor x < −1 en x > 1 en daalt daartussen
    'opt-helling': c => { const F = frame([-2.15, 2.15], [-1.3, 1.3]), f = x => x ** 3 / 3 - x;
      return svg(F.axes() + line(F.curve(f, -2.15, -1), c) + line(F.curve(f, -1, 1), AC) + line(F.curve(f, 1, 2.15), c)); },
    // route A → B → C met een 3-4-5-driehoek, op schaal
    'opt-meetkunde': c => { const F = frame([-0.5, 8.5], [-1.1, 3.645]);
      return svg(line(F.seg(-0.5, 0, 8.5, 0), AX, 2) + dashed(F.seg(8, 0, 8, 3), c + '88', 2) + line(`M${F.X(7.4)} ${F.Y(0)}L${F.X(7.4)} ${F.Y(0.6)}L${F.X(8)} ${F.Y(0.6)}`, c + '88', 1.5)
        + line(F.seg(0, 0, 4, 0) + `L${F.X(8)} ${F.Y(3)}`, c) + dot(F.X(0), F.Y(0), c) + dot(F.X(4), F.Y(0), c, true) + dot(F.X(8), F.Y(3), c)
        + label(F.X(6), F.Y(-0.9), '4', c) + label(F.X(8.35), F.Y(1.2), '3', c) + label(F.X(5.6), F.Y(2.2), '5', AC)); },

    // 3 · 2 = 6 mogelijkheden
    'kans-tellen': c => { const L1 = [12, 36, 60], e = [], n = [];
      L1.forEach(y => { e.push(`M14 36L60 ${y}`); [-6, 6].forEach(d => { e.push(`M60 ${y}L106 ${y + d}`); n.push(dot(106, y + d, AC)); }); n.push(dot(60, y, c)); });
      return svg(line(e.join(''), c, 2.5) + dot(14, 36, c) + n.join('').replace(/r="5"/g, 'r="3.5"')); },
    // rooster van twee dobbelstenen: de 6 worpen met som 7
    'kans-dobbel': c => { const s = 9.5, x0 = (W - 6 * s) / 2, y0 = (H - 6 * s) / 2, r = [];
      for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) r.push(`<rect x="${r1(x0 + (j - 1) * s + 1)}" y="${r1(y0 + (i - 1) * s + 1)}" width="${s - 2}" height="${s - 2}" rx="2" fill="${i + j === 7 ? AC : '#fff'}" stroke="${c}" stroke-opacity=".35"/>`);
      return svg(r.join('')); },
    // kansboom: P(minstens één) = 1 − P(geen), het pad 'geen, geen' oranje
    'kans-boom': c => svg(line('M12 36L58 18M58 18L104 9M58 18L104 27M12 36L58 54M58 54L104 45', c, 2.5) + line('M12 36L58 54L104 63', AC, 3.5)
      + [[12, 36], [58, 18], [104, 9], [104, 27], [104, 45]].map(([x, y]) => dot(x, y, c)).join('') + dot(58, 54, AC) + dot(104, 63, AC)),
    // binomiale verdeling n = 8, p = 0,4; P(X = 3) uitgelicht
    'kans-binom': c => svg(bars(binom(8, 0.4), c, 3)),
    // winst −2, 3, 8 met kansen 0,6; 0,3; 0,1 → E(W) = 0,5
    'kans-verwachting': c => { const F = frame([-4, 10], [0, 0.66]), v = [[-2, 0.6], [3, 0.3], [8, 0.1]];
      return svg(line(F.seg(-4, 0, 10, 0), AX, 1.5) + v.map(([x, p]) => `<rect x="${F.X(x) - 6}" y="${F.Y(p)}" width="12" height="${r1(F.Y(0) - F.Y(p))}" rx="3" fill="${c}"/>`).join('')
        + dashed(F.seg(0.5, 0, 0.5, 0.64), AC, 3) + `<path d="M${F.X(0.5) - 6} ${F.Y(0) + 6}L${F.X(0.5)} ${F.Y(0)}L${F.X(0.5) + 6} ${F.Y(0) + 6}Z" fill="${AC}"/>`); },

    // normale verdeling: 68% binnen μ ± σ, 95% binnen μ ± 2σ
    'nv-vuistregels': c => { const F = frame([-3.3, 3.3], [0, 1.08]);
      return svg(fill(F.area(phi, -2, 2), c, 0.18) + fill(F.area(phi, -1, 1), c, 0.32) + line(F.seg(-3.3, 0, 3.3, 0), AX, 1.5) + line(F.curve(phi), c)); },
    // gegeven rechterstaart en de gespiegelde linkerstaart
    'nv-figuur': c => { const F = frame([-3.3, 3.3], [0, 1.08]);
      return svg(fill(F.area(phi, 1, 3.3), AC, 0.6) + fill(F.area(phi, -3.3, -1), AC, 0.2) + dashed(F.seg(-1, 0, -1, phi(1)), AC, 2) + line(F.seg(-3.3, 0, 3.3, 0), AX, 1.5) + line(F.curve(phi), c)); },
    // √n-wet: het gemiddelde van 4 waarnemingen heeft σ/2, dus een twee keer zo smalle en hoge kromme
    'nv-som': c => { const F = frame([-3.3, 3.3], [0, 1.08]);
      return svg(line(F.seg(-3.3, 0, 3.3, 0), AX, 1.5) + dashed(F.curve(z => 0.5 * phi(z)), AC, 3) + line(F.curve(z => phi(2 * z)), c)); },
    // eerst een normale kans, daarna binomiaal (n = 5, p = 0,3)
    'nv-binom': c => { const F = frame([-3, 3], [0, 1.08], [6, 58, P, H - P]);
      return svg(fill(F.area(phi, 0.52, 3), AC, 0.6) + line(F.seg(-3, 0, 3, 0), AX, 1.5) + line(F.curve(phi), c, 3) + line('M62 36h6m-3-3l3 3-3 3', c, 2) + bars(binom(5, 0.3), c, -1, 72, 118)); },
    // N(−1; 0,7) en N(1,2; 1) met dezelfde grens 0,4
    'nv-vergelijk': c => { const F = frame([-3.4, 4.4], [0, 1.5]), f1 = z => phi((z + 1) / 0.7) / 0.7, f2 = z => phi(z - 1.2);
      return svg(fill(F.area(f1, 0.4, 4.4), c, 0.35) + fill(F.area(f2, 0.4, 4.4), AC, 0.22) + line(F.seg(-3.4, 0, 4.4, 0), AX, 1.5)
        + line(F.curve(f2), AC, 3) + line(F.curve(f1), c, 3) + dashed(F.seg(0.4, 0, 0.4, 1.45), '#1b1d2a', 2)); },
    // H₀ in het midden, H₁ wijst naar rechts
    'toets-hyp': c => { const F = frame([-3.3, 3.3], [0, 1.4]);
      return svg(line(F.seg(-3.3, 0, 3.3, 0), AX, 1.5) + dashed(F.seg(0, 0, 0, 1), c + '88', 2) + line(F.curve(phi), c)
        + label(F.X(0), F.Y(1.12), 'H<tspan dy="3" font-size="9">0</tspan>', c, 13) + line(`M${F.X(1.7)} ${F.Y(0.62)}h20m-5-5l5 5-5 5`, AC, 2.5) + label(F.X(2.5), F.Y(0.82), 'H<tspan dy="3" font-size="9">1</tspan>', AC, 13)); },
    // σ is de afstand van het midden tot het buigpunt (hoogte φ(1))
    'toets-param': c => { const F = frame([-3.3, 3.3], [0, 1.08]), h = phi(1);
      return svg(line(F.seg(-3.3, 0, 3.3, 0), AX, 1.5) + dashed(F.seg(0, 0, 0, 1), c + '88', 2) + line(F.curve(phi), c)
        + line(F.seg(0, h, 1, h) + F.seg(0, h - 0.07, 0, h + 0.07) + F.seg(1, h - 0.07, 1, h + 0.07), AC, 2.5) + label(F.X(0.5), F.Y(h) - 7, 'σ', AC, 13)); },
    // verwerpingsgebied rechts van μ + 1,645σ (α = 0,05) met een uitkomst erin
    'toets-conclusie': c => { const F = frame([-3.3, 3.3], [0, 1.08], [P, W - P, P, H - P - 6]);
      return svg(fill(F.area(phi, 1.645, 3.3), AC, 0.6) + line(F.seg(-3.3, 0, 3.3, 0), AX, 1.5) + dashed(F.seg(1.645, 0, 1.645, 0.7), AC, 2) + line(F.curve(phi), c) + `<path d="M${F.X(2.3) - 5} ${F.Y(0) + 7}L${F.X(2.3)} ${F.Y(0) + 1}L${F.X(2.3) + 5} ${F.Y(0) + 7}Z" fill="${c}"/>`); },

    // a, b, c en d: evenwichtsstand, amplitude, periode, beginpunt
    'sin-abcd': c => { const F = frame(SIN.xr, SIN.yr);
      return svg(dashed(F.seg(0, 0, 9, 0), AX, 2) + line(F.seg(0.5, -1.25, 4.5, -1.25) + F.seg(0.5, -1.35, 0.5, -1.15) + F.seg(4.5, -1.35, 4.5, -1.15), AC, 2.5)
        + line(F.seg(1.5, 0, 1.5, 1), AC, 2.5) + line(F.curve(SIN.f), c) + dot(F.X(0.5), F.Y(0), c, true)); },
    'sin-minmax': c => { const F = frame(SIN.xr, SIN.yr);
      return svg(dashed(F.seg(0, 1, 9, 1), AC, 2) + dashed(F.seg(0, -1, 9, -1), AC, 2) + line(F.curve(SIN.f), c) + [1.5, 5.5].map(t => dot(F.X(t), F.Y(1), c)).join('') + [3.5, 7.5].map(t => dot(F.X(t), F.Y(-1), c, true)).join('')); },
    // sin(…) = 0,3: per periode twee oplossingen
    'sin-tijdstip': c => { const F = frame(SIN.xr, SIN.yr), u = Math.asin(0.3) * 4 / (2 * Math.PI), ts = [];
      for (let k = 0; k < 3; k++) ts.push(0.5 + u + 4 * k, 0.5 + 2 - u + 4 * k);
      return svg(dashed(F.seg(0, 0.3, 9, 0.3), AC, 2.5) + line(F.curve(SIN.f), c) + ts.filter(t => t <= 9).map(t => dot(F.X(t), F.Y(0.3), c, true)).join('')); },
    // de top ligt een kwart periode na het beginpunt
    'sin-top': c => { const F = frame(SIN.xr, SIN.yr);
      return svg(dashed(F.seg(0, 0, 9, 0), AX, 2) + dashed(F.seg(1.5, -1.4, 1.5, 1), AC, 2) + line(F.seg(0.5, 0, 1.5, 0), AC, 4) + line(F.curve(SIN.f), c) + dot(F.X(0.5), F.Y(0), c, true) + dot(F.X(1.5), F.Y(1), c)); },

    // groeifactor 1,25: elke staaf is 1,25 keer de vorige
    'groei-factor': c => { const F = frame([-0.6, 5.6], [0, 3.3]);
      return svg([0, 1, 2, 3, 4, 5].map(n => `<rect x="${F.X(n - 0.28)}" y="${F.Y(1.25 ** n)}" width="${r1(F.X(0.28) - F.X(-0.28))}" height="${r1(F.Y(0) - F.Y(1.25 ** n))}" rx="3" fill="${c}"/>`).join('')
        + dashed(F.curve(x => 1.25 ** x, -0.3, 5.4), AC, 2.5)); },
    // N = 2^(t/2): verdubbelingstijd 2
    'groei-verdubbel': c => { const F = frame([-0.3, 6.4], [-0.5, 9.4]), f = t => 2 ** (t / 2);
      return svg(F.axes() + [2, 4, 6].map(t => dashed(F.seg(t, 0, t, f(t)) + F.seg(-0.3, f(t), t, f(t)), AC, 2)).join('') + line(F.curve(f, 0, 6.4), c) + [0, 2, 4, 6].map(t => dot(F.X(t), F.Y(f(t)), c)).join('')); },
    // 1,3^t = 5 geeft t = log 5 / log 1,3 ≈ 6,13
    'groei-tijdstip': c => { const F = frame([-0.3, 8.2], [-0.5, 8.9]), t = Math.log(5) / Math.log(1.3);
      return svg(F.axes() + dashed(F.seg(-0.3, 5, t, 5) + F.seg(t, 0, t, 5), AC, 2.5) + line(F.seg(t, 0, t, 0), AC, 6) + line(F.curve(x => 1.3 ** x, 0, 8.2), c) + dot(F.X(t), F.Y(5), c)); },
    // lineair N = 1 + 0,6t tegenover exponentieel N = 1,35^t, zelfde begin
    'groei-model': c => { const F = frame([-0.3, 7.2], [-0.5, 8.8]);
      return svg(F.axes() + line(F.seg(0, 1, 7.2, 1 + 0.6 * 7.2), AC, 3.5) + line(F.curve(t => 1.35 ** t, 0, 7.2), c) + dot(F.X(0), F.Y(1), c)); },
    // N = 8 − 7 · 0,7^t nadert de grenswaarde 8
    'groei-grens': c => { const F = frame([-0.3, 10], [-0.5, 9.2]);
      return svg(F.axes() + dashed(F.seg(-0.3, 8, 10, 8), AC, 2.5) + line(F.curve(t => 8 - 7 * 0.7 ** t, 0, 10), c)); },
    // N = 1,4^t, raaklijn in t = 4 met helling N · ln 1,4
    'groei-snelheid': c => { const F = frame([-0.3, 6.1], [-0.5, 8]), f = t => 1.4 ** t, s = f(4) * Math.log(1.4);
      return svg(F.axes() + dashed(F.seg(2.6, f(4) - 1.4 * s, 5.4, f(4) + 1.4 * s), AC, 3) + line(F.curve(f, 0, 6.1), c) + dot(F.X(4), F.Y(f(4)), c)); },
    // rekenkundige rij u(n) = 2 + 1,2n: elke stap evenveel erbij
    'groei-rij': c => svg(bars([0, 1, 2, 3, 4, 5, 6].map(n => 2 + 1.2 * n), c) + dashed(`M${r1(10 + 104 / 14)} ${r1(H - P - 2 / 9.2 * 56)}L${r1(114 - 104 / 14)} ${r1(H - P - 56)}`, AC, 2.5))
  };
  return A;
})();
