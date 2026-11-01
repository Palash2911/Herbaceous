import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  ExternalLink,
  FileText,
  Pencil,
  StickyNote,
  Video,
  X,
} from "lucide-react";
import {
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
  EmptyState,
} from "@/components/dashboard/shared/primitives";
import { StatusPill } from "@/components/dashboard/mentee/primitives";

const EVENT_META = {
  meeting: { label: "Meeting", Icon: Video, tone: "accent" },
  reminder: { label: "Reminder", Icon: Bell, tone: "amber" },
  log: { label: "Log", Icon: FileText, tone: "teal" },
  note: { label: "Note", Icon: StickyNote, tone: "coral" },
};

function eventDate(entry) {
  if (!entry.startsAt) return entry.when ?? "No date";
  const date = new Date(entry.startsAt);
  return Number.isNaN(date.getTime())
    ? entry.when ?? "No date"
    : date.toLocaleString();
}

export function SharedCalendar({ entries = [], onEdit, onCancel }) {
  return (
    <DashboardGlassCard data-reveal>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <DashboardLabel>Shared calendar</DashboardLabel>
          <h2 className="mt-1 text-xl font-semibold">What is coming up</h2>
        </div>
        {entries.length ? (
          <span className="rounded-full border border-[var(--hairline)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-muted-foreground">
            {entries.length} {entries.length === 1 ? "item" : "items"}
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        <AnimatePresence initial={false}>
          {entries.map((entry) => {
            const meta =
              EVENT_META[String(entry.type).toLowerCase()] ?? EVENT_META.note;
            const Icon = meta.Icon;
            const tone = `var(--${meta.tone})`;
            const link = entry.meetingLink?.url ?? entry.link;
            const canChange =
              !entry.derived &&
              entry.isMine &&
              entry.status === "SCHEDULED";

            return (
              <motion.article
                key={entry.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="group rounded-[18px] border border-[var(--event-border)] bg-[var(--event-surface)] p-3.5 text-foreground shadow-sm transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[var(--event-hover-border)] hover:bg-[var(--event-hover)] hover:shadow-md focus-within:border-[var(--event-hover-border)] focus-within:bg-[var(--event-hover)]"
                style={{
                  "--event-border": `color-mix(in srgb, ${tone} 22%, var(--hairline))`,
                  "--event-hover-border": `color-mix(in srgb, ${tone} 44%, var(--hairline))`,
                  "--event-surface": `color-mix(in srgb, var(--card) 72%, transparent)`,
                  "--event-hover": `color-mix(in srgb, ${tone} 10%, var(--card))`,
                  borderLeft: `3px solid ${tone}`,
                }}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                    style={{
                      color: tone,
                      background: `color-mix(in srgb, ${tone} 13%, var(--card))`,
                    }}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="truncate text-sm font-semibold">
                      {entry.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {eventDate(entry)}
                    </p>
                    {entry.note ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {entry.note}
                      </p>
                    ) : null}
                  </div>

                  <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                </div>

                {link || canChange ? (
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--hairline)] pt-3">
                    {link ? (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-card px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        Join
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}

                    {canChange && onEdit ? (
                      <DashboardButton
                        variant="outline"
                        className="px-3.5 py-2 text-xs"
                        onClick={() => onEdit(entry)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </DashboardButton>
                    ) : null}

                    {canChange && onCancel ? (
                      <DashboardButton
                        variant="danger"
                        className="px-3.5 py-2 text-xs"
                        onClick={() => onCancel(entry)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel event
                      </DashboardButton>
                    ) : null}
                  </div>
                ) : null}
              </motion.article>
            );
          })}
        </AnimatePresence>

        {!entries.length ? (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="Nothing on the calendar"
            body="Use a quick action above to add a meeting, reminder or note. Weekly logs appear automatically."
          />
        ) : null}
      </div>
    </DashboardGlassCard>
  );
}
