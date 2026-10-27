import { apiRequest } from "./apiClient";
import { getAccessToken } from "./authService";

/* Meal Box APIs. Same style as deliveryBoxService.js / cateringLandingService.js / menuSectionService.js.

   ADMIN_BASE_URL  -> admin-service through the gateway (login token required)
   PUBLIC_BASE_URL -> public meal box / guest default APIs also go through the gateway (no token, used by the customer website)
   Override them with VITE_ADMIN_API_URL / VITE_PUBLIC_API_URL in .env */
const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_API_URL ?? "http://localhost:8765";
const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL ?? "http://localhost:8765";

const MEAL_BASE = "/admin-service/api/meal-box";
const GUEST_BASE = "/admin-service/api/guest-default";
const PUBLIC_MEAL_BASE = "/admin-service/api/public/meal-box";
const PUBLIC_GUEST_BASE = "/admin-service/api/public/guest-default";
/* NEW: optional public endpoint that returns EVERY published slot row, whatever box it belongs to
   (see the small backend controller in the answer). If it does not exist, the page falls back to
   reading the slots of every published box. */
const PUBLIC_SLOT_BASE = "/admin-service/api/public/box-item-slot";

/* NEW: sent as createdById / updatedById (the created_by_id / updated_by_id columns). The created / updated DATE
   columns can only be filled by the backend (JPA auditing), see the entity code in the answer. */
const AUDIT_USER_ID = 1;

function requireToken() {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  return token;
}

/* NEW: a row counts as live unless published is false / 0 / "0" / "false" (bit(1) columns can arrive in any of those shapes) */
export const isLive = (r) => {
  const p = r?.published;
  return !(p === false || p === 0 || p === "0" || String(p).toLowerCase() === "false");
};

/* DELETE calls may answer with an empty body (e.g. 204 No Content). That causes a JSON-parse
   error, which still means the delete worked. */
