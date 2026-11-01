import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusable(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

function trapFocus(event, container) {
  const focusable = getFocusable(container);
  if (focusable.length === 0) {
    event.preventDefault();
    container?.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  const inside = container.contains(active);

  if (event.shiftKey) {
    if (!inside || active === first || active === container) {
      event.preventDefault();
      last.focus();
    }
  } else if (!inside || active === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * @param {{ open: boolean, onClose: () => void, title: string, eyebrow?: string, consequence?: string, children?: import("react").ReactNode, footer?: import("react").ReactNode }} props
 */
export function Modal({
  open,
  onClose,
  title,
  eyebrow = "Confirmation",
  consequence,
  children,
  footer,
}) {
  const titleId = useId();
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => {
      modalRef.current?.focus();
    });

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") trapFocus(event, modalRef.current);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousFocus?.focus?.();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 h-full w-full cursor-default bg-[rgba(10,6,22,0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="scroll-thin relative max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-[var(--hairline)] bg-[var(--card)] text-foreground shadow-[0_28px_90px_rgba(10,6,22,0.35)] outline-none"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--hairline)] px-6 py-5">
              <div className="min-w-0">
                <span className="label-caps">{eyebrow}</span>
                <h3
                  id={titleId}
                  className="mt-1 font-display text-xl font-semibold text-foreground"
                >
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] text-muted-foreground transition-colors hover:bg-[var(--surface-soft)] hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/10"
              >
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6">
              {consequence != null ? (
                <p
                  className="rounded-2xl border px-4 py-3 text-sm leading-6 text-foreground"
                  style={{
                    background:
                      "color-mix(in srgb, var(--accent) 8%, var(--card))",
                    borderColor:
                      "color-mix(in srgb, var(--accent) 20%, var(--hairline))",
                  }}
                >
                  {consequence}
                </p>
              ) : null}

              {children ? (
                <div
                  className={
                    consequence != null ? "mt-4 space-y-4" : "space-y-4"
                  }
                >
                  {children}
                </div>
              ) : null}

              {footer ? (
                <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[var(--hairline)] pt-5">
                  {footer}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
