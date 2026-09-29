import Stripe from "stripe";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!sessionId || !secret) return Response.json({ error: "Confirmation unavailable" }, { status: 400 });
  try {
    const session = await new Stripe(secret).checkout.sessions.retrieve(sessionId);
    const order = await db.order.findFirst({ where: { stripeSessionId: session.id }, include: { items: true } });
    if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
    if (session.payment_status === "paid" && order.paymentStatus !== "paid") {
      await db.order.update({ where: { id: order.id }, data: { paymentStatus: "paid", status: "confirmed" } });
    }
    return Response.json({ publicId: order.publicId, paymentStatus: session.payment_status, total: order.total, items: order.items });
  } catch {
    return Response.json({ error: "Could not verify your payment" }, { status: 502 });
  }
}