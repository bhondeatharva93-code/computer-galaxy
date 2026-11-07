import React, { useState } from 'react';
import {
  X,
  Lock,
  Package,
  ShoppingBag,
  TrendingUp,
  CheckCircle,
  Truck,
  Clock,
  Eye,
  LogOut,
  Edit2,
  Check,
} from 'lucide-react';
import { GuestOrder, Product } from '../types';
import { formatINR } from '../utils/cart';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: GuestOrder[];
  products: Product[];
  onUpdateOrderStatus: (orderId: string, status: GuestOrder['status']) => void;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  orders,
  products,
  onUpdateOrderStatus,
  onUpdateProductPrice,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
      setPassword('');
    } else {
      setAuthError('Invalid Admin credentials. Try "admin123"');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleSavePrice = (productId: string) => {
    const parsed = parseInt(editingPriceValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateProductPrice(productId, parsed);
    }
    setEditingPriceId(null);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-5xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFFFFF] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#172B4D]">
                Computer Galaxy Internal Staff Portal
              </h2>
              <span className="text-[11px] text-[#64748B]">
                Restricted Access · Inventory & Dispatch Control
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5F7FA] hover:bg-[#E5E7EB] text-[#172B4D] flex items-center justify-center transition-colors"
              aria-label="Close admin dashboard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!isAuthenticated ? (
            /* Secure Login Gate */
            <div className="max-w-sm mx-auto py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#172B4D] flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#172B4D]">Admin Authentication</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Enter authorized staff password to view guest orders and stock levels.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3 pt-2">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password (admin123)"
                  className="w-full px-3.5 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#783D1B]"
                />

                {authError && (
                  <p className="text-[11px] text-rose-600 text-left">{authError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#172B4D] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Unlock Staff Dashboard
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Admin Management Interface */
            <div className="space-y-6">
              
              {/* Top Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F5F7FA]">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Total Guest Orders</span>
                    <Package className="w-4 h-4 text-[#783D1B]" />
                  </div>
                  <div className="text-xl font-extrabold text-[#172B4D] mt-2 tabular-nums">
                    {orders.length}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F5F7FA]">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Total Revenue</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-extrabold text-[#172B4D] mt-2 tabular-nums">
                    {formatINR(totalRevenue)}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F5F7FA]">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Catalog Products</span>
                    <ShoppingBag className="w-4 h-4 text-[#FFB020]" />
                  </div>
                  <div className="text-xl font-extrabold text-[#172B4D] mt-2 tabular-nums">
                    {products.length} Items
                  </div>
                </div>
              </div>

              {/* Sub-Tabs: Orders vs Inventory */}
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-[#783D1B] text-white'
                      : 'text-[#64748B] hover:bg-[#F5F7FA]'
                  }`}
                >
                  Guest Orders ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'inventory'
                      ? 'bg-[#783D1B] text-white'
                      : 'text-[#64748B] hover:bg-[#F5F7FA]'
                  }`}
                >
                  Stock & Pricing Management
                </button>
              </div>

              {/* Tab 1: Guest Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#64748B] bg-[#F5F7FA] rounded-xl border border-[#E5E7EB]">
                      No orders placed yet. Place an order via guest checkout to test.
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-3 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F5F7FA]">
                          <div>
                            <span className="text-xs font-extrabold text-[#172B4D]">
                              Order #{order.id}
                            </span>
                            <span className="text-xs text-[#64748B] ml-2">· {order.createdAt}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#64748B]">Status:</span>
                            <select
                              value={order.status}
                              onChange={(e) =>
                                onUpdateOrderStatus(
                                  order.id,
                                  e.target.value as GuestOrder['status']
                                )
                              }
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#E5E7EB] bg-white text-[#172B4D]"
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </div>
                        </div>

                        {/* Customer Delivery Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F5F7FA] p-3 rounded-lg">
                          <div>
                            <span className="text-[#64748B] block font-medium">Customer:</span>
                            <span className="font-bold text-[#172B4D]">{order.customer.fullName}</span>
                            <span className="block text-[#64748B]">+91 {order.customer.phone}</span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block font-medium">Shipping Address:</span>
                            <span className="text-[#172B4D]">
                              {order.customer.addressLine}, {order.customer.city}, {order.customer.state} - {order.customer.pinCode}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#64748B] block font-medium">Payment & Total:</span>
                            <span className="font-bold uppercase text-[#783D1B] block">
                              {order.customer.paymentMethod}
                            </span>
                            <span className="font-extrabold text-sm text-[#172B4D] tabular-nums">
                              {formatINR(order.total)}
                            </span>
                          </div>
                        </div>

                        {/* Items Breakdown */}
                        <div className="text-xs text-[#64748B] divide-y divide-[#F5F7FA]">
                          {order.items.map((item) => (
                            <div key={item.product.id} className="py-1 flex justify-between">
                              <span>
                                {item.quantity}x {item.product.name}
                              </span>
                              <span className="tabular-nums font-semibold text-[#172B4D]">
                                {formatINR(item.product.discountedPrice * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Inventory & Pricing */}
              {activeTab === 'inventory' && (
                <div className="rounded-xl border border-[#E5E7EB] overflow-hidden divide-y divide-[#E5E7EB] text-xs">
                  <div className="bg-[#F5F7FA] p-3 grid grid-cols-12 font-bold text-[#172B4D]">
                    <span className="col-span-6">Product & Brand</span>
                    <span className="col-span-2">Stock</span>
                    <span className="col-span-4 text-right">Price (INR) & Quick Edit</span>
                  </div>

                  {products.map((product) => {
                    const isEditing = editingPriceId === product.id;
                    return (
                      <div
                        key={product.id}
                        className="p-3 grid grid-cols-12 items-center hover:bg-[#F5F7FA]/50 transition-colors"
                      >
                        <div className="col-span-6 flex items-center gap-2 min-w-0 pr-2">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-8 h-8 object-contain rounded border border-[#E5E7EB] bg-white shrink-0"
                          />
                          <div className="truncate">
                            <span className="font-bold text-[#172B4D] block truncate">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-[#64748B]">
                              {product.brand} · SKU: {product.modelNumber}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            {product.stockCount} in stock
                          </span>
                        </div>

                        <div className="col-span-4 text-right flex items-center justify-end gap-2">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={editingPriceValue}
                                onChange={(e) => setEditingPriceValue(e.target.value)}
                                className="w-24 px-2 py-1 text-xs border border-[#783D1B] rounded bg-white text-right font-bold"
                              />
                              <button
                                onClick={() => handleSavePrice(product.id)}
                                className="p-1 bg-[#783D1B] text-white rounded hover:bg-[#5C2E13]"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[#172B4D] tabular-nums">
                                {formatINR(product.discountedPrice)}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingPriceId(product.id);
                                  setEditingPriceValue(product.discountedPrice.toString());
                                }}
                                className="p-1 text-[#64748B] hover:text-[#783D1B] hover:bg-[#F5F7FA] rounded"
                                title="Edit Price"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
