# Sarab template → Grappasonni mapping

Updated 13 October 2026. The user-supplied Sarab ZIP is the current visual reference. It supersedes the earlier editorial/dark-olive design. This adaptation follows the actual source HTML and CSS rather than approximating the layout from a screenshot.

## Source, attribution and implementation

- Extracted reference: `.reference/sarab/sarab/index.html`, `css/style.css`, `css/bootstrap.min.css`, `img/`, and `js/main.js`.
- Source design/code: Bestwpware; distribution: ThemeWagon. The supplied attribution is preserved in [sarab-template-license.md](sarab-template-license.md), and the footer links to both parties.
- Vendor baseline: `src/app/vendor/sarab.css` and `src/app/vendor/bootstrap.min.css` (Bootstrap 5.3.8). These preserve the source layout and component geometry. Font family declarations map to Next.js variables; the universal reset is isolated and Bootstrap's leading `@charset` is removed for CSS import compatibility. They are adapted copies, not byte-identical files.
- Additional integration styles: `src/app/globals.css`. Tailwind uses a prefix to avoid collisions with Bootstrap utility classes.
- Original jQuery, Bootstrap JavaScript, Swiper and Magnific Popup behavior is replaced by React state, GSAP and MUI dialogs. The imported visual CSS does not imply those legacy scripts run in the app.

The original font families are retained: Playfair Display for display type, Poppins for body/UI, and Dancing Script for script labels. `next/font` loads Playfair Display 400/700/900, Poppins 400/500/600/700 and Dancing Script 700. Legacy variable names `--font-cormorant` and `--font-dm` now point to Playfair Display and Poppins respectively.

## Original fourteen-section order

The top contact bar and sticky navigation precede these sections. The original marquee remains between the hero and category section; the footer follows the fourteen sections.

| Order | Original ID | React implementation | Content adaptation |
| ---: | --- | --- | --- |
| 1 | `hero` | `SarabHero` | Grappasonni identity, authentic food circle and factual floating cards |
| 2 | `category` | `SarabCategories` | Menu categories and real photo thumbnails |
| 3 | `about` | `SarabAbout` | Grappasonni introduction and overlapping location photos |
| 4 | `menu` | `SarabMenu` | Source-based dishes, filters, detail dialogs and personal selection |
| 5 | `special` | `SarabSpecial` | Restaurant invitation/facts instead of an invented discount countdown |
| 6 | `gallery` | `SarabGallery` | Five authentic photos and source-linked lightbox |
| 7 | `history` | `SarabHistory` | 1908/today plus visibly unconfirmed intermediate history |
| 8 | `chefs` | `SarabChefs` | Four visibly illustrative template slots; no invented staff identities |
| 9 | `hours` | `SarabHours` | Opening-hour presentation with unconfirmed values clearly marked |
| 10 | `testimonials` | `SarabReviews` | Three sourced TheFork excerpts and on-demand Google tab |
| 11 | `reservation` | `Reservation` | Validated request form, with honest delivery/configuration feedback |
| 12 | `blog` | `SarabBlog` | Restaurant/menu/gallery editorial cards with working detail dialogs |
| 13 | `newsletter` | `SarabNewsletter` | Consented request for updates; no automatic subscription |
| 14 | `contact-section` | `SarabContact` | Restaurant details and validated contact message form |

Existing Italian navigation aliases such as `storia`, `atmosfera` and `recensioni` remain available where needed.

## Figure geometry retained

The cream background, red `#E8281A`, gold `#F6A623`, dark `#1A1A1A`, rounded cards, photographic circles, drop shadows, section labels and headings follow the source stylesheet.

- Hero `.hcircle`: 480 × 480 px, 50% radius; inner photo is 90% wide/high with `object-fit: cover`. The original image is a square JPG, not a transparent cutout. `guest-dish-04.webp` replaces the burger, cropped at `50% 60%`, while retaining the same circle and ring.
- Floating `.fcard` boxes: 11 px radius, 10 × 15 px padding, 34 px icon tiles. `.fc1` sits at `top: 55px; left: -15px`; `.fc2` at `bottom: 75px; right: -25px`; `.fc3` at `top: 38%; right: -45px`. Restaurant/date/location/review facts replace the source's fictional delivery and offer claims.
- Responsive hero circle: 320 px below 992 px, 260 px below 768 px, 220 px below 481 px. Hero floating cards disappear below 768 px.
- About `.amain`: rounded 18 px rectangle with 440 px image height. `.asm`: overlapping 170 px square, 14 px corners, 5 px white border, offset -26 px right/bottom. `.aexp` retains the floating date-badge shape.
- Category thumbnails: 86 px circles inside rounded cards. Menu cards retain their 215 px photo area, 18 px corners, badges, favorite controls and round add/detail controls.
- Gallery `.ggrid`: three columns, two 215 px rows, 13 px gaps; the first image spans both rows. All five items use 14 px rounded clipping and the original hover gradient.
- Testimonials retain cream `.tescard` boxes, background quote marks, gold stars and round 46 px author indicators. The three actual review authors use initials instead of unrelated stock portraits. The carousel displays 3/2/1 cards at desktop/tablet/mobile widths.

## Photographs and factual boundaries

Authentic photos in `public/images/` come from Grappasonni's public TheFork listing and guest gallery. Their original URLs, dimensions, attribution status and unresolved reuse rights are in [assets-sources.json](assets-sources.json). Menu scans and the documented photographed prices remain separately identifiable.

The five gallery images are `interior.webp`, `terrace.webp`, `dish-02.webp`, `detail.webp` and `dish-03.webp`. Their captions and alt text remain paired in `src/data/sarab-media.ts`. Generic food captions avoid asserting an unverified named dish.

The four retained `public/sarab/chefs/*.jpg` images belong to the template. They are visibly labelled illustrative and do not represent the Grappasonni team. One source image is an architectural scene, underscoring why none should be treated as verified staff imagery. Names, roles and social identities remain unconfirmed; controls open explanatory information instead of fabricated profiles.

No generated restaurant photographs or paid generation jobs are required for this adaptation. Source photo accessibility does not establish reuse rights; restaurant/photographer clearance remains a launch requirement.

## Working behaviors

Search, category shortcuts, menu filtering, dish details, favorites, selected quantities, copy-list behavior, image lightbox, review controls, mobile navigation, article details and legal/staff information are React interactions. Favorites and selection use only the `grappasonni-dining` localStorage entry. Selection does not submit an order, reserve stock or collect payment.

Reservation requests continue through the existing server adapter. Contact and newsletter requests use `/api/inquiries`; all email features require server-side Resend configuration. Newsletter submission requests follow-up and does not subscribe the visitor to a database. Google reviews/photos load only after selecting Google and require server configuration. TheFork's live adapter remains future work.
