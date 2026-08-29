"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { Check, ShoppingCart, Sliders } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";

type DrinkType = "latte" | "cappuccino" | "americano" | "cold-brew";

interface Option {
  id: string;
  labelKey: string;
  emoji: string;
  price: number;
}

const drinkTypes: { id: DrinkType; labelKey: string; image: string; basePrice: number; defaultProfile: { intensity: number; sweetness: number; creaminess: number } }[] = [
  { id: "latte", labelKey: "drink.latte", image: "/images/hero-latte.jpg", basePrice: 4.5, defaultProfile: { intensity: 60, sweetness: 40, creaminess: 85 } },
  { id: "cappuccino", labelKey: "drink.cappuccino", image: "/images/cappuccino.jpg", basePrice: 4.5, defaultProfile: { intensity: 75, sweetness: 30, creaminess: 70 } },
  { id: "americano", labelKey: "drink.americano", image: "/images/espresso.jpg", basePrice: 3.5, defaultProfile: { intensity: 85, sweetness: 10, creaminess: 10 } },
  { id: "cold-brew", labelKey: "drink.coldBrew", image: "/images/cold-brew.jpg", basePrice: 4.0, defaultProfile: { intensity: 80, sweetness: 20, creaminess: 15 } },
];

const sizes: Option[] = [
  { id: "small", labelKey: "size.small", emoji: "🥤", price: 0 },
  { id: "medium", labelKey: "size.medium", emoji: "🥤", price: 0.75 },
  { id: "large", labelKey: "size.large", emoji: "🥤", price: 1.25 },
];

const milks: Option[] = [
  { id: "whole", labelKey: "milk.whole", emoji: "🥛", price: 0 },
  { id: "oat", labelKey: "milk.oat", emoji: "🌾", price: 0.6 },
  { id: "almond", labelKey: "milk.almond", emoji: "🥜", price: 0.6 },
  { id: "soy", labelKey: "milk.soy", emoji: "🫘", price: 0.5 },
  { id: "coconut", labelKey: "milk.coconut", emoji: "🥥", price: 0.6 },
];

const extras: Option[] = [
  { id: "vanilla", labelKey: "ex.vanilla", emoji: "🍦", price: 0.5 },
  { id: "caramel", labelKey: "ex.caramel", emoji: "🍯", price: 0.75 },
  { id: "hazelnut", labelKey: "ex.hazelnut", emoji: "🌰", price: 0.5 },
  { id: "cinnamon", labelKey: "ex.cinnamon", emoji: "🫚", price: 0.25 },
  { id: "whipped", labelKey: "ex.whipped", emoji: "🍦", price: 0.5 },
  { id: "extra-shot", labelKey: "ex.extraShot", emoji: "☕", price: 1.0 },
];

