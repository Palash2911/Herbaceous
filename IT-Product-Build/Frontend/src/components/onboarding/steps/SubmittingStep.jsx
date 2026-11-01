import { submittingStep } from "@/content/onboarding";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getCurrentSession } from "@/services/cognitoAuth";
import { listMentors, submitOnboarding } from "@/services/menteeService";
import { motion } from "framer-motion";
import { AlertTriangle, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MonoLabel, PrimaryButton } from "../primitives";

const MIN_DURATION_MS = 2000;

function Orbital({ reduced }) {
  const rings = [
    { size: 180, duration: 7, dot: "var(--primary)" },
    { size: 128, duration: 5, dot: "var(--teal)" },
    { size: 76, duration: 3.5, dot: "var(--coral)" },
  ];

  return (
    <div
      className="relative mx-auto grid size-[200px] place-items-center"
      aria-hidden
    >
      <div className="absolute size-[26px] rounded-full bg-primary shadow-[var(--btn-shadow)]" />
      {rings.map((ring) => (
        <motion.div
          key={ring.size}
          className="absolute rounded-full border"
          style={{
            width: ring.size,
            height: ring.size,
            borderColor: "color-mix(in oklab, var(--primary) 35%, transparent)",
          }}
          animate={{ rotate: reduced ? 0 : 360 }}
          transition={{
            duration: reduced ? 0 : ring.duration,
            repeat: reduced ? 0 : Infinity,
            ease: "linear",
          }}
        >
          <span
            className="absolute top-[-5px] left-1/2 size-[10px] -translate-x-1/2 rounded-full"
            style={{ backgroundColor: ring.dot }}
          />
        </motion.div>
      ))}
    </div>
  );
}

function buildPayload(answers) {
  return {
    field: answers.field,
    careerStage: answers.stage,
    goals: answers.goals,
    mentoringStyle: answers.style,
    availabilityCadence: answers.cadence,
    availabilityTimes: answers.times,
    about: answers.about,
  };
}

export function SubmittingStep({ answers, onDone }) {
  const navigate = useNavigate();
  const reduced = !!useReducedMotion();
  const [statusIndex, setStatusIndex] = useState(0);
  const [phase, setPhase] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const total = submittingStep.statuses.length;
    const tick = setInterval(() => {
      setStatusIndex((i) => Math.min(i + 1, total - 1));
    }, 650);
    return () => clearInterval(tick);
  }, [attempt]);

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    setStatusIndex(0);

    const minDelay = new Promise((resolve) =>
      setTimeout(resolve, MIN_DURATION_MS),
    );

    const submit = async () => {
      const session = await getCurrentSession();
      if (!session) {
        throw new Error("Your session expired. Please log in again.");
      }
      await submitOnboarding(buildPayload(answers));
      listMentors().catch(() => {});
    };

    Promise.all([submit(), minDelay])
      .then(() => {
        if (!cancelled) setPhase("success");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 409) {
          navigate("/dashboard", { replace: true });
          return;
        }
        setErrorMessage(
          err.message || "Something went wrong. Please try again.",
        );
        setPhase("error");
      });

    return () => {
      cancelled = true;
    };
  }, [answers, attempt, navigate]);

  if (phase === "error") {
    return (
      <div className="py-[24px] text-center">
        <div className="mx-auto grid size-[64px] place-items-center rounded-full bg-coral text-primary-foreground shadow-[var(--btn-shadow)]">
          <AlertTriangle className="size-[30px]" aria-hidden />
        </div>
        <h2 className="mt-[24px] text-[24px] font-semibold sm:text-[28px]">
          Something went wrong
        </h2>
        <p className="mx-auto mt-[8px] max-w-[46ch] text-[15px] text-muted-foreground">
          {errorMessage}
        </p>
        <PrimaryButton
          className="mt-[32px]"
          onClick={() => setAttempt((a) => a + 1)}
          autoFocus
        >
          Try again
        </PrimaryButton>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="py-[24px] text-center">
        <div className="mx-auto grid size-[64px] place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--btn-shadow)]">
          <Check className="size-[30px]" aria-hidden />
        </div>
        <h2 className="mt-[24px] text-[24px] font-semibold sm:text-[28px]">
          {submittingStep.successHeadline}
        </h2>
        <p className="mx-auto mt-[8px] max-w-[46ch] text-[15px] text-muted-foreground">
          {submittingStep.successBody}
        </p>
        <PrimaryButton className="mt-[32px]" onClick={onDone} autoFocus>
          {submittingStep.successCta}
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="py-[24px] text-center">
      <Orbital reduced={reduced} />
      <div className="mt-[32px]" aria-live="polite">
        <MonoLabel className="text-primary">
          {submittingStep.statuses[statusIndex]}
        </MonoLabel>
      </div>
    </div>
  );
}
