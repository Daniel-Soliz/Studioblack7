import React from 'react';
import { MessageCircle, Instagram, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import { 
  WHATSAPP_NUMBER, 
  INSTAGRAM_STUDIO, 
  INSTAGRAM_RAY, 
  INSTAGRAM_STUDIO_URL, 
  INSTAGRAM_RAY_URL, 
  ADDRESS, 
  createWhatsAppBookingUrl 
} from '../data/barbershop';

export const ContactSection: React.FC = () => {
  return (
    <section id="contato" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold">
            Canais de Atendimento
          </span>
          <h2 className="font-['Cinzel'] text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Contato
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-medium">
            Fale diretamente com nossa equipe e garanta seu horário no Studio Black7.
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* WhatsApp Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-6 h-6 fill-emerald-400" />
              </div>
              <h3 className="font-['Cinzel'] text-lg font-bold text-white">
                WhatsApp Oficial
              </h3>
              <p className="text-xs text-zinc-400">
                Agendamentos, dúvidas e atendimento prioritário.
              </p>
              <p className="text-sm font-mono font-bold text-amber-400">
                {WHATSAPP_NUMBER}
              </p>
            </div>

            <a
              href={createWhatsAppBookingUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-emerald-500/30"
            >
              <span>Chamar no WhatsApp</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Instagram Barbearia */}
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Instagram className="w-6 h-6" />
              </div>
              <h3 className="font-['Cinzel'] text-lg font-bold text-white">
                Instagram da Barbearia
              </h3>
              <p className="text-xs text-zinc-400">
                Acompanhe o perfil oficial do Studio Black7.
              </p>
              <p className="text-sm font-semibold text-amber-400">
                @{INSTAGRAM_STUDIO}
              </p>
            </div>

            <a
              href={INSTAGRAM_STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-amber-400 text-zinc-200 hover:text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-zinc-700 hover:border-amber-400"
            >
              <span>Seguir Barbearia</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Instagram Ray */}
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Instagram className="w-6 h-6" />
              </div>
              <h3 className="font-['Cinzel'] text-lg font-bold text-white">
                Instagram de Ray Black7
              </h3>
              <p className="text-xs text-zinc-400">
                Perfil do fundador e especialista em pigmentação.
              </p>
              <p className="text-sm font-semibold text-amber-400">
                @{INSTAGRAM_RAY}
              </p>
            </div>

            <a
              href={INSTAGRAM_RAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-amber-400 text-zinc-200 hover:text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-zinc-700 hover:border-amber-400"
            >
              <span>Seguir @{INSTAGRAM_RAY}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Address Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-['Cinzel'] text-lg font-bold text-white">
                Endereço
              </h3>
              <p className="text-xs text-zinc-400">
                {ADDRESS.street} · {ADDRESS.neighborhood}
              </p>
              <p className="text-xs font-semibold text-amber-400">
                {ADDRESS.zone} · São Paulo/SP
              </p>
            </div>

            <a
              href={ADDRESS.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-amber-400 text-zinc-200 hover:text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-zinc-700 hover:border-amber-400"
            >
              <span>Abrir no Mapa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
