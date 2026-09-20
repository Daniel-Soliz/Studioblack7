import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, ShoppingBag, ArrowUpRight, Sparkles } from 'lucide-react';
import { Header } from '../components';

export const HomePage: React.FC = () => {
  return (
    <div className="h-screen overflow-hidden bg-[#08080a] text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header />

      <main className="h-screen pt-[96px] sm:pt-[108px] px-4 sm:px-6 lg:px-8 pb-5 sm:pb-7">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="flex-1 min-h-0 grid lg:grid-cols-[0.78fr_1.22fr] gap-4 lg:gap-6">
            <section className="relative overflow-hidden rounded-[28px] border border-zinc-800/80 bg-gradient-to-br from-zinc-950 via-[#0d0d10] to-[#111114] p-5 sm:p-7 lg:p-9 flex flex-col justify-between">
              <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-400/[0.06] blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.22em] text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Studio Black7
                </div>
                <h1 className="font-['Cinzel'] text-[clamp(2.15rem,5vw,4.9rem)] leading-[0.94] font-black tracking-tight text-white mt-4 max-w-3xl">
                  Seu estilo começa aqui.
                </h1>
                <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
                  Escolha como quer entrar no Studio Black7. Sem enrolação: atendimento da barbearia ou loja de produtos.
                </p>
              </div>

              <div className="relative hidden lg:block pt-6">
                <div className="w-14 h-px bg-amber-400 mb-4" />
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  Barbearia · Estilo · Produtos
                </p>
              </div>
            </section>

            <section className="grid grid-rows-2 gap-4 min-h-0">
              <Link
                to="/servicos"
                className="group relative overflow-hidden rounded-[28px] border border-zinc-800 bg-[#101014] hover:border-amber-400/50 transition-all duration-500 p-5 sm:p-7 lg:p-8 flex items-center justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.08] via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center gap-4 sm:gap-6 min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border border-amber-400/25 bg-amber-400/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500">
                    <Scissors className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-amber-400">Barbearia</span>
                    <h2 className="font-['Cinzel'] text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-1">Serviços</h2>
                    <p className="hidden sm:block text-sm text-zinc-400 mt-2">Conheça os serviços e escolha seu próximo visual.</p>
                  </div>
                </div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-zinc-700 flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:border-amber-400 transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300 group-hover:text-black transition-colors" />
                </div>
              </Link>

              <Link
                to="/loja"
                className="group relative overflow-hidden rounded-[28px] border border-zinc-800 bg-[#101014] hover:border-amber-400/50 transition-all duration-500 p-5 sm:p-7 lg:p-8 flex items-center justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.025] via-transparent to-amber-500/[0.06] group-hover:from-amber-500/[0.06] transition-all duration-500" />
                <div className="relative flex items-center gap-4 sm:gap-6 min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border border-zinc-700 bg-black/30 flex items-center justify-center shrink-0 group-hover:border-amber-400/40 group-hover:scale-105 transition-all duration-500">
                    <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-100 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-zinc-500 group-hover:text-amber-400 transition-colors">Produtos Black7</span>
                    <h2 className="font-['Cinzel'] text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-1">Loja</h2>
                    <p className="hidden sm:block text-sm text-zinc-400 mt-2">Explore produtos para cabelo, barba e cuidados pessoais.</p>
                  </div>
                </div>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-zinc-700 flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:border-amber-400 transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300 group-hover:text-black transition-colors" />
                </div>
              </Link>
            </section>
          </div>

          <div className="shrink-0 pt-3 sm:pt-4 flex items-center justify-between gap-4 text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-zinc-600">
            <span>Studio Black7</span>
            <span className="hidden sm:inline">Escolha uma opção para continuar</span>
          </div>
        </div>
      </main>
    </div>
  );
};
