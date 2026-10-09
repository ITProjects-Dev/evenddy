import { useState } from "react";
import { loadData, saveData, uid, inr } from "../store";
import { Section, F, Text, Num, Area, TagsInput, Repeater, Tabs, Toast } from "../ui";
import { X } from "lucide-react";

const TABS = [
    { id: "landing", label: "Landing" },
    { id: "mealbox", label: "Meal Box" },
    { id: "menu", label: "Delivery Box · Menu items" },
    { id: "full", label: "Full Catering" },
    { id: "global", label: "Global" },
];

export default function CateringAdmin() {
    const [tab, setTab] = useState("landing");
    const [data, setData] = useState(() => loadData());
    const [toast, setToast] = useState("");

    const save = () => { saveData(data); setToast("Catering data saved"); setTimeout(() => setToast(""), 2200); };
    const patch = (path, value) => setData((d) => ({ ...d, catering: { ...d.catering, [path]: value } }));

    return (
        <>
            <div className="adm-between" style={{ marginBottom: 14 }}>
                <p className="adm-hint" style={{ margin: 0 }}>Changes are local until you click Save.</p>
                <button className="adm-btn" onClick={save}>Save catering</button>
            </div>

            <Tabs tabs={TABS} value={tab} onChange={setTab} />

            {tab === "landing" && <LandingTab data={data} patch={patch} setData={setData} />}
            {tab === "mealbox" && <MealBoxTab data={data} patch={patch} setData={setData} />}
            {tab === "menu" && <MenuTab data={data} patch={patch} />}
            {tab === "full" && <FullTab data={data} patch={patch} />}
            {tab === "global" && <GlobalTab data={data} setData={setData} />}

            <Toast text={toast} />
        </>
    );
}

/* ---------------- LANDING ---------------- */
function LandingTab({ data, patch }) {
    const cards = data.catering.landing;
    const setCard = (i, v) => patch("landing", cards.map((c, k) => (k === i ? v : c)));
    return (
        <Section num="1" title="Landing cards" sub="The three big cards on the Catering landing page.">
            <Repeater
                items={cards}
                onChange={(v) => patch("landing", v)}
                itemTitle={(it) => it.title || "Untitled card"}
                makeNew={() => ({
                    id: uid("card"), title: "New service", eyebrow: "", icon: "box", tone: "gold",
                    image: "", price: "", paras: [""], chips: [], cta: "Explore",
                })}
                renderRow={(it, i, upd) => (
                    <>
                        <div className="adm-grid2">
                            <Text label="Title" value={it.title} onChange={(v) => upd({ ...it, title: v })} />
                            <Text label="Eyebrow / tagline" value={it.eyebrow} onChange={(v) => upd({ ...it, eyebrow: v })} />
                        </div>
                        <div className="adm-grid3">
                            <F label="Icon key">
                                <select value={it.icon} onChange={(e) => upd({ ...it, icon: e.target.value })}>
                                    {["box", "truck", "fork", "leaf", "grid", "swap", "people", "delivery", "dish", "menu", "chef", "calendar", "pin", "chat", "phone"].map((k) => <option key={k}>{k}</option>)}
                                </select>
                            </F>
                            <F label="Tone">
                                <select value={it.tone} onChange={(e) => upd({ ...it, tone: e.target.value })}>
                                    {["gold", "maroon", "orange", "green"].map((k) => <option key={k}>{k}</option>)}
                                </select>
                            </F>
                            <Text label="Price badge (optional)" value={it.price} onChange={(v) => upd({ ...it, price: v })} placeholder="Starting from ₹200 /plate" />
                        </div>
                        <Text label="Card image URL" value={it.image} onChange={(v) => upd({ ...it, image: v })} placeholder="https://…" />
                        <Text label="CTA button label" value={it.cta} onChange={(v) => upd({ ...it, cta: v })} />

                        <F label="Paragraphs">
                            <Repeater
                                items={it.paras || []}
                                onChange={(v) => upd({ ...it, paras: v })}
                                makeNew={() => ""}
                                addLabel="+ Add paragraph"
                                itemTitle={(p) => p.slice(0, 60) || "Empty"}
                                renderRow={(p, pi, pu) => (
                                    <Area value={p} onChange={(v) => pu(v)} rows={2} />
                                )}
                            />
                        </F>

                        <F label="Chips (icon + text)">
                            <Repeater
                                items={it.chips || []}
                                onChange={(v) => upd({ ...it, chips: v })}
                                makeNew={() => ({ icon: "leaf", text: "" })}
                                itemTitle={(c) => c.text || "Chip"}
                                renderRow={(c, ci, cu) => (
                                    <div className="adm-grid2">
                                        <F label="Icon">
                                            <select value={c.icon} onChange={(e) => cu({ ...c, icon: e.target.value })}>
                                                {["leaf", "grid", "swap", "people", "delivery", "dish", "menu", "chef", "box", "truck", "fork"].map((k) => <option key={k}>{k}</option>)}
                                            </select>
                                        </F>
                                        <Text label="Text" value={c.text} onChange={(v) => cu({ ...c, text: v })} />
                                    </div>
                                )}
                            />
                        </F>
                    </>
                )}
            />
        </Section>
    );
}

