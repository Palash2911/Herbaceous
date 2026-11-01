import {
  mentorAvailabilityStep,
  mentorExperienceStep,
  mentorFieldStep,
  mentorReviewStep,
  mentorSpecialismsStep,
  mentorStyleStep,
  mentorWelcome,
} from "@/content/mentorOnboarding";
import { brand } from "@/content/onboarding";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getSpecialisms } from "@/services/metaService";
import { submitMentorOnboarding } from "@/services/mentorService";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildMentorSummary } from "./mentorSummary";
import { GhostButton, MonoLabel, PrimaryButton } from "./primitives";
import { ProgressIndicator } from "./ProgressIndicator";
import { AvailabilityStep } from "./steps/AvailabilityStep";
import { FieldStep } from "./steps/FieldStep";
import { MentorBioStep } from "./steps/MentorBioStep";
import { MentorExperienceStep } from "./steps/MentorExperienceStep";
import { ReviewStep } from "./steps/ReviewStep";
import { SpecialismsStep } from "./steps/SpecialismsStep";
import { StyleStep } from "./steps/StyleStep";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ThemeToggle } from "./ThemeToggle";
import { emptyMentorAnswers } from "./types";

const TOTAL_QUESTION_STEPS = 7;
const REVIEW_INDEX = 7;
const YEARS_PATTERN = /^\d{1,2}$/;

function validate(index, a, specialisms) {
  switch (index) {
    case 1:
      return a.field
        ? { ok: true }
        : { ok: false, hint: "Choose a field to continue" };
    case 2: {
      const { maxTextLength, minYears, maxYears } = mentorExperienceStep;
      const jobTitle = a.jobTitle.trim();
      const company = a.company.trim();
      if (jobTitle.length === 0 || jobTitle.length > maxTextLength)
        return { ok: false, hint: "Enter your job title" };
      if (company.length === 0 || company.length > maxTextLength)
        return { ok: false, hint: "Enter your company or institution" };
      const years = Number(a.yearsExperience);
      if (
        !YEARS_PATTERN.test(a.yearsExperience) ||
        years < minYears ||
        years > maxYears
      )
        return {
          ok: false,
          hint: `Enter your years of experience, ${minYears} to ${maxYears}`,
        };
      return { ok: true };
    }
    case 3:
      if (specialisms.error)
        return { ok: false, hint: mentorSpecialismsStep.loadError };
      if (specialisms.loading)
        return { ok: false, hint: mentorSpecialismsStep.loadingHint };
      return a.specialisms.length >= mentorSpecialismsStep.min
        ? { ok: true }
        : { ok: false, hint: mentorSpecialismsStep.emptyHint };
    case 4:
      return a.style
        ? { ok: true }
        : { ok: false, hint: "Choose a mentoring style" };
    case 5:
      if (!a.cadence)
        return { ok: false, hint: mentorAvailabilityStep.cadenceHint };
      if (a.times.length === 0)
        return { ok: false, hint: mentorAvailabilityStep.timesHint };
      if (typeof a.openAvailability !== "boolean")
        return { ok: false, hint: mentorAvailabilityStep.openAvailabilityHint };
      return { ok: true };
    default:
      return { ok: true };
  }
}

function buildPayload(a) {
  const bio = a.bio.trim();
  return {
    field: a.field,
    jobTitle: a.jobTitle.trim(),
    company: a.company.trim(),
    yearsExperience: Number(a.yearsExperience),
    specialisms: a.specialisms,
    mentoringStyle: a.style,
    availabilityCadence: a.cadence,
    availabilityTimes: a.times,
    openAvailability: a.openAvailability,
    ...(bio ? { bio } : {}),
  };
}

