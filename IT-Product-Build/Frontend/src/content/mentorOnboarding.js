import { availabilityStep, fieldStep, styleStep } from "@/content/onboarding";

const styleDetails = {
  structured: "Regular check ins with clear goals and milestones",
  flexible: "We meet when it is useful, no fixed cadence",
  handson: "Walk through real work together and review what they build",
  bigpicture: "Focus on direction and decisions rather than day to day",
};

export const mentorWelcome = {
  kicker: "SET UP YOUR MENTOR PROFILE",
  headline: "A few questions. Two minutes.",
  body: "Mentees are matched with you on your field, specialisms, style and availability. Your answers decide who finds you.",
  cta: "Get started",
};

export const mentorFieldStep = {
  ...fieldStep,
  question: "Which field do you work in?",
  hint: "Choose the field closest to your work. You cannot change this after onboarding.",
};

export const mentorExperienceStep = {
  question: "Tell us about your work",
  hint: "Mentees see this on your profile.",
  jobTitleLabel: "Job title",
  jobTitlePlaceholder: "e.g. Principal Research Scientist",
  companyLabel: "Company or institution",
  companyPlaceholder: "e.g. Genomics England",
  yearsLabel: "Years of experience",
  yearsPlaceholder: "e.g. 8",
  yearsHint: "Whole number from 2 to 60",
  maxTextLength: 150,
  minYears: 2,
  maxYears: 60,
};

export const mentorSpecialismsStep = {
  question: "What can you help mentees with?",
  min: 1,
  max: 5,
  emptyHint: "Pick at least one",
  loadingHint: "Loading specialisms",
  loadError: "We could not load the specialisms list.",
  retryLabel: "Try again",
};

export const mentorStyleStep = {
  question: "How do you like to mentor?",
  options: styleStep.options.map((option) => ({
    ...option,
    detail: styleDetails[option.id],
  })),
};

export const mentorAvailabilityStep = {
  ...availabilityStep,
  question: "How much time can you give to mentoring?",
  note: "Be realistic here. Mentees plan around what you tell them.",
  openAvailabilityLabel:
    "Would you like to welcome new mentees without a review step?",
  openAvailabilityOptions: [
    {
      id: "instant",
      label:
        "Yes, mentees can begin with their mentorship right away without approval",
      value: true,
    },
    {
      id: "review",
      label: "I'd prefer to review each request first",
      value: false,
    },
  ],
  openAvailabilityHint:
    "With open availability, mentees can begin their mentorship as soon as they request you. You can change this any time in Settings.",
};

export const mentorBioStep = {
  question: "Tell mentees about yourself",
  label: "Bio",
  hint: "Skip it if you would rather not.",
  optionalLabel: "Optional",
  maxLength: 500,
  placeholder:
    "Your path into the field, what you enjoy mentoring on, or what mentees can expect from you.",
  privacyNote:
    "Please don't include your real name or other identifying details here.",
};

export const mentorReviewStep = {
  headline: "Here is what mentees will see.",
  cta: "Finish setup",
  submittingLabel: "Saving",
  editLabel: "Edit",
  fieldNote: "Your field cannot be changed after this step.",
};
