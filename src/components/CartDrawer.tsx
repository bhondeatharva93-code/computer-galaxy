import React, { useState } from 'react';
import {
  X,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { CartItem } from '../types';
import { formatINR, calculateCartTotals } from '../utils/cart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | undefined>(undefined);

  if (!isOpen) return null;

  const totals = calculateCartTotals(items, appliedCouponCode);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedCouponCode(couponInput.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode(undefined);
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-[#FFFFFF] w-full max-w-md h-full flex flex-col shadow-2xl border-l border-[#E5E7EB] animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFFFFF] shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#783D1B]" />
            <h2 className="text-base font-bold text-[#172B4D]">
              Shopping Cart ({totals.itemCount})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F7FA] hover:bg-[#E5E7EB] text-[#172B4D] flex items-center justify-center transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress Notification */}
        <div className="bg-[#F5F7FA] px-4 py-2.5 border-b border-[#E5E7EB] text-xs text-[#172B4D]">
          {totals.subtotal >= 2000 ? (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              You qualify for Free Insured Express Delivery across India!
            </span>
          ) : (
            <span className="text-[#64748B]">
              Add <span className="font-bold text-[#172B4D]">{formatINR(2000 - totals.subtotal)}</span> more for Free Express Delivery.
            </span>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-[#F5F7FA]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F5F7FA] flex items-center justify-center text-[#64748B]">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Your cart is empty</h3>
              <p className="text-xs text-[#64748B] max-w-xs">
                Explore our custom gaming rigs, processors, and graphics cards to add components.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-[#783D1B] text-white text-xs font-semibold rounded-lg hover:bg-[#5C2E13] transition-colors"
              >
                Browse Hardware Store
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-contain rounded-lg border border-[#E5E7EB] bg-[#F5F7FA] p-1 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-[#64748B] uppercase">
                        {item.product.brand}
                      </span>
                      <h4 className="text-xs font-bold text-[#172B4D] line-clamp-1">
                        {item.product.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-[#64748B] hover:text-rose-600 p-1"
                      aria-label={`Remove ${item.product.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#E5E7EB] rounded-md bg-[#FFFFFF]">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs font-semibold hover:bg-[#F5F7FA] text-[#172B4D]"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-bold text-[#172B4D] tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs font-semibold hover:bg-[#F5F7FA] text-[#172B4D]"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#172B4D] tabular-nums">
                        {formatINR(item.product.discountedPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Billing & Checkout Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#FFFFFF] shrink-0 space-y-3">
            {/* Coupon Code Section */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon: GALAXY500"
                  className="w-full px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg uppercase placeholder:normal-case focus:outline-none focus:border-[#783D1B]"
                />
                <Tag className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-2 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#F5F7FA] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#172B4D] text-xs font-semibold rounded-lg transition-colors"
              >
                Apply
              </button>
            </form>

            {totals.appliedCoupon && (
              <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <span>Coupon Applied: {totals.appliedCoupon}</span>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-emerald-800 hover:underline font-bold"
                >
                  Remove
                </button>
              </div>
            )}

            {totals.couponError && (
              <p className="text-[11px] text-amber-700">{totals.couponError}</p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between text-[#64748B]">
                <span>Items Subtotal</span>
                <span className="tabular-nums font-semibold text-[#172B4D]">{formatINR(totals.subtotal)}</span>
              </div>

              {totals.catalogSavings > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Store Discount</span>
                  <span className="tabular-nums font-semibold">-{formatINR(totals.catalogSavings)}</span>
                </div>
              )}

              {totals.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span className="tabular-nums font-semibold">-{formatINR(totals.couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#64748B]">
                <span>Express Insured Shipping</span>
                <span className="tabular-nums">
                  {totals.deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-semibold uppercase">Free</span>
                  ) : (
                    formatINR(totals.deliveryCharge)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-[#172B4D] pt-2 border-t border-[#E5E7EB]">
                <span>Total Amount (Inc. GST)</span>
                <span className="tabular-nums text-base">{formatINR(totals.total)}</span>
              </div>
            </div>

            {/* Primary Guest Checkout CTA */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Guest Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>No login or account creation required</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
