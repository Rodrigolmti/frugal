import { FC } from 'react';
import { ComparisonProduct } from '../../types';
import { ArrowLeft, TrendingDown, TrendingUp, X, ExternalLink, Minus } from 'lucide-react';

interface PriceComparisonProps {
  selectedProducts: ComparisonProduct[];
  onBack: () => void;
  onRemoveProduct: (storeId: string, productId: string) => void;
}

const PriceComparison: FC<PriceComparisonProps> = ({
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
    <div className="space-y-notion-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-notion-heading mb-notion-sm">
            Price Comparison
          </h2>
          <p className="text-notion-caption">
            Comparing {selectedProducts.length} products
          </p>
        </div>
        <button
          onClick={onBack}
          className="btn-notion-secondary flex items-center gap-notion-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </button>
      </div>

      {/* Summary Stats */}
      <div className="card-notion p-notion-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-notion-2xl">
          <div className="text-center">
            <div className="text-notion-3xl font-semibold text-notion-green mb-notion-sm">
              {formatPrice(lowestPrice)}
            </div>
            <div className="text-notion-caption">Lowest Price</div>
          </div>
          <div className="text-center">
            <div className="text-notion-3xl font-semibold text-notion-red mb-notion-sm">
              {formatPrice(highestPrice)}
            </div>
            <div className="text-notion-caption">Highest Price</div>
          </div>
          <div className="text-center">
            <div className="text-notion-3xl font-semibold text-notion-blue mb-notion-sm">
              {formatPrice(highestPrice - lowestPrice)}
            </div>
            <div className="text-notion-caption">Potential Savings</div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="card-notion overflow-hidden">
        <div className="px-notion-2xl py-notion-lg bg-notion-50 border-b border-notion-200">
          <h3 className="text-notion-subheading">Product Comparison</h3>
        </div>
        
        <div className="divide-y divide-notion-200">
          {sortedProducts.map(({ storeId, product }, index) => {
            const priceIndicator = getPriceIndicator(product.price);
            const savings = calculateSavings(product.price);
            const PriceIcon = priceIndicator.icon;

            return (
              <div key={`${storeId}-${product.id}`} className={`p-notion-2xl ${
                product.price === lowestPrice ? 'bg-green-50 border-l-4 border-green-500' : ''
              }`}>
                <div className="flex items-start gap-notion-lg">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 bg-notion-100 rounded-full flex items-center justify-center text-notion-sm font-medium text-notion-600">
                    {index + 1}
                  </div>

                  {/* Product Image */}
                  <div className="flex-shrink-0 w-20 h-20 bg-notion-100 rounded-notion overflow-hidden">
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
                      <div className="w-full h-full flex items-center justify-center text-notion-400">
                        <span className="text-notion-muted">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow space-y-notion-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-notion-body font-medium text-notion-900 line-clamp-2 mb-1">
                          {product.name}
                        </h4>
                        <span className="badge-notion-neutral">{product.store}</span>
                      </div>
                      <button
                        onClick={() => onRemoveProduct(storeId, product.id)}
                        className="text-notion-400 hover:text-notion-red transition-colors p-1"
                        title="Remove from comparison"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-notion-lg">
                      {/* Price */}
                      <div className="flex items-baseline gap-notion-sm">
                        <span className="text-notion-2xl font-semibold text-notion-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-notion-caption text-notion-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        {product.unit && (
                          <span className="text-notion-muted">{product.unit}</span>
                        )}
                      </div>

                      {/* Price Indicator */}
                      <div className={`flex items-center gap-1 ${
                        priceIndicator.color === 'text-green-600' ? 'text-notion-green' :
                        priceIndicator.color === 'text-red-600' ? 'text-notion-red' : 'text-notion-400'
                      }`}>
                        <PriceIcon className="h-4 w-4" />
                        {priceIndicator.label && (
                          <span className="text-notion-sm font-medium">{priceIndicator.label}</span>
                        )}
                      </div>

                      {/* Savings */}
                      {savings > 0 && (
                        <div className="text-notion-sm text-notion-red">
                          +{formatPrice(savings)} vs lowest
                        </div>
                      )}
                    </div>

                    {/* Stock Status and Link */}
                    <div className="flex items-center gap-notion-lg">
                      <span className={`${
                        product.inStock 
                          ? 'badge-notion-success' 
                          : 'badge-notion-error'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      
                      {product.url && (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-notion-blue hover:text-opacity-80 text-notion-sm font-medium flex items-center gap-1 transition-colors"
                        >
                          View on {product.store}
                          <ExternalLink className="h-3 w-3" />
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
      <div className="bg-notion-blue-light border border-notion-blue border-opacity-20 rounded-notion-lg p-notion-lg">
        <h4 className="text-notion-body font-medium text-notion-blue mb-notion-md">Shopping Tips</h4>
        <ul className="text-notion-caption text-notion-blue space-y-notion-sm">
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
