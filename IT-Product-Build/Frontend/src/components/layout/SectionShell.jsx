import { cn } from "@/lib/utils";

export function SectionShell({ children, className, id, width = "default" }) {
  const max = {
    default: "max-w-6xl",
    wide: "max-w-7xl",
    narrow: "max-w-3xl",
  }[width];

  return (
    <section id={id} className={cn("relative px-6 py-16 sm:py-24", className)}>
      <div className={cn("mx-auto w-full", max)}>{children}</div>
    </section>
  );
}
