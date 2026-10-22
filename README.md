# Grappasonni dal 1908

A bilingual restaurant website for Rome, adapted from the user-supplied **Sarab restaurant template ZIP** and visual references. The landing page has 10 sections: hero, categories, pasta feature, menu, connected cooking/chef area, gallery, reviews, reservations, direct contact information and newsletter. Repetitive history, hours, blog and mobile-promotion blocks have been removed. Italian is the default at `/`; English lives at `/en`. See [the latest page refinement](docs/page-refinement.md).

Built with Next.js 16 App Router, TypeScript, Tailwind 4, Material UI and GSAP. The template's visual structure and vendor styles are retained; its interactions are implemented as React components and server routes. See [the design mapping](docs/sarab-design-mapping.md) and [original template attribution/license](docs/sarab-template-license.md).

## Run locally

Use Node.js 22.13 or later (Node 24 LTS recommended).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

On Windows, copy `.env.example` to `.env.local` with your file manager or `Copy-Item`. Open http://localhost:3000. You can run without an environment file: the site works and clearly identifies unconfigured email/review integrations.

```sh
npm run typecheck
npm test
npm run build
npm start
```

`npm run check:browser` exercises the site at 375, 768 and 1440 pixels. It expects the app on port 3000 and the default Windows Chrome path; change `scripts/check-site.mjs` if your browser is elsewhere. Reports and screenshots are written to the ignored `test-results/` directory.

The current checks cover server requests, booking dates and device history, both languages, mobile/tablet/desktop layouts, and animated interactions. `node scripts/check-pasta-flight.mjs` also captures both legs of the scroll animation at phone and desktop widths. Reports and screenshots are stored in `test-results/`.

## Design and content

The source reference is `.reference/sarab/sarab/index.html` with its CSS and image directories. The Sarab stylesheet is retained in `src/app/vendor/sarab.css`, and Bootstrap 5.3.8 in `src/app/vendor/bootstrap.min.css`. Integration changes map fonts to Next.js font variables, isolate resets and accommodate CSS imports. Project-specific styles live in `src/app/globals.css`.

The font families are **Playfair Display**, **Lora**, **Poppins** and **Dancing Script**, loaded through `next/font`. The original circular hero, three floating cards, five-image gallery and testimonial-card geometry remain recognizable. Template attribution is recorded in the [license document](docs/sarab-template-license.md), while the footer shows restaurant information only.

- `src/data/menu.ts`: stable dish IDs, categories, bilingual labels and euro prices. Set `confirmed: true` only after restaurant approval.
- `src/data/content.ts`: restaurant identity and shared navigation text.
- `src/data/sarab.ts`: template-specific hero, categories, menu and interaction copy.
- `src/data/sarab-editorial.ts`: about/history, illustrative staff slots and editorial cards.
- `src/data/sarab-media.ts`: paired gallery photographs, review controls and the dated TheFork snapshot.
- `src/data/sarab-contact.ts` and `src/data/reservation-copy.ts`: form labels and feedback.
- `public/images/`: Grappasonni gallery photos, photographed menu pages, generated dish-specific menu images, the illustrated amatriciana plate, and a transparent rigatoni cutout for the scroll animation. [Image generation prompts and asset paths](docs/generated-dish-images.json) are retained.
- `public/kitchen/`: optimised Chef’s Kitchen reference artwork, licensed under [MIT](docs/chefs-kitchen-license.txt). These decorative portraits do not identify restaurant employees.
- `public/sarab/chefs/`: template imagery used in visibly labelled illustrative slots; these images do not identify Grappasonni staff.

Source dates, image provenance and verification status are in `docs/restaurant-research.md`, `docs/menu-research.md` and `docs/assets-sources.json`. Food prices came from guest menu photographs. The wine list is a suggested selection of common Italian wines; stock, producers, vintages and prices are not verified. Visible confirmation placeholders and image notes were removed at the user’s request. Internal research status remains unchanged. The published landline is not presented as WhatsApp.

## Interactive features

Search opens a dialog with bilingual dish results and category shortcuts. Menu categories filter the displayed dishes; dish dialogs show source/price notes and favorite/selection controls. Favorites and quantities persist only in the visitor's browser under the `grappasonni-dining` localStorage key. Visitors can edit or remove selected items, copy their list and continue to the reservation form.

