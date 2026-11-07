import React from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  ArrowUpRight,
  Plus,
  Eye,
  Calendar,
} from 'lucide-react';
import { formatINR } from '../../utils/cart';

interface AdminDashboardTabProps {
  stats: any;
  recentOrders: any[];
  recentProducts: any[];
  onNavigateTab: (tab: string) => void;
  onViewOrder: (order: any) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  stats,
  recentOrders,
  recentProducts,
  onNavigateTab,
  onViewOrder,
}) => {
  const totalOrders = stats?.totalOrders || 0;
  const todayOrders = stats?.todayOrders || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const totalProducts = stats?.totalProducts || 0;
  const outOfStockProducts = stats?.outOfStockProducts || 0;
  const totalCustomers = stats?.totalCustomers || 0;

  const pending = stats?.pendingOrders || 0;
  const processing = stats?.processingOrders || 0;
  const shipped = stats?.shippedOrders || 0;
  const delivered = stats?.deliveredOrders || 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome Bar */}
      <div className="bg-gradient-to-r from-[#783D1B] to-[#5C2E13] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-black/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
            Storefront Command Center
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">Computer Galaxy Store Overview</h2>
          <p className="text-xs text-amber-100/90 mt-1 max-w-xl">
            Live operations dashboard. All catalog edits, inventory adjustments, and banner updates synchronize immediately with the storefront.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2.5 bg-white text-[#783D1B] hover:bg-amber-50 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2.5 bg-black/25 hover:bg-black/35 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Manage Orders ({totalOrders})</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Sales</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#783D1B] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#172B4D] mt-3 font-mono">
            {formatINR(totalRevenue)}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Real-time Storefront Gross Volume</span>
          </div>
        </div>

        {/* Total Orders & Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <h3 className="text-2xl font-black text-[#172B4D] font-mono">{totalOrders}</h3>
            {todayOrders > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                +{todayOrders} today
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {pending} pending confirmation
          </p>
        </div>

        {/* Products in Catalog */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Catalog</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#172B4D] mt-3 font-mono">{totalProducts}</h3>
          <div className="flex items-center gap-1 text-[11px] mt-1">
            {outOfStockProducts > 0 ? (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {outOfStockProducts} out of stock
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">All items in stock</span>
            )}
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Customers</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#172B4D] mt-3 font-mono">{totalCustomers}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Pan-India registered buyers</p>
        </div>

      </div>

      {/* Order Status Funnel & Activity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Order Status Distribution Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <h3 className="text-sm font-bold text-[#172B4D]">Order Status Breakdown</h3>
            <span className="text-[11px] font-mono text-slate-500">{totalOrders} Orders</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Pending', count: pending, color: 'bg-amber-500', text: 'text-amber-700' },
              { label: 'Processing', count: processing, color: 'bg-blue-500', text: 'text-blue-700' },
              { label: 'Shipped', count: shipped, color: 'bg-purple-500', text: 'text-purple-700' },
              { label: 'Delivered', count: delivered, color: 'bg-emerald-500', text: 'text-emerald-700' },
            ].map((st) => {
              const percent = totalOrders > 0 ? Math.round((st.count / totalOrders) * 100) : 0;
              return (
                <div key={st.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{st.label}</span>
                    <span className="font-mono text-slate-500">{st.count} ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${st.color} rounded-full transition-all`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('orders')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[#172B4D] text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Full Orders Pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#172B4D]">Recent Customer Orders</h3>
              <p className="text-[11px] text-slate-500">Live order queue from website checkout</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#783D1B] hover:underline cursor-pointer"
            >
              View All ({totalOrders})
            </button>
          </div>

          {recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Items</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-800">{ord.id}</td>
                      <td className="py-3">
                        <span className="font-semibold block text-slate-800">{ord.customer?.fullName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{ord.customer?.phone}</span>
                      </td>
                      <td className="py-3 text-slate-600 font-medium">
                        {ord.items?.length || 1} item(s)
                      </td>
                      <td className="py-3 font-mono font-bold text-[#783D1B]">
                        {formatINR(ord.total)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'Shipped'
                              ? 'bg-purple-100 text-purple-800'
                              : ord.status === 'Processing'
                              ? 'bg-blue-100 text-blue-800'
                              : ord.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onViewOrder(ord)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#783D1B] hover:text-white text-slate-700 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No orders placed yet. Orders will appear here in real-time when placed on the storefront.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
