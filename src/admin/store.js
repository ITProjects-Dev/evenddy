/* Central admin store — swap localStorage calls for your API later. */

const KEY = "evenddy_admin_v2";
const AUTH_KEY = "evenddy_admin_auth_v1";
const ENQ_KEY = "evenddy_enquiries_v1";

/* =================== DEFAULT DATA =================== */
export const DEFAULT_DATA = {
  global: {
    whatsapp: "919999999999",
    phone: "+91 9XXXX XXXXX",
  },

  /* =================== CATERING =================== */
  catering: {
    landing: [
      {
        id: "mealbox", title: "Meal Box", eyebrow: "Individual & Packed Meals",
        icon: "box", tone: "gold", image: "", price: "",
        paras: [
          "Perfect for individual meals, small celebrations, office meals, birthdays, gatherings and functions.",
          "Choose from structured meal boxes with 3, 5 or 6 items and customize eligible items with same-price swaps.",
        ],
        chips: [
          { icon: "leaf", text: "Veg & Non-Veg" },
          { icon: "grid", text: "3/5/6 Item Options" },
          { icon: "swap", text: "Same-Price Item Swaps" },
        ],
        cta: "Explore Meal Box",
      },
      {
        id: "delivery", title: "Delivery Box", eyebrow: "Party Food Delivered To You",
        icon: "truck", tone: "maroon", image: "", price: "",
        paras: [
          "Perfect for house parties, get-togethers, farm-house parties and casual events, generally for 10+ people.",
          "Choose party food, select quantities based on people or servings, and get it delivered to your event location.",
        ],
        chips: [
          { icon: "people", text: "Generally for 10+ People" },
          { icon: "delivery", text: "Delivery Included" },
          { icon: "dish", text: "Optional Serving" },
        ],
        cta: "Explore Delivery Box",
      },
      {
        id: "full", title: "Full Catering", eyebrow: "Complete Event Catering",
        icon: "fork", tone: "orange", image: "", price: "Starting from ₹200 /plate",
        paras: [
          "Best for weddings, celebrations, corporate events and other occasions requiring complete food service.",
          "Build your menu, customize food selections, request items that are not listed and add live counters.",
        ],
        chips: [
          { icon: "menu", text: "Custom Menu" },
          { icon: "chef", text: "Live Counters" },
        ],
        cta: "Explore Full Catering",
      },
    ],

    mealBox: {
      minGuests: 10,
      guestStep: 5,
      presets: [10, 25, 50, 100, 250],
      boxSizes: [
        { items: 3, price: 150, note: "onwards" },
        { items: 5, price: 240, note: "onwards" },
        { items: 8, price: 380, note: "onwards" },
      ],
      slots: [
        { icon: "bowl", options: [{ n: "Dal Makhani", v: true }, { n: "Paneer Butter Masala", v: true }, { n: "Chicken Curry", v: false }] },
        { icon: "rice", options: [{ n: "Steamed Basmati Rice", v: true }, { n: "Jeera Rice", v: true }, { n: "Veg Pulao", v: true }] },
        { icon: "cup",  options: [{ n: "Fresh Curd with Boondi", v: true }, { n: "Gulab Jamun", v: true }, { n: "Fruit Custard", v: true }] },
        { icon: "bowl", options: [{ n: "Butter Naan", v: true }, { n: "Tandoori Roti", v: true }, { n: "Plain Paratha", v: true }] },
        { icon: "bowl", options: [{ n: "Paneer Tikka", v: true }, { n: "Veg Cutlet", v: true }, { n: "Chicken 65", v: false }] },
        { icon: "cup",  options: [{ n: "Green Salad", v: true }, { n: "Kachumber", v: true }, { n: "Sprouts Chaat", v: true }] },
        { icon: "cup",  options: [{ n: "Masala Buttermilk", v: true }, { n: "Sweet Lassi", v: true }, { n: "Lemon Soda", v: true }] },
        { icon: "bowl", options: [{ n: "Papad & Pickle", v: true }, { n: "Boondi Raita", v: true }, { n: "Onion Raita", v: true }] },
      ],
    },

    menuCategories: ["Breakfast", "Tea/Snacks", "Starters"],
    menuItems: [
      { id: 1,  name: "Masala Dosa",            cat: "Breakfast",  veg: true },
      { id: 2,  name: "Idli Sambar",            cat: "Breakfast",  veg: true },
      { id: 3,  name: "Egg Puffs",              cat: "Breakfast",  veg: false },
      { id: 4,  name: "Poha",                   cat: "Breakfast",  veg: true },
      { id: 5,  name: "Masala Chai & Biscuits", cat: "Tea/Snacks", veg: true },
      { id: 6,  name: "Samosa",                 cat: "Tea/Snacks", veg: true },
      { id: 7,  name: "Chicken Roll",           cat: "Tea/Snacks", veg: false },
      { id: 8,  name: "Veg Cutlet",             cat: "Tea/Snacks", veg: true },
      { id: 9,  name: "Paneer Tikka",           cat: "Starters",   veg: true },
      { id: 10, name: "Chicken 65",             cat: "Starters",   veg: false },
      { id: 11, name: "Gobi Manchurian",        cat: "Starters",   veg: true },
      { id: 12, name: "Fish Fingers",           cat: "Starters",   veg: false },
      { id: 13, name: "Upma",                   cat: "Breakfast",  veg: true },
      { id: 14, name: "Ven Pongal",             cat: "Breakfast",  veg: true },
      { id: 15, name: "Medu Vada",              cat: "Breakfast",  veg: true },
      { id: 16, name: "Mirchi Bajji",           cat: "Tea/Snacks", veg: true },
      { id: 17, name: "Onion Pakoda",           cat: "Tea/Snacks", veg: true },
      { id: 18, name: "Hara Bhara Kebab",       cat: "Starters",   veg: true },
      { id: 19, name: "Veg Spring Roll",        cat: "Starters",   veg: true },
      { id: 20, name: "Chilli Chicken",         cat: "Starters",   veg: false },
      { id: 21, name: "Pesarattu",              cat: "Breakfast",  veg: true },
      { id: 22, name: "Corn Cutlet",            cat: "Tea/Snacks", veg: true },
      { id: 23, name: "Crispy Corn",            cat: "Starters",   veg: true },
    ],

    full: {
      gallery: ["", "", "", ""],
      cuisines: ["North Indian", "South Indian", "Continental", "Chinese", "Mexican", "Lebanese"],
      platePrices: ["₹500 – ₹800", "₹800 – ₹1,200", "₹1,200 – ₹2,000", "₹2,000+"],
      foodTypes: ["Veg", "Non-Veg", "Veg + Non-Veg"],
      serviceTags: ["Multi-cuisine", "South Indian", "Continental", "Chinese", "Mexican", "Lebanese", "Live Counters", "Chaat Counter", "BBQ & Grill Station", "Dessert Bar"],
      menu: {
        Sweets: [{ n: "Gulab Jamun", veg: true }, { n: "Rasmalai", veg: true }, { n: "Double Ka Meetha", veg: true }, { n: "Ice Cream Bar", veg: true }],
        Starters: [{ n: "Paneer Tikka", veg: true }, { n: "Gobi Manchurian", veg: true }, { n: "Chicken 65", veg: false }, { n: "Fish Fingers", veg: false }],
        "Flavored Rice": [{ n: "Jeera Rice", veg: true }, { n: "Veg Pulao", veg: true }, { n: "Chicken Biryani", veg: false }, { n: "Veg Biryani", veg: true }],
        Curries: [{ n: "Dal Tadka", veg: true }, { n: "Paneer Butter Masala", veg: true }, { n: "Chicken Curry", veg: false }, { n: "Mutton Curry", veg: false }],
        "Rotis / Chaats": [{ n: "Butter Naan", veg: true }, { n: "Tandoori Roti", veg: true }, { n: "Pani Puri", veg: true }, { n: "Dahi Puri", veg: true }],
        Other: [{ n: "Salad Bar", veg: true }, { n: "Soup Station", veg: true }, { n: "Welcome Drinks", veg: true }],
      },
      reviews: [
        { who: "Ravi K.",  text: "Food was fresh and the serving staff were very professional. Guests loved the live counters." },
        { who: "Sneha P.", text: "Handled 400 guests at our wedding without a single hiccup. Great value for the price." },
        { who: "Arjun M.", text: "Custom menu was exactly what we wanted. Timely setup and clean-up." },
      ],
    },
  },

  /* =================== DECOR =================== */
  decor: {
    landing: [
      { id: "kits",    title: "DIY Decoration",        cta: "Explore DIY",       image: "", collage: ["", "", ""],
        text: "Ready-to-use decoration kits with everything you need to create a beautiful setup yourself. Perfect for birthdays, intimate gatherings, and budget celebrations." },
      { id: "themes",  title: "Theme Decoration",      cta: "Explore Themes",    image: "", collage: ["", "", ""],
        text: "Choose from our curated decoration themes and personalize selected details to match your celebration. Hassle-free professional setup by our event artists." },
      { id: "custom",  title: "Customized Decoration", cta: "Create Your Setup", image: "", collage: ["", "", ""],
        text: "Bring your ideas, story, and inspiration to us. Our bespoke design team will craft a one-of-a-kind grand concept tailored to your celebration." },
    ],

    kitCategories: ["All Kits", "Haldi & Mehendi", "Birthdays & Milestones", "Baby Shower & Welcome", "Anniversary & Dates", "Festive & Pooja"],

    kits: [
      { id: "marigold-haldi", cat: "Haldi & Mehendi", tag: "Traditional & Joyful",
        price: 4999, mrp: 7500, popularity: 98, weight: "8.2 kg Total Box", footprint: "Fits 8x8 to 10x10 ft",
        title: "Sun-Kissed Marigold & Brass Haldi Kit",
        desc: "Brass-finish backdrop collapsible frame, 20m artisan marigold garlands, organza ceiling drapes, rangoli stencils and a brass urli centerpiece.",
        images: ["", "", "", "", ""] },
      { id: "boho-pampas", cat: "Birthdays & Milestones", tag: "Modern Editorial",
        price: 3499, mrp: 5200, popularity: 95, weight: "7.5 kg Total Box", footprint: "Fits 6x8 ft",
        title: "Boho Chic Pampas & Macrame Birthday Box",
        desc: "Interlocking wooden arch kit, fluffy dried pampas bundles, warm micro-LED string lights, macrame hangings and balloon garland set.",
        images: ["", "", "", "", ""] },
      { id: "pastel-teddy", cat: "Baby Shower & Welcome", tag: "Dreamy & Whimsical",
        price: 5799, mrp: 8600, popularity: 92, weight: "9 kg Total Box", footprint: "Fits 8x8 ft",
        title: "Pastel Cloud & Teddy Baby Shower Setup",
        desc: "Dual nesting lightweight frame, double-stuffed pastel cloud balloons, four transparent teddy blocks and a welcome signboard.",
        images: ["", "", "", "", ""] },
      { id: "starlit-cabana", cat: "Anniversary & Dates", tag: "Intimate & Cozy",
        price: 2999, mrp: 4500, popularity: 90, weight: "6 kg Total Box", footprint: "Fits 6x6 ft",
        title: "Starlit Cabana Romantic Date Night Kit",
        desc: "Pop-up natural pine teepee frames, sheer cascading ivory curtains, 500 velvety silk rose petals and warm fairy lights.",
        images: ["", "", "", "", ""] },
      { id: "lotus-urli", cat: "Festive & Pooja", tag: "Heritage & Devotion",
        price: 3899, mrp: 5800, popularity: 88, weight: "10 kg Total Box", footprint: "Fits 4x6 ft",
        title: "Traditional Lotus Urli Pooja & Housewarming",
        desc: "14-inch heavy spun polished brass urli bowl, 12 floating metal diya cups, banana leaf printed backdrop and toran set.",
        images: ["", "", "", "", ""] },
      { id: "neon-party", cat: "Birthdays & Milestones", tag: "Retro & Bold",
        price: 6299, mrp: 9400, popularity: 85, weight: "7 kg Total Box", footprint: "Fits 6x8 ft",
        title: "Neon Glow Retro Party Kit",
        desc: "Neon rope light frames, retro signboard, glow-in-dark balloons and a curated party prop box.",
        images: ["", "", "", "", ""] },
    ],

    themes: [
      { id: "marigold-theme", tag: "Festive Celebration Atelier", title: "Sun-Kissed Marigold & Brass Haldi decor", startsAt: 18000,
        desc: "Marigold canopies, brass urli centrepieces and draped organza, set up by our event artists.", images: ["", "", "", "", ""] },
      { id: "royal-mehendi", tag: "Festive Celebration Atelier", title: "Royal Rajasthani Mehendi decor", startsAt: 22000,
        desc: "Colourful phulkari drapes, floor seating, lanterns and a photo-ready mehendi lounge.", images: ["", "", "", "", ""] },
      { id: "pastel-baby", tag: "Festive Celebration Atelier", title: "Pastel Dreams Baby Shower decor", startsAt: 15000,
        desc: "Cloud balloon arches, soft florals and a cake table styled in pastel tones.", images: ["", "", "", "", ""] },
      { id: "ivory-reception", tag: "Festive Celebration Atelier", title: "Ivory & Gold Reception Stage decor", startsAt: 45000,
        desc: "Layered floral stage, crystal lighting and a walkway styled in ivory and gold.", images: ["", "", "", "", ""] },
    ],

    custom: {
      title: "Evenddy Customize Decor",
      price: 150000,
      hero: "",
      gallery: ["", "", "", ""],
      about: [
        "Led by architectural designers and senior floral sculptors, Evenddy Bespoke Decor Atelier transforms heritage ballrooms, private royal courtyards, and sun-drenched coastal venues into evocative living tapestries.",
        "Unlike fragmented decor agencies, Evenddy operates with a 100% proprietary in-house fabrication plant and temperature-controlled botanical cold storage in Mumbai and Udaipur.",
      ],
      specialisations: ["Monolithic Mandap Architecture", "Sun-kissed Bohemian Haldi & Mehendi", "High-Octane Concert Sangeet Trussing", "Curated Banquet Tablescapes", "Intelligent Kinetic Lighting", "Heritage Palace Restoration Styling"],
      stats: [
        { n: "120+", l: "Grand Events Styled", s: "Across 14 luxury destination cities" },
        { n: "12+",  l: "Years of operation",  s: "" },
      ],
    },

    occasions: ["Wedding", "Engagement", "Reception", "Sangeet / Mehendi", "Haldi", "Birthday", "Baby Shower", "Corporate Event", "Other"],
    budgets: ["₹1L - ₹3L", "₹3L - ₹6L", "₹6L - ₹10L", "₹10L+"],
  },

  /* =================== EVENT =================== */
  event: {
    sideImage: "",
    intro: {
      eyebrow: "EVENT PLANNING & MANAGEMENT",
      heading: "Your entire celebration, seamlessly planned.",
      lead: "Tell us what you're planning, your budget, and what you need. From curated decor and artisanal catering to venue scouting and on-ground coordination, our captains bring your vision to life.",
    },
    eventTypes: {
      Wedding: ["Traditional Wedding", "Destination Wedding", "Intimate Wedding"],
      Engagement: ["Ring Ceremony", "Roka / Sagai"],
      Reception: ["Grand Reception", "Cocktail Evening"],
      Birthday: ["Kids Birthday", "Adult Birthday", "Milestone Birthday"],
      Anniversary: ["Silver / Golden Jubilee", "Romantic Dinner", "Family Celebration"],
      "Baby Shower": ["Baby Shower", "Gender Reveal", "Naming Ceremony"],
      "Corporate Event": ["Product Launch", "Annual Day", "Offsite", "Gala Dinner"],
      "House Warming": ["Griha Pravesh", "Pooja & Lunch"],
      Other: ["Other"],
    },
    venueStatus: ["Have a venue", "Looking for a venue", "Not decided yet"],
    priorities: ["Beautiful Decor", "Great Food", "Budget-friendly", "Everything handled"],
  },
};

