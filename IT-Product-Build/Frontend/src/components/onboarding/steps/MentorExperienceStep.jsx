import { mentorExperienceStep } from "@/content/mentorOnboarding";
import { QuestionHeader, TextField } from "../primitives";

export function MentorExperienceStep({ answers, update }) {
  return (
    <div>
      <QuestionHeader
        question={mentorExperienceStep.question}
        hint={mentorExperienceStep.hint}
      />
      <div className="grid max-w-[520px] gap-[20px]">
        <TextField
          label={mentorExperienceStep.jobTitleLabel}
          placeholder={mentorExperienceStep.jobTitlePlaceholder}
          value={answers.jobTitle}
          onValueChange={(v) => update("jobTitle", v)}
          maxLength={mentorExperienceStep.maxTextLength}
        />
        <TextField
          label={mentorExperienceStep.companyLabel}
          placeholder={mentorExperienceStep.companyPlaceholder}
          value={answers.company}
          onValueChange={(v) => update("company", v)}
          maxLength={mentorExperienceStep.maxTextLength}
        />
        <div>
          <TextField
            label={mentorExperienceStep.yearsLabel}
            placeholder={mentorExperienceStep.yearsPlaceholder}
            value={answers.yearsExperience}
            onValueChange={(v) => update("yearsExperience", v)}
            maxLength={2}
            inputMode="numeric"
          />
          <p className="mt-[4px] text-[13px] text-muted-foreground">
            {mentorExperienceStep.yearsHint}
          </p>
        </div>
      </div>
    </div>
  );
}
