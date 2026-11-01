import { cn } from "@/lib/utils";

export function GlassCard({ children, className, as: Tag = "div" }) {
  return <Tag className={cn("glass-card", className)}>{children}</Tag>;
}
