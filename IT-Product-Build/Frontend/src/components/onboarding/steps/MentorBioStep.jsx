import { mentorBioStep } from "@/content/mentorOnboarding";
import { MonoLabel, QuestionHeader, TextArea } from "../primitives";

export function MentorBioStep({ answers, update }) {
  return (
    <div>
      <QuestionHeader
        question={mentorBioStep.question}
        hint={mentorBioStep.hint}
        badge={
          <MonoLabel className="text-teal">
            {mentorBioStep.optionalLabel}
          </MonoLabel>
        }
      />
      <TextArea
        label={mentorBioStep.label}
        value={answers.bio}
        onValueChange={(v) => update("bio", v)}
        placeholder={mentorBioStep.placeholder}
        maxLength={mentorBioStep.maxLength}
      />
      <p className="mt-2 text-[13px] text-muted-foreground">
        {mentorBioStep.privacyNote}
      </p>
    </div>
  );
}
