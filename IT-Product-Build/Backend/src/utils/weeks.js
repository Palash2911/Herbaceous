const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function currentWeekNumber(startedAt, now = new Date()) {
  const daysSince = (now.getTime() - startedAt.getTime()) / MS_PER_DAY;
  return Math.max(1, Math.floor(daysSince / 7) + 1);
}

export function mentorshipClock(mentorship) {
  return mentorship.endedAt ?? new Date();
}
