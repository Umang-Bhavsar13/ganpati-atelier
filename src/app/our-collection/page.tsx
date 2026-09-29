import { Suspense } from "react";
import { CollectionPage } from "@/components/collection-page";

export const metadata = { title: "The Collection" };

export default function OurCollection() {
  return <Suspense fallback={<div className="page-wait">Gathering the collection…</div>}><CollectionPage /></Suspense>;
}