/* ---------------- MEAL BOX ---------------- */
function MealBoxTab({ data, patch }) {
    const mb = data.catering.mealBox;
    const setMB = (v) => patch("mealBox", v);

    return (
        <>
            <Section num="1" title="Box sizes" sub="e.g. 3 / 5 / 8 item boxes with prices.">
                <Repeater
                    items={mb.boxSizes}
                    onChange={(v) => setMB({ ...mb, boxSizes: v })}
                    itemTitle={(b) => `${b.items} items — ${inr(b.price)}`}
                    makeNew={() => ({ items: 3, price: 0, note: "onwards" })}
                    renderRow={(b, i, upd) => (
                        <div className="adm-grid3">
                            <Num label="Item count" value={b.items} onChange={(v) => upd({ ...b, items: v })} />
                            <Num label="Price (₹)" value={b.price} onChange={(v) => upd({ ...b, price: v })} />
                            <Text label="Note" value={b.note} onChange={(v) => upd({ ...b, note: v })} placeholder="onwards" />
                        </div>
                    )}
                />
            </Section>

            <Section num="2" title="Guest quantity defaults">
                <div className="adm-grid3">
                    <Num label="Minimum guests" value={mb.minGuests} onChange={(v) => setMB({ ...mb, minGuests: v })} />
                    <Num label="Step" value={mb.guestStep} onChange={(v) => setMB({ ...mb, guestStep: v })} />
                    <TagsInput label="Quick presets (numbers)" value={(mb.presets || []).map(String)}
                        onChange={(v) => setMB({ ...mb, presets: v.map(Number).filter((x) => !isNaN(x)) })}
                        placeholder="Type a number then Enter" />
                </div>
            </Section>

            <Section num="3" title="Box item slots" sub="Each slot has one icon and a set of swappable options. The first N slots are shown for an N-item box.">
                <Repeater
                    items={mb.slots}
                    onChange={(v) => setMB({ ...mb, slots: v })}
                    itemTitle={(s, i) => `Slot ${i + 1} · ${s.options?.[0]?.n || "—"}`}
                    makeNew={() => ({ icon: "bowl", options: [{ n: "", v: true }] })}
                    renderRow={(s, i, upd) => (
                        <>
                            <F label="Slot icon">
                                <select value={s.icon} onChange={(e) => upd({ ...s, icon: e.target.value })}>
                                    {["bowl", "rice", "cup"].map((k) => <option key={k}>{k}</option>)}
                                </select>
                            </F>

                            <F label="Options (swappable items)">
                                <Repeater
                                    items={s.options}
                                    onChange={(v) => upd({ ...s, options: v })}
                                    itemTitle={(o) => `${o.n || "—"} ${o.v ? "· Veg" : "· Non-Veg"}`}
                                    makeNew={() => ({ n: "", v: true })}
                                    renderRow={(o, oi, ou) => (
                                        <div className="adm-grid2">
                                            <Text label="Item name" value={o.n} onChange={(v) => ou({ ...o, n: v })} />
                                            <F label="Type">
                                                <select value={o.v ? "veg" : "nonveg"} onChange={(e) => ou({ ...o, v: e.target.value === "veg" })}>
                                                    <option value="veg">Veg</option>
                                                    <option value="nonveg">Non-Veg</option>
                                                </select>
                                            </F>
                                        </div>
                                    )}
                                />
                            </F>
                        </>
                    )}
                />
            </Section>
        </>
    );
}

