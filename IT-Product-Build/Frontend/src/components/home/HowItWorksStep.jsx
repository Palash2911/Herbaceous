import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { softSpring } from "@/lib/motion";

export function HowItWorksStep({ step }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={softSpring} className="h-full">
      <GlassCard className="flex h-full flex-col gap-4 p-8">
        <span className="label-mono text-accent">{step.index}</span>
        <h3 className="font-display text-xl font-semibold">{step.title}</h3>
        <p className="text-sm leading-relaxed text-muted">{step.body}</p>
      </GlassCard>
    </motion.div>
  );
}
