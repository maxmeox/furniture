"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { locales } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePublicContent, required } from "./utils";
import { getStoredShowroomProfile, persistShowroomProfile, settingsError } from "./settings/shared";
import { sectionRegistry } from "./settings/sections";

export async function saveShowroomProfileSettings(formData: FormData) {
  await requireAdmin();
  const section = z.enum(["appearance", "identity", "contact", "social", "copy", "homepage", "pages", "interest", "whatsapp", "visibility", "faq"]).safeParse(formData.get("section"));
  if (!section.success) settingsError("قسم الإعدادات غير معروف.");

  const current = await getStoredShowroomProfile();
  const handler = sectionRegistry[section.data];
  if (!handler) settingsError("قسم الإعدادات غير معروف.");

  const updated = await handler(current, formData);
  await persistShowroomProfile(updated, section.data);
}

export async function saveSetting(formData: FormData) {
  await requireAdmin();
  const key = required.parse(formData.get("key"));
  const raw = required.parse(formData.get("value"));
  let value: Prisma.InputJsonValue;
  try {
    value = JSON.parse(raw);
  } catch {
    value = raw;
  }
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: {
      key,
      value,
      labelAr: String(formData.get("labelAr") ?? "") || null,
      labelEn: String(formData.get("labelEn") ?? "") || null,
      labelHe: String(formData.get("labelHe") ?? "") || null
    }
  });
  revalidatePublicContent("public-settings");
  revalidatePath("/admin/settings");
  revalidatePath("/");
  for (const locale of locales) {
    revalidatePath(`/${locale}`, "layout");
  }
}
