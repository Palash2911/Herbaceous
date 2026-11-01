import { adminApprovals, adminTickets } from "@/content/dashboard/admin-data";
import { getSummary } from "@/services/authService";
import { getCurrentSession } from "@/services/cognitoAuth";
import {
  getMentorship,
  getOverview,
  getTolerance,
} from "@/services/menteeService";
import { getMentorOverview } from "@/services/mentorService";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const StoreContext = createContext(null);

const defaultView = {
  mentee: "overview",
  mentor: "overview",
  admin: "overview",
};

const BACKEND_ROLE_MAP = {
  MENTOR: "mentor",
  MENTEE: "mentee",
  ADMIN: "admin",
};

export function StoreProvider({ children }) {
  const [role, setRoleState] = useState("mentee");
  const [roleLoading, setRoleLoading] = useState(true);
  const [displayName, setDisplayName] = useState(null);
  const [view, setView] = useState("overview");
  const [selectedMentorshipId, setSelectedMentorshipId] = useState(null);

  const [mentorship, setMentorship] = useState(null);
  const [mentorshipLoading, setMentorshipLoading] = useState(true);
  const [mentorshipError, setMentorshipError] = useState(null);

  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState(null);

  const [tolerance, setTolerance] = useState(null);
  const [toleranceLoading, setToleranceLoading] = useState(true);
  const [toleranceError, setToleranceError] = useState(null);

  const [mentorOverview, setMentorOverview] = useState(null);
  const [mentorOverviewLoading, setMentorOverviewLoading] = useState(true);
  const [mentorOverviewError, setMentorOverviewError] = useState(null);

  const [approvals, setApprovals] = useState(adminApprovals);
  const [tickets, setTickets] = useState(adminTickets);

  const setRole = useCallback((r) => {
    setRoleState(r);
    setView(defaultView[r]);
    setSelectedMentorshipId(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await getCurrentSession();
        if (!session || cancelled) return;
        const summary = await getSummary();
        if (cancelled) return;
        setDisplayName(summary.displayName ?? null);
        const mapped = BACKEND_ROLE_MAP[summary.role];
        if (mapped) setRole(mapped);
      } catch {
        // Falls back to the default "mentee" role/view on failure.
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setRole]);

  const fetchMentorship = useCallback(async () => {
    await Promise.resolve();
    setMentorshipLoading(true);
    setMentorshipError(null);
    try {
      const data = await getMentorship();
      setMentorship(data);
    } catch (err) {
      setMentorshipError(err);
    } finally {
      setMentorshipLoading(false);
    }
  }, []);

  const fetchOverview = useCallback(async () => {
    await Promise.resolve();
    setOverviewLoading(true);
    setOverviewError(null);
    try {
      const data = await getOverview();
      setOverview(data);
    } catch (err) {
      setOverviewError(err);
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const fetchTolerance = useCallback(async () => {
    await Promise.resolve();
    setToleranceLoading(true);
    setToleranceError(null);
    try {
      const data = await getTolerance();
      setTolerance(data);
    } catch (err) {
      setToleranceError(err);
    } finally {
      setToleranceLoading(false);
    }
  }, []);

  const fetchMentorOverview = useCallback(async () => {
    await Promise.resolve();
    setMentorOverviewLoading(true);
    setMentorOverviewError(null);
    try {
      const data = await getMentorOverview();
      setMentorOverview(data);
    } catch (err) {
      setMentorOverviewError(err);
    } finally {
      setMentorOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (roleLoading || role !== "mentor") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      void fetchMentorOverview();
    });
    return () => {
      cancelled = true;
    };
  }, [roleLoading, role, fetchMentorOverview]);

  useEffect(() => {
    if (roleLoading || role !== "mentee") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      void fetchMentorship();
      void fetchOverview();
      void fetchTolerance();
    });
    return () => {
      cancelled = true;
    };
  }, [roleLoading, role, fetchMentorship, fetchOverview, fetchTolerance]);

  const openMenteeDetail = useCallback((id) => {
    setSelectedMentorshipId(id);
    setView("mentee-detail");
  }, []);

  const value = useMemo(
    () => ({
      role,
      roleLoading,
      setRole,
      displayName,
      setDisplayName,
      view,
      setView,
      selectedMentorshipId,
      openMenteeDetail,

      mentorship,
      mentorshipLoading,
      mentorshipError,
      refetchMentorship: fetchMentorship,

      overview,
      overviewLoading,
      overviewError,
      refetchOverview: fetchOverview,

      tolerance,
      toleranceLoading,
      toleranceError,
      refetchTolerance: fetchTolerance,

      mentorOverview,
      mentorOverviewLoading,
      mentorOverviewError,
      refetchMentorOverview: fetchMentorOverview,

      approvals,
      decideApproval: (id, approve, note) =>
        setApprovals((l) =>
          l.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: approve ? "approved" : "rejected",
                  adminNote: note,
                }
              : a,
          ),
        ),
      tickets,
      updateTicket: (id, patch) =>
        setTickets((l) => l.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    }),
    [
      role,
      roleLoading,
      setRole,
      displayName,
      setDisplayName,
      view,
      selectedMentorshipId,
      openMenteeDetail,
      mentorship,
      mentorshipLoading,
      mentorshipError,
      fetchMentorship,
      overview,
      overviewLoading,
      overviewError,
      fetchOverview,
      tolerance,
      toleranceLoading,
      toleranceError,
      fetchTolerance,
      mentorOverview,
      mentorOverviewLoading,
      mentorOverviewError,
      fetchMentorOverview,
      approvals,
      tickets,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
