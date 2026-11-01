import { motion } from "framer-motion";
import { SectionShell } from "@/components/layout/SectionShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskedHeadline } from "@/components/ui/MaskedHeadline";
import { ease } from "@/lib/motion";
import { OrbitalGraph } from "./OrbitalGraph";

export function WhyUsHero() {
  return (
    <SectionShell className="pt-32 sm:pt-40" width="wide">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Eyebrow>Why us</Eyebrow>
          </motion.div>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] font-semibold sm:text-5xl">
            <MaskedHeadline
              text="The numbers nobody puts on a careers page."
              delay={0.15}
              className="justify-start text-left"
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease }}
            className="mt-6 max-w-lg leading-relaxed text-muted"
          >
            Explore Australian evidence on women&apos;s STEM qualifications,
            workforce representation and workforce movement. Hover or tap any
            node to read its population, reporting period and source.
          </motion.p>
        </div>

        <OrbitalGraph />
      </div>
    </SectionShell>
  );
}