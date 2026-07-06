import { NextRequest, NextResponse } from "next/server";
import { EventType } from "@prisma/client";
import { z, ZodError } from "zod";
import { checkRateLimit, getClientRateLimitKey, readJsonWithLimit } from "@/lib/rate-limit";
import { createEventRecord } from "@/lib/tracking-store";
import { validateCsrf, csrfError } from "@/lib/csrf";

const optionalText = (max: number) => z.string().trim().max(max).optional();
const metadataValueSchema = z.union([z.string().trim().max(500), z.number().finite(), z.boolean(), z.null()]);
const metadataSchema = z
  .record(z.string().trim().max(80), metadataValueSchema)
  .refine((value) => Object.keys(value).length <= 20, { message: "Too many metadata fields" });

const eventSchema = z.object({
  type: z.nativeEnum(EventType),
  entityType: optionalText(80),
  entityId: optionalText(2048),
  locale: z.enum(["ar", "en", "he"]).optional(),
  url: optionalText(2048),
  referrer: optionalText(2048),
  campaignContext: z
    .object({
      utm_source: optionalText(120),
      utm_medium: optionalText(120),
      utm_campaign: optionalText(160),
      utm_content: optionalText(160),
      fbclid: optionalText(500)
    })
    .strict()
    .optional(),
  metadata: metadataSchema.optional()
}).strict();

const eventRateLimit = {
  limit: 60,
  windowMs: 10 * 60 * 1000
};

export async function POST(request: NextRequest) {
  try {
    const csrfCheck = validateCsrf(request);
    if (!csrfCheck.valid) return csrfError();

    const rateLimit = await checkRateLimit({
      namespace: "api:events",
      key: getClientRateLimitKey(request),
      ...eventRateLimit
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: "too_many_requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) } }
      );
    }

    const json = await readJsonWithLimit(request, 8 * 1024);
    if (!json.ok) {
      return NextResponse.json({ ok: false, error: json.error }, { status: json.status });
    }

    const payload = eventSchema.parse(json.data);
    const userAgent = request.headers.get("user-agent")?.slice(0, 512) ?? undefined;
    const event = await createEventRecord({ ...payload, userAgent });
    return NextResponse.json({ ok: true, event }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ ok: false, error: "Validation failed", details: e.flatten() }, { status: 422 });
    }
    console.error("[events]", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
