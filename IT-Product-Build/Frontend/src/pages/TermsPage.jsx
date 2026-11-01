import { Helmet } from "react-helmet-async";
import { LegalPage } from "@/components/legal/LegalPage";
import { termsMeta, termsSections } from "@/content/legal/terms";

const title = "Terms · Herbaceous";
const description =
  "The rules for using Herbaceous as a mentee or mentor, and what Herbaceous can and can't promise.";

export function TermsPage() {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
      </Helmet>
      <LegalPage meta={termsMeta} sections={termsSections} />
    </>
  );
}
