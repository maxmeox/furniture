import { tenant } from "@/lib/tenant";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             tenant.identity.nameAr,
    short_name:       tenant.identity.shortNameAr,
    description:      tenant.seo.descriptionAr,
    start_url:        `/${tenant.locales.default}`,
    display:          "standalone",
    background_color: "#f8f3ea",
    theme_color:      "#6f4f2f",
    orientation:      "any",
    lang:             tenant.locales.default,
    dir:              tenant.locales.default === "en" ? "ltr" : "rtl",
    icons: [
      { src: "/favicon.png", sizes: "192x192", type: "image/png" },
      { src: "/favicon.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon.svg", sizes: "any",   type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
