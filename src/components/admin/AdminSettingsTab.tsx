import React, { useState } from 'react';
import { Settings, Save, Lock, ShieldCheck, DollarSign, Store, Palette, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface AdminSettingsTabProps {
  settings: any;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  settings,
  onRefresh,
  onShowToast,
}) => {
  const [formData, setFormData] = useState({
    businessName: settings?.businessName || 'Computer Galaxy',
    tagline: settings?.tagline || 'Gaming PC & Hardware Store',
    contactNumber: settings?.contactNumber || '+91 70144 43922',
    whatsappNumber: settings?.whatsappNumber || '+91 70144 43922',
    supportEmail: settings?.supportEmail || 'sales@computergalaxy.in',
    officeAddress: settings?.officeAddress || 'Shop 14-16, IT Mall, MG Road, Camp, Pune, Maharashtra 411001',
    currencySymbol: settings?.currencySymbol || '₹',
    currencyCode: settings?.currencyCode || 'INR',
    maintenanceMode: Boolean(settings?.maintenanceMode),
    primaryColor: settings?.primaryColor || '#783D1B',
    secondaryColor: settings?.secondaryColor || '#FFB020',
    freeShippingThreshold: settings?.freeShippingThreshold || 2000,
    standardShippingFee: settings?.standardShippingFee || 99,
    gstPercent: settings?.gstPercent || 18,
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(formData);
      onShowToast('Store settings saved successfully and synchronized live.');
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update settings', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onShowToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      onShowToast('New password must be at least 6 characters', 'error');
      return;
    }

    setIsChangingPass(true);
    try {
      await api.updateAdminProfile({ currentPassword, newPassword });
      onShowToast('Admin password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to change password', 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-[#172B4D]">Store Configuration & Settings</h2>
        <p className="text-xs text-slate-500">
          Manage general website settings, currency, shipping fees, tax calculation, and administrator security.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-xs">
        
        <div className="border-b pb-3 border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#783D1B]">
            <Store className="w-4 h-4" />
            <h3 className="font-bold text-sm text-[#172B4D]">Business & Storefront Information</h3>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Store Settings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Business Store Name</label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-[#172B4D]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Customer Helpline</label>
            <input
              type="text"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">WhatsApp Sales Number</label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Support Email</label>
            <input
              type="email"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Head Office & Store Address</label>
          <input
            type="text"
            value={formData.officeAddress}
            onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
          />
        </div>

        {/* Currency & Financials */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[#783D1B] mb-3">
            <DollarSign className="w-4 h-4" />
            <h3 className="font-bold text-sm text-[#172B4D]">Currency & Shipping Rules</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Free Shipping Above (₹)</label>
              <input
                type="number"
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard Air Freight (₹)</label>
              <input
                type="number"
                value={formData.standardShippingFee}
                onChange={(e) => setFormData({ ...formData, standardShippingFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Applicable GST %</label>
              <input
                type="number"
                value={formData.gstPercent}
                onChange={(e) => setFormData({ ...formData, gstPercent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Brand Theme Accent Settings */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[#783D1B] mb-3">
            <Palette className="w-4 h-4" />
            <h3 className="font-bold text-sm text-[#172B4D]">Brand Theme Colors</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300"
              />
              <div>
                <span className="font-bold text-slate-800 block">Primary Brand Accent</span>
                <span className="font-mono text-[10px] text-slate-500">{formData.primaryColor} (Computer Galaxy Brown)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300"
              />
              <div>
                <span className="font-bold text-slate-800 block">Secondary Accent / Highlights</span>
                <span className="font-mono text-[10px] text-slate-500">{formData.secondaryColor} (Warm Amber)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between p-4 bg-amber-50/60 rounded-xl border border-amber-200/80">
          <div>
            <span className="font-bold text-[#783D1B] block">Storefront Maintenance Mode</span>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Temporarily show a maintenance notice to visitors during major catalog updates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, maintenanceMode: !formData.maintenanceMode })}
            className={`px-4 py-2 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
              formData.maintenanceMode ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {formData.maintenanceMode ? 'ENABLED (Under Maintenance)' : 'DISABLED (Live)'}
          </button>
        </div>

      </form>

      {/* Admin Password Change Box */}
      <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
        <div className="flex items-center gap-2 text-[#783D1B] border-b pb-3 border-slate-100">
          <Lock className="w-4 h-4" />
          <h3 className="font-bold text-sm text-[#172B4D]">Change Administrator Password</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              placeholder="••••••••••••"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">New Password *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              placeholder="••••••••••••"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isChangingPass}
            className="px-5 py-2 bg-[#172B4D] hover:bg-[#0F1E36] text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Update Admin Password
          </button>
        </div>
      </form>

    </div>
  );
};
