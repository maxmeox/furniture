import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { locales } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { showroomProfileDefaults, type ShowroomProfile } from "@/lib/showroom-profile";
import { profileLabels, revalidatePublicContent } from "../utils";

export async function getStoredShowroomProfile(): Promise<ShowroomProfile> {
  const setting = await prisma.setting.findUnique({ where: { key: "showroom_profile" } });
  const storedProfile = (setting?.value ?? {}) as Partial<ShowroomProfile>;
  return {
    ...showroomProfileDefaults,
    ...storedProfile,
    deliveryAreas: Array.isArray(storedProfile.deliveryAreas) ? storedProfile.deliveryAreas : showroomProfileDefaults.deliveryAreas,
    social: {
      ...showroomProfileDefaults.social,
      ...(storedProfile.social ?? {})
    },
    mapLink: storedProfile.mapLink ?? showroomProfileDefaults.mapLink
  };
}

export async function persistShowroomProfile(profile: ShowroomProfile, section: string) {
  try {
    await prisma.setting.upsert({
      where: { key: "showroom_profile" },
      update: { value: profile as unknown as Prisma.InputJsonValue, ...profileLabels },
      create: {
        key: "showroom_profile",
        value: profile as unknown as Prisma.InputJsonValue,
        ...profileLabels
      }
    });
  } catch (e) {
    console.error("[persistShowroomProfile]", e);
    settingsError("حدث خطأ في حفظ الإعدادات، حاول مرة أخرى");
  }
  revalidatePublicContent("public-settings");
  revalidatePath("/admin/settings");
  revalidatePath("/");
  for (const locale of locales) {
    revalidatePath(`/${locale}`, "layout");
  }
  redirect(`/admin/settings?saved=${encodeURIComponent(section)}`);
}

export function settingsError(message: string): never {
  redirect(`/admin/settings?error=${encodeURIComponent(message)}`);
}
