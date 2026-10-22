# Restaurant integrations

The site owns its menu and editorial content. External review providers remain attributed, replaceable integrations. No provider account, paid service, live connection, availability inventory or payment flow has been created.

## Implemented endpoints

### Reservation requests — `POST /api/reservations`

Accepts JSON `{ name, email, phone?, date, time, guests, notes, consent: true, website: "", locale: "it" | "en" }`.

The server validates lengths, email, telephone format, a real calendar date from today through 180 days ahead in `Europe/Rome`, a `HH:mm` time, integer party size 1–20, explicit consent and an empty honeypot. This is a request, not a check of restaurant opening times, table availability or a confirmed booking. A successful Resend API response produces HTTP **202** with `{ ok: true, status: "pending", requestId, message }`. The restaurant must reply to confirm. Acceptance by the email provider does not guarantee inbox delivery; delivery/bounce monitoring belongs to a later operational setup.

| Server environment field | Requirement |
| --- | --- |
| `RESEND_API_KEY` | Restricted server-side send key from the restaurant's Resend account. |
| `RESERVATION_FROM_EMAIL` | Sender on a verified Resend domain; e.g. a restaurant-approved name/address. |
| `RESERVATION_TO_EMAIL` | Restaurant inbox receiving requests. |
| `SITE_URL` or `NEXT_PUBLIC_SITE_URL` | Exact public website URL; used to allow its origin. `SITE_URL` can remain server-only. |
| `ALLOWED_ORIGINS` | Optional comma-separated additional exact origins, such as an approved preview URL. No wildcards. |
| `VERCEL_URL` | Vercel's automatic deployment hostname is also accepted if present. |

Missing email configuration returns HTTP **503** / `NOT_CONFIGURED`, never a pretend success. Invalid input returns **400** / `VALIDATION_ERROR` with `fieldErrors`; malformed JSON returns **400**; a body over 16 KiB returns **413**; incorrect media type returns **415**; denied origin returns **403**; throttling returns **429** plus `Retry-After`; provider failure or the eight-second provider timeout returns **502** / `DELIVERY_FAILED`. All API responses are private and `no-store`.

The endpoint requires an exact allowed `Origin`; browsers submit this on the same-origin JSON POST. In development the request origin is accepted. Production must configure the website origin or use Vercel's deployment hostname. Email content is plain text, user email is only `replyTo`, and logs omit request contents and credentials. Resend idempotency keys prevent duplicate provider processing of that individual outbound attempt; a separately submitted request receives a new ID. On a transport timeout delivery is uncertain, so the response asks the guest to contact the restaurant directly rather than claiming receipt.

Abuse controls are best effort: five requests per forwarded client address in 15 minutes and three requests per hashed email per hour, with a bounded in-memory bucket map. These limits reset on cold starts, are not shared across serverless instances, and IP headers are only trustworthy when the hosting proxy overwrites them. Before a public launch with working email keys, apply shared durable rate limits and deployment-level abuse controls. No database vendor was chosen.

