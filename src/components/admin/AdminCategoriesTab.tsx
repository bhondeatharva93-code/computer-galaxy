import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Layers, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface AdminCategoriesTabProps {
  categories: any[];
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  categories,
  onRefresh,
  onShowToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    icon: 'Box',
    displayOrder: 1,
    isActive: true,
    image: '',
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      icon: 'Layers',
      displayOrder: categories.length + 1,
      isActive: true,
      image: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'Layers',
      displayOrder: cat.displayOrder || 1,
      isActive: cat.isActive !== false,
      image: cat.image || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData);
        onShowToast(`Category "${formData.name}" updated.`);
      } else {
        await api.createCategory(formData);
        onShowToast(`Category "${formData.name}" created.`);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      onShowToast('Category removed.');
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#172B4D]">Store Categories Management</h2>
          <p className="text-xs text-slate-500">
            Configure product catalog taxonomy, display hierarchy, and category descriptions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-[#783D1B]/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                  Order #{cat.displayOrder}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cat.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.isActive !== false ? 'Active' : 'Disabled'}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#172B4D]">{cat.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description || 'No description provided.'}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-2">ID: {cat.id}</p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(cat)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-[#783D1B] hover:text-white text-slate-700 text-xs font-semibold rounded-md transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-700 text-xs font-semibold rounded-md transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-sm text-[#172B4D]">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Editing PCs, Printers, Laptops"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {!editingCategory && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Custom Category ID (slug)</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="e.g. editing-pcs (auto-generated if empty)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description of this category for customer navigation..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`w-full py-2 px-3 rounded-lg font-bold text-xs cursor-pointer ${
                      formData.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {formData.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
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
                  className="px-5 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