export default function CustomDrinkBuilder() {
  const [drink, setDrink] = useState<DrinkType>("latte");
  const [size, setSize] = useState("medium");
  const [milk, setMilk] = useState("whole");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem, openCart } = useCart();
  const { t, lang } = useI18n();

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const glowY = useSpring(useTransform(scrollYProgress, [0, 1], [60, -60]), { stiffness: 100, damping: 30 });
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.85]);

  const selectedDrinkObj = drinkTypes.find((d) => d.id === drink) ?? drinkTypes[0];
  const basePrice = selectedDrinkObj.basePrice;
  const sizePrice = sizes.find((s) => s.id === size)?.price ?? 0;
  const milkPrice = milks.find((m) => m.id === milk)?.price ?? 0;
  const extrasPrice = extras
    .filter((e) => selectedExtras.includes(e.id))
    .reduce((sum, e) => sum + e.price, 0);
  const total = basePrice + sizePrice + milkPrice + extrasPrice;

  // Compute live taste profile metrics
  const extraSweetness = selectedExtras.filter((e) => ["vanilla", "caramel", "hazelnut"].includes(e)).length * 20;
  const extraIntensity = selectedExtras.includes("extra-shot") ? 20 : 0;
  const extraCreaminess = selectedExtras.includes("whipped") ? 15 : 0;

  const currentIntensity = Math.min(100, selectedDrinkObj.defaultProfile.intensity + extraIntensity);
  const currentSweetness = Math.min(100, selectedDrinkObj.defaultProfile.sweetness + extraSweetness);
  const currentCreaminess = Math.min(100, selectedDrinkObj.defaultProfile.creaminess + extraCreaminess);

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    const sizeLabel = t(sizes.find((s) => s.id === size)?.labelKey ?? "");
    const milkLabel = t(milks.find((m) => m.id === milk)?.labelKey ?? "");
    const extrasLabels = extras
      .filter((e) => selectedExtras.includes(e.id))
      .map((e) => t(e.labelKey))
      .join("، ");
    const customizations = [sizeLabel, milkLabel, extrasLabels].filter(Boolean).join(" • ");

    addItem({
      id: `custom-${drink}-${Date.now()}`,
      name: t(`custom.${drink}`),
      price: total,
      customizations,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <section
      ref={sectionRef}
      id="customize"
      className="relative py-24 bg-white dark:bg-zinc-950 border-y border-zinc-200/80 dark:border-zinc-800 transition-colors overflow-hidden"
    >
      {/* Parallax ambient glow */}
      <motion.div
        style={{ y: glowY, scale: glowScale }}
        className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-100/30 dark:bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className={`text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 mb-3 inline-block ${lang === "ar" ? "" : "tracking-widest uppercase"}`}>
            {t("b.kicker")}
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
            {t("b.title")}
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {t("b.sub")}
          </p>
        </motion.div>

        {/* Builder Studio Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-zinc-50 dark:bg-zinc-900/70 rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          {/* 1. Base Drink Type */}
          <div className="mb-8">
            <h4 className={`text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400 mb-3 ${lang === "ar" ? "normal-case tracking-normal" : "uppercase tracking-wider"}`}>
              {t("b.step1")}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {drinkTypes.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDrink(d.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 sm:p-3.5 rounded-2xl border text-sm font-medium transition-all cursor-pointer group ${
                    drink === d.id
                      ? "border-amber-500 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm ring-2 ring-amber-500/20"
                      : "border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden mb-1 border border-zinc-200 dark:border-zinc-700 group-hover:scale-105 transition-transform duration-200 shadow-xs">
                    <Image
                      src={d.image}
                      alt={t(d.labelKey)}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm">{t(d.labelKey)}</span>
                  <span className="text-[11px] text-zinc-400 font-mono num" data-ltr>
                    ${d.basePrice.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-7">
            {/* 2. Size */}
            <div>
              <h4 className={`text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400 mb-3 ${lang === "ar" ? "normal-case tracking-normal" : "uppercase tracking-wider"}`}>
                {t("b.step2")}
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                {sizes.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSize(opt.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      size === opt.id
                        ? "border-amber-500 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs"
                        : "border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    <span>{t(opt.labelKey)}</span>
                    {opt.price > 0 ? (
                      <span className="text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400 num" data-ltr>
                        +${opt.price.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-mono">{t("b.std")}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Milk */}
            <div>
              <h4 className={`text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400 mb-3 ${lang === "ar" ? "normal-case tracking-normal" : "uppercase tracking-wider"}`}>
                {t("b.step3")}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {milks.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setMilk(opt.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      milk === opt.id
                        ? "border-amber-500 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs"
                        : "border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span className="flex-1 truncate">{opt.labelKey === "" ? "" : t(opt.labelKey)}</span>
                    {opt.price > 0 && (
                      <span className="text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400 num" data-ltr>
                        +${opt.price.toFixed(2)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Extras */}
            <div>
              <h4 className={`text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400 mb-3 ${lang === "ar" ? "normal-case tracking-normal" : "uppercase tracking-wider"}`}>
                {t("b.step4")}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {extras.map((ext) => {
                  const selected = selectedExtras.includes(ext.id);
                  return (
                    <button
                      key={ext.id}
                      onClick={() => toggleExtra(ext.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        selected
                          ? "border-amber-500 bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs"
                          : "border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      <span>{ext.emoji}</span>
                      <span className="flex-1 truncate">{t(ext.labelKey)}</span>
                      <span className="text-[11px] font-mono text-zinc-400 num" data-ltr>
                        +${ext.price.toFixed(2)}
                      </span>
                      {selected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sensory Tasting Profile Visualizer */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <div className={`flex items-center gap-2 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 mb-3 ${lang === "ar" ? "normal-case tracking-normal" : "uppercase tracking-wider"}`}>
                <Sliders className="w-3.5 h-3.5 text-amber-500 rtl:-scale-x-100" />
                <span>{lang === "ar" ? "تقدير حسي مباشر للنكهة" : "Live Sensory Profile Estimate"}</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="flex justify-between text-zinc-500 mb-1">
                    <span>{lang === "ar" ? "قوة الإسبريسو" : "Espresso Intensity"}</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 num" data-ltr>{currentIntensity}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600 rounded-full transition-all duration-300" style={{ width: `${currentIntensity}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-500 mb-1">
                    <span>{lang === "ar" ? "مستوى الحلاوة" : "Sweetness Level"}</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 num" data-ltr>{currentSweetness}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${currentSweetness}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-500 mb-1">
                    <span>{lang === "ar" ? "نعومة الرغوة" : "Microfoam Creaminess"}</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 num" data-ltr>{currentCreaminess}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-300 rounded-full transition-all duration-300" style={{ width: `${currentCreaminess}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Total & Order Button */}
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className={`text-[11px] font-mono text-zinc-400 ${lang === "ar" ? "normal-case tracking-normal" : "uppercase tracking-wider"}`}>
                {t("b.total")}
              </span>
              <div className="text-3xl font-serif font-bold text-zinc-900 dark:text-white mt-0.5 num" data-ltr>
                ${total.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleAdd}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-sm ${
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
                    <ShoppingCart className="w-4 h-4" />
                    <span>{t("b.add")}</span>
                  </>
                )}
              </button>

              <button
                onClick={openCart}
                className="px-4 py-3.5 rounded-full border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                {t("b.review")}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
