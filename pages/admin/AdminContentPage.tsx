import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { SiteContent } from '../../types';

export const AdminContentPage: React.FC = () => {
  const { content, saveContent } = useStore();
  const [formData, setFormData] = useState<SiteContent>(content);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveContent(formData);
    setFeedback('Textos e conteúdos institucionais atualizados com sucesso!');
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <AdminLayout title="Conteúdo Institucional">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div>
          <h2 className="text-base font-bold text-white">Editor de Textos Institucionais</h2>
          <p className="text-xs text-zinc-400">Personalize slogans, frases de posicionamento e avisos do site.</p>
        </div>

        {feedback && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Hero e Posicionamento */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <h3 className="font-['Cinzel'] font-bold text-sm text-white border-b border-zinc-800 pb-2">
              1. Hero & Posicionamento Oficial
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Título Principal (Hero)
                </label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Subtítulo Oficial
                </label>
                <input
                  type="text"
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Frase de Posicionamento Oficial
                </label>
                <textarea
                  rows={2}
                  value={formData.positioningQuote}
                  onChange={(e) => setFormData({ ...formData, positioningQuote: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Sobre e Fundador */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <h3 className="font-['Cinzel'] font-bold text-sm text-white border-b border-zinc-800 pb-2">
              2. História & Fundador (Ray Silva)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Texto Sobre o Studio Black7
                </label>
                <textarea
                  rows={4}
                  value={formData.aboutText}
                  onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Biografia do Fundador (Ray Black7)
                </label>
                <textarea
                  rows={4}
                  value={formData.founderBio}
                  onChange={(e) => setFormData({ ...formData, founderBio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Loja de Cosméticos */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <h3 className="font-['Cinzel'] font-bold text-sm text-white border-b border-zinc-800 pb-2">
              3. Títulos da Seção da Loja
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Título da Loja
                </label>
                <input
                  type="text"
                  value={formData.storeTitle}
                  onChange={(e) => setFormData({ ...formData, storeTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Subtítulo da Loja
                </label>
                <input
                  type="text"
                  value={formData.storeSubtitle}
                  onChange={(e) => setFormData({ ...formData, storeSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
};
