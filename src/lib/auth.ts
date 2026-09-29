import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "ganpati_admin";
const SESSION_SECONDS = 60 * 60 * 12;

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function equalSecret(input: string, expected: string) {
  const inputHash = createHash("sha256").update(input).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(inputHash, expectedHash);
}

export function validateAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  return Boolean(
    sessionSecret() &&
      expectedEmail &&
      expectedPassword &&
      equalSecret(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase()) &&
      equalSecret(password, expectedPassword),
  );
}

export function createAdminSession(email: string) {
  const secret = sessionSecret();
  if (!secret) throw new Error("Admin session secret is not configured");
  const payload = Buffer.from(
    JSON.stringify({ sub: email.toLowerCase(), exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return { token: `${payload}.${signature}`, maxAge: SESSION_SECONDS };
}

export async function isAdminAuthenticated() {
  const secret = sessionSecret();
  if (!secret) return false;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", secret).update(payload).digest();
  let supplied: Buffer;
  try {
    supplied = Buffer.from(signature, "base64url");
  } catch {
    return false;
  }
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: string;
      exp?: number;
    };
    return Boolean(
      session.sub &&
        session.sub === process.env.ADMIN_EMAIL?.trim().toLowerCase() &&
        session.exp &&
        session.exp > Math.floor(Date.now() / 1000),
    );
  } catch {
    return false;
  }
}

export const adminCookieName = COOKIE_NAME;