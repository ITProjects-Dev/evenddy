import { useState, useMemo, useEffect, useId } from "react";
import { Link, useSearchParams } from "react-router-dom";

/* Styled with Tailwind utility classes only (no Catering.css needed, delete it).
   Font comes from your global Sora setup, so no font-family anywhere here.

   NOTE: your global CSS has unlayered rules (a{color:inherit}, button{border:0},
   h1,h2{font-weight/letter-spacing}, h1-h4,p{margin-top:0}). Tailwind v4 utilities live in a
   layer, so those global rules win. Where that matters I use the "!" suffix (e.g. text-white!)
   and use inset box-shadows instead of borders on buttons. Don't remove them. */

/* ---------- Config: replace images + numbers with your own ---------- */
const WHATSAPP_NUMBER = "919999999999"; // country code + number, no "+"
const PHONE = "+91 99999 99999";
const IMG = {
  mealbox: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900",
  delivery: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900",
  full: "https://images.unsplash.com/photo-1555244162-803834f70033?w=900",
};

/* Photos for the "Change Item" popup, keyed by dish name.
   Add a URL for any dish; dishes without one fall back to the slot icon tile. */
const DISH_IMG = {
  // "Tandoori Roti": "https://your-cdn.com/tandoori-roti.jpg",
  // "Butter Naan": "https://your-cdn.com/butter-naan.jpg",
};

const GALLERY = [
  "https://images.unsplash.com/photo-1555244162-803834f70033?w=600",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600",
];
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
  { icon: "bowl", options: [{ n: "Dal Makhani", v: true }, { n: "Paneer Butter Masala", v: true }, { n: "Chicken Curry", v: false }, { n: "Palak Paneer", v: true }, { n: "Kadai Paneer", v: true }] },
  { icon: "rice", options: [{ n: "Steamed Basmati Rice", v: true }, { n: "Jeera Rice", v: true }, { n: "Veg Pulao", v: true }, { n: "Lemon Rice", v: true }] },
  { icon: "cup", options: [{ n: "Fresh Curd with Boondi", v: true }, { n: "Gulab Jamun", v: true }, { n: "Fruit Custard", v: true }, { n: "Rasmalai", v: true }] },
  { icon: "bowl", options: [{ n: "Butter Naan", v: true }, { n: "Tandoori Roti", v: true }, { n: "Plain Paratha", v: true }, { n: "Garlic Naan", v: true }, { n: "Laccha Paratha", v: true }] },
  { icon: "bowl", options: [{ n: "Paneer Tikka", v: true }, { n: "Veg Cutlet", v: true }, { n: "Chicken 65", v: false }] },
  { icon: "cup", options: [{ n: "Green Salad", v: true }, { n: "Kachumber", v: true }, { n: "Sprouts Chaat", v: true }] },
  { icon: "cup", options: [{ n: "Masala Buttermilk", v: true }, { n: "Sweet Lassi", v: true }, { n: "Lemon Soda", v: true }] },
  { icon: "bowl", options: [{ n: "Papad & Pickle", v: true }, { n: "Boondi Raita", v: true }, { n: "Onion Raita", v: true }] },
];

/* ---------- Icons ---------- */
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
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6z" />,
  share: <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" /></>,
  chevron: <path d="M6 9l6 6 6-6" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};
