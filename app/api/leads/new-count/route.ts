import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const count = await prisma.lead.count({ where: { status: "new" } });
    return Response.json({ count });
  } catch {
    return Response.json({ count: 0 }, { status: 401 });
  }
}
