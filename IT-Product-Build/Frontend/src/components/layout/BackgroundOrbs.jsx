const ORBS = [
  {
    token: "--accent",
    size: 620,
    top: "-12%",
    left: "-10%",
    duration: "34s",
    delay: "0s",
    strength: 42,
  },
  {
    token: "--teal",
    size: 520,
    top: "18%",
    left: "62%",
    duration: "42s",
    delay: "-8s",
    strength: 34,
  },
  {
    token: "--coral",
    size: 560,
    top: "58%",
    left: "-6%",
    duration: "38s",
    delay: "-16s",
    strength: 30,
  },
  {
    token: "--amber",
    size: 480,
    top: "72%",
    left: "58%",
    duration: "46s",
    delay: "-24s",
    strength: 28,
  },
];

export function BackgroundOrbs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ mixBlendMode: "var(--orb-blend)" }}
    >
      {ORBS.map((orb, index) => (
        <div
          key={orb.token}
          className="absolute rounded-full will-change-transform"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(closest-side, color-mix(in oklab, var(${orb.token}) ${orb.strength}%, transparent) 0%, color-mix(in oklab, var(${orb.token}) ${Math.round(orb.strength * 0.55)}%, transparent) 38%, color-mix(in oklab, var(${orb.token}) ${Math.round(orb.strength * 0.2)}%, transparent) 64%, transparent 100%)`,
            animation: `orb-drift-${index % 2} ${orb.duration} ease-in-out ${orb.delay} infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes orb-drift-0 {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(6vw,4vh,0) scale(1.08); }
          100% { transform: translate3d(-4vw,7vh,0) scale(0.96); }
        }
        @keyframes orb-drift-1 {
          0% { transform: translate3d(0,0,0) scale(1.04); }
          50% { transform: translate3d(-7vw,-5vh,0) scale(0.94); }
          100% { transform: translate3d(5vw,-8vh,0) scale(1.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-orb-layer] > div { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
