"use client";

import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "../NewsletterForm";

export function HomeNewsletter() {
  return (
    <section className="mystic-section relative py-16 pb-20 md:py-24 md:pb-28">
      <div className="mystic-section-shell">
        <section
          aria-labelledby="home-story-heading"
          className="mystique-material mystique-material--story mystique-section-ore mb-14 overflow-hidden rounded-[26px] border border-[rgba(214,168,95,0.1)] bg-[linear-gradient(168deg,rgba(255,255,255,0.026)_0%,rgba(255,255,255,0.01)_46%,rgba(0,0,0,0.15)_100%)] shadow-[0_24px_72px_rgba(0,0,0,0.4)]"
        >
          <div className="grid gap-10 p-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-12 md:p-10">
            <div className="space-y-6">
              <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#8f8475]">
                The story
              </p>
              <h2
                id="home-story-heading"
                className="font-literata text-3xl font-light leading-[1.2] tracking-[0.11em] text-[#f5eee3] md:text-[2.35rem]"
              >
                California restraint, built into ritual.
              </h2>
              <p className="max-w-xl text-sm leading-[1.75] text-[#a99e8c] md:text-base md:leading-[1.78]">
                Mystique is designed for the routines you repeat: plush textures, clear steps,
                and finishes that look calm in real light.
              </p>
              {/* Ghost CTA — subordinate to hero; no competing weight */}
              <Link
                href="/about"
                className="inline-flex min-h-[44px] items-center text-[0.6rem] uppercase tracking-[0.26em] text-[#9a8a72] underline-offset-[5px] transition-[color] duration-500 ease-out hover:text-[#c4b49a] hover:underline"
              >
                Read the story
              </Link>
            </div>

            <figure className="group relative aspect-[3/2] w-full overflow-hidden rounded-[22px] border border-[rgba(214,168,95,0.12)] bg-[#05070d] shadow-[0_28px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <Image
                src="/home-story-ritual.png"
                alt="Mystique ritual — golden dropper and hands in soft light"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 520px"
                className="object-cover object-[52%_42%] transition-[transform,filter] duration-[1.35s] ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                quality={90}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#03050a] via-[#05070d]/55 to-[#0a0c14]/25"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_18%,rgba(214,168,95,0.14),transparent_58%)] mix-blend-soft-light opacity-90"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#04060d]/40"
              />
              <div
                aria-hidden
                className="absolute inset-0 ring-1 ring-inset ring-white/[0.06] rounded-[22px]"
              />
              <figcaption className="absolute inset-0 flex flex-col items-start justify-end p-7 md:p-8">
                <span
                  aria-hidden
                  className="mb-3 h-px w-10 bg-gradient-to-r from-[rgba(214,168,95,0.65)] to-transparent"
                />
                <p className="text-[0.58rem] uppercase tracking-[0.34em] text-[#e8d4b0] [text-shadow:0_1px_18px_rgba(0,0,0,0.85)]">
                  Est. Ritual
                </p>
                <p className="mt-2 max-w-[16rem] font-literata text-lg font-light leading-snug tracking-[0.12em] text-[#f5eee3] [text-shadow:0_2px_28px_rgba(0,0,0,0.75)] md:text-xl">
                  Built for repetition.
                </p>
              </figcaption>
            </figure>
          </div>
        </section>

        <div className="home-luxury-frame mystic-card mystique-material mystique-material--newsletter mystique-section-ore grid gap-10 rounded-[26px] px-7 py-10 md:grid-cols-[1fr_auto] md:items-center md:gap-12 md:px-10 md:py-11">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[#8f8475]">
              Newsletter
            </p>
            <h2 className="mt-4 font-literata text-4xl font-light leading-[1.15] tracking-[0.11em] text-[#f5eee3]">
              Notes from the studio.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-[1.75] text-[#a99e8c]">
              Join for early access to launches, restock alerts, and ritual guidance&#x2014;written
              with restraint.
            </p>
          </div>
          <div>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