function Icon({ name, size = 14 }) {
  return (
    <svg className="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const cx = (...a) => a.filter(Boolean).join(" ");

/* ---------- Input rules ---------- */
const onlyDigits = (v) => v.replace(/\D/g, "");
/* Indian mobile: digits only, max 10, must start with 6-9. Handles pasted "+91 98765 43210" / "098765 43210". */
const cleanPhone = (v) => {
  let d = onlyDigits(v);
  if (d.length >= 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d.replace(/^[0-5]+/, "").slice(0, 10);
};
const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
/* Shared validation for name / phone / date / guests. Returns { field: "message" } */
const checkBasics = (f) => {
  const e = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name";
  if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = "Enter a valid 10-digit mobile number";
  if (!f.date) e.date = "Please select the event date";
  else if (f.date < todayISO()) e.date = "Event date can't be in the past";
  if (f.guests !== undefined && f.guests !== "" && Number(f.guests) < 1) e.guests = "Guests must be at least 1";
  return e;
};

/* ---------- Shared class strings ---------- */
const WRAP = "mx-auto w-full max-w-[1120px] px-6";
const LAYOUT = "grid items-start gap-[22px] min-[900px]:grid-cols-[1fr_360px]";
const PANEL = "mb-5 rounded-2xl bg-white px-[18px] py-5 shadow-[0_2px_14px_rgba(60,40,30,.06)] min-[560px]:px-7 min-[560px]:py-[26px]";
const H3 = "mb-[18px] text-xl font-medium text-[#1f1819]";
const STEP = "mb-1.5 text-[10.5px] font-medium tracking-[.08em] text-[#6b4a46]";
const STEP_PINK = "mb-1.5 text-[10.5px] font-semibold tracking-[.1em] text-[#8c1c4f]";
const CHIP = "inline-flex items-center gap-1.5 rounded-full bg-[#efeeec] px-[13px] py-[7px] text-[11.5px] font-medium text-[#3f3a3c]";
const BTN_SOLID = "inline-flex items-center justify-center gap-2 rounded-full bg-[#6b0a35] px-5 py-2.5 text-sm font-semibold text-white! transition hover:brightness-110";

const LABEL = "mb-1.5 block text-sm font-medium text-[#2a2224]";
const LABEL_M = "mb-1.5 block text-[12.5px] font-semibold text-[#1f1819]";
const INPUT = "min-h-[44px] w-full rounded-[10px] border border-[#eee2d8] bg-[#fcf6f1] px-3.5 py-3 text-[13px] text-[#1f1819] placeholder:text-[#8f8487] focus:border-[#6b0a35] focus:outline-none";
const INPUT_M = "min-h-[42px] w-full rounded-[10px] border border-[#ddd5df] bg-white px-3 py-2.5 text-xs text-[#1f1819] placeholder:text-[#8f8487] focus:border-[#6b0a35] focus:outline-none";
const DATE_FIX = "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0";

const TONES = {
  gold: { text: "text-[#c9a55c]", bg: "bg-[#c9a55c]" },
  maroon: { text: "text-[#7b0a3c]", bg: "bg-[#7b0a3c]" },
  orange: { text: "text-[#c4510d]", bg: "bg-[#c4510d]" },
};
const MINI_TONES = {
  green: "bg-[#e3f4ec] text-[#2e9a6b]",
  gold: "bg-[#f7f0e0] text-[#c9a55c]",
  orange: "bg-[#fbe3d6] text-[#c4510d]",
};

/* ---------- Shared ---------- */
function Crumb({ go, current, embedded }) {
  const sep = <span className="mx-1.5 text-[#a79a9e]">›</span>;
  const link = "p-0 text-xs text-[#6f6366] hover:text-[#6b0a35]!";
  return (
    <nav className="flex flex-wrap items-center pb-3.5 pt-5 text-xs text-[#6f6366]" aria-label="Breadcrumb">
      {!embedded && <><Link className={link} to="/">Home</Link>{sep}</>}
      {current ? <button className={link} onClick={() => go("landing")}>Catering</button> : <b className="font-semibold text-[#6b0a35]" aria-current="page">Catering</b>}
      {current && <>{sep}<b className="font-semibold text-[#6b0a35]" aria-current="page">{current}</b></>}
    </nav>
  );
}

function Field({ label, error, icon, modal, onChange, ...p }) {
  const id = useId();
  const isTel = p.type === "tel";
  const isNum = p.type === "number";
  const isDate = p.type === "date";
  const handle = (e) => {
    if (isTel) return onChange({ target: { value: cleanPhone(e.target.value) } });
    if (isNum) return onChange({ target: { value: onlyDigits(e.target.value).slice(0, 4) } });
    return onChange(e);
  };
  const extra = isTel
    ? { inputMode: "numeric", maxLength: 10, autoComplete: "tel-national" }
    : isNum
    ? { type: "text", inputMode: "numeric", maxLength: 4, min: undefined }
    : isDate
    ? { min: todayISO() }
    : {};
  const msg = typeof error === "string" ? error : null;
  return (
    <div className="mb-4">
      <label htmlFor={id} className={modal ? LABEL_M : LABEL}>{label}</label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-[#4b4547]"><Icon name={icon} size={16} /></span>}
        <input
          id={id}
          className={cx(modal ? INPUT_M : INPUT, icon && "pl-[38px]", isDate && DATE_FIX, error && "border-red-600!")}
          aria-invalid={error ? true : undefined}
          aria-describedby={msg ? `${id}-err` : undefined}
          {...p}
          {...extra}
          onChange={handle}
        />
      </div>
      {msg && <p id={`${id}-err`} role="alert" className="mb-0 mt-1 text-[11px] text-red-600">{msg}</p>}
    </div>
  );
}

function SelectField({ label, children, ...p }) {
  const id = useId();
  return (
    <div className="mb-4">
      <label htmlFor={id} className={LABEL_M}>{label}</label>
      <div className="relative">
        <select
          id={id}
          className="min-h-[42px] w-full appearance-none rounded-[10px] border border-[#ddd5df] bg-white py-2.5 pl-3 pr-8 text-xs text-[#1f1819] focus:border-[#6b0a35] focus:outline-none disabled:bg-[#f3ece8] disabled:text-[#6f6366]"
          {...p}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6f6366]"><Icon name="chevron" size={12} /></span>
      </div>
    </div>
  );
}

function Switch({ on, onClick, label, small }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={cx("relative shrink-0 rounded-full transition-colors", small ? "h-[18px] w-[34px]" : "h-[22px] w-10", on ? "bg-[#6b0a35]" : "bg-[#d6cdc8]")}
    >
      <span
        className={cx(
          "absolute left-[3px] top-[3px] rounded-full bg-white transition-transform",
          small ? "size-3" : "size-4",
          on && (small ? "translate-x-4" : "translate-x-[18px]")
        )}
      />
    </button>
  );
}

function Radios({ name, value, onChange, labelId }) {
  return (
    <div className="flex gap-4 text-[13px]" role="radiogroup" aria-labelledby={labelId}>
      {["yes", "no"].map((v) => (
        <label key={v} className="flex items-center gap-1.5 text-[13px] font-normal">
          <input type="radio" className="accent-[#6b0a35]" name={name} checked={value === v} onChange={() => onChange(v)} />
          {v === "yes" ? "Yes" : "No"}
        </label>
      ))}
    </div>
  );
}

function WhatsAppRow({ on, setOn }) {
  return (
    <div className="mb-3.5 mt-[18px] flex items-center gap-2.5 rounded-xl border border-[#ecdccf] bg-[#fcf4ee] px-3 py-2.5">
      <span className="flex text-[#4b4547]"><Icon name="chat" size={16} /></span>
      <span className="flex flex-1 flex-col gap-px">
        <b className="text-[12.5px] font-bold text-[#1f1819]">Notify me on WhatsApp</b>
        <small className="text-[10.5px] text-[#6f6366]">We'll send quote there</small>
      </span>
      <Switch on={on} onClick={() => setOn(!on)} label="Notify on WhatsApp" />
    </div>
  );
}

/* Send Enquiry + Call Us (icon and label always on one centred line) */
function SummaryActions({ onSend }) {
  return (
    <>
      <button className="block w-full rounded-[10px] bg-[#6d0a38] py-3.5 text-[15px] font-bold text-white transition hover:brightness-110" onClick={onSend}>
        Send Enquiry
      </button>
      <a
        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-[10px] bg-white py-3.5 text-[13px] font-semibold text-[#1f1819]! shadow-[inset_0_0_0_1px_#d9d2cd] transition hover:bg-[#faf7f4]"
        href={`tel:${PHONE.replace(/\s/g, "")}`}
      >
        <Icon name="phone" size={15} />
        Call Us
      </a>
    </>
  );
}

const SUMMARY = "rounded-2xl bg-white px-6 pb-[22px] pt-[26px] shadow-[0_2px_14px_rgba(60,40,30,.06)] min-[900px]:sticky min-[900px]:top-4";
const NOTE = "mb-0 pt-4 text-center text-[11px] leading-normal text-[#4b4547]";
const TOAST = "mb-2.5 rounded-[10px] bg-[#e7f6ec] p-2.5 text-[13px] text-[#14532d]";

/* ---------- Success popup: "Enquiry Sent" after Send Enquiry, "Quote Request" variant for the detailed quote form ---------- */
function SuccessModal({ onClose, quote }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center bg-[rgba(35,26,29,.55)] p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="w-full max-w-[400px] rounded-[18px] bg-white px-6 pb-6 pt-7 text-center shadow-[0_24px_60px_rgba(35,26,29,.35)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* maroon check inside a thin ring */}
        <div className="mx-auto mb-4 grid size-[60px] place-items-center rounded-full shadow-[inset_0_0_0_1.5px_#6b0a35]">
          <span className="grid size-[46px] place-items-center rounded-full bg-[#6b0a35] text-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
        </div>
        <h3 id="success-title" className="mb-3 text-[22px] font-bold leading-[1.25] text-[#1f1819]">
          {quote ? "Quote Request Submitted Successfully!" : "Enquiry Sent Successfully!"}
        </h3>
        <p className="mb-2 text-xs leading-[1.6] text-[#3f3a3c]">
          Thank you for choosing <b className="font-bold text-[#6b0a35]">Evenddy</b>. We've received your {quote ? "request" : "enquiry"} and our team will review your requirements.
        </p>
        <p className="mb-5 text-[11.5px] leading-[1.6] text-[#6f6366]">
          {quote ? "Our team will get in touch with you shortly to discuss your requirements and provide the quote." : "Our team will get in touch with you shortly to confirm the details."}
        </p>
        <button
          autoFocus
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#6b0a35] py-3 text-[13px] font-semibold text-white transition hover:brightness-110"
          onClick={onClose}
        >
          Continue Browsing →
        </button>
      </div>
    </div>
  );
}

/* ---------- Order summary (Meal Box + Delivery Box) ---------- */
function OrderSummary({ lines, submitLines, total, onRemove, showGuests, showDelivery, header, bold }) {
  const [form, setForm] = useState({ name: "", phone: "", guests: "", date: "", delivery: "yes", serving: "no", location: "", wa: true });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors((x) => ({ ...x, [k]: undefined })); };

  const send = () => {
    const items = lines.length ? lines : submitLines || [];
    const e = {};
    Object.assign(e, checkBasics(form));
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
    <aside className={SUMMARY}>
      <h3 className={cx("mb-4 border-b border-[#e6dfda] pb-3.5 text-[28px] text-[#1f1819]", bold ? "font-semibold" : "font-medium")}>Order Summary</h3>
      <div className="mb-2.5 text-[12.5px] font-bold text-[#1f1819]">Items list</div>
      {lines.length === 0 ? (
        <div className={cx("mb-[18px] grid h-[68px] place-items-center rounded-xl bg-[#f8f5f3] px-4 text-center text-[15px] font-medium text-[#1f1819]", errors.items && "outline outline-red-600")}>
          No items added
        </div>
      ) : (
        <div className="mb-[18px] rounded-xl bg-[#f8f5f3] px-3 py-2 text-[13px]">
          {lines.map((l) => (
            <div className="flex items-start justify-between gap-2 border-b border-[#ece5e0] px-0.5 py-2" key={l.key}>
              <div className="flex flex-1 flex-col gap-0.5 font-medium">
                <span>{l.name}</span>
                {l.sub && <small className="text-[11px] font-normal leading-snug text-[#6f6366]">{l.sub}</small>}
              </div>
              <span className="whitespace-nowrap">× {l.qty}</span>
              {onRemove && !l.fixed && <button className="text-[#6f6366]" aria-label={`Remove ${l.name}`} onClick={() => onRemove(l.key)}>✕</button>}
            </div>
          ))}
          {total ? <div className="px-0.5 pb-1 pt-2 text-xs text-[#6f6366]">Estimated <b className="text-sm text-[#6b0a35]">₹{total.toLocaleString("en-IN")}</b> onwards</div> : null}
        </div>
      )}

      <Field label="Name" placeholder="Enter your name" value={form.name} onChange={set("name")} error={errors.name} />
      <Field label="Phone Number" type="tel" placeholder="Enter phone number" value={form.phone} onChange={set("phone")} error={errors.phone} />
      {showGuests && <Field label="Number of Guests" type="number" min="1" placeholder="Enter guest count" value={form.guests} onChange={set("guests")} error={errors.guests} />}
      <Field label="Event Date" type="date" icon="calendar" value={form.date} onChange={set("date")} error={errors.date} />
      {showDelivery && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <span id="lab-delivery" className="text-sm font-medium text-[#2a2224]">Delivery Required ?</span>
          <Radios name="delivery" value={form.delivery} onChange={(v) => setForm({ ...form, delivery: v })} labelId="lab-delivery" />
        </div>
      )}
      {(!showDelivery || form.delivery === "yes") && (
        <Field label="Delivery location/city" icon="pin" placeholder="Enter city or area" value={form.location} onChange={set("location")} />
      )}
      {showDelivery && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <span id="lab-serving" className="text-sm font-medium text-[#2a2224]">Serving Required?</span>
          <Radios name="serving" value={form.serving} onChange={(v) => setForm({ ...form, serving: v })} labelId="lab-serving" />
        </div>
      )}
      <WhatsAppRow on={form.wa} setOn={(v) => setForm({ ...form, wa: v })} />
      <SummaryActions onSend={send} />
      {sent && <SuccessModal onClose={() => setSent(false)} />}
      <p className={NOTE}>No payment required now. Our team will contact you to confirm details.</p>
    </aside>
  );
}

