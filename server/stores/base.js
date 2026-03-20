const { RawProductSchema, ProductSchema } = require('../schemas/product');
const browserPool = require('../infra/browserPool');
const { apiRequest } = require('../infra/apiClient');
const {
  getRandomHeaders,
  getRandomViewport,
  shouldBlockRequest,
  randomDelay,
} = require('../infra/stealth');

class BaseStore {
  constructor(config) {
    this.config = config;
    this.name = config.name;
    this.baseUrl = config.baseUrl;
    this.id = config.id;
    this.debug = process.env.DEBUG_SCRAPING === 'true';
  }

  async searchProducts(searchTerm) {
    const primary = this.config.strategy;
    const fallback = primary === 'api' ? 'browser' : null;

    try {
      return primary === 'api'
        ? await this.searchViaApi(searchTerm)
        : await this.searchViaBrowser(searchTerm);
    } catch (err) {
      if (fallback && this.config.browser) {
        this.log(`Primary strategy (${primary}) failed, falling back to ${fallback}: ${err.message}`);
        return this.searchViaBrowser(searchTerm);
      }
      throw err;
    }
  }

  async searchViaApi(searchTerm) {
    const apiConfig = this.config.api;
    if (!apiConfig) throw new Error(`No API config for ${this.name}`);

    this.log(`API search for: "${searchTerm}"`);
    const url = apiConfig.searchUrl(searchTerm);
    const data = await apiRequest(url, { headers: apiConfig.headers || {} });
    const rawProducts = apiConfig.parseResponse(data);
    return this.processProducts(rawProducts);
  }

  async searchViaBrowser(searchTerm) {
    let browser;
    try {
      this.log(`Browser search for: "${searchTerm}"`);
      browser = await browserPool.acquire();
      const page = await browser.newPage();

      try {
        await this._configurePage(page);
        await this._navigateToSearch(page, searchTerm);
        await this._waitForProducts(page);
        const rawProducts = await this._extractProducts(page);
        const processed = this.processProducts(rawProducts);
        this.log(`Found ${processed.length} products`);
        return processed;
      } finally {
        await page.close().catch(() => {});
      }
    } catch (error) {
      this.log(`Error: ${error.message}`, 'error');
      throw new Error(`Failed to search ${this.name}: ${error.message}`);
    } finally {
      if (browser) await browserPool.release(browser);
    }
  }

