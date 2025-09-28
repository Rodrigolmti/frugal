import React from 'react';
import { SearchResults as SearchResultsType, Product, ComparisonProduct } from '../types';
import ProductCard from './ProductCard';
import { AlertTriangle, Store } from 'lucide-react';

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
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">
          Try searching with different keywords or check your spelling.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Compare Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Search Results for "{results.searchTerm}"
        </h2>
        {selectedCount > 1 && (
          <button
            onClick={onCompare}
            className="btn-primary px-6 py-3"
          >
            Compare {selectedCount} Products
          </button>
        )}
      </div>

      {/* Selection Instructions */}
      {selectedCount === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>How it works:</strong> Select one product from each store to compare prices. 
            Choose products that are similar or equivalent across different stores.
          </p>
        </div>
      )}

      {selectedCount === 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            <strong>Select more products:</strong> Choose at least one more product from a different store to start comparing prices.
          </p>
        </div>
      )}

      {/* Store Results */}
      {storeEntries.map(([storeId, storeResult]) => (
        <div key={storeId} className="space-y-4">
          {/* Store Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <Store className="h-5 w-5 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              {storeResult.storeName}
            </h3>
            <span className="text-sm text-gray-500">
              ({storeResult.products.length} products found)
            </span>
          </div>

          {/* Error State */}
          {storeResult.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 text-sm">
                  <strong>Error loading from {storeResult.storeName}:</strong> {storeResult.error}
                </p>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {storeResult.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="text-center py-8 text-gray-500">
              <p>No products found in {storeResult.storeName}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
