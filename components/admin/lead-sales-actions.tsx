"use client";

import { MessageCircle, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const quickReplies = [
  "السعر حسب المقاس والقماش، أرسل لنا المقاس التقريبي ونساعدك بالتفاصيل.",
  "أرسل لنا منطقة التوصيل حتى نرتب لك التفاصيل بشكل أدق.",
  "يمكن التفصيل حسب الطلب من ناحية المقاس، القماش، اللون، وبعض التفاصيل.",
  "هذه بعض خيارات الأقمشة المتاحة، ويمكننا اقتراح ألوان مناسبة للتصميم.",
  "هل ما زلت مهتمًا بالتصميم؟ يمكننا مساعدتك بالمقاس والقماش والتوصيل."
];

function cleanPhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function LeadSalesActions({ phone, customerName, productTitle }: { phone?: string | null; customerName?: string | null; productTitle?: string | null }) {
  const [message, setMessage] = useState("");
  const normalizedPhone = phone ? cleanPhone(phone) : "";
  const followUpText = `مرحبًا${customerName ? ` ${customerName}` : ""}، معك معرض المفروشات. نتابع معك بخصوص ${productTitle ?? "التصميم الذي أعجبك"}. هل ترغب أن نساعدك بالمقاس أو القماش أو التوصيل؟`;
  const whatsappUrl = normalizedPhone ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(followUpText)}` : "";

  async function copyReply(text: string) {
    await navigator.clipboard.writeText(text);
    setMessage("تم نسخ الرد");
    window.setTimeout(() => setMessage(""), 2200);
  }

  return (
    <div className="rounded-2xl bg-muted/35 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {normalizedPhone ? (
          <Button asChild type="button" size="sm" variant="secondary">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" />
              فتح واتساب
            </a>
          </Button>
        ) : (
          <Button type="button" size="sm" variant="secondary" disabled>
            <MessageCircle className="h-4 w-4" />
            لا يوجد هاتف
          </Button>
        )}
        {message ? <span role="status" className="text-xs font-bold text-green-700">{message}</span> : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {quickReplies.map((reply) => (
          <button
            type="button"
            key={reply}
            onClick={() => copyReply(reply)}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-muted-foreground ring-1 ring-border transition hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" />
            {reply.slice(0, 28)}...
          </button>
        ))}
      </div>
    </div>
  );
}
