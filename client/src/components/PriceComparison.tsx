import React from 'react';
import { ComparisonProduct } from '../types';
import ProductCard from './ProductCard';
import { ArrowLeft, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface PriceComparisonProps {
  selectedProducts: ComparisonProduct[];
  onBack: () => void;
  onRemoveProduct: (storeId: string, productId: string) => void;
}

const PriceComparison: React.FC<PriceComparisonProps> = ({
  selectedProducts,
  onBack,
  onRemoveProduct
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(price);
  };

  // Sort products by price (lowest first)
  const sortedProducts = [...selectedProducts].sort((a, b) => a.product.price - b.product.price);
  const lowestPrice = sortedProducts[0]?.product.price || 0;
  const highestPrice = sortedProducts[sortedProducts.length - 1]?.product.price || 0;

  const getPriceIndicator = (price: number) => {
    if (price === lowestPrice && price !== highestPrice) {
      return { icon: TrendingDown, color: 'text-green-600', label: 'Best Price' };
    } else if (price === highestPrice && price !== lowestPrice) {
      return { icon: TrendingUp, color: 'text-red-600', label: 'Highest Price' };
    } else {
      return { icon: Minus, color: 'text-gray-500', label: '' };
    }
  };

  const calculateSavings = (price: number) => {
    if (price === lowestPrice) return 0;
    return price - lowestPrice;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          Price Comparison ({selectedProducts.length} products)
        </h2>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(lowestPrice)}
            </div>
            <div className="text-sm text-gray-600">Lowest Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatPrice(highestPrice)}
            </div>
            <div className="text-sm text-gray-600">Highest Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(highestPrice - lowestPrice)}
            </div>
            <div className="text-sm text-gray-600">Max Savings</div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Product Comparison</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {sortedProducts.map(({ storeId, product }, index) => {
            const priceIndicator = getPriceIndicator(product.price);
            const savings = calculateSavings(product.price);
            const PriceIcon = priceIndicator.icon;

            return (
              <div key={`${storeId}-${product.id}`} className="p-6">
                <div className="flex items-start gap-6">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                    {index + 1}
                  </div>

                  {/* Product Image */}
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600">{product.store}</p>
                      </div>
                      <button
                        onClick={() => onRemoveProduct(storeId, product.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove from comparison"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        {product.unit && (
                          <span className="text-sm text-gray-500">{product.unit}</span>
                        )}
                      </div>

                      {/* Price Indicator */}
                      <div className={`flex items-center gap-1 ${priceIndicator.color}`}>
                        <PriceIcon className="h-4 w-4" />
                        {priceIndicator.label && (
                          <span className="text-sm font-medium">{priceIndicator.label}</span>
                        )}
                      </div>

                      {/* Savings */}
                      {savings > 0 && (
                        <div className="text-sm text-red-600">
                          +{formatPrice(savings)} vs lowest
                        </div>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      
                      {product.url && (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View on {product.store} →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Shopping Tips</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Check if stores offer price matching policies</li>
          <li>• Consider additional costs like delivery fees or gas for pickup</li>
          <li>• Verify product sizes and units are comparable</li>
          <li>• Check expiration dates when shopping for perishables</li>
        </ul>
      </div>
    </div>
  );
};

export default PriceComparison;
