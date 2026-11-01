import {
  DashboardButton,
  DashboardGlassCard,
} from "@/components/dashboard/shared/primitives";
import { BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DEFAULT_THRESHOLD_YEARS = 2;

export function VerifiedBadge({ thresholdYears }) {
  const years = thresholdYears ?? DEFAULT_THRESHOLD_YEARS;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs font-medium text-teal">
      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
      Verified
      <span className="sr-only">
        Resume shows {years} or more years of experience
      </span>
    </span>
  );
}

export function VerificationPrompt({ status }) {
  const navigate = useNavigate();

  if (!status || !status.enabled) return null;

  if (status.isVerified) {
    return <VerifiedBadge thresholdYears={status.latest?.thresholdYears} />;
  }

  return (
    <DashboardGlassCard className="flex w-full flex-wrap items-center gap-3 p-4 sm:w-auto sm:flex-nowrap">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal/40 bg-teal/10 text-teal">
        <BadgeCheck className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Get verified</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Show mentees your resume backs your experience.
        </p>
      </div>
      <DashboardButton onClick={() => navigate("/mentor/verification")}>
        Verify now
      </DashboardButton>
    </DashboardGlassCard>
  );
}
