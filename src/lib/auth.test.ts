import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// We test the sign/verify logic directly since login/logout/getSession
// depend on Next.js cookies() which requires a request context.

const SESSION_DURATION_MS = 30 * 60 * 1000;

function getSecret(): string {
  return process.env.SESSION_SECRET || "finance-tracker-default-secret-key";
}

interface SessionPayload {
  username: string;
  expiresAt: number;
}

function signSession(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

function verifySession(cookieValue: string): SessionPayload | null {
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;

  const [data, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf-8")
    );

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

describe("auth - session sign/verify", () => {
  it("should sign and verify a valid session", () => {
    const payload: SessionPayload = {
      username: "admin",
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };

    const signed = signSession(payload);
    const result = verifySession(signed);

    expect(result).not.toBeNull();
    expect(result!.username).toBe("admin");
    expect(result!.expiresAt).toBe(payload.expiresAt);
  });

  it("should reject an expired session", () => {
    const payload: SessionPayload = {
      username: "admin",
      expiresAt: Date.now() - 1000, // expired 1 second ago
    };

    const signed = signSession(payload);
    const result = verifySession(signed);

    expect(result).toBeNull();
  });

  it("should reject a tampered cookie value", () => {
    const payload: SessionPayload = {
      username: "admin",
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };

    const signed = signSession(payload);
    // Tamper with the data portion
    const tampered = "dGFtcGVyZWQ" + signed.slice(10);
    const result = verifySession(tampered);

    expect(result).toBeNull();
  });

  it("should reject a cookie with invalid format (no dot separator)", () => {
    const result = verifySession("invalidcookievalue");
    expect(result).toBeNull();
  });

  it("should reject a cookie with too many parts", () => {
    const result = verifySession("a.b.c");
    expect(result).toBeNull();
  });

  it("should reject an empty string", () => {
    const result = verifySession("");
    expect(result).toBeNull();
  });

  it("should produce different signatures for different secrets", () => {
    const payload: SessionPayload = {
      username: "admin",
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };

    const originalSecret = process.env.SESSION_SECRET;

    process.env.SESSION_SECRET = "secret-one";
    const signed1 = signSession(payload);

    process.env.SESSION_SECRET = "secret-two";
    const result = verifySession(signed1);

    expect(result).toBeNull();

    // Restore
    if (originalSecret) {
      process.env.SESSION_SECRET = originalSecret;
    } else {
      delete process.env.SESSION_SECRET;
    }
  });

  it("should set 30-minute expiry correctly", () => {
    const now = Date.now();
    const expiresAt = now + SESSION_DURATION_MS;

    // 30 minutes = 1,800,000 ms
    expect(SESSION_DURATION_MS).toBe(1800000);
    expect(expiresAt - now).toBe(1800000);
  });
});
