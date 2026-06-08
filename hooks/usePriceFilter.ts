import { useCallback, useState } from "react";

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 20000; // LKR

export function usePriceFilter() {
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);

  const handleMinPriceChange = useCallback((value: number) => {
    if (value <= maxPrice) {
      setMinPrice(value);
    }
  }, [maxPrice]);

  const handleMaxPriceChange = useCallback((value: number) => {
    if (value >= minPrice) {
      setMaxPrice(value);
    }
  }, [minPrice]);

  const resetPrice = useCallback(() => {
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
  }, []);

  const isFiltered =
    minPrice !== DEFAULT_MIN_PRICE || maxPrice !== DEFAULT_MAX_PRICE;

  return {
    minPrice,
    maxPrice,
    handleMinPriceChange,
    handleMaxPriceChange,
    resetPrice,
    isFiltered,
  };
}
