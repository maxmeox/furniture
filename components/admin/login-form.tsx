"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { loginAdmin } from "@/app/admin/actions";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState(loginAdmin.bind(null, redirectTo), null);

  return (
    <form action={action} className="mt-8 space-y-4">
      <input
        className="h-12 w-full rounded-xl border border-border bg-white px-4 outline-none focus:ring-2 focus:ring-ring"
        name="email"
        placeholder="البريد الإلكتروني"
        type="email"
        autoComplete="email"
        required
        data-testid="admin-login-email"
      />
      <input
        className="h-12 w-full rounded-xl border border-border bg-white px-4 outline-none focus:ring-2 focus:ring-ring"
        name="password"
        placeholder="كلمة المرور"
        type="password"
        autoComplete="current-password"
        required
        data-testid="admin-login-password"
      />
      {state?.error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{state.error}</p> : null}
      <Button className="w-full" type="submit" disabled={pending}>{pending ? "جار الدخول..." : "دخول"}</Button>
    </form>
  );
}
