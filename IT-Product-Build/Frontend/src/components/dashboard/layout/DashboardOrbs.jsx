const orbs = [
  {
    style: { top: "-8%", left: "-6%", width: "46vw", height: "46vw" },
    color: "var(--orb-1)",
  },
  {
    style: { top: "18%", right: "-10%", width: "52vw", height: "52vw" },
    color: "var(--orb-2)",
  },
  {
    style: { bottom: "-14%", left: "12%", width: "48vw", height: "48vw" },
    color: "var(--orb-3)",
  },
  {
    style: { bottom: "4%", right: "6%", width: "38vw", height: "38vw" },
    color: "var(--orb-4)",
  },
];

export function DashboardOrbs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            ...orb.style,
            backgroundImage: `radial-gradient(circle at 50% 50%, ${orb.color} 0%, color-mix(in srgb, ${orb.color} 62%, transparent) 28%, color-mix(in srgb, ${orb.color} 26%, transparent) 52%, color-mix(in srgb, ${orb.color} 8%, transparent) 72%, transparent 100%)`,
          }}
        />
      ))}
    </div>
  );
}
