"use client";

import { Download, Link2, QrCode, X } from "lucide-react";
import QRCode from "qrcode";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";

const copy = {
  ar: {
    copy: "نسخ الرابط",
    copied: "تم نسخ الرابط",
    qr: "QR",
    qrTitle: "رمز QR",
    download: "تحميل QR",
    close: "إغلاق",
    failed: "تعذر إنشاء الرمز"
  },
  en: {
    copy: "Copy link",
    copied: "Link copied",
    qr: "QR",
    qrTitle: "QR code",
    download: "Download QR",
    close: "Close",
    failed: "Could not create QR code"
  },
  he: {
    copy: "העתק קישור",
    copied: "הקישור הועתק",
    qr: "QR",
    qrTitle: "קוד QR",
    download: "הורד QR",
    close: "סגור",
    failed: "לא ניתן ליצור קוד QR"
  }
} satisfies Record<Locale, Record<string, string>>;

export function ShareQrActions({ url, label, locale = "ar" }: { url: string; label: string; locale?: Locale }) {
  const [message, setMessage] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const c = copy[locale];

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setMessage(c.copied);
    window.setTimeout(() => setMessage(""), 2400);
  }

  async function openQr() {
    setIsOpen(true);
    if (qrDataUrl) return;
    setIsLoading(true);
    try {
      const nextUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 320,
        color: {
          dark: "#2f241c",
          light: "#fffaf2"
        }
      });
      setQrDataUrl(nextUrl);
    } catch {
      setMessage(c.failed);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={copyLink}>
        <Link2 className="h-4 w-4" />
        {c.copy}
      </Button>
      <Button type="button" variant="secondary" size="sm" onClick={openQr}>
        <QrCode className="h-4 w-4" />
        {c.qr}
      </Button>
      {message ? <span role="status" className="text-xs font-bold text-green-700">{message}</span> : null}
      {isOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label={`${c.qrTitle}: ${label}`}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-2xl ring-1 ring-border">
            <div className="mb-4 flex items-center justify-between gap-3 text-right">
              <div>
                <div className="font-bold">{c.qrTitle}</div>
                <div className="mt-1 break-all text-xs text-muted-foreground">{url}</div>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-muted" aria-label={c.close}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid min-h-64 place-items-center rounded-2xl bg-[#fffaf2] p-4 ring-1 ring-border">
              {isLoading ? <div className="text-sm text-muted-foreground">...</div> : null}
              {/* eslint-disable-next-line @next/next/no-img-element -- QR is generated as a local data URL for download. */}
              {qrDataUrl ? <img src={qrDataUrl} alt={`${c.qrTitle}: ${label}`} className="h-64 w-64" /> : null}
            </div>
            {qrDataUrl ? (
              <a href={qrDataUrl} download={`${label.replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}-qr.png`} className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">
                <Download className="h-4 w-4" />
                {c.download}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
