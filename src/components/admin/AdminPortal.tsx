import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  Tag,
  Globe,
  UploadCloud,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Shield,
  Cpu,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminLogin } from './AdminLogin';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminCustomersTab } from './AdminCustomersTab';
import { AdminBannersTab } from './AdminBannersTab';
import { AdminSalesTab } from './AdminSalesTab';
import { AdminContentTab } from './AdminContentTab';
import { AdminMediaTab } from './AdminMediaTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { AdminInvoiceModal } from './AdminInvoiceModal';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'banners'
  | 'sales'
  | 'content'
  | 'media'
  | 'settings';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreDataChanged?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  onStoreDataChanged,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Staging & Publish to Public State
  const [publishStatus, setPublishStatus] = useState<{
    hasUnpublishedChanges: boolean;
    pendingChangesCount: number;
    lastPublishedAt: string | null;
    publishedBy: string | null;
  }>({
    hasUnpublishedChanges: false,
    pendingChangesCount: 0,
    lastPublishedAt: null,
    publishedBy: null,
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);

  // Data states
  const [dashboardData, setDashboardData] = useState<{
    stats: any;
    recentOrders: any[];
    recentProducts: any[];
  }>({
    stats: {},
    recentOrders: [],
    recentProducts: [],
  });
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [content, setContent] = useState<any>({});
  const [media, setMedia] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Check authentication
  const checkAuth = useCallback(async () => {
    try {
      const res = await api.getAdminMe();
      if (res && res.success && res.user) {
        setIsAuthenticated(true);
        setCurrentUser(res.user);
        return true;
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        return false;
      }
    } catch {
      setIsAuthenticated(false);
      setCurrentUser(null);
      return false;
    }
  }, []);

  // Load all admin data and publish status
  const loadAllData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [
        dashRes,
        prodRes,
        catRes,
        ordRes,
        custRes,
        banRes,
        salesRes,
        contentRes,
        mediaRes,
        settRes,
        pubRes,
      ] = await Promise.all([
        api.getDashboardStats().catch(() => ({ success: false, stats: {}, recentOrders: [], recentProducts: [] })),
        api.getProducts('', true).catch(() => ({ success: false, products: [] })),
        api.getCategories(true).catch(() => ({ success: false, categories: [] })),
        api.getOrders().catch(() => ({ success: false, orders: [] })),
        api.getCustomers().catch(() => ({ success: false, customers: [] })),
        api.getBanners(true).catch(() => ({ success: false, banners: [] })),
        api.getSales(true).catch(() => ({ success: false, sales: [] })),
        api.getContent(true).catch(() => ({ success: false, content: {} })),
        api.getMedia().catch(() => ({ success: false, media: [] })),
        api.getSettings(true).catch(() => ({ success: false, settings: {} })),
        api.getPublishStatus().catch(() => ({
          success: false,
          hasUnpublishedChanges: false,
          pendingChangesCount: 0,
          lastPublishedAt: null,
          publishedBy: null,
        })),
      ]);

      if (dashRes.stats) {
        setDashboardData({
          stats: dashRes.stats,
          recentOrders: dashRes.recentOrders || [],
          recentProducts: dashRes.recentProducts || [],
        });
      }
      if (prodRes.products) setProducts(prodRes.products);
      if (catRes.categories) setCategories(catRes.categories);
      if (ordRes.orders) setOrders(ordRes.orders);
      if (custRes.customers) setCustomers(custRes.customers);
      if (banRes.banners) setBanners(banRes.banners);
      if (salesRes.sales) setSales(salesRes.sales);
      if (contentRes.content) setContent(contentRes.content);
      if (mediaRes.media) setMedia(mediaRes.media);
      if (settRes.settings) setSettings(settRes.settings);

      if (pubRes && pubRes.success) {
        setPublishStatus({
          hasUnpublishedChanges: Boolean(pubRes.hasUnpublishedChanges),
          pendingChangesCount: pubRes.pendingChangesCount || 0,
          lastPublishedAt: pubRes.lastPublishedAt || null,
          publishedBy: pubRes.publishedBy || null,
        });
      }
    } catch (err: any) {
      console.error('Error loading admin portal data:', err);
      showToast('Failed to load recent changes: ' + (err.message || 'Network error'), 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen) {
      checkAuth().then((authed) => {
        if (authed) {
          loadAllData();
        } else {
          setIsLoading(false);
        }
      });
    }
  }, [isOpen, checkAuth, loadAllData]);

  const handleLoginSuccess = (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name || 'Administrator'}!`);
    loadAllData();
  };

  const handleLogout = async () => {
    try {
      await api.logoutAdmin();
      setIsAuthenticated(false);
      setCurrentUser(null);
      showToast('Admin logged out successfully.');
    } catch (e: any) {
      showToast('Logout error: ' + e.message, 'error');
    }
  };

  // Publish changes to the live public website
  const handlePublishToPublic = async () => {
    try {
      setIsPublishing(true);
      const res = await api.publishChanges();
      if (res.success) {
        showToast('🎉 All changes successfully published to the live public website!');
        setPublishStatus({
          hasUnpublishedChanges: false,
          pendingChangesCount: 0,
          lastPublishedAt: res.publishedAt,
          publishedBy: currentUser?.email || 'Administrator',
        });
        setIsPublishConfirmOpen(false);
        // Synchronize storefront immediately
        if (onStoreDataChanged) {
          onStoreDataChanged();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to publish changes', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Discard unpublished draft changes and revert to live public website state
  const handleDiscardDraft = async () => {
    if (!confirm('Are you sure you want to discard all unpublished changes? This will revert the admin panel back to the current live public website version.')) {
      return;
    }
    try {
      setIsDiscarding(true);
      const res = await api.discardDraftChanges();
      if (res.success) {
        showToast('Unpublished draft changes discarded. Reverted to live public version.');
        await loadAllData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to discard changes', 'error');
    } finally {
      setIsDiscarding(false);
    }
  };

  if (!isOpen) return null;

  // Unauthenticated: Show secure login
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] overflow-y-auto">
        <AdminLogin onSuccess={handleLoginSuccess} onBackToStore={onClose} />
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: any; count?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'categories', label: 'Categories', icon: Layers, count: categories.length },
    {
      id: 'orders',
      label: 'Orders & Pipeline',
      icon: ShoppingBag,
      count: orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length || undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
    { id: 'banners', label: 'Banners', icon: ImageIcon, count: banners.length },
    { id: 'sales', label: 'Sales & Offers', icon: Tag, count: sales.length },
    { id: 'content', label: 'Website Content', icon: Globe },
    { id: 'media', label: 'Media Library', icon: UploadCloud, count: media.length },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#F1F5F9] text-[#1E293B] flex flex-col font-sans overflow-hidden">
      {/* Toast Alert Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold transition-all transform animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white shadow-rose-900/30'
              : 'bg-emerald-600 text-white shadow-emerald-900/30'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="h-16 bg-[#172B4D] text-white px-3 sm:px-6 flex items-center justify-between border-b border-[#0F1E36] shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 md:hidden"
            title="Toggle Menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#783D1B] to-[#A0522D] flex items-center justify-center font-extrabold text-white text-base shadow-inner">
              CG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  COMPUTER GALAXY
                </span>
                <span className="bg-[#783D1B] text-amber-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-400/30 hidden sm:inline-block">
                  Master Control
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
                Live Storefront Management Console
              </p>
            </div>
          </div>
        </div>

        {/* CENTER / RIGHT: PROMINENT "PUBLISH TO PUBLIC" ACTION BAR */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PUBLISH TO PUBLIC BUTTON: Without tapping this, no change is saved to public website */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/60 p-1 sm:p-1.5 rounded-2xl border border-white/10">
            {publishStatus.hasUnpublishedChanges ? (
              <>
                <button
                  onClick={handleDiscardDraft}
                  disabled={isDiscarding}
                  className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Discard unsaved draft changes"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isDiscarding ? 'animate-spin' : ''}`} />
                  <span>Discard Draft</span>
                </button>

                <button
                  onClick={() => setIsPublishConfirmOpen(true)}
                  disabled={isPublishing}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400/70 transition-all cursor-pointer animate-pulse"
                  title="Tap to publish all changes to the public website"
                >
                  <Globe className="w-4 h-4 text-emerald-100" />
                  <span>Publish to Public</span>
                  <span className="px-1.5 py-0.5 bg-black/40 text-emerald-200 rounded-full text-[10px] font-mono">
                    {publishStatus.pendingChangesCount}
                  </span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">All Changes Published (Live)</span>
                <span className="sm:hidden font-bold">Live</span>
              </div>
            )}
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={loadAllData}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Admin Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
            <span className="hidden lg:inline">Refresh</span>
          </button>

          {/* View Live Store Button */}
          <button
            onClick={onClose}
            className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#783D1B] hover:bg-[#8F4A23] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
            title="Exit to Customer Storefront"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/15 shrink-0">
            <div className="hidden sm:block text-right">
              <span className="text-xs font-bold text-white block leading-tight">
                {currentUser?.name || 'Chief Administrator'}
              </span>
              <span className="text-[10px] text-slate-300 block">
                {currentUser?.role === 'superadmin' ? 'Primary Owner' : 'Administrator'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white transition-colors cursor-pointer"
              title="Logout from Admin Panel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-16 left-0 z-40 w-64 bg-[#1E293B] text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } border-r border-slate-700/60 shadow-xl md:shadow-none`}
        >
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Management Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#783D1B] text-white shadow-md shadow-[#783D1B]/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {typeof item.count === 'number' && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor ||
                        (isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-300')
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Footer System info */}
          <div className="p-3 border-t border-slate-700/60 bg-slate-900/40 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-300">Public Status</span>
              {publishStatus.hasUnpublishedChanges ? (
                <span className="text-amber-400 font-bold">Unsaved Drafts ({publishStatus.pendingChangesCount})</span>
              ) : (
                <span className="text-emerald-400 font-bold">All Live & Published</span>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-300">Server API</span>
              <span className="text-emerald-400 font-bold">Online · 200 OK</span>
            </div>
            <div className="pt-1 text-[10px] text-slate-400 text-center">
              Computer Galaxy v2.5 Enterprise
            </div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
          />
        )}

        {/* Central Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          {/* DRAFT NOTIFICATION BANNER: Explains that without clicking "Publish to Public", no changes are saved to the public website */}
          {publishStatus.hasUnpublishedChanges && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400/50 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#172B4D]">
                      Unpublished Draft Changes Waiting ({publishStatus.pendingChangesCount} changes)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-800 uppercase tracking-wider">
                      Staged Mode
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    You have made changes in the admin panel. <strong>Without tapping the &ldquo;Publish to Public&rdquo; button at the top, no changes can be saved or seen by customers on the public live website.</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <button
                  onClick={handleDiscardDraft}
                  disabled={isDiscarding}
                  className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Discard Draft</span>
                </button>

                <button
                  onClick={() => setIsPublishConfirmOpen(true)}
                  disabled={isPublishing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Globe className="w-4 h-4" />
                  <span>Publish to Public Now</span>
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#783D1B] animate-spin" />
              <p className="text-sm font-bold text-slate-600">Connecting to Computer Galaxy Database...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboardTab
                  stats={dashboardData.stats}
                  recentOrders={dashboardData.recentOrders}
                  recentProducts={dashboardData.recentProducts}
                  onNavigateTab={(tab: string) => setActiveTab(tab as AdminTab)}
                  onViewOrder={(order: any) => setInvoiceOrder(order)}
                />
              )}

              {activeTab === 'products' && (
                <AdminProductsTab
                  products={products}
                  categories={categories}
                  onRefresh={loadAllData}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'categories' && (
                <AdminCategoriesTab
                  categories={categories}
                  onRefresh={loadAllData}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'orders' && (
                <AdminOrdersTab
                  orders={orders}
                  onRefresh={loadAllData}
                  onShowToast={showToast}
                  onPrintInvoice={(order: any) => setInvoiceOrder(order)}
                />
              )}

              {activeTab === 'customers' && (
                <AdminCustomersTab
                  customers={customers}
                  orders={orders}
                  onViewOrder={(order: any) => setInvoiceOrder(order)}
                />
              )}

              {activeTab === 'banners' && (
                <AdminBannersTab
                  banners={banners}
                  onRefresh={loadAllData}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'sales' && (
                <AdminSalesTab
                  sales={sales}
                  onRefresh={loadAllData}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'content' && (
                <AdminContentTab
                  content={content}
                  onRefresh={loadAllData}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'media' && (
                <AdminMediaTab
                  media={media}
                  onRefresh={loadAllData}
                  onShowToast={showToast}
                />
              )}

              {activeTab === 'settings' && (
                <AdminSettingsTab
                  settings={settings}
                  onRefresh={loadAllData}
                  onShowToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* PUBLISH CONFIRMATION MODAL */}
      {isPublishConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-[#172B4D]">
                  Publish Changes to Live Public Website
                </h3>
              </div>
              <button
                onClick={() => setIsPublishConfirmOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">
                You are about to publish all your current admin changes to the <strong>Computer Galaxy live public storefront</strong>.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Pending Draft Changes:</span>
                  <span className="font-bold text-amber-700 font-mono bg-amber-100 px-2 py-0.5 rounded">
                    {publishStatus.pendingChangesCount} changes
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Last Published:</span>
                  <span className="text-slate-700 font-medium">
                    {publishStatus.lastPublishedAt
                      ? new Date(publishStatus.lastPublishedAt).toLocaleString()
                      : 'Initial Setup Seed'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Published By:</span>
                  <span className="text-slate-700 font-medium">
                    {publishStatus.publishedBy || 'Administrator'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                <strong>Safety Rule Enforced:</strong> Without tapping <em>&ldquo;Confirm & Publish to Public&rdquo;</em>, any edits you make remain safely inside draft mode and will not be displayed to online customers.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsPublishConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Cancel / Keep in Draft
              </button>
              <button
                type="button"
                disabled={isPublishing}
                onClick={handlePublishToPublic}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Publishing Live...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-emerald-100" />
                    <span>Confirm & Publish to Public</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal for Printing / Viewing */}
      {invoiceOrder && (
        <AdminInvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
          settings={settings}
        />
      )}
    </div>
  );
};
