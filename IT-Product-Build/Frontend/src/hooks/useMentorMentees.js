import { listMentees } from "@/services/mentorService";
import { useCallback, useEffect, useState } from "react";

export function useMentorMentees(status) {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      listMentees(status)
        .then((list) => {
          if (!cancelled) setResult({ status, list, error: null });
        })
        .catch((error) => {
          if (!cancelled) setResult({ status, list: null, error });
        });
    });

    return () => {
      cancelled = true;
    };
  }, [status, attempt]);

  const refetch = useCallback(() => {
    setResult((prev) => (prev?.error ? null : prev));
    setAttempt((n) => n + 1);
  }, []);

  const settled = result !== null && result.status === status;

  return {
    mentees: settled ? result.list : null,
    error: settled ? result.error : null,
    loading: !settled,
    refetch,
  };
}
