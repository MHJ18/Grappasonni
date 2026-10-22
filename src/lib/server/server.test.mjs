import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { BodyError, isAllowedOrigin, rateLimit, readJsonBody } from "./http.ts";
import {
  getReservationEmailConfig,
  reservationEmail,
  romeDate,
  validateReservation,
} from "./reservations.ts";
import {
  fetchGooglePlacePhoto,
  getGoogleConfig,
  getTheForkStatus,
  isGooglePhotoUrl,
  isPlacePhotoName,
  mapGooglePlace,
  matchesPhotoType,
  readBoundedResponse,
} from "./reviews.ts";

const now = new Date("2026-10-12T12:00:00Z");
const valid = {
  name: "Mario Rossi",
  email: "mario@example.com",
  phone: "+39 06 1234567",
  date: "2026-10-12",
  time: "20:30",
  guests: 2,
  notes: "Un tavolo tranquillo, se possibile.",
  consent: true,
  website: "",
  locale: "it",
};

test("reservation date range uses Rome's calendar day and includes day 180", () => {
  assert.equal(romeDate(new Date("2026-10-12T22:30:00Z")), "2026-10-13");
  assert.equal(romeDate(new Date("2026-12-12T22:30:00Z")), "2026-12-12");
  const atDay = (days) =>
    new Date(Date.UTC(2026, 9, 12 + days)).toISOString().slice(0, 10);
  assert.equal(
    validateReservation({ ...valid, date: atDay(180) }, now).success,
    true,
  );
  for (const date of [
    atDay(-1),
    atDay(181),
    "2026-13-01",
    "2026-10-32",
    "2026-11-31",
  ]) {
    assert.equal(
      validateReservation({ ...valid, date }, now).success,
      false,
      date,
    );
  }
});

test("server rejects manipulated consent, parties, fields, honeypot and malformed values", () => {
  const cases = [
    { consent: false },
    { consent: "true" },
    { guests: 0 },
    { guests: 21 },
    { guests: 2.5 },
    { guests: "2" },
    { time: "25:00" },
    { time: "20:60" },
    { name: "A" },
    { name: "Mario\nBcc: another@example.com" },
    { email: "bad-email" },
    { phone: "<script>" },
    { website: "https://spam.example" },
    { notes: "x".repeat(2001) },
    { locale: "fr" },
    { extra: true },
  ];
  for (const patch of cases)
    assert.equal(
      validateReservation({ ...valid, ...patch }, now).success,
      false,
      JSON.stringify(patch),
    );
  assert.equal(validateReservation(valid, now).success, true);
  assert.equal(
    validateReservation({ ...valid, phone: undefined }, now).success,
    true,
  );
});

test("email is explicitly pending and keeps user content out of its subject", () => {
  const parsed = validateReservation({ ...valid, name: "<b>Mario</b>" }, now);
  assert.equal(parsed.success, true);
  const email = reservationEmail(parsed.data, "example-reference");
  assert.match(email.text, /TAVOLO NON ANCORA CONFERMATO/);
  assert.match(email.text, /example-reference/);
  assert.match(email.text, /Europe\/Rome/);
  assert.ok(!email.subject.includes("<b>"));
});

test("missing external credentials remain unconfigured and TheFork never pretends to connect", () => {
  const fields = [
    "RESEND_API_KEY",
    "RESERVATION_FROM_EMAIL",
    "RESERVATION_TO_EMAIL",
    "GOOGLE_PLACES_API_KEY",
    "GOOGLE_PLACE_ID",
    "THEFORK_CLIENT_ID",
    "THEFORK_CLIENT_SECRET",
    "THEFORK_RESTAURANT_UUID",
  ];
  const prior = Object.fromEntries(
    fields.map((field) => [field, process.env[field]]),
  );
  try {
    for (const field of fields) delete process.env[field];
    assert.equal(getReservationEmailConfig(), null);
    assert.equal(getGoogleConfig(), null);
    assert.equal(getTheForkStatus().configured, false);
    process.env.THEFORK_CLIENT_ID = "test";
    process.env.THEFORK_CLIENT_SECRET = "test";
    process.env.THEFORK_RESTAURANT_UUID = "test";
    assert.equal(getTheForkStatus().configured, true);
    assert.equal(getTheForkStatus().connected, false);
    assert.equal(getTheForkStatus().dishReviewsAvailable, false);
  } finally {
    for (const field of fields) {
      if (prior[field] === undefined) delete process.env[field];
      else process.env[field] = prior[field];
    }
  }
});

