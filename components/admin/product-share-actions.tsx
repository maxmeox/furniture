"use client";

import { MessageSquareText } from "lucide-react";
import { useState } from "react";
import { ShareQrActions } from "@/components/admin/share-qr-actions";
import { Button } from "@/components/ui/button";

export function ProductShareActions({ url, label, productName, code }: { url: string; label: string; productName: string; code?: string | null }) {
  const [message, setMessage] = useState("");
  const productMessage = `شاهد هذا التصميم من معرض المفروشات: ${productName}${code ? ` - الكود: ${code}` : ""} - الرابط: ${url}`;

  async function copyProductMessage() {
    await navigator.clipboard.writeText(productMessage);
    setMessage("تم نسخ رسالة المنتج");
    window.setTimeout(() => setMessage(""), 2200);
  }

  return (
    <div className="grid justify-items-end gap-2">
      <ShareQrActions url={url} label={label} locale="ar" />
      <Button type="button" variant="secondary" size="sm" onClick={copyProductMessage}>
        <MessageSquareText className="h-4 w-4" />
        نسخ رسالة المنتج
      </Button>
      {message ? <span role="status" className="text-xs font-bold text-green-700">{message}</span> : null}
    </div>
  );
}
