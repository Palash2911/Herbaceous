import { useStore } from "@/components/dashboard/shared/store";
import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";

const roles = [
  { id: "mentee", label: "Mentee" },
  { id: "mentor", label: "Mentor" },
  { id: "admin", label: "Admin" },
];

export function RoleSwitcher() {
  const { role, setRole } = useStore();

  return (
    <div
      className="fixed right-4 top-4 z-90 rounded-[16px] border border-dashed p-2"
      style={{
        borderColor: "color-mix(in srgb, var(--coral) 55%, transparent)",
        background: "color-mix(in srgb, var(--coral) 10%, var(--glass-bg))",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="mb-1.5 flex items-center gap-1.5 px-1 text-coral">
        <FlaskConical size={12} />
        <span className="label-caps text-coral">Preview tool</span>
      </div>
      <div className="flex gap-1 rounded-full bg-[var(--surface-soft)] p-1">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className="relative rounded-full px-3 py-1 text-xs font-medium"
          >
            {role === r.id ? (
              <motion.span
                layoutId="role-switcher-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            ) : null}
            <span
              className={
                role === r.id
                  ? "relative text-primary-foreground"
                  : "relative text-muted-foreground"
              }
            >
              {r.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
