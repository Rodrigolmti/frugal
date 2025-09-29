const BaseStore = require('./base');

class Walmart extends BaseStore {
  constructor() {
    super('Walmart', 'https://www.walmart.ca');
  }

  getSelectors() {
    return {
      products: [
        '[data-automation-id="product-tile"]', // Main product tile from user's HTML
        '.mb0.ph1.pa0-xl.bb.b--near-white.w-25', // Product container class from HTML
        '[class*="product-tile"]',
        '.product-tile',
        '.product-item',
        '.product-card',
        '[data-testid*="product"]',
        '.grid-item',
        '.search-result-item',
        '[class*="ProductCard"]',
        '[class*="product-card"]',
        '[class*="product-item"]',
        '.product-container',
        '.item-container',
        '[data-qa*="product"]',
        '.product-wrapper'
      ],
      names: [
        '[data-automation-id="product-title"]', // Product title from user's HTML
        'span[data-automation-id="product-title"]', // More specific selector
        '[data-testid="product-name"]',
        '[data-testid="product-title"]',
        '.product-name',
        '.product-title',
        'h3',
        'h4',
        'h2',
        '.title',
        '[class*="name"]',
        '[class*="title"]',
        '.item-name',
        '.product-description h3',
        '.product-description h4'
      ],
      prices: [
        '[data-automation-id="product-price"] .b', // Current price from user's HTML (bold text)
        '[data-automation-id="product-price"]', // Fallback to container
        '.price-current .price-display', // Alternative price structure
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
        '.item-price',
        '.product-price',
        '.price-current',
        '.price-regular'
      ],
      brands: [
        // Brand might be part of the title or in a separate element
        '[data-automation-id="product-brand"]',
        '[data-testid="brand"]',
        '[data-testid="product-brand"]',
        '.brand',
        '.product-brand',
        '[class*="brand"]',
        '.brand-name'
      ],
      packageSizes: [
        // Package size is often part of the name or description
        '[data-automation-id="product-size"]',
        '[data-testid="size"]',
        '[data-testid="package-size"]',
        '[data-testid="product-size"]',
        '.size',
        '.package-size',
        '.product-size',
        '[class*="size"]',
        '.item-size',
        '.unit-size'
      ],
      images: [
        '[data-automation-id="product-image"] img', // Product image from user's HTML
        'img[data-automation-id="product-image"]', // Alternative selector
        '[data-testid="product-image"] img',
        '.product-image img',
        '.product-img img',
        'img[alt*="product"]',
        'img[alt*="Product"]',
        'img',
        '.item-image img',
        '.product-photo img'
      ],
      links: [
        'a[data-automation-id="product-title"]', // Link wrapping the product title from HTML
        'a[href*="/ip/"]', // Walmart product URLs typically use /ip/ pattern
        'a[href*="/product/"]',
        'a[href*="/product"]',
        'a[href*="/p/"]',
        'a[href*="/item"]',
        '.product-link',
        'a',
        '.item-link',
        '.product-url'
      ],
      originalPrices: [
        '[data-automation-id="product-price"] .strike', // Strikethrough price from HTML
        '[data-automation-id="was-price"]',
        '[data-testid="was-price"]',
        '[data-testid="original-price"]',
        '.was-price',
        '.original-price',
        '[class*="was-price"]',
        '[class*="original-price"]',
        '.price-was',
        '.strikethrough-price',
        '.strike'
      ]
    };
  }

  getSearchUrl(searchTerm) {
    return `${this.baseUrl}/en/search?q=${encodeURIComponent(searchTerm)}`;
  }

  async searchProducts(searchTerm) {
    let browser;
    try {
      this.log(`🔍 Starting search for: "${searchTerm}"`);
      
      // Use shared browser setup
      const browserSetup = await this.setupBrowser();
      browser = browserSetup.browser;
      const page = browserSetup.page;
      
      // Set additional headers to avoid detection
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      });
      
