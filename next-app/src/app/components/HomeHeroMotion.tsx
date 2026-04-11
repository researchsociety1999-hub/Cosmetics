"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const HERO_PORTRAIT_SRC = "/hero-portrait-silhouette.png";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function HomeHeroMotion() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0.92]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[min(85vh,800px)] overflow-hidden border-b border-[rgba(214,168,95,0.14)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[#010203]" />

      <motion.div
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={
          reduce
            ? undefined
            : { y: portraitY, scale: portraitScale }
        }
      >
        <Image
          src={HERO_PORTRAIT_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_30%] opacity-[0.4] sm:object-[76%_28%] md:object-[88%_22%] md:opacity-[0.44]"
          aria-hidden
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000000_0%,rgba(0,0,0,0.92)_min(42%,22rem),rgba(0,0,0,0.55)_50%,rgba(3,4,6,0.2)_68%,rgba(5,6,9,0.45)_100%)]" />
      {!reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_78%_38%,rgba(214,168,95,0.09),transparent_58%),radial-gradient(circle_at_88%_88%,rgba(255,120,60,0.05),transparent_45%)]"
          animate={{ opacity: [0.78, 0.95, 0.78] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_78%_38%,rgba(214,168,95,0.07),transparent_58%),radial-gradient(circle_at_88%_88%,rgba(255,120,60,0.04),transparent_45%)]" />
      )}

      <div className="pointer-events-none absolute inset-0">
        <span
          className="mystic-particle mystic-particle-md left-[12%] top-[20%]"
          style={{ animationDelay: "-1.2s" }}
        />
        <span
          className="mystic-particle mystic-particle-sm left-[78%] top-[24%]"
          style={{ animationDelay: "-3.4s" }}
        />
        <span
          className="mystic-particle mystic-particle-lg left-[88%] top-[58%]"
          style={{ animationDelay: "-0.6s" }}
        />
        <span
          className="mystic-particle mystic-particle-sm left-[48%] top-[72%]"
          style={{ animationDelay: "-5.1s" }}
        />
        <span
          className="mystic-particle mystic-particle-sm left-[24%] top-[56%] opacity-70"
          style={{ animationDelay: "-2.8s" }}
        />
        <span
          className="mystic-particle mystic-particle-md left-[62%] top-[14%] opacity-60"
          style={{ animationDelay: "-4.2s" }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full px-4 pb-[4.5rem] pt-16 md:px-6 md:pb-[6rem] md:pt-24 lg:px-10 xl:px-14"
        style={reduce ? undefined : { opacity: copyOpacity }}
      >
        <div className="max-w-xl space-y-8">
          <div className="space-y-5">
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: easeOut }}
              className="font-literata text-[clamp(2rem,4.5vw,3.35rem)] font-medium leading-[1.06] tracking-[0.04em] text-[#faf6ef] [text-shadow:0_2px_28px_rgba(0,0,0,0.75)]"
            >
              Where Beauty Transcends
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: reduce ? 0 : 0.1, ease: easeOut }}
              className="max-w-md text-sm font-normal leading-relaxed text-[#c4b8a4] [text-shadow:0_1px_18px_rgba(0,0,0,0.65)] md:text-[0.95rem]"
            >
              Ritual-led skincare, refined for a calm, luminous finish.
            </motion.p>
          </div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: reduce ? 0 : 0.2, ease: easeOut }}
            className="flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/shop"
                className="mystic-button-primary inline-flex min-h-[44px] min-w-[10rem] items-center justify-center rounded-full px-6 py-2.5 text-[0.65rem] uppercase tracking-[0.22em] transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(214,168,95,0.35)] md:min-h-[46px] md:px-7"
              >
                Shop rituals
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/ingredients"
                className="mystic-button-secondary inline-flex min-h-[44px] min-w-[10rem] items-center justify-center rounded-full px-6 py-2.5 text-[0.65rem] uppercase tracking-[0.22em] transition-[box-shadow,transform] duration-300 hover:border-[rgba(214,168,95,0.45)] hover:shadow-[0_0_20px_rgba(214,168,95,0.12)] md:min-h-[46px] md:px-7"
              >
                Ingredients
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.3, ease: easeOut }}
            className="flex flex-wrap gap-2.5 border-t border-[rgba(214,168,95,0.1)] pt-7"
          >
            {[
              "Dermatologist-informed",
              "5-step ritual",
              "Free U.S. shipping $75+",
            ].map((label, i) => (
              <motion.span
                key={label}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }}
                className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#9a8f7e] backdrop-blur-md md:px-3.5 md:py-2 md:text-[0.62rem]"
              >
                {label}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