/* ---------- Menu list ---------- */
function MenuList({ items, qtyById, toggle, cta = "Add", ctaOn = "Added", compact }) {
  if (!items.length) return <p className="mb-0 text-sm leading-[1.7] text-[#6f6366]">No items here yet. Try switching on "Include Non-Veg".</p>;
  return (
    <div className="grid grid-cols-1 gap-x-3.5 gap-y-2.5 min-[900px]:grid-cols-2">
      {items.map((m) => {
        const on = !!qtyById[m.id];
        return (
          <div
            key={m.id}
            className={cx("flex items-center gap-2.5 bg-[#fdf3ef] text-[#1f1819]", compact ? "rounded-lg px-3.5 py-[13px] text-[12.5px] font-medium" : "rounded-[10px] px-3 py-2.5 text-[13px] font-semibold")}
          >
            <span className={cx("size-[7px] shrink-0 rounded-full", m.veg ? "bg-[#16a34a] shadow-[0_0_0_3px_rgba(22,163,74,.16)]" : "bg-[#e11d48] shadow-[0_0_0_3px_rgba(225,29,72,.16)]")} aria-hidden="true" />
            <span className="flex-1">{m.name}</span>
            <button
              onClick={() => toggle(m)}
              className={cx(
                "font-bold",
                compact ? "rounded-md px-[18px] py-1.5 text-[10px]" : "rounded-[7px] px-5 py-[7px] text-[11px]",
                on ? "bg-[#6b0a35] text-white shadow-[inset_0_0_0_1px_#6b0a35]" : "bg-white text-[#6b0a35] shadow-[inset_0_0_0_1px_#e6d9d2]"
              )}
            >
              {on ? ctaOn : cta}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* Pure Veg  ⇄  Include Non-Veg */
function VegToggle({ nonVeg, setNonVeg }) {
  const dot = (c) => <span className={cx("mr-1.5 inline-block size-[7px] rounded-full align-middle", c)} />;
  return (
    <div className="flex items-center gap-2.5 rounded-full bg-[#f6efec] px-3.5 py-2 text-[11px] text-[#3a2a2c]">
      <span>{dot("bg-[#16a34a]")}Pure Veg</span>
      <Switch small on={nonVeg} onClick={() => setNonVeg(!nonVeg)} label="Include non-veg" />
      <span>{dot("bg-[#e11d48]")}Include Non-Veg</span>
    </div>
  );
}

const Tab = ({ on, small, ...p }) => (
  <button
    className={cx("rounded-full text-xs font-medium transition-colors", small ? "px-[18px] py-2" : "px-[18px] py-[9px] text-[12.5px]", on ? "bg-[#5b0a2e] text-white" : "bg-[#f4e8e5] text-[#3a2a2c] hover:bg-[#efdcd7]")}
    {...p}
  />
);

/* ---------- Change Item popup (Meal Box) ---------- */
/* Dish photo; falls back to the slot icon tile when there is no image (or it fails to load) */
function DishThumb({ name, icon }) {
  const [failed, setFailed] = useState(false);
  const src = DISH_IMG[name];
  if (!src || failed) {
    return (
      <div className="grid size-[42px] shrink-0 place-items-center rounded-lg bg-[#ebe5e2] text-[#5b4a4c]">
        <Icon name={icon} size={20} />
      </div>
    );
  }
  return <img src={src} alt="" className="size-[42px] shrink-0 rounded-lg object-cover" onError={() => setFailed(true)} />;
}

function ChangeItemModal({ slot, currentName, nonVeg, onClose, onConfirm }) {
  const [pending, setPending] = useState(currentName);
  const options = slot.options.filter((o) => nonVeg || o.v);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-[rgba(35,26,29,.55)] p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="flex max-h-[88vh] w-full max-w-[440px] flex-col overflow-hidden rounded-[18px] bg-[#fdfaf7] shadow-[0_24px_60px_rgba(35,26,29,.35)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-item-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#e8e1dc] px-5 pb-3.5 pt-5">
          <div>
            <h3 id="change-item-title" className="mb-0.5 text-xl font-semibold leading-tight text-[#1f1819]">Change Item</h3>
            <p className="mb-0 text-xs text-[#4b4547]">Replacing {currentName}</p>
          </div>
          <button className="grid size-8 place-items-center rounded-full text-[#1f1819] hover:bg-[#f1ebe7]" aria-label="Close" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* info banner */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 rounded-lg bg-[#ede4ef] px-3 py-2.5 text-xs font-medium text-[#5b0a2e] shadow-[inset_0_0_0_1px_#dccbe0]">
            <Icon name="info" size={14} />
            Choose alternative item for your Meal Box.
          </div>
        </div>

        {/* options */}
        <div className="flex-1 overflow-y-auto px-5 py-4" role="radiogroup" aria-label="Alternative items">
          <div className="flex flex-col gap-2.5">
            {options.map((o) => {
              const isCurrent = o.n === currentName;
              const isPending = o.n === pending;
              return (
                <div
                  key={o.n}
                  role="radio"
                  aria-checked={isPending}
                  tabIndex={0}
                  onClick={() => setPending(o.n)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setPending(o.n))}
                  className={cx(
                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus:outline-none",
                    isPending
                      ? "bg-[#f9eef2] shadow-[inset_0_0_0_2px_#6b0a35]"
                      : "bg-[#fcf9f6] shadow-[inset_0_0_0_1px_#e3dcd7] hover:bg-[#f8f2ee] focus-visible:shadow-[inset_0_0_0_2px_#6b0a35]"
                  )}
                >
                  <DishThumb name={o.n} icon={slot.icon} />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[13px] font-medium leading-tight text-[#1f1819]">{o.n}</span>
                    {isCurrent && <small className="text-[10px] font-bold uppercase tracking-[.06em] text-[#6b0a35]">Current selection</small>}
                  </div>
                  {isPending ? (
                    <span className="flex text-[#6b0a35]"><Icon name="checkCircle" size={20} /></span>
                  ) : (
                    <button
                      type="button"
                      className="rounded-full bg-white px-[18px] py-[5px] text-[11px] font-semibold text-[#6b0a35] shadow-[inset_0_0_0_1px_#6b0a35] transition-colors hover:bg-[#fbeef2]"
                      onClick={(e) => { e.stopPropagation(); setPending(o.n); }}
                    >
                      Select
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* footer */}
        <div className="grid grid-cols-2 gap-3 border-t border-[#e8e1dc] bg-[#fdfaf7] px-5 pb-5 pt-4">
          <button className="rounded-lg bg-[#efecea] py-3 text-[13px] font-semibold text-[#2a2224] transition-colors hover:bg-[#e6e2df]" onClick={onClose}>Cancel</button>
          <button className="rounded-lg bg-[#6b0a35] py-3 text-[13px] font-semibold text-white transition hover:brightness-110" onClick={() => onConfirm(pending)}>Confirm Change</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Landing ---------- */
function Landing({ go, embedded }) {
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
      <div className={WRAP}>
        <Crumb go={go} embedded={embedded} />
        <section className="pb-[46px] pt-3.5 text-center">
          <p className="mb-[22px] inline-block rounded-full bg-[#f7f0e0] px-[18px] py-[7px] text-[11px] font-semibold tracking-[.14em] text-[#c9a55c]">OUR CATERING SERVICES</p>
          <h1 className="mb-4 text-[clamp(32px,4.6vw,48px)] font-normal! leading-[1.1] tracking-[-.02em]! text-[#1f1819]">
            Catering for every <span className="text-[#8c0b4b]">Celebration.</span>
          </h1>
          <p className="mb-0 text-base text-[#4b4547]">Choose the catering experience that best fits your event.</p>
        </section>

        <div className="mx-auto grid max-w-[820px] gap-10 pb-2 pt-6 min-[860px]:gap-16">
          {options.map((o) => {
            const t = TONES[o.tone];
            return (
              <article key={o.id} className={cx("grid items-stretch", o.flip ? "min-[860px]:grid-cols-[1fr_300px]" : "min-[860px]:grid-cols-[300px_1fr]")}>
                <div
                  className={cx("relative z-[1] min-h-[240px] rounded-t-2xl bg-cover bg-center shadow-[0_14px_30px_rgba(60,30,20,.22)] min-[860px]:-my-6 min-[860px]:min-h-[300px] min-[860px]:rounded-[14px]", o.flip && "min-[860px]:order-2")}
                  role="img"
                  aria-label={o.title}
                  style={{ backgroundImage: `url(${o.img})` }}
                />
                <div
                  className={cx(
                    "relative flex flex-col justify-center gap-2.5 overflow-hidden rounded-b-2xl bg-white px-6 py-7 shadow-[0_6px_24px_rgba(60,30,20,.08)] min-[860px]:px-10 min-[860px]:py-10",
                    o.flip ? "min-[860px]:rounded-[16px_0_0_16px]" : "min-[860px]:rounded-[0_16px_16px_0]"
                  )}
                >
                  <div className={cx("absolute inset-x-0 top-0 h-0.5", t.bg)} />
                  <span className={cx("flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.1em]", t.text)}>
                    <Icon name={o.icon} size={15} />{o.eyebrow}
                  </span>
                  <div className="flex flex-wrap items-center gap-3.5">
                    <h2 className="mb-0 text-[27px] font-semibold! leading-tight tracking-[-.01em]! text-[#1a1516]">{o.title}</h2>
                    {o.price && <span className="rounded-full bg-[#fbe3d6] px-4 py-2 text-[13px] font-semibold text-[#c4510d]">{o.price}</span>}
                  </div>
                  <div className="flex flex-col gap-3.5">
                    {o.paras.map((p) => <p key={p} className="mb-0 text-sm leading-[1.7] text-[#3f3a3c]">{p}</p>)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {o.chips.map(([ic, tx]) => <span key={tx} className={CHIP}><Icon name={ic} size={12} />{tx}</span>)}
                  </div>
                  <button className={cx("mt-4 self-start rounded-full px-7 py-[13px] text-[13px] font-semibold text-white transition hover:brightness-110", t.bg)} onClick={() => go(o.id)}>
                    {o.cta}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <h2 className="mb-[26px] pt-16 text-center text-[22px] font-medium text-[#1f1819] min-[860px]:pt-24">Choose the right catering experience</h2>
        <div className="mx-auto grid max-w-[820px] gap-[18px] min-[860px]:grid-cols-3">
          {picks.map(([ic, t, d, id, tone]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="flex flex-col items-start gap-1.5 rounded-[14px] bg-white px-5 pb-6 pt-[22px] text-left text-inherit shadow-[inset_0_0_0_1px_#ece3da] transition hover:-translate-y-[3px] hover:shadow-[inset_0_0_0_1px_#ece3da,0_10px_24px_rgba(60,30,20,.1)] motion-reduce:transition-none"
            >
              <span className={cx("mb-2 grid size-10 place-items-center rounded-[10px]", MINI_TONES[tone])}><Icon name={ic} size={20} /></span>
              <h4 className="mb-0 text-[15px] font-semibold text-[#1a1516]">{t}</h4>
              <p className="mb-0 text-xs leading-[1.55] text-[#6f6366]">{d}</p>
            </button>
          ))}
        </div>
      </div>

      {/* CTA band: mb-0 so it sits flush against the footer */}
      <section className="relative mb-0 mt-[72px] overflow-hidden bg-[linear-gradient(120deg,#6f0a3e_0%,#860b4c_60%,#8f0c52_100%)] px-6 py-16 text-center text-white">
        <div className="pointer-events-none absolute -right-[70px] -top-[90px] size-[300px] rounded-full bg-[rgba(212,0,95,.38)]" />
        <div className="pointer-events-none absolute -bottom-[120px] -left-20 size-[280px] rounded-full bg-[rgba(212,0,95,.22)]" />
        <h3 className="relative z-[1] mb-2 text-[28px] font-normal">Let's plan your event with perfect choice.</h3>
        <p className="relative z-[1] mb-6 opacity-85">Need help deciding? Our team will guide you.</p>
        <div className="relative z-[1] flex flex-wrap justify-center gap-3">
          <Link className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#6b0a35]!" to="/plan-event">Get a Quote</Link>
          <a className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white! shadow-[inset_0_0_0_1px_#fff]" href={`tel:${PHONE.replace(/\s/g, "")}`}>Call us</a>
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
  const [touched, setTouched] = useState(false);
  const [size, setSize] = useState(0);
  const [picks, setPicks] = useState(MEALBOX_SLOTS.map(() => 0));
  const [guests, setGuests] = useState(10);
  const [extra, setExtra] = useState({});
  const [swapSlot, setSwapSlot] = useState(null); // index of the slot being changed (null = popup closed)

  const slotCount = BOX_SIZES[size].items;
  const current = (i) => {
    const o = MEALBOX_SLOTS[i].options;
    const c = o[picks[i]];
    return !nonVeg && !c.v ? o.find((x) => x.v) : c;
  };
  const confirmSwap = (name) => {
    const i = swapSlot;
    const idx = MEALBOX_SLOTS[i].options.findIndex((x) => x.n === name);
    if (idx >= 0) setPicks((p) => p.map((v, k) => (k === i ? idx : v)));
    setTouched(true);
    setSwapSlot(null);
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
    <div className={WRAP}>
      <Crumb go={go} current="Meal Box" embedded={embedded} />
      <div className="mb-[22px] flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-[0_2px_14px_rgba(60,40,30,.06)] min-[560px]:px-4 min-[560px]:py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((t) => <Tab key={t} on={tab === t} onClick={() => setTab(t)}>{t}</Tab>)}
        </div>
        <VegToggle nonVeg={nonVeg} setNonVeg={setNonVeg} />
      </div>

      <div className={LAYOUT}>
        <div>
          {tab === "Meal Box" ? (
            <>
              <section className={PANEL}>
                <div className={STEP}>STEP 01</div>
                <h3 className={H3}>Choose your box size</h3>
                <div className="grid grid-cols-1 gap-1 rounded-[14px] bg-[#f4f2f0] p-1.5 min-[560px]:grid-cols-3">
                  {BOX_SIZES.map((b, i) => (
                    <button
                      key={b.items}
                      aria-pressed={size === i}
                      onClick={() => pickSize(i)}
                      className={cx("grid grid-cols-[1fr_auto] items-end gap-y-1 rounded-[10px] px-3.5 pb-3 pt-3.5 text-left text-[#2a2224]", size === i ? "bg-[#fbece6] shadow-[0_2px_8px_rgba(80,40,30,.14)]" : "bg-transparent")}
                    >
                      <small className="col-span-full text-[13px]">{b.items} Items Box</small>
                      <b className="text-[22px] font-bold leading-[1.1] text-[#1f1819]">₹{b.price}</b>
                      <em className="text-[10px] not-italic text-[#6f6366]">{b.note}</em>
                    </button>
                  ))}
                </div>
              </section>

              <section className={PANEL}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><div className={STEP}>STEP 02</div><h3 className={H3}>Your Selected Box Items</h3></div>
                  <span className="mt-2 text-[10.5px] text-[#4b4547]">Tap "Change" to swap</span>
                </div>
                {MEALBOX_SLOTS.slice(0, slotCount).map((s, i) => {
                  const c = current(i);
                  return (
                    <div className="mb-2.5 flex items-center gap-3 rounded-xl bg-[#fdf3ef] px-4 py-3" key={i}>
                      <span role="img" aria-label={c.v ? "Veg" : "Non-veg"} className={cx("size-[7px] shrink-0 rounded-full", c.v ? "bg-[#16a34a] shadow-[0_0_0_3px_rgba(22,163,74,.16)]" : "bg-[#e11d48] shadow-[0_0_0_3px_rgba(225,29,72,.16)]")} />
                      <div className="grid size-[38px] shrink-0 place-items-center rounded-[9px] bg-[#ebe5e2] text-[#5b4a4c]"><Icon name={s.icon} size={18} /></div>
                      <span className="flex-1 text-[13px] font-medium text-[#1f1819]">{c.n}</span>
                      <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6b0a35]" onClick={() => setSwapSlot(i)}><Icon name="swap" size={13} />Change</button>
                    </div>
                  );
                })}
              </section>

              <section className={PANEL}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><div className={STEP}>STEP 03</div><h3 className={H3}>Number of Guests / Box Quantity</h3></div>
                  <span className="mt-2 text-[10.5px] text-[#4b4547]">Min. 10 Boxes</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#fdf3ef] px-5 py-[18px]">
                  <div>
                    <b className="mb-1 block text-[13.5px] text-[#1f1819]">How many guests are attending?</b>
                    <small className="block max-w-[300px] text-[11px] leading-normal text-[#6f6366]">Every box is packed fresh 45 minutes prior to requested arrival time.</small>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-xl bg-[#efe8e4] p-1.5">
                      <button className="size-[34px] rounded-[9px] bg-white text-lg text-[#3a2a2c] shadow-[0_1px_3px_rgba(0,0,0,.08)]" aria-label="Decrease" onClick={() => setGuestCount((g) => Math.max(10, g - 5))}>−</button>
                      <strong className="min-w-[50px] text-center text-[22px] font-bold text-[#1f1819]">{guests}</strong>
                      <button className="size-[34px] rounded-[9px] bg-white text-lg text-[#3a2a2c] shadow-[0_1px_3px_rgba(0,0,0,.08)]" aria-label="Increase" onClick={() => setGuestCount((g) => g + 5)}>+</button>
                    </div>
                    <span className="text-[13px] text-[#3a2a2c]">Boxes</span>
                  </div>
                </div>
                <div className="mt-[18px] flex flex-wrap items-center gap-2 text-[11px] text-[#6f6366]">
                  <span>Quick Presets:</span>
                  {[10, 25, 50, 100, 250].map((n) => (
                    <button key={n} className={cx("rounded-full px-3.5 py-[7px] text-[11.5px] font-medium", guests === n ? "bg-[#5b0a2e] text-white" : "bg-[#f6ebe7] text-[#3a2a2c]")} onClick={() => setGuestCount(() => n)}>{n} Boxes</button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className={PANEL}>
              <h3 className={H3}>Available Menu</h3>
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

      {swapSlot !== null && (
        <ChangeItemModal
          key={swapSlot}
          slot={MEALBOX_SLOTS[swapSlot]}
          currentName={current(swapSlot).n}
          nonVeg={nonVeg}
          onClose={() => setSwapSlot(null)}
          onConfirm={confirmSwap}
        />
      )}
    </div>
  );
}

/* ---------- Delivery Box ---------- */
function DeliveryBox({ go, embedded }) {
  const FILTERS = ["All", "Breakfast", "Tea/Snacks", "Starters"];
  const [filter, setFilter] = useState("All");
  const [nonVeg, setNonVeg] = useState(false);
  const [sel, setSel] = useState({});
  const toggle = (m) => setSel((s) => { const n = { ...s }; n[m.id] ? delete n[m.id] : (n[m.id] = m); return n; });
  const items = MENU.filter((m) => (filter === "All" || m.cat === filter) && (nonVeg || m.veg));
  const lines = Object.values(sel).map((m) => ({ key: m.id, name: m.name, qty: 1 }));

  return (
    <div className={WRAP}>
      <Crumb go={go} current="Delivery Box" embedded={embedded} />
      <div className={LAYOUT}>
        <section className="mb-5 rounded-2xl bg-white p-6 shadow-[0_2px_14px_rgba(60,40,30,.06)]">
          <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3 border-b border-[#ece5e0] pb-3.5">
            <h3 className="mb-0 text-xl font-semibold text-[#1f1819]">Available Menu</h3>
            <VegToggle nonVeg={nonVeg} setNonVeg={setNonVeg} />
          </div>
          <div className="mb-[18px] flex flex-wrap items-center gap-2">
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
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors((x) => ({ ...x, [k]: undefined })); };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const validate = () => {
    const e = {};
    Object.assign(e, checkBasics(form));
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

  const grid2 = "grid grid-cols-1 gap-x-[18px] min-[560px]:grid-cols-2";

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center overflow-auto bg-[rgba(35,26,29,.55)] p-4" onClick={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-[600px] flex-col overflow-hidden rounded-[22px] bg-[#fdf8f4] shadow-[0_24px_60px_rgba(35,26,29,.35)]" role="dialog" aria-modal="true" aria-label="Request Quote" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3.5 px-5 pb-3.5 pt-6 min-[560px]:px-7">
          <h3 className="mb-0 text-[22px] font-semibold text-[#1f1819]">Request Quote</h3>
          <span className="ml-auto flex items-center gap-2.5 text-[11px] font-semibold tracking-[.04em] text-[#3a2a2c]">
            VEG ONLY<Switch on={vegOnly} onClick={() => setVegOnly(!vegOnly)} label="Veg only" />
          </span>
          <button className="text-base text-[#4b4547]" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="flex-1 overflow-auto px-5 pb-2 min-[560px]:px-7">
          <div className={grid2}>
            <Field modal label="Name" placeholder="Enter your name" value={form.name} onChange={set("name")} error={errors.name} />
            <Field modal label="Phone No." type="tel" placeholder="Enter phone number" value={form.phone} onChange={set("phone")} error={errors.phone} />
            <SelectField label="Cuisine type" value={form.cuisine} onChange={set("cuisine")}><option value="">Select cuisine</option>{CUISINES.map((x) => <option key={x}>{x}</option>)}</SelectField>
            <SelectField label="Plate Price" value={form.plate} onChange={set("plate")}><option value="">Select price</option>{PLATE_PRICES.map((x) => <option key={x}>{x}</option>)}</SelectField>
            <Field modal label="No. of Guests" type="number" min="1" placeholder="Guest count" value={form.guests} onChange={set("guests")} error={errors.guests} />
            <Field modal label="Event date" type="date" icon="calendar" value={form.date} onChange={set("date")} error={errors.date} />
            <SelectField label="Food type" value={vegOnly ? "Veg" : form.foodType} disabled={vegOnly} onChange={set("foodType")}><option value="">Select type</option>{FOOD_TYPES.map((x) => <option key={x}>{x}</option>)}</SelectField>
            <Field modal label="Event location" icon="pin" placeholder="City / area" value={form.location} onChange={set("location")} />
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <span id="lab-counter" className="text-[12.5px] font-semibold text-[#1f1819]">Use Counter?</span>
            <Radios name="counter" value={form.counter} onChange={(v) => setForm({ ...form, counter: v })} labelId="lab-counter" />
          </div>

          <h4 className="mb-3 pt-4 text-xl font-bold text-[#1f1819]">Menu</h4>
          <div className={grid2}>
            {Object.entries(FULL_MENU).map(([cat, opts]) => (
              <SelectField key={cat} label={cat} value={menu[cat] || ""} onChange={(e) => setMenu({ ...menu, [cat]: e.target.value })}>
                <option value="">Select type</option>
                {opts.filter((o) => !vegOnly || o.veg).map((o) => <option key={o.n}>{o.n}</option>)}
              </SelectField>
            ))}
          </div>

          {sent && <SuccessModal quote onClose={onClose} />}
        </div>

        <div className="grid grid-cols-1 gap-3.5 border-t border-[#eadfd8] bg-[#fdf8f4] px-5 pb-5 pt-4 min-[560px]:grid-cols-2 min-[560px]:px-7">
          <button className="flex items-center justify-center gap-2 rounded-lg bg-white py-3.5 text-sm font-bold text-[#1f9d55] shadow-[inset_0_0_0_1.5px_#25b866]" onClick={whatsapp}>
            <Icon name="chat" size={16} />Continue on WhatsApp
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg bg-[#6b0a35] py-3.5 text-sm font-bold text-white transition hover:brightness-110" onClick={request}>Request Quote</button>
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
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors((x) => ({ ...x, [k]: undefined })); };

  const send = () => {
    const e = {};
    Object.assign(e, checkBasics(form));
    setErrors(e);
    if (Object.keys(e).length) return;
    const msg = buildMsg("Full catering enquiry", [["Name", form.name], ["Phone", form.phone], ["Guests", form.guests], ["Event date", form.date], ["Location", form.location]]);
    if (form.wa) window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
  };

  return (
    <aside className={SUMMARY}>
      <h3 className="mb-[18px] border-b border-[#e6dfda] pb-3.5 text-[26px] font-semibold text-[#1f1819]">Request Quote</h3>
      <Field label="Name" placeholder="Enter your name" value={form.name} onChange={set("name")} error={errors.name} />
      <Field label="Phone Number" type="tel" placeholder="Enter phone number" value={form.phone} onChange={set("phone")} error={errors.phone} />
      <Field label="Number of Guests" type="number" min="1" placeholder="Enter guest count" value={form.guests} onChange={set("guests")} error={errors.guests} />
      <Field label="Event Date" type="date" icon="calendar" value={form.date} onChange={set("date")} error={errors.date} />
      <Field label="Event location/city" icon="pin" placeholder="Enter city or area" value={form.location} onChange={set("location")} />
      <WhatsAppRow on={form.wa} setOn={(v) => setForm({ ...form, wa: v })} />
      <SummaryActions onSend={send} />
      {sent && <SuccessModal onClose={() => setSent(false)} />}
      <button className="mx-auto mt-3 flex text-[13px] font-medium text-[#6b0a35]" onClick={onOpenDetailed}>Customise menu &amp; get a detailed quote</button>
      <p className={NOTE}>No payment required now. Our team will contact you to confirm details.</p>
    </aside>
  );
}

function FullCatering({ go, embedded }) {
  const TABS = [["about", "About"], ["portfolio", "Portfolio (140)"], ["reviews", "Reviews (84)"]];
  const [tab, setTab] = useState("about");
  const [modal, setModal] = useState(false);

  const share = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: "Evenddy Full Catering Service", url }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
  };

  return (
    <div className={WRAP}>
      <Crumb go={go} current="Full Catering" embedded={embedded} />
      <div className={LAYOUT}>
        <div>
          {/* hero photo + title card are one joined block */}
          <div className="aspect-[16/7] min-h-[180px] rounded-t-[14px] bg-cover bg-center min-[860px]:min-h-[200px]" role="img" aria-label="Evenddy Full catering" style={{ backgroundImage: `url(${IMG.full})` }} />
          <div className="mb-3.5 rounded-b-[14px] bg-white px-[22px] pb-4 pt-[18px] shadow-[0_2px_14px_rgba(60,40,30,.06)]">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="mb-0 text-2xl font-medium tracking-[-.01em]! text-[#5b0a2e]">Evenddy Full Catering Service</h1>
              <span className="rounded-full bg-[#efedeb] px-2.5 py-1 text-[10.5px] font-medium text-[#4b4547]">Evenddy Certified</span>
              <button className="ml-auto grid size-[34px] place-items-center rounded-full bg-[#fbeee8] text-[#4b4547] hover:bg-[#f6e0d6]" type="button" aria-label="Share" onClick={share}>
                <Icon name="share" size={16} />
              </button>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-[18px] gap-y-1.5 text-[12.5px] text-[#3f3a3c]">
              <span className="inline-flex items-center gap-1.5"><Icon name="star" size={13} /><b className="font-semibold text-[#1f1819]">4.9</b><small className="text-[11.5px] text-[#6f6366]">(84 verified reviews)</small></span>
              <span className="inline-flex items-center gap-1.5"><Icon name="pin" size={13} />Vizag, Andhra Pradesh, India</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="people" size={13} />120+ Grand Celebrations Served</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="bolt" size={13} />Avg. Response: 12 hrs</span>
            </div>
          </div>

          {/* underline tabs on a soft peach strip */}
          <div className="mb-[18px] flex gap-[18px] overflow-x-auto rounded-xl bg-[#fdf1ec] px-4 shadow-[0_2px_14px_rgba(60,40,30,.05)] min-[560px]:gap-[26px] min-[560px]:px-[22px]" role="tablist">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cx("whitespace-nowrap pb-[11px] pt-3.5 text-[12.5px]", tab === id ? "font-semibold text-[#6b0a35] shadow-[inset_0_-2px_0_#6b0a35]" : "font-medium text-[#3a2a2c] hover:text-[#6b0a35]")}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "about" && (
            <section className={PANEL}>
              <div className={STEP_PINK}>ABOUT</div>
              <h3 className="mb-3.5 text-xl font-medium text-[#5b0a2e]">Evenddy Full Catering Service</h3>
              <p className="mb-[22px] text-[13.5px] leading-[1.75] text-[#3f3a3c]">Evenddy Full Catering Service delivers end-to-end dining with a wide range of multi-cuisine menus: Indian, Continental, Chinese, Mexican and Lebanese, from intimate gatherings to large-scale celebrations. We take care of everything from menu planning to live counters, serving staff and setup so your guests experience a seamless, flavourful occasion.</p>
              <div className={STEP_PINK}>CUISINES &amp; SERVICES</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {SERVICE_TAGS.map((t) => <span className="inline-flex items-center rounded-full bg-[#f6e9e4] px-3.5 py-[7px] text-[11px] font-medium text-[#3a2a2c]" key={t}>{t}</span>)}
              </div>
              <div className="mt-[22px] grid gap-3 min-[860px]:grid-cols-3">
                {[["500+", "Events Catered", "text-[#5b0a2e]"], ["15+", "Cuisine Types", "text-[#8a5a1f]"], ["3", "Price Ranges", "text-[#5b0a2e]"]].map(([n, l, c]) => (
                  <div key={l} className="flex flex-col gap-[3px] rounded-xl bg-[#fbeee8] px-4 py-[18px]">
                    <b className={cx("block text-[26px] font-medium leading-[1.15]", c)}>{n}</b>
                    <span className="text-[11.5px] leading-snug text-[#6f6366]">{l}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(tab === "about" || tab === "portfolio") && (
            <section className={PANEL}>
              <div className={STEP_PINK}>OUR CELEBRATIONS</div>
              <h3 className="mb-3.5 text-xl font-medium text-[#5b0a2e]">Portfolio Gallery (140)</h3>
              <div className="grid grid-cols-1 gap-2.5 min-[560px]:grid-cols-2">
                {GALLERY.map((src, i) => <div key={i} className="aspect-[4/3] rounded-lg bg-cover bg-center" role="img" aria-label={`Portfolio ${i + 1}`} style={{ backgroundImage: `url(${src})` }} />)}
              </div>
              <div className="mt-[18px] text-center">
                <button className="inline-flex items-center gap-2 rounded-full bg-[#f6e9e4] px-6 py-3 text-[13px] font-semibold text-[#5b0a2e] transition-colors hover:bg-[#f1ddd6]">
                  Explore Entire Gallery (140 Images) →
                </button>
              </div>
            </section>
          )}

          {tab === "reviews" && (
            <section className={PANEL}>
              <h3 className="mb-3.5 text-xl font-medium text-[#5b0a2e]">Reviews (84)</h3>
              {REVIEWS.map((r) => (
                <div className="mb-2.5 flex flex-col items-start gap-1 rounded-xl bg-[#fdf3ef] px-4 py-3 text-[13px]" key={r.who}>
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

/* ---------- Page ---------- */
export default function CateringExplore({ embedded = false }) {
  // view lives in the URL (?view=mealbox) so the browser Back button returns to the previous step
  const [params, setParams] = useSearchParams();
  const VIEWS = ["landing", "mealbox", "delivery", "full"];
  const q = params.get("view");
  const view = VIEWS.includes(q) ? q : "landing";
  const go = (v) => { setParams(v === "landing" ? {} : { view: v }); window.scrollTo({ top: 0 }); };

  return (
    <div className={cx("min-h-[70vh] text-[#231a1d]", view === "landing" ? "bg-[#fdf9f3]" : "bg-[#f8f5f2]")}>
      {view === "landing" && <Landing go={go} embedded={embedded} />}
      {view === "mealbox" && <MealBox go={go} embedded={embedded} />}
      {view === "delivery" && <DeliveryBox go={go} embedded={embedded} />}
      {view === "full" && <FullCatering go={go} embedded={embedded} />}
      {/* bottom spacer only on booking pages; landing band sits flush against the footer */}
      {view !== "landing" && <div className="h-12" />}
    </div>
  );
}
