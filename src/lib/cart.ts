export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
  variantId: string;
  variantName: string;
  colorHex?: string;
  quantity: number;
  stock: number;
};

export const CART_STORAGE_KEY = "morya-house-cart";

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((line): line is CartLine =>
      Boolean(line && typeof line.productId === "string" && typeof line.name === "string" && typeof line.price === "number" && typeof line.quantity === "number"),
    );
  } catch {
    return [];
  }
}

export function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
}