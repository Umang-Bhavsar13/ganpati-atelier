import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const image = {
  eco: "https://upload.wikimedia.org/wikipedia/commons/4/42/Vinayaka_Chaturthi_Images_-_An_eco_friendly_Ganesh_idol.jpg",
  clay: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Clay_Ganesh_Murti%2C_Ganesh_Chaturthi.JPG",
  shop: "https://upload.wikimedia.org/wikipedia/commons/0/05/Ganesh_Chaturthi_Images_-_A_large_Ganesh_Murti_on_display_at_a_road_side_idol_shop.jpg",
  small: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Ganesha_Idol_IMG002.jpg",
};

const attribution = {
  images: [
    { artist: "VedSutra", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Vinayaka_Chaturthi_Images_-_An_eco_friendly_Ganesh_idol.jpg" },
    { artist: "Redtigerxyz", license: "CC BY 2.5", url: "https://commons.wikimedia.org/wiki/File:Clay_Ganesh_Murti,_Ganesh_Chaturthi.JPG" },
    { artist: "VedSutra", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Ganesh_Chaturthi_Images_-_A_large_Ganesh_Murti_on_display_at_a_road_side_idol_shop.jpg" },
    { artist: "Phadke09", license: "CC BY-SA 4.0", url: "https://commons.wikimedia.org/wiki/File:Ganesha_Idol_IMG002.jpg" },
  ],
};

async function main() {
  const category = await db.category.upsert({
    where: { slug: "dashboard" },
    update: { name: "Dashboard", enabled: true, sortOrder: 0 },
    create: { name: "Dashboard", slug: "dashboard", sortOrder: 0 },
  });

  const products = [
    { slug: "mangal-murti", name: "Mangal Murti", description: "A welcoming form, finished by hand for a place of daily devotion.", price: 249900, stock: 8, height: "6 inches", imageUrl: image.eco, featured: true, variants: [{ name: "Vermilion", colorHex: "#B84D36", stock: 3 }, { name: "Ivory", colorHex: "#E8DCC4", stock: 3 }, { name: "Leaf", colorHex: "#637655", stock: 2 }] },
    { slug: "siddhivinayak", name: "Siddhivinayak", description: "A serene seated idol with an expressive silhouette and fine detailing.", price: 329900, stock: 5, height: "8 inches", imageUrl: image.clay, featured: true, variants: [{ name: "Ivory", colorHex: "#E8DCC4", stock: 2 }, { name: "Saffron", colorHex: "#CB7950", stock: 3 }] },
    { slug: "modak-priya", name: "Modak Priya", description: "A joyful, compact centrepiece made for intimate home celebrations.", price: 189900, stock: 11, height: "5 inches", imageUrl: image.small, featured: true, variants: [{ name: "Rose", colorHex: "#C78382", stock: 4 }, { name: "Gold", colorHex: "#B79A5D", stock: 4 }, { name: "Ivory", colorHex: "#E8DCC4", stock: 3 }] },
    { slug: "rajadhiraj", name: "Rajadhiraj", description: "A statement idol with a generous presence and traditional ornament.", price: 549900, stock: 2, height: "12 inches", imageUrl: image.shop, featured: false, variants: [{ name: "Classic", colorHex: "#AF7442", stock: 2 }] },
  ];

  for (const product of products) {
    const { variants, ...data } = product;
    const saved = await db.product.upsert({
      where: { slug: product.slug },
      update: { ...data, categoryId: category.id },
      create: { ...data, categoryId: category.id },
    });
    for (const variant of variants) {
      await db.productVariant.upsert({
        where: { productId_name: { productId: saved.id, name: variant.name } },
        update: { ...variant, productId: saved.id },
        create: { ...variant, productId: saved.id },
      });
    }
  }

  const sections = [
    { type: "featured", heading: "Made for the moment", description: "A few forms we return to, year after year.", sortOrder: 1 },
    { type: "story", heading: "A little more meaning", description: "Considered details, a calmer palette, and a place for what matters.", imageUrl: image.shop, sortOrder: 2 },
    { type: "categories", heading: "Made for the places you love.", description: "Each piece has its own presence. Find the one that feels like yours.", sortOrder: 3 },
    { type: "closing", heading: "There is a place for something meaningful.", description: "Auspicious beginnings, made personal.", sortOrder: 4 },
  ];
  for (const section of sections) {
    await db.homeSection.upsert({
      where: { id: `home-${section.type}` },
      update: section,
      create: { id: `home-${section.type}`, ...section },
    });
  }

  const content = {
    brand: { name: "Morya House", tagline: "A home for auspicious beginnings" },
    hero: { eyebrow: "Hand-finished dashboard idols", heading: "A little more\nmeaning at home.", description: "Thoughtfully made Ganesha murtis for the rituals, rooms and beginnings that matter.", imageUrl: image.eco, cta: "Explore the collection" },
    contact: { businessName: "Morya House", phone: "", whatsapp: "", email: "", address: "Pune, Maharashtra", mapsUrl: "", instagram: "", hours: "By appointment" },
    footer: { note: "Made with devotion. Kept for generations.", copyright: "Morya House", location: "Thoughtfully made in Maharashtra, India", deliveryNote: "Carefully packed, sent with care" },
    imageAttribution: attribution,
  };
  for (const [key, value] of Object.entries(content)) {
    await db.siteContent.upsert({ where: { key }, update: { value: JSON.stringify(value) }, create: { key, value: JSON.stringify(value) } });
  }
}

main().finally(() => db.$disconnect());