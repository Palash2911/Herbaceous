import { getVerificationStatus } from "@/services/mentorService";
import { useEffect, useState } from "react";

export function useVerificationStatus(active = true) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;
    getVerificationStatus()
      .then((data) => {
        if (!cancelled) setStatus(data ?? null);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });

    return () => {
      cancelled = true;
    };
  }, [active]);

  return active ? status : null;
}
