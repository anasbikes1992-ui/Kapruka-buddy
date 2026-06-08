/**
 * Fuzzy matching and search utilities for product discovery
 */

import type { Product } from "@/lib/types";

/**
 * Simple fuzzy matching - checks if all chars from pattern appear in text in order
 * Example: "flwr" matches "flower"
 */
export function fuzzyMatch(text: string, pattern: string): boolean {
  const t = text.toLowerCase();
  const p = pattern.toLowerCase();
  let tIndex = 0;

  for (let pIndex = 0; pIndex < p.length; pIndex++) {
    tIndex = t.indexOf(p[pIndex], tIndex);
    if (tIndex === -1) return false;
    tIndex++;
  }
  return true;
}

/**
 * Calculate fuzzy match score (0-1, higher is better match)
 */
export function fuzzyScore(text: string, pattern: string): number {
  const t = text.toLowerCase();
  const p = pattern.toLowerCase();

  if (t === p) return 1.0;
  if (!fuzzyMatch(t, p)) return 0;

  // Score based on how many chars match consecutively
  let score = 0;
  let consecutive = 0;

  for (let i = 0; i < t.length; i++) {
    if (p.includes(t[i])) {
      consecutive++;
      score += consecutive * 0.1;
    } else {
      consecutive = 0;
    }
  }

  // Prefer earlier matches
  const patternIndex = t.indexOf(p);
  if (patternIndex !== -1) {
    score += (1 - patternIndex / t.length) * 0.5;
  }

  return Math.min(score, 1);
}

/**
 * Stopwords to filter from search queries
 */
const STOPWORDS = new Set([
  "can", "get", "for", "the", "you", "got", "what", "have", "do", "i", "a", "an",
  "is", "are", "to", "me", "my", "with", "from", "at", "by", "on", "in", "of",
  "show", "tell", "give", "find", "look", "search", "please", "want", "need", "like",
  "or", "and", "be", "as", "if", "this", "that", "it", "just", "so",
]);

/**
 * Extract meaningful keywords from search query
 */
export function extractKeywords(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

/**
 * Search products by category
 */
export function searchByCategory(
  products: Product[],
  categoryKeyword: string,
): Product[] {
  const normalized = categoryKeyword.toLowerCase();
  return products.filter(
    (p) =>
      p.category.toLowerCase().includes(normalized) ||
      fuzzyMatch(p.category, normalized),
  );
}

/**
 * Search products by price range
 */
export function filterByPrice(
  products: Product[],
  minPrice: number,
  maxPrice: number,
): Product[] {
  return products.filter((p) => p.price >= minPrice && p.price <= maxPrice);
}

/**
 * Comprehensive product search with multiple strategies
 */
export function searchProducts(
  products: Product[],
  query: string,
): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return products.slice(0, 6);
  }

  const keywords = extractKeywords(query);
  if (keywords.length === 0) {
    return products.slice(0, 6);
  }

  // Strategy 1: Exact keyword matching
  let results = products.filter((product) => {
    const haystack = `${product.name} ${product.category} ${
      product.description ?? ""
    }`.toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
  });

  // Strategy 2: Fuzzy matching
  if (results.length === 0) {
    results = products
      .map((product) => {
        const haystack = `${product.name} ${product.category} ${
          product.description ?? ""
        }`;
        const score = Math.max(
          ...keywords.map((keyword) => fuzzyScore(haystack, keyword)),
        );
        return { product, score };
      })
      .filter(({ score }) => score > 0.3)
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product);
  }

  // Strategy 3: Partial matching
  if (results.length === 0) {
    results = products.filter((product) => {
      const haystack = `${product.name} ${product.category} ${
        product.description ?? ""
      }`.toLowerCase();
      return keywords.some(
        (keyword) =>
          keyword.length > 2 && haystack.includes(keyword.substring(0, 3)),
      );
    });
  }

  // Strategy 4: Return top recommendations
  if (results.length === 0) {
    return products.slice(0, 6);
  }

  return results.slice(0, 8);
}
