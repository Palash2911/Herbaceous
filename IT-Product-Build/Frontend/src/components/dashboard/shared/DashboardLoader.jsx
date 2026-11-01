import { motion, useReducedMotion } from "framer-motion";
import { DashboardGlassCard } from "@/components/dashboard/shared/primitives";

const orbits = [
  { width: 68, height: 28, tilt: 0, duration: 2.6, color: "var(--teal)" },
  { width: 92, height: 31, tilt: 60, duration: 3.4, color: "var(--coral)" },
  { width: 114, height: 34, tilt: -60, duration: 4.2, color: "var(--amber)" },
];

export function DashboardLoader({ label = "Loading...", className = "" }) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex min-h-40 flex-col items-center justify-center gap-3 text-sm text-muted-foreground ${className}`}
    >
      <div
        aria-hidden="true"
        className="relative flex h-32 w-32 items-center justify-center"
      >
        {orbits.map(({ width, height, tilt, duration, color }, index) => (
          <div
            key={tilt}
            className="absolute rounded-full border border-accent/40"
            style={{ width, height, transform: `rotate(${tilt}deg)` }}
          >
            <motion.div
              className="absolute inset-0"
              animate={
                reducedMotion ? undefined : { rotate: index % 2 ? -360 : 360 }
              }
              transition={{ duration, ease: "linear", repeat: Infinity }}
            >
              <span
                className="absolute top-1/2 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              />
            </motion.div>
          </div>
        ))}
        <span className="size-4 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
      </div>
      <span>{label}</span>
    </div>
  );
}

export function DashboardPanelLoader({ label }) {
  return (
    <DashboardGlassCard className="grid min-h-[60vh] place-items-center">
      <DashboardLoader label={label} />
    </DashboardGlassCard>
  );
}
