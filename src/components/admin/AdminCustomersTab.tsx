import React, { useState } from 'react';
import { Search, User, Phone, Mail, MapPin, ShoppingBag, Eye, Calendar } from 'lucide-react';
import { formatINR } from '../../utils/cart';

interface AdminCustomersTabProps {
  customers: any[];
  orders: any[];
  onViewOrder: (order: any) => void;
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({
  customers,
  orders,
  onViewOrder,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.fullName?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  const getCustomerOrders = (phone: string) => {
    return orders.filter((o) => o.customer?.phone?.trim() === phone?.trim());
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#172B4D]">Customer Accounts & Directory</h2>
          <p className="text-xs text-slate-500">
            Real customer database populated automatically from checkout orders and customer inquiries.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Total Customers: <strong>{customers.length}</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 relative">
        <Search className="w-4 h-4 absolute left-7 top-6 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, phone number, email address, or city..."
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#783D1B]"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">City & State</th>
                <th className="p-3.5 text-center">Orders</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5">Last Order</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id || c.phone} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-[#783D1B] font-bold flex items-center justify-center shrink-0 border border-slate-200">
                        {c.fullName ? c.fullName.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{c.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {c.id || 'CUST'}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="font-mono text-slate-800 font-medium block">{c.phone}</span>
                    {c.email && <span className="text-[10px] text-slate-500 block">{c.email}</span>}
                  </td>

                  <td className="p-3.5 text-slate-700">
                    <span>{c.city || '—'}, {c.state || ''}</span>
                    {c.pinCode && <span className="text-[10px] text-slate-400 font-mono block">PIN: {c.pinCode}</span>}
                  </td>

                  <td className="p-3.5 text-center font-bold font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {c.ordersCount || 1}
                    </span>
                  </td>

                  <td className="p-3.5 font-bold font-mono text-[#783D1B]">
                    {formatINR(c.totalSpent || 0)}
                  </td>

                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {c.lastOrderDate || c.createdAt || '—'}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#783D1B] hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-xs">
            No customers found matching the search.
          </div>
        )}
      </div>

      {/* Customer Detail & Orders History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div>
                <h3 className="font-bold text-base text-[#172B4D]">{selectedCustomer.fullName}</h3>
                <p className="text-xs text-slate-500">{selectedCustomer.phone} | {selectedCustomer.email || 'No email'}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700 block">Default Delivery Address:</span>
              <p className="text-slate-600">{selectedCustomer.addressLine || '—'}</p>
              <p className="text-slate-600">{selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.pinCode}</p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-xs text-[#172B4D] block">
                Order History ({getCustomerOrders(selectedCustomer.phone).length} Orders):
              </span>
              
              {getCustomerOrders(selectedCustomer.phone).map((ord) => (
                <div key={ord.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-slate-300">
                  <div>
                    <span className="font-mono font-bold text-slate-900 block">{ord.id}</span>
                    <span className="text-[10px] text-slate-500">{ord.createdAt}</span>
                    <span className="text-[10px] text-[#783D1B] font-semibold block">{ord.items?.length || 1} item(s)</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-bold font-mono text-slate-900 block">{formatINR(ord.total)}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {ord.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}

              {getCustomerOrders(selectedCustomer.phone).length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No order records linked to this phone number.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
