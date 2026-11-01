import { DashboardOrbs } from "@/components/dashboard/layout/DashboardOrbs";
import { DashboardLoader } from "@/components/dashboard/shared/DashboardLoader";
import { DashboardGlassCard } from "@/components/dashboard/shared/primitives";

export function DashboardBootLoader() {
  return (
    <div className="min-h-dvh">
      <DashboardOrbs />
      <main className="flex min-h-dvh p-4 sm:p-7">
        <DashboardGlassCard className="grid flex-1 place-items-center">
          <DashboardLoader label="Loading your workspace..." />
        </DashboardGlassCard>
      </main>
    </div>
  );
}
