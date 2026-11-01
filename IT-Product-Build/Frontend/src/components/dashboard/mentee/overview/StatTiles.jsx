import {
  AnimatedNumber,
  RadialRing,
  Sparkline,
  StatusPill,
} from "@/components/dashboard/mentee/primitives";
import {
  DashboardGlassCard,
  DashboardLabel,
} from "@/components/dashboard/shared/primitives";
import { DashboardLoader } from "@/components/dashboard/shared/DashboardLoader";
import { useStore } from "@/components/dashboard/shared/store";
import { Activity, CalendarCheck, Megaphone, Target } from "lucide-react";

const JOURNEY_LABELS = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  NONE: "No mentorship",
};

function Tile({ icon, label, children, visual }) {
  return (
    <DashboardGlassCard
      data-reveal
      className="glass-hover flex min-h-36 items-center justify-between gap-5 p-6"
    >
      <div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <DashboardLabel>{label}</DashboardLabel>
        </div>
        <div className="mt-3 font-display text-3xl font-extrabold">
          {children}
        </div>
      </div>
      {visual}
    </DashboardGlassCard>
  );
}

export function StatTiles() {
  const { overview, overviewLoading } = useStore();

  if (overviewLoading || !overview) {
    return (
      <DashboardGlassCard data-reveal>
        <DashboardLoader label="Loading your stats..." />
      </DashboardGlassCard>
    );
  }

  const weeksTrend = overview.recentWeeks.map((w) =>
    w.status === "done" ? 1 : 0,
  );
  const journeyLabel =
    JOURNEY_LABELS[overview.journeyStatus] ?? overview.journeyStatus;

  return (
    <div className="grid grid-cols-4 gap-6 max-xl:grid-cols-2 max-sm:grid-cols-1">
      <Tile
        icon={<CalendarCheck className="h-4 w-4" />}
        label="Weeks logged"
        visual={
          weeksTrend.length >= 2 ? (
            <Sparkline
              data={weeksTrend}
              color="var(--teal)"
              width={112}
              height={48}
            />
          ) : null
        }
      >
        <AnimatedNumber value={overview.weeksLogged} />
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          total
        </span>
      </Tile>

      <Tile
        icon={<Target className="h-4 w-4" />}
        label="Match quality"
        visual={
          <RadialRing
            value={overview.matchScore ?? 0}
            size={76}
            stroke={7}
            color="var(--accent)"
          >
            <span className="font-mono text-sm font-semibold">
              {overview.matchScore ?? "—"}
            </span>
          </RadialRing>
        }
      >
        <AnimatedNumber value={overview.matchScore ?? 0} />
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          / 100
        </span>
      </Tile>

      <Tile icon={<Megaphone className="h-4 w-4" />} label="Advocacy requests">
        <AnimatedNumber value={overview.activeAdvocacyCount} />
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          active
        </span>
      </Tile>

      <Tile
        icon={<Activity className="h-4 w-4" />}
        label="Journey status"
        visual={
          <StatusPill
            tone={overview.journeyStatus === "ACTIVE" ? "teal" : "amber"}
          >
            {journeyLabel}
          </StatusPill>
        }
      >
        <span className="text-xl">{journeyLabel}</span>
      </Tile>
    </div>
  );
}
