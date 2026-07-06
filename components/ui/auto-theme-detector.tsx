"use client";

import { useEffect } from "react";

interface AutoThemeDetectorProps {
  enabled: boolean;
}

export function AutoThemeDetector({ enabled }: AutoThemeDetectorProps) {
  useEffect(() => {
    if (!enabled) return;

    const root = document.querySelector(".public-theme") as HTMLElement | null;
    if (!root) return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      root.classList.toggle("theme-dark-mode", mql.matches);
    };

    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [enabled]);

  return null;
}
