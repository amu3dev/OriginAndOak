"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Coffee,
  Gift,
} from "lucide-react";
import { useCart, getLineKey, type CartItem, type AppliedReward, type NewCartItem } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import { useDialogFocus } from "@/lib/use-dialog-focus";
import { FREE_ESPRESSO_THRESHOLD } from "@/lib/rewards";
import { stores, DEFAULT_STORE_ID } from "@/lib/stores";

const quickPairings = [
  { id: "pasty-1", price: 3.5, image: "/images/croissant.jpg" },
  { id: "pasty-3", price: 4.0, image: "/images/cinnamon-roll.jpg" },
  { id: "pasty-4", price: 2.5, image: "/images/almond-biscotti.jpg" },
];

type Translate = (key: string) => string;

function itemName(item: CartItem, t: Translate) {
  return item.nameKey ? t(item.nameKey) : item.name ?? item.id;
}

function itemOptions(item: CartItem, t: Translate) {
  return item.optionKeys?.length ? item.optionKeys.map(t).join(" • ") : item.customizations;
}

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    placeOrder,
    subtotal,
    discount,
    total,
    itemCount,
    appliedReward,
    removeReward,
    freeEspressoUnlocked,
  } = useCart();
  const { t, tf, lang } = useI18n();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout" | "success">("cart");
  const [customerName, setCustomerName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [pickupStore, setPickupStore] = useState(DEFAULT_STORE_ID);
  const [orderNumber, setOrderNumber] = useState("");
  const [earnedPoints, setEarnedPoints] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const handleClose = closeCart;

  useDialogFocus(dialogRef, { active: isOpen, onClose: closeCart, initialFocusRef: closeButtonRef });

  const handleStartCheckout = () => {
    setCheckoutStep("checkout");
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = customerName.trim();
    if (!trimmedName) {
      setNameError(true);
      return;
    }

    setNameError(false);
    setCustomerName(trimmedName);
    const generatedOrder = `OO-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(generatedOrder);
    setEarnedPoints(placeOrder());
    setCheckoutStep("success");
  };

  const amountToFreeEspresso = Math.max(0, FREE_ESPRESSO_THRESHOLD - subtotal);
  const milestoneProgress = Math.min(100, (subtotal / FREE_ESPRESSO_THRESHOLD) * 100);
  const [progressBefore, progressAfter] = t("c.freeProgress").split("{amount}");

  return (
    <AnimatePresence onExitComplete={() => setCheckoutStep("cart")}>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
            aria-hidden="true"
          />

          {/* Dialog Drawer Panel — slides from the inline-end side for both LTR & RTL */}
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-heading"
            initial={{ x: lang === "ar" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: lang === "ar" ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className={`fixed top-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-950 z-50 flex flex-col shadow-2xl ${
              lang === "ar"
                ? "left-0 border-r border-zinc-200 dark:border-zinc-800"
                : "right-0 border-l border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h2
                    id="cart-drawer-heading"
                    className="text-base font-serif font-bold text-zinc-900 dark:text-white"
                  >
                    {checkoutStep === "success"
                      ? t("c.confirmed")
                      : checkoutStep === "checkout"
                      ? t("c.checkout")
                      : t("c.cart")}
                  </h2>
                  {checkoutStep === "cart" && (
                    <p className="text-[11px] font-mono text-zinc-400 num" data-ltr>
                      {itemCount === 1 ? t("c.selOne") : tf("c.selMany", { count: itemCount })}
                    </p>
                  )}
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label={t("c.close")}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* In-Cart Reward Progress Bar */}
            {checkoutStep === "cart" && items.length > 0 && (
              <div className="bg-amber-50/70 dark:bg-amber-950/30 px-5 py-2.5 border-b border-amber-200/50 dark:border-amber-900/40">
                <div className="flex items-center justify-between text-[11px] font-medium text-amber-900 dark:text-amber-300 mb-1 gap-2">
                  <span className="flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    {amountToFreeEspresso > 0 ? (
                      <span>
                        {progressBefore}
                        <strong className="num" data-ltr>${amountToFreeEspresso.toFixed(2)}</strong>
                        {progressAfter}
                      </span>
                    ) : (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        🎉 {t("c.freeUnlocked")}
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] opacity-75 num" data-ltr>{Math.round(milestoneProgress)}%</span>
                </div>
                <div className="h-1.5 bg-amber-200/60 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${milestoneProgress}%` }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Step Views */}
            {checkoutStep === "cart" && (
              <CartReviewView
                items={items}
                appliedReward={appliedReward}
                subtotal={subtotal}
                discount={discount}
                total={total}
                freeEspressoUnlocked={freeEspressoUnlocked}
                addItem={addItem}
                removeItem={removeItem}
                updateQuantity={updateQuantity}
                clearCart={clearCart}
                removeReward={removeReward}
                onStartCheckout={handleStartCheckout}
                onClose={handleClose}
              />
            )}

            {checkoutStep === "checkout" && (
              <CheckoutFormView
                customerName={customerName}
                setCustomerName={setCustomerName}
                nameError={nameError}
                setNameError={setNameError}
                pickupStore={pickupStore}
                setPickupStore={setPickupStore}
                total={total}
                onPlaceOrder={handlePlaceOrder}
                onBack={() => setCheckoutStep("cart")}
              />
            )}

            {checkoutStep === "success" && (
              <OrderSuccessView
                customerName={customerName}
                orderNumber={orderNumber}
                earnedPoints={earnedPoints}
                onClose={handleClose}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* Sub-component: Cart Items Review */
function CartReviewView({
  items,
  appliedReward,
  subtotal,
  discount,
  total,
  freeEspressoUnlocked,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  removeReward,
  onStartCheckout,
  onClose,
}: {
  items: CartItem[];
  appliedReward: AppliedReward | null;
  subtotal: number;
  discount: number;
  total: number;
  freeEspressoUnlocked: boolean;
  addItem: (item: NewCartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  removeReward: () => void;
  onStartCheckout: () => void;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();

  return (
    <>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-3">
              <Coffee className="w-7 h-7 text-zinc-400" />
            </div>
            <p className="text-zinc-900 dark:text-white text-base font-serif font-bold">
              {t("c.emptyT")}
            </p>
            <p className="text-zinc-500 text-xs mt-1 max-w-xs leading-relaxed">
              {t("c.emptyD")}
            </p>
            <button
              onClick={onClose}
              className="mt-5 px-5 py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-medium text-xs shadow-sm hover:bg-amber-500 dark:hover:bg-amber-400 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {t("c.explore")}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2.5">
              {items.map((item) => {
                const lineKey = getLineKey(item);
                const options = itemOptions(item, t);
                return (
                <motion.div
                  key={lineKey}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-3.5 border border-zinc-200/80 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {itemName(item, t)}
                      </h3>
                      {options && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {options}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(lineKey)}
                      className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
                      aria-label={t("c.remove")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 p-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                      <button
                        onClick={() => updateQuantity(lineKey, item.quantity - 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                        aria-label={t("c.dec")}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-white w-5 text-center num" data-ltr>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(lineKey, item.quantity + 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                        aria-label={t("c.inc")}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-serif font-bold text-xs sm:text-sm text-zinc-900 dark:text-white num" data-ltr>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
                );
              })}

              {freeEspressoUnlocked && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50">
                  <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <Coffee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{t("c.freeShot")}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {t("c.freeTag")}
                  </span>
                </div>
              )}

              {appliedReward && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60">
                  <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{t(appliedReward.nameKey)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 num" data-ltr>
                      -${discount.toFixed(2)}
                    </span>
                    <button
                      onClick={removeReward}
                      className="text-zinc-400 hover:text-red-500 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
                      aria-label={t("c.removeReward")}
                      title={t("c.removeReward")}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 1-Click Pastry Carousel */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-mono font-semibold text-zinc-500 ${lang === "ar" ? "normal-case tracking-normal" : "uppercase tracking-wider"}`}>
                  {t("c.pairT")}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  {t("c.pairSub")}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {quickPairings.map((snack) => (
                  <button
                    key={snack.id}
                    onClick={() =>
                      addItem({
                        id: snack.id,
                        nameKey: `menu.${snack.id}.n`,
                        price: snack.price,
                      })
                    }
                    className="flex flex-col items-center text-center p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 hover:border-amber-500/50 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden mb-1.5 border border-zinc-200 dark:border-zinc-700">
                      <Image
                        src={snack.image}
                        alt={t(`menu.${snack.id}.n`)}
                        fill
                        sizes="40px"
                        className="object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 truncate w-full">
                      {t(`menu.${snack.id}.n`)}
                    </span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold mt-0.5 num" data-ltr>
                      +${snack.price.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {items.length > 0 && (
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>{t("c.subtotal")}</span>
              <span className="font-mono num" data-ltr>${subtotal.toFixed(2)}</span>
            </div>
            {appliedReward && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                <span>{t("c.discount")}</span>
                <span className="font-mono num" data-ltr>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline text-sm font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="font-serif">{t("c.totalDue")}</span>
              <span className="text-base font-serif text-amber-600 dark:text-amber-400 num" data-ltr>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={onStartCheckout}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-zinc-950 active:scale-98 py-3.5 rounded-full font-semibold transition-all shadow-sm cursor-pointer text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            {t("c.proceed")}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>

          <button
            onClick={clearCart}
            className="w-full text-center text-[11px] text-zinc-400 hover:text-red-500 py-1 transition-colors cursor-pointer"
          >
            {t("c.clear")}
          </button>
        </div>
      )}
    </>
  );
}

/* Sub-component: Checkout Form */
function CheckoutFormView({
  customerName,
  setCustomerName,
  nameError,
  setNameError,
  pickupStore,
  setPickupStore,
  total,
  onPlaceOrder,
  onBack,
}: {
  customerName: string;
  setCustomerName: (val: string) => void;
  nameError: boolean;
  setNameError: (value: boolean) => void;
  pickupStore: string;
  setPickupStore: (val: string) => void;
  total: number;
  onPlaceOrder: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  const { t, tf, lang } = useI18n();

  return (
    <form
      onSubmit={onPlaceOrder}
      className="flex-1 flex flex-col justify-between p-5 overflow-y-auto"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="customer-name" className={`block text-[11px] font-mono font-semibold text-zinc-500 mb-1 ${lang === "ar" ? "normal-case tracking-normal" : "uppercase tracking-wider"}`}>
            {t("c.nameL")}
          </label>
          <input
            id="customer-name"
            type="text"
            required
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              if (e.target.value.trim()) setNameError(false);
            }}
            placeholder={t("c.nameP")}
            aria-invalid={nameError}
            aria-describedby={nameError ? "checkout-name-error" : undefined}
            className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              nameError
                ? "border-red-400 dark:border-red-500"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          />
          {nameError && (
            <p id="checkout-name-error" role="alert" className="text-[11px] text-red-600 dark:text-red-400 mt-1">
              {t("c.nameRequired")}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="pickup-store" className={`block text-[11px] font-mono font-semibold text-zinc-500 mb-1 ${lang === "ar" ? "normal-case tracking-normal" : "uppercase tracking-wider"}`}>
            {t("c.storeL")}
          </label>
          <select
            id="pickup-store"
            value={pickupStore}
            onChange={(e) => setPickupStore(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {t(`${store.keyPrefix}.pickup`)}
              </option>
            ))}
          </select>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{t("c.readyInfo")}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>{t("c.pickupInfo")}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-semibold text-zinc-900 dark:text-white">
              {t("c.amountDue")}
            </span>
            <span className="text-base font-serif font-bold text-amber-600 dark:text-amber-400 num" data-ltr>
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <button
          type="submit"
          className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-zinc-950 py-3.5 rounded-full font-semibold transition-all shadow-sm cursor-pointer text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {tf("c.confirm", { total: `$${total.toFixed(2)}` })}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-xs text-zinc-400 hover:text-zinc-700 py-1 cursor-pointer"
        >
          {t("c.back")}
        </button>
      </div>
    </form>
  );
}

/* Sub-component: Success View */
function OrderSuccessView({
  customerName,
  orderNumber,
  earnedPoints,
  onClose,
}: {
  customerName: string;
  orderNumber: string;
  earnedPoints: number;
  onClose: () => void;
}) {
  const { t, tf, lang } = useI18n();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3.5"
      >
        <CheckCircle2 className="w-7 h-7" />
      </motion.div>

      <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-white">
        {t("c.successT")}
      </h3>
      <p className="text-xs text-zinc-500 mt-1">
        {tf("c.thanks", { name: customerName || t("c.friend") })}
      </p>

      <div className="my-5 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-xs space-y-1.5 text-xs" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="flex justify-between">
          <span className="text-zinc-400">{t("c.ref")}</span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400" data-ltr>
            {orderNumber}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">{t("c.ready")}</span>
          <span className="font-medium text-zinc-900 dark:text-white">{t("c.readyVal")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">{t("c.pts")}</span>
          <span className="font-bold text-amber-500 num" data-ltr>{tf("c.ptsVal", { points: earnedPoints })}</span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-medium text-xs shadow-sm hover:bg-amber-500 dark:hover:bg-amber-400 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        {t("c.done")}
      </button>
    </div>
  );
}
