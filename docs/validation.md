# Validation — Sarab adaptation, 13 October 2026

This file describes the current Sarab ZIP adaptation. The previous dark-olive design and its browser/Lighthouse reports are historical and do not validate the current layout.

## Confirmed so far

- **16 server tests pass.** Coverage includes reservation validation, Rome dates, consent, payload/origin checks, honest unconfigured integrations, Google attribution/photo-proxy safety, and contact/newsletter request validation. Provider calls are mocked; no test emails, subscriptions or payments are created.
- TypeScript checking has passed during implementation of the Sarab sections.
- The source layout has been mapped to the original fourteen-section order. Reference assets and CSS were inspected directly; their design mapping and attribution are recorded in `docs/sarab-design-mapping.md` and `docs/sarab-template-license.md`.

## Current checks in progress

The Sarab browser suite and final production verification are in progress. Do not interpret these as passed until their new run is recorded here.

The updated browser checks target 375, 768 and 1440 px, Italian/English routes, overflow and hydration errors, mobile navigation, search, menu categories, dish dialogs, favorites/selection persistence and quantities, gallery lightbox navigation, testimonial controls, reduced motion, reservation feedback, contact/newsletter validation and the unconfigured Google state. Reports/screenshots are written to ignored `test-results/`.

No current Sarab Lighthouse score is reported. The earlier local production audit belongs to a superseded design; its numbers and old screenshots must not be reused as performance evidence for this adaptation.

## External behavior still configuration-gated

Reservation, contact and updates-request email delivery need a verified Resend sender and server secrets. Google reviews and photo delivery need a restricted Places API key and a verified restaurant place ID. TheFork synchronization needs approved partner access and a later adapter implementation.

Selected dishes and favorites stay in browser localStorage. They do not create orders, bookings, payments or user accounts. Newsletter requests do not activate subscriptions. Menu prices, hours/contacts, staff slots, history details, legal text and photo reuse rights retain their confirmation notes. No public deployment or external account change has been performed.
