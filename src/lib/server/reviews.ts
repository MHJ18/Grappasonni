import { z } from "zod";

export type Review = {
  id: string;
  author: string;
  authorUrl: string | null;
  photoUri: string | null;
  text: string;
  originalText: string | null;
  rating: number;
  publishTime: string;
  relativePublishTimeDescription: string | null;
  googleMapsUri: string;
};

export type PlacePhoto = {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: Array<{
    displayName: string;
    uri?: string;
    photoUri?: string;
  }>;
  googleMapsUri?: string;
};

export type ReviewsResult = {
  source: "google";
  attribution: "Google Maps";
  ordering: "most_relevant";
  fetchedAt: string;
  place: {
    id: string;
    name: string;
    rating: number | null;
    count: number | null;
    googleMapsUri: string | null;
  };
  reviews: Review[];
  photos: PlacePhoto[];
};

const localizedText = z.object({
  text: z.string(),
  languageCode: z.string().optional(),
});
const googleReview = z.object({
  name: z.string(),
  rating: z.number().min(1).max(5),
  text: localizedText.optional(),
  originalText: localizedText.optional(),
  authorAttribution: z.object({
    displayName: z.string(),
    uri: z.string().optional(),
    photoUri: z.string().optional(),
  }),
  publishTime: z.string(),
  relativePublishTimeDescription: z.string().optional(),
  googleMapsUri: z.string(),
});

const googlePhoto = z.object({
  name: z.string().max(2300),
  widthPx: z.number().int().positive(),
  heightPx: z.number().int().positive(),
  authorAttributions: z.array(
    z.object({
      displayName: z.string(),
      uri: z.string().optional(),
      photoUri: z.string().optional(),
    }),
  ),
  googleMapsUri: z.string().optional(),
});

const googlePlace = z.object({
  id: z.string(),
  displayName: localizedText,
  rating: z.number().min(1).max(5).optional(),
  userRatingCount: z.number().int().nonnegative().optional(),
  googleMapsUri: z.string().optional(),
  reviews: z.array(googleReview).max(5).optional(),
  photos: z.array(googlePhoto).max(10).optional(),
});

function httpsUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith("//") ? `https:${value}` : value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function getGoogleConfig() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  return apiKey && placeId ? { apiKey, placeId } : null;
}

export function getTheForkStatus() {
  const configured = Boolean(
    process.env.THEFORK_CLIENT_ID &&
    process.env.THEFORK_CLIENT_SECRET &&
    process.env.THEFORK_RESTAURANT_UUID,
  );
  return {
    configured,
    connected: false as const,
    status: configured
      ? ("adapter_not_enabled" as const)
      : ("awaiting_access" as const),
    sourceUrl:
      "https://www.thefork.it/ristorante/grappasonni-dal-1908-r76248/recensioni",
    dishReviewsAvailable: false as const,
  };
}

export function mapGooglePlace(
  data: unknown,
  fetchedAt = new Date().toISOString(),
): ReviewsResult {
  const place = googlePlace.parse(data);
  return {
    source: "google",
    attribution: "Google Maps",
    ordering: "most_relevant",
    fetchedAt,
    place: {
      id: place.id,
      name: place.displayName.text,
      rating: place.rating ?? null,
      count: place.userRatingCount ?? null,
      googleMapsUri: httpsUrl(place.googleMapsUri),
    },
    reviews: (place.reviews ?? []).flatMap((review) => {
      const googleMapsUri = httpsUrl(review.googleMapsUri);
      // A review without its author or a working source link cannot be displayed with proper attribution.
      if (!googleMapsUri || !review.authorAttribution.displayName.trim())
        return [];
      return [
        {
          id: review.name,
          author: review.authorAttribution.displayName,
          authorUrl: httpsUrl(review.authorAttribution.uri),
          photoUri: httpsUrl(review.authorAttribution.photoUri),
          text: review.text?.text ?? "",
          originalText: review.originalText?.text ?? null,
          rating: review.rating,
          publishTime: review.publishTime,
          relativePublishTimeDescription:
            review.relativePublishTimeDescription ?? null,
          googleMapsUri,
        },
      ];
    }),
    photos: (place.photos ?? []).flatMap((photo) => {
      if (!isPlacePhotoName(photo.name, place.id)) return [];
      const source = httpsUrl(photo.googleMapsUri);
      return [
        {
          name: photo.name,
          widthPx: photo.widthPx,
          heightPx: photo.heightPx,
          authorAttributions: photo.authorAttributions.map((author) => {
            const uri = httpsUrl(author.uri);
            const photoUri = httpsUrl(author.photoUri);
            return {
              displayName: author.displayName,
              ...(uri ? { uri } : {}),
              ...(photoUri ? { photoUri } : {}),
            };
          }),
          ...(source ? { googleMapsUri: source } : {}),
        },
      ];
    }),
  };
}

