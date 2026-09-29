"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { StorefrontLayout } from "@/components/storefront-frame";
import { lineKey, useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/cart";

export function CartPage() {
  const { lines, setQuantity, remove } = useCart();
  const subtotal = lines.reduce((total, line) => total + line.price * line.quantity, 0);

  return <StorefrontLayout><main className="cart-page"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Your bag</span></div><div className="cart-heading"><span className="overline">A little meaning, on its way</span><h1>Your bag<span>.</span></h1><span className="cart-items-count">{lines.reduce((sum, line) => sum + line.quantity, 0)} {lines.length === 1 ? "piece" : "pieces"}</span></div>
    {lines.length === 0 ? <div className="empty-state cart-empty"><span className="empty-mark">m</span><h2>Your bag is waiting.</h2><p>Find a piece that feels like it belongs.</p><Link href="/our-collection" className="button button-dark">Explore the collection <ArrowRight size={16} /></Link></div> : <div className="cart-layout"><div className="cart-lines">{lines.map((line) => <article className="cart-line" key={lineKey(line)}><Link href={`/products/${line.slug}`} className="cart-line-image"><Image src={line.imageUrl} alt={line.name} fill sizes="130px" unoptimized /></Link><div className="cart-line-main"><span className="overline">Dashboard idol{line.variantName ? ` · ${line.variantName}` : ""}</span>{line.colorHex && <span className="cart-line-color"><i style={{ backgroundColor: line.colorHex }} /> {line.variantName} finish</span>}<Link href={`/products/${line.slug}`} className="cart-line-name">{line.name}</Link><span className="cart-line-price">{formatPrice(line.price)}</span><div className="quantity-stepper cart-quantity"><button aria-label="Decrease quantity" onClick={() => line.quantity === 1 ? remove(lineKey(line)) : setQuantity(lineKey(line), line.quantity - 1)}><Minus size={13} /></button><span>{line.quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(lineKey(line), line.quantity + 1)}><Plus size={13} /></button></div></div><div className="cart-line-end"><b>{formatPrice(line.price * line.quantity)}</b><button className="remove-item" aria-label={`Remove ${line.name}`} onClick={() => remove(lineKey(line))}><Trash2 size={16} /></button></div></article>)}</div>
      <aside className="order-summary"><span className="overline">A clear little summary</span><h2>Order total</h2><div><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div><div><span>Delivery</span><span className="delivery-note">Calculated at checkout</span></div><p>Taxes included. Delivery details confirmed at checkout.</p><Link href="/checkout" className="button button-dark summary-button">Continue to checkout <ArrowRight size={16} /></Link><Link href="/our-collection" className="continue-link"><ArrowLeft size={14} /> Continue exploring</Link></aside></div>}
  </main></StorefrontLayout>;
}