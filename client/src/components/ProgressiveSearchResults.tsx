import { FC } from 'react';
import { StreamingSearchState, Product, ComparisonProduct } from '../types';
import ProductCard from './ProductCard';
import ProgressBar from './ProgressBar';
import { AlertTriangle, Store, ShoppingBag, CheckCircle } from 'lucide-react';

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

  const isProductSelected = (storeId: string, productId: string) => {
    return selectedProducts.some(sp => sp.storeId === storeId && sp.product.id === productId);
  };

  return (
    <div className="space-y-notion-2xl">
      {/* Header with Compare Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-notion-heading mb-notion-sm">
            Search Results
          </h2>
          <p className="text-notion-caption">
            {searchState.isComplete ? (
              <>Found {totalProducts} products for "{searchState.searchTerm}"</>
            ) : (
              <>Searching for "{searchState.searchTerm}"...</>
            )}
          </p>
        </div>
        {selectedCount > 1 && (
          <button
            onClick={onCompare}
            className="btn-notion-primary px-notion-xl py-notion-md"
          >
            Compare {selectedCount} Products
          </button>
        )}
      </div>

      {/* Compact Progress Section */}
      {!searchState.isComplete && (
        <div className="card-notion p-notion-lg">
          <div className="flex items-center gap-notion-md mb-notion-md">
            <div className="w-5 h-5 bg-notion-100 rounded flex items-center justify-center">
              <Store className="h-3 w-3 text-notion-600" />
            </div>
            <h3 className="text-notion-body font-medium">
              Searching Stores
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-notion-md">
            {storeEntries.map(([storeId, store]) => (
              <ProgressBar key={storeId} store={store} />
            ))}
          </div>
        </div>
      )}

      {/* Completion Summary */}
      {searchState.isComplete && (
        <div className="card-notion p-notion-lg">
          <div className="flex items-center gap-notion-md">
            <CheckCircle className="h-5 w-5 text-notion-green" />
            <div>
              <p className="text-notion-body font-medium text-notion-900">
                Search completed
              </p>
              <p className="text-notion-caption">
                Found {totalProducts} products across {completedStores.length} stores
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selection Instructions */}
      {hasAnyProducts && selectedCount === 0 && (
        <div className="bg-notion-blue-light border border-notion-blue border-opacity-20 rounded-notion-lg p-notion-lg">
          <p className="text-notion-body text-notion-blue">
            Select products from different stores to compare prices. Choose similar or equivalent items for the best comparison.
          </p>
        </div>
      )}

      {selectedCount === 1 && (
        <div className="bg-notion-yellow-light border border-notion-yellow border-opacity-20 rounded-notion-lg p-notion-lg">
          <p className="text-notion-body text-notion-yellow">
            Select at least one more product from a different store to start comparing prices.
          </p>
        </div>
      )}

      {/* Store Results */}
      {storeEntries.map(([storeId, store]) => {
        // Only show stores that have completed (successfully or with error)
        if (store.status !== 'completed' && store.status !== 'error') {
          return null;
        }

        return (
          <div key={storeId} className="space-y-notion-md">
            {/* Compact Store Header */}
            <div className="flex items-center gap-notion-sm pb-notion-sm border-b border-notion-200">
              <div className="w-5 h-5 bg-notion-100 rounded flex items-center justify-center">
                <Store className="h-3 w-3 text-notion-600" />
              </div>
              <div>
                <h3 className="text-notion-body font-medium">
                  {store.name}
                </h3>
                <span className="text-notion-xs text-notion-500">
                  {store.status === 'error' 
                    ? 'Search failed' 
                    : `${store.products?.length || 0} products found`
                  }
                </span>
              </div>
            </div>

            {/* Error State */}
            {store.status === 'error' && (
              <div className="bg-notion-red-light border border-notion-red border-opacity-20 rounded-notion-lg p-notion-lg">
                <div className="flex items-start gap-notion-md">
                  <AlertTriangle className="h-5 w-5 text-notion-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-notion-body text-notion-red font-medium">
                      Error loading from {store.name}
                    </p>
                    <p className="text-notion-caption text-notion-red mt-1">
                      {store.error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {store.products && store.products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-notion-lg">
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
            ) : store.status === 'completed' && (
              <div className="text-center py-notion-2xl">
                <p className="text-notion-caption">No products found in {store.name}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* No Results State */}
      {searchState.isComplete && !hasAnyProducts && (
        <div className="text-center py-notion-3xl">
          <div className="w-16 h-16 bg-notion-100 rounded-notion-lg flex items-center justify-center mx-auto mb-notion-lg">
            <ShoppingBag className="h-8 w-8 text-notion-400" />
          </div>
          <h3 className="text-notion-subheading mb-notion-sm">No products found</h3>
          <p className="text-notion-caption max-w-md mx-auto">
            Try searching with different keywords or check your spelling. Make sure to use specific product names for better results.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressiveSearchResults;
