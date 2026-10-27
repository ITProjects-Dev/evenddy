import { useState } from "react";
import { useEffect } from "react"; /* NEW: needed by Menu Sections tab */
import { useRef } from "react"; /* NEW: needed by the Landing tab API save queue */
import { addMenuSection, addCategoryToSection, getCategoryDescriptions, getMenuSectionById, getMenuSectionByName, listMenuSections, updateMenuSection } from "../../services/menuSectionService"; /* NEW: menu section API service */
import { addCateringLandingCard, deleteCateringLandingCard, listCateringLandingCards, updateCateringLandingCard } from "../../services/cateringLandingService"; /* NEW: landing card API service */
import { addDeliveryBox, deleteDeliveryBox, listDeliveryBoxes, updateDeliveryBox } from "../../services/deliveryBoxService"; /* NEW: delivery box API service */
import { addFullCatering, fromApiFullCatering, isNewImage, listFullCatering, pageRows, toFullCateringDto, updateFullCatering, dataUrlToFile } from "../../services/fullcateringservice";
import {
    addMealBox, deleteMealBox, listMealBoxes, updateMealBox,
    addMealBoxItem, deleteMealBoxItem, listMealBoxItems, updateMealBoxItem,
    addGuestDefault, updateGuestDefault, getPublicGuestDefault, isLive,
} from "../../services/mealboxservice";
import { DEFAULT_DATA, loadData, saveDataSections, uid, inr } from "../store";
import { Section, F, Text, Num, Area, ImageUpload, TagsInput, Repeater, Tabs, Toast } from "../ui";

function SaveSection({ path, value, updates, label, onSave }) {
    return (
        <button className="adm-btn ghost sm" type="button" onClick={() => onSave(updates || [{ path, value }])}>
            Save {label}
        </button>
    );
}

const TABS = [
    { id: "landing", label: "Landing" },
    { id: "mealbox", label: "Meal Box" },
    { id: "menu", label: "Delivery Box" },
    { id: "full", label: "Full Catering" },
    { id: "sections", label: "Menu Sections" }, /* NEW */
];

export default function CateringAdmin() {
    const [tab, setTab] = useState("landing");
    const [data, setData] = useState(() => loadData());
    const [toast, setToast] = useState("");

    const saveSection = (updates) => {
        const saved = saveDataSections(updates);
        setToast(saved ? "Section saved" : "Could not save. Browser storage may be full; remove some images and try again.");
        setTimeout(() => setToast(""), 3500);
        return saved;
    };
    const patch = (path, value) => setData((d) => ({ ...d, catering: { ...d.catering, [path]: value } }));

    return (
        <>
            <div className="adm-between" style={{ marginBottom: 14 }}>
                <p className="adm-hint" style={{ margin: 0 }}>Save each section separately after editing.</p>
            </div>

            <Tabs tabs={TABS} value={tab} onChange={setTab} />

            {tab === "landing" && <LandingTab data={data} patch={patch} saveSection={saveSection} />}
            {tab === "mealbox" && <MealBoxTab data={data} patch={patch} saveSection={saveSection} />}
            {tab === "menu" && <MenuTab data={data} patch={patch} saveSection={saveSection} />}
            {tab === "full" && <FullTab patch={patch} />}
            {tab === "sections" && <MenuSectionsTab />} {/* NEW */}

            <Toast text={toast} />
        </>
    );
}

/* ---------------- LANDING ---------------- */
/* NEW: convert between the admin card shape and the catering-landing API shape */
const toApiCard = (c) => ({
    title: c.title,
    eyebrowTagline: c.eyebrow || "",
    iconKey: c.icon || "utensils",
    tone: c.tone || "warm",
    priceBadge: c.price || "",
    cardImageUrl: c.image || "",
    ctaButtonLabel: c.cta || "Explore",
    aboutParagraphs: (c.paras || []).join("\n\n"),
    /* the API stores chips as a JSON string: "[\"Wedding\",\"Birthday\"]" */
    chips: JSON.stringify((c.chips || []).map((ch) => (typeof ch === "string" ? ch : ch.text)).filter(Boolean)),
    status: "ACTIVE",
    published: c.published !== false,   /* DB column "published" is NOT NULL, so always send true/false */
});

const fromApiCard = (c) => {
    let chips = [];
    try { const arr = JSON.parse(c.chips || "[]"); chips = Array.isArray(arr) ? arr : []; } catch (e) { /* bad chips string */ }
    return {
        id: `api-${c.id}`,
        apiId: c.id,
        title: c.title || "",
        eyebrow: c.eyebrowTagline || "",
        icon: c.iconKey || "utensils",
        tone: c.tone || "warm",
        image: c.cardImageUrl || "",
        price: c.priceBadge || "",
        paras: (c.aboutParagraphs || "").split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean),
        chips: chips.map((text) => ({ icon: "bowl", text })),
        cta: c.ctaButtonLabel || "Explore",
        published: c.published !== false,
    };
};

function LandingTab({ data, patch, saveSection }) {
    const cards = data.catering.landing;
    const setCard = (i, v) => patch("landing", cards.map((c, k) => (k === i ? v : c)));

    /* NEW: catering-landing API. Every change in the editor (Save item, delete, Save landing cards)
       is written to the database table catering_landing. */
    const [toast, setToast] = useState("");
    const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

    const queue = useRef(Promise.resolve());   /* saves run one after another, so nothing is created twice */
    const apiIds = useRef({});                 /* card.id -> database id (also for cards created a moment ago) */
    const seeded = useRef(false);
    const cardsRef = useRef(cards);
    cardsRef.current = cards;

    /* API 5 (delete) + API 4 (update) + API 1 (create). force = update every card even if unchanged */
    const persist = (prev, next, force = false) => {
        const run = queue.current.then(async () => {
            const idMap = {};
            try {
                for (const c of prev) {
                    const dbId = c.apiId || apiIds.current[c.id];
                    if (dbId && !next.some((n) => n.id === c.id)) await deleteCateringLandingCard(dbId);
                }
                for (const c of next) {
                    if (!c.title || !c.title.trim()) continue;
                    const body = toApiCard(c);
                    const dbId = c.apiId || apiIds.current[c.id];
                    const before = prev.find((p) => p.id === c.id);
                    if (dbId && !force && before && JSON.stringify(toApiCard(before)) === JSON.stringify(body)) continue; /* unchanged */
                    const saved = dbId
                        ? await updateCateringLandingCard(dbId, body)
                        : await addCateringLandingCard(body);
                    const newId = saved?.id ?? dbId;
                    if (newId) { apiIds.current[c.id] = newId; idMap[c.id] = newId; }
                }
                if (Object.keys(idMap).length) {
                    patch("landing", cardsRef.current.map((x) => (idMap[x.id] ? { ...x, apiId: idMap[x.id] } : x)));
                }
                /* keep the old local copy in sync too (silent) */
                saveDataSections([{ path: "catering.landing", value: next.map((x) => ({ ...x, apiId: apiIds.current[x.id] ?? x.apiId })) }]);
                notify("Saved to database");
            } catch (e) {
                notify(e.message || "Could not save to the database");
            }
        });
        queue.current = run;
        return run;
    };

    /* API 2: load the saved cards. If the database is empty, save the cards shown here into it. */
    useEffect(() => {
        let alive = true;
        listCateringLandingCards()
            .then((list) => {
                if (!alive || !Array.isArray(list)) return;
                if (list.length) {
                    patch("landing", list.map(fromApiCard));
                } else if (!seeded.current && cardsRef.current.length) {
                    seeded.current = true;
                    persist([], cardsRef.current, true);
                }
            })
            .catch((e) => notify(e.message || "Could not load landing cards from the server"));
        return () => { alive = false; };
        // eslint-disable-next-line
    }, []);

    /* called by the editor's "Save item", delete icon, add and reorder */
    const changeCards = (next) => {
        patch("landing", next);
        persist(cards, next);
    };

    return (
        <>
        <Section num="1" title="Landing cards" sub="The three big cards on the Catering landing page. Saved to the database automatically.">
            <Repeater
                items={cards}
                onChange={changeCards}
                addLabel="Add service card"
                itemTitle={(it) => it.title || "Untitled card"}
                makeNew={() => ({
                    id: uid("card"), title: "New service", eyebrow: "",
                    image: "", price: "", paras: [""], chips: [], cta: "Explore",
                })}
                renderRow={(it, i, upd) => (
                    <>
                        <div className="adm-grid2">
                            <Text label="Title" value={it.title} onChange={(v) => upd({ ...it, title: v })} />
                            <Text label="Eyebrow / tagline" value={it.eyebrow} onChange={(v) => upd({ ...it, eyebrow: v })} />
                        </div>
                        <Text label="Price badge " value={it.price} onChange={(v) => upd({ ...it, price: v })} placeholder="Starting from ₹200 /plate" />
                        <ImageUpload label="Card image" value={it.image} onChange={(v) => upd({ ...it, image: v })} />
                        <Text label="CTA button label" value={it.cta} onChange={(v) => upd({ ...it, cta: v })} />
                        <F label="Published on website">
                            <select value={it.published === false ? "no" : "yes"} onChange={(e) => upd({ ...it, published: e.target.value === "yes" })}>
                                <option value="yes">Yes (visible on the website)</option>
                                <option value="no">No (hidden)</option>
                            </select>
                        </F>

                        <Area
                            label="Paragraphs"
                            value={(it.paras || []).join("\n\n")}
                            onChange={(v) => upd({
                                ...it,
                                paras: v.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean),
                            })}
                            rows={6}
                            placeholder="Write the service description. Separate paragraphs with a blank line."
                        />

                        <TagsInput
                            label="Chip options"
                            value={(it.chips || []).map((chip) => (
                                typeof chip === "string" ? chip : chip.text
                            )).filter(Boolean)}
                            onChange={(labels) => upd({
                                ...it,
                                chips: labels.map((text) => {
                                    const existing = (it.chips || []).find((chip) =>
                                        typeof chip !== "string" && chip.text === text
                                    );
                                    return existing || { icon: "bowl", text };
                                }),
                            })}
                            placeholder="Type an option and press Enter or comma"
                        />
                    </>
                )}
            />
        </Section>
        <Toast text={toast} />
        </>
    );
}

