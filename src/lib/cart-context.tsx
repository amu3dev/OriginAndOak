"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  FREE_ESPRESSO_THRESHOLD,
  POINTS_PER_DOLLAR,
  STARTING_POINTS,
  type Reward,
} from "@/lib/rewards";

export interface CartItem {
  id: string;
  price: number;
  quantity: number;
  /** Dictionary key for the item name, translated at render time. */
  nameKey?: string;
  /** Dictionary keys for the selected options, translated at render time. */
  optionKeys?: string[];
  /** Literal name for items saved before carts stored translation keys. */
  name?: string;
  /** Literal options text for items saved before carts stored translation keys. */
  customizations?: string;
}

export type NewCartItem = Omit<CartItem, "quantity">;

export interface AppliedReward {
  id: string;
  nameKey: string;
  discount: number;
  /** Points spent on this reward, refunded if it is removed before checkout. */
  points: number;
}

interface CartState {
  items: CartItem[];
  appliedReward: AppliedReward | null;
  points: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: NewCartItem, quantity?: number) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: () => number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  points: number;
  appliedReward: AppliedReward | null;
  applyReward: (reward: Reward) => boolean;
  removeReward: () => void;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  freeEspressoUnlocked: boolean;
}

/**
 * Identifies a cart line. Two adds of the same product with the same options
 * share a line; anything else gets its own. Independent of the UI language.
 */
export function getLineKey(item: Pick<CartItem, "id" | "optionKeys" | "customizations">) {
  return [item.id, ...(item.optionKeys ?? []), item.customizations ?? ""].join("|");
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "origin_and_oak_cart_v2";
const LEGACY_CART_STORAGE_KEY = "brew_and_bean_cart_v1";
const MENU_ITEM_ID = /^(espresso|cold|spec|pasty)-\d+$/;

const EMPTY_STATE: CartState = { items: [], appliedReward: null, points: STARTING_POINTS };

let cartSnapshot: CartState = EMPTY_STATE;
let cartLoaded = false;
const cartListeners = new Set<() => void>();

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.id === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    (typeof item.nameKey === "string" || typeof item.name === "string") &&
    (item.optionKeys === undefined ||
      (Array.isArray(item.optionKeys) && item.optionKeys.every((k) => typeof k === "string"))) &&
    (item.customizations === undefined || typeof item.customizations === "string")
  );
}

function isAppliedReward(value: unknown): value is AppliedReward {
  if (typeof value !== "object" || value === null) return false;
  const reward = value as Partial<AppliedReward>;
  return (
    typeof reward.id === "string" &&
    typeof reward.nameKey === "string" &&
    typeof reward.discount === "number" &&
    Number.isFinite(reward.discount) &&
    typeof reward.points === "number" &&
    Number.isInteger(reward.points)
  );
}

/** Carts saved before v2 stored translated text; recover keys where the id allows it. */
function migrateLegacyItem(item: CartItem): CartItem {
  if (item.nameKey || !MENU_ITEM_ID.test(item.id) || item.customizations) return item;
  return { id: item.id, price: item.price, quantity: item.quantity, nameKey: `menu.${item.id}.n` };
}

function readStoredCart(): CartState {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<CartState> | null;
      if (typeof parsed !== "object" || parsed === null) return EMPTY_STATE;
      return {
        items: Array.isArray(parsed.items) ? parsed.items.filter(isCartItem) : [],
        appliedReward: isAppliedReward(parsed.appliedReward) ? parsed.appliedReward : null,
        points:
          typeof parsed.points === "number" && Number.isInteger(parsed.points) && parsed.points >= 0
            ? parsed.points
            : STARTING_POINTS,
      };
    }

    const legacy = localStorage.getItem(LEGACY_CART_STORAGE_KEY);
    if (!legacy) return EMPTY_STATE;
    const parsed: unknown = JSON.parse(legacy);
    return {
      ...EMPTY_STATE,
      items: Array.isArray(parsed) ? parsed.filter(isCartItem).map(migrateLegacyItem) : [],
    };
  } catch (e) {
    console.error("Failed to load cart from localStorage", e);
    return EMPTY_STATE;
  }
}

function notifyCartListeners() {
  cartListeners.forEach((listener) => listener());
}

function getCartSnapshot(): CartState {
  if (typeof window === "undefined") return EMPTY_STATE;
  if (!cartLoaded) {
    cartSnapshot = readStoredCart();
    cartLoaded = true;
  }
  return cartSnapshot;
}

function getServerCartSnapshot(): CartState {
  return EMPTY_STATE;
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

function updateCartSnapshot(next: Partial<CartState>) {
  cartSnapshot = { ...getCartSnapshot(), ...next };
  cartLoaded = true;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartSnapshot));
    localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to save cart to localStorage", e);
  }
  notifyCartListeners();
}

function computeTotals({ items, appliedReward }: CartState) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedReward ? Math.min(appliedReward.discount, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot
  );
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback((item: NewCartItem, quantity = 1) => {
    const prev = getCartSnapshot().items;
    const lineKey = getLineKey(item);
    const existing = prev.find((i) => getLineKey(i) === lineKey);
    const items = existing
      ? prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + quantity } : i
        )
      : [...prev, { ...item, quantity }];
    updateCartSnapshot({ items });
  }, []);

  const removeItem = useCallback((lineKey: string) => {
    updateCartSnapshot({
      items: getCartSnapshot().items.filter((i) => getLineKey(i) !== lineKey),
    });
  }, []);

  const updateQuantity = useCallback((lineKey: string, quantity: number) => {
    const prev = getCartSnapshot().items;
    const items = quantity <= 0
      ? prev.filter((i) => getLineKey(i) !== lineKey)
      : prev.map((i) => (getLineKey(i) === lineKey ? { ...i, quantity } : i));
    updateCartSnapshot({ items });
  }, []);

  const clearCart = useCallback(() => {
    const { appliedReward, points } = getCartSnapshot();
    updateCartSnapshot({
      items: [],
      appliedReward: null,
      points: points + (appliedReward?.points ?? 0),
    });
  }, []);

  /** Empties the cart, consumes any applied reward, and returns the points earned. */
  const placeOrder = useCallback(() => {
    const current = getCartSnapshot();
    const earned = Math.floor(computeTotals(current).total * POINTS_PER_DOLLAR);
    updateCartSnapshot({
      items: [],
      appliedReward: null,
      points: current.points + earned,
    });
    return earned;
  }, []);

  const applyReward = useCallback((reward: Reward) => {
    const { appliedReward, points } = getCartSnapshot();
    if (appliedReward?.id === reward.id) return true;
    // Swapping rewards refunds the one being replaced.
    const available = points + (appliedReward?.points ?? 0);
    if (available < reward.points) return false;
    updateCartSnapshot({
      appliedReward: {
        id: reward.id,
        nameKey: reward.nameKey,
        discount: reward.discountValue,
        points: reward.points,
      },
      points: available - reward.points,
    });
    return true;
  }, []);

  const removeReward = useCallback(() => {
    const { appliedReward, points } = getCartSnapshot();
    if (!appliedReward) return;
    updateCartSnapshot({ appliedReward: null, points: points + appliedReward.points });
  }, []);

  const { subtotal, discount, total } = computeTotals(state);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        placeOrder,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        points: state.points,
        appliedReward: state.appliedReward,
        applyReward,
        removeReward,
        subtotal,
        discount,
        total,
        itemCount,
        freeEspressoUnlocked: subtotal >= FREE_ESPRESSO_THRESHOLD,
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
