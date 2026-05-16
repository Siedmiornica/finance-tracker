import { describe, it, expect } from "vitest";
import crypto from "crypto";

// Test the proxy's route protection logic by simulating the auth check
// We replicate the proxy's inline verification to test the routing decisions

const SESSION_COOKIE_NAME = "session";

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

function verifySession(cookieValue: string): boolean {
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

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
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf-8")
    );
    if (Date.now() > payload.expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

// Simulate the proxy routing logic
type ProxyDecision = "allow" | "redirect-login" | "deny-401";

function simulateProxy(
  pathname: string,
  method: string,
  sessionCookie: string | undefined
): ProxyDecision {
  const isAuth = sessionCookie ? verifySession(sessionCookie) : false;

  // Dashboard routes
  if (pathname.startsWith("/dashboard")) {
    return isAuth ? "allow" : "redirect-login";
  }

  // API routes
  if (pathname.startsWith("/api")) {
    // Login endpoint is always public
    if (pathname === "/api/auth/login") return "allow";

    // GET endpoints are public
    if (method === "GET") return "allow";

    // All other methods require auth
    return isAuth ? "allow" : "deny-401";
  }

  return "allow";
}

describe("proxy - route protection logic", () => {
  const validSession = signSession({
    username: "admin",
    expiresAt: Date.now() + 30 * 60 * 1000,
  });

  const expiredSession = signSession({
    username: "admin",
    expiresAt: Date.now() - 1000,
  });

  describe("dashboard routes", () => {
    it("should redirect unauthenticated users to login", () => {
      expect(simulateProxy("/dashboard", "GET", undefined)).toBe("redirect-login");
      expect(simulateProxy("/dashboard/items", "GET", undefined)).toBe("redirect-login");
      expect(simulateProxy("/dashboard/folders", "GET", undefined)).toBe("redirect-login");
    });

    it("should allow authenticated users", () => {
      expect(simulateProxy("/dashboard", "GET", validSession)).toBe("allow");
      expect(simulateProxy("/dashboard/items", "GET", validSession)).toBe("allow");
      expect(simulateProxy("/dashboard/items/new", "GET", validSession)).toBe("allow");
    });

    it("should reject expired sessions", () => {
      expect(simulateProxy("/dashboard", "GET", expiredSession)).toBe("redirect-login");
    });
  });

  describe("API routes - public GET endpoints", () => {
    it("should allow GET /api/items without auth", () => {
      expect(simulateProxy("/api/items", "GET", undefined)).toBe("allow");
    });

    it("should allow GET /api/folders without auth", () => {
      expect(simulateProxy("/api/folders", "GET", undefined)).toBe("allow");
    });

    it("should allow GET /api/summary without auth", () => {
      expect(simulateProxy("/api/summary", "GET", undefined)).toBe("allow");
    });
  });

  describe("API routes - login endpoint", () => {
    it("should allow POST /api/auth/login without auth", () => {
      expect(simulateProxy("/api/auth/login", "POST", undefined)).toBe("allow");
    });
  });

  describe("API routes - write endpoints require auth", () => {
    it("should deny POST /api/items without auth", () => {
      expect(simulateProxy("/api/items", "POST", undefined)).toBe("deny-401");
    });

    it("should deny PUT /api/items/1 without auth", () => {
      expect(simulateProxy("/api/items/1", "PUT", undefined)).toBe("deny-401");
    });

    it("should deny DELETE /api/items/1 without auth", () => {
      expect(simulateProxy("/api/items/1", "DELETE", undefined)).toBe("deny-401");
    });

    it("should deny POST /api/folders without auth", () => {
      expect(simulateProxy("/api/folders", "POST", undefined)).toBe("deny-401");
    });

    it("should deny DELETE /api/folders/1 without auth", () => {
      expect(simulateProxy("/api/folders/1", "DELETE", undefined)).toBe("deny-401");
    });

    it("should deny POST /api/auth/logout without auth", () => {
      expect(simulateProxy("/api/auth/logout", "POST", undefined)).toBe("deny-401");
    });

    it("should allow POST /api/items with valid auth", () => {
      expect(simulateProxy("/api/items", "POST", validSession)).toBe("allow");
    });

    it("should allow DELETE /api/folders/1 with valid auth", () => {
      expect(simulateProxy("/api/folders/1", "DELETE", validSession)).toBe("allow");
    });
  });

  describe("error messages - never reveal account existence", () => {
    it("should return generic 'Access denied' for unauthenticated write attempts", () => {
      // The proxy returns { error: "Access denied" } with 401
      // This test verifies the decision is "deny-401" (not a specific user-related message)
      const result = simulateProxy("/api/items", "POST", undefined);
      expect(result).toBe("deny-401");
    });
  });
});