/* ---------------- MEAL BOX ---------------- */
/* Convert between the admin shapes and the meal-box APIs
   Meal box   API: { id, itemCount, price, note, published }   admin: { id, apiId, items, price, note, published }
   Box slot   API: { id, mealBoxId, slotName, itemName, itemType, status, published }
                    admin: slots[i].options[j] = { k, apiId, boxId, n, v, published }  (slotName = "Slot " + (i + 1))
   Guest      API: { id, minimumGuests, step, quickPresets, status }   admin: minGuests, guestStep, presets
   The backend request DTO accepts these business fields; created / updated dates and status are set by the
   database (see the SQL triggers) or by JPA auditing. */
const toApiMealBox = (b) => ({
    itemCount: Number(b.items) || 0,
    price: Number(b.price) || 0,
    note: b.note ?? "",
    published: b.published !== false,
});

const mealBoxSnapshot = (b) => JSON.stringify({
    itemCount: Number(b.items) || 0,
    price: Number(b.price) || 0,
    note: b.note ?? "",
    status: "ACTIVE",
    published: b.published !== false,
});

const fromApiMealBox = (b) => ({
    id: `api-${b.id}`,
    apiId: b.id,
    items: Number(b.itemCount) || 0,
    price: Number(b.price) || 0,
    note: b.note || "",
    published: isLive(b),
});

/* box sizes are always shown from the smallest box to the biggest one */
const sortBoxes = (list) => [...(list || [])].sort((a, b) => (Number(a.items) || 0) - (Number(b.items) || 0));

/* A row the server only keeps hidden (delete answers OK but the row stays) is remembered in this browser. */
const HIDDEN_KEY = "evenddy_hidden_catering_rows";
const readHidden = (kind) => {
    try { return JSON.parse(localStorage.getItem(HIDDEN_KEY) || "{}")[kind] || []; } catch (e) { return []; }
};
const writeHidden = (kind, ids) => {
    try {
        const all = JSON.parse(localStorage.getItem(HIDDEN_KEY) || "{}");
        all[kind] = ids;
        localStorage.setItem(HIDDEN_KEY, JSON.stringify(all));
    } catch (e) { /* storage full or blocked */ }
};
const hideId = (kind, id) => { const ids = readHidden(kind); if (!ids.includes(String(id))) writeHidden(kind, [...ids, String(id)]); };
const unhideId = (kind, id) => writeHidden(kind, readHidden(kind).filter((x) => x !== String(id)));
const isHidden = (kind, r) => readHidden(kind).includes(String(r?.id));

/* a row the server only marked as removed (soft delete) counts as deleted */
const isSoftDeleted = (r) =>
    /^(inactive|deleted|archived|removed|disabled)$/i.test(String(r?.status || "")) ||
    r?.deleted === true || r?.isDeleted === true || r?.active === false;

/* NEW: the server answered 404 NOT_FOUND ("Meal box not found" / "Item not found"): the row is already gone */
const alreadyGone = (e) => /NOT_FOUND\s*"|\b404\b.*not found/i.test(`${e?.details || ""}\n${e?.message || ""}`);

/* create returns { success:false, message } on errors, so turn that into an error */
const unwrapMeal = (res) => {
    if (res && res.success === false) throw new Error(res.message || "Meal box request failed");
    return res;
};

/* every option needs a stable key `k`, so a slot option can be matched with its database row */
const withKeys = (slots) => (slots || []).map((s) => ({
    ...s,
    options: (s.options || []).map((o) => (o.k ? o : { ...o, k: uid("opt") })),
}));

/* group the flat slot rows ("Slot 1" / "Slot 2" ...) back into slots with swappable options */
const fromApiSlotRows = (rows, boxId, prevSlots = []) => {
    const order = [];
    const groups = {};
    [...rows].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0)).forEach((r) => {
        const name = r.slotName || "Slot 1";
        if (!groups[name]) { groups[name] = []; order.push(name); }
        groups[name].push({
            k: `api-${r.id}`,
            apiId: r.id,
            boxId: r.mealBoxId ?? boxId,
            n: r.itemName || "",
            v: String(r.itemType || "").trim().toLowerCase() === "veg",
            published: isLive(r),
        });
    });
    order.sort((a, b) => (parseInt(a.replace(/\D/g, ""), 10) || 0) - (parseInt(b.replace(/\D/g, ""), 10) || 0));
    return order.map((name, i) => ({ ...(prevSlots[i] || {}), options: groups[name] })); /* keeps the slot icon from the old data */
};

