import { Helmet } from "react-helmet-async";
import { DashboardOrbs } from "@/components/dashboard/layout/DashboardOrbs";
import { QuizFlow } from "@/components/onboarding/QuizFlow";

export function OnboardingPage() {
  return (
    <>
      <Helmet>
        <title>Get started · Herbaceous</title>
      </Helmet>
      <DashboardOrbs />
      <QuizFlow />
    </>
  );
}
