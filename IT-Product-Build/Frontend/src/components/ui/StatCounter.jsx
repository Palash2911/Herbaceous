import { prefersReducedMotionNow } from "@/hooks/useReducedMotion";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  decimals,
  className,
}) {
  const ref = useRef(null);
  const places = decimals ?? (Number.isInteger(value) ? 0 : 1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerGsap();
    const format = (n) =>
      `${prefix}${n.toLocaleString(undefined, {
        minimumFractionDigits: places,
        maximumFractionDigits: places,
      })}${suffix}`;

    if (prefersReducedMotionNow()) {
      el.textContent = format(value);
      return;
    }

    const counter = { n: 0 };
    el.textContent = format(0);
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        n: value,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = format(counter.n);
        },
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
    return () => ctx.revert();
  }, [value, prefix, suffix, places]);

  useEffect(() => () => ScrollTrigger.refresh(), []);

  return (
    <span
      ref={ref}
      className={cn(
        "font-display text-4xl font-semibold tabular-nums sm:text-5xl",
        className,
      )}
    >
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
