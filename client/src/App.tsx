import { useState, useCallback } from 'react';
import { 
  SearchBar, 
  ProgressiveSearchResults, 
  PriceComparison, 
  StoreList 
} from './components';
import { streamingSearchService } from './services/streamingApi';
import { Product, ComparisonProduct, StreamingSearchState } from './types';
import { AlertCircle } from 'lucide-react';

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
    setSelectedProducts([]); // Reset selections on new search
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
    setStreamingSearchState(null);
    setSelectedProducts([]);
    setError(null);
    // Stop any ongoing streaming search
    streamingSearchService.stopSearch();
    setLoading(false);
  };

  const handleRemoveProduct = (storeId: string, productId: string) => {
    setSelectedProducts(prev => 
      prev.filter(sp => !(sp.storeId === storeId && sp.product.id === productId))
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-notion-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-notion-2xl py-notion-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-notion-sm">
                <h1 className="text-notion-heading">
                  Grocery Price Comparison
                </h1>
              </div>
            </div>
            {state !== 'search' && (
              <button
                onClick={handleBackToSearch}
                className="btn-notion-ghost absolute right-notion-2xl"
              >
                New Search
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-notion-2xl py-notion-2xl w-full">
        {/* Error Display */}
        {error && (
          <div className="mb-notion-2xl bg-notion-red-light border border-notion-red border-opacity-20 rounded-notion-lg p-notion-lg">
            <div className="flex items-start gap-notion-md">
              <AlertCircle className="h-5 w-5 text-notion-red flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-notion-body text-notion-red font-medium">
                  Something went wrong
                </p>
                <p className="text-notion-caption text-notion-red mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search State */}
        {state === 'search' && (
          <div className="min-h-[calc(100vh-300px)] flex flex-col justify-center">
            <div className="text-center space-y-notion-3xl max-w-3xl mx-auto">
              
              <div className="space-y-notion-lg">
                <h2 className="text-notion-title">
                  Find the best grocery prices
                </h2>
                <p className="text-notion-body text-notion-500 max-w-2xl mx-auto">
                  Compare prices across multiple grocery stores to find the best deals. 
                  Make informed shopping decisions and save money on your everyday essentials.
                </p>
              </div>
              
              <div className="flex justify-center">
                <SearchBar onSearch={handleSearch} loading={loading} />
              </div>
              
              <div className="space-y-notion-3xl">
                <div className="flex flex-col sm:flex-row gap-notion-xl justify-center items-center">
                  <div className="flex items-center gap-notion-md">
                    <div className="w-6 h-6 bg-notion-100 text-notion-600 rounded-full flex items-center justify-center text-notion-xs font-medium">1</div>
                    <span className="text-notion-caption">Search for a product</span>
                  </div>
                  <div className="hidden sm:block w-8 h-px bg-notion-200"></div>
                  <div className="flex items-center gap-notion-md">
                    <div className="w-6 h-6 bg-notion-100 text-notion-600 rounded-full flex items-center justify-center text-notion-xs font-medium">2</div>
                    <span className="text-notion-caption">Select products to compare</span>
                  </div>
                  <div className="hidden sm:block w-8 h-px bg-notion-200"></div>
                  <div className="flex items-center gap-notion-md">
                    <div className="w-6 h-6 bg-notion-100 text-notion-600 rounded-full flex items-center justify-center text-notion-xs font-medium">3</div>
                    <span className="text-notion-caption">Save money</span>
                  </div>
                </div>
                
                {/* Store List */}
                <StoreList />
              </div>
            </div>
          </div>
        )}

        {/* Results State */}
        {state === 'results' && streamingSearchState && (
          <ProgressiveSearchResults
            searchState={streamingSearchState}
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
          <div className="text-center py-notion-3xl">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-notion-200 border-t-notion-blue"></div>
            <p className="mt-notion-lg text-notion-caption">Searching stores for the best prices...</p>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-notion-200 bg-notion-50">
        <div className="max-w-5xl mx-auto px-notion-2xl py-notion-xl">
          <div className="text-center space-y-notion-sm">
            <p className="text-notion-muted">
              🛒 Compare grocery prices across multiple stores
            </p>
            <p className="text-notion-xs text-notion-400">
              Helping families make smarter grocery shopping decisions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