function MealBoxTab({ data, patch, saveSection }) {
    const mb = data.catering.mealBox;
    const setMB = (v) => patch("mealBox", v);

    const [toast, setToast] = useState("");
    const [problem, setProblem] = useState("");
    const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

    const queue = useRef(Promise.resolve());
    const boxIds = useRef({});
    const optIds = useRef({});
    const optBox = useRef({});
    const dupRows = useRef({});     /* option.k -> every database row of that same item: [{ boxId, id }] */
    const boxSnap = useRef({});
    const slotSnap = useRef({});
    const slotBoxId = useRef(null);
    const guestId = useRef(null);
    const mbRef = useRef(mb);
    mbRef.current = mb;

    /* the box that holds the slot rows: prefer a PUBLISHED box, because the customer site only reads published boxes */
    const masterBoxId = () => {
        if (slotBoxId.current) return slotBoxId.current;
        const withDb = (mbRef.current.boxSizes || [])
            .map((b) => ({ b, dbId: b.apiId || boxIds.current[b.id] }))
            .filter((x) => x.dbId)
            .sort((a, b) => {
                const pa = a.b.published === false ? 0 : 1;
                const pb = b.b.published === false ? 0 : 1;
                if (pa !== pb) return pb - pa;
                return (Number(b.b.items) || 0) - (Number(a.b.items) || 0);
            });
        return withDb[0]?.dbId || null;
    };

    const say = (msg, ms = 3500) => { setToast(msg); setTimeout(() => setToast((t) => (t === msg ? "" : t)), ms); };

    const report = (e) => {
        console.error("Meal box delete failed:", e);
        setProblem([e?.message, e?.details].filter(Boolean).join("\n\n"));
    };

    const applyMB = (v) => { mbRef.current = v; setMB(v); };

    /* delete one meal box from the database and make sure the server really removed it.
       NEW: if the server says the box does not exist any more (404), it counts as deleted. */
    const removeBox = async (dbId) => {
        try {
            await deleteMealBox(dbId);
        } catch (e) {
            if (alreadyGone(e)) { delete boxSnap.current[dbId]; return; }
            let rows = [];
            try { rows = await listMealBoxItems(dbId); } catch (err) { /* no slot rows */ }
            if (!rows.length) throw e;
            for (const r of rows) { if (r.id != null) await deleteMealBoxItem(dbId, r.id); }
            await deleteMealBox(dbId);
        }
        try {
            const list = await listMealBoxes();
            const still = (Array.isArray(list) ? list : []).find((x) => String(x.id) === String(dbId));
            if (still && !isSoftDeleted(still)) {
                if (isLive(still)) {
                    try {
                        await updateMealBox(dbId, { itemCount: still.itemCount, price: still.price, note: still.note, published: false });
                    } catch (e2) {
                        const err = new Error("The server answered OK to the delete, but this box is still saved and live on the website, and it could not be unpublished: " + (e2?.message || ""));
                        err.details = "The list still returns this row:\n" + JSON.stringify(still, null, 2);
                        throw err;
                    }
                }
                hideId("mealBox", dbId);
            }
        } catch (e) {
            if (e?.details && /still saved/.test(e?.message || "")) throw e;
        }
        delete boxSnap.current[dbId];
    };

    /* Meal box API: delete + update + create */
    const persistBoxes = (prev, next, force = false) => {
        const run = queue.current.then(async () => {
            setProblem("");
            const idMap = {};
            const errors = [];
            const failed = [];
            let lostSlots = false;
            for (const b of prev) {
                const dbId = b.apiId || boxIds.current[b.id];
                if (dbId && !next.some((n) => n.id === b.id)) {
                    try {
                        await removeBox(dbId);
                        delete boxIds.current[b.id];
                        if (String(dbId) === String(slotBoxId.current)) { slotBoxId.current = null; lostSlots = true; }
                    } catch (e) {
                        errors.push(e.message || "Could not delete from the database");
                        report(e);
                        failed.push(b);
                    }
                }
            }
            for (const b of next) {
                if (!(Number(b.items) > 0)) continue;
                try {
                    const dbId = b.apiId || boxIds.current[b.id];
                    const body = toApiMealBox(b);
                    const snapshot = mealBoxSnapshot(b);
                    if (!dbId && !(Number(b.price) > 0)) continue;
                    if (!force) {
                        const before = prev.find((p) => p.id === b.id);
                        if (dbId && before && mealBoxSnapshot(before) === snapshot) continue;
                        if (dbId && boxSnap.current[dbId] === snapshot) continue;
                    }
                    let saved;
                    try {
                        saved = unwrapMeal(dbId
                            ? await updateMealBox(dbId, body)
                            : await addMealBox(body));
                    } catch (err) {
                        if (!dbId && /already exists|409|conflict/i.test(err?.message || "")) {
                            const list = await listMealBoxes();
                            const hit = (Array.isArray(list) ? list : []).find((x) => Number(x.itemCount) === body.itemCount);
                            const taken = hit && next.some((x) => x.id !== b.id && (x.apiId || boxIds.current[x.id]) === hit.id);
                            if (!hit || taken) {
                                throw new Error(`A ${body.itemCount}-item box already exists. Change the item count of this box.`);
                            }
                            boxIds.current[b.id] = hit.id;
                            idMap[b.id] = hit.id;
                            unhideId("mealBox", hit.id);
                            const same = Number(hit.price) === body.price
                                && (hit.note || "") === body.note
                                && isLive(hit) === body.published;
                            if (!same) await updateMealBox(hit.id, body);
                            boxSnap.current[hit.id] = snapshot;
                            continue;
                        }
                        throw err;
                    }
                    let newId = saved?.id ?? saved?.box?.id ?? saved?.data?.id ?? dbId;
                    if (!newId) {
                        const list = await listMealBoxes();
                        const hit = (Array.isArray(list) ? list : [])
                            .filter((x) => Number(x.itemCount) === body.itemCount && Number(x.price) === body.price)
                            .sort((x, y) => (Number(y.id) || 0) - (Number(x.id) || 0))[0];
                        newId = hit?.id;
                    }
                    if (newId) {
                        boxIds.current[b.id] = newId;
                        idMap[b.id] = newId;
                        boxSnap.current[newId] = snapshot;
                    }
                } catch (e) {
                    errors.push(e.message || `Could not save the ${b.items} items box`);
                }
            }
            let latest = next;
            if (failed.length || Object.keys(idMap).length) {
                const base = [...(mbRef.current.boxSizes || next)];
                failed.forEach((f) => { if (!base.some((x) => x.id === f.id)) base.push(f); });
                latest = sortBoxes(base.map((x) => (idMap[x.id] ? { ...x, apiId: idMap[x.id] } : x)));
                applyMB({ ...mbRef.current, boxSizes: latest });
            }
            if (lostSlots) {
                const slots = (mbRef.current.slots || []).map((s) => ({
                    ...s,
                    options: (s.options || []).map((o) => {
                        delete optIds.current[o.k];
                        delete optBox.current[o.k];
                        delete dupRows.current[o.k];
                        const { apiId, boxId, ...rest } = o;
                        return rest;
                    }),
                }));
                applyMB({ ...mbRef.current, slots });
                await runSlots([], slots, true);
            }
            saveDataSections([{ path: "catering.mealBox.boxSizes", value: latest.map((x) => ({ ...x, apiId: boxIds.current[x.id] ?? x.apiId })) }]);
            say(errors.length ? errors[0] : "Box sizes saved to database", errors.length ? 9000 : 3500);
        });
        queue.current = run;
        return run;
    };

    /* Box item slot API: delete + update + create. One database row per option. */
    const runSlots = async (prev, next, force = false) => {
        setProblem("");
        const idMap = {};
        const errors = [];
        const wantLive = [];   /* rows saved with published = Yes: checked again after saving */
        const flat = (slots) => (slots || []).flatMap((s, i) => (s.options || []).map((o) => ({ o, slotName: `Slot ${i + 1}` })));
        const nextFlat = flat(next);
        let deleteFailed = false;

        /* Remove one slot row for good.
           1) call the delete API, 2) read the box rows back,
           3) if the server KEPT the row, mark it status = INACTIVE + unpublished
              (the loader skips INACTIVE rows, so it stays gone after a refresh).
           NEW: a row the server no longer knows (404) counts as deleted. */
        const removeSlotRow = async (boxId, id) => {
            let delErr = null;
            try { await deleteMealBoxItem(boxId, id); } catch (e) { delErr = e; }
            if (delErr && alreadyGone(delErr)) { delete slotSnap.current[id]; return; }
            let rows = null;
            try { rows = await listMealBoxItems(boxId); } catch (e) { /* cannot verify */ }
            if (rows === null) { if (delErr) throw delErr; return; }
            const still = rows.find((r) => String(r.id) === String(id));
            if (!still) { delete slotSnap.current[id]; return; }          /* really gone */
            if (!isSoftDeleted(still)) {
                try {
                    await updateMealBoxItem(boxId, id, {
                        slotName: still.slotName, itemName: still.itemName, itemType: still.itemType,
                        status: "INACTIVE", published: false, isPublished: false,
                    });
                } catch (e2) {
                    if (isLive(still) || delErr) {
                        const err = new Error("The server did not delete this item and it could not be marked as removed: " + (e2?.message || delErr?.message || ""));
                        err.details = "The list still returns this row:\n" + JSON.stringify(still, null, 2);
                        throw err;
                    }
                }
            }
            hideId("mealSlot", id);                                        /* backup: also hidden in this browser */
            delete slotSnap.current[id];
        };

        for (const { o } of flat(prev)) {
            if (nextFlat.some((n) => n.o.k === o.k)) continue;
            /* every row of this item: the one shown here + all duplicates (other boxes, old copies) */
            const targets = [...(dupRows.current[o.k] || [])];
            const ownId = o.apiId || optIds.current[o.k];
            const ownBox = o.boxId || optBox.current[o.k];
            if (ownId && ownBox && !targets.some((t) => String(t.id) === String(ownId))) targets.push({ boxId: ownBox, id: ownId });
            let ok = true;
            for (const t of targets) {
                if (t.id == null || t.boxId == null) continue;
                try { await removeSlotRow(t.boxId, t.id); }
                catch (e) { ok = false; deleteFailed = true; errors.push(e.message || "Could not delete slot item"); report(e); }
            }
            if (ok) {
                delete optIds.current[o.k];
                delete optBox.current[o.k];
                delete dupRows.current[o.k];
            }
        }
        if (deleteFailed) {
            applyMB({ ...mbRef.current, slots: prev });
            say(errors[0], 9000);
            return;
        }

        for (const { o, slotName } of nextFlat) {
            if (!o.n || !o.n.trim()) continue;
            try {
                const pub = o.published !== false;
                const body = {
                    slotName,
                    itemName: o.n.trim(),
                    itemType: o.v === false ? "Non-Veg" : "Veg",
                    status: "ACTIVE",
                    published: pub,
                    isPublished: pub,   /* alias, in case the backend DTO field is called isPublished */
                };
                let dbId = o.apiId || optIds.current[o.k];
                const boxId = o.boxId || optBox.current[o.k] || masterBoxId();
                if (!boxId) throw new Error("Add a box size first, then add the item slots");
                if (dbId && !force && slotSnap.current[dbId] === JSON.stringify(body)) continue;

                let saved;
                try {
                    saved = unwrapMeal(dbId
                        ? await updateMealBoxItem(boxId, dbId, body)
                        : await addMealBoxItem(boxId, body));
                } catch (err) {
                    /* 409 "This item already exists in the slot": reuse the row instead of failing */
                    if (!dbId && /409|already exists|conflict/i.test(err?.message || "")) {
                        const rows = await listMealBoxItems(boxId);
                        const hit = rows.find((r) => r.slotName === body.slotName
                            && String(r.itemName).trim().toLowerCase() === body.itemName.toLowerCase());
                        if (!hit) throw err;
                        unhideId("mealSlot", hit.id);
                        await updateMealBoxItem(boxId, hit.id, body);
                        dbId = hit.id;
                        saved = { id: hit.id };
                    } else {
                        throw err;
                    }
                }

                let newId = saved?.id ?? saved?.data?.id ?? dbId;
                if (!newId) {
                    const rows = await listMealBoxItems(boxId);
                    const hit = (Array.isArray(rows) ? rows : [])
                        .filter((r) => r.slotName === body.slotName && r.itemName === body.itemName)
                        .sort((x, y) => (Number(y.id) || 0) - (Number(x.id) || 0))[0];
                    newId = hit?.id;
                }
                if (newId) {
                    optIds.current[o.k] = newId;
                    optBox.current[o.k] = boxId;
                    if (!slotBoxId.current) slotBoxId.current = boxId;
                    idMap[o.k] = { id: newId, boxId };
                    slotSnap.current[newId] = JSON.stringify(body);
                    if (pub) wantLive.push({ boxId, id: newId, body });
                }
            } catch (e) {
                errors.push(e.message || `Could not save "${o.n}"`);
            }
        }

        /* the server may ignore "published" on create: read the rows back and switch on any that came back unpublished */
        const byBox = {};
        wantLive.forEach((w) => { (byBox[w.boxId] = byBox[w.boxId] || []).push(w); });
        for (const bid of Object.keys(byBox)) {
            let rows = [];
            try { rows = await listMealBoxItems(bid); } catch (e) { continue; }
            const stale = byBox[bid].filter((w) => {
                const r = rows.find((x) => String(x.id) === String(w.id));
                return r && !isLive(r);
            });
            if (!stale.length) continue;
            for (const w of stale) {
                try { await updateMealBoxItem(bid, w.id, w.body); } catch (e) { /* checked below */ }
            }
            let again = [];
            try { again = await listMealBoxItems(bid); } catch (e) { /* cannot verify */ }
            const still = stale.filter((w) => {
                const r = again.find((x) => String(x.id) === String(w.id));
                return r && !isLive(r);
            });
            if (still.length) {
                errors.push(`The server saved ${still.length} item(s) as NOT published although Published is Yes. The backend ignores the published flag on create/update, so fix the backend (or run UPDATE box_item_slot SET published = 1 ...).`);
            }
        }

        let latest = next;
        if (Object.keys(idMap).length) {
            latest = (mbRef.current.slots || []).map((s) => ({
                ...s,
                options: (s.options || []).map((o) => (idMap[o.k] ? { ...o, apiId: idMap[o.k].id, boxId: idMap[o.k].boxId } : o)),
            }));
            applyMB({ ...mbRef.current, slots: latest });
        }
        saveDataSections([{ path: "catering.mealBox.slots", value: latest }]);
        say(errors.length ? errors[0] : "Item slots saved to database", errors.length ? 9000 : 3500);
    };

    const persistSlots = (prev, next, force = false) => {
        const run = queue.current.then(() => runSlots(prev, next, force));
        queue.current = run;
        return run;
    };

    /* Guest quantity defaults: ONE record. Exists -> update, otherwise create. */
    const saveGuests = async (updates) => {
        saveDataSections(updates);
        const cur = mbRef.current;
        const min = Number(cur.minGuests) || 0;
        const step = Number(cur.guestStep) || 0;
        if (min < 1 || step < 1) return notify("Minimum guests and step must be 1 or more");
        const body = {
            minimumGuests: min,
            step,
            quickPresets: (cur.presets || []).map(Number).filter((x) => !isNaN(x)),
            status: "ACTIVE",
        };
        const readId = async () => {
            try {
                const g = await getPublicGuestDefault();
                const o = Array.isArray(g) ? g[0] : g?.data ?? g;
                return o?.id ?? null;
            } catch (e) { return null; }
        };
        try {
            let id = guestId.current || (await readId());
            const saved = unwrapMeal(id ? await updateGuestDefault(id, body) : await addGuestDefault(body));
            guestId.current = saved?.id ?? saved?.data?.id ?? id ?? (await readId());
            notify("Guest defaults saved to database");
        } catch (e) {
            notify(e.message || "Could not save guest defaults");
        }
    };

    /* ------------------------------------------------------------------
       Load logic.  THE DATABASE IS THE SOURCE OF TRUTH.
       - NEW: when the server answers (even with an EMPTY list), box sizes and slots are replaced by exactly what
         the server returned, and the old copy kept in this browser is overwritten. So rows you deleted in the
         database never come back after a refresh.
       - NEW: nothing is written to the database while loading (no automatic re-saving of old local data),
         which is what created the duplicate rows before.
       - slot rows are read from EVERY box; rows with status INACTIVE or removed in this browser are skipped
       - unpublished rows are shown (Published = No) so the admin can switch them on
       - duplicate rows (same slot + same item name) are shown once, but ALL their row ids are remembered,
         so deleting the item deletes every copy
       ------------------------------------------------------------------ */
    useEffect(() => {
        let alive = true;
        (async () => {
            const fields = {};
            try {
                const list = await listMealBoxes();
                if (!alive) return;
                if (Array.isArray(list)) {
                    const visible = list.filter((r) => !isSoftDeleted(r) && !isHidden("mealBox", r));
                    const loaded = sortBoxes(visible.map(fromApiMealBox));
                    loaded.forEach((b) => { boxSnap.current[b.apiId] = mealBoxSnapshot(b); });
                    fields.boxSizes = loaded;
                    fields.slots = [];

                    const byKey = {};
                    const allByKey = {};
                    for (const b of visible) {
                        let rows = [];
                        try { rows = await listMealBoxItems(b.id); } catch (e) { continue; }
                        rows
                            .filter((r) => !isSoftDeleted(r) && !isHidden("mealSlot", r))
                            .forEach((r) => {
                                const row = { ...r, mealBoxId: r.mealBoxId ?? b.id };
                                const key = `${row.slotName}|${String(row.itemName).trim().toLowerCase()}`;
                                (allByKey[key] = allByKey[key] || []).push({ boxId: row.mealBoxId, id: row.id });
                                const live = isLive(row);
                                const old = byKey[key];
                                let better = !old;
                                if (old) {
                                    if (live !== old.live) better = live;
                                    else better = (Number(row.id) || 0) < (Number(old.row.id) || 0);
                                }
                                if (better) byKey[key] = { row, live };
                            });
                    }
                    const picked = Object.values(byKey);
                    const dupByRowId = {};
                    Object.entries(byKey).forEach(([key, p]) => { dupByRowId[p.row.id] = allByKey[key] || []; });

                    if (picked.length) {
                        const counts = {};
                        picked.forEach((p) => { counts[p.row.mealBoxId] = (counts[p.row.mealBoxId] || 0) + 1; });
                        const top = Object.keys(counts).sort((x, y) => counts[y] - counts[x])[0];
                        slotBoxId.current = top != null ? (Number(top) || top) : null;

                        const slots = fromApiSlotRows(picked.map((p) => p.row), slotBoxId.current, mbRef.current.slots || []);
                        slots.forEach((s, si) => (s.options || []).forEach((o) => {
                            dupRows.current[o.k] = dupByRowId[o.apiId] || [];
                            optIds.current[o.k] = o.apiId;
                            optBox.current[o.k] = o.boxId;
                            const pub = o.published !== false;
                            slotSnap.current[o.apiId] = JSON.stringify({
                                slotName: `Slot ${si + 1}`,
                                itemName: o.n.trim(),
                                itemType: o.v ? "Veg" : "Non-Veg",
                                status: "ACTIVE",
                                published: pub,
                                isPublished: pub,
                            });
                        }));
                        fields.slots = slots;
                    }
                }
            } catch (e) {
                if (!/static resource|not supported|not found|404|405/i.test(e?.message || "")) {
                    notify(e.message || "Could not load meal boxes from the server");
                }
            }
            try {
                const g = await getPublicGuestDefault();
                const obj = Array.isArray(g) ? g[0] : g?.data ?? g;
                if (obj && obj.minimumGuests != null) {
                    guestId.current = obj.id ?? null;
                    fields.minGuests = obj.minimumGuests;
                    fields.guestStep = obj.step;
                    if (Array.isArray(obj.quickPresets)) fields.presets = obj.quickPresets;
                }
            } catch (e) { /* no guest defaults saved yet */ }

            if (!alive) return;
            if (Object.keys(fields).length) applyMB({ ...mbRef.current, ...fields });
            if (fields.boxSizes && fields.slots) {
                /* replace the old copy kept in this browser with what the database really holds */
                saveDataSections([
                    { path: "catering.mealBox.boxSizes", value: fields.boxSizes },
                    { path: "catering.mealBox.slots", value: fields.slots },
                ]);
            }
        })();
        return () => { alive = false; };
        // eslint-disable-next-line
    }, []);

    return (
        <>
            {problem && (
                <div role="alert" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", border: "1px solid #c0392b", background: "#fdecea", color: "#7a1d12", borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: 12.5 }}>
                    <strong>The server did not delete this. What it answered:</strong>{"\n\n"}{problem}
                    <div style={{ marginTop: 10 }}>
                        <button className="adm-btn ghost sm" type="button" onClick={() => setProblem("")}>Hide</button>
                    </div>
                </div>
            )}
            <Section num="1" title="Box sizes" sub="e.g. 3 / 5 / 8 item boxes with prices. Saved automatically, shown from smallest to biggest. Item slots below are only shown on the website when a box is published.">
                <Repeater
                    items={mb.boxSizes}
                    onChange={(v) => {
                        const next = sortBoxes(v.map((b) => (b.id ? b : { ...b, id: uid("box") })));
                        setMB({ ...mb, boxSizes: next });
                        persistBoxes(mb.boxSizes || [], next);
                    }}
                    addLabel="Add box size"
                    itemTitle={(b) => `${b.items} items — ${inr(b.price)}${b.published === false ? " · Hidden" : ""}`}
                    makeNew={() => ({
                        id: uid("box"),
                        items: Math.max(0, ...(mb.boxSizes || []).map((x) => Number(x.items) || 0)) + 1,
                        price: 0, note: "onwards", published: true,
                    })}
                    renderRow={(b, i, upd) => (
                        <>
                            <div className="adm-grid3">
                                <Num label="Item count" value={b.items} onChange={(v) => upd({ ...b, items: v })} />
                                <Num label="Price (₹)" value={b.price} onChange={(v) => upd({ ...b, price: v })} />
                                <F label="Price note">
                                    <input value={b.note ?? ""} onChange={(e) => upd({ ...b, note: e.target.value })}
                                        placeholder="e.g. onwards" />
                                    <small className="adm-hint">Shown beside this box price and the order estimate. Leave blank to hide it.</small>
                                </F>
                            </div>
                            <F label="Published on website">
                                <select value={b.published === false ? "no" : "yes"} onChange={(e) => upd({ ...b, published: e.target.value === "yes" })}>
                                    <option value="yes">Yes (visible on the website)</option>
                                    <option value="no">No (hidden)</option>
                                </select>
                            </F>
                        </>
                    )}
                />
            </Section>

            <Section num="2" title="Guest quantity defaults" sub="One saved record. Saving again replaces it."
                right={<SaveSection
                    updates={[
                        { path: "catering.mealBox.minGuests", value: mb.minGuests },
                        { path: "catering.mealBox.guestStep", value: mb.guestStep },
                        { path: "catering.mealBox.presets", value: mb.presets },
                    ]}
                    label="guest defaults" onSave={saveGuests} />}>
                <div className="adm-grid3">
                    <Num label="Minimum guests" value={mb.minGuests} onChange={(v) => setMB({ ...mb, minGuests: v })} />
                    <Num label="Step" value={mb.guestStep} onChange={(v) => setMB({ ...mb, guestStep: v })} />
                    <TagsInput label="Quick presets (numbers)" value={(mb.presets || []).map(String)}
                        onChange={(v) => setMB({ ...mb, presets: v.map(Number).filter((x) => !isNaN(x)) })}
                        placeholder="Type a number then Enter" />
                </div>
            </Section>

            <Section num="3" title="Box item slots" sub="Each slot has a set of swappable options. The first N slots are shown for an N-item box. Only options with Published = Yes appear on the website. Saved automatically.">
                <Repeater
                    items={mb.slots}
                    onChange={(v) => {
                        const next = withKeys(v);
                        setMB({ ...mb, slots: next });
                        persistSlots(mb.slots || [], next);
                    }}
                    addLabel="Add slot"
                    itemTitle={(s, i) => `Slot ${i + 1} · ${s.options?.[0]?.n || "—"}`}
                    makeNew={() => ({ options: [{ n: "", v: true, published: true, k: uid("opt") }] })}
                    renderRow={(s, i, upd) => (
                        <>
                            <F label="Options (swappable items)">
                                <Repeater
                                    items={s.options}
                                    onChange={(v) => upd({ ...s, options: v })}
                                    addLabel="Add option"
                                    itemTitle={(o) => `${o.n || "—"} ${o.v ? "· Veg" : "· Non-Veg"}${o.published === false ? " · Hidden" : ""}`}
                                    makeNew={() => ({ n: "", v: true, published: true, k: uid("opt") })}
                                    renderRow={(o, oi, ou) => (
                                        <>
                                            <div className="adm-grid2">
                                                <Text label="Item name" value={o.n} onChange={(v) => ou({ ...o, n: v })} />
                                                <F label="Type">
                                                    <select value={o.v ? "veg" : "nonveg"} onChange={(e) => ou({ ...o, v: e.target.value === "veg" })}>
                                                        <option value="veg">Veg</option>
                                                        <option value="nonveg">Non-Veg</option>
                                                    </select>
                                                </F>
                                            </div>
                                            <F label="Published on website">
                                                <select value={o.published === false ? "no" : "yes"} onChange={(e) => ou({ ...o, published: e.target.value === "yes" })}>
                                                    <option value="yes">Yes (visible on the website)</option>
                                                    <option value="no">No (hidden)</option>
                                                </select>
                                            </F>
                                        </>
                                    )}
                                />
                            </F>
                        </>
                    )}
                />
            </Section>
            <Toast text={toast} />
        </>
    );
}

