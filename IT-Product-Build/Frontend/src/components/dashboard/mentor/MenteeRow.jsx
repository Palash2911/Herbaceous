import {
  DashboardAvatar,
  StatusPill,
} from "@/components/dashboard/shared/primitives";
import { toneForLevel } from "@/components/dashboard/shared/ToleranceMeter";
import { cn } from "@/lib/utils";
import { fieldLabel, formatDate, initialsOf, mentorshipStatus } from "./mentorDisplay";

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function MenteeRow({ mentorship, onOpen }) {
  const {
    mentee,
    status,
    weeksLogged,
    toleranceLevel,
    pendingPauseCount,
    pendingAdvocacyCount,
    endedAt,
  } = mentorship;
  const meta = mentorshipStatus(status);
  const Wrapper = onOpen ? "button" : "div";

  return (
    <Wrapper
      type={onOpen ? "button" : undefined}
      onClick={onOpen}
      className={cn(
        "flex w-full flex-wrap items-center gap-3 rounded-[16px] border border-[var(--hairline)] px-4 py-3 text-left",
        onOpen && "cursor-pointer hover:bg-[var(--surface-soft)]",
      )}
    >
      <DashboardAvatar initials={initialsOf(mentee.displayName)} size={40} />
      <div className="min-w-[140px] flex-1">
        <p className="text-sm font-medium">{mentee.displayName}</p>
        <p className="text-xs text-muted-foreground">
          {fieldLabel(mentee.field)}
        </p>
      </div>
      {pendingPauseCount > 0 ? (
        <StatusPill tone="caution">
          {plural(pendingPauseCount, "pause request")}
        </StatusPill>
      ) : null}
      {pendingAdvocacyCount > 0 ? (
        <StatusPill tone="caution">
          {plural(pendingAdvocacyCount, "advocacy request")}
        </StatusPill>
      ) : null}
      <StatusPill tone="neutral">{plural(weeksLogged, "week")}</StatusPill>
      <StatusPill tone={toneForLevel(toleranceLevel)}>
        Tolerance {toleranceLevel}
      </StatusPill>
      <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
      {status === "ENDED" && endedAt ? (
        <span className="text-xs text-muted-foreground">
          Ended {formatDate(endedAt)}
        </span>
      ) : null}
    </Wrapper>
  );
}
