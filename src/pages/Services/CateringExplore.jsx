import { useState, useMemo, useEffect, useId } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Catering.css";

/* Styled with plain CSS (catering.css, everything scoped under .ev). No Tailwind needed.
   Keep catering.css in the same folder as this file. */

/* ---------- Config: replace images + numbers with your own ---------- */
const WHATSAPP_NUMBER = "919999999999"; // country code + number, no "+"
const PHONE = "+91 99999 99999";
const IMG = {
  mealbox: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900",
  delivery: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900",
  full: "https://images.unsplash.com/photo-1555244162-803834f70033?w=900",
}; // replace with your design photos (Meal Box lunch box, Evenddy delivery box, live counter)

/* ---- Full Catering config: replace with your own photos / data ---- */
const GALLERY = [
  "https://images.unsplash.com/photo-1555244162-803834f70033?w=600",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
]; // replace with your own portfolio photos
const CUISINES = ["North Indian", "South Indian", "Continental", "Chinese", "Mexican", "Lebanese"];
const PLATE_PRICES = ["₹500 – ₹800", "₹800 – ₹1,200", "₹1,200 – ₹2,000", "₹2,000+"];
const FOOD_TYPES = ["Veg", "Non-Veg", "Veg + Non-Veg"];
const SERVICE_TAGS = ["Multi-cuisine", "South Indian", "Continental", "Chinese", "Mexican", "Lebanese", "Live Counters", "Chaat Counter", "BBQ & Grill Station", "Dessert Bar"];
const FULL_MENU = {
  Sweets: [{ n: "Gulab Jamun", veg: true }, { n: "Rasmalai", veg: true }, { n: "Double Ka Meetha", veg: true }, { n: "Ice Cream Bar", veg: true }],
  Starters: [{ n: "Paneer Tikka", veg: true }, { n: "Gobi Manchurian", veg: true }, { n: "Chicken 65", veg: false }, { n: "Fish Fingers", veg: false }],
  "Flavored Rice": [{ n: "Jeera Rice", veg: true }, { n: "Veg Pulao", veg: true }, { n: "Chicken Biryani", veg: false }, { n: "Veg Biryani", veg: true }],
  Curries: [{ n: "Dal Tadka", veg: true }, { n: "Paneer Butter Masala", veg: true }, { n: "Chicken Curry", veg: false }, { n: "Mutton Curry", veg: false }],
  "Rotis / Chaats": [{ n: "Butter Naan", veg: true }, { n: "Tandoori Roti", veg: true }, { n: "Pani Puri", veg: true }, { n: "Dahi Puri", veg: true }],
  Other: [{ n: "Salad Bar", veg: true }, { n: "Soup Station", veg: true }, { n: "Welcome Drinks", veg: true }],
};
const REVIEWS = [
  { who: "Ravi K.", text: "Food was fresh and the serving staff were very professional. Guests loved the live counters." },
  { who: "Sneha P.", text: "Handled 400 guests at our wedding without a single hiccup. Great value for the price." },
  { who: "Arjun M.", text: "Custom menu was exactly what we wanted. Timely setup and clean-up." },
];
const BOX_SIZES = [
  { items: 3, price: 150, note: "onwards" },
  { items: 5, price: 240, note: "onwards" },
  { items: 8, price: 380, note: "onwards" },
];
const MENU = [
  { id: 1, name: "Masala Dosa", cat: "Breakfast", veg: true },
  { id: 2, name: "Idli Sambar", cat: "Breakfast", veg: true },
  { id: 3, name: "Egg Puffs", cat: "Breakfast", veg: false },
  { id: 4, name: "Poha", cat: "Breakfast", veg: true },
  { id: 5, name: "Masala Chai & Biscuits", cat: "Tea/Snacks", veg: true },
  { id: 6, name: "Samosa", cat: "Tea/Snacks", veg: true },
  { id: 7, name: "Chicken Roll", cat: "Tea/Snacks", veg: false },
  { id: 8, name: "Veg Cutlet", cat: "Tea/Snacks", veg: true },
  { id: 9, name: "Paneer Tikka", cat: "Starters", veg: true },
  { id: 10, name: "Chicken 65", cat: "Starters", veg: false },
  { id: 11, name: "Gobi Manchurian", cat: "Starters", veg: true },
  { id: 12, name: "Fish Fingers", cat: "Starters", veg: false },
  { id: 13, name: "Upma", cat: "Breakfast", veg: true },
  { id: 14, name: "Ven Pongal", cat: "Breakfast", veg: true },
  { id: 15, name: "Medu Vada", cat: "Breakfast", veg: true },
  { id: 16, name: "Mirchi Bajji", cat: "Tea/Snacks", veg: true },
  { id: 17, name: "Onion Pakoda", cat: "Tea/Snacks", veg: true },
  { id: 18, name: "Hara Bhara Kebab", cat: "Starters", veg: true },
  { id: 19, name: "Veg Spring Roll", cat: "Starters", veg: true },
  { id: 20, name: "Chilli Chicken", cat: "Starters", veg: false },
  { id: 21, name: "Pesarattu", cat: "Breakfast", veg: true },
  { id: 22, name: "Corn Cutlet", cat: "Tea/Snacks", veg: true },
  { id: 23, name: "Crispy Corn", cat: "Starters", veg: true },
];
// One slot per item in the box (3 / 5 / 8 items show the first 3 / 5 / 8 slots). v = veg
const MEALBOX_SLOTS = [
  { icon: "bowl", options: [{ n: "Dal Makhani", v: true }, { n: "Paneer Butter Masala", v: true }, { n: "Chicken Curry", v: false }] },
  { icon: "rice", options: [{ n: "Steamed Basmati Rice", v: true }, { n: "Jeera Rice", v: true }, { n: "Veg Pulao", v: true }] },
  { icon: "cup", options: [{ n: "Fresh Curd with Boondi", v: true }, { n: "Gulab Jamun", v: true }, { n: "Fruit Custard", v: true }] },
  { icon: "bowl", options: [{ n: "Butter Naan", v: true }, { n: "Tandoori Roti", v: true }, { n: "Plain Paratha", v: true }] },
  { icon: "bowl", options: [{ n: "Paneer Tikka", v: true }, { n: "Veg Cutlet", v: true }, { n: "Chicken 65", v: false }] },
  { icon: "cup", options: [{ n: "Green Salad", v: true }, { n: "Kachumber", v: true }, { n: "Sprouts Chaat", v: true }] },
  { icon: "cup", options: [{ n: "Masala Buttermilk", v: true }, { n: "Sweet Lassi", v: true }, { n: "Lemon Soda", v: true }] },
  { icon: "bowl", options: [{ n: "Papad & Pickle", v: true }, { n: "Boondi Raita", v: true }, { n: "Onion Raita", v: true }] },
];

