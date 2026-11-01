import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  AlignLeft,
  Bell,
  CalendarDays,
  Clock3,
  Compass,
  Link2,
  Save,
  UsersRound,
  StickyNote,
  Video,
  X,
} from "lucide-react";
import { useReveal } from "@/components/dashboard/mentee/primitives";
import { MeetingLinks } from "@/components/dashboard/mentee/actions/MeetingLinks";
import { QuickActions } from "@/components/dashboard/mentee/actions/QuickActions";
import { SharedCalendar } from "@/components/dashboard/mentee/actions/SharedCalendar";
import {
  DashboardAvatar,
  DashboardButton,
  DashboardGlassCard,
  DashboardLabel,
  EmptyState,
  StatusPill,
} from "@/components/dashboard/shared/primitives";
import { useStore } from "@/components/dashboard/shared/store";
import {
  initialsOf,
  mentorshipStatus,
} from "@/components/dashboard/mentor/mentorDisplay";
import { useMentorMentees } from "@/hooks/useMentorMentees";
import { handleApiError } from "@/lib/handleApiError";
import {
  getChatRoom,
  saveChatRoom,
  listMeetingLinks,
  addMeetingLink,
  listCalendarEvents,
  addCalendarEvent,
  editCalendarEvent,
  cancelCalendarEvent,
} from "@/services/mentorshipsService";
import { DashboardPanelLoader } from "@/components/dashboard/shared/DashboardLoader";

const EVENT_META = {
  MEETING: {
    label: "Meeting",
    Icon: Video,
    tone: "var(--accent)",
    helper: (partner) =>
      `Schedule a time that will be visible to both you and ${partner}.`,
  },
  REMINDER: {
    label: "Reminder",
    Icon: Bell,
    tone: "var(--amber)",
    helper: () => "Add a shared reminder for an important action or deadline.",
  },
  NOTE: {
    label: "Note",
    Icon: StickyNote,
    tone: "var(--coral)",
    helper: () => "Save a shared note. Adding a date and time is optional.",
  },
};

function localDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function EventForm({ selected, onSave, onClose, partner = "your mentor" }) {
  const event = selected.event;
  const type = (event?.type ?? selected.type ?? "NOTE").toUpperCase();
  const meta = EVENT_META[type] ?? EVENT_META.NOTE;
  const Icon = meta.Icon;
  const [title, setTitle] = useState(event?.title ?? "");
  const [note, setNote] = useState(event?.note ?? "");
  const [when, setWhen] = useState(localDate(event?.startsAt));
  const [meetingUrl, setMeetingUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const close = () => {
    if (!saving) onClose();
  };

  async function submit(formEvent) {
    formEvent.preventDefault();
    const body = { title: title.trim(), note: note.trim() || null };

    if (when) {
      if (when !== localDate(event?.startsAt)) {
        body.startsAt = new Date(when).toISOString();
      }
    } else if (event?.startsAt && type === "NOTE") body.startsAt = null;

    if (!event) {
      body.type = type;
      if (type === "MEETING" && meetingUrl.trim()) {
        body.meetingUrl = meetingUrl.trim();
      }
    }

    setSaving(true);
    try {
      if (await onSave(body, event)) onClose();
    } finally {
      setSaving(false);
    }
  }

  const canSubmit =
    title.trim().length > 0 &&
    (type === "NOTE" || Boolean(when)) &&
    !saving;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-[rgba(10,6,22,0.58)] p-4"
      role="presentation"
      onMouseDown={(eventTarget) => {
        if (eventTarget.target === eventTarget.currentTarget) close();
      }}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === "Escape") close();
      }}
    >
      <form
        onSubmit={submit}
        className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-[28px] border border-[var(--hairline)] bg-card text-foreground shadow-2xl scroll-thin"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-event-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--hairline)] px-6 py-5 sm:px-7">
          <div className="flex min-w-0 items-start gap-3.5">
            <span
              className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{
                color: meta.tone,
                background: `color-mix(in srgb, ${meta.tone} 13%, var(--card))`,
              }}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <DashboardLabel>Shared calendar</DashboardLabel>
              <h3
                id="calendar-event-title"
                className="mt-1 font-display text-xl font-semibold"
              >
                {event ? "Edit" : "Add"} {meta.label.toLowerCase()}
              </h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {meta.helper(partner)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] text-muted-foreground transition-colors hover:bg-[var(--surface-soft)] hover:text-foreground disabled:opacity-50"
            aria-label="Close calendar event form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-7">
          <div>
            <label
              htmlFor="calendar-event-title-input"
              className="label-caps"
            >
              Title
            </label>
            <div className="relative mt-2">
              <AlignLeft className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="calendar-event-title-input"
                required
                autoFocus
                maxLength={100}
                value={title}
                onChange={(changeEvent) => setTitle(changeEvent.target.value)}
                placeholder={`Name this ${meta.label.toLowerCase()}`}
                className="h-12 w-full rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
            </div>
            <p className="mt-1.5 text-right text-xs text-muted-foreground">
              {title.length}/100
            </p>
          </div>

          <div>
            <label htmlFor="calendar-event-when" className="label-caps">
              Date and time{type === "NOTE" ? " · Optional" : ""}
            </label>
            <div className="relative mt-2">
              <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="calendar-event-when"
                type="datetime-local"
                required={type !== "NOTE"}
                value={when}
                onChange={(changeEvent) => setWhen(changeEvent.target.value)}
                className="h-12 w-full rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm text-foreground outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="calendar-event-note" className="label-caps">
              Note · Optional
            </label>
            <textarea
              id="calendar-event-note"
              maxLength={500}
              rows={4}
              value={note}
              onChange={(changeEvent) => setNote(changeEvent.target.value)}
              placeholder={`Add context for you and ${partner}.`}
              className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] p-4 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
            <p className="mt-1.5 text-right text-xs text-muted-foreground">
              {note.length}/500
            </p>
          </div>

          {!event && type === "MEETING" ? (
            <div>
              <label htmlFor="calendar-event-url" className="label-caps">
                Meeting URL · Optional
              </label>
              <div className="relative mt-2">
                <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="calendar-event-url"
                  type="url"
                  maxLength={500}
                  placeholder="https://..."
                  value={meetingUrl}
                  onChange={(changeEvent) =>
                    setMeetingUrl(changeEvent.target.value)
                  }
                  className="h-12 w-full rounded-2xl border border-[var(--hairline)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10"
                />
              </div>
            </div>
          ) : null}

          <div
            className="flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm text-muted-foreground"
            style={{
              borderColor: `color-mix(in srgb, ${meta.tone} 28%, transparent)`,
              background: `color-mix(in srgb, ${meta.tone} 8%, var(--card))`,
            }}
          >
            <CalendarDays
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: meta.tone }}
              aria-hidden="true"
            />
            <p>
              {event
                ? "Your changes will be visible in the shared calendar as soon as you save."
                : `This item will be added to the calendar you share with ${partner}.`}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--hairline)] px-6 py-5 sm:flex-row sm:justify-end sm:px-7">
          <DashboardButton
            type="button"
            variant="outline"
            disabled={saving}
            onClick={close}
            className="sm:min-w-24"
          >
            Cancel
          </DashboardButton>
          <DashboardButton
            type="submit"
            disabled={!canSubmit}
            className="sm:min-w-36"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "Saving..." : event ? "Save changes" : "Add to calendar"}
          </DashboardButton>
        </div>
      </form>
    </div>,
    document.body,
  );
}