test("production origin checks reject cross-site and missing origins", () => {
  const fields = [
    "NODE_ENV",
    "SITE_URL",
    "NEXT_PUBLIC_SITE_URL",
    "ALLOWED_ORIGINS",
    "VERCEL_URL",
  ];
  const prior = Object.fromEntries(
    fields.map((field) => [field, process.env[field]]),
  );
  try {
    for (const field of fields) delete process.env[field];
    process.env.NODE_ENV = "production";
    process.env.SITE_URL = "https://restaurant.example";
    const request = (origin, site) =>
      new Request("https://restaurant.example/api/reservations", {
        headers: {
          ...(origin ? { Origin: origin } : {}),
          ...(site ? { "Sec-Fetch-Site": site } : {}),
        },
      });
    assert.equal(
      isAllowedOrigin(request("https://restaurant.example", "same-origin")),
      true,
    );
    assert.equal(
      isAllowedOrigin(request("https://attacker.example", "cross-site")),
      false,
    );
    assert.equal(
      isAllowedOrigin(request("https://restaurant.example", "cross-site")),
      false,
    );
    assert.equal(
      isAllowedOrigin(request("https://restaurant.example/path")),
      false,
    );
    assert.equal(isAllowedOrigin(request("null")), false);
    assert.equal(isAllowedOrigin(request()), false);
  } finally {
    for (const field of fields) {
      if (prior[field] === undefined) delete process.env[field];
      else process.env[field] = prior[field];
    }
  }
});

test("rate limit denies repeated attempts until the bucket expires", () => {
  const key = randomUUID();
  assert.equal(rateLimit(key, 2, 1000, 100).allowed, true);
  assert.equal(rateLimit(key, 2, 1000, 200).allowed, true);
  assert.equal(rateLimit(key, 2, 1000, 300).allowed, false);
  assert.equal(rateLimit(key, 2, 1000, 1100).allowed, true);
});

test("JSON reader rejects oversize streamed bodies, wrong types and malformed JSON", async () => {
  const request = (body, contentType = "application/json") =>
    new Request("https://restaurant.example", {
      method: "POST",
      headers: { "Content-Type": contentType },
      body,
    });
  assert.deepEqual(await readJsonBody(request('{"value":1}')), { value: 1 });
  for (const [input, code] of [
    [request("x".repeat(20_000)), "PAYLOAD_TOO_LARGE"],
    [request("{"), "INVALID_JSON"],
    [
      request("value=1", "application/x-www-form-urlencoded"),
      "UNSUPPORTED_MEDIA_TYPE",
    ],
  ])
    await assert.rejects(
      readJsonBody(input),
      (error) => error instanceof BodyError && error.code === code,
    );
});

test("Google review mapping preserves attribution, original text, source and rating", () => {
  const providerReview = {
    name: "places/test/reviews/one",
    rating: 4,
    text: { text: " Testo originale. " },
    originalText: { text: " Original text. " },
    authorAttribution: {
      displayName: "Reviewer",
      uri: "https://www.google.com/maps/contrib/test",
      photoUri: "https://lh3.googleusercontent.com/test",
    },
    publishTime: "2026-10-01T12:00:00Z",
    googleMapsUri: "https://www.google.com/maps/reviews/test",
  };
  const place = {
    id: "test",
    displayName: { text: "Grappasonni" },
    rating: 4.4,
    userRatingCount: 100,
    reviews: [providerReview],
  };
  const mapped = mapGooglePlace(place, "2026-10-12T12:00:00Z");
  assert.equal(mapped.ordering, "most_relevant");
  assert.equal(mapped.attribution, "Google Maps");
  assert.equal(mapped.reviews[0].text, " Testo originale. ");
  assert.equal(mapped.reviews[0].originalText, " Original text. ");
  assert.equal(mapped.reviews[0].author, "Reviewer");
  assert.equal(
    mapped.reviews[0].photoUri,
    providerReview.authorAttribution.photoUri,
  );
  assert.equal(mapped.reviews[0].googleMapsUri, providerReview.googleMapsUri);
  assert.equal(mapped.place.count, 100);
  assert.deepEqual(
    mapGooglePlace({
      ...place,
      reviews: [{ ...providerReview, googleMapsUri: "javascript:alert(1)" }],
    }).reviews,
    [],
  );
});

