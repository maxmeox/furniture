import { LoginForm } from "@/components/admin/login-form";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ reason?: string; next?: string }> }) {
  const { reason, next } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="w-full max-w-md rounded-2xl bg-card p-8 shadow-[0_24px_70px_rgba(62,44,29,0.16)] ring-1 ring-border">
        <div className="text-2xl font-bold">تسجيل دخول الإدارة</div>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">دخول محمي لإدارة المنتجات، الصور، العملاء، والإعدادات.</p>
        {reason === "session_expired" ? (
          <p className="mt-4 rounded-xl bg-theme-warning px-4 py-3 text-sm font-semibold text-theme-warning-contrast" role="alert">
            انتهت صلاحية جلستك. تم حفظ بيانات النموذج مؤقتاً. سجّل الدخول لاستكمال العمل.
          </p>
        ) : null}
        <LoginForm redirectTo={next} />
      </section>
    </main>
  );
}
