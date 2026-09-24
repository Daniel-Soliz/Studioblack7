import React, { useState } from 'react';
import { MapPin, Clock, ExternalLink, Copy, Check, Navigation, AlertCircle } from 'lucide-react';
import { isCurrentlyOpen } from '../data/barbershop';
import { useStore } from '../context/StoreContext';

export const LocationAndHoursSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { settings } = useStore();

  const addressStreet = settings.addressStreet || 'R. Boa Vista';
  const addressNeighborhood = settings.addressNeighborhood || 'Jardim Paulistano';
  const addressCity = settings.addressCity || 'São Paulo';
  const addressState = settings.addressState || 'SP';
  const addressFull = settings.address || `${addressStreet} — ${addressNeighborhood} — Zona Norte, ${addressCity}/${addressState}`;
  const mapsUrl = settings.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressFull)}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(addressFull)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const usesDefaultHours =
    (settings.businessHoursWeekdays || '').includes('09h00') &&
    (settings.businessHoursSaturday || '').includes('09h00');
  const liveStatus = isCurrentlyOpen();
  const status = usesDefaultHours
    ? liveStatus
    : { isOpen: true, message: settings.statusNote || 'Consulte os horários atualizados abaixo' };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(addressFull);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="localizacao" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold">
            Onde Estamos &amp; Horários
          </span>
          <h2 className="font-['Cinzel'] text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Encontre o Studio Black7
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-medium">
            Localizado no Jardim Paulistano, ponto privilegiado na Zona Norte de São Paulo.
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Address & Map Card */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-xl space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-['Cinzel'] text-xl font-bold text-white">
                    Endereço Oficial
                  </h3>
                  <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                    Zona Norte · {addressCity}/{addressState}
                  </p>
                </div>
              </div>

              {/* Address Highlight */}
              <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-1">
                <p className="text-base font-bold text-white">
                  {addressStreet}
                </p>
                <p className="text-sm text-zinc-300">
                  {addressNeighborhood}
                </p>
                <p className="text-xs text-zinc-400">
                  Zona Norte — {addressCity}/{addressState}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105 transition-all"
                >
                  <Navigation className="w-4 h-4 fill-zinc-950" />
                  <span>Ver no Google Maps</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Endereço Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-zinc-400" />
                      <span>Copiar Endereço</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive/Reserved Dark Map Area */}
            <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 mt-4 group">
              <iframe
                title="Localização do Studio Black7 no Google Maps"
                src={mapEmbedUrl}
                className="w-full h-full border-0 grayscale contrast-125 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-black/85 backdrop-blur-md border border-amber-400/30 text-[11px] font-bold text-amber-300 flex items-center gap-1.5 pointer-events-none">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{addressStreet} · {addressNeighborhood}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Business Hours Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-xl space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-['Cinzel'] text-xl font-bold text-white">
                      Horário de Funcionamento
                    </h3>
                    <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                      Atendimento com Pontualidade
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-xs font-semibold text-zinc-200">
                  {status.message}
                </span>
              </div>

              {/* Days List */}
              <div className="space-y-3 pt-2">
                {/* Seg a Sex */}
                <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-white font-['Cinzel']">
                      Segunda a Sexta
                    </p>
                    <p className="text-[11px] text-zinc-400">Dias úteis</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-amber-400 font-mono">
                      {settings.businessHoursWeekdays || '09h00–12h00 e 13h30–21h00'}
                    </p>
                  </div>
                </div>

                {/* Sábado */}
                <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-white font-['Cinzel']">
                      Sábado
                    </p>
                    <p className="text-[11px] text-zinc-400">Final de semana</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-bold text-amber-400 font-mono">
                      {settings.businessHoursSaturday || '09h00–12h00 e 13h30–21h00'}
                    </p>
                  </div>
                </div>

                {/* Domingo */}
                <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-white font-['Cinzel']">
                      Domingo
                    </p>
                    <p className="text-[11px] text-zinc-400">Descanso da bancada</p>
                  </div>
                  <span className="px-3 py-1 rounded-md bg-zinc-800/80 text-zinc-400 text-xs font-bold uppercase tracking-wider border border-zinc-700">
                    {settings.businessHoursSunday || 'Fechado'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-zinc-400 text-center">
              Consulte a disponibilidade pelo WhatsApp antes de ir ao Studio Black7.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
