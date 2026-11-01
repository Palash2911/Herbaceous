import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { SectionShell } from "@/components/layout/SectionShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskedHeadline } from "@/components/ui/MaskedHeadline";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactAside } from "@/components/contact/ContactAside";
import { ease } from "@/lib/motion";

const title = "Contact · Herbaceous";
const description =
  "Get in touch with the Herbaceous programme team about mentorship, becoming an advocate, or running the programme inside your organisation.";

export function ContactPage() {
  return (
    <SectionShell className="pt-32 sm:pt-40">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Eyebrow>Contact</Eyebrow>
      </motion.div>

      <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] font-semibold sm:text-5xl">
        <MaskedHeadline
          text="Tell us what you are trying to open."
          delay={0.15}
          className="justify-start text-left"
        />
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6, ease }}
        className="mt-6 max-w-xl leading-relaxed text-muted"
      >
        A promotion, a lab position, a first technical role, or a mentor programme at your own
        organisation. Start anywhere.
      </motion.p>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm />
        <ContactAside />
      </div>
    </SectionShell>
  );
}
