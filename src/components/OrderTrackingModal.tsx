import React, { useState } from 'react';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { formatINR } from '../utils/cart';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
}) => {
  const [query, setQuery] = useState(initialOrderId);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.trackOrder(query.trim());
      if (res.success && res.orders && res.orders.length > 0) {
        setResults(res.orders);
      } else {
        setResults([]);
      }
      setSearched(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to find tracking records.');
      setResults([]);
      setSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepStatus = (orderStatus: string, stepIndex: number) => {
    const statuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'];
    const currentIdx = statuses.indexOf(orderStatus);
    if (orderStatus === 'Cancelled') {
      return 'cancelled';
    }
    if (currentIdx === -1) {
      // Default to confirmed if not recognized
      return stepIndex <= 1 ? 'completed' : 'upcoming';
    }
    if (stepIndex < currentIdx) return 'completed';
    if (stepIndex === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFFFFF] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#783D1B]/10 text-[#783D1B] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#172B4D]">
                Track Your Consignment & PC Order
              </h2>
              <p className="text-xs text-[#64748B]">
                Real-time transit updates with BlueDart Air & DTDC Express
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 bg-[#F8FAFC] border-b border-[#E5E7EB]">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. CG-89210) or 10-digit Phone..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs sm:text-sm text-[#172B4D] placeholder-[#94A3B8] focus:outline-none focus:border-[#783D1B] focus:ring-1 focus:ring-[#783D1B]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 bg-[#783D1B] hover:bg-[#5C2E13] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs shrink-0"
            >
              {isLoading ? 'Tracking...' : 'Track'}
            </button>
          </form>

          <p className="text-[11px] text-[#64748B] mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Try sample order ID: <strong className="text-[#172B4D] font-mono cursor-pointer hover:underline" onClick={() => setQuery('CG-89210')}>CG-89210</strong></span>
          </p>
        </div>

        {/* Results Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {searched && results && results.length === 0 && (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No consignment found matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400">
                Please verify your Computer Galaxy Order ID from SMS/WhatsApp or contact support.
              </p>
            </div>
          )}

          {results && results.map((order) => {
            const steps = [
              { label: 'Order Placed', desc: 'Received & Queued' },
              { label: 'Confirmed', desc: 'Component Reservation' },
              { label: 'Processing', desc: 'Stress Testing & Assembly' },
              { label: 'Packed', desc: 'Instapak Expanding Foam' },
              { label: 'Dispatched', desc: 'BlueDart Air in transit' },
              { label: 'Delivered', desc: 'Handed to Customer' },
            ];

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-xs space-y-5"
              >
                {/* Order Top Summary */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-[#172B4D]">
                        {order.id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#783D1B]/10 text-[#783D1B]">
                        {order.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Placed on {order.createdAt}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Amount</span>
                    <span className="text-base font-extrabold text-[#783D1B]">
                      {formatINR(order.total)}
                    </span>
                  </div>
                </div>

                {/* Tracking & Courier Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">AWB Courier Waybill</span>
                    <span className="font-mono font-bold text-[#172B4D] select-all">
                      {order.trackingNumber || 'Processing AWB Number'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Delivery Destination</span>
                    <span className="font-semibold text-[#172B4D] truncate block">
                      {order.customer?.city}, {order.customer?.state} - {order.customer?.pinCode}
                    </span>
                  </div>
                </div>

                {/* Multi-step Pipeline Tracker */}
                <div className="py-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                    Shipment Timeline
                  </h4>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {steps.map((st, idx) => {
                      const state = getStepStatus(order.status, idx);
                      return (
                        <div key={st.label} className="relative flex items-start gap-3">
                          <div
                            className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                              state === 'completed'
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : state === 'current'
                                ? 'bg-[#783D1B] border-[#783D1B] text-white ring-4 ring-[#783D1B]/20'
                                : 'bg-white border-slate-300 text-slate-400'
                            }`}
                          >
                            {state === 'completed' ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <span className="text-[10px]">{idx + 1}</span>
                            )}
                          </div>

                          <div className="pt-0.5">
                            <span
                              className={`text-xs font-bold block ${
                                state === 'current'
                                  ? 'text-[#783D1B]'
                                  : state === 'completed'
                                  ? 'text-slate-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {st.label}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {st.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items in Consignment */}
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">
                    Package Contents ({order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''})
                  </h4>
                  <div className="space-y-2">
                    {order.items?.map((it: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{it.quantity}x</span>
                          <span className="text-slate-600 truncate max-w-xs sm:max-w-md">
                            {it.product?.name || 'Custom Component'}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-700">
                          {formatINR((it.product?.discountedPrice || it.product?.originalPrice || 0) * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
