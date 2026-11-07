import React from 'react';
import { MessageCircle } from 'lucide-react';
import { createWhatsAppChatUrl } from '../utils/cart';

export const WhatsAppFloatingButton: React.FC = () => {
  const whatsappUrl = createWhatsAppChatUrl(
    'Hello Computer Galaxy, I am looking to buy PC components / gaming rig and need expert advice.'
  );

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group hover:scale-105"
      aria-label="Chat with Computer Galaxy on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 stroke-[2.2]" />
      <span className="text-xs font-bold hidden sm:inline whitespace-nowrap">
        Chat with PC Expert
      </span>
    </a>
  );
};
