import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

export interface PriceBrandFilterProps {
  minLimit?: number;
  maxLimit?: number;
  currentRange: [number, number];
  onChangeRange: (range: [number, number]) => void;
  selectedBrand: 'all' | 'intel' | 'amd';
  onSelectBrand: (brand: 'all' | 'intel' | 'amd') => void;
  intelCount?: number;
  amdCount?: number;
  selectedColor?: string;
  onSelectColor?: (color: string) => void;
  selectedGpu?: string;
  onSelectGpu?: (gpu: string) => void;
  selectedMonitor?: string;
  onSelectMonitor?: (monitor: string) => void;
  selectedPcType?: string;
  onSelectPcType?: (pcType: string) => void;
  title?: string;
  className?: string;
  isCardEmbedded?: boolean;
}

export const PriceBrandFilterSidebar: React.FC<PriceBrandFilterProps> = ({
  minLimit = 18000,
  maxLimit = 80000,
  currentRange,
  onChangeRange,
  selectedBrand,
  onSelectBrand,
  intelCount = 6,
  amdCount = 11,
  selectedColor = 'all',
  onSelectColor,
  selectedGpu = 'all',
  onSelectGpu,
  selectedMonitor = 'all',
  onSelectMonitor,
  selectedPcType = 'all',
  onSelectPcType,
  className = '',
  isCardEmbedded = false,
}) => {
  // Collapsible accordion states matching screenshot exactly
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isGpuOpen, setIsGpuOpen] = useState(false);
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);
  const [isPcTypeOpen, setIsPcTypeOpen] = useState(false);

  const [minVal, maxVal] = currentRange;
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  // Percentages for knob positions
  const minPercent = Math.max(0, Math.min(100, ((minVal - minLimit) / (maxLimit - minLimit)) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((maxVal - minLimit) / (maxLimit - minLimit)) * 100));

  // Pointer drag handling for ultra-smooth circular knob tracking
  const handlePointerDown = (thumb: 'min' | 'max') => (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveThumb(thumb);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (thumb: 'min' | 'max') => (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeThumb !== thumb || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const rawRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const step = 100;
    const rawVal = minLimit + rawRatio * (maxLimit - minLimit);
    const steppedVal = Math.round(rawVal / step) * step;

    if (thumb === 'min') {
      const newMin = Math.min(steppedVal, maxVal - 1000);
      onChangeRange([Math.max(minLimit, newMin), maxVal]);
    } else {
      const newMax = Math.max(steppedVal, minVal + 1000);
      onChangeRange([minVal, Math.min(maxLimit, newMax)]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setActiveThumb(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Track click to snap closest thumb
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const rawVal = minLimit + ratio * (maxLimit - minLimit);
    const step = 500;
    const clickedVal = Math.round(rawVal / step) * step;

    const distToMin = Math.abs(clickedVal - minVal);
    const distToMax = Math.abs(clickedVal - maxVal);

    if (distToMin <= distToMax) {
      const newMin = Math.min(clickedVal, maxVal - 1000);
      onChangeRange([Math.max(minLimit, newMin), maxVal]);
    } else {
      const newMax = Math.max(clickedVal, minVal + 1000);
      onChangeRange([minVal, Math.min(maxLimit, newMax)]);
    }
  };

  return (
    <div
      className={`bg-white select-none text-[#111827] ${
        isCardEmbedded
          ? 'p-3 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs'
          : 'p-1'
      } ${className}`}
    >
      {/* 1. PRICE SECTION */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer group focus:outline-none"
          aria-expanded={isPriceOpen}
        >
          <span className="text-[19px] sm:text-[20px] font-bold text-[#111827] tracking-tight">
            Price
          </span>
          <span className="text-[20px] font-normal text-[#111827] select-none leading-none pr-0.5">
            {isPriceOpen ? '—' : '+'}
          </span>
        </button>

        {isPriceOpen && (
          <div className="mt-3.5">
            {/* Horizontal Slider Track with circular white knobs matching screenshot */}
            <div
              ref={trackRef}
              onClick={handleTrackClick}
              className="relative py-3 cursor-pointer touch-none"
            >
              {/* Grey Track Bar */}
              <div className="h-[5px] bg-[#C4C7C5] rounded-full w-full relative">
                {/* Active range highlight */}
                <div
                  className="absolute top-0 bottom-0 bg-[#A0A3A0] rounded-full"
                  style={{
                    left: `${minPercent}%`,
                    width: `${Math.max(0, maxPercent - minPercent)}%`,
                  }}
                />
              </div>

              {/* Left Circular Knob */}
              <div
                onPointerDown={handlePointerDown('min')}
                onPointerMove={handlePointerMove('min')}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{ left: `${minPercent}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[22px] h-[22px] rounded-full bg-white border-2 border-[#8E918F] hover:border-[#111827] active:scale-110 shadow-xs cursor-grab active:cursor-grabbing transition-transform z-10"
                role="slider"
                aria-label="Minimum price level"
                aria-valuenow={minVal}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    onChangeRange([Math.max(minLimit, minVal - 500), maxVal]);
                  } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    onChangeRange([Math.min(maxVal - 1000, minVal + 500), maxVal]);
                  }
                }}
              />

              {/* Right Circular Knob */}
              <div
                onPointerDown={handlePointerDown('max')}
                onPointerMove={handlePointerMove('max')}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{ left: `${maxPercent}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[22px] h-[22px] rounded-full bg-white border-2 border-[#8E918F] hover:border-[#111827] active:scale-110 shadow-xs cursor-grab active:cursor-grabbing transition-transform z-20"
                role="slider"
                aria-label="Maximum price level"
                aria-valuenow={maxVal}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    onChangeRange([minVal, Math.max(minVal + 1000, maxVal - 500)]);
                  } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    onChangeRange([minVal, Math.min(maxLimit, maxVal + 500)]);
                  }
                }}
              />
            </div>

            {/* Price: ₹22,900 — ₹72,000 text exactly as in screenshot */}
            <div className="text-[14px] text-[#111827] pt-1 font-normal tracking-tight">
              Price: ₹{minVal.toLocaleString('en-IN')} — ₹{maxVal.toLocaleString('en-IN')}
            </div>
          </div>
        )}
      </div>

      {/* 2. BRAND SECTION */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setIsBrandOpen(!isBrandOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer group focus:outline-none"
          aria-expanded={isBrandOpen}
        >
          <span className="text-[19px] sm:text-[20px] font-bold text-[#111827] tracking-tight">
            Brand
          </span>
          <span className="text-[20px] font-normal text-[#111827] select-none leading-none pr-0.5">
            {isBrandOpen ? '—' : '+'}
          </span>
        </button>

        {isBrandOpen && (
          <div className="mt-3.5 space-y-2.5">
            {/* Intel option */}
            <div
              onClick={() => onSelectBrand(selectedBrand === 'intel' ? 'all' : 'intel')}
              className={`flex items-center justify-between py-1 cursor-pointer group/brand transition-colors ${
                selectedBrand === 'intel' ? 'text-[#783D1B]' : 'text-[#111827]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full inline-block transition-colors ${
                    selectedBrand === 'intel' ? 'bg-[#783D1B]' : 'bg-[#9CA3AF]'
                  }`}
                />
                <span
                  className={`text-[14px] sm:text-[15px] ${
                    selectedBrand === 'intel' ? 'font-bold' : 'font-normal'
                  }`}
                >
                  Intel
                </span>
              </div>
              <span className="text-[12px] font-sans text-[#6B7280] px-2 py-0.5 rounded-[5px] border border-[#D1D5DB] bg-white group-hover/brand:border-[#9CA3AF]">
                ({intelCount})
              </span>
            </div>

            {/* AMD option */}
            <div
              onClick={() => onSelectBrand(selectedBrand === 'amd' ? 'all' : 'amd')}
              className={`flex items-center justify-between py-1 cursor-pointer group/brand transition-colors ${
                selectedBrand === 'amd' ? 'text-[#783D1B]' : 'text-[#111827]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full inline-block transition-colors ${
                    selectedBrand === 'amd' ? 'bg-[#783D1B]' : 'bg-[#9CA3AF]'
                  }`}
                />
                <span
                  className={`text-[14px] sm:text-[15px] ${
                    selectedBrand === 'amd' ? 'font-bold' : 'font-normal'
                  }`}
                >
                  AMD
                </span>
              </div>
              <span className="text-[12px] font-sans text-[#6B7280] px-2 py-0.5 rounded-[5px] border border-[#D1D5DB] bg-white group-hover/brand:border-[#9CA3AF]">
                ({amdCount})
              </span>
            </div>

            {/* Reset active brand filter if selected */}
            {selectedBrand !== 'all' && (
              <button
                type="button"
                onClick={() => onSelectBrand('all')}
                className="text-[12px] font-semibold text-[#783D1B] hover:underline pt-1 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Show All Brands</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. COLOR SECTION */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setIsColorOpen(!isColorOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer group focus:outline-none"
          aria-expanded={isColorOpen}
        >
          <span className="text-[19px] sm:text-[20px] font-bold text-[#111827] tracking-tight">
            Color
          </span>
          <span className="text-[20px] font-normal text-[#111827] select-none leading-none pr-0.5">
            {isColorOpen ? '—' : '+'}
          </span>
        </button>

        {isColorOpen && (
          <div className="mt-3.5 space-y-2.5">
            {[
              { id: 'black', label: 'Black Obsidian', count: 8 },
              { id: 'white', label: 'Pure White Edition', count: 5 },
              { id: 'silver', label: 'Silver Metallic', count: 4 },
            ].map((col) => (
              <div
                key={col.id}
                onClick={() => onSelectColor && onSelectColor(selectedColor === col.id ? 'all' : col.id)}
                className={`flex items-center justify-between py-1 cursor-pointer group transition-colors ${
                  selectedColor === col.id ? 'text-[#783D1B]' : 'text-[#111827]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block transition-colors ${
                      selectedColor === col.id ? 'bg-[#783D1B]' : 'bg-[#9CA3AF]'
                    }`}
                  />
                  <span
                    className={`text-[14px] sm:text-[15px] ${
                      selectedColor === col.id ? 'font-bold' : 'font-normal'
                    }`}
                  >
                    {col.label}
                  </span>
                </div>
                <span className="text-[12px] font-sans text-[#6B7280] px-2 py-0.5 rounded-[5px] border border-[#D1D5DB] bg-white group-hover:border-[#9CA3AF]">
                  ({col.count})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. GRAPHICS CRD SECTION */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setIsGpuOpen(!isGpuOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer group focus:outline-none"
          aria-expanded={isGpuOpen}
        >
          <span className="text-[19px] sm:text-[20px] font-bold text-[#111827] tracking-tight">
            Graphics Crd
          </span>
          <span className="text-[20px] font-normal text-[#111827] select-none leading-none pr-0.5">
            {isGpuOpen ? '—' : '+'}
          </span>
        </button>

        {isGpuOpen && (
          <div className="mt-3.5 space-y-2.5">
            {[
              { id: 'integrated', label: 'Integrated UHD / Vega', count: 7 },
              { id: 'rtx4060', label: 'NVIDIA RTX 4060 / 4060 Ti', count: 5 },
              { id: 'rtx4070', label: 'NVIDIA RTX 4070 / Super', count: 4 },
              { id: 'rtx4080', label: 'NVIDIA RTX 4080 / 4090', count: 3 },
            ].map((gpu) => (
              <div
                key={gpu.id}
                onClick={() => onSelectGpu && onSelectGpu(selectedGpu === gpu.id ? 'all' : gpu.id)}
                className={`flex items-center justify-between py-1 cursor-pointer group transition-colors ${
                  selectedGpu === gpu.id ? 'text-[#783D1B]' : 'text-[#111827]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block transition-colors ${
                      selectedGpu === gpu.id ? 'bg-[#783D1B]' : 'bg-[#9CA3AF]'
                    }`}
                  />
                  <span
                    className={`text-[14px] sm:text-[15px] ${
                      selectedGpu === gpu.id ? 'font-bold' : 'font-normal'
                    }`}
                  >
                    {gpu.label}
                  </span>
                </div>
                <span className="text-[12px] font-sans text-[#6B7280] px-2 py-0.5 rounded-[5px] border border-[#D1D5DB] bg-white group-hover:border-[#9CA3AF]">
                  ({gpu.count})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. MONITOR SUPPORT SECTION */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setIsMonitorOpen(!isMonitorOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer group focus:outline-none"
          aria-expanded={isMonitorOpen}
        >
          <span className="text-[19px] sm:text-[20px] font-bold text-[#111827] tracking-tight">
            Monitor Support
          </span>
          <span className="text-[20px] font-normal text-[#111827] select-none leading-none pr-0.5">
            {isMonitorOpen ? '—' : '+'}
          </span>
        </button>

        {isMonitorOpen && (
          <div className="mt-3.5 space-y-2.5">
            {[
              { id: 'single', label: 'Single Screen (HDMI / VGA)', count: 9 },
              { id: 'dual', label: 'Dual Display Productivity', count: 6 },
              { id: 'triple', label: 'Triple 4K Gaming / Creator', count: 4 },
            ].map((mon) => (
              <div
                key={mon.id}
                onClick={() => onSelectMonitor && onSelectMonitor(selectedMonitor === mon.id ? 'all' : mon.id)}
                className={`flex items-center justify-between py-1 cursor-pointer group transition-colors ${
                  selectedMonitor === mon.id ? 'text-[#783D1B]' : 'text-[#111827]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block transition-colors ${
                      selectedMonitor === mon.id ? 'bg-[#783D1B]' : 'bg-[#9CA3AF]'
                    }`}
                  />
                  <span
                    className={`text-[14px] sm:text-[15px] ${
                      selectedMonitor === mon.id ? 'font-bold' : 'font-normal'
                    }`}
                  >
                    {mon.label}
                  </span>
                </div>
                <span className="text-[12px] font-sans text-[#6B7280] px-2 py-0.5 rounded-[5px] border border-[#D1D5DB] bg-white group-hover:border-[#9CA3AF]">
                  ({mon.count})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. PC TYPE SECTION */}
      <div className="mb-2">
        <button
          type="button"
          onClick={() => setIsPcTypeOpen(!isPcTypeOpen)}
          className="w-full flex items-center justify-between text-left cursor-pointer group focus:outline-none"
          aria-expanded={isPcTypeOpen}
        >
          <span className="text-[19px] sm:text-[20px] font-bold text-[#111827] tracking-tight">
            PC Type
          </span>
          <span className="text-[20px] font-normal text-[#111827] select-none leading-none pr-0.5">
            {isPcTypeOpen ? '—' : '+'}
          </span>
        </button>

        {isPcTypeOpen && (
          <div className="mt-3.5 space-y-2.5">
            {[
              { id: 'office', label: 'Home & Office Workstation', count: 8 },
              { id: 'gaming', label: 'Battle Ready Gaming Rig', count: 7 },
              { id: 'custom', label: 'Custom Engineered PC', count: 4 },
            ].map((pct) => (
              <div
                key={pct.id}
                onClick={() => onSelectPcType && onSelectPcType(selectedPcType === pct.id ? 'all' : pct.id)}
                className={`flex items-center justify-between py-1 cursor-pointer group transition-colors ${
                  selectedPcType === pct.id ? 'text-[#783D1B]' : 'text-[#111827]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full inline-block transition-colors ${
                      selectedPcType === pct.id ? 'bg-[#783D1B]' : 'bg-[#9CA3AF]'
                    }`}
                  />
                  <span
                    className={`text-[14px] sm:text-[15px] ${
                      selectedPcType === pct.id ? 'font-bold' : 'font-normal'
                    }`}
                  >
                    {pct.label}
                  </span>
                </div>
                <span className="text-[12px] font-sans text-[#6B7280] px-2 py-0.5 rounded-[5px] border border-[#D1D5DB] bg-white group-hover:border-[#9CA3AF]">
                  ({pct.count})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
