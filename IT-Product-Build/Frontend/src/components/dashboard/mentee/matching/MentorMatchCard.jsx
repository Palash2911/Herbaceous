import { useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  ChevronDown,
  LoaderCircle,
  Send,
  UserRound,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DashboardGlassCard,
  DashboardLabel,
  DashboardButton,
} from "@/components/dashboard/shared/primitives";
import { RadialRing } from "@/components/dashboard/mentee/primitives";
import { MatchBreakdown } from "@/components/dashboard/mentee/matching/MatchBreakdown";
import { formatAvailability } from "@/components/dashboard/mentee/matching/formatAvailability";
import { TrackRecordStats } from "@/components/dashboard/mentee/matching/TrackRecordStats";
import { getMentor } from "@/services/menteeService";
import { DashboardLoader } from "@/components/dashboard/shared/DashboardLoader";

function OpenAvailabilityChip({ className }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full border border-teal/30 bg-teal/10 px-2 py-0.5 text-[11px] font-medium text-teal",
        className,
      )}
    >
      <Zap className="h-3 w-3" aria-hidden="true" />
      Open availability
    </span>
  );
}

export function MentorMatchCard({
  mentor,
  hasMentorship,
  requestDisabled,
  submitting,
  onRequest,
  onWithdraw,
}) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const showBreakdown = expanded || hovered;
  const isPending = mentor.requestStatus === "PENDING";

  const loadProfile = async () => {
    setProfileLoading(true);
    setProfileError("");

    try {
      const result = await getMentor(mentor.id);
      if (!result) {
        throw new Error("Mentor not found");
      }
      setProfile(result);
    } catch (err) {
      setProfileError(
        err.message || "Could not load this mentor's profile.",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const toggleProfile = () => {
    if (profileOpen) {
      setProfileOpen(false);
      return;
    }

    setProfileOpen(true);
    if (!profile && !profileLoading) {
      loadProfile();
    }
  };

  return (
    <DashboardGlassCard
      data-reveal
      className="glass-hover flex flex-col"
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex flex-1 flex-col"
      >
        <div className="flex items-start gap-4">
          <RadialRing
            value={mentor.score}
            size={72}
            stroke={5}
            bright={hovered}
          >
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-white dark:bg-[#5b3be8]">
              {mentor.initials}
            </div>
          </RadialRing>

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 font-display font-semibold text-foreground">
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

            {mentor.openAvailability ? (
              <OpenAvailabilityChip className="mt-1.5" />
            ) : null}

            <p className="mt-1 font-mono text-xs">
              <span className="text-accent">{mentor.score}</span>
              <span className="text-muted-foreground">
                {" "}
                / 100 match
              </span>
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {mentor.reasoning}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {(mentor.specialisms ?? []).map((specialism) => (
            <span
              key={specialism}
              className="rounded-full border border-[var(--hairline)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs text-foreground"
            >
              {specialism}
            </span>
          ))}
        </div>

        <TrackRecordStats mentor={mentor} className="mt-3" />

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-4 flex cursor-pointer items-center gap-1 self-start text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Score breakdown
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              showBreakdown && "rotate-180",
            )}
          />
        </button>

        <div
          className="overflow-hidden transition-[max-height,opacity] duration-300"
          style={{
            maxHeight: showBreakdown ? 260 : 0,
            opacity: showBreakdown ? 1 : 0,
          }}
        >
          <MatchBreakdown breakdown={mentor.breakdown} className="mt-3" />
        </div>

        <button
          type="button"
          onClick={toggleProfile}
          aria-expanded={profileOpen}
          className="mt-4 flex cursor-pointer items-center gap-1.5 self-start text-sm font-medium text-accent transition-colors hover:brightness-110"
        >
          <UserRound className="h-4 w-4" />
          {profileOpen
            ? "Hide mentor profile"
            : "View mentor profile"}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              profileOpen && "rotate-180",
            )}
          />
        </button>

        {profileOpen ? (
          <section className="mt-3 overflow-hidden rounded-[20px] border border-[var(--hairline)] bg-card shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--hairline)] bg-[var(--surface-soft)] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/10 text-accent">
                  <UserRound className="h-4 w-4" />
                </span>
                <div>
                  <DashboardLabel>Mentor profile</DashboardLabel>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Experience and background
                  </p>
                </div>
              </div>

              {profileLoading ? (
                <LoaderCircle className="h-4 w-4 animate-spin text-accent" />
              ) : null}
            </div>

            <div className="p-4">
              {profileLoading ? (
                <DashboardLoader label="Loading mentor profile..." />
              ) : profileError ? (
                <div role="alert">
                  <p className="text-sm text-coral">
                    {profileError}
                  </p>
                  <DashboardButton
                    variant="outline"
                    className="mt-3"
                    onClick={loadProfile}
                  >
                    Try again
                  </DashboardButton>
                </div>
              ) : profile ? (
                <>
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent font-display text-sm font-bold text-white dark:bg-[#5b3be8]">
                      {profile.initials ?? mentor.initials}
                    </span>

                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        {profile.name ?? mentor.name}
                        {profile.verified ? (
                          <BadgeCheck
                            className="h-4 w-4 text-teal"
                            aria-label="Verified mentor"
                          />
                        ) : null}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {profile.role ?? "Mentor"} ·{" "}
                          {profile.company ??
                            "Organisation not set"}
                        </span>
                      </p>

                      {profile.openAvailability ? (
                        <OpenAvailabilityChip className="mt-1.5" />
                      ) : null}
                    </div>
                  </div>

                  <TrackRecordStats mentor={profile} className="mt-3" />

                  <div className="mt-4 border-t border-[var(--hairline)] pt-4">
                    <DashboardLabel>About</DashboardLabel>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {profile.bio?.trim() ||
                        "This mentor has not added a bio yet."}
                    </p>
                  </div>

                  {(profile.specialisms ?? []).length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {profile.specialisms.map((specialism) => (
                        <span
                          key={specialism}
                          className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs text-accent"
                        >
                          {specialism}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-[var(--hairline)] pt-4">
        <div className="min-w-0">
          <DashboardLabel>
            {formatAvailability(mentor.availability)}
          </DashboardLabel>

          {hasMentorship && !isPending ? (
            <p className="mt-1 text-xs text-muted-foreground">
              You already have an active mentor.
            </p>
          ) : null}
        </div>

        {isPending ? (
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber/30 bg-amber/10 px-3 py-1.5 text-xs font-medium text-amber">
              Requested
            </span>

            <DashboardButton
              variant="outline"
              disabled={submitting}
              onClick={() => onWithdraw(mentor)}
            >
              {submitting ? "Withdrawing..." : "Withdraw"}
            </DashboardButton>
          </div>
        ) : (
          <DashboardButton
            className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold"
            disabled={
              hasMentorship || requestDisabled || submitting
            }
            onClick={() => onRequest(mentor)}
          >
            <Send className="h-4 w-4" />
            {submitting ? "Sending..." : "Request mentor"}
          </DashboardButton>
        )}
      </div>
    </DashboardGlassCard>
  );
}
