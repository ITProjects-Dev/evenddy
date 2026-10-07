import { useState } from "react";
import { Link } from "react-router-dom";
import "./eventmanagement.css";

/* Event Management / Plan Your Event page (single file, like CateringExplore / DecorExplore).
   Rendered by ServiceDetails when the slug contains "event".
   Layout: intro card on the left, "Tell us about your celebration" brief form on the right. */

/* ======================================================
   DATA (replace image URL, WhatsApp number and options with your own)
====================================================== */
const WHATSAPP_NUMBER = "919999999999"; // country code + number, no "+"
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

const EVENT_TYPES = {
  Wedding: ["Traditional Wedding", "Destination Wedding", "Intimate Wedding"],
  Engagement: ["Ring Ceremony", "Roka / Sagai"],
  Reception: ["Grand Reception", "Cocktail Evening"],
  Birthday: ["Kids Birthday", "Adult Birthday", "Milestone Birthday"],
  Anniversary: ["Silver / Golden Jubilee", "Romantic Dinner", "Family Celebration"],
  "Baby Shower": ["Baby Shower", "Gender Reveal", "Naming Ceremony"],
  "Corporate Event": ["Product Launch", "Annual Day", "Offsite", "Gala Dinner"],
  "House Warming": ["Griha Pravesh", "Pooja & Lunch"],
  Other: ["Other"],
};
const VENUE_STATUS = ["Have a venue", "Looking for a venue", "Not decided yet"];
const PRIORITIES = ["Beautiful Decor", "Great Food", "Budget-friendly", "Everything handled"];

const EMPTY = {
  name: "", phone: "", eventType: "", subtype: "", city: "", date: "", time: "",
  guests: "", budget: "", venueStatus: VENUE_STATUS[0], venueName: "", priorities: [], story: "",
};

const WaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

