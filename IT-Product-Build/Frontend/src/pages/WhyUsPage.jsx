import { Helmet } from "react-helmet-async";
import { ClosingCta } from "@/components/home/ClosingCta";
import { MentorshipGapChart } from "@/components/whyus/MentorshipGapChart";
import { PipelineFunnel } from "@/components/whyus/PipelineFunnel";
import { WhyUsHero } from "@/components/whyus/WhyUsHero";
import { WorkforceMovementChart } from "@/components/whyus/WorkforceMovementChart";

const title = "Why Us · Herbaceous";

const description =
  "Explore ABS Census 2021 and WGEA FY2024-25 evidence on women's STEM qualifications, workforce representation and workforce movement in Australia.";

export function WhyUsPage() {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <WhyUsHero />
      <PipelineFunnel />
      <MentorshipGapChart />
      <WorkforceMovementChart />
      <ClosingCta />
    </>
  );
}