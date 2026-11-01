import { useIntro } from "@/context/IntroContext";
import { prefersReducedMotionNow } from "@/hooks/useReducedMotion";
import { ease } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

const MAX_DURATION = 1800;

const orbits = [
  { size: 150, ratio: 0.42, tilt: 0, duration: 2.6, dot: "var(--teal)" },
  { size: 200, ratio: 0.34, tilt: 62, duration: 3.4, dot: "var(--coral)" },
  { size: 250, ratio: 0.28, tilt: -58, duration: 4.2, dot: "var(--amber)" },
];

export function Preloader() {
  const { markIntroReady } = useIntro();
  const [visible, setVisible] = useState(() => !prefersReducedMotionNow());

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const hardStop = window.setTimeout(dismiss, MAX_DURATION);
    const onKey = () => dismiss();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";

    return () => {
      window.clearTimeout(hardStop);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [visible, dismiss]);

  return (
    <AnimatePresence onExitComplete={markIntroReady}>
      {visible ? (
        <motion.div
          key="preloader"
          role="status"
          aria-label="Loading Herbaceous"
          onClick={dismiss}
          className="fixed inset-0 z-[999] flex cursor-pointer flex-col items-center justify-center bg-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease } }}
        >
          <div className="relative flex h-64 w-64 items-center justify-center">
            {orbits.map((orbit, index) => (
              <motion.div
                key={orbit.size}
                className="absolute"
                style={{ width: orbit.size, height: orbit.size * orbit.ratio }}
                initial={{ opacity: 0, scale: 0.7, rotate: orbit.tilt }}
                animate={{ opacity: 1, scale: 1, rotate: orbit.tilt }}
                exit={{
                  opacity: 0,
                  scale: 1.9,
                  transition: { duration: 0.55, ease },
                }}
                transition={{ duration: 0.6, delay: index * 0.08, ease }}
              >
                <div
                  className="absolute inset-0 rounded-full border"
                  style={{
                    borderColor:
                      "color-mix(in oklab, var(--accent) 45%, transparent)",
                  }}
                />
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: index % 2 === 0 ? 360 : -360 }}
                  transition={{
                    duration: orbit.duration,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <span
                    className="absolute top-1/2 left-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      background: orbit.dot,
                      boxShadow: `0 0 12px ${orbit.dot}`,
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}

            <motion.span
              className="relative h-10 w-10 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, var(--accent), color-mix(in oklab, var(--accent) 30%, transparent))",
              }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [1, 1.14, 1], opacity: 1 }}
              exit={{
                scale: 3.2,
                opacity: 0,
                transition: { duration: 0.55, ease },
              }}
              transition={{
                scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.4, ease },
              }}
            />
          </div>

          <motion.p
            className="label-mono mt-6 text-muted"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
          >
            Herbaceous, Women in STEM
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
