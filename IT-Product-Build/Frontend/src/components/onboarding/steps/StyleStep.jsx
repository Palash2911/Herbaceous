import { styleStep } from "@/content/onboarding";
import { OptionGroup, OptionRow, QuestionHeader } from "../primitives";

export function StyleStep({ answers, update, content = styleStep }) {
  return (
    <div>
      <QuestionHeader question={content.question} />
      <OptionGroup
        label={content.question}
        className="grid grid-cols-1 gap-[16px] sm:grid-cols-2"
      >
        {content.options.map((option) => (
          <OptionRow
            key={option.id}
            label={option.label}
            detail={option.detail}
            selected={answers.style === option.id}
            onClick={() => update("style", option.id)}
          />
        ))}
      </OptionGroup>
    </div>
  );
}
