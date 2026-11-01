import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function SmoothScrollProvider({ children }) {
  const reduced = useReducedMotion();
  const location = useLocation();
  const lenisRef = useRef(null);

  useEffect(() => {
    if (reduced) return;
    registerGsap();

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenisRef.current = null;
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reduced]);

  useEffect(() => {
    if (location.hash) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return <>{children}</>;
}
