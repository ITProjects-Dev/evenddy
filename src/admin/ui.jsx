import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Eye, Pencil, Plus, Save, Trash2, X } from "lucide-react";

const SectionActionContext = createContext(null);

export const Section = ({ num, title, sub, right, children }) => {
  const [addAction, setAddAction] = useState(null);
  return (
    <section className="adm-card" style={{ marginBottom: 18 }}>
      <div className="adm-card-h">
        {num && <span className="num adm-badge cat">{num}</span>}
        <div style={{ flex: 1 }}>
          <h3>{title}</h3>
          {sub && <p>{sub}</p>}
        </div>
        {right}
        {addAction && (
          <button className="adm-btn adm-add-item sm" type="button" onClick={addAction.onClick}>
            <Plus size={16} /> {addAction.label}
          </button>
        )}
      </div>
      <SectionActionContext.Provider value={setAddAction}>
        <div className="adm-card-b">{children}</div>
      </SectionActionContext.Provider>
    </section>
  );
};

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

function formatDetailValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => (
      item && typeof item === "object"
        ? Object.values(item).map(formatDetailValue).filter(Boolean).join(" · ")
        : formatDetailValue(item)
    )).filter(Boolean).join(", ") || "—";
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, entry]) => `${key}: ${formatDetailValue(entry)}`)
      .join(" · ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

function detailLabel(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

/* A list-first editor shared by the admin's repeatable content sections. */
export function Repeater({ items, onChange, renderRow, empty, addLabel = "Add item", makeNew, itemTitle }) {
  const setSectionAddAction = useContext(SectionActionContext);
  const [active, setActive] = useState(null);
  const close = () => setActive(null);

  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  const openEditor = (index) => setActive({
    mode: "edit",
    index,
    draft: items[index],
  });
  const openViewer = (index) => setActive({
    mode: "view",
    index,
    draft: items[index],
  });
  const add = useCallback(() => setActive({
    mode: "create",
    index: -1,
    draft: makeNew ? makeNew(items) : {},
  }), [items, makeNew]);

  useEffect(() => {
    if (!setSectionAddAction) return undefined;
    setSectionAddAction({ label: addLabel.replace(/^\+\s*/, ""), onClick: add });
    return () => setSectionAddAction(null);
  }, [add, addLabel, setSectionAddAction]);
  const updateDraft = (value) => setActive((current) => ({ ...current, draft: value }));
  const saveItem = () => {
    if (active.mode === "create") {
      onChange([...items, active.draft]);
    } else {
      onChange(items.map((item, index) => index === active.index ? active.draft : item));
    }
    close();
  };
  const remove = (index) => {
    const title = itemTitle ? itemTitle(items[index], index) : `item ${index + 1}`;
    if (window.confirm(`Delete "${title}"? This change will be included when you save this section.`)) {
      onChange(items.filter((_, itemIndex) => itemIndex !== index));
    }
  };

  const activeTitle = active && (
    active.mode === "create"
      ? addLabel.replace(/^\+\s*/, "").replace(/^Add\s+/i, "New ")
      : itemTitle ? itemTitle(active.draft, active.index) : `Item ${active.index + 1}`
  );
  const details = active?.draft && typeof active.draft === "object"
    ? Object.entries(active.draft).filter(([key]) => key !== "id")
    : active ? [["value", active.draft]] : [];

  return (
    <div className="adm-repeater">
      <div className="adm-repeater-list">
        {items.length === 0 && (
          <div className="adm-empty adm-repeater-empty">
            <p>{empty || "No items yet. Add one to get started."}</p>
          </div>
        )}
        {items.map((item, index) => (
          <article key={item?.id ?? index} className="adm-repeater-item">
            <div className="adm-repeater-copy">
              <span className="adm-repeater-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="adm-repeater-text">
                <h4>{itemTitle ? itemTitle(item, index) : `Item ${index + 1}`}</h4>
                {item && typeof item === "object" && (item.description || item.desc || item.text) && (
                  <p>{formatDetailValue(item.description || item.desc || item.text)}</p>
                )}
              </div>
            </div>
            <div className="adm-repeater-actions">
              <button className="adm-btn ghost sm" type="button" onClick={() => openViewer(index)}>
                <Eye size={15} /> View
              </button>
              <button className="adm-btn ghost sm" type="button" onClick={() => openEditor(index)}>
                <Pencil size={15} /> Edit
              </button>
              <button className="adm-iconbtn adm-delete-btn" type="button" title="Delete" aria-label={`Delete ${itemTitle ? itemTitle(item, index) : `item ${index + 1}`}`} onClick={() => remove(index)}>
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {active && (
        <div className="adm-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}>
          <section className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="adm-modal-title">
            <header className="adm-modal-header">
              <div>
                <span className="adm-modal-eyebrow">
                  {active.mode === "view" ? "Item details" : active.mode === "create" ? "Create item" : "Edit item"}
                </span>
                <h3 id="adm-modal-title">{activeTitle}</h3>
              </div>
              <button className="adm-iconbtn" type="button" onClick={close} aria-label="Close dialog"><X size={18} /></button>
            </header>
            <div className="adm-modal-body">
              {active.mode === "view" ? (
                <dl className="adm-detail-list">
                  {details.map(([key, value]) => (
                    <div className="adm-detail-row" key={key}>
                      <dt>{detailLabel(key)}</dt>
                      <dd>{formatDetailValue(value)}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <SectionActionContext.Provider value={null}>
                  {renderRow(active.draft, active.index, updateDraft)}
                </SectionActionContext.Provider>
              )}
            </div>
            <footer className="adm-modal-footer">
              {active.mode === "view" ? (
                <>
                  <button className="adm-btn ghost" type="button" onClick={close}>Close</button>
                  <button className="adm-btn" type="button" onClick={() => setActive({ ...active, mode: "edit" })}>
                    <Pencil size={15} /> Edit item
                  </button>
                </>
              ) : (
                <>
                  <button className="adm-btn ghost" type="button" onClick={close}>Cancel</button>
                  <button className="adm-btn" type="button" onClick={saveItem}>
                    <Save size={16} /> Save item
                  </button>
                </>
              )}
            </footer>
          </section>
        </div>
      )}
    </div>
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