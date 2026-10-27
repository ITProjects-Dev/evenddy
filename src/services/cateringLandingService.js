import { apiRequest } from "./apiClient";
import { getAccessToken } from "./authService";

/* Catering Landing Card APIs. Same style as menuSectionService.js / userService.js.

   ADMIN_BASE_URL  -> admin-service through the gateway (login token required)
   PUBLIC_BASE_URL -> public service on port 8084 (no token, used by the customer website)
   Override them with VITE_ADMIN_API_URL / VITE_PUBLIC_API_URL in .env */
const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_API_URL ?? "http://localhost:8765";
const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL ?? "http://localhost:8084";

const ADMIN_BASE = "/admin-service/api/catering-landing";
const PUBLIC_BASE = "/api/public/catering-landing";

function requireToken() {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  return token;
}

/* Card body used by create + update:
   { title, eyebrowTagline, iconKey, tone, priceBadge, cardImageUrl,
     ctaButtonLabel, aboutParagraphs, chips (JSON string, e.g. "[\"Wedding\",\"Birthday\"]"), status } */

/* 1. POST /admin-service/api/catering-landing/cateringLandingAdd */
export async function addCateringLandingCard(card) {
  return apiRequest(`${ADMIN_BASE}/cateringLandingAdd`, {
    method: "POST",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
    body: JSON.stringify(card),
  });
}

/* 2. GET /admin-service/api/catering-landing/cateringLandingList  -> array */
export async function listCateringLandingCards() {
  return apiRequest(`${ADMIN_BASE}/cateringLandingList`, {
    method: "GET",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
  });
}

/* 3. GET /admin-service/api/catering-landing/View/{id} */
export async function getCateringLandingCard(id) {
  return apiRequest(`${ADMIN_BASE}/View/${id}`, {
    method: "GET",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
  });
}

/* 4. PUT /admin-service/api/catering-landing/Update/{id} */
export async function updateCateringLandingCard(id, card) {
  return apiRequest(`${ADMIN_BASE}/Update/${id}`, {
    method: "PUT",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
    body: JSON.stringify(card),
  });
}

/* 5. DELETE /admin-service/api/catering-landing/Delete/{id}  -> 204 No Content */
export async function deleteCateringLandingCard(id) {
  try {
    return await apiRequest(`${ADMIN_BASE}/Delete/${id}`, {
      method: "DELETE",
      token: requireToken(),
      baseUrl: ADMIN_BASE_URL,
    });
  } catch (e) {
    /* 204 has no body, so a JSON-parse error here still means the delete worked */
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

/* ---------------- PUBLIC (customer website, no token) ---------------- */

/* GET http://localhost:8084/api/public/catering-landing/list  -> only published cards */
export async function listPublicCateringLanding() {
  try {
    return await apiRequest(`${PUBLIC_BASE}/list`, {
      method: "GET",
      baseUrl: PUBLIC_BASE_URL,
    });
  } catch (e) {
    /* NEW: the public service on port 8084 is not reachable, so read the same public list through the gateway
       (the other public lists, e.g. delivery box / meal box / full catering, already work like this) */
    return apiRequest(`/admin-service/api/public/catering-landing/list`, {
      method: "GET",
      baseUrl: ADMIN_BASE_URL,
    });
  }
}

/* GET http://localhost:8084/api/public/catering-landing/{id} */
export async function getPublicCateringLanding(id) {
  return apiRequest(`${PUBLIC_BASE}/${id}`, {
    method: "GET",
    baseUrl: PUBLIC_BASE_URL,
  });
}