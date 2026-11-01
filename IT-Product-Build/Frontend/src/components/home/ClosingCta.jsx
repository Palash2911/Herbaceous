import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionShell } from "@/components/layout/SectionShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { ButtonLink } from "@/components/ui/ActionButton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export function ClosingCta() {
  return (
    <SectionShell>
      <motion.div
        variants={stagger(0.05, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
      >
        <GlassCard className="relative overflow-hidden p-10 text-center sm:p-16">
          <motion.div variants={fadeUp} className="flex justify-center">
            <Eyebrow tone="teal">Applications open</Eyebrow>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl font-display text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl"
          >
            The pipeline does not fix itself. Bring someone with you, or let someone bring you.
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-muted">
            Join as a mentee to find your advocate, or as a mentor to become one.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonLink to="/auth">
              Create your account <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink to="/contact" variant="outline">
              Talk to the team
            </ButtonLink>
          </motion.div>
        </GlassCard>
      </motion.div>
    </SectionShell>
  );
}
