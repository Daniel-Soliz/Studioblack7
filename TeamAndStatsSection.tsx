import React from 'react';
import { Award, Users, Scissors, Sparkles, CheckCircle2 } from 'lucide-react';
import { STATS, TEAM, createWhatsAppBookingUrl } from '../data/barbershop';

export const TeamAndStatsSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#0a0a0e] border-y border-zinc-850/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* STATS / DIFERENCIAIS */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold">
              Tradição & Maestria
            </span>
            <h2 className="font-['Cinzel'] text-2xl sm:text-3xl lg:text-4xl font-black text-white">
              Diferenciais em Números
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Excelência comprovada na bancada e reconhecimento na Zona Norte de São Paulo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATS.map((stat, idx) => (
              <div
                key={stat.label}
                className="relative p-8 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 group overflow-hidden text-center shadow-lg"
              >
                {/* Background Subtle Gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />

                <div className="relative space-y-2">
                  <div className="font-['Cinzel'] text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 tracking-tight">
                    {stat.value}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-['Cinzel'] tracking-wide">
                    {stat.label}
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    {stat.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EQUIPE */}
        <div className="pt-6 border-t border-zinc-900">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold">
              Profissionais
            </span>
            <h2 className="font-['Cinzel'] text-2xl sm:text-3xl lg:text-4xl font-black text-white">
              Nossa Equipe
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Profissionais dedicados ao corte de precisão, estilo e valorização da sua autoestima.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {TEAM.map((member) => (
              <div
                key={member.id}
                className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-400/30 transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-6 group"
              >
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 border-2 border-amber-500/30 shadow-md">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                      {member.experience}
                    </span>
                  </div>

                  <h3 className="font-['Cinzel'] text-lg sm:text-xl font-bold text-white">
                    {member.name}
                  </h3>

                  <p className="text-xs font-semibold text-amber-400">
                    {member.role}
                  </p>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {member.description}
                  </p>

                  {member.specialty && (
                    <div className="pt-2 flex items-center gap-1.5 text-[11px] text-zinc-300">
                      <Scissors className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-medium text-zinc-400">Especialidade: <strong className="text-zinc-200">{member.specialty}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
