import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, UserPlus, Users, Award, FileSignature, MessageCircle } from "lucide-react";
import { DashboardGlassCard, DashboardLabel, DashboardButton } from "@/components/dashboard/shared/primitives";
import { advocacyTemplates } from "@/content/dashboard/mentee-data";

const icons = {
  referral: UserPlus,
  introduction: Users,
  nomination: Award,
  endorsement: FileSignature,
  other: MessageCircle,
};

export function TemplateGrid({ onSubmit, pendingTypes = [], disabled = false }) {
  const [selected, setSelected] = useState(null);
  const [ask, setAsk] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!selected) return;
    setSaving(true);
    try {
      const saved = await onSubmit(selected.id.toUpperCase(), ask.trim());
      if (saved) {
        setSelected(null);
        setAsk("");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardGlassCard data-reveal>
      <DashboardLabel>New request</DashboardLabel>
      <h2 className="mt-1 text-xl font-semibold">Choose what to ask your mentor for</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {disabled
          ? "New requests are available during an active mentorship."
          : "Pick one option. You'll add the details next, then send it to your mentor."}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {advocacyTemplates.map((t) => {
          const Icon = icons[t.icon];
          const pending = pendingTypes.includes(t.id.toUpperCase());
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t)}
              disabled={disabled || pending}
              className="group flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-accent/5 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
            >
              <div className="flex items-center justify-between gap-2">
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                <span className="label-caps text-[10px] text-muted-foreground">{t.type}</span>
              </div>
              <p className="mt-3 font-display text-sm font-semibold">{t.title}</p>
              <p className="mt-1 flex-1 text-xs text-muted-foreground">{t.description}</p>
              {pending ? (
                <p className="mt-3 text-xs text-amber">Already asked, waiting for reply</p>
              ) : (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Choose
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected
        ? createPortal(
            <div
              className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-black/60 p-4"
              role="dialog"
              aria-modal="true"
              aria-label={`${selected.type} request`}
            >
              <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-[24px] border border-border bg-card p-6 text-foreground shadow-2xl">
                <DashboardLabel>
                  {selected.type} · {selected.title}
                </DashboardLabel>
                <h3 className="mt-1 font-display text-lg font-semibold">
                  Add the details
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected.description}
                </p>
                <textarea
                  value={ask}
                  onChange={(e) => setAsk(e.target.value)}
                  maxLength={1000}
                  placeholder={selected.placeholder}
                  className="mt-4 min-h-28 w-full rounded-2xl border border-border bg-transparent p-3 text-sm outline-none focus:border-accent"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {selected.id === "other"
                    ? `Required · ${ask.length}/1000`
                    : `Details optional · ${ask.length}/1000`}
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <DashboardButton
                    variant="outline"
                    disabled={saving}
                    onClick={() => {
                      setSelected(null);
                      setAsk("");
                    }}
                  >
                    Cancel
                  </DashboardButton>
                  <DashboardButton
                    disabled={
                      saving ||
                      (selected.id === "other" && ask.trim().length === 0)
                    }
                    className="px-5 py-2.5 font-semibold disabled:opacity-50"
                    onClick={submit}
                  >
                    {saving ? "Sending..." : "Send request"}
                  </DashboardButton>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </DashboardGlassCard>
  );
}
