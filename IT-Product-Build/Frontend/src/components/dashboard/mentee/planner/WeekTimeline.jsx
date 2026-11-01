import { useRef, useState } from "react";
import {
  Check,
  SkipForward,
  Circle,
  PenLine,
  Video,
  VideoOff,
  Pencil,
  X,
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DashboardLabel,
  DashboardButton,
  inputClass,
} from "@/components/dashboard/shared/primitives";
import { StatusPill, useDrawIn } from "@/components/dashboard/mentee/primitives";
import { formatWeekRange } from "@/lib/weekRange";

const STATUS_META = {
  done: {
    label: "Done",
    tone: "var(--teal)",
    pill: "teal",
    Icon: Check,
  },
  skipped: {
    label: "Skipped",
    tone: "var(--amber)",
    pill: "amber",
    Icon: SkipForward,
  },
  current: {
    label: "Current",
    tone: "var(--accent)",
    pill: "accent",
    Icon: PenLine,
  },
  missed: {
    label: "Missed",
    tone: "var(--coral)",
    pill: "coral",
    Icon: X,
  },
  paused: {
    label: "Paused",
    tone: "var(--muted-foreground)",
    pill: "muted",
    Icon: Pause,
  },
};

const FALLBACK_STATUS = {
  label: "Unknown",
  tone: "var(--muted-foreground)",
  pill: "muted",
  Icon: Circle,
};

function metaForStatus(status) {
  return STATUS_META[status] ?? FALLBACK_STATUS;
}

function PlannerStatusPill({ status }) {
  const { label, pill, Icon } = metaForStatus(status);

  return (
    <StatusPill
      tone={pill}
      icon={<Icon className="h-3.5 w-3.5" aria-hidden="true" />}
    >
      {label}
    </StatusPill>
  );
}

