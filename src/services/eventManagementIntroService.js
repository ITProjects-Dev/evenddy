import { apiRequest } from "./apiClient";
import { getAccessToken } from "./authService";

const INTRO_PATH = "/admin-service/api/admin/event-management-intro";
const PUBLIC_INTRO_PATH = "/admin-service/api/public/event-management-intro";

function normalizePublicIntroList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.content)) return result.content;
  if (result && typeof result === "object" && (result.id != null || result.heading)) return [result];
  if (result == null) return [];
  throw new Error("The public event management intro response had an unexpected format.");
}

export async function listPublicEventManagementIntros() {
  const result = await apiRequest(`${PUBLIC_INTRO_PATH}/list`);
  return normalizePublicIntroList(result);
}

export async function getPublicEventManagementIntro(id) {
  const result = await apiRequest(`${PUBLIC_INTRO_PATH}/view/${encodeURIComponent(id)}`);
  const records = normalizePublicIntroList(result);
  return records.find((intro) => String(intro.id) === String(id)) || records[0] || null;
}

export function getPublicEventManagementBannerUrl(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl.trim()) return "";
  const path = imageUrl.trim();
  if (path.startsWith("data:") || path.startsWith("blob:") || path.startsWith("//")) return path;
  if (/^https?:\/\//i.test(path)) {
    const parsedUrl = new URL(path);
    if (parsedUrl.origin !== "http://localhost:8765") return path;
    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  }
  if (path.startsWith("/admin-service/")) return path;
  if (path.startsWith("admin-service/")) return `/${path}`;
  return `/admin-service/${path.replace(/^\/+/, "")}`;
}

export function getEventManagementBannerUrl(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl.trim()) return "";
  const path = imageUrl.trim();

  if (path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  if (/^https?:\/\//i.test(path)) {
    const parsedUrl = new URL(path);
    if (parsedUrl.origin !== "http://localhost:8765") return path;
    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  }
  if (path.startsWith("//")) return path;
  if (path.startsWith("/admin-service/")) return path;
  if (path.startsWith("admin-service/")) return `/${path}`;

  return `/admin-service/${path.replace(/^\/+/, "")}`;
}

export async function fetchEventManagementBanner(imageUrl) {
  const token = requireToken();
  const response = await fetch(getEventManagementBannerUrl(imageUrl), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Banner image request failed with status ${response.status}.`);
  }
  const blob = await response.blob();
  if (blob.type && !blob.type.startsWith("image/")) {
    throw new Error(`Banner URL returned "${blob.type}", not an image. Upload a JPG, PNG, or WebP banner.`);
  }
  return URL.createObjectURL(blob);
}

function requireToken() {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  return token;
}

function createFormData(intro, bannerImage) {
  const formData = new FormData();
  formData.append("eyebrow", intro.eyebrow);
  formData.append("heading", intro.heading);
  formData.append("leadParagraph", intro.leadParagraph);
  formData.append("status", intro.status);
  if (bannerImage) formData.append("bannerImage", bannerImage);
  return formData;
}

export function listEventManagementIntros(page = 0, size = 10) {
  return apiRequest(`${INTRO_PATH}/list?page=${page}&size=${size}`, { token: requireToken() });
}

export function getEventManagementIntro(id) {
  return apiRequest(`${INTRO_PATH}/view/${id}`, { token: requireToken() });
}

export function createEventManagementIntro(intro, bannerImage) {
  return apiRequest(`${INTRO_PATH}/create`, {
    method: "POST",
    token: requireToken(),
    body: createFormData(intro, bannerImage),
  });
}

export function updateEventManagementIntro(id, intro, bannerImage) {
  return apiRequest(`${INTRO_PATH}/update/${id}`, {
    method: "PUT",
    token: requireToken(),
    body: createFormData(intro, bannerImage),
  });
}
