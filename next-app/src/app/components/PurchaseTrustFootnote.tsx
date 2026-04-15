import Link from "next/link";

type PurchaseTrustFootnoteProps = {
  /** Tighter line height for cart / checkout rails */
  dense?: boolean;
};

/**
 * Discrete retail reassurance — policy detail lives on FAQ; this only orients shoppers.
 */
export function PurchaseTrustFootnote({ dense }: PurchaseTrustFootnoteProps) {
  return (
    <div
      className={`rounded-[16px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] px-4 py-3 ${
        dense ? "text-[0.62rem] leading-relaxed" : "text-[0.68rem] leading-relaxed"
      } text-[#8f8576]`}
    >
      <p>
        <span className="text-[#b8ab95]">Shipping:</span> Complimentary U.S. standard on orders $75+
        after promotions.
        <span className="mx-1.5 text-[#4a4035]">·</span>
        <span className="text-[#b8ab95]">Returns:</span> 30-day window for eligible unopened items
        — see{" "}
        <Link
          href="/faq#shipping-and-returns"
          className="text-[#d6a85f] underline-offset-4 hover:underline"
        >
          FAQ
        </Link>
        .
      </p>
      <p className={`mt-2 ${dense ? "text-[0.6rem]" : "text-[0.65rem]"} text-[#6f6a60]`}>
        Checkout is processed by Stripe; Mystique never stores your full card number.
      </p>
    </div>
  );
}
