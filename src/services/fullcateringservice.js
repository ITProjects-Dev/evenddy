import { apiRequest } from "./apiClient";
import { getAccessToken } from "./authService";

/* Full Catering APIs. Same style as mealBoxService.js / deliveryBoxService.js / cateringLandingService.js.

   ADMIN_BASE_URL  -> admin-service through the gateway (login token required)
   PUBLIC_BASE_URL -> public full catering APIs also go through the gateway (no token, used by the customer website)
   FILE_BASE_URL   -> where the uploaded files are served from. The API returns relative paths such as
                      "uploads/full-catering/abc.jpg", so this is put in front of them.
   Override them with VITE_ADMIN_API_URL / VITE_PUBLIC_API_URL / VITE_FILE_BASE_URL in .env */
const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_API_URL ?? "http://localhost:8765";
const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL ?? "http://localhost:8765";
const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL ?? `${PUBLIC_BASE_URL}/admin-service`;

const FULL_BASE = "/admin-service/api/full-catering";
const PUBLIC_FULL_BASE = "/admin-service/api/public/full-catering/public";

/* the documents send createdById / updatedById in the dto */
const DEFAULT_USER_ID = 1;

function requireToken() {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  return token;
}

/* ---------------------------------------------------------------------
   Helpers
   --------------------------------------------------------------------- */

/* turn "uploads/full-catering/a.jpg" into a full url the browser can load */
export function fullCateringImageUrl(path) {
  if (!path) return "";
  if (typeof path === "object") path = path.imageUrl || path.image_url || path.url || path.path || "";
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  const value = String(path).trim();
  if (value.startsWith("/")) return `${PUBLIC_BASE_URL}${value}`;
  return `${FILE_BASE_URL}/${value.replace(/^\/+/, "")}`;
}

/* Uploaded files are currently behind the admin-service auth filter. Fetching as a blob lets
   admin previews (and a same-browser public preview with an active session) send the bearer token. */
export async function fetchFullCateringImage(src, signal) {
  const url = fullCateringImageUrl(src);
  if (!url) throw new Error("Image URL is empty");
  const headers = {};
  const token = getAccessToken();
  const target = new URL(url, window.location.href);
  const gateway = new URL(PUBLIC_BASE_URL, window.location.href);
  if (token && target.origin === gateway.origin && target.pathname.includes("/uploads/full-catering/")) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(target.href, { headers, signal });
  if (!response.ok) throw new Error(`Image request failed (${response.status})`);
  return URL.createObjectURL(await response.blob());
}

/* a picture that was just chosen in the admin (data: / blob: url) and still has to be uploaded */
export const isNewImage = (v) => typeof v === "string" && /^(data:|blob:)/i.test(v);

/* data: / blob: url -> File, so it can be sent as multipart form-data */
export async function dataUrlToFile(src, baseName = "image") {
  const blob = await (await fetch(src)).blob();
  const ext = ((blob.type || "image/jpeg").split("/")[1] || "jpg").replace("jpeg", "jpg").replace(/\+.*/, "");
  return new File([blob], `${baseName}.${ext}`, { type: blob.type || "image/jpeg" });
}

/* the list APIs answer with a page { content: [...] }; also accept a plain array */
export function pageRows(res) {
  if (Array.isArray(res)) return res;
  const inner = res?.content ?? res?.data?.content ?? res?.data;
  return Array.isArray(inner) ? inner : [];
}

const splitList = (s) =>
  Array.isArray(s) ? s : String(s || "").split(",").map((x) => x.trim()).filter(Boolean);

/* API row -> the shape used by the admin and the customer page
   API: { id, heroImageUrl, aboutParagraph, cuisines, platePriceRanges, foodTypes, serviceTags,
          status, published, galleryImageUrls[] }   (cuisines etc. are comma separated strings) */
export function fromApiFullCatering(r) {
  const heroPath = r?.heroImageUrl ?? r?.hero_image_url ?? r?.heroImage ?? r?.heroimage;
  const galleryPaths = r?.galleryImageUrls ?? r?.gallery_image_urls ?? r?.galleryImages ?? r?.galleryimages ?? [];
  return {
    id: r?.id ?? null,
    hero: fullCateringImageUrl(heroPath),
    about: r?.aboutParagraph || "",
    gallery: (Array.isArray(galleryPaths) ? galleryPaths : []).map(fullCateringImageUrl).filter(Boolean),
    cuisines: splitList(r?.cuisines),
    platePrices: splitList(r?.platePriceRanges),
    foodTypes: splitList(r?.foodTypes),
    serviceTags: splitList(r?.serviceTags),
    status: r?.status || "Active",
    published: r?.published !== false,
  };
}

/* admin `full` data -> the datajson sent in the "dto" form field */
export function toFullCateringDto(full, { update = false } = {}) {
  const dto = {
    aboutParagraph: full.about || "",
    cuisines: (full.cuisines || []).join(", "),
    platePriceRanges: (full.platePrices || []).join(", "),
    foodTypes: (full.foodTypes || []).join(", "),
    serviceTags: (full.serviceTags || []).join(", "),
    status: "Active",
    published: full.published !== false, /* always send true/false */
    updatedById: DEFAULT_USER_ID,
  };
  if (!update) dto.createdById = DEFAULT_USER_ID;
  return dto;
}

