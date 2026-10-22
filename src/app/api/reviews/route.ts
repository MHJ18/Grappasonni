import { clientKey, jsonResponse, rateLimit } from "@/lib/server/http";
import {
  fetchGoogleReviews,
  getGoogleConfig,
  getTheForkStatus,
} from "@/lib/server/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const theFork = getTheForkStatus();
  if (!getGoogleConfig()) {
    return jsonResponse(
      { ok: false, code: "NOT_CONFIGURED", source: "google", theFork },
      503,
    );
  }
  const requestUrl = new URL(request.url);
  const locale = requestUrl.searchParams.get("locale") ?? "it";
  if (locale !== "it" && locale !== "en") {
    return jsonResponse(
      {
        ok: false,
        code: "VALIDATION_ERROR",
        fieldErrors: { locale: ["Use it or en."] },
      },
      400,
    );
  }
  const visitorLimit = rateLimit(
    `reviews:ip:${clientKey(request)}`,
    20,
    60_000,
  );
  const instanceLimit = visitorLimit.allowed
    ? rateLimit("reviews:instance", 120, 60_000)
    : visitorLimit;
  if (!visitorLimit.allowed || !instanceLimit.allowed) {
    return jsonResponse({ ok: false, code: "RATE_LIMITED", theFork }, 429, {
      "Retry-After": String(
        Math.max(visitorLimit.retryAfter, instanceLimit.retryAfter),
      ),
    });
  }
  try {
    const reviews = await fetchGoogleReviews(locale);
    if (!reviews)
      return jsonResponse(
        { ok: false, code: "NOT_CONFIGURED", source: "google", theFork },
        503,
      );
    return jsonResponse({ ok: true, ...reviews, theFork });
  } catch {
    console.error("Google Places reviews temporarily unavailable");
    return jsonResponse(
      { ok: false, code: "UPSTREAM_UNAVAILABLE", source: "google", theFork },
      502,
    );
  }
}
