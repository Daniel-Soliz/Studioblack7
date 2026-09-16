import React, { useState } from 'react';
import { Plus, Edit, Trash2, Check, Tags } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { ProductCategoryItem } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, saveCategories, products } = useStore();
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<ProductCategoryItem | null>(null);
  const [feedback, setFeedback] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: ProductCategoryItem = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      slug: newCatName.trim().toLowerCase().replace(/\s+/g, '-'),
      status: 'active'
    };

    saveCategories([...categories, newCat]);
    setNewCatName('');
    setFeedback(`Categoria "${newCat.name}" criada com sucesso.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCat.name.trim()) return;

    saveCategories(categories.map(c => c.id === editingCat.id ? editingCat : c));
    setFeedback(`Categoria "${editingCat.name}" atualizada com sucesso.`);
    setEditingCat(null);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleToggleStatus = (cat: ProductCategoryItem) => {
    const updated = categories.map(c =>
      c.id === cat.id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } as ProductCategoryItem : c
    );
    saveCategories(updated);
    setFeedback(`Status da categoria "${cat.name}" alterado.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleDelete = (catId: string, catName: string) => {
    saveCategories(categories.filter(c => c.id !== catId));
    setFeedback(`Categoria "${catName}" excluída.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <AdminLayout title="Categorias de Produtos">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-base font-bold text-white">Categorias da Loja ({categories.length})</h2>
          <p className="text-xs text-zinc-400">Organize os cosméticos e filtros de navegação do catálogo.</p>
        </div>

        {feedback && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex gap-3 shadow-xl">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nome da nova categoria (ex: Cuidados Faciais, Pós-Barba)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 hover:brightness-105 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Categoria</span>
          </button>
        </form>

        {/* Categories List Table */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-black/60 text-zinc-400 uppercase tracking-wider font-bold border-b border-zinc-800 text-[10px]">
              <tr>
                <th className="py-3 px-4">Nome da Categoria</th>
                <th className="py-3 px-4 text-center">Produtos Vinculados</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {categories.map(cat => {
                const count = products.filter(p => p.category === cat.name).length;

                return (
                  <tr key={cat.id} className="hover:bg-zinc-850/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {cat.name}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                      {count} {count === 1 ? 'produto' : 'produtos'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(cat)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cat.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {cat.status === 'active' ? 'Ativa' : 'Inativa'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingCat(cat)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                        title="Editar nome"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500 hover:text-white text-red-400"
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

        {/* Modal Edit Category */}
        {editingCat && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleUpdateCategory} className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="font-['Cinzel'] font-bold text-base text-white">
                Editar Categoria
              </h3>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  value={editingCat.name}
                  onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-zinc-750 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
