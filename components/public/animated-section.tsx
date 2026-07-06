"use client";

import { Children, isValidElement, useEffect, useRef, useState } from "react";

function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches); // eslint-disable-line react-hooks/set-state-in-effect
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return prefersReduced;
}

function useIntersection(ref: React.RefObject<HTMLElement | null>, options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(el);
      }
    }, { threshold: 0.1, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options]);
  return isVisible;
}

export function AnimatedSection({
  children,
  className,
  stagger = false,
  staggerDelay = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
  staggerDelay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersection(sectionRef, { rootMargin: "-80px" });

  const visibilityClass = shouldReduceMotion ? "" : isVisible ? "is-visible" : "";

  return (
    <section
      ref={sectionRef}
      className={`content-visibility-auto scroll-reveal ${visibilityClass} ${className ?? ""}`}
    >
      {stagger && !shouldReduceMotion
        ? Children.map(children, (child, index) => {
            if (!isValidElement(child)) return child;
            return (
              <div
                className={`scroll-reveal-stagger ${isVisible ? "is-visible" : ""}`}
                style={{ transitionDelay: `${index * staggerDelay}s` }}
              >
                {child}
              </div>
            );
          })
        : children}
    </section>
  );
}
