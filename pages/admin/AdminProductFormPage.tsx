import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Check, 
  Upload, 
  Plus, 
  Trash2, 
  Image as ImageIcon 
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'novo');
  const { products, categories, saveProduct } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [howToUse, setHowToUse] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('10');
  const [minStock, setMinStock] = useState('3');
  const [volumeOrSize, setVolumeOrSize] = useState('150ml');
  const [mainImage, setMainImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [mainImageMode, setMainImageMode] = useState<'upload' | 'url'>('upload');
  const [isCompressingMain, setIsCompressingMain] = useState(false);
  const [isCompressingGallery, setIsCompressingGallery] = useState(false);
  const [badge, setBadge] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive' | 'out_of_stock'>('active');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  useEffect(() => {
    if (isEditing && id) {
      const p = products.find(prod => prod.id === id);
      if (p) {
        setName(p.name);
        setSlug(p.slug);
        setSku(p.sku || '');
        setCategory(p.category);
        setShortDescription(p.shortDescription || '');
        setDescription(p.description || '');
        setHowToUse(p.howToUse || '');
        setBenefitsText(p.benefits ? p.benefits.join('\n') : '');
        setPrice(p.price.toString());
        setSalePrice(p.salePrice ? p.salePrice.toString() : '');
        setStock(p.stock.toString());
        setMinStock(p.minStock ? p.minStock.toString() : '3');
        setVolumeOrSize(p.volumeOrSize || '');
        setMainImage(p.images?.[0] || p.thumbnail || '');
        setGalleryImages(p.images ? p.images.slice(1) : []);
        setBadge(p.badge || '');
        setFeatured(p.featured || false);
        setStatus(p.status);
      }
    }
  }, [isEditing, id, products]);

  // Auto-generate slug and SKU if creating
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
      if (!sku) {
        setSku(`SB7-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMainFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingMain(true);
    try {
      const compressed = await compressImage(file);
      setMainImage(compressed);
    } catch {
      alert('Erro ao carregar a imagem. Tente novamente.');
    } finally {
      setIsCompressingMain(false);
    }
  };

  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingGallery(true);
    try {
      const compressed = await compressImage(file);
      setGalleryImages(prev => [...prev, compressed]);
    } catch {
      alert('Erro ao carregar a imagem da galeria.');
    } finally {
      setIsCompressingGallery(false);
    }
  };

  const handleAddGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setGalleryImages(prev => [...prev, newGalleryUrl.trim()]);
      setNewGalleryUrl('');
    }
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // Validations
    if (!name.trim()) {
      newErrors.name = 'O nome do produto é obrigatório.';
    }

    const numPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'O preço deve ser um valor maior que zero.';
    }

    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      newErrors.stock = 'O estoque não pode ser negativo.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const benefits = benefitsText
      .split('\n')
      .map(b => b.trim())
      .filter(Boolean);

    const allImages = [
      mainImage || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
      ...galleryImages
    ];

    const numSalePrice = salePrice ? parseFloat(salePrice.replace(',', '.')) : undefined;

    const productPayload: Product = {
      id: isEditing && id ? id : `prod_${Date.now()}`,
      name: name.trim(),
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      sku: sku.trim() || undefined,
      category,
      price: numPrice,
      salePrice: numSalePrice && !isNaN(numSalePrice) && numSalePrice > 0 ? numSalePrice : undefined,
      stock: numStock,
      minStock: parseInt(minStock, 10) || 3,
      status: numStock <= 0 ? 'out_of_stock' : status,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      howToUse: howToUse.trim() || undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
      volumeOrSize: volumeOrSize.trim() || undefined,
      thumbnail: allImages[0],
      images: allImages,
      badge: badge.trim() || undefined,
      featured,
      createdAt: isEditing ? (products.find(p => p.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveProduct(productPayload);
    setSuccessMsg('Produto salvo com sucesso!');
    setTimeout(() => {
      navigate('/admin/produtos');
    }, 1200);
  };

  return (
    <AdminLayout title={isEditing ? 'Editar Produto' : 'Novo Produto'}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top bar back link */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/produtos"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Lista de Produtos</span>
          </Link>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Informações Principais */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <h3 className="font-['Cinzel'] font-bold text-sm text-white border-b border-zinc-800 pb-2">
              1. Identificação do Produto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Pomada Modeladora Efeito Matte Studio Black7"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
                {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>}
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  SKU / Código Interno
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ex: SB7-POM01"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Volume / Peso / Tamanho
                </label>
                <input
                  type="text"
                  value={volumeOrSize}
                  onChange={(e) => setVolumeOrSize(e.target.value)}
                  placeholder="Ex: 150ml, 80g, Frasco"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Descrição Curta (Exibida nos cards da loja e home)
                </label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Resumo em 1 a 2 linhas sobre o acabamento e proposta do cosmético..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Descrição Completa
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes completos sobre textura, benefícios e resultado..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Modo de Uso
                </label>
                <textarea
                  rows={3}
                  value={howToUse}
                  onChange={(e) => setHowToUse(e.target.value)}
                  placeholder="Instruções de aplicação..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Benefícios (1 por linha)
                </label>
                <textarea
                  rows={3}
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  placeholder="Fixação prolongada&#10;Efeito seco matte&#10;Fácil remoção com água"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Preços e Estoque */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <h3 className="font-['Cinzel'] font-bold text-sm text-white border-b border-zinc-800 pb-2">
              2. Preço e Gestão de Estoque
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Preço Normal (R$) *
                </label>
                <input
                  type="text"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="65,00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                />
                {errors.price && <p className="text-red-400 text-[11px] mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Preço Promocional (R$)
                </label>
                <input
                  type="text"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Estoque Atual (Unidades) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                />
                {errors.stock && <p className="text-red-400 text-[11px] mt-1">{errors.stock}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Alerta Estoque Baixo
                </label>
                <input
                  type="number"
                  min={0}
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  placeholder="Ex: 3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Imagens do Produto */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-['Cinzel'] font-bold text-sm text-white">
                  3. Fotos e Imagem do Produto
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Faça upload do seu dispositivo ou informe o link direto da imagem.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 p-1 bg-black/50 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMainImageMode('upload')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    mainImageMode === 'upload'
                      ? 'bg-amber-400 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Upload do Arquivo
                </button>
                <button
                  type="button"
                  onClick={() => setMainImageMode('url')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    mainImageMode === 'url'
                      ? 'bg-amber-400 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Link / URL
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Main Image Control */}
              <div className="p-4 rounded-xl bg-black/40 border border-zinc-800/80 space-y-3">
                <label className="block text-xs font-bold text-amber-300 uppercase">
                  Foto Principal do Produto *
                </label>

                {mainImageMode === 'upload' ? (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 hover:border-amber-400 rounded-xl p-5 cursor-pointer bg-zinc-950/60 transition-colors">
                      <Upload className="w-6 h-6 text-amber-400 mb-1.5" />
                      <span className="text-xs font-bold text-zinc-200">
                        {isCompressingMain ? 'Processando e otimizando imagem...' : 'Escolher foto do celular ou computador'}
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-1">
                        Formatos: JPG, PNG, WEBP (compressão automática em alta resolução)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainFileUpload}
                        disabled={isCompressingMain}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={mainImage}
                      onChange={(e) => setMainImage(e.target.value)}
                      placeholder="Cole a URL da imagem (ex: https://...)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )}

                {/* Preview of Main Image */}
                {mainImage && (
                  <div className="flex items-center gap-4 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <img
                      src={mainImage}
                      alt="Preview Principal"
                      className="w-16 h-16 rounded-xl object-cover border border-amber-400/40 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">Foto Principal Definida</p>
                      <p className="text-[11px] text-emerald-400 font-semibold">Pronta para exibição na loja e nos detalhes</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMainImage('')}
                      className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>

              {/* Gallery Images (Additional) */}
              <div className="p-4 rounded-xl bg-black/40 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-300 uppercase">
                    Fotos Adicionais (Galeria do Produto)
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-amber-300 text-xs font-bold transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isCompressingGallery ? 'Otimizando...' : 'Upload de Foto Adicional'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryFileUpload}
                      disabled={isCompressingGallery}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="Ou cole a URL de mais uma foto..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-bold cursor-pointer"
                  >
                    Adicionar URL
                  </button>
                </div>

                {galleryImages.length > 0 && (
                  <div className="flex items-center gap-3 overflow-x-auto p-2 bg-black/30 rounded-xl border border-zinc-850">
                    {galleryImages.map((url, i) => (
                      <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-zinc-800 shrink-0">
                        <img src={url} alt={`Galeria ${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(i)}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Status, Selo e Destaques */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            <h3 className="font-['Cinzel'] font-bold text-sm text-white border-b border-zinc-800 pb-2">
              4. Exibição e Visibilidade
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Status do Produto
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="active">Ativo (Visível na loja)</option>
                  <option value="inactive">Inativo (Oculto)</option>
                  <option value="out_of_stock">Sem Estoque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Selo Visual (Badge)
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Ex: Mais Vendido, Novo, Destaque"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  <span className="text-xs font-bold text-white uppercase">
                    Exibir na Home (Destaque)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              to="/admin/produtos"
              className="py-3 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-bold uppercase tracking-wider"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Produto</span>
            </button>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
};
