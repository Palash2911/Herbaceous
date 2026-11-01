import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/components/dashboard/shared/store";
import {
  DashboardAvatar,
  DashboardButton,
  Chip,
  EmptyState,
  Field,
  DashboardGlassCard,
  DashboardLabel,
  StatusPill,
  inputClass,
} from "@/components/dashboard/shared/primitives";
import { Modal } from "@/components/dashboard/shared/Modal";
import { listContainer, listItem, pageMotion } from "@/lib/motion";

const statusLabel = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};
const statusTone = { open: "caution", in_progress: "neutral", resolved: "positive" };

export function HelpInbox() {
  const { tickets, updateTicket } = useStore();
  const [open, setOpen] = useState(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("open");

  const openTicket = (t) => {
    setOpen(t);
    setReply(t.reply ?? "");
    setStatus(t.status);
  };

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <div>
        <DashboardLabel>Support</DashboardLabel>
        <h1 className="mt-1 font-display text-2xl font-semibold">Help inbox</h1>
      </div>

      <DashboardGlassCard>
        {tickets.length === 0 ? (
          <EmptyState icon={<Inbox size={20} />} title="No tickets" body="Nothing has been reported." />
        ) : (
          <motion.ul variants={listContainer} initial="initial" animate="animate" className="space-y-2">
            {tickets.map((t) => (
              <motion.li key={t.id} variants={listItem}>
                <button
                  onClick={() => openTicket(t)}
                  className="flex w-full flex-wrap items-center gap-3 rounded-[16px] border border-[var(--hairline)] px-4 py-3 text-left transition-colors hover:bg-[var(--surface-soft)]"
                >
                  <DashboardAvatar initials={t.sender.split(" ").map((n) => n[0]).join("")} size={36} />
                  <div className="min-w-[160px] flex-1">
                    <p className="text-sm font-medium">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.sender} · {t.role}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{t.date}</span>
                  <StatusPill tone={statusTone[t.status]}>{statusLabel[t.status]}</StatusPill>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </DashboardGlassCard>

      <Modal
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.subject ?? ""}
        consequence="On save, your reply is emailed to the sender and the ticket status is updated for the whole admin team."
        footer={
          <>
            <DashboardButton variant="outline" onClick={() => setOpen(null)}>
              Cancel
            </DashboardButton>
            <DashboardButton
              onClick={() => {
                if (open) updateTicket(open.id, { reply, status });
                setOpen(null);
              }}
            >
              Save reply
            </DashboardButton>
          </>
        }
      >
        <div className="rounded-[16px] border border-[var(--hairline)] p-4">
          <p className="text-sm font-medium">
            {open?.sender} · {open?.role}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{open?.message}</p>
        </div>
        <div>
          <DashboardLabel>Status</DashboardLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.keys(statusLabel).map((s) => (
              <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
                {statusLabel[s]}
              </Chip>
            ))}
          </div>
        </div>
        <Field label="Reply">
          <textarea
            rows={4}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className={inputClass}
            placeholder="Write your response"
          />
        </Field>
      </Modal>
    </motion.div>
  );
}
