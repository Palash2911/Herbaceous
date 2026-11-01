import { aboutStep } from "@/content/onboarding";
import { MonoLabel, QuestionHeader, TextArea } from "../primitives";

export function AboutStep({ answers, update }) {
  return (
    <div>
      <QuestionHeader
        question={aboutStep.question}
        hint="Skip it if you would rather not, this will not affect your matches."
        badge={<MonoLabel className="text-teal">{aboutStep.optionalLabel}</MonoLabel>}
      />
      <TextArea
        label="About you"
        value={answers.about}
        onValueChange={(v) => update("about", v)}
        placeholder={aboutStep.placeholder}
        maxLength={aboutStep.maxLength}
      />
      <p className="mt-2 text-[13px] text-muted-foreground">
        Please don't include your real name or other identifying details here.
      </p>
    </div>
  );
}
