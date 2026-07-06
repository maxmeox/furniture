"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

export type LightboxImage = {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
};

export function Lightbox({
  images,
  activeIndex,
  onClose,
  onSelect
}: {
  images: LightboxImage[];
  activeIndex: number;
  onClose: () => void;
  onSelect: (index: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const hasSwipedRef = useRef(false);
  const t = useTranslations("lightbox");

  useEffect(() => {
    if (activeIndex < 0) return;

    closeButtonRef.current?.focus();
    hasSwipedRef.current = false;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        onSelect((activeIndex - 1 + images.length) % images.length);
        return;
      }
      if (event.key === "ArrowRight") {
        onSelect((activeIndex + 1) % images.length);
        return;
      }

      if (event.key === "Tab" && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];
        if (!firstEl || !lastEl) return;

        if (event.shiftKey) {
          if (document.activeElement === firstEl) {
            event.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            event.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, images.length, onClose, onSelect]);

  if (activeIndex < 0) return null;
  const currentImage = images[activeIndex];
  if (!currentImage) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={currentImage.title || t("ariaLabel")}
      className="fixed inset-0 z-[60] bg-[#17110d]/94 text-white"
      onTouchStart={(event) => {
        const touch = event.touches[0];
        if (!touch) return;
        setTouchStart(touch.clientX);
        hasSwipedRef.current = false;
      }}
      onTouchEnd={(event) => {
        if (touchStart === null) return;
        const touch = event.changedTouches[0];
        if (!touch) return;
        const delta = touch.clientX - touchStart;
        if (Math.abs(delta) > 50) {
          hasSwipedRef.current = true;
          if (delta > 0) {
            onSelect((activeIndex - 1 + images.length) % images.length);
          } else {
            onSelect((activeIndex + 1) % images.length);
          }
        }
        setTouchStart(null);
      }}
      onClick={() => {
        if (!hasSwipedRef.current) {
          onClose();
        }
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        aria-label={t("close")}
        onClick={(event) => { event.stopPropagation(); onClose(); }}
        className="absolute top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 backdrop-blur ltr:right-4 rtl:left-4"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label={t("previous")}
        onClick={(event) => { event.stopPropagation(); onSelect((activeIndex - 1 + images.length) % images.length); }}
        className="absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 backdrop-blur ltr:left-3 rtl:right-3 sm:ltr:left-5 sm:rtl:right-5"
      >
        <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
      </button>
      <button
        type="button"
        aria-label={t("next")}
        onClick={(event) => { event.stopPropagation(); onSelect((activeIndex + 1) % images.length); }}
        className="absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 backdrop-blur ltr:right-3 rtl:left-3 sm:ltr:right-5 sm:rtl:left-5"
      >
        <ChevronRight className="h-6 w-6 rtl:rotate-180" />
      </button>
      <div className="relative h-full w-full" onClick={(event) => event.stopPropagation()}>
        <Image src={cloudinaryOptimizedUrl(currentImage.src)} alt={currentImage.alt} fill className="object-contain p-4 md:p-12" sizes="100vw" priority />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 md:p-8">
        {currentImage.title ? <div className="text-lg font-bold">{currentImage.title}</div> : null}
        {currentImage.caption ? <div className="mt-1 text-sm text-white/75">{currentImage.caption}</div> : null}
        <div className="mt-3 text-xs font-bold text-white/60">
          {activeIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
