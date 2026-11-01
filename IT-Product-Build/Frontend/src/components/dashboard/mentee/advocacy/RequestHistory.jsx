import { StatusPill } from "@/components/dashboard/mentee/primitives";
import {
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
  EmptyState,
} from "@/components/dashboard/shared/primitives";
import { Check, CheckCheck, Clock, Inbox, X } from "lucide-react";

const flow = ["Pending", "Accepted", "Done"];

const endedNotes = {
  Withdrawn: "You withdrew this request.",
  Closed: "Your mentorship ended before your mentor replied.",
};

const meta = {
  Pending: { tone: "amber", icon: Clock },
  Accepted: { tone: "teal", icon: Check },
  Declined: { tone: "coral", icon: X },
  Done: { tone: "teal", icon: CheckCheck },
  Withdrawn: { tone: "muted", icon: X },
  Closed: { tone: "muted", icon: X },
};

function Track({ status }) {
  if (status === "Declined" || status === "Withdrawn" || status === "Closed") {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`h-1.5 flex-1 rounded-full ${status === "Declined" ? "bg-coral/60" : "bg-muted"}`}
        />
        <span
          className={`inline-flex items-center gap-1 text-xs ${status === "Declined" ? "text-coral" : "text-muted-foreground"}`}
        >
          <X className="h-3.5 w-3.5" /> {status}
        </span>
      </div>
    );
  }
  const index = flow.indexOf(status);
  return (
    <div className="flex items-center gap-2">
      {flow.map((step, i) => {
        const reached = i <= index;
        return (
          <div key={step} className="flex flex-1 items-center gap-2">
            <div className="flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: reached ? "100%" : "0%",
                    background:
                      i === index && status !== "Done"
                        ? "var(--amber)"
                        : "var(--teal)",
                    transition: "width .8s cubic-bezier(.22,1,.36,1)",
                  }}
                />
              </div>
              <p
                className={`mt-1 text-[10px] ${reached ? "text-foreground" : "text-muted-foreground"}`}
              >
                {step}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RequestHistory({
  requests,
  onWithdraw,
  withdrawingId,
  paused = false,
}) {
  return (
    <DashboardGlassCard data-reveal className="glass-hover">
      <DashboardLabel>Request history</DashboardLabel>
      <h2 className="mt-1 text-xl font-semibold">Where each ask stands</h2>

      <div className="mt-5 space-y-4">
        {requests.length ? (
          requests.map((r) => {
            const m = meta[r.status] ?? meta.Pending;
            const Icon = m.icon;
            return (
              <div key={r.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <DashboardLabel>
                      {r.template} · {r.date}
                    </DashboardLabel>
                    <p className="mt-1 text-sm font-medium">{r.ask}</p>
                    {r.mentorNote ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Mentor's reply: {r.mentorNote}
                      </p>
                    ) : null}
                  </div>
                  <StatusPill
                    tone={m.tone}
                    icon={<Icon className="h-3.5 w-3.5" />}
                  >
                    {r.status}
                  </StatusPill>
                </div>
                <div className="mt-4">
                  <Track status={r.status} />
                </div>
                {endedNotes[r.status] ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {endedNotes[r.status]}
                  </p>
                ) : null}
                {r.status === "Pending" ? (
                  <DashboardButton
                    variant="outline"
                    className="mt-4"
                    disabled={withdrawingId === r.id}
                    onClick={() => onWithdraw(r.id)}
                  >
                    {withdrawingId === r.id
                      ? "Withdrawing..."
                      : "Withdraw request"}
                  </DashboardButton>
                ) : null}
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="No requests yet"
            body={
              paused
                ? "You can send your first request once your mentorship resumes."
                : "Choose an option above to send your first request. Your mentor can accept or decline it, and every answer shows up here."
            }
          />
        )}
      </div>
    </DashboardGlassCard>
  );
}
