import { AppShell } from "@/components/public/app-shell";
import { ToastProvider } from "@/components/ui/toast-provider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
