import { softSpring } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";

const toneStyle = { color: "var(--accent)" };

export function GraphTooltip({ data }) {
  return (
    <AnimatePresence>
      {data ? (
        <motion.div
          key={data.id}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={softSpring}
          className="pointer-events-none absolute z-20 w-60 -translate-x-1/2 -translate-y-full"
          style={{ left: data.x, top: data.y - 18 }}
        >
          <div className="glass-card p-4">
            <span className="label-mono text-muted">{data.label}</span>
            <p
              className="mt-1 font-display text-2xl font-semibold"
              style={toneStyle}
            >
              {data.display}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {data.detail}
            </p>
            <p className="mt-2 text-[11px] leading-snug text-muted">
              Source: {data.source}
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
