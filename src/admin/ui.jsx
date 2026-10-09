import { useState } from "react";
import { Trash2, X } from "lucide-react";

export const Section = ({ num, title, sub, right, children }) => (
  <section className="adm-card" style={{ marginBottom: 18 }}>
    <div className="adm-card-h">
      {num && <span className="num adm-badge cat">{num}</span>}
      <div style={{ flex: 1 }}>
        <h3>{title}</h3>
        {sub && <p>{sub}</p>}
      </div>
      {right}
    </div>
    <div className="adm-card-b">{children}</div>
  </section>
);

export const F = ({ label, error, hint, children }) => (
  <div className="adm-field">
    {label && <label>{label}</label>}
    {children}
    {hint && !error && <small className="adm-hint">{hint}</small>}
    {error && <small className="adm-err">{error}</small>}
  </div>
);

export const Text = ({ label, value, onChange, ...p }) => (
  <F label={label}>
    <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...p} />
  </F>
);

export const Num = ({ label, value, onChange, ...p }) => (
  <F label={label}>
    <input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} {...p} />
  </F>
);

export const Area = ({ label, value, onChange, rows = 3, ...p }) => (
  <F label={label}>
    <textarea rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...p} />
  </F>
);

export const TagsInput = ({ label, value = [], onChange, placeholder, suggestions = [] }) => {
  const [draft, setDraft] = useState("");
  const add = (v) => { const t = String(v).trim(); if (!t || value.includes(t)) return; onChange([...value, t]); setDraft(""); };
  const remove = (t) => onChange(value.filter((x) => x !== t));
  return (
    <F label={label}>
      <div className="adm-tags">
        {value.map((t) => (
          <span key={t} className="adm-tag">
            {t}<button type="button" onClick={() => remove(t)} aria-label={`Remove ${t}`}><X size={14} /></button>
          </span>
        ))}
        <input value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); }
            if (e.key === "Backspace" && !draft && value.length) remove(value[value.length - 1]);
          }}
          onBlur={() => add(draft)}
          placeholder={value.length ? "" : placeholder} />
      </div>
      {suggestions.filter((s) => !value.includes(s)).length > 0 && (
        <div className="adm-suggest">
          {suggestions.filter((s) => !value.includes(s)).slice(0, 10).map((s) => (
            <button type="button" key={s} onClick={() => add(s)}>+ {s}</button>
          ))}
        </div>
      )}
    </F>
  );
};

/* Generic repeater: renders array rows via renderRow, with add/remove */
export function Repeater({ items, onChange, renderRow, empty, addLabel = "+ Add item", makeNew, itemTitle }) {
  const update = (i, v) => onChange(items.map((x, k) => (k === i ? v : x)));
  const remove = (i) => onChange(items.filter((_, k) => k !== i));
  const add = () => onChange([...items, makeNew ? makeNew(items) : {}]);
  return (
    <>
      <div className="adm-list">
        {items.length === 0 && <div className="adm-empty" style={{ padding: 30 }}><p>{empty || "No items yet."}</p></div>}
        {items.map((it, i) => (
          <div key={i} className="adm-card" style={{ background: "#fafaff" }}>
            <div className="adm-card-h" style={{ padding: "10px 14px" }}>
              <b style={{ fontSize: 13.5 }}>{itemTitle ? itemTitle(it, i) : `#${i + 1}`}</b>
              <button className="adm-iconbtn" style={{ marginLeft: "auto" }} title="Delete" aria-label="Delete item" onClick={() => remove(i)}><Trash2 size={16} /></button>
            </div>
            <div className="adm-card-b" style={{ padding: 14 }}>{renderRow(it, i, (v) => update(i, v))}</div>
          </div>
        ))}
      </div>
      <button className="adm-btn ghost sm" style={{ marginTop: 12 }} onClick={add}>{addLabel}</button>
    </>
  );
}

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="adm-seg" role="tablist" style={{ marginBottom: 18 }}>
    {tabs.map((t) => (
      <button key={t.id} role="tab" aria-selected={value === t.id}
        className={value === t.id ? "on" : ""} onClick={() => onChange(t.id)}>
        {t.label}
      </button>
    ))}
  </div>
);

export const Toast = ({ text }) => text
  ? <div className="adm-toast" role="status"><span className="dot" />{text}</div>
  : null;

/* localStorage draft + save helper */
export function useAutosave(key, initial, timeoutMs = 5000) {
  const [data, setData] = useState(initial);
  const [savedAt, setSavedAt] = useState(0);
  const [dirty, setDirty] = useState(false);
  return {
    data, setData: (v) => { setData(v); setDirty(true); },
    savedAt, dirty,
    markSaved: () => { setSavedAt(Date.now()); setDirty(false); },
  };
}