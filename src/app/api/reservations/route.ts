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
  getReservationEmailConfig,
  reservationEmail,
  validateReservation,
} from "@/lib/server/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return jsonResponse({ ok: false, code: "ORIGIN_NOT_ALLOWED" }, 403);
  }
  const ipLimit = rateLimit(
    `reservation:ip:${clientKey(request)}`,
    5,
    15 * 60_000,
  );
  if (!ipLimit.allowed) {
    return jsonResponse({ ok: false, code: "RATE_LIMITED" }, 429, {
      "Retry-After": String(ipLimit.retryAfter),
    });
  }

  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    if (error instanceof BodyError) {
      const status =
        error.code === "PAYLOAD_TOO_LARGE"
          ? 413
          : error.code === "UNSUPPORTED_MEDIA_TYPE"
            ? 415
            : 400;
      return jsonResponse({ ok: false, code: error.code }, status);
    }
    return jsonResponse({ ok: false, code: "INVALID_JSON" }, 400);
  }
  const parsed = validateReservation(body);
  if (!parsed.success) {
    return jsonResponse(
      { ok: false, code: "VALIDATION_ERROR", fieldErrors: parsed.fieldErrors },
      400,
    );
  }
  const config = getReservationEmailConfig();
  if (!config) {
    return jsonResponse(
      {
        ok: false,
        code: "NOT_CONFIGURED",
        message:
          "Reservation requests are temporarily unavailable. Please contact the restaurant directly.",
      },
      503,
    );
  }
  const emailLimit = rateLimit(
    `reservation:email:${opaqueKey(parsed.data.email.toLowerCase())}`,
    3,
    60 * 60_000,
  );
  if (!emailLimit.allowed) {
    return jsonResponse({ ok: false, code: "RATE_LIMITED" }, 429, {
      "Retry-After": String(emailLimit.retryAfter),
    });
  }

  const requestId = randomUUID();
  try {
    const resend = new Resend(config.apiKey);
    const { data, error } = await resend.emails.send(
      {
        from: config.from,
        to: config.to,
        replyTo: parsed.data.email,
        ...reservationEmail(parsed.data, requestId),
      },
      {
        idempotencyKey: `reservation-request/${requestId}`,
        signal: AbortSignal.timeout(8000),
      },
    );
    if (error || !data?.id) {
      console.error("Reservation email rejected", {
        requestId,
        code: error?.name ?? "NO_DELIVERY_ID",
      });
      return jsonResponse(
        {
          ok: false,
          code: "DELIVERY_FAILED",
          message:
            "Your request could not be delivered. Please contact the restaurant directly.",
        },
        502,
      );
    }
    return jsonResponse(
      {
        ok: true,
        status: "pending",
        requestId,
        message:
          parsed.data.locale === "it"
            ? "Richiesta inviata. Il tavolo non è ancora confermato: attendi la conferma del ristorante."
            : "Request sent. Your table is not confirmed yet; please wait for the restaurant's confirmation.",
      },
      202,
    );
  } catch {
    console.error("Reservation email delivery unavailable", { requestId });
    return jsonResponse(
      {
        ok: false,
        code: "DELIVERY_FAILED",
        message:
          "We could not confirm delivery of your request. Please contact the restaurant directly.",
      },
      502,
    );
  }
}
