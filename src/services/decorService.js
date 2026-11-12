import { apiRequest } from "./apiClient";
import { getAccessToken } from "./authService";

/* DIY Kits / Themes / Custom Decor / Decor Landing APIs. Same style as fullCateringService.js.

   ADMIN_BASE_URL  -> admin-service through the gateway (login token required)
   PUBLIC_BASE_URL -> public APIs through the gateway (no token, customer website)
   FILE_BASE_URL   -> prefix for relative image paths
   Override with VITE_ADMIN_API_URL / VITE_PUBLIC_API_URL / VITE_FILE_BASE_URL in .env

   IMAGE FIX: the gateway answers {"message":"Authorization token is missing"} for plain <img src> requests,
   because an <img> tag cannot send an Authorization header. So images are now DOWNLOADED with fetch()
   (with the login token when there is one) and shown as blob: urls (see fetchDecorImage), exactly like
   fetchFullCateringImage does for Full Catering.
   imageCandidates() still builds several likely urls (gateway prefix present / missing) for each file. */
const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_API_URL ?? "http://localhost:8765";
const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL ?? "http://localhost:8765";
const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL ?? `${PUBLIC_BASE_URL}/admin-service`;

/* documented in the API doc */
const KITS_BASE = "/admin-service/api/admin/diy-kits";
const KITS_LIST = `${KITS_BASE}/list`;
const KITS_DELETE = (id) => `${KITS_BASE}/delete/${id}`;
const PUBLIC_KITS_BASE = "/admin-service/api/public/diy-kits";
const KITS_UPDATE_STATUS = (id) => `${KITS_BASE}/update-status/${id}`;
const KITS_UPDATE_PUBLISHED = (id) => `${KITS_BASE}/update-published/${id}`;
/* Themes APIs
   If your backend has separate decor-theme controllers, change these two lines, for example to
   "/admin-service/api/admin/decore-themes" and "/admin-service/api/public/decore-themes". */
const THEMES_BASE = "/admin-service/api/admin/themes";
const PUBLIC_THEMES_BASE = "/admin-service/api/public/themes";
/* Custom Decor APIs */
const CUSTOM_BASE = "/admin-service/api/custom-decore";
const PUBLIC_CUSTOM_BASE = "/admin-service/api/public/custom-decore";
/* Decor Landing APIs */
const LANDING_BASE = "/admin-service/api/admin/decore-landing";
const PUBLIC_LANDING_BASE = "/admin-service/api/public/decore-landing";
/* multipart part names for the custom decor form-data (as written in the API doc). */
const CUSTOM_PART_DTO = "dto";
const CUSTOM_PART_HERO = "heroImage";
const CUSTOM_PART_GALLERY = "galleryImages";

const DEFAULT_USER_ID = 1;

function requireToken() {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  return token;
}

/* ---------------------------------------------------------------------
   Helpers
   --------------------------------------------------------------------- */
export function diyKitImageUrl(path) {
  if (!path) return "";
  if (typeof path === "object") path = path.imageUrl || path.url || path.path || "";
  // FIX: Windows style "\" separators and spaces in file names break image urls
  const value = String(path || "").trim().replace(/\\/g, "/").replace(/ /g, "%20");
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith("/")) return `${PUBLIC_BASE_URL}${value}`;
  return `${FILE_BASE_URL}/${value.replace(/^\/+/, "")}`;
}

