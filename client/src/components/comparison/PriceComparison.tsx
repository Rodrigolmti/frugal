import { FC } from 'react';
import { ComparisonProduct } from '../../types';
import { ArrowLeft, TrendingDown, TrendingUp, X, ExternalLink, Minus, Trophy, AlertTriangle, DollarSign } from 'lucide-react';

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

  const sortedProducts = [...selectedProducts].sort((a, b) => a.product.price - b.product.price);
  const lowestPrice = sortedProducts[0]?.product.price || 0;
  const highestPrice = sortedProducts[sortedProducts.length - 1]?.product.price || 0;
  const savings = highestPrice - lowestPrice;

  const getPriceIndicator = (price: number) => {
    if (price === lowestPrice && price !== highestPrice) {
      return { icon: TrendingDown, color: 'text-notion-green', label: 'Best Price' };
    } else if (price === highestPrice && price !== lowestPrice) {
      return { icon: TrendingUp, color: 'text-notion-red', label: 'Highest' };
    } else {
      return { icon: Minus, color: 'text-notion-400', label: '' };
    }
  };

  const calculateSavings = (price: number) => {
    if (price === lowestPrice) return 0;
    return price - lowestPrice;
  };

  return (
    <div className="space-y-notion-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-notion-2xl font-bold text-notion-900 mb-notion-xs">
            Price Comparison
          </h2>
          <p className="text-notion-sm text-notion-500">
            Comparing {selectedProducts.length} products across stores
          </p>
        </div>
        <button
          onClick={onBack}
          className="btn-notion-secondary flex items-center gap-notion-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-notion-md">
        <div className="card-notion p-notion-xl">
          <div className="flex items-center gap-notion-md mb-notion-md">
            <div className="w-10 h-10 bg-notion-green-light rounded-notion-xl flex items-center justify-center">
              <Trophy className="h-5 w-5 text-notion-green" />
            </div>
            <div>
              <p className="text-notion-xs text-notion-500 uppercase tracking-wider font-medium">Best Price</p>
              <p className="text-notion-2xl font-bold text-notion-green">{formatPrice(lowestPrice)}</p>
            </div>
          </div>
        </div>

        <div className="card-notion p-notion-xl">
          <div className="flex items-center gap-notion-md mb-notion-md">
            <div className="w-10 h-10 bg-notion-red-light rounded-notion-xl flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-notion-red" />
            </div>
            <div>
              <p className="text-notion-xs text-notion-500 uppercase tracking-wider font-medium">Highest</p>
              <p className="text-notion-2xl font-bold text-notion-red">{formatPrice(highestPrice)}</p>
            </div>
          </div>
        </div>

        <div className="card-notion p-notion-xl">
          <div className="flex items-center gap-notion-md mb-notion-md">
            <div className="w-10 h-10 bg-notion-blue-light rounded-notion-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-notion-blue" />
            </div>
            <div>
              <p className="text-notion-xs text-notion-500 uppercase tracking-wider font-medium">You Save</p>
              <p className="text-notion-2xl font-bold text-notion-blue">{formatPrice(savings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison List */}
      <div className="space-y-notion-md">
        {sortedProducts.map(({ storeId, product }, index) => {
          const priceIndicator = getPriceIndicator(product.price);
          const productSavings = calculateSavings(product.price);
          const PriceIcon = priceIndicator.icon;
          const isBest = product.price === lowestPrice && lowestPrice !== highestPrice;

          return (
            <div
              key={`${storeId}-${product.id}`}
              className={`card-notion overflow-hidden transition-all duration-200 ${
                isBest ? 'ring-2 ring-notion-green/30 border-notion-green/40' : ''
              }`}
            >
              <div className="p-notion-xl">
                <div className="flex items-start gap-notion-lg">
                  {/* Rank */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-notion-lg flex items-center justify-center text-notion-sm font-bold ${
                    isBest
                      ? 'bg-notion-green text-white'
                      : 'bg-notion-100 text-notion-500'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Product Image */}
                  <div className="flex-shrink-0 w-16 h-16 bg-notion-100 rounded-notion-lg overflow-hidden">
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
                      <div className="w-full h-full flex items-center justify-center text-notion-300">
                        <span className="text-notion-xs">N/A</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-notion-md">
                      <div className="min-w-0">
                        <h4 className="text-notion-sm font-medium text-notion-900 line-clamp-1 mb-1">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-notion-sm flex-wrap">
                          <span className="badge-notion-neutral">{product.store}</span>
                          <span className={product.inStock ? 'badge-notion-success' : 'badge-notion-error'}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-baseline gap-notion-sm justify-end">
                          <span className="text-notion-xl font-bold text-notion-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-notion-xs text-notion-400 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        {product.unit && (
                          <span className="text-notion-xs text-notion-400">{product.unit}</span>
                        )}
                        {/* Price Indicator */}
                        <div className={`flex items-center gap-1 justify-end mt-1 ${priceIndicator.color}`}>
                          <PriceIcon className="h-3.5 w-3.5" />
                          {priceIndicator.label && (
                            <span className="text-notion-xs font-medium">{priceIndicator.label}</span>
                          )}
                        </div>
                        {productSavings > 0 && (
                          <p className="text-notion-xs text-notion-red mt-0.5">
                            +{formatPrice(productSavings)} more
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-notion-md mt-notion-md pt-notion-md border-t border-notion-100">
                      {product.url && (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-notion-blue hover:text-notion-blue-dark text-notion-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          View on {product.store}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <div className="flex-1" />
                      <button
                        onClick={() => onRemoveProduct(storeId, product.id)}
                        className="text-notion-400 hover:text-notion-red hover:bg-notion-red-light p-1.5 rounded-notion-lg transition-all text-notion-xs flex items-center gap-1"
                        title="Remove from comparison"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="card-notion p-notion-xl">
        <h4 className="text-notion-sm font-semibold text-notion-900 mb-notion-md">Shopping Tips</h4>
        <ul className="space-y-notion-sm text-notion-sm text-notion-500">
          <li className="flex items-start gap-notion-sm">
            <span className="text-notion-300 mt-1">&#8226;</span>
            Check if stores offer price matching policies
          </li>
          <li className="flex items-start gap-notion-sm">
            <span className="text-notion-300 mt-1">&#8226;</span>
            Consider delivery fees or gas for pickup
          </li>
          <li className="flex items-start gap-notion-sm">
            <span className="text-notion-300 mt-1">&#8226;</span>
            Verify product sizes and units are comparable
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PriceComparison;
