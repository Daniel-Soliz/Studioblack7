import React from 'react';
import { MessageCircle, Eye, Star, ShieldCheck, Check } from 'lucide-react';
import { Product } from '../types';
import { createWhatsAppLink } from '../data/products';
import { trackWhatsAppClick, trackProductView } from '../utils/analytics';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackWhatsAppClick(product.id, product.name);
    const url = createWhatsAppLink(product.name);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = () => {
    trackProductView(product.id, product.name);
    onOpenDetail(product);
  };

  // Format price
  const formattedPrice = product.price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  const formattedOriginalPrice = product.originalPrice?.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between rounded-xl bg-[#111114] border border-zinc-800/90 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer overflow-hidden"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isBestSeller && (
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-zinc-950 shadow-md">
              Mais Vendido
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-900/90 text-amber-300 border border-amber-400/40 backdrop-blur-sm">
              Lançamento
            </span>
          )}
        </div>

        {/* Category tag */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-900/90 text-zinc-300 border border-zinc-700/60 backdrop-blur-sm">
            {product.volumeOrSize}
          </span>
        </div>

        {/* Studio Black7 Seal Overlay */}
        <div className="absolute bottom-2 left-2.5 z-10 flex items-center gap-1 text-[10px] font-semibold text-amber-400/90 bg-zinc-950/90 px-2 py-0.5 rounded border border-amber-500/20 backdrop-blur-sm">
          <ShieldCheck className="w-3 h-3 text-amber-400" />
          <span>Studio Black7</span>
        </div>

        {/* Quick view hover icon button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="absolute bottom-2 right-2.5 z-10 p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Ver detalhes"
          aria-label="Ver detalhes do produto"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/80">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-[11px] font-medium">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-zinc-500">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm sm:text-base text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Subtitle */}
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {product.subtitle}
          </p>
        </div>

        {/* Price & Installments */}
        <div className="pt-2 border-t border-zinc-800/60">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-white font-['Plus_Jakarta_Sans']">
              {formattedPrice}
            </span>
            {formattedOriginalPrice && (
              <span className="text-xs text-zinc-500 line-through">
                {formattedOriginalPrice}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400">
            ou até 3x sem juros no cartão
          </p>
        </div>

        {/* Primary Actions */}
        <div className="pt-1 flex flex-col gap-2">
          {/* WhatsApp Direct Buy Button */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 transition-all duration-200 active:scale-98 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>Comprar pelo WhatsApp</span>
          </button>

          {/* Secondary view button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-full py-1.5 text-[11px] text-zinc-400 hover:text-amber-300 font-medium text-center transition-colors"
          >
            Ver detalhes e modo de uso
          </button>
        </div>
      </div>
    </div>
  );
};
