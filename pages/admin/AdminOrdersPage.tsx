import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  MessageCircle, 
  X, 
  Check, 
  Clock, 
  Truck, 
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  Save
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, saveOrder, deleteOrder } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [feedback, setFeedback] = useState('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredOrders = orders.filter(o => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customer.name.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }

    if (statusFilter !== 'all' && o.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const handleUpdateStatus = (orderId: string, status: Order['status'], payment?: Order['paymentStatus']) => {
    updateOrderStatus(orderId, status, payment);
    setFeedback(`Status do pedido atualizado com sucesso.`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status, paymentStatus: payment || prev.paymentStatus } : null);
    }
    setTimeout(() => setFeedback(''), 3000);
  };

  const emptyOrder = (): Order => {
    const now = new Date().toISOString();
    return {
      id: `ord-${Date.now()}`,
      orderNumber: `SB7-${Date.now().toString().slice(-6)}`,
      customer: {
        name: '',
        email: '',
        phone: '',
        address: {
          street: '',
          number: '',
          neighborhood: '',
          city: 'São Paulo',
          state: 'SP',
          postalCode: ''
        }
      },
      items: [],
      subtotal: 0,
      shipping: 0,
      shippingMethod: 'Retirada no Studio Black7',
      total: 0,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'A combinar',
      notes: '',
      createdAt: now,
      updatedAt: now
    };
  };

  const handleSaveOrder = () => {
    if (!editingOrder) return;
    if (!editingOrder.customer.name.trim() || !editingOrder.customer.phone.trim()) {
      setFeedback('Preencha pelo menos o nome e o telefone do cliente.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }
    const subtotal = Number(editingOrder.subtotal) || 0;
    const shipping = Number(editingOrder.shipping) || 0;
    const total = Number(editingOrder.total) || subtotal + shipping;
    const saved = saveOrder({ ...editingOrder, subtotal, shipping, total });
    setEditingOrder(null);
    setIsCreating(false);
    setSelectedOrder(saved);
    setFeedback(isCreating ? 'Pedido adicionado com sucesso.' : 'Pedido editado com sucesso.');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleDeleteOrder = (order: Order) => {
    const ok = window.confirm(`Excluir o pedido #${order.orderNumber}? Esta ação não pode ser desfeita.`);
    if (!ok) return;
    if (deleteOrder(order.id)) {
      if (selectedOrder?.id === order.id) setSelectedOrder(null);
      if (editingOrder?.id === order.id) setEditingOrder(null);
      setFeedback('Pedido excluído com sucesso.');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase">Pendente</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase">Confirmado</span>;
      case 'preparing':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold uppercase">Em Preparação</span>;
      case 'shipped':
        return <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold uppercase">Pronto / Enviado</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">Concluído</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase">Cancelado</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  const openWhatsAppWithCustomer = (order: Order) => {
    const rawPhone = order.customer.phone.replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 11 ? `55${rawPhone}` : rawPhone;
    const msg = `Olá, ${order.customer.name}! Aqui é do Studio Black7 sobre o seu pedido #${order.orderNumber}.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <AdminLayout title="Gestão de Pedidos">
      <div className="space-y-6">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Pedidos da Loja ({orders.length})</h2>
            <p className="text-xs text-zinc-400">Controle de solicitações, status de entrega e contato com clientes.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setEditingOrder(emptyOrder());
                setIsCreating(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider hover:brightness-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Pedido</span>
            </button>
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar pedido, cliente ou tel..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-zinc-750 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/50 border border-zinc-750 text-xs text-zinc-200 focus:border-amber-400 focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="preparing">Em Preparação</option>
              <option value="shipped">Pronto / Enviado</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {feedback && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Orders Table */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-black/60 text-zinc-400 uppercase tracking-wider font-bold border-b border-zinc-800 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Pedido</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Itens</th>
                  <th className="py-3 px-4">Valor Total</th>
                  <th className="py-3 px-4">Status Pedido</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500">
                      Nenhum pedido encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  [...filteredOrders].reverse().map(order => (
                    <tr key={order.id} className="hover:bg-zinc-850/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        #{order.orderNumber}
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')} {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{order.customer.name}</span>
                        <span className="text-[11px] text-zinc-500 font-mono">{order.customer.phone}</span>
                      </td>

                      <td className="py-3 px-4 text-zinc-300">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} un. ({order.items.length} {order.items.length === 1 ? 'tipo' : 'tipos'})
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold uppercase ${
                          order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrder(JSON.parse(JSON.stringify(order)));
                              setIsCreating(false);
                            }}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-blue-500 text-zinc-200 transition-colors"
                            title="Editar pedido"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order)}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-red-600 text-zinc-200 transition-colors"
                            title="Excluir pedido"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Order Modal */}
        {editingOrder && (
          <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="font-['Cinzel'] font-bold text-lg text-white">
                    {isCreating ? 'Adicionar Pedido' : `Editar Pedido #${editingOrder.orderNumber}`}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Edite os dados do cliente, status e valores do pedido.</p>
                </div>
                <button type="button" onClick={() => setEditingOrder(null)} className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-400">Número do pedido</span>
                  <input value={editingOrder.orderNumber} onChange={e => setEditingOrder({...editingOrder, orderNumber: e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-sm text-white focus:border-amber-400 focus:outline-none" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-400">Cliente</span>
                  <input value={editingOrder.customer.name} onChange={e => setEditingOrder({...editingOrder, customer:{...editingOrder.customer, name:e.target.value}})} className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-sm text-white focus:border-amber-400 focus:outline-none" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-400">Telefone / WhatsApp</span>
                  <input value={editingOrder.customer.phone} onChange={e => setEditingOrder({...editingOrder, customer:{...editingOrder.customer, phone:e.target.value}})} className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-sm text-white focus:border-amber-400 focus:outline-none" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-400">E-mail</span>
                  <input value={editingOrder.customer.email} onChange={e => setEditingOrder({...editingOrder, customer:{...editingOrder.customer, email:e.target.value}})} className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-sm text-white focus:border-amber-400 focus:outline-none" />
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-400">Status do pedido</span>
                  <select value={editingOrder.status} onChange={e => setEditingOrder({...editingOrder, status:e.target.value as Order['status']})} className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-sm text-white focus:border-amber-400 focus:outline-none">
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="processing">Processando</option>
                    <option value="preparing">Em preparação</option>
                    <option value="shipped">Pronto / Enviado</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-400">Pagamento</span>
                  <select value={editingOrder.paymentStatus} onChange={e => setEditingOrder({...editingOrder, paymentStatus:e.target.value as Order['paymentStatus']})} className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-sm text-white focus:border-amber-400 focus:outline-none">
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="failed">Falhou</option>
                    <option value="refunded">Reembolsado</option>
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-400">Subtotal (R$)</span>
                  <input type="number" min="0" step="0.01" value={editingOrder.subtotal} onChange={e => setEditingOrder({...editingOrder, subtotal:Number(e.target.value)})} className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-sm text-white focus:border-amber-400 focus:outline-none" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-400">Frete (R$)</span>
                  <input type="number" min="0" step="0.01" value={editingOrder.shipping} onChange={e => setEditingOrder({...editingOrder, shipping:Number(e.target.value)})} className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-sm text-white focus:border-amber-400 focus:outline-none" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-400">Total (R$)</span>
                  <input type="number" min="0" step="0.01" value={editingOrder.total} onChange={e => setEditingOrder({...editingOrder, total:Number(e.target.value)})} className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-sm text-white focus:border-amber-400 focus:outline-none" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-400">Forma de pagamento</span>
                  <input value={editingOrder.paymentMethod} onChange={e => setEditingOrder({...editingOrder, paymentMethod:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-sm text-white focus:border-amber-400 focus:outline-none" />
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-xs font-bold text-zinc-400">Entrega / retirada</span>
                  <input value={editingOrder.shippingMethod} onChange={e => setEditingOrder({...editingOrder, shippingMethod:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-sm text-white focus:border-amber-400 focus:outline-none" />
                </label>
                <label className="space-y-1.5 sm:col-span-2">
                  <span className="text-xs font-bold text-zinc-400">Observações</span>
                  <textarea rows={3} value={editingOrder.notes || ''} onChange={e => setEditingOrder({...editingOrder, notes:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-sm text-white focus:border-amber-400 focus:outline-none resize-none" />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="button" onClick={() => setEditingOrder(null)} className="sm:flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider">
                  Cancelar
                </button>
                <button type="button" onClick={handleSaveOrder} className="sm:flex-1 py-3 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>{isCreating ? 'Adicionar Pedido' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Cinzel'] font-bold text-lg text-white">
                      Pedido #{selectedOrder.orderNumber}
                    </h3>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Registrado em: {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Update Form Controls */}
              <div className="p-4 rounded-2xl bg-black/50 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-300 uppercase block">
                  Atualizar Status Operacional
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['pending', 'confirmed', 'preparing', 'completed'] as Order['status'][]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        selectedOrder.status === st
                          ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
                          : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {st === 'pending' ? 'Pendente' : st === 'confirmed' ? 'Confirmado' : st === 'preparing' ? 'Preparando' : 'Concluído'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-zinc-850 border border-zinc-800 space-y-2">
                  <span className="font-bold text-amber-400 uppercase tracking-wider block">
                    Dados do Cliente
                  </span>
                  <p className="text-white font-bold text-sm">{selectedOrder.customer.name}</p>
                  <p className="text-zinc-300">WhatsApp: {selectedOrder.customer.phone}</p>
                  <p className="text-zinc-400">E-mail: {selectedOrder.customer.email}</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-850 border border-zinc-800 space-y-2">
                  <span className="font-bold text-amber-400 uppercase tracking-wider block">
                    Entrega / Retirada
                  </span>
                  <p className="text-white font-semibold">{selectedOrder.shippingMethod}</p>
                  {selectedOrder.customer.address && (
                    <p className="text-zinc-400">
                      {selectedOrder.customer.address.street}, {selectedOrder.customer.address.number}
                      {selectedOrder.customer.address.neighborhood && ` - ${selectedOrder.customer.address.neighborhood}`}
                      <br />
                      {selectedOrder.customer.address.city} - {selectedOrder.customer.address.state}
                      {selectedOrder.customer.address.postalCode && ` (${selectedOrder.customer.address.postalCode})`}
                    </p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-300 uppercase block">
                  Itens Comprados
                </span>
                <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden bg-black/40">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-[11px] text-zinc-500">
                          {item.quantity} un. x R$ {item.unitPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-white">
                        R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-zinc-200">R$ {selectedOrder.subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Frete:</span>
                  <span className="font-mono text-amber-400">
                    {selectedOrder.shipping === 0 ? 'Grátis' : `R$ ${selectedOrder.shipping.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total Geral:</span>
                  <span className="font-mono text-amber-400 text-base">R$ {selectedOrder.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* WhatsApp CTA Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => openWhatsAppWithCustomer(selectedOrder)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:brightness-105 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-zinc-950" />
                  <span>Falar com o Cliente no WhatsApp ({selectedOrder.customer.phone})</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
