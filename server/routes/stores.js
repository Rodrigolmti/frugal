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

// Streaming search with progress updates
router.get('/search/stream', async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    console.log(`Streaming search for: ${searchTerm}`);
    
    const { getAllStores } = require('../stores');
    const stores = getAllStores();
    
    // Send initial progress
    res.write(`data: ${JSON.stringify({
      type: 'progress',
      searchTerm,
      stores: stores.map(store => ({
        id: store.id,
        name: store.name,
        status: 'pending',
        progress: 0
      })),
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Search each store individually
    const searchPromises = stores.map(async (storeInfo) => {
      try {
        // Send loading status
        res.write(`data: ${JSON.stringify({
          type: 'store_update',
          storeId: storeInfo.id,
          status: 'loading',
          progress: 50,
          timestamp: new Date().toISOString()
        })}\n\n`);

        const { getStore } = require('../stores');
        const store = getStore(storeInfo.id);
        const products = await store.searchProducts(searchTerm);
        
        // Send completion status
        res.write(`data: ${JSON.stringify({
          type: 'store_complete',
          storeId: storeInfo.id,
          storeName: storeInfo.name,
          status: 'completed',
          progress: 100,
          products: products || [],
          error: null,
          timestamp: new Date().toISOString()
        })}\n\n`);

      } catch (error) {
        console.error(`Error searching ${storeInfo.name}:`, error);
        
        // Send error status
        res.write(`data: ${JSON.stringify({
          type: 'store_complete',
          storeId: storeInfo.id,
          storeName: storeInfo.name,
          status: 'error',
          progress: 100,
          products: [],
          error: error.message || 'Search failed',
          timestamp: new Date().toISOString()
        })}\n\n`);
      }
    });

    // Wait for all searches to complete
    await Promise.all(searchPromises);
    
    // Send completion signal
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      timestamp: new Date().toISOString()
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('Streaming search error:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: 'Search failed',
      timestamp: new Date().toISOString()
    })}\n\n`);
    res.end();
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
