import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ExternalLink,
  Link2,
  MessageSquareOff,
  Plus,
  ShieldOff,
  Video,
  X,
} from "lucide-react";
import {
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
  EmptyState,
} from "@/components/dashboard/shared/primitives";

function platformOf(url) {
  const value = url.toLowerCase();
  if (value.includes("zoom.")) {
    return { name: "Zoom", color: "var(--accent)" };
  }
  if (value.includes("meet.google")) {
    return { name: "Google Meet", color: "var(--teal)" };
  }
  if (value.includes("teams.microsoft")) {
    return { name: "Microsoft Teams", color: "var(--accent)" };
  }
  if (value.includes("discord")) {
    return { name: "Discord", color: "var(--coral)" };
  }
  return { name: "Other", color: "var(--muted-foreground)" };
}

export function MeetingLinks({ links, onAdd, partner = "your mentor" }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  function closeModal() {
    if (saving) return;
    setOpen(false);
    setUrl("");
    setLabel("");
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await onAdd(url.trim(), label.trim());
      if (saved !== false) {
        setUrl("");
        setLabel("");
        setOpen(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardGlassCard data-reveal>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <DashboardLabel>Meeting links</DashboardLabel>
          <h2 className="mt-1 text-xl font-semibold">Where you meet</h2>
        </div>
        <DashboardButton
          className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add meeting link
        </DashboardButton>
      </div>

      <p className="mt-3 flex items-start gap-2 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-3 text-xs leading-5 text-muted-foreground">
        <MessageSquareOff className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        Conversations happen outside this platform. Nothing said in your
        meetings is stored here, only the links you both add.
      </p>

      <div className="mt-5 space-y-3">
        {links.length ? (
          links.map((link) => {
            const platform = platformOf(link.url);

            return (
              <div
                key={link.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--hairline)] bg-[color-mix(in_srgb,var(--card)_68%,transparent)] p-3 transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-[color-mix(in_srgb,var(--accent)_7%,var(--card))] hover:shadow-sm"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    color: platform.color,
                    background: `color-mix(in srgb, ${platform.color} 14%, var(--card))`,
                  }}
                >
                  <Video className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {link.label || platform.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {platform.name} · added by{" "}
                    {link.createdBy ?? link.addedBy ?? "a participant"} ·{" "}
                    {link.createdAt
                      ? new Date(link.createdAt).toLocaleString()
                      : link.addedAt}
                  </p>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-card px-4 py-2 text-sm transition-colors hover:border-accent/40 hover:text-accent"
                >
                  Join
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={<Link2 className="h-6 w-6" />}
            title="No meeting links yet"
            body="Add the link you use for your sessions so both of you can find it quickly."
            action={
              <DashboardButton
                variant="outline"
                onClick={() => setOpen(true)}
              >
                Add meeting link
              </DashboardButton>
            }
          />
        )}
      </div>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-[rgba(10,6,22,0.5)] p-4"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeModal();
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeModal();
              }}
            >
              <form
                onSubmit={submit}
                className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-[28px] border border-[var(--hairline)] bg-card text-foreground shadow-2xl scroll-thin"
                role="dialog"
                aria-modal="true"
                aria-labelledby="meeting-link-modal-title"
              >
                <div className="flex items-start justify-between gap-4 border-b border-[var(--hairline)] px-6 py-5 sm:px-7">
                  <div className="flex min-w-0 items-start gap-3.5">
                    <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <Link2 className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <DashboardLabel>Meeting links</DashboardLabel>
                      <h3
                        id="meeting-link-modal-title"
                        className="mt-1 font-display text-xl font-semibold"
                      >
                        Add a meeting link
                      </h3>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        Keep the link you and {partner} use in one shared
                        place.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] text-muted-foreground transition-colors hover:bg-[var(--surface-soft)] hover:text-foreground disabled:opacity-50"
                    aria-label="Close meeting link form"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-5 px-6 py-6 sm:px-7">
                  <div>
                    <label htmlFor="meeting-link-url" className="label-caps">
                      Meeting URL
                    </label>
                    <div className="relative mt-2">
                      <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="meeting-link-url"
                        required
                        autoFocus
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        placeholder="https://meet.google.com/..."
                        type="url"
                        maxLength={500}
                        className="h-12 w-full rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="meeting-link-label" className="label-caps">
                      Label · Optional
                    </label>
                    <input
                      id="meeting-link-label"
                      value={label}
                      onChange={(event) => setLabel(event.target.value)}
                      placeholder="Fortnightly catch-up"
                      maxLength={60}
                      className="mt-2 h-12 w-full rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10"
                    />
                    <p className="mt-1.5 text-right text-xs text-muted-foreground">
                      {label.length}/60
                    </p>
                  </div>

                  <p className="flex items-start gap-2 rounded-2xl border border-accent/20 bg-accent/8 px-4 py-3 text-sm leading-5 text-muted-foreground">
                    <ShieldOff className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    Only the link is stored. Herbaceous never records or stores
                    the meeting itself.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[var(--hairline)] px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
                  <DashboardButton
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={closeModal}
                    className="sm:min-w-24"
                  >
                    Cancel
                  </DashboardButton>
                  <DashboardButton
                    type="submit"
                    disabled={!url.trim() || saving}
                    className="sm:min-w-28"
                  >
                    <Plus className="h-4 w-4" />
                    {saving ? "Saving..." : "Add link"}
                  </DashboardButton>
                </div>
              </form>
            </div>,
            document.body,
          )
        : null}
    </DashboardGlassCard>
  );
}
