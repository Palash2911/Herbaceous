import prisma from "../config/prisma.js";
import {
  VALID_CADENCES,
  VALID_FIELDS,
  VALID_STYLES,
  VALID_TIMES,
} from "../utils/profileEnums.js";
import { SPECIALISMS } from "./matching/specialisms.js";

const MAX_JOB_TITLE_LENGTH = 150;
const MAX_COMPANY_LENGTH = 150;
const MAX_BIO_LENGTH = 500;
const MIN_YEARS_EXPERIENCE = 2;
const MAX_YEARS_EXPERIENCE = 60;
const MIN_SPECIALISMS = 1;
const MAX_SPECIALISMS = 5;
const ONBOARDING_CONFLICT_MESSAGE = "Mentor onboarding already completed";

const CANONICAL_SPECIALISMS = new Map(
  SPECIALISMS.map((s) => [s.label.toLowerCase(), s.label]),
);

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function isNonBlankString(value, maxLength) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

export function validateField(value) {
  return VALID_FIELDS.includes(value) ? null : "Invalid or missing field";
}

export function validateJobTitle(value) {
  return isNonBlankString(value, MAX_JOB_TITLE_LENGTH)
    ? null
    : `jobTitle is required and must be ${MAX_JOB_TITLE_LENGTH} characters or fewer`;
}

export function validateCompany(value) {
  return isNonBlankString(value, MAX_COMPANY_LENGTH)
    ? null
    : `company is required and must be ${MAX_COMPANY_LENGTH} characters or fewer`;
}

export function validateYearsExperience(value) {
  if (!Number.isInteger(value) || value > MAX_YEARS_EXPERIENCE) {
    return `yearsExperience must be an integer between ${MIN_YEARS_EXPERIENCE} and ${MAX_YEARS_EXPERIENCE}`;
  }
  if (value < MIN_YEARS_EXPERIENCE) {
    return `Mentors need at least ${MIN_YEARS_EXPERIENCE} years of experience`;
  }
  return null;
}

export function validateSpecialisms(value) {
  if (
    !Array.isArray(value) ||
    value.length < MIN_SPECIALISMS ||
    value.length > MAX_SPECIALISMS
  ) {
    return `specialisms must be an array of ${MIN_SPECIALISMS} to ${MAX_SPECIALISMS} valid labels`;
  }

  const unrecognised = value.filter(
    (label) =>
      typeof label !== "string" ||
      !CANONICAL_SPECIALISMS.has(label.toLowerCase()),
  );
  if (unrecognised.length > 0) {
    return `Unrecognised specialisms: ${unrecognised.map((label) => JSON.stringify(label)).join(", ")}`;
  }

  const seen = new Set();
  const duplicates = new Set();
  for (const label of value) {
    const canonical = CANONICAL_SPECIALISMS.get(label.toLowerCase());
    if (seen.has(canonical)) {
      duplicates.add(canonical);
    }
    seen.add(canonical);
  }
  if (duplicates.size > 0) {
    return `Duplicate specialisms: ${[...duplicates].join(", ")}`;
  }

  return null;
}

export function validateBio(value) {
  return value == null ||
    (typeof value === "string" && value.trim().length <= MAX_BIO_LENGTH)
    ? null
    : `bio must be a string of ${MAX_BIO_LENGTH} characters or fewer`;
}

export function validateMentoringStyle(value) {
  return value == null || VALID_STYLES.includes(value)
    ? null
    : "Invalid mentoringStyle";
}

export function validateAvailabilityCadence(value) {
  return value == null || VALID_CADENCES.includes(value)
    ? null
    : "Invalid availabilityCadence";
}

export function validateAvailabilityTimes(value) {
  return value == null ||
    (Array.isArray(value) &&
      value.length > 0 &&
      value.every((t) => VALID_TIMES.includes(t)))
    ? null
    : "availabilityTimes must be a non-empty array of valid ids";
}

export function validateAcceptingMentees(value) {
  return typeof value === "boolean"
    ? null
    : "acceptingMentees must be a boolean";
}

export function validateOpenAvailability(value) {
  return typeof value === "boolean"
    ? null
    : "openAvailability must be a boolean";
}

const NORMALISERS = {
  jobTitle: (value) => value.trim(),
  company: (value) => value.trim(),
  bio: (value) => (value == null ? null : value.trim() || null),
  specialisms: (value) =>
    value.map((label) => CANONICAL_SPECIALISMS.get(label.toLowerCase())),
  availabilityTimes: (value) => value ?? [],
};

function normalise(key, value) {
  const normaliser = NORMALISERS[key];
  return normaliser ? normaliser(value) : value;
}

export async function updateOnboarding(profile, body) {
  if (profile.field != null) {
    throw makeError(409, ONBOARDING_CONFLICT_MESSAGE);
  }

  const {
    field,
    jobTitle,
    company,
    yearsExperience,
    specialisms,
    bio,
    mentoringStyle,
    availabilityCadence,
    availabilityTimes,
    openAvailability,
  } = body;

  const firstError = [
    validateField(field),
    validateJobTitle(jobTitle),
    validateCompany(company),
    validateYearsExperience(yearsExperience),
    validateSpecialisms(specialisms),
    validateBio(bio),
    validateMentoringStyle(mentoringStyle),
    validateAvailabilityCadence(availabilityCadence),
    validateAvailabilityTimes(availabilityTimes),
    validateOpenAvailability(openAvailability),
  ].find((err) => err);

  if (firstError) {
    throw makeError(400, firstError);
  }

  const { count } = await prisma.mentorProfile.updateMany({
    where: { id: profile.id, field: null },
    data: {
      field,
      jobTitle: normalise("jobTitle", jobTitle),
      company: normalise("company", company),
      yearsExperience,
      specialisms: normalise("specialisms", specialisms),
      bio: normalise("bio", bio),
      mentoringStyle: mentoringStyle ?? null,
      availabilityCadence: availabilityCadence ?? null,
      availabilityTimes: normalise("availabilityTimes", availabilityTimes),
      openAvailability,
    },
  });

  if (count === 0) {
    throw makeError(409, ONBOARDING_CONFLICT_MESSAGE);
  }

  return prisma.mentorProfile.findUnique({ where: { id: profile.id } });
}

const PATCHABLE_FIELDS = {
  jobTitle: validateJobTitle,
  company: validateCompany,
  yearsExperience: validateYearsExperience,
  specialisms: validateSpecialisms,
  bio: validateBio,
  mentoringStyle: validateMentoringStyle,
  availabilityCadence: validateAvailabilityCadence,
  availabilityTimes: validateAvailabilityTimes,
  acceptingMentees: validateAcceptingMentees,
  openAvailability: validateOpenAvailability,
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
    data[key] = normalise(key, body[key]);
  }

  return prisma.mentorProfile.update({
    where: { id: profileId },
    data,
  });
}
