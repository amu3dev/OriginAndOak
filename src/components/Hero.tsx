"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Sparkles, Plus, Check, Maximize2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import ProductDetailModal, { ProductDetail } from "@/components/ProductDetailModal";

export default function Hero() {
  const { addItem, openCart } = useCart();
  const { t, tf, lang } = useI18n();
  const [bundleAdded, setBundleAdded] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<ProductDetail | null>(null);
  const shouldReduceMotion = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms — each layer moves at a different speed
  // Slowest (far background) to fastest (foreground content)
  const glowTopY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -120]), { stiffness: 100, damping: 30 });
  const glowBottomY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -80]), { stiffness: 100, damping: 30 });
  const gridY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -40]), { stiffness: 100, damping: 30 });
  const gridOpacity = useTransform(scrollYProgress, [0, 0.8], [0.3, 0]);
  const textY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 60]), { stiffness: 100, damping: 30 });
  const cardY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 100]), { stiffness: 100, damping: 30 });
  const cardScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.97, 0.94]);
  const cardRotate = useTransform(scrollYProgress, [0, 1], [0, 1.5]);
  const fadeOut = useTransform(scrollYProgress, [0.6, 1], [1, 0]);

  const handleOrderFeatured = () => {
    addItem({
      id: "featured-latte-of-the-day",
      name: t("hero.fName"),
      price: 5.5,
      customizations:
        lang === "ar"
          ? "وسط (12oz) • حليب كامل • بندق وكراميل"
          : "Medium (12oz) • Whole Milk • Hazelnut & Caramel",
    });
    openCart();
  };

  const handleOrderPairingBundle = () => {
    addItem({
      id: "daily-morning-pairing",
      name:
        lang === "ar"
          ? "وجبة قهوة الصباح (لاتيه + كرواسون)"
          : "Morning Ritual Pairing (Latte + Croissant)",
      price: 7.5,
      customizations:
        lang === "ar"
          ? "كراميل هازلنوت لاتيه + كرواسون بالزبدة"
          : "Caramel Hazelnut Latte (12oz) + Butter Croissant",
    });
    setBundleAdded(true);
    setTimeout(() => {
      setBundleAdded(false);
      openCart();
    }, 600);
  };

  const openFeaturedPreview = () => {
    setPreviewProduct({
      id: "featured-latte-of-the-day",
      name: t("hero.fName"),
      description: t("hero.fDesc"),
      price: 5.5,
      image: "/images/hero-latte.jpg",
      tags: ["houseBlend", "signature"],
      origin: lang === "ar" ? "إثيوبيا وسومطرة سبيشالتي" : "Ethiopia & Sumatra Direct Blend",
      roastLevel: lang === "ar" ? "تحميص وسطي عطري" : "Aromatic Medium Roast",
    });
  };

  const stats = [
    { value: t("hero.s1v"), label: t("hero.s1l") },
    { value: t("hero.s2v"), label: t("hero.s2l") },
    { value: t("hero.s3v"), label: t("hero.s3l") },
  ];

  return (
    <section ref={sectionRef} className="relative min-h-[92vh] flex items-center overflow-hidden bg-zinc-950 text-zinc-100">
      {/* ── Parallax Background Layers ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Far glow — slowest drift */}
        <motion.div
          style={{ y: shouldReduceMotion ? 0 : glowTopY }}
          className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]"
        />
        {/* Secondary glow — medium drift */}
        <motion.div
          style={{ y: shouldReduceMotion ? 0 : glowBottomY }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[100px]"
        />
        {/* Dot grid — subtle drift + fade out on scroll */}
        <motion.div
          style={{ y: shouldReduceMotion ? 0 : gridY, opacity: shouldReduceMotion ? 0.3 : gridOpacity }}
          className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]"
        />
      </div>

      {/* ── Content — fades out as you scroll past ── */}
      <motion.div
        style={{ opacity: shouldReduceMotion ? 1 : fadeOut }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center"
      >
        {/* Left Column Text — parallax at medium speed */}
        <motion.div
          style={{ y: shouldReduceMotion ? 0 : textY }}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, ease: "easeOut" }}
          className="lg:col-span-7"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs font-medium tracking-wide mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{t("hero.badge")}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.08] tracking-tight">
            {t("hero.t1")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-300 italic font-serif">
              {t("hero.t2")}
            </span>{" "}
            {t("hero.t3")}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
            {t("hero.desc")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#menu"
              className="inline-flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 active:scale-98 text-zinc-950 px-8 py-4 rounded-full font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 cursor-pointer"
            >
              {t("hero.cta1")}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </a>
            <a
              href="#customize"
              className="inline-flex items-center gap-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 px-8 py-4 rounded-full font-semibold text-sm transition-all backdrop-blur-sm active:scale-98"
            >
              {t("hero.cta2")}
            </a>
          </div>

          {/* Metrics */}
          <div className="mt-14 pt-8 border-t border-zinc-800/80 grid grid-cols-3 gap-6 sm:gap-8 max-w-lg">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight num" data-ltr>
                  {stat.value}
                </div>
                <div className={`text-xs text-zinc-500 font-medium mt-1 ${lang === "ar" ? "" : "uppercase tracking-wider"}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column Featured Card — fastest parallax + scale + subtle rotation */}
        <motion.div
          style={{ y: shouldReduceMotion ? 0 : cardY, scale: shouldReduceMotion ? 1 : cardScale, rotate: shouldReduceMotion ? 0 : cardRotate }}
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="lg:col-span-5 flex justify-center"
        >
          <div className="relative w-full max-w-md">
            {/* Soft backdrop glow */}
            <div className="absolute inset-0 rounded-3xl bg-amber-500/10 blur-2xl transform scale-95" />

            {/* Elevated Boutique Card */}
            <div className="relative bg-zinc-900/90 backdrop-blur-xl rounded-3xl p-7 sm:p-8 border border-zinc-800 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider border border-amber-500/20 ${lang === "ar" ? "normal-case tracking-normal" : ""}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("hero.fBadge")}
                </span>
                <span className="text-lg font-serif font-bold text-white num" data-ltr>$5.50</span>
              </div>

              {/* Clickable Image to Enlarge */}
              <div className="my-6 flex justify-center">
                <button
                  type="button"
                  onClick={openFeaturedPreview}
                  className="relative w-36 h-36 rounded-2xl overflow-hidden border border-zinc-700/80 shadow-lg group/img cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-label={lang === "ar" ? `عرض تفاصيل ${t("hero.fName")}` : `View details of ${t("hero.fName")}`}
                  title={lang === "ar" ? "انقر لتكبير الصورة والتفاصيل" : "Click to view full photo & details"}
                >
                  <Image
                    src="/images/hero-latte.jpg"
                    alt={t("hero.fName")}
                    fill
                    sizes="144px"
                    className="object-cover group-hover/img:scale-105 transition-transform duration-300"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-5 h-5 drop-shadow" />
                  </div>
                </button>
              </div>

              <div className="text-center">
                <h3
                  onClick={openFeaturedPreview}
                  className="text-xl font-serif font-bold text-white cursor-pointer hover:text-amber-400 transition-colors"
                >
                  {t("hero.fName")}
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  {t("hero.fDesc")}
                </p>

                <div className="mt-5 space-y-2">
                  <button
                    onClick={handleOrderFeatured}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 active:scale-98 py-3 rounded-full font-semibold transition-all shadow-md shadow-amber-500/15 cursor-pointer text-xs sm:text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {tf("hero.fAdd", { price: "$5.50" })}
                  </button>

                  {/* Morning Ritual Pairing Bundle */}
                  <button
                    onClick={handleOrderPairingBundle}
                    className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-amber-500/40 text-start transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-zinc-700">
                        <Image
                          src="/images/croissant.jpg"
                          alt="Butter Croissant"
                          fill
                          sizes="36px"
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="text-start">
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors">
                          {lang === "ar" ? "أضف كرواسون بالزبدة" : "Pair with Butter Croissant"}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {lang === "ar" ? "وفّر $1.50 مع وجبة الفطور" : "Save $1.50 with Breakfast Set"}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 num" data-ltr>
                      {bundleAdded ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Check className="w-3.5 h-3.5" /> {lang === "ar" ? "تمت الإضافة" : "Set Added"}
                        </span>
                      ) : (
                        "$7.50"
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* High-Resolution Product Detail Modal */}
      <ProductDetailModal
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
      />
    </section>
  );
}
