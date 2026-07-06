"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

export interface LightboxImage {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, isOpen, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    if (images.length <= 1) return;
    setIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    if (images.length <= 1) return;
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowLeft") { goPrev(); return; }
      if (e.key === "ArrowRight") { goNext(); return; }
      if (e.key === "Tab" && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];
        if (!firstEl || !lastEl) return;
        if (e.shiftKey) {
          if (document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        } else {
          if (document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    const frame = window.requestAnimationFrame(() => containerRef.current?.querySelector<HTMLElement>('button')?.focus());

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(frame);
    };
  }, [isOpen, onClose, goPrev, goNext]);

  const t = useTranslations("lightbox");

  if (!isOpen || images.length === 0) return null;
  const currentImage = images[index];
  if (!currentImage) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] flex flex-col bg-foreground/96 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={currentImage.alt}
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-4">
        <div className="text-sm font-medium text-white/70">
          {index + 1} / {images.length}
        </div>
        <div className="flex gap-1">
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label={t("previous")}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label={t("next")}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className="flex flex-1 items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-full w-full max-w-5xl">
          <div className="relative mx-auto" style={{ aspectRatio: "4/3", maxHeight: "70vh" }}>
            <Image
              src={cloudinaryOptimizedUrl(currentImage.src)}
              alt={currentImage.alt}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 80vw"
              priority
            />
          </div>
          {currentImage.title || currentImage.caption ? (
            <div className="mt-4 text-center">
              {currentImage.title ? (
                <div className="text-lg font-bold text-white">{currentImage.title}</div>
              ) : null}
              {currentImage.caption ? (
                <div className="mt-1 text-sm text-white/60">{currentImage.caption}</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {images.length > 1 ? (
        <div className="flex justify-center gap-1.5 p-4">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/50"
              )}
              aria-label={`${t("image")} ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
