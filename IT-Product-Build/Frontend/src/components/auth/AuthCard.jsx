import { Eyebrow } from "@/components/ui/Eyebrow";
import { GlassCard } from "@/components/ui/GlassCard";
import { ease } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthModeToggle } from "./AuthModeToggle";
import { AuthVisualPanel } from "./AuthVisualPanel";
import { LoginForm } from "./LoginForm";

export function AuthCard() {
  const navigate = useNavigate();
  const mode = "login";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2">
      <AuthVisualPanel mode={mode} />

      <GlassCard className="flex flex-col gap-8 p-8 sm:p-10">
        <div>
          <Eyebrow>Herbaceous access</Eyebrow>
          <h1 className="mt-4 font-display text-3xl leading-tight font-semibold">
            Log in to your programme
          </h1>
          <p className="mt-2 text-sm text-muted">
            Pick up your pairing, notes and twelve-week plan.
          </p>
        </div>

        <AuthModeToggle
          mode={mode}
          onChange={(id) => {
            if (id === "signup") navigate("/signup");
          }}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35, ease }}
          >
            <LoginForm />
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
