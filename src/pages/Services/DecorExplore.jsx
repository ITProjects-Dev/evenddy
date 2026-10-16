import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sendMail } from "./sendmail";

/* Decor explore flow (single file, like CateringExplore), styled with Tailwind only.
   You can delete Decor.css and its import. Font comes from your global Sora setup.
   Rendered by ServiceDetails when the slug contains "decor".
   Pages: landing → DIY kits → kit detail → request form | themes → theme detail (form) | custom decor.

   NOTE: your global CSS has unlayered rules (a{color:inherit}, button{border:0},
   h1,h2{font-weight/letter-spacing}, h1-h4,p{margin-top:0}). They beat Tailwind v4 utilities, so:
   - I use the "!" suffix where needed (text-white!, font-normal!, tracking-[-.02em]!)
   - button outlines use inset box-shadows instead of borders
   - top spacing on headings/paragraphs uses padding, not margin. Keep these as they are. */

/* ======================================================
   BUILT-IN IMAGES (no files needed)
   Illustrated SVGs generated in code are kept ONLY as a fallback.
   The page loads real photos from /images/decor/ first (see PHOTOS below).
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
/* Real photos live in  public/images/decor/  (served at /images/decor/...).
   If a photo file is missing or fails to load, the illustrated SVG above is shown instead,
   so nothing ever looks broken while you add images one by one.
   To use a CDN instead of local files, change IMG_BASE to e.g. "https://your-cdn.com/decor/". */
const IMG_BASE = "/images/decor/";
const FALLBACK = {}; // photo url → () => illustrated fallback (generated lazily, only if needed)
const photo = (file, key, v = 0) => {
  const url = IMG_BASE + file;
  FALLBACK[url] = () => art(key, v);
  return url;
};
// 5 photos per kit / theme: <slug>-1.jpg … <slug>-5.jpg  (the first one is the card cover)
const set5 = (key) => [1, 2, 3, 4, 5].map((n, i) => photo(`${key}-${n}.jpg`, key, i));

/* ======================================================
   PHOTOS: replace any entry with your own image URL / import.
   Anything left empty (or that fails to load) shows a soft placeholder block.
   Kits / themes: up to 5 photos each, the first one is the card cover.
====================================================== */
const PHOTOS = {
  diy: photo("diy.jpg", "diy"),                                                  // landing card: DIY Decoration
  themes: [photo("themes-1.jpg", "t1"), photo("themes-2.jpg", "t2"), photo("themes-3.jpg", "t3")], // landing card: collage (1 large + 2 small)
  custom: photo("custom.jpg", "custom"),                                          // landing card: Customized Decoration
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
  customHero: photo("custom-hero.jpg", "custom", 1),
  customGallery: [1, 2, 3, 4].map((n) => photo(`custom-gallery-${n}.jpg`, "custom", n + 1)), // 4 photos
};

const inr = (n) => "₹" + n.toLocaleString("en-IN");
const five = (a = []) => Array.from({ length: Math.max(5, a.length) }, (_, i) => a[i] || "");
const cx = (...a) => a.filter(Boolean).join(" ");

