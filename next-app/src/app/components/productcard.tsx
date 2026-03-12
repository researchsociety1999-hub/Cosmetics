"use client";

import React from "react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white/20 max-w-sm mx-auto">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 300px"
        />
        <div className="absolute top-4 right-4 bg-amber-500/90 px-3 py-1 rounded-full text-xs font-bold text-black">
          New
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-serif font-bold text-amber-600 tracking-tight">
            ${product.price}
          </span>
          <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black px-8 py-3 rounded-xl font-semibold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 whitespace-nowrap">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
