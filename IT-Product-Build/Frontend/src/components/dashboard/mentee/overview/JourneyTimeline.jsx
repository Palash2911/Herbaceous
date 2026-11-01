import { useRef, useState } from "react";
import { Check, SkipForward, Circle, Dot, X, Pause } from "lucide-react";
import {
  DashboardGlassCard,
  DashboardLabel,
} from "@/components/dashboard/shared/primitives";
import { useDrawIn } from "@/components/dashboard/mentee/primitives";
import { useStore } from "@/components/dashboard/shared/store";
import { deriveWeekRange, formatWeekRange } from "@/lib/weekRange";

const STATUS_META = {
  done: {
    label: "Done",
    tone: "var(--teal)",
    Icon: Check,
  },
  skipped: {
    label: "Skipped",
    tone: "var(--amber)",
    Icon: SkipForward,
  },
  current: {
    label: "Current",
    tone: "var(--accent)",
    Icon: Dot,
  },
  missed: {
    label: "Missed",
    tone: "var(--coral)",
    Icon: X,
  },
  paused: {
    label: "Paused",
    tone: "var(--muted-foreground)",
    Icon: Pause,
  },
};

const FALLBACK_META = {
  label: "Upcoming",
  tone: "var(--muted-foreground)",
  Icon: Circle,
};

const metaFor = (status) => STATUS_META[status] ?? FALLBACK_META;