const WHATSAPP_NUMBER = "+91 9XXXX XXXXX"; // country code + number, no "+"
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
  { id: "neon-party", cat: "Birthdays & Milestones", tag: "Bold & Playful", price: 6299, mrp: 9400, popularity: 85, weight: "7 kg Total Box", footprint: "Fits 6x8 ft",
    title: "Neon Glow Retro Party Kit",
    desc: "Black foil fringe curtain, neon-style party sign, metallic disco balls, balloon clusters and a cake-table runner.",
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

/* ---------- Reviews (replace with data from your backend) ---------- */
const REVIEW_SUMMARY = {
  rating: 4.9,
  total: 184,
  // star → number of reviews (sums to total)
  dist: { 5: 168, 4: 13, 3: 2, 2: 1, 1: 0 },
};
const REVIEWS = [
  { id: 1, name: "Radhika Roy", event: "Wedding • Vizag", date: "Sep 2026", rating: 5,
    text: "The mandap looked exactly like the 3D render. The team was set up two hours before the first guest arrived and every detail was spot on." },
  { id: 2, name: "Sandeep Varma", event: "Sangeet • Hyderabad", date: "Aug 2026", rating: 5,
    text: "Lighting and truss work for our sangeet were outstanding. Very responsive team, and they handled last-minute changes calmly." },
  { id: 3, name: "Anitha Reddy", event: "Haldi • Vijayawada", date: "Jul 2026", rating: 4,
    text: "Beautiful marigold setup and very professional crew. Takedown took slightly longer than planned, but the decor itself was lovely." },
];

const rich = (t) => t.split("**").map((x, i) => (i % 2 ? <b key={i} className="font-semibold text-[#1a1516]">{x}</b> : x));
const OCCASIONS = ["Wedding", "Engagement", "Reception", "Sangeet / Mehendi", "Haldi", "Birthday", "Baby Shower", "Corporate Event", "Other"];
const BUDGETS = ["₹1L - ₹3L", "₹3L - ₹6L", "₹6L - ₹10L", "₹10L+"];
// first 3 digits of a pincode → city (used in the delivery check message)
const PIN_CITY = { "400": "Mumbai", "110": "Delhi", "560": "Bengaluru", "500": "Hyderabad", "530": "Visakhapatnam", "520": "Vijayawada", "600": "Chennai", "700": "Kolkata", "411": "Pune" };

/* ======================================================
   SHARED CLASS STRINGS
====================================================== */
const WRAP = "container";
const CARD_SHADOW = "shadow-[0_4px_18px_rgba(60,20,30,.07)]";
const EYEBROW_SM = "block text-[10px] font-semibold uppercase tracking-[.1em] text-[#7a3b18]";
const H2 = "mb-3.5 pt-1 text-[21px] font-semibold! tracking-[-.01em]! text-[#750a3d]";
const BTN_BLOCK = "flex w-full items-center justify-center gap-2 rounded-full bg-[#750a3d] py-3.5 text-[13px] font-semibold text-white transition hover:brightness-110";
const WA_BTN = "mt-2.5 flex items-center justify-center gap-2 rounded-full border border-[#a7e8bd] bg-[#effcf3] p-[13px] text-[13px] font-semibold text-[#1f9d55]!";
const FIELD = "w-full rounded-lg border border-[#f1ddd2] bg-[#fbeee8] px-3.5 py-3 text-[13px] text-[#1a1516] placeholder:text-[#8f8487] focus:border-[#750a3d] focus:outline-none";
const TITLE_FIXED = "tracking-[-.01em]!";

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
  chevron: <path d="M6 9l6 6 6-6" />,
};
function Icon({ name, size = 14 }) {
  const filled = name === "wa"; // brand glyph is a solid shape, not an outline
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

// Real photo → (if it fails) illustrated fallback → (if that fails) soft placeholder. Always fills its parent.
function Pic({ src, alt = "" }) {
  const [cur, setCur] = useState(src);
  const [bad, setBad] = useState(!src);
  useEffect(() => { setCur(src); setBad(!src); }, [src]);
  const onError = () => {
    const fb = FALLBACK[cur]?.();
    if (fb && fb !== cur) setCur(fb);
    else setBad(true);
  };
  return bad
    ? <div className="size-full bg-gradient-to-br from-[#f6e4da] to-[#efd3c7]" role="img" aria-label={alt || "Photo placeholder"} />
    : <img className="size-full object-cover" src={cur} alt={alt} loading="lazy" decoding="async" onError={onError} />;
}

// Select with a chevron (native arrow removed so it looks the same everywhere)
function SelectBox({ className, children, ...p }) {
  return (
    <div className="relative">
      <select className={cx("appearance-none pr-8", className)} {...p}>{children}</select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6f6366]"><Icon name="chevron" size={11} /></span>
    </div>
  );
}

// Row of 5 text stars (filled up to `value`)
function Stars({ value, size = 13 }) {
  return (
    <span className="inline-flex tracking-[1px] text-[#8a5a1f]" style={{ fontSize: size }} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <span key={n} aria-hidden="true" className={n <= value ? "" : "opacity-25"}>★</span>)}
    </span>
  );
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
    <div className="fixed inset-0 z-[1000] grid place-items-center overflow-auto bg-[rgba(20,10,14,.55)] p-5 backdrop-blur-[3px]" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-[420px] overflow-auto rounded-[18px] bg-white p-7 text-center outline-none" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function SuccessModal({ onClose }) {
  return (
    <Modal label="Quote request submitted" onClose={onClose}>
      <div className="mx-auto mb-3.5 grid size-[54px] place-items-center rounded-full text-2xl text-[#750a3d] shadow-[inset_0_0_0_2px_#750a3d]" aria-hidden="true">✓</div>
      <h3 className="mb-2.5 text-xl font-semibold">Quote Request Submitted Successfully!</h3>
      <p className="mb-2.5 text-xs leading-relaxed text-[#6b6567]">Thank you for choosing <b>Evenddy</b>. We've received your request and our team will review your requirements.</p>
      <p className="mb-2.5 text-xs leading-relaxed text-[#6b6567]">Our team will get in touch with you shortly to discuss your requirements and provide the quote.</p>
      <button className={cx(BTN_BLOCK, "mt-2")} onClick={onClose}>Continue Browsing →</button>
    </Modal>
  );
}

