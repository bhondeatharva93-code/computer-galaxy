import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Eye,
  Image as ImageIcon,
  CheckCircle2,
  Save,
  X,
  ExternalLink,
  Film,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';

interface AdminBannersTabProps {
  banners: any[];
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminBannersTab: React.FC<AdminBannersTabProps> = ({
  banners,
  onRefresh,
  onShowToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'image'>('video');

  // Hero Banner Quick-Edit state (for the top Diwali / Hero banner)
  const heroBanner = banners.find((b) => b.id === 'banner-diwali' || b.displayOrder === 1) || banners[0];

  const [heroForm, setHeroForm] = useState({
    title: heroBanner?.title || 'Festival of Lights Mega Celebration & Exclusive Deals',
    subtitle: heroBanner?.subtitle || 'Computer Galaxy wishes you and your family endless joy, prosperity, and light! Celebrate this festive season with exclusive discounts across all custom gaming rigs, Intel/AMD processors, and NVIDIA RTX GPUs.',
    badge: heroBanner?.badge || 'Diwali Festive Mega Celebration | Special Offers Live',
    floatingBadge: heroBanner?.floatingBadge || 'Happy Diwali 🪔 Computer Galaxy',
    ctaText: heroBanner?.ctaText || 'Shop Festive Deals',
    ctaLink: heroBanner?.ctaLink || '#catalog-section',
    secondaryCtaText: heroBanner?.secondaryCtaText || 'Diwali PC Builder',
    secondaryCtaLink: heroBanner?.secondaryCtaLink || '#custom-builder',
    desktopImage: heroBanner?.desktopImage || '/assets/aistudio/Orange_And_Pink_Vibrant_Diwali_Greetings_Video_9f51bd3e.mp4',
    mediaType: (heroBanner?.mediaType || (heroBanner?.desktopImage?.endsWith('.mp4') ? 'video' : 'image')) as 'video' | 'image',
    isActive: heroBanner?.isActive !== false,
  });

  // Modal Form State (for creating or editing any banner)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'FESTIVE SALE',
    floatingBadge: '',
    ctaText: 'Explore Offers',
    ctaLink: '#catalog-section',
    secondaryCtaText: '',
    secondaryCtaLink: '',
    desktopImage: '',
    mobileImage: '',
    mediaType: 'image' as 'image' | 'video',
    tag: '',
    displayOrder: 1,
    isActive: true,
  });

  // Keep heroForm in sync when banners prop changes
  React.useEffect(() => {
    if (heroBanner) {
      const isVid = heroBanner.mediaType === 'video' || (heroBanner.desktopImage && (heroBanner.desktopImage.endsWith('.mp4') || heroBanner.desktopImage.endsWith('.webm')));
      setHeroForm({
        title: heroBanner.title || '',
        subtitle: heroBanner.subtitle || '',
        badge: heroBanner.badge || '',
        floatingBadge: heroBanner.floatingBadge || '',
        ctaText: heroBanner.ctaText || 'Shop Festive Deals',
        ctaLink: heroBanner.ctaLink || '#catalog-section',
        secondaryCtaText: heroBanner.secondaryCtaText || '',
        secondaryCtaLink: heroBanner.secondaryCtaLink || '',
        desktopImage: heroBanner.desktopImage || '',
        mediaType: isVid ? 'video' : 'image',
        isActive: heroBanner.isActive !== false,
      });
      setActiveMediaTab(isVid ? 'video' : 'image');
    }
  }, [heroBanner]);

