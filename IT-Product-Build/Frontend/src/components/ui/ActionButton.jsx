import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { softSpring } from "@/lib/motion";
import { AppLink } from "@/components/layout/AppLink";

const base =
  "inline-flex items-center justify-center gap-2 font-body text-sm font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-60";

const variants = {
  primary: "btn-primary px-6 py-3",
  outline:
    "rounded-full border border-[color:var(--accent)] px-6 py-3 text-accent hover:bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]",
  ghost:
    "rounded-full border border-transparent px-6 py-3 text-text hover:bg-[color-mix(in_oklab,var(--text)_8%,transparent)]",
};

export function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  onClick,
  disabled,
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={softSpring}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </motion.button>
  );
}

export function ButtonLink({ children, to, variant = "primary", className }) {
  return (
    <motion.span
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={softSpring}
      className="inline-flex"
    >
      <AppLink to={to} className={cn(base, variants[variant], className)}>
        {children}
      </AppLink>
    </motion.span>
  );
}
