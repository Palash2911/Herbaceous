import { ease } from "@/lib/motion";
import { motion } from "framer-motion";

const rings = [0, 1, 2, 3];

export function AuthVisualPanel({ mode }) {
  return (
    <div
      className="relative min-h-[240px] overflow-hidden rounded-[32px] lg:min-h-0"
      style={{
        background:
          "linear-gradient(160deg, #241457 0%, #150c33 55%, #0d0722 100%)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 90% at 18% 8%, rgb(139 108 255 / 0.55), transparent 68%), radial-gradient(85% 85% at 92% 92%, rgb(18 165 148 / 0.38), transparent 70%)",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        {rings.map((ring) => (
          <motion.span
            key={ring}
            className="absolute rounded-full border"
            style={{
              width: 140 + ring * 90,
              height: 140 + ring * 90,
              borderColor: "rgb(255 255 255 / 0.22)",
            }}
            animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
            transition={{
              duration: 26 + ring * 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span
              className="absolute -top-1 left-1/2 h-2 w-2 rounded-full"
              style={{ background: ring % 2 === 0 ? "#b7a0ff" : "#4fd1c0" }}
            />
          </motion.span>
        ))}
        <motion.span
          className="h-16 w-16 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, #c3b0ff, rgb(139 108 255 / 0.25))",
          }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative flex h-full flex-col justify-end p-8 sm:p-10">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <span className="label-mono" style={{ color: "#c9b8ff" }}>
            {mode === "login" ? "Welcome back" : "Join the cohort"}
          </span>
          <p
            className="mt-4 max-w-sm font-display text-2xl leading-snug font-semibold"
            style={{ color: "#F7F5FD" }}
          >
            {mode === "login"
              ? "Your advocate is one step away. Pick up where you left off."
              : "Senior women in STEM are already committing to sponsor someone. One of them is yours."}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
