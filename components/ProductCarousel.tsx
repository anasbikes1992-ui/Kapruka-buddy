"use client";

import { type Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

interface ProductCarouselProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductCarousel({ products, onAddToCart }: ProductCarouselProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold">Handpicked matches</h2>
        <p className="text-sm text-stone-600">Swipe or scroll for more</p>
      </div>
      <div className="flex snap-x gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <div key={product.id} className="snap-start">
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </section>
  );
}
