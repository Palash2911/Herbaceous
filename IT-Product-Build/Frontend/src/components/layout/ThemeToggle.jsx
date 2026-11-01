import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { softSpring } from "@/lib/motion";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      whileTap={{ scale: 0.94 }}
      transition={softSpring}
      className="relative flex h-9 w-16 items-center rounded-full border border-[color:var(--border)] bg-[color-mix(in_oklab,var(--text)_6%,transparent)] px-1"
    >
      <motion.span
        layout
        transition={softSpring}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-on-accent"
        style={{ marginLeft: isDark ? 28 : 0 }}
      >
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </motion.span>
    </motion.button>
  );
}