This selection is a personal list. It does not place an order, send selections to the restaurant, reserve stock, collect payment or create an account. There is no checkout or payment processing.

The five-photo gallery has a focus-managed MUI lightbox with Escape, previous/next buttons and arrow-key navigation. The profile's Customize menu selects the default Momentum Ring or an Elastic Reel. Both are original local implementations because the React Bits Pro component requires a license key that is not available. The ring has depth, side blur, momentum and snapping; the reel has drag and spring movement. Testimonials use only the three sourced TheFork excerpts, with circular initial avatars and a responsive 3/2/1-card carousel. Autoplay pauses on hover, focus, page hiding and when the section is offscreen; reduced motion disables autoplay.

Customize also switches dark/light mode, full-page Heritage 1908 or Contemporary typography, the preserved classic or cinematic hero, motion, and welcome offers. The classic hero uses the earlier amatriciana plate. On scroll, that plate travels toward the pasta category and generated individual rigatoni pieces move onward into the featured dish. The cinematic hero uses a carbonara photograph and the same rigatoni journey. Motion preferences and the operating system's reduced-motion setting suppress nonessential effects. See [visual motion notes](docs/visual-motion.md).

## Reservation, contact and newsletter requests

Set `RESEND_API_KEY`, `RESERVATION_FROM_EMAIL` (a verified Resend sender) and `RESERVATION_TO_EMAIL`. These values are server-only and are shared by the reservation and inquiry email adapters.

The three-step reservation experience selects a date and time tile, then a party size, then contact details. It sends a **request**, not an automatic booking confirmation. Only a real provider acceptance returns `202 pending`; missing configuration returns `503` with clear unsent feedback. The guest can revisit their requests through the profile. The browser stores only a minimal local history of name, date, time, party size and honest delivery status; deleting that local copy does not cancel a restaurant request. Validation covers Rome calendar dates, 180-day bounds, guests, consent, input lengths and a honeypot.

The page has one reservation form and a separate newsletter signup. The duplicate contact form has been replaced by phone and directions links; the contact API adapter remains available. The newsletter submits to `/api/inquiries`, with consent, input validation, origin checks, payload limits, a honeypot and best-effort rate limits. It emails an **updates request** to the restaurant; it does not activate a mailing-list subscription or add an address to a marketing database. Missing configuration or provider failure is shown honestly.

There is no persistent booking inventory or subscription database yet. Rate limiting is per server instance; configure durable protection/WAF before a public booking launch. The external TheFork booking link remains available.

## Reviews and Google photos

TheFork excerpts and the 9.7/10 score from 605 reviews are a research snapshot checked on **12 October 2026**, with source links. They are not presented as a continuously synchronized feed.

`GOOGLE_PLACES_API_KEY` and a verified `GOOGLE_PLACE_ID` enable server-side Google Places requests. The Google tab fetches only when selected. `/api/reviews` returns attributed reviews and `photos[]` metadata. The UI can show up to two place photos with author/source links, using `/api/place-photo?name=...` without browser, server or CDN caching. Reviewer `photoUri` values remain profile avatars. Google media is not downloaded into the local photo library or used as an unaffiliated map image.

The public Places feed supplies a small relevant selection; it does not promise a photo for each review or structured dish scores. No live Google review/photo data is supplied when credentials are absent. See `docs/integrations.md` and `docs/google-research.md`.

TheFork synchronization still requires approved partner access and a later adapter. Reserved environment fields and source links do not constitute a live connection. The reviewed schema does not supply structured dish ratings or a menu/photo feed.

## Vercel

Import this folder as a Next.js project. Use the standard `npm run build`; do not use static export because the API routes require a server. Configure server secrets in Vercel, set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain and redeploy. Metadata, hreflang, Italian/English document language, Restaurant JSON-LD, favicon, Open Graph PNG, sitemap and robots are included.

Public-release data and integrations remain documented in the research and integration notes. No deployment or external account changes have been performed.

## Later standalone platform

`docs/platform-roadmap.md` covers owner-managed menu/media, guest access, priority rules, inventory, reservations and optional deposits/payments. Current content IDs, local browsing state and separate server adapters provide a starting point; these future services are not enabled by the template's visual controls.
