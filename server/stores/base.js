const puppeteer = require('puppeteer');

/**
 * Base Store Interface
 * All store adapters must implement these methods and can use shared foundation methods
 */
class BaseStore {
  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.debug = process.env.DEBUG_SCRAPING === 'true';
  }

  /**
   * Search for products by term - must be implemented by subclasses
   * @param {string} searchTerm - The product to search for
   * @returns {Promise<Array>} Array of product objects
   */
  async searchProducts(searchTerm) {
    throw new Error('searchProducts method must be implemented');
  }

  /**
   * Get detailed product information - must be implemented by subclasses
   * @param {string} productId - The product identifier
   * @returns {Promise<Object>} Detailed product information
   */
  async getProductDetails(productId) {
    throw new Error('getProductDetails method must be implemented');
  }

  /**
   * Get store-specific selectors - must be implemented by subclasses
   * @returns {Object} Object containing selector arrays for different elements
   */
  getSelectors() {
    throw new Error('getSelectors method must be implemented');
  }

  /**
   * Get store-specific search URL - must be implemented by subclasses
   * @param {string} searchTerm - The search term
   * @returns {string} The search URL
   */
  getSearchUrl(searchTerm) {
    throw new Error('getSearchUrl method must be implemented');
  }

  /**
   * Shared browser setup with optimized configuration
   * @returns {Promise<Browser>} Configured Puppeteer browser instance
   */
  async setupBrowser() {
    this.log('🚀 Launching browser...');
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      timeout: 60000
    });

    const page = await browser.newPage();
    
    // Set user agent and viewport
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    return { browser, page };
  }

  /**
   * Test homepage accessibility
   * @param {Page} page - Puppeteer page instance
   * @param {string} url - URL to test (defaults to baseUrl)
   * @returns {Promise<boolean>} Whether the homepage is accessible
   */
  async testHomepageAccess(page, url = this.baseUrl) {
    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 20000 
      });
      this.log(`✅ Homepage accessible: ${url}`);
      return true;
    } catch (error) {
      this.log(`❌ Cannot access homepage: ${error.message}`);
      return false;
    }
  }

  /**
   * Navigate to search URL with fallback to homepage search
   * @param {Page} page - Puppeteer page instance
   * @param {string} searchTerm - The search term
   * @param {string} fallbackUrl - Fallback URL if direct search fails
   * @returns {Promise<boolean>} Whether navigation was successful
   */
  async navigateToSearch(page, searchTerm, fallbackUrl = this.baseUrl) {
    const searchUrl = this.getSearchUrl(searchTerm);
    this.log(`🔍 Navigating to search: ${searchUrl}`);
    
    try {
      await page.goto(searchUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      
      // Wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 5000));
      this.log(`✅ Search page loaded`);
      return true;
      
    } catch (navError) {
      this.log(`⚠️ Direct search failed, trying homepage search...`);
      
      // Fallback to homepage search
      await page.goto(fallbackUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      
      return await this.performHomepageSearch(page, searchTerm);
    }
  }

  /**
   * Perform search from homepage using search input
   * @param {Page} page - Puppeteer page instance
   * @param {string} searchTerm - The search term
   * @returns {Promise<boolean>} Whether search was successful
   */
  async performHomepageSearch(page, searchTerm) {
    const searchSelectors = [
      'input[type="search"]',
      'input[name*="search"]',
      'input[placeholder*="search"]',
      '#search',
      '[data-testid*="search"]',
      '.search-input'
    ];
    
    for (const selector of searchSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.type(selector, searchTerm);
        await page.keyboard.press('Enter');
        await new Promise(resolve => setTimeout(resolve, 5000));
        this.log(`✅ Search performed from homepage`);
        return true;
      } catch (e) {
        continue;
      }
    }
    
    throw new Error('No search input found on homepage');
  }

  /**
   * Wait for products to load using store-specific selectors
   * @param {Page} page - Puppeteer page instance
   * @returns {Promise<boolean>} Whether products were found
   */
  async waitForProducts(page) {
    const selectors = this.getSelectors();
    const productSelectors = selectors.products || [];
    
    try {
      await page.waitForSelector(productSelectors.join(','), { timeout: 10000 });
      this.log(`✅ Products loaded`);
      return true;
    } catch (waitError) {
      this.log(`⚠️ No products found with standard selectors`);
      return false;
    }
  }

  /**
   * Extract products from page using store-specific logic
   * @param {Page} page - Puppeteer page instance
   * @param {string} searchTerm - The search term for context
   * @returns {Promise<Array>} Array of raw product data
   */
  async extractProducts(page, searchTerm) {
    // This method should be overridden by subclasses with store-specific extraction logic
    throw new Error('extractProducts method must be implemented by subclasses');
  }

  /**
   * Process and deduplicate extracted products
   * @param {Array} rawProducts - Array of raw product data
   * @returns {Array} Array of processed and normalized products
   */
  processProducts(rawProducts) {
    const processedProducts = [];
    const seenProducts = new Set();
    
    rawProducts.forEach((rawProduct, index) => {
      try {
        if (this.debug) {
          this.log(`📦 Processing product ${index + 1}: "${rawProduct.name}"`);
        }

        if (rawProduct.name && rawProduct.priceText) {
          // Extract price from text
          let priceMatch = rawProduct.priceText.match(/\$?(\d+\.?\d*)/);
          let price = priceMatch ? parseFloat(priceMatch[1]) : 0;
          
          // Handle sale prices
          if (rawProduct.priceText.toLowerCase().includes('sale')) {
            const saleMatch = rawProduct.priceText.match(/sale\$?(\d+\.?\d*)/i);
            if (saleMatch) {
              price = parseFloat(saleMatch[1]);
            }
          }

          if (price > 0) {
            // Create unique identifier for deduplication
            const productId = rawProduct.link ? 
              rawProduct.link.split('/').pop().split('?')[0] : 
              `${rawProduct.name.replace(/\s+/g, '-')}-${price}`;
            const uniqueKey = `${rawProduct.name}-${price}-${productId}`;
            
            // Skip duplicates
            if (seenProducts.has(uniqueKey)) {
              if (this.debug) {
                this.log(`   ⚠️ Skipping duplicate: ${rawProduct.name}`);
              }
              return;
            }
            
            seenProducts.add(uniqueKey);
            
            const product = {
              id: productId,
              name: rawProduct.name,
              price: price,
              originalPrice: rawProduct.originalPrice || null,
              image: this.normalizeImageUrl(rawProduct.image),
              url: this.normalizeProductUrl(rawProduct.link),
              inStock: true,
              unit: this.extractUnit(rawProduct.packageSize || rawProduct.priceText),
              description: rawProduct.packageSize || ''
            };

            processedProducts.push(this.normalizeProduct(product));
            
            if (this.debug) {
              this.log(`   ✅ Added: ${rawProduct.name}`);
            }
          }
        }
      } catch (error) {
        this.log(`⚠️ Error processing product ${index}: ${error.message}`);
      }
    });

    return processedProducts;
  }

  /**
   * Normalize image URL to be absolute
   * @param {string} imageUrl - Raw image URL
   * @returns {string} Normalized absolute image URL
   */
  normalizeImageUrl(imageUrl) {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${this.baseUrl}${imageUrl}`;
  }

  /**
   * Normalize product URL to be absolute
   * @param {string} productUrl - Raw product URL
   * @returns {string} Normalized absolute product URL
   */
  normalizeProductUrl(productUrl) {
    if (!productUrl) return '';
    if (productUrl.startsWith('http')) return productUrl;
    return `${this.baseUrl}${productUrl}`;
  }

  /**
   * Extract unit information from text
   * @param {string} text - Text containing unit information
   * @returns {string} Extracted unit
   */
  extractUnit(text) {
    if (!text) return '';
    const unitMatch = text.match(/(per\s+\w+|each|\/\w+)/i);
    return unitMatch ? unitMatch[0] : '';
  }

  /**
   * Safe browser cleanup
   * @param {Browser} browser - Puppeteer browser instance
   */
  async closeBrowser(browser) {
    if (browser) {
      try {
        await browser.close();
        this.log(`🔒 Browser closed`);
      } catch (closeError) {
        this.log(`⚠️ Error closing browser: ${closeError.message}`);
      }
    }
  }

  /**
   * Streamlined logging with debug levels
   * @param {string} message - Log message
   * @param {string} level - Log level (info, debug, error)
   */
  log(message, level = 'info') {
    const prefix = `[${this.name}]`;
    
    switch (level) {
      case 'error':
        console.error(`${prefix} ❌ ${message}`);
        break;
      case 'debug':
        if (this.debug) {
          console.log(`${prefix} 🔍 ${message}`);
        }
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Normalize product data to common format
   * @param {Object} rawProduct - Raw product data from store
   * @returns {Object} Normalized product object
   */
  normalizeProduct(rawProduct) {
    return {
      id: rawProduct.id || '',
      name: rawProduct.name || '',
      price: rawProduct.price || 0,
      originalPrice: rawProduct.originalPrice || null,
      image: rawProduct.image || '',
      url: rawProduct.url || '',
      store: this.name,
      inStock: rawProduct.inStock !== false,
      unit: rawProduct.unit || '',
      description: rawProduct.description || ''
    };
  }
}

module.exports = BaseStore;
