import React, { useState, useEffect } from 'react';
import {
  Header,
} from './components/Header';
import { ShopByCategory } from './components/ShopByCategory';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomPCBuilderModal } from './components/CustomPCBuilderModal';
import { CartDrawer } from './components/CartDrawer';
import { GuestCheckoutModal } from './components/GuestCheckoutModal';
import { WishlistModal } from './components/WishlistModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { api } from './services/api';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { TopPCSelectorSection } from './components/TopPCSelectorSection';
import { DiwaliBanner } from './components/DiwaliBanner';
import { BasicComputersPage } from './components/BasicComputersPage';
import { GamingComputersPage } from './components/GamingComputersPage';
import { CustomPCPage } from './components/CustomPCPage';
import { Footer } from './components/Footer';
import { PriceBrandFilterSidebar } from './components/PriceBrandFilterSidebar';

export type AppView = 'home' | 'basic-computers' | 'gaming-computers' | 'custom-pc';

import { Product, CartItem, GuestOrder } from './types';
import { PRODUCTS_CATALOG, POPULAR_BRANDS, GOOGLE_REVIEWS } from './data/products';
import { calculateCartTotals } from './utils/cart';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Wrench,
  Headphones,
  Award,
  Star,
  CheckCircle2,
  Cpu,
  Layers,
  Flame,
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cg_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return PRODUCTS_CATALOG;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cg_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cg_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [orders, setOrders] = useState<GuestOrder[]>(() => {
    const saved = localStorage.getItem('cg_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'CG-89210',
        createdAt: '03 Nov 2026, 04:30 PM',
        customer: {
          fullName: 'Aniket Verma',
          phone: '9820198201',
          email: 'aniket.v@gmail.com',
          addressLine: 'B-702, Lodha Park, Senapati Bapat Marg, Lower Parel',
          city: 'Mumbai',
          state: 'Maharashtra',
          pinCode: '400013',
          paymentMethod: 'upi',
        },
        items: [
          {
            product: PRODUCTS_CATALOG[0],
            quantity: 1,
          },
        ],
        subtotal: 249999,
        discount: 35001,
        deliveryCharge: 0,
        total: 249999,
        status: 'Packed',
        trackingNumber: 'BD-IN-7890123',
        gstInvoiceNumber: 'GST-CG26-4491',
      },
    ];
  });

  // Navigation & Filter State
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isPCBuilderOpen, setIsPCBuilderOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [banners, setBanners] = useState<any[]>([]);

  // Live Storefront Data Synchronization
  const fetchStoreData = async () => {
    try {
      const [prodRes, ordRes, banRes] = await Promise.all([
        api.getProducts().catch(() => null),
        api.getOrders().catch(() => null),
        api.getBanners().catch(() => null),
      ]);
      if (prodRes && prodRes.success && Array.isArray(prodRes.products) && prodRes.products.length > 0) {
        setProducts(prodRes.products);
      }
      if (ordRes && ordRes.success && Array.isArray(ordRes.orders) && ordRes.orders.length > 0) {
        setOrders(ordRes.orders);
      }
      if (banRes && banRes.success && Array.isArray(banRes.banners) && banRes.banners.length > 0) {
        setBanners(banRes.banners);
      }
    } catch (e) {
      console.warn('Initial live database sync failed, using cached state:', e);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('cg_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('cg_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('cg_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cg_products', JSON.stringify(products));
  }, [products]);

  // URL query check for staff portal (?admin=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdminOpen(true);
    }
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product, 1);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleRemoveWishlist = (product: Product) => {
    setWishlist((prev) => prev.filter((item) => item.id !== product.id));
  };

  // Admin handlers
  const handleUpdateOrderStatus = (orderId: string, status: GuestOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              discountedPrice: newPrice,
              discountPercent: Math.round(
                ((p.originalPrice - newPrice) / p.originalPrice) * 100
              ),
            }
          : p
      )
    );
  };

  // Left Sidebar Price & Brand Catalog Filters (matching user screenshot)
  const [catalogPriceRange, setCatalogPriceRange] = useState<[number, number]>([18000, 250000]);
  const [catalogBrand, setCatalogBrand] = useState<'all' | 'intel' | 'amd'>('all');
  const [catalogColor, setCatalogColor] = useState<string>('all');
  const [catalogGpu, setCatalogGpu] = useState<string>('all');
  const [catalogMonitor, setCatalogMonitor] = useState<string>('all');
  const [catalogPcType, setCatalogPcType] = useState<string>('all');

  const cartTotals = calculateCartTotals(cartItems);

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice =
      p.discountedPrice >= catalogPriceRange[0] && p.discountedPrice <= catalogPriceRange[1];
    const matchesBrand =
      catalogBrand === 'all' ||
      (catalogBrand === 'intel' && (p.name.toLowerCase().includes('intel') || p.name.toLowerCase().includes('core') || p.brand.toLowerCase().includes('intel'))) ||
      (catalogBrand === 'amd' && (p.name.toLowerCase().includes('amd') || p.name.toLowerCase().includes('ryzen') || p.brand.toLowerCase().includes('amd')));
    return matchesCategory && matchesSearch && matchesPrice && matchesBrand;
  });

  const intelCatalogCount = products.filter((p) =>
    p.name.toLowerCase().includes('intel') || p.name.toLowerCase().includes('core') || p.brand.toLowerCase().includes('intel')
  ).length;
  const amdCatalogCount = products.filter((p) =>
    p.name.toLowerCase().includes('amd') || p.name.toLowerCase().includes('ryzen') || p.brand.toLowerCase().includes('amd')
  ).length;

  const bestsellers = products.filter((p) => p.isBestseller);
  const latestArrivals = products.filter((p) => p.isNewArrival);
  const gamingPCs = products.filter((p) => p.isGamingPC);
  const heroBanner = banners.find((b) => b.id === 'banner-diwali' || b.displayOrder === 1) || banners[0] || null;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#172B4D] flex flex-col font-sans selection:bg-[#783D1B] selection:text-white">
      {/* 3. Clean White Sticky Header */}
      <Header
        cartCount={cartTotals.itemCount}
        cartTotal={cartTotals.total}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim() && currentView !== 'home') {
            setCurrentView('home');
          }
        }}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (cat === 'basic-pcs') {
            navigateTo('basic-computers');
          } else if (cat === 'gaming-pcs') {
            navigateTo('gaming-computers');
          } else {
            setCurrentView('home');
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenPCBuilder={() => navigateTo('custom-pc')}
        onNavigate={navigateTo}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTrackOrder={() => setIsTrackingOpen(true)}
      />

      <main className="flex-1">
        {/* Dedicated Page View: Basic Computers */}
        {currentView === 'basic-computers' && (
          <BasicComputersPage
            products={products}
            onBackToHome={() => navigateTo('home')}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={(p) => setSelectedProduct(p)}
            wishlist={wishlist}
          />
        )}

        {/* Dedicated Page View: Gaming Computers */}
        {currentView === 'gaming-computers' && (
          <GamingComputersPage
            products={products}
            onBackToHome={() => navigateTo('home')}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={(p) => setSelectedProduct(p)}
            wishlist={wishlist}
          />
        )}

        {/* Dedicated Page View: Custom PC Configurator */}
        {currentView === 'custom-pc' && (
          <CustomPCPage
            onBackToHome={() => navigateTo('home')}
            onAddBuildToCart={(customProduct) => {
              handleAddToCart(customProduct, 1);
            }}
          />
        )}

        {/* Home Page View */}
        {currentView === 'home' && (
          <>
            {/* Festive Diwali / Primary Hero Banner */}
            <DiwaliBanner
              banner={heroBanner}
              onExploreDeals={() => {
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenPCBuilder={() => navigateTo('custom-pc')}
              onOpenAdminBannerSettings={() => setIsAdminOpen(true)}
            />

            {/* Top PC Selector Section: Basic Computer, Gaming Computer, Custom PC */}
            <TopPCSelectorSection
              onNavigate={navigateTo}
            />

        {/* 4. Shop by Category Section */}
        <ShopByCategory
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Catalog Section with Category Filter or Search Output */}
        <section id="catalog-section" className="py-10 bg-[#FFFFFF] border-t border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#783D1B] bg-[#783D1B]/10 px-2.5 py-0.5 rounded">
                    Hardware Catalog
                  </span>
                  <span className="text-xs text-[#64748B]">
                    {filteredProducts.length} items available
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight mt-1">
                  {selectedCategory === 'all'
                    ? searchQuery
                      ? `Search Results for "${searchQuery}"`
                      : 'Featured PC Hardware & Gaming Rigs'
                    : `Category: ${products.find((p) => p.category === selectedCategory)?.categoryLabel || selectedCategory}`}
                </h2>
              </div>

              {/* Reset filter button */}
              {(selectedCategory !== 'all' || searchQuery || catalogBrand !== 'all' || catalogPriceRange[0] !== 18000 || catalogPriceRange[1] !== 250000) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setCatalogBrand('all');
                    setCatalogPriceRange([18000, 250000]);
                    setCatalogColor('all');
                    setCatalogGpu('all');
                    setCatalogMonitor('all');
                    setCatalogPcType('all');
                  }}
                  className="text-xs font-semibold text-[#783D1B] hover:underline self-start sm:self-auto cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* Main Content Area: Left Sidebar Filter & Product Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Authentic Filter Sidebar matching Screenshot */}
              <aside className="lg:col-span-3 sticky top-24 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="mb-3 flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Filter Catalog
                  </span>
                  {(catalogBrand !== 'all' || catalogPriceRange[0] !== 18000 || catalogPriceRange[1] !== 250000) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogBrand('all');
                        setCatalogPriceRange([18000, 250000]);
                        setCatalogColor('all');
                        setCatalogGpu('all');
                        setCatalogMonitor('all');
                        setCatalogPcType('all');
                      }}
                      className="text-xs font-semibold text-[#783D1B] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <PriceBrandFilterSidebar
                  minLimit={15000}
                  maxLimit={280000}
                  currentRange={catalogPriceRange}
                  onChangeRange={setCatalogPriceRange}
                  selectedBrand={catalogBrand}
                  onSelectBrand={setCatalogBrand}
                  intelCount={intelCatalogCount}
                  amdCount={amdCatalogCount}
                  selectedColor={catalogColor}
                  onSelectColor={setCatalogColor}
                  selectedGpu={catalogGpu}
                  onSelectGpu={setCatalogGpu}
                  selectedMonitor={catalogMonitor}
                  onSelectMonitor={setCatalogMonitor}
                  selectedPcType={catalogPcType}
                  onSelectPcType={setCatalogPcType}
                />
              </aside>

              {/* Right Column: Product Cards Grid */}
              <div className="lg:col-span-9">
                {filteredProducts.length === 0 ? (
                  <div className="py-16 text-center bg-[#F5F7FA] rounded-2xl border border-[#E5E7EB] space-y-3">
                    <p className="text-sm font-bold text-[#172B4D]">
                      No components match your search or filter criteria.
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Try adjusting the price level slider or choosing all brands.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                        setCatalogBrand('all');
                        setCatalogPriceRange([18000, 250000]);
                      }}
                      className="px-4 py-2 bg-[#783D1B] text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Show All Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={wishlist.some((w) => w.id === product.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={(p) => handleAddToCart(p, 1)}
                        onBuyNow={handleBuyNow}
                        onQuickView={(p) => setSelectedProduct(p)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Custom PC Build Promotional Section */}
        <section id="custom-builder" className="py-14 bg-[#F5F7FA] border-y border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-6 sm:p-10 shadow-xs">
              
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#783D1B] bg-[#783D1B]/10 px-3 py-1 rounded-md">
                    Custom PC Assembly Studio
                  </span>
                  <span className="text-xs text-[#64748B] font-medium">
                    · 0% Assembly Surcharge
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#172B4D] tracking-tight leading-tight">
                  Design Your Dream Custom PC with Real-Time Compatibility Engine
                </h2>

                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Our interactive PC Builder lets you configure Intel Core 14th Gen or AMD Ryzen 7000 rigs with instant socket validation, RAM matching, and power wattage calculations. Built with premium thermal paste, clean wire routing, and 24-hour stress testing before dispatch.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB]">
                    <span className="font-bold text-[#172B4D] block">Socket Validation</span>
                    <span className="text-[#64748B] text-[11px]">LGA1700 & AM5</span>
                  </div>
                  <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB]">
                    <span className="font-bold text-[#172B4D] block">Wattage Check</span>
                    <span className="text-[#64748B] text-[11px]">Real-time PSU Headroom</span>
                  </div>
                  <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB]">
                    <span className="font-bold text-[#172B4D] block">Doorstep Warranty</span>
                    <span className="text-[#64748B] text-[11px]">3-Year Full Coverage</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsPCBuilderOpen(true)}
                    className="px-6 py-3 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Launch Custom PC Builder</span>
                  </button>

                  <a
                    href="https://wa.me/917014443922?text=Hello%20Computer%20Galaxy,%20I%20want%20to%20consult%20an%20engineer%20for%20a%20custom%20PC%20build"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-[#FFFFFF] hover:bg-[#F5F7FA] border border-[#E5E7EB] text-[#172B4D] text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <span>Consult on WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5">
                <img
                  src="/src/assets/images/custom_pc_builder_promo_1793788644706.jpg"
                  alt="Custom PC assembly workshop"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 object-cover rounded-xl border border-[#E5E7EB] shadow-sm"
                />
              </div>

            </div>
          </div>
        </section>

        {/* 4. Gaming PC Collection */}
        <section id="gaming-pcs" className="py-12 bg-[#FFFFFF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#783D1B] uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-[#FFB020]" />
                  <span>Pre-Configured & Battle-Ready</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight mt-0.5">
                  Gaming PC Collection
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B]">
                  Hand-crafted plug & play rigs with Windows 11 pre-installed and 3-Year Onsite Warranty
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory('gaming-pcs');
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#783D1B] hover:underline"
              >
                View All Rigs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gamingPCs.map((pc) => (
                <ProductCard
                  key={pc.id}
                  product={pc}
                  isWishlisted={wishlist.some((w) => w.id === pc.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onBuyNow={handleBuyNow}
                  onQuickView={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. Bestselling Products */}
        <section className="py-12 bg-[#F5F7FA] border-t border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#783D1B] uppercase tracking-wider">
                  <Award className="w-4 h-4 text-[#783D1B]" />
                  <span>Top Rated by Indian Gamers</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight mt-0.5">
                  Bestselling Hardware & Components
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {bestsellers.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlist.some((w) => w.id === product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onBuyNow={handleBuyNow}
                  onQuickView={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. Popular Brands Section */}
        <section className="py-10 bg-[#FFFFFF] border-t border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Official Brand Partners in India
              </h2>
              <p className="text-base sm:text-lg font-bold text-[#172B4D] mt-1">
                100% Genuine Retail Stock with Direct Brand Warranty
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {POPULAR_BRANDS.map((brand) => (
                <div
                  key={brand.name}
                  className="p-4 bg-[#FFFFFF] hover:bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center text-center transition-all group"
                >
                  <span className="text-sm font-extrabold text-[#172B4D] group-hover:text-[#783D1B] transition-colors">
                    {brand.logoText}
                  </span>
                  <span className="text-[10px] text-[#64748B] mt-0.5 font-medium">
                    {brand.specialty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Why Choose Computer Galaxy? */}
        <section id="why-choose-us" className="py-14 bg-[#F5F7FA] border-t border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#783D1B] bg-[#783D1B]/10 px-3 py-1 rounded-md">
                The Computer Galaxy Promise
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight mt-2">
                Why 50,000+ Gamers & Creators Choose Us
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                We bridge the gap between street-market pricing and corporate warranty standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#783D1B]/10 text-[#783D1B] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-base font-bold text-[#172B4D]">
                  Official Indian Warranty & GST
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Every GPU, processor, and component carries serialized authorized importer stickers (Rashi Peripherals, Acro, Supertron, Kaizen) and an official GST invoice for hassle-free manufacturer claims.
                </p>
              </div>

              <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Truck className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-base font-bold text-[#172B4D]">
                  Heavy-Duty Packaging & Transit Insurance
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Custom rigs are secured internally with Instapak expanding foam, wrapped in double-corrugated cartons, and dispatched via BlueDart Air with 100% loss/damage insurance.
                </p>
              </div>

              <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#FFB020] flex items-center justify-center">
                  <Headphones className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-base font-bold text-[#172B4D]">
                  Free Lifetime Tech Support via WhatsApp
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Need BIOS update assistance, XMP profiling advice, or driver installation help? Our senior PC hardware engineers are reachable directly over WhatsApp and voice calls.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Google Reviews Section */}
        <section id="google-reviews" className="py-14 bg-[#FFFFFF] border-t border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center text-[#FFB020]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FFB020]" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#172B4D]">4.9 out of 5 Stars</span>
                  <span className="text-xs text-[#64748B]">· 3,240+ Verified Reviews</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
                  Google Customer Reviews
                </h2>
              </div>

              <div className="text-xs text-[#64748B]">
                <span className="font-semibold text-emerald-600">Google Verified Merchant</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {GOOGLE_REVIEWS.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-[#FFB020]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#FFB020]" />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#64748B]">{rev.date}</span>
                    </div>

                    <h3 className="text-xs font-bold text-[#172B4D] leading-snug">
                      &ldquo;{rev.title}&rdquo;
                    </h3>

                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>

                  <div className="pt-3 mt-4 border-t border-[#F5F7FA]">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#172B4D] block">
                          {rev.name}
                        </span>
                        <span className="text-[10px] text-[#64748B]">{rev.city}</span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        </>
      )}

      </main>

      {/* Footer with Store info, Pan-India courier badges, and discreet Staff Portal */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTrackOrder={() => setIsTrackingOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (cat === 'basic-pcs') {
            navigateTo('basic-computers');
          } else if (cat === 'gaming-pcs') {
            navigateTo('gaming-computers');
          } else {
            setCurrentView('home');
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenPCBuilder={() => navigateTo('custom-pc')}
        onNavigate={navigateTo}
      />

      {/* Floating WhatsApp Quick Action Button */}
      <WhatsAppFloatingButton />

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <GuestCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderPlaced={(order) => {
          setOrders((prev) => [order, ...prev]);
        }}
        onClearCart={handleClearCart}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveWishlist={handleRemoveWishlist}
        onAddToCart={(p) => handleAddToCart(p, 1)}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isWishlisted={Boolean(selectedProduct && wishlist.some((w) => w.id === selectedProduct.id))}
        onToggleWishlist={handleToggleWishlist}
      />

      <CustomPCBuilderModal
        isOpen={isPCBuilderOpen}
        onClose={() => setIsPCBuilderOpen(false)}
        onAddBuildToCart={(customProduct) => {
          handleAddToCart(customProduct, 1);
        }}
      />

      {/* Live Synchronized Admin Portal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onStoreDataChanged={fetchStoreData}
      />

      {/* Customer Consignment & Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />
    </div>
  );
}
