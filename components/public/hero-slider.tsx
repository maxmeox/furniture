"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, MapPin, Truck, Ruler, MessageCircle, ShoppingBag, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { cloudinaryOptimizedUrl, cloudinarySrcSet } from "@/lib/cloudinary-url";
import { WhatsAppInquiryButton } from "@/components/conversion/whatsapp-inquiry-button";
import type { Locale } from "@/i18n/routing";

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  alt: string;
  eyebrow?: string;
  isNew?: boolean;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  locale: string;
  autoPlayMs?: number;
  showroomName?: string;
  deliverySummary?: string;
  whatsappCta?: string;
}

export function HeroSlider({ slides, locale, autoPlayMs = 5000, showroomName, deliverySummary, whatsappCta }: HeroSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: locale === "ar" || locale === "he" ? "rtl" : "ltr",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsAutoPlaying(false); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, []);
  const isRtl = locale === "ar" || locale === "he";
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList()); // eslint-disable-line react-hooks/set-state-in-effect
    const onReInit = () => setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onReInit);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onReInit);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || !isAutoPlaying) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoPlayMs);
    return () => clearInterval(interval);
  }, [emblaApi, isAutoPlaying, autoPlayMs]);

  const trustItems = locale === "ar"
    ? [["تفصيل حسب الطلب", Ruler], ["دون دفع إلكتروني", MessageCircle], ["استفسار واتساب", ShoppingBag]] as const
    : locale === "he"
    ? [["התאמה אישית", Ruler], ["ללא תשלום באתר", MessageCircle], ["פנייה בוואטסאפ", ShoppingBag]] as const
    : [["Custom order", Ruler], ["No online payment", MessageCircle], ["WhatsApp inquiry", ShoppingBag]] as const;

  if (slides.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-panel" role="region" aria-roledescription="carousel" aria-label={locale === "ar" ? "المنتجات المميزة" : locale === "he" ? "מוצרים נבחרים" : "Featured products"}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]" role="group" aria-roledescription="slide" aria-label={locale === "ar" ? `الشريحة ${index + 1}` : locale === "he" ? `שקופית ${index + 1}` : `Slide ${index + 1}`}>
              <div className="theme-hero container-shell grid grid-rows-[60%_1fr] md:grid-rows-none min-h-[calc(100vh-5rem)] sm:min-h-[480px] lg:h-[65vh] items-stretch gap-4 md:gap-12 xl:gap-16 md:grid-cols-[0.92fr_1.08fr] px-4 sm:px-5 md:px-8 pt-1 pb-4 sm:pb-5 md:py-12">
                {/* ---- Text Side — first in DOM, col 1 on desktop ---- */}
                <div className="flex flex-col justify-center" aria-live="polite" aria-atomic="true">
                  {/* Eyebrow badge */}
                  {slide.eyebrow ? (
                    <div className="hero-eyebrow-badge mb-3">
                      <span className="hero-eyebrow-dot" />
                      <span>{slide.eyebrow}</span>
                    </div>
                  ) : null}

                  {/* Title — closer to eyebrow */}
                  <h2 className="max-w-3xl text-balance font-bold leading-tight text-[clamp(1.25rem,2.5vw+0.5rem,3rem)] md:text-[clamp(1.75rem,2vw+0.5rem,3.5rem)]">{slide.title}</h2>

                  {/* Subtitle — medium gap from title */}
                  <p className="mt-3 md:mt-5 max-w-2xl text-pretty text-sm leading-6 md:text-base text-muted-foreground md:leading-8">{slide.subtitle}</p>

                  {/* CTA Buttons — larger gap from subtitle */}
                  <div className="mt-4 md:mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href={slide.ctaHref}
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary-hover"
                    >
                      <span>{slide.ctaLabel}</span>
                      {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    </Link>
                    <WhatsAppInquiryButton
                      locale={locale as Locale}
                      size="lg"
                      variant="secondary"
                      label={whatsappCta}
                      entity={{ type: "campaign", id: slide.id, title: slide.title, href: slide.ctaHref }}
                    />
                  </div>

                  {/* Trust chips row — separated by border-t */}
                  <div className="hero-trust-row mt-4 pt-3 md:mt-6 md:pt-5">
                    {trustItems.map(([label, Icon]) => (
                      <div key={label} className="hero-trust-chip">
                        <Icon className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ---- Image Side — order-[-1] on mobile, col 2 on desktop ---- */}
                <div
                  className={cn(
                    "order-[-1] md:order-none theme-panel relative overflow-hidden rounded-panel shadow-panel ring-1 ring-border self-stretch",
                    isRtl ? "md:translate-x-4" : "md:-translate-x-4"
                  )}
                >
                  <div className="hero-gradient-overlay" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cloudinaryOptimizedUrl(slide.image)}
                    srcSet={index === 0 ? cloudinarySrcSet(slide.image) : undefined}
                    alt={slide.alt}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding={index === 0 ? "sync" : "async"}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute bottom-2 md:bottom-3 inset-x-1 z-10 flex items-center justify-center lg:justify-between px-0.5">
                    {showroomName || deliverySummary ? (
                      <div className="hidden lg:flex items-center gap-2 rounded-full bg-surface/85 px-2.5 py-1 md:px-3 md:py-1.5 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
                        {showroomName ? (<><MapPin className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0 text-secondary" aria-hidden="true" /><span className="text-[10px] md:text-[11px] font-bold whitespace-nowrap">{showroomName}</span></>) : null}
                        {showroomName && deliverySummary ? <span className="h-2.5 w-px md:h-3 bg-border/50 shrink-0" aria-hidden="true" /> : null}
                        {deliverySummary ? (<><Truck className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0 text-secondary" aria-hidden="true" /><span className="text-[9px] md:text-[10px] text-muted-foreground whitespace-nowrap">{deliverySummary}</span></>) : null}
                      </div>
                    ) : null}
                    {slides.length > 1 ? (
                      <div className="flex items-center gap-0.5 rounded-full bg-surface/85 px-1.5 py-1 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
                        <button type="button" onClick={scrollPrev} className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-card/70 hover:text-foreground transition" aria-label={locale === "ar" ? "السابق" : locale === "he" ? "הקודם" : "Previous"}><PrevIcon className="h-3 w-3" /></button>
                        <div className="flex items-center gap-0.5">
                          {scrollSnaps.map((_, dotIndex) => (
                            <button key={dotIndex} type="button" onClick={() => scrollTo(dotIndex)} className={cn("block h-1.5 rounded-full transition-all", dotIndex === selectedIndex ? "w-4 bg-secondary" : "w-1.5 bg-muted-foreground/35 hover:bg-muted-foreground/60")} aria-label={locale === "ar" ? `الشريحة ${dotIndex + 1}` : locale === "he" ? `שקופית ${dotIndex + 1}` : `Slide ${dotIndex + 1}`} />
                          ))}
                        </div>
                        <button type="button" onClick={() => setIsAutoPlaying((prev) => !prev)} className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-card/70 hover:text-foreground transition" aria-label={isAutoPlaying ? (locale === "ar" ? "إيقاف التشغيل التلقائي" : locale === "he" ? "השהה" : "Pause") : (locale === "ar" ? "تشغيل تلقائي" : locale === "he" ? "נגן" : "Play")}>
                          {isAutoPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </button>
                        <button type="button" onClick={scrollNext} className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-card/70 hover:text-foreground transition" aria-label={locale === "ar" ? "التالي" : locale === "he" ? "הבא" : "Next"}><NextIcon className="h-3 w-3" /></button>
                      </div>
                    ) : null}
                  </div>
                </div>

              </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
}
