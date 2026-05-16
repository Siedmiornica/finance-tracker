import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "session";

// Inline session verification for the proxy layer.
// We cannot import from src/lib/auth.ts because the proxy runs in a separate
// context and should not depend on heavy modules like better-sqlite3.
function getSecret(): string {
  return process.env.SESSION_SECRET || "finance-tracker-default-secret-key";
}

function verifySession(cookieValue: string): boolean {
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

  const [data, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");

  // Timing-safe comparison
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

    // Check expiry
    if (Date.now() > payload.expiresAt) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function isAuthenticated(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return false;
  return verifySession(sessionCookie.value);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Protect /dashboard routes — require authentication for all requests
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated(request)) {
      // Redirect unauthenticated users to login page for page requests
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Protect write API endpoints (POST, PUT, DELETE)
  // Public GET endpoints: /api/items, /api/folders, /api/summary
  // Public POST endpoint: /api/auth/login
  if (pathname.startsWith("/api")) {
    // Allow login endpoint without auth
    if (pathname === "/api/auth/login") {
      return NextResponse.next();
    }

    // Allow public GET endpoints
    if (method === "GET") {
      return NextResponse.next();
    }

    // All other API requests (POST, PUT, DELETE) require authentication
    if (!isAuthenticated(request)) {
      return Response.json(
        { error: "Access denied" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
