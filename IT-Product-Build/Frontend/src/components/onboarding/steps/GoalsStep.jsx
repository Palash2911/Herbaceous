import { goalsStep } from "@/content/onboarding";
import { MonoLabel, OptionChip, OptionGroup, QuestionHeader } from "../primitives";

export function GoalsStep({ answers, update }) {
  const selected = answers.goals;
  const atMax = selected.length >= goalsStep.max;

  const toggle = (id) => {
    if (selected.includes(id)) {
      update(
        "goals",
        selected.filter((g) => g !== id),
      );
      return;
    }
    if (atMax) return;
    update("goals", [...selected, id]);
  };

  return (
    <div>
      <QuestionHeader
        question={goalsStep.question}
        hint={`Choose up to ${goalsStep.max}.`}
        badge={
          <MonoLabel className="text-primary" aria-live="polite">
            {selected.length} of {goalsStep.max} selected
          </MonoLabel>
        }
      />
      <OptionGroup label={goalsStep.question} multi className="flex flex-wrap gap-[8px]">
        {goalsStep.options.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <OptionChip
              key={option.id}
              label={option.label}
              selected={isSelected}
              dimmed={atMax && !isSelected}
              onClick={() => toggle(option.id)}
            />
          );
        })}
      </OptionGroup>
    </div>
  );
}
