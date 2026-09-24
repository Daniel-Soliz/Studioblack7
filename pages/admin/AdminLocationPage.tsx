import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Check, 
  Save, 
  ExternalLink,
  Compass
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';

export const AdminLocationPage: React.FC = () => {
  const { settings, saveSettings } = useStore();
  const [feedback, setFeedback] = useState('');

  const [addressStreet, setAddressStreet] = useState(settings.addressStreet || 'R. Boa Vista');
  const [addressNeighborhood, setAddressNeighborhood] = useState(settings.addressNeighborhood || 'Jardim Paulistano');
  const [addressCity, setAddressCity] = useState(settings.addressCity || 'São Paulo');
  const [addressState, setAddressState] = useState(settings.addressState || 'SP');
  const [addressZipCode, setAddressZipCode] = useState(settings.addressZipCode || '02814-060');
  const [referencePoint, setReferencePoint] = useState(settings.referencePoint || 'Próximo à Av. Deputado Cantídio Sampaio (Zona Norte)');
  const [mapsUrl, setMapsUrl] = useState(
    settings.mapsUrl || 'https://maps.google.com/?q=Tv.+União,+4+-+Jardim+Paulistano,+São+Paulo+-+SP'
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const fullAddress = `${addressStreet.trim()} — ${addressNeighborhood.trim()} — Zona Norte, ${addressCity.trim()}/${addressState.trim()}`;

    saveSettings({
      ...settings,
      address: fullAddress,
      addressStreet: addressStreet.trim(),
      addressNeighborhood: addressNeighborhood.trim(),
      addressCity: addressCity.trim(),
      addressState: addressState.trim(),
      addressZipCode: addressZipCode.trim(),
      referencePoint: referencePoint.trim(),
      mapsUrl: mapsUrl.trim()
    });

    setFeedback('Endereço e localização atualizados com sucesso! A seção de mapa e rodapé foram sincronizados.');
    setTimeout(() => setFeedback(''), 3500);
  };

  return (
    <AdminLayout title="Localização & Endereço">
      <div className="space-y-6 max-w-4xl mx-auto">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-xl sm:text-2xl font-black text-white">
              Endereço Oficial da Barbearia
            </h1>
            <p className="text-xs text-zinc-400">
              Configure o endereço físico, referências de chegada e link do Google Maps.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Endereço</span>
          </button>
        </div>

        {feedback && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-400" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-['Cinzel'] font-bold text-sm text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Dados do Estabelecimento
              </h3>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <span>Abrir no Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Rua / Travessa e Número
                </label>
                <input
                  type="text"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  placeholder="R. Boa Vista"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={addressNeighborhood}
                  onChange={(e) => setAddressNeighborhood(e.target.value)}
                  placeholder="Jardim Paulistano"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Cidade e Estado
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder="São Paulo"
                    className="w-3/4 px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={addressState}
                    onChange={(e) => setAddressState(e.target.value)}
                    placeholder="SP"
                    className="w-1/4 px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={addressZipCode}
                  onChange={(e) => setAddressZipCode(e.target.value)}
                  placeholder="02814-060"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Ponto de Referência
                </label>
                <input
                  type="text"
                  value={referencePoint}
                  onChange={(e) => setReferencePoint(e.target.value)}
                  placeholder="Próximo à Av. Deputado Cantídio Sampaio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Link Direto do Google Maps / Waze
                </label>
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="p-5 rounded-2xl bg-black/60 border border-zinc-800 space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
              Pré-visualização do Endereço Formatado
            </span>
            <p className="text-sm font-bold text-white">
              {addressStreet} — {addressNeighborhood} — Zona Norte, {addressCity}/{addressState} (CEP: {addressZipCode})
            </p>
            {referencePoint && (
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Referência: {referencePoint}</span>
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 shadow-xl shadow-amber-400/20 cursor-pointer"
            >
              Salvar Endereço
            </button>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
};
