import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const toneText = {
  positive: "text-teal",
  caution: "text-amber",
  negative: "text-coral",
  neutral: "text-accent",
};

export function KpiCard({ label, value, hint, icon: Icon, tone = "neutral", index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="glass rounded-[24px] p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="label-caps">{label}</span>
        <span
          className={cn("flex size-8 items-center justify-center rounded-[10px]", toneText[tone])}
          style={{ background: "color-mix(in srgb, currentColor 14%, transparent)" }}
        >
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold leading-none">{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </motion.div>
  );
}
