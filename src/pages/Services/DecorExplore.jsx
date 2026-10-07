import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Decor.css";

/* Decor explore flow (single file, like CateringExplore).
   Rendered by ServiceDetails when the slug contains "decor".
   Pages: landing → DIY kits → kit detail → request form | themes → theme detail (form) | custom decor. */

/* ======================================================
   BUILT-IN IMAGES (no files needed)
   Each image is an illustrated SVG generated in code and used as a data URI.
   To use real photos, replace any entry in PHOTOS below with your own URL
   or import, e.g.  diy: "https://your-cdn.com/diy.jpg"
====================================================== */
const PAL = {
  diy:               ["#fde7d8", "#f6c9b5", "#d4005f", "#f4a259", "balloons"],
  t1:                ["#fdebd0", "#f7c873", "#e8890c", "#7a3b18", "garland"],
  t2:                ["#f3d9e8", "#d9a5c8", "#750a3d", "#d4005f", "arch"],
  t3:                ["#e3effa", "#f9dde6", "#8ec5e8", "#f4a6c0", "balloons"],
  custom:            ["#f8eadb", "#e5c08a", "#750a3d", "#c9972b", "arch"],
  "marigold-haldi":  ["#fff1c9", "#f9c74f", "#f08c00", "#7a3b18", "garland"],
  "boho-pampas":     ["#f5ebe0", "#e0c9b0", "#c08a5e", "#8c6a4f", "arch"],
  "pastel-teddy":    ["#e8f1fb", "#fbe1ea", "#a9d0f0", "#f5b5cb", "balloons"],
  "starlit-cabana":  ["#2b1d3a", "#6b3a63", "#ffd37a", "#f6a1b5", "lights"],
  "lotus-urli":      ["#fde8d0", "#f3b27a", "#b5651d", "#750a3d", "lamps"],
  "neon-party":      ["#1a0b2e", "#43195f", "#ff2e93", "#2ee6d6", "balloons"],
  "marigold-theme":  ["#fff0c8", "#f7b733", "#e8890c", "#750a3d", "garland"],
  "royal-mehendi":   ["#f9e0d0", "#e07a5f", "#750a3d", "#2a9d8f", "lamps"],
  "pastel-baby":     ["#fdeef3", "#dcecfa", "#f5b5cb", "#a9d0f0", "balloons"],
  "ivory-reception": ["#faf6ee", "#e8d9b5", "#c9a24b", "#ffffff", "arch"],
};
const MOTIFS = ["balloons", "garland", "arch", "lights", "lamps"];
const strHash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const mix = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  const h = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return "#" + h(r1, r2) + h(g1, g2) + h(b1, b2);
};

