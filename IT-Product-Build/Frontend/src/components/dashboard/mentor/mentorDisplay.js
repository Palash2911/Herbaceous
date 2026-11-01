import { fieldStep } from "@/content/onboarding";

export const MENTORSHIP_STATUS = {
  ACTIVE: { label: "Active", tone: "positive" },
  PAUSED: { label: "Paused", tone: "caution" },
  ENDED: { label: "Ended", tone: "negative" },
};

export function mentorshipStatus(status) {
  return MENTORSHIP_STATUS[status] ?? { label: status ?? "Unknown", tone: "neutral" };
}

export function fieldLabel(id) {
  return fieldStep.options.find((option) => option.id === id)?.label ?? id ?? "";
}

export function initialsOf(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const TOLERANCE_CATEGORY_LABELS = {
  MISSED_COMMITMENTS: "Missed commitments",
  UNRESPONSIVE: "Unresponsive",
  PLAN_NOT_FOLLOWED: "Did not follow agreed plan",
  CONDUCT_CONCERN: "Conduct concern",
  OTHER: "Other",
};

export const TOLERANCE_CATEGORIES = Object.keys(TOLERANCE_CATEGORY_LABELS);

export function toleranceCategoryLabel(category) {
  return TOLERANCE_CATEGORY_LABELS[category] ?? category ?? "";
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ADVOCACY_TYPE_LABELS = {
  REFERRAL: "Referral",
  INTRODUCTION: "Introduction",
  NOMINATION: "Nomination",
  ENDORSEMENT: "Endorsement",
  OTHER: "Other",
};

export function advocacyTypeLabel(type) {
  return ADVOCACY_TYPE_LABELS[type] ?? type ?? "";
}

const ADVOCACY_STATUS_LABELS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  DONE: "Done",
  WITHDRAWN: "Withdrawn",
  CLOSED: "Closed",
};

export function advocacyStatusLabel(status) {
  return ADVOCACY_STATUS_LABELS[status] ?? status ?? "";
}

export const ADVOCACY_TONE = {
  PENDING: "caution",
  ACCEPTED: "positive",
  DECLINED: "negative",
  DONE: "positive",
  WITHDRAWN: "neutral",
  CLOSED: "neutral",
};
