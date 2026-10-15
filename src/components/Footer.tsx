"use client";

import Image from "next/image";
import { Globe, AtSign, Hash, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t, lang } = useI18n();

  const links = {
    menu: [
      { labelKey: "fl.espresso", href: "#menu" },
      { labelKey: "fl.cold", href: "#menu" },
      { labelKey: "fl.crafts", href: "#menu" },
      { labelKey: "fl.bakery", href: "#menu" },
    ],
    company: [
      { labelKey: "fc.story", href: "#" },
      { labelKey: "fc.sourcing", href: "#" },
      { labelKey: "fc.wholesale", href: "#" },
      { labelKey: "fc.careers", href: "#" },
    ],
    support: [
      { labelKey: "fs.contact", href: "#" },
      { labelKey: "fs.faq", href: "#" },
      { labelKey: "fs.perks", href: "#rewards" },
      { labelKey: "fs.find", href: "#locations" },
    ],
  };

  const socials = [
    { Icon: AtSign, labelKey: "f.instagram" },
    { Icon: Hash, labelKey: "f.twitter" },
    { Icon: Globe, labelKey: "f.facebook" },
  ];

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div>
            <a href="#" className="flex items-center gap-2.5 text-white">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-amber-500/40 bg-zinc-900 shrink-0">
                <Image
                  src="/images/origin-and-oak-logo.jpg"
                  alt={t("brand.logoAlt")}
                  fill
                  sizes="32px"
                  className="object-cover scale-150"
                />
              </div>
              <span className="text-lg font-serif font-bold tracking-tight">
                {t("brand.name")}
              </span>
            </a>
            <p className="mt-4 text-zinc-400 text-xs sm:text-sm leading-relaxed">
              {t("f.tagline")}
            </p>
            <div className="flex gap-2.5 mt-6">
              {socials.map(({ Icon, labelKey }) => (
                <a
                  key={labelKey}
                  href="#"
                  aria-label={t(labelKey)}
                  className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-amber-500 hover:text-zinc-950 border border-zinc-800 flex items-center justify-center transition-colors text-zinc-300"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {[
            { titleKey: "f.col1", items: links.menu },
            { titleKey: "f.col2", items: links.company },
            { titleKey: "f.col3", items: links.support },
          ].map((group) => (
            <div key={group.titleKey}>
              <h3 className={`font-mono text-xs font-semibold text-zinc-200 mb-4 ${lang === "ar" ? "normal-case tracking-normal" : "uppercase tracking-widest"}`}>
                {t(group.titleKey)}
              </h3>
              <ul className="space-y-2.5">
                {group.items.map((link) => (
                  <li key={link.labelKey}>
                    <a
                      href={link.href}
                      className="text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      {t(link.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs">{t("f.legal")}</p>
          <p className="text-zinc-600 text-xs flex items-center gap-1.5">
            {t("f.roasted")} <Heart className="w-3 h-3 text-amber-500 fill-current" /> {t("f.location")}
          </p>
        </div>
      </div>
    </footer>
  );
}
