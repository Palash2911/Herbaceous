import { apiRequest } from "./apiClient";

const base = (mentorshipId) =>
  `/mentorships/${encodeURIComponent(mentorshipId)}`;

export const getChatRoom = (id) => apiRequest(`${base(id)}/chat-room`);

export const saveChatRoom = (id, url) =>
  apiRequest(`${base(id)}/chat-room`, { method: "PUT", body: { url } });

export const listMeetingLinks = (id) =>
  apiRequest(`${base(id)}/meeting-links`);

export const addMeetingLink = (id, url, label) =>
  apiRequest(`${base(id)}/meeting-links`, {
    method: "POST",
    body: { url, ...(label ? { label } : {}) },
  });

function toQueryString(params) {
  if (!params) return "";
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    usp.set(key, value);
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export const listCalendarEvents = (id, params) =>
  apiRequest(`${base(id)}/calendar${toQueryString(params)}`);

export const addCalendarEvent = (id, event) =>
  apiRequest(`${base(id)}/calendar`, { method: "POST", body: event });

export const editCalendarEvent = (id, eventId, changes) =>
  apiRequest(`${base(id)}/calendar/${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    body: changes,
  });

export const cancelCalendarEvent = (id, eventId) =>
  apiRequest(`${base(id)}/calendar/${encodeURIComponent(eventId)}/cancel`, {
    method: "PATCH",
  });