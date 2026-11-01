import {
  BadgeCheck,
  CalendarCheck,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  MessageSquare,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  UsersRound,
} from "lucide-react";

export const navConfig = {
  mentee: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "matching", label: "Matching", icon: Sparkles },
    {
      id: "checkin",
      label: "Weekly Check-in",
      icon: CalendarCheck,
      children: [
        { id: "planner", label: "Weekly Planner", icon: CalendarCheck },
        { id: "chat", label: "Chat", icon: MessageSquare },
      ],
    },
    { id: "advocacy", label: "My Advocacy", icon: Megaphone },
    { id: "settings", label: "Settings", icon: Settings },
  ],
  mentor: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "mentees", label: "My Mentees", icon: UsersRound },
    {
      id: "checkin",
      label: "Weekly Check-in",
      icon: CalendarCheck,
      children: [{ id: "chat", label: "Chat", icon: MessageSquare }],
    },
    { id: "advocacy-requests", label: "Advocacy Requests", icon: Megaphone },
    { id: "settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "mentees", label: "Mentees", icon: Users },
    { id: "mentors", label: "Mentors", icon: BadgeCheck },
    { id: "relationships", label: "Relationships", icon: UsersRound },
    { id: "approvals", label: "Approvals", icon: ShieldCheck },
    { id: "help", label: "Help Inbox", icon: Inbox },
    { id: "settings", label: "Settings", icon: Settings },
  ],
};

export const helpIcon = LifeBuoy;
