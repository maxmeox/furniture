import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", db: "connected", timestamp: new Date().toISOString() },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" }
      }
    );
  } catch {
    return NextResponse.json(
      { status: "degraded", db: "unavailable", timestamp: new Date().toISOString() },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" }
      }
    );
  }
}
