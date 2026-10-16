import { apiRequest } from "./apiClient";

const AUTH_PATH = "/auth-service/api/auth";
const ACCESS_TOKEN_KEY = "evenddy_access_token";
const REFRESH_TOKEN_KEY = "evenddy_refresh_token";
const USERNAME_KEY = "evenddy_admin_username";

export async function login({ username, password, remember }) {
  const result = await apiRequest(`${AUTH_PATH}/login`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (!result?.accessToken) {
    throw new Error("The login response did not include an access token.");
  }

  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;
  storage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
  if (result.refreshToken) storage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
  storage.setItem(USERNAME_KEY, username);
  otherStorage.removeItem(ACCESS_TOKEN_KEY);
  otherStorage.removeItem(REFRESH_TOKEN_KEY);
  otherStorage.removeItem(USERNAME_KEY);

  return result;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getSavedUsername() {
  return localStorage.getItem(USERNAME_KEY) || sessionStorage.getItem(USERNAME_KEY);
}

export function clearAuthTokens() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.removeItem(USERNAME_KEY);
  }
}

export async function logout() {
  const token = getAccessToken();
  if (token) {
    await apiRequest(`${AUTH_PATH}/logout`, { method: "POST", token });
  }
}

export async function requestPasswordReset(email) {
  return apiRequest(`${AUTH_PATH}/forgot-password`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyPasswordResetOtp(userIdentifier, otp) {
  return apiRequest(`${AUTH_PATH}/verify-reset-otp`, {
    method: "POST",
    body: JSON.stringify({ userIdentifier, otp }),
  });
}

export async function resetPassword(userIdentifier, otp, newPassword) {
  return apiRequest(`${AUTH_PATH}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ userIdentifier, otp, newPassword }),
  });
}
