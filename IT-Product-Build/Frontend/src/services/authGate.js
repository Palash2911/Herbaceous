import { getSummary } from "./authService";
import { getCurrentSession } from "./cognitoAuth";
import { getMenteeProfile } from "./menteeService";
import { getMentorProfile } from "./mentorService";

export async function resolveUserRoute() {
  try {
    const session = await getCurrentSession();
    if (!session) return null;

    const summary = await getSummary();

    if (summary.role === "MENTOR") {
      const profile = await getMentorProfile();
      return {
        role: summary.role,
        destination: profile.mentorProfile.field
          ? "/dashboard"
          : "/mentor/onboarding",
      };
    }

    const profile = await getMenteeProfile();
    return {
      role: summary.role,
      destination: profile.menteeProfile.field ? "/dashboard" : "/onboarding",
    };
  } catch {
    return null;
  }
}

export async function resolveUserDestination() {
  const route = await resolveUserRoute();
  return route ? route.destination : null;
}
