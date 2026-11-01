import { SPECIALISMS } from "./specialisms.js";

export const WEIGHTS = {
  field: 30,
  goals: 20,
  availability: 15,
  style: 15,
  experience: 20,
};

const NEUTRAL_SCORE = 50;

const STAGE_EXPERIENCE_BAND = {
  undergrad: [1, 8],
  postgrad: [2, 10],
  recent: [2, 10],
  early: [3, 15],
  mid: [5, 20],
};
const GRACE_YEARS = 5;

const SPECIALISM_GOALS = new Map(
  SPECIALISMS.map((s) => [s.label.toLowerCase(), s.goals]),
);

const FACTOR_LABELS = {
  field: "same field",
  goals: "overlapping goals",
  availability: "matching availability",
  style: "similar mentoring style",
  experience: "experience level suited to your career stage",
};
const FACTOR_ORDER = ["field", "goals", "availability", "style", "experience"];

function scoreField(menteeField, mentorField) {
  if (mentorField == null) return NEUTRAL_SCORE;
  return menteeField === mentorField ? 100 : 0;
}

function scoreStyle(menteeStyle, mentorStyle) {
  if (mentorStyle == null) return NEUTRAL_SCORE;
  return menteeStyle === mentorStyle ? 100 : 30;
}

function scoreAvailability(
  menteeCadence,
  mentorCadence,
  menteeTimes,
  mentorTimes,
) {
  const cadenceScore =
    mentorCadence == null
      ? NEUTRAL_SCORE
      : menteeCadence === mentorCadence
        ? 100
        : 0;

  let overlapScore;
  if (!Array.isArray(mentorTimes) || mentorTimes.length === 0) {
    overlapScore = NEUTRAL_SCORE;
  } else if (!Array.isArray(menteeTimes) || menteeTimes.length === 0) {
    overlapScore = NEUTRAL_SCORE;
  } else {
    const mentorSet = new Set(mentorTimes);
    const overlap = menteeTimes.filter((t) => mentorSet.has(t)).length;
    overlapScore = Math.round((overlap / menteeTimes.length) * 100);
  }

  return Math.round(cadenceScore * 0.5 + overlapScore * 0.5);
}

function scoreGoals(menteeGoals, mentorSpecialisms) {
  if (!Array.isArray(menteeGoals) || menteeGoals.length === 0) {
    return NEUTRAL_SCORE;
  }
  if (!Array.isArray(mentorSpecialisms) || mentorSpecialisms.length === 0) {
    return NEUTRAL_SCORE;
  }

  const mentorGoalSet = new Set();
  for (const specialism of mentorSpecialisms) {
    const goals = SPECIALISM_GOALS.get(String(specialism).toLowerCase());
    if (goals) goals.forEach((g) => mentorGoalSet.add(g));
  }

  const matched = menteeGoals.filter((g) => mentorGoalSet.has(g)).length;
  return Math.round((matched / menteeGoals.length) * 100);
}

function scoreExperience(menteeStage, mentorYearsExperience) {
  if (mentorYearsExperience == null) return NEUTRAL_SCORE;
  const band = STAGE_EXPERIENCE_BAND[menteeStage];
  if (!band) return NEUTRAL_SCORE;
  const [lo, hi] = band;
  if (mentorYearsExperience >= lo && mentorYearsExperience <= hi) return 100;
  const distance =
    mentorYearsExperience < lo
      ? lo - mentorYearsExperience
      : mentorYearsExperience - hi;
  return Math.max(0, Math.round(100 * (1 - distance / GRACE_YEARS)));
}

function buildReasoning(breakdown) {
  const ranked = FACTOR_ORDER.map((key) => ({
    key,
    value: breakdown[key],
  })).sort(
    (a, b) =>
      b.value - a.value ||
      FACTOR_ORDER.indexOf(a.key) - FACTOR_ORDER.indexOf(b.key),
  );

  const [first, second] = ranked;
  const firstLabel = FACTOR_LABELS[first.key];
  const capitalized = firstLabel.charAt(0).toUpperCase() + firstLabel.slice(1);
  return `${capitalized} and ${FACTOR_LABELS[second.key]}.`;
}

export function scoreMentor(menteeProfile, mentorProfile) {
  const breakdown = {
    field: scoreField(menteeProfile.field, mentorProfile.field),
    goals: scoreGoals(menteeProfile.goals, mentorProfile.specialisms),
    availability: scoreAvailability(
      menteeProfile.availabilityCadence,
      mentorProfile.availabilityCadence,
      menteeProfile.availabilityTimes,
      mentorProfile.availabilityTimes,
    ),
    style: scoreStyle(
      menteeProfile.mentoringStyle,
      mentorProfile.mentoringStyle,
    ),
    experience: scoreExperience(
      menteeProfile.careerStage,
      mentorProfile.yearsExperience,
    ),
  };

  const score = Math.round(
    (breakdown.field * WEIGHTS.field +
      breakdown.goals * WEIGHTS.goals +
      breakdown.availability * WEIGHTS.availability +
      breakdown.style * WEIGHTS.style +
      breakdown.experience * WEIGHTS.experience) /
      100,
  );

  return { score, breakdown, reasoning: buildReasoning(breakdown) };
}
