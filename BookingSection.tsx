import React from 'react';
import { MessageCircle, Sparkles, Clock, ShieldCheck, PhoneCall } from 'lucide-react';
import { WHATSAPP_NUMBER, createWhatsAppBookingUrl } from '../data/barbershop';

export const BookingSection: React.FC = () => {
  return (
    <section id="agendamento" className="py-20 bg-gradient-to-b from-[#09090d] via-[#121218] to-[#09090d] border-y border-zinc-850 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transformação &amp; Estilo</span>
          </div>
          <h2 className="font-['Cinzel'] text-3xl sm:text-5xl font-black text-white tracking-tight">
            Seu próximo visual começa aqui.
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 font-medium">
            Escolha seu serviço e agende seu horário com praticidade.
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
        </div>

        {/* WhatsApp Primary Booking Card (Centered & Highlighted) */}
        <div className="max-w-xl mx-auto text-left">
          <div className="p-7 sm:p-9 rounded-2xl bg-zinc-900/90 border-2 border-amber-400/60 shadow-2xl shadow-amber-500/10 flex flex-col justify-between space-y-7 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all pointer-events-none" />

            <div className="space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
                  <MessageCircle className="w-7 h-7 fill-emerald-400" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400 text-zinc-950 shadow-md">
                  Canal Oficial
                </span>
              </div>

              <div>
                <h3 className="font-['Cinzel'] text-2xl font-bold text-white">
                  Agendamento via WhatsApp
                </h3>
                <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mt-1">
                  Atendimento direto e imediato
                </p>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                Atendimento personalizado com a equipe do Studio Black7. Escolha o serviço, data e horário desejado com confirmação rápida e sem complicação.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-zinc-800 text-xs text-zinc-300">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Seg a Sáb: 09h–12h / 13h30–21h</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-zinc-800 text-xs text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Confirmação garantida</span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-zinc-400 uppercase tracking-wider">Número WhatsApp</p>
                <p className="text-base font-mono font-bold text-amber-400">
                  {WHATSAPP_NUMBER}
                </p>
              </div>
            </div>

            <a
              href={createWhatsAppBookingUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:brightness-105 hover:scale-[1.01] transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-zinc-950" />
              <span>Agendar pelo WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
