import test from "node:test";
import assert from "node:assert/strict";
import { readBookings } from "./bookings.ts";

const now = Date.parse("2026-10-14T12:00:00Z");
const request = {
  id: "request-12345",
  name: "  Preview Guest  ",
  date: "2026-10-20",
  time: "20:30",
  guests: 2,
  status: "pending",
  savedAt: now,
};
test("booking history tolerates corrupt or unrelated device storage", () => {
  for (const raw of [null, "broken", "null", "{}", '[null,1,"x"]'])
    assert.deepEqual(readBookings(raw, now), []);
});
test("booking history retains minimum visit details and strips contact and private notes", () => {
  const [booking] = readBookings(
    JSON.stringify([
      {
        ...request,
        email: "private@example.invalid",
        phone: "+3900000000",
        notes: "Private dietary request",
      },
    ]),
    now,
  );
  assert.deepEqual(booking, { ...request, name: "Preview Guest" });
  assert.equal("email" in booking, false);
  assert.equal("notes" in booking, false);
});
test("booking history rejects fabricated confirmation, impossible dates and invalid party sizes", () => {
  for (const patch of [
    { status: "confirmed" },
    { date: "2026-02-30" },
    { time: "27:00" },
    { guests: 0 },
    { guests: 21 },
    { guests: 2.5 },
    { name: "a" },
    { savedAt: now + 300000 },
  ])
    assert.deepEqual(
      readBookings(JSON.stringify([{ ...request, ...patch }]), now),
      [],
    );
});
test("booking history expires after 180 days and caps deduplicated records", () => {
  const raw = [
    ...Array.from({ length: 25 }, (_, index) => ({
      ...request,
      id: "request-" + String(index).padStart(5, "0"),
      savedAt: now - index * 1000,
    })),
    { ...request, id: "request-00000" },
    { ...request, id: "request-expired", savedAt: now - 181 * 86400000 },
  ];
  const records = readBookings(JSON.stringify(raw), now);
  assert.equal(records.length, 20);
  assert.equal(new Set(records.map((record) => record.id)).size, 20);
  assert.equal(records[0].id, "request-00000");
  assert.ok(records.every((record) => record.id !== "request-expired"));
});
