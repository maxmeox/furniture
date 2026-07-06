"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Lightbox, type LightboxImage } from "./lightbox";

interface LightboxContextValue {
  open: (images: LightboxImage[], initialIndex?: number) => void;
  close: () => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((imgs: LightboxImage[], idx = 0) => {
    setImages(imgs);
    setInitialIndex(idx);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <LightboxContext.Provider value={{ open, close }}>
      {children}
      <Lightbox key={`${isOpen}-${initialIndex}-${images.length}`} images={images} initialIndex={initialIndex} isOpen={isOpen} onClose={close} />
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error("useLightbox must be used within a LightboxProvider");
  }
  return context;
}
