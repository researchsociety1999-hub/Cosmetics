"use client";

import React from "react";
import Image from "next/image";

// BUILT-IN TYPES (no external deps)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = (props: ProductCardProps) => {
  const { product } = props;
  
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white/20 max-w-sm mx-auto">
      <div className="relative h-64 overflow-hidden bg-gray-200">
        <Image
          src={product.image || "https://via.placeholder.com/400/1a1a1a/FFD700?text=MYSTIC"}
          alt={product.name}
          fill={true}
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 300px"
        />
        <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500/90 px-3 py-1 rounded-full text-xs font-bold text-black shadow-lg">
          New Arrival
        </div>
      </div>
      <div className="p-6 space-y-3">
        <h3 className="text-xl font-serif font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent line-clamp-2 leading-tight">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {product.description}
        </p>
        <div className="flex items-end justify-between pt-2 border-t border-gray-100">
          <span className="text-3xl font-serif font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent tracking-tight">
            ${product.price.toFixed(0)}
          </span>
          <button className="group/btn bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black px-6 py-2.5 rounded-xl font-semibold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap">
            Add to Cart
            <span className="ml-1 transition-transform group-hover/btn:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
