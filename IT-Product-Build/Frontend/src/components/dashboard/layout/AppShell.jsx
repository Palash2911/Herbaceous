import { AdminApprovals } from "@/components/dashboard/admin/AdminApprovals";
import { AdminMentees } from "@/components/dashboard/admin/AdminMentees";
import { AdminMentors } from "@/components/dashboard/admin/AdminMentors";
import { AdminOverview } from "@/components/dashboard/admin/AdminOverview";
import { AdminRelationships } from "@/components/dashboard/admin/AdminRelationships";
import { HelpInbox } from "@/components/dashboard/admin/HelpInbox";
import { Chat } from "@/components/dashboard/mentee/Chat";
import { Matching } from "@/components/dashboard/mentee/Matching";
import { MenteeOverview } from "@/components/dashboard/mentee/MenteeOverview";
import { MyAdvocacy } from "@/components/dashboard/mentee/MyAdvocacy";
import { MyMentor } from "@/components/dashboard/mentee/MyMentor";
import { WeeklyPlanner } from "@/components/dashboard/mentee/WeeklyPlanner";
import { MenteeDetail } from "@/components/dashboard/mentor/MenteeDetail";
import { MentorAdvocacyRequests } from "@/components/dashboard/mentor/MentorAdvocacyRequests";
import { MentorOverview } from "@/components/dashboard/mentor/MentorOverview";
import { MyMentees } from "@/components/dashboard/mentor/MyMentees";
import { SettingsScreen } from "@/components/dashboard/shared/SettingsScreen";
import { useStore } from "@/components/dashboard/shared/store";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/useTheme";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { DashboardBootLoader } from "./DashboardBootLoader";
import { DashboardOrbs } from "./DashboardOrbs";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const BANNER_DISMISSED_KEY = "herbaceous:first-login-banner-dismissed";

function PasswordReminderBanner({ onOpenSettings }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(BANNER_DISMISSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    } catch {
      // No persistence available — the banner just reappears next visit.
    }
  };

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-[16px] border border-[var(--hairline)] bg-[var(--card)] px-4 py-3 text-sm">
      <p>
        Using your generated login password?{" "}
        <button
          type="button"
          onClick={onOpenSettings}
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          Change it in Settings
        </button>
        .
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-text"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function AppShell() {
  const { role, roleLoading, view, setView } = useStore();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  if (roleLoading) return <DashboardBootLoader />;

  const renderView = () => {
    if (view === "settings")
      return <SettingsScreen theme={theme} onToggleTheme={toggle} />;
    if (role === "mentee") {
      switch (view) {
        case "matching":
          return <Matching />;
        case "planner":
          return <WeeklyPlanner />;
        case "chat":
          return <Chat />;
        case "advocacy":
          return <MyAdvocacy />;
        case "my-mentor":
          return <MyMentor />;
        default:
          return <MenteeOverview />;
      }
    }
    if (role === "mentor") {
      switch (view) {
        case "mentees":
          return <MyMentees />;
        case "mentee-detail":
          return <MenteeDetail />;
        case "chat":
          return <Chat />;
        case "advocacy-requests":
          return <MentorAdvocacyRequests />;
        default:
          return <MentorOverview />;
      }
    }
    switch (view) {
      case "mentees":
        return <AdminMentees />;
      case "mentors":
        return <AdminMentors />;
      case "relationships":
        return <AdminRelationships />;
      case "approvals":
        return <AdminApprovals />;
      case "help":
        return <HelpInbox />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardOrbs />
      <Toaster />
      {/* <RoleSwitcher /> */}

      <div className="flex min-h-screen gap-7 p-7">
        <div className="sticky top-7 hidden h-[calc(100vh-56px)] lg:block">
          <Sidebar />
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              className="fixed inset-0 z-80 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 340, damping: 34 }}
                className="absolute left-4 top-4 h-[calc(100vh-32px)] overflow-hidden rounded-[28px] bg-background shadow-2xl [&_nav]:bg-card [&_nav]:backdrop-blur-none"
              >
                <Sidebar onNavigate={() => setMenuOpen(false)} />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main className="min-w-0 flex-1">
          <TopBar
            theme={theme}
            onToggleTheme={toggle}
            onOpenMenu={() => setMenuOpen(true)}
          />
          <PasswordReminderBanner onOpenSettings={() => setView("settings")} />
          <AnimatePresence mode="wait">
            <div key={`${role}-${view}`}>{renderView()}</div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
