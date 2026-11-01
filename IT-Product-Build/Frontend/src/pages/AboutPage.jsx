import { Helmet } from "react-helmet-async";
import { MissionVision } from "@/components/about/MissionVision";
import { ParallaxTeamPhoto } from "@/components/about/ParallaxTeamPhoto";
import { TeamGrid } from "@/components/about/TeamGrid";
import { ClosingCta } from "@/components/home/ClosingCta";

const title = "About · Herbaceous";
const description =
  "Herbaceous turns mentorship into measurable advancement for women in science and engineering. Meet the six-person team of researchers, engineers and programme designers behind it.";

export function AboutPage() {
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
      <MissionVision />
      <ParallaxTeamPhoto />
      <TeamGrid />
      <ClosingCta />
    </>
  );
}
