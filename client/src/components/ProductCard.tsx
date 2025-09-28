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
    <div className={`card-notion transition-all duration-150 cursor-pointer ${
      isSelected ? 'card-notion-selected' : 'hover:shadow-notion-md'
    }`}>
      <div className="p-notion-lg">
        {/* Product Image */}
        <div className="aspect-square w-full mb-notion-md bg-notion-100 rounded-notion overflow-hidden">
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

        {/* Product Info */}
        <div className="space-y-notion-sm">
          <h3 className="text-notion-body font-medium text-notion-900 line-clamp-2 leading-tight">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-notion-sm">
            <span className="text-notion-xl font-semibold text-notion-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-notion-caption text-notion-400 line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
            {product.unit && (
              <span className="text-notion-muted">{product.unit}</span>
            )}
          </div>

          {/* Store and Stock Status */}
          <div className="flex items-center justify-between">
            <span className="badge-notion-neutral">
              {product.store}
            </span>
            {!product.inStock && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-notion-red" />
                <span className="text-notion-muted">Out of Stock</span>
              </div>
            )}
            {product.url && (
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-notion-blue hover:text-opacity-80 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Select Button */}
          {showSelectButton && onSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              disabled={!product.inStock}
              className={`w-full mt-notion-md py-notion-sm px-notion-md rounded-notion text-notion-sm font-medium transition-all duration-150 ${
                isSelected
                  ? 'bg-notion-blue text-white'
                  : product.inStock
                  ? 'bg-notion-100 hover:bg-notion-200 text-notion-700'
                  : 'bg-notion-50 text-notion-400 cursor-not-allowed'
              }`}
            >
              {isSelected ? 'Selected' : product.inStock ? 'Select' : 'Out of Stock'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
