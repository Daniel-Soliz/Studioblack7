import React from 'react';
import { BRAND_NAME, BRAND_POSITIONING_QUOTE } from '../data/barbershop';

export const PositioningSection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#08080a] via-[#101015] to-[#08080a] relative overflow-hidden border-y border-zinc-850/80">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-amber-500/5 rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6">
          {/* Quote Mark */}
          <div className="flex justify-center">
            <span className="font-['Cinzel'] text-6xl sm:text-7xl font-black text-amber-400/40 select-none leading-none">
              &ldquo;
            </span>
          </div>

          <h2 className="font-['Cinzel'] text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-snug sm:leading-tight max-w-4xl mx-auto">
            {BRAND_POSITIONING_QUOTE}
          </h2>

          <div className="pt-4 flex flex-col items-center justify-center space-y-1">
            <span className="h-0.5 w-12 bg-amber-400 mb-2" />
            <span className="font-['Cinzel'] text-base sm:text-lg font-black tracking-widest text-amber-400 uppercase">
              {BRAND_NAME}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold">
              Rayblack7 · Zona Norte de São Paulo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
