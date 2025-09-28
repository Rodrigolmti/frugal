const puppeteer = require('puppeteer');
const BaseStore = require('./base');

class Safeway extends BaseStore {
  constructor() {
    super('Safeway', 'https://www.safeway.ca');
    this.voilaApiUrl = 'https://voila.ca/api/v5';
    this.clientRouteId = '26186555-b0d7-4251-91e1-fca38fd364aa';
  }

  async searchProducts(searchTerm) {
    let browser;
    try {
      console.log(`🔍 Starting Safeway search for: "${searchTerm}"`);
      
      // Launch browser with optimized settings
      browser = await puppeteer.launch({
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

      // First, try to access Voilà (Safeway's online platform)
      console.log(`🏠 Testing Voilà access first...`);
      const voilaUrl = 'https://voila.ca';
      
      try {
        await page.goto(voilaUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 20000 
        });
        console.log(`✅ Voilà homepage accessible`);
      } catch (homeError) {
        console.log(`❌ Cannot access Voilà: ${homeError.message}`);
        // Fallback to main Safeway site
        console.log(`🔄 Trying main Safeway site...`);
        await page.goto(this.baseUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 20000 
        });
      }

      // Try to use Voilà's search functionality
      console.log(`🔍 Attempting to search on Voilà...`);
      
      try {
        // Navigate to Voilà search
        const searchUrl = `${voilaUrl}/search?q=${encodeURIComponent(searchTerm)}`;
        console.log(`🌐 Navigating to: ${searchUrl}`);
        
        await page.goto(searchUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000 
        });
        
        // Wait for dynamic content
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log(`⏳ Waited for dynamic content to load`);
        
      } catch (navError) {
        console.log(`⚠️  Direct search navigation failed: ${navError.message}`);
        
        // Alternative: try searching from the homepage
        console.log(`🔄 Trying to search from homepage instead...`);
        await page.goto(voilaUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        
        // Try to find and use the search box
        try {
          const searchSelectors = [
            'input[type="search"]',
            'input[name*="search"]',
            'input[placeholder*="search"]',
            '#search',
            '[data-testid*="search"]',
            '.search-input'
          ];
          
          let searchInput = null;
          for (const selector of searchSelectors) {
            try {
              await page.waitForSelector(selector, { timeout: 3000 });
              searchInput = selector;
              break;
            } catch (e) {
              continue;
            }
          }
          
          if (searchInput) {
            await page.type(searchInput, searchTerm);
            await page.keyboard.press('Enter');
            await new Promise(resolve => setTimeout(resolve, 5000));
            console.log(`✅ Searched from homepage`);
          } else {
            throw new Error('No search input found');
          }
        } catch (searchError) {
          console.log(`❌ Could not perform search from homepage: ${searchError.message}`);
          throw new Error(`Unable to perform search: ${searchError.message}`);
        }
      }

      console.log(`📄 Page loaded, title: "${await page.title()}"`);

      // Wait for products to load - try multiple possible selectors for Voilà/Safeway
      console.log(`⏳ Waiting for products to load...`);
      
      try {
        const productSelectors = [
          '[data-testid*="product"]',
          '.product-tile',
          '.product-item',
          '.product-card',
          '[class*="product"]',
          '[data-qa*="product"]',
          '.grid-item',
          '.search-result',
          '[data-cy*="product"]'
        ];
        
        await page.waitForSelector(productSelectors.join(','), { timeout: 10000 });
        console.log(`✅ Product elements found!`);
      } catch (waitError) {
        console.log(`⚠️  No standard product selectors found, will try to find any content...`);
      }

      // Get page content and analyze
      const content = await page.content();
      console.log(`📊 Page content length: ${content.length}`);

      // Check what selectors are available
      const selectorCounts = await page.evaluate(() => {
        return {
          'product-tile': document.querySelectorAll('.product-tile').length,
          'product-item': document.querySelectorAll('.product-item').length,
          'product-card': document.querySelectorAll('.product-card').length,
          'data-testid-product': document.querySelectorAll('[data-testid*="product"]').length,
          'class-product': document.querySelectorAll('[class*="product"]').length,
          'data-qa-product': document.querySelectorAll('[data-qa*="product"]').length,
          'grid-item': document.querySelectorAll('.grid-item').length,
          'search-result': document.querySelectorAll('.search-result').length,
          'any-price': document.querySelectorAll('[class*="price"], [data-testid*="price"]').length,
          'images': document.querySelectorAll('img').length,
          'links': document.querySelectorAll('a').length
        };
      });

      console.log(`🎯 Selector analysis:`, selectorCounts);

      // Try to extract products using multiple strategies for Voilà/Safeway
      const products = await page.evaluate(() => {
        const results = [];
        
        // Strategy 1: Look for Voilà/Safeway product grid structure
        const possibleSelectors = [
          '.product-tile',
          '.product-item',
          '.product-card',
          '[data-testid*="product"]',
          '.grid-item',
          '.search-result-item',
          '[class*="ProductCard"]',
          '[class*="product-card"]'
        ];
        
        let possibleProductElements = [];
        
        // Try each selector until we find products
        for (const selector of possibleSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            possibleProductElements = elements;
            console.log(`Using selector: ${selector}, found ${elements.length} elements`);
            break;
          }
        }

        console.log(`Found ${possibleProductElements.length} possible product elements`);

        possibleProductElements.forEach((element, index) => {
          try {
            // Debug: log element structure for first few elements
            if (index < 3) {
              console.log(`Element ${index} structure:`, {
                tagName: element.tagName,
                className: element.className,
                innerHTML: element.innerHTML.substring(0, 200) + '...',
                textContent: element.textContent.substring(0, 100) + '...'
              });
            }
            
            // Voilà/Safeway specific selectors
            const nameSelectors = [
              '[data-testid="product-name"]',
              '[data-testid="product-title"]',
              '.product-name',
              '.product-title',
              'h3',
              'h4',
              '.title',
              '[class*="name"]',
              '[class*="title"]'
            ];
            
            const priceSelectors = [
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
            ];
            
            const brandSelectors = [
              '[data-testid="brand"]',
              '[data-testid="product-brand"]',
              '.brand',
              '.product-brand',
              '[class*="brand"]'
            ];
            
            const packageSizeSelectors = [
              '[data-testid="size"]',
              '[data-testid="package-size"]',
              '[data-testid="product-size"]',
              '.size',
              '.package-size',
              '.product-size',
              '[class*="size"]'
            ];

            let name = '';
            let priceText = '';
            let image = '';
            let link = '';

            // Extract product name using specific selectors
            for (const selector of nameSelectors) {
              const nameEl = element.querySelector(selector);
              if (nameEl && nameEl.textContent.trim()) {
                name = nameEl.textContent.trim();
                break;
              }
            }
            
            // Get brand information
            let brand = '';
            for (const selector of brandSelectors) {
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
            let packageSize = '';
            for (const selector of packageSizeSelectors) {
              const sizeEl = element.querySelector(selector);
              if (sizeEl && sizeEl.textContent.trim()) {
                packageSize = sizeEl.textContent.trim();
                break;
              }
            }

            // Extract price using specific selectors
            for (const selector of priceSelectors) {
              const priceEl = element.querySelector(selector);
              if (priceEl && priceEl.textContent.trim()) {
                priceText = priceEl.textContent.trim();
                break;
              }
            }

            // Find image - look for product image specifically
            const imgSelectors = [
              '[data-testid="product-image"] img',
              '.product-image img',
              '.product-img img',
              'img[alt*="product"]',
              'img'
            ];
            
            for (const selector of imgSelectors) {
              const imgEl = element.querySelector(selector);
              if (imgEl && imgEl.src && !imgEl.src.includes('placeholder')) {
                image = imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('srcset')?.split(' ')[0] || '';
                break;
              }
            }

            // Find product link
            const linkSelectors = [
              'a[href*="/product"]',
              'a[href*="/p/"]',
              'a[href*="/item"]',
              '.product-link',
              'a'
            ];
            
            for (const selector of linkSelectors) {
              const linkEl = element.querySelector(selector);
              if (linkEl && linkEl.href) {
                link = linkEl.href;
                break;
              }
            }
            
            // Get original/was price if it exists
            let originalPrice = null;
            const wasPriceSelectors = [
              '[data-testid="was-price"]',
              '[data-testid="original-price"]',
              '.was-price',
              '.original-price',
              '[class*="was-price"]',
              '[class*="original-price"]'
            ];
            
            for (const selector of wasPriceSelectors) {
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
                packageSize: packageSize,
                elementInfo: {
                  tagName: element.tagName,
                  className: element.className,
                  id: element.id
                }
              });
            }
          } catch (error) {
            console.warn(`Error processing element ${index}:`, error.message);
          }
        });

        return results;
      });

