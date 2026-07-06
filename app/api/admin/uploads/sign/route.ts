import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { cloudinaryUploadFolderSchema, createSignedUploadParams } from "@/lib/cloudinary";

const requestSchema = z.object({
  folder: cloudinaryUploadFolderSchema
});

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Unsupported upload folder" }, { status: 400 });

  const signedParams = createSignedUploadParams(parsed.data.folder);
  if (!signedParams) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 503 });
  }

  return NextResponse.json(signedParams, { headers: { "Cache-Control": "no-store" } });
}
