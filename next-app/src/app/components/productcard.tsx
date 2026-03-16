"use client";

import React from "react";
import Image from "next/image";
import type { Product } from "../lib/types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = (props: ProductCardProps) => {
  const { product } = props;
  const price = ((product.price_cents ?? 0) / 100).toFixed(2);
  const imgSrc = product.image_url && !product.image_url.includes("your-cdn")
    ? product.image_url
    : null;

  return (
    <div className="group relative flex flex-col bg-[#0e1117] border border-[#C9A84C]/20 rounded-2xl overflow-hidden hover:border-[#C9A84C]/50 hover:-translate-y-1 transition-all duration-500 shadow-lg hover:shadow-[0_8px_32px_rgba(201,168,76,0.15)] max-w-sm mx-auto w-full">
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-[#1a1f2e]">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={product.name}
            fill={true}
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-[#C9A84C]/30 text-5xl font-serif">M</span>
          </div>
        )}
        {/* New Arrival badge */}
        <div className="absolute top-3 right-3 bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#C9A84C] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
          New Arrival
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="text-base font-serif font-semibold text-[#f5eee3] leading-snug line-clamp-2">
          {product.name}
        </h3>
        <p className="text-[#b8ab95] text-sm leading-relaxed line-clamp-3 flex-1">
          {product.description ?? ""}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-[#C9A84C]/10 mt-auto">
          <span className="text-2xl font-serif font-bold text-[#C9A84C] tracking-tight">
            ${price}
          </span>
          <button className="bg-[#C9A84C]/10 hover:bg-[#C9A84C] border border-[#C9A84C]/50 hover:border-[#C9A84C] text-[#C9A84C] hover:text-black px-5 py-2 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-300">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
