const API_BASE_URL = "";

export async function apiRequest(path, { token, baseUrl = API_BASE_URL, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, { ...options, headers });
  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    const message = typeof data === "string"
      ? data
      : data?.message || data?.error || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (data?.success === false) {
    throw new Error(data.message || "The request was not successful.");
  }

  return data;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
