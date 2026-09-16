import React from 'react';
import { Instagram, Star, Users, ExternalLink, ShieldCheck } from 'lucide-react';
import { INSTAGRAM_RAY, INSTAGRAM_STUDIO, INSTAGRAM_RAY_URL, INSTAGRAM_STUDIO_URL } from '../data/barbershop';

export const SocialProofSection: React.FC = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold">
            Presença Digital &amp; Comunidade
          </span>
          <h2 className="font-['Cinzel'] text-3xl sm:text-4xl font-black text-white tracking-tight">
            Nossas Redes Oficiais
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-medium">
            Atendimento premium e experiência única comprovada a cada corte na Zona Norte.
          </p>
        </div>

        {/* 5-Star Experience Banner */}
        <div className="max-w-3xl mx-auto mb-12 p-6 rounded-2xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-900/90 border border-amber-400/30 text-center space-y-3 shadow-xl">
          <div className="flex items-center justify-center gap-1.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <h3 className="font-['Cinzel'] text-xl font-bold text-white">
            Atendimento Premium &amp; Experiência Única
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            Avaliação máxima pelo padrão de atendimento, pontualidade, ambiente acolhedor e técnicas de ponta na Zona Norte de São Paulo.
          </p>
        </div>

        {/* Instagram Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Ray's Instagram Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Instagram className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  Fundador
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-['Cinzel']">
                  Perfil Pessoal do Fundador
                </h3>
                <p className="text-sm font-semibold text-amber-400 mt-0.5">
                  @{INSTAGRAM_RAY}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-bold text-zinc-200">Aproximadamente 6 mil seguidores</span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Acompanhe a rotina, convenções de barbearia, técnicas de pigmentação capilar e bastidores da bancada de Ray Black7.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-850">
              <a
                href={INSTAGRAM_RAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-amber-400 text-zinc-200 hover:text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all duration-200"
              >
                <span>Acessar @{INSTAGRAM_RAY}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Studio's Instagram Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Instagram className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  Barbearia Oficial
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-['Cinzel']">
                  Perfil Oficial do Studio Black7
                </h3>
                <p className="text-sm font-semibold text-amber-400 mt-0.5">
                  @{INSTAGRAM_STUDIO}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-bold text-zinc-200">Aproximadamente 197+ seguidores</span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Fotos de cortes, avisos de horários, novidades do espaço e a identidade visual da barbearia na Zona Norte de SP.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-850">
              <a
                href={INSTAGRAM_STUDIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-amber-400 text-zinc-200 hover:text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all duration-200"
              >
                <span>Acessar @{INSTAGRAM_STUDIO}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
