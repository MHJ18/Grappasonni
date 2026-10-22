# Google listing and photo research

Research date: 12 October 2026 (Europe/Rome).

## Listing link located

[Open Grappasonni on Google Maps](https://www.google.com/maps/search/?api=1&query=Ristorante+Grappasonni+dal+1908&query_place_id=ChIJI-vDF-qJJRMRObrY4JlPg_E)

- Place-ID candidate: `ChIJI-vDF-qJJRMRObrY4JlPg_E`.
- A second public directory points to [Google Maps CID 17402840907410618937](https://www.google.it/maps/?cid=17402840907410618937).
- Restaurant identity to confirm before enabling an API connection: **Ristorante Grappasonni dal 1908, Via Appia Nuova 858–860, 00178 Roma, telephone +39 06 718 8701**.

The place-ID link was found as an actual outgoing Google Maps link on [Menufans' Grappasonni page](https://menufans.com/place/ristorante-grappasonni-dal-1908-019b550bb970728d8f0baf662f2387af). The CID link was independently found on [Gusto e Gusti's Grappasonni page](https://gustoegusti.it/ristoranti/roma/roma/grappasonni). These directories were used to discover links only; their ratings, reviews, images and menu prices were not adopted as verified current restaurant content.

The candidate ID has **not** been validated by an authenticated Places API response or by seeing the live listing in a browser. Confirm that the Google listing name, address, phone and website match the restaurant before placing the value in `GOOGLE_PLACE_ID`.

## What was actually accessible

Both Google Maps listing requests redirected to Google's consent page. The web-reading tool reported that destination inaccessible. The browser tool reported that the in-app browser was unavailable, and its browser inventory contained no available browser surfaces. No challenge, sign-in or consent barrier was bypassed.

Consequently, the current Google Maps review list, reviewer details, rating count, dish photos and photo-to-review relationships could **not be directly verified** in this research session. No specific review text, score, review count, contributor photo or food image is represented here as a verified live Google result. No Google media was downloaded, mirrored or saved into the site's assets.

Third-party pages do contain material labelled as Google reviews and Google-hosted image links. That does not establish current Google provenance, permission to reuse the images, or whether an image is a reviewer avatar rather than a meal photo. They were not used to populate the site.

## Implemented support and remaining setup

1. The owner confirms the listing identity above and supplies a server-side Places API (New) key for an enabled, billed Google project. Restrict the key and set quotas.
2. The implemented `/api/reviews` endpoint fetches attributed review data and `photos[]` metadata using `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID`. A review's `photoUri` remains the **reviewer's profile avatar**, not a dish photo.
3. The implemented `/api/place-photo?name=...` proxy retrieves official Place Photos media on demand. It validates the configured place and Google image hosts, keeps the API key server-side, applies time/size/rate limits and disables caching. The Google tab can show up to two photos with author credits and individual Google Maps source links. The public API supplies place-level photos and reviews as separate resources; it does not guarantee a photo attached to each review or a dish-level review score.
4. The display keeps Google branding and credits beside the images and remains separate from the location/map section. Photo references are fetched freshly and Google content is not permanently stored. Use restaurant-owned originals for permanent hero or editorial photo assets.

No live Google review/photo content was fetched without configured keys. The remaining setup is provider access and listing verification, rather than building the photo endpoint. Until that setup is complete, the site uses the direct Google listing link, restaurant photographs with documented provenance, and honest unavailable states for the live feed. See [integrations.md](./integrations.md) for the endpoint contracts and complete integration limitations.

Validation includes 13 passing server tests, with photo requests mocked rather than sent to Google. The production build and browser checks at 375, 768 and 1440 pixels, including the English route, pass; these checks do not establish live provider connectivity.

Primary implementation sources: [Places resource fields and limits](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places), [Place Photos](https://developers.google.com/maps/documentation/places/web-service/place-photos), [Google attribution/storage policies](https://developers.google.com/maps/documentation/places/web-service/policies?hl=en), [EEA display rules](https://developers.google.com/maps/comms/eea/places?hl=en), [Google place-ID guide](https://developers.google.com/maps/documentation/places/web-service/place-id).
