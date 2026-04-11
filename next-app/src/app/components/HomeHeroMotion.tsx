"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const HERO_PORTRAIT_SRC = "/hero-portrait-silhouette.png";

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(mq.matches);
    queueMicrotask(() => {
      setReduce(mq.matches);
    });
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

export function HomeHeroMotion() {
  const reduce = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    if (!portraitRef.current) return;

    function update() {
      const section = sectionRef.current;
      const portrait = portraitRef.current;
      if (!section || !portrait) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const raw = 1 - rect.bottom / (rect.height + vh);
      const progress = Math.max(0, Math.min(1, raw));
      const yPct = progress * 12;
      const scale = 1 + progress * 0.04;
      portrait.style.transform = `translate3d(0, ${yPct}%, 0) scale(${scale})`;
      const copy = copyRef.current;
      if (copy) {
        copy.style.opacity = String(1 - progress * 0.08);
      }
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [reduce]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[min(85vh,800px)] overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-[#010203]" />

      <div
        ref={portraitRef}
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={reduce ? undefined : { transform: "translate3d(0, 0%, 0) scale(1)" }}
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
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000000_0%,rgba(0,0,0,0.92)_min(42%,22rem),rgba(0,0,0,0.55)_50%,rgba(3,4,6,0.2)_68%,rgba(5,6,9,0.45)_100%)]" />
      {reduce ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_78%_38%,rgba(214,168,95,0.07),transparent_58%),radial-gradient(circle_at_88%_88%,rgba(255,120,60,0.04),transparent_45%)]" />
      ) : (
        <div
          aria-hidden
          className="mystic-hero-ambient pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_78%_38%,rgba(214,168,95,0.09),transparent_58%),radial-gradient(circle_at_88%_88%,rgba(255,120,60,0.05),transparent_45%)]"
        />
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

      <div
        ref={copyRef}
        className="relative z-10 w-full px-4 pb-[4.5rem] pt-16 md:px-6 md:pb-[6rem] md:pt-24 lg:px-10 xl:px-14"
        style={{ opacity: 1 }}
      >
        <div className="max-w-xl space-y-8">
          <div className="space-y-5">
            <h1
              className={`font-literata text-[clamp(2rem,4.5vw,3.35rem)] font-medium leading-[1.06] tracking-[0.04em] text-[#faf6ef] [text-shadow:0_2px_28px_rgba(0,0,0,0.75)] ${
                reduce ? "" : "mystic-hero-reveal mystic-hero-reveal--title"
              }`}
            >
              Where Beauty Transcends
            </h1>
            <p
              className={`max-w-md text-sm font-normal leading-relaxed text-[#c4b8a4] [text-shadow:0_1px_18px_rgba(0,0,0,0.65)] md:text-[0.95rem] ${
                reduce ? "" : "mystic-hero-reveal mystic-hero-reveal--sub"
              }`}
            >
              Cleanse-to-SPF routines with layer-friendly textures—comfort first, then
              glow.
            </p>
          </div>
          <div
            className={`flex flex-col gap-3 sm:flex-row sm:gap-4 ${
              reduce ? "" : "mystic-hero-reveal mystic-hero-reveal--cta"
            }`}
          >
            <div className="transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]">
              <Link
                href="/shop"
                className="mystic-button-primary inline-flex min-h-[44px] min-w-[10rem] items-center justify-center rounded-full px-6 py-2.5 text-[0.65rem] uppercase tracking-[0.22em] transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(214,168,95,0.35)] md:min-h-[46px] md:px-7"
              >
                Shop skincare
              </Link>
            </div>
            <div className="transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]">
              <Link
                href="/ingredients"
                className="mystic-button-secondary inline-flex min-h-[44px] min-w-[10rem] items-center justify-center rounded-full px-6 py-2.5 text-[0.65rem] uppercase tracking-[0.22em] transition-[box-shadow,transform] duration-300 hover:border-[rgba(214,168,95,0.45)] hover:shadow-[0_0_20px_rgba(214,168,95,0.12)] md:min-h-[46px] md:px-7"
              >
                Ingredient guide
              </Link>
            </div>
          </div>
          <div
            className={`flex flex-wrap gap-2.5 pt-10 ${
              reduce ? "" : "mystic-hero-reveal mystic-hero-reveal--badges"
            }`}
          >
            {[
              {
                label: "Expert-informed formulas",
                title:
                  "Developed with input from independent skincare science advisors; not medical advice.",
              },
              {
                label: "Five-step routine",
                title: "Cleanse, tone, treat, moisturize, protect.",
              },
              {
                label: "Free U.S. shipping $75+",
                title: "Contiguous United States; threshold before tax.",
              },
            ].map((item, i) => (
              <span
                key={item.label}
                title={item.title}
                className={`rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#9a8f7e] backdrop-blur-md md:px-3.5 md:py-2 md:text-[0.62rem] ${
                  reduce ? "" : "mystic-hero-reveal-pill"
                }`}
                style={reduce ? undefined : { animationDelay: `${0.35 + i * 0.08}s` }}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
