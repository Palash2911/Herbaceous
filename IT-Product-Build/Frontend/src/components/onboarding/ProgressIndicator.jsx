import { cn } from "@/lib/utils";
import { MonoLabel } from "./primitives";

export function ProgressIndicator({ current, total, reducedMotion }) {
  return (
    <div className="mb-[24px] flex items-center gap-[16px]">
      <div
        className="flex flex-1 items-center gap-[4px]"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={`Step ${current} of ${total}`}
      >
        {Array.from({ length: total }, (_, i) => {
          const index = i + 1;
          const filled = index < current;
          const active = index === current;
          return (
            <span
              key={index}
              className={cn(
                "h-[6px] flex-1 rounded-full transition-colors",
                filled || active ? "bg-primary" : "bg-[var(--surface-soft)]",
                active && !reducedMotion && "segment-pulse",
              )}
            />
          );
        })}
      </div>
      <MonoLabel className="shrink-0">
        Step {current} of {total}
      </MonoLabel>
    </div>
  );
}
