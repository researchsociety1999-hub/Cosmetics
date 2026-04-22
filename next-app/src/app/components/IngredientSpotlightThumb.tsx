import Image from "next/image";

type IngredientSpotlightThumbProps = {
  id: string;
  /** Prefer `/ingredients/{id}.svg` or `.jpg` in `public`; remote URLs need `next.config.js`. */
  imageSrc?: string | null;
  /** Used for accessible labeling; heading nearby keeps alt decorative if empty. */
  name: string;
  /** `lg` = bigger tile (e.g. ingredients index) for sharper photo detail. */
  size?: "sm" | "lg";
};

/**
 * Ingredient thumb: photos are graded to match Mystique cards—deep blacks, muted saturation,
 * warm gold lift—so literal stock shots feel part of the same ritual / noir palette.
 */
export function IngredientSpotlightThumb({
  id,
  imageSrc,
  name,
  size = "sm",
}: IngredientSpotlightThumbProps) {
  const src = (imageSrc?.trim() || `/ingredients/${id}.svg`) as string;
  const isSvg = src.endsWith(".svg");
  const isLg = size === "lg";
  const frameClass = isLg
    ? "h-[7rem] w-[7rem] rounded-[1.25rem] sm:h-[7.5rem] sm:w-[7.5rem]"
    : "h-[5.25rem] w-[5.25rem] rounded-[1.125rem] sm:h-24 sm:w-24";
  const imgPx = isLg ? 320 : 192;
  const sizesAttr = isLg
    ? "(max-width:640px) 7rem, 7.5rem"
    : "(max-width:640px) 5.25rem, 6rem";
  const rimRounded = isLg ? "rounded-[1.25rem]" : "rounded-[1.125rem]";

  return (
    <div className="group relative shrink-0" data-image-slot={`ingredient:${id}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[rgba(214,168,95,0.38)] via-[rgba(214,168,95,0.05)] to-transparent opacity-95 [mask-image:linear-gradient(155deg,black,transparent_88%)]"
      />
      <div
        className={`relative overflow-hidden border border-white/[0.06] bg-[#07080e] shadow-[0_12px_36px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(214,168,95,0.07)] ${frameClass}`}
      >
        {/* Base photo: pull into brand palette (cooler shadows, less “stock” saturation) */}
        <Image
          src={src}
          alt={isSvg ? "" : `${name} ingredient texture`}
          width={imgPx}
          height={imgPx}
          sizes={sizesAttr}
          unoptimized={isSvg}
          className={
            isSvg
              ? "relative z-0 h-full w-full scale-[1.02] object-cover object-center brightness-[0.98] contrast-[1.06] saturate-[0.92] transition duration-500 ease-out group-hover:scale-[1.05] group-hover:brightness-100"
              : "relative z-0 h-full w-full scale-[1.02] object-cover object-center brightness-[1.02] contrast-[1.05] saturate-[0.92] transition duration-500 ease-out group-hover:scale-[1.05] group-hover:brightness-[1.06] group-hover:saturate-[0.98]"
          }
        />
        {/* SVG: stronger grade. Raster: light veil so photos stay legible. */}
        <div
          aria-hidden
          className={
            isSvg
              ? "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-[#12141c]/[0.22] via-[#04050a]/[0.18] to-[#020308]/[0.42] mix-blend-multiply"
              : "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-[#0a0c12]/[0.18] via-transparent to-[#05060c]/[0.38] mix-blend-multiply"
          }
        />
        <div
          aria-hidden
          className={
            isSvg
              ? "pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_95%_70%_at_35%_12%,rgba(214,168,95,0.2),transparent_58%)] mix-blend-soft-light"
              : "pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_95%_70%_at_35%_12%,rgba(214,168,95,0.12),transparent_55%)] mix-blend-soft-light"
          }
        />
        <div
          aria-hidden
          className={
            isSvg
              ? "pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-[rgba(4,5,10,0.15)] via-transparent to-[rgba(2,3,8,0.72)]"
              : "pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-[rgba(4,5,10,0.06)] via-transparent to-[rgba(2,3,8,0.38)]"
          }
        />
        <div
          aria-hidden
          className={
            isSvg
              ? "pointer-events-none absolute inset-0 z-[4] opacity-50 mix-blend-overlay"
              : "pointer-events-none absolute inset-0 z-[4] opacity-25 mix-blend-overlay"
          }
          style={{
            backgroundImage:
              "radial-gradient(circle at 28% 18%, rgba(255,250,240,0.06), transparent 42%)",
          }}
        />
        {/* Hairline gold inner rim to echo mystic-card borders */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[5] shadow-[inset_0_0_0_1px_rgba(214,168,95,0.12)] ${rimRounded}`}
        />
      </div>
      <span className="sr-only">{name}</span>
    </div>
  );
}
