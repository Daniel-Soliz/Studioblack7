import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Minus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  Check 
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { StorageService } from '../../services/storageService';
import { Product, InventoryMovement } from '../../types';

export const AdminInventoryPage: React.FC = () => {
  const { products, saveProduct, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [movements, setMovements] = useState<InventoryMovement[]>(() => StorageService.getInventoryMovements());
  const [feedback, setFeedback] = useState('');

  // Quick adjust modal / inline state
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('1');
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustReason, setAdjustReason] = useState<string>('Entrada de novo lote');

  const lowStockThreshold = settings.lowStockThreshold || 3;

  const filteredProducts = products.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
  });

  const handleQuickAdjust = (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    const updated: Product = {
      ...product,
      stock: newStock,
      status: newStock <= 0 ? 'out_of_stock' : product.status === 'out_of_stock' ? 'active' : product.status
    };
    saveProduct(updated);

    // Record movement
    const mov: InventoryMovement = {
      id: `mov_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type: delta > 0 ? 'in' : 'out',
      quantity: Math.abs(delta),
      reason: delta > 0 ? 'Ajuste rápido (+)' : 'Ajuste rápido (-)',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      performedBy: 'Ray Silva (Admin)'
    };
    StorageService.addInventoryMovement(mov);
    setMovements(StorageService.getInventoryMovements());

    setFeedback(`Estoque de "${product.name}" ajustado para ${newStock} un.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleDetailedAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const qty = parseInt(adjustAmount, 10);
    if (isNaN(qty) || qty <= 0) return;

    const delta = adjustType === 'in' ? qty : -qty;
    const newStock = Math.max(0, adjustingProduct.stock + delta);

    const updated: Product = {
      ...adjustingProduct,
      stock: newStock,
      status: newStock <= 0 ? 'out_of_stock' : adjustingProduct.status === 'out_of_stock' ? 'active' : adjustingProduct.status
    };
    saveProduct(updated);

    const mov: InventoryMovement = {
      id: `mov_${Date.now()}`,
      productId: adjustingProduct.id,
      productName: adjustingProduct.name,
      type: adjustType,
      quantity: qty,
      reason: adjustReason || (adjustType === 'in' ? 'Reposição de estoque' : 'Ajuste de inventário'),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      performedBy: 'Ray Silva (Admin)'
    };
    StorageService.addInventoryMovement(mov);
    setMovements(StorageService.getInventoryMovements());

    setFeedback(`Estoque de "${adjustingProduct.name}" atualizado com sucesso.`);
    setAdjustingProduct(null);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <AdminLayout title="Controle de Estoque">
      <div className="space-y-8">
        
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Posição Geral de Estoque</h2>
            <p className="text-xs text-zinc-400">Controle de unidades, alertas de reposição e histórico de movimentações.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por produto ou SKU..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-zinc-750 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {feedback && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Inventory Items Table */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-black/60 text-zinc-400 uppercase tracking-wider font-bold border-b border-zinc-800 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Estoque Atual</th>
                  <th className="py-3 px-4 text-center">Mínimo</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ajuste Rápido</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredProducts.map(product => {
                  const isZero = product.stock <= 0;
                  const isLow = product.stock > 0 && product.stock <= (product.minStock || lowStockThreshold);

                  return (
                    <tr key={product.id} className="hover:bg-zinc-850/60 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={product.thumbnail || product.images[0]}
                          alt={product.name}
                          className="w-9 h-9 rounded-lg object-cover bg-black/40 border border-zinc-800 shrink-0"
                        />
                        <div className="max-w-xs">
                          <span className="font-bold text-white block truncate">{product.name}</span>
                          <span className="text-[10px] text-zinc-500">{product.category}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400">
                        {product.sku || '-'}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-black text-sm">
                        <span className={isZero ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-emerald-400'}>
                          {product.stock} un.
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-zinc-400">
                        {product.minStock || lowStockThreshold} un.
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isZero ? (
                          <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase">
                            Zerado
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase">
                            Baixo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                            Normal
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-zinc-800">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product, -1)}
                            disabled={product.stock <= 0}
                            className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold disabled:opacity-30"
                            title="Diminuir 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-white text-xs">
                            {product.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product, 1)}
                            className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 flex items-center justify-center font-bold transition-colors"
                            title="Aumentar 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustingProduct(product);
                            setAdjustAmount('5');
                            setAdjustType('in');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 text-xs font-bold transition-colors"
                        >
                          Lançar Ajuste
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Movement History Log */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <h3 className="font-['Cinzel'] font-bold text-sm text-white">
                Histórico Recente de Movimentações
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500">
              {movements.length} registros no livro de estoque
            </span>
          </div>

          {movements.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">Nenhuma movimentação registrada até o momento.</p>
          ) : (
            <div className="divide-y divide-zinc-800 max-h-72 overflow-y-auto">
              {[...movements].reverse().map(mov => (
                <div key={mov.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">{mov.productName}</span>
                    <span className="text-[11px] text-zinc-400">{mov.reason} · Resp: {mov.performedBy}</span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className={`font-mono font-black text-xs ${mov.type === 'in' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {mov.type === 'in' ? `+${mov.quantity}` : `-${mov.quantity}`} un.
                    </span>
                    <span className="text-[10px] text-zinc-500 block font-mono">
                      {new Date(mov.date).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Detailed Adjust */}
        {adjustingProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleDetailedAdjust} className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="font-['Cinzel'] font-bold text-base text-white">
                Ajuste de Estoque: {adjustingProduct.name}
              </h3>

              <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 text-xs flex justify-between">
                <span>Estoque atual:</span>
                <strong className="font-mono text-amber-400">{adjustingProduct.stock} unidades</strong>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Tipo de Movimento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustType('in')}
                      className={`py-2 rounded-xl text-xs font-bold ${adjustType === 'in' ? 'bg-emerald-500 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-300'}`}
                    >
                      + Entrada
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('out')}
                      className={`py-2 rounded-xl text-xs font-bold ${adjustType === 'out' ? 'bg-red-600 text-white font-black' : 'bg-zinc-800 text-zinc-300'}`}
                    >
                      - Saída
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-zinc-750 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Motivo do Ajuste *
                  </label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Ex: Recebimento fornecedor, Perda/avaria, Venda presencial"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
