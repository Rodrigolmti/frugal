import React from 'react';
import { SearchResults as SearchResultsType, Product, ComparisonProduct } from '../types';
import ProductCard from './ProductCard';
import { AlertTriangle, Store, ShoppingBag } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResultsType;
  selectedProducts: ComparisonProduct[];
  onProductSelect: (storeId: string, product: Product) => void;
  onCompare: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  selectedProducts,
  onProductSelect,
  onCompare
}) => {
  const storeEntries = Object.entries(results.results);
  const hasAnyProducts = storeEntries.some(([_, result]) => result.products.length > 0);
  const selectedCount = selectedProducts.length;

  const isProductSelected = (storeId: string, productId: string) => {
    return selectedProducts.some(sp => sp.storeId === storeId && sp.product.id === productId);
  };

  if (!hasAnyProducts) {
    return (
      <div className="text-center py-notion-3xl">
        <div className="w-16 h-16 bg-notion-100 rounded-notion-lg flex items-center justify-center mx-auto mb-notion-lg">
          <ShoppingBag className="h-8 w-8 text-notion-400" />
        </div>
        <h3 className="text-notion-subheading mb-notion-sm">No products found</h3>
        <p className="text-notion-caption max-w-md mx-auto">
          Try searching with different keywords or check your spelling. Make sure to use specific product names for better results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-notion-2xl">
      {/* Header with Compare Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-notion-heading mb-notion-sm">
            Search Results
          </h2>
          <p className="text-notion-caption">
            Found results for "{results.searchTerm}"
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

      {/* Selection Instructions */}
      {selectedCount === 0 && (
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
      {storeEntries.map(([storeId, storeResult]) => (
        <div key={storeId} className="space-y-notion-lg">
          {/* Store Header */}
          <div className="flex items-center gap-notion-md pb-notion-md border-b border-notion-200">
            <div className="w-6 h-6 bg-notion-100 rounded flex items-center justify-center">
              <Store className="h-4 w-4 text-notion-600" />
            </div>
            <div>
              <h3 className="text-notion-subheading">
                {storeResult.storeName}
              </h3>
              <span className="text-notion-muted">
                {storeResult.products.length} products found
              </span>
            </div>
          </div>

          {/* Error State */}
          {storeResult.error && (
            <div className="bg-notion-red-light border border-notion-red border-opacity-20 rounded-notion-lg p-notion-lg">
              <div className="flex items-start gap-notion-md">
                <AlertTriangle className="h-5 w-5 text-notion-red flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-notion-body text-notion-red font-medium">
                    Error loading from {storeResult.storeName}
                  </p>
                  <p className="text-notion-caption text-notion-red mt-1">
                    {storeResult.error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {storeResult.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-notion-lg">
              {storeResult.products.map((product) => (
                <ProductCard
                  key={`${storeId}-${product.id}`}
                  product={product}
                  onSelect={(product) => onProductSelect(storeId, product)}
                  isSelected={isProductSelected(storeId, product.id)}
                  showSelectButton={true}
                />
              ))}
            </div>
          ) : !storeResult.error && (
            <div className="text-center py-notion-2xl">
              <p className="text-notion-caption">No products found in {storeResult.storeName}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
