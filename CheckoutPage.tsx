import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  MessageCircle, 
  ShoppingBag, 
  AlertCircle, 
  CreditCard,
  Building2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { PaymentService } from '../services/paymentService';
import { WHATSAPP_RAW } from '../data/barbershop';
import { Order } from '../types';
import { Header, Footer, FloatingWhatsApp } from '../components';

export const CheckoutPage: React.FC = () => {
  const { 
    cart, 
    subtotal, 
    shipping, 
    shippingMethod, 
    total, 
    clearCart 
  } = useCart();
  const { createOrder } = useStore();
  const navigate = useNavigate();

  // Customer Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [state, setState] = useState('SP');
  const [city, setCity] = useState('São Paulo');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (cart.length === 0 && !completedOrder) {
    navigate('/carrinho');
    return null;
  }

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Por favor, informe um número de telefone/WhatsApp.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Process payment service contract check
      const paymentResult = await PaymentService.processPayment({
        orderId: 'pending',
        total,
        customerName: name,
        customerEmail: email
      });

      // 2. Register real order in Store / StorageService
      const newOrder = createOrder({
        customer: {
          name,
          email,
          phone,
          address: {
            street: address || 'Retirada no Balcão',
            number: number || 'S/N',
            complement,
            neighborhood: neighborhood || 'Zona Norte',
            city,
            state,
            postalCode
          }
        },
        items: cart.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          name: i.product.name,
          quantity: i.quantity,
          unitPrice: i.product.salePrice ?? i.product.price,
          price: i.product.salePrice ?? i.product.price,
          totalPrice: (i.product.salePrice ?? i.product.price) * i.quantity,
          image: i.product.thumbnail || i.product.images[0] || '',
          sku: i.product.sku || ''
        })),
        subtotal,
        shipping,
        shippingMethod,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'Configurado Posteriormente',
        notes
      });

      setCompletedOrder(newOrder);
      clearCart();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order is completed, show the Confirmation Screen
  if (completedOrder) {
    const itemsSummary = completedOrder.items
      .map(i => `• ${i.quantity}x ${i.name} (R$ ${i.totalPrice.toFixed(2).replace('.', ',')})`)
      .join('\n');

    const whatsappOrderMessage = `*NOVO PEDIDO NO SITE - STUDIO BLACK7*\n` +
      `*Número:* #${completedOrder.orderNumber}\n` +
      `*Cliente:* ${completedOrder.customer.name}\n` +
      `*Telefone:* ${completedOrder.customer.phone}\n` +
      `*Entrega:* ${completedOrder.shippingMethod}\n\n` +
      `*Itens do Pedido:*\n${itemsSummary}\n\n` +
      `*Subtotal:* R$ ${completedOrder.subtotal.toFixed(2).replace('.', ',')}\n` +
      `*Frete:* R$ ${completedOrder.shipping.toFixed(2).replace('.', ',')}\n` +
      `*Total Geral:* R$ ${completedOrder.total.toFixed(2).replace('.', ',')}\n\n` +
      `_Aguardando instruções para conclusão e retirada/entrega._`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_RAW}?text=${encodeURIComponent(whatsappOrderMessage)}`;

    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#08080a] px-4">
        <div className="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl bg-zinc-900 border border-amber-400/40 space-y-8 shadow-2xl">
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h1 className="font-['Cinzel'] text-2xl sm:text-3xl font-black text-white">
              Pedido Realizado com Sucesso!
            </h1>
            <p className="text-sm text-zinc-300">
              Seu pedido foi registrado no sistema do Studio Black7 sob o número:
            </p>
            <div className="inline-block px-5 py-2 rounded-xl bg-black border border-amber-400/40 text-amber-400 font-mono font-black text-xl tracking-wider">
              #{completedOrder.orderNumber}
            </div>
          </div>

          {/* Payment Notice */}
          <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs text-amber-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-bold">Aviso de Pagamento:</strong>
              <p>Pagamento online será configurado posteriormente.</p>
              <p className="text-zinc-400">
                Você pode acertar o pagamento via Pix ou Cartão diretamente no WhatsApp da barbearia ou presencialmente no momento da retirada.
              </p>
            </div>
          </div>

          {/* Order Details Card */}
          <div className="p-5 rounded-2xl bg-black/50 border border-zinc-800 space-y-4 text-xs">
            <div className="flex justify-between font-bold text-white border-b border-zinc-800 pb-2">
              <span>Cliente:</span>
              <span className="text-amber-400">{completedOrder.customer.name}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Opção de Entrega:</span>
              <span>{completedOrder.shippingMethod}</span>
            </div>
            <div className="space-y-1.5 pt-2">
              <span className="font-bold text-zinc-400 block">Itens:</span>
              {completedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-zinc-300">
                  <span>{it.quantity}x {it.name}</span>
                  <span className="font-mono">R$ {it.totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-sm text-white pt-3 border-t border-zinc-800">
              <span>Total a Pagar:</span>
              <span className="font-mono text-base text-amber-400">
                R$ {completedOrder.total.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* WhatsApp Confirmation CTA */}
          <div className="space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 fill-zinc-950" />
              <span>Enviar Resumo do Pedido no WhatsApp (+55 11 98726-7087)</span>
            </a>

            <Link
              to="/loja"
              className="w-full py-3.5 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-bold uppercase tracking-wider text-center block transition-colors"
            >
              Continuar Navegando na Loja
            </Link>
          </div>

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
              id="btn-continuar-comprando-checkout"
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/60 text-zinc-200 hover:text-amber-400 text-xs sm:text-sm font-bold transition-all group shadow-lg"
              title="Continuar Comprando na Loja"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
              <span>Continuar Comprando</span>
            </Link>

            <div className="flex items-center gap-4 text-xs">
              <Link
                to="/carrinho"
                className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-amber-400 font-semibold transition-colors"
              >
                <span>Voltar ao Carrinho</span>
              </Link>
              <span className="text-zinc-600">/</span>
              <span className="text-amber-400 font-semibold">Checkout</span>
            </div>
          </div>

          <div className="mb-10 space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Finalização Segura
          </span>
          <h1 className="font-['Cinzel'] text-3xl sm:text-4xl font-black text-white">
            Checkout do Pedido
          </h1>
        </div>

        <form onSubmit={handleFinishOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Customer and Delivery Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Customer Details Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl">
              <h2 className="font-['Cinzel'] text-lg font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
                <span>1. Dados Pessoais</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-750 focus:border-amber-400 focus:outline-none text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-750 focus:border-amber-400 focus:outline-none text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="joao@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-750 focus:border-amber-400 focus:outline-none text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address / Delivery Details */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl">
              <h2 className="font-['Cinzel'] text-lg font-bold text-white border-b border-zinc-800 pb-3">
                2. Endereço de Entrega / Local de Retirada
              </h2>

              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 text-xs text-zinc-300">
                  <span className="font-bold text-amber-400 block mb-0.5">Método selecionado:</span>
                  <span>{shippingMethod}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="00000-000"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-750 focus:border-amber-400 focus:outline-none text-sm text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Rua / Logradouro
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex: Tv. União ou Av. Principal"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-750 focus:border-amber-400 focus:outline-none text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Ex: 4"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-750 focus:border-amber-400 focus:outline-none text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Jardim Paulistano"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-750 focus:border-amber-400 focus:outline-none text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                      Cidade / UF
                    </label>
                    <input
                      type="text"
                      value={`${city} - ${state}`}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-zinc-800 text-sm text-zinc-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Instruções ou Observações do Pedido (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Alguma instrução especial para entrega ou retirada..."
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-zinc-750 focus:border-amber-400 focus:outline-none text-sm text-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Section Contract */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-amber-400/30 space-y-4 shadow-xl">
              <h2 className="font-['Cinzel'] text-lg font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>3. Forma de Pagamento</span>
              </h2>

              <div className="p-4 rounded-xl bg-black/60 border border-amber-400/30 space-y-2">
                <p className="text-sm font-bold text-amber-400">
                  Pagamento online será configurado posteriormente.
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Para sua total segurança, dados sensíveis de cartão não são coletados pelo site. Ao confirmar, seu pedido será salvo diretamente e você poderá efetuar o pagamento via Pix ou presencialmente na retirada no Studio Black7.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Final Submit */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-6 shadow-xl sticky top-24">
              <h2 className="font-['Cinzel'] text-xl font-bold text-white border-b border-zinc-800 pb-3">
                Resumo da Compra
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const unit = item.product.salePrice ?? item.product.price;
                  return (
                    <div key={item.product.id} className="flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-bold text-amber-400">{item.quantity}x</span>
                        <span className="text-zinc-200 truncate">{item.product.name}</span>
                      </div>
                      <span className="font-mono font-bold text-white shrink-0">
                        R$ {(unit * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Calculations */}
              <div className="space-y-2 pt-4 border-t border-zinc-800 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-200">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Frete ({shippingMethod})</span>
                  <span className="font-mono text-amber-400">
                    {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total Final</span>
                  <span className="font-mono font-black text-2xl text-amber-400">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Registrando Pedido...</span>
                ) : (
                  <>
                    <span>Confirmar e Finalizar Pedido</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Pedido registrado com protocolo e rastreamento</span>
              </div>
            </div>
          </div>

        </form>

        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp CTA */}
      <FloatingWhatsApp />
    </div>
  );
};