function WeekEditor({
  initialNote,
  initialStatus,
  paused,
  submitting,
  onSubmit,
  onCancel,
  submitLabel = "Submit week",
}) {
  const [note, setNote] = useState(initialNote);
  const [status, setStatus] = useState(initialStatus);

  return (
    <div className="mt-4 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4">
      <DashboardLabel>Weekly reflection</DashboardLabel>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        disabled={paused || submitting}
        placeholder="What happened this week? What did you work on with your mentor?"
        aria-label="Week note"
        maxLength={1000}
        className={cn(
          inputClass,
          "mt-2 min-h-24 resize-y p-3 transition focus:ring-4 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatus("DONE")}
          disabled={paused || submitting}
          aria-pressed={status === "DONE"}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
            status === "DONE"
              ? "border-teal/40 bg-teal/10 text-teal"
              : "border-[var(--hairline)] bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <Check className="h-3.5 w-3.5" />
          Mark done
        </button>

        <button
          type="button"
          onClick={() => setStatus("SKIPPED")}
          disabled={paused || submitting}
          aria-pressed={status === "SKIPPED"}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
            status === "SKIPPED"
              ? "border-amber/40 bg-amber/10 text-amber"
              : "border-[var(--hairline)] bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <SkipForward className="h-3.5 w-3.5" />
          Mark skipped
        </button>

        {onCancel ? (
          <DashboardButton
            variant="outline"
            className="ml-auto"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </DashboardButton>
        ) : null}

        <DashboardButton
          className={cn(
            "px-5 py-2.5 font-semibold disabled:opacity-50",
            !onCancel && "ml-auto",
          )}
          disabled={paused || submitting}
          onClick={() => onSubmit(note.trim(), status)}
        >
          {submitting ? "Saving..." : submitLabel}
        </DashboardButton>
      </div>
    </div>
  );
}

export function WeekTimeline({
  weeks,
  currentWeekNumber,
  paused,
  submittingWeek,
  onSubmitWeek,
  currentRef,
}) {
  const spineRef = useRef(null);
  useDrawIn(spineRef);
  const [editingWeek, setEditingWeek] = useState(null);

  const fallbackCurrentWeek = weeks.find(
    (week) => week.status === "current",
  )?.week;

  const effectiveCurrentWeek =
    currentWeekNumber ?? fallbackCurrentWeek ?? null;

  return (
    <div className={cn("relative", paused && "opacity-60")}>
      <svg
        className="absolute left-4 top-0 h-full w-[2px]"
        preserveAspectRatio="none"
        viewBox="0 0 2 1000"
        aria-hidden="true"
      >
        <path
          ref={spineRef}
          d="M1 0 L1 1000"
          stroke="var(--border)"
          strokeWidth={2}
          fill="none"
        />
      </svg>

      <ol className="space-y-4">
        {weeks.map((week) => {
          const isCurrent =
            week.week === effectiveCurrentWeek;

          const isPrevious =
            effectiveCurrentWeek != null &&
            week.week === effectiveCurrentWeek - 1;

          const canEditExisting =
            week.logId != null && (isCurrent || isPrevious);

          const isEditingThis =
            editingWeek === week.week;

          const showNewEditor =
            isCurrent && week.logId == null;

          const { tone } = metaForStatus(week.status);

          return (
            <li
              key={week.week}
              className="relative flex w-full pl-12"
            >
              <span
                className={cn(
                  "absolute left-[10px] top-8 h-3 w-3 rounded-full border-2",
                )}
                style={{
                  background: tone,
                  borderColor: tone,
                  boxShadow: isCurrent
                    ? `0 0 0 4px color-mix(in srgb, ${tone} 18%, transparent)`
                    : undefined,
                }}
              />

              <div
                data-reveal
                ref={isCurrent ? currentRef : undefined}
                className={cn(
                  "relative w-full rounded-[24px] border border-[var(--hairline)] bg-card p-5 pl-8 shadow-[var(--glass-shadow)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--glass-shadow-hover)] motion-reduce:transition-none",
                  isCurrent && "ring-2 ring-accent/40",
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute bottom-5 left-3 top-5 w-1 rounded-full"
                  style={{ background: tone }}
                />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <DashboardLabel>
                      Week {week.week}
                      {isCurrent ? " · Current week" : ""}
                    </DashboardLabel>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatWeekRange(
                        week.range.start,
                        week.range.end,
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <PlannerStatusPill status={week.status} />

                    {canEditExisting && !isEditingThis ? (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingWeek(week.week)
                        }
                        disabled={paused}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[var(--hairline)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/35 hover:bg-accent/10 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    ) : null}
                  </div>
                </div>

                {isEditingThis ? (
                  <WeekEditor
                    initialNote={week.note ?? ""}
                    initialStatus={
                      week.status === "skipped"
                        ? "SKIPPED"
                        : "DONE"
                    }
                    paused={paused}
                    submitting={
                      submittingWeek === week.week
                    }
                    submitLabel="Save changes"
                    onCancel={() => setEditingWeek(null)}
                    onSubmit={(note, status) => {
                      onSubmitWeek(
                        week.week,
                        note,
                        status,
                        week.logId,
                      );
                      setEditingWeek(null);
                    }}
                  />
                ) : showNewEditor ? (
                  <WeekEditor
                    initialNote=""
                    initialStatus="DONE"
                    paused={paused}
                    submitting={
                      submittingWeek === week.week
                    }
                    onSubmit={(note, status) =>
                      onSubmitWeek(
                        week.week,
                        note,
                        status,
                        week.logId,
                      )
                    }
                  />
                ) : week.status === "missed" ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    You didn't log this week.
                  </p>
                ) : week.status === "paused" ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Your journey was paused this week.
                  </p>
                ) : (
                  <>
                    <p className="mt-3 text-sm text-foreground">
                      {week.note || (
                        <span className="text-muted-foreground">
                          No note for this week.
                        </span>
                      )}
                    </p>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      {week.status === "done" ? (
                        <Video className="h-3.5 w-3.5" />
                      ) : (
                        <VideoOff className="h-3.5 w-3.5" />
                      )}
                      {week.status === "done"
                        ? "Mentor meeting happened this week"
                        : "No mentor meeting recorded"}
                    </p>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {!weeks.length ? (
        <div className="rounded-[24px] border border-[var(--hairline)] bg-card p-6 text-center text-sm text-muted-foreground shadow-[var(--glass-shadow)]">
          Your journey has not started yet. The first week appears
          once your mentorship begins.
        </div>
      ) : null}
    </div>
  );
}
