"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  locale: string;
  className?: string;
}

export function ShareButton({ title, text, url, locale, className }: ShareButtonProps) {
  const [shared, setShared] = useState(false);

  const share = async () => {
    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    const shareData: ShareData = { title, text: text ?? title, url: shareUrl };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // user cancelled
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className={className}
      aria-label={
        shared
          ? locale === "ar" ? "تم النسخ" : locale === "he" ? "הועתק" : "Link copied"
          : locale === "ar" ? "مشاركة" : locale === "he" ? "שתף" : "Share"
      }
    >
      <Share2 className="h-4 w-4" />
      <span>
        {shared
          ? locale === "ar"
            ? "تم النسخ"
            : locale === "he"
              ? "הועתק"
              : "Copied"
          : locale === "ar"
            ? "مشاركة"
            : locale === "he"
              ? "שתף"
              : "Share"}
      </span>
    </button>
  );
}
