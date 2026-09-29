import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { z } from "zod";

const contentInput = z.object({ key: z.string().min(2).max(60), value: z.unknown() });

export async function GET() {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  const [content, sections] = await Promise.all([
    db.siteContent.findMany(),
    db.homeSection.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return Response.json({ content: Object.fromEntries(content.map((entry) => [entry.key, JSON.parse(entry.value)])), sections });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  const input = contentInput.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Invalid content payload", 400);
  const value = JSON.stringify(input.data.value);
  return Response.json(await db.siteContent.upsert({
    where: { key: input.data.key },
    update: { value },
    create: { key: input.data.key, value },
  }));
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  const sectionSchema = z.object({
    id: z.string().optional(),
    type: z.string().min(2),
    heading: z.string().min(2),
    description: z.string().default(""),
    imageUrl: z.string().default(""),
    productIds: z.array(z.string()).default([]),
    enabled: z.boolean().default(true),
    sortOrder: z.number().int().min(0).default(0),
  });
  const input = sectionSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Invalid homepage section", 400);
  const { id, productIds, ...data } = input.data;
  const saved = id
    ? await db.homeSection.update({ where: { id }, data: { ...data, productIds: JSON.stringify(productIds) } })
    : await db.homeSection.create({ data: { ...data, productIds: JSON.stringify(productIds) } });
  return Response.json(saved);
}