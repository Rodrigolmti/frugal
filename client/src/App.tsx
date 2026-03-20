import { useState, useCallback } from 'react';
import {
  SearchBar,
  ProgressiveSearchResults,
  PriceComparison,
  StoreList
} from './components';
import { streamingSearchService } from './services/streamingApi';
import { Product, ComparisonProduct, StreamingSearchState } from './types';
import { AlertCircle, Search, GitCompareArrows, DollarSign } from 'lucide-react';

type AppState = 'search' | 'results' | 'comparison';

function App() {
  const [state, setState] = useState<AppState>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingSearchState, setStreamingSearchState] = useState<StreamingSearchState | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<ComparisonProduct[]>([]);

  const handleSearch = useCallback((searchTerm: string) => {
    setLoading(true);
    setError(null);
    setStreamingSearchState(null);
    setSelectedProducts([]);
    setState('results');

    streamingSearchService.startSearch(
      searchTerm,
      (state: StreamingSearchState) => {
        setStreamingSearchState(state);
        if (state.isComplete) {
          setLoading(false);
        }
      },
      (errorMessage: string) => {
        setError(errorMessage);
        setLoading(false);
      }
    );
  }, []);

  const handleProductSelect = (storeId: string, product: Product) => {
    setSelectedProducts(prev => {
      const existingIndex = prev.findIndex(
        sp => sp.storeId === storeId && sp.product.id === product.id
      );

      if (existingIndex >= 0) {
        return prev.filter((_, index) => index !== existingIndex);
      } else {
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
    setStreamingSearchState(null);
    setSelectedProducts([]);
    setError(null);
    streamingSearchService.stopSearch();
    setLoading(false);
  };

  const handleRemoveProduct = (storeId: string, productId: string) => {
    setSelectedProducts(prev =>
      prev.filter(sp => !(sp.storeId === storeId && sp.product.id === productId))
    );
  };

  return (
    <div className="min-h-screen bg-notion-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-notion-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-notion-xl py-notion-md">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToSearch}
              className="flex items-center gap-notion-sm hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-notion-blue rounded-notion-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-notion-lg font-semibold text-notion-900">
                Frugal
              </h1>
            </button>
            {state !== 'search' && (
              <button
                onClick={handleBackToSearch}
                className="btn-notion-ghost text-notion-sm"
              >
                New Search
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {/* Error Display */}
        {error && (
          <div className="max-w-6xl mx-auto px-notion-xl pt-notion-xl">
            <div className="bg-notion-red-light border border-notion-red/20 rounded-notion-xl p-notion-lg animate-fade-in">
              <div className="flex items-start gap-notion-md">
                <AlertCircle className="h-5 w-5 text-notion-red flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-notion-sm text-notion-red font-medium">
                    Something went wrong
                  </p>
                  <p className="text-notion-xs text-notion-red/80 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search State */}
        {state === 'search' && (
          <div className="flex flex-col">
            {/* Hero Section */}
            <div className="bg-white border-b border-notion-200">
              <div className="max-w-6xl mx-auto px-notion-xl py-notion-4xl">
                <div className="text-center space-y-notion-xl max-w-3xl mx-auto">
                  <div className="space-y-notion-md">
                    <h2 className="text-notion-5xl font-bold text-notion-900 tracking-tight">
                      Find the best<br />grocery prices
                    </h2>
                    <p className="text-notion-lg text-notion-500 max-w-xl mx-auto">
                      Compare prices across Canadian grocery stores. Save money on your everyday essentials.
                    </p>
                  </div>

                  <div className="flex justify-center pt-notion-sm">
                    <SearchBar onSearch={handleSearch} loading={loading} />
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="max-w-6xl mx-auto px-notion-xl py-notion-3xl w-full">
              <div className="space-y-notion-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-notion-lg">
                  <div className="flex flex-col items-center text-center p-notion-xl">
                    <div className="w-12 h-12 bg-notion-blue-light rounded-notion-xl flex items-center justify-center mb-notion-lg">
                      <Search className="h-5 w-5 text-notion-blue" />
                    </div>
                    <h3 className="text-notion-sm font-semibold text-notion-900 mb-notion-xs">
                      Search products
                    </h3>
                    <p className="text-notion-xs text-notion-500">
                      Search for any grocery item across all stores
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-notion-xl">
                    <div className="w-12 h-12 bg-notion-green-light rounded-notion-xl flex items-center justify-center mb-notion-lg">
                      <GitCompareArrows className="h-5 w-5 text-notion-green" />
                    </div>
                    <h3 className="text-notion-sm font-semibold text-notion-900 mb-notion-xs">
                      Compare prices
                    </h3>
                    <p className="text-notion-xs text-notion-500">
                      Select products and compare side by side
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-notion-xl">
                    <div className="w-12 h-12 bg-notion-yellow-light rounded-notion-xl flex items-center justify-center mb-notion-lg">
                      <DollarSign className="h-5 w-5 text-notion-yellow" />
                    </div>
                    <h3 className="text-notion-sm font-semibold text-notion-900 mb-notion-xs">
                      Save money
                    </h3>
                    <p className="text-notion-xs text-notion-500">
                      Shop at the store with the best price
                    </p>
                  </div>
                </div>

                <StoreList />
              </div>
            </div>
          </div>
        )}

        {/* Results State */}
        {state === 'results' && streamingSearchState && (
          <div className="max-w-6xl mx-auto px-notion-xl py-notion-xl">
            <ProgressiveSearchResults
              searchState={streamingSearchState}
              selectedProducts={selectedProducts}
              onProductSelect={handleProductSelect}
              onCompare={handleCompare}
            />
          </div>
        )}

        {/* Comparison State */}
        {state === 'comparison' && (
          <div className="max-w-6xl mx-auto px-notion-xl py-notion-xl">
            <PriceComparison
              selectedProducts={selectedProducts}
              onBack={handleBackToResults}
              onRemoveProduct={handleRemoveProduct}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && !streamingSearchState && (
          <div className="text-center py-notion-4xl">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-notion-200 border-t-notion-blue"></div>
            <p className="mt-notion-lg text-notion-caption">Searching stores for the best prices...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-notion-200 bg-white">
        <div className="max-w-6xl mx-auto px-notion-xl py-notion-lg">
          <p className="text-center text-notion-xs text-notion-400">
            Frugal — Compare grocery prices across Canadian stores
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
