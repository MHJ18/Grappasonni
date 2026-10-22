# Page refinement · 14 October 2026

## Page flow

Hero → food categories → pasta feature → menu → cooking and chef composition → gallery → reviews → reservation → direct contact links → newsletter.

Removed the repeated about/history, timeline, opening-hours, editorial-blog and mobile-promotion sections. Navigation and footer links now lead to the remaining sections. The duplicate contact form was replaced with direct telephone and directions links. There is one reservation form plus the separately requested newsletter signup.

## Reference implementation

Cooking and newsletter layout reference: https://preview.themewagon.com/chefs-kitchen-nextjs-free/

Source: https://github.com/GetNextjsTemplates/chef-kitchen-nextjs-landing-page-template

The cooking portrait, connected expert row, floating food art, coral newsletter surface, overlapping plate and vegetable artwork follow the supplied reference. Chef’s Kitchen source artwork was downloaded from that preview and converted to compact WebP files in `public/kitchen/`. The reference’s embedded chef SVG was optimised before conversion, preserving its composition. Original copyright and MIT terms are retained in `docs/chefs-kitchen-license.txt`; footer attribution links to GetNextjsTemplates.

The chef portraits are decorative template artwork. The three labels describe cooking values, rather than inventing employee names or identities. On mobile, the portraits form a horizontal swipe rail to limit page length. The newsletter uses the existing Italian pasta illustration. Its real validation, consent, pending response and unavailable-service feedback are preserved.

## Menu and content

Menu tabs trigger a staggered fade, vertical entrance and blur reduction, with keyboard focus retained. Animation is disabled for reduced-motion visitors. Initial server and client markup is stable during hydration.

Visible confirmation placeholders, price asterisks, dish identity notes and the menu allergen paragraph were removed at the user’s request. This is a presentation change: existing research facts and confirmation flags were not promoted to verified facts. Unverified schedules were omitted and opening-hours inquiries directed to the restaurant.

Six common Italian wine styles were added as an editable suggested selection: Frascati DOC, Pinot Grigio delle Venezie DOC, Vermentino di Toscana IGT, Chianti DOCG, Montepulciano d’Abruzzo DOC and Prosecco DOC. Producers, vintages, stock and prices are not known; price fields remain null. The UI says glass/bottle and asks guests for the day’s selection instead of inventing euro prices.

## Validation

49 browser checks across Italian mobile/tablet/desktop, English desktop and desktop motion. They cover section order, no duplicate contact form, live anchor targets, removed placeholders, six wine entries, keyboard filters, animation settling, favourites, photographed menu, gallery, forms, loaded images and horizontal overflow. Form submissions are intercepted locally. The 16 server tests and production compilation pass. Reports and section screenshots are saved in `test-results/`.

The newsletter and reservation email adapters still require their existing provider configuration. No publication or external messages were performed.
