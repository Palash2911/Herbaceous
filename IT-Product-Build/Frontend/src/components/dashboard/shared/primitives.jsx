import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function DashboardGlassCard({ className, children, ...props }) {
  return (
    <motion.div
      className={cn("glass rounded-[24px] p-6", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function DashboardLabel({ children, className }) {
  return <span className={cn("label-caps", className)}>{children}</span>;
}

const toneStyles = {
  positive: "text-teal",
  caution: "text-amber",
  negative: "text-coral",
  neutral: "text-accent",
};

export function StatusPill({ tone = "neutral", children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
      style={{
        background: "color-mix(in srgb, currentColor 14%, transparent)",
      }}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_6px_26px_rgba(91,59,232,0.35)] hover:brightness-110",
  soft: "bg-[var(--surface-soft)] text-foreground hover:bg-[var(--hairline)]",
  outline:
    "border border-[var(--hairline)] text-foreground hover:bg-[var(--surface-soft)]",
  ghost: "text-muted-foreground hover:text-foreground",
  danger: "text-coral border border-current/30 hover:bg-coral/10",
};

export function DashboardButton({
  variant = "primary",
  className,
  children,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function DashboardAvatar({ initials, size = 40, tone = "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        toneStyles[tone],
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: "color-mix(in srgb, currentColor 16%, transparent)",
        border: "1px solid color-mix(in srgb, currentColor 28%, transparent)",
      }}
    >
      {initials}
    </span>
  );
}

export function EmptyState({ icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[var(--hairline)] px-6 py-10 text-center">
      {icon ? <div className="mb-3 text-muted-foreground">{icon}</div> : null}
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="label-caps">{label}</span>
      <div className="mt-2">{children}</div>
      {hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-[12px] border border-[var(--hairline)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent";

export function Chip({ children, active, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-[var(--hairline)] text-muted-foreground hover:text-foreground",
        !onClick && "cursor-default",
        className,
      )}
    >
      {children}
    </button>
  );
}
