import { apiRequest } from "./apiClient";
import { getAccessToken } from "./authService";

export async function createInitialUser(user) {
  return apiRequest("/initial-user/api/users/create", {
    method: "POST",
    baseUrl: "",
    body: JSON.stringify({ ...user, createdById: 1 }),
  });
}

export async function createUser(user) {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");

  return apiRequest("/user-service/api/users/create", {
    method: "POST",
    token,
    body: JSON.stringify(user),
  });
}