      console.log(`🔍 Puppeteer found ${products.length} potential products`);

      // Process the extracted data and deduplicate
      const processedProducts = [];
      const seenProducts = new Set();
      
      products.forEach((rawProduct, index) => {
        try {
          console.log(`📦 Processing product ${index + 1}:`);
          console.log(`   - Name: "${rawProduct.name}"`);
          console.log(`   - Price text: "${rawProduct.priceText}"`);
          console.log(`   - Image: "${rawProduct.image}"`);
          console.log(`   - Link: "${rawProduct.link}"`);

          if (rawProduct.name && rawProduct.priceText) {
            // Extract price from text - handle sale prices and regular prices
            let priceMatch = rawProduct.priceText.match(/\$?(\d+\.?\d*)/);
            let price = priceMatch ? parseFloat(priceMatch[1]) : 0;
            
            // If it's a sale price, extract the sale amount
            if (rawProduct.priceText.toLowerCase().includes('sale')) {
              const saleMatch = rawProduct.priceText.match(/sale\$?(\d+\.?\d*)/i);
              if (saleMatch) {
                price = parseFloat(saleMatch[1]);
              }
            }

            if (price > 0) {
              // Create a unique identifier for deduplication
              const productId = rawProduct.link ? rawProduct.link.split('/').pop().split('?')[0] : `${rawProduct.name.replace(/\s+/g, '-')}-${price}`;
              const uniqueKey = `${rawProduct.name}-${price}-${productId}`;
              
              // Skip if we've already processed this product
              if (seenProducts.has(uniqueKey)) {
                console.log(`   ⚠️  Skipping duplicate product: ${rawProduct.name}`);
                return;
              }
              
              seenProducts.add(uniqueKey);
              
              const product = {
                id: productId,
                name: rawProduct.name,
                price: price,
                originalPrice: rawProduct.originalPrice || null,
                image: rawProduct.image && rawProduct.image.startsWith('http') ? rawProduct.image : 
                       rawProduct.image ? `https://voila.ca${rawProduct.image}` : '',
                url: rawProduct.link && rawProduct.link.startsWith('http') ? rawProduct.link :
                     rawProduct.link ? `https://voila.ca${rawProduct.link}` : '',
                inStock: true,
                unit: this.extractUnit(rawProduct.packageSize || rawProduct.priceText),
                description: rawProduct.packageSize || ''
              };

              processedProducts.push(this.normalizeProduct(product));
              console.log(`   ✅ Added unique product: ${rawProduct.name}`);
            }
          }
        } catch (error) {
          console.warn(`Error processing product ${index}:`, error.message);
        }
      });

      console.log(`✅ Successfully processed ${processedProducts.length} products`);
      return processedProducts;
    } catch (error) {
      console.error('❌ Error searching Safeway:', error.message);
      console.error('Stack trace:', error.stack);
      throw new Error(`Failed to search Safeway: ${error.message}`);
    } finally {
      // Always close the browser
      if (browser) {
        try {
          await browser.close();
          console.log(`🔒 Browser closed successfully`);
        } catch (closeError) {
          console.warn(`⚠️  Error closing browser:`, closeError.message);
        }
      }
    }
  }

  async getProductDetails(productId) {
    try {
      // For detailed product information, we might need to make another request
      // For now, return basic info - this can be enhanced later
      return {
        id: productId,
        store: this.name,
        detailsAvailable: false
      };
    } catch (error) {
      console.error('Error getting product details:', error.message);
      throw new Error(`Failed to get product details: ${error.message}`);
    }
  }

  extractUnit(priceText) {
    // Extract unit information from price text (e.g., "per lb", "each", "per kg")
    const unitMatch = priceText.match(/(per\s+\w+|each|\/\w+)/i);
    return unitMatch ? unitMatch[0] : '';
  }
}

module.exports = Safeway;