export async function fetchGoogleReviews(
  locale: "it" | "en",
): Promise<ReviewsResult | null> {
  const config = getGoogleConfig();
  if (!config) return null;
  const url = new URL(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(config.placeId)}`,
  );
  url.searchParams.set("languageCode", locale);
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "X-Goog-Api-Key": config.apiKey,
      "X-Goog-FieldMask":
        "id,displayName,rating,userRatingCount,googleMapsUri,reviews,photos",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok)
    throw new Error(`Google Places returned ${response.status}`);
  return mapGooglePlace(await response.json());
}

export function isPlacePhotoName(name: string, placeId: string): boolean {
  if (!/^[A-Za-z0-9_-]{1,256}$/.test(placeId)) return false;
  const prefix = `places/${placeId}/photos/`;
  return (
    name.startsWith(prefix) &&
    /^[A-Za-z0-9_-]{1,2048}$/.test(name.slice(prefix.length))
  );
}

export function isGooglePhotoUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      (url.hostname === "googleusercontent.com" ||
        url.hostname.endsWith(".googleusercontent.com"))
    );
  } catch {
    return false;
  }
}

export async function readBoundedResponse(
  response: Response,
  maxBytes: number,
): Promise<ArrayBuffer> {
  const length = Number(response.headers.get("content-length"));
  if (Number.isFinite(length) && length > maxBytes) {
    await response.body?.cancel();
    throw new Error("Upstream body exceeds the size limit");
  }
  if (!response.body) throw new Error("Upstream body is missing");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error("Upstream body exceeds the size limit");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes.buffer;
}

export function matchesPhotoType(
  bytes: ArrayBuffer,
  contentType: string,
): boolean {
  const view = new Uint8Array(bytes);
  const ascii = (start: number, length: number) =>
    new TextDecoder().decode(view.subarray(start, start + length));
  switch (contentType) {
    case "image/jpeg":
      return view[0] === 0xff && view[1] === 0xd8 && view[2] === 0xff;
    case "image/png":
      return (
        view.length >= 8 &&
        [137, 80, 78, 71, 13, 10, 26, 10].every(
          (byte, index) => view[index] === byte,
        )
      );
    case "image/gif":
      return ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a";
    case "image/webp":
      return ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP";
    case "image/avif":
      return ascii(4, 4) === "ftyp" && /avif|avis/.test(ascii(8, 56));
    default:
      return false;
  }
}

export async function fetchGooglePlacePhoto(
  name: string,
): Promise<{ bytes: ArrayBuffer; contentType: string } | null> {
  const config = getGoogleConfig();
  if (!config) return null;
  if (!isPlacePhotoName(name, config.placeId))
    throw new Error("Invalid place photo name");

  // This request resolves the short-lived CDN URI without exposing the API key to the browser.
  const signal = AbortSignal.timeout(8000);
  const mediaUrl = new URL(`https://places.googleapis.com/v1/${name}/media`);
  mediaUrl.searchParams.set("maxWidthPx", "960");
  mediaUrl.searchParams.set("maxHeightPx", "960");
  mediaUrl.searchParams.set("skipHttpRedirect", "true");
  const metadataResponse = await fetch(mediaUrl, {
    cache: "no-store",
    redirect: "error",
    signal,
    headers: { "X-Goog-Api-Key": config.apiKey },
  });
  if (!metadataResponse.ok) throw new Error("Google Place Photos unavailable");
  const metadataBytes = await readBoundedResponse(metadataResponse, 16_384);
  const metadata = z
    .object({ photoUri: z.string() })
    .parse(JSON.parse(new TextDecoder().decode(metadataBytes)));
  let photoUrl = metadata.photoUri;

  for (let redirects = 0; redirects <= 2; redirects += 1) {
    if (!isGooglePhotoUrl(photoUrl))
      throw new Error("Unexpected Google photo host");
    const imageResponse = await fetch(photoUrl, {
      cache: "no-store",
      redirect: "manual",
      signal,
    });
    if ([301, 302, 303, 307, 308].includes(imageResponse.status)) {
      const location = imageResponse.headers.get("location");
      await imageResponse.body?.cancel();
      if (!location || redirects === 2)
        throw new Error("Unexpected Google photo redirect");
      photoUrl = new URL(location, photoUrl).href;
      continue;
    }
    if (!imageResponse.ok) {
      await imageResponse.body?.cancel();
      throw new Error("Google photo media unavailable");
    }
    const contentType = (imageResponse.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    const bytes = await readBoundedResponse(imageResponse, 6 * 1024 * 1024);
    if (!matchesPhotoType(bytes, contentType))
      throw new Error("Unsupported Google photo media type");
    return { bytes, contentType };
  }
  throw new Error("Unexpected Google photo response");
}
