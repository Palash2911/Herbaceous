import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useGsapScroll } from "@/hooks/useGsapScroll";
import { usePipelineStats } from "@/hooks/usePipelineStats";
import { viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";

const toneVar = {
  teal: "var(--teal)",
  accent: "var(--accent)",
  amber: "var(--amber)",
  coral: "var(--coral)",
};

const widths = [100, 82, 64, 48, 32];

const stageLabels = [
  "Start a STEM degree",
  "Graduate",
  "Land a STEM job",
  "Still in STEM at 35",
  "Reach leadership",
];

const stageTones = ["teal", "teal", "accent", "amber", "coral"];

export function PipelineFunnel() {
  const { data, loading, error } = usePipelineStats("pipeline_funnel");
  const pipelineBands = data.map((row, index) => ({
    id: row.key,
    label: stageLabels[index] ?? row.label,
    value: row.value,
    lost: index > 0 ? data[index - 1].value - row.value : 0,
    tone: stageTones[index] ?? "teal",
  }));

  const scopeRef = useGsapScroll(
    ({ gsap, reduced, scope }) => {
      const bands = Array.from(scope.querySelectorAll("[data-band]"));
      const drops = Array.from(scope.querySelectorAll("[data-drop]"));

      if (reduced) {
        gsap.set(bands, {
          scaleX: 1,
          opacity: 1,
        });

        gsap.set(drops, {
          opacity: 1,
          y: 0,
        });

        bands.forEach((band) => {
          const number = band.querySelector("[data-count]");

          if (number) {
            number.textContent = number.dataset["count"] ?? "";
          }
        });

        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: "top 78%",
          once: true,
        },
      });

      bands.forEach((band, index) => {
        const number = band.querySelector("[data-count]");
        const target = Number(number?.dataset["count"] ?? 0);
        const counter = { n: 0 };

        if (number) {
          number.textContent = "0";
        }

        timeline.fromTo(
          band,
          {
            scaleX: 0.2,
            opacity: 0,
          },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
          },
          index * 0.28,
        );

        if (number) {
          timeline.to(
            counter,
            {
              n: target,
              duration: 0.55,
              ease: "power2.out",
              onUpdate: () => {
                number.textContent = String(Math.round(counter.n));
              },
            },
            index * 0.28,
          );
        }

        const drop = drops[index - 1];

        if (drop) {
          timeline.fromTo(
            drop,
            {
              opacity: 0,
              y: -6,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: "power2.out",
            },
            index * 0.28 + 0.35,
          );
        }
      });
    },
    [loading],
  );

  return (
    <SectionShell>
      <SectionHeading
        eyebrow="The leaking pipeline"
        title="Every stage loses women who were never replaced."
        body="This visualisation preserves the intended career-stage structure. Verified stage values are being prepared and will replace the temporary layout data."
      />

      {error ? (
        <p className="mt-10 text-center text-sm text-muted" role="status">
          Unable to load the pipeline data.
        </p>
      ) : null}

      {!error ? (
        <motion.div
          ref={scopeRef}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6 }}
          className="mt-12 flex flex-col items-center"
        >
          {loading
            ? null
            : pipelineBands.map((band, index) => {
                const color = toneVar[band.tone];
                const previous = pipelineBands[index - 1];

                return (
                  <div
                    key={band.id}
                    className="flex w-full flex-col items-center"
                  >
                    {previous ? (
                      <div
                        data-drop
                        className="flex items-center gap-2 py-2 opacity-0"
                        style={{ color: "var(--muted)" }}
                      >
                        <span aria-hidden style={{ color: toneVar[band.tone] }}>
                          ↓
                        </span>

                        <span className="font-mono text-xs tabular-nums">
                          {band.lost} lost at this stage
                        </span>
                      </div>
                    ) : null}

                    <div
                      data-band
                      className="relative flex h-16 w-full origin-center items-center justify-between gap-3 rounded-2xl px-4 opacity-0 sm:h-20 sm:px-8"
                      style={{
                        maxWidth: `${widths[index]}%`,
                        background: `linear-gradient(
                    90deg,
                    color-mix(in oklab, ${color} 62%, transparent),
                    ${color}
                  )`,
                      }}
                    >
                      <span className="font-display text-xs font-semibold text-on-accent sm:text-base">
                        {band.label}
                      </span>

                      <span
                        data-count={String(band.value)}
                        className="font-display text-xl font-semibold tabular-nums text-on-accent sm:text-3xl"
                      >
                        {band.value}
                      </span>
                    </div>
                  </div>
                );
              })}
        </motion.div>
      ) : null}
    </SectionShell>
  );
}
