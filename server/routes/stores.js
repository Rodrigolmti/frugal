const express = require('express');
const { getAllStores, getStore, searchAllStores } = require('../stores');

const router = express.Router();

// Get all available stores
router.get('/', (req, res) => {
  try {
    const stores = getAllStores();
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stores' });
  }
});

// Search products across all stores
router.get('/search', async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    console.log(`Searching for: ${searchTerm}`);
    const results = await searchAllStores(searchTerm);
    
    res.json({
      searchTerm,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get product details from a specific store
router.get('/:storeId/product/:productId', async (req, res) => {
  try {
    const { storeId, productId } = req.params;
    const store = getStore(storeId);
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const productDetails = await store.getProductDetails(productId);
    res.json(productDetails);
  } catch (error) {
    console.error('Product details error:', error);
    res.status(500).json({ error: 'Failed to get product details' });
  }
});

module.exports = router;
