"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string;
  isReward?: boolean;
}

export interface AppliedReward {
  id: string;
  name: string;
  discount: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  appliedReward: AppliedReward | null;
  applyReward: (reward: AppliedReward) => void;
  removeReward: () => void;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "brew_and_bean_cart_v1";
const EMPTY_CART: CartItem[] = [];

let cartSnapshot: CartItem[] = EMPTY_CART;
let cartLoaded = false;
const cartListeners = new Set<() => void>();

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    (item.customizations === undefined || typeof item.customizations === "string") &&
    (item.isReward === undefined || typeof item.isReward === "boolean")
  );
}

function readStoredCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (!saved) return EMPTY_CART;

    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : EMPTY_CART;
  } catch (e) {
    console.error("Failed to load cart from localStorage", e);
    return EMPTY_CART;
  }
}

function notifyCartListeners() {
  cartListeners.forEach((listener) => listener());
}

function getCartSnapshot(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;
  if (!cartLoaded) {
    cartSnapshot = readStoredCart();
    cartLoaded = true;
  }
  return cartSnapshot;
}

function getServerCartSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function subscribeToCart(callback: () => void) {
  cartListeners.add(callback);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== CART_STORAGE_KEY) return;
    cartSnapshot = readStoredCart();
    cartLoaded = true;
    notifyCartListeners();
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    cartListeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function updateCartSnapshot(next: CartItem[]) {
  cartSnapshot = next;
  cartLoaded = true;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.error("Failed to save cart to localStorage", e);
  }
  notifyCartListeners();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot
  );
  const [isOpen, setIsOpen] = useState(false);
  const [appliedReward, setAppliedReward] = useState<AppliedReward | null>(null);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    const prev = getCartSnapshot();
    const existing = prev.find(
      (i) => i.id === item.id && i.customizations === item.customizations
    );
    const next = existing
      ? prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        )
      : [...prev, { ...item, quantity: 1 }];
    updateCartSnapshot(next);
  }, []);

  const removeItem = useCallback((id: string) => {
    updateCartSnapshot(getCartSnapshot().filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const prev = getCartSnapshot();
    const next = quantity <= 0
      ? prev.filter((i) => i.id !== id)
      : prev.map((i) => (i.id === id ? { ...i, quantity } : i));
    updateCartSnapshot(next);
  }, []);

  const clearCart = useCallback(() => {
    updateCartSnapshot(EMPTY_CART);
    setAppliedReward(null);
  }, []);

  const applyReward = useCallback((reward: AppliedReward) => {
    setAppliedReward(reward);
  }, []);

  const removeReward = useCallback(() => {
    setAppliedReward(null);
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = appliedReward ? Math.min(appliedReward.discount, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        appliedReward,
        applyReward,
        removeReward,
        subtotal,
        discount,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
