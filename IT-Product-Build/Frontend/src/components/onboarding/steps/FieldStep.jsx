import * as Icons from "lucide-react";
import { fieldStep } from "@/content/onboarding";
import { OptionCard, OptionGroup, QuestionHeader, TextField } from "../primitives";

function Icon({ name }) {
  const Cmp = Icons[name];
  return <Cmp aria-hidden />;
}

export function FieldStep({
  answers,
  update,
  content = fieldStep,
  collectOther = true,
}) {
  return (
    <div>
      <QuestionHeader question={content.question} hint={content.hint} />
      <OptionGroup
        label={content.question}
        className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3"
      >
        {content.options.map((option) => (
          <OptionCard
            key={option.id}
            label={option.label}
            icon={<Icon name={option.icon} />}
            selected={answers.field === option.id}
            onClick={() => update("field", option.id)}
          />
        ))}
      </OptionGroup>

      {collectOther && answers.field === "other" ? (
        <div className="mt-[24px] max-w-[420px]">
          <TextField
            label={content.otherLabel}
            placeholder={content.otherPlaceholder}
            value={answers.fieldOther}
            onValueChange={(v) => update("fieldOther", v)}
            maxLength={60}
          />
        </div>
      ) : null}
    </div>
  );
}
