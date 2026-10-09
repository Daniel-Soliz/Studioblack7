import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Scissors, Sparkles, Clock3 } from 'lucide-react';
import { ServicePhotoGallery } from './ServicePhotoGallery';
import { useStore } from '../context/StoreContext';

const realWorkImages = [
  { src: `${import.meta.env.BASE_URL}services/studio-black7-work-1-20260925.webp`, alt: 'Corte e barba com acabamento frontal - Studio Black7' },
  { src: `${import.meta.env.BASE_URL}services/studio-black7-work-2-revised-20260925.webp`, alt: 'Degradê e cachos masculinos - Studio Black7' },
  { src: `${import.meta.env.BASE_URL}services/studio-black7-work-3-20260925.webp`, alt: 'Corte masculino com degradê e acabamento - Studio Black7' },
  { src: `${import.meta.env.BASE_URL}services/studio-black7-work-4-shirt-20260925.webp`, alt: 'Corte masculino em perfil lateral - Studio Black7' }
  , ...[5, 6, 7, 8, 9, 10, 11, 12].map(number => ({ src: `${import.meta.env.BASE_URL}services/black7-work-${number}.webp`, alt: `Trabalho realizado no Studio Black7 - foto ${number}` }))
];

export const ServicesSection: React.FC = () => {
  const { services, settings } = useStore();
  const [carouselPaused, setCarouselPaused] = useState(false);
  const workTrack = useRef<HTMLDivElement>(null);
  const workOffset = useRef(0);
  const workWidth = useRef(0);
  const workDrag = useRef<{ pointerId: number; x: number } | null>(null);

  const moveWorkPhotos = (distance: number) => {
    const width = workWidth.current;
    if (!width || !workTrack.current) return;
    workOffset.current = ((workOffset.current + distance) % width + width) % width;
    workTrack.current.style.transform = `translateX(-${workOffset.current}px)`;
  };

  useEffect(() => {
    const track = workTrack.current;
    if (!track) return;
    const measure = () => { workWidth.current = track.scrollWidth / 2; moveWorkPhotos(0); };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    let frame = 0;
    let previous = 0;
    const animate = (time: number) => {
      if (previous && !carouselPaused && !workDrag.current) {
        moveWorkPhotos(workWidth.current * Math.min(time - previous, 50) / 60000);
      }
      previous = time;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [carouselPaused]);

  const finishWorkDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (workDrag.current?.pointerId !== event.pointerId) return;
    workDrag.current = null;
    event.currentTarget.style.cursor = 'grab';
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

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
            Escolha seu serviço, horário e profissional. Pague pelo site com Pix.
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
              <ServicePhotoGallery service={service} />

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
                        <span>Horário reservado: 1 hora por cliente</span>
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
                      Agendamento online
                    </span>
                  </div>

                  <Link
                    to={`/agendar?servico=${encodeURIComponent(service.id)}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10"
                    aria-label={`Agendar ${service.name} online`}
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>Faça seu agendamento</span>
                  </Link>
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

          <style>{`
            .black7-work-viewport { overflow: hidden; width: 100%; touch-action: pan-y; user-select: none; cursor: grab; }
            .black7-work-track { display: flex; width: max-content; will-change: transform; }
            .black7-work-group { display: flex; flex-shrink: 0; gap: 16px; padding-right: 16px; }
            .black7-work-card { width: clamp(180px, 24vw, 280px); flex-shrink: 0; }
          `}</style>
          <div className="black7-work-viewport rounded-2xl" role="region" aria-label="Fotos dos resultados Studio Black7"
            onPointerDown={event => {
              if (event.button !== 0 || workDrag.current) return;
              workDrag.current = { pointerId: event.pointerId, x: event.clientX };
              event.currentTarget.setPointerCapture(event.pointerId);
              event.currentTarget.style.cursor = 'grabbing';
            }}
            onPointerMove={event => {
              const drag = workDrag.current;
              if (!drag || drag.pointerId !== event.pointerId) return;
              moveWorkPhotos(drag.x - event.clientX);
              drag.x = event.clientX;
            }}
            onPointerUp={finishWorkDrag}
            onPointerCancel={finishWorkDrag}
            onLostPointerCapture={finishWorkDrag}
          >
            <div ref={workTrack} className="black7-work-track">
              {[false, true].map(copy => (
                <div key={String(copy)} className="black7-work-group" data-copy={String(copy)} aria-hidden={copy || undefined}>
                  {realWorkImages.map((image, index) => (
                    <div key={image.src} className="black7-work-card relative aspect-[4/5] overflow-hidden rounded-xl sm:rounded-2xl">
                      <img draggable={false} src={image.src} alt={copy ? '' : image.alt} className="absolute inset-0 w-full h-full object-cover object-center" loading="eager" decoding="async" />
                      <div className="absolute left-2 bottom-2 rounded-md bg-black/60 px-2 py-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-white/90">Trabalho #{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-center">
            <button type="button" onClick={() => setCarouselPaused(value => !value)} aria-pressed={carouselPaused} className="rounded-lg border border-amber-400/40 px-4 py-2 text-sm font-semibold text-amber-300">
              {carouselPaused ? 'Continuar fotos' : 'Pausar fotos'}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
