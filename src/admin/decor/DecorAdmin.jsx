import { useEffect, useState } from "react";
import { loadData, saveDataSections, inr } from "../store";
import { Section, F, Text, Num, Area, ImageUpload, TagsInput, Repeater, Tabs, Toast } from "../ui";
import {
  listDiyKits, createDiyKit, updateDiyKit, deleteDiyKit,
  updateDiyKitStatus, updateDiyKitPublished,
  listThemes, createTheme, updateTheme, deleteTheme, updateThemeStatus, updateThemePublished, fromApiTheme,
  listDecorLandings, createDecorLanding, updateDecorLanding, deleteDecorLanding, updateDecorLandingStatus, updateDecorLandingPublished, fromApiDecorLanding,
  listCustomDecors, createCustomDecor, updateCustomDecor, deleteCustomDecor, fromApiCustomDecor,
  fromApiDiyKit, pageRows, isNewImage, dataUrlToFile, urlToFile, calcDiscount, slugify,
  resolveImageUrl, createdId,
} from "../../services/decorService"; // src/admin/decor -> ../../services = src/services

function SaveSection({ path, value, updates, label, onSave }) {
  return (
    <button className="adm-btn ghost sm" type="button" onClick={() => onSave(updates || [{ path, value }])}>
      Save {label}
    </button>
  );
}

const TABS = [
  { id: "kits",     label: "DIY Kits" },
  { id: "landing",  label: "Landing" },
  { id: "themes",   label: "Themes" },
  { id: "custom",   label: "Custom Decor" },
  { id: "enquiry",  label: "Enquiry options" },
];

const IMG_SLOTS = 5;
const GALLERY_SLOTS = 4;

export default function DecorAdmin() {
  const [tab, setTab] = useState("kits");
  const [data, setData] = useState(() => loadData());
  const [toast, setToast] = useState("");

  // FIX: toast stays longer so error messages can be read
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 6000); };
  const saveSection = (updates) =>
    flash(saveDataSections(updates) ? "Section saved" : "Could not save. Browser storage may be full; remove some images and try again.");
  const patch = (path, value) => setData((d) => ({ ...d, decor: { ...d.decor, [path]: value } }));

  return (
    <>
      <div className="adm-between" style={{ marginBottom: 14 }}>
        <p className="adm-hint" style={{ margin: 0 }}>DIY kits, themes, landing cards and custom decor are saved to the server. Other sections are saved separately after editing.</p>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "kits"    && <Kits flash={flash} />}
      {tab === "landing" && <ServerLanding flash={flash} />}
      {tab === "themes"  && <ServerThemes flash={flash} />}
      {tab === "custom"  && <ServerCustom flash={flash} />}
      {tab === "enquiry" && <EnquiryOpts data={data} patch={patch} saveSection={saveSection} />}

      <Toast text={toast} />
    </>
  );
}

/* ---------- helpers ---------- */
// FIX: swap every image url for one that really loads (handles wrong prefix / host), so thumbnails,
// the edit previews and the re-upload on save all use a working url.
const resolveList = (list = []) => Promise.all(list.map(resolveImageUrl));

// new records are created unpublished by the server, so publish right after creating when asked
const PublishChoice = ({ value, onChange }) => (
  <F label="Publish immediately (show on the customer website)">
    <select value={value ? "true" : "false"} onChange={(e) => onChange(e.target.value === "true")}>
      <option value="true">Yes, publish</option>
      <option value="false">No, keep unpublished</option>
    </select>
  </F>
);

const Thumb = ({ src }) =>
  src
    ? <img src={src} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} />
    : <div style={{ width: 56, height: 56, borderRadius: 8, background: "#f3e5de" }} />;

/* ---------- image slot editor ---------- */
function ImageSlots({ images = [], onChange }) {
  const slots = Array.from({ length: Math.max(IMG_SLOTS, images.length) }, (_, i) => images[i] || "");
  return (
    <F label={`Images (at least ${IMG_SLOTS} slots · blank slots are skipped)`}>
      <div className="adm-gal">
        {slots.map((image, i) => (
          <ImageUpload key={i} label={`Image slot ${i + 1}`} value={image} compact
            onChange={(value) => onChange(slots.map((current, k) => (k === i ? value : current)))}
            onRemove={i >= IMG_SLOTS ? () => onChange(slots.filter((_, k) => k !== i)) : undefined} />
        ))}
        <button type="button" className="adm-gal-add" onClick={() => onChange([...slots, ""])}>
          <span style={{ fontSize: 18 }}>+</span>Add image
        </button>
      </div>
    </F>
  );
}

