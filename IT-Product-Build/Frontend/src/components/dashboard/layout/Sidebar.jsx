import HerbaceousDarkText from "@/assets/Herbaceous-Dark-Text.svg";
import HerbaceousLightText from "@/assets/Herbaceous-Light-Text.svg";
import { HelpModal } from "@/components/dashboard/shared/HelpModal";
import { LogoutModal } from "@/components/dashboard/shared/LogoutModal";
import {
  DashboardAvatar,
  DashboardButton,
} from "@/components/dashboard/shared/primitives";
import { useStore } from "@/components/dashboard/shared/store";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LifeBuoy, LogOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { navConfig } from "./nav-config";

const roleLabels = {
  mentee: "Mentee",
  mentor: "Mentor",
  admin: "Platform Admin",
};

function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Sidebar({ onNavigate }) {
  const { role, view, setView, displayName } = useStore();
  const items = navConfig[role];
  const [expanded, setExpanded] = useState("checkin");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const closeHelp = useCallback(() => setHelpOpen(false), []);
  const canGetHelp = role === "mentee" || role === "mentor";
  const profile = {
    name: displayName || "Member",
    initials: getInitials(displayName),
    sub: roleLabels[role] ?? role,
  };

  useEffect(() => {
    setExpanded("checkin");
  }, [role]);

  const go = (id) => {
    setView(id);
    onNavigate?.();
  };

  return (
    <nav className="glass flex h-full w-[250px] shrink-0 flex-col rounded-[26px] p-4">
      <div className="mb-6 flex flex-col items-start px-2 pt-2">
        <img
          src={HerbaceousLightText}
          alt="Herbaceous"
          className="h-13 w-auto dark:hidden"
        />
        <img
          src={HerbaceousDarkText}
          alt="Herbaceous"
          className="hidden h-13 w-auto dark:block"
        />
        {/* <span className="label-caps">Women in STEM</span> */}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto scroll-thin">
        {items.map((item) => {
          const childActive = item.children?.some((c) => c.id === view);
          const active = view === item.id || Boolean(childActive);
          const Icon = item.icon;
          const isOpen = expanded === item.id;
          return (
            <div key={item.id}>
              <button
                onClick={() =>
                  item.children
                    ? setExpanded(isOpen ? null : item.id)
                    : go(item.id)
                }
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-[14px] bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                ) : null}
                <Icon size={17} className="relative" />
                <span className="relative flex-1 text-left">{item.label}</span>
                {item.children ? (
                  <ChevronDown
                    size={15}
                    className={cn(
                      "relative transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                ) : null}
              </button>

              <AnimatePresence initial={false}>
                {item.children && isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-5 mt-1 space-y-1 border-l border-[var(--hairline)] pl-3">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => go(child.id)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-sm transition-colors",
                            view === child.id
                              ? "text-accent"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                          style={
                            view === child.id
                              ? {
                                  background:
                                    "color-mix(in srgb, var(--accent) 14%, transparent)",
                                }
                              : undefined
                          }
                        >
                          <child.icon size={14} />
                          {child.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {canGetHelp ? (
        <DashboardButton
          variant="outline"
          onClick={() => setHelpOpen(true)}
          aria-haspopup="dialog"
          className="mt-4 justify-start"
        >
          <LifeBuoy size={15} aria-hidden="true" />
          Help
        </DashboardButton>
      ) : null}

      <DashboardButton
        variant="danger"
        onClick={() => setLogoutOpen(true)}
        className={cn(
          canGetHelp ? "mt-2" : "mt-4",
          "justify-start bg-coral/10 border-coral/30 hover:bg-coral/20",
        )}
      >
        <LogOut size={15} />
        Log out
      </DashboardButton>

      <div className="mt-2 flex items-center gap-3 rounded-[16px] border border-[var(--hairline)] p-3">
        <DashboardAvatar initials={profile.initials} size={38} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{profile.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {profile.sub}
          </p>
        </div>
      </div>

      <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
      {canGetHelp ? <HelpModal open={helpOpen} onClose={closeHelp} /> : null}
    </nav>
  );
}
