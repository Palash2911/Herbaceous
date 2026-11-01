import { AuthGate } from "@/components/auth/AuthGate";
import { BackgroundOrbs } from "@/components/layout/BackgroundOrbs";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { Preloader } from "@/components/layout/Preloader";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { IntroProvider } from "@/context/IntroContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { AboutPage } from "@/pages/AboutPage";
import { AuthPage } from "@/pages/AuthPage";
import { ContactPage } from "@/pages/ContactPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { LandingPage } from "@/pages/LandingPage";
import { MentorOnboardingPage } from "@/pages/MentorOnboardingPage";
import { MentorVerificationPage } from "@/pages/MentorVerificationPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { SignupCredentialsPage } from "@/pages/SignupCredentialsPage";
import { SignupPage } from "@/pages/SignupPage";
import { TermsPage } from "@/pages/TermsPage";
import { WhyUsPage } from "@/pages/WhyUsPage";
import { MotionConfig } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

function AppShellRouter() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isOnboarding = location.pathname.startsWith("/onboarding");
  const isMentorOnboarding = location.pathname.startsWith("/mentor/onboarding");
  const isMentorVerification = location.pathname.startsWith(
    "/mentor/verification",
  );
  const hasOwnChrome =
    isDashboard || isOnboarding || isMentorOnboarding || isMentorVerification;

  const routes = (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/why-us" element={<WhyUsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signup/credentials" element={<SignupCredentialsPage />} />
      <Route
        path="/dashboard/*"
        element={
          <AuthGate target="/dashboard">
            <DashboardPage />
          </AuthGate>
        }
      />
      <Route
        path="/onboarding"
        element={
          <AuthGate target="/onboarding">
            <OnboardingPage />
          </AuthGate>
        }
      />
      <Route
        path="/mentor/onboarding"
        element={
          <AuthGate target="/mentor/onboarding">
            <MentorOnboardingPage />
          </AuthGate>
        }
      />
      <Route
        path="/mentor/verification"
        element={
          <AuthGate target="/mentor/verification" role="MENTOR">
            <MentorVerificationPage />
          </AuthGate>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );

  return (
    <>
      <Preloader />
      {hasOwnChrome ? (
        routes
      ) : (
        <SmoothScrollProvider>
          <BackgroundOrbs />
          <Header />
          <PageTransition>{routes}</PageTransition>
          <Footer />
        </SmoothScrollProvider>
      )}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <ThemeProvider>
            <MotionConfig reducedMotion="user">
              <IntroProvider>
                <AppShellRouter />
              </IntroProvider>
            </MotionConfig>
          </ThemeProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
