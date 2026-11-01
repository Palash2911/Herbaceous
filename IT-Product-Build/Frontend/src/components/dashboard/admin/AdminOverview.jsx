import { motion } from "framer-motion";
import { BadgeCheck, Inbox, ShieldCheck, Users, UsersRound } from "lucide-react";
import { useStore } from "@/components/dashboard/shared/store";
import { adminActivity, adminMentees, adminMentors, adminRelationships } from "@/content/dashboard/admin-data";
import { KpiCard } from "@/components/dashboard/shared/KpiCard";
import {
  DashboardButton,
  EmptyState,
  DashboardGlassCard,
  DashboardLabel,
  SectionTitle,
  StatusPill,
} from "@/components/dashboard/shared/primitives";
import { listContainer, listItem, pageMotion } from "@/lib/motion";

const kindLabel = {
  early_advocacy: "Early advocacy",
  termination: "Relationship termination",
  verification: "Mentor verification",
};

export function AdminOverview() {
  const { approvals, tickets, setView } = useStore();
  const pending = approvals.filter((a) => a.status === "pending");
  const openTickets = tickets.filter((t) => t.status !== "resolved");

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <div>
        <DashboardLabel>Platform</DashboardLabel>
        <h1 className="mt-1 font-display text-2xl font-semibold">Herbaceous at a glance</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard index={0} label="Total mentees" value={adminMentees.length} icon={Users} tone="neutral" />
        <KpiCard index={1} label="Total mentors" value={adminMentors.length} icon={BadgeCheck} tone="neutral" />
        <KpiCard
          index={2}
          label="Active relationships"
          value={adminRelationships.filter((r) => r.status === "active").length}
          icon={UsersRound}
          tone="positive"
        />
        <KpiCard index={3} label="Pending approvals" value={pending.length} icon={ShieldCheck} tone="caution" />
        <KpiCard index={4} label="Open help tickets" value={openTickets.length} icon={Inbox} tone={openTickets.length ? "caution" : "positive"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardGlassCard>
          <SectionTitle
            title="Approvals queue"
            subtitle="Highest priority first"
            action={
              <DashboardButton variant="outline" onClick={() => setView("approvals")}>
                Open queue
              </DashboardButton>
            }
          />
          {pending.length === 0 ? (
            <EmptyState title="Queue is clear" body="Nothing is waiting on an admin decision." />
          ) : (
            <motion.ul variants={listContainer} initial="initial" animate="animate" className="space-y-2">
              {pending.slice(0, 4).map((a) => (
                <motion.li
                  key={a.id}
                  variants={listItem}
                  className="rounded-[16px] border border-[var(--hairline)] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusPill tone={a.kind === "termination" ? "negative" : "caution"}>
                      {kindLabel[a.kind]}
                    </StatusPill>
                    <span className="text-xs text-muted-foreground">{a.date}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    {a.mentor}
                    {a.mentee ? ` · ${a.mentee}` : ""}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.justification}</p>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </DashboardGlassCard>

        <DashboardGlassCard>
          <SectionTitle title="Recent platform activity" />
          <ul className="space-y-2">
            {adminActivity.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-[12px] border border-[var(--hairline)] px-3 py-2.5"
              >
                <span className="text-sm">{a.text}</span>
                <StatusPill tone={a.tone}>{a.time}</StatusPill>
              </li>
            ))}
          </ul>
        </DashboardGlassCard>
      </div>
    </motion.div>
  );
}
