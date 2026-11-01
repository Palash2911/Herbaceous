import { useGsapScroll } from "@/hooks/useGsapScroll";
import { prefersReducedMotionNow } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export function useReveal(deps = []) {
  return useGsapScroll(({ gsap, ScrollTrigger, reduced, scope }) => {
    const items = Array.from(scope.querySelectorAll("[data-reveal]"));
    if (!items.length) return;
    if (reduced) {
      items.forEach((item) => {
        item.style.opacity = "1";
      });
      return;
    }
    const groups = new Map();
    items.forEach((item) => {
      const parent = item.parentElement ?? scope;
      groups.set(parent, [...(groups.get(parent) ?? []), item]);
    });
    groups.forEach((group) => {
      gsap.fromTo(
        group,
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: { trigger: group[0], start: "top 92%", once: true },
        },
      );
    });
    ScrollTrigger.refresh();
  }, deps);
}

export function useInView(ref, rootMargin = "-10% 0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

export function useDrawIn(ref) {
  const inView = useInView(ref);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const length = "getTotalLength" in el ? el.getTotalLength() : 1000;
    if (prefersReducedMotionNow()) {
      el.style.strokeDasharray = "none";
      el.style.strokeDashoffset = "0";
      return;
    }
    el.style.strokeDasharray = `${length}`;
    el.style.strokeDashoffset = inView ? "0" : `${length}`;
    el.style.transition = "stroke-dashoffset 1.4s ease-out";
  }, [inView, ref]);
}

function useAnimatedNumberValue(value, duration = 900) {
  const [display, setDisplay] = useState(prefersReducedMotionNow() ? value : 0);
  const from = useRef(display);
  useEffect(() => {
    if (prefersReducedMotionNow()) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const initial = from.current;
    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = initial + (value - initial) * eased;
      setDisplay(next);
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  className,
}) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const display = useAnimatedNumberValue(inView ? value : 0);
  return (
    <span ref={ref} className={className}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function RadialRing({
  value,
  size = 64,
  stroke = 6,
  color = "var(--accent)",
  children,
  className,
  bright = false,
}) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (c * (inView ? value : 0)) / 100;
  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition:
              "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1), filter .25s ease",
            filter: bright ? "brightness(1.25)" : undefined,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function Sparkline({
  data,
  color = "var(--accent)",
  width = 88,
  height = 28,
}) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / (max - min || 1)) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg ref={ref} width={width} height={height} aria-hidden>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 400,
          strokeDashoffset: inView ? 0 : 400,
          transition: "stroke-dashoffset 1.4s ease-out",
        }}
      />
    </svg>
  );
}

const toneStyles = {
  teal: "text-teal border-teal/40 bg-teal/10",
  amber: "text-amber border-amber/40 bg-amber/10",
  coral: "text-coral border-coral/40 bg-coral/10",
  accent: "text-accent border-accent/40 bg-accent/10",
  muted: "text-muted-foreground border-border bg-muted",
};

export function StatusPill({ tone = "muted", icon, children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
