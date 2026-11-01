import { SectionShell } from "@/components/layout/SectionShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCounter } from "@/components/ui/StatCounter";
import { usePipelineStats } from "@/hooks/usePipelineStats";
import { fadeUp, softSpring, stagger, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";

const toneClass = {
  accent: "text-accent",
  coral: "text-coral",
  teal: "text-teal",
};

const TONES = ["accent", "teal", "coral"];

export function StatStrip() {
  const { data, loading, error } = usePipelineStats("stat_strip");

  if (loading) {
    return (
      <SectionShell className="py-8 sm:py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {TONES.map((tone) => (
            <GlassCard key={tone} className="flex h-full flex-col gap-2 p-6">
              <div className="flex min-h-10 items-center sm:min-h-12">
                <Skeleton className="h-10 w-24 sm:h-12" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-auto h-4 w-32" />
            </GlassCard>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (error || data.length === 0) {
    return (
      <SectionShell className="py-8 sm:py-12">
        <p className="text-center text-sm text-muted" role="status">
          Unavailable
        </p>
      </SectionShell>
    );
  }

  return (
    <SectionShell className="py-8 sm:py-12">
      <motion.ul
        variants={stagger(0.05, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-4 md:grid-cols-3"
      >
        {data.map((stat, index) => (
          <motion.li key={stat.key} variants={fadeUp}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={softSpring}
              className="h-full"
            >
              <GlassCard className="flex h-full flex-col gap-2 p-6">
                <div className="flex min-h-10 items-center sm:min-h-12">
                  <StatCounter
                    value={stat.value}
                    suffix={stat.displaySuffix ?? ""}
                    className={toneClass[TONES[index % TONES.length]]}
                  />
                </div>
                <span className="font-display text-sm font-semibold">
                  {stat.label}
                </span>
                {stat.sourceLabel ? (
                  <p className="label-mono mt-auto border-t border-border pt-4 text-muted">
                    {stat.sourceLabel}
                  </p>
                ) : null}
              </GlassCard>
            </motion.div>
          </motion.li>
        ))}
      </motion.ul>
    </SectionShell>
  );
}
