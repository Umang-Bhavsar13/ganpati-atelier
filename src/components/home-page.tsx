"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Flower2, PackageCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { StorefrontLayout } from "@/components/storefront-frame";

type HomeData = {
  brand: { name: string; tagline: string };
  hero: { eyebrow: string; heading: string; description: string; imageUrl: string; cta: string };
  contact: { address?: string };
  categories: { id: string; name: string; slug: string }[];
  products: ProductCardData[];
  sections: { id: string; type: string; heading: string; description: string; imageUrl: string; productIds: string; sortOrder: number }[];
};

export function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/home").then(async (response) => {
      if (!response.ok) throw new Error("Could not load studio content");
      const result = await response.json();
      setData(result);
    }).catch(() => setError(true));
  }, []);

  const hero = data?.hero;
  const featured = data?.products.filter((product) => product.featured).slice(0, 4) ?? [];
  const featuredSection = data?.sections.find((section) => section.type === "featured");
  const storySection = data?.sections.find((section) => section.type === "story");
  const categorySection = data?.sections.find((section) => section.type === "categories");
  const closingSection = data?.sections.find((section) => section.type === "closing");
  const promotionSections = data?.sections.filter(
    (section) => !["featured", "story", "categories", "closing"].includes(section.type),
  ) ?? [];

  return <StorefrontLayout contact={data?.contact}>
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="overline"><i />{hero?.eyebrow}</span>
          <h1>{hero?.heading.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
          <p>{hero?.description}</p>
          <Link href="/our-collection" className="button button-dark">{hero?.cta}<ArrowUpRight size={17} /></Link>
          <div className="hero-note"><span className="note-symbol">✳</span><span>Rooted in tradition<br /><b>Made for your everyday.</b></span></div>
          <a className="hero-scroll" href="#the-collection"><ArrowDown size={15} /> Scroll to discover</a>
        </div>
        <div className="hero-art">
          <div className="hero-image">{hero?.imageUrl && <Image src={hero.imageUrl} alt={hero.heading.replaceAll("\n", " ")} fill priority sizes="(max-width: 760px) 100vw, 55vw" unoptimized />}</div>
          <div className="hero-art-caption"><span>01 / 04</span><span>THE DASHBOARD EDITION</span><span>EST. WITH DEVOTION</span></div>
          <div className="hero-stamp"><span>MADE WITH<br />MEANING</span><Flower2 size={28} strokeWidth={1.1} /></div>
        </div>
        <div className="hero-index">01 — THE BEGINNING</div>
      </section>

      <section className="promise-strip" aria-label="Studio values">
        <div><Sparkles size={17} /><span>Finished by hand</span></div><i />
        <div><Flower2 size={17} /><span>Made for your home</span></div><i />
        <div><PackageCheck size={17} /><span>Packed with care</span></div>
      </section>

      <section className="section-block product-section" id="the-collection">
        <div className="section-heading"><div><span className="overline">A considered collection</span><h2>{featuredSection?.heading ?? "Meet your new favourite."}</h2><p>{featuredSection?.description ?? "A few forms we return to, year after year."}</p></div><Link href="/our-collection" className="text-link">View all pieces <ArrowUpRight size={16} /></Link></div>
        {error ? <div className="inline-notice">The collection is taking a moment to arrive. Please refresh shortly.</div> : featured.length ? <div className="product-grid">{featured.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="loading-products"><span /><span /><span /><span /></div>}
      </section>

      {categorySection && data?.categories.length ? <section className="category-band"><div className="category-intro"><span className="overline">Find your form</span><h2>{categorySection.heading}</h2><p>{categorySection.description}</p><Link href="/our-collection" className="text-link">Explore every piece <ArrowUpRight size={16} /></Link></div><div className="category-list">{data.categories.map((category, index) => <Link href={`/our-collection?category=${category.slug}`} key={category.id} className="category-row"><span className="category-index">0{index + 1}</span><span className="category-name">{category.name}</span><span className="category-note">Explore the edit</span><ArrowUpRight size={18} /></Link>)}</div></section> : null}

      {storySection && <section className="story-band"><div className="story-image">{storySection.imageUrl && <Image src={storySection.imageUrl} alt="A Ganpati idol being displayed with care" fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized />}</div><div className="story-copy"><span className="overline">A note from the atelier</span><h2>{storySection.heading}</h2><p>{storySection.description}</p><Link href="/contact" className="text-link">A little about us <ArrowUpRight size={16} /></Link><span className="story-decoration">श्री</span></div></section>}

      {promotionSections.map((section) => <section className="cms-promo-section" key={section.id}>{section.imageUrl && <div className="cms-promo-image"><Image src={section.imageUrl} alt={section.heading} fill sizes="(max-width: 760px) 100vw, 40vw" unoptimized /></div>}<div><span className="overline">{section.type}</span><h2>{section.heading}</h2><p>{section.description}</p><Link href="/our-collection" className="text-link">Explore the collection <ArrowUpRight size={16} /></Link></div></section>)}

      {closingSection && <section className="closing-banner"><span className="overline">{closingSection.description}</span><h2>{closingSection.heading}</h2><Link href="/our-collection" className="button button-light">Explore the collection <ArrowUpRight size={17} /></Link></section>}
    </main>
  </StorefrontLayout>;
}