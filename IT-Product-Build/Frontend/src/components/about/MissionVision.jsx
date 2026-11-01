import { motion } from "framer-motion";
import { SectionShell } from "@/components/layout/SectionShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GlassCard } from "@/components/ui/GlassCard";
import { MaskedHeadline } from "@/components/ui/MaskedHeadline";
import { ease, fadeUp, stagger, viewportOnce } from "@/lib/motion";

const blocks = [
  {
    id: "mission",
    kicker: "Mission",
    title: "Turn mentorship into measurable advancement.",
    body: "We recruit senior women who commit to sponsorship, naming their mentee in rooms she is not in, and staking their own credibility on it. Every pairing carries a defined outcome: a promotion case, a visible project, or an offer.",
  },
  {
    id: "vision",
    kicker: "Vision",
    title: "A pipeline that does not narrow.",
    body: "Parity at graduation is already here. Our target is parity at the point of decision: labs, staff-engineer ladders and technical executive teams that look like the cohorts feeding them.",
  },
];

const nameMeaning = {
  kicker: "Why the name?",
  title: "The “HER” in Herbaceous puts women at the centre of growth.",
  paragraphs: [
    "Herbaceous is a botanical term for plants with soft, green stems rather than woody growth. Our visual identity highlights the first three letters — HER — to connect that idea of growth directly with women in STEM.",
    "We chose the name because healthy growth depends on the conditions around it. Women do not need to be fixed; they need access, recognition and advocates who open opportunities. Herbaceous represents our goal of creating those conditions so women can remain, progress and lead in STEM.",
  ],
};

export function MissionVision() {
  return (
    <SectionShell className="pt-32 sm:pt-40">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Eyebrow>About Herbaceous</Eyebrow>
      </motion.div>

      <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] font-semibold sm:text-5xl">
        <MaskedHeadline
          text="We are the people who got tired of waiting for the pipeline to fix itself."
          delay={0.15}
          className="justify-start text-left"
        />
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7, ease }}
        className="mt-6 max-w-2xl leading-relaxed text-muted"
      >
        Herbaceous is a student project built at Monash University as part of
        the Master of Information Technology Industry Experience capstone.
        Team TA06 designed it as a concept for turning mentorship into
        measurable advocacy.
      </motion.p>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-12"
      >
        <GlassCard className="grid gap-6 p-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <Eyebrow tone="amber">{nameMeaning.kicker}</Eyebrow>

            <h2 className="mt-4 font-display text-2xl leading-snug font-semibold sm:text-3xl">
              {nameMeaning.title}
            </h2>
          </div>

          <div className="space-y-4 leading-relaxed text-muted">
            {nameMeaning.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        variants={stagger(0.1, 0.12)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-6 grid gap-6 lg:grid-cols-2"
      >
        {blocks.map((block) => (
          <motion.div key={block.id} variants={fadeUp}>
            <GlassCard className="flex h-full flex-col gap-4 p-8">
              <Eyebrow tone={block.id === "mission" ? "accent" : "teal"}>
                {block.kicker}
              </Eyebrow>

              <h2 className="font-display text-2xl leading-snug font-semibold">
                {block.title}
              </h2>

              <p className="leading-relaxed text-muted">{block.body}</p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  );
}