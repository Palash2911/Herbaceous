import { DashboardLoader } from "@/components/dashboard/shared/DashboardLoader";
import { GhostButton } from "@/components/onboarding/primitives";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GlassCard } from "@/components/ui/GlassCard";
import { useVerifierWarmup } from "@/hooks/useVerifierWarmup";
import { fadeUp, stagger } from "@/lib/motion";
import {
  getVerificationStatus,
  submitVerification,
} from "@/services/mentorService";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  Clock,
  FileText,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ACCEPTED = ".pdf,.png,.jpg,.jpeg";
const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
const MAX_RESUME_BYTES = 10 * 1024 * 1024;

const CONSENT_TEXT =
  "I agree to my resume being processed by Google's Gemini service to read my employment dates. The file is not stored. Only the result is kept.";
const UNAVAILABLE_MESSAGE =
  "Verification is unavailable right now. You can skip and try later.";
const UNREADABLE_MESSAGE =
  "We couldn't read employment dates from this document. Try a clearer PDF.";
const TOO_LARGE_MESSAGE = "That file is over 10 MB.";
const WRONG_TYPE_MESSAGE = "Choose a PDF, PNG or JPG file.";
const WARMUP_MESSAGE = "Getting the verifier ready...";
const WARMUP_SLOW_MESSAGE = "This can take up to a minute the first time.";
const WARMUP_FAILED_MESSAGE =
  "The verifier is taking too long to start. Try again in a minute.";
const RATE_LIMIT_MESSAGE =
  "You've reached the limit of 3 attempts an hour. Try again later.";

const primaryButtonClass =
  "btn-primary inline-flex h-12 items-center justify-center gap-2 px-8 text-sm font-medium disabled:opacity-60";

function resumeFileIssue(file) {
  const name = file.name.toLowerCase();
  const typeOk = file.type
    ? ACCEPTED_TYPES.includes(file.type)
    : ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension));
  if (!typeOk) return WRONG_TYPE_MESSAGE;
  if (file.size > MAX_RESUME_BYTES) return TOO_LARGE_MESSAGE;
  return null;
}

function submitErrorMessage(error) {
  switch (error?.status) {
    case 400:
      return error.message;
    case 413:
      return TOO_LARGE_MESSAGE;
    case 429:
      return RATE_LIMIT_MESSAGE;
    default:
      return UNAVAILABLE_MESSAGE;
  }
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toRejection(source) {
  return {
    totalExperienceYears: source.totalExperienceYears,
    thresholdYears: source.thresholdYears,
    reasons: Array.isArray(source.reasons) ? source.reasons : [],
  };
}

function CenteredCard({ icon: Icon, iconClassName, title, children }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <GlassCard className="flex w-full flex-col items-center gap-4 p-10">
        {Icon ? (
          <Icon className={iconClassName} size={36} aria-hidden />
        ) : null}
        {title ? (
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
        ) : null}
        {children}
      </GlassCard>
    </div>
  );
}

function ReasonList({ reasons }) {
  if (!reasons.length) return null;
  return (
    <ul className="list-disc space-y-1 pl-5 text-left text-sm text-muted-foreground">
      {reasons.map((reason) => (
        <li key={reason}>{reason}</li>
      ))}
    </ul>
  );
}

function rejectionSummary(rejection) {
  return `Not verified: ${rejection.totalExperienceYears} of ${rejection.thresholdYears} years found`;
}

