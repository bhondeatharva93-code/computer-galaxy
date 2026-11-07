import React from 'react';
import { Heart, ShoppingCart, Eye, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../utils/cart';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onQuickView,
}) => {
  return (
    <div className="bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden">
      
      {/* Top Image Box */}
      <div className="relative p-4 bg-[#FFFFFF] flex items-center justify-center min-h-[220px] overflow-hidden">
        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-[#FFB020] text-[#172B4D] text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs z-10 tabular-nums">
            {product.discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full border flex items-center justify-center transition-all z-10 ${
            isWishlisted
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-white/90 hover:bg-white border-[#E5E7EB] text-[#64748B] hover:text-rose-500 shadow-xs'
          }`}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Product Image */}
        <div
          onClick={() => onQuickView(product)}
          className="w-full h-48 flex items-center justify-center cursor-pointer p-2"
        >
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="max-h-44 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Quick View Overlay Button */}
        <button
          onClick={() => onQuickView(product)}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-[#172B4D] text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm border border-[#E5E7EB] flex items-center gap-1.5 hover:bg-white whitespace-nowrap"
          aria-label={`Quick view ${product.name}`}
        >
          <Eye className="w-3.5 h-3.5" />
          Quick Specs
        </button>
      </div>

      {/* Product Details */}
      <div className="p-4 pt-2 border-t border-[#F5F7FA] flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category Unboxed */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-1">
            <span>{product.brand}</span>
            <span>·</span>
            <span>{product.categoryLabel}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="text-sm font-bold text-[#172B4D] group-hover:text-[#783D1B] transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Ratings & Stock Status */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <span className="flex items-center gap-0.5 text-[#172B4D] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#FFB020] text-[#FFB020]" />
                {product.rating}
              </span>
              <span className="text-[#64748B] text-[11px]">({product.reviewCount})</span>
            </div>

            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <Check className="w-3 h-3 stroke-[2.5]" />
              In Stock
            </span>
          </div>

          {/* Pricing */}
          <div className="mt-3 pt-2 border-t border-[#F5F7FA] flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-extrabold text-[#172B4D] tabular-nums">
              {formatINR(product.discountedPrice)}
            </span>
            {product.originalPrice > product.discountedPrice && (
              <span className="text-xs text-[#64748B] line-through tabular-nums">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-2">
          <button
            onClick={() => onAddToCart(product)}
            className="px-3 py-2 bg-[#F5F7FA] hover:bg-[#E5E7EB] text-[#172B4D] text-xs font-semibold rounded-lg border border-[#E5E7EB] flex items-center justify-center gap-1.5 transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#783D1B]" />
            Add to Cart
          </button>

          <button
            onClick={() => onBuyNow(product)}
            className="px-3 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center"
            aria-label={`Buy ${product.name} now`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};
