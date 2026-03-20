const BaseStore = require('./base');

const configs = [
  require('./configs/realCanadianSuperstore'),
  require('./configs/safeway'),
  require('./configs/noFrills'),
  require('./configs/sobeys'),
  require('./configs/saveOnFoods'),
  require('./configs/walmart'),
];

const stores = {};
for (const config of configs) {
  stores[config.id] = new BaseStore(config);
}

function getAllStores() {
  return Object.keys(stores).map(key => ({
    id: key,
    name: stores[key].name,
    baseUrl: stores[key].baseUrl,
  }));
}

function getStore(storeId) {
  return stores[storeId];
}

async function searchAllStores(searchTerm) {
  console.log(`Starting search across all stores for: "${searchTerm}"`);
  const results = {};

  const promises = Object.entries(stores).map(async ([storeId, store]) => {
    try {
      const startTime = Date.now();
      const products = await store.searchProducts(searchTerm);
      console.log(`${store.name} completed in ${Date.now() - startTime}ms. Found ${products.length} products.`);
      results[storeId] = { storeName: store.name, products, error: null };
    } catch (error) {
      console.error(`Error searching ${store.name}:`, error.message);
      results[storeId] = { storeName: store.name, products: [], error: error.message };
    }
  });

  await Promise.all(promises);
  return results;
}

module.exports = { getAllStores, getStore, searchAllStores };
