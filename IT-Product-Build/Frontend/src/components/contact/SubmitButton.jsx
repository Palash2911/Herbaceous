import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { softSpring } from "@/lib/motion";

export function SubmitButton({ state, label = "Send message", disabled = false }) {
  const interactive = state === "idle" && !disabled;
  return (
    <motion.button
      type="submit"
      disabled={!interactive}
      whileHover={interactive ? { y: -2, scale: 1.02 } : {}}
      whileTap={interactive ? { scale: 0.97 } : {}}
      transition={softSpring}
      className="btn-primary relative inline-flex h-12 min-w-44 items-center justify-center gap-2 px-6 text-sm font-medium disabled:opacity-90 disabled:cursor-not-allowed"
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "idle" ? (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="inline-flex items-center gap-2"
          >
            {label} <ArrowRight size={16} />
          </motion.span>
        ) : state === "sending" ? (
          <motion.span
            key="sending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-2"
          >
            <Loader2 size={16} className="animate-spin" /> Sending
          </motion.span>
        ) : (
          <motion.span
            key="sent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-2"
          >
            <Check size={16} /> Message sent
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
