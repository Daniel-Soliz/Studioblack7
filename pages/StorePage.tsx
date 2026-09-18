import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ShoppingBag, 
  Sparkles, 
  Star, 
  SlidersHorizontal, 
  Check, 
  ArrowUpDown,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { Header, Footer, FloatingWhatsApp } from '../components';

export const StorePage: React.FC = () => {
  const { products, content } = useStore();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('categoria') || 'Todos';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [priceRange, setPriceRange] = useState<'all' | 'under50' | '50to100' | 'above100'>('all');
  const [availabilityOnly, setAvailabilityOnly] = useState<boolean>(false);
  const [filterFeatured, setFilterFeatured] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recent' | 'priceAsc' | 'priceDesc' | 'bestsellers' | 'featured'>('featured');
  const [feedback, setFeedback] = useState<{ [id: string]: string }>({});

  // Sync category param from URL when searchParams change
  useEffect(() => {
    const cat = searchParams.get('categoria');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const isFiltered = Boolean(
    searchTerm.trim() || 
    selectedCategory !== 'Todos' || 
    priceRange !== 'all' || 
    availabilityOnly || 
    filterFeatured || 
    sortBy !== 'featured'
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must be active
      if (p.status === 'inactive') return false;

      // Search (Name, Category, SKU)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCat = p.category.toLowerCase().includes(query);
        const matchesSku = p.sku?.toLowerCase().includes(query);
        if (!matchesName && !matchesCat && !matchesSku) return false;
      }

      // Main store navigation: Todos, Cabelo, Barba, Facial, Kits e Promoções
      if (selectedCategory === 'Promoções') {
        if (!p.salePrice || p.salePrice >= p.price) return false;
      } else if (selectedCategory !== 'Todos' && p.category !== selectedCategory) {
        return false;
      }

      // Price range
      const effectivePrice = p.salePrice ?? p.price;
      if (priceRange === 'under50' && effectivePrice > 50) return false;
      if (priceRange === '50to100' && (effectivePrice < 50 || effectivePrice > 100)) return false;
      if (priceRange === 'above100' && effectivePrice <= 100) return false;

      // Availability
      if (availabilityOnly && (p.stock <= 0 || p.status === 'out_of_stock')) {
        return false;
      }

      // Featured
      if (filterFeatured && !p.featured) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priceAsc') {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;
        return priceA - priceB;
      }
      if (sortBy === 'priceDesc') {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;
        return priceB - priceA;
      }
      if (sortBy === 'bestsellers') {
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      }
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      }
      // 'recent'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, searchTerm, selectedCategory, priceRange, availabilityOnly, filterFeatured, sortBy]);

  const handleAddToCart = (product: Product) => {
    const res = addToCart(product, 1);
    setFeedback(prev => ({ ...prev, [product.id]: res.message }));
    setTimeout(() => {
      setFeedback(prev => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Navigation Bar with Clear Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800/80">
            <Link
              to="/"
              id="btn-voltar-inicio-loja"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/60 text-zinc-200 hover:text-amber-400 text-xs sm:text-sm font-bold transition-all group shadow-lg"
              title="Voltar para a Página Inicial da Barbearia"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar ao Início</span>
            </Link>

            <nav className="flex items-center gap-2 text-xs text-zinc-400">
              <Link to="/" className="hover:text-amber-400 transition-colors">
                Início
              </Link>
              <span className="text-zinc-600">/</span>
              <span className="text-amber-400 font-semibold">Loja</span>
            </nav>
          </div>

          {/* Store Hero / Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catálogo Oficial de Cosméticos</span>
          </div>
          <h1 className="font-['Cinzel'] text-3xl sm:text-5xl font-black text-white tracking-tight">
            {content.storeTitle || 'Produtos Studio Black7'}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 font-medium">
            {content.storeSubtitle || 'Leve a experiência Studio Black7 para sua rotina.'}
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
        </div>

        {/* Search, Filter & Controls Bar */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 mb-10 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produtos por nome, categoria ou SKU..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-zinc-750 focus:border-amber-400 focus:outline-none text-sm text-white placeholder-zinc-500 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-6 flex flex-wrap sm:flex-nowrap items-center justify-end gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <ArrowUpDown className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs uppercase font-bold text-zinc-400 whitespace-nowrap">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs font-bold text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Destaques</option>
                  <option value="recent">Mais Recentes</option>
                  <option value="priceAsc">Menor Preço</option>
                  <option value="priceDesc">Maior Preço</option>
                  <option value="bestsellers">Mais Vendidos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Pills & Checkboxes */}
          <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full lg:w-auto">
              {['Todos', 'Cabelo', 'Barba', 'Facial', 'Kits', 'Promoções'].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    setSearchParams(category === 'Todos' ? {} : { categoria: category });
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-amber-400 text-zinc-950 font-black'
                      : 'bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-750 border border-zinc-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Quick Filter Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAvailabilityOnly(!availabilityOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  availabilityOnly
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-zinc-800/50 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                ✓ Em Estoque
              </button>

              <button
                type="button"
                onClick={() => setFilterFeatured(!filterFeatured)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  filterFeatured
                    ? 'bg-amber-400 text-zinc-950 font-black border-amber-400'
                    : 'bg-zinc-800/50 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                ★ Destaques
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-6">
          <span>
            Exibindo <strong className="text-amber-400">{filteredProducts.length}</strong> produtos
          </span>
          {(searchTerm || selectedCategory !== 'Todos' || availabilityOnly || filterFeatured) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
                setAvailabilityOnly(false);
                setFilterFeatured(false);
                setPriceRange('all');
              }}
              className="text-amber-400 hover:underline font-semibold"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div id="catalogo-produtos" className="scroll-mt-28">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 max-w-lg mx-auto space-y-4">
            <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="font-['Cinzel'] text-xl font-bold text-white">Nenhum produto encontrado</h3>
            <p className="text-xs text-zinc-400">
              Não encontramos nenhum produto com os filtros aplicados. Tente ajustar os termos de busca ou limpar os filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';
              const price = product.salePrice ?? product.price;
              const hasPromo = product.salePrice && product.salePrice < product.price;

              return (
                <div
                  key={product.id}
                  className="group rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-black/40">
                    <img
                      src={product.thumbnail || product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {product.badge && (
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                          {product.badge}
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="px-2.5 py-0.5 rounded-md bg-red-600/90 text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
                          Esgotado
                        </span>
                      )}
                    </div>

                    {/* Volume / Size */}
                    {product.volumeOrSize && (
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-zinc-300">
                        {product.volumeOrSize}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-amber-400/90 font-semibold uppercase tracking-wider">
                        <span>{product.category}</span>
                        {product.rating && (
                          <span className="flex items-center gap-1 text-zinc-300">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{product.rating.toFixed(1)}</span>
                          </span>
                        )}
                      </div>

                      <Link to={`/produto/${product.id}`} className="block">
                        <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {product.shortDescription}
                      </p>

                      <div className="text-[10px] font-mono text-zinc-500">
                        SKU: {product.sku || 'N/A'} · Estoque: {product.stock} un.
                      </div>
                    </div>

                    {/* Pricing and Actions */}
                    <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono font-black text-xl text-white">
                          R$ {price.toFixed(2).replace('.', ',')}
                        </span>
                        {hasPromo && (
                          <span className="font-mono text-xs text-zinc-500 line-through">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>

                      {feedback[product.id] && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/30 text-xs text-amber-300 text-center font-medium">
                          {feedback[product.id]}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/produto/${product.id}`}
                          className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white text-xs font-bold text-center transition-colors"
                        >
                          Ver Detalhes
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          disabled={isOutOfStock}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isOutOfStock
                              ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-800'
                              : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-105 text-zinc-950 font-black shadow-md shadow-amber-500/15'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isOutOfStock ? 'Esgotado' : 'Adicionar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp CTA */}
      <FloatingWhatsApp />
    </div>
  );
};
