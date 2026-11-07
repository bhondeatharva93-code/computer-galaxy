import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, Truck, Wrench, Sparkles } from 'lucide-react';
import { HERO_SLIDES } from '../data/products';

interface HeroCarouselProps {
  onOpenPCBuilder: () => void;
  onSelectCategory: (category: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  onOpenPCBuilder,
  onSelectCategory,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="bg-[#FFFFFF] pt-4 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Banner Slide Container */}
        <div
          className="relative bg-gradient-to-br from-[#FFFFFF] via-[#F5F7FA] to-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px] items-center">
            
            {/* Left Content Column */}
            <div className="p-8 sm:p-12 lg:col-span-7 flex flex-col justify-center z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#783D1B] bg-[#783D1B]/10 px-3 py-1 rounded-md">
                  {slide.badge}
                </span>
                <span className="text-xs text-[#64748B] font-medium hidden sm:inline">
                  · {slide.tag}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-[#172B4D] tracking-tight leading-[1.15] mb-4">
                {slide.title}
              </h1>

              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed mb-6 max-w-xl">
                {slide.subtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {slide.id === 'slide-2' ? (
                  <button
                    onClick={onOpenPCBuilder}
                    className="px-6 py-3 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    {slide.ctaText}
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectCategory('gaming-pcs')}
                    className="px-6 py-3 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    {slide.ctaText}
                  </button>
                )}

                <button
                  onClick={onOpenPCBuilder}
                  className="px-5 py-3 bg-[#FFFFFF] hover:bg-[#F5F7FA] text-[#172B4D] text-sm font-semibold rounded-lg border border-[#E5E7EB] shadow-xs transition-colors"
                >
                  {slide.secondaryCtaText}
                </button>
              </div>

              {/* Slide Indicators */}
              <div className="flex items-center gap-2 mt-8">
                {HERO_SLIDES.map((s, index) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'w-8 bg-[#783D1B]'
                        : 'w-2 bg-[#CBD5E1] hover:bg-[#94A3B8]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Media Column */}
            <div className="lg:col-span-5 h-64 lg:h-full relative overflow-hidden flex items-center justify-center p-4 lg:p-6 bg-gradient-to-t lg:bg-gradient-to-l from-white/40 to-transparent">
              <img
                src={slide.image}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className="w-full h-full max-h-[380px] object-cover rounded-xl shadow-md border border-[#E5E7EB] transform transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* Carousel Arrow Controls */}
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] border border-[#E5E7EB] text-[#172B4D] flex items-center justify-center shadow-sm transition-transform hover:scale-110 z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] border border-[#E5E7EB] text-[#172B4D] flex items-center justify-center shadow-sm transition-transform hover:scale-110 z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Feature Value Pillars below banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB] flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#783D1B]/10 text-[#783D1B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172B4D]">100% Genuine Hardware</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Direct authorized brand distribution with GST bill</p>
            </div>
          </div>

          <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB] flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172B4D]">Pan-India Express Safe</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Heavy foam crated packaging with BlueDart Air</p>
            </div>
          </div>

          <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB] flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100/70 text-[#FFB020] flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172B4D]">Zero Assembly Labor</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">Free cable management & stress testing included</p>
            </div>
          </div>

          <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E5E7EB] flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172B4D]">Guest Checkout Ready</h4>
              <p className="text-[11px] text-[#64748B] mt-0.5">No login or registration needed to place orders</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
