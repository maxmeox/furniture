export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="ar" dir="rtl" className="min-h-screen bg-[#f5efe6]">
      {children}
    </div>
  );
}
