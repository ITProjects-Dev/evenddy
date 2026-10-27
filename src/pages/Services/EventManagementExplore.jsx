import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { sendMail } from "./sendmail";
import { useSiteData } from "../../admin/SiteDataContext";
import { getPublicEventManagementPropertyOptions } from "../../services/eventManagementOptionsService";
import { getPublicEventManagementBannerUrl, listPublicEventManagementIntros } from "../../services/eventManagementIntroService";

/* Event Management / Plan Your Event page (single file, like CateringExplore / DecorExplore).
   Rendered by ServiceDetails when the slug contains "event".
   Layout: intro card on the left, "Tell us about your celebration" brief form on the right.

   Styled with Tailwind utility classes only: delete Eventmanagement.css and its import.
   Font comes from your global setup, so no font-family anywhere here.

   NOTE: your global CSS has unlayered rules (a{color:inherit}, button{border:0},
   h1,h2{font-weight/letter-spacing}, h1-h4,p{margin-top:0}). Tailwind v4 utilities live in a
   layer, so those global rules win. Where that matters I use the "!" suffix (e.g. font-bold!)
   and inset box-shadows instead of borders on buttons. Don't remove them. */

/* ======================================================
   DATA (replace image URL, WhatsApp number and options with your own)
====================================================== */
const WHATSAPP_NUMBER = "+91 9XXXX XXXXX"; // country code + number, no "+"
// Put your own banquet photo URL here. Leave "" to use the built-in banquet illustration below.
const SIDE_IMAGE = "";

/* Illustrated banquet-hall scene used until you add a real photo (SIDE_IMAGE above). */
function bannerArt() {
  let seed = 11;
  const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const ri = (a, b) => Math.floor(a + r() * (b - a + 1));
  const f = (n) => n.toFixed(1);
  const pk = ["#f4b6c2", "#f9d5d3", "#ffffff", "#e98fa7", "#f6c28b"];
  const flower = (x, y, rad, c) => {
    let o = `<g transform="translate(${f(x)} ${f(y)})">`;
    for (let k = 0; k < 6; k++) o += `<ellipse cy="${f(-rad * 0.55)}" rx="${f(rad * 0.36)}" ry="${f(rad * 0.58)}" fill="${c}" transform="rotate(${k * 60})"/>`;
    return o + `<circle r="${f(rad * 0.2)}" fill="#f7c948"/></g>`;
  };
  let s = `<defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcf5ec"/><stop offset="1" stop-color="#eddccb"/></linearGradient>` +
    `<linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f0e7"/><stop offset="1" stop-color="#e0d0bd"/></linearGradient>` +
    `<linearGradient id="wn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe3f2"/></linearGradient>` +
    `<filter id="g" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4"/></filter></defs>`;
  s += `<rect width="600" height="560" fill="url(#w)"/><rect y="300" width="600" height="260" fill="url(#fl)"/>`;
  for (const x of [34, 476]) s += `<path d="M${x} 210V86A45 45 0 0 1 ${x + 90} 86V210Z" fill="url(#wn)" stroke="#d9c5ae" stroke-width="6"/>`;
  for (const cx of [150, 300, 450]) {
    s += `<line x1="${cx}" y1="0" x2="${cx}" y2="40" stroke="#c9972b" stroke-width="2"/><ellipse cx="${cx}" cy="48" rx="34" ry="8" fill="#e6c25a"/><ellipse cx="${cx}" cy="64" rx="22" ry="6" fill="#e6c25a"/>`;
    for (let i = 0; i < 7; i++) s += `<circle cx="${cx - 30 + i * 10}" cy="${74 + (i % 2) * 6}" r="5" fill="#fff3c4" filter="url(#g)"/><circle cx="${cx - 30 + i * 10}" cy="${74 + (i % 2) * 6}" r="2" fill="#fff"/>`;
  }
  // stage
  s += `<rect x="150" y="262" width="300" height="26" rx="4" fill="#f3e8da"/><rect x="170" y="288" width="260" height="14" fill="#eadbc8"/>`;
  s += `<rect x="190" y="130" width="220" height="132" fill="#d8b894" opacity=".55"/>`;
  for (let i = 0; i < 8; i++) s += `<rect x="${190 + i * 27.5}" y="130" width="14" height="132" fill="#c9a37c" opacity=".35"/>`;
  s += `<path d="M205 262V170A95 95 0 0 1 395 170V262" fill="none" stroke="#c9972b" stroke-width="10"/>`;
  for (let i = 0; i <= 26; i++) { const a = Math.PI * (1 - i / 26); s += flower(300 + 95 * Math.cos(a), 170 - 95 * Math.sin(a) + 0, ri(11, 17), pk[ri(0, 4)]); }
  for (const x of [205, 395]) for (let y = 250; y > 172; y -= 18) s += flower(x + ri(-4, 4), y, ri(11, 16), pk[ri(0, 4)]);
  for (const x of [168, 432]) for (let y = 262; y > 190; y -= 16) s += flower(x + ri(-5, 5), y, ri(12, 17), pk[ri(0, 4)]);
  s += `<rect x="262" y="226" width="76" height="36" rx="10" fill="#b5445f"/><rect x="270" y="212" width="60" height="22" rx="10" fill="#c85a76"/>`;
  s += `<polygon points="270,302 330,302 420,560 180,560" fill="#e8c5c0" opacity=".55"/>`;
  // tables (back to front)
  const table = (x, y, sc) => {
    let o = "";
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; o += `<ellipse cx="${f(x + Math.cos(a) * sc * 1.25)}" cy="${f(y + Math.sin(a) * sc * 0.5)}" rx="${f(sc * 0.2)}" ry="${f(sc * 0.2)}" fill="#d9ad4f"/>`; }
    o += `<ellipse cx="${x}" cy="${y + sc * 0.12}" rx="${f(sc * 1.05)}" ry="${f(sc * 0.42)}" fill="#e9dccb"/><ellipse cx="${x}" cy="${y}" rx="${f(sc)}" ry="${f(sc * 0.4)}" fill="#fff"/>`;
    return o + flower(x, y - sc * 0.15, sc * 0.45, pk[ri(0, 4)]) + `<circle cx="${x - sc * 0.5}" cy="${y}" r="${f(sc * 0.12)}" fill="#e9e4dd"/><circle cx="${x + sc * 0.5}" cy="${y}" r="${f(sc * 0.12)}" fill="#e9e4dd"/>`;
  };
  for (const x of [50, 120, 480, 550]) s += table(x, 345, 24);
  for (const x of [40, 140, 460, 560]) s += table(x, 420, 36);
  for (const x of [50, 548]) s += table(x, 520, 50);
  for (let i = 0; i < 18; i++) s += `<ellipse cx="${ri(230, 370)}" cy="${ri(420, 550)}" rx="6" ry="3.5" fill="${pk[ri(0, 4)]}" transform="rotate(${ri(0, 180)} 300 480)"/>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 560">${s}</svg>`);
}

