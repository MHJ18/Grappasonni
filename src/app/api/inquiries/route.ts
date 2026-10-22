import { randomUUID } from "node:crypto";
import { Resend } from "resend";
import {
  BodyError,
  clientKey,
  isAllowedOrigin,
  jsonResponse,
  opaqueKey,
  rateLimit,
  readJsonBody,
} from "@/lib/server/http";
import {
  getInquiryEmailConfig,
  inquiryEmail,
  validateInquiry,
} from "@/lib/server/inquiries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAllowedOrigin(request))
    return jsonResponse({ ok: false, code: "ORIGIN_NOT_ALLOWED" }, 403);
  const ipLimit = rateLimit(`inquiry:ip:${clientKey(request)}`, 5, 15 * 60_000);
  if (!ipLimit.allowed)
    return jsonResponse({ ok: false, code: "RATE_LIMITED" }, 429, {
      "Retry-After": String(ipLimit.retryAfter),
    });
  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    const code = error instanceof BodyError ? error.code : "INVALID_JSON";
    return jsonResponse(
      { ok: false, code },
      code === "PAYLOAD_TOO_LARGE"
        ? 413
        : code === "UNSUPPORTED_MEDIA_TYPE"
          ? 415
          : 400,
    );
  }
  const parsed = validateInquiry(body);
  if (!parsed.success)
    return jsonResponse(
      { ok: false, code: "VALIDATION_ERROR", fieldErrors: parsed.fieldErrors },
      400,
    );
  const config = getInquiryEmailConfig();
  if (!config) return jsonResponse({ ok: false, code: "NOT_CONFIGURED" }, 503);
  const emailLimit = rateLimit(
    `inquiry:email:${opaqueKey(parsed.data.email.toLowerCase())}`,
    3,
    60 * 60_000,
  );
  if (!emailLimit.allowed)
    return jsonResponse({ ok: false, code: "RATE_LIMITED" }, 429, {
      "Retry-After": String(emailLimit.retryAfter),
    });
  const requestId = randomUUID();
  try {
    const { data, error } = await new Resend(config.apiKey).emails.send(
      {
        from: config.from,
        to: config.to,
        replyTo: parsed.data.email,
        ...inquiryEmail(parsed.data, requestId),
      },
      {
        idempotencyKey: `website-inquiry/${requestId}`,
        signal: AbortSignal.timeout(8000),
      },
    );
    if (error || !data?.id) {
      console.error("Website inquiry email rejected", {
        requestId,
        code: error?.name ?? "NO_DELIVERY_ID",
      });
      return jsonResponse({ ok: false, code: "DELIVERY_FAILED" }, 502);
    }
    return jsonResponse(
      { ok: true, status: "pending", requestId, kind: parsed.data.kind },
      202,
    );
  } catch {
    console.error("Website inquiry delivery could not be verified", {
      requestId,
    });
    return jsonResponse({ ok: false, code: "DELIVERY_FAILED" }, 502);
  }
}
