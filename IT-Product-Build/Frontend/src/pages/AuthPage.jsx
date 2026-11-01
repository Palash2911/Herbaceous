import { Helmet } from "react-helmet-async";
import { AuthCard } from "@/components/auth/AuthCard";
import { SectionShell } from "@/components/layout/SectionShell";

const title = "Sign in · Herbaceous";
const description =
  "Access your Herbaceous pairing, or create an account as a mentee looking for an advocate or a senior woman ready to sponsor one.";

export function AuthPage() {
  return (
    <SectionShell className="pt-32 sm:pt-36" width="wide">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="robots" content="noindex" />
      </Helmet>
      <AuthCard />
    </SectionShell>
  );
}
