"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { Gift, Crown, Check, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/lib/i18n";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const tiers = [
  { key: "bean", min: 0, emoji: "☕" },
  { key: "brew", min: 100, emoji: "🍵" },
  { key: "barista", min: 300, emoji: "🧑‍🍳" },
  { key: "legend", min: 500, emoji: "👑" },
];

const rewards = [
  { id: "reward-1", nameKey: "rw.1.n", points: 50, discountValue: 1.0, image: "/images/espresso.jpg" },
  { id: "reward-2", nameKey: "rw.2.n", points: 100, discountValue: 3.5, image: "/images/croissant.jpg" },
  { id: "reward-3", nameKey: "rw.3.n", points: 200, discountValue: 6.5, image: "/images/lavender-latte.jpg" },
  { id: "reward-4", nameKey: "rw.4.n", points: 150, discountValue: 5.0, emoji: "🏷️" },
  { id: "reward-5", nameKey: "rw.5.n", points: 400, discountValue: 12.0, emoji: "🎒" },
];

export default function LoyaltyRewards() {
  const [points, setPoints] = useState(180);
  const [claimedRewardId, setClaimedRewardId] = useState<string | null>(null);
  const { applyReward, openCart } = useCart();
  const { t, tf, lang } = useI18n();
  const shouldReduceMotion = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const orb1Y = useSpring(useTransform(scrollYProgress, [0, 1], [70, -90]), { stiffness: 100, damping: 30 });
  const orb2Y = useSpring(useTransform(scrollYProgress, [0, 1], [50, -60]), { stiffness: 100, damping: 30 });
  const orb1Opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const orb2Opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 0.8, 0.8, 0]);

  const currentTier = [...tiers].reverse().find((tier) => points >= tier.min) ?? tiers[0];
  const nextTier = tiers.find((tier) => tier.min > points);
  const progress = nextTier
    ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const handleRedeem = (reward: (typeof rewards)[0]) => {
    if (points < reward.points) return;

    applyReward({
      id: reward.id,
      name: t(reward.nameKey),
      discount: reward.discountValue,
    });

    setPoints((prev) => prev - reward.points);
    setClaimedRewardId(reward.id);

    setTimeout(() => {
      openCart();
    }, 600);
  };

  return (
    <section
      ref={sectionRef}
      id="rewards"
      className="relative py-24 bg-zinc-50 dark:bg-zinc-950 transition-colors overflow-hidden"
    >
      {/* Parallax decorative orbs */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : orb1Y, opacity: shouldReduceMotion ? 1 : orb1Opacity }}
        className="absolute top-1/4 -right-20 w-[350px] h-[350px] bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : orb2Y, opacity: shouldReduceMotion ? 1 : orb2Opacity }}
        className="absolute bottom-1/4 -left-24 w-[300px] h-[300px] bg-amber-300/15 dark:bg-amber-400/5 rounded-full blur-[80px] pointer-events-none"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className={`text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 mb-3 inline-block ${lang === "ar" ? "" : "tracking-widest uppercase"}`}>
            {t("r.kicker")}
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
            {t("r.title")}
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {t("r.sub")}
          </p>
        </motion.div>

        {/* Member Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-zinc-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-zinc-800 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className={`text-xs font-mono font-semibold text-amber-300 ${lang === "ar" ? "normal-case tracking-normal" : "uppercase tracking-wider"}`}>
                  {currentTier.emoji} {t(`tier.${currentTier.key}`)}
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 border border-zinc-800 px-3 py-1 rounded-full bg-zinc-950/60 num" data-ltr>
                ID: #BB-8892-GOLD
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <div className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-white num" data-ltr>
                {points}
              </div>
              <span className={`text-xs font-mono text-amber-400 ${lang === "ar" ? "normal-case tracking-normal" : "uppercase tracking-wider"}`}>
                {t("r.points")}
              </span>
            </div>

            {nextTier && (
              <div className="mt-6 pt-5 border-t border-zinc-800">
                <div className="flex justify-between text-xs mb-2 text-zinc-400 gap-2">
                  <span>
                    {tf("r.current", { current: t(`tier.${currentTier.key}`) })} →{" "}
                    {tf("r.next", { next: t(`tier.${nextTier.key}`) })}
                  </span>
                  <span className="text-amber-400 font-mono whitespace-nowrap num" data-ltr>
                    {tf("r.unlock", { points: nextTier.min - points })}
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tier Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {tiers.map((tier) => {
            const isUnlocked = points >= tier.min;
            return (
              <div
                key={tier.key}
                className={`rounded-2xl p-4 text-center border transition-all ${
                  isUnlocked
                    ? "bg-white dark:bg-zinc-900 border-amber-500/40 dark:border-amber-500/30 shadow-xs"
                    : "bg-white/40 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-50"
                }`}
              >
                <div className="text-2xl mb-1">{tier.emoji}</div>
                <div className="text-sm font-serif font-bold text-zinc-900 dark:text-zinc-100">
                  {t(`tier.${tier.key}`)}
                </div>
                <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 mt-0.5 num" data-ltr>
                  {tier.min}+ pts
                </div>
              </div>
            );
          })}
        </div>

        {/* Claimable Perks */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-6 gap-2">
            <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500 shrink-0 rtl:-scale-x-100" />
              {t("r.perksT")}
            </h3>
            <span className={`text-[11px] font-mono text-zinc-400 text-end ${lang === "ar" ? "normal-case tracking-normal" : ""}`}>
              {t("r.auto")}
            </span>
          </div>

          <div className="space-y-2.5">
            {rewards.map((reward) => {
              const canRedeem = points >= reward.points;
              const isClaimed = claimedRewardId === reward.id;

              return (
                <div
                  key={reward.id}
                  className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all ${
                    canRedeem
                      ? "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/40"
                      : "border-zinc-100 dark:border-zinc-800/50 opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 overflow-hidden flex items-center justify-center text-xl border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-xs">
                      {reward.image ? (
                        <Image
                          src={reward.image}
                          alt={t(reward.nameKey)}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <span>{reward.emoji}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        {t(reward.nameKey)}
                      </div>
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                        {tf("r.line", {
                          points: reward.points,
                          value: reward.discountValue.toFixed(2),
                        })}
                      </div>
                    </div>
                  </div>

                  {canRedeem ? (
                    <button
                      onClick={() => handleRedeem(reward)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                        isClaimed
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-zinc-950 shadow-xs"
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{t("r.applied")}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{t("r.redeem")}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-zinc-400 px-2 py-1 whitespace-nowrap num" data-ltr>
                      {tf("r.needs", { points: reward.points - points })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