const BANNER = bannerArt();

const EMPTY = {
  name: "", phone: "", eventType: "", subtype: "", city: "", date: "", time: "",
  guests: "", budget: "", venueStatus: "", venueName: "", priorities: [], story: "",
};

const WaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

/* ======================================================
   SHARED CLASS STRINGS + SMALL HELPERS
====================================================== */
const cx = (...a) => a.filter(Boolean).join(" ");

const LABEL = "mb-1.5 block text-[11px] font-medium text-[#1a1516]";
const CONTROL =
  "min-h-[42px] w-full rounded-[10px] border border-[#d9d3df] bg-white px-[13px] py-[11px] text-xs text-[#1a1516] placeholder:text-[#a9a3ad] focus:border-[#750a3d] focus:outline-none";
const SELECT =
  "appearance-none pr-[34px] disabled:cursor-not-allowed disabled:bg-[#f6f1ec] disabled:text-[#a9a3ad]";
const SELECT_ARROW = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6567' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 13px center",
};
const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4005f]";
const BTN =
  "inline-flex min-h-[50px] items-center justify-center gap-3 rounded-[10px] px-5 text-sm font-bold tracking-[.01em] transition " +
  FOCUS_RING;
const BTN_SOLID = BTN + " bg-[#750a3d] text-white shadow-[inset_0_0_0_1.5px_#750a3d] hover:brightness-110";
const BTN_WA = BTN + " bg-white text-[#1ebe5d] shadow-[inset_0_0_0_2px_#25d366] hover:bg-[#f1fbf5]";
const CARD = "rounded-3xl bg-[#fffdfa] shadow-[0_6px_24px_rgba(60,20,30,.06)]";

