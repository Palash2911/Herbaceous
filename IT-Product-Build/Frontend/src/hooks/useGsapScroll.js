import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useEffect, useRef } from "react";
import { prefersReducedMotionNow } from "./useReducedMotion";

export function useGsapScroll(build, deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    registerGsap();
    const reduced = prefersReducedMotionNow();
    const ctx = gsap.context(() => {
      build({ gsap, ScrollTrigger, reduced, scope });
    }, scope);
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
