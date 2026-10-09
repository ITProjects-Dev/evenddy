import { Link } from "react-router-dom";
import { loadData, loadEnquiries, inr } from "./store";
import { CalendarDays, Flower2, Package, Utensils, Check, TriangleAlert, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const d = loadData();
  const enquiries = loadEnquiries();
  const newEnq = enquiries.filter((e) => e.status === "new").length;

  const cards = [
    { k: "Meal Box sizes", v: d.catering.mealBox.boxSizes.length, to: "/admin/catering", icon: Package },
    { k: "Menu items",     v: d.catering.menuItems.length,        to: "/admin/catering", icon: Utensils },
    { k: "DIY kits",       v: d.decor.kits.length,                to: "/admin/decor",    icon: Flower2 },
    { k: "Themes",         v: d.decor.themes.length,              to: "/admin/decor",    icon: CalendarDays },
  ];

  const cheapestKit = [...d.decor.kits].sort((a, b) => a.price - b.price)[0];
  const priciestKit = [...d.decor.kits].sort((a, b) => b.price - a.price)[0];
  const lowestBox   = [...d.catering.mealBox.boxSizes].sort((a, b) => a.price - b.price)[0];

  return (
    <>
      <div className="adm-stats">
        {cards.map((s) => (
          <Link key={s.k} to={s.to} className="adm-card adm-stat" style={{ textDecoration: "none" }}>
            <span className="kpi"><s.icon size={20} strokeWidth={1.8} /></span>
            <div><b>{s.v}</b><span>{s.k}</span></div>
          </Link>
        ))}
      </div>

      <div className="adm-card" style={{ marginBottom: 22 }}>
        <div className="adm-card-h">
          <div><h3>Quick pricing snapshot</h3><p>Lowest prices currently published.</p></div>
          <Link className="adm-linkbtn" to="/admin/decor" style={{ marginLeft: "auto" }}>Edit prices <ArrowRight size={16}/></Link>
        </div>
        <div className="adm-card-b">
          <div className="adm-grid3">
            <div className="adm-card" style={{ padding: 14, boxShadow: "none" }}>
              <span className="adm-hint">Cheapest Meal Box</span>
              <b style={{ fontSize: 22 }}>{inr(lowestBox?.price)}</b>
              <div className="adm-hint">{lowestBox?.items} items</div>
            </div>
            <div className="adm-card" style={{ padding: 14, boxShadow: "none" }}>
              <span className="adm-hint">Cheapest Kit</span>
              <b style={{ fontSize: 22 }}>{inr(cheapestKit?.price)}</b>
              <div className="adm-hint">{cheapestKit?.title}</div>
            </div>
            <div className="adm-card" style={{ padding: 14, boxShadow: "none" }}>
              <span className="adm-hint">Top-priced Kit</span>
              <b style={{ fontSize: 22 }}>{inr(priciestKit?.price)}</b>
              <div className="adm-hint">{priciestKit?.title}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-h">
          <div><h3>Site status</h3><p>Everything is wired and live from the store.</p></div>
          {newEnq > 0 && (
            <Link className="adm-btn sm" to="/admin/enquiries" style={{ marginLeft: "auto" }}>
              {newEnq} new enqu{newEnq === 1 ? "iry" : "iries"} →
            </Link>
          )}
        </div>
        <div className="adm-card-b">
          <StatusRow on label="Catering page"        detail="Reads Meal Box, Menu & Full Catering from store" />
          <StatusRow on label="Decor page"           detail="Reads kits, themes, custom decor & enquiry options" />
          <StatusRow on label="Event page"           detail="Reads intro, event types, venue options & priorities" />
          <StatusRow on label="Enquiry capture"      detail={`${enquiries.length} total · ${newEnq} new`} />
          <StatusRow on={!!d.global.whatsapp} label="WhatsApp / Phone" detail={d.global.whatsapp ? `${d.global.phone} (${d.global.whatsapp})` : "Not set — open Settings"} />
        </div>
      </div>
    </>
  );
}

function StatusRow({ on, label, detail }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 0", borderBottom: "1px solid var(--line)",
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: "50%",
        display: "grid", placeItems: "center", flex: "none",
        background: on ? "#e6f6ee" : "#fdecea",
        color: on ? "#0b7a45" : "#d93025",
        fontSize: 11, fontWeight: 700,
      }}>{on ? <Check size={13} strokeWidth={2.5} /> : <TriangleAlert size={13} strokeWidth={2} />}</span>
      <b style={{ fontSize: 13.5 }}>{label}</b>
      <span className="adm-hint" style={{ marginLeft: "auto", textAlign: "right" }}>{detail}</span>
    </div>
  );
}