export function MentorVerificationFlow() {
  const navigate = useNavigate();
  const warmup = useVerifierWarmup();
  const [statusState, setStatusState] = useState({
    loading: true,
    data: null,
    error: false,
  });
  const [statusAttempt, setStatusAttempt] = useState(0);
  const [phase, setPhase] = useState("form");
  const [resume, setResume] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [consent, setConsent] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [approvedYears, setApprovedYears] = useState(null);
  const [rejection, setRejection] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getVerificationStatus()
      .then((data) => {
        if (cancelled) return;
        setStatusState({ loading: false, data, error: false });
        if (data?.latest?.status === "REJECTED") {
          setRejection(toRejection(data.latest));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatusState({ loading: false, data: null, error: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [statusAttempt]);

  const goToDashboard = () => navigate("/dashboard");

  const resetForm = () => {
    setResume(null);
    setFileError(null);
    setConsent(false);
    setSubmitError(null);
    setPhase("form");
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    setSubmitError(null);
    if (!file) return;
    const issue = resumeFileIssue(file);
    setFileError(issue);
    setResume(issue ? null : file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!resume || !consent || phase === "submitting") return;

    setPhase("submitting");
    setSubmitError(null);
    try {
      const created = await submitVerification(resume);
      if (created?.status === "APPROVED") {
        setApprovedYears(created.eligibility?.totalExperienceYears ?? null);
        setPhase("approved");
      } else {
        setRejection(toRejection(created?.eligibility ?? {}));
        setPhase("rejected");
      }
    } catch (error) {
      if (error?.status === 409) {
        setPhase("form");
        setStatusState({ loading: true, data: null, error: false });
        setStatusAttempt((attempt) => attempt + 1);
        return;
      }
      if (error?.status === 422) {
        setPhase("unreadable");
        return;
      }
      setSubmitError(submitErrorMessage(error));
      setPhase("form");
    }
  };

  const skipButton = (disabled = false) => (
    <GhostButton onClick={goToDashboard} disabled={disabled}>
      Skip for now
    </GhostButton>
  );

  if (warmup.state === "warming") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <GlassCard className="flex w-full flex-col items-center gap-4 p-10">
          <DashboardLoader label={WARMUP_MESSAGE} />
          {warmup.slow ? (
            <p className="text-sm text-muted">{WARMUP_SLOW_MESSAGE}</p>
          ) : null}
          {skipButton()}
        </GlassCard>
      </div>
    );
  }

  if (warmup.state === "failed") {
    return (
      <CenteredCard
        icon={AlertCircle}
        iconClassName="text-coral"
        title="Verifier not ready"
      >
        <p className="text-sm text-muted">{WARMUP_FAILED_MESSAGE}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={warmup.retry}
            className={primaryButtonClass}
          >
            Retry
          </button>
          {skipButton()}
        </div>
      </CenteredCard>
    );
  }

  if (statusState.loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6">
        <GlassCard className="w-full p-10">
          <DashboardLoader label="Loading verification..." />
        </GlassCard>
      </div>
    );
  }

  if (statusState.error) {
    return (
      <CenteredCard
        icon={AlertCircle}
        iconClassName="text-coral"
        title="Verification unavailable"
      >
        <p className="text-sm text-muted">{UNAVAILABLE_MESSAGE}</p>
        {skipButton()}
      </CenteredCard>
    );
  }

  const status = statusState.data;

  if (!status?.enabled) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <GlassCard className="flex w-full flex-col items-center gap-4 p-10">
          <Clock className="text-accent" size={36} aria-hidden />
          <h1 className="font-display text-2xl font-semibold">
            Verification coming soon
          </h1>
          <p className="text-sm text-muted">
            We're not collecting verification documents yet. Continue into your
            dashboard for now, we'll follow up once this is ready.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn-primary inline-flex h-12 items-center justify-center gap-2 px-8 text-sm font-medium"
          >
            Continue to dashboard
          </button>
        </GlassCard>
      </div>
    );
  }

  if (status.isVerified) {
    const verifiedOn = formatDate(status.verifiedAt);
    const years = status.latest?.totalExperienceYears;
    return (
      <CenteredCard icon={BadgeCheck} iconClassName="text-teal" title="Verified">
        {verifiedOn ? (
          <p className="text-sm text-muted">Verified on {verifiedOn}</p>
        ) : null}
        {years != null ? (
          <p className="text-sm text-muted">
            {years} years of experience found on your resume
          </p>
        ) : null}
        <button
          type="button"
          onClick={goToDashboard}
          className={primaryButtonClass}
        >
          Go to dashboard
        </button>
      </CenteredCard>
    );
  }

  if (phase === "approved") {
    return (
      <CenteredCard icon={BadgeCheck} iconClassName="text-teal" title="Verified">
        {approvedYears != null ? (
          <p className="text-sm text-muted">{approvedYears} years found</p>
        ) : null}
        <button
          type="button"
          onClick={goToDashboard}
          className={primaryButtonClass}
        >
          Go to dashboard
        </button>
      </CenteredCard>
    );
  }

  if (phase === "rejected" && rejection) {
    return (
      <CenteredCard icon={XCircle} iconClassName="text-coral">
        <h1 className="font-display text-2xl font-semibold">
          {rejectionSummary(rejection)}
        </h1>
        <ReasonList reasons={rejection.reasons} />
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={resetForm}
            className={primaryButtonClass}
          >
            Try again
          </button>
          {skipButton()}
        </div>
      </CenteredCard>
    );
  }

  if (phase === "unreadable") {
    return (
      <CenteredCard
        icon={AlertCircle}
        iconClassName="text-coral"
        title="Couldn't read your resume"
      >
        <p className="text-sm text-muted">{UNREADABLE_MESSAGE}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={resetForm}
            className={primaryButtonClass}
          >
            Try again
          </button>
          {skipButton()}
        </div>
      </CenteredCard>
    );
  }

  const submitting = phase === "submitting";
  const canSubmit = Boolean(resume) && consent && !submitting;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6">
      <GlassCard className="flex flex-col gap-8 p-8 sm:p-10">
        <div>
          <Eyebrow>Mentor verification</Eyebrow>
          <h1 className="mt-4 font-display text-3xl leading-tight font-semibold">
            Verify your experience
          </h1>
          <p className="mt-2 text-sm text-muted">
            Upload your resume and we'll check it shows at least{" "}
            {status.latest?.thresholdYears ?? 2} years of experience. This step is
            optional.
          </p>
        </div>

        {rejection ? (
          <div className="flex flex-col gap-2 rounded-[16px] border border-coral/20 bg-coral/10 p-4 text-sm">
            <p className="font-medium">{rejectionSummary(rejection)}</p>
            <ReasonList reasons={rejection.reasons} />
          </div>
        ) : null}

        <motion.form
          onSubmit={onSubmit}
          variants={stagger(0.04, 0.07)}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          <motion.div variants={fadeUp}>
            <label
              htmlFor="resume"
              className="flex cursor-pointer flex-col items-start gap-2 rounded-[16px] border border-dashed border-[color:var(--field-border)] p-5 text-left transition-colors hover:border-accent"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {resume ? (
                  <FileText size={16} className="text-accent" />
                ) : (
                  <UploadCloud size={16} className="text-muted" />
                )}
                Resume
              </span>
              <span className="text-[13px] text-muted-foreground">
                {resume ? resume.name : "PDF, PNG or JPG, up to 10 MB"}
              </span>
              <input
                id="resume"
                type="file"
                accept={ACCEPTED}
                className="sr-only"
                disabled={submitting}
                onChange={onFileChange}
              />
            </label>
            {fileError ? (
              <p role="alert" className="mt-2 text-sm text-red-500">
                {fileError}
              </p>
            ) : null}
          </motion.div>

          <motion.label
            variants={fadeUp}
            className="flex cursor-pointer items-start gap-3 text-left text-sm"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
              checked={consent}
              disabled={submitting}
              onChange={(event) => {
                setConsent(event.target.checked);
                setSubmitError(null);
              }}
            />
            <span className="text-muted-foreground">{CONSENT_TEXT}</span>
          </motion.label>

          {submitError ? (
            <motion.p
              variants={fadeUp}
              role="alert"
              className="text-sm text-red-500"
            >
              {submitError}
            </motion.p>
          ) : null}

          {submitting ? (
            <p role="status" className="text-sm text-muted-foreground">
              Checking your resume. This can take up to a minute.
            </p>
          ) : null}

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-3"
          >
            <button
              type="submit"
              disabled={!canSubmit}
              className={`${primaryButtonClass} min-w-44`}
            >
              {submitting ? "Checking…" : "Verify my resume"}
            </button>
            {skipButton(submitting)}
          </motion.div>
        </motion.form>
      </GlassCard>
    </div>
  );
}
