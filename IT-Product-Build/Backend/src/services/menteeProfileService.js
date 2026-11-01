import prisma from "../config/prisma.js";
import {
  VALID_CADENCES,
  VALID_FIELDS,
  VALID_GOALS,
  VALID_STAGES,
  VALID_STYLES,
  VALID_TIMES,
} from "../utils/profileEnums.js";

const MAX_ABOUT_LENGTH = 500;
const ONBOARDING_CONFLICT_MESSAGE = "Mentee onboarding already completed";

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export function validateField(value) {
  return VALID_FIELDS.includes(value) ? null : "Invalid or missing field";
}

export function validateCareerStage(value) {
  return VALID_STAGES.includes(value) ? null : "Invalid or missing careerStage";
}

export function validateMentoringStyle(value) {
  return value == null || VALID_STYLES.includes(value) ? null : "Invalid mentoringStyle";
}

export function validateAvailabilityCadence(value) {
  return value == null || VALID_CADENCES.includes(value) ? null : "Invalid availabilityCadence";
}

export function validateAvailabilityTimes(value) {
  return Array.isArray(value) && value.length > 0 && value.every((t) => VALID_TIMES.includes(t))
    ? null
    : "availabilityTimes must be a non-empty array of valid ids";
}

export function validateGoals(value) {
  return Array.isArray(value) &&
    value.length >= 1 &&
    value.length <= 3 &&
    value.every((g) => VALID_GOALS.includes(g))
    ? null
    : "goals must be an array of 1 to 3 valid goal ids";
}

export function validateAbout(value) {
  return value == null || (typeof value === "string" && value.trim().length <= MAX_ABOUT_LENGTH)
    ? null
    : `about must be ${MAX_ABOUT_LENGTH} characters or fewer`;
}

function normaliseAbout(value) {
  return value == null ? null : value.trim() || null;
}

export async function updateOnboarding(profile, body) {
  if (profile.field != null) {
    throw makeError(409, ONBOARDING_CONFLICT_MESSAGE);
  }

  const {
    field,
    careerStage,
    mentoringStyle,
    availabilityCadence,
    availabilityTimes,
    goals,
    about,
  } = body;

  const firstError = [
    validateField(field),
    validateCareerStage(careerStage),
    validateMentoringStyle(mentoringStyle),
    validateAvailabilityCadence(availabilityCadence),
    validateAvailabilityTimes(availabilityTimes),
    validateGoals(goals),
    validateAbout(about),
  ].find((err) => err);

  if (firstError) {
    throw makeError(400, firstError);
  }

  const { count } = await prisma.menteeProfile.updateMany({
    where: { id: profile.id, field: null },
    data: {
      field,
      careerStage,
      mentoringStyle: mentoringStyle ?? null,
      availabilityCadence: availabilityCadence ?? null,
      availabilityTimes,
      goals,
      about: normaliseAbout(about),
    },
  });

  if (count === 0) {
    throw makeError(409, ONBOARDING_CONFLICT_MESSAGE);
  }

  return prisma.menteeProfile.findUnique({ where: { id: profile.id } });
}

const PATCHABLE_FIELDS = {
  mentoringStyle: validateMentoringStyle,
  availabilityCadence: validateAvailabilityCadence,
  availabilityTimes: validateAvailabilityTimes,
  goals: validateGoals,
  about: validateAbout,
};

export async function updateProfilePatch(profileId, body) {
  const keys = Object.keys(body);

  for (const key of keys) {
    if (!(key in PATCHABLE_FIELDS)) {
      throw makeError(400, `Unknown field: ${key}`);
    }
  }
  if (keys.length === 0) {
    throw makeError(400, "At least one field is required");
  }

  const data = {};
  for (const key of keys) {
    const error = PATCHABLE_FIELDS[key](body[key]);
    if (error) {
      throw makeError(400, error);
    }
    data[key] = key === "about" ? normaliseAbout(body[key]) : body[key];
  }

  return prisma.menteeProfile.update({
    where: { id: profileId },
    data,
  });
}
