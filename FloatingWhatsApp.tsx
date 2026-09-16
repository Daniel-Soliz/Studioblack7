import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { WHATSAPP_NUMBER, createWhatsAppBookingUrl } from '../data/barbershop';

export const FloatingWhatsApp: React.FC = () => {
  const [tooltipVisible, setTooltipVisible] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3 pointer-events-none">
      {/* Subtle Tooltip bubble */}
      {tooltipVisible && (
        <div className="pointer-events-auto relative hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-amber-400/40 shadow-2xl text-xs text-zinc-200 animate-bounce-subtle">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold">Agende seu horário agora</span>
          <button
            type="button"
            onClick={() => setTooltipVisible(false)}
            className="text-zinc-400 hover:text-white p-0.5 ml-1"
            aria-label="Fechar dica"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={createWhatsAppBookingUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl shadow-emerald-500/30 hover:scale-110 hover:shadow-emerald-500/50 transition-all duration-300 focus:outline-none group"
        aria-label="Abrir conversa no WhatsApp para agendamento no Studio Black7"
      >
        {/* Subtle glowing ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 pointer-events-none" />
        <MessageCircle className="w-7 h-7 fill-white relative z-10" />
      </a>
    </div>
  );
};
