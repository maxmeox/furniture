"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import type { Locale } from "@/i18n/routing";

const greetings: Record<Locale, string> = {
  ar: "مرحباً، أود الاستفسار عن منتجاتكم",
  en: "Hi, I'd like to inquire about your products",
  he: "היי, אני מעוניין לברר לגבי המוצרים שלכם",
};

const ariaLabels: Record<Locale, string> = {
  ar: "تواصل عبر واتساب",
  en: "Contact via WhatsApp",
  he: "צור קשר בוואטסאפ",
};

export function FloatingWhatsAppButton({ locale, phone }: { locale: Locale; phone: string }) {
  const pathname = usePathname();

  if (pathname.includes("/products/")) return null;
  if (!phone) return null;

  const greeting = encodeURIComponent(greetings[locale] || greetings.en);
  const waLink = `https://wa.me/${phone}?text=${greeting}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 end-6 z-50 grid h-11 w-11 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
      aria-label={ariaLabels[locale] || ariaLabels.en}
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}
