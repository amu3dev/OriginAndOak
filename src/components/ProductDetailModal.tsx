"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useIsPresent } from "framer-motion";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, Sparkles, Check, Flame, Compass } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import { useDialogFocus } from "@/lib/use-dialog-focus";

export interface ProductDetail {
  id: string;
  nameKey: string;
  descriptionKey: string;
  price: number;
  image: string;
  tags?: string[];
  /** Options added to the cart with the product, so it matches its quick-add line. */
  optionKeys?: string[];
  originKey?: string;
  roastKey?: string;
}

interface ProductDetailModalProps {
  product: ProductDetail | null;
  onClose: () => void;
}

function ProductDetailDialog({ product, onClose }: { product: ProductDetail; onClose: () => void }) {
  const { addItem, openCart } = useCart();
  const { t, tf } = useI18n();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isPresent = useIsPresent();
  const name = t(product.nameKey);

  useDialogFocus(dialogRef, { active: isPresent, onClose, initialFocusRef: closeButtonRef });

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        nameKey: product.nameKey,
        optionKeys: product.optionKeys,
        price: product.price,
      },
      quantity
    );
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
      openCart();
    }, 600);
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog Panel */}
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-10 my-auto"
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 shadow-md"
          aria-label={t("p.close")}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid sm:grid-cols-2">
          {/* Left: High-Res Enlarged Photography */}
          <div className="relative h-64 sm:h-auto min-h-[280px] bg-zinc-950 overflow-hidden group">
            <Image
              src={product.image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, 360px"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Badges on image */}
            {product.tags && product.tags.length > 0 && (
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5 z-10">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-500/90 text-zinc-950 shadow-sm backdrop-blur-xs"
                  >
                    {t(`tag.${tag}`) || tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Narrative, Tasting Notes & Actions */}
          <div className="p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t("p.kicker")}</span>
              </div>

              <h3
                id="product-detail-title"
                className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-100"
              >
                {name}
              </h3>

              <div className="text-xl font-serif font-bold text-amber-600 dark:text-amber-400 mt-1 num" data-ltr>
                ${product.price.toFixed(2)}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
                {t(product.descriptionKey)}
              </p>

              {/* Artisan Specs (Origin & Roast) */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    <strong className="text-zinc-900 dark:text-zinc-100">{t("p.origin")}</strong>{" "}
                    {t(product.originKey ?? "p.originDefault")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    <strong className="text-zinc-900 dark:text-zinc-100">{t("p.roast")}</strong>{" "}
                    {t(product.roastKey ?? "p.roastDefault")}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Stepper & Add Button */}
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                  {t("p.qty")}
                </span>
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                    aria-label={t("p.dec")}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white w-6 text-center num" data-ltr>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                    aria-label={t("p.inc")}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-md ${
                  isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-zinc-950"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t("b.added")}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{tf("hero.fAdd", { price: `$${totalPrice.toFixed(2)}` })}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  return (
    <AnimatePresence>
      {product && (
        <ProductDetailDialog
          key={product.id}
          product={product}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}