export function JourneyTimeline() {
  const pathRef = useRef(null);
  useDrawIn(pathRef);

  const [selectedWeek, setSelectedWeek] = useState(null);
  const [previewWeek, setPreviewWeek] = useState(null);

  const { mentorship, overview } = useStore();

  const weeks = overview?.recentWeeks ?? [];

  const current =
    weeks.find((week) => week.status === "current") ?? weeks[0];

  const pinned =
    weeks.find((week) => week.week === selectedWeek) ?? current;

  const selected =
    weeks.find((week) => week.week === previewWeek) ?? pinned;

  const selectedRange =
    selected && mentorship?.startedAt
      ? deriveWeekRange(mentorship.startedAt, selected.week)
      : null;

  const done = weeks.filter((week) => week.status === "done").length;

  const skipped = weeks.filter(
    (week) => week.status === "skipped",
  ).length;

  const missed = weeks.filter(
    (week) => week.status === "missed",
  ).length;

  const selectedMeta = selected
    ? metaFor(selected.status)
    : null;

  const handleWeekClick = (weekNumber) => {
    setSelectedWeek(weekNumber);
    setPreviewWeek(null);
  };

  return (
    <DashboardGlassCard
      data-reveal
      className="glass-hover relative overflow-hidden"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <DashboardLabel>Journey timeline</DashboardLabel>

          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Every week of your mentorship
          </h2>
        </div>

        <div className="flex flex-wrap justify-end gap-x-3 gap-y-2 text-xs text-muted-foreground">
          {[
            "done",
            "skipped",
            "current",
            "missed",
            "paused",
          ].map((status) => {
            const { label, tone, Icon } = metaFor(status);

            return (
              <span
                key={status}
                className="inline-flex items-center gap-1.5"
              >
                <Icon
                  className="h-3.5 w-3.5"
                  style={{ color: tone }}
                  aria-hidden="true"
                />

                {label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {done} done
          </span>

          {" · "}
          {skipped} skipped
          {" · "}
          {missed} missed
        </p>

        <p className="text-xs text-muted-foreground">
          Click a week to keep it selected.
        </p>
      </div>

      {weeks.length > 0 ? (
        <div className="relative mt-5 pb-2">
          <div className="relative py-3">
            <svg
              className="pointer-events-none absolute inset-x-0 top-3 h-10 w-full"
              preserveAspectRatio="none"
              viewBox="0 0 1000 40"
              aria-hidden="true"
            >
              <path
                ref={pathRef}
                d="M62 19 H938"
                stroke="color-mix(in srgb, var(--foreground) 14%, transparent)"
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <ol className="relative grid grid-cols-8 gap-2 sm:gap-3">
              {weeks.map((week) => {
                const { label, tone, Icon } = metaFor(
                  week.status,
                );

                const isCurrent = week.status === "current";

                const isSelected =
                  selectedWeek === week.week;

                const isPreviewed =
                  previewWeek === week.week && !isSelected;

                const size =
                  isCurrent || isSelected ? 40 : 34;

                let boxShadow;

                if (isSelected) {
                  boxShadow = `0 0 0 3px var(--card), 0 0 0 6px color-mix(in srgb, ${tone} 38%, transparent), 0 8px 22px color-mix(in srgb, ${tone} 24%, transparent)`;
                } else if (isPreviewed) {
                  boxShadow = `0 0 0 4px color-mix(in srgb, ${tone} 18%, transparent), 0 6px 18px color-mix(in srgb, ${tone} 18%, transparent)`;
                } else if (isCurrent) {
                  boxShadow = `0 6px 20px color-mix(in srgb, ${tone} 24%, transparent)`;
                }

                return (
                  <li
                    key={week.week}
                    className="relative flex flex-col items-center"
                    onMouseEnter={() =>
                      setPreviewWeek(week.week)
                    }
                    onMouseLeave={() =>
                      setPreviewWeek(null)
                    }
                    onFocus={() =>
                      setPreviewWeek(week.week)
                    }
                    onBlur={() =>
                      setPreviewWeek(null)
                    }
                  >
                    <button
                      type="button"
                      aria-label={`Week ${week.week}, ${label}. Click to select.`}
                      aria-pressed={isSelected}
                      onClick={() =>
                        handleWeekClick(week.week)
                      }
                      className={`grid cursor-pointer place-items-center rounded-full transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                      style={{
                        width: size,
                        height: size,
                        color: tone,
                        background: `color-mix(in srgb, ${tone} 14%, var(--card))`,
                        border: `2px solid color-mix(in srgb, ${tone} 58%, var(--border))`,
                        boxShadow,
                      }}
                    >
                      <Icon
                        style={{
                          width: size * 0.48,
                          height: size * 0.48,
                        }}
                        aria-hidden="true"
                      />
                    </button>

                    <span
                      className={`mt-2 font-mono text-[10px] transition-colors ${
                        isSelected
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      W{week.week}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-soft)] px-4 py-8 text-center text-sm text-muted-foreground">
          Your weekly journey will appear here once your
          mentorship begins.
        </div>
      )}

      {selected && selectedMeta ? (
        <div
          className="mt-4 rounded-2xl border p-4 transition-colors"
          style={{
            borderColor: `color-mix(in srgb, ${selectedMeta.tone} 28%, var(--border))`,
            background: `linear-gradient(135deg, color-mix(in srgb, ${selectedMeta.tone} 9%, var(--card)), color-mix(in srgb, ${selectedMeta.tone} 3%, var(--card)))`,
          }}
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DashboardLabel>
                {previewWeek != null
                  ? "Week preview"
                  : selectedWeek != null
                    ? "Selected week"
                    : "Current week"}
              </DashboardLabel>

              <p className="mt-1 font-display text-base font-semibold text-foreground">
                Week {selected.week}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
                style={{
                  color: selectedMeta.tone,
                  borderColor: `color-mix(in srgb, ${selectedMeta.tone} 36%, transparent)`,
                  background: `color-mix(in srgb, ${selectedMeta.tone} 12%, transparent)`,
                }}
              >
                <selectedMeta.Icon
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />

                {selectedMeta.label}
              </span>

              {selectedRange ? (
                <span className="font-mono text-xs text-muted-foreground">
                  {formatWeekRange(
                    selectedRange.start,
                    selectedRange.end,
                  )}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </DashboardGlassCard>
  );
}