/* ---------------- MENU ITEMS (shared by Meal Box extra tabs + Delivery Box) ---------------- */
function MenuTab({ data, patch }) {
    const cats = data.catering.menuCategories;
    const items = data.catering.menuItems;
    const [filter, setFilter] = useState("all");

    const visible = filter === "all" ? items : items.filter((m) => m.cat === filter);

    return (
        <>
            <Section num="1" title="Menu categories" sub="Tabs / filters used on Meal Box & Delivery Box.">
                <TagsInput label="Categories" value={cats}
                    onChange={(v) => patch("menuCategories", v)}
                    placeholder="Type a category and Enter"
                    suggestions={["Breakfast", "Tea/Snacks", "Starters", "Main Course", "Desserts"]} />
            </Section>

            <Section num="2" title="Menu items" sub={`${items.length} items · used by both Meal Box (extra items) and Delivery Box.`}
                right={
                    <div className="adm-seg">
                        <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All</button>
                        {cats.map((c) => (
                            <button key={c} className={filter === c ? "on" : ""} onClick={() => setFilter(c)}>{c}</button>
                        ))}
                    </div>
                }>
                <Repeater
                    items={visible}
                    onChange={(next) => {
                        if (filter === "all") return patch("menuItems", next);
                        /* merge back when filtered */
                        const others = items.filter((m) => m.cat !== filter);
                        patch("menuItems", [...others, ...next]);
                    }}
                    itemTitle={(m) => `${m.name || "—"} · ${m.cat}`}
                    makeNew={() => ({ id: Date.now(), name: "", cat: cats[1] || cats[0] || "Breakfast", veg: true })}
                    renderRow={(m, i, upd) => (
                        <div className="adm-grid3">
                            <Text label="Name" value={m.name} onChange={(v) => upd({ ...m, name: v })} />
                            <F label="Category">
                                <select value={m.cat} onChange={(e) => upd({ ...m, cat: e.target.value })}>
                                    {cats.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </F>
                            <F label="Type">
                                <select value={m.veg ? "veg" : "nonveg"} onChange={(e) => upd({ ...m, veg: e.target.value === "veg" })}>
                                    <option value="veg">Veg</option>
                                    <option value="nonveg">Non-Veg</option>
                                </select>
                            </F>
                        </div>
                    )}
                />
            </Section>
        </>
    );
}

/* ---------------- FULL CATERING ---------------- */
function FullTab({ data, patch }) {
    const full = data.catering.full;
    const setFull = (v) => patch("full", v);
    const menuCats = Object.keys(full.menu || {});

    return (
        <>
            <Section num="1" title="Gallery" sub="Portfolio images on the Full Catering page.">
                <div className="adm-gal">
                    {(full.gallery || []).map((url, i) => (
                        <div key={i} className="adm-gal-i" style={url ? { backgroundImage: `url(${url})` } : undefined}>
                            {!url && <span style={{ fontSize: 11 }}>No image</span>}
                            <button type="button" onClick={() => setFull({ ...full, gallery: full.gallery.filter((_, k) => k !== i) })} aria-label={`Remove image ${i + 1}`}><X size={14} /></button>
                            <input value={url} onChange={(e) =>
                                setFull({ ...full, gallery: full.gallery.map((g, k) => (k === i ? e.target.value : g)) })}
                                placeholder="Image URL"
                                style={{ position: "absolute", left: 6, right: 6, bottom: 6, fontSize: 11, padding: "5px 7px", borderRadius: 7, border: "1px solid var(--line)", background: "rgba(255,255,255,.94)" }} />
                        </div>
                    ))}
                    <button type="button" className="adm-gal-add"
                        onClick={() => setFull({ ...full, gallery: [...(full.gallery || []), ""] })}>
                        <span style={{ fontSize: 18 }}>+</span>Add image
                    </button>
                </div>
            </Section>

            <Section num="2" title="Cuisines, Plate prices, Food types & Service tags">
                {/* <TagsInput label="Cuisines" value={full.cuisines} onChange={(v) => setFull({ ...full, cuisines: v })} placeholder="Add cuisine…" />
                <TagsInput label="Plate price ranges" value={full.platePrices} onChange={(v) => setFull({ ...full, platePrices: v })} placeholder="e.g. ₹500 – ₹800" />
                <TagsInput label="Food types" value={full.foodTypes} onChange={(v) => setFull({ ...full, foodTypes: v })} placeholder="e.g. Veg" /> */}
                <TagsInput label="Service tags" value={full.serviceTags} onChange={(v) => setFull({ ...full, serviceTags: v })} placeholder="e.g. Live Counters" />
            </Section>

            {/* <Section num="3" title="Full menu" sub="Categories appear as dropdowns inside the detailed quote modal.">
                <Repeater
                    items={menuCats}
                    onChange={(next) => {
                       
                        const nextMenu = {};
                        next.forEach((c) => { nextMenu[c] = full.menu[c] || []; });
                        setFull({ ...full, menu: nextMenu });
                    }}
                    itemTitle={(c) => `${c} · ${(full.menu[c] || []).length} dishes`}
                    makeNew={() => "New Category"}
                    addLabel="+ Add category"
                    renderRow={(cat, i, upd) => {
                        const dishes = full.menu[cat] || [];
                        const rename = (newName) => {
                            const next = {};
                            menuCats.forEach((c) => { next[c === cat ? newName : c] = full.menu[c]; });
                            setFull({ ...full, menu: next });
                        };
                        return (
                            <>
                                <Text label="Category name" value={cat} onChange={rename} />

                                <F label="Dishes">
                                    <Repeater
                                        items={dishes}
                                        onChange={(v) => setFull({ ...full, menu: { ...full.menu, [cat]: v } })}
                                        itemTitle={(d) => `${d.n || "—"} ${d.veg ? "· Veg" : "· Non-Veg"}`}
                                        makeNew={() => ({ n: "", veg: true })}
                                        renderRow={(d, di, du) => (
                                            <div className="adm-grid2">
                                                <Text label="Dish name" value={d.n} onChange={(v) => du({ ...d, n: v })} />
                                                <F label="Type">
                                                    <select value={d.veg ? "veg" : "nonveg"} onChange={(e) => du({ ...d, veg: e.target.value === "veg" })}>
                                                        <option value="veg">Veg</option>
                                                        <option value="nonveg">Non-Veg</option>
                                                    </select>
                                                </F>
                                            </div>
                                        )}
                                    />
                                </F>
                            </>
                        );
                    }}
                />
            </Section> */}

            <Section num="3" title="Reviews">
                <Repeater
                    items={full.reviews || []}
                    onChange={(v) => setFull({ ...full, reviews: v })}
                    itemTitle={(r) => r.who || "Review"}
                    makeNew={() => ({ who: "", text: "" })}
                    renderRow={(r, i, upd) => (
                        <>
                            <Text label="Reviewer" value={r.who} onChange={(v) => upd({ ...r, who: v })} />
                            <Area label="Review text" value={r.text} onChange={(v) => upd({ ...r, text: v })} rows={3} />
                        </>
                    )}
                />
            </Section>
        </>
    );
}

/* ---------------- GLOBAL ---------------- */
function GlobalTab({ data, setData }) {
    const g = data.global;
    const setG = (v) => setData({ ...data, global: v });
    return (
        <Section num="1" title="Contact & WhatsApp" sub="Used across every catering WhatsApp button.">
            <div className="adm-grid2">
                <Text label="WhatsApp number (country code + number, no +)" value={g.whatsapp} onChange={(v) => setG({ ...g, whatsapp: v })} />
                <Text label="Display phone" value={g.phone} onChange={(v) => setG({ ...g, phone: v })} />
            </div>
        </Section>
    );
}