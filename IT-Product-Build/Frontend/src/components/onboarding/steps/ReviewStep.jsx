import { Loader2, Pencil, Sparkles } from "lucide-react";
import { reviewStep } from "@/content/onboarding";
import { buildSummary } from "../summary";
import { MonoLabel, PrimaryButton } from "../primitives";

export function ReviewStep({
  answers,
  onEdit,
  onSubmit,
  content = reviewStep,
  summary,
  inlineSubmit = false,
  submitting = false,
  error = null,
}) {
  const entries = summary ?? buildSummary(answers);
  const busy = inlineSubmit && submitting;

  return (
    <div>
      <h2 className="text-[24px] leading-tight font-semibold sm:text-[28px]">
        {content.headline}
      </h2>

      <dl className="mt-[24px] flex flex-col gap-[16px]">
        {entries.map((entry) => (
          <div
            key={entry.question}
            className="rounded-[16px] border bg-[var(--field-bg)]/60 p-[16px]"
          >
            <div className="flex items-start justify-between gap-[16px]">
              <dt>
                <MonoLabel>{entry.question}</MonoLabel>
              </dt>
              <button
                type="button"
                onClick={() => onEdit(entry.stepIndex)}
                disabled={busy}
                className="inline-flex items-center gap-[4px] rounded-full px-[8px] py-[4px] text-[13px] text-primary hover:underline focus-visible:focus-visible-ring"
              >
                <Pencil className="size-[13px]" aria-hidden />
                {content.editLabel}
                <span className="sr-only"> {entry.question}</span>
              </button>
            </div>
            <dd className="mt-[8px] flex flex-wrap gap-[8px] text-[15px]">
              {entry.value.map((v, i) => (
                <span
                  key={`${v}-${i}`}
                  className="rounded-full bg-[var(--accent-tint)] px-[12px] py-[4px]"
                >
                  {v}
                </span>
              ))}
            </dd>
            {entry.note ? (
              <p className="mt-[8px] text-[13px] text-muted-foreground">
                {entry.note}
              </p>
            ) : null}
          </div>
        ))}
      </dl>

      <div className="mt-[32px]">
        <PrimaryButton onClick={onSubmit} disabled={busy}>
          {busy ? (
            <Loader2 className="size-[17px] animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-[17px]" aria-hidden />
          )}
          {busy ? content.submittingLabel : content.cta}
        </PrimaryButton>
        {inlineSubmit && error ? (
          <p role="alert" className="mt-[8px] text-[13px] text-coral">
            {error}
          </p>
        ) : null}
        {content.footnote ? (
          <p className="mt-[8px] text-[13px] text-muted-foreground">
            {content.footnote}
          </p>
        ) : null}
      </div>
    </div>
  );
}
