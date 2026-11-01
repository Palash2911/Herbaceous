import { cn } from "@/lib/utils";

const factors = [
  { key: "field", label: "Field overlap", color: "var(--accent)" },
  { key: "goals", label: "Goal alignment", color: "var(--teal)" },
  { key: "availability", label: "Availability", color: "var(--amber)" },
  { key: "style", label: "Mentoring style", color: "var(--coral)" },
  { key: "experience", label: "Experience level", color: "var(--foreground)" },
];

export function MatchBreakdown({ breakdown, className }) {
  return (
    <ul className={cn("space-y-2.5", className)}>
      {factors.map(({ key, label, color }) => {
        const value = Math.max(0, Math.min(100, breakdown?.[key] ?? 0));
        return (
          <li key={key}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: color }}
                />
                {label}
              </span>
              <span className="font-mono text-foreground">{value}</span>
            </div>
            <div
              className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-soft)]"
              role="img"
              aria-label={`${label}: ${value} out of 100`}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${value}%`,
                  background: color,
                  transition: "width .6s ease",
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
