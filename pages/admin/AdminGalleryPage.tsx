import React, { useState } from 'react';
import { 
  Images, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  Sparkles,
  ExternalLink,
  Edit,
  Save,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { GalleryItem } from '../../types';
import { getAssetUrl } from '../../utils';
import { CloudStoreService } from '../../services/cloudStoreService';

export const AdminGalleryPage: React.FC = () => {
  const { gallery, saveGallery } = useStore();
  const [feedback, setFeedback] = useState('');
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoTag, setPhotoTag] = useState('Corte Degradê');
  const [photoCategory, setPhotoCategory] = useState('Cortes');
  const [photoImageUrl, setPhotoImageUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  const tags = [
    'Corte Degradê',
    'Barba Alinhada',
    'Pigmentação Capilar',
    'Platinado / Quimica',
    'Penteado Freestyle',
    'Ambiente Studio'
  ];

  const openCreateModal = () => {
    setEditingItem(null);
    setPhotoTitle('');
    setPhotoTag('Corte Degradê');
    setPhotoCategory('Cortes');
    setPhotoImageUrl('');
    setInputMode('upload');
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setPhotoTitle(item.title);
    setPhotoTag(item.tag || 'Corte Degradê');
    setPhotoCategory(item.category || 'Cortes');
    setPhotoImageUrl(item.image);
    setInputMode(item.image.startsWith('data:') ? 'upload' : 'url');
    setIsModalOpen(true);
  };

  // Upload the original file to Supabase Storage instead of storing Base64 in the browser.
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const url = await CloudStoreService.uploadImageFromFile(file, 'gallery');
      setPhotoImageUrl(url);
    } catch (error) {
      console.error(error);
      alert('Não foi possível enviar a foto para o armazenamento. Tente novamente.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoImageUrl.trim()) {
      alert('Por favor, faça upload de uma imagem ou informe a URL da foto.');
      return;
    }

    if (editingItem) {
      // Update existing item
      const updated = gallery.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: photoTitle.trim() || photoTag,
              category: photoCategory,
              tag: photoTag,
              alt: photoTitle.trim() || `Trabalho Studio Black7 - ${photoTag}`,
              image: photoImageUrl.trim()
            }
          : item
      );
      saveGallery(updated);
      setFeedback(`Foto "${photoTitle.trim() || photoTag}" atualizada com sucesso!`);
    } else {
      // Add new item
      const newItem: GalleryItem = {
        id: `gal_${Date.now()}`,
        title: photoTitle.trim() || photoTag,
        category: photoCategory,
        tag: photoTag,
        alt: photoTitle.trim() || `Trabalho Studio Black7 - ${photoTag}`,
        image: photoImageUrl.trim(),
        visible: true,
        order: gallery.length + 1
      };
      saveGallery([...gallery, newItem]);
      setFeedback('Nova foto adicionada à galeria com sucesso!');
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setPhotoTitle('');
    setPhotoImageUrl('');
    setTimeout(() => setFeedback(''), 3500);
  };

  const handleToggleVisibility = (id: string) => {
    const updated = gallery.map((item) =>
      item.id === id ? { ...item, visible: item.visible === false ? true : false } : item
    );
    saveGallery(updated);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Deseja remover a foto "${title}" da galeria?`)) {
      const updated = gallery.filter((item) => item.id !== id);
      saveGallery(updated);
      setFeedback(`Foto "${title}" removida.`);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <AdminLayout title="Galeria de Fotos">
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-['Cinzel'] text-xl sm:text-2xl font-black text-white">
              Galeria de Trabalhos &amp; Cortes ({gallery.length})
            </h1>
            <p className="text-xs text-zinc-400">
              Gerencie e edite as fotos exibidas no portfólio oficial do Studio Black7.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Foto</span>
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Gallery Cards Grid */}
        {gallery.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mx-auto">
              <Images className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-['Cinzel'] text-base font-bold text-white">
                Nenhuma foto cadastrada na galeria
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Clique no botão "Adicionar Foto" para cadastrar cortes de cabelo, alinhamentos de barba e pigmentações.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 overflow-hidden flex flex-col justify-between shadow-xl transition-all"
              >
                {/* Image Container */}
                <div className="relative aspect-square bg-black overflow-hidden">
                  <img
                    src={getAssetUrl(item.image)}
                    alt={item.alt || item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/ray_barber_1789410748280.jpg';
                    }}
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/80 backdrop-blur-md text-amber-400 border border-amber-400/30">
                      {item.tag || item.category}
                    </span>
                    {item.visible === false && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/80 text-white">
                        Oculto
                      </span>
                    )}
                  </div>

                  {/* Quick Edit Overlay button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/70 hover:bg-amber-400 hover:text-zinc-950 text-white backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Editar foto"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details & Actions */}
                <div className="p-4 space-y-3">
                  <h4 className="font-bold text-xs text-white truncate">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(item.id)}
                      className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                      title={item.visible === false ? 'Exibir no site' : 'Ocultar do site'}
                    >
                      {item.visible === false ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="text-[11px]">Oculto</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[11px] text-zinc-300">Visível</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors cursor-pointer"
                        title="Editar Informações e Imagem"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Excluir foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add or Edit Photo */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-[#111116] border border-zinc-750 rounded-2xl p-6 shadow-2xl space-y-5 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    {editingItem ? <Edit className="w-4 h-4" /> : <Images className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-['Cinzel'] font-bold text-base text-white">
                      {editingItem ? 'Editar Foto da Galeria' : 'Adicionar Nova Foto'}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {editingItem ? 'Altere a imagem, título, tag ou categoria.' : 'Cadastre um novo corte no portfólio oficial.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePhoto} className="space-y-4">
                
                {/* Input Method Switch */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setInputMode('upload')}
                    className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      inputMode === 'upload' ? 'bg-amber-400 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload de Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputMode('url')}
                    className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      inputMode === 'url' ? 'bg-amber-400 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Link / URL</span>
                  </button>
                </div>

                {inputMode === 'upload' ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-300">
                      Selecione a Imagem (JPEG/PNG/WebP)
                    </label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 hover:border-amber-400 rounded-xl p-6 cursor-pointer bg-black/40 transition-colors">
                      <Upload className="w-6 h-6 text-amber-400 mb-2" />
                      <span className="text-xs font-bold text-zinc-200">
                        {isCompressing ? 'Otimizando foto...' : 'Clique para selecionar a foto'}
                      </span>
                      <span className="text-[10px] text-zinc-500 mt-1">
                        Conversão automática com alta resolução
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-300">
                      URL da Foto
                    </label>
                    <input
                      type="url"
                      placeholder="https://exemplo.com/foto-corte.jpg"
                      value={photoImageUrl}
                      onChange={(e) => setPhotoImageUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )}

                {/* Preview if image is chosen */}
                {photoImageUrl && (
                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 flex items-center gap-3">
                    <img
                      src={photoImageUrl}
                      alt="Preview"
                      className="w-14 h-14 rounded-lg object-cover border border-amber-400/40"
                    />
                    <div className="text-xs text-zinc-300 flex-1">
                      <span className="text-emerald-400 font-bold block">✓ Imagem carregada</span>
                      <span className="text-[10px] text-zinc-500">Pronta para exibição na galeria</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-zinc-300">
                    Título / Descrição Curta
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Degradê Navalhado & Barba Alinhada"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Tag em Destaque
                    </label>
                    <select
                      value={photoTag}
                      onChange={(e) => setPhotoTag(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      {tags.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Categoria
                    </label>
                    <select
                      value={photoCategory}
                      onChange={(e) => setPhotoCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Cortes">Cortes</option>
                      <option value="Barba">Barba</option>
                      <option value="Pigmentação">Pigmentação</option>
                      <option value="Química">Química</option>
                      <option value="Espaço">Espaço</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider hover:brightness-105 shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingItem ? 'Salvar Alterações' : 'Publicar Foto'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
