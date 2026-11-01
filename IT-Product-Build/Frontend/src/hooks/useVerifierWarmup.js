import { warmupVerifier } from "@/services/mentorService";
import { useCallback, useEffect, useState } from "react";

const POLL_INTERVAL_MS = 3000;
const SLOW_AFTER_MS = 8000;
const GIVE_UP_AFTER_MS = 75000;

export function useVerifierWarmup() {
  const [state, setState] = useState("warming");
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let pollTimer = null;
    let controller = null;
    const startedAt = Date.now();

    const slowTimer = setTimeout(() => {
      if (!cancelled) setSlow(true);
    }, SLOW_AFTER_MS);
    const giveUpTimer = setTimeout(() => {
      if (cancelled) return;
      cancelled = true;
      clearTimeout(pollTimer);
      controller?.abort();
      setState("failed");
    }, GIVE_UP_AFTER_MS);

    const poll = async () => {
      controller = new AbortController();
      let ready = false;
      try {
        const data = await warmupVerifier(controller.signal);
        ready = data?.ready === true;
      } catch {
        ready = false;
      }
      if (cancelled) return;
      if (ready) {
        cancelled = true;
        clearTimeout(slowTimer);
        clearTimeout(giveUpTimer);
        setState("ready");
        return;
      }
      if (Date.now() - startedAt + POLL_INTERVAL_MS >= GIVE_UP_AFTER_MS) return;
      pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(pollTimer);
      clearTimeout(slowTimer);
      clearTimeout(giveUpTimer);
      controller?.abort();
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState("warming");
    setSlow(false);
    setAttempt((value) => value + 1);
  }, []);

  return { state, slow, retry };
}
