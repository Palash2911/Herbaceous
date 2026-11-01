import { stageStep } from "@/content/onboarding";
import { OptionGroup, OptionRow, QuestionHeader } from "../primitives";

export function StageStep({ answers, update }) {
  return (
    <div>
      <QuestionHeader question={stageStep.question} />
      <OptionGroup label={stageStep.question} className="flex flex-col gap-[16px]">
        {stageStep.options.map((option) => (
          <OptionRow
            key={option.id}
            label={option.label}
            detail={option.detail}
            selected={answers.stage === option.id}
            onClick={() => update("stage", option.id)}
          />
        ))}
      </OptionGroup>
    </div>
  );
}
