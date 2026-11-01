import { listAdvocacyInbox } from "@/services/mentorService";
import { useCallback, useEffect, useState } from "react";

export function useAdvocacyInbox(status, includeEnded) {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      listAdvocacyInbox({ status, includeEnded: includeEnded ? "true" : undefined })
        .then((list) => {
          if (!cancelled) setResult({ status, includeEnded, list, error: null });
        })
        .catch((error) => {
          if (!cancelled) setResult({ status, includeEnded, list: null, error });
        });
    });

    return () => {
      cancelled = true;
    };
  }, [status, includeEnded, attempt]);

  const refetch = useCallback(() => {
    setResult((prev) => (prev?.error ? null : prev));
    setAttempt((n) => n + 1);
  }, []);

  const settled =
    result !== null && result.status === status && result.includeEnded === includeEnded;

  return {
    requests: settled ? result.list : null,
    error: settled ? result.error : null,
    loading: !settled,
    refetch,
  };
}
