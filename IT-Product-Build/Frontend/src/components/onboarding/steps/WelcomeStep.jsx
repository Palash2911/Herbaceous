import { ArrowRight } from "lucide-react";
import { welcome } from "@/content/onboarding";
import { MonoLabel, PrimaryButton } from "../primitives";

export function WelcomeStep({ onStart, content = welcome }) {
  return (
    <div>
      <MonoLabel className="text-primary">{content.kicker}</MonoLabel>
      <h1 className="mt-[16px] text-[30px] leading-tight font-semibold sm:text-[38px]">
        {content.headline}
      </h1>
      <p className="mt-[16px] max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground">
        {content.body}
      </p>
      <PrimaryButton className="mt-[32px]" onClick={onStart} autoFocus>
        {content.cta}
        <ArrowRight className="size-[17px]" aria-hidden />
      </PrimaryButton>
    </div>
  );
}
