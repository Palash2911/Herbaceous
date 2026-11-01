import { GoalsProgress } from "@/components/dashboard/mentee/overview/GoalsProgress";
import { JourneyTimeline } from "@/components/dashboard/mentee/overview/JourneyTimeline";
import { MentorCard } from "@/components/dashboard/mentee/overview/MentorCard";
import { NextMeetingCard } from "@/components/dashboard/mentee/overview/NextMeetingCard";
import { StatTiles } from "@/components/dashboard/mentee/overview/StatTiles";
import { useReveal } from "@/components/dashboard/mentee/primitives";
import {
  DashboardButton,
  DashboardGlassCard,
  EmptyState,
} from "@/components/dashboard/shared/primitives";
import { useStore } from "@/components/dashboard/shared/store";
import { handleApiError } from "@/lib/handleApiError";
import { listCalendarEvents } from "@/services/mentorshipsService";
import { AlertTriangle, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardPanelLoader } from "@/components/dashboard/shared/DashboardLoader";

export function MenteeOverview() {
  const ref = useReveal();
  const {
    displayName,
    mentorship,
    mentorshipLoading,
    mentorshipError,
    overviewLoading,
    overviewError,
    refetchMentorship,
    refetchOverview,
    setView,
  } = useStore();

  const [nextMeetingEntries, setNextMeetingEntries] = useState([]);
  const [nextMeetingLoading, setNextMeetingLoading] = useState(true);

  useEffect(() => {
    refetchMentorship();
    refetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mentorship?.id) return;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setNextMeetingLoading(true);

      const from = new Date();
      const to = new Date(from.getTime() + 180 * 24 * 60 * 60 * 1000);
      listCalendarEvents(mentorship.id, {
        from: from.toISOString(),
        to: to.toISOString(),
        includeCancelled: false,
      })
        .then((data) => {
          if (cancelled) return;
          setNextMeetingEntries(
            (data ?? []).filter(
              (entry) =>
                entry.startsAt &&
                new Date(entry.startsAt).getTime() > from.getTime(),
            ),
          );
        })
        .catch((err) => {
          if (cancelled) return;
          setNextMeetingEntries([]);
          handleApiError(err, "Could not load your next meeting");
        })
        .finally(() => {
          if (!cancelled) setNextMeetingLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [mentorship?.id]);

  const heading = displayName
    ? `Welcome back, ${displayName}`
    : "Your mentorship at a glance";

  return (
    <div ref={ref} className="relative isolate space-y-6 pb-12">
      <header data-reveal>
        <p className="label-caps">Overview</p>
        <h1 className="mt-1 font-display text-3xl font-bold">{heading}</h1>
      </header>

      {mentorshipLoading ? (
        <DashboardPanelLoader label="Loading your mentorship overview..." />
      ) : mentorshipError ? (
        <DashboardGlassCard data-reveal className="glass-hover">
          <EmptyState
            icon={<AlertTriangle className="h-6 w-6" />}
            title="Could not load your mentorship"
            body={mentorshipError.message || "Please try again."}
            action={
              <DashboardButton onClick={refetchMentorship}>
                Try again
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : mentorship === null ? (
        <DashboardGlassCard data-reveal className="glass-hover">
          <EmptyState
            icon={<Compass className="h-6 w-6" />}
            title="No mentor yet."
            body="Head to Matching to find someone whose experience lines up with your goals."
            action={
              <DashboardButton onClick={() => setView("matching")}>
                Go to Matching
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : overviewError && !overviewLoading ? (
        <DashboardGlassCard data-reveal className="glass-hover">
          <EmptyState
            icon={<AlertTriangle className="h-6 w-6" />}
            title="Could not load your overview"
            body={overviewError.message || "Please try again."}
            action={
              <DashboardButton onClick={refetchOverview}>
                Try again
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : (
        <>
          <StatTiles />

          <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="grid gap-6">
              <JourneyTimeline />
              <GoalsProgress />
            </div>
            <div className="grid content-start gap-6">
              <MentorCard />
              <NextMeetingCard
                entries={nextMeetingEntries}
                loading={nextMeetingLoading}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
