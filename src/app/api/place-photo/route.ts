import { clientKey, jsonResponse, rateLimit } from "@/lib/server/http";
import {
  fetchGooglePlacePhoto,
  getGoogleConfig,
  isPlacePhotoName,
} from "@/lib/server/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const config = getGoogleConfig();
  if (!config)
    return jsonResponse(
      { ok: false, code: "NOT_CONFIGURED", source: "google" },
      503,
    );
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return jsonResponse({ ok: false, code: "ORIGIN_NOT_ALLOWED" }, 403);
  }
  const url = new URL(request.url);
  const names = url.searchParams.getAll("name");
  const name = names[0] ?? "";
  if (names.length !== 1 || !isPlacePhotoName(name, config.placeId)) {
    return jsonResponse({ ok: false, code: "VALIDATION_ERROR" }, 400);
  }
  const visitorLimit = rateLimit(
    `place-photo:ip:${clientKey(request)}`,
    20,
    60_000,
  );
  const instanceLimit = visitorLimit.allowed
    ? rateLimit("place-photo:instance", 100, 60_000)
    : visitorLimit;
  if (!visitorLimit.allowed || !instanceLimit.allowed) {
    return jsonResponse({ ok: false, code: "RATE_LIMITED" }, 429, {
      "Retry-After": String(
        Math.max(visitorLimit.retryAfter, instanceLimit.retryAfter),
      ),
    });
  }
  try {
    const photo = await fetchGooglePlacePhoto(name);
    if (!photo)
      return jsonResponse(
        { ok: false, code: "NOT_CONFIGURED", source: "google" },
        503,
      );
    return new Response(photo.bytes, {
      headers: {
        "Content-Type": photo.contentType,
        "Content-Length": String(photo.bytes.byteLength),
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Cross-Origin-Resource-Policy": "same-origin",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    console.error("Google Place Photos temporarily unavailable");
    return jsonResponse(
      { ok: false, code: "UPSTREAM_UNAVAILABLE", source: "google" },
      502,
    );
  }
}
