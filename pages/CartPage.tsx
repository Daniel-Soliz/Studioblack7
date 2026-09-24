import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  Store 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Header, Footer, FloatingWhatsApp } from '../components';

export const CartPage: React.FC = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    shipping, 
    shippingMethod, 
    setShippingMethod, 
    total,
    clearCart 
  } = useCart();
  const navigate = useNavigate();

  const shippingOptions = [
    { name: 'Retirada no Studio Black7 (Gratuita)', cost: 0, desc: 'R. Boa Vista — Jardim Paulistano' },
    { name: 'Entrega Expressa Zona Norte', cost: 15.00, desc: 'Entrega motoboy para Zona Norte de SP' },
    { name: 'Envio Padrão São Paulo Capital', cost: 25.00, desc: 'Envio via transportadora/correios' },
  ];

  if (cart.length === 0) {
    return (
      <div className="pt-36 pb-28 min-h-screen bg-[#08080a] text-center px-4">
        <div className="max-w-md mx-auto p-10 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto text-zinc-400">
            <ShoppingBag className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="font-['Cinzel'] text-2xl font-bold text-white">Seu carrinho está vazio</h1>
            <p className="text-xs text-zinc-400">
              Você ainda não adicionou nenhum cosmético ao seu carrinho. Conheça nossa linha completa de produtos para cabelo e barba.
            </p>
          </div>

          <Link
            to="/loja"
            className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
          >
            <span>Explorar Loja Studio Black7</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#08080a] text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800/80">
            <Link
              to="/loja"
              id="btn-continuar-comprando-carrinho"
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/60 text-zinc-200 hover:text-amber-400 text-xs sm:text-sm font-bold transition-all group shadow-lg"
              title="Continuar Comprando na Loja"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
              <span>Continuar Comprando</span>
            </Link>

            <nav className="flex items-center gap-2 text-xs text-zinc-400">
              <Link to="/" className="hover:text-amber-400 transition-colors">Início</Link>
              <span className="text-zinc-600">/</span>
              <Link to="/loja" className="hover:text-amber-400 transition-colors">Loja</Link>
              <span className="text-zinc-600">/</span>
              <span className="text-amber-400 font-semibold">Meu Carrinho</span>
            </nav>
          </div>

          {/* Page Header */}
          <div className="mb-10 space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Finalização de Compra
          </span>
          <h1 className="font-['Cinzel'] text-3xl sm:text-4xl font-black text-white">
            Meu Carrinho
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden divide-y divide-zinc-800 shadow-xl">
              {cart.map((item) => {
                const unitPrice = item.product.salePrice ?? item.product.price;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.thumbnail || item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-xl object-cover bg-black/40 border border-zinc-800 shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          {item.product.category}
                        </span>
                        <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono">
                          R$ {unitPrice.toFixed(2).replace('.', ',')} cada
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Estoque disponível: {item.product.stock} un.
                        </p>
                      </div>
                    </div>

                    {/* Quantity & Delete Controls */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
                      <div className="flex items-center rounded-xl bg-black/50 border border-zinc-800 p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-white font-bold"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-mono font-bold text-white text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-white font-bold"
                          disabled={item.quantity >= item.product.stock}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-base text-white block">
                          R$ {itemTotal.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between pt-2">
              <Link
                to="/loja"
                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continuar Comprando</span>
              </Link>

              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
              >
                Esvaziar Carrinho
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary & Shipping Selection */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6 shadow-xl">
              <h2 className="font-['Cinzel'] text-xl font-bold text-white border-b border-zinc-800 pb-3">
                Resumo do Pedido
              </h2>

              {/* Shipping Method Selector */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                  Opções de Entrega / Retirada
                </span>
                <div className="space-y-2">
                  {shippingOptions.map(opt => (
                    <label
                      key={opt.name}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        shippingMethod === opt.name
                          ? 'bg-amber-400/10 border-amber-400/60 text-white'
                          : 'bg-black/30 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingOption"
                        checked={shippingMethod === opt.name}
                        onChange={() => setShippingMethod(opt.name, opt.cost)}
                        className="mt-1 accent-amber-400"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between items-center font-bold">
                          <span>{opt.name}</span>
                          <span className="font-mono text-amber-400">
                            {opt.cost === 0 ? 'Grátis' : `R$ ${opt.cost.toFixed(2).replace('.', ',')}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Calculations */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-800 text-sm">
                <div className="flex justify-between text-zinc-400 text-xs">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-zinc-200">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400 text-xs">
                  <span>Frete</span>
                  <span className="font-mono font-bold text-amber-400">
                    {shipping === 0 ? 'Gratuito' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total</span>
                  <span className="font-mono font-black text-xl text-amber-400">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Advance to Checkout CTA */}
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Avançar para Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Pedido registrado com segurança e suporte direto</span>
              </div>
            </div>
          </div>

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
