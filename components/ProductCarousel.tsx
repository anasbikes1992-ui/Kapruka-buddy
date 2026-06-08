"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { type Product } from "@/lib/types";
import { DESIGN_TOKENS, MOTION_VARIANTS, getMotionVariant } from "@/lib/design-tokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ProductCard } from "@/components/ProductCard";

interface ProductCarouselProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistIds?: Set<string>;
}

export function ProductCarousel({
  products,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
}: ProductCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const staggerVariant = getMotionVariant(MOTION_VARIANTS.staggerContainer, prefersReducedMotion);

  // Auto-scroll carousel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || products.length === 0 || prefersReducedMotion) {
      return;
    }

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame
    let animationFrameId: number;

    const autoScroll = () => {
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        // Reset to beginning
        container.scrollLeft = 0;
        scrollPosition = 0;
      } else {
        scrollPosition += scrollSpeed;
        container.scrollLeft = scrollPosition;
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Start auto-scroll after 3 seconds
    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(autoScroll);
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [products.length, prefersReducedMotion]);

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
        ref={scrollContainerRef}
        className="flex snap-x gap-4 overflow-x-auto pb-2 scroll-smooth"
        variants={staggerVariant}
        initial="hidden"
        animate="visible"
      >
        {products.map((product) => (
          <div key={product.id} className="snap-start">
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isInWishlist={wishlistIds?.has(product.id)}
            />
          </div>
        ))}
      </motion.div>
    </motion.section>
  );
}
