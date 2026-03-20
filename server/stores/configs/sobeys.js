module.exports = {
  id: 'sobeys',
  name: 'Sobeys',
  baseUrl: 'https://www.sobeys.com',
  strategy: 'browser',
  browser: {
    searchUrl: (term) =>
      `https://www.sobeys.com/?query=${encodeURIComponent(term)}&tab=products`,
    selectors: {
      products: [
        'span[data-object-id]',
        'div[data-id]',
        '.product-tile',
        '.product-item',
        '.product-card',
      ],
      names: [
        '.card-title span',
        'p.card-title span',
        'span.text-body.text-grey900',
        '.product-name',
        '.product-title',
        'h3',
        'h4',
      ],
      prices: [
        'span.font-bold.text-body',
        'span.text-red200.font-bold.text-body',
        '.price',
        '.current-price',
        '.regular-price',
        '.sale-price',
      ],
      brands: [
        'p.text-sm.font-bold.capitalize',
        '.brand',
        '.product-brand',
        '[class*="brand"]',
      ],
      packageSizes: [
        '.size',
        '.package-size',
        '.product-size',
        '[class*="size"]',
      ],
      images: [
        'img[alt]',
        '.product-image img',
        '.product-img img',
        'img',
      ],
      links: [
        'a[href*="/products/"]',
        'a.absolute.inset-0',
        'a[href*="/product"]',
        'a[href*="/p/"]',
        '.product-link',
        'a',
      ],
      originalPrices: [
        'span.font-bold.text-body.line-through',
        '.was-price',
        '.original-price',
        '[class*="was-price"]',
        '[class*="original-price"]',
      ],
    },
    waitDelay: { min: 3000, max: 5000 },
    extractOverrides: {
      nameFallback: true,
      sobeysSalePrice: true,
    },
  },
};
