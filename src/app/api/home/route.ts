import { db } from "@/lib/db";

export async function GET() {
  const [sections, categories, contact, brand, hero, footer, imageAttribution] = await Promise.all([
    db.homeSection.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
    db.category.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
    db.siteContent.findUnique({ where: { key: "contact" } }),
    db.siteContent.findUnique({ where: { key: "brand" } }),
    db.siteContent.findUnique({ where: { key: "hero" } }),
    db.siteContent.findUnique({ where: { key: "footer" } }),
    db.siteContent.findUnique({ where: { key: "imageAttribution" } }),
  ]);
  const products = await db.product.findMany({
    where: { enabled: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { category: true, variants: { where: { enabled: true } } },
  });
  return Response.json({
    sections,
    categories,
    products: products.map((product) => ({ ...product, gallery: JSON.parse(product.gallery), attributes: JSON.parse(product.attributes) })),
    brand: brand ? JSON.parse(brand.value) : null,
    hero: hero ? JSON.parse(hero.value) : null,
    footer: footer ? JSON.parse(footer.value) : null,
    imageAttribution: imageAttribution ? JSON.parse(imageAttribution.value) : null,
    contact: contact ? JSON.parse(contact.value) : null,
  });
}