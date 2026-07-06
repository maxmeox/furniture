"use client";

export default function RootNotFound() {
  const lang = typeof navigator !== "undefined" ? navigator.language.split("-")[0] : "ar";
  const rtl = lang === "ar" || lang === "he";
  const code = lang === "en" ? "en" : lang === "he" ? "he" : "ar";
  return (
    <html lang={code} dir={rtl ? "rtl" : "ltr"}>
      <body className="m-0 bg-[#f8f3ea] font-sans text-[#2f261f]">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="mx-auto max-w-md space-y-6 text-center">
            <div className="text-7xl font-bold text-[#746455]/30">404</div>
            <h1 className="text-2xl font-bold">
              {code === "ar" ? "الصفحة غير موجودة" : code === "he" ? "הדף לא נמצא" : "Page not found"}
            </h1>
            <p className="text-sm leading-7 text-[#746455]">
              {code === "ar" ? "الصفحة التي تبحث عنها غير موجودة." : code === "he" ? "הדף שאתה מחפש לא קיים." : "The page you are looking for does not exist."}
            </p>
            <a
              href={`/${code}`}
              className="inline-flex h-11 items-center rounded-2xl bg-[#6f4f2f] px-6 text-sm font-bold text-[#fffaf2] transition hover:opacity-90"
            >
              {code === "ar" ? "العودة للرئيسية" : code === "he" ? "חזרה לדף הבית" : "Back to home"}
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
