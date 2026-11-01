import {
  BellPlus,
  CalendarPlus,
  StickyNote,
  Upload,
} from "lucide-react";
import {
  DashboardGlassCard,
  DashboardLabel,
} from "@/components/dashboard/shared/primitives";

const actions = [
  {
    type: "meeting",
    label: "Schedule meet",
    icon: CalendarPlus,
    color: "var(--accent)",
  },
  {
    type: "reminder",
    label: "Add reminder",
    icon: BellPlus,
    color: "var(--amber)",
  },
  {
    type: "log",
    label: "Upload log",
    icon: Upload,
    color: "var(--teal)",
  },
  {
    type: "note",
    label: "Add note",
    icon: StickyNote,
    color: "var(--coral)",
  },
];

export function QuickActions({ onAction, types }) {
  const visible = types
    ? actions.filter((action) => types.includes(action.type))
    : actions;

  return (
    <DashboardGlassCard data-reveal>
      <DashboardLabel>Quick actions</DashboardLabel>
      <h2 className="mt-1 text-xl font-semibold">
        Add to the shared calendar
      </h2>

      <div
        className={`mt-4 grid grid-cols-1 gap-3 ${
          visible.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        {visible.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.type}
              type="button"
              onClick={() => onAction(action.type)}
              className="group flex items-center gap-3 rounded-full border border-[var(--hairline)] bg-[var(--action-surface)] px-4 py-3 text-left text-sm font-medium text-foreground shadow-sm transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[var(--action-hover-border)] hover:bg-[var(--action-hover)] hover:shadow-md focus-visible:border-[var(--action-hover-border)] focus-visible:bg-[var(--action-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10"
              style={{
                "--action-surface":
                  "color-mix(in srgb, var(--card) 68%, transparent)",
                "--action-hover": `color-mix(in srgb, ${action.color} 10%, var(--card))`,
                "--action-hover-border": `color-mix(in srgb, ${action.color} 38%, var(--hairline))`,
              }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105"
                style={{
                  color: action.color,
                  background: `color-mix(in srgb, ${action.color} 14%, var(--card))`,
                }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </DashboardGlassCard>
  );
}