/* ---------------- MENU ITEMS (shared by Meal Box extra tabs + Delivery Box) ---------------- */
/* NEW: convert between the admin menu item shape and the delivery-box API shape
   API body: { name, category, type: "Veg" | "Non-Veg", published } */
const toApiBox = (m) => ({
    name: (m.name || "").trim(),
    category: m.cat || "",
    type: m.veg === false ? "Non-Veg" : "Veg",
    published: m.published !== false,   /* DB column "published" is NOT NULL, so always send true/false */
});

const fromApiBox = (b) => ({
    id: `api-${b.id}`,
    apiId: b.id,
    name: b.name || "",
    cat: b.category || "",
    veg: String(b.type || "").trim().toLowerCase() === "veg",
    published: b.published !== false,
});

/* NEW: create returns { success:false, message } when the name already exists, so turn that into an error */
const unwrapBox = (res) => {
    if (res && res.success === false) throw new Error(res.message || "Delivery box request failed");
    return res;
};

function MenuTab({ data, patch, saveSection }) {
    const cats = data.catering.menuCategories;
    const items = data.catering.menuItems;
    const [filter, setFilter] = useState("all");

    const visible = filter === "all" ? items : items.filter((m) => m.cat === filter);

    /* NEW: delivery-box API. Every change in the editor (Save item, delete) and the normal
       "Save menu items" button is written to the database table delivery_box. */
    const [toast, setToast] = useState("");
    const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

    const queue = useRef(Promise.resolve());   /* saves run one after another, so nothing is created twice */
    const apiIds = useRef({});                 /* item.id -> database id (also for items created a moment ago) */
    const seeded = useRef(false);
    const itemsRef = useRef(items);
    itemsRef.current = items;
    const catsRef = useRef(cats);
    catsRef.current = cats;
    const snap = useRef({});                   /* database id -> last saved body (JSON), so unchanged items are never sent again */

    /* API 5 (delete) + API 4 (update) + API 1 (create). force = update every item even if unchanged */
    const persist = (prev, next, force = false) => {
        const run = queue.current.then(async () => {
            const idMap = {};
            const errors = [];
            try {
                for (const m of prev) {
                    const dbId = m.apiId || apiIds.current[m.id];
                    if (dbId && !next.some((n) => n.id === m.id)) await deleteDeliveryBox(dbId);
                }
            } catch (e) {
                errors.push(e.message || "Could not delete from the database");
            }
            for (const m of next) {
                if (!m.name || !m.name.trim()) continue;
                try {
                    const body = toApiBox(m);
                    const dbId = m.apiId || apiIds.current[m.id];
                    if (dbId && !force && snap.current[dbId] === JSON.stringify(body)) continue; /* unchanged since last save/load */
                    const saved = unwrapBox(dbId
                        ? await updateDeliveryBox(dbId, body)
                        : await addDeliveryBox(body));
                    const newId = saved?.id ?? saved?.data?.id ?? dbId;
                    if (newId) { apiIds.current[m.id] = newId; idMap[m.id] = newId; snap.current[newId] = JSON.stringify(body); }
                } catch (e) {
                    errors.push(e.message || `Could not save "${m.name}"`);
                }
            }
            if (Object.keys(idMap).length) {
                patch("menuItems", itemsRef.current.map((x) => (idMap[x.id] ? { ...x, apiId: idMap[x.id] } : x)));
            }
            /* keep the old local copy in sync too (silent) */
            saveDataSections([{ path: "catering.menuItems", value: next.map((x) => ({ ...x, apiId: apiIds.current[x.id] ?? x.apiId })) }]);
            notify(errors.length ? errors[0] : "Saved to database");
        });
        queue.current = run;
        return run;
    };

    /* API 2: load the saved delivery boxes. If the database is empty, save the items shown here into it. */
    useEffect(() => {
        let alive = true;
        listDeliveryBoxes()
            .then((list) => {
                if (!alive || !Array.isArray(list)) return;
                if (list.length) {
                    const loaded = list.map(fromApiBox);
                    loaded.forEach((m) => { snap.current[m.apiId] = JSON.stringify(toApiBox(m)); }); /* remember what is already in the database */
                    /* make sure every category used by a saved item exists in the category tabs */
                    const missing = [...new Set(loaded.map((m) => m.cat).filter(Boolean))]
                        .filter((c) => !(catsRef.current || []).includes(c));
                    if (missing.length) patch("menuCategories", [...(catsRef.current || []), ...missing]);
                    patch("menuItems", loaded);
                } else if (!seeded.current && itemsRef.current.length) {
                    seeded.current = true;
                    persist([], itemsRef.current, true);
                }
            })
            .catch((e) => notify(e.message || "Could not load delivery boxes from the server"));
        return () => { alive = false; };
        // eslint-disable-next-line
    }, []);

    return (
        <>
            <Section num="1" title="Menu categories" sub="Tabs / filters used on Meal Box & Delivery Box."
                right={<SaveSection path="catering.menuCategories" value={cats} label="menu categories" onSave={saveSection} />}>
                <TagsInput label="Categories" value={cats}
                    onChange={(v) => patch("menuCategories", v)}
                    placeholder="Type a category and Enter"
                    suggestions={["Breakfast", "Tea/Snacks", "Starters", "Main Course", "Desserts"]} />
            </Section>

            <Section num="2" title="Menu items" sub={`${items.length} items · used by both Meal Box (extra items) and Delivery Box. Each item is saved to the database when you save it.`}
                right={
                    <div className="adm-row">
                        <div className="adm-seg">
                            <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All</button>
                            {cats.map((c) => (
                                <button key={c} className={filter === c ? "on" : ""} onClick={() => setFilter(c)}>{c}</button>
                            ))}
                        </div>
                    </div>
                }>
                <Repeater
                    items={visible}
                    addLabel="Add menu item"
                    onChange={(next) => {
                        if (filter === "all") { patch("menuItems", next); persist(items, next); return; } /* NEW: persist(...) writes the change to the API */
                        /* merge back when filtered */
                        const others = items.filter((m) => m.cat !== filter);
                        patch("menuItems", [...others, ...next]);
                        persist(items, [...others, ...next]); /* NEW */
                    }}
                    itemTitle={(m) => `${m.name || "—"} · ${m.cat}`}
                    makeNew={() => ({ id: Date.now(), name: "", cat: cats[1] || cats[0] || "Breakfast", veg: true, published: true })}
                    renderRow={(m, i, upd) => (
                        <>
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
                            {/* NEW: published flag, sent to the delivery-box API */}
                            <F label="Published on website">
                                <select value={m.published === false ? "no" : "yes"} onChange={(e) => upd({ ...m, published: e.target.value === "yes" })}>
                                    <option value="yes">Yes (visible on the website)</option>
                                    <option value="no">No (hidden)</option>
                                </select>
                            </F>
                        </>
                    )}
                />
            </Section>
            <Toast text={toast} /> {/* NEW */}
        </>
    );
}