const artCache = {};
function art(key, v = 0) {
  const ck = key + v;
  if (artCache[ck]) return artCache[ck];
  const [c1, c2, a1, a2, base] = PAL[key];
  const W = 800, FL = 430; // FL = floor line
  const rnd = seeded(strHash(key) + v * 977);
  const ri = (a, b) => Math.floor(a + rnd() * (b - a + 1));
  const f = (n) => n.toFixed(1);
  const WH = "#ffffff", BK = "#000000", GOLD = "#f7c948";
  const motif = v < 3 ? base : MOTIFS[(strHash(key) + v) % MOTIFS.length];
  const night = parseInt(c1.slice(1, 3), 16) < 90;
  const cols = [a1, a2, mix(a1, WH, 0.55)];

  const flower = (x, y, r, pc, cc) => {
    let o = `<g transform="translate(${f(x)} ${f(y)})">`;
    for (let k = 0; k < 6; k++) o += `<ellipse cx="0" cy="${f(-r * 0.55)}" rx="${f(r * 0.36)}" ry="${f(r * 0.58)}" fill="${pc}" transform="rotate(${k * 60})"/>`;
    return o + `<circle r="${f(r * 0.22)}" fill="${cc}"/></g>`;
  };
  const balloon = (x, y, r, i) =>
    `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r * 0.86)}" ry="${f(r)}" fill="url(#r${i})"/><ellipse cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.4)}" rx="${f(r * 0.14)}" ry="${f(r * 0.26)}" fill="#fff" opacity=".6"/>`;

  let defs = `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` +
    `<linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(c2, BK, 0.1)}"/><stop offset="1" stop-color="${mix(c2, BK, 0.4)}"/></linearGradient>` +
    `<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>` +
    `<filter id="gl" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="5"/></filter>`;
  cols.forEach((c, i) => {
    defs += `<radialGradient id="r${i}" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="${mix(c, WH, 0.5)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${mix(c, BK, 0.3)}"/></radialGradient>`;
  });

  let s = `<rect width="${W}" height="600" fill="url(#bg)"/>`;
  for (let i = 0; i < 14; i++)
    s += `<circle cx="${ri(0, 800)}" cy="${ri(20, 380)}" r="${ri(14, 40)}" fill="${mix(c2, WH, 0.6)}" opacity="${night ? 0.18 : 0.35}" filter="url(#bl)"/>`;
  s += `<rect y="${FL}" width="${W}" height="${600 - FL}" fill="url(#fl)"/><ellipse cx="400" cy="${FL + 10}" rx="360" ry="20" fill="#fff" opacity=".12"/>`;

  if (motif === "arch") {
    // grand stage: drapes, floral arch, chandelier, aisle
    for (let i = 0; i < 10; i++) s += `<rect x="${i * 80}" y="0" width="80" height="${FL}" fill="${i % 2 ? mix(c2, BK, 0.12) : mix(c1, WH, 0.25)}" opacity=".55"/>`;
    for (let i = 0; i < 10; i++) s += `<path d="M${i * 80} 0h80v34q-40 36 -80 0z" fill="${a1}" opacity=".9"/>`;
    s += `<polygon points="300,${FL} 500,${FL} 580,600 220,600" fill="${a1}" opacity=".65"/>`;
    s += `<path d="M230 ${FL} V250 A170 170 0 0 1 570 250 V${FL}" fill="none" stroke="${mix(a1, BK, 0.2)}" stroke-width="22"/>`;
    const fc = [a1, a2, WH, mix(a1, WH, 0.5)];
    for (let i = 0; i <= 44; i++) {
      const ang = Math.PI * (1 - i / 44);
      s += flower(400 + 170 * Math.cos(ang), 250 - 170 * Math.sin(ang), ri(17, 28), fc[ri(0, 3)], GOLD);
    }
    for (let y = 280; y < FL; y += 30) s += flower(230 + ri(-6, 6), y, ri(16, 24), fc[ri(0, 3)], GOLD) + flower(570 + ri(-6, 6), y, ri(16, 24), fc[ri(0, 3)], GOLD);
    for (const px of [90, 710]) for (let y = FL; y > 130; y -= 32) s += flower(px + ri(-10, 10), y, ri(18, 28), fc[ri(0, 3)], GOLD);
    s += `<line x1="400" y1="34" x2="400" y2="96" stroke="${GOLD}" stroke-width="3"/><ellipse cx="400" cy="108" rx="64" ry="14" fill="${GOLD}"/><ellipse cx="400" cy="130" rx="44" ry="10" fill="${GOLD}"/>`;
    for (let i = 0; i < 9; i++) s += `<circle cx="${344 + i * 14}" cy="${146 + (i % 2) * 8}" r="8" fill="#ffe9a8" filter="url(#gl)"/><circle cx="${344 + i * 14}" cy="${146 + (i % 2) * 8}" r="3.5" fill="#fff"/>`;
    s += `<rect x="335" y="330" width="130" height="62" rx="14" fill="${a2}"/><rect x="345" y="318" width="110" height="26" rx="12" fill="${mix(a2, WH, 0.35)}"/>`;
    for (let i = 0; i < 26; i++) s += `<ellipse cx="${ri(230, 570)}" cy="${ri(FL + 20, 590)}" rx="9" ry="5" fill="${fc[ri(0, 3)]}" opacity=".85" transform="rotate(${ri(0, 180)} 400 500)"/>`;
  } else if (motif === "balloons") {
    s += `<rect x="130" y="60" width="540" height="${FL - 50}" rx="26" fill="${mix(c1, WH, 0.55)}" opacity=".55"/>`;
    const n = 34;
    for (let i = 0; i <= n; i++) {
      const ang = Math.PI * (1 - i / n), cx = 400 + 270 * Math.cos(ang), cy = FL - 20 - 300 * Math.sin(ang);
      s += balloon(cx + ri(-8, 8), cy + ri(-8, 8), ri(28, 42), ri(0, 2));
      if (i % 2) s += balloon(cx + ri(-26, 26), cy + ri(-26, 26), ri(16, 24), ri(0, 2));
    }
    s += `<rect x="290" y="372" width="220" height="14" rx="6" fill="${a2}"/><rect x="310" y="386" width="12" height="44" fill="${a2}"/><rect x="478" y="386" width="12" height="44" fill="${a2}"/>`;
    s += `<rect x="340" y="336" width="120" height="36" rx="8" fill="#fff"/><rect x="360" y="306" width="80" height="32" rx="8" fill="${mix(a1, WH, 0.6)}"/><rect x="398" y="288" width="4" height="18" fill="${a2}"/><circle cx="400" cy="284" r="6" fill="#ffd166" filter="url(#gl)"/>`;
    for (let i = 0; i < 5; i++) { const bx = ri(90, 710); s += `<line x1="${bx}" y1="${FL + 60}" x2="${bx + ri(-10, 10)}" y2="${FL + 130}" stroke="#0004"/>` + balloon(bx, FL + 40, ri(22, 32), ri(0, 2)); }
  } else if (motif === "garland") {
    const strand = [a1, "#ffb703", mix(a1, WH, 0.3)];
    s += `<rect x="0" y="0" width="800" height="16" fill="#b8860b"/>`;
    for (let i = 0; i < 22; i++) {
      const x = 20 + i * 36, len = ri(190, 330);
      s += `<line x1="${x}" y1="16" x2="${x}" y2="${16 + len}" stroke="#7a5a2c" stroke-width="1.5"/>`;
      for (let y = 26; y < len; y += 17) s += `<circle cx="${x}" cy="${y}" r="${ri(10, 13)}" fill="${strand[(i + y) % 3 | 0]}"/>`;
    }
    s += `<ellipse cx="400" cy="505" rx="320" ry="62" fill="${a1}" opacity=".4"/>`;
    for (const cx of [170, 630]) s += `<rect x="${cx - 60}" y="440" width="120" height="50" rx="22" fill="${a1}"/><rect x="${cx - 50}" y="430" width="100" height="26" rx="13" fill="${mix(a1, WH, 0.35)}"/>`;
    s += `<ellipse cx="400" cy="440" rx="100" ry="22" fill="#d4a017"/><path d="M300 440 Q400 580 500 440Z" fill="#b8860b"/><ellipse cx="400" cy="440" rx="86" ry="16" fill="#7a4a12"/>`;
    for (let i = 0; i < 9; i++) s += flower(330 + i * 17 + ri(-4, 4), 438 + ri(-5, 5), ri(13, 18), strand[i % 3], "#7a3b18");
  } else if (motif === "lights") {
    for (let i = 0; i < 40; i++) s += `<circle cx="${ri(0, 800)}" cy="${ri(0, 260)}" r="${ri(1, 2)}" fill="#fff" opacity="${(ri(4, 9) / 10).toFixed(1)}"/>`;
    s += `<circle cx="660" cy="90" r="34" fill="#fff6d6" filter="url(#gl)"/><circle cx="660" cy="90" r="26" fill="#fff6d6"/>`;
    s += `<polygon points="400,130 190,${FL} 610,${FL}" fill="#fff" opacity=".1"/>`;
    for (const [x2] of [[190], [300], [400], [500], [610]]) s += `<line x1="400" y1="130" x2="${x2}" y2="${FL}" stroke="#d9a066" stroke-width="7" stroke-linecap="round"/>`;
    s += `<line x1="250" y1="300" x2="550" y2="300" stroke="#d9a066" stroke-width="5"/>`;
    for (let i = 0; i < 20; i++) {
      const x = 30 + i * 38, len = ri(160, 300);
      for (let y = 30; y < len; y += 24) s += `<circle cx="${x}" cy="${y}" r="9" fill="${a1}" opacity=".55" filter="url(#gl)"/><circle cx="${x}" cy="${y}" r="3.2" fill="#fff6d6"/>`;
    }
    s += `<ellipse cx="400" cy="500" rx="260" ry="52" fill="${a2}" opacity=".5"/>`;
    for (let i = 0; i < 24; i++) s += `<ellipse cx="${ri(180, 620)}" cy="${ri(460, 570)}" rx="9" ry="5" fill="${a2}" transform="rotate(${ri(0, 180)} 400 510)"/>`;
    for (const cx of [330, 400, 470]) s += `<rect x="${cx - 7}" y="${470}" width="14" height="34" rx="3" fill="#fff6d6"/><circle cx="${cx}" cy="462" r="10" fill="#ffd166" filter="url(#gl)"/><circle cx="${cx}" cy="463" r="4" fill="#fff"/>`;
  } else {
    // lamps: toran, lanterns, diyas, rangoli
    for (let i = 0; i < 16; i++) s += `<path d="M${i * 50} 0h50l-25 70z" fill="${i % 2 ? a1 : "#f9a620"}"/>`;
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 150, y = 150 + (i % 2) * 40;
      s += `<line x1="${x}" y1="60" x2="${x}" y2="${y - 30}" stroke="#7a5a2c"/><circle cx="${x}" cy="${y}" r="30" fill="#ffd166" opacity=".6" filter="url(#gl)"/><ellipse cx="${x}" cy="${y}" rx="20" ry="28" fill="${a1}"/><ellipse cx="${x}" cy="${y}" rx="9" ry="22" fill="#ffd166" opacity=".8"/>`;
    }
    s += `<g transform="translate(400 515) scale(1 .3)"><circle r="190" fill="${mix(a2, WH, 0.5)}" opacity=".45"/><circle r="150" fill="none" stroke="${a1}" stroke-width="6"/>`;
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; s += flower(Math.cos(a) * 120, Math.sin(a) * 120, 28, cols[k % 3], GOLD); }
    s += flower(0, 0, 50, a1, GOLD) + `</g>`;
    const n = 7;
    for (let i = 0; i < n; i++) {
      const x = 90 + i * (620 / (n - 1)), y = 420 + (i % 2) * 14;
      s += `<circle cx="${x}" cy="${y - 20}" r="22" fill="#ffd166" opacity=".8" filter="url(#gl)"/><path d="M${x - 32} ${y}q32 44 64 0z" fill="${a1}"/><path d="M${x} ${y - 4}q-11 -20 0 -40 q11 20 0 40z" fill="#ffb703"/><path d="M${x} ${y - 4}q-5 -10 0 -20 q5 10 0 20z" fill="#fff6d6"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs>${defs}</defs>${s}</svg>`;
  return (artCache[ck] = "data:image/svg+xml;utf8," + encodeURIComponent(svg));
}
const set5 = (key) => [0, 1, 2, 3, 4].map((v) => art(key, v));

