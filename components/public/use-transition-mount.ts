"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "hidden" | "entering" | "visible" | "exiting";

export function useTransitionMount(
  open: boolean,
  exitDuration: number = 250
) {
  const [phase, setPhase] = useState<Phase>(open ? "visible" : "hidden");
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open === prevOpen.current) return;
    prevOpen.current = open;

    if (open) {
      setPhase("entering"); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      setPhase("exiting");
    }
  }, [open]);

  useEffect(() => {
    if (phase === "entering") {
      const id = requestAnimationFrame(() => {
        setPhase((prev) => (prev === "entering" ? "visible" : prev));
      });
      return () => cancelAnimationFrame(id);
    }
    if (phase === "exiting") {
      const timer = setTimeout(() => setPhase("hidden"), exitDuration);
      return () => clearTimeout(timer);
    }
  }, [phase, exitDuration]);

  return {
    mounted: phase !== "hidden",
    phase,
    isEntering: phase === "entering",
    isVisible: phase === "visible",
    isExiting: phase === "exiting",
  };
}
