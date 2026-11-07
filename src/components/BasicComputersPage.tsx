import React, { useState } from 'react';
import {
  ArrowLeft,
  Monitor,
  ShieldCheck,
  Truck,
  CheckCircle2,
  MessageCircle,
  FileText,
  Zap,
} from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { PriceBrandFilterSidebar } from './PriceBrandFilterSidebar';

interface BasicComputersPageProps {
  products: Product[];
  onBackToHome: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  wishlist: Product[];
}

export const BasicComputersPage: React.FC<BasicComputersPageProps> = ({
  products,
  onBackToHome,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onSelectProduct,
  wishlist,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'under-25k' | 'under-35k' | 'intel' | 'amd'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc'>('recommended');
  
  // Left Sidebar Price & Brand Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([22900, 72000]);
  const [selectedBrand, setSelectedBrand] = useState<'all' | 'intel' | 'amd'>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedGpu, setSelectedGpu] = useState<string>('all');
  const [selectedMonitor, setSelectedMonitor] = useState<string>('all');
  const [selectedPcType, setSelectedPcType] = useState<string>('all');

  const basicProducts = products.filter((p) => p.category === 'basic-pcs');

  const filtered = basicProducts.filter((p) => {
    // Top quick pills
    if (filterType === 'under-25k' && p.discountedPrice > 25000) return false;
    if (filterType === 'under-35k' && p.discountedPrice > 35000) return false;
    if (filterType === 'intel' && !(p.name.toLowerCase().includes('intel') || p.name.toLowerCase().includes('core'))) return false;
    if (filterType === 'amd' && !(p.name.toLowerCase().includes('amd') || p.name.toLowerCase().includes('ryzen'))) return false;

    // Sidebar Price Slider check (volume increase/decrease)
    if (p.discountedPrice < priceRange[0] || p.discountedPrice > priceRange[1]) return false;

    // Sidebar Brand Filter
    if (selectedBrand === 'intel' && !(p.name.toLowerCase().includes('intel') || p.name.toLowerCase().includes('core'))) {
      return false;
    }
    if (selectedBrand === 'amd' && !(p.name.toLowerCase().includes('amd') || p.name.toLowerCase().includes('ryzen'))) {
      return false;
    }

    // Color
    if (selectedColor === 'white' && !p.name.toLowerCase().includes('white')) return false;

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.discountedPrice - b.discountedPrice;
    if (sortBy === 'price-desc') return b.discountedPrice - a.discountedPrice;
    return b.rating - a.rating;
  });

  return (
    <div className="bg-[#FFFFFF] min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb & Back to Home */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <button
              onClick={onBackToHome}
              className="hover:text-[#783D1B] font-medium transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-[#172B4D] font-semibold">Basic & Office Computers</span>
          </div>

          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F7FA] hover:bg-[#E5E7EB] text-xs font-semibold text-[#172B4D] rounded-lg border border-[#E5E7EB] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Hero Header Card */}
        <div className="bg-gradient-to-r from-sky-50/70 via-[#FFFFFF] to-slate-50 border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-3">
                <Monitor className="w-3.5 h-3.5" />
                <span>Home, Student & Commercial Office Series</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#172B4D] tracking-tight">
                Basic & Office Computers
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed max-w-2xl">
                Pre-configured, quiet and power-efficient desktop computers built for dependable day-to-day productivity. Perfect for schools, colleges, accounting firms, Tally ERP, Zoom conferencing, and corporate offices across India.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-[#172B4D]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Windows 11 Pre-Installed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#783D1B]" />
                  <span>GST Invoice with 18% Input Credit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>3-Year Doorstep Warranty</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#783D1B]">
                Need a Custom Office Setup?
              </span>
              <p className="text-xs text-[#64748B] mt-1 mb-3">
                Ordering for a school, CA firm, or call center? Get corporate volume discounts and customized specifications.
              </p>
              <a
                href="https://wa.me/917014443922?text=Hello%20Computer%20Galaxy,%20I%20need%20a%20quotation%20for%20Basic%20Office%20Computers"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Office Sales: +91 70144 43922</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content Area: Left Sidebar Filter & Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Authentic Filter Sidebar matching Screenshot */}
          <aside className="lg:col-span-3 xl:col-span-3 sticky top-24">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Filter Catalog
              </span>
              {(selectedBrand !== 'all' || priceRange[0] !== 22900 || priceRange[1] !== 72000 || filterType !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('all');
                    setSelectedBrand('all');
                    setPriceRange([22900, 72000]);
                    setSelectedColor('all');
                    setSelectedGpu('all');
                    setSelectedMonitor('all');
                    setSelectedPcType('all');
                  }}
                  className="text-xs font-semibold text-[#783D1B] hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <PriceBrandFilterSidebar
              minLimit={18000}
              maxLimit={80000}
              currentRange={priceRange}
              onChangeRange={setPriceRange}
              selectedBrand={selectedBrand}
              onSelectBrand={setSelectedBrand}
              intelCount={6}
              amdCount={11}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              selectedGpu={selectedGpu}
              onSelectGpu={setSelectedGpu}
              selectedMonitor={selectedMonitor}
              onSelectMonitor={setSelectedMonitor}
              selectedPcType={selectedPcType}
              onSelectPcType={setSelectedPcType}
            />
          </aside>

          {/* Right Column: Toolbar & Product Cards Grid */}
          <div className="lg:col-span-9 xl:col-span-9">
            {/* Filter and Sort Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB] mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#172B4D] mr-1">Quick:</span>
                {[
                  { id: 'all', label: 'All Basic PCs' },
                  { id: 'under-25k', label: 'Under ₹25,000' },
                  { id: 'under-35k', label: 'Under ₹35,000' },
                  { id: 'intel', label: 'Intel Core' },
                  { id: 'amd', label: 'AMD Ryzen' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      filterType === f.id
                        ? 'bg-[#783D1B] text-white shadow-xs'
                        : 'bg-[#F5F7FA] text-[#172B4D] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748B]">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-semibold bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-[#172B4D] focus:outline-none focus:border-[#783D1B] cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Results counter & active indicators */}
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-4">
              <span>Showing <strong>{sorted.length}</strong> matching desktop computers</span>
              <span>
                Active Price: <strong>₹{priceRange[0].toLocaleString('en-IN')} — ₹{priceRange[1].toLocaleString('en-IN')}</strong>
              </span>
            </div>

            {/* Product Cards Grid */}
            {sorted.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sorted.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    onToggleWishlist={onToggleWishlist}
                    onQuickView={onSelectProduct}
                    isWishlisted={wishlist.some((w) => w.id === product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-[#F5F7FA] rounded-2xl border border-[#E5E7EB]">
                <Monitor className="w-10 h-10 text-[#64748B] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-[#172B4D]">No computers found within ₹{priceRange[0].toLocaleString('en-IN')} — ₹{priceRange[1].toLocaleString('en-IN')}</p>
                <p className="text-xs text-[#64748B] mt-1">Try increasing the price slider volume or clearing the brand filter.</p>
                <button
                  onClick={() => {
                    setFilterType('all');
                    setSelectedBrand('all');
                    setPriceRange([18000, 80000]);
                  }}
                  className="mt-4 px-4 py-2 bg-[#783D1B] text-white text-xs font-semibold rounded-lg hover:bg-[#5C2E13] cursor-pointer"
                >
                  Reset Price & Brand Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Commercial Highlights Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 pt-8 border-t border-[#E5E7EB]">
          <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB] flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#783D1B]/10 text-[#783D1B] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172B4D]">Instant 8-Second Fast Boot</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Every system runs on high-speed Gen4 PCIe M.2 NVMe solid-state storage.</p>
            </div>
          </div>

          <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB] flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172B4D]">Pan-India Safe Delivery</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Dispatched with multi-layered shockproof packing and 100% loss insurance.</p>
            </div>
          </div>

          <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB] flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-[#783D1B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172B4D]">3-Year Doorstep Warranty</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Direct replacement for defective parts with zero repair labor charges.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
