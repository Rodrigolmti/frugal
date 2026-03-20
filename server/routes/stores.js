const express = require('express');
const { getAllStores, getStore } = require('../stores');
const { Cache } = require('../infra/cache');
const { CircuitBreaker } = require('../infra/circuitBreaker');
const { withRetry } = require('../infra/retry');
const { Semaphore } = require('../infra/concurrency');
const { HealthMonitor } = require('../infra/healthMonitor');

const router = express.Router();
const cache = new Cache();
const circuitBreaker = new CircuitBreaker();
const semaphore = new Semaphore(6);
const healthMonitor = new HealthMonitor();

router.get('/', (req, res) => {
  try {
    res.json(getAllStores());
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stores' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const stores = getAllStores();
    const results = {};

    await Promise.all(stores.map(async (storeInfo) => {
      try {
        const products = await _searchStore(storeInfo.id, searchTerm);
        results[storeInfo.id] = { storeName: storeInfo.name, products, error: null };
      } catch (error) {
        results[storeInfo.id] = { storeName: storeInfo.name, products: [], error: error.message };
      }
    }));

    res.json({ searchTerm, results, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/search/stream', async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    const stores = getAllStores();

    res.write(`data: ${JSON.stringify({
      type: 'progress',
      searchTerm,
      stores: stores.map(s => ({ id: s.id, name: s.name, status: 'pending', progress: 0 })),
      timestamp: new Date().toISOString(),
    })}\n\n`);

    const searchPromises = stores.map(async (storeInfo) => {
      try {
        // Check cache first
        const cached = cache.get(storeInfo.id, searchTerm);
        if (cached) {
          res.write(`data: ${JSON.stringify({
            type: 'store_complete',
            storeId: storeInfo.id,
            storeName: storeInfo.name,
            status: 'completed',
            progress: 100,
            products: cached,
            error: null,
            timestamp: new Date().toISOString(),
          })}\n\n`);
          return;
        }

        res.write(`data: ${JSON.stringify({
          type: 'store_update',
          storeId: storeInfo.id,
          status: 'loading',
          progress: 50,
          timestamp: new Date().toISOString(),
        })}\n\n`);

        const products = await _searchStore(storeInfo.id, searchTerm);

        res.write(`data: ${JSON.stringify({
          type: 'store_complete',
          storeId: storeInfo.id,
          storeName: storeInfo.name,
          status: 'completed',
          progress: 100,
          products: products || [],
          error: null,
          timestamp: new Date().toISOString(),
        })}\n\n`);

      } catch (error) {
        console.error(`Error searching ${storeInfo.name}:`, error);
        res.write(`data: ${JSON.stringify({
          type: 'store_complete',
          storeId: storeInfo.id,
          storeName: storeInfo.name,
          status: 'error',
          progress: 100,
          products: [],
          error: error.message || 'Search failed',
          timestamp: new Date().toISOString(),
        })}\n\n`);
      }
    });

    await Promise.all(searchPromises);

    res.write(`data: ${JSON.stringify({
      type: 'complete',
      timestamp: new Date().toISOString(),
    })}\n\n`);

    res.end();
  } catch (error) {
    console.error('Streaming search error:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: 'Search failed',
      timestamp: new Date().toISOString(),
    })}\n\n`);
    res.end();
  }
});

router.get('/health', (req, res) => {
  const health = healthMonitor.getAllHealth();
  const circuits = circuitBreaker.getAllStates();
  const stores = getAllStores();

  const result = {};
  for (const store of stores) {
    result[store.id] = {
      name: store.name,
      health: health[store.id] || null,
      circuit: circuits[store.id] || { state: 'CLOSED', failures: 0 },
    };
  }

  res.json({ stores: result, cacheSize: cache.size, timestamp: new Date().toISOString() });
});

router.get('/:storeId/product/:productId', async (req, res) => {
  try {
    const { storeId, productId } = req.params;
    const store = getStore(storeId);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json({ id: productId, store: store.name, detailsAvailable: false });
  } catch (error) {
    console.error('Product details error:', error);
    res.status(500).json({ error: 'Failed to get product details' });
  }
});

async function _searchStore(storeId, searchTerm) {
  if (!circuitBreaker.canExecute(storeId)) {
    throw new Error(`Circuit open for ${storeId}`);
  }

  return semaphore.run(async () => {
    const startTime = Date.now();
    try {
      const store = getStore(storeId);
      const products = await withRetry(
        () => store.searchProducts(searchTerm),
        { maxAttempts: 2, backoffMs: [2000] }
      );

      cache.set(storeId, searchTerm, products);
      circuitBreaker.recordSuccess(storeId);
      healthMonitor.recordSuccess(storeId, {
        latencyMs: Date.now() - startTime,
        productCount: products.length,
      });

      return products;
    } catch (error) {
      circuitBreaker.recordFailure(storeId, error);
      healthMonitor.recordFailure(storeId, error);
      throw error;
    }
  });
}

module.exports = router;