/* ---------- Small line icons (landing cards + chips) ---------- */
const ICONS = {
  box: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  truck: <><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>,
  fork: <path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10" />,
  leaf: <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7" />,
  grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  swap: <path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />,
  people: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.3" /><path d="M17 14c2.5 0 4.5 2 4.5 4.5" /></>,
  delivery: <><path d="M3 7h10v9H3zM13 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>,
  dish: <path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 8V6" />,
  menu: <path d="M4 5h7v14H4zM13 5h7v14h-7zM6 9h3M15 9h3" />,
  chef: <path d="M7 14v6h10v-6M7 14a4 4 0 1 1 1-7.7A4 4 0 0 1 16 6.3 4 4 0 1 1 17 14" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  pin: <><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.7 7L4 20l1.1-4.3A8 8 0 1 1 21 12z" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  bowl: <path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-1.5 1-2 1-3.5M13 7c0-1.5 1-2 1-3.5" />,
  rice: <path d="M4 12h16a8 8 0 0 1-16 0zM8 12a4 4 0 0 1 8 0" />,
  cup: <path d="M5 8h14l-1.5 11h-11zM4 8h16M9 8c0-2 1.5-3 3-3s3 1 3 3" />,
};
function Icon({ name, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const cx = (...a) => a.filter(Boolean).join(" ");

/* ---------- Shared ---------- */
function Crumb({ go, current, embedded }) {
  const sep = <i>›</i>;
  return (
    <nav className="crumb" aria-label="Breadcrumb">
      {!embedded && <><Link to="/">Home</Link>{sep}</>}
      {current ? <button onClick={() => go("landing")}>Catering</button> : <b aria-current="page">Catering</b>}
      {current && <>{sep}<b aria-current="page">{current}</b></>}
    </nav>
  );
}

function Field({ label, error, icon, ...p }) {
  const id = useId();
  return (
    <div className="f">
      <label htmlFor={id}>{label}</label>
      <div className={cx("inp", icon && "has-icon")}>
        {icon && <span className="inp-ic"><Icon name={icon} size={16} /></span>}
        <input id={id} className={error ? "err" : ""} {...p} />
      </div>
    </div>
  );
}

function SelectField({ label, children, ...p }) {
  const id = useId();
  return (
    <div className="f">
      <label htmlFor={id}>{label}</label>
      <select id={id} {...p}>{children}</select>
    </div>
  );
}

function Switch({ on, onClick, label }) {
  return <button type="button" className={cx("sw", on && "on")} role="switch" aria-checked={on} aria-label={label} onClick={onClick} />;
}

function Radios({ name, value, onChange, labelId }) {
  return (
    <div className="radio" role="radiogroup" aria-labelledby={labelId}>
      {["yes", "no"].map((v) => (
        <label key={v}>
          <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} />
          {v === "yes" ? "Yes" : "No"}
        </label>
      ))}
    </div>
  );
}

function WhatsAppRow({ on, setOn }) {
  return (
    <div className="wa">
      <span className="wa-ic"><Icon name="chat" size={16} /></span>
      <span className="wa-t"><b>Notify me on WhatsApp</b><small>We'll send quote there</small></span>
      <Switch on={on} onClick={() => setOn(!on)} label="Notify on WhatsApp" />
    </div>
  );
}

/* ---------- Order summary (shared by Meal Box + Delivery Box) ---------- */
// bold = Delivery Box look (semibold heading)
function OrderSummary({ lines, submitLines, total, onRemove, showGuests, showDelivery, header, bold }) {
  const [form, setForm] = useState({ name: "", phone: "", guests: "", date: "", delivery: "yes", serving: "no", location: "", wa: true });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const send = () => {
    // if nothing was touched yet, the default selection (submitLines) is what gets sent
    const items = lines.length ? lines : submitLines || [];
    const e = {};
    if (!form.name.trim()) e.name = 1;
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "").slice(-10))) e.phone = 1;
    if (!form.date) e.date = 1;
    if (!items.length) e.items = 1;
    setErrors(e);
    if (Object.keys(e).length) return;
    const msg = [
      `Catering enquiry – ${header}`,
      ...items.flatMap((l) => [`• ${l.name} × ${l.qty}`, l.sub && `   (${l.sub})`]),
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      showGuests && `Guests: ${form.guests}`,
      `Event date: ${form.date}`,
      showDelivery && `Delivery: ${form.delivery === "yes" ? form.location || "Yes" : "Pickup"}`,
      showDelivery && `Serving required: ${form.serving === "yes" ? "Yes" : "No"}`,
      !showDelivery && `Location: ${form.location}`,
    ].filter(Boolean).join("\n");
    if (form.wa) window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
  };

  return (
    <aside className={cx("summary", bold && "bold")}>
      <h3>Order Summary</h3>
      <div className="sum-label">Items list</div>
      {lines.length === 0 ? (
        <div className={cx("empty", errors.items && "err")}>No items added</div>
      ) : (
        <div className="lines">
          {lines.map((l) => (
            <div className="line" key={l.key}>
              <div className="ln">
                <span>{l.name}</span>
                {l.sub && <small>{l.sub}</small>}
              </div>
              <span className="qty">× {l.qty}</span>
              {onRemove && !l.fixed && <button aria-label={`Remove ${l.name}`} onClick={() => onRemove(l.key)}>✕</button>}
            </div>
          ))}
          {total ? <div className="est">Estimated <b>₹{total.toLocaleString("en-IN")}</b> onwards</div> : null}
        </div>
      )}

      <Field label="Name" placeholder="Enter your name" value={form.name} onChange={set("name")} error={errors.name} />
      <Field label="Phone Number" type="tel" placeholder="Enter phone number" value={form.phone} onChange={set("phone")} error={errors.phone} />
      {showGuests && <Field label="Number of Guests" type="number" min="1" placeholder="Enter guest count" value={form.guests} onChange={set("guests")} />}
      <Field label="Event Date" type="date" icon="calendar" value={form.date} onChange={set("date")} error={errors.date} />
      {showDelivery && (
        <div className="f row">
          <span id="lab-delivery" className="lab">Delivery Required ?</span>
          <Radios name="delivery" value={form.delivery} onChange={(v) => setForm({ ...form, delivery: v })} labelId="lab-delivery" />
        </div>
      )}
      {(!showDelivery || form.delivery === "yes") && (
        <Field label="Delivery location/city" icon="pin" placeholder="Enter city or area" value={form.location} onChange={set("location")} />
      )}
      {showDelivery && (
        <div className="f row">
          <span id="lab-serving" className="lab">Serving Required?</span>
          <Radios name="serving" value={form.serving} onChange={(v) => setForm({ ...form, serving: v })} labelId="lab-serving" />
        </div>
      )}
      <WhatsAppRow on={form.wa} setOn={(v) => setForm({ ...form, wa: v })} />
      {sent && <div className="toast" role="status">Enquiry sent. Our team will contact you to confirm details.</div>}
      <button className="btn block" onClick={send}>Send Enquiry</button>
      <a className="btn block ghost call" href={`tel:${PHONE.replace(/\s/g, "")}`}><Icon name="phone" size={15} />Call Us</a>
      <p className="note">No payment required now. Our team will contact you to confirm details.</p>
    </aside>
  );
}

