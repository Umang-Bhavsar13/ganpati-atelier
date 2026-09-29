import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { categoryInput } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  const { id } = await context.params;
  const input = categoryInput.partial().safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Check the category fields", 400);
  try {
    return Response.json(await db.category.update({ where: { id }, data: input.data }));
  } catch {
    return jsonError("Category not found or slug already in use", 409);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  const { id } = await context.params;
  try {
    await db.category.delete({ where: { id } });
    return Response.json({ deleted: true });
  } catch {
    return jsonError("This category still has products. Disable it or move its products first.", 409);
  }
}