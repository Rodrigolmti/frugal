const BaseStore = require('./base');

class Safeway extends BaseStore {
  constructor() {
    super('Safeway', 'https://www.safeway.ca');
    this.voilaUrl = 'https://voila.ca';
    this.voilaApiUrl = 'https://voila.ca/api/v5';
    this.clientRouteId = '26186555-b0d7-4251-91e1-fca38fd364aa';
  }

  getSelectors() {
    return {
      products: [
        '.product-tile',
        '.product-item',
        '.product-card',
        '[data-testid*="product"]',
        '.grid-item',
        '.search-result-item',
        '[class*="ProductCard"]',
        '[class*="product-card"]'
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
        '[class*="title"]'
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
        '.cost'
      ],
      brands: [
        '[data-testid="brand"]',
        '[data-testid="product-brand"]',
        '.brand',
        '.product-brand',
        '[class*="brand"]'
      ],
      packageSizes: [
        '[data-testid="size"]',
        '[data-testid="package-size"]',
        '[data-testid="product-size"]',
        '.size',
        '.package-size',
        '.product-size',
        '[class*="size"]'
      ],
      images: [
        '[data-testid="product-image"] img',
        '.product-image img',
        '.product-img img',
        'img[alt*="product"]',
        'img'
      ],
      links: [
        'a[href*="/product"]',
        'a[href*="/p/"]',
        'a[href*="/item"]',
        '.product-link',
        'a'
      ],
      originalPrices: [
        '[data-testid="was-price"]',
        '[data-testid="original-price"]',
        '.was-price',
        '.original-price',
        '[class*="was-price"]',
        '[class*="original-price"]'
      ]
    };
  }

  getSearchUrl(searchTerm) {
    return `${this.voilaUrl}/search?q=${encodeURIComponent(searchTerm)}`;
  }

  async searchProducts(searchTerm) {
    let browser;
    try {
      this.log(`🔍 Starting search for: "${searchTerm}"`);
      
      // Use shared browser setup
      const browserSetup = await this.setupBrowser();
      browser = browserSetup.browser;
      const page = browserSetup.page;

      // Test Voilà access first, fallback to main Safeway site
      let homepageAccessible = await this.testHomepageAccess(page, this.voilaUrl);
      if (!homepageAccessible) {
        this.log(`🔄 Trying main Safeway site...`);
        homepageAccessible = await this.testHomepageAccess(page, this.baseUrl);
        if (!homepageAccessible) {
          throw new Error('Neither Voilà nor Safeway sites are accessible');
        }
      }

      // Navigate to search with fallback
      await this.navigateToSearch(page, searchTerm, this.voilaUrl);

      this.log(`📄 Page loaded: "${await page.title()}"`);

      // Wait for products to load
      await this.waitForProducts(page);

      // Analyze page content if in debug mode
      if (this.debug) {
        const content = await page.content();
        this.log(`📊 Page content length: ${content.length}`, 'debug');

        const selectorCounts = await page.evaluate(() => {
          return {
            'product-tile': document.querySelectorAll('.product-tile').length,
            'product-item': document.querySelectorAll('.product-item').length,
            'data-testid-product': document.querySelectorAll('[data-testid*="product"]').length,
            'any-price': document.querySelectorAll('[class*="price"], [data-testid*="price"]').length
          };
        });
        this.log(`🎯 Selector analysis: ${JSON.stringify(selectorCounts)}`, 'debug');
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
      throw new Error(`Failed to search Safeway: ${error.message}`);
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

  // Override normalizeImageUrl for Voilà-specific URLs
  normalizeImageUrl(imageUrl) {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${this.voilaUrl}${imageUrl}`;
  }

  // Override normalizeProductUrl for Voilà-specific URLs
  normalizeProductUrl(productUrl) {
    if (!productUrl) return '';
    if (productUrl.startsWith('http')) return productUrl;
    return `${this.voilaUrl}${productUrl}`;
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

module.exports = Safeway;
