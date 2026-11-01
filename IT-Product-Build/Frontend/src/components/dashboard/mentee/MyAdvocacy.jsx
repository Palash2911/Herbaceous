import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Compass, Info } from "lucide-react";
import { useReveal } from "@/components/dashboard/mentee/primitives";
import { TemplateGrid } from "@/components/dashboard/mentee/advocacy/TemplateGrid";
import { RequestHistory } from "@/components/dashboard/mentee/advocacy/RequestHistory";
import { SummaryChart } from "@/components/dashboard/mentee/advocacy/SummaryChart";
import { Modal } from "@/components/dashboard/shared/Modal";
import {
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
  EmptyState,
} from "@/components/dashboard/shared/primitives";
import { useStore } from "@/components/dashboard/shared/store";
import { handleApiError } from "@/lib/handleApiError";
import {
  listAdvocacyRequests,
  createAdvocacyRequest,
  withdrawAdvocacyRequest,
} from "@/services/menteeService";
import { DashboardPanelLoader } from "@/components/dashboard/shared/DashboardLoader";

const typeLabel = {
  REFERRAL: "Referral",
  INTRODUCTION: "Introduction",
  NOMINATION: "Nomination",
  ENDORSEMENT: "Endorsement",
  OTHER: "Other",
};

const statusLabel = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  DONE: "Done",
  WITHDRAWN: "Withdrawn",
  CLOSED: "Closed",
};

function toDisplayRequest(request) {
  return {
    id: request.id,
    template: typeLabel[request.type] ?? request.type,
    ask: request.details || "No additional details provided.",
    status: statusLabel[request.status] ?? request.status,
    date: request.createdAt
      ? new Date(request.createdAt).toLocaleDateString()
      : "",
    mentorNote: request.mentorNote,
  };
}

export function MyAdvocacy() {
  const {
    mentorship,
    mentorshipLoading,
    mentorshipError,
    refetchMentorship,
    setView,
    refetchOverview,
  } = useStore();
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const ref = useReveal([loading, requests.length]);

  useEffect(() => {
    let cancelled = false;

    listAdvocacyRequests()
      .then((data) => {
        if (cancelled) return;
        setRequests(data?.requests ?? []);
        setCounts(data?.counts ?? null);
        setError(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(true);
        handleApiError(err, "Could not load advocacy requests");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function reload() {
    setLoading(true);
    setError(false);
    try {
      const data = await listAdvocacyRequests();
      setRequests(data?.requests ?? []);
      setCounts(data?.counts ?? null);
      return true;
    } catch (err) {
      setError(true);
      handleApiError(err, "Could not load advocacy requests");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function submit(type, details) {
    try {
      await createAdvocacyRequest(type, details);
      toast.success("Request sent to your mentor");
      await Promise.all([reload(), refetchOverview()]);
      return true;
    } catch (err) {
      handleApiError(err, "Could not send advocacy request");
      if (err.status === 409) await reload();
      return false;
    }
  }

  function openWithdrawModal(id) {
    const request = requests.find((item) => item.id === id);
    if (!request || request.status !== "PENDING") return;
    setWithdrawTarget(toDisplayRequest(request));
  }

  function closeWithdrawModal() {
    if (withdrawingId) return;
    setWithdrawTarget(null);
  }

  async function confirmWithdraw() {
    if (!withdrawTarget || withdrawingId) return;

    const id = withdrawTarget.id;
    setWithdrawingId(id);

    try {
      await withdrawAdvocacyRequest(id);
      setWithdrawTarget(null);
      toast.success("Request withdrawn");
      await Promise.all([reload(), refetchOverview()]);
    } catch (err) {
      handleApiError(err, "Could not withdraw request");
      if (err.status === 409) {
        setWithdrawTarget(null);
        await reload();
      }
    } finally {
      setWithdrawingId(null);
    }
  }

  const displayRequests = requests.map(toDisplayRequest);
  const pendingTypes = requests
    .filter((request) => request.status === "PENDING")
    .map((request) => request.type);
  const isWithdrawing = Boolean(
    withdrawTarget && withdrawingId === withdrawTarget.id,
  );

  return (
    <div ref={ref} className="relative isolate space-y-6 pb-12">
      <header data-reveal>
        <p className="label-caps">My advocacy</p>
        <h1 className="mt-1 font-display text-3xl font-bold">
          Ask your mentor to back you
        </h1>
      </header>

      {mentorshipLoading || loading ? (
        <DashboardPanelLoader label="Loading your advocacy workspace..." />
      ) : mentorshipError || error ? (
        <DashboardGlassCard data-reveal>
          <EmptyState
            icon={<Info className="h-6 w-6" />}
            title="Could not load advocacy"
            action={
              <DashboardButton
                onClick={mentorshipError ? refetchMentorship : reload}
              >
                Try again
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : !mentorship ? (
        <DashboardGlassCard data-reveal>
          <EmptyState
            icon={<Compass className="h-6 w-6" />}
            title="Find a mentor first"
            body="Your advocacy requests will appear here after you start a mentorship."
            action={
              <DashboardButton onClick={() => setView("matching")}>
                Go to Matching
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : (
        <>
          {mentorship.status === "PAUSED" ? (
            <DashboardGlassCard
              data-reveal
              className="border-l-4 border-l-amber"
            >
              <p className="text-sm">
                Your mentorship is paused. You can review and withdraw pending
                requests, then make new requests after it resumes.
              </p>
            </DashboardGlassCard>
          ) : null}

          <TemplateGrid
            onSubmit={submit}
            pendingTypes={pendingTypes}
            disabled={mentorship.status !== "ACTIVE"}
          />
          <SummaryChart counts={counts} />
          <RequestHistory
            requests={displayRequests}
            paused={mentorship.status !== "ACTIVE"}
            onWithdraw={openWithdrawModal}
            withdrawingId={withdrawingId}
          />
        </>
      )}

      <Modal
        open={Boolean(withdrawTarget)}
        onClose={closeWithdrawModal}
        title="Withdraw request?"
        consequence="Are you sure you want to withdraw this request? Your mentor will no longer be able to act on it."
        footer={
          <>
            <DashboardButton
              variant="outline"
              onClick={closeWithdrawModal}
              disabled={isWithdrawing}
            >
              Keep request
            </DashboardButton>
            <DashboardButton
              variant="danger"
              onClick={confirmWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw"}
            </DashboardButton>
          </>
        }
      >
        {withdrawTarget ? (
          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-coral/20 bg-coral/10 text-coral">
                <AlertTriangle className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <DashboardLabel>Request to withdraw</DashboardLabel>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">
                    {withdrawTarget.template}
                  </p>
                  {withdrawTarget.date ? (
                    <span className="text-xs text-muted-foreground">
                      {withdrawTarget.date}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
                  {withdrawTarget.ask}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
