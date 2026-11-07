import React from 'react';
import {
  MapPin,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  MessageCircle,
  Lock,
} from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenTrackOrder?: () => void;
  onSelectCategory: (category: string) => void;
  onOpenPCBuilder: () => void;
  onNavigate?: (view: 'home' | 'basic-computers' | 'gaming-computers' | 'custom-pc') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenTrackOrder,
  onSelectCategory,
  onOpenPCBuilder,
  onNavigate,
}) => {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E5E7EB] text-[#172B4D] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#E5E7EB]">
          
          {/* Brand & Mission (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_i5kb71i5kb71i5kb_16c6252e.png"
                alt="Computer Galaxy"
                className="h-9 w-auto max-w-[200px] object-contain rounded-lg shadow-sm border border-[#783D1B]/15 bg-[#783D1B]"
              />
            </div>

            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-sm">
              India&apos;s premier destination for high-end custom gaming PCs, workstation rigs, and authentic components. Authorized distributor for Intel, AMD, ASUS ROG, MSI, NVIDIA, and Corsair.
            </p>

            <div className="space-y-1.5 text-xs text-[#64748B]">
              <div className="flex items-center gap-2 font-medium text-[#172B4D]">
                <ShieldCheck className="w-4 h-4 text-[#783D1B]" />
                <span>GST Registered: 27AACCC9876K1ZY (Tax Invoices on All Orders)</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-[#172B4D]">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Insured Doorstep Pan-India Express Delivery</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] mb-3">
              Hardware Catalog
            </h4>
            <ul className="space-y-2 text-xs text-[#64748B]">
              <li>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('basic-computers');
                    else onSelectCategory('basic-pcs');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  Basic Computers (Office & Home)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('gaming-computers');
                    else onSelectCategory('gaming-pcs');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  Gaming Desktop PCs
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                    onSelectCategory('graphics-cards');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  GeForce RTX 40-Series
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                    onSelectCategory('processors');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  Intel & AMD Processors
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                    onSelectCategory('motherboards');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  Motherboards (Z790 / B650)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('home');
                    onSelectCategory('ram-memory');
                  }}
                  className="hover:text-[#783D1B] transition-colors cursor-pointer"
                >
                  DDR5 RAM & Gen4 SSDs
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('custom-pc');
                    else onOpenPCBuilder();
                  }}
                  className="text-[#783D1B] font-semibold hover:underline cursor-pointer"
                >
                  Custom PC Builder Tool
                </button>
              </li>
            </ul>
          </div>

          {/* Store Location & Service Hubs */}
          <div id="store-location">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] mb-3">
              Store & Service Hub
            </h4>
            <div className="space-y-2.5 text-xs text-[#64748B]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#783D1B] shrink-0 mt-0.5" />
                <span>
                  Shop 14-18, IT Commercial Arcade, Lamington Road, Grant Road East, Mumbai, Maharashtra 400007
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
                <span>Monday – Saturday: 10:00 AM – 8:30 PM IST (Sunday Closed)</span>
              </div>
              <div className="text-[11px] text-[#64748B] pt-1">
                Fulfillment Centers: Mumbai, Bengaluru & Delhi
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div id="contact-store">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B4D] mb-3">
              Direct Contact
            </h4>
            <div className="space-y-2.5 text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <a
                  href="https://wa.me/917014443922"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 font-medium"
                >
                  WhatsApp: +91 70144 43922
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#64748B]" />
                <a href="mailto:support@computergalaxy.in" className="hover:text-[#783D1B]">
                  support@computergalaxy.in
                </a>
              </div>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-[#172B4D] block">
                  Express Guest Checkout
                </span>
                <span className="text-[11px] text-[#64748B]">
                  No login or customer passwords required.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Trust Seals, Payment methods, Discreet staff portal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="font-medium text-[#172B4D]">Secure Payment Partners:</span>
            <span className="px-2 py-0.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded font-semibold text-[#172B4D]">
              UPI
            </span>
            <span className="px-2 py-0.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded font-semibold text-[#172B4D]">
              RuPay
            </span>
            <span className="px-2 py-0.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded font-semibold text-[#172B4D]">
              Visa
            </span>
            <span className="px-2 py-0.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded font-semibold text-[#172B4D]">
              Mastercard
            </span>
            <span className="px-2 py-0.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded font-semibold text-[#172B4D]">
              Cash on Delivery
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>© {new Date().getFullYear()} Computer Galaxy. All rights reserved.</span>
            <span>·</span>
            {onOpenTrackOrder && (
              <>
                <button
                  onClick={onOpenTrackOrder}
                  className="text-[#64748B] hover:text-[#783D1B] flex items-center gap-1 transition-colors font-medium"
                >
                  <Truck className="w-3 h-3 text-[#783D1B]" />
                  <span>Track Consignment</span>
                </button>
                <span>·</span>
              </>
            )}
            {/* Discreet Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              className="text-[#64748B] hover:text-[#172B4D] flex items-center gap-1 transition-colors font-medium"
              title="Authorized Store Staff"
            >
              <Lock className="w-3 h-3 text-[#783D1B]" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