/* ======================================================
   PHOTOS: replace any entry with your own image URL / import.
   Anything left empty (or that fails to load) shows a soft placeholder block.
   Kits / themes: up to 5 photos each, the first one is the card cover.
====================================================== */
const PHOTOS = {
  diy: art("diy", 0),                                  // landing card: DIY Decoration
  themes: [art("t1", 0), art("t2", 0), art("t3", 0)],  // landing card: Theme collage (1 large + 2 small)
  custom: art("custom", 0),                            // landing card: Customized Decoration
  kits: {
    "marigold-haldi": set5("marigold-haldi"),
    "boho-pampas": set5("boho-pampas"),
    "pastel-teddy": set5("pastel-teddy"),
    "starlit-cabana": set5("starlit-cabana"),
    "lotus-urli": set5("lotus-urli"),
    "neon-party": set5("neon-party"),
  },
  themeList: {
    "marigold-theme": set5("marigold-theme"),
    "royal-mehendi": set5("royal-mehendi"),
    "pastel-baby": set5("pastel-baby"),
    "ivory-reception": set5("ivory-reception"),
  },
  customHero: art("custom", 1),
  customGallery: [art("custom", 2), art("custom", 3), art("custom", 4), art("custom", 0)], // 4 photos
};

const inr = (n) => "₹" + n.toLocaleString("en-IN");
const five = (a = []) => Array.from({ length: 5 }, (_, i) => a[i] || "");

const WHATSAPP_NUMBER = "919999999999"; // country code + number, no "+"
const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

