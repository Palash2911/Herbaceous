import { PauseControl } from "@/components/dashboard/mentee/planner/PauseControl";
import { SummaryBand } from "@/components/dashboard/mentee/planner/SummaryBand";
import { WeekTimeline } from "@/components/dashboard/mentee/planner/WeekTimeline";
import { useReveal } from "@/components/dashboard/mentee/primitives";
import { StandingCard } from "@/components/dashboard/mentee/StandingCard";
import {
  DashboardButton,
  DashboardGlassCard,
  EmptyState,
} from "@/components/dashboard/shared/primitives";
import { useStore } from "@/components/dashboard/shared/store";
import { handleApiError } from "@/lib/handleApiError";
import {
  createPauseRequest,
  createWeeklyLog,
  getWeeklyLogs,
  listPauseRequests,
  updateWeeklyLog,
  withdrawPauseRequest,
} from "@/services/menteeService";
import { Compass, Info } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DashboardPanelLoader } from "@/components/dashboard/shared/DashboardLoader";

function PlannerHeader() {
  return (
    <header data-reveal>
      <p className="label-caps">Weekly planner</p>
      <h1 className="mt-1 font-display text-3xl font-bold">
        Your week by week record
      </h1>
    </header>
  );
}

export function WeeklyPlanner() {
  const {
    mentorship,
    mentorshipLoading,
    refetchMentorship,
    refetchOverview,
    setView,
  } = useStore();

  const [weeks, setWeeks] = useState([]);
  const [weeksLogged, setWeeksLogged] = useState(0);
  const [currentWeekNumber, setCurrentWeekNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pauseRequests, setPauseRequests] = useState([]);
  const [submittingWeek, setSubmittingWeek] = useState(null);

  const ref = useReveal();
  const currentRef = useRef(null);

  const fetchWeeklyLogs = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    try {
      const data = await getWeeklyLogs();
      setWeeksLogged(data.weeksLogged);
      setCurrentWeekNumber(data.weekNumber ?? null);

      setWeeks([...(data.weeks ?? [])].reverse());
    } catch (err) {
      setError(err);
      handleApiError(err, "Couldn't load your weekly logs");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPauseRequests = useCallback(async () => {
    try {
      const data = await listPauseRequests();
      setPauseRequests(data ?? []);
    } catch (err) {
      handleApiError(err, "Couldn't load your pause history");
    }
  }, []);

  useEffect(() => {
    if (!mentorship) return undefined;

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      void fetchWeeklyLogs();
      void fetchPauseRequests();
    });

    return () => {
      cancelled = true;
    };
  }, [mentorship, fetchWeeklyLogs, fetchPauseRequests]);

  const submitWeek = async (week, note, status, logId) => {
    setSubmittingWeek(week);

    try {
      if (logId) {
        await updateWeeklyLog(logId, {
          status,
          note: note || undefined,
        });
      } else {
        await createWeeklyLog(status, note || undefined, week);
      }

      toast.success(`Week ${week} logged as ${status.toLowerCase()}`);

      await Promise.all([fetchWeeklyLogs(), refetchOverview()]);
    } catch (err) {
      handleApiError(err, "Couldn't log that week");
    } finally {
      setSubmittingWeek(null);
    }
  };

  const handleSubmitPause = async (reason, expectedWeeks) => {
    try {
      await createPauseRequest("PAUSE", reason, expectedWeeks);
      toast.success("Pause request sent to your mentor");

      await Promise.all([refetchMentorship(), fetchPauseRequests()]);
    } catch (err) {
      handleApiError(err, "Couldn't send that request");
    }
  };

  const handleSubmitResume = async (reason) => {
    try {
      await createPauseRequest("RESUME", reason);
      toast.success("Resume request sent to your mentor");

      await Promise.all([refetchMentorship(), fetchPauseRequests()]);
    } catch (err) {
      handleApiError(err, "Couldn't send that request");
    }
  };

  const handleWithdrawPause = async (id) => {
    try {
      await withdrawPauseRequest(id);
      toast.success("Pause request withdrawn");

      await Promise.all([refetchMentorship(), fetchPauseRequests()]);
    } catch (err) {
      handleApiError(err, "Couldn't withdraw that request");
    }
  };

  const paused = mentorship?.status === "PAUSED";

  if (mentorshipLoading) {
    return (
      <div ref={ref} className="relative isolate space-y-6 pb-12">
        <PlannerHeader />
        <DashboardPanelLoader label="Loading your weekly planner..." />
      </div>
    );
  }

  if (!mentorship) {
    return (
      <div ref={ref} className="relative isolate space-y-6 pb-12">
        <PlannerHeader />

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
      </div>
    );
  }

  return (
    <div ref={ref} className="relative isolate space-y-6 pb-12">
      <PlannerHeader />

      {error ? (
        <DashboardGlassCard data-reveal className="glass-hover">
          <EmptyState
            icon={<Info className="h-6 w-6" />}
            title="Couldn't load your weeks"
            body="Something went wrong reaching the server."
            action={
              <DashboardButton variant="outline" onClick={fetchWeeklyLogs}>
                Try again
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : loading ? (
        <DashboardPanelLoader label="Loading your weekly planner..." />
      ) : (
        <>
          <SummaryBand
            weeks={weeks}
            totalLogged={weeksLogged}
            disabled={paused}
            onLog={() =>
              currentRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
            }
          />

          <StandingCard />

          {paused ? (
            <DashboardGlassCard
              data-reveal
              className="flex items-start gap-3 border-l-4 border-l-amber p-4"
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              <p className="text-sm text-muted-foreground">
                Your journey is paused. Logging resumes once your mentor
                approves a resume request.
              </p>
            </DashboardGlassCard>
          ) : null}

          <WeekTimeline
            weeks={weeks}
            currentWeekNumber={currentWeekNumber}
            paused={paused}
            submittingWeek={submittingWeek}
            onSubmitWeek={submitWeek}
            currentRef={currentRef}
          />

          <PauseControl
            mentorshipStatus={mentorship.status}
            pendingPauseRequest={mentorship.pendingPauseRequest}
            pauseRequests={pauseRequests}
            onSubmitPause={handleSubmitPause}
            onSubmitResume={handleSubmitResume}
            onWithdraw={handleWithdrawPause}
          />
        </>
      )}
    </div>
  );
}
