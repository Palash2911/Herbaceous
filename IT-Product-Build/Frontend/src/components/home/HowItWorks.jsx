import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { howItWorks } from "@/content/advocacy";
import { useGsapScroll } from "@/hooks/useGsapScroll";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import { HowItWorksStep } from "./HowItWorksStep";

export function HowItWorks() {
  const scopeRef = useGsapScroll(({ gsap, reduced, scope }) => {
    const line = scope.querySelector("[data-step-line]");
    if (!line) return;
    if (reduced) {
      gsap.set(line, { scaleX: 1, transformOrigin: "left center" });
      return;
    }

    gsap.fromTo(
      line,
      { scaleX: 0 },
      {
        scaleX: 1,
        transformOrigin: "left center",
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top 75%",
          end: "bottom 65%",
          scrub: 0.6,
        },
      },
    );
  });

  return (
    <SectionShell>
      <SectionHeading
        eyebrow="How it works"
        title="Three steps from stuck to sponsored."
        body="No endless matching quizzes. A clear intake, a real advocate, and twelve weeks with an outcome attached."
        align="center"
        className="mx-auto"
      />

      <div ref={scopeRef} className="relative mt-12">
        <svg
          aria-hidden
          className="absolute top-10 right-8 left-8 hidden h-px lg:block"
          preserveAspectRatio="none"
          viewBox="0 0 100 1"
        >
          <line
            data-step-line
            x1="0"
            y1="0.5"
            x2="100"
            y2="0.5"
            stroke="var(--accent)"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
        </svg>

        <motion.div
          variants={stagger(0.05, 0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-6 lg:grid-cols-3"
        >
          {howItWorks.map((step) => (
            <motion.div key={step.id} variants={fadeUp}>
              <HowItWorksStep step={step} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionShell>
  );
}