function MenteeChat() {
  const {
    mentorship,
    mentorshipLoading,
    mentorshipError,
    refetchMentorship,
    setView,
  } = useStore();
  const id = mentorship?.id;
  const ref = useReveal();
  const [room, setRoom] = useState(null);
  const [roomInput, setRoomInput] = useState("");
  const [editingRoom, setEditingRoom] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);
  const [links, setLinks] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState(null);

  const reload = useCallback(async () => {
    if (!id) return;
    await Promise.resolve();
    setLoading(true);
    setLoadError(false);
    try {
      const [nextRoom, nextLinks, nextEvents] = await Promise.all([
        getChatRoom(id),
        listMeetingLinks(id),
        listCalendarEvents(id),
      ]);
      setRoom(nextRoom);
      setRoomInput(nextRoom.chatRoomUrl ?? "");
      setLinks(nextLinks ?? []);
      setEntries(nextEvents ?? []);
    } catch (error) {
      setLoadError(true);
      handleApiError(error, "Could not load Chat");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    Promise.all([
      getChatRoom(id),
      listMeetingLinks(id),
      listCalendarEvents(id),
    ])
      .then(([nextRoom, nextLinks, nextEvents]) => {
        if (cancelled) return;
        setRoom(nextRoom);
        setRoomInput(nextRoom.chatRoomUrl ?? "");
        setLinks(nextLinks ?? []);
        setEntries(nextEvents ?? []);
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(true);
        setLoading(false);
        handleApiError(error, "Could not load Chat");
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function updateRoom(url) {
    setSavingRoom(true);
    try {
      await saveChatRoom(id, url);
      const nextRoom = await getChatRoom(id);
      setRoom(nextRoom);
      setRoomInput(nextRoom.chatRoomUrl ?? "");
      setEditingRoom(false);
      toast.success(url ? "Chat room saved" : "Chat room cleared");
    } catch (error) {
      handleApiError(error, "Could not save chat room");
    } finally {
      setSavingRoom(false);
    }
  }

  async function addLink(url, label) {
    try {
      await addMeetingLink(id, url, label);
      setLinks(await listMeetingLinks(id));
      toast.success("Meeting link added");
      return true;
    } catch (error) {
      handleApiError(error, "Could not add meeting link");
      return false;
    }
  }

  async function saveEvent(body, event) {
    try {
      if (event) await editCalendarEvent(id, event.id, body);
      else await addCalendarEvent(id, body);
      const [nextEvents, nextLinks] = await Promise.all([
        listCalendarEvents(id),
        listMeetingLinks(id),
      ]);
      setEntries(nextEvents);
      setLinks(nextLinks);
      toast.success(event ? "Event updated" : "Event added");
      return true;
    } catch (error) {
      handleApiError(error, "Could not save event");
      return false;
    }
  }

  async function cancelEvent(event) {
    if (!window.confirm(`Cancel "${event.title}"?`)) return;
    try {
      await cancelCalendarEvent(id, event.id);
      setEntries(await listCalendarEvents(id));
      toast.success("Event cancelled");
    } catch (error) {
      handleApiError(error, "Could not cancel event");
    }
  }

  return (
    <div ref={ref} className="relative isolate space-y-6 pb-12">
      <header data-reveal>
        <p className="label-caps">Chat</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Chat</h1>
      </header>

      {mentorshipLoading ? (
        <DashboardPanelLoader label="Loading Chat workspace..." />
      ) : mentorshipError ? (
        <DashboardGlassCard>
          <EmptyState
            title="Could not load your mentorship"
            action={
              <DashboardButton onClick={refetchMentorship}>
                Try again
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : !id ? (
        <DashboardGlassCard>
          <EmptyState
            icon={<Compass className="h-6 w-6" />}
            title="No mentor yet"
            body="Find a mentor to start planning your conversations."
            action={
              <DashboardButton onClick={() => setView("matching")}>
                Find a mentor
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : loading ? (
        <DashboardPanelLoader label="Loading Chat workspace..." />
      ) : loadError ? (
        <DashboardGlassCard>
          <EmptyState
            title="Could not load Chat"
            action={<DashboardButton onClick={reload}>Try again</DashboardButton>}
          />
        </DashboardGlassCard>
      ) : (
        <>
          <DashboardGlassCard data-reveal>
            <DashboardLabel>Chat room</DashboardLabel>
            <h2 className="mt-1 text-xl font-semibold">
              Talk outside Herbaceous
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Conversations take place outside this platform. Only your shared
              link is stored here.
            </p>

            {room?.chatRoomUrl && !editingRoom ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={room.chatRoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                  Open chat room
                </a>
                <DashboardButton
                  variant="outline"
                  onClick={() => setEditingRoom(true)}
                >
                  Replace link
                </DashboardButton>
                <DashboardButton
                  variant="danger"
                  disabled={savingRoom}
                  onClick={() => updateRoom(null)}
                >
                  Clear link
                </DashboardButton>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  aria-label="Chat room URL"
                  type="url"
                  maxLength={500}
                  placeholder="Paste your chat room link (https://...)"
                  value={roomInput}
                  onChange={(event) => setRoomInput(event.target.value)}
                  className="min-w-52 flex-1 rounded-xl border border-border bg-transparent p-3 text-sm"
                />
                <DashboardButton
                  disabled={savingRoom || !roomInput.trim()}
                  onClick={() => updateRoom(roomInput.trim())}
                >
                  {savingRoom ? "Saving..." : "Save link"}
                </DashboardButton>
                {editingRoom ? (
                  <DashboardButton
                    variant="outline"
                    onClick={() => {
                      setEditingRoom(false);
                      setRoomInput(room?.chatRoomUrl ?? "");
                    }}
                  >
                    Cancel
                  </DashboardButton>
                ) : null}
              </div>
            )}

            {room?.updatedAt ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Updated by {room.updatedBy ?? "a participant"} ·{" "}
                {new Date(room.updatedAt).toLocaleString()}
              </p>
            ) : null}
          </DashboardGlassCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <MeetingLinks links={links} onAdd={addLink} />
            <div className="grid content-start gap-6">
              <QuickActions
                onAction={(type) =>
                  type === "log"
                    ? setView("planner")
                    : setSelected({ type: type.toUpperCase() })
                }
              />
              <SharedCalendar
                entries={entries}
                onEdit={(event) => setSelected({ event })}
                onCancel={cancelEvent}
              />
            </div>
          </div>
        </>
      )}

      {selected ? (
        <EventForm
          key={selected.event?.id ?? selected.type}
          selected={selected}
          onSave={saveEvent}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}

function MentorChat() {
  const { selectedMentorshipId, setView } = useStore();
  const {
    mentees,
    loading: menteesLoading,
    error: menteesError,
    refetch: refetchMentees,
  } = useMentorMentees();
  const ref = useReveal();

  const openMentorships = useMemo(
    () => (mentees ?? []).filter((item) => item.status !== "ENDED"),
    [mentees],
  );
  const [chosenId, setChosenId] = useState(null);
  const activeId = openMentorships.some((item) => item.id === chosenId)
    ? chosenId
    : openMentorships.some((item) => item.id === selectedMentorshipId)
      ? selectedMentorshipId
      : (openMentorships[0]?.id ?? null);
  const active = openMentorships.find((item) => item.id === activeId);
  const menteeName = active?.mentee?.displayName ?? "your mentee";

  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const [room, setRoom] = useState(null);
  const [roomInput, setRoomInput] = useState("");
  const [editingRoom, setEditingRoom] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);
  const [links, setLinks] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!activeId) return undefined;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setLoadError(false);
      setEditingRoom(false);
      setSelected(null);

      Promise.all([
        getChatRoom(activeId),
        listMeetingLinks(activeId),
        listCalendarEvents(activeId),
      ])
        .then(([nextRoom, nextLinks, nextEvents]) => {
          if (cancelled) return;
          setRoom(nextRoom);
          setRoomInput(nextRoom?.chatRoomUrl ?? "");
          setLinks(nextLinks ?? []);
          setEntries(nextEvents ?? []);
          setLoading(false);
        })
        .catch((error) => {
          if (cancelled) return;
          setLoadError(true);
          setLoading(false);
          handleApiError(error, "Could not load Chat");
        });
    });

    return () => {
      cancelled = true;
    };
  }, [activeId, reloadKey]);

  const stillActive = (id) => activeIdRef.current === id;

  async function updateRoom(url) {
    const id = activeId;
    setSavingRoom(true);
    try {
      await saveChatRoom(id, url);
      const nextRoom = await getChatRoom(id);
      if (!stillActive(id)) return;
      setRoom(nextRoom);
      setRoomInput(nextRoom.chatRoomUrl ?? "");
      setEditingRoom(false);
      toast.success(url ? "Chat room saved" : "Chat room cleared");
    } catch (error) {
      handleApiError(error, "Could not save chat room");
    } finally {
      setSavingRoom(false);
    }
  }

  async function addLink(url, label) {
    const id = activeId;
    try {
      await addMeetingLink(id, url, label);
      const nextLinks = await listMeetingLinks(id);
      if (stillActive(id)) setLinks(nextLinks);
      toast.success(`Meeting link shared with ${menteeName}`);
      return true;
    } catch (error) {
      handleApiError(error, "Could not add meeting link");
      return false;
    }
  }

  async function saveEvent(body, event) {
    const id = activeId;
    try {
      if (event) await editCalendarEvent(id, event.id, body);
      else await addCalendarEvent(id, body);
      const [nextEvents, nextLinks] = await Promise.all([
        listCalendarEvents(id),
        listMeetingLinks(id),
      ]);
      if (stillActive(id)) {
        setEntries(nextEvents);
        setLinks(nextLinks);
      }
      toast.success(event ? "Event updated" : "Event added");
      return true;
    } catch (error) {
      handleApiError(error, "Could not save event");
      return false;
    }
  }

  async function cancelEvent(event) {
    const id = activeId;
    if (!window.confirm(`Cancel "${event.title}"?`)) return;
    try {
      await cancelCalendarEvent(id, event.id);
      const nextEvents = await listCalendarEvents(id);
      if (stillActive(id)) setEntries(nextEvents);
      toast.success("Event cancelled");
    } catch (error) {
      handleApiError(error, "Could not cancel event");
    }
  }

  return (
    <div ref={ref} className="relative isolate space-y-6 pb-12">
      <header data-reveal>
        <p className="label-caps">Chat</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Chat</h1>
      </header>

      {menteesLoading ? (
        <DashboardPanelLoader label="Loading your mentees..." />
      ) : menteesError ? (
        <DashboardGlassCard>
          <EmptyState
            title="Couldn't load your mentees"
            body="Something went wrong reaching the server."
            action={
              <DashboardButton variant="outline" onClick={refetchMentees}>
                Try again
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : openMentorships.length === 0 ? (
        <DashboardGlassCard>
          <EmptyState
            icon={<UsersRound className="h-6 w-6" />}
            title="No mentees to chat with"
            body="Once you accept a mentorship request, the chat room, meeting links and calendar you share with that mentee appear here."
            action={
              <DashboardButton onClick={() => setView("mentees")}>
                Go to My Mentees
              </DashboardButton>
            }
          />
        </DashboardGlassCard>
      ) : (
        <>
          <DashboardGlassCard className="sticky top-4 z-20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <DashboardAvatar
                  initials={initialsOf(active?.mentee?.displayName)}
                  size={44}
                />
                <div className="min-w-0">
                  <DashboardLabel>Chatting with</DashboardLabel>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 font-display text-lg font-semibold">
                    <span className="truncate">{menteeName}</span>
                    {active ? (
                      <StatusPill tone={mentorshipStatus(active.status).tone}>
                        {mentorshipStatus(active.status).label}
                      </StatusPill>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Everything you add below is shared with {menteeName} only.
                  </p>
                </div>
              </div>

              {openMentorships.length > 1 ? (
                <label className="flex min-w-56 flex-col gap-1.5">
                  <span className="label-caps">Switch mentee</span>
                  <select
                    className="w-full rounded-[12px] border border-[var(--hairline)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                    value={activeId ?? ""}
                    onChange={(event) => setChosenId(event.target.value)}
                  >
                    {openMentorships.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.mentee?.displayName ?? "Mentee"} ·{" "}
                        {mentorshipStatus(item.status).label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
          </DashboardGlassCard>

          {loading ? (
            <DashboardPanelLoader label={`Loading your chat with ${menteeName}...`} />
          ) : loadError ? (
            <DashboardGlassCard>
              <EmptyState
                title="Could not load Chat"
                action={
                  <DashboardButton
                    onClick={() => setReloadKey((value) => value + 1)}
                  >
                    Try again
                  </DashboardButton>
                }
              />
            </DashboardGlassCard>
          ) : (
            <>
              <DashboardGlassCard data-reveal>
                <DashboardLabel>Chat room</DashboardLabel>
                <h2 className="mt-1 text-xl font-semibold">
                  Talk outside Herbaceous
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Conversations with {menteeName} take place outside this
                  platform. Only your shared link is stored here.
                </p>

                {room?.chatRoomUrl && !editingRoom ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <a
                      href={room.chatRoomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
                    >
                      Open chat room
                    </a>
                    <DashboardButton
                      variant="outline"
                      onClick={() => setEditingRoom(true)}
                    >
                      Replace link
                    </DashboardButton>
                    <DashboardButton
                      variant="danger"
                      disabled={savingRoom}
                      onClick={() => updateRoom(null)}
                    >
                      Clear link
                    </DashboardButton>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <input
                      aria-label={`Chat room URL for ${menteeName}`}
                      type="url"
                      maxLength={500}
                      placeholder="Paste your chat room link (https://...)"
                      value={roomInput}
                      onChange={(event) => setRoomInput(event.target.value)}
                      className="min-w-52 flex-1 rounded-xl border border-border bg-transparent p-3 text-sm"
                    />
                    <DashboardButton
                      disabled={savingRoom || !roomInput.trim()}
                      onClick={() => updateRoom(roomInput.trim())}
                    >
                      {savingRoom ? "Saving..." : "Save link"}
                    </DashboardButton>
                    {editingRoom ? (
                      <DashboardButton
                        variant="outline"
                        onClick={() => {
                          setEditingRoom(false);
                          setRoomInput(room?.chatRoomUrl ?? "");
                        }}
                      >
                        Cancel
                      </DashboardButton>
                    ) : null}
                  </div>
                )}

                {room?.updatedAt ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Updated by {room.updatedBy ?? "a participant"} ·{" "}
                    {new Date(room.updatedAt).toLocaleString()}
                  </p>
                ) : null}
              </DashboardGlassCard>

              <div className="grid gap-6 lg:grid-cols-2">
                <MeetingLinks
                  links={links}
                  onAdd={addLink}
                  partner={menteeName}
                />
                <div className="grid content-start gap-6">
                  <QuickActions
                    types={["meeting", "reminder", "note"]}
                    onAction={(type) =>
                      setSelected({ type: type.toUpperCase() })
                    }
                  />
                  <SharedCalendar
                    entries={entries}
                    onEdit={(event) => setSelected({ event })}
                    onCancel={cancelEvent}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}

      {selected ? (
        <EventForm
          key={`${activeId}-${selected.event?.id ?? selected.type}`}
          selected={selected}
          partner={menteeName}
          onSave={saveEvent}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}

export function Chat() {
  const { role } = useStore();
  return role === "mentor" ? <MentorChat /> : <MenteeChat />;
}