/* ---------- Menu list ---------- */
// compact = Delivery Box look (smaller text, tighter "Select" button)
function MenuList({ items, qtyById, toggle, cta = "Add", ctaOn = "Added", compact }) {
  if (!items.length) return <p className="empty-note">No items here yet. Try switching on "Include Non-Veg".</p>;
  return (
    <div className={cx("menu", compact && "compact")}>
      {items.map((m) => (
        <div key={m.id} className={cx("item", !m.veg && "nv")}>
          <span>{m.name}</span>
          <button className={cx("add", qtyById[m.id] && "on")} onClick={() => toggle(m)}>{qtyById[m.id] ? ctaOn : cta}</button>
        </div>
      ))}
    </div>
  );
}

/* Pure Veg  ⇄  Include Non-Veg (default: pure veg) */
function VegToggle({ nonVeg, setNonVeg }) {
  return (
    <div className="vegtoggle">
      <span className="vd">Pure Veg</span>
      <Switch on={nonVeg} onClick={() => setNonVeg(!nonVeg)} label="Include non-veg" />
      <span className="vd r">Include Non-Veg</span>
    </div>
  );
}

const Tab = ({ on, small, ...p }) => <button className={cx("tab", small && "sm", on && "on")} {...p} />;

/* ---------- Landing ---------- */
function Landing({ go, embedded }) {
  // tone → eyebrow, top line and button colour (gold / maroon / orange)
  const options = [
    { id: "mealbox", title: "Meal Box", img: IMG.mealbox, tone: "gold", icon: "box", eyebrow: "Individual & Packed Meals",
      paras: [
        "Perfect for individual meals, small celebrations, office meals, birthdays, gatherings and functions.",
        "Choose from structured meal boxes with 3, 5 or 6 items and customize eligible items with same-price swaps.",
      ],
      chips: [["leaf", "Veg & Non-Veg"], ["grid", "3/5/6 Item Options"], ["swap", "Same-Price Item Swaps"]], cta: "Explore Meal Box" },
    { id: "delivery", title: "Delivery Box", img: IMG.delivery, flip: true, tone: "maroon", icon: "truck", eyebrow: "Party Food Delivered To You",
      paras: [
        "Perfect for house parties, get-togethers, farm-house parties and casual events, generally for 10+ people.",
        "Choose party food, select quantities based on people or servings, and get it delivered to your event location.",
      ],
      chips: [["people", "Generally for 10+ People"], ["delivery", "Delivery Included"], ["dish", "Optional Serving"]], cta: "Explore Delivery Box" },
    { id: "full", title: "Full Catering", img: IMG.full, tone: "orange", icon: "fork", eyebrow: "Complete Event Catering", price: "Starting from ₹200 /plate",
      paras: [
        "Best for weddings, celebrations, corporate events and other occasions requiring complete food service.",
        "Build your menu, customize food selections, request items that are not listed and add live counters.",
      ],
      chips: [["menu", "Custom Menu"], ["chef", "Live Counters"]], cta: "Explore Full Catering" },
  ];

  const picks = [
    ["box", "Meal Box", "Individual portions, perfect for structured meals.", "mealbox", "green"],
    ["truck", "Delivery Box", "Bulk food delivered hot to your venue or home.", "delivery", "gold"],
    ["fork", "Full Catering", "Complete service with custom menu and live counters.", "full", "orange"],
  ];

  return (
    <>
      <div className="wrap">
        <Crumb go={go} embedded={embedded} />
        <section className="hero">
          <p className="eyebrow">OUR CATERING SERVICES</p>
          <h1>Catering for every <em>Celebration.</em></h1>
          <p>Choose the catering experience that best fits your event.</p>
        </section>

        <div className="opts">
          {options.map((o) => (
            <article key={o.id} className={cx("opt", `tone-${o.tone}`, o.flip && "flip")}>
              <div className="media" role="img" aria-label={o.title} style={{ backgroundImage: `url(${o.img})` }} />
              <div className="body">
                <span className="tag"><Icon name={o.icon} size={15} />{o.eyebrow}</span>
                <div className="title-row">
                  <h2>{o.title}</h2>
                  {o.price && <span className="price-badge">{o.price}</span>}
                </div>
                {o.paras.map((p) => <p key={p}>{p}</p>)}
                <div className="chips">
                  {o.chips.map(([ic, tx]) => <span key={tx} className="chip"><Icon name={ic} size={12} />{tx}</span>)}
                </div>
                <button className="btn" onClick={() => go(o.id)}>{o.cta}</button>
              </div>
            </article>
          ))}
        </div>

        <h2 className="choose">Choose the right catering experience</h2>
        <div className="three">
          {picks.map(([ic, t, d, id, tone]) => (
            <button key={id} className={cx("mini", `tone-${tone}`)} onClick={() => go(id)}>
              <span className="mi"><Icon name={ic} size={20} /></span>
              <h4>{t}</h4>
              <p>{d}</p>
            </button>
          ))}
        </div>
      </div>

      <section className="band">
        <h3>Let's plan your event with perfect choice.</h3>
        <p>Need help deciding? Our team will guide you.</p>
        <div className="row">
          <Link className="btn" to="/plan-event">Get a Quote</Link>
          <a className="btn ghost" href={`tel:${PHONE.replace(/\s/g, "")}`}>Call us</a>
        </div>
      </section>
    </>
  );
}