/* ---------- Decor landing (3 cards) ---------- */
const DECOR_TYPES = [
  { page: "kits", title: "DIY Decoration", cta: "Explore DIY", image: PHOTOS.diy,
    text: "Ready-to-use decoration kits with everything you need to create a beautiful setup yourself. Perfect for birthdays, intimate gatherings, and budget celebrations." },
  { page: "themes", title: "Theme Decoration", cta: "Explore Themes", collage: PHOTOS.themes,
    text: "Choose from our curated decoration themes and personalize selected details to match your celebration. Hassle-free professional setup by our event artists." },
  { page: "custom", title: "Customized Decoration", cta: "Create Your Setup", image: PHOTOS.custom,
    text: "Bring your ideas, story, and inspiration to us. Our bespoke design team will craft a one-of-a-kind grand concept tailored to your celebration." },
];

/* ---------- DIY kits (order = default "popularity" order in the design) ---------- */
const KIT_CATEGORIES = ["All Kits", "Haldi & Mehendi", "Birthdays & Milestones", "Baby Shower & Welcome", "Anniversary & Dates", "Festive & Pooja"];

const KITS = [
  { id: "marigold-haldi", cat: "Haldi & Mehendi", tag: "Traditional & Joyful", price: 4999, mrp: 7500, popularity: 98, weight: "8.2 kg Total Box", footprint: "Fits 8x8 to 10x10 ft",
    title: "Sun-Kissed Marigold & Brass Haldi Kit",
    desc: "Brass-finish backdrop collapsible frame, 20m artisan marigold garlands, organza ceiling drapes, rangoli stencils and a brass urli centerpiece.",
    images: PHOTOS.kits["marigold-haldi"] },
  { id: "boho-pampas", cat: "Birthdays & Milestones", tag: "Modern Editorial", price: 3499, mrp: 5200, popularity: 95, weight: "7.5 kg Total Box", footprint: "Fits 6x8 ft",
    title: "Boho Chic Pampas & Macrame Birthday Box",
    desc: "Interlocking wooden arch kit, fluffy dried pampas bundles, warm micro-LED string lights, macrame hangings and balloon garland set.",
    images: PHOTOS.kits["boho-pampas"] },
  { id: "pastel-teddy", cat: "Baby Shower & Welcome", tag: "Dreamy & Whimsical", price: 5799, mrp: 8600, popularity: 92, weight: "9 kg Total Box", footprint: "Fits 8x8 ft",
    title: "Pastel Cloud & Teddy Baby Shower Setup",
    desc: "Dual nesting lightweight frame, double-stuffed pastel cloud balloons, four transparent teddy blocks and a welcome signboard.",
    images: PHOTOS.kits["pastel-teddy"] },
  { id: "starlit-cabana", cat: "Anniversary & Dates", tag: "Intimate & Cozy", price: 2999, mrp: 4500, popularity: 90, weight: "6 kg Total Box", footprint: "Fits 6x6 ft",
    title: "Starlit Cabana Romantic Date Night Kit",
    desc: "Pop-up natural pine teepee frames, sheer cascading ivory curtains, 500 velvety silk rose petals and warm fairy lights.",
    images: PHOTOS.kits["starlit-cabana"] },
  { id: "lotus-urli", cat: "Festive & Pooja", tag: "Heritage & Devotion", price: 3899, mrp: 5800, popularity: 88, weight: "10 kg Total Box", footprint: "Fits 4x6 ft",
    title: "Traditional Lotus Urli Pooja & Housewarming",
    desc: "14-inch heavy spun polished brass urli bowl, 12 floating metal diya cups, banana leaf printed backdrop and toran set.",
    images: PHOTOS.kits["lotus-urli"] },
  { id: "neon-party", cat: "Birthdays & Milestones", tag: "Heritage & Devotion", price: 6299, mrp: 9400, popularity: 85, weight: "7 kg Total Box", footprint: "Fits 6x8 ft",
    title: "Neon Glow Retro Party Kit",
    desc: "14-inch heavy spun polished brass urli bowl, 12 floating metal diya cups, banana leaf printed backdrop and toran set.",
    images: PHOTOS.kits["neon-party"] },
];

/* ---------- Theme decoration ---------- */
const THEMES = [
  { id: "marigold-theme", tag: "Festive Celebration Atelier", title: "Sun-Kissed Marigold & Brass Haldi decor", startsAt: 18000,
    desc: "Marigold canopies, brass urli centrepieces and draped organza, set up by our event artists.", images: PHOTOS.themeList["marigold-theme"] },
  { id: "royal-mehendi", tag: "Festive Celebration Atelier", title: "Royal Rajasthani Mehendi decor", startsAt: 22000,
    desc: "Colourful phulkari drapes, floor seating, lanterns and a photo-ready mehendi lounge.", images: PHOTOS.themeList["royal-mehendi"] },
  { id: "pastel-baby", tag: "Festive Celebration Atelier", title: "Pastel Dreams Baby Shower decor", startsAt: 15000,
    desc: "Cloud balloon arches, soft florals and a cake table styled in pastel tones.", images: PHOTOS.themeList["pastel-baby"] },
  { id: "ivory-reception", tag: "Festive Celebration Atelier", title: "Ivory & Gold Reception Stage decor", startsAt: 45000,
    desc: "Layered floral stage, crystal lighting and a walkway styled in ivory and gold.", images: PHOTOS.themeList["ivory-reception"] },
];