/* =================== STORAGE =================== */
export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { localStorage.setItem(KEY, JSON.stringify(DEFAULT_DATA)); return DEFAULT_DATA; }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DATA, ...parsed };
  } catch { return DEFAULT_DATA; }
}
export function saveData(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} }
export function resetData() { try { localStorage.removeItem(KEY); } catch {} return DEFAULT_DATA; }

/* =================== AUTH =================== */
export const isLoggedIn = () => { try { return localStorage.getItem(AUTH_KEY) === "1"; } catch { return false; } };
export const setLoggedIn = (v) => { try { v ? localStorage.setItem(AUTH_KEY, "1") : localStorage.removeItem(AUTH_KEY); } catch {} };

/* =================== HELPERS =================== */
export const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
export const uid = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

/* =================== ENQUIRIES =================== */
export const ENQUIRY_STATUS = ["new", "read", "replied", "closed"];

export const EMPTY_ENQUIRY = {
  id: "", createdAt: "", status: "new",
  type: "",        // "Meal Box" | "Delivery Box" | "Full Catering" | "Decor Kit" | "Decor Theme" | "Custom Decor" | "Event"
  subject: "",
  name: "", phone: "", email: "",
  guests: "", eventDate: "", location: "",
  items: [],       // [{name, qty, sub}]
  fields: {},      // arbitrary extras
  notes: "",
};

export function loadEnquiries() {
  try {
    const raw = localStorage.getItem(ENQ_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function saveEnquiries(list) {
  try { localStorage.setItem(ENQ_KEY, JSON.stringify(list)); } catch {}
}

export function addEnquiry(payload) {
  const record = {
    ...EMPTY_ENQUIRY,
    id: uid("enq"),
    createdAt: new Date().toISOString(),
    ...payload,
  };
  const next = [record, ...loadEnquiries()];
  saveEnquiries(next);
  try { window.dispatchEvent(new Event("evenddy:enquiry")); } catch {}
  return record;
}

export function updateEnquiry(id, patch) {
  const next = loadEnquiries().map((e) => (e.id === id ? { ...e, ...patch } : e));
  saveEnquiries(next);
  return next;
}

export function deleteEnquiry(id) {
  const next = loadEnquiries().filter((e) => e.id !== id);
  saveEnquiries(next);
  return next;
}

export function resetEnquiries() { try { localStorage.removeItem(ENQ_KEY); } catch {} }