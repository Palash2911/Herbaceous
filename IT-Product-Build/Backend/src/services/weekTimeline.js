import { currentWeekNumber } from "../utils/weeks.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

function computePauseIntervals(pauseRequests, now) {
  const events = pauseRequests
    .filter((r) => r.status === "APPROVED" && r.respondedAt)
    .sort((a, b) => a.respondedAt.getTime() - b.respondedAt.getTime());

  const intervals = [];
  let openStart = null;
  for (const event of events) {
    if (event.type === "PAUSE" && openStart == null) {
      openStart = event.respondedAt;
    } else if (event.type === "RESUME" && openStart != null) {
      intervals.push({ start: openStart, end: event.respondedAt });
      openStart = null;
    }
  }
  if (openStart != null) {
    intervals.push({ start: openStart, end: now });
  }
  return intervals;
}

function overlapsPause(weekStart, weekEnd, intervals) {
  return intervals.some((iv) => weekStart <= iv.end && weekEnd >= iv.start);
}

export function buildWeekTimeline(
  mentorship,
  weeklyLogs,
  pauseRequests,
  now = new Date(),
) {
  const currentWeek = currentWeekNumber(mentorship.startedAt, now);
  const logsByWeek = new Map(weeklyLogs.map((log) => [log.weekNumber, log]));
  const pauseIntervals = computePauseIntervals(pauseRequests, now);

  const weeks = [];
  for (let week = 1; week <= currentWeek; week++) {
    const start = new Date(
      mentorship.startedAt.getTime() + (week - 1) * MS_PER_WEEK,
    );
    const end = new Date(start.getTime() + MS_PER_WEEK - 1);

    const log = logsByWeek.get(week);
    let status;
    if (log) {
      status = log.status.toLowerCase();
    } else if (week === currentWeek && mentorship.status !== "ENDED") {
      status = "current";
    } else if (overlapsPause(start, end, pauseIntervals)) {
      status = "paused";
    } else {
      status = "missed";
    }

    weeks.push({
      week,
      range: { start: start.toISOString(), end: end.toISOString() },
      status,
      logId: log ? log.id : null,
      note: log ? log.note : null,
      loggedAt: log ? log.createdAt : null,
    });
  }

  return weeks;
}
