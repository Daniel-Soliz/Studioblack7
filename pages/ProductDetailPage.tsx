import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  MessageCircle, 
  Star, 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  ChevronRight, 
  Sparkles, 
  ZoomIn, 
  X,
  Check
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { WHATSAPP_RAW } from '../data/barbershop';
import { Header, Footer, FloatingWhatsApp } from '../components';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useStore();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const product = products.find(p => p.id === id || p.slug === id);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [feedback, setFeedback] = useState<string>('');
  const [zoomModalOpen, setZoomModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images?.[0] || product.thumbnail);
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product, id]);

  if (!product) {
    return (
      <div className="pt-36 pb-24 min-h-screen bg-[#08080a] text-center px-4">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h2 className="font-['Cinzel'] text-2xl font-bold text-white">Produto não encontrado</h2>
          <p className="text-sm text-zinc-400">
            O produto solicitado não foi localizado ou não está mais disponível em nosso catálogo.
          </p>
          <Link
            to="/loja"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Loja</span>
          </Link>
        </div>
      </div>
    );
  }

  const isCatalogOnly = product.price <= 0;
  const isOutOfStock = !isCatalogOnly && ((product.stock ?? 0) <= 0 || product.status === 'out_of_stock');
  const effectivePrice = product.salePrice ?? product.price;
  const hasPromo = !isCatalogOnly && product.salePrice && product.salePrice < product.price;

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id && p.status === 'active')
    .slice(0, 4);

  const handleAddToCart = () => {
    const res = addToCart(product, quantity);
    setFeedback(res.message);
    setTimeout(() => setFeedback(''), 3000);
  };

  const productWhatsAppUrl = `https://wa.me/${WHATSAPP_RAW}?text=${encodeURIComponent(
    `Olá! Vim pelo site do Studio Black7 e tenho interesse no produto ${product.name}.`
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800/80">
            <Link
              to="/loja"
              id="btn-voltar-loja-detalhes"
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/60 text-zinc-200 hover:text-amber-400 text-xs sm:text-sm font-bold transition-all group shadow-lg"
              title="Voltar para a Loja"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar para a Loja</span>
            </Link>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-zinc-400 overflow-x-auto whitespace-nowrap">
              <Link to="/" className="hover:text-amber-400 transition-colors">Início</Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <Link to="/loja" className="hover:text-amber-400 transition-colors">Loja</Link>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-zinc-500">{product.category}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-amber-400 font-medium truncate max-w-[220px]">{product.name}</span>
            </nav>
          </div>

          {/* Main Product Presentation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          
          {/* Left Column: Gallery & Thumbnails */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-black/60 border border-zinc-800 shadow-2xl group">
              <img
                src={selectedImage || product.thumbnail}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Badge & Zoom Button */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && (
                  <span className="px-3 py-1 rounded-md bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg">
                    {product.badge}
                  </span>
                )}
                {isOutOfStock && (
                  <span className="px-3 py-1 rounded-md bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">
                    Produto Esgotado
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setZoomModalOpen(true)}
                className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/70 backdrop-blur-md text-white hover:text-amber-400 transition-colors border border-zinc-700"
                title="Ampliar imagem"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnails Row */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImage === img
                        ? 'border-amber-400 shadow-lg shadow-amber-400/20 scale-105'
                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                  {product.category}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  SKU: {product.sku || 'SB7-N/A'}
                </span>
              </div>

              <h1 className="font-['Cinzel'] text-2xl sm:text-3xl font-black text-white leading-snug">
                {product.name}
              </h1>

              {product.rating && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-300 font-bold">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    ({product.reviewCount || 1} avaliações)
                  </span>
                </div>
              )}
            </div>

            {/* Pricing Box */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-semibold">Preço</span>
                <div className="flex items-baseline gap-3">
                  {isCatalogOnly ? (
                    <span className="font-black text-2xl text-amber-400">Sob consulta</span>
                  ) : (
                    <>
                      <span className="font-mono font-black text-3xl text-white">
                        R$ {effectivePrice.toFixed(2).replace('.', ',')}
                      </span>
                      {hasPromo && (
                        <span className="font-mono text-sm text-zinc-500 line-through">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-zinc-400 block">Disponibilidade</span>
                <span className={`text-xs font-bold ${isCatalogOnly ? 'text-amber-400' : isOutOfStock ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isCatalogOnly ? 'Consulte disponibilidade' : isOutOfStock ? 'Esgotado' : `${product.stock} un. em estoque`}
                </span>
              </div>
            </div>

            {/* Short Description */}
            <p className="text-sm text-zinc-300 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-3 pt-2">
              {isCatalogOnly ? (
                <a
                  href={productWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:brightness-105 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Consultar preço no WhatsApp</span>
                </a>
              ) : !isOutOfStock ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-mono font-bold text-white text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 fill-zinc-950" />
                    <span>Adicionar ao Carrinho</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-4 px-6 rounded-xl bg-zinc-800/60 border border-zinc-750 text-zinc-500 font-bold text-sm uppercase tracking-wider cursor-not-allowed"
                >
                  Produto Esgotado
                </button>
              )}

              {/* Feedback toast */}
              {feedback && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{feedback}</span>
                </div>
              )}

              {/* Direct WhatsApp Ordering */}
              <a
                href={productWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-emerald-400 hover:text-emerald-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-400" />
                <span>Tirar Dúvidas ou Comprar no WhatsApp</span>
              </a>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-850 text-xs text-zinc-400">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-zinc-850">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Garantia de Qualidade Studio Black7</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-zinc-850">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Retirada no Studio ou Entrega ZN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mb-20 p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-8">
          <div className="space-y-3">
            <h2 className="font-['Cinzel'] text-xl font-bold text-white">
              Descrição Completa do Produto
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-4xl">
              {product.description}
            </p>
          </div>

          {product.howToUse && (
            <div className="space-y-3 pt-6 border-t border-zinc-800/80">
              <h3 className="font-['Cinzel'] text-lg font-bold text-amber-400">
                Modo de Uso
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed max-w-4xl">
                {product.howToUse}
              </p>
            </div>
          )}

          {product.benefits && product.benefits.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-zinc-800/80">
              <h3 className="font-['Cinzel'] text-lg font-bold text-amber-400">
                Principais Benefícios
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Related Products: "Você também pode gostar" */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8">
            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                Mais da mesma categoria
              </span>
              <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-white">
                Você também pode gostar
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rel => (
                <Link
                  key={rel.id}
                  to={`/produto/${rel.id}`}
                  className="group rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/40 p-4 space-y-3 transition-all flex flex-col justify-between"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-black/40">
                    <img
                      src={rel.thumbnail || rel.images[0]}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-semibold">{rel.category}</span>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 line-clamp-1">{rel.name}</h3>
                    <p className="font-mono font-black text-sm text-white mt-1">
                      {rel.price <= 0 ? 'Preço sob consulta' : `R$ ${(rel.salePrice ?? rel.price).toFixed(2).replace('.', ',')}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        </div>
      </main>

      {/* Modal Zoom */}
      {zoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              type="button"
              onClick={() => setZoomModalOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-amber-400 bg-zinc-800 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage || product.thumbnail}
              alt={product.name}
              className="max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp CTA */}
      <FloatingWhatsApp />
    </div>
  );
};
