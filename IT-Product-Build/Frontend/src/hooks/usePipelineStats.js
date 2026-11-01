import { API_BASE_URL } from "@/lib/api";
import { useEffect, useState } from "react";

export function usePipelineStats(section) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      try {
        const url = section
          ? `${API_BASE_URL}/api/pipeline-stats/${section}`
          : `${API_BASE_URL}/api/pipeline-stats`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load stats.");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [section]);

  return { data, loading, error };
}
