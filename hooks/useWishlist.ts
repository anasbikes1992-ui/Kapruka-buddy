import { useCallback, useEffect, useState } from "react";

import type { Product } from "@/lib/types";

const WISHLIST_STORAGE_KEY = "kapruka-buddy-wishlist";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Product[];
        setWishlist(parsed);
      }
    } catch (error) {
      console.warn(
        "[Wishlist] Failed to load from localStorage:",
        error instanceof Error ? error.message : String(error),
      );
    }

    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever wishlist changes
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.warn(
        "[Wishlist] Failed to save to localStorage:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }, [wishlist, isLoaded]);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((p) => p.id === productId),
    [wishlist],
  );

  const addToWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const toggleWishlist = useCallback(
    (product: Product) => {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist],
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  return {
    wishlist,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isLoaded,
  };
}