/* ---------- KITS (server driven) ---------- */
const emptyKit = () => ({
  id: null, slug: "", title: "", cat: "", tag: "", popularity: 50, price: 0, mrp: 0,
  weight: "", footprint: "", desc: "", status: "ACTIVE", images: ["", "", "", "", ""], published: true,
});

function Kits({ flash }) {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // kit being edited / created
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = pageRows(await listDiyKits()).map(fromApiDiyKit);
      await Promise.all(rows.map(async (r) => { r.images = await resolveList(r.images); }));
      setKits(rows);
    } catch (e) {
      setError(e?.message || "Could not load DIY kits.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const categories = [...new Set(kits.map((k) => k.cat).filter(Boolean))];
  const visible = filter === "all" ? kits : kits.filter((k) => k.cat === filter);

  const save = async () => {
    const k = editing;
    if (!k.title.trim()) return flash("Enter a title");
    if (!k.cat.trim()) return flash("Enter a category");
    if (!(Number(k.price) > 0)) return flash("Enter the selling price");
    setSaving(true);
    try {
      const files = [];
      for (let i = 0; i < k.images.length; i++) {
        const src = k.images[i];
        if (!src) continue;
        files.push(isNewImage(src) ? await dataUrlToFile(src, `kit-${i + 1}`) : await urlToFile(src, `kit-${i + 1}`));
      }
      const kit = { ...k, slug: k.slug || slugify(k.title) };
      if (k.id) {
        await updateDiyKit(k.id, { kit, images: files });
      } else {
        const res = await createDiyKit({ kit, images: files });
        const id = createdId(res);
        if (id && k.published) await updateDiyKitPublished(id, true);
      }
      flash(k.id ? "Kit updated" : "Kit created");
      setEditing(null);
      await load();
    } catch (e) {
      flash(e?.message || "Could not save the kit");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (k) => {
    if (!window.confirm(`Delete "${k.title}"?`)) return;
    try {
      await deleteDiyKit(k.id);
      flash("Kit deleted");
      await load();
    } catch (e) {
      flash(e?.message || "Could not delete the kit");
    }
  };

  const toggleStatus = async (k) => {
    const next = k.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateDiyKitStatus(k.id, next);
      flash(`Kit marked ${next}`);
      await load();
    } catch (e) {
      flash(e?.message || "Could not update the status");
    }
  };

  const togglePublished = async (k) => {
    const next = !k.published;
    try {
      await updateDiyKitPublished(k.id, next);
      flash(next ? "Kit published" : "Kit unpublished");
      await load();
    } catch (e) {
      flash(e?.message || "Could not update the published status");
    }
  };

  if (editing) {
    const k = editing;
    const upd = (p) => setEditing({ ...k, ...p });
    return (
      <Section title={k.id ? `Edit kit · ${k.title}` : "New DIY kit"} sub="Saving replaces all images of this kit with the ones shown below."
        right={
          <>
            <button className="adm-btn ghost sm" type="button" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>{" "}
            <button className="adm-btn sm" type="button" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save kit"}</button>
          </>
        }>
        <div className="adm-grid2">
          <Text label="Title" value={k.title} onChange={(v) => upd({ title: v })} />
          <Text label="Slug / id" value={k.slug} onChange={(v) => upd({ slug: v })} hint="Used in the URL. Leave blank to generate from the title." />
        </div>
        <div className="adm-grid3">
          <F label="Category">
            <input list="decor-kit-cats" value={k.cat} onChange={(e) => upd({ cat: e.target.value })} placeholder="e.g. Haldi & Mehendi" />
            <datalist id="decor-kit-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </F>
          <Text label="Tag / eyebrow" value={k.tag} onChange={(v) => upd({ tag: v })} />
          <Num label="Popularity" value={k.popularity} onChange={(v) => upd({ popularity: v })} hint="Higher shows earlier" />
        </div>
        <div className="adm-grid3">
          <Num label="Price (₹)" value={k.price} onChange={(v) => upd({ price: v })} />
          <Num label="MRP (₹)" value={k.mrp} onChange={(v) => upd({ mrp: v })} />
          <F label="Discount">
            <input value={calcDiscount(Number(k.price), Number(k.mrp)) ? `${calcDiscount(Number(k.price), Number(k.mrp))}% OFF` : "—"} disabled />
          </F>
        </div>
        <div className="adm-grid3">
          <Text label="Shipping weight" value={k.weight} onChange={(v) => upd({ weight: v })} placeholder="8.2 kg Total Box" />
          <Text label="Footprint" value={k.footprint} onChange={(v) => upd({ footprint: v })} placeholder="Fits 8x8 to 10x10 ft" />
          <F label="Status">
            <select value={k.status} onChange={(e) => upd({ status: e.target.value })}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </F>
        </div>
        {!k.id && <PublishChoice value={k.published} onChange={(v) => upd({ published: v })} />}
        <Area label="Description" value={k.desc} onChange={(v) => upd({ desc: v })} rows={3} />
        <ImageSlots images={k.images} onChange={(v) => upd({ images: v })} />
      </Section>
    );
  }

  return (
    <Section title={`DIY Kits (${kits.length})`} sub="Loaded from the server. Create, edit or delete kits here."
      right={<button className="adm-btn sm" type="button" onClick={() => setEditing(emptyKit())}>+ Add kit</button>}>
      {categories.length > 0 && (
        <div className="adm-toolbar adm-kit-filter">
          <div className="adm-seg">
            <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All</button>
            {categories.map((c) => (
              <button key={c} className={filter === c ? "on" : ""} onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="adm-hint">Loading kits…</p>}
      {error && (
        <p className="adm-hint" style={{ color: "#c0262d" }}>
          {error} <button className="adm-btn ghost sm" type="button" onClick={load}>Retry</button>
        </p>
      )}
      {!loading && !error && visible.length === 0 && <p className="adm-hint">No kits yet. Click “Add kit” to create the first one.</p>}

      {visible.map((k) => (
        <div key={k.id} className="adm-between" style={{ gap: 12, padding: "10px 0", borderBottom: "1px solid #eee" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Thumb src={k.images[0]} />
            <div style={{ minWidth: 0 }}>
              <b>{k.title || "—"}</b>
              <div className="adm-hint" style={{ margin: 0 }}>{k.cat} · {inr(k.price)} · MRP {inr(k.mrp)} · {k.status} · {k.published ? "Published" : "Unpublished"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="adm-btn ghost sm" type="button" onClick={() => toggleStatus(k)}>{k.status === "ACTIVE" ? "Deactivate" : "Activate"}</button>
            <button className="adm-btn ghost sm" type="button" onClick={() => togglePublished(k)}>{k.published ? "Unpublish" : "Publish"}</button>
            <button className="adm-btn ghost sm" type="button" onClick={() => setEditing({ ...k, images: [...k.images, ...Array(Math.max(0, IMG_SLOTS - k.images.length)).fill("")] })}>Edit</button>
            <button className="adm-btn ghost sm" type="button" onClick={() => remove(k)}>Delete</button>
          </div>
        </div>
      ))}
    </Section>
  );
}

/* ---------- LANDING CARDS (server driven) ----------
   Only published + ACTIVE cards show on the customer Decor landing page (oldest first).
   The card opens DIY kits / Themes / Custom by keywords in its title or button label ("diy"/"kit", "theme", "custom"),
   otherwise by position: 1st = DIY kits, 2nd = Themes, 3rd = Custom. */
const emptyLanding = () => ({ id: null, title: "", cta: "Explore", text: "", status: "ACTIVE", image: "", published: true });

function ServerLanding({ flash }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = pageRows(await listDecorLandings()).map(fromApiDecorLanding);
      await Promise.all(rows.map(async (r) => { r.image = await resolveImageUrl(r.image); }));
      setCards(rows);
    } catch (e) {
      setError(e?.message || "Could not load landing cards.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const c = editing;
    if (!c.title.trim()) return flash("Enter a title");
    if (!c.cta.trim()) return flash("Enter the button label");
    if (!c.id && !c.image) return flash("Choose a card image");
    setSaving(true);
    try {
      // only a newly chosen picture is uploaded; on update the old image stays when none is sent
      const image = isNewImage(c.image) ? await dataUrlToFile(c.image, "card") : null;
      if (c.id) {
        await updateDecorLanding(c.id, { card: c, image });
      } else {
        const res = await createDecorLanding({ card: c, image });
        const id = createdId(res);
        if (id && c.published) await updateDecorLandingPublished(id, true);
      }
      flash(c.id ? "Landing card updated" : "Landing card created");
      setEditing(null);
      await load();
    } catch (e) {
      flash(e?.message || "Could not save the landing card");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.title}"?`)) return;
    try {
      await deleteDecorLanding(c.id);
      flash("Landing card deleted");
      await load();
    } catch (e) {
      flash(e?.message || "Could not delete the landing card");
    }
  };

  const toggleStatus = async (c) => {
    const next = c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateDecorLandingStatus(c.id, next);
      flash(`Landing card marked ${next}`);
      await load();
    } catch (e) {
      flash(e?.message || "Could not update the status");
    }
  };

  const togglePublished = async (c) => {
    const next = !c.published;
    try {
      await updateDecorLandingPublished(c.id, next);
      flash(next ? "Landing card published" : "Landing card unpublished");
      await load();
    } catch (e) {
      flash(e?.message || "Could not update the published status");
    }
  };

  if (editing) {
    const c = editing;
    const upd = (p) => setEditing({ ...c, ...p });
    return (
      <Section title={c.id ? `Edit landing card · ${c.title}` : "New landing card"} sub="Choose a new image only if you want to replace the current one."
        right={
          <>
            <button className="adm-btn ghost sm" type="button" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>{" "}
            <button className="adm-btn sm" type="button" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save card"}</button>
          </>
        }>
        <div className="adm-grid2">
          <Text label="Title" value={c.title} onChange={(v) => upd({ title: v })} />
          <Text label="Button label (CTA)" value={c.cta} onChange={(v) => upd({ cta: v })} placeholder="e.g. Explore DIY" />
        </div>
        <F label="Status">
          <select value={c.status} onChange={(e) => upd({ status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </F>
        {!c.id && <PublishChoice value={c.published} onChange={(v) => upd({ published: v })} />}
        <Area label="Text" value={c.text} onChange={(v) => upd({ text: v })} rows={3} />
        <ImageUpload label="Card image" value={c.image} onChange={(v) => upd({ image: v })} />
      </Section>
    );
  }

  return (
    <Section title={`Landing cards (${cards.length})`} sub="Loaded from the server. The customer Decor page shows the published + ACTIVE cards, oldest first."
      right={<button className="adm-btn sm" type="button" onClick={() => setEditing(emptyLanding())}>+ Add card</button>}>
      {loading && <p className="adm-hint">Loading landing cards…</p>}
      {error && (
        <p className="adm-hint" style={{ color: "#c0262d" }}>
          {error} <button className="adm-btn ghost sm" type="button" onClick={load}>Retry</button>
        </p>
      )}
      {!loading && !error && cards.length === 0 && <p className="adm-hint">No landing cards yet. Click “Add card” to create the first one.</p>}

      {cards.map((c) => (
        <div key={c.id} className="adm-between" style={{ gap: 12, padding: "10px 0", borderBottom: "1px solid #eee" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Thumb src={c.image} />
            <div style={{ minWidth: 0 }}>
              <b>{c.title || "—"}</b>
              <div className="adm-hint" style={{ margin: 0 }}>{c.cta} · {c.status} · {c.published ? "Published" : "Unpublished"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="adm-btn ghost sm" type="button" onClick={() => toggleStatus(c)}>{c.status === "ACTIVE" ? "Deactivate" : "Activate"}</button>
            <button className="adm-btn ghost sm" type="button" onClick={() => togglePublished(c)}>{c.published ? "Unpublish" : "Publish"}</button>
            <button className="adm-btn ghost sm" type="button" onClick={() => setEditing({ ...c })}>Edit</button>
            <button className="adm-btn ghost sm" type="button" onClick={() => remove(c)}>Delete</button>
          </div>
        </div>
      ))}
    </Section>
  );
}

/* ---------- THEMES (server driven) ----------
   Create / edit / delete, ACTIVE <-> INACTIVE and Publish <-> Unpublish through the Themes APIs.
   Only published + ACTIVE themes show on the customer website. */
const emptyTheme = () => ({
  id: null, slug: "", title: "", tag: "Festive Celebration Atelier", startsAt: 0,
  desc: "", status: "ACTIVE", images: ["", "", "", "", ""], published: true,
});

function ServerThemes({ flash }) {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = pageRows(await listThemes()).map(fromApiTheme);
      await Promise.all(rows.map(async (r) => { r.images = await resolveList(r.images); }));
      setThemes(rows);
    } catch (e) {
      setError(e?.message || "Could not load themes.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const t = editing;
    if (!t.title.trim()) return flash("Enter a title");
    if (!(Number(t.startsAt) > 0)) return flash("Enter the starting price");
    setSaving(true);
    try {
      const files = [];
      for (let i = 0; i < t.images.length; i++) {
        const src = t.images[i];
        if (!src) continue;
        files.push(isNewImage(src) ? await dataUrlToFile(src, `theme-${i + 1}`) : await urlToFile(src, `theme-${i + 1}`));
      }
      const theme = { ...t, slug: t.slug || slugify(t.title) };
      if (t.id) {
        await updateTheme(t.id, { theme, images: files });
      } else {
        const res = await createTheme({ theme, images: files });
        const id = createdId(res);
        // a new theme is unpublished by default, so it never showed on the website: publish it now
        if (id && t.published) await updateThemePublished(id, true);
      }
      flash(t.id ? "Theme updated" : "Theme created");
      setEditing(null);
      await load();
    } catch (e) {
      console.error("[ServerThemes] save failed:", e);
      flash(e?.message || "Could not save the theme");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete "${t.title}"?`)) return;
    try {
      await deleteTheme(t.id);
      flash("Theme deleted");
      await load();
    } catch (e) {
      flash(e?.message || "Could not delete the theme");
    }
  };

  const toggleStatus = async (t) => {
    const next = t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateThemeStatus(t.id, next);
      flash(`Theme marked ${next}`);
      await load();
    } catch (e) {
      flash(e?.message || "Could not update the status");
    }
  };

  const togglePublished = async (t) => {
    const next = !t.published;
    try {
      await updateThemePublished(t.id, next);
      flash(next ? "Theme published" : "Theme unpublished");
      await load();
    } catch (e) {
      flash(e?.message || "Could not update the published status");
    }
  };

  if (editing) {
    const t = editing;
    const upd = (p) => setEditing({ ...t, ...p });
    return (
      <Section title={t.id ? `Edit theme · ${t.title}` : "New theme"} sub="Saving replaces all images of this theme with the ones shown below."
        right={
          <>
            <button className="adm-btn ghost sm" type="button" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>{" "}
            <button className="adm-btn sm" type="button" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save theme"}</button>
          </>
        }>
        <div className="adm-grid2">
          <Text label="Title" value={t.title} onChange={(v) => upd({ title: v })} />
          <Text label="Slug / id" value={t.slug} onChange={(v) => upd({ slug: v })} hint="Used in the URL. Leave blank to generate from the title." />
        </div>
        <div className="adm-grid3">
          <Text label="Tag" value={t.tag} onChange={(v) => upd({ tag: v })} />
          <Num label="Starting price (₹)" value={t.startsAt} onChange={(v) => upd({ startsAt: v })} />
          <F label="Status">
            <select value={t.status} onChange={(e) => upd({ status: e.target.value })}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </F>
        </div>
        {!t.id && <PublishChoice value={t.published} onChange={(v) => upd({ published: v })} />}
        <Area label="Description" value={t.desc} onChange={(v) => upd({ desc: v })} rows={3} />
        <ImageSlots images={t.images} onChange={(v) => upd({ images: v })} />
      </Section>
    );
  }

  return (
    <Section title={`Themes (${themes.length})`} sub="Loaded from the server. Create, edit, delete, activate or publish themes here."
      right={<button className="adm-btn sm" type="button" onClick={() => setEditing(emptyTheme())}>+ Add theme</button>}>
      {loading && <p className="adm-hint">Loading themes…</p>}
      {error && (
        <p className="adm-hint" style={{ color: "#c0262d" }}>
          {error} <button className="adm-btn ghost sm" type="button" onClick={load}>Retry</button>
        </p>
      )}
      {!loading && !error && themes.length === 0 && <p className="adm-hint">No themes yet. Click “Add theme” to create the first one.</p>}

      {themes.map((t) => (
        <div key={t.id} className="adm-between" style={{ gap: 12, padding: "10px 0", borderBottom: "1px solid #eee" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Thumb src={t.images[0]} />
            <div style={{ minWidth: 0 }}>
              <b>{t.title || "—"}</b>
              <div className="adm-hint" style={{ margin: 0 }}>{t.tag} · from {inr(t.startsAt)} · {t.status} · {t.published ? "Published" : "Unpublished"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="adm-btn ghost sm" type="button" onClick={() => toggleStatus(t)}>{t.status === "ACTIVE" ? "Deactivate" : "Activate"}</button>
            <button className="adm-btn ghost sm" type="button" onClick={() => togglePublished(t)}>{t.published ? "Unpublish" : "Publish"}</button>
            <button className="adm-btn ghost sm" type="button" onClick={() => setEditing({ ...t, images: [...t.images, ...Array(Math.max(0, IMG_SLOTS - t.images.length)).fill("")] })}>Edit</button>
            <button className="adm-btn ghost sm" type="button" onClick={() => remove(t)}>Delete</button>
          </div>
        </div>
      ))}
    </Section>
  );
}

/* ---------- CUSTOM DECOR (server driven) ----------
   Only published + ACTIVE records show on the customer website.
   Saving sends the hero + gallery pictures shown below (already uploaded ones are downloaded and sent again). */
const emptyCustom = () => ({
  id: null, title: "", price: 0, about: "", specialisations: [],
  stats: [{ n: "", l: "", s: "" }], status: "ACTIVE", published: true,
  hero: "", gallery: Array(GALLERY_SLOTS).fill(""),
});

function ServerCustom({ flash }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const list = pageRows(await listCustomDecors()).map(fromApiCustomDecor);
      await Promise.all(list.map(async (r) => {
        r.hero = await resolveImageUrl(r.hero);
        r.gallery = await resolveList(r.gallery);
      }));
      setRows(list);
    } catch (e) {
      setError(e?.message || "Could not load custom decor.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const c = editing;
    if (!c.title.trim()) return flash("Enter a title");
    if (!(Number(c.price) > 0)) return flash("Enter the starting price");
    setSaving(true);
    try {
      const toFile = async (src, name) => (isNewImage(src) ? dataUrlToFile(src, name) : urlToFile(src, name));
      const heroImage = c.hero ? await toFile(c.hero, "hero") : null;
      const galleryImages = [];
      for (let i = 0; i < c.gallery.length; i++) {
        if (!c.gallery[i]) continue;
        galleryImages.push(await toFile(c.gallery[i], `gallery-${i + 1}`));
      }
      if (c.id) await updateCustomDecor(c.id, { custom: c, heroImage, galleryImages });
      else await createCustomDecor({ custom: c, heroImage, galleryImages });
      flash(c.id ? "Custom decor updated" : "Custom decor created");
      setEditing(null);
      await load();
    } catch (e) {
      flash(e?.message || "Could not save the custom decor");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.title}"?`)) return;
    try {
      await deleteCustomDecor(c.id);
      flash("Custom decor deleted");
      await load();
    } catch (e) {
      flash(e?.message || "Could not delete the custom decor");
    }
  };

  const edit = (c) => setEditing({
    ...c,
    about: c.about.join("\n\n"),
    stats: c.stats.length ? c.stats : [{ n: "", l: "", s: "" }],
    gallery: [...c.gallery, ...Array(Math.max(0, GALLERY_SLOTS - c.gallery.length)).fill("")],
  });

  if (editing) {
    const c = editing;
    const upd = (p) => setEditing({ ...c, ...p });
    return (
      <Section title={c.id ? `Edit custom decor · ${c.title}` : "New custom decor"} sub="Saving replaces the hero and gallery images with the ones shown below."
        right={
          <>
            <button className="adm-btn ghost sm" type="button" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>{" "}
            <button className="adm-btn sm" type="button" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save custom decor"}</button>
          </>
        }>
        <div className="adm-grid2">
          <Text label="Title" value={c.title} onChange={(v) => upd({ title: v })} />
          <Num label="Starting price (₹)" value={c.price} onChange={(v) => upd({ price: v })} />
        </div>
        <div className="adm-grid2">
          <F label="Status">
            <select value={c.status} onChange={(e) => upd({ status: e.target.value })}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </F>
          <F label="Published (shown on the customer website)">
            <select value={c.published ? "true" : "false"} onChange={(e) => upd({ published: e.target.value === "true" })}>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
          </F>
        </div>

        <ImageUpload label="Hero image" value={c.hero} onChange={(v) => upd({ hero: v })} onRemove={c.hero ? () => upd({ hero: "" }) : undefined} />
        <F label="Gallery (4 or more images · blank slots are skipped)">
          <div className="adm-gal">
            {c.gallery.map((image, i) => (
              <ImageUpload key={i} label={`Gallery image ${i + 1}`} value={image} compact
                onChange={(v) => upd({ gallery: c.gallery.map((cur, x) => (x === i ? v : cur)) })}
                onRemove={i >= GALLERY_SLOTS ? () => upd({ gallery: c.gallery.filter((_, x) => x !== i) }) : undefined} />
            ))}
            <button type="button" className="adm-gal-add" onClick={() => upd({ gallery: [...c.gallery, ""] })}>
              <span style={{ fontSize: 18 }}>+</span>Add image
            </button>
          </div>
        </F>

        <Area label="About paragraphs" value={c.about} onChange={(v) => upd({ about: v })} rows={6}
          placeholder="Write about the service. Use a blank line between paragraphs. Wrap text in **double stars** to make it bold." />

        <F label="Specialisations">
          <TagsInput label="" value={c.specialisations} onChange={(v) => upd({ specialisations: v })} placeholder="Add a specialisation…" />
        </F>

        <F label="Stats">
          <Repeater
            items={c.stats}
            onChange={(v) => upd({ stats: v })}
            itemTitle={(s) => `${s.n || "—"} · ${s.l || "—"}`}
            makeNew={() => ({ n: "", l: "", s: "" })}
            renderRow={(s, i, u) => (
              <div className="adm-grid3">
                <Text label="Number" value={s.n} onChange={(v) => u({ ...s, n: v })} />
                <Text label="Label" value={s.l} onChange={(v) => u({ ...s, l: v })} />
                <Text label="Sub-label" value={s.s} onChange={(v) => u({ ...s, s: v })} />
              </div>
            )}
          />
        </F>
      </Section>
    );
  }

  return (
    <Section title={`Custom Decor (${rows.length})`} sub="Loaded from the server. Create, edit or delete custom decor here. The customer page shows the latest published + ACTIVE one."
      right={<button className="adm-btn sm" type="button" onClick={() => setEditing(emptyCustom())}>+ Add custom decor</button>}>
      {loading && <p className="adm-hint">Loading custom decor…</p>}
      {error && (
        <p className="adm-hint" style={{ color: "#c0262d" }}>
          {error} <button className="adm-btn ghost sm" type="button" onClick={load}>Retry</button>
        </p>
      )}
      {!loading && !error && rows.length === 0 && <p className="adm-hint">Nothing yet. Click “Add custom decor” to create the first one.</p>}

      {rows.map((c) => (
        <div key={c.id} className="adm-between" style={{ gap: 12, padding: "10px 0", borderBottom: "1px solid #eee" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Thumb src={c.hero || c.gallery[0]} />
            <div style={{ minWidth: 0 }}>
              <b>{c.title || "—"}</b>
              <div className="adm-hint" style={{ margin: 0 }}>from {inr(c.price)} · {c.status} · {c.published ? "Published" : "Unpublished"} · {c.gallery.length} gallery image{c.gallery.length === 1 ? "" : "s"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="adm-btn ghost sm" type="button" onClick={() => edit(c)}>Edit</button>
            <button className="adm-btn ghost sm" type="button" onClick={() => remove(c)}>Delete</button>
          </div>
        </div>
      ))}
    </Section>
  );
}

function EnquiryOpts({ data, patch, saveSection }) {
  return (
    <>
      <Section title="Occasions" sub="Options in the Decor enquiry form's occasion dropdown."
        right={<SaveSection path="decor.occasions" value={data.decor.occasions} label="occasions" onSave={saveSection} />}>
        <TagsInput label="" value={data.decor.occasions} onChange={(v) => patch("occasions", v)} placeholder="Add an occasion…" />
      </Section>
      <Section title="Budgets" sub="Options in the Decor enquiry form's budget dropdown."
        right={<SaveSection path="decor.budgets" value={data.decor.budgets} label="budgets" onSave={saveSection} />}>
        <TagsInput label="" value={data.decor.budgets} onChange={(v) => patch("budgets", v)} placeholder="e.g. ₹3L - ₹6L" />
      </Section>
    </>
  );
}
