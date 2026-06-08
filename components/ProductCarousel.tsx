"use client";

import { motion } from "framer-motion";

import { type Product } from "@/lib/types";
import { DESIGN_TOKENS, MOTION_VARIANTS, getMotionVariant } from "@/lib/design-tokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ProductCard } from "@/components/ProductCard";

interface ProductCarouselProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductCarousel({ products, onAddToCart }: ProductCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const staggerVariant = getMotionVariant(MOTION_VARIANTS.staggerContainer, prefersReducedMotion);

  if (products.length === 0) {
    return null;
  }

  return (
    <motion.section
      variants={getMotionVariant(MOTION_VARIANTS.staggerChild, prefersReducedMotion)}
      className="space-y-3"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: DESIGN_TOKENS.duration.base,
          ease: DESIGN_TOKENS.ease.out,
        }}
        className="flex items-end justify-between"
      >
        <h2 className="text-xl font-semibold">Handpicked matches</h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">Swipe or scroll for more</p>
      </motion.div>
      <motion.div
        className="flex snap-x gap-4 overflow-x-auto pb-2"
        variants={staggerVariant}
        initial="hidden"
        animate="visible"
      >
        {products.map((product) => (
          <div key={product.id} className="snap-start">
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </div>
        ))}
      </motion.div>
    </motion.section>
  );
}
