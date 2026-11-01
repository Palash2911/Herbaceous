const TIMEOUT_MS = 2000;

const REMOTE_URL = process.env.MATCHING_SERVICE_URL;
const REMOTE_KEY = process.env.MATCHING_SERVICE_API_KEY;

if (REMOTE_URL && !REMOTE_KEY) {
  console.warn(
    "[matchingClient] MATCHING_SERVICE_URL set but MATCHING_SERVICE_API_KEY missing — every call will 401 and fall back silently",
  );
}

function toMenteePayload(menteeProfile) {
  return {
    field: menteeProfile.field,
    careerStage: menteeProfile.careerStage,
    mentoringStyle: menteeProfile.mentoringStyle,
    availabilityCadence: menteeProfile.availabilityCadence,
    availabilityTimes: menteeProfile.availabilityTimes,
    goals: menteeProfile.goals,
  };
}

function toMentorPayload(mentorProfile) {
  return {
    id: mentorProfile.id,
    field: mentorProfile.field,
    specialisms: mentorProfile.specialisms,
    mentoringStyle: mentorProfile.mentoringStyle,
    availabilityCadence: mentorProfile.availabilityCadence,
    availabilityTimes: mentorProfile.availabilityTimes,
    yearsExperience: mentorProfile.yearsExperience,
    acceptingMentees: true,
  };
}

function isValidMatchEntry(entry) {
  return (
    entry &&
    typeof entry.mentor_id === "string" &&
    Number.isFinite(entry.score) &&
    entry.breakdown &&
    typeof entry.breakdown === "object"
  );
}

export async function scoreMentorsRemote(menteeProfile, mentorProfiles) {
  const url = process.env.MATCHING_SERVICE_URL;
  if (!url) {
    console.log("[matchingClient] no MATCHING_SERVICE_URL, using local scorer");
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${url}/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Api-Key": process.env.MATCHING_SERVICE_API_KEY ?? "",
      },
      body: JSON.stringify({
        mentee: toMenteePayload(menteeProfile),
        mentors: mentorProfiles.map(toMentorPayload),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn(`[matchingClient] remote scoring HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.matches)) {
      console.warn(
        "[matchingClient] remote scoring: unexpected response shape",
      );
      return null;
    }

    const result = new Map();
    for (const entry of data.matches) {
      if (!isValidMatchEntry(entry)) continue;
      result.set(entry.mentor_id, {
        score: Math.min(100, Math.max(0, Math.round(entry.score))),
        breakdown: entry.breakdown,
        reasoning: entry.reasoning,
      });
    }
    console.log(
      `[matchingClient] scored ${result.size}/${mentorProfiles.length} mentors remotely`,
    );
    return result;
  } catch (err) {
    console.warn(
      `[matchingClient] remote scoring failed: ${err.name}: ${err.message}`,
    );
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
