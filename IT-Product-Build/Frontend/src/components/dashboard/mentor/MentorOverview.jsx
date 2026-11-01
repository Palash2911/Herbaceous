import { KpiCard } from "@/components/dashboard/shared/KpiCard";
import {
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
  EmptyState,
  SectionTitle,
} from "@/components/dashboard/shared/primitives";
import { useStore } from "@/components/dashboard/shared/store";
import { useMentorMentees } from "@/hooks/useMentorMentees";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { handleApiError } from "@/lib/handleApiError";
import { listContainer, listItem, pageMotion } from "@/lib/motion";
import {
  acceptRequest,
  declineRequest,
  listRequests,
} from "@/services/mentorService";
import { motion } from "framer-motion";
import { Megaphone, PauseCircle, UserPlus, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MenteeRow } from "./MenteeRow";
import { VerificationPrompt } from "./VerificationPrompt";
import { DashboardLoader } from "@/components/dashboard/shared/DashboardLoader";

const DASH = "–";

export function MentorOverview() {
  const {
    displayName,
    mentorOverview,
    mentorOverviewError,
    refetchMentorOverview,
    openMenteeDetail,
  } = useStore();
  const {
    mentees,
    loading: menteesLoading,
    error: menteesError,
    refetch: refetchMentees,
  } = useMentorMentees();
  const verificationStatus = useVerificationStatus();

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);

  const fetchRequests = useCallback(async () => {
    await Promise.resolve();
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const data = await listRequests("PENDING");
      setRequests(data ?? []);
    } catch (err) {
      setRequestsError(err);
      handleApiError(err, "Couldn't load incoming requests");
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (id) => {
    setAcceptingId(id);
    try {
      await acceptRequest(id);
      toast.success("Request accepted");
      await fetchRequests();
      refetchMentorOverview();
      refetchMentees();
    } catch (err) {
      handleApiError(err, "Couldn't accept that request");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDecline = async (id) => {
    setDecliningId(id);
    try {
      await declineRequest(id);
      toast.success("Request declined");
      await fetchRequests();
      refetchMentorOverview();
    } catch (err) {
      handleApiError(err, "Couldn't decline that request");
    } finally {
      setDecliningId(null);
    }
  };

  const count = (key) => (mentorOverview ? mentorOverview[key] : DASH);
  const pendingPauses = mentorOverview?.pendingPauseCount ?? 0;

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <DashboardLabel>Mentor workspace</DashboardLabel>
          <h1 className="mt-1 font-display text-2xl font-semibold">
            {displayName ? `Welcome back, ${displayName}` : "Welcome back"}
          </h1>
        </div>
        <VerificationPrompt status={verificationStatus} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          index={0}
          label="Active mentees"
          value={count("activeMenteeCount")}
          icon={UsersRound}
          tone="positive"
        />
        <KpiCard
          index={1}
          label="Mentorship requests"
          value={count("pendingRequestCount")}
          icon={UserPlus}
          tone="caution"
        />
        <KpiCard
          index={2}
          label="Advocacy requests"
          value={count("pendingAdvocacyCount")}
          icon={Megaphone}
          tone="caution"
        />
        <KpiCard
          index={3}
          label="Pause requests"
          value={count("pendingPauseCount")}
          icon={PauseCircle}
          tone={pendingPauses ? "caution" : "neutral"}
        />
      </div>

      {mentorOverviewError ? (
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Couldn't load your counts.</span>
          <DashboardButton variant="outline" onClick={refetchMentorOverview}>
            Try again
          </DashboardButton>
        </div>
      ) : null}

      <DashboardGlassCard>
        <SectionTitle
          title="Active mentees"
          subtitle="Everyone you are currently mentoring"
        />
        {menteesError ? (
          <EmptyState
            title="Couldn't load your mentees"
            body="Something went wrong reaching the server."
            action={
              <DashboardButton variant="outline" onClick={refetchMentees}>
                Try again
              </DashboardButton>
            }
          />
        ) : menteesLoading ? (
          <DashboardLoader label="Loading your mentees..." />
        ) : mentees.length === 0 ? (
          <EmptyState
            title="No active mentees"
            body="Accept a mentorship request to get started."
          />
        ) : (
          <motion.ul
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

      <DashboardGlassCard>
        <SectionTitle title="Incoming mentorship requests" />
        {requestsError ? (
          <EmptyState
            title="Couldn't load requests"
            body="Something went wrong reaching the server."
            action={
              <DashboardButton variant="outline" onClick={fetchRequests}>
                Try again
              </DashboardButton>
            }
          />
        ) : requestsLoading ? (
          <DashboardLoader label="Loading requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No pending requests"
            body="New mentee requests will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li
                key={r.id}
                className="rounded-[16px] border border-[var(--hairline)] p-4"
              >
                <p className="text-sm font-medium">
                  {r.menteeProfile?.user?.displayName}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {r.message}
                </p>
                <div className="mt-3 flex gap-2">
                  <DashboardButton
                    onClick={() => handleAccept(r.id)}
                    disabled={acceptingId === r.id || decliningId === r.id}
                  >
                    Accept
                  </DashboardButton>
                  <DashboardButton
                    variant="danger"
                    onClick={() => handleDecline(r.id)}
                    disabled={acceptingId === r.id || decliningId === r.id}
                  >
                    Decline
                  </DashboardButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardGlassCard>
    </motion.div>
  );
}
