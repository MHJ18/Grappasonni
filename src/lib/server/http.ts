import { createHash } from "node:crypto";

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: { ...privateHeaders, ...headers },
  });
}

function httpOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.origin : null;
  } catch {
    return null;
  }
}

export function isAllowedOrigin(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const originHeader = request.headers.get("origin");
  const origin = httpOrigin(originHeader ?? undefined);
  if (!origin || originHeader !== origin) return false;

  const configured = [
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    ...(process.env.ALLOWED_ORIGINS ?? "").split(","),
  ]
    .map((value) => httpOrigin(value?.trim()))
    .filter((value): value is string => Boolean(value));

  // The request origin is a development fallback. Production hosts must be explicit.
  if (process.env.NODE_ENV !== "production") {
    const requestOrigin = httpOrigin(request.url);
    if (requestOrigin) configured.push(requestOrigin);
  }
  if (process.env.VERCEL_URL) {
    const deploymentOrigin = httpOrigin(`https://${process.env.VERCEL_URL}`);
    if (deploymentOrigin) configured.push(deploymentOrigin);
  }
  return configured.includes(origin);
}

type Bucket = { count: number; expiresAt: number };
const rateLimitGlobal = globalThis as typeof globalThis & {
  grappasonniRateLimits?: Map<string, Bucket>;
};
const buckets = (rateLimitGlobal.grappasonniRateLimits ??= new Map<
  string,
  Bucket
>());
const MAX_BUCKETS = 5000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
) {
  for (const [bucketKey, value] of buckets) {
    if (value.expiresAt <= now) buckets.delete(bucketKey);
  }
  const current = buckets.get(key);
  if (current) {
    if (current.count >= limit) {
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
      };
    }
    current.count += 1;
    return { allowed: true, retryAfter: 0 };
  }
  // Reject new keys if full instead of evicting active limits under an attack.
  if (buckets.size >= MAX_BUCKETS) return { allowed: false, retryAfter: 60 };
  buckets.set(key, { count: 1, expiresAt: now + windowMs });
  return { allowed: true, retryAfter: 0 };
}

export function opaqueKey(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function clientKey(request: Request): string {
  // Only trustworthy when the deployment proxy overwrites incoming forwarding headers.
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for");
  const address =
    forwarded?.split(",")[0]?.trim().slice(0, 100) || "unknown-client";
  return opaqueKey(address);
}

export class BodyError extends Error {
  readonly code:
    "INVALID_JSON" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE";

  constructor(
    code: "INVALID_JSON" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE",
  ) {
    super(code);
    this.code = code;
  }
}

export async function readJsonBody(
  request: Request,
  maxBytes = 16_384,
): Promise<unknown> {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    throw new BodyError("UNSUPPORTED_MEDIA_TYPE");
  }
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > maxBytes)
    throw new BodyError("PAYLOAD_TOO_LARGE");
  if (!request.body) throw new BodyError("INVALID_JSON");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new BodyError("PAYLOAD_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body));
  } catch {
    throw new BodyError("INVALID_JSON");
  }
}
