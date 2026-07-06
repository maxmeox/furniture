"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { changeAdminPassword, type ChangePasswordState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "./admin-controls";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ChangePasswordState | null, FormData>(changeAdminPassword, null);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  function validateConfirmPassword() {
    const formData = new FormData(formRef.current as HTMLFormElement);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmError("كلمة المرور غير متطابقة");
    } else {
      setConfirmError("");
    }
  }

  return (
    <form ref={formRef} action={action} className="grid gap-4" onChange={validateConfirmPassword}>
      <div className="grid gap-4 lg:grid-cols-3">
        <Field label="كلمة المرور الحالية">
          <TextInput name="currentPassword" type="password" autoComplete="current-password" required />
        </Field>
        <Field label="كلمة المرور الجديدة">
          <TextInput name="newPassword" type="password" autoComplete="new-password" minLength={12} required />
        </Field>
        <Field label="تأكيد كلمة المرور الجديدة">
          <TextInput name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required />
          {confirmError && <p className="mt-1 text-sm text-red-600" role="alert">{confirmError}</p>}
        </Field>
      </div>
      <p className="text-xs leading-6 text-muted-foreground">
        استخدم 12 حرفًا على الأقل مع حرف كبير، حرف صغير، رقم، ورمز. لا تستخدم كلمة المرور الافتراضية أو كلمات سهلة التخمين.
      </p>
      {state?.error ? <p className="rounded-xl bg-theme-error px-4 py-3 text-sm font-semibold text-theme-error-contrast" role="alert">{state.error}</p> : null}
      {state?.success ? <p className="rounded-xl bg-theme-success px-4 py-3 text-sm font-semibold text-theme-success-contrast">{state.success}</p> : null}
      <Button type="submit" className="w-full md:w-auto" disabled={pending}>
        {pending ? "جار تغيير كلمة المرور..." : "تغيير كلمة المرور"}
      </Button>
    </form>
  );
}
