import { apiRequest } from "./apiClient";

export const getMenteeProfile = () => apiRequest("/mentee/profile");

export const updateMenteeProfile = (patch) =>
  apiRequest("/mentee/profile", { method: "PATCH", body: patch });

export const submitOnboarding = (payload) =>
  apiRequest("/mentee/onboarding", { method: "PUT", body: payload });

export const getMentorship = () => apiRequest("/mentee/mentorship");

export const getOverview = () => apiRequest("/mentee/overview");

export const getTolerance = () => apiRequest("/mentee/tolerance");

export const getWeeklyLogs = () => apiRequest("/mentee/weekly-logs");

export const createWeeklyLog = (status, note, weekNumber) =>
  apiRequest("/mentee/weekly-logs", {
    method: "POST",
    body: { status, note, weekNumber },
  });

export const updateWeeklyLog = (id, patch) =>
  apiRequest(`/mentee/weekly-logs/${id}`, { method: "PATCH", body: patch });

export const createPauseRequest = (type, reason, expectedWeeks) =>
  apiRequest("/mentee/pause-requests", {
    method: "POST",
    body: { type, reason, expectedWeeks },
  });

export const listPauseRequests = () => apiRequest("/mentee/pause-requests");

export const withdrawPauseRequest = (id) =>
  apiRequest(`/mentee/pause-requests/${id}/withdraw`, { method: "PATCH" });

function toQueryString(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    usp.set(key, value);
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export const listMentors = (params) =>
  apiRequest(`/mentee/mentors${toQueryString(params)}`);

export const getMentor = (id) => apiRequest(`/mentee/mentors/${id}`);

export const createRequest = (mentorProfileId, message) =>
  apiRequest("/mentee/requests", {
    method: "POST",
    body: { mentorProfileId, message },
  });

export const listRequests = () => apiRequest("/mentee/requests");

export const withdrawRequest = (id) =>
  apiRequest(`/mentee/requests/${id}/withdraw`, { method: "PATCH" });

export const startMentorshipNow = (id) =>
  apiRequest(`/mentee/requests/${id}/start-now`, { method: "POST" });

export const listAdvocacyRequests = () =>
  apiRequest("/mentee/advocacy-requests");

export const createAdvocacyRequest = (type, details) =>
  apiRequest("/mentee/advocacy-requests", {
    method: "POST",
    body: { type, ...(details ? { details } : {}) },
  });

export const withdrawAdvocacyRequest = (id) =>
  apiRequest(`/mentee/advocacy-requests/${encodeURIComponent(id)}/withdraw`, {
    method: "PATCH",
  });