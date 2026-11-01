import { MentorMatchCard } from "@/components/dashboard/mentee/matching/MentorMatchCard";
import { MatchingFilterPanel } from "@/components/dashboard/mentee/matching/MatchingFilterPanel";
import { bucketForSeniority } from "@/components/dashboard/mentee/matching/experienceBuckets";
import { useReveal } from "@/components/dashboard/mentee/primitives";
import {
  DashboardLoader,
  DashboardPanelLoader,
} from "@/components/dashboard/shared/DashboardLoader";
import { Modal } from "@/components/dashboard/shared/Modal";
import {
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
  EmptyState,
} from "@/components/dashboard/shared/primitives";
import { useStore } from "@/components/dashboard/shared/store";
import { handleApiError } from "@/lib/handleApiError";
import { cn } from "@/lib/utils";
import {
  createRequest,
  listMentors,
  listRequests,
  startMentorshipNow,
  withdrawRequest,
} from "@/services/menteeService";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RotateCcw,
  SearchX,
  UserRound,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const MENTOR_LIMIT = 50;

const TOP_MATCH_THRESHOLD = 80;

function byScore(a, b) {
  return (b.score ?? 0) - (a.score ?? 0);
}

const REQUEST_META = {
  PENDING: {
    label: "Pending",
    tone: "var(--amber)",
    Icon: Clock3,
  },
  ACCEPTED: {
    label: "Accepted",
    tone: "var(--teal)",
    Icon: CheckCircle2,
  },
  DECLINED: {
    label: "Declined",
    tone: "var(--coral)",
    Icon: XCircle,
  },
  WITHDRAWN: {
    label: "Withdrawn",
    tone: "var(--muted-foreground)",
    Icon: RotateCcw,
  },
  CLOSED: {
    label: "Closed",
    tone: "var(--muted-foreground)",
    Icon: XCircle,
  },
};

function requestDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function initialsFromName(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "M";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function RequestStatus({ status }) {
  const meta = REQUEST_META[status] ?? {
    label: status || "Unknown",
    tone: "var(--muted-foreground)",
    Icon: Clock3,
  };
  const Icon = meta.Icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{
        color: meta.tone,
        borderColor: `color-mix(in srgb, ${meta.tone} 34%, transparent)`,
        background: `color-mix(in srgb, ${meta.tone} 11%, var(--card))`,
      }}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function Matching() {
  const { mentorship, mentorshipLoading, mentorshipError, refetchMentorship } =
    useStore();
  const hasMentorship = mentorship !== null;

  const [filters, setFilters] = useState({});
  const [browseAll, setBrowseAll] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);

  const [mentors, setMentors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(null);

  const [submittingId, setSubmittingId] = useState(null);
  const [startNow, setStartNow] = useState(null);
  const [startNowOpen, setStartNowOpen] = useState(false);
  const [startingNow, setStartingNow] = useState(false);
  const startingNowRef = useRef(false);
  const [startNowError, setStartNowError] = useState("");

  const fetchMentors = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const data = await listMentors({
        field: filters.field ?? undefined,
        verified: filters.verified ? true : undefined,
        limit: MENTOR_LIMIT,
      });
      const list = Array.isArray(data?.mentors) ? data.mentors : [];
      setMentors(list);
      setTotal(Number.isInteger(data?.total) ? data.total : list.length);
    } catch (err) {
      setError(err);
      handleApiError(err, "Couldn't load mentors");
    } finally {
      setLoading(false);
    }
  }, [filters.field, filters.verified]);

  const fetchRequests = useCallback(async () => {
    await Promise.resolve();
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const data = await listRequests();
      if (!Array.isArray(data)) {
        throw new Error("Unexpected requests response");
      }
      setRequests(data);
    } catch (err) {
      setRequestsError(err);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(fetchMentors);
  }, [fetchMentors]);

  useEffect(() => {
    Promise.resolve().then(fetchRequests);
  }, [fetchRequests]);

  const { pool, visible, fallback, allCount } = useMemo(() => {
    const available = openOnly
      ? mentors.filter((mentor) => mentor.openAvailability)
      : mentors;
    const topMatches = available.filter(
      (mentor) => (mentor.score ?? 0) >= TOP_MATCH_THRESHOLD,
    );
    const useFallback = !browseAll && topMatches.length === 0;
    const inMode = browseAll || useFallback ? available : topMatches;
    const matchesExperience = (mentor) => {
      if (!filters.experience) return true;
      const bucket = bucketForSeniority(mentor.seniority);
      return bucket === null || bucket === filters.experience;
    };
    const filtered = inMode.filter(matchesExperience);
    return {
      pool: available,
      visible: [...filtered].sort(byScore),
      fallback: useFallback && available.length > 0,
      allCount: available.filter(matchesExperience).length,
    };
  }, [mentors, filters.experience, openOnly, browseAll]);

  const noOpenAvailability = openOnly && pool.length === 0;

  const resultsNotice = (() => {
    if (loading || error || noOpenAvailability) return null;
    const detail =
      total > MENTOR_LIMIT
        ? `Showing the top ${MENTOR_LIMIT} of ${total} mentors`
        : null;
    let message = null;
    let action = null;
    if (!browseAll && fallback) {
      message = "No mentors found in top matches yet, so we're showing all mentors.";
    } else if (
      !browseAll &&
      visible.length >= 1 &&
      visible.length <= 2 &&
      allCount > visible.length
    ) {
      message = `Only ${visible.length} ${
        visible.length === 1 ? "mentor" : "mentors"
      } found in top matches.`;
      action = { label: "View all mentors", onClick: () => setBrowseAll(true) };
    }
    return message || detail ? { message, detail, action } : null;
  })();

  const hasPendingRequest =
    !hasMentorship &&
    mentors.some((mentor) => mentor.requestStatus === "PENDING");

  const ref = useReveal();

  const handleRequest = async (mentor) => {
    setSubmittingId(mentor.id);
    try {
      const request = await createRequest(mentor.id);
      toast.success(`Mentorship request sent to ${mentor.name}`);
      if (mentor.openAvailability && request?.id) {
        setStartNowError("");
        setStartNow({ requestId: request.id, mentorName: mentor.name });
        setStartNowOpen(true);
      }
      await Promise.all([fetchMentors(), fetchRequests(), refetchMentorship()]);
    } catch (err) {
      handleApiError(err, "Couldn't send that request");
      if (err.status === 404 || err.status === 409) {
        await Promise.all([
          fetchMentors(),
          fetchRequests(),
          refetchMentorship(),
        ]);
      }
    } finally {
      setSubmittingId(null);
    }
  };

  const closeStartNow = useCallback(() => {
    if (startingNowRef.current) return;
    setStartNowOpen(false);
    setStartNowError("");
  }, []);

  const handleStartNow = async () => {
    if (!startNow || startingNowRef.current) return;

    startingNowRef.current = true;
    setStartingNow(true);
    setStartNowError("");
    try {
      await startMentorshipNow(startNow.requestId);
      toast.success(`Your mentorship with ${startNow.mentorName} has started`);
      setStartNowOpen(false);
      await Promise.all([fetchMentors(), fetchRequests(), refetchMentorship()]);
    } catch (err) {
      setStartNowError(
        err.message || "Couldn't start the mentorship. Please try again.",
      );
      if (err.status === 403 || err.status === 404 || err.status === 409) {
        await Promise.all([
          fetchMentors(),
          fetchRequests(),
          refetchMentorship(),
        ]);
      }
    } finally {
      startingNowRef.current = false;
      setStartingNow(false);
    }
  };

  const handleWithdraw = async (item) => {
    const requestId = item.requestId ?? item.id;
    if (!requestId) return;

    setSubmittingId(requestId);
    try {
      await withdrawRequest(requestId);
      toast.success(`Request to ${item.name ?? item.mentorName} withdrawn`);
      await Promise.all([fetchMentors(), fetchRequests(), refetchMentorship()]);
    } catch (err) {
      handleApiError(err, "Couldn't withdraw that request");
      if (err.status === 404 || err.status === 409) {
        await Promise.all([
          fetchMentors(),
          fetchRequests(),
          refetchMentorship(),
        ]);
      }
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div ref={ref} className="relative isolate space-y-6 pb-12">
      <header
        data-reveal
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="label-caps">Matching</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            Mentors ranked for you
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Scores combine field overlap, goal alignment, availability and
            mentoring style.
          </p>
        </div>
      </header>

      <div data-reveal className="space-y-3">
        <MatchingFilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          browseAll={browseAll}
          onBrowseAllChange={setBrowseAll}
          openOnly={openOnly}
          onOpenOnlyChange={setOpenOnly}
          notice={resultsNotice}
        />
        {noOpenAvailability && !loading && !error ? (
          <p
            className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-foreground"
            aria-live="polite"
          >
            No mentors have open availability right now. Turn this off to see
            every match.
          </p>
        ) : null}
      </div>

      {hasPendingRequest ? (
        <p data-reveal className="text-sm text-muted-foreground">
          Waiting on a reply. You can request more than one mentor.
        </p>
      ) : null}

      {mentorshipError ? (
        <div data-reveal className="glass p-4" role="alert">
          <p className="text-sm text-coral">
            Could not check your mentorship status. Requests are unavailable
            until it loads.
          </p>
          <DashboardButton
            variant="outline"
            className="mt-2"
            onClick={refetchMentorship}
          >
            Try again
          </DashboardButton>
        </div>
      ) : null}

      {error ? (
        <div data-reveal className="glass p-6">
          <EmptyState
            icon={<AlertTriangle className="h-6 w-6" />}
            title="Couldn't load mentors"
            body="Something went wrong reaching the server."
            action={
              <DashboardButton variant="outline" onClick={fetchMentors}>
                Try again
              </DashboardButton>
            }
          />
        </div>
      ) : loading ? (
        <DashboardPanelLoader label="Loading mentor matches..." />
      ) : noOpenAvailability ? null : visible.length ? (
        <div className="space-y-3">
          <div className="grid gap-6 xl:grid-cols-2">
            {visible.map((mentor) => (
              <MentorMatchCard
                key={mentor.id}
                mentor={mentor}
                hasMentorship={hasMentorship}
                requestDisabled={mentorshipLoading || Boolean(mentorshipError)}
                submitting={
                  Boolean(submittingId) &&
                  (submittingId === mentor.id ||
                    submittingId === mentor.requestId)
                }
                onRequest={handleRequest}
                onWithdraw={handleWithdraw}
              />
            ))}
          </div>
        </div>
      ) : (
        <div data-reveal className="glass p-6 rounded-xl">
          <EmptyState
            icon={<SearchX className="h-6 w-6" />}
            title="No mentors match those filters"
            body="Try clearing a filter, or browse all mentors to see the full list."
            action={
              <DashboardButton variant="outline" onClick={() => setFilters({})}>
                Clear filters
              </DashboardButton>
            }
          />
        </div>
      )}

      <DashboardGlassCard data-reveal>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <DashboardLabel>Requests</DashboardLabel>
            <h2 className="mt-1 font-display text-lg font-semibold">
              My mentorship requests
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Track requests you have sent and withdraw one while it is pending.
            </p>
          </div>

          {!requestsLoading && !requestsError ? (
            <span className="rounded-full border border-(--hairline) bg-(--surface-soft) px-3 py-1 text-xs font-medium text-muted-foreground">
              {requests.length} {requests.length === 1 ? "request" : "requests"}
            </span>
          ) : null}
        </div>

        {requestsLoading ? (
          <DashboardLoader
            className="mt-5"
            label="Loading mentorship requests..."
          />
        ) : requestsError ? (
          <div className="mt-5" role="alert">
            <p className="text-sm text-coral">
              {requestsError.message || "Could not load your requests."}
            </p>
            <DashboardButton
              variant="outline"
              className="mt-2"
              onClick={fetchRequests}
            >
              Try again
            </DashboardButton>
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-soft)] px-5 py-8 text-center">
            <UserRound className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-foreground">
              No requests yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              When you request a mentor, its progress will appear here.
            </p>
          </div>
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((request) => {
              const createdAt = requestDate(request.createdAt);
              const respondedAt = requestDate(request.respondedAt);

              return (
                <li
                  key={request.id}
                  className={cn(
                    "flex h-full flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-5 shadow-sm transition-shadow hover:shadow-md",
                    requests.length === 1 && "sm:col-span-2 lg:col-span-3",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/25 bg-accent/10 font-display text-sm font-bold text-accent">
                      {initialsFromName(request.mentorName)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-semibold text-foreground">
                        {request.mentorName}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Mentor request
                      </p>
                    </div>

                    <RequestStatus status={request.status} />
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      Sent {createdAt || "date unavailable"}
                    </p>
                    {respondedAt ? (
                      <p className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 shrink-0" />
                        Updated {respondedAt}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-auto pt-4">
                    {request.status === "PENDING" ? (
                      <DashboardButton
                        variant="outline"
                        className="w-full"
                        disabled={submittingId === request.id}
                        onClick={() => handleWithdraw(request)}
                      >
                        {submittingId === request.id
                          ? "Withdrawing..."
                          : "Withdraw"}
                      </DashboardButton>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {request.status === "CLOSED"
                          ? "Closed, you were matched with another mentor"
                          : "This request is no longer awaiting a response."}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DashboardGlassCard>

      <Modal
        open={startNowOpen}
        onClose={closeStartNow}
        eyebrow="Open availability"
        title="Start your mentorship now"
        footer={
          <>
            <DashboardButton
              variant="outline"
              onClick={closeStartNow}
              disabled={startingNow}
            >
              I'll wait for a reply
            </DashboardButton>
            <DashboardButton onClick={handleStartNow} disabled={startingNow}>
              {startingNow ? "Starting..." : "Start mentorship now"}
            </DashboardButton>
          </>
        }
      >
        <p className="text-sm leading-6 text-muted-foreground">
          {startNow?.mentorName} has open availability, so there's no need to
          wait for a reply. You can begin your mentorship straight away, or keep
          your request pending until they respond.
        </p>
        {startNowError ? (
          <p role="alert" className="text-sm text-coral">
            {startNowError}
          </p>
        ) : null}
      </Modal>
    </div>
  );
}
