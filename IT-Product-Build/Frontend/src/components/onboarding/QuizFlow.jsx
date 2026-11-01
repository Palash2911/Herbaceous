import { availabilityStep, brand, goalsStep } from "@/content/onboarding";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GhostButton, MonoLabel, PrimaryButton } from "./primitives";
import { ProgressIndicator } from "./ProgressIndicator";
import { AboutStep } from "./steps/AboutStep";
import { AvailabilityStep } from "./steps/AvailabilityStep";
import { FieldStep } from "./steps/FieldStep";
import { GoalsStep } from "./steps/GoalsStep";
import { ReviewStep } from "./steps/ReviewStep";
import { StageStep } from "./steps/StageStep";
import { StyleStep } from "./steps/StyleStep";
import { SubmittingStep } from "./steps/SubmittingStep";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ThemeToggle } from "./ThemeToggle";
import { emptyAnswers } from "./types";

const TOTAL_QUESTION_STEPS = 7;

function validate(index, a) {
  switch (index) {
    case 1:
      if (!a.field) return { ok: false, hint: "Choose a field to continue" };
      if (a.field === "other" && a.fieldOther.trim().length === 0)
        return { ok: false, hint: "Tell us which field you are in" };
      return { ok: true };
    case 2:
      return a.stage
        ? { ok: true }
        : { ok: false, hint: "Choose where you are right now" };
    case 3:
      return a.goals.length > 0
        ? { ok: true }
        : { ok: false, hint: goalsStep.emptyHint };
    case 4:
      return a.style
        ? { ok: true }
        : { ok: false, hint: "Choose a mentoring style" };
    case 5:
      if (!a.cadence) return { ok: false, hint: availabilityStep.cadenceHint };
      if (a.times.length === 0)
        return { ok: false, hint: availabilityStep.timesHint };
      return { ok: true };
    default:
      return { ok: true };
  }
}

export function QuizFlow() {
  const navigate = useNavigate();
  const reduced = !!useReducedMotion();
  const [answers, setAnswers] = useState(emptyAnswers);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const update = useCallback((key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const go = useCallback((next, dir) => {
    setDirection(dir);
    setIndex(next);
  }, []);

  const validity = useMemo(() => validate(index, answers), [index, answers]);
  const showChrome = index > 0 && index < 8;
  const showNav = index > 0 && index < 7;

  const offset = reduced ? 0 : 36;

  const stepContent = (() => {
    switch (index) {
      case 0:
        return <WelcomeStep onStart={() => go(1, 1)} />;
      case 1:
        return <FieldStep answers={answers} update={update} />;
      case 2:
        return <StageStep answers={answers} update={update} />;
      case 3:
        return <GoalsStep answers={answers} update={update} />;
      case 4:
        return <StyleStep answers={answers} update={update} />;
      case 5:
        return <AvailabilityStep answers={answers} update={update} />;
      case 6:
        return <AboutStep answers={answers} update={update} />;
      case 7:
        return (
          <ReviewStep
            answers={answers}
            onEdit={(stepIndex) => go(stepIndex, -1)}
            onSubmit={() => go(8, 1)}
          />
        );
      default:
        return (
          <SubmittingStep
            answers={answers}
            onDone={() => navigate("/dashboard")}
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

        {index === 7 ? (
          <div className="mt-[32px] border-t pt-[24px]">
            <GhostButton onClick={() => go(6, -1)}>
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
