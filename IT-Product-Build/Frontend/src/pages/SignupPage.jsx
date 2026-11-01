import { Helmet } from "react-helmet-async";
import { SignupCard } from "@/components/auth/SignupCard";
import { SectionShell } from "@/components/layout/SectionShell";

const title = "Sign up · Herbaceous";
const description =
  "Generate a login email and password to get started with Herbaceous.";

export function SignupPage() {
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
      <SignupCard />
    </SectionShell>
  );
}