/* multipart/form-data request: the browser sets the Content-Type (with the boundary) by itself,
   so no Content-Type header is added here.
   form-data keys (same as the document):  dto (text), galleryimages (files), heroimage (file) */
async function sendForm(method, path, { dto, heroImage, galleryImages }) {
  const form = new FormData();
  form.append("dto", JSON.stringify(dto));
  if (heroImage) {
    /* Support both the documented lowercase multipart names and Spring's common camelCase names. */
    form.append("heroimage", heroImage, heroImage.name);
    form.append("heroImage", heroImage, heroImage.name);
  }
  (galleryImages || []).forEach((f) => {
    form.append("galleryimages", f, f.name);
    form.append("galleryImages", f, f.name);
  });

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
   FULL CATERING APIs
   ===================================================================== */

/* 1. POST /admin-service/api/full-catering/create   (form-data: dto, galleryimages, heroimage)
   dto: { aboutParagraph, cuisines, platePriceRanges, foodTypes, serviceTags, status, published, createdById, updatedById } */
export async function addFullCatering({ dto, heroImage, galleryImages }) {
  return sendForm("POST", `${FULL_BASE}/create`, { dto, heroImage, galleryImages });
}

/* 2. PUT /admin-service/api/full-catering/update/{id}   (form-data: dto, galleryimages, heroimage) */
export async function updateFullCatering(id, { dto, heroImage, galleryImages }) {
  return sendForm("PUT", `${FULL_BASE}/update/${id}`, { dto, heroImage, galleryImages });
}

/* 3. GET /admin-service/api/full-catering/{id} */
export async function getFullCatering(id) {
  return apiRequest(`${FULL_BASE}/${id}`, {
    method: "GET",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
  });
}

/* 4. GET /admin-service/api/full-catering/list  -> page { content: [...], totalElements, ... } */
export async function listFullCatering(page = 0, size = 100) {
  return apiRequest(`${FULL_BASE}/list?page=${page}&size=${size}`, {
    method: "GET",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
  });
}

/* 7. DELETE /admin-service/api/full-catering/{fullCateringId}/gallery/{imageId}
   answers with plain text ("Gallery image deleted successfully. Image ID: 56"), which is not JSON,
   so a JSON-parse error here still means the delete worked. */
export async function deleteFullCateringGalleryImage(fullCateringId, imageId) {
  try {
    return await apiRequest(`${FULL_BASE}/${fullCateringId}/gallery/${imageId}`, {
      method: "DELETE",
      token: requireToken(),
      baseUrl: ADMIN_BASE_URL,
    });
  } catch (e) {
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

/* 8. DELETE /admin-service/api/full-catering/custom/{id}  -> { id, message }
   If that url does not exist on the server, /full-catering/{id} and /full-catering/delete/{id} are tried too.
   A real error (for example a database error) is thrown at once. The error carries `details`: what every url answered,
   which the admin page shows when the delete fails. */
export async function deleteFullCatering(id) {
  const paths = [`${FULL_BASE}/custom/${id}`, `${FULL_BASE}/${id}`, `${FULL_BASE}/delete/${id}`];
  const log = [];
  let lastError = null;
  for (const path of paths) {
    try {
      return await apiRequest(path, {
        method: "DELETE",
        token: requireToken(),
        baseUrl: ADMIN_BASE_URL,
      });
    } catch (e) {
      if (e instanceof SyntaxError) return null; /* an empty / plain-text answer still means the delete worked */
      lastError = e;
      log.push(`DELETE ${path.replace("/admin-service/api", "")}  ->  ${e?.status ?? ""} ${e?.message || e}`.replace(/\s+/g, " "));
      if (!/static resource|not supported|not found|404|405|no handler|no mapping/i.test(e?.message || "")) {
        console.error("Full catering delete failed:", log);
        try { e.details = log.join("\n"); } catch (err) { /* read-only error object */ }
        throw e;
      }
    }
  }
  console.error("Full catering delete failed:", log);
  const failure = new Error(lastError?.message || "Could not delete full catering");
  failure.details = log.join("\n");
  throw failure;
}

/* ---------------- PUBLIC (customer website, no token) ---------------- */

/* 5. GET http://localhost:8765/admin-service/api/public/full-catering/public/list  -> page of PUBLISHED records
   (newest first) */
export async function listPublicFullCatering(page = 0, size = 10) {
  return apiRequest(`${PUBLIC_FULL_BASE}/list?page=${page}&size=${size}`, {
    method: "GET",
    baseUrl: PUBLIC_BASE_URL,
  });
}

/* 6. GET http://localhost:8765/admin-service/api/public/full-catering/public/{id} */
export async function getPublicFullCatering(id) {
  return apiRequest(`${PUBLIC_FULL_BASE}/${id}`, {
    method: "GET",
    baseUrl: PUBLIC_BASE_URL,
  });
}
