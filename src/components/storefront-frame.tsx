"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";

type Brand = { name?: string; tagline?: string };
type Contact = { phone?: string; email?: string; address?: string; instagram?: string; hours?: string };
type FooterContent = { note?: string; copyright?: string; location?: string; deliveryNote?: string };
type ImageCredits = { artist: string; license: string; url: string }[];

export function StorefrontHeader() {
  const { count } = useCart();
  const [brand, setBrand] = useState<Brand>({});
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/home").then((response) => response.ok ? response.json() : null).then((data) => {
      if (data?.brand) setBrand(data.brand);
    }).catch(() => undefined);
  }, []);

  const links = [
    { href: "/our-collection", label: "The collection" },
    { href: "/contact", label: "Our studio" },
  ];

  return <>
    <div className="announcement">Complimentary delivery on orders over ₹3,000 <span>•</span> Made to be kept close</div>
    <header className="site-header">
      <button className="icon-button mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      <Link href="/" className="brand-lockup" aria-label={`${brand.name} home`}>
        <span className="brand-mark">m</span><span><strong>{brand.name}</strong><small>ATELIER OF AUSPICIOUSNESS</small></span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>
      <Link href="/cart" className="cart-link"><ShoppingBag size={19} strokeWidth={1.6} /><span>Bag</span><i>{count}</i></Link>
    </header>
    {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{links.map((link) => <Link onClick={() => setMenuOpen(false)} href={link.href} key={link.href}>{link.label}<ArrowUpRight size={16} /></Link>)}</nav>}
  </>;
}

export function StorefrontFooter({ contact }: { contact?: Contact | null }) {
  const [brand, setBrand] = useState<Brand>({});
  const [footer, setFooter] = useState<FooterContent>({});
  const [imageCredits, setImageCredits] = useState<ImageCredits>([]);

  useEffect(() => {
    fetch("/api/home").then((response) => response.ok ? response.json() : null).then((data) => {
      if (data?.brand) setBrand(data.brand);
      if (data?.footer) setFooter(data.footer);
      if (data?.imageAttribution?.images) setImageCredits(data.imageAttribution.images);
    }).catch(() => undefined);
  }, []);

  return <footer className="site-footer">
    <div className="footer-main">
      <div className="footer-brand"><span className="brand-mark">m</span><h2>{brand.name}</h2><p>{footer.note}</p></div>
      <div className="footer-column"><span className="overline">Explore</span><Link href="/our-collection">The collection</Link><Link href="/contact">Our studio</Link><Link href="/admin">Studio login <ArrowUpRight size={13} /></Link></div>
      <div className="footer-column"><span className="overline">Visit or write</span>{contact?.address && <p>{contact.address}</p>}{contact?.phone && <a href={`tel:${contact.phone}`}>{contact.phone}</a>}{contact?.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}{contact?.hours && <p>{contact.hours}</p>}{contact?.instagram && <a href={contact.instagram} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={13} /></a>}</div>
      <div className="footer-note"><span className="overline">A note from the studio</span><p>{brand.tagline}</p><Link href="/our-collection" className="text-link">Find your murti <ArrowUpRight size={16} /></Link></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} {footer.copyright}</span><span>{footer.location}</span><span>{footer.deliveryNote}</span><span className="image-credits">Prototype image credits: {imageCredits.map((credit, index) => <span key={credit.url}><a href={credit.url} target="_blank" rel="noreferrer">{credit.artist}</a> ({credit.license}){index < imageCredits.length - 1 ? ", " : ""}</span>)}</span></div>
  </footer>;
}

export function StorefrontLayout({ children, contact }: { children: React.ReactNode; contact?: Contact | null }) {
  return <><StorefrontHeader />{children}<StorefrontFooter contact={contact} /></>;
}