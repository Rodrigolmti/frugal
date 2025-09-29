/**
 * Format price to Canadian currency
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(price);
};

/**
 * Calculate savings between two prices
 */
export const calculateSavings = (originalPrice: number, salePrice: number): number => {
  return originalPrice - salePrice;
};

/**
 * Calculate savings percentage
 */
export const calculateSavingsPercentage = (originalPrice: number, salePrice: number): number => {
  if (originalPrice === 0) return 0;
  return ((originalPrice - salePrice) / originalPrice) * 100;
};

/**
 * Find the best price from a list of prices
 */
export const findBestPrice = (prices: number[]): { min: number; max: number; savings: number } => {
  if (prices.length === 0) return { min: 0, max: 0, savings: 0 };
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const savings = max - min;
  
  return { min, max, savings };
};
