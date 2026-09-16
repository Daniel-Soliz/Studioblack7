import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Star, Sparkles, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';

export const FeaturedProductsSection: React.FC = () => {
  const { products } = useStore();
  const { addToCart } = useCart();
  const [feedback, setFeedback] = useState<{ [id: string]: string }>({});

  const featured = products
    .filter(p => p.status !== 'inactive')
    .slice(0, 4);

  const handleAdd = (p: typeof products[0]) => {
    const res = addToCart(p, 1);
    setFeedback(prev => ({ ...prev, [p.id]: res.message }));
    setTimeout(() => {
      setFeedback(prev => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
    }, 2500);
  };

  return (
    <section id="loja-destaques" className="py-24 bg-[#09090d] relative overflow-hidden border-t border-zinc-800/80">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio Black7 Store</span>
            </div>
            <h2 className="font-['Cinzel'] text-3xl sm:text-4xl font-extrabold text-white tracking-wide">
              Produtos em Destaque
            </h2>
            <p className="text-base text-zinc-400 max-w-xl">
              Leve a experiência Studio Black7 para sua rotina diária com cosméticos desenvolvidos para máxima performance.
            </p>
          </div>

          <Link
            to="/loja"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/40 text-amber-400 font-bold text-xs uppercase tracking-wider transition-all self-start md:self-auto group"
          >
            <span>Ver Todos os Produtos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => {
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
                  </div>

                  {/* Pricing and Actions */}
                  <div className="pt-2 border-t border-zinc-800/80 space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono font-black text-lg text-white">
                        R$ {price.toFixed(2).replace('.', ',')}
                      </span>
                      {hasPromo && (
                        <span className="font-mono text-xs text-zinc-500 line-through">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>

                    {feedback[product.id] && (
                      <div className="p-1.5 rounded bg-amber-500/10 border border-amber-400/30 text-[11px] text-amber-300 text-center font-medium">
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
                        onClick={() => handleAdd(product)}
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

        {/* Lifestyle Banner: "Cuide do seu estilo mesmo fora da cadeira." */}
        <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#121218] via-zinc-900 to-[#121218] border border-amber-400/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              Rotina & Autoestima
            </span>
            <h3 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-white leading-snug">
              Cuide do seu estilo mesmo fora da cadeira.
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              O mesmo padrão de cuidado e finalização que você recebe na bancada do Ray Silva, agora no seu banheiro todos os dias.
            </p>
          </div>

          <Link
            to="/loja"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:brightness-105 transition-all shrink-0"
          >
            <ShoppingBag className="w-4 h-4 fill-zinc-950" />
            <span>Ver Todos os Produtos</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
