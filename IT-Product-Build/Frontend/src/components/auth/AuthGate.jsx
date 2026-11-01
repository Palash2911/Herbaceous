import { DashboardBootLoader } from "@/components/dashboard/layout/DashboardBootLoader";
import { resolveUserRoute } from "@/services/authGate";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function AuthGate({ target, role, children }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    resolveUserRoute().then((route) => {
      if (cancelled) return;
      if (route === null) {
        navigate("/", { replace: true });
      } else if (role ? route.role === role : route.destination === target) {
        setAllowed(true);
      } else {
        navigate(route.destination, { replace: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [target, role, navigate]);

  if (!allowed) return target === "/dashboard" ? <DashboardBootLoader /> : null;
  return children;
}
