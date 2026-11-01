import heroIllustration from "@/assets/Landing_Image.png";
import { SectionShell } from "@/components/layout/SectionShell";
import { ButtonLink } from "@/components/ui/ActionButton";
import { MaskedHeadline } from "@/components/ui/MaskedHeadline";
import { useIntro } from "@/context/IntroContext";
import { usePipelineStats } from "@/hooks/usePipelineStats";
import { prefersReducedMotionNow } from "@/hooks/useReducedMotion";
import { ease } from "@/lib/motion";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const HERO_INTRO = {
  textEase: ease,
  image: {
    delay: 0,
    origin: "center",
    from: { scale: 1.35, rotate: -8, x: "12%", y: "-10%" },
    fromMobile: { scale: 1.12, rotate: -4, x: "6%", y: "-5%" },
    sweepDuration: 1.4,
    sweepEase: [0.65, 0, 0.35, 1],
    fadeDuration: 0.4,
    fadeEase: "easeOut",
  },
  glow: { delay: 0, duration: 1.4, ease: "easeOut" },
  eyebrow: { delay: 0.9, duration: 0.7, x: -40 },
  headlineLine1: { delay: 1.1 },
  headlineLine2: { delay: 1.45 },
  paragraph: { delay: 1.8, duration: 0.8, x: -40 },
  buttons: { delay: 2.0, stagger: 0.1, duration: 0.7, x: -40 },
};

const LG_QUERY = "(min-width: 1024px)";

function slideVariants({ x, duration, delay = 0 }, reduced) {
  return {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, x },
    show: {
      ...(reduced ? { opacity: 1 } : { opacity: 1, x: 0 }),
      transition: { duration, delay, ease: HERO_INTRO.textEase },
    },
  };
}

function buttonVariants(reduced) {
  const { buttons } = HERO_INTRO;
  return {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, x: buttons.x },
    show: (index = 0) => ({
      ...(reduced ? { opacity: 1 } : { opacity: 1, x: 0 }),
      transition: {
        duration: buttons.duration,
        delay: buttons.delay + index * buttons.stagger,
        ease: HERO_INTRO.textEase,
      },
    }),
  };
}

function imageVariants(reduced, isLg) {
  const { image } = HERO_INTRO;
  const opacity = {
    duration: image.fadeDuration,
    delay: image.delay,
    ease: image.fadeEase,
  };
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { opacity } },
    };
  }
  return {
    hidden: {
      opacity: 0,
      ...(isLg ? image.from : image.fromMobile),
    },
    show: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      x: 0,
      y: 0,
      transition: {
        default: {
          duration: image.sweepDuration,
          delay: image.delay,
          ease: image.sweepEase,
        },
        opacity,
      },
    },
  };
}

const glowVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: HERO_INTRO.glow.duration,
      delay: HERO_INTRO.glow.delay,
      ease: HERO_INTRO.glow.ease,
    },
  },
};

export function Hero() {
  const { data: heroStats, error: heroStatsError } = usePipelineStats("hero");
  const { introReady } = useIntro();
  const [reduced] = useState(() => prefersReducedMotionNow());
  const [isLg] = useState(
    () => typeof window !== "undefined" && window.matchMedia(LG_QUERY).matches,
  );
  const intro = introReady ? "show" : "hidden";
  const buttonMotion = buttonVariants(reduced);

  const qualification = heroStats.find(
    (stat) => stat.key === "stem_qualification_hero",
  );

  const heroParagraph =
    !heroStatsError && qualification
      ? `Women represent ${qualification.value}${qualification.displaySuffix ?? ""} of Australian STEM qualification holders. Herbaceous connects women with senior advocates who can turn career guidance into visible opportunities.`
      : "Herbaceous connects women with senior advocates who can turn career guidance into visible opportunities.";

  return (
    <SectionShell
      width="full"
      className="overflow-x-clip px-5 pt-28 pb-16 sm:px-8 sm:pt-32 sm:pb-24 lg:px-[6%] lg:pt-26 lg:pb-20 xl:px-[8%]"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.span
            variants={slideVariants(HERO_INTRO.eyebrow, reduced)}
            initial="hidden"
            animate={intro}
            className="label-mono text-accent text-sm ml-1"
          >
            Women in STEM mentorship
          </motion.span>

          <h1 className="mt-7 font-display text-4xl font-semibold sm:text-5xl lg:text-[clamp(3.35rem,3.4vw,4.25rem)]">
            <span className="block">
              <MaskedHeadline
                text="Mentorship is advice."
                delay={HERO_INTRO.headlineLine1.delay}
                play={introReady}
                reduced={reduced}
                className="justify-center lg:flex-nowrap lg:justify-start"
              />
            </span>
            <span className="block text-accent">
              <MaskedHeadline
                text="We built the advocacy."
                delay={HERO_INTRO.headlineLine2.delay}
                play={introReady}
                reduced={reduced}
                className="justify-center lg:flex-nowrap lg:justify-start"
              />
            </span>
          </h1>

          <motion.p
            variants={slideVariants(HERO_INTRO.paragraph, reduced)}
            initial="hidden"
            animate={intro}
            className="mt-7 max-w-150 text-base leading-relaxed text-muted sm:text-lg lg:max-w-130"
          >
            {heroParagraph}
          </motion.p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <motion.div
              variants={buttonMotion}
              custom={0}
              initial="hidden"
              animate={intro}
            >
              <ButtonLink to="/auth">
                Find your advocate <ArrowRight size={16} />
              </ButtonLink>
            </motion.div>

            <motion.div
              variants={buttonMotion}
              custom={1}
              initial="hidden"
              animate={intro}
            >
              <ButtonLink to="/why-us" variant="outline">
                See the data
              </ButtonLink>
            </motion.div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-100 lg:mx-0 lg:mr-[-8vw] lg:max-w-none xl:mr-[-11vw]">
          <motion.div
            aria-hidden="true"
            variants={glowVariants}
            initial="hidden"
            animate={intro}
            className="pointer-events-none absolute inset-0 -z-10 translate-x-[6%] translate-y-[8%] scale-110 rounded-full bg-[radial-gradient(circle_at_58%_42%,color-mix(in_oklab,var(--color-accent)_30%,transparent),transparent_66%)] blur-[64px]"
          />

          <motion.div
            variants={imageVariants(reduced, isLg)}
            initial="hidden"
            animate={intro}
            style={{ transformOrigin: HERO_INTRO.image.origin }}
          >
            <img
              src={heroIllustration}
              alt="A senior woman in STEM reaching down to pull a younger woman up a rising path"
              width={950}
              height={950}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              draggable={false}
              className="w-full select-none drop-shadow-[0_28px_70px_rgba(36,26,71,0.20)] lg:scale-[1.02] lg:origin-center lg:pt-10 dark:drop-shadow-[0_28px_70px_rgba(0,0,0,0.5)] xl:max-2xl:scale-[1.18]"
            />
          </motion.div>
        </div>
      </div>
    </SectionShell>
  );
}
