import { Eyebrow } from "@/components/ui/Eyebrow";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  isEmailServiceConfigured,
  sendCredentialsEmail,
} from "@/services/emailService";
import { Check, Copy, Download, KeyRound, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthVisualPanel } from "./AuthVisualPanel";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2 rounded-[14px] border border-[var(--hairline)] bg-[var(--card)] px-4 py-3">
        <code className="flex-1 truncate text-sm">{value}</code>
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${label.toLowerCase()}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-text"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}

function EmailMeField({ value, onChange, status, onSubmit }) {
  const canSend = EMAIL_RE.test(value) && status !== "sending";

  const helperText =
    status === "sent"
      ? "Sent. Check spam if it doesn't arrive in a few minutes."
      : status === "error"
        ? "Couldn't send. Use Download as .txt instead."
        : "Sent once through EmailJS. Herbaceous never stores your email.";

  const helperClass =
    status === "sent"
      ? "text-accent"
      : status === "error"
        ? "text-coral"
        : "text-muted";

  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted uppercase">
        Email me these (optional)
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-1 flex items-center gap-2 rounded-[14px] border border-[var(--hairline)] bg-[var(--card)] px-4 py-3"
      >
        <input
          type="email"
          placeholder="you@example.com"
          value={value}
          onChange={onChange}
          disabled={status === "sending"}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Email these credentials to me"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-text disabled:opacity-40"
        >
          {status === "sending" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
      <p className={`mt-1.5 text-xs ${helperClass}`}>{helperText}</p>
    </div>
  );
}

export function SignupCredentialsCard() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [acknowledged, setAcknowledged] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailStatus, setEmailStatus] = useState("idle");

  if (!state?.syntheticEmail || !state?.password) {
    return <Navigate to="/signup" replace />;
  }

  const { syntheticEmail, password, displayName, role } = state;
  const emailConfigured = isEmailServiceConfigured();

  const onDownload = () => {
    const text = `Herbaceous login credentials
Login email: ${syntheticEmail}
Password: ${password}
Display name: ${displayName}
Role: ${role}

These credentials cannot be recovered if lost. Save this file somewhere safe.
`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "herbaceous-credentials.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onSendEmail = async (event) => {
    event.preventDefault();
    if (!EMAIL_RE.test(emailInput) || emailStatus === "sending") return;

    setEmailStatus("sending");
    try {
      await sendCredentialsEmail({
        toEmail: emailInput,
        loginEmail: syntheticEmail,
        password,
      });
      setEmailStatus("sent");
      setEmailInput("");
    } catch {
      setEmailStatus("error");
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2">
      <AuthVisualPanel mode="signup" />

      <GlassCard className="flex flex-col gap-6 p-8 sm:p-10">
        <div>
          <Eyebrow>Herbaceous access</Eyebrow>
          <h1 className="mt-4 flex items-center gap-3 font-display text-3xl leading-tight font-semibold">
            <KeyRound className="text-accent" size={28} aria-hidden />
            Save your credentials
          </h1>
        </div>

        <div className="space-y-4">
          <CopyField label="Login email" value={syntheticEmail} />
          <CopyField label="Password" value={password} />
          {emailConfigured ? (
            <EmailMeField
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setEmailStatus("idle");
              }}
              status={emailStatus}
              onSubmit={onSendEmail}
            />
          ) : null}
        </div>

        <button
          type="button"
          onClick={onDownload}
          className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full border border-[var(--hairline)] px-5 text-sm font-medium transition-colors hover:text-text"
        >
          <Download size={16} />
          Download as .txt
        </button>

        <p className="text-sm font-medium text-foreground">
          This password cannot be recovered. If you lose it, you will need to
          create a new account. We do not store your real email, so there is no
          automatic reset.
        </p>

        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-accent"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          I've saved these credentials somewhere safe.
        </label>

        <button
          type="button"
          disabled={!acknowledged}
          onClick={() => navigate("/auth")}
          className="btn-primary inline-flex h-12 w-fit items-center justify-center gap-2 px-6 text-sm font-medium disabled:opacity-50"
        >
          Continue to login
        </button>
      </GlassCard>
    </div>
  );
}