/* other urls the same file could be served from (gateway prefix present / missing). Used when the first one fails. */
export function imageCandidates(raw) {
  const url = String(raw || "").trim();
  if (!url) return [];
  if (/^(data:|blob:)/i.test(url)) return [url];
  const list = [url];
  let path = url;
  if (/^https?:\/\//i.test(url)) {
    try { path = new URL(url).pathname; } catch { return list; }
  }
  const core = path.replace(/^\/+/, "").replace(/^admin-service\//, "");
  if (core) {
    list.push(`${PUBLIC_BASE_URL}/admin-service/${core}`);
    list.push(`${PUBLIC_BASE_URL}/${core}`);
  }
  return [...new Set(list)];
}

/* NEW: downloads an image WITH the login token (the gateway rejects plain <img> requests) and returns a blob: url.
   Tries every candidate url, first with the token and then without it. Cached per url.
   Resolves to "" when nothing could be loaded. */
const blobCache = new Map();
export function fetchDecorImage(raw) {
  const url = String(raw || "").trim();
  if (!url) return Promise.resolve("");
  if (/^(data:|blob:)/i.test(url)) return Promise.resolve(url);
  if (!blobCache.has(url)) {
    blobCache.set(url, (async () => {
      const token = getAccessToken();
      const attempts = token ? [{ headers: { Authorization: `Bearer ${token}` } }, undefined] : [undefined];
      for (const u of imageCandidates(url)) {
        for (const opts of attempts) {
          try {
            const res = await fetch(u, opts);
            if (!res.ok) continue;
            const blob = await res.blob();
            if (blob.type.startsWith("image/")) return URL.createObjectURL(blob);
          } catch { /* try the next url */ }
        }
      }
      console.warn("[decorService] image could not be loaded from any url:", imageCandidates(url));
      blobCache.delete(url); // allow a retry later (for example after login)
      return "";
    })());
  }
  return blobCache.get(url);
}

/* admin screens: swap the server url for a working blob url (falls back to the original url).
   isNewImage() treats blob: as a new image, so dataUrlToFile() re-uploads it correctly on save. */
export function resolveImageUrl(url) {
  if (!url || /^(data:|blob:)/i.test(url)) return Promise.resolve(url);
  return fetchDecorImage(url).then((blob) => blob || url);
}

export const isNewImage = (v) => typeof v === "string" && /^(data:|blob:)/i.test(v);

export async function dataUrlToFile(src, baseName = "image") {
  const blob = await (await fetch(src)).blob();
  const ext = ((blob.type || "image/jpeg").split("/")[1] || "jpg").replace("jpeg", "jpg").replace(/\+.*/, "");
  return new File([blob], `${baseName}.${ext}`, { type: blob.type || "image/jpeg" });
}

/* an image that is already uploaded (http url) -> File, because the update API replaces all images,
   so the old ones must be sent again together with the new ones.
   FIX: tries every candidate url (with and without the token) instead of only the first one. */
export async function urlToFile(url, baseName = "image") {
  const token = getAccessToken();
  let res = null;
  for (const u of imageCandidates(url)) {
    res = await fetch(u, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined).catch(() => null);
    if (!res || !res.ok) res = await fetch(u).catch(() => null); // retry without the token (public files / CORS)
    if (res && res.ok) {
      const blob = await res.blob();
      const last = decodeURIComponent(u.split("?")[0].split("/").pop() || "");
      const name = last && /\.\w+$/.test(last) ? last : `${baseName}.${(blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg")}`;
      return new File([blob], name, { type: blob.type || "image/jpeg" });
    }
  }
  throw new Error(`Could not read the existing image (${res ? res.status : "network/CORS error"}): ${url}`);
}

/* the list APIs answer with a page { content: [...] }; also accept a plain array */
export function pageRows(res) {
  if (Array.isArray(res)) return res;
  const inner = res?.content ?? res?.data?.content ?? res?.data;
  return Array.isArray(inner) ? inner : [];
}

/* id of a record returned by a create call (plain object or wrapped in { data }) */
export const createdId = (res) => res?.id ?? res?.data?.id ?? null;

const str = (v) => (v === null || v === undefined ? "" : String(v).trim());
const num = (v) => {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const calcDiscount = (price, mrp) =>
  mrp > 0 && price > 0 && price < mrp ? Math.round((1 - price / mrp) * 100) : 0;

/* API row -> the shape used by the admin and the customer page */
export function fromApiDiyKit(r) {
  const price = num(r?.price);
  const mrp = num(r?.mrp);
  const imgs = r?.imageUrls ?? r?.image_urls ?? r?.images ?? [];
  return {
    id: r?.id ?? null,
    slug: str(r?.slugId),
    title: str(r?.title),
    cat: str(r?.category),
    tag: str(r?.tagEyebrow),
    popularity: num(r?.popularity),
    price,
    mrp,
    discount: num(r?.discount) || calcDiscount(price, mrp),
    weight: str(r?.shippingWeight),
    footprint: str(r?.footprint),
    desc: str(r?.description),
    status: str(r?.status).toUpperCase() || "ACTIVE",
    published: typeof r?.published === "boolean" ? r.published : true,
    images: (Array.isArray(imgs) ? imgs : []).map(diyKitImageUrl).filter(Boolean),
  };
}

export const slugify = (s) =>
  String(s || "").toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/* admin kit -> the form-data text fields */
export function toDiyKitFields(kit, { update = false } = {}) {
  const price = num(kit.price);
  const mrp = num(kit.mrp);
  const fields = {
    title: str(kit.title),
    slugId: str(kit.slug) || slugify(kit.title),
    category: str(kit.cat),
    tagEyebrow: str(kit.tag),
    popularity: num(kit.popularity),
    price,
    mrp,
    discount: `${calcDiscount(price, mrp)}%`,
    shippingWeight: str(kit.weight),
    footprint: str(kit.footprint),
    description: str(kit.desc),
    status: str(kit.status).toUpperCase() || "ACTIVE",
    updatedById: DEFAULT_USER_ID,
  };
  if (!update) fields.createdById = DEFAULT_USER_ID;
  return fields;
}

/* multipart/form-data: the browser sets the Content-Type (with the boundary) itself */
async function sendForm(method, path, { fields, images }) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  (images || []).forEach((f) => form.append("images", f, f.name));

  const res = await fetch(`${ADMIN_BASE_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${requireToken()}` },
    body: form,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* not json */ }
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || json?.error || text || `Request failed (${res.status})`);
  }
  return json;
}

