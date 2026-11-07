import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../utils/cart';

interface AdminInvoiceModalProps {
  order: any;
  onClose: () => void;
  settings?: any;
}

export const AdminInvoiceModal: React.FC<AdminInvoiceModalProps> = ({ order, onClose, settings }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const businessName = settings?.businessName || 'Computer Galaxy Hardware & Systems';
  const address = settings?.officeAddress || 'Shop 14-16, IT Mall, MG Road, Pune, Maharashtra 411001';
  const gstNumber = settings?.gstNumber || 'GSTIN: 27AABCC1234D1Z8';
  const phone = settings?.contactNumber || '+91 70144 43922';

  const subtotal = order.subtotal || order.total || 0;
  const gstAmount = Math.round(subtotal * 0.18 / 1.18);
  const netAmount = subtotal - gstAmount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Actions (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#172B4D]">Tax Invoice & Pack Slip</span>
            <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">{order.id}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div id="invoice-printable" className="p-8 overflow-y-auto space-y-6 text-[#172B4D]">
          
          {/* Store Logo & Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-6 border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#783D1B] text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                  CG
                </span>
                <h1 className="text-xl font-extrabold text-[#783D1B] tracking-tight">{businessName}</h1>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">{address}</p>
              <p className="text-xs text-slate-600 font-mono mt-0.5">{gstNumber} | Helpline: {phone}</p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-[#783D1B] text-xs font-bold rounded uppercase">
                Tax Invoice
              </span>
              <p className="text-xs font-bold text-slate-800">Invoice: {order.gstInvoiceNumber || 'GST-CG26-4491'}</p>
              <p className="text-xs text-slate-500 font-mono">Date: {order.createdAt}</p>
              <p className="text-xs text-slate-500 font-mono">AWB Tracking: {order.trackingNumber || 'Pending'}</p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Billed & Shipped To:
              </span>
              <p className="font-bold text-sm text-[#172B4D]">{order.customer?.fullName}</p>
              <p className="text-slate-600 mt-0.5">{order.customer?.addressLine}</p>
              <p className="text-slate-600">{order.customer?.city}, {order.customer?.state} - {order.customer?.pinCode}</p>
              <p className="text-slate-700 font-medium mt-1">Phone: {order.customer?.phone}</p>
              {order.customer?.email && <p className="text-slate-600">Email: {order.customer?.email}</p>}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Order & Payment Info:
              </span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="uppercase font-semibold">{order.paymentMethod || 'UPI'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className={`font-semibold ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {order.paymentStatus || 'Paid'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Status:</span>
                  <span className="font-semibold text-[#783D1B]">{order.status || 'Processing'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">#</th>
                  <th className="p-3">Product Description & Model</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{item.product?.name || item.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Model: {item.product?.modelNumber || 'CG-PROD'} | Brand: {item.product?.brand || 'Computer Galaxy'}
                      </p>
                      {item.product?.warranty && (
                        <p className="text-[10px] text-emerald-600 font-medium">{item.product.warranty}</p>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">{item.quantity}</td>
                    <td className="p-3 text-right font-mono">{formatINR(item.product?.discountedPrice || item.price || 0)}</td>
                    <td className="p-3 text-right font-mono font-bold">
                      {formatINR((item.product?.discountedPrice || item.price || 0) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="text-xs text-slate-500 max-w-sm space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authorized Serialized Indian Importer Warranty</span>
              </div>
              <p className="text-[11px]">
                This is a computer-generated tax invoice with 18% GST input credit breakdown. For manufacturer warranty claims, present this invoice at authorized service centers.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Value (Net):</span>
                <span className="font-mono">{formatINR(netAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Integrated GST (18%):</span>
                <span className="font-mono">{formatINR(gstAmount)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Festive Discount:</span>
                  <span className="font-mono">-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Insured Air Shipping:</span>
                <span className="font-mono">{order.deliveryCharge === 0 ? 'FREE' : formatINR(order.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#783D1B] pt-2 border-t border-slate-300">
                <span>Total Amount:</span>
                <span className="font-mono">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Store Signature & Terms */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-4 text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-700">Terms & Conditions:</p>
              <p className="text-[10px]">1. Goods once sold carry direct manufacturer brand warranty across India.</p>
              <p className="text-[10px]">2. Physical transit damage must be reported within 24 hours of delivery.</p>
            </div>

            <div className="text-right">
              <div className="w-36 h-12 border-b border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                [Authorized Stamp]
              </div>
              <p className="font-bold text-[#783D1B] mt-1">For Computer Galaxy</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
