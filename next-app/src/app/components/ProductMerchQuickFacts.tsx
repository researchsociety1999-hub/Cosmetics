import type { Product, ProductVariant } from "../lib/types";
import {
  getPrimaryBenefitLine,
  getSkinTypesLine,
  getTextureFinishCue,
  getVolumeSizeLabel,
} from "../lib/productMerch";

type Props = {
  product: Product;
  variants?: ProductVariant[];
};

export function ProductMerchQuickFacts({ product, variants = [] }: Props) {
  const sizeVariantLabel =
    variants.find((v) => (v.stock ?? 0) > 0)?.variant_name ??
    variants[0]?.variant_name ??
    null;

  const skin = getSkinTypesLine(product);
  const benefit = getPrimaryBenefitLine(product);
  const texture = getTextureFinishCue(product);
  const size = getVolumeSizeLabel(product, sizeVariantLabel);

  const chips = [
    skin ? { k: "Best for", v: skin } : null,
    benefit ? { k: "Primary benefit", v: benefit } : null,
    texture ? { k: "Texture", v: texture } : null,
    size ? { k: "Size", v: size } : null,
  ].filter((c): c is { k: string; v: string } => c != null);

  if (!chips.length) {
    return null;
  }

  return (
    <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-[rgba(214,168,95,0.12)] pt-5 text-[0.72rem] text-[#b8ab95]">
      {chips.map(({ k, v }) => (
        <div key={k} className="min-w-0 max-w-[220px]">
          <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[#7a7265]">
            {k}
          </dt>
          <dd className="mt-0.5 leading-snug text-[#e8dcc8]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
