import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, Sparkles, Scissors, Clock } from 'lucide-react';
import { isCurrentlyOpen } from '../data/barbershop';
import { useStore } from '../context/StoreContext';
import { getAssetUrl } from '../utils';

export const Hero: React.FC = () => {
  const { content, settings } = useStore();
  const status = isCurrentlyOpen();

  const heroTitle = content.heroTitle || 'Mais do que um corte, uma experiência.';
  const heroDescription = content.heroSubtitle || 
    'No Studio Black7, cada detalhe é pensado para valorizar seu estilo, sua presença e sua confiança. Técnica, precisão e atendimento de alto padrão em um só lugar.';
  const heroImage = content.heroImageUrl || settings.heroImageUrl || '/images/ray_barber_1789410748280.jpg';

  const handleScrollToServices = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('servicos');
    if (el) {
      const headerOffset = 80;
      const elPos = el.getBoundingClientRect().top;
      const offsetPos = elPos + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPos, behavior: 'smooth' });
      window.history.pushState(null, '', '#servicos');
    } else {
      window.location.href = '/servicos';
    }
  };

  return (
    <section id="inicio" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Subtle Atmospheric Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-yellow-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Status & Location Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6 justify-center lg:justify-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-amber-400/30 backdrop-blur-sm text-xs text-amber-300 font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="w-1.5 h-1.5 -ml-3.5 rounded-full bg-amber-400" />
            <span className="tracking-wide">{status.message}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Zona Norte · São Paulo</span>
          </div>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] font-black text-amber-400">
                STUDIO BLACK7 · EXPERIÊNCIA &amp; ALTA BARBEARIA
              </span>
              <h1 className="font-['Cinzel'] text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.12]">
                {heroTitle}
              </h1>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 max-w-2xl mx-auto lg:mx-0 backdrop-blur-sm shadow-xl">
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-normal">
                {heroDescription}
              </p>
            </div>

            {/* Main CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#servicos"
                id="hero-btn-servicos"
                onClick={handleScrollToServices}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                title="Conhecer Nossos Serviços"
              >
                <Scissors className="w-4 h-4 text-zinc-950" />
                <span>Nossos Serviços</span>
              </a>

              <Link
                to="/loja"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-400/50 text-white hover:text-amber-300 font-bold text-xs uppercase tracking-widest transition-all duration-200 shadow-md"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Linha de Produtos</span>
              </Link>
            </div>

            {/* Micro Pillars */}
            <div className="pt-4 grid grid-cols-3 gap-3 max-w-xl mx-auto lg:mx-0 text-left border-t border-zinc-800/80">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Estilo</p>
                <p className="text-[11px] text-zinc-400">Design sob medida</p>
              </div>
              <div className="space-y-0.5 border-l border-zinc-800 pl-3">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Elegância</p>
                <p className="text-[11px] text-zinc-400">Ambiente exclusivo</p>
              </div>
              <div className="space-y-0.5 border-l border-zinc-800 pl-3">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Precisão</p>
                <p className="text-[11px] text-zinc-400">Degradê &amp; Pigmentação</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase with Ray's Portrait */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Glow Border */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/30 p-2.5 shadow-2xl shadow-black/80">
                <div className="relative aspect-4/5 rounded-xl overflow-hidden group">
                  <img
                    src={getAssetUrl(heroImage)}
                    alt="Ray Silva (Ray Black7) - Fundador do Studio Black7"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/ray_barber_1789410748280.jpg';
                    }}
                  />
                  
                  {/* Subtle Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-85" />

                  {/* Badges on Hero Image */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>#1 Pigmentação Capilar</span>
                  </div>

                  {/* Bottom Image Caption */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-['Cinzel'] font-bold text-white text-base">Ray Silva</p>
                        <p className="text-xs text-amber-400 font-semibold tracking-wide">Ray Black7 · Fundador</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        4 Anos de Profissão
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Background Ring */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-amber-500/10 via-transparent to-yellow-500/10 blur-xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
