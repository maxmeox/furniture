"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminPageHeader({ title, description, actionHref, actionLabel }: { title: string; description?: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="flex min-w-0 max-w-full flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{description}</p> : null}
      </div>
      {actionHref && actionLabel ? (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function AdminCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border sm:p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass = "h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
export const textareaClass = "min-h-24 w-full rounded-xl border border-border bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={textareaClass} {...props} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClass} {...props} />;
}

export function CheckboxField({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-3 text-sm font-semibold">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 accent-primary" />
      {label}
    </label>
  );
}

export function DeleteButton({ action, id, label = "حذف", confirmMessage = "هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء." }: { action: (formData: FormData) => void | Promise<void>; id: string; label?: string; confirmMessage?: string }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50">{label}</Button>
    </form>
  );
}

export function EmptyAdminState({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm font-semibold text-muted-foreground">{label}</div>;
}
