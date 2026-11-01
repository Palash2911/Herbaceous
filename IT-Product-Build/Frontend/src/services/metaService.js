import { apiRequest } from "./apiClient";

export const getSpecialisms = () => apiRequest("/meta/specialisms");
