import { motion } from "framer-motion";
import { softSpring } from "@/lib/motion";

const modes = [
  { id: "login", label: "Log in" },
  { id: "signup", label: "Sign up" },
];

export function AuthModeToggle({ mode, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Authentication mode"
      className="relative grid grid-cols-2 rounded-full border border-[color:var(--border)] p-1"
    >
      {modes.map((item) => {
        const active = item.id === mode;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className="relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            style={{ color: active ? "var(--on-accent)" : "var(--muted)" }}
          >
            {active ? (
              <motion.span
                layoutId="auth-toggle-pill"
                transition={softSpring}
                className="absolute inset-0 -z-10 rounded-full bg-accent"
              />
            ) : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