/* ---------- Customized decoration page ---------- */
const CUSTOM = {
  title: "Evenddy Customize Decor",
  price: 150000,
  hero: PHOTOS.customHero,
  gallery: Array.from({ length: 4 }, (_, i) => PHOTOS.customGallery[i] || ""),
  about: [
    "Led by architectural designers and senior floral sculptors, Evenddy Bespoke Decor Atelier transforms heritage ballrooms, private royal courtyards, and sun-drenched coastal venues into evocative living tapestries. We treat decor as spatial emotion, balancing dramatic scale with microscopic botanical detail.",
    "Unlike fragmented decor agencies, Evenddy operates with a **100% proprietary in-house fabrication plant** and temperature-controlled botanical cold storage in Mumbai and Udaipur. This guarantees zero third-party variance, exact 3D-to-real-life fidelity, and seamless execution two hours before your first guest arrives.",
  ],
  specialisations: ["Monolithic Mandap Architecture", "Sun-kissed Bohemian Haldi & Mehendi", "High-Octane Concert Sangeet Trussing", "Curated Banquet Tablescapes", "Intelligent Kinetic Lighting", "Heritage Palace Restoration Styling"],
  stats: [{ n: "120+", l: "Grand Events Styled", s: "Across 14 luxury destination cities" }, { n: "12+", l: "Years of operation", s: "" }],
};
const rich = (t) => t.split("**").map((x, i) => (i % 2 ? <b key={i}>{x}</b> : x));
const OCCASIONS = ["Wedding", "Engagement", "Reception", "Sangeet / Mehendi", "Haldi", "Birthday", "Baby Shower", "Corporate Event", "Other"];
const BUDGETS = ["₹1L - ₹3L", "₹3L - ₹6L", "₹6L - ₹10L", "₹10L+"];
// first 3 digits of a pincode → city (used in the delivery check message)
const PIN_CITY = { "400": "Mumbai", "110": "Delhi", "560": "Bengaluru", "500": "Hyderabad", "530": "Visakhapatnam", "520": "Vijayawada", "600": "Chennai", "700": "Kolkata", "411": "Pune" };

/* ======================================================
   SMALL SHARED PIECES: icons, photo with placeholder
====================================================== */
const ICONS = {
  bag: <><path d="M6 8h12l1 12H5L6 8z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  truck: <><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>,
  archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10h14V9M10 13h4" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 16l5-5 4 4 3-3 6 6" /></>,
  checkc: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>,
  infinity: <path d="M6 8c-2.2 0-4 1.8-4 4s1.8 4 4 4c4 0 8-8 12-8 2.2 0 4 1.8 4 4s-1.8 4-4 4c-4 0-8-8-12-8z" />,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  shieldcheck: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  wa: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />,
  send: <><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" /></>,
  pin: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  award: <><circle cx="12" cy="9" r="6" /><path d="M8.5 14L7 22l5-3 5 3-1.5-8" /></>,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></>,
};
function Icon({ name, size = 14 }) {
  const filled = name === "wa"; // brand glyph is a solid shape, not an outline
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="dc-ic">
      {ICONS[name]}
    </svg>
  );
}

// Photo with a soft placeholder when the URL is empty or fails to load
function Pic({ src, alt = "" }) {
  const [bad, setBad] = useState(!src);
  useEffect(() => setBad(!src), [src]);
  return bad
    ? <div className="dc-ph" role="img" aria-label={alt || "Photo placeholder"} />
    : <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} />;
}

