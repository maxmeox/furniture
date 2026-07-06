import "server-only";

import { createHash } from "crypto";
import { z } from "zod";

export { cloudinaryOptimizedUrl } from "./cloudinary-url";

export const cloudinaryUploadFolderSchema = z.enum([
  "products",
  "fabrics",
  "offers",
  "gallery",
  "campaigns",
  "brand"
]);

export type CloudinaryUploadFolder = z.infer<typeof cloudinaryUploadFolderSchema>;

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

function signUploadParameters(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export function createSignedUploadParams(folder: CloudinaryUploadFolder) {
  const config = getCloudinaryConfig();
  if (!config) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder, timestamp };

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    signature: signUploadParameters(params, config.apiSecret),
    folder
  };
}

export async function cloudinaryDeleteAsset(publicId: string): Promise<{ success: boolean; error?: string }> {
  const config = getCloudinaryConfig();
  if (!config) return { success: false, error: "Cloudinary not configured" };

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signUploadParameters({ public_id: publicId, timestamp }, config.apiSecret);

  try {
    const formData = new URLSearchParams({
      public_id: publicId,
      api_key: config.apiKey,
      timestamp: String(timestamp),
      signature
    });

    const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const json = await res.json() as { result?: string };
    if (json.result === "ok") return { success: true };
    return { success: false, error: json.result ?? "unknown" };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Network error" };
  }
}
