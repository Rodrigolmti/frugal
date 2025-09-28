const BaseStore = require('./base');

class Sobeys extends BaseStore {
  constructor() {
    super('Sobeys', 'https://www.sobeys.com');
  }

  getSelectors() {
    return {
      products: [
        'span[data-object-id]',
        'div[data-id]',
        '.product-tile',
        '.product-item',
        '.product-card'
      ],
      names: [
        '.card-title span',
        'p.card-title span',
        'span.text-body.text-grey900',
        '.product-name',
        '.product-title',
        'h3',
        'h4'
      ],
      prices: [
        'span.font-bold.text-body',
        'span.text-red200.font-bold.text-body',
        '.price',
        '.current-price',
        '.regular-price',
        '.sale-price'
      ],
      brands: [
        'p.text-sm.font-bold.capitalize',
        '.brand',
        '.product-brand',
        '[class*="brand"]'
      ],
      packageSizes: [
        '.size',
        '.package-size',
        '.product-size',
        '[class*="size"]'
      ],
      images: [
        'img[alt]',
        '.product-image img',
        '.product-img img',
        'img'
      ],
      links: [
        'a[href*="/products/"]',
        'a.absolute.inset-0',
        'a[href*="/product"]',
        'a[href*="/p/"]',
        '.product-link',
        'a'
      ],
      originalPrices: [
        'span.font-bold.text-body.line-through',
        '.was-price',
        '.original-price',
        '[class*="was-price"]',
        '[class*="original-price"]'
      ]
    };
  }

  getSearchUrl(searchTerm) {
    // Based on the provided search URL format:
    // https://www.sobeys.com/?query=simply%20apple%20juice&tab=products
    return `${this.baseUrl}/?query=${encodeURIComponent(searchTerm)}&tab=products`;
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
        throw new Error('Sobeys website appears to be inaccessible');
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
            'product-tile': document.querySelectorAll('.product-tile').length,
            'product-item': document.querySelectorAll('.product-item').length,
            'product-card': document.querySelectorAll('.product-card').length,
            'data-testid-product': document.querySelectorAll('[data-testid*="product"]').length,
            'any-price': document.querySelectorAll('[class*="price"], [data-testid*="price"]').length,
            'product-wrapper': document.querySelectorAll('.product-wrapper').length,
            'product-container': document.querySelectorAll('.product-container').length
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
      throw new Error(`Failed to search Sobeys: ${error.message}`);
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

          // Extract product name - Sobeys specific logic
          for (const selector of selectors.names) {
            const nameEl = element.querySelector(selector);
            if (nameEl && nameEl.textContent.trim()) {
              name = nameEl.textContent.trim();
              // Clean up truncated names (remove "...")
              name = name.replace(/\.\.\.$/g, '').trim();
              break;
            }
          }
          
          // Fallback: try to get name from title attribute
          if (!name) {
            const linkEl = element.querySelector('a[title]');
            if (linkEl && linkEl.getAttribute('title')) {
              name = linkEl.getAttribute('title').trim();
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

          // Extract price - Sobeys specific logic
          for (const selector of selectors.prices) {
            const priceEl = element.querySelector(selector);
            if (priceEl && priceEl.textContent.trim()) {
              priceText = priceEl.textContent.trim();
              // Take the first price found (current/sale price)
              if (priceText.includes('$')) {
                break;
              }
            }
          }

          // Find image - Sobeys specific logic
          for (const selector of selectors.images) {
            const imgEl = element.querySelector(selector);
            if (imgEl && imgEl.src && !imgEl.src.includes('placeholder')) {
              image = imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('srcset')?.split(' ')[0] || '';
              // Sobeys images are already full URLs
              if (image && image.startsWith('https://media.sobeys.com')) {
                break;
              } else if (image && !image.startsWith('http')) {
                // Handle relative URLs
                break;
              }
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
          
          // Get original/was price if it exists - Sobeys specific logic
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
          
          // Additional check for sale prices in red text
          if (!originalPrice) {
            const salePriceEl = element.querySelector('span.text-red200.font-bold.text-body');
            const regularPriceEl = element.querySelector('span.font-bold.text-body.line-through');
            if (salePriceEl && regularPriceEl) {
              const regularText = regularPriceEl.textContent.trim();
              const regularMatch = regularText.match(/\$?(\d+\.?\d*)/);
              if (regularMatch) {
                originalPrice = parseFloat(regularMatch[1]);
                // Update priceText to use the sale price
                priceText = salePriceEl.textContent.trim();
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

module.exports = Sobeys;
