import { FC, useState } from 'react';
import { StreamingSearchState, Product, ComparisonProduct } from '../../types';
import { ProductCard, ProgressBar } from '../common';
import { AlertTriangle, Store, ShoppingBag, CheckCircle, ChevronDown, ChevronUp, ArrowRight, Info } from 'lucide-react';

interface ProgressiveSearchResultsProps {
  searchState: StreamingSearchState;
  selectedProducts: ComparisonProduct[];
  onProductSelect: (storeId: string, product: Product) => void;
  onCompare: () => void;
}

const ProgressiveSearchResults: FC<ProgressiveSearchResultsProps> = ({
  searchState,
  selectedProducts,
  onProductSelect,
  onCompare
}) => {
  const storeEntries = Object.entries(searchState.stores);
  const selectedCount = selectedProducts.length;
  const completedStores = storeEntries.filter(([_, store]) => store.status === 'completed');
  const hasAnyProducts = completedStores.some(([_, store]) => (store.products?.length || 0) > 0);
  const totalProducts = completedStores.reduce((sum, [_, store]) => sum + (store.products?.length || 0), 0);

  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    storeEntries.forEach(([storeId]) => {
      initialState[storeId] = true;
    });
    return initialState;
  });

  const isProductSelected = (storeId: string, productId: string) => {
    return selectedProducts.some(sp => sp.storeId === storeId && sp.product.id === productId);
  };

  const toggleStoreExpansion = (storeId: string) => {
    setExpandedStores(prev => ({
      ...prev,
      [storeId]: !prev[storeId]
    }));
  };

  return (
    <div className="space-y-notion-xl pb-24">
      {/* Header */}
      <div>
        <h2 className="text-notion-2xl font-bold text-notion-900 mb-notion-xs">
          {searchState.isComplete ? 'Search Results' : 'Searching...'}
        </h2>
        <p className="text-notion-sm text-notion-500">
          {searchState.isComplete ? (
            <>{totalProducts} products found for "<span className="font-medium text-notion-700">{searchState.searchTerm}</span>"</>
          ) : (
            <>Looking for "<span className="font-medium text-notion-700">{searchState.searchTerm}</span>" across stores...</>
          )}
        </p>
      </div>

      {/* Progress Section */}
      {!searchState.isComplete && (
        <div className="card-notion p-notion-xl animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-notion-sm">
            {storeEntries.map(([storeId, store]) => (
              <ProgressBar key={storeId} store={store} />
            ))}
          </div>
        </div>
      )}

      {/* Completion Summary */}
      {searchState.isComplete && (
        <div className="flex items-center gap-notion-md p-notion-lg bg-notion-green-light rounded-notion-xl animate-fade-in">
          <CheckCircle className="h-5 w-5 text-notion-green flex-shrink-0" />
          <p className="text-notion-sm text-notion-green font-medium">
            Found {totalProducts} products across {completedStores.length} stores
          </p>
        </div>
      )}

      {/* Selection Hints */}
      {hasAnyProducts && selectedCount === 0 && (
        <div className="flex items-start gap-notion-md p-notion-lg bg-notion-blue-light/50 rounded-notion-xl">
          <Info className="h-4 w-4 text-notion-blue flex-shrink-0 mt-0.5" />
          <p className="text-notion-sm text-notion-blue">
            Select products from different stores to compare prices
          </p>
        </div>
      )}

      {selectedCount === 1 && (
        <div className="flex items-start gap-notion-md p-notion-lg bg-notion-yellow-light/50 rounded-notion-xl">
          <Info className="h-4 w-4 text-notion-yellow flex-shrink-0 mt-0.5" />
          <p className="text-notion-sm text-notion-yellow">
            Select at least one more product to start comparing
          </p>
        </div>
      )}

      {/* Store Results */}
      {storeEntries.map(([storeId, store]) => {
        if (store.status !== 'completed' && store.status !== 'error') {
          return null;
        }

        const isExpanded = expandedStores[storeId];
        const productCount = store.products?.length || 0;

        return (
          <div key={storeId} className="card-notion overflow-hidden animate-fade-in">
            {/* Store Header */}
            <button
              onClick={() => toggleStoreExpansion(storeId)}
              className="w-full flex items-center justify-between p-notion-lg hover:bg-notion-50 transition-colors duration-150"
            >
              <div className="flex items-center gap-notion-md">
                <div className="w-8 h-8 bg-notion-100 rounded-notion-lg flex items-center justify-center">
                  <Store className="h-4 w-4 text-notion-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-notion-sm font-semibold text-notion-900">
                    {store.name}
                  </h3>
                  <span className="text-notion-xs text-notion-400">
                    {store.status === 'error'
                      ? 'Search failed'
                      : `${productCount} product${productCount !== 1 ? 's' : ''}`
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-notion-sm">
                {productCount > 0 && (
                  <span className="text-notion-xs font-medium text-notion-400 bg-notion-100 px-2 py-0.5 rounded-notion">
                    {productCount}
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-notion-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-notion-400" />
                )}
              </div>
            </button>

            {/* Collapsible Content */}
            {isExpanded && (
              <div className="border-t border-notion-200">
                {/* Error State */}
                {store.status === 'error' && (
                  <div className="m-notion-lg bg-notion-red-light/50 rounded-notion-lg p-notion-lg">
                    <div className="flex items-start gap-notion-md">
                      <AlertTriangle className="h-4 w-4 text-notion-red flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-notion-sm text-notion-red font-medium">
                          Could not load from {store.name}
                        </p>
                        {store.error && (
                          <p className="text-notion-xs text-notion-red/70 mt-1">
                            {store.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Grid */}
                {store.products && store.products.length > 0 ? (
                  <div className="p-notion-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-notion-md">
                      {store.products.map((product) => (
                        <ProductCard
                          key={`${storeId}-${product.id}`}
                          product={product}
                          onSelect={(product) => onProductSelect(storeId, product)}
                          isSelected={isProductSelected(storeId, product.id)}
                          showSelectButton={true}
                        />
                      ))}
                    </div>
                  </div>
                ) : store.status === 'completed' && (
                  <div className="text-center py-notion-3xl">
                    <p className="text-notion-sm text-notion-400">No products found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* No Results State */}
      {searchState.isComplete && !hasAnyProducts && (
        <div className="text-center py-notion-4xl">
          <div className="w-16 h-16 bg-notion-100 rounded-notion-2xl flex items-center justify-center mx-auto mb-notion-xl">
            <ShoppingBag className="h-8 w-8 text-notion-300" />
          </div>
          <h3 className="text-notion-lg font-semibold text-notion-900 mb-notion-sm">No products found</h3>
          <p className="text-notion-sm text-notion-500 max-w-md mx-auto">
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      )}

      {/* Sticky Compare Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up">
          <div className="bg-white border-t border-notion-200 shadow-notion-float">
            <div className="max-w-6xl mx-auto px-notion-xl py-notion-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-notion-md">
                  <div className="w-8 h-8 bg-notion-blue rounded-notion-lg flex items-center justify-center text-white text-notion-sm font-bold">
                    {selectedCount}
                  </div>
                  <div>
                    <p className="text-notion-sm font-medium text-notion-900">
                      {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
                    </p>
                    {selectedCount < 2 && (
                      <p className="text-notion-xs text-notion-400">
                        Select one more to compare
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onCompare}
                  disabled={selectedCount < 2}
                  className={`flex items-center gap-notion-sm px-notion-2xl py-notion-md rounded-notion-xl font-medium text-notion-sm transition-all duration-200 ${
                    selectedCount >= 2
                      ? 'bg-notion-blue text-white shadow-sm hover:bg-notion-blue-dark hover:shadow-md'
                      : 'bg-notion-100 text-notion-400 cursor-not-allowed'
                  }`}
                >
                  Compare
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveSearchResults;
