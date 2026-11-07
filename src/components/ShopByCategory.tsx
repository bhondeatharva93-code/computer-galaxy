import React from 'react';
import {
  Cpu,
  Layers,
  MonitorPlay,
  Grid,
  Zap,
  HardDrive,
  Tv,
  Monitor,
  Box,
  Fan,
  Keyboard,
  ArrowRight,
} from 'lucide-react';
import { CATEGORIES_LIST } from '../data/products';

interface ShopByCategoryProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  MonitorPlay: <MonitorPlay className="w-5 h-5" />,
  Grid: <Grid className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  HardDrive: <HardDrive className="w-5 h-5" />,
  Tv: <Tv className="w-5 h-5" />,
  Monitor: <Monitor className="w-5 h-5" />,
  Box: <Box className="w-5 h-5" />,
  Fan: <Fan className="w-5 h-5" />,
  Keyboard: <Keyboard className="w-5 h-5" />,
};

export const ShopByCategory: React.FC<ShopByCategoryProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="py-10 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Explore authentic components, pre-builts, and gaming accessories
            </p>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              className="text-xs font-semibold text-[#783D1B] hover:underline flex items-center gap-1"
            >
              View All Categories <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`text-left p-4 rounded-xl border transition-all group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#783D1B]/5 border-[#783D1B] shadow-xs ring-1 ring-[#783D1B]'
                    : 'bg-[#FFFFFF] hover:bg-[#F5F7FA] border-[#E5E7EB] hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors mb-3 ${
                    isSelected
                      ? 'bg-[#783D1B] text-white'
                      : 'bg-[#F5F7FA] text-[#783D1B] group-hover:bg-[#FFFFFF]'
                  }`}
                >
                  {ICON_MAP[cat.icon] || <Cpu className="w-5 h-5" />}
                </div>

                <div>
                  <h3
                    className={`text-xs font-bold leading-snug transition-colors ${
                      isSelected
                        ? 'text-[#783D1B]'
                        : 'text-[#172B4D] group-hover:text-[#783D1B]'
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{cat.count}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
