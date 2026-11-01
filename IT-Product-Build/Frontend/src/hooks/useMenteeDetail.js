import { getMenteeDetail } from "@/services/mentorService";
import { useCallback, useEffect, useState } from "react";

export function useMenteeDetail(mentorshipId) {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!mentorshipId) {
      setResult({ mentorshipId, detail: null, error: null });
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      getMenteeDetail(mentorshipId)
        .then((detail) => {
          if (!cancelled) setResult({ mentorshipId, detail, error: null });
        })
        .catch((error) => {
          if (!cancelled) setResult({ mentorshipId, detail: null, error });
        });
    });

    return () => {
      cancelled = true;
    };
  }, [mentorshipId, attempt]);

  const refetch = useCallback(() => {
    setResult((prev) => (prev?.error ? null : prev));
    setAttempt((n) => n + 1);
  }, []);

  const settled = result !== null && result.mentorshipId === mentorshipId;

  return {
    mentee: settled ? result.detail : null,
    error: settled ? result.error : null,
    loading: !settled,
    refetch,
  };
}
