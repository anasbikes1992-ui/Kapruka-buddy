"use client";

import { Heart, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

import { type Product } from "@/lib/types";
import { DESIGN_TOKENS, MOTION_VARIANTS, getMotionVariant } from "@/lib/design-tokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
}

export function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }: ProductCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const cardVariant = getMotionVariant(MOTION_VARIANTS.staggerChild, prefersReducedMotion);

  return (
    <motion.article
      variants={cardVariant}
      className="glass group relative flex h-full min-w-[250px] flex-col overflow-hidden rounded-3xl transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative h-44 w-full bg-gradient-to-br from-orange-100/70 to-orange-50/70 dark:from-orange-950/30 dark:to-orange-900/20">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            priority={false}
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-stone-500">
            No image available
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DESIGN_TOKENS.duration.base }}
          className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white"
        >
          {product.id}
        </motion.div>
        {onToggleWishlist ? (
          <motion.button
            type="button"
            onClick={() => onToggleWishlist(product)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-3 top-3 rounded-full bg-white/80 p-2 text-orange-600 transition hover:bg-white dark:bg-stone-700/80 dark:text-orange-400"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className="h-4 w-4"
              fill={isInWishlist ? "currentColor" : "none"}
            />
          </motion.button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            {product.category}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-tight">{product.name}</h3>
          {product.description ? (
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{product.description}</p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-lg font-semibold text-orange-700 dark:text-orange-400">
            LKR {product.price.toLocaleString()}
          </p>
          <motion.button
            type="button"
            onClick={() => onAddToCart(product)}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
