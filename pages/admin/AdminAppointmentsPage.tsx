import React, { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { useAuth } from '../context/AuthContext';

type Appointment = { id: string; service_name: string; professional_name: string; customer_name: string; customer_email: string; customer_phone: string; start_at: string; end_at: string; amount_cents: number; status: string; payment_status: string; payment_reference: string };
const api = 'https://oyghjlwujdmgfkopujip.supabase.co/functions/v1/appointments';
export const AdminAppointmentsPage: React.FC = () => {
  const { session } = useAuth();
  const [rows, setRows] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const call = useCallback(async (action: string, extra = {}) => {
    const response = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, token: session?.token, ...extra }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha ao carregar agendamentos.');
    return data;
  }, [session?.token]);
  const refresh = useCallback(async () => {
    if (!session?.token) return;
    setLoading(true);
    try { setRows((await call('admin_list')).appointments || []); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar.'); }
    finally { setLoading(false); }
  }, [call, session?.token]);
  useEffect(() => { void refresh(); }, [refresh]);
  const change = async (id: string, status: string) => {
    if (!window.confirm(status === 'cancelled' ? 'Cancelar este agendamento? Um pagamento já realizado não será estornado automaticamente.' : 'Marcar atendimento como concluído?')) return;
    try { await call('admin_update', { id, status }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao atualizar.'); }
  };
  return <AdminLayout title="Agendamentos"><div className="space-y-5 text-zinc-100">
    <div className="flex justify-between items-center gap-4"><div><h1 className="text-2xl font-bold">Agenda</h1><p className="text-sm text-zinc-400">Reservas e pagamentos Pix dos serviços.</p></div><button onClick={refresh} disabled={loading} className="px-4 py-2 bg-amber-400 text-black rounded-lg font-bold">Atualizar</button></div>
    {error && <p role="alert" className="text-red-400">{error}</p>}
    <div className="grid gap-3">{rows.map(row => <article key={row.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
      <div className="flex flex-wrap justify-between gap-2"><strong>{new Date(row.start_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })} · {row.service_name}</strong><span className={row.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>{row.status} · {row.payment_status}</span></div>
      <p className="text-sm text-zinc-300">{row.professional_name} · R$ {(row.amount_cents / 100).toFixed(2).replace('.', ',')}</p>
      <p className="text-sm text-zinc-300">{row.customer_name} · {row.customer_phone} · {row.customer_email}</p>
      <p className="text-xs text-zinc-500">Código: {row.payment_reference}</p>
      {row.status === 'confirmed' && <div className="flex gap-2"><button onClick={() => change(row.id, 'completed')} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm">Concluir</button><button onClick={() => change(row.id, 'cancelled')} className="rounded-lg bg-zinc-700 px-3 py-2 text-sm">Cancelar</button></div>}
    </article>)}{!loading && !rows.length && <p className="text-zinc-400">Nenhum agendamento registrado.</p>}</div>
  </div></AdminLayout>;
};
