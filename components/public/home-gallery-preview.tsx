"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Maximize } from "lucide-react";
import { Lightbox, type LightboxImage } from "@/components/ui/lightbox";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

type GalleryPreviewImage = LightboxImage & { tall?: boolean };

export function HomeGalleryPreview({
  images,
}: {
  images: GalleryPreviewImage[];
}) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="group cursor-pointer text-start w-full"
          >
            <figure className="theme-card overflow-hidden rounded-[2rem] bg-card shadow-sm ring-1 ring-border transition-shadow group-hover:shadow-md">
              <div className={img.tall ? "relative aspect-[4/5]" : "relative aspect-[4/3]"}>
                <Image
                  src={cloudinaryOptimizedUrl(img.src)}
                  alt={img.alt}
                  fill
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/10">
                  <div className="rounded-full bg-card/80 p-3 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 backdrop-blur-sm">
                    <Maximize className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
              </div>
              <figcaption className="p-5">
                <div className="font-bold">{img.title}</div>
                {img.caption ? (
                  <div className="mt-1 text-sm text-muted-foreground">{img.caption}</div>
                ) : null}
              </figcaption>
            </figure>
          </button>
        ))}
      </div>

      {typeof document !== "undefined" && lightboxIndex >= 0
        ? createPortal(
            <Lightbox
              key={lightboxIndex}
              images={images}
              initialIndex={lightboxIndex}
              isOpen={lightboxIndex >= 0}
              onClose={() => setLightboxIndex(-1)}
            />,
            document.body
          )
        : null}
    </>
  );
}
