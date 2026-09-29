import Stripe from "stripe";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !webhookSecret || !signature) return Response.json({ error: "Webhook is not configured" }, { status: 400 });
  const stripe = new Stripe(secret);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await db.order.updateMany({
        where: { id: orderId, stripeSessionId: session.id },
        data: { paymentStatus: "paid", status: "confirmed" },
      });
    }
  }
  return Response.json({ received: true });
}