Primary sources: [Resend Node SDK](https://github.com/resend/resend-node), [Resend idempotency](https://resend.com/changelog/idempotency-keys), [Next.js route handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route).

### Attributed Google reviews and photo metadata — `GET /api/reviews?locale=it|en`

| Server environment field | Requirement |
| --- | --- |
| `GOOGLE_PLACES_API_KEY` | Key for an enabled Places API (New) project with billing; restrict API usage and set provider quotas/budget alerts. Never use a public `NEXT_PUBLIC_` key here. |
| `GOOGLE_PLACE_ID` | Owner-verified match for Grappasonni's Google Maps listing. Confirm listing identity before enabling. |

Calls only the official `https://places.googleapis.com/v1/places/{placeId}` endpoint, with a field mask for place identity, rating, review count, source link, reviews and photo metadata. The server uses `cache: "no-store"`, an eight-second timeout, and no content persistence. Every response also disables browser/CDN caching. Limits are 20 requests per forwarded client address/minute and 120 requests per server instance/minute; the same serverless limitations apply. Provider billing quotas remain essential because these limits are not global.

Success shape:

```ts
{
  ok: true,
  source: "google",
  attribution: "Google Maps",
  ordering: "most_relevant",
  fetchedAt: string,
  place: { id: string, name: string, rating: number | null, count: number | null, googleMapsUri: string | null },
  reviews: Array<{
    id: string, author: string, authorUrl: string | null, photoUri: string | null,
    text: string, originalText: string | null, rating: number, publishTime: string,
    relativePublishTimeDescription: string | null, googleMapsUri: string
  }>,
  photos: Array<{
    name: string, widthPx: number, heightPx: number,
    authorAttributions: Array<{ displayName: string, uri?: string, photoUri?: string }>,
    googleMapsUri?: string
  }>,
  theFork: { configured: boolean, connected: false, status: "awaiting_access" | "adapter_not_enabled", sourceUrl: string, dishReviewsAvailable: false }
}
```

Missing keys return **503** / `NOT_CONFIGURED`; an unavailable upstream returns **502** / `UPSTREAM_UNAVAILABLE`; throttling returns **429**. The interface falls back to explicit source links instead of invented reviews. The reviews endpoint supplies `photos[]` metadata; image bytes are served separately by the photo endpoint below. A review's `photoUri` is its author's avatar, not an image of their meal. No live Google content was fetched without configured keys.

Google Places returns at most **five reviews ordered by relevance** and **ten place photo references**. These are separate place-level resources, without a promised photo-to-review or dish mapping. Display Google Maps branding, author attribution using the available avatar/name/profile link, and the individual source review link. Explain the relevance ordering; preserve original review wording and disclose translation where appropriate. The UI can expose `originalText` or link to Google for the original. Do not imply Google verifies every review.

Do not copy Google reviews/photos into the site's permanent content library. Place IDs may be stored indefinitely; photo names may expire and may not be cached. The implemented photo display preserves author attribution and individual Google Maps source links, and bypasses Next.js image optimization to avoid introducing an image cache.

For a new integration billed in Italy/EEA, Places API content must not be shown on, next to, or visually associated with a map. Place review cards separately from the location/map presentation, or use **Places UI Kit** for combined place/map content. The source links supplied by Google remain allowed.

### Google place photos — `GET /api/place-photo?name=...`

This implemented endpoint uses the same server-side Google configuration. Pass a freshly returned `photos[].name`; the route accepts exactly one name belonging to the configured `GOOGLE_PLACE_ID`, with a bounded opaque photo token. It rejects cross-place references, path traversal, extra path/query content and cross-site browser requests.

The server calls the official `https://places.googleapis.com/v1/{photo-name}/media` endpoint with `skipHttpRedirect=true`, `maxWidthPx=960` and `maxHeightPx=960`. The API key is sent only in the server request header. The resulting temporary image URI and every subsequent redirect must use HTTPS on an allowlisted Google content host. The key is not forwarded to the image host or exposed in the browser URL.

The total upstream operation has an eight-second timeout. Metadata is capped at 16 KiB, image bodies at 6 MiB, and raster MIME types/signatures are checked; HTML and SVG are rejected. Successful binary responses are private and `no-store` for browser/server/CDN handling. Missing configuration returns **503** without an external fetch, invalid names **400**, denied cross-site requests **403**, throttling **429**, and unavailable/unsafe upstream media **502**. Rate limits are 20 requests per forwarded client address/minute and 100 per server instance/minute, with the in-memory limitations described above.

Credits remain in `photos[].authorAttributions` and `googleMapsUri`; they are displayed beside the photo rather than burned into its pixels. The Google tab renders at most two photos with individual source links, separately from the location/map section. Photo references and image bytes are not persisted. Provider credentials, listing verification and successful live fetching are still required to populate that display.

Primary sources: [Place fields and response limits](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places), [attribution and storage policies](https://developers.google.com/maps/documentation/places/web-service/policies?hl=en), [photo references](https://developers.google.com/maps/documentation/places/web-service/place-photos), [photo media endpoint](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places.photos/getMedia), [EEA integration guide](https://developers.google.com/maps/comms/eea/places?hl=en), [current EEA service terms](https://cloud.google.com/terms/maps-platform/eea/maps-service-terms).

The 13 server tests cover validation and integration boundaries, including mocked photo fetching, attribution mapping, cross-place/unsafe URL rejection, size limits and the no-fetch behavior without credentials. No test creates a live provider connection.

Full Google review management is a later owner-authorized integration. Business Profile API requires approved project access, OAuth and an authorized, verified business location. It offers paginated reviews and reply management; it is not an unrestricted public review feed. Business Profile content may only be cached in limited amounts securely for performance, at most 30 days, without manipulation or aggregation. Read [prerequisites](https://developers.google.com/my-business/content/prereqs), [review endpoint](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list) and [Business Profile policies](https://developers.google.com/my-business/content/policies) before implementing.

## TheFork — access boundary only

Verified listing: [Grappasonni dal 1908](https://www.thefork.it/ristorante/grappasonni-dal-1908-r76248); [reviews](https://www.thefork.it/ristorante/grappasonni-dal-1908-r76248/recensioni).

The current server adapter exposes configuration state and the source link only. It performs no TheFork requests, and `connected` is always `false`. These optional server fields are reserved for an approved future implementation:

| Field | Purpose |
| --- | --- |
| `THEFORK_CLIENT_ID` | Client ID issued by TheFork. |
| `THEFORK_CLIENT_SECRET` | Secret issued by TheFork, server-only. |
| `THEFORK_RESTAURANT_UUID` | Authorized restaurant UUID, which differs from the public `r76248` listing ID. |

Having these fields alone does not activate a connection. TheFork B2B access requires approval, appropriate scopes and contractual permission. The official contact is `integrations@thefork.com`. Its documented B2B API supports availability, offers, reservation creation/update/cancellation, published review IDs/details/replies, and publication/validity webhooks. Tokens use client credentials; credentials must remain server-side and unexpired tokens should be reused.

The current review schema has **restaurant-level** overall, food, service and ambience ratings plus comments. It has **no structured dish ID or per-item rating field**. A comment mentioning a dish must not be converted into a purported verified dish rating. No public B2B menu/photo feed was found in the published schema. Use restaurant-owned original images or an explicitly licensed feed; listing visibility does not automatically grant website reuse rights. The portal's published Partners API licence is restricted and prohibits scraping beyond permitted API data; confirm the applicable B2B agreement with TheFork before publication.

Primary sources: [B2B capabilities](https://docs.thefork.io/B2B-API/introduction), [access prerequisites](https://docs.thefork.io/preliminary-steps), [authentication](https://docs.thefork.io/B2B-API/authentication), [official schema](https://api.thefork.io/manager/openapi.json), [review IDs](https://docs.thefork.io/B2B-API/API%20specifications/get-v-1-reviews), [review event lifecycle](https://docs.thefork.io/B2B-API/event-webhook-flow), [published Partners API licence](https://docs.thefork.io/pdf/LaFourchette-Partners-API-Licence-2.pdf).

## Later owner-managed platform

These are planned capabilities, not live functionality:

1. Owner/staff roles; editable bilingual menu, prices, availability, allergens and licensed media with stable dish IDs and provenance.
2. One authoritative inventory with service hours, table/capacity rules, temporary holds and reservation state transitions. A TheFork channel must synchronize against this authority rather than independently accept the same inventory.
3. Owner-defined priority access windows or entitlements over that same inventory; waitlists and guest accounts can follow.
4. A separate payment state model for optional deposits, guarantees, refunds and cancellations. Use a provider's hosted/tokenized payment flow and idempotent verified webhooks. No card details belong in the application database.
5. Native verified-visit dish feedback if true item-level reviews are required, kept distinct from third-party restaurant reviews.

An email request is not a durable booking ledger. The current endpoint provides no owner dashboard, account system, inventory locking, payment collection or automated confirmation; those require a later implementation and operational setup.
