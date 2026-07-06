"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Toast, type ToastData, type ToastVariant } from "./toast";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children, notificationsLabel = "Notifications", dismissAriaLabel = "Dismiss" }: { children: ReactNode; notificationsLabel?: string; dismissAriaLabel?: string }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const map = timersRef.current;
    return () => {
      for (const timer of map.values()) {
        clearTimeout(timer);
      }
      map.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }

    const toastEl = document.querySelector(`[data-toast-id="${id}"]`);
    if (toastEl) {
      toastEl.setAttribute("data-exiting", "true");
      const removeTimer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        timersRef.current.delete(id);
      }, 250);
      timersRef.current.set(`remove-${id}`, removeTimer);
    } else {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  const add = useCallback(
    (options: ToastOptions) => {
      const id = String(nextId++);
      const toast: ToastData = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? "info",
        duration: options.duration,
      };

      setToasts((prev) => {
        if (prev.length >= 3) {
          const overflowItem = prev[prev.length - 1];
          if (!overflowItem) return [toast, ...prev];
          const overflowId = overflowItem.id;
          setTimeout(() => dismiss(overflowId), 0);
          return [toast, ...prev.slice(0, -1)];
        }
        return [toast, ...prev];
      });

      if (toast.duration !== undefined && toast.duration > 0) {
        const timer = setTimeout(() => dismiss(id), toast.duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (title: string, description?: string) => add({ title, description, variant: "success" }),
    [add]
  );

  const error = useCallback(
    (title: string, description?: string) => add({ title, description, variant: "error" }),
    [add]
  );

  const warning = useCallback(
    (title: string, description?: string) => add({ title, description, variant: "warning" }),
    [add]
  );

  const info = useCallback(
    (title: string, description?: string) => add({ title, description, variant: "info" }),
    [add]
  );

  return (
    <ToastContext.Provider value={{ toast: add, success, error, warning, info }}>
      {children}
      <ol
        className="fixed inset-x-0 top-4 z-[100] mx-auto flex w-full max-w-sm flex-col-reverse items-center gap-2 px-4 pointer-events-none"
        aria-label={notificationsLabel}
      >
        {toasts.map((t) => (
          <div key={t.id} data-toast-id={t.id}>
            <Toast toast={t} onDismiss={dismiss} dismissAriaLabel={dismissAriaLabel} />
          </div>
        ))}
      </ol>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
