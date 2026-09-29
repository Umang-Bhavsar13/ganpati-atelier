import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { categoryInput } from "@/lib/validation";

export async function GET() {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  return Response.json(await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } }));
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  const input = categoryInput.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Check the category fields", 400);
  try {
    return Response.json(await db.category.create({ data: input.data }), { status: 201 });
  } catch {
    return jsonError("That category slug is already in use", 409);
  }
}