async function safeDelete(path) {
  try {
    return await apiRequest(path, {
      method: "DELETE",
      token: requireToken(),
      baseUrl: ADMIN_BASE_URL,
    });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

/* ---------------------------------------------------------------------
   Try the possible urls of one call until one of them works.
   The url that works is remembered, so the other urls are only tried once.
   --------------------------------------------------------------------- */
const resolved = {};
const PATH_MISSING = /static resource|not supported|not found|404|405|no handler|no mapping|convert|mismatch/i;
const isAuthError = (e) =>
  e?.status === 401 || e?.status === 403 || /session|token|unauthor|forbidden|expired/i.test(e?.message || "");

async function tryPaths(key, attempts) {
  const token = requireToken();
  const first = resolved[key];
  const order = first != null && attempts[first]
    ? [first, ...attempts.map((_, i) => i).filter((i) => i !== first)]
    : attempts.map((_, i) => i);
  let realError = null;
  let lastError = null;
  const tried = [];
  const log = [];
  for (const i of order) {
    const a = attempts[i];
    const method = a.method || "GET";
    tried.push(`${method} ${a.path.replace("/admin-service/api", "")}`);
    try {
      const res = await apiRequest(a.path, {
        method,
        token,
        baseUrl: ADMIN_BASE_URL,
        ...(a.body ? { body: a.body } : {}),
      });
      resolved[key] = i;
      return res;
    } catch (e) {
      /* an empty body on a successful PUT/DELETE causes a JSON-parse error: that still means it worked */
      if (e instanceof SyntaxError && method !== "GET") { resolved[key] = i; return null; }
      if (isAuthError(e)) throw e;
      lastError = e;
      log.push(`${method} ${a.path.replace("/admin-service/api", "")}  ->  ${e?.status ?? ""} ${e?.message || e}`.replace(/\s+/g, " "));
      if (!realError && !PATH_MISSING.test(e?.message || "")) realError = e;
    }
  }
  console.error(`Meal box API "${key}" failed:`, log);
  if (realError) {
    try { realError.details = log.join("\n"); } catch (err) { /* read-only error object */ }
    throw realError;
  }
  const failure = new Error(`${lastError?.message || "Request failed"} (tried ${tried.join(" | ")})`);
  failure.details = log.join("\n");
  throw failure;
}

/* ---------------------------------------------------------------------
   Make every box slot row look the same, whatever shape the server sends.
   Accepts flat rows, snake_case rows, grouped rows ({ slotName, items|options|values: [...] })
   and plain strings, and always returns flat rows
   { id, mealBoxId, slotName, itemName, itemType, published }.
   Rows without an item name are dropped.
   --------------------------------------------------------------------- */
const ITEM_LISTS = ["items", "options", "values", "alternatives", "slotItems", "itemList", "children", "mealItems"];
const SLOT_KEYS = ["slotName", "slot_name", "slot"];
const pick = (o, keys) => {
  for (const k of keys) if (o && o[k] != null && o[k] !== "") return o[k];
  return "";
};

/* Gateway responses vary between a direct list, { data: [...] },
   { content: [...] }, and nested { data: { slots: [...] } } envelopes. */
function unwrapRows(value, keys = ["content", "slots", "items", "data", "boxItems"]) {
  let current = value;
  for (let i = 0; i < 5; i += 1) {
    if (Array.isArray(current)) return current;
    if (!current || typeof current !== "object") return [];
    const key = keys.find((k) => Array.isArray(current[k]));
    if (key) return current[key];
    const nested = keys.find((k) => current[k] && typeof current[k] === "object");
    if (!nested) return [];
    current = current[nested];
  }
  return [];
}

function toSlotRow(c, slotName, boxId) {
  if (typeof c === "string") {
    return { slotName, itemName: c, itemType: "Veg", published: true, mealBoxId: boxId };
  }
  let itemType = pick(c, ["itemType", "item_type", "type", "foodType", "food_type", "vegType"]);
  if (!itemType && (c.veg != null || c.isVeg != null)) itemType = (c.veg ?? c.isVeg) ? "Veg" : "Non-Veg";
  return {
    ...c,
    id: c.id,
    mealBoxId: c.mealBoxId ?? c.meal_box_id ?? boxId,
    slotName: pick(c, SLOT_KEYS) || slotName,
    itemName: pick(c, ["itemName", "item_name", "name", "item", "title", "label"]),
    itemType: itemType || "Veg",
    published: c.published ?? true,
  };
}

export function normalizeSlotRows(raw, boxId) {
  const rows = [];
  (Array.isArray(raw) ? raw : []).forEach((e, i) => {
    if (typeof e === "string") { rows.push(toSlotRow(e, `Slot ${i + 1}`, boxId)); return; }
    if (!e || typeof e !== "object") return;
    const nestedKey = ITEM_LISTS.find((k) => Array.isArray(e[k]));
    if (nestedKey) {
      const slotName = pick(e, [...SLOT_KEYS, "name", "title", "label"]) || `Slot ${i + 1}`;
      e[nestedKey].forEach((c) => rows.push(toSlotRow(c, slotName, boxId)));
    } else {
      rows.push(toSlotRow(e, pick(e, SLOT_KEYS) || "Slot 1", boxId));
    }
  });
  const named = rows.filter((r) => String(r.itemName || "").trim());
  if (!named.length && Array.isArray(raw) && raw.length) {
    console.warn("Meal box slots: unrecognised row shape", raw[0]);
  }
  return named;
}

/* =====================================================================
   MEAL BOX APIs
   ===================================================================== */

/* 1. POST /admin-service/api/meal-box/create
   NEW: status / createdById / updatedById are always sent (the backend must store them, see the answer). */
export async function addMealBox(box) {
  return apiRequest(`${MEAL_BASE}/create`, {
    method: "POST",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
    body: JSON.stringify({ status: "ACTIVE", createdById: AUDIT_USER_ID, updatedById: AUDIT_USER_ID, ...box }),
  });
}

/* 2. list of meal boxes (tries several urls; falls back to the public list) */
export async function listMealBoxes() {
  let res;
  try {
    res = await tryPaths("mealBox.list", [
      { path: `${MEAL_BASE}/list` },
      { path: `${MEAL_BASE}` },
      { path: `${MEAL_BASE}/` },
      { path: `${MEAL_BASE}/all` },
      { path: `${MEAL_BASE}/getAll` },
    ]);
  } catch (e) {
    if (isAuthError(e)) throw e;
    res = await listPublicMealBoxes();
  }
  if (Array.isArray(res)) return res;
  const inner = res?.content ?? res?.data ?? res?.boxes ?? res?.mealBoxes;
  if (Array.isArray(inner)) return inner;
  throw new Error("Unexpected answer from the meal box list API");
}

/* 3. GET /admin-service/api/meal-box/{id}  -> { box: {...}, slots: [] } */
export async function getMealBox(id) {
  return apiRequest(`${MEAL_BASE}/${id}`, {
    method: "GET",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
  });
}

/* 4. update a meal box.
   NEW: the saved box is read first and merged with the fields you pass, so a partial update such as
   { published: false } no longer sends itemCount = NaN. status and updatedById are sent too. */
export async function updateMealBox(id, box) {
  let current = null;
  try { current = (await getMealBox(id))?.box ?? null; } catch (e) { /* nothing to merge with */ }
  const merged = { ...(current || {}), ...box };
  const body = JSON.stringify({
    itemCount: Number(merged.itemCount),
    price: merged.price,
    note: merged.note ?? "",
    published: box.published ?? (current ? isLive(current) : true),
    status: merged.status || "ACTIVE",
    updatedById: AUDIT_USER_ID,
  });
  return tryPaths("mealBox.update", [
    { path: `${MEAL_BASE}/update/${id}`, method: "PUT", body },
    { path: `${MEAL_BASE}/${id}`, method: "PUT", body },
    { path: `${MEAL_BASE}/${id}/update`, method: "PUT", body },
    { path: `${MEAL_BASE}/update`, method: "PUT", body },
    { path: `${MEAL_BASE}/update/${id}`, method: "POST", body },
    { path: `${MEAL_BASE}/${id}`, method: "PATCH", body },
  ]);
}

/* 5. delete meal box */
export async function deleteMealBox(id) {
  return tryPaths("mealBox.delete", [
    { path: `${MEAL_BASE}/delete/${id}`, method: "DELETE" },
    { path: `${MEAL_BASE}/${id}`, method: "DELETE" },
    { path: `${MEAL_BASE}/${id}/delete`, method: "DELETE" },
    { path: `${MEAL_BASE}/custom/${id}`, method: "DELETE" },
  ]);
}

/* =====================================================================
   BOX ITEM SLOT APIs
   ===================================================================== */

/* 1. POST /admin-service/api/meal-box/{id}/item/create */
export async function addMealBoxItem(mealBoxId, item) {
  return apiRequest(`${MEAL_BASE}/${mealBoxId}/item/create`, {
    method: "POST",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
    body: JSON.stringify({ status: "ACTIVE", ...item }),
  });
}

/* 2. list of slot rows of one box. Always returns flat rows. */
export async function listMealBoxItems(mealBoxId) {
  let res;
  try {
    res = await tryPaths(`mealBox.items.${mealBoxId}`, [
      { path: `${MEAL_BASE}/${mealBoxId}/item/list` },
      { path: `${MEAL_BASE}/${mealBoxId}/items` },
    ]);
  } catch (e) {
    if (isAuthError(e)) throw e;
    const box = await getMealBox(mealBoxId);
    res = box?.slots || [];
  }
  const raw = Array.isArray(res) ? res : res?.content ?? res?.data ?? res?.slots ?? [];
  return normalizeSlotRows(raw, mealBoxId);
}

/* 3. GET one slot row */
export async function getMealBoxItem(mealBoxId, id) {
  return apiRequest(`${MEAL_BASE}/${mealBoxId}/item/${id}`, {
    method: "GET",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
  });
}

/* 4. update one slot row */
export async function updateMealBoxItem(mealBoxId, id, item) {
  const body = JSON.stringify({ ...item, id, mealBoxId });
  return tryPaths("mealBox.item.update", [
    { path: `${MEAL_BASE}/${mealBoxId}/item/update/${id}`, method: "PUT", body },
    { path: `${MEAL_BASE}/${mealBoxId}/item/${id}`, method: "PUT", body },
  ]);
}

/* 5. delete one slot row */
export async function deleteMealBoxItem(mealBoxId, id) {
  return tryPaths("mealBox.item.delete", [
    { path: `${MEAL_BASE}/${mealBoxId}/item/delete/${id}`, method: "DELETE" },
    { path: `${MEAL_BASE}/${mealBoxId}/item/${id}`, method: "DELETE" },
    { path: `${MEAL_BASE}/item/delete/${id}`, method: "DELETE" },
    { path: `${MEAL_BASE}/${mealBoxId}/items/${id}`, method: "DELETE" },
  ]);
}

/* =====================================================================
   GUEST QUANTITY DEFAULTS APIs
   ===================================================================== */
const guestBody = (d = {}) => ({
  ...d,
  published: d.published ?? true,
  status: d.status ?? "ACTIVE",
  quickPresets: Array.isArray(d.quickPresets) ? d.quickPresets : [],
});

export async function addGuestDefault(defaults) {
  return apiRequest(`${GUEST_BASE}/create`, {
    method: "POST",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
    body: JSON.stringify({ createdById: AUDIT_USER_ID, updatedById: AUDIT_USER_ID, ...guestBody(defaults) }),
  });
}

export async function getGuestDefault(id) {
  return apiRequest(`${GUEST_BASE}/${id}`, {
    method: "GET",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
  });
}

export async function updateGuestDefault(id, defaults) {
  let current = null;
  try { current = await getGuestDefault(id); } catch (e) {
    try { current = await getPublicGuestDefault(); } catch (e2) { /* nothing to merge with */ }
  }
  const saved = Array.isArray(current) ? current[0] : current?.data ?? current ?? {};
  const body = JSON.stringify({ ...guestBody({ ...saved, ...defaults }), id, updatedById: AUDIT_USER_ID });
  return tryPaths("guestDefault.update", [
    { path: `${GUEST_BASE}/update/${id}`, method: "PUT", body },
    { path: `${GUEST_BASE}/${id}`, method: "PUT", body },
    { path: `${GUEST_BASE}/${id}/update`, method: "PUT", body },
    { path: `${GUEST_BASE}/update`, method: "PUT", body },
    { path: `${GUEST_BASE}`, method: "PUT", body },
    { path: `${GUEST_BASE}/update/${id}`, method: "POST", body },
    { path: `${GUEST_BASE}/${id}`, method: "PATCH", body },
  ]);
}

/* ---------------- PUBLIC (customer website, no token) ---------------- */

/* GET /admin-service/api/public/meal-box/list  -> only published boxes */
export async function listPublicMealBoxes() {
  return apiRequest(`${PUBLIC_MEAL_BASE}/list`, {
    method: "GET",
    baseUrl: PUBLIC_BASE_URL,
  });
}

/* GET /admin-service/api/public/meal-box/{id}  -> { box, slots } (slots flattened) */
export async function getPublicMealBoxById(id) {
  const res = await apiRequest(`${PUBLIC_MEAL_BASE}/${id}`, {
    method: "GET",
    baseUrl: PUBLIC_BASE_URL,
  });
  let data = res;
  for (let i = 0; i < 4 && data?.data && !data?.slots; i += 1) data = data.data;
  const rawSlots = unwrapRows(data?.slots ?? data?.box?.slots ?? data);
  return { ...(data || {}), rawSlots, slots: normalizeSlotRows(rawSlots, id) };
}

/* NEW: GET /admin-service/api/public/box-item-slot/list  (optional backend endpoint)
   Returns every published slot row, whatever box it belongs to. */
export async function listPublicSlotRows() {
  const res = await apiRequest(`${PUBLIC_SLOT_BASE}/list`, {
    method: "GET",
    baseUrl: PUBLIC_BASE_URL,
  });
  const raw = unwrapRows(res);
  return normalizeSlotRows(raw, null);
}

/* NEW: all live slot rows for the customer page.
   1) tries the public "all slots" endpoint,
   2) otherwise reads the slots of EVERY published box and merges them,
   then drops unpublished rows and duplicates (same slot + same item name). */
export async function getPublicMealSlots(boxes) {
  let rows = [];
  try { rows = await listPublicSlotRows(); } catch (e) { rows = []; }

  if (!rows.length) {
    let list = boxes;
    if (!Array.isArray(list)) {
      try {
        const r = await listPublicMealBoxes();
        list = unwrapRows(r, ["content", "boxes", "mealBoxes", "data"]);
      } catch (e) { list = []; }
    }
    const parts = await Promise.all(list.map(async (b) => {
      try { return (await getPublicMealBoxById(b.id)).slots || []; } catch (e) { return []; }
    }));
    rows = parts.flat();
  }

  rows = rows.filter(isLive).sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
  const seen = new Set();
  const out = [];
  rows.forEach((r) => {
    const key = `${r.slotName}|${String(r.itemName).trim().toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(r);
  });
  return out;
}

/* GET /admin-service/api/public/guest-default -> { id, minimumGuests, step, quickPresets } */
export async function getPublicGuestDefault() {
  return apiRequest(`${PUBLIC_GUEST_BASE}`, {
    method: "GET",
    baseUrl: PUBLIC_BASE_URL,
  });
}