test("place photos keep separate source credits and reject cross-place photo references", () => {
  const photo = {
    name: "places/test/photos/AUac_test-123",
    widthPx: 1600,
    heightPx: 1200,
    authorAttributions: [
      {
        displayName: "Photo author",
        uri: "//maps.google.com/maps/contrib/photo-author",
        photoUri: "//lh3.googleusercontent.com/photo-author",
      },
    ],
    googleMapsUri: "https://www.google.com/maps/photo/test",
  };
  const mapped = mapGooglePlace({
    id: "test",
    displayName: { text: "Grappasonni" },
    photos: [photo],
  });
  assert.deepEqual(mapped.photos[0], {
    ...photo,
    authorAttributions: [
      {
        displayName: "Photo author",
        uri: "https://maps.google.com/maps/contrib/photo-author",
        photoUri: "https://lh3.googleusercontent.com/photo-author",
      },
    ],
  });
  assert.deepEqual(mapped.reviews, []);
  assert.deepEqual(
    mapGooglePlace({
      id: "test",
      displayName: { text: "Grappasonni" },
      photos: [{ ...photo, name: "places/different/photos/AUac_test-123" }],
    }).photos,
    [],
  );
  assert.deepEqual(
    mapGooglePlace({ id: "test", displayName: { text: "Grappasonni" } }).photos,
    [],
  );
});

test("photo names and CDN URLs cannot target another place, local host or arbitrary server", () => {
  assert.equal(
    isPlacePhotoName("places/test/photos/Token_123-abc", "test"),
    true,
  );
  for (const name of [
    "places/other/photos/Token",
    "places/test/photos/../Token",
    "places/test/photos/Token/media",
    "places/test/photos/Token?key=secret",
    "places/test/photos/Token%2fmedia",
    "https://attacker.example/image",
    `places/test/photos/${"a".repeat(2049)}`,
    "places/test/photos/",
  ])
    assert.equal(isPlacePhotoName(name, "test"), false, name);
  assert.equal(
    isGooglePhotoUrl("https://lh3.googleusercontent.com/places/image"),
    true,
  );
  for (const url of [
    "http://lh3.googleusercontent.com/places/image",
    "https://googleusercontent.com.attacker.example/image",
    "https://attacker.example/googleusercontent.com",
    "https://127.0.0.1/image",
    "https://lh3.googleusercontent.com:444/image",
    "https://user:password@lh3.googleusercontent.com/image",
    "file:///image",
  ])
    assert.equal(isGooglePhotoUrl(url), false, url);
});

test("photo responses enforce byte limits and do not accept HTML or SVG as image content", async () => {
  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]).buffer;
  assert.equal(matchesPhotoType(png, "image/png"), true);
  assert.equal(
    matchesPhotoType(
      new TextEncoder().encode("<html>error</html>").buffer,
      "image/png",
    ),
    false,
  );
  assert.equal(
    matchesPhotoType(
      new TextEncoder().encode("<svg></svg>").buffer,
      "image/svg+xml",
    ),
    false,
  );
  await assert.rejects(
    readBoundedResponse(new Response("123456"), 5),
    /size limit/,
  );
  await assert.rejects(
    readBoundedResponse(
      new Response("a", { headers: { "Content-Length": "100" } }),
      5,
    ),
    /size limit/,
  );
});

