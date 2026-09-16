import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  AlertCircle,
  Check,
  Package,
  Upload,
  ExternalLink,
  X,
  Save
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const { products, categories, saveProduct, deleteProduct } = useStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState('');

  // Quick Edit Modal State
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickPrice, setQuickPrice] = useState('');
  const [quickSalePrice, setQuickSalePrice] = useState('');
  const [quickStock, setQuickStock] = useState('0');
  const [quickCategory, setQuickCategory] = useState('');
  const [quickStatus, setQuickStatus] = useState<'active' | 'inactive' | 'out_of_stock'>('active');
  const [quickFeatured, setQuickFeatured] = useState(false);
  const [quickImage, setQuickImage] = useState('');
  const [quickImageMode, setQuickImageMode] = useState<'upload' | 'url'>('upload');
  const [isCompressingQuick, setIsCompressingQuick] = useState(false);

  const openQuickEdit = (product: Product) => {
    setQuickEditProduct(product);
    setQuickName(product.name);
    setQuickPrice(product.price.toString());
    setQuickSalePrice(product.salePrice ? product.salePrice.toString() : '');
    setQuickStock((product.stock ?? 0).toString());
    setQuickCategory(product.category);
    setQuickStatus(product.status || 'active');
    setQuickFeatured(Boolean(product.featured));
    setQuickImage(product.images?.[0] || product.thumbnail || product.image || '');
  };

  const handleQuickImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingQuick(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
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
          setQuickImage(canvas.toDataURL('image/jpeg', 0.85));
        }
        setIsCompressingQuick(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveQuickEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditProduct) return;
    const numPrice = parseFloat(quickPrice.replace(',', '.'));
    if (isNaN(numPrice) || numPrice <= 0) {
      alert('Informe um preço válido maior que zero.');
      return;
    }
    const numSalePrice = quickSalePrice ? parseFloat(quickSalePrice.replace(',', '.')) : undefined;
    const numStock = parseInt(quickStock, 10) || 0;

    const currentImages = quickEditProduct.images || [];
    const updatedImages = quickImage 
      ? [quickImage, ...(currentImages.filter(img => img !== quickImage && img !== (quickEditProduct.images?.[0] || '')))]
      : currentImages;

    const updated: Product = {
      ...quickEditProduct,
      name: quickName.trim(),
      price: numPrice,
      salePrice: numSalePrice && !isNaN(numSalePrice) && numSalePrice > 0 ? numSalePrice : undefined,
      stock: numStock,
      status: numStock <= 0 ? 'out_of_stock' : quickStatus,
      category: quickCategory,
      featured: quickFeatured,
      thumbnail: quickImage || quickEditProduct.thumbnail,
      image: quickImage || quickEditProduct.image,
      images: updatedImages.length > 0 ? updatedImages : (quickImage ? [quickImage] : []),
      updatedAt: new Date().toISOString()
    };

    saveProduct(updated);
    setFeedback(`Produto "${updated.name}" atualizado com sucesso!`);
    setQuickEditProduct(null);
    setTimeout(() => setFeedback(''), 3000);
  };

  const filtered = products.filter(p => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }

    if (selectedCategory !== 'Todas' && p.category !== selectedCategory) {
      return false;
    }

    if (selectedStatus !== 'all' && p.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const handleToggleStatus = (product: Product) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    saveProduct({ ...product, status: nextStatus });
    setFeedback(`Status do produto "${product.name}" atualizado para ${nextStatus === 'active' ? 'Ativo' : 'Inativo'}.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleToggleFeatured = (product: Product) => {
    saveProduct({ ...product, featured: !product.featured });
    setFeedback(`Destaque do produto "${product.name}" ${!product.featured ? 'ativado' : 'desativado'}.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleDuplicate = (product: Product) => {
    const duplicated: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      name: `${product.name} (Cópia)`,
      sku: product.sku ? `${product.sku}-COP` : `SB7-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveProduct(duplicated);
    setFeedback(`Produto duplicado com sucesso: "${duplicated.name}".`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setFeedback(`Produto "${productToDelete.name}" removido com sucesso.`);
      setProductToDelete(null);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <AdminLayout title="Catálogo de Produtos">
      <div className="space-y-6">
        
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Todos os Produtos ({products.length})</h2>
            <p className="text-xs text-zinc-400">Gerencie títulos, preços, estoque e fotos exibidas na loja.</p>
          </div>

          <Link
            to="/admin/produtos/novo"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-md hover:brightness-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </Link>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Filters Bar */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou SKU..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-zinc-750 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-zinc-750 text-xs text-zinc-200 focus:border-amber-400 focus:outline-none"
            >
              <option value="Todas">Todas as Categorias</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-zinc-750 text-xs text-zinc-200 focus:border-amber-400 focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="out_of_stock">Sem Estoque</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-black/60 text-zinc-400 uppercase tracking-wider font-bold border-b border-zinc-800 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Preço</th>
                  <th className="py-3 px-4">Estoque</th>
                  <th className="py-3 px-4">Destaque</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map(p => {
                  const effectivePrice = p.salePrice ?? p.price;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-850/60 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.thumbnail || p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-black/40 border border-zinc-800 shrink-0"
                        />
                        <div className="max-w-xs">
                          <span className="font-bold text-white block truncate">{p.name}</span>
                          <span className="text-[11px] text-zinc-500 line-clamp-1">{p.shortDescription}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400">
                        {p.sku || '-'}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-amber-300 text-[10px] font-semibold">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white">
                        R$ {effectivePrice.toFixed(2).replace('.', ',')}
                        {p.salePrice && (
                          <span className="block text-[10px] text-zinc-500 line-through">
                            R$ {p.price.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`font-bold font-mono ${p.stock <= 0 ? 'text-red-400' : p.stock <= 3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                          {p.stock} un.
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            p.featured
                              ? 'bg-amber-400/20 text-amber-400 border-amber-400/40'
                              : 'text-zinc-600 border-transparent hover:text-zinc-400'
                          }`}
                          title={p.featured ? 'Remover destaque' : 'Tornar destaque'}
                        >
                          <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                            p.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-750'
                          }`}
                        >
                          {p.status === 'active' ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openQuickEdit(p)}
                          className="p-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-zinc-950 inline-flex items-center gap-1 transition-colors text-[11px] font-bold"
                          title="Edição Rápida (Foto, Preço, Nome, Estoque)"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Editar</span>
                        </button>

                        <Link
                          to={`/admin/produtos/${p.id}`}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 inline-block transition-colors"
                          title="Edição Completa Avançada"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 inline-block transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500 hover:text-white text-red-400 inline-block transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Edit Modal */}
        {quickEditProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-xl w-full bg-zinc-900 border border-zinc-750 rounded-3xl p-6 space-y-5 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <Edit className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-['Cinzel'] font-bold text-base text-white">
                      Editar Produto
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Atualize imagem, valores, estoque e nome rapidamente.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setQuickEditProduct(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuickEdit} className="space-y-4">
                
                {/* 1. Imagem do Produto */}
                <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-300 uppercase">
                      Imagem do Produto
                    </label>
                    <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setQuickImageMode('upload')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                          quickImageMode === 'upload' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400'
                        }`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickImageMode('url')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                          quickImageMode === 'url' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400'
                        }`}
                      >
                        Link URL
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {quickImage ? (
                      <div className="relative group w-16 h-16 rounded-xl overflow-hidden border border-amber-400/40 shrink-0 bg-zinc-950">
                        <img src={quickImage} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setQuickImage('')}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remover foto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 flex items-center justify-center text-zinc-500 shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {quickImageMode === 'upload' ? (
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold transition-all w-full justify-center">
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>{isCompressingQuick ? 'Otimizando imagem...' : 'Escolher foto do aparelho'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQuickImageUpload}
                            disabled={isCompressingQuick}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <input
                          type="url"
                          value={quickImage}
                          onChange={(e) => setQuickImage(e.target.value)}
                          placeholder="Cole o link da imagem (https://...)"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Nome do Produto */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="Ex: Pomada Modeladora Efeito Matte"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* 3. Valores e Preços */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-400 uppercase mb-1">
                      Preço (R$) *
                    </label>
                    <input
                      type="text"
                      required
                      value={quickPrice}
                      onChange={(e) => setQuickPrice(e.target.value)}
                      placeholder="65,00"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-400/40 text-xs font-mono font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                      Preço Promo (R$)
                    </label>
                    <input
                      type="text"
                      value={quickSalePrice}
                      onChange={(e) => setQuickSalePrice(e.target.value)}
                      placeholder="Opcional"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-750 text-xs font-mono text-zinc-200 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Estoque Atual *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={quickStock}
                      onChange={(e) => setQuickStock(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-750 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 4. Categoria e Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Categoria
                    </label>
                    <select
                      value={quickCategory}
                      onChange={(e) => setQuickCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Status de Venda
                    </label>
                    <select
                      value={quickStatus}
                      onChange={(e) => setQuickStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="active">Ativo (Na Loja)</option>
                      <option value="inactive">Inativo (Oculto)</option>
                      <option value="out_of_stock">Esgotado</option>
                    </select>
                  </div>
                </div>

                {/* 5. Destaque */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickFeatured}
                      onChange={(e) => setQuickFeatured(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 rounded"
                    />
                    <span className="text-xs font-bold text-zinc-200">
                      Destacar este produto na página inicial (Home)
                    </span>
                  </label>

                  <Link
                    to={`/admin/produtos/${quickEditProduct.id}`}
                    className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    <span>Mais Opções</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setQuickEditProduct(null)}
                    className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-bold"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-md hover:brightness-105 flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {productToDelete && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-['Cinzel'] font-bold text-lg text-white">Excluir Produto</h3>
                <p className="text-xs text-zinc-400">
                  Tem certeza que deseja excluir o produto <strong className="text-white">"{productToDelete.name}"</strong>? Esta ação removerá o item do catálogo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
