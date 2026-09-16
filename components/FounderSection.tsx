import React from 'react';
import { Instagram, Award, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';
import { BARBER_PORTRAIT_IMG } from '../assets/images';
import { createWhatsAppBookingUrl } from '../data/barbershop';
import { useStore } from '../context/StoreContext';
import { getAssetUrl } from '../utils';

export const FounderSection: React.FC = () => {
  const { content, settings } = useStore();

  const founderImage = content.founderImageUrl || settings.founderImageUrl || BARBER_PORTRAIT_IMG;
  const instagramHandle = settings.instagramRay || '@rayblakc7';
  const instagramUrl = `https://instagram.com/${instagramHandle.replace('@', '')}`;

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Premium Portrait */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative mx-auto max-w-md">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/30 p-3 shadow-2xl shadow-black/80">
                <div className="relative aspect-3/4 sm:aspect-4/5 rounded-xl overflow-hidden group">
                  <img
                    src={getAssetUrl(founderImage)}
                    alt="Ray Silva (Ray Black7) - Fundador do Studio Black7"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/Ray.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/25 to-transparent" />
                  
                  {/* Floating Badge on Image */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/85 backdrop-blur-md border border-amber-400/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-amber-400 font-extrabold">Especialidade</p>
                      <p className="text-xs font-bold text-white">Pigmentação Capilar</p>
                    </div>
                    <span className="text-xs font-extrabold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-400/30">
                      4 Anos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Founder Narrative & Highlights */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>O Fundador</span>
              </div>
              <h2 className="font-['Cinzel'] text-3xl sm:text-4xl font-black text-white tracking-tight">
                Ray Silva / Ray Black7
              </h2>
              <p className="text-sm uppercase tracking-widest text-amber-400 font-bold">
                Especialista em Pigmentação Capilar &amp; Visagismo
              </p>
            </div>

            <div className="space-y-4 text-zinc-300 text-sm sm:text-base leading-relaxed">
              <p>
                Com <strong>4 anos de profissão</strong> dedicados ao aprimoramento contínuo da arte da barbearia, Ray Silva (conhecido como <strong>Ray Black7</strong>) consolidou-se como um profissional apaixonado por transformação visual, estilo e autoestima na Zona Norte de São Paulo.
              </p>
              <p>
                Sua especialização em <strong>pigmentação capilar</strong> destaca-se pela alta precisão técnica: um método que devolve linhas nítidas, preenche falhas naturais e valoriza o contorno do rosto de maneira marcante e harmônica.
              </p>
            </div>

            {/* Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-white">4 Anos de Profissão</h3>
                  <p className="text-[11px] text-zinc-400">Técnica apurada e dedicação integral</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-white">Pigmentação Capilar</h3>
                  <p className="text-[11px] text-zinc-400">Especialista de referência em acabamento</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-white">Transformação &amp; Autoestima</h3>
                  <p className="text-[11px] text-zinc-400">Foco na valorização da imagem do cliente</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-white">Atendimento Personalizado</h3>
                  <p className="text-[11px] text-zinc-400">Cuidado exclusivo em cada corte</p>
                </div>
              </div>
            </div>

            {/* Social & Booking Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={createWhatsAppBookingUrl('Corte + Pigmentação')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-105 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-zinc-950" />
                <span>Agendar com Ray Black7</span>
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 hover:text-amber-400 text-xs font-bold tracking-wider transition-colors"
              >
                <Instagram className="w-4 h-4 text-amber-400" />
                <span>Instagram {instagramHandle}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
