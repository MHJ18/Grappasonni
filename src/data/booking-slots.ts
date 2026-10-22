// Requested seating times, not a live inventory or a claim about opening hours.
export const bookingSlots = {
  lunch: ["12:30", "13:00", "13:30", "14:00"],
  dinner: ["19:30", "20:00", "20:30", "21:00", "21:30"],
} as const;

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export function bookingDateBounds(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";
  const min = `${part("year")}-${part("month")}-${part("day")}`;
  const maxDate = new Date(`${min}T00:00:00Z`);
  maxDate.setUTCDate(maxDate.getUTCDate() + 180);
  return { min, max: maxDate.toISOString().slice(0, 10) };
}

export function isRequestedDate(date: string, today: string) {
  if (!isCalendarDate(date) || !isCalendarDate(today)) return false;
  const distance =
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
    86_400_000;
  return distance >= 0 && distance <= 180;
}

export function availableRequestedTime(
  date: string,
  time: string,
  today: string,
  currentTime: string,
) {
  return Boolean(
    isRequestedDate(date, today) &&
    [...bookingSlots.lunch, ...bookingSlots.dinner].some(
      (slot) => slot === time,
    ) &&
    /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(currentTime) &&
    (date > today || (date === today && time > currentTime)),
  );
}
