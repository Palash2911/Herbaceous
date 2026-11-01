import { motion } from "framer-motion";
import { Megaphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/components/dashboard/shared/store";
import {
  Chip,
  DashboardAvatar,
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
  EmptyState,
  Field,
  StatusPill,
  inputClass,
} from "@/components/dashboard/shared/primitives";
import { useAdvocacyInbox } from "@/hooks/useAdvocacyInbox";
import { handleApiError } from "@/lib/handleApiError";
import { listContainer, listItem, pageMotion } from "@/lib/motion";
import { respondToAdvocacy } from "@/services/mentorService";
import {
  ADVOCACY_TONE,
  advocacyStatusLabel,
  advocacyTypeLabel,
  formatDate,
  initialsOf,
  mentorshipStatus,
} from "./mentorDisplay";
import { DashboardPanelLoader } from "@/components/dashboard/shared/DashboardLoader";

const MAX_RESPONSE_NOTE = 500;

const FILTERS = [
  { id: "all", label: "All", status: undefined, emptyTitle: "No advocacy requests", emptyBody: "Requests from your mentees will land here." },
  { id: "pending", label: "Pending", status: "PENDING", emptyTitle: "No pending requests", emptyBody: "New requests will appear here." },
  { id: "accepted", label: "Accepted", status: "ACCEPTED", emptyTitle: "Nothing waiting on an outcome", emptyBody: "Requests you accept will appear here until marked done." },
  { id: "declined", label: "Declined", status: "DECLINED", emptyTitle: "No declined requests", emptyBody: "Requests you decline will appear here." },
  { id: "done", label: "Done", status: "DONE", emptyTitle: "No done requests", emptyBody: "Requests you mark done will appear here." },
  { id: "closed", label: "Closed", status: "CLOSED", emptyTitle: "No closed requests", emptyBody: "Requests closed by ending a mentorship will appear here." },
];

export function MentorAdvocacyRequests() {
  const { openMenteeDetail, refetchMentorOverview } = useStore();
  const [filterId, setFilterId] = useState("all");
  const [includeEnded, setIncludeEnded] = useState(false);
  const filter = FILTERS.find((f) => f.id === filterId);
  const { requests, loading, error, refetch } = useAdvocacyInbox(filter.status, includeEnded);

  const [notes, setNotes] = useState({});
  const [resolvingId, setResolvingId] = useState(null);

  const setNoteFor = (id, value) => setNotes((m) => ({ ...m, [id]: value }));

  const respond = async (request, action) => {
    setResolvingId(request.id);
    try {
      const note = notes[request.id]?.trim() || undefined;
      await respondToAdvocacy(request.mentorshipId, request.id, action, note);
      const label =
        action === "ACCEPT" ? "accepted" : action === "DECLINE" ? "declined" : "marked done";
      toast.success(`Advocacy request ${label}`);
      setNoteFor(request.id, "");
      await Promise.all([refetch(), refetchMentorOverview()]);
    } catch (err) {
      handleApiError(err, "Couldn't respond to that request");
      await refetch();
    } finally {
      setResolvingId(null);
    }
  };

  const viewMentee = (request) => {
    openMenteeDetail(request.mentorshipId);
  };

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <div>
        <DashboardLabel>Advocacy</DashboardLabel>
        <h1 className="mt-1 font-display text-2xl font-semibold">Incoming advocacy requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accept or decline. There is no counter offer, keep the conversation in chat.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={f.id === filterId} onClick={() => setFilterId(f.id)}>
            {f.label}
          </Chip>
        ))}
        <Chip active={includeEnded} onClick={() => setIncludeEnded((v) => !v)}>
          Include ended
        </Chip>
      </div>

      {error ? (
        <DashboardGlassCard>
          <EmptyState
            title="Couldn't load advocacy requests"
            body="Something went wrong reaching the server."
            action={
              <DashboardButton variant="outline" onClick={refetch}>
                Try again
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : loading ? (
        <DashboardPanelLoader label="Loading advocacy requests..." />
      ) : requests.length === 0 ? (
        <DashboardGlassCard>
          <EmptyState icon={<Megaphone size={20} />} title={filter.emptyTitle} body={filter.emptyBody} />
        </DashboardGlassCard>
      ) : (
        <motion.ul variants={listContainer} initial="initial" animate="animate" className="space-y-4">
          {requests.map((r) => {
            const actionable =
              r.mentorshipStatus !== "ENDED" && (r.status === "PENDING" || r.status === "ACCEPTED");
            const busy = resolvingId === r.id;
            const meta = mentorshipStatus(r.mentorshipStatus);

            return (
              <motion.li key={r.id} variants={listItem} className="glass rounded-[24px] p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <DashboardAvatar initials={initialsOf(r.mentee.displayName)} size={42} />
                  <div className="flex-1">
                    <p className="font-medium">{r.mentee.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.weeksLogged} weeks logged · {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <StatusPill tone="neutral">{advocacyTypeLabel(r.type)}</StatusPill>
                  <StatusPill tone={ADVOCACY_TONE[r.status] ?? "neutral"}>
                    {advocacyStatusLabel(r.status)}
                  </StatusPill>
                  <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                  <DashboardButton variant="outline" onClick={() => viewMentee(r)}>
                    View mentee
                  </DashboardButton>
                </div>
                {r.details ? <p className="mt-3 text-sm">{r.details}</p> : null}
                {r.mentorNote ? (
                  <p className="mt-2 text-sm text-muted-foreground">Note: {r.mentorNote}</p>
                ) : null}
                {actionable ? (
                  <div className="mt-4 space-y-3">
                    <Field label="Response note" hint="Optional">
                      <textarea
                        rows={2}
                        value={notes[r.id] ?? ""}
                        maxLength={MAX_RESPONSE_NOTE}
                        onChange={(e) => setNoteFor(r.id, e.target.value)}
                        className={inputClass}
                        placeholder="Shared with your mentee"
                      />
                    </Field>
                    <div className="flex flex-wrap gap-2">
                      {r.status === "PENDING" ? (
                        <>
                          <DashboardButton disabled={busy} onClick={() => respond(r, "ACCEPT")}>
                            Accept
                          </DashboardButton>
                          <DashboardButton variant="danger" disabled={busy} onClick={() => respond(r, "DECLINE")}>
                            Decline
                          </DashboardButton>
                        </>
                      ) : (
                        <DashboardButton variant="outline" disabled={busy} onClick={() => respond(r, "DONE")}>
                          Mark done
                        </DashboardButton>
                      )}
                    </div>
                  </div>
                ) : null}
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </motion.div>
  );
}
