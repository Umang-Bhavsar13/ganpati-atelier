import Stripe from "stripe";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { checkoutInput } from "@/lib/validation";

function makePublicId() {
  return `MH-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`;
}

export async function POST(request: Request) {
  const input = checkoutInput.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Check your delivery details and cart items", 400);
  const productIds = [...new Set(input.data.items.map((item) => item.productId))];
  const products = await db.product.findMany({ where: { id: { in: productIds }, enabled: true, category: { enabled: true } }, include: { variants: { where: { enabled: true } } } });
  if (products.length !== productIds.length) return jsonError("One or more products are no longer available", 409);
  let subtotal = 0;
  const orderItems: { productId: string; productName: string; variantName: string; unitPrice: number; quantity: number; imageUrl: string }[] = [];
  for (const item of input.data.items) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) return jsonError("Product unavailable", 409);
    const variant = item.variantId ? product.variants.find((entry) => entry.id === item.variantId) : null;
    if (item.variantId && !variant) return jsonError(`${product.name} option is no longer available`, 409);
    const available = variant ? variant.stock : product.stock;
    if (available < item.quantity) return jsonError(`${product.name} has insufficient stock`, 409);
    subtotal += product.price * item.quantity;
    orderItems.push({ productId: product.id, productName: product.name, variantName: variant?.name ?? "", unitPrice: product.price, quantity: item.quantity, imageUrl: variant?.imageUrl ?? product.imageUrl });
  }
  const order = await db.order.create({
    data: {
      publicId: makePublicId(),
      customerName: input.data.customerName,
      phone: input.data.phone,
      email: input.data.email,
      address: input.data.address,
      city: input.data.city,
      state: input.data.state,
      pincode: input.data.pincode,
      notes: input.data.notes,
      subtotal,
      total: subtotal,
      items: { create: orderItems },
    },
  });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !secret.startsWith("sk_")) {
    await db.order.delete({ where: { id: order.id } });
    return jsonError("Online payment is not configured yet. Add a Stripe test key to enable checkout.", 503);
  }

  try {
    const stripe = new Stripe(secret);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.data.email,
      success_url: `${siteUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?cancelled=1`,
      metadata: { orderId: order.id, publicId: order.publicId },
      line_items: orderItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "inr",
          unit_amount: item.unitPrice,
          product_data: { name: `${item.productName}${item.variantName ? ` - ${item.variantName}` : ""}`, images: [item.imageUrl] },
        },
      })),
    });
    await db.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    return Response.json({ url: session.url });
  } catch {
    await db.order.delete({ where: { id: order.id } });
    return jsonError("Could not start secure checkout. Please try again.", 502);
  }
}