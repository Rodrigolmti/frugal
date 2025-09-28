const RealCanadianSuperstore = require('./realCanadianSuperstore');
const Safeway = require('./safeway');
const NoFrills = require('./noFrills');
const Sobeys = require('./sobeys');
const SaveOnFoods = require('./saveOnFoods');
const Walmart = require('./walmart');

// Store registry - add new stores here
const stores = {
  'real-canadian-superstore': new RealCanadianSuperstore(),
  'safeway': new Safeway(),
  'no-frills': new NoFrills(),
  'sobeys': new Sobeys(),
  'save-on-foods': new SaveOnFoods(),
  'walmart': new Walmart(),
  // Add more stores here as they're implemented
  // 'metro': new Metro(),
  // 'loblaws': new Loblaws(),
};

/**
 * Get all available stores
 */
function getAllStores() {
  return Object.keys(stores).map(key => ({
    id: key,
    name: stores[key].name,
    baseUrl: stores[key].baseUrl
  }));
}

/**
 * Get a specific store by ID
 */
function getStore(storeId) {
  return stores[storeId];
}

/**
 * Search products across all stores
 */
async function searchAllStores(searchTerm) {
  console.log(`🚀 Starting search across all stores for: "${searchTerm}"`);
  const results = {};
  
  for (const [storeId, store] of Object.entries(stores)) {
    try {
      console.log(`🏪 Searching ${store.name} for: ${searchTerm}`);
      const startTime = Date.now();
      const products = await store.searchProducts(searchTerm);
      const endTime = Date.now();
      
      console.log(`✅ ${store.name} search completed in ${endTime - startTime}ms. Found ${products.length} products.`);
      
      results[storeId] = {
        storeName: store.name,
        products: products,
        error: null
      };
    } catch (error) {
      console.error(`❌ Error searching ${store.name}:`, error.message);
      results[storeId] = {
        storeName: store.name,
        products: [],
        error: error.message
      };
    }
  }
  
  console.log(`🏁 Search completed. Results summary:`);
  Object.entries(results).forEach(([storeId, result]) => {
    console.log(`   - ${result.storeName}: ${result.products.length} products${result.error ? ` (ERROR: ${result.error})` : ''}`);
  });
  
  return results;
}

module.exports = {
  getAllStores,
  getStore,
  searchAllStores
};
