import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { z } from "zod";

const inquiryInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  phone: z.string().max(30).default(""),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: Request) {
  const input = inquiryInput.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Please check your details and message", 400);
  const inquiry = await db.contactInquiry.create({ data: input.data });
  return Response.json({ received: true, id: inquiry.id }, { status: 201 });
}