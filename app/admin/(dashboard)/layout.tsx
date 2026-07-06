import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { AdminFormDataPreserver, AdminSessionGuard } from "@/components/admin/form-data-restore";
import { AdminLeadPoller } from "@/components/admin/admin-lead-poller";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <AdminShell>
      <Suspense fallback={null}>
        <AdminFormDataPreserver />
        <AdminSessionGuard />
        <AdminLeadPoller />
      </Suspense>
      {children}
    </AdminShell>
  );
}
