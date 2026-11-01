import {
  Chip,
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
  EmptyState,
} from "@/components/dashboard/shared/primitives";
import { useStore } from "@/components/dashboard/shared/store";
import { useMentorMentees } from "@/hooks/useMentorMentees";
import { listContainer, listItem, pageMotion } from "@/lib/motion";
import { motion } from "framer-motion";
import { useState } from "react";
import { MenteeRow } from "./MenteeRow";
import { DashboardLoader } from "@/components/dashboard/shared/DashboardLoader";

const TABS = [
  {
    id: "current",
    label: "Current",
    status: undefined,
    emptyTitle: "No mentees yet",
    emptyBody: "Accepted mentorship requests appear here.",
  },
  {
    id: "ended",
    label: "Ended",
    status: "ENDED",
    emptyTitle: "No ended mentorships",
    emptyBody: "Mentorships you end will appear here.",
  },
];

export function MyMentees() {
  const { openMenteeDetail } = useStore();
  const [tabId, setTabId] = useState("current");
  const tab = TABS.find((t) => t.id === tabId);
  const { mentees, loading, error, refetch } = useMentorMentees(tab.status);

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <div>
        <DashboardLabel>My mentees</DashboardLabel>
        <h1 className="mt-1 font-display text-2xl font-semibold">
          Everyone you are mentoring
        </h1>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <Chip
            key={t.id}
            active={t.id === tabId}
            onClick={() => setTabId(t.id)}
          >
            {t.label}
          </Chip>
        ))}
      </div>

      <DashboardGlassCard>
        {error ? (
          <EmptyState
            title="Couldn't load your mentees"
            body="Something went wrong reaching the server."
            action={
              <DashboardButton variant="outline" onClick={refetch}>
                Try again
              </DashboardButton>
            }
          />
        ) : loading ? (
          <DashboardLoader label="Loading your mentees..." />
        ) : mentees.length === 0 ? (
          <EmptyState title={tab.emptyTitle} body={tab.emptyBody} />
        ) : (
          <motion.ul
            key={tab.id}
            variants={listContainer}
            initial="initial"
            animate="animate"
            className="space-y-2"
          >
            {mentees.map((m) => (
              <motion.li key={m.id} variants={listItem}>
                <MenteeRow mentorship={m} onOpen={() => openMenteeDetail(m.id)} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </DashboardGlassCard>
    </motion.div>
  );
}
