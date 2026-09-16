import React from 'react';
import { Award, Sparkles, Shield, HeartHandshake } from 'lucide-react';
import { BRAND_NAME } from '../data/barbershop';

export const AboutSection: React.FC = () => {
  const pillars = [
    {
      title: 'Técnica',
      desc: 'Cortes milimetricamente desenhados e pigmentação de alta definição.',
      icon: Award,
    },
    {
      title: 'Cuidado',
      desc: 'Atenção aos mínimos detalhes e à saúde do couro cabeludo e barba.',
      icon: Shield,
    },
    {
      title: 'Estilo',
      desc: 'Visagismo alinhado à sua personalidade e ao seu estilo pessoal.',
      icon: Sparkles,
    },
    {
      title: 'Atendimento',
      desc: 'Recepção cordial, ambiente climatizado e respeito ao seu tempo.',
      icon: HeartHandshake,
    },
  ];

  return (
    <section id="sobre" className="py-20 bg-[#0c0c10] border-y border-zinc-850/80 relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold">
            Sobre o {BRAND_NAME}
          </span>
          <h2 className="font-['Cinzel'] text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Mais que um corte. Uma experiência.
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3" />
        </div>

        {/* Narrative Block */}
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-6">
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              O Studio Black7 nasceu da visão de <strong className="text-white font-semibold">Ray Black7 (Ray Silva)</strong>, profissional apaixonado por transformação visual e autoestima. O espaço foi criado com o objetivo de oferecer mais do que um simples corte: uma experiência premium, baseada em técnica, cuidado, estilo e atendimento.
            </p>

            <blockquote className="p-5 rounded-xl bg-black/60 border-l-4 border-amber-400 text-zinc-200 text-sm sm:text-base italic leading-relaxed">
              &ldquo;Cada detalhe é pensado para que o cliente saia da cadeira não apenas com um novo visual, mas com mais confiança.&rdquo;
            </blockquote>
          </div>

          {/* 4 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-amber-400/30 transition-all duration-300 space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center group-hover:border-amber-400/50 group-hover:bg-amber-400/10 transition-colors">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="font-['Cinzel'] font-bold text-white text-base tracking-wide">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
