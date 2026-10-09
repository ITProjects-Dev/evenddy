import { useState } from "react";
import { loadData, saveData, uid, inr } from "../store";
import { Section, F, Text, Num, Area, TagsInput, Repeater, Tabs, Toast } from "../ui";

const TABS = [
  { id: "landing",  label: "Landing" },
  { id: "kits",     label: "DIY Kits" },
  { id: "themes",   label: "Themes" },
  { id: "custom",   label: "Custom Decor" },
  { id: "enquiry",  label: "Enquiry options" },
];

const IMG_SLOTS = 5; // matches five(images) in DecorExplore

export default function DecorAdmin() {
  const [tab, setTab] = useState("kits");
  const [data, setData] = useState(() => loadData());
  const [toast, setToast] = useState("");

  const save = () => { saveData(data); setToast("Decor data saved"); setTimeout(() => setToast(""), 2200); };
  const patch = (path, value) => setData((d) => ({ ...d, decor: { ...d.decor, [path]: value } }));

  return (
    <>
      <div className="adm-between" style={{ marginBottom: 14 }}>
        <p className="adm-hint" style={{ margin: 0 }}>Prices, MRP and images are all editable below.</p>
        <button className="adm-btn" onClick={save}>Save decor</button>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "landing" && <Landing data={data} patch={patch} />}
      {tab === "kits"    && <Kits    data={data} patch={patch} />}
      {tab === "themes"  && <Themes  data={data} patch={patch} />}
      {tab === "custom"  && <Custom  data={data} patch={patch} />}
      {tab === "enquiry" && <EnquiryOpts data={data} patch={patch} />}

      <Toast text={toast} />
    </>
  );
}

/* ---------- 5 image slot editor ---------- */
function ImageSlots({ images = [], onChange }) {
  const five = Array.from({ length: IMG_SLOTS }, (_, i) => images[i] || "");
  return (
    <F label={`Images (${IMG_SLOTS} slots · blank = illustrated fallback)`}>
      <div className="adm-gal">
        {five.map((url, i) => (
          <div key={i} className="adm-gal-i" style={url ? { backgroundImage: `url(${url})` } : undefined}>
            <span style={{ fontSize: 11, opacity: url ? 0 : .7 }}>{url ? "" : `Slot ${i + 1}`}</span>
            <input value={url} onChange={(e) => onChange(five.map((g, k) => (k === i ? e.target.value : g)))}
              placeholder="Image URL"
              style={{ position: "absolute", left: 6, right: 6, bottom: 6, fontSize: 11, padding: "5px 7px", borderRadius: 7, border: "1px solid var(--line)", background: "rgba(255,255,255,.94)" }} />
          </div>
        ))}
      </div>
    </F>
  );
}

/* ---------- landing cards ---------- */
function Landing({ data, patch }) {
  const cards = data.decor.landing;
  return (
    <Section title="Landing cards" sub="The 3 cards on the Decor landing page.">
      <Repeater
        items={cards}
        onChange={(v) => patch("landing", v)}
        itemTitle={(c) => c.title}
        makeNew={() => ({ id: uid("d"), title: "New card", cta: "Explore", text: "", image: "", collage: ["", "", ""] })}
        renderRow={(c, i, upd) => (
          <>
            <div className="adm-grid2">
              <Text label="Title" value={c.title} onChange={(v) => upd({ ...c, title: v })} />
              <Text label="CTA label" value={c.cta} onChange={(v) => upd({ ...c, cta: v })} />
            </div>
            <Area label="Text" value={c.text} onChange={(v) => upd({ ...c, text: v })} rows={3} />
            {c.id === "themes" ? (
              <F label="Collage (3 images)">
                <div className="adm-grid3">
                  {[0, 1, 2].map((k) => (
                    <Text key={k} label={`Image ${k + 1}`} value={(c.collage || [])[k] || ""}
                      onChange={(v) => upd({ ...c, collage: [0, 1, 2].map((x) => (x === k ? v : (c.collage || [])[x] || "")) })} />
                  ))}
                </div>
              </F>
            ) : (
              <Text label="Image URL" value={c.image} onChange={(v) => upd({ ...c, image: v })} />
            )}
          </>
        )}
      />
    </Section>
  );
}

