import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="admin-grid min-h-screen">
      <aside className="admin-sidebar hidden lg:block" />
      <div className="min-w-0 max-w-full p-6">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="mx-auto max-w-md space-y-6 text-center">
            <div className="text-8xl font-black text-muted-foreground/20">404</div>
            <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
            <p className="text-sm leading-7 text-muted-foreground">
              الصفحة التي تبحث عنها غير موجودة في لوحة التحكم.
            </p>
            <Link
              href="/admin"
              className="inline-flex h-11 items-center rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
