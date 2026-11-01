function initialsFromName(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

import { EMPTY_TRACK_RECORD } from "./mentorTrackRecord.js";

export function toMentorCard(
  mentorProfile,
  scoreResult,
  requestId,
  { withBio = false, trackRecord = EMPTY_TRACK_RECORD } = {},
) {
  const card = {
    id: mentorProfile.id,
    name: mentorProfile.user.displayName,
    initials: initialsFromName(mentorProfile.user.displayName),
    role: mentorProfile.jobTitle,
    company: mentorProfile.company,
    verified: mentorProfile.isVerified,
    score: scoreResult.score,
    reasoning: scoreResult.reasoning,
    specialisms: mentorProfile.specialisms,
    field: mentorProfile.field,
    seniority: mentorProfile.yearsExperience,
    mentoringStyle: mentorProfile.mentoringStyle,
    availability: {
      cadence: mentorProfile.availabilityCadence,
      times: mentorProfile.availabilityTimes,
    },
    openAvailability: mentorProfile.openAvailability,
    breakdown: scoreResult.breakdown,
    requestStatus: requestId ? "PENDING" : null,
    requestId: requestId ?? null,
    menteesMentored: trackRecord.menteesMentored,
    advocacyGiven: trackRecord.advocacyGiven,
  };

  if (withBio) {
    card.bio = mentorProfile.bio;
  }

  return card;
}
