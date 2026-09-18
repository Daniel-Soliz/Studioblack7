import React, { useState } from 'react';
import { 
  Palette, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  RotateCcw, 
  Save, 
  Image as ImageIcon,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { getAssetUrl } from '../../utils';
import { CloudStoreService } from '../../services/cloudStoreService';

export const AdminSiteImagesPage: React.FC = () => {
  const { settings, saveSettings, content, saveContent } = useStore();

  const [feedback, setFeedback] = useState('');
  
  // Hero Image
  const [heroImage, setHeroImage] = useState(
    content.heroImageUrl || settings.heroImageUrl || '/images/ray_barber_1789410748280.jpg'
  );
  // Founder Image
  const [founderImage, setFounderImage] = useState(
    content.founderImageUrl || settings.founderImageUrl || '/images/Ray.png'
  );
  // Logo
  const [logoImage, setLogoImage] = useState(
    settings.logoUrl || '/images/ray_logo.png'
  );
  // Favicon
  const [faviconImage, setFaviconImage] = useState(
    settings.faviconUrl || '/images/ray_logo.png'
  );
  // Store Banner
  const [storeBanner, setStoreBanner] = useState(
    settings.storeBannerUrl || content.storeBannerUrl || ''
  );

  const [compressingKey, setCompressingKey] = useState<string | null>(null);

  const uploadAndSet = async (file: File, callback: (url: string) => void, key: string) => {
    setCompressingKey(key);
    try {
      const url = await CloudStoreService.uploadImageFromFile(file, 'site');
      callback(url);
    } catch (error) {
      console.error(error);
      alert('Não foi possível enviar a imagem para o armazenamento. Tente novamente.');
    } finally {
      setCompressingKey(null);
    }
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    // Save into both settings and content for seamless synchronization
    saveSettings({
      ...settings,
      heroImageUrl: heroImage,
      founderImageUrl: founderImage,
      logoUrl: logoImage,
      faviconUrl: faviconImage,
      storeBannerUrl: storeBanner
    });

    saveContent({
      ...content,
      heroImageUrl: heroImage,
      founderImageUrl: founderImage,
      storeBannerUrl: storeBanner
    });

    setFeedback('Imagens do site atualizadas com sucesso! O site público já está exibindo as novas imagens.');
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <AdminLayout title="Imagens do Site">
      <div className="space-y-6 max-w-5xl mx-auto">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-xl sm:text-2xl font-black text-white">
              Gerenciador de Imagens Oficiais
            </h1>
            <p className="text-xs text-zinc-400">
              Personalize a foto principal da Home, o fundador Ray Silva, logotipo e banners.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Todas as Imagens</span>
          </button>
        </div>

        {feedback && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-400" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSaveAll} className="space-y-6">
          
          {/* 1. Imagem Principal da Home (Hero) */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-['Cinzel'] font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  1. Foto Principal da Página Inicial (Hero / Ray em Ação)
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Exibida na primeira dobra da página inicial ao lado do slogan principal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHeroImage('/images/ray_barber_1789410748280.jpg')}
                className="text-[11px] text-zinc-400 hover:text-amber-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar original</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              {/* Preview */}
              <div className="relative aspect-4/3 rounded-xl bg-black border border-zinc-750 overflow-hidden group shadow-md">
                <img
                  src={getAssetUrl(heroImage)}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/ray_barber_1789410748280.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold">
                  Pré-visualização
                </div>
              </div>

              {/* Controls */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Upload de Nova Foto (computador ou celular)
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-700 hover:border-amber-400 bg-black/40 cursor-pointer transition-colors text-xs font-bold text-zinc-200">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>
                      {compressingKey === 'hero' ? 'Processando imagem...' : 'Escolher arquivo de imagem'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadAndSet(file, setHeroImage, 'hero');
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Ou digite a URL direta da imagem
                  </label>
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="https://exemplo.com/foto-ray.jpg ou /images/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Foto do Fundador (Ray Silva) */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-['Cinzel'] font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  2. Foto do Fundador (Ray Silva / Ray Black7)
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Exibida na seção "Quem Está por Trás das Tesouras".
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFounderImage('/images/Ray.png')}
                className="text-[11px] text-zinc-400 hover:text-amber-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar original</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              {/* Preview */}
              <div className="relative aspect-square max-w-[200px] rounded-xl bg-black border border-zinc-750 overflow-hidden shadow-md">
                <img
                  src={getAssetUrl(founderImage)}
                  alt="Founder Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/Ray.png';
                  }}
                />
              </div>

              {/* Controls */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Upload de Nova Foto do Fundador
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-700 hover:border-amber-400 bg-black/40 cursor-pointer transition-colors text-xs font-bold text-zinc-200">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>
                      {compressingKey === 'founder' ? 'Processando imagem...' : 'Escolher foto do Ray Silva'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadAndSet(file, setFounderImage, 'founder');
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Ou digite a URL da foto
                  </label>
                  <input
                    type="text"
                    value={founderImage}
                    onChange={(e) => setFounderImage(e.target.value)}
                    placeholder="https://exemplo.com/foto-ray.jpg"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Logotipo e Favicon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Logo */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="font-['Cinzel'] font-bold text-sm text-white">
                  3. Logotipo Oficial
                </h3>
                <button
                  type="button"
                  onClick={() => setLogoImage('/images/ray_logo.png')}
                  className="text-[11px] text-zinc-400 hover:text-amber-400 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Padrão</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-black border border-amber-400/60 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={getAssetUrl(logoImage)} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-zinc-700 hover:border-amber-400 bg-black/40 cursor-pointer text-xs font-bold text-zinc-200">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadAndSet(file, setLogoImage, 'logo');
                      }}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={logoImage}
                    onChange={(e) => setLogoImage(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-750 text-[11px] text-white"
                    placeholder="URL do Logo"
                  />
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="font-['Cinzel'] font-bold text-sm text-white">
                  4. Favicon da Aba do Navegador
                </h3>
                <button
                  type="button"
                  onClick={() => setFaviconImage('/images/ray_logo.png')}
                  className="text-[11px] text-zinc-400 hover:text-amber-400 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Padrão</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-black border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={getAssetUrl(faviconImage)} alt="Favicon" className="w-8 h-8 object-contain" />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-zinc-700 hover:border-amber-400 bg-black/40 cursor-pointer text-xs font-bold text-zinc-200">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Favicon</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadAndSet(file, setFaviconImage, 'fav');
                      }}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={faviconImage}
                    onChange={(e) => setFaviconImage(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-750 text-[11px] text-white"
                    placeholder="URL do Favicon"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 shadow-xl shadow-amber-400/20"
            >
              Salvar Todas as Imagens
            </button>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
};
