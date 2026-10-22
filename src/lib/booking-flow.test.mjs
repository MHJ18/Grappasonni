import test from "node:test";
import assert from "node:assert/strict";
import {
  bookingDateBounds,
  availableRequestedTime,
  isRequestedDate,
} from "../data/booking-slots.ts";

test("booking dates follow Rome's day across midnight and daylight saving", () => {
  assert.equal(
    bookingDateBounds(new Date("2026-07-31T22:30:00Z")).min,
    "2026-08-01",
  );
  assert.equal(
    bookingDateBounds(new Date("2026-12-31T23:30:00Z")).min,
    "2027-01-01",
  );
  assert.deepEqual(bookingDateBounds(new Date("2026-10-20T12:00:00Z")), {
    min: "2026-10-20",
    max: "2027-04-18",
  });
});

test("booking date range excludes invalid dates and accepts the 180-day boundary", () => {
  const today = "2026-10-20";
  assert.equal(isRequestedDate(today, today), true);
  assert.equal(isRequestedDate("2027-04-18", today), true);
  for (const date of [
    "",
    "2026-10-19",
    "2027-04-19",
    "2027-02-30",
    "2026-13-01",
  ]) {
    assert.equal(isRequestedDate(date, today), false, date);
  }
  assert.equal(isRequestedDate("2028-02-29", "2028-02-28"), true);
  assert.equal(isRequestedDate("2027-02-29", "2027-02-28"), false);
});

test("seating choices exclude elapsed, unsupported and malformed times", () => {
  const today = "2026-10-20";
  assert.equal(availableRequestedTime(today, "20:30", today, "20:29"), true);
  assert.equal(availableRequestedTime(today, "20:30", today, "20:30"), false);
  assert.equal(availableRequestedTime(today, "20:30", today, "21:00"), false);
  assert.equal(
    availableRequestedTime("2026-10-21", "12:30", today, "23:00"),
    true,
  );
  for (const time of ["", "20:15", "27:00", "9:30"]) {
    assert.equal(
      availableRequestedTime(today, time, today, "12:00"),
      false,
      time,
    );
  }
  assert.equal(
    availableRequestedTime("2027-02-30", "19:30", today, "12:00"),
    false,
  );
  assert.equal(
    availableRequestedTime("2027-04-19", "19:30", today, "12:00"),
    false,
  );
  assert.equal(availableRequestedTime(today, "19:30", today, ""), false);
});
