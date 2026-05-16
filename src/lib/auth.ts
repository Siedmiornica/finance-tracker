import { cookies } from "next/headers";
import { compareSync } from "bcrypt";
import crypto from "crypto";
import { getDb } from "./db";

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Secret key for signing session cookies — in production, use an env variable
function getSecret(): string {
  return process.env.SESSION_SECRET || "finance-tracker-default-secret-key";
}

interface SessionPayload {
  username: string;
  expiresAt: number; // Unix timestamp in ms
}

/**
 * Sign a payload into a cookie value using HMAC-SHA256.
 * Format: base64(payload).base64(signature)
 */
function signSession(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verify and decode a signed session cookie value.
 * Returns the payload if valid and not expired, null otherwise.
 */
function verifySession(cookieValue: string): SessionPayload | null {
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;

  const [data, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");

  // Timing-safe comparison to prevent timing attacks
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

    // Check expiry
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Authenticate the owner with username and password.
 * Returns true and sets session cookie on success, false on failure.
 * Never reveals whether the account exists.
 */
export async function login(
  username: string,
  password: string
): Promise<boolean> {
  const db = getDb();
  const owner = db
    .prepare("SELECT username, password_hash FROM owner WHERE id = 1")
    .get() as { username: string; password_hash: string } | undefined;

  if (!owner) {
    return false;
  }

  // Compare username (case-sensitive) and password
  if (owner.username !== username || !compareSync(password, owner.password_hash)) {
    return false;
  }

  // Create session
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const sessionValue = signSession({ username, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000), // 30 minutes in seconds
  });

  return true;
}

/**
 * End the current session by deleting the session cookie.
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get the current session from cookies.
 * Returns the session payload if authenticated, null otherwise.
 * This version works with the cookies() API from next/headers.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySession(sessionCookie.value);
}

/**
 * Verify a session from a raw cookie value string.
 * Used by the proxy where we don't have access to the cookies() API.
 */
export function verifySessionFromCookie(
  cookieValue: string | undefined
): SessionPayload | null {
  if (!cookieValue) return null;
  return verifySession(cookieValue);
}

export type { SessionPayload };
