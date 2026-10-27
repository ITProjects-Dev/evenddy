import { apiRequest } from "./apiClient";
import { getAccessToken } from "./authService";

/* Delivery Box APIs. Same style as cateringLandingService.js / menuSectionService.js / userService.js.

   ADMIN_BASE_URL  -> admin-service through the gateway (login token required)
   PUBLIC_BASE_URL -> public delivery box list also goes through the gateway (no token, used by the customer website)
   Override them with VITE_ADMIN_API_URL / VITE_PUBLIC_API_URL in .env */
const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_API_URL ?? "http://localhost:8765";
const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL ?? "http://localhost:8765";

const ADMIN_BASE = "/admin-service/api/delivery-box";
const PUBLIC_BASE = "/admin-service/api/public/delivery-box";

function requireToken() {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  return token;
}

/* Delivery box body used by create + update:
   { name, category, type, published }
   e.g. { name: "Pizza", category: "Breakfast", type: "Veg", published: true } */

/* 1. POST /admin-service/api/delivery-box/create
   Error example: { success: false, message: "Delivery box name already exists: Pizza" } */
export async function addDeliveryBox(box) {
  return apiRequest(`${ADMIN_BASE}/create`, {
    method: "POST",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
    body: JSON.stringify(box),
  });
}

/* 2. GET /admin-service/api/delivery-box/list  -> array */
export async function listDeliveryBoxes() {
  return apiRequest(`${ADMIN_BASE}/list`, {
    method: "GET",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
  });
}

/* 3. GET /admin-service/api/delivery-box/{id} */
export async function getDeliveryBox(id) {
  return apiRequest(`${ADMIN_BASE}/${id}`, {
    method: "GET",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
  });
}

/* 4. PUT /admin-service/api/delivery-box/update/{id}
   (the doc says PUT /delivery-box/{id}, but the server answers "HTTP method 'PUT' is not supported"
   on that path, because /{id} is GET only. Update follows the same pattern as create + delete.
   If your controller uses a different path, change only the line below.) */
export async function updateDeliveryBox(id, box) {
  return apiRequest(`${ADMIN_BASE}/update/${id}`, {
    method: "PUT",
    token: requireToken(),
    baseUrl: ADMIN_BASE_URL,
    body: JSON.stringify(box),
  });
}

/* 5. DELETE /admin-service/api/delivery-box/delete/{id} */
export async function deleteDeliveryBox(id) {
  try {
    return await apiRequest(`${ADMIN_BASE}/delete/${id}`, {
      method: "DELETE",
      token: requireToken(),
      baseUrl: ADMIN_BASE_URL,
    });
  } catch (e) {
    /* an empty body (e.g. 204 No Content) causes a JSON-parse error, which still means the delete worked */
    if (e instanceof SyntaxError) return null;
    throw e;
  }
}

/* ---------------- PUBLIC (customer website, no token) ---------------- */

/* GET http://localhost:8765/admin-service/api/public/delivery-box/list  -> only published boxes
   Optional filters (both are optional):
     listPublicDeliveryBoxes()                                    -> all published
     listPublicDeliveryBoxes({ type: "Veg" })                     -> ?type=Veg
     listPublicDeliveryBoxes({ category: "Breakfast" })           -> ?category=Breakfast
     listPublicDeliveryBoxes({ type: "Veg", category: "Breakfast" }) -> ?type=Veg&category=Breakfast */
export async function listPublicDeliveryBoxes(filters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.append("type", filters.type);
  if (filters.category) params.append("category", filters.category);
  const query = params.toString();

  return apiRequest(`${PUBLIC_BASE}/list${query ? `?${query}` : ""}`, {
    method: "GET",
    baseUrl: PUBLIC_BASE_URL,
  });
}