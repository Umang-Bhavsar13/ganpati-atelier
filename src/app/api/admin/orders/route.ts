import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { z } from "zod";

export async function GET() {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  return Response.json(await db.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }));
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  const input = z.object({ id: z.string(), status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]) }).safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Invalid order status", 400);
  try {
    return Response.json(await db.order.update({ where: { id: input.data.id }, data: { status: input.data.status } }));
  } catch {
    return jsonError("Order not found", 404);
  }
}