import { AnimatedNumber } from "@/components/dashboard/mentee/primitives";
import {
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
} from "@/components/dashboard/shared/primitives";
import { formatWeekRange } from "@/lib/weekRange";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

const colorFor = (s) =>
  s === "done"
    ? "var(--teal)"
    : s === "skipped"
      ? "var(--amber)"
      : s === "current"
        ? "var(--accent)"
        : s === "missed"
          ? "var(--coral)"
          : "var(--border)";

export function SummaryBand({ weeks, totalLogged, onLog, disabled }) {
  const [preview, setPreview] = useState(null);

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[0.8fr_1.6fr_0.8fr]">
      <DashboardGlassCard
        data-reveal
        className="glass-hover flex min-h-32 flex-col justify-center py-4"
      >
        <DashboardLabel>Total weeks logged</DashboardLabel>
        <p className="mt-2 font-display text-3xl font-extrabold">
          <AnimatedNumber value={totalLogged} />
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Running total across your journey.
        </p>
      </DashboardGlassCard>

      <DashboardGlassCard data-reveal className="glass-hover min-h-32 py-4">
        <DashboardLabel>Week history</DashboardLabel>
        <div className="mt-3 grid grid-cols-8 gap-1.5">
          {weeks.map((w) => (
            <button
              key={w.week}
              aria-label={`Week ${w.week}, ${w.status}`}
              onMouseEnter={() => setPreview(w)}
              onMouseLeave={() => setPreview(null)}
              onFocus={() => setPreview(w)}
              onBlur={() => setPreview(null)}
              className="h-7 w-full min-w-7 rounded-lg border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{
                background: colorFor(w.status),
                borderColor: colorFor(w.status),
              }}
            />
          ))}
        </div>
        <div className="mt-2 min-h-[38px] text-xs text-muted-foreground">
          {preview ? (
            <p>
              <span className="font-mono text-foreground">W{preview.week}</span>{" "}
              · {formatWeekRange(preview.range.start, preview.range.end)} ·{" "}
              {preview.status} — {preview.note || "No note yet."}
            </p>
          ) : (
            <p>
              Hover a square to preview that week. Colour is paired with the
              status label.
            </p>
          )}
        </div>
      </DashboardGlassCard>

      <DashboardGlassCard
        data-reveal
        className="glass-hover flex min-h-32 flex-col justify-center gap-3 py-4"
      >
        <DashboardLabel>This week</DashboardLabel>
        <DashboardButton
          onClick={onLog}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold disabled:opacity-50"
        >
          <PlusCircle className="h-4 w-4" /> Log this week
        </DashboardButton>
        <p className="text-xs text-muted-foreground">
          {disabled
            ? "Your journey is paused, logging is on hold."
            : "Jumps to the current week card."}
        </p>
      </DashboardGlassCard>
    </div>
  );
}