/* ---------- Meal Box ---------- */
function MealBox({ go, embedded }) {
  const TABS = ["Meal Box", "Breakfast", "Tea/Snacks", "Starters"];
  const [tab, setTab] = useState("Meal Box");
  const [nonVeg, setNonVeg] = useState(false);
  const [touched, setTouched] = useState(false); // summary stays "No items added" until the guest interacts
  const [size, setSize] = useState(0);
  const [picks, setPicks] = useState(MEALBOX_SLOTS.map(() => 0));
  const [guests, setGuests] = useState(10);
  const [extra, setExtra] = useState({}); // id -> item (menu tabs)

  const slotCount = BOX_SIZES[size].items;
  // the option shown for a slot (falls back to the first veg option when "Pure Veg" is on)
  const current = (i) => {
    const o = MEALBOX_SLOTS[i].options;
    const c = o[picks[i]];
    return !nonVeg && !c.v ? o.find((x) => x.v) : c;
  };
  const cycle = (i) => {
    const o = MEALBOX_SLOTS[i].options;
    const allowed = o.filter((x) => nonVeg || x.v);
    const next = allowed[(allowed.findIndex((x) => x.n === current(i).n) + 1) % allowed.length];
    setPicks((p) => p.map((v, k) => (k === i ? o.findIndex((x) => x.n === next.n) : v)));
    setTouched(true);
  };
  const toggle = (m) => { setTouched(true); setExtra((e) => { const n = { ...e }; n[m.id] ? delete n[m.id] : (n[m.id] = m); return n; }); };
  const pickSize = (i) => { setSize(i); setTouched(true); };
  const setGuestCount = (fn) => { setGuests(fn); setTouched(true); };

  const chosen = MEALBOX_SLOTS.slice(0, slotCount).map((_, i) => current(i).n);
  const boxLine = { key: "box", fixed: true, name: `${slotCount} Items Meal Box`, qty: guests, sub: chosen.join(", ") };
  const allLines = [boxLine, ...Object.values(extra).map((m) => ({ key: m.id, name: m.name, qty: guests }))];
  const lines = touched ? allLines : [];
  const total = BOX_SIZES[size].price * guests;
  const menuItems = useMemo(() => MENU.filter((m) => m.cat === tab && (nonVeg || m.veg)), [tab, nonVeg]);

  return (
    <div className="wrap">
      <Crumb go={go} current="Meal Box" embedded={embedded} />
      <div className="topbar">
        <div className="tabs">
          {TABS.map((t) => <Tab key={t} on={tab === t} onClick={() => setTab(t)}>{t}</Tab>)}
        </div>
        <VegToggle nonVeg={nonVeg} setNonVeg={setNonVeg} />
      </div>

      <div className="layout">
        <div>
          {tab === "Meal Box" ? (
            <>
              <section className="panel">
                <div className="step">STEP 01</div><h3>Choose your box size</h3>
                <div className="sizes">
                  {BOX_SIZES.map((b, i) => (
                    <button key={b.items} className={cx("size", size === i && "on")} aria-pressed={size === i} onClick={() => pickSize(i)}>
                      <small>{b.items} Items Box</small><b>₹{b.price}</b><em>{b.note}</em>
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="panel-head">
                  <div><div className="step">STEP 02</div><h3>Your Selected Box Items</h3></div>
                  <span className="hint">Tap "Change" to swap</span>
                </div>
                {MEALBOX_SLOTS.slice(0, slotCount).map((s, i) => {
                  const c = current(i);
                  return (
                    <div className="slot" key={i}>
                      <span role="img" aria-label={c.v ? "Veg" : "Non-veg"} className={cx("vdot", !c.v && "nv")} />
                      <div className="ic"><Icon name={s.icon} size={18} /></div>
                      <span className="n">{c.n}</span>
                      <button className="link" onClick={() => cycle(i)}><Icon name="swap" size={13} />Change</button>
                    </div>
                  );
                })}
              </section>

              <section className="panel">
                <div className="panel-head">
                  <div><div className="step">STEP 03</div><h3>Number of Guests / Box Quantity</h3></div>
                  <span className="hint">Min. 10 Boxes</span>
                </div>
                <div className="guestbox">
                  <div>
                    <b>How many guests are attending?</b>
                    <small>Every box is packed fresh 45 minutes prior to requested arrival time.</small>
                  </div>
                  <div className="stepper">
                    <div className="box">
                      <button aria-label="Decrease" onClick={() => setGuestCount((g) => Math.max(10, g - 5))}>−</button>
                      <strong>{guests}</strong>
                      <button aria-label="Increase" onClick={() => setGuestCount((g) => g + 5)}>+</button>
                    </div>
                    <span>Boxes</span>
                  </div>
                </div>
                <div className="presets">
                  <span>Quick Presets:</span>
                  {[10, 25, 50, 100, 250].map((n) => (
                    <button key={n} className={guests === n ? "on" : ""} onClick={() => setGuestCount(() => n)}>{n} Boxes</button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="panel">
              <h3>Available Menu</h3>
              <MenuList items={menuItems} qtyById={Object.fromEntries(Object.keys(extra).map((k) => [k, 1]))} toggle={toggle} />
            </section>
          )}
        </div>
        <OrderSummary
          lines={lines}
          submitLines={allLines}
          total={touched ? total : 0}
          onRemove={(k) => setExtra((e) => { const n = { ...e }; delete n[k]; return n; })}
          header="Meal Box"
          showDelivery={false}
        />
      </div>
    </div>
  );
}

/* ---------- Delivery Box ---------- */
// Same design as the Delivery Box mock: white menu card (title + Pure Veg toggle, divider, pill tabs,
// two-column rows with a "Select" button) next to the Order Summary card.
function DeliveryBox({ go, embedded }) {
  const FILTERS = ["All", "Breakfast", "Tea/Snacks", "Starters"];
  const [filter, setFilter] = useState("All");
  const [nonVeg, setNonVeg] = useState(false);
  const [sel, setSel] = useState({});
  const toggle = (m) => setSel((s) => { const n = { ...s }; n[m.id] ? delete n[m.id] : (n[m.id] = m); return n; });
  const items = MENU.filter((m) => (filter === "All" || m.cat === filter) && (nonVeg || m.veg));
  const lines = Object.values(sel).map((m) => ({ key: m.id, name: m.name, qty: 1 }));

  return (
    <div className="wrap">
      <Crumb go={go} current="Delivery Box" embedded={embedded} />
      <div className="layout">
        <section className="panel dv-panel">
          <div className="dv-head">
            <h3>Available Menu</h3>
            <VegToggle nonVeg={nonVeg} setNonVeg={setNonVeg} />
          </div>
          <div className="tabs">
            {FILTERS.map((f) => <Tab key={f} small on={filter === f} onClick={() => setFilter(f)}>{f}</Tab>)}
          </div>
          <MenuList compact items={items} qtyById={Object.fromEntries(Object.keys(sel).map((k) => [k, 1]))} toggle={toggle} cta="Select" ctaOn="Selected" />
        </section>
        <OrderSummary
          bold
          lines={lines}
          onRemove={(k) => setSel((s) => { const n = { ...s }; delete n[k]; return n; })}
          header="Delivery Box"
          showGuests
          showDelivery
        />
      </div>
    </div>
  );
}

/* ---------- Full Catering ---------- */
function buildMsg(title, rows) {
  return [title, ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)].join("\n");
}

/* Detailed quote form (modal) */
function QuoteModal({ onClose }) {
  const [vegOnly, setVegOnly] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", cuisine: "", plate: "", guests: "", date: "", foodType: "", location: "", counter: "yes" });
  const [menu, setMenu] = useState({});
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 1;
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "").slice(-10))) e.phone = 1;
    if (!form.date) e.date = 1;
    setErrors(e);
    return !Object.keys(e).length;
  };
  const message = () =>
    buildMsg("Full catering enquiry", [
      ["Name", form.name], ["Phone", form.phone], ["Cuisine", form.cuisine], ["Plate price", form.plate],
      ["Guests", form.guests], ["Event date", form.date], ["Food type", vegOnly ? "Veg only" : form.foodType],
      ["Location", form.location], ["Live counter", form.counter === "yes" ? "Yes" : "No"],
      ...Object.entries(menu).map(([k, v]) => [k, v]),
    ]);
  const whatsapp = () => validate() && window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message())}`, "_blank");
  const request = () => validate() && setSent(true);

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Request Quote" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Request Quote</h3>
          <span className="vegonly">VEG ONLY<Switch on={vegOnly} onClick={() => setVegOnly(!vegOnly)} label="Veg only" /></span>
          <button className="x" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="grid2">
          <Field label="Name" placeholder="Enter your name" value={form.name} onChange={set("name")} error={errors.name} />
          <Field label="Phone No." type="tel" placeholder="Enter phone number" value={form.phone} onChange={set("phone")} error={errors.phone} />
          <SelectField label="Cuisine type" value={form.cuisine} onChange={set("cuisine")}><option value="">Select cuisine</option>{CUISINES.map((x) => <option key={x}>{x}</option>)}</SelectField>
          <SelectField label="Plate Price" value={form.plate} onChange={set("plate")}><option value="">Select price</option>{PLATE_PRICES.map((x) => <option key={x}>{x}</option>)}</SelectField>
          <Field label="No. of Guests" type="number" min="1" placeholder="Guest count" value={form.guests} onChange={set("guests")} />
          <Field label="Event date" type="date" icon="calendar" value={form.date} onChange={set("date")} error={errors.date} />
          <SelectField label="Food type" value={vegOnly ? "Veg" : form.foodType} disabled={vegOnly} onChange={set("foodType")}><option value="">Select type</option>{FOOD_TYPES.map((x) => <option key={x}>{x}</option>)}</SelectField>
          <Field label="Event location" icon="pin" placeholder="City / area" value={form.location} onChange={set("location")} />
        </div>

        <div className="f row">
          <span id="lab-counter" className="lab">Use Counter?</span>
          <Radios name="counter" value={form.counter} onChange={(v) => setForm({ ...form, counter: v })} labelId="lab-counter" />
        </div>

        <h4 className="menu-title">Menu</h4>
        <div className="grid2">
          {Object.entries(FULL_MENU).map(([cat, opts]) => (
            <SelectField key={cat} label={cat} value={menu[cat] || ""} onChange={(e) => setMenu({ ...menu, [cat]: e.target.value })}>
              <option value="">Select type</option>
              {opts.filter((o) => !vegOnly || o.veg).map((o) => <option key={o.n}>{o.n}</option>)}
            </SelectField>
          ))}
        </div>

        {sent && <div className="toast mt" role="status">Quote request sent. Our team will contact you shortly.</div>}
        <div className="modal-actions">
          <button className="btn ghost" onClick={whatsapp}>Continue on WhatsApp</button>
          <button className="btn" onClick={request}>Request Quote</button>
        </div>
      </div>
    </div>
  );
}

/* Side "Request Quote" card */
function QuoteSide({ onOpenDetailed }) {
  const [form, setForm] = useState({ name: "", phone: "", guests: "", date: "", location: "", wa: true });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const send = () => {
    const e = {};
    if (!form.name.trim()) e.name = 1;
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "").slice(-10))) e.phone = 1;
    if (!form.date) e.date = 1;
    setErrors(e);
    if (Object.keys(e).length) return;
    const msg = buildMsg("Full catering enquiry", [["Name", form.name], ["Phone", form.phone], ["Guests", form.guests], ["Event date", form.date], ["Location", form.location]]);
    if (form.wa) window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
  };

  return (
    <aside className="summary">
      <h3>Request Quote</h3>
      <Field label="Name" placeholder="Enter your name" value={form.name} onChange={set("name")} error={errors.name} />
      <Field label="Phone Number" type="tel" placeholder="Enter phone number" value={form.phone} onChange={set("phone")} error={errors.phone} />
      <Field label="Number of Guests" type="number" min="1" placeholder="Enter guest count" value={form.guests} onChange={set("guests")} />
      <Field label="Event Date" type="date" icon="calendar" value={form.date} onChange={set("date")} error={errors.date} />
      <Field label="Event location/city" icon="pin" placeholder="Enter city or area" value={form.location} onChange={set("location")} />
      <WhatsAppRow on={form.wa} setOn={(v) => setForm({ ...form, wa: v })} />
      {sent && <div className="toast" role="status">Enquiry sent. Our team will contact you to confirm details.</div>}
      <button className="btn block" onClick={send}>Send Enquiry</button>
      <a className="btn block ghost call" href={`tel:${PHONE.replace(/\s/g, "")}`}><Icon name="phone" size={15} />Call Us</a>
      <button className="link block" onClick={onOpenDetailed}>Customise menu &amp; get a detailed quote</button>
      <p className="note">No payment required now. Our team will contact you to confirm details.</p>
    </aside>
  );
}

function FullCatering({ go, embedded }) {
  const TABS = [["about", "About"], ["portfolio", "Portfolio (140)"], ["reviews", "Reviews (84)"]];
  const [tab, setTab] = useState("about");
  const [modal, setModal] = useState(false);

  return (
    <div className="wrap">
      <Crumb go={go} current="Full Catering" embedded={embedded} />
      <div className="layout">
        <div>
          <div className="fc-hero" role="img" aria-label="Evenddy Full catering" style={{ backgroundImage: `url(${IMG.full})` }} />
          <div className="fc-title">
            <h1>Evenddy Full catering Service</h1>
            <span className="badge">Evenddy Certified</span>
          </div>
          <div className="fc-meta">
            <span>★ 4.9 <small>(84 verified reviews)</small></span>
            <span>⌖ Vizag, Andhra Pradesh, India</span>
            <span>120+ Grand Celebrations Served</span>
            <span>Avg. Response: 12 hrs</span>
          </div>

          <div className="tabs">
            {TABS.map(([id, label]) => <Tab key={id} on={tab === id} onClick={() => setTab(id)}>{label}</Tab>)}
          </div>

          {tab === "about" && (
            <section className="panel">
              <div className="step pink">ABOUT</div>
              <h3>Evenddy Full Catering Service</h3>
              <p className="fc-text">Evenddy Full Catering Service delivers end-to-end dining with a wide range of multi-cuisine menus: Indian, Continental, Chinese, Mexican and Lebanese, from intimate gatherings to large-scale celebrations. We take care of everything from menu planning to live counters, serving staff and setup so your guests experience a seamless, flavourful occasion.</p>
              <div className="step pink mt">CUISINES &amp; SERVICES</div>
              <div className="chips">{SERVICE_TAGS.map((t) => <span className="chip" key={t}>{t}</span>)}</div>
              <div className="stats3">
                {[["500+", "Events Catered"], ["15+", "Cuisine Types"], ["3", "Price Ranges"]].map(([n, l]) => (
                  <div key={l}><b>{n}</b><span>{l}</span></div>
                ))}
              </div>
            </section>
          )}

          {(tab === "about" || tab === "portfolio") && (
            <section className="panel">
              <div className="step pink">OUR CELEBRATIONS</div>
              <h3>Portfolio Gallery (140)</h3>
              <div className="gallery4">
                {GALLERY.map((src, i) => <div key={i} role="img" aria-label={`Portfolio ${i + 1}`} style={{ backgroundImage: `url(${src})` }} />)}
              </div>
              <div className="center"><button className="btn ghost">Explore 600+ creations (140 images) →</button></div>
            </section>
          )}

          {tab === "reviews" && (
            <section className="panel">
              <h3>Reviews (84)</h3>
              {REVIEWS.map((r) => (
                <div className="slot rev" key={r.who}>
                  <b>{r.who} · ★ 5</b><span>{r.text}</span>
                </div>
              ))}
            </section>
          )}
        </div>
        <QuoteSide onOpenDetailed={() => setModal(true)} />
      </div>
      {modal && <QuoteModal onClose={() => setModal(false)} />}
    </div>
  );
}

/* ---------- Page (swap `view` state for React Router if you use it) ---------- */
export default function CateringExplore({ embedded = false }) {
  // view lives in the URL (?view=mealbox) so the browser Back button returns to the previous step
  const [params, setParams] = useSearchParams();
  const VIEWS = ["landing", "mealbox", "delivery", "full"];
  const q = params.get("view");
  const view = VIEWS.includes(q) ? q : "landing";
  const go = (v) => { setParams(v === "landing" ? {} : { view: v }); window.scrollTo({ top: 0 }); };

  return (
    <div className={cx("ev", view === "landing" ? "is-landing" : "is-booking", embedded && "embedded")}>
      {view === "landing" && <Landing go={go} embedded={embedded} />}
      {view === "mealbox" && <MealBox go={go} embedded={embedded} />}
      {view === "delivery" && <DeliveryBox go={go} embedded={embedded} />}
      {view === "full" && <FullCatering go={go} embedded={embedded} />}
      <div style={{ height: 48 }} />
    </div>
  );
}
