"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import { Menu, X, ShoppingCart, Sun, Moon, Languages } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useTheme } from "@/lib/theme-context";
import { useI18n } from "@/lib/i18n";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { dark, toggle } = useTheme();
  const { t, tf, lang, setLang } = useI18n();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const navLinks = [
    { label: t("nav.menu"), href: "#menu" },
    { label: t("nav.lab"), href: "#customize" },
    { label: t("nav.rewards"), href: "#rewards" },
    { label: t("nav.locations"), href: "#locations" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/70 dark:border-zinc-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 text-zinc-900 dark:text-zinc-50 group transition-transform hover:opacity-90"
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform border border-amber-500/40 bg-zinc-950 shrink-0">
              <Image
                src="/images/origin-and-oak-logo.jpg"
                alt="Origin & Oak Emblem"
                fill
                sizes="36px"
                className="object-cover scale-150"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-serif font-bold tracking-tight leading-none">
                {lang === "ar" ? "أوريجن آند أوك" : "Origin & Oak"}
              </span>
              <span className={`text-[10px] font-mono tracking-widest text-zinc-400 dark:text-zinc-500 mt-0.5 ${lang === "ar" ? "normal-case" : "uppercase"}`}>
                {t("nav.brandSub")}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-medium text-sm transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label={lang === "en" ? "التبديل إلى العربية" : "Switch to English"}
              title={lang === "en" ? "العربية" : "English"}
            >
              <Languages className="w-4 h-4 text-amber-500" />
              <span>
                {lang === "en" ? "عربي" : "EN"}
              </span>
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={toggle}
              className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300 focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
              aria-label={t("nav.darkMode")}
            >
              {dark ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-zinc-700" />
              )}
            </button>

            {/* Shopping Cart Trigger */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-200 focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
              aria-label={tf("nav.cart", { count: itemCount })}
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-amber-500 text-zinc-950 text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-sm"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label={t("nav.mobileMenu")}
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white py-2 px-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 origin-left"
        style={{ scaleX }}
      />
    </nav>
  );
}
