import React from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../utils/cart';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveWishlist,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden relative max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFFFFF] shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-base font-bold text-[#172B4D]">
              Saved Wishlist ({wishlist.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F7FA] hover:bg-[#E5E7EB] text-[#172B4D] flex items-center justify-center transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-[#F5F7FA]">
          {wishlist.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-[#172B4D]">Your wishlist is currently empty</p>
              <p className="text-xs text-[#64748B]">Click the heart icon on any product to save it for later.</p>
            </div>
          ) : (
            wishlist.map((product) => (
              <div key={product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-contain rounded-lg border border-[#E5E7EB] bg-[#F5F7FA] p-1 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase">
                      {product.brand} · {product.categoryLabel}
                    </span>
                    <h4 className="text-xs font-bold text-[#172B4D] truncate">{product.name}</h4>
                    <span className="text-xs font-extrabold text-[#172B4D] tabular-nums">
                      {formatINR(product.discountedPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onRemoveWishlist(product);
                    }}
                    className="px-3 py-1.5 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Move to Cart
                  </button>
                  <button
                    onClick={() => onRemoveWishlist(product)}
                    className="p-1.5 text-[#64748B] hover:text-rose-600 rounded"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
