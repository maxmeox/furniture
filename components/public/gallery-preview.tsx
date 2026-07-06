"use client";

import { useTranslations } from "next-intl";
import { ImageCard } from "./image-card";
import type { Locale } from "@/i18n/routing";

const images = [
  "/images/sofa-wood-main.svg",
  "/images/gallery-majlis.svg",
  "/images/gallery-dining.svg"
];

export function GalleryPreview({ locale: _locale }: { locale: Locale }) {
  const t = useTranslations("galleryPreview");

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {images.map((src, index) => (
        <ImageCard key={src} src={src} alt={t(`alt${index + 1}`)} />
      ))}
    </div>
  );
}
