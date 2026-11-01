import { useEffect, useState } from "react";
import { AlertTriangle, Flag } from "lucide-react";
import { DashboardButton, DashboardGlassCard, DashboardLabel } from "@/components/dashboard/shared/primitives";
import { DashboardLoader } from "@/components/dashboard/shared/DashboardLoader";
import { goalsStep } from "@/content/onboarding";
import { getMenteeProfile } from "@/services/menteeService";

export function GoalsProgress() {
  const [goalIds, setGoalIds] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await getMenteeProfile();
        if (cancelled) return;
        setGoalIds(profile?.menteeProfile?.goals ?? []);
        setError("");
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load your goals.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (goalIds === null) {
    if (error) {
      return (
        <DashboardGlassCard data-reveal className="glass-hover">
          <div role="alert" className="flex items-center gap-2 text-coral">
            <AlertTriangle className="h-4 w-4" /> Could not load your goals.
          </div>
          <DashboardButton variant="outline" className="mt-3" onClick={() => { setError(""); setReloadKey((value) => value + 1); }}>
            Try again
          </DashboardButton>
        </DashboardGlassCard>
      );
    }
    return (
      <DashboardGlassCard data-reveal className="glass-hover min-h-40">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-accent" aria-hidden="true" />
          <DashboardLabel>What you're matched on</DashboardLabel>
        </div>
        <DashboardLoader label="Loading your matching goals..." />
      </DashboardGlassCard>
    );
  }

  if (goalIds.length === 0) return null;

  const labels = goalIds
    .map((id) => goalsStep.options.find((o) => o.id === id)?.label)
    .filter(Boolean);

  return (
    <DashboardGlassCard data-reveal className="glass-hover">
      <div className="flex items-center gap-2">
        <Flag className="h-4 w-4 text-accent" />
        <DashboardLabel>What you're matched on</DashboardLabel>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {labels.map((label) => (
          <span key={label} className="rounded-full border border-border px-3 py-1.5 text-sm">
            {label}
          </span>
        ))}
      </div>
    </DashboardGlassCard>
  );
}
