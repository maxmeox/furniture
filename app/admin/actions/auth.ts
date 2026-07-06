"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { weakPasswords } from "./utils";

export type ChangePasswordState = {
  success?: string;
  error?: string;
};

function passwordValidationError(password: string) {
  if (password.length < 12) return "كلمة المرور الجديدة يجب أن تكون 12 حرفًا على الأقل.";
  if (!/[a-z]/.test(password)) return "كلمة المرور الجديدة يجب أن تحتوي على حرف صغير واحد على الأقل.";
  if (!/[A-Z]/.test(password)) return "كلمة المرور الجديدة يجب أن تحتوي على حرف كبير واحد على الأقل.";
  if (!/\d/.test(password)) return "كلمة المرور الجديدة يجب أن تحتوي على رقم واحد على الأقل.";
  if (!/[^A-Za-z0-9]/.test(password)) return "كلمة المرور الجديدة يجب أن تحتوي على رمز واحد على الأقل.";
  if (weakPasswords.has(password.toLowerCase())) return "كلمة المرور الجديدة ضعيفة جدًا. اختر كلمة مرور أقوى.";
  return null;
}

export async function loginAdmin(redirectTo: string | undefined, _: unknown, formData: FormData) {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  if (!parsed.success) return { error: "أدخل البريد الإلكتروني وكلمة المرور." };

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headersList.get("x-real-ip")?.trim();
  const ip = forwardedFor || realIp || "unknown";
  const rateLimit = await checkRateLimit({
    namespace: "admin-login",
    key: ip,
    limit: 5,
    windowMs: 60000
  });
  if (!rateLimit.allowed) return { error: "محاولات تسجيل دخول كثيرة. حاول مرة أخرى بعد دقيقة." };

  const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (!admin || !admin.isActive || !(await bcrypt.compare(parsed.data.password, admin.passwordHash))) {
    return { error: "بيانات الدخول غير صحيحة." };
  }

  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionToken({ id: admin.id, email: admin.email }), {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8
  });
  redirect(redirectTo || "/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

export async function changeAdminPassword(_: ChangePasswordState | null, formData: FormData): Promise<ChangePasswordState> {
  const session = await requireAdmin();
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof currentPassword !== "string" || !currentPassword) return { error: "أدخل كلمة المرور الحالية." };
  if (typeof newPassword !== "string" || !newPassword) return { error: "أدخل كلمة المرور الجديدة." };
  if (typeof confirmPassword !== "string" || !confirmPassword) return { error: "أدخل تأكيد كلمة المرور الجديدة." };
  if (newPassword !== confirmPassword) return { error: "كلمة المرور الجديدة وتأكيدها غير متطابقين." };

  const validationError = passwordValidationError(newPassword);
  if (validationError) return { error: validationError };

  const admin = await prisma.adminUser.findFirst({
    where: { id: session.id, email: session.email, isActive: true },
    select: { id: true, passwordHash: true }
  });
  if (!admin) return { error: "انتهت الجلسة أو الحساب غير نشط. سجل الدخول مرة أخرى." };

  const currentMatches = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!currentMatches) return { error: "كلمة المرور الحالية غير صحيحة." };

  const sameAsCurrent = await bcrypt.compare(newPassword, admin.passwordHash);
  if (sameAsCurrent) return { error: "كلمة المرور الجديدة يجب أن تختلف عن الحالية." };

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) }
  });

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);

  return { success: "تم تغيير كلمة المرور بنجاح. سجل الدخول بكلمة المرور الجديدة." };
}
