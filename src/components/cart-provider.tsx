"use client";

import { createContext, use, useSyncExternalStore } from "react";
import type { CartLine } from "@/lib/cart";
import { addCartLine, clearCart, getCartSnapshot, getServerCartSnapshot, removeCartLine, setCartQuantity, subscribeCart } from "@/lib/cart-store";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (line: Omit<CartLine, "quantity">) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(line: Pick<CartLine, "productId" | "variantId">) {
  return `${line.productId}:${line.variantId}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribeCart, getCartSnapshot, getServerCartSnapshot);

  const value: CartContextValue = {
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    add: addCartLine,
    setQuantity: setCartQuantity,
    remove: removeCartLine,
    clear: clearCart,
  };

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const value = use(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}

export { lineKey };