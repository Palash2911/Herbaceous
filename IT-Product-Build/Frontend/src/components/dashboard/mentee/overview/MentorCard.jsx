import {
  DashboardGlassCard,
  DashboardLabel,
  EmptyState,
} from "@/components/dashboard/shared/primitives";
import { useStore } from "@/components/dashboard/shared/store";
import { ArrowRight, BadgeCheck } from "lucide-react";

export function MentorCard() {
  const { mentorship, setView } = useStore();
  const mentor = mentorship?.mentor;

  if (!mentor) {
    return (
      <DashboardGlassCard data-reveal className="glass-hover">
        <DashboardLabel>Your mentor</DashboardLabel>
        <div className="mt-3">
          <EmptyState
            icon={<BadgeCheck className="h-6 w-6" />}
            title="No mentor yet"
            body="Your mentor's details will show up here once you're matched."
          />
        </div>
      </DashboardGlassCard>
    );
  }

  return (
    <DashboardGlassCard data-reveal className="glass-hover p-0">
      <button
        type="button"
        onClick={() => setView("my-mentor")}
        aria-label={`View ${mentor.name}'s full profile`}
        className="group block w-full cursor-pointer rounded-[inherit] p-6 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15"
      >
        <DashboardLabel>Your mentor</DashboardLabel>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent font-display text-lg font-bold text-white dark:bg-[#5b3be8]">
            {mentor.initials}
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-display font-semibold">
              {mentor.name}
              {mentor.verified ? (
                <BadgeCheck
                  className="h-4 w-4 text-teal"
                  aria-label="Verified mentor"
                />
              ) : null}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {mentor.role ?? "—"} · {mentor.company ?? "—"}
            </p>
          </div>
        </div>
        {mentor.bio?.trim() ? (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {mentor.bio.trim()}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
          View full profile
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </button>
    </DashboardGlassCard>
  );
}
