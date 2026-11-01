import { Handshake, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function countLabel(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`;
}

export function TrackRecordStats({ mentor, className }) {
  const mentees = mentor?.menteesMentored ?? 0;
  const advocacy = mentor?.advocacyGiven ?? 0;

  const stats = [
    {
      key: "mentees",
      icon: Users,
      label: countLabel(mentees, "mentee mentored", "mentees mentored"),
    },
    {
      key: "advocacy",
      icon: Handshake,
      label: countLabel(
        advocacy,
        "advocacy request fulfilled",
        "advocacy requests fulfilled",
      ),
    },
  ];

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {stats.map(({ key, icon: Icon, label }) => (
        <li
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs text-foreground"
        >
          <Icon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
