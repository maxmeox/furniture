import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { cloudinaryDeleteAsset } from "@/lib/cloudinary";

const destroySchema = z.object({
  publicId: z.string().trim().min(1).max(500)
});

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = destroySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "publicId is required" }, { status: 400 });
  }

  const result = await cloudinaryDeleteAsset(parsed.data.publicId);
  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Deletion failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
