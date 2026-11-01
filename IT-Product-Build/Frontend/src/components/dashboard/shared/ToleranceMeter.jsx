import { cn } from "@/lib/utils";

export function toneForLevel(level) {
  if (level === 0) return "positive";
  if (level <= 2) return "caution";
  return "negative";
}

const colorFor = (level) =>
  level === 0 ? "var(--teal)" : level <= 2 ? "var(--amber)" : "var(--coral)";

export function ToleranceMeter({ level, className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className="h-2 w-8 rounded-full"
            style={{
              background:
                step <= level ? colorFor(level) : "color-mix(in srgb, var(--muted) 25%, transparent)",
            }}
          />
        ))}
      </div>
      <span className="text-sm font-medium" style={{ color: colorFor(level) }}>
        {level <= 4 ? `${level} of 4` : `${level} recorded`}
      </span>
    </div>
  );
}