/* Responsive grids: 1 col on phones, 2 from 601px, full layout from 961px (same breakpoints as the old CSS) */
const G2 = "grid grid-cols-1 gap-x-5 min-[601px]:grid-cols-2";
const G3 = "grid grid-cols-1 gap-x-5 min-[601px]:grid-cols-2";
const G4 = "grid grid-cols-1 gap-x-5 min-[601px]:grid-cols-2";

/* Label + control + error message wrapper */
function F({ id, label, req, error, children }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className={cx(LABEL, "text-xs")}>
        {label}
        {req && <>{" "}<i className="not-italic text-[#750a3d]">*</i></>}
      </label>
      {children}
      {error && <small className="mt-1 block text-[11px] text-[#c0262d]" role="alert">{error}</small>}
    </div>
  );
}

/* ======================================================
   MAIN
====================================================== */
export default function EventManagementExplore() {
  const siteData = useSiteData();
  const configuredEventTypes = siteData.event?.eventTypes;
  const [serverOptions, setServerOptions] = useState(null);
  const [optionsLoadFailed, setOptionsLoadFailed] = useState(false);
  const [publicIntro, setPublicIntro] = useState(null);
  const [introLoadFailed, setIntroLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getPublicEventManagementPropertyOptions()
      .then((options) => {
        if (active) {
          setServerOptions(options);
          setOptionsLoadFailed(false);
        }
      })
      .catch(() => {
        if (active) setOptionsLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    listPublicEventManagementIntros()
      .then((intros) => {
        if (active) {
          const intro = intros.find((item) => typeof item.status === "string" && item.status.toUpperCase() === "ACTIVE") || null;
          setPublicIntro(intro);
          setIntroLoadFailed(false);
        }
      })
      .catch(() => {
        if (active) setIntroLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const eventTypes = useMemo(() => {
    if (serverOptions) return serverOptions.eventTypes;
    if (!configuredEventTypes || typeof configuredEventTypes !== "object" || Array.isArray(configuredEventTypes)) return {};
    return Object.fromEntries(Object.entries(configuredEventTypes)
      .filter(([type, subtypes]) => type.trim() && Array.isArray(subtypes))
      .map(([type, subtypes]) => [
        type.trim(),
        subtypes.filter((subtype) => typeof subtype === "string" && subtype.trim()),
      ]));
  }, [configuredEventTypes, serverOptions]);
  const eventTypeOptions = useMemo(() => Object.keys(eventTypes), [eventTypes]);
  const venueOptions = useMemo(() => (
    serverOptions
      ? serverOptions.venueStatus
      : Array.isArray(siteData.event?.venueStatus)
        ? siteData.event.venueStatus.filter((option) => typeof option === "string" && option.trim())
        : []
  ), [serverOptions, siteData.event?.venueStatus]);
  const priorityOptions = useMemo(() => (
    serverOptions
      ? serverOptions.priorities
      : Array.isArray(siteData.event?.priorities)
        ? siteData.event.priorities.filter((option) => typeof option === "string" && option.trim())
        : []
  ), [serverOptions, siteData.event?.priorities]);
  const [form, setForm] = useState(() => ({ ...EMPTY, venueStatus: venueOptions[0] || "" }));
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [mailError, setMailError] = useState("");

  const selectedSubtypeOptions = Array.isArray(eventTypes[form.eventType]) ? eventTypes[form.eventType] : [];
  const set = (k) => (e) => setForm((current) => ({ ...current, [k]: e.target.value }));
  const setType = (e) => setForm((current) => ({ ...current, eventType: e.target.value, subtype: "" }));
  const hasActiveIntro = typeof publicIntro?.status === "string" && publicIntro.status.toUpperCase() === "ACTIVE";

  useEffect(() => {
    setForm((current) => {
      const nextType = eventTypeOptions.includes(current.eventType) ? current.eventType : "";
      const nextSubtypes = Array.isArray(eventTypes[nextType]) ? eventTypes[nextType] : [];
      const nextVenue = venueOptions.includes(current.venueStatus) ? current.venueStatus : venueOptions[0] || "";
      const nextPriorities = current.priorities.filter((priority) => priorityOptions.includes(priority));
      const nextSubtype = nextSubtypes.includes(current.subtype) ? current.subtype : "";
      if (
        nextType === current.eventType
        && nextSubtype === current.subtype
        && nextVenue === current.venueStatus
        && nextPriorities.length === current.priorities.length
      ) return current;
      return {
        ...current,
        eventType: nextType,
        subtype: nextSubtype,
        venueStatus: nextVenue,
        priorities: nextPriorities,
      };
    });
  }, [eventTypes, eventTypeOptions, priorityOptions, venueOptions]);

  const resetForm = () => setForm({ ...EMPTY, venueStatus: venueOptions[0] || "" });

  const exclusivePriority = priorityOptions.includes("Everything handled") ? "Everything handled" : "";
  const togglePriority = (p) =>
    setForm((f) => {
      if (exclusivePriority && p === exclusivePriority) return { ...f, priorities: f.priorities.includes(p) ? [] : [p] };
      const rest = exclusivePriority ? f.priorities.filter((x) => x !== exclusivePriority) : f.priorities;
      return { ...f, priorities: rest.includes(p) ? rest.filter((x) => x !== p) : [...rest, p] };
    });

  const summary = () =>
    [
      "Event management enquiry",
      `Name: ${form.name}`, `Phone: ${form.phone}`,
      `Event: ${form.eventType}${form.subtype ? ` (${form.subtype})` : ""}`,
      `City: ${form.city}`, `Date: ${form.date}`, form.time && `Time: ${form.time}`,
      form.guests && `Guests: ${form.guests}`, form.budget && `Budget: ₹${form.budget}`,
      `Venue: ${form.venueStatus}${form.venueName ? ` – ${form.venueName}` : ""}`,
      form.priorities.length > 0 && `Priorities: ${form.priorities.join(", ")}`,
      form.story && `Notes: ${form.story}`,
    ].filter(Boolean).join("\n");

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const v = {};
    if (!form.name.trim()) v.name = "Enter your name";
    if (!/^\d{10}$/.test(form.phone)) v.phone = "Enter a 10-digit number";
    if (!form.eventType) v.eventType = "Select event type";
    if (!form.subtype) v.subtype = "Select subtype";
    if (!form.city.trim()) v.city = "Enter city";
    if (!form.date) v.date = "Pick a date";
    if (!form.time) v.time = "Pick a time";
    setErrors(v);
    if (Object.keys(v).length) {
      document.getElementById(`em-${Object.keys(v)[0]}`)?.focus();
      return;
    }
    // E-mail the brief to the business, then show the success popup
    setSending(true);
    setMailError("");
    try {
      await sendMail({ subject: "Event management enquiry", lines: [summary()] });
      setSent(true);
    } catch {
      setMailError("Sorry, we couldn't send your enquiry. Please try again or call us.");
    } finally {
      setSending(false);
    }
  };

  const whatsapp = () =>
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary())}`, "_blank");

  const ctl = (k, extra) => cx(CONTROL, extra, errors[k] && "border-red-600!");

  return (
    <div className="min-h-[70vh] bg-[#faf5ee] pb-16 text-[#1a1516]">
      <div className="container">
        <nav className="flex flex-wrap items-center py-5 pb-[14px] text-xs text-[#6f6366]" aria-label="Breadcrumb">
          <Link className="text-inherit no-underline hover:text-[#750a3d]" to="/">Home</Link>
          <span className="mx-1.5 text-[#a79a9e]">›</span>
          <Link className="text-inherit no-underline hover:text-[#750a3d]" to="/services">Services</Link>
          <span className="mx-1.5 text-[#a79a9e]">›</span>
          <button type="button" className="border-0 bg-transparent p-0 text-xs font-semibold text-[#750a3d] hover:text-[#750a3d]" aria-current="page" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Event Management
          </button>
        </nav>

        <div className={cx(
          "grid items-start gap-7",
          hasActiveIntro && "min-[961px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.7fr)]"
        )}>
          {hasActiveIntro && (
            <aside
              className={cx(
                CARD,
                "px-5 pb-7 pt-5",
                "min-[601px]:grid min-[601px]:grid-cols-2 min-[601px]:items-center min-[601px]:gap-x-5",
                "min-[961px]:sticky min-[961px]:top-4 min-[961px]:block"
              )}
            >
              <img
                className="mb-4 block h-[220px] w-full rounded-2xl object-cover min-[601px]:row-[1/4] min-[601px]:mb-0 min-[601px]:h-[260px] min-[961px]:row-auto min-[961px]:mb-5 min-[961px]:h-[290px]"
                src={publicIntro.bannerImageUrl ? getPublicEventManagementBannerUrl(publicIntro.bannerImageUrl) : SIDE_IMAGE || BANNER}
                alt="Beautifully styled banquet hall"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = BANNER; }}
              />
              <p className="mb-2.5 px-1.5 text-[10px] font-bold tracking-[.1em] text-[#750a3d]">
                {publicIntro.eyebrow}
              </p>
              <h1 className="mb-3.5 px-1.5 text-[28px] font-bold! leading-[1.1] tracking-[-.025em]! text-[#1a1516]">
                {publicIntro.heading}
              </h1>
              <p className="mb-0 px-1.5 text-[11.5px] leading-[1.75] text-[#6b6567]">
                {publicIntro.leadParagraph}
              </p>
            </aside>
          )}

          {/* ---------- RIGHT FORM CARD ---------- */}
          <form id="event-enquiry" className={cx(CARD, "scroll-mt-20 px-5 pb-6 pt-5 min-[601px]:px-7 min-[601px]:pb-7 min-[601px]:pt-7")} onSubmit={submit} noValidate>
            {introLoadFailed && (
              <p className="mb-4 text-xs text-[#9a5b00]" role="status">
                Live event introduction is unavailable.
              </p>
            )}
            <h2 className="mb-1.5 text-xl font-bold! tracking-[-.01em]! text-[#1a1516]">Tell us about your celebration</h2>
            <p className="mb-4 text-xs leading-[1.6] text-[#6b6567]">
              Share your vision and event details so our senior event planning team can curate your custom proposal.
            </p>
            {optionsLoadFailed && (
              <p className="mb-4 text-xs text-[#9a5b00]" role="status">
                Server event options are unavailable; showing the saved options for this site.
              </p>
            )}

            <div className={G2}>
              <F id="em-name" label="Name" req error={errors.name}>
                <input id="em-name" className={ctl("name")} value={form.name} onChange={set("name")} placeholder="Enter your name" autoComplete="name" aria-invalid={!!errors.name} />
              </F>
              <F id="em-phone" label="Phone Number" req error={errors.phone}>
                <input id="em-phone" className={ctl("phone")} value={form.phone} onChange={set("phone")} placeholder="Enter phone number" inputMode="numeric" maxLength={10} autoComplete="tel-national" aria-invalid={!!errors.phone} />
              </F>
            </div>

            <div className={G3}>
              <F id="em-eventType" label="Event Type" req error={errors.eventType}>
                <select id="em-eventType" className={ctl("eventType", SELECT)} style={SELECT_ARROW} value={form.eventType} onChange={setType} disabled={eventTypeOptions.length === 0} aria-invalid={!!errors.eventType}>
                  <option value="">Select</option>
                  {eventTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {eventTypeOptions.length === 0 && <small className="mt-1 block text-[11px] text-[#6b6567]">No event types are configured in admin.</small>}
              </F>
              <F id="em-subtype" label="Event Subtype" req error={errors.subtype}>
                <select id="em-subtype" className={ctl("subtype", SELECT)} style={SELECT_ARROW} value={form.subtype} onChange={set("subtype")} disabled={!form.eventType || selectedSubtypeOptions.length === 0} aria-invalid={!!errors.subtype}>
                  <option value="">{!form.eventType ? "Pick type first" : selectedSubtypeOptions.length ? "Select an option" : "No subtypes configured"}</option>
                  {selectedSubtypeOptions.map((subtype) => <option key={subtype} value={subtype}>{subtype}</option>)}
                </select>
              </F>
              <F id="em-city" label="Location / City" req error={errors.city}>
                <input id="em-city" className={ctl("city")} value={form.city} onChange={set("city")} placeholder="e.g. Visakhapatnam, Andhra Pradesh" autoComplete="address-level2" aria-invalid={!!errors.city} />
              </F>
            </div>

            <div className={G4}>
              <F id="em-date" label="Event Date" req error={errors.date}>
                <input id="em-date" type="date" className={ctl("date")} value={form.date} onChange={set("date")} aria-invalid={!!errors.date} />
              </F>
              <F id="em-time" label="Preferred Time" req error={errors.time}>
                {/* shows "Enter Time" placeholder, turns into a time picker on focus */}
                <input
                  id="em-time" type={form.time ? "time" : "text"} className={ctl("time")} value={form.time}
                  placeholder="Enter Time" aria-invalid={!!errors.time}
                  onFocus={(e) => { e.target.type = "time"; try { e.target.showPicker?.(); } catch { /* not supported */ } }}
                  onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                  onChange={set("time")}
                />
              </F>
              <F id="em-guests" label="Guest Count">
                <input id="em-guests" type="number" min="1" className={CONTROL} value={form.guests} onChange={set("guests")} placeholder="Enter Count" />
              </F>
              <F id="em-budget" label="Event Budget">
                <input id="em-budget" type="number" min="0" className={CONTROL} value={form.budget} onChange={set("budget")} placeholder="Enter Budget" />
              </F>
            </div>

            <div className={G2}>
              <F id="em-venueStatus" label="Venue Status">
                <select id="em-venueStatus" className={cx(CONTROL, SELECT)} style={SELECT_ARROW} value={form.venueStatus} onChange={set("venueStatus")} disabled={venueOptions.length === 0}>
                  <option value="">{venueOptions.length ? "Select an option" : "No venue options configured"}</option>
                  {venueOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </F>
              <F id="em-venueName" label={form.venueStatus === venueOptions[0] ? "Confirmed Venue Name" : "Preferred Venue / Area"}>
                <input id="em-venueName" className={CONTROL} value={form.venueName} onChange={set("venueName")} placeholder="e.g. Sea Pearl Banquet Hall, Beach Rd" />
              </F>
            </div>

            <div className="mb-4">
              <span className={LABEL} id="em-prio-label">Key Priorities for this Celebration</span>
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby="em-prio-label">
                {priorityOptions.map((p) => {
                  const on = form.priorities.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={on}
                      onClick={() => togglePriority(p)}
                      className={cx(
                        "rounded-full px-[15px] py-[7px] text-[11px] leading-[1.2] transition-colors",
                        FOCUS_RING,
                        on
                          ? "bg-[#f8e3e8] font-bold text-[#750a3d] shadow-[inset_0_0_0_1px_#c97a8f]"
                          : "bg-white font-medium text-[#1a1516] shadow-[inset_0_0_0_1px_#e0d9dc] hover:shadow-[inset_0_0_0_1px_#750a3d]"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
                {priorityOptions.length === 0 && <p className="mb-0 text-[11px] text-[#6b6567]">No priorities are configured in admin.</p>}
              </div>
            </div>

            <F id="em-story" label="Special Requirements / Story">
              <textarea
                id="em-story" rows="3" className={cx(CONTROL, "min-h-[84px] resize-y")} value={form.story} onChange={set("story")}
                placeholder="Tell us about your event theme, inspirations, dietary preferences, or any special requests..."
              />
            </F>

            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#ddd6d2] pt-4 min-[601px]:grid-cols-2">
              <button type="button" className={BTN_WA} onClick={whatsapp}>
                <WaIcon />
                Continue WhatsApp
              </button>
              <button type="submit" className={cx(BTN_SOLID, "disabled:opacity-60")} disabled={sending}>{sending ? "Sending…" : "Request Quote"}</button>
            </div>
            <p className="mb-0 mt-6! text-center text-[11px] text-[#a8a2a6]">
              A dedicated Evenddy planner will review your brief and connect within 24 hours.
            </p>
          </form>
        </div>
      </div>

      {/* ---------- SUCCESS POPUP ---------- */}
      {sent && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-[rgba(20,10,14,.55)] p-5 backdrop-blur-[3px]" onClick={() => setSent(false)}>
          <div className="w-full max-w-[400px] rounded-[18px] bg-white p-[30px] text-center" role="dialog" aria-modal="true" aria-label="Quote request submitted" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3.5 grid size-[54px] place-items-center rounded-full border-2 border-[#750a3d] text-2xl text-[#750a3d]" aria-hidden="true">✓</div>
            <h3 className="mb-2.5 text-xl font-bold text-[#1a1516]">Quote Request Submitted Successfully!</h3>
            <p className="mb-3.5 text-xs leading-[1.6] text-[#6b6567]">
              Thank you for choosing <b>Evenddy</b>. Our planning team will review your brief and get in touch within 24 hours.
            </p>
            <button className={cx(BTN_SOLID, "mt-1.5 w-full")} autoFocus onClick={() => { setSent(false); resetForm(); }}>
              Continue Browsing →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
