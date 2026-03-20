import { FC } from 'react';
import { Product } from '../../types';
import { ExternalLink, Tag, Package, Scale, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  isSelected?: boolean;
  showSelectButton?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({
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
    <div
      className={`card-notion overflow-hidden transition-all duration-200 ${
        isSelected
          ? 'card-notion-selected ring-1 ring-notion-blue/30'
          : 'hover:shadow-notion-md'
      }`}
    >
      {/* Product Image */}
      <div className="aspect-[4/3] w-full bg-notion-100 relative overflow-hidden">
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
            <Package className="h-8 w-8" />
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-notion-red text-white text-[11px] font-semibold px-2 py-0.5 rounded-notion">
            Sale
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-notion-800/80 text-white text-notion-xs font-medium px-3 py-1 rounded-notion">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-notion-lg space-y-notion-md">
        {/* Store Badge */}
        <span className="badge-notion-neutral">{product.store}</span>

        {/* Product Name */}
        <h3 className="text-notion-sm font-medium text-notion-900 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-notion-sm">
          <span className="text-notion-xl font-bold text-notion-900">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-notion-xs text-notion-400 line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
          {product.unit && (
            <span className="text-notion-xs text-notion-400">{product.unit}</span>
          )}
        </div>

        {/* Product Details */}
        {(product.size || product.weight || product.offer) && (
          <div className="space-y-1">
            {product.offer && (
              <div className="flex items-center gap-notion-xs">
                <Tag className="h-3 w-3 text-notion-orange" />
                <span className="text-notion-xs text-notion-orange font-medium">
                  {product.offer}
                </span>
              </div>
            )}
            <div className="flex items-center gap-notion-md text-notion-xs text-notion-400">
              {product.size && (
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>{product.size}</span>
                </div>
              )}
              {product.weight && (
                <div className="flex items-center gap-1">
                  <Scale className="h-3 w-3" />
                  <span>{product.weight}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-notion-xs">
          {showSelectButton && onSelect ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              disabled={!product.inStock}
              className={`flex-1 py-2 px-notion-md rounded-notion-lg text-notion-sm font-medium transition-all duration-200 flex items-center justify-center gap-notion-sm ${
                isSelected
                  ? 'bg-notion-blue text-white'
                  : product.inStock
                  ? 'bg-notion-100 hover:bg-notion-200 text-notion-700'
                  : 'bg-notion-50 text-notion-300 cursor-not-allowed'
              }`}
            >
              {isSelected && <Check className="h-3.5 w-3.5" />}
              {isSelected ? 'Selected' : product.inStock ? 'Select' : 'Unavailable'}
            </button>
          ) : (
            <div />
          )}
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 p-2 text-notion-400 hover:text-notion-blue hover:bg-notion-blue-light rounded-notion-lg transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
