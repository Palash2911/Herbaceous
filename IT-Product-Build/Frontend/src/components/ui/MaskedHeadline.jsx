import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function MaskedHeadline({
  text,
  delay = 0,
  step = 0.06,
  className,
  play = true,
  reduced = false,
}) {
  const words = text.split(" ");
  const hidden = reduced
    ? { opacity: 0 }
    : { y: "115%", filter: "blur(10px)", opacity: 0 };
  const shown = reduced
    ? { opacity: 1 }
    : { y: "0%", filter: "blur(0px)", opacity: 1 };
  return (
    <span className={cn("inline-flex flex-wrap justify-start", className)}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="overflow-hidden py-[0.08em]">
          <motion.span
            className="inline-block pr-[0.26em] will-change-transform"
            initial={hidden}
            animate={play ? shown : hidden}
            transition={{ duration: 0.95, delay: delay + index * step, ease }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
