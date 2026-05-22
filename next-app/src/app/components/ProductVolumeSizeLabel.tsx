/**
 * ProductVolumeSizeLabel
 * Renders the volume/size label on the Product Detail Page.
 * Shows nothing if volume_size_label is null or empty.
 *
 * Usage:
 *   <ProductVolumeSizeLabel label={product.volume_size_label} />
 */

import React from 'react';

interface ProductVolumeSizeLabelProps {
  label: string | null | undefined;
  className?: string;
}

export function ProductVolumeSizeLabel({
  label,
  className = '',
}: ProductVolumeSizeLabelProps) {
  if (!label) return null;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        bg-stone-100 text-stone-600 tracking-wide uppercase
        dark:bg-stone-800 dark:text-stone-300
        ${className}`}
      aria-label={`Size: ${label}`}
    >
      {label}
    </span>
  );
}

export default ProductVolumeSizeLabel;
