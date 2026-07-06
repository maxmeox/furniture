import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const attributionCookie = "furniture_showroom_campaign_context";
const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid"] as const;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const attribution = attributionKeys.reduce<Record<string, string>>((context, key) => {
    const value = request.nextUrl.searchParams.get(key);
    if (value) context[key] = value;
    return context;
  }, {});
  const hasAttribution = Object.keys(attribution).length > 0;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("admin_session")?.value;
    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      const response = NextResponse.redirect(loginUrl);
      if (hasAttribution) setAttributionCookie(response, attribution);
      return response;
    }
  }

  if (pathname.startsWith("/admin")) {
    const response = NextResponse.next();
    if (hasAttribution) setAttributionCookie(response, attribution);
    return response;
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/ar";
    const response = NextResponse.redirect(url);
    if (hasAttribution) setAttributionCookie(response, attribution);
    return response;
  }

  const response = intlMiddleware(request);
  if (hasAttribution) setAttributionCookie(response, attribution);
  return response;
}

function setAttributionCookie(response: NextResponse, attribution: Record<string, string>) {
  response.cookies.set(attributionCookie, encodeURIComponent(JSON.stringify(attribution)), {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30
  });
}

export const config = {
  matcher: ["/", "/(ar|en|he)/:path*", "/admin/:path*"]
};