      // Navigate directly to search URL to save time
      const searchUrl = this.getSearchUrl(searchTerm);
      this.log(`Navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, { 
        waitUntil: 'domcontentloaded', // Changed from networkidle0 for faster loading
        timeout: 20000 // Reduced from 30000
      });

      // Reduced wait time for products to load
      await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced from 5000
      await this.waitForProducts(page);
      
      // Lightweight debug info
      if (this.debug) {
        this.log(`📊 Page loaded successfully`, 'debug');
      }

      const products = await this.extractProducts(page, searchTerm);
      this.log(`Extracted ${products.length} products from Walmart`);
      
      return this.processProducts(products);
      
    } catch (error) {
      this.log(`Error searching Walmart: ${error.message}`, 'error');
      throw error;
    } finally {
      if (browser) {
        await this.closeBrowser(browser);
      }
    }
  }

  async extractProducts(page, searchTerm) {
    const selectors = this.getSelectors();

    return await page.evaluate((selectors, debug) => {
      const results = [];
      let possibleProductElements = [];
      
      // Find product elements
      for (const selector of selectors.products) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          possibleProductElements = elements;
          if (debug) {
            console.log(`Using selector: ${selector}, found ${elements.length} elements`);
          }
          break;
        }
      }

      if (debug) {
        console.log(`Found ${possibleProductElements.length} possible product elements`);
      }

      possibleProductElements.forEach((element, index) => {
        try {
          if (debug && index < 3) {
            console.log(`Element ${index} structure:`, {
              tagName: element.tagName,
              className: element.className,
              textContent: element.textContent.substring(0, 100) + '...'
            });
          }

          let name = '';
          let priceText = '';
          let image = '';
          let link = '';
          let brand = '';
          let packageSize = '';
          let originalPrice = null;
          let id = '';

          // Extract ID from data-automation-id or href
          const automationId = element.getAttribute('data-automation-id');
          if (automationId) {
            id = automationId;
          }

          // Extract name
          for (const selector of selectors.names) {
            const nameEl = element.querySelector(selector);
            if (nameEl && nameEl.textContent.trim()) {
              name = nameEl.textContent.trim();
              break;
            }
          }

          // Extract brand (might be part of name)
          for (const selector of selectors.brands) {
            const brandEl = element.querySelector(selector);
            if (brandEl && brandEl.textContent.trim()) {
              brand = brandEl.textContent.trim();
              break;
            }
          }

          // Get package size information
          for (const selector of selectors.packageSizes) {
            const sizeEl = element.querySelector(selector);
            if (sizeEl && sizeEl.textContent.trim()) {
              packageSize = sizeEl.textContent.trim();
              break;
            }
          }

          // Extract price
          for (const selector of selectors.prices) {
            const priceEl = element.querySelector(selector);
            if (priceEl && priceEl.textContent.trim()) {
              priceText = priceEl.textContent.trim();
              break;
            }
          }

          // Extract original price (strikethrough)
          for (const selector of selectors.originalPrices) {
            const originalPriceEl = element.querySelector(selector);
            if (originalPriceEl && originalPriceEl.textContent.trim()) {
              const wasText = originalPriceEl.textContent.trim();
              const wasMatch = wasText.match(/\$?(\d+\.?\d*)/);
              if (wasMatch) {
                originalPrice = parseFloat(wasMatch[1]);
                break;
              }
            }
          }

          // Extract image
          for (const selector of selectors.images) {
            const imgEl = element.querySelector(selector);
            if (imgEl && imgEl.src && !imgEl.src.includes('placeholder')) {
              image = imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('srcset')?.split(' ')[0] || '';
              break;
            }
          }

          // Extract link
          for (const selector of selectors.links) {
            const linkEl = element.querySelector(selector);
            if (linkEl && linkEl.href) {
              link = linkEl.href;
              break;
            }
          }

          if (name && priceText) {
            let fullName = name;
            if (packageSize && !name.includes(packageSize)) {
              fullName = `${name} ${packageSize}`;
            }

            results.push({
              id: id,
              name: fullName,
              priceText: priceText,
              originalPrice: originalPrice,
              image: image,
              link: link,
              brand: brand,
              packageSize: packageSize
            });
          }
        } catch (error) {
          if (debug) {
            console.warn(`Error processing element ${index}:`, error.message);
          }
        }
      });
      
      return results;
    }, selectors, this.debug);
  }

  async getProductDetails(productId) {
    // Implementation for getting detailed product information
    // This would navigate to the specific product page and extract more details
    return {
      id: productId,
      description: '',
      ingredients: [],
      nutrition: {},
      reviews: []
    };
  }
}

module.exports = Walmart;
