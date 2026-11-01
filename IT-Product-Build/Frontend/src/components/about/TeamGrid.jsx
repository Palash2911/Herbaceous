import { motion } from "framer-motion";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamCard } from "./TeamCard";
import { team } from "@/content/team";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export function TeamGrid() {
  return (
    <SectionShell>
      <SectionHeading
        eyebrow="The team"
        title="Six students, one problem worth solving."
        body="We are team TA06 in the Master of Information Technology at Monash University, building Herbaceous for the Monash Industry Experience capstone. Half of us are women in STEM building for women in STEM, and all of us have watched the pipeline narrow from the inside."
      />


      <motion.ul
        variants={stagger(0.08, 0.09)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {team.map((member) => (
          <motion.li key={member.id} variants={fadeUp}>
            <TeamCard member={member} />
          </motion.li>
        ))}
      </motion.ul>
    </SectionShell>
  );
}
