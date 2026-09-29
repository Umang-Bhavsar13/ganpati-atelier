import { cookies } from "next/headers";
import { adminCookieName, createAdminSession, isAdminAuthenticated, validateAdminCredentials } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { z } from "zod";

const credentials = z.object({ email: z.email(), password: z.string().min(1).max(200) });

export async function GET() {
  return Response.json({ authenticated: await isAdminAuthenticated() });
}

export async function POST(request: Request) {
  const input = credentials.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Enter a valid email and password", 400);
  if (!validateAdminCredentials(input.data.email, input.data.password)) return jsonError("Invalid admin credentials", 401);
  let session: ReturnType<typeof createAdminSession>;
  try {
    session = createAdminSession(input.data.email);
  } catch {
    return jsonError("Admin login is not configured on this server", 503);
  }
  (await cookies()).set(adminCookieName, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: session.maxAge,
  });
  return Response.json({ authenticated: true });
}

export async function DELETE() {
  (await cookies()).delete(adminCookieName);
  return Response.json({ authenticated: false });
}