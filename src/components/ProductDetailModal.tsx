import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  MessageCircle,
  ShoppingCart,
  Heart,
  Check,
  FileText,
  MapPin,
} from 'lucide-react';
import { Product } from '../types';
import { formatINR, createWhatsAppChatUrl } from '../utils/cart';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  if (!product) return null;

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode)) {
      setPincodeStatus(`Available! Standard delivery to ${pincode} in 2-3 business days via BlueDart Air.`);
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  const whatsappInquiryUrl = createWhatsAppChatUrl(
    `Hello Computer Galaxy, I have an inquiry regarding "${product.name}" (Model: ${product.modelNumber}, Price: ${formatINR(
      product.discountedPrice
    )}). Is it currently available for immediate dispatch?`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-4xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F5F7FA] hover:bg-[#E5E7EB] text-[#172B4D] flex items-center justify-center transition-colors z-20"
          aria-label="Close product details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          
          {/* Left Column: Product Image Gallery & Highlights */}
          <div className="md:col-span-5 p-6 bg-[#FFFFFF] border-b md:border-b-0 md:border-r border-[#E5E7EB] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="relative p-6 bg-[#F5F7FA] rounded-xl flex items-center justify-center min-h-[300px] border border-[#E5E7EB]">
                {product.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-[#FFB020] text-[#172B4D] text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {product.discountPercent}% OFF
                  </span>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="max-h-64 max-w-full object-contain"
                />
              </div>

              {/* Warranty & GST Tag */}
              <div className="space-y-2 text-xs text-[#64748B]">
                <div className="flex items-center gap-2 text-[#172B4D]">
                  <ShieldCheck className="w-4 h-4 text-[#783D1B] shrink-0" />
                  <span className="font-semibold">{product.warranty}</span>
                </div>
                <div className="flex items-center gap-2 text-[#172B4D]">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>GST Tax Invoice with Serialized Warranty Card</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Inquiry */}
            <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Ask Technical Question on WhatsApp
              </a>
            </div>
          </div>

          {/* Right Column: Information, Pricing, Specs, Buy */}
          <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Brand */}
              <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] uppercase tracking-wider mb-2">
                <span>{product.brand}</span>
                <span>·</span>
                <span>{product.categoryLabel}</span>
                <span>·</span>
                <span>SKU: {product.modelNumber}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] leading-snug">
                {product.name}
              </h2>

              {/* Reviews & Stock */}
              <div className="flex items-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1 font-bold text-[#172B4D]">
                  <Star className="w-4 h-4 fill-[#FFB020] text-[#FFB020]" />
                  <span>{product.rating}</span>
                  <span className="text-[#64748B] font-normal">({product.reviewCount} customer reviews)</span>
                </div>
                <span className="text-[#E5E7EB]">|</span>
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <Check className="w-3.5 h-3.5" /> In Stock & Ready to Dispatch
                </span>
              </div>

              {/* Pricing Block */}
              <div className="mt-4 p-4 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB] flex items-baseline justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tabular-nums">
                    {formatINR(product.discountedPrice)}
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5">
                    Inclusive of 18% GST (Tax invoice provided)
                  </div>
                </div>

                {product.originalPrice > product.discountedPrice && (
                  <div className="text-right">
                    <span className="text-sm text-[#64748B] line-through block tabular-nums">
                      MRP: {formatINR(product.originalPrice)}
                    </span>
                    <span className="text-xs font-bold text-[#FFB020]">
                      Save {formatINR(product.originalPrice - product.discountedPrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#64748B] mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Technical Specifications Table */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] mb-2.5">
                  Technical Specifications
                </h4>
                <div className="rounded-lg border border-[#E5E7EB] overflow-hidden text-xs divide-y divide-[#E5E7EB]">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 p-2.5 bg-white even:bg-[#F5F7FA]">
                      <span className="font-semibold text-[#172B4D]">{key}</span>
                      <span className="col-span-2 text-[#64748B]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PIN Code Delivery Estimator */}
              <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                <form onSubmit={handleCheckPincode} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#172B4D] shrink-0">
                    <MapPin className="w-4 h-4 text-[#783D1B]" />
                    <span>Check Delivery PIN Code:</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 400001"
                      className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg w-28 focus:outline-none focus:border-[#783D1B]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#F5F7FA] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-xs font-semibold rounded-lg text-[#172B4D]"
                    >
                      Check
                    </button>
                  </div>
                </form>
                {pincodeStatus && (
                  <p className="text-xs mt-2 text-[#783D1B] font-medium flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    {pincodeStatus}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions: Quantity, Add to Cart, Buy Now, Wishlist */}
            <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#E5E7EB] rounded-lg bg-[#FFFFFF]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-sm font-semibold hover:bg-[#F5F7FA] text-[#172B4D] rounded-l-lg"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-[#172B4D] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="px-3 py-2 text-sm font-semibold hover:bg-[#F5F7FA] text-[#172B4D] rounded-r-lg"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#F5F7FA] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#172B4D] text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 text-[#783D1B]" />
                  Add to Cart
                </button>

                {/* Buy Now */}
                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onBuyNow(product);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center"
                >
                  Buy Now
                </button>

                {/* Wishlist toggle */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors ${
                    isWishlisted
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'border-[#E5E7EB] hover:bg-[#F5F7FA] text-[#64748B]'
                  }`}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <p className="text-[11px] text-center text-[#64748B]">
                No account required · Guest checkout with instant receipt and live tracking
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
