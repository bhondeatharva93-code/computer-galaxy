import React, { useState } from 'react';
import {
  Globe,
  Home,
  Info,
  Phone,
  FileText,
  Navigation,
  HelpCircle,
  Search,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';

interface AdminContentTabProps {
  content: any;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminContentTab: React.FC<AdminContentTabProps> = ({
  content,
  onRefresh,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'homepage' | 'about' | 'contact' | 'footer' | 'navigation' | 'faqs' | 'seo'>('homepage');
  const [isSaving, setIsSaving] = useState(false);

  // Local editable copies of each section
  const [homepage, setHomepage] = useState(content?.homepage || {});
  const [about, setAbout] = useState(content?.about || {});
  const [contact, setContact] = useState(content?.contact || {});
  const [footer, setFooter] = useState(content?.footer || {});
  const [navigation, setNavigation] = useState<any[]>(content?.navigation || []);
  const [faqs, setFaqs] = useState<any[]>(content?.faqs || []);
  const [seo, setSeo] = useState(content?.seo || {});

  // FAQ new item
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newFaqCat, setNewFaqCat] = useState('General');

  // Nav new item
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavPath, setNewNavPath] = useState('');

  const handleSaveSection = async (sectionName: string, data: any) => {
    setIsSaving(true);
    try {
      await api.updateContentSection(sectionName, data);
      onShowToast(`Website ${sectionName.toUpperCase()} section updated and published live.`);
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update section', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    const updated = [
      ...faqs,
      {
        id: 'faq-' + Date.now(),
        question: newFaqQ.trim(),
        answer: newFaqA.trim(),
        category: newFaqCat.trim(),
        order: faqs.length + 1,
      },
    ];
    setFaqs(updated);
    setNewFaqQ('');
    setNewFaqA('');
    handleSaveSection('faqs', updated);
  };

  const handleRemoveFaq = (id: string) => {
    const updated = faqs.filter((f) => f.id !== id);
    setFaqs(updated);
    handleSaveSection('faqs', updated);
  };

  const handleAddNav = () => {
    if (!newNavLabel.trim() || !newNavPath.trim()) return;
    const updated = [
      ...navigation,
      {
        id: 'nav-' + Date.now(),
        label: newNavLabel.trim(),
        path: newNavPath.trim(),
        order: navigation.length + 1,
        active: true,
      },
    ];
    setNavigation(updated);
    setNewNavLabel('');
    setNewNavPath('');
    handleSaveSection('navigation', updated);
  };

  const handleRemoveNav = (id: string) => {
    const updated = navigation.filter((n) => n.id !== id);
    setNavigation(updated);
    handleSaveSection('navigation', updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#172B4D]">Complete Website Content Management</h2>
          <p className="text-xs text-slate-500">
            Control homepage headings, About Us copy, store contact info, footer, navigation bar, FAQs, and SEO meta tags without editing code.
          </p>
        </div>
      </div>

      {/* Sub-tab Pill Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'homepage', label: 'Homepage', icon: Home },
          { id: 'about', label: 'About Us', icon: Info },
          { id: 'contact', label: 'Contact Details', icon: Phone },
          { id: 'footer', label: 'Footer & GST', icon: FileText },
          { id: 'navigation', label: 'Navigation Bar', icon: Navigation },
          { id: 'faqs', label: 'FAQs', icon: HelpCircle },
          { id: 'seo', label: 'SEO & Meta Tags', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#783D1B] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. HOMEPAGE CONTENT */}
      {activeSubTab === 'homepage' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-xs">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B4D]">Homepage Titles & Section Visibility</h3>
            <button
              onClick={() => handleSaveSection('homepage', homepage)}
              disabled={isSaving}
              className="px-4 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Homepage Changes</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Storefront Hero Title</label>
              <input
                type="text"
                value={homepage.heroTitle || ''}
                onChange={(e) => setHomepage({ ...homepage, heroTitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hero Subtitle</label>
              <textarea
                rows={2}
                value={homepage.heroSubtitle || ''}
                onChange={(e) => setHomepage({ ...homepage, heroSubtitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Top Header Announcement Bar</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={homepage.announcementActive}
                    onChange={(e) => setHomepage({ ...homepage, announcementActive: e.target.checked })}
                    className="rounded text-[#783D1B]"
                  />
                  <span className="font-semibold text-slate-700">Show Announcement Bar</span>
                </label>
              </div>
              <input
                type="text"
                value={homepage.announcementText || ''}
                onChange={(e) => setHomepage({ ...homepage, announcementText: e.target.value })}
                placeholder="Announcement text (e.g. Festive Sale discount notice)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Section Toggles */}
            <div className="pt-2">
              <span className="font-bold text-slate-800 block mb-2">Homepage Sections Display Control:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {homepage.sections?.map((sec: any, idx: number) => (
                  <div key={sec.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{sec.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {sec.id}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={sec.visible !== false}
                      onChange={(e) => {
                        const copy = [...homepage.sections];
                        copy[idx].visible = e.target.checked;
                        setHomepage({ ...homepage, sections: copy });
                      }}
                      className="rounded text-[#783D1B] cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ABOUT US CONTENT */}
      {activeSubTab === 'about' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B4D]">About Us Page & Business Story</h3>
            <button
              onClick={() => handleSaveSection('about', about)}
              disabled={isSaving}
              className="px-4 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save About Us</span>
            </button>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">About Us Heading</label>
            <input
              type="text"
              value={about.heading || ''}
              onChange={(e) => setAbout({ ...about, heading: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Company Story & History</label>
            <textarea
              rows={4}
              value={about.description || ''}
              onChange={(e) => setAbout({ ...about, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Established Year</label>
              <input
                type="text"
                value={about.establishedYear || '2018'}
                onChange={(e) => setAbout({ ...about, establishedYear: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Address</label>
              <input
                type="text"
                value={about.storeAddress || ''}
                onChange={(e) => setAbout({ ...about, storeAddress: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTACT MANAGEMENT */}
      {activeSubTab === 'contact' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B4D]">Contact Information & Social Links</h3>
            <button
              onClick={() => handleSaveSection('contact', contact)}
              disabled={isSaving}
              className="px-4 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Contact Info</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                value={contact.businessName || ''}
                onChange={(e) => setContact({ ...contact, businessName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={contact.email || ''}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Helpline Phone Number</label>
              <input
                type="text"
                value={contact.phone || ''}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Store Number</label>
              <input
                type="text"
                value={contact.whatsapp || ''}
                onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Store Address</label>
            <input
              type="text"
              value={contact.address || ''}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Social Links */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block">Social Media Links:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">YouTube Channel URL</label>
                <input
                  type="text"
                  value={contact.socialLinks?.youtube || ''}
                  onChange={(e) => setContact({ ...contact, socialLinks: { ...contact.socialLinks, youtube: e.target.value } })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Instagram Profile URL</label>
                <input
                  type="text"
                  value={contact.socialLinks?.instagram || ''}
                  onChange={(e) => setContact({ ...contact, socialLinks: { ...contact.socialLinks, instagram: e.target.value } })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FOOTER & GST MANAGEMENT */}
      {activeSubTab === 'footer' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B4D]">Footer Information & GST Registration</h3>
            <button
              onClick={() => handleSaveSection('footer', footer)}
              disabled={isSaving}
              className="px-4 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Footer</span>
            </button>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Official GST Registration Number</label>
            <input
              type="text"
              value={footer.gstNumber || ''}
              onChange={(e) => setFooter({ ...footer, gstNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Footer About Description</label>
            <textarea
              rows={3}
              value={footer.description || ''}
              onChange={(e) => setFooter({ ...footer, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Copyright Notice</label>
            <input
              type="text"
              value={footer.copyrightText || ''}
              onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>
      )}

      {/* 5. NAVIGATION MANAGEMENT */}
      {activeSubTab === 'navigation' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B4D]">Header Navigation Links</h3>
          </div>

          <div className="space-y-2">
            {navigation.map((n) => (
              <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{n.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono ml-2">Path: {n.path}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-mono">Order #{n.order}</span>
                  <button
                    onClick={() => handleRemoveNav(n.id)}
                    className="p-1 text-red-500 hover:text-red-700 font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Nav */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-700 block">Add New Navigation Link:</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newNavLabel}
                onChange={(e) => setNewNavLabel(e.target.value)}
                placeholder="Link Label (e.g. Monitors)"
                className="w-1/2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <input
                type="text"
                value={newNavPath}
                onChange={(e) => setNewNavPath(e.target.value)}
                placeholder="Target View or URL (e.g. basic-computers)"
                className="w-1/2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
              <button
                onClick={handleAddNav}
                className="px-4 py-2 bg-[#783D1B] text-white font-bold rounded-lg shrink-0 cursor-pointer"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. FAQ MANAGEMENT */}
      {activeSubTab === 'faqs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B4D]">Customer Questions & Answers (FAQs)</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-800 text-xs">Q: {f.question}</span>
                  <button
                    onClick={() => handleRemoveFaq(f.id)}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-600 text-xs">A: {f.answer}</p>
                <span className="text-[10px] text-[#783D1B] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-full inline-block">
                  {f.category}
                </span>
              </div>
            ))}
          </div>

          {/* Add FAQ form */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <span className="font-bold text-slate-700 block">Add New Question & Answer:</span>
            <input
              type="text"
              value={newFaqQ}
              onChange={(e) => setNewFaqQ(e.target.value)}
              placeholder="Question (e.g. Do you ship to Tier-2/Tier-3 cities?)"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
            <textarea
              rows={2}
              value={newFaqA}
              onChange={(e) => setNewFaqA(e.target.value)}
              placeholder="Answer..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={newFaqCat}
                onChange={(e) => setNewFaqCat(e.target.value)}
                placeholder="Category (e.g. Shipping, Warranty, Assembly)"
                className="w-64 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <button
                onClick={handleAddFaq}
                className="px-5 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white font-bold rounded-lg cursor-pointer"
              >
                Add FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. SEO MANAGEMENT */}
      {activeSubTab === 'seo' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172B4D]">Search Engine Optimization & Meta Tags</h3>
            <button
              onClick={() => handleSaveSection('seo', seo)}
              disabled={isSaving}
              className="px-4 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save SEO Settings</span>
            </button>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">HTML Title Tag (&lt;title&gt;)</label>
            <input
              type="text"
              value={seo.title || ''}
              onChange={(e) => setSeo({ ...seo, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Meta Description</label>
            <textarea
              rows={3}
              value={seo.metaDescription || ''}
              onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">SEO Target Keywords (comma separated)</label>
            <input
              type="text"
              value={seo.keywords || ''}
              onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>
      )}

    </div>
  );
};
