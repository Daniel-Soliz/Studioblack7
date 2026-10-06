import React, { useRef, useState } from 'react';
import { Scissors } from 'lucide-react';
import { ServiceItem } from '../types';

export const ServicePhotoGallery: React.FC<{ service: ServiceItem }> = ({ service }) => {
  const photos = service.photos?.length ? service.photos : service.image ? [{ url: service.image, fit: service.imageFit, positionX: service.imagePositionX, positionY: service.imagePositionY }] : [];
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const [active, setActive] = useState(0);
  const move = (index: number) => rail.current?.scrollTo({ left: index * rail.current.clientWidth, behavior: 'smooth' });
  if (!photos.length) return <div className="aspect-[16/10] flex items-center justify-center bg-zinc-950"><Scissors className="h-8 w-8 text-amber-400" /></div>;
  return <div className="min-w-0">
    <div ref={rail} role="region" aria-label={'Fotos de ' + service.name} tabIndex={photos.length > 1 ? 0 : undefined}
      onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(Math.max(0, Math.min(photos.length - 1, active + (e.key === 'ArrowRight' ? 1 : -1)))); } }}
      onScroll={e => { const el = e.currentTarget; setActive(Math.max(0, Math.min(photos.length - 1, Math.round(el.scrollLeft / Math.max(1, el.clientWidth))))); }}
      onPointerDown={e => { if (e.pointerType !== 'mouse' || photos.length < 2) return; drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft }; e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.style.scrollSnapType = 'none'; }}
      onPointerMove={e => { if (drag.current) e.currentTarget.scrollLeft = drag.current.left + drag.current.x - e.clientX; }}
      onPointerUp={e => { if (!drag.current) return; drag.current = null; e.currentTarget.style.scrollSnapType = ''; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); move(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth))); }}
      onPointerCancel={e => { drag.current = null; e.currentTarget.style.scrollSnapType = ''; }}
      className="flex w-full min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain no-scrollbar" style={{ touchAction: 'pan-x pan-y', cursor: photos.length > 1 ? 'grab' : 'default' }}>
      {photos.map((photo, index) => <div key={photo.url + index} className="relative aspect-[16/10] w-full min-w-full shrink-0 snap-center overflow-hidden bg-zinc-950">
        {photo.fit === 'contain' && <img src={photo.url} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-40" loading="lazy" />}
        <img src={photo.url} alt={service.name + ' — foto ' + (index + 1) + ' de ' + photos.length} draggable={false} loading="lazy" className="relative h-full w-full select-none" style={{ objectFit: photo.fit || 'cover', objectPosition: (photo.positionX ?? 50) + '% ' + (photo.positionY ?? 50) + '%' }} />
      </div>)}
    </div>
    {photos.length > 1 && <div className="flex flex-wrap items-center justify-center gap-2 bg-zinc-950 px-3 py-2">
      <button type="button" onClick={() => move(Math.max(0, active - 1))} disabled={active === 0} aria-label="Foto anterior" className="px-2 py-1 text-amber-300 disabled:opacity-30">←</button>
      <span className="text-xs text-zinc-300">{Math.min(active + 1, photos.length)} / {photos.length} · Arraste para ver mais</span>
      <button type="button" onClick={() => move(Math.min(photos.length - 1, active + 1))} disabled={active >= photos.length - 1} aria-label="Próxima foto" className="px-2 py-1 text-amber-300 disabled:opacity-30">→</button>
    </div>}
  </div>;
};
