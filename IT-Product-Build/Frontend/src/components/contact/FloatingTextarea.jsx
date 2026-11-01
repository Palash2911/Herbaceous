import { motion } from "framer-motion";
import { useState } from "react";

export function FloatingTextarea({ id, label, value, onChange, error, rows = 5 }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative pt-2">
      <motion.label
        htmlFor={id}
        animate={{
          y: lifted ? 0 : 22,
          scale: lifted ? 0.84 : 1,
          color: error ? "var(--coral)" : lifted ? "var(--accent)" : "var(--muted)",
        }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute top-0 left-3 z-10 origin-left px-1 text-[15px] leading-4"
        style={{ background: "var(--field-bg)" }}
      >
        {label}
      </motion.label>

      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-error`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[120px] w-full resize-none rounded-[12px] border px-4 py-3 text-[15px] text-text outline-none"
        style={{
          background: "var(--field-bg)",
          borderColor: error ? "var(--coral)" : focused ? "var(--accent)" : "var(--field-border)",
          borderWidth: 1,
          boxShadow: focused && !error ? "0 0 0 3px var(--field-ring)" : "none",
          transition: "border-color 180ms ease-out, box-shadow 180ms ease-out",
        }}
      />

      <p id={`${id}-error`} className="mt-1 min-h-[18px] text-[13px] leading-[18px] text-coral">
        {error ?? ""}
      </p>
    </div>
  );
}