test("photo proxy uses an official metadata request, private key header and no-store CDN fetch", async () => {
  const priorKey = process.env.GOOGLE_PLACES_API_KEY;
  const priorPlace = process.env.GOOGLE_PLACE_ID;
  const priorFetch = globalThis.fetch;
  const calls = [];
  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  try {
    process.env.GOOGLE_PLACES_API_KEY = "test-server-secret";
    process.env.GOOGLE_PLACE_ID = "test";
    globalThis.fetch = async (input, options) => {
      calls.push({ url: String(input), options });
      return calls.length === 1
        ? Response.json({
            photoUri: "https://lh3.googleusercontent.com/place-photos/test",
          })
        : new Response(png, { headers: { "Content-Type": "image/png" } });
    };
    const result = await fetchGooglePlacePhoto("places/test/photos/Token_123");
    assert.equal(calls.length, 2);
    const apiUrl = new URL(calls[0].url);
    assert.equal(apiUrl.origin, "https://places.googleapis.com");
    assert.equal(apiUrl.pathname, "/v1/places/test/photos/Token_123/media");
    assert.equal(apiUrl.searchParams.get("maxWidthPx"), "960");
    assert.equal(apiUrl.searchParams.get("skipHttpRedirect"), "true");
    assert.equal(apiUrl.searchParams.has("key"), false);
    assert.equal(
      new Headers(calls[0].options.headers).get("X-Goog-Api-Key"),
      "test-server-secret",
    );
    assert.equal(calls[1].options.headers, undefined);
    assert.ok(
      calls.every(
        (call) =>
          call.options.cache === "no-store" &&
          !call.url.includes("test-server-secret"),
      ),
    );
    assert.equal(result.contentType, "image/png");
    assert.deepEqual(new Uint8Array(result.bytes), png);
  } finally {
    globalThis.fetch = priorFetch;
    if (priorKey === undefined) delete process.env.GOOGLE_PLACES_API_KEY;
    else process.env.GOOGLE_PLACES_API_KEY = priorKey;
    if (priorPlace === undefined) delete process.env.GOOGLE_PLACE_ID;
    else process.env.GOOGLE_PLACE_ID = priorPlace;
  }
});

test("photo proxy does not fetch without keys or follow unsafe media redirects", async () => {
  const priorKey = process.env.GOOGLE_PLACES_API_KEY;
  const priorPlace = process.env.GOOGLE_PLACE_ID;
  const priorFetch = globalThis.fetch;
  let calls = 0;
  try {
    delete process.env.GOOGLE_PLACES_API_KEY;
    delete process.env.GOOGLE_PLACE_ID;
    globalThis.fetch = async () => {
      calls += 1;
      throw new Error("Unexpected fetch");
    };
    assert.equal(await fetchGooglePlacePhoto("places/test/photos/Token"), null);
    assert.equal(calls, 0);
    process.env.GOOGLE_PLACES_API_KEY = "test-key";
    process.env.GOOGLE_PLACE_ID = "test";
    await assert.rejects(
      fetchGooglePlacePhoto("places/other/photos/Token"),
      /Invalid place/,
    );
    assert.equal(calls, 0);
    globalThis.fetch = async () => {
      calls += 1;
      return calls === 1
        ? Response.json({
            photoUri: "https://lh3.googleusercontent.com/places/test",
          })
        : new Response(null, {
            status: 302,
            headers: { Location: "https://attacker.example/image" },
          });
    };
    await assert.rejects(
      fetchGooglePlacePhoto("places/test/photos/Token"),
      /Unexpected Google photo host/,
    );
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = priorFetch;
    if (priorKey === undefined) delete process.env.GOOGLE_PLACES_API_KEY;
    else process.env.GOOGLE_PLACES_API_KEY = priorKey;
    if (priorPlace === undefined) delete process.env.GOOGLE_PLACE_ID;
    else process.env.GOOGLE_PLACE_ID = priorPlace;
  }
});
