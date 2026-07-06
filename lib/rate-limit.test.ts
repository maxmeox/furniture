import { describe, it, expect } from "vitest";
import { readJsonWithLimit } from "./rate-limit";

describe("readJsonWithLimit", () => {

  it("parses valid JSON within size limit", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ hello: "world", num: 42 }),
    });
    const result = await readJsonWithLimit(req, 1024);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ hello: "world", num: 42 });
    }
  });

  it("rejects payload exceeding maxBytes", async () => {
    const body = "x".repeat(100);
    const req = new Request("http://localhost", {
      method: "POST",
      body,
    });
    const result = await readJsonWithLimit(req, 50);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(413);
      expect(result.error).toBe("payload_too_large");
    }
  });

  it("rejects invalid JSON", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: "{ invalid json }",
    });
    const result = await readJsonWithLimit(req, 1024);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toBe("invalid_json");
    }
  });

  it("handles empty body", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: "",
    });
    const result = await readJsonWithLimit(req, 1024);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toBe("invalid_json");
    }
  });

  it("handles nested objects within size limit", async () => {
    const body = JSON.stringify({ a: { b: { c: [1, 2, 3] } }, arr: [1, "two", null] });
    const req = new Request("http://localhost", {
      method: "POST",
      body,
    });
    const result = await readJsonWithLimit(req, 1024);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ a: { b: { c: [1, 2, 3] } }, arr: [1, "two", null] });
    }
  });

  it("rejects payload at exact byte boundary (equal to maxBytes should be allowed)", async () => {
    const body = JSON.stringify({ data: "x" });
    const exactSize = Buffer.byteLength(body, "utf8");
    const req = new Request("http://localhost", {
      method: "POST",
      body,
    });
    const result = await readJsonWithLimit(req, exactSize);
    expect(result.ok).toBe(true);
  });

  it("rejects payload one byte over limit", async () => {
    const body = JSON.stringify({ data: "x" });
    const exactSize = Buffer.byteLength(body, "utf8");
    const req = new Request("http://localhost", {
      method: "POST",
      body,
    });
    const result = await readJsonWithLimit(req, exactSize - 1);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(413);
    }
  });

  it("handles Arabic/Hebrew Unicode text within size limit", async () => {
    const body = JSON.stringify({ name: "مرحبا بالعالم", description: "שלום עולם" });
    const req = new Request("http://localhost", {
      method: "POST",
      body,
    });
    const result = await readJsonWithLimit(req, 1024);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ name: "مرحبا بالعالم", description: "שלום עולם" });
    }
  });

  it("rejects Unicode payload that exceeds size limit", async () => {
    const body = JSON.stringify({ text: "أ".repeat(200) });
    const req = new Request("http://localhost", {
      method: "POST",
      body,
    });
    const result = await readJsonWithLimit(req, 50);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(413);
    }
  });

});
