import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

export function PageTransition({ children }) {
  return (
    <motion.main variants={pageTransition} initial="initial" animate="enter" className="relative">
      {children}
    </motion.main>
  );
}