/* ======================================================
   SHARED: MODAL, SUCCESS POPUP, ENQUIRY FORM
====================================================== */
function Modal({ label, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="dc-overlay" onClick={onClose}>
      <div className="dc-modal" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function SuccessModal({ onClose }) {
  return (
    <Modal label="Quote request submitted" onClose={onClose}>
      <div className="dc-success-icon" aria-hidden="true">✓</div>
      <h3>Quote Request Submitted Successfully!</h3>
      <p>Thank you for choosing <b>Evenddy</b>. We've received your request and our team will review your requirements.</p>
      <p>Our team will get in touch with you shortly to discuss your requirements and provide the quote.</p>
      <button className="dc-btn dc-btn-block" onClick={onClose}>Continue Browsing →</button>
    </Modal>
  );
}

// Defined outside the form so inputs keep focus while typing.
const Field = ({ id, label, error, children }) => (
  <div className="dc-field">
    <label htmlFor={`dc-${id}`}>{label}</label>
    {children}
    {error && <small className="dc-error" role="alert">{error}</small>}
  </div>
);

function EnquiryForm({ variant = "theme", subject = "", onSuccess }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", date: "", occasion: "", budget: BUDGETS[1], city: "" });
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const v = {};
    if (!f.name.trim()) v.name = "Enter your name";
    if (!/^\d{10}$/.test(f.phone)) v.phone = "Enter a 10-digit number";
    if (!f.date) v.date = "Pick a date";
    if (variant === "custom" && !f.occasion) v.occasion = "Select an occasion";
    setErr(v);
    if (Object.keys(v).length) return;
    // TODO: send `f` + `subject` to your backend / CRM here
    console.log("Decor enquiry:", { variant, subject, ...f });
    onSuccess?.(f);
  };

  return (
    <form className="dc-form" onSubmit={submit} noValidate>
      <div className="dc-notice">
        <span className="dc-notice-ic"><Icon name="lock" size={14} /></span>
        <div><b>Zero Login Friction</b><span>Enquire immediately as guest. We respect privacy.</span></div>
      </div>

      <div className="dc-row">
        <Field id="name" label="Full Name *" error={err.name}>
          <input id="dc-name" value={f.name} onChange={set("name")} placeholder="e.g. Radhika Roy" autoComplete="name" />
        </Field>
        <Field id="phone" label="Phone / WhatsApp *" error={err.phone}>
          <div className="dc-phone"><span>+91</span>
            <input id="dc-phone" value={f.phone} onChange={set("phone")} placeholder="Enter phone number" inputMode="numeric" maxLength={10} autoComplete="tel-national" />
          </div>
        </Field>
      </div>

      <div className="dc-row">
        <Field id="email" label="Email (Optional)">
          <input id="dc-email" type="email" value={f.email} onChange={set("email")} placeholder="name@domain.com" autoComplete="email" />
        </Field>
        <Field id="date" label="Event Date *" error={err.date}>
          <input id="dc-date" type="date" value={f.date} onChange={set("date")} />
        </Field>
      </div>

      {variant === "custom" && (
        <Field id="occasion" label="Select Occasion Type" error={err.occasion}>
          <select id="dc-occasion" value={f.occasion} onChange={set("occasion")}>
            <option value="">Select occasion/event</option>
            {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
      )}

      <div className={variant === "custom" ? "dc-row" : ""}>
        {variant === "custom" && (
          <Field id="budget" label="Estimated Decor Budget">
            <select id="dc-budget" value={f.budget} onChange={set("budget")}>
              {BUDGETS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
        )}
        <Field id="city" label="Venue / City">
          <input id="dc-city" value={f.city} onChange={set("city")} placeholder="e.g. Vizag" autoComplete="address-level2" />
        </Field>
      </div>

      <button type="submit" className="dc-btn dc-btn-block dc-btn-icon">Send Enquiry <Icon name="send" size={16} /></button>
      <a className="dc-wa" target="_blank" rel="noreferrer"
         href={waLink(`Hi Evenddy, I'd like a decor quote${subject ? ` for: ${subject}` : ""}.${f.name ? ` Name: ${f.name}.` : ""}`)}>
        <Icon name="wa" size={20} />Chat Directly on WhatsApp
      </a>

      <ul className="dc-trust">
        <li><Icon name="shieldcheck" size={13} />Zero Commission • Direct Studio Relationship</li>
        <li><Icon name="clock" size={13} />Guaranteed Response within 15 mins during 9am–10pm</li>
        <li><Icon name="shield" size={13} />No Spam Guarantee • Your details are never sold to vendors</li>
      </ul>
    </form>
  );
}

/* ======================================================
   PAGE: DECOR LANDING
====================================================== */
function DecorLanding({ types, go }) {
  return (
    <section className="dc-landing">
      <h1 className="dc-title">Our Decor Service</h1>
      <p className="dc-sub">Everything you need to create the perfect celebration, meticulously organized and beautifully presented.</p>
      <div className="dc-grid3">
        {types.map((t) => (
          <article key={t.page} className="dc-type-card">
            {t.collage ? (
              <div className="dc-collage" role="img" aria-label={t.title}>
                {[0, 1, 2].map((i) => <Pic key={i} src={t.collage[i]} />)}
              </div>
            ) : (
              <div className="dc-type-media"><Pic src={t.image} alt={t.title} /></div>
            )}
            <div className="dc-type-body">
              <h2>{t.title}</h2>
              <p>{t.text}</p>
              <button className="dc-link" onClick={() => go(t.page)}>{t.cta} <span aria-hidden="true">→</span></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ======================================================
   PAGE: DIY KITS / THEMES LIST
====================================================== */
// mode="kits" → DIY kits for sale (search, sort, categories). mode="themes" → theme decoration list.
function DecorListing({ mode, go }) {
  const isKits = mode === "kits";
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popularity");
  const [cat, setCat] = useState(KIT_CATEGORIES[0]);

  const items = useMemo(() => {
    let list = isKits ? KITS : THEMES;
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((x) => `${x.title} ${x.desc} ${x.tag}`.toLowerCase().includes(s));
    if (isKits && cat !== KIT_CATEGORIES[0]) list = list.filter((x) => x.cat === cat);
    if (isKits) {
      list = [...list].sort((a, b) =>
        sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : b.popularity - a.popularity);
    }
    return list;
  }, [isKits, q, sort, cat]);

  return (
    <section>
      <p className="dc-eyebrow">{isKits ? "Buy & keep forever • No returns needed" : "Professional setup by our event artists"}</p>
      <h1 className="dc-h1">
        {isKits ? <><span>Curated DIY Event Kits</span> for Sale.</> : <><span>Curated Decoration Themes</span> by Evenddy.</>}
      </h1>
      <p className="dc-lead">
        {isKits
          ? "All-in-one celebration boxes delivered straight to your doorstep. Complete with everything you need to style your event like an editorial designer — 100% yours to keep, repurpose, or gift."
          : "Pick a theme, personalise the details and let our event artists handle the setup, styling and takedown."}
      </p>

      <div className="dc-filter">
        <div className="dc-filter-top">
          <label className="dc-search">
            <Icon name="search" size={14} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={isKits ? "Search components, props or themes..." : "Search themes..."} aria-label="Search" />
          </label>
          {isKits && (
            <label className="dc-sort">Sort by:
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="popularity">popularity</option>
                <option value="low">price: low to high</option>
                <option value="high">price: high to low</option>
              </select>
            </label>
          )}
        </div>
        {isKits && (
          <div className="dc-chips" role="tablist" aria-label="Kit categories">
            {KIT_CATEGORIES.map((c) => (
              <button key={c} role="tab" aria-selected={cat === c} className={`dc-chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="dc-empty">Nothing matches your search. Try a different word or category.</p>
      ) : (
        <div className="dc-grid3 dc-list">
          {items.map((x) => (
            <button key={x.id} className="dc-card" onClick={() => go(isKits ? "kit" : "theme", x.id)}>
              <div className="dc-card-img">
                <Pic src={x.images[0]} alt={x.title} />
                <span className="dc-pill">{isKits ? `Own for ${inr(x.price)}` : `From ${inr(x.startsAt)}`}</span>
              </div>
              <div className="dc-card-body">
                <small className="dc-tag">{x.tag}</small>
                <h3>{x.title}</h3>
                <p>{x.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

/* ======================================================
   PAGE: KIT DETAIL ("Request kit" opens the request page, not a popup)
====================================================== */
function KitDetail({ kit, go }) {
  const imgs = five(kit.images);
  const [active, setActive] = useState(0);
  const [pin, setPin] = useState("");
  const [pinMsg, setPinMsg] = useState(null);
  const off = Math.round((1 - kit.price / kit.mrp) * 100);

  const verify = () => {
    if (!/^\d{6}$/.test(pin)) return setPinMsg({ ok: false, text: "Enter a valid 6-digit pincode." });
    // TODO: replace with your real serviceability API
    const city = PIN_CITY[pin.slice(0, 3)];
    setPinMsg({ ok: true, text: `Delivering to ${city ? city + " " : ""}${pin} by Friday. Express Air dispatched.` });
  };

  return (
    <div className="dc-detail">
      <div>
        <div className="dc-gallery-main">
          <Pic src={imgs[active]} alt={`${kit.title} view ${active + 1}`} />
          <div className="dc-badges">
            <span className="dc-badge"><Icon name="bag" size={11} />Best Seller</span>
            <span className="dc-badge dc-badge-light"><Icon name="lock" size={11} />100% Yours to Keep</span>
          </div>
        </div>
        <div className="dc-thumbs">
          {imgs.map((src, i) => (
            <button key={i} className={i === active ? "on" : ""} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`}><Pic src={src} /></button>
          ))}
        </div>
        <div className="dc-ship-note">
          <span className="dc-ship-ic"><Icon name="truck" size={16} /></span>
          <div><b>Delivered in 2-3 business days in heavy-duty reusable tote</b><small>Carefully sealed, moisture-proofed, and ready for immediate ceremony assembly.</small></div>
        </div>
      </div>

      <aside className="dc-buy">
        <small className="dc-eyebrow-sm">Festive celebration atelier</small>
        <h1>{kit.title}</h1>
        <p className="dc-rating"><span aria-hidden="true">★★★★★</span> <b>4.9</b> <small>(142 verified host reviews)</small></p>

        <div className="dc-price-box">
          <div className="dc-price"><strong>{inr(kit.price)}</strong><s>{inr(kit.mrp)}</s><span className="dc-off">{off}% OFF</span></div>
          <p className="dc-own"><Icon name="checkc" size={14} /><span>Complete Box to Own Forever • No returns, zero rental deposit</span></p>
          <small>All taxes included. Free insured door delivery across India.</small>
        </div>

        <div className="dc-specs">
          <div><small><Icon name="archive" size={13} />Shipping weight</small><b>{kit.weight}</b></div>
          <div><small><Icon name="image" size={13} />Footprint</small><b>{kit.footprint}</b></div>
        </div>

        <button className="dc-btn dc-btn-block" onClick={() => go("request", kit.id)}>Request kit</button>
        <a className="dc-wa" target="_blank" rel="noreferrer" href={waLink(`Hi Evenddy, I'd like to order: ${kit.title} (${inr(kit.price)}).`)}><Icon name="wa" size={20} />Book on WhatsApp</a>

        <div className="dc-pin">
          <b>Check Delivery &amp; Setup Window</b>
          <div className="dc-pin-row">
            <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} maxLength={6} inputMode="numeric" placeholder="Enter pincode" aria-label="Pincode" />
            <button onClick={verify}>Verify</button>
          </div>
          {pinMsg && <small className={pinMsg.ok ? "dc-ok" : "dc-error"} role="status">{pinMsg.ok && <Icon name="checkc" size={13} />}{pinMsg.text}</small>}
        </div>

        <div className="dc-assure">
          <div><Icon name="infinity" size={16} /><div><b>100% Buy-to-Own</b><small>Zero rental return coordination</small></div></div>
          <div><Icon name="shield" size={16} /><div><b>Free Insured Transit</b><small>Replacements covered for transit wear</small></div></div>
        </div>
      </aside>
    </div>
  );
}

/* ======================================================
   PAGE: REQUEST FORM (kit request + theme detail share this layout)
====================================================== */
function FormDetail({ item, tag }) {
  const imgs = five(item.images);
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(false);
  return (
    <div className="dc-detail dc-detail-form">
      <div>
        <div className="dc-gallery-main"><Pic src={imgs[active]} alt={`${item.title} view ${active + 1}`} /></div>
        <div className="dc-thumbs">
          {imgs.map((src, i) => (
            <button key={i} className={i === active ? "on" : ""} onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`}><Pic src={src} /></button>
          ))}
        </div>
      </div>
      <aside className="dc-buy">
        <small className="dc-eyebrow-sm">{tag}</small>
        <h1>{item.title}</h1>
        <p className="dc-rating"><span aria-hidden="true">★★★★★</span> <b>4.9</b> <small>(142 verified host reviews)</small></p>
        <EnquiryForm variant="theme" subject={item.title} onSuccess={() => setDone(true)} />
      </aside>
      {done && <SuccessModal onClose={() => setDone(false)} />}
    </div>
  );
}

/* ======================================================
   PAGE: CUSTOMIZED DECOR
====================================================== */
function CustomDecor() {
  const [tab, setTab] = useState("portfolio");
  const [done, setDone] = useState(false);
  const refs = { portfolio: useRef(null), about: useRef(null) };
  const jump = (k) => { setTab(k); refs[k].current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const share = async () => {
    try { await navigator.share?.({ title: CUSTOM.title, url: window.location.href }); } catch { /* cancelled */ }
  };
  const review = () => window.open(waLink(`Hi Evenddy, I'd like to share a review for ${CUSTOM.title}.`), "_blank", "noreferrer");

  return (
    <div className="dc-custom">
      <div>
        <div className="dc-panel dc-panel-flush">
          <div className="dc-hero-img"><Pic src={CUSTOM.hero} alt="Grand floral mandap stage" /></div>
          <div className="dc-custom-head">
            <div>
              <h1>{CUSTOM.title} <span className="dc-chip-sm">In-House Production</span></h1>
              <p className="dc-meta">
                <span><b>★ 4.9</b> (184 Verified Reviews)</span><i className="dc-sep" />
                <span><Icon name="pin" size={13} />Vizag, Andhra Pradesh, India</span>
              </p>
              <p className="dc-meta">
                <span><Icon name="award" size={13} />120+ Grand Celebrations Styled</span><i className="dc-sep" />
                <span><Icon name="bolt" size={13} /><b>Avg. Response: 12 Mins</b></span>
              </p>
            </div>
            <div className="dc-actions">
              <button className="dc-round" onClick={share} aria-label="Share"><Icon name="share" size={16} /></button>
              <button className="dc-round dc-round-wide dc-write" onClick={review}><Icon name="edit" size={15} /><span>Write<br />Review</span></button>
            </div>
          </div>
          <div className="dc-tabs" role="tablist">
            {[["portfolio", "Portfolio (140)"], ["about", "About"]].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => jump(k)}>{l}</button>
            ))}
          </div>
        </div>

        <section className="dc-panel" ref={refs.portfolio}>
          <small className="dc-eyebrow-sm">Real celebrations</small>
          <h2 className="dc-h2">Portfolio Gallery (140)</h2>
          <div className="dc-gal">{CUSTOM.gallery.map((s, i) => <div key={i} className="dc-gal-i"><Pic src={s} alt="Past celebration" /></div>)}</div>
          <button className="dc-btn dc-btn-ghost dc-center dc-btn-icon">Explore Entire Gallery (140 Projects) <span aria-hidden="true">→</span></button>
        </section>

        <section className="dc-panel" ref={refs.about}>
          <small className="dc-eyebrow-sm">About</small>
          <h2 className="dc-h2">Evenddy Custom decor</h2>
          {CUSTOM.about.map((p) => <p key={p} className="dc-body">{rich(p)}</p>)}
          <small className="dc-eyebrow-sm">Events handled &amp; specialisations</small>
          <div className="dc-tags">{CUSTOM.specialisations.map((s) => <span key={s}>{s}</span>)}</div>
          <div className="dc-stats">
            {CUSTOM.stats.map((s) => <div key={s.l}><strong>{s.n}</strong><b>{s.l}</b>{s.s && <small>{s.s}</small>}</div>)}
          </div>
        </section>
      </div>

      <aside className="dc-quote">
        <div className="dc-quote-top">
          <strong>₹{CUSTOM.price.toLocaleString("en-IN")}</strong>
          <span>Direct Atelier Rates</span>
          <small>Starting Base Package</small><small>0% Portal Fee</small>
        </div>
        <EnquiryForm variant="custom" subject={CUSTOM.title} onSuccess={() => setDone(true)} />
      </aside>
      {done && <SuccessModal onClose={() => setDone(false)} />}
    </div>
  );
}

/* ======================================================
   MAIN
====================================================== */
/* The current page lives in the URL (?page=kits, ?page=kit&id=boho-pampas, ?page=request&id=boho-pampas, ...)
   so the browser Back button steps back one page at a time instead of jumping to Home. */
export default function DecorExplore() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const PAGES = ["landing", "kits", "themes", "kit", "request", "theme", "custom"];
  const p = params.get("page");
  const view = { page: PAGES.includes(p) ? p : "landing", id: params.get("id") };
  const go = (page, id = null) => {
    setParams(page === "landing" ? {} : id ? { page, id } : { page });
    window.scrollTo({ top: 0 });
  };

  const kit = KITS.find((k) => k.id === view.id);
  const theme = THEMES.find((t) => t.id === view.id);

  const trail = [
    { label: "Home", to: () => navigate("/") },
    { label: "Services", to: () => navigate("/services") },
    { label: "Decor", to: () => go("landing") },
  ];
  if (["kits", "kit", "request"].includes(view.page)) trail.push({ label: "DIY Kits", to: () => go("kits") });
  if ((view.page === "kit" || view.page === "request") && kit) trail.push({ label: kit.title });
  if (view.page === "themes" || view.page === "theme") trail.push({ label: "Themes", to: () => go("themes") });
  if (view.page === "theme" && theme) trail.push({ label: theme.title });
  if (view.page === "custom") trail.push({ label: "Custom Decor" });

  return (
    <div className="dc">
      <div className="dc-wrap">
        <nav className="dc-crumb" aria-label="Breadcrumb">
          {trail.map((c, i) => (
            <span key={c.label}>
              {c.to && i < trail.length - 1 ? <button onClick={c.to}>{c.label}</button> : <b aria-current="page">{c.label}</b>}
              {i < trail.length - 1 && <i> &gt; </i>}
            </span>
          ))}
        </nav>

        {view.page === "landing" && <DecorLanding types={DECOR_TYPES} go={go} />}
        {view.page === "kits" && <DecorListing mode="kits" go={go} />}
        {view.page === "themes" && <DecorListing mode="themes" go={go} />}
        {view.page === "kit" && kit && <KitDetail kit={kit} go={go} />}
        {view.page === "request" && kit && <FormDetail item={kit} tag="Festive celebration atelier" />}
        {view.page === "theme" && theme && <FormDetail item={theme} tag={theme.tag} />}
        {view.page === "custom" && <CustomDecor />}
      </div>
    </div>
  );
}
