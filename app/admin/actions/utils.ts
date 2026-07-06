import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ImageType, LeadStatus, PriceLabel, Prisma, PublishStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";

export const optional = z.string().trim().optional().transform((value) => value || null);
export const required = z.string().trim().min(1);
export const publishStatus = z.nativeEnum(PublishStatus);
export const priceLabel = z.nativeEnum(PriceLabel);
export const imageType = z.nativeEnum(ImageType);
export const leadStatus = z.nativeEnum(LeadStatus);

export const weakPasswords = new Set([
  "password123!",
  "password1234!",
  "adminadmin123!",
  "change-me-in-production",
  "qwerty123456!",
  "1234567890aa!",
  "furniture123!"
]);

export function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

export function commaSeparated(formData: FormData, key: string): Prisma.InputJsonValue | undefined {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return undefined;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function dateValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value ? new Date(value) : null;
}

export function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function revalidatePublicContent(...tags: string[]) {
  for (const tag of tags) revalidateTag(tag, "default");
}

export const safeText = (max = 240) => z.string().trim().max(max).transform((value) => value.replace(/[<>]/g, ""));
export const requiredSafeText = (max = 240) => z.string().trim().min(1).max(max).transform((value) => value.replace(/[<>]/g, ""));
export const urlOrEmpty = z.string().trim().max(500).refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}, "رابط غير صحيح");
export const imagePathOrUrl = z.string().trim().max(500).refine((value) => {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("<") && !value.includes(">")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}, "مسار الصورة أو الرابط غير صحيح");

export const profileLabels = {
  labelAr: "ملف المعرض",
  labelEn: "Showroom profile",
  labelHe: "פרופיל אולם"
};

export function listFromText(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim().replace(/[<>]/g, ""))
    .filter(Boolean)
    .slice(0, 12);
}

export const ADMIN_VALIDATION_ERROR = "الرجاء مراجعة البيانات المدخلة";
export const ADMIN_DB_ERROR = "حدث خطأ في قاعدة البيانات، حاول مرة أخرى";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodSchema<T> = z.ZodType<T, any, any>;

export async function parseAdminForm<T>(
  schema: AnyZodSchema<T>,
  formData: FormData,
  redirectPath: string
): Promise<T> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${redirectPath}?error=${encodeURIComponent(ADMIN_VALIDATION_ERROR)}`);
  return parsed.data;
}

export function parseAdminId(formData: FormData, redirectPath: string): string {
  const parsed = required.safeParse(formData.get("id"));
  if (!parsed.success) redirect(`${redirectPath}?error=${encodeURIComponent("معرف غير صالح")}`);
  return parsed.data;
}

export function handleAdminError(e: unknown, logLabel: string, redirectPath: string): never {
  console.error(`[${logLabel}]`, e);
  redirect(`${redirectPath}?error=${encodeURIComponent(ADMIN_DB_ERROR)}`);
}
