"use client";

import { ArrowUpRight, Camera, Check, Clock3, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { StorefrontLayout } from "@/components/storefront-frame";

type Contact = { businessName?: string; phone?: string; whatsapp?: string; email?: string; address?: string; mapsUrl?: string; instagram?: string; hours?: string };

export function ContactPage() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => { fetch("/api/home").then((response) => response.json()).then((data) => setContact(data.contact)).catch(() => undefined); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => null);
    if (!response?.ok) setMessage("We couldn't send that just now. Please try again or write to the studio directly.");
    else { setSent(true); event.currentTarget.reset(); }
    setSending(false);
  }

  return <StorefrontLayout contact={contact}><main className="contact-page"><div className="contact-heading"><span className="overline">A real person, at the other end</span><h1>Come say<br /><em>hello.</em></h1><p>Choosing a murti is personal. Tell us what you&apos;re looking for, and we&apos;ll help you find the right one.</p></div><div className="contact-layout"><section className="contact-details"><span className="overline">The studio</span><h2>{contact?.businessName ?? "Morya House"}</h2>{contact?.address && <div className="contact-detail"><MapPin size={18} /><span>{contact.address}{contact.mapsUrl && <a href={contact.mapsUrl} target="_blank" rel="noreferrer">Find us on the map <ArrowUpRight size={14} /></a>}</span></div>}{contact?.phone && <div className="contact-detail"><Phone size={18} /><a href={`tel:${contact.phone}`}>{contact.phone}</a></div>}{contact?.whatsapp && <div className="contact-detail"><MessageCircle size={18} /><a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">Write to us on WhatsApp <ArrowUpRight size={14} /></a></div>}{contact?.email && <div className="contact-detail"><Send size={18} /><a href={`mailto:${contact.email}`}>{contact.email}</a></div>}{contact?.hours && <div className="contact-detail"><Clock3 size={18} /><span>{contact.hours}</span></div>}{contact?.instagram && <a className="instagram-link" href={contact.instagram} target="_blank" rel="noreferrer"><Camera size={17} /> Follow along <ArrowUpRight size={14} /></a>}<span className="contact-script">आम्ही आपले स्वागत करतो</span></section><form className="contact-form" onSubmit={submit}><span className="overline">Leave a note</span><h2>How can we help?</h2><label>Your name<input name="name" required minLength={2} maxLength={100} placeholder="Name" /></label><label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label><label>Phone number <span className="field-optional">Optional</span><input name="phone" type="tel" maxLength={30} placeholder="+91" /></label><label>Your message<textarea name="message" required minLength={10} maxLength={2000} rows={4} placeholder="Tell us a little about what you have in mind…" /></label>{message && <p className="form-error" role="alert">{message}</p>}{sent && <p className="form-success"><Check size={16} /> Your note is with the studio. We&apos;ll be in touch.</p>}<button className="button button-dark" disabled={sending}>{sending ? "Sending…" : <>Send your note <ArrowUpRight size={16} /></>}</button></form></div></main></StorefrontLayout>;
}