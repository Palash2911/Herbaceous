import { motion } from "framer-motion";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  workforceMovementNote,
  workforceMovementRows,
  workforceMovementSource,
} from "@/content/workforceMovement";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const toneVar = {
  teal: "var(--teal)",
  accent: "var(--accent)",
  amber: "var(--amber)",
  coral: "var(--coral)",
};

const chartMaximum = 100;

export function WorkforceMovementChart() {
  return (
    <SectionShell>
      <SectionHeading
        eyebrow="Workforce movement"
        title="Representation in movement data tells a more complex story."
        body="In FY2024-25, women's shares of promotions, external appointments and resignations were all above their 36.5 percent share of the STEM-industry workforce."
      />

      <motion.ul
        variants={stagger(0.05, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-12 flex flex-col gap-7"
      >
        {workforceMovementRows.map((row) => {
          const color = toneVar[row.tone];
          const width = `${(row.value / chartMaximum) * 100}%`;

          return (
            <motion.li key={row.id} variants={fadeUp}>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="font-display text-base font-semibold sm:text-lg">
                    {row.label}
                  </p>

                  <p className="mt-1 text-sm text-muted">{row.detail}</p>
                </div>

                <span
                  className="font-display text-2xl font-semibold tabular-nums sm:text-3xl"
                  style={{ color }}
                >
                  {row.value}%
                </span>
              </div>

              <div
                className="mt-3 h-4 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text)_8%,transparent)]"
                role="img"
                aria-label={`${row.label}: ${row.value} percent women`}
              >
                <motion.div
                  className="h-full origin-left rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={viewportOnce}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    width,
                    background: `linear-gradient(
                      90deg,
                      color-mix(in oklab, ${color} 62%, transparent),
                      ${color}
                    )`,
                  }}
                />
              </div>
            </motion.li>
          );
        })}
      </motion.ul>

      <div className="mt-10 rounded-2xl border border-border p-5">
        <p className="text-sm leading-relaxed text-muted">
          {workforceMovementNote}
        </p>

        <p className="label-mono mt-4 border-t border-border pt-4 text-muted">
          {workforceMovementSource}
        </p>
      </div>
    </SectionShell>
  );
}