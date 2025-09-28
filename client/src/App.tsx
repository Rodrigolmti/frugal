import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import PriceComparison from './components/PriceComparison';
import { searchProducts } from './services/api';
import { SearchResults as SearchResultsType, Product, ComparisonProduct } from './types';
import { ShoppingCart, AlertCircle } from 'lucide-react';

type AppState = 'search' | 'results' | 'comparison';

function App() {
  const [state, setState] = useState<AppState>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultsType | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<ComparisonProduct[]>([]);

  const handleSearch = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchProducts(searchTerm);
      setSearchResults(results);
      setSelectedProducts([]); // Reset selections on new search
      setState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (storeId: string, product: Product) => {
    setSelectedProducts(prev => {
      // Check if this product is already selected
      const existingIndex = prev.findIndex(
        sp => sp.storeId === storeId && sp.product.id === product.id
      );

      if (existingIndex >= 0) {
        // Remove if already selected
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Add new selection
        return [...prev, { storeId, product }];
      }
    });
  };

  const handleCompare = () => {
    if (selectedProducts.length > 1) {
      setState('comparison');
    }
  };

  const handleBackToResults = () => {
    setState('results');
  };

  const handleBackToSearch = () => {
    setState('search');
    setSearchResults(null);
    setSelectedProducts([]);
    setError(null);
  };

  const handleRemoveProduct = (storeId: string, productId: string) => {
    setSelectedProducts(prev => 
      prev.filter(sp => !(sp.storeId === storeId && sp.product.id === productId))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Grocery Price Comparison
            </h1>
            {state !== 'search' && (
              <button
                onClick={handleBackToSearch}
                className="ml-auto btn-secondary"
              >
                New Search
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
          </div>
        )}

        {/* Search State */}
        {state === 'search' && (
          <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900">
                  Find the Best Grocery Prices
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Search for any grocery item and compare prices across multiple stores to save money on your shopping.
                </p>
              </div>
              
              <div className="flex justify-center">
                <SearchBar onSearch={handleSearch} loading={loading} />
              </div>
              
              <div className="text-sm text-gray-500 space-y-2">
                <p><strong>How it works:</strong></p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-left">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary-100 text-primary-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Search for a product</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary-100 text-primary-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>Select similar products from different stores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary-100 text-primary-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Compare prices and save money</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results State */}
        {state === 'results' && searchResults && (
          <SearchResults
            results={searchResults}
            selectedProducts={selectedProducts}
            onProductSelect={handleProductSelect}
            onCompare={handleCompare}
          />
        )}

        {/* Comparison State */}
        {state === 'comparison' && (
          <PriceComparison
            selectedProducts={selectedProducts}
            onBack={handleBackToResults}
            onRemoveProduct={handleRemoveProduct}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Searching stores for the best prices...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>Compare grocery prices across multiple stores • Built for smart shoppers</p>
            <p className="mt-2">Currently supporting: Real Canadian Superstore</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
