import { SectionShell } from "@/components/layout/SectionShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCounter } from "@/components/ui/StatCounter";
import { advocacyRows, advocacySummary } from "@/content/advocacy";
import { usePipelineStats } from "@/hooks/usePipelineStats";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function AdviceVsAdvocacy() {
  const { data, loading, error } = usePipelineStats("advocacy_summary");
  const [adviceStat, advocacyStat] = data;
  const showFigures = !loading && !error && adviceStat && advocacyStat;

  const figures = showFigures
    ? [
        {
          id: "advice",
          title: advocacySummary.advice.title,
          kicker: advocacySummary.advice.kicker,
          value: adviceStat.value,
          caption: advocacySummary.advice.caption,
          tone: "text-amber",
        },
        {
          id: "advocacy",
          title: advocacySummary.advocacy.title,
          kicker: advocacySummary.advocacy.kicker,
          value: advocacyStat.value,
          caption: advocacySummary.advocacy.caption,
          tone: "text-accent",
        },
      ]
    : [];

  return (
    <SectionShell>
      <SectionHeading
        eyebrow="The distinction"
        title="Advice tells you the rules. Advocacy changes the outcome."
        body="A mentor explains the promotion committee. A sponsor sits on it. That single difference is the whole thesis of Herbaceous."
        tone="coral"
      />

      <motion.div
        variants={stagger(0.05, 0.12)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-12 grid gap-6 sm:grid-cols-2"
      >
        {figures.map((figure) => (
          <motion.div key={figure.id} variants={fadeUp}>
            <GlassCard className="flex h-full flex-col p-8">
              <span className="label-mono text-muted">{figure.kicker}</span>
              <StatCounter
                value={figure.value}
                suffix="%"
                className={`mt-6 text-5xl sm:text-7xl ${figure.tone}`}
              />
              <p className="mt-4 font-display text-lg font-semibold">
                {figure.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {figure.caption}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      <motion.ul
        variants={stagger(0.05, 0.07)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-10 flex flex-col gap-3"
      >
        {advocacyRows.map((row) => (
          <motion.li
            key={row.id}
            variants={fadeUp}
            className="grid items-center gap-3 rounded-2xl border border-[color:var(--border)] p-4 sm:grid-cols-[1fr_auto_1fr]"
          >
            <span className="text-sm text-muted">{row.advice}</span>
            <ArrowRight
              size={16}
              className="hidden text-accent sm:block"
              aria-hidden
            />
            <span className="text-sm font-medium">{row.advocacy}</span>
          </motion.li>
        ))}
      </motion.ul>
    </SectionShell>
  );
}
