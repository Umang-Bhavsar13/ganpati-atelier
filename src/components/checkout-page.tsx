"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { StorefrontLayout } from "@/components/storefront-frame";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/cart";

export function CheckoutPage() {
  const { lines } = useCart();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const subtotal = lines.reduce((total, line) => total + line.price * line.quantity, 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        items: lines.map((line) => ({ productId: line.productId, ...(line.variantId ? { variantId: line.variantId } : {}), quantity: line.quantity })),
      }),
    }).catch(() => null);
    const result = await response?.json().catch(() => null);
    if (!response?.ok || !result?.url) {
      setError(result?.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }
    window.location.assign(result.url);
  }

  return <StorefrontLayout><main className="checkout-page"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/cart">Your bag</Link><span>/</span><span>Delivery & payment</span></div><div className="checkout-heading"><span className="overline">Almost home</span><h1>Delivery details<span>.</span></h1><p>Your details are only used to get your order safely to you.</p></div>
    {lines.length === 0 ? <div className="empty-state checkout-empty"><h2>Your bag is empty.</h2><Link href="/our-collection" className="button button-dark">Return to the collection <ArrowRight size={16} /></Link></div> : <div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><h2>Where should we send it?</h2><div className="form-grid"><label className="field-span">Full name<input name="customerName" autoComplete="name" required minLength={2} maxLength={100} placeholder="Your name" /></label><label>Mobile number<input name="phone" type="tel" autoComplete="tel" required pattern="[+0-9()\- ]{8,20}" placeholder="+91 98765 43210" /></label><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label className="field-span">Address<input name="address" autoComplete="street-address" required minLength={8} maxLength={300} placeholder="House number, street, area" /></label><label>City<input name="city" autoComplete="address-level2" required minLength={2} placeholder="City" /></label><label>State<input name="state" autoComplete="address-level1" required minLength={2} placeholder="State" /></label><label>Pincode<input name="pincode" inputMode="numeric" autoComplete="postal-code" required pattern="[0-9]{6}" placeholder="411001" /></label><label className="field-span">Delivery note <span className="field-optional">Optional</span><textarea name="notes" rows={3} maxLength={500} placeholder="Anything we should know?" /></label></div>{error && <div className="form-error" role="alert">{error}</div>}<button type="submit" className="button button-dark checkout-submit" disabled={submitting}>{submitting ? "Preparing secure checkout…" : <>Proceed to secure payment <ArrowRight size={16} /></>}</button><div className="secure-note"><LockKeyhole size={14} /> Payment is securely processed by Stripe. Your card details never touch our server.</div></form>
      <aside className="checkout-summary"><span className="overline">Your selection</span><h2>Order summary</h2>{lines.map((line) => <div className="checkout-item" key={`${line.productId}-${line.variantId}`}><div className="checkout-thumb"><Image src={line.imageUrl} alt="" fill sizes="56px" unoptimized /><i>{line.quantity}</i></div><div><b>{line.name}</b><span>{line.variantName}</span></div><strong>{formatPrice(line.price * line.quantity)}</strong></div>)}<div className="summary-total"><span>Total</span><b>{formatPrice(subtotal)}</b></div><p>Including applicable taxes. Delivery details are confirmed with your order.</p></aside></div>}
    <Link href="/cart" className="continue-link checkout-back"><ArrowLeft size={14} /> Return to your bag</Link>
  </main></StorefrontLayout>;
}