import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-grid min-h-screen">
      <AdminSidebar />
      <div className="min-w-0 max-w-full">
        <AdminTopbar />
        <main id="admin-main" className="min-w-0 max-w-full overflow-x-hidden p-3 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
