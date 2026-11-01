import { usePipelineStats } from "@/hooks/usePipelineStats";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useThemeColors } from "@/hooks/useThemeColors";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { drawOrbital } from "./drawOrbital";
import { CENTER_ID } from "./graphData";
import { GraphLegend } from "./GraphLegend";
import { GraphTooltip } from "./GraphTooltip";
import { useForceSimulation } from "./useForceSimulation";

export function OrbitalGraph() {
  const {
    data: orbitalStats,
    loading,
    error,
  } = usePipelineStats("orbital_graph");
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState(null);
  const reduced = useReducedMotion();
  const colors = useThemeColors();
  const handleRef = useForceSimulation(size, reduced, orbitalStats);

  const stateRef = useRef({
    progress: reduced ? 1 : 0,
    time: 0,
    hoveredId: null,
  });
  const visibleRef = useRef(true);
  const pointerRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const measure = () => {
      const rect = wrapper.getBoundingClientRect();
      setSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? true;
      },
      { rootMargin: "120px" },
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (reduced) {
      stateRef.current.progress = 1;
      return;
    }
    registerGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        stateRef.current,
        { progress: 0 },
        {
          progress: 1,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: wrapper, start: "top 78%", once: true },
        },
      );
    }, wrapper);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [reduced, loading]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width || !size.height) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const handle = handleRef.current;
    let frame = 0;

    const render = (time) => {
      frame = requestAnimationFrame(render);
      if (!visibleRef.current && !reduced) return;

      const state = stateRef.current;
      state.time = time;

      const pointer = pointerRef.current;
      let hovered = null;
      if (pointer) {
        const px = pointer.x - size.width / 2;
        const py = pointer.y - size.height / 2;
        let best = Infinity;
        for (const node of handle.nodes) {
          const dx = node.x - px;
          const dy = node.y - py;
          const dist2 = dx * dx + dy * dy;
          const hit = (node.radius + 12) * (node.radius + 12);
          if (dist2 < hit && dist2 < best) {
            best = dist2;
            hovered = node.id;
          }
        }
      }
      state.hoveredId = hovered;

      for (const node of handle.nodes) {
        const target = node.id === hovered ? 1 : 0;
        node.hover += (target - node.hover) * 0.12;
      }

      drawOrbital(ctx, size, handle.nodes, handle.links, colors, state);

      if (hovered && hovered !== CENTER_ID) {
        const node = handle.nodes.find((candidate) => candidate.id === hovered);
        if (node) {
          setTooltip((prev) =>
            prev &&
            prev.id === node.id &&
            Math.abs(prev.x - (node.x + size.width / 2)) < 1.5
              ? prev
              : {
                  id: node.id,
                  label: node.label,
                  detail: node.detail,
                  display: node.display,
                  source: node.source,
                  x: node.x + size.width / 2,
                  y: node.y + size.height / 2 - node.radius,
                },
          );
        }
      } else {
        setTooltip((prev) => (prev ? null : prev));
      }

      if (reduced) cancelAnimationFrame(frame);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [size, colors, reduced, handleRef]);

  if (error) return null;
  if (loading || orbitalStats.length === 0) {
    return <div className="h-[300px] w-full sm:h-[480px] lg:h-[620px]" />;
  }

  const satellites = handleRef.current.nodes.filter((node) => !node.isCenter);

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        ref={wrapperRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
        className="relative h-[300px] w-full sm:h-[480px] lg:h-[620px]"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          pointerRef.current = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          };
        }}
        onPointerLeave={() => {
          pointerRef.current = null;
        }}
      >
        <canvas ref={canvasRef} aria-hidden className="h-full w-full" />
        <GraphTooltip data={tooltip} />
      </motion.div>

      <GraphLegend />

      <ul className="grid gap-3 sm:grid-cols-2 lg:sr-only">
        {satellites.map((node) => (
          <li
            key={node.id}
            className="rounded-2xl border border-[color:var(--border)] p-4 text-sm text-muted"
          >
            <span className="font-display font-semibold text-text">
              {node.display}
            </span>{" "}
            {node.detail}
            {node.source ? (
              <span className="mt-2 block text-[11px]">
                Source: {node.source}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