/* ======================================================
   MAIN
====================================================== */
export default function EventManagementExplore() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setType = (e) => setForm({ ...form, eventType: e.target.value, subtype: "" }); // subtype depends on type

  // "Everything handled" is exclusive; picking anything else clears it
  const togglePriority = (p) =>
    setForm((f) => {
      if (p === "Everything handled") return { ...f, priorities: f.priorities.includes(p) ? [] : [p] };
      const rest = f.priorities.filter((x) => x !== "Everything handled");
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

  const submit = (e) => {
    e.preventDefault();
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
    // TODO: send `form` to your backend / CRM here
    console.log("Event enquiry:", form);
    setSent(true);
  };

  const whatsapp = () =>
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary())}`, "_blank");

  const err = (k) => (errors[k] ? "err" : "");
  const Msg = ({ k }) => (errors[k] ? <small className="em-msg" role="alert">{errors[k]}</small> : null);

  return (
    <div className="em">
      <div className="em-wrap">
        <nav className="em-crumb" aria-label="Breadcrumb">
          <Link to="/services">Our Services</Link> <span>›</span> <span>Event Planning</span> <span>›</span> <b>Plan Your Event</b>
        </nav>

        <div className="em-layout">
          {/* ---------- LEFT INTRO CARD ---------- */}
          <aside className="em-intro">
            <img
              src={SIDE_IMAGE || BANNER}
              alt="Beautifully styled banquet hall"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = BANNER; }}
            />
            <p className="em-eyebrow">EVENT PLANNING &amp; MANAGEMENT</p>
            <h1>Your entire celebration, seamlessly planned.</h1>
            <p className="em-lead">
              Tell us what you're planning, your budget, and what you need. From curated decor and
              artisanal catering to venue scouting and on-ground coordination, our captains bring
              your vision to life.
            </p>
          </aside>

          {/* ---------- RIGHT FORM CARD ---------- */}
          <form className="em-form" onSubmit={submit} noValidate>
            <h2>Tell us about your celebration</h2>
            <p className="em-sub">Share your vision and event details so our senior event planning team can curate your custom proposal.</p>

            <div className="em-grid em-g2">
              <div className="em-f">
                <label htmlFor="em-name">Name <i>*</i></label>
                <input id="em-name" className={err("name")} value={form.name} onChange={set("name")} placeholder="Enter your name" autoComplete="name" aria-invalid={!!errors.name} />
                <Msg k="name" />
              </div>
              <div className="em-f">
                <label htmlFor="em-phone">Phone Number <i>*</i></label>
                <input id="em-phone" className={err("phone")} value={form.phone} onChange={set("phone")} placeholder="Enter phone number" inputMode="numeric" maxLength={10} autoComplete="tel-national" aria-invalid={!!errors.phone} />
                <Msg k="phone" />
              </div>
            </div>

            <div className="em-grid em-g3">
              <div className="em-f">
                <label htmlFor="em-eventType">Event Type <i>*</i></label>
                <select id="em-eventType" className={err("eventType")} value={form.eventType} onChange={setType} aria-invalid={!!errors.eventType}>
                  <option value="">Select</option>
                  {Object.keys(EVENT_TYPES).map((t) => <option key={t}>{t}</option>)}
                </select>
                <Msg k="eventType" />
              </div>
              <div className="em-f">
                <label htmlFor="em-subtype">Event Subtype <i>*</i></label>
                <select id="em-subtype" className={err("subtype")} value={form.subtype} onChange={set("subtype")} disabled={!form.eventType} aria-invalid={!!errors.subtype}>
                  <option value="">{form.eventType ? "Select" : "Pick type first"}</option>
                  {(EVENT_TYPES[form.eventType] || []).map((s) => <option key={s}>{s}</option>)}
                </select>
                <Msg k="subtype" />
              </div>
              <div className="em-f">
                <label htmlFor="em-city">Location / City <i>*</i></label>
                <input id="em-city" className={err("city")} value={form.city} onChange={set("city")} placeholder="e.g. Visakhapatnam, Andhra Pradesh" autoComplete="address-level2" aria-invalid={!!errors.city} />
                <Msg k="city" />
              </div>
            </div>

            <div className="em-grid em-g4">
              <div className="em-f">
                <label htmlFor="em-date">Event Date <i>*</i></label>
                <input id="em-date" type="date" className={err("date")} value={form.date} onChange={set("date")} aria-invalid={!!errors.date} />
                <Msg k="date" />
              </div>
              <div className="em-f">
                <label htmlFor="em-time">Preferred Time <i>*</i></label>
                {/* shows "Enter Time" placeholder, turns into a time picker on focus */}
                <input
                  id="em-time" type={form.time ? "time" : "text"} className={err("time")} value={form.time}
                  placeholder="Enter Time" aria-invalid={!!errors.time}
                  onFocus={(e) => { e.target.type = "time"; try { e.target.showPicker?.(); } catch { /* not supported */ } }}
                  onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                  onChange={set("time")}
                />
                <Msg k="time" />
              </div>
              <div className="em-f">
                <label htmlFor="em-guests">Guest Count</label>
                <input id="em-guests" type="number" min="1" value={form.guests} onChange={set("guests")} placeholder="Enter Count" />
              </div>
              <div className="em-f">
                <label htmlFor="em-budget">Event Budget</label>
                <input id="em-budget" type="number" min="0" value={form.budget} onChange={set("budget")} placeholder="Enter Budget" />
              </div>
            </div>

            <div className="em-grid em-g2">
              <div className="em-f">
                <label htmlFor="em-venueStatus">Venue Status</label>
                <select id="em-venueStatus" value={form.venueStatus} onChange={set("venueStatus")}>
                  {VENUE_STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="em-f">
                <label htmlFor="em-venueName">{form.venueStatus === VENUE_STATUS[0] ? "Confirmed Venue Name" : "Preferred Venue / Area"}</label>
                <input id="em-venueName" value={form.venueName} onChange={set("venueName")} placeholder="e.g. Sea Pearl Banquet Hall, Beach Rd" />
              </div>
            </div>

            <div className="em-f">
              <span className="em-lab" id="em-prio-label">Key Priorities for this Celebration</span>
              <div className="em-chips" role="group" aria-labelledby="em-prio-label">
                {PRIORITIES.map((p) => {
                  const on = form.priorities.includes(p);
                  return (
                    <button key={p} type="button" className={`em-chip ${on ? "on" : ""}`} aria-pressed={on} onClick={() => togglePriority(p)}>{p}</button>
                  );
                })}
              </div>
            </div>

            <div className="em-f">
              <label htmlFor="em-story">Special Requirements / Story</label>
              <textarea id="em-story" rows="3" value={form.story} onChange={set("story")} placeholder="Tell us about your event theme, inspirations, dietary preferences, or any special requests..." />
            </div>

            <div className="em-actions">
              <button type="button" className="em-btn em-wa" onClick={whatsapp}>
                <WaIcon />
                Continue WhatsApp
              </button>
              <button type="submit" className="em-btn">Request Quote</button>
            </div>
            <p className="em-note">A dedicated Evenddy planner will review your brief and connect within 24 hours.</p>
          </form>
        </div>
      </div>

      {/* ---------- SUCCESS POPUP ---------- */}
      {sent && (
        <div className="em-overlay" onClick={() => setSent(false)}>
          <div className="em-modal" role="dialog" aria-modal="true" aria-label="Quote request submitted" onClick={(e) => e.stopPropagation()}>
            <div className="em-tick" aria-hidden="true">✓</div>
            <h3>Quote Request Submitted Successfully!</h3>
            <p>Thank you for choosing <b>Evenddy</b>. Our planning team will review your brief and get in touch within 24 hours.</p>
            <button className="em-btn em-block" autoFocus onClick={() => { setSent(false); setForm(EMPTY); }}>Continue Browsing →</button>
          </div>
        </div>
      )}
    </div>
  );
}
