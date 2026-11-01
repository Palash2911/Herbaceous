import { mentorSpecialismsStep } from "@/content/mentorOnboarding";
import {
  GhostButton,
  MonoLabel,
  OptionChip,
  OptionGroup,
  QuestionHeader,
} from "../primitives";

const SKELETON_WIDTHS = [96, 128, 112, 144, 104, 120, 136, 100];

export function SpecialismsStep({
  answers,
  update,
  specialisms,
  onRetry,
}) {
  const { min, max } = mentorSpecialismsStep;
  const selected = answers.specialisms;
  const atMax = selected.length >= max;

  const toggle = (label) => {
    if (selected.includes(label)) {
      update(
        "specialisms",
        selected.filter((s) => s !== label),
      );
      return;
    }
    if (atMax) return;
    update("specialisms", [...selected, label]);
  };

  let body;
  if (specialisms.error) {
    body = (
      <div className="flex flex-col items-start gap-[16px]" role="alert">
        <p className="text-[14px] text-coral">
          {mentorSpecialismsStep.loadError}
        </p>
        <GhostButton onClick={onRetry}>
          {mentorSpecialismsStep.retryLabel}
        </GhostButton>
      </div>
    );
  } else if (specialisms.loading) {
    body = (
      <div className="flex flex-wrap gap-[8px]" aria-hidden>
        {SKELETON_WIDTHS.map((width, i) => (
          <span
            key={i}
            style={{ width }}
            className="h-[40px] rounded-full bg-[var(--surface-soft)] motion-safe:animate-pulse"
          />
        ))}
      </div>
    );
  } else {
    body = (
      <OptionGroup
        label={mentorSpecialismsStep.question}
        multi
        className="flex flex-wrap gap-[8px]"
      >
        {specialisms.list.map((label) => {
          const isSelected = selected.includes(label);
          return (
            <OptionChip
              key={label}
              label={label}
              selected={isSelected}
              disabled={atMax && !isSelected}
              className="disabled:cursor-not-allowed"
              onClick={() => toggle(label)}
            />
          );
        })}
      </OptionGroup>
    );
  }

  return (
    <div>
      <QuestionHeader
        question={mentorSpecialismsStep.question}
        hint={`Choose ${min} to ${max}.`}
        badge={
          <MonoLabel className="text-primary">
            {selected.length} of {max} selected
          </MonoLabel>
        }
      />
      {body}
      <p
        className="mt-[16px] min-h-[20px] text-[13px] text-muted-foreground"
        aria-live="polite"
      >
        {atMax
          ? `You have chosen ${max}, the maximum. Remove one to pick another.`
          : ""}
      </p>
    </div>
  );
}
