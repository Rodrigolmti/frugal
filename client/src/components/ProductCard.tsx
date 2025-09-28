import React from 'react';
import { Product } from '../types';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  isSelected?: boolean;
  showSelectButton?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSelect, 
  isSelected = false,
  showSelectButton = true 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(price);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className={`bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
      isSelected ? 'border-primary-500 shadow-md' : 'border-gray-200'
    }`}>
      <div className="p-4">
        {/* Product Image */}
        <div className="aspect-square w-full mb-3 bg-gray-100 rounded-lg overflow-hidden">
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
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
            {product.unit && (
              <span className="text-xs text-gray-500">{product.unit}</span>
            )}
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Out of Stock</span>
            </div>
          )}

          {/* Store Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {product.store}
            </span>
            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Select Button */}
          {showSelectButton && onSelect && (
            <button
              onClick={() => onSelect(product)}
              disabled={!product.inStock}
              className={`w-full mt-3 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isSelected
                  ? 'bg-primary-600 text-white'
                  : product.inStock
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSelected ? 'Selected' : product.inStock ? 'Select for Comparison' : 'Out of Stock'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
