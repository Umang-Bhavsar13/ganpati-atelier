import { CART_STORAGE_KEY, type CartLine, readCart } from "@/lib/cart";

const emptyCart: CartLine[] = [];
let snapshot: CartLine[] | undefined;
const listeners = new Set<() => void>();

function publish(lines: CartLine[]) {
  snapshot = lines;
  if (typeof window !== "undefined") localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  listeners.forEach((listener) => listener());
}

function syncStorage(event: StorageEvent) {
  if (event.key === CART_STORAGE_KEY) {
    snapshot = readCart();
    listeners.forEach((listener) => listener());
  }
}

export function subscribeCart(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    if (snapshot === undefined) {
      snapshot = readCart();
      queueMicrotask(() => listeners.forEach((subscribed) => subscribed()));
    }
    if (listeners.size === 1) window.addEventListener("storage", syncStorage);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") window.removeEventListener("storage", syncStorage);
  };
}

export function getCartSnapshot() {
  return snapshot ?? emptyCart;
}

export function getServerCartSnapshot() {
  return emptyCart;
}

export function addCartLine(line: Omit<CartLine, "quantity">) {
  const current = getCartSnapshot();
  const key = `${line.productId}:${line.variantId}`;
  const found = current.find((item) => `${item.productId}:${item.variantId}` === key);
  if (found) publish(current.map((item) => `${item.productId}:${item.variantId}` === key ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) } : item));
  else publish([...current, { ...line, quantity: 1 }]);
}

export function setCartQuantity(key: string, quantity: number) {
  publish(getCartSnapshot().map((item) => `${item.productId}:${item.variantId}` === key ? { ...item, quantity: Math.min(Math.max(quantity, 1), item.stock) } : item));
}

export function removeCartLine(key: string) {
  publish(getCartSnapshot().filter((item) => `${item.productId}:${item.variantId}` !== key));
}

export function clearCart() {
  publish([]);
}