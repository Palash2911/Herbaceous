import { useEffect } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  Compass,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { MatchBreakdown } from "@/components/dashboard/mentee/matching/MatchBreakdown";
import { formatAvailability } from "@/components/dashboard/mentee/matching/formatAvailability";
import { TrackRecordStats } from "@/components/dashboard/mentee/matching/TrackRecordStats";
import {
  RadialRing,
  StatusPill,
  useReveal,
} from "@/components/dashboard/mentee/primitives";
import { fieldLabel } from "@/components/dashboard/mentor/mentorDisplay";
import { DashboardPanelLoader } from "@/components/dashboard/shared/DashboardLoader";
import {
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
  EmptyState,
} from "@/components/dashboard/shared/primitives";
import { useStore } from "@/components/dashboard/shared/store";
import { styleStep } from "@/content/onboarding";

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatExperience(years) {
  if (years == null) return "Not set";
  return `${years} ${years === 1 ? "year" : "years"}`;
}

function InfoTile({ icon, label, value, detail }) {
  return (
    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <DashboardLabel>{label}</DashboardLabel>
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}

export function MyMentor() {
  const {
    mentorship,
    mentorshipLoading,
    mentorshipError,
    refetchMentorship,
    setView,
  } = useStore();
  const ref = useReveal([Boolean(mentorship)]);

  useEffect(() => {
    refetchMentorship();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mentorshipLoading && !mentorshipError && mentorship === null) {
      setView("overview");
    }
  }, [mentorship, mentorshipLoading, mentorshipError, setView]);

  const mentor = mentorship?.mentor;
  const style = styleStep.options.find(
    (option) => option.id === mentor?.mentoringStyle,
  );
  const startedOn = formatDate(mentorship?.startedAt);
  const paused = mentorship?.status === "PAUSED";

  return (
    <div ref={ref} className="relative isolate space-y-6 pb-12">
      <header data-reveal>
        <button
          type="button"
          onClick={() => setView("overview")}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to overview
        </button>
        <p className="label-caps mt-4">My mentor</p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          {mentor ? mentor.name : "Your mentor"}
        </h1>
      </header>

      {mentorshipLoading && !mentor ? (
        <DashboardPanelLoader label="Loading your mentor..." />
      ) : mentorshipError && !mentor ? (
        <DashboardGlassCard data-reveal>
          <EmptyState
            icon={<AlertTriangle className="h-6 w-6" />}
            title="Could not load your mentor"
            body={mentorshipError.message || "Please try again."}
            action={
              <DashboardButton onClick={refetchMentorship}>
                Try again
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : mentor ? (
        <>
          <DashboardGlassCard data-reveal>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent font-display text-xl font-bold text-white dark:bg-[#5b3be8]">
                  {mentor.initials}
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-display text-lg font-semibold">
                    {mentor.name}
                    {mentor.verified ? (
                      <BadgeCheck
                        className="h-4.5 w-4.5 text-teal"
                        aria-label="Verified mentor"
                      />
                    ) : null}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <BriefcaseBusiness
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      {mentor.role ?? "Mentor"}
                      {mentor.company ? ` at ${mentor.company}` : ""}
                    </span>
                  </p>
                  {startedOn ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Mentoring you since {startedOn}
                      {mentorship.weekNumber
                        ? ` · Week ${mentorship.weekNumber}`
                        : ""}
                    </p>
                  ) : null}
                  <TrackRecordStats mentor={mentor} className="mt-3" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill tone={paused ? "amber" : "teal"}>
                  {paused ? "Paused" : "Active"}
                </StatusPill>
                <DashboardButton
                  className="inline-flex items-center gap-2"
                  onClick={() => setView("chat")}
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  Open chat
                </DashboardButton>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--hairline)] pt-5">
              <DashboardLabel>About</DashboardLabel>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {mentor.bio?.trim() || "Your mentor has not added a bio yet."}
              </p>
            </div>
          </DashboardGlassCard>

          <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
            <DashboardGlassCard data-reveal>
              <DashboardLabel>Background</DashboardLabel>
              <h2 className="mt-1 text-xl font-semibold">
                What they bring and how they mentor
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoTile
                  icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />}
                  label="Experience"
                  value={formatExperience(mentor.seniority)}
                />
                <InfoTile
                  icon={<Compass className="h-4 w-4" aria-hidden="true" />}
                  label="Field"
                  value={fieldLabel(mentor.field) || "Not set"}
                />
                <InfoTile
                  icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
                  label="Mentoring style"
                  value={style?.label ?? "Not set"}
                  detail={style?.detail}
                />
                <InfoTile
                  icon={<CalendarClock className="h-4 w-4" aria-hidden="true" />}
                  label="Availability"
                  value={formatAvailability(mentor.availability)}
                />
              </div>

              <div className="mt-6">
                <DashboardLabel>Specialisms</DashboardLabel>
                {(mentor.specialisms ?? []).length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mentor.specialisms.map((specialism) => (
                      <span
                        key={specialism}
                        className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs text-accent"
                      >
                        {specialism}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No specialisms listed yet.
                  </p>
                )}
              </div>
            </DashboardGlassCard>

            <DashboardGlassCard data-reveal>
              <DashboardLabel>Why you were matched</DashboardLabel>
              <div className="mt-4 flex items-center gap-4">
                <RadialRing value={mentorship.matchScore ?? 0} size={84} stroke={7}>
                  <span className="font-display text-lg font-bold">
                    {mentorship.matchScore ?? "—"}
                  </span>
                </RadialRing>
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">
                    Match score out of 100
                  </p>
                  {mentor.reasoning ? (
                    <p className="mt-1 text-sm text-foreground">
                      {mentor.reasoning}
                    </p>
                  ) : null}
                </div>
              </div>
              <MatchBreakdown breakdown={mentor.breakdown} className="mt-6" />
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Each factor is scored out of 100. The overall score weighs
                them together.
              </p>
            </DashboardGlassCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
