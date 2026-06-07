"use client";

import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

import { type Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass flex h-full min-w-[250px] flex-col overflow-hidden rounded-3xl"
    >
      <div className="relative h-44 w-full bg-orange-100/70">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-stone-500">No image available</div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
          {product.id}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{product.category}</p>
          <h3 className="mt-1 text-lg font-semibold leading-tight">{product.name}</h3>
          {product.description ? <p className="mt-2 text-sm text-stone-600">{product.description}</p> : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-lg font-semibold text-orange-700">LKR {product.price.toLocaleString()}</p>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </motion.article>
  );
}
