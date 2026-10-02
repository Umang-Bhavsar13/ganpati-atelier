import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { isAdminAuthenticated } from "@/lib/auth";
import { jsonError } from "@/lib/http";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return jsonError("Unauthorized", 401);
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) return jsonError("Image file is required", 400);
  const extension = allowedTypes.get(file.type);
  if (!extension) return jsonError("Only JPG, PNG, WebP, and AVIF images are supported", 400);
  if (file.size > 10 * 1024 * 1024) return jsonError("Images must be 10 MB or smaller", 400);

  const filename = `${randomUUID()}.${extension}`;
  if (process.env.VERCEL) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return Response.json({ url: blob.url });
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/uploads/${filename}` });
}