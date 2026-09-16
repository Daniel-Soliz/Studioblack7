import React from 'react';
import { Instagram, MessageCircle, MapPin, Clock, Scissors, Heart } from 'lucide-react';
import { 
  BRAND_NAME, 
  INSTAGRAM_STUDIO, 
  INSTAGRAM_RAY, 
  INSTAGRAM_STUDIO_URL, 
  INSTAGRAM_RAY_URL, 
  ADDRESS, 
  BUSINESS_HOURS, 
  createWhatsAppBookingUrl 
} from '../data/barbershop';

export const Footer: React.FC = () => {
  const navLinks = [
    { label: 'Início', href: '#inicio' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Localização', href: '#localizacao' },
    { label: 'Contato', href: '#contato' },
    { label: 'Agendar', href: '#agendamento' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="bg-[#050507] border-t border-zinc-850 pt-16 pb-12 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400/20 via-zinc-900 to-black border border-amber-400/40 flex items-center justify-center">
                <span className="font-['Cinzel'] font-black text-base text-amber-400">7</span>
              </div>
              <span className="font-['Cinzel'] font-black text-lg tracking-widest text-white">
                {BRAND_NAME}
              </span>
            </div>

            <p className="text-zinc-400 leading-relaxed text-xs max-w-sm">
              Barbearia premium na Zona Norte de São Paulo. Estilo, elegância e motivação em cada detalhe.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={INSTAGRAM_STUDIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-amber-400 hover:border-amber-400/40 transition-colors"
                title="Instagram da Barbearia"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href={INSTAGRAM_RAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-amber-400 hover:border-amber-400/40 transition-colors"
                title="Instagram de Ray Black7"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href={createWhatsAppBookingUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-emerald-400 hover:border-emerald-400/40 transition-colors"
                title="WhatsApp Oficial"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-['Cinzel'] font-bold text-white text-sm uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="hover:text-amber-400 transition-colors text-xs inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Location & Hours */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="font-['Cinzel'] font-bold text-white text-sm uppercase tracking-wider">
              Localização &amp; Horários
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2 text-zinc-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{ADDRESS.street}, {ADDRESS.neighborhood}, {ADDRESS.zone} — São Paulo/SP</span>
              </div>

              <div className="flex items-start gap-2 text-zinc-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p>Seg–Sex: 09h–12h / 13h30–21h</p>
                  <p>Sáb: 09h–12h / 13h30–21h</p>
                  <p className="text-zinc-500">Dom: Fechado</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={createWhatsAppBookingUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Agendar horário no WhatsApp ›</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Signature */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-zinc-400">
          <p>
            &copy; 2026 {BRAND_NAME} — Rayblack7. Todos os direitos reservados.
          </p>
          <p className="flex items-center justify-center gap-1">
            <span>Feito com elegância na Zona Norte de SP.</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
