import React, { useState } from 'react';
import { MessageCircle, Scissors, Sparkles, Clock3 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const realWorkImages = [
  { src: `${import.meta.env.BASE_URL}services/studio-black7-work-1.webp`, alt: 'Corte masculino com acabamento e degradê - Studio Black7' },
  { src: `${import.meta.env.BASE_URL}services/studio-black7-work-2.webp`, alt: 'Acabamento frontal e penteado masculino - Studio Black7' },
  { src: `${import.meta.env.BASE_URL}services/studio-black7-work-3.webp`, alt: 'Penteado masculino visto de cima - Studio Black7' },
  { src: `${import.meta.env.BASE_URL}services/studio-black7-work-4.webp`, alt: 'Resultado final de corte masculino - Studio Black7' }
];

export const ServicesSection: React.FC = () => {
  const { services, settings } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Cortes', 'Barba', 'Penteado / Acabamento', 'Química / Alisamento', 'Coloração'];

  const categoryOrder = ['Cortes', 'Barba', 'Penteado / Acabamento', 'Química / Alisamento', 'Coloração'];

  const activeServices = services
    .filter((s) => {
      const normalizedName = s.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      return s.status !== 'inactive' && !normalizedName.includes('pigmentacao capilar');
    })
    .sort((a, b) => {
      const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      if (categoryDiff !== 0) return categoryDiff;
      return (a.order ?? 999) - (b.order ?? 999);
    });

  const filteredServices = selectedCategory === 'Todos'
    ? activeServices
    : activeServices.filter((s) => s.category === selectedCategory);

  const whatsappRaw = (settings.whatsappRaw || settings.whatsapp || '').replace(/\D/g, '');

  const createServiceWhatsAppUrl = (serviceName: string, price: string, duration?: string) => {
    const message = [
      'Olá! Vim pelo site do Studio Black7.',
      '',
      `Tenho interesse no serviço: *${serviceName}*`,
      `Valor informado: *${price}*`,
      duration ? `Duração estimada: *${duration}*` : '',
      '',
      'Gostaria de consultar os horários disponíveis.'
    ].filter(Boolean).join('\n');

    return `https://wa.me/${whatsappRaw}?text=${encodeURIComponent(message)}`;
  };

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
            Escolha o serviço desejado e fale diretamente com o Studio Black7 pelo WhatsApp.
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
              <div className="aspect-[16/10] overflow-hidden bg-black">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={`Exemplo de ${service.name}`}
                    className="w-full h-full group-hover:scale-[1.02] transition-transform duration-300"
                    style={{ objectFit: service.imageFit || 'cover', objectPosition: `${service.imagePositionX ?? 50}% ${service.imagePositionY ?? 50}%` }}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-500">
                    <div className="w-12 h-12 rounded-2xl border border-amber-400/20 bg-amber-400/10 flex items-center justify-center">
                      <Scissors className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-zinc-500">
                      Studio Black7
                    </span>
                  </div>
                )}
              </div>

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
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
                      {service.image ? 'Imagem de referência do trabalho' : 'Serviço disponível no Studio Black7'}
                    </p>
                    {service.description && (
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        {service.description}
                      </p>
                    )}
                    {service.duration && (
                      <div className="inline-flex items-center gap-1.5 mt-3 text-[11px] text-zinc-400">
                        <Clock3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Duração estimada: {service.duration}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Valor Oficial</span>
                      <span className="font-mono font-black text-xl text-amber-400">
                        {service.price}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                      Atendimento via WhatsApp
                    </span>
                  </div>

                  <a
                    href={createServiceWhatsAppUrl(service.name, service.price, service.duration)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10"
                    aria-label={`Consultar ${service.name} pelo WhatsApp`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Consultar no WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <div className="text-center mb-6">
            <span className="text-[11px] uppercase tracking-[0.24em] text-amber-400 font-extrabold">
              Trabalhos realizados
            </span>
            <h3 className="font-['Cinzel'] text-2xl sm:text-3xl font-black text-white mt-2">
              Resultados Studio Black7
            </h3>
            <p className="text-sm text-zinc-400 mt-2">
              Alguns resultados reais dos nossos cortes e acabamentos.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {realWorkImages.map((image, index) => (
              <div
                key={image.src}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/25 to-transparent">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-white/90">
                    Trabalho #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
