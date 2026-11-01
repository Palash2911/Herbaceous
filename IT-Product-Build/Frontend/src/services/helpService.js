import { apiRequest } from "./apiClient";

export const createHelpTicket = (category, message) =>
  apiRequest("/help/tickets", {
    method: "POST",
    body: { category, message },
  });
