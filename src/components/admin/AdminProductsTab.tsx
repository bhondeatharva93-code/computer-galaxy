import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  Image as ImageIcon,
  Save,
  Loader2,
  Tag,
  Star,
  Flame,
} from 'lucide-react';
import { formatINR } from '../../utils/cart';
import { api } from '../../services/api';

interface AdminProductsTabProps {
  products: any[];
  categories: any[];
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  categories,
  onRefresh,
  onShowToast,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'gaming-pcs',
    categoryLabel: 'Gaming Desktop PCs',
    originalPrice: 0,
    discountedPrice: 0,
    stockCount: 10,
    inStock: true,
    image: '',
    description: '',
    warranty: '3 Years Official Brand Warranty',
    modelNumber: '',
    isBestseller: false,
    isNewArrival: false,
    isGamingPC: false,
    specs: {} as Record<string, string>,
  });

  // Key-value spec row in editor
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: 'Computer Galaxy',
      category: categories[0]?.id || 'gaming-pcs',
      categoryLabel: categories[0]?.name || 'Gaming Desktop PCs',
      originalPrice: 45000,
      discountedPrice: 39999,
      stockCount: 10,
      inStock: true,
      image: '/src/assets/images/hero_gaming_pc_setup_1793788644736.jpg',
      description: '',
      warranty: '3 Years Doorstep Hardware Warranty & Lifetime Tech Support',
      modelNumber: 'CG-' + Math.floor(1000 + Math.random() * 9000),
      isBestseller: false,
      isNewArrival: true,
      isGamingPC: false,
      specs: {
        'Processor': 'Intel Core i5 / AMD Ryzen 5',
        'RAM': '16GB DDR4/DDR5',
        'Storage': '512GB M.2 NVMe SSD',
      },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      brand: p.brand || 'Computer Galaxy',
      category: p.category || 'gaming-pcs',
      categoryLabel: p.categoryLabel || p.category,
      originalPrice: p.originalPrice || p.discountedPrice || 0,
      discountedPrice: p.discountedPrice || 0,
      stockCount: p.stockCount !== undefined ? p.stockCount : 10,
      inStock: p.inStock !== false,
      image: p.image || '',
      description: p.description || '',
      warranty: p.warranty || '3 Years Official Warranty',
      modelNumber: p.modelNumber || '',
      isBestseller: Boolean(p.isBestseller),
      isNewArrival: Boolean(p.isNewArrival),
      isGamingPC: Boolean(p.isGamingPC),
      specs: p.specs ? { ...p.specs } : {},
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadMedia(base64, file.name, file.type);
        if (res.success && res.url) {
          setFormData((prev) => ({ ...prev, image: res.url }));
          onShowToast('Photograph uploaded and saved permanently to server storage.');
        }
      } catch (err: any) {
        onShowToast(err.message || 'Image upload failed', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setFormData((prev) => ({
      ...prev,
      specs: {
        ...prev.specs,
        [newSpecKey.trim()]: newSpecVal.trim(),
      },
    }));
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveSpec = (key: string) => {
    setFormData((prev) => {
      const copy = { ...prev.specs };
      delete copy[key];
      return { ...prev, specs: copy };
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onShowToast('Product name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCatObj = categories.find((c) => c.id === formData.category);
      const payload = {
        ...formData,
        categoryLabel: selectedCatObj ? selectedCatObj.name : formData.category,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        onShowToast(`Product "${formData.name}" updated successfully.`);
      } else {
        await api.createProduct(payload);
        onShowToast(`New product "${formData.name}" published to live website.`);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      onShowToast('Product removed from live storefront.');
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCat !== 'all' && p.category !== selectedCat) return false;
    if (stockFilter === 'in_stock' && (!p.inStock || p.stockCount <= 0)) return false;
    if (stockFilter === 'out_of_stock' && p.inStock && p.stockCount > 0) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchBrand = p.brand?.toLowerCase().includes(q);
      const matchModel = p.modelNumber?.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchModel) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#172B4D]">Product Inventory Management</h2>
          <p className="text-xs text-slate-500">
            Create, edit prices, upload photographs, and manage live stock across all {products.length} catalog items.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, brand or model number..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#783D1B]"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#783D1B] cursor-pointer"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#783D1B] cursor-pointer"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3.5">Product & Photo</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Brand</th>
                <th className="p-3.5">Selling Price</th>
                <th className="p-3.5">MRP</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isOutOfStock = !p.inStock || (p.stockCount !== undefined && p.stockCount <= 0);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || '/src/assets/images/hero_gaming_pc_setup_1793788644736.jpg'}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                        />
                        <div className="max-w-xs">
                          <p className="font-bold text-slate-800 line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {p.modelNumber || p.id}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {p.isBestseller && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                BESTSELLER
                              </span>
                            )}
                            {p.isGamingPC && (
                              <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">
                                GAMING RIG
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-700 font-medium">
                      {p.categoryLabel || p.category}
                    </td>

                    <td className="p-3.5 font-bold text-slate-700">
                      {p.brand || 'Computer Galaxy'}
                    </td>

                    <td className="p-3.5 font-bold font-mono text-[#783D1B]">
                      {formatINR(p.discountedPrice)}
                    </td>

                    <td className="p-3.5 font-mono text-slate-400 line-through">
                      {p.originalPrice ? formatINR(p.originalPrice) : '—'}
                    </td>

                    <td className="p-3.5">
                      <span className={`font-mono font-bold ${isOutOfStock ? 'text-red-600' : 'text-slate-800'}`}>
                        {p.stockCount ?? 10} units
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          !isOutOfStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {!isOutOfStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Product"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#783D1B] hover:text-white text-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          title="Delete Product"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white text-slate-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-xs">
            No products match the selected filters.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Product?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This item will be permanently removed from the storefront and customer catalog.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-[#172B4D]">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Changes save directly to the database and update the live storefront.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Product Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8">
                  <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Galaxy SuperNova RTX 4080 Super Gaming PC"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#172B4D] focus:ring-1 focus:ring-[#783D1B]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-bold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="ASUS, Intel, Computer Galaxy..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#172B4D] focus:ring-1 focus:ring-[#783D1B]"
                  />
                </div>
              </div>

              {/* Category & Model Number */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7">
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#172B4D] cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-5">
                  <label className="block font-bold text-slate-700 mb-1">Model / SKU Number</label>
                  <input
                    type="text"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                    placeholder="CG-4080-SN"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#172B4D]"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountedPrice}
                    onChange={(e) => setFormData({ ...formData, discountedPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-[#783D1B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockCount}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      setFormData({ ...formData, stockCount: count, inStock: count > 0 });
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Availability</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, inStock: !formData.inStock })}
                    className={`w-full py-2 px-3 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                      formData.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {formData.inStock ? 'In Stock' : 'Out of Stock'}
                  </button>
                </div>
              </div>

              {/* Product Photograph Upload & Preview */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Photograph</label>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.image || '/src/assets/images/hero_gaming_pc_setup_1793788644736.jpg'}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-300 bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Photo URL or upload below"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#783D1B]" />
                      <span>Upload & Replace Photo (Saved Permanently)</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Description & Warranty */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed component breakdown, performance highlights, bench tests..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#172B4D]"
                />
              </div>

              {/* Key Specifications (Specs) Editor */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Hardware Specifications:</span>
                
                {/* Existing specs pills */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(formData.specs).map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded-lg text-[11px]"
                    >
                      <strong className="text-slate-700">{k}:</strong> {v}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(k)}
                        className="text-red-500 hover:text-red-700 ml-1 font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new spec row */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="Spec Key (e.g. GPU, Cooler)"
                    className="w-1/3 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={newSpecVal}
                    onChange={(e) => setNewSpecVal(e.target.value)}
                    placeholder="Spec Value (e.g. RTX 4080 Super)"
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3 py-1.5 bg-[#783D1B] text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Badges and Flags */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="rounded text-[#783D1B] focus:ring-[#783D1B]"
                  />
                  <span className="font-semibold text-slate-700">Mark as Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="rounded text-[#783D1B] focus:ring-[#783D1B]"
                  />
                  <span className="font-semibold text-slate-700">Mark as New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isGamingPC}
                    onChange={(e) => setFormData({ ...formData, isGamingPC: e.target.checked })}
                    className="rounded text-[#783D1B] focus:ring-[#783D1B]"
                  />
                  <span className="font-semibold text-slate-700">Display in Gaming PC Rigs</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save & Publish Live</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