/* ---------------- FULL CATERING ---------------- */
function FullTab({ patch }) {
    const [full, setFullState] = useState({ hero: "", about: "", gallery: [], cuisines: [], platePrices: [], foodTypes: [], serviceTags: [], published: true, menu: {}, reviews: [] });
    const fullRef = useRef(full);
    const apiId = useRef(null);
    const setFull = (v) => {
        fullRef.current = v;
        setFullState(v);
        patch("full", v);
    };
    const about = full.about ?? "";
    const [toast, setToast] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

    useEffect(() => {
        let alive = true;
        listFullCatering(0, 100).then((res) => {
            if (!alive) return;
            const rows = pageRows(res).sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
            const row = rows[0];
            if (!row) return;
            const mapped = fromApiFullCatering(row);
            apiId.current = mapped.id;
            const next = { ...fullRef.current, ...mapped };
            fullRef.current = next;
            setFullState(next);
            patch("full", next);
        }).catch((e) => {
            if (alive) setError(`Could not load Full Catering from the database: ${e?.message || "Request failed"}`);
        });
        return () => { alive = false; };
    }, []);

    const saveToDatabase = async () => {
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            const current = fullRef.current;
            const dto = toFullCateringDto(current, { update: Boolean(apiId.current) });
            const uploadingHero = isNewImage(current.hero);
            const uploadingGalleryCount = (current.gallery || []).filter(isNewImage).length;
            const heroImage = uploadingHero ? await dataUrlToFile(current.hero, "full-catering-hero") : null;
            const galleryImages = await Promise.all((current.gallery || []).filter(isNewImage).map((src, i) => dataUrlToFile(src, `full-catering-gallery-${i + 1}`)));
            const payload = { dto, heroImage, galleryImages };
            if (apiId.current) await updateFullCatering(apiId.current, payload);
            else {
                const result = await addFullCatering(payload);
                const id = result?.data?.id ?? result?.id;
                if (id != null) apiId.current = id;
            }
            const reread = await listFullCatering(0, 100);
            const rows = pageRows(reread).sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
            const saved = rows.find((r) => Number(r.id) === Number(apiId.current)) || rows[0];
            if (saved) {
                const mapped = fromApiFullCatering(saved);
                if (uploadingHero && !mapped.hero) {
                    throw new Error("The server saved the text but returned no hero image URL. Check the Full Catering upload field names and backend upload handling.");
                }
                if (uploadingGalleryCount && mapped.gallery.length < uploadingGalleryCount) {
                    throw new Error(`The server returned ${mapped.gallery.length} gallery image URL(s) after uploading ${uploadingGalleryCount}. Check the backend gallery upload handling.`);
                }
                apiId.current = mapped.id;
                const next = { ...fullRef.current, ...mapped };
                fullRef.current = next;
                setFullState(next);
                patch("full", next);
            } else if (uploadingHero || uploadingGalleryCount) {
                throw new Error("The server did not return the saved record or its image URLs. Reload the admin list and check the backend upload response.");
            }
            notify("Full Catering saved to the database");
        } catch (e) {
            setError(`Could not save Full Catering to the database: ${e?.message || "Request failed"}`);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <Section num="1" title="Hero image" sub="The main banner image shown at the top of the Full Catering page.">
                <ImageUpload label="Full Catering hero image" value={full.hero || ""} onChange={(v) => setFull({ ...full, hero: v })} />
            </Section>

            <Section num="2" title="About paragraph" sub="Describe the Full Catering service.">
                <Area
                    label="About"
                    value={about}
                    onChange={(v) => setFull({ ...full, about: v })}
                    rows={6}
                    placeholder="Write about the Full Catering service."
                />
            </Section>

            <Section num="3" title="Gallery" sub="Portfolio images on the Full Catering page.">
                <div className="adm-gal">
                    {(full.gallery || []).map((image, i) => (
                        <ImageUpload key={i} label={`Gallery image ${i + 1}`} value={image} compact
                            onChange={(v) => setFull({ ...full, gallery: full.gallery.map((g, k) => (k === i ? v : g)) })}
                            onRemove={() => setFull({ ...full, gallery: full.gallery.filter((_, k) => k !== i) })} />
                    ))}
                    <button type="button" className="adm-gal-add"
                        onClick={() => setFull({ ...full, gallery: [...(full.gallery || []), ""] })}>
                        <span style={{ fontSize: 18 }}>+</span>Add image
                    </button>
                </div>
            </Section>

            <Section num="4" title="Cuisines, Plate prices, Food types & Service tags">
                <TagsInput label="Cuisines" value={full.cuisines || []}
                    onChange={(v) => setFull({ ...full, cuisines: v })} placeholder="Add cuisine…" />
                <TagsInput label="Plate price ranges" value={full.platePrices || []}
                    onChange={(v) => setFull({ ...full, platePrices: v })} placeholder="e.g. ₹500 – ₹800" />
                <TagsInput label="Food types" value={full.foodTypes || []}
                    onChange={(v) => setFull({ ...full, foodTypes: v })} placeholder="e.g. Veg" />
                <TagsInput label="Service tags" value={full.serviceTags || []}
                    onChange={(v) => setFull({ ...full, serviceTags: v })} placeholder="e.g. Live Counters" />
            </Section>

            <Section num="5" title="Reviews" sub="Review storage is not available in the current Full Catering API, so reviews are not saved in this browser.">
                <p className="adm-note">Reviews will appear on the website once the backend provides review fields and endpoints.</p>
            </Section>

            {/* publish flag + save for the full catering API */}
            <Section num="6" title="Publish & save to database"
                sub="Saves Full Catering text, images, tags and visibility to the server database. Published content appears on the website.">
                <F label="Published on website">
                    <select value={full.published === false ? "no" : "yes"} onChange={(e) => setFull({ ...full, published: e.target.value === "yes" })}>
                        <option value="yes">Yes (visible on the website)</option>
                        <option value="no">No (hidden)</option>
                    </select>
                </F>
                <div className="adm-row" style={{ marginTop: 18 }}>
                    <button className="adm-btn" type="button" disabled={busy} onClick={saveToDatabase}>
                        {busy ? "Saving…" : "Save full catering"}
                    </button>
                    <span className="adm-note">{apiId.current ? `Database record #${apiId.current}` : "Not yet saved to the database"}</span>
                </div>
                {error && <p className="adm-error" role="alert" style={{ marginTop: 12 }}>{error}</p>}
            </Section>
            <Toast text={toast} />
        </>
    );
}

