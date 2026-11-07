import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  FileText,
  Printer,
  Download,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Save,
  X,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { formatINR } from '../../utils/cart';
import { api } from '../../services/api';

interface AdminOrdersTabProps {
  orders: any[];
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  onPrintInvoice: (order: any) => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  onRefresh,
  onShowToast,
  onPrintInvoice,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Order Details / Edit Modal State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState('Pending');
  const [editPaymentStatus, setEditPaymentStatus] = useState('Pending');
  const [editTracking, setEditTracking] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const openOrderModal = (ord: any) => {
    setSelectedOrder(ord);
    setEditStatus(ord.status || 'Pending');
    setEditPaymentStatus(ord.paymentStatus || 'Pending');
    setEditTracking(ord.trackingNumber || '');
    setEditNotes(ord.internalNotes || '');
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      await api.updateOrder(selectedOrder.id, {
        status: editStatus,
        paymentStatus: editPaymentStatus,
        trackingNumber: editTracking,
        internalNotes: editNotes,
      });
      onShowToast(`Order ${selectedOrder.id} status updated to "${editStatus}".`);
      setSelectedOrder(null);
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update order', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Export orders to CSV
  const handleExportCSV = () => {
    if (!orders || orders.length === 0) return;

    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Email', 'City', 'Total Amount', 'Status', 'Payment Status', 'Tracking Number'];
    const rows = orders.map((o) => [
      o.id,
      `"${o.createdAt}"`,
      `"${o.customer?.fullName || ''}"`,
      `"${o.customer?.phone || ''}"`,
      `"${o.customer?.email || ''}"`,
      `"${o.customer?.city || ''}"`,
      o.total,
      o.status || 'Pending',
      o.paymentStatus || 'Paid',
      `"${o.trackingNumber || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Computer_Galaxy_Orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Orders exported to CSV successfully.');
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = o.id?.toLowerCase().includes(q);
      const matchName = o.customer?.fullName?.toLowerCase().includes(q);
      const matchPhone = o.customer?.phone?.includes(q);
      const matchTracking = o.trackingNumber?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchTracking) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#172B4D]">Order Pipeline & Fulfillment</h2>
          <p className="text-xs text-slate-500">
            Real customer orders received from storefront checkout. Manage statuses, tracking numbers, and print GST tax invoices.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#172B4D] text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#783D1B]" />
          <span>Export Orders (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer name, phone, or tracking..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#783D1B]"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-[#172B4D] cursor-pointer"
          >
            <option value="all">All Order Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-[#172B4D] cursor-pointer"
          >
            <option value="all">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5">Order ID & Date</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Destination</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Fulfillment Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <span className="font-mono font-black text-slate-900 block">{ord.id}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{ord.createdAt}</span>
                    {ord.trackingNumber && (
                      <span className="text-[10px] text-slate-500 block font-mono">
                        AWB: {ord.trackingNumber}
                      </span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <span className="font-bold text-slate-800 block">{ord.customer?.fullName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{ord.customer?.phone}</span>
                    {ord.customer?.email && (
                      <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                        {ord.customer.email}
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-slate-600">
                    <span className="font-medium block">{ord.customer?.city || '—'}, {ord.customer?.state || ''}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{ord.customer?.pinCode}</span>
                  </td>

                  <td className="p-3.5 text-slate-700">
                    <span className="font-bold">{ord.items?.length || 1} item(s)</span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                      {ord.items?.[0]?.product?.name || 'PC Hardware'}
                    </span>
                  </td>

                  <td className="p-3.5 font-bold font-mono text-[#783D1B]">
                    {formatINR(ord.total)}
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold block w-fit ${
                        ord.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.paymentStatus === 'Failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.paymentStatus || 'Paid'}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block mt-0.5">
                      {ord.paymentMethod || 'UPI'}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'Shipped'
                          ? 'bg-purple-100 text-purple-800'
                          : ord.status === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'Confirmed'
                          ? 'bg-sky-100 text-sky-800'
                          : ord.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.status || 'Pending'}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => openOrderModal(ord)}
                        title="Manage Order Status & Notes"
                        className="px-2.5 py-1.5 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => onPrintInvoice(ord)}
                        title="Print GST Tax Invoice"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-xs">
            No orders match the selected filters.
          </div>
        )}
      </div>

      {/* Order Status & Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#172B4D]">Order Management</span>
                  <span className="font-mono text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold">
                    {selectedOrder.id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Placed on {selectedOrder.createdAt}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPrintInvoice(selectedOrder)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleUpdateOrder} className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Customer Info Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-[10px] uppercase text-slate-500 block mb-1">Customer Delivery Details</span>
                  <p className="font-bold text-slate-800 text-sm">{selectedOrder.customer?.fullName}</p>
                  <p className="text-slate-600 mt-0.5">{selectedOrder.customer?.addressLine}</p>
                  <p className="text-slate-600">{selectedOrder.customer?.city}, {selectedOrder.customer?.state} - {selectedOrder.customer?.pinCode}</p>
                  <p className="text-slate-700 font-mono mt-1 font-semibold">{selectedOrder.customer?.phone}</p>
                </div>

                <div>
                  <span className="font-bold text-[10px] uppercase text-slate-500 block mb-1">Payment & Invoice</span>
                  <p className="text-slate-700">Payment Mode: <strong className="uppercase">{selectedOrder.paymentMethod}</strong></p>
                  <p className="text-slate-700">GST Invoice: <strong className="font-mono">{selectedOrder.gstInvoiceNumber}</strong></p>
                  <p className="text-base font-extrabold text-[#783D1B] mt-2 font-mono">
                    Total: {formatINR(selectedOrder.total)}
                  </p>
                </div>
              </div>

              {/* Status Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Order Fulfillment Status *</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-[#172B4D] cursor-pointer"
                  >
                    <option value="Pending">Pending Confirmation</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing & Assembly</option>
                    <option value="Shipped">Shipped via Air Courier</option>
                    <option value="Delivered">Delivered Successfully</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Status *</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-[#172B4D] cursor-pointer"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending (COD / Verification)</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Courier Tracking Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Courier AWB Tracking Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Truck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={editTracking}
                    onChange={(e) => setEditTracking(e.target.value)}
                    placeholder="e.g. BD-IN-7890123 (BlueDart Air) / DEL-90210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-[#172B4D]"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Customer will see this tracking number when searching their order on the storefront.
                </p>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Admin Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notes on packaging, customer communication, special courier requests..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Items in this order */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                <span className="font-bold text-slate-700 block mb-2">Order Items:</span>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <p className="font-bold text-slate-800">{item.product?.name || item.name}</p>
                        <p className="text-[10px] text-slate-500">Qty: {item.quantity} × {formatINR(item.product?.discountedPrice || item.price || 0)}</p>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {formatINR((item.product?.discountedPrice || item.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Order Status</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
