const BaseStore = require('./base');

class RealCanadianSuperstore extends BaseStore {
  constructor() {
    super('Real Canadian Superstore', 'https://www.realcanadiansuperstore.ca');
  }

  getSelectors() {
    return {
      products: [
        '.css-yyn1h',
        '[data-testid*="product"]',
        '.product-tile',
        '.product-item',
        '.product-card',
        '[class*="product"]',
        '[data-qa*="product"]'
      ],
      names: [
        '[data-testid="product-title"]',
        'h3[data-testid="product-title"]',
        '.chakra-heading[data-testid="product-title"]'
      ],
      prices: [
        '[data-testid="regular-price"]',
        '[data-testid="sale-price"]',
        '[data-testid="price-product-tile"] span'
      ],
      brands: [
        '[data-testid="product-brand"]'
      ],
      packageSizes: [
        '[data-testid="product-package-size"]'
      ],
      images: [
        '[data-testid="product-image"] img',
        '.chakra-image'
      ],
      links: [
        '.chakra-linkbox__overlay',
        'a[href*="/p/"]'
      ],
      originalPrices: [
        '[data-testid="was-price"]'
      ]
    };
  }

  getSearchUrl(searchTerm) {
    return `${this.baseUrl}/search?search-bar=${encodeURIComponent(searchTerm)}`;
  }

  async searchProducts(searchTerm) {
    let browser;
    try {
      this.log(`🔍 Starting search for: "${searchTerm}"`);
      
      // Use shared browser setup
      const browserSetup = await this.setupBrowser();
      browser = browserSetup.browser;
      const page = browserSetup.page;

      // Test homepage accessibility
      const homepageAccessible = await this.testHomepageAccess(page);
      if (!homepageAccessible) {
        throw new Error('Website appears to be inaccessible');
      }

      // Navigate to search with fallback
      await this.navigateToSearch(page, searchTerm);

      this.log(`📄 Page loaded: "${await page.title()}"`);

      // Wait for products to load
      await this.waitForProducts(page);

      // Analyze page content if in debug mode
      if (this.debug) {
        const content = await page.content();
        this.log(`📊 Page content length: ${content.length}`, 'debug');

        const selectorCounts = await page.evaluate(() => {
          return {
            'css-yyn1h': document.querySelectorAll('.css-yyn1h').length,
            'product-tile': document.querySelectorAll('.product-tile').length,
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
      throw new Error(`Failed to search Real Canadian Superstore: ${error.message}`);
    } finally {
      await this.closeBrowser(browser);
    }
  }

  async extractProducts(page, searchTerm) {
    const selectors = this.getSelectors();
    
    return await page.evaluate((selectors, debug) => {
      const results = [];
      
      // Use the most specific selector first
      const possibleProductElements = document.querySelectorAll('.css-yyn1h');
      
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
            if (imgEl) {
              image = imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('srcset')?.split(' ')[0] || '';
              break;
            }
          }

          // Find product link
          for (const selector of selectors.links) {
            const linkEl = element.querySelector(selector);
            if (linkEl) {
              link = linkEl.href || linkEl.getAttribute('href') || '';
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

module.exports = RealCanadianSuperstore;
