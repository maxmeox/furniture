import { NextResponse } from "next/server";
import { appUrl } from "@/lib/constants";

const allowedOrigins = new Set<string>();

function ensureInit() {
  if (allowedOrigins.size > 0) return;
  const envOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (envOrigin) allowedOrigins.add(envOrigin.replace(/\/$/, ""));
  if (appUrl) allowedOrigins.add(appUrl.replace(/\/$/, ""));
  allowedOrigins.add("http://localhost:3000");
}

/**
 * Validates that a cross-origin request comes from an allowed origin.
 *
 * Same-origin requests (where the Origin header matches the Host header) are
 * always allowed — this covers Vercel preview deployments, branch deploys,
 * and any dynamically-generated URLs without needing configuration.
 *
 * Cross-origin requests must have their origin in the static allowlist.
 */
export function validateCsrf(request: Request): { valid: boolean; reason?: string } {
  ensureInit();

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Same-origin: Origin matches Host — always allowed.
  // Covers preview deployments (vercel.app subdomains) and any dynamic URL.
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return { valid: true };
    } catch {
      // Malformed origin — fall through to referer check
    }
  }

  if (origin) {
    if (allowedOrigins.has(origin)) return { valid: true };
    return { valid: false, reason: "origin_not_allowed" };
  }

  const referer = request.headers.get("referer");

  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (allowedOrigins.has(refOrigin)) return { valid: true };
      return { valid: false, reason: "referer_not_allowed" };
    } catch {
      return { valid: false, reason: "invalid_referer" };
    }
  }

  return { valid: true };
}

export function csrfError() {
  return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
}
