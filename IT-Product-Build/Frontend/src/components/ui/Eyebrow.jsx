import { cn } from "@/lib/utils";

export function Eyebrow({ children, className, tone = "accent" }) {
  const toneClass = {
    accent: "text-accent",
    coral: "text-coral",
    teal: "text-teal",
    amber: "text-amber",
    muted: "text-muted",
  }[tone];

  return (
    <span className={cn("label-mono inline-flex items-center gap-2", toneClass, className)}>
      <span aria-hidden className="h-px w-6 bg-current opacity-60" />
      {children}
    </span>
  );
}
