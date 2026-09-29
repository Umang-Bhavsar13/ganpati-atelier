"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Clock3, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { StorefrontLayout } from "@/components/storefront-frame";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/cart";

type Confirmation = { publicId: string; paymentStatus: string; total: number };

export function ConfirmationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<Confirmation | null>(null);
  const [error, setError] = useState(false);
  const { clear } = useCart();

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/order-confirmation?session_id=${encodeURIComponent(sessionId)}`).then(async (response) => {
      if (!response.ok) throw new Error("Could not confirm order");
      const result = await response.json() as Confirmation;
      setOrder(result);
      if (result.paymentStatus === "paid") clear();
    }).catch(() => setError(true));
  }, [sessionId, clear]);

  return <StorefrontLayout><main className="confirmation-page"><div className="confirmation-seal">{order?.paymentStatus === "paid" ? <Check size={29} /> : <Clock3 size={27} />}</div><span className="overline">{error || !sessionId ? "We couldn&apos;t verify that yet" : order?.paymentStatus === "paid" ? "A new beginning" : "Payment confirmation"}</span><h1>{error || !sessionId ? "Let's check that again." : order?.paymentStatus === "paid" ? <>Your order is<br /><em>on its way to us.</em></> : "Your payment is processing."}</h1><p>{error || !sessionId ? "Your payment may still have completed. Please check your email or contact the studio with your payment receipt." : order?.paymentStatus === "paid" ? "Thank you for choosing a piece from our studio. We&apos;ll be in touch with the next steps." : "Your order is saved. We’ll update you as soon as the payment is confirmed."}</p>{order && <div className="confirmation-receipt"><span>ORDER REFERENCE</span><b>{order.publicId}</b><span>ORDER TOTAL</span><b>{formatPrice(order.total)}</b></div>}<Link href="/our-collection" className="button button-dark">Back to the collection <PackageCheck size={16} /></Link></main></StorefrontLayout>;
}