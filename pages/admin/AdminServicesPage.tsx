import React, { useState } from 'react';
import { Plus, Edit, Trash2, Check, Scissors, Sparkles, ImagePlus, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { ServiceItem } from '../../types';
import { CloudStoreService } from '../../services/cloudStoreService';

export const AdminServicesPage: React.FC = () => {
  const { services, saveServices } = useStore();
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('R$ 35,00');
  const [formCategory, setFormCategory] = useState('Cortes');
  const [formDuration, setFormDuration] = useState('40 min');
  const [formDescription, setFormDescription] = useState('');
  const [formPopular, setFormPopular] = useState(false);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formImage, setFormImage] = useState('');

  const categories = [
    'Cortes',
    'Barba',
      'Penteado / Acabamento',
    'Química / Alisamento',
    'Coloração'
  ];

  const openCreate = () => {
    setIsCreating(true);
    setEditingService(null);
    setFormName('');
    setFormPrice('R$ 40,00');
    setFormDuration('40 min');
    setFormCategory('Cortes');
    setFormDescription('');
    setFormPopular(false);
    setFormStatus('active');
    setFormImage('');
  };

  const openEdit = (s: ServiceItem) => {
    setEditingService(s);
    setIsCreating(false);
    setFormName(s.name);
    setFormPrice(s.price);
    setFormDuration(s.duration || '40 min');
    setFormCategory(s.category);
    setFormDescription(s.description || '');
    setFormPopular(s.popular || false);
    setFormStatus(s.status || 'active');
    setFormImage(s.image || '');
  };

  const handleImageUpload = async (file?: File) => {
    if (!file) return;

    setUploadingImage(true);
    setFeedback('');

    try {
      const url = await CloudStoreService.uploadImageFromFile(file, 'services');
      setFormImage(url);
      setFeedback('Imagem enviada com sucesso. Agora salve o serviço para publicar.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || uploadingImage) return;

    const numPrice = parseFloat(formPrice.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;

    if (isCreating) {
      const newService: ServiceItem = {
        id: `srv_${Date.now()}`,
        name: formName.trim(),
        price: formPrice.trim(),
        priceNumber: numPrice,
        duration: formDuration.trim() || undefined,
        category: formCategory,
        description: formDescription.trim(),
        popular: formPopular,
        status: formStatus,
        image: formImage || undefined,
        order: services.length + 1
      };
      saveServices([...services, newService]);
      setFeedback(`Serviço "${newService.name}" criado com sucesso! O site público já foi atualizado.`);
    } else if (editingService) {
      const updated = services.map(s =>
        s.id === editingService.id
          ? {
              ...s,
              name: formName.trim(),
              price: formPrice.trim(),
              priceNumber: numPrice,
              duration: formDuration.trim() || undefined,
              category: formCategory,
              description: formDescription.trim(),
              popular: formPopular,
              status: formStatus,
              image: formImage || undefined
            }
          : s
      );
      saveServices(updated);
      setFeedback(`Serviço "${formName}" atualizado com sucesso! O site público já foi atualizado.`);
    }

    setEditingService(null);
    setIsCreating(false);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    saveServices(services.filter(s => s.id !== id));
    setFeedback(`Serviço "${name}" removido.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <AdminLayout title="Serviços da Barbearia">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Tabela de Serviços ({services.length})</h2>
            <p className="text-xs text-zinc-400">
              Edite preço, nome, descrição e adicione uma foto real do trabalho para o cliente visualizar.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-md hover:brightness-105"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Serviço</span>
          </button>
        </div>

        {feedback && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-xs text-zinc-300">
              <thead className="bg-black/60 text-zinc-400 uppercase tracking-wider font-bold border-b border-zinc-800 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Imagem</th>
                  <th className="py-3 px-4">Nome do Serviço</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Preço Oficial</th>
                  <th className="py-3 px-4 text-center">Popular</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {services.map(s => (
                  <tr key={s.id} className="hover:bg-zinc-850/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/60 border border-zinc-800 flex items-center justify-center">
                        {s.image ? (
                          <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <Scissors className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{s.name}</span>
                      {s.description && (
                        <span className="text-[11px] text-zinc-400 line-clamp-1">{s.description}</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-300 text-[10px] font-semibold">
                        {s.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-black text-amber-400">
                      {s.price}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {s.popular ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-400/20 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" />
                          <span>Sim</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500">Não</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        s.status !== 'inactive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {s.status !== 'inactive' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.name)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500 hover:text-white text-red-400"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {(isCreating || editingService) && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSave} className="max-w-md w-full max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="font-['Cinzel'] font-bold text-base text-white">
                {isCreating ? 'Novo Serviço' : `Editar: ${editingService?.name}`}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1.5">
                    Foto do trabalho
                  </label>
                  <div className="rounded-2xl border border-zinc-800 bg-black/40 overflow-hidden">
                    <div className="aspect-[16/9] bg-black/60 flex items-center justify-center">
                      {formImage ? (
                        <img src={formImage} alt="Prévia do serviço" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-zinc-500 px-6">
                          <ImagePlus className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-[11px]">Adicione uma foto semelhante ao resultado do serviço.</p>
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex flex-wrap gap-2">
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-bold text-white cursor-pointer hover:border-amber-400/50">
                        {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4 text-amber-400" />}
                        <span>{uploadingImage ? 'Enviando...' : formImage ? 'Trocar foto' : 'Adicionar foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={(e) => void handleImageUpload(e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>

                      {formImage && (
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold"
                        >
                          Remover foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Nome do Serviço *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Corte Degradê Navalhado"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Preço Formatado *
                    </label>
                    <input
                      type="text"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="Ex: R$ 35,00"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Duração Estimada
                    </label>
                    <input
                      type="text"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="Ex: 40 min ou 1h"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Descrição do Procedimento
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Detalhes sobre a técnica, produtos ou lavagem inclusa..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPopular}
                      onChange={(e) => setFormPopular(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 rounded"
                    />
                    <span className="text-xs font-bold text-white">
                      Marcar como "Mais Pedido"
                    </span>
                  </label>

                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-zinc-750 text-xs text-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingService(null);
                    setIsCreating(false);
                  }}
                  className="py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
