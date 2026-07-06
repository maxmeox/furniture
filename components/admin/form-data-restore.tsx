"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { tenant } from "@/lib/tenant";

const FORM_STORAGE_KEY = tenant.admin.formBackupKey;
const SESSION_WARN_MS = 7 * 60 * 60 * 1000;
const SESSION_CHECK_INTERVAL_MS = 5 * 60 * 1000;

function parseSessionExpiry(): number | null {
  try {
    const match = document.cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
    if (!match) return null;
    const parts = match[1]!.split(".");
    if (!parts[0]) return null;
    const body = JSON.parse(atob(parts[0]));
    return (body.exp as number) * 1000;
  } catch {
    return null;
  }
}

export function usePreserveAdminForm() {
  const searchParams = useSearchParams();
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    const hasError = searchParams.has("error");
    if (!hasError) {
      sessionStorage.removeItem(FORM_STORAGE_KEY);
      return;
    }
    try {
      const raw = sessionStorage.getItem(FORM_STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Record<string, string>;
      restored.current = true;
      requestAnimationFrame(() => {
        for (const [name, value] of Object.entries(data)) {
          const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
            `form [name="${CSS.escape(name)}"]`
          );
          if (el) {
            if (el instanceof HTMLSelectElement && el.multiple) {
              const values = value.split(",");
              for (const opt of el.options) opt.selected = values.includes(opt.value);
            } else {
              el.value = value;
            }
          }
        }
        sessionStorage.removeItem(FORM_STORAGE_KEY);
      });
    } catch {
      sessionStorage.removeItem(FORM_STORAGE_KEY);
    }
  }, [searchParams]);
}

export function AdminFormDataPreserver() {
  usePreserveAdminForm();
  return null;
}

export function setupFormPreservation(formEl: HTMLFormElement) {
  const saveData = () => {
    const data: Record<string, string> = {};
    const formData = new FormData(formEl);
    for (const [key, value] of formData) {
      if (typeof value === "string" && value) data[key] = value;
    }
    try {
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };
  formEl.addEventListener("submit", saveData);
  return () => formEl.removeEventListener("submit", saveData);
}

export function AdminSessionGuard() {
  const [warning, setWarning] = useState<string | null>(null);
  const formSaved = useRef(false);

  const saveAllForms = useCallback(() => {
    if (formSaved.current) return;
    formSaved.current = true;
    const allForms = document.querySelectorAll("form");
    allForms.forEach((form) => {
      const data: Record<string, string> = {};
      new FormData(form).forEach((value, key) => {
        if (typeof value === "string" && value) data[key] = value;
      });
      try {
        sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
      } catch {}
    });
  }, []);

  useEffect(() => {
    const expiry = parseSessionExpiry();
    if (!expiry) return;

    const check = () => {
      const now = Date.now();
      const remaining = expiry - now;

      if (remaining <= 0) {
        saveAllForms();
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/admin/login?reason=session_expired&next=${encodeURIComponent(currentPath)}`;
        return;
      }

      if (remaining < SESSION_WARN_MS) {
        const hoursLeft = Math.floor(remaining / 3600000);
        const minsLeft = Math.floor((remaining % 3600000) / 60000);
        setWarning(`ستنتهي صلاحية الجلسة خلال ${hoursLeft} ساعة و ${minsLeft} دقيقة. احفظ عملك قبل انتهاء الجلسة.`);
      } else {
        setWarning(null);
      }
    };

    check();
    const interval = setInterval(check, SESSION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [saveAllForms]);

  if (!warning) return null;

  return (
    <div className="fixed bottom-4 start-4 z-50 max-w-sm rounded-2xl bg-theme-warning p-4 text-sm font-bold text-theme-warning-contrast shadow-lg ring-1 ring-border">
      <p>{warning}</p>
    </div>
  );
}
