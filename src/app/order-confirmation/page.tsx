import { Suspense } from "react";
import { ConfirmationPage } from "@/components/confirmation-page";

export const metadata = { title: "Order Confirmation" };

export default function OrderConfirmation() {
  return <Suspense fallback={<div className="page-wait">Confirming your order…</div>}><ConfirmationPage /></Suspense>;
}