/* =====================================================================
   DIY KIT APIs
   ===================================================================== */

export async function createDiyKit({ kit, images }) {
  return sendForm("POST", `${KITS_BASE}/create`, { fields: toDiyKitFields(kit), images });
}

export async function updateDiyKit(id, { kit, images }) {
  return sendForm("PUT", `${KITS_BASE}/update/${id}`, { fields: toDiyKitFields(kit, { update: true }), images });
}

export async function getDiyKit(id) {
  return apiRequest(`${KITS_BASE}/view/${id}`, { method: "GET", token: requireToken(), baseUrl: ADMIN_BASE_URL });
}

export async function listDiyKits(page = 0, size = 100, { search = "", category = "", status = "" } = {}) {
  let query = `?page=${page}&size=${size}`;
  if (str(search)) query += `&search=${encodeURIComponent(str(search))}`;
  if (str(category)) query += `&category=${encodeURIComponent(str(category))}`;
  if (str(status)) query += `&status=${encodeURIComponent(str(status).toUpperCase())}`;
  return apiRequest(`${KITS_LIST}${query}`, { method: "GET", token: requireToken(), baseUrl: ADMIN_BASE_URL });
}

export async function deleteDiyKit(id) {
  try {
    return await apiRequest(KITS_DELETE(id), { method: "DELETE", token: requireToken(), baseUrl: ADMIN_BASE_URL });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

export async function updateDiyKitStatus(id, status) {
  const value = str(status).toUpperCase() || "ACTIVE";
  try {
    return await apiRequest(`${KITS_UPDATE_STATUS(id)}?status=${encodeURIComponent(value)}`, {
      method: "PATCH", token: requireToken(), baseUrl: ADMIN_BASE_URL,
    });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

export async function updateDiyKitPublished(id, published) {
  try {
    return await apiRequest(`${KITS_UPDATE_PUBLISHED(id)}?published=${published ? "true" : "false"}`, {
      method: "PATCH", token: requireToken(), baseUrl: ADMIN_BASE_URL,
    });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

/* ---------------- PUBLIC (customer website, no token) ---------------- */

export async function listPublicDiyKits(page = 0, size = 100) {
  return apiRequest(`${PUBLIC_KITS_BASE}/list?page=${page}&size=${size}`, { method: "GET", baseUrl: PUBLIC_BASE_URL });
}

export async function getPublicDiyKit(id) {
  return apiRequest(`${PUBLIC_KITS_BASE}/view/${id}`, { method: "GET", baseUrl: PUBLIC_BASE_URL });
}

/* =====================================================================
   THEME APIs
   API row: { id, title, slugId, tag, startingPrice, description, status, published,
              createdById, updatedById, createdDate, updatedDate, images: null, imageUrls[] }
   ===================================================================== */

export function fromApiTheme(r) {
  const imgs = r?.imageUrls ?? r?.image_urls ?? r?.images ?? [];
  return {
    id: r?.id ?? null,
    slug: str(r?.slugId),
    title: str(r?.title),
    tag: str(r?.tag),
    startsAt: num(r?.startingPrice),
    desc: str(r?.description),
    status: str(r?.status).toUpperCase() || "ACTIVE",
    published: typeof r?.published === "boolean" ? r.published : true,
    images: (Array.isArray(imgs) ? imgs : []).map(diyKitImageUrl).filter(Boolean),
  };
}

export function toThemeFields(theme, { update = false } = {}) {
  const fields = {
    title: str(theme.title),
    slugId: str(theme.slug) || slugify(theme.title),
    tag: str(theme.tag),
    startingPrice: num(theme.startsAt),
    description: str(theme.desc),
    status: str(theme.status).toUpperCase() || "ACTIVE",
    updatedById: DEFAULT_USER_ID,
  };
  if (!update) fields.createdById = DEFAULT_USER_ID;
  return fields;
}

export async function createTheme({ theme, images }) {
  return sendForm("POST", `${THEMES_BASE}/create`, { fields: toThemeFields(theme), images });
}

export async function updateTheme(id, { theme, images }) {
  return sendForm("PUT", `${THEMES_BASE}/update/${id}`, { fields: toThemeFields(theme, { update: true }), images });
}

export async function getTheme(id) {
  return apiRequest(`${THEMES_BASE}/view/${id}`, { method: "GET", token: requireToken(), baseUrl: ADMIN_BASE_URL });
}

export async function listThemes(page = 0, size = 100, { search = "", tag = "", status = "" } = {}) {
  let query = `?page=${page}&size=${size}`;
  if (str(search)) query += `&search=${encodeURIComponent(str(search))}`;
  if (str(tag)) query += `&tag=${encodeURIComponent(str(tag))}`;
  if (str(status)) query += `&status=${encodeURIComponent(str(status).toUpperCase())}`;
  return apiRequest(`${THEMES_BASE}/list${query}`, { method: "GET", token: requireToken(), baseUrl: ADMIN_BASE_URL });
}

export async function updateThemeStatus(id, status) {
  const value = str(status).toUpperCase() || "ACTIVE";
  try {
    return await apiRequest(`${THEMES_BASE}/update-status/${id}?status=${encodeURIComponent(value)}`, {
      method: "PATCH", token: requireToken(), baseUrl: ADMIN_BASE_URL,
    });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

export async function deleteTheme(id) {
  try {
    return await apiRequest(`${THEMES_BASE}/delete/${id}`, { method: "DELETE", token: requireToken(), baseUrl: ADMIN_BASE_URL });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

export async function updateThemePublished(id, published) {
  try {
    return await apiRequest(`${THEMES_BASE}/update-published/${id}?published=${published ? "true" : "false"}`, {
      method: "PATCH", token: requireToken(), baseUrl: ADMIN_BASE_URL,
    });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

/* ---------------- PUBLIC THEMES (customer website, no token) ---------------- */

export async function listPublicThemes(page = 0, size = 100) {
  return apiRequest(`${PUBLIC_THEMES_BASE}/list?page=${page}&size=${size}`, { method: "GET", baseUrl: PUBLIC_BASE_URL });
}

export async function getPublicTheme(id) {
  return apiRequest(`${PUBLIC_THEMES_BASE}/${id}`, { method: "GET", baseUrl: PUBLIC_BASE_URL });
}

/* =====================================================================
   CUSTOM DECOR APIs
   Create / update are multipart/form-data with 3 parts:
     dto           text  -> the JSON below as a string
     heroImage     file  -> one file
     galleryImages file  -> several files
   ===================================================================== */

const splitParagraphs = (v) => {
  if (Array.isArray(v)) return v.map(str).filter(Boolean);
  return String(v ?? "").split(/\r?\n\s*\r?\n|\\n\\n/).map((p) => p.replace(/\\n/g, "\n").trim()).filter(Boolean);
};
const splitList = (v) => {
  if (Array.isArray(v)) return v.map(str).filter(Boolean);
  return String(v ?? "").split(",").map((x) => x.trim()).filter(Boolean);
};

export function fromApiCustomDecor(r) {
  const gallery = r?.galleryImageUrls ?? r?.gallery_image_urls ?? r?.galleryImages ?? [];
  const stats = [...(Array.isArray(r?.stats) ? r.stats : [])]
    .sort((a, b) => num(a?.displayOrder) - num(b?.displayOrder))
    .map((s) => ({ n: str(s?.number), l: str(s?.label), s: str(s?.subLabel) }));
  return {
    id: r?.id ?? null,
    title: str(r?.title),
    price: num(r?.startingPrice),
    hero: diyKitImageUrl(r?.heroImageUrl),
    about: splitParagraphs(r?.aboutParagraphs),
    specialisations: splitList(r?.specialisations),
    stats,
    gallery: (Array.isArray(gallery) ? gallery : []).map(diyKitImageUrl).filter(Boolean),
    status: str(r?.status).toUpperCase() || "ACTIVE",
    published: r?.published === true,
    updatedDate: str(r?.updatedDate),
  };
}

export function toCustomDecorDto(c, { update = false } = {}) {
  const dto = {
    title: str(c.title),
    startingPrice: num(c.price),
    aboutParagraphs: splitParagraphs(c.about).join("\n\n"),
    specialisations: splitList(c.specialisations).join(", "),
    status: str(c.status).toUpperCase() || "ACTIVE",
    published: c.published === true,
    updatedById: DEFAULT_USER_ID,
    stats: (c.stats || [])
      .filter((s) => str(s.n) || str(s.l))
      .map((s, i) => {
        const row = { number: str(s.n), label: str(s.l), subLabel: str(s.s), displayOrder: i + 1, status: "ACTIVE", updatedById: DEFAULT_USER_ID };
        if (!update) row.createdById = DEFAULT_USER_ID;
        return row;
      }),
  };
  if (!update) dto.createdById = DEFAULT_USER_ID;
  return dto;
}

async function sendCustomForm(method, path, { dto, heroImage, galleryImages }) {
  const form = new FormData();
  form.append(CUSTOM_PART_DTO, JSON.stringify(dto));
  if (heroImage) form.append(CUSTOM_PART_HERO, heroImage, heroImage.name);
  (galleryImages || []).forEach((f) => form.append(CUSTOM_PART_GALLERY, f, f.name));

  const res = await fetch(`${ADMIN_BASE_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${requireToken()}` },
    body: form,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* not json */ }
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || json?.error || text || `Request failed (${res.status})`);
  }
  return json;
}

export async function createCustomDecor({ custom, heroImage, galleryImages }) {
  return sendCustomForm("POST", `${CUSTOM_BASE}/create`, { dto: toCustomDecorDto(custom), heroImage, galleryImages });
}

export async function updateCustomDecor(id, { custom, heroImage, galleryImages }) {
  return sendCustomForm("PUT", `${CUSTOM_BASE}/update/${id}`, { dto: toCustomDecorDto(custom, { update: true }), heroImage, galleryImages });
}

export async function getCustomDecor(id) {
  return apiRequest(`${CUSTOM_BASE}/${id}`, { method: "GET", token: requireToken(), baseUrl: ADMIN_BASE_URL });
}

export async function listCustomDecors(page = 0, size = 100) {
  return apiRequest(`${CUSTOM_BASE}/list?page=${page}&size=${size}`, { method: "GET", token: requireToken(), baseUrl: ADMIN_BASE_URL });
}

export async function deleteCustomDecorGalleryImage(customDecoreId, imageId) {
  try {
    return await apiRequest(`${CUSTOM_BASE}/${customDecoreId}/gallery/${imageId}`, { method: "DELETE", token: requireToken(), baseUrl: ADMIN_BASE_URL });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

export async function deleteCustomDecor(id) {
  try {
    return await apiRequest(`${CUSTOM_BASE}/custom/${id}`, { method: "DELETE", token: requireToken(), baseUrl: ADMIN_BASE_URL });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

/* ---------------- PUBLIC CUSTOM DECOR (customer website, no token) ---------------- */

export async function listPublicCustomDecors() {
  return apiRequest(`${PUBLIC_CUSTOM_BASE}/published`, { method: "GET", baseUrl: PUBLIC_BASE_URL });
}

export async function getPublicCustomDecor(id) {
  return apiRequest(`${PUBLIC_CUSTOM_BASE}/publicView/${id}`, { method: "GET", baseUrl: PUBLIC_BASE_URL });
}

/* =====================================================================
   DECOR LANDING APIs
   API row: { id, title, ctaLabel, text, cardImage: null, cardImageUrl, status, published, ... }
   Create / update are multipart/form-data: title, ctaLabel, text, status (text) + cardImage (file).
   ===================================================================== */

export function fromApiDecorLanding(r) {
  return {
    id: r?.id ?? null,
    title: str(r?.title),
    cta: str(r?.ctaLabel),
    text: str(r?.text),
    image: diyKitImageUrl(r?.cardImageUrl),
    status: str(r?.status).toUpperCase() || "ACTIVE",
    published: r?.published === true,
    updatedDate: str(r?.updatedDate),
  };
}

export function toDecorLandingFields(card, { update = false } = {}) {
  const fields = {
    title: str(card.title),
    ctaLabel: str(card.cta),
    text: str(card.text),
    status: str(card.status).toUpperCase() || "ACTIVE",
  };
  if (update) fields.updatedById = DEFAULT_USER_ID;
  else { fields.createdById = DEFAULT_USER_ID; fields.updatedById = DEFAULT_USER_ID; }
  return fields;
}

async function sendLandingForm(method, path, { fields, image }) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  if (image) form.append("cardImage", image, image.name);

  const res = await fetch(`${ADMIN_BASE_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${requireToken()}` },
    body: form,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* not json */ }
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || json?.error || text || `Request failed (${res.status})`);
  }
  return json;
}

export async function createDecorLanding({ card, image }) {
  return sendLandingForm("POST", `${LANDING_BASE}/create`, { fields: toDecorLandingFields(card), image });
}

export async function updateDecorLanding(id, { card, image }) {
  return sendLandingForm("PUT", `${LANDING_BASE}/update/${id}`, { fields: toDecorLandingFields(card, { update: true }), image });
}

export async function getDecorLanding(id) {
  return apiRequest(`${LANDING_BASE}/view/${id}`, { method: "GET", token: requireToken(), baseUrl: ADMIN_BASE_URL });
}

export async function listDecorLandings(page = 0, size = 100) {
  return apiRequest(`${LANDING_BASE}/list?page=${page}&size=${size}`, { method: "GET", token: requireToken(), baseUrl: ADMIN_BASE_URL });
}

export async function updateDecorLandingStatus(id, status) {
  const value = str(status).toUpperCase() || "ACTIVE";
  try {
    return await apiRequest(`${LANDING_BASE}/update-status/${id}?status=${encodeURIComponent(value)}`, {
      method: "PATCH", token: requireToken(), baseUrl: ADMIN_BASE_URL,
    });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

export async function deleteDecorLanding(id) {
  try {
    return await apiRequest(`${LANDING_BASE}/delete/${id}`, { method: "DELETE", token: requireToken(), baseUrl: ADMIN_BASE_URL });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

export async function updateDecorLandingPublished(id, published) {
  try {
    return await apiRequest(`${LANDING_BASE}/update-published/${id}?published=${published ? "true" : "false"}`, {
      method: "PATCH", token: requireToken(), baseUrl: ADMIN_BASE_URL,
    });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

/* ---------------- PUBLIC LANDING (customer website, no token) ---------------- */

export async function listPublicDecorLandings(page = 0, size = 100) {
  return apiRequest(`${PUBLIC_LANDING_BASE}/list?page=${page}&size=${size}`, { method: "GET", baseUrl: PUBLIC_BASE_URL });
}

export async function getPublicDecorLanding(id) {
  return apiRequest(`${PUBLIC_LANDING_BASE}/${id}`, { method: "GET", baseUrl: PUBLIC_BASE_URL });
}