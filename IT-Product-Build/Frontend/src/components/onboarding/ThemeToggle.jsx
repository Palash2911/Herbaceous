import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid size-[40px] place-items-center rounded-full border bg-[var(--field-bg)]/70 text-muted-foreground transition-colors hover:text-foreground focus-visible:focus-visible-ring"
    >
      {dark ? <Moon className="size-[17px]" aria-hidden /> : <Sun className="size-[17px]" aria-hidden />}
    </button>
  );
}
