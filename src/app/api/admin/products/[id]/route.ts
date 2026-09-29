import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { productInput } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  const { id } = await context.params;
  const input = productInput.partial().safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Check the product fields", 400);
  const { variants, gallery, attributes, ...data } = input.data;
  try {
    return Response.json(await db.$transaction(async (transaction) => {
      if (variants) {
        await transaction.productVariant.deleteMany({ where: { productId: id } });
      }
      return transaction.product.update({
        where: { id },
        data: {
          ...data,
          ...(gallery ? { gallery: JSON.stringify(gallery) } : {}),
          ...(attributes ? { attributes: JSON.stringify(attributes) } : {}),
          ...(variants ? { variants: { create: variants } } : {}),
        },
        include: { category: true, variants: true },
      });
    }));
  } catch {
    return jsonError("Product not found or slug already in use", 409);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  const { id } = await context.params;
  try {
    await db.product.update({ where: { id }, data: { enabled: false } });
    return Response.json({ deleted: true });
  } catch {
    return jsonError("Product not found", 404);
  }
}