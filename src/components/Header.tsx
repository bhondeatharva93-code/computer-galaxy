import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Cpu,
  MessageCircle,
  Truck,
  ShieldCheck,
  ChevronRight,
  X,
  Menu,
  Lock,
} from 'lucide-react';
import { Product } from '../types';
import { formatINR } from '../utils/cart';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCategory: (category: string) => void;
  onOpenPCBuilder: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate?: (view: 'home' | 'basic-computers' | 'gaming-computers' | 'custom-pc') => void;
  onOpenAdmin?: () => void;
  onOpenTrackOrder?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onOpenPCBuilder,
  products,
  onSelectProduct,
  onNavigate,
  onOpenAdmin,
  onOpenTrackOrder,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Filter search preview items
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <>
      {/* Top Promotional Bar */}
      <div className="bg-[#F5F7FA] border-b border-[#E5E7EB] text-xs text-[#64748B] py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-[#172B4D]">
              <Truck className="w-3.5 h-3.5 text-[#783D1B]" />
              Free Insured Shipping on orders over ₹2,000 across India
            </span>
            <span className="text-[#E5E7EB]">|</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Genuine Products with Official Brand Warranty
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            {onOpenTrackOrder && (
              <button
                onClick={onOpenTrackOrder}
                className="flex items-center gap-1 hover:text-[#783D1B] font-medium transition-colors"
                title="Track order shipment"
              >
                <Truck className="w-3.5 h-3.5 text-[#783D1B]" />
                <span>Track Order</span>
              </button>
            )}
            <span className="text-[#E5E7EB]">|</span>
            <a
              href="https://wa.me/917014443922?text=Hello%20Computer%20Galaxy,%20I%20need%20help%20with%20a%20PC%20build"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#783D1B] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp: +91 70144 43922</span>
            </a>
            {onOpenAdmin && (
              <>
                <span className="text-[#E5E7EB]">|</span>
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1 text-[#783D1B] hover:text-[#5C2E13] font-bold transition-colors bg-[#783D1B]/10 hover:bg-[#783D1B]/15 px-2 py-0.5 rounded"
                  title="Open Admin Control Panel"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Panel</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Sticky White Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4 lg:gap-8">
            
            {/* Logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) {
                  onNavigate('home');
                } else {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }
              }}
              className="flex items-center shrink-0 group py-1"
              aria-label="Computer Galaxy Home"
            >
              <img
                src="/assets/aistudio/Gemini_Generated_Image_i5kb71i5kb71i5kb_16c6252e.png"
                alt="Computer Galaxy"
                className="h-9 sm:h-10.5 w-auto max-w-[220px] sm:max-w-[260px] object-contain rounded-lg shadow-sm border border-[#783D1B]/15 bg-[#783D1B] group-hover:opacity-95 transition-opacity"
              />
            </a>

            {/* Large Product Search Bar with Live Suggestions */}
            <div className="flex-1 max-w-2xl relative hidden md:block">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="Search processors, RTX 40-series GPUs, DDR5 RAM, gaming rigs..."
                  className="w-full bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg pl-11 pr-10 py-2.5 text-sm text-[#172B4D] placeholder-[#64748B] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#783D1B] focus:ring-2 focus:ring-[#783D1B]/15 transition-all"
                  aria-label="Search products"
                />
                <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      onSearchChange('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-3 text-[#64748B] hover:text-[#172B4D]"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Instant Search Dropdown */}
              {showSearchResults && searchQuery.trim().length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full mt-1.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-lg p-2 z-50 max-h-96 overflow-y-auto"
                  onMouseLeave={() => setShowSearchResults(false)}
                >
                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-[#E5E7EB]">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                        Matching Hardware ({searchResults.length})
                      </div>
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            onSelectProduct(product);
                            setShowSearchResults(false);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-[#F5F7FA] rounded-lg flex items-center gap-3 transition-colors group"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-contain rounded bg-[#F5F7FA] border border-[#E5E7EB] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#172B4D] truncate group-hover:text-[#783D1B]">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-[#64748B]">
                              {product.brand} · {product.categoryLabel}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-[#172B4D] tabular-nums">
                              {formatINR(product.discountedPrice)}
                            </span>
                            <span className="block text-[10px] text-[#FFB020] font-semibold">
                              {product.discountPercent}% OFF
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-[#64748B]">
                      No products found matching &ldquo;{searchQuery}&rdquo;. Try searching &ldquo;RTX&rdquo;, &ldquo;Ryzen&rdquo;, or &ldquo;RAM&rdquo;.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions (Wishlist, Cart, PC Builder CTA) - STRICTLY NO LOGIN/ACCOUNT */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* PC Builder Button */}
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('custom-pc');
                  } else {
                    onOpenPCBuilder();
                  }
                }}
                className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#783D1B] bg-[#783D1B]/10 hover:bg-[#783D1B]/15 rounded-lg border border-[#783D1B]/20 transition-all cursor-pointer"
                aria-label="Launch Custom PC Builder"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>PC Builder Tool</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={onOpenWishlist}
                className="relative p-2.5 text-[#172B4D] hover:text-[#783D1B] hover:bg-[#F5F7FA] rounded-lg transition-colors"
                aria-label={`Wishlist with ${wishlistCount} items`}
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FFB020] text-[#172B4D] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FFFFFF] tabular-nums">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Shopping Cart Button */}
              <button
                onClick={onOpenCart}
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 bg-[#783D1B] text-white hover:bg-[#5C2E13] rounded-lg shadow-sm transition-all group"
                aria-label={`Shopping cart with ${cartCount} items, total ${formatINR(cartTotal)}`}
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#FFB020] text-[#172B4D] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white tabular-nums">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-[10px] font-medium text-white/80">My Cart</span>
                  <span className="text-xs font-bold tabular-nums">
                    {formatINR(cartTotal)}
                  </span>
                </div>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#172B4D] hover:bg-[#F5F7FA] rounded-lg lg:hidden"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="pb-3 md:hidden">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products, GPUs, CPUs..."
                className="w-full bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg pl-9 pr-8 py-2 text-xs text-[#172B4D] placeholder-[#64748B] focus:outline-none focus:border-[#783D1B]"
              />
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 text-[#64748B]"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clean Secondary Navigation Bar */}
        <div className="border-t border-[#E5E7EB] bg-[#FFFFFF] hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between text-xs font-medium text-[#172B4D] py-2.5">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                    onSelectCategory('all');
                  }}
                  className="hover:text-[#783D1B] transition-colors font-semibold cursor-pointer"
                >
                  All Products
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('basic-computers');
                    else onSelectCategory('basic-pcs');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  Basic Computers
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('gaming-computers');
                    else onSelectCategory('gaming-pcs');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  Gaming Desktop PCs
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                    onSelectCategory('graphics-cards');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  Graphics Cards
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                    onSelectCategory('processors');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  Processors (CPUs)
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                    onSelectCategory('motherboards');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  Motherboards
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                    onSelectCategory('ram-memory');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  RAM & Storage
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                    onSelectCategory('monitors');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  Monitors
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('custom-pc');
                    } else {
                      onOpenPCBuilder();
                    }
                  }}
                  className="hover:text-[#783D1B] transition-colors font-semibold text-[#783D1B] cursor-pointer"
                >
                  Custom PC Builder
                </button>
              </div>

              <div className="flex items-center gap-4 text-[#64748B]">
                <a href="#why-choose-us" className="hover:text-[#172B4D] transition-colors">
                  Why Choose Us
                </a>
                <span>·</span>
                <a href="#google-reviews" className="hover:text-[#172B4D] transition-colors">
                  Customer Reviews
                </a>
                <span>·</span>
                <a href="#store-location" className="hover:text-[#172B4D] transition-colors">
                  Store & Contact
                </a>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Flyout Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FFFFFF] border-t border-[#E5E7EB] px-4 py-4 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-medium text-[#172B4D]">
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('home');
                  onSelectCategory('all');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-1.5 hover:text-[#783D1B]"
              >
                All Products
              </button>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('basic-computers');
                  else onSelectCategory('basic-pcs');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-1.5 hover:text-[#783D1B]"
              >
                Basic Computers
              </button>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('gaming-computers');
                  else onSelectCategory('gaming-pcs');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-1.5 hover:text-[#783D1B]"
              >
                Gaming Desktop PCs
              </button>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('home');
                  onSelectCategory('graphics-cards');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-1.5 hover:text-[#783D1B]"
              >
                Graphics Cards
              </button>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('home');
                  onSelectCategory('processors');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-1.5 hover:text-[#783D1B]"
              >
                Processors
              </button>
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('custom-pc');
                  } else {
                    onOpenPCBuilder();
                  }
                  setMobileMenuOpen(false);
                }}
                className="text-left py-1.5 text-[#783D1B] font-semibold flex items-center justify-between"
              >
                <span>Custom PC Builder Tool</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <a
                href="#store-location"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left py-1.5 hover:text-[#783D1B]"
              >
                Store Location & Contact
              </a>

              <div className="pt-2 border-t border-[#E5E7EB] flex flex-col gap-2">
                {onOpenTrackOrder && (
                  <button
                    onClick={() => {
                      onOpenTrackOrder();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-[#172B4D] rounded-lg text-xs font-bold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#783D1B]" />
                      Track Consignment / Order
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                {onOpenAdmin && (
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 bg-[#783D1B]/10 hover:bg-[#783D1B]/20 text-[#783D1B] rounded-lg text-xs font-bold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Staff Admin Control Panel
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#783D1B]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
