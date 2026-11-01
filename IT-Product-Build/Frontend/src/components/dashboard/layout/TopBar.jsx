import { useStore } from "@/components/dashboard/shared/store";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";

const titles = {
  overview: "Overview",
  matching: "Matching",
  planner: "Weekly Planner",
  chat: "Chat",
  advocacy: "My Advocacy",
  settings: "Settings",
  mentees: "Mentees",
  mentors: "Mentors",
  "mentee-detail": "Mentee Detail",
  "advocacy-requests": "Advocacy Requests",
  relationships: "Relationships",
  approvals: "Approvals",
  help: "Help Inbox",
};

export function TopBar({ theme, onToggleTheme, onOpenMenu }) {
  const { role, view } = useStore();

  return (
    <header className="glass mb-6 flex items-center gap-3 rounded-[24px] px-4 py-3 pr-4">
      <button
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="rounded-full p-2 text-muted-foreground hover:text-foreground lg:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="min-w-0 flex-1">
        <span className="label-caps">{role} workspace</span>
        <h1 className="truncate font-display text-lg font-semibold">
          {titles[view] ?? "Overview"}
        </h1>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-[var(--hairline)] px-3 py-1.5 md:flex">
        <Search size={14} className="text-muted-foreground" />
        <input
          placeholder="Search"
          className="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <button
        aria-label="Notifications"
        className="rounded-full p-2 text-muted-foreground hover:text-foreground"
      >
        <Bell size={18} />
      </button>

      <button
        onClick={onToggleTheme}
        aria-label="Toggle theme"
        className="rounded-full p-2 text-muted-foreground hover:text-foreground"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
