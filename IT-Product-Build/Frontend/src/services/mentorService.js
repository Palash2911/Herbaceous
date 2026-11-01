import { apiRequest } from "./apiClient";

const menteeBase = (mentorshipId) =>
  `/mentor/mentees/${encodeURIComponent(mentorshipId)}`;

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

export const submitMentorOnboarding = (payload) =>
  apiRequest("/mentor/onboarding", { method: "PUT", body: payload });

export const getMentorProfile = () => apiRequest("/mentor/profile");

export const updateMentorProfile = (patch) =>
  apiRequest("/mentor/profile", { method: "PATCH", body: patch });

export const getMentorOverview = () => apiRequest("/mentor/overview");

export const listRequests = (status) =>
  apiRequest(`/mentor/requests${status ? `?status=${status}` : ""}`);

export const acceptRequest = (id, responseNote) =>
  apiRequest(`/mentor/requests/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { action: "ACCEPT", responseNote },
  });

export const declineRequest = (id, responseNote) =>
  apiRequest(`/mentor/requests/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { action: "DECLINE", responseNote },
  });

export const listMentees = (status) =>
  apiRequest(`/mentor/mentees${toQueryString({ status })}`);

export const getMenteeDetail = (mentorshipId) =>
  apiRequest(menteeBase(mentorshipId));

export const respondToPause = (mentorshipId, requestId, action, responseNote) =>
  apiRequest(
    `${menteeBase(mentorshipId)}/pause-requests/${encodeURIComponent(requestId)}`,
    { method: "PUT", body: { action, responseNote } },
  );

export const respondToAdvocacy = (
  mentorshipId,
  requestId,
  action,
  responseNote,
) =>
  apiRequest(
    `${menteeBase(mentorshipId)}/advocacy-requests/${encodeURIComponent(requestId)}`,
    { method: "PUT", body: { action, responseNote } },
  );

export const createToleranceEvent = (mentorshipId, category, reason) =>
  apiRequest(`${menteeBase(mentorshipId)}/tolerance`, {
    method: "POST",
    body: { category, reason },
  });

export const endMentorship = (mentorshipId, reason) =>
  apiRequest(`${menteeBase(mentorshipId)}/end`, {
    method: "POST",
    body: { reason },
  });

export const listAdvocacyInbox = (params) =>
  apiRequest(`/mentor/advocacy-requests${toQueryString(params)}`);

export const getVerificationStatus = () => apiRequest("/mentor/verification");

export const warmupVerifier = (signal) =>
  apiRequest("/mentor/verification/warmup", { signal });

export function submitVerification(resume) {
  const formData = new FormData();
  formData.append("resume", resume);
  formData.append("consent", "true");
  return apiRequest("/mentor/verification", {
    method: "POST",
    body: formData,
  });
}
