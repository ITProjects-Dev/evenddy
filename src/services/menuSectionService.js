import { apiRequest } from "./apiClient";
import { getAccessToken } from "./authService";

/* Menu Section APIs (admin-service). Same style as userService.js:
   apiRequest(path, { method, token, baseUrl, body })

   ADMIN_BASE_URL decides where the request goes:
   - "http://localhost:8765" -> straight to the API gateway (works without a Vite proxy)
   - ""                      -> same origin (localhost:5173); then vite.config.js MUST proxy "/admin-service"
   Set VITE_ADMIN_API_URL in .env to change it (e.g. for production). */
const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_API_URL ?? "http://localhost:8765";
const BASE = "/admin-service/api/menu-sections";
const CREATED_BY_ID = 1653; /* sent as createdById when creating a section */

function requireToken() {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  return token;
}

/* 1. POST /admin-service/api/menu-sections/add */
export async function addMenuSection(section) {
  return apiRequest(`${BASE}/add`, {
    method: "POST",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
    body: JSON.stringify({ ...section, createdById: CREATED_BY_ID }),
  });
}

/* 2. GET /admin-service/api/menu-sections/{id} */
export async function getMenuSectionById(id) {
  return apiRequest(`${BASE}/${id}`, {
    method: "GET",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
  });
}

/* 3. GET /admin-service/api/menu-sections/by-name/{name} */
export async function getMenuSectionByName(name) {
  return apiRequest(`${BASE}/by-name/${encodeURIComponent(name)}`, {
    method: "GET",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
  });
}

/* 4. GET /admin-service/api/menu-sections/list?page=0&size=10 */
export async function listMenuSections(page = 0, size = 10) {
  return apiRequest(`${BASE}/list?page=${page}&size=${size}`, {
    method: "GET",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
  });
}

/* 5. PUT /admin-service/api/menu-sections/{id} */
export async function updateMenuSection(id, section) {
  return apiRequest(`${BASE}/${id}`, {
    method: "PUT",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
    body: JSON.stringify(section),
  });
}

/* 6. POST /admin-service/api/menu-sections/{sectionId}/values  (add ONE category to an existing section) */
export async function addCategoryToSection(sectionId, category) {
  return apiRequest(`${BASE}/${sectionId}/values`, {
    method: "POST",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
    body: JSON.stringify(category),
  });
}

/* 7. POST /admin-service/api/menu-sections/property/by-ids  (body: [1,2,3] -> { "1": "description", ... }) */
export async function getCategoryDescriptions(ids) {
  return apiRequest(`${BASE}/property/by-ids`, {
    method: "POST",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
    body: JSON.stringify(ids),
  });
}
