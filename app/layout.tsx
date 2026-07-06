import type { Viewport } from "next";
import { Noto_Kufi_Arabic, Noto_Sans_Arabic, Noto_Sans_Hebrew } from "next/font/google";
import { GoogleAnalyticsScript } from "@/components/ui/google-analytics";
import "./globals.css";

const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-kufi",
  fallback: ["Noto Sans Arabic", "Arial", "sans-serif"],
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400"], // Fallback font — 400 only; Kufi handles bold/headings
  display: "swap",
  variable: "--font-sans-arabic",
  fallback: ["Arial", "sans-serif"],
});

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  weight: ["400"], // Fallback font — 400 only; Kufi handles bold/headings
  display: "swap",
  variable: "--font-sans-hebrew",
  fallback: ["Arial", "sans-serif"],
});

export const viewport: Viewport = {
  themeColor: "#6f4f2f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${notoKufi.variable} ${notoSansArabic.variable} ${notoSansHebrew.variable}`}>
      <body>
        {/* DNS preconnects for critical third-party origins.
            Note: fonts.googleapis.com and fonts.gstatic.com are NOT needed —
            next/font/google self-hosts font files at build time. */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {children}

        {/* Google Analytics 4 — injected post-hydration via client component (zero SSR mismatch risk) */}
        {gaId ? <GoogleAnalyticsScript gaId={gaId} /> : null}
      </body>
    </html>
  );
}
