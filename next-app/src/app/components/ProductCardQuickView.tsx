"use client";

import { useRef, useState } from "react";
import type { Product } from "../lib/types";
import { QuickViewDialog } from "./QuickViewDialog";

export function ProductCardQuickView({
  product,
  compact,
}: {
  product: Product;
  compact: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleClose() {
    setOpen(false);
    queueMicrotask(() => {
      triggerRef.current?.focus();
    });
  }

  const btnClass = compact
    ? "inline-flex min-h-[40px] items-center justify-center rounded-full border border-[rgba(214,168,95,0.28)] bg-[rgba(2,3,6,0.4)] px-2.5 py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-[#e8dcc8] transition hover:border-[rgba(214,168,95,0.45)] hover:bg-[rgba(214,168,95,0.08)] sm:min-h-[44px] sm:px-3 sm:text-[0.58rem]"
    : "inline-flex min-h-[44px] items-center justify-center rounded-full border border-[rgba(214,168,95,0.28)] bg-[rgba(2,3,6,0.4)] px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#e8dcc8] transition hover:border-[rgba(214,168,95,0.45)] hover:bg-[rgba(214,168,95,0.08)]";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={btnClass}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Quick view: ${product.name}`}
        onClick={() => setOpen(true)}
      >
        Quick view
      </button>
      <QuickViewDialog product={product} open={open} onClose={handleClose} />
    </>
  );
}
