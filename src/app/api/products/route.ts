import { db } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("q")?.trim();
  const sort = url.searchParams.get("sort");
  const orderBy = sort === "price-low" ? { price: "asc" as const } : sort === "price-high" ? { price: "desc" as const } : { createdAt: "desc" as const };
  const products = await db.product.findMany({
    where: {
      enabled: true,
      category: { enabled: true, ...(category ? { slug: category } : {}) },
      ...(search ? { name: { contains: search } } : {}),
    },
    include: { category: true, variants: { where: { enabled: true } } },
    orderBy,
  });
  return Response.json(products.map((product) => ({ ...product, gallery: JSON.parse(product.gallery), attributes: JSON.parse(product.attributes) })));
}