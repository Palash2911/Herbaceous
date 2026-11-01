import { GlassCard } from "@/components/ui/GlassCard";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";
import {
  isContactFormConfigured,
  sendContactMessage,
} from "@/services/emailService";
import { motion } from "framer-motion";
import { useState } from "react";
import { FloatingField } from "./FloatingField";
import { FloatingTextarea } from "./FloatingTextarea";
import { SubmitButton } from "./SubmitButton";

export function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    organisation: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const [sendError, setSendError] = useState("");
  const available = isContactFormConfigured();

  const update = (key) => (value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSendError("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!available || state !== "idle") return;
    const next = {};
    if (values.name.trim().length === 0) next.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = "That email looks incomplete.";
    if (values.message.trim().length === 0)
      next.message = "A little more detail helps us route this.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setState("sending");
    setSendError("");
    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      setState("sent");
    } catch (error) {
      setSendError(
        error.message ||
          "We couldn't send your message. Please try again.",
      );
      setState("idle");
    }
  };

  return (
    <motion.form
      onSubmit={onSubmit}
      noValidate
      variants={stagger(0.05, 0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      <GlassCard className="flex flex-col gap-4 p-8">
        <motion.div variants={fadeUp}>
          <FloatingField
            id="name"
            label="Your name"
            value={values.name}
            onChange={update("name")}
            error={errors.name}
            autoComplete="name"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <FloatingField
            id="email"
            label="Email address"
            type="email"
            value={values.email}
            onChange={update("email")}
            error={errors.email}
            autoComplete="email"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <FloatingField
            id="organisation"
            label="University, lab or company (optional)"
            value={values.organisation}
            onChange={update("organisation")}
            error={errors.organisation}
            autoComplete="organization"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <FloatingTextarea
            id="message"
            label="What are you trying to do?"
            value={values.message}
            onChange={update("message")}
            error={errors.message}
          />
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center gap-4"
        >
          <SubmitButton state={state} disabled={!available} />
          {!available ? (
            <span role="status" className="text-sm text-muted-foreground">
              The contact form is unavailable right now.
            </span>
          ) : sendError ? (
            <span role="alert" className="text-sm text-coral">
              {sendError}
            </span>
          ) : state === "sent" ? (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-teal"
            >
              Thanks, we will reply within two working days.
            </motion.span>
          ) : null}
        </motion.div>
      </GlassCard>
    </motion.form>
  );
}
