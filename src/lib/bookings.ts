export const BOOKING_KEY = "grappasonni-bookings-v1";
export type BookingStatus = "saved" | "pending" | "not-sent" | "unknown";
export type SavedBooking = {
  id: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: BookingStatus;
  savedAt: number;
};
const statuses: BookingStatus[] = ["saved", "pending", "not-sent", "unknown"];
const lifetime = 180 * 24 * 60 * 60 * 1000;

/** Only retain the minimum information needed for an on-device visit history. */
export function readBookings(
  raw: string | null,
  now = Date.now(),
): SavedBooking[] {
  try {
    const data: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(data)) return [];
    const seen = new Set<string>();
    return data
      .flatMap((value: unknown): SavedBooking[] => {
        if (!value || typeof value !== "object") return [];
        const b = value as Record<string, unknown>;
        if (
          typeof b.id !== "string" ||
          !/^[a-zA-Z0-9-]{8,80}$/.test(b.id) ||
          seen.has(b.id) ||
          typeof b.name !== "string" ||
          b.name.trim().length < 2 ||
          b.name.length > 100 ||
          /[\u0000-\u001f\u007f]/.test(b.name) ||
          typeof b.date !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(b.date) ||
          typeof b.time !== "string" ||
          !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(b.time) ||
          typeof b.guests !== "number" ||
          !Number.isInteger(b.guests) ||
          b.guests < 1 ||
          b.guests > 20 ||
          !statuses.includes(b.status as BookingStatus) ||
          typeof b.savedAt !== "number" ||
          !Number.isFinite(b.savedAt) ||
          b.savedAt < now - lifetime ||
          b.savedAt > now + 120000
        )
          return [];
        const date = new Date(b.date + "T12:00:00Z");
        if (
          !Number.isFinite(date.getTime()) ||
          date.toISOString().slice(0, 10) !== b.date
        )
          return [];
        seen.add(b.id);
        return [
          {
            id: b.id,
            name: b.name.trim(),
            date: b.date,
            time: b.time,
            guests: b.guests,
            status: b.status as BookingStatus,
            savedAt: b.savedAt,
          },
        ];
      })
      .sort((a, b) => b.savedAt - a.savedAt)
      .slice(0, 20);
  } catch {
    return [];
  }
}