/* =====================================================================
   NEW: MENU SECTIONS  (uses services/menuSectionService.js)
   1. POST /api/menu-sections/add            -> create section + categories
   2. GET  /api/menu-sections/{id}           -> get by id
   3. GET  /api/menu-sections/by-name/{name} -> get by name
   4. GET  /api/menu-sections/list           -> paged list
   5. PUT  /api/menu-sections/{id}           -> update section + categories
   6. POST /api/menu-sections/{sectionId}/values -> add one category to a section
   7. POST /api/menu-sections/property/by-ids    -> category descriptions by ids
   ===================================================================== */
const emptySection = () => ({
    sectionName: "",
    sectionCode: "",
    description: "",
    status: "ACTIVE",
    categories: [],
});

function MenuSectionsTab() {
    const [rows, setRows] = useState([]);
    const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 1, totalElements: 0 });
    const [search, setSearch] = useState("");
    const [form, setForm] = useState(null);      /* null = form closed */
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState("");
    const [descMap, setDescMap] = useState({});   /* API 7: { categoryId: description } */

    const notify = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3500);
    };

    const loadList = async (page = 0) => {
        setLoading(true);
        try {
            const res = await listMenuSections(page, 10);
            setRows(res.content || []);
            setPageInfo({
                number: res.number ?? 0,
                totalPages: res.totalPages ?? 1,
                totalElements: res.totalElements ?? (res.content || []).length,
            });
            /* API 7: load the category descriptions for every category on this page */
            const ids = (res.content || []).flatMap((s) => (s.categories || []).map((c) => c.id)).filter(Boolean);
            if (ids.length) {
                try { setDescMap(await getCategoryDescriptions(ids)); } catch (e) { setDescMap({}); }
            } else {
                setDescMap({});
            }
        } catch (e) {
            notify(e.message || "Could not load menu sections");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadList(0); }, []);

    /* API 3: search by exact section name */
    const runSearch = async () => {
        const q = search.trim();
        if (!q) return loadList(0);
        setLoading(true);
        try {
            const one = await getMenuSectionByName(q);
            setRows(one ? [one] : []);
            setPageInfo({ number: 0, totalPages: 1, totalElements: one ? 1 : 0 });
        } catch (e) {
            setRows([]);
            notify(e.message || "No section found with that name");
        } finally {
            setLoading(false);
        }
    };

    /* API 2: open one section fresh from the server */
    const openEdit = async (id) => {
        setLoading(true);
        try {
            setForm(await getMenuSectionById(id));
        } catch (e) {
            notify(e.message || "Could not load section");
        } finally {
            setLoading(false);
        }
    };

    /* API 1 (create) / API 5 (update) */
    const submit = async () => {
        if (!form.sectionName.trim() || !form.sectionCode.trim()) {
            return notify("Section name and section code are required");
        }
        const categories = (form.categories || []).map((c, i) => {
            const cat = {
                categoryName: c.categoryName,
                categoryCode: c.categoryCode,
                description: c.description,
                displayOrder: Number(c.displayOrder) || i + 1,
                status: c.status || "ACTIVE",
            };
            if (c.id) cat.id = c.id; /* keep id of existing categories on update */
            return cat;
        });

        setSaving(true);
        try {
            if (form.id) {
                await updateMenuSection(form.id, {
                    id: form.id,
                    sectionName: form.sectionName,
                    sectionCode: form.sectionCode,
                    description: form.description,
                    status: form.status,
                    categories,
                });
                notify("Menu section updated");
            } else {
                await addMenuSection({
                    sectionName: form.sectionName,
                    sectionCode: form.sectionCode,
                    description: form.description,
                    status: form.status,
                    categories,
                });
                notify("Menu section created");
            }
            setForm(null);
            loadList(pageInfo.number);
        } catch (e) {
            notify(e.message || "Could not save menu section");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {!form && (
                <Section num="1" title="Menu sections" sub={`${pageInfo.totalElements} sections · e.g. DIY Kits with its categories.`}
                    right={
                        <button className="adm-btn sm" type="button" onClick={() => setForm(emptySection())}>
                            Add menu section
                        </button>
                    }>
                    <div className="adm-row" style={{ marginBottom: 12 }}>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
                            placeholder="Search by exact section name"
                            style={{ flex: 1 }}
                        />
                        <button className="adm-btn ghost sm" type="button" onClick={runSearch}>Search</button>
                        <button className="adm-btn ghost sm" type="button"
                            onClick={() => { setSearch(""); loadList(0); }}>Reset</button>
                    </div>

                    {loading && <p className="adm-hint">Loading…</p>}
                    {!loading && rows.length === 0 && (
                        <p className="adm-hint">No menu sections yet. Use "Add menu section" to create the first one.</p>
                    )}

                    {rows.map((s) => (
                        <div key={s.id} className="adm-between" style={{ padding: "10px 0", borderBottom: "1px solid rgba(128,128,128,.2)" }}>
                            <div>
                                <strong>{s.sectionName}</strong> · {s.sectionCode} · {s.status}
                                <div className="adm-hint">
                                    {(s.categories || []).map((c) => c.categoryName).join(", ") || "No categories"}
                                </div>
                                {(s.categories || []).map((c) => (
                                    <div key={c.id} className="adm-hint">
                                        {c.categoryName}: {descMap[c.id] ?? c.description ?? "-"}
                                    </div>
                                ))}
                            </div>
                            <button className="adm-btn ghost sm" type="button" onClick={() => openEdit(s.id)}>Edit</button>
                        </div>
                    ))}

                    {pageInfo.totalPages > 1 && (
                        <div className="adm-row" style={{ marginTop: 12 }}>
                            <button className="adm-btn ghost sm" type="button" disabled={pageInfo.number === 0}
                                onClick={() => loadList(pageInfo.number - 1)}>Previous</button>
                            <span className="adm-hint">Page {pageInfo.number + 1} of {pageInfo.totalPages}</span>
                            <button className="adm-btn ghost sm" type="button" disabled={pageInfo.number + 1 >= pageInfo.totalPages}
                                onClick={() => loadList(pageInfo.number + 1)}>Next</button>
                        </div>
                    )}
                </Section>
            )}

            {form && (
                <>
                    <Section num="1" title={form.id ? `Edit section · ${form.sectionName || ""}` : "New menu section"}
                        sub="Section details sent to the admin service."
                        right={
                            <div className="adm-row">
                                <button className="adm-btn ghost sm" type="button" onClick={() => setForm(null)}>Cancel</button>
                                <button className="adm-btn ghost sm" type="button" disabled={saving} onClick={submit}>
                                    {saving ? "Saving…" : form.id ? "Update section" : "Create section"}
                                </button>
                            </div>
                        }>
                        <div className="adm-grid2">
                            <Text label="Section name" value={form.sectionName}
                                onChange={(v) => setForm({ ...form, sectionName: v })} placeholder="DIY Kits" />
                            <Text label="Section code" value={form.sectionCode}
                                onChange={(v) => setForm({ ...form, sectionCode: v })} placeholder="CONFIG" />
                        </div>
                        <Text label="Description" value={form.description || ""}
                            onChange={(v) => setForm({ ...form, description: v })} />
                        <F label="Status">
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </F>
                    </Section>

                    <Section num="2" title="Categories" sub="Categories that belong to this section, shown in display order.">
                        <Repeater
                            items={form.categories || []}
                            onChange={(v) => setForm({ ...form, categories: v })}
                            addLabel="Add category"
                            itemTitle={(c) => `${c.displayOrder || "-"} · ${c.categoryName || "Untitled category"}`}
                            makeNew={() => ({
                                categoryName: "", categoryCode: "", description: "",
                                displayOrder: (form.categories || []).length + 1, status: "ACTIVE",
                            })}
                            renderRow={(c, i, upd) => (
                                <>
                                    <div className="adm-grid2">
                                        <Text label="Category name" value={c.categoryName}
                                            onChange={(v) => upd({ ...c, categoryName: v })} placeholder="Allkits" />
                                        <Text label="Category code" value={c.categoryCode}
                                            onChange={(v) => upd({ ...c, categoryCode: v })} placeholder="PROPERTIES" />
                                    </div>
                                    <Text label="Description" value={c.description || ""}
                                        onChange={(v) => upd({ ...c, description: v })} />
                                    {form.id && !c.id && (
                                        <button className="adm-btn ghost sm" type="button" onClick={async () => {
                                            if (!c.categoryName || !c.categoryName.trim()) return notify("Category name is required");
                                            try {
                                                /* API 6: add this category to the existing section right now */
                                                const saved = await addCategoryToSection(form.id, {
                                                    categoryName: c.categoryName,
                                                    categoryCode: c.categoryCode,
                                                    description: c.description,
                                                    displayOrder: Number(c.displayOrder) || i + 1,
                                                    status: c.status || "ACTIVE",
                                                });
                                                upd({ ...c, ...saved });
                                                notify("Category added to section");
                                            } catch (e) {
                                                notify(e.message || "Could not add category");
                                            }
                                        }}>Save category to section</button>
                                    )}
                                    <div className="adm-grid2">
                                        <Num label="Display order" value={c.displayOrder}
                                            onChange={(v) => upd({ ...c, displayOrder: v })} />
                                        <F label="Status">
                                            <select value={c.status || "ACTIVE"} onChange={(e) => upd({ ...c, status: e.target.value })}>
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="INACTIVE">INACTIVE</option>
                                            </select>
                                        </F>
                                    </div>
                                </>
                            )}
                        />
                    </Section>
                </>
            )}

            <Toast text={toast} />
        </>
    );
}
