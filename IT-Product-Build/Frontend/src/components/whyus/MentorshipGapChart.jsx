import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { usePipelineStats } from "@/hooks/usePipelineStats";
import { useGsapScroll } from "@/hooks/useGsapScroll";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";

const FIELD_LABELS = [
  "Engineering",
  "Computer Science",
  "Physics",
  "Mathematics",
  "Biology",
];

const mentorGapSource =
  "Source: Herbaceous analysis of Engineers Australia, ABS Census 2021 and STEM Equity Monitor enrolment data";

const toneFor = (mentees) => {
  if (mentees >= 12) return "var(--coral)";
  if (mentees >= 9) return "var(--amber)";
  if (mentees >= 6) return "var(--accent)";
  return "var(--teal)";
};

export function MentorshipGapChart() {
  const { data, loading, error } = usePipelineStats("mentor_gap");
  const mentorGap = data.map((row, index) => ({
    field: FIELD_LABELS[index] ?? row.label,
    mentees: row.value,
    ratio: `1:${row.value}`,
  }));
  const worst = mentorGap.length ? Math.max(...mentorGap.map((row) => row.mentees)) : 1;

  const scopeRef = useGsapScroll(({ gsap, reduced, scope }) => {
    const bars = Array.from(scope.querySelectorAll("[data-gap-bar]"));
    if (reduced) {
      gsap.set(bars, { scaleX: 1 });
      return;
    }
    gsap.fromTo(
      bars,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: scope, start: "top 82%", once: true },
      },
    );
  }, [loading]);

  return (
    <SectionShell>
      <SectionHeading
        eyebrow="The mentorship gap"
        title="There are not enough senior women to go around."
        body="Mentees per available female mentor, by field, sorted worst to best. The fields with the steepest leadership gap also have the fewest women available to sponsor the next cohort."
      />

      {error ? null : (
        <>
          <motion.ul
            ref={scopeRef}
            variants={stagger(0.08, 0.09)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-12 flex flex-col gap-6"
          >
            {loading
              ? null
              : mentorGap.map((row) => {
                  const color = toneFor(row.mentees);
                  return (
                    <motion.li key={row.field} variants={fadeUp}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-display text-sm font-medium sm:text-base">
                          {row.field}
                        </span>
                        <span
                          className="font-mono text-sm tabular-nums"
                          style={{ color }}
                        >
                          {row.ratio} mentor to mentees
                        </span>
                      </div>
                      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text)_8%,transparent)]">
                        <div
                          data-gap-bar
                          className="h-full origin-left rounded-full"
                          style={{
                            width: `${(row.mentees / worst) * 100}%`,
                            background: `linear-gradient(90deg, color-mix(in oklab, ${color} 65%, transparent), ${color})`,
                          }}
                        />
                      </div>
                    </motion.li>
                  );
                })}
          </motion.ul>

          <p className="label-mono mt-10 text-muted">{mentorGapSource}</p>
        </>
      )}
    </SectionShell>
  );
}
