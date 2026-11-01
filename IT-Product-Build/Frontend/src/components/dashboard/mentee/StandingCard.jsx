import { Info, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import {
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
  EmptyState,
} from "@/components/dashboard/shared/primitives";
import { DashboardLoader } from "@/components/dashboard/shared/DashboardLoader";
import { StatusPill } from "@/components/dashboard/mentee/primitives";
import { useStore } from "@/components/dashboard/shared/store";

const categoryLabels = {
  MISSED_COMMITMENTS: "Missed commitments",
  UNRESPONSIVE: "Unresponsive",
  PLAN_NOT_FOLLOWED: "Plan not followed",
  CONDUCT_CONCERN: "Conduct concern",
  OTHER: "Other",
};

function formatEventDate(iso) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StandingCard() {
  const {
    tolerance,
    toleranceLoading,
    toleranceError,
    refetchTolerance,
  } = useStore();

  useEffect(() => {
    void refetchTolerance();
  }, [refetchTolerance]);

  if (toleranceLoading) {
    return (
      <DashboardGlassCard data-reveal className="glass-hover min-h-32 py-4">
        <DashboardLabel>Standing</DashboardLabel>
        <DashboardLoader label="Loading your mentorship standing..." />
      </DashboardGlassCard>
    );
  }

  if (toleranceError || !tolerance) {
    return (
      <DashboardGlassCard data-reveal className="glass-hover py-4">
        <EmptyState
          icon={<Info className="h-6 w-6" />}
          title="Standing is unavailable"
          body="We could not load your record. Please try again."
          action={
            <DashboardButton onClick={refetchTolerance}>
              <RefreshCw className="h-4 w-4" /> Try again
            </DashboardButton>
          }
        />
      </DashboardGlassCard>
    );
  }

  const level = tolerance.level;
  const clear = level === 0;

  return (
    <DashboardGlassCard data-reveal className="glass-hover min-h-32 py-4">
      <div className="flex items-center justify-between gap-2">
        <DashboardLabel>Standing</DashboardLabel>
        <StatusPill
          tone={clear ? "teal" : "muted"}
          icon={
            clear ? (
              <ShieldCheck className="h-3.5 w-3.5" />
            ) : (
              <Info className="h-3.5 w-3.5" />
            )
          }
        >
          {clear ? "No events" : `${level} event${level === 1 ? "" : "s"} recorded`}
        </StatusPill>
      </div>

      {clear ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No tolerance events have been recorded for this mentorship.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-muted-foreground">
            These events were recorded by your mentor. Their reasons are shown below.
          </p>
          <ul className="mt-3 space-y-3">
            {tolerance.events.map((event) => (
              <li
                key={event.id}
                className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-3"
              >
                <p className="label-caps">
                  {categoryLabels[event.category] ?? event.category} ·{" "}
                  {formatEventDate(event.createdAt)}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {event.reason}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </DashboardGlassCard>
  );
}
