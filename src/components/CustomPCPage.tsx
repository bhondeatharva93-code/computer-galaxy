import React, { useState } from 'react';
import {
  ArrowLeft,
  Wrench,
  Cpu,
  Layers,
  Grid,
  Zap,
  HardDrive,
  Box,
  Fan,
  BatteryCharging,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { PCPart, PCPartType, Product } from '../types';
import { PC_BUILDER_PARTS } from '../data/products';
import { formatINR, checkPCCompatibility, createWhatsAppChatUrl } from '../utils/cart';

interface CustomPCPageProps {
  onBackToHome: () => void;
  onAddBuildToCart: (customProduct: Product) => void;
}

const PART_SLOTS: { type: PCPartType; label: string; icon: React.ReactNode }[] = [
  { type: 'cpu', label: 'Processor (CPU)', icon: <Cpu className="w-4 h-4 text-[#783D1B]" /> },
  { type: 'motherboard', label: 'Motherboard', icon: <Grid className="w-4 h-4 text-[#783D1B]" /> },
  { type: 'gpu', label: 'Graphics Card (GPU)', icon: <Layers className="w-4 h-4 text-[#783D1B]" /> },
  { type: 'ram', label: 'RAM Memory', icon: <Zap className="w-4 h-4 text-[#783D1B]" /> },
  { type: 'storage', label: 'NVMe Storage', icon: <HardDrive className="w-4 h-4 text-[#783D1B]" /> },
  { type: 'psu', label: 'Power Supply (PSU)', icon: <BatteryCharging className="w-4 h-4 text-[#783D1B]" /> },
  { type: 'cabinet', label: 'PC Cabinet', icon: <Box className="w-4 h-4 text-[#783D1B]" /> },
  { type: 'cooler', label: 'CPU Cooler', icon: <Fan className="w-4 h-4 text-[#783D1B]" /> },
];

export const CustomPCPage: React.FC<CustomPCPageProps> = ({
  onBackToHome,
  onAddBuildToCart,
}) => {
  const [selectedParts, setSelectedParts] = useState<Partial<Record<PCPartType, PCPart>>>({
    cpu: PC_BUILDER_PARTS.cpu[2], // Intel i7-14700K
    motherboard: PC_BUILDER_PARTS.motherboard[0], // ASUS Z790-A
    gpu: PC_BUILDER_PARTS.gpu[1], // RTX 4080 Super
    ram: PC_BUILDER_PARTS.ram[0], // Corsair Dominator Titanium 32GB
    storage: PC_BUILDER_PARTS.storage[0], // Samsung 990 Pro 2TB
    psu: PC_BUILDER_PARTS.psu[0], // Corsair RM850x
    cabinet: PC_BUILDER_PARTS.cabinet[0], // Lian Li O11 EVO
    cooler: PC_BUILDER_PARTS.cooler[0], // Corsair 360mm AIO
  });

  const [activeSlot, setActiveSlot] = useState<PCPartType>('cpu');

  const handleSelectPart = (part: PCPart) => {
    setSelectedParts((prev) => ({
      ...prev,
      [part.type]: part,
    }));
  };

  const handleRemovePart = (type: PCPartType) => {
    setSelectedParts((prev) => {
      const updated = { ...prev };
      delete updated[type];
      return updated;
    });
  };

  const handleReset = () => {
    setSelectedParts({});
  };

  // Calculations
  const compatibility = checkPCCompatibility(selectedParts);
  const partsArray = Object.values(selectedParts).filter(Boolean) as PCPart[];
  const totalPrice = partsArray.reduce((acc, part) => acc + part.price, 0);

  // WhatsApp Review Message
  const buildSummaryText = partsArray
    .map((p) => `• ${p.typeLabel}: ${p.name} (${formatINR(p.price)})`)
    .join('\n');

  const whatsappBuildUrl = createWhatsAppChatUrl(
    `Hello Computer Galaxy, I have configured a custom PC build on your website:\n\n${buildSummaryText}\n\n*Estimated Total: ${formatINR(totalPrice)}*\nEstimated Wattage: ${compatibility.totalWattage}W\n\nPlease verify component stock, pricing, and confirm delivery time to my location.`
  );

  const handleAddToCart = () => {
    if (partsArray.length === 0) return;

    const customProduct: Product = {
      id: `custom-build-${Date.now()}`,
      name: `Custom PC Rig (${selectedParts.cpu ? selectedParts.cpu.name : 'Configured'} + ${selectedParts.gpu ? selectedParts.gpu.name : 'Integrated'})`,
      brand: 'Computer Galaxy Custom Studio',
      category: 'gaming-pcs',
      categoryLabel: 'Custom PC Builds',
      originalPrice: Math.round(totalPrice * 1.1),
      discountedPrice: totalPrice,
      discountPercent: 10,
      rating: 5.0,
      reviewCount: 1,
      image: selectedParts.cabinet?.image || '/src/assets/images/custom_pc_builder_promo_1793788644706.jpg',
      inStock: true,
      stockCount: 1,
      specs: Object.entries(selectedParts).reduce((acc, [type, part]) => {
        if (part) acc[part.typeLabel] = part.name;
        return acc;
      }, {} as Record<string, string>),
      description: `Custom configured workstation and battle-station assembled with premium thermal paste, clean wire routing, and 24-hr stress testing.`,
      warranty: '3-Year Onsite Hardware Warranty on All Serialized Components',
      modelNumber: `CG-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    onAddBuildToCart(customProduct);
  };

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
            <span className="text-[#172B4D] font-semibold">Custom PC Builder Studio</span>
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
        <div className="bg-gradient-to-r from-amber-50/70 via-[#FFFFFF] to-orange-50/40 border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#783D1B]/10 text-[#783D1B] text-xs font-bold uppercase tracking-wider mb-3">
                <Wrench className="w-3.5 h-3.5" />
                <span>Zero Assembly Labor Surcharge • Free Cable Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#172B4D] tracking-tight">
                Custom PC Builder Studio
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed max-w-2xl">
                Configure your custom dream desktop rig with real-time socket verification, wattage calculation, and price transparency. Assembled by master engineers with thermal testing before delivery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-[#F5F7FA] hover:bg-[#E5E7EB] text-[#172B4D] text-xs font-semibold rounded-lg border border-[#E5E7EB] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Build</span>
              </button>
              <a
                href={whatsappBuildUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Engineer</span>
              </a>
            </div>
          </div>
        </div>

        {/* Builder Work Area: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Component Slots & Parts Selection */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Slot Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E5E7EB]">
              {PART_SLOTS.map((slot) => {
                const isSelected = Boolean(selectedParts[slot.type]);
                const isActive = activeSlot === slot.type;
                return (
                  <button
                    key={slot.type}
                    onClick={() => setActiveSlot(slot.type)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-[#783D1B] text-white shadow-xs'
                        : isSelected
                        ? 'bg-[#F5F7FA] text-[#172B4D] border border-emerald-300'
                        : 'bg-[#F5F7FA] text-[#64748B] hover:text-[#172B4D]'
                    }`}
                  >
                    <span>{slot.label}</span>
                    {isSelected && (
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Currently Active Slot Component Picker */}
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-[#783D1B]/10 rounded-lg text-[#783D1B]">
                    {PART_SLOTS.find((s) => s.type === activeSlot)?.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#172B4D]">
                      Select {PART_SLOTS.find((s) => s.type === activeSlot)?.label}
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Authorized Indian retail inventory with direct brand warranty
                    </p>
                  </div>
                </div>

                {selectedParts[activeSlot] && (
                  <button
                    onClick={() => handleRemovePart(activeSlot)}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove Selection
                  </button>
                )}
              </div>

              {/* Parts Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(PC_BUILDER_PARTS[activeSlot] || []).map((part) => {
                  const isCurrent = selectedParts[activeSlot]?.id === part.id;
                  return (
                    <div
                      key={part.id}
                      onClick={() => handleSelectPart(part)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'border-[#783D1B] bg-[#783D1B]/5 shadow-xs'
                          : 'border-[#E5E7EB] hover:border-[#783D1B]/40 hover:bg-[#F5F7FA]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#783D1B]">
                            {part.brand}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-[#783D1B] bg-[#783D1B]/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Selected
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[#172B4D] mt-1 line-clamp-2">
                          {part.name}
                        </h4>
                        <div className="text-[11px] text-[#64748B] mt-2 space-y-0.5">
                          {part.specs && <p>Specs: <span className="font-medium text-[#172B4D]">{part.specs}</span></p>}
                          {part.socket && <p>Socket: <span className="font-medium text-[#172B4D]">{part.socket}</span></p>}
                          {part.wattage ? <p>TDP/Wattage: <span className="font-medium text-[#172B4D]">{part.wattage}W</span></p> : null}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#172B4D]">
                          {formatINR(part.price)}
                        </span>
                        <button
                          className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                            isCurrent
                              ? 'bg-[#783D1B] text-white'
                              : 'bg-[#F5F7FA] text-[#172B4D] hover:bg-[#783D1B] hover:text-white'
                          }`}
                        >
                          {isCurrent ? 'Selected' : 'Choose'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Configured Parts Summary Table */}
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#172B4D] mb-3">
                Current Build Configuration ({partsArray.length}/8 Slots Filled)
              </h3>
              <div className="divide-y divide-[#E5E7EB] text-xs">
                {PART_SLOTS.map((slot) => {
                  const part = selectedParts[slot.type];
                  return (
                    <div key={slot.type} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-[#783D1B]" />
                        <span className="text-[#64748B] w-28 shrink-0">{slot.label}:</span>
                        {part ? (
                          <span className="font-semibold text-[#172B4D] truncate">{part.name}</span>
                        ) : (
                          <span className="text-[#64748B] italic">Not selected yet</span>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        {part ? (
                          <>
                            <span className="font-bold text-[#172B4D]">{formatINR(part.price)}</span>
                            <button
                              onClick={() => handleRemovePart(slot.type)}
                              className="text-rose-500 hover:text-rose-700 text-[11px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setActiveSlot(slot.type)}
                            className="text-[#783D1B] font-semibold text-[11px] hover:underline cursor-pointer"
                          >
                            + Select
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Compatibility & Live Checkout Panel */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Live Price & Action Card */}
            <div className="bg-gradient-to-br from-[#FFF8F3] via-[#FFFFFF] to-[#FFF5EB] border-2 border-[#783D1B]/30 rounded-2xl p-5 shadow-sm sticky top-24">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#783D1B]">
                Live Build Valuation
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#172B4D]">
                  {formatINR(totalPrice)}
                </span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  GST 18% Included
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Zero assembly labor fee. Free professional cable management.
              </p>

              {/* Compatibility Check Status */}
              <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2 mb-2">
                  {compatibility.isCompatible ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>All Components Compatible</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Compatibility Notice</span>
                    </div>
                  )}
                </div>

                {!compatibility.isCompatible && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900 space-y-1 mb-3">
                    {compatibility.issues.map((issue, idx) => (
                      <p key={idx}>• {issue}</p>
                    ))}
                  </div>
                )}

                {/* Estimated Wattage Meter */}
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-3 mt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[#64748B] flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-[#FFB020]" />
                      Estimated System Load:
                    </span>
                    <span className="font-extrabold text-[#172B4D]">
                      ~{compatibility.totalWattage} Watts
                    </span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#783D1B] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (compatibility.totalWattage / 850) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#64748B] mt-1 block">
                    Recommended PSU: {compatibility.recommendedPsuWattage}W or higher
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 space-y-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={partsArray.length === 0}
                  className="w-full py-3 bg-[#783D1B] hover:bg-[#5C2E13] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add Complete PC Build to Cart</span>
                </button>

                <a
                  href={whatsappBuildUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#FFFFFF] hover:bg-[#F5F7FA] border border-[#E5E7EB] text-[#172B4D] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Order / Review on WhatsApp</span>
                </a>
              </div>

              {/* Perks */}
              <div className="mt-4 pt-3 border-t border-[#E5E7EB] space-y-1.5 text-[11px] text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>3-Year Doorstep Warranty across India</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#783D1B] shrink-0" />
                  <span>BlueDart Air Insured Heavy Foam Crating</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
