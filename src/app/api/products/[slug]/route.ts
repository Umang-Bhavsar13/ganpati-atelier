import { db } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const product = await db.product.findFirst({
    where: { slug, enabled: true, category: { enabled: true } },
    include: { category: true, variants: { where: { enabled: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!product) return Response.json({ error: "Product not found" }, { status: 404 });
  return Response.json({ ...product, gallery: JSON.parse(product.gallery), attributes: JSON.parse(product.attributes) });
}