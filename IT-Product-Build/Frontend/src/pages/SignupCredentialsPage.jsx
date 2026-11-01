import { Helmet } from "react-helmet-async";
import { SignupCredentialsCard } from "@/components/auth/SignupCredentialsCard";
import { SectionShell } from "@/components/layout/SectionShell";

const title = "Sign up · Herbaceous";
const description = "Your Herbaceous login email and password, generated just now.";

export function SignupCredentialsPage() {
  return (
    <SectionShell className="pt-32 sm:pt-36" width="wide">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex" />
      </Helmet>
      <SignupCredentialsCard />
    </SectionShell>
  );
}
