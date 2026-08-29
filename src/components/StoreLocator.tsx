"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Store {
  id: string;
  neighborhoodKey: string;
  address: string;
  phone: string;
  pinCoordinates: { x: number; y: number };
  features: string[];
}

const stores: Store[] = [
  {
    id: "1",
    neighborhoodKey: "st.1.hood",
    address: "123 Main Street, Suite 100",
    phone: "(555) 123-4567",
    pinCoordinates: { x: 32, y: 45 },
    features: ["driveThru", "patio", "wifi", "roasteryBar"],
  },
  {
    id: "2",
    neighborhoodKey: "st.2.hood",
    address: "456 River Road",
    phone: "(555) 234-5678",
    pinCoordinates: { x: 68, y: 35 },
    features: ["riverView", "petFriendly", "wifi", "bakery"],
  },
  {
    id: "3",
    neighborhoodKey: "st.3.hood",
    address: "789 College Ave",
    phone: "(555) 345-6789",
    pinCoordinates: { x: 50, y: 70 },
    features: ["studyRooms", "lateNight", "wifi"],
  },
];

const gridRoads = [
  { top: "25%", left: "10%", width: "80%", height: "1px", rotate: "-5deg" },
  { top: "50%", left: "5%", width: "90%", height: "2px", rotate: "2deg" },
  { top: "75%", left: "15%", width: "70%", height: "1px", rotate: "-3deg" },
  { top: "15%", left: "30%", width: "1px", height: "70%", rotate: "8deg" },
  { top: "10%", left: "65%", width: "2px", height: "80%", rotate: "-6deg" },
];

export default function StoreLocator() {
  const [selectedStore, setSelectedStore] = useState<string>("store-1");
  const { t, lang } = useI18n();

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const orbY = useSpring(useTransform(scrollYProgress, [0, 1], [50, -70]), { stiffness: 100, damping: 30 });
  const orbScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.15, 0.9]);

  const activeStore = stores.find((s) => `store-${s.id}` === selectedStore) ?? stores[0];

  return (
    <section ref={sectionRef} id="locations" className="relative py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800 transition-colors overflow-hidden">
      {/* Parallax decorative orb */}
      <motion.div
        style={{ y: orbY, scale: orbScale }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-amber-100/25 dark:bg-amber-500/5 rounded-full blur-[110px] pointer-events-none"
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
            {t("s.kicker")}
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
            {t("s.title")}
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {t("s.sub")}
          </p>
        </motion.div>

        {/* Minimalist Map Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 h-72 sm:h-88 bg-zinc-100 dark:bg-zinc-900 rounded-3xl relative overflow-hidden border border-zinc-200 dark:border-zinc-800"
        >
          {/* Stylized road lines */}
          <div className="absolute inset-0 opacity-40">
            {gridRoads.map((road, i) => (
              <div
                key={i}
                className="absolute bg-zinc-300 dark:bg-zinc-700"
                style={{
                  top: road.top,
                  left: road.left,
                  width: road.width,
                  height: road.height,
                  transform: `rotate(${road.rotate})`,
                }}
              />
            ))}
          </div>

          {/* Map Pins */}
          {stores.map((store) => {
            const isSelected = selectedStore === `store-${store.id}`;
            return (
              <button
                key={store.id}
                onClick={() => setSelectedStore(`store-${store.id}`)}
                style={{
                  left: `${store.pinCoordinates.x}%`,
                  top: `${store.pinCoordinates.y}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20 focus-visible:ring-2 focus-visible:ring-amber-500 rounded-full`}
                aria-label={t(`st.${store.id}.name`)}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? "bg-amber-500 text-zinc-950 ring-4 ring-amber-500/30 scale-110 shadow-lg"
                      : "bg-zinc-900 dark:bg-zinc-800 text-zinc-200 hover:bg-zinc-800 shadow-sm"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <span
                  className={`mt-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold shadow-xs whitespace-nowrap ${
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                      : "bg-white/90 text-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300"
                  }`}
                >
                  {t(store.neighborhoodKey)}
                </span>
              </button>
            );
          })}

          {/* Active Card Pill on Map */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-xs bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl z-20">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold ${lang === "ar" ? "normal-case tracking-normal" : ""}`}>
                {t("s.selectedRoastery")}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("s.open")}
              </span>
            </div>
            <h4 className="font-serif font-bold text-zinc-900 dark:text-white text-xs sm:text-sm mt-1">
              {t(`st.${activeStore.id}.name`)}
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              {t(`st.${activeStore.id}.address`)}
            </p>
          </div>
        </motion.div>

        {/* Store Grid Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {stores.map((store, i) => {
            const isSelected = selectedStore === `store-${store.id}`;
            return (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedStore(`store-${store.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedStore(`store-${store.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={t(`st.${store.id}.name`)}
                className={`cursor-pointer rounded-2xl p-5 sm:p-6 transition-all duration-200 border focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-amber-500 shadow-md ring-1 ring-amber-500/30"
                    : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5 gap-2">
                  <span className={`text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider ${lang === "ar" ? "normal-case tracking-normal" : ""}`}>
                    {t(store.neighborhoodKey)}
                  </span>
                  {isSelected ? (
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold shrink-0 ${lang === "ar" ? "normal-case tracking-normal" : ""}`}>
                      {t("s.selectedTag")}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStore(`store-${store.id}`);
                      }}
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 transition-colors font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0 ${lang === "ar" ? "normal-case tracking-normal" : ""}`}
                    >
                      {t("menu.add")}
                    </button>
                  )}
                </div>

                <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                  {t(`st.${store.id}.name`)}
                </h3>

                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5 rtl:-scale-x-100" />
                    <span>{t(`st.${store.id}.address`)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5 rtl:-scale-x-100" />
                    <span>{t(`st.${store.id}.hours`)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5 rtl:-scale-x-100" />
                    <span className="num" data-ltr>{store.phone}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {store.features.map((f) => (
                    <span
                      key={f}
                      className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700"
                    >
                      {t(`feat.${f}`)}
                    </span>
                  ))}
                </div>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${t(`st.${store.id}.name`)} ${t(`st.${store.id}.address`)}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:text-amber-600 dark:text-zinc-100 dark:hover:text-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Navigation className="w-3 h-3 rtl:-scale-x-100" />
                  {t("s.directions")}
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
