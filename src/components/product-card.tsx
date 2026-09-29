import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatPrice } from "@/lib/cart";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  height: string;
  imageUrl: string;
  featured: boolean;
  category: { name: string };
  variants: { id: string; name: string; colorHex: string; stock: number }[];
};

export function ProductCard({ product, index = 0 }: { product: ProductCardData; index?: number }) {
  const available = product.stock > 0 || product.variants.some((variant) => variant.stock > 0);
  return <article className="product-card" style={{ animationDelay: `${index * 70}ms` }}>
    <Link href={`/products/${product.slug}`} className="product-image-wrap">
      <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" className="product-image" unoptimized />
      {product.featured && <span className="product-flag">Studio favourite</span>}
      {!available && <span className="product-availability">Made to order</span>}
      <span className="product-view" aria-hidden="true"><ArrowUpRight size={18} /></span>
    </Link>
    <div className="product-card-copy"><div><span className="product-category">{product.category.name}{product.height ? ` · ${product.height}` : ""}</span><Link href={`/products/${product.slug}`} className="product-name">{product.name}</Link></div><span className="product-price">{formatPrice(product.price)}</span></div>
    <div className="swatch-row" aria-label={`${product.variants.length} available finishes`}>
      {product.variants.slice(0, 5).map((variant) => <i key={variant.id} style={{ backgroundColor: variant.colorHex }} title={variant.name} />)}
      {product.variants.length > 0 && <span>{product.variants.length} finishes</span>}
    </div>
  </article>;
}