export function MentorQuizFlow() {
  const navigate = useNavigate();
  const reduced = !!useReducedMotion();
  const [answers, setAnswers] = useState(emptyMentorAnswers);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [specialisms, setSpecialisms] = useState({
    list: null,
    loading: true,
    error: false,
  });
  const [specialismsAttempt, setSpecialismsAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getSpecialisms()
      .then((list) => {
        if (!cancelled) setSpecialisms({ list, loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled)
          setSpecialisms({ list: null, loading: false, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [specialismsAttempt]);

  const retrySpecialisms = useCallback(() => {
    setSpecialisms({ list: null, loading: true, error: false });
    setSpecialismsAttempt((attempt) => attempt + 1);
  }, []);

  const update = useCallback((key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const go = useCallback((next, dir) => {
    setDirection(dir);
    setIndex(next);
  }, []);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitMentorOnboarding(buildPayload(answers));
      navigate("/mentor/verification", { replace: true });
    } catch (err) {
      if (err.status === 409) {
        navigate("/dashboard", { replace: true });
        return;
      }
      setSubmitError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const validity = useMemo(
    () => validate(index, answers, specialisms),
    [index, answers, specialisms],
  );
  const showChrome = index > 0;
  const showNav = index > 0 && index < REVIEW_INDEX;

  const offset = reduced ? 0 : 36;

  const stepContent = (() => {
    switch (index) {
      case 0:
        return <WelcomeStep content={mentorWelcome} onStart={() => go(1, 1)} />;
      case 1:
        return (
          <FieldStep
            answers={answers}
            update={update}
            content={mentorFieldStep}
            collectOther={false}
          />
        );
      case 2:
        return <MentorExperienceStep answers={answers} update={update} />;
      case 3:
        return (
          <SpecialismsStep
            answers={answers}
            update={update}
            specialisms={specialisms}
            onRetry={retrySpecialisms}
          />
        );
      case 4:
        return (
          <StyleStep
            answers={answers}
            update={update}
            content={mentorStyleStep}
          />
        );
      case 5:
        return (
          <AvailabilityStep
            answers={answers}
            update={update}
            content={mentorAvailabilityStep}
          />
        );
      case 6:
        return <MentorBioStep answers={answers} update={update} />;
      default:
        return (
          <ReviewStep
            answers={answers}
            summary={buildMentorSummary(answers)}
            content={mentorReviewStep}
            onEdit={(stepIndex) => go(stepIndex, -1)}
            onSubmit={submit}
            inlineSubmit
            submitting={submitting}
            error={submitError}
          />
        );
    }
  })();

  return (
    <main className="flex min-h-screen flex-col items-center px-[16px] py-[32px] sm:px-[24px] sm:py-[48px]">
      <header className="mb-[24px] flex w-full max-w-[720px] items-center justify-between gap-[16px]">
        <div>
          <p className="font-display text-[17px] font-semibold">{brand.name}</p>
          <MonoLabel>{brand.tagline}</MonoLabel>
        </div>
        <ThemeToggle />
      </header>

      <section className="glass-card w-full max-w-[720px] p-[24px] sm:p-[32px]">
        {showChrome ? (
          <ProgressIndicator
            current={Math.min(index, TOTAL_QUESTION_STEPS)}
            total={TOTAL_QUESTION_STEPS}
            reducedMotion={reduced}
          />
        ) : null}

        <div className="overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: direction * offset }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -offset }}
              transition={{
                duration: reduced ? 0 : 0.24,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {stepContent}
            </motion.div>
          </AnimatePresence>
        </div>

        {index === REVIEW_INDEX ? (
          <div className="mt-[32px] border-t pt-[24px]">
            <GhostButton
              onClick={() => go(REVIEW_INDEX - 1, -1)}
              disabled={submitting}
            >
              <ArrowLeft className="size-[17px]" aria-hidden />
              Back
            </GhostButton>
          </div>
        ) : null}

        {showNav ? (
          <div className="mt-[32px] flex flex-col gap-[16px] border-t pt-[24px] sm:flex-row sm:items-center sm:justify-between">
            <GhostButton
              onClick={() => go(index - 1, -1)}
              className="sm:order-1"
            >
              <ArrowLeft className="size-[17px]" aria-hidden />
              Back
            </GhostButton>

            <div className="flex flex-col items-stretch gap-[4px] sm:order-2 sm:items-end">
              <PrimaryButton
                disabled={!validity.ok}
                onClick={() => go(index + 1, 1)}
              >
                Continue
                <ArrowRight className="size-[17px]" aria-hidden />
              </PrimaryButton>
              {!validity.ok && validity.hint ? (
                <p
                  className="text-[13px] text-coral sm:text-right"
                  aria-live="polite"
                >
                  {validity.hint}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
