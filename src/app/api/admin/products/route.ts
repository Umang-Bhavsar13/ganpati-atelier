import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { productInput } from "@/lib/validation";

export async function GET() {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  return Response.json(await db.product.findMany({ include: { category: true, variants: true }, orderBy: { updatedAt: "desc" } }));
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  const input = productInput.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Check the product fields", 400);
  const { variants, gallery, attributes, ...data } = input.data;
  try {
    const product = await db.product.create({
      data: {
        ...data,
        gallery: JSON.stringify(gallery),
        attributes: JSON.stringify(attributes),
        variants: { create: variants },
      },
      include: { category: true, variants: true },
    });
    return Response.json(product, { status: 201 });
  } catch {
    return jsonError("Could not save product. Check its slug and category.", 409);
  }
}