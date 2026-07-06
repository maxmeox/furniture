import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/debug"]
    },
    sitemap: `${appUrl}/sitemap.xml`
  };
}