  // Upload handler from PC
  const handleFileUploadFromPC = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'hero' | 'modal'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const isVideoFile = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm');
    const detectedType: 'video' | 'image' = isVideoFile ? 'video' : 'image';

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadMedia(base64, file.name, file.type);
        if (res.success && res.url) {
          if (target === 'hero') {
            const updatedHero = {
              ...heroForm,
              desktopImage: res.url,
              videoUrl: res.url,
              mediaType: detectedType,
            };
            setHeroForm(updatedHero);
            setActiveMediaTab(detectedType);

            // Auto-persist directly to database
            if (heroBanner?.id) {
              await api.updateBanner(heroBanner.id, {
                ...heroBanner,
                ...updatedHero,
              });
              onShowToast(`Banner file (${file.name}) uploaded from PC and published live!`);
              onRefresh();
            } else {
              onShowToast(`Uploaded ${file.name}. Click "Save Hero Banner" to publish.`);
            }
          } else {
            setFormData((prev) => ({
              ...prev,
              desktopImage: res.url,
              mediaType: detectedType,
            }));
            onShowToast(`Uploaded ${file.name} to banner editor.`);
          }
        }
      } catch (err: any) {
        onShowToast(err.message || 'File upload failed', 'error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      onShowToast('Failed to read file from your computer', 'error');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveHeroBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroForm.title.trim()) {
      onShowToast('Hero Banner headline is required', 'error');
      return;
    }

    try {
      if (heroBanner?.id) {
        await api.updateBanner(heroBanner.id, {
          ...heroBanner,
          ...heroForm,
          videoUrl: heroForm.mediaType === 'video' ? heroForm.desktopImage : undefined,
        });
        onShowToast('Diwali & Hero banner updated and published live to homepage!');
      } else {
        await api.createBanner({
          id: 'banner-diwali',
          ...heroForm,
          displayOrder: 1,
        });
        onShowToast('Diwali & Hero banner created and published live!');
      }
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update hero banner', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      badge: 'EXCLUSIVE DEALS',
      floatingBadge: '',
      ctaText: 'Shop Now',
      ctaLink: '#catalog-section',
      secondaryCtaText: 'Launch PC Builder',
      secondaryCtaLink: '#custom-builder',
      desktopImage: '/src/assets/images/hero_gaming_pc_setup_1793788644736.jpg',
      mobileImage: '',
      mediaType: 'image',
      tag: 'Pan-India Insured Dispatch',
      displayOrder: banners.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: any) => {
    setEditingBanner(b);
    const isVid = b.mediaType === 'video' || (b.desktopImage && (b.desktopImage.endsWith('.mp4') || b.desktopImage.endsWith('.webm')));
    setFormData({
      title: b.title || '',
      subtitle: b.subtitle || '',
      badge: b.badge || '',
      floatingBadge: b.floatingBadge || '',
      ctaText: b.ctaText || 'Shop Now',
      ctaLink: b.ctaLink || '#catalog-section',
      secondaryCtaText: b.secondaryCtaText || '',
      secondaryCtaLink: b.secondaryCtaLink || '',
      desktopImage: b.desktopImage || '',
      mobileImage: b.mobileImage || '',
      mediaType: isVid ? 'video' : 'image',
      tag: b.tag || '',
      displayOrder: b.displayOrder || 1,
      isActive: b.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSaveModalBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      onShowToast('Banner title is required', 'error');
      return;
    }

    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, formData);
        onShowToast('Banner updated and published live to homepage.');
      } else {
        await api.createBanner(formData);
        onShowToast('New banner published live to homepage.');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to save banner', 'error');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (id === 'banner-diwali') {
      if (!confirm('This is the primary Diwali Hero banner. Are you sure you want to remove it?')) return;
    } else {
      if (!confirm('Are you sure you want to delete this banner?')) return;
    }
    try {
      await api.deleteBanner(id);
      onShowToast('Banner removed from homepage.');
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete banner', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#783D1B] bg-[#783D1B]/10 px-2 py-0.5 rounded">
              Storefront Banners
            </span>
            <span className="text-xs text-slate-500">Live Website Hero & Promotional Media</span>
          </div>
          <h2 className="text-lg font-bold text-[#172B4D] mt-0.5">Website Banner Management</h2>
          <p className="text-xs text-slate-500">
            Upload custom banners, videos (MP4), or images (PNG/JPG) directly from your computer to change the Diwali hero banner and storefront promotions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Additional Banner</span>
        </button>
      </div>

      {/* 1. DEDICATED HERO & DIWALI FESTIVE BANNER CONTROL PANEL */}
      <div className="bg-gradient-to-br from-[#FFF8F3] via-white to-[#FFF5EB] border-2 border-[#783D1B]/30 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#783D1B]/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#783D1B] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#172B4D]">
                  Primary Hero & Diwali Festive Banner
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#783D1B] text-amber-200">
                  Featured Top Position
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                This is the main banner displayed at the very top of your homepage. You can upload any banner image or video from your PC.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                heroForm.isActive
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {heroForm.isActive ? '● Live on Storefront' : '○ Paused / Hidden'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Visual Preview & PC File Upload Button */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-xl overflow-hidden border-2 border-[#783D1B]/20 bg-black aspect-video sm:aspect-16/9 shadow-md group">
              {heroForm.mediaType === 'video' ? (
                <video
                  key={heroForm.desktopImage}
                  src={heroForm.desktopImage}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  key={heroForm.desktopImage}
                  src={heroForm.desktopImage}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Floating badges preview */}
              {heroForm.floatingBadge && (
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-white text-[10px] font-semibold border border-white/20">
                    {heroForm.floatingBadge}
                  </span>
                </div>
              )}

              <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white font-mono">
                {heroForm.mediaType === 'video' ? '🎬 Video Banner (MP4)' : '🖼️ Image Banner'}
              </div>
            </div>

            {/* BIG PROMINENT PC UPLOAD BUTTON */}
            <div className="p-4 bg-white rounded-xl border border-dashed border-[#783D1B]/50 hover:border-[#783D1B] transition-colors space-y-2 text-center">
              <label className="w-full py-3 px-4 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Uploading Banner from PC...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Any Banner from My PC (Image or Video)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/*"
                  disabled={isUploading}
                  onChange={(e) => handleFileUploadFromPC(e, 'hero')}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-[#64748B]">
                Supported: <strong>MP4, WEBM, JPG, PNG, WEBP</strong>. Max size: 50MB. Uploads save permanently and update the live website instantly.
              </p>
            </div>

            {/* Media Type Switcher & Custom URL */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Current Media Source</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHeroForm({ ...heroForm, mediaType: 'video' })}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    heroForm.mediaType === 'video'
                      ? 'bg-[#783D1B] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Video Banner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeroForm({ ...heroForm, mediaType: 'image' })}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    heroForm.mediaType === 'image'
                      ? 'bg-[#783D1B] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image Banner</span>
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={heroForm.desktopImage}
                  onChange={(e) => setHeroForm({ ...heroForm, desktopImage: e.target.value })}
                  placeholder="URL to uploaded file or web media..."
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono truncate"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Hero Banner Headings, Badges, and Button Settings */}
          <form onSubmit={handleSaveHeroBanner} className="lg:col-span-7 space-y-3.5 text-xs bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Festive Badge / Category Accent
              </label>
              <input
                type="text"
                value={heroForm.badge}
                onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                placeholder="e.g. Diwali Festive Mega Celebration | Special Offers Live"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#172B4D] font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Main Banner Headline *
              </label>
              <input
                type="text"
                required
                value={heroForm.title}
                onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                placeholder="e.g. Festival of Lights Mega Celebration & Exclusive Deals"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-[#172B4D]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Description / Greeting Note
              </label>
              <textarea
                rows={3}
                value={heroForm.subtitle}
                onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                placeholder="Greeting message, special discount terms, hardware warranty notes..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#172B4D] leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Floating Corner Tag (Overlay on video/image)
              </label>
              <input
                type="text"
                value={heroForm.floatingBadge}
                onChange={(e) => setHeroForm({ ...heroForm, floatingBadge: e.target.value })}
                placeholder="e.g. Happy Diwali 🪔 Computer Galaxy or New Rig Special"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-[#172B4D]"
              />
            </div>

            {/* Buttons Setup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Primary Button</label>
                <input
                  type="text"
                  value={heroForm.ctaText}
                  onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                  placeholder="Button Label (e.g. Shop Festive Deals)"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={heroForm.ctaLink}
                  onChange={(e) => setHeroForm({ ...heroForm, ctaLink: e.target.value })}
                  placeholder="Link (#catalog-section)"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-mono text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Secondary Button</label>
                <input
                  type="text"
                  value={heroForm.secondaryCtaText}
                  onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaText: e.target.value })}
                  placeholder="Button Label (e.g. Diwali PC Builder)"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={heroForm.secondaryCtaLink}
                  onChange={(e) => setHeroForm({ ...heroForm, secondaryCtaLink: e.target.value })}
                  placeholder="Link (#custom-builder)"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-mono text-slate-600"
                />
              </div>
            </div>

            {/* Visibility Toggle & Save */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setHeroForm({ ...heroForm, isActive: !heroForm.isActive })}
                className={`px-3 py-2 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-2 ${
                  heroForm.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${heroForm.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span>{heroForm.isActive ? 'Banner Visible on Homepage' : 'Banner Paused / Hidden'}</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save & Publish Diwali Hero Banner</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. ADDITIONAL HOMEPAGE BANNERS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-[#172B4D]">
            All Promotional Banners ({banners.length})
          </h3>
          <span className="text-xs text-slate-500">Ordered by display sequence</span>
        </div>

        <div className="space-y-3">
          {banners.map((b) => {
            const isVid = b.mediaType === 'video' || (b.desktopImage && (b.desktopImage.endsWith('.mp4') || b.desktopImage.endsWith('.webm')));
            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col md:flex-row hover:border-[#783D1B]/40 transition-colors"
              >
                {/* Thumbnail / Video */}
                <div className="md:w-64 h-40 bg-black relative shrink-0">
                  {isVid ? (
                    <video
                      src={b.desktopImage}
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={b.desktopImage || '/src/assets/images/hero_gaming_pc_setup_1793788644736.jpg'}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span
                    className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                      b.isActive !== false ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                    }`}
                  >
                    {b.isActive !== false ? 'Active' : 'Disabled'}
                  </span>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/60 text-white px-2 py-0.5 rounded">
                    Order #{b.displayOrder}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#783D1B] bg-[#783D1B]/10 px-2 py-0.5 rounded">
                        {b.badge || 'PROMOTION'}
                      </span>
                      {b.tag && <span className="text-[10px] text-slate-500 font-medium">· {b.tag}</span>}
                    </div>
                    <h4 className="text-sm font-bold text-[#172B4D] leading-snug">{b.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{b.subtitle}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>CTA: <strong className="text-[#172B4D]">{b.ctaText}</strong></span>
                      {b.secondaryCtaText && (
                        <span>Secondary: <strong className="text-[#172B4D]">{b.secondaryCtaText}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#783D1B] hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(b.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ADD / EDIT BANNER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-sm text-[#172B4D]">
                {editingBanner ? 'Edit Homepage Banner' : 'Add New Homepage Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalBanner} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Badge / Category Accent</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. DIWALI MEGA SALE, RTX 40-SERIES SPECIAL"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Main Heading *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Headline displayed prominently on banner..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Detailed offer terms, warranty note, discount details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Upload Media From PC */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Banner File (Upload Any Image or Video from PC) *
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 rounded-lg bg-black overflow-hidden border border-slate-300 shrink-0">
                    {formData.mediaType === 'video' ? (
                      <video src={formData.desktopImage} className="w-full h-full object-cover" />
                    ) : (
                      <img src={formData.desktopImage} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Banner from My PC (MP4/PNG/JPG)</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileUploadFromPC(e, 'modal')}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      required
                      value={formData.desktopImage}
                      onChange={(e) => setFormData({ ...formData, desktopImage: e.target.value })}
                      placeholder="Or enter media URL..."
                      className="w-full px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button Link Target</label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    placeholder="#catalog-section"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Display order and status */}
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
                    {formData.isActive ? 'Active (Live)' : 'Disabled'}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Save & Publish Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
