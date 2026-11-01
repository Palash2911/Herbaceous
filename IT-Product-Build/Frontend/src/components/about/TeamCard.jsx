import { GlassCard } from "@/components/ui/GlassCard";
import { softSpring } from "@/lib/motion";
import { motion } from "framer-motion";

const toneVar = {
  accent: "var(--accent)",
  coral: "var(--coral)",
  teal: "var(--teal)",
  amber: "var(--amber)",
};

export function TeamCard({ member }) {
  const color = toneVar[member.tone];

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={softSpring}
      className="h-full"
    >
      <GlassCard className="flex h-full flex-col gap-4 p-6">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full font-display text-lg font-semibold"
          style={{
            background: `color-mix(in oklab, ${color} 22%, transparent)`,
            color,
            border: `1px solid color-mix(in oklab, ${color} 45%, transparent)`,
          }}
          aria-hidden
        >
          {member.photo ? (
            <img
              src={member.photo}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            member.initials
          )}
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">{member.name}</h3>
          <p className="label-mono mt-1" style={{ color }}>
            {member.role}
          </p>
        </div>
        {member.focus ? (
          <p className="text-sm leading-relaxed text-muted">{member.focus}</p>
        ) : null}
      </GlassCard>
    </motion.div>
  );
}
