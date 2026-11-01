import { Helmet } from "react-helmet-async";
import { AppShell } from "@/components/dashboard/layout/AppShell";
import { StoreProvider } from "@/components/dashboard/shared/store";

export function DashboardPage() {
  return (
    <StoreProvider>
      <Helmet>
        <title>Dashboard · Herbaceous</title>
      </Helmet>
      <AppShell />
    </StoreProvider>
  );
}
