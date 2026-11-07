import React, { useState } from 'react';
import {
  X,
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
} from 'lucide-react';
import { PCPart, PCPartType, Product } from '../types';
import { PC_BUILDER_PARTS } from '../data/products';
import { formatINR, checkPCCompatibility, createWhatsAppChatUrl } from '../utils/cart';

interface CustomPCBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const CustomPCBuilderModal: React.FC<CustomPCBuilderModalProps> = ({
  isOpen,
  onClose,
  onAddBuildToCart,
}) => {
  // Pre-seed with a balanced build so user has a great starting point
  const [selectedParts, setSelectedParts] = useState<Partial<Record<PCPartType, PCPart>>>({
    cpu: PC_BUILDER_PARTS.cpu[2], // Intel i7-14700K
    motherboard: PC_BUILDER_PARTS.motherboard[0], // ASUS Z790-A
    gpu: PC_BUILDER_PARTS.gpu[1], // RTX 4080 Super
    ram: PC_BUILDER_PARTS.ram[0], // Corsair Dominator Titanium 32GB
    storage: PC_BUILDER_PARTS.storage[0], // Samsung 990 Pro 2TB
    psu: PC_BUILDER_PARTS.psu[1], // Corsair RM850e 850W
    cabinet: PC_BUILDER_PARTS.cabinet[0], // Lian Li O11 EVO
    cooler: PC_BUILDER_PARTS.cooler[0], // Corsair H150i 360mm
  });

  const [activeSlot, setActiveSlot] = useState<PCPartType>('cpu');

  if (!isOpen) return null;

  const compatibility = checkPCCompatibility(selectedParts);
  const totalPrice = Object.values(selectedParts).reduce((sum, p) => sum + (p?.price || 0), 0);
  const selectedCount = Object.values(selectedParts).filter(Boolean).length;

  const handleSelectPart = (part: PCPart) => {
    setSelectedParts((prev) => ({
      ...prev,
      [part.type]: part,
    }));
  };

  const handleRemovePart = (type: PCPartType) => {
    setSelectedParts((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  };

  const handleReset = () => {
    setSelectedParts({});
  };

  const handleAddToCart = () => {
    const buildSummaryText = Object.entries(selectedParts)
      .map(([slot, part]) => `${slot.toUpperCase()}: ${part?.name}`)
      .join(' | ');

    const customProduct: Product = {
      id: `custom-pc-${Date.now()}`,
      name: `Custom PC Rig (${selectedParts.cpu?.name || 'Custom CPU'} + ${selectedParts.gpu?.name || 'Custom GPU'})`,
      brand: 'Computer Galaxy Custom',
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
      specs: {
        'Processor': selectedParts.cpu?.name || 'Not Selected',
        'Motherboard': selectedParts.motherboard?.name || 'Not Selected',
        'Graphics Card': selectedParts.gpu?.name || 'Not Selected',
        'Memory': selectedParts.ram?.name || 'Not Selected',
        'Storage': selectedParts.storage?.name || 'Not Selected',
        'Power Supply': selectedParts.psu?.name || 'Not Selected',
        'Cabinet': selectedParts.cabinet?.name || 'Not Selected',
        'Cooler': selectedParts.cooler?.name || 'Not Selected',
        'Assembly & Testing': 'Professional White-Glove Build & 24hr Burn-In Test Included Free',
      },
      description: `Tailored custom gaming machine assembled with: ${buildSummaryText}. Backed by our 3-Year Doorstep Warranty.`,
      warranty: '3 Years Computer Galaxy Doorstep Hardware Warranty',
      modelNumber: `CG-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    onAddBuildToCart(customProduct);
    onClose();
  };

  const partsListString = Object.entries(selectedParts)
    .filter(([_, p]) => Boolean(p))
    .map(([slot, p]) => `• ${slot.toUpperCase()}: ${p?.name} (${formatINR(p?.price || 0)})`)
    .join('\n');

  const whatsappBuildUrl = createWhatsAppChatUrl(
    `Hello Computer Galaxy, I configured a custom PC build on your website!\n\n${partsListString}\n\nEstimated Power: ${compatibility.totalWattage}W\nTotal Price: ${formatINR(
      totalPrice
    )}\n\nCould you review this build compatibility and confirm parts availability?`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FFFFFF] rounded-2xl max-w-6xl w-full border border-[#E5E7EB] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFFFFF] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#783D1B] bg-[#783D1B]/10 px-2.5 py-0.5 rounded">
                Interactive Configurator
              </span>
              <span className="text-xs text-[#64748B]">Zero Labor Assembly Fee</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight mt-1">
              Custom PC Builder & Compatibility Checker
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 text-xs font-semibold text-[#64748B] hover:text-[#172B4D] hover:bg-[#F5F7FA] rounded-lg transition-colors flex items-center gap-1"
              title="Reset Build"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F5F7FA] hover:bg-[#E5E7EB] text-[#172B4D] flex items-center justify-center transition-colors"
              aria-label="Close custom PC builder"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view (Left: Component slots, Right: Part catalog for active slot) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Slots List (5 Cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[#E5E7EB] overflow-y-auto space-y-2.5 bg-[#F5F7FA]/50">
            <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2 flex items-center justify-between">
              <span>Configured Hardware ({selectedCount}/8)</span>
              <span>Price</span>
            </div>

            {PART_SLOTS.map((slot) => {
              const selected = selectedParts[slot.type];
              const isActive = activeSlot === slot.type;
              return (
                <div
                  key={slot.type}
                  onClick={() => setActiveSlot(slot.type)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FFFFFF] border-[#783D1B] shadow-xs ring-1 ring-[#783D1B]'
                      : 'bg-[#FFFFFF] hover:bg-white border-[#E5E7EB]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#F5F7FA]">{slot.icon}</div>
                      <div>
                        <span className="text-[11px] font-semibold text-[#64748B] uppercase block">
                          {slot.label}
                        </span>
                        {selected ? (
                          <span className="text-xs font-bold text-[#172B4D] line-clamp-1">
                            {selected.name}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">
                            + Select {slot.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      {selected ? (
                        <>
                          <span className="text-xs font-bold text-[#172B4D] tabular-nums">
                            {formatINR(selected.price)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePart(slot.type);
                            }}
                            className="text-[#64748B] hover:text-rose-500 p-1"
                            aria-label={`Remove ${selected.name}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] font-medium text-[#783D1B]">Choose</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Part Catalog for Active Slot (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-6 bg-[#FFFFFF]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#172B4D]">
                    Choose {PART_SLOTS.find((s) => s.type === activeSlot)?.label}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Select from verified, in-stock components with official Indian warranty
                  </p>
                </div>
              </div>

              {/* List of components available for active slot */}
              <div className="space-y-2.5">
                {(PC_BUILDER_PARTS[activeSlot] || []).map((part) => {
                  const isCurrent = selectedParts[activeSlot]?.id === part.id;
                  return (
                    <div
                      key={part.id}
                      onClick={() => handleSelectPart(part)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isCurrent
                          ? 'bg-[#783D1B]/5 border-[#783D1B] ring-1 ring-[#783D1B]'
                          : 'bg-[#FFFFFF] hover:bg-[#F5F7FA] border-[#E5E7EB]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={part.image}
                          alt={part.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-contain rounded-lg border border-[#E5E7EB] bg-[#F5F7FA] shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-[#64748B] uppercase">
                            {part.brand} {part.wattage ? `· ${part.wattage}W TDP` : ''}
                          </span>
                          <h4 className="text-xs font-bold text-[#172B4D] truncate">
                            {part.name}
                          </h4>
                          <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                            {part.specs}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-[#172B4D] tabular-nums block">
                          {formatINR(part.price)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPart(part);
                          }}
                          className={`mt-1 px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${
                            isCurrent
                              ? 'bg-[#783D1B] text-white'
                              : 'bg-[#F5F7FA] hover:bg-[#783D1B] text-[#172B4D] hover:text-white border border-[#E5E7EB]'
                          }`}
                        >
                          {isCurrent ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compatibility & Wattage Status Box */}
            <div className="pt-4 border-t border-[#E5E7EB] space-y-4">
              <div className="p-4 rounded-xl border bg-[#F5F7FA] border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {compatibility.isCompatible ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                    <span className="text-xs font-bold text-[#172B4D]">
                      {compatibility.isCompatible
                        ? 'Build Status: 100% Compatible'
                        : 'Compatibility Warning'}
                    </span>
                  </div>

                  <div className="text-xs text-[#64748B]">
                    Estimated Power:{' '}
                    <span className="font-bold text-[#172B4D] tabular-nums">
                      {compatibility.totalWattage}W
                    </span>{' '}
                    (Recommended PSU: {compatibility.recommendedPsuWattage}W)
                  </div>
                </div>

                {!compatibility.isCompatible && (
                  <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    {compatibility.issues.map((issue, idx) => (
                      <p key={idx}>• {issue}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Summary & Purchase Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-[#64748B] block">Total Build Cost (Inc. 18% GST)</span>
                  <span className="text-2xl font-extrabold text-[#172B4D] tabular-nums">
                    {formatINR(totalPrice)}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={whatsappBuildUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    WhatsApp Review
                  </a>

                  <button
                    disabled={selectedCount < 2}
                    onClick={handleAddToCart}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-[#783D1B] hover:bg-[#5C2E13] disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add Custom Rig to Cart
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
