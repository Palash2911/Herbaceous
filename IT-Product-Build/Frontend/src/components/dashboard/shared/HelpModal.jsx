import { CheckCircle2, ExternalLink, Phone, Send } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Modal } from "@/components/dashboard/shared/Modal";
import {
  DashboardButton,
  Field,
  inputClass,
} from "@/components/dashboard/shared/primitives";
import { createHelpTicket } from "@/services/helpService";

const MAX_MESSAGE_LENGTH = 1000;

const SUPPORT_LINES = [
  {
    name: "Police Assistance Line",
    description: "Non-urgent police matters.",
    number: "131 444",
    tel: "131444",
  },
  {
    name: "Lifeline",
    description: "24/7 crisis support.",
    number: "13 11 14",
    tel: "131114",
  },
  {
    name: "1800RESPECT",
    description: "Sexual, domestic and family violence.",
    number: "1800 737 732",
    tel: "1800737732",
  },
  {
    name: "Beyond Blue",
    description: "Mental health support.",
    number: "1300 22 4636",
    tel: "1300224636",
  },
];

const CATEGORIES = [
  { value: "CONDUCT", label: "Mentor or mentee conduct" },
  { value: "SAFETY", label: "Safety concern" },
  { value: "TECHNICAL", label: "Technical issue" },
  { value: "OTHER", label: "Other" },
];

const lineLinkClass =
  "flex items-center gap-3 rounded-[16px] border border-[var(--hairline)] bg-[var(--surface-soft)] px-4 py-3 transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20";

export function HelpModal({ open, onClose }) {
  const counterId = useId();
  const linesHeadingId = useId();
  const reportHeadingId = useId();
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setState("idle");
      setError("");
    }
  }, [open]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (state === "sending") return;

    const trimmed = message.trim();
    if (!category) {
      setError("Please choose a category.");
      return;
    }
    if (trimmed.length === 0) {
      setError("Please describe the problem.");
      return;
    }

    setState("sending");
    setError("");
    try {
      await createHelpTicket(category, trimmed);
      setCategory("");
      setMessage("");
      setState("sent");
    } catch (err) {
      setError(
        err?.message ||
          "We couldn't send your report. Please check your connection and try again.",
      );
      setState("idle");
    }
  };

  const clearFeedback = () => {
    if (state === "sent") setState("idle");
    if (error) setError("");
  };

  return (
    <Modal open={open} onClose={onClose} eyebrow="Help and safety" title="Get help">
      <div
        className="rounded-2xl border p-4"
        style={{
          background: "color-mix(in srgb, var(--coral) 10%, var(--card))",
          borderColor: "color-mix(in srgb, var(--coral) 35%, var(--hairline))",
        }}
      >
        <p className="text-sm font-semibold leading-6 text-foreground">
          If you are in immediate danger, call 000.
        </p>
        <a
          href="tel:000"
          aria-label="Call 000, emergency services"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-coral/30"
        >
          <Phone size={15} aria-hidden="true" />
          Call 000
        </a>
      </div>

      <section aria-labelledby={linesHeadingId}>
        <h4 id={linesHeadingId} className="label-caps">
          Support lines
        </h4>
        <ul className="mt-3 space-y-2">
          {SUPPORT_LINES.map((line) => (
            <li key={line.tel}>
              <a
                href={`tel:${line.tel}`}
                aria-label={`Call ${line.name} on ${line.number}. ${line.description}`}
                className={lineLinkClass}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-accent"
                  style={{
                    background:
                      "color-mix(in srgb, var(--accent) 14%, transparent)",
                  }}
                >
                  <Phone size={15} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {line.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {line.description}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-foreground">
                  {line.number}
                </span>
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://www.esafety.gov.au/report"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Report online abuse to the eSafety Commissioner, opens in a new tab"
              className={lineLinkClass}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-accent"
                style={{
                  background:
                    "color-mix(in srgb, var(--accent) 14%, transparent)",
                }}
              >
                <ExternalLink size={15} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  eSafety Commissioner
                </span>
                <span className="block text-xs text-muted-foreground">
                  Report online abuse.
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-foreground">
                Report
              </span>
            </a>
          </li>
        </ul>
      </section>

      <section aria-labelledby={reportHeadingId}>
        <h4 id={reportHeadingId} className="label-caps">
          Report a problem
        </h4>
        <form onSubmit={onSubmit} noValidate className="mt-3 space-y-4">
          <Field label="Category">
            <select
              className={inputClass}
              value={category}
              required
              onChange={(event) => {
                setCategory(event.target.value);
                clearFeedback();
              }}
            >
              <option value="" disabled>
                Choose a category
              </option>
              {CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Message">
            <textarea
              className={`${inputClass} min-h-28 resize-y`}
              value={message}
              required
              maxLength={MAX_MESSAGE_LENGTH}
              aria-describedby={counterId}
              onChange={(event) => {
                setMessage(event.target.value);
                clearFeedback();
              }}
            />
          </Field>
          <p
            id={counterId}
            className="-mt-2 text-right text-xs text-muted-foreground"
          >
            {message.length}/{MAX_MESSAGE_LENGTH} characters
          </p>

          {error ? (
            <p role="alert" className="text-sm text-coral">
              {error}
            </p>
          ) : null}

          <div role="status" aria-live="polite">
            {state === "sent" ? (
              <p className="flex items-center gap-2 text-sm text-teal">
                <CheckCircle2 size={16} aria-hidden="true" />
                Thanks. The team will review this.
              </p>
            ) : null}
          </div>

          <div className="flex justify-end">
            <DashboardButton type="submit" disabled={state === "sending"}>
              <Send size={15} aria-hidden="true" />
              {state === "sending" ? "Sending" : "Send report"}
            </DashboardButton>
          </div>
        </form>
      </section>

      <p className="border-t border-[var(--hairline)] pt-4 text-center text-xs text-muted-foreground">
        Herbaceous is not an emergency service.
      </p>
    </Modal>
  );
}
