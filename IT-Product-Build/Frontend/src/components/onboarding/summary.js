import {
  aboutStep,
  availabilityStep,
  fieldStep,
  goalsStep,
  stageStep,
  styleStep,
} from "@/content/onboarding";

const label = (options, id) => options.find((o) => o.id === id)?.label ?? "";

export function buildSummary(answers) {
  const fieldValue =
    answers.field === "other"
      ? answers.fieldOther.trim() || "Other"
      : label(fieldStep.options, answers.field);

  return [
    { question: fieldStep.question, value: [fieldValue], stepIndex: 1 },
    {
      question: stageStep.question,
      value: [label(stageStep.options, answers.stage)],
      stepIndex: 2,
    },
    {
      question: goalsStep.question,
      value: answers.goals.map((g) => label(goalsStep.options, g)),
      stepIndex: 3,
    },
    {
      question: styleStep.question,
      value: [label(styleStep.options, answers.style)],
      stepIndex: 4,
    },
    {
      question: availabilityStep.question,
      value: [
        label(availabilityStep.cadenceOptions, answers.cadence),
        ...answers.times.map((t) => label(availabilityStep.timeOptions, t)),
      ].filter(Boolean),
      stepIndex: 5,
    },
    {
      question: aboutStep.question,
      value: [answers.about.trim() || "Nothing added"],
      stepIndex: 6,
    },
  ];
}
