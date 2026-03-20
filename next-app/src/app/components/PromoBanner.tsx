"use client";

import { useEffect, useMemo, useState } from "react";
import type { PromoCampaign } from "../lib/types";

interface PromoBannerProps {
  promo: PromoCampaign;
}

export function PromoBanner({ promo }: PromoBannerProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000 * 60);
    return () => window.clearInterval(id);
  }, []);

  const remaining = useMemo(() => {
    if (!promo.end_date) return null;
    const end = new Date(promo.end_date);
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return null;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    return { days, hours };
  }, [promo.end_date, now]);

  return (
    <div className="border-b border-[rgba(214,168,95,0.35)] bg-gradient-to-r from-[#0b0b10] via-[#1f2933] to-[#0b0b10] py-2 text-xs text-[#f5eee3]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 px-4 sm:flex-row sm:gap-3 md:px-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 items-center rounded-full bg-[rgba(214,168,95,0.12)] px-3 text-[0.65rem] uppercase tracking-[0.24em] text-[#d6a85f]">
            {promo.name || "Limited Offer"}
          </span>
          {promo.description && (
            <span className="hidden text-[0.7rem] text-[#f5eee3] sm:inline">
              {promo.description}
            </span>
          )}
        </div>
        {remaining && (
          <div className="text-[0.7rem] text-[#f5eee3]">
            Ends in{" "}
            <span className="font-semibold text-[#d6a85f]">
              {remaining.days}d {remaining.hours}h
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
