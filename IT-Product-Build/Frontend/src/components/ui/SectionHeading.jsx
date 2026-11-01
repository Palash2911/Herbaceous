import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import { Eyebrow } from "./Eyebrow";

export function SectionHeading({ eyebrow, title, body, align = "left", tone = "accent", className }) {
  return (
    <motion.div
      variants={stagger(0, 0.09)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <motion.div variants={fadeUp}>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </motion.div>
      ) : null}
      <motion.h2
        variants={fadeUp}
        className="max-w-3xl text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl lg:text-5xl"
      >
        {title}
      </motion.h2>
      {body ? (
        <motion.p variants={fadeUp} className="max-w-2xl text-base leading-relaxed text-muted">
          {body}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
