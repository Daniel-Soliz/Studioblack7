import React, { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

type Appointment = { id: string; service_name: string; professional_name: string; customer_name: string; customer_email: string; customer_phone: string; start_at: string; end_at: string; amount_cents: number; status: string; payment_status: string; payment_reference: string };
type Window = { start: string; end: string };
type Closure = { date: string; professionalId: string; start?: string; end?: string };
type Settings = { weekly: Record<string, Window[]>; closures: Closure[] };
const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const api = 'https://oyghjlwujdmgfkopujip.supabase.co/functions/v1/appointments';
export const AdminAppointmentsPage: React.FC = () => {
  const { session } = useAuth();
  const [rows, setRows] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [notice, setNotice] = useState('');
  const [blockDate, setBlockDate] = useState('');
  const [blockProfessional, setBlockProfessional] = useState('all');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const call = useCallback(async (action: string, extra = {}) => {
    const response = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, token: session?.token, ...extra }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha ao carregar agendamentos.');
    return data;
  }, [session?.token]);
  const refresh = useCallback(async () => {
    if (!session?.token) return;
    setLoading(true);
    try {
      const [agenda, configuration] = await Promise.all([call('admin_list'), call('admin_settings')]);
      setRows(agenda.appointments || []); setSettings(configuration.settings); setError('');
    }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar.'); }
    finally { setLoading(false); }
  }, [call, session?.token]);
  useEffect(() => { void refresh(); }, [refresh]);
  const change = async (id: string, status: string) => {
    if (!window.confirm(status === 'cancelled' ? 'Cancelar este agendamento? Um pagamento já realizado não será estornado automaticamente.' : 'Marcar atendimento como concluído?')) return;
    try { await call('admin_update', { id, status }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Falha ao atualizar.'); }
  };
  const editWindow = (day: number, index: number, field: keyof Window, value: string) => setSettings(prev => {
    if (!prev) return prev;
    const weekly = { ...prev.weekly, [day]: [...prev.weekly[day]] };
    weekly[day][index] = { ...weekly[day][index], [field]: value };
    return { ...prev, weekly };
  });
  const setDay = (day: number, windows: Window[]) => setSettings(prev => prev ? { ...prev, weekly: { ...prev.weekly, [day]: windows } } : prev);
  const saveSettings = async () => {
    if (!settings) return;
    setLoading(true); setError(''); setNotice('');
    try {
      const response = await call('admin_save_settings', { settings });
      setSettings(response.settings); setNotice('Disponibilidade salva. Novos agendamentos já seguem estes horários.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao salvar horários.'); }
    finally { setLoading(false); }
  };
  const addBlock = () => {
    if (!settings || !blockDate || Boolean(blockStart) !== Boolean(blockEnd)) { setError('Escolha uma data e preencha os dois horários para bloqueio parcial.'); return; }
    setSettings({ ...settings, closures: [...settings.closures, { date: blockDate, professionalId: blockProfessional, ...(blockStart && blockEnd ? { start: blockStart, end: blockEnd } : {}) }] });
    setBlockDate(''); setBlockStart(''); setBlockEnd(''); setError('');
  };
  return <AdminLayout title="Agendamentos"><div className="space-y-5 text-zinc-100">
    <div className="flex justify-between items-center gap-4"><div><h1 className="text-2xl font-bold">Agenda</h1><p className="text-sm text-zinc-400">Reservas e pagamentos Pix dos serviços.</p></div><button onClick={refresh} disabled={loading} className="px-4 py-2 bg-amber-400 text-black rounded-lg font-bold">Atualizar</button></div>
    {error && <p role="alert" className="text-red-400">{error}</p>}
    {notice && <p role="status" className="text-emerald-400">{notice}</p>}
    {settings && <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6 space-y-5">
      <div><h2 className="text-xl font-bold text-amber-400">Disponibilidade para novos agendamentos</h2><p className="text-sm text-zinc-400">Defina os períodos de cada dia. Sem períodos, o dia fica fechado. Agendamentos já confirmados continuam na lista abaixo.</p></div>
      <div className="grid gap-3">{dayNames.map((name, day) => <div key={name} className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="lg:w-28 font-semibold text-sm">{name}</div>
        <div className="flex-1 flex flex-wrap items-center gap-2">{settings.weekly[day]?.map((window, index) => <div key={index} className="flex items-center gap-1">
          <input aria-label={`${name}, início ${index + 1}`} type="time" value={window.start} onChange={e => editWindow(day, index, 'start', e.target.value)} className="w-[105px] rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm" />
          <span className="text-zinc-400">até</span>
          <input aria-label={`${name}, fim ${index + 1}`} type="time" value={window.end} onChange={e => editWindow(day, index, 'end', e.target.value)} className="w-[105px] rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm" />
          <button type="button" aria-label={`Remover intervalo ${index + 1} de ${name}`} onClick={() => setDay(day, settings.weekly[day].filter((_, i) => i !== index))} className="text-red-400 p-2">×</button>
        </div>)}{!settings.weekly[day]?.length && <span className="text-zinc-500 text-sm">Fechado</span>}</div>
        <button type="button" disabled={(settings.weekly[day]?.length || 0) >= 3} onClick={() => setDay(day, [...(settings.weekly[day] || []), { start: '09:00', end: '12:00' }])} className="text-amber-400 border border-amber-500/40 rounded-lg px-3 py-2 text-sm disabled:opacity-40">+ Período</button>
      </div>)}</div>
      <div className="border-t border-zinc-800 pt-5 space-y-3"><h3 className="font-bold">Bloquear data ou parte do dia</h3>
        <div className="flex flex-wrap items-end gap-2"><label className="grid gap-1 text-xs">Data<input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-950 p-2" /></label>
        <label className="grid gap-1 text-xs">Profissional<select value={blockProfessional} onChange={e => setBlockProfessional(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-950 p-2"><option value="all">Todos</option><option value="ray-black7">Ray Black7</option><option value="barbeiro-executor">Barbeiro Executor</option></select></label>
        <label className="grid gap-1 text-xs">Das (opcional)<input type="time" value={blockStart} onChange={e => setBlockStart(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-950 p-2" /></label>
        <label className="grid gap-1 text-xs">Até (opcional)<input type="time" value={blockEnd} onChange={e => setBlockEnd(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-950 p-2" /></label>
        <button type="button" onClick={addBlock} className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-bold">Adicionar bloqueio</button></div>
        <p className="text-xs text-zinc-500">Deixe “Das” e “Até” vazios para bloquear o dia inteiro.</p>
        <div className="flex flex-wrap gap-2">{settings.closures.map((block, index) => <span key={`${block.date}-${index}`} className="rounded-lg bg-zinc-800 px-3 py-2 text-xs">{block.date} · {block.professionalId === 'all' ? 'Todos' : block.professionalId === 'ray-black7' ? 'Ray' : 'Executor'} · {block.start ? `${block.start}–${block.end}` : 'dia inteiro'} <button type="button" aria-label={`Remover bloqueio de ${block.date}`} onClick={() => setSettings({ ...settings, closures: settings.closures.filter((_, i) => i !== index) })} className="ml-2 text-red-400">×</button></span>)}</div>
      </div>
      <button type="button" disabled={loading} onClick={saveSettings} className="rounded-xl bg-amber-400 px-6 py-3 font-black text-black disabled:opacity-50">Salvar disponibilidade</button>
    </section>}
    <h2 className="text-xl font-bold">Reservas dos clientes</h2>
    <div className="grid gap-3">{rows.map(row => <article key={row.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
      <div className="flex flex-wrap justify-between gap-2"><strong>{new Date(row.start_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })} · {row.service_name}</strong><span className={row.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>{row.status} · {row.payment_status}</span></div>
      <p className="text-sm text-zinc-300">{row.professional_name} · R$ {(row.amount_cents / 100).toFixed(2).replace('.', ',')}</p>
      <p className="text-sm text-zinc-300">{row.customer_name} · {row.customer_phone} · {row.customer_email}</p>
      <p className="text-xs text-zinc-500">Código: {row.payment_reference}</p>
      {row.status === 'confirmed' && <div className="flex gap-2"><button onClick={() => change(row.id, 'completed')} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm">Concluir</button><button onClick={() => change(row.id, 'cancelled')} className="rounded-lg bg-zinc-700 px-3 py-2 text-sm">Cancelar</button></div>}
    </article>)}{!loading && !rows.length && <p className="text-zinc-400">Nenhum agendamento registrado.</p>}</div>
  </div></AdminLayout>;
};
