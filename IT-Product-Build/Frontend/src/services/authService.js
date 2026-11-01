import { apiRequest } from "./apiClient";

export const signup = (role) =>
  apiRequest("/auth/signup", { method: "POST", body: { role } });

export const getSummary = () => apiRequest("/auth/summary");

export const getMe = () => apiRequest("/auth/me");

export const updateDisplayName = (displayName) =>
  apiRequest("/auth/me", { method: "PATCH", body: { displayName } });
