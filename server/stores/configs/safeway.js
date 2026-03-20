module.exports = {
  id: 'safeway',
  name: 'Safeway',
  baseUrl: 'https://www.safeway.ca',
  strategy: 'browser',
  browser: {
    searchUrl: (term) =>
      `https://voila.ca/search?q=${encodeURIComponent(term)}`,
    fallbackUrl: 'https://voila.ca',
    selectors: {
      products: [
        '.product-tile',
        '.product-item',
        '.product-card',
        '[data-testid*="product"]',
        '.grid-item',
        '.search-result-item',
        '[class*="ProductCard"]',
        '[class*="product-card"]',
      ],
      names: [
        '[data-testid="product-name"]',
        '[data-testid="product-title"]',
        '.product-name',
        '.product-title',
        'h3',
        'h4',
        '.title',
        '[class*="name"]',
        '[class*="title"]',
      ],
      prices: [
        '[data-testid="price"]',
        '[data-testid="current-price"]',
        '[data-testid="regular-price"]',
        '[data-testid="sale-price"]',
        '.price',
        '.current-price',
        '.regular-price',
        '.sale-price',
        '[class*="price"]',
        '.cost',
      ],
      brands: [
        '[data-testid="brand"]',
        '[data-testid="product-brand"]',
        '.brand',
        '.product-brand',
        '[class*="brand"]',
      ],
      packageSizes: [
        '[data-testid="size"]',
        '[data-testid="package-size"]',
        '[data-testid="product-size"]',
        '.size',
        '.package-size',
        '.product-size',
        '[class*="size"]',
      ],
      images: [
        '[data-testid="product-image"] img',
        '.product-image img',
        '.product-img img',
        'img[alt*="product"]',
        'img',
      ],
      links: [
        'a[href*="/product"]',
        'a[href*="/p/"]',
        'a[href*="/item"]',
        '.product-link',
        'a',
      ],
      originalPrices: [
        '[data-testid="was-price"]',
        '[data-testid="original-price"]',
        '.was-price',
        '.original-price',
        '[class*="was-price"]',
        '[class*="original-price"]',
      ],
    },
    waitDelay: { min: 3000, max: 5000 },
  },
  overrides: {
    normalizeImageUrl: (url) => {
      if (!url) return '';
      return url.startsWith('http') ? url : `https://voila.ca${url}`;
    },
    normalizeProductUrl: (url) => {
      if (!url) return '';
      return url.startsWith('http') ? url : `https://voila.ca${url}`;
    },
  },
};
