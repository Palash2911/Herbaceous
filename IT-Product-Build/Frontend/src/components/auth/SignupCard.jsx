import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { AuthVisualPanel } from "./AuthVisualPanel";
import { SignupForm } from "./SignupForm";

export function SignupCard() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2">
      <AuthVisualPanel mode="signup" />

      <GlassCard className="flex flex-col gap-8 p-8 sm:p-10">
        <div>
          <Eyebrow>Herbaceous access</Eyebrow>
          <h1 className="mt-4 font-display text-3xl leading-tight font-semibold">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Pick your role. We'll generate a login email and password for
            you on the next screen.
          </p>
        </div>

        <SignupForm />

        <p className="text-sm text-muted">
          Already have login credentials?{" "}
          <Link to="/auth" className="text-accent">
            Log in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
