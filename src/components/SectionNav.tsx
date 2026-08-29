"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

interface Section {
  id: string;
  labelKey: string;
}

const sections: Section[] = [
  { id: "menu", labelKey: "nav.menu" },
  { id: "customize", labelKey: "nav.lab" },
  { id: "rewards", labelKey: "nav.rewards" },
  { id: "locations", labelKey: "nav.locations" },
];

export default function SectionNav() {
  const [activeSection, setActiveSection] = useState<string>("menu");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useI18n();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(section.id);
            }
          });
        },
        {
          rootMargin: "-40% 0px -40% 0px",
          threshold: 0,
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3"
          aria-label="Section navigation"
        >
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const isHovered = hoveredSection === section.id;
            const label = t(section.labelKey);

            return (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
                className="group flex items-center gap-3 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 rounded-full"
                aria-label={`Scroll to ${label}`}
                aria-current={isActive ? "true" : undefined}
              >
                {/* Label tooltip */}
                <motion.span
                  initial={false}
                  animate={{
                    opacity: isHovered || isActive ? 1 : 0,
                    x: isHovered || isActive ? 0 : 8,
                  }}
                  transition={{ duration: 0.2 }}
                  className="text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-300 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm whitespace-nowrap pointer-events-none select-none"
                >
                  {label}
                </motion.span>

                {/* Dot indicator */}
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: isActive ? 1 : isHovered ? 0.85 : 0.5,
                      backgroundColor: isActive
                        ? "#f59e0b"
                        : isHovered
                          ? "#a1a1aa"
                          : "#d4d4d8",
                    }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="w-2.5 h-2.5 rounded-full dark:bg-zinc-600"
                  />
                  {isActive && (
                    <motion.div
                      layoutId="section-nav-ring"
                      className="absolute inset-[-5px] rounded-full border-2 border-amber-400/60"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
