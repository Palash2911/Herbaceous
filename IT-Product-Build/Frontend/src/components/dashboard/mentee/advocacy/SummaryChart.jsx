import { Check, CheckCheck, Info, Send, TrendingUp, X } from "lucide-react";
import {
  DashboardGlassCard,
  DashboardLabel,
} from "@/components/dashboard/shared/primitives";
import { AnimatedNumber } from "@/components/dashboard/mentee/primitives";

function percentageOf(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function SummaryChart({ counts }) {
  const {
    pending = 0,
    accepted: acceptedOnly = 0,
    done = 0,
    declined = 0,
    withdrawn = 0,
    closed = 0,
  } = counts ?? {};
  const made = pending + acceptedOnly + done + declined + withdrawn + closed;
  const accepted = acceptedOnly + done;
  const completed = done;

  if (made === 0) return null;

  const summaryItems = [
    {
      key: "made",
      label: "Requests made",
      chartLabel: "Made",
      description: "Every request you've sent, including withdrawn",
      value: made,
      percentage: 100,
      Icon: Send,
      tone: "var(--foreground)",
    },
    {
      key: "accepted",
      label: "Accepted",
      chartLabel: "Accepted",
      description: "Accepted by your mentor, including completed",
      value: accepted,
      percentage: percentageOf(accepted, made),
      Icon: Check,
      tone: "var(--teal)",
    },
    {
      key: "completed",
      label: "Completed",
      chartLabel: "Completed",
      description: "Requests marked as done",
      value: completed,
      percentage: percentageOf(completed, made),
      Icon: CheckCheck,
      tone: "var(--accent)",
    },
    {
      key: "declined",
      label: "Declined",
      chartLabel: "Declined",
      description: "Requests your mentor said no to",
      value: declined,
      percentage: percentageOf(declined, made),
      Icon: X,
      tone: "var(--coral)",
    },
  ];

  return (
    <DashboardGlassCard data-reveal className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <DashboardLabel>Advocacy summary</DashboardLabel>
          <h2 className="mt-1 font-display text-xl font-semibold text-foreground">
            Your request progress
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
            See how your advocacy requests are moving from submission to
            completion.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5 text-accent" />
          {made} total {made === 1 ? "request" : "requests"}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryItems.map(({ key, label, value, Icon, tone }) => (
          <div
            key={key}
            className="rounded-2xl border border-[var(--hairline)] p-4"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${tone} 10%, var(--card)), color-mix(in srgb, ${tone} 3%, var(--card)))`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  color: tone,
                  background: `color-mix(in srgb, ${tone} 14%, var(--card))`,
                  border: `1px solid color-mix(in srgb, ${tone} 24%, transparent)`,
                }}
              >
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <p className="font-display text-3xl font-bold text-foreground">
                <AnimatedNumber value={value} />
              </p>
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">{label}</p>
          </div>
        ))}
      </div>

      <section
        className="mt-6 rounded-[20px] border border-[var(--hairline)] bg-[var(--surface-soft)] p-4 sm:p-5"
        aria-labelledby="advocacy-progress-title"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <DashboardLabel>Request journey</DashboardLabel>
            <h3
              id="advocacy-progress-title"
              className="mt-1 text-base font-semibold text-foreground"
            >
              Progress at a glance
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Percentages are based on requests made
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {summaryItems.map((item) => (
            <div
              key={item.key}
              role="img"
              aria-label={`${item.label}: ${item.value}, ${item.percentage}% of requests made`}
              tabIndex={0}
              className="group rounded-2xl border border-transparent bg-[var(--card)] p-3.5 outline-none transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[var(--hairline)] hover:shadow-sm focus-visible:border-accent/45 focus-visible:ring-4 focus-visible:ring-accent/10 motion-reduce:transition-none"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: item.tone }}
                    />
                    <p className="text-sm font-semibold text-foreground">
                      {item.chartLabel}
                    </p>
                  </div>
                  <p className="mt-1 pl-4.5 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.percentage}%
                  </p>
                </div>
              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--hairline)]">
                <div
                  className="h-full rounded-full transition-[width,filter] duration-700 ease-out group-hover:brightness-110 motion-reduce:transition-none"
                  style={{
                    width: `${item.percentage}%`,
                    background: item.tone,
                    boxShadow: `0 0 14px color-mix(in srgb, ${item.tone} 30%, transparent)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Totals update when your mentor responds.
      </p>
    </DashboardGlassCard>
  );
}
