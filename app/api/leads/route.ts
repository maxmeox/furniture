import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { inquiryPayloadSchema } from "@/lib/conversion";
import { checkRateLimit, getClientRateLimitKey, readJsonWithLimit } from "@/lib/rate-limit";
import { createEventRecord, createLeadRecord } from "@/lib/tracking-store";
import { validateCsrf, csrfError } from "@/lib/csrf";

const leadRateLimit = {
  limit: 5,
  windowMs: 10 * 60 * 1000
};

export async function POST(request: NextRequest) {
  try {
    const csrfCheck = validateCsrf(request);
    if (!csrfCheck.valid) return csrfError();

    const rateLimit = await checkRateLimit({
      namespace: "api:leads",
      key: getClientRateLimitKey(request),
      ...leadRateLimit
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: "too_many_requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) } }
      );
    }

    const json = await readJsonWithLimit(request, 16 * 1024);
    if (!json.ok) {
      return NextResponse.json({ ok: false, error: json.error }, { status: json.status });
    }

    const payload = inquiryPayloadSchema.parse(json.data);
    const userAgent = request.headers.get("user-agent")?.slice(0, 512) ?? undefined;
    const lead = await createLeadRecord(payload, userAgent);

    await createEventRecord({
      type: payload.entity.type === "interest_list" ? "interest_list_sent" : "whatsapp_click",
      entityType: payload.entity.type,
      entityId: payload.entity.id,
      leadId: lead.stored === "database" ? lead.id : undefined,
      locale: payload.locale,
      url: payload.sourcePageUrl,
      referrer: payload.referrer,
      userAgent,
      campaignContext: payload.campaignContext,
      metadata: {
        deliveryArea: payload.deliveryArea,
        inquiryType: payload.inquiryType,
        selectedFabric: payload.selectedFabric,
        leadId: lead.id
      }
    });

    return NextResponse.json({ ok: true, lead }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ ok: false, error: "Validation failed", details: e.flatten() }, { status: 422 });
    }
    console.error("[leads]", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