/* ---------- KITS ---------- */
function Kits({ data, patch }) {
  const cats = data.decor.kitCategories;
  const kits = data.decor.kits;
  const [filter, setFilter] = useState("all");
  const visible = filter === "all" ? kits : kits.filter((k) => k.cat === filter);

  return (
    <>
      <Section title="Kit categories" sub="Filter tabs on the DIY kits listing page.">
        <TagsInput label="Categories" value={cats} onChange={(v) => patch("kitCategories", v)}
          placeholder="Add a category…"
          suggestions={["Haldi & Mehendi", "Birthdays & Milestones", "Baby Shower & Welcome", "Anniversary & Dates", "Festive & Pooja"]} />
      </Section>

      <Section title={`DIY Kits (${kits.length})`} sub="Selling price, MRP, images and shipping details."
        right={
          <div className="adm-seg">
            <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All</button>
            {cats.filter((c) => c !== "All Kits").map((c) => (
              <button key={c} className={filter === c ? "on" : ""} onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>
        }>
        <Repeater
          items={visible}
          onChange={(next) => {
            if (filter === "all") return patch("kits", next);
            const others = kits.filter((k) => k.cat !== filter);
            patch("kits", [...others, ...next]);
          }}
          itemTitle={(k) => `${k.title || "—"} · ${inr(k.price)}`}
          makeNew={() => ({
            id: uid("kit"), cat: cats[1] || "Haldi & Mehendi", tag: "", title: "New kit", desc: "",
            price: 0, mrp: 0, popularity: 50, weight: "", footprint: "",
            images: ["", "", "", "", ""],
          })}
          renderRow={(k, i, upd) => (
            <>
              <div className="adm-grid2">
                <Text label="Title" value={k.title} onChange={(v) => upd({ ...k, title: v })} />
                <Text label="Slug / id" value={k.id} onChange={(v) => upd({ ...k, id: v })} hint="Used in the URL. Keep unique." />
              </div>
              <div className="adm-grid3">
                <F label="Category">
                  <select value={k.cat} onChange={(e) => upd({ ...k, cat: e.target.value })}>
                    {cats.filter((c) => c !== "All Kits").map((c) => <option key={c}>{c}</option>)}
                  </select>
                </F>
                <Text label="Tag / eyebrow" value={k.tag} onChange={(v) => upd({ ...k, tag: v })} />
                <Num label="Popularity" value={k.popularity} onChange={(v) => upd({ ...k, popularity: v })} hint="Higher shows earlier" />
              </div>
              <div className="adm-grid3">
                <Num label="Price (₹)" value={k.price} onChange={(v) => upd({ ...k, price: v })} />
                <Num label="MRP (₹)" value={k.mrp} onChange={(v) => upd({ ...k, mrp: v })} />
                <F label="Discount">
                  <input value={k.mrp && k.price ? `${Math.round((1 - k.price / k.mrp) * 100)}% OFF` : "—"} disabled />
                </F>
              </div>
              <div className="adm-grid2">
                <Text label="Shipping weight" value={k.weight} onChange={(v) => upd({ ...k, weight: v })} placeholder="8.2 kg Total Box" />
                <Text label="Footprint" value={k.footprint} onChange={(v) => upd({ ...k, footprint: v })} placeholder="Fits 8x8 to 10x10 ft" />
              </div>
              <Area label="Description" value={k.desc} onChange={(v) => upd({ ...k, desc: v })} rows={3} />
              <ImageSlots images={k.images} onChange={(v) => upd({ ...k, images: v })} />
            </>
          )}
        />
      </Section>
    </>
  );
}

/* ---------- THEMES ---------- */
function Themes({ data, patch }) {
  const themes = data.decor.themes;
  return (
    <Section title={`Themes (${themes.length})`} sub="Professional setup by event artists. Only starting price is required.">
      <Repeater
        items={themes}
        onChange={(v) => patch("themes", v)}
        itemTitle={(t) => `${t.title || "—"} · from ${inr(t.startsAt)}`}
        makeNew={() => ({ id: uid("theme"), tag: "Festive Celebration Atelier", title: "New theme", startsAt: 0, desc: "", images: ["","","","",""] })}
        renderRow={(t, i, upd) => (
          <>
            <div className="adm-grid2">
              <Text label="Title" value={t.title} onChange={(v) => upd({ ...t, title: v })} />
              <Text label="Slug / id" value={t.id} onChange={(v) => upd({ ...t, id: v })} />
            </div>
            <div className="adm-grid2">
              <Text label="Tag" value={t.tag} onChange={(v) => upd({ ...t, tag: v })} />
              <Num label="Starting price (₹)" value={t.startsAt} onChange={(v) => upd({ ...t, startsAt: v })} />
            </div>
            <Area label="Description" value={t.desc} onChange={(v) => upd({ ...t, desc: v })} rows={3} />
            <ImageSlots images={t.images} onChange={(v) => upd({ ...t, images: v })} />
          </>
        )}
      />
    </Section>
  );
}

/* ---------- CUSTOM ---------- */
function Custom({ data, patch }) {
  const c = data.decor.custom;
  const set = (v) => patch("custom", v);
  return (
    <>
      <Section title="Custom decor — hero & price">
        <div className="adm-grid2">
          <Text label="Title" value={c.title} onChange={(v) => set({ ...c, title: v })} />
          <Num label="Starting price (₹)" value={c.price} onChange={(v) => set({ ...c, price: v })} />
        </div>
        <Text label="Hero image URL" value={c.hero} onChange={(v) => set({ ...c, hero: v })} />
        <F label="Gallery (4 slots)">
          <div className="adm-gal">
            {Array.from({ length: 4 }).map((_, i) => {
              const url = (c.gallery || [])[i] || "";
              return (
                <div key={i} className="adm-gal-i" style={url ? { backgroundImage: `url(${url})` } : undefined}>
                  <span style={{ fontSize: 11 }}>{url ? "" : `Slot ${i + 1}`}</span>
                  <input value={url} onChange={(e) =>
                    set({ ...c, gallery: [0,1,2,3].map((x) => (x === i ? e.target.value : (c.gallery || [])[x] || "")) })}
                    placeholder="Image URL"
                    style={{ position: "absolute", left: 6, right: 6, bottom: 6, fontSize: 11, padding: "5px 7px", borderRadius: 7, border: "1px solid var(--line)", background: "rgba(255,255,255,.94)" }} />
                </div>
              );
            })}
          </div>
        </F>
      </Section>

      <Section title="About paragraphs">
        <Repeater
          items={c.about || []}
          onChange={(v) => set({ ...c, about: v })}
          makeNew={() => ""}
          itemTitle={(p) => p.slice(0, 60) || "Paragraph"}
          renderRow={(p, i, upd) => <Area value={p} onChange={(v) => upd(v)} rows={4} />}
        />
      </Section>

      <Section title="Specialisations">
        <TagsInput label="" value={c.specialisations || []} onChange={(v) => set({ ...c, specialisations: v })} placeholder="Add a specialisation…" />
      </Section>

      <Section title="Stats">
        <Repeater
          items={c.stats || []}
          onChange={(v) => set({ ...c, stats: v })}
          itemTitle={(s) => `${s.n} · ${s.l}`}
          makeNew={() => ({ n: "", l: "", s: "" })}
          renderRow={(s, i, upd) => (
            <div className="adm-grid3">
              <Text label="Number" value={s.n} onChange={(v) => upd({ ...s, n: v })} />
              <Text label="Label" value={s.l} onChange={(v) => upd({ ...s, l: v })} />
              <Text label="Sub-label" value={s.s} onChange={(v) => upd({ ...s, s: v })} />
            </div>
          )}
        />
      </Section>
    </>
  );
}

/* ---------- ENQUIRY OPTIONS ---------- */
function EnquiryOpts({ data, patch }) {
  return (
    <>
      <Section title="Occasions" sub="Options in the enquiry form's occasion dropdown.">
        <TagsInput label="" value={data.decor.occasions} onChange={(v) => patch("occasions", v)} placeholder="Add an occasion…" />
      </Section>
      <Section title="Budgets" sub="Options in the enquiry form's budget dropdown.">
        <TagsInput label="" value={data.decor.budgets} onChange={(v) => patch("budgets", v)} placeholder="e.g. ₹3L - ₹6L" />
      </Section>
    </>
  );
}