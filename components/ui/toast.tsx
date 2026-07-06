"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

const variantStyles: Record<ToastVariant, string> = {
  success: "toast-success",
  error: "toast-error",
  warning: "toast-warning",
  info: "toast-info",
};

const variantIcons: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

export function Toast({
  toast,
  onDismiss,
  dismissAriaLabel = "Dismiss",
}: {
  toast: ToastData;
  onDismiss: (id: string) => void;
  dismissAriaLabel?: string;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    timerRef.current = setTimeout(() => onDismiss(toast.id), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <li
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-sm transition-all",
        variantStyles[toast.variant]
      )}
    >
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/10 text-sm font-bold">
        {variantIcons[toast.variant]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight">{toast.title}</p>
        {toast.description ? (
          <p className="mt-1 text-xs leading-relaxed opacity-80">
            {toast.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="-me-1 -mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full opacity-60 transition hover:opacity-100"
        aria-label={dismissAriaLabel}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
