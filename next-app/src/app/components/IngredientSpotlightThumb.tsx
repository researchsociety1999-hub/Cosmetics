import Image from "next/image";

type IngredientSpotlightThumbProps = {
  id: string;
  /** Prefer `/ingredients/{id}.svg` from `public`; remote URLs allowed if configured in `next.config.js`. */
  imageSrc?: string | null;
  /** Used for accessible labeling; heading nearby keeps alt decorative if empty. */
  name: string;
};

/**
 * Premium ingredient tile art: local SVG gradients + gold rim, soft vignette, Mystique palette.
 */
export function IngredientSpotlightThumb({
  id,
  imageSrc,
  name,
}: IngredientSpotlightThumbProps) {
  const src = (imageSrc?.trim() || `/ingredients/${id}.svg`) as string;
  const isSvg = src.endsWith(".svg");

  return (
    <div className="group relative shrink-0">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[rgba(214,168,95,0.42)] via-[rgba(214,168,95,0.06)] to-transparent opacity-90 [mask-image:linear-gradient(160deg,black,transparent_85%)]"
      />
      <div className="relative h-[5.25rem] w-[5.25rem] overflow-hidden rounded-[1.125rem] shadow-[0_10px_32px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.06)] sm:h-24 sm:w-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_90%_65%_at_40%_15%,rgba(214,168,95,0.18),transparent_58%)] mix-blend-soft-light"
        />
        <Image
          src={src}
          alt=""
          width={192}
          height={192}
          unoptimized={isSvg}
          className="h-full w-full scale-[1.02] object-cover object-center brightness-[1.05] saturate-[0.92] transition duration-500 ease-out group-hover:scale-[1.06] group-hover:brightness-110 group-hover:saturate-100"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-[rgba(4,5,10,0.05)] via-transparent to-[rgba(4,5,10,0.5)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[3] opacity-[0.35] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.07), transparent 45%)",
          }}
        />
      </div>
      <span className="sr-only">{name}</span>
    </div>
  );
}
