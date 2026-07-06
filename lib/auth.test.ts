import { describe, it, expect, beforeEach, vi } from "vitest";
import { createAdminSessionToken, verifyAdminSessionToken } from "./auth";
import { createHmac } from "crypto";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { adminUser: { findFirst: vi.fn() } } }));

describe("auth", () => {
  beforeEach(() => {
    delete process.env.AUTH_SECRET;
    delete process.env.ADMIN_SESSION_SECRET;
    delete process.env.NODE_ENV;
  });

  describe("createAdminSessionToken / verifyAdminSessionToken", () => {
    it("creates and verifies a valid token", () => {
      process.env.ADMIN_SESSION_SECRET = "a".repeat(64);

      const token = createAdminSessionToken({ id: "admin-1", email: "admin@test.com" });
      const payload = verifyAdminSessionToken(token);

      expect(payload).not.toBeNull();
      expect(payload!.id).toBe("admin-1");
      expect(payload!.email).toBe("admin@test.com");
      expect(payload!.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it("returns null for invalid token format", () => {
      process.env.ADMIN_SESSION_SECRET = "a".repeat(64);
      expect(verifyAdminSessionToken("")).toBeNull();
      expect(verifyAdminSessionToken("invalid")).toBeNull();
      expect(verifyAdminSessionToken("no.dots.at.all")).toBeNull();
    });

    it("returns null for tampered payload", () => {
      process.env.ADMIN_SESSION_SECRET = "a".repeat(64);
      const token = createAdminSessionToken({ id: "admin-1", email: "admin@test.com" });
      const [body] = token.split(".");
      const tampered = `${body}.tampered-signature`;
      expect(verifyAdminSessionToken(tampered)).toBeNull();
    });

    it("returns null for tampered body", () => {
      process.env.ADMIN_SESSION_SECRET = "a".repeat(64);
      const token = createAdminSessionToken({ id: "admin-1", email: "admin@test.com" });
      const [, sig] = token.split(".");
      const tamperedToken = Buffer.from(JSON.stringify({ id: "admin-2", email: "hacker@test.com", exp: 9999999999 })).toString("base64url") + "." + sig;
      expect(verifyAdminSessionToken(tamperedToken)).toBeNull();
    });

    it("returns null for expired token", () => {
      process.env.ADMIN_SESSION_SECRET = "a".repeat(64);
      const body = Buffer.from(
        JSON.stringify({ id: "admin-1", email: "admin@test.com", exp: Math.floor(Date.now() / 1000) - 1 })
      ).toString("base64url");
      const signature = createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(body).digest("base64url");
      const token = `${body}.${signature}`;
      expect(verifyAdminSessionToken(token)).toBeNull();
    });

    it("uses AUTH_SECRET over ADMIN_SESSION_SECRET", () => {
      process.env.AUTH_SECRET = "b".repeat(64);
      process.env.ADMIN_SESSION_SECRET = "a".repeat(64);

      const tokenA = createAdminSessionToken({ id: "admin-1", email: "admin@test.com" });
      expect(verifyAdminSessionToken(tokenA)).not.toBeNull();
    });

    it("rejects token with missing id", () => {
      process.env.ADMIN_SESSION_SECRET = "a".repeat(64);
      const body = Buffer.from(
        JSON.stringify({ email: "test@test.com", exp: 9999999999 })
      ).toString("base64url");
      const signature = createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(body).digest("base64url");
      const token = `${body}.${signature}`;
      expect(verifyAdminSessionToken(token)).toBeNull();
    });

    it("rejects token with missing email", () => {
      process.env.ADMIN_SESSION_SECRET = "a".repeat(64);
      const body = Buffer.from(
        JSON.stringify({ id: "admin-1", exp: 9999999999 })
      ).toString("base64url");
      const signature = createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(body).digest("base64url");
      const token = `${body}.${signature}`;
      expect(verifyAdminSessionToken(token)).toBeNull();
    });

    it("rejects malformed JSON body", () => {
      process.env.ADMIN_SESSION_SECRET = "a".repeat(64);
      const body = Buffer.from("not-json{").toString("base64url");
      const signature = createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(body).digest("base64url");
      const token = `${body}.${signature}`;
      expect(verifyAdminSessionToken(token)).toBeNull();
    });
  });
});
