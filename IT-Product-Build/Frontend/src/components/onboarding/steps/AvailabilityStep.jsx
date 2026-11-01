import { Info } from "lucide-react";
import { availabilityStep } from "@/content/onboarding";
import { MonoLabel, OptionChip, OptionGroup, QuestionHeader } from "../primitives";

export function AvailabilityStep({ answers, update, content = availabilityStep }) {
  const toggleTime = (id) => {
    update(
      "times",
      answers.times.includes(id)
        ? answers.times.filter((t) => t !== id)
        : [...answers.times, id],
    );
  };

  return (
    <div>
      <QuestionHeader question={content.question} />

      <MonoLabel>{content.cadenceLabel}</MonoLabel>
      <OptionGroup
        label={content.cadenceLabel}
        className="mt-[8px] flex flex-wrap gap-[8px]"
      >
        {content.cadenceOptions.map((option) => (
          <OptionChip
            key={option.id}
            label={option.label}
            selected={answers.cadence === option.id}
            onClick={() => update("cadence", option.id)}
          />
        ))}
      </OptionGroup>

      <div className="mt-[24px]">
        <MonoLabel>{content.timesLabel}</MonoLabel>
        <OptionGroup
          label={content.timesLabel}
          multi
          className="mt-[8px] flex flex-wrap gap-[8px]"
        >
          {content.timeOptions.map((option) => (
            <OptionChip
              key={option.id}
              label={option.label}
              selected={answers.times.includes(option.id)}
              onClick={() => toggleTime(option.id)}
            />
          ))}
        </OptionGroup>
      </div>

      {content.openAvailabilityOptions ? (
        <div className="mt-[24px]">
          <MonoLabel>{content.openAvailabilityLabel}</MonoLabel>
          <OptionGroup
            label={content.openAvailabilityLabel}
            className="mt-[8px] flex flex-wrap gap-[8px]"
          >
            {content.openAvailabilityOptions.map((option) => (
              <OptionChip
                key={option.id}
                label={option.label}
                selected={answers.openAvailability === option.value}
                onClick={() => update("openAvailability", option.value)}
              />
            ))}
          </OptionGroup>
        </div>
      ) : null}

      <p className="mt-[24px] flex gap-[8px] text-[13px] leading-relaxed text-muted-foreground">
        <Info className="mt-[2px] size-[15px] shrink-0 text-teal" aria-hidden />
        {content.note}
      </p>
    </div>
  );
}
