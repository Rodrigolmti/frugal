module.exports = {
  id: 'real-canadian-superstore',
  name: 'Real Canadian Superstore',
  baseUrl: 'https://www.realcanadiansuperstore.ca',
  strategy: 'browser',
  browser: {
    searchUrl: (term) =>
      `https://www.realcanadiansuperstore.ca/search?search-bar=${encodeURIComponent(term)}`,
    selectors: {
      products: [
        '.css-yyn1h',
        '[data-testid*="product"]',
        '.product-tile',
        '.product-item',
        '.product-card',
        '[class*="product"]',
        '[data-qa*="product"]',
      ],
      names: [
        '[data-testid="product-title"]',
        'h3[data-testid="product-title"]',
        '.chakra-heading[data-testid="product-title"]',
      ],
      prices: [
        '[data-testid="regular-price"]',
        '[data-testid="sale-price"]',
        '[data-testid="price-product-tile"] span',
      ],
      brands: ['[data-testid="product-brand"]'],
      packageSizes: ['[data-testid="product-package-size"]'],
      images: [
        '[data-testid="product-image"] img',
        '.chakra-image',
      ],
      links: [
        '.chakra-linkbox__overlay',
        'a[href*="/p/"]',
      ],
      originalPrices: ['[data-testid="was-price"]'],
    },
    waitDelay: { min: 3000, max: 5000 },
  },
};
