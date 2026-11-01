import { CalendarClock, Video } from "lucide-react";
import { DashboardLoader } from "@/components/dashboard/shared/DashboardLoader";
import { DashboardGlassCard, DashboardLabel, DashboardButton, EmptyState } from "@/components/dashboard/shared/primitives";

export function NextMeetingCard({ entries, loading }) {
  if (loading) {
    return (
      <DashboardGlassCard data-reveal className="glass-hover min-h-48">
        <DashboardLabel>Next meeting</DashboardLabel>
        <DashboardLoader label="Loading your next meeting..." />
      </DashboardGlassCard>
    );
  }

  const next = (entries ?? [])
    .filter((e) => e.type === "MEETING" && e.status === "SCHEDULED" && !e.derived && e.startsAt)
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))[0];

  if (!next) {
    return (
      <DashboardGlassCard data-reveal className="glass-hover">
        <DashboardLabel>Next meeting</DashboardLabel>
        <div className="mt-3">
          <EmptyState
            icon={<CalendarClock className="h-6 w-6" />}
            title="Nothing scheduled"
            body="When you or your mentor add a meeting link, it will appear here."
          />
        </div>
      </DashboardGlassCard>
    );
  }

  return (
    <DashboardGlassCard data-reveal className="glass-hover">
      <DashboardLabel>Next meeting</DashboardLabel>
      <p className="mt-2 font-display font-semibold">{next.title}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <CalendarClock className="h-4 w-4" />
        {new Date(next.startsAt).toLocaleString()}
      </p>
      {next.meetingLink?.url ? (
        <a href={next.meetingLink.url} target="_blank" rel="noreferrer" className="mt-4 inline-block">
          <DashboardButton className="px-5 py-2.5 font-semibold">
            <Video className="h-4 w-4" /> Join meeting
          </DashboardButton>
        </a>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">No meeting link added yet.</p>
      )}
    </DashboardGlassCard>
  );
}
