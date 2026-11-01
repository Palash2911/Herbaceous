import {
  forceCollide,
  forceManyBody,
  forceRadial,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import { useEffect, useRef } from "react";
import { buildLinks, buildNodes, CENTER_ID } from "./graphData";

export function useForceSimulation(size, reduced, stats) {
  const handleRef = useRef({ nodes: [], links: [], sim: null });

  if (handleRef.current.nodes.length === 0 && stats.length > 0) {
    const nodes = buildNodes(stats);
    handleRef.current = { nodes, links: buildLinks(nodes), sim: null };
  }

  useEffect(() => {
    const handle = handleRef.current;
    const { nodes } = handle;
    if (!size.width || !size.height) return;

    const half = Math.min(size.width, size.height) / 2;
    const center = nodes.find((node) => node.id === CENTER_ID);
    center.fx = 0;
    center.fy = 0;

    const sim = forceSimulation(nodes)
      .force(
        "charge",
        forceManyBody().strength((d) => (d.isCenter ? -260 : -90)),
      )
      .force(
        "radial",
        forceRadial((d) => d.orbit * half, 0, 0).strength((d) =>
          d.isCenter ? 0 : 0.42,
        ),
      )
      .force("collide", forceCollide((d) => d.radius + 16).strength(0.8))
      .force("x", forceX(0).strength(0.02))
      .force("y", forceY(0).strength(0.02))
      .alphaDecay(0.02);

    if (reduced) {
      sim.stop();
      sim.tick(220);
    } else {
      sim.alpha(0.9).alphaTarget(0.02).restart();
    }

    handle.sim = sim;
    return () => {
      sim.stop();
      handle.sim = null;
    };
  }, [size.width, size.height, reduced]);

  return handleRef;
}
