const BaseStore = require('./base');

class SaveOnFoods extends BaseStore {
  constructor() {
    super('Save On Foods', 'https://www.saveonfoods.com');
  }

  getSelectors() {
    return {
      products: [
        '.ProductCardWrapper--6uxd5a', // Main product card wrapper from user's HTML
        '[data-testid*="ProductCardWrapper"]', // Alternative selector for product cards
        '[class*="ProductCardWrapper"]', // Fallback for any ProductCardWrapper class
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
        '[data-testid*="ProductNameTestId"]', // From user's HTML
        '.ProductCardTitle--1ln1u3g div', // Product title from user's HTML
        '.AriaProductTitleParagraph--1yc7f4f:first-of-type', // Fallback from aria title
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
        '.ProductCardPrice--1sznkcp', // Current price from user's HTML
        '[data-testid="productCardPricing-div-testId"] span:first-child span', // Alternative price selector
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
        '.ProductAQABrand--9zdrc2', // Brand name from user's HTML
        '[data-testid="ProductCardAQABrand"]', // Alternative brand selector
        '[data-testid="brand"]',
        '[data-testid="product-brand"]',
        '.brand',
        '.product-brand',
        '[class*="brand"]',
        '.brand-name'
      ],
      packageSizes: [
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
        '.ProductCardImageWrapper--klzjiv img', // Product image from user's HTML
        '[data-testid*="productCardImage"] img', // Alternative image selector
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
        '.ProductCardHiddenLink--v3c62m', // Hidden link from user's HTML
        'a[href*="/product/"]', // Product links
        'a[href*="/product"]',
        'a[href*="/p/"]',
        'a[href*="/item"]',
        '.product-link',
        'a',
        '.item-link',
        '.product-url'
      ],
      originalPrices: [
        '.WasPrice--1iwg7oj', // "Was" price from user's HTML
        '[data-testid="was-price"]',
        '[data-testid="original-price"]',
        '.was-price',
        '.original-price',
        '[class*="was-price"]',
        '[class*="original-price"]',
        '.price-was',
        '.strikethrough-price'
      ]
    };
  }

  getSearchUrl(searchTerm) {
    // Based on the provided search URL example:
    // https://www.saveonfoods.com/sm/planning/rsid/1982/results?q=simply+apple+juice
    // We'll use the rsid parameter (1982) which appears to be a default store ID
    return `${this.baseUrl}/sm/planning/rsid/1982/results?q=${encodeURIComponent(searchTerm)}`;
  }

  async searchProducts(searchTerm) {
    let browser;
    try {
      this.log(`🔍 Starting search for: "${searchTerm}"`);
      
      // Use shared browser setup
      const browserSetup = await this.setupBrowser();
      browser = browserSetup.browser;
      const page = browserSetup.page;

      // Navigate directly to search with built-in fallback
      await this.navigateToSearch(page, searchTerm);

      this.log(`📄 Page loaded: "${await page.title()}"`);

      // Wait for products to load
      await this.waitForProducts(page);

      // Lightweight debug info
      if (this.debug) {
        this.log(`📊 Page loaded successfully`, 'debug');
      }

      // Extract products using store-specific logic
      const rawProducts = await this.extractProducts(page, searchTerm);
      
      // Process and deduplicate products using shared logic
      const processedProducts = this.processProducts(rawProducts);

      this.log(`✅ Successfully processed ${processedProducts.length} products`);
      return processedProducts;
    } catch (error) {
      this.log(`Error searching: ${error.message}`, 'error');
      if (this.debug) {
        this.log(`Stack trace: ${error.stack}`, 'debug');
      }
      throw new Error(`Failed to search Save On Foods: ${error.message}`);
    } finally {
      await this.closeBrowser(browser);
    }
  }

  async extractProducts(page, searchTerm) {
    const selectors = this.getSelectors();
    
    return await page.evaluate((selectors, debug) => {
      const results = [];
      
      // Try each selector until we find products
      let possibleProductElements = [];
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
          // Debug logging for first few elements
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

          // Extract product name
          for (const selector of selectors.names) {
            const nameEl = element.querySelector(selector);
            if (nameEl && nameEl.textContent.trim()) {
              name = nameEl.textContent.trim();
              // Clean up common suffixes
              name = name.replace(/Open product description$/, '').trim();
              break;
            }
          }
          
          // Get brand information
          for (const selector of selectors.brands) {
            const brandEl = element.querySelector(selector);
            if (brandEl && brandEl.textContent.trim()) {
              brand = brandEl.textContent.trim();
              break;
            }
          }
          
          // Combine brand and name if both exist
          if (brand && name && !name.toLowerCase().includes(brand.toLowerCase())) {
            name = `${brand} ${name}`;
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

          // Find image
          for (const selector of selectors.images) {
            const imgEl = element.querySelector(selector);
            if (imgEl && imgEl.src && !imgEl.src.includes('placeholder')) {
              image = imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('srcset')?.split(' ')[0] || '';
              break;
            }
          }

          // Find product link
          for (const selector of selectors.links) {
            const linkEl = element.querySelector(selector);
            if (linkEl && linkEl.href) {
              link = linkEl.href;
              break;
            }
          }
          
          // Get original/was price if it exists
          let originalPrice = null;
          for (const selector of selectors.originalPrices) {
            const wasPriceEl = element.querySelector(selector);
            if (wasPriceEl && wasPriceEl.textContent.trim()) {
              const wasText = wasPriceEl.textContent.trim();
              const wasMatch = wasText.match(/\$?(\d+\.?\d*)/);
              if (wasMatch) {
                originalPrice = parseFloat(wasMatch[1]);
                break;
              }
            }
          }

          // Only include if we have both name and price
          if (name && priceText) {
            // Clean up the name - add package size if available
            let fullName = name;
            if (packageSize && !name.includes(packageSize)) {
              fullName = `${name} ${packageSize}`;
            }
            
            results.push({
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
    try {
      return {
        id: productId,
        store: this.name,
        detailsAvailable: false
      };
    } catch (error) {
      this.log(`Error getting product details: ${error.message}`, 'error');
      throw new Error(`Failed to get product details: ${error.message}`);
    }
  }
}

module.exports = SaveOnFoods;
