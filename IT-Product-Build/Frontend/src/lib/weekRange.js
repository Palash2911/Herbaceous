export function formatWeekRange(startISO, endISO) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  end.setUTCDate(end.getUTCDate() - 1);

  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startMonth = start.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const endMonth = end.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });

  return startMonth === endMonth
    ? `${startDay} to ${endDay} ${endMonth}`
    : `${startDay} ${startMonth} to ${endDay} ${endMonth}`;
}

export function deriveWeekRange(startedAt, week) {
  const start = new Date(startedAt);
  start.setUTCDate(start.getUTCDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return { start: start.toISOString(), end: end.toISOString() };
}
