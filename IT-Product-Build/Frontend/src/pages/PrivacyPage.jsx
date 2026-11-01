import { Helmet } from "react-helmet-async";
import { LegalPage } from "@/components/legal/LegalPage";
import {
  privacyMeta,
  privacySections,
  privacySummary,
} from "@/content/legal/privacy";

const title = "Privacy · Herbaceous";
const description =
  "What Herbaceous collects, why, who else handles it, how long it is kept and the choices you have.";

export function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
      </Helmet>
      <LegalPage
        meta={privacyMeta}
        sections={privacySections}
        summary={privacySummary}
      />
    </>
  );
}
