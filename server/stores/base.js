/**
 * Base Store Interface
 * All store adapters must implement these methods
 */
class BaseStore {
  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl;
  }

  /**
   * Search for products by term
   * @param {string} searchTerm - The product to search for
   * @returns {Promise<Array>} Array of product objects
   */
  async searchProducts(searchTerm) {
    throw new Error('searchProducts method must be implemented');
  }

  /**
   * Get detailed product information
   * @param {string} productId - The product identifier
   * @returns {Promise<Object>} Detailed product information
   */
  async getProductDetails(productId) {
    throw new Error('getProductDetails method must be implemented');
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
