import React, { useState } from 'react';
import { MessageCircle, Scissors, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { createWhatsAppBookingUrl } from '../data/barbershop';

export const ServicesSection: React.FC = () => {
  const { services } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Cortes', 'Barba', 'Penteado / Acabamento', 'Química / Alisamento', 'Coloração'];

  const activeServices = services.filter(s => s.status !== 'inactive');
  const filteredServices = selectedCategory === 'Todos'
    ? activeServices
    : activeServices.filter((s) => s.category === selectedCategory);

  return (
    <section id="servicos" className="py-20 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold">
            Tabela Oficial de Atendimentos
          </span>
          <h2 className="font-['Cinzel'] text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Serviços
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 font-medium">
            Precisão, técnica e estilo em cada atendimento.
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
        </div>

        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="relative rounded-2xl bg-zinc-900/60 border border-zinc-800/90 hover:border-amber-400/40 hover:bg-zinc-900/90 transition-all duration-300 flex flex-col overflow-hidden group shadow-lg"
            >
              {service.image && (
                <div className="aspect-[16/10] overflow-hidden bg-black">
                  <img
                    src={service.image}
                    alt={`Exemplo de ${service.name}`}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="p-6 flex flex-col justify-between flex-1">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-400/90 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                      {service.category}
                    </span>
                    {service.popular && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                        <Sparkles className="w-3 h-3" />
                        <span>Mais Pedido</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-['Cinzel'] text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {service.name}
                    </h3>
                    {service.image && (
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
                        Imagem de referência do trabalho
                      </p>
                    )}
                    {service.description && (
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Valor Oficial</span>
                    <span className="font-mono font-black text-xl text-amber-400">
                      {service.price}
                    </span>
                  </div>

                  <a
                    href={createWhatsAppBookingUrl(service.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 group-hover:bg-amber-400 text-zinc-200 group-hover:text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm"
                    title={`Agendar ${service.name} no WhatsApp`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Agendar</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href={createWhatsAppBookingUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:brightness-105 transition-all"
          >
            <Scissors className="w-4 h-4 text-zinc-950" />
            <span>Consultar Horários e Agendar Serviço</span>
          </a>
        </div>
      </div>
    </section>
  );
};
