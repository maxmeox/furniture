import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type AdminSessionPayload = {
  id: string;
  email: string;
  exp: number;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.ADMIN_SESSION_SECRET;
  if (secret) {
    if (secret.length < 32) {
      throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
    }
    return secret;
  }
  throw new Error("ADMIN_SESSION_SECRET is required. Set it in .env or production environment.");
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createAdminSessionToken(payload: Omit<AdminSessionPayload, "exp">) {
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
    })
  ).toString("base64url");

  return `${body}.${sign(body)}`;
}

export function verifyAdminSessionToken(token: string): AdminSessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AdminSessionPayload;
    if (!payload.id || !payload.email || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyAdminSessionToken(token);
  if (!payload) return null;

  const admin = await prisma.adminUser.findFirst({
    where: { id: payload.id, email: payload.email, isActive: true },
    select: { id: true, email: true, name: true, role: true }
  });

  return admin;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