// Defined outside the form so inputs keep focus while typing.
const Field = ({ id, label, error, children }) => (
  <div className="mb-4">
    <label htmlFor={`dc-${id}`} className="mb-1.5 block text-xs font-semibold text-[#1a1516]">{label}</label>
    {children}
    {error && <small className="block pt-[3px] text-[11px] text-[#c0262d]" role="alert">{error}</small>}
  </div>
);

function EnquiryForm({ variant = "theme", subject = "", onSuccess }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", date: "", occasion: "", budget: BUDGETS[1], city: "" });
  const [err, setErr] = useState({});
  const [sending, setSending] = useState(false);
  const [mailError, setMailError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const row = "grid grid-cols-1 gap-x-4";

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const v = {};
    if (!f.name.trim()) v.name = "Enter your name";
    if (!/^\d{10}$/.test(f.phone)) v.phone = "Enter a 10-digit number";
    if (!f.date) v.date = "Pick a date";
    if (variant === "custom" && !f.occasion) v.occasion = "Select an occasion";
    setErr(v);
    if (Object.keys(v).length) return;

    // E-mail the enquiry to the business (no WhatsApp redirect), then show the success popup
    setSending(true);
    setMailError("");
    try {
      await sendMail({
        subject: `Decor enquiry${subject ? ` – ${subject}` : ""}`,
        replyTo: f.email || undefined,
        lines: [
          `Decor enquiry${subject ? ` – ${subject}` : ""}`,
          `Type: ${variant === "custom" ? "Customized decor" : "Kit / theme"}`,
          `Name: ${f.name}`,
          `Phone: +91 ${f.phone}`,
          f.email && `Email: ${f.email}`,
          `Event date: ${f.date}`,
          variant === "custom" && `Occasion: ${f.occasion}`,
          variant === "custom" && `Budget: ${f.budget}`,
          f.city && `Venue / City: ${f.city}`,
        ],
      });
      onSuccess?.(f);
    } catch {
      setMailError("Sorry, we couldn't send your enquiry. Please try again or chat with us on WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      {/* compact notice (icon + two lines) */}
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#f3d6b8] bg-[#fff1e3] px-4 py-3 text-xs leading-relaxed">
        <span className="text-[#9a4a1e]"><Icon name="lock" size={16} /></span>
        <div>
          <b className="block font-semibold text-[#9a4a1e]">Zero Login Friction</b>
          <span className="text-[#6b6567]">Enquire immediately as guest. We respect privacy.</span>
        </div>
      </div>

      <div className={row}>
        <Field id="name" label="Full Name *" error={err.name}>
          <input id="dc-name" className={FIELD} value={f.name} onChange={set("name")} placeholder="e.g. Radhika Roy" autoComplete="name" />
        </Field>
        <Field id="phone" label="Phone / WhatsApp *" error={err.phone}>
          <div className="flex items-center gap-2 rounded-lg border border-[#f1ddd2] bg-[#fbeee8] pl-3 text-[11.5px] focus-within:border-[#750a3d]">
            <span>+91</span>
            <input id="dc-phone" className="w-full bg-transparent py-3 pr-3 text-[13px] placeholder:text-[#8f8487] focus:outline-none" value={f.phone} onChange={set("phone")} placeholder="Enter phone number" inputMode="numeric" maxLength={10} autoComplete="tel-national" />
          </div>
        </Field>
      </div>

      <div className={row}>
        <Field id="email" label="Email ">
          <input id="dc-email" className={FIELD} type="email" value={f.email} onChange={set("email")} placeholder="name@domain.com" autoComplete="email" />
        </Field>
        <Field id="date" label="Event Date *" error={err.date}>
          <input id="dc-date" className={FIELD} type="date" value={f.date} onChange={set("date")} />
        </Field>
      </div>

      {variant === "custom" && (
        <Field id="occasion" label="Select Occasion Type" error={err.occasion}>
          <SelectBox id="dc-occasion" className={FIELD} value={f.occasion} onChange={set("occasion")}>
            <option value="">Select occasion/event</option>
            {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
          </SelectBox>
        </Field>
      )}

      <div className={variant === "custom" ? row : ""}>
        {variant === "custom" && (
          <Field id="budget" label="Estimated Decor Budget">
            <SelectBox id="dc-budget" className={FIELD} value={f.budget} onChange={set("budget")}>
              {BUDGETS.map((b) => <option key={b}>{b}</option>)}
            </SelectBox>
          </Field>
        )}
        <Field id="city" label="Venue / City">
          <input id="dc-city" className={FIELD} value={f.city} onChange={set("city")} placeholder="e.g. Vizag" autoComplete="address-level2" />
        </Field>
      </div>

      <button type="submit" className={cx(BTN_BLOCK, "disabled:opacity-60")} disabled={sending}>{sending ? "Sending…" : "Send Enquiry"} <Icon name="send" size={16} /></button>
      {mailError && <p role="alert" className="mb-0 mt-2.5! text-center text-[11px] text-[#c0262d]">{mailError}</p>}
      <a className={WA_BTN} target="_blank" rel="noreferrer"
         href={waLink(`Hi Evenddy, I'd like a decor quote${subject ? ` for: ${subject}` : ""}.${f.name ? ` Name: ${f.name}.` : ""}`)}>
        <span className="text-[#25d366]"><Icon name="wa" size={20} /></span>Chat Directly on WhatsApp
      </a>

      <ul className="mt-[18px] grid gap-2.5 border-t border-[#eadfd8] pt-4 text-[10.5px] text-[#6b6567]">
        {[["shieldcheck", "Zero Commission • Direct Studio Relationship"], ["clock", "Guaranteed Response within 15 mins during 9am–10pm"], ["shield", "No Spam Guarantee • Your details are never sold to vendors"]].map(([ic, t]) => (
          <li key={t} className="flex items-center gap-2"><span className="text-[#7a3b18]"><Icon name={ic} size={13} /></span>{t}</li>
        ))}
      </ul>
    </form>
  );
}

/* ======================================================
   PAGE: DECOR LANDING
====================================================== */
function DecorLanding({ types, go }) {
  return (
    <section className="pb-2 pt-3.5 text-center">
      <h1 className="mb-3.5 text-[clamp(32px,5vw,40px)] font-bold! leading-[1.15] tracking-[-.02em]! text-[#750a3d]">Our Decor Service</h1>
      <p className="mx-auto mb-11 max-w-[440px] text-[14.5px] font-medium leading-[1.65] text-[#555]">Everything you need to create the perfect celebration, meticulously organized and beautifully presented.</p>
      <div className="grid w-full grid-cols-1 gap-6 text-left min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
        {types.map((t) => (
          <article key={t.page} className="group flex flex-col overflow-hidden rounded-3xl border border-[#f0e4dc] bg-white shadow-[0_8px_28px_rgba(60,20,30,.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(60,20,30,.13)]">
            {t.collage ? (
              <div className="grid h-[220px] grid-cols-[1.45fr_1fr] grid-rows-2 gap-1 bg-white" role="img" aria-label={t.title}>
                {[0, 1, 2].map((i) => <div key={i} className={cx("overflow-hidden", i === 0 && "row-span-2")}><Pic src={t.collage[i]} /></div>)}
              </div>
            ) : (
              <div className="h-[220px] overflow-hidden"><Pic src={t.image} alt={t.title} /></div>
            )}
            <div className="flex flex-1 flex-col px-6 pb-6 pt-6">
              <h2 className="mb-3 text-lg font-bold! tracking-[-.01em]! text-[#1a1516]">{t.title}</h2>
              <p className="mb-5 flex-1 border-b border-[#eee7e2] pb-5 text-[13px] leading-[1.7] text-[#6b6567]">{t.text}</p>
              <button className="group self-start text-[13px] font-semibold text-[#750a3d]" onClick={() => go(t.page)}>
                {t.cta} <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true">→</span>
              </button>
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
      <p className="mb-2 text-[9.5px] font-bold uppercase tracking-[.12em] text-[#1a1516]">{isKits ? "Buy & keep forever • No returns needed" : "Professional setup by our event artists"}</p>
      <h1 className="mb-3 text-[clamp(28px,4.4vw,36px)] font-normal! leading-[1.15] tracking-[-.02em]! text-[#1a1516]">
        {isKits ? <><span className="text-[#750a3d]">Curated DIY Event Kits</span> for Sale.</> : <><span className="text-[#750a3d]">Curated Decoration Themes</span> by Evenddy.</>}
      </h1>
      <p className="mb-6 max-w-[620px] text-[12.5px] leading-[1.7] text-[#4b4547]">
        {isKits
          ? "All-in-one celebration boxes delivered straight to your doorstep. Complete with everything you need to style your event like an editorial designer — 100% yours to keep, repurpose, or gift."
          : "Pick a theme, personalise the details and let our event artists handle the setup, styling and takedown."}
      </p>

      <div className="mb-[26px] rounded-2xl bg-[#fbeee8] p-4">
        <div className={cx("flex flex-col gap-3.5 min-[600px]:flex-row min-[600px]:items-center", isKits && "mb-3")}>
          <label className="flex flex-1 items-center gap-2 rounded-[10px] bg-white px-3 text-[#4b4547]">
            <Icon name="search" size={14} />
            <input className="flex-1 bg-transparent py-[11px] text-xs focus:outline-none" value={q} onChange={(e) => setQ(e.target.value)} placeholder={isKits ? "Search components, props or themes..." : "Search themes..."} aria-label="Search" />
          </label>
          {isKits && (
            <label className="flex items-center gap-2 text-[11px] text-[#6b6567]">Sort by:
              <SelectBox className="rounded-full bg-white py-[9px] pl-3.5 text-[11px] font-semibold text-[#1a1516] focus:outline-none" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="popularity">popularity</option>
                <option value="low">price: low to high</option>
                <option value="high">price: high to low</option>
              </SelectBox>
            </label>
          )}
        </div>
        {isKits && (
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Kit categories">
            {KIT_CATEGORIES.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className={cx("rounded-full px-[15px] py-[7px] text-[11px]", cat === c ? "bg-[#750a3d] font-semibold text-white" : "bg-white font-medium text-[#1a1516] shadow-[inset_0_0_0_1px_#ecdcd3]")}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-[#6b6567]">Nothing matches your search. Try a different word or category.</p>
      ) : (
        <div className="grid grid-cols-1 gap-[22px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
          {items.map((x) => (
            <button
              key={x.id}
              onClick={() => go(isKits ? "kit" : "theme", x.id)}
              className="flex w-full flex-col items-stretch justify-start overflow-hidden rounded-[14px] bg-white p-0 text-left shadow-[0_4px_16px_rgba(60,20,30,.06)] transition hover:-translate-y-[3px] hover:shadow-[0_10px_26px_rgba(60,20,30,.12)] motion-reduce:transition-none"
            >
              <div className="relative aspect-[4/3] shrink-0 overflow-hidden">
                <Pic src={x.images[0]} alt={x.title} />
                <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-[5px] text-[9.5px] font-bold text-[#750a3d]">{isKits ? `Own for ${inr(x.price)}` : `From ${inr(x.startsAt)}`}</span>
              </div>
              <div className="px-[18px] pb-5 pt-4">
                <small className="mb-2 block text-[8.5px] font-bold uppercase tracking-[.1em] text-[#7a3b18]">{x.tag}</small>
                <h3 className="mb-2 text-[15px] font-medium leading-[1.3] text-[#750a3d]">{x.title}</h3>
                <p className="mb-0 line-clamp-2 text-[11px] leading-[1.6] text-[#5b5557]">{x.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

/* ======================================================
   Gallery with thumbnails (kit detail + request form)
====================================================== */
function Gallery({ title, images, active, setActive, children }) {
  return (
    <div className="min-w-0">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] shadow-[0_4px_18px_rgba(60,20,30,.1)]">
        <Pic src={images[active]} alt={`${title} view ${active + 1}`} />
        {children}
      </div>
      <div className="mt-2.5 grid grid-cols-5 gap-2">
        {images.map((src, i) => (
          <button key={i} className="relative aspect-square overflow-hidden rounded-lg p-0" onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`}>
            <Pic src={src} />
            {i === active && <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-inset ring-[#750a3d]" />}
          </button>
        ))}
      </div>
    </div>
  );
}

const RATING = (
  <p className="mb-4 flex items-center gap-2 text-xs">
    <span className="tracking-[1px] text-[#8a5a1f]" aria-hidden="true">★★★★★</span> <b className="font-semibold">4.9</b> <small className="text-[11px] text-[#6b6567]">(142 verified host reviews)</small>
  </p>
);
const DETAIL = "grid items-start gap-7 min-[900px]:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]";
const BUY = cx("min-w-0 rounded-2xl bg-white p-6 min-[600px]:p-7", CARD_SHADOW);
const H1_BUY = "mb-2.5 mt-0 text-[26px] font-medium! leading-[1.2] tracking-[-.01em]! text-[#750a3d]";

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
    <div className={DETAIL}>
      <div className="min-w-0">
        <Gallery title={kit.title} images={imgs} active={active} setActive={setActive}>
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-[5px] rounded-full bg-[#750a3d] px-[11px] py-1.5 text-[10px] font-semibold text-white"><Icon name="bag" size={11} />Best Seller</span>
            <span className="inline-flex items-center gap-[5px] rounded-full bg-white px-[11px] py-1.5 text-[10px] font-semibold text-[#1a1516]"><Icon name="lock" size={11} />100% Yours to Keep</span>
          </div>
        </Gallery>
        <div className="mt-3.5 flex items-center gap-3 rounded-xl bg-[#fbeee8] p-3.5 text-xs">
          <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#fcd9b8] text-[#8a4a12]"><Icon name="truck" size={16} /></span>
          <div><b className="block text-[12.5px] font-semibold">Delivered in 2-3 business days in heavy-duty reusable tote</b><small className="mt-0.5 block text-[11px] text-[#6b6567]">Carefully sealed, moisture-proofed, and ready for immediate ceremony assembly.</small></div>
        </div>
      </div>

      <aside className={BUY}>
        <small className={cx(EYEBROW_SM, "mb-2")}>Festive celebration atelier</small>
        <h1 className={H1_BUY}>{kit.title}</h1>
        {RATING}

        <div className="mb-3.5 rounded-[14px] bg-[#fbeee8] p-[18px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <strong className="text-4xl font-bold leading-none text-[#750a3d]">{inr(kit.price)}</strong>
            <s className="text-sm text-[#6b6567]">{inr(kit.mrp)}</s>
            <span className="rounded-full bg-[#7a5a2c] px-2.5 py-1 text-[11px] font-bold text-white">{off}% OFF</span>
          </div>
          <p className="mb-1.5 flex items-start gap-1.5 pt-2.5 text-xs font-medium leading-snug text-[#750a3d]"><span className="mt-px"><Icon name="checkc" size={14} /></span><span>Complete Box to Own Forever • No returns, zero rental deposit</span></p>
          <small className="block text-[10.5px] text-[#6b6567]">All taxes included. Free insured door delivery across India.</small>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-2.5 min-[600px]:grid-cols-2">
          {[["archive", "Shipping weight", kit.weight], ["image", "Footprint", kit.footprint]].map(([ic, l, v]) => (
            <div key={l} className="rounded-[10px] bg-[#f4e9e5] px-3.5 py-3">
              <small className="mb-1.5 flex items-center gap-1.5 text-[9px] uppercase tracking-[.04em] text-[#7a3b18]"><Icon name={ic} size={13} />{l}</small>
              <b className="text-xs font-semibold">{v}</b>
            </div>
          ))}
        </div>

        <button className={BTN_BLOCK} onClick={() => go("request", kit.id)}>Request kit</button>
        <a className={WA_BTN} target="_blank" rel="noreferrer" href={waLink(`Hi Evenddy, I'd like to order: ${kit.title} (${inr(kit.price)}).`)}><span className="text-[#25d366]"><Icon name="wa" size={20} /></span>Book on WhatsApp</a>

        <div className="mt-4 rounded-xl bg-[#f4e9e5] p-3.5 text-xs">
          <b className="font-semibold">Check Delivery &amp; Setup Window</b>
          <div className="my-2.5 flex gap-2">
            <input className="min-w-0 flex-1 rounded-lg bg-white px-3 py-[11px] text-xs placeholder:text-[#8f8487] focus:outline-none" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} maxLength={6} inputMode="numeric" placeholder="Enter pincode" aria-label="Pincode" />
            <button className="rounded-lg bg-[#f0dcd7] px-[18px] text-xs font-semibold text-[#750a3d]" onClick={verify}>Verify</button>
          </div>
          {pinMsg && (
            <small className={cx("text-[11px]", pinMsg.ok ? "flex items-center gap-1.5 text-[#8a5a1f]" : "block text-[#c0262d]")} role="status">
              {pinMsg.ok && <Icon name="checkc" size={13} />}{pinMsg.text}
            </small>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-[11.5px] min-[600px]:grid-cols-2">
          {[["infinity", "100% Buy-to-Own", "Zero rental return coordination"], ["shield", "Free Insured Transit", "Replacements covered for transit wear"]].map(([ic, t, s]) => (
            <div key={t} className="flex items-start gap-2 text-[#750a3d]">
              <Icon name={ic} size={16} />
              <div><b className="block text-[11.5px] font-semibold text-[#1a1516]">{t}</b><small className="mt-[3px] block text-[10px] leading-normal text-[#6b6567]">{s}</small></div>
            </div>
          ))}
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
    <div className={DETAIL}>
      <Gallery title={item.title} images={imgs} active={active} setActive={setActive} />
      <aside className={BUY}>
        <small className={cx(EYEBROW_SM, "mb-2")}>{tag}</small>
        <h1 className={H1_BUY}>{item.title}</h1>
        {RATING}
        <EnquiryForm variant="theme" subject={item.title} onSuccess={() => setDone(true)} />
      </aside>
      {done && <SuccessModal onClose={() => setDone(false)} />}
    </div>
  );
}

/* ======================================================
   PAGE: CUSTOMIZED DECOR
====================================================== */
const PANEL = cx("mb-[18px] rounded-2xl bg-white p-[22px]", CARD_SHADOW);

function CustomDecor() {
  const [tab, setTab] = useState("portfolio");
  const [done, setDone] = useState(false);
  const refs = { portfolio: useRef(null), about: useRef(null), reviews: useRef(null) };
  const jump = (k) => { setTab(k); refs[k].current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const share = async () => {
    try { await navigator.share?.({ title: CUSTOM.title, url: window.location.href }); } catch { /* cancelled */ }
  };
  const review = () => window.open(waLink(`Hi Evenddy, I'd like to share a review for ${CUSTOM.title}.`), "_blank", "noreferrer");

  const metaRow = "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6b6567]";
  const metaItem = "inline-flex items-center gap-[5px]";
  const sep = <i className="h-3 w-px bg-[#eadfd8]" />;

  const TABS = [
    ["portfolio", "Portfolio (140)"],
    ["about", "About"],
    ["reviews", `Reviews (${REVIEW_SUMMARY.total})`],
  ];

  return (
    <div className="grid items-start gap-6 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
      <div className="min-w-0">
        {/* hero + title card (tabs now live in their own strip below, with a gap between) */}
        <div className={cx("mb-3 overflow-hidden rounded-2xl bg-white", CARD_SHADOW)}>
          <div className="h-[300px] overflow-hidden"><Pic src={CUSTOM.hero} alt="Grand floral mandap stage" /></div>

          {/* title row: details on the left, share + review buttons on the right */}
          <div className="flex flex-col gap-3 px-[22px] pb-[22px] pt-5 min-[600px]:flex-row min-[600px]:items-start min-[600px]:justify-between">
            <div className="min-w-0">
              <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h1 className="mb-0 text-2xl font-medium! tracking-[-.01em]! text-[#5b0a2e]">{CUSTOM.title}</h1>
                <span className="rounded-full bg-[#f0e6e3] px-2.5 py-1 text-[10px] font-medium text-[#4b4547]">In-House Production</span>
              </div>
              <p className={cx(metaRow, "mb-1.5")}>
                <span className={metaItem}><b className="font-semibold text-[#1a1516]">★ {REVIEW_SUMMARY.rating}</b> ({REVIEW_SUMMARY.total} Verified Reviews)</span>{sep}
                <span className={metaItem}><span className="text-[#7a3b18]"><Icon name="pin" size={13} /></span>Vizag, Andhra Pradesh, India</span>
              </p>
              <p className={cx(metaRow, "mb-0")}>
                <span className={metaItem}><span className="text-[#7a3b18]"><Icon name="award" size={13} /></span>120+ Grand Celebrations Styled</span>{sep}
                <span className={metaItem}><span className="text-[#7a3b18]"><Icon name="bolt" size={13} /></span><b className="font-semibold text-[#1a1516]">Avg. Response: 12 Mins</b></span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button className="grid size-10 place-items-center rounded-full bg-[#fbeee8] text-[#5b0a2e] transition-colors hover:bg-[#f6e0d6]" onClick={share} aria-label="Share"><Icon name="share" size={16} /></button>
              <button className="inline-flex h-10 items-center gap-2 rounded-full bg-[#fbeee8] px-4 text-left text-xs font-medium leading-[1.15] text-[#5b0a2e] transition-colors hover:bg-[#f6e0d6]" onClick={review}>
                <Icon name="edit" size={15} /><span>Write<br />Review</span>
              </button>
            </div>
          </div>
        </div>

        {/* tab strip: separate bar, evenly spaced tabs, dark underline on the active one */}
        <div className="mb-[22px] flex flex-wrap gap-x-[38px] gap-y-0 rounded-[4px] bg-[#fdf5f2] px-[38px]" role="tablist" aria-label="Sections">
          {TABS.map(([k, l]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => jump(k)}
              className={cx(
                "whitespace-nowrap py-3.5 text-[13px] transition-colors",
                tab === k ? "font-semibold text-[#4a0a24] shadow-[inset_0_-2px_0_#4a0a24]" : "font-medium text-[#5b4a4f] hover:text-[#4a0a24]"
              )}
            >
              {l}
            </button>
          ))}
        </div>

        <section className={PANEL} ref={refs.portfolio}>
          <small className={EYEBROW_SM}>Real celebrations</small>
          <h2 className={H2}>Portfolio Gallery (140)</h2>
          <div className="grid grid-cols-1 gap-2.5 min-[600px]:grid-cols-2">
            {CUSTOM.gallery.map((s, i) => <div key={i} className="h-[170px] overflow-hidden rounded-[10px]"><Pic src={s} alt="Past celebration" /></div>)}
          </div>
          <button className="mx-auto mt-4 flex w-max max-w-full items-center gap-2 rounded-full bg-[#f6e9e4] px-6 py-3 text-[13px] font-semibold text-[#5b0a2e] transition-colors hover:bg-[#f1ddd6]">
            Explore Entire Gallery (140 Projects) <span aria-hidden="true">→</span>
          </button>
        </section>

        <section className={PANEL} ref={refs.about}>
          <small className={EYEBROW_SM}>About</small>
          <h2 className={H2}>Evenddy Custom decor</h2>
          {CUSTOM.about.map((p) => <p key={p} className="mb-3.5 text-[13px] leading-[1.75] text-[#6b6567]">{rich(p)}</p>)}
          <small className={EYEBROW_SM}>Events handled &amp; specialisations</small>
          <div className="mb-[18px] mt-2.5 flex flex-wrap gap-2">
            {CUSTOM.specialisations.map((s) => <span key={s} className="rounded-full bg-[#fbeee8] px-3 py-1.5 text-[11px]">{s}</span>)}
          </div>
          <div className="grid grid-cols-1 gap-3 min-[600px]:grid-cols-2">
            {CUSTOM.stats.map((s) => (
              <div key={s.l} className="rounded-xl bg-[#fbeee8] p-4">
                <strong className="block text-[26px] text-[#750a3d]">{s.n}</strong>
                <b className="text-xs font-semibold">{s.l}</b>
                {s.s && <small className="block text-[11px] text-[#6b6567]">{s.s}</small>}
              </div>
            ))}
          </div>
        </section>

        {/* reviews: rating summary + breakdown, then individual reviews */}
        <section className={PANEL} ref={refs.reviews}>
          <small className={EYEBROW_SM}>Host feedback</small>
          <h2 className={H2}>Reviews ({REVIEW_SUMMARY.total})</h2>

          <div className="mb-[18px] grid grid-cols-1 items-center gap-5 rounded-xl bg-[#fbeee8] p-4 min-[600px]:grid-cols-[150px_1fr]">
            <div className="text-center">
              <strong className="block text-[38px] font-bold leading-none text-[#750a3d]">{REVIEW_SUMMARY.rating}</strong>
              <div className="mt-1.5"><Stars value={5} size={14} /></div>
              <small className="mt-1 block text-[11px] text-[#6b6567]">{REVIEW_SUMMARY.total} verified reviews</small>
            </div>
            <ul className="grid gap-1.5">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = REVIEW_SUMMARY.dist[n] || 0;
                const pct = Math.round((c / REVIEW_SUMMARY.total) * 100);
                return (
                  <li key={n} className="flex items-center gap-2.5 text-[11px] text-[#6b6567]">
                    <span className="w-6 shrink-0 font-medium text-[#1a1516]">{n} ★</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                      <span className="block h-full rounded-full bg-[#750a3d]" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-8 shrink-0 text-right">{c}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <ul className="grid gap-3">
            {REVIEWS.map((r) => (
              <li key={r.id} className="rounded-xl bg-[#fdf8f5] p-4 shadow-[inset_0_0_0_1px_#f1e4dc]">
                <div className="mb-2 flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f6e0d6] text-[13px] font-semibold text-[#750a3d]" aria-hidden="true">{r.name[0]}</span>
                  <div className="min-w-0 flex-1">
                    <b className="block text-[12.5px] font-semibold text-[#1a1516]">{r.name}</b>
                    <small className="block text-[10.5px] text-[#6b6567]">{r.event}</small>
                  </div>
                  <div className="text-right">
                    <Stars value={r.rating} size={12} />
                    <small className="block text-[10px] text-[#6b6567]">{r.date}</small>
                  </div>
                </div>
                <p className="mb-0 text-[12.5px] leading-[1.7] text-[#4b4547]">{r.text}</p>
              </li>
            ))}
          </ul>

          <button className="mx-auto mt-4 flex w-max max-w-full items-center gap-2 rounded-full bg-[#f6e9e4] px-6 py-3 text-[13px] font-semibold text-[#5b0a2e] transition-colors hover:bg-[#f1ddd6]" onClick={review}>
            <Icon name="edit" size={15} />Write a Review
          </button>
        </section>
      </div>

      {/* quote card: price + base-package line, no "Direct Atelier Rates" */}
      <aside className={cx("min-w-0 rounded-2xl bg-white p-5 min-[900px]:sticky min-[900px]:top-4", CARD_SHADOW)}>
        <div className="mb-3.5 border-b border-[#eadfd8] pb-3.5">
          <strong className="block text-[26px] font-bold leading-tight text-[#750a3d]">₹{CUSTOM.price.toLocaleString("en-IN")}</strong>
          <div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-[#6b6567]">
            <small>Starting Base Package</small>
            <small>0% Portal Fee</small>
          </div>
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

  return (
    <div className="min-h-[70vh] bg-[#f9f5f0] pb-16 text-[#1a1516]">
      <div className={WRAP}>
        <nav className="flex flex-wrap items-center py-5 pb-[14px] text-xs text-[#6f6366]" aria-label="Breadcrumb">
          <button type="button" className="p-0 text-xs text-inherit hover:text-[#750a3d]" onClick={() => navigate("/")}>Home</button>
          <span className="mx-1.5 text-[#a79a9e]">›</span>
          <button type="button" className="p-0 text-xs text-inherit hover:text-[#750a3d]" onClick={() => navigate("/services")}>Services</button>
          <span className="mx-1.5 text-[#a79a9e]">›</span>
          <button type="button" className="p-0 text-xs font-semibold text-[#750a3d] hover:text-[#750a3d]" aria-current="page" onClick={() => go("landing")}>Decor</button>
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
