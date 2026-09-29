"use client";

import Link from "next/link";
import { ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { StorefrontLayout } from "@/components/storefront-frame";
import { useSearchParams } from "next/navigation";

type Category = { id: string; name: string; slug: string };

export function CollectionPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState(() => searchParams.get("category") ?? "all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams();
    if (category !== "all") query.set("category", category);
    if (sort !== "newest") query.set("sort", sort);
    Promise.all([fetch(`/api/products?${query.toString()}`).then((response) => response.json()), fetch("/api/home").then((response) => response.json())])
      .then(([list, home]) => { setProducts(list); setCategories(home.categories ?? []); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, sort]);

  return <StorefrontLayout>
    <main className="collection-page">
      <div className="collection-masthead"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>The collection</span></div><span className="overline">Forms for auspicious beginnings</span><h1>The collection<span>.</span></h1><p>Hand-finished idols, chosen for the spaces we make our own.</p><div className="collection-count">{products.length.toString().padStart(2, "0")} PIECES <span>·</span> {categories.map((item) => item.name).join(" / ")}</div></div>
      <div className="collection-toolbar"><div className="filter-group"><SlidersHorizontal size={16} /><span>Filter by</span><button onClick={() => setCategory("all")} className={category === "all" ? "filter-active" : ""}>All pieces</button>{categories.map((item) => <button key={item.id} onClick={() => setCategory(item.slug)} className={category === item.slug ? "filter-active" : ""}>{item.name}</button>)}</div><label className="sort-label">Sort <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Recently added</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
      {loading ? <div className="loading-products collection-loading"><span /><span /><span /><span /></div> : products.length ? <div className="product-grid collection-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="empty-state"><span className="overline">Nothing here just yet</span><h2>A quieter shelf, for now.</h2><p>Try another category or come back soon for new pieces.</p><button className="button button-dark" onClick={() => setCategory("all")}>See all pieces <ArrowUpRight size={16} /></button></div>}
    </main>
  </StorefrontLayout>;
}