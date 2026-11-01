import {
  mentorAvailabilityStep,
  mentorBioStep,
  mentorExperienceStep,
  mentorFieldStep,
  mentorReviewStep,
  mentorSpecialismsStep,
  mentorStyleStep,
} from "@/content/mentorOnboarding";

const label = (options, id) => options.find((o) => o.id === id)?.label ?? "";

export function buildMentorSummary(answers) {
  return [
    {
      question: mentorFieldStep.question,
      value: [label(mentorFieldStep.options, answers.field)],
      stepIndex: 1,
      note: mentorReviewStep.fieldNote,
    },
    {
      question: mentorExperienceStep.question,
      value: [
        answers.jobTitle.trim(),
        answers.company.trim(),
        `${Number(answers.yearsExperience)} years of experience`,
      ],
      stepIndex: 2,
    },
    {
      question: mentorSpecialismsStep.question,
      value: answers.specialisms,
      stepIndex: 3,
    },
    {
      question: mentorStyleStep.question,
      value: [label(mentorStyleStep.options, answers.style)],
      stepIndex: 4,
    },
    {
      question: mentorAvailabilityStep.question,
      value: [
        label(mentorAvailabilityStep.cadenceOptions, answers.cadence),
        ...answers.times.map((t) =>
          label(mentorAvailabilityStep.timeOptions, t),
        ),
      ].filter(Boolean),
      stepIndex: 5,
    },
    {
      question: mentorAvailabilityStep.openAvailabilityLabel,
      value: [
        mentorAvailabilityStep.openAvailabilityOptions.find(
          (o) => o.value === answers.openAvailability,
        )?.label ?? "",
      ].filter(Boolean),
      stepIndex: 5,
    },
    {
      question: mentorBioStep.question,
      value: [answers.bio.trim() || "Nothing added"],
      stepIndex: 6,
    },
  ];
}
