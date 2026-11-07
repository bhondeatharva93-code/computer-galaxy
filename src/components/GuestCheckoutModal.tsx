import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building,
  Banknote,
  MessageCircle,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { CartItem, GuestDeliveryDetails, GuestOrder } from '../types';
import { api } from '../services/api';
import {
  formatINR,
  calculateCartTotals,
  validateGuestDetails,
  generateOrderId,
  generateGstInvoiceNumber,
  createWhatsAppChatUrl,
} from '../utils/cart';

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderPlaced: (order: GuestOrder) => void;
  onClearCart: () => void;
}

const INDIAN_STATES = [
  'Maharashtra',
  'Karnataka',
  'Delhi NCR',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'Uttar Pradesh',
  'West Bengal',
  'Kerala',
  'Rajasthan',
  'Punjab',
  'Haryana',
  'Madhya Pradesh',
  'Andhra Pradesh',
  'Bihar',
  'Odisha',
  'Assam',
  'Goa',
  'Uttarakhand',
  'Himachal Pradesh',
  'Other States & UTs',
];

export const GuestCheckoutModal: React.FC<GuestCheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderPlaced,
  onClearCart,
}) => {
  const [formData, setFormData] = useState<GuestDeliveryDetails>({
    fullName: '',
    phone: '',
    email: '',
    addressLine: '',
    city: '',
    state: 'Maharashtra',
    pinCode: '',
    notes: '',
    paymentMethod: 'upi',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [placedOrder, setPlacedOrder] = useState<GuestOrder | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const totals = calculateCartTotals(items);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateGuestDetails(formData);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    const newOrder: GuestOrder = {
      id: generateOrderId(),
      createdAt: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      customer: { ...formData },
      items: [...items],
      subtotal: totals.subtotal,
      discount: totals.catalogSavings + totals.couponDiscount,
      deliveryCharge: totals.deliveryCharge,
      total: totals.total,
      status: 'Confirmed',
      trackingNumber: `BD-IN-${Math.floor(1000000 + Math.random() * 9000000)}`,
      gstInvoiceNumber: generateGstInvoiceNumber(),
    };

    try {
      await api.createOrder(newOrder);
    } catch (err) {
      console.warn('Backend order save fallback to local state:', err);
    } finally {
      setIsSubmitting(false);
    }

    setPlacedOrder(newOrder);
    onOrderPlaced(newOrder);
    onClearCart();
  };

  const handleCopyOrder = () => {
    if (!placedOrder) return;
    navigator.clipboard.writeText(placedOrder.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCloseAll = () => {
    setPlacedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-3xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFFFFF] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                100% Guest Checkout
              </span>
              <span className="text-xs text-[#64748B]">No Password Required</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#172B4D] tracking-tight mt-0.5">
              {placedOrder ? 'Order Confirmed!' : 'Express Delivery Details'}
            </h2>
          </div>

          <button
            onClick={handleCloseAll}
            className="w-8 h-8 rounded-full bg-[#F5F7FA] hover:bg-[#E5E7EB] text-[#172B4D] flex items-center justify-center transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {placedOrder ? (
            /* Order Success Receipt */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#172B4D]">
                  Thank you, {placedOrder.customer.fullName}!
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Your hardware order has been received and scheduled for dispatch via BlueDart Air.
                </p>
              </div>

              {/* Order Metadata Box */}
              <div className="bg-[#F5F7FA] rounded-xl p-5 border border-[#E5E7EB] text-left max-w-lg mx-auto space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <div>
                    <span className="text-[11px] text-[#64748B] block">Order Reference ID</span>
                    <span className="text-sm font-extrabold text-[#172B4D]">{placedOrder.id}</span>
                  </div>
                  <button
                    onClick={handleCopyOrder}
                    className="p-1.5 text-xs text-[#783D1B] hover:bg-[#783D1B]/10 rounded flex items-center gap-1"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#64748B] block">Delivery Address:</span>
                    <span className="font-semibold text-[#172B4D] block mt-0.5">
                      {placedOrder.customer.addressLine}, {placedOrder.customer.city}, {placedOrder.customer.state} - {placedOrder.customer.pinCode}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#64748B] block">Contact & Updates:</span>
                    <span className="font-semibold text-[#172B4D] block mt-0.5">
                      +91 {placedOrder.customer.phone}
                    </span>
                    <span className="text-[#64748B] text-[11px] block">{placedOrder.customer.email}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#64748B] block">GST Tax Invoice:</span>
                    <span className="font-semibold text-[#172B4D]">{placedOrder.gstInvoiceNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#64748B] block">Total Paid / COD:</span>
                    <span className="text-sm font-extrabold text-[#172B4D] tabular-nums">
                      {formatINR(placedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={createWhatsAppChatUrl(
                    `Hello Computer Galaxy, I just placed Order #${placedOrder.id} for ${formatINR(
                      placedOrder.total
                    )}. My name is ${placedOrder.customer.fullName}. Please send live dispatch updates on this WhatsApp number!`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Get WhatsApp Dispatch Updates
                </a>

                <button
                  onClick={handleCloseAll}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#F5F7FA] border border-[#E5E7EB] text-[#172B4D] text-xs font-semibold rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Guest Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Order items preview summary */}
              <div className="bg-[#F5F7FA] rounded-xl p-4 border border-[#E5E7EB]">
                <div className="flex items-center justify-between text-xs font-bold text-[#172B4D] mb-2">
                  <span>Cart Items ({totals.itemCount})</span>
                  <span className="tabular-nums">Total: {formatINR(totals.total)}</span>
                </div>
                <div className="text-xs text-[#64748B] divide-y divide-[#E5E7EB]/60">
                  {items.map((item) => (
                    <div key={item.product.id} className="py-1.5 flex justify-between">
                      <span className="truncate max-w-[280px]">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="tabular-nums font-medium text-[#172B4D]">
                        {formatINR(item.product.discountedPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details Inputs */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] mb-3 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#783D1B]" />
                  Shipping Destination
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#783D1B]"
                    />
                    {formErrors.fullName && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                      WhatsApp Mobile Number (10 Digits) *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs text-[#64748B] font-medium">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="9876543210"
                        className="w-full pl-11 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#783D1B]"
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                      Email Address (for GST invoice & tracking) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rahul@example.com"
                      className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#783D1B]"
                    />
                    {formErrors.email && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                      Flat / House No., Building Name & Street *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.addressLine}
                      onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                      placeholder="e.g. Flat 304, Emerald Tower, Linking Road, Bandra West"
                      className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#783D1B]"
                    />
                    {formErrors.addressLine && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.addressLine}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#783D1B]"
                    />
                    {formErrors.city && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                      State *
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:border-[#783D1B]"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                      PIN Code (6 Digits) *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={formData.pinCode}
                      onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                      placeholder="e.g. 400050"
                      className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#783D1B]"
                    />
                    {formErrors.pinCode && (
                      <p className="text-[11px] text-rose-600 mt-1">{formErrors.pinCode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                      Special Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g. Call before delivery / leave at reception"
                      className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#783D1B]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] mb-3">
                  Choose Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-colors ${
                      formData.paymentMethod === 'upi'
                        ? 'bg-[#783D1B]/5 border-[#783D1B] ring-1 ring-[#783D1B]'
                        : 'bg-white hover:bg-[#F5F7FA] border-[#E5E7EB]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                      className="text-[#783D1B]"
                    />
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-[#783D1B]" />
                      <div>
                        <span className="text-xs font-bold text-[#172B4D] block">
                          Instant UPI QR & Apps
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          GPay, PhonePe, Paytm, BHIM
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-colors ${
                      formData.paymentMethod === 'card'
                        ? 'bg-[#783D1B]/5 border-[#783D1B] ring-1 ring-[#783D1B]'
                        : 'bg-white hover:bg-[#F5F7FA] border-[#E5E7EB]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                      className="text-[#783D1B]"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <div>
                        <span className="text-xs font-bold text-[#172B4D] block">
                          Credit & Debit Cards
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Visa, Mastercard, RuPay
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-colors ${
                      formData.paymentMethod === 'netbanking'
                        ? 'bg-[#783D1B]/5 border-[#783D1B] ring-1 ring-[#783D1B]'
                        : 'bg-white hover:bg-[#F5F7FA] border-[#E5E7EB]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={formData.paymentMethod === 'netbanking'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'netbanking' })}
                      className="text-[#783D1B]"
                    />
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-slate-700" />
                      <div>
                        <span className="text-xs font-bold text-[#172B4D] block">
                          Net Banking
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          HDFC, ICICI, SBI, Axis, etc.
                        </span>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-colors ${
                      formData.paymentMethod === 'cod'
                        ? 'bg-[#783D1B]/5 border-[#783D1B] ring-1 ring-[#783D1B]'
                        : 'bg-white hover:bg-[#F5F7FA] border-[#E5E7EB]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                      className="text-[#783D1B]"
                    />
                    <div className="flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-emerald-600" />
                      <div>
                        <span className="text-xs font-bold text-[#172B4D] block">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Confirmed via WhatsApp Call
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 border-t border-[#E5E7EB] space-y-2.5">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Place Guest Order ({formatINR(totals.total)})</span>
                </button>

                <p className="text-[11px] text-center text-[#64748B]">
                  By placing this order you receive an official GST Tax Invoice and 3-Year Hardware Warranty.
                </p>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
