import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/components/dashboard/shared/store";
import {
  DashboardButton,
  EmptyState,
  Field,
  DashboardGlassCard,
  DashboardLabel,
  SectionTitle,
  StatusPill,
  inputClass,
} from "@/components/dashboard/shared/primitives";
import { toneForLevel } from "@/components/dashboard/shared/ToleranceMeter";
import { listContainer, listItem, pageMotion } from "@/lib/motion";

const groups = [
  {
    kind: "early_advocacy",
    title: "Early advocacy requests",
    subtitle: "A mentor wants to open advocacy before four logged weeks",
  },
  {
    kind: "termination",
    title: "Relationship termination requests",
    subtitle: "Ending a relationship at tolerance 0 to 2 needs your decision",
  },
  {
    kind: "verification",
    title: "Mentor verification requests",
    subtitle: "Review the submitted credentials",
  },
];

function ApprovalItem({ item }) {
  const { decideApproval } = useStore();
  const [note, setNote] = useState("");

  return (
    <motion.li variants={listItem} className="rounded-[20px] border border-[var(--hairline)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">
          {item.mentor}
          {item.mentee ? ` → ${item.mentee}` : ""}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{item.date}</span>
          <StatusPill
            tone={
              item.status === "pending" ? "caution" : item.status === "approved" ? "positive" : "negative"
            }
          >
            {item.status}
          </StatusPill>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {typeof item.weeksLogged === "number" ? (
          <StatusPill tone="neutral">{item.weeksLogged} weeks logged</StatusPill>
        ) : null}
        {typeof item.toleranceLevel === "number" ? (
          <StatusPill tone={toneForLevel(item.toleranceLevel)}>
            Tolerance {item.toleranceLevel}
          </StatusPill>
        ) : null}
      </div>

      <p className="mt-3 text-sm">{item.justification}</p>

      {item.credentials?.length ? (
        <ul className="mt-3 space-y-2">
          {item.credentials.map((c) => (
            <li key={c} className="rounded-[12px] bg-[var(--surface-soft)] p-2.5 text-sm">
              {c}
            </li>
          ))}
        </ul>
      ) : null}

      {item.toleranceHistory?.length ? (
        <div className="mt-3">
          <DashboardLabel>Tolerance history</DashboardLabel>
          <ul className="mt-2 space-y-2">
            {item.toleranceHistory.map((t) => (
              <li key={t.id} className="rounded-[12px] bg-[var(--surface-soft)] p-3 text-sm">
                <span className="font-medium">Level {t.level}</span> · {t.category} · {t.date}
                <p className="mt-1 text-muted-foreground">{t.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {item.status === "pending" ? (
        <div className="mt-4 space-y-3">
          <Field label="Admin note" hint="Stored with the decision and shared with the mentor">
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
              placeholder="Why you decided this way"
            />
          </Field>
          <div className="flex gap-2">
            <DashboardButton onClick={() => decideApproval(item.id, true, note)}>Approve</DashboardButton>
            <DashboardButton variant="danger" onClick={() => decideApproval(item.id, false, note)}>
              Reject
            </DashboardButton>
          </div>
        </div>
      ) : item.adminNote ? (
        <p className="mt-3 text-sm text-muted-foreground">Admin note: {item.adminNote}</p>
      ) : null}
    </motion.li>
  );
}

export function AdminApprovals() {
  const { approvals } = useStore();

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <div>
        <DashboardLabel>Approvals</DashboardLabel>
        <h1 className="mt-1 font-display text-2xl font-semibold">Decisions waiting on you</h1>
      </div>

      {groups.map((g) => {
        const items = approvals.filter((a) => a.kind === g.kind);
        return (
          <DashboardGlassCard key={g.kind}>
            <SectionTitle title={g.title} subtitle={g.subtitle} />
            {items.length === 0 ? (
              <EmptyState
                icon={<ShieldCheck size={20} />}
                title="Nothing here"
                body="This queue is empty right now."
              />
            ) : (
              <motion.ul variants={listContainer} initial="initial" animate="animate" className="space-y-3">
                {items.map((item) => (
                  <ApprovalItem key={item.id} item={item} />
                ))}
              </motion.ul>
            )}
          </DashboardGlassCard>
        );
      })}
    </motion.div>
  );
}