  async _configurePage(page) {
    const { userAgent, headers } = getRandomHeaders();
    const viewport = getRandomViewport();

    await page.setUserAgent(userAgent);
    await page.setViewport(viewport);
    await page.setExtraHTTPHeaders(headers);

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (shouldBlockRequest(req)) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  async _navigateToSearch(page, searchTerm) {
    const browserConfig = this.config.browser;
    const searchUrl = browserConfig.searchUrl(searchTerm);
    const fallbackUrl = browserConfig.fallbackUrl || this.baseUrl;

    this.log(`Navigating to: ${searchUrl}`, 'debug');

    try {
      await page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      const delay = browserConfig.waitDelay || { min: 3000, max: 5000 };
      await randomDelay(delay.min, delay.max);
    } catch (navError) {
      this.log(`Direct search failed, trying fallback...`, 'debug');
      await page.goto(fallbackUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
      await this._performHomepageSearch(page, searchTerm);
    }
  }

  async _performHomepageSearch(page, searchTerm) {
    const searchInputSelectors = [
      'input[type="search"]',
      'input[name*="search"]',
      'input[placeholder*="search"]',
      '#search',
      '[data-testid*="search"]',
      '.search-input',
    ];

    for (const selector of searchInputSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.type(selector, searchTerm);
        await page.keyboard.press('Enter');
        await randomDelay(2000, 4000);
        return;
      } catch {
        continue;
      }
    }
    throw new Error('No search input found on homepage');
  }

  async _waitForProducts(page) {
    const selectors = this.config.browser.selectors.products || [];
    for (const selector of selectors.slice(0, 3)) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        this.log(`Products loaded with selector: ${selector}`, 'debug');
        return true;
      } catch {
        continue;
      }
    }
    this.log('No products found with standard selectors', 'debug');
    return false;
  }

  async _extractProducts(page) {
    const selectors = this.config.browser.selectors;
    const overrides = this.config.browser.extractOverrides || {};

    return await page.evaluate((selectors, overrides, debug) => {
      const results = [];

      let productElements = [];
      for (const selector of selectors.products) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          productElements = elements;
          break;
        }
      }

      function findText(element, selectorList) {
        for (const sel of selectorList) {
          const el = element.querySelector(sel);
          if (el && el.textContent.trim()) return el.textContent.trim();
        }
        return '';
      }

      function findImage(element, selectorList) {
        for (const sel of selectorList) {
          const el = element.querySelector(sel);
          if (el && el.src && !el.src.includes('placeholder')) {
            return el.src || el.getAttribute('data-src') || el.getAttribute('srcset')?.split(' ')[0] || '';
          }
        }
        return '';
      }

      function findLink(element, selectorList) {
        for (const sel of selectorList) {
          const el = element.querySelector(sel);
          if (el && (el.href || el.getAttribute('href'))) {
            return el.href || el.getAttribute('href') || '';
          }
        }
        return '';
      }

      function findOriginalPrice(element, selectorList) {
        for (const sel of selectorList) {
          const el = element.querySelector(sel);
          if (el && el.textContent.trim()) {
            const match = el.textContent.trim().match(/\$?(\d+\.?\d*)/);
            if (match) return parseFloat(match[1]);
          }
        }
        return null;
      }

      productElements.forEach((element, index) => {
        try {
          let name = findText(element, selectors.names);

          // Sobeys: fallback to title attribute
          if (!name && overrides.nameFallback) {
            const linkEl = element.querySelector('a[title]');
            if (linkEl) name = (linkEl.getAttribute('title') || '').trim();
          }

          // Sobeys: clean truncated names
          if (name) name = name.replace(/\.\.\.$/g, '').trim();

          // Save-On-Foods: clean name suffix
          if (overrides.cleanNameSuffix && name) {
            name = name.replace(new RegExp(overrides.cleanNameSuffix + '$'), '').trim();
          }

          const brand = findText(element, selectors.brands);
          if (brand && name && !name.toLowerCase().includes(brand.toLowerCase())) {
            name = `${brand} ${name}`;
          }

          const packageSize = findText(element, selectors.packageSizes);
          let priceText = findText(element, selectors.prices);
          const image = findImage(element, selectors.images);
          const link = findLink(element, selectors.links);
          let originalPrice = findOriginalPrice(element, selectors.originalPrices);

          // Sobeys: additional sale price logic
          if (!originalPrice && overrides.sobeysSalePrice) {
            const salePriceEl = element.querySelector('span.text-red200.font-bold.text-body');
            const regularPriceEl = element.querySelector('span.font-bold.text-body.line-through');
            if (salePriceEl && regularPriceEl) {
              const match = regularPriceEl.textContent.trim().match(/\$?(\d+\.?\d*)/);
              if (match) {
                originalPrice = parseFloat(match[1]);
                priceText = salePriceEl.textContent.trim();
              }
            }
          }

          if (name && priceText) {
            let fullName = name;
            if (packageSize && !name.includes(packageSize)) {
              fullName = `${name} ${packageSize}`;
            }

            results.push({
              name: fullName,
              priceText,
              originalPrice,
              image,
              link,
              brand,
              packageSize,
            });
          }
        } catch (error) {
          if (debug) console.warn(`Error processing element ${index}:`, error.message);
        }
      });

      return results;
    }, selectors, overrides, this.debug);
  }

  processProducts(rawProducts) {
    const processedProducts = [];
    const seenProducts = new Set();

    rawProducts.forEach((rawProduct, index) => {
      try {
        const parsed = RawProductSchema.safeParse(rawProduct);
        if (!parsed.success) {
          this.log(`Validation failed for product ${index}: ${parsed.error.message}`, 'debug');
          return;
        }
        const raw = parsed.data;

        let priceMatch = raw.priceText.match(/\$?(\d+\.?\d*)/);
        let price = priceMatch ? parseFloat(priceMatch[1]) : 0;

        if (raw.priceText.toLowerCase().includes('sale')) {
          const saleMatch = raw.priceText.match(/sale\$?(\d+\.?\d*)/i);
          if (saleMatch) price = parseFloat(saleMatch[1]);
        }

        if (price <= 0) return;

        const productId = raw.link
          ? raw.link.split('/').pop().split('?')[0]
          : `${raw.name.replace(/\s+/g, '-')}-${price}`;
        const uniqueKey = `${raw.name}-${price}-${productId}`;

        if (seenProducts.has(uniqueKey)) return;
        seenProducts.add(uniqueKey);

        const product = {
          id: productId,
          name: raw.name,
          price,
          originalPrice: raw.originalPrice || null,
          image: this._normalizeImageUrl(raw.image),
          url: this._normalizeProductUrl(raw.link),
          store: this.name,
          inStock: true,
          unit: this._extractUnit(raw.packageSize || raw.priceText),
          description: raw.packageSize || '',
        };

        const validated = ProductSchema.safeParse(product);
        if (validated.success) {
          processedProducts.push(validated.data);
        } else {
          this.log(`Product validation failed: ${validated.error.message}`, 'debug');
        }
      } catch (error) {
        this.log(`Error processing product ${index}: ${error.message}`, 'debug');
      }
    });

    return processedProducts;
  }

  _normalizeImageUrl(imageUrl) {
    if (this.config.overrides?.normalizeImageUrl) {
      return this.config.overrides.normalizeImageUrl(imageUrl);
    }
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${this.baseUrl}${imageUrl}`;
  }

  _normalizeProductUrl(productUrl) {
    if (this.config.overrides?.normalizeProductUrl) {
      return this.config.overrides.normalizeProductUrl(productUrl);
    }
    if (!productUrl) return '';
    if (productUrl.startsWith('http')) return productUrl;
    return `${this.baseUrl}${productUrl}`;
  }

  _extractUnit(text) {
    if (!text) return '';
    const unitMatch = text.match(/(per\s+\w+|each|\/\w+)/i);
    return unitMatch ? unitMatch[0] : '';
  }

  log(message, level = 'info') {
    const prefix = `[${this.name}]`;
    if (level === 'error') {
      console.error(`${prefix} ${message}`);
    } else if (level === 'debug') {
      if (this.debug) console.log(`${prefix} ${message}`);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}

module.exports = BaseStore;
