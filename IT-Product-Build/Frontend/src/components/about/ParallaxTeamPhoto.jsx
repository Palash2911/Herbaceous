import teamPhoto from "@/assets/Team_Photo.jpg";
import { SectionShell } from "@/components/layout/SectionShell";
import { useGsapScroll } from "@/hooks/useGsapScroll";

export function ParallaxTeamPhoto() {
  const scopeRef = useGsapScroll(({ gsap, reduced, scope }) => {
    const image = scope.querySelector("[data-parallax-image]");
    const caption = scope.querySelector("[data-parallax-caption]");
    if (!image) return;

    if (reduced) {
      gsap.set(image, { yPercent: 0, scale: 1 });
      if (caption) gsap.set(caption, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      image,
      { yPercent: -12, scale: 1.16 },
      {
        yPercent: 12,
        scale: 1.16,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );

    if (caption) {
      gsap.fromTo(
        caption,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: { trigger: scope, start: "top 70%", once: true },
        },
      );
    }
  });

  return (
    <SectionShell width="wide">
      <div ref={scopeRef} className="relative overflow-hidden rounded-[32px]">
        <div className="relative h-80 overflow-hidden sm:h-[380px] lg:h-190">
          <img
            src={teamPhoto}
            alt="Team TA06, Master of Information Technology, Monash University"
            data-parallax-image
            aria-hidden
            style={{ objectPosition: "50% 30%" }}
            className="absolute inset-0 h-full w-full object-cover object-top will-change-transform"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--bg) 10%, transparent), color-mix(in oklab, var(--bg) 78%, transparent))",
            }}
          />
        </div>

        <div
          data-parallax-caption
          className="absolute bottom-0 left-0 max-w-xl p-8 sm:p-12"
        >
          <p className="font-display text-xl leading-snug font-semibold sm:text-2xl">
            Team TA06, Master of Information Technology, Monash University.
          </p>
          <span className="mt-2 block text-sm text-muted">
            Monash Industry Experience capstone project
          </span>
        </div>
      </div>
    </SectionShell>
  );
}
