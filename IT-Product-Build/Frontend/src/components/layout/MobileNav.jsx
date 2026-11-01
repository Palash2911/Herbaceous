import { AppLink } from "@/components/layout/AppLink";
import { ease, fadeUp, stagger } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import { navItems } from "./Header";

export function MobileNav({ open, onClose, hasSession, onProfileClick }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mobile-nav"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease }}
          className="fixed inset-0 z-40 bg-bg/95 px-6 pt-24 md:hidden"
        >
          <motion.nav
            variants={stagger(0.08, 0.07)}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            {navItems.map((item) => (
              <motion.div key={item.to} variants={fadeUp}>
                <AppLink
                  to={item.to}
                  onClick={onClose}
                  className="block border-b border-[color:var(--border)] py-4 font-display text-2xl font-semibold"
                >
                  {item.label}
                </AppLink>
              </motion.div>
            ))}
            <motion.div variants={fadeUp}>
              {hasSession ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onProfileClick();
                  }}
                  className="block w-full border-b border-[color:var(--border)] py-4 text-left font-display text-2xl font-semibold"
                >
                  My account
                </button>
              ) : (
                <AppLink
                  to="/auth"
                  onClick={onClose}
                  className="block border-b border-[color:var(--border)] py-4 font-display text-2xl font-semibold"
                >
                  Sign in
                </AppLink>
              )}
            </motion.div>
          </motion.nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
