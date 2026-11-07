import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Calendar, Percent, CheckCircle2, X } from 'lucide-react';
import { api } from '../../services/api';

interface AdminSalesTabProps {
  sales: any[];
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminSalesTab: React.FC<AdminSalesTabProps> = ({
  sales,
  onRefresh,
  onShowToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    discountInfo: '',
    description: '',
    couponCode: '',
    bannerImage: '',
    startDate: '',
    endDate: '',
    isActive: true,
    discountPercent: 10,
  });

  const openCreateModal = () => {
    setEditingSale(null);
    setFormData({
      title: '',
      discountInfo: 'Flat ₹500 Off on Custom Rigs',
      description: 'Applicable on all prepaid checkout orders above ₹2,000.',
      couponCode: 'GALAXY500',
      bannerImage: '/src/assets/images/custom_pc_builder_promo_1793788644706.jpg',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      isActive: true,
      discountPercent: 10,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: any) => {
    setEditingSale(s);
    setFormData({
      title: s.title || '',
      discountInfo: s.discountInfo || '',
      description: s.description || '',
      couponCode: s.couponCode || '',
      bannerImage: s.bannerImage || '',
      startDate: s.startDate || '',
      endDate: s.endDate || '',
      isActive: s.isActive !== false,
      discountPercent: s.discountPercent || 10,
    });
    setIsModalOpen(true);
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      onShowToast('Sale title is required', 'error');
      return;
    }

    try {
      if (editingSale) {
        await api.updateSale(editingSale.id, formData);
        onShowToast('Sale campaign updated.');
      } else {
        await api.createSale(formData);
        onShowToast('New promotional campaign created.');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save sale', 'error');
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale offer?')) return;
    try {
      await api.deleteSale(id);
      onShowToast('Sale campaign deleted.');
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete sale', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#172B4D]">Promotional Sales & Coupon Management</h2>
          <p className="text-xs text-slate-500">
            Create discount coupon codes, seasonal hardware sales, and promotional banners.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Sale</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sales.map((s) => (
          <div
            key={s.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-[#783D1B]/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#783D1B] bg-[#783D1B]/10 px-2.5 py-0.5 rounded-lg border border-[#783D1B]/20">
                  CODE: {s.couponCode}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {s.isActive !== false ? 'Active Offer' : 'Expired / Inactive'}
                </span>
              </div>

              <h3 className="font-bold text-base text-[#172B4D] mt-2">{s.title}</h3>
              <p className="text-xs font-semibold text-amber-700 mt-0.5">{s.discountInfo}</p>
              <p className="text-xs text-slate-500 mt-1">{s.description}</p>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-3 pt-3 border-t border-slate-100">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Validity: {s.startDate} to {s.endDate}</span>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(s)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-[#783D1B] hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteSale(s.id)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-sm text-[#172B4D]">
                {editingSale ? 'Edit Sale Offer' : 'Create New Sale'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sale Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Diwali Mega Hardware Sale 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    placeholder="GALAXY500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Info Headline</label>
                  <input
                    type="text"
                    value={formData.discountInfo}
                    onChange={(e) => setFormData({ ...formData, discountInfo: e.target.value })}
                    placeholder="Flat 15% Off or ₹500 Off"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Terms</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Terms of the offer, minimum order value..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Status</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`w-full py-2 px-3 rounded-lg font-bold text-xs cursor-pointer ${
                    formData.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {formData.isActive ? 'Active & Live on Storefront' : 'Inactive (Draft)'}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Save Sale Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
