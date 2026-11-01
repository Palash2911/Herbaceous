import { Helmet } from "react-helmet-async";
import { Hero } from "@/components/home/Hero";
import { StatStrip } from "@/components/home/StatStrip";
import { AdviceVsAdvocacy } from "@/components/home/AdviceVsAdvocacy";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ClosingCta } from "@/components/home/ClosingCta";

const title = "Herbaceous";

const description =
  "Women are 17.4% of Australian STEM qualification holders and 36.5% of the STEM industry workforce. Herbaceous turns mentorship into measurable advocacy.";

export function LandingPage() {
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

      <Hero />
      <StatStrip />
      <AdviceVsAdvocacy />
      <HowItWorks />
      <ClosingCta />
    </>
  );
}