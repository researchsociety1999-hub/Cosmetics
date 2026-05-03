import Image from "next/image";

type IngredientSpotlightThumbProps = {
  id: string;
  /** Prefer `/ingredients/{id}.svg` or `.jpg` in `public`; remote URLs need `next.config.js`. */
  imageSrc?: string | null;
  /** Used for accessible labeling; heading nearby keeps alt decorative if empty. */
  name: string;
  /** `lg` = bigger tile (e.g. ingredients index) for sharper photo detail. */
  size?: "sm" | "lg";
  /**
   * `poster` = vertical campaign art; portrait frame and lighter grading so baked-in type stays
   * readable.
   */
  presentation?: "thumb" | "poster";
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
  presentation = "thumb",
}: IngredientSpotlightThumbProps) {
  const src = (imageSrc?.trim() || `/ingredients/${id}.svg`) as string;
  const isSvg = src.endsWith(".svg");
  const isPoster = presentation === "poster";
  const isLg = size === "lg";

  const frameClass = isPoster
    ? isLg
      ? "aspect-[3/5] w-[min(100%,8.75rem)] rounded-[1.25rem] sm:w-[9.25rem]"
      : "aspect-[3/5] w-[min(100%,5.75rem)] rounded-[1.125rem] sm:w-[6.5rem]"
    : isLg
      ? "h-[7rem] w-[7rem] rounded-[1.25rem] sm:h-[7.5rem] sm:w-[7.5rem]"
      : "h-[5.25rem] w-[5.25rem] rounded-[1.125rem] sm:h-24 sm:w-24";

  const imgW = isPoster ? (isLg ? 360 : 240) : isLg ? 320 : 192;
  const imgH = isPoster ? (isLg ? 600 : 400) : isLg ? 320 : 192;

  const sizesAttr = isPoster
    ? isLg
      ? "(max-width:640px) min(100%, 8.75rem), 9.25rem"
      : "(max-width:640px) min(100%, 5.75rem), 6.5rem"
    : isLg
      ? "(max-width:640px) 7rem, 7.5rem"
      : "(max-width:640px) 5.25rem, 6rem";

  const rimRounded = isLg ? "rounded-[1.25rem]" : "rounded-[1.125rem]";

  const baseImgClass = isSvg
    ? "relative z-0 h-full w-full scale-[1.02] object-cover object-center brightness-[0.98] contrast-[1.06] saturate-[0.92] transition duration-500 ease-out group-hover:scale-[1.05] group-hover:brightness-100"
    : isPoster
      ? "relative z-0 h-full w-full object-cover object-[50%_42%] brightness-[1.04] contrast-[1.04] saturate-[0.96] transition duration-500 ease-out group-hover:brightness-[1.06]"
      : "relative z-0 h-full w-full scale-[1.02] object-cover object-center brightness-[1.02] contrast-[1.05] saturate-[0.92] transition duration-500 ease-out group-hover:scale-[1.05] group-hover:brightness-[1.06] group-hover:saturate-[0.98]";

  return (
    <div className="group relative shrink-0" data-image-slot={`ingredient:${id}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[rgba(214,168,95,0.38)] via-[rgba(214,168,95,0.05)] to-transparent opacity-95 [mask-image:linear-gradient(155deg,black,transparent_88%)]"
      />
      <div
        className={`relative overflow-hidden border border-white/[0.06] bg-[#07080e] shadow-[0_12px_36px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(214,168,95,0.07)] ${frameClass}`}
      >
        <Image
          src={src}
          alt={isSvg || isPoster ? "" : `${name} ingredient texture`}
          width={imgW}
          height={imgH}
          sizes={sizesAttr}
          unoptimized={isSvg}
          className={baseImgClass}
        />
        <div
          aria-hidden
          className={
            isPoster
              ? "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-[#0a0c12]/[0.08] via-transparent to-[#05060c]/[0.2] mix-blend-multiply"
              : isSvg
                ? "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-[#12141c]/[0.22] via-[#04050a]/[0.18] to-[#020308]/[0.42] mix-blend-multiply"
                : "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-[#0a0c12]/[0.18] via-transparent to-[#05060c]/[0.38] mix-blend-multiply"
          }
        />
        <div
          aria-hidden
          className={
            isPoster
              ? "pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_95%_70%_at_35%_12%,rgba(214,168,95,0.06),transparent_58%)] mix-blend-soft-light"
              : isSvg
                ? "pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_95%_70%_at_35%_12%,rgba(214,168,95,0.2),transparent_58%)] mix-blend-soft-light"
                : "pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_95%_70%_at_35%_12%,rgba(214,168,95,0.12),transparent_55%)] mix-blend-soft-light"
          }
        />
        <div
          aria-hidden
          className={
            isPoster
              ? "pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-[rgba(4,5,10,0.04)] via-transparent to-[rgba(2,3,8,0.22)]"
              : isSvg
                ? "pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-[rgba(4,5,10,0.15)] via-transparent to-[rgba(2,3,8,0.72)]"
                : "pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-[rgba(4,5,10,0.06)] via-transparent to-[rgba(2,3,8,0.38)]"
          }
        />
        <div
          aria-hidden
          className={
            isPoster
              ? "pointer-events-none absolute inset-0 z-[4] opacity-15 mix-blend-overlay"
              : isSvg
                ? "pointer-events-none absolute inset-0 z-[4] opacity-50 mix-blend-overlay"
                : "pointer-events-none absolute inset-0 z-[4] opacity-25 mix-blend-overlay"
          }
          style={{
            backgroundImage:
              "radial-gradient(circle at 28% 18%, rgba(255,250,240,0.06), transparent 42%)",
          }}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[5] shadow-[inset_0_0_0_1px_rgba(214,168,95,0.12)] ${rimRounded}`}
        />
      </div>
      <span className="sr-only">{name}</span>
    </div>
  );
}
