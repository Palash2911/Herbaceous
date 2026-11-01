import { motion } from "framer-motion";
import { ArrowLeft, PauseCircle, ShieldAlert, XOctagon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/components/dashboard/shared/store";
import {
  Chip,
  DashboardAvatar,
  DashboardButton,
  DashboardGlassCard,
  EmptyState,
  Field,
  SectionTitle,
  StatusPill,
  inputClass,
} from "@/components/dashboard/shared/primitives";
import { Modal } from "@/components/dashboard/shared/Modal";
import { ToleranceMeter, toneForLevel } from "@/components/dashboard/shared/ToleranceMeter";
import { useMenteeDetail } from "@/hooks/useMenteeDetail";
import { handleApiError } from "@/lib/handleApiError";
import { listContainer, listItem, pageMotion } from "@/lib/motion";
import {
  createToleranceEvent,
  endMentorship,
  respondToAdvocacy,
  respondToPause,
} from "@/services/mentorService";
import {
  ADVOCACY_TONE,
  TOLERANCE_CATEGORIES,
  advocacyStatusLabel,
  advocacyTypeLabel,
  fieldLabel,
  formatDate,
  initialsOf,
  mentorshipStatus,
  toleranceCategoryLabel,
} from "./mentorDisplay";
import { DashboardPanelLoader } from "@/components/dashboard/shared/DashboardLoader";

const WEEK_STATUS = {
  done: { tone: "positive", label: "Done" },
  current: { tone: "caution", label: "Current" },
  paused: { tone: "neutral", label: "Paused" },
  missed: { tone: "negative", label: "Missed" },
  skipped: { tone: "negative", label: "Skipped" },
};

const MAX_TOLERANCE_REASON = 1000;
const MAX_END_REASON = 1000;
const MAX_RESPONSE_NOTE = 500;

export function MenteeDetail() {
  const { selectedMentorshipId, setView, refetchMentorOverview } = useStore();
  const {
    mentee: detail,
    loading,
    error,
    refetch,
  } = useMenteeDetail(selectedMentorshipId);

  if (!selectedMentorshipId) {
    return (
      <DashboardGlassCard>
        <EmptyState
          title="No mentee selected"
          body="Pick a mentee from your list to see their detail page."
          action={<DashboardButton onClick={() => setView("mentees")}>Back to my mentees</DashboardButton>}
        />
      </DashboardGlassCard>
    );
  }

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <button
        onClick={() => setView("mentees")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={15} /> Back to my mentees
      </button>

      {error ? (
        <DashboardGlassCard>
          <EmptyState
            title="Couldn't load this mentee"
            body="Something went wrong reaching the server."
            action={
              <DashboardButton variant="outline" onClick={refetch}>
                Try again
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : loading ? (
        <DashboardPanelLoader label="Loading mentee..." />
      ) : (
        <MenteeDetailBody
          detail={detail}
          refetch={refetch}
          refetchMentorOverview={refetchMentorOverview}
        />
      )}
    </motion.div>
  );
}

function MenteeDetailBody({ detail, refetch, refetchMentorOverview }) {
  const meta = mentorshipStatus(detail.status);
  const ended = detail.status === "ENDED";

  return (
    <>
      <DashboardGlassCard>
        <div className="flex flex-wrap items-center gap-4">
          <DashboardAvatar initials={initialsOf(detail.mentee.displayName)} size={56} />
          <div className="flex-1">
            <h1 className="font-display text-2xl font-semibold">{detail.mentee.displayName}</h1>
            <p className="text-sm text-muted-foreground">{fieldLabel(detail.mentee.field)}</p>
          </div>
          <StatusPill tone="neutral">{detail.weeksLogged} weeks logged</StatusPill>
          <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
        </div>
        {ended ? (
          <div className="mt-4 rounded-[16px] border border-[var(--hairline)] p-4">
            <p className="text-xs text-muted-foreground">Ended {formatDate(detail.endedAt)}</p>
            <p className="mt-2 text-sm">{detail.endReason}</p>
          </div>
        ) : null}
      </DashboardGlassCard>

      <DashboardGlassCard>
        <SectionTitle title="Weekly log history" subtitle="Read only, written by your mentee" />
        {detail.weeks.length === 0 ? (
          <EmptyState title="No weeks logged yet" body="Logged weeks will appear here as they happen." />
        ) : (
          <motion.ul variants={listContainer} initial="initial" animate="animate" className="space-y-2">
            {detail.weeks.map((w) => {
              const status = WEEK_STATUS[w.status] ?? { tone: "neutral", label: w.status };
              return (
                <motion.li
                  key={w.week}
                  variants={listItem}
                  className="flex flex-wrap items-center gap-3 rounded-[16px] border border-[var(--hairline)] px-4 py-3"
                >
                  <span className="w-20 text-sm font-medium">Week {w.week}</span>
                  <StatusPill tone={status.tone}>{status.label}</StatusPill>
                  <span className="flex-1 text-sm text-muted-foreground">{w.note ?? ""}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(w.loggedAt ?? w.range.start)}
                  </span>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </DashboardGlassCard>

      <ToleranceSection detail={detail} ended={ended} refetch={refetch} />

      <PauseSection
        detail={detail}
        ended={ended}
        refetch={refetch}
        refetchMentorOverview={refetchMentorOverview}
      />

      <AdvocacySection
        detail={detail}
        ended={ended}
        refetch={refetch}
        refetchMentorOverview={refetchMentorOverview}
      />

      {ended ? null : (
        <EndSection detail={detail} refetch={refetch} refetchMentorOverview={refetchMentorOverview} />
      )}
    </>
  );
}

function ToleranceSection({ detail, ended, refetch }) {
  const [category, setCategory] = useState(TOLERANCE_CATEGORIES[0]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const trimmed = reason.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX_TOLERANCE_REASON;

  const submit = async () => {
    setSubmitting(true);
    try {
      await createToleranceEvent(detail.id, category, trimmed);
      toast.success("Tolerance level added");
      await refetch();
      setReason("");
    } catch (err) {
      handleApiError(err, "Couldn't add that tolerance level");
      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardGlassCard>
      <SectionTitle title="Tolerance history" subtitle="Levels never decay and never reset" />
      <ToleranceMeter level={detail.tolerance.level} className="mb-4" />

      {ended ? null : (
        <div className="mb-4 space-y-3 rounded-[16px] border border-[var(--hairline)] p-4">
          <div className="flex flex-wrap gap-2">
            {TOLERANCE_CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {toleranceCategoryLabel(c)}
              </Chip>
            ))}
          </div>
          <Field label="Reason" hint={`${trimmed.length}/${MAX_TOLERANCE_REASON}`}>
            <textarea
              rows={4}
              value={reason}
              maxLength={MAX_TOLERANCE_REASON}
              onChange={(e) => setReason(e.target.value)}
              className={inputClass}
              placeholder="Be factual and specific"
            />
          </Field>
          <DashboardButton disabled={!canSubmit || submitting} onClick={submit}>
            <ShieldAlert size={15} /> Add tolerance level
          </DashboardButton>
        </div>
      )}

      {detail.tolerance.events.length === 0 ? (
        <EmptyState title="Clear record" body="Nothing has been recorded against this mentee." />
      ) : (
        <ul className="space-y-2">
          {detail.tolerance.events.map((t, i) => {
            const level = detail.tolerance.events.length - i;
            return (
              <li key={t.id} className="rounded-[16px] border border-[var(--hairline)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusPill tone={toneForLevel(level)}>Level {level}</StatusPill>
                  <span className="text-xs text-muted-foreground">
                    {toleranceCategoryLabel(t.category)} · {formatDate(t.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm">{t.reason}</p>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardGlassCard>
  );
}

function PauseSection({ detail, ended, refetch, refetchMentorOverview }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const request = detail.pendingPauseRequest;

  const resolve = async (action) => {
    setBusy(true);
    try {
      await respondToPause(detail.id, request.id, action, note.trim() || undefined);
      const verb = request.type === "PAUSE" ? "Pause" : "Resume";
      toast.success(`${verb} ${action === "APPROVE" ? "approved" : "declined"}`);
      setNote("");
      await Promise.all([refetch(), refetchMentorOverview()]);
    } catch (err) {
      handleApiError(err, "Couldn't respond to that request");
      await refetch();
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardGlassCard>
      <SectionTitle title="Pause requests" />
      {request ? (
        <div className="rounded-[16px] border border-[var(--hairline)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusPill tone="caution">
              {request.type === "PAUSE" ? "Pause requested" : "Resume requested"}
            </StatusPill>
            <span className="text-xs text-muted-foreground">
              {request.expectedWeeks ? `${request.expectedWeeks} weeks · ` : ""}
              {formatDate(request.createdAt)}
            </span>
          </div>
          <p className="mt-2 text-sm">{request.reason}</p>
          {ended ? null : (
            <div className="mt-3 space-y-3">
              <Field label="Response note" hint="Optional">
                <textarea
                  rows={2}
                  value={note}
                  maxLength={MAX_RESPONSE_NOTE}
                  onChange={(e) => setNote(e.target.value)}
                  className={inputClass}
                  placeholder="Shared with your mentee"
                />
              </Field>
              <div className="flex gap-2">
                <DashboardButton disabled={busy} onClick={() => resolve("APPROVE")}>
                  Approve
                </DashboardButton>
                <DashboardButton variant="danger" disabled={busy} onClick={() => resolve("DECLINE")}>
                  Decline
                </DashboardButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<PauseCircle size={20} />}
          title="No open pause requests"
          body="If your mentee asks to pause or resume, the request appears here."
        />
      )}
    </DashboardGlassCard>
  );
}

function AdvocacySection({ detail, ended, refetch, refetchMentorOverview }) {
  const [notes, setNotes] = useState({});
  const [resolvingId, setResolvingId] = useState(null);

  const setNoteFor = (id, value) => setNotes((m) => ({ ...m, [id]: value }));

  const respond = async (request, action) => {
    setResolvingId(request.id);
    try {
      const note = notes[request.id]?.trim() || undefined;
      await respondToAdvocacy(detail.id, request.id, action, note);
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

  return (
    <DashboardGlassCard>
      <SectionTitle title="Advocacy requests" />
      {detail.advocacy.requests.length === 0 ? (
        <EmptyState title="No advocacy history yet" body="Requests your mentee sends will appear here." />
      ) : (
        <ul className="space-y-2">
          {detail.advocacy.requests.map((r) => {
            const actionable = !ended && (r.status === "PENDING" || r.status === "ACCEPTED");
            const busy = resolvingId === r.id;
            return (
              <li key={r.id} className="rounded-[16px] border border-[var(--hairline)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone="neutral">{advocacyTypeLabel(r.type)}</StatusPill>
                    <StatusPill tone={ADVOCACY_TONE[r.status] ?? "neutral"}>
                      {advocacyStatusLabel(r.status)}
                    </StatusPill>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                {r.details ? <p className="mt-2 text-sm">{r.details}</p> : null}
                {actionable ? (
                  <div className="mt-3 space-y-3">
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
              </li>
            );
          })}
        </ul>
      )}
    </DashboardGlassCard>
  );
}

function EndSection({ detail, refetch, refetchMentorOverview }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [ending, setEnding] = useState(false);

  const trimmed = reason.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX_END_REASON;

  const openAdvocacy = detail.advocacy.requests.filter(
    (r) => r.status === "PENDING" || r.status === "ACCEPTED",
  );
  const pauseCount = detail.pendingPauseRequest ? 1 : 0;
  const advocacyCount = openAdvocacy.length;

  const closeParts = [];
  if (pauseCount) closeParts.push(`${pauseCount} pause request`);
  if (advocacyCount) closeParts.push(`${advocacyCount} advocacy request${advocacyCount === 1 ? "" : "s"}`);
  const closeLine = closeParts.length
    ? `This will close ${closeParts.join(" and ")}.`
    : "Nothing else is open to close.";

  const pauseLine = detail.pendingPauseRequest
    ? `${detail.mentee.displayName} has asked to ${
        detail.pendingPauseRequest.type === "PAUSE" ? "pause" : "resume"
      }; that request will be closed unanswered. `
    : "";

  const consequence = `This ends your mentorship with ${detail.mentee.displayName} immediately. ${pauseLine}${closeLine} It cannot be undone, and ${detail.mentee.displayName} becomes free to match with another mentor.`;

  const submit = async () => {
    setEnding(true);
    try {
      const result = await endMentorship(detail.id, trimmed);
      const closedPause = result?.closedPauseRequests ?? 0;
      const closedAdvocacy = result?.closedAdvocacyRequests ?? 0;
      const extra = [];
      if (closedPause) extra.push(`${closedPause} pause request closed`);
      if (closedAdvocacy)
        extra.push(`${closedAdvocacy} advocacy request${closedAdvocacy === 1 ? "" : "s"} closed`);
      toast.success(extra.length ? `Relationship ended. ${extra.join(", ")}.` : "Relationship ended.");
      setReason("");
      setOpen(false);
      await Promise.all([refetch(), refetchMentorOverview()]);
    } catch (err) {
      handleApiError(err, "Couldn't end this relationship");
      await refetch();
    } finally {
      setEnding(false);
    }
  };

  return (
    <DashboardGlassCard>
      <SectionTitle
        title="End relationship"
        subtitle="Mentor only, immediate, cannot be undone"
        action={
          <DashboardButton variant="danger" onClick={() => setOpen(true)}>
            <XOctagon size={15} /> End relationship
          </DashboardButton>
        }
      />
      <p className="text-sm text-muted-foreground">
        Ending moves both of you to an ended state and closes any open pause or advocacy requests.
      </p>

      <Modal
        open={open}
        onClose={() => (ending ? null : setOpen(false))}
        title="End this relationship"
        consequence={consequence}
        footer={
          <>
            <DashboardButton variant="outline" disabled={ending} onClick={() => setOpen(false)}>
              Cancel
            </DashboardButton>
            <DashboardButton variant="danger" disabled={!canSubmit || ending} onClick={submit}>
              End relationship
            </DashboardButton>
          </>
        }
      >
        <Field label="Written reason" hint={`${trimmed.length}/${MAX_END_REASON}`}>
          <textarea
            rows={6}
            value={reason}
            maxLength={MAX_END_REASON}
            onChange={(e) => setReason(e.target.value)}
            className={inputClass}
            placeholder="Explain what led to this decision"
          />
        </Field>
      </Modal>
    </DashboardGlassCard>
  );
}
