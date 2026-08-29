"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { Plus, Check, Maximize2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import ProductDetailModal, { ProductDetail } from "@/components/ProductDetailModal";

type Category = "espresso" | "cold" | "specialty" | "pastries";

interface MenuItem {
  id: string;
  price: number;
  image: string;
  category: Category;
  tags?: string[];
  origin?: string;
  roastLevel?: string;
}

const categories: { key: Category; labelKey: string; emoji: string }[] = [
  { key: "espresso", labelKey: "cat.espresso", emoji: "☕" },
  { key: "cold", labelKey: "cat.cold", emoji: "🧊" },
  { key: "specialty", labelKey: "cat.specialty", emoji: "✨" },
  { key: "pastries", labelKey: "cat.pastries", emoji: "🥐" },
];

const menuItems: MenuItem[] = [
  // Espresso
  {
    id: "espresso-1",
    price: 3.5,
    image: "/images/espresso.jpg",
    category: "espresso",
    tags: ["houseBlend"],
  },
  {
    id: "espresso-2",
    price: 5.0,
    image: "/images/cappuccino.jpg",
    category: "espresso",
    tags: ["popular"],
  },
  {
    id: "espresso-3",
    price: 5.5,
    image: "/images/hero-latte.jpg",
    category: "espresso",
  },
  {
    id: "espresso-4",
    price: 5.5,
    image: "/images/hero-latte.jpg",
    category: "espresso",
  },
  {
    id: "espresso-5",
    price: 4.5,
    image: "/images/espresso.jpg",
    category: "espresso",
  },
  {
    id: "espresso-6",
    price: 4.0,
    image: "/images/espresso.jpg",
    category: "espresso",
  },

  // Cold Brew
  {
    id: "cold-1",
    price: 5.0,
    image: "/images/cold-brew.jpg",
    category: "cold",
    tags: ["slowSteeped"],
  },
  {
    id: "cold-2",
    price: 6.0,
    image: "/images/iced-caramel-latte.jpg",
    category: "cold",
    tags: ["sweet"],
  },
  {
    id: "cold-3",
    price: 6.0,
    image: "/images/cold-brew.jpg",
    category: "cold",
  },
  {
    id: "cold-4",
    price: 6.0,
    image: "/images/cold-brew.jpg",
    category: "cold",
    tags: ["onTap"],
  },

  // Specialty
  {
    id: "spec-1",
    price: 6.5,
    image: "/images/lavender-latte.jpg",
    category: "specialty",
    tags: ["signature"],
  },
  {
    id: "spec-2",
    price: 6.5,
    image: "/images/hero-latte.jpg",
    category: "specialty",
  },
  {
    id: "spec-3",
    price: 6.0,
    image: "/images/hero-latte.jpg",
    category: "specialty",
  },
  {
    id: "spec-4",
    price: 7.0,
    image: "/images/iced-caramel-latte.jpg",
    category: "specialty",
    tags: ["indulgent"],
  },

  // Pastries
  {
    id: "pasty-1",
    price: 3.5,
    image: "/images/croissant.jpg",
    category: "pastries",
    tags: ["freshBaked"],
  },
  {
    id: "pasty-2",
    price: 3.5,
    image: "/images/blueberry-muffin.jpg",
    category: "pastries",
  },
  {
    id: "pasty-3",
    price: 4.0,
    image: "/images/cinnamon-roll.jpg",
    category: "pastries",
  },
  {
    id: "pasty-4",
    price: 2.5,
    image: "/images/almond-biscotti.jpg",
    category: "pastries",
  },
];

export default function MenuSection() {
  const [active, setActive] = useState<Category>("espresso");
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [previewProduct, setPreviewProduct] = useState<ProductDetail | null>(null);
  const { addItem } = useCart();
  const { t, lang } = useI18n();
  const shouldReduceMotion = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const orb1Y = useSpring(useTransform(scrollYProgress, [0, 1], [80, -80]), { stiffness: 100, damping: 30 });
  const orb2Y = useSpring(useTransform(scrollYProgress, [0, 1], [60, -120]), { stiffness: 100, damping: 30 });
  const orb1Scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);
  const orb2Scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1.1, 0.85]);

  const handleAdd = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: t(`menu.${item.id}.n`),
      price: item.price,
    });
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1200);
  };

  const openProductPreview = (item: MenuItem) => {
    setPreviewProduct({
      id: item.id,
      name: t(`menu.${item.id}.n`),
      description: t(`menu.${item.id}.d`),
      price: item.price,
      image: item.image,
      tags: item.tags,
      origin: item.origin,
      roastLevel: item.roastLevel,
    });
  };

  const filtered = menuItems.filter((item) => item.category === active);

  return (
    <section ref={sectionRef} id="menu" className="relative py-24 bg-zinc-50 dark:bg-zinc-950 transition-colors overflow-hidden">
      {/* Parallax decorative orbs */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : orb1Y, scale: shouldReduceMotion ? 1 : orb1Scale }}
        className="absolute -top-20 -right-32 w-[400px] h-[400px] bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : orb2Y, scale: shouldReduceMotion ? 1 : orb2Scale }}
        className="absolute top-1/3 -left-40 w-[350px] h-[350px] bg-amber-300/15 dark:bg-amber-400/5 rounded-full blur-[90px] pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className={`text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 mb-3 inline-block ${lang === "ar" ? "" : "tracking-widest uppercase"}`}>
            {t("menu.kicker")}
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
            {t("menu.title")}
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            {t("menu.sub")}
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                active === cat.key
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{t(cat.labelKey)}</span>
            </button>
          ))}
        </div>

        {/* Menu Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => {
              const isAdded = !!addedItems[item.id];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="group flex flex-col justify-between bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-lg transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      {/* Clickable Image to Enlarge */}
                      <button
                        type="button"
                        onClick={() => openProductPreview(item)}
                        className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-200/80 dark:border-zinc-700/80 group/img cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-amber-500"
                        aria-label={lang === "ar" ? `عرض تفاصيل ${t(`menu.${item.id}.n`)}` : `View details of ${t(`menu.${item.id}.n`)}`}
                        title={lang === "ar" ? "انقر لتكبير الصورة والتفاصيل" : "Click to view full photo & details"}
                      >
                        <Image
                          src={item.image}
                          alt={t(`menu.${item.id}.n`)}
                          fill
                          sizes="64px"
                          className="object-cover group-hover/img:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 className="w-4 h-4 drop-shadow" />
                        </div>
                      </button>

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/40 ${lang === "ar" ? "normal-case tracking-normal" : "tracking-wider uppercase"}`}
                            >
                              {t(`tag.${tag}`)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <h3 className="mt-4">
                      <button
                        type="button"
                        onClick={() => openProductPreview(item)}
                        className="w-full text-start text-base font-serif font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors cursor-pointer rounded focus-visible:ring-2 focus-visible:ring-amber-500"
                      >
                        {t(`menu.${item.id}.n`)}
                      </button>
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {t(`menu.${item.id}.d`)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-base font-serif font-bold text-zinc-900 dark:text-zinc-100 num" data-ltr>
                      ${item.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleAdd(item)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-900 dark:bg-zinc-100 hover:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 hover:text-zinc-950 shadow-xs"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{t("menu.added")}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t("menu.add")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* High-Resolution Product Detail Modal */}
      <ProductDetailModal
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
      />
    </section>
  );
}
