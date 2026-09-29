"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { StorefrontLayout } from "@/components/storefront-frame";
import { formatPrice } from "@/lib/cart";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  height: string;
  imageUrl: string;
  gallery: string[];
  attributes: Record<string, string>;
  category: { name: string };
  variants: { id: string; name: string; colorHex: string; imageUrl?: string | null; stock: number }[];
};

export function ProductDetailPage({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selected, setSelected] = useState<Product["variants"][number] | null>(null);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    fetch(`/api/products/${encodeURIComponent(slug)}`).then(async (response) => {
      if (!response.ok) throw new Error("Product not found");
      const item = await response.json() as Product;
      setProduct(item);
      setSelected(item.variants.find((variant) => variant.stock > 0) ?? item.variants[0] ?? null);
      setActiveImage(item.imageUrl);
    }).catch(() => setProduct(null));
  }, [slug]);

  if (!product) return <StorefrontLayout><main className="empty-state detail-loading"><span className="overline">A moment, please</span><h1>Finding this piece.</h1><p>If it isn’t here, it may have found a new home.</p><Link href="/our-collection" className="button button-dark">Back to the collection <ArrowLeft size={16} /></Link></main></StorefrontLayout>;

  const available = selected ? selected.stock > 0 : product.stock > 0;
  const image = selected?.imageUrl ?? activeImage;

  return <StorefrontLayout>
    <main className="detail-page"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/our-collection">The collection</Link><span>/</span><span>{product.name}</span></div>
      <div className="detail-layout">
        <div className="detail-gallery"><div className="detail-main-image"><Image src={image} alt={product.name} fill priority sizes="(max-width: 760px) 100vw, 58vw" unoptimized /></div><div className="detail-image-caption"><span>THE {product.category.name.toUpperCase()} EDITION</span><span>HAND-FINISHED IN INDIA</span></div>{product.gallery.length > 0 && <div className="detail-thumbnails">{[product.imageUrl, ...product.gallery].map((src, index) => <button key={`${src}-${index}`} onClick={() => setActiveImage(src)} aria-label={`View image ${index + 1}`} className={activeImage === src ? "thumb-active" : ""}><Image src={src} alt="" fill sizes="90px" unoptimized /></button>)}</div>}</div>
        <div className="detail-info"><span className="overline">{product.category.name}{product.height ? ` · ${product.height}` : ""}</span><h1>{product.name}</h1><div className="detail-price">{formatPrice(product.price)} <span>INCLUSIVE OF TAXES</span></div><div className="detail-rule" />
          <p className="detail-description">{product.description || "A considered form, finished with care. Made to bring a little more meaning to your home."}</p>
          {product.variants.length > 0 && <div className="variant-select"><div className="variant-label"><span>Choose a finish</span><span>{selected?.name ?? "Select one"}</span></div><div className="variant-options">{product.variants.map((variant) => <button key={variant.id} type="button" title={`${variant.name}${variant.stock === 0 ? " — unavailable" : ""}`} onClick={() => { setSelected(variant); if (variant.imageUrl) setActiveImage(variant.imageUrl); }} className={`${selected?.id === variant.id ? "variant-selected" : ""} ${variant.stock === 0 ? "variant-soldout" : ""}`}><i style={{ background: variant.colorHex }} /><span>{variant.name}</span>{variant.stock === 0 && <small>Sold out</small>}</button>)}</div></div>}
          <div className="quantity-and-stock"><div className="quantity-stepper"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={14} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity(Math.min(selected?.stock ?? product.stock, quantity + 1))} aria-label="Increase quantity"><Plus size={14} /></button></div><span className={available ? "stock-live" : "stock-out"}><i />{available ? "Ready to be yours" : "Currently unavailable"}</span></div>
          <button className="button button-dark add-button" disabled={!available} onClick={() => { add({ productId: product.id, slug: product.slug, name: product.name, imageUrl: image, price: product.price, variantId: selected?.id ?? "", variantName: selected?.name ?? "", colorHex: selected?.colorHex, stock: selected?.stock ?? product.stock }); setAdded(true); window.setTimeout(() => setAdded(false), 2200); }}>{added ? <><Check size={17} /> Added to your bag</> : <>Add to bag <span>{formatPrice(product.price)}</span></>}</button>
          <div className="detail-promises"><div><Truck size={17} /><span>Carefully packed & delivered</span></div><div><ShieldCheck size={17} /><span>Made to order with care</span></div></div>
          <div className="detail-attributes"><h2>Considered details</h2>{product.height && <div><span>Height</span><b>{product.height}</b></div>}{Object.entries(product.attributes).map(([key, value]) => <div key={key}><span>{key}</span><b>{value}</b></div>)}<div><span>Category</span><b>{product.category.name}</b></div></div>
          <Link href="/contact" className="detail-help">Need a little help choosing? <span>Talk to the studio <ArrowUpRight size={15} /></span></Link>
        </div>
      </div>
    </main>
  </StorefrontLayout>;
}