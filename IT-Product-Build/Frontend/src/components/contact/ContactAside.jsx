import { Mail, MapPin, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Eyebrow } from "@/components/ui/Eyebrow";

const details = [
  { icon: Mail, label: "Email", value: "hello@herbaceous.org" },
  { icon: MapPin, label: "Based", value: "Melbourne · Remote worldwide" },
  { icon: Clock, label: "Response", value: "Within two working days" },
];

export function ContactAside() {
  return (
    <GlassCard className="flex h-full flex-col gap-8 p-8">
      <div>
        <Eyebrow tone="teal">Talk to a human</Eyebrow>
        <h2 className="mt-4 font-display text-2xl leading-snug font-semibold">
          Whether you want a mentor, want to be one, or want to fund the programme: same form.
        </h2>
      </div>

      <ul className="flex flex-col gap-5">
        {details.map((detail) => (
          <li key={detail.label} className="flex items-start gap-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-accent">
              <detail.icon size={16} />
            </span>
            <span className="flex flex-col">
              <span className="label-mono text-muted">{detail.label}</span>
              <span className="mt-1 text-sm">{detail.value}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-auto border-t border-[color:var(--border)] pt-6 text-sm text-muted">
        Every message is read by a member of the programme team, not a queue.
      </p>
    </GlassCard>
  );
}
