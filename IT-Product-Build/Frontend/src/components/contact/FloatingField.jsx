import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function FloatingField({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const lifted = focused || value.length > 0;
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const hasError = Boolean(error);
  const message = typeof error === "string" ? error : "";

  return (
    <div className="relative pt-6">
      <motion.label
        htmlFor={id}
        animate={{
          x: lifted ? -8 : 0,
          y: lifted ? 0 : 24,
          scale: lifted ? 0.84 : 1,
          color: hasError
            ? "var(--coral)"
            : lifted
              ? "var(--accent)"
              : "var(--muted)",
        }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-3 z-10 origin-left text-[15px] leading-4"
        style={{ top: lifted ? "-4px" : "18px" }}
      >
        {label}
      </motion.label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={message ? `${id}-error` : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-md border px-4 text-[15px] text-text outline-none mb-2"
          style={{
            background: "var(--field-bg)",
            borderColor: hasError
              ? "var(--coral)"
              : focused
                ? "var(--accent)"
                : "var(--field-border)",
            borderWidth: 1,
            boxShadow:
              focused && !hasError
                ? "0 0 0 3px var(--field-ring), var(--autofill-shadow, 0 0 #0000)"
                : "var(--autofill-shadow, 0 0 #0000)",
            transition:
              "border-color 180ms ease-out, box-shadow 180ms ease-out",
            paddingRight: isPassword ? "44px" : undefined,
          }}
        />
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-muted"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </div>
      {message && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-[13px] leading-4.5 text-coral"
        >
          {message}
        </p>
      )}
    </div>
  );
}
