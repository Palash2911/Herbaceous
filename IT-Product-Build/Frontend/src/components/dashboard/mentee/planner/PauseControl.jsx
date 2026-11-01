import { useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarClock,
  Clock,
  MessageSquareText,
  PauseCircle,
  PlayCircle,
  X,
} from "lucide-react";
import {
  DashboardLabel,
  DashboardButton,
  DashboardGlassCard,
  inputClass,
} from "@/components/dashboard/shared/primitives";
import { StatusPill } from "@/components/dashboard/mentee/primitives";
import { cn } from "@/lib/utils";

const STATUS_META = {
  PENDING: {
    label: "Pending",
    tone: "amber",
  },
  APPROVED: {
    label: "Approved",
    tone: "teal",
  },
  DECLINED: {
    label: "Declined",
    tone: "coral",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    tone: "muted",
  },
};

function PauseStatusPill({ status, children }) {
  const meta = STATUS_META[status] ?? {
    label: status || "Unknown",
    tone: "muted",
  };

  return (
    <StatusPill
      tone={meta.tone}
      icon={<Clock className="h-3.5 w-3.5" aria-hidden="true" />}
    >
      {children ?? meta.label}
    </StatusPill>
  );
}

function PauseRequestModal({
  mode,
  onClose,
  onSubmit,
}) {
  const [reason, setReason] = useState("");
  const [expectedWeeks, setExpectedWeeks] = useState(2);

  const trimmed = reason.trim();
  const reasonValid =
    trimmed.length > 0 && trimmed.length <= 500;
  const weeksValid =
    mode !== "pause" ||
    (Number.isInteger(expectedWeeks) &&
      expectedWeeks >= 1 &&
      expectedWeeks <= 12);
  const canSubmit = reasonValid && weeksValid;

  const title =
    mode === "pause"
      ? "Request a journey pause"
      : "Request to resume";

  const description =
    mode === "pause"
      ? "Tell your mentor why you need a break and how long you expect to be away."
      : "Tell your mentor why you are ready to continue your mentorship.";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmit(
      trimmed,
      mode === "pause" ? expectedWeeks : undefined,
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-request-title"
        aria-describedby="pause-request-description"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-[var(--hairline)] bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--hairline)] px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent/10 text-accent">
              {mode === "pause" ? (
                <PauseCircle className="h-5 w-5" />
              ) : (
                <PlayCircle className="h-5 w-5" />
              )}
            </span>

            <div>
              <h3
                id="pause-request-title"
                className="font-display text-lg font-semibold text-foreground"
              >
                {title}
              </h3>
              <p
                id="pause-request-description"
                className="mt-1 text-sm leading-5 text-muted-foreground"
              >
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close pause request"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-[var(--hairline)] text-muted-foreground transition hover:bg-[var(--surface-soft)] hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="rounded-2xl border border-accent/20 bg-accent/8 p-4">
            <p className="flex items-start gap-2 text-sm text-foreground">
              <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                Your mentor reviews this request. Nothing changes
                until they approve it.
              </span>
            </p>
          </div>

          <div className="mt-5">
            <label htmlFor="pause-reason">
              <DashboardLabel>Reason</DashboardLabel>
            </label>

            <textarea
              id="pause-reason"
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              maxLength={500}
              autoFocus
              className={cn(
                inputClass,
                "mt-2 min-h-32 resize-y p-4 transition focus:ring-4 focus:ring-accent/10",
              )}
              placeholder="Explain why you need this change so your mentor has enough context."
            />

            <div className="mt-1.5 flex items-center justify-end gap-3 text-xs">
              <span className="font-mono text-muted-foreground">
                {reason.length} / 500
              </span>
            </div>
          </div>

          {mode === "pause" ? (
            <div className="mt-5">
              <label htmlFor="expected-weeks">
                <DashboardLabel>
                  Expected weeks away
                </DashboardLabel>
              </label>

              <div className="relative mt-2">
                <CalendarClock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="expected-weeks"
                  type="number"
                  min={1}
                  max={12}
                  step={1}
                  value={expectedWeeks}
                  onChange={(event) =>
                    setExpectedWeeks(
                      Number(event.target.value),
                    )
                  }
                  className={cn(
                    inputClass,
                    "py-3 pl-11 pr-4 transition focus:ring-4 focus:ring-accent/10",
                  )}
                />
              </div>

              <p className="mt-1.5 text-xs text-muted-foreground">
                Enter a whole number between 1 and 12 weeks.
              </p>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-[var(--hairline)] pt-5">
            <DashboardButton
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </DashboardButton>

            <DashboardButton
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2.5 font-semibold disabled:opacity-50"
            >
              {mode === "pause"
                ? "Send pause request"
                : "Send resume request"}
            </DashboardButton>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export function PauseControl({
  mentorshipStatus,
  pendingPauseRequest,
  pauseRequests,
  onSubmitPause,
  onSubmitResume,
  onWithdraw,
}) {
  const [modalMode, setModalMode] = useState(null);

  const submit = (reason, expectedWeeks) => {
    if (modalMode === "pause") {
      onSubmitPause(reason, expectedWeeks);
    } else {
      onSubmitResume(reason);
    }

    setModalMode(null);
  };

  return (
    <>
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[var(--hairline)] bg-card px-6 py-5 shadow-[var(--glass-shadow)]">
        <div>
          <DashboardLabel>Journey control</DashboardLabel>
          <p className="mt-1 text-sm text-muted-foreground">
            {pendingPauseRequest
              ? "Your request is with your mentor."
              : mentorshipStatus === "PAUSED"
                ? "Your journey is paused. Weeks are not counted while paused."
                : "Need a break? You can request a pause at any time."}
          </p>
        </div>

        {pendingPauseRequest ? (
          <PauseStatusPill status="PENDING">
            Pending mentor approval
          </PauseStatusPill>
        ) : mentorshipStatus === "PAUSED" ? (
          <DashboardButton
            className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold"
            onClick={() => setModalMode("resume")}
          >
            <PlayCircle className="h-4 w-4" />
            Request resume
          </DashboardButton>
        ) : (
          <DashboardButton
            className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold"
            onClick={() => setModalMode("pause")}
          >
            <PauseCircle className="h-4 w-4" />
            Request journey pause
          </DashboardButton>
        )}
      </div>

      {pauseRequests.length ? (
        <DashboardGlassCard data-reveal>
          <DashboardLabel>Pause history</DashboardLabel>

          <ul className="mt-3 space-y-3">
            {pauseRequests.map((request) => (
              <li
                key={request.id}
                className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {request.type === "PAUSE"
                      ? "Pause request"
                      : "Resume request"}
                  </p>

                  <PauseStatusPill
                    status={request.status}
                  />
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {request.reason}
                </p>

                {request.responseNote ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your mentor said: {request.responseNote}
                  </p>
                ) : null}

                {request.status === "PENDING" ? (
                  <DashboardButton
                    variant="outline"
                    className="mt-3"
                    onClick={() => onWithdraw(request.id)}
                  >
                    Withdraw
                  </DashboardButton>
                ) : null}
              </li>
            ))}
          </ul>
        </DashboardGlassCard>
      ) : null}

      {modalMode ? (
        <PauseRequestModal
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onSubmit={submit}
        />
      ) : null}
    </>
  );
}
