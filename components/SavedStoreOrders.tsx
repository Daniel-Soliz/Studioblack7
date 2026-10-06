import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { PaymentService } from '../services/paymentService';
import { readStorePayments, rememberStorePayment, removeStorePayment, SavedStorePayment, STORE_PAYMENTS_EVENT } from '../services/savedStorePayments';

export function SavedStoreOrders() {
  const [records, setRecords] = useState(readStorePayments);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const { products, updateOrderStatus } = useStore();
  const { cart, addToCart } = useCart();
  useEffect(() => {
    let active = true;
    const reload = () => setRecords(readStorePayments());
    window.addEventListener(STORE_PAYMENTS_EVENT, reload);
    const verify = async () => {
      for (const record of readStorePayments()) {
        if (record.state !== 'pending') continue;
        try {
          const result = await PaymentService.checkStorePayment(record.pix.orderId);
          if (!active) return;
          const current = readStorePayments().find(r => r.order.id === record.order.id);
          if (!current || current.state !== 'pending') continue;
          const state = result.paid ? 'paid' : result.closed ? 'expired' : 'pending';
          if (state !== 'pending') {
            rememberStorePayment({ ...current, state });
            updateOrderStatus(record.order.id, state === 'paid' ? 'confirmed' : 'cancelled', state === 'paid' ? 'paid' : 'pending');
          }
        } catch { /* Keep the saved payment available while the provider is unavailable. */ }
      }
    };
    void verify();
    return () => { active = false; window.removeEventListener(STORE_PAYMENTS_EVENT, reload); };
  }, []);
  const cancel = async (record: SavedStorePayment) => {
    setBusy(record.order.id); setNotice('');
    try {
      await PaymentService.cancelStorePayment(record.pix.orderId);
      updateOrderStatus(record.order.id, 'cancelled', 'pending');
      rememberStorePayment({ ...record, state: 'cancelled' });
      setNotice('Pedido cancelado. Você pode devolver os produtos ao carrinho.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Não foi possível cancelar. Tente novamente.'); }
    finally { setBusy(''); }
  };
  const restore = (record: SavedStorePayment) => {
    const items = record.order.items.map(item => ({ item, product: products.find(p => p.id === item.productId) }));
    if (items.some(({ item, product }) => !product || product.status !== 'active' || product.stock < item.quantity + (cart.find(c => c.product.id === item.productId)?.quantity || 0))) {
      setNotice('Algum produto não está disponível nessa quantidade. Confira o estoque na loja.'); return;
    }
    items.forEach(({ item, product }) => addToCart(product!, item.quantity));
    removeStorePayment(record.order.id);
    setNotice('Produtos devolvidos ao carrinho. Confira os preços atuais antes de finalizar.');
  };
  if (!records.length && !notice) return null;
  return <section className="w-full max-w-3xl mx-auto mb-8 text-left space-y-4" aria-label="Seus pedidos salvos">
    <h2 className="text-xl font-bold text-white">Seus pedidos neste celular</h2>
    <p className="text-sm text-zinc-400">Continue seu Pix ou veja os detalhes da compra.</p>
    {notice && <p role="status" className="p-3 rounded-xl bg-zinc-900 text-amber-300 text-sm">{notice}</p>}
    {records.map(record => <article key={record.order.id} className="min-w-0 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap justify-between gap-2"><strong className="text-white">Pedido #{record.order.orderNumber}</strong><span className={record.state === 'paid' ? 'text-emerald-400' : 'text-amber-300'}>{({ pending: 'Aguardando Pix', paid: 'Pedido confirmado', expired: 'Pix vencido', cancelled: 'Pedido cancelado' })[record.state]}</span></div>
      {record.order.items.map((item, i) => <div key={i} className="flex items-center gap-3 min-w-0">
        {item.image && <img src={item.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />}
        <p className="text-sm text-zinc-200 break-words">{item.quantity} × {item.name || item.productName}</p>
      </div>)}
      <p className="font-bold text-amber-400">Total: {record.pix.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
      {(record.state === 'pending' || record.state === 'paid') ? <div className="space-y-2">
        <Link to={'/checkout?pedido=' + encodeURIComponent(record.order.id)} className="block w-full rounded-xl bg-amber-400 py-3 text-center font-bold text-black">{record.state === 'paid' ? 'Ver meu pedido' : 'Continuar pagamento'}</Link>
        {record.state === 'pending' && <button disabled={!!busy} onClick={() => void cancel(record)} className="w-full rounded-xl border border-red-400/40 py-3 text-red-300 disabled:opacity-50">{busy === record.order.id ? 'Cancelando…' : 'Cancelar pedido'}</button>}
      </div> : <div className="space-y-2">
        <button onClick={() => restore(record)} className="w-full rounded-xl bg-amber-400 py-3 font-bold text-black">Voltar produtos ao carrinho</button>
        <button onClick={() => removeStorePayment(record.order.id)} className="w-full py-2 text-sm text-zinc-400">Remover da minha lista</button>
      </div>}
    </article>)}
  </section>;
}
